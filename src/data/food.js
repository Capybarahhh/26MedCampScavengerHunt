// Food-court mini-game orders + confetti generator.
const FOOD_ORDER_POOL = [
  { customer: '亮亮', item: '清燉牛筋+牛肉片+銷魂麵', price: 358 },
  { customer: '鮪魚', item: '終極龍王鍋', price: 1758 },
  { customer: '嘻嘻鍋', item: '椒香麻辣半筋半肉麵', price: 290 },
  { customer: '胖熊', item: '大份豆皮烏龍麵', price: 144 },
  { customer: '主廚高登', item: '油菜花半熟蛋披薩', price: 170 },
];

const FOOD_ACCENTS = ['var(--gold)', 'var(--teal)', 'var(--purple)', 'var(--pink)'];

function pickFoodOrder() {
  return FOOD_ORDER_POOL[Math.floor(Math.random() * FOOD_ORDER_POOL.length)];
}

function makeFoodConfetti(n) {
  const arr = [];
  for (let i = 0; i < n; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 90 + Math.random() * 150;
    const dx = Math.cos(angle) * dist;
    const dy = Math.sin(angle) * dist - 30;
    const size = 5 + Math.random() * 5;
    const color = FOOD_ACCENTS[i % FOOD_ACCENTS.length];
    const delay = Math.random() * 0.25;
    const rot = Math.random() * 360;
    const style = `position:absolute;top:50%;left:50%;width:${size}px;height:${size}px;background:${color};border-radius:${i % 2 === 0 ? '2px' : '50%'};box-shadow:0 0 6px ${color};transform:translate(-50%,-50%) rotate(${rot}deg);--dx:${dx.toFixed(1)}px;--dy:${dy.toFixed(1)}px;animation:confettiBurst 1.15s ease-out ${delay.toFixed(2)}s both;pointer-events:none;`;
    arr.push({ style });
  }
  return arr;
}

export { FOOD_ORDER_POOL, FOOD_ACCENTS, pickFoodOrder, makeFoodConfetti };
