# Expense Tracker v2

People who travel, freelance for clients abroad, or shop from foreign stores often lose track of what they spend because every purchase is in a different currency. This app lets you log each expense in the currency you actually paid in. It converts everything into one home currency using live exchange rates, so you can see a single running total.

**Live demo:** _add your GitHub Pages link here once deployed_

## Features

- Add an expense with a description, an amount and a currency
- Delete an expense
- See each record in its original currency and converted into your home currency
- Running total in the home currency, updated on every add or delete
- Change the home currency, which fetches fresh rates
- Loading and error messages for the rates fetch, so the page never breaks silently
- Records are saved in the browser and survive a refresh

## Tech used

- **REST API:** [open.er-api.com](https://open.er-api.com/v6/latest/USD), called with `fetch()` and `async/await`
- **JavaScript modules:** `script.js` (state, fetch, rendering) imports the pure functions from `utils.js`
- **Testing:** Node's built-in test runner (`node:test`), no packages needed
- **Linting:** ESLint is not set up in this version

## Run it locally

Browsers block ES modules on `file://`, so serve the folder instead of opening `index.html` directly:

```
python3 -m http.server
```

Then open http://localhost:8000.

## Run the tests

You need Node 18 or newer.

```
npm test
```

The three tests cover the conversion and total functions in `utils.js`: normal conversion, a missing rate, and a total that skips records it can't convert.

## What I'd improve with more time

- Add ESLint and run it clean
- Add categories and a category filter
- Add more tests
