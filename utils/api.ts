export interface OpenFoodFactsProduct {
  product_name?: string;
  nutriments?: {
    proteins_100g?: number;
    'energy-kcal_100g'?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    salt_100g?: number;
  };
  brands?: string;
  quantity?: string;
}

export interface OpenFoodFactsResponse {
  status: number;
  code: string;
  product?: OpenFoodFactsProduct;
}

/**
 * Query the OpenFoodFacts API for product information by barcode
 * @param barcode The product barcode
 * @returns Product information if found, null otherwise
 */
export async function fetchProductByBarcode(
  barcode: string
): Promise<OpenFoodFactsProduct | null> {
  try {
    const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Failed to fetch product:', response.status);
      return null;
    }

    const data: OpenFoodFactsResponse = await response.json();
    
    if (data.status === 1 && data.product) {
      return data.product;
    }

    return null;
  } catch (error) {
    console.error('Error fetching product from OpenFoodFacts:', error);
    return null;
  }
}
