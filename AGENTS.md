# AGENTS.md

Static React/TypeScript comparison site for Hong Kong insurance. Keep the
Traditional Chinese (Hong Kong) UI and its existing paper/ink/jade/amber tokens.
User instructions override this file and the global handbook owns generic workflow
and skill routing.

## Scope and release boundary

- Work only in the checked-out repository and inspect its status before editing.
  Preserve unrelated changes and coordinate overlapping work.
- Do not push, merge, enable auto-merge, or deploy unless Boss explicitly authorizes it.
  `master` is deployment-connected.
- Use current repository, Git, and live evidence. Handover and review notes are
  useful when relevant; `handoff/archive/` is historical only.

## Insurance evidence

- `public/data/insurance-data.json` is a site snapshot, not proof that a policy
  is current, available, comparable, or correctly interpreted. Derive insurer
  keys and counts from the snapshot; do not merge distinct identifiers without
  reviewed migration evidence.
- For each changed insurance claim, retain the product and tier, jurisdiction,
  document version, official source, PDF page, quotation, and relevant
  qualification. Missing evidence stays missing.
- Do not invent a page or URL, reuse a citation for another benefit, infer
  currentness from a filename/hash/HTTP result, or change policy amounts to make
  checks pass. Preserve conditional, negative, and unknown evidence. Do not turn
  absent values into zero or unlimited coverage into an invented value.
- A lexical match is not suitability, underwriting approval, or payout evidence.
  PDF/version changes need a source review, applicable audit regeneration, and a
  content diff; hashes only check consistency.

## Versioning

- Every coherent code, data, or document change updates `BUILD_NUMBER` and
  `BUILD_DATE` in `src/lib/version.ts`. Keep `APP_VERSION`, `package.json`, and
  the package-lock root version aligned; a build-only change may keep semantic
  version unchanged.

## Verification and delivery

- Match verification to the changed surface. For application behavior, use Node
  22, `npm ci`, and the lockfile, then run the relevant CI-equivalent checks: `npm test`,
  `npm run lint -- --max-warnings=0`, `npm run build`, and `npm run test:filters`.
  Data/evidence work also needs its focused audit or curation checks.
- UI changes need relevant desktop and mobile interaction evidence. State the
  browser/device used; a build alone is not browser or accessibility validation.
- Record the command, result, tested head SHA, and any blocked check. Never call
  a different head verified, weaken a check, or replace `Not run`/`Blocked` with
  a pass.
- Use `.github/PULL_REQUEST_TEMPLATE.md` for a PR. Keep remaining evidence gaps
  visible in the problem register when the work changes it.
