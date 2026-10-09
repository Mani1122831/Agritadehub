import fs from 'fs';
import path from 'path';

const summary = JSON.parse(fs.readFileSync('scripts/local_assets_summary.json', 'utf8'));
const assetsByPid = {};
for (const item of summary) {
  assetsByPid[item.pid] = item.images;
}

// Read current server masterProductCatalog
const serverCatalogFile = path.resolve('server/src/utils/productCatalog.js');
let serverContent = fs.readFileSync(serverCatalogFile, 'utf8');

// Ensure prod_20 (Carrots) and prod_21 (Brinjal) exist in catalog
const carrotBrinjalDefinitions = `
  {
    _id: 'prod_20',
    id: 'prod_20',
    productId: 'p020',
    name: 'Crunchy Orange Carrots',
    category: 'Vegetables',
    description: 'Sweet, crisp, beta-carotene rich deep orange carrots. Machine washed and graded, uniform taper, tender juicy core.',
    specifications: {
      variety: 'Pusa Kesar Orange',
      grade: 'Grade A Export',
      moistureContent: '88%',
      shelfLife: '14-20 Days cold stored',
      packaging: '20 kg perforated poly mesh bags',
      organicCertified: false,
      fpoSource: 'Hoshiarpur Cold Chain Logistics',
    },
    price: 36,
    unit: 'kg',
    stock: 2200,
    minOrderQuantity: 5,
    farmerName: 'Jagjit Sandhu',
    sellerName: 'Hoshiarpur Cold Chain Logistics',
    location: { city: 'Hoshiarpur', state: 'Punjab', lat: 31.5273, lng: 75.9149 },
    harvestDate: '2026-10-04',
    quality: 'Grade A',
    rating: 4.7,
    reviewsCount: 26,
    image: '/products/p020/image-1.jpg',
    images: ['/products/p020/image-1.jpg'],
    gallery: ['/products/p020/image-1.jpg'],
    video: null,
    isOrganic: false,
    isFeatured: false,
    isApproved: true,
    createdAt: new Date(),
  },
  {
    _id: 'prod_21',
    id: 'prod_21',
    productId: 'p021',
    name: 'Purple Glossy Brinjal (Eggplant)',
    category: 'Vegetables',
    description: 'Glossy dark purple teardrop eggplants with minimal seed cavity. Tender flesh, zero pest damage, harvested in cool morning hours.',
    specifications: {
      variety: 'Bhagyamati Purple Oval',
      grade: 'Grade A',
      moistureContent: '91%',
      shelfLife: '6-8 Days',
      packaging: '15 kg corrugated ventilated boxes',
      organicCertified: true,
      fpoSource: 'Warangal Krishi Mandi',
    },
    price: 30,
    unit: 'kg',
    stock: 1400,
    minOrderQuantity: 5,
    farmerName: 'Prabhakar Rao',
    sellerName: 'Warangal Krishi Mandi',
    location: { city: 'Warangal', state: 'Telangana', lat: 17.9689, lng: 79.5941 },
    harvestDate: '2026-10-06',
    quality: 'Grade A',
    rating: 4.6,
    reviewsCount: 21,
    image: '/products/p021/image-1.jpg',
    images: ['/products/p021/image-1.jpg'],
    gallery: ['/products/p021/image-1.jpg'],
    video: null,
    isOrganic: true,
    isFeatured: false,
    isApproved: true,
    createdAt: new Date(),
  },
`;

// Add carrot and brinjal before prod_22 if not present
if (!serverContent.includes("'prod_20'")) {
  serverContent = serverContent.replace(/\{\s*_id:\s*['"]prod_22['"]/, `${carrotBrinjalDefinitions}  {\n    _id: 'prod_22'`);
}

// Now update all products in serverContent to use their verified local assets
for (const [pid, images] of Object.entries(assetsByPid)) {
  const imagesStr = JSON.stringify(images, null, 6).replace(/"/g, "'");
  const mainImage = images[0];

  // Update image
  const imgRegex = new RegExp(`(productId:\\s*['"]${pid}['"][\\s\\S]*?image:\\s*)(['"][^'"]*['"])`, 'g');
  serverContent = serverContent.replace(imgRegex, `$1'${mainImage}'`);

  // Update images array
  const imgsRegex = new RegExp(`(productId:\\s*['"]${pid}['"][\\s\\S]*?images:\\s*\\[)[\\s\\S]*?(\\])`, 'g');
  serverContent = serverContent.replace(imgsRegex, `$1\n      ${images.map(x => `'${x}'`).join(',\n      ')},\n    $2`);

  // Update gallery array
  const galRegex = new RegExp(`(productId:\\s*['"]${pid}['"][\\s\\S]*?gallery:\\s*\\[)[\\s\\S]*?(\\])`, 'g');
  serverContent = serverContent.replace(galRegex, `$1\n      ${images.map(x => `'${x}'`).join(',\n      ')},\n    $2`);
}

fs.writeFileSync(serverCatalogFile, serverContent, 'utf8');
console.log('Server masterProductCatalog updated successfully!');

// Now update client/src/data/productCatalog.ts
const clientCatalogFile = path.resolve('client/src/data/productCatalog.ts');
let clientContent = fs.readFileSync(clientCatalogFile, 'utf8');

if (!clientContent.includes("'prod_20'")) {
  clientContent = clientContent.replace(/\{\s*_id:\s*['"]prod_22['"]/, `${carrotBrinjalDefinitions}  {\n    _id: 'prod_22'`);
}

for (const [pid, images] of Object.entries(assetsByPid)) {
  const mainImage = images[0];

  const imgRegex = new RegExp(`(productId:\\s*['"]${pid}['"][\\s\\S]*?image:\\s*)(['"][^'"]*['"])`, 'g');
  clientContent = clientContent.replace(imgRegex, `$1'${mainImage}'`);

  const imgsRegex = new RegExp(`(productId:\\s*['"]${pid}['"][\\s\\S]*?images:\\s*\\[)[\\s\\S]*?(\\])`, 'g');
  clientContent = clientContent.replace(imgsRegex, `$1\n      ${images.map(x => `'${x}'`).join(',\n      ')},\n    $2`);

  const galRegex = new RegExp(`(productId:\\s*['"]${pid}['"][\\s\\S]*?gallery:\\s*\\[)[\\s\\S]*?(\\])`, 'g');
  clientContent = clientContent.replace(galRegex, `$1\n      ${images.map(x => `'${x}'`).join(',\n      ')},\n    $2`);
}

fs.writeFileSync(clientCatalogFile, clientContent, 'utf8');
console.log('Client productCatalog.ts updated successfully!');
