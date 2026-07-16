# 原始背景程式碼備份 (background-original)

這裡保存的是**加入各關卡專屬背景動畫特效之前**的原始背景程式碼，方便日後對照或還原。

- 取自 commit `3ebfeff`（`git show HEAD:...`）。
- `CityBackdrop.jsx` — 通用天際線背景的組合元件（原始版，尚未掛上 `PortalFlash`／`JunkyardScene` 等 per-variant 特效）。
- `backdrop.js` — 背景生成器與 `STAGE_THEMES`（各關卡的天際線形狀／配色／天氣），此檔在後續改動中未被更動，附上作為完整參照。

## 之後新增了什麼（不在此備份內）

- `src/components/PortalFlash.jsx` — 傳送港 (A) 右側邊緣隨機閃現的傳送門特效。
- `src/components/JunkyardScene.jsx` — 垃圾山 (G) 的高聳廢料山剪影 + 定期崩落的幾何碎塊。
- `src/components/CityBackdrop.jsx` — 現行版本多了 `variant === 'A'`／`variant === 'G'` 的掛載點。
- `src/styles/global.css` — 新增 `portalSeamOpen`／`portalBloom`／`portalStreakPull`／`junkTumble` 等 keyframes。

若要還原成純通用背景，把這裡的 `CityBackdrop.jsx` 覆蓋回 `src/components/`，並移除上述新增元件的 import／掛載即可。
