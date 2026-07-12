// Ambient backdrop generators (particles / buildings / rain / glyphs).
const PARTICLE_COLORS = ['var(--teal)', 'var(--purple)', 'var(--pink)', 'var(--gold)'];

function makeParticles(n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const x = Math.random() * 700;
    const y = Math.random() * 800;
    const size = 1 + Math.random() * 2.4;
    const dur = 5 + Math.random() * 9;
    const delay = Math.random() * 8;
    const color = PARTICLE_COLORS[i % PARTICLE_COLORS.length];
    const style = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:${color};box-shadow:0 0 ${(size * 3).toFixed(1)}px ${color};animation:floatParticle ${dur.toFixed(2)}s ease-in-out infinite, pulseOpacity ${(dur * 0.8).toFixed(2)}s ease-in-out infinite;animation-delay:-${delay.toFixed(2)}s;`;
    arr.push({ style });
  }
  return arr;
}

const WINDOW_COLORS = ['rgba(var(--gold-rgb),0.6)', 'rgba(var(--teal-rgb),0.55)', 'rgba(var(--purple-rgb),0.5)'];

// A far, dim, window-less row behind the main skyline for a bit of depth.
function makeFarBuildings(n) {
  const arr = [];
  let x = -30;
  for (let i = 0; i < n; i++) {
    const width = 40 + Math.random() * 50;
    const height = 40 + Math.random() * 90;
    const style = `position:absolute;left:${x}px;bottom:0;width:${width}px;height:${height}px;background:var(--building-a);opacity:0.45;`;
    arr.push({ style });
    x += width * 0.8;
  }
  return arr;
}

function makeBuildings(n) {
  const arr = [];
  let x = -20;
  for (let i = 0; i < n; i++) {
    const width = 55 + Math.random() * 55;
    const height = 70 + Math.random() * 170;
    const top = i % 2 === 0 ? 'var(--building-a)' : 'var(--building-b)';
    const bottom = i % 2 === 0 ? 'var(--building-b)' : 'var(--building-a)';
    const style = `position:absolute;left:${x}px;bottom:0;width:${width}px;height:${height}px;background:linear-gradient(180deg, ${top} 0%, ${bottom} 88%);box-shadow:inset 0 2px 0 rgba(var(--purple-rgb),0.16), inset 0 0 26px rgba(0,0,0,0.35);`;

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
        if (Math.random() > 0.32) continue; // most windows stay dark
        const wx = margin + c * colStep + Math.random() * 3;
        const wy = margin + r * rowStep + Math.random() * 3;
        const color = WINDOW_COLORS[Math.floor(Math.random() * WINDOW_COLORS.length)];
        const animate = Math.random() < 0.2;
        const anim = animate
          ? `animation:pulseOpacity ${(4 + Math.random() * 6).toFixed(2)}s ease-in-out infinite;animation-delay:-${(Math.random() * 6).toFixed(2)}s;`
          : `opacity:${(0.4 + Math.random() * 0.3).toFixed(2)};`;
        const wStyle = `position:absolute;left:${wx.toFixed(1)}px;top:${wy.toFixed(1)}px;width:3px;height:5px;background:${color};box-shadow:0 0 3px ${color};${anim}`;
        windows.push({ style: wStyle });
      }
    }

    // Some rooftops get an antenna with a slow warning-light blink.
    const hasAntenna = Math.random() < 0.4;
    const antennaX = width * (0.3 + Math.random() * 0.4);
    const antennaH = 10 + Math.random() * 16;
    const antennaStyle = `position:absolute;left:${antennaX.toFixed(1)}px;bottom:${height}px;width:1px;height:${antennaH.toFixed(1)}px;background:rgba(var(--purple-rgb),0.4);`;
    const antennaDotStyle = `position:absolute;left:${(antennaX - 1.5).toFixed(1)}px;bottom:${(height + antennaH - 1).toFixed(1)}px;width:4px;height:4px;border-radius:50%;background:var(--pink);box-shadow:0 0 5px var(--pink);animation:powerDotPulse 2.4s ease-in-out infinite;animation-delay:-${(Math.random() * 2).toFixed(2)}s;`;

    arr.push({ style, windows, hasAntenna, antennaStyle, antennaDotStyle });
    x += width * 0.72;
  }
  return arr;
}

function makeRain(n) {
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

export { PARTICLE_COLORS, makeParticles, makeBuildings, makeFarBuildings, makeRain, makeStageGlyphs };
