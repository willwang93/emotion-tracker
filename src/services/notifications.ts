import { Platform } from 'react-native';
import { isRunningInExpoGo } from 'expo';
import { ReminderSetting } from '../types';

let NotificationsModule: typeof import('expo-notifications') | null = null;

const isUnsupportedExpoGoAndroid = isRunningInExpoGo() && Platform.OS === 'android';

if (!isUnsupportedExpoGoAndroid && Platform.OS !== 'web') {
  try {
    NotificationsModule = require('expo-notifications');
    NotificationsModule?.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  } catch (err) {
    console.warn('Could not initialize notifications module:', err);
  }
}

export const REMINDER_CHANNEL_ID = 'daily_reminders';

export function isNotificationsSupported(): boolean {
  return NotificationsModule !== null && !isUnsupportedExpoGoAndroid && Platform.OS !== 'web';
}

export async function setupNotificationChannel(): Promise<void> {
  if (!NotificationsModule || Platform.OS !== 'android') return;
  try {
    await NotificationsModule.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Daily Emotion Check-In Reminders',
      importance: NotificationsModule.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#F57C00',
      sound: 'default',
      enableVibrate: true,
      showBadge: false,
    });
  } catch (err) {
    console.warn('Failed to setup notification channel:', err);
  }
}

export async function requestNotificationPermissions(): Promise<boolean> {
  if (!NotificationsModule) return false;
  try {
    const { status: existingStatus } = await NotificationsModule.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await NotificationsModule.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (err) {
    console.warn('Notification permission error:', err);
    return false;
  }
}

export async function scheduleReminders(setting: ReminderSetting): Promise<void> {
  if (!NotificationsModule) {
    return;
  }

  try {
    await NotificationsModule.cancelAllScheduledNotificationsAsync();

    if (!setting.enabled || setting.times.length === 0) {
      return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
    }

    if (Platform.OS === 'android') {
      await setupNotificationChannel();
    }

    const reminderMessages = [
      { title: 'Morning Check-In', body: 'How are you starting your day? Take 20 seconds to notice your energy and mood.' },
      { title: 'Mid-Day Check-In', body: 'Pause for a breath. What sensations are present in your body right now?' },
      { title: 'Evening Check-In', body: 'As your day shifts, how are you feeling? Check in with yourself.' },
      { title: 'Night Check-In', body: 'Wind down and reflect on your emotional baseline before rest.' },
    ];

    for (let i = 0; i < setting.times.length; i++) {
      const timeStr = setting.times[i];
      const [hourStr, minuteStr] = timeStr.split(':');
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      if (isNaN(hour) || isNaN(minute)) continue;

      const message = reminderMessages[i % reminderMessages.length];

      await NotificationsModule.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          sound: 'default',
          color: '#F57C00',
          priority: NotificationsModule.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: NotificationsModule.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: REMINDER_CHANNEL_ID,
        },
      });
    }
  } catch (err) {
    console.warn('Failed to schedule reminders:', err);
  }
}
