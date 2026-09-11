# 🧭 香港保險比價網站維護總手冊 (Maintenance Master Hub)

> ⚡ **給接手 AI Agent 的極速指南**：  
> 你不需要讀取整個專案幾萬行代碼！依照你的任務，**點擊下方對應目錄，只讀取 1 至 2 份精簡文件即可完成工作**，節省 90% 以上 Token！

---

## 🗺️ 1. 快速導航與模組傳送門 (Quick Index)

### 📌 通用基礎與核心架構
- 🏛️ [`core-rules-and-architecture.md`](./core-rules-and-architecture.md) — 數據 Schema、三大鋼鐵紀律、條款衝突仲裁原則、版本號與門禁指令（必讀 2 分鐘）

---

### 🛠️ 依任務類型選擇操作手冊 (Task Workflows)

| 你的維護任務 | 對應 SOP 手冊（點擊直達） | 預計耗時 |
| :--- | :--- | :--- |
| **純更新保費 / 折扣碼 / Promo** | 📄 [`workflows/update-pricing-and-promo.md`](./workflows/update-pricing-and-promo.md) | 2 分鐘 |
| **保險公司更換 PDF 條款 / 校對引文** | 📄 [`workflows/update-pdf-terms-and-quotes.md`](./workflows/update-pdf-terms-and-quotes.md) | 3 分鐘 |
| **上架一款全新保險產品** | 📄 [`workflows/add-new-product.md`](./workflows/add-new-product.md) | 5 分鐘 |
| **下架 / 標記停售舊產品** | 📄 [`workflows/deprecate-product.md`](./workflows/deprecate-product.md) | 2 分鐘 |

---

### 📂 依保險類別查閱專項情報 (11 大 Category 專項手冊)

每份類別手冊均包含：**該類別所有產品清單、官方報價直達 URL、官方 PDF 鏡像路徑、關鍵引用頁數、免責與自負額 Logic、常見筆誤避坑指南**。

| 類別編號與名稱 | 涵蓋產品數 | 核心賠償 Logic 關鍵字 | 專項維護手冊（按需讀取） |
| :--- | :---: | :--- | :--- |
| ✈️ **01 旅遊保險 (Travel)** | 20 款 | 手機爆屏每件限額、緊急運送事前核准、自負額 $200 | 📄 [`categories/01-travel.md`](./categories/01-travel.md) |
| 🏥 **02 自願醫保 (Medical)** | 28 款 | 標準計劃法定分項封頂、SMM 共同保險 15%-20% | 📄 [`categories/02-medical.md`](./categories/02-medical.md) |
| 💎 **03 高端醫療 (High-End)** | 10 款 | 每年/終身限額、5檔自負額($0-$8萬)、亞洲/全球 | 📄 [`categories/03-high-end-medical.md`](./categories/03-high-end-medical.md) |
| 🩺 **04 補充醫療 (Top-Up)** | 7 款 | 需以公司團體醫保抵銷自負額、賠償差額 80%-90% | 📄 [`categories/04-top-up-medical.md`](./categories/04-top-up-medical.md) |
| 🕊️ **05 定期人壽 (Life)** | 14 款 | 100% 自選保額(Sum Assured)、純定期 0% ROP | 📄 [`categories/05-life.md`](./categories/05-life.md) |
| 🫀 **06 危疾保險 (Critical)** | 13 款 | 重疾 100% 診斷定額賠付、早期預支 20%-25%、癌症 3 年等候期 | 📄 [`categories/06-critical-illness.md`](./categories/06-critical-illness.md) |
| 🩹 **07 個人意外 (Accident)** | 14 款 | 身故 100%、傷殘等級表 5%-100%、骨折津貼、跌打分項 | 📄 [`categories/07-accident.md`](./categories/07-accident.md) |
| 🏠 **08 家居保險 (Home)** | 16 款 | 水損自負額 $1,000-$3,000、貴重物品每件限額且總額限 1/3 | 📄 [`categories/08-home.md`](./categories/08-home.md) |
| 🐾 **09 寵物保險 (Pet)** | 11 款 | 共同保險 70%-80% (主人自負 20%-30%)、AVID 晶片、門診上限 | 📄 [`categories/09-pet.md`](./categories/09-pet.md) |
| 🚗 **10 汽車保險 (Motor)** | 13 款 | 法定第三者人傷 1 億/財損 200 萬、全保司機累積墊底費 | 📄 [`categories/10-motor.md`](./categories/10-motor.md) |
| 🧹 **11 家傭保險 (Helper)** | 12 款 | 僱員補償 1 億、門診 $150-$300、住院 2.5 萬-3 萬、更換津貼 | 📄 [`categories/11-domestic-helper.md`](./categories/11-domestic-helper.md) |

---

## 🗓️ 2. 保險市場年度運營與更新日曆 (Annual Operations Calendar)

香港保險市場具備鮮明的**季節性消費節奏與監管周期**。維護者可依照以下日曆安排季度與月度更新任務，確保全站數據走在市場最前端：

```
                    ┌── Q1 (1-3月) ─── 農曆新年外遊促銷 ＆ 開年迎新危疾回贈 ───┐
                    │                                                           │
                    ├── Q2 (4-6月) ─── 稅季自願醫保 (VHIS) 狂潮 ＆ 復活節旅遊保 ─┤
     香港保險市場   │                                                           │
     年度運營節奏   ├── Q3 (7-9月) ─── 暑期家庭外遊 ＆ 海外留學生保 ＆ 外傭換約 ─┤
                    │                                                           │
                    └── Q4 (10-12月) ── 聖誕跨年雪季 ＆ 年底車險續保 ＆ 新年改版 ┘
```

| 季度 (月份) | 市場核心焦點與季節熱度 | 涉及重點險種 | 維護者專項運營動作清單 |
| :--- | :--- | :--- | :--- |
| **Q1**<br>(1月 - 3月) | 🧨 **農曆新年外遊潮**<br>🧧 **開年迎新保費回贈** | ✈️ 旅遊保險 (`travel`)<br>🫀 危疾保險 (`critical-illness`)<br>🕊️ 定期人壽 (`life`) | 1. **更新旅遊保 Promo**：保司通常於 1 月中旬推出長假限時 7 折至 8 折 Promo Code。<br>2. **校對開年危疾回贈**：核對首年保費折扣（常有 10%-20% 首期折扣）或免費體檢附加條款。<br>3. **清退過期年末優惠**：清理 Q4 遺留之已失效 Promo Code，避免用戶無法套用。 |
| **Q2**<br>(4月 - 6月) | 💼 **報稅季 (Tax Season)**<br>🐣 **復活節小長假出遊** | 🏥 自願醫保 (`medical`)<br>💎 高端醫療 (`high-end-medical`)<br>✈️ 旅遊保險 (`travel`) | 1. **全量核對 VHIS 扣稅條款**：醫保局與保司於 4-5 月發布年度扣稅通函，每名受保人上限 HK$8,000。<br>2. **更新年度保費調幅**：保險公司常於 4 月 1 日調整醫療險費率，需批次複查各年齡層保費表。<br>3. **更新復活節短途旅遊特惠**：亞洲、日韓、大灣區短途旅遊保險優惠碼上線。 |
| **Q3**<br>(7月 - 9月) | 🏖️ **暑假親子外遊高峰**<br>🎓 **新學年海外留學啟航**<br>🧹 **外傭合約換約續簽潮** | ✈️ 旅遊保險 (`travel`)<br>🧹 家傭保險 (`domestic-helper`)<br>🩹 個人意外 (`accident`) | 1. **留學生特選保障巡檢**：更新留學保險特有之「學業中斷」、「家長緊急探訪」及海外醫療專項。<br>2. **暑假家庭計劃保費對齊**：多數保司提供「隨行兒童免費」或「家庭劃一收費」，校對 `premium_notes`。<br>3. **家傭保險全面盤點**：7-9 月為外傭續約高峰，校對各保司僱員補償 1 億與門診網絡卡新規。 |
| **Q4**<br>(10月 - 12月) | ❄️ **年終聖誕跨年雪季**<br>🚗 **車輛牌照續期與車險高峰**<br>📢 **新年度保單修訂預告** | 🚗 汽車保險 (`motor`)<br>🏠 家居保險 (`home`)<br>✈️ 旅遊保險 (`travel`) | 1. **汽車保險續保清查**：四季度為私家車續保高峰，核查各保司 NCD 轉移條款與電動車 (EV) 專屬保障。<br>2. **冰雪極限運動不保事項校驗**：冬季滑雪熱門，嚴格校驗旅遊保之「業餘滑雪」免責與自負額條款。<br>3. **年度全站條款指紋大審計**：保司於 11-12 月公布次年條款，進行全庫 PDF SHA-256 指紋覆核。 |

---

## 🎯 3. 三步極速維護心法 (The 3-Step Routine)

```text
[步驟 1] 確定目標 ➔ 喺上方表格搵到對應嘅 Category 手冊打開
[步驟 2] 修改數據 ➔ 照住手冊入面嘅官方 URL 與 Schema 更新 public/data/insurance-data.json
[步驟 3] 執行驗收 ➔ 更新 version.ts 並運行全套門禁指令 (npm test && npm run build)
```

遵循此體系，任何 AI Agent 均可在無需理解整個龐大前端代碼庫的前提下，完成零失誤的季度、月度保險數據運營與條款升級！🚀
