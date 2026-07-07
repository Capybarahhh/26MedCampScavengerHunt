import { css } from '../../lib/css.js';

const resetBtn = css("height:56px;padding:0 32px;background:#2a0e4a;border:2px solid #9a50cc;color:#e0b0ff;border-radius:8px;font-size:15px;letter-spacing:4px;cursor:pointer;");
const wrap = css('position:absolute;inset:0;z-index:10;padding:50px 34px 30px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;animation:endingFadeIn 1.2s ease both;');

// Fallback ending (assembly completed outside the END stage flow).
export function EndingScreen({ onReset }) {
  return (
    <div style={{ ...wrap, gap: 26 }}>
      <div style={css('color:#00ffee;font-size:18px;letter-spacing:8px;text-shadow:0 0 14px rgba(0,229,204,0.8);')}>NTUHOSPITAL</div>
      <div style={css('color:#c09ad8;font-size:16px;line-height:2;text-align:center;')}>記憶已重組完成。<br />（結局劇情尚待補充）</div>
      <button className="press97" onClick={onReset} style={resetBtn}>重新開始</button>
    </div>
  );
}

export function Ending1Screen({ onReset }) {
  return (
    <div style={wrap}>
      <div style={css('color:#f0e070;font-size:13px;letter-spacing:5px;text-shadow:0 0 10px rgba(240,192,48,0.6);')}>ENDING 1 // 保留所有記憶</div>
      <div style={css('color:#e8dcc8;font-size:16px;line-height:2;text-align:center;max-width:520px;')}>
        你選擇帶著完整的自己，繼續走下去。<br />有笑，有淚，也有熬夜與狼狽——但這才是真正活過的證明。<br /><br />（結局劇情尚待補充）
      </div>
      <button className="press97" onClick={onReset} style={resetBtn}>重新開始</button>
    </div>
  );
}

export function Ending2Screen({ onReset }) {
  return (
    <div style={wrap}>
      <div style={css('color:#c09ad8;font-size:13px;letter-spacing:5px;text-shadow:0 0 10px rgba(154,80,204,0.5);')}>ENDING 2 // 將記憶封回</div>
      <div style={css('color:#c09ad8;font-size:16px;line-height:2;text-align:center;max-width:520px;')}>
        你選擇把這些記憶重新鎖回原處。<br />不再想起那些酸楚與疲憊，只需要，繼續快樂地過下去。<br /><br />（結局劇情尚待補充）
      </div>
      <button className="press97" onClick={onReset} style={resetBtn}>重新開始</button>
    </div>
  );
}
