# 香港保險比較網站：問題登記與執行交接

**審核日期：2026-09-06。這是具版本邊界的工程審核，不是全體保單最新性認證。**

主要閱讀基線：PR #15 `349ee7c85f97827c99c433d3f0d5529a40f28105`；本輪修正：PR #16 `8208f0acb5f8f8749d5e435e66aaa90ff63e13bc`、PR #19 `53749290a4d521c48e43d7e6c269772d18a32f10`。旁支與提交在審核期間有並行變更，接手前必須重新讀取 GitHub，不可只照抄此表的 SHA。

## 一、先講清楚成果與未完成範圍

GitHub 的 repository read、source download、commit、branch、PR 寫入均已實際成功。之前「只能確認 PR #1」的聊天回覆不能當成倉庫現況。工程改動仍在 review branches；本輪沒有合併或推送 master，也沒有授權正式部署。

來源快照有 **158 個產品記錄、11 類、40 個不同 insurer 字串**。這不是香港全市場保險公司數量，更不代表每個產品／級別已確認可供新投保。原資料的 insurer key 應直接從檔案取得，不使用舊 GEMINI 的固定39項表作唯一准入名單。

PR #8 的全庫機械核查涵蓋81份鏡像、2600條 coverage 及982條 citation，共3582條引用。結果為312 literal-match、1373 not-found、1447 external-only、396 missing-source、5 invalid-or-missing-page、49 no-text；956個coverage引用出現同一摘錄被不同保障重用。**找到文字不代表足以支持保額，找不到也不等於保障錯誤**：翻譯、摘要、文字擷取或版本差異都可能影響結果。

本輪沒有逐款重查所有官方網站、没有更新全部PDF、沒有補齊所有保障證據。因此不能聲稱「158款都正確及最新」「所有漏洞已修」「所有裝置流暢」。以下登記把事實、已實作分支與仍欠驗證的風險分開。

## 二、狀態定義

- **已重現／已修正**：有最小案例或真實互動失敗，程式已更改並重跑相應測試；仍須注意是否合併。
- **已重現／未修正**：本輪實際執行可觸發，現有PR未封堵；有明確後續檔案及驗收條件。
- **原碼風險／待測**：從程式發現，但沒有把推測當成已確認使用者事故。
- **外部內容未核實**：需要官方產品／級別／版本／日期及上下文證據；不能由工程測試推論。
- **另有PR／待整合**：GitHub確有獨立改動，未包含於此分支；綠色的單支測試不等於組合後測試。

P0為內容信任或錯誤比較的發布阻擋條件；P1為主要功能／資料可靠性；P2為體驗、維護及驗收缺口。這是此專案的工程優先級，不是法律風險評級。

## 三、問題登記

| ID / 優先級 | 問題及原碼位置 | 現況與修復路徑 | 關閉條件 |
|---|---|---|---|
| INS-01 / P0 | 正面coverage早return，跳過負面或待確認key_terms；`src/lib/feature-evidence.ts` | **已重現／PR#16修正**。負面、相關不保及未知先處理，再作正面命中。 | 正反順序皆一致；unknown不被顯示為肯定承保；10個新測試及整合回歸通過。 |
| INS-02 / P0 | CFAR標籤含普通取消與CFUR；全數／零自負額含一般實報實銷；`feature-filters.ts`→`feature-evidence.ts` | **已重現／PR#16部分修正**。較強查詢不接受較弱正面詞，廣義限制仍可否定。 | 普通取消不命中CFAR，non-CFAR不命中；明確CFAR無限制時保留；獨立實報實銷查詢仍有效。其他強勢tag另見INS-07。 |
| INS-03 / P0 | 金額抽取忽略受益對象、保單／曆年與住院／索償差異，可能忽略剩餘條件；`comparable-amount.ts`, `evidence-chart.ts` | **已重現／PR#15修正**。#16已採用同一parser，不再保留第二套。 | 同scope才可數字對照；損壞數字及限定文字不被吞掉；完整scope顯示於圖表，零自負額方向正確。 |
| INS-04 / P0 | 多個不同保障重用不相關摘錄；部分生成器拼接item/limit為quote及預設頁碼 | **來源缺口仍在；PR#13封堵部分上游生成器**。`scripts/enrich_coverage_links.py`、`audit_and_mirror_pdfs.py`、`build_medical_expansion.py`須用#13版本。 | 先停止會再造假引文的路徑，再逐項人工確認產品／級別／原文／上下文；不能只消除警告或換文件名。 |
| INS-05 / P0 | 所有產品／PDF最新性、停售／續保及購買渠道並未全面核實 | **外部內容未核實**。`insurance-data.json`、`evidence-audit.json`及各產品官方來源。#8只處理有限已確認渠道問題。 | 每款有官方現行版本、適用級別、有效日期／停售狀態及可追溯覆核。下載日、HTTP200、文件年份均不能代替。 |
| INS-06 / P0 | 全站印章無條件寫VERIFIED／官方文件核實，與待覆核狀態矛盾 | **PR#19修正印章**；inline及static版中立化，獨立SVG ID與可讀名稱。 | 實際render與頁面無該認證字眼；每個印章引用自己的path；其他About／Compare敘述仍見INS-10。 |
| INS-07 / P0 | 部分特點標籤仍對關鍵字加上更強承諾，例如緊急運送「無上限」、長者「額度不縮水」 | **原碼風險／未全面修正**，`CATEGORY_FEATURE_TAGS`及persona文案。 | 每個強條件有明確結構化證據及正反測試，或降為不帶保證的中立檢索標籤；不因抽到一般字詞宣稱滿足強條件。 |
| INS-08 / P0 | Canonical比較列混合普通取消／CFAR、住院現金／入院保證金，廣義門診也可能錯配；`src/components/compare/canonical-benefits.ts` | **原碼風險／需逐類測試**。#16的feature helper不控制所有canonical row mapping，不能當作此問題已解決。 | 引入明確benefit概念及條件／單位／級別；同名近義不是自動等價；建立錯配fixture和每類映射測試。 |
| INS-09 / P1 | 來源欄位型別未完整驗證；數字source_url可通過快照驗證，PDF處理`.includes`崩潰 | **本輪已重現／未修正**。`data-integrity.ts`與`pdf-evidence.ts`。見下方可執行案例。 | 在載入邊界明確拒絕或安全標示非法optional欄位；來源、quote、page、document等型別均測；不能以fallback到另一來源掩蓋。 |
| INS-10 / P1 | About及Compare仍有舊27／9／85數量、舊快照日及「全部官方文件」保證 | **原碼已確認／待修正**。`components/about/MethodTimeline.tsx`、`pages/Compare.tsx`等。 | 數量來自資料或移除過期常數；來源不完整時說明限制；保留#11分享及#8 purchaseUrl，不整份覆蓋檔案。 |
| INS-11 / P1 | 同URL的PDF換bytes後，僅以JSON欄位綁定的舊引用仍可能成立 | **另有PR#17／待整合及獨立驗收**。其版本hash／讀取前檢查不在#16/#19中。 | 同URL改PDF會明確失敗且不高亮；manifest、timeout、大小、abort和實際bytes一致；hash不能冒稱官方認證。 |
| INS-12 / P1 | 缺失／非法引用頁碼可能被sourceTarget降為第1頁，容易混淆真正引用與閱讀fallback | **原碼風險／待進一步驗證**，`pdf-evidence.ts`、PdfEvidenceViewer。 | 缺頁／無效頁與可閱讀第1頁有分開狀態；未提供明確頁時不把fallback說成已定位該條款。 |
| INS-13 / P1 | 優惠價直接從可選欄位顯示，但缺乏一致有效期／適用人群／報價基準模型 | **原碼風險／內容待核實**，`types/insurance.ts`、ProductCard、Compare、ProductTable等價格入口。 | 過期／未知期限不當現時可買價；顯示參考條件、日期和官方依據；所有入口共用同一判斷，價格測試不用真實個資。 |
| INS-14 / P1 | Search modal、比較托盤storage、clipboard假成功原問題已各有修復，但在獨立支線 | **PR#7/#9/#11已存在／未整合入主線**。 | 同一合併候選重跑focus、Escape、兩分頁同步、失效ID、被拒剪貼簿與手動分享；不可只引用各分支過去成功。 |
| INS-15 / P1 | 手機圖表證據表需左右找狀態／来源，長分類頁認知負擔高 | **另有PR#18手機卡片／展開功能；此分支未包含**。 | 390px及其他常用宽度所有來源／限制可讀、完整展開不刪未知資料、不偽裝Top6推薦、切項目reset且鍵盤可用。 |
| INS-16 / P1 | Compare URL→store及store→URL雙向effects可能在快速切換／back時相互影響 | **原碼風險／未證實事故**，`pages/Compare.tsx`及#9 provider。 | 在整合候選用真browser測分享載入、清空、移除、快速切換、back/forward及跨tab；必要時單一狀態所有者，不能只刪依賴。 |
| INS-17 / P1 | 多條review stack及重複任務令合併易覆寫安全修正，所有功能未有單一整合驗收 | **仍需整合候選PR**。見handoff依賴圖與衝突檔案。 | 明確base/head/merge tree、所有功能都保留、版本一致、全部相關workflows在同一候選通過；不自動部署master。 |
| INS-18 / P1 | 舊AGENTS/GEMINI/template/handoff把未核實內容說完成，允許舊lint錯誤甚至直接發布 | **本文件所屬PR修正**。舊原文保留archive，原路徑導向當前交接。 | active instructions和CI一致；有重現、檔案、測試證據、資料限制、依賴／rollback範本；歷史不可被誤讀成当前指令。 |
| INS-19 / P2 | 小顆粒／分層已改善，但未有Safari及低階Android真機FPS、耗電、長捲動驗收 | **驗收缺口**，ParticleField、Lenis、Hero、Tilt、MethodStory。 | 依裝置記錄scroll frame time、interaction latency、離屏／背景停止及reduced-motion，不能用headless60Hz宣稱所有手機60fps。 |
| INS-20 / P2 | 入口仍有大chunk警告、SPA未做完整SEO預渲染、依賴安全未有本輪完整結論 | **性能／發布驗收缺口**。bundle、dynamic metadata、npm audit及部署設定。 | 建立可量測預算及真實主要路由指標；審查實際依賴audit而非把report-only當安全；預渲染需避免過期保險內容被快取成新資料。 |

## 四、已重現但未修正的資料欄位案例

以下只修改記憶體fixture，不覆寫正式JSON；在Node22的repo根目錄執行：

```sh
node --experimental-strip-types --input-type=module <<'JS'
import { readFileSync } from 'node:fs';
import { parseInsuranceData } from './src/lib/data-integrity.ts';
import { evidenceEntries } from './src/lib/pdf-evidence.ts';
const raw = JSON.parse(readFileSync('public/data/insurance-data.json','utf8'));
raw.products[0].coverage[0].source_url = 42;
const accepted = parseInsuranceData(raw); // currently accepts this invalid optional field
try { evidenceEntries(accepted.products[0]); }
catch (error) { console.log(error.message); } // value.includes is not a function
JS
```

下一個修復應先把這個案例變成失敗測試，再定義optional source/quote/page的拒絕或未知政策。不要只包一個catch然後默認開另一款保險的PDF。相同檢查也要涵蓋保險摘要以外的DataQuality輸入型別。

## 五、接手時的最短執行流程

**先定位版本。** 讀取live master、open PR、head SHA、Files changed與checks。資料使用者沒有批准master部署；工具成功讀取不等於你可以自動合併。確認本地source archive與dependency lockfile相符，禁止將別個分支的測試結果貼過來。

**先選一項可獨立驗收的問題。** 例如INS-09只改validation與相應consumer防禦；不要順便重寫所有PDF或變更保額。與其他agent確認檔案責任，避免重做已存在PR。每項先加可重現失敗，再修root cause，保留正面、反面、未知與極端輸入。

**先執行，再填結果。** `npm ci`、`npm test`、`npm run lint -- --max-warnings=0`、`npm run build`、`npm run test:filters`。涉及Python pipeline／PDFmanifest則按該PR鎖定環境另跑，不把data refresh當unit test。UI要實際keyboard、mobile、error/retry及reduced-motion操作，並檢視截圖。

**再寫PR。** 必須有base/head SHA、舊actual/newexpected、每個檔案作用、確實跑过的命令及失敗輸出、哪部分使用fixture或mock、哪些policies/versions未核實、合併次序及不可以覆蓋的檔案。`Not run`應原樣保留。不要用「全站100%完成」遮住仍未驗收的項目。

**最後做整合驗收。** 目前主線及搜尋／storage／share／curation等旁支不能靠單一branch的綠勾推斷組合後正確。合併候選有新的SHA，必須重新跑所有相關套件並查看結果，特別保留新PDF版本驗證及中立印章browser腳本。

## 六、版本及部署狀態

本輪保留semantic version1.6.1，按各PR遞增Build。平行branch可能各自使用相同序號；真正整合時必須高於所有已選提交並同步Footer，不盲目取ours/theirs。原dataset及PDF不因本輪feature/stamp/docs修正而改動。

這份登記是後續工作入口，不是終局清單。新證據可增加／改變項目；刪除問題需要具體關閉條件已滿足的證據。**工程可靠、來源存在、原文吻合、語義正確、版本現行、個人適合**是不同層次，不能互相代替。
