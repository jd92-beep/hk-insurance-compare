# 🏛️ 核心數據架構與更新規則 (Core Rules & Architecture)

> 🧭 [返回維護總手冊](./README.md)  
> **閱讀對象**：任何需要維護、修改或新增保險資料的 AI Agent 或工程師。  
> **目標**：花 2 分鐘閱讀，即可完全掌握全站數據結構，零犯錯、零踩坑。

---

## 1. 🗄️ 全站單一真相來源 (Single Source of Truth)

全站所有 158 款保險的資料完全儲存於：
👉 [`public/data/insurance-data.json`](../../public/data/insurance-data.json)

### 標準產品對象 (Product Schema) 字段規範：

```json
{
  "id": "travel-prudential",                 // [唯一主鍵] 格式：category-insurer
  "category": "travel",                      // [11大類別之一] 必須嚴格匹配有效 category
  "insurer": "PRUDENTIAL",                   // [大寫英文鍵值] 嚴格受 scripts/product_identity.mjs 守護，不可隨意新創
  "insurer_zh": "保誠保險",                   // 保險公司官方繁體中文全稱
  "product_name": "PRUTravel",               // 產品官方英文名稱
  "product_name_zh": "保誠精選「旅遊樂」",     // 產品官方中文名稱
  "plan_tiers": ["普通計劃", "尊貴計劃"],     // 計劃層級列表
  "coverage": [                              // 核心保障項目列表
    {
      "item": "醫療費用",
      "limit": "最高 HK$1,200,000",
      "source_url": "/docs/brochures/prudential-travel.pdf#page=4",
      "document_name": "保誠旅遊保險產品單張",
      "page": 4,
      "quote": "醫療及有關費用高達 1,200,000 港元"
    }
  ],
  "premium_range": "單次旅程 HK$75 起；全年保障 HK$1,480 起", // 具體保費區間文字
  "premium_available": true,                 // 是否有定額/公開價格（true: 顯示「官網投保」，false: 顯示「官網報價」）
  "premium_notes": "網上投保享 7 折優惠",      // 價格備註 / 試算說明
  "key_terms": [                             // 主要條款與承保條件
    "受保年齡由出生後 30 天至 85 歲",
    "業餘滑雪、水肺潛水（深度 30 米內）無須額外附加費"
  ],
  "exclusions": [                            // 主要不保事項
    "投保前已存在之傷病",
    "非因意外或突發疾病引致之費用"
  ],
  "official_buy_url": "https://www.prudential.com.hk/tc/general-insurance/travel/", // 官方即時報價/直接投保頁面
  "source_urls": [                           // 官方產品詳情專頁或條款下載頁
    "https://www.prudential.com.hk/tc/general-insurance/travel/"
  ],
  "documents_found": [                       // 關聯官方文件說明
    "保誠精選「旅遊樂」官方產品規格及保單條款（prudential.com.hk）"
  ],
  "promo": {                                 // 最新優惠（可選）
    "tag": "限時特惠",
    "discount": "7 折",
    "code": "TRAVEL30",
    "note": "網上投保輸入優惠碼享 7 折"
  }
}
```

---

## 2. ⚠️ 三大不可逾越的鋼鐵紀律 (Iron Rules)

### 🚨 鐵律一：嚴禁隨意新創或更改 `insurer` Key
- 保險公司身份識別碼（如 `PRUDENTIAL`, `AIA`, `AXA`, `BOWTIE`, `MANULIFE` 等）受 [`scripts/product_identity.mjs`](../../scripts/product_identity.mjs) 全嚴格防禦。
- 如果改動了 `insurer` 名稱，會直接導致產品篩選破裂及 CI 測試失敗！

### 🚨 鐵律二：更新任何資料必須更新版本號與日期
每次修改代碼、數據或文檔，必須同步更新：
1. [`src/lib/version.ts`](../../src/lib/version.ts)：
   - `BUILD_NUMBER = "YYYYMMDD.XX"`（順延當天 build 序號）
   - `BUILD_DATE = "YYYY-MM-DD"`
   - `APP_VERSION` 若有功能/數據發布升級語義版本（如 `1.7.3`）
2. [`package.json`](../../package.json) 與 `package-lock.json`（版本號與 `APP_VERSION` 嚴格一致）。

### 🚨 鐵律三：更換 PDF 後必須更新 Manifest 指紋
若替換或新增了 `public/docs/brochures/` 內的本地 PDF 檔案：
1. 必須運行腳本重建指紋：
   ```bash
   node scripts/build_pdf_manifest.mjs
   node scripts/copy_pdf_assets.mjs
   ```
2. 確保 PDF 測試全部通過（CI 會校驗 PDF SHA-256 指紋，防止偷換失效）。

---

## 3. ⚖️ 條款衝突仲裁原則 (Policy Terms Arbitration Rules)

在維護保險數據時，經常會遇到**官方宣傳網頁、產品說明書 (Brochure) 與保單條款 (Policy Wording)** 描述不一致的情況。為杜絕誤導用戶與法律合規風險，所有維護者必須遵循以下法律權威位階與仲裁規則：

### 🏛️ 法律權威位階 (Hierarchy of Authority)
```
  ┌─────────────────────────────────────────────────────────────┐
  │   1. 保單條款 (Policy Wording / Terms & Conditions)  [最高]   │  ← 具備完全法律約束力
  ├─────────────────────────────────────────────────────────────┤
  │   2. 產品說明書 (Product Brochure / Leaflet)          [次之]  │  ← 官方核准行銷文件
  ├─────────────────────────────────────────────────────────────┤
  │   3. 官方宣傳網頁摘要 (Website Landing Page / Summary)[參考]  │  ← 即時推廣宣傳資訊
  └─────────────────────────────────────────────────────────────┘
```

### 📋 具體仲裁原則與實務指引：

1. **理賠定義與核心限制以 Policy Wording 為唯一法律準繩**：
   - 宣傳單張及網頁常見「100%全數賠償」、「全球覆蓋」、「免自負額」等宣傳標語。
   - 但 Policy Wording 內部通常載有「受限於合理及慣常收費 (Reasonable and Customary Charges)」、「特定醫療網絡限定」、「每宗事故分項墊底費」或「慢性病除外」。
   - **比價庫記錄之 `coverage.limit`、`key_terms` 及 `exclusions`，必須以 Policy Wording 的正式法律條文為準**，不得直接搬用簡化口號。

2. **產品說明書 (Brochure) 之角色與采納邊界**：
   - Brochure 是保司向公眾介紹產品的主要載體，適合用於鎖定官方公開的**計劃層級 (`plan_tiers`)**、**標準保費對照表 (`premium_range`)** 與**標準投保年齡範圍**。
   - 若單張概括條文與條款細則有出入，以條款為準；並在 `premium_notes` 或 `key_terms` 中明確標註具體限制。

3. **官方宣傳網頁 (Website) 之使用界限**：
   - 官方網站更新節奏最快，主要反映**即時優惠碼 (Promo Code)**、**限時首年折扣**及**即時報價試算連結 (`official_buy_url`)**。
   - 嚴禁單憑網頁宣傳 Banner 的行銷口號作為保障限額依據；凡涉及具體金額與賠償比例，必須溯源下載官方 PDF 條款或小冊子校對。

4. **保守記錄原則 (Conservative Evidence Rule)**：
   - 若官方小冊子與保單條款存在難以調和的衝突，或條款未對某項目作正面明文承保，一律秉持**保守記錄**：
     - 保留條件限制（如：「須經事前核准方可索償」）。
     - 標註為未知或保留官方原文，**嚴禁將「有條件承保」美化為「全面包賠」，亦嚴禁自行推測補齊數字**！

---

## 4. 🧪 必跑質量門禁 (Quality Gates)

任何修改提交前，必須在本機終端運行並 100% 通過以下指令：

```bash
# 1. 全站維護自動體檢（10 重檢驗：ID、鏈接、分類、手冊覆蓋率 100% 通過）
npm run check:maintenance

# 2. 語法與代碼風格（必須 0 error 0 warning）
npm run lint -- --max-warnings=0

# 3. 單元與指紋完整性測試（76/76 必須全綠）
npm test

# 4. 生產打包構建（必須編譯成功）
npm run build

# 5. 深度過濾與邊界安全檢驗（94,000+ 條組合必須全綠）
npm run test:filters
```

---

## 🔗 相關維護操作指南
- 🏷️ [更新保費與優惠代碼 SOP](./workflows/update-pricing-and-promo.md)
- 📄 [PDF 說明書更新與引用校對 SOP](./workflows/update-pdf-terms-and-quotes.md)
- ➕ [新增保險產品全流程 SOP](./workflows/add-new-product.md)
- 🗄️ [產品停售或歸檔 SOP](./workflows/deprecate-product.md)
- 🧭 [返回維護總手冊](./README.md)
