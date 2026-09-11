# 💥 個人意外保險維護指南 (07-accident.md)

> **適用目錄**：`public/data/insurance-data.json`（分類：`accident`，共 14 款產品）  
> **閱讀時間**：30 秒即睇即改 ⚡ | **目標**：極低 Token 損耗、傻瓜式維護、零低級錯誤

---

## 🧭 一、類別定位與維護核心心法

個人意外保險（Personal Accident, PA）係保費門檻低但爭議極多嘅險種。Agent 睇條款或者改 JSON 時，一定要捉實以下 **6 大核心心法**：

1. **傷殘等級賠償表（Schedule of Indemnities）：唔係斷隻手指賠 100 萬！**
   - 宣傳單張寫「保額 HK$1,000,000」，意思係「身故」或「雙目完全失明 / 失去雙肢 / 永久完全殘廢」賠 100%。
   - 喪失一隻手或一隻腳賠 **50%**；喪失一眼賠 **50%**；喪失拇指通常賠 **10%–15%**；失去單個指節賠 **2.5%–5%**。維護時必須註明依條款傷殘比例表賠償。
2. **職業等級（Class 1–4）係定價死穴！**
   - **Class 1（文職）**：律師、會計師、文員、程式員，保費最平；
   - **Class 2（非體力外勤）**：地產代理、營業代表、保險中介；
   - **Class 3（輕體力/技工）**：司機、廚師、水電維修工；
   - **Class 4（高危體力勞動）**：搭棚、地盤工人、高空清潔。
   - ⚠️ **重要提示**：受保人轉工若無通知保險公司，出意外時保險公司會**按比例縮減賠償金額**甚至拒賠！
3. **跌打、中醫及針灸限額（Bonesetter / Chinese Medicine）**：
   - 雖然意外醫療（Accidental Medical）總額有 HK$10,000–$50,000，但中醫跌打針灸**每日通常設有上限（如每次 HK$150–$400，全年總額約 HK$2,000–$5,000）**。
4. **「意外」的法律定義：純粹、外來、突發暴力**：
   - 必須符合「外來的、猛烈的及可見的意外（Violent, Accidental, External and Visible means）」。
   - 打羽毛球肌肉勞損、腰椎退化、睡醒落枕、中風暈倒跌傷，保險公司好容易歸類為「身體內在病患（Disease / Degeneration）」而拒絕按意外賠償！
5. **公共交通工具 / 私家車雙倍賠償（Double Indemnity）**：
   - 若以付費乘客身份乘搭陸上公共交通工具（巴士、港鐵、的士、渡輪）或在客用升降機內發生意外身故，保額自動**雙倍翻倍（200%）**。部分高端計劃（如友邦 Xtra Protect）對自駕或節假日甚至有額外加碼。
6. **物理治療與脊醫轉介信要求**：
   - 睇物理治療或脊醫通常需要註冊西醫的「事前轉介信（Referral Letter）」，否則單據可能無法索償。

---

## 📊 二、全部產品官方更新情報速查表（共 14 款）

| Product ID | 保險公司 | 產品名稱 | 官方產品/報價頁 URL | 官方條款 PDF 網址與本地鏡像路徑 (`/docs/brochures/...`) | 關鍵引用頁數與章節 | 更新頻率 / 特別注意事項 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `accident-aia` | 友邦保險 (AIA) | 超卓越個人保障計劃 / Xtra Protect (XP) | [官方產品頁](https://www.aia.com.hk/zh-hk/products/health/xtra-protect) | [官方冊子 PDF](https://www.aia.com.hk/content/dam/hk/en/pdf/product-brochure/individuals/xtraprotect/XtraProtect_ma_en.pdf.coredownload.inline.pdf)<br>鏡像：`/docs/brochures/aia-xtraprotect_ma_en.pdf.coredownload.inline.pdf` | p.5 (意外身故), p.3 (雙倍賠償), p.4 (傷殘級別表) | 半年檢；公共交通、私家車及扶手梯均設有額外倍數賠償 |
| `accident-axa` | 安盛 (AXA) | 「卓越」豐盛守護樂 | [官方產品頁](https://www.axa.com.hk/zh/smartprotect-plus) | 官方線上產品規格表<br>鏡像：`待補充鏡像` | 官網產品條款 (意外醫療費用及跌打津貼) | 半年檢；涵蓋嚴重燒傷、食物中毒、傳染病額外保障 |
| `accident-boc-group-insurance` | 中銀集團保險 | 人身意外綜合保障計劃 | [官方產品頁](https://www.bocgins.com/index.html?target=accident) | [官方條款 PDF](https://www.bochk.com/dam/insurance/coverage_tc.pdf)<br>鏡像：`/docs/brochures/bocgins-pacompchi.pdf` | p.4 (保費表), p.2 (職業等級說明), p.3 (傷殘比例表) | 半年檢；保費明確分職業等級 1 至 4 類，中銀客戶有折扣 |
| `accident-blue-cross` | 藍十字 (Blue Cross) | 個人意外保險（360°保障系列） | [官方投保頁](https://www.bluecross.com.hk/ch/Personal-Accident-Insurance/Application) | [官方單張 PDF](https://ap.bluecross.com.hk/shared/leaflets/Personal_Accident_Leaflet_Chi.pdf)<br>鏡像：`/docs/brochures/ap-personal_accident_leaflet_chi.pdf` | p.2 (保費表及職業分類), p.1 (中醫跌打骨傷保障) | 季檢；跌打中醫每日上限標註清晰，網上投保手續快 |
| `accident-chubb` | 安達保險 (Chubb) | 個人意外保障 (PA/ADD) | [官方產品頁](https://www.chubb.com/hk-zh/personal/accident-insurance.html) | [官方條款 PDF](https://www.chubb.com/hk-zh/personal/accident-insurance.html)<br>鏡像：`/docs/brochures/chubb-p22_paadd_personal_accident_en_0720.pdf` | p.7 (主要條款), p.2 (公共交通雙倍身故賠償) | 半年檢；提供每週暫時不能工作之入息津貼（TTD）選配 |
| `accident-dah-sing` | 大新保險 | 「心意保」個人意外保障計劃 | [官方產品頁](https://www.dahsing.com/html/tc/insurance/general_insurance/personal_protector_insurance_plan.html) | [官方投保書 PDF](https://www.dahsinginsurance.com/b2c/api/fileCenter/file/PPA/proposal_form.pdf)<br>鏡像：`/docs/brochures/dahsinginsurance-proposal_form.pdf` | p.2 (保費率表), p.11 (永久傷殘比例表), p.2 (跌打費用) | 半年檢；家庭投保特設優惠，兒童意外面部矯形保障 |
| `accident-fwd` | 富衛保險 (FWD) | MySafe 意外保障計劃 | [官方投保頁](https://www.fwd.com.hk/online-insurance/mysafe-accident-protection-plan/) | [官方保單條款 PDF](https://www.fwd.com.hk/images/v3/assets/blt563fac53dd3a847c/blte32110ac62806af5/625ebdca058af94c8ab63819/MySafe-Accident-Protection-Plan-Policy-Provisions-Double.pdf)<br>鏡像：`/docs/brochures/fwd-mysafe-accident-policy.pdf` | 官網產品條款 (網上簡易核保、意外醫療卡/無縫索償) | 季檢；純網上直購，設有自選運動受傷升級選項 |
| `accident-msig` | 三井住友 (MSIG) | iSafe 意外保險 | [官方產品頁](https://www.msig.com.hk/isafe) | 官方線上產品規格手冊<br>鏡像：`待補充鏡像` | 官網利益說明 (住院現金津貼、嚴重燒傷賠償) | 季檢；提供意外引致的牙齒修復及物理治療保障 |
| `accident-prudential` | 保誠保險 | 意外保系列（PRUCare 意外保障） | [官方產品頁](https://www.prudential.com.hk/tc/products/health/accident-disability/) | [官方小冊子 PDF](https://www.prudential.com.hk/tc/.galleries/pdf/brochure/prucare-accident-cover-series-product-brochure.pdf)<br>鏡像：`/docs/brochures/prudential-prucare-accident-cover-series-product-brochure.pdf` | p.14 (保費表), p.3 (傷殘等級賠償百分比), p.10 (中醫療程) | 季檢；保障範圍極細緻，特設傷殘改建家居設備資助 |
| `accident-zurich` | 蘇黎世保險 (Zurich) | 「自在守護」個人意外保險計劃 | [官方產品頁](https://www.zurich.com.hk/zh-hk/products/accident-and-health/personal-accident/breezy-care-personal-accident-insurance-plan) | [官方條款 PDF](https://info.zurich.com.hk/policy/PAM-DIR-002-07-2025.pdf)<br>鏡像：`/docs/brochures/info-pam-dir-002-07-2025.pdf` | p.6 (保障項目總覽), p.12 (主要條款), p.13 (不保事項) | 季檢；受保年齡高達 75 歲，意外跌倒醫療支援充裕 |
| `accident-bowtie` | 保泰人壽 (Bowtie) | Bowtie「觸木保」個人意外保 | [官方產品頁](https://www.bowtie.com.hk/zh-hk/touchwood-accident-insurance) | 官方公開條款與費率頁<br>鏡像：`待補充鏡像` | p.1 (月繳 HK$58 起、骨折、脫臼及跌打治療全包) | 季檢；香港性價比極高之數碼意外保，無紙化門診報銷 |
| `accident-blue` | Blue 保險 | Blue「WeCare 個人意外保險計劃」 | [官方產品頁](https://www.blue.com.hk/zh-hk/products/accident/wecare-personal-accident-protection-plan) | 官方產品條款專頁<br>鏡像：`待補充鏡像` | p.1 (純保障網上投保，保額自選最高 HK$2,000,000) | 季檢；保額靈活可隨時線上調校，無任何代理人佣金成本 |
| `accident-generali` | 忠意保險 (Generali) | 忠意保險「智選個人意外保」 | [官方產品頁](https://www.generali.com.hk/zh-hk/general-insurance/personal-accident) | 官方線上產品規格表<br>鏡像：`待補充鏡像` | p.1 (涵蓋 24 小時全球意外、創傷整容手術費用) | 半年檢；特設意外創傷顏面整容重建手術費用賠償 |
| `accident-sun-life` | 香港永明金融 | 永明金融「自在生活意外保」 | [官方產品頁](https://www.sunlife.com.hk/zh-hant/insurance/accident/) | 官方線上產品手冊<br>鏡像：`待補充鏡像` | p.1 (意外斷骨現金賠償、每週暫時完全殘廢津貼) | 半年檢；針對骨折、嚴重燒傷及暫時喪失工作能力津貼 |

---

## 🛠️ 三、常規更新步驟 (Step-by-Step SOP)

### 1. 遇到意外保險保費調整或新增職業階級定價點改？
- **定位檔案**：`public/data/insurance-data.json`
- **修改範例**（更新 `premium_range` 與 `premium_notes`）：
```json
{
  "id": "accident-blue-cross",
  "premium_range": "每年 HK$680 起（Class 1 文職，保額 HK$1,000,000）；Class 2 外勤約 HK$880；Class 3 技工約 HK$1,380",
  "premium_notes": "保費嚴格按職業等級（Class 1–3）劃分；另加保監局徵費。Class 4（高空作業或重工業）需個別核保。"
}
```

### 2. 遇到意外醫療擴充（如跌打津貼加碼或新增物理治療）：
- **更新 `coverage` 陣列**：
```json
{
  "claim_field": "coverage",
  "category": "medical_expenses",
  "item_name": "跌打、中醫及針灸治療保障",
  "limit": 3000,
  "limit_description": "最高賠償每年 HK$3,000（每次事故每日上限 HK$300）",
  "condition": "必須由香港註冊中醫或骨傷科醫師進行治療，需保留附有診斷名稱的正規收據正本"
}
```

### ⚠️ 避坑指南：邊啲低級錯誤千祈唔好踩！
1. ❌ **職業等級張冠李戴**：
   - 意外保險保費標籤必須註明「以 Class 1 文職為基準」。如果將 Class 3 司機的貴保費填在首頁，會嚴重低估產品吸引力；反之亦然。
2. ❌ **中醫跌打「每日限額」漏寫**：
   - 很多產品的中醫保障寫「最高 HK$3,000」，但實際上每日只賠 HK$200！如果唔寫每日上限，用戶去睇跌打一次 Claim HK$1,000 實被保險公司彈單投訴！
3. ❌ **殘缺字串與數字混亂**：
   - 檢查所有金額字串，不可出現 `HK,000` 或 `HK,500,000`。
4. ❌ **忽略高空工作與特定除外責任**：
   - 意外保險常規不保：受酒精影響、未持有效牌照駕駛、參與非法活動、一般自然疾病所致之暈眩跌倒。

---

## 🧪 四、測試與驗收 Command

修改意外保險資料後，必須執行以下標準驗收流程：

```bash
# 1. 驗證 JSON 語法無誤
node -e 'require("./public/data/insurance-data.json"); console.log("意外保險資料結構驗證通過 ✅");'

# 2. 執行過濾器及意外險邏輯單元測試
npm run test:filters

# 3. 跑全項目 Vitest 測試
npm test

# 4. 嚴格 ESLint 檢查
npm run lint -- --max-warnings=0

# 5. 生產構建打包測試
npm run build
```
