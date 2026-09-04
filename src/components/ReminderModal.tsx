import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { ReminderSetting } from '../types';

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 3;
const WHEEL_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

const HOURS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
const PERIODS = ['AM', 'PM'];

function parse24to12(timeStr: string) {
  const [hStr, mStr] = (timeStr || '09:00').split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return {
    hour: String(h12).padStart(2, '0'),
    minute: String(m).padStart(2, '0'),
    period,
  };
}

function format12to24(hour12Str: string, minuteStr: string, period: string) {
  const h12 = parseInt(hour12Str, 10);
  const m = parseInt(minuteStr, 10);
  let h24 = h12;
  if (period === 'PM') {
    h24 = h12 === 12 ? 12 : h12 + 12;
  } else {
    h24 = h12 === 12 ? 0 : h12;
  }
  return `${String(h24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

interface WheelColumnProps {
  items: string[];
  selectedValue: string;
  onValueChange: (val: string) => void;
  flex?: number;
}

const WheelColumn: React.FC<WheelColumnProps> = ({
  items,
  selectedValue,
  onValueChange,
  flex = 1,
}) => {
  const scrollRef = useRef<ScrollView>(null);
  const selectedIndex = Math.max(0, items.indexOf(selectedValue));

  useEffect(() => {
    scrollRef.current?.scrollTo({
      y: selectedIndex * ITEM_HEIGHT,
      animated: false,
    });
  }, []);

  const handleMomentumScrollEnd = (e: any) => {
    const offsetY = e.nativeEvent.contentOffset.y;
    const index = Math.max(0, Math.min(items.length - 1, Math.round(offsetY / ITEM_HEIGHT)));
    const val = items[index];
    if (val !== selectedValue) {
      Haptics.selectionAsync();
      onValueChange(val);
    }
  };

  return (
    <View style={[styles.wheelColumn, { flex }]}>
      <ScrollView
        ref={scrollRef}
        nestedScrollEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumScrollEnd}
        contentContainerStyle={styles.wheelContent}
      >
        {items.map((item, idx) => {
          const isSelected = item === selectedValue;
          return (
            <TouchableOpacity
              key={item}
              style={styles.wheelItem}
              onPress={() => {
                Haptics.selectionAsync();
                scrollRef.current?.scrollTo({ y: idx * ITEM_HEIGHT, animated: true });
                onValueChange(item);
              }}
            >
              <Text style={[styles.wheelItemText, isSelected && styles.wheelItemTextSelected]}>
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

interface SlotMachinePickerProps {
  timeStr: string;
  onChangeTime: (newTimeStr: string) => void;
  onDone: () => void;
}

const SlotMachinePicker: React.FC<SlotMachinePickerProps> = ({
  timeStr,
  onChangeTime,
  onDone,
}) => {
  const parsed = parse24to12(timeStr);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);
  const [period, setPeriod] = useState(parsed.period);

  const updateHour = (newHour: string) => {
    setHour(newHour);
    onChangeTime(format12to24(newHour, minute, period));
  };

  const updateMinute = (newMin: string) => {
    setMinute(newMin);
    onChangeTime(format12to24(hour, newMin, period));
  };

  const updatePeriod = (newPeriod: string) => {
    setPeriod(newPeriod);
    onChangeTime(format12to24(hour, minute, newPeriod));
  };

  return (
    <View style={styles.slotMachineCard}>
      <View style={styles.slotHeaderRow}>
        <Text style={styles.slotHeaderTitle}>Scroll Hour & Minute</Text>
        <TouchableOpacity onPress={onDone} style={styles.slotDoneBtn}>
          <Text style={styles.slotDoneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.slotMachineWrapper}>
        {/* Middle highlight band */}
        <View style={styles.slotHighlightBand} pointerEvents="none" />

        <WheelColumn
          items={HOURS}
          selectedValue={hour}
          onValueChange={updateHour}
        />
        <Text style={styles.colonSeparator}>:</Text>
        <WheelColumn
          items={MINUTES}
          selectedValue={minute}
          onValueChange={updateMinute}
        />
        <WheelColumn
          items={PERIODS}
          selectedValue={period}
          onValueChange={updatePeriod}
        />
      </View>
    </View>
  );
};

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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleToggleEnabled = (val: boolean) => {
    Haptics.selectionAsync();
    setEnabled(val);
  };

  const handleToggleEdit = (index: number) => {
    Haptics.selectionAsync();
    setEditingIndex((prev) => (prev === index ? null : index));
  };

  const handleUpdateTimeAtIndex = (index: number, newTime: string) => {
    const updated = [...times];
    updated[index] = newTime;
    setTimes(updated);
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
            <Text style={styles.sectionHeading}>Tap Any Time Card to Edit</Text>

            {times.map((t, idx) => {
              const isEditing = editingIndex === idx;
              return (
                <View key={`${idx}-${t}`} style={styles.timeCardContainer}>
                  <TouchableOpacity
                    activeOpacity={0.75}
                    onPress={() => handleToggleEdit(idx)}
                    style={[
                      styles.timeRow,
                      isEditing && styles.timeRowActive,
                    ]}
                  >
                    <View>
                      <Text style={[styles.timeLabel, isEditing && styles.timeLabelActive]}>
                        {getTimeLabel(t)}
                      </Text>
                      <Text style={styles.militaryTime}>({t})</Text>
                    </View>
                    <Text style={styles.editHintText}>
                      {isEditing ? 'Tap to close ▴' : 'Edit ▾'}
                    </Text>
                  </TouchableOpacity>

                  {/* Slot Machine Wheel Picker for this item */}
                  {isEditing && (
                    <SlotMachinePicker
                      timeStr={t}
                      onChangeTime={(newTime) => handleUpdateTimeAtIndex(idx, newTime)}
                      onDone={() => setEditingIndex(null)}
                    />
                  )}
                </View>
              );
            })}
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
    marginBottom: 10,
  },
  timeCardContainer: {
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
    paddingVertical: 12,
  },
  timeRowActive: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.06)',
  },
  timeLabel: {
    color: '#F4F4F5',
    fontSize: 16,
    fontWeight: '800',
  },
  timeLabelActive: {
    color: '#F87171',
  },
  militaryTime: {
    color: '#71717A',
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  editHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A1A1AA',
  },
  slotMachineCard: {
    backgroundColor: '#111113',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderTopWidth: 0,
    borderColor: '#27272A',
    padding: 12,
  },
  slotHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  slotHeaderTitle: {
    fontSize: 11,
    color: '#A1A1AA',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  slotDoneBtn: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  slotDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  slotMachineWrapper: {
    height: WHEEL_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  slotHighlightBand: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  colonSeparator: {
    fontSize: 22,
    fontWeight: '800',
    color: '#A1A1AA',
    marginHorizontal: 8,
  },
  wheelColumn: {
    height: WHEEL_HEIGHT,
  },
  wheelContent: {
    paddingVertical: ITEM_HEIGHT,
    alignItems: 'center',
  },
  wheelItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  wheelItemText: {
    fontSize: 16,
    color: '#71717A',
    fontWeight: '600',
  },
  wheelItemTextSelected: {
    fontSize: 20,
    color: '#F4F4F5',
    fontWeight: '800',
  },
});
