import { useMemo } from 'react';
import { TYPE_CHART_ROWS } from '../../data/typeChart.js';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import { SegText } from '../ui/SegText.jsx';
import { TerminalPanel } from '../ui/TerminalPanel.jsx';
import { NavButtons } from '../ui/NavButtons.jsx';
import { css } from '../../lib/css.js';

function DiamondDivider({ label, color = '#00e5cc', labelColor = '#5ec9c0' }) {
  return (
    <div style={css('display:flex;align-items:center;justify-content:center;gap:10px;')}>
      <span style={{ width: 20, height: 1, background: `linear-gradient(to left, ${color}b3, transparent)` }} />
      <span style={{ width: 6, height: 6, transform: 'rotate(45deg)', background: color, boxShadow: `0 0 8px ${color}cc` }} />
      <span style={{ color: labelColor, fontSize: 10, letterSpacing: 5 }}>{label}</span>
      <span style={{ width: 6, height: 6, transform: 'rotate(45deg)', background: color, boxShadow: `0 0 8px ${color}cc` }} />
      <span style={{ width: 20, height: 1, background: `linear-gradient(to right, ${color}b3, transparent)` }} />
    </div>
  );
}

function TypeChart() {
  return (
    <div style={css('margin-top:16px;animation:fadeUp 0.4s ease both;')}>
      <TerminalPanel
        accent="#f0c030"
        small
        title="屬性克制對照 // TYPE.MATRIX"
        tag="招式 ➜ 克制對象"
        outerStyle={{ borderRadius: 12, padding: 8 }}
        bodyStyle={{ padding: '6px 12px 8px' }}
      >
        {TYPE_CHART_ROWS.map((row) => (
          <div key={row.name} style={css('display:flex;align-items:flex-start;gap:8px;padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.05);')}>
            <span style={{
              ...css('flex-shrink:0;display:flex;align-items:center;gap:4px;min-width:60px;padding:3px 7px;border-radius:5px;font-size:11px;font-weight:700;letter-spacing:0.5px;'),
              background: row.color, color: row.textColor, boxShadow: `0 0 8px ${row.color}55`,
            }}>
              <span style={{ fontSize: 11 }}>{row.icon}</span>{row.name}
            </span>
            <span style={css('color:#00e5cc;font-size:11px;padding-top:4px;text-shadow:0 0 6px rgba(0,229,204,0.7);')}>➜</span>
            <div style={css('display:flex;flex-wrap:wrap;gap:5px;padding-top:2px;')}>
              {row.targets.map((t) => (
                <span key={t.name} style={{
                  ...css('display:flex;align-items:center;gap:3px;padding:2px 6px;border-radius:4px;font-size:10px;font-weight:600;'),
                  background: t.color, color: t.textColor,
                }}>
                  <span style={{ fontSize: 10 }}>{t.icon}</span>{t.name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </TerminalPanel>
    </div>
  );
}

function Scanner() {
  return (
    <div style={css('display:flex;justify-content:center;margin-bottom:18px;')}>
      <div style={css('position:relative;width:72px;height:72px;')}>
        <div style={css('position:absolute;inset:0;border-radius:50%;border:1.5px dashed rgba(0,229,204,0.45);animation:scannerRotate 7s linear infinite;')} />
        <div style={css('position:absolute;inset:10px;border-radius:50%;border:1px dashed rgba(154,80,204,0.4);animation:scannerRotateRev 5s linear infinite;')} />
        <div style={css('position:absolute;inset:24px;border-radius:50%;background:radial-gradient(circle, rgba(0,229,204,0.9), rgba(0,229,204,0.1) 70%);box-shadow:0 0 18px rgba(0,229,204,0.7);animation:scannerCorePulse 2s ease-in-out infinite;')} />
        <div style={css('position:absolute;top:-3px;left:50%;width:2px;height:8px;background:rgba(0,229,204,0.6);transform:translateX(-50%);')} />
        <div style={css('position:absolute;bottom:-3px;left:50%;width:2px;height:8px;background:rgba(0,229,204,0.6);transform:translateX(-50%);')} />
        <div style={css('position:absolute;left:-3px;top:50%;width:8px;height:2px;background:rgba(0,229,204,0.6);transform:translateY(-50%);')} />
        <div style={css('position:absolute;right:-3px;top:50%;width:8px;height:2px;background:rgba(0,229,204,0.6);transform:translateY(-50%);')} />
      </div>
    </div>
  );
}

function EndingChoice({ onChoose }) {
  return (
    <div style={css('animation:fadeUp 0.5s ease both;')}>
      <div style={css('position:relative;border-radius:12px;background:#050810;border:1px solid #1a2a30;padding:16px 18px;margin-bottom:16px;box-shadow:0 0 0 1px rgba(0,229,204,0.08);')}>
        <div style={css('display:flex;align-items:center;gap:8px;margin-bottom:12px;')}>
          <span style={css('width:7px;height:7px;border-radius:50%;background:#00e5cc;animation:powerDotPulse 1.4s ease-in-out infinite;')} />
          <span style={css('color:#00ffee;font-size:11px;letter-spacing:3px;')}>SYSTEM // 請選擇後續處理方式</span>
        </div>
        <div style={css('color:#f0e070;font-size:14px;font-weight:700;letter-spacing:1px;margin-bottom:4px;')}>第一條路　保留所有記憶</div>
        <div style={css('color:#8a9aa0;font-size:13px;line-height:1.7;margin-bottom:14px;')}>帶著這個完整的、有笑有淚的自己，繼續活下去。</div>
        <div style={css('color:#f0e070;font-size:14px;font-weight:700;letter-spacing:1px;margin-bottom:4px;')}>第二條路　將記憶封回</div>
        <div style={css('color:#8a9aa0;font-size:13px;line-height:1.7;')}>不再想起那些酸楚與疲憊，只需要繼續，快樂地過下去就好。</div>
      </div>
      <div style={css('display:flex;gap:12px;')}>
        <button className="press98" onClick={() => onChoose('keep')} style={css("flex:1;height:64px;background:#1a1206;border:2px solid #f0c030;color:#f0e070;border-radius:8px;font-size:15px;letter-spacing:2px;cursor:pointer;")}>保留所有記憶</button>
        <button className="press98" onClick={() => onChoose('seal')} style={css("flex:1;height:64px;background:#180b2c;border:2px solid #5a3a80;color:#c09ad8;border-radius:8px;font-size:15px;letter-spacing:2px;cursor:pointer;")}>將記憶封回</button>
      </div>
    </div>
  );
}

/**
 * A story beat, in one of three layouts:
 * - duelRules:     duel title + rule-set terminal + type chart
 * - terminalStory: scanner rings + MEMORY TERMINAL panel
 * - normal:        plain typewriter narration
 */
export function StoryBeat({ beat, hasPrev, startDone, onNext, onPrev, onChooseEnding }) {
  const fullText = useMemo(() => beat.segs.map((s) => s.text).join(''), [beat]);
  const { count, done, skip } = useTypewriter(fullText, { startDone });
  const nextLabel = beat.nextLabel || (beat.isLast ? '回到地圖 ▸' : '繼續 ▸');
  const cursor = done ? null : '#00e5cc';
  const tapToSkip = () => { if (!done) skip(); };
  const nav = done && !beat.endingChoice && (
    <NavButtons
      hasPrev={hasPrev}
      onPrev={(e) => { e.stopPropagation(); onPrev(); }}
      onNext={(e) => { e.stopPropagation(); onNext(); }}
      nextLabel={nextLabel}
      style={{ flexShrink: 0, marginTop: 14 }}
    />
  );

  if (beat.duelRules) {
    return (
      <>
        <div style={css('flex:1;display:flex;flex-direction:column;overflow-y:auto;padding-top:6px;')} onClick={tapToSkip}>
          <div style={css('text-align:center;margin-bottom:14px;flex-shrink:0;')}>
            <DiamondDivider label="DUEL PROTOCOL" />
            <div style={css('color:#00ffee;font-size:26px;font-weight:700;letter-spacing:4px;margin-top:8px;text-shadow:0 0 18px rgba(0,229,204,0.65), 0 0 3px rgba(255,255,255,0.4);')}>{beat.duelTitle || ''}</div>
          </div>
          <TerminalPanel title="決鬥守則 // RULE.SET" zigzag outerStyle={{ flexShrink: 0 }} bodyStyle={{ fontSize: 15.5, lineHeight: 1.95, textAlign: 'left' }}>
            <SegText segs={beat.segs} count={count} cursorColor={cursor} />
          </TerminalPanel>
          {done && <TypeChart />}
        </div>
        {nav}
      </>
    );
  }

  if (beat.terminalStory) {
    return (
      <>
        <div style={css('flex:1;display:flex;flex-direction:column;overflow-y:auto;min-height:0;padding-top:6px;')} onClick={tapToSkip}>
          <div style={css('margin:auto 0;position:relative;padding:22px 6px;')}>
            <div style={css('position:absolute;top:0;left:0;width:18px;height:18px;border-top:2px solid rgba(0,229,204,0.4);border-left:2px solid rgba(0,229,204,0.4);')} />
            <div style={css('position:absolute;top:0;right:0;width:18px;height:18px;border-top:2px solid rgba(0,229,204,0.4);border-right:2px solid rgba(0,229,204,0.4);')} />
            <div style={css('position:absolute;bottom:0;left:0;width:18px;height:18px;border-bottom:2px solid rgba(0,229,204,0.4);border-left:2px solid rgba(0,229,204,0.4);')} />
            <div style={css('position:absolute;bottom:0;right:0;width:18px;height:18px;border-bottom:2px solid rgba(0,229,204,0.4);border-right:2px solid rgba(0,229,204,0.4);')} />
            <Scanner />
            <div style={css('text-align:center;margin-bottom:18px;flex-shrink:0;')}>
              <DiamondDivider label="MEMORY TERMINAL" />
            </div>
            <TerminalPanel title={beat.terminalTitle || 'MEMORY TERMINAL // 記憶終端'} zigzag outerStyle={{ flexShrink: 0 }} bodyStyle={{ fontSize: 15.5, lineHeight: 1.95, textAlign: 'left' }}>
              <SegText segs={beat.segs} count={count} cursorColor={cursor} />
            </TerminalPanel>
          </div>
        </div>
        {nav}
      </>
    );
  }

  return (
    <>
      <div style={css('flex:1;display:flex;flex-direction:column;overflow-y:auto;min-height:0;')} onClick={tapToSkip}>
        <div style={css('margin:auto 0;font-size:19px;line-height:2.1;text-align:left;width:100%;')}>
          <SegText segs={beat.segs} count={count} cursorColor={cursor} paraMargin={20} />
        </div>
      </div>
      {done && beat.endingChoice && <EndingChoice onChoose={onChooseEnding} />}
      {nav}
    </>
  );
}
