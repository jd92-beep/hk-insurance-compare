# 2026-09-18 · Verification + pain-point features

Branch: `review/20260918-painpoints-and-fixes`  
Base: master `9e23857` (PR #27+#28 merged)  
Version: **v1.7.6 / Build 20260918.06**

## Complete verification (pre-change master)

| Check | Result |
|---|---|
| Unit tests | 127/127 |
| Lint | 0 |
| Build | pass (main chunk 693 kB warning remains) |
| Filters | 2968 + 90733 |
| Maintenance + citation-shape | pass |
| Semantic policy currency (INS-04/05) | **still open** — 955 reused quotes, snapshot 2026-09-02 |

## Research → delivery mapping

Pain points (Consumer Council / IA / VHIS / IFEC / ICB-aligned design inferences):

1. **Jargon & exclusions** → glossary-in-context (`glossary.ts`, `GlossaryTerm`, KeyTerms/Exclusions wiring)
2. **Wrong product-type compare** → Compare cross-category + multi-tier notices
3. **Evidence trust** → `EvidenceChip` on compare slots + DataQuality/Documents links
4. **Promo staleness** → fail-closed promos already on master; dead strike-through UI removed
5. **Claim process unknowns** → Guides claim/consumer resources (IFEC / IA / ICB / VHIS links; no advice)
6. **Stale marketing counts** → Categories/disclaimer bug fixes below

## Verification bugs fixed

- Categories matrix: hardcoded **9 類別** → live `categories.length`
- Medical “全部有保費表” → product-level **有公開保費欄位（並非全部）**
- Disclaimer hardcoded **2026-08-09** → dynamic snapshot via chip / clause text
- TravelFlagshipBanner **推薦購買／精算結果** → neutral research language
- Persona **投保首選／極平保費** → neutral 摘要檢索 language
- FeaturedCompare: dropped reference-only `travel-aig`; canonical keywords; demo ≠ recommendation
- Search/ProductPicker: **舊資料／暫不作新投保參考** badge + active-first sort
- Category header deep-link to `/guides#{categoryId}`

## New user-facing features

- EvidenceChip (field presence + unverified freshness; never suitability)
- Compare honesty notices (cross-category, multi-tier) + evidence status row + glossary note
- Glossary tooltips in compare key terms / exclusions / product key terms
- Claim & complaint education block on `/guides`
- Integrity tests (`evidence-chip`, `glossary`, `painpoint-integrity`)

## Still not claimed

- All 158 policies semantically/currently verified
- Bundle under 500 kB; real-device FPS; WCAG audit
- Personalised advice / claim success rates / live quotes

## Sources used for design (not user-test proof)

- FCA comparison-site study (2014) — price-led UX risks  
- HK Consumer Council VHIS / virtual insurer materials  
- IA insurance education + literacy framing  
- IFEC product-type explainers; ICB complaint-entry signposting  

Historical survey numbers are not restated as current market ranges.
