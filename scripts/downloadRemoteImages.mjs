import fs from 'fs';
import path from 'path';

const auditData = JSON.parse(fs.readFileSync('scripts/catalog_images_audit.json', 'utf8'));
const remoteImages = auditData.filter(i => !i.isLocal);

const outDir = 'temp_audit_images';
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function downloadAll() {
  console.log(`Downloading ${remoteImages.length} remote images for verification...`);
  for (let i = 0; i < remoteImages.length; i++) {
    const item = remoteImages[i];
    const filename = `${item.productId}_img_${item.index + 1}.jpg`;
    const dest = path.join(outDir, filename);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
      console.log(`[${i+1}/${remoteImages.length}] Exists: ${filename}`);
      continue;
    }

    try {
      const res = await fetch(item.url);
      const buf = await res.arrayBuffer();
      fs.writeFileSync(dest, Buffer.from(buf));
      console.log(`[${i+1}/${remoteImages.length}] Downloaded: ${filename} (${buf.byteLength} bytes)`);
    } catch(err) {
      console.error(`[${i+1}/${remoteImages.length}] FAILED: ${filename} - ${err.message}`);
    }
  }
  console.log('Finished downloading all remote images!');
}

downloadAll();
