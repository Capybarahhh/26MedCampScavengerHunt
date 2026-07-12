// Magnetic tilt buttons: on hover (mouse/trackpad) a button floats up and
// tilts toward the cursor; pressing it sinks it back down at that point.
// Touch/pen has no hover — a real touchscreen has no way to sense a finger
// before it lands — so a finger held down on the button is what lets you
// feel the tilt instead: press and drag to play with it, release for a
// springy bounce back to rest. A normal quick tap still just clicks (we
// never preventDefault/stopPropagation).
//
// One delegated listener set on `document` (not one per button, not React
// state), so cost is limited to whichever single button is actually being
// interacted with — nothing runs while idle. The `.magnetic-tilt` class
// (see global.css) is likewise only ever on that one button at a time, so
// only it gets the GPU layer the transform implies — every other button on
// screen stays plain. (An earlier version put the transform on every
// button unconditionally and that alone was enough to cause real jank —
// see the git history on this file if it needs revisiting.)
export function initMagneticButtons() {
  const canHover = window.matchMedia?.('(hover: hover) and (pointer: fine)').matches;

  let activeBtn = null;
  let releaseGen = 0;

  const onMove = (e) => {
    if (!activeBtn) return;
    const r = activeBtn.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const my = ((e.clientY - r.top) / r.height - 0.5) * 2;
    activeBtn.style.setProperty('--mx', mx.toFixed(3));
    activeBtn.style.setProperty('--my', my.toFixed(3));
  };

  const attach = (btn, lift) => {
    if (activeBtn && activeBtn !== btn) release(activeBtn);
    releaseGen++;
    activeBtn = btn;
    btn.classList.add('magnetic-tilt');
    btn.style.setProperty('--lift', lift);
    btn.addEventListener('pointermove', onMove);
  };

  const release = (btn) => {
    btn.removeEventListener('pointermove', onMove);
    btn.style.removeProperty('--mx');
    btn.style.removeProperty('--my');
    btn.style.removeProperty('--lift');
    if (activeBtn === btn) activeBtn = null;
    // Keep the class through the settle transition so it eases back to
    // neutral instead of snapping, then drop it — the tilt (and its GPU
    // layer) shouldn't outlive the interaction that produced it.
    const myGen = ++releaseGen;
    setTimeout(() => { if (myGen === releaseGen) btn.classList.remove('magnetic-tilt'); }, 340);
  };

  // Mouse/trackpad: float on hover, sink on press, release back to hover.
  if (canHover) {
    document.addEventListener('pointerover', (e) => {
      const btn = e.target.closest?.('button');
      if (!btn || btn === activeBtn || btn.disabled || e.pointerType !== 'mouse') return;
      attach(btn, '-6px');
    }, { passive: true });

    document.addEventListener('pointerout', (e) => {
      const btn = e.target.closest?.('button');
      if (!btn || btn !== activeBtn) return;
      if (btn.contains(e.relatedTarget)) return; // moved to a child, still hovering
      release(btn);
    }, { passive: true });
  }

  document.addEventListener('pointerdown', (e) => {
    const btn = e.target.closest?.('button');
    if (!btn || btn.disabled) return;
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      attach(btn, '0px'); // no float to fake on touch — just tilt-follow while held
      onMove(e);
    } else {
      btn.style.setProperty('--lift', '0px'); // mouse: sinks flat from its hovered float
    }
  }, { passive: true });

  document.addEventListener('pointerup', (e) => {
    const btn = e.target.closest?.('button');
    if (!btn) return;
    if (e.pointerType === 'touch' || e.pointerType === 'pen') { release(btn); return; }
    if (btn === activeBtn) btn.style.setProperty('--lift', '-6px'); // back to hovering-float
  }, { passive: true });

  document.addEventListener('pointercancel', (e) => {
    const btn = e.target.closest?.('button');
    if (btn) release(btn);
  }, { passive: true });
}
