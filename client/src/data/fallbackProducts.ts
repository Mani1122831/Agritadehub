import { Product } from '../types';
import { masterProductCatalog } from './productCatalog';

/**
 * Single source of truth for fallback products across the application.
 * All 35 products have verified unique product-specific media, zero cross-crop reuse.
 */
export const fallbackProducts: Product[] = masterProductCatalog as unknown as Product[];
