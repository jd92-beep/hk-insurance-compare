import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Scale, Search, X } from "lucide-react";
import { Link, useLocation } from "react-router";
import { useCategories } from "@/providers/InsuranceDataProvider";
import { useCompare } from "@/providers/CompareProvider";
import { useSearch } from "@/providers/SearchProvider";
import { CATEGORY_META } from "@/lib/categories";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "首頁", to: "/", match: (p: string) => p === "/" },
  { label: "保險類別", to: "/categories", match: (p: string) => p.startsWith("/categor"), mega: true },
  { label: "比較工具", to: "/compare", match: (p: string) => p.startsWith("/compare") },
  { label: "保險公司", to: "/insurers", match: (p: string) => p.startsWith("/insurers") },
  { label: "自願醫保名單", to: "/vhis", match: (p: string) => p.startsWith("/vhis") },
  { label: "投保指南", to: "/guides", match: (p: string) => p.startsWith("/guides") },
  { label: "關於數據", to: "/about", match: (p: string) => p.startsWith("/about") },
];

/** 全站 Navbar（§7.1）：sticky top-0，普通文檔流，頁面唔使自己留位 */
export default function Navbar() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerCatsOpen, setDrawerCatsOpen] = useState(false);
  const categories = useCategories();
  const compare = useCompare();
  const search = useSearch();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 換頁時關閉抽屜／mega menu
  useEffect(() => {
    setDrawerOpen(false);
    setMegaOpen(false);
  }, [location.pathname]);

  // 抽屜開啟時鎖 body 滾動
  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-[72px] transition-all duration-300",
        scrolled && "border-b bg-paper/80 backdrop-blur-[12px]",
      )}
      style={scrolled ? { borderColor: "var(--line)" } : { borderColor: "transparent" }}
    >
      <div className="site-container flex h-full items-center justify-between gap-4">
        {/* 左：品牌 */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5" aria-label="保險格價站首頁">
          <img src="/logo-mark.svg" alt="" width={28} height={28} />
          <span className="font-serif text-[18px] font-bold text-ink">保險格價站</span>
        </Link>

        {/* 中：桌面導航 */}
        <nav className="hidden items-center gap-1 min-[900px]:flex" aria-label="主導航">
          {NAV_LINKS.map((link) => {
            const active = link.match(location.pathname);
            const item = (
              <Link
                to={link.to}
                className={cn(
                  "relative flex items-center gap-1 px-3 py-2 text-[15px] font-medium transition-colors",
                  active ? "text-red" : "text-ink-soft hover:text-ink",
                )}
              >
                {link.label}
                {link.mega && (
                  <ChevronDown
                    size={13}
                    className={cn("transition-transform duration-300", megaOpen && "rotate-180")}
                  />
                )}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-3 -bottom-0.5 h-0.5 bg-red"
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  />
                )}
              </Link>
            );
            if (!link.mega) return <span key={link.to}>{item}</span>;
            return (
              <div
                key={link.to}
                className="relative"
                onMouseEnter={() => setMegaOpen(true)}
                onMouseLeave={() => setMegaOpen(false)}
              >
                {item}
                <AnimatePresence>
                  {megaOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute left-1/2 top-full w-[560px] -translate-x-1/2 pt-3"
                    >
                      <div
                        className="grid grid-cols-3 gap-1 rounded-card border bg-paper p-3 shadow-lift"
                        style={{ borderColor: "var(--line)" }}
                      >
                        {categories.map((c) => {
                          const meta = CATEGORY_META[c.id];
                          return (
                            <Link
                              key={c.id}
                              to={`/category/${c.id}`}
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-paper-2"
                            >
                              <span
                                className="cat-icon h-6 w-6 shrink-0"
                                style={{
                                  color: meta?.color ?? "#181D2E",
                                  WebkitMaskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
                                  maskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
                                }}
                                aria-hidden="true"
                              />
                              <span className="min-w-0">
                                <span className="block truncate text-[14px] font-medium text-ink">
                                  {c.name_zh}
                                </span>
                                <span className="block font-grotesk text-[11px] text-ink-faint">
                                  {c.count} 份產品
                                </span>
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>

        {/* 右：搜尋 + 比較 + 漢堡 */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={search.openSearch}
            className="flex items-center gap-2 rounded-[10px] border px-3 py-2 text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
            style={{ borderColor: "var(--line)" }}
            aria-label="全域搜尋（⌘K）"
          >
            <Search size={16} />
            <kbd className="hidden rounded border bg-paper-2 px-1.5 py-0.5 font-grotesk text-[11px] text-ink-faint min-[900px]:inline" style={{ borderColor: "var(--line)" }}>
              ⌘K
            </kbd>
          </button>
          <Link
            to="/compare"
            className="relative flex items-center rounded-[10px] border px-3 py-2 text-ink-soft transition-colors hover:bg-paper-2 hover:text-ink"
            style={{ borderColor: "var(--line)" }}
            aria-label={`比較托盤（已選 ${compare.items.length} 份產品）`}
          >
            <Scale size={16} />
            <AnimatePresence mode="popLayout">
              {compare.items.length > 0 && (
                <motion.span
                  key={compare.items.length}
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 18 }}
                  className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red px-1 font-grotesk text-[10px] font-bold text-paper"
                >
                  {compare.items.length}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center rounded-[10px] border px-3 py-2 text-ink min-[900px]:hidden"
            style={{ borderColor: "var(--line)" }}
            aria-label="開啟選單"
          >
            <Menu size={18} />
          </button>
        </div>
      </div>

      {/* Mobile 全屏抽屜 */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            key="nav-drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.76, 0, 0.24, 1] }}
            className="fixed inset-0 z-[70] flex flex-col bg-paper min-[900px]:hidden"
          >
            <div className="site-container flex h-[72px] shrink-0 items-center justify-between">
              <span className="flex items-center gap-2.5">
                <img src="/logo-mark.svg" alt="" width={28} height={28} />
                <span className="font-serif text-[18px] font-bold">保險格價站</span>
              </span>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="rounded-[10px] border px-3 py-2"
                style={{ borderColor: "var(--line)" }}
                aria-label="關閉選單"
              >
                <X size={18} />
              </button>
            </div>
            <nav className="site-container flex flex-1 flex-col gap-1 overflow-y-auto py-6" aria-label="流動導航">
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.to}
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  {link.mega ? (
                    <div>
                      <button
                        type="button"
                        onClick={() => setDrawerCatsOpen((v) => !v)}
                        className="flex w-full items-center justify-between border-b py-4 font-serif text-[24px] font-bold text-ink"
                        style={{ borderColor: "var(--line)" }}
                      >
                        {link.label}
                        <ChevronDown
                          size={20}
                          className={cn("transition-transform duration-300", drawerCatsOpen && "rotate-180")}
                        />
                      </button>
                      <AnimatePresence initial={false}>
                        {drawerCatsOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.35, ease: [0.76, 0, 0.24, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-2 gap-1 py-3">
                              <Link
                                to="/categories"
                                className="col-span-2 rounded-lg px-3 py-2 text-[15px] font-bold text-red"
                              >
                                全部類別 →
                              </Link>
                              {categories.map((c) => {
                                const meta = CATEGORY_META[c.id];
                                return (
                                  <Link
                                    key={c.id}
                                    to={`/category/${c.id}`}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-[14px] text-ink"
                                  >
                                    <span
                                      className="cat-icon h-5 w-5 shrink-0"
                                      style={{
                                        color: meta?.color ?? "#181D2E",
                                        WebkitMaskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
                                        maskImage: `url(${meta?.icon ?? "/cat-home.svg"})`,
                                      }}
                                      aria-hidden="true"
                                    />
                                    <span className="truncate">{c.name_zh}</span>
                                  </Link>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      to={link.to}
                      className="block border-b py-4 font-serif text-[24px] font-bold text-ink"
                      style={{ borderColor: "var(--line)" }}
                    >
                      {link.label}
                    </Link>
                  )}
                </motion.div>
              ))}
              <motion.button
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                  search.openSearch();
                }}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + NAV_LINKS.length * 0.06, duration: 0.4 }}
                className="mt-4 flex items-center gap-2 text-[15px] font-medium text-ink-soft"
              >
                <Search size={16} /> 搜尋產品或保險公司
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
