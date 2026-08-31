import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('production surfaces exist in both languages',()=>{
  for(const f of ['store/login.html','ar/store/login.html','store/wishlist.html','ar/store/wishlist.html','store/track.html','ar/store/track.html','store/reviews.html','ar/store/reviews.html','admin/store-dashboard.html','admin/store-customers.html','admin/store-coupons.html','admin/store-reports.html','admin/store-settings.html']) assert.ok(fs.existsSync(path.join(root,f)),f);
});

test('store app exposes search wishlist coupon and remote sync hooks',()=>{
  const s=read('store/store-app.js');
  for(const token of ['data-search','wishlist','coupon','ASolutionRemote']) assert.match(s,new RegExp(token,'i'));
});

test('checkout uses trusted remote order API with fallback messaging',()=>{
  const s=read('store/checkout.js');
  assert.match(s,/createOrder/i);
  assert.match(s,/ASolutionRemote/);
});

test('white label configuration covers branding commerce contact and integrations',()=>{
  const s=read('store/store-config.js');
  for(const token of ['brand','commerce','contact','integrations','supabase','payment']) assert.match(s,new RegExp(token));
});

test('commerce SQL is namespaced to avoid existing A Solution table collisions',()=>{
  const s=read('supabase/commerce-production.sql');
  for(const table of ['commerce_products','commerce_orders','commerce_order_items','commerce_customers','commerce_coupons','commerce_reviews','commerce_wishlists']) assert.match(s,new RegExp(table));
});
