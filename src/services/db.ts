import * as SQLite from 'expo-sqlite';
import { CheckIn, ReminderSetting } from '../types';

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

export function getDatabaseSync(): SQLite.SQLiteDatabase {
  if (!globalThis.__app_sqlite_db) {
    const db = SQLite.openDatabaseSync(DB_NAME);
    initDatabaseSync(db);
    globalThis.__app_sqlite_db = db;
    globalThis.__app_sqlite_is_initialized = true;
  }
  return globalThis.__app_sqlite_db;
}

function initDatabaseSync(db: SQLite.SQLiteDatabase) {
  db.execSync(`
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

    CREATE TABLE IF NOT EXISTS reminder_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      enabled INTEGER NOT NULL DEFAULT 1,
      times TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO reminder_settings (id, enabled, times)
    VALUES (1, 1, '["09:00", "13:00", "18:00", "21:30"]');
  `);
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

    CREATE TABLE IF NOT EXISTS reminder_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      enabled INTEGER NOT NULL DEFAULT 1,
      times TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS app_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    INSERT OR IGNORE INTO reminder_settings (id, enabled, times)
    VALUES (1, 1, '["09:00", "13:00", "18:00", "21:30"]');
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

export async function getAllCheckIns(): Promise<CheckIn[]> {
  return withDb(async (db) => {
    const rows = await db.getAllAsync<any>(
      `SELECT * FROM check_ins ORDER BY timestamp DESC;`
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

export async function getReminderSettings(): Promise<ReminderSetting> {
  return withDb(async (db) => {
    const row = await db.getFirstAsync<any>(`SELECT * FROM reminder_settings WHERE id = 1;`);
    if (!row) {
      return { id: 1, enabled: true, times: ['09:00', '13:00', '18:00', '21:30'] };
    }
    let parsedTimes: string[] = [];
    try {
      parsedTimes = typeof row.times === 'string' ? JSON.parse(row.times || '[]') : row.times;
    } catch {
      parsedTimes = ['09:00', '13:00', '18:00', '21:30'];
    }
    return {
      id: row.id,
      enabled: Boolean(row.enabled),
      times: Array.isArray(parsedTimes) ? parsedTimes : ['09:00', '13:00', '18:00', '21:30'],
    };
  });
}

export async function updateReminderSettings(settings: ReminderSetting): Promise<void> {
  return withDb(async (db) => {
    await db.runAsync(
      `INSERT OR REPLACE INTO reminder_settings (id, enabled, times) VALUES (1, ?, ?);`,
      [settings.enabled ? 1 : 0, JSON.stringify(settings.times)]
    );
  });
}

export async function getThemeSetting(): Promise<'system' | 'light' | 'dark'> {
  return withDb(async (db) => {
    try {
      const row = await db.getFirstAsync<any>(
        `SELECT value FROM app_settings WHERE key = 'theme_mode';`
      );
      if (row && (row.value === 'light' || row.value === 'dark' || row.value === 'system')) {
        return row.value;
      }
    } catch (err) {
      console.warn('Error reading theme setting:', err);
    }
    return 'system';
  });
}

export async function setThemeSetting(mode: 'system' | 'light' | 'dark'): Promise<void> {
  return withDb(async (db) => {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO app_settings (key, value) VALUES ('theme_mode', ?);`,
        [mode]
      );
    } catch (err) {
      console.warn('Error saving theme setting:', err);
    }
  });
}

export async function exportAllDataAsJson(): Promise<{ jsonString: string; count: number }> {
  const checkIns = await getAllCheckIns();
  const settings = await getReminderSettings();
  const payload = {
    app: 'Yale Mood Meter Emotion Tracker',
    version: '1.0',
    exportedAt: new Date().toISOString(),
    totalEntries: checkIns.length,
    reminderSettings: settings,
    entries: checkIns,
  };
  return {
    jsonString: JSON.stringify(payload, null, 2),
    count: checkIns.length,
  };
}

