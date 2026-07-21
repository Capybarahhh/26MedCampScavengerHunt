// Fire-and-forget interaction tracking. Never blocks or breaks gameplay:
// if the endpoint is missing, we silently no-op. If a send fails (most
// realistically: the player opened the game before actually connecting to
// Wi-Fi/data), the event is queued in localStorage and retried — in order,
// with a small stagger between sends — once connectivity looks back. This
// is NOT a general offline-durability system: it's scoped to the "forgot to
// connect yet" case at the start of a session, not to staying resilient
// through long/repeated mid-game drops.
//
// The endpoint is a Google Apps Script Web App URL (set VITE_TRACK_ENDPOINT
// in .env.production — see docs/DEPLOY.md). Requests are sent as a CORS
// "simple request" (no JSON content-type header, mode: no-cors) because
// Apps Script can't answer preflight OPTIONS; the response is opaque, which
// is fine — we never read it. (This also means we can't truly *confirm*
// server-side success, only that the network request itself didn't fail —
// good enough for a fully-offline case, which is all this queue targets.)
const ENDPOINT = import.meta.env.VITE_TRACK_ENDPOINT || '';
const QUEUE_KEY = 'cp2157_pending_events';
// Generous cap — this queue is only ever expected to hold a handful of
// startup events, not survive an all-day outage. If the endpoint is simply
// broken (not just "not connected yet"), this bounds how much accumulates
// instead of growing localStorage forever.
const MAX_QUEUE = 200;

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

// Piggybacks the current score onto every event already being sent (rather
// than firing a dedicated event per score change), so the backend board can
// keep a "current score" column up to date without extra network traffic.
let currentScore = null;
export function setTrackedScore(score) {
  currentScore = score;
}

function loadQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
}
function saveQueue(q) {
  try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch { /* private mode etc. */ }
}
function enqueue(body) {
  const q = loadQueue();
  q.push(body);
  if (q.length > MAX_QUEUE) q.splice(0, q.length - MAX_QUEUE); // drop oldest, not newest
  saveQueue(q);
}

function sendRaw(body) {
  return fetch(ENDPOINT, { method: 'POST', mode: 'no-cors', body, keepalive: true });
}

// Drains the queue strictly in order (oldest first), stopping at the first
// failure so nothing is skipped or reordered. A small stagger between sends
// avoids firing a burst of requests at once (Apps Script serializes writes
// with a script-wide lock — see docs/google-apps-script.gs's doPost).
let flushing = false;
async function flushQueue() {
  if (flushing) return;
  flushing = true;
  try {
    let q = loadQueue();
    while (q.length) {
      try {
        await sendRaw(q[0]);
      } catch {
        break; // still not connected — leave the rest queued for next time
      }
      q = q.slice(1);
      saveQueue(q);
      if (q.length) await new Promise((r) => setTimeout(r, 350));
    }
  } finally {
    flushing = false;
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => { flushQueue(); });
}

export function track(event, payload = {}) {
  if (!ENDPOINT) return;
  try {
    const body = JSON.stringify({
      event,
      sessionId: getSessionId(),
      roomCode,
      team: teamName,
      score: currentScore,
      ts: new Date().toISOString(),
      ...payload,
    });
    // Try draining anything stuck from before FIRST (in case we missed the
    // 'online' event, e.g. it fired before this module attached the
    // listener), so a queued backlog stays chronologically ahead of this new
    // event rather than racing it.
    flushQueue().then(() => sendRaw(body).catch(() => enqueue(body)));
  } catch {
    /* tracking must never break the game */
  }
}
