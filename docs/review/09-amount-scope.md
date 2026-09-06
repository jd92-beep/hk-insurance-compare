# 金額比较：完整口徑，而不是從文字抽一個數字

基線：PR #14 的 fc797cd。版本1.6.1／Build20260906.23。沒有修改保額、原始資料、PDF或部署。

## 可重現的舊問題
- comparableAmount('每年 HK$1,,000') 返回1000，錯把損壞格式當有效金額。
- comparableBest(['每年每人 HK$1,000','每年每家庭 HK$2,000']) 返回第二欄，忽略賠償對象不同。
- 每次住院與每次索償共用event；指定醫院等未解析限制被丟棄。
- 圖表只按year/day分組，會再次混合每人與家庭。

## 修正邊界
先NFKC再驗證整個數值字串；正確千位分隔、至多2位小數，保留萬／億；只接受明確金額、期間、對象和少數中性上限修飾詞。殘留任何未知條件、幣種、附加數字均不畫成純額度。

scopeKey含精確期間及person/family/policy/unstated；未註明對象不默認每人。未註明對象只能與同樣未註明的摘要作數字對照，UI標示「對象未明示」，不能據此宣稱保單同質。generic每次不比較；具體每次事故的自負額仍取較低值。圖表保留原本event只呈現原文的保守政策。

## 驗證及review方法
1. npm ci（Node22、既有lockfile）。
2. node --experimental-strip-types --test tests/amount-scope.test.mjs：6組必須全pass。
3. npm test：本次34/34；npm run lint -- --max-warnings=0；npm run build；npm run test:filters。
4. 到/category/travel和/category/medical切換項目，查看figure標題包括期間＋對象；所有原摘要和PDF核對入口仍保留。
5. 覆核GitHub exact head的Chart、Category、PDF及全158產品驗證，未取得結果前不要當成已做瀏覽器驗收。

新增測試先4fail/2pass，修正後6pass。既有零自負額測試由含糊「每次」改為明確「每次事故」，沒有刪除零值保留的驗證。若接受度下降，應補經核實結構化欄位，不要刪除殘留條件檢查來增加柱數。

## 其他agent不可做
不要將未解析改成0／Infinity；不要按最大值猜級別；不要只以basis合併panel；不要修改insurance-data.json迎合測試；不要放寬lint或跳過既有回歸。這不是完整保單語義／核保引擎。依#14之後合併，Revert本PR即可回復，無migration。
