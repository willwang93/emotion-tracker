import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { CheckIn, QuadrantType, ReminderSetting } from './src/types';
import {
  getDatabase,
  getCheckInsForDay,
  getCheckInsForDateRange,
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

const DAY_LETTERS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function getWeekDates(date: Date): Date[] {
  const d = new Date(date);
  const day = d.getDay();
  // 0 is Sunday, 1 is Monday ... 6 is Saturday
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diff);
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const next = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    days.push(next);
  }
  return days;
}

function MainApp() {
  const { theme, isDark } = useAppTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [weekMoodMap, setWeekMoodMap] = useState<Record<string, QuadrantType>>({});
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

  const weekDays = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const loadData = useCallback(async (date: Date) => {
    try {
      await getDatabase();
      const entries = await getCheckInsForDay(date);
      setCheckIns(entries);

      // Load week check-ins for dominant (most frequent) mood dots
      const currentWeek = getWeekDates(date);
      const weekEntries = await getCheckInsForDateRange(currentWeek[0], currentWeek[6]);

      // Group check-ins by day string
      const dayEntriesMap: Record<string, CheckIn[]> = {};
      for (const item of weekEntries) {
        const itemDateStr = new Date(item.timestamp).toDateString();
        if (!dayEntriesMap[itemDateStr]) {
          dayEntriesMap[itemDateStr] = [];
        }
        dayEntriesMap[itemDateStr].push(item);
      }

      // Find the most frequent mood for each day (tie-breaker: latest check-in)
      const moodMap: Record<string, QuadrantType> = {};
      for (const [dayDateStr, entries] of Object.entries(dayEntriesMap)) {
        if (entries.length === 0) continue;
        const counts: Record<QuadrantType, number> = {
          yellow: 0,
          red: 0,
          green: 0,
          blue: 0,
        };
        for (const entry of entries) {
          counts[entry.quadrant] = (counts[entry.quadrant] || 0) + 1;
        }

        let dominantQuadrant: QuadrantType = entries[entries.length - 1].quadrant;
        let maxCount = counts[dominantQuadrant];

        for (const quad of (['yellow', 'red', 'green', 'blue'] as QuadrantType[])) {
          if (counts[quad] > maxCount) {
            maxCount = counts[quad];
            dominantQuadrant = quad;
          }
        }
        moodMap[dayDateStr] = dominantQuadrant;
      }
      setWeekMoodMap(moodMap);

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
        const today = new Date();
        setSelectedDate(today);
        await loadData(today);
      }
    } catch (err) {
      console.error('Failed to save check-in:', err);
    }
  };

  const handleEditCheckIn = (checkIn: CheckIn) => {
    setEditingCheckIn(checkIn);
    setIsCheckInModalVisible(true);
  };

  const handleCloseCheckInModal = () => {
    setIsCheckInModalVisible(false);
    setEditingCheckIn(null);
  };

  const handleOpenNewCheckIn = () => {
    setEditingCheckIn(null);
    setIsCheckInModalVisible(true);
  };

  const handleDeleteCheckIn = async (id: string) => {
    try {
      await deleteCheckIn(id);
      setCheckIns((prev) => prev.filter((c) => c.id !== id));
      loadData(selectedDate);
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

  const changeWeekBy = (weeks: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + weeks * 7);
    setSelectedDate(newDate);
  };

  const monthYearHeader = selectedDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={theme.background}
      />

      {/* Header */}
      <View style={styles.masthead}>
        <View style={styles.mastheadTopRow}>
          <Text style={[styles.mastheadDate, { color: theme.text }]}>
            {selectedDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>

          <TouchableOpacity
            onPress={() => setIsSettingsModalVisible(true)}
            style={styles.settingsBtn}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Text style={[styles.settingsBtnText, { color: theme.textSecondary }]}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>

        {/* 7-Day Weightless Week Ribbon */}
        <View style={styles.weekRibbon}>
          {weekDays.map((day, idx) => {
            const isSelected = day.toDateString() === selectedDate.toDateString();
            const moodQuadrant = weekMoodMap[day.toDateString()];

            return (
              <TouchableOpacity
                key={day.toISOString()}
                onPress={() => setSelectedDate(day)}
                style={styles.weekDayBtn}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.weekDayCircle,
                    isSelected && { backgroundColor: theme.activeDayBg },
                  ]}
                >
                  <Text
                    style={[
                      styles.weekDayLetter,
                      {
                        color: isSelected ? theme.text : theme.textMuted,
                        fontWeight: isSelected ? '600' : '400',
                      },
                    ]}
                  >
                    {DAY_LETTERS[idx]}
                  </Text>
                </View>
                <View
                  style={[
                    styles.moodDot,
                    {
                      backgroundColor: moodQuadrant
                        ? theme.quadrants[moodQuadrant].color
                        : isDark
                        ? 'rgba(255, 255, 255, 0.15)'
                        : 'rgba(0, 0, 0, 0.12)',
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
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
          showsVerticalScrollIndicator={false}
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
              <View style={[styles.sunIconCircle, { borderColor: isDark ? '#374151' : '#E5E7EB' }]}>
                <Feather name="sun" size={20} color={theme.textMuted} />
              </View>
              <Text style={[styles.emptyStateTitle, { color: theme.text }]}>
                No check-ins yet
              </Text>
              <Text style={[styles.emptyStateSubtitle, { color: theme.textMuted }]}>
                Log how you are feeling whenever you want to check in.
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

      {/* Fixed Bottom Action Button */}
      <View
        style={[
          styles.bottomFloatingContainer,
          {
            backgroundColor: isDark
              ? 'rgba(15, 17, 21, 0.92)'
              : 'rgba(251, 249, 245, 0.92)',
          },
        ]}
      >
        <TouchableOpacity
          onPress={handleOpenNewCheckIn}
          style={[styles.fullWidthAddBtn, { backgroundColor: theme.btnPrimaryBg }]}
          activeOpacity={0.85}
        >
          <Text style={[styles.fullWidthAddBtnText, { color: theme.btnPrimaryText }]}>
            Log emotion
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
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  mastheadTopRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  mastheadDate: {
    fontFamily: 'serif',
    fontSize: 24,
    fontWeight: '400',
    letterSpacing: -0.3,
  },
  settingsBtn: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  settingsBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  weekRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
  },
  weekDayBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  weekDayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
    overflow: 'hidden',
  },
  weekDayLetter: {
    fontSize: 12,
  },
  moodDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
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
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 110,
  },
  emptyStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 110,
    paddingHorizontal: 32,
  },
  sunIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontFamily: 'serif',
    fontSize: 20,
    fontWeight: '400',
    textAlign: 'center',
    marginBottom: 6,
  },
  emptyStateSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 240,
  },
  timelineList: {
    gap: 12,
  },
  bottomFloatingContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 24,
  },
  fullWidthAddBtn: {
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 3,
  },
  fullWidthAddBtnText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
