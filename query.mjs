export const sqlQuery = `
SELECT 
    child_article.cArtNr AS ArtikelSKU,
    price_detail.fNettoPreis AS Price,
    parent_article.cArtNr AS VaterArtikelSKU
FROM 
    [eazybusiness].[dbo].[tPreis] price
JOIN 
    [eazybusiness].[dbo].[tArtikel] child_article 
    ON price.kArtikel = child_article.kArtikel
JOIN 
    [eazybusiness].[dbo].[tPreisDetail] price_detail 
    ON price_detail.kPreis = price.kPreis
LEFT JOIN 
    [eazybusiness].[dbo].[tArtikel] parent_article 
    ON parent_article.kArtikel = child_article.kVaterArtikel
JOIN 
	[eazybusiness].[dbo].[tArtikelShop] artikel_shop
	ON artikel_shop.kArtikel = child_article.kArtikel
WHERE 
	artikel_shop.kShop = 4
AND 
    price.kKundenGruppe = 2;
`;

export const shopifyQuery = 
`query ($cursor: String) {
	products(first: 250, after: $cursor, reverse: true) {
	  edges {
		node {
		  id
		  variants(first: 20) {
			edges {
			  node {
				id
				sku
			  }
			}
		  }
		}
	  }
	  pageInfo {
		hasNextPage
		endCursor
	  }
	}
}`;

