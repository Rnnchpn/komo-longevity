import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site=join(process.cwd(),'site');

const locales={
  fr:{
    home:'index.html',motion:'fr/motion/index.html',contact:'/fr/contact/?intent=motion',clinical:'/fr/clinical/',
    heroEy:'KŌMØ · BILAN DU MOUVEMENT',
    heroTitle:'Comprendre comment votre corps bouge aujourd’hui',
    heroLead:'KŌMØ évalue votre marche, votre équilibre, votre force, votre mobilité et votre activité musculaire. Questionnaires, tests fonctionnels et capteurs sont réunis dans un même bilan, puis expliqués simplement.',
    primary:'Réserver mon bilan',secondary:'Voir le déroulé',
    quick:[['6','capteurs'],['119','marqueurs musculaires analysés'],['3','tests fonctionnels'],['1','questionnaire locomoteur']],
    whyEy:'POURQUOI LE FAIRE ?',whyTitle:'Un bilan utile même quand on ne sait pas exactement quoi regarder',
    whyLead:'Le bilan crée un point de référence. Il permet de mieux comprendre votre façon de bouger aujourd’hui et de suivre son évolution dans le temps.',
    why:[
      ['Faire le point','Vous voulez savoir où vous en êtes en mobilité, équilibre et force.'],
      ['Comprendre','Vous sentez que votre mouvement ou vos capacités ont changé et souhaitez les objectiver.'],
      ['Préserver','Vous voulez agir tôt sur les capacités fonctionnelles importantes pour rester actif.'],
      ['Suivre','Vous souhaitez mesurer l’effet d’un entraînement, d’un programme ou d’une évolution dans le temps.']
    ],
    measureEy:'CE QUE NOUS MESURONS',measureTitle:'Cinq dimensions faciles à comprendre',
    measure:[
      ['Marche','Comment vous vous déplacez.'],
      ['Équilibre','Comment vous vous stabilisez.'],
      ['Force','Comment vous produisez un effort utile.'],
      ['Mobilité','Comment vos articulations et votre corps se déplacent.'],
      ['Muscles','Comment certains muscles s’activent pendant les tâches mesurées.']
    ],
    apptEy:'VOTRE RENDEZ-VOUS',apptTitle:'Le bilan, étape par étape',
    appt:[
      ['01','Avant','Vous renseignez votre contexte et le questionnaire GLFS-25.'],
      ['02','Pendant','Stand-Up Test, Two-Step Test, marche sur 4 mètres et analyse par 6 capteurs.'],
      ['03','Restitution','Les résultats sont expliqués sans jargon et replacés dans votre situation.'],
      ['04','Après','Vous recevez vos priorités, votre plan et votre suivi dans Pulse.']
    ],
    receiveEy:'CE QUE VOUS RECEVEZ',receiveTitle:'À la fin, vous savez quoi retenir',
    receiveLead:'Le bilan ne se termine pas par un tableau de chiffres. Il se termine par une lecture claire de votre profil et des prochaines actions utiles.',
    receive:[
      ['Votre profil','Les principaux résultats du bilan réunis dans une synthèse.'],
      ['Vos 3 priorités','Les points qui méritent le plus votre attention maintenant.'],
      ['Motion Score & Motion Age','Deux repères KŌMØ pour visualiser et suivre votre profil fonctionnel.'],
      ['Votre plan','Les prochaines actions proposées selon votre situation.'],
      ['Pulse','Votre espace personnel pour retrouver résultats, programme et réévaluation.']
    ],
    price:'À partir de 300 €',
    ctaTitle:'Votre premier bilan KŌMØ',
    ctaCopy:'Commencez par Motion pour établir votre point de référence. Si votre situation nécessite une consultation médicale, KŌMØ Clinical constitue un parcours distinct.',
    book:'Réserver Motion',clinicalCta:'Découvrir Clinical',
    boundary:'KŌMØ Motion est une évaluation fonctionnelle non diagnostique. Motion Score et Motion Age sont des repères propriétaires KŌMØ et ne constituent pas un diagnostic médical.'
  },
  en:{
    home:'en/index.html',motion:'motion/index.html',contact:'/contact/?intent=motion',clinical:'/clinical/',
    heroEy:'KŌMØ · MOVEMENT ASSESSMENT',
    heroTitle:'Understand how your body moves today',
    heroLead:'KŌMØ assesses gait, balance, strength, mobility and muscle activity. Questionnaires, functional tests and sensors are combined in one assessment and then explained clearly.',
    primary:'Book my assessment',secondary:'See how it works',
    quick:[['6','sensors'],['119','muscle markers analysed'],['3','functional tests'],['1','locomotor questionnaire']],
    whyEy:'WHY DO IT?',whyTitle:'A useful baseline even when you are not sure what to look at',
    whyLead:'The assessment creates a reference point. It helps you understand how you move today and follow change over time.',
    why:[['Take stock','See where you stand in mobility, balance and strength.'],['Understand','Objectify changes you have noticed in movement or performance.'],['Preserve','Act early on functional capacities that matter for staying active.'],['Track','Measure change after training, a programme or over time.']],
    measureEy:'WHAT WE MEASURE',measureTitle:'Five dimensions that are easy to understand',
    measure:[['Gait','How you move from place to place.'],['Balance','How you stabilise yourself.'],['Strength','How you produce useful effort.'],['Mobility','How your joints and body move.'],['Muscles','How selected muscles activate during measured tasks.']],
    apptEy:'YOUR APPOINTMENT',apptTitle:'The assessment, step by step',
    appt:[['01','Before','You share your context and complete the GLFS-25 questionnaire.'],['02','During','Stand-Up Test, Two-Step Test, 4-metre walk and analysis with 6 sensors.'],['03','Debrief','Results are explained without jargon and put into context.'],['04','After','You receive priorities, a plan and follow-up in Pulse.']],
    receiveEy:'WHAT YOU RECEIVE',receiveTitle:'At the end, you know what matters',
    receiveLead:'The assessment does not end with a table of numbers. It ends with a clear reading of your profile and useful next actions.',
    receive:[['Your profile','The main assessment results in one clear summary.'],['Your 3 priorities','The areas that deserve the most attention now.'],['Motion Score & Motion Age','Two KŌMØ references to visualise and follow your functional profile.'],['Your plan','Suggested next actions according to your situation.'],['Pulse','Your personal space for results, programme and reassessment.']],
    price:'From €300',ctaTitle:'Your first KŌMØ assessment',ctaCopy:'Start with Motion to establish a reference point. If your situation requires medical consultation, KŌMØ Clinical is a separate pathway.',book:'Book Motion',clinicalCta:'Explore Clinical',
    boundary:'KŌMØ Motion is a non-diagnostic functional assessment. Motion Score and Motion Age are proprietary KŌMØ references and do not constitute a medical diagnosis.'
  },
  es:{
    home:'es/index.html',motion:'es/motion/index.html',contact:'/es/contact/?intent=motion',clinical:'/es/clinical/',
    heroEy:'KŌMØ · EVALUACIÓN DEL MOVIMIENTO',
    heroTitle:'Comprender cómo se mueve tu cuerpo hoy',
    heroLead:'KŌMØ evalúa marcha, equilibrio, fuerza, movilidad y actividad muscular. Cuestionarios, pruebas funcionales y sensores se reúnen en una misma evaluación y después se explican de forma sencilla.',
    primary:'Reservar mi evaluación',secondary:'Ver cómo funciona',
    quick:[['6','sensores'],['119','marcadores musculares analizados'],['3','pruebas funcionales'],['1','cuestionario locomotor']],
    whyEy:'¿POR QUÉ HACERLO?',whyTitle:'Un punto de referencia útil incluso si no sabes exactamente qué mirar',
    whyLead:'La evaluación crea una referencia. Permite comprender mejor cómo te mueves hoy y seguir tu evolución en el tiempo.',
    why:[['Hacer balance','Saber dónde estás en movilidad, equilibrio y fuerza.'],['Comprender','Objetivar cambios que notas en movimiento o capacidades.'],['Preservar','Actuar pronto sobre capacidades funcionales importantes para seguir activo.'],['Seguir','Medir cambios después de entrenamiento, un programa o con el tiempo.']],
    measureEy:'QUÉ MEDIMOS',measureTitle:'Cinco dimensiones fáciles de entender',
    measure:[['Marcha','Cómo te desplazas.'],['Equilibrio','Cómo te estabilizas.'],['Fuerza','Cómo produces un esfuerzo útil.'],['Movilidad','Cómo se mueven tus articulaciones y tu cuerpo.'],['Músculos','Cómo se activan determinados músculos durante las tareas medidas.']],
    apptEy:'TU CITA',apptTitle:'La evaluación, paso a paso',
    appt:[['01','Antes','Indicas tu contexto y completas el cuestionario GLFS-25.'],['02','Durante','Stand-Up Test, Two-Step Test, marcha de 4 metros y análisis con 6 sensores.'],['03','Restitución','Los resultados se explican sin jerga y se sitúan en contexto.'],['04','Después','Recibes prioridades, plan y seguimiento en Pulse.']],
    receiveEy:'QUÉ RECIBES',receiveTitle:'Al final, sabes qué debes retener',
    receiveLead:'La evaluación no termina con una tabla de cifras. Termina con una lectura clara de tu perfil y siguientes acciones útiles.',
    receive:[['Tu perfil','Principales resultados reunidos en una síntesis clara.'],['Tus 3 prioridades','Los puntos que más atención merecen ahora.'],['Motion Score & Motion Age','Dos referencias KŌMØ para visualizar y seguir tu perfil funcional.'],['Tu plan','Siguientes acciones propuestas según tu situación.'],['Pulse','Tu espacio personal para resultados, programa y reevaluación.']],
    price:'Desde 300 €',ctaTitle:'Tu primera evaluación KŌMØ',ctaCopy:'Empieza con Motion para establecer un punto de referencia. Si tu situación requiere consulta médica, KŌMØ Clinical es un recorrido separado.',book:'Reservar Motion',clinicalCta:'Descubrir Clinical',
    boundary:'KŌMØ Motion es una evaluación funcional no diagnóstica. Motion Score y Motion Age son referencias propietarias KŌMØ y no constituyen un diagnóstico médico.'
  }
};

const css=`
<style id="komo-motion-clarity-v2-style">
.kc-hero{padding:clamp(84px,10vw,132px) 0 54px;background:radial-gradient(circle at 82% 12%,rgba(128,160,139,.24),transparent 31%),linear-gradient(145deg,#f7f4ed,#e7eee8)}
.kc-hero-copy{max-width:880px}.kc-hero .kt-title{max-width:840px}.kc-hero .kt-lead{max-width:760px;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;font-size:clamp(17px,1.7vw,21px)}
.kc-quick{display:grid;grid-template-columns:repeat(4,1fr);background:#111915;color:#f8f6ef}.kc-quick article{padding:22px clamp(18px,2.4vw,30px);border-right:1px solid rgba(255,255,255,.08)}.kc-quick article:last-child{border-right:0}.kc-quick strong{display:block;font:400 clamp(27px,3vw,39px)/1 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.035em}.kc-quick span{display:block;margin-top:8px;color:rgba(248,246,239,.58);font-size:9px;line-height:1.4;text-transform:uppercase;letter-spacing:.07em}
.kc-section{padding:clamp(68px,8vw,104px) 0}.kc-section--paper{background:#faf9f6}.kc-section--sage{background:#e3ebe5}.kc-section--deep{background:#131c18;color:#f8f6ef}.kc-section--deep .kt-h2{color:#f8f6ef}.kc-section--deep .kt-copy{color:rgba(248,246,239,.67)}
.kc-head{display:grid;grid-template-columns:minmax(0,.9fr) minmax(320px,.72fr);gap:50px;align-items:end}.kc-head .kt-copy{margin:0;max-width:600px}
.kc-why{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:38px}.kc-why article{min-height:215px;padding:24px;border:1px solid rgba(22,33,27,.11);border-radius:18px;background:#fff}.kc-why h3{margin:38px 0 10px;font:400 28px/1 "Iowan Old Style",Baskerville,Georgia,serif}.kc-why p{margin:0;color:#626c64;font-size:11px;line-height:1.58}
.kc-measure{display:grid;grid-template-columns:repeat(5,1fr);margin-top:42px;border-top:1px solid rgba(22,33,27,.14);border-bottom:1px solid rgba(22,33,27,.14)}.kc-measure article{padding:26px 18px;border-right:1px solid rgba(22,33,27,.1)}.kc-measure article:last-child{border-right:0}.kc-measure strong{display:block;font:400 clamp(28px,3vw,38px)/1 "Iowan Old Style",Baskerville,Georgia,serif}.kc-measure p{margin:12px 0 0;color:#626c64;font-size:11px;line-height:1.55}
.kc-appointment{display:grid;grid-template-columns:repeat(4,1fr);margin-top:40px;border-top:1px solid rgba(255,255,255,.14);border-bottom:1px solid rgba(255,255,255,.14)}.kc-appt{min-height:220px;padding:23px 20px;border-right:1px solid rgba(255,255,255,.1)}.kc-appt:last-child{border-right:0}.kc-appt b{font-size:9px;color:#a1b6a8}.kc-appt h3{margin:39px 0 10px;font:400 27px/1 "Iowan Old Style",Baskerville,Georgia,serif}.kc-appt p{margin:0;color:rgba(248,246,239,.62);font-size:11px;line-height:1.55}
.kc-receive{display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(45px,8vw,95px);align-items:start}.kc-result-list{border-top:1px solid rgba(22,33,27,.14)}.kc-result{display:grid;grid-template-columns:190px 1fr;gap:25px;padding:18px 0;border-bottom:1px solid rgba(22,33,27,.11)}.kc-result strong{font:400 23px/1 "Iowan Old Style",Baskerville,Georgia,serif}.kc-result p{margin:0;color:#626c64;font-size:11px;line-height:1.55}
.kc-cta{padding:clamp(68px,8vw,100px) 0;background:#d5e2d9}.kc-cta-grid{display:grid;grid-template-columns:1fr auto;gap:45px;align-items:end}.kc-price{margin-top:20px;font:400 31px/1 "Iowan Old Style",Baskerville,Georgia,serif}
.kc-boundary{margin-top:18px;max-width:820px;color:#657069;font-size:10px;line-height:1.55}
@media(max-width:950px){.kc-quick{grid-template-columns:1fr 1fr}.kc-quick article:nth-child(2){border-right:0}.kc-head,.kc-receive,.kc-cta-grid{grid-template-columns:1fr}.kc-why{grid-template-columns:1fr 1fr}.kc-measure{grid-template-columns:1fr 1fr}.kc-measure article:nth-child(2n){border-right:0}.kc-measure article:last-child{grid-column:1/-1}.kc-appointment{grid-template-columns:1fr 1fr}.kc-appt:nth-child(2){border-right:0}}
@media(max-width:620px){.kc-hero{padding-top:68px}.kc-hero .kt-title{font-size:clamp(43px,13vw,60px)}.kc-quick{grid-template-columns:1fr 1fr}.kc-quick article{padding:17px 14px;min-height:88px}.kc-quick strong{font-size:23px}.kc-why,.kc-measure,.kc-appointment{grid-template-columns:1fr}.kc-why article{min-height:0}.kc-measure article,.kc-measure article:nth-child(2n),.kc-measure article:last-child,.kc-appt,.kc-appt:nth-child(2){grid-column:auto;border-right:0;border-bottom:1px solid rgba(22,33,27,.1);padding:18px 0}.kc-section--deep .kc-appt{border-bottom-color:rgba(255,255,255,.1)}.kc-result{grid-template-columns:1fr;gap:8px}.kc-result strong{font-size:24px}}
</style>`;

async function exists(fp){try{await access(fp);return true}catch{return false}}
function style(html){if(!html.includes('komo-motion-clarity-v2-style'))html=html.replace('</head>',css+'\n</head>');return html}

function hero(c){return `<section class="kc-hero"><div class="kt-shell kc-hero-copy"><p class="kt-ey">${c.heroEy}</p><h1 class="kt-title">${c.heroTitle}</h1><p class="kt-lead">${c.heroLead}</p><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${c.contact}">${c.primary}</a><a class="kt-btn kt-btn--light" href="#how-it-works">${c.secondary}</a></div></div></section>`}
function quick(c){return `<section class="kc-quick">${c.quick.map(([a,b])=>`<article><strong>${a}</strong><span>${b}</span></article>`).join('')}</section>`}
function why(c){return `<section class="kc-section kc-section--paper"><div class="kt-shell"><div class="kc-head"><div><p class="kt-ey">${c.whyEy}</p><h2 class="kt-h2">${c.whyTitle}</h2></div><p class="kt-copy">${c.whyLead}</p></div><div class="kc-why">${c.why.map(([t,p])=>`<article><h3>${t}</h3><p>${p}</p></article>`).join('')}</div></div></section>`}
function measure(c){return `<section class="kc-section kc-section--sage"><div class="kt-shell"><p class="kt-ey">${c.measureEy}</p><h2 class="kt-h2">${c.measureTitle}</h2><div class="kc-measure">${c.measure.map(([t,p])=>`<article><strong>${t}</strong><p>${p}</p></article>`).join('')}</div></div></section>`}
function appointment(c){return `<section class="kc-section kc-section--deep" id="how-it-works"><div class="kt-shell"><p class="kt-ey">${c.apptEy}</p><h2 class="kt-h2">${c.apptTitle}</h2><div class="kc-appointment">${c.appt.map(([n,t,p])=>`<article class="kc-appt"><b>${n}</b><h3>${t}</h3><p>${p}</p></article>`).join('')}</div></div></section>`}
function receive(c){return `<section class="kc-section kc-section--paper"><div class="kt-shell kc-receive"><div><p class="kt-ey">${c.receiveEy}</p><h2 class="kt-h2">${c.receiveTitle}</h2><p class="kt-copy">${c.receiveLead}</p></div><div class="kc-result-list">${c.receive.map(([t,p])=>`<article class="kc-result"><strong>${t}</strong><p>${p}</p></article>`).join('')}</div></div></section>`}
function cta(c){return `<section class="kc-cta"><div class="kt-shell kc-cta-grid"><div><p class="kt-ey">KŌMØ MOTION</p><h2 class="kt-h2">${c.ctaTitle}</h2><p class="kt-copy">${c.ctaCopy}</p><p class="kc-price">${c.price}</p><p class="kc-boundary">${c.boundary}</p></div><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${c.contact}">${c.book}</a><a class="kt-btn kt-btn--light" href="${c.clinical}">${c.clinicalCta}</a></div></div></section>`}

function motionMain(c){return `<main id="main" class="kt-home">${hero(c)}${quick(c)}${why(c)}${measure(c)}${appointment(c)}${receive(c)}${cta(c)}</main>`}

async function patchMotion(c){
 const fp=join(site,c.motion);if(!(await exists(fp)))return;
 let html=style(await readFile(fp,'utf8'));
 html=html.replace(/<main(?:\s[^>]*)?>[\s\S]*?<\/main>/,motionMain(c));
 await writeFile(fp,html,'utf8');
}

async function patchHome(c){
 const fp=join(site,c.home);if(!(await exists(fp)))return;
 let html=style(await readFile(fp,'utf8'));
 const mainStart=html.indexOf('<main');
 const firstAfterEarly=html.indexOf('<section class="kt-z-section kt-z-section--sand">',mainStart);
 if(mainStart<0||firstAfterEarly<0)return;
 const openEnd=html.indexOf('>',mainStart)+1;
 const early=hero(c)+quick(c)+why(c)+measure(c)+appointment(c)+receive(c)+cta(c);
 html=html.slice(0,openEnd)+early+html.slice(firstAfterEarly);
 // Remove the redundant older orientation block so Motion/Clinical/Signature are not explained twice.
 html=html.replace(/<section class="kt-z-section" id="komo-orientation">[\s\S]*?<\/section>/,'');
 // Remove product/case imagery from the old method block, keeping only the scientific-method content.
 html=html.replace(/<div class="kt-z-method-image"><img[^>]*komo-case-gait[^>]*><\/div>/,'');
 html=html.replace(/<div class="kt-shell kt-z-method">/g,'<div class="kt-shell">');
 await writeFile(fp,html,'utf8');
}

for(const c of Object.values(locales)){await patchHome(c);await patchMotion(c);}
console.log('[komo-motion-clarity-v2] PASS · simplified customer-first Motion story applied.');
