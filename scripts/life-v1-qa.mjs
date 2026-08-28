import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const app=join(root,'life-app');
const required=['index.html','styles.css','app.js','robots.txt','sitemap.xml','assets/social-preview.svg','assets/komo-life-wordmark.b64','assets/komo-life-mark.b64'];
for(const file of required) await access(join(app,file));
const html=await readFile(join(app,'index.html'),'utf8');
const js=await readFile(join(app,'app.js'),'utf8');
const css=await readFile(join(app,'styles.css'),'utf8');
const checks=[
 ['canonical domain',html.includes('https://life.komolongevity.com/')],
 ['accessible main landmark',html.includes('id="main"')],
 ['bilingual EN/FR',html.includes('data-en=')&&html.includes('data-fr=')&&js.includes('komo-life-language')],
 ['supplied logo used in centered header',html.includes('class="header-logo"')&&html.includes('komo-life-wordmark.webp')],
 ['logo-led hero',html.includes('komo-life-mark.webp')&&css.includes('.hero-mark')],
 ['no campaign photography',!html.includes('data-asset="hero"')&&!html.includes('data-asset="varsity"')&&!html.includes('data-asset="library"')],
 ['no visible storefront grid or cart',!html.includes('product-grid')&&!html.includes('cart-drawer')&&!html.includes('checkout-button')],
 ['minimal fashion navigation',css.includes('.header-inner')&&css.includes('.nav-left')&&css.includes('.nav-right')],
 ['culture manifesto',html.includes('beyond medicine')&&html.includes('au-delà de la médecine')],
 ['KŌMØ Points bridge',html.includes('KŌMØ POINTS')&&html.includes('https://pulse.komolongevity.com/')],
 ['responsive mobile menu',css.includes('@media(max-width:900px)')&&html.includes('data-mobile-menu')],
 ['no lorem ipsum',!/lorem ipsum/i.test(html+js+css)]
];
const failed=checks.filter(([,ok])=>!ok);
for(const [label,ok] of checks) console.log(`[life-qa] ${ok?'PASS':'FAIL'} ${label}`);
if(failed.length) process.exit(1);
console.log(`[life-qa] KŌMØ Life minimal V4 passed ${checks.length} checks.`);