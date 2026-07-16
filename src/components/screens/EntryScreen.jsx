import { useState } from 'react';
import { css } from '../../lib/css.js';

const KEYS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Room-code keypad. Calls onConfirm(code) once all six slots are filled;
// onConfirm returns false for an unknown code → shake + error message.
export function EntryScreen({ onConfirm, onReset }) {
  const [room, setRoom] = useState(['', '', '', '', '', '']);
  const [errorShake, setErrorShake] = useState(0); // bumps to retrigger the animation

  const firstEmpty = room.findIndex((c) => c === '');
  const confirmDisabled = firstEmpty !== -1;

  const pressKey = (ch) => {
    if (firstEmpty === -1) return;
    const next = [...room];
    next[firstEmpty] = ch;
    setRoom(next);
    if (errorShake) setErrorShake(0);
  };

  const confirm = () => {
    if (confirmDisabled) return;
    const ok = onConfirm(room.join(''));
    if (!ok) {
      setRoom(['', '', '', '', '', '']);
      setErrorShake((n) => n + 1);
    }
  };

  return (
    <div style={css('position:absolute;inset:0;z-index:10;padding:64px 30px 24px;display:flex;flex-direction:column;')}>
      <div style={css('text-align:center;margin-bottom:6px;position:relative;display:inline-block;')}>
        <div style={css('font-family:var(--font-logo);font-size:24px;letter-spacing:1px;color:var(--teal-bright);text-shadow:0 0 18px rgba(var(--teal-rgb),0.8);')}>CYBERPUNK2157</div>
        <div style={css('position:absolute;top:0;left:0;font-family:var(--font-logo);font-size:24px;letter-spacing:1px;color:var(--pink);opacity:0;animation:glitchTop 4.5s infinite;')}>CYBERPUNK2157</div>
        <div style={css('position:absolute;top:0;left:0;font-family:var(--font-logo);font-size:24px;letter-spacing:1px;color:var(--purple);opacity:0;animation:glitchBot 4.5s infinite;')}>CYBERPUNK2157</div>
      </div>

      <div style={css('color:var(--purple-text-dim);font-size:14px;text-align:center;margin:26px 0 14px;letter-spacing:2px;')}>
        請輸入六位<span style={css('color:var(--teal);font-weight:700;')}>房間碼</span>以同步路線
      </div>

      <div
        key={errorShake}
        style={{
          ...css('display:flex;justify-content:center;gap:10px;margin-bottom:6px;'),
          animation: errorShake ? 'glitchShift 0.4s ease' : 'none',
        }}
      >
        {room.map((char, i) => (
          <div
            key={i}
            style={{
              ...css('width:68px;height:68px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:30px;color:var(--teal-bright);text-shadow:0 0 10px rgba(var(--teal-rgb),0.7);'),
              border: `2px solid ${errorShake ? 'var(--pink)' : char ? 'var(--teal)' : 'var(--purple-dim)'}`,
              background: char ? 'var(--teal-bg)' : 'var(--purple-deep)',
            }}
          >
            {char}
            {i === firstEmpty && (
              <span style={css('width:2px;height:30px;background:var(--teal);display:inline-block;animation:cursorBlink 1s step-start infinite;')} />
            )}
          </div>
        ))}
      </div>
      <div style={css('height:18px;text-align:center;color:var(--pink-text);font-size:12px;letter-spacing:2px;')}>
        {errorShake ? '▓▓ 房間碼無效 // 請確認小隊代碼' : ''}
      </div>

      <div style={css('flex:1;display:grid;grid-template-columns:repeat(6, 1fr);gap:7px;align-content:center;')}>
        {KEYS.map((k) => (
          <button
            key={k}
            className="key-entry"
            onClick={() => pressKey(k)}
            style={css("height:50px;background:var(--purple-panel);border:2px solid var(--purple-dim);border-radius:6px;color:var(--purple-text);font-size:19px;cursor:pointer;")}
          >{k}</button>
        ))}
      </div>

      <div style={css('display:flex;gap:12px;margin-top:16px;')}>
        <button
          className="press98"
          onClick={() => { setRoom(['', '', '', '', '', '']); setErrorShake(0); }}
          style={css("flex:1;height:56px;background:var(--purple-btn);border:2px solid var(--purple-border);color:var(--purple-text);border-radius:8px;font-size:16px;letter-spacing:2px;cursor:pointer;")}
        >清除</button>
        <button
          className="press98"
          onClick={confirm}
          disabled={confirmDisabled}
          style={{
            ...css("flex:2;height:56px;border:2px solid var(--teal);border-radius:8px;font-size:16px;letter-spacing:4px;cursor:pointer;"),
            background: confirmDisabled ? 'var(--teal-bg-dim)' : 'var(--teal-bg)',
            color: confirmDisabled ? 'var(--teal-muted)' : 'var(--teal-bright)',
            opacity: confirmDisabled ? 0.5 : 1,
          }}
        >同步進入</button>
      </div>

      <div style={css('text-align:center;margin-top:10px;')}>
        <button
          onClick={onReset}
          style={css("background:none;border:none;color:var(--purple-dim);font-size:11px;letter-spacing:2px;cursor:pointer;padding:8px;")}
        >重置示範</button>
      </div>
    </div>
  );
}
