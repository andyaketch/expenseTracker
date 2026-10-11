# Expense Tracker with Live Currency Conversion

People who travel, freelance internationally or shop from foreign stores lose track of their spending because every purchase is in a different currency. This app lets you log each expense in the currency you actually paid in, then shows everything converted into one home currency using live exchange rates, with a running total that updates as you add or remove expenses.

**Live demo:** https://YOUR-USERNAME.github.io/expense-tracker/

## Features

- Add an expense with description, amount, currency and category
- Each expense shows its original amount and its converted value in your home currency
- Running total in the home currency, updated automatically
- Delete an expense, or change its category after adding it
- Filter the list by category (the total follows the filter)
- Change the home currency; rates are re-fetched
- Loading and error states, with a "Try again" button if the API fails
- Expenses and home currency are saved in the browser (localStorage)

## Tech used

- **REST API:** [open.er-api.com](https://open.er-api.com/v6/latest/USD) (free, no key), called with `fetch()` and `async/await`
- **JavaScript ES modules** (`api`, `state`, `utils`, `ui`, `main`)
- **Jest** for unit tests
- **ESLint** (flat config, recommended rules)
- Plain HTML and CSS, no framework

## Run locally

ES modules do not load from a `file://` URL, so use a local server.

```bash
npm install
npm start          # serves the app, open the URL it prints
npm test           # runs the Jest unit tests
npm run lint       # runs ESLint
```

## Project structure

```
index.html
style.css
src/
  api.js      fetch live rates
  state.js    app state, immutable updates, localStorage
  utils.js    pure functions (convert, total, filter, format)
  ui.js       DOM rendering and events
  main.js     wires everything together
tests/
  utils.test.js
eslint.config.js
```

## What I'd improve with more time

- Load the full currency list from the API instead of a fixed list
- Cache the last good rates so the app still converts offline
- Add dates to expenses and a monthly breakdown
- Edit an expense's amount and description, not only its category
- Add tests for the state module and the API module (with a mocked `fetch`)
