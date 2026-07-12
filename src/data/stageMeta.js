// Map node metadata + SVG icon shape definitions (extracted verbatim from legacy MNEMO.dc.html).
const NODE_ICON_SHAPES = [
  [ { kind: 'rect', x: 10, y: 38, w: 7, h: 18, filled: true, opacity: 0.85 },
    { kind: 'rect', x: 19, y: 26, w: 7, h: 30, filled: true, opacity: 0.85 },
    { kind: 'rect', x: 28, y: 32, w: 7, h: 24, filled: true, opacity: 0.85 },
    { kind: 'rect', x: 37, y: 22, w: 7, h: 34, filled: true, opacity: 0.85 },
    { kind: 'rect', x: 46, y: 30, w: 7, h: 26, filled: true, opacity: 0.85 },
    { kind: 'rect', x: 8, y: 56, w: 48, h: 3, filled: true, opacity: 0.6 } ],
  [ { kind: 'circle', cx: 48, cy: 15, r: 6, filled: true, opacity: 0.55 },
    { kind: 'rect', x: 10, y: 34, w: 11, h: 24, filled: false, sw: 1.4, opacity: 0.85 },
    { kind: 'rect', x: 24, y: 24, w: 11, h: 34, filled: false, sw: 1.4, opacity: 0.85 },
    { kind: 'rect', x: 38, y: 30, w: 11, h: 28, filled: false, sw: 1.4, opacity: 0.85 },
    { kind: 'rect', x: 13, y: 40, w: 3, h: 3, filled: true, opacity: 0.9 },
    { kind: 'rect', x: 28, y: 30, w: 3, h: 3, filled: true, opacity: 0.9 },
    { kind: 'rect', x: 42, y: 36, w: 3, h: 3, filled: true, opacity: 0.9 } ],
  [ { kind: 'polygon', points: '12,46 52,46 45,54 19,54', filled: true, opacity: 0.85 },
    { kind: 'rect', x: 30, y: 18, w: 2, h: 26, filled: true, opacity: 0.7 },
    { kind: 'polygon', points: '32,18 32,34 47,30', filled: true, opacity: 0.9 },
    { kind: 'rect', x: 8, y: 58, w: 48, h: 2, filled: true, opacity: 0.4 } ],
  [ { kind: 'polygon', points: '50,32 41,17 23,17 14,32 23,47 41,47', filled: false, sw: 1.6, opacity: 0.85 },
    { kind: 'polygon', points: '32,22 42,32 32,42 22,32', filled: true, opacity: 0.9 } ],
  [ { kind: 'polygon', points: '32,10 54,52 10,52', filled: false, sw: 1.6, opacity: 0.85 },
    { kind: 'rect', x: 18, y: 44, w: 5, h: 5, filled: true, opacity: 0.8 },
    { kind: 'rect', x: 28, y: 47, w: 4, h: 4, filled: true, opacity: 0.8 },
    { kind: 'rect', x: 38, y: 45, w: 5, h: 5, filled: true, opacity: 0.8 },
    { kind: 'rect', x: 24, y: 38, w: 4, h: 4, filled: true, opacity: 0.7 } ],
  // 市中心 — a fractured burst radiating from a single point: the city's
  // center as the place everything converges and comes apart (失序).
  [ { kind: 'polygon', points: '32.0,5.0 36.6,20.9 51.1,12.9 43.1,27.4 59.0,32.0 43.1,36.6 51.1,51.1 36.6,43.1 32.0,59.0 27.4,43.1 12.9,51.1 20.9,36.6 5.0,32.0 20.9,27.4 12.9,12.9 27.4,20.9', filled: false, sw: 1.6, opacity: 0.85 },
    { kind: 'circle', cx: 32, cy: 32, r: 3.5, filled: true, opacity: 1 } ],
  [ { kind: 'circle', cx: 32, cy: 32, r: 19, filled: false, sw: 1.4, opacity: 0.6 },
    { kind: 'circle', cx: 32, cy: 32, r: 11, filled: false, sw: 1.4, opacity: 0.8 },
    { kind: 'circle', cx: 32, cy: 32, r: 3.5, filled: true, opacity: 1 },
    { kind: 'circle', cx: 32, cy: 9, r: 1.8, filled: true, opacity: 0.9 },
    { kind: 'circle', cx: 32, cy: 55, r: 1.8, filled: true, opacity: 0.9 },
    { kind: 'circle', cx: 9, cy: 32, r: 1.8, filled: true, opacity: 0.9 },
    { kind: 'circle', cx: 55, cy: 32, r: 1.8, filled: true, opacity: 0.9 } ],
];

// The six stages sit on a circle (in this fixed cyclic play order); the
// ending sits at the center and only unlocks once all six are complete.
// Prologue has no map node — it plays as its own screen before the map.
const STAGE_ORDER = ['R', 'Y', 'A', 'M', 'G', 'C'];

const STAGE_META = [
  { code: 'R', name: '圖書館', x: 350, y: 80, kind: 'stage', key: 'R' },
  { code: 'Y', name: '舊城區', x: 540.5, y: 190, kind: 'stage', key: 'Y' },
  { code: 'A', name: '傳送港', x: 540.5, y: 410, kind: 'stage', key: 'A' },
  { code: 'M', name: '地下市集', x: 350, y: 520, kind: 'stage', key: 'M' },
  { code: 'G', name: '垃圾山', x: 159.5, y: 410, kind: 'stage', key: 'G' },
  { code: 'C', name: '市中心', x: 159.5, y: 190, kind: 'stage', key: 'C' },
  { code: '?', name: '終章', x: 350, y: 300, kind: 'ending', key: null },
];

export { NODE_ICON_SHAPES, STAGE_META, STAGE_ORDER };
