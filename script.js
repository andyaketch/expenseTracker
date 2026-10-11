// The first line of script.js is import { CURRENCIES, calcTotal, formatMoney, toHome } from './utils.js';. It pulls in exactly those four things, and ./utils.js means “the file called utils.js in the same folder”
import { CURRENCIES, calcTotal, formatMoney, toHome } from './src/utils.js';

// ---- page elements ----
const form = document.getElementById('expense-form');
const textInput = document.getElementById('expense-text');
const amountInput = document.getElementById('expense-amount');
const currencySelect = document.getElementById('expense-currency');
const homeSelect = document.getElementById('home-currency');
const statusBox = document.getElementById('status');
const totalAmount = document.getElementById('total-amount');
const totalNote = document.getElementById('total-note');
const list = document.getElementById('list');
const emptyMsg = document.getElementById('empty-msg');

// ---- data ----
let expenses = [];
let homeCurrency = 'KES';
let rates = null; // exchange rates filled in after the fetch

// load saved data from the browser
const savedExpenses = localStorage.getItem('expenses');
if (savedExpenses) {
  expenses = JSON.parse(savedExpenses);
}
const savedCurrency = localStorage.getItem('homeCurrency');
if (savedCurrency) {
  homeCurrency = savedCurrency;
}

function save() {
  localStorage.setItem('expenses', JSON.stringify(expenses));
  localStorage.setItem('homeCurrency', homeCurrency);
}

// ---- small helpers ----
function fillSelect(select, values, selected) {
  select.innerHTML = '';
  for (let i = 0; i < values.length; i++) {
    const option = document.createElement('option');
    option.value = values[i];
    option.textContent = values[i];
    if (values[i] === selected) {
      option.selected = true;
    }
    select.appendChild(option);
  }
}

function setStatus(type, message) {
  statusBox.className = 'status ' + type;
  statusBox.textContent = message;
}

// ---- get live exchange rates ----
async function loadRates() {
  const requested = homeCurrency;
  rates = null;
  setStatus('loading', 'Fetching live exchange rates...');
  render();

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/' + requested);
    if (!response.ok) {
      throw new Error('server responded with ' + response.status);
    }
    const data = await response.json();
    if (data.result !== 'success') {
      throw new Error('no rates returned');
    }

    // the user may have changed currency while we waited
    if (requested !== homeCurrency) {
      return;
    }
    rates = data.rates;
    setStatus('ready', 'Live exchange rates loaded.');
  } catch (error) {
    if (requested !== homeCurrency) {
      return;
    }
    setStatus('error', 'Could not load exchange rates (' + error.message + '). Change the currency to retry.');
  }
  render();
}

// ---- draw the page ----
function renderTotal() {
  if (rates === null) {
    totalAmount.textContent = '-';
    totalNote.textContent = '';
    return;
  }

  const result = calcTotal(expenses, rates);
  totalAmount.textContent = formatMoney(result.total, homeCurrency);
  if (result.skipped > 0) {
    totalNote.textContent = result.skipped + ' record(s) left out: no rate available.';
  } else {
    totalNote.textContent = '';
  }
}

function buildItem(expense) {
  const item = document.createElement('li');
  item.dataset.id = expense.id;

  // description and original amount
  const info = document.createElement('div');
  info.className = 'info';
  const title = document.createElement('strong');
  title.textContent = expense.description;
  const original = document.createElement('small');
  original.textContent = formatMoney(expense.amount, expense.currency);
  info.appendChild(title);
  info.appendChild(original);

  // converted amount
  const converted = document.createElement('span');
  converted.className = 'converted';
  const value = toHome(expense.amount, expense.currency, rates);
  if (value === null) {
    converted.textContent = '-';
  } else {
    converted.textContent = '≈ ' + formatMoney(value, homeCurrency);
  }

  // delete button
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'delete';
  remove.textContent = 'x';

  item.appendChild(info);
  item.appendChild(converted);
  item.appendChild(remove);
  return item;
}

function render() {
  renderTotal();

  list.innerHTML = '';
  for (let i = 0; i < expenses.length; i++) {
    list.appendChild(buildItem(expenses[i]));
  }

  emptyMsg.hidden = expenses.length > 0;
}

// ---- when the user does something ----
form.addEventListener('submit', function (event) {
  event.preventDefault();

  const description = textInput.value.trim();
  const amount = Number(amountInput.value);
  if (description === '' || amount <= 0) {
    return;
  }

  const newExpense = {
    id: Date.now(),
    description: description,
    amount: amount,
    currency: currencySelect.value,
  };
  expenses = expenses.concat([newExpense]);
  save();
  render();

  // clear the form but keep the chosen currency
  const keepCurrency = currencySelect.value;
  form.reset();
  currencySelect.value = keepCurrency;
  textInput.focus();
});

list.addEventListener('click', function (event) {
  if (event.target.className !== 'delete') {
    return;
  }

  const id = Number(event.target.parentElement.dataset.id);
  expenses = expenses.filter(function (expense) {
    return expense.id !== id;
  });
  save();
  render();
});

homeSelect.addEventListener('change', function () {
  homeCurrency = homeSelect.value;
  save();
  loadRates();
});

// ---- start ----
fillSelect(currencySelect, CURRENCIES, homeCurrency);
fillSelect(homeSelect, CURRENCIES, homeCurrency);
loadRates();