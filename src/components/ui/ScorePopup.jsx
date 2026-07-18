import { css, mix } from '../../lib/css.js';

// Brief floating score readout shown once a puzzle/colorpick/etc. is
// answered correctly — the net for THIS beat (its full point value minus
// whatever wrong-attempt penalties already fired while solving it), not
// just the raw point value, so it reads as "here's what that was actually
// worth" rather than a flat animation of a number nobody attempts affected.
export function ScorePopup({ amount }) {
  if (amount == null) return null;
  const positive = amount >= 0;
  const accent = positive ? 'var(--gold)' : 'var(--pink)';
  const bright = positive ? 'var(--gold-bright)' : 'var(--pink-text)';
  return (
    <div
      style={{
        position: 'absolute', top: -16, left: '50%', zIndex: 30, pointerEvents: 'none',
        display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
        padding: '6px 16px', borderRadius: 20,
        background: `linear-gradient(180deg, ${mix(accent, 22)}, ${mix(accent, 6)})`,
        border: `1px solid ${mix(accent, 60)}`,
        boxShadow: `0 0 22px ${mix(accent, 35)}`,
        animation: 'scorePopupRise 1.7s cubic-bezier(0.16,1,0.3,1) both',
      }}
    >
      <span style={{ color: accent, fontSize: 11 }}>◆</span>
      <span style={{
        ...css('font-family:var(--font-display);font-weight:700;letter-spacing:1px;font-size:19px;'),
        color: bright, textShadow: `0 0 12px ${mix(accent, 80)}`,
      }}>{positive ? '+' : '−'}{Math.abs(amount)}</span>
      <span style={{ color: accent, fontSize: 9, letterSpacing: 2, opacity: 0.85 }}>SCORE</span>
    </div>
  );
}
