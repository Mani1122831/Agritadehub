import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import AdmZip from 'adm-zip';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceRoot = path.resolve(__dirname, '../../');
const zipPath = path.join(workspaceRoot, 'ezgif-243cd9d6dbdd7f04-jpg.zip');
const targetFramesDir = path.resolve(__dirname, '../../client/public/frames');

console.log('Zip path:', zipPath);
console.log('Target directory:', targetFramesDir);

if (!fs.existsSync(zipPath)) {
  console.error('Zip file not found at:', zipPath);
  process.exit(1);
}

// 1. Ensure target directory exists
if (!fs.existsSync(targetFramesDir)) {
  fs.mkdirSync(targetFramesDir, { recursive: true });
}

// 2. Delete existing frames
console.log('Cleaning up previous frames...');
const existingFiles = fs.readdirSync(targetFramesDir);
for (const file of existingFiles) {
  const filePath = path.join(targetFramesDir, file);
  try {
    fs.rmSync(filePath, { recursive: true, force: true });
  } catch (err) {
    console.warn(`Could not delete ${file}:`, err.message);
  }
}
console.log('Previous frames deleted successfully.');

// 3. Extract all images from zip
console.log('Extracting new frames from zip...');
const zip = new AdmZip(zipPath);
const entries = zip.getEntries();

const validExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const extractedFiles = [];

for (const entry of entries) {
  if (entry.isDirectory) continue;
  if (entry.entryName.includes('__MACOSX') || entry.entryName.startsWith('.')) continue;

  const ext = path.extname(entry.entryName).toLowerCase();
  if (!validExtensions.has(ext)) continue;

  const baseName = path.basename(entry.entryName);
  const targetFilePath = path.join(targetFramesDir, baseName);

  fs.writeFileSync(targetFilePath, entry.getData());
  extractedFiles.push(baseName);
}

// 4. Sort extracted files in natural numeric order
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
extractedFiles.sort(collator.compare);

// 5. Generate manifest.json
const manifest = {
  frames: extractedFiles.map((fileName) => `/frames/${fileName}`),
  updatedAt: new Date().toISOString(),
};

fs.writeFileSync(
  path.join(targetFramesDir, 'manifest.json'),
  JSON.stringify(manifest, null, 2),
  'utf-8'
);

console.log('Extraction completed successfully!');
console.log('First 3 frames:', manifest.frames.slice(0, 3));
console.log('Manifest written to:', path.join(targetFramesDir, 'manifest.json'));
