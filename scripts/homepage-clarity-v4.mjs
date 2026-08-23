import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');

const cfg = {
  en: {
    file: join(site,'index.html'),
    home:'/', check:'/check/', case:'/case/', motion:'/motion/', clinical:'/clinical/', network:'/network/', library:'/en/media', partners:'/partners/',
    oldTitle:'KŌMØ — Locomotor Longevity',
    oldDesc:'KŌMØ makes human mobility measurable through functional assessment, movement data, clinical interpretation and longitudinal follow-up.',
    title:'KŌMØ Longevity — Mobility assessment & locomotor longevity',
    desc:'KŌMØ combines gait, muscle function, balance, posture and functional testing to build a clear mobility reference and follow it over time.',
    eyebrow:'LOCOMOTOR LONGEVITY',
    heading:'Understand your mobility.<br><em>Follow its trajectory.</em>',
    lead:'KŌMØ combines gait, muscle function, balance, posture and functional testing to build a clear mobility reference, then follow it over time.',
    primary:'Take the KŌMØ Check', secondary:'For professionals',
    trust:[['Public','Free KŌMØ Check'],['System','KŌMØ Case'],['Commercial','KŌMØ Motion'],['Medical','KŌMØ Clinical']],
    caseK:'KŌMØ CASE', caseTitle:'The locomotor assessment.<br><em>In one case.</em>',
    caseLead:'One portable Case for acquisition, Motion for commercial mobility experiences, Clinical for medical use, and Pulse for continuity.',
    labels:['THE SYSTEM','COMMERCIAL','MEDICAL'], pro:'Professional deployment ↗'
  },
  fr: {
    file: join(site,'fr','index.html'),
    home:'/fr/', check:'/fr/check/', case:'/fr/case/', motion:'/fr/motion/', clinical:'/fr/clinical/', network:'/fr/network/', library:'/media', partners:'/fr/partners/',
    oldTitle:'KŌMØ — Longévité locomotrice',
    oldDesc:'KŌMØ rend la mobilité humaine mesurable grâce aux tests fonctionnels, aux données de mouvement, à l’interprétation clinique et au suivi longitudinal.',
    title:'KŌMØ Longevity — Bilan de mobilité & longévité locomotrice',
    desc:'KŌMØ réunit marche, fonction musculaire, équilibre, posture et tests fonctionnels pour construire un repère de mobilité clair et le suivre dans le temps.',
    eyebrow:'LONGÉVITÉ LOCOMOTRICE',
    heading:'Comprendre votre mobilité.<br><em>Suivre sa trajectoire.</em>',
    lead:'KŌMØ réunit marche, fonction musculaire, équilibre, posture et tests fonctionnels pour construire un repère de mobilité clair, puis le suivre dans le temps.',
    primary:'Faire le KŌMØ Check', secondary:'Pour les professionnels',
    trust:[['Public','KŌMØ Check gratuit'],['Système','KŌMØ Case'],['Commercial','KŌMØ Motion'],['Médical','KŌMØ Clinical']],
    caseK:'KŌMØ CASE', caseTitle:'Le bilan locomoteur.<br><em>Dans une valise.</em>',
    caseLead:'Une Case portable pour l’acquisition, Motion pour les usages commerciaux, Clinical pour l’usage médical et Pulse pour la continuité.',
    labels:['LE SYSTÈME','COMMERCIAL','MÉDICAL'], pro:'Déploiement professionnel ↗'
  },
  es: {
    file: join(site,'es','index.html'),
    home:'/es/', check:'/es/check/', case:'/es/case/', motion:'/es/motion/', clinical:'/es/clinical/', network:'/es/network/', library:'/es/media', partners:'/es/partners/',
    oldTitle:'KŌMØ — Longevidad locomotora',
    oldDesc:'KŌMØ hace medible la movilidad humana mediante pruebas funcionales, datos de movimiento, interpretación clínica y seguimiento longitudinal.',
    title:'KŌMØ Longevity — Evaluación de movilidad y longevidad locomotora',
    desc:'KŌMØ integra marcha, función muscular, equilibrio, postura y pruebas funcionales para crear una referencia clara de movilidad y seguirla en el tiempo.',
    eyebrow:'LONGEVIDAD LOCOMOTORA',
    heading:'Comprender su movilidad.<br><em>Seguir su trayectoria.</em>',
    lead:'KŌMØ integra marcha, función muscular, equilibrio, postura y pruebas funcionales para crear una referencia clara de movilidad y seguirla en el tiempo.',
    primary:'Hacer el KŌMØ Check', secondary:'Para profesionales',
    trust:[['Público','KŌMØ Check gratuito'],['Sistema','KŌMØ Case'],['Comercial','KŌMØ Motion'],['Médico','KŌMØ Clinical']],
    caseK:'KŌMØ CASE', caseTitle:'La evaluación locomotora.<br><em>En una sola maleta.</em>',
    caseLead:'Una Case portátil para la adquisición, Motion para usos comerciales, Clinical para uso médico y Pulse para la continuidad.',
    labels:['EL SISTEMA','COMERCIAL','MÉDICO'], pro:'Despliegue profesional ↗'
  }
};

const css = `<style>
/* Homepage V4 — brand-first clarity, inspired by premium preventive-health information architecture */
.hp-brand span{margin-left:7px;font-family:var(--komo-font-display);font-weight:400;letter-spacing:-.02em;color:var(--komo-sage);text-transform:none}
.hp-hero{padding:clamp(58px,8vw,104px) 0 52px}
.hp-hero__brand{margin:0;font-family:var(--komo-font-sans)!important;font-size:clamp(92px,14vw,178px)!important;font-weight:850!important;line-height:.78!important;letter-spacing:-.075em!important;text-transform:uppercase;text-wrap:nowrap!important}
.hp-hero__brand span{display:block;margin-top:clamp(26px,3.5vw,46px);font-family:var(--komo-font-display);font-size:clamp(42px,5.4vw,72px);font-weight:400;line-height:.9;letter-spacing:-.045em;text-transform:none;color:var(--komo-sage)}
.hp-hero-v4__intro{display:grid;grid-template-columns:minmax(0,1fr) minmax(340px,.82fr);gap:clamp(46px,8vw,116px);align-items:end;margin-top:clamp(58px,7vw,92px);padding-top:28px;border-top:1px solid var(--komo-ink)}
.hp-hero-v4__intro h2{margin:0;font:400 clamp(42px,5.3vw,68px)/.95 var(--komo-font-display);letter-spacing:-.05em}
.hp-hero-v4__intro h2 em{font-style:normal;color:var(--komo-sage)}
.hp-hero-v4__copy>p{margin:0;max-width:520px;color:#343934;font:400 18px/1.65 var(--komo-font-display)}
.hp-hero-v4__trust{display:grid;grid-template-columns:repeat(4,1fr);margin-top:54px;border-top:1px solid var(--komo-line);border-bottom:1px solid var(--komo-line)}
.hp-hero-v4__trust div{min-height:92px;padding:16px 18px 16px 0;border-right:1px solid var(--komo-line)}
.hp-hero-v4__trust div:last-child{border-right:0}
.hp-hero-v4__trust span{display:block;margin-bottom:16px;color:var(--komo-muted);font-size:8px;font-weight:800;letter-spacing:.11em;text-transform:uppercase}
.hp-hero-v4__trust strong{font:400 21px/1.05 var(--komo-font-display);letter-spacing:-.02em}
.hp-product-gateway{padding-top:clamp(68px,8vw,102px)}
.hp-product-gateway h2{font-size:clamp(46px,5.8vw,72px)}
.hp-product-gateway__copy>div>p{font-size:17px;line-height:1.63}
@media(max-width:900px){.hp-hero__brand{font-size:clamp(82px,16vw,138px)!important}.hp-hero-v4__intro{grid-template-columns:1fr;gap:26px}.hp-hero-v4__trust{grid-template-columns:1fr 1fr}.hp-hero-v4__trust div:nth-child(2){border-right:0}.hp-hero-v4__trust div:nth-child(-n+2){border-bottom:1px solid var(--komo-line)}}
@media(max-width:620px){
 .hp-brand span{display:none}
 .hp-hero{padding:42px 0 34px}
 .hp-hero .hp-eyebrow{margin-bottom:20px}
 .hp-hero__brand{font-size:clamp(62px,20vw,78px)!important;line-height:.82!important;letter-spacing:-.07em!important}
 .hp-hero__brand span{margin-top:21px;font-size:clamp(36px,11.5vw,44px);line-height:.92}
 .hp-hero-v4__intro{margin-top:42px;padding-top:22px;gap:20px}
 .hp-hero-v4__intro h2{font-size:39px;line-height:.96}
 .hp-hero-v4__copy>p{font-size:16px;line-height:1.56}
 .hp-hero-v4__copy .hp-actions{margin-top:21px}
 .hp-hero-v4__copy .hp-actions .hp-btn{min-height:50px}
 .hp-hero-v4__trust{margin-top:34px}
 .hp-hero-v4__trust div{min-height:76px;padding:13px 10px 13px 0}
 .hp-hero-v4__trust span{margin-bottom:11px;font-size:7px}
 .hp-hero-v4__trust strong{font-size:17px}
 .hp-product-gateway{padding-top:50px}
 .hp-product-gateway h2{font-size:43px}
}
</style>`;

function hero(c){
  return `<section class="hp-hero">
    <div class="hp-shell">
      <p class="hp-eyebrow">${c.eyebrow}</p>
      <h1 class="hp-hero__brand">KŌMØ<span>Longevity</span></h1>
      <div class="hp-hero-v4__intro">
        <h2>${c.heading}</h2>
        <div class="hp-hero-v4__copy"><p>${c.lead}</p><div class="hp-actions"><a class="hp-btn" href="${c.check}">${c.primary} →</a><a class="hp-text-link" href="${c.partners}">${c.secondary} ↗</a></div></div>
      </div>
      <div class="hp-hero-v4__trust">${c.trust.map(x=>`<div><span>${x[0]}</span><strong>${x[1]}</strong></div>`).join('')}</div>
    </div>
  </section>`;
}

function gateway(c){
  return `<section class="hp-product-gateway" id="komo-case" aria-labelledby="komo-case-title"><div class="hp-shell"><div class="hp-product-gateway__grid"><figure><img src="/assets/images/komo-case-overview.jpeg" alt="KŌMØ Case portable locomotor assessment system" width="1600" height="1200" loading="eager" decoding="async"></figure><div class="hp-product-gateway__copy"><div><p class="hp-eyebrow">${c.caseK}</p><h2 id="komo-case-title">${c.caseTitle}</h2><p>${c.caseLead}</p></div><div><div class="hp-product-links"><a href="${c.case}"><strong>KŌMØ Case</strong><span>${c.labels[0]} →</span></a><a href="${c.motion}"><strong>KŌMØ Motion</strong><span>${c.labels[1]} →</span></a><a href="${c.clinical}"><strong>KŌMØ Clinical</strong><span>${c.labels[2]} →</span></a></div><div class="hp-product-gateway__meta"><span>6 · Myodev · 2 tablets · tripod</span><a class="hp-text-link" href="${c.partners}">${c.pro}</a></div></div></div></div></div></section>`;
}

function nav(c, locale){
  const networkLabel = locale==='fr'?'Réseau':'Network';
  const proLabel = locale==='fr'?'Professionnels':locale==='es'?'Profesionales':'Professionals';
  const links = [[c.case,'Case'],[c.motion,'Motion'],[c.clinical,'Clinical'],[c.network,networkLabel],[c.library,'Library'],[c.partners,proLabel]];
  return `<nav class="hp-nav" aria-label="Primary navigation">${links.map(x=>`<a href="${x[0]}">${x[1]}</a>`).join('')}</nav>`;
}

for (const [locale,c] of Object.entries(cfg)) {
  let html = await readFile(c.file,'utf8');
  html = html.replaceAll(c.oldTitle,c.title).replaceAll(c.oldDesc,c.desc);
  html = html.replace(/<nav class="hp-nav" aria-label="Primary navigation">[\s\S]*?<\/nav>/, nav(c,locale));
  html = html.replace(/<a class="hp-brand" href="[^"]+" aria-label="KŌMØ">KŌMØ<\/a>/, `<a class="hp-brand" href="${c.home}" aria-label="KŌMØ Longevity">KŌMØ<span>Longevity</span></a>`);
  html = html.replace(/<section class="hp-hero">[\s\S]*?<\/section>\s*(?=<section class="hp-product-gateway")/, hero(c));
  html = html.replace(/<section class="hp-product-gateway"[\s\S]*?<\/section>\s*(?=<section class="hp-section hp-science")/, gateway(c));
  html = html.replace('</head>', `${css}</head>`);
  await writeFile(c.file,html,'utf8');
  console.log(`[homepage-clarity-v4] polished ${locale}`);
}
