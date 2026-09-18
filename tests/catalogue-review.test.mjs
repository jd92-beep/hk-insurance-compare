import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { promoDisplay } from '../src/lib/premium-display.ts';
import { purchaseUrl } from '../src/lib/product-availability.ts';
const data = JSON.parse(readFileSync(new URL('../public/data/insurance-data.json', import.meta.url)));
const get = id => data.products.find(p => p.id === id);
test('selected corrections do not refresh the full catalogue verification date', () => {
  assert.equal(data.generated_at, '2026-09-02');
  assert.equal(data.products.filter(p => p.last_verified_at === '2026-09-18').length, 0);
});
test('Supreme limit rows are linked to the reviewed Supreme leaflet, not ManuMaster', () => {
  const p = get('medical-manulife');
  assert.match(p.coverage[0].limit, /5,000,000.*12,000,000.*30,000,000/);
  assert.match(p.coverage[1].limit, /20,000,000.*60,000,000.*120,000,000/);
  for (const row of p.coverage.slice(0, 2)) { assert.match(row.source_url, /vhis-supreme-leaflet.pdf#page=10$/); assert.equal(row.page, 10); }
  assert.equal(p.coverage.some(row => row.source_url?.includes('manumaster')), false);
  assert.ok(p.review_notes.some(note => note.includes('僅核對')));
});
test('malformed travel record is preserved for investigation but cannot be purchased', () => {
  const p = get('travel-manulife');
  assert.equal(p.record_status, 'archived'); assert.equal(p.premium_available, false);
  assert.equal(purchaseUrl(p), undefined); assert.equal(p.promo, undefined);
});
test('catalogue MSIG campaign has a verified window and stops at HK midnight', () => {
  const p = get('travel-msig');
  assert.equal(promoDisplay(p, new Date('2026-09-18T04:00:00Z')).present, true);
  assert.equal(promoDisplay(p, new Date('2026-09-30T16:00:00Z')).present, false);
  assert.equal(p.original_price, undefined);
});
