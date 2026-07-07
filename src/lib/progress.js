// localStorage persistence. Key and shape match the legacy version exactly,
// so players keep their progress across the rewrite.
const KEY = 'mnemo_progress';

export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    // Only screens that are safe to restore into (same rule as legacy).
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
