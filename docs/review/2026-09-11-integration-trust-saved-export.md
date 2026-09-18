# 2026-09-11 Integration candidate (trust + saved comparisons + export)

Branch: `review/20260911-integration`  
Base line: master `9f8433e` → trust branch `83e3b88` (PR #24) → this integration commit  
Version: **v1.7.5 / Build 20260911.06**

## What is combined

| Source | Content | Integration choice |
|---|---|---|
| PR #24 `review/20260911-trust-and-honesty` | INS-09 boundary, INS-07/08/10/13 honesty work, evidence-status, premium-display, curation guard | Kept whole |
| Open PR #22 `review/20260908-saved-comparisons` | `SavedComparisons` + `src/lib/saved-comparisons.ts` + tests + browser script + workflow | Feature files taken from PR #23 head |
| Open PR #23 `review/20260908-comparison-export` | `ComparisonExportButton` + `src/lib/comparison-export.ts` + tests + browser script + workflow | Feature files taken from PR #23 head |
| Open PR #21 `review/20260908-evidence-boundary` | Older INS-09 on stale base, **CONFLICTING** with master | **Not merged**; superseded by PR #24 INS-09 |

## Conflict resolutions

- `src/lib/version.ts` → integration build **20260911.06**, APP_VERSION **1.7.5** (newer than all contributing heads in this tree).
- `src/pages/Compare.tsx` → **both sides preserved**:
  - keep `priceDisplay` honesty from PR #24 (reference prices, buyLabel only with safe URL)
  - keep PR #23 copy: no “全部摘自官方文件” overclaim; grid label 網站摘要與來源對照
  - keep PR #22/23 features: `SavedComparisons` + `ComparisonExportButton` on empty and filled states
  - keep share button; empty-state CTA “瀏覽所有保險類別” (no hardcoded 9)
- PR #21 branch content for `data-integrity.ts` / `pdf-evidence.ts` intentionally **not** taken over PR #24 versions.

## Local verification on this integration tree

| Check | Result |
|---|---|
| Node | v22.22.3 |
| `npm test` | **107/107 pass** (includes saved-comparisons + comparison-export + evidence-boundary + premium-display) |
| `npm run lint -- --max-warnings=0` | **exit 0** |
| `npm run build` | **success** (large-chunk warning remains) |
| `npm run test:filters` | **2968 + 91085 assertions, 0 fail** |
| `npm run check:maintenance` | **10/10 + citation-shape OK** |
| Browser scripts (playwright) | **Not run locally** — depend on `PLAYWRIGHT_MODULE`; CI workflows added from #22/#23 should run after push |

## Content pass (same branch)

See `docs/review/2026-09-11-content-pass-ins04-ins05.md`.

- `travel-aig` lifecycle set to discontinued (2026-09-06) using existing official-channel notice evidence.
- High-risk reused-quote queue documented; no fabricated citations.

## Integration / release rules

1. This PR is **not** an authorization to merge to `master` or deploy; `master` is deployment-connected.
2. After any further merge: bump `BUILD_NUMBER` above every contributing head; keep `APP_VERSION` / `package.json` / `package-lock` aligned.
3. Rerun on the **exact** merge SHA: `npm ci`, `npm test`, `npm run lint -- --max-warnings=0`, `npm run build`, `npm run test:filters`, `npm run check:maintenance`, plus browser workflows for compare store/share, saved comparisons, export, PDF integrity, neutral stamps, evidence boundary.
4. Close or retarget open PR #21 as superseded by #24; #22/#23 may be closed if this integration PR is accepted, or rebased onto it.
5. Do not resurrect archived handoff release commands or claim INS-04/05 closed.

## Rollback

Revert integration commits; PDF/manifest and product coverage limits unchanged except documented AIG lifecycle metadata. No migration.
