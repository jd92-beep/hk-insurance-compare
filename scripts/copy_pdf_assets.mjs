import { cp, mkdir } from 'node:fs/promises';
// PDF.js CMaps/fonts/WASM are same-origin build assets, never a runtime CDN dependency.
await mkdir('public/pdfjs', { recursive: true });
for (const name of ['cmaps', 'standard_fonts', 'wasm']) {
  await cp(`node_modules/pdfjs-dist/${name}`, `public/pdfjs/${name}`, { recursive: true });
}
