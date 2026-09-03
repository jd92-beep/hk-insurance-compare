# -*- coding: utf-8 -*-
"""
Download external PDFs that return HTTP 200 into public/docs/brochures/
and update public/data/insurance-data.json to point to the local mirrored PDFs.
"""
import json
import os
import re
import ssl
import urllib.request
import urllib.error
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

REPO_ROOT = Path(__file__).resolve().parent.parent
DATA_PATH = REPO_ROOT / "public" / "data" / "insurance-data.json"
BROCHURES_DIR = REPO_ROOT / "public" / "docs" / "brochures"
BROCHURES_DIR.mkdir(parents=True, exist_ok=True)

with open(DATA_PATH, "r", encoding="utf-8") as f:
    data = json.load(f)

with open(REPO_ROOT / "scripts" / "link_test_results.json", "r", encoding="utf-8") as f:
    test_results = json.load(f)

# Find all external PDFs that return 200
downloadable_urls = {}
for r in test_results:
    u = r["url"].split("#")[0]
    if r["type"] == "external" and ".pdf" in u.lower() and r["status"] == 200:
        downloadable_urls[u] = True

print(f"Total unique downloadable external PDF URLs: {len(downloadable_urls)}")

# Map each URL to a clean filename
def get_clean_filename(url):
    name = Path(url.split("?")[0]).name
    # remove trailing extensions like .coredownload.inline.pdf
    name = re.sub(r'(\.pdf)+', '.pdf', name, flags=re.IGNORECASE)
    # clean special characters
    name = re.sub(r'[^a-zA-Z0-9._-]', '_', name)
    if not name.lower().endswith(".pdf"):
        name += ".pdf"
    # prepend short host if needed to prevent collision
    domain = re.sub(r'https?://(www\.)?', '', url).split('/')[0].split('.')[0]
    return f"{domain}-{name}".lower()

url_to_local_file = {}
for u in downloadable_urls.keys():
    fname = get_clean_filename(u)
    url_to_local_file[u] = fname

def download_file(url, fname):
    dest = BROCHURES_DIR / fname
    if dest.exists() and dest.stat().st_size > 1000:
        return url, fname, True, "Already exists"
    
    req = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=15, context=ctx) as resp:
            content = resp.read()
            if len(content) < 500:
                return url, fname, False, "Too small"
            with open(dest, "wb") as out:
                out.write(content)
            return url, fname, True, f"Downloaded {len(content)} bytes"
    except Exception as e:
        return url, fname, False, str(e)

print("Starting parallel download of 58 PDFs...")
success_count = 0
failed_map = {}

with ThreadPoolExecutor(max_workers=10) as pool:
    futures = {pool.submit(download_file, u, fname): (u, fname) for u, fname in url_to_local_file.items()}
    for f in as_completed(futures):
        url, fname, success, msg = f.result()
        if success:
            success_count += 1
            print(f"  ✓ {fname[:40]:40}: {msg}")
        else:
            failed_map[url] = msg
            print(f"  ✗ {fname[:40]:40}: Failed ({msg})")

print("=" * 60)
print(f"下載完成！成功鏡像: {success_count} / {len(url_to_local_file)}")
if failed_map:
    print(f"失敗數量: {len(failed_map)}")
print("=" * 60)

# Now update public/data/insurance-data.json
updated_coverage_count = 0
total_coverage_count = 0

for p in data["products"]:
    for c in p.get("coverage", []):
        total_coverage_count += 1
        src = c.get("source_url")
        if not src:
            continue
        parts = src.split("#")
        base = parts[0]
        hash_part = f"#{parts[1]}" if len(parts) > 1 else ""
        
        if base in url_to_local_file and (BROCHURES_DIR / url_to_local_file[base]).exists():
            local_path = f"/docs/brochures/{url_to_local_file[base]}{hash_part}"
            c["source_url"] = local_path
            updated_coverage_count += 1

with open(DATA_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print(f"已更新 public/data/insurance-data.json:")
print(f"  總條款項目: {total_coverage_count}")
print(f"  成功轉換為本地鏡像 URL: {updated_coverage_count}")
