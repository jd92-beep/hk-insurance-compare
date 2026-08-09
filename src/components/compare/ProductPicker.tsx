import { useMemo, useState } from "react";
import { Check, Search } from "lucide-react";
import type { Product } from "@/types/insurance";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCategories, useProducts } from "@/providers/InsuranceDataProvider";
import { CATEGORY_META, CATEGORY_ORDER, categoryColor } from "@/lib/categories";
import { cn } from "@/lib/utils";

/**
 * 產品選擇器 modal（compare.md S2）：
 * 搜尋框 + 按類別分組嘅產品清單；已選產品置灰。
 */
export default function ProductPicker({
  open,
  onOpenChange,
  selectedIds,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** 已在比較欄嘅產品 id（置灰顯示） */
  selectedIds: string[];
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const products = useProducts();
  const categories = useCategories();

  const grouped = useMemo(() => {
    const q = query.trim().toLowerCase();
    const match = (p: Product) =>
      q === "" ||
      p.insurer.toLowerCase().includes(q) ||
      p.insurer_zh.toLowerCase().includes(q) ||
      p.product_name.toLowerCase().includes(q) ||
      p.product_name_zh.toLowerCase().includes(q);
    const byCat = new Map<string, Product[]>();
    for (const p of products) {
      if (!match(p)) continue;
      const list = byCat.get(p.category) ?? [];
      list.push(p);
      byCat.set(p.category, list);
    }
    return CATEGORY_ORDER.filter((id) => byCat.has(id)).map((id) => ({
      id,
      name: categories.find((c) => c.id === id)?.name_zh ?? id,
      products: byCat.get(id) ?? [],
    }));
  }, [products, categories, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[85vh] w-[calc(100%-32px)] max-w-[640px] flex-col gap-0 overflow-hidden rounded-card border bg-paper p-0"
        style={{ borderColor: "var(--line)" }}
      >
        <DialogHeader className="border-b px-6 pb-4 pt-6 text-left" style={{ borderColor: "var(--line)" }}>
          <DialogTitle className="font-serif text-[22px] font-bold text-ink">
            加入產品並排對照
          </DialogTitle>
          <DialogDescription className="text-small text-ink-soft">
            全部 {products.length} 份產品檔案，搜尋公司或產品名即時篩選。
          </DialogDescription>
        </DialogHeader>

        <div className="border-b px-6 py-3" style={{ borderColor: "var(--line)" }}>
          <label className="flex items-center gap-2.5 rounded-[10px] border bg-paper-2 px-3.5 py-2.5" style={{ borderColor: "var(--line)" }}>
            <Search size={16} className="shrink-0 text-ink-faint" />
            <input
              autoFocus
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜尋產品或保險公司…"
              className="w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-faint"
              aria-label="搜尋產品"
            />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {grouped.length === 0 && (
            <p className="px-3 py-10 text-center text-small text-ink-faint">
              搵唔到「{query}」相關產品。
            </p>
          )}
          {grouped.map((group) => {
            const color = categoryColor(group.id);
            const icon = CATEGORY_META[group.id]?.icon;
            return (
              <section key={group.id} className="mb-2">
                <h3
                  className="sticky top-0 flex items-center gap-2 bg-paper px-3 py-2 text-small font-bold"
                  style={{ color }}
                >
                  <span
                    className="cat-icon h-4 w-4"
                    style={{
                      color,
                      WebkitMaskImage: `url(${icon ?? "/cat-home.svg"})`,
                      maskImage: `url(${icon ?? "/cat-home.svg"})`,
                    }}
                    aria-hidden="true"
                  />
                  {group.name}
                  <span className="font-grotesk font-medium text-ink-faint">{group.products.length}</span>
                </h3>
                <ul className="flex flex-col">
                  {group.products.map((p) => {
                    const selected = selectedIds.includes(p.id);
                    return (
                      <li key={p.id}>
                        <button
                          type="button"
                          disabled={selected}
                          onClick={() => {
                            onSelect(p.id);
                            onOpenChange(false);
                            setQuery("");
                          }}
                          className={cn(
                            "flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-2.5 text-left transition-colors",
                            selected ? "cursor-default opacity-45" : "hover:bg-paper-2",
                          )}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-[14.5px] font-medium text-ink">
                              {p.product_name_zh || p.product_name}
                            </span>
                            <span className="block truncate text-small text-ink-faint">
                              <span className="font-grotesk">{p.insurer}</span>
                              <span className="ml-1.5">{p.insurer_zh}</span>
                            </span>
                          </span>
                          {selected ? (
                            <span className="chip shrink-0 bg-jade-wash font-bold text-jade">
                              <Check size={12} />
                              已加入
                            </span>
                          ) : (
                            !p.premium_available && (
                              <span className="chip shrink-0 bg-amber-wash text-amber">官網即時報價</span>
                            )
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
