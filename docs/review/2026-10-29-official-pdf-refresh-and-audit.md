# Delivery Review — Official PDF Corpus Audit & Refresh (Build `20261029.01`)

**Date:** 2026-10-29  
**Build:** `20261029.01` (`v1.9.0`)  
**Scope:** Full audit of all local PDF brochures/wordings in `public/docs/brochures/`, removal of 25 outdated/duplicate/orphan/wrong-jurisdiction PDFs, download & integration of 22 latest official HK insurer PDFs, and re-verification of all product citations in `public/data/insurance-data.json`.

---

## 1. Summary of Changes

### A. Removed 25 Outdated, Duplicate, Orphan & Wrong-Jurisdiction PDFs
1. **Exact SHA-256 Duplicates Removed (4 files)**:
   - `zurich-home-choice-policy.pdf` (duplicate of `info-zhm-dir-002-04-2023.pdf`)
   - `hk-axa-web-2020-2b54400f-0a48-4ae9-b32a-c7f99c7790b4_h902_stv_-_smarttraveller_plus_-_policy__28agent_broker_29_-_stv0324a_v1__28n-h902_29.pdf`
   - `hk-axa-web-2020-d0f7ca1c-dc33-44b2-950c-72eaf02b0ef3_axa_hkbn_smarttraveller_plus_pb_chi_20241128r.pdf`
   - `axahk-axahk_2fbdbcc4db-b943-4da2-9787-71584cffb855_smart_term-smart_elite_term_pb_chi_201705.pdf`
2. **Misassigned / Wrong-Jurisdiction / Unreferenced Files Removed (7 files)**:
   - `cntaiping-13193012hytf.pdf` (2013 Home Insurance proposal form `DCIS/PF-072013` misassigned to `travel-cntaiping`)
   - `bupa-carepro-topup.pdf` (August 2014 University of Hong Kong internal HR notice)
   - `bupa-elite-brochure.pdf` (Swedish corporate business health plan brochure)
   - `cigna-global-health-options.pdf` (2013 Cigna UK local Key Facts summary)
   - `prudential-pruterm-family-protector-product-brochure.pdf.coredownload.inline.pdf` (Macau edition brochure replaced with official Hong Kong Traditional Chinese edition)
   - `axa-smm-policy-sample.pdf` (unreferenced sample; `axa-smart-medicare-smm.pdf` is canonical)
   - `dbs-manuterm-202203-zh.pdf` (unreferenced 2022 DBS channel leaflet)
3. **Superseded Older Editions Replaced by Latest Official Releases (14 files)**:
   - `axahk-axahk_2fbdbcc4db-b943-4da2-9787-71584cffb855_smart_term_brochure_current.pdf` (2017 `LPPM 377-1705C`)
   - `aia-ceo-medical-brochure.pdf` (2021 `ADD000254.1221`)
   - `blue-21015372-wecare_109-_refundable_critical_illness_protector-en.pdf` (English edition)
   - `chinalife-superior-wealth-plus-whole-life-plan_c230_c231_c232_c233_tc.pdf` (2020 `C230-C233`)
   - `sunlife-sunhealth-lovepromise_pb_en.pdf` (English edition)
   - `bochk-utravelins_tc_2016.pdf` (2016 `UTC/UTK-P-2016-V00`)
   - `chubb-myhomeguard_2019_agent.pdf` (2019 agent brochure)
   - `chubb-p22_paadd_personal_accident_en_0720.pdf` (2020 English rider)
   - `aig-pw-travelwise-25-10-19-v1.pdf` (2019 wording)
   - `msig-h1044_itravel_go__28single_29_23.4.2026_4.pdf` (April 2026 edition)
   - `msig-ihelper_20insurance_20brochure_march_202026.pdf` (March 2026 edition)
   - `qbe-domestic-helper-protector-plan.pdf` (older QBE helper brochure)
   - `info-pam-dir-002-07-2025.pdf` (07-2025 Zurich personal accident wording)
   - `dahsinginsurance-product_brochure.pdf` (superseded Dah Sing travel file)

### B. Downloaded & Verified 22 Latest Official HK Insurer PDFs
All new files in `public/docs/brochures/` were fetched from official insurer CDNs, verified for `%PDF-` header, `< 32 MiB` size limit, SHA-256 integrity, and exact NFKC-normalized verbatim quotes:
1. `axahk-lppm377-rdc-smart-elite-term-chi.pdf` (`life-axa`, `LPPM 377-RDC`)
2. `aia-ceo-medical-plan-5-tc.pdf` (`medical-aia`, `high-end-aia-ceo`, `topup-aia-extra-medic`, `PTA999421.0724`)
3. `prudential-pruterm-family-protector-hk-tc.pdf` (`life-prudential`, HK Traditional Chinese edition)
4. `blue-21015372-wecare-109-ci-tc.pdf` (`critical-illness-blue`, Traditional Chinese `BBNRCR00-PSTC-211202`)
5. `chinalife-superior-wealth-plus-c234-c237-tc.pdf` (`life-china-life-overseas`, `C234-C237`)
6. `sunlife-sunhealth-lovepromise-pb-tc.pdf` (`critical-illness-sun-life`, 2026 Traditional Chinese brochure)
7. `bupa-vhis-f00040-plandoc-c.pdf` (`medical-bupa`, `high-end-bupa-elite`, VHIS Certified Plan `F00040`)
8. `prudential-pruhealth-vhis-vip-plan-tc.pdf` (`high-end-prudential-apex`, replacing cross-insurer Cigna reference)
9. `prudential-pruhealth-medical-plus-tc.pdf` (`topup-prudential-mediextra`, replacing cross-insurer Cigna reference)
10. `bochk-utravelins_tc.pdf` (`travel-boc-group-insurance`, `UTC/UTK-P-2025-V05`)
11. `chubb-mhg-brochure-2022-revamp.pdf` (`home-chubb`, Revamp brochure)
12. `chubb-p22_paadd_personal_accident_tc_0723.pdf` (`accident-chubb`, Traditional Chinese `P22/TC/0723`)
13. `aig-20250604_travelwise_brochure_co-price_tc-v8.pdf` (`travel-aig`, TravelWise v8 TC brochure)
14. `msig-h1044_itravel_go_single_20260917.pdf` (`travel-msig`, 2026-09-17 edition)
15. `msig-ihelper_insurance_brochure_sept_2026.pdf` (`domestic-helper-msig`, Sept 2026 edition)
16. `msig-ihome_insurance_brochure_jul_2026.pdf` (`home-msig`, Jul 2026 edition)
17. `msig-isafe_accident_brochure_jun_2026.pdf` (`accident-msig`, Jun 2026 edition)
18. `onedegree-pet-ceo-brochure-zh.pdf` & `odhk-petpolicyv11.pdf` (`pet-onedegree`, brochure + Version 11 policy wording)
19. `bolttechinsurance-petinsurance.pdf` (`pet-bolttech`, updated `PET.B.2024.05` edition)
20. `qbe-domestic-helper-protector-plan-v2.pdf` (`domestic-helper-qbe`, `UWD.BDMH.V5.2502`)
21. `dahsing-wmd_gi_journeysure.pdf` (`travel-dah-sing`, 2026 JourneySure brochure)
22. `info-pam-dir-002-08-2025.pdf` (`accident-zurich`, `08-2025` wording)

Additionally, existing official PDFs `bochk-leaflet_tc.pdf` (`domestic-helper-boc-group-insurance`) and `info-zpp-002-07-2022.pdf` (`motor-zurich`) were wired into `public/data/insurance-data.json`, bringing unreferenced orphan PDFs in `public/docs/brochures/` to **0** across all **78** PDFs.

---

## 2. Verification Executed

| Check | Command | Result |
|---|---|---|
| PDF Manifest Generation | `node scripts/build_pdf_manifest.mjs --check` | PASS (80 verified PDFs) |
| Maintenance Validation | `node scripts/validate_maintenance.mjs` | PASS (10/10 checks, 162 products, 40 insurers) |
| Citation Shape Validation | `node scripts/validate_citation_shapes.mjs` | PASS (0 malformed citations, 162 products OK) |
| Unit & Regression Tests | `npm test` | PASS (237/237 tests) |
| ESLint | `npm run lint -- --max-warnings=0` | PASS (0 errors, 0 warnings) |
| Deep Filter Boundary Suite | `npm run test:filters` | PASS (2,947 combinations + 114,535 deep assertions) |
| Production Build | `npm run build` | PASS (Vite + TypeScript) |
