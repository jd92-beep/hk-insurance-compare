<!-- review-2026-09-19-product-completeness -->
> **2026-09-19 product completeness review:** Branch `review/20260919-product-completeness` from `master`. Snapshot is not market-complete; see [delivery review](2026-09-18-release.md). No policy-currentness certificate.
<!-- /review-2026-09-19-product-completeness -->

# Product completeness audit — 19 September 2026

## Scope and method

| Item | Value |
|---|---|
| Snapshot | `public/data/insurance-data.json` (`generated_at` from catalogue; site snapshot, not market proof) |
| Catalogue size | **158 products / 40 insurer keys / 11 categories** |
| Categories | travel, medical, high-end-medical, top-up-medical, home, life, critical-illness, accident, motor, domestic-helper, pet |
| Research date | 2026-09-19 (official insurer sites via HTTPS fetch) |
| Rule | Do **not** invent product records. Do **not** bulk-add JSON without official source evidence. |

**Site pattern:** most insurer keys hold **~1 product record per category**. Many of those records already pack **multiple named products or VHIS codes** into `product_name` + `plan_tiers`. That is intentional packing, not proof of market completeness.

**Limitations of this review**

- Websearch was unavailable; evidence is direct official-page fetches.
- Some official product indexes are JS-heavy or returned 404 during this pass (Bowtie root/`/insurance`, MSIG personal index, FWD marketing shell). Those insurers are marked **partially verified**.
- Official “product line” counts are **approximate** — they count marketed lines/variants visible on official pages, not a regulator register of every on-sale contract.
- Existing `docs/review/2026-09-18-evidence.md` already states: a record can combine several products or plan tiers; the site must say「本站收錄」rather than claim full HK market coverage.

---

## Missing product ≠ missing tier

| Concept | Meaning on this site | Example |
|---|---|---|
| **Product record** | One catalogue row (`id`, `category`, `insurer`, coverage/citations) | `medical-bowtie` |
| **Plan tier** | Named plan/level **inside** that row (`plan_tiers[]`) | Bowtie Standard / Flexi Basic / Flexi Upgrade / Pink / vhis.gov.hk codes |
| **Missing tier** | Official site markets another **plan level** of an already-listed product family; may only need a `plan_tiers` / name update after evidence review | HSBC Family Protector already appears in `life-hsbc-life.plan_tiers` |
| **Missing product** | Official site markets a **separate product line** with its own brochure/page, in a category the insurer does not cover on the site (or a distinct named product that should be comparable on its own) | Zurich term life + CI: **no site records at all** |

**Tier packing already on site (not gaps):**

- `medical-bowtie` — 5 tiers covering Standard / Flexi / Pink + VHIS codes.
- `medical-blue-cross` — 6 tiers covering S00032 / F00043 / F00059 / F00073 etc.
- `medical-prudential` — 6 tiers covering VIP / FlexiChoice / 摯稱心 / Standard + high-end free-plan note.
- `critical-illness-manulife` — tier_list already names ManuVital Care, ManuBright Care 2/2+, ManuPrimo Care, Bright Care PRO, ManuLove Care alongside IncomeGuard/IncomeShield.
- `critical-illness-fwd` — Crisis OneMaster + Supreme + MyCover series packed in tiers.
- `life-hsbc-life` — already lists 尊尚定期 / 終身 / 匯盛人生 / **樂安居供樓保障** / (related) 滙家保 context via HSBC brand pages.

**Implication:** do not create a new JSON product just because an official site lists another plan level. Prefer tier/series curation when the product is the same family; create a **new product record** only when there is a distinct official product page + brochure path and the category/compare unit would be wrong if packed.

---

## Category totals on site

| Category | Products | Insurer keys |
|---|---:|---:|
| medical | 28 | 28 |
| travel | 20 | 20 |
| home | 16 | 16 |
| life | 14 | 14 |
| accident | 14 | 14 |
| critical-illness | 13 | 13 |
| motor | 13 | 13 |
| domestic-helper | 12 | 12 |
| pet | 11 | 11 |
| high-end-medical | 10 | 10 |
| top-up-medical | 7 | 7 |

Record status in snapshot: mostly absent/`undefined` (treated as unknown); `travel-aig` = `discontinued`; `travel-manulife` = `archived`.

---

## Per-insurer: site count vs official visible lines

Official counts are **approximate marketed lines/variants** from official pages fetched 2026-09-19. “Site records” counts rows in `insurance-data.json` for that insurer key.

### AIA (友邦保險)

| | |
|---|---|
| Site records | **6** (medical, high-end-medical, top-up-medical, life, critical-illness, accident) |
| Official visible lines | ~6–8 personal health/life lines on aia.com.hk (危疾 / 醫療 / VHIS / 人壽 / 儲蓄 / 意外及其他); **一般保險 page routes GI to Blue Cross** |
| Approx official count | **~6 under AIA brand** + GI via Blue Cross brand |
| Assessment | Site coverage of AIA-branded health/life is reasonable. Missing travel/home/motor/helper/pet under key `AIA` is **expected brand routing**, not an AIA product hole. |

Official: https://www.aia.com.hk/zh-hk/our-products.html · https://www.aia.com.hk/zh-hk/products/general-insurance

GI note (verbatim gist): AIA general-insurance page promotes Blue Cross as AIA Group member covering 旅遊、家居、家傭、汽車、裝修、個人意外, with external-link disclaimer to bluecross.com.hk.

### AXA (安盛)

| | |
|---|---|
| Site records | **10** (all categories except pet) |
| Official visible lines | Travel, VHIS medical, high-end medical, top-up, home, term life, CI series, accident, motor, domestic helper — broad GI + life/health on axa.com.hk |
| Approx official count | **~10–12** (CI record already packs TotalAssure / MultiPro / CareForAll / HealthVital II etc.) |
| Assessment | Closest to full coverage among majors. Pet may be genuinely absent; do not invent AXA pet. |

### Prudential (保誠保險)

| | |
|---|---|
| Site records | **9** (travel, medical, high-end-medical, top-up-medical, home, life, critical-illness, accident, pet) |
| Official product nav | 健康 / 人壽 / 儲蓄及退休 / 投資 / **家居及寵物** / **旅遊及消閒** / 僱員福利 / 商業保障 |
| Approx official count | **~9–11** marketed personal lines/categories |
| Assessment | Site already has PRUChoice Travel/Home/Furkid + health stack. **Motor and domestic-helper are not on Prudential HK product nav** — treat site gaps as **expected absence**, not missing catalogue rows. Product cards on category pages are JS-empty on fetch; names already on site come from prior brochure capture. |

Official: https://www.prudential.com.hk/tc/products/health/ · https://www.prudential.com.hk/tc/products/travel-and-leisure/ · https://www.prudential.com.hk/tc/products/home-and-pet/

### Manulife (宏利)

| | |
|---|---|
| Site records | **5** (travel* archived, medical, high-end-medical, life, critical-illness) |
| Official product nav | 人壽 / 累積財富 / 健康（VHIS、危疾、醫療、**意外**、傷殘）/ MPF / ORSO / MOVE / 投資 / ILAS / 可扣稅 |
| Approx official count | **~6–8** personal protection lines (no personal travel/home/motor/helper/pet on current Manulife HK individual nav) |
| Assessment | Travel archived on site is consistent with absence from current Manulife individual product nav. **Accident line is a real site gap** — official health section lists 意外保障 with named products. |

Official: https://www.manulife.com.hk/zh-hk/individual/products.html · https://www.manulife.com.hk/zh-hk/individual/products/health/accident-protection.html

Official accident names (fetched): **相伴無憂個人意外保險計劃**; **「萬無一失」個人意外保障計劃 / 附加保障2**.

### Bowtie (保泰人壽)

| | |
|---|---|
| Site records | **8** (medical, high-end-medical, top-up-medical, life, critical-illness, accident, motor, pet) |
| Official visible lines | **Partially verified** — `bowtie.com.hk` `/zh-hk/`, `/zh-hk/insurance`, `/en/insurance` returned **404** on 2026-09-19 |
| Approx official count | **unknown this pass**; site already packs multi-tier VHIS + Pink + Touchwood + term life + CI variants |
| Assessment | Do **not** add Bowtie travel/home/helper without a live official page. Missing categories may be genuine non-offerings. |

### Blue (Blue 保險)

| | |
|---|---|
| Site records | **3** (life, critical-illness, accident) |
| Official homepage | Markets **人壽、危疾、儲蓄、門診**; claims note names **WeGuard 藥劑EASY保** and **WeMedi Top Up 門診保** |
| Approx official count | **~4–6** named digital lines (site CI/life records already pack WeCare / 3-in-1 / CI Plan 1) |
| Assessment | **Outpatient / top-up outpatient** lines are missing from site categories. Names appear on official homepage but dedicated brochure/product URLs were not fully retrieved this pass → **human curation required** before JSON. Blue is **not** shown marketing VHIS hospital medical on homepage. |

Official: https://www.blue.com.hk/zh-hk/insurance

### FWD (富衛保險)

| | |
|---|---|
| Site records | **11** — **all 11 site categories** |
| Official visible lines | Broad life/CI/medical/VHIS/GI marketing (page shell JS-light on fetch) |
| Approx official count | **~10+** marketed lines; site records already pack multiple named products per row (e.g. CI OneMaster + MyCover; medical vPrime/vCare/vFamily + many VHIS codes) |
| Assessment | Best structural coverage on site. Remaining work is **evidence/tier depth**, not missing categories. |

### HSBC / HSBC Life (滙豐保險 / 滙豐人壽)

| | |
|---|---|
| Site records | **HSBC 3** (travel, home, domestic-helper) + **HSBC Life 3** (medical, life, critical-illness) |
| Official insurance hub | 人壽 / 儲蓄及退休 / ILAS / 醫療及危疾 / 家居及家傭 / 旅遊; online: VHIS, **滙達保 Swift Guard**, **滙家保 Family Protector**, **家居超卓萬全保 Homesurance**, 旅遊 |
| Approx official count | **~7–9** marketed personal lines (life products underwritten by HSBC Life; general insurance disclaimer notes **AXA underwriting** for GI) |
| Assessment | Brand split (HSBC vs HSBC Life) is intentional. **滙家保** already sits in `life-hsbc-life` tier_list — **tier/packing, not a blank category**. **家居超卓萬全保** may be a **distinct** home product vs site `home-hsbc` ResidenceSurance — needs human identity check before any data add. |

Official: https://www.hsbc.com.hk/zh-hk/insurance/ · https://www.hsbc.com.hk/zh-hk/insurance/products/life/family-protector/ · https://www.hsbc.com.hk/zh-hk/insurance/products/home/homesurance/

### Zurich (蘇黎世保險)

| | |
|---|---|
| Site records | **8** (travel, medical, high-end-medical, home, accident, motor, domestic-helper, pet) |
| Official product nav (fetched) | 旅遊（Breezy Travel / **大灣區** / **海外升學** / **工作假期**）· 家居（自住／**出租**／家傭）· 汽車（私家車／**電動汽車**）· 財物及**個人網絡** / 無人機 · **人壽**（網上定期／理財顧問定期）· 意外（Breezy Care / **保費回贈意外** / 運動 / 乘客）· **危疾**（至全護 / **危疾雙重保** / Swiss Care）· VHIS · **門診及牙科** · 保健通行證 |
| Approx official count | **~15–20** marketed personal lines/variants |
| Assessment | **Largest structural gap among majors.** Site has **zero** Zurich `life` and **zero** Zurich `critical-illness` records despite official online product pages + brochures. Home record only covers householder; landlord + EV motor are official sibling products. |

Official: https://www.zurich.com.hk/zh-hk/products · https://www.zurich.com.hk/zh-hk/products/term-life/zurich-term-life-insurance-plan · https://www.zurich.com.hk/zh-hk/products/accident-and-health/critical-illness/zurich-care-critical-illness-insurance-plan

### MSIG (三井住友保險)

| | |
|---|---|
| Site records | **7** (travel, medical, home, accident, motor, domestic-helper, pet) |
| Official visible lines | Personal index path returned **404** this pass; site sources already cite iTravel / VHIS / iHome / iSafe / motor / iHelper / Happy Tails product pages |
| Approx official count | **~7–8** GI lines (life/CI/high-end not typical MSIG HK personal GI) |
| Assessment | Site GI breadth looks reasonable. Do **not** invent MSIG life/CI. Optional: deepen travel variants (iTravel Plus already named in product_name). |

---

## Gap register (evidence-backed)

### A. Missing **product lines** with official product pages (safe to draft)

| # | Insurer | Category | Missing product name(s) | Official evidence | Site today |
|---|---|---|---|---|---|
| 1 | Zurich | life | **至安心定期壽險計劃** (Zurich Term Life Insurance Plan) | https://www.zurich.com.hk/zh-hk/products/term-life/zurich-term-life-insurance-plan | No Zurich life row |
| 2 | Zurich | critical-illness | **至全護危疾保障計劃** (Zurich Care Critical Illness; refundable + non-refundable options; also Duo Protector / Swiss Care on nav) | https://www.zurich.com.hk/zh-hk/products/accident-and-health/critical-illness/zurich-care-critical-illness-insurance-plan | No Zurich CI row |
| 3 | Manulife | accident | **相伴無憂個人意外保險計劃** | https://www.manulife.com.hk/zh-hk/individual/products/health/accident-protection/thankful-care.html (via accident-protection index) | No Manulife accident row |
| 4 | Manulife | accident | **「萬無一失」個人意外保障計劃** (and 附加保障2) | https://www.manulife.com.hk/zh-hk/individual/products/health/accident-protection/take-care-personal-accident-plan-benefit-2.html | No Manulife accident row |

### B. Missing **variants** better handled as tiers or sibling records after identity check

| # | Insurer | Category | Official line | Evidence | Note |
|---|---|---|---|---|---|
| 5 | Zurich | home | 家居保障（**出租** / landlord） | https://www.zurich.com.hk/zh-hk/products/home/breezy-home-insurance-plan-landlord | Site `home-zurich` is householder-only; landlord already in source_urls — **tier or sibling row after review** |
| 6 | Zurich | motor | 私家車保障（**電動汽車** / EV） | https://www.zurich.com.hk/zh-hk/products/motor/breezy-motor-private-ev-motor-car-insurance-plan | Sibling of Motorplus/Breezy Motor — may be tier/variant |
| 7 | HSBC | home | **家居超卓萬全保** Homesurance | https://www.hsbc.com.hk/zh-hk/insurance/products/home/homesurance/ | Site has ResidenceSurance; official page markets Homesurance with Plans 1–4 / A–B + optional helper cover; **GI underwriting disclaimer points to AXA** — do not double-count without identity check |

### C. Named on official site but **not safe to add as JSON yet**

| Item | Why not safe |
|---|---|
| Blue **WeMedi Top Up 門診保** / **WeGuard 藥劑EASY保** | Names on official homepage only this pass; no stable product/brochure URL captured; category fit (outpatient vs medical/top-up) undecided |
| Zurich GBA travel / overseas study / working holiday / cyber / drone / outpatient-dental / Zurich Guard PA | Official nav lists them; no brochure-level capture in this audit; some may be out of current site category taxonomy |
| Prudential motor / domestic helper | Not on Prudential HK official product navigation |
| AIA-branded travel/home/motor/helper/pet | AIA official GI page routes to **Blue Cross** (already on site under `Blue Cross`) |
| Bowtie travel/home/helper | Official site 404 this pass; cannot confirm offerings |
| MSIG / AXA life or CI where not marketed | Would invent lines |
| Any premium, limit, exclusion | Requires product brochure + page-level citation (AGENTS.md evidence rules) |
| Re-activating `travel-aig` discontinued / `travel-manulife` archived | Already dispositioned in 2026-09-18 evidence review |

### D. High-confidence gap **count**

| Bucket | Count |
|---|---:|
| Clear missing **product lines** with official product pages (A) | **4** |
| Official **variants** needing identity/tier decision (B) | **3** |
| Named but **unsafe** without more evidence (C) | **~10+** lines |
| **Do-not-add** brand-routing / non-offerings | Several (AIA GI, Pru motor/helper, etc.) |

Drafts for bucket A (+ carefully labelled B-adjacent HSBC/Zurich) live in [proposed-product-drafts.md](proposed-product-drafts.md).

**Update 2026-09-19 (Build 20260919.13):** Bucket A drafts 1–4 were promoted into
`public/data/insurance-data.json` after official product-page fetches (Zurich term life + Zurich Care CI +
Manulife Thankful Care + Manulife Take Care). Catalogue is now **162 products**. Coverage rows cite
official product-page quotes only; premiums remain unpublished; lifecycle `unverified`. Bucket B identity
checks (Zurich landlord / EV motor / HSBC Homesurance) and Bucket C items are **still not added**.
Category snapshot counts recomputed from products (insurers_with_premium derived from `premium_available === true`).

---

## Evidence links for proposed additions

1. Zurich Term Life — product page + brochure PDF linked on page:  
   https://www.zurich.com.hk/zh-hk/products/term-life/zurich-term-life-insurance-plan  
   Brochure (on-page): `…/docs/individuals/life-insurance/zurich-term-life-insurance-plan/product-brochure-tc.pdf`
2. Zurich Care CI — product page + factsheet:  
   https://www.zurich.com.hk/zh-hk/products/accident-and-health/critical-illness/zurich-care-critical-illness-insurance-plan  
   Factsheet (on-page): `…/zurich-care-critical-illness-insurance-plan/product_factsheet_tc.pdf`
3. Manulife accident index:  
   https://www.manulife.com.hk/zh-hk/individual/products/health/accident-protection.html  
   Product pages: `…/thankful-care.html`, `…/take-care-personal-accident-plan-benefit-2.html`
4. Zurich products index (variants):  
   https://www.zurich.com.hk/zh-hk/products
5. HSBC insurance hub + Homesurance + Family Protector (above).
6. AIA GI → Blue Cross routing:  
   https://www.aia.com.hk/zh-hk/products/general-insurance
7. Blue homepage outpatient names:  
   https://www.blue.com.hk/zh-hk/insurance
8. Prudential product nav:  
   https://www.prudential.com.hk/tc/products/health/ (and travel-and-leisure / home-and-pet)

---

## What we **cannot** safely add

- Full-market claims: site remains「本站收錄」.
- Product rows without official brochure/page **and** human-filled schema fields (coverage, citations, premium).
- Merging insurer keys (e.g. HSBC + HSBC Life; AIA + Blue Cross) without reviewed migration evidence (AGENTS.md).
- Invented premiums, limits, or “unlimited” values.
- Treating `plan_tiers` names as proof a separate SKU should be a separate compare row.
- Bowtie/MSIG/FWD additions that could not be re-verified this pass.
- Discontinued/archived travel rows as if currently on sale.

---

## Recommended next actions (human curation)

1. **Priority 1:** Zurich life + Zurich CI — strongest official evidence, fills empty categories for a major GI/life brand already on site for 8 other lines.
2. **Priority 2:** Manulife accident (Thankful Care + Take Care) — official health nav; fills empty accident category for Manulife.
3. **Identity check:** HSBC ResidenceSurance vs Homesurance; Zurich householder vs landlord; Zurich motor vs EV motor — decide tier vs new `id`.
4. **Evidence pass:** Blue outpatient product pages/brochures before any draft promotion to JSON.
5. **UI honesty:** insurers page already uses `INSURER_SORT_NOTE`; consider explicit「並非全市場產品目錄」copy if density UI implies completeness.
6. **Do not** bulk-import from aggregator lists.

---

## Verification

| Check | Result |
|---|---|
| Branch created from master | `review/20260919-product-completeness` |
| Snapshot inventory derived | Yes — Node parse of `public/data/insurance-data.json` (158 products) |
| Official pages fetched | AIA, AXA (prior site URLs), Prudential, Manulife, Blue, HSBC, Zurich (index + term life + CI), MSIG (404), Bowtie (404), FWD (shell) |
| `insurance-data.json` modified | **No** |
| Drafts file | `docs/review/proposed-product-drafts.md` (schema fields + source placeholders) |
| Full CI (npm test/lint/build) | **Not run** — documentation-only review; no app code/data change |

---

## Related

- [2026-09-18 evidence audit](2026-09-18-evidence.md) — packing, archival, endpoint reachability
- [2026-09-18 open gaps](2026-09-18-open-gaps.md) — semantic re-verification still open for 158 policies
- [2026-09-18 release](2026-09-18-release.md) — release boundary
