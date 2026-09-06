import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { Building2, FileText, LayoutGrid, Search, X } from "lucide-react";
import { useNavigate } from "react-router";
import { useCategories, useInsuranceData, useInsurers, useProducts } from "@/providers/InsuranceDataProvider";
import { useSearch } from "@/providers/SearchProvider";
import { getLenis } from "@/lib/lenis";
import { matchesSearchQuery } from "@/lib/search-query";

/** Real modal semantics, keyboard containment and native scrolling inside search results. */
export default function SearchPalette() {
  const { open, setOpen } = useSearch();
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const input = useRef<HTMLInputElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const navigating = useRef(false);
  const navigate = useNavigate();
  const categories = useCategories(), insurers = useInsurers(), products = useProducts();
  const { loading, error } = useInsuranceData();
  const results = useMemo(() => {
    const matchedCategories = categories.filter(c => matchesSearchQuery(`${c.name_zh} ${c.id}`, deferred));
    const matchedInsurers = insurers.filter(i => matchesSearchQuery(`${i.name} ${i.name_zh}`, deferred));
    const matchedProducts = products.filter(p => matchesSearchQuery(`${p.product_name} ${p.product_name_zh} ${p.insurer} ${p.insurer_zh} ${p.category} ${(p.plan_tiers ?? []).join(" ")}`, deferred));
    return { categories: matchedCategories, insurers: matchedInsurers, products: matchedProducts };
  }, [deferred, categories, insurers, products]);
  const count = results.categories.length + results.insurers.length + results.products.length;
  useEffect(() => {
    if (!open) return;
    const lenis = getLenis();
    const wasStopped = lenis?.isStopped;
    lenis?.stop();
    return () => { if (lenis && getLenis() === lenis && !wasStopped) lenis.start(); };
  }, [open]);
  const go = (to: string) => {
    navigating.current = true;
    setOpen(false); setQuery(""); navigate(to);
  };
  const rowStyle = "flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-sm text-ink aria-selected:bg-jade/10 aria-selected:text-jade";
  return <Dialog.Root open={open} onOpenChange={setOpen} modal>
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-[100] bg-ink/40 backdrop-blur-sm" />
      <Dialog.Content
        className="fixed left-1/2 top-[10dvh] z-[101] w-[calc(100%-2rem)] max-w-[640px] -translate-x-1/2 overflow-hidden rounded-card border bg-paper shadow-lift outline-none"
        style={{ borderColor: "var(--line-strong)" }}
        data-lenis-prevent
        onOpenAutoFocus={event => {
          event.preventDefault();
          navigating.current = false;
          returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          input.current?.focus();
        }}
        onCloseAutoFocus={event => {
          event.preventDefault();
          if (!navigating.current && returnFocus.current?.isConnected) returnFocus.current.focus();
        }}
      >
        <Dialog.Title className="sr-only">搜尋保險產品、公司與類別</Dialog.Title>
        <Dialog.Description className="sr-only">輸入產品或公司名稱，用上下方向鍵選擇，Enter 前往，Escape 關閉。</Dialog.Description>
        <Command label="全域搜尋" shouldFilter={false} loop>
          <div className="flex items-center gap-3 border-b pl-4 pr-2">
            <Search size={18} className="shrink-0 text-ink-faint" aria-hidden="true" />
            <Command.Input ref={input} value={query} onValueChange={setQuery} aria-label="搜尋保險產品或公司" placeholder="例如：旅遊保險、AXA、自願醫保…" className="h-14 min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-faint" />
            <Dialog.Close className="flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-paper-2 focus-visible:ring-2 focus-visible:ring-jade" aria-label="關閉搜尋"><X size={18} /></Dialog.Close>
          </div>
          <p className="border-b px-4 py-2 text-xs text-ink-soft" role="status" aria-live="polite">
            {loading ? "正在載入產品資料…" : error ? "產品資料未能載入；你仍可前往類別頁。" : `${count} 項搜尋結果；產品最多顯示前 12 項。`}
          </p>
          <Command.List className="max-h-[55dvh] overflow-y-auto overscroll-contain p-2" data-lenis-prevent aria-busy={loading || query !== deferred}>
            {!loading && !count && <div className="px-4 py-8 text-center text-sm text-ink-soft">
              <p>搵唔到「{query}」相關結果，試下公司名稱或保險類別。</p>
              <button className="btn-ghost mt-3 min-h-11" onClick={() => { setQuery(""); input.current?.focus(); }}>清除搜尋</button>
            </div>}
            {!!results.categories.length && <Command.Group heading="保險類別" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-ink-faint">
              {results.categories.map(c => <Command.Item key={c.id} value={`cat-${c.id}`} onSelect={() => go(`/category/${encodeURIComponent(c.id)}`)} className={rowStyle}>
                <LayoutGrid size={16} aria-hidden="true" /><span className="min-w-0 flex-1">{c.name_zh}</span><span className="text-xs text-ink-faint">{c.count} 份產品</span>
              </Command.Item>)}
            </Command.Group>}
            {!!results.insurers.length && <Command.Group heading="保險公司" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-ink-faint">
              {results.insurers.slice(0, 6).map(i => <Command.Item key={i.name} value={`ins-${i.name}`} onSelect={() => go(`/insurers#${encodeURIComponent(i.name)}`)} className={rowStyle}>
                <Building2 size={16} aria-hidden="true" /><span className="min-w-0 flex-1">{i.name_zh} <span className="font-grotesk text-ink-soft">{i.name}</span></span><span className="text-xs text-ink-faint">{i.productCount} 份產品</span>
              </Command.Item>)}
            </Command.Group>}
            {!!results.products.length && <Command.Group heading="保險產品" className="[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-ink-faint">
              {results.products.slice(0, 12).map(p => <Command.Item key={p.id} value={`prod-${p.id}`} onSelect={() => go(`/product/${encodeURIComponent(p.id)}`)} className={rowStyle}>
                <FileText size={16} className="shrink-0" aria-hidden="true" /><span className="min-w-0 flex-1"><span className="block leading-relaxed">{p.product_name_zh || p.product_name}</span><span className="text-xs text-ink-faint">{p.insurer_zh} · {categories.find(c => c.id === p.category)?.name_zh ?? p.category}</span></span>
              </Command.Item>)}
            </Command.Group>}
          </Command.List>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2 text-xs text-ink-faint">
            <span>↑↓ 選擇 · Enter 前往 · Esc 關閉</span>
            <button className="min-h-11 rounded px-2 text-jade focus-visible:ring-2 focus-visible:ring-jade" onClick={() => go("/categories")}>瀏覽所有類別</button>
          </div>
        </Command>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>;
}
