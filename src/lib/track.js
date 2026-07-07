// Fire-and-forget interaction tracking. Never blocks or breaks gameplay:
// if the endpoint is missing or the request fails, we silently move on.
const ENDPOINT = import.meta.env.VITE_TRACK_ENDPOINT || '/api/track';

function getSessionId() {
  try {
    let id = localStorage.getItem('mnemo_session');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('mnemo_session', id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
}

let roomCode = '';
export function setTrackedRoom(code) { roomCode = code; }

export function track(event, payload = {}) {
  try {
    const body = JSON.stringify({
      event,
      sessionId: getSessionId(),
      roomCode,
      ts: new Date().toISOString(),
      ...payload,
    });
    fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* tracking must never break the game */
  }
}
