<!-- review-2026-09-18 -->
> **2026-09-18 documentation review:** Historical record; its old counts, screenshots, commands and completion claims are not current acceptance evidence. [delivery review](2026-09-18-release.md). No blanket policy-currentness certificate.
<!-- /review-2026-09-18 -->

# 2026-09-11 Trust & honesty improvements (local review branch)

Branch: `review/20260911-trust-and-honesty`  
Base: master `9f8433e` (v1.7.3 / Build 20260911.04) → this branch **v1.7.4 / Build 20260911.05**  
Scope: engineering honesty and evidence-boundary work from the improvement plan. No master merge, no push, no policy-number or PDF rewrites.

## Live GitHub state observed before coding

| PR | State | Notes |
|---|---|---|
| #7–#20 | MERGED on master | Search, compare tray, data audit, PDF integrity, CFAR, seals, mobile evidence, problem register |
| #21 `review/20260908-evidence-boundary` | OPEN, **CONFLICTING** | INS-09 core already implemented there; this branch re-implements fail-closed validation on current master |
| #22 saved comparisons | OPEN, based on #21 | Not re-implemented here — keep as separate feature stack |
| #23 comparison export | OPEN, based on #22 | Not re-implemented here |

Closed duplicate PR4/PR6 remain historical only. Do not cherry-pick archived handoff release commands.

## What this branch changes

### INS-09 evidence input boundary
- `src/lib/data-integrity.ts`: coverage/citation optional source text fields reject non-strings; pages reject non-positive/non-integer/out-of-range values; missing stays missing; optional `record_status` / `last_verified_at` / `source_document_version` accepted only as text.
- `src/lib/pdf-evidence.ts`: `sourceTarget` fails closed for non-string callers (no `.includes` TypeError).
- `tests/evidence-boundary.test.mjs` (8 cases) + `.github/workflows/evidence-boundary.yml`.

### INS-07 filter language
- Strong filter titles demoted to neutral 「摘要檢索」 labels (no 無上限 / 不縮水 / 不拒保不減額 / 保證續保至 in `CATEGORY_FEATURE_TAGS` titles).
- Persona descriptions no longer claim unlimited evacuation or non-shrinking senior benefits.
- Keywords unchanged for retrieval.

### INS-08 canonical compare rows
- Travel CFAR vs ordinary cancellation split (`cancellation-cfar` / `cancellation`).
- Hospital cash vs admission deposit split (`hospital-cash` / `admission-deposit`).
- Tests in `tests/premium-display.test.mjs`.

### INS-10 stale About copy
- `MethodTimeline` counts derive from live snapshot + generated_at; no hardcoded 27/9/85 or 2026-08-09.
- `DataLedger` fallback no longer ships outdated category counts.

### Evidence semantics UI
- `src/lib/evidence-status.ts` + richer `EvidenceNotice` (complete/partial field counts, freshness = 未核實).
- `DataQuality` shows corpus-wide mechanical status histogram + reused-quote total.

### Premium/promo honesty (INS-13 partial)
- `src/lib/premium-display.ts` single display path used by `ProductCard` and `Compare` filled slots.
- Promo/price UI labelled as reference material; buy CTA only when a safe official URL exists.
- `src/lib/product-lifecycle.ts` surfaces optional lifecycle fields; absent fields stay unverified.

### Curation guard
- `scripts/validate_citation_shapes.mjs` wired into `npm run check:maintenance`.
- Current corpus: **0** item+limit fabricated quotes; **0** tiny page-1 quotes.

## Verification (this working tree)

| Check | Result |
|---|---|
| Node | v22.22.3 |
| `npm test` | **93/93 pass** |
| `npm run lint -- --max-warnings=0` | **exit 0** |
| `npm run build` | **success** (tsc + vite; large-chunk warning remains — INS-20 open) |
| `npm run test:filters` | **2968 + 91085 assertions, 0 fail** |
| `npm run check:maintenance` | **10/10 + citation-shape OK** |

Not run on this branch: live desktop/mobile browser scripts, Cloudflare deploy, external official-site freshness re-checks.

## Remaining gaps (do not claim closed)

- **INS-04/05**: external product/PDF currency, stop-sale, and quote meaning still require human source review. Mechanical audits ≠ verified policy advice.
- **INS-08**: more categories still need benefit-concept fixtures beyond travel CFAR/hospital rows.
- **INS-13**: promo validity windows still not encoded per product; display path is honest but data model is incomplete.
- **PR #22/#23**: saved comparisons / export stacks remain unmerged; integration must re-run all workflows on a combined SHA.
- **INS-19/20**: real-device FPS, SEO prerender invalidation, bundle budget, npm audit — out of this branch’s scope.
- Open GitHub PR #21 conflicts with master; this branch’s INS-09 work should be preferred over blindly merging #21.

## Integration guidance

1. Do **not** merge this branch to master without Boss authorization (`master` is deployment-connected).
2. If integrating later: rebase/merge onto current master, bump `BUILD_NUMBER` above every contributing head, keep `APP_VERSION`/`package.json`/`package-lock` aligned.
3. Re-run: `npm ci`, `npm test`, `npm run lint -- --max-warnings=0`, `npm run build`, `npm run test:filters`, `npm run check:maintenance`.
4. When bringing #22/#23, retest compare storage/share/export on the **combined** tree; do not inherit green checks from parent PR heads.
5. Rollback: revert this branch’s commits; no data migration. Invalid-source crash path reopens if INS-09 is reverted.

## Policy-claim boundary

This branch improves **engineering honesty and input boundaries**. It does not certify that any of the 158 products are current, available, comparable, or suitable. `insurance-data.json` remains a site snapshot.
