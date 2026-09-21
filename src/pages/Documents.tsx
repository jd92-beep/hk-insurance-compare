import { lazy, Suspense, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Check, Copy, ExternalLink, FileText, Layers, Search } from "lucide-react";
import { useCategories, useInsuranceData, useProducts } from "@/providers/InsuranceDataProvider";
import { categoryName, CATEGORY_ORDER } from "@/lib/categories";
import { evidenceEntries, evidenceHref, resolveEvidence, sourceTarget } from "@/lib/pdf-evidence";

const PdfEvidenceViewer = lazy(() => import("@/components/documents/PdfEvidenceViewer"));

export default function Documents() {
  const products = useProducts();
  const categories = useCategories();
  const { loading, error } = useInsuranceData();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  const requested = params.get("product");

  // 1. 根據 URL requested 找到對應產品
  const currentProduct = useMemo(() => {
    if (requested) {
      const found = products.find((p) => p.id === requested);
      if (found) return found;
    }
    return products[0];
  }, [products, requested]);

  // 2. 第一級：保險類別 (Category)
  const [userCategory, setUserCategory] = useState<string | null>(null);
  const selectedCategory = userCategory ?? currentProduct?.category ?? "all";

  // 所有具備產品的類別清單
  const availableCategories = useMemo(() => {
    const set = new Set(products.map((p) => p.category));
    return CATEGORY_ORDER.filter((cat) => set.has(cat));
  }, [products]);

  // 3. 第二級：保險公司 (Insurer) —— 依據選中的 Category 動態計算
  const availableInsurers = useMemo(() => {
    const list =
      selectedCategory === "all"
        ? products
        : products.filter((p) => p.category === selectedCategory);
    const map = new Map<string, { insurer: string; insurer_zh: string; count: number }>();
    for (const p of list) {
      const key = p.insurer || p.insurer_zh;
      if (!map.has(key)) {
        map.set(key, { insurer: p.insurer, insurer_zh: p.insurer_zh, count: 1 });
      } else {
        map.get(key)!.count++;
      }
    }
    return Array.from(map.values()).sort((a, b) =>
      a.insurer_zh.localeCompare(b.insurer_zh, "zh-Hant-HK")
    );
  }, [products, selectedCategory]);

  const [userInsurer, setUserInsurer] = useState<string | null>(null);
  const selectedInsurer = useMemo(() => {
    if (userInsurer && availableInsurers.some((i) => i.insurer === userInsurer)) {
      return userInsurer;
    }
    if (currentProduct && availableInsurers.some((i) => i.insurer === currentProduct.insurer)) {
      return currentProduct.insurer;
    }
    return availableInsurers[0]?.insurer ?? "";
  }, [userInsurer, availableInsurers, currentProduct]);

  // 4. 第三級：該公司在該類別下的產品清單
  const categoryProductsForInsurer = useMemo(() => {
    if (!selectedInsurer) return [];
    return products.filter(
      (p) =>
        (selectedCategory === "all" || p.category === selectedCategory) &&
        (p.insurer === selectedInsurer || p.insurer_zh === selectedInsurer)
    );
  }, [products, selectedCategory, selectedInsurer]);

  // 5. 最終生效產品 (Effective Product)
  const product = useMemo(() => {
    if (categoryProductsForInsurer.length === 1) {
      return categoryProductsForInsurer[0];
    }
    if (categoryProductsForInsurer.length > 1) {
      const found = categoryProductsForInsurer.find((p) => p.id === requested);
      return found ?? categoryProductsForInsurer[0];
    }
    return currentProduct ?? products[0];
  }, [categoryProductsForInsurer, requested, currentProduct, products]);

  // 事件處理：切換類別
  const handleCategoryChange = (newCat: string) => {
    setUserCategory(newCat);
    setNotice("");
    const list =
      newCat === "all" ? products : products.filter((p) => p.category === newCat);
    if (list.length > 0) {
      const firstInsurer = list[0].insurer || list[0].insurer_zh;
      setUserInsurer(firstInsurer);
      const companyProducts = list.filter(
        (p) => p.insurer === firstInsurer || p.insurer_zh === firstInsurer
      );
      if (companyProducts.length > 0) {
        setParams({ product: companyProducts[0].id });
      }
    }
  };

  // 事件處理：切換保險公司
  const handleInsurerChange = (newIns: string) => {
    setUserInsurer(newIns);
    setNotice("");
    const companyProducts = products.filter(
      (p) =>
        (selectedCategory === "all" || p.category === selectedCategory) &&
        (p.insurer === newIns || p.insurer_zh === newIns)
    );
    if (companyProducts.length > 0) {
      setParams({ product: companyProducts[0].id });
    }
  };

  // 事件處理：切換產品
  const handleProductChange = (newProductId: string) => {
    setParams({ product: newProductId });
    setNotice("");
  };

  // 搜尋過濾輔助
  const filteredBySearch = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.toLowerCase().trim();
    return products.filter((p) =>
      `${p.product_name_zh} ${p.insurer_zh} ${p.product_name} ${p.insurer}`
        .toLowerCase()
        .includes(q)
    );
  }, [products, search]);

  const entries = useMemo(() => (product ? evidenceEntries(product) : []), [product]);
  const resolved = product ? resolveEvidence(product, params) : { status: "missing" as const };
  const selected = params.has("entry")
    ? resolved.entry
    : entries.find((entry) => sourceTarget(entry.url)?.local) ?? entries[0];
  const target = selected ? sourceTarget(selected.url, selected.page) : null;
  const repeated = selected?.quote
    ? new Set(entries.filter((e) => e.quote === selected.quote && e.kind === "coverage").map((e) => e.item)).size
    : 0;
  const groupLabels = { coverage: "保障項目", citation: "條款引用", source: "其他來源" };

  const copy = async () => {
    if (!product || !selected) return;
    try {
      await navigator.clipboard.writeText(
        new URL(evidenceHref(product.id, selected), location.origin).href
      );
      setNotice("已複製包含引用指紋嘅連結。");
    } catch {
      setNotice("未能複製，請從瀏覽器網址列複製連結。");
    }
  };

  return (
    <div className="site-container py-10 md:py-16">
      <div className="mb-8 max-w-3xl">
        <p className="eyebrow text-jade">PDF 中心 · SOURCE LIBRARY</p>
        <h1 className="mt-3 font-serif text-4xl font-bold leading-tight md:text-5xl">
          原文，逐條對照。
        </h1>
        <p className="mt-4 leading-relaxed text-ink-soft">
          由保障摘要去到來源頁碼核對原文。鏡像係本站副本，唔代表保險公司最新版本。
        </p>
      </div>

      {loading && <p role="status">正在載入文件目錄…</p>}
      {error && <p role="alert">{error}</p>}

      <div className="grid grid-cols-1 items-start gap-6 fold:grid-cols-[minmax(13rem,32%)_minmax(0,1fr)] lg:grid-cols-[minmax(18rem,340px)_minmax(0,1fr)]">
        <aside className="min-w-0 rounded-2xl border border-line bg-paper p-4 shadow-xs">
          {/* 搜尋輔助 */}
          <div className="mb-4">
            <label
              className="mb-1.5 flex items-center gap-2 text-xs font-bold text-ink-soft"
              htmlFor="document-search"
            >
              <Search size={14} />
              快速搜尋產品或公司
            </label>
            <input
              id="document-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="min-h-10 w-full rounded-lg border border-line bg-paper px-3 text-xs outline-none focus:border-jade"
              placeholder="例如：自願醫保、宏利、AXA"
            />
          </div>

          {/* 若處於搜尋狀態，展示搜尋結果 */}
          {filteredBySearch !== null ? (
            <div className="mb-4">
              <p className="text-xs font-bold text-ink-soft mb-2">
                搜尋結果 ({filteredBySearch.length})
              </p>
              <div className="max-h-48 overflow-y-auto space-y-1">
                {filteredBySearch.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setParams({ product: p.id });
                      setUserCategory(p.category);
                      setUserInsurer(p.insurer || p.insurer_zh);
                      setSearch("");
                      setNotice("");
                    }}
                    className="w-full text-left p-2 rounded text-xs hover:bg-paper-2 border border-transparent hover:border-line flex flex-col cursor-pointer"
                  >
                    <span className="font-bold text-ink">{p.product_name_zh}</span>
                    <span className="text-ink-faint">{p.insurer_zh} · {categoryName(categories, p.category)}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* 正常三級階梯式級聯聯動 */
            <div className="space-y-3.5 border-b border-line pb-4 mb-4">
              {/* 第 1 級：保險類別 */}
              <div>
                <label
                  htmlFor="document-category"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink"
                >
                  <Layers size={13} className="text-jade" />
                  第 1 步：選擇保險類別
                </label>
                <select
                  id="document-category"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="min-h-10 w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  <option value="all">全部保險類別</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {categoryName(categories, cat)}
                    </option>
                  ))}
                </select>
              </div>

              {/* 第 2 級：保險公司 */}
              <div>
                <label
                  htmlFor="document-insurer"
                  className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-ink"
                >
                  <span className="text-jade font-grotesk font-black text-xs">②</span>
                  第 2 步：選擇保險公司
                </label>
                <select
                  id="document-insurer"
                  value={selectedInsurer}
                  onChange={(e) => handleInsurerChange(e.target.value)}
                  className="min-h-10 w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink"
                >
                  {availableInsurers.map((ins) => (
                    <option key={ins.insurer} value={ins.insurer}>
                      {ins.insurer_zh} ({ins.insurer}) · {ins.count} 份產品
                    </option>
                  ))}
                </select>
              </div>

              {/* 第 3 級：保險產品 */}
              <div>
                <div className="mb-1.5 flex items-center justify-between text-xs font-bold text-ink">
                  <span className="flex items-center gap-1.5">
                    <span className="text-jade font-grotesk font-black text-xs">③</span>
                    第 3 步：保險產品
                  </span>
                  {categoryProductsForInsurer.length === 1 && (
                    <span className="rounded bg-jade-wash px-1.5 py-0.5 text-[10px] font-bold text-jade flex items-center gap-1">
                      <Check size={10} /> 自動選中唯一產品
                    </span>
                  )}
                </div>

                {categoryProductsForInsurer.length > 1 ? (
                  <select
                    id="document-product"
                    value={product?.id ?? ""}
                    onChange={(e) => handleProductChange(e.target.value)}
                    className="min-h-10 w-full rounded-lg border border-line bg-paper px-3 py-1.5 text-xs font-bold text-jade"
                  >
                    {categoryProductsForInsurer.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.product_name_zh}
                      </option>
                    ))}
                  </select>
                ) : categoryProductsForInsurer.length === 1 ? (
                  <div className="rounded-lg border border-jade/30 bg-jade-wash/30 p-2.5 text-xs">
                    <p className="font-bold text-ink line-clamp-1">
                      {categoryProductsForInsurer[0].product_name_zh}
                    </p>
                    <p className="text-[11px] text-ink-faint mt-0.5">
                      該公司於此類別僅有此綜合計劃，已為您自動載入。
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-ink-faint">此組合暫無產品</p>
                )}
              </div>
            </div>
          )}

          {/* 下方條款引用項目列表 */}
          <div className="flex items-center justify-between text-xs font-bold text-ink-soft mb-2">
            <span>條款及保障引用 ({entries.length})</span>
            <span className="text-ink-faint">點擊切換 PDF 頁碼</span>
          </div>

          <div
            className="max-h-72 overflow-y-auto space-y-1.5 lg:max-h-[28rem] pr-1"
            data-lenis-prevent
          >
            {entries.map((entry) => (
              <button
                key={`${entry.kind}-${entry.index}`}
                onClick={() => {
                  setParams(
                    new URLSearchParams(evidenceHref(product.id, entry).split("?")[1])
                  );
                  setNotice("");
                }}
                aria-current={selected?.fingerprint === entry.fingerprint ? "true" : undefined}
                className={`w-full rounded-xl border p-2.5 text-left text-xs transition-all cursor-pointer ${
                  selected?.fingerprint === entry.fingerprint
                    ? "border-jade bg-jade/10 shadow-xs"
                    : "border-line/60 bg-paper hover:border-line-strong hover:bg-paper-2"
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-[10px] uppercase text-jade">
                    {groupLabels[entry.kind]}
                  </span>
                  <span className="font-grotesk text-[10px] text-ink-faint">
                    {entry.page ? `PDF P.${entry.page}` : "頁碼未標註"}
                  </span>
                </div>
                <span className="block font-medium text-ink line-clamp-2 leading-relaxed">
                  {entry.item}
                </span>
              </button>
            ))}
            {!loading && entries.length === 0 && (
              <p className="p-3 text-xs text-ink-faint">
                未有可安全開啟嘅來源，唔會代填文件。
              </p>
            )}
          </div>
        </aside>

        {/* 右側 PDF 閱讀器與摘錄詳情 */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-line bg-paper">
          {product && (
            <div className="border-b border-line p-5">
              <Link
                to={`/product/${product.id}`}
                className="text-sm font-bold text-jade hover:underline flex items-center gap-1.5"
              >
                <span>{product.insurer_zh} · {product.product_name_zh}</span>
                <span className="text-xs">→ 前往產品詳情</span>
              </Link>
              {selected && (
                <>
                  <h2 className="mt-2 font-serif text-xl font-bold text-ink">{selected.item}</h2>
                  <p className="mt-1 text-sm text-ink-soft">{selected.limit}</p>
                </>
              )}
              {repeated > 1 && (
                <p role="note" className="mt-3 rounded-lg bg-amber/10 p-3 text-xs text-ink">
                  同一摘錄用於 {repeated} 項保障，需逐項覆核；高亮成功唔代表呢項保障已獲證實。
                </p>
              )}
              {selected?.quote && (
                <details className="mt-3 text-xs">
                  <summary className="cursor-pointer py-1.5 font-semibold text-ink-soft hover:text-ink">
                    查看待核對摘錄
                  </summary>
                  <blockquote className="max-h-40 overflow-auto border-l-2 border-jade pl-3 py-1 text-ink leading-relaxed bg-paper-2/50 rounded-r">
                    {selected.quote}
                  </blockquote>
                </details>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {target && (
                  <a
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-ink hover:bg-paper-2"
                    href={`${target.url}${target.local ? `#page=${target.page}` : ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span>{target.local ? "鏡像原檔" : "官方來源網站"}</span>
                    <ExternalLink size={12} />
                  </a>
                )}
                {selected && (
                  <button
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-bold text-ink hover:bg-paper-2 cursor-pointer"
                    onClick={copy}
                  >
                    <Copy size={12} />
                    <span>複製條款連結</span>
                  </button>
                )}
              </div>
              {notice && <p role="status" className="text-xs text-jade mt-2">{notice}</p>}
            </div>
          )}

          {requested && !product && !loading && (
            <p role="alert" className="p-6 text-sm text-red">
              搵唔到連結指定嘅產品。請重新選擇，本站不會自動打開另一款產品代替。
            </p>
          )}
          {product && params.has("entry") && !selected && (
            <p role="alert" className="p-6 text-sm text-ink-soft">
              {resolved.status === "changed"
                ? "引用內容已經改變。為免連錯條款，請從左方重新選擇。"
                : "此引用不存在，請重新選擇。"}
            </p>
          )}
          {target?.local ? (
            <div className="flex h-[75dvh] min-h-[440px] flex-col">
              <Suspense
                fallback={<p role="status" className="p-6 text-sm text-ink-faint">正在載入 PDF 閱讀器…</p>}
              >
                <PdfEvidenceViewer url={target.url} page={target.page} quote={selected?.quote} />
              </Suspense>
            </div>
          ) : (
            selected && (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 p-6 text-center text-ink-soft">
                <FileText size={32} />
                <p className="text-sm">此引用只有外部來源，未有可核對嘅本地 PDF。請直接到來源網站查看。</p>
              </div>
            )
          )}
        </section>
      </div>
    </div>
  );
}
