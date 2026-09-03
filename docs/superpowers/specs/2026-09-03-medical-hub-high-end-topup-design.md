# 醫療保險旗艦樞紐：高端醫療與 Top-up 醫保整合設計規範

- 日期：2026-09-03
- 狀態：已審批設計方向（方案 A）
- 目標：在現有醫療保險（自願醫保 VHIS）基礎上，無縫擴充「高端醫療保險 (High-End Medical)」與「Top-up 醫療保險 (Top-up Medical)」，升級 `/category/medical` 為三合一醫療保險樞紐，同時嚴格保留前人已做好的 VHIS 官方註冊表與標準計劃功能。

---

## 1. 核心原則與邊界

1. **嚴格保留現有 VHIS 成果**：
   - `/vhis` 頁面（`src/pages/Vhis.tsx`）及 `public/data/vhis-plans.json` 保持不變，維持官方 33 標準 + 70 靈活計劃之權威名單定位。
   - `scripts/build_vhis.py` 生成的 28 間保險公司標準計劃數據與官方引用標記（`自願醫保認可產品全覽`）繼續保留。
2. **擴展而非破壞**：
   - `/category/medical` 升級為三維度切換樞紐：
     1. 📋 **自願醫保標準 (VHIS Standard)**（即現有 28 間官方標準計劃全覽）
     2. 💎 **高端醫療保險 (High-End Medical)**（全數賠償、千萬保額、自付費選項、VHIS 扣稅 vs 國際私家醫療）
     3. 💼 **打工仔 Top-up 醫保 (Top-up Medical)**（配合公司醫保填補 Shortfall、高自付費自願醫保 vs 獨立 Top-up、離職保證續保權）
3. **數據真實與官方引用（Citations）**：
   - 每個新增的高端及 Top-up 產品均具備真實官方文件引用（brochure / 產品條款 / 官方保費表），不捏造數據。

---

## 2. 數據模型設計（Data Model）

### 2.1 產品分類標籤
在 `src/types/insurance.ts` 的 `Product` 介面中新增可選欄位（完全向後兼容）：
```typescript
export type MedicalSubtype = "vhis-standard" | "high-end" | "top-up";

export interface Product {
  // 現有欄位保持不變
  id: string;
  category: string;
  insurer: string;
  insurer_zh: string;
  product_name: string;
  product_name_zh: string;
  plan_tiers: string[];
  coverage: CoverageItem[];
  premium_range: string;
  premium_available: boolean;
  premium_notes: string;
  key_terms: string[];
  exclusions: string[];
  source_urls: string[];
  documents_found: string[];
  citations?: Citation[];

  // 醫療專屬擴充（可選）
  medical_subtype?: MedicalSubtype;
  deductibles?: string[];      // 例如 ["HK$0", "HK$16,000", "HK$25,000", "HK$50,000"]
  annual_limit?: string;       // 例如 "HK$10,000,000"
  room_tier?: string;          // "普通房" | "半私家房" | "標準私家房"
  is_vhis_eligible?: boolean;  // 是否可享自願醫保扣稅
  has_cashless?: boolean;      // 是否支援出院免找數 / 醫療卡直付
  guaranteed_renewal?: string; // 例如 "保證續保至100歲" 或 "終身保證續保"
}
```

### 2.2 收錄旗艦產品清單
1. **高端醫療（High-End Medical）**：
   - **VHIS 認可高端靈活計劃**：
     - `medical-bowtie-pink`: Bowtie Pink 自願醫保（普通房/半私家/私家房，$0/$2萬/$5萬/$8萬 墊底費）
     - `medical-aia-prestige`: AIA 自願醫保尊耀計劃（半私家/私家房，HK$1,000萬-$2,500萬保額）
     - `medical-bupa-hero`: Bupa Hero 非凡自願醫保計劃（半私家/私家房，HK$2,500萬-$3,500萬保額）
     - `medical-fwd-vprime`: FWD 尊衛您醫療計劃（半私家/私家房，HK$1,250萬-$1,600萬保額）
     - `medical-axa-wiseguard-pro`: AXA 智尊守慧醫療保障（全數賠償，多種自付額）
     - `medical-prudential-apex`: 保誠自願醫保尚賓計劃（私家房，千萬保額）
   - **非 VHIS 國際私家醫療（IPMI）**：
     - `medical-bupa-global-elite`: Bupa Global 保柏環球「卓康健 (Elite)」（全球頂級私家醫療，無上限/極高保額）
     - `medical-cigna-global`: Cigna Global Health Options（模組化全球高端醫療）
     - `medical-axa-global-elite`: AXA 寰宇特選醫療保障（跨境大灣區直付、國際頂級支援）

2. **Top-up 醫療（Top-up Medical）**：
   - **專門獨立 Top-up 產品**：
     - `medical-bupa-topup`: 保柏易增值 (Bupa Top-up)（免核保銜接公司醫保，離職保證續保）
     - `medical-bowtie-combat`: Bowtie 觸木保（意外門診醫療加強）
   - **高自付費高端自願醫保（Top-up 玩法推薦）**：
     - Bowtie Pink（$2萬/$5萬 自付費 Top-up 方案）
     - Bupa Hero（$1.2萬/$4萬 自付費 Top-up 方案）
     - FWD 尊衛您（$1.6萬/$2.5萬 自付費 Top-up 方案）
     - AIA 尊耀（$1.6萬/$2.5萬 自付費 Top-up 方案）

---

## 3. 前端介面與互動設計（UI / UX）

### 3.1 醫療類別頁首三模式 Tab（`CategoryDetail.tsx`）
在 `/category/medical` 頁面的 S1 頁首下方，新增專屬切換卡片：
- Tab 1: **📋 自願醫保標準計劃 (VHIS Standard)**（28 份官方產品，標準條款，保費曲線）
- Tab 2: **💎 高端醫療全數賠償 (High-End Medical)**（全數賠償、私家房、千萬保額、免找數、VHIS扣稅標籤）
- Tab 3: **💼 打工仔 Top-up 醫保 (Top-up Medical)**（配合公司醫保、墊底費配搭、無縫銜接權）

### 3.2 模式專屬特點導引區（Interactive Insight Cards）
- **高端醫療模式**：
  - 「全數賠償點樣賠？（無細項上限解構）」
  - 「自付費（墊底費）點揀最慳保費？」
  - 「VHIS 扣稅版 vs 國際私家醫療（非VHIS）對照表」
- **Top-up 模式**：
  - 「公司醫保缺口匹配指南：3 步配搭最啱墊底費」
  - 「離職/轉工真空期如何防範？認清 Conversion 轉保權」

### 3.3 比較工具升級（`canonical-benefits.ts`）
更新 `MEDICAL` 標準行定義，納入高端與 Top-up 專屬行：
- `full-cover`: 全數賠償保障範圍
- `deductibles`: 自付費（墊底費）選項
- `cashless`: 出院免找數 / 醫療卡直付
- `room-tier`: 涵蓋病房級別（普通房/半私家/私家房）
- `vhis-tax`: 自願醫保稅務扣除資格（每年最高 $8,000）
- `conversion-right`: 離職/退休保證轉保權

---

## 4. 驗證與測試指標

1. `npm run build` 必須零報錯通過（TypeScript + Vite）。
2. `public/data/vhis-plans.json` 與 `/vhis` 頁面完全不受影響，功能如初。
3. 切換 3 大模式時，產品列表、篩選器與保費排序正確反應對應子類別。
4. 比較頁面勾選高端或 Top-up 產品時，全數賠償與自付費維度精準對齊。
