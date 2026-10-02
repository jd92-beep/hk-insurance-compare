import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { POPULAR_COMBOS, presetsFor } from '../src/lib/compare-presets.ts';
import { isReferenceOnlyProduct } from '../src/lib/product-availability.ts';

const { products, categories } = JSON.parse(readFileSync('public/data/insurance-data.json', 'utf8'));
const byId = new Map(products.map((p) => [p.id, p]));

test('every editorial combo points at real, comparable products of its category', () => {
  for (const c of POPULAR_COMBOS) {
    for (const id of c.ids) {
      const p = byId.get(id);
      assert.equal(p?.category, c.categoryId, id);
      assert.ok(!isReferenceOnlyProduct(p) && p.record_status !== 'archived', `${id} is not comparable`);
    }
  }
});

test('each category gets at least one starter set; sets use distinct insurers and never repeat products', () => {
  for (const cat of categories) {
    const sets = presetsFor(cat.id, products);
    assert.ok(sets.length >= 1, cat.id);
    const seen = new Set();
    for (const s of sets) {
      assert.ok(s.ids.length >= 2 && s.ids.length <= 3, cat.id);
      const insurers = s.ids.map((id) => byId.get(id).insurer);
      assert.equal(new Set(insurers).size, insurers.length, `${cat.id} duplicate insurer`);
      for (const id of s.ids) {
        assert.ok(!seen.has(id), `${id} repeated`);
        seen.add(id);
        const p = byId.get(id);
        assert.equal(p.category, cat.id);
        assert.ok(!isReferenceOnlyProduct(p) && p.record_status !== 'archived', `${id} not comparable`);
      }
    }
  }
});

test('categories with an editorial combo lead with it', () => {
  const sets = presetsFor('travel', products);
  assert.equal(sets[0].basis, 'editorial');
  assert.deepEqual(sets[0].ids, ['travel-blue-cross', 'travel-axa', 'travel-msig']);
  assert.ok(sets.slice(1).every((s) => s.basis === 'evidence'));
});
