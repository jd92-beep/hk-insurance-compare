<!-- review-2026-09-18 -->
> **2026-09-18 documentation review:** Current scope and remaining limitations: [delivery review](docs/review/2026-09-18-release.md). No blanket policy-currentness certificate.
<!-- /review-2026-09-18 -->
<!-- review-2026-09-21 -->
> **2026-09-21 UI delivery:** Multi-plan comparison matrix & cross-insurer audit Build `20260921.09` — [multi-plan matrix & audit](docs/review/2026-09-21-multi-plan-matrix-and-audit.md).
<!-- /review-2026-09-21 -->
<!-- review-2026-09-21-layout -->
> **2026-09-21 Layout delivery:** Top deck side-by-side & full-width matrix Build `20260921.10` — [layout review](docs/review/2026-09-21-layout-top-deck-and-fullwidth-matrix.md).
<!-- /review-2026-09-21-layout -->
<!-- review-2026-09-21-polish -->
> **2026-09-21 UI Polish & Price Sort delivery:** Overlap fix, card polish & flat price sort Build `20260921.11` — [ui polish & price sort](docs/review/2026-09-21-ui-polish-overlap-fix-and-price-sort.md).
<!-- /review-2026-09-21-polish -->
<!-- review-2026-09-21-features -->
> **2026-09-21 Six Feature Polish delivery:** Colorful cards, selling points, VHIS en & jumps, 3-tier PDF selector Build `20260921.12` — [six feature polish](docs/review/2026-09-21-six-feature-polish.md).
<!-- /review-2026-09-21-features -->
<!-- review-2026-09-21-favorites -->
> **2026-09-21 Favorites & Travel Pricing delivery:** LocalStorage favorites, heart badge, travel single/annual pricing sort & safe route aliases Build `20260921.14` — [delivery review](docs/review/2026-09-21-favorites-and-travel-fixes.md).
<!-- /review-2026-09-21-favorites -->

# GEMINI.md — current project memory, not a completion certificate

This file and AGENTS.md describe the same current contract. Read `AGENTS.md`, `handoff/00-current-status.md`, and `docs/review/problem-register-2026-09-06.md`. The old text is preserved under `handoff/archive/pre-audit-2026-09-06/`; its obsolete release commands and accuracy claims are not instructions.

## Non-negotiable working rules

Work on review branches and generate PRs. Do not merge or push to `master`, enable auto-merge, or change production configuration without separate user authorization. Verify live repository state and existing PR ownership before editing. Preserve others' changes; use non-force updates and check expected heads.

Use Node22, `npm ci`, `npm test`, `npm run lint -- --max-warnings=0`, `npm run build`, and `npm run test:filters`. Lint must have zero errors and zero warnings. A passing build does not prove that a browser interaction or insurance claim is correct. Report real command results with their commit; say `Not run` when appropriate.

Increment BUILD_NUMBER / BUILD_DATE for every coherent change, including documentation. Keep APP_VERSION and both package manifests synchronized. Build-only updates do not require an invented semantic-version bump. During integration, reconcile version.ts deliberately instead of overwriting another branch.

## What the software actually is

The SPA loads a checked-in JSON snapshot. Product pages, category filters, comparison tables, PDF evidence and the audit ledger have different responsibilities. No backend or database write should be assumed from the presence of a local PDF mirror. Inspect the current code and package lock before asserting dependencies or routes.

The snapshot count, insurer keys, filter count and plan registry evolve. Derive them from data; do not treat a historical count as a requirement. The snapshot reviewed on 2026-09-06 had 158 product records and 11 categories; this is not a market-completeness or freshness claim.

## Trust and evidence

Never claim all product content is verified or current without product/plan/version-level evidence. Old filename years do not prove expiry, newer years do not prove applicability. Download time, PDF metadata, literal text matches and SHA-256 consistency do not certify the meaning of a benefit or the authority of its source.

No fabricated quotes, default pages presented as evidence, first-citation fallbacks, cross-insurer substitutions or silent promotion of unknown to covered. Keep observed negative/unknown conditions visible. A tag match is not suitability; a high amount is not automatically a better plan; different beneficiary/event/tier/region scopes cannot be silently compared.

Keep unavailable/renewal-only sales channels distinct from historical policy-reference records. Do not run a data-refresh script as a routine test; review its output, official applicability, source/version changes and audit impact in a separate content PR. Insurer identity keys must never be invented or renamed without official verification; always use product_identity.mjs to guard canonical identities.

## Preserve these architectural lessons

Reserve category space while data loads and refresh ScrollTrigger after relevant layout changes. Give GSAP scroll transforms and pointer transforms separate DOM owners. MethodStory GSAP pin must always guard against unmounted triggers and ensure scroll markers refresh cleanly. Cancel animation frames/listeners on cleanup; reduced-motion and background/offscreen states must stop unnecessary work. Retain native touch scrolling and usable keyboard paths. A 2.5D Canvas effect is not physically based WebGL.

Avoid empty/unrecoverable error screens: use explicit loading, empty, failure, retry and partial-result states. Strict-filter fallbacks must say that alternatives do not match all selected conditions. An error boundary is a fallback, not permission to accept malformed snapshot fields.

## Evidence-first handover

The detailed PR template is mandatory. It separates implementation, tests executed, tests not executed, policy evidence, dependencies and rollback. Read the current problem register rather than inheriting an old 'all fixed' paragraph. Do not claim formal accessibility compliance or guaranteed frame rate from a few screenshots. Final delivery must identify actual PR links and say whether production was changed.
