import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Final, additive commercial presentation layer. Does not modify Pulse, Acuity,
// patient records, payment, account creation or scientific scoring.
const site = join(process.cwd(), 'site');
const acuityOnline = 'https://app.acuityscheduling.com/schedule.php?owner=40696577&amp;appointmentType=99940918';
const acuityParis = 'https://app.acuityscheduling.com/schedule.php?owner=40696577';
const pulse = 'https://pulse.komolongevity.com/';
const mail = 'mailto:contact@komolongevity.com';
const locales = [
  { file: 'index.html', lang: 'fr' },
  { file: 'fr/index.html', lang: 'fr' },
  { file: 'en/index.html', lang: 'en' },
  { file: 'es/index.html', lang: 'es' }
];
const copy = {
  fr: {
    title: 'KŌMØ Longevity — Bilans Motion en ligne, à Paris et à Cannes',
    description: 'Découvrez les bilans fonctionnels non médicaux KŌMØ : en ligne 49 € / 30 min, à Paris chez Centré 200 €, à Cannes et sur site. Réservation via Acuity, suivi dans Pulse.',
    h1: 'Votre mouvement.<br>Votre point de départ.',
    hero: 'Un bilan fonctionnel pour mieux comprendre votre mobilité. À distance ou en présentiel, choisissez l’expérience KŌMØ adaptée à vos objectifs.',
    heroAction: 'Réserver le bilan en ligne · 49 €', heroOther: 'Comparer les offres',
    nav: 'Nos offres', eyebrow: 'KŌMØ · OFFRES & RÉSERVATIONS',
    sectionTitle: 'Choisissez votre bilan.', sectionLead: 'Trois formats, une même ambition : observer votre mobilité avec méthode, puis vous donner une suite claire. Les bilans Motion sont non médicaux et non diagnostiques.',
    popular: 'DISPONIBLE À DISTANCE', onlineLoc: 'CHEZ VOUS · VISIO',
    onlineTitle: 'Bilan Motion Online', onlineCost: '49 €', onlineDuration: '30 minutes',
    onlineBody: 'Un entretien fonctionnel et des tests simples guidés en visioconférence. Préparez votre environnement et votre webcam avant la séance dans Pulse.',
    onlinePoints: ['Questionnaires de mobilité et objectifs', 'Tests fonctionnels réalisables à domicile, supervisés en direct', 'Restitution descriptive et prochaines étapes'],
    onlineAction: 'Réserver le bilan en ligne',
    parisLoc: 'PARIS · CENTRÉ', parisTitle: 'Bilan Motion en présentiel', parisCost: '200 €', parisDuration: 'sur rendez-vous',
    parisBody: 'Mesures fonctionnelles de la marche, de l’équilibre, de la mobilité et de la force avec l’équipement disponible sur site et un opérateur KŌMØ.',
    parisPoints: ['Tests standardisés en présentiel', 'Mesures instrumentées selon l’équipement', 'Synthèse et suivi Pulse selon activation'],
    parisAction: 'Réserver à Paris',
    cannesLoc: 'CANNES · RIVIERA', cannesTitle: 'Motion à Cannes', cannesCost: 'Sur demande', cannesDuration: 'disponibilités et tarif à confirmer',
    cannesBody: 'Un bilan fonctionnel organisé sur la Riviera selon le lieu, l’opérateur et l’équipement disponibles.',
    cannesPoints: ['Organisation personnalisée', 'Évaluation fonctionnelle non médicale', 'Restitution et suivi selon la formule'],
    cannesAction: 'Demander un créneau à Cannes',
    flowTitle: 'Un parcours simple', flow: ['1 · Je choisis et je réserve', '2 · Je reçois la confirmation Acuity', '3 · Je prépare mon bilan dans Pulse', '4 · Je réalise ma séance guidée'],
    note: 'Bilan Online : la webcam sert actuellement à préparer et cadrer la séance. La détection automatisée du mouvement et un Motion Score webcam validé ne sont pas annoncés comme disponibles. Le paiement, les reports et annulations suivent les conditions affichées par Acuity.',
    after: 'Déjà réservé ? Préparez votre séance', afterLink: 'Préparation webcam dans Pulse',
    extraEyebrow: 'AUTRES OFFRES KŌMØ', extraTitle: 'Pour aller plus loin.', extraText: 'Réévaluation, interventions privées, établissements : une solution adaptée au lieu et au besoin, sur proposition.',
    extra1: 'Suivi Motion · 6 semaines', extra1Desc: 'Comparer deux évaluations dans des conditions aussi reproductibles que possible.', extra1Action: 'Demander un suivi',
    extra2: 'Yachting & Hospitality', extra2Desc: 'Bilans fonctionnels mobiles pour yachts, hôtels, clubs et expériences privées.', extra2Action: 'Organiser une intervention',
    extra3: 'KŌMØ Professional', extra3Desc: 'Motion Case pour les équipes ; Motion Bench en développement et Motion Lab sur étude de faisabilité.', extra3Action: 'Découvrir les solutions professionnelles',
    faq1: 'Le bilan Online est-il une consultation médicale ?', faqa1: 'Non. Il s’agit d’une prestation d’évaluation fonctionnelle non médicale. Aucun diagnostic, prescription ou avis médical n’est délivré.',
    faq2: 'L’analyse automatique par webcam est-elle déjà proposée ?', faqa2: 'Non. Les tests sont guidés par un opérateur ; la préparation de la caméra ne constitue pas une mesure automatisée validée.',
    faq3: 'Quand puis-je accéder à Pulse ?', faqa3: 'La réservation commence dans Acuity. Le lien de préparation est public ; l’accès à un dossier personnel nécessite ensuite une activation et une vérification d’identité distinctes.'
  },
  en: {
    title: 'KŌMØ Longevity — Online and in-person Motion assessments',
    description: 'Explore KŌMØ non-medical functional assessments: Online €49 / 30 minutes, in Paris at Centré €200, and in Cannes on request. Book with Acuity and prepare in Pulse.',
    h1: 'Your movement.<br>Your starting point.',
    hero: 'A functional assessment to help you understand your mobility. Online or in person, choose the KŌMØ experience that fits your goals.',
    heroAction: 'Book Online · €49', heroOther: 'Compare options',
    nav: 'Services', eyebrow: 'KŌMØ · SERVICES & BOOKINGS',
    sectionTitle: 'Choose your assessment.', sectionLead: 'Three formats, one purpose: observe how you move using a structured method and identify practical next steps. Motion assessments are non-medical and non-diagnostic.',
    popular: 'AVAILABLE REMOTELY', onlineLoc: 'FROM HOME · VIDEO',
    onlineTitle: 'Motion Online assessment', onlineCost: '€49', onlineDuration: '30 minutes',
    onlineBody: 'A functional conversation and simple tests guided live by video. Prepare your space and webcam in Pulse before your session.',
    onlinePoints: ['Mobility questionnaire and goals', 'Simple functional tasks guided live', 'Descriptive feedback and next steps'],
    onlineAction: 'Book Online',
    parisLoc: 'PARIS · CENTRÉ', parisTitle: 'In-person Motion assessment', parisCost: '€200', parisDuration: 'by appointment',
    parisBody: 'Functional assessment of gait, balance, mobility and strength using available onsite equipment with a KŌMØ operator.',
    parisPoints: ['Standardised in-person tests', 'Instrumented measures when available', 'Summary and Pulse follow-up after activation'],
    parisAction: 'Book in Paris',
    cannesLoc: 'CANNES · RIVIERA', cannesTitle: 'Motion in Cannes', cannesCost: 'On request', cannesDuration: 'availability and pricing to confirm',
    cannesBody: 'A functional assessment arranged in the Riviera, subject to venue, operator and equipment availability.',
    cannesPoints: ['Personalised arrangements', 'Non-medical functional assessment', 'Feedback and follow-up per offer'],
    cannesAction: 'Request Cannes availability',
    flowTitle: 'A simple journey', flow: ['1 · Choose and book', '2 · Get your Acuity confirmation', '3 · Prepare in Pulse', '4 · Attend your guided session'],
    note: 'Online: the webcam currently helps prepare and frame the video session. Automated movement detection and a validated webcam Motion Score are not advertised as available. Payment and cancellation terms are displayed by Acuity.',
    after: 'Already booked? Prepare your session', afterLink: 'Webcam preparation in Pulse',
    extraEyebrow: 'MORE KŌMØ OPTIONS', extraTitle: 'Go further.', extraText: 'Reassessments, private services and facilities: tailored arrangements on request.',
    extra1: 'Motion follow-up · 6 weeks', extra1Desc: 'Compare assessments with consistent conditions wherever possible.', extra1Action: 'Ask about follow-up',
    extra2: 'Yachting & Hospitality', extra2Desc: 'Mobile assessments for yachts, hotels, clubs and private experiences.', extra2Action: 'Arrange an on-site session',
    extra3: 'KŌMØ Professional', extra3Desc: 'Motion Case for teams; Motion Bench in development and Motion Lab subject to feasibility.', extra3Action: 'Explore professional solutions',
    faq1: 'Is Online a medical consultation?', faqa1: 'No. This is a non-medical functional assessment. It does not provide diagnosis, prescriptions or medical advice.',
    faq2: 'Is automated webcam tracking available?', faqa2: 'Not yet. Tasks are guided by an operator; preparing your webcam does not constitute validated automated measurement.',
    faq3: 'When can I access Pulse?', faqa3: 'Booking begins in Acuity. The preparation link is public; access to a personal record requires separate activation and identity verification.'
  },
  es: {
    title: 'KŌMØ Longevity — Evaluaciones Motion online, París y Cannes',
    description: 'Evaluaciones funcionales no médicas KŌMØ: Online 49 € / 30 minutos, París Centré 200 €, Cannes bajo consulta. Reservas con Acuity y preparación en Pulse.',
    h1: 'Tu movimiento.<br>Tu punto de partida.',
    hero: 'Una evaluación funcional para comprender mejor tu movilidad. Online o presencial, elige la experiencia KŌMØ adecuada para ti.',
    heroAction: 'Reservar Online · 49 €', heroOther: 'Comparar opciones',
    nav: 'Servicios', eyebrow: 'KŌMØ · SERVICIOS Y RESERVAS',
    sectionTitle: 'Elige tu evaluación.', sectionLead: 'Tres formatos para observar la movilidad con método y definir los próximos pasos. Las evaluaciones Motion no son médicas ni diagnósticas.',
    popular: 'DISPONIBLE A DISTANCIA', onlineLoc: 'DESDE CASA · VÍDEO',
    onlineTitle: 'Evaluación Motion Online', onlineCost: '49 €', onlineDuration: '30 minutos',
    onlineBody: 'Entrevista funcional y pruebas sencillas guiadas en directo. Prepara tu espacio y webcam en Pulse antes de la sesión.',
    onlinePoints: ['Cuestionario y objetivos de movilidad', 'Pruebas funcionales guiadas por videollamada', 'Resumen descriptivo y próximos pasos'],
    onlineAction: 'Reservar Online',
    parisLoc: 'PARÍS · CENTRÉ', parisTitle: 'Evaluación Motion presencial', parisCost: '200 €', parisDuration: 'con cita previa',
    parisBody: 'Evaluación funcional de marcha, equilibrio, movilidad y fuerza con el equipo disponible y un operador KŌMØ.',
    parisPoints: ['Pruebas estandarizadas presenciales', 'Mediciones instrumentadas según disponibilidad', 'Resumen y seguimiento Pulse tras activación'],
    parisAction: 'Reservar en París',
    cannesLoc: 'CANNES · RIVIERA', cannesTitle: 'Motion en Cannes', cannesCost: 'Consultar', cannesDuration: 'disponibilidad y tarifa por confirmar',
    cannesBody: 'Evaluación funcional organizada en la Riviera según lugar, operador y equipo disponibles.',
    cannesPoints: ['Organización personalizada', 'Evaluación funcional no médica', 'Resumen y seguimiento según oferta'],
    cannesAction: 'Consultar disponibilidad en Cannes',
    flowTitle: 'Un recorrido sencillo', flow: ['1 · Elegir y reservar', '2 · Recibir confirmación Acuity', '3 · Preparar en Pulse', '4 · Realizar sesión guiada'],
    note: 'Online: la webcam permite preparar y encuadrar la sesión. La detección automática del movimiento y un Motion Score validado por webcam aún no se anuncian como disponibles. El pago y la cancelación siguen las condiciones de Acuity.',
    after: '¿Ya has reservado? Prepara tu sesión', afterLink: 'Preparación de webcam en Pulse',
    extraEyebrow: 'OTRAS OFERTAS KŌMØ', extraTitle: 'Continuar.', extraText: 'Seguimiento, experiencias privadas y establecimientos: soluciones adaptadas bajo propuesta.',
    extra1: 'Seguimiento Motion · 6 semanas', extra1Desc: 'Comparar evaluaciones en condiciones reproducibles cuando sea posible.', extra1Action: 'Solicitar seguimiento',
    extra2: 'Yachting & Hospitality', extra2Desc: 'Evaluaciones móviles para yates, hoteles, clubes y experiencias privadas.', extra2Action: 'Organizar una sesión',
    extra3: 'KŌMØ Professional', extra3Desc: 'Motion Case para equipos; Motion Bench en desarrollo y Motion Lab sujeto a viabilidad.', extra3Action: 'Ver soluciones profesionales',
    faq1: '¿Online es una consulta médica?', faqa1: 'No. Es una evaluación funcional no médica, sin diagnóstico, prescripción ni asesoramiento médico.',
    faq2: '¿Existe ya el análisis automático por webcam?', faqa2: 'No. Las pruebas son guiadas por un operador; preparar la cámara no equivale a una medida automática validada.',
    faq3: '¿Cuándo puedo acceder a Pulse?', faqa3: 'La reserva empieza en Acuity. La preparación es pública; el expediente personal requiere activación y verificación de identidad.'
  }
};
const css = [
'<style id="komo-offers-online-20261029">',
'.ko-services{padding:clamp(72px,8vw,116px) 0;background:#f6f3eb;color:#202822;border-top:1px solid rgba(43,55,47,.14)}',
'.ko-shell{width:min(1160px,calc(100% - 44px));margin:auto}.ko-ey{margin:0 0 16px;color:#637568;font-size:10px;font-weight:800;letter-spacing:.17em;text-transform:uppercase}',
'.ko-heading{display:grid;grid-template-columns:1fr 1fr;gap:40px;align-items:end;margin-bottom:40px}.ko-heading h2,.ko-extra h2{margin:0;font:400 clamp(38px,5vw,66px)/1 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.05em}',
'.ko-heading>p,.ko-extra-head>p{margin:0;max-width:510px;color:#5d665f;font-size:14px;line-height:1.7}',
'.ko-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}',
'.ko-card{display:flex;flex-direction:column;min-width:0;min-height:510px;padding:30px 27px;border-radius:24px;background:#fffdf8;border:1px solid rgba(40,52,44,.13);box-shadow:0 12px 40px rgba(29,34,29,.035)}',
'.ko-card--online{background:#1d3027;color:#f9f7ef;box-shadow:0 18px 55px rgba(20,43,29,.13)}.ko-card--cannes{background:#eae5db}',
'.ko-card-top{min-height:25px;font-size:10px;font-weight:800;letter-spacing:.13em;color:#6d7a6f}.ko-card--online .ko-card-top{color:#bdd0be}',
'.ko-card h3{margin:25px 0 20px;font:400 clamp(30px,3vw,43px)/1.02 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.05em}',
'.ko-cost{font:500 34px/1 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.04em}.ko-duration{display:block;margin-top:7px;color:#717970;font-size:11px}.ko-card--online .ko-duration{color:#bdccc2}',
'.ko-card>p{margin:24px 0 0;min-height:96px;font-size:13px;line-height:1.65;color:#5c655d}.ko-card--online>p{color:#dde6db}',
'.ko-card ul{margin:15px 0 25px;padding:0;list-style:none}.ko-card li{padding:11px 0;border-top:1px solid rgba(60,73,61,.14);font-size:12px;line-height:1.5}.ko-card--online li{border-color:rgba(255,255,255,.17)}',
'.ko-card li:before{content:"✓";color:#75927e;padding-right:10px}.ko-card--online li:before{color:#c9dfb9}',
'.ko-action{display:flex;align-items:center;justify-content:center;min-height:46px;padding:10px 15px;margin-top:auto;border:1px solid #1d3027;border-radius:999px;background:#1d3027;color:#fff!important;text-decoration:none;text-align:center;font-size:12px;font-weight:750}',
'.ko-card--online .ko-action{background:#f6f3eb;border-color:#f6f3eb;color:#1d3027!important}.ko-action:hover{opacity:.85}',
'.ko-flow{margin-top:30px;padding:26px 28px;border-radius:19px;background:#ebece4}.ko-flow strong{font-size:13px}.ko-flow-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:20px 0 15px}.ko-flow-grid span{padding-top:14px;border-top:1px solid rgba(40,52,44,.2);font-size:12px;line-height:1.45}',
'.ko-note{max-width:1040px;font-size:11px;line-height:1.7;color:#616962}.ko-prep{display:inline-block;margin-top:16px;color:#203d2b;font-weight:750;font-size:12px}',
'.ko-extra{padding:62px 0 90px;background:#e5e9e2;color:#202822}.ko-extra-head{display:flex;justify-content:space-between;gap:30px;align-items:end}.ko-extra-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:31px}',
'.ko-extra-item{display:flex;flex-direction:column;padding:25px;border:1px solid rgba(40,52,44,.13);border-radius:18px;background:rgba(255,255,255,.65)}.ko-extra-item h3{font:400 29px/1.1 "Iowan Old Style",Baskerville,Georgia,serif;margin:0 0 15px}.ko-extra-item p{margin:0;color:#626c63;font-size:12px;line-height:1.6}.ko-extra-item a{margin-top:25px;font-size:12px;font-weight:800;color:#243f2d}',
'@media(max-width:980px){.ko-heading{grid-template-columns:1fr}.ko-grid{grid-template-columns:1fr}.ko-card{min-height:0}.ko-card>p{min-height:0}.ko-flow-grid{grid-template-columns:repeat(2,1fr)}.ko-extra-grid{grid-template-columns:1fr}}',
'@media(max-width:600px){.ko-shell{width:calc(100% - 30px)}.ko-services{padding:63px 0}.ko-card{padding:25px 22px;border-radius:20px}.ko-heading{gap:15px}.ko-flow{padding:22px}.ko-flow-grid{grid-template-columns:1fr}.ko-extra-head{display:block}}',
'</style>'
].join('\n');

function items(list){return '<ul>'+list.map(x=>'<li>'+x+'</li>').join('')+'</ul>'}
function card(c,which,url){
  const p=which==='online'?'online':which;
  const modifier=which==='online'?' ko-card--online':which==='cannes'?' ko-card--cannes':'';
  return '<article class="ko-card'+modifier+'">'+
    '<div class="ko-card-top">'+c[p+'Loc']+'</div><h3>'+c[p+'Title']+'</h3>'+
    '<div class="ko-cost">'+c[p+'Cost']+'</div><small class="ko-duration">'+c[p+'Duration']+'</small>'+
    '<p>'+c[p+'Body']+'</p>'+items(c[p+'Points'])+
    '<a class="ko-action" href="'+url+'">'+c[p+'Action']+' ↗</a></article>';
}
function extra(title,description,action,url){
  return '<article class="ko-extra-item"><h3>'+title+'</h3><p>'+description+'</p><a href="'+url+'">'+action+' →</a></article>';
}
function services(c,lang){
 const partner=lang==='fr'?'/fr/partners/':lang==='es'?'/es/partners/':'/partners/';
 const experience=lang==='fr'?'/fr/experience/':lang==='es'?'/es/experience/':'/experience/';
 return '<section class="ko-services" id="solutions" aria-labelledby="ko-offers-title"><div class="ko-shell">'+
  '<div class="ko-heading"><div><p class="ko-ey">'+c.eyebrow+'</p><h2 id="ko-offers-title">'+c.sectionTitle+'</h2></div><p>'+c.sectionLead+'</p></div>'+
  '<div class="ko-grid">'+card(c,'online',acuityOnline)+card(c,'paris',acuityParis)+card(c,'cannes',mail+'?subject=KOMO%20Motion%20Cannes')+'</div>'+
  '<div class="ko-flow"><strong>'+c.flowTitle+'</strong><div class="ko-flow-grid">'+c.flow.map(s=>'<span>'+s+'</span>').join('')+'</div>'+
  '<p class="ko-note">'+c.note+'</p><a class="ko-prep" href="'+pulse+'online/">'+c.after+' · '+c.afterLink+' →</a></div></div></section>'+
  '<section class="ko-extra"><div class="ko-shell"><div class="ko-extra-head"><div><p class="ko-ey">'+c.extraEyebrow+'</p><h2>'+c.extraTitle+'</h2></div><p>'+c.extraText+'</p></div>'+
  '<div class="ko-extra-grid">'+extra(c.extra1,c.extra1Desc,c.extra1Action,mail+'?subject=KOMO%20Motion%20suivi')+
  extra(c.extra2,c.extra2Desc,c.extra2Action,experience)+extra(c.extra3,c.extra3Desc,c.extra3Action,partner)+'</div></div></section>';
}
function faq(c){
 return '<section class="kt-z-section kt-z-section--sage"><div class="kt-shell kt-z-faq"><div><p class="kt-ey">FAQ</p><h2 class="kt-h2">Questions fréquentes / FAQ</h2></div><div>'+
  '<details><summary>'+c.faq1+'</summary><p>'+c.faqa1+'</p></details>'+
  '<details><summary>'+c.faq2+'</summary><p>'+c.faqa2+'</p></details>'+
  '<details><summary>'+c.faq3+'</summary><p>'+c.faqa3+'</p></details>'+
  '</div></div></section>';
}
for(const {file,lang} of locales){
 const fp=join(site,file),c=copy[lang];
 let html=await readFile(fp,'utf8');
 if(html.includes('komo-offers-online-20261029')) continue;
 const oldOffer=/<section class="kc-quick"[^>]*>[\s\S]*?(?=<section class="khe-eco">)/;
 if(!oldOffer.test(html))throw new Error('[offers] expected old offer sections missing: '+file);
 html=html.replace(oldOffer,services(c,lang));
 const hero=/<div class="kc-hero-copy">[\s\S]*?(?=<\/div><figure class="kpv-hero-media">)/;
 if(!hero.test(html))throw new Error('[offers] expected hero copy missing: '+file);
 html=html.replace(hero,'<div class="kc-hero-copy"><p class="ko-ey">'+c.eyebrow+'</p><h1 class="kt-title">'+c.h1+'</h1><p class="kt-lead">'+c.hero+'</p><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="'+acuityOnline+'">'+c.heroAction+'</a><a class="kt-btn kt-btn--light" href="#solutions">'+c.heroOther+' →</a></div>');
 const oldFAQ=/<section class="kt-z-section kt-z-section--sage"><div class="kt-shell kt-z-faq">[\s\S]*?<\/section>/;
 if(oldFAQ.test(html))html=html.replace(oldFAQ,faq(c));
 if(!html.includes(css))html=html.replace('</head>',css+'\n</head>');
 html=html.replace(/<title>[\s\S]*?<\/title>/,'<title>'+c.title+'</title>');
 html=html.replace(/<meta name="description" content="[^"]*">/,'<meta name="description" content="'+c.description+'">');
 html=html.replace(/<meta property="og:description" content="[^"]*">/,'<meta property="og:description" content="'+c.description+'">');
 html=html.replace(/<meta property="og:title" content="[^"]*">/,'<meta property="og:title" content="'+c.title+'">');
 html=html.replace(/(<div class="kh4-nav"[^>]*>)/,'$1<a href="#solutions">'+c.nav+'</a>');
 html=html.replace(/(<div class="kt-menu-group"><strong>Services KŌMØ<\/strong>)/,'$1<a class="kt-menu-link" href="#solutions">'+c.nav+'</a>');
 if(!html.includes('appointmentType=99940918'))throw new Error('[offers] online booking URL absent: '+file);
 if(!html.includes('id="solutions"'))throw new Error('[offers] offers anchor absent: '+file);
 await writeFile(fp,html,'utf8');
 console.log('[komo-offers-online] PASS '+file);
}