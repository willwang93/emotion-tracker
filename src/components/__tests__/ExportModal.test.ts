import {
  formatMonthChipLabel,
  getMonthExportFilename,
  getMonthExportTitle,
} from '../ExportModal';

jest.mock('react-native', () => ({
  Modal: 'Modal',
  View: 'View',
  StyleSheet: { create: (s: unknown) => s },
  ActivityIndicator: 'ActivityIndicator',
  TouchableOpacity: 'TouchableOpacity',
  Text: 'Text',
  ScrollView: 'ScrollView',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Platform: { OS: 'android' },
  Share: { share: jest.fn() },
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));
jest.mock('expo-file-system', () => ({
  File: jest.fn(),
  Paths: { cache: '/tmp' },
}));
jest.mock('expo-sharing', () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../../services/db', () => ({
  getAvailableMonths: jest.fn(),
  getCheckInsForMonth: jest.fn(),
}));

describe('ExportModal — Month Helpers', () => {
  it('formats month chip label with month name, year, and entry count', () => {
    expect(formatMonthChipLabel({ year: 2026, monthIndex: 10, count: 14 })).toBe(
      'November 2026 (14)'
    );
    expect(formatMonthChipLabel({ year: 2026, monthIndex: 0, count: 1 })).toBe(
      'January 2026 (1)'
    );
  });

  it('generates markdown filename for a given year and month index', () => {
    expect(getMonthExportFilename(2026, 8)).toBe('September-2026-Emotion-Entries.md');
    expect(getMonthExportFilename(2026, 10)).toBe('November-2026-Emotion-Entries.md');
  });

  it('generates markdown document title for a given year and month index', () => {
    expect(getMonthExportTitle(2026, 8)).toBe('Emotion Entries — September 2026');
    expect(getMonthExportTitle(2026, 10)).toBe('Emotion Entries — November 2026');
  });
});
