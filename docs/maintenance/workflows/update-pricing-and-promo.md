<!-- review-2026-09-18 -->
> **2026-09-18 documentation review:** Current scope and remaining limitations: [delivery review](../../review/2026-09-18-release.md). No blanket policy-currentness certificate.
<!-- /review-2026-09-18 -->

# 更新保費與有效優惠

整理日期：2026-09-18。返回 [維護入口](../README.md)。

premium_range 是資料快照，不是可付款價格；沒有同一報價基礎就不能劃原價、算最平、年化或作保費排序。promo 需 valid_from、valid_until、reviewed_at、source_url（HTTPS）、conditions；日期要實際有效，覆核不可來自未來。用共享 promoDisplay 及 usePolicyCalendar，不在元件自行判斷。超過31日未覆核、過期、未有日期、歷史產品均隱藏優惠。香港時間到期日結束即失效，測試到期前後及已打開頁面午夜更新。不得用其他渠道優惠充當所有用戶適用，也不可把同品牌折扣套到別的計劃。
## 共通驗證

Node 22、鎖定依賴：`npm ci`。執行 `npm test`、`npm run lint -- --max-warnings=0`、`npm run build`、`npm run test:filters`。內容變更另跑對應 evidence/citation/maintenance 檢查。
PDF 審核用 `python scripts/audit_evidence.py --as-of YYYY-MM-DD`，日期必須來自實際審核，不可冒充全面條款更新。同步更新 BUILD_NUMBER／BUILD_DATE，保留個別測試結果和未能檢查項目。只提 PR，不自動合併。
