import type { TargetAndTransition } from "framer-motion";
import { CATEGORY_META } from "@/lib/categories";

/** Route → visual theme (curtain tint, doodle, enter choreography). */
export type ThemeKey = "home" | "categories" | "category" | "compare" | "favorites" | "insurers" | "vhis" | "documents" | "guides" | "about" | "product" | "other";

export interface Theme {
  key: ThemeKey;
  label: string;
  tint: string;
  doodle: "sun" | "leaf" | "heart" | "cloud" | "umbrella" | "scale" | "book" | "paper";
}

export function themeFor(path: string): Theme {
  if (path === "/") return { key: "home", label: "陽光首頁", tint: "#F2A71B", doodle: "sun" };
  if (path.startsWith("/categories")) return { key: "categories", label: "保險類別", tint: "#3F9A5B", doodle: "leaf" };
  if (path.startsWith("/category/")) {
    const id = path.split("/")[2] ?? "";
    return { key: "category", label: "比較產品", tint: CATEGORY_META[id]?.color ?? "#3F9A5B", doodle: "leaf" };
  }
  if (path.startsWith("/compare")) return { key: "compare", label: "並排比較", tint: "#4E9EDB", doodle: "scale" };
  if (path.startsWith("/favorites")) return { key: "favorites", label: "我的最愛", tint: "#E4573D", doodle: "heart" };
  if (path.startsWith("/insurer")) return { key: "insurers", label: "保險公司", tint: "#4E9EDB", doodle: "umbrella" };
  if (path.startsWith("/vhis")) return { key: "vhis", label: "自願醫保", tint: "#3F9A5B", doodle: "leaf" };
  if (path.startsWith("/documents")) return { key: "documents", label: "PDF 中心", tint: "#F2A71B", doodle: "paper" };
  if (path.startsWith("/guides")) return { key: "guides", label: "投保指南", tint: "#8A6BC4", doodle: "book" };
  if (path.startsWith("/about") || path.startsWith("/data-quality")) return { key: "about", label: "關於數據", tint: "#F2A71B", doodle: "sun" };
  if (path.startsWith("/product")) return { key: "product", label: "產品詳情", tint: "#3F9A5B", doodle: "cloud" };
  return { key: "other", label: "保險明選", tint: "#F2A71B", doodle: "sun" };
}

/* ───────────────────────── page enter choreography ───────────────────────── */

export function pageMotion(pathname: string): { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition } {
  const k = themeFor(pathname).key;
  const exit = { opacity: 0, transition: { duration: 0.28 } };
  const done = { opacity: 1, x: 0, y: 0, rotateX: 0, rotateY: 0, scale: 1, transition: { delay: 0.32, duration: 0.7, ease: [0.22, 1, 0.36, 1] as const } };
  switch (k) {
    case "compare":
      return { initial: { opacity: 0, x: 60 }, animate: done, exit };
    case "favorites":
      return { initial: { opacity: 0, scale: 0.94 }, animate: done, exit };
    case "documents":
      return { initial: { opacity: 0, rotateX: 8, y: -30, transformPerspective: 1600 }, animate: done, exit };
    case "guides":
      return { initial: { opacity: 0, rotateY: -10, x: -40, transformPerspective: 1600 }, animate: done, exit };
    case "insurers":
      return { initial: { opacity: 0, y: 50 }, animate: done, exit };
    default:
      return { initial: { opacity: 0, y: 24 }, animate: done, exit };
  }
}

