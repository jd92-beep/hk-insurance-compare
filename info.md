# hk-insurance-compare 專案技術架構與數據庫藍圖 (Project Blueprint) 🛡️📊

本文件概述本專案目前最新的技術架構、組件拓撲、數據庫分佈與關鍵指標。

---

## 📌 系統關鍵指標 (Key Metrics)

- **當前版本**：`v1.2.1 (Build 20260904.3)`
- **產品總數**：158 款現行最新產品（覆蓋 2024–2026 年最新官方條款）
- **保險類別**：11 大類別（旅遊、自願醫保、高端醫療、差額Top-up、家居、危疾、意外、壽險、汽車、家傭、寵物）
- **保險公司**：39 間標準化 Latin Key 標註公司
- **特點標籤**：147 個專屬條款標籤（0 死標籤，100% 條款匹配）
- **情境預設**：51 個熱門用家場景 (Persona Presets)
- **回歸測試**：84,000+ 組合斷言（全部 PASS）
- **ESLint 基準**：嚴格鎖定 22 個 Baseline 錯誤，新檔案 0 錯誤
- **打包體積**：`npm run build` 生成 `dist/` 耗時 5–15 秒，Vite 7 靜態優化

---

## 🏛️ 目錄與檔案結構

```
hk-insurance-compare/
├── .nvmrc                         # 釘選 Node.js 22
├── package.json                   # 依賴配置與版本號 ("1.2.1")
├── vite.config.ts                 # Vite 7 打包配置
├── tailwind.config.js             # Tailwind CSS 3.4 主題配置 (paper/ink/jade/amber)
├── GEMINI.md                      # Agent 核心記憶、鐵律與避坑指南
├── AGENTS.md                      # 全域 Agent 執行守則
├── README.md                      # 專案首頁說明
├── info.md                        # 本技術架構藍圖
│
├── public/
│   ├── _redirects                 # Cloudflare Pages SPA 路由導向
│   ├── data/
│   │   ├── insurance-data.json    # 核心產品數據庫 (158 款產品 × 11 類別)
│   │   └── vhis-plans.json        # 官方自願醫保認可名單 (103 個認可產品)
│   └── docs/brochures/            # 官方小冊子與保費表 PDF 庫存
│
├── src/
│   ├── lib/
│   │   ├── version.ts             # 集中管理版本號與 Build Number
│   │   ├── feature-filters.ts     # 147 個特點標籤 + 51 個 Persona 預設 + Smart Match 引擎
│   │   ├── categories.ts          # 11 大類別 Meta、排序與保費輔助函數
│   │   └── utils.ts               # cn() 與 UI 輔助工具
│   │
│   ├── pages/
│   │   ├── home/                  # 首頁模組 (Hero, CategoryGrid, MethodStory)
│   │   ├── Categories.tsx         # 類別總覽頁
│   │   ├── CategoryDetail.tsx     # 類別比較與篩選核心頁面 (含 Smart Match 與 Persona)
│   │   ├── ProductDetail.tsx      # 產品詳情頁 (KeyFacts, 保障表格, 官方逐條引文)
│   │   ├── Compare.tsx            # 多產品並排對比頁
│   │   ├── Insurers.tsx           # 39 間保險公司名錄
│   │   ├── Vhis.tsx               # 自願醫保官方名單頁
│   │   ├── Guides.tsx             # 保險指南與名詞詞彙表
│   │   └── About.tsx              # 關於我們與數據標準聲明
│   │
│   ├── components/
│   │   ├── category/              # FilterBar, ProductTable, UniversalComparisonChart
│   │   ├── product/               # ProductCard, KeyFactsCard, SourcesSection
│   │   ├── compare/               # canonical-benefits 對齊對比矩陣
│   │   ├── ui/                    # shadcn/ui 基礎組件 (Button, Badge, Dialog 等)
│   │   ├── Navbar.tsx             # 頂部導航欄與全域搜尋 (⌘K)
│   │   └── Footer.tsx             # 底部頁腳 (已綁定 FULL_VERSION_STRING)
│   │
│   └── providers/
│       ├── InsuranceDataProvider.tsx  # 異步載入 insurance-data.json 並提供 Context
│       ├── CompareProvider.tsx        # 跨頁面對比產品暫存
│       └── SearchProvider.tsx         # 全站快速搜尋狀態管理
│
└── scripts/
    ├── build_vhis.py              # 政府官方 VHIS 數據拉取與生成腳本
    ├── verify_filter_combinations.ts   # 3,200+ 組合自動化測試
    └── verify_filter_boundary_deep.ts  # 80,000+ 極端邊界壓測
```

---

## 🛡️ 資料完整性與防禦機制

1. **版本遞增閉環**：每次變更必須同步修改 `src/lib/version.ts` 與 `package.json`。
2. **ScrollTrigger Pin 安全兜底**：`CategoryGrid.tsx` 使用靜態 11 類別 fallback 避免高度突變，搭配 `ScrollTrigger.refresh()` 徹底杜絕遮擋 bug。
3. **Smart Match 評分**：多選過濾不出現 0 筆冷冰冰畫面，命中最多條件者置頂排列。
4. **真實引文防偽**：全站 1,500+ 條引文均具備文件名、頁碼、原文與官方可訪問 URL。
