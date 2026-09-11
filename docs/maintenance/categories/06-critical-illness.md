# 🩺 危疾保險維護指南 (06-critical-illness.md)

> 🧭 [返回維護總手冊](../README.md) ｜ 🏛️ [核心架構與規則](../core-rules-and-architecture.md) ｜ 🗓️ [年度運營日曆](../README.md#🗓️-2-保險市場年度運營與更新日曆-annual-operations-calendar)

> **適用目錄**：`public/data/insurance-data.json`（分類：`critical-illness`，共 13 款產品）  
> **閱讀時間**：30 秒即睇即改 ⚡ | **目標**：極低 Token 損耗、傻瓜式維護、零低級錯誤

---

## 🧭 一、類別定位與維護核心心法

危疾保險（Critical Illness）係香港市場最複雜、條款最長、精算定義最刁鑽嘅險種。Agent 睇產品單張或更新 JSON 時，必須死守以下 **6 大核心心法**：

1. **早期危疾 / 原位癌預支賠償（Advance Payment）：扣減主險保額！**
   - 原位癌（Carcinoma-in-situ）、早期甲狀腺癌、通波仔（冠狀動脈血管成形術）通常賠 **20%–25% 保額**（每項通常設上限 HK$240,000–$400,000 或 US$30,000–$50,000）。
   - ⚠️ **切記注意**：呢筆錢絕大多數係**從「主險保額」中直接扣減（Pre-advance）**，未來嚴重危疾賠償或身故賠償會相應減少，並非額外無償贈送！
2. **癌症多重賠償等候期：3 年 vs 1 年係分水嶺！**
   - **癌症多重保障**：不論係新發、復發、轉移或持續存在，標準等候期通常為 **3 年**（由前一次癌症確診日起計）。
   - **非癌症（心臟病 / 中風）**：等候期通常為 **1 年**。
   - **持續癌症現金津貼 / 入息保障**：如宏利「宏健守護」或富衛等計劃，每月/每年發放的癌症支援金，等候期可縮短至 1 年，維護時必須分清是「整筆多重保額」還是「每月入息津貼」。
3. **90 日首發等候期（Qualifying Period）**：
   - 絕大部分危疾保單生效日起計設有 **90 日等候期**（意外導致者除外）。在 90 日內確診或出現相關病徵，保單作廢拒賠（僅退還已繳保費）。
4. **良性腫瘤切除 / 早期病變保障**：
   - 近代新旗艦產品（如友邦、宏利、富衛）相繼引入「良性腫瘤切除手術」（如乳房、卵巢、甲狀腺良性腫瘤），賠償額約為 5%–15% 保額。此類通常屬額外自願保障，維護時要看清楚是否扣減主保額。
5. **深切治療部（ICU）未知疾病保障**：
   - 新型危疾必備項目：若受保人因任何傷病（包括未列名之傳染病或未知疾病）入住合資格 ICU 連續指定時數（通常為 120 小時 / 連續 5 日，並使用侵入性呼吸機），可預支或全數索償高達 100% 保額。
6. **定期消費型（Term CI）vs 終身儲蓄分紅型（Whole Life CI）**：
   - **純危疾（Bowtie、ZA、Blue）**：無現金價值、無分紅，保費隨年齡階梯上升，但性價比極高，官網直接有透明費率表。
   - **終身分紅型（友邦、保誠、宏利、富衛、永明）**：固定供款期（10/20/25年），有保證及非保證紅利，保費因人而異需顧問報價。

---

## 📊 二、全部產品官方更新情報速查表（共 13 款）

| Product ID | 保險公司 | 產品名稱 | 官方產品/報價頁 URL | 官方條款 PDF 網址與本地鏡像路徑 (`/docs/brochures/...`) | 關鍵引用頁數與章節 | 更新頻率 / 特別注意事項 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `critical-illness-aia` | 友邦保險 (AIA) | 「自在人生」危疾保障計劃2 / 首護摯愛 | [官方產品頁](https://www.aia.com.hk/zh-hk/products/health/on-your-side-insurance-plan-2) | [官方冊子 PDF](https://www.aia.com.hk/content/dam/hk/en/pdf/product-brochure/individuals/onyoursideinsuranceplan2/onyoursideinsuranceplan2_en.pdf)<br>鏡像：`/docs/brochures/aia-onyoursideinsuranceplan2_en.pdf` | p.5 (癌症多重賠償), p.8 (深切治療ICU保障), p.12 (良性病變) | 半年檢；友邦旗艦產品，良性腫瘤及持續癌症現金賠償 |
| `critical-illness-axa` | 安盛 (AXA) | 「愛護同行」危疾保（加強版）/ 愛寶保 | [官方產品頁](https://www.axa.com.hk/zh/total-assure-plus-critical-illness) | 官方線上產品冊子<br>鏡像：`待補充鏡像` | 官網產品利益說明書 (早期危疾20%、母嬰愛寶保特設保障) | 半年檢；涵蓋孕婦及初生嬰兒先天性疾病保障 |
| `critical-illness-boc-life` | 中銀人壽 | 危疾188終身保險計劃（涵蓋197種疾病） | [官方產品頁](https://www.boclife.com.hk/tc/product/best-care-critical-illness-plan.html) | [官方單張 PDF](https://www.boclife.com.hk/tc/media/ci188tc.pdf)<br>鏡像：`/docs/brochures/bochk-ci188tc.pdf` | p.3 (197種疾病清單), p.6 (多重危疾索償), p.9 (保費表示例) | 半年檢；中銀旗艦，受保病況數量達 197 種（全港前列） |
| `critical-illness-blue` | Blue 保險 | 「WeCare 109% 回贈危疾保」 | [官方產品頁](https://www.blue.com.hk/zh/wecare-3-in-1-protector) | [官方條款 PDF](https://www.blue.com.hk/assets/pdf/product/wecare_109-_refundable_critical_illness_protector-en.pdf)<br>鏡像：`/docs/brochures/blue-21015372-wecare_109-_refundable_critical_illness_protector-en.pdf` | p.2 (滿期 109% 保費回贈), p.4 (三大常見危疾保障) | 季檢；全港首個純網上 109% 保費回贈危疾保，保費極透明 |
| `critical-illness-bowtie` | 保泰人壽 (Bowtie) | Bowtie 危疾保（定期危疾保險） | [官方在線報價頁](https://www.bowtie.com.hk/zh/insurance/critical-illness) | 官方公開條款與費率表<br>鏡像：`待補充鏡像` | 官網費率計算器 (35歲男性保額100萬月繳約HK$187) | 季檢；純消費型無儲蓄成分，非吸煙標準體保費全港極具競爭力 |
| `critical-illness-fwd` | 富衛保險 (FWD) | 危疾緻尚保系列 / 自主揀 MyCover | [官方旗艦頁](https://www.fwd.com.hk/zh/critical-illness/crisis-onemaster-series/) | 官方產品小冊子<br>鏡像：`待補充鏡像` | 官網保障規格 (特定器官原位癌25%、心腦血管額外津貼) | 季檢；旗艦線走分紅多重保障，MyCover 走網上自選親民路線 |
| `critical-illness-hsbc-life` | 滙豐人壽 | 滙豐「迅衛」危疾保障計劃 | [官方產品頁](https://www.hsbc.com.hk/zh-hk/insurance/products/critical-illness/swift-guard/) | 官方條款細則說明書<br>鏡像：`待補充鏡像` | 官網利益說明 (10年期滿可獲101%保費回贈) | 半年檢；網上直購，5年供款保10年，期滿回贈已繳保費 101% |
| `critical-illness-manulife` | 宏利保險 | 宏健守護危疾入息保障 | [官方產品頁](https://www.manulife.com.hk/zh-hk/individual/products/health/critical-illness-protection/incomeguard-critical-illness-protector.html) | [官方小冊子 PDF](https://www.manulife.com.hk/content/dam/insurance/hk/en/documents/products/health/incomeguard-critical-illness-protector.pdf)<br>鏡像：`待補充鏡像` | p.4 (持續入息支援), p.5 (癌症/心臟病/中風最短間隔1年發放) | 半年檢；主打危疾入息現金流，癌症診斷後按年發放賠償 |
| `critical-illness-prudential` | 保誠保險 | 保誠「守護健康」危疾加倍保 III | [官方產品頁](https://www.prudential.com.hk/tc/products/health/critical-illness/pruhealth-critical-illness-extended-care-iii/) | [官方手冊 PDF](https://www.prudential.com.hk/content/dam/prudential-phkl/pdf/en/brochure/pruhealth-critical-illness-extended-care-iii-product-brochure.pdf)<br>鏡像：`/docs/brochures/prudential-pruhealth-critical-illness-extended-care-iii-product-brochure.pdf` | p.3 (高達總額860%保障), p.4 (良性腫瘤切除), p.5 (深切治療ICU保障) | 季檢；保誠主力旗艦，多重索償總保額高達 860% |
| `critical-illness-sun-life` | 永明金融 | 永明危疾家康保 / 萬家康尊尚保 | [官方產品頁](https://www.sunlife.com.hk/zh-hant/insurance/health/critical-illness/) | [官方單張 PDF](https://www.sunlife.com.hk/content/dam/sunlife/regional/hong-kong/documents/SunHealth-LovePromise_PB_EN.pdf)<br>鏡像：`/docs/brochures/sunlife-sunhealth-lovepromise_pb_en.pdf` | p.21 (188種受保疾病清單), p.10 (中風及心臟病多次賠償) | 半年檢；市場罕見將家庭成員（子女/配偶）納入延伸防護網 |
| `critical-illness-generali` | 忠意保險 (Generali) | 忠意保險「加愛無限保」 | [官方產品頁](https://www.generali.com.hk/zh-hk/life-insurance/critical-illness/lionguardian) | 官方線上產品規格表<br>鏡像：`待補充鏡像` | p.1 (涵蓋138種疾病、無限次癌症賠償) | 半年檢；主打無上限次數癌症多重賠償，每次 100% |
| `critical-illness-chubb-life` | 安達人壽 (Chubb) | 安達人壽「摯為您危疾保」 | [官方產品頁](https://www.chubb.com/hk-zh/personal/life-insurance/critical-illness.html) | 官方產品單張<br>鏡像：`待補充鏡像` | p.1 (涵蓋128種疾病、早期危疾20%-25%預支) | 半年檢；涵蓋早期危疾、原位癌及兒童嚴重疾病 |
| `critical-illness-za-insure` | 眾安人壽 (ZA Insure) | 眾安人壽「ZA 危疾保」 | [官方報價頁](https://insure.za.group/hk/critical-illness) | 官方在線產品條款<br>鏡像：`待補充鏡像` | p.1 (確診即賠100萬、免體檢最快3分鐘核保出單) | 季檢；純互聯網保險，極簡健康告知，無儲蓄純保障 |

---

## 🛠️ 三、常規更新步驟 (Step-by-Step SOP)

### 1. 遇到危疾條款擴充（例如新增「良性腫瘤手術」或「未知傳染病 ICU 保障」）點改？
- **定位檔案**：`public/data/insurance-data.json`
- **修改範例**（新增 ICU 津貼項目到 `coverage`）：
```json
{
  "claim_field": "coverage",
  "category": "critical_illness_extension",
  "item_name": "深切治療部（ICU）危疾保障",
  "limit": 1000000,
  "limit_description": "最高可預支/索償 100% 基本保額（以 HK$1,000,000 為上限）",
  "condition": "受保人因未知疾病或傷病連續入住合資格 ICU 達 120 小時或以上，並需使用侵入性呼吸輔助器"
}
```

### 2. 遇到純定期危疾保費調整（如 Bowtie / ZA 調整費率）：
- **定位檔案**：`public/data/insurance-data.json` 對應 ID 的 `premium_range` 與 `premium_notes`
```json
{
  "id": "critical-illness-bowtie",
  "premium_range": "35歲非吸煙男性（保額 HK$1,000,000）：標準計劃月繳約 HK$192 起；45歲約 HK$438 起（保費隨年齡每5年調整）",
  "premium_notes": "純保障定期保單，不設儲蓄成分及紅利，保費保證首5年不變，續保時按年齡調整。"
}
```

### ⚠️ 避坑指南：邊啲低級錯誤千祈唔好踩！
1. ❌ **「預支賠償」寫成「額外賠償」**：
   - 原位癌賠 20% 絕大多數係**扣除主險額**！如果寫成「額外贈送 20%」，客去投訴實賠死！只有註明「額外保障（Additional Benefit）」先唔扣主險。
2. ❌ **癌症等候期 3 年 vs 1 年搞亂**：
   - 傳統多重癌症賠償必須間隔 **3 年**；如果寫成 1 年，會誤導讀者以為年年都可以攞一筆過保額。
3. ❌ **殘缺字串與數字混亂**：
   - 嚴禁出現 `HK,000` 或 `HK,500,000` 殘缺字樣，必須嚴格格式化為 `HK$1,000,000`。
4. ❌ **分紅產品捏造固定保費**：
   - 保誠、友邦等儲蓄分紅危疾無公開均一價，必須註明「需向顧問報價（視乎年齡、吸煙習慣及供款年期）」，不可亂抄單一業務員報價當成全港通用！

---

## 🧪 四、測試與驗收 Command

修改危疾資料後，必須執行以下標準驗收流程：

```bash
# 1. 驗證 JSON 結構無語法錯誤
node -e 'require("./public/data/insurance-data.json"); console.log("JSON 結構正確 ✅");'

# 2. 跑篩選器及危疾類別測試
npm run test:filters

# 3. 跑全項目 Vitest 測試套件
npm test

# 4. 嚴格 ESLint 檢查（零錯誤零警告）
npm run lint -- --max-warnings=0

# 5. 生產打包構建驗證
npm run build
```

---

## 🔗 相關維護操作指南 (Related Workflows)
- 🏷️ [更新保費與優惠代碼 SOP](../workflows/update-pricing-and-promo.md)
- 📄 [PDF 說明書更新與引用校對 SOP](../workflows/update-pdf-terms-and-quotes.md)
- ➕ [新增保險產品全流程 SOP](../workflows/add-new-product.md)
- 🗄️ [產品停售或歸檔 SOP](../workflows/deprecate-product.md)
- 🧭 [返回維護總手冊](../README.md)

