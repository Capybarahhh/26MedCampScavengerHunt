import { useMemo } from 'react';
import { FOOD_ACCENTS } from '../../data/food.js';
import { useFoodGame } from '../../hooks/useFoodGame.js';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import { SegText } from '../ui/SegText.jsx';
import { TerminalPanel } from '../ui/TerminalPanel.jsx';
import { css, mix } from '../../lib/css.js';

function Rules({ beat, startDone, onStart }) {
  const fullText = useMemo(() => beat.rulesSegs.map((s) => s.text).join(''), [beat]);
  const { count, done, skip } = useTypewriter(fullText, { startDone });
  return (
    <div style={css('flex:1;display:flex;flex-direction:column;justify-content:center;')} onClick={() => { if (!done) skip(); }}>
      <div style={css('text-align:center;margin-bottom:16px;position:relative;')}>
        <div style={css('display:flex;align-items:center;justify-content:center;gap:10px;')}>
          <span style={css('width:22px;height:1px;background:linear-gradient(to left, rgba(var(--gold-rgb),0.7), transparent);')} />
          <span style={css('width:6px;height:6px;transform:rotate(45deg);background:var(--gold);box-shadow:0 0 8px rgba(var(--gold-rgb),0.8);')} />
          <span style={css('color:var(--gold-dim);font-size:10px;letter-spacing:5px;')}>FOOD COURT SURVIVAL</span>
          <span style={css('width:6px;height:6px;transform:rotate(45deg);background:var(--gold);box-shadow:0 0 8px rgba(var(--gold-rgb),0.8);')} />
          <span style={css('width:22px;height:1px;background:linear-gradient(to right, rgba(var(--gold-rgb),0.7), transparent);')} />
        </div>
        <div style={css('font-family:var(--font-display);color:var(--gold-bright);font-size:28px;font-weight:700;letter-spacing:4px;margin-top:8px;text-shadow:0 0 18px rgba(var(--gold-rgb),0.65), 0 0 3px rgba(255,255,255,0.4);')}>
          {beat.gameName || '美食街訂單挑戰'}
        </div>
      </div>

      <TerminalPanel accent="var(--gold)" title="送餐規則 // NO.001" zigzag bodyStyle={{ padding: '20px 22px 22px', fontSize: 15, lineHeight: 2, textAlign: 'left' }}>
        <SegText segs={beat.rulesSegs} count={count} cursorColor={done ? null : 'var(--gold)'} accent="var(--gold)" />
      </TerminalPanel>

      {done && (
        <button
          className="press98"
          onClick={onStart}
          style={css("margin-top:22px;height:58px;background:var(--gold-bg);border:2px solid var(--gold);color:var(--gold-bright);border-radius:8px;font-size:17px;letter-spacing:6px;cursor:pointer;box-shadow:0 0 20px rgba(var(--gold-rgb),0.15);")}
        >開始遊戲 ▸</button>
      )}
    </div>
  );
}

// Order text is content-driven (real dish names, some quite long — e.g.
// "中碗豚骨烏龍麵加一份豆皮") and the card is a fixed-ish width, so long
// strings auto-shrink a step rather than risk wrapping past the card's
// vertical budget or overflowing sideways.
function fitFontSize(text, { base, steps }) {
  for (const [len, size] of steps) if (text.length > len) return size;
  return base;
}

function OrderSlot({ slot, idx, onInput, onSubmit, onReshuffle }) {
  const accent = FOOD_ACCENTS[idx % 4];
  const customerSize = fitFontSize(slot.order.customer, { base: 11, steps: [[7, 9.5]] });
  const itemSize = fitFontSize(slot.order.item, { base: 16, steps: [[11, 13], [8, 14.5]] });
  const itemMinHeight = Math.ceil(itemSize * 1.4 * 2);
  const screenAnim =
    slot.status === 'poweroff' ? 'foodPowerOff 0.42s cubic-bezier(0.4,0,0.8,1) both'
    : slot.status === 'entering' ? 'screenBoot 0.6s cubic-bezier(0.2,0.9,0.25,1) both'
    : 'foodScreenIn 0.35s ease both';
  const timerColor = slot.timeLeft <= 10 ? 'var(--pink)' : accent;
  const borderColor = slot.status === 'wrong' ? 'var(--pink)' : accent;

  return (
    <div style={css('position:relative;padding-top:20px;')}>
      <div style={{ ...css('position:absolute;top:56px;left:50%;width:130px;height:90px;transform:translate(-50%,-50%);border-radius:50%;opacity:0.16;filter:blur(26px);pointer-events:none;'), background: accent }} />
      <div style={{ ...css('position:absolute;top:0;left:50%;width:2px;height:16px;transform:translateX(-50%);'), background: `linear-gradient(to bottom, #4a4050, ${accent})` }} />
      <div style={{ ...css('position:absolute;top:11px;left:50%;width:14px;height:9px;border-bottom:none;border-radius:3px 3px 0 0;transform:translateX(-50%);background:var(--gold-deep);'), border: `2px solid ${accent}`, borderBottom: 'none' }} />

      {slot.status !== 'empty' ? (
        <div style={{
          ...css('position:relative;border-radius:10px;overflow:hidden;transform-origin:center center;'),
          background: `radial-gradient(ellipse at 50% 0%, ${mix(accent, 13)}, var(--panel-2) 70%)`,
          border: `1.5px solid ${borderColor}`,
          boxShadow: `0 10px 22px rgba(0,0,0,0.5), inset 0 0 24px ${mix(accent, 9)}`,
          animation: screenAnim,
        }}>
          <div style={css('position:absolute;inset:0;z-index:1;pointer-events:none;background-image:repeating-linear-gradient(0deg, rgba(255,255,255,0.045) 0px, rgba(255,255,255,0.045) 1px, transparent 1px, transparent 3px);')} />
          <div style={{ ...css('position:absolute;left:0;right:0;height:50px;z-index:1;pointer-events:none;animation:scanlineMove 4s linear infinite;'), background: `linear-gradient(to bottom, transparent, ${mix(accent, 16)}, transparent)` }} />
          {slot.status === 'entering' && (
            <div style={{ ...css('position:absolute;inset:0;z-index:2;pointer-events:none;opacity:0;animation:screenFlash 0.6s ease-out both;'), background: accent }} />
          )}

          {(slot.status === 'idle' || slot.status === 'wrong') && (
            <button
              className="press95"
              onClick={() => onReshuffle(idx)}
              title="換一張訂單"
              style={{
                ...css('position:absolute;top:6px;right:6px;z-index:4;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;line-height:1;cursor:pointer;'),
                background: mix(accent, 15), border: `1px solid ${mix(accent, 45)}`, color: accent,
              }}
            >⟳</button>
          )}

          <div style={css('position:relative;z-index:2;text-align:center;padding-top:10px;')}>
            <span style={{
              ...css('display:inline-block;min-width:52px;padding:2px 8px;border-radius:5px;background:rgba(0,0,0,0.35);font-size:20px;font-weight:700;letter-spacing:2px;'),
              color: timerColor, textShadow: `0 0 10px ${timerColor}`,
            }}>{slot.timeLeft}s</span>
          </div>

          <div style={css('position:relative;z-index:2;padding:10px 14px 16px;text-align:center;')}>
            <div style={{
              ...css('letter-spacing:2px;margin-bottom:6px;opacity:0.85;overflow-wrap:break-word;'),
              color: accent, fontSize: customerSize,
            }}>客人 · {slot.order.customer}</div>
            <div style={{
              ...css('color:var(--paper-text);font-weight:700;letter-spacing:0.5px;line-height:1.4;display:flex;align-items:center;justify-content:center;overflow-wrap:break-word;'),
              textShadow: `0 0 10px ${mix(accent, 60)}`, fontSize: itemSize, minHeight: itemMinHeight,
            }}>{slot.order.item}</div>
            <div style={css('display:flex;gap:8px;margin-top:10px;')}>
              <input
                value={slot.input}
                onChange={(e) => onInput(idx, e.target.value)}
                type="tel"
                inputMode="numeric"
                placeholder="輸入金額"
                style={{
                  ...css("flex:1;height:38px;border-radius:6px;background:var(--input-bg);font-family:var(--font-ui);font-size:15px;text-align:center;letter-spacing:2px;box-shadow:inset 0 2px 6px rgba(0,0,0,0.6);"),
                  border: `1px solid ${mix(accent, 47)}`, color: accent,
                }}
              />
              <button
                className="press95"
                onClick={() => onSubmit(idx)}
                style={{
                  ...css("height:38px;padding:0 12px;border-radius:6px;color:#fff;font-size:12px;letter-spacing:1px;cursor:pointer;"),
                  background: `${mix(accent, 13)}`, border: `1px solid ${accent}`,
                }}
              >送出</button>
            </div>
            {slot.status === 'wrong' && (
              <div style={css('color:var(--pink);font-size:11px;margin-top:7px;letter-spacing:1px;')}>▓ 金額不對</div>
            )}
          </div>

          {slot.status === 'success' && (
            <div style={css('position:absolute;inset:0;z-index:3;background:rgba(3,5,10,0.94);display:flex;align-items:center;justify-content:center;animation:foodOverlayIn 0.2s ease both;')}>
              <div style={css('text-align:center;animation:foodCheckPop 0.5s cubic-bezier(0.34,1.56,0.64,1) both;')}>
                <div style={css('color:var(--teal-bright);font-size:34px;text-shadow:0 0 20px rgba(var(--teal-rgb),0.9);')}>✓</div>
                <div style={css('color:var(--teal-bright);font-size:16px;letter-spacing:4px;margin-top:6px;text-shadow:0 0 12px rgba(var(--teal-rgb),0.8);font-weight:700;')}>送餐成功</div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          ...css('height:130px;border-radius:10px;display:flex;align-items:center;justify-content:center;animation:foodEmptyPulse 1s ease-in-out infinite;'),
          border: `1.5px dashed ${mix(accent, 33)}`,
        }}>
          <span style={{ ...css('font-size:11px;letter-spacing:3px;'), color: `${mix(accent, 47)}` }}>等待新訂單…</span>
        </div>
      )}
    </div>
  );
}

// The「天下沒有你的午餐」delivery mini-game beat.
export function FoodGameBeat({ beat, startDone, onContinue, onPass, onFail }) {
  const game = useFoodGame({ onPass, onFail });
  const mm = Math.floor(game.timeLeft / 60);
  const ss = String(game.timeLeft % 60).padStart(2, '0');

  return (
    <div style={css('flex:1;display:flex;flex-direction:column;')}>
      {game.phase === 'rules' && (
        <Rules key={game.run} beat={beat} startDone={startDone && game.run === 0} onStart={game.start} />
      )}

      {game.phase === 'playing' && (
        <>
          <div style={css('display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;')}>
            <div style={css('color:var(--gold-text);font-size:13px;letter-spacing:2px;')}>剩餘時間 {mm}:{ss}</div>
            <div style={css('color:var(--gold-text);font-size:13px;letter-spacing:2px;')}>完成 {game.completed} / {game.target}</div>
          </div>
          <div style={css('flex:1;display:grid;grid-template-rows:repeat(2, 1fr);gap:28px;')}>
            {[game.slots.slice(0, 2), game.slots.slice(2, 4)].map((row, ri) => (
              <div key={ri} style={css('position:relative;display:grid;grid-template-columns:repeat(2, 1fr);gap:18px;')}>
                <div style={css('position:absolute;top:9px;left:6%;right:6%;height:1px;background:linear-gradient(to right, transparent, var(--gold-line), var(--gold-line), transparent);')} />
                {row.map((slot, ci) => (
                  <OrderSlot key={slot.id} slot={slot} idx={ri * 2 + ci} onInput={game.inputChange} onSubmit={game.submit} onReshuffle={game.reshuffle} />
                ))}
              </div>
            ))}
          </div>
          <button className="press97" onClick={game.openResetConfirm} style={css("margin-top:16px;height:44px;background:none;border:1px solid var(--purple-dim);color:var(--purple-text-faint);border-radius:8px;font-size:12px;letter-spacing:2px;cursor:pointer;")}>重新開始</button>
        </>
      )}

      {game.showResetConfirm && (
        <div style={css('position:absolute;inset:0;z-index:20;background:rgba(3,4,9,0.8);display:flex;align-items:center;justify-content:center;animation:foodOverlayIn 0.2s ease both;')}>
          <div style={css('width:260px;border-radius:14px;background:var(--modal-bg);border:2px solid var(--purple-border);box-shadow:0 20px 44px rgba(0,0,0,0.6), 0 0 24px rgba(var(--purple-border-rgb),0.25);padding:22px 20px;text-align:center;animation:foodCheckPop 0.35s cubic-bezier(0.34,1.56,0.64,1) both;')}>
            <div style={css('color:var(--purple-text);font-size:15px;letter-spacing:1px;line-height:1.7;margin-bottom:18px;')}>確定要重新開始嗎？<br />目前進度將會消失。</div>
            <div style={css('display:flex;gap:10px;')}>
              <button className="press97" onClick={game.cancelResetConfirm} style={css("flex:1;height:46px;background:var(--purple-panel);border:1px solid var(--purple-dim);color:var(--purple-text-dim);border-radius:8px;font-size:13px;letter-spacing:2px;cursor:pointer;")}>取消</button>
              <button className="press97" onClick={game.confirmReset} style={css("flex:1;height:46px;background:var(--pink-bg);border:1px solid var(--pink);color:var(--pink-text);border-radius:8px;font-size:13px;letter-spacing:2px;cursor:pointer;")}>確定重來</button>
            </div>
          </div>
        </div>
      )}

      {game.phase === 'passed' && (
        <div style={css('flex:1;position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;')}>
          <div style={css('position:absolute;inset:0;pointer-events:none;')}>
            {game.confetti.map((c, i) => <div key={i} style={css(c.style)} />)}
          </div>

          <div style={css('color:var(--gold-text);font-size:15px;letter-spacing:8px;text-shadow:0 0 10px rgba(var(--gold-rgb),0.7);animation:fadeUp 0.4s ease both;')}>任 務 通 過</div>

          <div style={css('position:relative;width:308px;animation:licenseCardIn 0.7s cubic-bezier(0.22,1,0.36,1) 0.1s both;')}>
            <div style={css('position:relative;border-radius:16px;background:linear-gradient(135deg, var(--gold-card-a), var(--gold-card-b) 65%);border:2px solid var(--gold);box-shadow:0 0 0 1px rgba(var(--gold-rgb),0.25), 0 20px 46px rgba(0,0,0,0.6), inset 0 0 30px rgba(var(--gold-rgb),0.08);padding:20px 22px 24px;overflow:hidden;')}>
              <div style={css('position:absolute;inset:0;z-index:0;pointer-events:none;background-image:repeating-linear-gradient(0deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px);')} />
              <div style={css('position:absolute;top:7px;left:7px;width:14px;height:14px;border-top:2px solid rgba(var(--gold-rgb),0.6);border-left:2px solid rgba(var(--gold-rgb),0.6);')} />
              <div style={css('position:absolute;top:7px;right:7px;width:14px;height:14px;border-top:2px solid rgba(var(--gold-rgb),0.6);border-right:2px solid rgba(var(--gold-rgb),0.6);')} />
              <div style={css('position:absolute;bottom:7px;left:7px;width:14px;height:14px;border-bottom:2px solid rgba(var(--gold-rgb),0.6);border-left:2px solid rgba(var(--gold-rgb),0.6);')} />
              <div style={css('position:absolute;bottom:7px;right:7px;width:14px;height:14px;border-bottom:2px solid rgba(var(--gold-rgb),0.6);border-right:2px solid rgba(var(--gold-rgb),0.6);')} />

              <div style={css('position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;border-bottom:1px dashed rgba(var(--gold-rgb),0.4);padding-bottom:10px;margin-bottom:16px;')}>
                <span style={css('color:var(--gold);font-size:10px;letter-spacing:3px;')}>CP2157 DELIVERY GUILD</span>
                <span style={css('width:7px;height:7px;border-radius:50%;background:var(--gold);color:var(--gold);animation:powerDotPulse 1.4s ease-in-out infinite;')} />
              </div>

              <div style={css('position:relative;z-index:1;display:flex;gap:16px;align-items:center;')}>
                <div style={css('width:60px;height:60px;border-radius:50%;background:radial-gradient(circle at 35% 30%, var(--gold-bright), #a07820 72%);display:flex;align-items:center;justify-content:center;box-shadow:0 0 18px rgba(var(--gold-rgb),0.55);flex-shrink:0;')}>
                  <div style={css('width:30px;height:30px;border-radius:50%;border:3px solid var(--gold-ink);')} />
                </div>
                <div>
                  <div style={css('color:var(--gold-label);font-size:9px;letter-spacing:2px;')}>LICENSE NO. 2157-B4</div>
                  <div style={css('color:var(--gold-bright);font-size:19px;font-weight:700;letter-spacing:1.5px;margin-top:4px;text-shadow:0 0 10px rgba(var(--gold-rgb),0.6);')}>外送員兼工具人執照</div>
                </div>
              </div>

              <div style={css('position:relative;z-index:1;margin-top:14px;color:var(--gold-body);font-size:12.5px;line-height:1.8;letter-spacing:0.5px;')}>
                本執照證明持有人已完成黑色地下市集之送餐試煉，具備在極限時間內同時處理多筆訂單之能力，特此認證。
              </div>
            </div>

            <div style={css('position:absolute;bottom:-8px;right:-14px;animation:stampSlam 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.8s both;')}>
              <div style={css('border:3px solid var(--pink);border-radius:8px;color:var(--pink);font-size:14px;font-weight:700;letter-spacing:2px;padding:5px 12px;text-shadow:0 0 8px rgba(var(--pink-rgb),0.6);opacity:0.92;background:rgba(5,5,8,0.3);')}>PASSED</div>
            </div>
          </div>

          <button
            className="press98"
            onClick={onContinue}
            style={css("height:56px;padding:0 40px;background:var(--gold-bg);border:2px solid var(--gold);color:var(--gold-bright);border-radius:8px;font-size:16px;letter-spacing:6px;cursor:pointer;box-shadow:0 0 20px rgba(var(--gold-rgb),0.15);animation:fadeUp 0.4s ease 0.3s both;")}
          >繼續 ▸</button>
        </div>
      )}

      {game.phase === 'failed' && (
        <div style={css('flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;')}>
          <div style={css('color:var(--pink-text);font-size:18px;letter-spacing:6px;')}>失敗</div>
          <button className="press98" onClick={game.retry} style={css("height:58px;padding:0 40px;background:var(--purple-btn);border:2px solid var(--purple-border);color:var(--purple-text);border-radius:8px;font-size:16px;letter-spacing:4px;cursor:pointer;")}>重新挑戰</button>
        </div>
      )}
    </div>
  );
}
