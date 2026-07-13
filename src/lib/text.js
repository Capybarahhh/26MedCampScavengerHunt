// seg() constructor for narrative runs + paragraph splitter for rendering.
function seg(cls, text) { return { cls, text }; }

// Splits a flat run list on paragraph breaks (\n\n) into blocks, so each
// paragraph renders as its own left-flush block box (avoids inline pre-wrap
// quirks where a short run right after a double-newline can render indented).
// `cls` rides along per-run (not just its resolved color/weight/glow) so
// callers can detect e.g. "this paragraph opens with a `rule` run" and give
// it different layout — see SegText's rule-row handling.
function toParagraphs(runs) {
  const paras = [[]];
  for (const r of runs) {
    const blocks = r.text.split('\n\n');
    blocks.forEach((block, bi) => {
      const lines = block.split('\n');
      lines.forEach((line, li) => {
        if (line.length) paras[paras.length - 1].push({ text: line, cls: r.cls, color: r.color, weight: r.weight, glow: r.glow, isBr: false, isText: true });
        if (li < lines.length - 1) paras[paras.length - 1].push({ text: '', cls: r.cls, color: r.color, weight: r.weight, glow: r.glow, isBr: true, isText: false });
      });
      if (bi < blocks.length - 1) paras.push([]);
    });
  }
  return paras.filter((p) => p.length > 0).map((runs2) => ({ runs: runs2 }));
}

export { seg, toParagraphs };
