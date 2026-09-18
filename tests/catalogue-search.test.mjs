import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterCatalogue } from '../src/lib/catalogue-search.ts';
const product = (id, extra = {}) => ({ id, category: 'travel', insurer: 'AXA', insurer_zh: '安盛', product_name: 'Smart Traveller', product_name_zh: '智遊保', plan_tiers: [], premium_available: false, premium_range: '未提供', premium_notes: '', key_terms: [], exclusions: [], coverage: [], source_urls: [], documents_found: [], ...extra });
const records = [product('current', { trip_type: 'both', destination_scope: ['asia'] }), product('unknown'), product('old', { record_status: 'archived' }), product('other', { insurer: 'MSIG', insurer_zh: '三井住友', product_name: 'iTravel', product_name_zh: '旅遊保', trip_type: 'annual', destination_scope: ['worldwide'] })];
test('search is case/width insensitive and all words must match product identity', () => {
 assert.deepEqual(filterCatalogue(records, { query: 'ＡＸＡ  traveller' }).map(p => p.id), ['current', 'unknown']);
 assert.deepEqual(filterCatalogue(records, { query: '安盛 智遊' }).map(p => p.id), ['current', 'unknown']);
 assert.equal(filterCatalogue(records, { query: 'MSIG 安盛' }).length, 0);
});
test('unknown geography is not silently accepted; company/trip conditions intersect', () => {
 assert.deepEqual(filterCatalogue(records, { region: 'asia', trip: 'single' }).map(p => p.id), ['current']);
 assert.equal(filterCatalogue(records, { region: 'asia', insurers: ['MSIG'] }).length, 0);
 assert.deepEqual(filterCatalogue(records, { insurers: ['MSIG'], trip: 'annual' }).map(p => p.id), ['other']);
});
test('historical records require explicit opt-in and filtering never mutates the catalogue', () => {
 const original = JSON.stringify(records);
 assert.equal(filterCatalogue(records, {}).length, 3);
 assert.equal(filterCatalogue(records, { includeHistorical: true }).length, 4);
 assert.equal(JSON.stringify(records), original);
});
test('undated offers cannot satisfy an active-offer filter', () => {
 assert.equal(filterCatalogue([product('sale', { promo: { tag: 'sale', code: 'OLD' } })], { onlyPromo: true }).length, 0);
});
