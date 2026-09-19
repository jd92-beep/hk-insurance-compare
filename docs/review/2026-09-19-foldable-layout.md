# 2026-09-19 · Foldable phone / mid-width layout

**Branch:** `review/20260919-foldable-layout`  
**Version:** APP_VERSION **1.8.1** · BUILD_NUMBER **20260919.05** · BUILD_DATE 2026-09-19  
**Scope:** Layout only. zh-HK UI copy unchanged. No insurance data / policy claim changes.

## Problem (user report)

On foldable phones, cards and content left **dead space on the right** — layout did not fully use page width on half-open (~573/600/673/717) and unfolded (~843/884/904) widths.

## Root causes

1. Card grids used `md:` (768) / `xl:` (1280) — 1-col on half-open foldables; category/insurer product cards stayed 2-col until xl 1280.
2. Compare sticky slot row used fixed **`200px`** left label column; ComparisonGrid sticky header used `w-44` (176px) — mismatch + left void.
3. ProductDetail main column capped **`max-w-[780px]`** while side rail was hidden below `lg` (1024) — right gutter on unfolded foldables.
4. Tables / Documents / CoverageMatrix used large fixed `min-w-*` or `lg`-only sidebars.
5. `site-container` padding `clamp(20px, 4vw, 48px)` left only ~92% fill on mid widths.

## Fixes

| Area | Change |
|---|---|
| Tailwind screens | Consolidated single set used by components: `fold: 560px`, `fold-wide: 840px` (+ aliases `unfold` 840, `widefold` 900) |
| Containers | `.site-container` / `-wide` padding `clamp(16px, 3.2vw, 48px)`; `html/body { overflow-x: clip }` |
| Compare label | `.compare-label-col { width: clamp(7.5rem, 18vw, 12.5rem) }` on Compare slots + ComparisonGrid sticky headers |
| Company cards (priority) | `Insurers` / `InsurerDetail`: `grid-cols-1 fold:grid-cols-2 lg:grid-cols-3` |
| Category product cards (priority) | `CategoryDetail`: `fold:grid-cols-2 lg:grid-cols-3` (was `md:2 xl:3`) |
| Home / Guides / Footer / trust panels | Multi-col from `fold` |
| ProductDetail | Main `max-w-none` until `xl`; side rail from `fold-wide` with fluid width; `overflow-x-clip` |
| `useIsMobile` | 768 → **900** so half-open/unfolded foldables use card / MobileCompare UX instead of cramped desktop table |
| Tables | Fluid min-widths (ComparisonGrid, ProductTable, CoverageMatrix, MedicalPath, FeaturedCompare) |
| Documents | Fluid sidebar grid from `fold` |

## Visual verification

**Browser:** Chromium headless (Playwright Python 1.63 / Chrome for Testing 153)  
**Server:** SPA static `dist/` at `http://127.0.0.1:4174` on this branch build  
**Viewports:** 360, 573, 673, 843, 904, 1024  
**Routes:** `/`, `/categories`, `/category/travel`, `/insurers`, `/insurers/安盛`, `/compare?ids=travel-axa,travel-blue-cross`, `/guides`, `/product/travel-axa`

### Evidence paths

| What | Path |
|---|---|
| Harness | `foldable-qa-evidence/foldable_qa.py` |
| Baseline report | `foldable-qa-evidence/report-baseline.json`, `foldable-evidence/report-baseline.json` |
| After report | `foldable-qa-evidence/report-after.json`, `foldable-evidence/report-after.json` |
| Baseline shots | `foldable-qa-evidence/baseline/<w>-<route>.png`, copies `foldable-evidence/baseline-*.png` |
| After shots | `foldable-qa-evidence/after/<w>-<route>.png`, copies `foldable-evidence/after-*.png` + flat `foldable-evidence/<w>-<route>.png` |
| Independent util script | `foldable-qa-evidence/fixed2/` |

### After results (`foldable_qa.py`, this branch build)

| Band | Flags | Content fill |
|---|---|---|
| **573 / 673 / 843 / 904 / 1024** | **0** | **93.6–100%** on priority routes |
| 360 (phone cover) | 2 residual | category-travel fill 79.4% (nested chrome padding); product overflow 99px (was 103px) |

**Live grid templates after (measured):**

- `/insurers` @573–904: `fold:grid-cols-2` — e.g. @843 two ~383px company cards (FWD + AXA side by side). Baseline was 1-col until md 768.
- `/insurers/安盛` product cards @573–904: `fold:grid-cols-2`
- `/` home category cards @573–900: `fold:grid-cols-2`
- Compare label column fluid (no fixed 200px)

Fill deltas vs baseline: typically **+1.6pp** (padding); `/insurers` @573 primary box **92% → 100%**.

### Residual (documented; not foldable mid-width band)

- 360 category-travel: nested decision/HowWeRank chrome still adds ~37px side gutters (improved from 41px).
- 360 product header chips/tables: ~99px horizontal overflow remains (improved 4px).

## Automated gates (this head after version pin)

| Command | Result |
|---|---|
| `npm test` | **179/179 pass** |
| `npm run lint -- --max-warnings=0` | **pass** |
| `npx tsc -b` | **pass** |
| `npm run build` | **pass** (vite 7) |
| `npm run check:maintenance` | **pass** — APP_VERSION / package.json / package-lock **1.8.1**, BUILD_NUMBER **20260919.05** |

## Delivery gates

- Do **not** merge to `master` until GitHub Actions CI is fully green on the PR head **and** screenshot evidence is reviewed.
- `master` is deployment-connected; green PR ≠ deploy authorization.

## Unverified / out of scope

- Real foldable hardware / Android Chrome / Safari iOS not run (Chromium desktop headless only).
- Reading-measure `max-w-[36em]` / `max-w-[38em]` prose caps left intentional.
- Policy content, citations, PDFs unchanged — not re-verified by this PR.
- Some QA screenshot PNGs are blank (timing); numeric after-report + live grid templates + non-blank shots (e.g. `after-843-insurers.png`) are the authoritative visual evidence.
