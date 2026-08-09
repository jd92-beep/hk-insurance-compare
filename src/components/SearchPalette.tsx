import { useMemo, useState } from "react";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, FileText, LayoutGrid, Search } from "lucide-react";
import { useNavigate } from "react-router";
import { useCategories, useInsurers, useProducts } from "@/providers/InsuranceDataProvider";
import { useSearch } from "@/providers/SearchProvider";
import { CATEGORY_META } from "@/lib/categories";

/**
 * 中英文模糊匹配：先試子字串；後備係「收緊版」子序列——
 * 每個命中字之間最多隔 1 個字（容忍空格，例如 "bluecross" 中 "blue cross"），
 * 唔准成條 query 打散晒跨詞命中（之前搜 "Bowtie" 會誤中 Blue WeCare）。
 */
function fuzzyMatch(text: string, query: string): boolean {
  const t = text.toLowerCase();
  const q = query.toLowerCase().trim();
  if (!q) return true;
  if (t.includes(q)) return true;
  let start = t.indexOf(q[0]);
  while (start !== -1) {
    let i = 1;
    let ti = start + 1;
    while (i < q.length && ti < t.length) {
      if (t[ti] === q[i]) {
        i += 1;
        ti += 1;
      } else if (ti + 1 < t.length && t[ti + 1] === q[i]) {
        // 容忍隔 1 個字（空格／連字符）
        i += 1;
        ti += 2;
      } else {
        break;
      }
    }
    if (i >= q.length) return true;
    start = t.indexOf(q[0], start + 1);
  }
  return false;
}

/**
 * 全域搜尋（§7.8）：⌘K 開啟，搜尋 85 產品 + 27 公司 + 9 類別。
 */
export default function SearchPalette() {
  const { open, setOpen } = useSearch();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const categories = useCategories();
  const insurers = useInsurers();
  const products = useProducts();

  const results = useMemo(() => {
    const q = query.trim();
    const matchedCategories = categories.filter((c) =>
      fuzzyMatch(`${c.name_zh} ${c.id}`, q),
    );
    const matchedInsurers = insurers
      .filter((i) => fuzzyMatch(`${i.name} ${i.name_zh}`, q))
      .slice(0, 6);
    const matchedProducts = products
      .filter((p) =>
        fuzzyMatch(
          `${p.product_name} ${p.product_name_zh} ${p.insurer} ${p.insurer_zh} ${p.category}`,
          q,
        ),
      )
      .slice(0, 12);
    return { matchedCategories, matchedInsurers, matchedProducts };
  }, [query, categories, insurers, products]);

  const go = (to: string) => {
    setOpen(false);
    setQuery("");
    navigate(to);
  };

  const hasResults =
    results.matchedCategories.length > 0 ||
    results.matchedInsurers.length > 0 ||
    results.matchedProducts.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="search-overlay"
          className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <button
            type="button"
            aria-label="關閉搜尋"
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ y: 16, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 16, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[640px] overflow-hidden rounded-card border bg-paper shadow-lift"
            style={{ borderColor: "var(--line-strong)" }}
          >
            <Command label="全域搜尋" shouldFilter={false} loop>
              <div className="flex items-center gap-3 border-b px-5" style={{ borderColor: "var(--line)" }}>
                <Search size={18} className="shrink-0 text-ink-faint" aria-hidden="true" />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="搜尋保險公司或產品，例如：旅遊保險、AXA、自願醫保…"
                  className="h-14 w-full bg-transparent font-sans text-[16px] text-ink outline-none placeholder:text-ink-faint"
                  autoFocus
                />
                <kbd className="shrink-0 rounded border bg-paper-2 px-1.5 py-0.5 font-grotesk text-[11px] text-ink-faint" style={{ borderColor: "var(--line)" }}>
                  ESC
                </kbd>
              </div>
              <Command.List className="max-h-[46vh] overflow-y-auto p-2">
                {!hasResults && (
                  <div className="px-4 py-10 text-center text-small text-ink-faint">
                    搵唔到「{query}」相關嘅結果
                  </div>
                )}
                {results.matchedCategories.length > 0 && (
                  <Command.Group heading={<GroupLabel>類別</GroupLabel>}>
                    {results.matchedCategories.map((c) => (
                      <Command.Item
                        key={c.id}
                        value={`cat-${c.id}`}
                        onSelect={() => go(`/category/${c.id}`)}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-ink aria-selected:bg-paper-2"
                      >
                        <span
                          className="cat-icon h-5 w-5"
                          style={{
                            color: CATEGORY_META[c.id]?.color ?? "#181D2E",
                            WebkitMaskImage: `url(${CATEGORY_META[c.id]?.icon ?? "/cat-home.svg"})`,
                            maskImage: `url(${CATEGORY_META[c.id]?.icon ?? "/cat-home.svg"})`,
                          }}
                          aria-hidden="true"
                        />
                        <span className="font-medium">{c.name_zh}</span>
                        <span className="ml-auto text-small text-ink-faint">{c.count} 份產品</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
                {results.matchedInsurers.length > 0 && (
                  <Command.Group heading={<GroupLabel>保險公司</GroupLabel>}>
                    {results.matchedInsurers.map((i) => (
                      <Command.Item
                        key={i.name}
                        value={`ins-${i.name}`}
                        onSelect={() => go(`/insurers#${i.name}`)}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-ink aria-selected:bg-paper-2"
                      >
                        <Building2 size={16} className="text-ink-faint" aria-hidden="true" />
                        <span className="font-grotesk font-bold">{i.name}</span>
                        <span className="text-ink-soft">{i.name_zh}</span>
                        <span className="ml-auto text-small text-ink-faint">{i.productCount} 份產品</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
                {results.matchedProducts.length > 0 && (
                  <Command.Group heading={<GroupLabel>產品</GroupLabel>}>
                    {results.matchedProducts.map((p) => {
                      const color = CATEGORY_META[p.category]?.color ?? "#181D2E";
                      return (
                        <Command.Item
                          key={p.id}
                          value={`prod-${p.id}`}
                          onSelect={() => go(`/product/${p.id}`)}
                          className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-[15px] text-ink aria-selected:bg-paper-2"
                        >
                          <FileText size={16} className="shrink-0 text-ink-faint" aria-hidden="true" />
                          <span className="min-w-0 flex-1 truncate">
                            <span className="font-medium">{p.product_name_zh || p.product_name}</span>
                            <span className="ml-2 text-small text-ink-faint">
                              {p.insurer} {p.insurer_zh}
                            </span>
                          </span>
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold"
                            style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, color }}
                          >
                            {categories.find((c) => c.id === p.category)?.name_zh ?? p.category}
                          </span>
                        </Command.Item>
                      );
                    })}
                  </Command.Group>
                )}
              </Command.List>
              <div className="flex items-center gap-4 border-t px-5 py-2.5 text-[11px] text-ink-faint" style={{ borderColor: "var(--line)" }}>
                <span className="inline-flex items-center gap-1"><LayoutGrid size={11} /> ↑↓ 移動</span>
                <span>↵ 前往</span>
                <span className="ml-auto font-grotesk">⌘K 開關</span>
              </div>
            </Command>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="eyebrow block px-3 pb-1 pt-3 text-ink-faint">{children}</span>
  );
}
