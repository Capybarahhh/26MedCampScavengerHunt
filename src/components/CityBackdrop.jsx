import { useMemo } from 'react';
import { css } from '../lib/css.js';
import { makeParticles, makeBuildings, makeFarBuildings, makeRain, makeMist, makeEmbers, STAGE_THEMES } from '../lib/backdrop.js';
import { PortalFlash } from './PortalFlash.jsx';
import { JunkyardScene } from './JunkyardScene.jsx';
import { LibraryScene } from './LibraryScene.jsx';

// Generated once per variant and cached — regenerating on every render would
// make the skyline flicker to a new random layout on each re-render, and
// regenerating per screen instance (the old behavior) meant every stage
// showed the literal same buildings. Keyed by variant so each location gets
// its own fixed-for-the-session layout.
const cache = new Map();
function getBackdrop(variant) {
  if (cache.has(variant)) return cache.get(variant);
  const theme = STAGE_THEMES[variant] || STAGE_THEMES.default;
  const data = {
    farBuildings: makeFarBuildings(12, theme),
    buildings: makeBuildings(9, theme),
    particles: makeParticles(34, theme),
    rain: theme.rain ? makeRain(24, theme) : [],
    mist: theme.mist ? makeMist(5, theme) : [],
    embers: theme.embers ? makeEmbers(20, theme) : [],
  };
  cache.set(variant, data);
  return data;
}

// Cyberpunk city ambience behind every screen: grid, silhouettes, particles,
// rain/mist/embers, scanline sweep, vignette and the four HUD corner
// brackets. `variant` (a stageKey like "R"/"Y"/"A"/"M"/"G"/"C", or omitted
// for the generic default) swaps the skyline's shape, palette and weather
// to match that stage's emotion — see STAGE_THEMES in lib/backdrop.js.
// Everything is position:absolute with explicit z-index, so screen content
// (z-index 10) slots between the ambience (0–2) and the vignette/HUD (24–25).
export function CityBackdrop({ variant = 'default' }) {
  const { farBuildings, buildings, particles, rain, mist, embers } = useMemo(() => getBackdrop(variant), [variant]);
  return (
    <div style={css('position:absolute;inset:0;')}>
      <div style={css('position:absolute;inset:0;z-index:0;pointer-events:none;background-image:repeating-linear-gradient(0deg, rgba(var(--purple-rgb),0.045) 0 1px, transparent 1px 42px), repeating-linear-gradient(90deg, rgba(var(--purple-rgb),0.045) 0 1px, transparent 1px 42px);')} />
      <div style={css('position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;')}>
        {farBuildings.map((b, i) => <div key={i} style={css(b.style)} />)}
      </div>
      <div style={css('position:absolute;inset:0;z-index:0;pointer-events:none;overflow:hidden;')}>
        {buildings.map((b, i) => (
          <div key={i} style={css(b.style)}>
            {b.windows.map((w, wi) => <div key={wi} style={css(w.style)} />)}
            {b.hasAntenna && <div style={css(b.antennaStyle)} />}
            {b.hasAntenna && <div style={css(b.antennaDotStyle)} />}
            {b.hasAntenna && b.craneStyle && <div style={css(b.craneStyle)} />}
            {b.spineStyle && <div style={css(b.spineStyle)} />}
          </div>
        ))}
      </div>
      <div style={css('position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;')}>
        {particles.map((p, i) => <div key={i} style={css(p.style)} />)}
      </div>
      {variant === 'A' && <PortalFlash />}
      {variant === 'G' && <JunkyardScene />}
      {variant === 'R' && <LibraryScene />}
      {mist.length > 0 && (
        <div style={css('position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;')}>
          {mist.map((m, i) => <div key={i} style={css(m.style)} />)}
        </div>
      )}
      {embers.length > 0 && (
        <div style={css('position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;')}>
          {embers.map((e, i) => <div key={i} style={css(e.style)} />)}
        </div>
      )}
      {rain.length > 0 && (
        <div style={css('position:absolute;inset:0;z-index:1;pointer-events:none;overflow:hidden;')}>
          {rain.map((r, i) => <div key={i} style={css(r.style)} />)}
        </div>
      )}
      <div style={css('position:absolute;left:0;right:0;height:140px;z-index:2;pointer-events:none;background:linear-gradient(to bottom, transparent, rgba(var(--teal-rgb),0.07), transparent);animation:scanSweep 7s linear infinite;')} />
      <div style={css('position:absolute;inset:0;z-index:24;pointer-events:none;background:radial-gradient(ellipse at center, transparent 55%, rgba(var(--bg-rgb),0.72) 100%);')} />
      <div style={css('position:absolute;top:10px;left:10px;width:28px;height:28px;border-top:2px solid rgba(var(--purple-rgb),0.55);border-left:2px solid rgba(var(--purple-rgb),0.55);z-index:25;pointer-events:none;')} />
      <div style={css('position:absolute;top:10px;right:10px;width:28px;height:28px;border-top:2px solid rgba(var(--teal-rgb),0.55);border-right:2px solid rgba(var(--teal-rgb),0.55);z-index:25;pointer-events:none;')} />
      <div style={css('position:absolute;bottom:10px;left:10px;width:28px;height:28px;border-bottom:2px solid rgba(var(--teal-rgb),0.55);border-left:2px solid rgba(var(--teal-rgb),0.55);z-index:25;pointer-events:none;')} />
      <div style={css('position:absolute;bottom:10px;right:10px;width:28px;height:28px;border-bottom:2px solid rgba(var(--purple-rgb),0.55);border-right:2px solid rgba(var(--purple-rgb),0.55);z-index:25;pointer-events:none;')} />
    </div>
  );
}
