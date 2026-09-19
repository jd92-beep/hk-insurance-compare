# 2026-09-19 · Searcher pain-point research → features

Branch: `review/20260919-search-painpoints`  
Version: **v1.7.9 / Build 20260919.01**

## Research inputs (subagents)

1. **Pain-point scan** — false equivalence on benefit labels, age-banded cuts (CC), rider/standalone, opaque ranking distrust, decision paralysis, lead-gen/fraud VHIS ads, deductible overpay, claim anxiety.
2. **Searcher journey** — awareness → shortlist → verify → quote handoff; static sites fail at apples-to-oranges, trust, and fake quote expectations.
3. **Codebase gap audit** — decision scaffolds existed but unmounted; search identity-only; exclusions unclustered; medical paths fragmented.

## Shipped responses

| Research finding | Feature |
|---|---|
| Opaque ranking distrust | **HowWeRankCard** on category — default = 摘要命中排序（非贊助）, user-selectable sort, no lead-gen language |
| Lead-gen / fake VHIS | **TrustPanel** — no accounts/phones; official-host links only; VHIS fraud warning; 投訴宗數 ≠ 拒賠率 |
| VHIS vs company medical confusion | **MedicalPathCompare** educational matrix (no winner) |
| Scenario / intent search | **research-intents** + SearchPalette **教育／導航** group + empty-state chips |
| Same label ≠ same cover | **ExclusionThemes** on product/compare/mobile (lexical; excerpts always shown) |
| Age-banded benefit cuts | **AgeReductionNotice** — lexical warning only; no invented % |
| Decision paralysis | **CategoryDecisionGuide** mounted + persona **摘要檢索** chips + Compare 比較基準 strip |
| Stale “9 類” copy | GuidesTeaser uses `CATEGORY_ORDER.length` |

## Honesty ceiling

Snapshot ≠ policy truth. Theme/age lexical hits ≠ proven exclusions or reduction amounts. No suitability scores, no insurer rankings from complaints, no live quotes, no lead capture.

## Sources informing design (not user-test proof)

Consumer Council travel/VHIS materials; SCMP on claims disputes; VHIS.gov.hk official plan search/fraud notice; IA/ICB/IFEC education; peer-reviewed decision-overload literature; behavioural excess studies; comparison-site trust critiques.

