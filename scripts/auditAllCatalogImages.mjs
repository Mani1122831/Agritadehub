import fs from 'fs';
import path from 'path';
import { masterProductCatalog } from '../server/src/utils/productCatalog.js';

async function audit() {
  console.log(`Auditing all ${masterProductCatalog.length} products in catalog...`);
  const imageAudit = [];

  for (const p of masterProductCatalog) {
    const allImages = [...(p.images || []), ...(p.gallery || [])];
    const uniqueImages = [...new Set(allImages)];

    for (let idx = 0; idx < uniqueImages.length; idx++) {
      const img = uniqueImages[idx];
      imageAudit.push({
        productId: p.productId,
        name: p.name,
        category: p.category,
        index: idx,
        url: img,
        isLocal: img.startsWith('/products/'),
      });
    }
  }

  console.log(`Total images across catalog: ${imageAudit.length}`);
  const localCount = imageAudit.filter(i => i.isLocal).length;
  const remoteCount = imageAudit.filter(i => !i.isLocal).length;
  console.log(`Local images: ${localCount}, Remote Unsplash images: ${remoteCount}`);

  fs.writeFileSync('scripts/catalog_images_audit.json', JSON.stringify(imageAudit, null, 2));
}

audit();
