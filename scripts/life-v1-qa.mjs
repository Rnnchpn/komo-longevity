import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const app = join(root, 'life-app');
const assetChunks = [
  ...Array.from({ length: 5 }, (_, i) => `assets/hero.webp.${i}.b64`),
  ...Array.from({ length: 2 }, (_, i) => `assets/varsity.webp.${i}.b64`),
  ...Array.from({ length: 5 }, (_, i) => `assets/library.webp.${i}.b64`)
];
const required = ['index.html', 'styles.css', 'app.js', 'robots.txt', 'sitemap.xml', 'assets/social-preview.svg', ...assetChunks];
for (const file of required) await access(join(app, file));

const html = await readFile(join(app, 'index.html'), 'utf8');
const js = await readFile(join(app, 'app.js'), 'utf8');
const css = await readFile(join(app, 'styles.css'), 'utf8');

const checks = [
  ['canonical domain', html.includes('https://life.komolongevity.com/')],
  ['accessible main landmark', html.includes('id="main"')],
  ['bilingual EN/FR content', html.includes('data-en=') && html.includes('data-fr=') && js.includes('komo-life-language')],
  ['culture-first manifesto', html.includes('beyond medicine') && html.includes('au-delà de la médecine')],
  ['three supplied campaign visuals', html.includes('data-asset="hero"') && html.includes('data-asset="varsity"') && html.includes('data-asset="library"')],
  ['campaign asset hydration', js.includes('hero: { chunks: 5') && js.includes('varsity: { chunks: 2') && js.includes('library: { chunks: 5')],
  ['no storefront grid or cart on homepage', !html.includes('product-grid') && !html.includes('cart-drawer') && !html.includes('checkout-button') && !html.includes('>Bag<')],
  ['no product catalogue dependency', !js.includes('products.js') && !js.includes('LIFE_PRODUCTS')],
  ['KŌMØ Points bridge', html.includes('KŌMØ Points') && html.includes('https://pulse.komolongevity.com/')],
  ['private list invitation', /private list/i.test(html) && html.includes('mailto:contact@komolongevity.com')],
  ['responsive editorial system', css.includes('@media(max-width:680px)') && css.includes('.culture') && css.includes('.collection')],
  ['no lorem ipsum', !/lorem ipsum/i.test(html + js + css)]
];

const failed = checks.filter(([, ok]) => !ok);
for (const [label, ok] of checks) console.log(`[life-qa] ${ok ? 'PASS' : 'FAIL'} ${label}`);
if (failed.length) process.exit(1);
console.log(`[life-qa] KŌMØ Life editorial V2 passed ${checks.length} checks.`);
