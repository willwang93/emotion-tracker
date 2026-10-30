import {
  formatCardTime,
  resolveCardNote,
  resolveQuadrantHeadshot,
} from '../TimelineCard';

jest.mock('react-native', () => ({
  View: 'View',
  StyleSheet: { create: (s: unknown) => s },
  TouchableOpacity: 'TouchableOpacity',
  Animated: {
    Value: jest.fn(() => ({
      interpolate: jest.fn(),
      setValue: jest.fn(),
    })),
    View: 'Animated.View',
    timing: jest.fn(),
    spring: jest.fn(),
  },
  PanResponder: {
    create: jest.fn(() => ({ panHandlers: {} })),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 390, height: 844 })),
  },
  Image: 'Image',
}));
jest.mock('../../../assets/headshots/headshot_high_pleasant.png', () => 'headshot_yellow', { virtual: true });
jest.mock('../../../assets/headshots/headshot_low_pleasant.png', () => 'headshot_green', { virtual: true });
jest.mock('../../../assets/headshots/headshot_low_unpleasant.png', () => 'headshot_blue', { virtual: true });
jest.mock('../../../assets/headshots/headshot_high_unpleasant.png', () => 'headshot_red', { virtual: true });

describe('TimelineCard — Characterization Tests', () => {
  describe('formatCardTime', () => {
    it('formats timestamp into human-readable hour and 2-digit minute string', () => {
      const ts = new Date(2026, 9, 30, 14, 5, 0).getTime();
      const formatted = formatCardTime(ts);
      expect(formatted).toMatch(/2:05|14:05/);
    });
  });

  describe('resolveCardNote', () => {
    it('returns triggerNote when both triggerNote and urgeNote exist', () => {
      expect(
        resolveCardNote({
          triggerNote: 'Primary reflection',
          urgeNote: 'Secondary urge',
        })
      ).toBe('Primary reflection');
    });

    it('falls back to urgeNote when triggerNote is undefined or empty', () => {
      expect(
        resolveCardNote({
          triggerNote: undefined,
          urgeNote: 'Fallback urge note',
        })
      ).toBe('Fallback urge note');
    });

    it('returns empty string when neither note is present', () => {
      expect(resolveCardNote({})).toBe('');
    });
  });

  describe('resolveQuadrantHeadshot', () => {
    it('returns matching headshot asset for each quadrant', () => {
      expect(resolveQuadrantHeadshot('yellow')).toBe('headshot_yellow');
      expect(resolveQuadrantHeadshot('green')).toBe('headshot_green');
      expect(resolveQuadrantHeadshot('blue')).toBe('headshot_blue');
      expect(resolveQuadrantHeadshot('red')).toBe('headshot_red');
    });
  });
});
