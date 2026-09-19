import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupInsurerProductsByCategory } from '../src/lib/insurer-catalogue.ts';
import { readFileSync } from 'node:fs';
import { parseInsuranceData } from '../src/lib/data-integrity.ts';

const data = parseInsuranceData(JSON.parse(readFileSync('public/data/insurance-data.json', 'utf8')));

/** Must match InsurerDetail.productGridClass — single product fills the row. */
function productGridClass(count) {
  if (count <= 1) return 'grid grid-cols-1 items-start gap-6';
  if (count === 2) return 'grid grid-cols-1 items-start gap-6 fold:grid-cols-2';
  return 'grid grid-cols-1 items-start gap-6 fold:grid-cols-2 lg:grid-cols-3';
}

test('Bowtie-style insurers group one product per category without multi-col dead space', () => {
  const sections = groupInsurerProductsByCategory(data.products, 'Bowtie');
  assert.ok(sections.length >= 5);
  for (const s of sections) {
    assert.equal(s.products.length, 1);
    assert.equal(productGridClass(s.products.length).includes('grid-cols-2'), false);
    assert.equal(productGridClass(s.products.length).includes('grid-cols-3'), false);
  }
  const all = sections.flatMap((s) => s.products);
  assert.equal(all.length, 8);
  assert.ok(productGridClass(all.length).includes('fold:grid-cols-2'));
});

test('multi-product sections still use multi-column grids', () => {
  assert.ok(productGridClass(2).includes('fold:grid-cols-2'));
  assert.ok(productGridClass(5).includes('lg:grid-cols-3'));
});
