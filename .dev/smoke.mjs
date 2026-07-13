// Mounts the built bundle in happy-dom and walks entry → map → stage story,
// catching any load/render-time crash from the token refactor.
import { Window } from 'happy-dom';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const win = new Window({ url: 'http://localhost/' });
for (const k of ['window', 'document', 'localStorage', 'navigator', 'location', 'HTMLElement', 'Node', 'CustomEvent', 'MutationObserver', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame']) {
  try { Object.defineProperty(globalThis, k, { value: win[k], configurable: true, writable: true }); } catch {}
}
globalThis.fetch = () => Promise.resolve({ ok: true });

// Pre-seed progress so App restores straight into the map with G current.
win.localStorage.setItem('mnemo_progress', JSON.stringify({
  room: ['1','2','3','4','5','6'], screen: 'map', startStageKey: 'G', completedStages: [], collectedFragments: ['MF','AX'],
}));

const errors = [];
win.addEventListener('error', (e) => errors.push(e.message));

document.body.innerHTML = '<div id="root"></div>';
const asset = readdirSync(`${ROOT}/dist/assets`).find((f) => f.endsWith('.js'));
await import(`${ROOT}/dist/assets/${asset}`);
await new Promise((r) => setTimeout(r, 300));

const html = () => document.getElementById('root').innerHTML;
if (!html().includes('訊號地圖')) throw new Error('map screen did not render: ' + html().slice(0, 300));
console.log('map screen OK, length', html().length);

// Click the current (G) node → stage story beat should mount.
const nodes = [...document.querySelectorAll('div')].filter((d) => d.textContent === '垃圾山' && d.style && d.style.cursor !== '');
const clickable = [...document.querySelectorAll('div')].find((d) => d.getAttribute('style')?.includes('cursor: pointer') && d.textContent.includes('垃圾山'));
if (!clickable) throw new Error('G node not clickable');
clickable.click();
await new Promise((r) => setTimeout(r, 500));
if (!html().includes('垃圾山')) throw new Error('stage screen did not render');
if (!html().includes('沒有導航')) throw new Error('story beat text not typing: ' + html().slice(0, 400));
console.log('stage story beat OK (typewriter running)');
console.log('window errors:', errors.length ? errors : 'none');
