import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'colorassist:samples:v1';

export async function loadSamples() {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function saveSample(sample) {
  const list = await loadSamples();
  const withId = { ...sample, id: `${Date.now()}-${Math.round(Math.random() * 1e6)}` };
  const next = [withId, ...list];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function deleteSample(id) {
  const list = await loadSamples();
  const next = list.filter((s) => s.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
