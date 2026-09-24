import * as SQLite from 'expo-sqlite';
import { CheckIn } from '../types';

const DB_NAME = 'emotion_tracker.db';

declare global {
  var __app_sqlite_db: SQLite.SQLiteDatabase | undefined;
  var __app_sqlite_init_promise: Promise<SQLite.SQLiteDatabase> | undefined;
  var __app_sqlite_is_initialized: boolean | undefined;
}

export async function getDatabase(forceNew = false): Promise<SQLite.SQLiteDatabase> {
  if (globalThis.__app_sqlite_db && !forceNew) {
    return globalThis.__app_sqlite_db;
  }

  if (globalThis.__app_sqlite_init_promise && !forceNew) {
    return globalThis.__app_sqlite_init_promise;
  }

  globalThis.__app_sqlite_init_promise = (async () => {
    try {
      const options = forceNew ? { useNewConnection: true } : undefined;
      const db = await SQLite.openDatabaseAsync(DB_NAME, options);
      if (!globalThis.__app_sqlite_is_initialized || forceNew) {
        await initDatabase(db);
        globalThis.__app_sqlite_is_initialized = true;
      }
      globalThis.__app_sqlite_db = db;
      return db;
    } catch (err: any) {
      console.warn('Initial DB open or init failed, retrying with useNewConnection: true', err?.message || err);
      const db = await SQLite.openDatabaseAsync(DB_NAME, { useNewConnection: true });
      await initDatabase(db);
      globalThis.__app_sqlite_is_initialized = true;
      globalThis.__app_sqlite_db = db;
      return db;
    } finally {
      globalThis.__app_sqlite_init_promise = undefined;
    }
  })();

  return globalThis.__app_sqlite_init_promise;
}

export async function withDb<T>(operation: (db: SQLite.SQLiteDatabase) => Promise<T>): Promise<T> {
  try {
    const db = await getDatabase();
    return await operation(db);
  } catch (err: any) {
    console.warn('withDb caught error, retrying with fresh connection:', err?.message || err);
    globalThis.__app_sqlite_db = undefined;
    globalThis.__app_sqlite_is_initialized = false;
    const freshDb = await getDatabase(true);
    return await operation(freshDb);
  }
}

async function initDatabase(db: SQLite.SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS check_ins (
      id TEXT PRIMARY KEY,
      timestamp INTEGER NOT NULL,
      quadrant TEXT NOT NULL,
      energy_level INTEGER NOT NULL,
      pleasantness_level INTEGER NOT NULL,
      primary_emotion TEXT NOT NULL,
      intensity INTEGER NOT NULL,
      somatic_sensations TEXT,
      context_who TEXT,
      context_what TEXT,
      context_where TEXT,
      trigger_note TEXT,
      urge_note TEXT,
      created_at INTEGER NOT NULL
    );
  `);
}

// Convert raw row to CheckIn object
function mapRowToCheckIn(row: any): CheckIn {
  return {
    id: row.id,
    timestamp: row.timestamp,
    quadrant: row.quadrant,
    energyLevel: row.energy_level,
    pleasantnessLevel: row.pleasantness_level,
    primaryEmotion: row.primary_emotion,
    intensity: row.intensity,
    somaticSensations: row.somatic_sensations ? JSON.parse(row.somatic_sensations) : [],
    contextWho: row.context_who ? JSON.parse(row.context_who) : [],
    contextWhat: row.context_what ? JSON.parse(row.context_what) : [],
    contextWhere: row.context_where || undefined,
    triggerNote: row.trigger_note || undefined,
    urgeNote: row.urge_note || undefined,
    createdAt: row.created_at,
  };
}

export async function insertCheckIn(checkIn: CheckIn): Promise<void> {
  return withDb(async (db) => {
    await db.runAsync(
      `INSERT INTO check_ins (
        id, timestamp, quadrant, energy_level, pleasantness_level,
        primary_emotion, intensity, somatic_sensations, context_who,
        context_what, context_where, trigger_note, urge_note, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        String(checkIn.id || Date.now().toString()),
        Number(checkIn.timestamp || Date.now()),
        String(checkIn.quadrant || 'green'),
        Number(checkIn.energyLevel ?? 5),
        Number(checkIn.pleasantnessLevel ?? 5),
        String(checkIn.primaryEmotion || 'Peaceful'),
        Number(checkIn.intensity ?? 5),
        JSON.stringify(checkIn.somaticSensations || []),
        JSON.stringify(checkIn.contextWho || []),
        JSON.stringify(checkIn.contextWhat || []),
        checkIn.contextWhere ? String(checkIn.contextWhere) : null,
        checkIn.triggerNote ? String(checkIn.triggerNote) : null,
        checkIn.urgeNote ? String(checkIn.urgeNote) : null,
        Number(checkIn.createdAt || Date.now()),
      ]
    );
  });
}

export async function updateCheckIn(checkIn: CheckIn): Promise<void> {
  return withDb(async (db) => {
    await db.runAsync(
      `UPDATE check_ins SET
        timestamp = ?,
        quadrant = ?,
        energy_level = ?,
        pleasantness_level = ?,
        primary_emotion = ?,
        intensity = ?,
        somatic_sensations = ?,
        context_who = ?,
        context_what = ?,
        context_where = ?,
        trigger_note = ?,
        urge_note = ?
      WHERE id = ?;`,
      [
        Number(checkIn.timestamp || Date.now()),
        String(checkIn.quadrant || 'green'),
        Number(checkIn.energyLevel ?? 5),
        Number(checkIn.pleasantnessLevel ?? 5),
        String(checkIn.primaryEmotion || 'Peaceful'),
        Number(checkIn.intensity ?? 5),
        JSON.stringify(checkIn.somaticSensations || []),
        JSON.stringify(checkIn.contextWho || []),
        JSON.stringify(checkIn.contextWhat || []),
        checkIn.contextWhere ? String(checkIn.contextWhere) : null,
        checkIn.triggerNote ? String(checkIn.triggerNote) : null,
        checkIn.urgeNote ? String(checkIn.urgeNote) : null,
        String(checkIn.id),
      ]
    );
  });
}

export async function getCheckInsForDay(date: Date): Promise<CheckIn[]> {
  return withDb(async (db) => {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

    const rows = await db.getAllAsync<any>(
      `SELECT * FROM check_ins WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC;`,
      [startOfDay, endOfDay]
    );
    return rows.map(mapRowToCheckIn);
  });
}

export async function getCheckInsForDateRange(startDate: Date, endDate: Date): Promise<CheckIn[]> {
  return withDb(async (db) => {
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()).getTime();
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 23, 59, 59, 999).getTime();

    const rows = await db.getAllAsync<any>(
      `SELECT * FROM check_ins WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp ASC;`,
      [start, end]
    );
    return rows.map(mapRowToCheckIn);
  });
}

export async function deleteCheckIn(id: string): Promise<void> {
  return withDb(async (db) => {
    await db.runAsync(`DELETE FROM check_ins WHERE id = ?;`, [id]);
  });
}

