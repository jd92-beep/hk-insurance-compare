# 全站審核與分拆 PR 執行計劃

**Goal:** 提升香港保險比較站的視覺質素、實際比較能力與逐條來源可信度，不直接部署 master。

**Baseline:** master `1977118630f32391b3272575544b54dbc02dc66d`，v1.6.1。

**Architecture:** 保留靜態 React SPA 與紙白／玉綠設計；來源核實與視覺動效分離。先記錄現有測試基線，再以可獨立審核的 PR 推進；相依改動明確列出合併順序。

## Scope and review gates

1. CI 與可重現證據：記錄 commit、tracked files、完整 lint JSON、build 與 filter regression 結果。診斷 artifact 不包含 PDF 二進位、node_modules、Git credentials 或環境變數。後續按實測基線收緊 lint gate，而非相信手寫的「17 errors」。
2. 首頁與動效：審核所有 RAF、GSAP、Lenis、pointer listeners、視差與粒子。保留最新移除大型 WebGL 圈圈的決定，改良精細粒子材質、景深、互動與可降級動效。
3. 保險比較：逐類別追蹤 tags、persona、score、保費單位、表格欄位及未符合條件。不得把關鍵字命中率當作核保結果、理賠承諾或保險建議。
4. PDF 證據：追蹤產品欄位→citation→document→mirror→page→quote。缺失／未核實／失效須分開，不能以相似字串假造已核實 highlight。
5. 資料時效：盤點所有產品與文件，核對官方來源與版本／生效日期；HTTP 200 或近期 checkedAt 不等同條款已驗證為最新。只以已核實官方證據更改數字。
6. 其餘頁面與可靠性：路由、導航、載入／失敗／空結果、分享、手機、鍵盤、reduced motion、無障礙、SEO、效能與部署。

## Verification

- 修改前先記錄現有失敗；新邏輯先寫回歸測試，確認失敗再修正。
- 既有 build、filter regression、deep boundary checks 必須重跑。
- PR 逐一寫明 root cause、實作、測試命令／結果、資料限制、回退方法及相依關係。
- 未經實際執行的瀏覽器測試或官方條款核實，一律標示未完成；不以測試數量代替內容準確性。
- 不合併、不更改 Cloudflare 正式部署設定、不自動覆寫正式保險資料。
