// Converts a CSS declaration string into a React style object, so the styles
// ported from the original template stay readable as plain CSS.
// Results are cached per string; do NOT use for styles that change every
// frame (e.g. drag positions) — build those as plain objects instead.
const cache = new Map();

// Alpha-fade any CSS color — including var(--token) references — without
// string-concatenating hex alpha suffixes (which break with var()).
// mix('var(--teal)', 53) ≈ the old '#00e5cc88'.
export function mix(color, pct) {
  return `color-mix(in srgb, ${color} ${pct}%, transparent)`;
}

export function css(str) {
  let obj = cache.get(str);
  if (obj) return obj;
  obj = {};
  for (const decl of str.split(';')) {
    const i = decl.indexOf(':');
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const key = prop.startsWith('--') ? prop : prop.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
    obj[key] = decl.slice(i + 1).trim();
  }
  cache.set(str, obj);
  return obj;
}
