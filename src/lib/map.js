// Smooth path through map nodes.
// Smooth Catmull-Rom -> cubic-bezier CLOSED loop through the ring of stage
// points. Returns per-edge segments (not a single string) so the caller can
// stitch together the exact same curve for both the full dashed loop and
// any traveled sub-arc — reusing identical segments is what keeps the
// moving signal dot glued to the dashed guide line instead of drifting off
// it (an independently-recomputed sub-path has different Catmull-Rom
// control points at its own start/end, which visibly diverges).
function closedLoopSegments(pts) {
  const n = pts.length;
  if (n < 2) return [];
  const segs = [];
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % n];
    const p3 = pts[(i + 2) % n];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    segs.push(`C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x},${p2.y} `);
  }
  return segs;
}

// The full dashed loop through all ring points, back to the start.
function loopPath(pts) {
  if (pts.length < 2) return '';
  return `M ${pts[0].x},${pts[0].y} ` + closedLoopSegments(pts).join('');
}

// A sub-arc of that exact same loop, `count` points starting at `startIdx`
// (wrapping around the ring) — built from the identical per-edge segments
// `loopPath` uses, so it always traces precisely on top of the full loop.
function loopSubPath(pts, startIdx, count) {
  if (count < 2) return '';
  const segs = closedLoopSegments(pts);
  const start = pts[startIdx % pts.length];
  let d = `M ${start.x},${start.y} `;
  for (let k = 0; k < count - 1; k++) {
    d += segs[(startIdx + k) % pts.length];
  }
  return d;
}

export { loopPath, loopSubPath };
