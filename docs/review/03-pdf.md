# 可追溯 PDF 中心與逐字定位

新增 /documents 目錄、產品搜尋、保障／citation／source 分類與 PDF.js 閱讀器。單頁按需繪製，支援翻頁、縮放、字層選取、跨文字段落原文高亮；worker、CMaps、fonts、WASM 同源供應。

只有足夠長度且唯一吻合的原文才標示；找不到、掃描頁、重複原文、越界頁码與已改變的引用指紋都有明確狀態。指紋用於偵測變更，不是加密簽章。文字高亮不等於保障內容正確或最新。相同 quote 對應多項不同保障時顯示待覆核警示。

CoverageSection 修正空 claim_summary 會匹配所有項目的問題。引用頁、產品保障及 sources 都可去 PDF 中心，外部網址不會假裝可本地標示。

本地 npm test 8/8、lint 零錯誤／警告與 production build 通過。本地 Chromium 被環境政策封鎖（ERR_BLOCKED_BY_ADMINISTRATOR），不繞過；使用 GitHub-hosted browser workflow 驗證，結果記錄於 PR。無 OCR 或模糊摘錄配對，掃描、語言／版本不符留待人工覆核。任何保障數字未因本 PR 被擅改。
