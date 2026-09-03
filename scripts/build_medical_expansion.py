#!/usr/bin/env python3
"""Merge High-End Medical and Top-Up Medical products into insurance-data.json,
and enrich all products across all categories with comprehensive coverage items.

Enrichment guarantees:
- 'high-end-medical': 8 products × 20 coverage items each
- 'top-up-medical': 7 products × 18 coverage items each
- 'medical' (VHIS): 28 products × 18-23 coverage items each (standard 18 VHIS government benefits + flexi upgrades)
- Other 8 categories (travel, home, critical-illness, accident, motor, domestic-helper, pet, life): 73 products × 13-18 coverage items each

Every single coverage item is structured with item, limit, and high-quality citations!
"""

import json
from pathlib import Path
import sys

# 載入模組
REPO_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(REPO_ROOT))

from scripts.data_high_end import HIGH_END_PRODUCTS
from scripts.data_top_up import TOP_UP_PRODUCTS
from scripts.data_vhis_enrich import enrich_medical_product
from scripts.data_other_enrich import enrich_other_category_product

DATA_FILE = REPO_ROOT / "public" / "data" / "insurance-data.json"

def main():
    print(f"Reading {DATA_FILE}...")
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        data = json.load(f)

    # 1. 管理 categories
    existing_cats = {c["id"]: c for c in data.get("categories", [])}
    
    new_cats = [
        {
            "id": "high-end-medical",
            "name_zh": "高端醫療保險",
            "count": len(HIGH_END_PRODUCTS),
            "insurers_with_premium": len([p for p in HIGH_END_PRODUCTS if p.get("premium_available")])
        },
        {
            "id": "top-up-medical",
            "name_zh": "Top-up 醫療保險",
            "count": len(TOP_UP_PRODUCTS),
            "insurers_with_premium": len([p for p in TOP_UP_PRODUCTS if p.get("premium_available")])
        }
    ]

    for nc in new_cats:
        existing_cats[nc["id"]] = nc

    cat_order = [
        "home", "travel", "life", "critical-illness", "accident",
        "medical", "high-end-medical", "top-up-medical",
        "motor", "domestic-helper", "pet"
    ]
    data["categories"] = [existing_cats[cid] for cid in cat_order if cid in existing_cats]

    # 2. 處理 products：移除舊 high-end / top-up，保留其他類別
    base_products = [p for p in data.get("products", []) if p.get("category") not in ("high-end-medical", "top-up-medical")]
    
    # 3. 對 base_products 中的各類別進行條款補齊
    enriched_base = []
    for p in base_products:
        cat = p.get("category")
        if cat == "medical":
            enriched_p = enrich_medical_product(p)
        else:
            enriched_p = enrich_other_category_product(p)
        enriched_base.append(enriched_p)

    # 4. 合併高端醫療與 Top-Up 醫療
    all_products = []
    all_products.extend(enriched_base)
    all_products.extend(HIGH_END_PRODUCTS)
    all_products.extend(TOP_UP_PRODUCTS)

    # 5. 數據合法性驗證與斷言
    print("\n--- Validating Data Integrity ---")
    seen_ids = set()
    category_counts = {}
    coverage_counts_by_cat = {}

    for p in all_products:
        pid = p.get("id")
        assert pid, "Product missing id"
        assert pid not in seen_ids, f"Duplicate product id found: {pid}"
        seen_ids.add(pid)

        cat = p.get("category")
        assert cat, f"Product {pid} missing category"
        category_counts[cat] = category_counts.get(cat, 0) + 1

        cov = p.get("coverage", [])
        assert len(cov) >= 12, f"Product {pid} ({cat}) has only {len(cov)} coverage items, expected >= 12"
        for idx, item in enumerate(cov):
            assert "item" in item and item["item"].strip(), f"Product {pid} coverage[{idx}] missing item name"
            assert "limit" in item and item["limit"].strip(), f"Product {pid} coverage[{idx}] missing limit"

        coverage_counts_by_cat.setdefault(cat, []).append(len(cov))

    print(f"Total verified products: {len(all_products)}")
    assert len(all_products) == 116, f"Expected 116 total products, got {len(all_products)}"

    for cat_id, lens in coverage_counts_by_cat.items():
        avg_len = sum(lens) / len(lens)
        min_len = min(lens)
        max_len = max(lens)
        print(f"Category: {cat_id:18} | Count: {len(lens):2} | Coverage items: min={min_len:2}, max={max_len:2}, avg={avg_len:4.1f}")

    data["products"] = all_products

    # 6. 回寫檔案
    with open(DATA_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"\nSuccessfully wrote enriched data to {DATA_FILE}!")

if __name__ == "__main__":
    main()
