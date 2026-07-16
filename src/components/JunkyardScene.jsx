import { useEffect, useMemo, useRef, useState } from 'react';
import { css } from '../lib/css.js';

// 垃圾山 (G) only: a tall jagged scrap heap (~half the screen) in the stage's
// own green palette, with small geometric fragments periodically crumbling
// down the slope — the "too much junk, bits keep sliding off" mood. Pure
// SVG + a handful of short-lived tumbling divs (spawned 1–2 at a time, gone
// on animationend) to stay well within a sane element budget.
const SCENE_H = 420;                 // ~half of the 800px game viewport
const VIEW_W = 700;
const RIDGE_GREEN = 'rgba(143,226,60,0.30)';

// A jagged ridgeline rising to a peak, then closed into a filled heap.
function makeRidge(peakX, peakY, leftY, rightY, jitter, steps) {
  const pts = [[0, leftY]];
  for (let i = 1; i < steps; i++) {
    const x = (VIEW_W / steps) * i;
    const base = x < peakX
      ? leftY + (peakY - leftY) * (x / peakX)
      : peakY + (rightY - peakY) * ((x - peakX) / (VIEW_W - peakX));
    const y = Math.max(peakY - 8, base + (Math.random() * 2 - 1) * jitter);
    pts.push([x, y]);
  }
  pts.push([VIEW_W, rightY], [VIEW_W, SCENE_H], [0, SCENE_H]);
  return pts.map((p) => `${p[0].toFixed(0)},${p[1].toFixed(0)}`).join(' ');
}

const SHAPES = [
  {},                                                     // square
  { clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' },      // triangle
  { clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }, // diamond
  { wide: true },                                         // plank / offcut
];

function makeFragment(id) {
  const fromLeft = Math.random() < 0.5;
  const startX = fromLeft ? 150 + Math.random() * 200 : 350 + Math.random() * 210;
  const startTop = 30 + Math.random() * 120;
  const size = 4 + Math.random() * 5;
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const dx = (fromLeft ? -1 : 1) * (18 + Math.random() * 58);
  const dy = 170 + Math.random() * 170;
  const spin = (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540);
  const dur = (1.6 + Math.random() * 1.3).toFixed(2);
  return { id, startX, startTop, size, shape, dx, dy, spin, dur };
}

export function JunkyardScene() {
  const { nearRidge, farRidge } = useMemo(() => ({
    nearRidge: makeRidge(380, 40, 300, 235, 26, 22),
    farRidge: makeRidge(300, 118, 340, 300, 20, 18),
  }), []);
  const [frags, setFrags] = useState([]);
  const idRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const spawn = () => {
      if (!alive) return;
      const n = 2 + Math.floor(Math.random() * 3); // 2–4 fragments per volley
      setFrags((f) => [...f, ...Array.from({ length: n }, () => makeFragment(idRef.current++))]);
      timerRef.current = setTimeout(spawn, 550 + Math.random() * 1150);
    };
    // Backgrounded tabs pause CSS animations but keep (throttled) timers,
    // which would freeze a fragment mid-fall — drop them on hide, resume on
    // return (same guard the portal effect uses).
    const onVisibility = () => {
      clearTimeout(timerRef.current);
      setFrags([]);
      if (!document.hidden && alive) timerRef.current = setTimeout(spawn, 1000 + Math.random() * 1500);
    };
    timerRef.current = setTimeout(spawn, 800 + Math.random() * 1500);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      alive = false;
      clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const removeFrag = (id) => setFrags((f) => f.filter((x) => x.id !== id));

  return (
    <div style={css(`position:absolute;left:0;right:0;bottom:0;height:${SCENE_H}px;z-index:1;pointer-events:none;`)}>
      <svg viewBox={`0 0 ${VIEW_W} ${SCENE_H}`} preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}>
        <defs>
          <linearGradient id="junkNear" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a220e" />
            <stop offset="100%" stopColor="#0b1005" />
          </linearGradient>
        </defs>
        <polygon points={farRidge} fill="#141c0c" opacity="0.55" />
        <polygon points={nearRidge} fill="url(#junkNear)" stroke={RIDGE_GREEN} strokeWidth="1.5"
          style={{ filter: 'drop-shadow(0 0 5px rgba(143,226,60,0.22))' }} />
      </svg>
      {frags.map((d) => (
        <div
          key={d.id}
          onAnimationEnd={() => removeFrag(d.id)}
          style={{
            position: 'absolute', left: d.startX, top: d.startTop,
            width: d.shape.wide ? d.size * 2.2 : d.size, height: d.size,
            background: 'rgba(120,150,60,0.5)', boxShadow: '0 0 4px rgba(143,226,60,0.3)',
            clipPath: d.shape.clipPath,
            animation: `junkTumble ${d.dur}s ease-in both`,
            '--dx': `${d.dx}px`, '--dy': `${d.dy}px`, '--spin': `${d.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}
