# 2026-09-21 UI Polish, Overlap Fix & Price Sort Flat View (Build 20260921.11)

## 1. 交付背景與用戶需求

針對醫療保險列表頁與產品詳情頁，用戶提出七項深度 UI/UX 改進與 Bug 修復需求：
1. **自願醫保認可產品卡重構與美化**：重新設計 `KeyFactsCard.tsx` 排版，採用翡翠綠權威徽章、政府認可計劃編號分組矩陣（標準 vs 靈活 vs 只供續保）、三大法定保證等精緻視覺結構。
2. **來源參考卡片重疊 Bug 修復**：向下滾動時 `ProductHeader.tsx` 的「來源參考」檔案卡不可 overlap 下方的重點一覽卡片（已移除 sticky 與負 margin，自然隨頁面上捲）。
3. **快照日期移至頁面最底**：類別頁（如 `/category/medical`）頂部的快照日期移到頁面差不多最底的位置（footer 上方），頁首只保留功能性連結。
4. **徹底移除 "How we rank"**：從類別頁徹底移除 `HowWeRankCard`（「我哋點樣排」卡片）。
5. **徹底移除 "Your comparison, your terms"**：徹底移除 `CategoryDecisionGuide`（「你想保障邊級病房，願意先付幾多」引導卡片）與 Compare 頁相應區塊。
6. **保險公司卡片長度縮短 1/3 並加「See More」**：`ProductCard.tsx` 預設收摺保障細項與不保事項以縮短 1/3 長度，卡片下方中間加「查看詳細計劃 (See More)」/「收起詳細計劃」開關；「加入比較」與「睇計劃詳情」按鈕始終完整顯示於底部。
7. **篩選器加入保費排序與獨立產品卡片平鋪**：
   - `FilterBar.tsx` 加入「保費：由低至高」與「保費：由高至低」排序。
   - 價格排序模式：將每間保險公司的每個獨立產品（如不同子計劃）分拆為獨立卡片平鋪；有金額者按換算年費基準排序。
   - 保費 unknown / 需 quote 價錢者排在最後，並使用極度簡短的 `MinimalQuoteCard`（僅顯示公司名、計劃名與需報價提示，滿足老細明確指示）。

---

## 2. 代碼變更詳情

1. **`src/components/product/ProductHeader.tsx`**：
   - 移除 `lg:sticky lg:top-[100px]` 與 `lg:-mb-24` 負 margin，使來源參考檔案卡在頁面向下滾動時自然捲動，徹底消除與下方 Top Deck 卡片的重疊 bug。

2. **`src/components/product/KeyFactsCard.tsx`**：
   - 徹底重構排版：
     - 頂部：翡翠綠盾牌權威標章「自願醫保認可產品 VHIS」及「官方名冊 →」膠囊連結。
     - 中部：政府認可計劃編號矩陣，細分為「標準計劃」、「靈活計劃」、「只供續保」三行徽章。
     - 下部：三大法定保證條款（保證續保至 100 歲、每年最高 $8,000 稅務扣減、21 天全額冷靜期）。
     - 底部：最高每年限額與投保年齡標籤。

3. **`src/pages/CategoryDetail.tsx`**：
   - 頁首移除快照日期，改為頁面最底部的正式資訊列。
   - 移除 `HowWeRankCard` 與 `CategoryDecisionGuide` 的可見渲染。
   - 整合 `priceSortedItems`：在價格排序模式下調用 `PriceSortedCards` 組件。

4. **`src/pages/Compare.tsx`**：
   - 移除未使用的 `CATEGORY_DECISIONS` 與 `decisionBaseline` 區塊，維持代碼精簡。

5. **`src/components/ProductCard.tsx`**：
   - 卡片長度縮短 1/3：預設隱藏保障項目與可能唔保項目。
   - 在卡片中間下方新增「查看詳細計劃 (See More) ⌄」/「收起詳細計劃 ⌃」居中開關。
   - 底部「睇計劃詳情」與「+ 加入比較」按鈕始終完整、常駐可見。

6. **`src/lib/price-sorting.ts`**（全新模組）：
   - 換算月繳/日繳/年繳為統一年費數值基準。
   - `flattenProductsForPriceSort`：將各保險公司的子計劃（如 S00013、F00022、F00074、F00081 等）平鋪為獨立卡片項。
   - `sortFlatProductsByPrice`：有參考保費者排序在前，無公開劃一定價者標記為 `isQuoteOnly` 排在最後。

7. **`src/components/category/PriceSortedCards.tsx`**（全新組件）：
   - `FlatPriceCard`：突出翡翠綠參考保費標籤、房型與認可編號。
   - `MinimalQuoteCard`：極簡報價卡（僅含公司名、計劃名、房型與需向官網報價標籤，簡潔緊湊）。

8. **`src/components/category/FilterBar.tsx`**：
   - 排序選單新增「保費：由低至高 ↑」與「保費：由高至低 ↓」選項。
   - 加入提示文字說明依價格排序時各產品將分拆平鋪列出。
   - 為 select 元素加入 `id="catalogue-sort"` 與 `htmlFor`，強化可訪問性與測試定位。

9. **`src/lib/version.ts`**：
   - 升級至 Build `20260921.11`（APP_VERSION `1.8.7`）。

---

## 3. 門禁驗證結果

- **單元測試**：`npm test` → **206 / 206 passed**（0 fail）。
- **語法與風格審查**：`npm run lint -- --max-warnings=0` → **0 errors, 0 warnings**。
- **生產構建**：`npm run build` → **Passed**（dist 打包成功，各 chunk 正確產出）。
- **全量篩選邊界測試**：`npm run test:filters` → **3,000 preset 斷言 + 91,797 boundary 斷言 100% 全部通過**。
- **真實瀏覽器截圖驗收（Chrome Headless 驗收結果）**：
  1. `medical_overview.png`：驗證頁首乾淨、How we rank 及 Your terms 已完全移除。
  2. `product_detail_scrolled.png`：滾動 320px 驗證來源參考檔案卡不再重疊下方卡片；認可產品卡排版極為精美。
  3. `medical_cards_shortened.png`：卡片長度縮短 1/3，中間清晰展示「查看詳細計劃 (See More)」Chevron 按鈕，底部按鈕常駐。
  4. `medical_bottom_snapshot.png`：快照日期卡片穩妥置於內容最底部（footer 上方）。
  5. `medical_price_sorted_top.png`：價格排序下平鋪 74 個獨立子計劃卡片，翡翠綠保費突出且由低至高排序。
  6. `minimal_quote_cards_exact.png`：快照無保費之產品在列表後方以極簡 MinimalQuoteCard 網格呈現。
