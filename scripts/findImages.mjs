import fs from 'fs';
import path from 'path';

function searchDir(dir, filterExt = ['.js', '.jsx', '.ts', '.tsx', '.json', '.html']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(searchDir(fullPath, filterExt));
    } else if (filterExt.includes(path.extname(entry.name))) {
      results.push(fullPath);
    }
  }
  return results;
}

const files = [...searchDir('client/src'), ...searchDir('server/src')];
const unsplashUrls = new Set();
const potatoMatches = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const matches = content.match(/https?:\/\/[^\s'"\`]+/g) || [];
  for (const m of matches) {
    if (m.includes('unsplash.com')) unsplashUrls.add(m);
  }
  if (content.includes('Agra Jyoti Potatoes') || content.includes('p003') || content.includes('prod_03')) {
    potatoMatches.push(file);
  }
}

console.log('Potato files:', potatoMatches);
console.log('Total unique Unsplash URLs found:', unsplashUrls.size);
for (const u of unsplashUrls) {
  console.log('URL:', u);
}
