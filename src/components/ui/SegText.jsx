import { CLS_STYLE } from '../../data/clsStyle.js';
import { toParagraphs } from '../../lib/text.js';

/**
 * Renders a list of narrative segs ({ cls, text }) as styled paragraphs,
 * truncated to `count` visible characters (the typewriter budget).
 * Pass `cursorColor` to show a blinking ▌ after the text while typing.
 */
export function SegText({ segs, count = Infinity, cursorColor = null, paraMargin = 12 }) {
  let rem = count;
  const vis = [];
  for (const s of segs) {
    if (rem <= 0) break;
    const take = Math.min(s.text.length, rem);
    const st = CLS_STYLE[s.cls];
    vis.push({ text: s.text.slice(0, take), color: st.color, weight: st.weight, glow: st.glow });
    rem -= take;
  }
  const paras = toParagraphs(vis);
  return (
    <>
      {paras.map((para, pi) => (
        <div key={pi} style={{ margin: `0 0 ${paraMargin}px 0`, textAlign: 'left', width: '100%' }}>
          {para.runs.map((r, ri) =>
            r.isBr ? (
              <br key={ri} />
            ) : (
              <span key={ri} style={{ color: r.color, fontWeight: r.weight, textShadow: r.glow }}>
                {r.text}
              </span>
            )
          )}
        </div>
      ))}
      {cursorColor && (
        <span style={{ color: cursorColor, animation: 'cursorBlink 1s step-start infinite' }}>▌</span>
      )}
    </>
  );
}
