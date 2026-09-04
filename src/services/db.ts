import * as SQLite from 'expo-sqlite';
import { CheckIn, ReminderSetting } from '../types';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!dbInstance) {
    dbInstance = await SQLite.openDatabaseAsync('emotion_tracker.db');
    await initDatabase(dbInstance);
  }
  return dbInstance;
}

export function getDatabaseSync(): SQLite.SQLiteDatabase {
  if (!dbInstance) {
    dbInstance = SQLite.openDatabaseSync('emotion_tracker.db');
    initDatabaseSync(dbInstance);
  }
  return dbInstance;
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
  const db = await getDatabase();
  await db.runAsync(
    `INSERT INTO check_ins (
      id, timestamp, quadrant, energy_level, pleasantness_level,
      primary_emotion, intensity, somatic_sensations, context_who,
      context_what, context_where, trigger_note, urge_note, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
    [
      checkIn.id,
      checkIn.timestamp,
      checkIn.quadrant,
      checkIn.energyLevel,
      checkIn.pleasantnessLevel,
      checkIn.primaryEmotion,
      checkIn.intensity,
      JSON.stringify(checkIn.somaticSensations || []),
      JSON.stringify(checkIn.contextWho || []),
      JSON.stringify(checkIn.contextWhat || []),
      checkIn.contextWhere || null,
      checkIn.triggerNote || null,
      checkIn.urgeNote || null,
      checkIn.createdAt,
    ]
  );
}

export async function getCheckInsForDay(date: Date): Promise<CheckIn[]> {
  const db = await getDatabase();
  const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

  const rows = await db.getAllAsync<any>(
    `SELECT * FROM check_ins WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC;`,
    [startOfDay, endOfDay]
  );
  return rows.map(mapRowToCheckIn);
}

export async function getAllCheckIns(): Promise<CheckIn[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM check_ins ORDER BY timestamp DESC;`
  );
  return rows.map(mapRowToCheckIn);
}

export async function deleteCheckIn(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM check_ins WHERE id = ?;`, [id]);
}

export async function getReminderSettings(): Promise<ReminderSetting> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<any>(`SELECT * FROM reminder_settings WHERE id = 1;`);
  if (!row) {
    return { id: 1, enabled: true, times: ['09:00', '13:00', '18:00', '21:30'] };
  }
  return {
    id: row.id,
    enabled: Boolean(row.enabled),
    times: JSON.parse(row.times || '[]'),
  };
}

export async function updateReminderSettings(settings: ReminderSetting): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE reminder_settings SET enabled = ?, times = ? WHERE id = 1;`,
    [settings.enabled ? 1 : 0, JSON.stringify(settings.times)]
  );
}
