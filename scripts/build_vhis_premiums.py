#!/usr/bin/env python3
"""Build public/data/vhis-premiums.json — VHIS Standard Plan premiums by attained age (0–99), male & female.

Source: the government "Standard Plan Premium Summary" (Male / Female) Excel files published on vhis.gov.hk
(same files build_vhis.py uses for its 30-year-old example). Each provider column is mapped to the provider's
Standard Plan certification number(s) in public/data/vhis-plans.json by exact (normalised) company name.
Providers that cannot be matched exactly are reported and left out — nothing is guessed.

Usage:
    python3 scripts/build_vhis_premiums.py [--skip-download]
Python 3 standard library only.
"""

import argparse
import importlib.util
import json
import re
import urllib.request
from datetime import date
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO = SCRIPT_DIR.parent
CACHE = SCRIPT_DIR / ".cache"
REGISTRY = REPO / "public" / "data" / "vhis-plans.json"
OUT = REPO / "public" / "data" / "vhis-premiums.json"

spec = importlib.util.spec_from_file_location("build_vhis", SCRIPT_DIR / "build_vhis.py")
bv = importlib.util.module_from_spec(spec)
spec.loader.exec_module(bv)

URLS = {k: bv.DOWNLOAD_URLS[k] for k in ("premium-male.xlsx", "premium-female.xlsx")}


def norm_zh(s):
    s = bv.zh_part(s or "")
    s = s.replace("（", "(").replace("）", ")")
    return re.sub(r"\s+", "", s)


def norm_en(s):
    s = (s or "").lower()
    s = s.replace("company", "co").replace("limited", "ltd").replace("insurance", "ins")
    return re.sub(r"[^a-z0-9]", "", s)


def clean_header(header):
    """drop 「前為…」/ "Formerly known as …" notes (they may contain nested brackets, so anchor on the quotes)"""
    header = re.sub(r"[(（]\s*前為「[^」]*」\s*[)）]", "", header or "")
    header = re.sub(r"\(\s*Formerly known as\s*[“\"][^”\"]*[”\"]\s*\)", "", header, flags=re.I)
    return header


def header_names(header):
    """'友邦保險(國際）有限公司 AIA International Ltd' → (zh, en); drops 「前為…」/ "Formerly known as …" notes"""
    header = clean_header(header)
    m = re.search(r"[A-Za-z]", header or "")
    zh = header[: m.start()] if m else header
    en = header[m.start():] if m else ""
    return norm_zh(zh), norm_en(en)


def to_num(v):
    try:
        return round(float(v), 2)
    except (TypeError, ValueError):
        return None


def in_range(grid, col, row, age):
    m = re.search(r"(\d+)\s*-\s*(\d+)", grid.get(f"{col}{row}", ""))
    return bool(m) and int(m.group(1)) <= age <= int(m.group(2))


def form_rank(grid, span, col):
    """0 = standalone policy, 1 = policy rider; a form label covers the columns after it until the next label."""
    label = ""
    for c in span:
        if grid.get(f"{c}5"):
            label = bv.zh_part(grid.get(f"{c}5"))
        if c == col:
            break
    return 0 if ("獨立保單" in label and "附加" not in label) else 1


def ages_for(grid, span):
    """Per attained age 0–99:
    - a number: premium for a NEW application at that age (standalone policy preferred);
    - [min, max]: age is renewal-only — the premium depends on the age the policy was taken out
      (some providers band renewal premiums by entry age), so the full spread is kept;
    - None: no premium published for that age.
    """
    out = []
    for age in range(100):
        new = sorted((form_rank(grid, span, c), bv.col_index(c), c) for c in span if in_range(grid, c, 6, age))
        if new:
            out.append(to_num(grid.get(f"{new[0][2]}{8 + age}")))
            continue
        ren = [(form_rank(grid, span, c), c) for c in span if in_range(grid, c, 7, age)]
        best = min((r for r, _ in ren), default=None)
        vals = [to_num(grid.get(f"{c}{8 + age}")) for r, c in ren if r == best]
        vals = [v for v in vals if v is not None]
        out.append(None if not vals else (vals[0] if min(vals) == max(vals) else [min(vals), max(vals)]))
    return out


def age_range(grid, span, row):
    """union of the age ranges stated in a header row across the provider's columns"""
    lo, hi = None, None
    for c in span:
        m = re.search(r"(\d+)\s*-\s*(\d+)", grid.get(f"{c}{row}", ""))
        if m:
            a, b = int(m.group(1)), int(m.group(2))
            lo = a if lo is None else min(lo, a)
            hi = b if hi is None else max(hi, b)
    return None if lo is None else [lo, hi]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--skip-download", action="store_true")
    args = ap.parse_args()
    CACHE.mkdir(exist_ok=True)
    for name, url in URLS.items():
        path = CACHE / name
        if not args.skip_download or not path.exists():
            urllib.request.urlretrieve(url, path)

    registry = json.loads(REGISTRY.read_text())
    grid_m = bv.load_xlsx_grid(CACHE / "premium-male.xlsx")
    grid_f = bv.load_xlsx_grid(CACHE / "premium-female.xlsx")
    title_m = grid_m.get("A1", "")
    as_of = re.search(r"截至\s*([0-9]{4}年[0-9]{1,2}月[0-9]{1,2}日)", title_m)

    headers = bv.provider_header_columns(grid_m)
    by_zh, by_en = {}, {}
    for col, name in headers.items():
        zh, en = header_names(name)
        by_zh[zh] = col
        by_en[en] = col

    plans, unmatched = {}, []
    for p in registry["standard_plans"]:
        if p.get("status") == "withdrawn":
            continue
        col = by_zh.get(norm_zh(p["company_zh"])) or by_en.get(norm_en(p["company_en"]))
        if not col:
            unmatched.append(f'{p["cert_base"]} {p["company_zh"]} / {p["company_en"]}')
            continue
        span = bv.provider_span(headers, col)
        male, female = ages_for(grid_m, span), ages_for(grid_f, span)
        if not any(male) and not any(female):
            unmatched.append(f'{p["cert_base"]} (no premiums in column {col})')
            continue
        plans[p["cert_base"]] = {
            "provider": bv.zh_part(clean_header(headers[col])),
            "new_application_ages": age_range(grid_m, span, 6),
            "renewal_only_ages": age_range(grid_m, span, 7),
            "male": male,
            "female": female,
        }

    data = {
        "source": {
            "document": "自願醫保標準計劃標準保費一覽表（男性／女性），醫務衞生局編製",
            "urls": URLS,
            "as_of": as_of.group(1) if as_of else None,
            "fetched_at": date.today().isoformat(),
            "note": "年度標準保費（港元），只供參考；未包括保費徵費、折扣及附加保費；以保險公司標準保費表為準。",
        },
        "standard": plans,
    }
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"wrote {OUT.relative_to(REPO)}: {len(plans)} standard plans; as of {data['source']['as_of']}")
    if unmatched:
        print("unmatched (left out):")
        for u in unmatched:
            print("  -", u)


if __name__ == "__main__":
    main()
