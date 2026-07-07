// Pokémon type-effectiveness chart for the duel-rules beat.
const TYPE_INFO = {
  一般: { color: '#A8A878', dark: true }, 火: { color: '#F08030', dark: true }, 水: { color: '#6890F0', dark: true },
  電: { color: '#F8D030', dark: true }, 草: { color: '#78C850', dark: true }, 冰: { color: '#98D8D8', dark: true },
  格鬥: { color: '#C03028', dark: false }, 毒: { color: '#A040A0', dark: false }, 地面: { color: '#E0C068', dark: true },
  飛行: { color: '#A890F0', dark: true }, 超能力: { color: '#F85888', dark: true }, 蟲: { color: '#A8B820', dark: true },
  岩石: { color: '#B8A038', dark: true }, 幽靈: { color: '#705898', dark: false }, 龍: { color: '#7038F8', dark: false },
  惡: { color: '#705848', dark: false }, 鋼: { color: '#B8B8D0', dark: true }, 妖精: { color: '#EE99AC', dark: true },
};
const TYPE_STRONG_AGAINST = {
  一般: [], 火: ['草', '冰', '蟲', '鋼'], 水: ['火', '地面', '岩石'], 電: ['水', '飛行'],
  草: ['水', '地面', '岩石'], 冰: ['草', '地面', '飛行', '龍'], 格鬥: ['一般', '冰', '岩石', '惡', '鋼'],
  毒: ['草', '妖精'], 地面: ['火', '電', '毒', '岩石', '鋼'], 飛行: ['草', '格鬥', '蟲'],
  超能力: ['格鬥', '毒'], 蟲: ['草', '超能力', '惡'], 岩石: ['火', '冰', '飛行', '蟲'],
  幽靈: ['超能力', '幽靈'], 龍: ['龍'], 惡: ['超能力', '幽靈'], 鋼: ['冰', '岩石', '妖精'],
  妖精: ['格鬥', '龍', '惡'],
};
const TYPE_ICONS = {
  一般: '⬡', 火: '🔥', 水: '💧', 電: '⚡', 草: '🌿', 冰: '❄', 格鬥: '👊', 毒: '☠',
  地面: '⛰', 飛行: '🪽', 超能力: '🔮', 蟲: '🐛', 岩石: '🪨', 幽靈: '👻', 龍: '🐉',
  惡: '🌑', 鋼: '⚙', 妖精: '✨',
};
const TYPE_CHART_ROWS = Object.keys(TYPE_INFO).map((name) => ({
  name, icon: TYPE_ICONS[name] || '', color: TYPE_INFO[name].color, textColor: TYPE_INFO[name].dark ? '#1a1206' : '#fdf6ff',
  targets: TYPE_STRONG_AGAINST[name].map((t) => ({ name: t, icon: TYPE_ICONS[t] || '', color: TYPE_INFO[t].color, textColor: TYPE_INFO[t].dark ? '#1a1206' : '#fdf6ff' })),
}));

export { TYPE_INFO, TYPE_STRONG_AGAINST, TYPE_ICONS, TYPE_CHART_ROWS };
