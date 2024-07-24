import { fetchData, postPriceList, getId, getParentId } from './utils.mjs';
import staticData from './staticData.json' with { type: "json" };
import { BssApiConfig } from './config.mjs';
import sql from 'mssql';


async function main() {
  try {
    const records = await fetchData();

    const selectedProducts = await Promise.all(records
      .filter(record => !record.VaterArtikelSKU)
      .map(async record => ({
        product_id: await getId(record.ArtikelSKU),
        discount_type: 0,
        discount_value: record.Price
      }))
    );

    const selectedVariants = await Promise.all(records
      .filter(record => record.VaterArtikelSKU)
      .map(async record => ({
        product_id: await getParentId(record.ArtikelSKU),
        variant_id: await getId(record.ArtikelSKU),
        discount_type: 0,
        discount_value: record.Price
      }))
    );

    const priceListData1 = {
      domain: BssApiConfig.domain,
      accessKey: BssApiConfig.accessKey,
      data: {
        ...staticData,
        id: 188606,
        name: "First",
		apply_at: 0,
        selected_products: selectedProducts.filter( product => product.product_id ),
        selected_variants: []
      }
    };

    const priceListData2 = {
      domain: BssApiConfig.domain,
      accessKey: BssApiConfig.accessKey,
      data: {
        ...staticData,
        id: 188613, 
        name: "Second",
        apply_at: 1,
        selected_products: [],
        selected_variants: selectedVariants.filter( variant => variant.product_id && variant.variant_id )
      }
    };
    await postPriceList(priceListData1);
    await postPriceList(priceListData2);
	
  } catch (err) {
	  console.log(err)
  } finally {
    await sql.close();
  }
}

main();
