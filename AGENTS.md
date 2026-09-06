# AGENTS.md — current execution contract

Repository: `jd92-beep/hk-insurance-compare`. Static React/TypeScript SPA for Hong Kong insurance comparison. UI uses Traditional Chinese (Hong Kong); retain the paper/ink/jade/amber design tokens and existing routing/provider APIs.

Read `GEMINI.md`, `handoff/00-current-status.md` and `docs/review/problem-register-2026-09-06.md` before editing. Files under `handoff/archive/` are historical, not operational instructions. Project notes never override the user's current scope or runtime/tool permissions.

## Change boundaries

The current engagement authorizes review branches and detailed PRs, NOT merging, pushing to `master`, enabling auto-merge or deploying. The production branch is connected to automatic deployment. Keep production unchanged unless separately authorized.

First read the current repository, open PRs, exact head SHAs and worktree status. Do not infer GitHub connection or deployed code from earlier chat messages. Tool discovery alone is not a connection test. Coordinate file ownership when parallel branches exist; do not create another implementation of an already-open task. Do not force-push or overwrite unrelated work.

Use isolated working state. If a local checkout is unavailable, a repository Actions source archive must be tied to its recorded commit. Test the corresponding lockfile dependencies; do not relabel an older snapshot as the latest source. A tool error is not proof that every connector operation is unavailable.

## Verification contract

Use Node 22 (`.nvmrc`) and the committed lockfile:

```sh
npm ci
npm test
npm run lint -- --max-warnings=0
npm run build
npm run test:filters
```

All commands must exit successfully. There is no allowed lint-error baseline. Write regression tests that fail on the old behavior before claiming a fix. Existing combinatorial test counts vary with the result set; quote the observed run, not a memorized number.

UI changes need relevant desktop/mobile interactions and reviewed screenshots. A build is not browser validation. State which browser/device was actually tested; headless viewport checks do not establish low-end-phone FPS or VoiceOver compatibility. Generic route diagnostics can be report-only; separately check the blocking scenario results. When local browser access is denied by policy, do not bypass it; use the allowed repository test runner and disclose coverage limits.

Never call work verified until the EXACT new head/merge candidate has the required results. Record command, result, head SHA and artifact/run reference. `Not run` and `Blocked` must remain visible; do not replace them with a tick.

## Data evidence contract

`public/data/insurance-data.json` is the current site snapshot, not proof that all listed policies are current, for sale, comparable or correctly interpreted. Derive counts and insurer keys from the actual snapshot; never copy an old fixed company list. Preserve distinct company identifiers unless a separately reviewed migration proves equivalence.

Every changed insurance assertion needs the matching product, plan/tier, jurisdiction, version, official source, physical PDF page, excerpt and relevant conditions. A missing source must remain missing, not a guessed URL. A literal quote match, HTTP 200, download date, PDF filename year or hash alone does not establish semantic correctness or currentness. Do not rename an old document as current. Renewal-only/withdrawn/channel restrictions are separate states.

Never synthesize quotations from the site's own benefit summary, guess pages, copy the first citation into unrelated benefits, or substitute another insurer's document. Do not change policy amounts to satisfy tests. PDF/version changes require explicit source review, applicable manifests/audit regeneration, and a dedicated content diff; hashes are consistency checks, not official signatures.

Feature matches are lexical evidence, not personal suitability, underwriting approval or payout probability. Unknown is not excluded. Negative/conditional/unknown evidence must not disappear behind a positive row. Amount comparisons must preserve the full scope; do not map missing values to zero or unlimited coverage to an invented constant.

## Versioning

Every coherent code/data/document change increments `BUILD_NUMBER` and updates `BUILD_DATE` in `src/lib/version.ts`. `APP_VERSION`, package.json version and package-lock root versions must agree. A build-only increment may keep the semantic version unchanged. When integrating parallel branches, choose a build newer than the contributing heads; never resolve all conflicts by taking one whole version of every file.

## PR and handoff contract

Use `.github/PULL_REQUEST_TEMPLATE.md`. Include reproduction, expected/actual behavior, root cause, exact files/interfaces, tests and their observed results, data limitations, parent PRs, merge conflict hotspots and rollback. Explain prohibited shortcuts. Include a durable implementation note for nontrivial changes.

A PR being open/ready is not a production deployment. Do not mark the whole project or policy corpus complete because one subsystem passed. Update the problem register by evidence level: reproduced bug, inspected risk, implemented branch or independently verified result. Preserve remaining gaps.
