import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseInsuranceData } from '../src/lib/data-integrity.ts';
import { evidenceEntries, sourceTarget } from '../src/lib/pdf-evidence.ts';
const snapshot = () => JSON.parse(readFileSync('public/data/insurance-data.json', 'utf8'));

test('numeric coverage source is rejected at the snapshot boundary, not in the PDF UI', () => {
  const raw = snapshot(); raw.products[0].coverage[0].source_url = 42;
  assert.throws(() => parseInsuranceData(raw), /coverage\[0\]\.source_url/);
});
test('present evidence text must be text; objects, arrays and booleans cannot leak through', () => {
  for (const field of ['source_url', 'document_name', 'quote']) {
    for (const value of [42, false, [], { text: 'not a string' }]) {
      const raw = snapshot(); raw.products[0].coverage[0][field] = value;
      assert.throws(() => parseInsuranceData(raw), new RegExp(`coverage\\[0\\]\\.${field}`));
    }
  }
});
test('citation fields reject wrong types rather than silently blanking supplied evidence', () => {
  for (const field of ['claim_field', 'claim_summary', 'document', 'quote', 'url']) {
    const raw = snapshot(); raw.products[0].citations[0][field] = { incorrect: true };
    assert.throws(() => parseInsuranceData(raw), new RegExp(`citations\\[0\\]\\.${field}`));
  }
});
test('page numbers reject zero, fractional, unsafe, boolean and nonnumeric inputs', () => {
  for (const collection of ['coverage', 'citations']) for (const page of [0, -1, 1.5, true, '', 'one', '1.5', '9007199254740993', 100001]) {
    const raw = snapshot(); raw.products[0][collection][0].page = page;
    assert.throws(() => parseInsuranceData(raw), /page/);
  }
});
test('legacy digit pages normalize without inventing missing evidence or mutating the source', () => {
  const raw = snapshot(); const p = raw.products[0];
  p.coverage[0].page = '12'; p.coverage[0].quote = null; p.coverage[0].source_url = null;
  delete p.citations[0].claim_summary; p.citations[0].page = null;
  const before = structuredClone(raw); const parsed = parseInsuranceData(raw);
  assert.equal(parsed.products[0].coverage[0].page, 12);
  assert.equal(parsed.products[0].coverage[0].quote, undefined);
  assert.equal(parsed.products[0].coverage[0].source_url, undefined);
  assert.equal(parsed.products[0].citations[0].claim_summary, '');
  assert.equal(parsed.products[0].citations[0].page, null);
  assert.deepEqual(raw, before);
});
test('all checked-in products survive validation and every evidence index is still stable', () => {
  const raw = snapshot(); const parsed = parseInsuranceData(raw);
  assert.equal(parsed.products.length, raw.products.length);
  for (const [i, product] of parsed.products.entries()) {
    assert.equal(product.id, raw.products[i].id);
    assert.deepEqual(product.coverage.map(row => [row.item, row.limit]), raw.products[i].coverage.map(row => [row.item, row.limit]));
    assert.doesNotThrow(() => evidenceEntries(product));
  }
});
test('public URL boundary fails closed for non-string callers without a TypeError', () => {
  for (const value of [42, true, [], {}, null, undefined]) assert.equal(sourceTarget(value), null);
  assert.ok(sourceTarget('/docs/brochures/policy.pdf#page=2'));
});
