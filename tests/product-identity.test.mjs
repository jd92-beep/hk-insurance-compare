import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyProductIdentity, CANONICAL_INSURER_KEYS, CANONICAL_INSURERS, isCanonicalInsurer } from '../scripts/product_identity.mjs';
const single = { id: 'travel-test', insurer: 'TEST', insurer_zh: '測試公司', category: 'travel', product_name_zh: '旅遊保障計劃', product_name: 'Travel Plan' };
const observed = { url: 'http://127.0.0.1:4173/product/travel-test', heading: '旅遊保障計劃', text: 'TEST 測試公司 旅遊保障計劃' };
const series = { ...single, id: 'medical-test', category: 'medical', product_name_zh: '測試公司自願醫保標準計劃（S00013）／測試公司自願醫保靈活升級計劃（F00022）' };
const seriesView = { url: 'http://127.0.0.1:4173/product/medical-test', heading: '測試公司 TEST 自願醫保系列', text: '測試公司 TEST\n01 測試公司自願醫保標準計劃（S00013）\n02 測試公司自願醫保靈活升級計劃（F00022）' };
test('single product requires the exact route, title and insurer', () => {
  assert.deepEqual(verifyProductIdentity(single, '旅遊保險', observed), []);
  for (const change of [{ url: 'http://127.0.0.1:4173/product/other' }, { heading: '另一個產品' }, { text: 'OTHER 旅遊保障計劃' }]) {
    assert.ok(verifyProductIdentity(single, '旅遊保險', { ...observed, ...change }).length);
  }
});
test('series plans are matched as separate rows, not one impossible continuous sentence', () => {
  assert.ok(series.product_name_zh.length > 40);
  assert.equal(seriesView.text.includes(series.product_name_zh), false);
  assert.deepEqual(verifyProductIdentity(series, '自願醫保', seriesView), []);
});
test('a series still fails when a plan, insurer or title belongs to another product', () => {
  for (const change of [
    { text: '測試公司 TEST\n測試公司自願醫保標準計劃（S00013）' },
    { heading: '其他公司 TEST 自願醫保系列' },
    { url: 'http://127.0.0.1:4173/product/medical-other' },
  ]) assert.ok(verifyProductIdentity(series, '自願醫保', { ...seriesView, ...change }).length);
});
test('layout whitespace and compatibility forms do not create false failures', () => {
  assert.deepEqual(verifyProductIdentity(single, '旅遊保險', { ...observed, heading: '旅遊\u00a0保障\n計劃', text: 'ＴＥＳＴ 測試公司 旅遊保障計劃' }), []);
  assert.ok(verifyProductIdentity(single, '旅遊保險', { ...observed, url: 'bad URL' }).length);
});
test('canonical insurers list is frozen, non-empty, and guards canonical keys', () => {
  assert.equal(CANONICAL_INSURER_KEYS.length, 40);
  assert.ok(Object.isFrozen(CANONICAL_INSURER_KEYS));
  assert.equal(CANONICAL_INSURERS.size, 40);
  assert.ok(isCanonicalInsurer('Prudential'));
  assert.ok(isCanonicalInsurer('AXA'));
  assert.ok(isCanonicalInsurer('AIA'));
  assert.ok(isCanonicalInsurer('Bowtie'));
  assert.equal(isCanonicalInsurer('INVENTED_COMPANY'), false);
  assert.equal(isCanonicalInsurer(null), false);
  assert.equal(isCanonicalInsurer(undefined), false);
});

