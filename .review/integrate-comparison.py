from pathlib import Path
p=Path('src/lib/feature-filters.ts');s=p.read_text();s='import { assessFeature } from "./feature-evidence.ts";\n'+s
start=s.index('export function matchSingleFeature(');end=s.index('/** 計算產品',start)
s=s[:start]+'''export function matchSingleFeature(product: Product, tag: FeatureFilterTag): { matched: boolean; matchedKeyword?: string } {
  return assessFeature(product, tag.keywords);
}

'''+s[end:]
s=s.replace('selectedTagIds.filter((id) => allTags.some((t) => t.id === id))','[...new Set(selectedTagIds)].filter((id) => allTags.some((t) => t.id === id))')
s=s.replace('["租車", "自駕遊", "自負額", "rental car",','["租車", "rental car",')
p.write_text(s)
p=Path('src/components/compare/coverage.ts');s=p.read_text();s='import { comparableAmount, comparableBest } from "../../lib/comparable-amount.ts";\n'+s
start=s.index('/**\n * 由 limit');end=s.index('/** 保費公開狀態',start)
s=s[:start]+'''/** Unsupported ranges, currencies or ambiguous units deliberately remain unknown. */
export function parseLimitValue(limit: string | undefined): number | null {
  return comparableAmount(limit)?.value ?? null;
}
export function bestValueColumnsFromLimits(limits: (string | undefined)[], label = ""): Set<number> {
  return comparableBest(limits, label);
}
export function bestValueColumns(products: Product[], item: string): Set<number> {
  return bestValueColumnsFromLimits(products.map(p => coverageLimit(p, item)), item);
}

'''+s[end:];p.write_text(s)
p=Path('src/components/compare/ComparisonGrid.tsx');s=p.read_text().replace('bestValueColumnsFromLimits(row.limits)','bestValueColumnsFromLimits(row.limits, row.label)');p.write_text(s)
p=Path('src/components/compare/cells.tsx');p.write_text(p.read_text().replace('按官方文件所示上限比較','同一明示計算單位的摘要數值比較；仍需核對原文、級別及例外'))
p=Path('src/pages/CategoryDetail.tsx');s=p.read_text();start=s.index('/** 智能提取產品整體');end=s.index('/** 類別詳情',start);s=s[:start]+s[end:]
start=s.index('    } else if (sort === "coverage-max")');end=s.index('    } else if (sort === "insurer-az"',start);s=s[:start]+s[end:]
s=s.replace('市場上暫無單一計劃同時 100% 滿足所有','本站摘要未有同時命中全部')
s=s.replace('已為你自動切換為<strong>【智能推薦模式】</strong>，將符合最多項目（如中 2–3 項）的方案置頂排序，助你挑選最實用貼心的保險！','以下只係部分命中嘅替代資料，並不符合你全部條件。未命中可能係不保或資料不足；百分比唔係適合度、核保或理賠機會。')
p.write_text(s)
p=Path('src/components/category/FilterBar.tsx');s=p.read_text();s='\n'.join(l for l in s.split('\n') if 'id: "coverage-max", label:' not in l and 'id: "value-score", label:' not in l)
s=s.replace('✨ 預設推薦（智能契合度）','摘要條件命中排序').replace('🎯 契合度最高優先（中最多條件）','摘要命中項目由多至少').replace('實付折後價先','參考資料，並非同條件報價').replace('尊尚高額先','參考資料，並非保障排名')
p.write_text(s)
p=Path('src/lib/version.ts');p.write_text(p.read_text().replace('20260906.5','20260906.6'))
