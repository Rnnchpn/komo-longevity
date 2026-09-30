import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site=join(process.cwd(),'site');
const A='/assets/site2026/generated';

const css=`
<style id="komo-premium-visual-system-v1-style">
:root{--kpv-ink:#171a17;--kpv-deep:#1b211d;--kpv-ivory:#f6f1e8;--kpv-paper:#fbf8f2;--kpv-sand:#ddd0bc;--kpv-olive:#6f715f;--kpv-walnut:#8b6244;--kpv-sea:#78939e}
html,body{background:var(--kpv-ivory)!important;color:var(--kpv-ink)!important}
.kp-top{background:rgba(248,244,236,.97)!important;border-bottom:1px solid rgba(77,64,49,.13)!important;color:var(--kpv-ink)!important;backdrop-filter:blur(18px)}
.kp-brand,.kt-simple-link,.kt-mega summary,.kp-menu summary,.kp-langs a,.kt-menu-link,.kt-menu-group strong{color:var(--kpv-ink)!important}
.kp-langs a[aria-current="page"]{background:#6f715f!important;color:#fff!important}
.kt-account-link,.kp-mini{border-color:rgba(41,44,38,.22)!important}
.kt-mega-panel,.kt-mobile-menu{background:#f7f2e9!important;border-color:rgba(85,68,50,.14)!important;box-shadow:0 28px 80px rgba(53,42,31,.16)!important;color:var(--kpv-ink)!important}
.kt-menu-link{border-color:rgba(85,68,50,.10)!important}
.kt-btn--dark{background:var(--kpv-deep)!important;color:#faf6ed!important;border-color:var(--kpv-deep)!important}
.kt-btn--light{background:#faf7f0!important;color:var(--kpv-ink)!important;border-color:rgba(57,50,41,.17)!important}
.kt-btn--ghost{color:#faf6ed!important;border-color:rgba(255,255,255,.30)!important}
.kt-ey,.kt-kicker{color:#777361!important}
.kpv-hero{background:#eee7db!important;padding:0!important}
.kpv-hero-grid{max-width:none!important;width:100%!important;display:grid!important;grid-template-columns:minmax(0,.92fr) minmax(520px,1.08fr);gap:0!important;padding:0!important;align-items:stretch}
.kpv-hero-grid>.kc-hero-copy{padding:clamp(84px,9vw,128px) clamp(26px,6vw,90px)!important;display:flex;flex-direction:column;justify-content:center;max-width:820px}
.kpv-hero-media{margin:0;min-height:680px;overflow:hidden;background:#cdbba1}
.kpv-hero-media img,.kpv-page-media img,.kpv-wide-media img{display:block;width:100%;height:100%;object-fit:cover}
.kpv-hero-media img{min-height:680px}
.kpv-pagehero-grid{display:grid!important;grid-template-columns:minmax(0,.9fr) minmax(460px,1.1fr);gap:0!important;max-width:none!important;width:100%!important;padding:0!important;align-items:stretch}
.kpv-pagehero-copy{padding:clamp(84px,9vw,126px) clamp(26px,6vw,88px);display:flex;flex-direction:column;justify-content:center}
.kpv-page-media{margin:0;min-height:600px;overflow:hidden}
.kpv-wide-media{margin:0;background:#d7c7b1;overflow:hidden}
.kpv-wide-media img{aspect-ratio:16/7;object-position:center}
.kc-quick,.ky-proof{background:#1a211d!important;color:#f8f2e8!important}
.kc-section--paper,.kt-z-section,.kt-pagebody,.kw-section{background:var(--kpv-paper)!important}
.kc-section--sage,.kt-z-section--sage,.kw-section--sage{background:#e5ded0!important}
.kc-section--deep,.kt-z-section--deep,.kw-section--dark,.ky-section--dark{background:var(--kpv-deep)!important}
.kc-cta,.kt-z-final,.ky-final{background:#d9ccb8!important}
.kc-why article,.kc-receive-card,.kt-pagecard,.kw-card{background:#fbf8f2!important;border-color:rgba(80,63,46,.12)!important}
.kt-z-section--sand{background:#eee6d8!important}
.kt-account-panel{background:#e8dfd0!important;border-color:rgba(80,63,46,.13)!important}
.kt-z-continuity article{background:#fbf8f2!important;border-color:rgba(80,63,46,.12)!important}
.ky-section{background:#18201c!important}.ky-section--sea{background:#1d292b!important}
.ky-card,.ky-world article{background:#232d27!important}
.kw-pagehero{background:#ece4d7!important}
.kpv-media-card{overflow:hidden;border-radius:24px;background:#d1c0aa;border:1px solid rgba(70,55,42,.10);box-shadow:0 28px 80px rgba(62,48,34,.11)}
.kpv-media-card img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.22,1,.36,1)}
.kpv-media-card:hover img{transform:scale(1.025)}
.kpv-world-hero{background:#eee7da!important}
.kpv-world-hero .kt-title,.kpv-world-hero .kt-lead{max-width:720px}
@media(max-width:900px){
 .kpv-hero-grid,.kpv-pagehero-grid{grid-template-columns:1fr!important}
 .kpv-hero-grid>.kc-hero-copy,.kpv-pagehero-copy{padding:70px 24px 38px!important}
 .kpv-hero-media,.kpv-hero-media img{min-height:0}
 .kpv-hero-media img{aspect-ratio:16/10}
 .kpv-page-media{min-height:0}.kpv-page-media img{aspect-ratio:16/10}
}
@media(max-width:720px){
 .kp-top{background:#f7f2e9!important}
 .kp-menu[open] .kt-mobile-menu{position:fixed!important;left:12px!important;right:12px!important;top:82px!important;width:auto!important;max-height:calc(100vh - 100px)!important;overflow:auto!important;padding:22px!important;border-radius:22px!important;background:#f7f2e9!important;z-index:9999!important;opacity:1!important}
 .kt-mobile-menu .kt-menu-link{font-size:16px!important;line-height:1.25!important;padding:12px 0!important}
 .kt-mobile-account{background:var(--kpv-deep)!important;color:#fff!important;border-radius:999px!important}
 .kpv-hero-grid>.kc-hero-copy{padding:62px 24px 34px!important}
 .kpv-wide-media img{aspect-ratio:4/3}
 .kc-quick article{background:#1a211d!important}
}
</style>`;

async function exists(fp){try{await access(fp);return true}catch{return false}}
function inject(html){return html.includes('komo-premium-visual-system-v1-style')?html:html.replace('</head>',css+'\n</head>')}

function homeMotionHero(html){
 return html.replace(/<section class="kc-hero"><div class="kt-shell kc-hero-copy">([\s\S]*?)<\/div><\/section>/,
 `<section class="kc-hero kpv-hero"><div class="kpv-hero-grid"><div class="kc-hero-copy">$1</div><figure class="kpv-hero-media"><img src="${A}/komo-motion-premium.webp" alt="Espace KŌMØ Motion face à la Méditerranée" fetchpriority="high"></figure></div></section>`);
}
function worldHero(html){
 return html.replace(/<section class="kw-pagehero"><div class="kt-shell">([\s\S]*?)<\/div><\/section>/,
 `<section class="kw-pagehero kpv-world-hero"><div class="kpv-pagehero-grid"><div class="kpv-pagehero-copy">$1</div><figure class="kpv-page-media"><img src="${A}/komo-world-premium.webp" alt="KŌMØ Pulse et World dans un environnement privé" fetchpriority="high"></figure></div></section>`);
}
function addWideAfterHero(html,src,alt){
 if(html.includes(src)) return html;
 return html.replace(/(<section class="kt-pagehero">[\s\S]*?<\/section>)/,`$1<section class="kpv-wide-media"><img src="${src}" alt="${alt}" fetchpriority="high"></section>`);
}

const stylePages=[
 'index.html','en/index.html','es/index.html',
 'fr/motion/index.html','motion/index.html','es/motion/index.html',
 'fr/clinical/index.html','clinical/index.html','es/clinical/index.html',
 'fr/yachting/index.html','en/yachting/index.html','es/yachting/index.html',
 'fr/world/index.html','en/world/index.html','es/world/index.html',
 'fr/experience/index.html','experience/index.html','es/experience/index.html',
 'fr/signature/index.html','signature/index.html','es/signature/index.html',
 'fr/partners/index.html','partners/index.html','es/partners/index.html',
 'fr/science/index.html','science/index.html','es/science/index.html',
 'fr/a-propos/index.html','about/index.html','es/sobre/index.html'
];

for(const rel of stylePages){
 const fp=join(site,rel); if(!(await exists(fp))) continue;
 let html=inject(await readFile(fp,'utf8'));
 if(['index.html','en/index.html','es/index.html','fr/motion/index.html','motion/index.html','es/motion/index.html'].includes(rel)) html=homeMotionHero(html);
 if(rel.includes('/clinical/')||rel==='clinical/index.html'){
   html=html.replaceAll('/assets/images/clinical-pathway-v1.webp',`${A}/komo-clinical-premium.webp`);
   html=addWideAfterHero(html,`${A}/komo-clinical-premium.webp`,'KŌMØ Clinical dans un environnement privé');
 }
 if(rel.includes('/yachting/')){
   html=html.replaceAll('/assets/images/komo-brand-collage-v1.webp',`${A}/komo-yachting-premium.webp`);
   html=html.replaceAll('/assets/images/hero-mediterranean-motion-v1.webp',`${A}/komo-motion-premium.webp`);
 }
 if(rel.includes('/world/')) html=worldHero(html);
 if(rel.includes('/experience/')||rel==='experience/index.html'){
   html=html.replace('/assets/images/hero-mediterranean-motion-v1.webp',`${A}/komo-yachting-premium.webp`);
   html=html.replace('/assets/images/clinical-pathway-v1.webp',`${A}/komo-lifestyle-premium.webp`);
   html=html.replace('/assets/images/hero-chair-balance-v1.webp',`${A}/komo-lifestyle-premium.webp`);
   html=html.replace('/assets/images/real-case/komo-motion-tablet.jpeg',`${A}/komo-motion-premium.webp`);
   html=html.replace('/assets/images/hero-mediterranean-motion-v1.webp',`${A}/komo-lifestyle-premium.webp`);
 }
 if(rel.includes('/signature/')||rel==='signature/index.html'){
   html=html.replaceAll('/assets/images/hero-mediterranean-motion-v1.webp',`${A}/komo-lifestyle-premium.webp`);
   html=addWideAfterHero(html,`${A}/komo-lifestyle-premium.webp`,'Expérience privée KŌMØ face à la Méditerranée');
 }
 await writeFile(fp,html,'utf8');
}

console.log('[komo-premium-visual-system-v1] PASS · warm Mediterranean palette + Motion, Clinical, Yachting, World and lifestyle imagery integrated.');
