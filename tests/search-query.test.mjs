import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchesSearchQuery } from '../src/lib/search-query.ts';
test('search normalizes case, fullwidth characters and word separators', () => {
  assert.ok(matchesSearchQuery('Blue Cross 藍十字', 'bluecross'));
  assert.ok(matchesSearchQuery('AXA 安盛保險', 'ＡＸＡ'));
  assert.ok(matchesSearchQuery('自願醫保 — Bowtie', 'bowtie 自願'));
});
test('query letters cannot jump over arbitrary unrelated letters', () => {
  assert.equal(matchesSearchQuery('BxOxWxTxIxE', 'bowtie'), false);
  assert.equal(matchesSearchQuery('Blue WeCare 定期壽險', 'bowtie'), false);
});
test('empty query shows available results and multiword query requires every term', () => {
  assert.ok(matchesSearchQuery('AXA 旅遊保險', '  '));
  assert.equal(matchesSearchQuery('AXA 家居保險', 'axa 旅遊'), false);
  assert.ok(matchesSearchQuery('香港保險', '香港 保險'));
});
