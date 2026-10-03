"""Read-only endpoint audit. HTTP success is NOT policy verification.

Checks all HTTPS source_urls and coverage/citation endpoints in the catalogue.
Does not submit forms, authenticate, follow private-network redirects or write
insurance data. Bounded responses and at most two requests per origin.
"""
from __future__ import annotations
import argparse, concurrent.futures, datetime, hashlib, html.parser, ipaddress, json, re
import pathlib, socket, threading, urllib.error, urllib.parse, urllib.request

MAX_BYTES = 2_000_000
class Text(html.parser.HTMLParser):
    def __init__(self):
        super().__init__(); self.hidden = 0; self.parts = []
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'noscript'): self.hidden += 1
    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript'): self.hidden = max(0, self.hidden - 1)
    def handle_data(self, data):
        if not self.hidden and data.strip(): self.parts.append(data.strip())

def public_url(url):
    parsed = urllib.parse.urlsplit(url)
    if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.password or parsed.port not in (None, 443):
        raise ValueError('Only public HTTPS endpoints on port 443 are allowed')
    addresses = socket.getaddrinfo(parsed.hostname, 443, type=socket.SOCK_STREAM)
    if not addresses or any(not ipaddress.ip_address(a[4][0]).is_global for a in addresses):
        raise ValueError('Private or unresolved network destination blocked')
    return urllib.parse.urlunsplit(parsed._replace(fragment=''))

class SafeRedirect(urllib.request.HTTPRedirectHandler):
    max_redirections = 5
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return super().redirect_request(req, fp, code, msg, headers, public_url(newurl))

def is_soft_404(url, text):
    return bool(re.search(r'/(?:404|not-found)(?:/|$)', urllib.parse.urlsplit(url).path, re.I)
                or re.search(r'找不到頁面|您尋找的網頁並不存在|Webpage cannot be found|page not found', text[:1500], re.I))

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', help='New output directory; existing reports are never overwritten')
    parser.add_argument('--baseline', type=pathlib.Path, help='Previous report.json for endpoint/text drift')
    args = parser.parse_args()
    root = pathlib.Path(__file__).resolve().parents[1]
    raw = (root / 'public/data/insurance-data.json').read_bytes()
    data = json.loads(raw); urls = {}
    for product in data['products']:
        candidates = list(product.get('source_urls', []))
        candidates += [product.get('official_buy_url'), (product.get('promo') or {}).get('buy_url')]
        candidates += [row.get('source_url', '') for row in product.get('coverage', [])]
        candidates += [row.get('url', '') for row in product.get('citations', [])]
        for url in candidates:
            if isinstance(url, str) and url.startswith('https://'):
                urls.setdefault(url.split('#')[0], set()).add(product['id'])
    stamp = datetime.datetime.now(datetime.timezone.utc).strftime('%Y%m%dT%H%M%SZ')
    output = pathlib.Path(args.output) if args.output else root / 'artifacts' / 'official-sources' / stamp
    if (output / 'report.json').exists():
        parser.error('Output already has a report; choose a new directory to preserve evidence')
    output.mkdir(parents=True, exist_ok=True)
    baseline = {row['url']: row for row in json.loads(args.baseline.read_text())['results']} if args.baseline else {}
    locks = {urllib.parse.urlsplit(u).hostname: threading.Semaphore(2) for u in urls}
    def inspect(url):
        row = {'url': url, 'products': sorted(urls[url]), 'checked_at': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'policy_currentness': 'not-established', 'policy_semantics': 'not-reviewed'}
        with locks[urllib.parse.urlsplit(url).hostname]:
            try:
                request = urllib.request.Request(public_url(url), headers={'User-Agent': 'HK-InsureCompare-source-review/1.0 (read-only; no policy certification)', 'Accept': 'text/html,application/pdf,*/*;q=0.1'})
                with urllib.request.build_opener(SafeRedirect()).open(request, timeout=12) as response:
                    content = response.read(MAX_BYTES + 1)
                    row.update({'http_status': response.status, 'final_url': response.url, 'content_type': response.headers.get('Content-Type', ''), 'truncated': len(content) > MAX_BYTES, 'last_modified_header': response.headers.get('Last-Modified')})
                    row['body_sha256'] = hashlib.sha256(content).hexdigest() if not row['truncated'] else None
                    row['observed_bytes'] = len(content)
                    if 'html' in row['content_type'].lower():
                        parser = Text(); parser.feed(content[:MAX_BYTES].decode(response.headers.get_content_charset() or 'utf-8', errors='replace'))
                        text = '\n'.join(parser.parts)
                        row['text_sha256'] = hashlib.sha256(text.encode()).hexdigest() if not row['truncated'] else None
                        row['soft_404'] = is_soft_404(response.url, text)
                        name = hashlib.sha256(url.encode()).hexdigest()[:20] + '.txt'
                        (output / name).write_text(text[:150000], encoding='utf-8')
                        row['text_file'] = name; row['text_truncated'] = len(text) > 150000 or row['truncated']
            except urllib.error.HTTPError as error:
                row.update({'http_status': error.code, 'error': str(error.reason)})
            except Exception as error:
                row.update({'http_status': None, 'error': type(error).__name__ + ': ' + str(error)[:250]})
        return row
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
        rows = list(pool.map(inspect, sorted(urls)))
    for row in rows:
        old = baseline.get(row['url'])
        row['changed_fields'] = [key for key in ('http_status', 'final_url', 'text_sha256', 'body_sha256') if old and old.get(key) is not None and row.get(key) is not None and old[key] != row[key]]
    products = []
    for product in data['products']:
        sources = [r for r in rows if product['id'] in r['products']]
        products.append({'id': product['id'], 'category': product['category'], 'name': product['product_name_zh'], 'endpoints': len(sources), 'readable_html': sum(bool(r.get('text_file')) and not r.get('soft_404') for r in sources), 'issues': [{'url': r['url'], 'status': r.get('http_status'), 'soft_404': r.get('soft_404', False)} for r in sources if r.get('http_status') != 200 or r.get('soft_404')], 'changed_urls': [r['url'] for r in sources if r['changed_fields']], 'policy_review': 'requires-product-tier-and-clause-review'})
    report = {'source_dataset_sha256': hashlib.sha256(raw).hexdigest(), 'product_count': len(data['products']), 'endpoint_count': len(rows), 'baseline': str(args.baseline) if args.baseline else None, 'method': 'bounded-public-https-get; reachability and change candidates only; redirects, dates and hashes do not certify identity, version, sale availability or benefits', 'products': products, 'results': rows}
    (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    lines = ['# Official source review', '', 'Endpoint/content changes are review candidates, not proof of policy drift. A homepage or registry page does not verify a product. PDF clauses require separate review.', '', '| Product | Readable HTML | Endpoint issues | Changed sources | Policy review |', '|---|---:|---:|---:|---|']
    lines += [f"| {p['id']} | {p['readable_html']} | {len(p['issues'])} | {len(p['changed_urls'])} | pending |" for p in products]
    (output / 'review.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    print(json.dumps({'products': len(data['products']), 'endpoints': len(rows), 'http_200': sum(r.get('http_status') == 200 for r in rows), 'errors_or_other_status': sum(r.get('http_status') != 200 for r in rows)}))

if __name__ == '__main__': main()
