# 2026-09-21 · 3D card height fill / ghost plate

**Branch:** `review/20260921-3d-card-height-fill`  
**PR:** [#46](https://github.com/jd92-beep/hk-insurance-compare/pull/46) — merged to `master` @ `83e23dd`  
**Head commit:** `c994fb444c98e3d90011eeee9d3c3cf8096702c7`  
**Version:** APP_VERSION **1.8.7** · BUILD_NUMBER **20260921.02** · BUILD_DATE 2026-09-21  
**Deploy:** Cloudflare Pages auto-deploy on `master` push — success; production JS stamp `1.8.7` / `20260921.02`  
**Scope:** UI layout only. zh-HK copy, insurance data, policy claims unchanged.

## Problem (user report)

Some Web3D / `TiltCard` cards suddenly looked **short and small**, with a **light square / background** behind them.

## Root cause

1. Grid rows stretch `TiltCard` stages to the tallest card in the row.
2. Child card shells (`InsurerCard`, `GuideCard`, `ProductCard`) lacked `h-full`, so short content stayed content-height inside a taller stage.
3. `TiltCard`’s face `boxShadow` painted the **full stage** height — empty stage area read as a light ghost plate under short cards (clearest on `/guides` where travel tips ≫ home/life tips).

Measured before fix (Chromium): `/guides` stage `947px` vs card `483px` (gap ~464px); `/insurers` gaps ~22–36px on shorter rows.

## Fixes

| File | Change |
|---|---|
| `src/components/fx/TiltCard.tsx` | Stage/face `h-full`; remove face `boxShadow` (card owns shadow); milder lift / `translateZ(12px)`; inner `.tilt-face-card` |
| `src/components/insurers/InsurerCard.tsx` | TiltCard + article `h-full` |
| `src/components/guides/GuideCard.tsx` | TiltCard + article `h-full` |
| `src/components/ProductCard.tsx` | TiltCard + article `h-full` |
| `src/components/CategoryCard.tsx` | `h-full`; drop `hover:-translate-y-1` (fights tilt transform) |
| `src/pages/home/CategoryGrid.tsx` | motion.div `h-full` so percentage height chain resolves |
| `src/index.css` | `.tilt-face-card` direct card children fill stage height |
| `src/lib/version.ts` | BUILD_NUMBER `20260921.02` |

## Contract (do not regress)

- Tilt-wrapped cards in stretched grids **must** use `h-full` on stage + card shell.
- Do **not** put face-level shadows on empty stage height — that recreates the light plate.
- Do **not** re-add `hover:-translate-y-*` on faces already inside `TiltCard` (Web3D plan rule).
- Focus / touch / `prefers-reduced-motion` still disable tilt transforms.

## Verification at merged head

| Check | Result |
|---|---|
| `npm ci` (Node v22.22.3) | PASS (worktree) |
| `npm test` | PASS 183/183 |
| `npm run lint -- --max-warnings=0` | PASS |
| `npm run build` | PASS |
| Browser Chromium playwright-cli | `/guides`, `/insurers`, home `#categories-grid`, `/category/travel` — stage/card gap `0`; CTAs bottom-aligned; no light ghost plate |
| GitHub Actions `quality-gates` on master `83e23dd` | success |
| Cloudflare Pages on master `83e23dd` | success |
| Production probe | `https://insurance.tommychu2025.dpdns.org` 200; asset stamp `1.8.7` / `20260921.02` |

## Not claimed / remaining

- Safari / iOS / Android / foldable mid-width not re-run in this pass (CSS path unchanged for reduced-motion).
- `npm run test:filters` not applicable (no comparison/data change).
- This note is **not** a policy-currentness or site-wide QA certificate. Evidence limits stay in [2026-09-18-release.md](2026-09-18-release.md).

## Rollback

Revert PR #46 / commit `c994fb4` on `master`; UI-only; no data migration.
