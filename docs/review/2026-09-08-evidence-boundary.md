# 來源輸入邊界：INS-09修復

Base: master `2e55b969c7a6b0d48322732c6f5114dc78598821`, v1.7.1. The owner has merged the previous PRs and deliberately removed CategoryDecisionGuide. Do not restore it or refer to old review stacks as unmerged.

## Reproduction
Copy the actual snapshot into memory, set `products[0].coverage[0].source_url = 42`, then call parseInsuranceData and evidenceEntries. Before this patch validation accepts it and a downstream `.includes` call throws. Citation fields of the wrong type were also silently blanked rather than rejected.

## Boundary policy
A missing or null text field stays missing; a supplied non-string text value fails the snapshot with the product/collection/index/field path. Positive digit-string pages remain supported for existing legacy records. Page0, negative/fractional/unsafe/boolean/nonnumeric pages are rejected; missing pages stay null. The safety limit100000 aligns with the existing sourceTarget navigation guard, not an inferred document length.

Only source_url, document_name, quote, citation text and page types change here. Item, limit, product order and evidence indices are unchanged. No JSON or PDF is rewritten. The consumer sourceTarget now also returns null for a non-string caller rather than throwing; its URL allow-list and SHA-bound references remain intact.

A rejected snapshot is surfaced by the existing provider error/retry interface. This deliberately fails visibly rather than pretending invalid supplied evidence is verified, or opening another policy. Other optional product fields, DataQuality's own input shape, semantic mappings and missing-page fallback are separate unresolved work. Do not call this a full schema/security/freshness certification.

## Verification
Seven new tests: numeric source; all optional source text types; malformed citation text; invalid pages; legacy/missing values and immutability; every current product and stable evidence indices; direct public URL helper. Old code: 6failed/1passed. Fixed code: 7passed. Local cumulative82tests, zero-warning lint, build and filters passed against the integrated archive with exact master package/lock/category hashes reconciled. Remaining exact-tree verification is recorded in PR CI, not inferred from that local snapshot.

Browser test uses the real dataset with one intentionally corrupted in-memory value on1440x960 and390x844: error shown, no highlighter, corrected response plus Retry recovers the correct product without pageerror. Existing PDF byte checks remain mandatory.

Rollback: revert this PR's boundary helpers/tests; no migration. Reverting reopens the malformed-evidence crash. Build20260908.01, APP_VERSION/package1.7.1. No deployment.
