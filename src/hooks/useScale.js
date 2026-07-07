import { useEffect, useState } from 'react';

// The game renders on a fixed 700×800 canvas, scaled to fit the viewport.
export function useScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const onResize = () => {
      const s = Math.min(window.innerWidth / 700, window.innerHeight / 800, 1);
      setScale(s || 1);
    };
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return scale;
}
