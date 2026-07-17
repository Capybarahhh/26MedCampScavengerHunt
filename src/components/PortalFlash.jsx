import { useEffect, useRef, useState } from 'react';
import { css } from '../lib/css.js';

// 傳送港 only: every random 4–11s, a transit gateway briefly cuts in at the
// right edge — a bright violet/blue seam flickers open, horizontal light
// streaks get pulled left→right INTO it and collapse, then the seam snaps
// shut. The inward suck + collapse is what reads as "something teleported
// elsewhere" rather than a glow just passing through. Kept dim/small so it
// stays ambient, not a focal point.
const BURST_DURATION = 2200;
const CONTAINER_W = 300;
const SEAM_RIGHT = 0;  // flush against the container's right edge
const SEAM_W = 5;
const SEAM_BOTTOM = 38;
const SEAM_HEIGHT = 120;
const Y_JITTER = 100;   // each burst spawns up to ±this many px up/down (static per burst)
const SEAM_CENTER_X = CONTAINER_W - SEAM_RIGHT - SEAM_W / 2;

function scheduleNext(fn) {
  return setTimeout(fn, 4000 + Math.random() * 7000);
}

// One burst = the streaks pulled into the seam this time (their vertical
// positions / lengths / stagger are randomized per burst so it never looks
// like a looping decoration).
function makeStreaks() {
  const n = 4 + Math.floor(Math.random() * 3);
  return Array.from({ length: n }, () => ({
    bottom: SEAM_BOTTOM + 6 + Math.random() * (SEAM_HEIGHT - 12),
    len: 60 + Math.random() * 44,
    delay: (Math.random() * 0.4).toFixed(2),
  }));
}

export function PortalFlash() {
  const [bursts, setBursts] = useState([]);
  const idRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const spawn = () => {
      if (!alive) return;
      const id = idRef.current++;
      const yShift = Math.round((Math.random() * 2 - 1) * Y_JITTER);
      setBursts((b) => [...b, { id, streaks: makeStreaks(), yShift }]);
      timerRef.current = scheduleNext(spawn);
    };
    // A backgrounded tab pauses CSS animations but keeps timers (throttled),
    // which would leave a half-open portal frozen on screen. Drop anything
    // in flight when we lose visibility, and reschedule cleanly on return.
    const onVisibility = () => {
      clearTimeout(timerRef.current);
      setBursts([]);
      if (!document.hidden && alive) timerRef.current = setTimeout(spawn, 1500 + Math.random() * 3000);
    };
    timerRef.current = scheduleNext(spawn);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      alive = false;
      clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Removal is tied to the seam animation actually finishing (its 2.2s run is
  // the longest in a burst), not a parallel timer that can drift out of sync.
  const removeBurst = (id) => setBursts((b) => b.filter((x) => x.id !== id));

  return (
    <div style={css(`position:absolute;right:0;bottom:-25px;width:${CONTAINER_W}px;height:200px;z-index:1;pointer-events:none;`)}>
      {bursts.map((burst) => (
        <div key={burst.id} style={{ transform: `translateY(${burst.yShift}px)` }}>
          {/* Soft radial bloom centered on the seam */}
          <div style={{
            position: 'absolute', left: SEAM_CENTER_X - 66, bottom: SEAM_BOTTOM - 26, width: 132, height: 172,
            background: 'radial-gradient(ellipse at 58% 52%, rgba(120,80,210,0.35), rgba(80,150,220,0.18) 45%, transparent 70%)',
            filter: 'blur(5px)', animation: `portalBloom ${BURST_DURATION}ms ease-out both`,
          }} />
          {/* Streaks pulled left → right into the seam, then collapse */}
          {burst.streaks.map((s, i) => (
            <div key={i} style={{
              position: 'absolute', right: SEAM_RIGHT + 2, bottom: s.bottom, width: s.len, height: 2,
              transformOrigin: 'right center',
              background: 'linear-gradient(270deg, rgba(160,120,240,0.85), rgba(100,170,230,0.4) 45%, transparent)',
              boxShadow: '0 0 6px rgba(130,100,230,0.5)',
              animation: `portalStreakPull 1200ms cubic-bezier(0.5,0,0.2,1) ${s.delay}s both`,
            }} />
          ))}
          {/* The gateway seam itself — opens, holds, snaps shut. Its
              animationend removes the whole burst (longest run in the group). */}
          <div
            onAnimationEnd={() => removeBurst(burst.id)}
            style={{
              position: 'absolute', right: SEAM_RIGHT, bottom: SEAM_BOTTOM, width: SEAM_W, height: SEAM_HEIGHT,
              transformOrigin: 'center',
              background: 'linear-gradient(180deg, transparent, rgba(150,100,230,0.9) 30%, rgba(110,170,235,0.9) 70%, transparent)',
              boxShadow: '0 0 14px 3px rgba(140,100,230,0.65), 0 0 30px 8px rgba(90,160,230,0.35)',
              animation: `portalSeamOpen ${BURST_DURATION}ms ease-in-out both`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
