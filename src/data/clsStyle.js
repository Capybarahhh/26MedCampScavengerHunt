// Text-run styling per narrative class (narr/quote/rule/mission/warn/key).
const CLS_STYLE = {
  narr: { color: 'var(--purple-text-dim)', weight: 400, glow: 'none' },
  quote: { color: 'var(--teal)', weight: 400, glow: '0 0 8px rgba(var(--teal-rgb),0.6)' },
  rule: { color: 'var(--teal)', weight: 700, glow: '0 0 8px rgba(var(--teal-rgb),0.6)' },
  mission: { color: 'var(--gold)', weight: 700, glow: '0 0 10px rgba(var(--gold-rgb),0.6)' },
  warn: { color: 'var(--pink-text)', weight: 600, glow: '0 0 8px rgba(var(--pink-rgb),0.5)' },
  key: { color: 'var(--teal-bright)', weight: 700, glow: '0 0 10px rgba(var(--teal-rgb),0.85)' },
  sysalert: { color: 'var(--pink)', weight: 400, glow: '0 0 8px rgba(var(--pink-rgb),0.6)' },
};

export { CLS_STYLE };
