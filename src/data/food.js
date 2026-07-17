// Food-court mini-game orders + confetti generator.
const FOOD_ORDER_POOL = [
  { customer: '亮亮', item: '清燉牛筋+牛肉片+銷魂麵', price: 358 },
  { customer: '鮪魚', item: '終極龍王鍋', price: 1758 },
  { customer: '嘻嘻鍋', item: '椒香麻辣半筋半肉麵', price: 290 },
  { customer: '胖熊', item: '大份豆皮烏龍麵', price: 144 },
  { customer: '主廚高登', item: '油菜花半熟蛋披薩', price: 170 },
  { customer: '搖兩下', item: '麻辣滷鴨血+麻辣老豆腐', price: 120 },
  { customer: '偽李安', item: '蔬食菇菇鍋', price: 360 },
  { customer: '多米多羅', item: '咖喱牛肉油豆腐細粉', price: 210 },
  { customer: '水豚君', item: '三寶牛肉麵', price: 290 },
  { customer: '山羊一隻', item: '大碗明太蛋拌烏龍麵', price: 139 },
  { customer: '溫良恭儉修群', item: '中碗豚骨烏龍麵加一份豆皮', price: 184 },
  { customer: '變色龍情侶', item: '青醬海鮮燉飯+一顆半熟蛋', price: 145 },
  { customer: '失憶的詩人', item: '半熟蛋培根蛋奶麵', price: 150 },
  { customer: '便秘數十天的館長', item: '墨魚義大利麵+飲料吧', price: 180 },
  { customer: '圖書館的遊民', item: '經典豚骨拉麵', price: 210 },
  { customer: '跳完舞的高小蝸', item: '銷魂豚骨拉麵+滷鴨血', price: 280 },
  { customer: '皮卡丘的小智', item: '奶香茶咖喱+豆花吃到飽', price: 138 },
  { customer: '小智的皮卡丘', item: '銷魂麵舖五號餐+A套餐', price: 368 },
  { customer: 'dua威', item: '豬肉椒香麻辣酸菜魚', price: 288 },
  { customer: '格魯', item: '小小兵漢堡排壽司', price: 60 },
  { customer: '料老大', item: '桂香輕蕎麥', price: 60 },
];

const FOOD_ACCENTS = ['var(--gold)', 'var(--teal)', 'var(--purple)', 'var(--pink)'];

// Picks a random order whose index isn't in `usedIndices` yet, so no order
// repeats within one play session. Falls back to the full pool once every
// order has been shown (session ran long enough to exhaust it).
function pickFoodOrder(usedIndices = []) {
  const available = FOOD_ORDER_POOL
    .map((_, i) => i)
    .filter((i) => !usedIndices.includes(i));
  const pool = available.length > 0 ? available : FOOD_ORDER_POOL.map((_, i) => i);
  const index = pool[Math.floor(Math.random() * pool.length)];
  return { order: FOOD_ORDER_POOL[index], index };
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
