import axios from 'axios';
const data = 
{
  "domain": "your-store.myshopify.com", 
  "accessKey": "YOUR_BSS_ACCESS_KEY",
  "id": 188606
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