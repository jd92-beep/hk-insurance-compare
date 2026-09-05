# AGENTS.md — hk-insurance-compare （保險格價站）

Hong Kong insurance comparison site. Static SPA, all UI in Traditional Chinese (HK).

- Repo: https://github.com/jd92-beep/hk-insurance-compare (branch `master`)
- **Core Memory & Rules: read `GEMINI.md` first** (mandatory workflow, lessons learned, versioning).
- **Handoff docs: read `handoff/`** — `01-what-has-been-done.md`, `02-current-problems.md`, `03-next-phases.md`, `04-goals.md`, `05-notes-for-next-agent.md`.

## Commands

```bash
npm install
npm run dev                                      # vite dev server
npm run build                                    # tsc -b && vite build (must pass 100%)
npm run lint                                     # 22 pre-existing baseline errors — 0 new errors!
npx tsx scripts/verify_filter_combinations.ts    # verify 3,200+ filter combinations
npx tsx scripts/verify_filter_boundary_deep.ts   # deep stress test 80,000+ combinations
python3 scripts/build_vhis.py                    # refresh VHIS data from official sources
python3 scripts/build_vhis.py --skip-download    # reuse scripts/.cache/
```

## Mandatory Version Bump Rule

Every time you change code, data, or markdown documentation:
1. Update `src/lib/version.ts` (increment `APP_VERSION` and/or `BUILD_NUMBER`).
2. Synchronize `package.json` `"version"` field.
3. Verify footer reflects the new version string.

## Deployment

Cloudflare Pages, git auto-deploy on push to `master`.
- Production: https://insurance.tommychu2025.dpdns.org
- Fallback: https://hk-insurance-compare-ejh.pages.dev
- Build `npm run build` → `dist/`, Node 22 (`.nvmrc`), SPA fallback `public/_redirects`.
- Previews are Access-protected (user's email only). Details: `handoff/01-what-has-been-done.md` §8.

## Stack

React 19 · TypeScript · Vite 7 · Tailwind CSS 3.4 · shadcn/ui · Framer Motion · GSAP · Lenis · cmdk · react-router 7.

## Layout & Architecture

- `public/data/insurance-data.json` — **158 products × 11 categories** with official citations (**the** core dataset)
- `public/data/vhis-plans.json` — official VHIS registry (33 standard + 70 flexi plans), generated
- `src/lib/feature-filters.ts` — **147 feature tags + 51 persona presets + Smart Match scoring engine**
- `src/lib/version.ts` — centralized version & build tracking (`APP_VERSION`, `BUILD_NUMBER`, `FULL_VERSION_STRING`)
- `scripts/build_vhis.py` — official VHIS data pipeline (Python 3 stdlib only, idempotent)
- `scripts/verify_filter_combinations.ts` — automated regression test suite (3,200 assertions)
- `scripts/verify_filter_boundary_deep.ts` — deep combinatorial stress testing (80,858 assertions)
- `src/pages/` — routes: Home, Categories, CategoryDetail, ProductDetail, Compare, Insurers, Guides, About, Vhis
- `src/components/{product,compare,category,...}` — feature components; `src/components/ui/` shadcn
- `src/providers/` — InsuranceDataProvider (fetches JSON), CompareProvider, SearchProvider
- `src/lib/categories.ts` — category meta + premium parsing/sorting helpers
- `src/components/compare/canonical-benefits.ts` — per-category canonical benefit rows
- `src/components/fx/` — 3D/generative-art effect components (`AuroraBackground`, `TiltCard`, `ParticleField`); AI image slot at `public/hero-aurora-ai.webp` (auto-hidden when missing)

## Conventions

- UI copy: Traditional Chinese, HK voice. Code identifiers/comments: match existing files.
- Design tokens: `paper`/`ink`/`jade`/`amber`, `site-container`, `eyebrow`, `display-2`, `chip`; framer-motion `EASE_OUT_EXPO`.
- Insurer identity = latin `insurer` key (**39 standardized keys**, see `GEMINI.md`). Reusing existing keys is mandatory to prevent duplicate insurers.
- Citations are sacred: every quantitative claim carries `{document, page, quote, url}` to an official source. Never invent numbers.
- Zero empty screen: filter engine uses smart matching with friendly fallbacks.
