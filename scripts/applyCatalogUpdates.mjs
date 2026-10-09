import fs from 'fs';
import path from 'path';

const localImageUpdates = {
  p006: '/products/p006/image-1.jpg',
  p007: '/products/p007/image-1.jpg',
  p010: '/products/p010/image-1.jpg',
  p011: '/products/p011/image-1.jpg',
  p013: '/products/p013/image-1.jpg',
  p014: '/products/p014/image-1.jpg',
  p015: '/products/p015/image-1.jpg',
  p016: '/products/p016/image-1.jpg',
  p032: '/products/p032/image-1.jpg',
  p033: '/products/p033/image-1.jpg',
  p034: '/products/p034/image-1.jpg',
  p035: '/products/p035/image-1.jpg',
  p036: '/products/p036/image-1.jpg',
  p037: '/products/p037/image-1.jpg',
};

function updateFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let updatedCount = 0;

  for (const [pid, imgPath] of Object.entries(localImageUpdates)) {
    // Find the product block by productId
    const regex = new RegExp(`(productId:\\s*['"]${pid}['"][\\s\\S]*?image:\\s*)(['"][^'"]*['"])`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, `$1'${imgPath}'`);
      updatedCount++;
    }

    // Also update images array
    const imagesRegex = new RegExp(`(productId:\\s*['"]${pid}['"][\\s\\S]*?images:\\s*\\[)([\\s\\S]*?)(\\])`, 'g');
    content = content.replace(imagesRegex, `$1\n      '${imgPath}',\n    $3`);

    // Also update gallery array
    const galleryRegex = new RegExp(`(productId:\\s*['"]${pid}['"][\\s\\S]*?gallery:\\s*\\[)([\\s\\S]*?)(\\])`, 'g');
    content = content.replace(galleryRegex, `$1\n      '${imgPath}',\n    $3`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${filePath} with ${updatedCount} product image mappings.`);
}

updateFile(path.resolve('server/src/utils/productCatalog.js'));
updateFile(path.resolve('client/src/data/productCatalog.ts'));
console.log('Catalog files updated successfully!');
