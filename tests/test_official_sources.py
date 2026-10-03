"""Offline checks for the read-only source audit; no network or policy edits."""
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch
spec=importlib.util.spec_from_file_location('sources',Path(__file__).resolve().parents[1]/'scripts/check_official_sources.py')
sources=importlib.util.module_from_spec(spec);spec.loader.exec_module(sources)
class SourceAuditTest(unittest.TestCase):
 def test_soft_errors_are_not_readable_product_pages(self):
  for url,text in [('https://example.com/404/','OK'),('https://example.com/product','找不到頁面'),('https://example.com/product','Page not found')]:
   self.assertTrue(sources.is_soft_404(url,text))
  self.assertFalse(sources.is_soft_404('https://example.com/product-404-cover','Product coverage'))
 def test_public_https_boundary(self):
  for url in ['http://example.com','https://user:pass@example.com','https://example.com:9443']:
   with self.assertRaises(ValueError):sources.public_url(url)
  with patch.object(sources.socket,'getaddrinfo',return_value=[(2,1,6,'',('127.0.0.1',443))]):
   with self.assertRaises(ValueError):sources.public_url('https://example.com')
 def test_visible_text_omits_scripts_and_styles(self):
  p=sources.Text();p.feed('<h1>Plan</h1><script>not policy</script><style>hidden</style><p>Coverage</p>')
  self.assertEqual(p.parts,['Plan','Coverage'])
if __name__=='__main__':unittest.main()
