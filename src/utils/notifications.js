/*
 * notifications.js — daily reminder scheduling via expo-notifications
 *
 * HOW TO WIRE THIS INTO App.js:
 * ─────────────────────────────────────────────────────────────────
 * import { scheduleReminder, cancelReminder } from './src/utils/notifications';
 *
 * // On app startup — request permission and set a default 8 PM reminder:
 * useEffect(() => {
 *   scheduleReminder(20, 0);
 * }, []);
 *
 * // To cancel all reminders (e.g. user toggles off in settings):
 * await cancelReminder();
 *
 * // To let the user pick a time (hour 0–23, minute 0–59):
 * await scheduleReminder(hour, minute);
 * ─────────────────────────────────────────────────────────────────
 * scheduleReminder replaces any existing reminder each call, so it is
 * safe to call repeatedly (e.g. after the user changes the time).
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const REMINDER_CHANNEL_ID = 'daily-reminder';
const NOTIFICATION_IDENTIFIER = 'intake-daily-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Request notification permissions. Returns true if granted.
async function requestPermissions() {
  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

// Create the Android notification channel (no-op on iOS).
async function ensureChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
      name: 'Daily Reminder',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
}

/*
 * scheduleReminder(hour, minute)
 *
 * Cancels any existing reminder, then schedules a new daily notification
 * at the given local time (24-hour clock). Requests permission first;
 * silently does nothing if permission is denied.
 *
 * @param {number} hour   — 0–23
 * @param {number} minute — 0–59
 */
export async function scheduleReminder(hour, minute) {
  const granted = await requestPermissions();
  if (!granted) return;

  await cancelReminder();
  await ensureChannel();

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_IDENTIFIER,
    content: {
      title: "Time to log your food!",
      body: "Don't forget to track today's intake.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}

/*
 * cancelReminder()
 *
 * Cancels the scheduled daily reminder. Safe to call even if no reminder
 * is currently scheduled.
 */
export async function cancelReminder() {
  await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_IDENTIFIER);
}
