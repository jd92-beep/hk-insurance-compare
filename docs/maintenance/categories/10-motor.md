# 🚗 汽車保險維護指南 (Motor Insurance Maintenance Guide)

> **版本**：v1.7.2  
> **更新日期**：2026-09-11  
> **適用產品數**：13 款（Category: `motor`）  
> **核心關鍵字**：法定三保 1 億、司機累積墊底費、NCD 保障、電動車 (EV) 專屬條款、停售標記

---

## 一、🏎️ 類別定位與維護核心心法

汽車保險係香港法例第 272 章《汽車保險（第三者風險）條例》強制要求嘅險種。車主唔買三保出街係刑事罪行！維護車險數據時，切勿單純抄錄「保費幾千蚊」，因為車險報價高度個人化（視乎車款、CC數、司機年齡、牌齡及 NCD）。維護的核心聚焦於**保障結構、累積墊底費及特殊免責條款**：

1. **法定三保（Third Party Only）vs 綜合全保（Comprehensive）**：
   - **法定第三保**：劃一法定人身傷亡責任最高 **HK$100,000,000**（一億港元）；第三者財物損害賠償通常為 **HK$2,000,000 至 HK$5,000,000**。
   - **綜合全保**：除三保外，涵蓋自身車輛損毀、盜竊、火災、擋風玻璃玻璃賠償（Windscreen）及拖車救援。
2. **司機累積墊底費（Cumulative Excess / 疊加自負額）魔鬼細節**：
   - 很多車主以為全保「有事賠足」，但當索償自身車身損毀時，多項自負額係**累計加總**（Stackable）嘅！
   - 例如：基本自身損毀墊底費 ($3,000) + 年輕司機未滿 25 歲 ($5,000) + 牌齡未滿 2 年新牌司機 ($5,000) + 非記名司機 Unnamed Driver ($5,000) = **總墊底費可高達 $18,000**！維護條款時務必於 `key_terms` 保留疊加計算警示。
3. **電動車（EV）與「港車北上」專屬條款**：
   - 新能源車普及，蘇黎世（Zurich Motorplus）、富衛等特設電動車專屬條款（充電樁及充電線損壞/第三方責任、原廠電池更換、高壓電系統故障）。
   - 中銀、利寶等提供跨境大灣區「港車北上」支援擴展，維護時需特別標記。

---

## 二、📋 13 款汽車保險官方情報速查表

下表彙整全站 13 款汽車保險之官方規格與鏡像來源：

| # | Product ID | 保險公司 | 產品名稱 (中/英) | 官方報價 / 查詢 URL | 存證 PDF 鏡像 / 來源 | 核心條款與維護注意事項 |
|---|---|---|---|---|---|---|
| 1 | `motor-aig` | 美亞保險 (AIG) | AIG 汽車保險（Auto Select 汽車全保計劃）<br>Auto Select Comprehensive | [官網專頁](https://www.aig.com.hk/zh/personal/car-insurance-quote) | `/docs/brochures/aig-20240813_auto_direct_comprehensive_brochure_v3.pdf` (p.3) | **⚠️ 狀態：停售/特殊歸檔候選 (`premium_available: false`)**。法定三保 1 億/200 萬；全保特設擋風玻璃賠償 HK$4,000 免扣 NCD；新車落地首年以新換舊。 |
| 2 | `motor-axa` | 安盛 (AXA) | 「卓越」私家車保險<br>SmartDrive Motor Insurance | [官網報價](https://www.axa.com.hk/zh/motor-insurance) | `/docs/brochures/axa-smartdrive-brochure.pdf` (p.3) | 三保 1 億/500 萬；全保累積自負額條款清晰；特設電動車家用充電設備意外損壞保障及 24 小時道路緊急支援。 |
| 3 | `motor-boc-group-insurance` | 中銀集團保險 (BOC) | 汽車保險-私家車<br>Motor Insurance - Private Car | [官網報價](https://www.bocgins.com/index.html?target=motor) | 官方產品小冊子及專頁 | 支援「港車北上」大灣區自駕專屬方案；三保 1 億/200 萬；各項司機身份墊底費累加；設 NCD 保障。 |
| 4 | `motor-china-taiping` | 中國太平 (China Taiping) | 汽車保險<br>Motor Insurance | [官網專頁](https://www.hk.cntaiping.com/product/110851.html) | 官方專頁規格 | 法定三保 1 億/200 萬；NCD 最高達 60% 遞減；網上投保設特惠費率；自負額依司機資歷嚴格審定。 |
| 5 | `motor-dah-sing` | 大新保險 (Dah Sing) | 私家車汽車保險<br>Private Motor Car Insurance | [官網專頁](https://www.dahsinginsurance.com/product/2/motor) | `/docs/brochures/dahsinginsurance-policy_wordings.pdf` (p.9) | 三保 1 億/200 萬；累積墊底費機制（基本+新牌+年輕+非指定司機）；NCD 20%-60% 折扣表；擋風玻璃獨立理賠。 |
| 6 | `motor-liberty` | 利寶國際 (Liberty) | 私用汽車保險 / 尊貴汽車保險<br>Private Motor / Privilege Motor | [官網報價](https://www.libertyinsurance.com.hk/zh/private-motor) | `/docs/brochures/libertyinsurance-brochure_privilege_motor.pdf` (p.7) | 專注高端名車與跑車（Tesla、Porsche 等），提供原廠全新零件維修不計折舊；三保 1 億/500 萬；大灣區道路救援。 |
| 7 | `motor-msig` | 三井住友 (MSIG) | 私家車保險<br>Private Motor Car Insurance | [官網報價](https://www.msig.com.hk/zh-hant/personal-insurance/private-motor-car) | 官方產品專頁與手冊 | 三保 1 億/200 萬；NCD 保障條件嚴格（扣減自負額後賠償額 ≤ HK$60,000 或投保額 15% 且無人身受傷）；司機額外自負額累加。 |
| 8 | `motor-qbe` | 昆士蘭保險 (QBE) | 汽車超級保險<br>Motor Supersurance | [官網專頁](https://www.qbe.com/hk/zh-hk/personal-insurance/motor-insurance) | `/docs/brochures/qbe-motor-policy-wordinguwdpvpcv22112304.pdf` (p.8) | 三保 1 億/200-500 萬；eClaims 數碼索償；列明記名司機 vs 非記名司機墊底費差距；提供 24 小時拖車及法律支援。 |
| 9 | `motor-zurich` | 蘇黎世保險 (Zurich) | 「車護保」汽車保險計劃<br>Motorplus Insurance Plan | [官網報價](https://www.zurich.com.hk/zh-hk/individuals/motor-insurance) | `/docs/brochures/edge-nev_fs_zh.pdf` (p.1-2) | **電動車 (EV) 先驅方案**：涵蓋充電樁意外、電池損壞、充電自燃；CFD (無賠償折扣) 保護（年度賠償 ≤ HK$50,000 不扣減）；成功向第三方追討可退還墊底費。 |
| 10 | `motor-directasia` | DirectAsia 達信 | DirectAsia 私家車保險<br>DirectAsia Motor Insurance | [官網即時報價](https://www.directasia.com.hk/zh-hk/car-insurance/) | 官方線上產品規格單張 | 直銷模式免經紀佣金；三保 1 億/500 萬；可選固定指定駕駛者以壓低保費；自選授權維修廠調節墊底費。 |
| 11 | `motor-bowtie` | 保泰人壽 (Bowtie) | Bowtie 汽車保險<br>Bowtie Car Insurance | [官網線上報價](https://www.bowtie.com.hk/zh-hk/car-insurance) | 官方網上條款 | 純線上透明報價，無經紀附加手續費；法定三保 1 億/500 萬；全保含擋風玻璃更換及道路救援支援。 |
| 12 | `motor-fwd` | 富衛保險 (FWD) | 富衛「私家車保險」<br>FWD Car Insurance | [官網即時報價](https://www.fwd.com.hk/online-insurance/car-insurance/) | 官方網上產品專頁 | 特設電動車尊享計劃；全保特設電池及原廠全新零件保障；即時網上批核；法定三保 1 億/500 萬。 |
| 13 | `motor-blue-cross` | 藍十字保險 (Blue Cross) | 藍十字「車護寶」私家車保險<br>Blue Cross Motor Insurance | [官網專頁](https://www.bluecross.com.hk/ch/General/Motor/) | 官方產品專頁條款 | 三保 1 億/500 萬；24 小時免費道路緊急救援；NCD 最高達 60%；新車落地首 12 個月以新換舊賠償。 |

---

## 三、🛠️ 汽車保險維護 SOP 與防錯指南

### 1. 報價與數據維護常規
- 車險不同於旅遊保，**絕大多數車險無法直接以「一口價」展示**，因為保費取決於車款馬力、司機年齡牌齡。因此數據庫中 `premium_range: "需報價"`，維護時切忌隨便填入一個特定司機試算的數值當成標準保費！
- 若保司提供網上折扣（例如「網上投保享 85 折」或「NCD 60% 額外減 $500」），更新於 `promo` 欄位。

### 2. 汽車保險三大防錯紅線 🚫
> ⚠️ **紅線一：三保法定額度絕對不可填錯！**  
> 香港法例規定第三者身體傷亡法律責任不得低於 HK$100,000,000。此數值在任何三保或全保產品中均為硬性指標，不得漏寫或擅改。

> ⚠️ **紅線二：AIG 等停售或轉移渠道之產品切勿直接 DELETE！**  
> 如 `motor-aig` 網上報價已關閉或轉由特定渠道，必須按照《產品停售或歸檔 SOP》將 `premium_available` 設為 `false`，並在 `premium_notes` 標註，保留條款以供歷史查閱，嚴禁直接由 JSON 移除！

> ⚠️ **紅線三：必須保留「累積自負額」條款警示！**  
> 任何全保產品在 `key_terms` 內均不可刪除「年輕司機、新牌司機及非指定司機自負額會累計疊加」之說明，避免誤導消費者以為只有一筆基本自負額。
