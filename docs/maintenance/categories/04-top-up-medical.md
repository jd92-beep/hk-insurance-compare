# 🛡️ Top-up 補充醫療 (Top-up Medical) 維護手冊 (04-top-up-medical)

> 🧭 [返回維護總手冊](../README.md) ｜ 🏛️ [核心架構與規則](../core-rules-and-architecture.md) ｜ 🗓️ [年度運營日曆](../README.md#🗓️-2-保險市場年度運營與更新日曆-annual-operations-calendar)

> **定位宗旨**：專門收錄銜接公司醫保、填補細項封頂 Shortfall 嘅補充醫療保障（共 7 款）。打工仔避坑必備！新手 Agent 30 秒秒明維護指南！⚡

---

## 🎯 類別定位與維護核心心法

1. **「打工仔防爆 Cap 神器」核心定位**：
   - 香港大部分僱員雖然有公司團體醫保（Group Medical），但往往細項上限極低（例如每日病房得 $500-$800、手術費上限得萬零蚊），一旦大病住院必定「打爆 Cap」要自己硬食差額（Shortfall）。
   - Top-up 補充醫療（又稱額外醫療保障 SMM - Supplementary Major Medical 或差額保險）就係為咗**「無縫承接爆額開支」**而誕生！
2. **理賠順序三部曲（Claim Order）**：
   - ⚠️ **切記理賠不可倒轉**：
     1. **第一層**：先向僱主公司醫保（或已有嘅基本個人醫保）索償。
     2. **中轉站**：取得公司醫保發出之「理賠結算書（Settlement Voucher / Claims Statement）」及蓋印之醫療收據副本。
     3. **第二層**：將剩餘未獲足額賠償之合資格開支（Shortfall），交由 Top-up 保單賠付。
3. **共同保險比率（Co-insurance %）**：
   - 傳統 SMM 通常設有 **80% 或 85%** 賠償比率（即保險公司賠 80-85%，受保人需自擔 15-20% 共同保險）。
   - 新一代自負額型 Top-up 於超過自負額後可提供高達 **100%** 全數賠償。維護時必須精確標明共同保險百分比！
4. **獨立保單 (Standalone) vs 附加契約 (Rider)**：
   - **獨立保單**（如 Bupa Top-up 保柏易增值）：任何人只要有任何一間香港合法僱主醫保即可獨立購買，無須綑綁。
   - **附加契約**（如 AIA Extra Medic、保誠 MediExtra）：必須附屬喺該保司嘅特定個人基本住院主單之上。
5. **離職轉換權益（Conversion Privilege）**：
   - 優秀嘅 Top-up 計劃常附帶「離職保證轉換權」：打工仔轉工或退休失去公司醫保時，可於指定天數內免體檢直接轉為常規個人全面醫保。

---

## 📋 全部產品官方更新情報速查表（共 7 款產品）

| Product ID | 保險公司 | 產品名稱 | 官方產品/報價頁 URL | 官方條款 PDF 網址與本地鏡像路徑 (`/docs/brochures/...`) | 關鍵引用頁數與章節 | 更新頻率 / 特別注意事項 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `topup-aia-extra-medic` | 友邦保險 (AIA) | AIA友邦「額外醫療保障」附加契約（Extra Medic） | [官方官網](https://www.aia.com.hk/zh-hk/products/health/extra-medic) | [官方條款](https://www.aia.com.hk/zh-hk/products/health/extra-medic)<br>`/docs/brochures/aia-ceo-medical-brochure.pdf` | 保障表 p.4 / 條款第 4 頁 | 每年檢視；屬附加契約（Rider），配合個人住院主險填補 Shortfall |
| `topup-axa-smart-excess` | 安盛保險 (AXA) | AXA安盛「守慧附加差額」醫療保險（Smart Excess） | [官方官網](https://www.axa.com.hk/zh/smart-excess) | [官方條款](https://www.axa.com.hk/zh/smart-excess)<br>`/docs/brochures/axa-smart-medicare-smm.pdf` | 保障表 p.14 / 條款第 14 頁 | 每年檢視；專為銜接本港各類團體醫保設計，每年上限高達 200 萬 |
| `topup-bowtie-combat` | 保泰人壽 (Bowtie) | Bowtie「觸木保」個人意外醫療加強保障 | [官方官網](https://www.bowtie.com.hk/zh/insurance/accident/combat) | [官方條款](https://www.bowtie.com.hk/zh/insurance/accident/combat)<br>`/docs/brochures/bowtie-pink-vhis.pdf` | 保障表 p.2 / 條款第 2 頁 | 專攻門診、跌打、物理治療及意外受傷超額補貼；獨立純保障 |
| `topup-bupa-carepro` | 保柏（亞洲） (Bupa) | 保柏「保柏易增值」醫療保障計劃（Bupa Top-up） | [官方官網](https://www.bupa.com.hk/tc/individual/medical-insurance/top-up/) | [官方條款](https://www.bupa.com.hk)<br>`/docs/brochures/bupa-carepro-topup.pdf` | 產品手冊 p.1 / 條款第 1 頁 | 業界最經典獨立 Top-up，無須主單；離職保證免核保轉換 Bupa 個人醫保 |
| `topup-cigna-plus` | 信諾環球 (Cigna) | 信諾「附加醫療保障」SMM Plus | [官方官網](https://www.cigna.com.hk/zh-hant/medical-insurance/vhis/) | [官方條款](https://www.cigna.com.hk)<br>`/docs/brochures/cigna-vhis-flexi-superior.pdf` | 保障表 p.18 / 條款第 18 頁 | 每年額外醫療保額達 220 萬，深度對接企業僱主保單 |
| `topup-fwd-supplementary` | 富衛保險 (FWD) | FWD富衛「補足您」超額補充醫療（FWD Top-up） | [官方官網](https://www.fwd.com.hk/online-insurance/vhis-vcare-medical-plan/) | [官方條款](https://www.fwd.com.hk)<br>`/docs/brochures/fwd-vprime-premier.pdf` | 保障表 p.22 / 條款第 22 頁 | 每年度額外提供高達 250 萬醫療保障；靈活配合自選免賠額 |
| `topup-prudential-mediextra` | 保誠保險 (Prudential) | 保誠「附加醫療保」PRUHealth MediExtra | [官方官網](https://www.prudential.com.hk/tc/products/health/medical/) | [官方條款](https://www.prudential.com.hk)<br>`/docs/brochures/cigna-vhis-flexi-superior.pdf` | 保障表 p.18 / 條款第 18 頁 | 附加契約性質；補貼手術及住院各項超額差額，高達 150 萬 |

---

## 🛠️ 常規更新步驟 (Step-by-Step SOP)

### 1. 遇到保費變更點改？
1. 開啟 `public/data/insurance-data.json`。
2. 搜尋對應 Top-up ID（如 `"id": "topup-bupa-carepro"`）。
3. 檢查以下欄位：
   - `premium_range`：確認每月或每年保費基準（Top-up 普遍較平，每月數十元至二三百元）。
   - `premium_notes`：清晰列明是否必須持有主保單，或是否必須擁有僱主團體醫療保單作爲前置條件。
   - `key_terms`：檢查共同保險比率（如 80% 或 85%）及每年限額。

### 2. 遇到保險公司更新 PDF 條款點換？
1. 下載官方最新小冊子或附加條款合約。
2. 存入 `public/docs/brochures/`（例：`bupa-carepro-2026.pdf`）。
3. 執行雜湊登記：
   ```bash
   node scripts/build_pdf_manifest.mjs
   ```
4. 在 `insurance-data.json` 中更新該產品對應項目嘅 `source_url`、`page` 及 `quote`，確保有頁數佐證。

### 3. 邊啲常見誤區千祈唔好踩？⚠️
- ❌ **誤區一：誤將「附加契約 (Rider)」當成「獨立保單 (Standalone)」介紹！**
  - 如果係附加契約（如 AIA Extra Medic、保誠 MediExtra），客戶無嗰間公司嘅基本醫保主單係**買唔到**嘅！必須於備註明確標明「附加契約」定「獨立保單」。
- ❌ **誤區二：忽視 15% - 20% 共同保險 (Co-insurance)！**
  - 唔好盲目寫「所有爆額費用全數賠償」！絕大多數傳統 SMM 都有 20% 共同保險條款，即超額部分保司賠 80%，客自己仲要出 20%。
- ❌ **誤區三：誤以為可以直接跳過第一層醫保索償！**
  - Top-up 條款嚴格規定：**必須先經第一層醫保索償**。若受保人無先向公司醫保索償就直接申報，保司會先扣除一個「虛擬免賠額（Notional Deductible）」或拒賠。
- ❌ **誤區四：意外門診 Top-up 與疾病住院 SMM 混淆！**
  - Bowtie 觸木保屬於「意外傷害專項加強」，包跌打、物理治療及門診意外；而 Bupa CarePro、AIA Extra Medic 則係「住院疾病及手術 SMM」。兩者保障標的截然不同，不可張冠李戴！

---

## 🧪 測試與驗收 Command

修改完成後，請依序執行驗證指令確保專案品質：

```bash
# 1. 檢查 PDF 鏡像清單雜湊一致性
node scripts/build_pdf_manifest.mjs --check

# 2. 執行全套單元測試
npm test

# 3. 執行嚴格代碼規範檢查（零警告規範）
npm run lint -- --max-warnings=0

# 4. 驗證過濾器邊界邏輯
npm run test:filters

# 5. 生產構建測試
npm run build
```

🎉 5 個驗證全 PASS，即可放心出 PR！

---

## 🔗 相關維護操作指南 (Related Workflows)
- 🏷️ [更新保費與優惠代碼 SOP](../workflows/update-pricing-and-promo.md)
- 📄 [PDF 說明書更新與引用校對 SOP](../workflows/update-pdf-terms-and-quotes.md)
- ➕ [新增保險產品全流程 SOP](../workflows/add-new-product.md)
- 🗄️ [產品停售或歸檔 SOP](../workflows/deprecate-product.md)
- 🧭 [返回維護總手冊](../README.md)

