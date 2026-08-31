import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const read = p => fs.readFileSync(path.join(root,p),'utf8');

const expectedVisuals = [
  'marketing.svg','web.svg','technology.svg','brand.svg','events.svg','consulting.svg','media.svg',
  'web-launch.svg','commerce.svg','brand-system.svg','growth.svg','crm.svg','social.svg'
];

test('approved English storefront visual structure is present',()=>{
  const html = read('store/index.html');
  assert.match(html,/SHOP BY SOLUTIONS/);
  assert.match(html,/FEATURED SOLUTIONS/);
  assert.match(html,/WHY A SOLUTION STORE\?/);
  assert.match(html,/LET['’]S BUILD/);
  assert.match(html,/DON['’]T BROWSE SERVICES/);
  assert.match(html,/FIND YOUR SOLUTION/);
  assert.equal((html.match(/<a class="solution-category/g)||[]).length,7);
  assert.match(html,/id="featured-catalog"/);
  assert.match(html,/id="catalog"/);
});

test('approved Arabic storefront visual structure is present',()=>{
  const html = read('ar/store/index.html');
  assert.match(html,/تسوّق حسب الحلول/);
  assert.match(html,/الحلول المميزة/);
  assert.match(html,/لماذا متجر A Solution/);
  assert.match(html,/لنبدأ البناء/);
  assert.match(html,/لا تتصفح الخدمات/);
  assert.match(html,/اعثر على الحل/);
  assert.equal((html.match(/<a class="solution-category/g)||[]).length,7);
  assert.match(html,/id="featured-catalog"/);
});

test('all approved local storefront artwork assets exist',()=>{
  for (const file of expectedVisuals) {
    assert.ok(fs.existsSync(path.join(root,'store/assets/visuals',file)),`missing ${file}`);
  }
});

test('store app renders both featured and catalog destinations',()=>{
  const js = read('store/store-app.js');
  assert.match(js,/featured-catalog/);
  assert.match(js,/visualForProduct/);
  assert.match(js,/renderFeatured/);
});

test('product detail uses the same local visual artwork system',()=>{
  const js=read('store/product.js');
  assert.match(js,/visualForProduct/);
  assert.match(js,/product-art-img/);
  assert.match(js,/assets\/visuals/);
});
