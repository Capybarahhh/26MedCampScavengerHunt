// Ambient backdrop generators (particles / buildings / rain / glyphs).
const PARTICLE_COLORS = ['var(--teal)', 'var(--purple)', 'var(--pink)', 'var(--gold)'];
const WINDOW_COLORS = ['rgba(var(--gold-rgb),0.6)', 'rgba(var(--teal-rgb),0.55)', 'rgba(var(--purple-rgb),0.5)'];

// Per-shape building proportions/density — this is what actually reads as
// "a different place" at a glance (silhouette), independent of color.
const SHAPE_PARAMS = {
  default:     { wMin: 55, wMax: 110, hMin: 70,  hMax: 240, gap: 0.72, antenna: 0.4,  lit: 0.32 },
  'narrow-tall': { wMin: 16, wMax: 30,  hMin: 100, hMax: 190, gap: 0.55, antenna: 0,    lit: 0.5 },
  'low-wide':    { wMin: 75, wMax: 140, hMin: 35,  hMax: 75,  gap: 0.85, antenna: 0.08, lit: 0.14 },
  'sparse-mast': { wMin: 8,  wMax: 16,  hMin: 140, hMax: 230, gap: 2.6,  antenna: 0.7,  lit: 0.08 },
  'dense-neon':  { wMin: 38, wMax: 68,  hMin: 55,  hMax: 120, gap: 0.5,  antenna: 0.18, lit: 0.55 },
  jagged:        { wMin: 48, wMax: 95,  hMin: 45,  hMax: 150, gap: 0.68, antenna: 0,    lit: 0.2 },
  chaotic:       { wMin: 50, wMax: 95,  hMin: 90,  hMax: 230, gap: 0.55, antenna: 0.5,  lit: 0.6 },
};

// Stage themes — keyed by stageKey (matches STAGE_ORDER), each tied to that
// stage's own `emotion` tag so the backdrop reinforces the story beat
// instead of being arbitrary set-dressing:
//   R 圖書館 沈迷 (obsession)  — warm, tall, tightly-packed bookshelf spines
//   Y 舊城區 孤獨 (loneliness) — muted, low, worn, sparse lantern glow, fog
//   A 傳送港 無知 (ignorance)  — hazy, sparse thin masts/cranes, heavy fog
//   M 地下市集 恐懼 (fear)     — dense, cramped, red/pink danger neon
//   G 垃圾山 偏執 (paranoia)   — jagged irregular silhouettes, drifting embers
//   C 市中心 失序 (disorder)   — dense, tall, glitch-flickering, bright chaos
const STAGE_THEMES = {
  default: {
    shape: 'default', buildingA: null, buildingB: null,
    windowColors: WINDOW_COLORS, particleColors: PARTICLE_COLORS,
    rain: true, mist: false, embers: false, jagged: false, glitch: false,
  },
  R: {
    shape: 'narrow-tall', buildingA: '#241608', buildingB: '#2e1c0a',
    windowColors: ['rgba(240,192,80,0.6)', 'rgba(232,168,58,0.55)', 'rgba(216,152,64,0.5)'],
    particleColors: ['#f0c050', '#e8a83a', '#d89840'],
    rain: false, mist: false, embers: false, jagged: false, glitch: false, spine: true,
  },
  Y: {
    shape: 'low-wide', buildingA: '#14101c', buildingB: '#181422',
    windowColors: ['rgba(200,160,120,0.4)', 'rgba(180,140,110,0.32)', 'rgba(160,130,150,0.3)'],
    particleColors: ['#8a7aa0', '#6a5a80', '#786890'],
    rain: false, mist: true, embers: false, jagged: false, glitch: false,
  },
  A: {
    shape: 'sparse-mast', buildingA: '#0a1420', buildingB: '#0e1a28',
    windowColors: ['rgba(100,160,200,0.4)', 'rgba(80,140,190,0.3)', 'rgba(120,180,210,0.35)'],
    particleColors: ['#5a8aa8', '#3a6a88', '#6aa0c0'],
    rain: true, mist: true, embers: false, jagged: false, glitch: false, crane: true,
  },
  M: {
    shape: 'dense-neon', buildingA: '#200810', buildingB: '#2a0c16',
    windowColors: ['rgba(255,60,100,0.55)', 'rgba(255,90,60,0.45)', 'rgba(255,45,150,0.5)'],
    particleColors: ['#ff2d78', '#c9184a', '#ff5a7a'],
    rain: true, mist: false, embers: false, jagged: false, glitch: false,
  },
  G: {
    // embers off: the upward-drifting embers visually fought the JunkyardScene
    // scrap falling DOWN the heap, so the two motions read as noise together.
    shape: 'jagged', buildingA: '#141c0c', buildingB: '#1a220e',
    windowColors: ['rgba(180,200,80,0.4)', 'rgba(150,170,60,0.32)', 'rgba(200,190,100,0.3)'],
    particleColors: ['#8fe23c', '#6ab02a', '#a8d060'],
    rain: false, mist: false, embers: false, jagged: true, glitch: false,
  },
  C: {
    shape: 'chaotic', buildingA: '#1a0a20', buildingB: '#22102a',
    windowColors: WINDOW_COLORS, particleColors: PARTICLE_COLORS,
    rain: true, mist: false, embers: false, jagged: false, glitch: true,
  },
};

function jaggedClipPath() {
  const steps = 4 + Math.floor(Math.random() * 3);
  const points = ['0% 100%'];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * 100;
    const y = Math.random() * 24;
    points.push(`${x.toFixed(0)}% ${y.toFixed(0)}%`);
  }
  points.push('100% 100%');
  return `clip-path:polygon(${points.join(',')});`;
}

function makeParticles(n, theme = STAGE_THEMES.default) {
  const colors = theme.particleColors || PARTICLE_COLORS;
  const arr = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 700;
    const y = Math.random() * 800;
    const size = 1 + Math.random() * 2.4;
    const dur = 5 + Math.random() * 9;
    const delay = Math.random() * 8;
    const color = colors[i % colors.length];
    const style = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:${color};box-shadow:0 0 ${(size * 3).toFixed(1)}px ${color};animation:floatParticle ${dur.toFixed(2)}s ease-in-out infinite, pulseOpacity ${(dur * 0.8).toFixed(2)}s ease-in-out infinite;animation-delay:-${delay.toFixed(2)}s;`;
    arr.push({ style });
  }
  return arr;
}

// A far, dim, window-less row behind the main skyline for a bit of depth.
function makeFarBuildings(n, theme = STAGE_THEMES.default) {
  const shape = SHAPE_PARAMS[theme.shape] || SHAPE_PARAMS.default;
  const buildingA = theme.buildingA || 'var(--building-a)';
  const arr = [];
  let x = -30;
  for (let i = 0; i < n; i++) {
    const width = (shape.wMin + Math.random() * (shape.wMax - shape.wMin)) * 0.75;
    const height = (shape.hMin + Math.random() * (shape.hMax - shape.hMin)) * 0.55;
    const clipPath = theme.jagged ? jaggedClipPath() : '';
    const style = `position:absolute;left:${x}px;bottom:0;width:${width}px;height:${height}px;background:${buildingA};opacity:0.45;${clipPath}`;
    arr.push({ style });
    x += width * 0.8;
  }
  return arr;
}

function makeBuildings(n, theme = STAGE_THEMES.default) {
  const shape = SHAPE_PARAMS[theme.shape] || SHAPE_PARAMS.default;
  const buildingA = theme.buildingA || 'var(--building-a)';
  const buildingB = theme.buildingB || 'var(--building-b)';
  const windowColors = theme.windowColors || WINDOW_COLORS;
  const arr = [];
  let x = -20;
  for (let i = 0; i < n; i++) {
    const width = shape.wMin + Math.random() * (shape.wMax - shape.wMin);
    const height = shape.hMin + Math.random() * (shape.hMax - shape.hMin);
    const top = i % 2 === 0 ? buildingA : buildingB;
    const bottom = i % 2 === 0 ? buildingB : buildingA;
    const clipPath = theme.jagged ? jaggedClipPath() : '';
    const glitchAnim = theme.glitch && Math.random() < 0.3
      ? `animation:buildingGlitch ${(3 + Math.random() * 4).toFixed(2)}s ease-in-out infinite;animation-delay:-${(Math.random() * 3).toFixed(2)}s;`
      : '';
    const style = `position:absolute;left:${x}px;bottom:0;width:${width}px;height:${height}px;background:linear-gradient(180deg, ${top} 0%, ${bottom} 88%);box-shadow:inset 0 2px 0 rgba(var(--purple-rgb),0.16), inset 0 0 26px rgba(0,0,0,0.35);${clipPath}${glitchAnim}`;

    // Lit-window grid: sparse and slightly jittered so it reads as texture
    // rather than literal graph paper. Only a handful actually animate — an
    // always-running CSS animation on every single window (there were ~100
    // across the skyline) forces the browser to keep that many layers alive
    // forever behind every screen, which is real, measurable jank on modest
    // hardware. Most windows are just a static glow; animation is the
    // exception, not the rule.
    const colStep = 20, rowStep = 26, margin = 8;
    const cols = Math.max(1, Math.floor((width - margin * 2) / colStep));
    const rows = Math.max(1, Math.floor((height - margin * 2) / rowStep));
    const windows = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (Math.random() > shape.lit) continue; // most windows stay dark
        const wx = margin + c * colStep + Math.random() * 3;
        const wy = margin + r * rowStep + Math.random() * 3;
        const color = windowColors[Math.floor(Math.random() * windowColors.length)];
        const animate = Math.random() < 0.2;
        const anim = animate
          ? `animation:pulseOpacity ${(4 + Math.random() * 6).toFixed(2)}s ease-in-out infinite;animation-delay:-${(Math.random() * 6).toFixed(2)}s;`
          : `opacity:${(0.4 + Math.random() * 0.3).toFixed(2)};`;
        const wStyle = `position:absolute;left:${wx.toFixed(1)}px;top:${wy.toFixed(1)}px;width:3px;height:5px;background:${color};box-shadow:0 0 3px ${color};${anim}`;
        windows.push({ style: wStyle });
      }
    }

    // Some rooftops get an antenna with a slow warning-light blink.
    const hasAntenna = Math.random() < shape.antenna;
    const antennaX = width * (0.3 + Math.random() * 0.4);
    const antennaH = 10 + Math.random() * 16;
    const antennaStyle = `position:absolute;left:${antennaX.toFixed(1)}px;bottom:${height}px;width:1px;height:${antennaH.toFixed(1)}px;background:rgba(var(--purple-rgb),0.4);`;
    const antennaDotStyle = `position:absolute;left:${(antennaX - 1.5).toFixed(1)}px;bottom:${(height + antennaH - 1).toFixed(1)}px;width:4px;height:4px;border-radius:50%;background:var(--pink);box-shadow:0 0 5px var(--pink);animation:powerDotPulse 2.4s ease-in-out infinite;animation-delay:-${(Math.random() * 2).toFixed(2)}s;`;

    // 圖書館 only: a thin pale stripe down each spine, like a book's edge.
    const spineStyle = theme.spine
      ? `position:absolute;left:${(width * 0.3).toFixed(1)}px;top:6px;bottom:6px;width:2px;background:rgba(255,224,170,0.22);`
      : null;

    // 傳送港 only: a horizontal crossbar near the top of taller masts, read
    // as a crane arm / cargo gantry rather than a plain antenna pole.
    const craneStyle = theme.crane && hasAntenna
      ? `position:absolute;left:${(antennaX - 16).toFixed(1)}px;bottom:${(height + antennaH * 0.6).toFixed(1)}px;width:32px;height:1px;background:rgba(var(--teal-rgb),0.3);`
      : null;

    arr.push({ style, windows, hasAntenna, antennaStyle, antennaDotStyle, spineStyle, craneStyle });
    x += width * shape.gap;
  }
  return arr;
}

function makeRain(n, theme = STAGE_THEMES.default) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 700;
    const height = 30 + Math.random() * 60;
    const dur = 1.2 + Math.random() * 1.6;
    const delay = Math.random() * 3;
    const color = Math.random() > 0.5 ? 'rgba(var(--teal-rgb),0.28)' : 'rgba(var(--purple-rgb),0.22)';
    const style = `position:absolute;left:${x}px;top:-100px;width:1px;height:${height}px;background:linear-gradient(to bottom, transparent, ${color}, transparent);animation:rainFall ${dur.toFixed(2)}s linear infinite;animation-delay:-${delay.toFixed(2)}s;`;
    arr.push({ style });
  }
  return arr;
}

// 舊城區 / 傳送港: slow drifting fog banks — soft blurred ellipses instead of
// the sharp rain streaks, matching a quieter/hazier mood.
function makeMist(n, theme = STAGE_THEMES.default) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const x = -150 + Math.random() * 850;
    const y = 60 + Math.random() * 600;
    const w = 220 + Math.random() * 260;
    const h = 40 + Math.random() * 50;
    const dur = 14 + Math.random() * 10;
    const delay = Math.random() * 10;
    const opacity = 0.05 + Math.random() * 0.07;
    const style = `position:absolute;left:${x.toFixed(0)}px;top:${y.toFixed(0)}px;width:${w.toFixed(0)}px;height:${h.toFixed(0)}px;border-radius:50%;background:radial-gradient(ellipse at center, rgba(200,210,220,${opacity.toFixed(2)}), transparent 70%);filter:blur(6px);animation:mistDrift ${dur.toFixed(1)}s ease-in-out infinite;animation-delay:-${delay.toFixed(1)}s;`;
    arr.push({ style });
  }
  return arr;
}

// 垃圾山: glowing embers drifting upward instead of rain falling down.
function makeEmbers(n, theme = STAGE_THEMES.default) {
  const colors = theme.particleColors || PARTICLE_COLORS;
  const arr = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 700;
    const size = 1.5 + Math.random() * 2.5;
    const dur = 4 + Math.random() * 5;
    const delay = Math.random() * 6;
    const color = colors[i % colors.length];
    const style = `position:absolute;left:${x.toFixed(0)}px;bottom:-20px;width:${size.toFixed(1)}px;height:${size.toFixed(1)}px;border-radius:50%;background:${color};box-shadow:0 0 ${(size * 3).toFixed(1)}px ${color};animation:emberRise ${dur.toFixed(2)}s ease-in infinite;animation-delay:-${delay.toFixed(2)}s;`;
    arr.push({ style });
  }
  return arr;
}

const STAGE_GLYPH_CHARS = '01アイウカラ$#%&NTUAXMFJIQSO'.split('');
function makeStageGlyphs(n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const dur = 3 + Math.random() * 3;
    const delay = Math.random() * 4;
    const size = 10 + Math.random() * 8;
    const ch = STAGE_GLYPH_CHARS[Math.floor(Math.random() * STAGE_GLYPH_CHARS.length)];
    const style = `position:absolute;left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;font-size:${size.toFixed(0)}px;color:rgba(var(--teal-rgb),0.3);font-family:var(--font-ui);animation:glyphDrift ${dur.toFixed(2)}s ease-in-out ${(-delay).toFixed(2)}s infinite;pointer-events:none;`;
    arr.push({ ch, style });
  }
  return arr;
}

export {
  PARTICLE_COLORS, STAGE_THEMES,
  makeParticles, makeBuildings, makeFarBuildings, makeRain, makeMist, makeEmbers, makeStageGlyphs,
};
