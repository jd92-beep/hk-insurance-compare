import copy
import hashlib
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('curate_citations', ROOT / 'scripts/curate_citations.py')
curator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(curator)


class CurationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.public = self.root / 'public'
        self.pdf = self.public / 'docs/brochures/policy.pdf'
        self.pdf.parent.mkdir(parents=True)
        self.pdf.write_bytes(b'%PDF-1.7\nfixture, not a real document')
        self.quote = 'Annual medical limit is HK$500,000 per insured person.'
        self.data = {'products': [{'id': 'travel-test', 'insurer': 'TEST', 'coverage': [{'item': 'Medical', 'limit': 'HK$500,000', 'quote': 'old source'}]}]}
        self.raw = json.dumps(self.data).encode()
        self.change = {
            'product_id': 'travel-test', 'coverage_index': 0, 'expected_item': 'Medical', 'expected_limit': 'HK$500,000', 'expected_insurer': 'TEST',
            'source_url': '/docs/brochures/policy.pdf#page=1', 'document_name': 'Test policy', 'page': 1, 'quote': self.quote,
            'pdf_sha256': hashlib.sha256(self.pdf.read_bytes()).hexdigest(),
            'official_url': 'https://insurer.example/policy.pdf', 'reviewer': 'test-operator', 'reviewed_on': '2026-01-01',
            'review_note': 'Fixture only: operator must separately verify the exact product, version and coverage meaning.',
        }
        self.manifest = {'schema_version': 1, 'dataset_sha256': hashlib.sha256(self.raw).hexdigest(), 'changes': [self.change]}

    def validate(self, manifest=None, pages=None, raw=None):
        return curator.curate(raw or self.raw, manifest or self.manifest, self.public, lambda _: pages or [self.quote])

    def test_valid_patch_preserves_amounts_and_does_not_mutate_input(self):
        before = copy.deepcopy(self.data)
        updated, receipt = self.validate()
        self.assertEqual(self.data, before)
        self.assertEqual(updated['products'][0]['coverage'][0]['limit'], 'HK$500,000')
        self.assertEqual(updated['products'][0]['coverage'][0]['quote'], self.quote)
        self.assertEqual(len(receipt['changes']), 1)
        self.assertFalse(receipt['latest_or_semantic_content_verified'])

    def test_stale_data_or_target_binding_is_rejected(self):
        for key, value in [('expected_item', 'Surgery'), ('expected_limit', 'HK$1'), ('expected_insurer', 'OTHER'), ('coverage_index', 9)]:
            manifest = copy.deepcopy(self.manifest); manifest['changes'][0][key] = value
            with self.subTest(key=key), self.assertRaises(ValueError): self.validate(manifest)
        with self.assertRaises(ValueError): self.validate(raw=self.raw + b' ')

    def test_pdf_fingerprint_pages_and_exact_excerpt_are_required(self):
        for key, value in [('pdf_sha256', '0' * 64), ('page', 0), ('page', True), ('page', 2), ('quote', 'Invented statement copied from our own summary'), ('quote', 'HK$1')]:
            manifest = copy.deepcopy(self.manifest); manifest['changes'][0][key] = value
            with self.subTest(key=key, value=value), self.assertRaises(ValueError): self.validate(manifest)
        with self.assertRaises(ValueError): self.validate(pages=[self.quote + ' ' + self.quote])

    def test_paths_and_remote_sources_cannot_be_silently_substituted(self):
        for value in ['/docs/brochures/../../secret.pdf', '/docs/brochures/%2e%2e/secret.pdf', '//evil.test/policy.pdf', 'https://evil.test/policy.pdf', '/docs/brochures/policy.pdf#page=9']:
            manifest = copy.deepcopy(self.manifest); manifest['changes'][0]['source_url'] = value
            with self.subTest(value=value), self.assertRaises(ValueError): self.validate(manifest)

    def test_operator_review_is_required_but_not_treated_as_authentication(self):
        for key, value in [('reviewer', ''), ('review_note', ''), ('reviewed_on', '2100-01-01'), ('official_url', 'http://insurer.example/policy.pdf'), ('official_url', 'https://name:secret@insurer.example/policy.pdf')]:
            manifest = copy.deepcopy(self.manifest); manifest['changes'][0][key] = value
            with self.subTest(key=key), self.assertRaises(ValueError): self.validate(manifest)

    def test_shared_excerpt_for_distinct_benefits_requires_explicit_reason(self):
        data = copy.deepcopy(self.data)
        data['products'][0]['coverage'].append({'item': 'Cancellation', 'limit': 'HK$100', 'quote': self.quote, 'page': 1, 'source_url': self.change['source_url']})
        raw = json.dumps(data).encode(); manifest = copy.deepcopy(self.manifest)
        manifest['dataset_sha256'] = hashlib.sha256(raw).hexdigest()
        with self.assertRaises(ValueError): self.validate(manifest, raw=raw)
        manifest['changes'][0]['shared_quote_reason'] = 'Operator confirms the same table contains both benefit rows; example fixture only.'
        _, receipt = self.validate(manifest, raw=raw)
        self.assertFalse(receipt['latest_or_semantic_content_verified'])

    def test_shared_reason_must_be_real_text_and_hash_mismatch_does_not_parse_pdf(self):
        data = copy.deepcopy(self.data)
        data['products'][0]['coverage'].append({'item': 'Other', 'quote': self.quote, 'page': 1, 'source_url': self.change['source_url']})
        raw = json.dumps(data).encode(); manifest = copy.deepcopy(self.manifest)
        manifest['dataset_sha256'] = hashlib.sha256(raw).hexdigest()
        manifest['changes'][0]['shared_quote_reason'] = None
        with self.assertRaises(ValueError): self.validate(manifest, raw=raw)
        called = []
        manifest = copy.deepcopy(self.manifest); manifest['changes'][0]['pdf_sha256'] = '0' * 64
        with self.assertRaises(ValueError): curator.curate(self.raw, manifest, self.public, lambda path: called.append(path) or [self.quote])
        self.assertEqual(called, [])

    def test_pdf_parser_receives_the_exact_bytes_bound_to_the_reviewed_hash(self):
        observed = []
        curator.curate(self.raw, self.manifest, self.public, lambda payload: observed.append(payload) or [self.quote])
        self.assertEqual(observed, [self.pdf.read_bytes()])

    def test_real_pdf_cli_is_dry_by_default_and_writes_only_a_new_proposal(self):
        import pymupdf
        document = pymupdf.open(); page = document.new_page(); page.insert_text((72, 72), self.quote)
        document.save(self.pdf); document.close()
        self.change['pdf_sha256'] = hashlib.sha256(self.pdf.read_bytes()).hexdigest()
        dataset = self.root / 'insurance.json'; dataset.write_bytes(self.raw)
        manifest = self.root / 'manifest.json'; manifest.write_text(json.dumps(self.manifest))
        command = [sys.executable, str(ROOT / 'scripts/curate_citations.py'), '--manifest', str(manifest), '--data', str(dataset), '--public-dir', str(self.public)]
        run = subprocess.run(command, capture_output=True, timeout=15)
        self.assertEqual(run.returncode, 0, run.stderr.decode())
        self.assertEqual(json.loads(run.stdout)['mode'], 'dry-run')
        self.assertEqual(dataset.read_bytes(), self.raw)
        output = self.root / 'proposed.json'
        run = subprocess.run(command + ['--output', str(output)], capture_output=True, timeout=15)
        self.assertEqual(run.returncode, 0, run.stderr.decode())
        self.assertEqual(json.loads(output.read_text())['products'][0]['coverage'][0]['quote'], self.quote)
        for forbidden in [output, dataset, manifest]:
            before = forbidden.read_bytes()
            run = subprocess.run(command + ['--output', str(forbidden)], capture_output=True, timeout=15)
            self.assertEqual(run.returncode, 2)
            self.assertEqual(forbidden.read_bytes(), before)
        self.assertEqual(dataset.read_bytes(), self.raw)

    def test_duplicate_target_is_rejected_before_output(self):
        manifest = copy.deepcopy(self.manifest); manifest['changes'].append(copy.deepcopy(self.change))
        with self.assertRaises(ValueError): self.validate(manifest)

    def test_retired_commands_cannot_rewrite_even_a_fixture_dataset(self):
        for name in ['enrich_coverage_links.py', 'audit_and_mirror_pdfs.py', 'build_medical_expansion.py']:
            scripts = self.root / 'scripts'; scripts.mkdir(exist_ok=True)
            shutil.copy2(ROOT / 'scripts' / name, scripts / name)
            data_path = self.public / 'data/insurance-data.json'; data_path.parent.mkdir(exist_ok=True)
            data_path.write_bytes(self.raw)
            (data_path.parent / 'vhis-plans.json').write_text('{}')
            run = subprocess.run([sys.executable, str(scripts / name)], capture_output=True, timeout=10)
            self.assertEqual(run.returncode, 2, run.stdout.decode() + run.stderr.decode())
            self.assertEqual(data_path.read_bytes(), self.raw)
            self.assertIn('curate_citations.py', run.stderr.decode())


if __name__ == '__main__':
    unittest.main()
