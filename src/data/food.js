// Food-court mini-game orders + confetti generator.
const FOOD_ORDER_POOL = [
  { customer: '亮亮', item: '大杯荔荔蜜桃椰果', price: 70 },
  { customer: '鮪魚', item: '大杯原鄉冬瓜茶', price: 45 },
  { customer: '嘻嘻鍋', item: '中杯珍珠鮮奶+大杯芋頭鮮奶', price: 170 },
  { customer: '胖熊', item: '大杯桂香輕蕎麥', price: 60 },
  { customer: '主廚高登', item: '養樂多綠', price: 60 },
  { customer: '搖兩下', item: '經典豚骨拉麵', price: 210 },
  { customer: '偽李安', item: '銷魂豚骨拉麵+麻辣滷鴨血', price: 290 },
  { customer: '多米多羅', item: '雙倍肉量的黑蒜豚骨拉麵', price: 280 },
  { customer: '水豚君', item: '經典豚骨拉麵+無糖烏龍茶', price: 260 },
  { customer: '山羊一隻', item: '油菜花半熟蛋披薩', price: 170 },
  { customer: '溫良恭儉修群', item: '夏威夷披薩', price: 130 },
  { customer: '變色龍情侶', item: '雞肉焗烤飯+青醬海鮮燉飯', price: 240 },
  { customer: '失憶的詩人', item: '墨魚燉飯', price: 120 },
  { customer: '便秘數十天的館長', item: '九層瑪格麗特披薩+單人飲料吧', price: 180 },
  { customer: '圖書館的遊民', item: '一倍牛肉金湯酸菜', price: 248 },
  { customer: '跳完舞的高小蝸', item: '兩倍魚肉蕃茄酸湯', price: 288 },
  { customer: '皮卡丘的小智', item: '三倍豬肉檸檬青花椒', price: 338 },
  { customer: '小智的皮卡丘', item: '椒麻口水雞+醋溜手撕雞', price: 148 },
  { customer: 'dua威', item: '一倍豬肉塔香壽喜+一份魚肉', price: 303 },
  { customer: '格魯', item: '炸里肌豬排定食', price: 249 },
  { customer: '料老大', item: '韓式焗起司辣雞定食', price: 259 },
  { customer: '康師傅', item: '純正關西壽喜燒定食', price: 289 },
  { customer: '很嗨的經紀人', item: '黃金豬排歐姆蛋咖喱飯', price: 269 },
  { customer: '吃不飽的世中', item: '溏心蛋豚骨拉麵+八塊唐揚雞', price: 308 },
  { customer: '翔哥', item: '奶香茶咖喱舒肥雞套餐', price: 198 },
  { customer: '莎莉ㄡ呸', item: '熟成茶咖喱燉牛肋套餐', price: 298 },
  { customer: 'ㄟ哀機器人', item: '青花麻婆豆腐舒肥雞套餐', price: 198 },
  { customer: '主教Darling', item: '原味泡芙+巧克力泡芙', price: 70 },
  { customer: '偶像七川', item: '甜蝦沙拉', price: 130 },
  { customer: 'Bangbang與Annajo', item: '奶油南瓜濃湯', price: 55 },
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
