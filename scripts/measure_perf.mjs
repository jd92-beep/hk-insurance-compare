#!/usr/bin/env node
/**
 * Optional local perf helper (not a CI gate).
 * Usage: npm run build && npm run preview -- --port 4173
 *        node scripts/measure_perf.mjs [baseUrl]
 * Requires Playwright if available; otherwise prints manual steps.
 */
const base = process.argv[2] || "http://127.0.0.1:4173/";

async function main() {
  let chromium;
  try {
    ({ chromium } = await import("playwright"));
  } catch {
    console.log("Playwright not installed. Manual method:");
    console.log(`1. npm run build && npm run preview`);
    console.log(`2. Open ${base} in Chromium DevTools → Performance`);
    console.log("3. Record cold load + Navbar click to /categories");
    console.log("4. Note FCP and time until Navbar + main skeleton paint");
    process.exit(0);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(base, { waitUntil: "domcontentloaded" });
  const nav = await page.evaluate(() => {
    const n = performance.getEntriesByType("navigation")[0];
    const paints = Object.fromEntries(
      performance.getEntriesByType("paint").map((p) => [p.name, Math.round(p.startTime)]),
    );
    return {
      domContentLoaded: n ? Math.round(n.domContentLoadedEventEnd) : null,
      loadEvent: n ? Math.round(n.loadEventEnd) : null,
      paints,
    };
  });
  console.log("Cold load timing (ms):", JSON.stringify(nav, null, 2));

  const t0 = Date.now();
  await page.click('a[href="/categories"]');
  await page.waitForSelector("main#main-content", { state: "attached" });
  await page
    .waitForFunction(() => {
      const main = document.querySelector("main#main-content");
      return !!main && (main.textContent || "").length > 0;
    }, { timeout: 5000 })
    .catch(() => undefined);
  console.log("SPA click /categories → main has content (ms):", Date.now() - t0);

  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
