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
import * as Haptics from 'expo-haptics';
import { CheckIn, QuadrantType } from '../types';
import { EMOTIONS, SOMATIC_SENSATIONS, CONTEXT_WHO, CONTEXT_WHERE } from '../constants/moodMeter';
import { QuadrantSelector } from './QuadrantSelector';
import { useAppTheme } from '../theme/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (checkIn: CheckIn) => void;
  initialCheckIn?: CheckIn | null;
}

export const MicroCheckInModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  initialCheckIn,
}) => {
  const { theme, isDark } = useAppTheme();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [quadrant, setQuadrant] = useState<QuadrantType>('red');
  const [primaryEmotion, setPrimaryEmotion] = useState<string>('Anxious');
  const [intensity, setIntensity] = useState<number>(7);
  const [somaticSensations, setSomaticSensations] = useState<string[]>([]);
  const [contextWho, setContextWho] = useState<string[]>([]);
  const [contextWhere, setContextWhere] = useState<string>('');
  const [reasonNote, setReasonNote] = useState<string>('');

  useEffect(() => {
    if (initialCheckIn) {
      setQuadrant(initialCheckIn.quadrant);
      setPrimaryEmotion(initialCheckIn.primaryEmotion);
      setIntensity(initialCheckIn.intensity);
      setSomaticSensations(initialCheckIn.somaticSensations || []);
      setContextWho(initialCheckIn.contextWho || []);
      setContextWhere(initialCheckIn.contextWhere || '');
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

  const qMeta = theme.quadrants[quadrant];

  const handleQuadrantChange = (newQuadrant: QuadrantType) => {
    setQuadrant(newQuadrant);
    const firstEmotion = EMOTIONS[newQuadrant][0]?.name || 'Anxious';
    setPrimaryEmotion(firstEmotion);
  };

  const nextStep = () => {
    Haptics.selectionAsync();
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3);
    }
  };

  const prevStep = () => {
    Haptics.selectionAsync();
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3);
    } else {
      onClose();
    }
  };

  const toggleSomatic = (item: string) => {
    Haptics.selectionAsync();
    if (somaticSensations.includes(item)) {
      setSomaticSensations(somaticSensations.filter((s) => s !== item));
    } else {
      setSomaticSensations([...somaticSensations, item]);
    }
  };

  const toggleWho = (item: string) => {
    Haptics.selectionAsync();
    if (contextWho.includes(item)) {
      setContextWho(contextWho.filter((w) => w !== item));
    } else {
      setContextWho([...contextWho, item]);
    }
  };

  const toggleWhere = (item: string) => {
    Haptics.selectionAsync();
    setContextWhere(contextWhere === item ? '' : item);
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const checkInToSave: CheckIn = {
      id: initialCheckIn ? initialCheckIn.id : `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: initialCheckIn ? initialCheckIn.timestamp : Date.now(),
      quadrant,
      energyLevel: quadrant === 'red' || quadrant === 'yellow' ? 8 : 3,
      pleasantnessLevel: quadrant === 'yellow' || quadrant === 'green' ? 8 : 3,
      primaryEmotion,
      intensity,
      somaticSensations,
      contextWho,
      contextWhat: [],
      contextWhere: contextWhere || undefined,
      triggerNote: reasonNote.trim() || undefined,
      urgeNote: undefined,
      createdAt: initialCheckIn ? initialCheckIn.createdAt : Date.now(),
    };

    onSave(checkInToSave);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setQuadrant('red');
    setPrimaryEmotion('Anxious');
    setIntensity(7);
    setSomaticSensations([]);
    setContextWho([]);
    setContextWhere('');
    setReasonNote('');
    setCurrentStep(1);
  };

  const emotionsList = EMOTIONS[quadrant] || [];
  const selectedEmotionItem = emotionsList.find(
    (e) => e.name.toLowerCase() === primaryEmotion.toLowerCase()
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          {/* Top Bar: single X in top right corner, Back button if step > 1 */}
          <View style={styles.topBar}>
            {currentStep > 1 ? (
              <TouchableOpacity
                onPress={prevStep}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                style={styles.backBtn}
              >
                <Text style={[styles.backBtnText, { color: theme.textMuted }]}>‹ Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.backBtnPlaceholder} />
            )}

            <TouchableOpacity
              onPress={onClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              style={styles.closeBtn}
            >
              <Text style={[styles.closeBtnText, { color: theme.textSubtle }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Step Content */}
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* STEP 1: What are you feeling right now? */}
            {currentStep === 1 && (
              <View style={styles.stepContent}>
                <Text style={[styles.questionTitle, { color: theme.text }]}>
                  What are you feeling right now?
                </Text>

                {/* Yale How We Feel 2x2 Quadrant Grid */}
                <QuadrantSelector
                  selectedQuadrant={quadrant}
                  onSelect={handleQuadrantChange}
                />

                {/* Emotion Vocabulary Chips: Highlight only, no dot */}
                <View style={styles.sectionHeaderSpacing}>
                  <Text style={[styles.subheadingMono, { color: theme.textSubtle }]}>
                    SELECT EMOTION
                  </Text>
                </View>

                {/* Selected Emotion Definition */}
                {selectedEmotionItem && (
                  <View
                    style={[
                      styles.definitionCard,
                      {
                        backgroundColor: qMeta.subtleBg,
                        borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : theme.border,
                        borderLeftColor: qMeta.color,
                      },
                    ]}
                  >
                    <View style={styles.definitionHeader}>
                      <Text style={[styles.definitionWord, { color: isDark ? '#FFFFFF' : theme.text }]}>
                        {selectedEmotionItem.name}
                      </Text>
                      <Text style={[styles.definitionTag, { color: qMeta.color }]}>
                        {selectedEmotionItem.energy.toUpperCase()} ENERGY · {selectedEmotionItem.pleasantness.toUpperCase()}
                      </Text>
                    </View>
                    <Text style={[styles.definitionText, { color: theme.textSecondary }]}>
                      {selectedEmotionItem.definition}
                    </Text>
                  </View>
                )}

                <View style={styles.chipsWrap}>
                  {emotionsList.map((item) => {
                    const isSelected = primaryEmotion.toLowerCase() === item.name.toLowerCase();
                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.8}
                        onPress={() => {
                          Haptics.selectionAsync();
                          setPrimaryEmotion(item.name);
                        }}
                        style={[
                          styles.chip,
                          isSelected
                            ? {
                                backgroundColor: qMeta.subtleBg,
                                borderColor: qMeta.color,
                                borderWidth: 1.5,
                              }
                            : {
                                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : theme.surfaceSecondary,
                                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.border,
                                borderWidth: 1,
                              },
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color: isSelected ? (isDark ? '#FFFFFF' : qMeta.color) : theme.textSecondary,
                              fontWeight: isSelected ? '700' : '500',
                            },
                          ]}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* STEP 2: Where are you feeling this? */}
            {currentStep === 2 && (
              <View style={styles.stepContent}>
                <Text style={[styles.questionTitle, { color: theme.text }]}>
                  Where are you feeling this?
                </Text>

                {/* Intensity 1–10 Selector Strip */}
                <View style={styles.subSection}>
                  <Text style={[styles.subheadingMono, { color: theme.textSubtle }]}>
                    INTENSITY ({intensity}/10)
                  </Text>
                  <View style={styles.intensityStrip}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                      const isSelected = intensity === num;
                      return (
                        <TouchableOpacity
                          key={num}
                          activeOpacity={0.8}
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setIntensity(num);
                          }}
                          style={[
                            styles.intensityNumberBtn,
                            isSelected
                              ? {
                                  backgroundColor: qMeta.subtleBg,
                                  borderColor: qMeta.color,
                                  borderWidth: 1.5,
                                }
                              : {
                                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : theme.surfaceSecondary,
                                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.border,
                                  borderWidth: 1,
                                },
                          ]}
                        >
                          <Text
                            style={[
                              styles.intensityNumberText,
                              {
                                color: isSelected ? (isDark ? '#FFFFFF' : qMeta.color) : theme.textMuted,
                                fontWeight: isSelected ? '800' : '600',
                              },
                            ]}
                          >
                            {num}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Body Area */}
                <View style={styles.subSection}>
                  <Text style={[styles.subheadingMono, { color: theme.textSubtle }]}>
                    BODY AREA
                  </Text>
                  <View style={styles.chipsWrap}>
                    {SOMATIC_SENSATIONS.map((area) => {
                      const isSelected = somaticSensations.includes(area);
                      return (
                        <TouchableOpacity
                          key={area}
                          activeOpacity={0.8}
                          onPress={() => toggleSomatic(area)}
                          style={[
                            styles.chip,
                            isSelected
                              ? {
                                  backgroundColor: qMeta.subtleBg,
                                  borderColor: qMeta.color,
                                  borderWidth: 1.5,
                                }
                              : {
                                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : theme.surfaceSecondary,
                                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.border,
                                  borderWidth: 1,
                                },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              {
                                color: isSelected ? (isDark ? '#FFFFFF' : qMeta.color) : theme.textSecondary,
                                fontWeight: isSelected ? '700' : '500',
                              },
                            ]}
                          >
                            {area}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Company */}
                <View style={styles.subSection}>
                  <Text style={[styles.subheadingMono, { color: theme.textSubtle }]}>
                    COMPANY
                  </Text>
                  <View style={styles.chipsWrap}>
                    {CONTEXT_WHO.map((person) => {
                      const isSelected = contextWho.includes(person);
                      return (
                        <TouchableOpacity
                          key={person}
                          activeOpacity={0.8}
                          onPress={() => toggleWho(person)}
                          style={[
                            styles.chip,
                            isSelected
                              ? {
                                  backgroundColor: qMeta.subtleBg,
                                  borderColor: qMeta.color,
                                  borderWidth: 1.5,
                                }
                              : {
                                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : theme.surfaceSecondary,
                                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.border,
                                  borderWidth: 1,
                                },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              {
                                color: isSelected ? (isDark ? '#FFFFFF' : qMeta.color) : theme.textSecondary,
                                fontWeight: isSelected ? '700' : '500',
                              },
                            ]}
                          >
                            {person}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Setting */}
                <View style={styles.subSection}>
                  <Text style={[styles.subheadingMono, { color: theme.textSubtle }]}>
                    SETTING
                  </Text>
                  <View style={styles.chipsWrap}>
                    {CONTEXT_WHERE.map((loc) => {
                      const isSelected = contextWhere === loc;
                      return (
                        <TouchableOpacity
                          key={loc}
                          activeOpacity={0.8}
                          onPress={() => toggleWhere(loc)}
                          style={[
                            styles.chip,
                            isSelected
                              ? {
                                  backgroundColor: qMeta.subtleBg,
                                  borderColor: qMeta.color,
                                  borderWidth: 1.5,
                                }
                              : {
                                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : theme.surfaceSecondary,
                                  borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.border,
                                  borderWidth: 1,
                                },
                          ]}
                        >
                          <Text
                            style={[
                              styles.chipText,
                              {
                                color: isSelected ? (isDark ? '#FFFFFF' : qMeta.color) : theme.textSecondary,
                                fontWeight: isSelected ? '700' : '500',
                              },
                            ]}
                          >
                            {loc}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* STEP 3: Why are you feeling this? */}
            {currentStep === 3 && (
              <View style={styles.stepContent}>
                <Text style={[styles.questionTitle, { color: theme.text }]}>
                  Why are you feeling this?
                </Text>

                <View
                  style={[
                    styles.textAreaWrapper,
                    {
                      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : theme.surfaceSecondary,
                      borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.border,
                    },
                  ]}
                >
                  <TextInput
                    placeholder="Write a few thoughts on what brought this moment on..."
                    placeholderTextColor={theme.textSubtle}
                    value={reasonNote}
                    onChangeText={setReasonNote}
                    multiline
                    autoFocus
                    numberOfLines={6}
                    style={[
                      styles.textAreaInput,
                      {
                        color: theme.text,
                      },
                    ]}
                  />
                </View>
              </View>
            )}
          </ScrollView>

          {/* Bottom Action Button */}
          <View style={[styles.bottomBar, { borderTopColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.border }]}>
            {currentStep < 3 ? (
              <TouchableOpacity
                onPress={nextStep}
                style={[styles.primaryActionBtn, { backgroundColor: qMeta.color }]}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionBtnText}>Continue →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSave}
                style={[styles.primaryActionBtn, { backgroundColor: qMeta.color }]}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionBtnText}>Save Entry</Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  topBar: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backBtn: {
    minWidth: 60,
    justifyContent: 'center',
  },
  backBtnPlaceholder: {
    minWidth: 60,
  },
  backBtnText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '600',
  },
  closeBtn: {
    minWidth: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
  },
  stepContent: {
    flex: 1,
  },
  questionTitle: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '400',
    lineHeight: 32,
    letterSpacing: -0.3,
    marginBottom: 20,
  },
  sectionHeaderSpacing: {
    marginTop: 18,
    marginBottom: 10,
  },
  subSection: {
    marginBottom: 20,
  },
  subheadingMono: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  chipText: {
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  definitionCard: {
    marginTop: 6,
    marginBottom: 14,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderLeftWidth: 3,
  },
  definitionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 6,
    gap: 8,
    flexWrap: 'wrap',
  },
  definitionWord: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  definitionTag: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  definitionText: {
    fontFamily: 'monospace',
    fontSize: 12,
    lineHeight: 18,
  },
  intensityStrip: {
    flexDirection: 'row',
    gap: 4,
    justifyContent: 'space-between',
  },
  intensityNumberBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  intensityNumberText: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  textAreaWrapper: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    minHeight: 140,
  },
  textAreaInput: {
    fontFamily: 'serif',
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
    minHeight: 120,
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  primaryActionBtn: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
});


