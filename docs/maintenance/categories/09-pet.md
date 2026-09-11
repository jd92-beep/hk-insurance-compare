# 🐾 寵物保險維護指南 (Pet Insurance Maintenance Guide)

> **版本**：v1.7.2  
> **更新日期**：2026-09-11  
> **適用產品數**：11 款（Category: `pet`）  
> **核心關鍵字**：共同保險（Coinsurance 70-90%）、晶片認證、門診上限、癌症及終身續保

---

## 一、🐱 類別定位與維護核心心法

寵物保險係成個比價庫入面「水最深、魔鬼細節最多」嘅險種之一！維護呢個類別，千祈唔好只睇「每年最高賠償額十幾萬」呢啲吸睛噱頭，必須緊握三大核心命脈：

1. **共同保險（Coinsurance / 自負比例）**：
   - 市面上絕無「全包 100% 賠足」呢隻歌仔！普遍賠償比例為 **70% 至 80%**（意味主人要自己硬食 20% - 30% 費用）。
   - 虛擬保司（如 OneDegree、Bowtie）常以「指定網絡獸醫賠高達 90%、非網絡賠 70%」作賣點，維護時**必須分開標明網絡 vs 非網絡比例**，不可籠統寫「90%」！
2. **晶片（Microchip）與身份辨認門檻**：
   - **狗隻**：法例規定 5 個月大以上必須植入晶片及領牌。傳統保司（如 Blue Cross、MSIG、bolttech）強制要求晶片編號，否則拒賠。
   - **貓隻**：部分保司豁免晶片（如 Blue Cross 認針卡、OneDegree 免晶片），維護時務必在 `key_terms` 標明「貓隻免晶片」還是「全需晶片」。
3. **門診細項限額 vs 大額全包（CEO Plan 型態）**：
   - 傳統計劃（如藍十字、保誠、大新）每項門診診金、藥費、化驗都有單項子限額（Sub-limit，如每次診金上限 HK$300-500，每年限 5-10 次）。
   - 新式計劃（如 OneDegree CEO Plan、Bowtie）主打「不設細項限額，年度總額共享」。維護時切忌將兩者混為一談！

---

## 二、📋 11 款寵物保險官方情報速查表

下表涵蓋本站收錄全部 11 款寵物保險，所有 ID、官網與鏡像均經嚴格核對：

| # | Product ID | 保險公司 | 產品名稱 (中/英) | 官方報價 / 購買 URL | 存證 PDF 鏡像 / 來源 | 核心條款與核保注意事項 |
|---|---|---|---|---|---|---|
| 1 | `pet-blue-cross` | 藍十字 (Blue Cross) | 「愛・寵物」保險計劃<br>LovePet Insurance | [官網報價](https://www.bluecross.com.hk/ch/LovePet/Application) | `/docs/brochures/ap-lovepet_leaflet.pdf` (p.3) | 投保 6 個月-8 歲，續保至 13 歲（13 歲以上需獨立核保）；貓隻免晶片（認針卡）；自負額 20%；特設化療專項保額。 |
| 2 | `pet-msig` | 三井住友 (MSIG) | Happy Tails® 寵物保險（至寵愛）<br>Happy Tails® Pet Insurance | [官網報價](https://hk.aonhappytails.com/) | `/docs/brochures/msig-happytails-brochure-eng.pdf` (p.1-2) | 4 歲前投保保證終身續保；疾病等候期 90 天，先天/遺傳病等候期 12 個月；分狗隻 Standard/Premier/Ultimate 及貓隻專屬 Plan。 |
| 3 | `pet-onedegree` | OneDegree | 寵物CEO Plan®（毛價保）<br>Pet CEO Plan® | [官網投保](https://www.onedegree.hk/zh-hk/pet-insurance) | 官網即時規格頁 (純數碼更新) | 投保年齡 13 週-11 歲承諾終身續保；免晶片免體檢；網絡獸醫賠償 90%、非網絡 70%；無細項限額；可附加 FIP 腹膜炎及癌症保障。 |
| 4 | `pet-bolttech` | 保特保險 (bolttech) | 毛孩寵物保<br>Pet Care | [富衛分銷報價](https://www.fwd.com.hk/online-insurance/pets-insurance/) | `/docs/brochures/bolttechinsurance-petinsurance.pdf` (p.2-3) | bolttech 承保，經 FWD 網上代理分銷；投保 6 個月至 9 歲未滿；實報實銷 80%（20% 自負）；可加購 1E 額外醫療 HK$10,000/30,000。 |
| 5 | `pet-bowtie` | 保泰人壽 (Bowtie) | Bowtie 寵物保<br>Bowtie Pet Insurance | [官網報價](https://www.bowtie.com.hk/zh-hk/pet-insurance) | 官方線上規格專頁 | 純線上虛擬保險；實報實銷 80%；每年醫療上限達 HK$70,000；不設細項限制；免植晶片核保。 |
| 6 | `pet-zurich` | 蘇黎世保險 (Zurich) | 蘇黎世「伴侶寵物保障」<br>Companion Pet Insurance | [官方投保](https://buy.zurich.com.hk) | 官方產品小冊子專頁 | 每年醫療總額高達 HK$75,000；第三者法律責任高達 HK$2,000,000；分 Essential、Classic、Elite 三個級別；實報實銷 70-80%。 |
| 7 | `pet-avo` | Avo 保險 | Avo 寵物保障計劃<br>Avo Pet Insurance | [官網投保](https://www.heyavo.com/zh-hk/products/pet) | 官方數碼規格單張 | 每年醫療總額達 HK$60,000；不限求診次數但設年度總限；賠償 70%-80%；免自負額；包含指定遺傳病保障。 |
| 8 | `pet-fwd` | 富衛保險 (FWD) | 富衛保險「寵愛一生」保障計劃<br>FWD Pet Insurance Plan | [官網報價](https://www.fwd.com.hk/online-insurance/pets-insurance/) | 官方產品頁面與條款 | 珍珠 (Pearl) 與鑽石 (Diamond) 計劃；每年醫療上限達 HK$80,000；大額手術全包無細項封頂；實報實銷 80%。 |
| 9 | `pet-prudential` | 保誠保險 (Prudential) | 保誠「PRUChoice 毛孩保障」<br>PRUChoice Furkid Care | [官網專頁](https://www.prudential.com.hk/tc/general-insurance/pet/) | 官方小冊子與利益表 | 精選與尊尚計劃；每年醫療達 HK$65,000；外科手術每次最高 HK$25,000；設住院津貼及晶片審核要求。 |
| 10 | `pet-allianz` | 安聯保險 (Allianz) | 安聯「安聯寵物保」<br>Allianz Pet Insurance | [官網報價](https://www.allianz.com.hk/zh-hk/personal/pet-insurance.html) | 官方產品條款文件 | 銅/銀/金三個級別；每年醫療上限最高 HK$70,000；實報實銷 80%；公眾責任高達 HK$2,000,000。 |
| 11 | `pet-dah-sing` | 大新保險 (Dah Sing) | 「寵愛無憂」寵物保障計劃<br>Dah Sing PetSure | [官網專頁](https://www.dahsing.com/html/tc/insurance/pet.html) | 官方產品單張與保單細則 | 計劃 A 及 B；手術住院總額高達 HK$50,000；門診涵蓋西醫及中醫針灸跌打每次最高 HK$500；大新卡戶常見特約推廣。 |

---

## 三、🛠️ 寵物保險維護 SOP 與防錯指南

### 1. 季度更新核對清單（Checklist）
- [ ] **品種不保清單（Dangerous Dogs Exclusion）**：香港法例第 167D 章列明格鬥狗隻（Pit Bull 鬥牛犬、Dogo Argentino 阿根廷杜高、Fila Braziliero 巴西非拉、Tosa 日本土佐）所有保司一律不保。切勿誤寫「任何犬種全保」！
- [ ] **投保年齡上限檢查**：每年檢視各產品超齡限制（例如通常滿 8 或 9 歲不能首保，僅 OneDegree 容許至 11 歲）。
- [ ] **優惠碼時效性**：OneDegree / Blue Cross 等經常轉 promo code（如 MONEYSMART20、PET85 等），留意過期日。

### 2. 三大防錯紅線 🚫
> ⚠️ **紅線一：不得將「共同保險」等同於「零自負額」！**  
> 「80% 實報實銷」代表客戶要自付 20%，前端展示絕對不能標註成「無自負額 / Zero Deductible」。

> ⚠️ **紅線二：不得混淆 bolttech 與 FWD！**  
> `pet-bolttech` 係由 bolttech（保特保險）承保，富衛只係網上代理平台，保司 Canonical Key 必須係 `bolttech`，切忌誤改為 `fwd`！

> ⚠️ **紅線三：必須保留等候期（Waiting Period）警示！**  
> 寵物保險普遍有 14 至 90 天疾病等候期（癌症與遺傳病甚至長達 6-12 個月）。更新條款時絕不可刪除等候期說明，防止爭議。
