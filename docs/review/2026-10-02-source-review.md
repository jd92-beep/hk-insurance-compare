# 全目錄來源覆核（2026-10-02開始／10-03完成）

全部162份記錄均有端點與逐條本地引用審核。這不是162份保單均已通過語義／現行性核實。覆核時間以 JSON 的 checked_at（UTC）為準。

427個官方來源／投保／引用端點：336個HTTP200、53個404、13個403、6個412、1個429、18個連線／DNS／逾時等失敗；另8個HTTP200為假404。36份記錄沒有取得可讀HTML來源，政府清單或產品首頁也不能代替產品條款。

[完整只讀網絡結果](2026-10-02-source-report.json) · [已隔離模板原值](2026-10-02-quarantined-claims.json) · [針對性修正前記錄](2026-10-02-targeted-before.json) · [44個失效投保入口處理](2026-10-02-purchase-links.json) · [逐條引用審核](05-evidence-audit.md)

## 已確認差異

- MyTravel（travel-fwd、travel-bolttech）：官方現有 TMT.B.2026.003 與舊 mirror 比對，第2／3頁分開60日至70歲及71至80歲，長者醫療／意外上限為較低一組；第4頁取消／更改的付款後投保期限7→30天；第9頁保費分年齡、金額改變、由包括徵費變成不包括徵費。已重建摘要的逐條來源，停用舊單一價格及無證據優惠；兩個站內ID保留並明示承保／代理身份。

- Dah Sing PetSure：官方 PET042026 第15頁為「寵寶寶」、標準／至尊，醫療40,000／90,000、責任3,000,000，並有年齡共同保險及等候期。原「寵愛無憂」、A／B、50,000／1,500,000等資料已替換；舊保費與不保摘要沒有沿用。

- pet-fwd：官方為「毛孩寵物保」，保特承保、富衛金融代理。舊「寵愛一生」、珍珠／鑽石、80,000醫療及3,000,000責任沒有對應；改為網頁可支持的基本60,000、自選額外30,000、責任1,000,000並保留條件限制。

- pet-bowtie、motor-bowtie：未有可確認的原產品身份；topup-bowtie-combat把「觸木保」意外保錯列為醫療附加並引用另一產品PDF。三個ID保留作歸檔待覆核、數字清為未知、停用投保入口；不宣稱產品曾經存在或已停售。

- 確定由舊類別模板或拼接引文產生的831項保障已隔離（87份記錄）。這個數目不是其餘保障已核實的證明。所有缺口仍留在evidence ledger。

## 逐份結果

「內容待核」表示未完成整份保單、所有級別、資格及生效日逐條確認。HTTP200、原文命中及新連結不能消除這個限制。

| ID | 可讀HTML | 端點問題 | 模板隔離項 | 本輪處理／剩餘狀態 |
|---|---:|---:|---:|---|
| travel-aig | 2 | 1 | 5 | 失效入口停用，替代頁待核；模板數值改未知；內容待核 |
| travel-axa | 2 | 0 | 3 | 模板數值改未知；內容待核 |
| travel-allianz | 0 | 4 | 0 | 官方HTML未取得；內容待核 |
| travel-avo | 1 | 0 | 0 | 內容待核 |
| travel-boc-group-insurance | 2 | 0 | 5 | 模板數值改未知；內容待核 |
| travel-blue-cross | 2 | 2 | 7 | 入口已修正；模板數值改未知；內容待核 |
| travel-cntaiping | 0 | 2 | 0 | 官方HTML未取得；內容待核 |
| travel-chubb | 2 | 0 | 3 | 模板數值改未知；內容待核 |
| travel-dah-sing | 2 | 0 | 7 | 模板數值改未知；內容待核 |
| travel-fwd | 1 | 0 | 0 | 局部官方條款／身份差異已修正；內容待核 |
| travel-generali | 1 | 2 | 0 | 內容待核 |
| travel-hsbc | 1 | 1 | 0 | 入口已修正；內容待核 |
| travel-hang-seng | 0 | 1 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| travel-msig | 2 | 0 | 6 | 模板數值改未知；內容待核 |
| travel-prudential | 1 | 1 | 0 | 失效入口停用，替代頁待核；內容待核 |
| travel-starr | 1 | 2 | 0 | 內容待核 |
| travel-zurich | 3 | 0 | 5 | 模板數值改未知；內容待核 |
| travel-bolttech | 2 | 0 | 6 | 局部官方條款／身份差異已修正；模板數值改未知；內容待核 |
| medical-aia | 4 | 0 | 23 | 模板數值改未知；內容待核 |
| medical-axa | 3 | 0 | 23 | 模板數值改未知；內容待核 |
| medical-asia-insurance | 1 | 1 | 0 | 失效入口停用，替代頁待核；內容待核 |
| medical-avo | 2 | 0 | 0 | 內容待核 |
| medical-boc-group-insurance | 2 | 0 | 0 | 內容待核 |
| medical-boc-life | 4 | 0 | 0 | 內容待核 |
| medical-blue-cross | 2 | 0 | 0 | 內容待核 |
| medical-bowtie | 4 | 0 | 23 | 模板數值改未知；內容待核 |
| medical-bupa | 6 | 0 | 23 | 模板數值改未知；內容待核 |
| medical-china-life-overseas | 1 | 1 | 0 | 失效入口停用，替代頁待核；內容待核 |
| medical-china-taiping | 1 | 1 | 0 | 內容待核 |
| medical-china-taiping-life | 1 | 1 | 0 | 內容待核 |
| medical-chow-tai-fook-life | 1 | 1 | 0 | 失效入口停用，替代頁待核；內容待核 |
| medical-chubb-life | 1 | 1 | 0 | 失效入口停用，替代頁待核；內容待核 |
| medical-cigna | 2 | 0 | 23 | 模板數值改未知；內容待核 |
| medical-dah-sing | 2 | 0 | 0 | 內容待核 |
| medical-fwd | 4 | 0 | 23 | 模板數值改未知；內容待核 |
| medical-hsbc-life | 1 | 1 | 0 | 失效入口停用，替代頁待核；內容待核 |
| medical-hong-kong-life | 2 | 0 | 0 | 內容待核 |
| medical-liberty-international | 1 | 1 | 0 | 失效入口停用，替代頁待核；內容待核 |
| medical-msig | 1 | 1 | 0 | 失效入口停用，替代頁待核；內容待核 |
| medical-manulife | 2 | 0 | 0 | 內容待核 |
| medical-prudential | 4 | 0 | 0 | 內容待核 |
| medical-sun-life | 5 | 0 | 0 | 內容待核 |
| medical-well-link-life | 1 | 1 | 0 | 內容待核 |
| medical-yf-life | 1 | 1 | 0 | 內容待核 |
| medical-zurich | 1 | 1 | 0 | 失效入口停用，替代頁待核；內容待核 |
| medical-bolttech | 2 | 0 | 0 | 內容待核 |
| high-end-aia-ceo | 1 | 1 | 20 | 失效入口停用，替代頁待核；模板數值改未知；內容待核 |
| high-end-axa-global-elite | 1 | 0 | 20 | 模板數值改未知；內容待核 |
| high-end-bowtie-pink | 1 | 1 | 20 | 模板數值改未知；內容待核 |
| high-end-bupa-elite | 2 | 0 | 20 | 模板數值改未知；內容待核 |
| high-end-cigna-global | 1 | 0 | 20 | 模板數值改未知；內容待核 |
| high-end-fwd-premier | 1 | 1 | 20 | 模板數值改未知；內容待核 |
| high-end-manulife-supreme | 2 | 0 | 20 | 模板數值改未知；內容待核 |
| high-end-prudential-apex | 2 | 0 | 20 | 模板數值改未知；內容待核 |
| topup-aia-extra-medic | 1 | 1 | 18 | 失效入口停用，替代頁待核；模板數值改未知；內容待核 |
| topup-axa-smart-excess | 1 | 0 | 18 | 模板數值改未知；內容待核 |
| topup-bowtie-combat | 1 | 0 | 18 | 身份／分類隔離；不供投保；模板數值改未知；內容待核 |
| topup-bupa-carepro | 2 | 0 | 18 | 模板數值改未知；內容待核 |
| topup-cigna-plus | 2 | 0 | 18 | 模板數值改未知；內容待核 |
| topup-fwd-supplementary | 1 | 1 | 18 | 模板數值改未知；內容待核 |
| topup-prudential-mediextra | 2 | 0 | 18 | 模板數值改未知；內容待核 |
| home-axa | 2 | 0 | 2 | 模板數值改未知；內容待核 |
| home-avo | 2 | 0 | 7 | 模板數值改未知；內容待核 |
| home-boc-group-insurance | 1 | 0 | 4 | 模板數值改未知；內容待核 |
| home-blue-cross | 4 | 3 | 3 | 模板數值改未知；內容待核 |
| home-china-taiping | 0 | 1 | 1 | 模板數值改未知；官方HTML未取得；內容待核 |
| home-chubb | 1 | 0 | 0 | 內容待核 |
| home-dah-sing | 1 | 1 | 0 | 失效入口停用，替代頁待核；內容待核 |
| home-liberty | 1 | 1 | 0 | 入口已修正；內容待核 |
| home-msig | 2 | 1 | 0 | 入口已修正；內容待核 |
| home-onedegree | 1 | 0 | 0 | 內容待核 |
| home-qbe | 0 | 1 | 5 | 模板數值改未知；官方HTML未取得；內容待核 |
| home-zurich | 2 | 1 | 0 | 入口已修正；內容待核 |
| life-aia | 1 | 0 | 8 | 模板數值改未知；內容待核 |
| life-axa | 1 | 0 | 8 | 模板數值改未知；內容待核 |
| life-boc-life | 2 | 0 | 8 | 模板數值改未知；內容待核 |
| life-blue | 3 | 0 | 10 | 模板數值改未知；內容待核 |
| life-bowtie | 3 | 0 | 10 | 模板數值改未知；內容待核 |
| life-china-life-overseas | 2 | 0 | 10 | 模板數值改未知；內容待核 |
| life-fwd | 0 | 1 | 6 | 失效入口停用，替代頁待核；模板數值改未知；官方HTML未取得；內容待核 |
| life-hsbc-life | 0 | 2 | 10 | 失效入口停用，替代頁待核；模板數值改未知；官方HTML未取得；內容待核 |
| life-manulife | 2 | 0 | 7 | 模板數值改未知；內容待核 |
| life-prudential | 1 | 0 | 7 | 模板數值改未知；內容待核 |
| life-sun-life | 3 | 0 | 8 | 模板數值改未知；內容待核 |
| life-za-insure | 3 | 0 | 10 | 模板數值改未知；內容待核 |
| critical-illness-aia | 5 | 0 | 7 | 模板數值改未知；內容待核 |
| critical-illness-axa | 5 | 0 | 8 | 模板數值改未知；內容待核 |
| critical-illness-boc-life | 0 | 1 | 5 | 失效入口停用，替代頁待核；模板數值改未知；官方HTML未取得；內容待核 |
| critical-illness-blue | 1 | 0 | 9 | 模板數值改未知；內容待核 |
| critical-illness-bowtie | 2 | 0 | 11 | 模板數值改未知；內容待核 |
| critical-illness-fwd | 5 | 0 | 7 | 模板數值改未知；內容待核 |
| critical-illness-hsbc-life | 1 | 1 | 12 | 失效入口停用，替代頁待核；模板數值改未知；內容待核 |
| critical-illness-manulife | 6 | 0 | 7 | 模板數值改未知；內容待核 |
| critical-illness-prudential | 3 | 0 | 8 | 模板數值改未知；內容待核 |
| critical-illness-sun-life | 3 | 0 | 6 | 模板數值改未知；內容待核 |
| accident-aia | 2 | 0 | 10 | 模板數值改未知；內容待核 |
| accident-axa | 3 | 0 | 7 | 模板數值改未知；內容待核 |
| accident-boc-group-insurance | 2 | 0 | 6 | 模板數值改未知；內容待核 |
| accident-blue-cross | 2 | 1 | 10 | 模板數值改未知；內容待核 |
| accident-chubb | 2 | 1 | 8 | 入口已修正；模板數值改未知；內容待核 |
| accident-dah-sing | 1 | 0 | 3 | 模板數值改未知；內容待核 |
| accident-fwd | 3 | 0 | 9 | 模板數值改未知；內容待核 |
| accident-msig | 2 | 1 | 1 | 入口已修正；模板數值改未知；內容待核 |
| accident-prudential | 2 | 0 | 3 | 模板數值改未知；內容待核 |
| accident-zurich | 1 | 0 | 5 | 模板數值改未知；內容待核 |
| motor-aig | 3 | 0 | 4 | 模板數值改未知；內容待核 |
| motor-axa | 1 | 1 | 6 | 模板數值改未知；內容待核 |
| motor-boc-group-insurance | 4 | 0 | 8 | 模板數值改未知；內容待核 |
| motor-china-taiping | 0 | 3 | 12 | 模板數值改未知；官方HTML未取得；內容待核 |
| motor-dah-sing | 2 | 0 | 4 | 模板數值改未知；內容待核 |
| motor-liberty | 3 | 0 | 2 | 模板數值改未知；內容待核 |
| motor-msig | 3 | 0 | 6 | 模板數值改未知；內容待核 |
| motor-qbe | 0 | 1 | 1 | 模板數值改未知；官方HTML未取得；內容待核 |
| motor-zurich | 1 | 0 | 2 | 模板數值改未知；內容待核 |
| domestic-helper-axa | 2 | 1 | 2 | 失效入口停用，替代頁待核；模板數值改未知；內容待核 |
| domestic-helper-boc-group-insurance | 2 | 0 | 1 | 模板數值改未知；內容待核 |
| domestic-helper-blue-cross | 1 | 1 | 4 | 模板數值改未知；內容待核 |
| domestic-helper-dah-sing | 2 | 0 | 9 | 模板數值改未知；內容待核 |
| domestic-helper-msig | 1 | 1 | 0 | 入口已修正；內容待核 |
| domestic-helper-qbe | 0 | 1 | 4 | 模板數值改未知；官方HTML未取得；內容待核 |
| domestic-helper-zurich | 1 | 1 | 3 | 入口已修正；模板數值改未知；內容待核 |
| pet-blue-cross | 2 | 1 | 5 | 模板數值改未知；內容待核 |
| pet-msig | 2 | 0 | 7 | 模板數值改未知；內容待核 |
| pet-onedegree | 2 | 0 | 6 | 模板數值改未知；內容待核 |
| pet-bolttech | 2 | 1 | 8 | 模板數值改未知；內容待核 |
| travel-manulife | 1 | 0 | 0 | 內容待核 |
| pet-bowtie | 0 | 2 | 0 | 身份／分類隔離；不供投保；官方HTML未取得；內容待核 |
| pet-zurich | 0 | 2 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| pet-avo | 0 | 2 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| pet-fwd | 1 | 0 | 0 | 局部官方條款／身份差異已修正；內容待核 |
| domestic-helper-starr | 1 | 1 | 0 | 內容待核 |
| domestic-helper-generali | 0 | 1 | 0 | 官方HTML未取得；內容待核 |
| domestic-helper-hsbc | 0 | 1 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| motor-directasia | 0 | 1 | 0 | 官方HTML未取得；內容待核 |
| motor-bowtie | 0 | 1 | 0 | 身份／分類隔離；不供投保；官方HTML未取得；內容待核 |
| critical-illness-generali | 0 | 1 | 0 | 官方HTML未取得；內容待核 |
| accident-bowtie | 0 | 1 | 0 | 入口已修正；官方HTML未取得；內容待核 |
| accident-blue | 2 | 0 | 0 | 內容待核 |
| home-hsbc | 0 | 1 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| home-prudential | 0 | 2 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| home-fwd | 0 | 2 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| home-starr | 1 | 1 | 0 | 內容待核 |
| pet-prudential | 0 | 2 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| pet-allianz | 0 | 1 | 0 | 官方HTML未取得；內容待核 |
| pet-dah-sing | 1 | 0 | 0 | 局部官方條款／身份差異已修正；內容待核 |
| motor-fwd | 0 | 2 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| motor-blue-cross | 0 | 1 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| domestic-helper-fwd | 0 | 1 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| domestic-helper-cntaiping | 0 | 1 | 0 | 官方HTML未取得；內容待核 |
| life-generali | 0 | 1 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| life-chubb-life | 0 | 1 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| critical-illness-chubb-life | 0 | 1 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| critical-illness-za-insure | 1 | 0 | 0 | 內容待核 |
| accident-generali | 0 | 1 | 0 | 官方HTML未取得；內容待核 |
| accident-sun-life | 0 | 2 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| high-end-zurich-medelite | 0 | 1 | 0 | 失效入口停用，替代頁待核；官方HTML未取得；內容待核 |
| high-end-sun-life-prestige | 1 | 1 | 0 | 內容待核 |
| travel-asia-insurance | 0 | 3 | 0 | 官方HTML未取得；內容待核 |
| life-zurich-term | 1 | 1 | 0 | 內容待核 |
| critical-illness-zurich-care | 1 | 1 | 0 | 內容待核 |
| accident-manulife-thankful-care | 2 | 0 | 0 | 內容待核 |
| accident-manulife-take-care | 2 | 0 | 0 | 內容待核 |
