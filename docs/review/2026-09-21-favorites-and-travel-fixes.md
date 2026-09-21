# 2026-09-21 交付評審：我的最愛 (Favorites)、旅遊保費單次／全年篩選排序修復與鏈接加固

## 1. 變更背景與目標
依用戶需求，系統需完成以下四大核心功能加固與體驗升級：
1. **旅遊保險單次旅程 vs 保費排序**：在旅遊保險中選擇「單次旅程」並按保費「由低至高」排序時，舊邏輯會誤將單次每日保費乘以 365 換算成「約 HK$18,250/年」，且未排除純全年計劃，導致年費與日費混雜。現已徹底修正為：按單次／每日基準保費精準提取並排序，純全年計劃自動排除。
2. **修復外部與內部鏈接 404**：
   - Bupa Hero 官方專屬產品介紹與投保頁更新為實測 200 OK 之官方網址 `https://www.bupa.com.hk/tc/individuals/medical-schemes/hero-vhis-plan/`，其餘 Bupa 產品同步更新。
   - Starr 保險官方網站改版，舊單張鏈接全部 404，已全面更新為 200 OK 之官網即時投保頁與首頁入口。
   - `src/App.tsx` 增設單數／複數別名路由（`/insurer/:insurerKey` 及 `/products/:productId`），徹底防止路徑單複數引起的 404。
3. **卡片空白處點擊跳轉**：
   - 全平鋪卡片（`FlatPriceCard`）與簡約報價卡片（`MinimalQuoteCard`）全面支援點擊卡片空白處直接跳轉至計劃詳情頁。
   - 包含文字選取保護、Cmd/Ctrl 新分頁保護，且最愛按鈕、比較按鈕、官方連結均獨立防護不誤觸跳轉。
4. **「我的最愛 (Favorites)」功能與專屬頁面**：
   - 卡片右上角鑽石符號（`Card3DGem`）升級為交互式收藏夾按鈕（未收藏時為高質感品牌立體 Gem，已收藏時為紅寶石色滿心 Heart ❤️）。
   - 頂部導航欄（Navbar）新增「我的最愛」按鈕及紅點動態計數徽章（Badge），隨時反映已收藏產品總數。
   - 建立 `/favorites` 專屬管理頁面，基於瀏覽器 `localStorage`（key: `hk_insure_favorites`）永久保存，免註冊保障私隱。
   - 具備分類篩選 Tabs、一鍵加入比較托盤、單一刪除、清空二次確認 Modal、優雅空狀態引導。

## 2. 驗證記錄
- `npm test`：218/218 通過。
- `npm run lint -- --max-warnings=0`：0 errors, 0 warnings。
- `npm run build`：通過，生產環境 bundle 打包無誤。
- `npm run test:filters`：91,797 + 3,000 項斷言 100% 通過。
- Headless Chrome 真機截圖：驗證旅遊保費單次排序、我的最愛卡片交互、Navbar 計數徽章與 `/favorites` 管理頁面。
