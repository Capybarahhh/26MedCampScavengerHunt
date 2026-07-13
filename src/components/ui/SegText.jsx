import { CLS_STYLE } from '../../data/clsStyle.js';
import { toParagraphs } from '../../lib/text.js';
import { mix } from '../../lib/css.js';

// A "rule" paragraph — one that opens with a `seg('rule', label)` run —
// renders as a numbered tech-tag card instead of plain inline text. The
// label sits in its own fixed-width flex column so wrapped body text lines
// up under the FIRST body character, not under the label (the bug: plain
// inline text has no hanging indent, so a wrapped second line falls back to
// column 0, visually landing underneath the rule number). `accent` lets it
// match whichever panel it's embedded in (teal by default, gold in the food
// court, whatever a puzzle's own panel accent is, ...). `isActive` marks
// the row currently under the typewriter — it gets a scan sweep + brighter
// pulse; once typing moves past it, it settles to a calmer resting state.
const HEX_CLIP = 'polygon(7px 0, 100% 0, 100% calc(100% - 7px), calc(100% - 7px) 100%, 0 100%, 0 7px)';

function RuleRow({ para, accent, isActive, showCursor }) {
  const [label, ...body] = para.runs;
  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'flex-start', gap: 12, overflow: 'hidden',
      margin: '0 0 9px 0', padding: '9px 13px 9px 14px', borderRadius: 4,
      background: `linear-gradient(90deg, ${mix(accent, isActive ? 15 : 7)}, transparent 82%), repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 3px)`,
      borderLeft: `2px solid ${mix(accent, isActive ? 80 : 42)}`,
      boxShadow: isActive ? `0 0 18px ${mix(accent, 30)}, inset 0 0 14px ${mix(accent, 8)}` : 'none',
      animation: 'ruleRowIn 0.45s cubic-bezier(0.22,1,0.36,1) both',
      transition: 'box-shadow 0.5s ease, border-color 0.5s ease',
    }}>
      {isActive && (
        <div style={{
          position: 'absolute', top: 0, width: '40%', height: '100%', pointerEvents: 'none',
          background: `linear-gradient(90deg, transparent, ${mix(accent, 20)}, transparent)`,
          animation: 'ruleRowScan 1.8s linear infinite',
        }} />
      )}
      <span style={{
        position: 'relative', flexShrink: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        minWidth: 30, height: 25, padding: '0 9px', whiteSpace: 'nowrap', clipPath: HEX_CLIP,
        background: mix(accent, isActive ? 28 : 15), border: `1px solid ${mix(accent, 65)}`,
        color: label.color, fontWeight: 700, fontSize: 12, letterSpacing: 1.5,
        textShadow: label.glow, marginTop: 1,
        boxShadow: `0 0 ${isActive ? 14 : 7}px ${mix(accent, isActive ? 48 : 22)}`,
      }}>{label.text.trim()}</span>
      <span style={{ position: 'relative', flex: 1, minWidth: 0, textAlign: 'left' }}>
        {body.map((r, ri) => (
          r.isBr ? <br key={ri} /> : (
            <span key={ri} style={{ color: r.color, fontWeight: r.weight, textShadow: r.glow }}>{r.text}</span>
          )
        ))}
        {showCursor}
      </span>
      {isActive && (
        <span style={{
          position: 'absolute', top: 8, right: 9, width: 5, height: 5, borderRadius: '50%',
          background: accent, boxShadow: `0 0 6px ${accent}`, animation: 'powerDotPulse 1.1s ease-in-out infinite',
        }} />
      )}
    </div>
  );
}

/**
 * Renders a list of narrative segs ({ cls, text }) as styled paragraphs,
 * truncated to `count` visible characters (the typewriter budget).
 * Pass `cursorColor` to show a blinking ▌ after the text while typing.
 * Pass `accent` (a CSS color) to theme rule-row cards to match the panel
 * they're embedded in — defaults to teal.
 */
export function SegText({ segs, count = Infinity, cursorColor = null, paraMargin = 12, accent = 'var(--teal)' }) {
  let rem = count;
  const vis = [];
  for (const s of segs) {
    if (rem <= 0) break;
    const take = Math.min(s.text.length, rem);
    const st = CLS_STYLE[s.cls];
    vis.push({ text: s.text.slice(0, take), cls: s.cls, color: st.color, weight: st.weight, glow: st.glow });
    rem -= take;
  }
  const paras = toParagraphs(vis);
  const cursor = cursorColor && (
    <span style={{ color: cursorColor, animation: 'cursorBlink 1s step-start infinite' }}>▌</span>
  );

  // Split each paragraph into render blocks at every `rule`-classed run, not
  // just when one happens to open the paragraph. Content authors separate
  // rules with either "\n\n" (each rule its own toParagraphs() paragraph
  // already) or a single "\n" (several rules packed into one paragraph,
  // line-broken) — the latter used to leave rules 2+ stranded as plain bold
  // text inside rule 1's card instead of getting their own badge.
  const blocks = [];
  for (const para of paras) {
    let current = null;
    for (const r of para.runs) {
      if (r.cls === 'rule' && current) { blocks.push(current); current = null; }
      if (!current) current = { isRule: r.cls === 'rule', runs: [] };
      current.runs.push(r);
    }
    if (current) blocks.push(current);
  }

  return (
    <>
      {blocks.map((block, bi) => {
        const isLast = bi === blocks.length - 1;
        if (block.isRule) {
          return <RuleRow key={bi} para={block} accent={accent} isActive={isLast && !!cursorColor} showCursor={isLast && cursor} />;
        }
        return (
          <div key={bi} style={{ margin: `0 0 ${paraMargin}px 0`, textAlign: 'left', width: '100%' }}>
            {block.runs.map((r, ri) =>
              r.isBr ? (
                <br key={ri} />
              ) : (
                <span key={ri} style={{ color: r.color, fontWeight: r.weight, textShadow: r.glow }}>
                  {r.text}
                </span>
              )
            )}
            {isLast && cursor}
          </div>
        );
      })}
      {blocks.length === 0 && cursor}
    </>
  );
}
