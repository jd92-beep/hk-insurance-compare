#!/usr/bin/env python3
"""Extract ANNUAL premiums by age from every VHIS Flexi Plan "Standard Premium Schedule" PDF and merge them
into public/data/vhis-premiums.json under "flexi".

Each certified level publishes its own schedule on vhis.gov.hk. Layouts differ (attained age vs age next
birthday, HKD/USD, male/female, basic plan/rider, smoker/non-smoker, several payment modes side by side,
two age columns per page), so the parser is deliberately strict:

  * a page's data rows must form one consistent pattern of (age, value…) groups;
  * payment-mode labels in the page header decide which value columns are ANNUAL; if that cannot be
    decided unambiguously the page is skipped;
  * the document must yield a contiguous run of ages with plausible values.

Anything that fails is reported and left out, so the site falls back to the official PDF link.
Requires `pdftotext` (poppler). Usage: python3 scripts/build_vhis_flexi_premiums.py [--skip-download]
"""

import argparse
import json
import re
import subprocess
import urllib.request
from collections import Counter
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
REPO = SCRIPT_DIR.parent
CACHE = SCRIPT_DIR / ".cache" / "flexi"
REGISTRY = REPO / "public" / "data" / "vhis-plans.json"
OUT = REPO / "public" / "data" / "vhis-premiums.json"

AGE_TOKEN = re.compile(r"^(\d{1,3})\+?\*?$|^15日$")
MONEY = re.compile(r"^\d{1,3}(,\d{3})*(\.\d+)?$|^\d+(\.\d+)?$")
MODE_PATTERNS = [
    ("annual", re.compile(r"年繳|Annual(ly)?\b", re.I)),
    ("half", re.compile(r"半年繳|Half[- ]?yearly|Semi[- ]?annual", re.I)),
    ("quarter", re.compile(r"季繳|Quarterly", re.I)),
    ("monthly", re.compile(r"月繳|Monthly", re.I)),
]


def money(tok):
    return float(tok.replace(",", ""))


def age_of(tok):
    return 0 if tok == "15日" else int(tok.rstrip("*").rstrip("+"))


def row_groups(line):
    """'  0   1,461.00   50  3,857.00 ...' → [(age, [(x, value), ...]), ...] or None if not a data row.
    x is the value's horizontal centre (used to match it with the payment-mode label above it).
    A bare integer only starts a new age group when it is ≤ 130 and is followed by a money value;
    otherwise it is a premium (e.g. a monthly '645' written without a thousands separator)."""
    line = line.replace("15 日", "15日 ")
    toks = [(m.start(), m.end(), m.group()) for m in re.finditer(r"\S+", line)]
    if not toks or not AGE_TOKEN.match(toks[0][2]):
        return None
    groups, cur = [], None
    for i, (st, en, t) in enumerate(toks):
        nxt = toks[i + 1][2] if i + 1 < len(toks) else None
        is_age = bool(AGE_TOKEN.match(t)) and age_of(t) <= 130 and nxt is not None and bool(MONEY.match(nxt.rstrip("*")))
        if is_age and (cur is None or cur[1]):
            cur = (age_of(t), [])
            groups.append(cur)
        elif MONEY.match(t.rstrip("*")) and cur is not None:
            cur[1].append(((st + en) / 2, money(t.rstrip("*"))))
        else:
            return None
    if not groups or any(not g[1] for g in groups):
        return None
    return groups


def mode_columns(header_text):
    """[(x, mode)] for every payment-mode label in the header, Chinese/English duplicates merged by position."""
    hits = []
    for line in header_text.splitlines():
        found = []
        for name, pat in MODE_PATTERNS:
            for m in pat.finditer(line):
                found.append((m.start(), m.end(), name))
        for st, en, name in found:
            # 半年繳 also matches 年繳: drop an annual hit that sits inside a half-yearly hit
            if name == "annual" and any(n == "half" and s0 <= st < e0 for s0, e0, n in found):
                continue
            hits.append(((st + en) / 2, name))
    hits.sort()
    cols = []
    for x, name in hits:
        if cols and abs(cols[-1][0] - x) <= 10 and cols[-1][1] == name:
            continue
        cols.append((x, name))
    return cols


def parse_page(page, inherited=None):
    """→ ({age: (min_annual, max_annual)}, mode_columns) — mode columns carry over to continuation pages."""
    lines = page.splitlines()
    data = [(i, row_groups(l)) for i, l in enumerate(lines)]
    data = [(i, g) for i, g in data if g]
    if len(data) < 8:
        return None, inherited
    header = "\n".join(lines[: data[0][0]])
    cols = mode_columns(header) or (inherited or [])
    if not cols:
        # no payment-mode label at all: only a single-mode schedule is safe to read as annual
        if re.search(r"Monthly|月繳|半年|季繳|Quarterly|Half", header, re.I):
            return None, inherited
        is_annual = lambda x: True  # noqa: E731
    else:
        def is_annual(x):
            # the value belongs to the nearest label at or to the left of it (labels sit above their columns)
            near = min(cols, key=lambda c: abs(c[0] - x))
            return near[1] == "annual" and abs(near[0] - x) <= 30
    out = {}
    for _, groups in data:
        for age, vals in groups:
            picks = [v for x, v in vals if is_annual(x)]
            if picks:
                lo, hi = min(picks), max(picks)
                prev = out.get(age)
                out[age] = (lo, hi) if prev is None else (min(prev[0], lo), max(prev[1], hi))
    return (out or None), cols


def parse_doc(text):
    basis = "next_birthday" if re.search(r"下次生日|Next Birthday", text, re.I) else "nearest_birthday" if re.search(r"最接近生日|Nearest", text, re.I) else "attained"
    currency = "USD" if re.search(r"美元|USD|US\$", text) and not re.search(r"港元\s*HKD|HKD", text) else "HKD"
    ages = {}
    modes = None  # continuation pages often repeat columns without repeating the payment-mode labels
    for page in text.split("\f"):
        got, modes = parse_page(page, modes)
        if got:
            for a, (lo, hi) in got.items():
                prev = ages.get(a)
                ages[a] = (lo, hi) if prev is None else (min(prev[0], lo), max(prev[1], hi))
    if len(ages) < 20:
        return None, "too few ages"
    ks = sorted(ages)
    if len(ks) != ks[-1] - ks[0] + 1:
        return None, "non-contiguous ages"
    if min(lo for lo, _ in ages.values()) < 50:
        return None, "implausible values"
    # annual columns differ by sex / smoking / basic-vs-rider, never by a payment-mode factor
    if any(hi > lo * 4 for lo, hi in ages.values()):
        return None, "mixed payment modes suspected"
    # compact: consecutive ages from `start`; a single number when min == max
    vals = []
    for a in ks:
        lo, hi = round(ages[a][0], 2), round(ages[a][1], 2)
        vals.append(lo if lo == hi else [lo, hi])
    return {"basis": basis, "currency": currency, "start": ks[0], "annual": vals}, None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--skip-download", action="store_true")
    args = ap.parse_args()
    CACHE.mkdir(parents=True, exist_ok=True)
    registry = json.loads(REGISTRY.read_text())
    levels = [(p["cert_base"], l) for p in registry["flexi_products"] if p.get("status") != "withdrawn" for l in p["levels"]]
    flexi, failures = {}, Counter()
    for base, lv in levels:
        pdf = CACHE / f'{lv["cert_no"]}.pdf'
        if not (args.skip_download and pdf.exists()):
            urllib.request.urlretrieve(lv["premium_doc_url"], pdf)
        txt = subprocess.run(["pdftotext", "-layout", str(pdf), "-"], capture_output=True, text=True).stdout
        parsed, why = parse_doc(txt)
        if parsed:
            parsed["source"] = lv["premium_doc_url"]
            flexi[lv["cert_no"]] = parsed
        else:
            failures[why or "unknown"] += 1
    data = json.loads(OUT.read_text())
    data["flexi"] = flexi
    data["source"]["flexi_note"] = "靈活計劃：由各級別官方標準保費表 PDF 自動抽取年繳保費；範圍涵蓋性別／吸煙習慣／基本計劃或附加契約等欄位。"
    OUT.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n")
    print(f"flexi levels parsed: {len(flexi)} / {len(levels)}; skipped: {dict(failures)}")


if __name__ == "__main__":
    main()
