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
