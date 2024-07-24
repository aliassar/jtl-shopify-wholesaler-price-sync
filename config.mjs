import 'dotenv/config';
import '@shopify/shopify-api/adapters/node';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';


export const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  port:parseInt(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  options: {
    encrypt: true,
    trustServerCertificate: true
  }
};

export const BssApiConfig = {
  url: 'https://b2b-solution-public-api.bsscommerce.com/api/v1/pl/save',
  domain: process.env.SHOPIFY_STORE,
  accessKey: process.env.BSS_API_ACCESS_KEY,
};

export const shopifyConfig = {
  url: `https://${process.env.SHOPIFY_DOMAIN}/admin/api/2021-01/products.json`,
  accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
};

export const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: ['read_products'],
  hostName: process.env.SHOPIFY_STORE,
});
export const shopifySession = {
    session: {
      accessToken: process.env.SHOPIFY_ACCESS_TOKEN,
      shop: process.env.SHOPIFY_STORE,
    }
  }
