import { useEffect, useRef, useState } from 'react';

// Punctuation-aware per-character delay (ported from the original delayForChar).
function delayForChar(ch) {
  if (ch === '。' || ch === '！' || ch === '？' || ch === '—') return 260;
  if (ch === '，' || ch === '、' || ch === ',') return 120;
  if (ch === '\n') return 80;
  return 32;
}

/**
 * Types `text` out one character at a time.
 * Returns { count, done, skip } — `count` is how many chars are visible,
 * `skip()` jumps straight to the end (tap-to-skip).
 * Pass `startDone: true` to show the full text immediately (e.g. going back a page).
 * Restarts whenever `text` or `resetKey` changes; the pending timer is
 * cleaned up automatically on unmount.
 */
export function useTypewriter(text, { startDone = false, resetKey = 0 } = {}) {
  const [count, setCount] = useState(startDone ? text.length : 0);
  const [done, setDone] = useState(startDone || text.length === 0);
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    if (startDone || text.length === 0) {
      setCount(text.length);
      setDone(true);
      return;
    }
    setCount(0);
    setDone(false);
    let pos = 0;
    const tick = () => {
      pos += 1;
      setCount(pos);
      if (pos >= text.length) setDone(true);
      else timerRef.current = setTimeout(tick, delayForChar(text[pos - 1]));
    };
    timerRef.current = setTimeout(tick, delayForChar(text[0]));
    return () => clearTimeout(timerRef.current);
  }, [text, startDone, resetKey]);

  const skip = () => {
    clearTimeout(timerRef.current);
    setCount(text.length);
    setDone(true);
  };

  return { count, done, skip };
}
