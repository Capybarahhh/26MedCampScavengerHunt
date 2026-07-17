/**
 * CYBERPUNK2157 城市尋寶 — Google Sheet 資料收集後端
 *
 * 使用方式見 docs/DEPLOY.md。簡述：
 *   1. 開一個新的 Google Sheet
 *   2. 擴充功能 → Apps Script → 把本檔全部內容貼上（取代預設程式碼）
 *   3. 部署 → 新增部署作業 → 類型「網頁應用程式」→
 *      執行身分：我 / 誰可以存取：所有人 → 部署 → 複製網頁應用程式網址
 *   4. 把網址填進專案的 .env.production 的 VITE_TRACK_ENDPOINT
 *
 * 收到的每一筆事件會：
 *   a. 追加到「該小隊自己的分頁」（每個小隊一張分頁，各自記錄自己的每個行動；
 *      尚未登入 / 登入失敗的事件歸到「未分類」分頁）
 *   b. 即時更新「小隊看板」工作表（一隊一列的進度總覽）
 */

const SHEET_BOARD = '小隊看板';
const CREATOR_CODE = '000000'; // 工作人員測試碼——看板會略過它

// 事件代碼 → 中文顯示
const EVENT_LABELS = {
  session_start: '開啟頁面',
  room_confirmed: '登入成功',
  room_rejected: '登入失敗',
  stage_start: '進入關卡',
  puzzle_attempt: '解謎作答',
  colorpick_attempt: '選色作答',
  fragment_collected: '取得碎片',
  foodgame_end: '外送遊戲結束',
  assembly_complete: '拼圖完成',
  ending_choice: '選擇結局',
  reset: '重置進度',
};

const STAGE_LABELS = {
  R: '廢棄的圖書館', Y: '舊城區', A: '傳送港', M: '黑色地下市集',
  G: '垃圾山', C: '市中心', END: '終章',
};

// 各關卡在「小隊看板」上的「答錯次數」欄名（每關一欄，方便一眼看出哪一關卡關）
const STAGE_ERROR_COL = {
  R: '圖書館錯誤', Y: '舊城區錯誤', A: '傳送港錯誤', M: '地下市集錯誤',
  G: '垃圾山錯誤', C: '市中心錯誤', END: '終章錯誤',
};

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000); // 多隊同時作答時避免寫入互相衝突
  try {
    const data = JSON.parse(e.postData.contents);
    appendEvent_(data);
    if (data.roomCode && data.roomCode !== CREATOR_CODE) updateBoard_(data);
    return ContentService.createTextOutput('ok');
  } catch (err) {
    // 記錄壞掉的請求方便除錯，但永遠回 200，不讓前端出錯
    console.error(err);
    return ContentService.createTextOutput('error');
  } finally {
    lock.releaseLock();
  }
}

// 瀏覽器直接打開網址時顯示的健康檢查頁
function doGet() {
  return ContentService.createTextOutput('CYBERPUNK2157 tracker is running.');
}

function sheet_(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

/** 把事件的「重點內容」壓成一格好讀的文字 */
function summarize_(d) {
  switch (d.event) {
    case 'puzzle_attempt':
    case 'colorpick_attempt': {
      const what = d.input != null ? d.input : (d.chosen || []).join(' ');
      return (d.correct ? '✅ ' : '❌ ') + what;
    }
    case 'foodgame_end':
      return (d.passed ? '✅ 通過' : '❌ 失敗') + '（完成 ' + d.completed + ' 單、剩 ' + d.timeLeft + ' 秒）';
    case 'fragment_collected':
      return '碎片 ' + d.letter;
    case 'ending_choice':
      return d.choice === 'keep' ? '保留所有記憶' : '將記憶封回';
    case 'room_rejected':
      return '輸入了 ' + d.roomCode;
    default:
      return '';
  }
}

// 每個小隊各自一張分頁的表頭（分頁名稱就是隊名，所以列裡不再重複放隊名）
const EVENT_HEADERS = ['時間', '事件', '關卡', '內容', '房間碼', 'sessionId', '原始JSON'];

// 這筆事件該記到哪張分頁：已登入的小隊 → 隊名；其餘（開頁面、登入失敗等
// 還沒有隊伍身分的）→「未分類」。用隊名而非房間碼，避免有人亂打一堆錯碼就
// 生出一堆垃圾分頁。
function sheetNameFor_(d) {
  return d.team ? String(d.team) : '未分類';
}

// Google Sheet 分頁名稱不可含 : \ / ? * [ ]，長度上限 100。
function safeSheetName_(name) {
  return name.replace(/[:\\\/?*\[\]]/g, ' ').slice(0, 90).trim() || '未分類';
}

function appendEvent_(d) {
  const sh = sheet_(safeSheetName_(sheetNameFor_(d)), EVENT_HEADERS);
  sh.appendRow([
    new Date(d.ts || Date.now()),
    EVENT_LABELS[d.event] || d.event,
    STAGE_LABELS[d.stageKey] || d.stageKey || '',
    summarize_(d),
    d.roomCode || '',
    d.sessionId || '',
    JSON.stringify(d),
  ]);
}

const BOARD_HEADERS = [
  '小隊', '房間碼', '最後活動時間', '最新動態',
  '目前關卡', '已取得碎片', '解謎嘗試', '答錯總計',
  '圖書館錯誤', '舊城區錯誤', '傳送港錯誤', '地下市集錯誤', '垃圾山錯誤', '市中心錯誤', '終章錯誤',
  '外送遊戲', '拼圖', '結局',
];
const COL = {}; // 名稱 → 欄位索引(1-based)
BOARD_HEADERS.forEach((h, i) => { COL[h] = i + 1; });

// 數字欄（計數用）預設 0，其餘欄預設空字串
const NUMERIC_COLS = new Set(['解謎嘗試', '答錯總計', ...Object.values(STAGE_ERROR_COL)]);

function updateBoard_(d) {
  const sh = sheet_(SHEET_BOARD, BOARD_HEADERS);
  // 找到（或建立）這一隊的列
  const codes = sh.getRange(2, COL['房間碼'], Math.max(sh.getLastRow() - 1, 1), 1).getValues().flat();
  let row = codes.indexOf(d.roomCode) + 2;
  if (row < 2) {
    // 依表頭長度建一列空白資料，計數欄補 0（避免欄位數對不上）
    const blank = BOARD_HEADERS.map((h) => (NUMERIC_COLS.has(h) ? 0 : ''));
    blank[COL['小隊'] - 1] = d.team || '';
    blank[COL['房間碼'] - 1] = d.roomCode;
    sh.appendRow(blank);
    row = sh.getLastRow();
  }
  const get = (col) => sh.getRange(row, COL[col]).getValue();
  const set = (col, v) => sh.getRange(row, COL[col]).setValue(v);

  set('最後活動時間', new Date(d.ts || Date.now()));
  set('最新動態', (EVENT_LABELS[d.event] || d.event) + (summarize_(d) ? '：' + summarize_(d) : ''));
  if (d.team) set('小隊', d.team);

  switch (d.event) {
    case 'stage_start':
      set('目前關卡', STAGE_LABELS[d.stageKey] || d.stageKey);
      break;
    case 'puzzle_attempt':
    case 'colorpick_attempt':
      set('解謎嘗試', (Number(get('解謎嘗試')) || 0) + 1);
      if (!d.correct) {
        set('答錯總計', (Number(get('答錯總計')) || 0) + 1);
        const ecol = STAGE_ERROR_COL[d.stageKey]; // 依關卡累加到對應欄
        if (ecol) set(ecol, (Number(get(ecol)) || 0) + 1);
      }
      break;
    case 'fragment_collected': {
      const cur = String(get('已取得碎片') || '');
      const list = cur ? cur.split(' ') : [];
      if (list.indexOf(d.letter) < 0) list.push(d.letter);
      set('已取得碎片', list.join(' '));
      break;
    }
    case 'foodgame_end':
      if (d.passed || get('外送遊戲') !== '✅') set('外送遊戲', d.passed ? '✅' : '❌');
      break;
    case 'assembly_complete':
      set('拼圖', '✅');
      break;
    case 'ending_choice':
      set('結局', d.choice === 'keep' ? '保留記憶' : '封回記憶');
      break;
  }
}
