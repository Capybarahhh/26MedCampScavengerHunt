import { useMemo, useState } from 'react';
import { INTRO_PAGES } from '../../data/intro.js';
import { useTypewriter } from '../../hooks/useTypewriter.js';
import { SegText } from '../ui/SegText.jsx';
import { TerminalPanel } from '../ui/TerminalPanel.jsx';
import { NavButtons } from '../ui/NavButtons.jsx';
import { css } from '../../lib/css.js';

// Opening narration: typewriter pages, with the last page framed as a
// SYSTEM NOTICE terminal panel. Calls onDone() when finished or skipped.
export function IntroScreen({ onDone }) {
  const [pageIndex, setPageIndex] = useState(0);
  // Pages we navigate back to render instantly instead of re-typing.
  const [instant, setInstant] = useState(false);

  const page = INTRO_PAGES[pageIndex];
  const fullText = useMemo(() => page.segs.map((s) => s.text).join(''), [page]);
  const { count, done, skip } = useTypewriter(fullText, { startDone: instant });

  const next = () => {
    if (pageIndex + 1 >= INTRO_PAGES.length) { onDone(); return; }
    setInstant(false);
    setPageIndex(pageIndex + 1);
  };
  const prev = () => {
    if (pageIndex <= 0) return;
    setInstant(true);
    setPageIndex(pageIndex - 1);
  };

  const body = (
    <SegText segs={page.segs} count={count} cursorColor={done ? null : '#00e5cc'} paraMargin={page.isRules ? 18 : 20} />
  );

  return (
    <div
      style={css('position:absolute;inset:0;z-index:10;padding:50px 34px 30px;display:flex;flex-direction:column;')}
      onClick={() => { if (!done) skip(); }}
    >
      <button
        className="press96"
        onClick={(e) => { e.stopPropagation(); onDone(); }}
        style={css("position:absolute;top:20px;right:24px;background:#2a0e4a;border:2px solid #9a50cc;color:#e0b0ff;border-radius:6px;height:36px;padding:0 14px;font-size:12px;letter-spacing:2px;cursor:pointer;z-index:5;")}
      >跳過 ▸</button>

      <div style={css('flex:1;display:flex;flex-direction:column;overflow-y:auto;min-height:0;')}>
        {page.isRules ? (
          <TerminalPanel
            title="SYSTEM NOTICE // 規則簡報"
            boot="0.9s"
            headerInset
            outerStyle={{ width: '100%', margin: 'auto 0', borderRadius: 12 }}
            bodyStyle={{ fontSize: 17, lineHeight: 2, textAlign: 'left' }}
          >
            {body}
          </TerminalPanel>
        ) : (
          <div style={css('font-size:19px;line-height:2.1;text-align:left;width:100%;')}>{body}</div>
        )}
      </div>

      <div style={css('display:flex;justify-content:center;gap:8px;margin-bottom:18px;')}>
        {INTRO_PAGES.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === pageIndex ? 26 : 8, height: 8, borderRadius: 4, transition: 'all 0.3s',
              background: i < pageIndex ? '#c060ff' : i === pageIndex ? '#00e5cc' : '#2a1a44',
            }}
          />
        ))}
      </div>

      {done && (
        <NavButtons
          hasPrev={pageIndex > 0}
          onPrev={(e) => { e.stopPropagation(); prev(); }}
          onNext={(e) => { e.stopPropagation(); next(); }}
          nextLabel={pageIndex === INTRO_PAGES.length - 1 ? '進入地圖 ▸' : '繼續 ▸'}
        />
      )}
    </div>
  );
}
