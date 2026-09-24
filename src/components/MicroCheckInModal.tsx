import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  BackHandler,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { CheckIn, QuadrantType } from '../types';
import { EMOTIONS } from '../constants/moodMeter';
import { useAppTheme } from '../theme/ThemeContext';
import { fonts } from '../theme';
import { AppText } from './ui/AppText';
import { AppChip } from './ui/AppChip';
import { AppButton } from './ui/AppButton';

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

const QUADRANT_CONFIGS: {
  key: QuadrantType;
  icon: keyof typeof MaterialIcons.glyphMap;
  energyText: string;
  pleasantText: string;
  image: any;
  imageScale?: number;
  blobBorderRadius: {
    borderTopLeftRadius: number;
    borderTopRightRadius: number;
    borderBottomRightRadius: number;
    borderBottomLeftRadius: number;
  };
}[] = [
  {
    key: 'red',
    icon: 'air',
    energyText: 'High Energy',
    pleasantText: 'Unpleasant',
    image: require('../../assets/blobs/blob_high_unpleasant.png'),
    imageScale: 1.18,
    blobBorderRadius: {
      borderTopLeftRadius: 65,
      borderTopRightRadius: 75,
      borderBottomRightRadius: 85,
      borderBottomLeftRadius: 55,
    },
  },
  {
    key: 'yellow',
    icon: 'wb-sunny',
    energyText: 'High Energy',
    pleasantText: 'Pleasant',
    image: require('../../assets/blobs/blob_high_pleasant.png'),
    imageScale: 1.48,
    blobBorderRadius: {
      borderTopLeftRadius: 80,
      borderTopRightRadius: 60,
      borderBottomRightRadius: 62,
      borderBottomLeftRadius: 75,
    },
  },
  {
    key: 'blue',
    icon: 'bedtime',
    energyText: 'Low Energy',
    pleasantText: 'Unpleasant',
    image: require('../../assets/blobs/blob_low_unpleasant.png'),
    imageScale: 1.28,
    blobBorderRadius: {
      borderTopLeftRadius: 62,
      borderTopRightRadius: 78,
      borderBottomRightRadius: 72,
      borderBottomLeftRadius: 68,
    },
  },
  {
    key: 'green',
    icon: 'spa',
    energyText: 'Low Energy',
    pleasantText: 'Pleasant',
    image: require('../../assets/blobs/blob_low_pleasant.png'),
    imageScale: 1.35,
    blobBorderRadius: {
      borderTopLeftRadius: 72,
      borderTopRightRadius: 68,
      borderBottomRightRadius: 80,
      borderBottomLeftRadius: 60,
    },
  },
];

export const MicroCheckInModal: React.FC<Props> = ({
  visible,
  onClose,
  onSave,
  initialCheckIn,
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
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

  const qToken = quadrant ? theme.quadrants[quadrant] : theme.quadrants.green;
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
                <AppText variant="heading1" color="primary" style={[styles.mainQuestion, { marginBottom: 14 }]}>
                  Which word fits best?
                </AppText>

                {/* Definition Card stuck to top only when a word is selected */}
                {primaryEmotion ? (
                  <View
                    style={[
                      styles.definitionCard,
                      {
                        backgroundColor: theme.surface,
                        shadowColor: theme.shadowColor,
                      },
                    ]}
                  >
                    <AppText variant="heading2" color="primary" style={styles.defEmotionTitle}>
                      {primaryEmotion}
                    </AppText>
                    <AppText variant="body" color="secondary" style={styles.defEmotionBody}>
                      {currentDefinition}
                    </AppText>
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
                  {currentEmotionList.map((item) => (
                    <AppChip
                      key={item.id}
                      label={item.name}
                      selected={item.name === primaryEmotion}
                      quadrant={quadrant}
                      onPress={() => setPrimaryEmotion(item.name)}
                    />
                  ))}
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
                  <AppText variant="heading1" color="primary" style={styles.mainQuestion}>
                    How are you feeling right now?
                  </AppText>

                  <View style={styles.quadrantGrid}>
                    {QUADRANT_CONFIGS.map((cfg) => {
                      const isSelected = quadrant === cfg.key;
                      const borderColor = theme.quadrants[cfg.key].color;
                      const pleasantColor = theme.quadrants[cfg.key].textColor;

                      return (
                        <TouchableOpacity
                          key={cfg.key}
                          activeOpacity={0.88}
                          onPress={() => {
                            handlePickQuadrant(cfg.key);
                          }}
                          style={styles.blobCardWrapper}
                        >
                          {/* Illustration Frame Container (Blob background removed) */}
                          <View
                            style={[
                              styles.blobFrame,
                              cfg.blobBorderRadius,
                              {
                                backgroundColor: 'transparent',
                                borderColor: isSelected ? borderColor : 'transparent',
                                borderWidth: isSelected ? 2.5 : 0,
                              },
                              isSelected && styles.blobFrameSelected,
                            ]}
                          >
                            {/* Illustration Image */}
                            <Image
                              source={cfg.image}
                              style={[
                                styles.blobIllustration,
                                { transform: [{ scale: cfg.imageScale || 1.15 }] },
                              ]}
                              resizeMode="contain"
                            />
                          </View>

                          {/* Labels: Pleasant indicator and Energy */}
                          <View style={styles.blobLabelsContainer}>
                            <AppText
                              variant="label"
                              bold
                              color={pleasantColor}
                              style={styles.blobPleasantText}
                            >
                              {cfg.pleasantText}
                            </AppText>
                            <AppText
                              variant="heading2"
                              color="primary"
                              style={styles.blobEnergyText}
                            >
                              {cfg.energyText}
                            </AppText>
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
                <AppText variant="heading1" color="primary" style={styles.mainQuestion}>
                  How intense is this feeling?
                </AppText>

                <View style={styles.intensityPillsContainer}>
                  {[[1, 2, 3, 4, 5], [6, 7, 8, 9, 10]].map((row, rowIdx) => (
                    <View key={`intensity-row-${rowIdx}`} style={styles.intensityPillsRow}>
                      {row.map((num) => {
                        const isSelected = intensity === num;
                        return (
                          <TouchableOpacity
                            key={`int-${num}`}
                            activeOpacity={0.8}
                            onPress={() => setIntensity(num)}
                            style={[
                              styles.intensityPillBtn,
                              {
                                backgroundColor: isSelected ? qToken.selectedChipBg : theme.surface,
                                shadowColor: theme.shadowColor,
                              },
                            ]}
                          >
                            <AppText
                              variant="body"
                              bold={isSelected}
                              color={isSelected ? qToken.selectedChipText : theme.text}
                              style={styles.intensityPillBtnText}
                            >
                              {num}
                            </AppText>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* STEP 4: What's Contributing (Screen 5) */}
            {currentStep === 4 && (
              <View style={styles.stepContainer}>
                <AppText variant="heading1" color="primary" style={styles.mainQuestion}>
                  What's contributing?
                </AppText>

                {/* People Section (Single select, dynamic quadrant color, no checkmark) */}
                <AppText variant="caption" bold color="secondary" style={styles.sectionHeading}>
                  People
                </AppText>
                <View style={styles.contributingChipsRow}>
                  {PEOPLE_OPTIONS.map((item) => (
                    <AppChip
                      key={`person-${item.name}`}
                      label={item.name}
                      selected={selectedPerson === item.name}
                      quadrant={quadrant}
                      onPress={() => togglePerson(item.name)}
                      icon={
                        <MaterialIcons
                          name={item.icon}
                          size={18}
                          color={selectedPerson === item.name ? qToken.selectedIcon : theme.textSecondary}
                        />
                      }
                    />
                  ))}
                </View>

                {/* Place Section (Single select, dynamic quadrant color, no checkmark) */}
                <AppText
                  variant="caption"
                  bold
                  color="secondary"
                  style={[styles.sectionHeading, { marginTop: 24 }]}
                >
                  Place
                </AppText>
                <View style={styles.contributingChipsRow}>
                  {PLACE_OPTIONS.map((item) => (
                    <AppChip
                      key={`place-${item.name}`}
                      label={item.name}
                      selected={selectedPlace === item.name}
                      quadrant={quadrant}
                      onPress={() => togglePlace(item.name)}
                      icon={
                        <MaterialIcons
                          name={item.icon}
                          size={18}
                          color={selectedPlace === item.name ? qToken.selectedIcon : theme.textSecondary}
                        />
                      }
                    />
                  ))}
                </View>
              </View>
            )}

            {/* STEP 5: Reflection Note (Screen 6) */}
            {currentStep === 5 && (
              <View style={styles.stepContainer}>
                <AppText variant="heading1" color="primary" style={styles.mainQuestion}>
                  What is causing this emotion?
                </AppText>

                <View
                  style={[
                    styles.textareaCard,
                    {
                      backgroundColor: theme.inputBg,
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

          {/* Bottom Fixed Action Button using AppButton */}
          <View style={[styles.bottomBar, { backgroundColor: theme.background }]}>
            <AppButton
              title={getNextBtnText()}
              variant="primary"
              disabled={!canProceed}
              onPress={nextStep}
            />
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
  blobCardWrapper: {
    width: '47%',
    alignItems: 'center',
    marginBottom: 8,
  },
  blobFrame: {
    width: 144,
    height: 144,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    marginBottom: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  blobFrameSelected: {
    transform: [{ scale: 1.05 }],
  },
  blobIllustration: {
    width: '100%',
    height: '100%',
  },
  blobLabelsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  blobPleasantText: {
    letterSpacing: 0.8,
    marginBottom: 2,
    textAlign: 'center',
  },
  blobEnergyText: {
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 2,
  },
  defEmotionTitle: {
    marginBottom: 6,
  },
  defEmotionBody: {
    lineHeight: 22,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  sectionHeading: {
    marginBottom: 12,
  },
  contributingChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  intensityPillBtnText: {
    fontSize: 17,
  },
});
