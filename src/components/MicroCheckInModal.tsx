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
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { CheckIn, QuadrantType } from '../types';
import { EMOTIONS } from '../constants/moodMeter';
import { useAppTheme } from '../theme/ThemeContext';
import { fonts } from '../theme';
import * as Haptics from 'expo-haptics';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (checkIn: CheckIn) => void;
  initialCheckIn?: CheckIn | null;
}

const PEOPLE_OPTIONS: { name: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { name: 'Alone', icon: 'self-improvement' },
  { name: 'Friends', icon: 'group' },
  { name: 'Family', icon: 'favorite' },
  { name: 'Partner', icon: 'favorite-border' },
  { name: 'Coworkers', icon: 'badge' },
  { name: 'Classmates', icon: 'school' },
  { name: 'Clients', icon: 'support-agent' },
];

const PLACE_OPTIONS: { name: string; icon: keyof typeof MaterialIcons.glyphMap }[] = [
  { name: 'Home', icon: 'cottage' },
  { name: 'Work', icon: 'domain' },
  { name: 'School', icon: 'apartment' },
  { name: 'Transit', icon: 'commute' },
  { name: 'Outdoors', icon: 'nature-people' },
  { name: 'Gym', icon: 'fitness-center' },
  { name: 'Cafe/Restaurant', icon: 'local-cafe' },
];

const getQuadrantTokens = (q: QuadrantType | null, isDark: boolean) => {
  switch (q) {
    case 'yellow':
      return {
        selectedBg: isDark ? 'rgba(245, 158, 11, 0.28)' : '#FDE68A',
        selectedBorder: isDark ? '#F59E0B' : '#D97706',
        selectedText: isDark ? '#FFFBEB' : '#78350F',
        selectedIcon: isDark ? '#FFFBEB' : '#B45309',
      };
    case 'red':
      return {
        selectedBg: isDark ? 'rgba(239, 68, 68, 0.28)' : '#FECACA',
        selectedBorder: isDark ? '#EF4444' : '#DC2626',
        selectedText: isDark ? '#FFF1F2' : '#7F1D1D',
        selectedIcon: isDark ? '#FFF1F2' : '#B91C1C',
      };
    case 'blue':
      return {
        selectedBg: isDark ? 'rgba(59, 130, 246, 0.28)' : '#BFDBFE',
        selectedBorder: isDark ? '#3B82F6' : '#2563EB',
        selectedText: isDark ? '#EFF6FF' : '#1E3A8A',
        selectedIcon: isDark ? '#EFF6FF' : '#1D4ED8',
      };
    case 'green':
    default:
      return {
        selectedBg: isDark ? 'rgba(16, 185, 129, 0.28)' : '#A7F3D0',
        selectedBorder: isDark ? '#10B981' : '#16A34A',
        selectedText: isDark ? '#ECFDF5' : '#064E3B',
        selectedIcon: isDark ? '#ECFDF5' : '#047857',
      };
  }
};

const QUADRANT_CONFIGS: {
  key: QuadrantType;
  icon: keyof typeof MaterialIcons.glyphMap;
  energyText: string;
  pleasantText: string;
  baseBgLight: string;
}[] = [
  {
    key: 'red',
    icon: 'air',
    energyText: 'High energy',
    pleasantText: 'unpleasant',
    baseBgLight: '#FDE9E2',
  },
  {
    key: 'yellow',
    icon: 'wb-sunny',
    energyText: 'High energy',
    pleasantText: 'pleasant',
    baseBgLight: '#FFF4D6',
  },
  {
    key: 'blue',
    icon: 'bedtime',
    energyText: 'Low energy',
    pleasantText: 'unpleasant',
    baseBgLight: '#EAF0FA',
  },
  {
    key: 'green',
    icon: 'spa',
    energyText: 'Low energy',
    pleasantText: 'pleasant',
    baseBgLight: '#E7F4EB',
  },
];

export const MicroCheckInModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  initialCheckIn,
}) => {
  const insets = useSafeAreaInsets();
  const { theme, isDark } = useAppTheme();
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [quadrant, setQuadrant] = useState<QuadrantType | null>(null);
  const [primaryEmotion, setPrimaryEmotion] = useState<string | null>(null);
  const [intensity, setIntensity] = useState<number>(7);
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [reflectionNote, setReflectionNote] = useState<string>('');

  useEffect(() => {
    if (initialCheckIn) {
      setQuadrant(initialCheckIn.quadrant);
      setPrimaryEmotion(initialCheckIn.primaryEmotion);
      setIntensity(initialCheckIn.intensity ?? 7);
      setSelectedPerson(initialCheckIn.contextWho?.[0] || null);
      setSelectedPlace(
        initialCheckIn.contextWhat?.[0] || initialCheckIn.contextWhere || null
      );
      setReflectionNote(initialCheckIn.triggerNote || initialCheckIn.urgeNote || '');
    } else {
      resetForm();
    }
    setCurrentStep(1);
  }, [initialCheckIn, visible]);

  // Hardware back button support on Android
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
    setQuadrant(null);
    setPrimaryEmotion(null);
    setIntensity(7);
    setSelectedPerson(null);
    setSelectedPlace(null);
    setReflectionNote('');
  };

  const nextStep = () => {
    if (!canProceed) return;
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as 1 | 2 | 3 | 4 | 5);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as 1 | 2 | 3 | 4 | 5);
    } else {
      onClose();
    }
  };

  const handlePickQuadrant = (q: QuadrantType) => {
    setQuadrant(q);
    setPrimaryEmotion(null);
  };

  const togglePerson = (person: string) => {
    setSelectedPerson((prev) => (prev === person ? null : person));
  };

  const togglePlace = (place: string) => {
    setSelectedPlace((prev) => (prev === place ? null : place));
  };

  const handleComplete = () => {
    const selectedQuad = quadrant || 'green';
    const fallbackEmotion =
      primaryEmotion || (EMOTIONS[selectedQuad]?.[0]?.name ?? 'Calm');

    const checkIn: CheckIn = {
      id: initialCheckIn ? initialCheckIn.id : Date.now().toString(),
      timestamp: initialCheckIn ? initialCheckIn.timestamp : Date.now(),
      quadrant: selectedQuad,
      energyLevel: selectedQuad === 'yellow' || selectedQuad === 'red' ? 8 : 3,
      pleasantnessLevel: selectedQuad === 'yellow' || selectedQuad === 'green' ? 8 : 3,
      primaryEmotion: fallbackEmotion,
      intensity: intensity || 7,
      somaticSensations: initialCheckIn?.somaticSensations || [],
      contextWho: selectedPerson ? [selectedPerson] : [],
      contextWhat: selectedPlace ? [selectedPlace] : [],
      contextWhere: selectedPlace || '',
      triggerNote: reflectionNote.trim() || undefined,
      createdAt: initialCheckIn ? initialCheckIn.createdAt : Date.now(),
    };
    onSave(checkIn);
    onClose();
  };

  const qTokens = getQuadrantTokens(quadrant, isDark);
  const currentEmotionList = quadrant ? EMOTIONS[quadrant] || [] : [];
  const activeEmotionObj = currentEmotionList.find((e) => e.name === primaryEmotion);
  const currentDefinition =
    activeEmotionObj?.definition ||
    'Tap an emotion word below to see its nuanced meaning and reflection context.';

  const canProceed =
    currentStep === 1
      ? quadrant !== null
      : currentStep === 2
      ? primaryEmotion !== null
      : true;

  const getNextBtnText = () => {
    if (currentStep === 5) {
      return 'Finish';
    }
    return 'Next';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={prevStep}
      statusBarTranslucent={true}
    >
      <View
        style={[
          styles.safeArea,
          {
            backgroundColor: theme.background,
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 12),
          },
        ]}
      >
        <StatusBar hidden={true} translucent backgroundColor="transparent" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          {/* Top Bar matching Stitch */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={prevStep}
              style={styles.iconBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              {currentStep === 1 ? (
                <MaterialIcons name="close" size={24} color={theme.text} />
              ) : (
                <MaterialIcons name="arrow-back" size={24} color={theme.text} />
              )}
            </TouchableOpacity>
          </View>

          {/* Step Content */}
          {currentStep === 2 ? (
            <View style={styles.step2Container}>
              {/* Sticky Top Header Area: Question + Definition Card */}
              <View style={[styles.step2Header, { backgroundColor: theme.background }]}>
                <Text style={[styles.mainQuestion, { color: theme.text, marginBottom: 14 }]}>
                  Which word fits best?
                </Text>

                {/* Definition Card stuck to top only when a word is selected */}
                {primaryEmotion ? (
                  <View
                    style={[
                      styles.definitionCard,
                      {
                        backgroundColor: theme.surface,
                        borderWidth: 0,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.defEmotionTitle,
                        { color: theme.text },
                      ]}
                    >
                      {primaryEmotion}
                    </Text>
                    <Text style={[styles.defEmotionBody, { color: theme.textSecondary }]}>
                      {currentDefinition}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Scrollable Emotion Chips Grid */}
              <ScrollView
                style={styles.step2Scroll}
                contentContainerStyle={styles.step2ScrollContent}
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.emotionGrid}>
                  {currentEmotionList.map((item) => {
                    const isSelected = item.name === primaryEmotion;
                    return (
                      <TouchableOpacity
                        key={item.id}
                        activeOpacity={0.8}
                        onPress={() => setPrimaryEmotion(item.name)}
                        style={[
                          styles.emotionChip,
                          {
                            backgroundColor: isSelected
                              ? qTokens.selectedBg
                              : isDark
                              ? theme.surfaceSecondary
                              : '#FFFFFF',
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.emotionChipText,
                            {
                              color: isSelected ? qTokens.selectedText : theme.text,
                              fontFamily: isSelected ? fonts.bold : fonts.semiBold,
                            },
                          ]}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>
          ) : (
            <ScrollView
              style={styles.scroll}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* STEP 1: Mood Meter (Screen 2) */}
              {currentStep === 1 && (
                <View style={styles.stepContainer}>
                  <Text style={[styles.mainQuestion, { color: theme.text }]}>
                    How are you feeling right now?
                  </Text>

                  <View style={styles.quadrantGrid}>
                    {QUADRANT_CONFIGS.map((cfg) => {
                      const isSelected = quadrant === cfg.key;
                      const tokens = getQuadrantTokens(cfg.key, isDark);
                      const quadColor = theme.quadrants[cfg.key].color;
                      return (
                        <TouchableOpacity
                          key={cfg.key}
                          activeOpacity={0.88}
                          onPress={() => handlePickQuadrant(cfg.key)}
                          style={[
                            styles.quadrantCard,
                            {
                              backgroundColor: isSelected
                                ? tokens.selectedBg
                                : isDark
                                ? theme.quadrants[cfg.key].cardBg
                                : cfg.baseBgLight,
                            },
                            isSelected && styles.quadrantCardSelected,
                            isSelected && { shadowColor: tokens.selectedBorder },
                          ]}
                        >
                          <View style={styles.quadrantCardTopRow}>
                            <View
                              style={[
                                styles.quadrantIconCircle,
                                {
                                  backgroundColor: isSelected
                                    ? isDark
                                      ? 'rgba(255, 255, 255, 0.16)'
                                      : 'rgba(255, 255, 255, 0.75)'
                                    : isDark
                                    ? `${quadColor}26`
                                    : `${quadColor}1A`,
                                },
                              ]}
                            >
                              <MaterialIcons
                                name={cfg.icon}
                                size={24}
                                color={isSelected ? tokens.selectedIcon : quadColor}
                              />
                            </View>
                          </View>

                          <View style={styles.quadrantTextGroup}>
                            <Text
                              style={[
                                styles.quadrantEnergyText,
                                { color: isSelected ? tokens.selectedText : theme.text },
                              ]}
                            >
                              {cfg.energyText}
                            </Text>
                            <Text
                              style={[
                                styles.quadrantPleasantText,
                                {
                                  color: isSelected
                                    ? tokens.selectedText
                                    : theme.textMuted,
                                  opacity: isSelected ? 0.82 : 1,
                                },
                              ]}
                            >
                              {cfg.pleasantText}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

            {/* STEP 3: Emotion Intensity */}
            {currentStep === 3 && (
              <View style={styles.stepContainer}>
                <Text style={[styles.mainQuestion, { color: theme.text }]}>
                  How intense is this feeling?
                </Text>

                <View style={styles.intensityPillsContainer}>
                  <View style={styles.intensityPillsRow}>
                    {[1, 2, 3, 4, 5].map((num) => {
                      const isSelected = intensity === num;
                      return (
                        <TouchableOpacity
                          key={`int-${num}`}
                          activeOpacity={0.8}
                          onPress={() => {
                            setIntensity(num);
                            Haptics.selectionAsync().catch(() => {});
                          }}
                          style={[
                            styles.intensityPillBtn,
                            {
                              backgroundColor: isSelected
                                ? qTokens.selectedBg
                                : isDark
                                ? theme.surfaceSecondary
                                : '#FFFFFF',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.intensityPillBtnText,
                              {
                                color: isSelected ? qTokens.selectedText : theme.text,
                                fontFamily: isSelected ? fonts.bold : fonts.semiBold,
                              },
                            ]}
                          >
                            {num}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                  <View style={styles.intensityPillsRow}>
                    {[6, 7, 8, 9, 10].map((num) => {
                      const isSelected = intensity === num;
                      return (
                        <TouchableOpacity
                          key={`int-${num}`}
                          activeOpacity={0.8}
                          onPress={() => {
                            setIntensity(num);
                            Haptics.selectionAsync().catch(() => {});
                          }}
                          style={[
                            styles.intensityPillBtn,
                            {
                              backgroundColor: isSelected
                                ? qTokens.selectedBg
                                : isDark
                                ? theme.surfaceSecondary
                                : '#FFFFFF',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.intensityPillBtnText,
                              {
                                color: isSelected ? qTokens.selectedText : theme.text,
                                fontFamily: isSelected ? fonts.bold : fonts.semiBold,
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
              </View>
            )}

            {/* STEP 4: What's Contributing (Screen 5) */}
            {currentStep === 4 && (
              <View style={styles.stepContainer}>
                <Text style={[styles.mainQuestion, { color: theme.text }]}>
                  What's contributing?
                </Text>

                {/* People Section (Single select, dynamic quadrant color, no checkmark) */}
                <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
                  People
                </Text>
                <View style={styles.contributingChipsRow}>
                  {PEOPLE_OPTIONS.map((item) => {
                    const isSelected = selectedPerson === item.name;
                    return (
                      <TouchableOpacity
                        key={`person-${item.name}`}
                        activeOpacity={0.8}
                        onPress={() => togglePerson(item.name)}
                        style={[
                          styles.contributingChip,
                          {
                            backgroundColor: isSelected
                              ? qTokens.selectedBg
                              : isDark
                              ? theme.surfaceSecondary
                              : '#F8F3E8',
                          },
                        ]}
                      >
                        <MaterialIcons
                          name={item.icon}
                          size={18}
                          color={
                            isSelected
                              ? qTokens.selectedIcon
                              : isDark
                              ? theme.textSecondary
                              : '#8B7263'
                          }
                          style={styles.chipIconSpacing}
                        />
                        <Text
                          style={[
                            styles.contributingChipText,
                            {
                              color: isSelected
                                ? qTokens.selectedText
                                : isDark
                                ? theme.text
                                : '#574235',
                              fontFamily: isSelected ? fonts.bold : fonts.semiBold,
                            },
                          ]}
                        >
                          {item.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Place Section (Single select, dynamic quadrant color, no checkmark) */}
                <Text
                  style={[
                    styles.sectionHeading,
                    { color: theme.textSecondary, marginTop: 24 },
                  ]}
                >
                  Place
                </Text>
                <View style={styles.contributingChipsRow}>
                  {PLACE_OPTIONS.map((item) => {
                    const isSelected = selectedPlace === item.name;
                    return (
                      <TouchableOpacity
                        key={`place-${item.name}`}
                        activeOpacity={0.8}
                        onPress={() => togglePlace(item.name)}
                        style={[
                          styles.contributingChip,
                          {
                            backgroundColor: isSelected
                              ? qTokens.selectedBg
                              : isDark
                              ? theme.surfaceSecondary
                              : '#F8F3E8',
                          },
                        ]}
                      >
                        <MaterialIcons
                          name={item.icon}
                          size={18}
                          color={
                            isSelected
                              ? qTokens.selectedIcon
                              : isDark
                              ? theme.textSecondary
                              : '#8B7263'
                          }
                          style={styles.chipIconSpacing}
                        />
                        <Text
                          style={[
                            styles.contributingChipText,
                            {
                              color: isSelected
                                ? qTokens.selectedText
                                : isDark
                                ? theme.text
                                : '#574235',
                              fontFamily: isSelected ? fonts.bold : fonts.semiBold,
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

            {/* STEP 5: Reflection Note (Screen 6) */}
            {currentStep === 5 && (
              <View style={styles.stepContainer}>
                <Text style={[styles.mainQuestion, { color: theme.text }]}>
                  What is causing this emotion?
                </Text>

                <View
                  style={[
                    styles.textareaCard,
                    {
                      backgroundColor: isDark ? theme.surfaceSecondary : '#FFF5E4',
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.textareaInput, { color: theme.text }]}
                    placeholder="Write a reflection note..."
                    placeholderTextColor={theme.textMuted}
                    multiline
                    value={reflectionNote}
                    onChangeText={setReflectionNote}
                    textAlignVertical="top"
                    autoFocus
                  />
                </View>
              </View>
            )}
          </ScrollView>
          )}

          {/* Bottom Fixed Action Button matching Stitch Orange CTA */}
          <View style={[styles.bottomBar, { backgroundColor: theme.background }]}>
            <TouchableOpacity
              onPress={nextStep}
              disabled={!canProceed}
              style={[
                styles.primaryActionBtn,
                {
                  backgroundColor: theme.btnPrimaryBg,
                  opacity: canProceed ? 1 : 0.45,
                },
              ]}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryActionBtnText}>
                {getNextBtnText()}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  stepContainer: {
    flex: 1,
  },
  mainQuestion: {
    fontSize: 26,
    fontFamily: fonts.bold,
    letterSpacing: -0.5,
    lineHeight: 32,
    marginBottom: 24,
  },
  quadrantGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    justifyContent: 'space-between',
  },
  quadrantCard: {
    width: '47.5%',
    height: 154,
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderWidth: 0,
    shadowColor: '#BD8948',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 2,
  },
  quadrantCardSelected: {
    transform: [{ scale: 1.02 }],
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    elevation: 5,
  },
  quadrantCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  quadrantIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quadrantTextGroup: {
    alignItems: 'flex-start',
  },
  quadrantEnergyText: {
    fontSize: 16,
    fontFamily: fonts.bold,
    marginBottom: 2,
    textAlign: 'left',
  },
  quadrantPleasantText: {
    fontSize: 13,
    fontFamily: fonts.regular,
    textAlign: 'left',
  },
  step2Container: {
    flex: 1,
  },
  step2Header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 4,
  },
  step2Scroll: {
    flex: 1,
  },
  step2ScrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 110,
  },
  definitionCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 0,
    minHeight: 124,
    justifyContent: 'flex-start',
    marginBottom: 8,
    shadowColor: '#BD8948',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  defEmotionTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    marginBottom: 6,
  },
  defEmotionBody: {
    fontSize: 14,
    fontFamily: fonts.regular,
    lineHeight: 22,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emotionChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 9999,
    shadowColor: '#BD8948',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 1.5,
  },
  emotionChipText: {
    fontSize: 15,
  },
  sectionHeading: {
    fontSize: 14,
    fontFamily: fonts.bold,
    marginBottom: 12,
  },
  contributingChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  contributingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 9999,
    shadowColor: '#BD8948',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  chipIconSpacing: {
    marginRight: 8,
  },
  contributingChipText: {
    fontSize: 14,
  },
  textareaCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    minHeight: 260,
    elevation: 0,
    shadowOpacity: 0,
  },
  textareaInput: {
    fontSize: 16,
    fontFamily: fonts.regular,
    lineHeight: 24,
    minHeight: 220,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  primaryActionBtn: {
    height: 56,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F57C00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 4,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.bold,
    letterSpacing: 0.2,
  },
  intensityPillsContainer: {
    width: '100%',
    gap: 12,
    marginTop: 12,
  },
  intensityPillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  intensityPillBtn: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    borderWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#BD8948',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  intensityPillBtnText: {
    fontSize: 17,
    fontFamily: fonts.semiBold,
  },
});
