// localStorage persistence.
const KEY = 'cp2157_progress';

export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    // Only screens that are safe to restore into.
    if (saved && ['map', 'ending', 'ending1', 'ending2'].includes(saved.screen)) return saved;
  } catch { /* corrupt data → start fresh */ }
  return null;
}

export function saveProgress(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* private mode etc. */ }
}

export function clearProgress() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
