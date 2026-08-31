import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);

test('store classic scripts can load sequentially without global lexical collisions', () => {
  const catalog = { innerHTML: '' };
  const document = {
    documentElement: { lang: 'en' },
    readyState: 'complete',
    querySelector(selector){ return selector === '#catalog' ? catalog : null; },
    querySelectorAll(){ return []; }
  };
  const window = { addEventListener(){}, ASOLUTION_STORE_CONFIG: { supabase: {} } };
  window.window = window;
  const context = vm.createContext({ window, document, localStorage: {getItem(){return null},setItem(){}}, console, Intl, fetch: async()=>({ok:true,json:async()=>[]}) });
  const files = ['store/store-config.js','store/store-core.js','store/remote.js','store/store-app.js'];
  for (const file of files) {
    const code = fs.readFileSync(path.join(root,file),'utf8');
    vm.runInContext(code, context, { filename: file });
  }
  assert.equal(Array.isArray(window.ASolutionStore.PRODUCTS), true);
  assert.equal(window.ASolutionStore.PRODUCTS.length, 6);
  assert.match(catalog.innerHTML, /Website Launch System/);
  assert.match(catalog.innerHTML, /Commerce Experience/);
});
