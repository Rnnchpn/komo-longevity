import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { WORLDS } from '../src/elysium/store-data.mjs';

const root=process.cwd();
const src=join(root,'src','elysium');
const out=join(root,'site','elysium');
const assets=join(out,'assets');
await mkdir(join(out,'club'),{recursive:true});
await mkdir(join(out,'maison'),{recursive:true});
await mkdir(assets,{recursive:true});
const copies=[
 [join(src,'index.html'),join(out,'index.html')],
 [join(src,'club','index.html'),join(out,'club','index.html')],
 [join(src,'elysium.css'),join(assets,'elysium.css')],
 [join(src,'member.js'),join(assets,'member.js')],
 ['node_modules/@supabase/supabase-js/dist/umd/supabase.js',join(assets,'supabase.js')]
];
for(const [from,to] of copies)await copyFile(from,to);
const publicWorlds=WORLDS.map(({slug,no,icon,name,full,eyebrow,subtitleEn,subtitleFr,copyEn,copyFr,image,background,products})=>({
 slug,no,icon,name,full,eyebrow,subtitleEn,subtitleFr,copyEn,copyFr,image,background,productCount:products.length
}));
await writeFile(join(assets,'store-data.mjs'),
 'export const WORLDS='+JSON.stringify(publicWorlds)+';\nexport const WORLD_BY_SLUG=Object.fromEntries(WORLDS.map(w=>[w.slug,w]));\n');
const template=await readFile(join(src,'maison-template.html'),'utf8');
if(!template.includes('class="ely-boutique ely-world-maison"')||!template.includes('id="productGrid"')||!template.includes('id="serviceDetail"')||template.includes('<img'))throw new Error('[elysium] universal gated boutique template not ready');
const longevityTemplate=await readFile(join(src,'longevity-template.html'),'utf8');
const aestheticTemplate=await readFile(join(src,'aesthetic-template.html'),'utf8');
if(!aestheticTemplate.includes('id="productGrid"')||!aestheticTemplate.includes('class="aesthetic-maison ely-boutique"')||aestheticTemplate.includes('<img'))throw new Error('[elysium] bespoke photo-free Aesthetic template missing');
if(!longevityTemplate.includes('id="productGrid"')||!longevityTemplate.includes('class="longevity-maison ely-boutique"')||longevityTemplate.includes('<img'))throw new Error('[elysium] bespoke photo-free longevity template missing');
if(WORLDS.length!==9||WORLDS.some(w=>w.products.length!==(w.slug==='longevity'?4:3)))throw new Error('[elysium] nine worlds and four KŌMØ Longevity offers required');
for(const world of WORLDS){
 const dir=join(out,'maison',world.slug);
 await mkdir(dir,{recursive:true});
 await writeFile(join(dir,'index.html'),world.slug==='longevity'?longevityTemplate:(world.slug==='aesthetic'?aestheticTemplate:template));
}
const home=await readFile(join(out,'index.html'),'utf8');
if(home.includes('portal-doors')||home.includes('elysium-door-2026')||!home.includes('299 €')||!home.includes('KŌMØ Yachting')||!home.includes('/elysium/maison/longevity/')||!home.includes('ely-public-commerce')||(home.match(/class="ely-public-world ely-public-world-/g)||[]).length!==9)
 throw new Error('[elysium] Unwanted entrance animation or required membership and Longevity content missing');
const club=await readFile(join(out,'club','index.html'),'utf8');
if(!club.includes('id="memberWheel"')||!club.includes('class="ely-orbit"')||!club.includes('id="elyOrbitActive"')||club.includes('id="memberCards"'))
 throw new Error('[elysium] interactive orbital member app missing');
if(!longevityTemplate.includes('id="serviceDetail"')||!aestheticTemplate.includes('id="serviceDetail"')||!longevityTemplate.includes('ely-shop-catalogue')||!aestheticTemplate.includes('ely-shop-catalogue'))throw new Error('[elysium] ultra-minimal private product index missing');
if(WORLDS.find(w=>w.slug==='longevity').products.some(p=>!p.id.startsWith('medical-'))||WORLDS.find(w=>w.slug==='aesthetic').products.some(p=>!p.id.startsWith('aesthetic-')))throw new Error('[elysium] medical boutiques must show clinician-led services only');
const member=await readFile(join(assets,'member.js'),'utf8');
if(!member.includes('/api/elysium-catalog')||!member.includes('signInWithOtp')||!member.includes('renderLongevityProducts')||!member.includes('renderAestheticProducts')||!member.includes('renderPrivateServiceIndex(products,grid);renderProductRoute();')||!member.includes('renderProductRoute')||!member.includes('elyShopFilters')||!member.includes('serviceGraphic')||!member.includes("$('[data-en]').forEach"))throw new Error('[elysium] secure member client or Longevity shop renderer missing');
if(member.includes("photo.src=w.image")||member.includes('store-card')||!member.includes('ELYSIUM_GLYPHS')||!member.includes("orbitStep(")||!member.includes("WORLDS.forEach"))throw new Error('[elysium] vector nine-world orbital interaction missing');
const sanitized=await readFile(join(assets,'store-data.mjs'),'utf8');
if(sanitized.includes('Private Motion Experience')||sanitized.includes('products:['))throw new Error('[elysium] private catalogue leaked in public metadata');
console.log('[elysium] READY · 9 private collection shops · premium flagship · porcelain member orbit · 28 gated offers');
