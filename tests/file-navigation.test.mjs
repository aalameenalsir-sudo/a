import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const files = ['store/index.html','store/account.html','store/wishlist.html','store/product.html','store/login.html','store/reviews.html','store/checkout.html','store/track.html','ar/store/index.html','ar/store/account.html','ar/store/wishlist.html','ar/store/product.html','ar/store/login.html','ar/store/reviews.html','ar/store/checkout.html','ar/store/track.html'];

test('file:// navigation never links to a directory', () => {
  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    assert.equal(/href="\.\/"/.test(html), false, `${file} contains href="./"`);
    assert.equal(/href="\.\/#[^"]*"/.test(html), false, `${file} contains directory hash link`);
  }
});

test('product flow returns to explicit index file', () => {
  const js = fs.readFileSync('store/product.js','utf8');
  assert.equal(/location\.href=['\"]\.\/['\"]/.test(js), false, 'product.js navigates to directory');
  assert.equal(/href=\"\.\/\"/.test(js), false, 'product.js renders directory link');
});

test('language switch points to explicit index files', () => {
  const en = fs.readFileSync('store/index.html','utf8');
  const ar = fs.readFileSync('ar/store/index.html','utf8');
  assert.match(en, /href="\.\.\/ar\/store\/index\.html"/);
  assert.match(ar, /href="\.\.\/\.\.\/store\/index\.html"/);
});
