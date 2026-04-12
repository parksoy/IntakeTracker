import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'intake_log';

// Returns today's date as YYYY-MM-DD string
export function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Load today's log. Returns [] if it's a new day or no data exists.
export async function loadTodayLog() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (data.date !== getTodayString()) {
      // New day — clear old data
      await AsyncStorage.removeItem(STORAGE_KEY);
      return [];
    }
    return data.entries || [];
  } catch {
    return [];
  }
}

// Save the current list of entries for today
export async function saveTodayLog(entries) {
  try {
    const data = { date: getTodayString(), entries };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // silently fail — data is best-effort
  }
}

// Clear today's log
export async function clearTodayLog() {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently fail
  }
}
