import unittest
from pathlib import Path
from scripts.audit_evidence import local_path, literal_status, audit_product
class EvidenceTests(unittest.TestCase):
    def test_no_traversal(self):
        root=Path('/tmp/site')
        self.assertIsNone(local_path('//evil.test/a.pdf',root))
        self.assertIsNone(local_path('/docs/brochures/%2e%2e/a.pdf',root))
        self.assertEqual(local_path('/docs/brochures/a.pdf#page=2',root),root/'docs/brochures/a.pdf')
    def test_literal_is_not_semantic_verification(self):
        self.assertEqual(literal_status('medical benefits available','medical benefits available'),'literal-match')
        self.assertEqual(literal_status('xmedical benefits available medical benefits available','medical benefits available'),'ambiguous')
        self.assertEqual(literal_status('medical benefits available','other claim wording'),'not-found')
    def test_every_product_gets_unknown_freshness(self):
        row=audit_product({'id':'a','category':'travel','coverage':[]}, {}, {})
        self.assertEqual(row['latest_content_status'],'unverified')
        self.assertEqual(row['id'],'a')
if __name__=='__main__': unittest.main()
