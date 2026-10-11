export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'KES', 'UGX', 'TZS', 'NGN', 'ZAR', 'INR', 'JPY', 'CAD', 'AUD',
];

// rates are relative to the home currency.
// rates.EUR = 0.5 means 1 home unit = 0.5 EUR, so EUR -> home is amount / rate.
// Returns null when there is no rate.
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
    return amount.toFixed(2) + ' ' + currency;
  }
}