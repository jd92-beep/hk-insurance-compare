# 收藏比較組合 / implementation and reviewer contract

## User-facing capability
An optional collapsed section on /compare, including the empty-selection state. Users explicitly name and save up to10 sets of1–3 selected public products, reopen them against the current catalog, or delete with inline confirmation. The owner's removed CategoryDecisionGuide stays removed. This tool is not a quote locker, insurer account, automatic recommendation or renewal reminder.

## Data and lifecycle
New key `ic-saved-comparisons-v1` is independent of `ic-compare-tray`. Schema1 stores set identity, name, timestamp, snapshot date and product IDs/names/revision fingerprints. No private profile, medical answers, PDF binaries or premium quote objects. Name input warns against sensitive data. Fingerprints use public summary/conditions/price-reference fields and existing PDF-bound evidence references; a change warning means website data differs, NOT proof the insurer altered a policy. Unknown/deleted products remain listed; partial restore is an explicit labeled action and never substitutes another product.

Store reads on mount, but never writes on mount or echoes a storage event. Before explicit save/delete it rereads storage to reduce stale-tab overwrites. True simultaneous operations remain last-writer-wins; this is not atomic distributed storage. Bounded parser rejects corrupt/newer schemas and does not overwrite their bytes. Quota/permissions failure shows an error and never a success message. The current comparison remains usable. Clearing browser data removes sets; different devices/origins do not sync. Duplicate names reject rather than overwrite; capacity rejects rather than evicts.

## Source and component boundaries
`src/lib/saved-comparisons.ts`: pure schema validation, revision/review functions and injectable external store. `SavedComparisons.tsx`: native details, labeled form, saved cards, change/missing warnings, explicit restore and confirmation deletion. `Compare.tsx`: imports the tool in empty and nonempty states; restore writes URL IDs so the existing route-to-tray logic owns the update. Safe purchaseUrl and reliable ShareButton remain untouched. Reference wording now says website summaries rather than falsely claiming all official excerpts. Future URL/store refactors must retain browser restoration coverage.

## Tests
8model/store tests cover schema, bounds, duplicate names/IDs, timestamps, changes/missing records, save/delete, no mount writes, tab updates, reread, quota and newer/corrupt bytes. Browser8cases: two viewports times save/reload/clear/restore/delete/sync; changed-and-missing actual response; unsupported schema; quota rejection. Failures retain screenshots, not relaxed selectors or disabled assertions. All policy numbers in modified responses are test-only; corpus remains byte-identical.

## Review procedure
Checkout exact PR head with Node22; npm ci, npm test, npm run lint -- --max-warnings=0, npm run build, npm run test:filters. Inspect the exact-head Saved comparison workspace workflow and screenshots at1440x960/390x844; open /compare?ids=travel-axa,travel-msig, expand 收藏比較組合, save, reload, clear, restore, and delete. Check storage JSON never replaces ic-compare-tray and missing saved products remain visible. Inspect browser errors, no horizontal overflow and all preceding PDF/search/source gates. Code added after a first failing missing-module test; behavioral tests then pass. Do not claim every OS storage/private-mode behavior was exercised merely because stubs passed.

## Rollback / dependencies
Depends on the evidence-boundary PR, but no dataset migration. Revert code and leave the separate storage key intact (do not silently delete user saves). No backend/new dependency/master merge/deploy. Keep semantic version1.7.1 and increment build. Full official freshness/canonical equivalence remains unverified; saved references do not change that.
