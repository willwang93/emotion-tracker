import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { CheckIn, QuadrantType } from '../types';
import { QUADRANTS, EMOTIONS } from '../constants/moodMeter';
import { QuadrantSelector } from './QuadrantSelector';
import { EmotionPicker } from './EmotionPicker';
import { SomaticSelector } from './SomaticSelector';
import { ContextSelector } from './ContextSelector';
import { startListening, stopListening, isListening } from '../services/speech';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSave: (checkIn: CheckIn) => void;
}

export const MicroCheckInModal: React.FC<Props> = ({ visible, onClose, onSave }) => {
  const [quadrant, setQuadrant] = useState<QuadrantType>('red');
  const [primaryEmotion, setPrimaryEmotion] = useState<string>('Anxious');
  const [intensity, setIntensity] = useState<number>(7);
  const [somaticSensations, setSomaticSensations] = useState<string[]>([]);
  const [contextWho, setContextWho] = useState<string[]>([]);
  const [contextWhat, setContextWhat] = useState<string[]>([]);
  const [contextWhere, setContextWhere] = useState<string>('');
  const [triggerNote, setTriggerNote] = useState<string>('');
  const [urgeNote, setUrgeNote] = useState<string>('');

  // Speech-to-text state
  const [isRecordingSTT, setIsRecordingSTT] = useState<boolean>(false);
  const [sttTargetField, setSttTargetField] = useState<'trigger' | 'urge'>('trigger');
  const [sttStatusMessage, setSttStatusMessage] = useState<string>('');

  const meta = QUADRANTS[quadrant];

  const handleQuadrantChange = (newQuadrant: QuadrantType) => {
    setQuadrant(newQuadrant);
    const firstEmotion = EMOTIONS[newQuadrant][0]?.name || 'Anxious';
    setPrimaryEmotion(firstEmotion);
  };

  const toggleSpeechRecognition = async (target: 'trigger' | 'urge') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isRecordingSTT) {
      stopListening();
      setIsRecordingSTT(false);
      setSttStatusMessage('');
      return;
    }

    setSttTargetField(target);
    setIsRecordingSTT(true);
    setSttStatusMessage('Listening... Speak now');

    const started = await startListening({
      onStart: () => {
        setIsRecordingSTT(true);
        setSttStatusMessage('Listening...');
      },
      onResult: (transcript, isFinal) => {
        if (target === 'trigger') {
          setTriggerNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
        } else {
          setUrgeNote((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        if (isFinal) {
          setIsRecordingSTT(false);
          setSttStatusMessage('Transcribed!');
          setTimeout(() => setSttStatusMessage(''), 1500);
        }
      },
      onError: (err) => {
        setIsRecordingSTT(false);
        setSttStatusMessage(`Dictation note: ${err}`);
        setTimeout(() => setSttStatusMessage(''), 3000);
      },
      onEnd: () => {
        setIsRecordingSTT(false);
        setSttStatusMessage('');
      },
    });

    if (!started) {
      setIsRecordingSTT(false);
    }
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (isRecordingSTT) {
      stopListening();
    }

    const newCheckIn: CheckIn = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      quadrant,
      energyLevel: quadrant === 'red' || quadrant === 'yellow' ? 8 : 3,
      pleasantnessLevel: quadrant === 'yellow' || quadrant === 'green' ? 8 : 3,
      primaryEmotion,
      intensity,
      somaticSensations,
      contextWho,
      contextWhat,
      contextWhere: contextWhere || undefined,
      triggerNote: triggerNote.trim() || undefined,
      urgeNote: urgeNote.trim() || undefined,
      createdAt: Date.now(),
    };

    onSave(newCheckIn);
    resetForm();
    onClose();
  };

  const resetForm = () => {
    setQuadrant('red');
    setPrimaryEmotion('Anxious');
    setIntensity(7);
    setSomaticSensations([]);
    setContextWho([]);
    setContextWhat([]);
    setContextWhere('');
    setTriggerNote('');
    setUrgeNote('');
    setIsRecordingSTT(false);
    setSttStatusMessage('');
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardContainer}
        >
          {/* Top Modal Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <View style={styles.titleContainer}>
              <Text style={styles.headerTitle}>Micro Check-In</Text>
              <Text style={styles.headerSubtitle}>&lt; 30 Seconds</Text>
            </View>
            <View style={styles.headerRightSpacer} />
          </View>

          {/* Scrollable Form Body */}
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 1. Yale Mood Meter Quadrant */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>1. Quadrant</Text>
                <Text style={[styles.quadrantIndicator, { color: meta.textColor }]}>
                  {meta.label}
                </Text>
              </View>
              <QuadrantSelector selectedQuadrant={quadrant} onSelect={handleQuadrantChange} />
            </View>

            {/* 2. Emotion Picker with Instant Definition */}
            <View style={styles.section}>
              <EmotionPicker
                quadrant={quadrant}
                selectedEmotion={primaryEmotion}
                onSelectEmotion={setPrimaryEmotion}
                intensity={intensity}
                onChangeIntensity={setIntensity}
              />
            </View>

            {/* 3. Somatic Sensations */}
            <View style={styles.section}>
              <SomaticSelector
                selectedSensations={somaticSensations}
                onChange={setSomaticSensations}
                accentColor={meta.color}
              />
            </View>

            {/* 4. Context Selector (Wife, Activities, Where) */}
            <View style={styles.section}>
              <ContextSelector
                selectedWho={contextWho}
                onChangeWho={setContextWho}
                selectedWhat={contextWhat}
                onChangeWhat={setContextWhat}
                selectedWhere={contextWhere}
                onChangeWhere={setContextWhere}
                accentColor={meta.color}
              />
            </View>

            {/* 5. Deep Context Prompts with Instant Speech-to-Text */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>5. Notes & Urges (Optional)</Text>

              {/* Trigger Input */}
              <View style={styles.noteFieldWrapper}>
                <View style={styles.noteFieldHeader}>
                  <Text style={styles.noteFieldTitle}>What triggered this?</Text>
                  <TouchableOpacity
                    onPress={() => toggleSpeechRecognition('trigger')}
                    style={[
                      styles.sttBtn,
                      isRecordingSTT && sttTargetField === 'trigger'
                        ? styles.sttBtnActive
                        : { backgroundColor: meta.badgeBg },
                    ]}
                  >
                    {isRecordingSTT && sttTargetField === 'trigger' ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.sttBtnText, { color: meta.textColor }]}>🎤 Dictate (STT)</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <TextInput
                  placeholder="e.g., Sudden meeting request, unexpected message..."
                  placeholderTextColor="#71717A"
                  value={triggerNote}
                  onChangeText={setTriggerNote}
                  multiline
                  style={styles.textInput}
                />
              </View>

              {/* Urge Input */}
              <View style={[styles.noteFieldWrapper, { marginTop: 10 }]}>
                <View style={styles.noteFieldHeader}>
                  <Text style={styles.noteFieldTitle}>What urges or behaviors do you notice?</Text>
                  <TouchableOpacity
                    onPress={() => toggleSpeechRecognition('urge')}
                    style={[
                      styles.sttBtn,
                      isRecordingSTT && sttTargetField === 'urge'
                        ? styles.sttBtnActive
                        : { backgroundColor: meta.badgeBg },
                    ]}
                  >
                    {isRecordingSTT && sttTargetField === 'urge' ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={[styles.sttBtnText, { color: meta.textColor }]}>🎤 Dictate (STT)</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <TextInput
                  placeholder="e.g., Urge to scroll, urge to withdraw, urge to pace..."
                  placeholderTextColor="#71717A"
                  value={urgeNote}
                  onChangeText={setUrgeNote}
                  multiline
                  style={styles.textInput}
                />
              </View>

              {sttStatusMessage ? (
                <Text style={styles.sttStatusText}>{sttStatusMessage}</Text>
              ) : (
                <Text style={styles.privacyNote}>
                  🔒 Voice input is converted straight to text on-device. No audio recordings are saved.
                </Text>
              )}
            </View>
          </ScrollView>

          {/* Sticky Bottom Save Action Bar */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.saveBtn, { backgroundColor: meta.color }]}
              activeOpacity={0.85}
            >
              <Text style={styles.saveBtnText}>Save Check-In</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  cancelText: {
    color: '#A1A1AA',
    fontSize: 14,
    fontWeight: '500',
  },
  titleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    color: '#71717A',
    fontSize: 10,
    fontWeight: '500',
  },
  headerRightSpacer: {
    width: 44,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#D4D4D8',
    marginBottom: 4,
  },
  quadrantIndicator: {
    fontSize: 11,
    fontWeight: '700',
  },
  noteFieldWrapper: {
    backgroundColor: '#18181B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 10,
  },
  noteFieldHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noteFieldTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
    flexShrink: 1,
  },
  sttBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sttBtnActive: {
    backgroundColor: '#EF4444',
  },
  sttBtnText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textInput: {
    minHeight: 48,
    color: '#F4F4F5',
    fontSize: 12,
    lineHeight: 18,
    textAlignVertical: 'top',
  },
  sttStatusText: {
    fontSize: 10,
    color: '#FBBF24',
    marginTop: 6,
    fontWeight: '600',
  },
  privacyNote: {
    fontSize: 9,
    color: '#71717A',
    marginTop: 6,
    lineHeight: 13,
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#27272A',
    backgroundColor: '#09090B',
  },
  saveBtn: {
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
