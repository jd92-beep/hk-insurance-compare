# 01 — What Has Been Done

Project: **hk-insurance-compare** （保險格價站） — React 19 + TypeScript + Vite 7 + Tailwind 3.4 + shadcn/ui static SPA, Traditional Chinese (HK).
Repo: https://github.com/jd92-beep/hk-insurance-compare (branch `master`)
Local path: `~/Documents/Projects/Insurance comparison/hk-insurance-compare`

---

## Phase 1 (2026-09-02) — VHIS & Deployment
- Full VHIS official list integration (33 standard + 70 flexi plans).
- Product count raised to 101 products across 9 categories.
- Cloudflare Pages deployment configured with custom domain `https://insurance.tommychu2025.dpdns.org`.

---

## Phase 2 (2026-09-03 ~ 2026-09-04) — Modernization, Expansion & Smart Matching
All work below is completed and verified:

1. **全庫擴充至 158 款現行最新產品**（覆蓋 11 大類別）：
   - `travel` (20 款)、`medical` (28 款)、`high-end-medical` (10 款)、`top-up-medical` (7 款)、`home` (16 款)、`critical-illness` (13 款)、`accident` (14 款)、`life` (14 款)、`motor` (13 款)、`domestic-helper` (12 款)、`pet` (11 款)。
   - 清洗淘汰 <= 2022 年舊宣傳單張與過期 PDF 鏈接，全部升級為 2024–2026 年保險公司現行最新官方保單條款與小冊子。
   - 全站收錄 1,500+ 條官方逐條引文（文件 + 頁碼 + 官方摘錄 + 網址）。

2. **智慧條款篩選與契合度評分引擎 (Smart Match Engine)**：
   - 建立 `src/lib/feature-filters.ts`，涵蓋 **147 個專屬特點標籤**與 **51 個 Persona 熱門情境預設**。
   - 徹底杜絕跨類別無關標籤（如旅遊保險出「洗腎/精神科」），實現各類別獨立專屬維度。
   - 解決生硬 AND 篩選導致 0 筆產品之痛點：引入 `calculateProductFeatureMatches` 評分排序，選中多個條件時命中最多項者置頂，卡片標記 Match Badge，嚴格模式 0 結果自動觸發友好 Fallback。
   - 旅程專屬維度：單次 vs 全年多次、亞洲短途 vs 全球通用、即時推廣折扣優惠。
   - 明確標示「全數賠償」之官方定義（受制於每年保障總額或終身限額，非無上限）。

3. **重大視覺與滾動 Bug 修復 (ScrollTrigger Pin Overlap)**：
   - 調查並修復首頁向下滾動過人壽保險後，`MethodStory` 疊層圖案及紅印章覆蓋下方類別的致命 Bug。
   - 根因：初次 mount 時非同步 fetch 導致 `CategoryGrid` 容器高度只有 150px，ScrollTrigger 記錄提前 pin 觸發點。
   - 修復：在 `CategoryGrid.tsx` 加入靜態 11 類別 fallback 佔位 + `relative z-10 bg-paper` 容器層，並在數據載入後調用 `ScrollTrigger.refresh()`。

4. **版本控制與構建鐵律 (Version & Build Bump Workflow)**：
   - 建立 `src/lib/version.ts` 集中管理版本號，每次變更強制遞增版本號與 Build Number，同步 `package.json`，並綁定全站 `Footer.tsx` 展示。

5. **極限自動化回歸測試套件**：
   - `scripts/verify_filter_combinations.ts`（3,200 斷言全部 PASS）。
   - `scripts/verify_filter_boundary_deep.ts`（80,858 斷言全部 PASS）。
   - 合計 84,000+ 組合斷言守護篩選引擎零崩潰、零空屏。
