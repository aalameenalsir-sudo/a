import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');

test('storefront ships English and Arabic entry pages', () => {
  assert.equal(fs.existsSync(path.join(root, 'store', 'index.html')), true);
  assert.equal(fs.existsSync(path.join(root, 'ar', 'store', 'index.html')), true);
});

test('store module exposes locale-aware money formatting and cart behavior', async () => {
  const mod = await import('../store/store-core.mjs');
  assert.match(mod.formatMoney(8900, 'en'), /8,900/);
  assert.match(mod.formatMoney(8900, 'ar'), /8[٬,]900|٨/);

  const first = mod.addToCart([], { id: 'web', price: 8900 });
  const second = mod.addToCart(first, { id: 'web', price: 8900 });
  assert.equal(second.length, 1);
  assert.equal(second[0].qty, 2);
  assert.equal(mod.cartTotal(second), 17800);
});

test('catalog contains localized featured A Solution offers', async () => {
  const { CATALOG } = await import('../store/store-core.mjs');
  assert.ok(CATALOG.length >= 5);
  const web = CATALOG.find((item) => item.id === 'website-development');
  assert.equal(web.name.en, 'Website Development');
  assert.ok(web.name.ar.length > 3);
  assert.equal(typeof web.price, 'number');
});

test('language routes are reciprocal', async () => {
  const { localeRoute } = await import('../store/store-core.mjs');
  assert.equal(localeRoute('ar'), '/ar/store/');
  assert.equal(localeRoute('en'), '/store/');
});
