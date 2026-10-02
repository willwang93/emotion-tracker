import * as SQLite from 'expo-sqlite';
import {
  getDatabase,
  withDb,
  insertCheckIn,
  updateCheckIn,
  getCheckInsForDay,
  getCheckInsForDateRange,
  getAllCheckIns,
  getCheckInsForMonth,
  deleteCheckIn,
} from '../db';
import { CheckIn } from '../../types';

// Create mock database instance
const mockRunAsync = jest.fn();
const mockExecAsync = jest.fn();
const mockGetAllAsync = jest.fn();

const mockDb = {
  execAsync: mockExecAsync,
  runAsync: mockRunAsync,
  getAllAsync: mockGetAllAsync,
} as unknown as SQLite.SQLiteDatabase;

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockImplementation(() => Promise.resolve(mockDb)),
}));

describe('Database Service — Characterization Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.__app_sqlite_db = undefined;
    globalThis.__app_sqlite_init_promise = undefined;
    globalThis.__app_sqlite_is_initialized = undefined;
  });

  describe('Database Initialization', () => {
    it('initializes WAL mode and creates check_ins table on first open', async () => {
      const db = await getDatabase();
      expect(db).toBe(mockDb);
      expect(mockExecAsync).toHaveBeenCalledTimes(1);
      const initSql = mockExecAsync.mock.calls[0][0];
      expect(initSql).toContain('PRAGMA journal_mode = WAL;');
      expect(initSql).toContain('CREATE TABLE IF NOT EXISTS check_ins');
    });

    it('reuses existing database instance without re-executing init SQL', async () => {
      await getDatabase();
      expect(mockExecAsync).toHaveBeenCalledTimes(1);

      await getDatabase();
      // Should not re-initialize on subsequent calls
      expect(mockExecAsync).toHaveBeenCalledTimes(1);
    });
  });

  describe('insertCheckIn', () => {
    it('serializes CheckIn properties and inserts them into SQLite', async () => {
      mockRunAsync.mockResolvedValueOnce({ changes: 1 });

      const checkIn: CheckIn = {
        id: 'test-123',
        timestamp: 1756700000000,
        quadrant: 'yellow',
        energyLevel: 8,
        pleasantnessLevel: 9,
        primaryEmotion: 'Ecstatic',
        intensity: 9,
        somaticSensations: ['Heart racing', 'Bouncing energy'],
        contextWho: ['Team'],
        contextWhat: ['Shipped feature'],
        contextWhere: 'Office',
        triggerNote: 'Big milestone reached',
        urgeNote: 'Celebrate together',
        createdAt: 1756700000000,
      };

      await insertCheckIn(checkIn);

      expect(mockRunAsync).toHaveBeenCalledTimes(1);
      const [sql, params] = mockRunAsync.mock.calls[0];
      expect(sql).toContain('INSERT INTO check_ins');
      expect(params[0]).toBe('test-123'); // id
      expect(params[1]).toBe(1756700000000); // timestamp
      expect(params[2]).toBe('yellow'); // quadrant
      expect(params[3]).toBe(8); // energy
      expect(params[4]).toBe(9); // pleasantness
      expect(params[5]).toBe('Ecstatic'); // primary_emotion
      expect(params[6]).toBe(9); // intensity
      expect(params[7]).toBe(JSON.stringify(['Heart racing', 'Bouncing energy']));
      expect(params[8]).toBe(JSON.stringify(['Team']));
      expect(params[9]).toBe(JSON.stringify(['Shipped feature']));
      expect(params[10]).toBe('Office');
      expect(params[11]).toBe('Big milestone reached');
      expect(params[12]).toBe('Celebrate together');
      expect(params[13]).toBe(1756700000000); // created_at
    });

    it('applies default fallback values when optional fields are null or omitted', async () => {
      mockRunAsync.mockResolvedValueOnce({ changes: 1 });

      const minimalCheckIn = {
        id: 'min-1',
        timestamp: 1756700000000,
        quadrant: 'green' as const,
        energyLevel: 4,
        pleasantnessLevel: 6,
        primaryEmotion: 'Calm',
        intensity: 5,
        somaticSensations: [],
        contextWho: [],
        contextWhat: [],
        createdAt: 1756700000000,
      };

      await insertCheckIn(minimalCheckIn);

      const [, params] = mockRunAsync.mock.calls[0];
      expect(params[10]).toBeNull(); // contextWhere
      expect(params[11]).toBeNull(); // triggerNote
      expect(params[12]).toBeNull(); // urgeNote
      expect(params[7]).toBe('[]'); // somaticSensations serialized
    });
  });

  describe('updateCheckIn', () => {
    it('executes UPDATE statement with mapped parameters', async () => {
      mockRunAsync.mockResolvedValueOnce({ changes: 1 });

      const updatedCheckIn: CheckIn = {
        id: 'test-123',
        timestamp: 1756700000000,
        quadrant: 'blue',
        energyLevel: 3,
        pleasantnessLevel: 4,
        primaryEmotion: 'Tired',
        intensity: 4,
        somaticSensations: ['Heavy eyes'],
        contextWho: ['Alone'],
        contextWhat: ['Resting'],
        contextWhere: 'Bed',
        triggerNote: 'Long day',
        urgeNote: 'Sleep early',
        createdAt: 1756700000000,
      };

      await updateCheckIn(updatedCheckIn);

      expect(mockRunAsync).toHaveBeenCalledTimes(1);
      const [sql, params] = mockRunAsync.mock.calls[0];
      expect(sql).toContain('UPDATE check_ins SET');
      expect(sql).toContain('WHERE id = ?');
      expect(params[params.length - 1]).toBe('test-123'); // WHERE id is last
    });
  });

  describe('Row Deserialization & Queries', () => {
    it('correctly maps raw SQL rows to CheckIn domain objects', async () => {
      const rawRow = {
        id: 'row-1',
        timestamp: 1756700000000,
        quadrant: 'green',
        energy_level: 5,
        pleasantness_level: 7,
        primary_emotion: 'Peaceful',
        intensity: 6,
        somatic_sensations: '["Deep breath"]',
        context_who: '["Family"]',
        context_what: '["Dinner"]',
        context_where: 'Home',
        trigger_note: 'Nice meal',
        urge_note: 'Relax',
        created_at: 1756700000000,
      };

      mockGetAllAsync.mockResolvedValueOnce([rawRow]);

      const results = await getAllCheckIns();
      expect(results).toHaveLength(1);
      const item = results[0];

      expect(item.id).toBe('row-1');
      expect(item.energyLevel).toBe(5);
      expect(item.pleasantnessLevel).toBe(7);
      expect(item.primaryEmotion).toBe('Peaceful');
      expect(item.intensity).toBe(6);
      expect(item.somaticSensations).toEqual(['Deep breath']);
      expect(item.contextWho).toEqual(['Family']);
      expect(item.contextWhat).toEqual(['Dinner']);
      expect(item.contextWhere).toBe('Home');
      expect(item.triggerNote).toBe('Nice meal');
      expect(item.urgeNote).toBe('Relax');
    });

    it('safely recovers from corrupted or invalid JSON in array fields without throwing', async () => {
      const corruptRow = {
        id: 'corrupt-row',
        timestamp: 1756700000000,
        quadrant: 'red',
        energy_level: 8,
        pleasantness_level: 2,
        primary_emotion: 'Frustrated',
        intensity: 8,
        somatic_sensations: '{bad-json-syntax',
        context_who: '{"notAnArray": true}',
        context_what: null,
        created_at: 1756700000000,
      };

      mockGetAllAsync.mockResolvedValueOnce([corruptRow]);

      const results = await getAllCheckIns();
      expect(results).toHaveLength(1);
      const item = results[0];

      // Verifies crash-prevention: falls back to safe empty array []
      expect(item.somaticSensations).toEqual([]);
      expect(item.contextWho).toEqual([]);
      expect(item.contextWhat).toEqual([]);
      expect(item.primaryEmotion).toBe('Frustrated');
    });

    it('getCheckInsForDay computes day boundaries correctly using calendar end-of-day', async () => {
      mockGetAllAsync.mockResolvedValueOnce([]);

      const testDate = new Date(2026, 8, 15); // Sep 15, 2026
      await getCheckInsForDay(testDate);

      expect(mockGetAllAsync).toHaveBeenCalledTimes(1);
      const [sql, params] = mockGetAllAsync.mock.calls[0];
      expect(sql).toContain('WHERE timestamp >= ? AND timestamp <= ? ORDER BY timestamp DESC');
      const startOfDay = new Date(2026, 8, 15, 0, 0, 0, 0).getTime();
      const endOfDay = new Date(2026, 8, 15, 23, 59, 59, 999).getTime();
      expect(params[0]).toBe(startOfDay);
      expect(params[1]).toBe(endOfDay);
    });

    it('getCheckInsForMonth computes month date range correctly', async () => {
      mockGetAllAsync.mockResolvedValueOnce([]);

      // September 2026 (month index 8)
      await getCheckInsForMonth(2026, 8);

      expect(mockGetAllAsync).toHaveBeenCalledTimes(1);
      const [, params] = mockGetAllAsync.mock.calls[0];
      const expectedStart = new Date(2026, 8, 1).getTime();
      const expectedEnd = new Date(2026, 9, 0, 23, 59, 59, 999).getTime();
      expect(params[0]).toBe(expectedStart);
      expect(params[1]).toBe(expectedEnd);
    });

    it('deleteCheckIn executes DELETE statement with targeted id', async () => {
      mockRunAsync.mockResolvedValueOnce({ changes: 1 });

      await deleteCheckIn('to-delete-999');

      expect(mockRunAsync).toHaveBeenCalledTimes(1);
      const [sql, params] = mockRunAsync.mock.calls[0];
      expect(sql).toContain('DELETE FROM check_ins WHERE id = ?');
      expect(params).toEqual(['to-delete-999']);
    });
  });
});
