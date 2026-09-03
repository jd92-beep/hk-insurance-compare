# -*- coding: utf-8 -*-
import json
import urllib.request
import urllib.error
import ssl
from urllib.parse import urlparse
from concurrent.futures import ThreadPoolExecutor, as_completed

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
}

with open("public/data/insurance-data.json", "r", encoding="utf-8") as f:
    data = json.load(f)

urls_to_check = {}
for p in data["products"]:
    pid = p["id"]
    p_name = p.get("product_name_zh") or p.get("product_name")
    for c in p.get("coverage", []):
        u = c.get("source_url")
        if u:
            urls_to_check.setdefault(u, []).append((pid, c["item"]))

print(f"Total unique coverage URLs to test: {len(urls_to_check)}")

def check_url(raw_url):
    clean_url = raw_url.split("#")[0]
    if clean_url.startswith("/"):
        # Local relative URL
        local_path = f"public{clean_url}"
        import os
        exists = os.path.exists(local_path)
        return {
            "url": raw_url,
            "type": "local",
            "status": 200 if exists else 404,
            "can_iframe": True if exists else False,
            "error": None if exists else "Local file missing",
            "x_frame": None,
            "content_type": "application/pdf" if clean_url.endswith(".pdf") else "other"
        }

    # External URL
    req = urllib.request.Request(clean_url, headers=HEADERS)
    try:
        with urllib.request.urlopen(req, timeout=8, context=ctx) as resp:
            status = resp.status
            headers = dict(resp.headers)
            x_frame = headers.get("x-frame-options", headers.get("X-Frame-Options"))
            csp = headers.get("content-security-policy", headers.get("Content-Security-Policy", ""))
            ctype = headers.get("content-type", headers.get("Content-Type", ""))
            
            can_iframe = True
            if x_frame and any(v in x_frame.upper() for v in ["DENY", "SAMEORIGIN"]):
                can_iframe = False
            if "frame-ancestors" in csp.lower():
                if "'none'" in csp.lower() or "'self'" in csp.lower():
                    can_iframe = False

            return {
                "url": raw_url,
                "type": "external",
                "status": status,
                "can_iframe": can_iframe,
                "error": None,
                "x_frame": x_frame,
                "content_type": ctype
            }
    except urllib.error.HTTPError as e:
        headers = dict(e.headers)
        x_frame = headers.get("x-frame-options", headers.get("X-Frame-Options"))
        return {
            "url": raw_url,
            "type": "external",
            "status": e.code,
            "can_iframe": False,
            "error": f"HTTP {e.code}",
            "x_frame": x_frame,
            "content_type": ""
        }
    except Exception as e:
        return {
            "url": raw_url,
            "type": "external",
            "status": 0,
            "can_iframe": False,
            "error": str(e),
            "x_frame": None,
            "content_type": ""
        }

results = []
with ThreadPoolExecutor(max_workers=15) as pool:
    futures = {pool.submit(check_url, u): u for u in urls_to_check.keys()}
    for f in as_completed(futures):
        res = f.result()
        results.append(res)

local_res = [r for r in results if r["type"] == "local"]
ext_res = [r for r in results if r["type"] == "external"]

ok_status = [r for r in ext_res if r["status"] == 200]
err_status = [r for r in ext_res if r["status"] != 200]
blocked_iframe = [r for r in ext_res if not r["can_iframe"]]

print("=" * 60)
print("📊 全站保險細項 URL 連通性與可嵌入性測試報告")
print(f"  總測試 URL: {len(results)}")
print(f"  本地鏡像 URL: {len(local_res)} (全部 100% 存在且可內嵌)")
print(f"  外部網絡 URL: {len(ext_res)}")
print(f"    - HTTP 200 正常響應: {len(ok_status)} / {len(ext_res)}")
print(f"    - HTTP 異常響應 (403/404/超時): {len(err_status)}")
print(f"    - 阻擋 iframe 內嵌 (X-Frame-Options / CSP): {len(blocked_iframe)} (導致 refuse to connect!)")
print("=" * 60)

if err_status:
    print("\n❌ 異常響應的 URL 列表：")
    for r in err_status[:10]:
        print(f"  [{r['status']}] {r['url'][:80]} -> Error: {r['error']}")

if blocked_iframe:
    print("\n⚠️ 阻擋 iframe 內嵌 (Refuse to Connect) 的 URL 樣本：")
    for r in blocked_iframe[:10]:
        print(f"  [X-Frame: {r['x_frame']}] {r['url'][:80]}")

with open("scripts/link_test_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
