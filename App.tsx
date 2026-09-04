import React, { useEffect, useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import { CheckIn, ReminderSetting } from './src/types';
import {
  getDatabase,
  getCheckInsForDay,
  insertCheckIn,
  updateCheckIn,
  deleteCheckIn,
  getReminderSettings,
  updateReminderSettings,
} from './src/services/db';
import { scheduleReminders } from './src/services/notifications';
import { TimelineCard } from './src/components/TimelineCard';
import { MicroCheckInModal } from './src/components/MicroCheckInModal';
import { ReminderModal } from './src/components/ReminderModal';

export default function App() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isCheckInModalVisible, setIsCheckInModalVisible] = useState<boolean>(false);
  const [editingCheckIn, setEditingCheckIn] = useState<CheckIn | null>(null);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState<boolean>(false);
  const [reminderSetting, setReminderSetting] = useState<ReminderSetting>({
    id: 1,
    enabled: true,
    times: ['09:00', '13:00', '18:00', '21:30'],
  });

  const loadData = useCallback(async (date: Date) => {
    try {
      await getDatabase();
      const entries = await getCheckInsForDay(date);
      setCheckIns(entries);
      const settings = await getReminderSettings();
      setReminderSetting(settings);
    } catch (err) {
      console.error('Failed to load check-ins:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData(selectedDate);
  }, [loadData, selectedDate]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadData(selectedDate);
  };

  const handleSaveCheckIn = async (entry: CheckIn) => {
    try {
      if (editingCheckIn) {
        await updateCheckIn(entry);
        setEditingCheckIn(null);
        await loadData(selectedDate);
      } else {
        await insertCheckIn(entry);
        // Reload today's check-ins
        const today = new Date();
        setSelectedDate(today);
        await loadData(today);
      }
    } catch (err) {
      console.error('Failed to save check-in:', err);
    }
  };

  const handleEditCheckIn = (checkIn: CheckIn) => {
    Haptics.selectionAsync();
    setEditingCheckIn(checkIn);
    setIsCheckInModalVisible(true);
  };

  const handleCloseCheckInModal = () => {
    setIsCheckInModalVisible(false);
    setEditingCheckIn(null);
  };

  const handleOpenNewCheckIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEditingCheckIn(null);
    setIsCheckInModalVisible(true);
  };

  const handleDeleteCheckIn = async (id: string) => {
    try {
      await deleteCheckIn(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCheckIns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Failed to delete check-in:', err);
    }
  };

  const handleSaveSettings = async (newSettings: ReminderSetting) => {
    try {
      await updateReminderSettings(newSettings);
      setReminderSetting(newSettings);
      await scheduleReminders(newSettings);
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  };

  const changeDateBy = (days: number) => {
    Haptics.selectionAsync();
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday =
    selectedDate.toDateString() === new Date().toDateString();

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />

      {/* Main Top Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.appTitleRow}>
            <Text style={styles.appTitle}>Emotion Tracker</Text>
            <View style={styles.v1Badge}>
              <Text style={styles.v1BadgeText}>V1</Text>
            </View>
          </View>
          <Text style={styles.appSubtitle}>Yale Mood Meter • Micro Check-In</Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsSettingsModalVisible(true)}
          style={styles.settingsBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.settingsBtnIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      {/* Date Switcher Bar */}
      <View style={styles.dateBar}>
        <TouchableOpacity onPress={() => changeDateBy(-1)} style={styles.dateNavBtn}>
          <Text style={styles.dateNavText}>‹</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSelectedDate(new Date())}
          activeOpacity={0.7}
          style={styles.dateCenterBtn}
        >
          <Text style={styles.dateTitle}>{isToday ? `Today, ${formattedDate}` : formattedDate}</Text>
          {!isToday && <Text style={styles.jumpTodayText}>Tap to jump to Today</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => changeDateBy(1)}
          disabled={isToday}
          style={[styles.dateNavBtn, isToday && styles.dateNavBtnDisabled]}
        >
          <Text style={[styles.dateNavText, isToday && styles.dateNavTextDisabled]}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Timeline Scrollable View */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#EF4444" />
          <Text style={styles.loaderText}>Loading check-ins...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.feedScroll}
          contentContainerStyle={styles.feedContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor="#EF4444"
              colors={['#EF4444']}
            />
          }
        >
          {checkIns.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={styles.emptyStateEmoji}>🌱</Text>
              <Text style={styles.emptyStateTitle}>No check-ins yet for this day</Text>
              <Text style={styles.emptyStateSubtitle}>
                Take 20 seconds to log where you are on the Mood Meter right now.
              </Text>
              <TouchableOpacity
                onPress={handleOpenNewCheckIn}
                style={styles.emptyStateBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.emptyStateBtnText}>+ Start Quick Check-In</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.timelineList}>
              <View style={styles.timelineCountRow}>
                <Text style={styles.timelineCountText}>
                  {checkIns.length} {checkIns.length === 1 ? 'Check-In' : 'Check-Ins'} logged
                </Text>
              </View>
              {checkIns.map((item) => (
                <TimelineCard
                  key={item.id}
                  checkIn={item}
                  onEdit={handleEditCheckIn}
                  onDelete={handleDeleteCheckIn}
                />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Floating Bottom Action for Google Pixel 5 Ergonomics */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handleOpenNewCheckIn}
          style={styles.fabBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.fabPlus}>+</Text>
          <Text style={styles.fabText}>Quick Check-In</Text>
        </TouchableOpacity>
      </View>

      {/* Micro Check-In Modal */}
      <MicroCheckInModal
        visible={isCheckInModalVisible}
        onClose={handleCloseCheckInModal}
        onSave={handleSaveCheckIn}
        initialCheckIn={editingCheckIn}
      />

      {/* Settings / Reminders Modal */}
      <ReminderModal
        visible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
        setting={reminderSetting}
        onSaveSettings={handleSaveSettings}
      />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#09090B',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  appTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#F4F4F5',
    letterSpacing: -0.5,
  },
  v1Badge: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  v1BadgeText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '800',
  },
  appSubtitle: {
    fontSize: 11,
    color: '#71717A',
    marginTop: 2,
  },
  settingsBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: '#18181B',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  settingsBtnIcon: {
    fontSize: 15,
  },
  dateBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#121215',
    borderBottomWidth: 1,
    borderBottomColor: '#27272A',
  },
  dateNavBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#18181B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#27272A',
  },
  dateNavBtnDisabled: {
    opacity: 0.3,
  },
  dateNavText: {
    color: '#F4F4F5',
    fontSize: 18,
    fontWeight: '700',
  },
  dateNavTextDisabled: {
    color: '#71717A',
  },
  dateCenterBtn: {
    alignItems: 'center',
  },
  dateTitle: {
    color: '#F4F4F5',
    fontSize: 13,
    fontWeight: '700',
  },
  jumpTodayText: {
    fontSize: 9,
    color: '#EF4444',
    marginTop: 2,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loaderText: {
    color: '#A1A1AA',
    fontSize: 12,
  },
  feedScroll: {
    flex: 1,
  },
  feedContent: {
    padding: 16,
    paddingBottom: 90,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateEmoji: {
    fontSize: 42,
    marginBottom: 12,
  },
  emptyStateTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#F4F4F5',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 12,
    color: '#71717A',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  emptyStateBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#EF4444',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyStateBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '700',
  },
  timelineList: {
    gap: 4,
  },
  timelineCountRow: {
    marginBottom: 4,
  },
  timelineCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#71717A',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(9, 9, 11, 0.95)',
    borderTopWidth: 1,
    borderTopColor: '#27272A',
  },
  fabBtn: {
    height: 50,
    backgroundColor: '#EF4444',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  fabPlus: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 22,
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
