import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const site=join(process.cwd(),'site');

const locales={
  fr:{
    source:'index.html',file:'fr/yachting/index.html',path:'/fr/yachting/',experience:'fr/experience/index.html',
    title:'KŌMØ Yachting — Évaluation fonctionnelle et suivi privé à bord',
    description:'KŌMØ Yachting apporte à bord une évaluation fonctionnelle, une restitution privée et une continuité dans Pulse et World, pour owners, guests et partenaires yacht.',
    heroEy:'KŌMØ YACHTING',
    heroTitle:'Une expérience KŌMØ conçue pour la vie à bord',
    heroLead:'KŌMØ intervient à bord avec son équipe et son matériel. L’évaluation fonctionnelle est réalisée dans un espace adapté du yacht, suivie d’une restitution privée et d’un programme accessible après le voyage.',
    primary:'Organiser une expérience à bord',secondary:'Pour les brokers & yacht managers',
    proof:[['À bord','Intervention opérée par KŌMØ'],['Privé','Restitution individuelle dans Pulse'],['Portable','Un parcours qui suit le client après le voyage'],['Clinical','Avis médical séparé lorsque nécessaire']],
    audienceTitle:'Trois usages adaptés au yachting',
    audienceLead:'Le même socle KŌMØ peut être organisé différemment selon qu’il s’adresse au propriétaire, aux invités ou à un partenaire professionnel.',
    audiences:[
      ['OWNER','Continuité personnelle','Évaluations répétées au cours de l’année, historique dans Pulse et programme personnalisé entre deux séjours.','Parler du programme Owner'],
      ['GUEST','Expérience pendant le séjour','Une session privée intégrée au programme du yacht, avec restitution et accès personnel après le charter.','Créer une Guest Experience'],
      ['YACHT PARTNER','Service à proposer aux clients','Un format opéré avec le broker, le manager ou le captain, sans imposer l’achat immédiat de matériel permanent.','Organiser un pilote']
    ],
    onboardTitle:'Pensé pour l’environnement du yacht',
    onboardLead:'L’intervention est conçue pour s’intégrer à l’organisation du bord et aux équipements déjà présents.',
    onboard:[
      ['GYM','Évaluer puis adapter les routines de mobilité, force et contrôle moteur.'],
      ['BEACH CLUB','Utiliser un espace ouvert lorsque les conditions et l’organisation du yacht le permettent.'],
      ['PRIVATE SALON','Réaliser la restitution dans un environnement calme et confidentiel.'],
      ['PERSONAL TRAINER','Partager les priorités utiles dans le périmètre défini avec le client.'],
      ['AFTER THE VOYAGE','Retrouver résultats et programme dans Pulse, puis réévaluer plus tard avec KŌMØ.']
    ],
    journeyTitle:'Du yacht au suivi longitudinal',
    journey:[
      ['01','Assessment onboard','Évaluation fonctionnelle Motion à bord.'],
      ['02','Private debrief','Restitution individuelle et priorités.'],
      ['03','Pulse','Résultats, programme et prochaines étapes.'],
      ['04','World','Contenus, Functional Twin et exercices lorsque ces modules sont utiles.'],
      ['05','Reassessment','Nouvelle mesure lors d’un prochain passage KŌMØ.']
    ],
    worldTitle:'World donne une continuité à l’expérience à bord',
    worldCopy:'Après la session, le client peut retrouver ses priorités dans Pulse et accéder aux modules World utiles à son programme. L’expérience 3D reste facultative : les informations importantes restent disponibles dans une interface classique.',
    worldCta:'Comprendre World',
    proTitle:'Pour brokers, managers et captains',
    proCopy:'KŌMØ peut être proposé comme service additionnel lors d’un charter, d’une saison owner ou d’un événement privé. Nous définissons en amont le nombre de participants, l’espace nécessaire, le planning, le niveau de restitution et les responsabilités de chacun.',
    proItems:['Intervention avec équipe et matériel KŌMØ','Format individuel ou petit groupe','Coordination avec l’équipage avant l’embarquement','Restitution confidentielle à chaque participant','Option de programme récurrent ou de Case permanente si le volume le justifie'],
    medical:'KŌMØ Motion est une évaluation fonctionnelle non diagnostique. Toute consultation, prescription ou décision médicale relève de KŌMØ Clinical et d’un professionnel qualifié dans un cadre réglementaire approprié.',
    founderEy:'FOUNDER',
    founderName:'Dr Renan Chapon',
    founderRole:'Médecin · Fondateur de KŌMØ',
    founderCopy:'Médecin avec un parcours en neurochirurgie et chirurgie du rachis, Renan Chapon a développé KŌMØ autour de l’analyse du mouvement, de la marche et de la longévité fonctionnelle. Son travail associe mesure, interprétation clinique lorsque celle-ci est indiquée et continuité dans le temps.',
    founderCopy2:'Dans l’expérience Yachting, il définit le cadre KŌMØ, supervise la qualité du parcours et veille à ce que chaque participant comprenne ses résultats, ses priorités et la suite adaptée. Les actes médicaux restent séparés et réalisés uniquement dans le cadre réglementaire approprié.',
    founderFacts:[['Médecin','Formation clinique'],['Mouvement','Travaux sur la marche et la fonction'],['KŌMØ','Fondateur et direction du projet']],
    founderCta:'À propos de KŌMØ',
    finalTitle:'Préparer une première intervention à bord',
    finalCopy:'Indiquez le yacht, le port ou la zone de navigation, le nombre de participants et le format souhaité. KŌMØ prépare ensuite le déroulé opérationnel.',
    finalCta:'Échanger avec KŌMØ'
  },
  en:{
    source:'en/index.html',file:'en/yachting/index.html',path:'/en/yachting/',experience:'experience/index.html',
    title:'KŌMØ Yachting — Private functional assessment and continuity onboard',
    description:'KŌMØ Yachting brings functional assessment, private debrief and continuity through Pulse and World onboard for owners, guests and yacht partners.',
    heroEy:'KŌMØ YACHTING',
    heroTitle:'A KŌMØ experience designed for life onboard',
    heroLead:'KŌMØ comes onboard with its team and equipment. Functional assessment is delivered in a suitable space on the yacht, followed by a private debrief and a programme that remains accessible after the voyage.',
    primary:'Plan an onboard experience',secondary:'For brokers & yacht managers',
    proof:[['Onboard','Operated by the KŌMØ team'],['Private','Individual debrief in Pulse'],['Portable','A pathway that follows the client after the voyage'],['Clinical','Separate medical consultation when required']],
    audienceTitle:'Three yachting use cases',
    audienceLead:'The same KŌMØ foundation can be organised differently for an owner, guests or a professional yacht partner.',
    audiences:[
      ['OWNER','Personal continuity','Repeat assessments throughout the year, Pulse history and a personalised programme between stays.','Discuss Owner programme'],
      ['GUEST','An experience during the stay','A private session integrated into the yacht schedule, with debrief and personal access after charter.','Create a Guest Experience'],
      ['YACHT PARTNER','A service for clients','An operated format with broker, manager or captain, without requiring immediate purchase of permanent equipment.','Run a pilot']
    ],
    onboardTitle:'Designed around the yacht environment',
    onboardLead:'Delivery is organised around onboard operations and the equipment already available.',
    onboard:[
      ['GYM','Assess first, then adapt mobility, strength and motor-control routines.'],
      ['BEACH CLUB','Use an open space when conditions and yacht operations make it appropriate.'],
      ['PRIVATE SALON','Deliver the debrief in a quiet and confidential setting.'],
      ['PERSONAL TRAINER','Share relevant priorities within the scope agreed with the client.'],
      ['AFTER THE VOYAGE','Keep results and programme in Pulse and reassess later with KŌMØ.']
    ],
    journeyTitle:'From the yacht to longitudinal follow-up',
    journey:[
      ['01','Assessment onboard','Functional Motion assessment onboard.'],
      ['02','Private debrief','Individual interpretation and priorities.'],
      ['03','Pulse','Results, programme and next steps.'],
      ['04','World','Content, Functional Twin and exercise modules when useful.'],
      ['05','Reassessment','New measurement during a future KŌMØ visit.']
    ],
    worldTitle:'World extends the onboard experience',
    worldCopy:'After the session, clients can return to priorities in Pulse and use the World modules relevant to their programme. The 3D experience remains optional; important information stays available through a standard interface.',
    worldCta:'Understand World',
    proTitle:'For brokers, managers and captains',
    proCopy:'KŌMØ can be offered as an additional service during a charter, an owner season or a private event. We define participant numbers, space, schedule, debrief format and responsibilities in advance.',
    proItems:['KŌMØ team and equipment brought onboard','Individual or small-group format','Coordination with crew before embarkation','Confidential debrief for each participant','Recurring programme or permanent Case when activity volume justifies it'],
    medical:'KŌMØ Motion is a non-diagnostic functional assessment. Medical consultations, prescriptions and clinical decisions belong to KŌMØ Clinical and qualified professionals operating within the appropriate regulatory framework.',
    founderEy:'FOUNDER',
    founderName:'Dr Renan Chapon',
    founderRole:'Physician · Founder of KŌMØ',
    founderCopy:'A physician with a background in neurosurgery and spine care, Renan Chapon developed KŌMØ around movement analysis, gait and functional longevity. His work connects measurement, clinical interpretation when indicated, and continuity over time.',
    founderCopy2:'Within KŌMØ Yachting, he defines the KŌMØ framework, oversees the quality of the pathway and ensures that each participant understands their results, priorities and appropriate next step. Medical acts remain separate and are delivered only within the appropriate regulatory framework.',
    founderFacts:[['Physician','Clinical training'],['Movement','Work focused on gait and function'],['KŌMØ','Founder and project lead']],
    founderCta:'About KŌMØ',
    finalTitle:'Prepare a first onboard delivery',
    finalCopy:'Share the yacht, port or cruising area, participant number and preferred format. KŌMØ then prepares the operating plan.',
    finalCta:'Talk with KŌMØ'
  },
  es:{
    source:'es/index.html',file:'es/yachting/index.html',path:'/es/yachting/',experience:'es/experience/index.html',
    title:'KŌMØ Yachting — Evaluación funcional privada y seguimiento a bordo',
    description:'KŌMØ Yachting lleva a bordo evaluación funcional, restitución privada y continuidad mediante Pulse y World para owners, guests y partners.',
    heroEy:'KŌMØ YACHTING',
    heroTitle:'Una experiencia KŌMØ diseñada para la vida a bordo',
    heroLead:'KŌMØ llega al yacht con su equipo y material. La evaluación funcional se realiza en un espacio adecuado, seguida de una restitución privada y un programa accesible después del viaje.',
    primary:'Organizar una experiencia a bordo',secondary:'Para brokers & yacht managers',
    proof:[['A bordo','Intervención operada por KŌMØ'],['Privado','Restitución individual en Pulse'],['Portable','Un recorrido que sigue al cliente tras el viaje'],['Clinical','Consulta médica separada cuando sea necesaria']],
    audienceTitle:'Tres usos adaptados al yachting',
    audienceLead:'La misma base KŌMØ puede organizarse de forma diferente para owner, guests o un partner profesional.',
    audiences:[
      ['OWNER','Continuidad personal','Evaluaciones repetidas durante el año, historial en Pulse y programa personalizado entre estancias.','Hablar del programa Owner'],
      ['GUEST','Experiencia durante la estancia','Sesión privada integrada en el programa del yacht, con restitución y acceso personal después del charter.','Crear Guest Experience'],
      ['YACHT PARTNER','Servicio para clientes','Formato operado con broker, manager o captain, sin obligar a comprar material permanente desde el inicio.','Organizar piloto']
    ],
    onboardTitle:'Pensado para el entorno del yacht',
    onboardLead:'La intervención se integra en la operativa a bordo y en los equipos ya disponibles.',
    onboard:[
      ['GYM','Evaluar y después adaptar rutinas de movilidad, fuerza y control motor.'],
      ['BEACH CLUB','Utilizar un espacio abierto cuando las condiciones y la operativa lo permitan.'],
      ['PRIVATE SALON','Realizar la restitución en un entorno tranquilo y confidencial.'],
      ['PERSONAL TRAINER','Compartir prioridades relevantes dentro del perímetro acordado con el cliente.'],
      ['DESPUÉS DEL VIAJE','Mantener resultados y programa en Pulse y reevaluar más adelante con KŌMØ.']
    ],
    journeyTitle:'Del yacht al seguimiento longitudinal',
    journey:[
      ['01','Assessment onboard','Evaluación funcional Motion a bordo.'],
      ['02','Private debrief','Restitución individual y prioridades.'],
      ['03','Pulse','Resultados, programa y siguientes pasos.'],
      ['04','World','Contenidos, Functional Twin y ejercicios cuando resulten útiles.'],
      ['05','Reassessment','Nueva medición en una futura visita KŌMØ.']
    ],
    worldTitle:'World prolonga la experiencia a bordo',
    worldCopy:'Después de la sesión, el cliente puede volver a sus prioridades en Pulse y utilizar los módulos World relevantes. La experiencia 3D sigue siendo opcional; la información importante permanece disponible en una interfaz clásica.',
    worldCta:'Comprender World',
    proTitle:'Para brokers, managers y captains',
    proCopy:'KŌMØ puede ofrecerse como servicio adicional durante un charter, una temporada owner o un evento privado. Definimos previamente participantes, espacio, horario, restitución y responsabilidades.',
    proItems:['Equipo y material KŌMØ a bordo','Formato individual o pequeño grupo','Coordinación con la tripulación antes del embarque','Restitución confidencial a cada participante','Programa recurrente o Case permanente cuando el volumen lo justifique'],
    medical:'KŌMØ Motion es una evaluación funcional no diagnóstica. Las consultas, prescripciones y decisiones médicas corresponden a KŌMØ Clinical y profesionales cualificados dentro del marco regulatorio adecuado.',
    founderEy:'FOUNDER',
    founderName:'Dr Renan Chapon',
    founderRole:'Médico · Fundador de KŌMØ',
    founderCopy:'Médico con trayectoria en neurocirugía y columna vertebral, Renan Chapon desarrolló KŌMØ alrededor del análisis del movimiento, la marcha y la longevidad funcional. Su trabajo conecta medición, interpretación clínica cuando está indicada y continuidad en el tiempo.',
    founderCopy2:'En KŌMØ Yachting define el marco KŌMØ, supervisa la calidad del recorrido y procura que cada participante comprenda sus resultados, prioridades y el siguiente paso adecuado. Los actos médicos permanecen separados y se realizan únicamente dentro del marco regulatorio correspondiente.',
    founderFacts:[['Médico','Formación clínica'],['Movimiento','Trabajo centrado en marcha y función'],['KŌMØ','Fundador y dirección del proyecto']],
    founderCta:'Sobre KŌMØ',
    finalTitle:'Preparar una primera intervención a bordo',
    finalCopy:'Indica el yacht, puerto o zona de navegación, número de participantes y formato. KŌMØ prepara después el plan operativo.',
    finalCta:'Hablar con KŌMØ'
  }
};

const css=`
<style id="komo-yachting-v1-style">
.ky-hero{position:relative;min-height:700px;display:flex;align-items:flex-end;padding:110px 0 76px;overflow:hidden;background:#10202a;color:#fff}
.ky-hero-media{position:absolute;inset:0}.ky-hero-media img{width:100%;height:100%;object-fit:cover;display:block;filter:saturate(.9) contrast(1.04)}
.ky-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(8,20,27,.91) 0%,rgba(8,20,27,.73) 38%,rgba(8,20,27,.18) 72%,rgba(8,20,27,.08)),linear-gradient(0deg,rgba(8,20,27,.52),transparent 48%)}
.ky-hero .kt-shell{position:relative;z-index:1}.ky-hero-copy{max-width:750px}.ky-hero .kt-ey{color:#c9ddd0}.ky-hero .kt-title{color:#fff}.ky-hero .kt-lead{color:rgba(255,255,255,.82);max-width:670px}
.ky-proof{display:grid;grid-template-columns:repeat(4,1fr);background:#111a17;color:#f4f2eb;border-bottom:1px solid rgba(255,255,255,.08)}
.ky-proof article{padding:24px clamp(18px,3vw,34px);border-right:1px solid rgba(255,255,255,.08)}.ky-proof article:last-child{border-right:0}
.ky-proof strong{display:block;font:400 clamp(24px,2.7vw,34px)/1 "Iowan Old Style",Baskerville,Georgia,serif}.ky-proof span{display:block;margin-top:8px;color:rgba(244,242,235,.6);font-size:10px;line-height:1.5}
.ky-section{padding:clamp(76px,9vw,120px) 0;background:#18221e;color:#f5f3ed}.ky-section .kt-h2,.ky-section .kt-h3{color:#f5f3ed}.ky-section .kt-copy{color:rgba(245,243,237,.66)}.ky-section .kt-ey{color:#9fb3a6}.ky-section--sea{background:#14232a}.ky-section--dark{background:#0d1512;color:#f8f7f2}.ky-section--dark .kt-ey{color:#aec4b6}.ky-section--dark .kt-copy{color:rgba(248,247,242,.7)}
.ky-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,.72fr);gap:55px;align-items:end}.ky-head .kt-copy{margin:0;max-width:590px}
.ky-audiences{display:grid;grid-template-columns:repeat(3,1fr);gap:15px;margin-top:42px}.ky-card{display:flex;flex-direction:column;min-height:335px;padding:28px;border:1px solid rgba(255,255,255,.09);border-radius:21px;background:#202c27;transition:transform .32s ease,box-shadow .32s ease,border-color .32s ease}.ky-card:hover{transform:translateY(-5px);box-shadow:0 24px 65px rgba(0,0,0,.18);border-color:rgba(150,184,162,.28)}.ky-card b{font-size:9px;letter-spacing:.14em;color:#9ab2a3}.ky-card h3{margin:45px 0 13px;font:400 33px/1 "Iowan Old Style",Baskerville,Georgia,serif;color:#f7f5ef}.ky-card p{margin:0;color:rgba(247,245,239,.63);font-size:12px;line-height:1.65}.ky-card a{margin-top:auto;padding-top:24px;text-decoration:none;font-size:11px;font-weight:760;color:#cfe0d5}
.ky-onboard{display:grid;grid-template-columns:.82fr 1.18fr;gap:60px;align-items:start}.ky-list{border-top:1px solid rgba(255,255,255,.1)}.ky-row{display:grid;grid-template-columns:115px 1fr;gap:20px;padding:21px 0;border-bottom:1px solid rgba(255,255,255,.09)}.ky-row b{font-size:9px;letter-spacing:.12em;color:#9cb2a4}.ky-row p{margin:0;color:rgba(245,243,237,.64);font-size:12px;line-height:1.6}
.ky-visual{position:relative;min-height:500px;border-radius:25px;overflow:hidden;background:#173247}.ky-visual img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transition:transform .8s cubic-bezier(.22,1,.36,1)}.ky-visual:hover img{transform:scale(1.045)}.ky-visual:after{content:"";position:absolute;inset:0;background:linear-gradient(0deg,rgba(9,25,34,.68),transparent 58%)}
.ky-visual-label{position:absolute;z-index:1;left:26px;bottom:24px;color:#fff}.ky-visual-label strong{display:block;font:400 34px/1 "Iowan Old Style",Baskerville,Georgia,serif}.ky-visual-label span{display:block;margin-top:8px;color:rgba(255,255,255,.72);font-size:10px}
.ky-journey{display:grid;grid-template-columns:repeat(5,1fr);margin-top:42px;border-top:1px solid rgba(255,255,255,.16);border-bottom:1px solid rgba(255,255,255,.16)}.ky-step{padding:23px 18px;border-right:1px solid rgba(255,255,255,.12);min-height:220px}.ky-step:last-child{border-right:0}.ky-step b{font-size:9px;color:#a7c0af}.ky-step h3{margin:38px 0 10px;font:400 24px/1 "Iowan Old Style",Baskerville,Georgia,serif}.ky-step p{margin:0;color:rgba(255,255,255,.63);font-size:11px;line-height:1.55}
.ky-world{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:44px}.ky-world article{padding:32px;border:1px solid rgba(255,255,255,.09);border-radius:21px;background:#202c27}.ky-world article:last-child{background:#1a2931}.ky-world h3{margin:31px 0 14px;font:400 34px/1 "Iowan Old Style",Baskerville,Georgia,serif;color:#f6f4ee}.ky-world .kt-kicker{color:#9eb3a5}
.ky-pro{display:grid;grid-template-columns:.86fr 1.14fr;gap:65px;align-items:start}.ky-pro-list{border-top:1px solid rgba(255,255,255,.16)}.ky-pro-list li{padding:17px 0;border-bottom:1px solid rgba(255,255,255,.12);color:rgba(255,255,255,.76);font-size:12px;line-height:1.5}
.ky-founder{padding:clamp(76px,9vw,118px) 0;background:#121a17;color:#f6f4ee;border-top:1px solid rgba(255,255,255,.06);border-bottom:1px solid rgba(255,255,255,.06)}.ky-founder-grid{display:grid;grid-template-columns:.62fr 1.38fr;gap:clamp(46px,8vw,100px);align-items:start}.ky-founder-mark{width:min(280px,70vw);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;border:1px solid rgba(210,226,215,.16);background:radial-gradient(circle at 38% 30%,rgba(149,179,159,.18),rgba(255,255,255,.025) 58%,transparent 72%);font:400 clamp(62px,9vw,104px)/1 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.06em;color:#e8efe9;box-shadow:0 38px 90px rgba(0,0,0,.18)}.ky-founder-role{margin:13px 0 0;color:#a9baaf;font-size:11px;letter-spacing:.08em;text-transform:uppercase}.ky-founder-copy{margin:25px 0 0;max-width:760px;color:rgba(246,244,238,.7);font-size:13px;line-height:1.75}.ky-founder-facts{display:grid;grid-template-columns:repeat(3,1fr);margin-top:34px;border-top:1px solid rgba(255,255,255,.1);border-bottom:1px solid rgba(255,255,255,.1)}.ky-founder-facts div{padding:19px 16px 19px 0;border-right:1px solid rgba(255,255,255,.08)}.ky-founder-facts div:last-child{border-right:0}.ky-founder-facts strong{display:block;font:400 23px/1 "Iowan Old Style",Baskerville,Georgia,serif}.ky-founder-facts span{display:block;margin-top:9px;color:rgba(246,244,238,.54);font-size:10px;line-height:1.45}.ky-final{padding:82px 0;background:#18231f;color:#f5f3ed}.ky-final .kt-h2{color:#f5f3ed}.ky-final .kt-copy{color:rgba(245,243,237,.64)}.ky-final-grid{display:grid;grid-template-columns:1fr auto;gap:40px;align-items:end}
@media(max-width:900px){.ky-proof{grid-template-columns:1fr 1fr}.ky-head,.ky-onboard,.ky-pro,.ky-final-grid,.ky-founder-grid{grid-template-columns:1fr}.ky-audiences{grid-template-columns:1fr}.ky-journey{grid-template-columns:1fr 1fr}.ky-step:nth-child(2),.ky-step:nth-child(4){border-right:0}.ky-world{grid-template-columns:1fr}}
@media(max-width:620px){.ky-hero{min-height:620px;padding-top:90px}.ky-proof,.ky-journey,.ky-founder-facts{grid-template-columns:1fr}.ky-proof article,.ky-step{border-right:0;border-bottom:1px solid rgba(25,37,30,.1)}.ky-row{grid-template-columns:1fr;gap:7px}.ky-visual{min-height:380px}}
</style>`;

async function exists(fp){try{await access(fp);return true}catch{return false}}
function replaceMain(html,main){return /<main(?:\s[^>]*)?>[\s\S]*?<\/main>/.test(html)?html.replace(/<main(?:\s[^>]*)?>[\s\S]*?<\/main>/,main):html.replace('</header>','</header>'+main)}
function patchMeta(html,c){
  html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${c.title}</title>`);
  if(/<meta name="description"[^>]*>/.test(html)) html=html.replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${c.description}">`);
  else html=html.replace('</head>',`<meta name="description" content="${c.description}">\n</head>`);
  if(/<link rel="canonical"[^>]*>/.test(html)) html=html.replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="https://komolongevity.com${c.path}">`);
  if(!html.includes('komo-yachting-v1-style')) html=html.replace('</head>',css+'\n</head>');
  return html;
}
function patchMenu(html,c){
  if(html.includes(`href="${c.path}">Yachting</a>`)) return html;
  const anchors=c===locales.fr
    ? ['<a class="kt-menu-link" href="/fr/experience/">KŌMØ Anywhere</a>']
    : c===locales.es
      ? ['<a class="kt-menu-link" href="/es/experience/">KŌMØ Anywhere</a>']
      : ['<a class="kt-menu-link" href="/experience/">KŌMØ Anywhere</a>'];
  for(const anchor of anchors) html=html.replaceAll(anchor,anchor+`<a class="kt-menu-link" href="${c.path}">Yachting</a>`);
  return html;
}
function page(c){
  const proofs=c.proof.map(([a,b])=>`<article><strong>${a}</strong><span>${b}</span></article>`).join('');
  const audiences=c.audiences.map(([e,t,p,cta])=>`<article class="ky-card"><b>${e}</b><h3>${t}</h3><p>${p}</p><a href="/fr/contact/?intent=yachting">${cta} →</a></article>`).join('').replaceAll('/fr/contact/',c===locales.fr?'/fr/contact/':c===locales.es?'/es/contact/':'/contact/');
  const onboard=c.onboard.map(([t,p])=>`<div class="ky-row"><b>${t}</b><p>${p}</p></div>`).join('');
  const steps=c.journey.map(([n,t,p])=>`<article class="ky-step"><b>${n}</b><h3>${t}</h3><p>${p}</p></article>`).join('');
  const proItems=c.proItems.map(x=>`<li>${x}</li>`).join('');
  const contact=c===locales.fr?'/fr/contact/?intent=yachting':c===locales.es?'/es/contact/?intent=yachting':'/contact/?intent=yachting';
  const partners=c===locales.fr?'/fr/partners/':c===locales.es?'/es/partners/':'/partners/';
  const world=c===locales.fr?'/fr/world/':c===locales.es?'/es/world/':'/en/world/';
  return `<main id="main" class="kt-home">
<section class="ky-hero"><div class="ky-hero-media"><img src="/assets/images/komo-brand-collage-v1.webp" alt="" fetchpriority="high"></div><div class="kt-shell"><div class="ky-hero-copy"><p class="kt-ey">${c.heroEy}</p><h1 class="kt-title">${c.heroTitle}</h1><p class="kt-lead">${c.heroLead}</p><div class="kt-btns"><a class="kt-btn kt-btn--ghost" href="${contact}">${c.primary}</a><a class="kt-btn kt-btn--ghost" href="${partners}">${c.secondary}</a></div></div></div></section>
<section class="ky-proof">${proofs}</section>
<section class="ky-section"><div class="kt-shell"><div class="ky-head"><div><p class="kt-ey">KŌMØ YACHTING</p><h2 class="kt-h2">${c.audienceTitle}</h2></div><p class="kt-copy">${c.audienceLead}</p></div><div class="ky-audiences">${audiences}</div></div></section>
<section class="ky-section ky-section--sea"><div class="kt-shell ky-onboard"><div><p class="kt-ey">ONBOARD DELIVERY</p><h2 class="kt-h2">${c.onboardTitle}</h2><p class="kt-copy">${c.onboardLead}</p><div class="ky-list">${onboard}</div></div><div class="ky-visual"><img src="/assets/images/hero-mediterranean-motion-v1.webp" alt="" loading="lazy"><div class="ky-visual-label"><strong>KŌMØ onboard</strong><span>Motion · Pulse · World</span></div></div></div></section>
<section class="ky-section ky-section--dark"><div class="kt-shell"><p class="kt-ey">CONTINUITY</p><h2 class="kt-h2">${c.journeyTitle}</h2><div class="ky-journey">${steps}</div></div></section>
<section class="ky-section"><div class="kt-shell"><div class="ky-head"><div><p class="kt-ey">PULSE + WORLD</p><h2 class="kt-h2">${c.worldTitle}</h2></div><p class="kt-copy">${c.worldCopy}</p></div><div class="ky-world"><article><span class="kt-kicker">KŌMØ PULSE</span><h3>Results · plan · follow-up</h3><p class="kt-copy">${c.worldCopy}</p><div class="kt-btns"><a class="kt-btn kt-btn--light" href="https://pulse.komolongevity.com/">Pulse →</a></div></article><article><span class="kt-kicker">KŌMØ WORLD</span><h3>Functional Twin · Fitness · Library</h3><p class="kt-copy">${c.worldCopy}</p><div class="kt-btns"><a class="kt-btn kt-btn--light" href="${world}">${c.worldCta} →</a></div></article></div></div></section>
<section class="ky-section ky-section--dark"><div class="kt-shell ky-pro"><div><p class="kt-ey">B2B YACHTING</p><h2 class="kt-h2">${c.proTitle}</h2><p class="kt-copy">${c.proCopy}</p><div class="kt-btns"><a class="kt-btn kt-btn--ghost" href="${contact}">${c.secondary}</a></div></div><ul class="ky-pro-list">${proItems}</ul></div></section>
<section class="ky-founder"><div class="kt-shell ky-founder-grid"><div><div class="ky-founder-mark" aria-hidden="true">RC</div></div><div><p class="kt-ey">${c.founderEy}</p><h2 class="kt-h2">${c.founderName}</h2><p class="ky-founder-role">${c.founderRole}</p><p class="ky-founder-copy">${c.founderCopy}</p><p class="ky-founder-copy">${c.founderCopy2}</p><div class="ky-founder-facts">${c.founderFacts.map(([a,b])=>`<div><strong>${a}</strong><span>${b}</span></div>`).join('')}</div><div class="kt-btns"><a class="kt-btn kt-btn--ghost" href="${c===locales.fr?'/fr/a-propos/':c===locales.es?'/es/sobre/':'/about/'}">${c.founderCta} →</a></div></div></div></section>
<section class="ky-section"><div class="kt-shell"><p class="kt-note">${c.medical}</p></div></section>
<section class="ky-final"><div class="kt-shell ky-final-grid"><div><p class="kt-ey">KŌMØ YACHTING</p><h2 class="kt-h2">${c.finalTitle}</h2><p class="kt-copy">${c.finalCopy}</p></div><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${contact}">${c.finalCta}</a></div></div></section>
</main>`;
}

async function createPage(c){
  const src=join(site,c.source);if(!(await exists(src)))return;
  let html=await readFile(src,'utf8');html=patchMenu(html,c);html=patchMeta(html,c);html=replaceMain(html,page(c));
  const fp=join(site,c.file);await mkdir(dirname(fp),{recursive:true});await writeFile(fp,html,'utf8');
}
async function patchExperience(c){
  const fp=join(site,c.experience);if(!(await exists(fp)))return;
  let html=await readFile(fp,'utf8');html=patchMenu(html,c);
  if(c===locales.fr) html=html.replace('<a href="/fr/experience/" class="kt-btn kt-btn--light">Découvrir Yachting</a>',`<a href="${c.path}" class="kt-btn kt-btn--light">Découvrir Yachting</a>`);
  if(c===locales.en) html=html.replace('<a href="/experience/" class="kt-btn kt-btn--light">Explore Yachting</a>',`<a href="${c.path}" class="kt-btn kt-btn--light">Explore Yachting</a>`);
  if(c===locales.es) html=html.replace('<a href="/es/experience/" class="kt-btn kt-btn--light">Descubrir Yachting</a>',`<a href="${c.path}" class="kt-btn kt-btn--light">Descubrir Yachting</a>`);
  if(!html.includes('komo-yachting-v1-style')) html=html.replace('</head>',css+'\n</head>');
  await writeFile(fp,html,'utf8');
}
async function patchHome(c){
  const fp=join(site,c.source);if(!(await exists(fp)))return;
  let html=await readFile(fp,'utf8');html=patchMenu(html,c);
  const marker='<section class="kt-z-section kt-z-section--sage" id="komo-anywhere">';
  if(html.includes(marker)&&!html.includes('ky-home-yachting')){
    const cta=c===locales.fr?'Découvrir KŌMØ Yachting':c===locales.es?'Descubrir KŌMØ Yachting':'Explore KŌMØ Yachting';
    const title=c===locales.fr?'KŌMØ à bord':c===locales.es?'KŌMØ a bordo':'KŌMØ onboard';
    const copy=c===locales.fr?'Évaluation fonctionnelle privée, restitution, Pulse et continuité World dans un format conçu pour owners, guests et partenaires yacht.':c===locales.es?'Evaluación funcional privada, restitución, Pulse y continuidad World en un formato para owners, guests y partners.':'Private functional assessment, debrief, Pulse and World continuity in a format designed for owners, guests and yacht partners.';
    const block=`<section class="ky-section ky-section--sea ky-home-yachting"><div class="kt-shell ky-onboard"><div><p class="kt-ey">KŌMØ YACHTING</p><h2 class="kt-h2">${title}</h2><p class="kt-copy">${copy}</p><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${c.path}">${cta} →</a></div></div><div class="ky-visual"><img src="/assets/images/komo-brand-collage-v1.webp" alt="" loading="lazy"><div class="ky-visual-label"><strong>KŌMØ Yachting</strong><span>Owner · Guest · Partner</span></div></div></div></section>`;
    html=html.replace(marker,block+'\n'+marker);
  }
  if(!html.includes('komo-yachting-v1-style')) html=html.replace('</head>',css+'\n</head>');
  await writeFile(fp,html,'utf8');
}

for(const c of Object.values(locales)){await patchHome(c);await patchExperience(c);await createPage(c);}

const publicFiles=['fr/world/index.html','en/world/index.html','es/world/index.html','fr/partners/index.html','partners/index.html','es/partners/index.html'];
for(const rel of publicFiles){
  const fp=join(site,rel);if(!(await exists(fp)))continue;let html=await readFile(fp,'utf8');
  const c=rel.startsWith('fr/')?locales.fr:rel.startsWith('es/')?locales.es:locales.en;
  html=patchMenu(html,c);if(!html.includes('komo-yachting-v1-style'))html=html.replace('</head>',css+'\n</head>');await writeFile(fp,html,'utf8');
}

const sitemap=join(site,'sitemap.xml');
if(await exists(sitemap)){
  let xml=await readFile(sitemap,'utf8');
  for(const c of Object.values(locales)){const loc='https://komolongevity.com'+c.path;if(!xml.includes('<loc>'+loc+'</loc>'))xml=xml.replace('</urlset>',`  <url><loc>${loc}</loc><priority>0.9</priority></url>\n</urlset>`);}
  await writeFile(sitemap,xml,'utf8');
}
console.log('[komo-yachting-v1] PASS · dedicated Owner, Guest and Partner yachting pathway published.');
