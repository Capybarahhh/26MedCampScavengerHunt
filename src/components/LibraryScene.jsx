import { useEffect, useRef, useState } from 'react';
import { css } from '../lib/css.js';

// 圖書館 (R) only: an open book resting in the bottom-right corner. One page
// oscillates back and forth across the spine (a 2D scaleX "flip"), and
// faint English letters occasionally drift up off the pages and fade away —
// kept low-opacity/warm-gold so it reads as ambience, never competing with
// the actual puzzle/dialogue text sitting on top of it. Pure SVG/CSS, same
// corner-scene pattern as JunkyardScene/PortalFlash.
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function makeGlyph(id) {
  const startX = -34 + Math.random() * 108; // relative to the book's spine (x=100)
  const dx = (Math.random() - 0.5) * 44;
  const dy = -(75 + Math.random() * 65);
  const rot = (Math.random() - 0.5) * 50;
  const size = 11 + Math.random() * 7;
  const dur = (3.4 + Math.random() * 2.2).toFixed(2);
  const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
  return { id, letter, startX, dx, dy, rot, size, dur };
}

export function LibraryScene() {
  const [glyphs, setGlyphs] = useState([]);
  const idRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const spawn = () => {
      if (!alive) return;
      setGlyphs((g) => [...g, makeGlyph(idRef.current++)]);
      timerRef.current = setTimeout(spawn, 900 + Math.random() * 1200);
    };
    // Backgrounded tabs pause CSS animations but keep (throttled) timers,
    // which would strand a glyph mid-flight — drop them on hide, resume on
    // return (same guard JunkyardScene/PortalFlash use).
    const onVisibility = () => {
      clearTimeout(timerRef.current);
      setGlyphs([]);
      if (!document.hidden && alive) timerRef.current = setTimeout(spawn, 1000 + Math.random() * 1000);
    };
    timerRef.current = setTimeout(spawn, 600 + Math.random() * 900);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      alive = false;
      clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const removeGlyph = (id) => setGlyphs((g) => g.filter((x) => x.id !== id));

  return (
    <div style={css('position:absolute;right:16px;bottom:24px;width:190px;height:132px;z-index:1;pointer-events:none;overflow:visible;')}>
      <svg viewBox="0 0 200 140" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
        <defs>
          <linearGradient id="libPageGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(240,192,80,0.22)" />
            <stop offset="100%" stopColor="rgba(200,150,60,0.10)" />
          </linearGradient>
        </defs>
        {/* left page stack (static) */}
        <path d="M100 30 C 60 20, 20 26, 6 40 L 6 118 C 20 104, 60 98, 100 108 Z"
          fill="url(#libPageGrad)" stroke="rgba(240,192,80,0.35)" strokeWidth="1.4" />
        {/* right page stack (static, sits under the turning page) */}
        <path d="M100 30 C 140 20, 180 26, 194 40 L 194 118 C 180 104, 140 98, 100 108 Z"
          fill="url(#libPageGrad)" stroke="rgba(240,192,80,0.35)" strokeWidth="1.4" />
        {/* spine shadow */}
        <path d="M100 30 L100 108" stroke="rgba(120,80,20,0.4)" strokeWidth="2" />
        {/* faint text lines for texture, one per static page */}
        <path d="M92 44 C 68 40, 40 42, 18 50" fill="none" stroke="rgba(240,192,80,0.16)" strokeWidth="0.8" />
        <path d="M92 62 C 68 58, 40 60, 18 68" fill="none" stroke="rgba(240,192,80,0.14)" strokeWidth="0.8" />
        <path d="M108 44 C 132 40, 160 42, 182 50" fill="none" stroke="rgba(240,192,80,0.16)" strokeWidth="0.8" />
        <path d="M108 62 C 132 58, 160 60, 182 68" fill="none" stroke="rgba(240,192,80,0.14)" strokeWidth="0.8" />
        {/* the loose page, oscillating right<->left across the spine */}
        <path
          d="M100 30 C 140 20, 180 26, 194 40 L 194 118 C 180 104, 140 98, 100 108 Z"
          fill="rgba(250,210,110,0.28)" stroke="rgba(250,220,130,0.55)" strokeWidth="1.2"
          style={{ transformOrigin: '100px 69px', animation: 'bookPageFlip 4.2s ease-in-out infinite' }}
        />
      </svg>
      {glyphs.map((g) => (
        <span
          key={g.id}
          onAnimationEnd={() => removeGlyph(g.id)}
          style={{
            position: 'absolute', left: 100 + g.startX, top: 58,
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: g.size,
            color: 'rgba(240,200,120,0.24)', textShadow: '0 0 4px rgba(240,192,80,0.15)',
            animation: `libGlyphFloat ${g.dur}s ease-out both`,
            '--dx': `${g.dx.toFixed(1)}px`, '--dy': `${g.dy.toFixed(1)}px`, '--rot': `${g.rot.toFixed(0)}deg`,
          }}
        >{g.letter}</span>
      ))}
    </div>
  );
}
