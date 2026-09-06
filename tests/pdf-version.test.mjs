import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evidenceEntries } from '../src/lib/pdf-evidence.ts';
const product={id:'test',coverage:[{item:'醫療',limit:'HK$100',source_url:'/docs/brochures/test.pdf',page:1,quote:'Synthetic testing quotation'}]};
test('same URL and quote with different PDF bytes invalidate an old evidence fingerprint',()=>{
 const before=evidenceEntries(product,{'/docs/brochures/test.pdf':'a'.repeat(64)})[0];
 const after=evidenceEntries(product,{'/docs/brochures/test.pdf':'b'.repeat(64)})[0];
 assert.notEqual(before.fingerprint,after.fingerprint);
});

import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { verifyPdfBytes, loadVerifiedPdf, MAX_PDF_BYTES } from '../src/lib/pdf-integrity.ts';
import { PDF_DOCUMENT_HASHES } from '../src/lib/generated/pdf-manifest.ts';
const tiny=new TextEncoder().encode('%PDF-1.7\nSynthetic byte fixture only');
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
test('unchanged bytes pass while replaced or non-PDF payloads fail closed',async()=>{
 await verifyPdfBytes(tiny,digest(tiny));
 await assert.rejects(verifyPdfBytes(new Uint8Array([...tiny,32]),digest(tiny)),/版本不符/);
 await assert.rejects(verifyPdfBytes(new TextEncoder().encode('<html>fallback</html>'),digest(tiny)),/並非 PDF/);
 await assert.rejects(verifyPdfBytes(tiny,''),/指紋/);
});
test('manifest exactly covers the current checked-in mirror corpus',()=>{
 execFileSync(process.execPath,['scripts/build_pdf_manifest.mjs','--check']);
 assert.equal(Object.keys(PDF_DOCUMENT_HASHES).length,81);
});
test('network loading returns the exact verified bytes and forwards cancellation',async t=>{
 const [url,hash]=Object.entries(PDF_DOCUMENT_HASHES)[0];
 const raw=readFileSync(`public${url}`); assert.equal(digest(raw),hash);
 const controller=new AbortController(); let received;
 t.mock.method(globalThis,'fetch',async(input,options)=>{received={input,options};return new Response(raw);});
 const bytes=await loadVerifiedPdf(url,controller.signal);
 assert.deepEqual(Buffer.from(bytes),raw); assert.equal(received.options.signal,controller.signal);
 assert.equal(received.options.mode,'same-origin'); assert.equal(received.input,url);
});
test('unlisted files and aborted requests do not contact a server',async t=>{
 let called=0;t.mock.method(globalThis,'fetch',async()=>{called++;return new Response(tiny);});
 await assert.rejects(loadVerifiedPdf('/docs/brochures/unknown.pdf',new AbortController().signal),/未列入/);
 const c=new AbortController();c.abort();await assert.rejects(loadVerifiedPdf(Object.keys(PDF_DOCUMENT_HASHES)[0],c.signal));
 assert.equal(called,0);
});
test('tampered real mirror is rejected before the PDF renderer receives it',async t=>{
 const url=Object.keys(PDF_DOCUMENT_HASHES)[0];const raw=readFileSync(`public${url}`);
 t.mock.method(globalThis,'fetch',async()=>new Response(Buffer.concat([raw,Buffer.from('changed')])));
 await assert.rejects(loadVerifiedPdf(url,new AbortController().signal),/版本不符/);
});
test('declared oversized responses are cancelled before buffering',async t=>{
 let cancelled=false;const url=Object.keys(PDF_DOCUMENT_HASHES)[0];
 t.mock.method(globalThis,'fetch',async()=>new Response(new ReadableStream({cancel(){cancelled=true;}}),{headers:{'content-length':String(MAX_PDF_BYTES+1)}}));
 await assert.rejects(loadVerifiedPdf(url,new AbortController().signal),/超出/);assert.equal(cancelled,true);
});
