# ➕ 任務操作卡：新增保險產品全流程 SOP

> **檔案位置**：`docs/maintenance/workflows/add-new-product.md`  
> **目標**：從零將一款全新保險產品納入比價庫，確保身份規範、證據確鑿、測試全過。  
> **適用場景**：保險公司推出全新險種，或本站擴展收錄範圍。

---

## 🆔 步驟 1：擬定標準規範 ID 與保司標識

1. **ID 命名公式**：`[category]-[canonical-insurer-slug]`（例：`pet-chubb`、`motor-allianz`）。
2. **保司標識核實**：
   - 參照 `scripts/product_identity.mjs`，確認保司英文名稱 `insurer` 及中文名稱 `insurer_zh` 為市場公認官方名稱（如 `AXA` / `安盛`、`FWD` / `富衛保險`）。
   - 切勿創造不存在的縮寫或拼音 ID。

---

## 📂 步驟 2：儲存官方 PDF 鏡像並生成指紋

1. 將官方小冊子或保單條款 PDF 下載至 `public/docs/brochures/`（以英文命名）。
2. 更新指紋清單：
   ```bash
   node scripts/build_pdf_manifest.mjs
   ```

---

## 📝 步驟 3：填寫 `public/data/insurance-data.json`

在 `products` 陣列中追加完整物件，確保以下所有關鍵欄位齊全：

```json
{
  "id": "pet-chubb",
  "category": "pet",
  "insurer": "Chubb",
  "insurer_zh": "安達保險",
  "product_name": "Chubb Pet Care",
  "product_name_zh": "安達寵物守護計劃",
  "plan_tiers": ["標準計劃", "尊貴計劃"],
  "coverage": [
    {
      "item": "獸醫門診費用",
      "limit": "每年最高 HK$15,000",
      "source_url": "/docs/brochures/chubb-pet-care.pdf#page=2",
      "document_name": "安達寵物守護計劃產品小冊子",
      "page": 2,
      "quote": "獸醫門診治療及處方藥物保障 ..."
    }
  ],
  "premium_range": "HK$1,200 - HK$3,500",
  "premium_available": true,
  "premium_notes": "視乎寵物年齡、品種及所選計劃",
  "key_terms": ["投保年齡滿 8 星期至 8 歲", "實報實銷 80% 賠償率"],
  "exclusions": ["投保前已存在之疾病或先天缺陷不保"],
  "source_urls": ["https://www.chubb.com/hk-zh/personal/pet.html"],
  "documents_found": ["安達寵物守護計劃小冊子及條款"],
  "citations": [],
  "official_buy_url": "https://www.chubb.com/hk-zh/personal/pet.html",
  "promo": { "tag": "最新上市", "note": "新上市網上投保享特惠保費" }
}
```

---

## 🚀 步驟 4：執行四重 CI 質量驗證

切勿跳步！終端機依序執行以下命令：

```bash
# 1. 執行單元測試
npm test

# 2. 檢查程式碼與資料規範（必須 0 errors 0 warnings）
npm run lint -- --max-warnings=0

# 3. 測試搜尋與過濾器矩陣邊界
npm run test:filters

# 4. 驗證全站前端編譯
npm run build
```

---

## 📦 步驟 5：遞增構建版本

在 `src/lib/version.ts` 內遞增 `BUILD_NUMBER`（如 `20260911.03`）並填妥 PR 說明提交。
