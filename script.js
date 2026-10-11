import { CURRENCIES, calcTotal, formatMoney, toHome } from './utils.js';

const $ = (id) => document.getElementById(id);
const form = $('expense-form');
const textInput = $('expense-text');
const amountInput = $('expense-amount');
const currencySelect = $('expense-currency');
const homeSelect = $('home-currency');
const statusBox = $('status');
const totalAmount = $('total-amount');
const totalNote = $('total-note');
const list = $('list');
const emptyMsg = $('empty-msg');

// ---- state ----
let expenses = [];
try {
  expenses = JSON.parse(localStorage.getItem('expenses')) || [];
} catch {
  expenses = [];
}
let homeCurrency = localStorage.getItem('homeCurrency') || 'USD';
let rates = null; // exchange rates with homeCurrency as the base

function save() {
  try {
    localStorage.setItem('expenses', JSON.stringify(expenses));
    localStorage.setItem('homeCurrency', homeCurrency);
  } catch {
    // storage blocked or full: the app still works for this session
  }
}

function fillSelect(select, values, selected) {
  select.replaceChildren(
    ...values.map((value) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      option.selected = value === selected;
      return option;
    }),
  );
}

function setStatus(type, message) {
  statusBox.className = `status ${type}`;
  statusBox.textContent = message;
}

// ---- live exchange rates ----
async function loadRates() {
  const requested = homeCurrency;
  rates = null;
  setStatus('loading', 'Fetching live exchange rates...');
  render();

  try {
    const response = await fetch(`https://open.er-api.com/v6/latest/${requested}`);
    if (!response.ok) throw new Error(`server responded with ${response.status}`);
    const data = await response.json();
    if (data.result !== 'success' || !data.rates) throw new Error('no rates returned');

    if (requested !== homeCurrency) return; // currency changed while loading
    rates = data.rates;
    setStatus('ready', 'Live exchange rates loaded.');
  } catch (error) {
    if (requested !== homeCurrency) return;
    setStatus('error', `Could not load exchange rates (${error.message}). Change the currency to retry.`);
  }
  render();
}

// ---- draw the page ----
function renderTotal() {
  if (!rates) {
    totalAmount.textContent = '—';
    totalNote.textContent = '';
    return;
  }
  const { total, skipped } = calcTotal(expenses, rates);
  totalAmount.textContent = formatMoney(total, homeCurrency);
  totalNote.textContent = skipped ? `${skipped} record(s) left out: no rate available.` : '';
}

function buildItem(expense) {
  const item = document.createElement('li');
  item.dataset.id = expense.id;

  const info = document.createElement('div');
  info.className = 'info';
  const title = document.createElement('strong');
  title.textContent = expense.description;
  const original = document.createElement('small');
  original.textContent = formatMoney(expense.amount, expense.currency);
  info.append(title, original);

  const converted = document.createElement('span');
  converted.className = 'converted';
  const value = toHome(expense.amount, expense.currency, rates);
  converted.textContent = value === null ? '—' : `≈ ${formatMoney(value, homeCurrency)}`;

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'delete';
  remove.setAttribute('aria-label', `Delete ${expense.description}`);
  remove.textContent = 'x';

  item.append(info, converted, remove);
  return item;
}

function render() {
  renderTotal();
  list.replaceChildren(...expenses.map(buildItem));
  emptyMsg.hidden = expenses.length > 0;
}

// ---- events ----
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const description = textInput.value.trim();
  const amount = Number(amountInput.value);
  if (!description || !(amount > 0)) return;

  expenses = [
    ...expenses,
    { id: Date.now(), description, amount, currency: currencySelect.value },
  ];
  save();
  render();

  const keep = currencySelect.value;
  form.reset();
  currencySelect.value = keep;
  textInput.focus();
});

list.addEventListener('click', (event) => {
  if (!event.target.matches('button.delete')) return;
  const id = Number(event.target.closest('li').dataset.id);
  expenses = expenses.filter((expense) => expense.id !== id);
  save();
  render();
});

homeSelect.addEventListener('change', () => {
  homeCurrency = homeSelect.value;
  save();
  loadRates();
});

// ---- start ----
fillSelect(currencySelect, CURRENCIES, homeCurrency);
fillSelect(homeSelect, CURRENCIES, homeCurrency);
loadRates();
