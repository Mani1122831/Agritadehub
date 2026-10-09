import fs from 'fs';
import path from 'path';

const clientProductsDir = path.resolve('client/public/products');
const tempDir = path.resolve('temp_audit_images');
const brainDir = 'C:\\Users\\91991\\.gemini\\antigravity\\brain\\57d424f5-6b78-4e60-9e51-00df50c2684c';

// Special generated asset paths
const specialAssets = {
  p003_img_4: path.join(brainDir, '.system_generated', 'steps', '2672', 'media_0.png'), // Fresh potato sack
  p018_img_1: path.join(brainDir, '.system_generated', 'steps', '2664', 'media_0.png'), // Garlic bulbs
  p020_img_1: path.join(brainDir, '.system_generated', 'steps', '2680', 'media_0.png'), // Carrots
  p021_img_1: path.join(brainDir, '.system_generated', 'steps', '2686', 'media_0.png'), // Brinjal
};

if (!fs.existsSync(clientProductsDir)) fs.mkdirSync(clientProductsDir, { recursive: true });

// Copy all valid images from temp_audit_images
const tempFiles = fs.readdirSync(tempDir);
let copiedCount = 0;

for (const f of tempFiles) {
  const match = f.match(/^(p\d+)_img_(\d+)\.jpg$/);
  if (!match) continue;

  const [_, pid, slot] = match;
  const srcPath = path.join(tempDir, f);
  const fileSize = fs.statSync(srcPath).size;

  // Skip broken 404 images (29 bytes) or the Russian cathedral (p003_img_4)
  if (fileSize <= 100) {
    console.log(`Skipping 404 broken image: ${f} (${fileSize} bytes)`);
    continue;
  }
  if (pid === 'p003' && slot === '4') {
    console.log(`Skipping Russian Cathedral photo in p003_img_4!`);
    continue;
  }

  const targetDir = path.join(clientProductsDir, pid);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const destPath = path.join(targetDir, `image-${slot}.jpg`);
  fs.copyFileSync(srcPath, destPath);
  copiedCount++;
  console.log(`Deployed: ${pid}/image-${slot}.jpg (${fileSize} bytes)`);
}

// Deploy special assets
for (const [key, srcFile] of Object.entries(specialAssets)) {
  const [pid, _, slot] = key.split('_');
  const targetDir = path.join(clientProductsDir, pid);
  if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });

  const destPath = path.join(targetDir, `image-${slot}.jpg`);
  if (fs.existsSync(srcFile)) {
    fs.copyFileSync(srcFile, destPath);
    copiedCount++;
    console.log(`Deployed SPECIAL: ${pid}/image-${slot}.jpg (${fs.statSync(destPath).size} bytes)`);
  } else {
    console.error(`Missing special asset: ${srcFile}`);
  }
}

console.log(`Total verified local assets deployed: ${copiedCount}`);
