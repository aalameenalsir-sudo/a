const test = require('node:test');
const assert = require('node:assert/strict');
const { getReply, getWelcome } = require('./alameen-assistant-core.js');

test('returns a Sudanese Arabic welcome message for the Arabic site', () => {
  assert.match(getWelcome('ar'), /الأمين تاج السر/);
  assert.match(getWelcome('ar'), /شنو المشكلة/);
});

test('routes marketing requests to the marketing solution', () => {
  assert.match(getReply('أحتاج تسويق وإعلانات', 'ar'), /التسويق/);
});

test('routes website requests to digital products', () => {
  assert.match(getReply('أريد موقع أو تطبيق', 'ar'), /موقع|تطبيق|رقمية/);
});

test('keeps an unknown request open for clarification', () => {
  assert.match(getReply('عندي موضوع مختلف', 'ar'), /احكِ|التحدي|مساعدة/);
});
