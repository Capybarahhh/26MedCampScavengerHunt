import { FRAGMENT_ORDER, makePieceNode } from '../../lib/pieces.js';
import { css } from '../../lib/css.js';

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
          return (
            <div key={letter} style={{
              ...css('border-radius:12px;display:flex;align-items:center;justify-content:center;min-height:160px;position:relative;overflow:hidden;'),
              background: collected ? 'var(--gold-deep)' : 'var(--purple-deep)',
              border: `2px ${collected ? 'solid' : 'dashed'} ${collected ? 'var(--gold)' : 'var(--purple-locked)'}`,
              boxShadow: collected ? '0 0 20px rgba(var(--gold-rgb),0.25), inset 0 0 16px rgba(var(--gold-rgb),0.12)' : 'none',
            }}>
              <div style={css('position:absolute;inset:0;background-image:repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px);pointer-events:none;')} />
              {collected
                ? makePieceNode(letter, i, 110, { gidSuffix: 'bp' })
                : <span style={css('color:var(--purple-locked);font-size:36px;position:relative;z-index:1;')}>?</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
