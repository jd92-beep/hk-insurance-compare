# Portable comparison review brief

## Purpose / data contract
On /compare, “匯出核對摘要” downloads a UTF-8 Markdown file for the currently shown1–3products. It is not a quote, a policy PDF or a personalized recommendation. Snapshot date and UTC export time are separate; app version is recorded. Each product retains its identity, plan tiers, website premium-reference wording, every coverage row, key terms, exclusions, product link and usable source/evidence-center links. No competitor price or new insurance amount is introduced.

The raw per-product coverage rows are exported, not a guessed canonical equivalence table: changing wording or absent data is not silently harmonized. Mixed categories carry a warning. Missing sources/pages remain visible; page1 is never invented by export. Explicit row-page vs URL-page disagreement is labeled. Summary words are not called original policy quotes; excerpts remain for in-browser source review. Source availability/hash consistency does not certify semantic accuracy/currentness.

## Security and lifecycle
Formatter treats text as Markdown text: escapes HTML/links/table separators and collapses embedded line breaks rather than creating arbitrary new sections. External URLs must pass the existing HTTPS/source allow-list, with credential rejection; parentheses/angle brackets in destinations are encoded. Internal links use only the supplied page origin, no copied tracking query. File name comes only from a validated UTC date, never from user input. Bound1–3distinctIDs and1million output characters.

Button creates a local Blob, triggers browser download, removes temporary anchor, and revokes object URLs after the handoff or on unmount. It says the file was generated and handed to the browser, not that it successfully persisted on disk. Failure shows an alert and no false success. No server request is required to generate the export, no account/clipboard access, no new dependency. Existing reliable share and purchase URL logic remain intact; toolbar wraps on narrow screens.

## Verification
Six initial formatter tests, including real selected products with preserved coverage and source-index mapping, input immutability, malformed origin/time/selection, unsafe Markdown/URLs, missing source/page and mixed-category/page-conflict cases. Initial missing-module failure, then5pass/1fail (date readability over-escaping), then6pass. Second review reproduced acceptance of non-string IDs; added invalid-ID and more-than-three assertions, then required string IDs. The same six test groups now pass, with96 total unit tests locally. Browser test uses actual downloads on1440x960/390x844, inspects filename and file contents, removes a product and reexports to catch stale selection, then injects createObjectURL failure and requires no third download. Artifact includes generated samples and screenshots.

Review commands: Node22 npm ci; npm test; npm run lint -- --max-warnings=0; npm run build; npm run test:filters. Check exact-head Comparison brief export workflow plus inherited saved-set, source-boundary, original PDF-integrity, search/share and all-product workflows. Code is not complete merely because a mocked helper returns true.

## Scope / rollback
Base is the saved-comparison PR. No policy-data/PDF mutation, no migration, no automatic deployment. Revert exporter and button integration to remove feature; do not delete user saved sets. Existing official-currentness, promotion-validity and canonical mapping gaps remain. Safari/OS-specific file behavior and true low-end hardware performance still need device testing.
