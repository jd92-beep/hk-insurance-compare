# Current handoff — 2026-09-06 review snapshot

This is a dated repository handoff, not a promise that every listed PR remains at the same head. Re-read live GitHub metadata/checks before acting. See `../AGENTS.md` for current execution rules and `../docs/review/problem-register-2026-09-06.md` for evidence-backed defects and remaining work.

## 1. What is authorized

Continue implementation in review branches and create detailed PRs. Do not merge, force-push, push to production, enable auto-merge or modify external accounts. No change in this review batch has been intentionally merged into master. A PR being ready does not mean its features are on the live site.

## 2. Verified repository state, not earlier chat assertions

GitHub get_repo, source reads, branch creation, commit creation and PR writes succeeded during this review. Earlier chat statements that only PR1 existed were incorrect. If a later call fails, report that specific failure and use a supported read to establish the current state; do not claim global disconnection merely because discovery output was empty.

The source snapshot at PR15 `349ee7c85f97827c99c433d3f0d5529a40f28105` contains 158 products, 11 categories and 40 distinct insurer strings. These are site records/keys, not a claim about all Hong Kong providers or current products. Existing source integrity/freshness gaps remain. The full ledger in `public/data/evidence-audit.json` has 3582 coverage/citation entries and 81 mirrored documents; its meaning is mechanical evidence availability, not verified policy advice.

## 3. PR dependency map (verify live heads before integration)

```text
#1 → #2 → #3 → #5 → #8 → #10 → #12 → #14 → #15
                         │                       ├→ #16 → #19 → current handoff update
                         └→ #13                  └→ #17 → #18
#1 → #7 → #9 → #11
```

Closed duplicate PR4 and PR6 must not be merged/cherry-picked. PR16 was repurposed: use its current feature-conflict diff against PR15, not the old `be6e27c` competing amount-parser commit. Its branch name retained a legacy amount-related name; inspect actual title/base/diff.

| Area | PR / known head | Meaning of available evidence |
|---|---|---|
| Fine particles / RAF cleanup | #2 | Canvas2.5D, not physical WebGL; real-device FPS still not established |
| Reader / quote matching | #3 | Desktop/mobile PDF interaction checks; quote presence is not meaning |
| Matching / ranking guard | #5 | Conservative summaries, not complete eligibility inference |
| Whole-corpus source audit | #8 | 158 records/81 PDFs/3582 entries inspected mechanically; latest semantics remain unverified |
| All-category preparation flow | #10 | 11 categories × 2 viewports tested; checklist is not a recommendation score |
| Routes / loading / overflow | #12 | Complete product/site verification and route splitting; not all real devices |
| Evidence visualization | #14 fc797cd | Seven exact-head workflows observed successful |
| Full monetary scope | #15 349ee7c | Seven exact-head workflows observed successful; no policy-number changes |
| CFAR / conflicting evidence | #16 8208f0a | 45 unit tests locally; seven exact-head workflows successful; ready for review |
| Neutral seal / unique SVG IDs | #19 5374929 | 48 unit tests locally; seven exact-head workflows and both neutral-stamp browser viewports passed; see PR evidence |
| PDF-byte-bound references | #17 3107e44 | Separate implementation exists; not part of #16/#19 branch |
| Mobile evidence cards | #18 c09621e | Separate implementation exists; not part of #16/#19 branch |
| Search / tray / sharing | #7/#9/#11 | Separate tested stack, not included just because it is open |
| Stop fabricated ingestion | #13 | Separate curation guard; do not assume present in every review branch |

## 4. Integration must preserve both sides

Use a new review integration branch, never master. Inspect live ancestry and commit diffs; don't paste complete files from an older branch. Keep ancestry or explicitly rebuild/retest dependent PRs if the maintainer chooses a squash/rebase strategy. Retargeting a child is not proof its diff is still correct.

Known conflict hotspots:
- `src/lib/version.ts`: select a build newer than contributing heads, keep semantic versions aligned.
- `src/pages/Compare.tsx`: retain #8 safe purchaseUrl and #11 reliable share components; neither whole-file snapshot is universally authoritative.
- `.github/workflows/browser-review.yml`: retain PDF integrity checks from #17 and neutral-stamp checks from #19; do not lose tests by accepting one side.
- `package.json` / prebuild: retain PDF manifest verification if #17 is integrated; no lockfile churn just to silence an environment error.
- `src/lib/feature-evidence.ts`: preserve #16 negative/unknown precedence. Do not restore the earlier positive-first helper.
- Reader and data audit files: never revert a newer hash-bound implementation to the old URL-only version accidentally.

The current handoff PR does not perform that integration. The integration candidate must rerun all contributing unit, filter, PDF, chart, category, complete-site, search/store/share and curation checks applicable to its files. Record the actual combined commit and read its screenshots before calling it tested.

## 5. Where the remaining work is recorded

The problem register separates fixed branch code from unresolved policy semantics, reproducible robustness bugs and validation gaps. It has concrete files and closure criteria. Follow that register instead of the archived claims 'all current PDFs verified', 'all bugs resolved', or fixed lint allowances.

Old handoff01–05 are redirects to preserved historical documents. They are not current instructions. Keep the original history, but do not re-enable unsafe quote generators or direct-release commands from it.
