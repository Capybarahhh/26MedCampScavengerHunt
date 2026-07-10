import { FRAGMENT_COLORS, FRAGMENT_ORDER, makePieceNode } from '../../lib/pieces.js';
import { css } from '../../lib/css.js';

// FRAGMENT OBTAINED: the reward moment after solving a stage's final puzzle.
export function FragmentBeat({ beat, onCollect }) {
  const colors = FRAGMENT_COLORS[beat.letter] || { light: '#e8d080', dark: '#a07820' };
  return (
    <div style={css('flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;')}>
      <div style={css('color:var(--teal-bright);font-size:15px;letter-spacing:6px;text-shadow:0 0 10px rgba(var(--teal-rgb),0.7);animation:fadeUp 0.5s ease both;')}>FRAGMENT OBTAINED</div>

      <div style={{
        filter: `drop-shadow(0 0 20px ${colors.dark}aa)`,
        animation: 'fragPop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.3s both, fragFloat 3s ease-in-out 0.9s infinite',
      }}>
        {makePieceNode(beat.letter, FRAGMENT_ORDER.indexOf(beat.letter), 190, { gidSuffix: 'obt' })}
      </div>

      <div style={css('text-align:center;animation:fadeUp 0.5s ease 1s both;')}>
        <div style={css('color:var(--gold-text);font-size:18px;font-weight:700;letter-spacing:2px;')}>記憶碎片 · {beat.letter}</div>
        <div style={css('color:var(--purple-text-dim);font-size:13px;margin-top:6px;letter-spacing:2px;')}>來源：{beat.source}　情緒：{beat.emotion}</div>
      </div>

      <button
        className="press97"
        onClick={onCollect}
        style={{
          ...css("height:56px;padding:0 32px;background:var(--purple-btn);border:2px solid var(--purple-border);color:var(--purple-text);border-radius:8px;font-size:15px;letter-spacing:4px;cursor:pointer;"),
          animation: 'fadeUp 0.5s ease 1.5s both',
        }}
      >收入背包</button>
    </div>
  );
}
