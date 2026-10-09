import { validateProductMedia, masterProductCatalog } from './productCatalog.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING END-TO-END PRODUCT MEDIA & SEARCH VERIFICATION');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, detail = '') {
    if (condition) {
      console.log(`✅ PASS: ${testName} ${detail ? '(' + detail + ')' : ''}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} ${detail ? '(' + detail + ')' : ''}`);
      failed++;
    }
  }

  // 1. Media Validation across all 35 products
  console.log('--- TEST 1: CATALOG MEDIA AUDIT ---');
  const catalogCheck = validateProductMedia();
  assert(catalogCheck.valid, 'Catalog validation result is valid');
  assert(catalogCheck.totalProducts === 35, 'Total products count is exactly 35', `Count: ${catalogCheck.totalProducts}`);
  assert(catalogCheck.crossReusedCount === 0, 'Zero cross-reused images across catalog', `Reused: ${catalogCheck.crossReusedCount}`);

  // 2. Potato Media Integrity
  console.log('\n--- TEST 2: AGRA JYOTI POTATOES MEDIA AUDIT ---');
  const potato = masterProductCatalog.find(p => p._id === 'prod_03' || p.productId === 'p003');
  assert(!!potato, 'Agra Jyoti Potatoes found in catalog');
  assert(potato.images && potato.images.length === 4, 'Agra Jyoti Potatoes has 4 verified images', `Count: ${potato.images?.length}`);

  const milkshakeUrl = 'photo-1546470427-0d4db154ceb7';
  const tomatoUrl1 = 'photo-1582284540020-8acbe03f4924';
  const tomatoUrl2 = 'photo-1561136594-7f68413baa99';
  const potatoImageUrls = potato.images.join(' ');
  assert(!potatoImageUrls.includes(milkshakeUrl), 'Potato images do NOT contain milkshake image');
  assert(!potatoImageUrls.includes(tomatoUrl1), 'Potato images do NOT contain tomato image 1');
  assert(!potatoImageUrls.includes(tomatoUrl2), 'Potato images do NOT contain tomato image 2');

  // 3. API Search Tests
  console.log('\n--- TEST 3: BACKEND API SEARCH FUNCTIONALITY ---');
  try {
    // 3a. Search "potato"
    const potRes = await fetch('http://localhost:5000/api/products?search=potato').then(r => r.json());
    assert(potRes.success, 'API /api/products?search=potato returns success');
    assert(potRes.products.every(p => p.name.toLowerCase().includes('potato') || p.description?.toLowerCase().includes('potato')),
      'All "potato" results are strictly potato products',
      potRes.products.map(p => p.name).join(', ')
    );
    assert(!potRes.products.some(p => p.name.includes('Tomato') || p.name.includes('Rice')),
      'Potato search results contain NO tomatoes or rice'
    );

    // 3b. Case-insensitivity & whitespace trimming
    const potUpper = await fetch('http://localhost:5000/api/products?search=POTATO').then(r => r.json());
    const potTrim = await fetch('http://localhost:5000/api/products?search=%20%20potato%20%20').then(r => r.json());
    assert(potUpper.products.length === potRes.products.length, 'Uppercase POTATO search returns identical count');
    assert(potTrim.products.length === potRes.products.length, 'Whitespace trimmed search returns identical count');

    // 3c. Search "tomato"
    const tomRes = await fetch('http://localhost:5000/api/products?search=tomato').then(r => r.json());
    assert(tomRes.products.every(p => p.name.toLowerCase().includes('tomato') || p.description?.toLowerCase().includes('tomato')),
      'All "tomato" results are strictly tomato products',
      tomRes.products.map(p => p.name).join(', ')
    );
    assert(!tomRes.products.some(p => p.name.includes('Potato')), 'Tomato search results contain NO potatoes');

    // 3d. Search "onion"
    const onionRes = await fetch('http://localhost:5000/api/products?search=onion').then(r => r.json());
    assert(onionRes.products.every(p => p.name.toLowerCase().includes('onion') || p.description?.toLowerCase().includes('onion')),
      'All "onion" results are strictly onion products',
      onionRes.products.map(p => p.name).join(', ')
    );

    // 3e. Search "rice"
    const riceRes = await fetch('http://localhost:5000/api/products?search=rice').then(r => r.json());
    assert(riceRes.products.every(p => p.name.toLowerCase().includes('rice') || p.description?.toLowerCase().includes('rice')),
      'All "rice" results are strictly rice products',
      riceRes.products.map(p => p.name).join(', ')
    );

    // 3f. Search "agra"
    const agraRes = await fetch('http://localhost:5000/api/products?search=agra').then(r => r.json());
    assert(agraRes.products.length > 0 && agraRes.products.every(p => 
      p.name.toLowerCase().includes('agra') || 
      p.location?.city?.toLowerCase().includes('agra') || 
      p.sellerName?.toLowerCase().includes('agra') ||
      p.description?.toLowerCase().includes('agra')
    ), 'Search "agra" returns only products matched to Agra location, name, or description');

    // 3g. Non-existent search
    const noneRes = await fetch('http://localhost:5000/api/products?search=xyznonexistentproduce12345').then(r => r.json());
    assert(noneRes.products.length === 0, 'Non-matching search returns 0 products (no fake results)');

    // 4. Product by ID API Tests
    console.log('\n--- TEST 4: PRODUCT BY ID STRICT RETRIEVAL ---');
    const potatoById = await fetch('http://localhost:5000/api/products/prod_03').then(r => r.json());
    assert(potatoById.success && potatoById.product.name === 'Agra Jyoti Potatoes', 
      'Lookup prod_03 returns exact Agra Jyoti Potatoes', potatoById.product?.name);
    assert(potatoById.product.images?.length === 4, 'Agra Jyoti Potatoes returned by API has 4 verified images');

    const potatoBySku = await fetch('http://localhost:5000/api/products/p003').then(r => r.json());
    assert(potatoBySku.success && potatoBySku.product.name === 'Agra Jyoti Potatoes',
      'Lookup by SKU p003 returns exact Agra Jyoti Potatoes', potatoBySku.product?.name);

    // 4b. Invalid ID must NOT return products[0]
    const invalidIdRes = await fetch('http://localhost:5000/api/products/non_existent_id_99999');
    assert(invalidIdRes.status === 404, 'Lookup non-existent ID returns HTTP 404 (NEVER defaults to products[0])');

  } catch (err) {
    console.error('API Test Encountered Error:', err.message);
    failed++;
  }

  console.log('\n====================================================');
  console.log(`SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed === 0) {
    console.log('\n🎉 ALL MEDIA INTEGRITY & SEARCH TESTS PASSED 100%!');
  }
}

runTests();
