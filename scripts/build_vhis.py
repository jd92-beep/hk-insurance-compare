#!/usr/bin/env python3
"""Build VHIS （自願醫保） data pipeline for hk-insurance-compare.

Usage:
    python3 scripts/build_vhis.py [--skip-download]

Downloads the official certified-plan data from vhis.gov.hk (or reuses the cache in
scripts/.cache/ when --skip-download is given), builds the public registry
public/data/vhis-plans.json, enriches the 12 existing medical products in
public/data/insurance-data.json with their official certification numbers, and adds
16 new insurer-level medical products for the providers not yet covered.
Idempotent. Python 3 standard library only.
"""

import argparse
import csv
import json
import re
import urllib.request
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from datetime import date
from pathlib import Path

# ---------------------------------------------------------------------------
# Paths / constants
# ---------------------------------------------------------------------------

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
DATA_DIR = REPO_ROOT / "public" / "data"
INSURANCE_JSON = DATA_DIR / "insurance-data.json"
REGISTRY_JSON = DATA_DIR / "vhis-plans.json"
CACHE_DIR = SCRIPT_DIR / ".cache"

VHIS_BASE = "https://www.vhis.gov.hk"

DOWNLOAD_URLS = {
    "standard-plans.csv": VHIS_BASE + "/public/data/standard-plans.csv",
    "flexi-plans.csv": VHIS_BASE + "/public/data/flexi-plans.csv",
    "premium-male.xlsx": VHIS_BASE + "/doc/en/information_centre/Standard_Plan_Premium_Summary_Male.xlsx",
    "premium-female.xlsx": VHIS_BASE + "/doc/en/information_centre/Standard_Plan_Premium_Summary_Female.xlsx",
}

XLSX_NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main" + "}"

LIST_PAGE_URL = "https://www.vhis.gov.hk/tc/consumer_corner/list-plans.html"
# 舊版生成時誤用嘅名單網址（404），重跑時自動清除
LEGACY_LIST_URLS = ["https://www.vhis.gov.hk/zh/consumer_corner/certified-plans.html"]
CERTS_LINE_PREFIX = "自願醫保認可產品全覽（vhis.gov.hk認可產品名單）"
GENERATED_NOTE = "由 scripts/build_vhis.py 自 vhis.gov.hk 官方認可產品名單自動生成；詳見 public/data/vhis-plans.json"

TODAY = date.today().isoformat()

# Government-standardised Standard Plan benefit table (verified from S00023 PlanDoc PDF).
STANDARD_BENEFIT_PAIRS = [
    ("每年保障限額", "每保單年度 HK$420,000"),
    ("終身保障限額", "不設終身保障限額"),
    ("病房及膳食", "每日 HK$750（每保單年度最多180日）"),
    ("雜項開支", "每保單年度 HK$14,000"),
    ("主診醫生巡房費", "每日 HK$750"),
    ("專科醫生費", "每保單年度 HK$4,300"),
    ("深切治療", "每日 HK$3,500（每保單年度最多25日）"),
    ("訂明診斷成像檢測", "每保單年度 HK$20,000（30% 共同保險）"),
    ("訂明非手術癌症治療", "每保單年度 HK$80,000"),
    ("精神科治療", "每保單年度 HK$30,000"),
    ("入院前後門診護理", "每次 HK$580（每保單年度上限 HK$3,000）"),
]

STANDARD_KEY_TERMS_ZH = [
    "保證續保至 100 歲（自願醫保標準條款）",
    "21 日冷靜期",
    "每名受保人每課稅年度最高 HK$8,000 稅務扣減",
    "涵蓋投保時未知悉的已有病症（遞增賠償：首年0%／第二年25%／第三年50%／第四年起100%）",
    "涵蓋本地精神科住院治療",
]

STANDARD_EXCLUSIONS_ZH = [
    "一般自願醫保不保事項（以保單條款為準）",
    "投保時已知悉的已有病症不獲賠償",
]

# ---------------------------------------------------------------------------
# Insurer mapping
# ---------------------------------------------------------------------------

# Existing 12 medical products: insurer key -> company-name keyword in the official CSVs
EXISTING_INSURER_KEYWORDS = {
    "AIA": "AIA International",
    "AXA": "AXA",  # folds all 3 AXA entities into medical-axa
    "BOC Life": "BOC Group Life",
    "Bowtie": "Bowtie",
    "Bupa": "Bupa",
    "Cigna": "CIGNA Worldwide General",
    "FWD": "FWD Life",
    "HSBC Life": "HSBC Life",
    "Manulife": "Manulife",
    "Prudential": "Prudential",
    "Sun Life": "Sun Life",
    "Zurich": "Zurich Insurance",
}

# 16 new insurer-level products. company_kw matches the CSV company name;
# excel_kw matches the provider header (row 4) in the premium summary workbooks.
NEW_INSURERS = [
    {"id": "medical-bolttech", "insurer": "bolttech", "insurer_zh": "保特保險",
     "company_kw": "Bolttech", "excel_kw": "bolttech"},
    {"id": "medical-blue-cross", "insurer": "Blue Cross", "insurer_zh": "藍十字",
     "company_kw": "Blue Cross", "excel_kw": "blue cross"},
    {"id": "medical-china-life-overseas", "insurer": "China Life (Overseas)", "insurer_zh": "中國人壽（海外）",
     "company_kw": "China Life", "excel_kw": "china life"},
    {"id": "medical-chubb-life", "insurer": "Chubb Life", "insurer_zh": "安達人壽保險香港",
     "company_kw": "Chubb Life Insurance Hong Kong", "excel_kw": "chubb life"},
    {"id": "medical-china-taiping", "insurer": "China Taiping", "insurer_zh": "中國太平",
     "company_kw": "China Taiping Insurance", "excel_kw": "china taiping insurance"},
    {"id": "medical-china-taiping-life", "insurer": "China Taiping Life", "insurer_zh": "中國太平人壽（香港）",
     "company_kw": "China Taiping Life", "excel_kw": "china taiping life"},
    {"id": "medical-chow-tai-fook-life", "insurer": "Chow Tai Fook Life", "insurer_zh": "周大福人壽",
     "company_kw": "Chow Tai Fook", "excel_kw": "chow tai fook"},
    {"id": "medical-dah-sing", "insurer": "Dah Sing", "insurer_zh": "大新保險",
     "company_kw": "Dah Sing", "excel_kw": "dah sing"},
    {"id": "medical-liberty-international", "insurer": "Liberty", "insurer_zh": "利寶國際保險",
     "company_kw": "Liberty", "excel_kw": "liberty"},
    {"id": "medical-hong-kong-life", "insurer": "Hong Kong Life", "insurer_zh": "香港人壽",
     "company_kw": "Hong Kong Life", "excel_kw": "hong kong life"},
    {"id": "medical-avo", "insurer": "Avo", "insurer_zh": "安我保險",
     "company_kw": "Avo", "excel_kw": "avo"},
    {"id": "medical-well-link-life", "insurer": "Well Link Life", "insurer_zh": "立橋人壽",
     "company_kw": "Well Link", "excel_kw": "well link"},
    {"id": "medical-yf-life", "insurer": "YF Life", "insurer_zh": "萬通保險",
     "company_kw": "YF Life", "excel_kw": "yf life"},
    {"id": "medical-msig", "insurer": "MSIG", "insurer_zh": "三井住友保險",
     "company_kw": "MSIG", "excel_kw": "msig"},
    {"id": "medical-boc-group-insurance", "insurer": "BOC Group Insurance", "insurer_zh": "中銀集團保險",
     "company_kw": "Bank of China Group Insurance", "excel_kw": "bank of china group insurance"},
    {"id": "medical-asia-insurance", "insurer": "Asia Insurance", "insurer_zh": "亞洲保險",
     "company_kw": "Asia Insurance", "excel_kw": "asia insurance"},
]
NEW_PRODUCT_IDS = {spec["id"] for spec in NEW_INSURERS}

# ---------------------------------------------------------------------------
# Download / cache
# ---------------------------------------------------------------------------

def download_all(skip_download):
    CACHE_DIR.mkdir(parents=True, exist_ok=True)
    paths = {}
    for name, url in DOWNLOAD_URLS.items():
        dest = CACHE_DIR / name
        if skip_download:
            if not dest.exists():
                raise SystemExit(f"cached file missing: {dest} — run once without --skip-download")
        else:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=60) as resp:
                dest.write_bytes(resp.read())
        paths[name] = dest
    return paths

# ---------------------------------------------------------------------------
# CSV parsing
# ---------------------------------------------------------------------------

def read_csv_rows(path):
    with open(path, newline="", encoding="utf-8-sig") as f:
        return list(csv.DictReader(f))

def base_cert(cert_no):
    return cert_no.split("-")[0]

def absolutize(url):
    if not url:
        return None
    if url.startswith("http"):
        return url
    return VHIS_BASE + url

def status_from_remarks(remarks):
    if "終止註冊" in remarks:
        return "withdrawn"
    if "只供現有保單續保" in remarks or "謹供其現有保單" in remarks:
        return "renewal-only"
    return "active"

def build_registry(std_rows, flexi_rows):
    standard_plans = []
    for r in std_rows:
        remarks = r["remarks-zh-hk"].strip()
        standard_plans.append({
            "cert_no": r["plan-info-certified-certification-no"],
            "cert_base": base_cert(r["plan-info-certified-certification-no"]),
            "name_zh": r["plan-name-zh-hk"],
            "name_en": r["plan-name-en"],
            "company_zh": r["company-name-zh-hk"],
            "company_en": r["company-name-en"],
            "effective_date_zh": r["plan-date-zh-hk"],
            "plan_doc_url": absolutize(r["plan-info-certified-plan-doc-url-zh-hk"]),
            "premium_doc_url": absolutize(r["plan-info-certified-premium-doc-url-zh-hk"]),
            "remarks_zh": remarks,
            "status": status_from_remarks(remarks),
        })

    flexi_groups = {}
    for r in flexi_rows:
        base = base_cert(r["plan-info-certified-certification-no"])
        grp = flexi_groups.setdefault(base, {
            "cert_base": base,
            "name_zh": r["plan-name-zh-hk"],
            "name_en": r["plan-name-en"],
            "company_zh": r["company-name-zh-hk"],
            "company_en": r["company-name-en"],
            "effective_date_zh": r["plan-date-zh-hk"],
            "remarks_zh": r["remarks-zh-hk"].strip(),
            "levels": [],
        })
        grp["levels"].append({
            "cert_no": r["plan-info-certified-certification-no"],
            "level_zh": r["plan-info-certified-plan-level-zh-hk"],
            "level_en": r["plan-info-certified-plan-level-en"],
            "plan_doc_url": absolutize(r["plan-info-certified-plan-doc-url-zh-hk"]),
            "premium_doc_url": absolutize(r["plan-info-certified-premium-doc-url-zh-hk"]),
        })

    flexi_products = []
    for base in sorted(flexi_groups):
        grp = flexi_groups[base]
        grp["status"] = status_from_remarks(grp["remarks_zh"])
        flexi_products.append(grp)

    return {
        "fetched_at": TODAY,
        "source_urls": DOWNLOAD_URLS,
        "standard_plans": standard_plans,
        "flexi_products": flexi_products,
        "summary": {
            "standard_plan_count": len(standard_plans),
            "flexi_product_count": len(flexi_products),
            "flexi_level_count": sum(len(p["levels"]) for p in flexi_products),
            "total_cert_bases": len(standard_plans) + len(flexi_products),
        },
    }

# ---------------------------------------------------------------------------
# Premium summary xlsx parsing (stdlib only)
# ---------------------------------------------------------------------------

def load_xlsx_grid(path):
    z = zipfile.ZipFile(path)
    shared = []
    if "xl/sharedStrings.xml" in z.namelist():
        root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        for si in root.iter(XLSX_NS + "si"):
            shared.append("".join(t.text or "" for t in si.iter(XLSX_NS + "t")))
    sheet = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
    grid = {}
    for row in sheet.iter(XLSX_NS + "row"):
        for c in row.findall(XLSX_NS + "c"):
            ref = c.get("r")
            v = c.find(XLSX_NS + "v")
            if v is None:
                continue
            val = v.text
            if c.get("t") == "s":
                val = shared[int(val)]
            grid[ref] = val
    return grid

CELL_RE = re.compile(r"^([A-Z]+)(\d+)$")

def col_index(letter):
    n = 0
    for ch in letter:
        n = n * 26 + (ord(ch) - 64)
    return n

def provider_header_columns(grid):
    """Row 4 of the premium summary holds the provider names; B is the label column."""
    cols = {}
    for ref, val in grid.items():
        m = CELL_RE.match(ref)
        if not m:
            continue
        letter, rownum = m.group(1), int(m.group(2))
        if rownum == 4 and letter not in ("A", "B"):
            cols[letter] = val
    return dict(sorted(cols.items(), key=lambda kv: col_index(kv[0])))

def find_provider_col(cols, keyword):
    kw = keyword.lower()
    for letter, name in cols.items():
        norm = re.sub(r"\s+", " ", name.lower())
        if kw in norm:
            return letter
    return None

def premium_at_age(grid, col, age):
    if col is None:
        return None
    return grid.get(f"{col}{8 + age}")


# （舊版單欄取值函數保留畀簡單查詢用；產品生成用 provider_span + premium_at）

def fmt_money(v):
    if v is None:
        return None
    try:
        f = float(v)
    except (TypeError, ValueError):
        return None
    if abs(f - round(f)) < 0.005:
        return f"{round(f):,}"
    return f"{f:,.2f}"


def zh_part(s):
    """取儲存格中文部分（英文對照前），除去換行。"""
    if not s:
        return ""
    return re.split(r"[A-Za-z]", s)[0].replace("\n", "").strip()


def provider_span(headers, col):
    """provider 標題欄 → 該公司成個欄位範圍（到下一個標題欄之前）。"""
    if col is None:
        return []
    letters = sorted(headers, key=col_index)
    start = col_index(col)
    nxt = [col_index(l) for l in letters if col_index(l) > start]
    end = min(nxt) - 1 if nxt else start
    def to_letter(n):
        s = ""
        while n:
            n, r = divmod(n - 1, 26)
            s = chr(65 + r) + s
        return s
    return [to_letter(n) for n in range(start, end + 1)]


def age_covers(grid, col, age):
    m = re.search(r"(\d+)\s*-\s*(\d+)", grid.get(f"{col}6", ""))
    if not m:
        return False
    return int(m.group(1)) <= age <= int(m.group(2))


def premium_col_for_age(grid, span, age):
    """範圍內揀涵蓋該年齡嘅欄；獨立保單優先，其次附加契約。"""
    cands = []
    for c in span:
        if not age_covers(grid, c, age):
            continue
        form = zh_part(grid.get(f"{c}5", ""))
        rank = 0 if ("獨立保單" in form and "附加" not in form) else 1
        cands.append((rank, col_index(c), c))
    if not cands:
        return None
    cands.sort()
    return cands[0][2]


def premium_at(grid, span, age):
    col = premium_col_for_age(grid, span, age)
    if col is None:
        return None
    return grid.get(f"{col}{8 + age}")

# ---------------------------------------------------------------------------
# Cert collection helpers
# ---------------------------------------------------------------------------

def company_maps(registry):
    std = {p["cert_base"]: p for p in registry["standard_plans"]}
    flexi = {p["cert_base"]: p for p in registry["flexi_products"]}
    return std, flexi

def collect_certs(registry, keyword):
    kw = keyword.lower()
    std = sorted(p["cert_base"] for p in registry["standard_plans"] if kw in p["company_en"].lower())
    flexi = sorted(p["cert_base"] for p in registry["flexi_products"] if kw in p["company_en"].lower())
    return std, flexi

def renewal_only_bases(registry, keyword):
    kw = keyword.lower()
    return {p["cert_base"] for p in registry["flexi_products"]
            if kw in p["company_en"].lower() and p.get("status") == "renewal-only"}

def certs_line(std_bases, flexi_bases, renewal=frozenset()):
    parts = []
    if std_bases:
        parts.append("標準計劃認可編號 " + "、".join(std_bases))
    if flexi_bases:
        active = [b for b in flexi_bases if b not in renewal]
        renew = [b for b in flexi_bases if b in renewal]
        txt = "靈活計劃認可編號 " + "、".join(active)
        if renew:
            txt += "（另 " + "、".join(renew) + " 只供現有保單續保）"
        parts.append(txt)
    if not parts:
        parts.append("未持有任何認可產品")
    return CERTS_LINE_PREFIX + "：" + "；".join(parts)

# ---------------------------------------------------------------------------
# Enrich existing 12 medical products
# ---------------------------------------------------------------------------

def enrich_existing(data, registry):
    enriched = []
    for product in data["products"]:
        if product.get("category") != "medical" or product.get("id") in NEW_PRODUCT_IDS:
            continue
        insurer = product.get("insurer")
        keyword = EXISTING_INSURER_KEYWORDS.get(insurer)
        if keyword is None:
            continue
        std_bases, flexi_bases = collect_certs(registry, keyword)
        renewal = renewal_only_bases(registry, keyword)
        # replace (or append) the marker line in plan_tiers — idempotent
        tiers = [t for t in product.get("plan_tiers", []) if not t.startswith(CERTS_LINE_PREFIX)]
        tiers.append(certs_line(std_bases, flexi_bases, renewal))
        product["plan_tiers"] = tiers
        # list-page source url（清除舊版錯誤網址，保持單一正確來源）
        urls = [u for u in product.setdefault("source_urls", []) if u not in LEGACY_LIST_URLS]
        if LIST_PAGE_URL not in urls:
            urls.append(LIST_PAGE_URL)
        product["source_urls"] = urls
        # citation pointing to the official list page（同樣清除舊網址引文）
        cits = [c for c in product.setdefault("citations", []) if c.get("url") not in LEGACY_LIST_URLS]
        if not any(c.get("url") == LIST_PAGE_URL for c in cits):
            cits.append({
                "claim_field": "plan_tiers",
                "claim_summary": f"官方認可產品編號：標準計劃 {'、'.join(std_bases) or '無'}；靈活計劃 {'、'.join(flexi_bases) or '無'}",
                "document": "自願醫保認可產品名單（vhis.gov.hk 官方 CSV 名單）",
                "page": None,
                "quote": f"標準計劃認可編號 {'、'.join(std_bases) or '無'}；靈活計劃認可編號 {'、'.join(flexi_bases) or '無'}（截至 {TODAY}）",
                "url": LIST_PAGE_URL,
            })
        product["citations"] = cits
        enriched.append(product["id"])
    return enriched

# ---------------------------------------------------------------------------
# Build the 16 new products
# ---------------------------------------------------------------------------

def distinct_levels(flexi_product):
    seen = []
    for lv in flexi_product["levels"]:
        if lv["level_zh"] not in seen:
            seen.append(lv["level_zh"])
    return seen

def build_new_product(spec, registry, grid_m, grid_f, headers_m, headers_f):
    std_map, flexi_map = company_maps(registry)
    std_bases, flexi_bases = collect_certs(registry, spec["company_kw"])
    std_entry = std_map[std_bases[0]] if std_bases else None
    flexi_entries = [flexi_map[b] for b in flexi_bases]

    # premium summary columns for this provider（男/女兩個 workbook 各自揀欄，再用全範圍欄位）
    col_m = find_provider_col(headers_m, spec["excel_kw"])
    col_f = find_provider_col(headers_f, spec["excel_kw"])
    span_m = provider_span(headers_m, col_m)
    span_f = provider_span(headers_f, col_f)
    m30 = fmt_money(premium_at(grid_m, span_m, 30))
    f30 = fmt_money(premium_at(grid_f, span_f, 30))

    # 提供形式／新單投保年齡：取全範圍欄位 union（有啲公司同時有獨立保單+附加契約欄）
    forms, age_ranges = [], []
    for c in span_m:
        f_zh = zh_part(grid_m.get(f"{c}5", ""))
        a_zh = zh_part(grid_m.get(f"{c}6", ""))
        if f_zh and f_zh not in forms:
            forms.append(f_zh)
        if a_zh and a_zh not in age_ranges:
            age_ranges.append(a_zh)
    issue_form = " / ".join(forms) or None
    age_range = "；".join(age_ranges) or None

    if m30 and f30:
        premium_range = f"標準計劃年繳保費（30歲）：男性約 HK${m30}／女性約 HK${f30}（自願醫保官方標準保費一覽表）"
    elif m30:
        premium_range = f"標準計劃年繳保費（30歲）：男性約 HK${m30}（自願醫保官方標準保費一覽表）"
    else:
        premium_range = "標準計劃保費按年齡而定，詳見自願醫保官方標準保費表"

    # 官方保費年齡曲線（0/30/50/60 歲，男+女）——畀產品頁保費 section 用
    curve = []
    for age in (0, 30, 50, 60):
        ma = fmt_money(premium_at(grid_m, span_m, age))
        fa = fmt_money(premium_at(grid_f, span_f, age))
        if ma and fa:
            curve.append(f"{age}歲：男 HK${ma}／女 HK${fa}")
        elif ma:
            curve.append(f"{age}歲：男 HK${ma}")
        elif fa:
            curve.append(f"{age}歲：女 HK${fa}")
    if curve:
        premium_notes = ("官方標準保費（年繳，港元）：" + "；".join(curve) + "。"
                         "標準保費按年齡釐定並於續保時調整；未包括保費徵費、折扣及附加保費等；"
                         "詳見 vhis.gov.hk 官方標準保費一覽表及各公司標準保費表")
    else:
        premium_notes = "標準保費按年齡釐定並於續保時調整；未包括保費徵費、折扣及附加保費等；詳見 vhis.gov.hk 官方標準保費一覽表及各公司標準保費表"

    renewal = renewal_only_bases(registry, spec["company_kw"])
    plan_tiers = []
    if std_entry:
        plan_tiers.append(f"自願醫保標準計劃：{std_entry['name_zh']}（認可編號 {std_entry['cert_base']}）")
    for fe in flexi_entries:
        lv = distinct_levels(fe)
        lv_txt = "／".join(lv[:6]) + ("…" if len(lv) > 6 else "")
        suffix = "（只供現有保單續保）" if fe.get("status") == "renewal-only" else ""
        plan_tiers.append(f"自願醫保靈活計劃：{fe['name_zh']}{suffix}（認可編號 {fe['cert_base']}；級別：{lv_txt}）")
    plan_tiers.append(certs_line(std_bases, flexi_bases, renewal))

    coverage = [{"item": item, "limit": limit} for item, limit in STANDARD_BENEFIT_PAIRS]
    if flexi_entries:
        level_names = sorted({lv for fe in flexi_entries for lv in distinct_levels(fe)})
        coverage.append({"item": "靈活計劃保障級別", "limit": "；".join(level_names[:8]) + ("等" if len(level_names) > 8 else "")})

    key_terms = list(STANDARD_KEY_TERMS_ZH)
    if issue_form:
        key_terms.insert(0, f"提供形式：{issue_form}")
    if age_range:
        key_terms.insert(1, f"新單投保年齡：{age_range}")

    product_name_zh = std_entry["name_zh"] if std_entry else spec["insurer_zh"] + "自願醫保計劃"
    product_name = std_entry["name_en"] if std_entry else spec["insurer"] + " VHIS Plan"
    if flexi_entries:
        product_name_zh += "／" + flexi_entries[0]["name_zh"]
        product_name += " / " + flexi_entries[0]["name_en"]

    source_urls = [LIST_PAGE_URL, DOWNLOAD_URLS["standard-plans.csv"], DOWNLOAD_URLS["flexi-plans.csv"]]
    if std_entry and std_entry["plan_doc_url"]:
        source_urls.append(std_entry["plan_doc_url"])
    if std_entry and std_entry["premium_doc_url"]:
        source_urls.append(std_entry["premium_doc_url"])

    documents_found = [
        "vhis.gov.hk 認可產品名單（標準計劃／靈活計劃官方 CSV）",
        "自願醫保標準計劃標準保費一覽表（男性／女性，官方 Excel）",
    ]
    if std_entry:
        documents_found.append(f"{std_entry['name_zh']} 標準計劃保單條款（PlanDoc PDF）")
        documents_found.append(f"{std_entry['name_zh']} 標準保費表（Standard Premium PDF）")

    citations = []
    if std_entry and std_entry["plan_doc_url"]:
        citations.append({
            "claim_field": "coverage",
            "claim_summary": "標準計劃每年保障限額 HK$420,000；病房及膳食每日 HK$750（180日）；訂明非手術癌症治療每年 HK$80,000",
            "document": f"{std_entry['name_zh']} 標準計劃保單條款（PlanDoc）",
            "page": None,
            "quote": "每年保障限額：每保單年度$420,000；不設終身保障限額；病房及膳食：每日$750（每保單年度最多180日）；訂明非手術癌症治療：每保單年度$80,000",
            "url": std_entry["plan_doc_url"],
        })
    if m30:
        citations.append({
            "claim_field": "premium_range",
            "claim_summary": f"標準計劃年繳保費（30歲）：男性約 HK${m30}" + (f"／女性約 HK${f30}" if f30 else ""),
            "document": "自願醫保標準計劃標準保費一覽表（男性／女性，醫務衞生局編製）",
            "page": None,
            "quote": f"30 歲：男性 {m30}" + (f"；女性 {f30}" if f30 else "") + f"（{spec['insurer_zh']}標準計劃年度標準保費，港元）",
            "url": DOWNLOAD_URLS["premium-male.xlsx"],
        })
    citations.append({
        "claim_field": "plan_tiers",
        "claim_summary": f"官方認可產品編號：標準計劃 {'、'.join(std_bases) or '無'}；靈活計劃 {'、'.join(flexi_bases) or '無'}",
        "document": "自願醫保認可產品名單（vhis.gov.hk 官方 CSV 名單）",
        "page": None,
        "quote": f"標準計劃認可編號 {'、'.join(std_bases) or '無'}；靈活計劃認可編號 {'、'.join(flexi_bases) or '無'}（截至 {TODAY}）",
        "url": LIST_PAGE_URL,
    })

    return {
        "id": spec["id"],
        "category": "medical",
        "insurer": spec["insurer"],
        "insurer_zh": spec["insurer_zh"],
        "product_name": product_name,
        "product_name_zh": product_name_zh,
        "plan_tiers": plan_tiers,
        "coverage": coverage,
        "premium_range": premium_range,
        "premium_available": True,
        "premium_notes": premium_notes,
        "key_terms": key_terms,
        "exclusions": list(STANDARD_EXCLUSIONS_ZH),
        "source_urls": source_urls,
        "documents_found": documents_found,
        "citations": citations,
        "note": GENERATED_NOTE,
    }

# ---------------------------------------------------------------------------
# Merge
# ---------------------------------------------------------------------------

def update_categories(data):
    med_count = sum(1 for p in data["products"] if p.get("category") == "medical")
    med_premium = sum(1 for p in data["products"] if p.get("category") == "medical" and p.get("premium_available"))
    for cat in data["categories"]:
        if cat["id"] == "medical":
            cat["count"] = med_count
            cat["insurers_with_premium"] = med_premium
    return med_count, med_premium

def main():
    ap = argparse.ArgumentParser(description="Build VHIS registry and merge into insurance-data.json")
    ap.add_argument("--skip-download", action="store_true", help="reuse scripts/.cache/ files")
    args = ap.parse_args()

    paths = download_all(args.skip_download)
    std_rows = read_csv_rows(paths["standard-plans.csv"])
    flexi_rows = read_csv_rows(paths["flexi-plans.csv"])

    registry = build_registry(std_rows, flexi_rows)
    REGISTRY_JSON.parent.mkdir(parents=True, exist_ok=True)
    with open(REGISTRY_JSON, "w", encoding="utf-8") as f:
        json.dump(registry, f, ensure_ascii=False, indent=2)

    grid_m = load_xlsx_grid(paths["premium-male.xlsx"])
    grid_f = load_xlsx_grid(paths["premium-female.xlsx"])
    headers_m = provider_header_columns(grid_m)
    headers_f = provider_header_columns(grid_f)

    with open(INSURANCE_JSON, encoding="utf-8") as f:
        data = json.load(f)

    # idempotency: drop previously generated 16 products before re-adding
    data["products"] = [p for p in data["products"] if p.get("id") not in NEW_PRODUCT_IDS]

    enriched = enrich_existing(data, registry)

    added = []
    for spec in NEW_INSURERS:
        product = build_new_product(spec, registry, grid_m, grid_f, headers_m, headers_f)
        data["products"].append(product)
        added.append(product["id"])

    data["generated_at"] = TODAY
    med_count, med_premium = update_categories(data)

    with open(INSURANCE_JSON, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    s = registry["summary"]
    total_products = len(data["products"])
    print("=== VHIS build summary ===")
    print(f"registry: {s['standard_plan_count']} standard plans, {s['flexi_product_count']} flexi products, "
          f"{s['flexi_level_count']} flexi levels, {s['total_cert_bases']} total cert bases")
    print(f"insurance-data.json: {total_products} products total; medical={med_count}, insurers_with_premium={med_premium}")
    print(f"enriched existing medical products: {len(enriched)} -> {', '.join(enriched)}")
    print(f"added new medical products: {len(added)} -> {', '.join(added)}")
    assert s["standard_plan_count"] == 33, s["standard_plan_count"]
    assert s["flexi_product_count"] == 70, s["flexi_product_count"]
    assert s["flexi_level_count"] == 546, s["flexi_level_count"]
    assert med_count == 28, med_count
    assert med_premium == 28, med_premium
    assert total_products == 101, total_products
    print("validation: OK")

if __name__ == "__main__":
    main()
