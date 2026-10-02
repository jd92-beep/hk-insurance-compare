# 2026-10-02 — Hand-drawn cards, PDF centre tour, premium spectrum (Build 20261002.03)

- Site name → 保險明選 (nav, drawer, footer, titles, og-cover, index.html).
- TiltCard: no 3D rotation/translateZ; hover = 2D lift + CSS glare, so the whole card stays sharp. `tests/anti-blur-tilt-card.test.mjs` updated.
- Hand-drawn card shell (`SketchFrame` pencil outline + `.tilt-sketch` hatched cast shadow + `.sketch-card`) on ProductCard (insurer + category pages, category colour on category pages), FlatPriceCard, InsurerCard, GuideCard, CompareStarter.
- Insurer index: CSS subgrid (`.subgrid-card`) — five rows shared per grid row, so card heights, dashed dividers and CTAs align.
- ProductCard copy trimmed: tiers as one line, selling points as ✓ lines, "更多細節", "睇詳情".
- CompareStarter: no 3D flip / ruled background; 2 coverage rows.
- PDF centre: first-visit 3-step tour (`PdfCenterTour`, localStorage `pdf-center-tour-v1`), Esc/skip/keyboard, replay link.
- Premium spectrum (`src/lib/premium-spectrum.ts`, `PremiumSpectrumCard` under 來源參考): only products with `premium_available === true`; only amounts stated per year or per month (×12); sums insured, deductibles, per-day/per-trip, add-ons and multi-year terms ignored; travel uses annual-plan prices; hidden when fewer than 3 placed. Motor has none (all quote-only or unflagged).

Verification (worktree, uncommitted): `npm test` 229 pass; lint 0 warnings; build OK; `test:filters` pass. Playwright Chromium (SwiftShader) 1440×900 and 390×844: /insurers, /insurers/AXA, /category/travel, /guides, /compare (hover), /documents tour, /product/{medical-aia,travel-aig,home-blue-cross}. Pre-existing console warning on /category/travel (React.Fragment prop) unchanged.
