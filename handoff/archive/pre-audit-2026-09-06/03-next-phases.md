# 03 — Next Phases Roadmap

Updated as of **2026-09-04 (v1.2.1)**.

## Phase 1 — Deploy & verify in production ✅ DONE (2026-09-02)
Cloudflare Pages + Custom domain + HTTPS + SPA fallback.

## Phase 2 — Modernization, Expansion & Smart Matching ✅ DONE (2026-09-04)
- 158 款全產品擴充與 2024–2026 最新官方條款清洗。
- 11 大類別專屬 147 個特點標籤 + 51 個 Persona 預設。
- Smart Match 智能契合度評分引擎與 84,000+ 回歸測試。
- ScrollTrigger 首頁圖案遮擋 Bug 徹底修復。
- 版本號與 Build Number 自動化遞增鐵律實裝。

## Phase 3 — Flexi Plan Deep Parsing (Next Priority)
- 對熱門自願醫保靈活計劃（如 Bowtie Pink、AIA 尊裕、Bupa 卓越等）的細項保障額進行深度結構化提取。

## Phase 4 — Performance & Code Splitting
- 引入 `React.lazy` 與 Vite `manualChunks` 分包，將首屏 JS 壓縮至 300KB 以下。

## Phase 5 — CI/CD Automation
- 建立 GitHub Actions 流程，每次 PR 自動執行 `npm run lint`、`npm run build` 及 `verify_filter_combinations.ts`。
