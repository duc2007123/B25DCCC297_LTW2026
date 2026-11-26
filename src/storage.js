const STORAGE_KEY = 'ltw_bongda_matches';

export function loadSaved() {
  try {
    const item = localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    return null;
  }
}

export function saveMatches(matches) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matches));
  } catch (error) {
    console.error('Failed to save matches:', error);
  }
}
