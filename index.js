// ==========================================
// 1. EXPENSE TRACKER
// ==========================================
const balance = document.getElementById('balance-amount');
const money_plus = document.getElementById('income');
const money_minus = document.getElementById('expense');
const list = document.getElementById('list');
const expenseForm = document.getElementById('expense-form');
const text = document.getElementById('expense-text');
const amount = document.getElementById('expense-amount');

let transactions = JSON.parse(localStorage.getItem('transactions')) || [];

function addTransaction(e) {
  e.preventDefault();

  const transaction = {
    id: Date.now(),
    text: text.value,
    amount: +amount.value,
  };

  transactions.push(transaction);
  addTransactionDOM(transaction);
  updateValues();
  updateLocalStorage();

  text.value = '';
  amount.value = '';
}

function addTransactionDOM(transaction) {
  const sign = transaction.amount < 0 ? '-' : '+';
  const item = document.createElement('li');

  item.classList.add(transaction.amount < 0 ? 'minus' : 'plus');
  item.innerHTML = `
    ${transaction.text} <span>${sign}${Math.abs(transaction.amount)}</span>
    <button onclick="removeTransaction(${transaction.id})">x</button>
  `;

  list.appendChild(item);
}

function updateValues() {
  const amounts = transactions.map((t) => t.amount);
  const total = amounts
    .reduce((acc, item) => acc + item, 0)
    .toFixed(2);
  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => acc + item, 0)
    .toFixed(2);
  const expense = (
    amounts
      .filter((item) => item < 0)
      .reduce((acc, item) => acc + item, 0) * -1
  ).toFixed(2);

  balance.innerText = `$${total}`;
  money_plus.innerText = `$${income}`;
  money_minus.innerText = `$${expense}`;
}

function removeTransaction(id) {
  transactions = transactions.filter((t) => t.id !== id);
  updateLocalStorage();
  initExpenseTracker();
}

function updateLocalStorage() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

function initExpenseTracker() {
  list.innerHTML = '';
  transactions.forEach(addTransactionDOM);
  updateValues();
}

expenseForm.addEventListener('submit', addTransaction);
initExpenseTracker();

// ==========================================
// 2. CURRENCY CONVERTER
// ==========================================
const converterForm = document.getElementById('converter-form');
const dropList = document.querySelectorAll('#converter-form select');
const fromCurrency = document.getElementById('from-currency');
const toCurrency = document.getElementById('to-currency');
const converterAmount = document.getElementById('converter-amount');
const exchangeRateTxt = document.querySelector('#converter-form .exchange-rate');
const exchangeIcon = document.querySelector('#converter-form .icon');

if (typeof country_list !== 'undefined') {
  for (let i = 0; i < dropList.length; i++) {
    for (let currency_code in country_list) {
      let selected = i === 0 ? (currency_code === "USD" ? "selected" : "") : (currency_code === "AFN" ? "selected" : "");
      let optionTag = `<option value="${currency_code}" ${selected}>${currency_code}</option>`;
      dropList[i].insertAdjacentHTML("beforeend", optionTag);
    }
    dropList[i].addEventListener("change", (e) => {
      loadFlag(e.target);
    });
  }
}

function loadFlag(element) {
  for (let code in country_list) {
    if (code === element.value) {
      let imgTag = element.parentElement.querySelector("img");
      imgTag.src = `https://flagcdn.com/48x36/${country_list[code].toLowerCase()}.png`;
    }
  }
}

function getExchangeRate() {
  let amountVal = converterAmount.value;
  if (amountVal === "" || amountVal === "0") {
    converterAmount.value = "1";
    amountVal = 1;
  }

  exchangeRateTxt.innerText = "Getting exchange rate...";
  let url = `https://open.er-api.com/v6/latest/${fromCurrency.value}`;

  fetch(url)
    .then((response) => response.json())
    .then((result) => {
      let exchangeRate = result.rates[toCurrency.value];
      let totalExRate = (amountVal * exchangeRate).toFixed(2);
      exchangeRateTxt.innerText = `${amountVal} ${fromCurrency.value} = ${totalExRate} ${toCurrency.value}`;
    })
    .catch(() => {
      exchangeRateTxt.innerText = "Something went wrong";
    });
}

converterForm.addEventListener('submit', (e) => {
  e.preventDefault();
  getExchangeRate();
});

exchangeIcon.addEventListener('click', () => {
  let tempCode = fromCurrency.value;
  fromCurrency.value = toCurrency.value;
  toCurrency.value = tempCode;
  loadFlag(fromCurrency);
  loadFlag(toCurrency);
  getExchangeRate();
});

window.addEventListener("load", () => {
  if (typeof country_list !== 'undefined') {
    getExchangeRate();
  }
});