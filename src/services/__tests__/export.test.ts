import { formatCheckInsToMarkdown } from '../export';
import { CheckIn } from '../../types';

// Mock native modules that export.ts imports
jest.mock('expo-file-system', () => ({
  File: jest.fn(),
  Paths: { cache: '/tmp' },
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('react-native', () => ({
  Share: {
    share: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('Export Service — Characterization Tests', () => {
  it('returns empty message when checkIns list is empty', () => {
    const result = formatCheckInsToMarkdown([], 'Custom Header');
    expect(result).toBe('# Custom Header\n\n*No entries recorded for this period.*\n');
  });

  it('formats single check-in correctly with all fields', () => {
    const testDate = new Date(2026, 8, 1, 10, 30, 0);
    const entry: CheckIn = {
      id: 'entry-1',
      timestamp: testDate.getTime(),
      quadrant: 'yellow',
      energyLevel: 8,
      pleasantnessLevel: 9,
      primaryEmotion: 'Joyful',
      intensity: 7,
      somaticSensations: ['Warm chest', 'Light shoulders'],
      contextWho: ['Friends'],
      contextWhat: ['Celebration'],
      contextWhere: 'Park',
      triggerNote: 'Sunny weather and good news',
      urgeNote: 'Smile and share',
      createdAt: testDate.getTime(),
    };

    const output = formatCheckInsToMarkdown([entry], 'My Emotion Log');

    expect(output).toContain('# My Emotion Log');
    expect(output).toContain('*Total entries: 1*');
    expect(output).toContain('Joyful');
    expect(output).toContain('- **Quadrant:** Yellow (High Energy, Pleasant)');
    expect(output).toContain('- **Intensity:** 7/10 | **Energy:** 8/10 | **Pleasantness:** 9/10');
    expect(output).toContain('- **Physical Sensations:** Warm chest, Light shoulders');
    expect(output).toContain('- **Context:** Who: Friends | What: Celebration | Where: Park');
    expect(output).toContain('- **Trigger:** Sunny weather and good news');
    expect(output).toContain('- **Urge / Behavior:** Smile and share');
  });

  it('handles entries with minimal optional fields without crashing', () => {
    const testDate = new Date(2026, 8, 1, 14, 0, 0);
    const minimalEntry: CheckIn = {
      id: 'entry-2',
      timestamp: testDate.getTime(),
      quadrant: 'green',
      energyLevel: 3,
      pleasantnessLevel: 7,
      primaryEmotion: 'Calm',
      intensity: 4,
      somaticSensations: [],
      contextWho: [],
      contextWhat: [],
      createdAt: testDate.getTime(),
    };

    const output = formatCheckInsToMarkdown([minimalEntry]);

    expect(output).toContain('# Emotion Entries');
    expect(output).toContain('Calm');
    expect(output).toContain('- **Quadrant:** Green (Low Energy, Pleasant)');
    expect(output).not.toContain('Physical Sensations');
    expect(output).not.toContain('Context');
    expect(output).not.toContain('Trigger');
    expect(output).not.toContain('Urge');
  });

  it('sorts multiple entries ascending by timestamp regardless of input order', () => {
    const d1 = new Date(2026, 8, 1, 9, 0, 0).getTime();
    const d2 = new Date(2026, 8, 1, 15, 0, 0).getTime();

    const entryEarlier: CheckIn = {
      id: 'e1',
      timestamp: d1,
      quadrant: 'blue',
      energyLevel: 2,
      pleasantnessLevel: 2,
      primaryEmotion: 'Sad',
      intensity: 3,
      somaticSensations: [],
      contextWho: [],
      contextWhat: [],
      createdAt: d1,
    };

    const entryLater: CheckIn = {
      id: 'e2',
      timestamp: d2,
      quadrant: 'red',
      energyLevel: 8,
      pleasantnessLevel: 1,
      primaryEmotion: 'Angry',
      intensity: 8,
      somaticSensations: [],
      contextWho: [],
      contextWhat: [],
      createdAt: d2,
    };

    const output = formatCheckInsToMarkdown([entryLater, entryEarlier]);
    const sadIndex = output.indexOf('Sad');
    const angryIndex = output.indexOf('Angry');

    expect(sadIndex).toBeLessThan(angryIndex);
  });
});
