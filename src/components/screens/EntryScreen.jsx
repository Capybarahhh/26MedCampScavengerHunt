import { useState } from 'react';
import { css } from '../../lib/css.js';

const KEYS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Room-code keypad. Calls onConfirm(code) once all six slots are filled.
export function EntryScreen({ onConfirm, onReset }) {
  const [room, setRoom] = useState(['', '', '', '', '', '']);

  const firstEmpty = room.findIndex((c) => c === '');
  const confirmDisabled = firstEmpty !== -1;

  const pressKey = (ch) => {
    if (firstEmpty === -1) return;
    const next = [...room];
    next[firstEmpty] = ch;
    setRoom(next);
  };

  return (
    <div style={css('position:absolute;inset:0;z-index:10;padding:36px 30px 24px;display:flex;flex-direction:column;')}>
      <div style={css('text-align:center;margin-bottom:6px;position:relative;display:inline-block;')}>
        <div style={css('font-size:44px;letter-spacing:10px;color:#00ffee;text-shadow:0 0 18px rgba(0,229,204,0.8);font-weight:700;')}>MNEMO</div>
        <div style={css('position:absolute;top:0;left:0;font-size:44px;letter-spacing:10px;color:#ff2d78;font-weight:700;opacity:0;animation:glitchTop 4.5s infinite;')}>MNEMO</div>
        <div style={css('position:absolute;top:0;left:0;font-size:44px;letter-spacing:10px;color:#c060ff;font-weight:700;opacity:0;animation:glitchBot 4.5s infinite;')}>MNEMO</div>
        <div style={css('color:#c09ad8;font-size:14px;letter-spacing:4px;margin-top:6px;')}>記憶協定 · 房間碼驗證</div>
      </div>

      <div style={css('color:#c09ad8;font-size:14px;text-align:center;margin:26px 0 14px;letter-spacing:2px;')}>
        請輸入六位<span style={css('color:#00e5cc;font-weight:700;')}>房間碼</span>以同步路線
      </div>

      <div style={css('display:flex;justify-content:center;gap:10px;margin-bottom:24px;')}>
        {room.map((char, i) => (
          <div
            key={i}
            style={{
              ...css('width:68px;height:68px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:30px;color:#00ffee;text-shadow:0 0 10px rgba(0,229,204,0.7);'),
              border: `2px solid ${char ? '#00e5cc' : '#5a3a80'}`,
              background: char ? '#003a35' : '#150a24',
            }}
          >
            {char}
            {i === firstEmpty && (
              <span style={css('width:2px;height:30px;background:#00e5cc;display:inline-block;animation:cursorBlink 1s step-start infinite;')} />
            )}
          </div>
        ))}
      </div>

      <div style={css('flex:1;display:grid;grid-template-columns:repeat(6, 1fr);gap:7px;align-content:start;')}>
        {KEYS.map((k) => (
          <button
            key={k}
            className="key-entry"
            onClick={() => pressKey(k)}
            style={css("height:50px;background:#180b2c;border:2px solid #5a3a80;border-radius:6px;color:#e0b0ff;font-size:19px;cursor:pointer;")}
          >{k}</button>
        ))}
      </div>

      <div style={css('display:flex;gap:12px;margin-top:16px;')}>
        <button
          className="press98"
          onClick={() => setRoom(['', '', '', '', '', ''])}
          style={css("flex:1;height:56px;background:#2a0e4a;border:2px solid #9a50cc;color:#e0b0ff;border-radius:8px;font-size:16px;letter-spacing:2px;cursor:pointer;")}
        >清除</button>
        <button
          className="press98"
          onClick={() => !confirmDisabled && onConfirm(room.join(''))}
          disabled={confirmDisabled}
          style={{
            ...css("flex:2;height:56px;border:2px solid #00e5cc;border-radius:8px;font-size:16px;letter-spacing:4px;cursor:pointer;"),
            background: confirmDisabled ? '#0a1f1c' : '#003a35',
            color: confirmDisabled ? '#0e5c53' : '#00ffee',
            opacity: confirmDisabled ? 0.5 : 1,
          }}
        >同步進入</button>
      </div>

      <div style={css('text-align:center;margin-top:10px;')}>
        <button
          onClick={onReset}
          style={css("background:none;border:none;color:#5a3a80;font-size:11px;letter-spacing:2px;cursor:pointer;padding:8px;")}
        >重置示範</button>
      </div>
    </div>
  );
}
