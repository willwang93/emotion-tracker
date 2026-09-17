import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
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

  const minuteInputRef = useRef<TextInput>(null);

  // Time editing state
  const [pickerHourText, setPickerHourText] = useState<string>('09');
  const [pickerMinuteText, setPickerMinuteText] = useState<string>('00');
  const [pickerPeriod, setPickerPeriod] = useState<'AM' | 'PM'>('AM');
  const [focusedField, setFocusedField] = useState<'hour' | 'minute' | null>(null);

  // Keep times state synchronized whenever setting prop updates from database
  useEffect(() => {
    if (setting?.times) {
      setTimes(setting.times);
    }
  }, [setting.times]);

  // When modal becomes visible, reset times from latest setting and clear editing
  useEffect(() => {
    if (visible) {
      setTimes(setting.times || []);
      setEditingIndex(null);
      setFocusedField(null);
    }
  }, [visible]);

  const openPickerForIndex = (idx: number) => {
    if (editingIndex === idx) {
      setEditingIndex(null);
      return;
    }
    const t = times[idx] || '09:00';
    const [hStr, mStr] = t.split(':');
    const h = parseInt(hStr, 10) || 0;
    const m = parseInt(mStr, 10) || 0;
    setPickerPeriod(h >= 12 ? 'PM' : 'AM');
    const h12 = h % 12 === 0 ? 12 : h % 12;
    setPickerHourText(String(h12));
    setPickerMinuteText(String(m).padStart(2, '0'));
    setEditingIndex(idx);
  };

  const handleHourChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    setPickerHourText(cleaned);
    const num = parseInt(cleaned, 10);
    if (cleaned.length === 2 || (num >= 2 && num <= 9 && cleaned.length === 1)) {
      minuteInputRef.current?.focus();
    }
  };

  const handleHourBlur = () => {
    setFocusedField(null);
    let num = parseInt(pickerHourText, 10);
    if (isNaN(num) || num < 1) num = 12;
    if (num > 12) num = 12;
    setPickerHourText(String(num));
  };

  const handleMinuteChange = (val: string) => {
    const cleaned = val.replace(/[^0-9]/g, '');
    if (cleaned.length <= 2) {
      setPickerMinuteText(cleaned);
    }
  };

  const handleMinuteBlur = () => {
    setFocusedField(null);
    let num = parseInt(pickerMinuteText, 10);
    if (isNaN(num) || num < 0) num = 0;
    if (num > 59) num = 59;
    setPickerMinuteText(String(num).padStart(2, '0'));
  };

  const handleAddNewTime = () => {
    let hour = 12;
    let newTime = '12:00';
    while (times.includes(newTime) && hour < 23) {
      hour++;
      newTime = `${String(hour).padStart(2, '0')}:00`;
    }
    const updated = [...times, newTime];
    setTimes(updated);
    setPickerPeriod('PM');
    setPickerHourText(String(hour > 12 ? hour - 12 : hour));
    setPickerMinuteText('00');
    setEditingIndex(updated.length - 1);
    onSaveSettings({
      ...setting,
      times: updated,
    });
  };

  const handleDeleteTime = (idx: number) => {
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

    let h = parseInt(pickerHourText, 10);
    if (isNaN(h) || h < 1) h = 12;
    if (h > 12) h = 12;

    let m = parseInt(pickerMinuteText, 10);
    if (isNaN(m) || m < 0) m = 0;
    if (m > 59) m = 59;

    let h24 = h;
    if (pickerPeriod === 'PM') {
      h24 = h === 12 ? 12 : h + 12;
    } else {
      h24 = h === 12 ? 0 : h;
    }

    const formatted = `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
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
    let currentTimes = times;
    if (editingIndex !== null) {
      let h = parseInt(pickerHourText, 10);
      if (isNaN(h) || h < 1) h = 12;
      if (h > 12) h = 12;

      let m = parseInt(pickerMinuteText, 10);
      if (isNaN(m) || m < 0) m = 0;
      if (m > 59) m = 59;

      let h24 = h;
      if (pickerPeriod === 'PM') {
        h24 = h === 12 ? 12 : h + 12;
      } else {
        h24 = h === 12 ? 0 : h;
      }

      const formatted = `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      currentTimes = [...times];
      currentTimes[editingIndex] = formatted;
    }
    onSaveSettings({
      ...setting,
      times: currentTimes,
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
        <View style={styles.topBar}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>Settings</Text>
          <TouchableOpacity
            onPress={handleDone}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.doneBtnText, { color: theme.textMuted }]}>Done</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Settings Card */}
          <View
            style={[
              styles.settingsCard,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              },
            ]}
          >
            {/* Master Toggle Row */}
            <View style={styles.masterToggleRow}>
              <Text style={[styles.masterToggleText, { color: theme.text }]}>
                Daily Reminders
              </Text>
              <Switch
                value={setting.enabled}
                onValueChange={(val) => onSaveSettings({ ...setting, enabled: val })}
                thumbColor={setting.enabled ? '#F59E0B' : undefined}
                trackColor={{ false: theme.border, true: 'rgba(245, 158, 11, 0.4)' }}
              />
            </View>

            <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

            {/* List of Reminder Time Rows */}
            <View style={styles.timesContainer}>
              {times.map((t, idx) => {
                const isSelected = editingIndex === idx;
                return (
                  <View key={`${t}-${idx}`} style={styles.reminderRowWrapper}>
                    <View style={styles.reminderRow}>
                      <Text style={[styles.reminderLabel, { color: theme.textSecondary }]}>
                        Reminder {idx + 1}
                      </Text>

                      <View style={styles.reminderRightActions}>
                        <TouchableOpacity
                          activeOpacity={0.75}
                          onPress={() => openPickerForIndex(idx)}
                          style={[
                            styles.timePillBtn,
                            {
                              backgroundColor: theme.chipBg,
                              borderColor: isSelected
                                ? theme.text
                                : theme.border,
                            },
                          ]}
                        >
                          <Text style={[styles.timePillText, { color: theme.text }]}>
                            {parseTimeDisplay(t)}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleDeleteTime(idx)}
                          hitSlop={{ top: 12, bottom: 12, left: 8, right: 12 }}
                          style={styles.deleteBtn}
                        >
                          <Text style={[styles.deleteBtnText, { color: theme.textMuted }]}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Inline Time Editor if this item is selected */}
                    {isSelected && (
                      <View
                        style={[
                          styles.editorCard,
                          {
                            backgroundColor: theme.surfaceElevated,
                            borderColor: theme.border,
                          },
                        ]}
                      >
                        <View style={styles.editorRow}>
                          {/* Hour Input */}
                          <View style={styles.inputCol}>
                            <Text style={[styles.pickerColLabel, { color: theme.textMuted }]}>HOUR</Text>
                            <TextInput
                              style={[
                                styles.directTimeInput,
                                {
                                  color: theme.text,
                                  backgroundColor: theme.surface,
                                  borderColor:
                                    focusedField === 'hour'
                                      ? theme.text
                                      : theme.border,
                                  borderWidth: focusedField === 'hour' ? 2 : 1,
                                },
                              ]}
                              value={pickerHourText}
                              onChangeText={handleHourChange}
                              onFocus={() => setFocusedField('hour')}
                              onBlur={handleHourBlur}
                              keyboardType="number-pad"
                              maxLength={2}
                              selectTextOnFocus
                              returnKeyType="next"
                              onSubmitEditing={() => minuteInputRef.current?.focus()}
                            />
                          </View>

                          <Text style={[styles.colonSeparator, { color: theme.textMuted }]}>:</Text>

                          {/* Minute Input */}
                          <View style={styles.inputCol}>
                            <Text style={[styles.pickerColLabel, { color: theme.textMuted }]}>MIN</Text>
                            <TextInput
                              ref={minuteInputRef}
                              style={[
                                styles.directTimeInput,
                                {
                                  color: theme.text,
                                  backgroundColor: theme.surface,
                                  borderColor:
                                    focusedField === 'minute'
                                      ? theme.text
                                      : theme.border,
                                  borderWidth: focusedField === 'minute' ? 2 : 1,
                                },
                              ]}
                              value={pickerMinuteText}
                              onChangeText={handleMinuteChange}
                              onFocus={() => setFocusedField('minute')}
                              onBlur={handleMinuteBlur}
                              keyboardType="number-pad"
                              maxLength={2}
                              selectTextOnFocus
                              returnKeyType="done"
                              onSubmitEditing={handleSavePickerTime}
                            />
                          </View>

                          {/* Period Selector */}
                          <View style={styles.periodCol}>
                            <Text style={[styles.pickerColLabel, { color: theme.textMuted }]}>PERIOD</Text>
                            <View style={styles.periodToggleRow}>
                              {(['AM', 'PM'] as const).map((p) => {
                                const isPActive = pickerPeriod === p;
                                return (
                                  <TouchableOpacity
                                    key={p}
                                    onPress={() => setPickerPeriod(p)}
                                    style={[
                                      styles.periodBtn,
                                      isPActive
                                        ? { backgroundColor: theme.text }
                                        : {
                                            borderColor: theme.border,
                                            borderWidth: 1,
                                            backgroundColor: theme.surface,
                                          },
                                    ]}
                                  >
                                    <Text
                                      style={[
                                        styles.periodBtnText,
                                        {
                                          color: isPActive
                                            ? isDark
                                              ? '#000000'
                                              : '#FFFFFF'
                                            : theme.textMuted,
                                        },
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

                        {/* Actions */}
                        <View style={styles.editorActionRow}>
                          <TouchableOpacity
                            onPress={() => setEditingIndex(null)}
                            style={[
                              styles.cancelEditorBtn,
                              {
                                borderColor: theme.border,
                              },
                            ]}
                          >
                            <Text style={[styles.cancelEditorBtnText, { color: theme.textMuted }]}>
                              Cancel
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={handleSavePickerTime}
                            style={[styles.saveTimeBtn, { backgroundColor: theme.text }]}
                          >
                            <Text style={[styles.saveTimeBtnText, { color: isDark ? '#000000' : '#FFFFFF' }]}>
                              Save Time
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </View>
                );
              })}
            </View>

            <View style={[styles.cardDivider, { backgroundColor: theme.border }]} />

            {/* + Add reminder Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleAddNewTime}
              style={[
                styles.addTimeBtn,
                {
                  borderColor: theme.borderFocus,
                },
              ]}
            >
              <Text style={[styles.addTimeBtnText, { color: theme.textMuted }]}>+ Add reminder</Text>
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
    paddingHorizontal: 24,
  },
  modalTitle: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '400',
    letterSpacing: -0.3,
  },
  doneBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  settingsCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  masterToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  masterToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardDivider: {
    height: 1,
    marginVertical: 14,
  },
  timesContainer: {
    gap: 12,
  },
  reminderRowWrapper: {
    gap: 8,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reminderLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  reminderRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timePillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  timePillText: {
    fontSize: 12,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  deleteBtn: {
    padding: 6,
  },
  deleteBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  editorCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 4,
    marginBottom: 6,
  },
  editorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  inputCol: {
    width: 56,
  },
  pickerColLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 4,
    textAlign: 'center',
  },
  directTimeInput: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  colonSeparator: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 14,
  },
  periodCol: {
    flex: 1,
    marginLeft: 4,
  },
  periodToggleRow: {
    flexDirection: 'row',
    gap: 4,
  },
  periodBtn: {
    flex: 1,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  periodBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  editorActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cancelEditorBtn: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelEditorBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
  saveTimeBtn: {
    flex: 1.5,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveTimeBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  addTimeBtn: {
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTimeBtnText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

