import { useState } from 'react';
import { css, mix } from '../../lib/css.js';

function BulbIcon({ color, size = 14 }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size, flexShrink: 0 }}>
      <path
        d="M12 3a6.5 6.5 0 0 0-3.8 11.8c.5.36.8.95.8 1.6V17a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1v-.6c0-.65.3-1.24.8-1.6A6.5 6.5 0 0 0 12 3z"
        fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round"
      />
      <line x1="10" y1="21" x2="14" y2="21" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <line x1="12" y1="17.5" x2="12" y2="14.5" stroke={color} strokeWidth="1.6" />
    </svg>
  );
}

/**
 * Floating hint button anchored to a beat's answer-terminal corner — only
 * rendered by the caller when `beat.points > 100`. First open charges
 * HINT_COST (see App.jsx `useHint`); re-opening the same beat's hint is
 * free (`used` is already true by then). Hint copy lives in `beat.hint`,
 * filled in per-puzzle later — shows a placeholder until then so the
 * interaction is fully testable ahead of that content.
 */
export function HintButton({ hint, used, onUse }) {
  const [open, setOpen] = useState(false);
  const [justCharged, setJustCharged] = useState(false);

  const openPopup = () => {
    setJustCharged(!used);
    if (!used) onUse();
    setOpen(true);
  };

  return (
    <>
      <button
        className="press95"
        onClick={openPopup}
        title={used ? '查看提示' : '查看提示（扣 100 分）'}
        style={{
          position: 'absolute', top: 8, right: 8, zIndex: 6, width: 26, height: 26,
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
          background: mix('var(--gold)', 16), border: `1px solid ${mix('var(--gold)', 50)}`,
          boxShadow: `0 0 10px ${mix('var(--gold)', 25)}`,
          animation: used ? 'none' : 'deskGlowPulse 2.6s ease-in-out infinite',
        }}
      >
        <BulbIcon color="var(--gold)" />
      </button>

      {open && (
        <div
          style={css('position:absolute;inset:0;z-index:20;border-radius:14px;background:rgba(3,4,9,0.84);display:flex;align-items:center;justify-content:center;padding:16px;animation:foodOverlayIn 0.2s ease both;')}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={css('width:100%;max-width:320px;border-radius:12px;background:var(--modal-bg);border:2px solid var(--gold);box-shadow:0 20px 40px rgba(0,0,0,0.6), 0 0 24px rgba(var(--gold-rgb),0.25);padding:18px 18px 16px;text-align:center;animation:foodCheckPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both;')}
          >
            <div style={css('display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px;')}>
              <BulbIcon color="var(--gold-bright)" size={16} />
              <span style={css('color:var(--gold-text);font-size:11px;letter-spacing:3px;')}>HINT // 提示</span>
            </div>
            <div style={css('color:var(--cream-text);font-size:14px;line-height:1.8;min-height:24px;')}>
              {hint || '（提示尚未設定）'}
            </div>
            <div style={{
              ...css('font-size:10px;letter-spacing:1px;margin-top:14px;'),
              color: justCharged ? 'var(--pink-text)' : 'var(--purple-text-faint)',
            }}>
              {justCharged ? '− 100 SCORE' : '已扣過分數，可重複查看'}
            </div>
            <button
              className="press96"
              onClick={() => setOpen(false)}
              style={css("margin-top:14px;height:38px;padding:0 24px;background:var(--purple-btn);border:1px solid var(--purple-border);color:var(--purple-text);border-radius:8px;font-size:12px;letter-spacing:2px;cursor:pointer;")}
            >關閉</button>
          </div>
        </div>
      )}
    </>
  );
}
