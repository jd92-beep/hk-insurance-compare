# 📄 任務操作卡：PDF 說明書更新與引用校對 SOP

> **檔案位置**：`docs/maintenance/workflows/update-pdf-terms-and-quotes.md`  
> **目標**：當保險公司發布新版小冊子或保單條款時，安全替換 PDF、校對頁碼引用並更新 SHA-256 指紋。  
> **維護原則**：證據鏈閉環、零斷鏈、逐字引用。

---

## 📥 步驟 1：下載新版 PDF 鏡像並規範存檔

1. 從保司官方連結下載最新小冊子或條款文件。
2. 存入本項目鏡像庫：`public/docs/brochures/`。
3. **命名規範**：全小寫、英文及連字符（例：`axa-smartdrive-brochure-2026.pdf`），避免空格與中文檔名。

---

## 🔐 步驟 2：重建 PDF Manifest 與 Hash 指紋

每次新增或替換鏡像 PDF，必須重新計算 SHA-256 指紋：

```bash
# 1. 自動掃描 public/docs/brochures/ 並更新 manifest
node scripts/build_pdf_manifest.mjs

# 2. （若涉及資產複製）同步 public 資產
node scripts/copy_pdf_assets.mjs
```

---

## ✍️ 步驟 3：校對並更新 `insurance-data.json` 引用

打開 `public/data/insurance-data.json`，定位至相應產品的 `coverage` 與 `citations`：

1. **更新 URL 與頁碼**：
   ```json
   "source_url": "/docs/brochures/axa-smartdrive-brochure-2026.pdf#page=4",
   "document_name": "AXA 卓越私家車保險產品小冊子（2026 年版）",
   "page": 4
   ```
2. **逐字引號校對 (`quote`)**：
   - 提取的 `quote` **必須與 PDF 該頁實際文字一字不差**（測試套件會執行嚴格純文本匹配）。
   - 切忌自己總結或潤色！

---

## 🧪 步驟 4：執行證據一致性驗證

```bash
# 執行單元測試（涵蓋 PDF 指紋、引文匹配及 Manifest 覆蓋測試）
npm test

# 執行過濾器與邊界深度檢測
npm run test:filters
```

*若出現 `tampered real mirror` 或 `invalidate an old evidence fingerprint`，代表 PDF hash 或頁碼引用不吻合，請重新核對！*

---

## 📌 步驟 5：更新版本與記錄

在 `src/lib/version.ts` 遞增 `BUILD_NUMBER` 並確認提交。

---

## 🚫 防錯紅線

1. ❌ **切勿跨產品借用引用**：不可因找不到新條款而暫借其他保司的引用。
2. ❌ **切勿手動偽造 SHA-256**：指紋必須由 `build_pdf_manifest.mjs` 自動產生。
3. ❌ **頁碼從 1 起算**：`#page=X` 指的是 PDF 檔案閱讀器的實際物理頁碼，而非內頁印上的頁碼編號。
