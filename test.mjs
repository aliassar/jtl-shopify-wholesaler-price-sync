import axios from 'axios';
import { BssApiConfig } from './config.mjs';
// price list id to look up; domain and key come from .env like the rest of the app
const data = {
  domain: BssApiConfig.domain,
  accessKey: BssApiConfig.accessKey,
  id: Number(process.env.BSS_TEST_PRICE_LIST_ID ?? 188606)
}

try {
	 //console.log(data.data.selected_products)
	 //console.log(data.data.selected_variants)
    const response = await axios.post("https://b2b-solution-public-api.bsscommerce.com/api/v1/pl/get-by-id", data);
	console.log('API Response:', JSON.stringify(response.data));
  } catch (err) {
    console.error('API request failed:', err);
    throw err;
  }