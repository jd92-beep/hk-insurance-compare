<!-- review-2026-09-18 -->
> **2026-09-18 documentation review:** Current scope and remaining limitations: [delivery review](../../review/2026-09-18-release.md). No blanket policy-currentness certificate.
<!-- /review-2026-09-18 -->

# 更新 PDF 及引文

整理日期：2026-09-18。返回 [維護入口](../README.md)。

核對官方 URL、產品／級別、版本日期及原文，不只看檔名。比對舊新 PDF、保留差異與來源紀錄，再更新鏡像、manifest、頁碼及引文。文字命中只證明字句存在，不能證明該條款支持指定保障。重新生成 evidence ledger 並實測 PDF 跳頁、搜尋、高亮和未知狀態；空引文不能高亮成已核實。
## 共通驗證

Node 22、鎖定依賴：`npm ci`。執行 `npm test`、`npm run lint -- --max-warnings=0`、`npm run build`、`npm run test:filters`。內容變更另跑對應 evidence/citation/maintenance 檢查。
PDF 審核用 `python scripts/audit_evidence.py --as-of YYYY-MM-DD`，日期必須來自實際審核，不可冒充全面條款更新。同步更新 BUILD_NUMBER／BUILD_DATE，保留個別測試結果和未能檢查項目。只提 PR，不自動合併。
