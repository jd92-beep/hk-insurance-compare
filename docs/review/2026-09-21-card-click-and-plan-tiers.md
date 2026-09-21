# 2026-09-21 · Card Blanket Click Navigation & Plan Tiers Separation

**Branch:** `review/20260921-card-click-and-plan-tiers`  
**Version:** APP_VERSION **1.8.7** · BUILD_NUMBER **20260921.07** · BUILD_DATE 2026-09-21  
**Scope:** UI / Interaction & Detail View Architecture. Policy snapshot content and claims unchanged.

## 1. Feature 1: Card Blanket Click Navigation

### Problem
Clicking empty areas/padding of cards (e.g., insurer cards, product cards, guide cards) did not navigate to their corresponding detail pages, requiring users to click precise text links.

### Solution
- **Helper (`src/lib/card-navigation.ts`)**:
  - Implemented `handleCardClickNavigation(e, targetHref, navigate)`.
  - **Text Selection Guard**: If user highlights/copies text (`window.getSelection()`), navigation is aborted.
  - **Interactive Element Isolation**: Automatically lets internal buttons (e.g., "加入比較"), category chips, and external quote links handle their own events without triggering card navigation.
  - **Power User Support**: Handles `Cmd + Click` and `Ctrl + Click` to open in a new tab via `window.open`.
- **Integrated Cards**:
  - `InsurerCard.tsx`: Blank space clicks navigate to `insurerDetailPath(insurer.name)`.
  - `ProductCard.tsx`: Blank space clicks navigate to `/product/${product.id}`.
  - `GuideCard.tsx`: Blank space clicks navigate to `/category/${guide.id}`.
  - `CategoryIndexCard.tsx`: Replaced outer `<Link>` with semantic `<article>` to resolve an HTML5 nested button violation while enabling blank space navigation to the category page.

## 2. Feature 2: Plan Tiers Separation & Focused Detail View

### Problem
In products with multiple plan tiers (most notably `medical-aia` / AIA VHIS series with Standard, Flexi, Prestige, Selectwise plans), all tier details and limits were jammed together in combined text strings (e.g., "標準計劃 HK$420,000；睿選/尊耀計劃每保單年度 HK$12,000,000；至尊靈活不設限額"), making it hard to see individual plan coverage items.

### Solution
- **Smart Plan Parser (`src/components/product/plan-parser.ts`)**:
  - Identifies genuine selectable tiers (e.g., Standard S00013, Prestige F00074, Selectwise F00081, Flexi F00022) while filtering overview/summary rows.
  - Dynamically extracts single-plan coverage limits via `extractTierCoverageLimit(limitText, tier)` for clean, focused per-plan display.
- **Plan Selector Bar (`src/components/product/PlanSelectorBar.tsx`)**:
  - Segmented control / Tab selector: "全部計劃對比 (All Plans)" + individual tier tabs with official certification codes.
  - Focused view presents a highlighted plan banner and clean per-item coverage table.
  - Synchronizes with URL query param `?tier=xxx` for direct deep-linking and sharing.
- **Detail Integration (`src/pages/ProductDetail.tsx`, `CoverageSection.tsx`, `PlanTiersSection.tsx`)**:
  - Placed `PlanSelectorBar` right above the coverage details section.
  - Dual-mode support: Focused view (clean per-plan item limits) or All Plans view (full comparison matrix).

## 3. Verification

| Check | Result |
|---|---|
| `npm test` | PASS 204/204 |
| `npm run lint -- --max-warnings=0` | PASS (0 errors, 0 warnings) |
| `npm run build` | PASS (TypeScript & Vite build clean) |
| `npm run test:filters` | PASS (3,000 preset + 91,797 deep boundary assertions) |
