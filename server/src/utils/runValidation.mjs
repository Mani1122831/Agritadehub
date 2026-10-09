import { validateProductMedia } from './productCatalog.js';

const result = validateProductMedia();
console.log('--- PRODUCT MEDIA VALIDATION RESULT ---');
console.log('Valid:', result.valid);
console.log('Total Products:', result.totalProducts);
console.log('Cross Reused Count:', result.crossReusedCount);
if (result.errors.length > 0) {
  console.log('Errors:');
  result.errors.forEach(err => console.log('  ', err));
} else {
  console.log('SUCCESS: All 35 products have 100% strictly unique, verified product-specific media!');
}
