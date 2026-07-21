import { css } from '../../lib/css.js';

// Persistent score readout pinned to the top-left corner, shown on every
// screen except the opening intro narration (App.jsx decides when to render
// this) — one consistent place to check the score instead of only seeing it
// on the map.
export function ScoreBadge({ score }) {
  return (
    <div style={css('position:absolute;top:14px;left:14px;z-index:40;display:flex;align-items:center;gap:5px;padding:4px 10px;border-radius:14px;background:rgba(0,0,0,0.18);border:1px solid rgba(var(--gold-rgb),0.22);pointer-events:none;')}>
      <span style={css('color:var(--gold-dim);font-size:8px;letter-spacing:1.5px;opacity:0.6;')}>SCORE</span>
      <span style={{
        ...css('font-family:var(--font-display);font-size:12px;font-weight:700;letter-spacing:0.5px;'),
        color: 'var(--gold-dim)', opacity: 0.75,
      }}>{score}</span>
    </div>
  );
}
