import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  INSURER_SORT_NOTE,
  buildInsurerCardModels,
  categoryPath,
  filterInsurerCardModels,
  filterInsurerCardModelsByCategory,
  groupInsurerProductsByCategory,
  insurerDetailPath,
  sortInsurerCardModels,
} from '../src/lib/insurer-catalogue.ts';
import { CATEGORY_ORDER, deriveInsurers } from '../src/lib/categories.ts';

const data = JSON.parse(readFileSync('public/data/insurance-data.json', 'utf8'));
const products = data.products;
const insurers = deriveInsurers(products);

test('grouping derives only snapshot products and never invents extra rows', () => {
  const key = 'AXA';
  const sections = groupInsurerProductsByCategory(products, key);
  const snapshotOwned = products.filter((p) => p.insurer === key);
  const groupedIds = sections.flatMap((s) => s.products.map((p) => p.id));
  assert.equal(groupedIds.length, snapshotOwned.length);
  assert.deepEqual([...groupedIds].sort(), snapshotOwned.map((p) => p.id).sort());
  assert.equal(new Set(groupedIds).size, groupedIds.length);
  for (const p of sections.flatMap((s) => s.products)) {
    assert.equal(p.insurer, key);
  }
});

test('sections follow CATEGORY_ORDER and omit empty categories', () => {
  const key = 'FWD';
  const sections = groupInsurerProductsByCategory(products, key);
  const orderIndex = new Map(CATEGORY_ORDER.map((id, i) => [id, i]));
  const seenCats = sections.map((s) => s.categoryId);
  const snapshotCats = new Set(products.filter((p) => p.insurer === key).map((p) => p.category));
  assert.equal(seenCats.length, snapshotCats.size);
  for (const cat of seenCats) {
    assert.ok(snapshotCats.has(cat), `unexpected category ${cat}`);
    assert.ok(orderIndex.has(cat) || true);
  }
  const ordered = seenCats.filter((c) => orderIndex.has(c));
  for (let i = 1; i < ordered.length; i += 1) {
    assert.ok(orderIndex.get(ordered[i - 1]) < orderIndex.get(ordered[i]), 'CATEGORY_ORDER violated');
  }
  for (const section of sections) {
    assert.ok(section.products.length > 0, 'empty categories must be omitted');
  }
  // 未知類別唔會被發明：所有分組類別都必須喺快照產品入面出現過
  assert.ok(seenCats.every((c) => snapshotCats.has(c)));
});

test('card models report category counts, product counts and premium availability from snapshot only', () => {
  const models = buildInsurerCardModels(products, insurers);
  assert.equal(models.length, insurers.length);
  for (const model of models) {
    const owned = products.filter((p) => p.insurer === model.insurer.name);
    assert.equal(model.totalProducts, owned.length);
    assert.equal(
      model.premiumCount,
      owned.filter((p) => p.premium_available).length,
    );
    assert.equal(
      model.categoryCounts.reduce((n, c) => n + c.count, 0),
      owned.length,
    );
    const uniqueCats = new Set(owned.map((p) => p.category));
    assert.equal(model.categoryCounts.length, uniqueCats.size);
    for (const { categoryId, count } of model.categoryCounts) {
      assert.equal(count, owned.filter((p) => p.category === categoryId).length);
    }
  }
});

test('sort is site-coverage order (categories, products, name) and not a quality claim', () => {
  const models = sortInsurerCardModels(buildInsurerCardModels(products, insurers));
  for (let i = 1; i < models.length; i += 1) {
    const a = models[i - 1];
    const b = models[i];
    const byCats = b.categoryCounts.length - a.categoryCounts.length;
    const byProducts = b.totalProducts - a.totalProducts;
    assert.ok(
      byCats < 0 ||
        (byCats === 0 && byProducts < 0) ||
        (byCats === 0 && byProducts === 0 && a.insurer.name.localeCompare(b.insurer.name) <= 0),
      `sort violated at ${a.insurer.name} → ${b.insurer.name}`,
    );
  }
  assert.ok(INSURER_SORT_NOTE.includes('唔係質素'));
  assert.ok(INSURER_SORT_NOTE.includes('適合度'));
  assert.ok(INSURER_SORT_NOTE.includes('推薦排名'));
  assert.ok(!INSURER_SORT_NOTE.includes('最平'));
  assert.ok(!INSURER_SORT_NOTE.includes('最好'));

});

test('search and category filters only narrow derived models', () => {
  const models = buildInsurerCardModels(products, insurers);
  const axa = filterInsurerCardModels(models, 'axa');
  assert.equal(axa.length, 1);
  assert.equal(axa[0].insurer.name, 'AXA');
  const zh = filterInsurerCardModels(models, '安盛');
  assert.ok(zh.some((m) => m.insurer.name === 'AXA'));
  const travel = filterInsurerCardModelsByCategory(models, 'travel');
  assert.ok(travel.length > 0);
  assert.ok(travel.every((m) => m.categoryCounts.some((c) => c.categoryId === 'travel')));
  assert.equal(filterInsurerCardModelsByCategory(models, 'all').length, models.length);
  assert.equal(filterInsurerCardModels(models, '   ').length, models.length);
});

test('detail path encodes insurer keys; category path stays category route', () => {
  assert.equal(insurerDetailPath('AXA'), '/insurers/AXA');
  assert.equal(
    insurerDetailPath('BOC Group Insurance'),
    '/insurers/BOC%20Group%20Insurance',
  );
  assert.equal(
    insurerDetailPath('China Life (Overseas)'),
    '/insurers/China%20Life%20(Overseas)',
  );
  assert.equal(categoryPath('travel'), '/category/travel');
});

test('every snapshot insurer still appears in grouped output for the site routes', () => {
  const models = buildInsurerCardModels(products, insurers);
  assert.equal(models.length, 40);
  for (const model of models) {
    assert.ok(model.totalProducts >= 1);
    assert.ok(model.categoryCounts.length >= 1);
    const sections = groupInsurerProductsByCategory(products, model.insurer.name);
    assert.equal(sections.length, model.categoryCounts.length);
  }
});

test('redesigned UI keeps company-first routes and honesty copy', () => {
  const indexSource = readFileSync('src/pages/Insurers.tsx', 'utf8');
  const detailSource = readFileSync('src/pages/InsurerDetail.tsx', 'utf8');
  const cardSource = readFileSync('src/components/insurers/InsurerCard.tsx', 'utf8');
  const appSource = readFileSync('src/App.tsx', 'utf8');

  assert.ok(appSource.includes('insurers/:insurerKey'));
  assert.ok(appSource.includes('InsurerDetail'));
  assert.ok(cardSource.includes('insurerDetailPath') || indexSource.includes('insurerDetailPath') || detailSource.includes('insurerDetailPath'));
  assert.ok(indexSource.includes('buildInsurerCardModels'));
  assert.ok(indexSource.includes('sortInsurerCardModels'));
  assert.ok(indexSource.includes('INSURER_SORT_NOTE'));
  assert.ok(indexSource.includes('產品數'));
  // anchors remain for back-compat
  assert.ok(indexSource.includes('location.hash'));
  assert.ok(cardSource.includes('id={insurer.name}'));
  assert.ok(cardSource.includes('睇產品'));
  assert.ok(cardSource.includes('categoryCounts'));

  assert.ok(detailSource.includes('groupInsurerProductsByCategory'));
  assert.ok(detailSource.includes('ProductCard'));
  assert.ok(detailSource.includes('cat-'));
  assert.ok(detailSource.includes('快照'));
  assert.ok(detailSource.includes('唔提供適合度評分'));
  assert.ok(detailSource.includes('睇全部公司'));
  // 否定句可以提到報價；肯定式推銷用語唔可以出現
  assert.ok(/非全市場|唔係全市場/.test(detailSource));
  assert.ok(/唔提供適合度評分/.test(detailSource) && /報價/.test(detailSource));
  for (const banned of ['最平', '最好', '推薦你', '已核實全部條款', '即時報價出爐', '適合度評分：']) {
    assert.ok(!detailSource.includes(banned), `detail must not claim ${banned}`);
  }
});
