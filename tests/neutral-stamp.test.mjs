import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdir, mkdtemp, readFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createElement, Fragment } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
let temporary, StampSealIcon, StampBadge;
before(async () => {
  const cache = resolve('scripts/.cache'); await mkdir(cache, { recursive:true });
  temporary = await mkdtemp(join(cache,'stamp-test-'));
  const output = join(temporary,'components.mjs');
  await build({
    stdin:{ contents:'export { StampSealIcon } from "./src/components/StampSealIcon"; export { default as StampBadge } from "./src/components/StampBadge";', resolveDir:process.cwd(), loader:'tsx' },
    outfile:output, bundle:true, platform:'node', format:'esm', target:'node22', jsx:'automatic',
    external:['react','react/jsx-runtime','framer-motion'], logLevel:'silent',
  });
  ({ StampSealIcon, StampBadge } = await import(pathToFileURL(output).href));
});
after(async () => { if(temporary) await rm(temporary,{recursive:true,force:true}); });

test('several inline seals have distinct IDs and resolve their own text paths',()=>{
  const html=renderToStaticMarkup(createElement(Fragment,null,...Array.from({length:4},(_,key)=>createElement(StampSealIcon,{key}))));
  const ids=[...html.matchAll(/<path[^>]*id="([^"]+)"/g)].map(match=>match[1]);
  const refs=[...html.matchAll(/<textPath[^>]*href="#([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,4); assert.equal(new Set(ids).size,4); assert.deepEqual(refs,ids);
  assert.ok(ids.every(id=>/^seal-[a-z0-9-]+$/i.test(id)));
});
test('rendered and static stamps do not imply verified content or currentness',async()=>{
  const html=renderToStaticMarkup(createElement(StampSealIcon));
  const staticSvg=await readFile('public/stamp-seal.svg','utf8');
  for(const content of [html,staticSvg]) {
    assert.doesNotMatch(content,/\bVERIFIED\b|官方文件核實/);
    assert.match(content,/SOURCE REFERENCE/);
  }
});
test('both stamp variants expose the same neutral accessible purpose',()=>{
  for(const animated of [false,true]) {
    const html=renderToStaticMarkup(createElement(StampBadge,{animated}));
    assert.match(html,/role="img"/);
    assert.match(html,/aria-label="來源參考標記，不代表保障內容或文件版本已核實"/);
  }
});
