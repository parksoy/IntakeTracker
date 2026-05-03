import AsyncStorage from '@react-native-async-storage/async-storage';

const CUSTOM_FOODS_KEY = 'intake_custom_foods';

export async function loadCustomFoods() {
  try {
    const raw = await AsyncStorage.getItem(CUSTOM_FOODS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function saveCustomFood({ name, points }) {
  try {
    const current = await loadCustomFoods();
    if (current.some((f) => f.name === name)) return;
    await AsyncStorage.setItem(CUSTOM_FOODS_KEY, JSON.stringify([...current, { name, points }]));
  } catch {
    // silently fail
  }
}

export async function deleteCustomFood(name) {
  try {
    const current = await loadCustomFoods();
    await AsyncStorage.setItem(
      CUSTOM_FOODS_KEY,
      JSON.stringify(current.filter((f) => f.name !== name))
    );
  } catch {
    // silently fail
  }
}
