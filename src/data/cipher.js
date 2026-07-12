// Vigenère cipher table cells for the final MEMORY LOCK puzzle.
const CIPHER_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CIPHER_CELLS = (() => {
  const cells = [];
  const cellBase = 'display:flex;align-items:center;justify-content:center;width:20px;height:20px;font-family:var(--font-ui);font-size:10px;';
  cells.push({ text: '', style: `${cellBase}background:#03060c;` });
  for (let c = 0; c < 26; c++) {
    cells.push({ text: CIPHER_ALPHA[c], style: `${cellBase}background:rgba(0,229,204,0.16);color:#00ffee;font-weight:700;text-shadow:0 0 4px rgba(0,229,204,0.6);` });
  }
  for (let r = 0; r < 26; r++) {
    cells.push({ text: CIPHER_ALPHA[r], style: `${cellBase}background:rgba(154,80,204,0.18);color:#e0b0ff;font-weight:700;text-shadow:0 0 4px rgba(154,80,204,0.6);` });
    for (let c = 0; c < 26; c++) {
      const letter = CIPHER_ALPHA[(r + c) % 26];
      const alt = (r + c) % 26 === 0;
      cells.push({ text: letter, style: `${cellBase}background:${alt ? 'rgba(0,229,204,0.09)' : '#060911'};color:${alt ? '#9fe8e0' : '#4a6a68'};` });
    }
  }
  return cells;
})();

export { CIPHER_CELLS };
