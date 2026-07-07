# MNEMO 重寫計畫

> 目的：把單檔 DC artifact（`MNEMO.dc.html` + 產生的 `support.js` runtime）重寫成標準的
> Vite + React 專案，讓程式碼可讀、可維護，並為「公開部署 + 記錄用戶互動」預留掛點。
> 原則：**行為 1:1 照搬，不改玩法、不改視覺**；先搬完、驗收通過，才考慮改進。

---

## 1. 技術選型

| 項目 | 選擇 | 理由 |
|---|---|---|
| 建置工具 | Vite + React 18 | 標準生態、HMR 快、Vercel/CF Pages 零設定 |
| 語言 | 純 JSX（JavaScript） | 短期活動專案，降低門檻；`STAGES` 等資料形狀用 JSDoc typedef 註記即可。若實作者偏好 TS 也可，非必要 |
| 狀態管理 | React 內建（useState / useReducer + 一個 Context） | 現有邏輯就是一台狀態機，不需要外部狀態庫 |
| 樣式 | 沿用現有 inline style 直翻成 JSX style object；`@keyframes` 全部集中到 `src/styles/global.css` | 最快達成視覺 1:1；重複的面板樣式靠「抽成元件」解決，不靠 CSS 重構 |
| 部署 | Vercel（連現有 GitHub repo `26MedCampScavengerHunt`） | 靜態頁 + `api/` serverless function 同一個專案搞定 |
| 互動記錄 | `POST /api/track`（fire-and-forget） | 後端儲存方案見 §6，尚待決定 |

`support.js` 與 DC 模板語法（`sc-if` / `sc-for` / `{{ }}`）在重寫後**完全移除**，改用真正的 React。

---

## 2. 目錄結構

```
/
├── index.html                  # Vite 入口（載入字型 preconnect、#root）
├── package.json
├── vite.config.js
├── api/
│   └── track.js                # serverless：接收互動事件並寫入儲存
├── legacy/
│   └── MNEMO.dc.html           # 舊版原檔，驗收通過前保留對照
├── src/
│   ├── main.jsx
│   ├── App.jsx                 # screen 路由（entry/intro/map/stage/...）+ 全域進度
│   ├── data/                   # ★ 純內容，零邏輯 —— 改劇情只動這裡
│   │   ├── intro.js            #   INTRO_PAGES、CLS_STYLE
│   │   ├── stages.js           #   STAGES（R/Y/A/M/END 全部劇情、謎題、答案）
│   │   ├── stageMeta.js        #   STAGE_META（地圖節點座標）、NODE_ICON_SHAPES
│   │   ├── typeChart.js        #   TYPE_INFO / TYPE_STRONG_AGAINST / TYPE_ICONS
│   │   ├── foodOrders.js       #   FOOD_ORDER_POOL
│   │   └── fragments.js        #   FRAGMENT_ORDER、FRAGMENT_COLORS、CIPHER 表
│   ├── components/
│   │   ├── screens/            # 一個 screen 一個檔案
│   │   │   ├── EntryScreen.jsx     # 房間碼鍵盤
│   │   │   ├── IntroScreen.jsx     # 開場劇情（打字機分頁）
│   │   │   ├── MapScreen.jsx       # 訊號地圖 + 節點 + 進度條 + toast/banner
│   │   │   ├── StageScreen.jsx     # 依 beat.type 分派給 beats/*
│   │   │   ├── BackpackScreen.jsx  # 碎片背包
│   │   │   ├── AssemblyScreen.jsx  # 拼圖拖拽 + 驗證
│   │   │   └── EndingScreens.jsx   # 結局選擇 + ending1 / ending2
│   │   ├── beats/              # 關卡內的節拍類型
│   │   │   ├── StoryBeat.jsx       # 一般劇情（含 duelRules、terminalStory 兩種變體版面）
│   │   │   ├── PuzzleBeat.jsx      # 解謎（含 cipher 密碼表、hi-tech 輸入、字母鍵盤變體）
│   │   │   ├── FoodGameBeat.jsx    # 外送小遊戲（rules/playing/failed/passed 四相）
│   │   │   └── FragmentBeat.jsx    # 取得碎片動畫
│   │   ├── ui/                 # ★ 消除模板重複的關鍵
│   │   │   ├── TerminalPanel.jsx   # CRT 終端機面板框（掃描線/圓點/標題列/accent 色）——現在被複製 4+ 次
│   │   │   ├── SegText.jsx         # segs 富文字渲染（cls 樣式 + 打字機字數裁切）
│   │   │   ├── NavButtons.jsx      # 「◂ 上一頁 / 下一頁」按鈕列——現在被複製 4+ 次
│   │   │   └── PieceSvg.jsx        # 拼圖碎片 SVG（makePieceNode 改寫）
│   │   └── CityBackdrop.jsx    # 大樓剪影/粒子/雨/掃描/vignette/HUD 角框（memo 一次生成）
│   ├── hooks/
│   │   ├── useTypewriter.js    # 打字機：傳入全文 → {count, done, skip()}；卸載自動清 timer
│   │   ├── useScale.js         # 700×800 畫布縮放（resize listener）
│   │   ├── useProgress.js      # localStorage 讀/存進度（保持 key: mnemo_progress）
│   │   └── useFoodGame.js      # 外送遊戲整台狀態機（總倒數/訂單槽/送單動畫序列）
│   ├── lib/
│   │   ├── track.js            # sessionId 產生 + track(event, payload)
│   │   └── pieces.js           # 拼圖幾何（buildPiecePath / PIECE_TEARS）
│   └── styles/
│       └── global.css          # 全部 @keyframes + reset + selection 色
```

**核心分層想法：`data/` 是內容、`hooks/` 是機制、`components/` 是畫面。**
活動前最常見的修改（改謎題答案、改劇情文字、改地點）全部只碰 `data/`，不用讀懂任何邏輯。

---

## 3. 現有 state → 新家對照表

| 現有 Component state | 搬去哪 | 備註 |
|---|---|---|
| `screen`, `scale` | `App`（+ `useScale`） | screen 就是最上層 switch |
| `room` | `EntryScreen` 區域 state | 確認後才往上回報 roomCode |
| `unlockedIndex`, `collectedFragments`, `creatorMode` | `App` 的進度 reducer + `useProgress` 持久化 | 跨畫面共用的只有這幾個 |
| `introPageIndex`, `charCount`, `typingDone` | `IntroScreen` + `useTypewriter` | 打字機欄位全部消失，變 hook 內部 state |
| `toastMsg`, `unlockBanner` | `MapScreen` 區域 state | |
| `currentStage`, `beatIndex` | `StageScreen` | |
| `beatCharCount/beatTypingDone`、`puzzleDescCharCount/...`、`foodRulesCharCount/...` | 各 beat 元件自己的 `useTypewriter` | 三組重複欄位 → 同一個 hook 的三個實例 |
| `puzzleInput`, `puzzleError`, `puzzleStatus` | `PuzzleBeat` | |
| `assembly*`（7 個欄位） | `AssemblyScreen` | 拖拽偏移可考慮 ref 減少重繪，行為不變即可 |
| `food*`（7 個欄位） | `useFoodGame` | |

**Timer 管理**：現在靠 `componentWillUnmount` 手動清 8 支 timer（`_typeTimer`、`_foodTimer`、`_successTimers`…），
重寫後每支 timer 都住在自己 hook/元件的 `useEffect` cleanup 裡，天然不會漏清——這是可靠性上最大的隱性收益。

---

## 4. 遷移步驟（建議實作順序，每步可獨立驗收）

1. **Phase 0 — 腳手架**：建 Vite 專案、搬 `@keyframes` 進 `global.css`、`index.html` 放字型 preconnect、
   舊檔移入 `legacy/`。驗收：`npm run dev` 出現空白但底色/字型正確的 700×800 畫布 + `CityBackdrop`。
2. **Phase 1 — 資料搬家**：`STAGES`、`INTRO_PAGES` 等常數**逐字複製**進 `src/data/*`，不改任何內容。
   驗收：`node` 能 import 且結構完整（beat 數量與舊檔一致）。
3. **Phase 2 — 共用件**：`useTypewriter`、`SegText`、`TerminalPanel`、`NavButtons`、`useScale`。
   驗收：用一頁假資料展示打字機 + 面板，視覺對照舊版 intro 規則頁。
4. **Phase 3 — 畫面逐一移植**（每完成一個就跟舊版並排對照）：
   Entry → Intro → Map → StoryBeat → PuzzleBeat → Backpack/FragmentBeat → FoodGame → Assembly → Endings。
5. **Phase 4 — 持久化 + 追蹤**：`useProgress`（沿用 `mnemo_progress` key 與欄位名，玩家舊進度不失效）、
   `lib/track.js` 埋點（見 §5）、`api/track.js`。
6. **Phase 5 — 驗收**：用 creator mode（房間碼 `000000` 全解鎖）把 8 個節點、每種 beat、
   兩個結局、重置流程全部走一遍；行動裝置檢查縮放與拖拽。通過後刪 `legacy/`。

Phase 3 內部順序刻意由簡到難：foodgame（多相位 + interval）與 assembly（pointer 拖拽）最複雜，放最後。

---

## 5. 互動記錄設計

`lib/track.js`：首次載入產生 `sessionId`（隨機字串，存 localStorage）；
`track(event, payload)` 用 `fetch(..., { keepalive: true })` 送出，**失敗靜默**，絕不阻擋遊戲。

建議事件（房間碼可當隊伍代號用——活動時發給每隊不同房間碼，資料就自帶分隊）：

| event | 觸發點 | payload |
|---|---|---|
| `session_start` | 頁面載入 | — |
| `room_confirmed` | 輸入房間碼進入 | `roomCode` |
| `stage_start` | 點開關卡 | `stageKey` |
| `puzzle_attempt` | 送出謎題答案 | `stageKey`, `beatIndex`, `input`, `correct` |
| `fragment_collected` | 取得碎片 | `letter` |
| `foodgame_end` | 小遊戲結束 | `passed`, `completed`, `timeLeft` |
| `assembly_complete` | 拼圖成功 | — |
| `ending_choice` | 選擇結局 | `choice` |
| `reset` | 重置示範 | — |

所有事件共同欄位：`sessionId`、`roomCode`、`ts`。
`puzzle_attempt` 記錄錯誤輸入尤其有價值——活動後能看出哪一題卡最多人。

---

## 6. 待決定事項（不阻擋動工，可先用預設）

1. **追蹤資料存哪**（預設：Vercel 專案 + 一個外部儲存）
   - 選項 A：Google Sheets（透過 Apps Script webhook）——活動後直接開表看，最省事
   - 選項 B：Supabase / Vercel KV——結構化查詢方便，但多一個服務要管
2. **謎題答案是否改為後端驗證**：目前答案明文寫在前端，看原始碼可作弊。
   營隊場合風險低，預設**不做**；若在意，Phase 4 把 `answer` 從 `data/stages.js` 移到 `api/check.js`。
3. **JS 或 TS**：預設純 JS + JSDoc；實作時可改 TS，結構不變。

---

## 7. 風險與注意事項

- **拖拽移植**是最容易出行為差異的地方：舊版用 window 級 pointer 事件 + `scale` 換算座標，
  React 版要用 pointer capture 或同樣掛 window listener，並保留除以 `scale` 的換算。
- **打字機跳字/skip 行為**要逐案對照：tap 跳完、上一頁直接顯示全文、頁面切換清 timer。
- `localStorage` 結構**不要改**（key 與欄位名照舊），部署替換時玩家進度無縫銜接。
- 舊版 `sc-for` 對 style 字串的處理是「整串 CSS 字串」，React 需轉 style object——
  `makeParticles` 等產生器函式改為直接回傳 object。
- 視覺驗收以並排截圖為準，`legacy/MNEMO.dc.html` 在本機仍可直接開啟對照。
