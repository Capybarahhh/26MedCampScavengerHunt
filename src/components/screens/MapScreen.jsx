import { STAGE_META, STAGE_ORDER, NODE_ICON_SHAPES } from '../../data/stageMeta.js';
import { smoothPath } from '../../lib/map.js';
import { css, mix } from '../../lib/css.js';

// Icon shapes are positional: STAGE_META[i] <-> NODE_ICON_SHAPES[i].
const ICON_INDEX = Object.fromEntries(STAGE_META.map((m, i) => [m.code, i]));

// The next stage a team can step into: STAGE_ORDER walked forward from their
// start by however many they've completed, wrapping around the circle.
function currentStageKey(startStageKey, completedStages) {
  if (!startStageKey || completedStages.length >= STAGE_ORDER.length) return null;
  const startIdx = STAGE_ORDER.indexOf(startStageKey);
  return STAGE_ORDER[(startIdx + completedStages.length) % STAGE_ORDER.length];
}

// Signal map: six stages ringed in their fixed play order, 終章 at the
// center. Only the one true next stop is orange/pulsing — everything else
// reads as done (green) or locked (red). Creator mode leaves the same
// coloring intact (so testing still shows real progress) but makes every
// node clickable regardless of status.
export function MapScreen({ startStageKey, completedStages, creatorMode, onNodeClick, onOpenBackpack, onReset, toastMsg, unlockBanner }) {
  const curKey = currentStageKey(startStageKey, completedStages);
  const allDone = completedStages.length >= STAGE_ORDER.length;

  const nodes = STAGE_META.map((meta) => {
    const isEnding = meta.kind === 'ending';
    const done = !isEnding && completedStages.includes(meta.key);
    const isCurrent = isEnding ? allDone : meta.key === curKey;
    let bg, border, fg, label, fontSize, anim = 'none';
    if (isEnding) {
      if (isCurrent) {
        bg = 'var(--gold-deep)'; border = 'var(--gold)'; fg = 'var(--gold-text)'; label = meta.name; fontSize = 13;
        anim = 'blinkPip 1.6s ease-in-out infinite';
      } else {
        bg = 'var(--pink-bg)'; border = 'var(--pink)'; fg = 'var(--pink-text)'; label = meta.name; fontSize = 12.5;
      }
    } else if (done) {
      bg = 'var(--green-bg)'; border = 'var(--green)'; fg = 'var(--green-text)'; label = meta.name; fontSize = 12.5;
    } else if (isCurrent) {
      bg = 'var(--orange-bg)'; border = 'var(--orange)'; fg = 'var(--orange-text)'; label = meta.name; fontSize = 12.5;
      anim = 'blinkPip 1.6s ease-in-out infinite';
    } else {
      bg = 'var(--pink-bg)'; border = 'var(--pink)'; fg = 'var(--pink-text)'; label = meta.name; fontSize = 12.5;
    }
    const clickable = creatorMode || isCurrent;
    const iconDefs = NODE_ICON_SHAPES[ICON_INDEX[meta.code]];
    return { ...meta, bg, border, fg, label, fontSize, anim, iconDefs, isEnding, done, isCurrent, clickable };
  });

  const ring = nodes.filter((n) => !n.isEnding);
  const ringPts = ring.map((n) => ({ x: n.x, y: n.y }));
  const basePath = smoothPath([...ringPts, ringPts[0]]);

  const startIdx = startStageKey ? STAGE_ORDER.indexOf(startStageKey) : -1;
  const traveledCount = startIdx >= 0 ? Math.min(completedStages.length + (allDone ? 0 : 1), STAGE_ORDER.length) : 0;
  const traveledPts = [];
  for (let j = 0; j < traveledCount; j++) traveledPts.push(ringPts[(startIdx + j) % STAGE_ORDER.length]);
  const traveledPath = traveledPts.length > 1 ? smoothPath(traveledPts) : '';

  return (
    <div style={css('position:absolute;inset:0;z-index:10;padding:26px 24px;overflow:hidden;')}>
      <div style={css('position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 50% 8%, rgba(var(--teal-rgb),0.1), transparent 60%), radial-gradient(ellipse 50% 40% at 15% 90%, rgba(var(--purple-rgb),0.08), transparent 65%);')} />
      <div style={css('position:absolute;inset:0;pointer-events:none;opacity:0.35;background-image:linear-gradient(rgba(var(--teal-rgb),0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--teal-rgb),0.08) 1px, transparent 1px);background-size:48px 48px;animation:mapGridDrift 14s linear infinite;')} />

      <div style={css('display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;position:relative;')}>
        <div style={css('display:flex;align-items:center;gap:14px;')}>
          <div>
            <div style={css('display:flex;align-items:center;gap:8px;')}>
              <span style={css('width:6px;height:6px;border-radius:50%;background:var(--teal);box-shadow:0 0 8px rgba(var(--teal-rgb),0.9);animation:mapGlowPulse 2s ease-in-out infinite;')} />
              <span style={css('color:var(--teal-bright);font-size:14px;letter-spacing:4px;text-shadow:0 0 10px rgba(var(--teal-rgb),0.6);')}>MNEMO // 訊號地圖</span>
            </div>
            <div style={css('color:var(--purple-dim);font-size:10px;letter-spacing:2px;margin-top:3px;margin-left:14px;')}>SIGNAL MAP // 記憶路徑追蹤中</div>
          </div>
          <button onClick={onReset} style={css("background:none;border:1px solid var(--purple-dim);color:var(--purple-text-faint);border-radius:14px;height:26px;padding:0 10px;font-size:10px;letter-spacing:1px;cursor:pointer;")}>重新開始</button>
        </div>
        <div style={css('display:flex;align-items:center;gap:8px;')}>
          <div style={css('display:flex;align-items:center;gap:8px;background:var(--purple-panel);border:2px solid var(--purple-dim);border-radius:20px;padding:8px 14px;min-height:44px;')}>
            <span style={css('color:var(--gold);font-size:16px;')}>◆</span>
            <span style={css('color:var(--gold-text);font-size:14px;letter-spacing:2px;')}>{completedStages.length}/6</span>
          </div>
          <button className="press96" onClick={onOpenBackpack} style={css("height:44px;padding:0 14px;background:var(--purple-btn);border:2px solid var(--purple-border);color:var(--purple-text);border-radius:20px;font-size:12px;letter-spacing:2px;cursor:pointer;")}>▤ 背包</button>
        </div>
      </div>

      {/* Fixed 700×640 box (matching the svg viewBox exactly) so the hexagon
          is never squeezed by this screen's own 24px horizontal padding —
          width:100% here would inherit a narrower, padding-shrunk box and
          skew the "circle" instead of keeping it regular. */}
      <div style={css('position:relative;width:700px;height:640px;margin:6px -24px 0 -24px;')}>
        <svg viewBox="0 0 700 640" style={css('position:absolute;inset:0;width:100%;height:100%;')}>
          <path d={basePath} fill="none" stroke="var(--purple-locked)" strokeWidth="4" strokeDasharray="2 12" strokeLinecap="round" />
          {traveledPath && (
            <path d={traveledPath} fill="none" stroke="var(--teal)" strokeWidth="3" strokeDasharray="9 9" strokeLinecap="round" opacity="0.85"
              style={css('animation:dashFlow 2.4s linear infinite;filter:drop-shadow(0 0 4px rgba(var(--teal-rgb),0.8));')} />
          )}
        </svg>
        {traveledPath && (
          <div style={{
            ...css('position:absolute;left:0;top:0;width:9px;height:9px;margin:-4.5px;border-radius:50%;background:var(--teal-bright);box-shadow:0 0 10px rgba(var(--teal-rgb),1), 0 0 20px rgba(var(--teal-rgb),0.6);animation:signalTravel 3.6s linear infinite;pointer-events:none;'),
            offsetPath: `path('${traveledPath}')`,
          }} />
        )}

        {nodes.map((node) => (
          <div key={node.code} style={{ position: 'absolute', left: node.x, top: node.y, width: 120, transform: 'translate(-50%,-50%)' }}>
            {node.isCurrent && (
              <div style={css('position:absolute;left:50%;top:50%;width:116px;height:92px;transform:translate(-50%,-50%);border-radius:8px;border:1.5px solid rgba(var(--teal-rgb),0.6);animation:radarPing 2.2s ease-out infinite;pointer-events:none;')} />
            )}
            <div
              onClick={() => node.clickable && onNodeClick(node)}
              style={{
                ...css('position:relative;width:116px;height:92px;border-radius:6px;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:8px;'),
                background: node.bg, border: `2px solid ${node.border}`, cursor: node.clickable ? 'pointer' : 'default', animation: node.anim,
                boxShadow: `0 0 16px ${mix(node.border, 33)}, inset 0 0 14px ${mix(node.border, 13)}`,
              }}
            >
              <div style={css('position:absolute;inset:0;background-image:repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 4px);pointer-events:none;')} />
              {['top:4px;left:4px;border-top:1px solid C;border-left:1px solid C;',
                'top:4px;right:4px;border-top:1px solid C;border-right:1px solid C;',
                'bottom:4px;left:4px;border-bottom:1px solid C;border-left:1px solid C;',
                'bottom:4px;right:4px;border-bottom:1px solid C;border-right:1px solid C;'].map((tpl, ci) => (
                <div key={ci} style={css(`position:absolute;width:9px;height:9px;opacity:0.9;${tpl.replaceAll('C', node.border)}`)} />
              ))}
              <div style={css('position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;width:100%;')}>
                {node.iconDefs && (
                  <svg viewBox="0 0 64 64" style={css('width:34px;height:34px;flex-shrink:0;')}>
                    {node.iconDefs.map((s, si) => {
                      const common = {
                        fill: s.filled ? node.fg : 'none',
                        stroke: s.filled ? 'none' : node.fg,
                        strokeWidth: s.sw || 1.5,
                        opacity: s.opacity,
                      };
                      if (s.kind === 'rect') return <rect key={si} x={s.x} y={s.y} width={s.w} height={s.h} {...common} />;
                      if (s.kind === 'circle') return <circle key={si} cx={s.cx} cy={s.cy} r={s.r} {...common} />;
                      return <polygon key={si} points={s.points} {...common} />;
                    })}
                  </svg>
                )}
                <div style={{
                  ...css('font-weight:700;text-align:center;line-height:1.3;letter-spacing:1.5px;'),
                  color: node.fg, fontSize: node.fontSize, textShadow: `0 0 10px ${node.border}`,
                }}>{node.label}</div>
                {node.iconDefs && <span style={{ width: 18, height: 1.5, background: node.border, opacity: 0.7, marginTop: 1 }} />}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={css('display:flex;gap:5px;margin-top:8px;')}>
        {nodes.map((node) => (
          <div key={node.code} style={{
            flex: 1, height: 7, borderRadius: 4, background: node.border, color: node.border,
            boxShadow: node.done || node.isCurrent ? '0 0 8px currentColor' : 'none',
            animation: node.isCurrent ? 'mapGlowPulse 1.8s ease-in-out infinite' : 'none',
          }} />
        ))}
      </div>

      {toastMsg && (
        <div style={css('position:absolute;bottom:44px;left:50%;background:var(--purple-btn);border:2px solid var(--purple-border);color:var(--purple-text);padding:12px 20px;border-radius:8px;font-size:13px;letter-spacing:1px;animation:toastIn 0.25s ease both;white-space:nowrap;')}>{toastMsg}</div>
      )}
      {unlockBanner && (
        <div style={css('position:absolute;top:0;left:50%;background:var(--teal-bg);border:2px solid var(--teal);color:var(--teal-bright);padding:12px 26px;border-radius:0 0 10px 10px;font-size:14px;letter-spacing:3px;white-space:nowrap;text-shadow:0 0 8px rgba(var(--teal-rgb),0.7);animation:bannerSlide 2.6s ease both;')}>{unlockBanner}</div>
      )}
    </div>
  );
}
