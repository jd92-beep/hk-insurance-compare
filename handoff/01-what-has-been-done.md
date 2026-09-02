# 01 — What Has Been Done

Project: **hk-insurance-compare** （保險格價站） — React 19 + TypeScript + Vite 7 + Tailwind 3.4 + shadcn/ui static SPA, Traditional Chinese (HK).
Repo: https://github.com/jd92-beep/hk-insurance-compare (branch `master`)
Local path: `~/Documents/Projects/Insurance comparison/hk-insurance-compare`

All work below is **committed and pushed** (commit `8cfdf2c`, 2026-09-02).

## 1. Environment / setup fixes
- Cloned repo to `~/Documents/Projects/Insurance comparison/hk-insurance-compare`.
- `package-lock.json` pinned tarballs to dead mirror `npm.mirrors.msh.team` → rewrote all URLs to `registry.npmjs.org` (committed fix).

## 2. VHIS （自願醫保） full official-list integration — the main feature
Source of truth: **vhis.gov.hk official open data** (standard-plans.csv, flexi-plans.csv, Standard Premium Summary Excel male/female).

- **Audit found**: site only covered 12/33 VHIS providers, 17/103 cert numbers.
- **`scripts/build_vhis.py`** (Python 3 stdlib only, idempotent): downloads the 4 official files into `scripts/.cache/` (gitignored), builds the registry, merges products. Re-run anytime: `python3 scripts/build_vhis.py`.
- **`public/data/vhis-plans.json`** (new): full official registry — 33 standard plans + 70 flexi products (546 levels), cert numbers, effective dates, official PlanDoc/premium PDF URLs, status (`active` / `renewal-only` / `withdrawn`).
- **`insurance-data.json`**: medical category 12 → **28 products** (16 new insurer-level products added; 12 existing enriched with complete cert-number lists). Categories counts updated; total 101 products / 34 insurers / 939 citations.
- 3 withdrawn/deregistered providers (Allianz S00030, ZA S00045, 安達人壽保險有限公司 S00015) — registry only, excluded from comparison.
- 9 renewal-only flexi products flagged （只供現有保單續保） everywhere they appear.

## 3. Data errors found & fixed (verified against official sources)
- Liberty insurer split into two keys (`Liberty International` vs existing `Liberty`) → merged.
- insurer_zh inconsistencies: MSIG （三井住友保險）, China Taiping （中國太平）.
- key_terms hardcoded "投保年齡 0-80歲" contradicted official Excel (e.g. 周大福 0-64) → now per-provider from Excel; broken Chubb age text fixed.
- 提供形式 incomplete for providers offering both 獨立保單+附加契約 → now union across Excel column span.
- Premium figures: **all 16 new providers' age-30 M/F premiums verified equal to official Excel**; age curves (0/30/50/60) added to `premium_notes`.
- Wrong list-page URL (404) in 56 places → corrected to `/tc/consumer_corner/list-plans.html`.
- All sampled official PDF URLs return HTTP 200.

## 4. New `/vhis` page
Full certified-products registry UI: filters (type/provider/search), status badges (renewal-only/withdrawn), per-plan links to official PlanDoc + premium-table PDFs. Route in `App.tsx`, Navbar item 「自願醫保名單」, banner link from the medical category page. Files: `src/pages/Vhis.tsx`, `src/hooks/use-vhis-registry.ts`, `src/types/vhis.ts`.

## 5. Product detail page revamp (medical focus)
- `KeyFactsCard` — at-a-glance summary: cert chips, 每年保障限額， 30歲保費（男/女）, 提供形式， 投保年齡， guarantee chips （保證續保至100歲 / 21日冷靜期 / 扣稅）.
- `ProductSideRail` — sticky desktop rail: condensed facts + compare CTA + official doc quick links.
- `CoverageSection` grouped standard benefit table （保障限額 → 基本保障 → 靈活計劃）, 每年保障限額 highlighted.
- `PremiumSection` age-curve table （年齡 | 男 | 女） parsed from `premium_notes`.
- `PlanTiersSection` cert-number chips + renewal-only badges; `SourcesSection` labeled official PDF rows.
- Helpers: `src/components/product/vhis-utils.ts` (pure parsers: certs, premium curve, key facts, URL labels), `CertCodeChip.tsx`, `tier-text.tsx`.

## 6. Comparison tool fixes
- `canonical-benefits.ts` MEDICAL rows 12 → 20; fixed two real mismatches （終身保障限額 was absorbed into 每年保障限額； 住院現金 misfiling into 主要醫療費用）.
- Verified mapping over all 28 medical products: 16 new products map 11/11 items, zero fallout; no regression on original 12.
- Long cell text clamps to 3 lines with expand toggle; product picker groups by insurer; all-tie rows no longer highlighted as "best".

## 7. Verification status
- `npm run build` passes (tsc + vite).
- `npm run lint`: 22 errors, **all pre-existing baseline** (confirmed by stash test before changes); zero in new/touched files.
- No automated test suite exists.

## 8. Deployment (2026-09-02, live)
- **Hosting**: Cloudflare Pages, project `hk-insurance-compare`, $0 free tier.
- **URLs**: production custom domain https://insurance.tommychu2025.dpdns.org (zone `tommychu2025.dpdns.org`, CNAME → Pages, proxied); fallback https://hk-insurance-compare-ejh.pages.dev.
- **Git integration**: Cloudflare Workers & Pages GitHub App installed, scoped to ONLY `jd92-beep/hk-insurance-compare` (installation id 158465073). Push to `master` → auto `npm run build` → auto deploy. Verified end-to-end (commit `76d0eff` auto-built and went live).
- **Build config**: build command `npm run build`, output `dist/`, production branch `master`, Node pinned to 22 via `.nvmrc`.
- **SPA routing**: `public/_redirects` (`/* /index.html 200`) — deep routes like `/vhis` verified 200.
- **Security hardening** (verified live): SSL/TLS mode **Full (Strict)**; **Always Use HTTPS** (http → 301 https); **preview deployments protected by Cloudflare Access** — policy allows only `ftjdfr@gmail.com` (one-time PIN). Production stays public.
- **Post-deploy incident (resolved, user-confirmed)**: user's Chrome showed "Server IP address could not be found" — root cause was the local machine (Surfshark VPN DNS + stuck mDNSResponder negative cache), NOT the site (verified globally via DoH + `curl --resolve`). Fixed browser-side by enabling Chrome secure DNS → Cloudflare (1.1.1.1); **user confirmed 2026-09-02 the site loads fine**. Optional system-wide cleanup for other apps: `sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder`.
- Repo visibility: **private** (was public until 2026-09-02; user made it private).
- Commits pushed: `8cfdf2c` (VHIS integration + UI), `bd3cbb0` (handoff docs), `3336a20` (_redirects), `76d0eff` (git integration + .nvmrc), `c9ea504` (README custom domain).
