# 🏠 家居保險維護指南 (08-home.md)

> 🧭 [返回維護總手冊](../README.md) ｜ 🏛️ [核心架構與規則](../core-rules-and-architecture.md) ｜ 🗓️ [年度運營日曆](../README.md#🗓️-2-保險市場年度運營與更新日曆-annual-operations-calendar)

> **適用目錄**：`public/data/insurance-data.json`（分類：`home`，共 16 款產品）  
> **閱讀時間**：30 秒即睇即改 ⚡ | **目標**：極低 Token 損耗、傻瓜式維護、零低級錯誤

---

## 🧭 一、類別定位與維護核心心法

家居保險（Home Insurance / Household Contents）係理賠頻率極高、涉及鄰舍糾紛與樓宇結構嘅險種。Agent 睇條款或者改 JSON 時，一定要捉實以下 **6 大核心心法**：

1. **水損自負額（Water Damage Excess）：香港 70% 索償嘅最大爭議！**
   - 普通火災、盜竊自負額通常只需 HK$250–$500；
   - 但**水濕損毀（爆水喉、洗衣機漏水、豪雨滲水）自負額通常高達 HK$1,000–$3,000**！
   - ⚠️ **樓齡階梯加成**：若樓齡超過 30 年或 40 年，水損自負額會暴增至 **HK$5,000 或損失金額的 10%–20%**（以較高者為準）！
2. **貴重物品（Valuables）單件限額與 1/3 總額限制**：
   - 雖然家居財物總保額寫高達 HK$1,000,000，但珠寶首飾、手錶、名畫、金飾及皮草：
     - **每件物品上限通常得 HK$10,000–$25,000**；
     - **所有貴重物品合計賠償額，多數保單嚴格限制不得超過家居財物總額的 1/3（約 33.3%）**！
3. **空置期限制（Unoccupancy Clause，30 日至 90 日係死線）**：
   - 絕大多數保單規定：若居所連續空置無人居住超過 **30 天**（少數放寬至 60 日，QBE 為 90 日），空置期間發生之任何水浸、盜竊、水喉爆裂一律**不獲賠償**！
4. **第三者全球公眾法律責任（Third-party Legal Liability）**：
   - 保額普遍為 **HK$5,000,000 至 HK$10,000,000**。
   - 涵蓋範圍極廣：家中漏水滲穿樓下天花破壞名牌裝修、家人開窗不慎鋁窗飛墮落街傷人、或者在街上散步時寵物狗咬傷途人。呢項係業主與租客最核心嘅防禦盾牌。
5. **樓齡上限與物業種類限制**：
   - 一般標準住宅受保樓齡上限為 **40 年至 50 年**（大新最寬可達 60 年，超過年限需驗樓）。
   - 村屋、獨立屋、連天台或花園單位通常需額外加保費或個別核保；**OneDegree 係少數公開宣告村屋及獨立屋免額外加費受保嘅產品**。僭建、劏房（分間單位）一律不保。
6. **手機、電腦等流動裝備不屬基本家居財物**：
   - 手提電話、iPad、Laptop 多數列入除外責任，必須額外購買「全球個人隨身物品保障」附約。

---

## 📊 二、全部產品官方更新情報速查表（共 16 款）

| Product ID | 保險公司 | 產品名稱 | 官方產品/報價頁 URL | 官方條款 PDF 網址與本地鏡像路徑 (`/docs/brochures/...`) | 關鍵引用頁數與章節 | 更新頻率 / 特別注意事項 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `home-axa` | 安盛 (AXA) | SmartHome Plus 家居保險 | [官方產品頁](https://www.axa.com.hk/zh/home-insurance-protection) | [官方小冊子 PDF](https://hk-axa-web-2024.cdn.axa-contento-118412.eu/hk-axa-web-2024/arbv0lprevya4d3b_h726ashz-smarthomeplus-brochure-direct--eng--shz-b-0920d-e-c-h726a-.pdf)<br>鏡像：`/docs/brochures/hk-axa-web-2024-arbv0lprevya4d3b_h726ashz-smarthomeplus-brochure-direct--eng--shz-b-0920d-e-c-h726a-.pdf` | p.2 (財物保障), p.4 (第三者責任1000萬), p.6 (自負額表) | 季檢；大廈維修期間搭棚外牆工程保障、自負額分水損與其他 |
| `home-avo` | Avo 保險 | Avo 家居保障 | [官方產品頁](https://www.heyavo.com/zh-hk/products/home) | 官方線上產品規格手冊<br>鏡像：`待補充鏡像` | 官網利益說明 (電子產品延遲保養、寵物第三者責任) | 季檢；純線上虛擬保險，可按需要自選月繳或特定附加保障 |
| `home-boc-group-insurance` | 中銀集團保險 | 周全家居綜合險 | [官方產品頁](https://www.bochk.com/tc/insurance/family/premier.html) | [官方條款 PDF](https://www.bocgins.com/FileStatic//Proposal_Form/_Banking_Agency/_Household//PremierHomeComprehensiveInsuranceProposalFormTC.pdf)<br>鏡像：`/docs/brochures/bocgins-premierhomecomprehensiveinsurancepolicytc.pdf` | p.3 (家居財物保額), p.4 (水損自負額), p.6 (貴重物品1/3限額) | 半年檢；中銀按揭客戶常有專屬保費折讓，水損自負額清楚 |
| `home-blue-cross` | 藍十字 (Blue Cross) | 家居至專寶 / 家居至專寶+ | [官方投保頁](https://www.bluecross.com.hk/ch/HomeSafe-Protection-Insurance/Information) | [官方手冊 PDF](https://ap.bluecross.com.hk/shared/leaflets/HomeSafe_Protection_Insurance_Direct_Leaflet.pdf)<br>鏡像：`/docs/brochures/ap-homesafe_protection_insurance_direct_leaflet.pdf` | p.2 (保障表), p.4 (樓齡與水損自負額), p.5 (緊急家居支援) | 季檢；設 24 小時緊急開鎖、通渠及電力維修免費轉介支援 |
| `home-china-taiping` | 中國太平 | 居安心保險計劃 | [官方產品頁](https://www.hk.cntaiping.com/product/110849.html) | 官方產品單張<br>鏡像：`待補充鏡像` | 官網產品條款 (火災、盜竊、風暴水浸全包) | 半年檢；傳統大型中資承保，保費性價比高，核保要求標準 |
| `home-chubb` | 安達保險 (Chubb) | 我的家居保險 (MyHomeGuard) | [官方產品頁](https://www.chubb.com/hk-zh/personal/home-insurance.html) | [官方條款 PDF](https://www.chubb.com/hk-zh/personal/home-insurance.html)<br>鏡像：`/docs/brochures/chubb-myhomeguard_2019_agent.pdf` | p.3 (家居財物賠償), p.5 (個人責任), p.8 (貴重品單件上限) | 半年檢；設有酒窖名酒、藝術品特殊自選附加保障 |
| `home-dah-sing` | 大新保險 | 「樂加家」家居保障計劃 | [官方產品頁](https://www.dahsing.com/html/tc/insurance/general_insurance/home_insurance.html) | [官方單張 PDF](https://www.dahsing.com/pdf/wm/WMD_GI_HomeSure.pdf)<br>鏡像：`/docs/brochures/dahsing-wmd_gi_homesure.pdf` | p.5 (保費率表), p.2 (保障範圍), p.4 (受保樓齡高達60年) | 半年檢；受保樓齡可達 60 年（市場少數），但限 3000 呎以內 |
| `home-liberty` | 利寶國際保險 | Home Protector Plus 家居保 | [官方產品頁](https://www.libertyinsurance.com.hk/zh-hk/personal/home/) | 官方線上產品規格表<br>鏡像：`待補充鏡像` | 官網保障規格 (財物自負額低至 HK$250) | 半年檢；基本財物索償自負額僅 HK$250，搬遷保障達 1,000 |
| `home-msig` | 三井住友 (MSIG) | iHome 家居保險 | [官方產品頁](https://www.msig.com.hk/ihome) | 官方產品說明冊子<br>鏡像：`待補充鏡像` | 官網條款章節 (水損按樓齡設 HK$1,000–5,000 自負額) | 季檢；自負額階梯最典型代表，水損依樓齡分級嚴格 |
| `home-onedegree` | OneDegree 保險 | OneDegree 家居保險 | [官方投保頁](https://www.onedegree.hk/zh-hk/home-insurance) | [官方條款 PDF](https://odhk.blob.core.windows.net/home/Homev8.pdf)<br>鏡像：`/docs/brochures/odhk-homev8.pdf` | p.1 (村屋獨立屋不加費), p.9 (不保事項), p.38 (自負額表) | 季檢；村屋獨立屋同價不加費（全港獨家亮點），網上投保透明 |
| `home-qbe` | 昆士蘭保險 (QBE) | 家居綜合保險 | [官方產品頁](https://www.qbe.com/hk/zh-hk/personal-insurance/home-insurance) | [官方保單條款 PDF](https://www.qbe.com/media/qbe/asia/hongkong/files/home-insurance-renewal/qbe_home_policy_wording_mil.pdf)<br>鏡像：`/docs/brochures/qbe-qbe_home_policy_wording_mil.pdf` | p.5 (無索償折扣高達20%), p.14 (個人意外), p.5 (90天未居住條款) | 季檢；空置期放寬至 90 天，無索償折扣最高 20%，特設寵物保障 |
| `home-zurich` | 蘇黎世保險 (Zurich) | 「自在家居」保險（住戶） | [官方投保頁](https://buy.zurich.com.hk) | [官方條款 PDF](https://info.zurich.com.hk/policy/ZHM-DIR-002-04-2023.pdf)<br>鏡像：`/docs/brochures/info-zhm-dir-002-04-2023.pdf` | p.18 (財物保障), p.19 (第三者責任1000萬), p.20 (自負額表) | 季檢；水濕損毀自負額 HK$1,000，特設綠色環保節電續保優惠 |
| `home-hsbc` | 滙豐保險 (HSBC) | 滙豐「家居保險」ResidenceSurance | [官方產品頁](https://www.hsbc.com.hk/zh-hk/insurance/products/home/residencesurance/) | 官方條款專頁<br>鏡像：`待補充鏡像` | 官網利益規格 (家居財物100萬、公眾責任1000萬) | 季檢；滙豐按揭或卓越理財客戶享首年保費優惠及積分回贈 |
| `home-prudential` | 保誠保險 | 保誠精選「家居樂」 | [官方產品頁](https://www.prudential.com.hk/tc/general-insurance/home/) | 官方產品手冊<br>鏡像：`待補充鏡像` | 官網產品條款 (家居財物150萬、全球個人責任1000萬) | 季檢；財物保額高達 150 萬，大廈公契法律責任保障完整 |
| `home-fwd` | 富衛保險 (FWD) | 富衛「易安家」家居保 | [官方產品頁](https://www.fwd.com.hk/online-insurance/home-insurance/) | 官方產品手冊<br>鏡像：`待補充鏡像` | 官網保障表 (不設個別房間分項上限、網上即時報價) | 季檢；全屋財物不設房間分項限制，線上核保極速出單 |
| `home-starr` | 司達保險 (Starr) | 司達保險「泰安心」家居保 | [官方產品頁](https://www.starrinsurance.com.hk/zh-hk/home-insurance) | 官方規格頁面<br>鏡像：`待補充鏡像` | 官網產品細則 (保費低廉親民、基本責任完整) | 季檢；小資族與租客首選，保費每年低至幾百蚊起 |

---

## 🛠️ 三、常規更新步驟 (Step-by-Step SOP)

### 1. 遇到家居保費或促銷代碼更新（如 Zurich HOME20 或 OneDegree 折扣碼）：
- **定位檔案**：`public/data/insurance-data.json`
- **修改範例**（更新 `promo` 及 `premium_range`）：
```json
{
  "id": "home-onedegree",
  "premium_range": "實用面積 400 呎以下：基本計劃折後每年約 HK$980 起；尊尚計劃折後每年約 HK$1,108 起",
  "promo": {
    "tag": "限時 7 折",
    "note": "使用優惠碼【HOME70】投保即享首年保費 7 折，村屋獨立屋劃一收費",
    "buy_url": "https://www.onedegree.hk/zh-hk/home-insurance"
  }
}
```

### 2. 遇到水損自負額或樓齡條款變更點改？
- **更新 `key_terms` 陣列**：
```json
{
  "key_terms": [
    "受保樓齡高達 50 年；村屋及獨立屋無需核保加費",
    "自負額：一般意外損毀每次 HK$500；水濕損毀（爆水喉/滲水）每次 HK$1,000（樓齡逾 35 年者為 HK$3,000 或索償額 10%）",
    "貴重物品（珠寶、手錶等）單件賠償上限 HK$15,000，所有貴重品總額以財物保障 1/3 為限",
    "居所連續空置超過 30 天不保水損及盜竊"
  ]
}
```

### ⚠️ 避坑指南：邊啲低級錯誤千祈唔好踩！
1. ❌ **忽略水損專屬自負額（墊底費）**：
   - 絕不能只填寫一般損毀自負額（如 HK$500）而略過「水損自負額（HK$1,000–$5,000）」！水損佔七成索償，遺漏必遭投訴。
2. ❌ **貴重物品「1/3 總額限制」遺漏**：
   - 很多客人以為家中有 50 萬鑽石首飾可以全額索償。條款必有限制，必須清楚列明「每件上限」及「貴重品總賠償上限為總保額之 1/3」。
3. ❌ **殘缺字串與數字混亂**：
   - 嚴格檢查，禁止出現 `HK,000` 或 `HK–HK`，保額必須嚴謹標註如 `HK$1,000,000`。
4. ❌ **空置期天數搞錯**：
   - 多數保單為連續 30 天，個別產品為 60 或 90 天。切勿將未經確認的天數隨意代入。

---

## 🧪 四、測試與驗收 Command

修改家居保險資料後，必須執行以下驗收步驟：

```bash
# 1. 檢查 JSON 語法完整性
node -e 'require("./public/data/insurance-data.json"); console.log("家居保險資料格式正確 ✅");'

# 2. 測試篩選條件與產品關聯
npm run test:filters

# 3. 執行全套 Vitest 測試
npm test

# 4. 嚴格 ESLint 檢查
npm run lint -- --max-warnings=0

# 5. 生產構建打包測試
npm run build
```

---

## 🔗 相關維護操作指南 (Related Workflows)
- 🏷️ [更新保費與優惠代碼 SOP](../workflows/update-pricing-and-promo.md)
- 📄 [PDF 說明書更新與引用校對 SOP](../workflows/update-pdf-terms-and-quotes.md)
- ➕ [新增保險產品全流程 SOP](../workflows/add-new-product.md)
- 🗄️ [產品停售或歸檔 SOP](../workflows/deprecate-product.md)
- 🧭 [返回維護總手冊](../README.md)

