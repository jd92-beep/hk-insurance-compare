# 02 — Current Problems / Known Issues

Known gaps and open issues as of commit `8cfdf2c`. Ordered roughly by importance.

## Data depth gaps
1. **Flexi-plan details are registry-level only.** The 16 new medical products carry full Standard Plan benefits (government-standardized) but for their Flexi plans only names, cert numbers, and level lists — no benefit amounts, deductibles, or flexi premiums. Those live in per-plan official PDFs (linked in `vhis-plans.json`) and have not been extracted. Comparing flexi plans head-to-head is therefore still shallow.
2. **Flexi premiums not imported.** Only Standard Plan premiums (from the official summary Excel) are in the data. Flexi premium tables exist as official PDFs per cert number but parsing 500+ PDFs has not been done.
3. **Original 12 medical products are prose-based.** Their coverage/premium fields are free text from earlier manual research — inconsistent granularity vs the new 16. Some claims predate the current official versions (snapshot 2026-08-09).
4. **No per-age premium data structure.** The age curve is embedded in `premium_notes` prose and parsed by regex (`parsePremiumCurve` in `vhis-utils.ts`). Works, but fragile if text format changes.

## Code / technical debt
5. **22 pre-existing ESLint errors** (baseline before VHIS work): in `src/components/ui/*`, `Navbar.tsx`, `lib/categories.ts`, `ProductTable.tsx`, `AnchorNav.tsx` (exports non-component), providers. Not fixed — deliberately out of scope.
6. **No code-splitting**: single JS bundle ≈ 1 MB (310 KB gzip). Vite warns; `manualChunks`/lazy routes not done.
7. **No tests at all.** Verification so far = build + lint + ad-hoc data scripts + parser harnesses (thrown away after use).
8. **Browserslist data stale** (caniuse-lite 9 months old at build time) — cosmetic warning.
9. **AnchorNav hidden at `lg` (1024–1279px)** on product pages to make room for the side rail; it reappears at `xl`. Deliberate trade-off — revisit if it feels wrong.

## Process / ops
10. **Git identity not configured** on this machine — commits so far used auto-generated `Tonyc <Tonyc@TonydeMac-mini.local>`. Set `git config --global user.name/user.email` before future commits (amend + force-push if the author must change).
11. **Data staleness**: VHIS data is a snapshot (`fetched_at` in `vhis-plans.json`). Re-run `python3 scripts/build_vhis.py` (without `--skip-download`) to refresh; insurers update premiums periodically.
12. **Pre-existing oddity**: an insurer key `"Blue"` (zh "Blue") exists in non-medical categories — likely a truncated duplicate of "Blue Cross". Not touched (out of scope), worth investigating.
13. ~~No deployment configured~~ — **resolved 2026-09-02**: Cloudflare Pages + git auto-deploy + custom domain (see `01-what-has-been-done.md` §8).

## Environment quirks (this machine)
14. **Local DNS interception/poisoning**: plain-DNS queries (`dig`) on this Mac get intercepted (answers carry `rd ra` flags even from authoritative NS; stale NXDOMAIN caches). Trust DoH instead: `curl -H "accept: application/dns-json" "https://cloudflare-dns.com/dns-query?name=X&type=A"`. Also broke npm installs once via a dead mirror (`npm.mirrors.msh.team`) — if registry fetches fail with ENOTFOUND, check for network-level rewriting.
15. **Wrangler OAuth token scopes are limited** (no `dns_records:*`, no zone settings write). API calls for DNS/zone settings return 9109/10000 — use the browser dashboard (ego-browser) for those, or mint a scoped API token.
