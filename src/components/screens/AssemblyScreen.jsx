import { useEffect, useRef, useState } from 'react';
import {
  FRAGMENT_ORDER, makePieceNode,
  ASSEMBLY_SLOT_STEP, ASSEMBLY_PIECE_W, ASSEMBLY_WIDTH,
  ASSEMBLY_PIECE_H, ASSEMBLY_TABLE_H, ASSEMBLY_SLOT_TOP, ASSEMBLY_AREA_H,
} from '../../lib/pieces.js';
import { PARTICLE_COLORS } from '../../lib/backdrop.js';
import { track } from '../../lib/track.js';
import { css } from '../../lib/css.js';

const BR = 12; // slot corner-bracket size

function shuffledTablePositions(letters) {
  const shuffled = [...letters];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const cols = shuffled.length || 1;
  const colW = ASSEMBLY_WIDTH / cols;
  const tablePos = {};
  shuffled.forEach((letter, i) => {
    const maxJitterX = Math.max(0, colW - ASSEMBLY_PIECE_W * 0.55);
    const x = Math.max(0, Math.min(ASSEMBLY_WIDTH - ASSEMBLY_PIECE_W, i * colW + Math.random() * maxJitterX));
    const y = Math.random() * Math.max(0, ASSEMBLY_TABLE_H - ASSEMBLY_PIECE_H - 12) + 6;
    tablePos[letter] = { x, y, rot: Math.random() * 18 - 9 };
  });
  return tablePos;
}

/**
 * Drag the fragments from the desk into the assembly row in canonical order.
 * `letters` is the correct order; `scale` converts pointer deltas back into
 * canvas coordinates; onComplete() fires ~2.2s after a correct assembly.
 */
export function AssemblyScreen({ letters, scale, onComplete }) {
  const [tablePos, setTablePos] = useState(() => shuffledTablePositions(letters));
  const [slots, setSlots] = useState(() => new Array(letters.length).fill(null));
  const [drag, setDrag] = useState(null);
  const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 });
  const [status, setStatus] = useState('idle'); // idle | wrong | correct
  const [burst, setBurst] = useState([]);
  const dragStart = useRef({ x: 0, y: 0 });
  const timerRef = useRef(null);
  useEffect(() => () => clearTimeout(timerRef.current), []);

  const onPieceDown = (letter, from) => (e) => {
    if (status === 'correct') return;
    e.preventDefault();
    e.stopPropagation();
    // Capture the pointer so this element keeps getting move/up events even
    // once the cursor strays outside the drag area — without this, a fast
    // trackpad swipe leaves the box mid-gesture and the piece snaps/cancels.
    e.currentTarget.setPointerCapture?.(e.pointerId);
    let startLeft, startTop;
    if (from === 'table') {
      const p = tablePos[letter] || { x: 0, y: 0 };
      startLeft = p.x; startTop = p.y;
    } else {
      startLeft = from * ASSEMBLY_SLOT_STEP; startTop = ASSEMBLY_SLOT_TOP;
    }
    dragStart.current = { x: e.clientX, y: e.clientY };
    setDrag({ letter, from, startLeft, startTop });
    setDragDelta({ x: 0, y: 0 });
  };

  const onPointerMove = (e) => {
    if (!drag) return;
    setDragDelta({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  };

  const onPointerUp = () => {
    if (!drag) return;
    const s = scale || 1;
    const newLeft = drag.startLeft + dragDelta.x / s;
    const newTop = drag.startTop + dragDelta.y / s;
    const centerY = newTop + ASSEMBLY_PIECE_H / 2;
    const nextSlots = [...slots];
    const nextTablePos = { ...tablePos };

    if (centerY > ASSEMBLY_TABLE_H + 6) {
      let targetIdx = Math.round(newLeft / ASSEMBLY_SLOT_STEP);
      targetIdx = Math.max(0, Math.min(nextSlots.length - 1, targetIdx));
      const occupant = nextSlots[targetIdx];
      if (drag.from === 'table') {
        delete nextTablePos[drag.letter];
        if (occupant && occupant !== drag.letter) {
          // Displaced piece pops back onto the desk where the drag began.
          nextTablePos[occupant] = { x: drag.startLeft, y: drag.startTop, rot: Math.random() * 18 - 9 };
        }
        nextSlots[targetIdx] = drag.letter;
      } else {
        if (targetIdx !== drag.from) nextSlots[drag.from] = occupant || null;
        nextSlots[targetIdx] = drag.letter;
      }
    } else {
      nextTablePos[drag.letter] = {
        x: Math.max(0, Math.min(ASSEMBLY_WIDTH - ASSEMBLY_PIECE_W, newLeft)),
        y: Math.max(0, Math.min(ASSEMBLY_TABLE_H - ASSEMBLY_PIECE_H, newTop)),
        rot: 0,
      };
      if (drag.from !== 'table') nextSlots[drag.from] = null;
    }

    setSlots(nextSlots);
    setTablePos(nextTablePos);
    setDrag(null);
    setDragDelta({ x: 0, y: 0 });
  };

  const confirm = () => {
    const correct = slots.length === letters.length && slots.every((l, i) => l === letters[i]);
    clearTimeout(timerRef.current);
    if (correct) {
      const n = 12;
      setBurst(Array.from({ length: n }, (_, i) => ({
        angle: (360 / n) * i + (Math.random() * 14 - 7),
        dist: 54 + Math.random() * 30,
        delay: Math.random() * 0.15,
        color: PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      })));
      setStatus('correct');
      track('assembly_complete', {});
      timerRef.current = setTimeout(onComplete, 2200);
    } else {
      setStatus('wrong');
      timerRef.current = setTimeout(() => setStatus((st) => (st === 'wrong' ? 'idle' : st)), 1400);
    }
  };

  const slotIndexOf = {};
  slots.forEach((l, i) => { if (l) slotIndexOf[l] = i; });
  const isCorrect = status === 'correct';
  const baselineTop = ASSEMBLY_SLOT_TOP + ASSEMBLY_PIECE_H + 10;
  const burstCenter = { x: ASSEMBLY_WIDTH / 2, y: ASSEMBLY_SLOT_TOP + ASSEMBLY_PIECE_H / 2 };

  return (
    <div style={css('position:absolute;inset:0;z-index:10;padding:34px 24px;display:flex;flex-direction:column;align-items:center;overflow:auto;')}>
      <div style={css('color:var(--teal-bright);font-size:14px;letter-spacing:4px;text-shadow:0 0 8px rgba(var(--teal-rgb),0.6);margin-bottom:8px;')}>MNEMO // 記憶重組</div>
      <div style={css('color:var(--purple-text-faint);font-size:12px;letter-spacing:2px;margin-bottom:22px;text-align:center;')}>拖曳桌上的記憶碎片，依正確順序放入下方拼湊區</div>

      <div
        style={{ position: 'relative', width: ASSEMBLY_WIDTH, height: ASSEMBLY_AREA_H, marginBottom: 30, touchAction: 'none' }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* desk surface */}
        <div style={{
          ...css('position:absolute;left:0;top:0;width:100%;border-radius:14px;overflow:hidden;border:1px solid rgba(var(--purple-border-rgb),0.35);background:radial-gradient(ellipse 70% 60% at 50% 30%, rgba(var(--desk-glow-rgb),0.16), transparent 70%), repeating-linear-gradient(128deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 9px), linear-gradient(160deg, var(--desk-a), var(--desk-b) 75%);box-shadow:inset 0 0 34px rgba(0,0,0,0.55);transition:opacity 0.6s ease;'),
          height: ASSEMBLY_TABLE_H,
          ...(isCorrect ? { animation: 'tableDim 0.8s ease both' } : {}),
        }}>
          <div style={css('position:absolute;inset:0;background:radial-gradient(circle at 50% 8%, rgba(var(--teal-rgb),0.09), transparent 55%);animation:deskGlowPulse 4s ease-in-out infinite;')} />
        </div>
        <div style={css('position:absolute;left:9px;top:9px;width:14px;height:14px;border-top:1.5px solid rgba(var(--purple-rgb),0.5);border-left:1.5px solid rgba(var(--purple-rgb),0.5);')} />
        <div style={css('position:absolute;right:9px;top:9px;width:14px;height:14px;border-top:1.5px solid rgba(var(--purple-rgb),0.5);border-right:1.5px solid rgba(var(--purple-rgb),0.5);')} />
        <div style={{ ...css('position:absolute;left:8px;transform:translateY(-22px);color:var(--purple-label);font-size:10px;letter-spacing:3px;'), top: ASSEMBLY_TABLE_H }}>桌面 · DESK</div>
        <div style={{ ...css('position:absolute;left:8px;transform:translateY(-20px);color:var(--teal-faint);font-size:10px;letter-spacing:3px;'), top: ASSEMBLY_SLOT_TOP }}>拼湊區 · ASSEMBLY</div>
        <div style={{ ...css('position:absolute;left:0;width:100%;height:1px;background:linear-gradient(to right, transparent, rgba(var(--teal-rgb),0.35), transparent);'), top: baselineTop }} />

        {/* slot outlines */}
        {slots.map((letter, i) => {
          const x = i * ASSEMBLY_SLOT_STEP, top = ASSEMBLY_SLOT_TOP, w = ASSEMBLY_PIECE_W, h = ASSEMBLY_PIECE_H;
          const filled = !!letter;
          const brColor = filled ? 'rgba(var(--teal-bright-rgb),0.75)' : 'rgba(var(--teal-rgb),0.32)';
          const bracket = { position: 'absolute', width: BR, height: BR, pointerEvents: 'none' };
          const line = `2px solid ${brColor}`;
          return (
            <div key={i}>
              <div style={{
                position: 'absolute', left: x, top, width: w, height: h, borderRadius: 6,
                background: filled ? 'rgba(var(--teal-rgb),0.05)' : 'rgba(var(--teal-rgb),0.02)',
                ...(filled ? { animation: 'slotLockPulse 2.2s ease-in-out infinite' } : {}),
              }} />
              <div style={{ ...bracket, left: x, top, borderTop: line, borderLeft: line }} />
              <div style={{ ...bracket, left: x + w - BR, top, borderTop: line, borderRight: line }} />
              <div style={{ ...bracket, left: x, top: top + h - BR, borderBottom: line, borderLeft: line }} />
              <div style={{ ...bracket, left: x + w - BR, top: top + h - BR, borderBottom: line, borderRight: line }} />
              <div style={{
                position: 'absolute', left: x, top: top + h + 4, width: w, textAlign: 'center',
                color: filled ? 'rgba(var(--teal-rgb),0.55)' : 'rgba(var(--teal-rgb),0.25)',
                fontSize: 9, letterSpacing: 1, pointerEvents: 'none',
              }}>0{i + 1}</div>
            </div>
          );
        })}

        {isCorrect && (
          <>
            <div style={{
              ...css('position:absolute;left:0;width:70px;background:linear-gradient(to right, transparent, rgba(var(--teal-bright-rgb),0.85), transparent);filter:blur(3px);animation:seamSweep 1.1s ease-out both;pointer-events:none;z-index:15;'),
              top: ASSEMBLY_SLOT_TOP, height: ASSEMBLY_PIECE_H,
            }} />
            {burst.map((d, i) => (
              <div key={i} style={{
                position: 'absolute', left: burstCenter.x, top: burstCenter.y, width: 0, height: 0,
                transform: `rotate(${d.angle}deg)`, zIndex: 16, pointerEvents: 'none',
              }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, width: 6, height: 6, borderRadius: '50%',
                  background: d.color, boxShadow: `0 0 8px ${d.color}`,
                  '--dist': `${d.dist}px`,
                  animation: `burstDot 0.9s ease-out ${d.delay.toFixed(2)}s both`,
                }} />
              </div>
            ))}
          </>
        )}

        {/* pieces */}
        {letters.map((letter) => {
          const inSlot = Object.prototype.hasOwnProperty.call(slotIndexOf, letter);
          const isDragging = !!(drag && drag.letter === letter);
          const canonIdx = FRAGMENT_ORDER.indexOf(letter);
          let baseLeft, baseTop, rot;
          if (isDragging) {
            baseLeft = drag.startLeft; baseTop = drag.startTop; rot = 0;
          } else if (inSlot) {
            baseLeft = slotIndexOf[letter] * ASSEMBLY_SLOT_STEP; baseTop = ASSEMBLY_SLOT_TOP; rot = 0;
          } else {
            const p = tablePos[letter] || { x: 0, y: 0, rot: 0 };
            baseLeft = p.x; baseTop = p.y; rot = p.rot || 0;
          }
          const s = scale || 1;
          const left = isDragging ? baseLeft + dragDelta.x / s : baseLeft;
          const top = isDragging ? baseTop + dragDelta.y / s : baseTop;
          const idleFloat = !isDragging && !inSlot && !isCorrect;
          const glowAnim = isCorrect
            ? `pieceCorrectGlow 1s ease-in-out ${(canonIdx * 0.12).toFixed(2)}s infinite`
            : idleFloat
              ? `pieceFloat ${(3.4 + (canonIdx % 3) * 0.5).toFixed(1)}s ease-in-out ${(canonIdx * 0.22).toFixed(2)}s infinite`
              : 'none';
          return (
            <div
              key={letter}
              onPointerDown={onPieceDown(letter, inSlot ? slotIndexOf[letter] : 'table')}
              style={{
                position: 'absolute', left, top, width: ASSEMBLY_PIECE_W,
                '--r': `${rot}deg`, cursor: 'grab',
                zIndex: isDragging ? 20 : inSlot ? 2 : 1,
                transform: idleFloat ? 'none' : `rotate(${isDragging ? 0 : rot}deg)`,
                transition: isDragging ? 'none' : 'left 0.22s ease, top 0.22s ease, transform 0.22s ease',
                touchAction: 'none',
                filter: isCorrect
                  ? 'drop-shadow(0 0 14px rgba(var(--teal-rgb),0.85))'
                  : isDragging
                    ? 'drop-shadow(0 10px 18px rgba(0,0,0,0.6)) brightness(1.08)'
                    : 'drop-shadow(0 2px 6px rgba(0,0,0,0.45))',
                animation: glowAnim,
              }}
            >
              {makePieceNode(letter, canonIdx, ASSEMBLY_PIECE_W, { gidSuffix: 'as' })}
            </div>
          );
        })}
      </div>

      {isCorrect && (
        <div style={css('display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:24px;animation:fadeUp 0.4s ease both;')}>
          <div style={css('color:var(--teal-bright);font-size:14px;letter-spacing:4px;text-shadow:0 0 10px rgba(var(--teal-rgb),0.8);')}>✓ 記憶重組成功 · 密碼已還原</div>
          <div style={css('display:flex;gap:6px;')}>
            {letters.join('').split('').map((ch, i) => (
              <span key={i} style={{
                ...css('display:inline-block;color:var(--teal-bright);font-size:22px;font-weight:700;letter-spacing:2px;text-shadow:0 0 10px rgba(var(--teal-rgb),0.85);'),
                animation: `passLetterIn 0.45s ease ${(0.5 + i * 0.09).toFixed(2)}s both`,
              }}>{ch}</span>
            ))}
          </div>
        </div>
      )}
      {status === 'wrong' && (
        <div style={css('color:var(--pink-text);font-size:13px;letter-spacing:2px;margin-bottom:20px;')}>順序不對，再試試看</div>
      )}

      <button className="press98" onClick={confirm} style={css("height:58px;padding:0 40px;background:var(--teal-bg);border:2px solid var(--teal);color:var(--teal-bright);border-radius:8px;font-size:16px;letter-spacing:6px;cursor:pointer;flex-shrink:0;")}>確認</button>
    </div>
  );
}
