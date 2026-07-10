import { css, mix } from '../../lib/css.js';

/**
 * The answer-input terminal frame shared by PuzzleBeat and ColorPickBeat:
 * bezel + status-tinted inner screen + three-dot header with a ● REC blinker
 * (or a custom `headerRight`), then the input UI as children, then the
 * wrong/correct status line.
 *
 * `borderColor` is the status tint (idle purple / wrong pink / correct teal)
 * and may be a var(--…) reference — all fades go through mix().
 */
export function AnswerTerminal({ borderColor, status, label, headerRight, wrongMsg, correctMsg, children }) {
  return (
    <div style={{
      ...css('position:relative;border-radius:14px;background:var(--panel);border:1px solid var(--bezel);padding:10px;box-shadow:0 0 0 1px rgba(var(--teal-rgb),0.08), 0 14px 30px rgba(0,0,0,0.5);transform-origin:center top;'),
      animation: `${status === 'wrong' ? 'glitchShift 0.4s ease' : 'none'}, screenBoot 0.85s cubic-bezier(0.2,0.9,0.25,1) 0.08s both`,
    }}>
      {status === 'correct' && (
        <div style={css('position:absolute;inset:-4px;border-radius:16px;border:2px solid var(--teal);animation:successRipple 0.9s ease-out both;pointer-events:none;')} />
      )}
      <div style={{
        ...css('position:relative;border-radius:8px;overflow:hidden;'),
        background: `radial-gradient(ellipse at 50% 0%, ${mix(borderColor, 7)}, var(--panel-2) 70%)`,
        border: `1px solid ${mix(borderColor, 53)}`,
        boxShadow: `inset 0 0 26px rgba(0,0,0,0.65), inset 0 0 30px ${mix(borderColor, 13)}, 0 0 22px ${mix(borderColor, 13)}`,
      }}>
        <div style={css('position:absolute;inset:0;z-index:1;pointer-events:none;background-image:repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px);')} />
        <div style={{ ...css('position:relative;z-index:2;display:flex;align-items:center;gap:8px;padding:11px 16px;'), borderBottom: `1px dashed ${mix(borderColor, 33)}` }}>
          <span style={css('width:6px;height:6px;border-radius:50%;background:var(--pink-dot);opacity:0.7;')} />
          <span style={css('width:6px;height:6px;border-radius:50%;background:var(--gold);opacity:0.7;')} />
          <span style={css('width:6px;height:6px;border-radius:50%;background:var(--teal);opacity:0.7;')} />
          <span style={{ ...css('font-size:11px;letter-spacing:2px;flex:1;'), color: borderColor, textShadow: `0 0 6px ${mix(borderColor, 53)}` }}>◆ {label}</span>
          {headerRight ?? <span style={css('color:var(--pink-rec);font-size:9px;letter-spacing:1px;animation:recBlink 1.6s step-start infinite;')}>● REC</span>}
        </div>
        <div style={css('position:relative;z-index:2;padding:16px 18px 18px;')}>
          {children}
          {status === 'wrong' && (
            <div style={css('color:var(--pink-text);font-size:13px;margin-top:10px;letter-spacing:1px;')}>▓▓ 錯誤 // {wrongMsg}</div>
          )}
          {status === 'correct' && (
            <div style={css('color:var(--teal-bright);font-size:13px;margin-top:10px;letter-spacing:2px;text-shadow:0 0 8px rgba(var(--teal-rgb),0.7);')}>▓▓ 驗證通過 // {correctMsg}</div>
          )}
        </div>
      </div>
    </div>
  );
}
