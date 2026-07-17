import { useEffect, useMemo, useRef, useState } from 'react';
import { css } from '../lib/css.js';

// 垃圾山 (G) only: a scrap heap tucked into the bottom-LEFT corner (its peak
// sits at the left edge so only the right flank of the body shows), with
// small geometric fragments crumbling DOWN that slope. Plus a distant neon
// "JUNK" sign on the right whose J occasionally glitches to P. Pure SVG/CSS.
const SCENE_H = 420;
const VIEW_W = 700;
const RIDGE_GREEN = 'rgba(143,226,60,0.30)';

// Corner heaps: peak near the left edge, right slope descending to the base
// at `baseX`, then flat ground to the right (clear space for the sign). Far
// heap sits behind, shorter and further left.
const NEAR = { peakX: 40, peakY: 115, leftY: 175, baseX: 400, jitter: 24, steps: 20 };
const FAR = { peakX: 20, peakY: 190, leftY: 245, baseX: 300, jitter: 18, steps: 16 };

// Ridgeline (top surface) as {x,y} points: rise to the peak, descend to the
// base at baseX. Ground stays flat past baseX (added by ridgePolygon).
function makeCornerHeap({ peakX, peakY, leftY, baseX, jitter, steps }) {
  const pts = [{ x: 0, y: leftY }];
  for (let i = 1; i < steps; i++) {
    const x = (baseX / steps) * i;
    const base = x < peakX
      ? leftY + (peakY - leftY) * (x / peakX)
      : peakY + (SCENE_H - peakY) * ((x - peakX) / (baseX - peakX));
    const y = Math.min(SCENE_H, Math.max(peakY - 8, base + (Math.random() * 2 - 1) * jitter));
    pts.push({ x, y });
  }
  pts.push({ x: baseX, y: SCENE_H });
  return pts;
}

// Close the ridge into a filled heap, flat along the base out to the right.
function ridgePolygon(pts) {
  const top = pts.map((p) => `${p.x.toFixed(0)},${p.y.toFixed(0)}`).join(' ');
  return `${top} ${VIEW_W},${SCENE_H} 0,${SCENE_H}`;
}

// Surface height (y) at an arbitrary x, so a fragment sits on the slope.
function ridgeYAt(pts, x) {
  if (x <= pts[0].x) return pts[0].y;
  for (let i = 1; i < pts.length; i++) {
    if (x <= pts[i].x) {
      const t = (x - pts[i - 1].x) / (pts[i].x - pts[i - 1].x);
      return pts[i - 1].y + t * (pts[i].y - pts[i - 1].y);
    }
  }
  return pts[pts.length - 1].y;
}

const SHAPES = [
  {},                                                     // square
  { clipPath: 'polygon(50% 0, 100% 100%, 0 100%)' },      // triangle
  { clipPath: 'polygon(50% 0, 100% 50%, 50% 100%, 0 50%)' }, // diamond
  { round: true },                                        // circle
  { wide: true },                                         // plank / offcut
];

// One fragment: spawns on the upper-half slope surface (never above the ridge)
// and rolls DOWNHILL (away from the peak → mostly down-right on this heap).
function makeFragment(id, pts, midY) {
  let startX = 60;
  let ridgeY = ridgeYAt(pts, startX);
  for (let t = 0; t < 14; t++) {
    startX = 20 + Math.random() * (NEAR.baseX - 50);
    ridgeY = ridgeYAt(pts, startX);
    if (ridgeY <= midY - 10) break; // keep spawns in the heap's upper half
  }
  const depth = Math.max(0, Math.min(38, midY - ridgeY));
  const startTop = ridgeY + Math.random() * depth; // on the slope, never above it
  const dir = startX < NEAR.peakX ? -1 : 1;         // downhill = away from peak
  let dy = 130 + Math.random() * 160;
  dy = Math.min(dy, SCENE_H - 12 - startTop);        // come to rest near the base
  const dx = dir * dy * (0.5 + Math.random() * 0.45); // horizontal tracks the drop
  const size = 4 + Math.random() * 5;
  const shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  const spin = (Math.random() < 0.5 ? -1 : 1) * (360 + Math.random() * 540);
  const dur = (1.7 + Math.random() * 1.3).toFixed(2);
  return { id, startX, startTop, size, shape, dx, dy, spin, dur };
}

// Neon "JUNK" sign mounted flush on the building's upper face (no pole). The
// J briefly flickers to P (JUNK ⇄ PUNK) every few seconds with a colour/offset
// kick. Kept on the dim side so the glow doesn't dominate the corner.
function JunkSign() {
  const [glitch, setGlitch] = useState(false);
  useEffect(() => {
    let alive = true;
    let offTimer = null;
    let nextTimer = null;
    const flicker = () => {
      if (!alive) return;
      setGlitch(true);
      // P stays visible briefly, and the gap between glitches is longer.
      offTimer = setTimeout(() => { if (alive) setGlitch(false); }, 275 + Math.random() * 325);
      nextTimer = setTimeout(flicker, 5000 + Math.random() * 6000);
    };
    nextTimer = setTimeout(flicker, 2500 + Math.random() * 3500);
    return () => { alive = false; clearTimeout(offTimer); clearTimeout(nextTimer); };
  }, []);

  const textGlow = '0 0 3px #8fe23c, 0 0 9px rgba(143,226,60,0.5)'; // softened glow
  return (
    <div style={{ position: 'absolute', right: 62, bottom: 190, opacity: 0.55, textAlign: 'center' }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        padding: '6px 12px', borderRadius: 4,
        background: 'linear-gradient(180deg, rgba(12,18,7,0.92), rgba(6,10,4,0.92))',
        border: '1.5px solid rgba(143,226,60,0.5)',
        boxShadow: '0 0 7px rgba(143,226,60,0.25), inset 0 0 9px rgba(143,226,60,0.1)',
      }}>
        <span style={{
          fontFamily: 'var(--font-logo)', fontSize: 17, letterSpacing: 2, lineHeight: 1,
          display: 'inline-block',
          color: glitch ? '#e86a92' : '#bfe89a',
          textShadow: glitch ? '0 0 3px #e86a92, 0 0 9px rgba(255,90,140,0.6)' : textGlow,
          animation: glitch ? 'junkSignJitter 0.14s linear infinite' : 'none',
          transition: 'none',
        }}>{glitch ? 'P' : 'J'}</span>
        <span style={{
          fontFamily: 'var(--font-logo)', fontSize: 17, letterSpacing: 2, lineHeight: 1,
          color: '#bfe89a', textShadow: textGlow,
        }}>UNK</span>
      </div>
    </div>
  );
}

// Dim building the sign hangs on — kept subtle (dark fill, low group opacity,
// faint windows) so it reads as background, not a focal point.
const BUILD = { x: 556, y: 180, w: 126 };
const BUILD_WINDOWS = [
  [570, 250], [592, 250], [636, 250], [660, 250],
  [570, 282], [614, 282], [660, 282],
  [592, 314], [636, 314],
  [570, 346], [614, 346], [660, 346],
  [592, 378], [636, 378],
];

export function JunkyardScene() {
  const { nearPts, nearPoly, farPoly, midY } = useMemo(() => {
    const near = makeCornerHeap(NEAR);
    const far = makeCornerHeap(FAR);
    return {
      nearPts: near,
      nearPoly: ridgePolygon(near), farPoly: ridgePolygon(far),
      midY: (NEAR.peakY + SCENE_H) / 2,
    };
  }, []);
  const [frags, setFrags] = useState([]);
  const idRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const spawn = () => {
      if (!alive) return;
      const n = 1 + Math.floor(Math.random() * 3); // 1–3 fragments per volley
      setFrags((f) => [...f, ...Array.from({ length: n }, () => makeFragment(idRef.current++, nearPts, midY))]);
      timerRef.current = setTimeout(spawn, 700 + Math.random() * 1300);
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
  }, [nearPts, midY]);

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
          <linearGradient id="junkBuild" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a220e" />
            <stop offset="100%" stopColor="#0b1005" />
          </linearGradient>
        </defs>
        <polygon points={farPoly} fill="#141c0c" opacity="0.55" />
        <polygon points={nearPoly} fill="url(#junkNear)" stroke={RIDGE_GREEN} strokeWidth="1.5"
          style={{ filter: 'drop-shadow(0 0 5px rgba(143,226,60,0.22))' }} />
        {/* dim building on the right that the JUNK sign hangs on */}
        <g opacity="0.5">
          <rect x={BUILD.x} y={BUILD.y} width={BUILD.w} height={SCENE_H - BUILD.y}
            fill="url(#junkBuild)" stroke="rgba(143,226,60,0.1)" strokeWidth="1" />
          {BUILD_WINDOWS.map((w, i) => (
            <rect key={i} x={w[0]} y={w[1]} width="6" height="8" fill="rgba(143,226,60,0.16)" />
          ))}
        </g>
      </svg>
      <JunkSign />
      {frags.map((d) => (
        <div
          key={d.id}
          onAnimationEnd={() => removeFrag(d.id)}
          style={{
            position: 'absolute', left: d.startX, top: d.startTop,
            width: d.shape.wide ? d.size * 2.2 : d.size, height: d.size,
            background: 'rgba(120,150,60,0.5)', boxShadow: '0 0 4px rgba(143,226,60,0.3)',
            clipPath: d.shape.clipPath,
            borderRadius: d.shape.round ? '50%' : undefined,
            animation: `junkTumble ${d.dur}s ease-in both`,
            '--dx': `${d.dx.toFixed(1)}px`, '--dy': `${d.dy.toFixed(1)}px`, '--spin': `${d.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}
