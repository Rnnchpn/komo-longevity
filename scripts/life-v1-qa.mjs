import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const app=join(root,'life-app');
const required=['index.html','styles.css','app.js','robots.txt','sitemap.xml','assets/social-preview.svg'];
for(const file of required) await access(join(app,file));
const html=await readFile(join(app,'index.html'),'utf8');
const js=await readFile(join(app,'app.js'),'utf8');
const css=await readFile(join(app,'styles.css'),'utf8');
const checks=[
 ['canonical domain',html.includes('https://life.komolongevity.com/')],
 ['accessible main landmark',html.includes('id="main"')],
 ['bilingual EN/FR',html.includes('data-en=')&&html.includes('data-fr=')&&js.includes('komo-life-language')],
 ['centered native wordmark',html.includes('class="header-logo native-logo"')&&html.includes('native-logo-main')&&css.includes('.native-logo')],
 ['logo-led hero without external image',html.includes('class="hero-logo"')&&html.includes('hero-logo-main')&&!html.includes('komo-life-mark.webp')],
 ['no campaign photography',!html.includes('data-asset="hero"')&&!html.includes('data-asset="varsity"')&&!html.includes('data-asset="library"')&&!html.includes('<img')],
 ['no image hydration',!js.includes('hydrateLogo')&&!js.includes('hydrateAsset')],
 ['light-only visual system',!css.includes('--green:')&&!css.includes('background:var(--green)')&&css.includes('--ivory:#fbfaf7')],
 ['no visible storefront grid or cart',!html.includes('product-grid')&&!html.includes('cart-drawer')&&!html.includes('checkout-button')],
 ['culture manifesto',html.includes('beyond medicine')&&html.includes('au-delà de la médecine')],
 ['KŌMØ Points bridge',html.includes('KŌMØ POINTS')&&html.includes('https://pulse.komolongevity.com/')],
 ['responsive mobile menu',css.includes('@media(max-width:900px)')&&html.includes('data-mobile-menu')],
 ['no lorem ipsum',!/lorem ipsum/i.test(html+js+css)]
];
const failed=checks.filter(([,ok])=>!ok);
for(const [label,ok] of checks) console.log(`[life-qa] ${ok?'PASS':'FAIL'} ${label}`);
if(failed.length) process.exit(1);
console.log(`[life-qa] KŌMØ Life light minimal V5 passed ${checks.length} checks.`);
await import('./komo-key-marketing-v2.mjs');
await import('./pulse-patient-navigation-final-v1.mjs');
await import('./pulse-center-role-final-v1.mjs');
