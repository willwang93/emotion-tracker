import * as SQLite from 'expo-sqlite';
import { CheckIn, QuadrantType } from '../types';

const DB_NAME = 'emotion_tracker.db';

// Domain default constants
const DEFAULT_QUADRANT: QuadrantType = 'green';
const DEFAULT_ENERGY = 5;
const DEFAULT_PLEASANTNESS = 5;
const DEFAULT_PRIMARY_EMOTION = 'Peaceful';
const DEFAULT_INTENSITY = 5;

/**
 * Raw SQLite database row format for check_ins table.
 */
export interface RawCheckInRow {
  id: string;
  timestamp: number;
  quadrant: string;
  energy_level: number;
  pleasantness_level: number;
  primary_emotion: string;
  intensity: number;
  somatic_sensations: string | null;
  context_who: string | null;
  context_what: string | null;
  context_where: string | null;
  trigger_note: string | null;
  urge_note: string | null;
  created_at: number;
}

interface SerializedCheckInFields {
  timestamp: number;
  quadrant: string;
  energyLevel: number;
  pleasantnessLevel: number;
  primaryEmotion: string;
  intensity: number;
  somaticSensations: string;
  contextWho: string;
  contextWhat: string;
  contextWhere: string | null;
  triggerNote: string | null;
  urgeNote: string | null;
}

/**
 * Extracts and normalizes CheckIn domain fields into SQLite-compatible serialized values.
 */
function serializeCheckInFields(checkIn: CheckIn): SerializedCheckInFields {
  return {
    timestamp: Number(checkIn.timestamp || Date.now()),
    quadrant: String(checkIn.quadrant || DEFAULT_QUADRANT),
    energyLevel: Number(checkIn.energyLevel ?? DEFAULT_ENERGY),
    pleasantnessLevel: Number(checkIn.pleasantnessLevel ?? DEFAULT_PLEASANTNESS),
    primaryEmotion: String(checkIn.primaryEmotion || DEFAULT_PRIMARY_EMOTION),
    intensity: Number(checkIn.intensity ?? DEFAULT_INTENSITY),
    somaticSensations: JSON.stringify(checkIn.somaticSensations || []),
    contextWho: JSON.stringify(checkIn.contextWho || []),
    contextWhat: JSON.stringify(checkIn.contextWhat || []),
    contextWhere: checkIn.contextWhere ? String(checkIn.contextWhere) : null,
    triggerNote: checkIn.triggerNote ? String(checkIn.triggerNote) : null,
    urgeNote: checkIn.urgeNote ? String(checkIn.urgeNote) : null,
  };
}

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

/**
 * Safely parses a JSON string into a string array.
 * Falls back to an empty array on null, invalid JSON, or non-array contents to prevent crashes.
 */
function safeParseJsonArray(value: any): string[] {
  if (!value || typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Convert raw SQLite row to CheckIn domain object
function mapRowToCheckIn(row: RawCheckInRow): CheckIn {
  return {
    id: String(row.id),
    timestamp: Number(row.timestamp),
    quadrant: row.quadrant as QuadrantType,
    energyLevel: Number(row.energy_level),
    pleasantnessLevel: Number(row.pleasantness_level),
    primaryEmotion: String(row.primary_emotion),
    intensity: Number(row.intensity),
    somaticSensations: safeParseJsonArray(row.somatic_sensations),
    contextWho: safeParseJsonArray(row.context_who),
    contextWhat: safeParseJsonArray(row.context_what),
    contextWhere: row.context_where ? String(row.context_where) : undefined,
    triggerNote: row.trigger_note ? String(row.trigger_note) : undefined,
    urgeNote: row.urge_note ? String(row.urge_note) : undefined,
    createdAt: Number(row.created_at),
  };
}

export async function insertCheckIn(checkIn: CheckIn): Promise<void> {
  const fields = serializeCheckInFields(checkIn);
  const id = String(checkIn.id || Date.now().toString());
  const createdAt = Number(checkIn.createdAt || Date.now());

  return withDb(async (db) => {
    await db.runAsync(
      `INSERT INTO check_ins (
        id, timestamp, quadrant, energy_level, pleasantness_level,
        primary_emotion, intensity, somatic_sensations, context_who,
        context_what, context_where, trigger_note, urge_note, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      [
        id,
        fields.timestamp,
        fields.quadrant,
        fields.energyLevel,
        fields.pleasantnessLevel,
        fields.primaryEmotion,
        fields.intensity,
        fields.somaticSensations,
        fields.contextWho,
        fields.contextWhat,
        fields.contextWhere,
        fields.triggerNote,
        fields.urgeNote,
        createdAt,
      ]
    );
  });
}

export async function updateCheckIn(checkIn: CheckIn): Promise<void> {
  const fields = serializeCheckInFields(checkIn);

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
        fields.timestamp,
        fields.quadrant,
        fields.energyLevel,
        fields.pleasantnessLevel,
        fields.primaryEmotion,
        fields.intensity,
        fields.somaticSensations,
        fields.contextWho,
        fields.contextWhat,
        fields.contextWhere,
        fields.triggerNote,
        fields.urgeNote,
        String(checkIn.id),
      ]
    );
  });
}

export async function getCheckInsForDay(date: Date): Promise<CheckIn[]> {
  return withDb(async (db) => {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0).getTime();
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).getTime();

    const rows = await db.getAllAsync<RawCheckInRow>(
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

    const rows = await db.getAllAsync<RawCheckInRow>(
      `SELECT * FROM check_ins WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp ASC;`,
      [start, end]
    );
    return rows.map(mapRowToCheckIn);
  });
}

export async function getAllCheckIns(): Promise<CheckIn[]> {
  return withDb(async (db) => {
    const rows = await db.getAllAsync<RawCheckInRow>(
      `SELECT * FROM check_ins ORDER BY timestamp ASC;`
    );
    return rows.map(mapRowToCheckIn);
  });
}

export async function getCheckInsForMonth(year: number, monthIndex: number): Promise<CheckIn[]> {
  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999);
  return getCheckInsForDateRange(startDate, endDate);
}

export async function deleteCheckIn(id: string): Promise<void> {
  return withDb(async (db) => {
    await db.runAsync(`DELETE FROM check_ins WHERE id = ?;`, [id]);
  });
}

