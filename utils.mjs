import sql from 'mssql';
import axios from 'axios';
import { sqlConfig, BssApiConfig, shopify, shopifySession } from './config.mjs';
import { sqlQuery, shopifyQuery } from './query.mjs';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

let skuToIdMapper;
let isInitialized = false;

export async function fetchData() {
  try {
    await sql.connect(sqlConfig);
    const result = await sql.query(sqlQuery);
    return result.recordset;
  } catch (err) {
    console.error('Database query failed:', err);
    throw err;
  }
}

export function getNumberAtEnd(str) {
    const match = str.match(/\d+$/);
    return match ? match[0] : null;
}


async function fetchAllProducts() {
  const client = new shopify.clients.Graphql(shopifySession);
  let allProducts = [];
  let hasNextPage = true;
  let endCursor = null;

  while (hasNextPage) {
	  const response = await client.request(shopifyQuery, {
        variables: { cursor: endCursor },
      });
     const { products } = response.data;
    allProducts = allProducts.concat(products.edges.map(edge => edge.node));

    hasNextPage = products.pageInfo.hasNextPage;
    endCursor = products.pageInfo.endCursor;
  }
	
  return allProducts;
}

async function mapProductsToVariants(products) {
  
  const skuToIdMapper = {};

  products.forEach(product => {
	  
    const variants = product.variants.edges.map(edge => edge.node);
	
    if (variants.length === 1) {
      const variant = variants[0];
	  
      skuToIdMapper[variant.sku] =  { product_id: getNumberAtEnd(product.id), parent_sku: null } ;
	  
    } else {
      variants.forEach(variant => {
      skuToIdMapper[variant.sku] =  { product_id: getNumberAtEnd(variant.id), parent_sku: getNumberAtEnd(product.id) } 
      });
    }
  });
	
  return skuToIdMapper;
}

export async function useApiResult() {
  if (!skuToIdMapper) {
    if (!isInitialized) {
      isInitialized = true;
      try {
        const products = await fetchAllProducts();
        skuToIdMapper = await mapProductsToVariants(products);

      } 
	  catch(err){
		  console.log(err)
	  }
	  finally {
        isInitialized = false;
      }
    } else {
      while (isInitialized) {
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for initialization to complete
      }
    }
  }
  return skuToIdMapper;
}

export async function getId(ArtikelSKU){
	const skuToIdMapper = await useApiResult()
	return skuToIdMapper[ArtikelSKU]?.product_id
}

export async function getParentId(ArtikelSKU){
	const skuToIdMapper = await useApiResult()
	return skuToIdMapper[ArtikelSKU]?.parent_sku
}

export async function postPriceList(data) {
  try {
    const response = await axios.post(BssApiConfig.url, data);
	console.log('API Response:', response.data);
  } catch (error) {
    if (error.response) {
      console.log('Error data:', error.response.data);
      console.log('Error status:', error.response.status);
      console.log('Error headers:', error.response.headers);
    } else if (error.request) {
      console.log('Error request:', error.request);
	}
  }
}





const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RETRY_FILE_PATH = path.join(__dirname, 'nextRetry.txt');

const getRetryTimestamp = async () => {
  try {
    const data = await fs.readFile(RETRY_FILE_PATH, 'utf8');
    return parseInt(data, 10);
  } catch (error) {
    // If file doesn't exist or can't be read, consider no retry scheduled
    return null;
  }
};

const setRetryTimestamp = async (timestamp) => {
  await fs.writeFile(RETRY_FILE_PATH, timestamp.toString(), 'utf8');
};

export async function commit (url, options)  {
  const now = Date.now();
  const nextRetry = await getRetryTimestamp();

  if (nextRetry && now < nextRetry) {
    console.log('A retry is already scheduled. Exiting early.');
    return;
  }

  try {
    const {domain, accessKey} = BssApiConfig
	const response = await axios.post(BssApiConfig.uploadUrl,{domain, accessKey});
	console.log('API Response:', response.data);
  } catch (error) {
    if (error.response && error.response.status === 429) {
      const retryAfter = 330000; // 5 minutes and 30 seconds
      const newRetryTime = Date.now() + retryAfter;
      console.log('Received 429 error. Retrying in 5 minutes and 30 seconds...');
      await setRetryTimestamp(newRetryTime);
      return;
    } else {
      throw error;
    }
  }
};