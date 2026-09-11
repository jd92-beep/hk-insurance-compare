# 🏥 自願醫保 (VHIS) 維護手冊 (02-medical)

> 🧭 [返回維護總手冊](../README.md) ｜ 🏛️ [核心架構與規則](../core-rules-and-architecture.md) ｜ 🗓️ [年度運營日曆](../README.md#🗓️-2-保險市場年度運營與更新日曆-annual-operations-calendar)

> **定位宗旨**：專門收錄醫務衞生局認可之「標準計劃 (Standard)」及「靈活計劃 (Flexi)」。適合新手或 Agent 於 30 秒內秒懂核心規律並完成條款/保費更新！⚡

---

## 🎯 類別定位與維護核心心法

1. **認可編號金剛箍（Certification Number）**：
   - 每款合資格自願醫保必有政府認可編號：`S00xxx` 代表標準計劃（Standard），`F00xxx` 代表靈活計劃（Flexi）。
   - 保險公司改名可以好隨意，但認可編號係官方唯一真理！若產品名稱更動，以 [vhis.gov.hk 官方名單](https://www.vhis.gov.hk/tc/consumer_corner/list-plans.html) 爲準。
2. **標準計劃全港統一封頂（Standard Plan Benchmarks）**：
   - 每年保障限額：**HK$420,000**（不設終身限額）。
   - 病房及膳食：**每日 HK$750**（每年最多 180 日）。
   - 雜費：**每年 HK$18,800**。
   - 手術費：按分級封頂——小型 **$5,000**、中型 **$12,500**、大型 **$25,000**、複雜 **$50,000**（麻醉費為手術費之 35%，手術室費為手術費之 35%）。
   - 訂明非手術癌症治療：**每年 HK$80,000**；訂明診斷成像檢測（CT/MRI/PET）：**每年 HK$20,000（設 20% 共同保險）**。
3. **靈活計劃（Flexi Plan）升級關鍵**：
   - 通常調高每年保額（數百萬至千萬）、提升病房級別（半私家/私家房），或附加 SMM（額外醫療保障）。
   - 切忌將靈活計劃嘅「自負額 / SMM 條款」與標準計劃混淆。
4. **法定三大金牌條款**：
   - **保證續保至 100 歲**（不論索償紀錄及健康變化）。
   - **未知的投保前已有病症等待期**：第 1 年 0%、第 2 年 25%、第 3 年 50%、第 4 年起 100% 賠償。
   - **扣稅額**：每名受保人每個課稅年度最高 **HK$8,000**。

---

## 📋 全部產品官方更新情報速查表（共 28 款產品）

| Product ID | 保險公司 | 產品名稱 | 官方產品/報價頁 URL | 官方條款 PDF 網址與本地鏡像路徑 (`/docs/brochures/...`) | 關鍵引用頁數與章節 | 更新頻率 / 特別注意事項 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `medical-aia` | 友邦保險 (AIA) | AIA自願醫保標準／靈活／尊耀／睿選計劃 | [官方官網](https://www.aia.com.hk/zh-hk/products/health/vhis-flexi) | [官方條款](https://www.vhis.gov.hk)<br>`/docs/brochures/aia-ceo-medical-brochure.pdf` | 保障表 p.4 / 條款第 4 頁 | 每年檢視；涵蓋 S00013、F00022、F00074、F00081 |
| `medical-axa` | 安盛 (AXA) | 智尊守慧／守慧醫療保障 | [官方官網](https://www.axa.com.hk/zh/axa-wiseguard-pro-medical-insurance-plan) | [官方條款](https://www.vhis.gov.hk)<br>`/docs/brochures/axa-smart-medicare-smm.pdf` | 保障表 p.14 / 條款第 14 頁 | 每年檢視；智尊守慧為靈活計劃，設 SMM 附加契約 |
| `medical-asia-insurance` | 亞洲保險 (Asia Insurance) | 延愛／亞洲尚選自願醫保計劃 | [官方官網](https://www.asiainsurance.hk/tc/personal-insurance/medical-insurance) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00030/S00030-01-000-02-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | 標準計劃認可編號 S00030，條款嚴格依循標準表 |
| `medical-avo` | 安我保險 (Avo) | Avo自願醫保（標準）計劃 | [官方官網](https://www.heyavo.com/zh-hk/products/vhis) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00043/S00043-01-000-02-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | 純網上虛擬保險，標榜零佣金直銷，認可編號 S00043 |
| `medical-boc-group-insurance` | 中銀集團保險 (BOC Group Insurance) | 中銀標準／靈活自願醫保計劃認可產品 | [官方官網](https://www.bocgins.com/index.html?target=vhis) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00035/S00035-01-000-02-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | 標準 S00035、靈活 F00028；注意同中銀人壽 (BOC Life) 區分 |
| `medical-boc-life` | 中銀人壽 (BOC Life) | 中銀人壽標準自願醫保／非凡守護靈活自願醫保 | [官方官網](https://www.boclife.com.hk/tc/product/smartviva-flexi-vhis.html) | [官方條款](https://www.boclife.com.hk/tc/product/smartviva-flexi-vhis.html)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 產品手冊 p.1 / 保障表 p.36 | 標準 S00022、靈活 F00057；非凡守護提供高達 3,300 萬保額 |
| `medical-blue-cross` | 藍十字 (Blue Cross) | 「只衛您」標準／靈活自願醫保計劃 | [官方官網](https://www.bluecross.com.hk/ch/VHIS/Information) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00032/S00032-01-000-02-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | S00032、F00043、F00059；靈活版設有額外醫療保障選項 |
| `medical-bowtie` | 保泰人壽 (Bowtie) | Bowtie 自願醫保（標準／靈活／Pink） | [官方官網](https://www.bowtie.com.hk/zh/insurance/vhis) | [官方PDF](https://www.bowtie.com.hk)<br>`/docs/brochures/bowtie-pink-vhis.pdf` | 保障表 p.2-4 | 虛擬保險代表，Pink 為高端全數賠償，標準為 S00027 |
| `medical-bupa` | 保柏 (Bupa) | Bupa Hero 保柏非凡自願醫保計劃 | [官方官網](https://www.bupa.com.hk/tc/medical-insurance/vhis-info/) | [官方PDF](https://www.bupa.com.hk)<br>`/docs/brochures/bupa-elite-brochure.pdf` | 保障手冊 p.1 / p.8 | 認可編號 F00040，靈活計劃旗艦，專注私家房與全數賠償 |
| `medical-china-life-overseas` | 中國人壽（海外） (China Life) | 衛您健康醫療保險計劃／健康常伴 | [官方官網](https://www.chinalife.com.hk/zh-hk/products/insurance/medical-protection) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00021/S00021-01-000-02-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | 標準計劃認可編號 S00021，靈活計劃認可編號 F00016 |
| `medical-china-taiping` | 中國太平 (China Taiping) | 太平自願醫療標準保險計劃 | [官方官網](https://www.hk.cntaiping.com/product/110860.html) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00016/S00016-01-000-02-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | 產險牌照承保，標準計劃編號 S00016 |
| `medical-china-taiping-life` | 中國太平人壽（香港） (China Taiping Life) | 太平人壽自願醫保標準／靈活計劃 | [官方官網](https://life.hk.cntaiping.com/product/vhis/) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00039/S00039-01-000-02-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | 壽險牌照承保，標準 S00039、靈活 F00046 |
| `medical-chow-tai-fook-life` | 周大福人壽 (CTF Life) | 「卓康保」／「樂康保」醫療保障計劃 | [官方官網](https://www.ctflife.com.hk/tc/products/health-protection/vhis/) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00028/S00028-01-000-03-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | 原富通保險 (FTLife) 改名，認可編號 S00028、F00024 |
| `medical-chubb-life` | 安達人壽 (Chubb Life) | 安達自願醫保（標準／靈活）計劃 | [官方官網](https://www.chubb.com/hk-zh/personal/health-insurance/vhis.html) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00044/S00044-01-000-03-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | 認可編號 S00044、F00055 |
| `medical-cigna` | 信諾 (Cigna) | 信諾自願醫保系列（優越／靈活／標準） | [官方官網](https://www.cigna.com.hk/zh-hant/medical-insurance/vhis/) | [官方PDF](https://www.cigna.com.hk/iwov-resources/docs/VMIS/VMIS_VHIS_TC.pdf)<br>`/docs/brochures/cigna-vhis-flexi-superior.pdf` | 保障條款 p.4 / p.18 | 優越版 F00029、標準 S00018；信諾已被安達集團收購但品牌維持 |
| `medical-dah-sing` | 大新保險 (Dah Sing) | 大新保險「尚護康」自願醫保標準計劃 | [官方官網](https://www.dahsinginsurance.com/product/vhis) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00019/S00019-01-000-03-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | 標準計劃認可編號 S00019 |
| `medical-fwd` | 富衛 (FWD) | 尊衛您／更衛您／隨意保標準計劃 | [官方官網](https://www.fwd.com.hk/online-insurance/vhis-vprime-medical-plan/) | [官方PDF](https://www.fwd.com.hk)<br>`/docs/brochures/fwd-vprime-premier.pdf` | 保障表 p.3 / p.22 | 尊衛您 F00045（高端靈活）、隨意保 S00036 |
| `medical-hsbc-life` | 滙豐人壽 (HSBC Life) | 滙豐自願醫保靈活／標準計劃 | [官方官網](https://www.hsbc.com.hk/zh-hk/insurance/products/medical/vhis-flexi/) | [官方條款](https://www.vhis.gov.hk)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 產品手冊 p.62 / 標準表 p.36 | 靈活計劃 F00049，標準計劃 S00026；銀行通路客群大 |
| `medical-hong-kong-life` | 香港人壽 (Hong Kong Life) | 「摯健樂」基本／「倍健樂」醫療計劃 | [官方官網](https://www.hklife.com.hk/tc/products/personal-insurance/medical-protection/) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00037/S00037-01-000-02-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | 標準計劃 S00037、靈活計劃 F00032 |
| `medical-liberty-international` | 利寶國際 (Liberty) | 利寶國際自願醫保標準／靈活計劃 | [官方官網](https://www.libertyinsurance.com.hk/zh-hk/personal/vhis/) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00017/S00017-01-000-02-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | 標準計劃 S00017、靈活計劃 F00015 |
| `medical-msig` | 三井住友 (MSIG) | 自願醫保計劃-適健保／優健保 | [官方官網](https://www.msig.com.hk/zh-hant/personal-insurance/vhis) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00029/S00029-01-000-02-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | 適健保 S00029（標準）、優健保 F00027（靈活） |
| `medical-manulife` | 宏利 (Manulife) | 宏利晉悅／全護航／自願醫保標準計劃 | [官方官網](https://www.manulife.com.hk/zh-hk/individual/products/health/vhis/voluntary-health-insurance-scheme/manulife-supreme-vhis-flexi-plan.html) | [官方條款](https://www.manulife.com.hk)<br>`/docs/brochures/manulife-manumaster-smm.pdf` | 保障表 p.1 / p.4 | 晉悅 F00041、全護航 F00019、標準 S00034 |
| `medical-prudential` | 保誠 (Prudential) | 保誠自願醫保尚賓／靈活自主／摯稱心 | [官方官網](https://www.prudential.com.hk/tc/products/health/medical/prudential-VHIS-series/) | [官方條款](https://www.prudential.com.hk)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 產品小冊子 p.1 / 標準表 p.36 | 尚賓 F00031、靈活自主 F00064、自主醫保標準 S00023 |
| `medical-sun-life` | 永明金融 (Sun Life) | 永明港卓越／港無憂／港稱心／港健康 | [官方官網](https://www.sunlife.com.hk/zh-hant/insurance/health/voluntary-health-insurance-scheme/wehealth-preferred/) | [官方PDF](https://www.sunlife.com.hk/content/dam/sunlife/regional/hong-kong/documents/WeHealth_Prestige_TC.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 產品條款 p.45 / 標準表 p.36 | 港卓越 F00063、港稱心 F00017、港健康 S00015 |
| `medical-well-link-life` | 立橋人壽 (Well Link Life) | 立安心自願醫保標準／靈活計劃 | [官方官網](https://www.wll.com.hk/tc/product/health/vhis) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00040/S00040-01-000-02-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | 標準計劃 S00040、靈活計劃 F00042 |
| `medical-yf-life` | 萬通保險 (YF Life) | 「稅」優惠／「稅」安心醫療計劃 | [官方官網](https://www.yflife.com.hk/tc/products/health-protection/vhis) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00025/S00025-01-000-02-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | 稅優惠 S00025、稅安心 F00020 / F00065 |
| `medical-zurich` | 蘇黎世保險 (Zurich) | 蘇黎世自願醫保（「智選守護」／「智選無憂+」） | [官方官網](https://www.zurich.com.hk/zh-hk/individuals/health-insurance/vhis) | [官方PDF](https://www.zurichcare.com.hk/UAf/uaf_ch/lib/pdf/G19006%20VHIS%20Brochure_CN_online.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 產品手冊 p.44 / 標準表 p.36 | 智選守護 S00031、智選無憂+ F00034 |
| `medical-bolttech` | 保特保險 (bolttech) | 智適簡／智適選自願醫療保險計劃 | [官方官網](https://www.bolttechinsurance.hk/zh-hk/vhis) | [官方PDF](https://www.vhis.gov.hk/doc/certifiedplan/sp/S00012/S00012-01-000-03-PlanDoc-c.pdf)<br>`/docs/brochures/vhis-standard-plan-terms.pdf` | 標準條款保障表 p.36 | 原富衛保險轉讓業務（前稱 FWD General），標準 S00012 |

---

## 🛠️ 常規更新步驟 (Step-by-Step SOP)

### 1. 遇到保費變更點改？
1. 打開 `public/data/insurance-data.json`。
2. 搜尋該產品 ID（例如 `"id": "medical-bowtie"`）。
3. 找到 `premium_range`、`premium_notes` 及 `premium_available`。
4. **標準計劃保費來源**：以 [vhis.gov.hk 官方標準保費一覽表 Excel](https://www.vhis.gov.hk/tc/consumer_corner/list-plans.html) 爲準（30 歲男/女年繳保費），填入 `premium_range`。
5. **靈活計劃保費來源**：按保司最新保費小冊子更新 `premium_notes` 註明自負額檔次（如 HK$0 / HK$20,000 / HK$50,000）。
6. 保留免責宣告字眼：「標準保費按年齡釐定並於續保時調整；未包括保費徵費、折扣及附加保費等；詳見官方保費表」。

### 2. 遇到保險公司更新 PDF 條款點換？
1. 將保司官方或 vhis.gov.hk 下載嘅最新 PDF 下載至本機。
2. 命名規範存入 `public/docs/brochures/`（全小寫英數字及底線/破折號，例如 `vhis-fwd-vprime-2026.pdf`）。
3. 運行清單雜湊更新腳本：
   ```bash
   node scripts/build_pdf_manifest.mjs
   ```
4. 在 `insurance-data.json` 中更新該產品對應項目：
   - `coverage[].source_url`: 改為 `/docs/brochures/新檔案名.pdf#page=頁數`
   - `coverage[].page`: 改為精確頁碼（整數）
   - `coverage[].quote`: 節錄該頁出現嘅精準字眼（不准腦補！）
   - `citations`: 同步更新對應引用紀錄。

### 3. 邊啲常見誤區千祈唔好踩？⚠️
- ❌ **誤區一：手術費、麻醉費、手術室費大兜亂！**
  - 自願醫保標準表下，手術費（Surgeon's Fee）按手術分級（小型 $5,000 至複雜 $50,000）；而麻醉費（Anaesthetist's Fee）與手術室費（Operating Theatre Fee）**各自獨立上限為該手術費限額之 35%**！千祈咪將 35% 寫落手術費本體！
- ❌ **誤區二：將靈活計劃認可編號與標準計劃混淆！**
  - 同一間公司（如 Bowtie）同時有 Standard（S00027）、Flexi Regular（F00010）、Flexi Plus（F00011）、Pink（F00037 等）。更新靈活計劃時，唔好 overwrite 咗標準計劃嘅條款！
- ❌ **誤區三：忘記「未知的投保前已有病症」法定 3 年等待期！**
  - 只有自願醫保先有法定 0% / 25% / 50% / 100% 條款。不可寫成「即時 100% 全包」或「終身不保」。
- ❌ **誤區四：將普通靈活計劃吹成「全數賠償」！**
  - 普通靈活計劃（設細項封頂 + SMM）同高端醫療靈活計劃（無細項全數賠償）係兩回事，未見「不設分項限額全數賠償」字眼切勿亂標！

---

## 🧪 測試與驗收 Command

改完 `insurance-data.json` 或更新 PDF 之後，必須依序跑以下檢驗命令：

```bash
# 1. 檢查 PDF 鏡像清單雜湊是否同步（若更動了 PDF）
node scripts/build_pdf_manifest.mjs --check

# 2. 驗證資料庫結構與單元測試
npm test

# 3. 驗證代碼與格式規範（零 Warning，零 Error）
npm run lint -- --max-warnings=0

# 4. 驗證醫保篩選器邏輯與邊界條件
npm run test:filters

# 5. 生產環境完整構建驗證
npm run build
```

✅ 通過上述 5 項指令，即可安全提交 PR！

---

## 🔗 相關維護操作指南 (Related Workflows)
- 🏷️ [更新保費與優惠代碼 SOP](../workflows/update-pricing-and-promo.md)
- 📄 [PDF 說明書更新與引用校對 SOP](../workflows/update-pdf-terms-and-quotes.md)
- ➕ [新增保險產品全流程 SOP](../workflows/add-new-product.md)
- 🗄️ [產品停售或歸檔 SOP](../workflows/deprecate-product.md)
- 🧭 [返回維護總手冊](../README.md)

