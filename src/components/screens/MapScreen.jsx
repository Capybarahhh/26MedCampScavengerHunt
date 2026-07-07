import { STAGE_META, NODE_ICON_SHAPES } from '../../data/stageMeta.js';
import { smoothPath } from '../../lib/map.js';
import { css } from '../../lib/css.js';

// Signal map: the route curve, one node per stage, progress bar, toast + unlock banner.
export function MapScreen({ unlockedIndex, onNodeClick, onOpenBackpack, onReset, toastMsg, unlockBanner }) {
  const nodes = STAGE_META.map((meta, i) => {
    let bg, border, fg, label, fontSize, anim = 'none', cursor = 'default';
    if (i < unlockedIndex) {
      const purple = meta.kind === 'prologue';
      bg = purple ? '#2a0e4a' : '#3a0020';
      border = purple ? '#c060ff' : '#ff2d78';
      fg = purple ? '#e0b0ff' : '#ff80aa';
      label = meta.name; fontSize = 12.5;
    } else if (i === unlockedIndex) {
      bg = '#003a35'; border = '#00e5cc'; fg = '#00ffee'; label = meta.name; fontSize = 12.5;
      anim = 'blinkPip 1.6s ease-in-out infinite'; cursor = 'pointer';
    } else {
      bg = '#150a24'; border = '#3a2060'; fg = '#5a3a80'; label = '?'; fontSize = 28;
    }
    const iconDefs = i <= unlockedIndex ? NODE_ICON_SHAPES[i] : null;
    return { ...meta, bg, border, fg, label, fontSize, anim, cursor, iconDefs, isCurrent: i === unlockedIndex };
  });

  const pts = nodes.map((n) => ({ x: n.x, y: n.y }));
  const traveledCount = Math.min(unlockedIndex + 1, nodes.length);
  const pathD = smoothPath(pts);
  const traveledD = traveledCount > 1 ? smoothPath(pts.slice(0, traveledCount)) : '';
  const doneMainStages = STAGE_META.filter((m, i) => m.kind === 'stage' && i < unlockedIndex).length;

  return (
    <div style={css('position:absolute;inset:0;z-index:10;padding:26px 24px;overflow:hidden;')}>
      <div style={css('position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 60% 40% at 50% 8%, rgba(0,229,204,0.1), transparent 60%), radial-gradient(ellipse 50% 40% at 15% 90%, rgba(192,96,255,0.08), transparent 65%);')} />
      <div style={css('position:absolute;inset:0;pointer-events:none;opacity:0.35;background-image:linear-gradient(rgba(0,229,204,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,204,0.08) 1px, transparent 1px);background-size:48px 48px;animation:mapGridDrift 14s linear infinite;')} />

      <div style={css('display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;position:relative;')}>
        <div style={css('display:flex;align-items:center;gap:14px;')}>
          <div>
            <div style={css('display:flex;align-items:center;gap:8px;')}>
              <span style={css('width:6px;height:6px;border-radius:50%;background:#00e5cc;box-shadow:0 0 8px rgba(0,229,204,0.9);animation:mapGlowPulse 2s ease-in-out infinite;')} />
              <span style={css('color:#00ffee;font-size:14px;letter-spacing:4px;text-shadow:0 0 10px rgba(0,229,204,0.6);')}>MNEMO // 訊號地圖</span>
            </div>
            <div style={css('color:#5a3a80;font-size:10px;letter-spacing:2px;margin-top:3px;margin-left:14px;')}>SIGNAL MAP // 記憶路徑追蹤中</div>
          </div>
          <button onClick={onReset} style={css("background:none;border:1px solid #5a3a80;color:#8a6ab0;border-radius:14px;height:26px;padding:0 10px;font-size:10px;letter-spacing:1px;cursor:pointer;")}>重新開始</button>
        </div>
        <div style={css('display:flex;align-items:center;gap:8px;')}>
          <div style={css('display:flex;align-items:center;gap:8px;background:#180b2c;border:2px solid #5a3a80;border-radius:20px;padding:8px 14px;min-height:44px;')}>
            <span style={css('color:#f0c030;font-size:16px;')}>◆</span>
            <span style={css('color:#f0e070;font-size:14px;letter-spacing:2px;')}>{doneMainStages}/6</span>
          </div>
          <button className="press96" onClick={onOpenBackpack} style={css("height:44px;padding:0 14px;background:#2a0e4a;border:2px solid #9a50cc;color:#e0b0ff;border-radius:20px;font-size:12px;letter-spacing:2px;cursor:pointer;")}>▤ 背包</button>
        </div>
      </div>

      <div style={css('position:relative;width:100%;height:640px;margin-top:6px;')}>
        <svg viewBox="0 0 700 640" style={css('position:absolute;inset:0;width:100%;height:100%;')}>
          <path d={pathD} fill="none" stroke="#3a2060" strokeWidth="4" strokeDasharray="2 12" strokeLinecap="round" />
          {traveledD && (
            <path d={traveledD} fill="none" stroke="#00e5cc" strokeWidth="3" strokeDasharray="9 9" strokeLinecap="round" opacity="0.85"
              style={css('animation:dashFlow 2.4s linear infinite;filter:drop-shadow(0 0 4px rgba(0,229,204,0.8));')} />
          )}
        </svg>
        {traveledD && (
          <div style={{
            ...css('position:absolute;left:0;top:0;width:9px;height:9px;margin:-4.5px;border-radius:50%;background:#00ffee;box-shadow:0 0 10px rgba(0,229,204,1), 0 0 20px rgba(0,229,204,0.6);animation:signalTravel 3.6s linear infinite;pointer-events:none;'),
            offsetPath: `path('${traveledD}')`,
          }} />
        )}

        {nodes.map((node, i) => (
          <div key={i} style={{ position: 'absolute', left: node.x, top: node.y, width: 120, transform: 'translate(-50%,-50%)' }}>
            {node.isCurrent && (
              <div style={css('position:absolute;left:50%;top:50%;width:116px;height:92px;transform:translate(-50%,-50%);border-radius:8px;border:1.5px solid rgba(0,229,204,0.6);animation:radarPing 2.2s ease-out infinite;pointer-events:none;')} />
            )}
            <div
              onClick={() => onNodeClick(i)}
              style={{
                ...css('position:relative;width:116px;height:92px;border-radius:6px;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:8px;'),
                background: node.bg, border: `2px solid ${node.border}`, cursor: node.cursor, animation: node.anim,
                boxShadow: `0 0 16px ${node.border}55, inset 0 0 14px ${node.border}22`,
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
        {nodes.map((_, i) => {
          const color = i < unlockedIndex ? (STAGE_META[i].kind === 'prologue' ? '#c060ff' : '#ff2d78') : i === unlockedIndex ? '#00e5cc' : '#2a1a44';
          return (
            <div key={i} style={{
              flex: 1, height: 7, borderRadius: 4, background: color, color,
              boxShadow: i <= unlockedIndex ? '0 0 8px currentColor' : 'none',
              animation: i === unlockedIndex ? 'mapGlowPulse 1.8s ease-in-out infinite' : 'none',
            }} />
          );
        })}
      </div>

      {toastMsg && (
        <div style={css('position:absolute;bottom:44px;left:50%;background:#2a0e4a;border:2px solid #9a50cc;color:#e0b0ff;padding:12px 20px;border-radius:8px;font-size:13px;letter-spacing:1px;animation:toastIn 0.25s ease both;white-space:nowrap;')}>{toastMsg}</div>
      )}
      {unlockBanner && (
        <div style={css('position:absolute;top:0;left:50%;background:#003a35;border:2px solid #00e5cc;color:#00ffee;padding:12px 26px;border-radius:0 0 10px 10px;font-size:14px;letter-spacing:3px;white-space:nowrap;text-shadow:0 0 8px rgba(0,229,204,0.7);animation:bannerSlide 2.6s ease both;')}>{unlockBanner}</div>
      )}
    </div>
  );
}
