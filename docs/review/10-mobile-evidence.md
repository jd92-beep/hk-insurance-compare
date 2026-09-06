# 保障對照的手機閱讀與分段展示

實際#14截圖反映：390px手機原表格需橫向捲動才看見狀態／來源；整段表格很長，亦令截圖只截到中段而不是標題及操作。此次改動不碰保障金額、排序或判斷邏輯。

## 已實作

EvidenceRows將手機顯示改為直排卡片，同卡保留公司、完整產品名、原有摘要、比較狀態與PDF入口。桌面保留語義table、caption、column/row headings。兩種呈現共享同一批資料與sourceHref，不另造mobile摘要。

預設按原資料次序顯示六款，明確寫顯示N/總數、不是排名；可展開全部及收起。unknown／缺摘要資料沒有被丟棄。切換保障項目或產品集合會重設展開狀態。沒有加新動畫依賴或推算保險適合度。

## 驗證

2個新增preview測試先red後green；本地44/44總unit、lint零警告、TypeScript／production build通過。

22組GitHub Chromium chart regression加上手機卡片可見性、無橫向卡片閱讀、六項概覽、完整展開、收起、切換項目重設與PDF連結。保留舊scope/overflow checks。截圖改為明確捲至標題及摘要區頂部，唔以長section中心截圖當排版證明。遠端exact-head結果見PR。

所有舊資料與PDF原檔不變，無migration，未合併master。此PR只改善比較閱讀；官網最新條款仍須核實，沒有把資料顯示完整稱為內容已核實。
