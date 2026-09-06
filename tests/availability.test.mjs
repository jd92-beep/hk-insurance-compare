import { test } from 'node:test';
import assert from 'node:assert/strict';
import { purchaseUrl } from '../src/lib/product-availability.ts';
test('archived AIG direct sales cannot regain a buy CTA through a fallback URL',()=>{
  assert.equal(purchaseUrl({id:'travel-aig',official_buy_url:'https://www.aig.com.hk/buy',promo:{buy_url:'https://old.example.test'}}),undefined);
  assert.equal(purchaseUrl({id:'other',source_urls:['https://example.test/brochure.pdf']}),undefined);
  assert.equal(purchaseUrl({id:'other',official_buy_url:'javascript:alert(1)'}),undefined);
  assert.equal(purchaseUrl({id:'other',official_buy_url:'https://example.test/buy'}),'https://example.test/buy');
});
