# 02 — Current Problems / Known Issues

Updated as of **2026-09-04 (v1.2.1)**.

## ✅ 已徹底修復的問題 (Resolved Issues)
1. ~~**首頁滾動過人壽保險後圖案遮擋 Bug**~~ — **已徹底修復**。`CategoryGrid.tsx` 加上靜態 11 類別 fallback 佔位防塌陷，外層容器加上 `relative z-10 bg-paper`，數據載入後調用 `ScrollTrigger.refresh()`。
2. ~~**非醫療保險出現洗腎/癌症等無關標籤**~~ — **已徹底修復**。重構為 11 大類別專屬的 `CATEGORY_FEATURE_TAGS`（147 個標籤），旅遊保險僅顯示旅遊相關標籤。
3. ~~**多選 Filter 導致 0 結果挫敗感**~~ — **已徹底修復**。實裝 Smart Match 評分引擎與友好 Fallback 機制，命中最多條件者置頂排序。
4. ~~**舊年份 (<= 2022) 過期 PDF 鏈接**~~ — **已徹底清洗**。全面升級為 2024–2026 年最新官方文件。
5. ~~**全數賠償定義模糊**~~ — **已標明**。在圖表與 Tooltip 清楚解釋全數賠償之官方定義及年度保障總額限制。

## ⚠️ 現存已知細微差距與未來優化空間 (Open Gaps)
1. **Flexi Plan 細節仍主要為小冊子與認可名單**：各靈活計劃的 500+ 個級別目前已具備官方 PlanDoc 與保費表連結，但尚未對全部 500+ 個級別進行自動化表格化結構抽取（目前已針對主要熱門級別建立詳細數值）。
2. **ESLint 22 Baseline 歷史錯誤**：維持在 22 個歷史舊錯誤，新撰寫的代碼均 0 錯誤。未來可排期進行純語法清理。
3. **單一 JS Bundle 體積**：目前未進行路由級別 `React.lazy` 分包，初始 JS 約 1MB (gzip ~310KB)，未來可引入 Code Splitting 優化。
