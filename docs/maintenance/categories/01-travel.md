# ✈️ 旅遊保險維護指南 (01-travel.md)

> **適用目錄**：`public/data/insurance-data.json`（分類：`travel`，共 20 款產品）  
> **閱讀時間**：30 秒即睇即改 ⚡ | **目標**：極低 Token 損耗、傻瓜式維護、零低級錯誤

---

## 🧭 一、類別定位與維護核心心法

旅遊保險係最常有促銷活動（Promo Code）、季節性折扣，同時亦係理賠爭議最多嘅險種。Agent 睇條款或者改 JSON 時，一定要捉實以下 **6 大核心心法**：

1. **緊急醫療運送（SOS）：事前核准係死穴！**
   - 表面保額雖然寫「全額賠償 / 無上限」，但條款 100% 寫明：**必須經保險公司指定 24 小時緊急救援熱線事前同意及全權安排**。如果客人自己叫私人醫療專機返香港，保險公司係分文不賠！
2. **手機 / 隨身電子產品（爆屏與遺失）**：
   - 宣傳單張吹噓「行李保障 HK$20,000」，但**單一物品上限通常得 HK$2,000–$3,000**。
   - 手機通常有獨立分項限額（甚至平價計劃直頭剔除手機），而且多數只賠維修費（爆屏）扣除折舊，絕非賠成部全新 iPhone！
3. **海外醫療 vs 回港覆診**：
   - 「海外醫療費用」（常見 HK$100 萬至 HK$150 萬）包旅行期間睇醫生、住院；
   - 「回港覆診」（通常限 90 日內）上限往往縮到幾萬蚊，當中中醫、跌打或針灸仲有每日上限（例如每次 HK$200–$400，總額 HK$2,000–$4,000）。
4. **單次（Single Trip）vs 全年（Annual Multi-Trip）之別**：
   - **單次旅程**：最長多為 180 日（部分計劃為 90 日或 182 日）。
   - **全年保單**：一年內無限次出遊，但**每次旅程最長通常限 90 日**（個別為 60 日）。超過日數嘅旅程，第 91 日起完全失去保障！
5. **租車自負額（Rental Vehicle Excess）**：
   - 自駕遊租車時，租車公司提供嘅 CDW/LDW 保險通常有自負額（墊底費）。旅遊保險嘅「租車自負額保障」（常見 HK$5,000–$10,000）係幫受保人賠償呢筆墊底費，並非直接賠車輛損壞。
6. **業餘高危活動定義**：
   - 滑雪（必須在持牌官方雪道，非 Off-piste）、水肺潛水（普遍限制深度 30 米內，Starr 罕見不設深度限制只要有合格牌照）。任何職業賽事或特技表演一律不保。

---

## 📊 二、全部產品官方更新情報速查表（共 20 款）

| Product ID | 保險公司 | 產品名稱 | 官方產品/報價頁 URL | 官方條款 PDF 網址與本地鏡像路徑 (`/docs/brochures/...`) | 關鍵引用頁數與章節 | 更新頻率 / 特別注意事項 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `travel-aig` | 美亞保險 (AIG) | 「旅遊智易保」保障計劃 | [官方產品頁](https://www.aig.com.hk/zh/personal/travel-insurance/travelsafe) | [官方 PDF](https://www.aig.com.hk/content/dam/aig/apac/hong-kong/documents/campaign/travel/aig-travelwise-pw.pdf)<br>鏡像：`/docs/brochures/aig-pw-travelwise-25-10-19-v1.pdf` | p.1 (醫療), p.2 (行李), p.4 (取消旅程) | 季檢；超強海外醫療支援，留意自負額條款 |
| `travel-axa` | 安盛 (AXA) | 「卓越」豐盛優遊樂 | [官方報價頁](https://www.axa.com.hk/zh/travel-insurance-protection) | [官方小冊子 PDF](https://hk-axa-web-2020.cdn.axa-contento-118412.eu/hk-axa-web-2020/d0f7ca1c-dc33-44b2-950c-72eaf02b0ef3_axa_hkbn_smarttraveller_plus_pb_chi_20241128r.pdf)<br>鏡像：`/docs/brochures/hk-axa-web-2020-d0f7ca1c-dc33-44b2-950c-72eaf02b0ef3_axa_hkbn_smarttraveller_plus_pb_chi_20241128r.pdf` | p.2 (保障表), p.4 (手機爆屏), p.8 (保費率) | 季檢；常規有網上即時 7 折至 85 折優惠碼 |
| `travel-allianz` | 安聯保險 (Allianz) | 安聯「安聯旅遊保」 | [官方產品頁](https://www.allianz-travel.com.hk/) | 官方在線投保頁<br>鏡像：`待補充鏡像` | 官方專頁全篇規格 | 半年檢；全球救援網絡強，保費分銅、銀、金計劃 |
| `travel-avo` | Avo 保險 | Avo「全球旅遊保障」 | [官方產品頁](https://www.heyavo.com/zh-hk/products/travel) | [條款 PDF](https://www.heyavo.com/zh-hk/products/travel)<br>鏡像：`/docs/brochures/avo-travel-policy-wording-zh.pdf` | p.3 (醫療費用), p.5 (行李延誤) | 虛擬保險年檢；無紙化純網上投保，保費彈性高 |
| `travel-boc-group-insurance` | 中銀集團保險 | 「環宇智選」旅遊保障計劃 | [官方產品頁](https://www.bocgins.com/index.html?target=travel) | [官方小冊子 PDF](https://www.bochk.com/dam/insurance/uTravelIns_tc_2016.pdf)<br>鏡像：`/docs/brochures/bochk-utravelins_tc_2016.pdf` | p.1 (保障概要), p.2 (保費表) | 半年檢；常設中銀信用卡特選客戶折扣（6折至75折） |
| `travel-blue-cross` | 藍十字 (Blue Cross) | 「智在遊」旅遊保險 | [官方投保頁](https://www.bluecross.com.hk/ch/SmartGo-Travel/info) | [官方單張 PDF](https://ap.bluecross.com.hk/shared/leaflets/TravelSmart_Leaflet_Chi.pdf)<br>鏡像：`/docs/brochures/ap-travelsmart_leaflet_chi.pdf` | p.13 (保費表), p.3 (醫療額), p.6 (行李) | 季檢；尊尚/智選雙計劃，手機爆屏賠償明確 |
| `travel-cntaiping` | 中國太平 | 「樂悠遊」海外旅遊保險 | [官方產品頁](https://ebus.hk.cntaiping.com/) | [官方產品單張](https://www.hk.cntaiping.com/product/110849.html)<br>鏡像：`/docs/brochures/cntaiping-13193012hytf.pdf` | p.1 (海外醫療及內地三甲醫院) | 半年檢；大灣區及內地三甲醫院就醫網絡優勢 |
| `travel-chubb` | 安達保險 (Chubb) | 安達度假旅遊保 (TravelWell) | [官方投保頁](https://www.chubbtravelinsurance.com.hk/) | [官方單張 PDF](https://www.chubb.com/hk-zh/personal/leisure-travel-insurance.html)<br>鏡像：`/docs/brochures/hktravelwell-brouchuresingle.pdf` | p.7 (保費表及年齡加成), p.1 (公共交通雙倍賠償) | 季檢；0-79歲受保，65-79歲保費為 1.3 倍 |
| `travel-dah-sing` | 大新保險 | 「智優遊」旅遊保障計劃 | [官方報價頁](https://www.dahsinginsurance.com/b2c/tp/quote) | [官方冊子 PDF](https://www.dahsinginsurance.com/b2c/api/fileCenter/file/BTP/product_brochure.pdf)<br>鏡像：`/docs/brochures/dahsinginsurance-product_brochure.pdf` | p.2 (家庭計劃只收兩人價錢), p.3 (醫療保障) | 半年檢；家庭計劃性價比極高（不限子女數目） |
| `travel-fwd` | 富衛保險 (FWD) | 富衛「自寫意旅遊保」 | [官方投保頁](https://www.fwd.com.hk/online-insurance/mytravel-insurance/) | [官方小冊子 PDF](/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf)<br>鏡像：`/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf` | p.2 (頭等計劃醫療150萬), p.3 (任何原因取消 50%) | 季檢；因任何原因取消旅程賠 50% 係市場亮點 |
| `travel-generali` | 忠意保險 (Generali) | 忠意「忠意旅程安心」 | [官方投保頁](https://bravo.generali.com.hk/) | 官方線上專頁<br>鏡像：`待補充鏡像` | 官方產品規格表 | 半年檢；申根簽證（Schengen）合規，免自負額 |
| `travel-hsbc` | 滙豐保險 (HSBC) | 滙豐「旅遊萬全保」 | [官方產品頁](https://www.hsbc.com.hk/zh-hk/insurance/products/travel/travelsurance/) | 滙豐條款細則專頁<br>鏡像：`待補充鏡像` | 官網保障規格表 (雙倍交通意外賠償) | 季檢；滙豐卓越理財客戶常有專屬保費折讓 |
| `travel-hang-seng` | 恒生保險 | 恒生「旅遊保障計劃」 | [官方產品頁](https://www.hangseng.com/zh-hk/personal/insurance-planning/travel-insurance/) | 恒生條款頁（QBE承保）<br>鏡像：`待補充鏡像` | 官網優越計劃規格 (醫療120萬) | 半年檢；由昆士蘭保險(QBE)承保，信用卡扣賬方便 |
| `travel-msig` | 三井住友 (MSIG) | iTravel Go 單次 / 全年 | [官方產品頁](https://www.msig.com.hk/zh-hk/personal-insurance/travel-insurance) | [官方產品冊子 PDF](https://www.msig.com.hk/sites/msig_hk/files/H1044_iTravel_Go_%28Single%29_23.4.2026_4.pdf)<br>鏡像：`/docs/brochures/msig-h1044_itravel_go__28single_29_23.4.2026_4.pdf` | p.21 (保費表), p.16 (醫療費用), p.13 (自負額) | 季檢；定期更新優惠碼（如 MSIG10 55折、MSIG15 65折） |
| `travel-prudential` | 保誠保險 | 保誠精選「旅遊樂」 | [官方產品頁](https://www.prudential.com.hk/tc/general-insurance/travel-insurance/pruchoice-travel/) | 官方產品手冊<br>鏡像：`待補充鏡像` | 官網條款章節 (全線不設自負額、2年內行李換新) | 季檢；特點全線免墊底費、行李2年內新換舊不扣折舊 |
| `travel-starr` | 司達保險 (Starr) | Starr「卓悅遊」海外旅遊保 | [官方投保頁](https://www.starrinsurance.com.hk/zh-hk/products/travel/travelead) | 官方規格頁面<br>鏡像：`待補充鏡像` | 官方保障表 (水肺潛水無深度限制、租車墊底1萬) | 季檢；潛水迷首選，業餘水肺潛水不設水深限制 |
| `travel-zurich` | 蘇黎世保險 (Zurich) | 「易起行+」旅遊保險計劃 | [官方產品頁](https://www.zurich.com.hk/zh-hk/individuals/travel-insurance) | [官方條款 PDF](https://info.zurich.com.hk/policy/TSP-002-08-2026-2.pdf)<br>鏡像：`/docs/brochures/info-tsp-002-08-2026-2.pdf` | p.30 (主要條款), p.33 (不保事項), 附錄保費表 | 季檢；長者 76 歲或以上同享 100% 醫療保障額（罕見） |
| `travel-bolttech` | 保特保險 (bolttech) | 自寫意旅遊保 (bolttech 承保) | [官方報價頁](https://bolttechinsurance.hk/) | [官方冊子 PDF](https://www.fwd.com.hk/files/v3/assets/blta9d684affff23c8c/blt60dfefc0e5053ea5/MyTravel_Insurance_brochure_updated.pdf)<br>鏡像：`/docs/brochures/fwd-mytravel_insurance_brochure_updated.pdf` | p.9 (保費表), p.2 (醫療費用), p.3 (取消旅程) | 季檢；FWD 關聯承保商，亞洲/全球分區定價 |
| `travel-manulife` | 宏利保險 | 宏利「宏利旅遊保障」 | [官方產品頁](https://www.manulife.com.hk/zh-hk/individual/products/general-insurance/travel-insurance.html) | 官方單張及保單條款<br>鏡像：`待補充鏡像` | p.2 (海外醫療150萬、免自負額) | 半年檢；優越計劃海外醫療150萬，各項保障免自負額 |
| `travel-asia-insurance` | 亞洲保險 | 亞洲保險「亞洲卓越旅遊保」 | [官方產品頁](https://www.asiainsurance.hk/zh/personal-insurance/travel-insurance) | [官方單張 PDF](https://www.asiainsurance.hk/documents/travel_leaflet_2025.pdf)<br>鏡像：`待補充鏡像` | p.1 (醫療保障120萬、寵物同行保障) | 半年檢；首創毛孩同行海外醫療 HK$10,000 |

---

## 🛠️ 三、常規更新步驟 (Step-by-Step SOP)

### 1. 遇到季節性旅遊促銷或 Promo Code 點樣更新？
旅遊保險經常有長假期、暑假、櫻花季、滑雪季優惠。
- **定位檔案**：`public/data/insurance-data.json`
- **定位路徑**：找到對應產品 `id` 的 `promo` 物件與 `premium_range`。
- **修改範例**（以 MSIG 為例）：
```json
{
  "id": "travel-msig",
  "premium_range": "網上投保優惠碼「MSIG2026」享單次旅程 55 折、全年計劃 65 折；單次 5 天亞洲保費折後約 HK$118 起",
  "promo": {
    "tag": "限時 55 折",
    "note": "輸入促銷代碼【MSIG2026】單次享 45% OFF，全年享 35% OFF",
    "buy_url": "https://www.msig.com.hk/zh-hk/personal-insurance/travel-insurance"
  }
}
```

### 2. 遇到條款擴充（如新增「手機爆屏」或「租車自負額加碼」）點改？
- **更新 `coverage` 陣列**：
```json
{
  "claim_field": "coverage",
  "category": "personal_property",
  "item_name": "手提電話屏幕損壞（爆屏）保障",
  "limit": 2500,
  "limit_description": "最高賠償 HK$2,500（每次事故自負額 HK$200）",
  "condition": "旅程中因意外跌落導致屏幕碎裂，需於 30 日內提供持牌維修商單據"
}
```
- **同步更新 `citations`（必須附帶依據）**：
  若無官方依據切勿胡亂猜測，保留原有 citation，若有官方 PDF 需填上 `page`、`document` 與 `quote`。

### ⚠️ 避坑指南：邊啲低級錯誤千祈唔好踩！
1. ❌ **殘缺貨幣字串（如 `HK,000` 或 `HK–HK`）**：
   - 歷史遺留 Bug 曾出現 `HK,500,000` 或 `HK–HK 起`。寫入 JSON 時必須是標準格式：`HK$1,500,000`、`HK$45–HK$85`。
2. ❌ **單次保費 vs 全年保費混淆**：
   - 絕不能把單次日費（如 HK$80）誤填為全年保費，或反過來把全年保費（如 HK$2,200）寫在日費欄！
3. ❌ **海外醫療誤當香港醫療**：
   - 「海外醫療」必須是在境外合法醫療機構發生的支出；香港本地覆診只是副屬保障，限額差天共地。
4. ❌ **自動發明自負額**：
   - 許多高端產品（如保誠、宏利、忠意）宣傳「免自負額（No Excess）」。切勿將未有提及自負額的項目私自填入「HK$0」或預設「HK$200」。

---

## 🧪 四、測試與驗收 Command

每一次修改 `insurance-data.json` 後，必須在終端執行以下指令以確保資料結構、過濾器和格式 100% 通過：

```bash
# 1. 驗證 JSON 語法無錯誤
node -e 'require("./public/data/insurance-data.json"); console.log("JSON 格式合法 ✅");'

# 2. 執行篩選邏輯與資料完整度單元測試
npm run test:filters

# 3. 執行全項目 Vitest 單元測試
npm test

# 4. 嚴格 ESLint 檢查（必須 0 warning 0 error）
npm run lint -- --max-warnings=0

# 5. 確保生產環境打包無故障
npm run build
```
