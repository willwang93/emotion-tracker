import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ReminderSetting } from '../types';
import { useAppTheme } from '../theme/ThemeContext';

interface Props {
  visible: boolean;
  onClose: () => void;
  setting: ReminderSetting;
  onSaveSettings: (setting: ReminderSetting) => void;
}

function parseTimeDisplay(t: string): string {
  const [hStr, mStr] = (t || '09:00').split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

export const ReminderModal: React.FC<Props> = ({
  visible,
  onClose,
  setting,
  onSaveSettings,
}) => {
  const { theme, isDark } = useAppTheme();
  const [times, setTimes] = useState<string[]>(setting.times || []);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Quick picker state
  const [pickerHour, setPickerHour] = useState<number>(9);
  const [pickerMinute, setPickerMinute] = useState<number>(0);
  const [pickerPeriod, setPickerPeriod] = useState<'AM' | 'PM'>('AM');

  const openPickerForIndex = (idx: number) => {
    Haptics.selectionAsync();
    const t = times[idx] || '09:00';
    const [hStr, mStr] = t.split(':');
    const h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    setPickerPeriod(h >= 12 ? 'PM' : 'AM');
    const h12 = h % 12 === 0 ? 12 : h % 12;
    setPickerHour(h12);
    setPickerMinute(m);
    setEditingIndex(idx);
  };

  const handleAddNewTime = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    let hour = 12;
    let newTime = '12:00';
    while (times.includes(newTime) && hour < 23) {
      hour++;
      newTime = `${String(hour).padStart(2, '0')}:00`;
    }
    const updated = [...times, newTime];
    setTimes(updated);
    openPickerForIndex(updated.length - 1);
  };

  const handleDeleteTime = (idx: number) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    const updated = times.filter((_, i) => i !== idx);
    setTimes(updated);
    if (editingIndex === idx) {
      setEditingIndex(null);
    } else if (editingIndex !== null && editingIndex > idx) {
      setEditingIndex(editingIndex - 1);
    }
    onSaveSettings({
      ...setting,
      times: updated,
    });
  };

  const handleSavePickerTime = () => {
    if (editingIndex === null) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    let h24 = pickerHour;
    if (pickerPeriod === 'PM') {
      h24 = pickerHour === 12 ? 12 : pickerHour + 12;
    } else {
      h24 = pickerHour === 12 ? 0 : pickerHour;
    }
    const formatted = `${String(h24).padStart(2, '0')}:${String(pickerMinute).padStart(2, '0')}`;
    const updated = [...times];
    updated[editingIndex] = formatted;
    setTimes(updated);
    setEditingIndex(null);

    onSaveSettings({
      ...setting,
      times: updated,
    });
  };

  const handleDone = () => {
    Haptics.selectionAsync();
    onSaveSettings({
      ...setting,
      times,
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleDone}
    >
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        {/* Top Masthead */}
        <View style={[styles.topBar, { borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.08)' : theme.border }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Preferences</Text>
          <TouchableOpacity
            onPress={handleDone}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.doneBtnText, { color: theme.text }]}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Section: Reflection reminders */}
          <View style={styles.section}>
            <Text style={[styles.sectionHeading, { color: theme.textSubtle }]}>
              REFLECTION REMINDERS
            </Text>
            <Text style={[styles.sectionDesc, { color: theme.textMuted }]}>
              Quiet daily check-in nudges delivered to your lockscreen.
            </Text>

            {/* List of Reminder Time Chips with Delete '✕' Button */}
            <View style={styles.timesContainer}>
              {times.map((t, idx) => {
                const isSelected = editingIndex === idx;
                return (
                  <View
                    key={`${t}-${idx}`}
                    style={[
                      styles.timeChip,
                      {
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : theme.surfaceSecondary,
                        borderColor: isSelected
                          ? theme.text
                          : isDark
                          ? 'rgba(255, 255, 255, 0.08)'
                          : theme.border,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => openPickerForIndex(idx)}
                      style={styles.timeChipLabelBtn}
                    >
                      <Text style={[styles.timeChipText, { color: theme.text }]}>
                        {parseTimeDisplay(t)}
                      </Text>
                    </TouchableOpacity>

                    {/* Delete '✕' Button */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleDeleteTime(idx)}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.deleteChipBtn}
                    >
                      <Text style={[styles.deleteChipText, { color: theme.textMuted }]}>✕</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>

            {/* Inline Time Editor if an item is selected */}
            {editingIndex !== null && (
              <View
                style={[
                  styles.editorCard,
                  {
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : theme.surfaceSecondary,
                    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : theme.border,
                  },
                ]}
              >
                <Text style={[styles.editorTitle, { color: theme.textSubtle }]}>
                  EDIT TIME ({editingIndex + 1})
                </Text>

                <View style={styles.pickerRow}>
                  {/* Hour Selector */}
                  <View style={styles.pickerCol}>
                    <Text style={[styles.pickerColLabel, { color: theme.textSubtle }]}>HOUR</Text>
                    <View style={styles.stepperRow}>
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.selectionAsync();
                          setPickerHour((prev) => (prev === 1 ? 12 : prev - 1));
                        }}
                        style={[styles.stepperBtn, { borderColor: theme.border }]}
                      >
                        <Text style={[styles.stepperBtnText, { color: theme.text }]}>−</Text>
                      </TouchableOpacity>
                      <Text style={[styles.stepperVal, { color: theme.text }]}>
                        {String(pickerHour).padStart(2, '0')}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.selectionAsync();
                          setPickerHour((prev) => (prev === 12 ? 1 : prev + 1));
                        }}
                        style={[styles.stepperBtn, { borderColor: theme.border }]}
                      >
                        <Text style={[styles.stepperBtnText, { color: theme.text }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Minute Selector */}
                  <View style={styles.pickerCol}>
                    <Text style={[styles.pickerColLabel, { color: theme.textSubtle }]}>MINUTE</Text>
                    <View style={styles.stepperRow}>
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.selectionAsync();
                          setPickerMinute((prev) => (prev === 0 ? 45 : prev - 15));
                        }}
                        style={[styles.stepperBtn, { borderColor: theme.border }]}
                      >
                        <Text style={[styles.stepperBtnText, { color: theme.text }]}>−</Text>
                      </TouchableOpacity>
                      <Text style={[styles.stepperVal, { color: theme.text }]}>
                        {String(pickerMinute).padStart(2, '0')}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          Haptics.selectionAsync();
                          setPickerMinute((prev) => (prev === 45 ? 0 : prev + 15));
                        }}
                        style={[styles.stepperBtn, { borderColor: theme.border }]}
                      >
                        <Text style={[styles.stepperBtnText, { color: theme.text }]}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Period Selector */}
                  <View style={styles.pickerCol}>
                    <Text style={[styles.pickerColLabel, { color: theme.textSubtle }]}>PERIOD</Text>
                    <View style={styles.periodToggleRow}>
                      {(['AM', 'PM'] as const).map((p) => {
                        const isPActive = pickerPeriod === p;
                        return (
                          <TouchableOpacity
                            key={p}
                            onPress={() => {
                              Haptics.selectionAsync();
                              setPickerPeriod(p);
                            }}
                            style={[
                              styles.periodBtn,
                              isPActive
                                ? { backgroundColor: theme.text }
                                : { borderColor: theme.border, borderWidth: 1 },
                            ]}
                          >
                            <Text
                              style={[
                                styles.periodBtnText,
                                { color: isPActive ? (isDark ? '#000000' : '#FFFFFF') : theme.textMuted },
                              ]}
                            >
                              {p}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSavePickerTime}
                  style={[styles.saveTimeBtn, { backgroundColor: theme.text }]}
                >
                  <Text style={[styles.saveTimeBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                    Save Time
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* + Add Time Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAddNewTime}
              style={[
                styles.addTimeBtn,
                {
                  borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : theme.border,
                },
              ]}
            >
              <Text style={[styles.addTimeBtnText, { color: theme.text }]}>+ Add Time</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontFamily: 'serif',
    fontSize: 18,
    fontWeight: '400',
    letterSpacing: -0.3,
  },
  doneBtnText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeading: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  sectionDesc: {
    fontFamily: 'serif',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  timesContainer: {
    gap: 8,
    marginBottom: 12,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  timeChipLabelBtn: {
    flex: 1,
  },
  timeChipText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  deleteChipBtn: {
    padding: 6,
  },
  deleteChipText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '600',
  },
  addTimeBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  addTimeBtnText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  editorCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  editorTitle: {
    fontFamily: 'monospace',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
  pickerRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  pickerCol: {
    flex: 1,
  },
  pickerColLabel: {
    fontFamily: 'monospace',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepperBtn: {
    width: 28,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '700',
  },
  stepperVal: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '700',
  },
  periodToggleRow: {
    flexDirection: 'row',
    gap: 4,
  },
  periodBtn: {
    flex: 1,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodBtnText: {
    fontFamily: 'monospace',
    fontSize: 11,
    fontWeight: '700',
  },
  saveTimeBtn: {
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveTimeBtnText: {
    fontFamily: 'monospace',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
});

