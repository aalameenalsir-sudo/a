import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');

test('store pages avoid ES modules so direct file opening renders dynamic content',()=>{
  assert.equal(fs.existsSync(path.join(root,'store','store-core.js')),true);
  for (const f of ['store/index.html','ar/store/index.html','store/product.html','ar/store/product.html','store/checkout.html','ar/store/checkout.html']) {
    assert.doesNotMatch(read(f),/type="module"/);
  }
  assert.match(read('store/index.html'),/store-core\.js/);
  assert.match(read('ar/store/index.html'),/\.\.\/\.\.\/store\/store-core\.js/);
});

test('language switch uses relative routes that also work when opened from disk',()=>{
  assert.match(read('store/index.html'),/href="\.\.\/ar\/store\/index\.html"/);
  assert.match(read('ar/store/index.html'),/href="\.\.\/\.\.\/store\/index\.html"/);
});

test('windows one-click launcher is included and does not require a local server',()=>{
  assert.equal(fs.existsSync(path.join(root,'OPEN_STORE.bat')),true);
  assert.match(read('OPEN_STORE.bat'),/store\\index\.html/i);
});

test('launcher has zero runtime dependencies and opens the bundled storefront directly',()=>{
  const bat=read('OPEN_STORE.bat');
  assert.doesNotMatch(bat,/\bpy\b|\bpython\b|http\.server|localhost/i);
  assert.match(bat,/store\\index\.html/i);
  assert.ok(fs.existsSync(path.join(root,'OPEN_STORE.html')));
  assert.match(read('OPEN_STORE.html'),/store\/index\.html/i);
});
