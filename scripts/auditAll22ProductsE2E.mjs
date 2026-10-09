import fs from 'fs';
import path from 'path';

const API_BASE = 'http://localhost:5000/api';
const VITE_BASE = 'http://localhost:5173';

const REQUIRED_22_PRODUCTS = [
  { pid: 'p001', name: 'Fresh Farm Tomatoes', category: 'Vegetables' },
  { pid: 'p002', name: 'Nasik Red Onions', category: 'Vegetables' },
  { pid: 'p003', name: 'Agra Jyoti Potatoes', category: 'Vegetables' },
  { pid: 'p004', name: 'Banganapalli Golden Mangoes', category: 'Fruits' },
  { pid: 'p005', name: 'Robusta Golden Bananas', category: 'Fruits' },
  { pid: 'p006', name: 'Aromatic Basmati Rice (1121)', category: 'Grains' },
  { pid: 'p007', name: 'MP Sharbati Golden Wheat', category: 'Grains' },
  { pid: 'p008', name: 'Guntur Teja Red Chillies', category: 'Spices' },
  { pid: 'p009', name: 'Fresh Pungent Green Chillies', category: 'Vegetables' },
  { pid: 'p010', name: 'Lakadong High-Curcumin Turmeric', category: 'Spices' },
  { pid: 'p011', name: 'Bold Raw Groundnuts (Peanuts)', category: 'Oil Seeds' },
  { pid: 'p012', name: 'Golden Yellow Maize / Corn', category: 'Grains' },
  { pid: 'p013', name: 'Shankar-6 Raw Cotton Bolls', category: 'Other Agricultural Products' },
  { pid: 'p014', name: 'Black Gram (Split Urad Dal)', category: 'Pulses' },
  { pid: 'p015', name: 'Green Gram (Whole Moong Dal)', category: 'Pulses' },
  { pid: 'p016', name: 'Bengal Gram (Desi Chana Dal)', category: 'Pulses' },
  { pid: 'p017', name: 'Fresh Leafy Coriander Bunches', category: 'Vegetables' },
  { pid: 'p018', name: 'Ooty White Garlic Bulbs', category: 'Spices' },
  { pid: 'p019', name: 'Wayanad Fresh Earthy Ginger', category: 'Spices' },
  { pid: 'p020', name: 'Crunchy Orange Carrots', category: 'Vegetables' },
  { pid: 'p021', name: 'Purple Glossy Brinjal (Eggplant)', category: 'Vegetables' },
  { pid: 'p022', name: 'Tender Green Okra (Bhindi)', category: 'Vegetables' },
];

const SEARCH_TEST_QUERIES = [
  'potato',
  'tomatoes',
  'onion',
  'mango',
  'rice',
  'wheat',
  'green chilli',
  'turmeric',
  'groundnut',
  'cotton',
  'garlic',
  'ginger',
  'brinjal',
  'okra',
];

async function runComprehensiveAudit() {
  console.log('================================================================');
  console.log('🌾 AGRITRADE HUB AI — MASTER CATALOG & SEARCH AUDIT SUITE');
  console.log('================================================================\n');

  let passedTests = 0;
  let failedTests = 0;
  const auditReport = [];

  function assert(condition, message) {
    if (condition) {
      console.log(`✅ PASS: ${message}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${message}`);
      failedTests++;
    }
  }

  // --- PART 1: AUDIT OF THE 22 SPECIFIED CORE PRODUCTS ---
  console.log('--- PART 1: AUDITING ALL 22 CORE AGRICULTURAL PRODUCTS ---');

  for (const item of REQUIRED_22_PRODUCTS) {
    const res = await fetch(`${API_BASE}/products/${item.pid}`);
    const data = await res.json();
    const product = data.product;

    const record = {
      productId: item.pid,
      expectedName: item.name,
      found: !!product,
      imagesCount: product?.images?.length || 0,
      images: product?.images || [],
      video: product?.video || null,
      mappingStatus: 'FAIL',
      httpStatus: 'FAIL',
      dataConsistency: 'FAIL',
    };

    assert(data.success && product, `Product ${item.pid} (${item.name}) exists in API`);
    if (!product) {
      auditReport.push(record);
      continue;
    }

    assert(product.name === item.name, `Product name matches: ${product.name}`);
    assert(product.category === item.category, `Product category matches: ${product.category}`);
    assert(product.price > 0 && product.stock > 0, `Price (₹${product.price}) and stock (${product.stock} ${product.unit}) are valid`);
    assert(product.sellerName && product.location?.city, `Seller (${product.sellerName}) and Location (${product.location?.city}) exist`);

    // Verify images are local, non-empty, and return HTTP 200 from Vite
    let allImagesValid = true;
    for (let i = 0; i < product.images.length; i++) {
      const imgPath = product.images[i];
      const isLocal = imgPath.startsWith(`/products/${item.pid}/`);
      if (!isLocal) {
        allImagesValid = false;
        assert(false, `Image ${imgPath} belongs to ${item.pid} (Found foreign path!)`);
        continue;
      }

      // Check HTTP status from Vite
      try {
        const imgRes = await fetch(`${VITE_BASE}${imgPath}`);
        if (imgRes.status !== 200) {
          allImagesValid = false;
          assert(false, `Image ${imgPath} served by Vite returned HTTP ${imgRes.status}`);
        }
      } catch (e) {
        allImagesValid = false;
        assert(false, `Image ${imgPath} failed to fetch: ${e.message}`);
      }
    }

    assert(allImagesValid, `All ${product.images.length} images for ${item.name} are strictly local & verified HTTP 200`);
    record.mappingStatus = allImagesValid ? 'PASS' : 'FAIL';
    record.httpStatus = allImagesValid ? 'PASS' : 'FAIL';
    record.dataConsistency = 'PASS';
    auditReport.push(record);
  }

  // --- PART 2: POTATO SPECIFIC CATHEDRAL REGRESSION TEST ---
  console.log('\n--- PART 2: AGRA JYOTI POTATOES (p003) CATHEDRAL REGRESSION CHECK ---');
  const potatoRes = await fetch(`${API_BASE}/products/p003`);
  const potatoData = await potatoRes.json();
  const potatoImages = potatoData.product.images;

  assert(potatoImages.length === 4, `Agra Jyoti Potatoes has 4 verified image slots (Count: ${potatoImages.length})`);
  const hasCathedral = potatoImages.some(img => img.includes('cathedral') || img.includes('photo-1596484552834-6a58f850e0a1'));
  assert(!hasCathedral, `Potato images contain ZERO references to Russian Cathedral`);

  // --- PART 3: SEARCH FUNCTIONALITY AUDIT ---
  console.log('\n--- PART 3: SEARCH KEYWORD FILTERING & ASSET INTEGRITY ---');

  for (const query of SEARCH_TEST_QUERIES) {
    const searchRes = await fetch(`${API_BASE}/products?search=${encodeURIComponent(query)}`);
    const searchData = await searchRes.json();
    assert(searchData.success, `Search query "${query}" executed successfully`);
    assert(searchData.products.length > 0, `Search query "${query}" returned at least 1 match (Count: ${searchData.products.length})`);

    // Verify all returned cards have strictly their own images
    let searchImagesValid = true;
    for (const p of searchData.products) {
      if (!p.image || !p.image.startsWith(`/products/${p.productId}/`)) {
        searchImagesValid = false;
        assert(false, `Search result "${p.name}" has wrong image: ${p.image}`);
      }
    }
    assert(searchImagesValid, `All search results for "${query}" strictly use their own product images`);
  }

  console.log('\n================================================================');
  console.log(`AUDIT RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('================================================================\n');

  fs.writeFileSync('scripts/comprehensive_audit_report.json', JSON.stringify({ passedTests, failedTests, auditReport }, null, 2));

  if (failedTests > 0) {
    process.exit(1);
  }
}

runComprehensiveAudit();
