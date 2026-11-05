# JTL to Shopify Wholesaler Price Sync

A Node.js job that copies wholesaler (B2B) prices from a JTL-Wawi database into price lists in a Shopify store, once a day. Built in 2024 for a small business; the package name is `handlerpreis-synchronizer` ("Haendlerpreis" is the German for dealer price).

## What it does

1. Reads the net prices of one customer group from the JTL-Wawi SQL Server database (`eazybusiness`): article number (`ArtikelSKU`), net price, and the parent article number if the article is a variant. Only articles assigned to one specific shop (`kShop = 4`) and customer group (`kKundenGruppe = 2`) are used; both numbers are hard-coded in `query.mjs`.
2. Fetches all products from the Shopify Admin GraphQL API (250 per page, up to 20 variants each) and builds a SKU to Shopify ID map.
3. Builds two price lists and sends them to the BSS Commerce "B2B Solution" public API, which is the Shopify app that holds the wholesaler price lists:
   - price list `188606` ("First"): articles without a parent, as products, with the net price as `discount_value` (`discount_type: 0`)
   - price list `188613` ("Second"): variant articles, as product plus variant IDs
   Rules shared by both lists (applies to customers tagged `B2B`, and so on) come from `staticData.json`. SKUs with no match in Shopify are dropped.
4. Calls the API's rule-upload endpoint to commit the lists.

## How it works

- `index.mjs` runs the sync once; `service.mjs` schedules it with node-cron at `0 10 * * *` (every day at 10:00, server local time).
- `main.mjs` is the sync itself; `utils.mjs` holds the SQL fetch, the Shopify pagination and SKU mapping, and the BSS calls; `config.mjs` reads settings from the environment.
- If the commit call returns HTTP 429 (rate limited), the next retry time (now plus 5 minutes 30 seconds) is written to `nextRetry.txt`, and later commits skip until then.
- `test.mjs` is a manual script that fetches price list `188606` from the BSS API for inspection.

## Tech

Node.js ES modules (JSON import attribute in `main.mjs` needs Node 18.20+ or 20.10+), `@shopify/shopify-api` ^11.1, axios ^1.21, mssql ^11, node-cron ^4.6, dotenv ^16.4.

## Configuration

Read from a `.env` file (git-ignored) via dotenv:

- `DB_USER`, `DB_PASSWORD`, `DB_SERVER`, `DB_PORT`, `DB_DATABASE` - JTL-Wawi SQL Server
- `SHOPIFY_STORE`, `SHOPIFY_DOMAIN` - the store's myshopify domain (both are used)
- `SHOPIFY_ACCESS_TOKEN`, `SHOPIFY_API_KEY`, `SHOPIFY_API_SECRET` - Shopify app credentials (the token needs `read_products`)
- `BSS_API_ACCESS_KEY` - access key for the B2B Solution API
- `BSS_TEST_PRICE_LIST_ID` - optional, the price list `test.mjs` fetches (defaults to 188606)

The price list IDs, shop ID and customer group ID are in the source, not the environment.

## Run it

```
npm install
node index.mjs      # run the sync once
node service.mjs    # keep running and sync daily at 10:00
```

There is no `start` script in `package.json`.
