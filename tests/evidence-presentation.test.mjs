import { test } from 'node:test';
import assert from 'node:assert/strict';
import { presentationRows, EVIDENCE_PREVIEW_LIMIT } from '../src/lib/evidence-presentation.ts';
test('overview uses a stable six-row prefix without ranking or dropping unknown evidence',()=>{
 const rows=Array.from({length:12},(_,i)=>({id:i,status:i%2?'missing':'numeric'}));
 assert.equal(EVIDENCE_PREVIEW_LIMIT,6);
 assert.deepEqual(presentationRows(rows,false),rows.slice(0,6));
 assert.equal(rows.length,12);
});
test('expanded view preserves every record and the original order',()=>{
 const rows=Array.from({length:35},(_,i)=>({id:i}));
 assert.deepEqual(presentationRows(rows,true),rows);
 assert.deepEqual(presentationRows([],false),[]);
 assert.deepEqual(presentationRows(rows.slice(0,3),false),rows.slice(0,3));
});

import { readFileSync } from 'node:fs';
test('website summaries are not labelled as original policy quotations',()=>{
 const rows=readFileSync('src/components/category/EvidenceRows.tsx','utf8');
 const panel=readFileSync('src/components/category/EvidenceComparisonPanel.tsx','utf8');
 assert.ok(rows.includes('網站摘要'));
 assert.ok(!rows.includes('原文摘要'));
 assert.ok(!panel.includes('對照下方原文'));
});
