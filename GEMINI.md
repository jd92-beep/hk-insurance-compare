# GEMINI.md — hk-insurance-compare（保險格價站）專案記憶與執行規範 🛡️📊

本文件為 Google Antigravity / Gemini Agent 之**最高權威專案記憶與執行手冊**。所有承接本專案之 Agent，在執行任何任務前必須嚴格研讀並遵守以下所有規範與工作流。

---

## 🚨 核心記憶與發布鐵律 (MANDATORY RULES)

### 📌 鐵律 1：每次修改必須更新版本號與 Build Number (Version & Build Bump Workflow)
> **「Remember to update the version of build number every time you make changes.」**

無論修改規模大小（哪怕只是修改一個文字、更新一個 PDF 連結或調整樣式），在進行 Git Commit 與 Build 之前，**必須自動同步更新版本號與 Build 編號**：

1. **更新 `src/lib/version.ts`**：
   ```typescript
   export const APP_VERSION = "1.2.1";          // 語意化版本 (Semantic Versioning)
   export const BUILD_NUMBER = "20260904.3";      // 日期.當日構建序號 (YYYYMMDD.N)
   export const BUILD_DATE = "2026-09-04";        // 構建日期 (YYYY-MM-DD)
   export const FULL_VERSION_STRING = `v${APP_VERSION} (Build ${BUILD_NUMBER})`;
   ```
2. **同步更新 `package.json`** 中的 `"version"` 欄位為 `"1.2.1"`。
3. **Footer 驗證**：全站頁腳 (`src/components/Footer.tsx`) 已綁定 `FULL_VERSION_STRING`，構建部署後訪客與管理員可即時核對線上運行版本。

### 📌 鐵律 2：數據神聖原則 (Sacred Citations)
- **零胡編亂造**：所有保險保額、自負額、保障條款、限制細則必須有香港保險公司官方文件（產品小冊子、保單條款 Policy Wording、保費表）或政府官方開放數據（vhis.gov.hk）作為依據。
- **逐條引文四要素**：每個重要數據必須附帶 `{ document, page, quote, url }`。
- **拒絕過期資料**：全站產品一律採用 2024–2026 年現行有效之官方文件，嚴禁引用 <= 2022 年之失效條款。

### 📌 鐵律 3：嚴格防守 ESLint 17 Baseline 錯誤
- 專案既有 17 個 baseline lint 錯誤（分佈於 `src/components/ui/`、`src/providers/`、`ProductTable.tsx` 等歷史代碼）。
- **鐵律**：任何新加入或修改的代碼，**新增加的 Lint Error 必須為 0**！執行 `npm run lint` 必須維持在 17 個。

### 📌 鐵律 4：主語言為廣東話（香港粵語）
- 所有思考過程、回覆、輸出、報告以及 UI 文案，一律以正宗香港廣東話（香港繁體中文）為主要語言。
- 個性風格：幽默直率、俐落簡潔、切中要點、有自己主見，多用貼切 Emoji（🐶🚗✈️🛡️📊✨）。

---

## 🏛️ 系統架構與技術棧 (System Architecture)

- **專案定位**：香港最具透明度之保險格價比較靜態 Single Page Application（SPA），「逐份官方文件幫你睇」。
- **代碼庫**：GitHub `jd92-beep/hk-insurance-compare`（分支 `master`）。
- **線上生產環境**：
  - 正式網域：`https://insurance.tommychu2025.dpdns.org`
  - 後備網域：`https://hk-insurance-compare-ejh.pages.dev`
- **部署架構**：Cloudflare Pages，推送到 `master` 分支後自動觸發 `npm run build` 並部署 `dist/`。
- **技術棧選型**：
  - **核心**：React 19 + TypeScript 5
  - **打包與伺服器**：Vite 7 (`.nvmrc` 釘選 Node 22)
  - **樣式與主題**：Tailwind CSS 3.4（自定義 `paper`, `ink`, `jade`, `amber` 設計語彙）
  - **UI 組件庫**：Radix UI / shadcn/ui
  - **動效引擎**：GSAP (ScrollTrigger) + Framer Motion (`EASE_OUT_EXPO`) + Lenis Smooth Scroll
  - **搜尋與路由**：cmdk 全域指令面板（⌘K）+ react-router 7

---

## 📊 數據庫資產與數據字典 (Database & Schema)

### 1. 全庫產品規模：**158 款現行最新產品**（分佈於 11 大保險類別）
| 類別代碼 | 類別名稱 (zh) | 產品數量 | 核心關注點 |
| :--- | :--- | :--- | :--- |
| `travel` | 旅遊保險 ✈️ | **20 款** | 醫療運送無上限、租車自負額、手機/電腦、任何原因取消、活動全包、長者不縮水 |
| `medical` | 自願醫保 (VHIS) 🏥 | **28 款** | 每年保障額、標準保費階梯、日間手術、癌症標靶、出院免找數、扣稅上限 |
| `high-end-medical` | 高端醫療保險 💎 | **10 款** | 全數賠償、終身無上限/每年千萬、半私家/私家房、環球醫療、多種自負額 |
| `top-up-medical` | 差額 Top-up 醫保 💼 | **7 款** | 公司醫保銜接、SMM 額外醫療賠償、墊底費自負額抵扣、超平保費升級 |
| `home` | 家居保險 🏠 | **16 款** | 家居財物上限、第三者責任(大廈外牆/爆水喉)、24小時緊急開鎖水喉、租客責任、收租保障 |
| `critical-illness` | 危疾保險 🩺 | **13 款** | 早期疾病、癌症/中風/心臟病多次賠償、良性腫瘤切除、保費豁免、家庭恩恤金 |
| `accident` | 個人意外保險 🦺 | **14 款** | 業餘消閒運動(滑雪/潛水)、意外醫療實報實銷、骨折脫臼、中醫跌打針灸、住院現金 |
| `life` | 定期壽險 🕊️ | **14 款** | 定期壽險(Term)、免驗身簡易核保、末期疾病提前給付、保證續保、非吸煙者特惠 |
| `motor` | 汽車保險 🚗 | **13 款** | 第三者責任險、綜合汽車全保、NCD無申索折扣保護、擋風玻璃免自負額、24小時道路拖車 |
| `domestic-helper` | 家傭保險 👩‍🍳 | **12 款** | 僱主法定勞工責任、家傭住院手術、門診跌打、嚴重疾病癌症、誠信保障/擅自更換 |
| `pet` | 寵物保險 🐶🐱 | **11 款** | 貓狗門診/手術/癌症、第三者公眾責任、免晶片核保、遺失尋寵廣告津貼、終身保障額 |

### 2. 39 間保險公司 Latin Key 規範對照表 (Insurer Identity Matrix)
> ⚠️ **警告**：在新增產品或引用保險公司時，必須**100% 嚴格復用**以下 Latin Key！自行創造新 Key（如大小寫不一致、縮寫或拼寫差異）會導致保險公司名錄出現重複公司！

```
1.  aia                   → 友邦保險 (AIA)
2.  allianz               → 安聯保險 (Allianz)
3.  allied-world          → 世聯保險 (Allied World)
4.  aon                   → 怡安 (Aon)
5.  asia-insurance        → 亞洲保險 (Asia Insurance)
6.  aviva                 → 宏利 / 前英傑華 (Aviva)
7.  avo                   → Avo 保險 (Avo Insurance)
8.  axa                   → 安盛保險 (AXA)
9.  blue                  → Blue 保險 (Blue)
10. blue-cross            → 藍十字保險 (Blue Cross)
11. bnp-cardif            → 法國巴黎保險 (Cardif)
12. bocom-insurance       → 交銀保險 (BOCOM Insurance)
13. boc-group-insurance   → 中銀集團保險 (BOC Group Insurance)
14. boc-life              → 中銀人壽 (BOC Life)
15. bolttech              → bolttech 保險 (前保特保險)
16. bowtie                → 保泰人壽 (Bowtie)
17. bupa                  → 保柏 (Bupa)
18. china-life-overseas   → 中國人壽（海外）(China Life Overseas)
19. china-ping-an         → 中國平安 (Ping An)
20. china-taiping         → 中國太平 (China Taiping)
21. chubb                 → 安達保險 (Chubb)
22. chubb-life            → 安達人壽 (Chubb Life)
23. cigna                 → 信諾環球 (Cigna Healthcare)
24. ctpli                 → 太平人壽（香港）(Taiping Life)
25. dah-sing              → 大新保險 (Dah Sing)
26. fubon                 → 富邦保險 (Fubon Insurance)
27. fwd                   → 富衛保險 (FWD)
28. generali              → 忠意保險 (Generali)
29. hang-seng             → 恒生保險 (Hang Seng Insurance)
30. hsbc-life             → 滙豐保險 (HSBC Life)
31. liberty               → 自由利寶保險 (Liberty Insurance)
32. manulife              → 宏利保險 (Manulife)
33. msig                  → 三井住友保險 (MSIG)
34. pioneer               → 先鋒保險 (Pioneer)
35. prudential            → 英國保誠保險 (Prudential)
36. qbe                   → 昆士蘭保險 (QBE)
37. starr                 → 司達保險 (Starr)
38. sun-life              → 永明金融 (Sun Life)
39. zurich                → 蘇黎世保險 (Zurich)
```

---

## 🧠 智慧篩選與契合度評分引擎 (Smart Match Engine)

在 `src/lib/feature-filters.ts` 中，我們構建了全港首個**保單條款級別**的智慧契合度評分引擎：

### 1. 核心組成
- **147 個專屬特點標籤 (`CATEGORY_FEATURE_TAGS`)**：每個保險類別設有 10–16 個切合現代香港人實際關注點的高價值條款標籤，每個標籤均綁定 3–8 組官方條款關鍵字正則與排除規則。
- **51 個熱門場景預設 (`CATEGORY_PERSONA_PRESETS`)**：針對常見用家情境（如「自駕遊達人」、「滑雪/水上活動」、「數碼器材控」、「租客首選」、「收租業主防坑」、「打工仔 Top-up」、「活潑狗隻」等），支援一鍵套用組合。

### 2. 契合度評分演算法 (Fit Score Calculation)
```typescript
fitScore = (matchedCount / selectedCount) * 100
```
- **智能排序**：命中選取條件越多者置頂排序；若命中數相同，則按保費性價比或官方推薦順序排列。
- **零挫敗體驗 (Zero Empty Screen)**：
  - 預設模式為「✨ 智能推薦（符合最多項優先）」：即使沒有產品 100% 滿足所有條件，也會展示符合 80% 或 60% 的最佳替代選項，並醒目標示 `🎯 符合 X/Y 項 (Z%)`。
  - 「🎯 嚴格全中 (AND)」模式：若用戶開啟嚴格模式且結果為 0，系統會自動啟動**友善 Fallback 推薦機制**，展示「雖然未有產品完全符合所有條件，但為你推薦符合最多項的熱門計劃」，絕不出現冷冰冰的空白畫面。

---

## 🛡️ 避坑歷史與實戰經驗手冊 (Battle-Tested Lessons Learned)

承接此專案時，必須牢記以下經血汗調試總結出的實戰避坑經驗：

### 💡 坑 1：GSAP ScrollTrigger `.method-pin` 覆蓋跳變陷阱
- **問題現象**：用戶在首頁向下滾動到「人壽保險」後，突然出現藍十字、安盛、蘇黎世的疊層視窗及紅印章圖案，釘死在螢幕正中，徹底遮擋了下方危疾、意外、汽車、家傭、寵物等保險類別。
- **根本原因**：`CategoryGrid.tsx` 中的保險數據是通過非同步 fetch 載入的。初次 mount 時類別列表為空陣列 `[]`，容器高度僅約 150px。其後的 `MethodStory.tsx` 初始化 `ScrollTrigger.create({ trigger: rootRef.current, start: 'top top', pin: '.method-pin' })`，記錄了極靠前的 trigger 位置（約 1200px）。當數據載入完成，11 個類別卡片撐開至 1400px+ 時，ScrollTrigger 誤以為滾動已到達 `MethodStory`，於是將 `.method-pin` 強行轉換為 `position: fixed; top: 0` 釘在視口中央！
- **黃金防禦措施**：
  1. `CategoryGrid.tsx` **必須內置靜態 fallback 類別列表**（由 `CATEGORY_ORDER` 與 `CATEGORY_META` 構建），確保初次 render 瞬間即擁有 1400px+ 的完整高度，徹底消除高度突變。
  2. 外層容器必須加上 `relative z-10 bg-paper`，提供不透光的實體圖層隔離。
  3. 在 `InsuranceDataProvider.tsx` 或數據載入回調中，**必須執行 `ScrollTrigger.refresh()`**，重新校準視口滾動觸發點。

### 💡 坑 2：生硬 AND 篩選導致用家沮喪 (The Strict AND Trap)
- **問題現象**：當用戶在保險類別勾選 3–4 個心儀保障（例如旅遊保險勾選「租車自負額 + 數碼器材 + 任何原因取消 + 郵輪保障」），傳統 SQL 式的 AND 邏輯會立刻返回 0 筆產品，給用家極大挫敗感。
- **黃金防禦措施**：全面改用 `calculateProductFeatureMatches` 評分排序。在 UI 上提供「智能契合度推薦」，將選中標籤的產品依命中數量降序排列，卡片直觀標示命中率 Badge，並以高亮 Chip 顯示命中了哪些條件。嚴格模式若得 0 筆，自動平滑 Fallback。

### 💡 坑 3：舊年份失效 PDF 鏈接指紋 (Stale Document Fingerprints)
- **問題現象**：部分產品可能殘留 2016–2022 年舊宣傳單張或舊條款代碼（例如 `utravelins_tc_2016.pdf`、`pw-travelwise-25-10-19-v1.pdf`），導致用戶點擊時 404 或條款早已修改。
- **黃金防禦措施**：
  - 定期透過 Python 審計腳本檢查 `insurance-data.json` 中的 `document` 與 `url` 年份標籤。
  - 所有非醫療類別產品必須引用 2024–2026 年保險公司現行官方 PDF，並確保 URL 具備公開 HTTP 200 可訪問性。

### 💡 坑 4：自願醫保 (VHIS) 官方數據同步原則
- **官方單一真實來源**：`vhis.gov.hk` 官方公開 CSV 與 Excel 是 VHIS 的唯一權威數據來源。
- **更新機制**：執行 `python3 scripts/build_vhis.py` 即可全自動下載最新數據、解析保費表並重新合併至 `vhis-plans.json` 與 `insurance-data.json`。
- **特別注意**：
  - 已退市機構（Allianz S00030, ZA S00045, 安達人壽 S00015）僅保留在認可名單名錄，絕不可列入前台比較產品。
  - 只供現有保單續保之計劃（Renewal-only）必須標註「只供現有保單續保」，不可作為常規新單展示。

### 💡 坑 5：行動端 Mobile 篩選體驗與觸控規範
- **觸控目標**：手機端所有篩選 Chips 與按鈕必須具備 `>= 44px` 的 Tap Target，符合 WCAG AAA 標準。
- **滾動定位**：`FilterBar` 在 Mobile 端使用 Sticky 定位時，避免高頻 re-render 造成抖動；多選條件時在 Mobile Sticky Bar 常駐顯示「已選 X 項條件 (點擊展開)」。

---

## 🧪 質量門禁與發布檢查清單 (Quality Gates & Testing)

在向 `master` 分支提交任何變更前，必須依序通過以下 5 道門禁：

### 1. 遞增版本號與 Build Number
- 檢查 `src/lib/version.ts` 及 `package.json`，確保版本號與構建編號已正確遞增。

### 2. ESLint 代碼規範檢查
```bash
npm run lint
```
- **嚴格標準**：總錯誤數不得超過 22 個 baseline 錯誤。任何修改過的文件必須 0 Lint Error！

### 3. TypeScript 編譯與 Vite 打包
```bash
npm run build
```
- **嚴格標準**：`tsc -b && vite build` 必須 100% 通過（通常 5–15 秒完成），並在 `dist/` 目錄中生成正確的靜態檔案。

### 4. 84,000+ 組合極限回歸測試
當有修改過濾系統 (`feature-filters.ts`)、產品數據庫 (`insurance-data.json`) 或比較模組時，必須執行回歸測試套件：
```bash
npx tsx scripts/verify_filter_combinations.ts
npx tsx scripts/verify_filter_boundary_deep.ts
```
- **覆蓋標準**：
  - 11 個類別所有單選與雙選組合（3,200+ 斷言）全部 PASS。
  - 全域極端多選組合、Persona 預設、邊界輸入（80,858+ 斷言）全部 PASS。
  - 零崩潰、零 Uncaught Exception、零 NaN 分數。

### 5. Git Commit & Push
```bash
git add src/ package.json public/ ...
git commit -m "feat/fix: <俐落清晰的繁體中文或英文提交訊息>"
git push origin master
```
- 推送後 Cloudflare Pages 會自動觸發構建與線上部署，線上正式環境約 1–2 分鐘內生效。

---

## 🗣️ Agent 風格與溝通指引

- **主語言**：香港粵語（廣東話），無論思考過程 (Thinking) 定係輸出回覆，均以流暢自然之粵語撰寫。
- **個性風格**：幽默直率、專業俐落、切中要害、有主見且具備前瞻性批判思維。拒絕官腔廢話，絕不盲目附和。
- **Emoji 運用**：適量且貼切運用 Emoji（如 🐶🚗✈️🛡️📊✨🔥🎯），提升排版閱讀舒適感。
- **任務交付原則**：每次完成階段性任務，清楚向 Tommy 回報：
  1. 具體修改咗邊啲核心檔案與邏輯；
  2. 運行咗邊啲質量驗證與測試結果；
  3. 當前版本號與線上部署狀態。
