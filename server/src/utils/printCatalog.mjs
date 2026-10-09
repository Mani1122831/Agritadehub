import { masterProductCatalog } from './productCatalog.js';

masterProductCatalog.forEach(p => {
  console.log(`${p.productId} | ${p._id} | ${p.name}`);
  p.images.forEach((img, i) => console.log(`   [${i+1}] ${img}`));
});
