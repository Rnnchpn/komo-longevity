import fs from 'node:fs';
import path from 'node:path';

const candidates = [
  path.resolve('site/assets/masterclass-v2/index.html'),
  path.resolve('site/assets/masterclass-v2.html')
];

const file = candidates.find((candidate) => fs.existsSync(candidate));

if (!file) {
  console.warn('[masterclass] production page not found; visual removal skipped.');
  process.exit(0);
}

let html = fs.readFileSync(file, 'utf8');

html = html
  .replace(/\s*<meta\s+property=["']og:image["'][^>]*masterclass-visual[^>]*>\s*/i, '\n')
  .replace(/\s*<section\s+class=["']visual["'][\s\S]*?<\/section>\s*/i, '\n\n');

fs.writeFileSync(file, html, 'utf8');
console.log(`[masterclass] removed broken visual block from ${file}`);
