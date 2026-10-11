// utils.js exports. The word export in front of CURRENCIES, toHome, calcTotal and formatMoney makes them available to other files. Anything without export stays private to that file.
export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'KES', 'UGX', 'TZS', 'NGN', 'ZAR', 'INR', 'JPY', 'CAD', 'AUD',
];

export function toHome(amount, currency, rates) {
  if (rates === null || !rates[currency]) {
    return null;
  }
  return amount / rates[currency];
}

// Adds up every record that can be converted and counts the ones that can't.
export function calcTotal(expenses, rates) {
  let total = 0;
  let skipped = 0;

  for (let i = 0; i < expenses.length; i++) {
    const value = toHome(expenses[i].amount, expenses[i].currency, rates);
    if (value === null) {
      skipped = skipped + 1;
    } else {
      total = total + value;
    }
  }

  return { total: total, skipped: skipped };
}

export function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(amount);
  } catch (error) {
    // concatenation...addss the amount,to (toFIxed,to2 dp ) and the currency
    return amount.toFixed(2) + ' ' + currency;
  }
}