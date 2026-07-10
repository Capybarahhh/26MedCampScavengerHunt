import { css, mix } from '../../lib/css.js';

/**
 * The CRT terminal panel used all over the game (intro rules, duel rules,
 * memory terminal, puzzle descriptions, cipher table, food rules).
 * Bezel + screws + scanlines + sweeping glow + accent-tinted header bar.
 *
 * - accent:  panel tint color
 * - title:   header text; tag: small right-aligned header text
 * - boot:    CRT power-on animation duration (e.g. '0.85s'), false to disable
 * - zigzag:  torn paper strip along the bottom edge
 * - small:   compact header (7px dot / 11px font) for secondary panels
 * - headerInset: header rendered inside the padded body (intro rules layout)
 */
export function TerminalPanel({
  accent = 'var(--teal)',
  title,
  tag = null,
  boot = false,
  zigzag = false,
  small = false,
  headerInset = false,
  outerStyle = {},
  bodyStyle = {},
  onClick,
  children,
}) {
  const header = title != null && (
    <div
      style={{
        position: 'relative', zIndex: 3, display: 'flex', alignItems: 'center',
        gap: small ? 10 : 8,
        ...(headerInset
          ? { marginBottom: 16, borderBottom: `1px solid ${mix(accent, 35)}`, paddingBottom: 10 }
          : { padding: small ? '11px 16px' : '11px 18px', borderBottom: `1px solid ${mix(accent, 35)}`, background: mix(accent, 5) }),
      }}
    >
      <span style={{
        width: small ? 7 : 8, height: small ? 7 : 8, borderRadius: '50%',
        background: accent, color: accent, animation: 'powerDotPulse 1.4s ease-in-out infinite',
      }} />
      <span style={{
        color: accent, fontSize: headerInset ? 13 : small ? 11 : 12,
        letterSpacing: headerInset ? 4 : 3, flex: 1, textShadow: `0 0 8px ${mix(accent, 70)}`,
      }}>{title}</span>
      {tag && <span style={{ color: mix(accent, 60), fontSize: 10, letterSpacing: 1 }}>{tag}</span>}
    </div>
  );

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative', borderRadius: 14, background: 'var(--panel)', border: '1px solid var(--bezel)',
        padding: 10,
        boxShadow: `0 0 0 1px ${mix(accent, 8)}, 0 18px 40px rgba(0,0,0,0.55)`,
        ...(boot ? { animation: `screenBoot ${boot} cubic-bezier(0.2,0.9,0.25,1) both`, transformOrigin: 'center top' } : {}),
        ...outerStyle,
      }}
    >
      {/* bezel screws */}
      <div style={css('position:absolute;top:6px;left:9px;width:5px;height:5px;border-radius:50%;background:var(--screw);box-shadow:inset 0 1px 1px rgba(0,0,0,0.6);')} />
      <div style={css('position:absolute;top:6px;right:9px;width:5px;height:5px;border-radius:50%;background:var(--screw);box-shadow:inset 0 1px 1px rgba(0,0,0,0.6);')} />

      <div style={{
        position: 'relative', borderRadius: 8, overflow: 'hidden',
        background: `radial-gradient(ellipse at 50% 0%, ${mix(accent, 10)}, var(--panel-2) 65%)`,
        border: `1px solid ${mix(accent, 40)}`,
        boxShadow: `inset 0 0 30px rgba(0,0,0,0.65), inset 0 0 40px ${mix(accent, 12)}`,
      }}>
        {/* scanlines + sweeping glow */}
        <div style={css('position:absolute;inset:0;z-index:1;pointer-events:none;background-image:repeating-linear-gradient(0deg, rgba(255,255,255,0.05) 0px, rgba(255,255,255,0.05) 1px, transparent 1px, transparent 3px);opacity:0.5;')} />
        <div style={{
          position: 'absolute', left: 0, right: 0, height: 70, zIndex: 1, pointerEvents: 'none',
          background: `linear-gradient(to bottom, transparent, ${mix(accent, 16)}, transparent)`,
          animation: 'scanlineMove 4.5s linear infinite',
        }} />
        {boot && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2, pointerEvents: 'none',
            background: accent, opacity: 0, animation: `screenFlash ${boot} ease-out both`,
          }} />
        )}

        {headerInset ? (
          <div style={{ position: 'relative', padding: '24px 26px', ...bodyStyle }}>
            {header}
            <div style={{ position: 'relative', zIndex: 3 }}>{children}</div>
          </div>
        ) : (
          <>
            {header}
            <div style={{ position: 'relative', zIndex: 3, padding: '18px 20px 20px', ...bodyStyle }}>
              {children}
            </div>
          </>
        )}
      </div>

      {zigzag && (
        <div style={css('height:9px;margin-top:-1px;background-image:linear-gradient(45deg, var(--bg) 25%, transparent 25%), linear-gradient(-45deg, var(--bg) 25%, transparent 25%);background-size:14px 14px;background-position:0 -1px;')} />
      )}
    </div>
  );
}
