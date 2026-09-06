# 引用匯入：停止自行製造證據

## 已確認的上游問題

舊 `enrich_coverage_links.py` 把網站自己的 `item`／`limit` 拼成 `quote`，未讀 PDF 就填預設第 1 或第 36 頁；找不到對應條款時，採用第一條 citation。其 map 亦曾把 `high-end-prudential-apex` 指向信諾 PDF。這些都不能證明網站保障主張。

舊 `audit_and_mirror_pdfs.py` 的 `sanitize_outdated_citations` 只將 2019／2020 年份文字改為「現行有效版」，沒有替換或核實新文件。檔名有年份、HTTP 200、或本地存在 PDF，均不能證明最新。

`build_medical_expansion.py` 會呼叫上述舊 enrich 入口，仍斷言只有 116 產品，並有未寫入檔案卻印「Successfully wrote」的訊息。因此三個舊入口均改為清晰拒絕（exit 2），不再改資料。原始實作保留在 Git 歷史供追溯；官方 VHIS pipeline `build_vhis.py` 不在此次改動範圍。

## 新工具的邊界

`curate_citations.py` **不是自動保險內容核實器**，亦不會抓取官網。它只接受操作員逐项覆核的修改清單，核對：

1. 原始 JSON bytes SHA-256；產品 ID、insurer、coverage index、原 item 與 limit 必須一致，防止改錯列／舊版本覆蓋。
2. 明確既有 `/docs/brochures/` PDF、PDF bytes SHA-256（parser讀取同一批已驗證bytes，不重新開檔）、1-based實體頁碼；不得猜檔名、預設頁碼或改寫成「最新版」。
3. 摘錄經 NFKC／空白正規化後，必須在指定頁面精確且唯一出現。找不到、重複、掃描而無文字層時拒絕，不做 fuzzy fallback／OCR／自行生成 quote。
4. 不同保障共用同一摘錄時，必須提供 `shared_quote_reason`，並在操作員紀錄保留理由。理由是人工陳述，不是自動證明。
5. `reviewer`、`reviewed_on`、`review_note`、`official_url` 明確記錄；這些是操作員提供的資料，沒有驗證身份或線上官網權威性。

**就算全部通過，也只表示文件／頁面／文字一致，不表示文字足以支持保額、產品相符、生效版本最新、可供新投保或適合某人。** 收據固定 `latest_or_semantic_content_verified: false`、`reviewer_identity_authenticated: false`，不往網站加任何「已驗證最新」標籤。

## 使用方式

Python 3.10+，在審核環境安裝 `pip install -r scripts/curation-requirements.txt`。CI釘選 PyMuPDF 1.28.2；這只供本地／CI的PDF檢查，不加入前端bundle。授權遵循套件本身的AGPL／商業授權條款，部署用途需自行確認。

操作員建立 `review/approved-citations.json`：最外層為 `schema_version: 1`、`dataset_sha256`、`changes`。每筆 change 必須提供：

`product_id`, `expected_insurer`, `coverage_index`, `expected_item`, `expected_limit`, `source_url`, `document_name`, `page`, `quote`, `pdf_sha256`, `official_url`, `reviewer`, `reviewed_on`, `review_note`。

`coverage_index` 從0開始；PDF `page` 從1開始，指實體頁而非印刷頁標。`source_url` 的 `#page=N` 必須與page一致，或省略fragment由工具補回。每批1–500筆，manifest上限2MiB、單PDF上限64MiB。

```sh
# 先人工確認同一產品／地區／級別／保單版本，再取得實際檔案雜湊。
sha256sum public/data/insurance-data.json public/docs/brochures/policy.pdf

# 預設只驗證，stdout為可保存的覆核收據，不改任何來源檔。
python scripts/curate_citations.py --manifest review/approved-citations.json

# 全批通過才輸出全新的proposal；不允許覆寫原資料、manifest或既有檔案。
python scripts/curate_citations.py --manifest review/approved-citations.json \
  --output review/proposed-insurance-data.json

git diff --no-index public/data/insurance-data.json review/proposed-insurance-data.json
```

上面的 `policy.pdf` 只代表操作員選定的實際檔案名稱，沒有附送虛構保額／quote或可以直接套進正式資料的示例manifest。`--data`／`--public-dir` 可指定隔離測試副本。

完成語義／產品／最新版人工覆核後，才在另一個內容PR審查proposal；按專案規範同步版本、重跑來源審核及UI連結測試。新工具只更新指定coverage的來源四欄，不修改item、limit、產品、促銷價或任何PDF。

## 回退及未完成項目

此PR不清除既有錯誤引用，亦不把158產品標為最新；現有問題仍以PR #8審核清單逐項處理。資料本身、PDF bytes及部署不變。需要追溯舊腳本可看Git歷史，不建議重新執行。

其他歷史資料生成器、官網定期更新、PDF下載／鏡像取得和人工內容審查仍是獨立工作。本次專門封堵已確認會合成引文或重新包裝舊版本的匯入路徑。
