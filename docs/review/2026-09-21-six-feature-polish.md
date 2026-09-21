# 2026-09-21 六項深度 UI/UX 與功能增強交付審查 (Build 20260921.12)

## 變更概述

依據老細指示，針對產品卡片色彩、賣點展示、自願醫保官方名單連動、PDF 中心三級選擇器及類別頁對比卡文字對比度進行全面升級：

1. **每間公司/卡片專屬色彩多樣化 (Task 1)**
   - 建立 `src/lib/insurer-colors.ts`，涵蓋全港 30+ 間保險公司（AIA、AXA、Bowtie、Bupa、FWD、Manulife、Prudential 等）的品牌標誌色與中文別名，備用確定性調色盤。
   - `ProductCard.tsx`、`FlatPriceCard` 及 `MinimalQuoteCard` 均接入該專屬色，頂部色彩邊條及 3D Gem 寶石依保險公司獨立高亮。

2. **縮小卡片突出核心保障賣點 (Task 2)**
   - 在 `ProductCard.tsx` 及 `PriceSortedCards.tsx` 建立智能 `sellingPoints` 提取算法，從 `coverage`、`plan_tiers` 與 `key_terms` 動態提取最高價值保障限額與計劃。
   - 縮小狀態下呈現「核心保障賣點 · SELLING POINTS」綠勾亮點框，將瑣碎的免責聲明收摺入詳細計劃（See More）中。

3. **自願醫保名單展示公司英文名 (Task 3)**
   - 在 `src/pages/Vhis.tsx` 的標準計劃表格及靈活計劃手風琴中，保險公司中文名下方均增加其官方登記的英文名稱。

4. **自願醫保名單智能雙向跳轉 (Task 4)**
   - 點擊計劃名稱及級別自動跳轉至站內 `/product/:id` 計劃詳情介紹。
   - 點擊保險公司名稱自動跳轉至站內該保險公司目錄頁 `/insurers/:key`（展示該公司有甚麼保險）。

5. **PDF 中心三級階梯式級聯聯動 (Task 5)**
   - 在 `src/pages/Documents.tsx` 實作「第 1 步保險類別 ➔ 第 2 步保險公司 ➔ 第 3 步保險產品」級聯聯動。
   - 當某保險公司在該類別只有 1 份保險時，自動選中該保險並顯示狀態標籤；多於 1 份時提供下拉選單。
   - 採用純 Derived State + Event Handler 模式，徹底消除 `useEffect` 內的 `setState`，杜絕 cascading renders。

6. **類別頁 COMPARE TOOL 卡片字體改為黑色高對比度 (Task 6)**
   - 在 `src/pages/Categories.tsx` 中將卡片底色與文字色調校為 `bg-paper`、`text-ink`、`text-ink-soft`，經 Headless Chrome 真機截圖驗證黑白分明、清晰優雅。

## 驗證結果

- `npx tsc --noEmit`：0 errors
- `npm run lint -- --max-warnings=0`：0 errors, 0 warnings
- `npm test`：206/206 passing
- `npm run test:filters`：91,797 assertions passed, 0 failures
- `npm run build`：Vite 構建成功
- Headless Chrome 真機截圖：
  - `medical_colorful_cards.png`
  - `medical_cards_detail.png`
  - `insurer_aia_selling_points.png`
  - `vhis_en_company_and_links.png`
  - `documents_3tier_cascade.png`
  - `categories_compare_tool_full.png`
