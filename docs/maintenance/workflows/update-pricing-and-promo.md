# 🏷️ 任務操作卡：季度 / 月度更新保費與優惠代碼 SOP

> **檔案位置**：`docs/maintenance/workflows/update-pricing-and-promo.md`  
> **目標**：快速安全更新 `insurance-data.json` 內各產品最新保費、折扣率及 Promo Code。  
> **維護週期**：每月 1 號及各季度首日（或保司官宣突發推廣活動時）。

---

## ⚡ 步驟 1：鎖定更新目標與取得官方證據

1. 查閱保司官網或官方宣傳小冊子，確認優惠活動有效日期及條件。
2. 記錄三大核心數值：
   - **優惠代碼 (Promo Code)**：如 `MONEYSMART20`、`AUTO15`（若無需 Code 則留空）。
   - **折扣力度 (Discount)**：如 `20% OFF`、`85 折`。
   - **保費變動**：原價 `original_price` 與 折扣價 `discounted_price`（必須符合算術邏輯）。

---

## 🛠️ 步驟 2：修改 `public/data/insurance-data.json`

在目標產品物件中更新以下欄位：

```json
{
  "id": "pet-onedegree",
  "original_price": 1560,
  "discounted_price": 1248,
  "promo": {
    "tag": "首年保費 8 折",
    "code": "PROMO2026",
    "discount": "20% OFF",
    "note": "輸入優惠碼享首年保費 8 折；送免費寵物身體檢查",
    "original_price": 1560,
    "discounted_price": 1248,
    "buy_url": "https://www.onedegree.hk/zh-hk/pet-insurance"
  }
}
```

*若有批量更新需求，可參考 `scripts/enrich_promo_codes.py`。*

---

## 🔍 步驟 3：運行全量校驗與測試

在終端機運行以下指令，確保無語法損壞或邏輯回歸：

```bash
# 1. 驗證篩選器及 JSON 數據結構完整性
npm run test:filters

# 2. 運行全套單元測試
npm test

# 3. 確保 TypeScript 構建無損
npm run build
```

---

## 📌 步驟 4：版本登記與提交

依據項目規範，修改 `src/lib/version.ts` 內之構建編號：

```typescript
export const BUILD_NUMBER = "20260911.02"; // 遞增次數
export const BUILD_DATE = "2026-09-11";
```

---

## 🚫 防錯紅線與避坑指南

1. ❌ **嚴禁憑空發明 Promo Code**：必須經官網實測可用或官方授權公佈。
2. ❌ **折扣金額算術衝突**：若寫了 8 折，原價 1000 蚊但折扣價寫 700 蚊會引發投訴！
3. ❌ **過期 Promo 必須清除**：若優惠到期，應刪除 `promo.code`，僅保留基本常設保費。
