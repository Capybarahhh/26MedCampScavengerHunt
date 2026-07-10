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

function makeBuildings(n) {
  const arr = [];
  let x = -20;
  for (let i = 0; i < n; i++) {
    const width = 55 + Math.random() * 55;
    const height = 70 + Math.random() * 170;
    const shade = i % 2 === 0 ? 'var(--building-a)' : 'var(--building-b)';
    const style = `position:absolute;left:${x}px;bottom:0;width:${width}px;height:${height}px;background:${shade};box-shadow:inset 0 2px 0 rgba(var(--purple-rgb),0.12);`;
    arr.push({ style });
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
    const style = `position:absolute;left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;font-size:${size.toFixed(0)}px;color:rgba(var(--teal-rgb),0.3);font-family:'Share Tech Mono', monospace;animation:glyphDrift ${dur.toFixed(2)}s ease-in-out ${(-delay).toFixed(2)}s infinite;pointer-events:none;`;
    arr.push({ ch, style });
  }
  return arr;
}

export { PARTICLE_COLORS, makeParticles, makeBuildings, makeRain, makeStageGlyphs };
