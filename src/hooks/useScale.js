import { useEffect, useState } from 'react';

// The game renders on a fixed 700×800 canvas, scaled to fit the viewport.
// Reads window.visualViewport when available (mobile browsers resize it,
// not window.innerHeight, when the address bar collapses/expands or a
// keyboard opens — using innerHeight there is what made the layout look
// clipped after navigating a couple screens in on a phone) and re-measures
// on its resize/scroll events too, not just window's.
export function useScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const vv = window.visualViewport;
    const onResize = () => {
      const w = vv?.width ?? window.innerWidth;
      const h = vv?.height ?? window.innerHeight;
      const s = Math.min(w / 700, h / 800, 1);
      setScale(s || 1);
    };
    onResize();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    vv?.addEventListener('resize', onResize);
    vv?.addEventListener('scroll', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      vv?.removeEventListener('resize', onResize);
      vv?.removeEventListener('scroll', onResize);
    };
  }, []);
  return scale;
}
