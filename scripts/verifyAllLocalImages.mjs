import fs from 'fs';
import path from 'path';

const dir = path.resolve('client/public/products');
const folders = fs.readdirSync(dir);

console.log(`Found ${folders.length} product asset directories.`);
const summary = [];

for (const f of folders.sort()) {
  const fPath = path.join(dir, f);
  if (!fs.statSync(fPath).isDirectory()) continue;
  const files = fs.readdirSync(fPath).filter(x => x.endsWith('.jpg') || x.endsWith('.png'));
  console.log(`${f} -> ${files.length} images: ${files.join(', ')}`);
  summary.push({ pid: f, count: files.length, images: files.map(x => `/products/${f}/${x}`) });
}

fs.writeFileSync('scripts/local_assets_summary.json', JSON.stringify(summary, null, 2));
