import sql from 'mssql';
import axios from 'axios';
import { sqlConfig, BssApiConfig, shopify, shopifySession } from './config.mjs';
import { sqlQuery, shopifyQuery } from './query.mjs';

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
	 //console.log(data.data.selected_products)
	 //console.log(data.data.selected_variants)
    const response = await axios.post(BssApiConfig.url, data);
	console.log('API Response:', response.data);
  } catch (err) {
    console.error('API request failed:', err);
    throw err;
  }
}