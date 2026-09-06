# 保障圖表接線與驗收

2026-09-06：上次PR #14只有元件與一次性整合腳本，CategoryDetail仍使用舊圖。已在exact 846b634快照重現兩個失敗：route未接線、一般每次口徑仍被繪製。

UniversalComparisonChart現為EvidenceComparisonPanel的固定入口；移除舊圖表的虛構無上限值及自動排名計算，不以大範圍替換分類頁實作整合。保留原分類頁篩選介面。

只繪同名摘要、明示HKD及明示期間。無上限保留文字、缺失不當零值、一般每次不畫柱、同名多列不擅選最高級別；有逐條PDF中心入口與完整表格替代。這不是保障等價或適合度評分。

刪除一次性自動寫分支workflow，改為永久只讀Evidence chart regression，exact PR head執行11類×2尺寸互動驗證。沒有修改任何保險資料、PDF或master。

本地先重現2FAIL，再24/24 PASS，lint零警告、production build PASS。遠端互動結果見PR。所有數字文案仍須官方條款核對；後續金額parser會進一步分清每人／每保單及每次住院／索償。
