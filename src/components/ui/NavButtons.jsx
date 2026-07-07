import { css } from '../../lib/css.js';

// The「◂ 上一頁 / 繼續 ▸」button row shared by intro, story, terminal and puzzle beats.
export function NavButtons({ hasPrev = false, onPrev, onNext, nextLabel = '繼續 ▸', style = {} }) {
  return (
    <div style={{ display: 'flex', gap: 12, animation: 'fadeUp 0.4s ease both', ...style }}>
      {hasPrev && (
        <button
          className="press98"
          onClick={onPrev}
          style={css("height:58px;padding:0 22px;background:#2a0e4a;border:2px solid #9a50cc;color:#e0b0ff;border-radius:8px;font-size:17px;letter-spacing:4px;cursor:pointer;")}
        >◂ 上一頁</button>
      )}
      <button
        className="press98"
        onClick={onNext}
        style={css("flex:1;height:58px;background:#003a35;border:2px solid #00e5cc;color:#00ffee;border-radius:8px;font-size:17px;letter-spacing:6px;cursor:pointer;")}
      >{nextLabel}</button>
    </div>
  );
}
