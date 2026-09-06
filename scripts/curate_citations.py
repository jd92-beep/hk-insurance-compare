"""Validate operator-curated PDF citations; default dry-run, never overwrite source data.

This checks identity, bytes, page and literal text, NOT insurance meaning or currentness.
No network requests, inferred quotes, default pages, or inferred product/PDF mappings.
"""
from __future__ import annotations

import argparse
import copy
from datetime import date
import hashlib
import json
from pathlib import Path
import sys
import unicodedata
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


def normalized(text: str) -> str:
    return ''.join(unicodedata.normalize('NFKC', text).split())


def required_text(record: dict, key: str) -> str:
    value = record.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValueError(f'{key}: an explicit non-empty value is required')
    return value


def pdf_path(source: str, public: Path) -> Path:
    parts = urlsplit(source)
    decoded = unquote(parts.path)
    if parts.scheme or parts.netloc or parts.query or '%' in decoded or '\\' in decoded:
        raise ValueError('source_url must identify an existing local mirrored PDF, not an inferred external URL')
    if not decoded.startswith('/docs/brochures/') or not decoded.lower().endswith('.pdf') or '..' in Path(decoded).parts:
        raise ValueError('source_url is outside /docs/brochures/*.pdf')
    root = (public / 'docs/brochures').resolve()
    path = (public / decoded.lstrip('/')).resolve()
    if not path.is_relative_to(root) or not path.is_file():
        raise ValueError('PDF missing or path escapes the mirror directory')
    return path


def read_pdf(payload: bytes) -> list[str]:
    try:
        import pymupdf
    except ImportError as exc:
        raise ValueError('PDF verification requires PyMuPDF; use the project audit environment. Nothing was written.') from exc
    with pymupdf.open(stream=payload, filetype="pdf") as document:
        if document.needs_pass:
            raise ValueError('Encrypted PDF cannot be validated without an explicit accessible original')
        return [page.get_text('text') for page in document]


def curate(raw: bytes, manifest: dict, public: Path, reader=read_pdf) -> tuple[dict, dict]:
    if not isinstance(manifest, dict) or type(manifest.get('schema_version')) is not int or manifest['schema_version'] != 1:
        raise ValueError('Unsupported curation manifest schema')
    digest = hashlib.sha256(raw).hexdigest()
    if manifest.get('dataset_sha256') != digest:
        raise ValueError('Dataset fingerprint changed; rebuild and review the manifest before retrying')
    changes = manifest.get('changes')
    if not isinstance(changes, list) or not 1 <= len(changes) <= 500:
        raise ValueError('Provide 1–500 individually reviewed changes per batch')
    data = json.loads(raw)
    proposal = copy.deepcopy(data)
    products = {product['id']: product for product in proposal['products']}
    if len(products) != len(proposal['products']):
        raise ValueError('Duplicate product IDs in dataset')
    seen = set()
    documents = {}
    receipt = {'dataset_sha256': digest, 'latest_or_semantic_content_verified': False, 'reviewer_identity_authenticated': False, 'changes': []}
    edited_rows = []
    for index, change in enumerate(changes):
        if not isinstance(change, dict):
            raise ValueError(f'Change {index}: expected an object')
        product_id = required_text(change, 'product_id')
        product = products.get(product_id)
        position = change.get('coverage_index')
        if product is None or type(position) is not int or not 0 <= position < len(product.get('coverage', [])):
            raise ValueError(f'Change {index}: product or coverage index does not exist')
        target = (product_id, position)
        if target in seen:
            raise ValueError(f'Change {index}: duplicate target')
        seen.add(target)
        row = product['coverage'][position]
        for key, value in [('expected_item', row.get('item')), ('expected_limit', row.get('limit')), ('expected_insurer', product.get('insurer'))]:
            if required_text(change, key) != value:
                raise ValueError(f'Change {index}: {key} does not match the exact current target')
        reviewer = required_text(change, 'reviewer')
        review_note = required_text(change, 'review_note')
        reviewed_on = required_text(change, 'reviewed_on')
        if date.fromisoformat(reviewed_on) > date.today():
            raise ValueError(f'Change {index}: review date is in the future')
        official = urlsplit(required_text(change, 'official_url'))
        if official.scheme != 'https' or not official.hostname or official.username or official.password:
            raise ValueError(f'Change {index}: official_url must be credential-free HTTPS; authority still needs operator review')
        source = required_text(change, 'source_url')
        path = pdf_path(source, public)
        if path not in documents:
            if path.stat().st_size > 64 * 1024 * 1024:
                raise ValueError(f'Change {index}: PDF exceeds the 64 MiB curation limit')
            payload = path.read_bytes()
            if not payload.startswith(b'%PDF-'):
                raise ValueError(f'Change {index}: file is not a PDF')
            observed_digest = hashlib.sha256(payload).hexdigest()
            if required_text(change, 'pdf_sha256') != observed_digest:
                raise ValueError(f'Change {index}: PDF bytes changed; page/quote review must be repeated')
            documents[path] = (observed_digest, reader(payload))
        pdf_digest, pages = documents[path]
        if required_text(change, 'pdf_sha256') != pdf_digest:
            raise ValueError(f'Change {index}: PDF bytes changed; page/quote review must be repeated')
        page = change.get('page')
        if type(page) is not int or not 1 <= page <= len(pages):
            raise ValueError(f'Change {index}: page must be the physical 1-based PDF page number')
        fragment = urlsplit(source).fragment
        if fragment and fragment != f'page={page}':
            raise ValueError(f'Change {index}: URL page fragment conflicts with the reviewed page')
        quote = required_text(change, 'quote')
        text = normalized(quote)
        if not 12 <= len(text) <= 4000 or normalized(pages[page - 1]).count(text) != 1:
            raise ValueError(f'Change {index}: require one unique literal excerpt on the specified page; no fuzzy/generated fallback')
        document_name = required_text(change, 'document_name')
        local_url = '/' + path.relative_to(public.resolve()).as_posix() + f'#page={page}'
        old = {key: row.get(key) for key in ['source_url', 'document_name', 'page', 'quote']}
        row.update(source_url=local_url, document_name=document_name, page=page, quote=quote)
        edited_rows.append((row, change))
        receipt['changes'].append({
            'product_id': product_id, 'coverage_index': position, 'expected_item': row['item'],
            'old_source': old, 'new_source_url': local_url, 'pdf_sha256': pdf_digest,
            'reviewer': reviewer, 'reviewed_on': reviewed_on, 'review_note': review_note,
            'official_url': official.geturl(), 'validation': 'literal-page-match-only',
            'shared_quote_reason': change.get('shared_quote_reason'),
        })
    # A table can legitimately cover several benefits, but bulk reuse must be explicit.
    usages = {}
    for product in proposal['products']:
        for row in product.get('coverage', []):
            if isinstance(row.get('quote'), str) and isinstance(row.get('source_url'), str):
                key = (row['source_url'].split('#')[0], row.get('page'), normalized(row['quote']))
                usages.setdefault(key, set()).add(row.get('item'))
    for row, change in edited_rows:
        key = (row['source_url'].split('#')[0], row['page'], normalized(row['quote']))
        reason = change.get('shared_quote_reason')
        if len(usages[key]) > 1 and (not isinstance(reason, str) or not reason.strip()):
            raise ValueError('Same excerpt is used for different benefits; provide an explicit operator-reviewed shared_quote_reason')
    return proposal, receipt


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--manifest', type=Path, required=True)
    parser.add_argument('--data', type=Path, default=ROOT / 'public/data/insurance-data.json')
    parser.add_argument('--public-dir', type=Path, default=ROOT / 'public')
    parser.add_argument('--output', type=Path, help='Optional NEW proposal file. Existing files and the source dataset cannot be overwritten.')
    args = parser.parse_args(argv)
    try:
        if args.manifest.stat().st_size > 2 * 1024 * 1024:
            raise ValueError('Manifest exceeds 2 MiB')
        raw = args.data.read_bytes()
        proposal, receipt = curate(raw, json.loads(args.manifest.read_text('utf-8')), args.public_dir.resolve())
        encoded = (json.dumps(proposal, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
        receipt['proposal_sha256'] = hashlib.sha256(encoded).hexdigest()
        receipt['mode'] = 'dry-run' if args.output is None else 'new-proposal-file'
        if args.output:
            if args.output.resolve() in {args.data.resolve(), args.manifest.resolve()}:
                raise ValueError('Output cannot overwrite an input; review a separate proposal diff')
            with args.output.open('xb') as output:
                output.write(encoded)
            receipt['output'] = str(args.output)
        print(json.dumps(receipt, ensure_ascii=False, indent=2))
        return 0
    except (ValueError, KeyError, TypeError, OSError, RuntimeError) as exc:
        print(f'Curation rejected: {exc}', file=sys.stderr)
        return 2


if __name__ == '__main__':
    raise SystemExit(main())
