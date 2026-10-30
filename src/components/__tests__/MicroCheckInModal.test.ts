import {
  deriveInitialFormState,
  canProceedStep,
  buildCheckInPayload,
  CheckInFormState,
} from '../MicroCheckInModal';
import { CheckIn } from '../../types';

jest.mock('react-native', () => ({
  Modal: 'Modal',
  View: 'View',
  StyleSheet: { create: (s: unknown) => s },
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  TextInput: 'TextInput',
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Platform: { OS: 'android' },
  BackHandler: { addEventListener: jest.fn() },
  StatusBar: 'StatusBar',
  Image: 'Image',
}));
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));
jest.mock('../../../assets/blobs/blob_high_unpleasant.png', () => 'blob_red', { virtual: true });
jest.mock('../../../assets/blobs/blob_high_pleasant.png', () => 'blob_yellow', { virtual: true });
jest.mock('../../../assets/blobs/blob_low_unpleasant.png', () => 'blob_blue', { virtual: true });
jest.mock('../../../assets/blobs/blob_low_pleasant.png', () => 'blob_green', { virtual: true });

describe('MicroCheckInModal — Characterization Tests', () => {
  describe('deriveInitialFormState', () => {
    it('returns default blank form state with intensity 7 when creating a new check-in', () => {
      const state = deriveInitialFormState(null);
      expect(state).toEqual({
        quadrant: null,
        primaryEmotion: null,
        intensity: 7,
        selectedPerson: null,
        selectedPlace: null,
        reflectionNote: '',
      });
    });

    it('hydrates form state from existing CheckIn when editing', () => {
      const existing: CheckIn = {
        id: 'edit-1',
        timestamp: 1700000000000,
        quadrant: 'yellow',
        energyLevel: 8,
        pleasantnessLevel: 8,
        primaryEmotion: 'Excited',
        intensity: 9,
        somaticSensations: ['Warm chest'],
        contextWho: ['Friends', 'Partner'],
        contextWhat: ['Cafe/Restaurant'],
        contextWhere: 'Downtown',
        triggerNote: 'Great conversation',
        urgeNote: 'Legacy urge note',
        createdAt: 1700000000000,
      };

      const state = deriveInitialFormState(existing);
      expect(state.quadrant).toBe('yellow');
      expect(state.primaryEmotion).toBe('Excited');
      expect(state.intensity).toBe(9);
      // Pins single-select behavior: picks first element of contextWho
      expect(state.selectedPerson).toBe('Friends');
      // Pins priority: contextWhat[0] takes precedence over contextWhere
      expect(state.selectedPlace).toBe('Cafe/Restaurant');
      // Pins priority: triggerNote takes precedence over urgeNote
      expect(state.reflectionNote).toBe('Great conversation');
    });

    it('falls back to contextWhere and urgeNote when contextWhat and triggerNote are empty', () => {
      const legacyCheckIn: CheckIn = {
        id: 'legacy-1',
        timestamp: 1700000000000,
        quadrant: 'blue',
        energyLevel: 3,
        pleasantnessLevel: 3,
        primaryEmotion: 'Tired',
        intensity: 4,
        somaticSensations: [],
        contextWho: [],
        contextWhat: [],
        contextWhere: 'Home',
        urgeNote: 'Need to rest',
        createdAt: 1700000000000,
      };

      const state = deriveInitialFormState(legacyCheckIn);
      expect(state.selectedPerson).toBeNull();
      expect(state.selectedPlace).toBe('Home');
      expect(state.reflectionNote).toBe('Need to rest');
    });
  });

  describe('canProceedStep (5-step wizard gate rules)', () => {
    it('requires quadrant selection on Step 1', () => {
      expect(canProceedStep(1, null, null)).toBe(false);
      expect(canProceedStep(1, 'red', null)).toBe(true);
    });

    it('requires primaryEmotion selection on Step 2', () => {
      expect(canProceedStep(2, 'red', null)).toBe(false);
      expect(canProceedStep(2, 'red', 'Frustrated')).toBe(true);
    });

    it('allows proceeding unconditionally on Steps 3, 4, and 5 (optional context & notes)', () => {
      expect(canProceedStep(3, 'green', 'Calm')).toBe(true);
      expect(canProceedStep(4, 'green', 'Calm')).toBe(true);
      expect(canProceedStep(5, 'green', 'Calm')).toBe(true);
    });
  });

  describe('buildCheckInPayload', () => {
    it('builds a new CheckIn with quadrant-derived energy/pleasantness and trimmed note', () => {
      const form: CheckInFormState = {
        quadrant: 'red',
        primaryEmotion: 'Anxious',
        intensity: 8,
        selectedPerson: 'Coworkers',
        selectedPlace: 'Work',
        reflectionNote: '  Tight deadline tomorrow  ',
      };

      const fixedNow = 1750000000000;
      const result = buildCheckInPayload(form, null, fixedNow);

      expect(result).toEqual({
        id: '1750000000000',
        timestamp: fixedNow,
        quadrant: 'red',
        energyLevel: 8, // High energy for red/yellow
        pleasantnessLevel: 3, // Low pleasantness for red/blue
        primaryEmotion: 'Anxious',
        intensity: 8,
        somaticSensations: [],
        contextWho: ['Coworkers'],
        contextWhat: ['Work'],
        contextWhere: 'Work',
        triggerNote: 'Tight deadline tomorrow',
        createdAt: fixedNow,
      });
    });

    it('preserves original id, timestamp, createdAt, and somaticSensations when editing an existing entry', () => {
      const existing: CheckIn = {
        id: 'orig-99',
        timestamp: 1700000000000,
        quadrant: 'blue',
        energyLevel: 3,
        pleasantnessLevel: 3,
        primaryEmotion: 'Sad',
        intensity: 5,
        somaticSensations: ['Heavy chest'],
        contextWho: ['Alone'],
        contextWhat: ['Home'],
        contextWhere: 'Home',
        triggerNote: 'Old note',
        urgeNote: 'Legacy urge note that is currently dropped on edit',
        createdAt: 1700000000000,
      };

      const updatedForm: CheckInFormState = {
        quadrant: 'green',
        primaryEmotion: 'Peaceful',
        intensity: 6,
        selectedPerson: null,
        selectedPlace: null,
        reflectionNote: '   ', // blank whitespace becomes undefined
      };

      const result = buildCheckInPayload(updatedForm, existing, 1799999999999);

      expect(result.id).toBe('orig-99');
      expect(result.timestamp).toBe(1700000000000);
      expect(result.createdAt).toBe(1700000000000);
      expect(result.somaticSensations).toEqual(['Heavy chest']);
      expect(result.quadrant).toBe('green');
      expect(result.energyLevel).toBe(3);
      expect(result.pleasantnessLevel).toBe(8);
      expect(result.contextWho).toEqual([]);
      expect(result.contextWhat).toEqual([]);
      expect(result.contextWhere).toBe('');
      expect(result.triggerNote).toBeUndefined();
      // Pins current quirk: urgeNote is not carried over on edit
      expect(result.urgeNote).toBeUndefined();
    });
  });
});
