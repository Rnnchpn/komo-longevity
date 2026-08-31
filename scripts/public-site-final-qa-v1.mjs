import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url))), site=join(root,'site');
const failures=[];
const need=async(rel)=>{try{await access(join(site,rel))}catch{failures.push(`missing ${rel}`)}};
for(const rel of ['index.html','fr/index.html','es/index.html','contact/index.html','fr/contact/index.html','es/contact/index.html','partners/index.html','fr/partners/index.html','es/partners/index.html','fr/legal/index.html','fr/privacy/index.html','fr/terms/index.html','fr/locomotor/index.html','pulse-v12/index.html','robots.txt','sitemap.xml'])await need(rel);
async function walk(dir,out=[]){for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())await walk(p,out);else if(e.name.endsWith('.html'))out.push(p)}return out}
for(const p of await walk(site)){const h=await readFile(p,'utf8');for(const bad of ['/_vercel/insights/script.js','/fr/confidentialite/','/fr/mentions-legales/','/fr/cgv/'])if(h.includes(bad))failures.push(`${p.replace(site,'site')} contains stale ${bad}`)}
for(const rel of ['contact/index.html','fr/contact/index.html','es/contact/index.html']){const h=await readFile(join(site,rel),'utf8');if(!h.includes('data-professional-contact'))failures.push(`${rel} missing professional onboarding`);if(!h.includes('pro-home-top'))failures.push(`${rel} missing homepage-aligned header`)}
for(const rel of ['partners/index.html','fr/partners/index.html','es/partners/index.html']){const h=await readFile(join(site,rel),'utf8');if(h.includes('id="proForm"'))failures.push(`${rel} still contains legacy mailto form`);if(!h.includes('intent=partner'))failures.push(`${rel} missing professional onboarding bridge`)}
const pulse=await readFile(join(site,'pulse-v12/index.html'),'utf8');if(pulse.includes('/fr/confidentialite/')||pulse.includes('/fr/mentions-legales/'))failures.push('Pulse still contains obsolete legal routes');
const robots=await readFile(join(site,'robots.txt'),'utf8');if(!robots.includes('Sitemap: https://komolongevity.com/sitemap.xml'))failures.push('robots.txt missing sitemap declaration');
const sitemap=await readFile(join(site,'sitemap.xml'),'utf8');for(const u of ['https://komolongevity.com/','https://komolongevity.com/fr/','https://komolongevity.com/es/','https://komolongevity.com/contact/','https://komolongevity.com/fr/contact/','https://komolongevity.com/es/contact/'])if(!sitemap.includes(`<loc>${u}</loc>`))failures.push(`sitemap missing ${u}`);
const home=await readFile(join(site,'fr/index.html'),'utf8');const styleIds=[...home.matchAll(/<style id="([^"]+)"/g)].map(m=>m[1]);console.log(`[public-site-final-qa] FR homepage inline style layers: ${styleIds.length}`);if(styleIds.length>12)console.warn(`[public-site-final-qa] WARN: homepage still has ${styleIds.length} inline style layers — consolidation debt remains.`);
if(failures.length){console.error('[public-site-final-qa] FAIL');for(const f of [...new Set(failures)])console.error(' - '+f);process.exit(1)}
console.log('[public-site-final-qa] PASS — final generated output validated after all mutations.');
