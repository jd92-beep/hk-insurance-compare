# 04 — Goals

## Product goal
香港最可信嘅保險格價網站：**每一個數字都有官方出處**，一般市民唔使睇 PDF 都明邊份計劃啱自己。

## What "good" looks like (measurable)
1. **Coverage completeness** — every VHIS certified product (standard + flexi) present and findable; every insurer offering VHIS represented in the medical category. Status: 28/30 active providers in comparison, 103/103 certs in registry. Remaining: flexi benefit/premium depth.
2. **Data accuracy** — 100% of quantitative claims traceable to an official document (citation: file + page + quote). New data must come from scripts reading official sources, not hand-typed numbers.
3. **Comparison quality** — canonical benefit alignment across all categories with no mis-mapped rows; best-value highlighting that never misleads (ties stay neutral).
4. **Single-plan clarity** — a shopper landing on any product page gets the decision-critical facts (limit, premium by age, cert number, form, entry age, guarantees) above the fold, and official documents one click away.
5. **Freshness** — VHIS data refreshable in one command (`scripts/build_vhis.py`) and ideally auto-refreshed on a schedule.
6. **Performance & quality gates** — initial JS < 300 KB, zero lint errors, core data parsers unit-tested, CI green on every push.
7. **Trust & compliance tone** — never present the site as advice; disclaimers stay prominent; withdrawn/renewal-only products always flagged, never silently dropped or silently sold.

## Non-goals (for now)
- No user accounts, no quote purchase/lead-gen flows, no backend.
- No English/Simplified Chinese locale (site is zh-HK only).
- No non-VHIS medical products beyond what's already curated.
