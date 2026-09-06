# 中立來源印章與SVG引用隔離

## 原因
即使所有產品尚未完成最新版及內容覆核，inline印章及public/stamp-seal.svg仍印VERIFIED／官方文件核實；這是可見的信任錯誤，不是單靠頁尾免責聲明能修復。重複render的StampSealIcon還使用同一個seal-arc ID，SVG引用未能與instance隔離。

## 已實作
保留原有印章雙環、字體、顏色、大小、動效和currentColor，不重做首頁構圖。文案改為SOURCE REFERENCE／核對原文，中心為來源／參考。StampBadge兩個render分支都以role=img提供中立aria-label及tooltip，明示不是內容或版本認證。

每個inline SVG由React useId產生instance ID，再逐codepoint編碼為XML安全fragment；path.id和textPath.href使用同一值，沒有random/time/counter或重複staticID。獨立SVG檔由img資源載入時仍保持自己獨立的document ID空間。

## 重現與驗收
node --experimental-strip-types --test tests/neutral-stamp.test.mjs

測試用既有esbuild編譯真正TSX，再用react-dom/server渲染，不是假設source字串等於DOM。四個印章的ID及引用必須一對一，inline/static文字不能含VERIFIED或官方文件核實，animated與靜態badge都必須有中立accessible name。舊程式3/3失敗；修改後3/3pass，完整48/48unit、零警告lint、build通過。

browser_stamp_review.mjs在GitHub Chromium兩viewport實際檢查首頁多印章、自己的path、無溢出、staticSVG內容與截圖；已加入既有Browser review且失敗exit1。尚未觀察remote結果時，不可把加入測試說成已完成瀏覽器驗收。

## 邊界
沒有建立認證制度；沒有將未核實資料改名為已核實，也沒有修改任何PDF／保障額。其他頁面的過度保證文案需按problem register繼續核對。此小型PR基於#16，Build20260906.25；Revert可回退，無migration。
