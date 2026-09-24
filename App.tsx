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
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useFonts } from 'expo-font';
import { CheckIn, QuadrantType } from './src/types';
import {
  getDatabase,
  getCheckInsForDay,
  getCheckInsForDateRange,
  insertCheckIn,
  updateCheckIn,
  deleteCheckIn,
} from './src/services/db';
import { TimelineCard } from './src/components/TimelineCard';
import { MicroCheckInModal } from './src/components/MicroCheckInModal';
import { ThemeProvider, useAppTheme } from './src/theme/ThemeContext';
import { fonts } from './src/theme';

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

function getGreeting(date: Date): string {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning, Will';
  if (hour < 17) return 'Good afternoon, Will';
  return 'Good evening, Will';
}

function MainApp() {
  const insets = useSafeAreaInsets();
  const { theme } = useAppTheme();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [weekMoodMap, setWeekMoodMap] = useState<Record<string, QuadrantType>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isCheckInModalVisible, setIsCheckInModalVisible] = useState<boolean>(false);
  const [editingCheckIn, setEditingCheckIn] = useState<CheckIn | null>(null);

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

      // Find the most frequent mood for each day
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

  const dateKicker = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).toUpperCase();

  const greeting = getGreeting(selectedDate);

  return (
    <View
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.background,
          paddingTop: Math.max(insets.top, 20),
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      <StatusBar
        hidden={true}
        translucent
        backgroundColor="transparent"
      />

      {/* Greeting & Date Banner */}
      <View style={styles.masthead}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextGroup}>
            <Text style={[styles.dateKicker, { color: theme.textMuted }]}>
              {dateKicker}
            </Text>
            <Text style={[styles.greetingText, { color: theme.text }]}>
              {greeting}
            </Text>
          </View>
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
                    isSelected && {
                      backgroundColor: '#F5EAD4',
                      borderRadius: 9999,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.weekDayLetter,
                      {
                        color: isSelected ? theme.text : theme.textMuted,
                        fontFamily: isSelected ? fonts.bold : fonts.medium,
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
                        : 'rgba(0, 0, 0, 0.12)',
                    },
                  ]}
                />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main Feed: Zero State (Screen 1) or Entries List (Screen 3) */}
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="small" color={theme.btnPrimaryBg} />
        </View>
      ) : (
        <ScrollView
          style={styles.feedScroll}
          contentContainerStyle={[
            styles.feedContent,
            checkIns.length === 0 && styles.feedContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.btnPrimaryBg}
              colors={[theme.btnPrimaryBg]}
            />
          }
        >
          {checkIns.length === 0 ? (
            /* Screen 1: Morning Zero State with Giant Radiant Circle CTA */
            <View style={styles.zeroStateContainer}>
              <TouchableOpacity
                onPress={handleOpenNewCheckIn}
                style={[styles.radiantBigBtn, { backgroundColor: theme.btnPrimaryBg }]}
                activeOpacity={0.88}
              >
                <MaterialIcons name="add" size={44} color="#FFFFFF" style={styles.radiantPlusIcon} />
                <Text style={styles.radiantBtnText}>Add entry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            /* Screen 3: Today's Entries State */
            <View style={styles.entriesContainer}>
              {/* Entries List Header */}
              <Text style={[styles.entriesSectionTitle, { color: theme.text }]}>
                Entries
              </Text>

              {/* Timeline Cards */}
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
            </View>
          )}
        </ScrollView>
      )}

      {/* Bottom Floating Pill CTA Button (shown when entries exist) */}
      {checkIns.length > 0 && (
        <View
          style={[
            styles.bottomFloatingContainer,
            {
              backgroundColor: 'rgba(254, 249, 238, 0.94)',
            },
          ]}
        >
          <TouchableOpacity
            onPress={handleOpenNewCheckIn}
            style={[styles.bottomPillBtn, { backgroundColor: theme.btnPrimaryBg }]}
            activeOpacity={0.88}
          >
            <MaterialIcons name="add" size={22} color="#FFFFFF" style={styles.bottomPlusIcon} />
            <Text style={styles.bottomPillBtnText}>Add entry</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Micro Check-In Modal (4-Step Flow) */}
      <MicroCheckInModal
        visible={isCheckInModalVisible}
        onClose={handleCloseCheckInModal}
        onSave={handleSaveCheckIn}
        initialCheckIn={editingCheckIn}
      />
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'PlusJakartaSans-Regular': require('./assets/fonts/PlusJakartaSans-Regular.ttf'),
    'PlusJakartaSans-Medium': require('./assets/fonts/PlusJakartaSans-Medium.ttf'),
    'PlusJakartaSans-SemiBold': require('./assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'PlusJakartaSans-Bold': require('./assets/fonts/PlusJakartaSans-Bold.ttf'),
    'PlusJakartaSans-ExtraBold': require('./assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
  });

  if (!fontsLoaded) {
    return null;
  }

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
    paddingTop: 14,
    paddingBottom: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTextGroup: {
    flex: 1,
  },
  dateKicker: {
    fontSize: 11,
    fontFamily: fonts.bold,
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 28,
    fontFamily: fonts.extraBold,
    letterSpacing: -0.5,
  },
  weekRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 4,
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
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    overflow: 'hidden',
    marginBottom: 6,
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
    paddingTop: 12,
    paddingBottom: 110,
  },
  feedContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingBottom: 40,
  },
  zeroStateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  radiantBigBtn: {
    width: 210,
    height: 210,
    borderRadius: 105,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F57C00',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.38,
    shadowRadius: 36,
    elevation: 6,
  },
  radiantPlusIcon: {
    marginBottom: 4,
  },
  radiantBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.bold,
    letterSpacing: 0.1,
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  entriesContainer: {
    flex: 1,
  },
  entriesSectionTitle: {
    fontSize: 18,
    fontFamily: fonts.bold,
    letterSpacing: -0.2,
    marginBottom: 12,
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
  bottomPillBtn: {
    height: 56,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F57C00',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 24,
    elevation: 4,
  },
  bottomPlusIcon: {
    marginRight: 6,
  },
  bottomPillBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.bold,
    letterSpacing: 0.2,
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 22,
  },
});
