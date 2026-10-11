# Expense Tracker v2

A small web app for logging expenses in different currencies. You add a record in the currency you paid in, and the app shows each one converted into a home currency, plus a running total.

## What it does

- Add and delete expense records. They are saved in your browser, so they are still there after a refresh.
- Pick a currency for each expense.
- Pick a home currency for the total. Changing it fetches fresh rates.
- Rates come from the free [open.er-api.com](https://open.er-api.com) API. If the fetch fails, the page says so and the total shows "-".

## Run it

Browsers block ES modules on `file://`, so serve the folder instead of opening `index.html` directly:

```
python3 -m http.server
```

Then open http://localhost:8000.

## Test it

You need Node 18 or newer. There is nothing to install.

```
npm test
```

The three tests cover the conversion and total functions in `utils.js`.

## Files

- `index.html` and `style.css`: the page and its styling
- `script.js`: state, the rates fetch, and rendering
- `utils.js`: the pure conversion and formatting functions
- `utils.test.js`: the tests