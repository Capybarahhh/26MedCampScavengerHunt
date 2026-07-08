// Jigsaw fragment geometry + renderer (extracted verbatim; per design-spec 1.7).
import React from 'react';

const FRAGMENT_COLORS = {
  U: { light: '#e8d080', dark: '#a07820' },
  MQ: { light: '#dcc870', dark: '#987018' },
  SO: { light: '#e8d080', dark: '#a07820' },
  AX: { light: '#dcc870', dark: '#987018' },
  MF: { light: '#e8d080', dark: '#a07820' },
  JI: { light: '#dcc870', dark: '#987018' },
};

// ---- shared jigsaw piece geometry (per design-spec 1.7) ----
const PIECE_D = 20, PIECE_SW = 68, PIECE_PW = PIECE_SW + 2 * PIECE_D, PIECE_PH = 96;
const PIECE_PAPER_H = 84, PIECE_PAPER_Y = (PIECE_PH - PIECE_PAPER_H) / 2;
const PIECE_YS = [0, 10, 21, 32, 42, 53, 63, 74, PIECE_PAPER_H].map((y) => y + PIECE_PAPER_Y);
const PIECE_TEARS = [
  [0, 4, 12, 18, 18, 18, 12, 4, 0],       // T0: single big outward tab (knob)
  [0, -4, -12, -18, -18, -18, -12, -4, 0], // T1: single big inward notch (dent)
  [0, 10, -10, 10, -10, 10, -10, 10, 0],  // T2: fast fine zigzag
  [0, 16, 14, 4, -6, -14, -8, 6, 0],       // T3: skewed asymmetric wave
  [0, -8, 10, -14, 8, -14, 10, -8, 0],     // T4: irregular double-notch
];
const FRAGMENT_ORDER = ['U', 'MQ', 'SO', 'AX', 'MF', 'JI'];
const FRAGMENT_KEY_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function buildPiecePath(leftTear, rightTear) {
  const top = PIECE_YS[0], bottom = PIECE_YS[8];
  let d = `M 0 ${top} L ${PIECE_SW} ${top} `;
  for (let k = 1; k <= 8; k++) {
    const x = PIECE_SW + (rightTear ? rightTear[k] : 0);
    d += `L ${x} ${PIECE_YS[k]} `;
  }
  d += `L 0 ${bottom} `;
  for (let k = 7; k >= 1; k--) {
    const x = leftTear ? leftTear[k] : 0;
    d += `L ${x} ${PIECE_YS[k]} `;
  }
  d += 'Z';
  return d;
}

function pieceLeftTear(i) { return i > 0 ? PIECE_TEARS[i - 1] : null; }
function pieceRightTear(i) { return i < FRAGMENT_ORDER.length - 1 ? PIECE_TEARS[i] : null; }

function makePieceNode(letter, index, pxWidth, opts) {
  opts = opts || {};
  const colors = FRAGMENT_COLORS[letter] || { light: '#e8d080', dark: '#a07820' };
  const path = buildPiecePath(pieceLeftTear(index), pieceRightTear(index));
  const pxHeight = pxWidth * (PIECE_PH / PIECE_PW);
  const gid = 'pg-' + letter + '-' + index + '-' + (opts.gidSuffix || '0');
  const lineCount = 6;
  const lines = [];
  for (let n = 1; n <= lineCount; n++) {
    const y = PIECE_PAPER_Y + (n * (PIECE_PAPER_H / (lineCount + 1)));
    lines.push(React.createElement('line', { key: 'ln' + n, x1: 6, x2: PIECE_SW - 6, y1: y, y2: y, stroke: 'rgba(120,80,10,0.16)', strokeWidth: 1 }));
  }
  return React.createElement('svg', {
    viewBox: `${-PIECE_D} 0 ${PIECE_PW} ${PIECE_PH}`,
    width: pxWidth, height: pxHeight,
    style: { display: 'block', overflow: 'visible', filter: opts.filter || 'none', pointerEvents: 'none' },
  },
    React.createElement('defs', null,
      React.createElement('radialGradient', { id: gid, cx: '35%', cy: '28%', r: '80%' },
        React.createElement('stop', { offset: '0%', stopColor: colors.light }),
        React.createElement('stop', { offset: '100%', stopColor: colors.dark })
      )
    ),
    React.createElement('path', { d: path, fill: `url(#${gid})`, stroke: 'rgba(60,40,0,0.55)', strokeWidth: 1.5 }),
    ...lines,
    React.createElement('ellipse', { cx: PIECE_SW * 0.7, cy: PIECE_PAPER_Y + PIECE_PAPER_H * 0.62, rx: 15, ry: 9, fill: 'rgba(255,255,255,0.07)' }),
    React.createElement('text', {
      x: PIECE_SW / 2, y: PIECE_PH / 2 + 6, textAnchor: 'middle', fontFamily: 'Georgia, serif', fontStyle: 'italic',
      fontWeight: 700, fontSize: letter.length > 1 ? 15 : 18, fill: '#2a1a00', opacity: 0.85,
    }, letter)
  );
}

const ASSEMBLY_SCALE = 1.3;
const ASSEMBLY_SLOT_STEP = PIECE_SW * ASSEMBLY_SCALE;
const ASSEMBLY_PIECE_W = PIECE_PW * ASSEMBLY_SCALE;
const ASSEMBLY_WIDTH = ASSEMBLY_SLOT_STEP * 5 + ASSEMBLY_PIECE_W;
const ASSEMBLY_PIECE_H = ASSEMBLY_PIECE_W * (PIECE_PH / PIECE_PW);
const ASSEMBLY_TABLE_H = ASSEMBLY_PIECE_H + 64;
const ASSEMBLY_GAP = 30;
const ASSEMBLY_SLOT_TOP = ASSEMBLY_TABLE_H + ASSEMBLY_GAP;
const ASSEMBLY_AREA_H = ASSEMBLY_SLOT_TOP + ASSEMBLY_PIECE_H + 6;

export {
  FRAGMENT_COLORS, FRAGMENT_ORDER, FRAGMENT_KEY_LETTERS,
  makePieceNode,
  ASSEMBLY_SLOT_STEP, ASSEMBLY_PIECE_W, ASSEMBLY_WIDTH,
  ASSEMBLY_PIECE_H, ASSEMBLY_TABLE_H, ASSEMBLY_SLOT_TOP, ASSEMBLY_AREA_H,
};
