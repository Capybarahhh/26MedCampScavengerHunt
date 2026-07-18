import { useEffect, useMemo, useRef, useState } from 'react';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import { SegText } from '../ui/SegText.jsx';
import { TerminalPanel } from '../ui/TerminalPanel.jsx';
import { AnswerTerminal } from '../ui/AnswerTerminal.jsx';
import { NavButtons } from '../ui/NavButtons.jsx';
import { track } from '../../lib/track.js';
import { css, mix } from '../../lib/css.js';

/**
 * A color-selection beat: an optional description terminal, a grid of color
 * swatches, and a confirm button. The player toggles swatches; the beat is
 * solved when the SET of selected colors exactly equals `beat.answerColors`
 * (order-independent).
 *
 * Data shape in stages.js:
 *   { type: 'colorpick',
 *     panel: { title, accent },        // optional header for the description
 *     descSegs: [ seg(...) ],          // instruction text (typewriter)
 *     colors: ['#hex', ... 17 ...],    // swatches shown, MUST be distinct hexes
 *     answerColors: ['#hex', ...5...], // the correct subset of `colors`
 *   }
 */
export function ColorPickBeat({ stageKey, beat, beatIndex, hasPrev, startDone, onAdvance, onPrev, onCorrect, onWrong }) {
  const [selected, setSelected] = useState([]); // indices into beat.colors
  const [status, setStatus] = useState('idle'); // idle | wrong | correct
  const wrongTimer = useRef(null);
  useEffect(() => () => clearTimeout(wrongTimer.current), []);

  const descText = useMemo(() => beat.descSegs.map((s) => s.text).join(''), [beat]);
  const { count, done, skip } = useTypewriter(descText, { startDone });

  const accent = beat.panel ? beat.panel.accent : 'var(--teal)';
  const answerSet = useMemo(() => new Set(beat.answerColors), [beat]);
  const need = beat.answerColors.length;
  const borderColor = status === 'correct' ? 'var(--teal)' : status === 'wrong' ? 'var(--pink)' : 'var(--purple-dim)';

  const toggle = (i) => {
    if (status === 'correct') return;
    setStatus('idle');
    setSelected((cur) => (cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]));
  };

  const submit = () => {
    if (status === 'correct') { onAdvance(); return; }
    const chosen = new Set(selected.map((i) => beat.colors[i]));
    const correct = chosen.size === answerSet.size && [...chosen].every((c) => answerSet.has(c));
    track('colorpick_attempt', { stageKey, beatIndex, chosen: [...chosen], correct });
    clearTimeout(wrongTimer.current);
    if (correct) {
      onCorrect();
      setStatus('correct');
    } else {
      const forcePass = onWrong();
      if (forcePass) {
        setStatus('correct');
      } else {
        setStatus('wrong');
        wrongTimer.current = setTimeout(() => setStatus((s) => (s === 'wrong' ? 'idle' : s)), 1400);
      }
    }
  };

  return (
    <div style={css('flex:1;display:flex;flex-direction:column;justify-content:flex-start;gap:18px;overflow-y:auto;min-height:0;padding:22px 2px 4px;')}>
      <div style={css('margin:auto 0;display:flex;flex-direction:column;gap:18px;')}>

        {beat.descSegs.length > 0 && (
          <TerminalPanel
            accent={accent}
            title={beat.panel ? beat.panel.title : 'CHROMA LOCK // 色彩驗證終端'}
            tag={`NO.${String(beatIndex + 1).padStart(2, '0')}`}
            boot="0.85s"
            onClick={() => { if (!done) skip(); }}
            bodyStyle={{ padding: '20px 22px 24px', fontSize: 16, lineHeight: 2, textAlign: 'left', width: '100%', minHeight: 64 }}
          >
            <SegText segs={beat.descSegs} count={count} cursorColor={done ? null : accent} accent={accent} />
          </TerminalPanel>
        )}

        <AnswerTerminal
          borderColor={borderColor}
          status={status}
          label={`選出 ${need} 個正確色彩`}
          headerRight={<span style={{ ...css('font-size:11px;letter-spacing:1px;'), color: mix(borderColor, 80) }}>{selected.length}/{need}</span>}
          wrongMsg="色彩組合不對,再試一次"
          correctMsg="色彩已校準"
        >
          <div style={css('display:grid;grid-template-columns:repeat(6, 1fr);gap:10px;')}>
            {beat.colors.map((hex, i) => {
              const isSel = selected.includes(i);
              return (
                <button
                  key={i}
                  className="press94"
                  onClick={() => toggle(i)}
                  style={{
                    position: 'relative', height: 48, borderRadius: 8, cursor: 'pointer',
                    background: hex,
                    border: isSel ? '3px solid #fff' : '2px solid rgba(255,255,255,0.15)',
                    boxShadow: isSel ? `0 0 14px ${hex}, 0 0 0 2px ${borderColor}` : 'inset 0 2px 6px rgba(0,0,0,0.4)',
                    transition: 'border 0.15s, box-shadow 0.15s',
                  }}
                >
                  {isSel && (
                    <span style={css('position:absolute;top:2px;right:4px;color:#fff;font-size:14px;font-weight:700;text-shadow:0 0 4px rgba(0,0,0,0.9);')}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </AnswerTerminal>
      </div>

      <NavButtons
        hasPrev={hasPrev}
        onPrev={onPrev}
        onNext={submit}
        nextLabel={status === 'correct' ? '繼續 ▸' : '確認'}
        style={{ animation: 'none' }}
      />
    </div>
  );
}
