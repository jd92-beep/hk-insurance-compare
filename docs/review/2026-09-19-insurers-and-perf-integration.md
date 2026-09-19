# 2026-09-19 · Insurers redesign + perf integration

Branch: `review/20260919-perf-integration`  
Version: **v1.8.0 / Build 20260919.04**

## User asks

1. Company-first insurers tab: cards per insurer → detail lists products **by category**
2. Page/tab show-up ~0.5s after click

## What landed on master first (PR #33)

- `/insurers` company cards (category chips + counts; sort = 站內覆蓋，唔係質素排名)
- `/insurers/:insurerKey` detail: products grouped by `CATEGORY_ORDER`
- Hash anchors `#INSURER` preserved for browser scripts
- Partial perf already on that head (lazy Home, prefetch, provider)

## Perf integration (this branch = #33 + PR #34)

| Metric | Before master | After integration |
|---|---:|---:|
| Main `index-*.js` | ~729 kB | **~84 kB** |
| GSAP | in main | vendor chunk on demand |
| Home route | in main | lazy ~19 kB |
| insurance-data.json | no preload | HTML preload + single-flight fetch |

Honest 0.5s: **warmed SPA route shell can be well under 0.5s on desktop**; cold CJK content + full JSON often still >0.5s — not guaranteed on mobile/high RTT.

## Gates

179/179 tests · lint 0 · tsc 0 · build · filters · maintenance
