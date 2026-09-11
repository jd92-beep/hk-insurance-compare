# 🗄️ 任務操作卡：產品停售或歸檔 SOP（以 AIG 為例）

> 🧭 [返回維護總手冊](../README.md) ｜ 🏛️ [核心架構與規則](../core-rules-and-architecture.md)  
> **檔案位置**：`docs/maintenance/workflows/deprecate-product.md`  
> **目標**：規範化處理停售、下架或轉移銷售渠道的保險產品，保留歷史條款與外鏈完整性。  
> **典型案例**：`motor-aig`（AIG 汽車保險暫停網上直購，轉為線下或代理管道）。

---

## 🚫 鐵律核心：絕對嚴禁直接刪除產品資料！

> **為什麼不能由 JSON 刪除記錄？**  
> 1. 會導致指向 `/product/[id]` 的外部分享連結及用戶書籤變成 404 死鏈。  
> 2. 既有保單持有人仍需查詢條款小冊子與理賠細節。  
> 3. 會破壞全站過往審計報告（Audit Ledger）的歷史指紋驗證。

---

## 🛠️ 步驟 1：修改 `insurance-data.json` 狀態旗標

打開 [`public/data/insurance-data.json`](../../../public/data/insurance-data.json)，定位至目標產品（例：`motor-aig`），調整以下關鍵欄位：

```json
{
  "id": "motor-aig",
  "premium_available": false,
  "premium_range": "需報價 / 已停售",
  "premium_notes": "官方網站目前暫停網上即時報價，新投保須致電客戶服務熱線 3666 7033 專人報價；既有保單權益與續保不受影響。詳細條款請參閱備存之官方產品小冊子。",
  "promo": {
    "tag": "停售通知",
    "note": "暫停線上即時投保，請致電專線查詢",
    "buy_url": "https://www.aig.com.hk/zh/personal/car-insurance-quote"
  }
}
```

---

## 📂 步驟 2：封存並保留歷史證據鏈

- **保留 PDF 鏡像**：不要刪除 `public/docs/brochures/` 中的對應 PDF 檔案。
- **保留 Citation 引用**：保留 `coverage`、`key_terms` 及 `citations` 的完整內容，供歷史查閱。

---

## 🧪 步驟 3：運行回歸與篩選邊界測試

確認前端篩選器能正確過濾或將停售產品降權顯示：

```bash
# 1. 運行篩選矩陣測試，確保 unavailable 狀態處理正常
npm run test:filters

# 2. 運行全量測試
npm test

# 3. 確保 TypeScript 編譯無誤
npm run build
```

---

## 📌 步驟 4：記錄變更與更新版本

在 [`src/lib/version.ts`](../../../src/lib/version.ts) 內遞增 `BUILD_NUMBER`（例：`20260911.04`），並在 PR 中清楚記錄產品下架之官方公告來源。

---

## 🔗 相關手冊導航
- 🏷️ [更新保費與優惠代碼 SOP](./update-pricing-and-promo.md)
- 📄 [PDF 說明書更新與引用校對 SOP](./update-pdf-terms-and-quotes.md)
- ➕ [新增保險產品全流程 SOP](./add-new-product.md)
- 🧭 [返回維護總手冊](../README.md)
