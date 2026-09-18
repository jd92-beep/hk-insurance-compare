# 2026-09-18 evidence, comparison and depth review

Baseline: `701c11714d4e1ab3e1bffbb3c67e876c222b57b8` on `master`.

## Scope and release boundary

The user authorized implementation and pull requests, not merging or deployment. Work stays on `review/20260918-*`. Preserve Traditional Chinese (Hong Kong), existing paper/ink/jade/amber tokens, item-level sources, negative/conditional evidence, saved comparisons and Markdown exports. Do not restore the intentionally removed CategoryDecisionGuide or introduce suitability scores or live-price claims.

## Independent deliverables

1. Evidence: enumerate every product and document; investigate current official sources; distinguish corrected claims, reviewed claims and unresolved claims; never move a data timestamp forward as a substitute for review. Add regression protection for stale, future, invalid and missing evidence dates.
2. Comprehension: explain what is covered, what the reader pays, and key limitations before secondary detail; retain original policy wording in an expandable evidence path. Use plain zh-HK, readable controls and an honest comparison basis.
3. Depth and polish: improve cards, gemstones and page layering without distorting reading surfaces or making controls move away from the pointer. Respect reduced motion, touch input, keyboard focus, hidden tabs and offscreen rendering. Audit Markdown after implementation and record remaining gaps.

## Research boundaries

Use insurer/government sources for insurance facts. Consumer and regulator research informs design priorities, not product benefits. Historical overseas comparison-site findings must be labelled with jurisdiction and research date.

## Verification

Use Node 22 with the existing lockfile. Required application gates: `npm ci`, `npm test`, `npm run lint -- --max-warnings=0`, `npm run build`, `npm run test:filters`. Add focused regressions before behavioral changes and inspect actual desktop/mobile browser artifacts. Record exact tested commits and remaining blocked checks. A GitHub Actions source bundle enables inspection in a network-restricted review environment; it is not evidence that policies are current.

## Initial status

- Live repository and baseline read.
- Baseline CI run `35310611150` reports success; this is not verification of subsequent changes.
- Initial documentation has blanket authority/currentness language requiring review.
- No policy values changed or certified at this stage.
- No subagent-launch capability is available in this chat; no spawned agents are claimed.
