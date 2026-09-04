# GEMINI.md — hk-insurance-compare（保險格價站）專案記憶與執行規範

本文件為 Google Antigravity / Gemini Agent 核心專案記憶與執行指引。所有承接本專案之 Agent 必須嚴格遵守以下所有規則與工作流。

---

## 🚨 核心記憶與鐵律 (MANDATORY RULE)

### 📌 每次修改必須更新版本號與 Build Number (Version & Build Bump Workflow)
**「Remember to update the version of build number every time you make changes.」**

每次對專案程式碼、數據庫或 UI 做出任何變更、修復或功能擴充時，在提交 (Commit) 與打包 (Build) 前，**必須自動同步更新版本號與 Build 編號**：

1. **更新 `src/lib/version.ts`**：
   ```typescript
   export const APP_VERSION = "1.2.0";        // 語意化版本 (Semantic Versioning)
   export const BUILD_NUMBER = "20260904.2";    // 日期.當日構建序號 (YYYYMMDD.N)
   export const BUILD_DATE = "2026-09-04";      // 構建日期 (YYYY-MM-DD)
   export const FULL_VERSION_STRING = `v${APP_VERSION} (Build ${BUILD_NUMBER})`;
   ```
2. **同步更新 `package.json`** 中的 `"version"` 欄位。
3. **Footer 展示**：`src/components/Footer.tsx` 數據聲明已綁定 `FULL_VERSION_STRING`，構建後訪客與管理員可即時核對目前運行版本。

---

## 🏛️ 專案架構概覽 (System Architecture)

- **專案定位**：香港保險格價比較靜態 Single Page Application（SPA），全繁體中文（香港粵語在地化），「逐份官方文件幫你睇」。
- **代碼庫**：GitHub `jd92-beep/hk-insurance-compare`（分支 `master`）。
- **線上生產環境**：`https://insurance.tommychu2025.dpdns.org`（備用：`https://hk-insurance-compare-ejh.pages.dev`）。
- **部署架構**：Cloudflare Pages，推送到 `master` 分支後自動觸發 `npm run build` 並部署 `dist/`。
- **技術棧**：
  - React 19 + TypeScript 5
  - Vite 7
  - Tailwind CSS 3.4
  - Radix UI / shadcn/ui
  - Framer Motion + GSAP + Lenis
  - react-router 7

---

## 📊 數據庫與核心資產現狀

- **全庫產品總數**：**158 款產品**（全部採用 2025–2026 年現行最新官方小冊子與保單條款，無任何過期失效引用）。
- **涵蓋 11 大保險類別**：
  1. `travel`（旅遊保險）：20 款
  2. `medical`（自願醫保 VHIS）：28 款
  3. `high-end-medical`（高端醫療）：10 款
  4. `top-up-medical`（差額 Top-up 醫保）：7 款
  5. `home`（家居保險）：16 款
  6. `critical-illness`（危疾保險）：13 款
  7. `accident`（個人意外保險）：14 款
  8. `life`（定期壽險）：14 款
  9. `motor`（汽車保險）：13 款
  10. `domestic-helper`（家傭保險）：12 款
  11. `pet`（寵物保險）：11 款
- **智慧篩選體系 (`src/lib/feature-filters.ts`)**：
  - **147 個高價值特點標籤**：全部經過真實保單條款匹配驗證（0 死標籤）。
  - **51 個熱門場景預設 (Persona Presets)**：支援一鍵套用熱門情境（如「自駕遊達人」、「租客首選」、「滑雪水上運動」、「打工仔填補差額」等）。
  - **智能契合度評分引擎 (Smart Match Engine)**：
    - 多選條件永不空白（Zero Empty Screen），命中最多條件者置頂排序。
    - 支援「✨ 智能推薦（符合最多項優先）」與「🎯 嚴格全中 (AND)」自由切換。
    - 嚴格模式 0 結果時自動觸發友善 Fallback 推薦。

---

## 🛠️ 質量門禁與發布檢查清單 (Quality Gates)

在進行任何 Git Commit 及 Push 之前，必須執行並確認以下所有檢查：

1. **版本號遞增**：檢查 `src/lib/version.ts` 及 `package.json` 版本號與 Build Number 已遞增。
2. **ESLint 檢查**：
   ```bash
   npm run lint
   ```
   *基準要求*：嚴格維持 22 個既有 baseline 錯誤，**新加入或修改的代碼必須 0 Lint Error**！
3. **TypeScript 與 Vite 打包**：
   ```bash
   npm run build
   ```
   *基準要求*：`tsc -b && vite build` 必須 100% 通過，耗時一般在 5–15 秒內，生成 `dist/`。
4. **組合回歸測試（如涉及 Filter 或數據修改）**：
   ```bash
   npx tsx scripts/verify_filter_combinations.ts
   npx tsx scripts/verify_filter_boundary_deep.ts
   ```
   *基準要求*：84,000+ 個斷言必須全部 PASS。
5. **Git Commit & Push**：
   ```bash
   git add ...
   git commit -m "..."
   git push origin master
   ```

---

## 🗣️ Agent 風格與溝通要求

- **主語言**：廣東話（香港粵語）為全部輸出、思考與回覆之主要語言。
- **個性風格**：幽默直率、俐落簡潔、切中要點、有主見不盲從，適量使用豐富 Emoji（🐶🚗✈️🛡️📊✨）。
- **數據神聖原則**：數字、保額上限、自負額及條款細項嚴格依據官方來源，絕不憑空捏造。
