import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ReminderSetting } from '../types';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissions(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  } catch (err) {
    console.warn('Notification permission error:', err);
    return false;
  }
}

export async function scheduleReminders(setting: ReminderSetting): Promise<void> {
  if (Platform.OS === 'web') return;

  try {
    // Cancel all existing scheduled notifications
    await Notifications.cancelAllScheduledNotificationsAsync();

    if (!setting.enabled || setting.times.length === 0) {
      return;
    }

    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return;
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

      await Notifications.scheduleNotificationAsync({
        content: {
          title: message.title,
          body: message.body,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
        },
      });
    }
  } catch (err) {
    console.warn('Failed to schedule reminders:', err);
  }
}
