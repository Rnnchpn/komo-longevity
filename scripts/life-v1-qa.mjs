import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const app=join(root,'life-app');
const required=['index.html','life-os-v1.css','life-os-v1.js','robots.txt','sitemap.xml','assets/product-varsity.svg'];
for(const file of required)await access(join(app,file));

const html=await readFile(join(app,'index.html'),'utf8');
const js=await readFile(join(app,'life-os-v1.js'),'utf8');
const css=await readFile(join(app,'life-os-v1.css'),'utf8');
const checks=[
 ['connected Life title',html.includes('KŌMØ Life — Objects for a life in motion')],
 ['ecosystem nav',html.includes('/world/')&&html.includes('/world/?view=moments')&&html.includes('pulse.komolongevity.com')],
 ['shared KŌMØ auth bridge',js.includes("from '/world/komo-world-auth-v1.js")&&js.includes('komo_world_access_snapshot')],
 ['Supabase catalogue',js.includes("from('life_products')")&&js.includes('life_create_order_v1')],
 ['bag is explicit',html.includes('YOUR BAG')&&js.includes('komo_life_bag_v1')],
 ['checkout is honest',html.includes('checkoutModal')&&js.includes('No payment is collected')&&js.includes('payment_status')],
 ['demo products are labelled',js.includes('DEMO PRODUCT')&&js.includes('p.demo')],
 ['member layers',js.includes('FOUNDING ECHELON')&&js.includes('FOUNDING ONE')],
 ['nutrition separation',html.includes('Health information is not commerce.')],
 ['mobile OS nav',html.includes('life-mobile-nav')&&css.includes('@media(max-width:840px)')],
 ['editorial product detail',html.includes('productModal')&&js.includes('product_viewed')],
 ['privacy-minimised analytics',js.includes('komo_product_analytics')&&!js.includes('biomarker')],
 ['no duplicate password auth form',!html.includes('type="password"')],
 ['no lorem ipsum',!/lorem ipsum/i.test(html+js+css)]
];
const failed=checks.filter(([,ok])=>!ok);
for(const [label,ok] of checks)console.log('[life-qa] '+(ok?'PASS':'FAIL')+' '+label);
if(failed.length)process.exit(1);
console.log('[life-qa] KŌMØ Life connected OS V1 passed '+checks.length+' checks.');

await import('./komo-key-marketing-v1.mjs');
await import('./pulse-patient-navigation-final-v1.mjs');
await import('./pulse-center-role-final-v1.mjs');
