# Post-merge improvement plan / implementation decisions

**Goal:** Turn v1.7.1 into a more useful, repeatable comparison workspace without pretending to provide live quotes or verified policy advice.
**Architecture:** Keep the existing static React SPA, validated snapshot, three-product CompareProvider and SHA-bound PDF center. Add bounded comparison tools, not another category wizard. No server, account, personal-data collection or new runtime dependency.
**Baseline:** master2e55b969c7a6b0d48322732c6f5114dc78598821. Prior PRs were merged by the owner; CategoryDecisionGuide was deliberately removed. Preserve both decisions.

## Competitor observations (viewed2026-09-08; product-UX research, not policy evidence)

| Official page | Observed pattern | Decision here |
|---|---|---|
| MoneyHero travel: https://www.moneyhero.com.hk/en/travel-insurance | Trip type, destination, dates and people are explicit before price/benefit cards. | Future quote comparisons need an explicit basis; do not import their prices into our corpus. |
| MoneySuperMarket help: https://support.moneysupermarket.com/en/articles/8991373-how-do-i-view-my-quotes | Users can retrieve saved quotes in their account. | Add browser-local named comparison sets; call them saved comparisons, NOT saved or guaranteed quotes. |
| 10Life methodology: https://www.10life.com/en/scoring-methodology | Explains category-specific scoring and comparison limitations. | Preserve uncertainty, scope and provenance in export; do not invent a universal score. |

This is observation of public pages, not a full competitor checkout/account audit. No designs, proprietary scoring models or product amounts are copied.

## Chosen work and exact interfaces

### A. Evidence boundary (independent fix PR)
Files: data-integrity.ts, pdf-evidence.ts, tests/evidence-boundary.test.mjs and browser_evidence_boundary.mjs. Preserve parseInsuranceData public return shape; malformed supplied evidence fails visibly, missing remains missing. Red/green tests then full unit/lint/build/filter, browser invalid-response/retry. No source-data mutation.

### B. Saved comparison sets (new functionality PR)
Files: new saved-comparisons model/store and Compare page component, tests and browser flow. Keep ic-compare-tray separate. Save at most10 named sets, at most3 existing IDs per set. Store public product identity/change fingerprints, saved timestamp and snapshot date; do not store private health details or pretend to lock premiums. Reopen through the existing compare route. Missing records are shown and never silently replaced. Changes since save require a visible review warning. Storage blocked/corrupt/newer schema is visible; never overwrite unrecognized data automatically. Delete explicitly, no implicit autosave. Test save/reload/restore/delete, quota/corruption, product changes, different tabs and mobile.

### C. Downloadable comparison review brief (new functionality PR)
Files: pure export formatter and button, Compare integration, unit/browser download tests. UTF-8 Markdown contains current public product summaries, snapshot vs export timestamps, explicit missing-source/page state, safe official links and current PDF-center links. It is a review record, not a quote or original policy. Escape supplied Markdown; reject unsafe URL schemes. Preserve all selected-product rows and state comparable-scope limitations. Test actual downloaded bytes, hostile text/URLs, missing fields, source links and no insurance-data mutations.

## Alternatives not chosen now
Accounts/cloud sync adds backend/privacy work disproportionate to the current static site. AI advice or live-quote estimates would create unsupported accuracy expectations. Another mandatory three-step category flow would undo the owner's latest change. Renewal reminders require explicit scheduling/storage/notification consent and are not implied by saved sets.

## Remaining roadmap and closure criteria
P0: official version/tier applicability and canonical benefit mapping (ordinary cancellation vs CFAR, cash vs guarantee) need per-concept fixtures and reviewed source claims. P1: unify promotion validity and quote context; make Compare URL/store navigation a single deterministic owner if browser tests reproduce races; current DataQuality payload validation and known-missing-page reading states. P2: real-device scroll/energy and reduced-motion checks; measured bundle budget and route SEO/prerender plan; dependency review. A green build or PDF hash does not close policy-currentness work.

## Integration/testing gate
Each PR includes exact baseline, before/after, file responsibilities, observed commands/results, mocked-vs-real evidence, browser screenshots, unverified areas and rollback. Use non-force review branches; do not merge/deploy. Tests for an intentionally removed feature must not be restored. Rerun the full integrated suites on each exact head and retain both PDF-integrity and neutral-stamp checks. Version1.7.1 remains synchronized; build numbers advance20260908.01 onward.
