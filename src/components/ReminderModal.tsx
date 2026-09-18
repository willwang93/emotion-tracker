import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  Easing,
  Share,
  TouchableWithoutFeedback,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ReminderSetting } from '../types';
import { useAppTheme } from '../theme/ThemeContext';
import { fonts } from '../theme';
import { exportAllDataAsJson } from '../services/db';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_DELETE_THRESHOLD = -85;
const ITEM_HEIGHT = 64;

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = Array.from({ length: 60 }, (_, i) => i);
const HOUR_OFFSETS = HOURS.map((_, i) => i * ITEM_HEIGHT);
const MINUTE_OFFSETS = MINUTES.map((_, i) => i * ITEM_HEIGHT);

interface Props {
  visible: boolean;
  onClose: () => void;
  setting: ReminderSetting;
  onSaveSettings: (setting: ReminderSetting) => void;
}

function padZero(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

function parseTimeDisplay(t: string): { hour12: number; minute: number; period: 'AM' | 'PM'; display: string } {
  const [hStr, mStr] = (t || '08:00').split(':');
  const h = parseInt(hStr, 10) || 0;
  const m = parseInt(mStr, 10) || 0;
  const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return {
    hour12,
    minute: m,
    period,
    display: `${padZero(hour12)}:${padZero(m)}`,
  };
}

function formatTimeTo24(hour12: number, minute: number, period: 'AM' | 'PM'): string {
  let h24 = hour12;
  if (period === 'PM') {
    h24 = hour12 === 12 ? 12 : hour12 + 12;
  } else {
    h24 = hour12 === 12 ? 0 : hour12;
  }
  return `${padZero(h24)}:${padZero(minute)}`;
}

// Swipeable Reminder Card with left swipe-to-delete
interface SwipeableCardProps {
  timeStr: string;
  onPress: () => void;
  onDelete: () => void;
  theme: any;
  isDark: boolean;
}

const SwipeableReminderCard: React.FC<SwipeableCardProps> = ({
  timeStr,
  onPress,
  onDelete,
  theme,
  isDark,
}) => {
  const parsed = parseTimeDisplay(timeStr);
  const translateX = useRef(new Animated.Value(0)).current;
  const isSwiping = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
        return isHorizontal && gestureState.dx < -10;
      },
      onPanResponderGrant: () => {
        isSwiping.current = true;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dx < 0) {
          translateX.setValue(gestureState.dx);
        } else {
          translateX.setValue(0);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < SWIPE_DELETE_THRESHOLD) {
          Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 180,
            useNativeDriver: true,
          }).start(() => {
            onDelete();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
        setTimeout(() => {
          isSwiping.current = false;
        }, 120);
      },
      onPanResponderTerminate: () => {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
        isSwiping.current = false;
      },
    })
  ).current;

  const handleCardPress = () => {
    if (!isSwiping.current) {
      onPress();
    }
  };

  return (
    <View style={styles.swipeWrapper}>
      {/* Background Delete Action */}
      <View style={styles.deleteBackground}>
        <MaterialIcons name="delete-outline" size={22} color="#FFFFFF" style={styles.deleteIcon} />
        <Text style={styles.deleteBackgroundText}>DELETE</Text>
      </View>

      {/* Foreground Swipeable Card */}
      <Animated.View
        style={[
          styles.cardForeground,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <TouchableOpacity
          style={styles.cardInner}
          onPress={handleCardPress}
          activeOpacity={0.8}
        >
          <View style={styles.cardTimeGroup}>
            <Text style={[styles.cardTimeText, { color: theme.text }]}>
              {parsed.display}
            </Text>
            <Text style={[styles.cardPeriodText, { color: isDark ? theme.textSecondary : '#8A6845' }]}>
              {parsed.period}
            </Text>
          </View>

          <View style={styles.cardChevronContainer}>
            <MaterialIcons name="chevron-right" size={22} color={theme.textMuted} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

export const ReminderModal: React.FC<Props> = ({
  visible,
  onClose,
  setting,
  onSaveSettings,
}) => {
  const { theme, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [times, setTimes] = useState<string[]>(setting.times || []);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Drum picker temp values
  const [tempHour, setTempHour] = useState<number>(8);
  const [tempMinute, setTempMinute] = useState<number>(30);
  const [tempPeriod, setTempPeriod] = useState<'AM' | 'PM'>('AM');

  // Animated values
  const sheetAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const toastAnim = useRef(new Animated.Value(0)).current;
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Scroll references for wheel pickers
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  // Synchronize times when prop updates
  useEffect(() => {
    if (setting?.times) {
      setTimes(setting.times);
    }
  }, [setting.times]);

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setTimes(setting.times || []);
      setIsSheetOpen(false);
      setEditingIndex(null);
      sheetAnim.setValue(0);
      fadeAnim.setValue(0);
      dragY.setValue(0);
      toastAnim.setValue(0);
    }
  }, [visible]);

  // Scroll wheels into position when sheet opens
  useEffect(() => {
    if (isSheetOpen) {
      const timer = setTimeout(() => {
        const hourIdx = Math.max(0, HOURS.indexOf(tempHour));
        hourScrollRef.current?.scrollTo({ y: hourIdx * ITEM_HEIGHT, animated: false });
        minuteScrollRef.current?.scrollTo({ y: tempMinute * ITEM_HEIGHT, animated: false });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isSheetOpen]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.delay(1800),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setToastMessage(null);
    });
  };

  const openSheet = (idx: number | null) => {
    if (idx !== null && times[idx]) {
      const parsed = parseTimeDisplay(times[idx]);
      setTempHour(parsed.hour12);
      setTempMinute(parsed.minute);
      setTempPeriod(parsed.period);
      setEditingIndex(idx);
    } else {
      setTempHour(8);
      setTempMinute(30);
      setTempPeriod('AM');
      setEditingIndex(null);
    }

    dragY.setValue(0);
    sheetAnim.setValue(0);
    fadeAnim.setValue(0);
    setIsSheetOpen(true);
    Animated.parallel([
      Animated.timing(sheetAnim, {
        toValue: 1,
        duration: 340,
        easing: Easing.bezier(0.2, 0.9, 0.3, 1),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(sheetAnim, {
        toValue: 0,
        duration: 250,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsSheetOpen(false);
      setEditingIndex(null);
      dragY.setValue(0);
      sheetAnim.setValue(0);
    });
  };

  // PanResponder on bottom sheet grabber / header to allow swipe-down to dismiss
  const sheetPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          dragY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 90 || gestureState.vy > 0.6) {
          closeSheet();
        } else {
          Animated.spring(dragY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 4,
          }).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.spring(dragY, {
          toValue: 0,
          useNativeDriver: true,
        }).start();
      },
    })
  ).current;

  // Wheel scroll handlers with programmatic alignment correction
  const handleHourScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(HOURS.length - 1, index));
    const h = HOURS[clamped];
    if (h !== undefined && h !== tempHour) {
      setTempHour(h);
    }
    const targetY = clamped * ITEM_HEIGHT;
    if (Math.abs(y - targetY) > 0.5) {
      hourScrollRef.current?.scrollTo({ y: targetY, animated: true });
    }
  };

  const handleMinuteScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const index = Math.round(y / ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(MINUTES.length - 1, index));
    const m = MINUTES[clamped];
    if (m !== undefined && m !== tempMinute) {
      setTempMinute(m);
    }
    const targetY = clamped * ITEM_HEIGHT;
    if (Math.abs(y - targetY) > 0.5) {
      minuteScrollRef.current?.scrollTo({ y: targetY, animated: true });
    }
  };

  const handleSaveSheet = () => {
    const formatted = formatTimeTo24(tempHour, tempMinute, tempPeriod);
    let updated = [...times];
    if (editingIndex !== null) {
      updated[editingIndex] = formatted;
      triggerToast(`Updated to ${padZero(tempHour)}:${padZero(tempMinute)} ${tempPeriod}`);
    } else {
      updated.push(formatted);
      triggerToast(`Added ${padZero(tempHour)}:${padZero(tempMinute)} ${tempPeriod}`);
    }

    updated.sort();
    setTimes(updated);
    onSaveSettings({
      ...setting,
      enabled: true,
      times: updated,
    });
    closeSheet();
  };

  const handleDeleteCard = (idx: number) => {
    const updated = times.filter((_, i) => i !== idx);
    setTimes(updated);
    onSaveSettings({
      ...setting,
      times: updated,
    });
    triggerToast('Reminder deleted');
  };

  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    if (isExporting) return;
    try {
      setIsExporting(true);
      const { jsonString, count } = await exportAllDataAsJson();
      if (count === 0) {
        triggerToast('No journal entries to export yet');
        return;
      }
      await Share.share({
        title: `emotion_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`,
        message: jsonString,
      });
      triggerToast(`Exported ${count} ${count === 1 ? 'entry' : 'entries'}`);
    } catch (err) {
      console.error('Failed to export data:', err);
      triggerToast('Export cancelled or failed');
    } finally {
      setIsExporting(false);
    }
  };

  const sheetTranslateY = sheetAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [SCREEN_HEIGHT * 0.7, 0],
  });

  const combinedTranslateY = Animated.add(sheetTranslateY, dragY);

  const scrimOpacity = fadeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.45],
  });

  const toastTranslateY = toastAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 0],
  });

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.safeArea,
          {
            backgroundColor: theme.background,
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        {/* Top Header matching app navigation patterns */}
        <View style={styles.topHeader}>
          <TouchableOpacity
            onPress={onClose}
            style={styles.headerBackBtn}
            activeOpacity={0.7}
            accessibilityLabel="Back"
          >
            <MaterialIcons name="arrow-back" size={24} color={theme.text} />
          </TouchableOpacity>

          <Text style={[styles.headerTitle, { color: theme.text }]}>Reminders</Text>

          <TouchableOpacity
            onPress={() => openSheet(null)}
            style={[styles.headerIconButton, { backgroundColor: theme.btnPrimaryBg }]}
            activeOpacity={0.85}
            accessibilityLabel="Add reminder"
          >
            <MaterialIcons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Swipe hint */}
        {times.length > 0 && (
          <View style={styles.hintContainer}>
            <Text style={[styles.hintText, { color: theme.textMuted }]}>
              Swipe left on a reminder to delete
            </Text>
          </View>
        )}

        {/* Main Content: List or Empty State, followed by Backup Section */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {times.length === 0 ? (
            <View style={styles.emptyContainer}>
              <View
                style={[
                  styles.emptyIconCircle,
                  { backgroundColor: theme.surfaceContainer },
                ]}
              >
                <MaterialIcons
                  name="notifications-none"
                  size={32}
                  color={theme.textMuted}
                />
              </View>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No reminders yet</Text>
              <TouchableOpacity
                onPress={() => openSheet(null)}
                style={[styles.emptyAddButton, { backgroundColor: theme.btnPrimaryBg }]}
                activeOpacity={0.85}
              >
                <MaterialIcons name="add" size={20} color="#FFFFFF" style={styles.emptyAddButtonIcon} />
                <Text style={styles.emptyAddButtonText}>Add reminder</Text>
              </TouchableOpacity>
            </View>
          ) : (
            times.map((t, idx) => (
              <SwipeableReminderCard
                key={`${t}-${idx}`}
                timeStr={t}
                onPress={() => openSheet(idx)}
                onDelete={() => handleDeleteCard(idx)}
                theme={theme}
                isDark={isDark}
              />
            ))
          )}

          {/* Data & Backup Section */}
          <View style={styles.backupSection}>
            <Text style={[styles.backupSectionHeader, { color: theme.textMuted }]}>
              DATA & BACKUP
            </Text>
            <View
              style={[
                styles.backupCard,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.backupCardContent}>
                <View
                  style={[
                    styles.backupIconCircle,
                    { backgroundColor: theme.surfaceContainer },
                  ]}
                >
                  <MaterialIcons name="file-download" size={22} color={theme.btnPrimaryBg} />
                </View>
                <View style={styles.backupTextContainer}>
                  <Text style={[styles.backupTitle, { color: theme.text }]}>Export Journal Data</Text>
                  <Text style={[styles.backupSubtitle, { color: theme.textSecondary }]}>
                    Save all check-ins and settings as a JSON file to Google Drive, Files, or Notes.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.backupExportButton, { backgroundColor: theme.btnPrimaryBg }]}
                onPress={handleExportData}
                activeOpacity={0.85}
                disabled={isExporting}
              >
                <MaterialIcons name="share" size={18} color="#FFFFFF" style={styles.backupButtonIcon} />
                <Text style={styles.backupExportButtonText}>
                  {isExporting ? 'Exporting...' : 'Export JSON'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Sheet Time Picker Overlay */}
        {isSheetOpen && (
          <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
            {/* Scrim Backdrop */}
            <TouchableWithoutFeedback onPress={closeSheet}>
              <Animated.View
                style={[
                  StyleSheet.absoluteFill,
                  styles.scrim,
                  { opacity: scrimOpacity },
                ]}
              />
            </TouchableWithoutFeedback>

            {/* Bottom Sheet Container */}
            <Animated.View
              style={[
                styles.bottomSheet,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  transform: [{ translateY: combinedTranslateY }],
                },
              ]}
            >
              {/* Swipe down handle and header area */}
              <View {...sheetPanResponder.panHandlers} style={styles.sheetTopDraggableArea}>
                <View style={styles.grabberContainer}>
                  <View
                    style={[
                      styles.grabber,
                      { backgroundColor: isDark ? theme.border : '#D6C9B6' },
                    ]}
                  />
                </View>

                {/* Sheet Header: Cancel | Title | Spacer (NO delete button) */}
                <View style={styles.sheetHeaderRow}>
                  <TouchableOpacity
                    onPress={closeSheet}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  >
                    <Text style={[styles.sheetCancelText, { color: theme.textSecondary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>

                  <Text style={[styles.sheetTitle, { color: theme.text }]}>
                    {editingIndex !== null ? 'Edit Time' : 'New Reminder'}
                  </Text>

                  {/* Empty spacer to keep title centered */}
                  <View style={styles.headerSpacer} />
                </View>
              </View>

              {/* Scrollable Drum Wheels Zone */}
              <View style={styles.pickerZone}>
                <View style={styles.pickerColumnsContainer}>
                  {/* Hours Scroll Wheel */}
                  <View style={styles.wheelColumn}>
                    <View
                      style={[
                        styles.wheelSelectionBox,
                        {
                          backgroundColor: isDark ? theme.surfaceContainer : '#F4EFE4',
                          borderColor: isDark ? theme.border : '#E8DED0',
                        },
                      ]}
                      pointerEvents="none"
                    />
                    <ScrollView
                      ref={hourScrollRef}
                      style={styles.wheelScrollView}
                      contentContainerStyle={styles.wheelScrollContent}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      snapToOffsets={HOUR_OFFSETS}
                      snapToAlignment="start"
                      snapToStart={true}
                      snapToEnd={false}
                      decelerationRate="fast"
                      onMomentumScrollEnd={handleHourScroll}
                      onScrollEndDrag={handleHourScroll}
                    >
                      {HOURS.map((h, i) => {
                        const isSelected = h === tempHour;
                        return (
                          <TouchableOpacity
                            key={`h-${h}`}
                            style={styles.wheelItem}
                            activeOpacity={0.7}
                            onPress={() => {
                              setTempHour(h);
                              hourScrollRef.current?.scrollTo({ y: i * ITEM_HEIGHT, animated: true });
                            }}
                          >
                            <Text
                              style={[
                                isSelected ? styles.wheelTextSelected : styles.wheelTextUnselected,
                                isSelected
                                  ? { color: isDark ? '#FFA726' : '#7A3900' }
                                  : { color: theme.textMuted },
                              ]}
                            >
                              {padZero(h)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* Colon Separator */}
                  <Text style={[styles.colonText, { color: isDark ? theme.textSecondary : '#8A6845' }]}>
                    :
                  </Text>

                  {/* Minutes Scroll Wheel */}
                  <View style={styles.wheelColumn}>
                    <View
                      style={[
                        styles.wheelSelectionBox,
                        {
                          backgroundColor: isDark ? theme.surfaceContainer : '#F4EFE4',
                          borderColor: isDark ? theme.border : '#E8DED0',
                        },
                      ]}
                      pointerEvents="none"
                    />
                    <ScrollView
                      ref={minuteScrollRef}
                      style={styles.wheelScrollView}
                      contentContainerStyle={styles.wheelScrollContent}
                      showsVerticalScrollIndicator={false}
                      snapToInterval={ITEM_HEIGHT}
                      snapToOffsets={MINUTE_OFFSETS}
                      snapToAlignment="start"
                      snapToStart={true}
                      snapToEnd={false}
                      decelerationRate="fast"
                      onMomentumScrollEnd={handleMinuteScroll}
                      onScrollEndDrag={handleMinuteScroll}
                    >
                      {MINUTES.map((m, i) => {
                        const isSelected = m === tempMinute;
                        return (
                          <TouchableOpacity
                            key={`m-${m}`}
                            style={styles.wheelItem}
                            activeOpacity={0.7}
                            onPress={() => {
                              setTempMinute(m);
                              minuteScrollRef.current?.scrollTo({ y: i * ITEM_HEIGHT, animated: true });
                            }}
                          >
                            <Text
                              style={[
                                isSelected ? styles.wheelTextSelected : styles.wheelTextUnselected,
                                isSelected
                                  ? { color: isDark ? '#FFA726' : '#7A3900' }
                                  : { color: theme.textMuted },
                              ]}
                            >
                              {padZero(m)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </ScrollView>
                  </View>

                  {/* AM/PM Toggle Pill */}
                  <View
                    style={[
                      styles.ampmContainer,
                      {
                        backgroundColor: isDark ? theme.surfaceContainer : '#F4EFE4',
                        borderColor: isDark ? theme.border : '#E8DED0',
                      },
                    ]}
                  >
                    <TouchableOpacity
                      onPress={() => setTempPeriod('AM')}
                      style={[
                        styles.ampmTab,
                        tempPeriod === 'AM' && [styles.ampmTabActive, { backgroundColor: theme.btnPrimaryBg }],
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.ampmTabText,
                          tempPeriod === 'AM'
                            ? styles.ampmTabTextActive
                            : { color: theme.textSecondary },
                        ]}
                      >
                        AM
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => setTempPeriod('PM')}
                      style={[
                        styles.ampmTab,
                        tempPeriod === 'PM' && [styles.ampmTabActive, { backgroundColor: theme.btnPrimaryBg }],
                      ]}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.ampmTabText,
                          tempPeriod === 'PM'
                            ? styles.ampmTabTextActive
                            : { color: theme.textSecondary },
                        ]}
                      >
                        PM
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Prominent Bottom Save Button */}
              <View style={styles.sheetSaveContainer}>
                <TouchableOpacity
                  onPress={handleSaveSheet}
                  style={[styles.sheetSaveButton, { backgroundColor: theme.btnPrimaryBg }]}
                  activeOpacity={0.85}
                >
                  <Text style={styles.sheetSaveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        )}

        {/* Toast feedback pill */}
        {toastMessage && (
          <Animated.View
            style={[
              styles.toast,
              {
                opacity: toastAnim,
                transform: [{ translateY: toastTranslateY }],
              },
            ]}
          >
            <Text style={styles.toastText}>{toastMessage}</Text>
          </Animated.View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerBackBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F57C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: fonts.bold,
    letterSpacing: -0.3,
  },
  hintContainer: {
    paddingHorizontal: 24,
    paddingBottom: 6,
    paddingTop: 2,
  },
  hintText: {
    fontSize: 12,
    fontFamily: fonts.regular,
    letterSpacing: 0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 10,
  },
  swipeWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  deleteBackground: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#DC2626',
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 22,
  },
  deleteIcon: {
    marginRight: 6,
  },
  deleteBackgroundText: {
    color: '#FFFFFF',
    fontFamily: fonts.bold,
    fontSize: 12,
    letterSpacing: 1.2,
  },
  cardForeground: {
    borderRadius: 20,
    borderWidth: 1,
  },
  cardInner: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTimeGroup: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  cardTimeText: {
    fontSize: 26,
    fontFamily: fonts.bold,
    letterSpacing: -0.5,
  },
  cardPeriodText: {
    fontSize: 13,
    fontFamily: fonts.bold,
    letterSpacing: 0.5,
  },
  cardChevronContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 36,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
    marginBottom: 6,
  },
  emptyAddButton: {
    height: 46,
    paddingHorizontal: 22,
    borderRadius: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    shadowColor: '#F57C00',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 2,
  },
  emptyAddButtonIcon: {
    marginRight: 6,
  },
  emptyAddButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: fonts.semiBold,
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 20,
  },
  backupSection: {
    marginTop: 24,
    paddingTop: 8,
  },
  backupSectionHeader: {
    fontSize: 12,
    fontFamily: fonts.bold,
    letterSpacing: 1.2,
    marginBottom: 10,
    marginLeft: 4,
  },
  backupCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
  },
  backupCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 16,
  },
  backupIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backupTextContainer: {
    flex: 1,
  },
  backupTitle: {
    fontSize: 16,
    fontFamily: fonts.bold,
    marginBottom: 4,
  },
  backupSubtitle: {
    fontSize: 13,
    fontFamily: fonts.regular,
    lineHeight: 18,
  },
  backupExportButton: {
    height: 44,
    borderRadius: 22,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F57C00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  backupButtonIcon: {
    marginRight: 6,
  },
  backupExportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: fonts.semiBold,
  },
  scrim: {
    backgroundColor: '#000000',
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 32,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 16,
  },
  sheetTopDraggableArea: {
    paddingTop: 4,
    paddingBottom: 4,
  },
  grabberContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  grabber: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    paddingBottom: 8,
  },
  sheetCancelText: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  sheetTitle: {
    fontSize: 17,
    fontFamily: fonts.bold,
  },
  headerSpacer: {
    width: 48,
  },
  pickerZone: {
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerColumnsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    height: ITEM_HEIGHT * 3,
  },
  wheelColumn: {
    width: 82,
    height: ITEM_HEIGHT * 3,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  wheelSelectionBox: {
    position: 'absolute',
    top: ITEM_HEIGHT,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  wheelScrollView: {
    width: '100%',
    height: ITEM_HEIGHT * 3,
  },
  wheelScrollContent: {
    paddingVertical: ITEM_HEIGHT,
    alignItems: 'center',
  },
  wheelItem: {
    width: 82,
    height: ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wheelTextSelected: {
    fontSize: 36,
    fontFamily: fonts.extraBold,
    letterSpacing: -0.5,
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: ITEM_HEIGHT,
  },
  wheelTextUnselected: {
    fontSize: 15,
    fontFamily: fonts.semiBold,
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: ITEM_HEIGHT,
  },
  colonText: {
    fontSize: 32,
    fontFamily: fonts.bold,
    alignSelf: 'center',
    includeFontPadding: false,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: ITEM_HEIGHT,
  },
  ampmContainer: {
    flexDirection: 'column',
    borderWidth: 1,
    padding: 5,
    borderRadius: 18,
    gap: 4,
    marginLeft: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  ampmTab: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ampmTabActive: {
    shadowColor: '#F57C00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  ampmTabText: {
    fontSize: 12,
    fontFamily: fonts.bold,
  },
  ampmTabTextActive: {
    color: '#FFFFFF',
  },
  sheetSaveContainer: {
    paddingTop: 16,
    paddingBottom: 4,
  },
  sheetSaveButton: {
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F57C00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.28,
    shadowRadius: 14,
    elevation: 4,
  },
  sheetSaveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: fonts.bold,
    letterSpacing: 0.3,
  },
  toast: {
    position: 'absolute',
    top: 56,
    alignSelf: 'center',
    backgroundColor: '#2B190A',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 9999,
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  toastText: {
    color: '#FEF9EE',
    fontSize: 13,
    fontFamily: fonts.semiBold,
  },
});
