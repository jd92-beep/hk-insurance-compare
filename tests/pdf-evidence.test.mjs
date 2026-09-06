import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sourceTarget, findQuote, evidenceEntries, evidenceHref, resolveEvidence } from '../src/lib/pdf-evidence.ts';

test('document addresses reject script URLs, protocol-relative paths and traversal', () => {
  for (const value of ['javascript:alert(1)', '//evil.test/a.pdf', '/docs/brochures/../secret.pdf', '/docs/brochures/%2e%2e/secret.pdf', '/docs/brochures/a%2fb.pdf', '/docs/brochures/a\\b.pdf']) assert.equal(sourceTarget(value), null);
  assert.deepEqual(sourceTarget('/docs/brochures/a.pdf#page=4', 7), { url: '/docs/brochures/a.pdf', page: 7, local: true });
  assert.equal(sourceTarget('/docs/brochures/a.pdf#page=0').page, 1);
  assert.equal(sourceTarget('https://example.com/policy').local, false);
});
test('only a unique normalized literal quotation is highlighted across text runs', () => {
  assert.equal(findQuote(['海外醫療', '費用最高', ' HK$1,000,000'], '海外醫療費用最高 HK$1,000,000').status, 'matched');
  assert.equal(findQuote(['Total indemnity HK$5,000'], 'Maximum HK$5,000').status, 'not-found');
  assert.equal(findQuote(['long quotationlong quotation'], 'long quotation').status, 'ambiguous');
  assert.equal(findQuote([''], 'long quotation').status, 'no-text');
  assert.equal(findQuote(['some words'], '').status, 'no-quote');
});
test('evidence deep links are bound to record content, not arbitrary query text', () => {
  const product = { id: 'test', coverage: [{ item: '醫療', limit: 'HK$1,000', source_url: '/docs/brochures/a.pdf', page: 2, quote: 'Medical expenses HK$1,000' }], citations: [] };
  const entry = evidenceEntries(product)[0];
  const query = new URL(evidenceHref(product.id, entry), 'https://example.test').searchParams;
  assert.equal(resolveEvidence(product, query).entry?.quote, entry.quote);
  product.coverage[0].limit = 'HK$2,000';
  assert.equal(resolveEvidence(product, query).status, 'changed');
  query.set('entry', '-1'); assert.equal(resolveEvidence(product, query).status, 'missing');
});
