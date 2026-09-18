<!-- review-2026-09-18 -->
> **2026-09-18 documentation review:** Current scope and remaining limitations: [delivery review](docs/review/2026-09-18-release.md). No blanket policy-currentness certificate.
<!-- /review-2026-09-18 -->

# 保險資料比較站 · HK InsureCompare

繁體中文（香港）的保險資料比較 SPA。先睇保障同限制，再向保險公司核對條款及個別報價。

## 資料範圍與限制

目前 JSON 有 158 個資料記錄及 11 個類別；數量包括歷史／待核對記錄，唔係全市場或仍在售產品的保證。
資料快照日期仍為 2026-09-02。2026-09-18 的全庫審核核對來源連結和機械引文一致性，**並未逐份核實所有現行保障**。
HTTP 成功、PDF 存在、雜湊吻合或文字命中，都唔等於條款解讀正確。

## 使用方式

類別頁預設卡片：搜尋公司／產品名稱，按需要展開條件篩選，加入最多三份資料作比較。
桌面用有標題的比較表；手機按同一問題逐份對照，毋須在 A/B/C 分頁之間記住金額。
不保事項、計劃級別和自負額先於保費；保留逐項來源、PDF 原文、儲存／分享比較及 Markdown 匯出。
進階數值對照需主動展開，只比較可解析且計算單位一致的摘要，唔排名或評定最適合。
沒有即時報價、沒有個人適合度百分比、沒有全市場最平承諾。已過期或未有有效日期的優惠唔會當作現行優惠。

## 技術與開發

React、TypeScript、Vite、Tailwind、Radix；實際版本以 package-lock.json 為準。Node 22：

```sh
npm ci
npm run dev
npm test
npm run lint -- --max-warnings=0
npm run build
npm run test:filters
npm run check:maintenance
python -m unittest discover -s tests -p 'test_evidence_audit.py'
```

最後兩類檢查要分清「資料內容待修」與程式執行錯誤；唔好為通過檢查而填寫假金額或引文。
3D 效果使用有界傾斜、靜態立體陰影及預先投影的 Canvas 寶石圖集，並非 WebGL 物理光線追蹤。
觸控、鍵盤焦點及減少動態效果偏好會停止卡片傾斜；背景分頁與畫面外寶石暫停重繪。

## 交付與維護

master 連接部署；未經額外批准，不合併、不開 auto-merge、不更改正式部署。現有服務可能自動產生 review branch 預覽。

- [本輪實作／測試／未完成項目](docs/review/2026-09-18-release.md)
- [158 個記錄的來源覆核](docs/review/2026-09-18-evidence.md)
- [維護手冊](docs/maintenance/README.md)
- [Agent 工作契約](AGENTS.md)

本網站資料僅供參考，唔構成個人投保建議。投保前請核對現行正式條款及個別承保結果。
