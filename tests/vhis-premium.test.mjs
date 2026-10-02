import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { cellText, clampAge, flexiAt, flexiProductAt, scheduleAge, standardAt } from '../src/lib/vhis-premium.ts';

const data = JSON.parse(readFileSync('public/data/vhis-premiums.json', 'utf8'));
const insurance = JSON.parse(readFileSync('public/data/insurance-data.json', 'utf8'));

test('standard plan premiums agree with the 30-year-old figure already in the product snapshot', () => {
  // build_vhis.py wrote "標準計劃年繳保費（30歲）：男性約 HK$1,993／女性約 HK$2,576" for S00012 from the same summary
  const s = standardAt(data, 'S00012', 30);
  assert.equal(s.male, 1993);
  assert.equal(s.female, 2576);
  const bolttech = insurance.products.find((p) => p.id === 'medical-bolttech');
  assert.match(bolttech.premium_range, /男性約 HK\$1,993／女性約 HK\$2,576/);
});

test('every active standard plan has a premium for a 30-year-old', () => {
  for (const [cert, p] of Object.entries(data.standard)) {
    assert.ok(p.male[30] != null || p.female[30] != null, cert);
  }
});

test('ages beyond the new-application range are flagged renewal-only and may be a range', () => {
  const ctf = standardAt(data, 'S00028', 99);
  assert.ok(ctf);
  const aia = standardAt(data, 'S00013', 90);
  assert.equal(aia.renewalOnly, true);
  assert.equal(standardAt(data, 'S00013', 40).renewalOnly, false);
  assert.equal(cellText([1000, 1500]), 'HK$1,000–1,500');
  assert.equal(cellText(2324.8), 'HK$2,324.80');
});

test('flexi schedules map attained age to the schedule row (next-birthday schedules shift by one)', () => {
  assert.equal(scheduleAge('next_birthday', 30), 31);
  assert.equal(scheduleAge('attained', 30), 30);
  // Cigna F00012 annual non-smoker / smoker at 30 = 6,126 / 7,134 (official schedule)
  assert.deepEqual(flexiAt(data, 'F00012-01-000-03', 30), { min: 6126, max: 7134, currency: 'HKD' });
  // Bowtie F00023: annual 6,966 at 30 — the monthly 645 column must not leak in
  assert.deepEqual(flexiAt(data, 'F00023-01-000-02', 30), { min: 6966, max: 6966, currency: 'HKD' });
  // AIA USD schedule with annual + half-yearly columns: annual only
  assert.deepEqual(flexiAt(data, 'F00025-04-000-03', 30), { min: 2198, max: 2198, currency: 'USD' });
});

test('product range groups levels by currency and ignores unknown levels', () => {
  const r = flexiProductAt(data, ['F00012-01-000-03', 'F00023-01-000-02', 'NOPE'], 30);
  assert.deepEqual(r, [{ min: 6126, max: 7134, currency: 'HKD' }]);
  assert.equal(clampAge(150), 99);
  assert.equal(clampAge(-3), 0);
  assert.equal(clampAge(Number.NaN), 30);
});
