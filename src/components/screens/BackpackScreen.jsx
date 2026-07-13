import { FRAGMENT_COLORS, FRAGMENT_ORDER, makePieceNode } from '../../lib/pieces.js';
import { FRAGMENT_META } from '../../data/stages.js';
import { css, mix } from '../../lib/css.js';

// Collected memory fragments, one slot per fragment in canonical order.
export function BackpackScreen({ collectedFragments, onClose }) {
  return (
    <div style={css('position:absolute;inset:0;z-index:10;padding:26px 24px;display:flex;flex-direction:column;')}>
      <div style={css('display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;')}>
        <div style={css('color:var(--purple-text-dim);font-size:13px;letter-spacing:3px;')}>MNEMO // 記憶背包</div>
        <button className="press96" onClick={onClose} style={css("background:var(--purple-btn);border:2px solid var(--purple-border);color:var(--purple-text);border-radius:8px;height:40px;padding:0 16px;font-size:12px;letter-spacing:2px;cursor:pointer;")}>◂ 返回</button>
      </div>
      <div style={css('color:var(--purple-text-faint);font-size:12px;letter-spacing:2px;margin:14px 0 24px;')}>已收集 {collectedFragments.length} / 6 枚記憶碎片</div>
      <div style={css('flex:1;display:grid;grid-template-columns:repeat(3, 1fr);grid-template-rows:repeat(2, 1fr);gap:20px;align-content:start;')}>
        {FRAGMENT_ORDER.map((letter, i) => {
          const collected = collectedFragments.includes(letter);
          const meta = FRAGMENT_META[letter];
          const glow = FRAGMENT_COLORS[letter]?.light || '#e8d080';
          return (
            <div key={letter} style={{
              ...css('border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:160px;position:relative;overflow:hidden;'),
              background: collected ? 'var(--gold-deep)' : 'var(--purple-deep)',
              border: `2px ${collected ? 'solid' : 'dashed'} ${collected ? 'var(--gold)' : 'var(--purple-locked)'}`,
              boxShadow: collected ? '0 0 20px rgba(var(--gold-rgb),0.25), inset 0 0 16px rgba(var(--gold-rgb),0.12)' : 'none',
              animation: collected ? 'none' : 'foodEmptyPulse 2.2s ease-in-out infinite',
            }}>
              <div style={css('position:absolute;inset:0;background-image:repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px);pointer-events:none;')} />
              {collected ? (
                <>
                  <div style={{
                    position: 'absolute', width: 84, height: 84, borderRadius: '50%',
                    background: `radial-gradient(circle, ${mix(glow, 40)}, transparent 70%)`,
                    filter: 'blur(3px)', pointerEvents: 'none',
                    animation: 'deskGlowPulse 3s ease-in-out infinite',
                  }} />
                  <div style={{
                    position: 'relative', zIndex: 1,
                    animation: `fragPop 0.5s cubic-bezier(0.34,1.56,0.64,1) ${(i * 0.08).toFixed(2)}s both, fragFloat 3s ease-in-out ${(0.5 + i * 0.08).toFixed(2)}s infinite`,
                  }}>
                    {makePieceNode(letter, i, 100, { gidSuffix: 'bp' })}
                  </div>
                  {meta && (
                    <div style={{
                      position: 'relative', zIndex: 1, textAlign: 'center', marginTop: 8,
                      animation: `fadeUp 0.4s ease ${(0.35 + i * 0.08).toFixed(2)}s both`,
                    }}>
                      <div style={css('color:var(--gold-text);font-size:10.5px;letter-spacing:1px;')}>{meta.source}</div>
                      <div style={css('color:var(--gold-dim);font-size:9px;letter-spacing:1px;margin-top:1px;')}>{meta.emotion}</div>
                    </div>
                  )}
                </>
              ) : (
                <span style={css('color:var(--purple-locked);font-size:36px;position:relative;z-index:1;')}>?</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
