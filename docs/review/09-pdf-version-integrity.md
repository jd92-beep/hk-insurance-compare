# PDF bytes 與條款連結版本綁定

舊 evidence fingerprint 只包含 item/limit/quote/url/page 等摘要欄位。同一 PDF URL 被換檔而摘要不變時，分享指紋亦不變；舊頁碼可能指向另一版本。先以回歸測試重現，再作以下修正。

## 行為

`build_pdf_manifest.mjs` 對全部既有鏡像 PDF 計算 SHA-256，生成編入 app 的版本清單。每次 dev/build 先做 `--check`；增刪或替換 PDF 但沒有覆核及同步清單會停止構建，不會自動把新 bytes 當已核實。

證據分享 fingerprint 綁定該鏡像的 SHA-256。閱讀器只對已列入清單的本站鏡像發起請求，完整下載並比對 hash，通過後才將**同一批 bytes**交給 PDF.js。網頁 fallback、鏡像被替换、清單缺失、下載超限或逾時都有明確錯誤，沒有畫布／高亮假成功。

## 限制及取捨

SHA-256 僅證明收到的 bytes 與此 app 版本的已保存鏡像一致。它不證明來源權威、保障文字支持網站主張、適用於特定保單、或官方最新有效版本；不是保險公司簽章。原有引用指紋也不是身份認證。

為在顯示前驗證全份文件，本實作不使用 PDF.js range streaming：首頁需先下載整份 PDF。下載最多32 MiB、30秒timeout、有stream增量限長與AbortController；現有81份鏡像均低於限制。記憶體仍包括下載區塊、合併bytes及PDF.js成本，唔聲稱整個閱讀器RAM上限只有32 MiB。

新 fingerprint 加版本域，舊格式分享連結會提示內容已改變，需重新選擇及分享。外部來源仍直接去來源網站，不代理或冒稱已驗證外部文件。沒有改動保險數字、摘錄、dataset或PDF。

## 更新鏡像

在獨立內容PR先核對官方版本、產品／地域／級別、實體頁碼與原文。然後執行：

```sh
node scripts/build_pdf_manifest.mjs
node scripts/build_pdf_manifest.mjs --check
npm test
npm run build
```

將經核對的PDF、來源更新及新manifest一同審查。不要以改檔名成「current」或只更新hash取代內容審核。

## 驗證

單元測試包含同URL不同PDF指紋、bytes相同／改動、HTML拒絕、81份清單一致、未列文件零network、取消傳遞、大小上限。新增GitHub Chromium兩viewport測試替換實際AIG鏡像bytes，要求未渲染且零高亮；撤銷替換後相同入口恢復原文高亮。既有縮放／翻頁／stale引用驗證保留。

沒有加入runtime dependency或自動部署；回退本PR會恢復原本不檢查鏡像bytes的讀取方式。
