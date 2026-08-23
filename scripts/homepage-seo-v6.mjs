import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const site=join(root,'site');

const cfg={
 fr:{
  file:join(site,'fr','index.html'),url:'https://komolongevity.com/fr/',check:'/fr/check/',partners:'/fr/partners/',
  title:'KŌMØ | Test de mobilité, bilan locomoteur & longévité',
  desc:'Testez votre mobilité gratuitement avec KŌMØ Check, puis approfondissez avec un bilan locomoteur mobile de la marche, du muscle, de l’équilibre et de la posture.',
  eyebrow:'LONGÉVITÉ LOCOMOTRICE · MESURE · PRÉVENTION',
  heading:'Mesurer votre mobilité.<br><em>Préserver votre trajectoire.</em>',
  lead:'La mobilité évolue souvent avant de devenir une limitation évidente. KŌMØ rend cette trajectoire visible : un premier test gratuit en ligne, puis une mesure approfondie de la marche, de la fonction musculaire, de l’équilibre et de la posture lorsque cela est pertinent.',
  primary:'Tester ma mobilité gratuitement',secondary:'Découvrir le bilan complet',
  note:'KŌMØ Check · ≈ 8 min · sans compte · résultat immédiat',
  flow:[
   ['01','KŌMØ Check','Un premier repère de mobilité, gratuitement et sans inscription.'],
   ['02','KŌMØ Case','Un bilan instrumenté, portable et standardisé.'],
   ['03','Motion ou Clinical','Une lecture adaptée au contexte commercial ou médical.'],
   ['04','KŌMØ Pulse','Des résultats clairs et une trajectoire suivie dans le temps.']
  ]
 },
 en:{
  file:join(site,'index.html'),url:'https://komolongevity.com/',check:'/check/',partners:'/partners/',
  title:'KŌMØ | Mobility test, locomotor assessment & longevity',
  desc:'Test your mobility for free with KŌMØ Check, then go deeper with a portable locomotor assessment of gait, muscle function, balance and posture.',
  eyebrow:'LOCOMOTOR LONGEVITY · MEASUREMENT · PREVENTION',
  heading:'Measure mobility.<br><em>Preserve the trajectory.</em>',
  lead:'Mobility often changes before limitation becomes obvious. KŌMØ makes that trajectory visible: start with a free online mobility check, then move to an instrumented assessment of gait, muscle function, balance and posture when relevant.',
  primary:'Test my mobility for free',secondary:'Discover the full assessment',
  note:'KŌMØ Check · ≈ 8 min · no account · instant result',
  flow:[
   ['01','KŌMØ Check','A first mobility reference, free and without registration.'],
   ['02','KŌMØ Case','A portable, standardized instrumented assessment.'],
   ['03','Motion or Clinical','Interpretation adapted to commercial or medical use.'],
   ['04','KŌMØ Pulse','Clear results and a mobility trajectory followed over time.']
  ]
 },
 es:{
  file:join(site,'es','index.html'),url:'https://komolongevity.com/es/',check:'/es/check/',partners:'/es/partners/',
  title:'KŌMØ | Test de movilidad, evaluación locomotora y longevidad',
  desc:'Evalúe su movilidad gratis con KŌMØ Check y profundice con una evaluación locomotora portátil de la marcha, función muscular, equilibrio y postura.',
  eyebrow:'LONGEVIDAD LOCOMOTORA · MEDICIÓN · PREVENCIÓN',
  heading:'Medir la movilidad.<br><em>Preservar la trayectoria.</em>',
  lead:'La movilidad suele cambiar antes de que aparezca una limitación evidente. KŌMØ hace visible esa trayectoria: empiece con un test de movilidad online gratuito y profundice después con una evaluación instrumentada cuando sea pertinente.',
  primary:'Evaluar mi movilidad gratis',secondary:'Descubrir la evaluación completa',
  note:'KŌMØ Check · ≈ 8 min · sin cuenta · resultado inmediato',
  flow:[
   ['01','KŌMØ Check','Una primera referencia de movilidad, gratuita y sin registro.'],
   ['02','KŌMØ Case','Una evaluación instrumentada, portátil y estandarizada.'],
   ['03','Motion o Clinical','Una lectura adaptada al uso comercial o médico.'],
   ['04','KŌMØ Pulse','Resultados claros y una trayectoria seguida en el tiempo.']
  ]
 }
};

const style=`<style id="homepage-seo-v6-style">.hp-check-note{display:block;margin-top:12px;color:var(--komo-muted);font-size:10px;line-height:1.45;letter-spacing:.015em}.hp-hero-v4__copy .hp-actions{margin-bottom:0}@media(max-width:620px){.hp-check-note{margin-top:10px;font-size:9px}}</style>`;
function meta(html,name,value,property=false){const a=property?'property':'name';const rx=new RegExp(`<meta\\s+${a}=["']${name}["'][^>]*>`,'i');const tag=`<meta ${a}="${name}" content="${value.replace(/"/g,'&quot;')}">`;return rx.test(html)?html.replace(rx,tag):html.replace('</head>',`${tag}</head>`)}
function hero(c){return `<section class="hp-hero"><div class="hp-shell"><p class="hp-eyebrow">${c.eyebrow}</p><h1 class="hp-hero__brand">KŌMØ<span>Longevity</span></h1><div class="hp-hero-v4__intro"><h2>${c.heading}</h2><div class="hp-hero-v4__copy"><p>${c.lead}</p><div class="hp-actions"><a class="hp-btn" href="${c.check}">${c.primary} →</a><a class="hp-text-link" href="${c.partners}">${c.secondary} ↗</a></div><small class="hp-check-note">${c.note}</small></div></div><div class="hp-hero-v4__trust">${c.flow.map(x=>`<div><span>${x[0]}</span><strong>${x[1]}</strong><small>${x[2]}</small></div>`).join('')}</div></div></section>`}

for(const [locale,c] of Object.entries(cfg)){
 let html=await readFile(c.file,'utf8');
 html=html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${c.title}</title>`);
 html=meta(html,'description',c.desc);html=meta(html,'og:title',c.title,true);html=meta(html,'og:description',c.desc,true);
 const pageSchema={'@context':'https://schema.org','@type':'WebPage',name:c.title,description:c.desc,url:c.url,inLanguage:locale,isPartOf:{'@type':'WebSite',name:'KŌMØ Longevity',url:'https://komolongevity.com/'},about:['locomotor longevity','mobility assessment','gait','functional mobility']};
 html=html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/i,`<script type="application/ld+json">${JSON.stringify(pageSchema)}</script>`);
 html=html.replace(/<section class="hp-hero">[\s\S]*?<\/section>\s*(?=<section class="hp-product-gateway")/,hero(c));
 html=html.replace(/<style id="homepage-seo-v6-style">[\s\S]*?<\/style>/g,'').replace('</head>',`${style}</head>`);
 await writeFile(c.file,html,'utf8');console.log(`[homepage-seo-v6] ${locale}`);
}
