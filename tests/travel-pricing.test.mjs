import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  flattenProductsForPriceSort,
  sortFlatProductsByPrice,
  isTravelTierPureAnnual,
  isTravelTierPureSingle,
  extractTravelSinglePrice,
  extractTravelAnnualPrice,
} from "../src/lib/price-sorting.ts";

const dataset = () => JSON.parse(readFileSync("public/data/insurance-data.json", "utf8"));

test("isTravelTierPureAnnual & isTravelTierPureSingle 正確識別旅遊子計劃性質", () => {
  // 1. 純單次
  assert.equal(isTravelTierPureSingle({ id: "1", name: "簡易計劃 Breezy（只限單次）", fullName: "", keywords: [], index: 0, isVhis: false }), true);
  assert.equal(isTravelTierPureAnnual({ id: "1", name: "簡易計劃 Breezy（只限單次）", fullName: "", keywords: [], index: 0, isVhis: false }), false);

  assert.equal(isTravelTierPureSingle({ id: "2", name: "美亞倍安遊（單次）", fullName: "", keywords: [], index: 1, isVhis: false }), true);
  assert.equal(isTravelTierPureAnnual({ id: "2", name: "美亞倍安遊（單次）", fullName: "", keywords: [], index: 1, isVhis: false }), false);

  assert.equal(isTravelTierPureSingle({ id: "3", name: "單次旅程計劃", fullName: "", keywords: [], index: 2, isVhis: false }), true);
  assert.equal(isTravelTierPureAnnual({ id: "3", name: "單次旅程計劃", fullName: "", keywords: [], index: 2, isVhis: false }), false);

  // 2. 純全年
  assert.equal(isTravelTierPureAnnual({ id: "4", name: "全年計劃", fullName: "", keywords: [], index: 3, isVhis: false }), true);
  assert.equal(isTravelTierPureSingle({ id: "4", name: "全年計劃", fullName: "", keywords: [], index: 3, isVhis: false }), false);

  assert.equal(isTravelTierPureAnnual({ id: "5", name: "全年旅遊計劃", fullName: "", keywords: [], index: 4, isVhis: false }), true);
  assert.equal(isTravelTierPureSingle({ id: "5", name: "全年旅遊計劃", fullName: "", keywords: [], index: 4, isVhis: false }), false);

  // 3. 兩者兼備或通用
  assert.equal(isTravelTierPureSingle({ id: "6", name: "單次旅程 / 全年保障", fullName: "", keywords: [], index: 5, isVhis: false }), false);
  assert.equal(isTravelTierPureAnnual({ id: "6", name: "單次旅程 / 全年保障", fullName: "", keywords: [], index: 5, isVhis: false }), false);

  assert.equal(isTravelTierPureSingle({ id: "7", name: "黃金計劃 (Gold)", fullName: "", keywords: [], index: 6, isVhis: false }), false);
  assert.equal(isTravelTierPureAnnual({ id: "7", name: "黃金計劃 (Gold)", fullName: "", keywords: [], index: 6, isVhis: false }), false);
});

test("extractTravelSinglePrice 精準提取單次/日費基準保費，不將日費乘以 365", () => {
  const data = dataset();
  const allianz = data.products.find((p) => p.id === "travel-allianz");
  const aig = data.products.find((p) => p.id === "travel-aig");
  const starr = data.products.find((p) => p.id === "travel-starr");
  const blueCross = data.products.find((p) => p.id === "travel-blue-cross");
  const zurich = data.products.find((p) => p.id === "travel-zurich");

  // Allianz: "單次旅程每日約 HK$50–HK$95 起；全年計劃每年約 HK$1,600–HK$2,400"
  const allianzSingle = extractTravelSinglePrice(allianz);
  assert.equal(allianzSingle.numericPrice, 50, "Allianz 單次日費應提取為 HK$50，絕不可乘以 365！");
  assert.equal(allianzSingle.priceDisplay, "單次：約 HK$50/日起");
  assert.equal(allianzSingle.isQuoteOnly, false);

  // AIG: "單次旅程保費低至 HK$40 起"
  const aigSingle = extractTravelSinglePrice(aig);
  assert.equal(aigSingle.numericPrice, 40);
  assert.equal(aigSingle.priceDisplay, "單次 HK$40 起");

  // Starr: "單次旅程每日約 HK$38–HK$68 起"
  const starrSingle = extractTravelSinglePrice(starr);
  assert.equal(starrSingle.numericPrice, 38);
  assert.equal(starrSingle.priceDisplay, "單次：約 HK$38/日起");

  // Blue Cross 子計劃
  const bcZunYao = extractTravelSinglePrice(blueCross, { id: "1", name: "尊尚計劃", fullName: "", keywords: [], index: 0, isVhis: false });
  assert.equal(bcZunYao.numericPrice, 462);
  assert.equal(bcZunYao.priceDisplay, "單次（7日）：約 HK$462");

  const bcZhiXuan = extractTravelSinglePrice(blueCross, { id: "2", name: "智選計劃", fullName: "", keywords: [], index: 1, isVhis: false });
  assert.equal(bcZhiXuan.numericPrice, 248);
  assert.equal(bcZhiXuan.priceDisplay, "單次（7日）：約 HK$248");

  // Zurich 簡易計劃
  const zurichBreezy = extractTravelSinglePrice(zurich, { id: "breezy", name: "簡易計劃 Breezy（只限單次）", fullName: "", keywords: [], index: 0, isVhis: false });
  assert.equal(zurichBreezy.numericPrice, 120);
  assert.equal(zurichBreezy.priceDisplay, "單次：約 HK$120 起");
});

test("extractTravelAnnualPrice 精準提取全年計劃年費，排除單次干擾", () => {
  const data = dataset();
  const allianz = data.products.find((p) => p.id === "travel-allianz");
  const starr = data.products.find((p) => p.id === "travel-starr");
  const zurich = data.products.find((p) => p.id === "travel-zurich");
  const avo = data.products.find((p) => p.id === "travel-avo");

  // Allianz 全年
  const allianzAnnual = extractTravelAnnualPrice(allianz);
  assert.equal(allianzAnnual.numericPrice, 1600, "Allianz 全年應提取 HK$1,600");
  assert.equal(allianzAnnual.priceDisplay, "全年：約 HK$1,600 /年");

  // Starr 全年
  const starrAnnual = extractTravelAnnualPrice(starr);
  assert.equal(starrAnnual.numericPrice, 1380);
  assert.equal(starrAnnual.priceDisplay, "全年：約 HK$1,380 /年");

  // Avo 全年
  const avoAnnual = extractTravelAnnualPrice(avo);
  assert.equal(avoAnnual.numericPrice, 1380);
  assert.equal(avoAnnual.priceDisplay, "全年：約 HK$1,380 /年");

  // Zurich 子計劃全年
  const zurichElite = extractTravelAnnualPrice(zurich, { id: "elite", name: "綜合計劃 Elite", fullName: "", keywords: [], index: 1, isVhis: false });
  assert.equal(zurichElite.numericPrice, 2580);
  assert.equal(zurichElite.priceDisplay, "全年：約 HK$2,580 /年");

  const zurichSupreme = extractTravelAnnualPrice(zurich, { id: "supreme", name: "優越計劃 Supreme", fullName: "", keywords: [], index: 2, isVhis: false });
  assert.equal(zurichSupreme.numericPrice, 3180);
  assert.equal(zurichSupreme.priceDisplay, "全年：約 HK$3,180 /年");

  // Zurich 簡易計劃（只限單次）在全年模式下不應有全年價格
  const zurichBreezy = extractTravelAnnualPrice(zurich, { id: "breezy", name: "簡易計劃 Breezy（只限單次）", fullName: "", keywords: [], index: 0, isVhis: false });
  assert.equal(zurichBreezy.numericPrice, null);
  assert.equal(zurichBreezy.isQuoteOnly, true);
});

test("flattenProductsForPriceSort 在 trip==='single' 時排除純全年子計劃並正確排序", () => {
  const data = dataset();
  const travel = data.products.filter((p) => p.category === "travel" || p.category_id === "travel");

  const singleItems = flattenProductsForPriceSort(travel, { categoryId: "travel", trip: "single" });

  // 1. 驗證純全年子計劃已被排除
  const hasAigAnnual = singleItems.some((i) => i.product.id === "travel-aig" && i.title.includes("全年計劃"));
  assert.equal(hasAigAnnual, false, "AIG「全年計劃」在單次模式下必須被排除");

  const hasBocAnnual = singleItems.some((i) => i.product.id === "travel-boc-group-insurance" && i.title.includes("全年計劃"));
  assert.equal(hasBocAnnual, false, "中銀「全年計劃」在單次模式下必須被排除");

  const hasDahSingAnnual = singleItems.some((i) => i.product.id === "travel-dah-sing" && i.title.includes("全年旅遊計劃"));
  assert.equal(hasDahSingAnnual, false, "大新「全年旅遊計劃」在單次模式下必須被排除");

  // 2. 驗證單次排序正確
  const sorted = sortFlatProductsByPrice(singleItems, "asc");
  const priced = sorted.filter((i) => i.numericPrice !== null);
  const quotes = sorted.filter((i) => i.numericPrice === null);

  assert.ok(priced.length > 0, "應有帶金額的單次旅遊計劃");
  assert.ok(quotes.length > 0, "應有需報價的單次旅遊計劃");

  // 最平應為 中國太平 (HK$28/日) 或 Starr (HK$38/日) 或 AIG (HK$40)
  assert.equal(priced[0].numericPrice, 28, "最平單次日費應為 HK$28（中國太平）");
  assert.equal(priced[0].priceDisplay, "單次：約 HK$28/日起");

  // 金額必須遞增
  for (let i = 1; i < priced.length; i++) {
    assert.ok(
      priced[i].numericPrice >= priced[i - 1].numericPrice,
      `第 ${i} 項 (${priced[i].numericPrice}) 應大於或等於第 ${i - 1} 項 (${priced[i - 1].numericPrice})`
    );
  }
});

test("flattenProductsForPriceSort 在 trip==='annual' 時排除純單次子計劃並正確排序", () => {
  const data = dataset();
  const travel = data.products.filter((p) => p.category === "travel" || p.category_id === "travel");

  const annualItems = flattenProductsForPriceSort(travel, { categoryId: "travel", trip: "annual" });

  // 1. 驗證純單次子計劃已被排除
  const hasZurichBreezy = annualItems.some((i) => i.product.id === "travel-zurich" && i.title.includes("簡易計劃"));
  assert.equal(hasZurichBreezy, false, "蘇黎世「簡易計劃 Breezy（只限單次）」在全年模式下必須被排除");

  const hasAigSingle = annualItems.some((i) => i.product.id === "travel-aig" && i.title.includes("倍安遊（單次）"));
  assert.equal(hasAigSingle, false, "AIG「美亞倍安遊（單次）」在全年模式下必須被排除");

  const hasBocSingle = annualItems.some((i) => i.product.id === "travel-boc-group-insurance" && i.title.includes("單次旅程計劃"));
  assert.equal(hasBocSingle, false, "中銀「單次旅程計劃」在全年模式下必須被排除");

  // 2. 驗證全年排序正確
  const sorted = sortFlatProductsByPrice(annualItems, "asc");
  const priced = sorted.filter((i) => i.numericPrice !== null);
  const quotes = sorted.filter((i) => i.numericPrice === null);

  assert.ok(priced.length > 0, "應有帶金額的全年旅遊計劃");
  assert.ok(quotes.length > 0, "應有需報價的全年旅遊計劃");

  // 最平全年計劃應為 亞洲保險 (HK$1,200)
  assert.equal(priced[0].numericPrice, 1200, "最平全年計劃應為 HK$1,200 /年（亞洲保險）");
  assert.equal(priced[0].priceDisplay, "全年：約 HK$1,200 /年");

  // 金額必須遞增
  for (let i = 1; i < priced.length; i++) {
    assert.ok(
      priced[i].numericPrice >= priced[i - 1].numericPrice,
      `第 ${i} 項 (${priced[i].numericPrice}) 應大於或等於第 ${i - 1} 項 (${priced[i - 1].numericPrice})`
    );
  }
});
