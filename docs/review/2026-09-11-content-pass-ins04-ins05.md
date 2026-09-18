<!-- review-2026-09-18 -->
> **2026-09-18 documentation review:** Historical record; its old counts, screenshots, commands and completion claims are not current acceptance evidence. [delivery review](2026-09-18-release.md). No blanket policy-currentness certificate.
<!-- /review-2026-09-18 -->

# 2026-09-11 Content pass — INS-04 / INS-05 (bounded, local evidence only)

Branch: `review/20260911-integration` (includes trust work + PR #22/#23 features)  
Snapshot: `public/data/insurance-data.json` `generated_at=2026-09-02`  
Audit: `public/data/evidence-audit.json` (mechanical availability, not semantic certification)

## Scope actually performed

1. Ranked all products by mechanical evidence risk from the audit (not-found + missing-source + invalid-page + no-text + 2×reused-quotes).
2. Spot-checked **local mirrored PDFs** (pypdf, first 40 pages) for a sample of coverage quotes on 6 high-risk / special-case products.
3. Applied **one evidence-backed data lifecycle patch**: `travel-aig`.
4. Did **not** invent quotes, change policy limits to silence warnings, or claim any product is currently on sale.

## Local PDF quote spot-check (sample ≤10 coverage rows with local `/docs/` sources per product)

| Product | Sampled | Literal match in local PDF text | Not found in extraction | Notes |
|---|---:|---:|---:|---|
| `travel-aig` | 10 | **10** | 0 | Quotes present in mirrored Travelwise PDF; sales channel still discontinued |
| `home-zurich` | 10 | 8 | 2 | Failures look like **reused quote across different items** (INS-04) |
| `travel-bolttech` | 10 | 1 | 9 | Same quote reused across benefit rows / premium table fragments |
| `critical-illness-sun-life` | 10 | 0 | 10 | Quote text appears to be an English brochure heading reused as Chinese benefit proof |
| `life-za-insure` | 10 | 0 | 10 | Either paraphrase, wrong PDF version, or extraction/normalization gap — **not** proof coverage is wrong |
| `accident-fwd` | 10 | 0 | 10 | English policy headings used as quotes for multiple Chinese benefit rows |

Corpus totals this sample: 60 checked, 19 matched, 41 not found. This **reproduces** register INS-04 (reused/weak citations) for the sampled rows. It does **not** prove unsampled products are wrong, and not-found ≠ no coverage.

## Lifecycle patch applied

`travel-aig` only:

- `record_status`: `discontinued`
- `last_verified_at`: `2026-09-06`
- `source_document_version`: AIG HK Travelwise sales-channel notice (site record checked 2026-09-06)

Evidence basis: existing `AIG_TRAVEL_NOTICE` in `src/lib/product-availability.ts` + `purchaseUrl()` already blocking buy CTA for this id. Coverage/quotes left intact (local PDF matched). Historical premium fields remain as snapshot data; UI must not treat them as a live direct-purchase quote.

No other product received `record_status` / `last_verified_at` — absent fields stay **未核實** in UI.

## High-risk products to re-verify next (human + official current PDF required)

Priority queue from mechanical risk (reused quotes dominant):

1. `home-zurich` — highest reused-quote count (20) despite many local matches  
2. `critical-illness-sun-life`, `critical-illness-aia`, `critical-illness-prudential`  
3. `life-za-insure`, `life-fwd`  
4. `accident-aia`, `accident-boc-group-insurance`, `accident-fwd`, `accident-dah-sing`  
5. `home-blue-cross`, `home-dah-sing`, `home-boc-group-insurance`, `home-qbe`  
6. `pet-bolttech`, `travel-bolttech`

For each, closure needs: current official product+tier document, page-level quote for **each** coverage row, stop-sale/availability check, and only then optional `last_verified_at`.

## What remains open (INS-04 / INS-05)

- Full 158-product official-site freshness re-check — **not done**
- Replacing reused quotes with page-correct unique quotations — **not done** (would invent without source review)
- Premium promo validity windows — **not done** (display path already labels reference prices)
- Semantic interpretation of any limit — out of scope for mechanical audit

## Verification after AIG lifecycle patch

- `parseInsuranceData` accepts optional lifecycle fields (boundary tests)
- `npm run check:maintenance` + citation-shape guard still green
- Product UI shows 內容最新性：可能已停售（待覆核） via `productLifecycle` when data loaded

Do not close INS-04/05 from this document.
