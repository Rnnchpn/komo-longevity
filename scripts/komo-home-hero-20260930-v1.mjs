import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const site = join(root, 'site');
const heroAsset = '/assets/images/komo-hero-hd-v4.webp';

// The previous AVIF source showed large block corruption in production.
// Use the clean high-resolution WebP already shipped in src/assets/images instead.
// build.mjs copies src/assets to site/assets before this final homepage pass.
await mkdir(join(site, 'assets', 'images'), { recursive: true });

const dictionaries = {
  en: {
    'KŌMØ — Santé en mouvement | Motion, Clinical & expériences sur mesure':'KŌMØ — Health in motion | Motion, Clinical & tailored experiences',
    'KŌMØ associe évaluation fonctionnelle, accompagnement médical lorsqu’il est indiqué et expériences sur mesure à domicile, en hôtel, à bord ou en retreat.':'KŌMØ combines functional assessment, medical care when indicated, and tailored experiences at home, in hotels, onboard or during retreats.',
    'Nos offres':'Our services',
    'Solutions professionnelles':'Professional solutions',
    'Se connecter':'Sign in',
    'Résultats et suivi':'Results and follow-up',
    'Modules numériques KŌMØ':'KŌMØ digital modules',
    'Bienvenue chez KŌMØ Longevity':'Welcome to KŌMØ Longevity',
    'La plateforme de mesure de votre longévité locomotrice. Découvrez nos solutions fonctionnelles et médicales pour comprendre votre mouvement, mesurer vos capacités et intégrer ces données dans votre suivi de santé.':'The platform for measuring your locomotor longevity. Discover our functional and medical solutions to understand your movement, measure your capacities and integrate these data into your health follow-up.',
    'Découvrir nos solutions':'Explore our solutions',
    'Repères KŌMØ':'KŌMØ key metrics',
    'biomarqueurs sanguins':'blood biomarkers',
    'paramètres musculaires analysés':'muscle parameters analysed',
    'paramètres de marche analysés':'gait parameters analysed',
    'évaluation de votre santé quotidienne par questionnaire personnalisé':'daily health assessment through a personalised questionnaire',
    'Santé':'Health',
    'NOS OFFRES':'OUR SERVICES',
    'Quatre niveaux d’intervention':'Four levels of support',
    'Motion mesure la fonction locomotrice. Clinical ajoute l’évaluation médicale et biologique. Experience permet de réaliser KŌMØ sur site. World complète le suivi par des modules numériques optionnels.':'Motion measures locomotor function. Clinical adds medical and biological assessment. Experience brings KŌMØ on site. World extends follow-up with optional digital modules.',
    '01 · Évaluation fonctionnelle':'01 · Functional assessment',
    'Analyse instrumentée de la marche, de la posture, de l’équilibre, de la force, de la mobilité et de l’activité musculaire. Les résultats sont restitués dans Pulse avec Motion Score, Motion Age et les principaux paramètres fonctionnels.':'Instrumented analysis of gait, posture, balance, strength, mobility and muscle activity. Results are delivered in Pulse with Motion Score, Motion Age and the main functional parameters.',
    '119 paramètres musculaires':'119 muscle parameters',
    '10 paramètres de marche':'10 gait parameters',
    'Tests fonctionnels':'Functional tests',
    'Voir Motion →':'Explore Motion →',
    '02 · Évaluation médicale':'02 · Medical assessment',
    'Consultation médicale, questionnaires personnalisés et intégration de données fonctionnelles et biologiques. Jusqu’à 150+ biomarqueurs peuvent être intégrés selon l’indication et le protocole retenu.':'Medical consultation, personalised questionnaires and integration of functional and biological data. Up to 150+ biomarkers can be integrated depending on the indication and selected protocol.',
    'Consultation médicale':'Medical consultation',
    '150+ biomarqueurs':'150+ biomarkers',
    'Questionnaires personnalisés':'Personalised questionnaires',
    'Voir Clinical →':'Explore Clinical →',
    '03 · Sur site':'03 · On site',
    'Le protocole KŌMØ peut être réalisé dans un yacht, un hôtel, à domicile, en entreprise ou pendant un retreat. Les mesures, la restitution et le suivi restent identiques.':'The KŌMØ protocol can be delivered on a yacht, in a hotel, at home, in a company or during a retreat. Measurements, debrief and follow-up remain consistent.',
    'Voir Experience →':'Explore Experience →',
    '04 · Suivi numérique':'04 · Digital follow-up',
    'World propose des modules de visualisation, d’exercice et de contenu associés au programme KŌMØ. Pulse reste l’espace principal pour les résultats, les rendez-vous et les réévaluations.':'World offers visualisation, exercise and content modules linked to the KŌMØ programme. Pulse remains the primary space for results, appointments and reassessments.',
    'Modules optionnels':'Optional modules',
    'Voir World →':'Explore World →',
    'ÉCOSYSTÈME KŌMØ':'KŌMØ ECOSYSTEM',
    'Résultats, suivi et interventions dans le même environnement':'Results, follow-up and services in one environment',
    'Pulse centralise les données. Yachting et Signature organisent des formats privés. Les professionnels peuvent intégrer KŌMØ dans leur établissement.':'Pulse centralises data. Yachting and Signature organise private formats. Professionals can integrate KŌMØ into their establishment.',
    'Résultats, questionnaires et réévaluations.':'Results, questionnaires and reassessments.',
    'Motion et suivi directement à bord.':'Motion and follow-up directly onboard.',
    'Programme privé coordonné.':'Coordinated private programme.',
    'Intervention sur site et déploiement.':'On-site service and deployment.',
    'Questions fréquentes':'Frequently asked questions',
    'Motion est-il médical ?':'Is Motion medical?',
    'Non. Motion est une évaluation fonctionnelle non diagnostique. Si une consultation médicale est nécessaire, KŌMØ Clinical constitue un parcours séparé.':'No. Motion is a non-diagnostic functional assessment. If a medical consultation is needed, KŌMØ Clinical is a separate pathway.',
    'Que vais-je recevoir ?':'What will I receive?',
    'Une synthèse de votre profil, trois priorités, Motion Score et Motion Age présentés avec leurs limites, un plan et votre suivi dans Pulse.':'A summary of your profile, three priorities, Motion Score and Motion Age presented with their limitations, a plan and your follow-up in Pulse.',
    'Dois-je être sportif ?':'Do I need to be athletic?',
    'Non. Le bilan porte sur des capacités fonctionnelles utiles à la vie quotidienne, quel que soit votre niveau d’activité.':'No. The assessment focuses on functional capacities that matter in daily life, whatever your activity level.',
    'POUR LES PROFESSIONNELS':'FOR PROFESSIONALS',
    'KŌMØ pour les établissements et partenaires':'KŌMØ for establishments and partners',
    'KŌMØ peut réaliser les bilans sur site avec son équipe et son matériel. Une installation permanente de la Case peut être étudiée lorsque le volume d’activité le justifie.':'KŌMØ can deliver assessments on site with its team and equipment. A permanent Case installation can be considered when the activity volume justifies it.',
    'Professionnels →':'Professionals →',
    'Mesurer, comprendre et préserver la mobilité humaine tout au long de la vie.':'Measure, understand and preserve human mobility throughout life.',
    'KŌMØ SAS · Siège social · 45 boulevard de la Croisette · 06400 Cannes · France':'KŌMØ SAS · Registered office · 45 boulevard de la Croisette · 06400 Cannes · France',
    'Patients':'Patients',
    'Méthode':'Method',
    'Votre bilan':'Your assessment',
    'Réseau':'Network',
    'Professionnels':'Professionals',
    'Juridique':'Legal',
    'Mentions légales':'Legal notice',
    'Confidentialité':'Privacy',
    'Conditions d’utilisation':'Terms of use',
    'Informations médicales':'Medical information',
    'Propriété intellectuelle':'Intellectual property',
    'CGV (version préparatoire)':'Terms of sale (draft)',
    'évaluation fonctionnelle du mouvement sur la Côte d’Azur':'functional movement assessment on the French Riviera'
  },
  es: {
    'KŌMØ — Santé en mouvement | Motion, Clinical & expériences sur mesure':'KŌMØ — Salud en movimiento | Motion, Clinical y experiencias a medida',
    'KŌMØ associe évaluation fonctionnelle, accompagnement médical lorsqu’il est indiqué et expériences sur mesure à domicile, en hôtel, à bord ou en retreat.':'KŌMØ combina evaluación funcional, atención médica cuando está indicada y experiencias a medida en casa, en hoteles, a bordo o durante retreats.',
    'Nos offres':'Nuestras soluciones',
    'Solutions professionnelles':'Soluciones profesionales',
    'Se connecter':'Acceder',
    'Résultats et suivi':'Resultados y seguimiento',
    'Modules numériques KŌMØ':'Módulos digitales KŌMØ',
    'Bienvenue chez KŌMØ Longevity':'Bienvenido a KŌMØ Longevity',
    'La plateforme de mesure de votre longévité locomotrice. Découvrez nos solutions fonctionnelles et médicales pour comprendre votre mouvement, mesurer vos capacités et intégrer ces données dans votre suivi de santé.':'La plataforma para medir su longevidad locomotora. Descubra nuestras soluciones funcionales y médicas para comprender su movimiento, medir sus capacidades e integrar estos datos en su seguimiento de salud.',
    'Découvrir nos solutions':'Descubrir nuestras soluciones',
    'Repères KŌMØ':'Indicadores KŌMØ',
    'biomarqueurs sanguins':'biomarcadores sanguíneos',
    'paramètres musculaires analysés':'parámetros musculares analizados',
    'paramètres de marche analysés':'parámetros de marcha analizados',
    'évaluation de votre santé quotidienne par questionnaire personnalisé':'evaluación de su salud diaria mediante cuestionario personalizado',
    'Santé':'Salud',
    'NOS OFFRES':'NUESTRAS SOLUCIONES',
    'Quatre niveaux d’intervention':'Cuatro niveles de intervención',
    'Motion mesure la fonction locomotrice. Clinical ajoute l’évaluation médicale et biologique. Experience permet de réaliser KŌMØ sur site. World complète le suivi par des modules numériques optionnels.':'Motion mide la función locomotora. Clinical añade la evaluación médica y biológica. Experience permite realizar KŌMØ in situ. World completa el seguimiento con módulos digitales opcionales.',
    '01 · Évaluation fonctionnelle':'01 · Evaluación funcional',
    'Analyse instrumentée de la marche, de la posture, de l’équilibre, de la force, de la mobilité et de l’activité musculaire. Les résultats sont restitués dans Pulse avec Motion Score, Motion Age et les principaux paramètres fonctionnels.':'Análisis instrumentado de la marcha, la postura, el equilibrio, la fuerza, la movilidad y la actividad muscular. Los resultados se presentan en Pulse con Motion Score, Motion Age y los principales parámetros funcionales.',
    '119 paramètres musculaires':'119 parámetros musculares',
    '10 paramètres de marche':'10 parámetros de marcha',
    'Tests fonctionnels':'Pruebas funcionales',
    'Voir Motion →':'Ver Motion →',
    '02 · Évaluation médicale':'02 · Evaluación médica',
    'Consultation médicale, questionnaires personnalisés et intégration de données fonctionnelles et biologiques. Jusqu’à 150+ biomarqueurs peuvent être intégrés selon l’indication et le protocole retenu.':'Consulta médica, cuestionarios personalizados e integración de datos funcionales y biológicos. Se pueden integrar hasta 150+ biomarcadores según la indicación y el protocolo seleccionado.',
    'Consultation médicale':'Consulta médica',
    '150+ biomarqueurs':'150+ biomarcadores',
    'Questionnaires personnalisés':'Cuestionarios personalizados',
    'Voir Clinical →':'Ver Clinical →',
    '03 · Sur site':'03 · In situ',
    'Le protocole KŌMØ peut être réalisé dans un yacht, un hôtel, à domicile, en entreprise ou pendant un retreat. Les mesures, la restitution et le suivi restent identiques.':'El protocolo KŌMØ puede realizarse en un yacht, un hotel, en casa, en una empresa o durante un retreat. Las mediciones, la restitución y el seguimiento se mantienen idénticos.',
    'Voir Experience →':'Ver Experience →',
    '04 · Suivi numérique':'04 · Seguimiento digital',
    'World propose des modules de visualisation, d’exercice et de contenu associés au programme KŌMØ. Pulse reste l’espace principal pour les résultats, les rendez-vous et les réévaluations.':'World ofrece módulos de visualización, ejercicio y contenidos asociados al programa KŌMØ. Pulse sigue siendo el espacio principal para resultados, citas y reevaluaciones.',
    'Modules optionnels':'Módulos opcionales',
    'Voir World →':'Ver World →',
    'ÉCOSYSTÈME KŌMØ':'ECOSISTEMA KŌMØ',
    'Résultats, suivi et interventions dans le même environnement':'Resultados, seguimiento e intervenciones en un mismo entorno',
    'Pulse centralise les données. Yachting et Signature organisent des formats privés. Les professionnels peuvent intégrer KŌMØ dans leur établissement.':'Pulse centraliza los datos. Yachting y Signature organizan formatos privados. Los profesionales pueden integrar KŌMØ en su establecimiento.',
    'Résultats, questionnaires et réévaluations.':'Resultados, cuestionarios y reevaluaciones.',
    'Motion et suivi directement à bord.':'Motion y seguimiento directamente a bordo.',
    'Programme privé coordonné.':'Programa privado coordinado.',
    'Intervention sur site et déploiement.':'Intervención in situ y despliegue.',
    'Questions fréquentes':'Preguntas frecuentes',
    'Motion est-il médical ?':'¿Motion es médico?',
    'Non. Motion est une évaluation fonctionnelle non diagnostique. Si une consultation médicale est nécessaire, KŌMØ Clinical constitue un parcours séparé.':'No. Motion es una evaluación funcional no diagnóstica. Si es necesaria una consulta médica, KŌMØ Clinical constituye un recorrido separado.',
    'Que vais-je recevoir ?':'¿Qué voy a recibir?',
    'Une synthèse de votre profil, trois priorités, Motion Score et Motion Age présentés avec leurs limites, un plan et votre suivi dans Pulse.':'Una síntesis de su perfil, tres prioridades, Motion Score y Motion Age presentados con sus límites, un plan y su seguimiento en Pulse.',
    'Dois-je être sportif ?':'¿Tengo que ser deportista?',
    'Non. Le bilan porte sur des capacités fonctionnelles utiles à la vie quotidienne, quel que soit votre niveau d’activité.':'No. La evaluación se centra en capacidades funcionales útiles para la vida diaria, sea cual sea su nivel de actividad.',
    'POUR LES PROFESSIONNELS':'PARA PROFESIONALES',
    'KŌMØ pour les établissements et partenaires':'KŌMØ para establecimientos y partners',
    'KŌMØ peut réaliser les bilans sur site avec son équipe et son matériel. Une installation permanente de la Case peut être étudiée lorsque le volume d’activité le justifie.':'KŌMØ puede realizar las evaluaciones in situ con su equipo y su material. Puede estudiarse una instalación permanente de la Case cuando el volumen de actividad lo justifique.',
    'Professionnels →':'Profesionales →',
    'Mesurer, comprendre et préserver la mobilité humaine tout au long de la vie.':'Medir, comprender y preservar la movilidad humana a lo largo de la vida.',
    'KŌMØ SAS · Siège social · 45 boulevard de la Croisette · 06400 Cannes · France':'KŌMØ SAS · Domicilio social · 45 boulevard de la Croisette · 06400 Cannes · Francia',
    'Patients':'Pacientes',
    'Méthode':'Método',
    'Votre bilan':'Su evaluación',
    'Réseau':'Red',
    'Professionnels':'Profesionales',
    'Juridique':'Legal',
    'Mentions légales':'Aviso legal',
    'Confidentialité':'Privacidad',
    'Conditions d’utilisation':'Condiciones de uso',
    'Informations médicales':'Información médica',
    'Propriété intellectuelle':'Propiedad intelectual',
    'CGV (version préparatoire)':'Condiciones de venta (borrador)',
    'Science':'Ciencia',
    'Contact':'Contacto',
    'évaluation fonctionnelle du mouvement sur la Côte d’Azur':'evaluación funcional del movimiento en la Costa Azul'
  }
};

function replaceAllLiteral(html, from, to){
  return html.split(from).join(to);
}
function translate(html, lang){
  if(lang==='fr') return html;
  const dict=dictionaries[lang]||{};
  for(const [from,to] of Object.entries(dict).sort((a,b)=>b[0].length-a[0].length)){
    html=replaceAllLiteral(html,from,to);
  }
  return html;
}
function cleanPreviousPass(html){
  return html
    .replace(/<style id="komo-home-hero-20260930-v1-style">[\s\S]*?<\/style>/g,'')
    .replace(/<style id="komo-home-hero-20260930-v2-style">[\s\S]*?<\/style>/g,'')
    .replace(/<style id="komo-home-unified-v3-style">[\s\S]*?<\/style>/g,'')
    .replace(/<script id="komo-home-hero-20260930-v2-runtime">[\s\S]*?<\/script>/g,'')
    .replace(/<link rel="preload" as="image" href="\/assets\/images\/(?:komo-hero-20260930\.avif|komo-hero-restored-20260930\.avif|komo-hero-final-v2-20260930\.webp|komo-hero-hd-v4\.webp)"[^>]*>\s*/g,'');
}
function setLanguageSwitch(html, lang, isRoot=false){
  const current=lang==='fr'?'FR':lang==='en'?'EN':'ES';
  const frHref=isRoot?'/':'/fr/';
  const block=`<div class="kp-langs"><a href="${frHref}"${current==='FR'?' aria-current="page"':''}>FR</a><a href="/en/"${current==='EN'?' aria-current="page"':''}>EN</a><a href="/es/"${current==='ES'?' aria-current="page"':''}>ES</a></div>`;
  return html.replace(/<div class="kp-langs">[\s\S]*?<\/div>/,block);
}
function localizePaths(html, lang, isRoot=false){
  if(lang==='en'){
    html=html.replace(/href="\/fr\//g,'href="/en/');
    html=html.replace(/href="\/#/g,'href="/en/#');
  }else if(lang==='es'){
    html=html.replace(/href="\/fr\//g,'href="/es/');
    html=html.replace(/href="\/#/g,'href="/es/#');
  }else if(!isRoot){
    html=html.replace(/href="\/#/g,'href="/fr/#');
  }
  return html;
}
function setSeo(html, lang, isRoot=false){
  const path=isRoot?'':lang+'/';
  const url='https://komolongevity.com/'+path;
  html=html.replace(/<html\s+lang="[^"]*"/i,`<html lang="${lang}"`);
  html=html.replace(/<link rel="canonical" href="[^"]*">/i,`<link rel="canonical" href="${url}">`);
  html=html.replace(/<meta property="og:url" content="[^"]*">/i,`<meta property="og:url" content="${url}">`);
  html=html.replace(/<meta property="og:locale" content="[^"]*">/i,`<meta property="og:locale" content="${lang==='fr'?'fr_FR':lang==='en'?'en_GB':'es_ES'}">`);
  return html;
}

const heroCss=`
<style id="komo-home-unified-v3-style">
.komo-hero-20260930{
  position:relative!important;
  display:block!important;
  min-height:clamp(640px,82vh,840px)!important;
  overflow:hidden!important;
  background:#cdbca8!important;
}
.komo-hero-20260930 .kpv-hero-media{
  position:absolute!important;inset:0!important;width:100%!important;height:100%!important;
  margin:0!important;overflow:hidden!important;z-index:0!important;background:#cdbca8!important;
}
.komo-hero-20260930 .kpv-hero-media:after{
  content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(90deg,rgba(24,21,17,.06) 0%,rgba(24,21,17,0) 42%);
}
.komo-hero-20260930 .kpv-hero-media img{
  display:block!important;
  position:absolute!important;inset:0!important;
  width:100%!important;height:100%!important;min-height:100%!important;
  object-fit:cover!important;object-position:center center!important;
  image-rendering:auto!important;
  opacity:1!important;visibility:visible!important;
  transform:none!important;filter:none!important;
}
.komo-hero-20260930 .kc-hero-copy{
  position:absolute!important;z-index:2!important;left:clamp(28px,4.7vw,72px)!important;
  bottom:clamp(30px,4.4vw,58px)!important;width:min(470px,calc(100% - 56px))!important;
  max-width:470px!important;padding:clamp(24px,2.2vw,30px)!important;margin:0!important;min-height:0!important;
  border:1px solid rgba(255,255,255,.68)!important;border-radius:22px!important;
  background:rgba(248,245,238,.965)!important;box-shadow:0 24px 70px rgba(31,25,19,.10)!important;
  backdrop-filter:none!important;-webkit-backdrop-filter:none!important;
}
.komo-hero-20260930 .kc-hero-copy .kt-title{
  max-width:450px!important;font-size:clamp(54px,4.8vw,74px)!important;line-height:.92!important;letter-spacing:-.05em!important;
}
.komo-hero-20260930 .kc-hero-copy .kt-lead,.komo-hero-20260930 .kc-hero-copy .kt-copy{
  max-width:440px!important;font-size:clamp(15px,1.24vw,18px)!important;line-height:1.55!important;
}
.komo-hero-20260930 .kc-hero-copy .kt-btns{margin-top:24px!important}
.komo-hero-20260930 .kc-hero-copy .kt-btn{min-height:44px!important;padding:0 20px!important}
body .ke-switch,body .ke-pulse{display:none!important}
@media(max-width:1100px) and (min-width:761px){
  .komo-hero-20260930 .kc-hero-copy{width:min(460px,calc(100% - 48px))!important;max-width:460px!important}
  .komo-hero-20260930 .kc-hero-copy .kt-title{font-size:clamp(50px,5.7vw,66px)!important}
}
@media(max-width:760px){
  .komo-hero-20260930{min-height:0!important;display:grid!important;grid-template-columns:1fr!important;background:#f7f2e9!important}
  .komo-hero-20260930 .kpv-hero-media{position:relative!important;inset:auto!important;aspect-ratio:16/11!important;order:0!important}
  .komo-hero-20260930 .kpv-hero-media:after{display:none!important}
  .komo-hero-20260930 .kpv-hero-media img{display:block!important;position:absolute!important;inset:0!important;width:100%!important;height:100%!important;object-fit:cover!important;object-position:51% center!important}
  .komo-hero-20260930 .kc-hero-copy{
    position:relative!important;left:auto!important;bottom:auto!important;order:1!important;width:100%!important;max-width:none!important;
    padding:32px 22px 40px!important;border:0!important;border-radius:0!important;background:#f7f2e9!important;box-shadow:none!important
  }
  .komo-hero-20260930 .kc-hero-copy .kt-title{max-width:100%!important;font-size:clamp(44px,12.6vw,60px)!important;line-height:.94!important}
}
</style>`;

function applyHero(html, lang){
  html=cleanPreviousPass(html);
  html=html
    .replaceAll('/assets/images/komo-hero-restored-20260930.avif',heroAsset)
    .replaceAll('/assets/images/komo-hero-20260930.avif',heroAsset)
    .replaceAll('/assets/images/komo-hero-final-v2-20260930.webp',heroAsset)
    .replaceAll('/assets/images/komo-hero-final-20260930.webp',heroAsset)
    .replaceAll('/assets/images/komo-longevity-v3.webp',heroAsset);
  html=html.replace(
    /(<figure[^>]*class="[^"]*kpv-hero-media[^"]*"[^>]*>\s*<img\s+)([^>]*)(>)/i,
    (_,start,attrs,end)=>{
      const alt=lang==='en'
        ?'KŌMØ Longevity — functional movement assessment on the French Riviera'
        :lang==='es'
          ?'KŌMØ Longevity — evaluación funcional del movimiento en la Costa Azul'
          :'KŌMØ Longevity — évaluation fonctionnelle du mouvement sur la Côte d’Azur';
      let next=attrs.replace(/src="[^"]*"/i,`src="${heroAsset}"`);
      if(!/src="/i.test(next))next=`src="${heroAsset}" `+next;
      next=next.replace(/alt="[^"]*"/i,`alt="${alt}"`);
      if(!/alt="/i.test(next))next+=` alt="${alt}"`;
      next=next.replace(/loading="lazy"/i,'loading="eager"');
      if(!/loading=/i.test(next))next+=' loading="eager"';
      if(!/fetchpriority=/i.test(next))next+=' fetchpriority="high"';
      next=next.replace(/decoding="[^"]*"/i,'decoding="async"');
      if(!/decoding=/i.test(next))next+=' decoding="async"';
      return start+next+end;
    }
  );
  html=html.replace(
    /<section class="([^"]*\bkc-hero\b[^"]*)">/i,
    (_,classes)=>{
      const set=new Set(classes.split(/\s+/).filter(Boolean));set.add('komo-hero-20260930');
      return `<section class="${[...set].join(' ')}">`;
    }
  );
  const preload=`<link rel="preload" as="image" href="${heroAsset}" type="image/webp" fetchpriority="high">`;
  html=html.replace('</head>',preload+'\n'+heroCss+'\n</head>');
  return html;
}

async function ensureDir(rel){await mkdir(join(site,rel),{recursive:true})}

const basePath=join(site,'index.html');
let base=await readFile(basePath,'utf8');
base=cleanPreviousPass(base);

async function writeHomepage(lang, rel, isRoot=false){
  let html=base;
  html=translate(html,lang);
  html=localizePaths(html,lang,isRoot);
  html=setLanguageSwitch(html,lang,isRoot);
  html=setSeo(html,lang,isRoot);
  html=applyHero(html,lang);
  if(!isRoot) await ensureDir(lang);
  await writeFile(join(site,rel),html,'utf8');
}

await writeHomepage('fr','index.html',true);
await writeHomepage('fr','fr/index.html',false);
await writeHomepage('en','en/index.html',false);
await writeHomepage('es','es/index.html',false);

console.log('[komo-home-unified-v7] PASS · corrupted AVIF retired; clean HD WebP hero forced across FR/EN/ES.');
