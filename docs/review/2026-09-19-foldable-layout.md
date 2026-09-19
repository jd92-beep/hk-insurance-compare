# 2026-09-19 · Foldable phone layout

Branch: `review/20260919-foldable-layout`  
Version: **v1.8.1 / Build 20260919.05**

## Problem
Foldable phones left **dead space on the right** — card grids stayed 1-col until `md` (768px), Compare used a fixed 200px label column, product content capped at 780px, mobile breakpoint ignored unfolded 843–904px widths.

## Fixes
| Area | Change |
|---|---|
| Tailwind | `fold: 600px`, `unfold: 840px`, `fold-wide: 900px` screens |
| Containers | Tighter mid-width padding `clamp(16px, 3.2vw, 48px)` |
| Card grids | `grid … fold:grid-cols-2 lg:grid-cols-3` on Insurers, InsurerDetail, CategoryDetail, Guides, CategoryGrid, trust/family panels |
| Compare | Fluid label column `clamp(7.5rem, 18vw, 12.5rem)`; `useIsMobile` breakpoint **768 → 900** so foldable widths use question-based compare |
| Product page | Full-width main until `xl`; side rail `fold-wide+` fluid `min(300px,34%)`; `overflow-x-clip` |
| Documents | Mid-width two-pane via `fold-wide` |
| Hero | `overflow-x-clip` on hero grid |

## Visual verification
Playwright preview at **360 / 573 / 673 / 843 / 904 / 1024** × 8 routes (home, categories, category-travel, insurers, insurer detail, compare, guides, product).

- Screenshots: `foldable-qa-evidence/fixed2/`
- Report: `foldable-qa-evidence/fixed2/report.json`
- Result: **0 flags** — `main` width = viewport; primary card grids fill available width; no horizontal overflow

## Gates
179/179 tests · lint 0 · tsc 0 · build · filters · maintenance

## Note
`npm run check:maintenance` / evidence honesty unchanged. Layout only.
