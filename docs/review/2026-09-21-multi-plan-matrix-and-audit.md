# 2026-09-21 · Multi-Plan Comparison Matrix & Cross-Insurer Audit

**Branch:** `review/20260921-multi-plan-matrix-and-audit`  
**Version:** APP_VERSION **1.8.7** · BUILD_NUMBER **20260921.09** · BUILD_DATE 2026-09-21  
**Scope:** UI / Multi-Plan Comparison Matrix, Smart Short Labels, Fade Mask Scrolling, and Multi-Tier VHIS Audit. Policy snapshot claims verified.

## 1. Investigation: AXA VHIS Official Plans Breakdown

### Background & Discovery
The user inquired about the true number of AXA VHIS plans and why so many appeared in the comparison selector:
- **Official VHIS Registry Truth (`vhis.gov.hk`)**:
  - **Standard Plans (3 products)**:
    - `S00014`: AXA WiseGuard Medical Insurance Plan (「守慧」醫療保障)
    - `S00033`: AXA Smart Medicare (「真智安心」醫療保障)
    - `S00038`: AXA WiseCare Medical Plan (「智選」醫療保障)
  - **Flexi Plans (3 products)**:
    - `F00017`: AXA Smart Medicare (Flexi Plan) (「真智安心」靈活計劃)
    - `F00018`: AXA WiseCare Medical Plan (Flexi Plan) (「智選」靈活計劃)
    - `F00034`: AXA WiseGuard Pro Medical Insurance Plan (旗艦「智尊守慧」醫療保障)
      - WiseGuard Pro (`F00034`) contains 4 benefit tiers: Regular (普通房，每年 HK$5,000,000), Superior (半私家房，每年 HK$10,000,000), Premier (標準私家房，每年 HK$15,000,000), Global (私家房全球，每年 HK$20,000,000，終身 HK$80,000,000).
- **Root Cause of Confusion**:
  - Historical snapshot data lumped all 6 certification codes into a single `medical-axa` record.
  - A colon regex bug split `"自願醫保靈活計劃（智尊守慧：標準／卓越／優尚／尊貴保障級別）"` into `"靈活計劃（智尊守慧"`, leaving an unclosed opening bracket and missing official code binding.
- **Fix in `src/components/product/plan-parser.ts`**:
  - Bound `F00034` directly to `智尊守慧靈活計劃`, `S00014` to `守慧標準計劃`, and `F00017` to `真智安心靈活計劃`.
  - Isolated WiseGuard Pro from Standard WiseGuard keywords to eliminate limit text cross-contamination.

## 2. Brainstorm Solution A: Multi-Plan Comparison Matrix & Smart Controls

### Problem
In multi-plan products (e.g. AIA with 4 tiers, AXA with multiple variants), rendering long text strings like `"標準計劃 HK$420,000；睿選/尊耀計劃每保單年度 HK$12,000,000；至尊靈活不設限額..."` in a single table cell resulted in truncated text, messy wrapped lines, and cognitive overload.

### Solution Delivered (Solution A)
1. **Multi-Plan Comparison Matrix (`MultiPlanMatrixTable` in `CoverageSection.tsx`)**:
   - **Sticky Left Column**: Coverage item title frozen on the left (`sticky left-0 bg-paper z-10`), with direct click-to-preview PDF drawers.
   - **Dedicated Column per Plan**: Each plan tier receives its own column displaying clean, isolated limits (e.g. `HK$420,000` vs `每保單年度 HK$12,000,000` vs `全數賠償`).
   - **Focused Action**: Each column header features a quick `專注 ➔` button to instantly zoom into that plan's individual details.
   - **Smooth Horizontal Scroll**: Supports effortless swipe on mobile and responsive scrolling on desktop.
2. **Smart Short Labels & Fade Mask Scrolling (`PlanSelectorBar.tsx`)**:
   - Tab names stripped of generic noise (e.g., `真智安心` instead of `自願醫保真智安心醫療保障靈活計劃`), keeping tabs neat and readable.
   - Container features left and right **paper-ink fade masks** with `<` and `>` arrow controls that appear dynamically when content overflows.

## 3. Multi-Insurer Audit Verification

- **AIA (`medical-aia`)**: S00013, F00022, F00074, F00081 parsed with distinct columns and per-tier limits.
- **AXA (`medical-axa`)**: F00034 (智尊守慧), S00014 (守慧標準), F00017 (真智安心) cleanly separated.
- **FWD (`medical-fwd`)**: F00045 (尊衛您), F00015 (更衛您), Standard cleanly separated.
- **Bupa (`medical-bupa`)**: Hero and Standard cleanly separated.
- **Prudential (`medical-prudential`) & Cigna (`medical-cigna`)**: Correct official codes and non-redundant tier names.

## 4. Verification

| Check | Result |
|---|---|
| `npm test` | PASS 206/206 |
| `npm run lint -- --max-warnings=0` | PASS (0 errors, 0 warnings) |
| `npm run build` | PASS (TypeScript & Vite build clean) |
| `npm run test:filters` | PASS (3,000 preset + 91,797 deep boundary assertions) |
| Browser & UI Check | Matrix table and fade mask verified on local dev server and headless Chrome. |
