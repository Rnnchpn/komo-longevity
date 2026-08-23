import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');
const ORIGIN = 'https://komolongevity.com';

const locales = {
  fr: {
    prefix: '/fr', home: '/fr/', library: '/media', network: '/fr/network/', partners: '/fr/partners/', pulse: '/fr/pulse/',
    labels: { case:'Case', motion:'Motion', clinical:'Clinical', pulse:'Pulse', network:'Réseau', library:'Library', partners:'Professionnels', science:'Science' },
    discoveryK:'KŌMØ · ÉCOSYSTÈME', discoveryTitle:'Continuer l’exploration', discoveryText:'Chaque brique répond à une question précise : mesurer, interpréter, suivre ou trouver un lieu équipé.'
  },
  en: {
    prefix: '', home: '/', library: '/en/media', network: '/network/', partners: '/partners/', pulse: '/pulse/',
    labels: { case:'Case', motion:'Motion', clinical:'Clinical', pulse:'Pulse', network:'Network', library:'Library', partners:'Professionals', science:'Science' },
    discoveryK:'KŌMØ · ECOSYSTEM', discoveryTitle:'Continue exploring', discoveryText:'Each layer answers one clear question: measure, interpret, follow or find an equipped location.'
  },
  es: {
    prefix: '/es', home: '/es/', library: '/es/media', network: '/es/network/', partners: '/es/partners/', pulse: '/es/pulse/',
    labels: { case:'Case', motion:'Motion', clinical:'Clinical', pulse:'Pulse', network:'Red', library:'Library', partners:'Profesionales', science:'Ciencia' },
    discoveryK:'KŌMØ · ECOSISTEMA', discoveryTitle:'Seguir explorando', discoveryText:'Cada capa responde a una pregunta clara: medir, interpretar, seguir o encontrar un centro equipado.'
  }
};

const seo = {
  fr: {
    case: ['KŌMØ Case | Valise de bilan locomoteur mobile','KŌMØ Case est la valise de bilan locomoteur mobile : 6 capteurs Myodev, 2 tablettes, trépied, protocole standardisé et connexion à KŌMØ Pulse.'],
    motion: ['KŌMØ Motion | Bilan de mobilité pour hôtels, fitness & entreprises','KŌMØ Motion permet aux hôtels, centres de longévité, clubs fitness et entreprises de proposer un bilan de mobilité instrumenté non médical avec KŌMØ Case et Pulse.'],
    clinical: ['KŌMØ Clinical | Évaluation locomotrice pour médecins','KŌMØ Clinical structure l’évaluation locomotrice médicale : marche, fonction musculaire, équilibre, posture et tests fonctionnels, interprétés par un médecin.'],
    partners: ['KŌMØ pour les professionnels | Motion & Clinical','Déployer KŌMØ dans votre structure : Motion pour les usages commerciaux non médicaux, Clinical pour les médecins et structures médicales, avec KŌMØ Case et Pulse.'],
    network: ['Réseau KŌMØ | Praticiens & centres équipés','Trouvez les praticiens et centres équipés ou labellisés KŌMØ. Annuaire par pays, carte interactive et accès au réseau de longévité locomotrice.'],
    pulse: ['KŌMØ Pulse | Résultats & suivi de mobilité','KŌMØ Pulse réunit les résultats, la restitution et le suivi longitudinal de la mobilité après un KŌMØ Check ou un bilan réalisé avec KŌMØ Case.'],
    science: ['Science KŌMØ | Méthode & validation locomotrice','Découvrez la méthode scientifique KŌMØ, les tests fonctionnels, les mesures de marche et de fonction musculaire, et les éléments encore en cours de validation.']
  },
  en: {
    case: ['KŌMØ Case | Portable locomotor assessment case','KŌMØ Case is a portable locomotor assessment system with six Myodev sensors, two tablets, tripod, standardized workflow and KŌMØ Pulse access.'],
    motion: ['KŌMØ Motion | Mobility assessment for hospitality, fitness & companies','KŌMØ Motion helps hotels, longevity centers, fitness clubs and companies offer non-medical instrumented mobility assessments with KŌMØ Case and Pulse.'],
    clinical: ['KŌMØ Clinical | Locomotor assessment for physicians','KŌMØ Clinical structures medical locomotor assessment across gait, muscle function, balance, posture and functional testing under physician responsibility.'],
    partners: ['KŌMØ for professionals | Motion & Clinical','Deploy KŌMØ in your organization: Motion for non-medical commercial use, Clinical for physicians and medical settings, with KŌMØ Case and Pulse.'],
    network: ['KŌMØ Network | Equipped practitioners & centers','Find KŌMØ-equipped or KŌMØ-labeled practitioners and centers by country with an interactive map and locomotor longevity directory.'],
    pulse: ['KŌMØ Pulse | Mobility results & longitudinal follow-up','KŌMØ Pulse brings together results, restitution and longitudinal mobility follow-up after a KŌMØ Check or KŌMØ Case assessment.'],
    science: ['KŌMØ Science | Locomotor method & validation','Explore the KŌMØ scientific method, functional tests, gait and muscle measurements, and the components that remain under dedicated validation.']
  },
  es: {
    case: ['KŌMØ Case | Maleta portátil de evaluación locomotora','KŌMØ Case es un sistema portátil de evaluación locomotora con seis sensores Myodev, dos tabletas, trípode, protocolo estandarizado y acceso a KŌMØ Pulse.'],
    motion: ['KŌMØ Motion | Evaluación de movilidad para hoteles, fitness y empresas','KŌMØ Motion permite a hoteles, centros de longevidad, clubes fitness y empresas ofrecer una evaluación instrumentada no médica con KŌMØ Case y Pulse.'],
    clinical: ['KŌMØ Clinical | Evaluación locomotora para médicos','KŌMØ Clinical estructura la evaluación locomotora médica de marcha, función muscular, equilibrio, postura y pruebas funcionales bajo responsabilidad médica.'],
    partners: ['KŌMØ para profesionales | Motion & Clinical','Despliegue KŌMØ en su organización: Motion para usos comerciales no médicos, Clinical para médicos y estructuras sanitarias, con KŌMØ Case y Pulse.'],
    network: ['Red KŌMØ | Profesionales y centros equipados','Encuentre profesionales y centros equipados o acreditados KŌMØ por país, con mapa interactivo y directorio de longevidad locomotora.'],
    pulse: ['KŌMØ Pulse | Resultados y seguimiento de movilidad','KŌMØ Pulse reúne resultados, restitución y seguimiento longitudinal de la movilidad tras un KŌMØ Check o una evaluación con KŌMØ Case.'],
    science: ['Ciencia KŌMØ | Método y validación locomotora','Descubra el método científico KŌMØ, las pruebas funcionales, las medidas de marcha y función muscular y los componentes aún en validación.']
  }
};

const pages = [
  ['case','case/index.html'], ['case','case/equipment/index.html'], ['case','case/workflow/index.html'], ['case','case/pulse/index.html'],
  ['motion','motion/index.html'], ['clinical','clinical/index.html'],
  ['partners','partners/index.html'], ['partners','partners/motion/index.html'], ['partners','partners/clinical/index.html'], ['partners','partners/deployment/index.html'],
  ['network','network/index.html'], ['network','network/france/index.html'],
  ['pulse','pulse/index.html'], ['science','science/index.html']
];

const css = `<style id="seo-growth-style">.seo-discovery{padding:64px 0;border-top:1px solid rgba(18,20,16,.13);background:#fdfcf8;color:#121410}.seo-discovery__shell{width:min(calc(100% - 40px),1160px);margin:auto}.seo-discovery__k{margin:0 0 14px;color:#627166;font:800 9px/1.2 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:.15em;text-transform:uppercase}.seo-discovery__head{display:grid;grid-template-columns:.9fr 1.1fr;gap:48px;align-items:end;margin-bottom:28px}.seo-discovery h2{margin:0;font:400 clamp(38px,4.6vw,58px)/.95 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.045em}.seo-discovery__head p{margin:0;max-width:520px;color:#707670;font:400 16px/1.65 'Iowan Old Style',Baskerville,Georgia,serif}.seo-discovery__links{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #121410}.seo-discovery__links a{min-height:112px;padding:18px 18px 16px 0;border-right:1px solid rgba(18,20,16,.13);border-bottom:1px solid rgba(18,20,16,.13);text-decoration:none;color:inherit}.seo-discovery__links a:last-child{border-right:0}.seo-discovery__links small{display:block;margin-bottom:25px;color:#627166;font:800 8px/1.2 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:.11em;text-transform:uppercase}.seo-discovery__links strong{font:400 23px/1 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.025em}@media(max-width:760px){.seo-discovery{padding:52px 0}.seo-discovery__shell{width:min(calc(100% - 28px),1160px)}.seo-discovery__head{grid-template-columns:1fr;gap:14px}.seo-discovery__links{grid-template-columns:1fr 1fr}.seo-discovery__links a:nth-child(2){border-right:0}.seo-discovery__links a{min-height:94px}.seo-discovery__links strong{font-size:20px}}@media(max-width:430px){.seo-discovery__links{grid-template-columns:1fr}.seo-discovery__links a{border-right:0;min-height:74px}.seo-discovery__links small{margin-bottom:13px}}</style>`;

function replaceMeta(html, name, value, property=false){
  const attr = property ? 'property' : 'name';
  const rx = new RegExp(`<meta\\s+${attr}=["']${name}["'][^>]*>`, 'i');
  const tag = `<meta ${attr}="${name}" content="${value.replace(/"/g,'&quot;')}">`;
  return rx.test(html) ? html.replace(rx,tag) : html.replace('</head>',`${tag}</head>`);
}
function replaceTitle(html, value){ return /<title>[\s\S]*?<\/title>/i.test(html) ? html.replace(/<title>[\s\S]*?<\/title>/i,`<title>${value}</title>`) : html.replace('</head>',`<title>${value}</title></head>`); }
function canonicalOf(html){ return (html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)||[])[1] || ''; }
function langOf(html, fallback){ return (html.match(/<html[^>]*lang=["']([^"']+)["']/i)||[])[1] || fallback; }
function esc(s=''){ return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }

function breadcrumbItems(canonical, locale){
  if(!canonical.startsWith(ORIGIN)) return [];
  const u = new URL(canonical); const parts = u.pathname.split('/').filter(Boolean);
  const loc = locales[locale];
  const items = [{ name: locale==='fr'?'Accueil':locale==='es'?'Inicio':'Home', url: ORIGIN + loc.home }];
  const labels = { case:'KŌMØ Case', equipment:locale==='fr'?'Équipement':locale==='es'?'Equipamiento':'Equipment', workflow:'Workflow', pulse:'KŌMØ Pulse', motion:'KŌMØ Motion', clinical:'KŌMØ Clinical', partners:loc.labels.partners, deployment:locale==='fr'?'Déploiement':locale==='es'?'Despliegue':'Deployment', network:loc.labels.network, france:'France', science:loc.labels.science };
  let path = '';
  for(const part of parts){
    if(['fr','es','en'].includes(part)) { path += `/${part}`; continue; }
    path += `/${part}`;
    if(labels[part]) items.push({name:labels[part],url:ORIGIN+path+'/'});
  }
  return items;
}

function schemaBlock(canonical, locale){
  const crumbs = breadcrumbItems(canonical,locale);
  const org = { '@context':'https://schema.org','@type':'Organization','@id':ORIGIN+'/#organization', name:'KŌMØ Longevity', url:ORIGIN+'/', email:'contact@komolongevity.com', description: locale==='fr'?'KŌMØ développe un système de mesure et de suivi de la mobilité humaine dédié à la longévité locomotrice.':locale==='es'?'KŌMØ desarrolla un sistema de medición y seguimiento de la movilidad humana dedicado a la longevidad locomotora.':'KŌMØ develops a system for measuring and following human mobility across the lifespan.' };
  const scripts = [`<script type="application/ld+json" data-seo-growth="organization">${JSON.stringify(org)}</script>`];
  if(crumbs.length>1){ const bc={ '@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:crumbs.map((x,i)=>({'@type':'ListItem',position:i+1,name:x.name,item:x.url}))}; scripts.push(`<script type="application/ld+json" data-seo-growth="breadcrumbs">${JSON.stringify(bc)}</script>`); }
  return scripts.join('');
}

function discovery(locale,currentCanonical){
  const l=locales[locale];
  const candidates=[
    [l.labels.case, `${l.prefix}/case/`||'/case/','Portable system'],
    [l.labels.motion, `${l.prefix}/motion/`||'/motion/','Measurement'],
    [l.labels.clinical, `${l.prefix}/clinical/`||'/clinical/','Clinical'],
    [l.labels.pulse, l.pulse,'Follow-up'],
    [l.labels.network, l.network,'Network'],
    [l.labels.library, l.library,'Knowledge'],
    [l.labels.partners, l.partners,'Deploy']
  ];
  const currentPath = currentCanonical ? new URL(currentCanonical).pathname : '';
  const links = candidates.filter(x=>x[1]!==currentPath).slice(0,4);
  return `<section class="seo-discovery" aria-labelledby="seo-discovery-title"><div class="seo-discovery__shell"><p class="seo-discovery__k">${l.discoveryK}</p><div class="seo-discovery__head"><h2 id="seo-discovery-title">${l.discoveryTitle}</h2><p>${l.discoveryText}</p></div><nav class="seo-discovery__links" aria-label="${esc(l.discoveryTitle)}">${links.map((x,i)=>`<a href="${x[1]}"><small>0${i+1} · ${x[2]}</small><strong>${esc(x[0])} →</strong></a>`).join('')}</nav></div></section>`;
}

for(const [locale,l] of Object.entries(locales)){
  for(const [kind,rel] of pages){
    const path = join(site, locale==='en'?rel:join(locale,rel));
    let html; try{ html=await readFile(path,'utf8'); }catch{ continue; }
    const [title,desc] = seo[locale][kind];
    html = replaceTitle(html,title);
    html = replaceMeta(html,'description',desc);
    html = replaceMeta(html,'og:title',title,true);
    html = replaceMeta(html,'og:description',desc,true);
    html = replaceMeta(html,'twitter:card','summary_large_image');
    const canonical = canonicalOf(html);
    if(canonical){ html = replaceMeta(html,'og:url',canonical,true); }
    if(kind==='case' || kind==='motion' || kind==='clinical' || kind==='partners') html = replaceMeta(html,'og:image',`${ORIGIN}/assets/images/komo-case-overview.jpeg`,true);
    html = html.replace(/<script type="application\/ld\+json" data-seo-growth="(?:organization|breadcrumbs)">[\s\S]*?<\/script>/g,'');
    html = html.replace('</head>',`${schemaBlock(canonical,langOf(html,locale).slice(0,2))}${css}</head>`);
    html = html.replace(/<section class="seo-discovery"[\s\S]*?<\/section>/g,'');
    const block = discovery(locale,canonical);
    if(/<footer\b/i.test(html)) html = html.replace(/<footer\b/i,`${block}<footer`);
    else if(/<\/main>/i.test(html)) html = html.replace(/<\/main>/i,`${block}</main>`);
    html = html.replaceAll('Intégrée charging','Charge intégrée').replaceAll('Intégrée Charge','Charge intégrée').replaceAll('Integrated Charge','Integrated charging');
    await writeFile(path,html,'utf8');
    console.log(`[seo-growth-v1] ${locale} ${rel}`);
  }
}
