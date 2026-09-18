import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isReferenceOnlyProduct } from '../src/lib/product-availability.ts';
import { productEvidenceSummary } from '../src/lib/evidence-status.ts';
import { readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync('public/data/insurance-data.json', 'utf8'));

test('reference-only products are identifiable for search/picker sorting', () => {
  const aig = data.products.find((p) => p.id === 'travel-aig');
  assert.ok(aig);
  assert.equal(isReferenceOnlyProduct(aig), true);
  const active = data.products.find((p) => p.id === 'travel-blue-cross');
  assert.ok(active);
  assert.equal(isReferenceOnlyProduct(active), false);
});

test('evidence summary never claims verified policy content', () => {
  const product = {
    id: 'x', coverage: [
      { item: 'a', limit: 'b', source_url: '/docs/x.pdf', quote: 'qqqqqqqq', page: 2 },
      { item: 'c', limit: 'd' },
    ],
  };
  const summary = productEvidenceSummary(product);
  assert.equal(summary.total, 2);
  assert.equal(summary.complete, 1);
  assert.ok(summary.freshnessLabel.includes('未核實'));
});

test('category counts in data snapshot are 11 not hardcoded 9', () => {
  assert.equal(data.categories.length, 11);
  assert.equal(data.products.length, 158);
});
