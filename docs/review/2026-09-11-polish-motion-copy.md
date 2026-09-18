<!-- review-2026-09-18 -->
> **2026-09-18 documentation review:** Historical record; its old counts, screenshots, commands and completion claims are not current acceptance evidence. [delivery review](2026-09-18-release.md). No blanket policy-currentness certificate.
<!-- /review-2026-09-18 -->

# 2026-09-11 Polish: copy clarity + exaggerated UI events

Branch: `review/20260911-polish-motion-copy`  
Version: **v1.7.6 / Build 20260911.07**

## Bugs / robustness

- Promo copy no longer fire-and-forgets `clipboard.writeText`; uses `copyShareText` success criterion + explicit failure toast (`src/lib/ui-feedback.ts`).
- Removed stale hardcoded **9 / 27 / 85 / 2026-08-09** claims from Categories, Category empty state, Guides FAQ.
- Typo fix: 保单 → **保單**.
- Softened overclaims: “資料來自官方文件” → snapshot + not fully re-verified; FilterBar “契合度最高” → “摘要命中最多”.

## Traditional Chinese / Cantonese clarity

- Keep HK Cantonese tone; replace awkward “鍵值” in UI copy with 「站內收錄嘅保險公司」.
- Match badges explain they are **keyword对照**, not underwriting/payout/suitability.
- FAQ adds plain-language definition of 摘要命中.
- Compare/saved/export disclaimers stay explicit (not quotes, not locked premiums).

## Exaggerated events / transactions (UI)

- Shared `MOTION` tokens: bigger enter Y/scale, stronger springs, deeper press.
- Product cards: larger hover lift + scale, press scale, taller color bar, louder compare/promo toasts.
- Tilt cards: default 14° (hero 16°), stronger glare/springs.
- Particles: denser budget (78/34), larger sprites, stronger pointer force.
- Hero parallax travel increased; Lenis scroll slightly snappier.
- Primary buttons: bigger hover lift/shadow, harder press.
- Compare slots: springier enter/exit.

Respects `prefers-reduced-motion` via existing hooks/media checks.

## Verification

Local: `npm test` 110/110, lint 0, build, `test:filters`, `check:maintenance` + citation-shape OK.

## Not claimed

Official product currency; bundle-size work; master deploy until merge + Pages.
