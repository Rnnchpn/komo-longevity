import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');

const pages = [
  ['en', join(site, 'index.html')],
  ['fr', join(site, 'fr', 'index.html')],
  ['es', join(site, 'es', 'index.html')]
];

const css = `
/* KŌMØ Landing V3 — mobile-first refinement */
.hp-page{overflow-x:hidden}
.hp-product-gateway figure{background:linear-gradient(145deg,#eee9df 0%,#f8f5ef 100%)}
.hp-product-gateway img{object-position:center center}

@media(max-width:620px){
  .hp-page{background:#f5f1e9}
  .hp-shell{width:min(calc(100% - 28px),var(--komo-page))}

  .hp-header{padding-top:env(safe-area-inset-top);background:rgba(245,241,233,.94);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px)}
  .hp-header__inner{height:54px}
  .hp-brand{font-size:13px;letter-spacing:.2em}
  .hp-langs a{min-width:30px;min-height:30px;display:inline-flex;align-items:center;justify-content:center;padding:0;border-radius:999px}
  .hp-mobile-menu summary{display:inline-flex;min-width:44px;min-height:40px;align-items:center;justify-content:center;padding:0 10px;border:1px solid var(--komo-line);border-radius:999px;background:rgba(253,252,248,.68)}
  .hp-mobile-menu nav{position:fixed;top:calc(62px + env(safe-area-inset-top));left:14px;right:14px;width:auto;padding:8px 14px;border:1px solid rgba(18,20,16,.11);border-radius:20px;background:rgba(253,252,248,.98);box-shadow:0 24px 70px rgba(18,20,16,.16);max-height:calc(100svh - 90px - env(safe-area-inset-top));overflow:auto}
  .hp-mobile-menu nav a{min-height:48px;display:flex;align-items:center;padding:0;border-bottom:1px solid rgba(18,20,16,.09);font:700 14px/1.2 var(--komo-font-sans)}

  .hp-hero{padding:42px 0 30px}
  .hp-hero__grid{gap:24px}
  .hp-eyebrow{margin-bottom:13px;font-size:8px;letter-spacing:.16em}
  .hp-hero h1{max-width:350px;font-size:clamp(48px,13.2vw,57px);line-height:.91;letter-spacing:-.058em}
  .hp-hero__aside>p{max-width:340px;font-size:17px;line-height:1.53}
  .hp-actions{display:grid;gap:14px;margin-top:22px}
  .hp-actions .hp-btn{width:100%;min-height:52px;padding:0 18px;font-size:11px}
  .hp-actions .hp-text-link{justify-self:start;font-size:10px}
  .hp-proof{display:flex;flex-wrap:nowrap;gap:8px;margin-top:20px;padding-bottom:2px;overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
  .hp-proof::-webkit-scrollbar{display:none}
  .hp-proof li{flex:0 0 auto;min-height:31px;padding:0 11px;border:1px solid rgba(18,20,16,.1);border-radius:999px;background:rgba(253,252,248,.54);font-size:9px;white-space:nowrap}
  .hp-proof li:before{width:3px;height:3px}
  .hp-hero__rule{display:none}

  .hp-product-gateway{padding:20px 0 56px;border-top:0;background:var(--komo-paper)}
  .hp-product-gateway__grid{display:block;border:0;background:transparent}
  .hp-product-gateway figure{width:100%;min-height:0!important;height:auto!important;aspect-ratio:4/3;margin:0 0 26px;overflow:hidden;border:1px solid rgba(18,20,16,.08);border-radius:20px;background:linear-gradient(145deg,#eae5dc,#f9f6f0);box-shadow:0 18px 55px rgba(18,20,16,.055)}
  .hp-product-gateway img{width:100%;height:100%;object-fit:contain!important;object-position:center!important;filter:saturate(.82) contrast(.98)}
  .hp-product-gateway__copy{padding:0;border:0!important;background:transparent}
  .hp-product-gateway h2{max-width:335px;margin:7px 0 13px;font-size:43px;line-height:.94}
  .hp-product-gateway__copy>div>p{max-width:335px;font-size:16px;line-height:1.57}
  .hp-product-links{margin-top:28px;border-top:1px solid var(--komo-ink)}
  .hp-product-links a{min-height:59px;align-items:center;padding:0;border-bottom:1px solid var(--komo-line)}
  .hp-product-links strong{font-size:24px}
  .hp-product-links span{font-size:8px;letter-spacing:.08em;color:var(--komo-sage)}
  .hp-product-gateway__meta{margin-top:15px;padding-top:0;font-size:8px}

  .hp-science{padding:58px 0}
  .hp-science__grid{gap:32px}
  .hp-science h2{font-size:42px;line-height:.96}
  .hp-science .hp-text-link{margin-top:20px}
  .hp-evidence>div{padding:16px 0}
  .hp-evidence p{font-size:15px;line-height:1.5}

  .hp-pro{padding:64px 0}
  .hp-pro__grid{gap:24px}
  .hp-pro h2{font-size:44px;line-height:.94}
  .hp-pro__grid>div:last-child>p{font-size:16px;line-height:1.58}
  .hp-pro .hp-actions{margin-top:22px}
  .hp-pro .hp-actions .hp-text-link{color:rgba(255,255,255,.88)}

  .hp-close{padding:64px 0 calc(68px + env(safe-area-inset-bottom))}
  .hp-close__grid{gap:25px}
  .hp-close h2{font-size:47px;line-height:.93}
  .hp-close__grid>div:last-child>p{margin-bottom:22px;font-size:16px;line-height:1.56}
  .hp-close__library{margin-top:14px;font-size:10px}

  .hp-footer{padding:42px 0 calc(24px + env(safe-area-inset-bottom))}
  .hp-footer__top{grid-template-columns:1fr 1fr;gap:30px 18px}
  .hp-footer__top>div:first-child{grid-column:1/-1}
  .hp-footer__top>div:first-child p{margin-top:14px;font-size:14px;line-height:1.5}
  .hp-footer__top b{font-size:8px}
  .hp-footer__top a{min-height:28px;display:flex;align-items:center;font-size:10px}
  .hp-footer__bottom{margin-top:34px;padding-top:16px;font-size:8px}
}

@media(max-width:380px){
  .hp-shell{width:min(calc(100% - 22px),var(--komo-page))}
  .hp-hero h1{font-size:46px}
  .hp-product-gateway h2{font-size:40px}
  .hp-pro h2,.hp-close h2{font-size:42px}
}
`;

for (const [locale, file] of pages) {
  let html = await readFile(file, 'utf8');
  if (!html.includes('class="hp-hero"')) throw new Error(`[landing-mobile-v3] hero missing on ${locale}`);
  if (!html.includes('class="hp-product-gateway"')) throw new Error(`[landing-mobile-v3] product gateway missing on ${locale}`);
  if (!html.includes('komo-case-overview.jpeg')) throw new Error(`[landing-mobile-v3] Case image missing on ${locale}`);
  if (!html.includes('KŌMØ Motion') || !html.includes('KŌMØ Clinical')) throw new Error(`[landing-mobile-v3] product architecture missing on ${locale}`);
  if (!html.includes('KŌMØ Landing V3')) html = html.replace('</head>', `<style>${css}</style></head>`);
  await writeFile(file, html, 'utf8');
  console.log(`[landing-mobile-v3] ${locale} homepage refined for mobile`);
}
