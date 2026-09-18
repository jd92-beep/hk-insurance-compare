<!-- review-2026-09-18 -->
> **2026-09-18 documentation review:** Current scope and remaining limitations: [delivery review](../../review/2026-09-18-release.md). No blanket policy-currentness certificate.
<!-- /review-2026-09-18 -->

# 停止銷售或隔離問題記錄

整理日期：2026-09-18。返回 [維護入口](../README.md)。

必須區分指定渠道停止銷售、續保中止、整個產品停售和本站資料未能核實。保留正式公告、適用日期及範圍。record_status archived 是本站歷史／待核記錄，不可推斷所有同公司產品停售。停用新投保連結及 promo fallback；保留歷史條款給已投保人士參考。主清單預設隱藏歷史記錄，但可主動查看。
## 共通驗證

Node 22、鎖定依賴：`npm ci`。執行 `npm test`、`npm run lint -- --max-warnings=0`、`npm run build`、`npm run test:filters`。內容變更另跑對應 evidence/citation/maintenance 檢查。
PDF 審核用 `python scripts/audit_evidence.py --as-of YYYY-MM-DD`，日期必須來自實際審核，不可冒充全面條款更新。同步更新 BUILD_NUMBER／BUILD_DATE，保留個別測試結果和未能檢查項目。只提 PR，不自動合併。
