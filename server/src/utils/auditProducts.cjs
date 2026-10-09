const fs = require('fs');

const raw = fs.readFileSync('d:/anti ecomers/client/src/data/fallbackProducts.ts', 'utf8');

// Strip TypeScript annotations
const cleaned = raw
  .replace(/import\s+[^;]+;/g, '')
  .replace(/export\s+const\s+fallbackProducts\s*:\s*Product\[\]\s*=/g, 'const fallbackProducts =')
  + '\nmodule.exports = fallbackProducts;';

fs.writeFileSync('d:/anti ecomers/server/src/utils/tempFallback.cjs', cleaned);

const fallbackProducts = require('d:/anti ecomers/server/src/utils/tempFallback.cjs');

console.log('Total fallback products loaded:', fallbackProducts.length);

const urlMap = {};
const crossReused = [];

fallbackProducts.forEach((p) => {
  const images = [p.image, ...(p.gallery || [])].filter(Boolean);
  images.forEach((url, slot) => {
    if (!urlMap[url]) urlMap[url] = [];
    urlMap[url].push({ id: p._id, name: p.name, slot });
  });
});

for (const [url, usages] of Object.entries(urlMap)) {
  const distinctProducts = new Set(usages.map((u) => u.name));
  if (distinctProducts.size > 1) {
    crossReused.push({
      url,
      distinctProducts: Array.from(distinctProducts),
      usages: usages.map((u) => `${u.id}: ${u.name} (slot ${u.slot})`),
    });
  }
}

console.log('=== CROSS-PRODUCT REUSED IMAGES COUNT ===', crossReused.length);
console.log(JSON.stringify(crossReused, null, 2));

// Check each product's images count
const perProductReport = fallbackProducts.map((p) => {
  return {
    id: p._id,
    name: p.name,
    category: p.category,
    image: p.image,
    galleryLength: p.gallery ? p.gallery.length : 0,
    gallery: p.gallery || [],
  };
});

fs.writeFileSync('d:/anti ecomers/server/src/utils/productAuditReport.json', JSON.stringify({
  totalProducts: fallbackProducts.length,
  crossReusedCount: crossReused.length,
  crossReused,
  products: perProductReport,
}, null, 2));

console.log('Report saved to d:/anti ecomers/server/src/utils/productAuditReport.json');
