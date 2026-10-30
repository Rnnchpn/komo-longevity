import { mkdir, copyFile, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { WORLDS, LEGACY_SLUGS } from '../src/elysium/store-data.mjs';

const root=process.cwd();
const src=join(root,'src','elysium');
const out=join(root,'site','elysium');
const assets=join(out,'assets');
await mkdir(join(out,'club'),{recursive:true});
await mkdir(join(out,'brokers'),{recursive:true});
await mkdir(join(out,'on-board'),{recursive:true});
await mkdir(join(out,'request'),{recursive:true});
await mkdir(join(out,'desk'),{recursive:true});
await mkdir(join(out,'maison'),{recursive:true});
await mkdir(assets,{recursive:true});
const copies=[
 [join(src,'index.html'),join(out,'index.html')],
 [join(src,'club','index.html'),join(out,'club','index.html')],
 [join(src,'brokers','index.html'),join(out,'brokers','index.html')],
 [join(src,'brokers','studio.js'),join(out,'brokers','studio.js')],
 [join(src,'on-board','index.html'),join(out,'on-board','index.html')],
 [join(src,'request','index.html'),join(out,'request','index.html')],
 [join(src,'desk','index.html'),join(out,'desk','index.html')],
 [join(src,'on-board','vesselfinder.html'),join(out,'on-board','vesselfinder.html')],
 [join(src,'on-board','on-board.css'),join(out,'on-board','on-board.css')],
 [join(src,'on-board','on-board.js'),join(out,'on-board','on-board.js')],
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
if(WORLDS.length!==8||WORLDS.some(w=>!w.products.length)||new Set(WORLDS.map(w=>w.slug)).size!==8)throw new Error('[elysium] eight complete universes required');
for(const world of WORLDS){
 const dir=join(out,'maison',world.slug);
 await mkdir(dir,{recursive:true});
 await writeFile(join(dir,'index.html'),template);
}

for(const [oldSlug,newSlug] of Object.entries(LEGACY_SLUGS)){
 const redirectDir=join(out,'maison',oldSlug);
 await mkdir(redirectDir,{recursive:true});
 const target='/elysium/maison/'+newSlug+'/';
 const script='const url=new URL(location.href);location.replace('+JSON.stringify(target)+'+url.search+url.hash)';
 const redirect='<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>ELYSIUM</title></head><body><p>ELYSIUM — <a href="'+target+'">Accéder à la collection</a></p><script>'+script+'</'+'script></body></html>';
 await writeFile(join(redirectDir,'index.html'),redirect);
}
const brokerPage=await readFile(join(out,'brokers','index.html'),'utf8');
const brokerCode=await readFile(join(out,'brokers','studio.js'),'utf8');
if(!brokerPage.includes('id="yachtForm"')||!brokerPage.includes('id="campaignForm"')||
 !brokerCode.includes('elysium_ad_campaigns')||!brokerCode.includes('elysium_yacht_listings'))
 throw new Error('[elysium] broker or advertising studio missing');
const onBoard=await readFile(join(out,'on-board','index.html'),'utf8');
const onBoardJs=await readFile(join(out,'on-board','on-board.js'),'utf8');
const vfEmbed=await readFile(join(out,'on-board','vesselfinder.html'),'utf8');
if(!vfEmbed.includes('https://www.vesselfinder.com/aismap.js')||
 !vfEmbed.includes("var names=true")||!vfEmbed.includes('43.55')||
 !onBoard.includes('id="obVesselFinder"')||!onBoard.includes('id="obMapProvider"')||
 !onBoardJs.includes('function updateMapProvider')||
 !onBoardJs.includes("mapProvider='vesselfinder'")||
 !onBoardJs.includes('frame.src=url.href')||
 !onBoard.includes('id="obVfDirectLink"')||
 !onBoard.includes('allow-same-origin'))
 throw new Error('[elysium] VesselFinder iframe embed or provider switch missing');

if(!onBoard.includes('data-city="monaco"')||!onBoard.includes('data-city="cannes"')||
 !onBoard.includes('data-city="saint-tropez"')||!onBoard.includes('id="obMap"')||
 !onBoardJs.includes('/api/elysium-yachts')||!onBoardJs.includes('navigator.geolocation.getCurrentPosition')||
 !onBoardJs.includes('renderActivities')||!onBoardJs.includes('source')||onBoardJs.includes('const SNAPSHOT')||
 !onBoard.includes('data-nav="underway"')||!onBoard.includes('data-nav="approaching"')||
 !onBoard.includes('data-nav="at_anchor"')||!onBoard.includes('data-nav="in_port"')||
 !onBoardJs.includes('source===\'live_ais\'')||!onBoardJs.includes('40000'))
 throw new Error('[elysium] On Board missing 3 cities, consent-based GPS or member-only verified yachts');
const home=await readFile(join(out,'index.html'),'utf8');
if(home.includes('portal-doors')||home.includes('elysium-door-2026')||!home.includes('299 €')||!home.includes('KŌMØ Yachting')||!home.includes('/elysium/maison/medical-longevity/')||!home.includes('ely-public-commerce')||(home.match(/class="ely-public-world ely-public-world-/g)||[]).length!==8)
 throw new Error('[elysium] Unwanted entrance animation or required membership and Longevity content missing');
const club=await readFile(join(out,'club','index.html'),'utf8');
if(!club.includes('id="memberWheel"')||!club.includes('class="ely-orbit"')||!club.includes('id="elyOrbitActive"')||club.includes('id="memberCards"'))
 throw new Error('[elysium] interactive orbital member app missing');
if(!longevityTemplate.includes('id="serviceDetail"')||!aestheticTemplate.includes('id="serviceDetail"')||!longevityTemplate.includes('ely-shop-catalogue')||!aestheticTemplate.includes('ely-shop-catalogue'))throw new Error('[elysium] ultra-minimal private product index missing');
if(!WORLDS.find(w=>w.slug==='medical-longevity').products.some(p=>p.id==='motion-functional-check')||!WORLDS.find(w=>w.slug==='medical-longevity').products.some(p=>p.id==='aesthetic-medical-video'))throw new Error('[elysium] medical Motion and aesthetics grouping incomplete');
const member=await readFile(join(assets,'member.js'),'utf8');
const themeCss=await readFile(join(assets,'elysium.css'),'utf8');
const homeApp=await readFile(join(out,'index.html'),'utf8');
const boutiqueApp=await readFile(join(src,'maison-template.html'),'utf8');
if(!homeApp.includes('id="elyPublicDock"')||!homeApp.includes('data-scene="riviera"')||
 !boutiqueApp.includes('id="elyShopDock"')||!boutiqueApp.includes('id="elyCataloguePager"')||
 !onBoard.includes('id="obDock"')||!onBoard.includes('id="obFleetPager"')||
 !brokerPage.includes('id="brokerDock"')||!brokerPage.includes('id="brokerListingPager"')||
 !member.includes('function paginateShop')||!onBoardJs.includes('function offlineMap')||
 !themeCss.includes('height:100dvh')||!themeCss.includes('data:image/svg+xml'))
 throw new Error('[elysium] ocean fullscreen app design incomplete');
if(/(?<!\$)\$\('[^']+'\)\.forEach/.test(onBoardJs)||/(?<!\$)\$\('[^']+'\)\.forEach/.test(member)||
 /(?<!\$)\$\('[^']+'\)\.forEach/.test(brokerCode))
 throw new Error('[elysium] a querySelector was used for a collection, which would break the app');


if(!member.includes('/api/elysium-catalog')||!member.includes('signInWithOtp')||!member.includes('renderLongevityProducts')||!member.includes('renderAestheticProducts')||!member.includes('renderPrivateServiceIndex(products,grid);renderProductRoute();')||!member.includes('renderProductRoute')||!member.includes('elyShopFilters')||!member.includes('serviceGraphic')||!member.includes("$('[data-en]').forEach"))throw new Error('[elysium] secure member client or Longevity shop renderer missing');
if(member.includes("photo.src=w.image")||member.includes('store-card')||!member.includes('ELYSIUM_GLYPHS')||!member.includes("orbitStep(")||!member.includes("WORLDS.forEach"))throw new Error('[elysium] vector nine-world orbital interaction missing');
const sanitized=await readFile(join(assets,'store-data.mjs'),'utf8');
if(sanitized.includes('Private Motion Experience')||sanitized.includes('products:['))throw new Error('[elysium] private catalogue leaked in public metadata');
console.log('[elysium] READY · 8 private collection shops · premium flagship · porcelain member orbit · 8 departments and broker inventory');

const privateRequest=await readFile(join(out,'request','index.html'),'utf8');
if(!privateRequest.includes("from('elysium_guest_requests').insert(payload)")||!privateRequest.includes('id="consent"')||!privateRequest.includes('referral_code'))throw new Error('[elysium] concierge commercial intake missing');
