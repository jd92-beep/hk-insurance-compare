# 05 — Notes for the Next Agent

Practical knowledge that will save you time. Read `GEMINI.md` and `AGENTS.md` (repo root) first!

## 🚨 Mandatory Rule: Bump Version Every Time
Remember to update `src/lib/version.ts` and `package.json` every time you make changes. The site footer automatically shows `FULL_VERSION_STRING`.

## 🛡️ Critical Architecture Knowledge
1. **158 Products × 11 Categories**:
   - `insurance-data.json` is the single source of truth for comparison products.
   - Every product has official citations `{document, page, quote, url}`.
2. **Insurer Keys (39 Companies)**:
   - Always reuse the exact Latin key listed in `GEMINI.md` (e.g., `blue-cross`, `boc-group-insurance`, `chubb`). Never invent new keys.
3. **ScrollTrigger Pin Defense**:
   - `CategoryGrid.tsx` must maintain its static 11-category fallback list to prevent container height collapse during initial async fetch.
   - Always call `ScrollTrigger.refresh()` after dynamic DOM height changes.
4. **Smart Match Filter System**:
   - Tags and Persona presets live in `src/lib/feature-filters.ts`.
   - Any modifications to filters must pass `npx tsx scripts/verify_filter_combinations.ts` and `npx tsx scripts/verify_filter_boundary_deep.ts`.
5. **Quality Gates**:
   - `npm run lint`: Maintain strictly 22 baseline errors (0 new errors).
   - `npm run build`: Must pass with 0 errors before push.
