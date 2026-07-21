import { useRef, useState } from 'react';
import { FRAGMENT_COLORS, FRAGMENT_ORDER, makePieceNode } from '../../lib/pieces.js';
import { FRAGMENT_META } from '../../data/stages.js';
import { css, mix } from '../../lib/css.js';

// Grid is 3 cols x 2 rows over FRAGMENT_ORDER, so index 1 is the top-middle
// slot and index 4 is the bottom-middle slot.
const CHEAT_TOP_SLOT = 1;
const CHEAT_BOTTOM_SLOT = 4;
const CHEAT_TAPS_NEEDED = 5;
const CHEAT_WINDOW_MS = 10000;

// Collected memory fragments, one slot per fragment in canonical order.
export function BackpackScreen({ collectedFragments, onClose, onReset, onUnlockAll }) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [unlockedFlash, setUnlockedFlash] = useState(false);
  const topTaps = useRef(0);
  const bottomTaps = useRef(0);
  const cheatTimer = useRef(null);

  // Hidden staff shortcut: tap the top-middle slot 5x then the bottom-middle
  // slot 5x, all within 10s, to instantly unlock every fragment + stage.
  // Any tap out of order, or the window expiring, resets the sequence.
  const resetCheat = () => {
    topTaps.current = 0;
    bottomTaps.current = 0;
    clearTimeout(cheatTimer.current);
  };
  const armCheatTimer = () => {
    clearTimeout(cheatTimer.current);
    cheatTimer.current = setTimeout(resetCheat, CHEAT_WINDOW_MS);
  };
  const handleSlotTap = (i) => {
    if (i === CHEAT_TOP_SLOT) {
      if (bottomTaps.current > 0) { resetCheat(); return; }
      topTaps.current += 1;
      armCheatTimer();
    } else if (i === CHEAT_BOTTOM_SLOT) {
      if (topTaps.current < CHEAT_TAPS_NEEDED) { resetCheat(); return; }
      bottomTaps.current += 1;
      armCheatTimer();
      if (bottomTaps.current >= CHEAT_TAPS_NEEDED) {
        resetCheat();
        onUnlockAll();
        setUnlockedFlash(true);
        setTimeout(() => setUnlockedFlash(false), 2400);
      }
    }
  };

  return (
    <div style={css('position:absolute;inset:0;z-index:10;padding:26px 24px;display:flex;flex-direction:column;')}>
      <div style={css('display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;')}>
        <div style={css('color:var(--purple-text-dim);font-size:13px;letter-spacing:3px;')}>CYBERPUNK2157 // 記憶背包</div>
        <button className="press96" onClick={onClose} style={css("background:var(--purple-btn);border:2px solid var(--purple-border);color:var(--purple-text);border-radius:8px;height:40px;padding:0 16px;font-size:12px;letter-spacing:2px;cursor:pointer;")}>◂ 返回</button>
      </div>
      <div style={css('color:var(--purple-text-faint);font-size:12px;letter-spacing:2px;margin:14px 0 24px;')}>已收集 {collectedFragments.length} / 6 枚記憶碎片</div>
      <div style={css('flex:1;display:grid;grid-template-columns:repeat(3, 1fr);grid-template-rows:repeat(2, 1fr);gap:20px;align-content:start;')}>
        {FRAGMENT_ORDER.map((letter, i) => {
          const collected = collectedFragments.includes(letter);
          const meta = FRAGMENT_META[letter];
          const glow = FRAGMENT_COLORS[letter]?.light || '#e8d080';
          return (
            <div
              key={letter}
              onClick={() => handleSlotTap(i)}
              style={{
                ...css('border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:160px;position:relative;overflow:hidden;'),
                background: collected ? 'var(--gold-deep)' : 'var(--purple-deep)',
                border: `2px ${collected ? 'solid' : 'dashed'} ${collected ? 'var(--gold)' : 'var(--purple-locked)'}`,
                boxShadow: collected ? '0 0 20px rgba(var(--gold-rgb),0.25), inset 0 0 16px rgba(var(--gold-rgb),0.12)' : 'none',
                animation: collected ? 'none' : 'foodEmptyPulse 2.2s ease-in-out infinite',
              }}
            >
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

      <button
        className="press97"
        onClick={() => setShowResetConfirm(true)}
        style={css("margin-top:16px;height:44px;background:none;border:1px solid var(--purple-dim);color:var(--purple-text-faint);border-radius:8px;font-size:12px;letter-spacing:2px;cursor:pointer;")}
      >重新開始</button>

      {unlockedFlash && (
        <div style={css('position:absolute;top:14px;left:50%;transform:translateX(-50%);background:var(--gold-deep);border:2px solid var(--gold);color:var(--gold-text);padding:10px 20px;border-radius:8px;font-size:13px;letter-spacing:2px;white-space:nowrap;animation:toastIn 0.25s ease both;z-index:30;')}>已解鎖所有記憶碎片與終章關卡</div>
      )}

      {showResetConfirm && (
        <div style={css('position:absolute;inset:0;z-index:20;background:rgba(3,4,9,0.8);display:flex;align-items:center;justify-content:center;animation:foodOverlayIn 0.2s ease both;')}>
          <div style={css('width:260px;border-radius:14px;background:var(--modal-bg);border:2px solid var(--purple-border);box-shadow:0 20px 44px rgba(0,0,0,0.6), 0 0 24px rgba(var(--purple-border-rgb),0.25);padding:22px 20px;text-align:center;animation:foodCheckPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both;')}>
            <div style={css('color:var(--purple-text);font-size:15px;letter-spacing:1px;line-height:1.7;margin-bottom:18px;')}>確定要重新開始嗎？<br />這會清除小隊目前的所有進度，回到房間碼輸入畫面。</div>
            <div style={css('display:flex;gap:10px;')}>
              <button className="press97" onClick={() => setShowResetConfirm(false)} style={css("flex:1;height:46px;background:var(--purple-panel);border:1px solid var(--purple-dim);color:var(--purple-text-dim);border-radius:8px;font-size:13px;letter-spacing:2px;cursor:pointer;")}>取消</button>
              <button className="press97" onClick={onReset} style={css("flex:1;height:46px;background:var(--pink-bg);border:1px solid var(--pink);color:var(--pink-text);border-radius:8px;font-size:13px;letter-spacing:2px;cursor:pointer;")}>確定重來</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
