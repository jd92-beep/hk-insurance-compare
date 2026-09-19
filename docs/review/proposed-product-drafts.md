<!-- review-2026-09-19-product-completeness -->
# Proposed product drafts — 2026-09-19

> **Landed 2026-09-19 (Build 20260919.13):** Drafts 1–4 promoted to `insurance-data.json` as
> `life-zurich-term`, `critical-illness-zurich-care`, `accident-manulife-thankful-care`,
> `accident-manulife-take-care`. Fields filled from official product pages only; coverage cites
> official-page quotes; premiums stay `premium_available: false`; `record_status: "unverified"`.
> Brochure/PDF page-level re-verification remains open. Drafts 5–6 (Zurich landlord / HSBC Homesurance)
> are **still not live** — identity/tier decision required.

> **Not live catalogue data.** These are **human-curation drafts only**.  
> Do **not** copy into `public/data/insurance-data.json` until:
> 1. Official brochure/product page is opened and current wording captured;
> 2. Coverage/citation rows use real quotes + page numbers where applicable;
> 3. Premium fields stay empty/`premium_available: false` unless an official public premium table is cited;
> 4. `record_status` defaults to `unverified` (absent is unknown — see `product-lifecycle.ts`);
> 5. Required schema fields are filled from `src/types/insurance.ts` (`Product`).
> 6. `BUILD_NUMBER` / `BUILD_DATE` in `src/lib/version.ts` are updated when data actually lands.

Source review: [2026-09-19-product-completeness.md](2026-09-19-product-completeness.md)

---

## Draft 1 — Zurich term life (high confidence)

| Field | Draft value |
|---|---|
| `id` | `life-zurich-term` *(confirm uniqueness)* |
| `category` | `life` |
| `insurer` | `Zurich` |
| `insurer_zh` | `蘇黎世保險` |
| `product_name` | `Zurich Term Life Insurance Plan` |
| `product_name_zh` | `至安心定期壽險計劃` |
| `plan_tiers` | `["1年保費續保年期","5年保費續保年期","10年保費續保年期"]` *(from official product info table — re-read at curation)* |
| `coverage` | `[]` — **fill from brochure only** |
| `premium_range` | `""` |
| `premium_available` | `false` |
| `premium_notes` | `官方產品頁有保費示意/優惠；未核實前唔入站內保費比較。` |
| `key_terms` | `[]` — e.g. pure term, terminal illness benefit, guaranteed renew to age 100 *(verify)* |
| `exclusions` | `[]` — from policy provisions PDF |
| `source_urls` | `["https://www.zurich.com.hk/zh-hk/products/term-life/zurich-term-life-insurance-plan"]` |
| `documents_found` | `[]` — add official brochure/policy PDF URLs after download/mirror review |
| `citations` | `[]` |
| `record_status` | `unverified` |
| `last_verified_at` | `null` |
| `source_document_version` | `null` |
| `official_buy_url` | Official eShop link on product page *(curate; not proof of suitability)* |

**Source_url placeholders for human curation**

- Product page: https://www.zurich.com.hk/zh-hk/products/term-life/zurich-term-life-insurance-plan
- Product brochure (linked on page): `https://edge.sitecorecloud.io/zurichinsurf8c0-zwpshared-prod-d824/media/project/zurich-headless/hongkong/docs/individuals/life-insurance/zurich-term-life-insurance-plan/product-brochure-tc.pdf`
- Policy provisions (linked on page): `…/product-brochure-tc.pdf` sibling `policy-provision-tc.pdf` *(confirm exact URL at curation)*
- Adviser-distributed sibling (do **not** merge silently): https://life.zurich.com.hk/tc/products/swiss-protect-term-insurance-plan/

**Why draft:** Official Zurich HK nav markets term life online; site has **no** Zurich life product.

---

## Draft 2 — Zurich critical illness (high confidence)

| Field | Draft value |
|---|---|
| `id` | `critical-illness-zurich-care` *(confirm)* |
| `category` | `critical-illness` |
| `insurer` | `Zurich` |
| `insurer_zh` | `蘇黎世保險` |
| `product_name` | `Zurich Care Critical Illness Insurance Plan` |
| `product_name_zh` | `至全護危疾保障計劃` |
| `plan_tiers` | `["無索償保費回贈選項","非保費回贈選項"]` + optional note for Duo Protector / Swiss Care as **separate official lines** (do not pack without evidence) |
| `coverage` | `[]` — 81 CI / cancer drug / ICU etc. **must come from factsheet pages** |
| `premium_available` | `false` |
| `source_urls` | `["https://www.zurich.com.hk/zh-hk/products/accident-and-health/critical-illness/zurich-care-critical-illness-insurance-plan"]` |
| `record_status` | `unverified` |

**Source_url placeholders**

- Product page: https://www.zurich.com.hk/zh-hk/products/accident-and-health/critical-illness/zurich-care-critical-illness-insurance-plan
- Factsheet (on page): `…/zurich-care-critical-illness-insurance-plan/product_factsheet_tc.pdf`
- Policy provisions: `product_provision_ncb.pdf` / `product_provision_pureplan.pdf` *(linked on page)*
- CI hub (siblings): https://www.zurich.com.hk/zh-hk/products/accident-and-health/critical-illness
- Duo Protector: https://www.zurich.com.hk/zh-hk/products/accident-and-health/critical-illness/duo-protector-critical-illness-protection-series
- Adviser Swiss Care: https://life.zurich.com.hk/tc/products/swiss-care-critical-illness-insurance-plan/

**Why draft:** Empty Zurich CI category vs official online CI product with brochure assets.

---

## Draft 3 — Manulife Thankful Care accident (high confidence)

| Field | Draft value |
|---|---|
| `id` | `accident-manulife-thankful-care` |
| `category` | `accident` |
| `insurer` | `Manulife` |
| `insurer_zh` | `宏利` |
| `product_name` | `Thankful Care Personal Accident Insurance Plan` |
| `product_name_zh` | `相伴無憂個人意外保險計劃` |
| `plan_tiers` | `[]` — fill from official plan table |
| `coverage` / `exclusions` / `citations` | `[]` — from official brochure only |
| `premium_available` | `false` |
| `source_urls` | `["https://www.manulife.com.hk/zh-hk/individual/products/health/accident-protection/thankful-care.html"]` |
| `record_status` | `unverified` |

**Source_url placeholders**

- Accident index: https://www.manulife.com.hk/zh-hk/individual/products/health/accident-protection.html
- Product page: https://www.manulife.com.hk/zh-hk/individual/products/health/accident-protection/thankful-care.html
- Brochure/PDF: **TBD** — download from product page at curation

**Why draft:** Manulife official health nav markets 意外保障; site Manulife has no accident row.

---

## Draft 4 — Manulife Take Care accident (high confidence)

| Field | Draft value |
|---|---|
| `id` | `accident-manulife-take-care` |
| `category` | `accident` |
| `insurer` | `Manulife` |
| `insurer_zh` | `宏利` |
| `product_name` | `Take Care Personal Accident Plan / Benefit 2` |
| `product_name_zh` | `「萬無一失」個人意外保障計劃 / 附加保障2` |
| `plan_tiers` | `[]` — fill from official materials |
| `premium_available` | `false` |
| `source_urls` | `["https://www.manulife.com.hk/zh-hk/individual/products/health/accident-protection/take-care-personal-accident-plan-benefit-2.html"]` |
| `record_status` | `unverified` |

**Source_url placeholders**

- Product page (above)
- Brochure/PDF: **TBD** from product page
- Decide with curator: one Manulife accident record packing both products vs two records — prefer **two** if both are independently sold/comparable; else pack with explicit `plan_tiers` after evidence.

---

## Draft 5 — Zurich landlord home (medium — identity/tier decision)

| Field | Draft value |
|---|---|
| `id` | `home-zurich-landlord` *(or extend `home-zurich` tiers)* |
| `category` | `home` |
| `insurer` | `Zurich` |
| `product_name` | `Breezy Home Insurance Plan (Landlord)` |
| `product_name_zh` | `「自在家居」保險計劃（出租／業主）` |
| `premium_available` | `false` |
| `source_urls` | `["https://www.zurich.com.hk/zh-hk/products/home/breezy-home-insurance-plan-landlord"]` |
| `record_status` | `unverified` |
| `review_notes` | `與 home-zurich（住戶）關係待人工判定：tier vs 獨立產品。` |

**Source:** https://www.zurich.com.hk/zh-hk/products/home/breezy-home-insurance-plan-landlord  
*(URL already appears in existing `home-zurich.source_urls`.)*

---

## Draft 6 — HSBC Homesurance (medium — identity check vs ResidenceSurance)

| Field | Draft value |
|---|---|
| `id` | `home-hsbc-homesurance` *(only if distinct from `home-hsbc`)* |
| `category` | `home` |
| `insurer` | `HSBC` |
| `insurer_zh` | `滙豐保險` |
| `product_name` | `HSBC HomeSurance / 家居超卓萬全保` |
| `product_name_zh` | `家居超卓萬全保` |
| `plan_tiers` | `["計劃1","計劃2","計劃3","計劃4","業主/租客計劃A–B（以官方表為準）"]` |
| `premium_available` | `false` |
| `source_urls` | `["https://www.hsbc.com.hk/zh-hk/insurance/products/home/homesurance/"]` |
| `record_status` | `unverified` |
| `review_notes` | `官方頁顯示可選家庭傭工保障；一般保險承保商免責指向安盛。唔好同 AXA 家居或 home-hsbc 重複計數，除非人工確認係獨立產品。` |

**Source:** https://www.hsbc.com.hk/zh-hk/insurance/products/home/homesurance/

---

## Explicitly **not** drafted

| Candidate | Reason |
|---|---|
| AIA travel/home/motor/helper/pet | Official AIA GI routes to Blue Cross; wrong insurer key |
| Prudential motor / helper | Not on Prudential HK official product nav |
| Bowtie travel/home/helper | Official site 404 this audit pass |
| Blue WeMedi / WeGuard | Name-only on homepage; no brochure URL captured |
| Zurich cyber / drone / study / working holiday / outpatient | Nav-only this pass; category taxonomy unclear |
| FWD additional SKUs | Site already covers all categories; records pack series — needs evidence depth not new IDs |
| Any premium/limit numbers | Forbidden without official document citation |

---

## Schema checklist before merge to `insurance-data.json`

- [ ] `id` unique across 158+ rows  
- [ ] `category` ∈ site category ids  
- [ ] `insurer` / `insurer_zh` match existing keys (do not invent synonyms)  
- [ ] `product_name` / `product_name_zh` from official page title  
- [ ] `plan_tiers` only official named plans  
- [ ] `coverage[]` each row has `item`, `limit`, and real `source_url`/`page`/`quote` when claiming benefits  
- [ ] `citations[]` for any premium/limit claim  
- [ ] `source_urls` official only  
- [ ] `premium_available` false unless public official table cited  
- [ ] `record_status: "unverified"` until re-verified  
- [ ] Lifecycle + evidence audit regenerated if project requires  
- [ ] Version bump per AGENTS.md  
