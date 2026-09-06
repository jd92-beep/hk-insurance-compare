# 首頁層次、全站效能與資料容錯

Hero 的 scroll transform 與 pointer transform 改用父子分層，避免 GSAP／Framer 同時覆寫；Tilt、Hero、MethodStory、Lenis 即時遵循 reduced-motion。保留既有藝術方向，不恢復大型 WebGL 圈圈。移除多處過期 9／85／27 常數與「全部來源已完整」概括保證。

路由按需載入、保留 app shell、錯誤邊界與資料重試、skip link、動態頁名及香港繁中語言標記。快照在提供給所有頁面之前驗證必要結構、唯一 ID 和類別；既有33筆缺 claim_summary 引用標為空字串而非編造摘要，頁碼字串只接受正整數轉換，缺失仍為 null。類別數由實際產品重算；未知快照日期不冒填舊日期。

手機公司卡 1370px 溢出的根因係 grid 子項 min-content；加 min-w-0／長字換行而非裁走內容。公司類別連結帶保險公司條件；「睇全部」但只連第一類的文案改正。

本地18個unit tests、lint與production build通過。入口bundle由約1379.82kB降至688.16kB（minified；不是全部網絡下載量，其他路由按需載入）。真機FPS未量測，headless RAF只作環境觀察。

新增GitHub Chromium驗證全部158產品桌面路由，以及桌面／手機首頁、頁尾、live reduced-motion、公司名錄、資料核查與503重試。結果以exact head artifacts為準；不以build通過冒稱瀏覽器全通過。
