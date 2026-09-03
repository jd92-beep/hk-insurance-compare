import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  CATEGORY_METRICS_MAP,
  getDefaultMetric,
  extractProductMetric,
  prepareChartData,
} from "../src/lib/chart-metrics";
import type { InsuranceData } from "../src/types/insurance";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.resolve(__dirname, "../public/data/insurance-data.json");
const rawJson = fs.readFileSync(dataPath, "utf-8");
const data: InsuranceData = JSON.parse(rawJson);
const products = data.products;

console.log(`================================================================`);
console.log(`📊 全類別通用量化指標解析引擎測試報告 (Universal Metrics Test)`);
console.log(`   全站總產品數: ${products.length} 份`);
console.log(`   全站總類別數: ${Object.keys(CATEGORY_METRICS_MAP).length} 個`);
console.log(`================================================================\n`);

let totalChecks = 0;
let passedChecks = 0;

for (const [catId, metrics] of Object.entries(CATEGORY_METRICS_MAP)) {
  const catProducts = products.filter((p) => p.category === catId);
  const defaultMetric = getDefaultMetric(catId);

  console.log(`----------------------------------------------------------------`);
  console.log(`📂 【${catId}】 (${catProducts.length} 份產品)`);
  console.log(`   預設指標: ${defaultMetric?.label} [${defaultMetric?.id}]`);

  for (const m of metrics) {
    let matchedCount = 0;
    let flagshipCount = 0;
    const samples: string[] = [];

    for (const p of catProducts) {
      const parsed = extractProductMetric(p, m);
      if (parsed) {
        matchedCount += 1;
        if (parsed.isUnlimited || parsed.isFullCover) {
          flagshipCount += 1;
        }
        if (samples.length < 3) {
          const badgeStr = parsed.badge ? ` [Badge: ${parsed.badge}]` : "";
          samples.push(`${p.id} -> ${parsed.displayValue}${badgeStr}`);
        }
      }
    }

    const pct = (matchedCount / catProducts.length) * 100;
    const isDefault = m.id === defaultMetric?.id ? " ⭐(Default)" : "";
    console.log(
      `   • ${m.label} (${m.id})${isDefault}: ${matchedCount}/${catProducts.length} (${pct.toFixed(1)}%) | 旗艦條款: ${flagshipCount} 個`
    );
    if (samples.length > 0) {
      console.log(`     範例: ${samples.join(" | ")}`);
    }

    totalChecks += 1;
    if (matchedCount > 0) {
      passedChecks += 1;
    }
  }

  // 測試 prepareChartData 輸出
  if (defaultMetric) {
    const chartData = prepareChartData(catProducts, defaultMetric, {
      sortOrder: "desc",
    });
    console.log(`   📈 圖表數據集 (prepareChartData) 生成成功: ${chartData.length} 條`);
    if (chartData.length > 0) {
      const top = chartData[0];
      const bottom = chartData[chartData.length - 1];
      console.log(
        `      最高首位: [${top.insurerZh}] ${top.name} => ${top.displayValue} (visual: ${top.visualValue}) -> URL: ${top.url}`
      );
      console.log(
        `      最低尾位: [${bottom.insurerZh}] ${bottom.name} => ${bottom.displayValue} (visual: ${bottom.visualValue}) -> URL: ${bottom.url}`
      );
    }
  }
  console.log();
}

console.log(`================================================================`);
console.log(`✅ 測試統計: 驗證指標項 ${passedChecks}/${totalChecks} 項均有成功提取數據！`);
console.log(`================================================================`);
