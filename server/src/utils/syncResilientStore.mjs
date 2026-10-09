import fs from 'fs';

const filePath = 'server/src/utils/resilientStore.js';
const content = fs.readFileSync(filePath, 'utf8');
const startMarker = '  const products = [';
const endMarker = '  const requirements = [';
const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const replacement = '  // 35 fully verified products with strict unique product-specific media\n  const products = JSON.parse(JSON.stringify(masterProductCatalog));\n\n';
  const updated = content.slice(0, startIndex) + replacement + content.slice(endIndex);
  fs.writeFileSync(filePath, updated, 'utf8');
  console.log('Successfully updated resilientStore.js with masterProductCatalog!');
} else {
  console.error('Markers not found', { startIndex, endIndex });
}
