import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('../store/store-app.js', import.meta.url), 'utf8');

test('catalog boot does not parse localStorage directly at module load', () => {
  assert.match(app, /function\s+safeReadArray\s*\(/);
  assert.doesNotMatch(app, /let\s+cart\s*=\s*JSON\.parse\(localStorage\.getItem/);
});

test('catalog renders local products before remote hydration', () => {
  const boot = app.match(/function\s+bootStore\s*\(\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(boot, 'bootStore function must exist');
  const body = boot[1];
  assert.ok(body.indexOf('renderCatalog()') >= 0, 'renderCatalog must run');
  assert.ok(body.indexOf('hydrateCatalog()') > body.indexOf('renderCatalog()'), 'remote hydration must happen after local render');
});

test('remote hydration cannot erase the local fallback', () => {
  assert.match(app, /if\s*\(rows\?\.length\)\s*\{/);
  assert.match(app, /catch\s*\(e\)\s*\{\s*console\.info\('Using local catalog fallback'/);
});
