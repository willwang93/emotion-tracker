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
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';

function MainApp() {
  const { theme, isDark } = useAppTheme();
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

  // e.g. "September 6, 2026"
  const formattedLongDate = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar style={theme.statusBar} />

      {/* Date Masthead & Header */}
      <View style={styles.masthead}>
        <View style={styles.mastheadTopRow}>
          <Text style={[styles.mastheadDate, { color: theme.text }]}>
            {formattedLongDate}
          </Text>

          <TouchableOpacity
            onPress={() => setIsSettingsModalVisible(true)}
            style={styles.settingsIconBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.settingsIconText, { color: theme.textMuted }]}>⚙</Text>
          </TouchableOpacity>
        </View>

        {/* Quiet literary text links: ‹ Yesterday and Tomorrow › */}
        <View style={styles.navRow}>
          <TouchableOpacity
            onPress={() => changeDateBy(-1)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.navTextLink, { color: theme.textSubtle }]}>
              ‹ Yesterday
            </Text>
          </TouchableOpacity>

          {!isToday && (
            <TouchableOpacity
              onPress={() => changeDateBy(1)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.navTextLink, { color: theme.textSubtle }]}>
                Tomorrow ›
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Timeline Scrollable View */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={theme.textMuted} />
        </View>
      ) : (
        <ScrollView
          style={styles.feedScroll}
          contentContainerStyle={styles.feedContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.textMuted}
              colors={[theme.textMuted]}
            />
          }
        >
          {checkIns.length === 0 ? (
            <View style={styles.emptyStateContainer}>
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No moments recorded
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: theme.textMuted }]}>
                This day awaits its first honest passage.
              </Text>
            </View>
          ) : (
            <View style={styles.timelineList}>
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

      {/* Floating Bottom Action with Soft Background Fade */}
      <View
        style={[
          styles.bottomFloatingContainer,
          {
            backgroundColor: isDark
              ? 'rgba(9, 13, 22, 0.92)'
              : 'rgba(253, 251, 247, 0.92)',
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleOpenNewCheckIn}
          style={[styles.fullWidthAddBtn, { backgroundColor: isDark ? '#FFFFFF' : '#1F2937' }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.fullWidthAddBtnText, { color: isDark ? '#090D16' : '#FFFFFF' }]}>
            + New Entry
          </Text>
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
  );
}


export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MainApp />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  masthead: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 12,
  },
  mastheadTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mastheadDate: {
    fontFamily: 'serif',
    fontSize: 28,
    fontWeight: '400',
    letterSpacing: -0.5,
  },
  settingsIconBtn: {
    padding: 6,
  },
  settingsIconText: {
    fontSize: 18,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  navTextLink: {
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  loaderContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedScroll: {
    flex: 1,
  },
  feedContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 110,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 28,
  },
  emptyStateTitle: {
    fontFamily: 'serif',
    fontSize: 18,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontFamily: 'monospace',
    fontSize: 11,
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  timelineList: {
    gap: 2,
  },
  bottomFloatingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  fullWidthAddBtn: {
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  fullWidthAddBtnText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
