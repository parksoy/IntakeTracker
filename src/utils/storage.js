import AsyncStorage from '@react-native-async-storage/async-storage';

const LOG_PREFIX = 'intake_log_';
const LEGACY_KEY = 'intake_log';
const RECENTLY_USED_KEY = 'intake_recently_used';
const RECENTLY_USED_MAX = 5;

// Returns today's date as YYYY-MM-DD string
export function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Load today's log. Migrates from legacy single-key format on first run.
export async function loadTodayLog() {
  try {
    const today = getTodayString();

    // Migrate legacy single-key data if present
    const legacy = await AsyncStorage.getItem(LEGACY_KEY);
    if (legacy) {
      const data = JSON.parse(legacy);
      if (data.date === today && Array.isArray(data.entries) && data.entries.length > 0) {
        await AsyncStorage.setItem(LOG_PREFIX + today, JSON.stringify(data.entries));
      }
      await AsyncStorage.removeItem(LEGACY_KEY);
    }

    const raw = await AsyncStorage.getItem(LOG_PREFIX + today);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

// Save the current list of entries for today
export async function saveTodayLog(entries) {
  try {
    await AsyncStorage.setItem(LOG_PREFIX + getTodayString(), JSON.stringify(entries));
  } catch {
    // silently fail — data is best-effort
  }
}

// Clear today's log
export async function clearTodayLog() {
  try {
    await AsyncStorage.removeItem(LOG_PREFIX + getTodayString());
  } catch {
    // silently fail
  }
}

// Load all past days (excludes today), sorted newest-first.
// Returns: [{ date: 'YYYY-MM-DD', entries: [...] }, ...]
export async function loadAllLogs() {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const today = getTodayString();
    const pastKeys = allKeys
      .filter((k) => k.startsWith(LOG_PREFIX) && k !== LOG_PREFIX + today)
      .sort()
      .reverse();

    if (pastKeys.length === 0) return [];

    const pairs = await AsyncStorage.multiGet(pastKeys);
    return pairs
      .map(([key, value]) => ({
        date: key.replace(LOG_PREFIX, ''),
        entries: JSON.parse(value) || [],
      }))
      .filter((d) => d.entries.length > 0);
  } catch {
    return [];
  }
}

// Load recently used foods. Returns [{ name, points }, ...] (up to 5).
export async function loadRecentlyUsed() {
  try {
    const raw = await AsyncStorage.getItem(RECENTLY_USED_KEY);
    if (!raw) return [];
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

// Save a food item to the recently used list. foodItem: { name, points }
export async function saveRecentlyUsed(foodItem) {
  try {
    const current = await loadRecentlyUsed();
    const updated = [foodItem, ...current.filter((f) => f.name !== foodItem.name)].slice(
      0,
      RECENTLY_USED_MAX
    );
    await AsyncStorage.setItem(RECENTLY_USED_KEY, JSON.stringify(updated));
  } catch {
    // silently fail
  }
}
