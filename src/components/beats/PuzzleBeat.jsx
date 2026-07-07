import { useEffect, useMemo, useRef, useState } from 'react';
import { CIPHER_CELLS } from '../../data/cipher.js';
import { FRAGMENT_KEY_LETTERS } from '../../lib/pieces.js';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import { SegText } from '../ui/SegText.jsx';
import { TerminalPanel } from '../ui/TerminalPanel.jsx';
import { track } from '../../lib/track.js';
import { css } from '../../lib/css.js';

function CipherTable() {
  return (
    <TerminalPanel
      small
      title="VIGENÈRE CIPHER // 維吉尼亞密碼表"
      outerStyle={{ animation: 'fadeUp 0.5s ease both' }}
      bodyStyle={{ padding: 14, overflowX: 'auto' }}
    >
      <div style={css('display:inline-grid;grid-template-columns:repeat(27, 20px);gap:1px;background:rgba(0,229,204,0.12);border:1px solid rgba(0,229,204,0.3);border-radius:4px;padding:1px;')}>
        {CIPHER_CELLS.map((cell, i) => <div key={i} style={css(cell.style)}>{cell.text}</div>)}
      </div>
      <div style={css('color:#5ec9c0;font-size:10px;letter-spacing:1px;margin-top:10px;')}>◆ 左側直排 ＝ 第一把鑰匙　◆ 上方橫排 ＝ 第二把鑰匙　◆ 交叉點 ＝ 密碼字母</div>
    </TerminalPanel>
  );
}

/**
 * A puzzle beat: optional description terminal, optional cipher table, and the
 * answer-input terminal in one of three input modes:
 * - fragment keypad (next non-story beat is a fragment → letter blanks + A–Z keys)
 * - hi-tech cells (beat.hiTechInput → per-letter cells over an invisible input)
 * - plain text input
 */
export function PuzzleBeat({ stageKey, beat, beatIndex, isFragmentAnswer, hasPrev, startDone, onAdvance, onPrev }) {
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle'); // idle | wrong | correct
  const [error, setError] = useState('');
  const wrongTimer = useRef(null);
  useEffect(() => () => clearTimeout(wrongTimer.current), []);

  const descText = useMemo(() => beat.descSegs.map((s) => s.text).join(''), [beat]);
  const { count, done, skip } = useTypewriter(descText, { startDone });

  const isHiTech = !isFragmentAnswer && !!beat.hiTechInput;
  const accent = beat.panel ? beat.panel.accent : '#00e5cc';
  const borderColor = status === 'correct' ? '#00e5cc' : status === 'wrong' ? '#ff2d78' : '#5a3a80';
  const inputDisabled = status === 'correct';

  const submit = () => {
    const given = input.trim();
    if (!given) return;
    if (status === 'correct') { onAdvance(); return; }
    const match = beat.acceptAny
      ? true
      : beat.caseInsensitive
        ? given.toLowerCase() === beat.answer.toLowerCase()
        : given === beat.answer;
    track('puzzle_attempt', { stageKey, beatIndex, input: given, correct: match });
    clearTimeout(wrongTimer.current);
    if (match) {
      setStatus('correct');
      setError('');
    } else {
      setStatus('wrong');
      setError('答案不對,再試一次');
      setInput('');
      wrongTimer.current = setTimeout(() => setStatus((s) => (s === 'wrong' ? 'idle' : s)), 1400);
    }
  };

  const pressFragmentKey = (ch) => {
    if (status === 'correct' || input.length >= beat.answer.length) return;
    setInput(input + ch);
    setStatus('idle');
    setError('');
  };

  const blanksOf = (chars, maxLen) => Array.from({ length: maxLen }).map((_, i) => ({
    char: chars[i] || '',
    isCursor: i === chars.length && status !== 'correct',
  }));

  return (
    <div style={css('flex:1;display:flex;flex-direction:column;justify-content:flex-start;gap:18px;overflow-y:auto;min-height:0;padding:4px 2px;')}>
      <div style={css('margin:auto 0;display:flex;flex-direction:column;gap:18px;')}>

        {beat.descSegs.length > 0 && (
          <TerminalPanel
            accent={accent}
            title={beat.panel ? beat.panel.title : 'MEMORY TERMINAL // 記憶解密終端'}
            tag={`NO.${String(beatIndex + 1).padStart(2, '0')}`}
            boot="0.85s"
            onClick={() => { if (!done) skip(); }}
            bodyStyle={{ padding: '20px 22px 24px', fontSize: 16, lineHeight: 2, textAlign: 'left', width: '100%', minHeight: 64 }}
          >
            <SegText segs={beat.descSegs} count={count} cursorColor={done ? null : accent} />
          </TerminalPanel>
        )}

        {beat.showCipherTable && <CipherTable />}

        {/* answer input terminal */}
        <div style={{
          ...css('position:relative;border-radius:14px;background:#050810;border:1px solid #1a2a30;padding:10px;box-shadow:0 0 0 1px rgba(0,229,204,0.08), 0 14px 30px rgba(0,0,0,0.5);transform-origin:center top;'),
          animation: `${status === 'wrong' ? 'glitchShift 0.4s ease' : 'none'}, screenBoot 0.85s cubic-bezier(0.2,0.9,0.25,1) 0.08s both`,
        }}>
          {status === 'correct' && (
            <div style={css('position:absolute;inset:-4px;border-radius:16px;border:2px solid #00e5cc;animation:successRipple 0.9s ease-out both;pointer-events:none;')} />
          )}
          <div style={{
            ...css('position:relative;border-radius:8px;overflow:hidden;'),
            background: `radial-gradient(ellipse at 50% 0%, ${borderColor}12, #060911 70%)`,
            border: `1px solid ${borderColor}88`,
            boxShadow: `inset 0 0 26px rgba(0,0,0,0.65), inset 0 0 30px ${borderColor}22, 0 0 22px ${borderColor}22`,
          }}>
            <div style={css('position:absolute;inset:0;z-index:1;pointer-events:none;background-image:repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 3px);')} />
            <div style={{ ...css('position:relative;z-index:2;display:flex;align-items:center;gap:8px;padding:11px 16px;'), borderBottom: `1px dashed ${borderColor}55` }}>
              <span style={css('width:6px;height:6px;border-radius:50%;background:#ff5566;opacity:0.7;')} />
              <span style={css('width:6px;height:6px;border-radius:50%;background:#f0c030;opacity:0.7;')} />
              <span style={css('width:6px;height:6px;border-radius:50%;background:#00e5cc;opacity:0.7;')} />
              <span style={{ ...css('font-size:11px;letter-spacing:2px;flex:1;'), color: borderColor, textShadow: `0 0 6px ${borderColor}88` }}>◆ {beat.inputLabel}</span>
              <span style={css('color:#ff5a7a;font-size:9px;letter-spacing:1px;animation:recBlink 1.6s step-start infinite;')}>● REC</span>
            </div>
            <div style={css('position:relative;z-index:2;padding:16px 18px 18px;')}>
              {isFragmentAnswer ? (
                <>
                  <div style={css('position:relative;padding:10px 6px;margin-bottom:6px;')}>
                    {[`top:0;left:0;border-top:1.5px solid ${borderColor}88;border-left:1.5px solid ${borderColor}88;`,
                      `top:0;right:0;border-top:1.5px solid ${borderColor}88;border-right:1.5px solid ${borderColor}88;`,
                      `bottom:0;left:0;border-bottom:1.5px solid ${borderColor}88;border-left:1.5px solid ${borderColor}88;`,
                      `bottom:0;right:0;border-bottom:1.5px solid ${borderColor}88;border-right:1.5px solid ${borderColor}88;`].map((pos, i) => (
                      <div key={i} style={css(`position:absolute;width:12px;height:12px;${pos}`)} />
                    ))}
                    <div style={css('display:flex;gap:10px;justify-content:center;')}>
                      {blanksOf(input.split(''), beat.answer.length).map((blank, i) => (
                        <div key={i} style={{
                          ...css('width:56px;height:64px;border-radius:8px;background:linear-gradient(180deg, #0a1418, #02040a);display:flex;align-items:center;justify-content:center;font-size:28px;color:#c8fff4;text-shadow:0 0 8px rgba(0,229,204,0.5);'),
                          border: `1px solid ${blank.char ? borderColor : '#5a3a80'}`,
                          boxShadow: `inset 0 2px 8px rgba(0,0,0,0.6), 0 0 10px ${blank.char ? borderColor : '#5a3a80'}33`,
                          animation: `blankPop 0.4s ease ${(i * 0.05).toFixed(2)}s both`,
                        }}>
                          {blank.char}
                          {blank.isCursor && (
                            <span style={{ ...css('width:2px;height:28px;display:inline-block;animation:cursorBlink 1s step-start infinite;'), background: borderColor }} />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={css('display:grid;grid-template-columns:repeat(6, 1fr);gap:6px;')}>
                    {FRAGMENT_KEY_LETTERS.map((l) => (
                      <button
                        key={l}
                        className="key-frag"
                        onClick={() => pressFragmentKey(l)}
                        style={{
                          ...css("height:40px;background:#0d1a1e;border-radius:6px;color:#9fd8d0;font-size:14px;cursor:pointer;"),
                          border: `1px solid ${borderColor}55`,
                          '--accent': borderColor,
                        }}
                      >{l}</button>
                    ))}
                  </div>
                  <button
                    className="press96"
                    onClick={() => status !== 'correct' && setInput(input.slice(0, -1))}
                    style={css("width:100%;margin-top:7px;height:38px;background:#2a0e4a;border:1px solid #9a50cc;border-radius:6px;color:#e0b0ff;font-size:12px;letter-spacing:2px;cursor:pointer;")}
                  >⌫ 清除</button>
                </>
              ) : isHiTech ? (
                <div style={css('position:relative;')}>
                  <div style={css('position:relative;display:flex;gap:6px;justify-content:center;flex-wrap:wrap;padding:16px 12px;border-radius:10px;overflow:hidden;background:repeating-linear-gradient(135deg, rgba(0,229,204,0.04) 0px, rgba(0,229,204,0.04) 2px, transparent 2px, transparent 14px), #02040a;border:1px solid rgba(0,229,204,0.25);')}>
                    <div style={css('position:absolute;top:0;left:-40%;width:40%;height:100%;background:linear-gradient(90deg, transparent, rgba(0,229,204,0.18), transparent);animation:hiTechScan 3.2s linear infinite;pointer-events:none;')} />
                    <div style={css('position:absolute;top:6px;left:8px;width:8px;height:8px;border-top:1.5px solid rgba(0,229,204,0.6);border-left:1.5px solid rgba(0,229,204,0.6);pointer-events:none;')} />
                    <div style={css('position:absolute;bottom:6px;right:8px;width:8px;height:8px;border-bottom:1.5px solid rgba(0,229,204,0.6);border-right:1.5px solid rgba(0,229,204,0.6);pointer-events:none;')} />
                    {blanksOf(input.toUpperCase().split(''), beat.answer.length).map((blank, i) => (
                      <div key={i} style={{
                        ...css('position:relative;width:32px;height:44px;border-radius:6px;background:linear-gradient(180deg, #0a1418, #050a0d);display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:#c8fff4;text-shadow:0 0 8px rgba(0,229,204,0.7);'),
                        border: `1.5px solid ${blank.char ? borderColor : 'rgba(0,229,204,0.28)'}`,
                        animation: blank.isCursor ? 'hiTechCellGlow 1.3s ease-in-out infinite' : 'none',
                      }}>
                        {blank.char}
                        {blank.isCursor && (
                          <span style={{ ...css('position:absolute;bottom:5px;width:14px;height:2px;animation:cursorBlink 1s step-start infinite;'), background: borderColor }} />
                        )}
                      </div>
                    ))}
                  </div>
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    disabled={inputDisabled}
                    maxLength={beat.answer.length}
                    style={css('position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:text;')}
                  />
                  <div style={css('text-align:center;color:#3a6a68;font-size:9px;letter-spacing:2px;margin-top:8px;')}>TAP TO INPUT · 點擊輸入</div>
                </div>
              ) : (
                <div style={css('position:relative;padding:6px;animation:inputRise 0.4s ease both;')}>
                  {[`top:0;left:0;border-top:1.5px solid ${borderColor}77;border-left:1.5px solid ${borderColor}77;`,
                    `top:0;right:0;border-top:1.5px solid ${borderColor}77;border-right:1.5px solid ${borderColor}77;`,
                    `bottom:0;left:0;border-bottom:1.5px solid ${borderColor}77;border-left:1.5px solid ${borderColor}77;`,
                    `bottom:0;right:0;border-bottom:1.5px solid ${borderColor}77;border-right:1.5px solid ${borderColor}77;`].map((pos, i) => (
                    <div key={i} style={css(`position:absolute;width:10px;height:10px;${pos}`)} />
                  ))}
                  <div style={css('position:relative;')}>
                    <div style={{ ...css('position:absolute;left:14px;top:50%;transform:translateY(-50%);font-size:20px;pointer-events:none;font-weight:700;z-index:2;'), color: borderColor, textShadow: `0 0 8px ${borderColor}` }}>&gt;</div>
                    <div style={css('position:absolute;left:1px;top:1px;right:1px;height:16px;border-radius:8px 8px 0 0;background:linear-gradient(to bottom, rgba(255,255,255,0.06), transparent);pointer-events:none;')} />
                    <input
                      className="puzzle-input"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      disabled={inputDisabled}
                      placeholder="輸入解密內容……"
                      style={{
                        ...css("width:100%;height:60px;background:#02040a;border-radius:8px;color:#c8fff4;font-family:'Share Tech Mono', monospace;font-size:20px;padding:0 16px 0 40px;letter-spacing:4px;transition:box-shadow 0.2s, border-color 0.2s;"),
                        border: `1px solid ${borderColor}`,
                        boxShadow: `inset 0 2px 8px rgba(0,0,0,0.6), 0 0 14px ${borderColor}33`,
                        '--accent-focus': `${borderColor}77`,
                      }}
                    />
                  </div>
                </div>
              )}
              {status === 'wrong' && (
                <div style={css('color:#ff80aa;font-size:13px;margin-top:10px;letter-spacing:1px;')}>▓▓ 錯誤 // {error}</div>
              )}
              {status === 'correct' && (
                <div style={css('color:#00ffee;font-size:13px;margin-top:10px;letter-spacing:2px;text-shadow:0 0 8px rgba(0,229,204,0.7);')}>▓▓ 驗證通過 // 解密成功</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={css('display:flex;gap:12px;')}>
        {hasPrev && (
          <button className="press98" onClick={onPrev} style={css("height:58px;padding:0 22px;background:#2a0e4a;border:2px solid #9a50cc;color:#e0b0ff;border-radius:8px;font-size:17px;letter-spacing:4px;cursor:pointer;")}>◂ 上一頁</button>
        )}
        <button className="press98" onClick={submit} style={css("flex:1;height:58px;background:#003a35;border:2px solid #00e5cc;color:#00ffee;border-radius:8px;font-size:17px;letter-spacing:6px;cursor:pointer;")}>
          {status === 'correct' ? '繼續 ▸' : '確認'}
        </button>
      </div>
    </div>
  );
}
