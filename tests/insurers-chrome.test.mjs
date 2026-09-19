import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const src = readFileSync('src/pages/Insurers.tsx', 'utf8');
const nav = readFileSync('src/components/Navbar.tsx', 'utf8');

test('insurers sticky filter bar is a compact single-row toolbar', () => {
  assert.ok(src.includes('data-testid="insurers-filter-bar"'));
  assert.ok(src.includes('sticky top-16'));
  assert.ok(!src.includes('sticky top-[72px]'));
  // Category chips are behind an expand toggle, not always-on wrapping chips in sticky area
  assert.ok(src.includes('showCategoryChips'));
  assert.ok(src.includes('aria-label="按類別篩選公司"'));
});

test('page top padding is compact under the shorter navbar', () => {
  assert.ok(nav.includes('h-16'));
  assert.ok(!nav.includes('h-[72px]'));
  assert.ok(src.includes('pt-[68px]'));
  assert.ok(!src.includes('pt-[88px]'));
});
