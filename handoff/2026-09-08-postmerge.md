# 2026-09-08 post-merge handoff

Start from actual master, not the old September6review stacks. The owner merged the previous PRs and released v1.7.1 at `2e55b969c7a6b0d48322732c6f5114dc78598821`; that commit deliberately removes CategoryDecisionGuide. Preserve the removal and all already-merged PDF/store/search/share/citation guards.

This review introduces three separate changes: PR21 evidence-input boundary, its child saved comparison workspace PR22, and the export brief PR on top. Verify live PR heads before integrating. Only the owner merged earlier code; this current session creates review branches and does NOT merge or deploy.

## Important files
- `docs/superpowers/plans/2026-09-08-postmerge-improvements.md`: public competitor research, selected features, rejected scope and next roadmap.
- `docs/review/2026-09-08-evidence-boundary.md`: INS-09 implemented; optional evidence strings/pages fail visibly if malformed, missing remains unknown.
- `docs/review/2026-09-08-saved-comparisons.md`: schema/storage key, reopening current data, missing/change warnings, privacy/limits and rollback.
- `docs/review/2026-09-08-comparison-export.md`: export format, safe Markdown/URLs, actual downloads and limitations.

## What is still not verified
Do not mark all policy versions current because validation or download checks pass. No insurance numbers, clauses or PDFs were updated by this batch. Remaining high-priority work: canonical benefit equivalence (CFAR vs ordinary cancellation etc), official product/tier/version mapping, promotion expiry/quote basis, independent DataQuality payload validation and missing-page reader states. True simultaneous localStorage changes are still last-writer-wins. Real-device Safari/Android performance and full security/SEO review are separate.

Saved sets store public identity/fingerprints, not quote snapshots or health profiles; use a new key separate from the existing comparison tray. Unknown schema cannot be overwritten. Export is a review brief, not a policy or quote. Keep full source/missing/page-conflict cautions, and retain explicit download-failure handling.

## Verification before merge
Node22 committed lockfile, npm ci / npm test / zero-warning lint / build / filters. Rerun source-boundary, saved sets, export, existing search/storage/share/PDF byte/quote/stamp/chart and full-product workflows on the combined candidate. Read results and actual desktop/mobile screenshots; do not cite a parent head's result as proof of a new head. Keep the generated PDF manifest consistent. Use1.7.1 with20260908 build increments unless a separate release decision changes semantic version.
