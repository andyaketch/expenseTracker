export const CURRENCIES = [
  'USD', 'EUR', 'GBP', 'KES', 'UGX', 'TZS', 'NGN', 'ZAR', 'INR', 'JPY', 'CAD', 'AUD',
];

// rates are relative to the home currency: rates.EUR = 0.5 means 1 home unit = 0.5 EUR,
// so converting EUR -> home is amount / rate. Returns null when no rate is available.
export function toHome(amount, currency, rates) {
  if (!rates || !rates[currency]) return null;
  return amount / rates[currency];
}

// Adds up every record that can be converted and counts the ones that can't.
export function calcTotal(expenses, rates) {
  return expenses.reduce(
    (acc, expense) => {
      const value = toHome(expense.amount, expense.currency, rates);
      if (value === null) return { ...acc, skipped: acc.skipped + 1 };
      return { ...acc, total: acc.total + value };
    },
    { total: 0, skipped: 0 },
  );
}

export function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}
