"""Read-only endpoint audit. HTTP success is NOT policy verification.

Checks all HTTPS source_urls and coverage/citation endpoints in the catalogue.
Does not submit forms, authenticate, follow private-network redirects or write
insurance data. Bounded responses and at most two requests per origin.
"""
from __future__ import annotations
import concurrent.futures, datetime, hashlib, html.parser, ipaddress, json
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

def main():
    root = pathlib.Path(__file__).resolve().parents[1]
    raw = (root / 'public/data/insurance-data.json').read_bytes()
    data = json.loads(raw); urls = {}
    for product in data['products']:
        candidates = list(product.get('source_urls', []))
        candidates += [row.get('source_url', '') for row in product.get('coverage', [])]
        candidates += [row.get('url', '') for row in product.get('citations', [])]
        for url in candidates:
            if isinstance(url, str) and url.startswith('https://'):
                urls.setdefault(url.split('#')[0], set()).add(product['id'])
    output = root / 'source-review-output'; output.mkdir(exist_ok=True)
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
    report = {'source_dataset_sha256': hashlib.sha256(raw).hexdigest(), 'product_count': len(data['products']), 'endpoint_count': len(rows), 'method': 'bounded-public-https-get; reachability only; redirects, dates and hashes do not certify identity, version, sale availability or benefits', 'results': rows}
    (output / 'report.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'products': len(data['products']), 'endpoints': len(rows), 'http_200': sum(r.get('http_status') == 200 for r in rows), 'errors_or_other_status': sum(r.get('http_status') != 200 for r in rows)}))

if __name__ == '__main__': main()
