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

export interface ProductSearchFilters {
  category?: string;
  minProtein?: number;
  maxProtein?: number;
}

/**
 * Search for products by name in OpenFoodFacts database
 * @param searchTerm The search term
 * @param page Page number (default: 1)
 * @param pageSize Number of results per page (default: 20)
 * @param filters Optional filters for category and protein range
 * @returns Array of products matching the search term
 */
export async function searchProducts(
  searchTerm: string,
  page: number = 1,
  pageSize: number = 20,
  filters?: ProductSearchFilters
): Promise<OpenFoodFactsProduct[]> {
  try {
    let url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(
      searchTerm
    )}&page=${page}&page_size=${pageSize}&json=true`;
    
    // Add category filter if specified
    if (filters?.category) {
      url += `&tagtype_0=categories&tag_contains_0=contains&tag_0=${encodeURIComponent(filters.category)}`;
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error('Failed to search products:', response.status);
      return [];
    }

    const data = await response.json();
    
    if (data.products && Array.isArray(data.products)) {
      let products = data.products;
      
      // Filter by protein range if specified
      if (filters?.minProtein !== undefined || filters?.maxProtein !== undefined) {
        products = products.filter((product: OpenFoodFactsProduct) => {
          const protein = product.nutriments?.proteins_100g;
          if (protein === undefined) return false;
          
          if (filters.minProtein !== undefined && protein < filters.minProtein) {
            return false;
          }
          if (filters.maxProtein !== undefined && protein > filters.maxProtein) {
            return false;
          }
          return true;
        });
      }
      
      return products;
    }

    return [];
  } catch (error) {
    console.error('Error searching products from OpenFoodFacts:', error);
    return [];
  }
}
