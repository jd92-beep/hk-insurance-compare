import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  parseProductPlanTiers,
  extractTierCoverageLimit,
  isSummaryTierLine,
  getPlanTierById,
} from "../src/components/product/plan-parser.ts";

const dataset = () => JSON.parse(readFileSync("public/data/insurance-data.json", "utf8"));

test("AIA 自願醫保多級別子計劃成功解析並過濾純總結行", () => {
  const data = dataset();
  const aia = data.products.find((p) => p.id === "medical-aia");
  assert.ok(aia, "AIA 產品存在");

  const rawTierLines = aia.plan_tiers;
  assert.equal(rawTierLines.length, 5, "原始 plan_tiers 應有 5 行（含 1 行全覽總結行）");

  // 驗證總結行檢測
  assert.equal(isSummaryTierLine(rawTierLines[4]), true, "第 5 行應識別為全覽總結行");
  assert.equal(isSummaryTierLine(rawTierLines[0]), false, "第 1 行不應是總結行");

  const parsed = parseProductPlanTiers(aia);
  assert.equal(parsed.length, 4, "解析後子計劃應為 4 個（過濾總結行）");

  const [standard, flexi, zunYao, ruiXuan] = parsed;

  // 1. 標準計劃（S00013）
  assert.equal(standard.name, "標準計劃");
  assert.equal(standard.code, "S00013");
  assert.equal(standard.isStandard, true);
  assert.equal(standard.isVhis, true);
  assert.ok(standard.keywords.includes("標準"), "包含標準關鍵詞");

  // 2. 靈活計劃（F00022）
  assert.equal(flexi.name, "靈活計劃");
  assert.equal(flexi.code, "F00022");
  assert.equal(flexi.roomType, "普通房/半私家/私家");
  assert.ok(flexi.badges.includes("普通房/半私家/私家"));

  // 3. 尊耀計劃（高端，標準私家房，F00074）
  assert.equal(zunYao.name, "尊耀計劃");
  assert.equal(zunYao.code, "F00074");
  assert.equal(zunYao.roomType, "標準私家房");
  assert.ok(zunYao.badges.includes("高端"), "尊耀計劃應標有高端標籤");
  assert.ok(zunYao.badges.includes("標準私家房"), "尊耀計劃應標有標準私家房");

  // 4. 睿選計劃（網絡醫院，半私家房，F00081）
  assert.equal(ruiXuan.name, "睿選計劃");
  assert.equal(ruiXuan.code, "F00081");
  assert.equal(ruiXuan.roomType, "半私家房");
  assert.ok(ruiXuan.badges.includes("網絡醫院"), "睿選計劃應標有網絡醫院標籤");
  assert.ok(ruiXuan.badges.includes("半私家房"), "睿選計劃應標有半私家房");
});

test("混合條款限額提取函數 extractTierCoverageLimit 正確提取各計劃專屬限額", () => {
  const data = dataset();
  const aia = data.products.find((p) => p.id === "medical-aia");
  const parsed = parseProductPlanTiers(aia);
  const standard = parsed.find((t) => t.code === "S00013");
  const zunYao = parsed.find((t) => t.code === "F00074");
  const ruiXuan = parsed.find((t) => t.code === "F00081");
  const flexi = parsed.find((t) => t.code === "F00022");

  // 測試 1：每年保障限額
  const limit1 = "標準計劃 HK$420,000；睿選/尊耀計劃每保單年度 HK$12,000,000；至尊靈活不設限額";
  assert.equal(extractTierCoverageLimit(limit1, standard), "HK$420,000");
  assert.equal(extractTierCoverageLimit(limit1, zunYao), "每保單年度 HK$12,000,000");
  assert.equal(extractTierCoverageLimit(limit1, ruiXuan), "每保單年度 HK$12,000,000");
  assert.equal(extractTierCoverageLimit(limit1, flexi), "不設限額");

  // 測試 2：病房及膳食（避開標準私家房誤配標準計劃）
  const limit2 =
    "標準計劃每日 HK$750（最多180日）；睿選計劃半私家房全數賠償；尊耀計劃標準私家房全數賠償";
  assert.equal(extractTierCoverageLimit(limit2, standard), "每日 HK$750（最多180日）");
  assert.equal(extractTierCoverageLimit(limit2, ruiXuan), "半私家房全數賠償");
  assert.equal(extractTierCoverageLimit(limit2, zunYao), "標準私家房全數賠償");

  // 測試 3：主要醫療費用（全數賠償與分項上限說明）
  const limit3 =
    "標準計劃按手術表賠償；尊耀/睿選全數賠償，手術費、巡房費及雜費無分項上限";
  assert.equal(extractTierCoverageLimit(limit3, standard), "按手術表賠償");
  assert.equal(
    extractTierCoverageLimit(limit3, zunYao),
    "全數賠償，手術費、巡房費及雜費無分項上限"
  );
  assert.equal(
    extractTierCoverageLimit(limit3, ruiXuan),
    "全數賠償，手術費、巡房費及雜費無分項上限"
  );

  // 測試 4：外科醫生費
  const limit4 = "標準小型HK$5,000至複雜HK$50,000；尊耀/睿選全數賠償";
  assert.equal(extractTierCoverageLimit(limit4, standard), "小型HK$5,000至複雜HK$50,000");
  assert.equal(extractTierCoverageLimit(limit4, zunYao), "全數賠償");
  assert.equal(extractTierCoverageLimit(limit4, ruiXuan), "全數賠償");

  // 測試 5：通用條款（無計劃區分時保留原文）
  const limitGeneral1 = "保證續保至 100 歲";
  assert.equal(extractTierCoverageLimit(limitGeneral1, standard), "保證續保至 100 歲");
  assert.equal(extractTierCoverageLimit(limitGeneral1, zunYao), "保證續保至 100 歲");

  const limitGeneral2 = "設有 HK$0 / HK$16,000 / HK$25,000 / HK$50,000 / HK$80,000 多檔自負額選項";
  assert.equal(extractTierCoverageLimit(limitGeneral2, zunYao), limitGeneral2);

  // 測試 6：未選中 tier（null）時保留完整原文
  assert.equal(extractTierCoverageLimit(limit1, null), limit1);
});

test("其他多計劃產品（Bowtie / FWD）計劃解析與限額提取", () => {
  const data = dataset();

  // Bowtie 自願醫保
  const bowtie = data.products.find((p) => p.id === "medical-bowtie");
  if (bowtie) {
    const bowtieTiers = parseProductPlanTiers(bowtie);
    assert.ok(bowtieTiers.length >= 3, "Bowtie 應解析出多個子計劃");
    const pinkTier = bowtieTiers.find((t) => t.name.includes("Pink"));
    assert.ok(pinkTier, "應包含 Bowtie Pink 子計劃");

    const bowtieLimit =
      "標準計劃 HK$420,000；靈活計劃（升級）HK$1,000,000；Bowtie Pink 旗艦每年 HK$8,000,000 至 HK$20,000,000";
    const extracted = extractTierCoverageLimit(bowtieLimit, pinkTier);
    assert.ok(
      extracted.includes("HK$8,000,000 至 HK$20,000,000"),
      "Bowtie Pink 應成功提取高達 2000 萬限額"
    );
  }

  // FWD 尊衛您 / 更衛您
  const fwd = data.products.find((p) => p.id === "medical-fwd");
  if (fwd) {
    const fwdTiers = parseProductPlanTiers(fwd);
    const zunWeiTier = fwdTiers.find((t) => t.name.includes("尊衛您"));
    assert.ok(zunWeiTier, "應包含尊衛您計劃");

    const fwdLimit = "標準及尊衛您均不設終身保障限額（無上限賠償）";
    const extracted = extractTierCoverageLimit(fwdLimit, zunWeiTier);
    assert.equal(extracted, "不設終身保障限額（無上限賠償）");
  }
});

test("getPlanTierById 正確依 ID、認可編號或名稱定位子計劃", () => {
  const data = dataset();
  const aia = data.products.find((p) => p.id === "medical-aia");
  const tiers = parseProductPlanTiers(aia);

  // 依認可編號（小寫或大寫）
  assert.equal(getPlanTierById(tiers, "S00013")?.code, "S00013");
  assert.equal(getPlanTierById(tiers, "f00074")?.name, "尊耀計劃");
  assert.equal(getPlanTierById(tiers, "F00081")?.name, "睿選計劃");

  // 依名稱
  assert.equal(getPlanTierById(tiers, "尊耀計劃")?.code, "F00074");

  // 不存在時返回 undefined
  assert.equal(getPlanTierById(tiers, "invalid-tier-id"), undefined);
  assert.equal(getPlanTierById(tiers, null), undefined);
});
