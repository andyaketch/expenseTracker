import { test } from 'node:test';
import assert from 'node:assert/strict';
import { calcTotal, toHome } from './utils.js';

const rates = { USD: 1, EUR: 0.5, KES: 100 };

test('toHome converts an amount into the home currency', () => {
  assert.equal(toHome(10, 'EUR', rates), 20);
  assert.equal(toHome(500, 'KES', rates), 5);
});

test('toHome returns null when the rate is missing', () => {
  assert.equal(toHome(10, 'GBP', rates), null);
  assert.equal(toHome(10, 'EUR', null), null);
});

test('calcTotal sums convertible records and counts the rest', () => {
  const expenses = [
    { amount: 10, currency: 'EUR' },
    { amount: 5, currency: 'USD' },
    { amount: 7, currency: 'GBP' },
  ];
  assert.deepEqual(calcTotal(expenses, rates), { total: 25, skipped: 1 });
});
