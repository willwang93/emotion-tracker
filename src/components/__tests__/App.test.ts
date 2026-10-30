import { getWeekDates, getGreeting, computeWeekMoodMap } from '../../../App';
import { CheckIn } from '../../types';

jest.mock('react-native', () => ({
  StyleSheet: { create: (s: unknown) => s },
  View: 'View',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  ActivityIndicator: 'ActivityIndicator',
  RefreshControl: 'RefreshControl',
  StatusBar: 'StatusBar',
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: 'SafeAreaProvider',
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));
jest.mock('expo-font', () => ({
  useFonts: () => [true],
}));
jest.mock('../../services/db', () => ({
  getCheckInsForDay: jest.fn(),
  getCheckInsForDateRange: jest.fn(),
  insertCheckIn: jest.fn(),
  updateCheckIn: jest.fn(),
  deleteCheckIn: jest.fn(),
}));
jest.mock('../../components/TimelineCard', () => ({
  TimelineCard: 'TimelineCard',
}));
jest.mock('../../components/MicroCheckInModal', () => ({
  MicroCheckInModal: 'MicroCheckInModal',
}));
jest.mock('../../components/ExportModal', () => ({
  ExportModal: 'ExportModal',
}));

describe('App.tsx — Home Screen & Calendar Characterization Tests', () => {
  describe('getWeekDates (Monday-Sunday 7-day ribbon)', () => {
    it('computes Monday through Sunday when given a mid-week Wednesday', () => {
      // Oct 28, 2026 is a Wednesday
      const wed = new Date(2026, 9, 28, 15, 30);
      const week = getWeekDates(wed);

      expect(week).toHaveLength(7);
      expect(week[0].getDay()).toBe(1); // Monday Oct 26
      expect(week[0].getDate()).toBe(26);
      expect(week[6].getDay()).toBe(0); // Sunday Nov 1
      expect(week[6].getMonth()).toBe(10); // November
      expect(week[6].getDate()).toBe(1);
    });

    it('maps Sunday to the end of the current Monday-Sunday week rather than starting a new week', () => {
      // Nov 1, 2026 is a Sunday
      const sun = new Date(2026, 10, 1, 10, 0);
      const week = getWeekDates(sun);

      expect(week[0].getFullYear()).toBe(2026);
      expect(week[0].getMonth()).toBe(9); // October
      expect(week[0].getDate()).toBe(26); // Monday Oct 26
      expect(week[6].getDate()).toBe(1); // Sunday Nov 1
    });
  });

  describe('getGreeting', () => {
    it('returns morning greeting before 12:00 PM', () => {
      expect(getGreeting(new Date(2026, 9, 30, 0, 0))).toBe('Good morning, Will');
      expect(getGreeting(new Date(2026, 9, 30, 11, 59))).toBe('Good morning, Will');
    });

    it('returns afternoon greeting from 12:00 PM to 4:59 PM', () => {
      expect(getGreeting(new Date(2026, 9, 30, 12, 0))).toBe('Good afternoon, Will');
      expect(getGreeting(new Date(2026, 9, 30, 16, 59))).toBe('Good afternoon, Will');
    });

    it('returns evening greeting from 5:00 PM onwards', () => {
      expect(getGreeting(new Date(2026, 9, 30, 17, 0))).toBe('Good evening, Will');
      expect(getGreeting(new Date(2026, 9, 30, 23, 59))).toBe('Good evening, Will');
    });
  });

  describe('computeWeekMoodMap (dominant daily mood dot)', () => {
    const makeEntry = (id: string, ts: number, quadrant: CheckIn['quadrant']): CheckIn => ({
      id,
      timestamp: ts,
      quadrant,
      energyLevel: 5,
      pleasantnessLevel: 5,
      primaryEmotion: 'Test',
      intensity: 5,
      somaticSensations: [],
      contextWho: [],
      contextWhat: [],
      createdAt: ts,
    });

    it('picks the most frequent quadrant when a day has multiple entries', () => {
      const dayTs = new Date(2026, 9, 30, 10, 0).getTime();
      const dayKey = new Date(dayTs).toDateString();

      const entries: CheckIn[] = [
        makeEntry('1', dayTs + 3000, 'yellow'),
        makeEntry('2', dayTs + 2000, 'blue'),
        makeEntry('3', dayTs + 1000, 'blue'),
      ];

      const map = computeWeekMoodMap(entries);
      expect(map[dayKey]).toBe('blue');
    });

    it('breaks ties using the most recent entry of the day (first element in DESC query order)', () => {
      const morningTs = new Date(2026, 9, 30, 9, 0).getTime();
      const eveningTs = new Date(2026, 9, 30, 20, 0).getTime();
      const dayKey = new Date(morningTs).toDateString();

      // DB returns entries ordered by timestamp DESC (evening first, morning last)
      const entriesFromDbDesc: CheckIn[] = [
        makeEntry('evening', eveningTs, 'green'),
        makeEntry('morning', morningTs, 'red'),
      ];

      const map = computeWeekMoodMap(entriesFromDbDesc);
      // Tie-breaker picks entries[0], which is the most recent evening entry ('green')
      expect(map[dayKey]).toBe('green');
    });
  });
});
