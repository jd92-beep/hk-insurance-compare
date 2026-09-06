# CFAR 與跨欄位特點證據：實作及交接

## 範圍與根因
基於 PR #15（349ee7c），不是另一套金額 parser。舊 assessFeature 提早返回第一個 coverage 命中，尚未檢查 key_terms 的不保或待確認文字；HK$0 保障可被後面的行銷字句救回。否定檢查沒有先做 NFKC，英文 not insured／does not cover／no coverage 亦漏判。CFAR 的 OR 關鍵字包含普通取消旅程及 CFUR；零自負額／全數賠償包含一般實報實銷，造成不當命中。

## 演算法順序（不要任意交換）
1. 正規化並去重查詢詞；帶 CFAR 明示契約的查詢只接受 CFAR／cancel for any reason／任何原因取消作正面依據。帶全數／零自負額的查詢不能以一般實報實銷或不設分項證明；獨立實報實銷查詢保留。
2. 查負面及未知內容仍使用原目錄的廣義詞。例如正面CFAR必須明確，但一般「取消旅程不適用」仍可能限制它，不能因收窄正面詞而忽略。
3. 收集全部相關 coverage 與 key_terms；先檢查任何不保、相關 exclusions、非自負額的零保障。存在則 excluded-or-conditional。未知語句則 unknown。
4. 最後才考慮正面匹配；可用的HK$0自負額繼續有效；計劃名字本身不能當保障證明。

這是保守文字檢索，不是完整法律語義引擎。unknown不是不受保；summary-match不是已核保／保證理賠／最新認證。相關限制可能令整個 OR tag 失去命中，寧可提示核對，不擅自判斷限制範圍。

## 改動位置
- src/lib/feature-evidence.ts：保留 assessFeature(product, keywords) 公開API；featureSearchTerms限制較強查詢契約，避免重寫147標籤目錄造成相容性及合併風險。
- tests/feature-conflicts.test.mjs：10個真實呼叫測試，包含正式CATEGORY_FEATURE_TAGS及matchSingleFeature，不只測一個mock。
- src/lib/version.ts：Build20260906.24；package及APP_VERSION1.6.1未變。

## 驗證
Node22，npm ci。執行 node --experimental-strip-types --test tests/feature-conflicts.test.mjs，預期10/10；npm test本地45/45。再跑npm run lint -- --max-warnings=0、npm run build、npm run test:filters。新增8個初始測試有6個失敗後修正；後加廣義取消限制測試另重現1fail，修正後全部通過。deep suite本次91,021個斷言通過，數量會因更保守的命中集合改變，不能當保險內容核實比例。

GitHub exact head結果以PR checks為準；不要引用父PR成功當此PR成功。沒有更改原始dataset、PDF、網頁保障金額或master。

## Agent不可誤讀的限制
原catalog仍有需要後續核對的強勢標籤，例如長者保障額不縮水及運送無上限；本PR不聲稱所有標籤語義已修好。canonical-benefits的跨產品行配對是另一條路徑，未由此helper全面修復。禁止為增加命中率移除負面／未知優先檢查；擴充詞彙必須帶正反例及人工條款核實。

## 相依與回退
此PR改以#15為base，舊#16金額實作已由#15版本完整取代，無需合併兩套parser。保留非force歷史；審查差異應只有本helper、測試、說明及版本。#7/#9/#11/#13等旁支尚須另外整合。回退本PR恢復helper即可，無migration、不部署。
