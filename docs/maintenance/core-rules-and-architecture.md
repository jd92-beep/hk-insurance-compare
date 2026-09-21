<!-- review-2026-09-18 -->
> **2026-09-18 documentation review:** Current scope and remaining limitations: [delivery review](../review/2026-09-18-release.md). No blanket policy-currentness certificate.
<!-- /review-2026-09-18 -->

# 資料與介面契約

JSON 是快照。來源、PDF mirror、機械 evidence ledger、UI 摘要、優惠及銷售渠道的狀態互相獨立。
保留 canonical insurer identity；不要因名稱近似合併公司或計劃。未知不等於不保，排除／有條件資料不能變成 positive match。
搜尋產品名稱用 catalogue-search；保障關鍵字用 feature-evidence；零自負額與全數賠償不可互換。
priceDisplay 不產生即時數字報價；promoDisplay 需要有效日期及條件；purchaseUrl 控制歷史／渠道連結。
PDF 核對失敗保留原文及錯誤，不能用第一份引文或頁1作假證據。
UI 先呈現名稱、限制、計劃差異、來源狀態；不根據最高限額選勝者。手機把同一問題下的所有公司列出。
TiltCard 用外層固定命中範圍、內層傾斜；焦點／觸控／減少動態效果不傾斜。網格拉高時 stage 同卡殼必須 `h-full` 填滿；唔好喺空 stage 高度上畫 face shadow（會出淺色 ghost 方形）。卡在 TiltCard 入面唔好再加 `hover:-translate-y-*`。ParticleField 有界圖集與可取消 frame loop。

完整測試及發佈邊界見 [AGENTS.md](../../AGENTS.md) 及 [當次交付](../review/2026-09-18-release.md)。
