import { css } from '../../lib/css.js';

// The「◂ 上一頁 / 繼續 ▸」button row shared by intro, story, terminal and puzzle beats.
export function NavButtons({ hasPrev = false, onPrev, onNext, nextLabel = '繼續 ▸', style = {} }) {
  return (
    <div style={{ display: 'flex', gap: 12, animation: 'fadeUp 0.4s ease both', ...style }}>
      {hasPrev && (
        <button
          className="press98"
          onClick={onPrev}
          style={css("height:58px;padding:0 22px;background:var(--purple-btn);border:2px solid var(--purple-border);color:var(--purple-text);border-radius:8px;font-size:17px;letter-spacing:4px;cursor:pointer;")}
        >◂ 上一頁</button>
      )}
      <button
        className="press98"
        onClick={onNext}
        style={css("flex:1;height:58px;background:var(--teal-bg);border:2px solid var(--teal);color:var(--teal-bright);border-radius:8px;font-size:17px;letter-spacing:6px;cursor:pointer;")}
      >{nextLabel}</button>
    </div>
  );
}
