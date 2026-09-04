/* eslint-disable */
import fs from "node:fs";
import path from "node:path";
import {
  CATEGORY_FEATURE_TAGS,
  getCategoryFeatureTags,
  filterAndRankProductsByFeatures,
  checkProductMatch,
  matchSingleFeature,
} from "../src/lib/feature-filters.ts";
import type { Product } from "../src/types/insurance.ts";

interface RawData {
  products: Product[];
  categories: any[];
}

const dataPath = path.resolve(process.cwd(), "public/data/insurance-data.json");
const rawData: RawData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
const allProducts = rawData.products;

console.log(`🚀 [Round 2 Deep Boundary Test] Starting...`);
console.log(`📦 Loaded ${allProducts.length} products across ${rawData.categories.length} categories.`);

let totalAssertions = 0;
let passedAssertions = 0;
let failedAssertions = 0;
const failures: string[] = [];

function assert(condition: boolean, msg: string) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
  } else {
    failedAssertions++;
    failures.push(msg);
    console.error(`❌ FAILED: ${msg}`);
  }
}

function assertNoNanOrUndefined(val: any, label: string) {
  assert(val !== undefined, `${label} must not be undefined`);
  assert(val !== null, `${label} must not be null`);
  if (typeof val === "number") {
    assert(!Number.isNaN(val), `${label} must not be NaN`);
    assert(Number.isFinite(val), `${label} must be finite`);
  }
}

const categoryIds = [
  "travel",
  "medical",
  "high-end-medical",
  "top-up-medical",
  "home",
  "critical-illness",
  "accident",
  "life",
  "motor",
  "domestic-helper",
  "pet",
];

function getProductsForCat(catId: string): Product[] {
  let catProducts = allProducts.filter((p: any) => p.category === catId);
  if (catProducts.length === 0 && (catId === "high-end-medical" || catId === "top-up-medical")) {
    catProducts = allProducts.filter((p: any) => p.category === "medical");
  }
  return catProducts;
}

// -------------------------------------------------------------
// Test Suite 1: 0 項特點邊界測試 (Empty Selection & Ghost Tag)
// -------------------------------------------------------------
console.log("\n🧪 [Test 1] 0 項特點邊界測試 (Empty & Ghost Tags)...");

for (const catId of categoryIds) {
  const catProducts = getProductsForCat(catId);

  // 1.1 完全空陣列 []
  for (const mode of ["smart", "strict"] as const) {
    const res = filterAndRankProductsByFeatures(catProducts, [], catId, mode);

    assert(res.results.length === catProducts.length, `${catId} [mode=${mode}] 0 features returns all products`);
    assert(res.exactMatchCount === catProducts.length, `${catId} [mode=${mode}] exactMatchCount equals total products`);
    assert(res.fallbackTriggered === false, `${catId} [mode=${mode}] fallbackTriggered is false`);
    assert(res.totalSelected === 0, `${catId} [mode=${mode}] totalSelected is 0`);

    for (const item of res.results) {
      assertNoNanOrUndefined(item.match.score, `${catId} 0-feature product score`);
      assert(item.match.score === 100, `${catId} 0-feature default score is 100`);
      assert(item.match.matchedCount === 0, `${catId} 0-feature matchedCount is 0`);
      assert(item.match.totalSelected === 0, `${catId} 0-feature totalSelected is 0`);
      assert(item.match.matchRatio === 1, `${catId} 0-feature matchRatio is 1`);
      assert(Array.isArray(item.match.matchedTags), `${catId} 0-feature matchedTags is array`);
      assert(Array.isArray(item.match.missingTags), `${catId} 0-feature missingTags is array`);
      assert(Array.isArray(item.match.matchedKeywords), `${catId} 0-feature matchedKeywords is array`);
    }
  }

  // 1.2 幽靈/無效 Tag 陣列 (例如 ["non_existent_tag_xyz"])
  for (const mode of ["smart", "strict"] as const) {
    const res = filterAndRankProductsByFeatures(catProducts, ["non_existent_tag_xyz", "ghost_tag_404"], catId, mode);

    assert(res.results.length === catProducts.length, `${catId} [mode=${mode}] ghost tags returns all products`);
    assert(res.exactMatchCount === catProducts.length, `${catId} [mode=${mode}] ghost tags exactMatchCount equals total`);
    assert(res.fallbackTriggered === false, `${catId} [mode=${mode}] ghost tags fallbackTriggered is false`);
    assert(res.totalSelected === 0, `${catId} [mode=${mode}] ghost tags totalSelected is 0`);
  }
}

// -------------------------------------------------------------
// Test Suite 2: 逐一單選 1 項特點 (Single Feature Coverage)
// -------------------------------------------------------------
console.log("\n🧪 [Test 2] 逐一單選 1 項特點測試 (Single Feature Coverage)...");

let singleFeatureTestCount = 0;

for (const catId of categoryIds) {
  const catProducts = getProductsForCat(catId);
  const tags = getCategoryFeatureTags(catId);

  for (const tag of tags) {
    singleFeatureTestCount++;
    for (const mode of ["smart", "strict"] as const) {
      const res = filterAndRankProductsByFeatures(catProducts, [tag.id], catId, mode);

      assert(Array.isArray(res.results), `${catId} tag ${tag.id} [mode=${mode}] returns results array`);
      assertNoNanOrUndefined(res.exactMatchCount, `${catId} tag ${tag.id} exactMatchCount`);
      assert(typeof res.fallbackTriggered === "boolean", `${catId} tag ${tag.id} fallbackTriggered is boolean`);
      assert(res.totalSelected === 1, `${catId} tag ${tag.id} totalSelected is 1`);

      if (mode === "strict") {
        if (res.exactMatchCount > 0) {
          assert(!res.fallbackTriggered, `${catId} strict with matches must not trigger fallback`);
          assert(res.results.length === res.exactMatchCount, `${catId} strict results count equals exactMatchCount`);
          for (const r of res.results) {
            assert(r.match.matchedCount === 1, `${catId} strict match product matchedCount == 1`);
            assert(r.match.score === 100, `${catId} strict match product score == 100`);
            assert(r.match.matchRatio === 1, `${catId} strict match product matchRatio == 1`);
          }
        } else {
          assert(res.fallbackTriggered, `${catId} strict with 0 matches triggers fallback`);
          assert(res.results.length > 0, `${catId} fallback must return products rather than empty`);
        }
      }

      if (mode === "smart") {
        if (res.exactMatchCount > 0) {
          assert(!res.fallbackTriggered, `${catId} smart with matches must not trigger fallback`);
          assert(res.results.length === res.exactMatchCount, `${catId} single feature smart results length == exactMatchCount`);
        } else {
          assert(res.fallbackTriggered, `${catId} smart with 0 matches triggers fallback`);
          assert(res.results.length === catProducts.length, `${catId} smart 0-match fallback returns all products`);
        }
      }

      for (const item of res.results) {
        assertNoNanOrUndefined(item.match.score, `${catId} product score`);
        assertNoNanOrUndefined(item.match.matchRatio, `${catId} product matchRatio`);
        assert(item.match.score >= 0 && item.match.score <= 100, `Score in range 0..100`);
        assert(item.match.matchRatio >= 0 && item.match.matchRatio <= 1, `MatchRatio in range 0..1`);
        assert(item.match.totalSelected === 1, `Total selected is 1`);
        assert(item.match.matchedCount === 0 || item.match.matchedCount === 1, `Matched count is 0 or 1`);
        assert(item.match.matchedTags.length === item.match.matchedCount, `matchedTags length consistent`);
        assert(item.match.missingTags.length === 1 - item.match.matchedCount, `missingTags length consistent`);
      }
    }
  }
}
console.log(`Completed ${singleFeatureTestCount} single-feature tests across all categories.`);

// -------------------------------------------------------------
// Test Suite 3: 全選所有特點 (All Features Selected)
// -------------------------------------------------------------
console.log("\n🧪 [Test 3] 全選所有特點邊界測試 (All Features Selection)...");

for (const catId of categoryIds) {
  const catProducts = getProductsForCat(catId);
  const tags = getCategoryFeatureTags(catId);
  const allTagIds = tags.map((t) => t.id);

  for (const mode of ["smart", "strict"] as const) {
    const res = filterAndRankProductsByFeatures(catProducts, allTagIds, catId, mode);

    assert(Array.isArray(res.results), `${catId} all-features [mode=${mode}] results is array`);
    assert(res.totalSelected === allTagIds.length, `${catId} all-features totalSelected is ${allTagIds.length}`);
    assertNoNanOrUndefined(res.exactMatchCount, `${catId} all-features exactMatchCount`);
    assert(typeof res.fallbackTriggered === "boolean", `${catId} all-features fallbackTriggered`);

    if (mode === "strict") {
      if (res.exactMatchCount > 0) {
        assert(!res.fallbackTriggered, `${catId} strict with full matches has no fallback`);
        assert(res.results.length === res.exactMatchCount, `${catId} strict results length == exactMatchCount`);
      } else {
        assert(res.fallbackTriggered, `${catId} strict with 0 full matches activates fallback`);
        assert(res.results.length > 0, `${catId} strict fallback returns recommendations`);
        for (let i = 1; i < res.results.length; i++) {
          assert(
            res.results[i - 1].match.matchedCount >= res.results[i].match.matchedCount,
            `${catId} strict fallback order descending by matchedCount`
          );
        }
      }
    }

    if (mode === "smart") {
      for (let i = 1; i < res.results.length; i++) {
        assert(
          res.results[i - 1].match.matchedCount >= res.results[i].match.matchedCount,
          `${catId} smart order descending by matchedCount`
        );
      }
    }

    for (const item of res.results) {
      assertNoNanOrUndefined(item.match.score, `${catId} all-features product score`);
      assertNoNanOrUndefined(item.match.matchRatio, `${catId} all-features product matchRatio`);
      assert(item.match.score >= 0 && item.match.score <= 100, `Score 0..100`);
      assert(item.match.matchRatio >= 0 && item.match.matchRatio <= 1, `MatchRatio 0..1`);
      assert(item.match.matchedCount <= allTagIds.length, `matchedCount <= ${allTagIds.length}`);
      assert(item.match.matchedTags.length === item.match.matchedCount, `matchedTags count match`);
      assert(item.match.missingTags.length === allTagIds.length - item.match.matchedCount, `missingTags count match`);
      assert(item.match.matchedTags.length + item.match.missingTags.length === allTagIds.length, `tag sum equals total`);
    }
  }
}

// -------------------------------------------------------------
// Test Suite 4: 遍歷全部 158 產品無死角評分與 NaN/Undefined 檢驗
// -------------------------------------------------------------
console.log("\n🧪 [Test 4] 遍歷所有 158 產品，針對所屬類別之所有標籤進行深入評分檢查...");

let productsScored = 0;
for (const p of allProducts) {
  productsScored++;
  const catId = p.category;
  const tags = getCategoryFeatureTags(catId);
  if (tags.length === 0) continue;

  const tagIds = tags.map((t) => t.id);
  const matchRes = checkProductMatch(p, tagIds, catId);

  assertNoNanOrUndefined(matchRes.score, `Product ${p.id} score`);
  assertNoNanOrUndefined(matchRes.matchRatio, `Product ${p.id} matchRatio`);
  assertNoNanOrUndefined(matchRes.matchedCount, `Product ${p.id} matchedCount`);
  assertNoNanOrUndefined(matchRes.totalSelected, `Product ${p.id} totalSelected`);
  assert(Number.isInteger(matchRes.score), `Product ${p.id} score must be integer`);
  assert(Number.isInteger(matchRes.matchedCount), `Product ${p.id} matchedCount must be integer`);
  assert(Number.isInteger(matchRes.totalSelected), `Product ${p.id} totalSelected must be integer`);
  assert(matchRes.totalSelected === tags.length, `Product ${p.id} totalSelected == tags.length`);

  for (const tag of matchRes.matchedTags) {
    assertNoNanOrUndefined(tag.id, `Product ${p.id} matchedTag.id`);
    assertNoNanOrUndefined(tag.label, `Product ${p.id} matchedTag.label`);
    assert(Array.isArray(tag.keywords), `Product ${p.id} matchedTag.keywords is array`);
  }

  for (const tag of matchRes.missingTags) {
    assertNoNanOrUndefined(tag.id, `Product ${p.id} missingTag.id`);
    assertNoNanOrUndefined(tag.label, `Product ${p.id} missingTag.label`);
  }
}
console.log(`Verified complete rating safety across ${productsScored} individual products.`);

// -------------------------------------------------------------
// Test Suite 5: 極端邊界條件與空值防禦測試 (Extreme Edge Cases & Null Safety)
// -------------------------------------------------------------
console.log("\n🧪 [Test 5] 極端邊界與空值防禦測試 (Null Safety, Empty Arrays, Corrupted Data)...");

// 5.1 空產品陣列
const emptyProductsResSmart = filterAndRankProductsByFeatures([], ["rental-car"], "travel", "smart");
assert(emptyProductsResSmart.results.length === 0, `Empty products array in smart returns empty array`);
assert(emptyProductsResSmart.exactMatchCount === 0, `Empty products exactMatchCount is 0`);
assert(emptyProductsResSmart.fallbackTriggered === true, `Empty products triggers fallback`);

const emptyProductsResStrict = filterAndRankProductsByFeatures([], ["rental-car"], "travel", "strict");
assert(emptyProductsResStrict.results.length === 0, `Empty products array in strict returns empty array`);
assert(emptyProductsResStrict.exactMatchCount === 0, `Empty products exactMatchCount is 0`);
assert(emptyProductsResStrict.fallbackTriggered === true, `Empty products triggers fallback`);

// 空產品 + 空標籤
const emptyProductsEmptyTags = filterAndRankProductsByFeatures([], [], "travel", "smart");
assert(emptyProductsEmptyTags.results.length === 0, `Empty products + empty tags returns empty`);
assert(emptyProductsEmptyTags.fallbackTriggered === false, `Empty products + empty tags fallback is false`);

// 5.2 畸形/缺失欄位的 Product 物件
const corruptedProduct: any = {
  id: "test-corrupted-prod",
  name: "Corrupted Test Product",
  insurer: "test-insurer",
  category: "travel",
  coverage: undefined,
  key_terms: null,
  plan_tiers: undefined,
};

const tagToTest = CATEGORY_FEATURE_TAGS.travel[0];
const singleMatchCorrupted = matchSingleFeature(corruptedProduct, tagToTest);
assert(singleMatchCorrupted.matched === false, `Corrupted product does not crash matchSingleFeature and returns false`);

const matchResCorrupted = checkProductMatch(corruptedProduct, [tagToTest.id], "travel");
assert(matchResCorrupted.score === 0, `Corrupted product receives 0 score without error`);
assert(matchResCorrupted.matchedCount === 0, `Corrupted product matchedCount is 0`);
assert(matchResCorrupted.missingTags.length === 1, `Corrupted product missingTags is 1`);

// 5.3 包含 coverage 元素缺少 limit 或 item 為空字串
const partialCoverageProduct: any = {
  id: "partial-prod",
  name: "Partial Coverage Product",
  insurer: "test",
  category: "travel",
  coverage: [
    { item: "緊急醫療運送無上限", limit: undefined },
    { item: "普通住院", limit: null },
  ],
  key_terms: ["業餘運動"],
};
const resPartial = checkProductMatch(partialCoverageProduct, ["emergency-evac", "sports-cover"], "travel");
assert(resPartial.matchedCount === 2, `Partial coverage matches both emergency-evac and sports-cover`);
assert(resPartial.score === 100, `Partial coverage score is 100`);

// 5.4 混合合法與非法 Tag IDs
const mixedRes = filterAndRankProductsByFeatures(
  getProductsForCat("travel"),
  ["rental-car", "bogus-fake-tag-123", "emergency-evac"],
  "travel",
  "smart"
);
assert(mixedRes.totalSelected === 2, `Mixed tags filters out invalid tags, totalSelected is 2`);

// -------------------------------------------------------------
// Summary
// -------------------------------------------------------------
console.log("\n============================================================");
console.log(`🎯 Deep Boundary Test Summary:`);
console.log(`   - Total Assertions:  ${totalAssertions}`);
console.log(`   - Passed:            ${passedAssertions}`);
console.log(`   - Failed:            ${failedAssertions}`);
console.log("============================================================");

if (failedAssertions > 0) {
  console.error(`💥 Encountered ${failedAssertions} failures!`);
  process.exit(1);
} else {
  console.log(`🏆 [100% PASS] All deep boundary assertions passed flawlessly!`);
  console.log(`✨ Zero NaNs, Zero undefined, Zero unhandled exceptions!`);
}
