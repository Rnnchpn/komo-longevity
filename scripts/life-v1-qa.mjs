import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const app = join(root, 'life-app');
const required = [
  'index.html',
  'styles.css',
  'app.js',
  'products.js',
  'robots.txt',
  'sitemap.xml',
  'assets/social-preview.svg',
  'assets/product-varsity.svg',
  'assets/product-quarterzip.svg',
  'assets/product-knit.svg',
  'assets/product-tee.svg',
  'assets/product-hoodie.svg',
  'assets/product-cap.svg',
  'assets/product-tote.svg',
  'assets/product-sweatshirt.svg'
];

for (const file of required) await access(join(app, file));

const html = await readFile(join(app, 'index.html'), 'utf8');
const js = await readFile(join(app, 'app.js'), 'utf8');
const products = await readFile(join(app, 'products.js'), 'utf8');

const checks = [
  ['canonical domain', html.includes('https://life.komolongevity.com/')],
  ['accessible main landmark', html.includes('id="main"')],
  ['KŌMØ Points layer', html.includes('KŌMØ Points')],
  ['Pulse account bridge', html.includes('https://pulse.komolongevity.com/')],
  ['cart persistence', js.includes('komo-life-cart-v1')],
  ['server checkout bridge', js.includes('/api/life-checkout')],
  ['founding collection catalogue', (products.match(/sku:/g) || []).length >= 8],
  ['no lorem ipsum', !/lorem ipsum/i.test(html + products)]
];

const failed = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`[life-qa] ${ok ? 'PASS' : 'FAIL'} ${label}`);
if (failed.length) process.exit(1);

console.log('[life-qa] KŌMØ Life V1 checks passed.');
