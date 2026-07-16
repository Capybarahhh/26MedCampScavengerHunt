// Fire-and-forget interaction tracking. Never blocks or breaks gameplay:
// if the endpoint is missing or the request fails, we silently move on.
//
// The endpoint is a Google Apps Script Web App URL (set VITE_TRACK_ENDPOINT
// in .env.production — see docs/DEPLOY.md). Requests are sent as a CORS
// "simple request" (no JSON content-type header, mode: no-cors) because
// Apps Script can't answer preflight OPTIONS; the response is opaque, which
// is fine — we never read it.
const ENDPOINT = import.meta.env.VITE_TRACK_ENDPOINT || '';

function getSessionId() {
  try {
    let id = localStorage.getItem('cp2157_session');
    if (!id) {
      id = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem('cp2157_session', id);
    }
    return id;
  } catch {
    return 'anonymous';
  }
}

let roomCode = '';
let teamName = '';
export function setTrackedRoom(code, name = '') {
  roomCode = code;
  teamName = name;
}

export function track(event, payload = {}) {
  if (!ENDPOINT) return;
  try {
    const body = JSON.stringify({
      event,
      sessionId: getSessionId(),
      roomCode,
      team: teamName,
      ts: new Date().toISOString(),
      ...payload,
    });
    fetch(ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    /* tracking must never break the game */
  }
}
