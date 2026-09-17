import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckIn, QuadrantType } from '../types';
import { EMOTIONS, SOMATIC_SENSATIONS } from '../constants/moodMeter';
import { useAppTheme } from '../theme/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (checkIn: CheckIn) => void;
  initialCheckIn?: CheckIn | null;
}

const LOCATION_OPTIONS = [
  'Home',
  'Work',
  'Desk',
  'Commute',
  'Outdoors',
  'Cafe',
  'Gym',
];

export const MicroCheckInModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  initialCheckIn,
}) => {
  const { theme, isDark } = useAppTheme();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [quadrant, setQuadrant] = useState<QuadrantType>('green');
  const [primaryEmotion, setPrimaryEmotion] = useState<string>('Peaceful');
  const [somaticSensations, setSomaticSensations] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [reasonNote, setReasonNote] = useState<string>('');

  useEffect(() => {
    if (initialCheckIn) {
      setQuadrant(initialCheckIn.quadrant);
      setPrimaryEmotion(initialCheckIn.primaryEmotion);
      setSomaticSensations(initialCheckIn.somaticSensations || []);
      setLocations(
        initialCheckIn.contextWhere ? [initialCheckIn.contextWhere] : initialCheckIn.contextWhat || []
      );
      setReasonNote(initialCheckIn.triggerNote || initialCheckIn.urgeNote || '');
    } else {
      resetForm();
    }
    setCurrentStep(1);
  }, [initialCheckIn, visible]);

  // Android hardware back button handler
  useEffect(() => {
    if (!visible) return;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (currentStep > 1) {
        prevStep();
        return true;
      }
      onClose();
      return true;
    });
    return () => backHandler.remove();
  }, [visible, currentStep]);

  const resetForm = () => {
    setQuadrant('green');
    setPrimaryEmotion('Peaceful');
    setSomaticSensations([]);
    setLocations([]);
    setReasonNote('');
  };

  const handlePickQuadrant = (q: QuadrantType) => {
    setQuadrant(q);
    const firstEmotion = EMOTIONS[q][0]?.name || 'Calm';
    setPrimaryEmotion(firstEmotion);
    setCurrentStep(2);
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5);
    }
  };

  const toggleSomatic = (item: string) => {
    if (somaticSensations.includes(item)) {
      setSomaticSensations(somaticSensations.filter((s) => s !== item));
    } else {
      setSomaticSensations([...somaticSensations, item]);
    }
  };

  const toggleLocation = (loc: string) => {
    if (locations.includes(loc)) {
      setLocations(locations.filter((l) => l !== loc));
    } else {
      setLocations([...locations, loc]);
    }
  };

  const handleComplete = () => {
    const checkIn: CheckIn = {
      id: initialCheckIn ? initialCheckIn.id : Date.now().toString(),
      timestamp: initialCheckIn ? initialCheckIn.timestamp : Date.now(),
      quadrant,
      energyLevel: quadrant === 'yellow' || quadrant === 'red' ? 8 : 3,
      pleasantnessLevel: quadrant === 'yellow' || quadrant === 'green' ? 8 : 3,
      primaryEmotion,
      intensity: 7,
      somaticSensations,
      contextWho: [],
      contextWhat: locations,
      contextWhere: locations[0] || '',
      triggerNote: reasonNote.trim() || undefined,
      createdAt: initialCheckIn ? initialCheckIn.createdAt : Date.now(),
    };
    onSave(checkIn);
    onClose();
  };

  const qMeta = theme.quadrants[quadrant];
  const currentEmotionList = EMOTIONS[quadrant] || [];
  const currentDefinition =
    currentEmotionList.find((e) => e.name === primaryEmotion)?.definition ||
    'Feeling calm, quiet, and grounded.';

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={() => {
        if (currentStep > 1) prevStep();
        else onClose();
      }}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoid}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Top Bar Navigation */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={prevStep}
              style={[styles.navBtn, currentStep === 1 && styles.navBtnHidden]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              disabled={currentStep === 1}
            >
              <Text style={[styles.navBtnText, { color: theme.textMuted }]}>‹ Back</Text>
            </TouchableOpacity>

            {/* 5 Progress Indicators */}
            <View style={styles.stepDots}>
              {([1, 2, 3, 4, 5] as const).map((stepNum) => {
                const isActive = stepNum === currentStep;
                return (
                  <View
                    key={stepNum}
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor: isActive ? theme.btnPrimaryBg : theme.borderFocus,
                        width: isActive ? 16 : 5,
                      },
                    ]}
                  />
                );
              })}
            </View>

            <TouchableOpacity
              onPress={onClose}
              style={[styles.navBtn, { alignItems: 'flex-end' }]}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={[styles.navBtnText, { color: theme.textMuted }]}>Cancel</Text>
            </TouchableOpacity>
          </View>

          {/* Step 1: 2x2 Quadrant Selection */}
          {currentStep === 1 && (
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>
                How are you feeling right now?
              </Text>
              <View style={styles.quadrantGrid}>
                {/* Yellow */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => handlePickQuadrant('yellow')}
                  style={[
                    styles.quadrantCard,
                    {
                      backgroundColor: theme.quadrants.yellow.cardBg,
                      borderColor: theme.quadrants.yellow.cardBorder,
                    },
                  ]}
                >
                  <Text style={[styles.quadrantTitle, { color: theme.quadrants.yellow.textColor }]}>
                    High Energy
                  </Text>
                  <Text style={[styles.quadrantSubtitle, { color: theme.quadrants.yellow.subTextColor }]}>
                    Pleasant
                  </Text>
                </TouchableOpacity>

                {/* Red */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => handlePickQuadrant('red')}
                  style={[
                    styles.quadrantCard,
                    {
                      backgroundColor: theme.quadrants.red.cardBg,
                      borderColor: theme.quadrants.red.cardBorder,
                    },
                  ]}
                >
                  <Text style={[styles.quadrantTitle, { color: theme.quadrants.red.textColor }]}>
                    High Energy
                  </Text>
                  <Text style={[styles.quadrantSubtitle, { color: theme.quadrants.red.subTextColor }]}>
                    Unpleasant
                  </Text>
                </TouchableOpacity>

                {/* Green */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => handlePickQuadrant('green')}
                  style={[
                    styles.quadrantCard,
                    {
                      backgroundColor: theme.quadrants.green.cardBg,
                      borderColor: theme.quadrants.green.cardBorder,
                    },
                  ]}
                >
                  <Text style={[styles.quadrantTitle, { color: theme.quadrants.green.textColor }]}>
                    Low Energy
                  </Text>
                  <Text style={[styles.quadrantSubtitle, { color: theme.quadrants.green.subTextColor }]}>
                    Pleasant
                  </Text>
                </TouchableOpacity>

                {/* Blue */}
                <TouchableOpacity
                  activeOpacity={0.88}
                  onPress={() => handlePickQuadrant('blue')}
                  style={[
                    styles.quadrantCard,
                    {
                      backgroundColor: theme.quadrants.blue.cardBg,
                      borderColor: theme.quadrants.blue.cardBorder,
                    },
                  ]}
                >
                  <Text style={[styles.quadrantTitle, { color: theme.quadrants.blue.textColor }]}>
                    Low Energy
                  </Text>
                  <Text style={[styles.quadrantSubtitle, { color: theme.quadrants.blue.subTextColor }]}>
                    Unpleasant
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 2: Emotion Selection & Live Definition Box */}
          {currentStep === 2 && (
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Select your emotion</Text>

              {/* Definition Box */}
              <View
                style={[
                  styles.definitionBox,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                    borderLeftColor: qMeta.color,
                  },
                ]}
              >
                <Text style={[styles.definitionTitle, { color: isDark ? qMeta.textColor : qMeta.color }]}>
                  {primaryEmotion}
                </Text>
                <Text style={[styles.definitionText, { color: theme.textSecondary }]}>
                  {currentDefinition}
                </Text>
              </View>

              {/* 36 Emotion Chips Cloud */}
              <ScrollView
                style={styles.chipScrollView}
                contentContainerStyle={styles.chipCloud}
                showsVerticalScrollIndicator={false}
              >
                {currentEmotionList.map((item) => {
                  const isSelected = primaryEmotion === item.name;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      activeOpacity={0.8}
                      onPress={() => setPrimaryEmotion(item.name)}
                      style={[
                        styles.chip,
                        {
                          backgroundColor: isSelected
                            ? qMeta.selectedChipBg
                            : theme.chipBg,
                          borderColor: isSelected
                            ? qMeta.selectedChipBorder
                            : theme.chipBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected
                              ? qMeta.selectedChipText
                              : theme.chipText,
                            fontWeight: isSelected ? '600' : '400',
                          },
                        ]}
                      >
                        {item.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Step 3: Somatic Sensations */}
          {currentStep === 3 && (
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Where do you feel this?</Text>
              <ScrollView
                style={styles.chipScrollView}
                contentContainerStyle={styles.chipCloud}
                showsVerticalScrollIndicator={false}
              >
                {SOMATIC_SENSATIONS.map((item) => {
                  const isSelected = somaticSensations.includes(item);
                  return (
                    <TouchableOpacity
                      key={item}
                      activeOpacity={0.8}
                      onPress={() => toggleSomatic(item)}
                      style={[
                        styles.chip,
                        styles.somaticChip,
                        {
                          backgroundColor: isSelected ? theme.btnPrimaryBg : theme.chipBg,
                          borderColor: isSelected ? 'transparent' : theme.chipBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected ? theme.btnPrimaryText : theme.chipText,
                            fontWeight: isSelected ? '600' : '400',
                          },
                        ]}
                      >
                        {item}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Step 4: Physical Location */}
          {currentStep === 4 && (
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>Where are you?</Text>
              <ScrollView
                style={styles.chipScrollView}
                contentContainerStyle={styles.chipCloud}
                showsVerticalScrollIndicator={false}
              >
                {LOCATION_OPTIONS.map((loc) => {
                  const isSelected = locations.includes(loc);
                  return (
                    <TouchableOpacity
                      key={loc}
                      activeOpacity={0.8}
                      onPress={() => toggleLocation(loc)}
                      style={[
                        styles.chip,
                        styles.somaticChip,
                        {
                          backgroundColor: isSelected ? theme.btnPrimaryBg : theme.chipBg,
                          borderColor: isSelected ? 'transparent' : theme.chipBorder,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isSelected ? theme.btnPrimaryText : theme.chipText,
                            fontWeight: isSelected ? '600' : '400',
                          },
                        ]}
                      >
                        {loc}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Step 5: Reflection Note */}
          {currentStep === 5 && (
            <View style={styles.stepContent}>
              <Text style={[styles.stepTitle, { color: theme.text }]}>What is causing this?</Text>
              <View
                style={[
                  styles.textAreaWrapper,
                  {
                    backgroundColor: theme.surfaceElevated,
                    borderColor: theme.border,
                  },
                ]}
              >
                <TextInput
                  style={[styles.textAreaInput, { color: theme.text }]}
                  placeholder="Write a note..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                  numberOfLines={6}
                  value={reasonNote}
                  onChangeText={setReasonNote}
                  textAlignVertical="top"
                />
              </View>
            </View>
          )}

          {/* Bottom Action Button - shown on Steps 2 to 5 */}
          {currentStep >= 2 && (
            <View style={[styles.bottomBar, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.07)' : theme.border }]}>
              <TouchableOpacity
                onPress={currentStep === 5 ? handleComplete : nextStep}
                style={[styles.primaryActionBtn, { backgroundColor: theme.btnPrimaryBg }]}
                activeOpacity={0.85}
              >
                <Text style={[styles.primaryActionBtnText, { color: theme.btnPrimaryText }]}>
                  {currentStep === 5 ? 'Save check-in' : 'Continue'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  navBtn: {
    minWidth: 60,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  navBtnHidden: {
    opacity: 0,
  },
  navBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  stepDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepDot: {
    height: 4,
    borderRadius: 2,
  },
  stepContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  stepTitle: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '400',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  quadrantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  quadrantCard: {
    width: '48%',
    aspectRatio: 0.95,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
    justifyContent: 'flex-end',
  },
  quadrantTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 2,
  },
  quadrantSubtitle: {
    fontSize: 12,
    fontWeight: '300',
  },
  definitionBox: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderLeftWidth: 3.5,
    marginBottom: 16,
  },
  definitionTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  definitionText: {
    fontSize: 13,
    lineHeight: 19,
  },
  chipScrollView: {
    flex: 1,
  },
  chipCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingBottom: 28,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  somaticChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  textAreaWrapper: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    minHeight: 140,
  },
  textAreaInput: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  primaryActionBtn: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryActionBtnText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});


