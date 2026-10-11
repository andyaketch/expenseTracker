// Basic expense tracker with live currency conversion (single file, no modules)

const CURRENCIES = ['USD', 'EUR', 'GBP', 'KES', 'UGX', 'TZS', 'NGN', 'ZAR', 'INR', 'JPY', 'CNY', 'CAD', 'AUD', 'AED', 'CHF'];
const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Other'];

const $ = (id) => document.getElementById(id);
const form = $('expense-form');
const textInput = $('expense-text');
const amountInput = $('expense-amount');
const currencySelect = $('expense-currency');
const categorySelect = $('expense-category');
const homeSelect = $('home-currency');
const filterSelect = $('filter-category');
const statusBox = $('status');
const retryBtn = $('retry-btn');
const totalLabel = $('total-label');
const totalAmount = $('total-amount');
const totalNote = $('total-note');
const list = $('list');
const emptyMsg = $('empty-msg');

// ---- state ----
let expenses = [];
try {
  expenses = JSON.parse(localStorage.getItem('expenses')) || [];
} catch (e) {
  expenses = [];
}
let homeCurrency = localStorage.getItem('homeCurrency') || 'USD';
let filter = 'All';
let rates = null; // rates with homeCurrency as the base

function save() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('homeCurrency', homeCurrency);
}

// ---- helpers ----
function fillSelect(select, values, selected) {
  select.innerHTML = '';
  values.forEach((v) => {
    const option = document.createElement('option');
    option.value = v;
    option.textContent = v;
    option.selected = v === selected;
    select.appendChild(option);
  });
}

// rates.EUR = 0.5 means 1 home unit = 0.5 EUR, so EUR -> home is amount / rate
function toHome(amount, currency) {
  if (!rates || !rates[currency]) return null;
  return amount / rates[currency];
}

function formatMoney(amount, currency) {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  } catch (e) {
    return amount.toFixed(2) + ' ' + currency;
  }
}

// ---- fetch live rates ----
async function loadRates() {
  const requested = homeCurrency;
  rates = null;
  setStatus('loading');
  render();

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/' + requested);
    if (!response.ok) throw new Error('server responded with ' + response.status);
    const data = await response.json();
    if (data.result !== 'success' || !data.rates) throw new Error('no rates returned');

    if (requested !== homeCurrency) return; // user switched currency meanwhile
    rates = data.rates;
    setStatus('ready');
  } catch (err) {
    if (requested !== homeCurrency) return;
    rates = null;
    setStatus('error', err.message);
  }
  render();
}

function setStatus(status, message) {
  statusBox.className = 'status ' + status;
  if (status === 'loading') statusBox.textContent = 'Fetching live exchange rates...';
  if (status === 'ready') statusBox.textContent = 'Live exchange rates loaded.';
  if (status === 'error') statusBox.textContent = 'Could not load exchange rates (' + message + ').';
  retryBtn.hidden = status !== 'error';
}

// ---- draw the page ----
function render() {
  const visible = filter === 'All' ? expenses : expenses.filter((e) => e.category === filter);

  // total
  totalLabel.textContent = filter === 'All' ? 'Total spent' : 'Total spent: ' + filter;
  if (!rates) {
    totalAmount.textContent = '—';
    totalNote.textContent = '';
  } else {
    let total = 0;
    let skipped = 0;
    visible.forEach((e) => {
      const value = toHome(e.amount, e.currency);
      if (value === null) skipped++;
      else total += value;
    });
    totalAmount.textContent = formatMoney(total, homeCurrency);
    totalNote.textContent = skipped ? skipped + ' expense(s) left out: no rate available.' : '';
  }

  // list
  list.innerHTML = '';
  visible.forEach((e) => {
    const li = document.createElement('li');
    li.dataset.id = e.id;

    const info = document.createElement('div');
    info.className = 'info';
    const title = document.createElement('strong');
    title.textContent = e.description;
    const small = document.createElement('small');
    small.textContent = formatMoney(e.amount, e.currency);
    info.append(title, small);

    const converted = document.createElement('span');
    converted.className = 'converted';
    const value = toHome(e.amount, e.currency);
    converted.textContent = value === null ? '—' : '≈ ' + formatMoney(value, homeCurrency);

    const catSelect = document.createElement('select');
    catSelect.className = 'category';
    fillSelect(catSelect, CATEGORIES, e.category);

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'delete';
    del.textContent = 'x';

    li.append(info, converted, catSelect, del);
    list.appendChild(li);
  });
  emptyMsg.hidden = visible.length > 0;
}

// ---- events ----
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const description = textInput.value.trim();
  const amount = Number(amountInput.value);
  if (!description || !(amount > 0)) return;

  expenses = [...expenses, {
    id: Date.now(),
    description,
    amount,
    currency: currencySelect.value,
    category: categorySelect.value,
  }];
  save();
  render();

  const keep = currencySelect.value;
  form.reset();
  currencySelect.value = keep;
});

list.addEventListener('click', (e) => {
  if (!e.target.matches('button.delete')) return;
  const id = Number(e.target.closest('li').dataset.id);
  expenses = expenses.filter((x) => x.id !== id);
  save();
  render();
});

list.addEventListener('change', (e) => {
  if (!e.target.matches('select.category')) return;
  const id = Number(e.target.closest('li').dataset.id);
  expenses = expenses.map((x) => (x.id === id ? { ...x, category: e.target.value } : x));
  save();
  render();
});

homeSelect.addEventListener('change', () => {
  homeCurrency = homeSelect.value;
  save();
  loadRates();
});

filterSelect.addEventListener('change', () => {
  filter = filterSelect.value;
  render();
});

retryBtn.addEventListener('click', loadRates);

// ---- start ----
fillSelect(currencySelect, CURRENCIES, homeCurrency);
fillSelect(homeSelect, CURRENCIES, homeCurrency);
fillSelect(categorySelect, CATEGORIES, CATEGORIES[0]);
fillSelect(filterSelect, ['All', ...CATEGORIES], 'All');
loadRates();