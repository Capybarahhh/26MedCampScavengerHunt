import { useId, useState } from 'react';
import { css, mix } from '../../lib/css.js';

// A small flat glyph — used only for the modal header, where a full 3D
// render would be overkill next to a line of text.
function BulbGlyph({ color, size = 22 }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size, flexShrink: 0 }}>
      <circle cx="12" cy="10" r="7" fill="none" stroke={color} strokeWidth="1.5" />
      <path d="M9 8.5 L11 12 L9.5 13 L12.5 16.5" fill="none" stroke={color} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <path d="M9.5 16.5h5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <rect x="9.8" y="17.4" width="4.4" height="1.6" rx="0.5" fill={color} opacity="0.9" />
      <rect x="10.1" y="19.3" width="3.8" height="1.5" rx="0.5" fill={color} opacity="0.65" />
    </svg>
  );
}

// A COMPLETE bulb, rendered as a real object rather than an icon: glass dome
// (radial sheen + specular highlight), a visible filament, and a threaded
// Edison screw base. `variant` picks which of the three mounted bulbs this
// is: 'lit' (charged, inviting a click, flickering filament), 'steady' (the
// same bulb once its hint has been opened — full brightness, held
// constant, no more flicker), or 'off' (the two decorative flanking bulbs —
// cool dead glass, dark filament, never glows; only the center bulb is
// ever wired to anything).
function BulbObject({ variant = 'lit', width = 30, height = 53 }) {
  const uid = useId();
  const glassId = `hbGlass-${uid}`;
  const threadId = `hbThread-${uid}`;
  const isLit = variant === 'lit' || variant === 'steady';
  const glass = isLit
    ? ['rgba(255,244,210,0.95)', 'rgba(255,205,100,0.5)']
    : ['rgba(210,214,224,0.2)', 'rgba(190,194,206,0.07)'];
  const filamentColor = isLit ? '#ffe07a' : '#464650';
  const glow = isLit;
  const flicker = variant === 'lit';
  return (
    <svg viewBox="0 0 34 60" width={width} height={height} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <radialGradient id={glassId} cx="38%" cy="28%" r="78%">
          <stop offset="0%" stopColor={glass[0]} />
          <stop offset="55%" stopColor={glass[1]} />
          <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
        </radialGradient>
        <linearGradient id={threadId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#241f14" />
          <stop offset="45%" stopColor="#9a7f42" />
          <stop offset="55%" stopColor="#9a7f42" />
          <stop offset="100%" stopColor="#1c1710" />
        </linearGradient>
      </defs>
      {/* glass dome + neck, one continuous outline */}
      <path
        d="M17 2 C7.5 2 2 9.5 2 18 C2 25.5 6.5 30 10.5 34 L10.5 39 L23.5 39 L23.5 34 C27.5 30 32 25.5 32 18 C32 9.5 26.5 2 17 2 Z"
        fill={`url(#${glassId})`} stroke="rgba(255,255,255,0.28)" strokeWidth="1"
      />
      {/* specular highlight */}
      <ellipse cx="10.5" cy="13" rx="3.6" ry="7" fill="rgba(255,255,255,0.4)" transform="rotate(-22 10.5 13)" />
      {/* filament, glowing + flickering only on the live bulb */}
      <path
        d="M13 22 L15.5 28 L13.8 30 L17 36 L20.2 30 L18.5 28 L21 22"
        fill="none" stroke={filamentColor} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
        style={{
          filter: glow ? 'drop-shadow(0 0 4px #ffcf5c) drop-shadow(0 0 8px #ffb339)' : 'none',
          animation: flicker ? 'filamentFlicker 2.2s ease-in-out infinite' : 'none',
        }}
      />
      {/* screw base */}
      <rect x="10.5" y="39" width="13" height="3.5" fill="#1c1710" />
      {[42.5, 45.3, 48.1, 50.9].map((y) => <rect key={y} x="10.5" y={y} width="13" height="2.2" fill={`url(#${threadId})`} />)}
      <rect x="12.5" y="53.5" width="9" height="4.5" rx="1.4" fill="#141009" />
    </svg>
  );
}

// One bulb, socketed into a recessed ring so its base reads as mounted
// THROUGH the casing wall rather than resting on top of it.
function BulbSlot({ variant, scale = 1, interactive, onClick, title }) {
  const w = 22 * scale;
  const h = 40 * scale;
  const body = (
    <div style={{ position: 'relative', width: w, height: h }}>
      <div style={{
        position: 'absolute', bottom: 1, left: '50%', width: 15 * scale, height: 15 * scale,
        borderRadius: '50%', transform: 'translateX(-50%)', zIndex: 0,
        background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.05), #05060a 70%)',
        boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.8), inset 0 -1px 2px rgba(255,255,255,0.05), 0 1px 2px rgba(0,0,0,0.5)',
        border: '1px solid rgba(0,0,0,0.6)',
      }} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <BulbObject variant={variant} width={w} height={h} />
      </div>
    </div>
  );
  if (!interactive) return <div style={{ pointerEvents: 'none' }}>{body}</div>;
  return (
    <button
      className="press95"
      onClick={onClick}
      title={title}
      style={{
        position: 'relative', zIndex: 1, background: 'none', border: 'none', padding: 0, margin: 0,
        cursor: 'pointer', pointerEvents: 'auto', lineHeight: 0,
        filter: `drop-shadow(0 0 10px ${mix('var(--gold)', 55)})`,
        animation: variant === 'lit' ? 'deskGlowPulse 2.2s ease-in-out infinite' : 'none',
      }}
    >
      {body}
    </button>
  );
}

// Hint copy may wrap a key phrase in 『...』 to call it out — split on that
// delimiter and render the wrapped portion emphasized (matching the 「」
// emphasis already used for key terms in story dialogue), rather than
// requiring hint text to be authored as a segs array like descSegs. A plain
// "\n" in the hint string breaks it into separate paragraph blocks (for
// multi-step hints), since HTML collapses raw newlines otherwise.
function renderHintLine(line) {
  return line.split(/(『[^『』]*』)/g).map((part, i) => (
    part.startsWith('『') && part.endsWith('』')
      ? <span key={i} style={{ color: 'var(--gold-bright)', fontWeight: 700, textShadow: '0 0 8px rgba(var(--gold-rgb),0.55)' }}>{part}</span>
      : <span key={i}>{part}</span>
  ));
}
function renderHint(hint) {
  if (!hint) return '（提示尚未設定）';
  const lines = hint.split('\n');
  if (lines.length === 1) return renderHintLine(lines[0]);
  return lines.map((line, li) => (
    <div key={li} style={li < lines.length - 1 ? { marginBottom: 10 } : undefined}>
      {renderHintLine(line)}
    </div>
  ));
}

/**
 * Three bulbs socketed into the top of the casing, wired together on a
 * shared festoon line — a nod to marquee/theater lighting where only one
 * bulb in the string actually works. Only the CENTER bulb is interactive:
 * it's the hint control (flickering while unpaid — an invitation to click —
 * then holding a constant full glow once opened, staying lit rather than
 * dimming down). The two flanking bulbs are decorative, but light up
 * together with the center one once it's revealed, instead of staying
 * dead forever.
 *
 * `used` means "free to view" — either the hint was already paid for
 * (hintsUsed persisted), OR the caller passes it as already-true because
 * the beat is already answered correctly (see PuzzleBeat/ColorPickBeat:
 * `used={hintUsed || status === 'correct'}` — no point charging for a
 * hint on a puzzle you've already solved). A first, chargeable open asks
 * for confirmation before spending HINT_COST (see App.jsx `useHint`); a
 * free open skips straight to the hint. The cost itself is silent by
 * design — the score system records it, but neither modal surfaces a
 * "− 100"/"already charged" note. Hint copy lives in `beat.hint`, filled
 * in per-puzzle later — shows a placeholder until then so the interaction
 * is fully testable ahead of that content.
 */
export function HintButton({ hint, used, onUse }) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const handleBulbClick = () => {
    if (used) { setOpen(true); return; }
    setConfirming(true);
  };
  const confirmUse = () => {
    onUse();
    setConfirming(false);
    setOpen(true);
  };

  return (
    <>
      <div style={css('position:absolute;top:-32px;left:50%;z-index:6;display:flex;align-items:flex-end;gap:7px;pointer-events:none;transform:translateX(-50%);')}>
        {/* Festoon wire strung behind the three sockets. */}
        <svg viewBox="0 0 100 20" preserveAspectRatio="none" style={css('position:absolute;left:0;bottom:13px;width:100%;height:16px;overflow:visible;pointer-events:none;z-index:0;')}>
          <path d="M4 3 Q 25 15 50 5 Q 75 -5 96 3" fill="none" stroke="var(--gold-dim)" strokeWidth="1.4" strokeLinecap="round" />
        </svg>

        <BulbSlot variant={used ? 'steady' : 'off'} scale={0.7} />
        <BulbSlot
          variant={used ? 'steady' : 'lit'}
          interactive
          onClick={handleBulbClick}
          title="查看提示"
        />
        <BulbSlot variant={used ? 'steady' : 'off'} scale={0.7} />
      </div>

      {confirming && (
        <div
          style={css('position:absolute;inset:0;z-index:20;border-radius:14px;background:rgba(3,4,9,0.84);display:flex;align-items:center;justify-content:center;padding:16px;animation:foodOverlayIn 0.2s ease both;')}
          onClick={() => setConfirming(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={css('width:100%;max-width:320px;border-radius:12px;background:var(--modal-bg);border:2px solid var(--gold);box-shadow:0 20px 40px rgba(0,0,0,0.6), 0 0 24px rgba(var(--gold-rgb),0.25);padding:18px 18px 16px;text-align:center;animation:foodCheckPop 0.3s cubic-bezier(0.34,1.56,0.64,1) both;')}
          >
            <div style={css('display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:12px;')}>
              <BulbGlyph color="var(--gold-bright)" size={18} />
              <span style={css('color:var(--gold-text);font-size:11px;letter-spacing:3px;')}>HINT // 提示</span>
            </div>
            <div style={css('color:var(--cream-text);font-size:14px;line-height:1.8;')}>
              要查看提示嗎？<br />將扣除 200 分。
            </div>
            <div style={css('display:flex;gap:10px;margin-top:18px;')}>
              <button
                className="press96"
                onClick={() => setConfirming(false)}
                style={css("flex:1;height:38px;background:var(--purple-btn);border:1px solid var(--purple-border);color:var(--purple-text);border-radius:8px;font-size:12px;letter-spacing:2px;cursor:pointer;")}
              >取消</button>
              <button
                className="press96"
                onClick={confirmUse}
                style={css("flex:1;height:38px;background:var(--gold-bg);border:1px solid var(--gold);color:var(--gold-text);border-radius:8px;font-size:12px;letter-spacing:2px;cursor:pointer;")}
              >確認查看</button>
            </div>
          </div>
        </div>
      )}

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
              <BulbGlyph color="var(--gold-bright)" size={18} />
              <span style={css('color:var(--gold-text);font-size:11px;letter-spacing:3px;')}>HINT // 提示</span>
            </div>
            <div className="text-wrap-pretty" style={css('color:var(--cream-text);font-size:14px;line-height:1.8;min-height:24px;')}>
              {renderHint(hint)}
            </div>
            <button
              className="press96"
              onClick={() => setOpen(false)}
              style={css("margin-top:18px;height:38px;padding:0 24px;background:var(--purple-btn);border:1px solid var(--purple-border);color:var(--purple-text);border-radius:8px;font-size:12px;letter-spacing:2px;cursor:pointer;")}
            >關閉</button>
          </div>
        </div>
      )}
    </>
  );
}
