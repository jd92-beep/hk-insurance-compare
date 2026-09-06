"""Reproducible corpus audit. Literal presence never certifies meaning or currentness.
Run: python scripts/audit_evidence.py --as-of 2026-09-06
Dependency: PyMuPDF 1.26.7 (audit-only, not shipped in the website).
"""
from __future__ import annotations
import argparse, hashlib, json, re, unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import unquote, urlsplit
import fitz

def normal(text):
    return re.sub(r'[\s\u00ad]+', '', unicodedata.normalize('NFKC', text or '')).lower()

def local_path(url, root):
    if not isinstance(url,str) or '\\' in url: return None
    parsed=urlsplit(url)
    path=unquote(parsed.path)
    if parsed.scheme or parsed.netloc or parsed.query: return None
    if not re.fullmatch(r'/docs/brochures/[^/\\]+\.pdf',path,re.I): return None
    if Path(path).name.startswith('.') or any(ord(c)<32 for c in path): return None
    resolved=(root/path.lstrip('/')).resolve()
    return resolved if resolved.is_relative_to((root/'docs/brochures').resolve()) else None

def literal_status(text,quote):
    t,q=normal(text),normal(quote)
    if len(q)<8:return 'no-quote'
    if not t:return 'no-text'
    count=t.count(q)
    return 'literal-match' if count==1 else 'ambiguous' if count>1 else 'not-found'

def audit_product(product, documents, texts):
    results=[];reused=defaultdict(set)
    for row in product.get('coverage',[]):
        if normal(row.get('quote')):reused[normal(row['quote'])].add(row.get('item',''))
    entries=[('coverage',i,r.get('source_url',''),r.get('page'),r.get('quote',''),r.get('item','')) for i,r in enumerate(product.get('coverage',[]))]
    entries += [('citation',i,r.get('url',''),r.get('page'),r.get('quote',''),r.get('claim_summary','')) for i,r in enumerate(product.get('citations',[]))]
    for kind,index,url,page,quote,item in entries:
        url=url or '';base=url.split('#')[0];doc=documents.get(base)
        flags=[]
        if not url:status='missing-source'
        elif not url.startswith('/'):status='external-only'
        elif not doc:status='missing-mirror'
        elif doc.get('error'):status='unreadable-pdf'
        else:
            if page is None:
                match=re.search(r'(?:^|[&#])page=(\d+)',url.split('#',1)[-1] if '#' in url else '')
                page=int(match[1]) if match else None
            if not isinstance(page,int) or isinstance(page,bool) or page<1 or page>doc['pages']:status='invalid-or-missing-page'
            else:status=literal_status(texts[base][page-1],quote)
        if kind=='coverage' and len(reused.get(normal(quote),set()))>1:flags.append('quote-reused-for-different-benefits')
        results.append({'kind':kind,'index':index,'item':item,'source':url,'page':page,'status':status,'flags':flags})
    counts=Counter(r['status'] for r in results)
    return {'id':product['id'],'category':product['category'],'name':product.get('product_name_zh',product['id']),
        'latest_content_status':'unverified','semantic_claim_status':'requires-human-review',
        'source_candidates':[u for u in product.get('source_urls',[]) if isinstance(u,str) and u.startswith('https://')],
        'counts':dict(counts),'reused_quote_claims':sum(bool(r['flags']) for r in results),
        'next_action':'核對官方現行產品／計劃級別、文件版次與生效日期；重新映射逐條保障，不以下載日或文字命中冒認核實。',
        'entries':results}

def build(root,as_of):
    raw=(root/'public/data/insurance-data.json').read_bytes();data=json.loads(raw)
    documents={};texts={}
    for path in sorted((root/'public/docs/brochures').glob('*.pdf')):
        key='/'+str(path.relative_to(root/'public'))
        item={'path':key,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'bytes':path.stat().st_size,'latest_version_status':'unverified'}
        try:
            with fitz.open(path) as pdf:
                item['pages']=len(pdf);item['pdf_metadata_date']=(pdf.metadata or {}).get('modDate','')
                texts[key]=[page.get_text() for page in pdf]
                item['text_pages']=sum(bool(normal(t)) for t in texts[key])
        except Exception as error:item['error']=type(error).__name__
        documents[key]=item
    products=[audit_product(p,documents,texts) for p in data['products']]
    counts=Counter();categories=Counter(p['category'] for p in products)
    for p in products:counts.update(p['counts'])
    registry={c['id']:c.get('count') for c in data['categories']}
    report={'schema_version':1,'audited_at':as_of,'source_dataset_sha256':hashlib.sha256(raw).hexdigest(),
        'method':'offline-mirror-literal-audit; not semantic or freshness certification',
        'summary':{'products':len(products),'categories':len(categories),'pdfs':len(documents),
        'coverage_rows':sum(len(p.get('coverage',[])) for p in data['products']),
        'entry_statuses':dict(counts),'reused_quote_claims':sum(p['reused_quote_claims'] for p in products)},
        'category_counts':dict(categories),'category_metadata_counts':registry,
        'documents':list(documents.values()),'products':products}
    output=root/'public/data/evidence-audit.json';output.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    md=['# 全庫來源與 PDF 審核','',f'審核日期：{as_of}；資料 SHA-256：`{report["source_dataset_sha256"]}`。',
        '',f'{len(products)} 款產品、{len(categories)} 類、{len(documents)} 份 PDF；逐項檢查 {sum(counts.values())} 個保障／citation 引用。',
        '', '**重要：literal-match 只代表摘錄存在於該頁，不代表足以支持保障主張，亦不代表版本最新。**',
        '', '| 檢查狀態 | 引用數 |','|---|---:|',*[f'| {key} | {val} |' for key,val in sorted(counts.items())],
        '',f'同一 quote 被不同保障重用的引用：{report["summary"]["reused_quote_claims"]}。每一項仍需人工核對。',
        '', '## 每款產品覆核清單','', '| ID | 類別 | 摘錄吻合 | 缺來源 | 重用摘錄 | 內容最新性 |','|---|---|---:|---:|---:|---|']
    md += [f'| {p["id"]} | {p["category"]} | {p["counts"].get("literal-match",0)} | {p["counts"].get("missing-source",0)} | {p["reused_quote_claims"]} | 未核實 |' for p in products]
    md += ['', '## 修復順序', '', '先隔離重用／不相干引文，再核對保單版本、PDF 實際頁码與不同計劃限額。HTTP 200、檔名年份、PDF metadata 或下載時間都不能獨自證明仍有效。完整逐項清單與所有 mirror SHA-256 見 `public/data/evidence-audit.json`。',
        '', '## 已確認的外部變動', '', 'AIG 官方 Travel Insurance 頁指出，自 2026-01-01 起停止 Direct／旅行社／航空公司渠道，Travelwise 不再提供續保；其他指定代理／經紀渠道仍有旅保。保留歷史條款供現有保單參考，停用舊直接投保 CTA。',
        '來源：https://www.aig.com.hk/personal/travel-insurance （2026-09-06 檢視）。',
        '', 'VHIS 官方認可計劃及保費表應按認可編號、版本、年齡／性別、病房及自負額核對，不能將通用首頁或計劃數當成全市場已覆蓋。',
        '來源：https://www.vhis.gov.hk/en/consumer_corner/list-plans.html （2026-09-06 檢視；頁面保費摘要標示截至2026-07-17）。',
        '', 'Bowtie 2026-01-23 官方 FAQ 提醒 Pink 全數賠償有美國／內地非指定醫院例外；不能將「全球」關鍵字直接當成各地同等全額賠償。',
        '來源：https://help.bowtie.com.hk/hc/en-gb/articles/37480695035801-Are-there-any-network-doctor-hospital-restrictions-for-VHIS',
        '', 'AXA 現行產品入口列有 SmartTraveller Plus brochure／policy wording，作為更換文件前的官方重新核對入口；本次沒有冒認已逐條驗證最新版本。',
        '來源：https://www.axa.com.hk/en/travel-insurance-protection']
    folder=root/'docs/review';folder.mkdir(parents=True,exist_ok=True);(folder/'05-evidence-audit.md').write_text('\n'.join(md)+'\n')
    print(json.dumps(report['summary'],ensure_ascii=False,indent=2));return report
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--as-of',required=True);args=parser.parse_args()
    from datetime import date
    date.fromisoformat(args.as_of)
    build(Path(__file__).resolve().parents[1],args.as_of)
