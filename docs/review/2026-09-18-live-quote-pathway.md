# 2026-09-18 · Live-quote pathway (honest boundary)

Branch: `review/20260918-live-quote-pathway`  
Version: **v1.7.8 / Build 20260918.08**

## What “live quotes” means here

A static comparison site **must not invent or estimate personal premiums**. There is no licensed live quote feed in this repo.

Delivered instead:

1. **`quotePathway()` classifier** — `published-age-table` | `published-schedule` | `official-quote-only` | `reference-only`
2. **`QuotePathwayCard`** on product premium section — snapshot text + official CTA + prep checklist + hard boundary copy
3. **Richer `PriceRangeBar` / PremiumChip / compare cells** — “本站唔代報價”
4. **Official quote CTA labels** — 往官網即時報價／核對；AIG reference-only has no CTA
5. **Tests** — pathway honesty, AIG no CTA, no invented suitability numbers

## Boundary (stable)

- Site does **not** call insurer quote engines
- Snapshot premium text / age tables ≠ user quote
- Official URL ≠ guaranteed availability or underwriting

## Still needs external work for *true* live quotes

- Licensed insurer/API premium feeds (legal + commercial)
- Or user-directed handoff only (what we ship now)

