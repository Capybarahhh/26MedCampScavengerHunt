import { css, mix } from '../../lib/css.js';

/**
 * The answer-input terminal shared by PuzzleBeat and ColorPickBeat, modeled
 * directly on a reference device: a closed loop of thick metal piping runs
 * the full perimeter (each pipe carrying its own embedded neon core), bolted
 * corner joints where the pipes meet, cable clusters spilling out of the top
 * corners, a vertical status plate mounted on the left wall, a separate
 * instruction plate up top, and only THEN — inset in the middle, held by all
 * of that hardware — the actual dark input screen. The screen is the
 * smallest, least prominent layer, not the whole component.
 *
 * `borderColor` is the status tint (idle purple / wrong pink / correct teal)
 * and may be a var(--…) reference — all fades go through mix().
 */
// A small glossy "physical button" dot — inset+outer shadow so the header's
// three indicator lights read as raised hardware, not flat CSS circles.
function PanelButton({ color, glow }) {
  return (
    <span style={{
      width: 7, height: 7, borderRadius: '50%', background: color, display: 'inline-block',
      boxShadow: `inset 0 -1px 1px rgba(0,0,0,0.55), inset 0 1px 1px rgba(255,255,255,0.45), 0 0 5px ${glow}`,
    }} />
  );
}

// A bolted plate seated at each casing corner, spanning where the perimeter
// pipes meet — reads as load-bearing hardware, not a decal.
function CornerJoint({ v, h }) {
  return (
    <div style={{
      position: 'absolute', [v]: 1, [h]: 1, width: 15, height: 15, borderRadius: 4, zIndex: 4,
      background: 'linear-gradient(135deg, rgba(255,255,255,0.16), var(--screw) 55%)',
      border: '1px solid rgba(0,0,0,0.55)',
      boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.18), inset 0 -1px 2px rgba(0,0,0,0.65)',
    }}>
      <div style={{
        position: 'absolute', top: '50%', left: '50%', width: 5, height: 5, borderRadius: '50%',
        transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.6)',
        boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.15)',
      }} />
    </div>
  );
}

// One segment of the perimeter pipe: a thick cylindrical metal tube with a
// glowing neon core running down its center, carrying a traveling current
// shimmer — so the frame reads as live hardware, not a static outline.
// `axis` picks horizontal (top/bottom) vs vertical (left/right) shading and
// inner-core geometry.
function Pipe({ side, axis, borderColor }) {
  const horizontal = axis === 'h';
  const base = {
    position: 'absolute', zIndex: 3, borderRadius: 999,
    boxShadow: '0 1px 3px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.12)',
    background: horizontal
      ? 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(255,255,255,0.16) 38%, var(--bezel) 55%, rgba(0,0,0,0.5) 100%)'
      : 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(255,255,255,0.16) 38%, var(--bezel) 55%, rgba(0,0,0,0.5) 100%)',
    ...(horizontal
      ? { [side]: 4, left: 18, right: 18, height: 9 }
      : { [side]: 4, top: 18, bottom: 18, width: 9 }),
  };
  const core = horizontal
    ? { position: 'absolute', top: '50%', left: 6, right: 6, height: 3, transform: 'translateY(-50%)', borderRadius: 2 }
    : { position: 'absolute', left: '50%', top: 6, bottom: 6, width: 3, transform: 'translateX(-50%)', borderRadius: 2 };
  const currentStripe = horizontal
    ? `linear-gradient(90deg, transparent 0%, ${mix(borderColor, 95)} 12%, transparent 24%)`
    : `linear-gradient(180deg, transparent 0%, ${mix(borderColor, 95)} 12%, transparent 24%)`;
  return (
    <div style={base}>
      <div style={{ ...core, background: mix(borderColor, 60), boxShadow: `0 0 6px ${mix(borderColor, 85)}, 0 0 14px ${mix(borderColor, 45)}`, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, background: currentStripe,
          backgroundSize: horizontal ? '340% 100%' : '100% 340%',
          animation: `${horizontal ? 'pipeCurrentH' : 'pipeCurrentV'} 2.6s linear infinite`,
        }} />
      </div>
    </div>
  );
}

// A thick rubber-insulated power cable wrapped around the OUTSIDE of the
// whole casing (outside even the piping frame), carrying its own visible
// current stripe — a second, heavier layer of "electricity running through
// this thing" distinct from the neon core inside the pipes.
function OuterWire({ side, axis, borderColor }) {
  const horizontal = axis === 'h';
  const base = {
    position: 'absolute', zIndex: 0, borderRadius: 999,
    background: horizontal
      ? 'linear-gradient(to bottom, #04050a 0%, #1c222b 45%, #04050a 100%)'
      : 'linear-gradient(to right, #04050a 0%, #1c222b 45%, #04050a 100%)',
    boxShadow: '0 2px 5px rgba(0,0,0,0.65), inset 0 1px 1px rgba(255,255,255,0.07)',
    ...(horizontal
      ? { [side]: -10, left: 12, right: 12, height: 9 }
      : { [side]: -10, top: 12, bottom: 12, width: 9 }),
  };
  const core = horizontal
    ? { position: 'absolute', top: '50%', left: 4, right: 4, height: 2.6, transform: 'translateY(-50%)', borderRadius: 2 }
    : { position: 'absolute', left: '50%', top: 4, bottom: 4, width: 2.6, transform: 'translateX(-50%)', borderRadius: 2 };
  const stripe = horizontal
    ? `linear-gradient(90deg, transparent 0%, ${mix(borderColor, 95)} 9%, transparent 18%)`
    : `linear-gradient(180deg, transparent 0%, ${mix(borderColor, 95)} 9%, transparent 18%)`;
  return (
    <div style={base}>
      <div style={{ ...core, overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0, background: stripe,
          backgroundSize: horizontal ? '300% 100%' : '100% 300%',
          animation: `${horizontal ? 'pipeCurrentH' : 'pipeCurrentV'} 1.3s linear infinite`,
        }} />
      </div>
    </div>
  );
}

// Rubber grommet joining the outer wire's four segments at the corners.
function OuterWireCap({ v, h }) {
  return (
    <div style={{
      position: 'absolute', [v]: -12, [h]: -12, width: 14, height: 14, borderRadius: '50%', zIndex: 0,
      background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.14), #04050a 70%)',
      boxShadow: '0 2px 5px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.1)',
      border: '1px solid rgba(0,0,0,0.6)',
    }} />
  );
}

const statusWord = { idle: 'STANDBY // 待機', wrong: 'ERROR // 錯誤', correct: 'ONLINE // 已驗證' };

export function AnswerTerminal({ borderColor, status, label, headerRight, wrongMsg, correctMsg, children }) {
  return (
    <div style={{
      position: 'relative', borderRadius: 22, padding: 18, transformOrigin: 'center top',
      background: `linear-gradient(155deg, rgba(255,255,255,0.08), transparent 32%, rgba(0,0,0,0.42)), var(--bezel)`,
      boxShadow: `inset 0 2px 0 rgba(255,255,255,0.09), inset 0 -3px 7px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,0,0,0.5), 0 18px 36px rgba(0,0,0,0.6)`,
      animation: `${status === 'wrong' ? 'glitchShift 0.4s ease' : 'none'}, screenBoot 0.85s cubic-bezier(0.2,0.9,0.25,1) 0.08s both`,
    }}>
      {status === 'correct' && (
        <div style={css('position:absolute;inset:-4px;border-radius:24px;border:2px solid var(--teal);animation:successRipple 0.9s ease-out both;pointer-events:none;')} />
      )}

      {/* Outer power cable, wrapped around the whole casing from the
          outside, with its own continuous current animation. */}
      <OuterWire side="top" axis="h" borderColor={borderColor} />
      <OuterWire side="bottom" axis="h" borderColor={borderColor} />
      <OuterWire side="left" axis="v" borderColor={borderColor} />
      <OuterWire side="right" axis="v" borderColor={borderColor} />
      <OuterWireCap v="top" h="left" />
      <OuterWireCap v="top" h="right" />
      <OuterWireCap v="bottom" h="left" />
      <OuterWireCap v="bottom" h="right" />

      {/* Casing texture — faint brushed-metal streaks across the bezel. */}
      <div style={css('position:absolute;inset:0;border-radius:22px;z-index:0;pointer-events:none;background-image:repeating-linear-gradient(100deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 5px);')} />

      {/* Closed loop of piping around the full perimeter, each carrying its
          own neon core, bolted together at the four corners. */}
      <Pipe side="top" axis="h" borderColor={borderColor} />
      <Pipe side="bottom" axis="h" borderColor={borderColor} />
      <Pipe side="left" axis="v" borderColor={borderColor} />
      <Pipe side="right" axis="v" borderColor={borderColor} />
      <CornerJoint v="top" h="left" />
      <CornerJoint v="top" h="right" />
      <CornerJoint v="bottom" h="left" />
      <CornerJoint v="bottom" h="right" />

      {/* Cable clusters spilling out of the top corners — coiled/wrapped
          wire (a tight spring path, not a single smooth curve) plus one
          status-tinted wire per side, texture only. */}
      <svg viewBox="0 0 40 30" style={css('position:absolute;top:-15px;left:8px;width:26px;height:22px;overflow:visible;pointer-events:none;z-index:0;')}>
        <path d="M10 27 C13 24, 7 23, 10 20 C13 17, 7 16, 10 13 C13 10, 7 9, 10 6 C12 4, 8 3, 8 1" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M18 27 C15 23, 21 21, 17 17 C14 14, 20 12, 17 8 C15 5, 19 3, 16 -1" fill="none" stroke={mix(borderColor, 35)} strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <svg viewBox="0 0 40 30" style={css('position:absolute;top:-15px;right:8px;width:26px;height:22px;overflow:visible;pointer-events:none;z-index:0;')}>
        <path d="M4 27 C1 24, 7 23, 4 20 C1 17, 7 16, 4 13 C1 10, 7 9, 4 6 C2 4, 6 3, 6 1" fill="none" stroke="rgba(0,0,0,0.55)" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M12 27 C15 23, 9 21, 13 17 C16 14, 10 12, 13 8 C15 5, 11 3, 14 -1" fill="none" stroke={mix(borderColor, 35)} strokeWidth="1.5" strokeLinecap="round" />
      </svg>

      {/* Power cable — plugged into the bottom-left corner, a lit pulse
          crawling down it toward the (implied) floor. Same offset-path +
          signalTravel technique as the map's traveling signal dot, rather
          than SVG SMIL (<animateMotion>), which happy-dom/older engines
          don't reliably animate. */}
      <svg viewBox="0 0 40 34" style={css('position:absolute;bottom:-18px;left:6px;width:34px;height:30px;overflow:visible;pointer-events:none;z-index:0;')}>
        <path d="M6 4 C6 16, 22 10, 22 24 S 10 30, 12 33" fill="none" stroke={mix(borderColor, 45)} strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div style={{
        position: 'absolute', bottom: -18, left: 6, width: 4, height: 4, margin: '-2px 0 0 -2px',
        borderRadius: '50%', background: borderColor, boxShadow: `0 0 6px ${borderColor}`,
        animation: 'signalTravel 2.4s linear infinite', pointerEvents: 'none', zIndex: 0,
        offsetPath: "path('M6 4 C6 16, 22 10, 22 24 S 10 30, 12 33')",
      }} />

      {/* Vertical status plate, mounted flush on the left wall — a physical
          readout of idle/wrong/correct, not just a text label. */}
      <div style={{
        position: 'absolute', left: -11, top: '18%', bottom: '18%', width: 20, zIndex: 5, borderRadius: 6,
        background: 'linear-gradient(155deg, rgba(255,255,255,0.1), transparent 40%, rgba(0,0,0,0.4)), var(--bezel)',
        border: '1px solid rgba(0,0,0,0.5)',
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -2px 4px rgba(0,0,0,0.6), 0 0 10px ${mix(borderColor, 20)}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
      }}>
        <span style={{
          writingMode: 'vertical-rl', fontSize: 9, letterSpacing: 2, color: borderColor,
          textShadow: `0 0 6px ${mix(borderColor, 60)}`, whiteSpace: 'nowrap',
        }}>{statusWord[status] || statusWord.idle}</span>
      </div>

      {/* Hardware dials, stacked on the lower-right casing wall — each with
          a rotated indicator line, like a real potentiometer. */}
      {[{ bottom: 34, rot: 25 }, { bottom: 20, rot: -18 }].map(({ bottom, rot }) => (
        <div key={bottom} style={{ position: 'absolute', right: -2, bottom, width: 10, height: 10, borderRadius: '50%', zIndex: 4, background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.3), var(--bezel) 72%)', border: '1px solid rgba(0,0,0,0.55)', boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), inset 0 -1px 2px rgba(0,0,0,0.6)' }}>
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 1.4, height: 4, background: 'rgba(255,255,255,0.55)', transform: `translate(-50%,-100%) rotate(${rot}deg)`, transformOrigin: 'bottom center', borderRadius: 1 }} />
        </div>
      ))}

      {/* Instruction plate — a separate inset panel above the screen,
          carrying the label/status text, rather than being the screen's
          own first row. */}
      <div style={{
        position: 'relative', zIndex: 2, margin: '2px 6px 8px', borderRadius: 8, padding: '9px 14px',
        background: 'var(--panel-2)', border: `1px solid ${mix(borderColor, 40)}`,
        boxShadow: `inset 0 2px 6px rgba(0,0,0,0.6), 0 0 10px ${mix(borderColor, 15)}`,
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <PanelButton color="var(--pink-dot)" glow="rgba(255,85,102,0.6)" />
        <PanelButton color="var(--gold)" glow="rgba(240,192,48,0.6)" />
        <PanelButton color="var(--teal)" glow={`rgba(var(--teal-rgb),0.6)`} />
        <span style={{ ...css('font-size:11px;letter-spacing:2px;flex:1;'), color: borderColor, textShadow: `0 0 6px ${mix(borderColor, 53)}`, animation: 'neonFlicker 4.6s linear infinite' }}>◆ {label}</span>
        {headerRight ?? <span style={css('color:var(--pink-rec);font-size:9px;letter-spacing:1px;animation:recBlink 1.6s step-start infinite;')}>● REC</span>}
      </div>

      {/* The screen itself — the smallest, least prominent layer, seated in
          the middle of all the hardware above rather than being the whole
          component. */}
      <div style={{
        position: 'relative', zIndex: 2, margin: '0 6px 6px', borderRadius: 10, overflow: 'hidden',
        background: `radial-gradient(ellipse at 50% 0%, ${mix(borderColor, 7)}, var(--panel-2) 70%)`,
        border: `1px solid ${mix(borderColor, 53)}`,
        boxShadow: `inset 0 3px 10px rgba(0,0,0,0.75), inset 0 0 30px ${mix(borderColor, 13)}, 0 0 22px ${mix(borderColor, 13)}`,
      }}>
        <div style={css('position:absolute;inset:0;z-index:1;pointer-events:none;background-image:repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px);')} />
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
