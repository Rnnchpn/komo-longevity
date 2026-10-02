import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site=join(process.cwd(),'site');

const locales={
  fr:{
    home:'index.html',motion:'fr/motion/index.html',contact:'/fr/contact/?intent=motion',clinical:'/fr/clinical/',
    heroEy:'KŌMØ · BILAN DU MOUVEMENT',
    heroTitle:'Un bilan pour comprendre votre mobilité et savoir quoi améliorer',
    heroLead:'KŌMØ évalue votre marche, votre équilibre, votre force, votre mobilité et votre activité musculaire. Vous repartez avec un point de référence, trois priorités et un plan clair.',
    primary:'Réserver mon bilan',secondary:'Voir le déroulé',
    quick:[['6','capteurs'],['119','indicateurs de l’analyse musculaire'],['3','tests fonctionnels'],['1','questionnaire locomoteur']],
    whyEy:'CE QUE LE BILAN VOUS APPORTE',whyTitle:'Des résultats qui débouchent sur des décisions simples',
    whyLead:'Le bilan transforme les mesures en informations utiles : où vous en êtes, ce qui compte le plus maintenant et quoi faire ensuite.',
    why:[
      ['Votre point de référence','Une lecture fonctionnelle de votre mobilité au moment du bilan.'],
      ['Vos 3 priorités','Les éléments les plus utiles à travailler, surveiller ou réévaluer.'],
      ['Votre plan','Les prochaines actions proposées selon votre profil et vos objectifs.'],
      ['Votre suivi','Vos résultats restent accessibles dans Pulse pour pouvoir les comparer plus tard.']
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
    price:'',
    routes:[['KŌMØ Motion','Bilan fonctionnel','/fr/motion/'],['KŌMØ Clinical','Consultation médicale','/fr/clinical/'],['KŌMØ Signature','Programme privé','/fr/signature/']],
    ctaTitle:'Votre premier bilan KŌMØ',
    ctaCopy:'Commencez par Motion pour établir votre point de référence. Si votre situation nécessite une consultation médicale, KŌMØ Clinical constitue un parcours distinct.',
    book:'Réserver Motion',clinicalCta:'Découvrir Clinical',
    boundary:'KŌMØ Motion est une évaluation fonctionnelle non diagnostique. Motion Score et Motion Age sont des repères propriétaires KŌMØ et ne constituent pas un diagnostic médical.'
  },
  en:{
    home:'en/index.html',motion:'motion/index.html',contact:'/contact/?intent=motion',clinical:'/clinical/',
    heroEy:'KŌMØ · MOVEMENT ASSESSMENT',
    heroTitle:'An assessment to understand your mobility and what to improve',
    heroLead:'KŌMØ assesses gait, balance, strength, mobility and muscle activity. You leave with a baseline, three priorities and a clear plan.',
    primary:'Book my assessment',secondary:'See how it works',
    quick:[['6','sensors'],['119','muscle-analysis indicators'],['3','functional tests'],['1','locomotor questionnaire']],
    whyEy:'WHAT THE ASSESSMENT GIVES YOU',whyTitle:'Results that lead to simple decisions',
    whyLead:'The assessment turns measurements into useful information: where you are, what matters most now and what to do next.',
    why:[['Your baseline','A functional view of your mobility at the time of assessment.'],['Your 3 priorities','The areas most useful to work on, monitor or reassess.'],['Your plan','Suggested next actions based on your profile and goals.'],['Your follow-up','Results remain in Pulse so they can be compared over time.']],
    measureEy:'WHAT WE MEASURE',measureTitle:'Five dimensions that are easy to understand',
    measure:[['Gait','How you move from place to place.'],['Balance','How you stabilise yourself.'],['Strength','How you produce useful effort.'],['Mobility','How your joints and body move.'],['Muscles','How selected muscles activate during measured tasks.']],
    apptEy:'YOUR APPOINTMENT',apptTitle:'The assessment, step by step',
    appt:[['01','Before','You share your context and complete the GLFS-25 questionnaire.'],['02','During','Stand-Up Test, Two-Step Test, 4-metre walk and analysis with 6 sensors.'],['03','Debrief','Results are explained without jargon and put into context.'],['04','After','You receive priorities, a plan and follow-up in Pulse.']],
    receiveEy:'WHAT YOU RECEIVE',receiveTitle:'At the end, you know what matters',
    receiveLead:'The assessment does not end with a table of numbers. It ends with a clear reading of your profile and useful next actions.',
    receive:[['Your profile','The main assessment results in one clear summary.'],['Your 3 priorities','The areas that deserve the most attention now.'],['Motion Score & Motion Age','Two KŌMØ references to visualise and follow your functional profile.'],['Your plan','Suggested next actions according to your situation.'],['Pulse','Your personal space for results, programme and reassessment.']],
    price:'',routes:[['KŌMØ Motion','Functional assessment','/motion/'],['KŌMØ Clinical','Medical consultation','/clinical/'],['KŌMØ Signature','Private programme','/signature/']],ctaTitle:'Your first KŌMØ assessment',ctaCopy:'Start with Motion to establish a reference point. If your situation requires medical consultation, KŌMØ Clinical is a separate pathway.',book:'Book Motion',clinicalCta:'Explore Clinical',
    boundary:'KŌMØ Motion is a non-diagnostic functional assessment. Motion Score and Motion Age are proprietary KŌMØ references and do not constitute a medical diagnosis.'
  },
  es:{
    home:'es/index.html',motion:'es/motion/index.html',contact:'/es/contact/?intent=motion',clinical:'/es/clinical/',
    heroEy:'KŌMØ · EVALUACIÓN DEL MOVIMIENTO',
    heroTitle:'Una evaluación para comprender tu movilidad y saber qué mejorar',
    heroLead:'KŌMØ evalúa marcha, equilibrio, fuerza, movilidad y actividad muscular. Sales con un punto de referencia, tres prioridades y un plan claro.',
    primary:'Reservar mi evaluación',secondary:'Ver cómo funciona',
    quick:[['6','sensores'],['119','indicadores del análisis muscular'],['3','pruebas funcionales'],['1','cuestionario locomotor']],
    whyEy:'QUÉ TE APORTA LA EVALUACIÓN',whyTitle:'Resultados que llevan a decisiones sencillas',
    whyLead:'La evaluación transforma las medidas en información útil: dónde estás, qué importa más ahora y qué hacer después.',
    why:[['Tu referencia','Una lectura funcional de tu movilidad en el momento de la evaluación.'],['Tus 3 prioridades','Los puntos más útiles para trabajar, vigilar o reevaluar.'],['Tu plan','Siguientes acciones propuestas según tu perfil y objetivos.'],['Tu seguimiento','Los resultados permanecen en Pulse para compararlos con el tiempo.']],
    measureEy:'QUÉ MEDIMOS',measureTitle:'Cinco dimensiones fáciles de entender',
    measure:[['Marcha','Cómo te desplazas.'],['Equilibrio','Cómo te estabilizas.'],['Fuerza','Cómo produces un esfuerzo útil.'],['Movilidad','Cómo se mueven tus articulaciones y tu cuerpo.'],['Músculos','Cómo se activan determinados músculos durante las tareas medidas.']],
    apptEy:'TU CITA',apptTitle:'La evaluación, paso a paso',
    appt:[['01','Antes','Indicas tu contexto y completas el cuestionario GLFS-25.'],['02','Durante','Stand-Up Test, Two-Step Test, marcha de 4 metros y análisis con 6 sensores.'],['03','Restitución','Los resultados se explican sin jerga y se sitúan en contexto.'],['04','Después','Recibes prioridades, plan y seguimiento en Pulse.']],
    receiveEy:'QUÉ RECIBES',receiveTitle:'Al final, sabes qué debes retener',
    receiveLead:'La evaluación no termina con una tabla de cifras. Termina con una lectura clara de tu perfil y siguientes acciones útiles.',
    receive:[['Tu perfil','Principales resultados reunidos en una síntesis clara.'],['Tus 3 prioridades','Los puntos que más atención merecen ahora.'],['Motion Score & Motion Age','Dos referencias KŌMØ para visualizar y seguir tu perfil funcional.'],['Tu plan','Siguientes acciones propuestas según tu situación.'],['Pulse','Tu espacio personal para resultados, programa y reevaluación.']],
    price:'',routes:[['KŌMØ Motion','Evaluación funcional','/es/motion/'],['KŌMØ Clinical','Consulta médica','/es/clinical/'],['KŌMØ Signature','Programa privado','/es/signature/']],ctaTitle:'Tu primera evaluación KŌMØ',ctaCopy:'Empieza con Motion para establecer un punto de referencia. Si tu situación requiere consulta médica, KŌMØ Clinical es un recorrido separado.',book:'Reservar Motion',clinicalCta:'Descubrir Clinical',
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
.kc-cta{padding:clamp(68px,8vw,100px) 0;background:#d5e2d9}.kc-cta-grid{display:grid;grid-template-columns:1fr auto;gap:45px;align-items:end}
.kc-boundary{margin-top:18px;max-width:820px;color:#657069;font-size:10px;line-height:1.55}.kc-routes{display:grid;grid-template-columns:repeat(3,1fr);margin-top:34px;border-top:1px solid rgba(20,32,24,.14);border-bottom:1px solid rgba(20,32,24,.14)}.kc-route{display:flex;justify-content:space-between;align-items:center;gap:20px;padding:18px 18px 18px 0;border-right:1px solid rgba(20,32,24,.1);text-decoration:none}.kc-route:last-child{border-right:0;padding-left:18px}.kc-route:nth-child(2){padding-left:18px}.kc-route strong{display:block;font:400 22px/1 "Iowan Old Style",Baskerville,Georgia,serif}.kc-route span{display:block;margin-top:7px;color:#657069;font-size:10px}.kc-route i{font-style:normal;font-size:16px}
@media(max-width:950px){.kc-quick{grid-template-columns:1fr 1fr}.kc-quick article:nth-child(2){border-right:0}.kc-head,.kc-receive,.kc-cta-grid{grid-template-columns:1fr}.kc-why{grid-template-columns:1fr 1fr}.kc-measure{grid-template-columns:1fr 1fr}.kc-measure article:nth-child(2n){border-right:0}.kc-measure article:last-child{grid-column:1/-1}.kc-appointment{grid-template-columns:1fr 1fr}.kc-appt:nth-child(2){border-right:0}}
@media(max-width:620px){.kc-hero{padding-top:68px}.kc-routes{grid-template-columns:1fr}.kc-route,.kc-route:nth-child(2),.kc-route:last-child{padding:15px 0;border-right:0;border-bottom:1px solid rgba(20,32,24,.1)}.kc-route:last-child{border-bottom:0}.kc-hero .kt-title{font-size:clamp(43px,13vw,60px)}.kc-quick{grid-template-columns:1fr 1fr}.kc-quick article{padding:17px 14px;min-height:88px}.kc-quick strong{font-size:23px}.kc-why,.kc-measure,.kc-appointment{grid-template-columns:1fr}.kc-why article{min-height:0}.kc-measure article,.kc-measure article:nth-child(2n),.kc-measure article:last-child,.kc-appt,.kc-appt:nth-child(2){grid-column:auto;border-right:0;border-bottom:1px solid rgba(22,33,27,.1);padding:18px 0}.kc-section--deep .kc-appt{border-bottom-color:rgba(255,255,255,.1)}.kc-result{grid-template-columns:1fr;gap:8px}.kc-result strong{font-size:24px}}
</style>`;

async function exists(fp){try{await access(fp);return true}catch{return false}}
function style(html){if(!html.includes('komo-motion-clarity-v2-style'))html=html.replace('</head>',css+'\n</head>');return html}

function hero(c){return `<section class="kc-hero"><div class="kt-shell kc-hero-copy"><p class="kt-ey">${c.heroEy}</p><h1 class="kt-title">${c.heroTitle}</h1><p class="kt-lead">${c.heroLead}</p><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${c.contact}">${c.primary}</a><a class="kt-btn kt-btn--light" href="#how-it-works">${c.secondary}</a></div></div></section>`}
function quick(c){return `<section class="kc-quick">${c.quick.map(([a,b])=>`<article><strong>${a}</strong><span>${b}</span></article>`).join('')}</section>`}
function why(c){return `<section class="kc-section kc-section--paper"><div class="kt-shell"><div class="kc-head"><div><p class="kt-ey">${c.whyEy}</p><h2 class="kt-h2">${c.whyTitle}</h2></div><p class="kt-copy">${c.whyLead}</p></div><div class="kc-why">${c.why.map(([t,p])=>`<article><h3>${t}</h3><p>${p}</p></article>`).join('')}</div></div></section>`}
function measure(c){return `<section class="kc-section kc-section--sage"><div class="kt-shell"><p class="kt-ey">${c.measureEy}</p><h2 class="kt-h2">${c.measureTitle}</h2><div class="kc-measure">${c.measure.map(([t,p])=>`<article><strong>${t}</strong><p>${p}</p></article>`).join('')}</div></div></section>`}
function appointment(c){return `<section class="kc-section kc-section--deep" id="how-it-works"><div class="kt-shell"><p class="kt-ey">${c.apptEy}</p><h2 class="kt-h2">${c.apptTitle}</h2><div class="kc-appointment">${c.appt.map(([n,t,p])=>`<article class="kc-appt"><b>${n}</b><h3>${t}</h3><p>${p}</p></article>`).join('')}</div></div></section>`}
function receive(c){return `<section class="kc-section kc-section--paper"><div class="kt-shell kc-receive"><div><p class="kt-ey">${c.receiveEy}</p><h2 class="kt-h2">${c.receiveTitle}</h2><p class="kt-copy">${c.receiveLead}</p></div><div class="kc-result-list">${c.receive.map(([t,p])=>`<article class="kc-result"><strong>${t}</strong><p>${p}</p></article>`).join('')}</div></div></section>`}
function cta(c){const routes=c.routes.map(([t,s,h])=>`<a class="kc-route" href="${h}"><div><strong>${t}</strong><span>${s}</span></div><i>→</i></a>`).join('');return `<section class="kc-cta"><div class="kt-shell"><div class="kc-cta-grid"><div><p class="kt-ey">KŌMØ MOTION</p><h2 class="kt-h2">${c.ctaTitle}</h2><p class="kt-copy">${c.ctaCopy}</p><p class="kc-boundary">${c.boundary}</p></div><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${c.contact}">${c.book}</a><a class="kt-btn kt-btn--light" href="${c.clinical}">${c.clinicalCta}</a></div></div><div class="kc-routes">${routes}</div></div></section>`}

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
 const lang=c===locales.fr?'fr':c===locales.es?'es':'en';
 const science=lang==='fr'?'/fr/science/':lang==='es'?'/es/science/':'/science/';
 const partners=lang==='fr'?'/fr/partners/':lang==='es'?'/es/partners/':'/partners/';
 const yachting=lang==='fr'?'/fr/yachting/':lang==='es'?'/es/yachting/':'/en/yachting/';
 const world=lang==='fr'?'/fr/world/':lang==='es'?'/es/world/':'/en/world/';
 const experience=lang==='fr'?'/fr/experience/':lang==='es'?'/es/experience/':'/experience/';
 const methodTitle=lang==='fr'?'Une méthode structurée de l’évaluation au suivi':lang==='es'?'Un método estructurado desde la evaluación hasta el seguimiento':'A structured method from assessment to follow-up';
 const nextTitle=lang==='fr'?'Et ensuite, seulement si vous en avez besoin':lang==='es'?'Después, solo si lo necesitas':'Then, only if you need it';
 const nextCopy=lang==='fr'?'Motion reste le point de départ fonctionnel. Les autres services répondent à des besoins différents.':lang==='es'?'Motion sigue siendo el punto de partida funcional. Los demás servicios responden a necesidades diferentes.':'Motion remains the functional starting point. Other services answer different needs.';
 const clinicalCopy=lang==='fr'?'Consultation et interprétation médicale lorsqu’elles sont indiquées.':lang==='es'?'Consulta e interpretación médica cuando están indicadas.':'Medical consultation and interpretation when indicated.';
 const yachtCopy=lang==='fr'?'KŌMØ Anywhere à bord : évaluation privée, restitution et suivi pour owners, guests et partenaires yacht.':lang==='es'?'KŌMØ Anywhere a bordo: evaluación privada, restitución y seguimiento para owners, guests y partners.':'KŌMØ Anywhere onboard: private assessment, debrief and follow-up for owners, guests and yacht partners.';
 const pulseCopy=lang==='fr'?'KŌMØ PULSE conserve vos résultats, vos priorités, votre plan et vos réévaluations.':lang==='es'?'KŌMØ PULSE conserva resultados, prioridades, plan y reevaluaciones.':'KŌMØ PULSE keeps your results, priorities, plan and reassessments.';
 const worldCopy=lang==='fr'?'KŌMØ WORLD · OPTIONNEL prolonge le programme avec des contenus et modules interactifs. La 3D n’est jamais obligatoire.':lang==='es'?'KŌMØ WORLD · OPCIONAL prolonga el programa con contenidos y módulos interactivos. 3D nunca es obligatoria.':'KŌMØ WORLD · OPTIONAL extends the programme with content and interactive modules. 3D is never required.';
 const faqTitle=lang==='fr'?'Avant de réserver':lang==='es'?'Antes de reservar':'Before booking';
 const faq1=lang==='fr'?['Motion est-il médical ?','Non. Motion est une évaluation fonctionnelle non diagnostique. Si une consultation médicale est nécessaire, KŌMØ Clinical constitue un parcours séparé.']:lang==='es'?['¿Motion es médico?','No. Motion es una evaluación funcional no diagnóstica. Si hace falta consulta médica, KŌMØ Clinical es un recorrido separado.']:['Is Motion medical?','No. Motion is a non-diagnostic functional assessment. If medical consultation is needed, KŌMØ Clinical is a separate pathway.'];
 const faq2=lang==='fr'?['Que vais-je recevoir ?','Une synthèse de votre profil, trois priorités, Motion Score et Motion Age présentés avec leurs limites, un plan et votre suivi dans Pulse.']:lang==='es'?['¿Qué voy a recibir?','Una síntesis de tu perfil, tres prioridades, Motion Score y Motion Age presentados con sus límites, un plan y seguimiento en Pulse.']:['What will I receive?','A profile summary, three priorities, Motion Score and Motion Age presented with their limitations, a plan and follow-up in Pulse.'];
 const faq3=lang==='fr'?['Dois-je être sportif ?','Non. Le bilan porte sur des capacités fonctionnelles utiles à la vie quotidienne, quel que soit votre niveau d’activité.']:lang==='es'?['¿Tengo que ser deportista?','No. La evaluación analiza capacidades funcionales útiles en la vida diaria, sea cual sea tu nivel de actividad.']:['Do I need to be athletic?','No. The assessment focuses on functional capacities relevant to everyday life, whatever your activity level.'];
 const ecosystem=`<section class="kt-z-section kt-z-section--sand"><div class="kt-shell"><div class="kt-z-heading"><div><p class="kt-ey">KŌMØ</p><h2 class="kt-h2">${nextTitle}</h2></div><p class="kt-copy">${nextCopy}</p></div><div class="kt-z-continuity"><article><strong>KŌMØ Clinical</strong><h3>Clinical</h3><p class="kt-copy">${clinicalCopy}</p><div class="kt-btns"><a class="kt-btn kt-btn--light" href="${c.clinical}">Clinical →</a></div></article><article><strong>KŌMØ Yachting · KŌMØ Anywhere</strong><h3>Yachting</h3><p class="kt-copy">${yachtCopy}</p><div class="kt-btns"><a class="kt-btn kt-btn--light" href="${yachting}">Yachting →</a><a class="kt-btn kt-btn--light" href="${experience}">Anywhere →</a></div></article></div><div class="kt-z-continuity"><article><strong>KŌMØ PULSE</strong><h3>Pulse</h3><p class="kt-copy">${pulseCopy}</p><div class="kt-btns"><a class="kt-btn kt-btn--light" href="https://pulse.komolongevity.com/">Pulse →</a></div></article><article><strong>KŌMØ WORLD · ${lang==='fr'?'OPTIONNEL':lang==='es'?'OPCIONAL':'OPTIONAL'}</strong><h3>World</h3><p class="kt-copy">${worldCopy}</p><div class="kt-btns"><a class="kt-btn kt-btn--light" href="${world}">World →</a></div></article></div><div class="kt-account-panel"><p><strong>${methodTitle}</strong><br>${lang==='fr'?'Questionnaires, tests fonctionnels et mesure instrumentée sont utilisés pour produire une restitution compréhensible et suivre l’évolution dans le temps.':lang==='es'?'Cuestionarios, pruebas funcionales y medición instrumentada se utilizan para producir una restitución comprensible y seguir la evolución en el tiempo.':'Questionnaires, functional tests and instrumented measurement are used to produce an understandable debrief and follow change over time.'}</p><a href="${science}">Science →</a></div></div></section>`;
 const faq=`<section class="kt-z-section kt-z-section--sage"><div class="kt-shell kt-z-faq"><div><p class="kt-ey">FAQ</p><h2 class="kt-h2">${faqTitle}</h2></div><div>${[faq1,faq2,faq3].map(([q,a])=>`<details><summary>${q}</summary><p>${a}</p></details>`).join('')}</div></div></section>`;
 const pro=`<section class="kt-z-section kt-z-section--deep"><div class="kt-shell kt-pro-grid"><div><p class="kt-ey">${lang==='fr'?'POUR LES PROFESSIONNELS':lang==='es'?'PARA PROFESIONALES':'FOR PROFESSIONALS'}</p><h2 class="kt-h2">${lang==='fr'?'Déployer KŌMØ dans votre établissement':lang==='es'?'Implementar KŌMØ en tu establecimiento':'Bring KŌMØ into your organisation'}</h2><p class="kt-lead">${lang==='fr'?'KŌMØ peut d’abord intervenir avec son équipe et son matériel. La Case devient pertinente seulement lorsqu’un déploiement permanent est justifié.':lang==='es'?'KŌMØ puede intervenir primero con su equipo y material. La Case resulta pertinente solo cuando se justifica un despliegue permanente.':'KŌMØ can first operate with its own team and equipment. The Case becomes relevant only when permanent deployment is justified.'}</p><div class="kt-btns"><a class="kt-btn kt-btn--ghost" href="${partners}">${lang==='fr'?'Professionnels':lang==='es'?'Profesionales':'Professionals'} →</a></div></div></div></section>`;
 const final=`<section class="kt-z-final"><div class="kt-shell kt-final-grid"><div><p class="kt-ey">KŌMØ MOTION</p><h2 class="kt-h2">${lang==='fr'?'Établir votre point de référence':lang==='es'?'Establecer tu punto de referencia':'Establish your baseline'}</h2><p class="kt-copy">${lang==='fr'?'Le premier bilan permet de savoir où vous en êtes aujourd’hui et de décider de la suite sur des données plus claires.':lang==='es'?'La primera evaluación permite saber dónde estás hoy y decidir el siguiente paso con datos más claros.':'A first assessment shows where you are today and helps decide what comes next using clearer data.'}</p></div><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${c.contact}">${c.primary}</a></div></div></section>`;
 const newMain=`<main id="main" class="kt-home">${hero(c)}${quick(c)}${why(c)}${measure(c)}${appointment(c)}${cta(c)}${ecosystem}${faq}${pro}${final}</main>`;
 html=html.replace(/<main(?:\s[^>]*)?>[\s\S]*?<\/main>/,newMain);
 await writeFile(fp,html,'utf8');
}

for(const c of Object.values(locales)){await patchHome(c);await patchMotion(c);}
console.log('[komo-motion-clarity-v2] PASS · simplified customer-first Motion story applied.');
