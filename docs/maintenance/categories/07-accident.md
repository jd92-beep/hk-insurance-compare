<!-- review-2026-09-18 -->
> **2026-09-18 documentation review:** Current scope and remaining limitations: [delivery review](../../review/2026-09-18-release.md). No blanket policy-currentness certificate.
<!-- /review-2026-09-18 -->

# accident 維護清單

整理日期：2026-09-19；此類別有 16 個 JSON 記錄，包括歷史或待核資料。這不是已核實、仍在售或全市場產品數。

## 核對次序

先核對公司、產品和級別，然後核對保障期／地區、金額單位、自負額、不保事項及銷售渠道。不要把某計劃的最高額套到整個產品家族。
未有確實證據的「全包／零自付／保證轉保」不可放在標題；類別文案和 filter label 只提供查詢方向，不能替代條款。
本輪只修正有針對性來源支持的項目，剩餘問題見 [逐產品覆核](../../review/2026-09-18-evidence.md) 及網站 `/data-quality`。

| 記錄 ID | 公司／產品（快照原名） | 記錄狀態 |
|---|---|---|
| `accident-aia` | 友邦保險 · 超卓越個人保障計劃 / Xtra Protect (XP) | 未全面核實現行條款 |
| `accident-axa` | 安盛 · 「卓越」豐盛守護樂 | 未全面核實現行條款 |
| `accident-boc-group-insurance` | 中銀集團保險 · 人身意外綜合保障計劃 | 未全面核實現行條款 |
| `accident-blue-cross` | 藍十字 · 個人意外保險（360°保障系列） | 未全面核實現行條款 |
| `accident-chubb` | 安達保險 · 個人意外保障 | 未全面核實現行條款 |
| `accident-dah-sing` | 大新保險 · 「心意保」個人意外保障計劃 | 未全面核實現行條款 |
| `accident-fwd` | 富衛 · MySafe 意外保障計劃 | 未全面核實現行條款 |
| `accident-msig` | 三井住友保險 · iSafe 意外保險 | 未全面核實現行條款 |
| `accident-prudential` | 保誠 · 意外保系列 | 未全面核實現行條款 |
| `accident-zurich` | 蘇黎世保險 · 「自在守護」個人意外保險計劃 | 未全面核實現行條款 |
| `accident-bowtie` | 保泰人壽 · Bowtie「觸木保」個人意外保 | 未全面核實現行條款 |
| `accident-blue` | Blue 保險 · Blue「WeCare 個人意外保險計劃」 | 未全面核實現行條款 |
| `accident-generali` | 忠意保險 · 忠意保險「智選個人意外保」 | 未全面核實現行條款 |
| `accident-sun-life` | 香港永明金融 · 永明金融「自在生活意外保」 | 未全面核實現行條款 |
| `accident-manulife-thankful-care` | 宏利 · 相伴無憂個人意外保險計劃（官方產品頁收錄；保費欄未公開） | 未全面核實現行條款 |
| `accident-manulife-take-care` | 宏利 · 「萬無一失」個人意外保障計劃 / 附加保障2（官方產品頁收錄；保費欄未公開） | 未全面核實現行條款 |

## 修改後

保持上述 ID 清單與 JSON 一致。逐項來源使用原始 document_name／page／quote；不複用別條保障引文。價格按 [優惠契約](../workflows/update-pricing-and-promo.md) 處理。
核對卡片、表格、手機比較、原文開啟和錯誤回報連結；測試完成才提交 PR。
