<!-- review-2026-09-18 -->
> **2026-09-18 documentation review:** Current scope and remaining limitations: [delivery review](../../review/2026-09-18-release.md). No blanket policy-currentness certificate.
<!-- /review-2026-09-18 -->

# 新增資料記錄

整理日期：2026-09-18。返回 [維護入口](../README.md)。

先從官方資料確認產品身份、保險公司、類別、銷售渠道和計劃級別。新增不代表已全面核實。逐項記錄來源、版本、頁碼、適用條件與金額單位；未有資料就標示未知，唔填零值、假頁碼或其他產品引文。不要以第一份 PDF 代替每項來源。核對產品 ID、索引、搜尋、比較和文件中心。
## 共通驗證

Node 22、鎖定依賴：`npm ci`。執行 `npm test`、`npm run lint -- --max-warnings=0`、`npm run build`、`npm run test:filters`。內容變更另跑對應 evidence/citation/maintenance 檢查。
PDF 審核用 `python scripts/audit_evidence.py --as-of YYYY-MM-DD`，日期必須來自實際審核，不可冒充全面條款更新。同步更新 BUILD_NUMBER／BUILD_DATE，保留個別測試結果和未能檢查項目。只提 PR，不自動合併。
