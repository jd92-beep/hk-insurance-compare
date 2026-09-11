# 🧭 香港保險比價網站維護總手冊 (Maintenance Master Hub)

> ⚡ **給接手 AI Agent 的極速指南**：  
> 你不需要讀取整個專案幾萬行代碼！依照你的任務，**點擊下方對應目錄，只讀取 1 至 2 份精簡文件即可完成工作**，節省 90% 以上 Token！

---

## 🗺️ 1. 快速導航與模組傳送門 (Quick Index)

### 📌 通用基礎與核心架構
- 🏛️ [`core-rules-and-architecture.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/core-rules-and-architecture.md) — 數據 Schema、三大鋼鐵紀律、版本號與門禁指令（必讀 2 分鐘）

---

### 🛠️ 依任務類型選擇操作手冊 (Task Workflows)

| 你的維護任務 | 對應 SOP 手冊（點擊直達） | 預計耗時 |
| :--- | :--- | :--- |
| **純更新保費 / 折扣碼 / Promo** | 📄 [`workflows/update-pricing-and-promo.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/workflows/update-pricing-and-promo.md) | 2 分鐘 |
| **保險公司更換 PDF 條款 / 校對引文** | 📄 [`workflows/update-pdf-terms-and-quotes.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/workflows/update-pdf-terms-and-quotes.md) | 3 分鐘 |
| **上架一款全新保險產品** | 📄 [`workflows/add-new-product.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/workflows/add-new-product.md) | 5 分鐘 |
| **下架 / 標記停售舊產品** | 📄 [`workflows/deprecate-product.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/workflows/deprecate-product.md) | 2 分鐘 |

---

### 📂 依保險類別查閱專項情報 (11 大 Category 專項手冊)

每份類別手冊均包含：**該類別所有產品清單、官方報價直達 URL、官方 PDF 鏡像路徑、關鍵引用頁數、免責與自負額 Logic、常見筆誤避坑指南**。

| 類別編號與名稱 | 涵蓋產品數 | 核心賠償 Logic 關鍵字 | 專項維護手冊（按需讀取） |
| :--- | :---: | :--- | :--- |
| ✈️ **01 旅遊保險 (Travel)** | 20 款 | 手機爆屏每件限額、緊急運送事前核准、自負額 $200 | 📄 [`categories/01-travel.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/categories/01-travel.md) |
| 🏥 **02 自願醫保 (Medical)** | 28 款 | 標準計劃法定分項封頂、SMM 共同保險 15%-20% | 📄 [`categories/02-medical.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/categories/02-medical.md) |
| 💎 **03 高端醫療 (High-End)** | 10 款 | 每年/終身限額、5檔自負額($0-$8萬)、亞洲/全球 | 📄 [`categories/03-high-end-medical.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/categories/03-high-end-medical.md) |
| 🩺 **04 補充醫療 (Top-Up)** | 7 款 | 需以公司團體醫保抵銷自負額、賠償差額 80%-90% | 📄 [`categories/04-top-up-medical.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/categories/04-top-up-medical.md) |
| 🕊️ **05 定期人壽 (Life)** | 14 款 | 100% 自選保額(Sum Assured)、純定期 0% ROP | 📄 [`categories/05-life.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/categories/05-life.md) |
| 🫀 **06 危疾保險 (Critical)** | 13 款 | 重疾 100% 診斷定額賠付、早期預支 20%-25%、癌症 3 年等候期 | 📄 [`categories/06-critical-illness.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/categories/06-critical-illness.md) |
| 🩹 **07 個人意外 (Accident)** | 14 款 | 身故 100%、傷殘等級表 5%-100%、骨折津貼、跌打分項 | 📄 [`categories/07-accident.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/categories/07-accident.md) |
| 🏠 **08 家居保險 (Home)** | 16 款 | 水損自負額 $1,000-$3,000、貴重物品每件限額且總額限 1/3 | 📄 [`categories/08-home.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/categories/08-home.md) |
| 🐾 **09 寵物保險 (Pet)** | 11 款 | 共同保險 70%-80% (主人自負 20%-30%)、AVID 晶片、門診上限 | 📄 [`categories/09-pet.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/categories/09-pet.md) |
| 🚗 **10 汽車保險 (Motor)** | 13 款 | 法定第三者人傷 1 億/財損 200 萬、全保司機累積墊底費 | 📄 [`categories/10-motor.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/categories/10-motor.md) |
| 🧹 **11 家傭保險 (Helper)** | 12 款 | 僱員補償 1 億、門診 $150-$300、住院 2.5 萬-3 萬、更換津貼 | 📄 [`categories/11-domestic-helper.md`](file:///Users/tommy_1/Documents/Projects/Insurance%20comparison/hk-insurance-compare/docs/maintenance/categories/11-domestic-helper.md) |

---

## 🎯 2. 三步極速維護心法 (The 3-Step Routine)

```text
[步驟 1] 確定目標 ➔ 喺上方表格搵到對應嘅 Category 手冊打開
[步驟 2] 修改數據 ➔ 照住手冊入面嘅官方 URL 與 Schema 更新 public/data/insurance-data.json
[步驟 3] 執行驗收 ➔ 更新 version.ts 並運行全套門禁指令 (npm test && npm run build)
```

遵循此體系，任何 AI Agent 均可在無需理解整個龐大前端代碼庫的前提下，完成零失誤的季度、月度保險數據運營與條款升級！🚀
