# 2026-09-21 · Plan Tiers Dynamic Linkage & Focus View Bugfixes

**Branch:** `review/20260921-plan-tiers-linkage-and-fixes`  
**Version:** APP_VERSION **1.8.7** · BUILD_NUMBER **20260921.08** · BUILD_DATE 2026-09-21  
**Scope:** UI / Detail View Interaction, Side Rail Dynamic Linkage, & State Normalization. Policy snapshot content and claims unchanged.

## 1. Issue 1: Remove Redundant "Focused Plan Banner"

### Problem
In the previous build (20260921.07), switching to an individual plan tier rendered a prominent banner below the tab bar stating "已切換至專注視圖". The user pointed out this banner was unnecessary clutter and reduced the visibility of actual coverage items.

### Solution
- Cleanly removed the `{activeTier && (<motion.div>...</motion.div>)}` block from `src/components/product/PlanSelectorBar.tsx`.
- The plan tabs themselves now provide clear active state styling (white pill, subtle shadow, colored cert code badge), and the top-right offers a minimal `查看全部對比 →` link.
- Pruned unused imports (`Check`, `CertCodeChip`, `RenewalOnlyBadge`) to maintain zero-warning linting.

## 2. Issue 2: "All Plans" Tab Active State Fix (`undefined === undefined`)

### Problem
When navigating between individual tiers (e.g. Plan A, Plan B) and then clicking back on "全部計劃對比", the tab's icon (`Layers`) and active container style failed to switch back to active.

### Root Cause
- In `PlanSelectorBar.tsx`, the active tier was matched via:
  ```ts
  const activeTier = tiers.find(
    (t) => t.id === selectedTierId || t.code?.toLowerCase() === selectedTierId?.toLowerCase()
  );
  ```
- When "全部計劃對比" is clicked, `selectedTierId` is set to `null`.
- In JS, `selectedTierId?.toLowerCase()` returns `undefined`.
- Out of 162 products across the site, 144 products (and certain tiers in Bowtie/Bupa) have no government cert code (`t.code === undefined`).
- Thus, `t.code?.toLowerCase() === selectedTierId?.toLowerCase()` evaluated `undefined === undefined`, which is **`true`**!
- The first tier lacking a code was mistakenly matched as `activeTier`, preventing `isAllSelected = !activeTier` from ever being `true`.

### Solution
- Added defensive normalization:
  ```ts
  const normalizedSelectedId = selectedTierId?.trim().toLowerCase() || null;
  const activeTier = normalizedSelectedId
    ? tiers.find(
        (t) =>
          t.id.toLowerCase() === normalizedSelectedId ||
          (Boolean(t.code) && t.code!.toLowerCase() === normalizedSelectedId)
      )
    : null;
  const isAllSelected = !activeTier;
  ```
- Guaranteed that `isAllSelected` is immediately `true` whenever `selectedTierId` is `null` or empty. Added unit tests in `tests/plan-parser.test.mjs`.

## 3. Issue 3: Dynamic "重點一覽" (Key Facts) in Side Rail

### Problem
In `ProductDetail.tsx`, the sticky right-hand side rail (`ProductSideRail.tsx`) displayed static product-level numbers for "每年保障限額" and "終身保障限額" (or combined text strings), and did not change when a user switched between plan tiers (e.g., AIA Prestige vs Standard). The user requested that the Key Facts card reflect the specific numbers of the selected plan across all insurance products.

### Solution
- **`ProductSideRail.tsx` Integration**:
  - Received `selectedTier?: PlanTierItem | null` and `onSelectTier?: (tierId: string | null) => void`.
  - Dynamically extracts single-plan limits using `extractTierCoverageLimit`:
    - For Annual Limit: Extracts tier-specific annual cap (e.g., AIA Prestige: `每保單年度 HK$12,000,000` vs Standard: `HK$420,000`).
    - For Lifetime Limit: Extracts tier-specific lifetime cap (e.g., AIA Prestige: `終身保障限額高達 HK$60,000,000` vs Standard: `不設上限` / Bupa Hero: `不設終身保障限額（無上限賠償）`).
  - Added visual focus state in the side rail:
    - Displays a jade badge `重點一覽 · 專屬規格` when an individual plan tier is active.
    - Includes an inline `重設回全覽 ↩` button for quick reset.
    - Renders a dedicated tier spec badge showing plan name, official certification code, and room tier (e.g. 半私家房 / 標準私家房).
- **`plan-parser.ts` Enhancements**:
  - Added regex cleaning for shared unlimited lifetime guarantee phrasing (`均不設終身保障限額`).
  - Added keywords for Hero and 非凡 tiers.

## 4. Verification

| Check | Result |
|---|---|
| `npm test` | PASS 206/206 |
| `npm run lint -- --max-warnings=0` | PASS (0 errors, 0 warnings) |
| `npm run build` | PASS (TypeScript & Vite build clean) |
| `npm run test:filters` | PASS (3,000 preset + 91,797 deep boundary assertions) |
| Browser & UI Check | Verified via local dev server: banner removed, tab toggle works reliably, side rail updates in real-time. |
