<!-- review-2026-09-18 -->
> **2026-09-18 documentation review:** Current scope and remaining limitations: [delivery review](../../review/2026-09-18-release.md). No blanket policy-currentness certificate.
<!-- /review-2026-09-18 -->

# top-up-medical 維護清單

整理日期：2026-09-18；此類別有 7 個 JSON 記錄，包括歷史或待核資料。這不是已核實、仍在售或全市場產品數。

## 核對次序

先核對公司、產品和級別，然後核對保障期／地區、金額單位、自負額、不保事項及銷售渠道。不要把某計劃的最高額套到整個產品家族。
未有確實證據的「全包／零自付／保證轉保」不可放在標題；類別文案和 filter label 只提供查詢方向，不能替代條款。
本輪只修正有針對性來源支持的項目，剩餘問題見 [逐產品覆核](../../review/2026-09-18-evidence.md) 及網站 `/data-quality`。

| 記錄 ID | 公司／產品（快照原名） | 記錄狀態 |
|---|---|---|
| `topup-aia-extra-medic` | 友邦保險 · AIA友邦「額外醫療保障」附加契約（Extra Medic） | 未全面核實現行條款 |
| `topup-axa-smart-excess` | 安盛保險 · AXA安盛「守慧附加差額」醫療保險（Smart Excess） | 未全面核實現行條款 |
| `topup-bowtie-combat` | 保泰人壽 · Bowtie「觸木保」個人意外醫療加強保障 | 未全面核實現行條款 |
| `topup-bupa-carepro` | 保柏（亞洲） · 保柏「保柏易增值」醫療保障計劃（Bupa Top-up） | 未全面核實現行條款 |
| `topup-cigna-plus` | 信諾環球 · 信諾「附加醫療保障」SMM Plus | 未全面核實現行條款 |
| `topup-fwd-supplementary` | 富衛保險 · FWD富衛「補足您」超額補充醫療（FWD Top-up） | 未全面核實現行條款 |
| `topup-prudential-mediextra` | 保誠保險 · 保誠「附加醫療保」PRUHealth MediExtra | 未全面核實現行條款 |

## 修改後

保持上述 ID 清單與 JSON 一致。逐項來源使用原始 document_name／page／quote；不複用別條保障引文。價格按 [優惠契約](../workflows/update-pricing-and-promo.md) 處理。
核對卡片、表格、手機比較、原文開啟和錯誤回報連結；測試完成才提交 PR。
