import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site = join(process.cwd(), 'site');

const pages = [
  {
    file: join(site, 'fr', 'index.html'),
    eyebrow: 'KŌMØ · LOCOMOTOR LONGEVITY',
    beta: 'PULSE BETA',
    title: 'Mesurer le mouvement.<br><em>Comprendre la trajectoire.</em>',
    lead: 'KŌMØ réunit une valise de mesure portable, six capteurs, un protocole fonctionnel et Pulse pour rendre la mobilité lisible dans le temps.',
    primary: 'Accéder à Pulse', secondary: 'Découvrir KŌMØ Case', caseHref: '/fr/case/',
    metrics: [['01','UNE CASE','Portable'],['02','6 CAPTEURS','Instrumenté'],['03','MOTION SCORE','Interprétable'],['04','PULSE','Longitudinal']]
  },
  {
    file: join(site, 'index.html'),
    eyebrow: 'KŌMØ · LOCOMOTOR LONGEVITY',
    beta: 'PULSE BETA',
    title: 'Measure movement.<br><em>Understand the trajectory.</em>',
    lead: 'KŌMØ combines a portable measurement case, six sensors, a functional protocol and Pulse to make mobility legible over time.',
    primary: 'Access Pulse', secondary: 'Discover KŌMØ Case', caseHref: '/case/',
    metrics: [['01','ONE CASE','Portable'],['02','6 SENSORS','Instrumented'],['03','MOTION SCORE','Interpretable'],['04','PULSE','Longitudinal']]
  },
  {
    file: join(site, 'es', 'index.html'),
    eyebrow: 'KŌMØ · LOCOMOTOR LONGEVITY',
    beta: 'PULSE BETA',
    title: 'Medir el movimiento.<br><em>Comprender la trayectoria.</em>',
    lead: 'KŌMØ combina una maleta portátil de medición, seis sensores, un protocolo funcional y Pulse para hacer visible la movilidad a lo largo del tiempo.',
    primary: 'Acceder a Pulse', secondary: 'Descubrir KŌMØ Case', caseHref: '/es/case/',
    metrics: [['01','UNA CASE','Portátil'],['02','6 SENSORES','Instrumentado'],['03','MOTION SCORE','Interpretable'],['04','PULSE','Longitudinal']]
  }
];

const CSS = `<style id="homepage-whoop-stepup-v2-style">
:root{--kwo-black:#060707;--kwo-white:#f7f5ef;--kwo-sage:#91aa9f;--kwo-beige:#ded0b9;--kwo-line:rgba(255,255,255,.16)}
.kp-top{background:rgba(6,7,7,.95)!important;color:var(--kwo-white)!important;border-bottom-color:rgba(255,255,255,.1)!important;backdrop-filter:blur(22px)!important;-webkit-backdrop-filter:blur(22px)!important}
.kp-top .kp-brand{color:#fff!important;font-weight:900!important;letter-spacing:.22em!important}.kp-top .kp-brand span{display:none!important}
.kp-top .kp-nav a{color:rgba(255,255,255,.62)!important}.kp-top .kp-nav a:hover,.kp-top .kp-nav a[aria-current=page]{color:#fff!important}
.kp-top .kp-langs a{color:rgba(255,255,255,.58)!important}.kp-top .kp-langs a[aria-current=page]{background:#fff!important;color:#080909!important}
.kp-top .kp-mini{background:var(--kwo-beige)!important;color:#090a0a!important;border:0!important}.kp-top .kp-menu summary{color:#fff!important;border-color:rgba(255,255,255,.2)!important;background:rgba(255,255,255,.04)!important}
.kwo-hero{position:relative;overflow:hidden;background:radial-gradient(circle at 80% 16%,rgba(145,170,159,.11),transparent 30%),#060707;color:var(--kwo-white);padding:clamp(42px,5vw,72px) 0 clamp(54px,7vw,92px)}
.kwo-hero:after{content:'';position:absolute;right:-18vw;bottom:-42vw;width:72vw;height:72vw;border:1px solid rgba(255,255,255,.055);border-radius:50%;pointer-events:none}
.kwo-shell{position:relative;z-index:1;width:min(calc(100% - 56px),1440px);margin:auto}
.kwo-topline{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:clamp(24px,3vw,42px)}
.kwo-ey{margin:0;color:var(--kwo-beige);font:800 9px/1 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:.18em;text-transform:uppercase}.kwo-beta{padding:8px 11px;border:1px solid rgba(255,255,255,.18);border-radius:999px;color:rgba(255,255,255,.62);font-size:8px;font-weight:800;letter-spacing:.13em}
.kwo-logo{margin:0;color:#fff;font:900 clamp(92px,18vw,252px)/.72 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:-.085em;text-transform:uppercase;white-space:nowrap}
.kwo-grid{display:grid;grid-template-columns:minmax(0,1.08fr) minmax(340px,.92fr);gap:clamp(44px,8vw,120px);align-items:end;margin-top:clamp(54px,6vw,86px);padding-top:clamp(24px,3vw,34px);border-top:1px solid rgba(255,255,255,.28)}
.kwo-title{margin:0;max-width:820px;color:#fff;font:650 clamp(48px,5.8vw,86px)/.9 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:-.065em}.kwo-title em{font-style:normal;color:var(--kwo-sage)}
.kwo-side{max-width:620px}.kwo-lead{margin:0;color:rgba(247,245,239,.7);font:400 clamp(16px,1.35vw,20px)/1.55 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
.kwo-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:28px}.kwo-btn{display:inline-flex;min-height:52px;align-items:center;justify-content:center;padding:0 22px;border-radius:10px;background:var(--kwo-beige);color:#080909!important;text-decoration:none;font-size:10px;font-weight:850;letter-spacing:.05em;text-transform:uppercase}.kwo-btn--ghost{background:transparent;color:#fff!important;border:1px solid rgba(255,255,255,.3)}
.kwo-metrics{display:grid;grid-template-columns:repeat(4,1fr);margin-top:clamp(58px,7vw,92px);border-top:1px solid var(--kwo-line);border-bottom:1px solid var(--kwo-line)}
.kwo-metric{min-height:126px;padding:20px 24px 20px 0;border-right:1px solid var(--kwo-line)}.kwo-metric:not(:first-child){padding-left:24px}.kwo-metric:last-child{border-right:0}.kwo-metric small{display:block;color:rgba(255,255,255,.42);font-size:8px;font-weight:800;letter-spacing:.14em}.kwo-metric strong{display:block;margin-top:26px;color:#fff;font-size:18px;letter-spacing:-.02em}.kwo-metric span{display:block;margin-top:7px;color:var(--kwo-sage);font-size:9px;letter-spacing:.08em;text-transform:uppercase}
.kps-system{border-top:0!important}
@media(max-width:900px){.kwo-shell{width:min(calc(100% - 40px),900px)}.kwo-logo{font-size:clamp(82px,20vw,160px)}.kwo-grid{grid-template-columns:1fr;gap:24px}.kwo-side{max-width:720px}.kwo-metrics{grid-template-columns:1fr 1fr}.kwo-metric:nth-child(2){border-right:0}.kwo-metric:nth-child(-n+2){border-bottom:1px solid var(--kwo-line)}.kwo-metric:nth-child(3){padding-left:0}}
@media(max-width:620px){.kwo-hero{padding:34px 0 46px}.kwo-shell{width:min(calc(100% - 28px),900px)}.kwo-topline{margin-bottom:22px}.kwo-logo{font-size:clamp(62px,21vw,86px);line-height:.78;letter-spacing:-.08em}.kwo-grid{margin-top:38px;padding-top:20px}.kwo-title{font-size:clamp(43px,13vw,58px);line-height:.92}.kwo-lead{font-size:15px;line-height:1.52}.kwo-actions{display:grid;gap:10px;margin-top:22px}.kwo-btn{width:100%;min-height:50px}.kwo-metrics{grid-template-columns:1fr;margin-top:42px}.kwo-metric,.kwo-metric:not(:first-child),.kwo-metric:nth-child(3){display:grid;grid-template-columns:34px 1fr auto;align-items:center;gap:12px;min-height:0;padding:15px 0;border-right:0;border-bottom:1px solid var(--kwo-line)}.kwo-metric:last-child{border-bottom:0}.kwo-metric strong,.kwo-metric span{margin:0}.kwo-metric span{text-align:right}.kp-top .kp-mini{display:none!important}}
</style>`;

function replaceHero(html, page) {
  const marker = 'class="kpf-hero"';
  const at = html.indexOf(marker);
  if (at < 0) throw new Error(`[homepage-whoop-stepup-v2] hero not found in ${page.file}`);
  const start = html.lastIndexOf('<section', at);
  const endAt = html.indexOf('</section>', at);
  if (start < 0 || endAt < 0) throw new Error(`[homepage-whoop-stepup-v2] hero boundaries not found in ${page.file}`);
  const end = endAt + '</section>'.length;
  const metrics = page.metrics.map(([n,t,v]) => `<div class="kwo-metric"><small>${n}</small><strong>${t}</strong><span>${v}</span></div>`).join('');
  const hero = `<section class="kwo-hero"><div class="kwo-shell"><div class="kwo-topline"><p class="kwo-ey">${page.eyebrow}</p><span class="kwo-beta">${page.beta}</span></div><div class="kwo-logo" aria-label="KŌMØ">KŌMØ</div><div class="kwo-grid"><h1 class="kwo-title">${page.title}</h1><div class="kwo-side"><p class="kwo-lead">${page.lead}</p><div class="kwo-actions"><a class="kwo-btn" href="https://pulse.komolongevity.com/">${page.primary} ↗</a><a class="kwo-btn kwo-btn--ghost" href="${page.caseHref}">${page.secondary} →</a></div></div></div><div class="kwo-metrics">${metrics}</div></div></section>`;
  return html.slice(0, start) + hero + html.slice(end);
}

for (const page of pages) {
  let html = await readFile(page.file, 'utf8');
  html = replaceHero(html, page);
  html = html.replace(/<link\s+rel="preload"\s+as="image"\s+href="\/assets\/images\/komo-case-hero-final\.avif"[^>]*>/gi, '');
  html = html.replace(/<style id="komo-case-hero-final-style">[\s\S]*?<\/style>/gi, '');
  html = html.replace(/<style id="homepage-whoop-stepup-v2-style">[\s\S]*?<\/style>/gi, '');
  html = html.replace('</head>', `${CSS}</head>`);
  await writeFile(page.file, html);
  console.log(`[homepage-whoop-stepup-v2] upgraded ${page.file}`);
}
