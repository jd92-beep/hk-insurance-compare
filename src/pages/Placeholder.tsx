import { Link } from "react-router";
import Breadcrumbs from "@/components/Breadcrumbs";
import EmptyState from "@/components/EmptyState";

/**
 * 未實作頁面嘅臨時佔位（page agents 會用自己嘅頁面取代）。
 */
export default function Placeholder({
  title,
  description = "呢一頁整緊，好快有得睇。",
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="site-container py-24">
      <Breadcrumbs items={[{ label: "首頁", to: "/" }, { label: title }]} className="mb-8" />
      <h1 className="display-2 mb-10 text-ink">{title}</h1>
      <EmptyState title={`${title}建設中`} description={description} />
      <p className="mt-8">
        <Link to="/" className="font-bold text-red hover:underline">← 返首頁</Link>
      </p>
    </div>
  );
}
