import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  SafeAreaView,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ReminderSetting } from '../types';

interface Props {
  visible: boolean;
  onClose: () => void;
  setting: ReminderSetting;
  onSaveSettings: (setting: ReminderSetting) => void;
}

export const ReminderModal: React.FC<Props> = ({
  visible,
  onClose,
  setting,
  onSaveSettings,
}) => {
  const [enabled, setEnabled] = useState(setting.enabled);
  const [times, setTimes] = useState<string[]>(setting.times);
  const [newTimeInput, setNewTimeInput] = useState('');

  const handleToggleEnabled = (val: boolean) => {
    Haptics.selectionAsync();
    setEnabled(val);
  };

  const handleRemoveTime = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const updated = times.filter((_, i) => i !== index);
    setTimes(updated);
  };

  const handleAddTime = () => {
    const trimmed = newTimeInput.trim();
    // Validate HH:MM
    const match = trimmed.match(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/);
    if (!match) {
      Alert.alert('Invalid Time', 'Please enter a valid time in 24-hour HH:MM format (e.g., 08:30 or 19:45).');
      return;
    }

    if (times.includes(trimmed)) {
      Alert.alert('Already Exists', 'This reminder time is already configured.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setTimes([...times, trimmed].sort());
    setNewTimeInput('');
  };

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSaveSettings({
      id: 1,
      enabled,
      times,
    });
    onClose();
  };

  const getTimeLabel = (timeStr: string) => {
    const [hStr, mStr] = timeStr.split(':');
    const h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10);
    const date = new Date();
    date.setHours(h, m, 0);
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reminders & Nudges</Text>
          <TouchableOpacity onPress={handleSave} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.saveHeaderBtn}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent}>
          {/* Main Toggle Card */}
          <View style={styles.card}>
            <View style={styles.toggleRow}>
              <View style={styles.toggleTextContainer}>
                <Text style={styles.cardTitle}>Daily Check-In Nudges</Text>
                <Text style={styles.cardSubtitle}>
                  Receive gentle, scheduled notifications on your device
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={handleToggleEnabled}
                trackColor={{ false: '#27272A', true: '#EF4444' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>

          {/* Schedule List */}
          <View style={styles.scheduleSection}>
            <Text style={styles.sectionHeading}>Scheduled Reminder Times</Text>

            {times.map((t, idx) => (
              <View key={t} style={styles.timeRow}>
                <View>
                  <Text style={styles.timeLabel}>{getTimeLabel(t)}</Text>
                  <Text style={styles.militaryTime}>({t})</Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveTime(idx)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteBtnText}>Remove</Text>
                </TouchableOpacity>
              </View>
            ))}

            {/* Add New Time Input */}
            <View style={styles.addTimeRow}>
              <TextInput
                placeholder="HH:MM (e.g. 15:30)"
                placeholderTextColor="#71717A"
                value={newTimeInput}
                onChangeText={setNewTimeInput}
                style={styles.timeInput}
                keyboardType="numbers-and-punctuation"
              />
              <TouchableOpacity onPress={handleAddTime} style={styles.addTimeBtn}>
                <Text style={styles.addTimeBtnText}>+ Add Time</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Privacy & Storage Callout */}
          <View style={styles.privacyCard}>
            <Text style={styles.privacyHeading}>🔒 100% Local & Private</Text>
            <Text style={styles.privacyText}>
              All notification triggers run natively on your Google Pixel 5 using local Android alarms. No data or schedules are transmitted to external servers.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090B',
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
  },
  headerTitle: {
    color: '#F4F4F5',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  saveHeaderBtn: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: 16,
  },
  card: {
    backgroundColor: '#18181B',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 14,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleTextContainer: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '700',
  },
  cardSubtitle: {
    color: '#71717A',
    fontSize: 11,
    marginTop: 2,
  },
  scheduleSection: {
    marginBottom: 16,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#A1A1AA',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#18181B',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 8,
  },
  timeLabel: {
    color: '#F4F4F5',
    fontSize: 14,
    fontWeight: '700',
  },
  militaryTime: {
    color: '#71717A',
    fontSize: 10,
    fontFamily: 'monospace',
  },
  deleteBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  deleteBtnText: {
    color: '#F87171',
    fontSize: 11,
    fontWeight: '600',
  },
  addTimeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  timeInput: {
    flex: 1,
    height: 38,
    backgroundColor: '#18181B',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#27272A',
    paddingHorizontal: 12,
    color: '#F4F4F5',
    fontSize: 12,
  },
  addTimeBtn: {
    height: 38,
    paddingHorizontal: 14,
    backgroundColor: '#27272A',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTimeBtnText: {
    color: '#F4F4F5',
    fontSize: 12,
    fontWeight: '700',
  },
  privacyCard: {
    backgroundColor: 'rgba(24, 24, 27, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#27272A',
    padding: 12,
  },
  privacyHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A1A1AA',
    marginBottom: 4,
  },
  privacyText: {
    fontSize: 10,
    lineHeight: 15,
    color: '#71717A',
  },
});
