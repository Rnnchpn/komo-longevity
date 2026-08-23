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
    title:'KŌMØ Longevity — Mobile locomotor check-up & follow-up',
    desc:'KŌMØ is a mobile locomotor check-up combining gait, muscle function, balance, posture and functional testing, with results and longitudinal follow-up in KŌMØ Pulse.',
    eyebrow:'MOBILE HEALTH CHECK-UP · LOCOMOTOR LONGEVITY',
    heading:'The mobile health check-up<br><em>for human movement.</em>',
    lead:'KŌMØ is a connected, mobile locomotor assessment system. It brings together gait, muscle function, balance, posture and functional testing to identify functional vulnerabilities early, structure a clear result and follow mobility over time.',
    primary:'Take the KŌMØ Check', secondary:'For professionals',
    flow:[
      ['01','One case','KŌMØ Case makes the assessment portable.'],
      ['02','One clinical assessment','Movement, muscle, balance, posture and functional tests.'],
      ['03','One result','Key findings are brought together in KŌMØ Pulse.'],
      ['04','One follow-up','Track the mobility trajectory over time.']
    ],
    caseK:'KŌMØ CASE', caseTitle:'The locomotor assessment.<br><em>In one case.</em>',
    caseLead:'One portable Case for acquisition, Motion for commercial mobility experiences, Clinical for medical use, and Pulse for results and continuity.',
    labels:['THE SYSTEM','COMMERCIAL','MEDICAL'], pro:'Professional deployment ↗'
  },
  fr: {
    file: join(site,'fr','index.html'),
    home:'/fr/', check:'/fr/check/', case:'/fr/case/', motion:'/fr/motion/', clinical:'/fr/clinical/', network:'/fr/network/', library:'/media', partners:'/fr/partners/',
    oldTitle:'KŌMØ — Longévité locomotrice',
    oldDesc:'KŌMØ rend la mobilité humaine mesurable grâce aux tests fonctionnels, aux données de mouvement, à l’interprétation clinique et au suivi longitudinal.',
    title:'KŌMØ Longevity — Check-up locomoteur mobile & suivi',
    desc:'KŌMØ est un check-up locomoteur mobile réunissant marche, fonction musculaire, équilibre, posture et tests fonctionnels, avec résultats et suivi dans KŌMØ Pulse.',
    eyebrow:'CHECK-UP SANTÉ MOBILE · LONGÉVITÉ LOCOMOTRICE',
    heading:'Le check-up santé mobile<br><em>de la locomotion.</em>',
    lead:'KŌMØ est un système de bilan locomoteur connecté et mobile, conçu comme une clinique de la locomotion transportable. Il réunit marche, fonction musculaire, équilibre, posture et tests fonctionnels pour repérer tôt les fragilités fonctionnelles, structurer un résultat clair et suivre la mobilité dans le temps.',
    primary:'Faire le KŌMØ Check', secondary:'Pour les professionnels',
    flow:[
      ['01','Une valise','KŌMØ Case rend le bilan mobile.'],
      ['02','Un bilan clinique','Marche, muscle, équilibre, posture et tests fonctionnels.'],
      ['03','Un résultat','Les données essentielles sont réunies dans KŌMØ Pulse.'],
      ['04','Un suivi','Comparer la trajectoire de mobilité dans le temps.']
    ],
    caseK:'KŌMØ CASE', caseTitle:'Le bilan locomoteur.<br><em>Dans une valise.</em>',
    caseLead:'Une Case portable pour l’acquisition, Motion pour les usages commerciaux, Clinical pour l’usage médical et Pulse pour les résultats et la continuité.',
    labels:['LE SYSTÈME','COMMERCIAL','MÉDICAL'], pro:'Déploiement professionnel ↗'
  },
  es: {
    file: join(site,'es','index.html'),
    home:'/es/', check:'/es/check/', case:'/es/case/', motion:'/es/motion/', clinical:'/es/clinical/', network:'/es/network/', library:'/es/media', partners:'/es/partners/',
    oldTitle:'KŌMØ — Longevidad locomotora',
    oldDesc:'KŌMØ hace medible la movilidad humana mediante pruebas funcionales, datos de movimiento, interpretación clínica y seguimiento longitudinal.',
    title:'KŌMØ Longevity — Check-up locomotor móvil y seguimiento',
    desc:'KŌMØ es un check-up locomotor móvil que integra marcha, función muscular, equilibrio, postura y pruebas funcionales, con resultados y seguimiento en KŌMØ Pulse.',
    eyebrow:'CHECK-UP DE SALUD MÓVIL · LONGEVIDAD LOCOMOTORA',
    heading:'El check-up de salud móvil<br><em>de la locomoción.</em>',
    lead:'KŌMØ es un sistema de evaluación locomotora conectado y móvil. Integra marcha, función muscular, equilibrio, postura y pruebas funcionales para detectar pronto vulnerabilidades funcionales, estructurar un resultado claro y seguir la movilidad en el tiempo.',
    primary:'Hacer el KŌMØ Check', secondary:'Para profesionales',
    flow:[
      ['01','Una maleta','KŌMØ Case hace portátil la evaluación.'],
      ['02','Una evaluación clínica','Marcha, músculo, equilibrio, postura y pruebas funcionales.'],
      ['03','Un resultado','Los datos esenciales se reúnen en KŌMØ Pulse.'],
      ['04','Un seguimiento','Comparar la trayectoria de movilidad en el tiempo.']
    ],
    caseK:'KŌMØ CASE', caseTitle:'La evaluación locomotora.<br><em>En una sola maleta.</em>',
    caseLead:'Una Case portátil para la adquisición, Motion para usos comerciales, Clinical para uso médico y Pulse para resultados y continuidad.',
    labels:['EL SISTEMA','COMERCIAL','MÉDICO'], pro:'Despliegue profesional ↗'
  }
};

const css = `<style>
/* Homepage V5 — definition first: one case, one assessment, one result, one follow-up */
.hp-brand span{margin-left:7px;font-family:var(--komo-font-display);font-weight:400;letter-spacing:-.02em;color:var(--komo-sage);text-transform:none}
.hp-hero{padding:clamp(54px,7vw,92px) 0 46px}
.hp-hero__brand{margin:0;font-family:var(--komo-font-sans)!important;font-size:clamp(92px,14vw,178px)!important;font-weight:850!important;line-height:.78!important;letter-spacing:-.075em!important;text-transform:uppercase;text-wrap:nowrap!important}
.hp-hero__brand span{display:block;margin-top:clamp(26px,3.5vw,46px);font-family:var(--komo-font-display);font-size:clamp(42px,5.4vw,72px);font-weight:400;line-height:.9;letter-spacing:-.045em;text-transform:none;color:var(--komo-sage)}
.hp-hero-v4__intro{display:grid;grid-template-columns:minmax(0,1fr) minmax(360px,.88fr);gap:clamp(44px,7vw,104px);align-items:end;margin-top:clamp(50px,6vw,76px);padding-top:28px;border-top:1px solid var(--komo-ink)}
.hp-hero-v4__intro h2{margin:0;font:400 clamp(45px,5.8vw,74px)/.93 var(--komo-font-display);letter-spacing:-.055em;text-wrap:balance}
.hp-hero-v4__intro h2 em{font-style:normal;color:var(--komo-sage)}
.hp-hero-v4__copy>p{margin:0;max-width:560px;color:#343934;font:400 18px/1.62 var(--komo-font-display)}
.hp-hero-v4__trust{display:grid;grid-template-columns:repeat(4,1fr);margin-top:48px;border-top:1px solid var(--komo-ink);border-bottom:1px solid var(--komo-line)}
.hp-hero-v4__trust div{min-height:154px;padding:18px 22px 20px 0;border-right:1px solid var(--komo-line)}
.hp-hero-v4__trust div:not(:first-child){padding-left:22px}
.hp-hero-v4__trust div:last-child{border-right:0}
.hp-hero-v4__trust span{display:block;margin-bottom:28px;color:var(--komo-sage);font-size:8px;font-weight:800;letter-spacing:.14em;text-transform:uppercase}
.hp-hero-v4__trust strong{display:block;font:400 clamp(24px,2.25vw,31px)/1 var(--komo-font-display);letter-spacing:-.035em}
.hp-hero-v4__trust small{display:block;margin-top:10px;max-width:225px;color:var(--komo-muted);font-size:10px;line-height:1.5}
.hp-product-gateway{padding-top:clamp(64px,8vw,96px)}
.hp-product-gateway h2{font-size:clamp(46px,5.8vw,72px)}
.hp-product-gateway__copy>div>p{font-size:17px;line-height:1.63}
@media(max-width:900px){.hp-hero__brand{font-size:clamp(82px,16vw,138px)!important}.hp-hero-v4__intro{grid-template-columns:1fr;gap:24px}.hp-hero-v4__trust{grid-template-columns:1fr 1fr}.hp-hero-v4__trust div{min-height:132px}.hp-hero-v4__trust div:nth-child(2){border-right:0}.hp-hero-v4__trust div:nth-child(-n+2){border-bottom:1px solid var(--komo-line)}.hp-hero-v4__trust div:nth-child(3){padding-left:0}}
@media(max-width:620px){
 .hp-brand span{display:none}
 .hp-hero{padding:38px 0 30px}
 .hp-hero .hp-eyebrow{margin-bottom:18px;max-width:280px;line-height:1.45}
 .hp-hero__brand{font-size:clamp(56px,18.5vw,72px)!important;line-height:.82!important;letter-spacing:-.075em!important;max-width:100%}
 .hp-hero__brand span{margin-top:19px;font-size:clamp(34px,10.5vw,41px)!important;line-height:.92}
 .hp-hero-v4__intro{margin-top:36px;padding-top:20px;gap:18px}
 .hp-hero-v4__intro h2{font-size:40px;line-height:.95}
 .hp-hero-v4__copy>p{font-size:16px;line-height:1.55}
 .hp-hero-v4__copy .hp-actions{margin-top:20px}
 .hp-hero-v4__copy .hp-actions .hp-btn{min-height:50px}
 .hp-hero-v4__trust{grid-template-columns:1fr;margin-top:30px}
 .hp-hero-v4__trust div,.hp-hero-v4__trust div:not(:first-child),.hp-hero-v4__trust div:nth-child(3){display:grid;grid-template-columns:36px 1fr;gap:0 12px;min-height:0;padding:16px 0;border-right:0;border-bottom:1px solid var(--komo-line)}
 .hp-hero-v4__trust div:last-child{border-bottom:0}
 .hp-hero-v4__trust span{grid-row:1 / span 2;margin:4px 0 0;font-size:8px}
 .hp-hero-v4__trust strong{font-size:25px}
 .hp-hero-v4__trust small{margin-top:6px;font-size:9px;line-height:1.45}
 .hp-product-gateway{padding-top:46px}
 .hp-product-gateway h2{font-size:43px}
}
@media(max-width:380px){.hp-hero__brand{font-size:clamp(52px,17.5vw,62px)!important}.hp-hero__brand span{font-size:34px!important}.hp-hero-v4__intro h2{font-size:37px}}
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
      <div class="hp-hero-v4__trust">${c.flow.map(x=>`<div><span>${x[0]}</span><strong>${x[1]}</strong><small>${x[2]}</small></div>`).join('')}</div>
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
