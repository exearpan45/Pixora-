import { HistoryRecord } from '../types';

const STORAGE_KEY = 'pixora_recent_history';
const MAX_HISTORY = 12;

export function getRecentHistory(): HistoryRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRecentHistory(item: Omit<HistoryRecord, 'id' | 'timestamp'>): void {
  try {
    const history = getRecentHistory();
    const newRecord: HistoryRecord = {
      ...item,
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
    };

    // Filter out duplicates by name and prepend
    const updated = [newRecord, ...history.filter((h) => h.name !== item.name)].slice(
      0,
      MAX_HISTORY
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // If quota exceeded or disabled, silently fail
  }
}

export function clearRecentHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore
  }
}
