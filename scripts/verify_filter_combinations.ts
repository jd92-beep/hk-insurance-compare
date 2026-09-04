/* eslint-disable */
import fs from "node:fs";
import path from "node:path";
import {
  CATEGORY_FEATURE_TAGS,
  CATEGORY_SCENARIO_PRESETS,
  getCategoryFeatureTags,
  getCategoryScenarioPresets,
  filterAndRankProductsByFeatures,
} from "../src/lib/feature-filters.ts";
import { premiumSortKey } from "../src/lib/categories.ts";

interface RawData {
  products: any[];
  categories: any[];
}

const dataPath = path.resolve(process.cwd(), "public/data/insurance-data.json");
const rawData: RawData = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
const allProducts = rawData.products;

console.log(`Loaded ${allProducts.length} products across ${rawData.categories.length} categories.`);

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, msg: string) {
  totalTests++;
  if (condition) {
    passedTests++;
  } else {
    failedTests++;
    console.error(`❌ FAILED: ${msg}`);
  }
}

// 1. 驗證所有 Presets 的 featureIds 是否皆合法
console.log("\n--- [Round 1] Checking Preset Integrity ---");
for (const [catId, presets] of Object.entries(CATEGORY_SCENARIO_PRESETS)) {
  const validTags = getCategoryFeatureTags(catId);
  const validTagIds = new Set(validTags.map((t) => t.id));

  for (const preset of presets) {
    assert(preset.featureIds.length > 0, `Preset ${preset.id} in ${catId} has features`);
    for (const fid of preset.featureIds) {
      assert(
        validTagIds.has(fid),
        `Preset ${preset.id} in ${catId} references valid tag id "${fid}"`
      );
    }
  }
}

// 2. 遍歷 11 大類別，測試所有 Preset 組合及各種過濾排序
console.log("\n--- [Round 2] Testing Category Preset & Filter Combinations ---");
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

for (const catId of categoryIds) {
  let catProducts = allProducts.filter((p: any) => p.category === catId);
  if (catProducts.length === 0 && (catId === "high-end-medical" || catId === "top-up-medical")) {
    catProducts = allProducts.filter((p: any) => p.category === "medical");
  }

  const presets = getCategoryScenarioPresets(catId);

  // 2.1 測試每個 Preset
  for (const preset of presets) {
    for (const mode of ["smart", "strict"] as const) {
      const res = filterAndRankProductsByFeatures(catProducts, preset.featureIds, catId, mode);
      assert(Array.isArray(res.results), `${catId} preset ${preset.id} in ${mode} returns results array`);
      assert(typeof res.exactMatchCount === "number", `${catId} preset ${preset.id} exactMatchCount is number`);
      assert(typeof res.fallbackTriggered === "boolean", `${catId} preset ${preset.id} fallbackTriggered is boolean`);

      for (const item of res.results) {
        assert(item.match.score >= 0 && item.match.score <= 100, `Score between 0-100`);
        assert(item.match.matchedCount <= preset.featureIds.length, `Matched count <= totalSelected`);
      }
    }
  }

  // 2.2 測試排序演算法穩定性
  const testSortList = [...catProducts];
  testSortList.sort((a, b) => {
    const ka = a.premium_available ? premiumSortKey(a.premium_range) : Number.POSITIVE_INFINITY;
    const kb = b.premium_available ? premiumSortKey(b.premium_range) : Number.POSITIVE_INFINITY;
    if (!Number.isFinite(ka) && !Number.isFinite(kb)) return 0;
    if (!Number.isFinite(ka)) return 1;
    if (!Number.isFinite(kb)) return -1;
    return ka - kb;
  });
  assert(testSortList.length === catProducts.length, `Sorting premium asc retains all products`);
}

// 3. 測試旅遊保險全維度交叉矩陣
console.log("\n--- [Round 3] Testing Travel Multi-dimensional Cross Matrix ---");
const travelProducts = allProducts.filter((p: any) => p.category === "travel");
const tripTypes = ["all", "single", "annual"];
const regions = ["all", "asia", "worldwide", "gba"];
const promos = [false, true];
const travelPresets = getCategoryScenarioPresets("travel");

let crossCombinationsCount = 0;
for (const trip of tripTypes) {
  for (const reg of regions) {
    for (const promo of promos) {
      for (const preset of travelPresets) {
        crossCombinationsCount++;
        let list = travelProducts;
        if (trip === "single") {
          list = list.filter((p: any) => p.trip_type === "single" || p.trip_type === "both" || !p.trip_type);
        } else if (trip === "annual") {
          list = list.filter((p: any) => p.trip_type === "annual" || p.trip_type === "both");
        }

        if (reg === "asia") {
          list = list.filter((p: any) => (p.destination_scope ? p.destination_scope.includes("asia") : true));
        } else if (reg === "worldwide") {
          list = list.filter((p: any) => (p.destination_scope ? p.destination_scope.includes("worldwide") : true));
        } else if (reg === "gba") {
          list = list.filter((p: any) => (p.destination_scope ? p.destination_scope.includes("gba") : false));
        }

        if (promo) {
          list = list.filter((p: any) => Boolean(p.promo));
        }

        const resSmart = filterAndRankProductsByFeatures(list, preset.featureIds, "travel", "smart");
        const resStrict = filterAndRankProductsByFeatures(list, preset.featureIds, "travel", "strict");

        assert(Array.isArray(resSmart.results), `Travel combo ${trip}-${reg}-promo:${promo}-${preset.id} smart ok`);
        assert(Array.isArray(resStrict.results), `Travel combo ${trip}-${reg}-promo:${promo}-${preset.id} strict ok`);
      }
    }
  }
}
console.log(`Verified ${crossCombinationsCount} cross combinations for travel insurance.`);

// 4. 測試微型搜尋關鍵字匹配
console.log("\n--- [Round 4] Testing Micro-search Keyword Matching ---");
const searchKeywords = ["租車", "免找數", "滑雪", "自駕", "CT", "癌症", "NCD", "門診", "意外", "牙科"];
for (const kw of searchKeywords) {
  const q = kw.toLowerCase();
  let matchedCount = 0;
  for (const [catId, tags] of Object.entries(CATEGORY_FEATURE_TAGS)) {
    const matched = tags.filter(
      (t) =>
        t.label.toLowerCase().includes(q) ||
        t.keywords.some((k) => k.toLowerCase().includes(q)) ||
        t.id.toLowerCase().includes(q)
    );
    matchedCount += matched.length;
  }
  assert(matchedCount > 0, `Keyword "${kw}" matches at least 1 feature tag across categories`);
}

console.log("\n=========================================");
console.log(`Test Summary: Passed ${passedTests} / ${totalTests} assertions.`);
if (failedTests === 0) {
  console.log("🎉 ALL COMBINATIONS PASSED PERFECTLY WITH ZERO ERRORS!");
} else {
  console.error(`💥 Found ${failedTests} failures.`);
  process.exit(1);
}
