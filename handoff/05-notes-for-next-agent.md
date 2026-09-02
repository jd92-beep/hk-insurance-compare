# 05 — Notes for the Next Agent

Practical knowledge that will save you time. Read `AGENTS.md` (repo root) first, then this.

## Environment quirks (this machine)
- **npm registry**: the original `package-lock.json` pinned a dead mirror (`npm.mirrors.msh.team`). Fixed to `registry.npmjs.org` — if you ever regenerate the lockfile, re-check the resolved URLs.
- **Local DNS is unreliable** on this Mac: Surfshark VPN owns the system resolver (its DNS servers are intermittent) and `mDNSResponder` can hold stuck negative caches (`dscacheutil -flushcache` alone insufficient; needs `sudo killall -HUP mDNSResponder`). Verify DNS via DoH (`curl -H "accept: application/dns-json" "https://cloudflare-dns.com/dns-query?name=…&type=A"`), and test live sites with `curl --resolve host:443:104.21.8.231`. **Chrome on this machine has secure DNS enabled (Cloudflare 1.1.1.1)** — it bypasses the system resolver, so browser results may differ from CLI results.
- **Browser/desktop automation available**: `ego-browser` CLI (task spaces, inherits user login state — user is logged into Cloudflare + GitHub there) and `orca computer …` computer-use CLI (accessibility-tree control of desktop apps incl. Chrome; Orca app may need `orca open` first). Both were used successfully for the Cloudflare/GitHub setup and Chrome settings.
- **Python**: system `python3` works for `scripts/build_vhis.py` (stdlib only). For PDF work, create a venv (never install into system Python). A throwaway venv with `pypdf` existed at `/tmp/vhis-venv` — recreate if gone.
- **Git identity** is not configured; commits get an auto-generated local identity. Fix before committing if the user cares.
- Repo lives under a path **with a space**: `Documents/Projects/Insurance comparison/...` — quote paths in shell commands.

## Cloudflare / deployment
- **Wrangler CLI** is installed (`~/.local/bin/wrangler`, OAuth logged in as ftjdfr@gmail.com). Token scopes are limited (no DNS/zone-settings writes — expect 9109/10000 from the API); use the dashboard (ego-browser, user is logged in there) for those.
- Manual redeploy: `npm run build && wrangler pages deploy dist --project-name hk-insurance-compare` — but normally unneeded: **push to `master` auto-deploys** (GitHub App id 158465073, scoped to this repo only).
- Pages project: `hk-insurance-compare`, account id `08089b1718dcf47d4b21c90f9181b92c`, zone `tommychu2025.dpdns.org` (id `383678d0a94354de769318055ab603b8`).
- Previews are Access-protected (allow ftjdfr@gmail.com via OTP). Manage: Pages project → Settings → Preview access.

## Data flow (who generates what)
```
vhis.gov.hk (2 CSV + 2 XLSX)
   └─ scripts/build_vhis.py ──► public/data/vhis-plans.json   (registry; /vhis page)
                            └─► public/data/insurance-data.json (medical products merged in)
                                        └─ src/providers/InsuranceDataProvider.tsx (fetch, React context)
```
- **Never hand-edit generated content** in `insurance-data.json` for the 16 new medical products or the marker line `自願醫保認可產品全覽（vhis.gov.hk認可產品名單）` in the 12 enriched ones — reruns overwrite/depend on those markers. Edit `build_vhis.py` instead and re-run.
- The script is idempotent (verified byte-identical reruns) and asserts counts (33/70/546/28/101). If assertions fail after an official update, the official list changed — investigate, don't just bump the numbers.
- `vhis-plans.json` `source_urls` is a **Record (key→URL)**, not an array — the type in `src/types/vhis.ts` matches this.

## Official source cheat sheet
- Plan list CSVs: `https://www.vhis.gov.hk/public/data/{standard,flexi}-plans.csv`
- Standard premium summary: `.../doc/en/information_centre/Standard_Plan_Premium_Summary_{Male,Female}.xlsx` — layout: row 4 provider headers (merged spans), row 5 提供形式， row 6 新單投保年齡， rows 8–108 = ages 0–100, col A = age.
- Plan docs: `https://www.vhis.gov.hk/doc/certifiedplan/{sp|fp}/{BASE}/{FULL-CERT}-PlanDoc-c.pdf` and `-StandardPremium-Bilingual.pdf` (naming varies slightly; always use the URL from the CSV).
- List page: `https://www.vhis.gov.hk/tc/consumer_corner/list-plans.html`.
- Standard Plan benefits are **identical across insurers** (government template) — verified against S00023 PlanDoc.

## Codebase conventions that matter
- All UI copy: Traditional Chinese, HK colloquial-but-precise voice (see existing pages). Site tokens: `paper/ink/jade/amber`, `site-container`, `eyebrow`, `display-2`, `chip`, framer-motion `EASE_OUT_EXPO`.
- Insurer identity = the `insurer` (latin key) field; **reuse existing keys exactly** (`bolttech` is lowercase; `Blue Cross` has a space; `China Life (Overseas)` has parentheses). A new key creates a duplicate company in the insurers directory.
- Compare-row matching (`canonical-benefits.ts`) is **first-hit in definition order** — put specific keywords before generic ones (e.g. 終身保障限額 before 每年保障限額）.
- Lint baseline has 22 pre-existing errors — don't chase them unless asked; keep your own files clean.

## Verification habits that caught real bugs here
- Re-derive numbers from source with an independent parser and diff against stored data (caught nothing on premiums — good — but caught the age-range and insurer-key bugs).
- HTTP-check every external URL you add (a wrong vhis URL pattern 404'd in 56 places).
- After `npm run build`, confirm new data files land in `dist/data/`.

## Working with the user
- User communicates in Cantonese/Traditional Chinese; reply in kind. They value: official-source accuracy, honest flagging of uncertainty, and product pages with real content depth over visual flash.
- They may ask you to commit/push — that's fine when explicitly asked, but git identity caveat above applies.
