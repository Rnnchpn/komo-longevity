import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site = join(process.cwd(), 'site');

const STYLE = `<style id="kmx-myocare-style">
.kmx-shell{width:min(calc(100% - 40px),1160px);margin:auto}.kmx-signature{padding:34px 0 38px;background:#121410;color:#fff;border-top:1px solid rgba(255,255,255,.1);border-bottom:1px solid rgba(255,255,255,.1)}.kmx-signature__line{margin:0;font:400 clamp(31px,4.5vw,58px)/.98 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.045em}.kmx-signature__line em{font-style:normal;color:#b6c2b8}.kmx-signature small{display:block;margin-top:14px;color:rgba(255,255,255,.56);font-size:9px;line-height:1.55;letter-spacing:.08em;text-transform:uppercase}.kmx-flow{padding:clamp(68px,8vw,104px) 0;background:#fdfcf8;color:#121410;border-top:1px solid rgba(18,20,16,.13)}.kmx-flow__head{display:grid;grid-template-columns:.88fr 1.12fr;gap:clamp(40px,8vw,104px);align-items:end;margin-bottom:38px}.kmx-flow__ey{margin:0 0 14px;color:#627166;font-size:9px;font-weight:850;letter-spacing:.15em;text-transform:uppercase}.kmx-flow h2{margin:0;font:400 clamp(42px,5.3vw,68px)/.95 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.05em}.kmx-flow__copy{margin:0;color:#707670;font:400 17px/1.68 'Iowan Old Style',Baskerville,Georgia,serif;max-width:590px}.kmx-flow__grid{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #121410}.kmx-flow__item{min-height:230px;padding:22px 24px 22px 0;border-right:1px solid rgba(18,20,16,.13);border-bottom:1px solid rgba(18,20,16,.13)}.kmx-flow__item:not(:first-child){padding-left:24px}.kmx-flow__item:last-child{border-right:0}.kmx-flow__item span{display:block;color:#627166;font-size:8px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.kmx-flow__item h3{margin:44px 0 10px;font:400 29px/1 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.035em}.kmx-flow__item p{margin:0;color:#707670;font-size:12px;line-height:1.62}.kmx-flow__note{margin:18px 0 0;color:#7a807a;font-size:9px;line-height:1.55}.kmx-inline-note{margin:20px 0 0;padding-top:18px;border-top:1px solid rgba(18,20,16,.13);color:#627166!important;font-size:10px!important;line-height:1.55!important}.kmx-inline-note strong{color:#121410}
@media(max-width:900px){.kmx-flow__head{grid-template-columns:1fr;gap:18px}.kmx-flow__grid{grid-template-columns:1fr 1fr}.kmx-flow__item:nth-child(2){border-right:0}.kmx-flow__item:nth-child(3){padding-left:0}}
@media(max-width:620px){.kmx-shell{width:min(calc(100% - 28px),1160px)}.kmx-signature{padding:27px 0 30px}.kmx-signature__line{font-size:35px;line-height:1}.kmx-signature small{font-size:8px;max-width:310px}.kmx-flow{padding:56px 0}.kmx-flow h2{font-size:41px}.kmx-flow__copy{font-size:16px}.kmx-flow__grid{grid-template-columns:1fr}.kmx-flow__item,.kmx-flow__item:not(:first-child),.kmx-flow__item:nth-child(3){min-height:0;padding:19px 0;border-right:0}.kmx-flow__item h3{margin:24px 0 8px;font-size:27px}}
</style>`;

const MOTTO = `One Case. One Assessment. One Platform. <em>A Lifetime in Motion.</em>`;

const cfg = {
  fr: {
    home: join(site,'fr','index.html'), pro: join(site,'fr','partners','index.html'), pulse: join(site,'fr','pulse','index.html'), case: join(site,'fr','case','index.html'),
    homeDesc:'Commencez dans KŌMØ Pulse par un premier repère de mobilité, puis approfondissez avec KŌMØ Case, 6 capteurs Myodev et les données musculaires Myocare.',
    proDesc:'KŌMØ Professional réunit Motion pour les usages commerciaux non médicaux et Clinical pour les médecins, avec KŌMØ Case, Myocare et KŌMØ Pulse.',
    pulseDesc:'KŌMØ Pulse réunit le premier repère de mobilité, les données musculaires fournies par Myocare et les autres dimensions des bilans KŌMØ dans une trajectoire suivie.',
    caseDesc:'KŌMØ Case est la valise de bilan locomoteur mobile : 6 capteurs Myodev, analyse musculaire via Myocare, 2 tablettes, trépied et connexion à Pulse.',
    sigSub:'Built for locomotor longevity. Designed to scale globally.',
    homeStepOld:'Réaliser un bilan instrumenté portable et standardisé.',
    homeStepNew:'Réaliser un bilan instrumenté portable ; l’analyse musculaire est fournie par Myodev via Myocare.',
    homeNote:'<strong>Myodev × KŌMØ.</strong> Les 6 capteurs alimentent Myocare pour la composante musculaire ; Pulse rassemble ensuite ces résultats avec les autres dimensions du bilan.',
    flowEy:'INTÉGRATION MYODEV × KŌMØ',
    proFlowTitle:'Myocare analyse le muscle.<br>Pulse rassemble le bilan.',
    proFlowCopy:'Les six capteurs sont fournis par Myodev. L’acquisition et l’analyse musculaire sont traitées dans Myocare selon les indicateurs disponibles. KŌMØ Pulse est conçu pour recevoir ces résultats et les rapprocher des tests fonctionnels, de la posture, du questionnaire et du contexte.',
    proItems:[['01','KŌMØ Case','Acquisition mobile avec six capteurs Myodev et le protocole KŌMØ.'],['02','Myocare','Myodev traite la composante musculaire et fournit les indicateurs convenus.'],['03','KŌMØ Pulse','Pulse réunit les résultats Myocare avec les autres dimensions du bilan.'],['04','Motion ou Clinical','La restitution dépend ensuite du cadre commercial non médical ou médical.']],
    proNote:'Les variables musculaires disponibles dépendent du protocole Myodev/Myocare et du format de données fourni.',
    pulseFlowTitle:'Plusieurs sources.<br>Une seule trajectoire.',
    pulseFlowCopy:'Pulse n’a pas vocation à remplacer Myocare. Il devient la couche de continuité : il rassemble les résultats issus des outils partenaires avec les mesures fonctionnelles KŌMØ et les organise dans le temps.',
    pulseItems:[['01','Premier repère','Une entrée simple dans Pulse, sans compte pour la version publique actuelle.'],['02','Myocare','Les données de l’analyse musculaire sont fournies par Myodev via Myocare.'],['03','Bilan KŌMØ','Tests fonctionnels, posture, questionnaire et autres mesures gardent leur source identifiable.'],['04','Trajectoire','Pulse est conçu pour réunir les évaluations successives et rendre l’évolution lisible.']],
    caseFlowTitle:'La Case acquiert.<br>Myocare analyse. Pulse réunit.',
    caseFlowCopy:'KŌMØ ne reconstruit pas le moteur d’analyse musculaire de Myodev. Les capteurs et Myocare assurent cette composante ; KŌMØ organise ensuite le bilan multimodal et sa continuité dans Pulse.',
    caseItems:[['01','Équiper','Six capteurs Myodev sont positionnés selon le protocole retenu.'],['02','Analyser','Myocare traite la composante musculaire selon les fonctions fournies par Myodev.'],['03','Compléter','Les tests fonctionnels, la posture et le questionnaire complètent le profil locomoteur.'],['04','Rassembler','Pulse réunit les résultats dans une restitution Motion ou Clinical puis dans le suivi.']],
    caseLeadOld:'L’entrée dans l’écosystème se fait par l’acquisition d’une KŌMØ Case et l’accès par abonnement à KŌMØ Pulse.',
    caseLeadNew:'KŌMØ Case réunit six capteurs fournis par Myodev, deux tablettes et un trépied. Myocare fournit les données de l’analyse musculaire ; KŌMØ Pulse rassemble ensuite le bilan et son suivi.',
    muscleLabel:'Analyse musculaire'
  },
  en: {
    home: join(site,'index.html'), pro: join(site,'partners','index.html'), pulse: join(site,'pulse','index.html'), case: join(site,'case','index.html'),
    homeDesc:'Start in KŌMØ Pulse with a first mobility reference, then go deeper with KŌMØ Case, six Myodev sensors and muscle-analysis data from Myocare.',
    proDesc:'KŌMØ Professional combines Motion for non-medical commercial use and Clinical for physicians, powered by KŌMØ Case, Myocare and KŌMØ Pulse.',
    pulseDesc:'KŌMØ Pulse brings together the first mobility reference, muscle-analysis data supplied through Myocare and the other dimensions of KŌMØ assessments over time.',
    caseDesc:'KŌMØ Case is the portable locomotor assessment system: six Myodev sensors, muscle analysis through Myocare, two tablets, tripod and Pulse continuity.',
    sigSub:'Built for locomotor longevity. Designed to scale globally.',
    homeStepOld:'Run a portable standardized instrumented assessment.',
    homeStepNew:'Run a portable instrumented assessment; muscle analysis is supplied by Myodev through Myocare.',
    homeNote:'<strong>Myodev × KŌMØ.</strong> Six sensors feed Myocare for the muscle component; Pulse then brings those results together with the other dimensions of the assessment.',
    flowEy:'MYODEV × KŌMØ INTEGRATION',
    proFlowTitle:'Myocare analyzes muscle.<br>Pulse brings the assessment together.',
    proFlowCopy:'The six sensors are supplied by Myodev. Acquisition and muscle analysis are handled in Myocare according to the indicators available. KŌMØ Pulse is designed to receive those results and connect them with functional tests, posture, questionnaire and context.',
    proItems:[['01','KŌMØ Case','Mobile acquisition using six Myodev sensors and the KŌMØ protocol.'],['02','Myocare','Myodev processes the muscle component and supplies the agreed indicators.'],['03','KŌMØ Pulse','Pulse brings Myocare results together with the other assessment dimensions.'],['04','Motion or Clinical','Restitution then follows either a non-medical commercial or medical pathway.']],
    proNote:'Available muscle variables depend on the Myodev/Myocare protocol and the data format supplied.',
    pulseFlowTitle:'Multiple sources.<br>One trajectory.',
    pulseFlowCopy:'Pulse is not intended to replace Myocare. It is the continuity layer: it brings partner-tool outputs together with KŌMØ functional measures and organizes them over time.',
    pulseItems:[['01','First reference','A simple entry into Pulse, without an account in the current public version.'],['02','Myocare','Muscle-analysis data is supplied by Myodev through Myocare.'],['03','KŌMØ assessment','Functional tests, posture, questionnaire and other measures retain a clear source.'],['04','Trajectory','Pulse is designed to bring repeated assessments together and make change readable.']],
    caseFlowTitle:'Case acquires.<br>Myocare analyzes. Pulse unifies.',
    caseFlowCopy:'KŌMØ does not rebuild Myodev’s muscle-analysis engine. The sensors and Myocare provide that component; KŌMØ then organizes the multimodal assessment and its continuity in Pulse.',
    caseItems:[['01','Equip','Six Myodev sensors are positioned according to the selected protocol.'],['02','Analyze','Myocare processes the muscle component using the functions supplied by Myodev.'],['03','Complete','Functional tests, posture and questionnaire complete the locomotor profile.'],['04','Unify','Pulse brings results into a Motion or Clinical output and then longitudinal follow-up.']],
    caseLeadOld:'Entry into KŌMØ Professional starts with acquiring a KŌMØ Case and subscribing to KŌMØ Pulse.',
    caseLeadNew:'KŌMØ Case combines six sensors supplied by Myodev, two tablets and a tripod. Myocare supplies the muscle-analysis data; KŌMØ Pulse then brings the full assessment and follow-up together.',
    muscleLabel:'Muscle analysis'
  },
  es: {
    home: join(site,'es','index.html'), pro: join(site,'es','partners','index.html'), pulse: join(site,'es','pulse','index.html'), case: join(site,'es','case','index.html'),
    homeDesc:'Empieza en KŌMØ Pulse con una primera referencia de movilidad y profundiza con KŌMØ Case, seis sensores Myodev y datos de análisis muscular de Myocare.',
    proDesc:'KŌMØ Professional reúne Motion para uso comercial no médico y Clinical para médicos, con KŌMØ Case, Myocare y KŌMØ Pulse.',
    pulseDesc:'KŌMØ Pulse reúne la primera referencia de movilidad, los datos de análisis muscular suministrados por Myocare y las demás dimensiones de las evaluaciones KŌMØ.',
    caseDesc:'KŌMØ Case es el sistema portátil de evaluación locomotora: seis sensores Myodev, análisis muscular vía Myocare, dos tabletas, trípode y continuidad en Pulse.',
    sigSub:'Built for locomotor longevity. Designed to scale globally.',
    homeStepOld:'Realizar una evaluación instrumentada portátil y estandarizada.',
    homeStepNew:'Realizar una evaluación instrumentada portátil; Myodev aporta el análisis muscular a través de Myocare.',
    homeNote:'<strong>Myodev × KŌMØ.</strong> Los seis sensores alimentan Myocare para el componente muscular; Pulse reúne después esos resultados con las demás dimensiones de la evaluación.',
    flowEy:'INTEGRACIÓN MYODEV × KŌMØ',
    proFlowTitle:'Myocare analiza el músculo.<br>Pulse reúne la evaluación.',
    proFlowCopy:'Los seis sensores son suministrados por Myodev. La adquisición y el análisis muscular se realizan en Myocare según los indicadores disponibles. KŌMØ Pulse está diseñado para recibir esos resultados y relacionarlos con pruebas funcionales, postura, cuestionario y contexto.',
    proItems:[['01','KŌMØ Case','Adquisición móvil con seis sensores Myodev y el protocolo KŌMØ.'],['02','Myocare','Myodev procesa el componente muscular y suministra los indicadores acordados.'],['03','KŌMØ Pulse','Pulse reúne los resultados Myocare con las demás dimensiones de la evaluación.'],['04','Motion o Clinical','La restitución sigue después un marco comercial no médico o un marco médico.']],
    proNote:'Las variables musculares disponibles dependen del protocolo Myodev/Myocare y del formato de datos suministrado.',
    pulseFlowTitle:'Varias fuentes.<br>Una sola trayectoria.',
    pulseFlowCopy:'Pulse no pretende sustituir a Myocare. Es la capa de continuidad: reúne los resultados de herramientas asociadas con las medidas funcionales KŌMØ y las organiza en el tiempo.',
    pulseItems:[['01','Primera referencia','Una entrada sencilla en Pulse, sin cuenta en la versión pública actual.'],['02','Myocare','Los datos de análisis muscular son suministrados por Myodev a través de Myocare.'],['03','Evaluación KŌMØ','Pruebas funcionales, postura, cuestionario y otras medidas conservan una fuente identificable.'],['04','Trayectoria','Pulse está diseñado para reunir evaluaciones sucesivas y hacer visible la evolución.']],
    caseFlowTitle:'Case adquiere.<br>Myocare analiza. Pulse reúne.',
    caseFlowCopy:'KŌMØ no reconstruye el motor de análisis muscular de Myodev. Los sensores y Myocare aportan ese componente; KŌMØ organiza después la evaluación multimodal y su continuidad en Pulse.',
    caseItems:[['01','Equipar','Se colocan seis sensores Myodev según el protocolo seleccionado.'],['02','Analizar','Myocare procesa el componente muscular con las funciones suministradas por Myodev.'],['03','Completar','Las pruebas funcionales, la postura y el cuestionario completan el perfil locomotor.'],['04','Reunir','Pulse reúne los resultados en una salida Motion o Clinical y después en el seguimiento.']],
    caseLeadOld:'La entrada en KŌMØ Professional comienza con la adquisición de una KŌMØ Case y una suscripción a KŌMØ Pulse.',
    caseLeadNew:'KŌMØ Case reúne seis sensores suministrados por Myodev, dos tabletas y un trípode. Myocare aporta los datos del análisis muscular; KŌMØ Pulse reúne después la evaluación y su seguimiento.',
    muscleLabel:'Análisis muscular'
  }
};

function addStyle(h){ return h.includes('kmx-myocare-style') ? h : h.replace('</head>', STYLE + '</head>'); }
function setDesc(h, d){
  h = h.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${d}">`);
  h = h.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${d}">`);
  return h;
}
function signature(c){ return `<section class="kmx-signature" data-kmx-signature><div class="kmx-shell"><p class="kmx-signature__line">${MOTTO}</p><small>${c.sigSub}</small></div></section>`; }
function flow(c, title, copy, items, note=''){
  return `<section class="kmx-flow" data-kmx-flow><div class="kmx-shell"><div class="kmx-flow__head"><div><p class="kmx-flow__ey">${c.flowEy}</p><h2>${title}</h2></div><p class="kmx-flow__copy">${copy}</p></div><div class="kmx-flow__grid">${items.map(x=>`<article class="kmx-flow__item"><span>${x[0]}</span><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join('')}</div>${note?`<p class="kmx-flow__note">${note}</p>`:''}</div></section>`;
}
async function readSafe(path){ try{return await readFile(path,'utf8')}catch{return null} }

for(const c of Object.values(cfg)){
  let h = await readSafe(c.home);
  if(h){
    h=addStyle(h); h=setDesc(h,c.homeDesc); h=h.replace(c.homeStepOld,c.homeStepNew);
    if(!h.includes('data-kmx-signature')) h=h.replace('<section class="hp-product-gateway"', signature(c)+'<section class="hp-product-gateway"');
    if(!h.includes('kmx-home-myocare')) h=h.replace('<div class="hp-product-links">', `<p class="kmx-inline-note" id="kmx-home-myocare">${c.homeNote}</p><div class="hp-product-links">`);
    await writeFile(c.home,h,'utf8');
  }

  h = await readSafe(c.pro);
  if(h){
    h=addStyle(h); h=setDesc(h,c.proDesc);
    if(!h.includes('data-kmx-signature')) h=h.replace('<section class="section white">', signature(c)+'<section class="section white">');
    if(!h.includes('kmx-pro-flow')) h=h.replace('<section class="section stone">', flow(c,c.proFlowTitle,c.proFlowCopy,c.proItems,c.proNote).replace('data-kmx-flow','data-kmx-flow id="kmx-pro-flow"')+'<section class="section stone">');
    h=h.replace('6 · Myodev</strong></li><li><span>', `6 · Myodev</strong></li><li><span>${c.muscleLabel}</span><strong>Myocare · Myodev</strong></li><li><span>`);
    await writeFile(c.pro,h,'utf8');
  }

  h = await readSafe(c.pulse);
  if(h){
    h=addStyle(h); h=setDesc(h,c.pulseDesc);
    if(!h.includes('data-kmx-signature')) h=h.replace('<section class="section white">', signature(c)+'<section class="section white">');
    if(!h.includes('kmx-pulse-flow')) h=h.replace('<section class="section stone">', flow(c,c.pulseFlowTitle,c.pulseFlowCopy,c.pulseItems).replace('data-kmx-flow','data-kmx-flow id="kmx-pulse-flow"')+'<section class="section stone">');
    await writeFile(c.pulse,h,'utf8');
  }

  h = await readSafe(c.case);
  if(h){
    h=addStyle(h); h=setDesc(h,c.caseDesc); h=h.replace(c.caseLeadOld,c.caseLeadNew);
    const base = c.case.includes('/fr/') ? '/fr' : c.case.includes('/es/') ? '/es' : '';
    const proLabel = c.case.includes('/fr/') ? 'Professionnels' : c.case.includes('/es/') ? 'Profesionales' : 'Professionals';
    const networkLabel = c.case.includes('/fr/') ? 'Réseau' : c.case.includes('/es/') ? 'Red' : 'Network';
    const lib = c.case.includes('/fr/') ? '/media' : c.case.includes('/es/') ? '/es/media' : '/en/media';
    h=h.replace(/<nav class="nav">[\s\S]*?<\/nav>/, `<nav class="nav"><a href="${base}/case/" aria-current="page">Case</a><a href="${base}/pulse/">Pulse</a><a href="${base}/partners/">${proLabel}</a><a href="${base}/network/">${networkLabel}</a><a href="${lib}">Library</a></nav>`);
    h=h.replace(/<a class="mini" href="[^"]*">[\s\S]*?<\/a>/, `<a class="mini" href="${base}/pulse/">Pulse →</a>`);
    if(!h.includes('data-kmx-signature')) h=h.replace('<section class="section white">', signature(c)+'<section class="section white">');
    if(!h.includes('kmx-case-flow')) h=h.replace('<section class="section stone">', flow(c,c.caseFlowTitle,c.caseFlowCopy,c.caseItems,c.proNote).replace('data-kmx-flow','data-kmx-flow id="kmx-case-flow"')+'<section class="section stone">');
    h=h.replace('6 · Myodev</strong></li><li><span>', `6 · Myodev</strong></li><li><span>${c.muscleLabel}</span><strong>Myocare · Myodev</strong></li><li><span>`);
    await writeFile(c.case,h,'utf8');
  }
}

console.log('[myocare-static-integration-v1] Myodev/Myocare data flow, Pulse continuity and brand signature applied.');
