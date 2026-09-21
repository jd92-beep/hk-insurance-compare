import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
  Heart,
  Trash2,
  Scale,
  ExternalLink,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import Breadcrumbs from "@/components/Breadcrumbs";
import { useFavorites } from "@/providers/FavoritesProvider";
import { useCompare, COMPARE_LIMIT } from "@/providers/CompareProvider";
import { useInsuranceData } from "@/providers/InsuranceDataProvider";
import { purchaseUrl } from "@/lib/product-availability";
import { quotePathway } from "@/lib/quote-pathway";
import { getInsurerColor } from "@/lib/insurer-colors";
import { DEFAULT_CATEGORIES } from "@/lib/categories";
import { toastCompareToggle, toastFavoriteToggle } from "@/lib/ui-feedback";
import { handleCardClickNavigation } from "@/lib/card-navigation";
import TiltCard from "@/components/fx/TiltCard";
import { cn } from "@/lib/utils";
import type { Product } from "@/types/insurance";

export default function Favorites() {
  const navigate = useNavigate();
  const { favorites, removeFavorite, clearFavorites, count } = useFavorites();
  const { data } = useInsuranceData();
  const compare = useCompare();

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const products = data?.products;

  const categories = data?.categories;

  // 類別名稱對照表
  const categoryNameMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of DEFAULT_CATEGORIES) {
      map.set(c.id, c.name_zh);
    }
    if (categories) {
      for (const c of categories) {
        map.set(c.id, c.name_zh);
      }
    }
    return map;
  }, [categories]);

  // 根據 ID 從快照數據查找產品物件
  const favoriteProducts = useMemo(() => {
    if (!products) return [];
    const productMap = new Map<string, Product>();
    for (const p of products) {
      productMap.set(p.id, p);
    }
    return favorites
      .map((id) => productMap.get(id))
      .filter((p): p is Product => Boolean(p));
  }, [favorites, products]);

  // 取得所有存在的類別供篩選
  const availableCategories = useMemo(() => {
    const cats = new Map<string, { id: string; name: string; count: number }>();
    for (const p of favoriteProducts) {
      const catId = p.category;
      const catName = categoryNameMap.get(catId) || catId;
      const existing = cats.get(catId);
      if (existing) {
        existing.count += 1;
      } else {
        cats.set(catId, { id: catId, name: catName, count: 1 });
      }
    }
    return Array.from(cats.values());
  }, [favoriteProducts, categoryNameMap]);

  // 根據選擇的分類進行過濾
  const filteredProducts = useMemo(() => {
    if (activeCategory === "all") return favoriteProducts;
    return favoriteProducts.filter((p) => p.category === activeCategory);
  }, [favoriteProducts, activeCategory]);

  // 一鍵加入比較
  const handleAddAllToCompare = () => {
    if (filteredProducts.length === 0) return;
    const canAdd = filteredProducts.slice(0, COMPARE_LIMIT);
    compare.replace(canAdd.map((p) => p.id));
    toastCompareToggle(`${canAdd.length} 份最愛計劃`, true);
  };

  return (
    <div className="site-container py-8 md:py-12">
      {/* 麵包屑 */}
      <Breadcrumbs
        items={[
          { label: "首頁", to: "/" },
          { label: "我的最愛" },
        ]}
        className="mb-6"
      />

      {/* 頁面頂部 Header */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-red/30 bg-red-wash text-red shadow-xs">
              <Heart size={22} className="fill-red" />
            </span>
            <h1 className="font-serif text-2xl font-bold text-ink md:text-3xl">
              我的最愛計劃
            </h1>
            <span className="rounded-full bg-paper-2 px-3 py-1 font-grotesk text-xs font-bold text-ink-soft border border-line">
              共 {favoriteProducts.length} 份
            </span>
          </div>
          <p className="mt-2 text-sm text-ink-soft">
            記錄已保存在此瀏覽器，即使關閉分頁亦可隨時查閱。無須註冊，保障個人私隱。
          </p>
        </div>

        {/* 頂部操作按鈕 */}
        {count > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleAddAllToCompare}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line-strong bg-paper px-3.5 py-2 text-xs font-bold text-ink shadow-xs transition-all hover:border-jade hover:bg-jade-wash/30 hover:text-jade"
            >
              <Scale size={14} />
              <span>一鍵加入比較 (前 {Math.min(filteredProducts.length, COMPARE_LIMIT)} 份)</span>
            </button>
            <button
              type="button"
              onClick={() => setShowClearConfirm(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-paper px-3 py-2 text-xs font-bold text-ink-faint transition-colors hover:border-red/40 hover:bg-red-wash/40 hover:text-red"
            >
              <Trash2 size={14} />
              <span>清空所有</span>
            </button>
          </div>
        )}
      </div>

      {/* 清空確認對話框 Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl border border-line bg-paper p-6 shadow-lift">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-wash text-red mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="font-serif text-lg font-bold text-ink">確定清空所有最愛計劃？</h3>
            <p className="mt-2 text-sm text-ink-soft">
              清空後將無法復原瀏覽器中保存的 {count} 份保險計劃。
            </p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl border border-line px-4 py-2 text-xs font-bold text-ink hover:bg-paper-2"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => {
                  clearFavorites();
                  setShowClearConfirm(false);
                }}
                className="rounded-xl bg-red px-4 py-2 text-xs font-bold text-paper transition-opacity hover:opacity-90"
              >
                確認清空
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 分類篩選 Tabs */}
      {count > 0 && availableCategories.length > 1 && (
        <div className="mt-6 flex flex-wrap items-center gap-2 border-b border-line/60 pb-4">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={cn(
              "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all",
              activeCategory === "all"
                ? "bg-ink text-paper shadow-xs"
                : "border border-line bg-paper text-ink-soft hover:border-line-strong hover:text-ink"
            )}
          >
            全部 ({favoriteProducts.length})
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all",
                activeCategory === cat.id
                  ? "bg-ink text-paper shadow-xs"
                  : "border border-line bg-paper text-ink-soft hover:border-line-strong hover:text-ink"
              )}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>
      )}

      {/* 內容區：清單或空狀態 */}
      <div className="mt-8">
        {count === 0 ? (
          /* 空狀態 Empty State */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-paper-2/40 py-16 px-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-line bg-paper shadow-xs">
              <Heart size={30} className="text-ink-faint" />
            </div>
            <h2 className="mt-4 font-serif text-xl font-bold text-ink">
              你仲未收藏任何保險計劃
            </h2>
            <p className="mt-2 max-w-md text-sm text-ink-soft">
              在瀏覽不同保險計劃時，只需點擊卡片右上角的心形按鈕，就可以隨時保存、集中比較最合心意的計劃！
            </p>

            {/* 快速探索熱門類別按鈕 */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/category/medical"
                className="inline-flex items-center gap-1.5 rounded-xl border border-jade/40 bg-jade-wash/30 px-4 py-2.5 text-xs font-bold text-jade hover:bg-jade-wash/60 transition-colors"
              >
                <span>探索自願醫保</span>
                <ChevronRight size={14} />
              </Link>
              <Link
                to="/category/travel"
                className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300/40 bg-sky-50 px-4 py-2.5 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-colors"
              >
                <span>探索旅遊保險</span>
                <ChevronRight size={14} />
              </Link>
              <Link
                to="/category/critical-illness"
                className="inline-flex items-center gap-1.5 rounded-xl border border-purple-300/40 bg-purple-50 px-4 py-2.5 text-xs font-bold text-purple-700 hover:bg-purple-100 transition-colors"
              >
                <span>探索危疾保險</span>
                <ChevronRight size={14} />
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-paper px-4 py-2.5 text-xs font-bold text-ink hover:bg-paper-2 transition-colors"
              >
                <span>瀏覽所有分類</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          /* 該分類無最愛項目 */
          <div className="py-12 text-center text-ink-soft">
            <p className="text-sm">此分類下暫無收藏之計劃。</p>
            <button
              type="button"
              onClick={() => setActiveCategory("all")}
              className="mt-3 text-xs font-bold text-jade hover:underline"
            >
              檢視全部最愛 ({count})
            </button>
          </div>
        ) : (
          /* 最愛產品網格 */
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const highlightColor = getInsurerColor(product.insurer || product.insurer_zh);
              const pathway = quotePathway(product);
              const buyUrl = pathway.buyUrl || purchaseUrl(product);
              const detailHref = `/product/${product.id}`;
              const isCompared = compare.has(product.id);

              return (
                <TiltCard key={product.id} max={8} glare className="h-full rounded-card">
                  <article
                    className="depth-surface group relative flex h-full cursor-pointer flex-col justify-between overflow-hidden rounded-card border border-line bg-paper shadow-xs transition-shadow hover:shadow-lift"
                    onClick={(e) => handleCardClickNavigation(e, detailHref, navigate)}
                  >
                    <div
                      className="h-1.5 depth-z-bar"
                      style={{ background: highlightColor }}
                      aria-hidden="true"
                    />

                    <div className="p-5 md:p-6 flex flex-col justify-between h-full">
                      <div>
                        {/* 公司與頂部操作 */}
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-xs font-semibold text-ink-soft flex items-center gap-1.5">
                            <span
                              className="inline-block h-2 w-2 rounded-full shrink-0"
                              style={{ backgroundColor: highlightColor }}
                            />
                            <span>
                              {product.insurer_zh}{" "}
                              <span className="font-grotesk">{product.insurer}</span>
                            </span>
                          </p>

                          {/* 取消收藏按鈕（心形/垃圾桶切換） */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              removeFavorite(product.id);
                              toastFavoriteToggle(
                                product.product_name_zh || product.product_name,
                                false
                              );
                            }}
                            className="group/btn flex h-8 w-8 items-center justify-center rounded-lg border border-red/30 bg-red-wash/40 text-red transition-all hover:bg-red hover:text-paper"
                            aria-label={`從我的最愛移除 ${product.product_name_zh || product.product_name}`}
                            title="從我的最愛移除"
                          >
                            <Trash2 size={15} className="transition-transform group-hover/btn:scale-110" />
                          </button>
                        </div>

                        {/* 產品標題 */}
                        <h2 className="mt-2 text-lg font-bold leading-snug text-ink">
                          <Link
                            to={detailHref}
                            className="hover:text-jade hover:underline"
                          >
                            {product.product_name_zh || product.product_name}
                          </Link>
                        </h2>

                        {/* 計劃層級與亮點 */}
                        {product.plan_tiers && product.plan_tiers.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {product.plan_tiers.slice(0, 3).map((tier, idx) => (
                              <span
                                key={idx}
                                className="rounded bg-paper-2 border border-line px-1.5 py-0.5 text-[11px] font-medium text-ink-soft"
                              >
                                {tier}
                              </span>
                            ))}
                            {product.plan_tiers.length > 3 && (
                              <span className="rounded bg-paper-2 px-1.5 py-0.5 text-[11px] font-medium text-ink-faint">
                                +{product.plan_tiers.length - 3} 計劃
                              </span>
                            )}
                          </div>
                        )}

                        {/* 參考保費 */}
                        <div className="mt-3.5 rounded-lg border border-line bg-paper-2/60 p-3">
                          <p className="text-[11px] font-bold text-ink-faint">
                            {pathway.headline}
                          </p>
                          <p className="mt-0.5 font-grotesk text-base font-bold text-ink">
                            {pathway.snapshotText || "需往官網即時報價"}
                          </p>
                        </div>
                      </div>

                      {/* 底部按鈕組 */}
                      <div className="mt-5 flex flex-col gap-2 border-t border-line/70 pt-4">
                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            to={detailHref}
                            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-line-strong px-2 py-2 text-center text-xs font-bold text-ink hover:bg-paper-2 transition-colors"
                          >
                            睇計劃詳情
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              compare.toggle(product.id);
                              toastCompareToggle(
                                product.product_name_zh || product.product_name,
                                !isCompared
                              );
                            }}
                            className={cn(
                              "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border px-2 py-2 text-xs font-bold transition-colors",
                              isCompared
                                ? "border-jade bg-jade-wash text-jade"
                                : "border-ink bg-ink text-paper hover:bg-ink-soft"
                            )}
                          >
                            <Scale size={13} />
                            <span>{isCompared ? "已加入比較" : "加入比較"}</span>
                          </button>
                        </div>

                        {/* 官方投保 / 報價 */}
                        {buyUrl && (
                          <a
                            href={buyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center justify-center gap-1 text-xs font-bold text-red hover:underline pt-1"
                          >
                            <span>前往保險公司官方投保 / 報價</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    </div>
                  </article>
                </TiltCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
