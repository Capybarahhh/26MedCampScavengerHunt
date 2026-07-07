import { css } from '../lib/css.js';
import { makeParticles, makeBuildings, makeRain } from '../lib/backdrop.js';

// Generated once per page load (matches legacy: once per component instance).
const PARTICLES = makeParticles(34);
const BUILDINGS = makeBuildings(9);
const RAIN = makeRain(24);

// Cyberpunk city ambience behind every screen: grid, silhouettes, particles,
// rain, scanline sweep, vignette and the four HUD corner brackets.
// Everything is position:absolute with explicit z-index, so screen content
// (z-index 10) slots between the ambience (0–2) and the vignette/HUD (24–25).
export function CityBackdrop() {
  return (
    <>
      <div style={css('position:absolute;inset:0;z-index:0;pointer-events:none;background-image:repeating-linear-gradient(0deg, rgba(192,96,255,0.045) 0 1px, transparent 1px 42px), repeating-linear-gradient(90deg, rgba(192,96,255,0.045) 0 1px, transparent 1px 42px);')} />
      <div style={css('position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;')}>
        {BUILDINGS.map((b, i) => <div key={i} style={css(b.style)} />)}
      </div>
      <div style={css('position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;')}>
        {PARTICLES.map((p, i) => <div key={i} style={css(p.style)} />)}
      </div>
      <div style={css('position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;')}>
        {RAIN.map((r, i) => <div key={i} style={css(r.style)} />)}
      </div>
      <div style={css('position:absolute;left:0;right:0;height:140px;z-index:2;pointer-events:none;background:linear-gradient(to bottom, transparent, rgba(0,229,204,0.07), transparent);animation:scanSweep 7s linear infinite;')} />
      <div style={css('position:absolute;inset:0;z-index:24;pointer-events:none;background:radial-gradient(ellipse at center, transparent 55%, rgba(8,3,15,0.72) 100%);')} />
      <div style={css('position:absolute;top:10px;left:10px;width:28px;height:28px;border-top:2px solid rgba(192,96,255,0.55);border-left:2px solid rgba(192,96,255,0.55);z-index:25;pointer-events:none;')} />
      <div style={css('position:absolute;top:10px;right:10px;width:28px;height:28px;border-top:2px solid rgba(0,229,204,0.55);border-right:2px solid rgba(0,229,204,0.55);z-index:25;pointer-events:none;')} />
      <div style={css('position:absolute;bottom:10px;left:10px;width:28px;height:28px;border-bottom:2px solid rgba(0,229,204,0.55);border-left:2px solid rgba(0,229,204,0.55);z-index:25;pointer-events:none;')} />
      <div style={css('position:absolute;bottom:10px;right:10px;width:28px;height:28px;border-bottom:2px solid rgba(192,96,255,0.55);border-right:2px solid rgba(192,96,255,0.55);z-index:25;pointer-events:none;')} />
    </>
  );
}
