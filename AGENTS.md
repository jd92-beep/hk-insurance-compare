# AGENTS.md — hk-insurance-compare （保險格價站）

Hong Kong insurance comparison site. Static SPA, all UI in Traditional Chinese (HK).

- Repo: https://github.com/jd92-beep/hk-insurance-compare (branch `master`)
- **Handoff docs: read `handoff/` first** — `01-what-has-been-done.md`, `02-current-problems.md`, `03-next-phases.md`, `04-goals.md`, `05-notes-for-next-agent.md`.

## Commands

```bash
npm install
npm run dev        # vite dev server
npm run build      # tsc -b && vite build (must pass)
npm run lint       # 22 pre-existing baseline errors — keep new files clean
python3 scripts/build_vhis.py               # refresh VHIS data from official sources
python3 scripts/build_vhis.py --skip-download  # reuse scripts/.cache/
```

## Deployment

Cloudflare Pages, git auto-deploy on push to `master`. Production: https://insurance.tommychu2025.dpdns.org (fallback: https://hk-insurance-compare-ejh.pages.dev). Build `npm run build` → `dist/`, Node 22 (`.nvmrc`), SPA fallback `public/_redirects`. Previews are Access-protected (user's email only). Details: `handoff/01-what-has-been-done.md` §8.

## Stack

React 19 · TypeScript · Vite 7 · Tailwind CSS 3.4 · shadcn/ui · Framer Motion · GSAP · Lenis · cmdk · react-router 7. No backend, no tests (yet).

## Layout

- `public/data/insurance-data.json` — 101 products × 9 categories with citations (**the** dataset)
- `public/data/vhis-plans.json` — official VHIS registry (33 standard + 70 flexi plans), generated
- `scripts/build_vhis.py` — data pipeline (Python 3 stdlib only, idempotent); cache in `scripts/.cache/` (gitignored)
- `src/pages/` — routes: Home, Categories, CategoryDetail, ProductDetail, Compare, Insurers, Guides, About, Vhis
- `src/components/{product,compare,category,...}` — feature components; `src/components/ui/` shadcn
- `src/providers/` — InsuranceDataProvider (fetches JSON), CompareProvider, SearchProvider
- `src/lib/categories.ts` — category meta + premium parsing/sorting helpers
- `src/components/compare/canonical-benefits.ts` — per-category canonical benefit rows (first-hit keyword matching; specific before generic)

## Conventions

- UI copy: Traditional Chinese, HK voice. Code identifiers/comments: existing files mix EN comments; match the file you're in.
- Design tokens: `paper`/`ink`/`jade`/`amber`, `site-container`, `eyebrow`, `display-2`, `chip`; framer-motion `EASE_OUT_EXPO` for entrances.
- Products keyed by `id` (`medical-aia`…); insurer identity = latin `insurer` key — **reuse existing keys exactly** or you create duplicate companies.
- Citations are sacred: every quantitative claim carries `{document, page, quote, url}` to an official source. Never invent numbers; derive from official files via scripts.

## Data integrity rules

1. vhis.gov.hk is the source of truth for VHIS. Regenerate, don't hand-edit generated fields.
2. Withdrawn providers (Allianz S00030, ZA S00045, 安達人壽 S00015) → registry only, never comparison products.
3. Renewal-only plans must always be flagged （只供現有保單續保）.
4. After touching data: run `npm run build`, verify `dist/data/*.json` exists, spot-check numbers against the official source.
