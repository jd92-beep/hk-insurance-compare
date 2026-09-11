# ➕ 任務操作卡：新增保險產品全流程 SOP

> 🧭 [返回維護總手冊](../README.md) ｜ 🏛️ [核心架構與規則](../core-rules-and-architecture.md)  
> **檔案位置**：`docs/maintenance/workflows/add-new-product.md`  
> **目標**：從零將一款全新保險產品納入比價庫，確保身份規範、證據確鑿、測試全過。  
> **適用場景**：保險公司推出全新險種，或本站擴展收錄範圍。

---

## 🆔 步驟 1：擬定標準規範 ID 與保司標識

1. **ID 命名公式**：`[category]-[canonical-insurer-slug]`（例：`pet-chubb`、`motor-allianz`）。
2. **保司標識核實**：
   - 參照 [`scripts/product_identity.mjs`](../../../scripts/product_identity.mjs)，確認保司英文名稱 `insurer` 及中文名稱 `insurer_zh` 為市場公認官方名稱（如 `AXA` / `安盛`、`FWD` / `富衛保險`）。
   - 切勿創造不存在的縮寫或拼音 ID。

---

## 📂 步驟 2：儲存官方 PDF 鏡像並生成指紋

1. 將官方小冊子或保單條款 PDF 下載至 `public/docs/brochures/`（以英文命名，例：`chubb-pet-care-2026.pdf`）。
2. 更新指紋清單：
   ```bash
   node scripts/build_pdf_manifest.mjs
   ```

---

## 📝 步驟 3：填寫 `public/data/insurance-data.json`

在 `products` 陣列中追加完整物件。

### 📋 1 秒複製粘貼：標準純淨 JSON 模版 (Pure JSON Ready-to-Use)
> 💡 點擊右上角直接複製，無任何註解，可直接貼入 `public/data/insurance-data.json`：

```json
{
  "id": "category-insurer",
  "category": "travel",
  "insurer": "INSURER_CODE",
  "insurer_zh": "保險公司中文名",
  "product_name": "Product English Name",
  "product_name_zh": "產品中文全名",
  "plan_tiers": ["標準計劃", "尊貴計劃"],
  "coverage": [
    {
      "item": "核心保障項目一",
      "limit": "最高 HK$1,000,000",
      "source_url": "/docs/brochures/filename.pdf#page=1",
      "document_name": "官方小冊子或保單條款名稱",
      "page": 1,
      "quote": "從 PDF 該頁一字不差逐字摘錄之原文描述"
    },
    {
      "item": "核心保障項目二",
      "limit": "最高 HK$500,000",
      "source_url": "/docs/brochures/filename.pdf#page=2",
      "document_name": "官方小冊子或保單條款名稱",
      "page": 2,
      "quote": "從 PDF 該頁一字不差逐字摘錄之原文描述"
    }
  ],
  "premium_range": "HK$200 起 / 年",
  "premium_available": true,
  "premium_notes": "保費試算條件說明或起步價格標註",
  "key_terms": [
    "關鍵承保條件與年齡要求一",
    "關鍵承保條件二"
  ],
  "exclusions": [
    "主要除外不保事項一",
    "主要除外不保事項二"
  ],
  "official_buy_url": "https://www.insurer.com.hk/tc/products/sample",
  "source_urls": [
    "https://www.insurer.com.hk/tc/products/sample"
  ],
  "documents_found": [
    "官方產品手冊及保單條款（insurer.com.hk）"
  ],
  "citations": [],
  "promo": {
    "tag": "新上市推廣",
    "discount": "8 折",
    "code": "NEWPROMO",
    "note": "網上投保輸入優惠碼享 8 折特惠"
  }
}
```

---

### 🔍 字段填寫詳盡規範與避坑說明 (Field Specifications)

| 欄位名稱 | 型別 | 必填 | 規範與避坑指南 |
| :--- | :---: | :---: | :--- |
| `id` | `string` | **是** | 格式：`category-insurer`，全小寫以連字符分隔。例如 `travel-prudential`、`pet-chubb`。 |
| `category` | `string` | **是** | 必須為 11 大合規分類之一：`travel`, `medical`, `high-end-medical`, `top-up-medical`, `life`, `critical-illness`, `accident`, `home`, `pet`, `motor`, `domestic-helper`。 |
| `insurer` | `string` | **是** | 必須為 [`scripts/product_identity.mjs`](../../../scripts/product_identity.mjs) 允許的大寫/標準代碼（如 `PRUDENTIAL`, `AIA`, `AXA`, `BOWTIE`, `FWD` 等）。切勿自創！ |
| `insurer_zh` | `string` | **是** | 保險公司官方繁體中文名稱（如 `保誠保險`、`友邦保險`、`安盛`）。 |
| `product_name` | `string` | **是** | 產品官方英文名稱。 |
| `product_name_zh` | `string` | **是** | 產品官方繁體中文名稱。 |
| `plan_tiers` | `array` | **是** | 計劃層級列表，如 `["標準計劃", "尊尚計劃"]`。若無分級填 `["標準計劃"]`。 |
| `coverage` | `array` | **是** | 核心保障清單。每項包含 `item`, `limit`, `source_url`, `document_name`, `page`, `quote`。<br>🚨 **`quote` 必須與 PDF 該頁實際文字 100% 吻合**。 |
| `premium_range` | `string` | **是** | 價格範圍字串（例：`HK$150 起` 或 `每月 HK$388 - HK$1,280`）。若停售填 `需報價 / 已停售`。 |
| `premium_available`| `boolean`| **是** | `true` 時前台顯示「官網投保」；`false` 顯示「官網報價」或「致電查詢」。 |
| `premium_notes` | `string` | 否 | 保費補充資訊（如自負額影響、性別年齡基準、折扣備註）。 |
| `key_terms` | `array` | **是** | 核心承保條件（如投保年齡、自負額檔次、等候期等）。至少 2 條。 |
| `exclusions` | `array` | **是** | 主要不保事項（如投保前既有傷病、高危運動等）。至少 2 條。 |
| `official_buy_url` | `string` | **是** | 官方直接購買或即時試算之 HTTPS URL。 |
| `source_urls` | `array` | **是** | 產品詳情頁或條款下載頁之官方 HTTPS URL 列表。 |
| `documents_found` | `array` | **是** | 找到之官方文件說明文字。 |
| `citations` | `array` | **是** | 額外引用陣列，一般新加入時置為 `[]`。 |
| `promo` | `object` | 否 | 最新優惠物件。包含 `tag`, `discount`, `code`, `note` 等（若無優惠可不填或留空）。 |

---

## 🚀 步驟 4：執行四重 CI 質量驗證

切勿跳步！終端機依序執行以下命令：

```bash
# 1. 執行單元測試（包含 PDF 指紋校驗與數據 Schema 檢查）
npm test

# 2. 檢查程式碼與資料規範（必須 0 errors 0 warnings）
npm run lint -- --max-warnings=0

# 3. 測試搜尋與過濾器矩陣邊界（94,000+ 組合邊界驗證）
npm run test:filters

# 4. 驗證全站前端編譯
npm run build
```

---

## 📦 步驟 5：遞增構建版本

在 [`src/lib/version.ts`](../../../src/lib/version.ts) 內遞增 `BUILD_NUMBER`（如 `20260911.03`）並填妥 PR 說明提交。

---

## 🔗 相關手冊導航
- 🏷️ [更新保費與優惠代碼 SOP](./update-pricing-and-promo.md)
- 📄 [PDF 說明書更新與引用校對 SOP](./update-pdf-terms-and-quotes.md)
- 🗄️ [產品停售或歸檔 SOP](./deprecate-product.md)
- 🧭 [返回維護總手冊](../README.md)
