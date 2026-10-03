# 保險資料更新與架構覆核（2026-10-02）

目前 162 份記錄仍適合用靜態快照；不用新增 CMS、資料庫或部署服務。真正需要修正的是資料出處和更新流程：舊程式曾將類別通用描述補成個別產品保障，並拼接「引文」。這些入口已停用，現有來源審核改為只讀、可比較前次結果。

## 現有資料流

`public/data/insurance-data.json` → `InsuranceDataProvider`（一次共用載入、`parseInsuranceData` 校驗、可重試）→ 類別／公司／產品／搜尋／收藏／比較頁。同一產品 ID 同時用於分享網址及瀏覽器儲存；修改名稱不應順便換 ID。公司鍵值由現有 canonical 清單管理；代理渠道與承保公司不得憑名稱直接合併。

PDF 原文位於 `public/docs/brochures/`；`scripts/build_pdf_manifest.mjs` 產生內容指紋，PDF viewer 先核對 bytes 再顯示。`audit_evidence.py` 產生 `public/data/evidence-audit.json` 及 `docs/review/05-evidence-audit.md`，全站可檢視逐條缺口。字句存在、條款語義正確、文件現行及可投保是四個不同判斷。

首頁 `src/lib/landing-photos.ts` 把分類、圖像、alt、文案及 CTA 放在同一筆設定；11 個旋轉場景一一對應分類。公司卡片用 `getInsurerColor`；已配置公司用既有顏色，未知公司以完整鍵值決定固定顏色。所有搜尋框共用 CSS 手繪外觀，不改搜尋語義。

## 最短更新流程

1. 從 repository root 執行 `npm run audit:sources`。結果放入全新的 `artifacts/official-sources/<UTC時間>/`，不覆寫快照或舊報告。下次可用 `npm run audit:sources -- --baseline artifacts/official-sources/<前次>/report.json`。報告包括全部產品、來源／投保入口、HTTP、假404、redirect、內容指紋及變動候選；200 或 hash 變化不等於保單正確／變更。
2. 逐項開啟官方產品頁，核對香港地區、承保／代理身份、計劃級別、文件版號、適用日及資格。下載新 PDF 用新檔名保留舊版本；比對表格與限制，不能把官網最新資料套到另一份舊保單。
3. 只改有證據的欄位。每項保障保留 `source_url`、`document_name`、實體 PDF `page`、對應 `quote`；條件、例外、年齡及自負額要跟數字同行。網頁沒有 PDF 頁碼時用 `null`。缺失不填 0；不要從相同類別推測保障。完整舊資料可從 Git 與審核備份還原。
4. `record_status` 是站內記錄狀態。未能核實的入口可留空，但必須明示 `unverified` 及 `review_notes`；已確認 404 的投保連結先停用，不能編一個網址通過檢查。不可由404直接推斷停售。`archived` 記錄保留 ID 和來源，停售須另有證據。個別修正不更新全庫驗證日期；`last_verified_at` 沒有完整核對就維持未知。
5. 優惠要有來源、起訖日、查閱日及條件；報價需保留年齡／地區／日數／級別／徵費基準。無此基準不宣稱是用戶可買價。本次 MyTravel 新表與舊表已存在年齡及徵費差異，暫不將其壓成單一比較價格。
6. PDF 有改動先執行 `node scripts/build_pdf_manifest.mjs`，再執行 `python3 scripts/audit_evidence.py --as-of YYYY-MM-DD`（填實際審核日，PyMuPDF 依 `scripts/curation-requirements.txt`）。執行 `npm run check:maintenance`、`python3 tests/test_official_sources.py`、`npm test`、`npm run lint -- --max-warnings=0`、`npm run build`、`npm run test:filters`。
7. 實際開啟變更產品／比較／PDF頁，確認頁碼、原文、金額條件、手機可讀及失敗提示。更新 `src/lib/version.ts`、當次報告與分類手冊，經 review 才發布。發佈權限另行處理；本地成功不等於已部署。

## 本輪架構修正

- 保留現有 React lazy routes、共享資料 provider、schema、PDF 指紋及引用定位；沒有新增 runtime dependency。
- 校驗失敗後重新載入會清除共用 promise，避免一直拿到同一份無效 JSON。
- 已停用 `data_other_enrich.py`、`data_vhis_enrich.py` 的通用保障填補函數；citation guard 同時拒絕已知模板及「參閱官方保障表第N頁」拼接引文。
- 卡片不把未知／不受保條目當正面賣點，不從分號最後一段推斷「最高級別」，不把無單位或單次旅程金額轉成年費。
- WebGL 建立、載入或 context loss 會回到對應原圖；圖片更新等待初始化，失敗不保留另一分類舊圖。共用原生 reduced-motion hook 回應即時系統偏好變更。
- PDF 首訪導覽使用現有 Radix dialog 管理焦點；鍵盤 Enter／Space 依按鈕本身行為，Escape 可關閉。

## 尚未解決的資料／環境限制

427 網址覆核含 91 個非200結果及 8 個假404；阻擋／超時不可推斷停售。36 份記錄未取得可讀 HTML 來源（可能仍有 PDF 或政府清單）。全庫逐條保單語義及個人核保資格仍未完成；逐項清單見 [來源覆核](../review/2026-10-02-source-review.md)。未做真機 Safari／低階 Android、保險公司登入／個人報價或正式環境部署。
