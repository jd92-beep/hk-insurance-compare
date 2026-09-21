# 2026-09-21 UI Layout Delivery: Top Deck Side-by-Side & Full-Width Matrix (Build 20260921.10)

## 1. 交付背景與用戶需求

用戶針對產品詳情頁（特別係自願醫保多計劃產品）提出三個核心佈局優化要求：
1. **徹底移除資料限制提示**：移除「資料限制,有連結唔代表已核實。請核對計劃、條款版本及不保事項；內容最新性：未核實。」之卡片（`EvidenceNotice`）。
2. **下方保障一覽表格用盡寬度**：下方多欄矩陣表格徹底消除右側側欄擠壓，用盡右側尺寸，使多欄對比表格自然鋪開，大螢幕完全唔使左右拖拉。
3. **重點一覽卡片上移並與認可產品卡並排**：
   - 「重點一覽」卡片向上移，移到 S1 頁首「來源參考」卡片之下。
   - 「自願醫保認可產品」卡片縮小靠左（佔 7 欄）。
   - 「重點一覽」卡片靠右（佔 5 欄），兩張卡並排呈現。
   - 下方 S2 正文區塊完全解放寬度，無側欄阻擋。

---

## 2. 代碼變更詳情

1. **`src/pages/ProductDetail.tsx`**：
   - 移除 `EvidenceNotice` 引入與 JSX 渲染。
   - 在 S1「來源參考」下方構建雙卡並排 Deck（`grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch`）：
     - 左欄（`lg:col-span-7`）：`KeyFactsCard`（自願醫保認可產品卡）。
     - 右欄（`lg:col-span-5`）：`ProductSideRail`（重點一覽卡，傳入 `isTopDeck`）。
   - 徹底移除 S2 內容區內右側的 `<ProductSideRail ... />`。
   - 移除中間欄的 `xl:max-w-[780px]` 限制，使其全寬展開（`flex-1 w-full min-w-0`）。

2. **`src/components/product/KeyFactsCard.tsx`**：
   - 支援 `className?: string`，融入 Top Deck Grid。
   - 內部容器改為 `flex h-full flex-col justify-between`。
   - 優化數字 tiles 在雙卡並排時的自適應佈局（`grid-cols-2 sm:grid-cols-2 xl:grid-cols-4`）。

3. **`src/components/product/ProductSideRail.tsx`**：
   - 新增 `isTopDeck?: boolean` prop。
   - 在 Top Deck 模式下，移除 `sticky top-[100px]` 及 `max-w-[300px]` 限制，高度與左側卡片保持 `h-full flex flex-col justify-between` 協調。
   - 保留選中計劃專屬規格動態連動（每年保障限額、終身限額、認可編號、報價與比較按鈕）。

4. **`src/components/product/CoverageSection.tsx`**：
   - 移除 `MultiPlanMatrixTable` 表頭 `th` 的 `max-w-[250px]` 限制，使表格在全寬主欄中能充分均分伸展，徹底用盡右側空間。

5. **`src/lib/version.ts`**：
   - 升級至 Build `20260921.10`（APP_VERSION `1.8.7`）。

---

## 3. 門禁驗證結果

- **單元測試**：`npm test` → **206 / 206 passed**（0 fail）。
- **語法與風格審查**：`npm run lint -- --max-warnings=0` → **0 errors, 0 warnings**。
- **生產構建**：`npm run build` → **Passed**（dist 打包成功，各 chunk 正確產出）。
- **全量篩選邊界測試**：`npm run test:filters` → **3,000 preset 斷言 + 91,797 boundary 斷言 100% 全部通過**。
- **真實瀏覽器截圖驗收**：
  - `/product/medical-aia`：驗證黃色警示卡已消失，雙卡頂部並排，4 欄對比表格全寬展示無左右滾動。
  - `/product/medical-axa`：驗證多計劃靈活計劃全寬展開，認可產品與重點卡並排。
  - `/product/medical-aia?tier=f00074`：驗證選中計劃時右側重點卡即時動態連動為 HK$12,000,000 專屬限額。
