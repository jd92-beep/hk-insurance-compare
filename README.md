# 保險格價站 HK InsureCompare

香港保險產品比較網站 — 一站式比較 9 大保險類別、101 份真實保單、34 間保險公司。

**所有數據來自保險公司官方文件**（產品冊子、保單條款、保費表 PDF），每個產品附官方來源連結，並設逐條引文系統（文件名 + 頁碼 + 原文句子，一撳直達官方出處，共 939 條引文）。

## 功能

- **9 大保險類別**：家居、旅遊、人壽、危疾、意外、醫療（自願醫保）、汽車、家傭、寵物
- **類別比較表**：篩選（保險公司／有無公開保費）、排序（保費年繳化排序）、表格⇄卡片切換、行展開詳情
- **101 個產品詳情頁**：保障上限、保費、計劃層級、主要條款、不保事項、資料出處（逐條引文）、官方來源
- **比較工具**：2–3 份產品並排對照，canonical 保障項目對齊、最高賠償高亮、可分享連結
- **自願醫保認可產品名單**（`/vhis`）：涵蓋 vhis.gov.hk 全部 33 份標準計劃 + 70 份靈活計劃（103 個認可產品），附官方條款及保費表連結；醫療類別 28 間產品提供者全部有官方標準保費
- **全域搜尋**（⌘K）、保險公司名錄、投保指南（詞彙表 + FAQ）、數據方法說明
- 全站繁體中文（香港用語）

## 技術棧

React 19 · TypeScript · Vite 7 · Tailwind CSS 3.4 · shadcn/ui · GSAP (ScrollTrigger) · Framer Motion · Lenis · cmdk

## 本地開發

```bash
npm install
npm run dev
npm run build
```

## 部署

託管於 Cloudflare Pages（Git 整合，push 上 `master` 自動 build + 部署）：
- 正式網域：https://insurance.tommychu2025.dpdns.org
- 後備：https://hk-insurance-compare-ejh.pages.dev
Build：`npm run build`，輸出 `dist/`；SPA 路由靠 `public/_redirects`。

數據檔：
- `public/data/insurance-data.json`（101 產品結構化數據 + 引文）
- `public/data/vhis-plans.json`（自願醫保認可產品名單，由 `scripts/build_vhis.py` 從 vhis.gov.hk 官方公開數據生成：`python3 scripts/build_vhis.py`）

## 免責聲明

本網站資料僅供參考，所有保障內容、保費及條款以保險公司官方文件為準。投保前請向持牌保險中介人或保險公司查詢。資料快照日期：2026-09-02。
