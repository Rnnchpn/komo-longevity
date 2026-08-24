import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site = join(process.cwd(), 'site');

const CSS = `<style id="homepage-patient-final-v2-style">
.kpf{background:#f5f1e9;color:#161b2a}.kpf-shell{width:min(calc(100% - 40px),1160px);margin:auto}.kpf-hero{padding:clamp(54px,7vw,88px) 0 clamp(64px,8vw,100px)}.kpf-ey{margin:0 0 16px;color:#8a7352;font-size:9px;font-weight:850;letter-spacing:.16em;text-transform:uppercase}.kpf-brand{margin:0;font:850 clamp(76px,11.8vw,148px)/.8 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:-.075em;text-transform:uppercase}.kpf-brand span{display:block;margin-top:clamp(22px,3vw,38px);color:#8a7352;font:400 clamp(38px,4.8vw,62px)/.92 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.045em;text-transform:none}.kpf-hero-grid{display:grid;grid-template-columns:minmax(0,.76fr) minmax(460px,1.24fr);gap:clamp(42px,7vw,92px);align-items:end;margin-top:clamp(44px,5vw,64px)}.kpf-copy{padding-top:24px;border-top:1px solid #161b2a}.kpf-copy h1{margin:0;font:400 clamp(46px,5.5vw,70px)/.94 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.052em}.kpf-copy h1 em{font-style:normal;color:#8a7352}.kpf-lead{margin:22px 0 0;max-width:520px;color:#363a44;font:400 17px/1.62 'Iowan Old Style',Baskerville,Georgia,serif}.kpf-signature{margin:24px 0 0;color:#8a7352;font-size:9px;font-weight:850;letter-spacing:.13em;text-transform:uppercase}.kpf-actions{display:flex;gap:15px;align-items:center;flex-wrap:wrap;margin-top:24px}.kpf-btn{display:inline-flex;min-height:48px;align-items:center;justify-content:center;padding:0 18px;border-radius:999px;background:#161b2a;color:#fff!important;text-decoration:none;font-size:11px;font-weight:850}.kpf-link{display:inline-flex;padding-bottom:3px;border-bottom:1px solid currentColor;text-decoration:none;font-size:10px;font-weight:850}.kpf-visual{margin:0;position:relative;overflow:hidden;border-radius:22px;background:#ebe6dc;box-shadow:0 28px 80px rgba(18,20,16,.07);aspect-ratio:4/3}.kpf-visual img{width:100%;height:100%;display:block;object-fit:contain;object-position:center;background:linear-gradient(145deg,#ebe6dc,#f8f5ef)}.kpf-visual figcaption{position:absolute;left:18px;right:18px;bottom:16px;display:flex;justify-content:space-between;gap:16px;align-items:center;padding:11px 13px;border:1px solid rgba(255,255,255,.38);border-radius:999px;background:rgba(245,241,233,.88);backdrop-filter:blur(14px);font-size:9px}.kpf-visual figcaption strong{font-weight:850}.kpf-visual figcaption a{text-decoration:none;font-weight:850}.kpf-section{padding:clamp(68px,8vw,96px) 0;border-top:1px solid rgba(18,20,16,.13)}.kpf-white{background:#fdfcf8}.kpf-head{display:grid;grid-template-columns:.86fr 1.14fr;gap:clamp(40px,8vw,104px);align-items:end;margin-bottom:36px}.kpf-title{margin:0;font:400 clamp(42px,5vw,64px)/.95 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.05em}.kpf-title em{font-style:normal;color:#8a7352}.kpf-head p{margin:0;max-width:570px;color:#6f7078;font:400 16px/1.65 'Iowan Old Style',Baskerville,Georgia,serif}.kpf-path{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #161b2a;border-bottom:1px solid #161b2a}.kpf-path a{min-height:230px;padding:22px 24px 24px 0;border-right:1px solid rgba(18,20,16,.13);text-decoration:none;display:flex;flex-direction:column;justify-content:space-between}.kpf-path a:not(:first-child){padding-left:24px}.kpf-path a:last-child{border-right:0}.kpf-path small{color:#8a7352;font-size:8px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.kpf-path h2{margin:42px 0 8px;font:400 31px/1 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.035em}.kpf-path p{margin:0;color:#6f7078;font-size:11px;line-height:1.58}.kpf-path b{display:block;margin-top:24px;font-size:9px}.kpf-measures{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid #161b2a}.kpf-measure{padding:20px 22px 20px 0;border-right:1px solid rgba(18,20,16,.13);border-bottom:1px solid rgba(18,20,16,.13)}.kpf-measure:not(:first-child){padding-left:22px}.kpf-measure:last-child{border-right:0}.kpf-measure span{display:block;color:#8a7352;font-size:8px;font-weight:850;letter-spacing:.11em}.kpf-measure h3{margin:38px 0 7px;font:400 28px/1 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.03em}.kpf-measure p{margin:0;color:#6f7078;font-size:11px;line-height:1.56}.kpf-final{padding:clamp(70px,9vw,112px) 0}.kpf-final-grid{display:grid;grid-template-columns:1fr .9fr;gap:clamp(42px,8vw,105px);align-items:end}.kpf-final h2{margin:0;font:400 clamp(46px,5.6vw,72px)/.94 'Iowan Old Style',Baskerville,Georgia,serif;letter-spacing:-.052em}.kpf-final h2 em{font-style:normal;color:#8a7352}.kpf-final p{margin:0 0 24px;color:#6f7078;font:400 16px/1.65 'Iowan Old Style',Baskerville,Georgia,serif}.kpf-network{display:block;margin-top:15px;font-size:10px;color:#6f7078}.kpf-network a{color:#161b2a;text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:2px;font-weight:850}@media(max-width:900px){.kpf-hero-grid,.kpf-head,.kpf-final-grid{grid-template-columns:1fr}.kpf-hero-grid{gap:30px}.kpf-visual{max-width:760px}.kpf-path,.kpf-measures{grid-template-columns:1fr 1fr}.kpf-path a:nth-child(2),.kpf-measure:nth-child(2){border-right:0}.kpf-path a:nth-child(-n+2),.kpf-measure:nth-child(-n+2){border-bottom:1px solid rgba(18,20,16,.13)}.kpf-path a:nth-child(3),.kpf-measure:nth-child(3){padding-left:0}}@media(max-width:620px){.kpf-shell{width:min(calc(100% - 28px),1160px)}.kpf-hero{padding:38px 0 54px}.kpf-ey{font-size:8px}.kpf-brand{font-size:clamp(54px,17.8vw,68px);line-height:.82;max-width:100%}.kpf-brand span{margin-top:18px;font-size:35px}.kpf-hero-grid{margin-top:32px;gap:24px}.kpf-copy{padding-top:18px}.kpf-copy h1{font-size:40px}.kpf-lead{margin-top:17px;font-size:16px;line-height:1.55}.kpf-signature{margin-top:18px;font-size:8px}.kpf-actions{display:grid;gap:12px;margin-top:20px}.kpf-btn{width:100%;min-height:50px}.kpf-link{justify-self:start}.kpf-visual{border-radius:18px;aspect-ratio:4/3}.kpf-visual figcaption{left:10px;right:10px;bottom:10px;padding:10px 12px}.kpf-section{padding:54px 0}.kpf-head{gap:15px;margin-bottom:25px}.kpf-title{font-size:39px}.kpf-head p{font-size:15px;line-height:1.56}.kpf-path,.kpf-measures{grid-template-columns:1fr}.kpf-path a,.kpf-path a:not(:first-child),.kpf-path a:nth-child(3){min-height:0;padding:18px 0;border-right:0;border-bottom:1px solid rgba(18,20,16,.13)}.kpf-path h2{margin:24px 0 7px;font-size:28px}.kpf-path b{margin-top:14px}.kpf-measure,.kpf-measure:not(:first-child),.kpf-measure:nth-child(3){padding:17px 0;border-right:0}.kpf-measure h3{margin:20px 0 6px;font-size:27px}.kpf-final{padding:58px 0}.kpf-final-grid{gap:23px}.kpf-final h2{font-size:43px}.kpf-final p{font-size:15px}.kpf-network{font-size:9px}}@media(max-width:380px){.kpf-brand{font-size:51px}.kpf-brand span{font-size:32px}.kpf-copy h1,.kpf-title{font-size:36px}}
</style>`;

const C = {
  fr: {
    file:join(site,'fr','index.html'),
    title:'KŌMØ Longevity | Pulse, bilan locomoteur & suivi',
    desc:'Accédez à KŌMØ Pulse pour créer votre compte, réaliser le KŌMØ Loco Check, préparer votre bilan et suivre vos résultats Motion et Clinical.',
    ey:'PLATEFORME DE LONGÉVITÉ LOCOMOTRICE',
    h1:'Accédez à la plateforme<br><em>KŌMØ Pulse.</em>',
    lead:'KŌMØ Pulse est votre espace personnel de mobilité : un compte unique pour commencer gratuitement, préparer votre évaluation et conserver une trajectoire lisible dans le temps.',
    sig:'UN COMPTE · UN LOCO CHECK · UN BILAN · UNE TRAJECTOIRE',
    assessment:'/fr/bilan/',
    pulse:'https://pulse.komolongevity.com/',
    method:'/fr/methode/',
    case:'/fr/case/',
    network:'/fr/network/',
    cta1:'Accéder à la plateforme Pulse →',
    cta2:'Comprendre la méthode →',
    heroAlt:'Aperçu de KŌMØ Pulse, plateforme de mobilité et de suivi longitudinal',
    caseCaption:'KŌMØ Pulse · votre espace personnel',
    caseLink:'Ouvrir Pulse →',
    pathTitle:'Un point d’entrée unique.<br><em>Tout le parcours ensuite.</em>',
    pathLead:'Le site KŌMØ explique la méthode, les évaluations et le réseau. Pulse concentre désormais toutes les actions personnelles dans un environnement sécurisé.',
    cards:[
      ['01','CRÉER VOTRE COMPTE','Votre espace Pulse','Création gratuite, confirmation par e-mail et profil personnel bilingue.','Créer mon compte →','pulse'],
      ['02','KŌMØ LOCO CHECK','Votre premier repère','Le questionnaire et les tests guidés commencent dans votre compte Pulse.','Commencer le Loco Check →','pulse'],
      ['03','PRÉPARER LE BILAN','Avant la consultation','Objectifs, contexte et informations utiles sont préparés avant votre rendez-vous.','Comprendre le parcours →','assessment'],
      ['04','SUIVRE VOS RÉSULTATS','Motion + Clinical','Résultats, priorités et réévaluations sont reliés dans une trajectoire longitudinale.','Voir mon espace →','pulse']
    ],
    measuresTitle:'Ce que Pulse réunit.',
    measuresLead:'Chaque couche conserve son rôle : prévention, mesure, interprétation médicale et continuité.',
    measures:[
      ['01','Loco Check','Un premier repère de mobilité accessible gratuitement.'],
      ['02','Motion','Les mesures fonctionnelles et instrumentées du mouvement.'],
      ['03','Clinical','Le contexte et l’interprétation du professionnel de santé.'],
      ['04','Suivi','Les résultats, rendez-vous et nouvelles évaluations dans le temps.']
    ],
    methodCta:'Découvrir la méthode KŌMØ →',
    finalTitle:'Votre mobilité.<br><em>Comprise dans le temps.</em>',
    finalCopy:'Créez votre compte Pulse dès maintenant. Le site KŌMØ reste votre référence pour comprendre la méthode, la science et le réseau professionnel.',
    networkText:'Besoin de trouver un praticien ou un centre équipé ?',
    networkCta:'Voir le Réseau KŌMØ ↗'
  },
  en: {
    file:join(site,'index.html'),
    title:'KŌMØ Longevity | Pulse mobility platform & follow-up',
    desc:'Access KŌMØ Pulse to create your account, complete the KŌMØ Loco Check, prepare your assessment and follow Motion and Clinical results over time.',
    ey:'LOCOMOTOR LONGEVITY PLATFORM',
    h1:'Access the<br><em>KŌMØ Pulse platform.</em>',
    lead:'KŌMØ Pulse is your personal mobility space: one account to start for free, prepare your assessment and keep a clear longitudinal view over time.',
    sig:'ONE ACCOUNT · ONE LOCO CHECK · ONE ASSESSMENT · ONE TRAJECTORY',
    assessment:'/assessment/',
    pulse:'https://pulse.komolongevity.com/',
    method:'/method/',
    case:'/case/',
    network:'/network/',
    cta1:'Access the Pulse platform →',
    cta2:'Understand the method →',
    heroAlt:'Preview of KŌMØ Pulse, the mobility and longitudinal follow-up platform',
    caseCaption:'KŌMØ Pulse · your personal space',
    caseLink:'Open Pulse →',
    pathTitle:'One point of entry.<br><em>The full journey next.</em>',
    pathLead:'The KŌMØ website explains the method, assessments and network. Pulse now brings every personal action into one secure environment.',
    cards:[
      ['01','CREATE YOUR ACCOUNT','Your Pulse space','Free account creation, email confirmation and a bilingual personal profile.','Create my account →','pulse'],
      ['02','KŌMØ LOCO CHECK','Your first reference','The questionnaire and guided tests now begin inside your Pulse account.','Start the Loco Check →','pulse'],
      ['03','PREPARE THE ASSESSMENT','Before the appointment','Goals, context and useful information are prepared before your visit.','Understand the journey →','assessment'],
      ['04','FOLLOW YOUR RESULTS','Motion + Clinical','Results, priorities and reassessments are connected in one longitudinal trajectory.','View my space →','pulse']
    ],
    measuresTitle:'What Pulse brings together.',
    measuresLead:'Each layer keeps a distinct role: prevention, measurement, clinical interpretation and continuity.',
    measures:[
      ['01','Loco Check','A first mobility reference available free of charge.'],
      ['02','Motion','Functional and instrumented movement measurements.'],
      ['03','Clinical','Context and interpretation by the healthcare professional.'],
      ['04','Follow-up','Results, appointments and reassessments over time.']
    ],
    methodCta:'Discover the KŌMØ method →',
    finalTitle:'Your mobility.<br><em>Understood over time.</em>',
    finalCopy:'Create your Pulse account now. The KŌMØ website remains your reference for the method, science and professional network.',
    networkText:'Looking for a KŌMØ-equipped practitioner or center?',
    networkCta:'Explore KŌMØ Network ↗'
  },
  es: {
    file:join(site,'es','index.html'),
    title:'KŌMØ Longevity | Plataforma Pulse y seguimiento',
    desc:'Accede a KŌMØ Pulse para crear tu cuenta, realizar el KŌMØ Loco Check, preparar tu evaluación y seguir los resultados Motion y Clinical.',
    ey:'PLATAFORMA DE LONGEVIDAD LOCOMOTORA',
    h1:'Accede a la plataforma<br><em>KŌMØ Pulse.</em>',
    lead:'KŌMØ Pulse es tu espacio personal de movilidad: una cuenta para empezar gratis, preparar tu evaluación y mantener una trayectoria clara en el tiempo.',
    sig:'UNA CUENTA · UN LOCO CHECK · UNA EVALUACIÓN · UNA TRAYECTORIA',
    assessment:'/es/evaluacion/',
    pulse:'https://pulse.komolongevity.com/',
    method:'/es/metodo/',
    case:'/es/case/',
    network:'/es/network/',
    cta1:'Acceder a la plataforma Pulse →',
    cta2:'Comprender el método →',
    heroAlt:'Vista previa de KŌMØ Pulse, plataforma de movilidad y seguimiento longitudinal',
    caseCaption:'KŌMØ Pulse · tu espacio personal',
    caseLink:'Abrir Pulse →',
    pathTitle:'Un único punto de entrada.<br><em>Todo el recorrido después.</em>',
    pathLead:'El sitio KŌMØ explica el método, las evaluaciones y la red. Pulse reúne ahora todas las acciones personales en un entorno seguro.',
    cards:[
      ['01','CREAR TU CUENTA','Tu espacio Pulse','Creación gratuita, confirmación por correo y perfil personal bilingüe.','Crear mi cuenta →','pulse'],
      ['02','KŌMØ LOCO CHECK','Tu primera referencia','El cuestionario y las pruebas guiadas comienzan ahora en tu cuenta Pulse.','Empezar el Loco Check →','pulse'],
      ['03','PREPARAR LA EVALUACIÓN','Antes de la consulta','Objetivos, contexto e información útil se preparan antes de tu cita.','Comprender el recorrido →','assessment'],
      ['04','SEGUIR TUS RESULTADOS','Motion + Clinical','Resultados, prioridades y reevaluaciones forman una trayectoria longitudinal.','Ver mi espacio →','pulse']
    ],
    measuresTitle:'Lo que Pulse reúne.',
    measuresLead:'Cada capa conserva su función: prevención, medición, interpretación clínica y continuidad.',
    measures:[
      ['01','Loco Check','Una primera referencia de movilidad disponible gratuitamente.'],
      ['02','Motion','Mediciones funcionales e instrumentadas del movimiento.'],
      ['03','Clinical','Contexto e interpretación por el profesional sanitario.'],
      ['04','Seguimiento','Resultados, citas y reevaluaciones en el tiempo.']
    ],
    methodCta:'Descubrir el método KŌMØ →',
    finalTitle:'Tu movilidad.<br><em>Comprendida en el tiempo.</em>',
    finalCopy:'Crea ahora tu cuenta Pulse. El sitio KŌMØ sigue siendo tu referencia para comprender el método, la ciencia y la red profesional.',
    networkText:'¿Buscas un profesional o centro equipado con KŌMØ?',
    networkCta:'Ver la Red KŌMØ ↗'
  }
};

function main(c){
 const href=k=>c[k];
 const cards=c.cards.map(([n,ey,h,p,b,k])=>'<a href="'+href(k)+'"><div><small>'+n+' · '+ey+'</small><h2>'+h+'</h2><p>'+p+'</p></div><b>'+b+'</b></a>').join('');
 const measures=c.measures.map(([n,h,p])=>'<article class="kpf-measure"><span>'+n+'</span><h3>'+h+'</h3><p>'+p+'</p></article>').join('');
 return '<main class="kpf"><section class="kpf-hero"><div class="kpf-shell"><p class="kpf-ey">'+c.ey+'</p><p class="kpf-brand">KŌMØ<span>Longevity</span></p><div class="kpf-hero-grid"><div class="kpf-copy"><h1>'+c.h1+'</h1><p class="kpf-lead">'+c.lead+'</p><p class="kpf-signature">'+c.sig+'</p><div class="kpf-actions"><a class="kpf-btn" href="'+c.pulse+'">'+c.cta1+'</a><a class="kpf-link" href="'+c.method+'">'+c.cta2+'</a></div></div><figure class="kpf-visual"><img src="/assets/images/pulse-profile-v1.webp" width="1200" height="1200" loading="eager" fetchpriority="high" alt="'+c.heroAlt+'"><figcaption><strong>'+c.caseCaption+'</strong><a href="'+c.pulse+'">'+c.caseLink+'</a></figcaption></figure></div></div></section><section class="kpf-section kpf-white"><div class="kpf-shell"><div class="kpf-head"><h2 class="kpf-title">'+c.pathTitle+'</h2><p>'+c.pathLead+'</p></div><div class="kpf-path">'+cards+'</div></div></section><section class="kpf-section"><div class="kpf-shell"><div class="kpf-head"><h2 class="kpf-title">'+c.measuresTitle+'</h2><p>'+c.measuresLead+'</p></div><div class="kpf-measures">'+measures+'</div><div class="kpf-actions" style="margin-top:22px"><a class="kpf-link" href="'+c.method+'">'+c.methodCta+'</a></div></div></section><section class="kpf-final kpf-white"><div class="kpf-shell kpf-final-grid"><h2>'+c.finalTitle+'</h2><div><p>'+c.finalCopy+'</p><div class="kpf-actions"><a class="kpf-btn" href="'+c.pulse+'">'+c.cta1+'</a><a class="kpf-link" href="'+c.method+'">'+c.cta2+'</a></div><span class="kpf-network">'+c.networkText+' <a href="'+c.network+'">'+c.networkCta+'</a></span></div></div></section></main>';
}

for(const c of Object.values(C)){
 let h=await readFile(c.file,'utf8');
 h=h.replace(/<title>[^<]*<\/title>/i,`<title>${c.title}</title>`)
   .replace(/<meta name="description" content="[^"]*">/i,`<meta name="description" content="${c.desc}">`)
   .replace(/<meta property="og:title" content="[^"]*">/i,`<meta property="og:title" content="${c.title}">`)
   .replace(/<meta property="og:description" content="[^"]*">/i,`<meta property="og:description" content="${c.desc}">`);
 if(!h.includes('homepage-patient-final-v2-style')) h=h.replace('</head>',CSS+'</head>');
 h=h.replace(/<main class="khm">[\s\S]*?<\/main>/,main(c));
 await writeFile(c.file,h,'utf8');
}
console.log('[homepage-patient-final-v2] final patient-first homepage with existing KŌMØ Case image written.');
