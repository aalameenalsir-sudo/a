import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => fs.readFileSync(p,'utf8');

const adminScripts = [
  'admin/store-dashboard.js','admin/store-orders-live.js','admin/store-products-live.js',
  'admin/store-customers.js','admin/store-coupons.js','admin/store-payments.js',
  'admin/store-returns.js','admin/store-reviews-admin.js','admin/store-abandoned.js',
  'admin/store-reports.js','admin/store-settings.js'
];

test('every store admin data page enforces admin guard',()=>{
  for (const p of adminScripts) assert.match(read(p), /ASolutionAdmin\.guard\s*\(/, p);
});

test('store admin redirects unauthenticated users to the admin login',()=>{
  const s=read('admin/store-admin.js');
  assert.match(s,/loginTarget/);
  assert.match(s,/location\.replace/);
});

test('store admin provides HTML escaping for untrusted database values',()=>{
  const s=read('admin/store-admin.js');
  assert.match(s,/function escapeHTML/);
  for (const p of adminScripts.filter(x=>x!=='admin/store-settings.js')) {
    const src=read(p);
    if (src.includes('innerHTML')) assert.match(src,/ASolutionAdmin\.escapeHTML|\besc\(/, `${p} renders HTML without shared escaping`);
  }
});

test('dashboard metrics are not limited to the recent 20 orders',()=>{
  const s=read('admin/store-dashboard.js');
  assert.doesNotMatch(s,/commerce_orders[^\n]*limit=20/);
});

test('orders admin can update both payment and fulfillment status',()=>{
  const html=read('admin/store-orders.html');
  const js=read('admin/store-orders-live.js');
  assert.match(html,/Payment status/);
  assert.match(js,/payment_status/);
  assert.match(js,/fulfillment_status/);
});

test('products admin has save controls for catalog operations',()=>{
  const html=read('admin/store-products.html');
  const js=read('admin/store-products-live.js');
  assert.match(html,/Action/);
  assert.match(js,/data-save/);
  assert.match(js,/method:\s*['"]PATCH['"]/);
});

test('coupons can be enabled or disabled by admin',()=>{
  const html=read('admin/store-coupons.html');
  const js=read('admin/store-coupons.js');
  assert.match(html,/Action/);
  assert.match(js,/active/);
  assert.match(js,/method:\s*['"]PATCH['"]/);
});
