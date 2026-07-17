// localStorage persistence.
const KEY = 'cp2157_progress';

export function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (!saved) return null;
    const room = Array.isArray(saved.room) ? saved.room.join('') : (saved.room || '');
    // Endings restore exactly as they were. Anything mid-flow — including a
    // stage/assembly snapshot written mid-play — resumes SAFELY at the map so
    // an accidental refresh keeps the team's completed stages + collected
    // fragments (and, since task-swap is derived purely from the room code,
    // their same puzzle ordering) instead of dropping everything. Only a save
    // with no room code (never actually logged in) starts fresh.
    if (['ending', 'ending1', 'ending2'].includes(saved.screen)) return saved;
    if (room) return { ...saved, screen: 'map' };
  } catch { /* corrupt data → start fresh */ }
  return null;
}

export function saveProgress(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch { /* private mode etc. */ }
}

export function clearProgress() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}
