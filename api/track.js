// Vercel serverless function: receives gameplay events from src/lib/track.js.
// If TRACK_WEBHOOK_URL is set (e.g. a Google Apps Script web app that appends
// to a Sheet), events are forwarded there; otherwise they are just logged.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  const event = req.body || {};
  const webhook = process.env.TRACK_WEBHOOK_URL;
  if (webhook) {
    try {
      await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
    } catch (e) {
      console.error('track forward failed:', e);
    }
  } else {
    console.log('[track]', JSON.stringify(event));
  }
  res.status(204).end();
}
