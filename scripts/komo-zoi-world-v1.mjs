import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

const site = join(process.cwd(), 'site');

const locales = {
  fr: {
    home: 'index.html',
    worldFile: 'fr/world/index.html',
    infoPath: '/fr/world/',
    pulse: 'https://pulse.komolongevity.com/',
    immersive: '/world/',
    title: 'KŌMØ World — L’environnement numérique de votre trajectoire',
    description: 'KŌMØ World organise votre trajectoire après l’évaluation : priorités, programme, contenus et progression, avec une expérience 3D entièrement optionnelle.',
    heroTitle: 'World organise votre trajectoire KŌMØ',
    heroLead: 'Après l’évaluation, World transforme vos résultats et vos priorités en un environnement d’action. Vous pouvez utiliser une interface classique depuis Pulse ou entrer dans l’expérience 3D lorsque cela apporte quelque chose.',
    primary: 'Entrer dans World',
    secondary: 'Voir Pulse',
    eyebrow: 'KŌMØ WORLD',
    metrics: [
      ['2 modes', 'Interface classique ou expérience 3D optionnelle'],
      ['Twin', 'Visualiser les priorités fonctionnelles'],
      ['Fitness', 'Accéder aux actions et exercices prescrits'],
      ['Library', 'Comprendre les contenus utiles à votre trajectoire']
    ],
    sectionTitle: 'Un espace pour agir après la consultation',
    sectionLead: 'World n’ajoute pas une couche de données. Il rend les prochaines actions plus accessibles et replace les résultats dans un environnement que l’on peut consulter, explorer ou pratiquer.',
    cards: [
      ['01', 'Trajectoire', 'Retrouver les priorités définies après Motion ou Clinical et voir ce qui doit être travaillé maintenant.'],
      ['02', 'Functional Twin', 'Relier les résultats fonctionnels aux zones du corps et aux capacités suivies, sans transformer l’outil en diagnostic autonome.'],
      ['03', 'Fitness', 'Accéder aux exercices, routines et contenus proposés dans votre programme.'],
      ['04', 'Arena', 'Suivre des défis ou séquences de progression lorsque ce format est utile.'],
      ['05', 'Library', 'Consulter les contenus scientifiques et pratiques liés à vos priorités.'],
      ['06', 'Réseau', 'Rester relié aux professionnels et aux prochaines étapes de votre parcours KŌMØ.']
    ],
    flowTitle: 'Comment World s’intègre au parcours',
    flow: [
      ['Évaluation', 'Motion ou Clinical produit les données et l’interprétation nécessaires.'],
      ['Pulse', 'Vos résultats, votre plan et vos rendez-vous restent dans votre espace principal.'],
      ['World', 'Vous utilisez les modules interactifs utiles à votre programme.'],
      ['Réévaluation', 'Les progrès sont comparés lors du prochain point KŌMØ.']
    ],
    boundaryTitle: 'La 3D reste un choix',
    boundary: 'World n’est pas nécessaire pour consulter vos résultats ou suivre votre programme. Les informations importantes restent accessibles dans Pulse. Les décisions médicales restent prises par un professionnel qualifié dans le cadre de KŌMØ Clinical.',
    homeTitle: 'World rend le programme plus concret',
    homeLead: 'Pulse centralise le dossier. World permet d’explorer les priorités, les contenus et les actions qui composent votre programme. La couche 3D est disponible lorsqu’elle améliore l’expérience, jamais comme passage obligatoire.',
    homeCta: 'Comprendre World',
    enterCta: 'Entrer dans l’expérience 3D'
  },
  en: {
    home: 'en/index.html',
    worldFile: 'en/world/index.html',
    infoPath: '/en/world/',
    pulse: 'https://pulse.komolongevity.com/',
    immersive: '/world/',
    title: 'KŌMØ World — The digital environment for your trajectory',
    description: 'KŌMØ World organises your pathway after assessment: priorities, programme, content and progress, with a fully optional 3D experience.',
    heroTitle: 'World organises your KŌMØ trajectory',
    heroLead: 'After assessment, World turns results and priorities into an environment for action. Use the standard Pulse interface, or enter the 3D experience when it adds value.',
    primary: 'Enter World',
    secondary: 'Open Pulse',
    eyebrow: 'KŌMØ WORLD',
    metrics: [
      ['2 modes', 'Standard interface or optional 3D experience'],
      ['Twin', 'Visualise functional priorities'],
      ['Fitness', 'Access prescribed actions and exercises'],
      ['Library', 'Understand content relevant to your trajectory']
    ],
    sectionTitle: 'A place to act after the consultation',
    sectionLead: 'World does not add another dashboard. It makes the next actions easier to access and places results in an environment you can review, explore or use for practice.',
    cards: [
      ['01', 'Trajectory', 'Return to the priorities defined after Motion or Clinical and see what matters now.'],
      ['02', 'Functional Twin', 'Connect functional findings with body regions and capacities without turning the tool into autonomous diagnosis.'],
      ['03', 'Fitness', 'Access exercises, routines and content included in your programme.'],
      ['04', 'Arena', 'Use progression challenges or guided sequences when relevant.'],
      ['05', 'Library', 'Read scientific and practical content connected to your priorities.'],
      ['06', 'Network', 'Stay connected with professionals and the next steps in your KŌMØ pathway.']
    ],
    flowTitle: 'How World fits into the pathway',
    flow: [
      ['Assessment', 'Motion or Clinical provides the required data and interpretation.'],
      ['Pulse', 'Results, plan and appointments remain in your main personal space.'],
      ['World', 'Use the interactive modules that are relevant to your programme.'],
      ['Reassessment', 'Progress is reviewed at the next KŌMØ checkpoint.']
    ],
    boundaryTitle: '3D remains optional',
    boundary: 'You do not need World in 3D to see results or follow your programme. Important information remains available in Pulse. Medical decisions remain the responsibility of qualified professionals within KŌMØ Clinical.',
    homeTitle: 'World makes the programme more tangible',
    homeLead: 'Pulse centralises your record. World lets you explore the priorities, content and actions that make up your programme. The 3D layer is available when it improves the experience, never as a mandatory step.',
    homeCta: 'Understand World',
    enterCta: 'Enter the 3D experience'
  },
  es: {
    home: 'es/index.html',
    worldFile: 'es/world/index.html',
    infoPath: '/es/world/',
    pulse: 'https://pulse.komolongevity.com/',
    immersive: '/world/',
    title: 'KŌMØ World — El entorno digital de tu trayectoria',
    description: 'KŌMØ World organiza tu recorrido después de la evaluación: prioridades, programa, contenidos y progreso, con una experiencia 3D totalmente opcional.',
    heroTitle: 'World organiza tu trayectoria KŌMØ',
    heroLead: 'Después de la evaluación, World convierte resultados y prioridades en un entorno de acción. Puedes usar la interfaz clásica de Pulse o entrar en la experiencia 3D cuando aporte valor.',
    primary: 'Entrar en World',
    secondary: 'Ver Pulse',
    eyebrow: 'KŌMØ WORLD',
    metrics: [
      ['2 modos', 'Interfaz clásica o experiencia 3D opcional'],
      ['Twin', 'Visualizar prioridades funcionales'],
      ['Fitness', 'Acceder a acciones y ejercicios prescritos'],
      ['Library', 'Comprender contenidos relevantes para tu trayectoria']
    ],
    sectionTitle: 'Un espacio para actuar después de la consulta',
    sectionLead: 'World no añade otro panel de datos. Hace más accesibles las siguientes acciones y sitúa los resultados en un entorno que puedes consultar, explorar o utilizar para practicar.',
    cards: [
      ['01', 'Trayectoria', 'Volver a las prioridades definidas tras Motion o Clinical y ver qué trabajar ahora.'],
      ['02', 'Functional Twin', 'Relacionar hallazgos funcionales con zonas del cuerpo y capacidades sin convertir la herramienta en diagnóstico autónomo.'],
      ['03', 'Fitness', 'Acceder a ejercicios, rutinas y contenidos incluidos en tu programa.'],
      ['04', 'Arena', 'Usar retos o secuencias de progresión cuando sean útiles.'],
      ['05', 'Library', 'Consultar contenidos científicos y prácticos relacionados con tus prioridades.'],
      ['06', 'Red', 'Mantener la conexión con profesionales y próximos pasos del recorrido KŌMØ.']
    ],
    flowTitle: 'Cómo se integra World en el recorrido',
    flow: [
      ['Evaluación', 'Motion o Clinical aporta los datos y la interpretación necesarios.'],
      ['Pulse', 'Resultados, plan y citas permanecen en tu espacio principal.'],
      ['World', 'Utilizas los módulos interactivos relevantes para tu programa.'],
      ['Reevaluación', 'El progreso se compara en el siguiente punto KŌMØ.']
    ],
    boundaryTitle: 'La 3D sigue siendo opcional',
    boundary: 'No necesitas usar World en 3D para consultar resultados o seguir el programa. La información importante sigue disponible en Pulse. Las decisiones médicas corresponden a profesionales cualificados dentro de KŌMØ Clinical.',
    homeTitle: 'World hace el programa más tangible',
    homeLead: 'Pulse centraliza tu información. World permite explorar prioridades, contenidos y acciones del programa. La capa 3D está disponible cuando mejora la experiencia, nunca como paso obligatorio.',
    homeCta: 'Comprender World',
    enterCta: 'Entrar en la experiencia 3D'
  }
};

const style = `
<style id="komo-zoi-world-v1-style">
  .kt-z-underhero-grid{grid-template-columns:repeat(4,1fr)!important}
  .kt-z-proof{min-width:0}.kt-z-proof b{font-size:clamp(18px,2vw,24px)!important}.kt-z-proof span{max-width:28ch!important}
  .kw-home{padding:clamp(78px,9vw,118px) 0;background:#121c17;color:#f8f7f1;overflow:hidden}
  .kw-home-grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(420px,1.1fr);gap:clamp(42px,7vw,96px);align-items:center}
  .kw-home .kt-ey{color:#a8bcae}.kw-home .kt-h2{color:#fff}.kw-home .kt-copy{color:rgba(248,247,241,.7);max-width:650px}
  .kw-stage{position:relative;min-height:460px;border:1px solid rgba(255,255,255,.13);border-radius:30px;background:radial-gradient(circle at 50% 48%,rgba(108,145,122,.22),transparent 36%),linear-gradient(145deg,#1a2a21,#0d1511);overflow:hidden;box-shadow:0 32px 85px rgba(0,0,0,.25)}
  .kw-stage:before{content:"";position:absolute;inset:9%;border:1px solid rgba(255,255,255,.09);border-radius:26px;transform:rotate(-2deg)}
  .kw-core{position:absolute;left:50%;top:50%;width:136px;height:136px;transform:translate(-50%,-50%);border-radius:50%;display:grid;place-items:center;border:1px solid rgba(216,231,220,.3);background:rgba(234,241,236,.08);backdrop-filter:blur(12px);font:500 24px/1 "Iowan Old Style",Baskerville,Georgia,serif}
  .kw-node{position:absolute;min-width:120px;padding:13px 15px;border-radius:14px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.06);backdrop-filter:blur(14px);font-size:11px;color:#eef4ef;transition:transform .3s ease,background .3s ease,border-color .3s ease}
  .kw-node small{display:block;margin-top:5px;color:rgba(238,244,239,.55);font-size:9px}.kw-node:nth-child(1){left:7%;top:11%}.kw-node:nth-child(2){right:7%;top:14%}.kw-node:nth-child(3){left:9%;bottom:14%}.kw-node:nth-child(4){right:8%;bottom:12%}.kw-node:nth-child(5){left:50%;top:9%;transform:translateX(-50%)}
  .kw-node:after{content:"";position:absolute;width:7px;height:7px;border-radius:50%;background:#b7d0bd;box-shadow:0 0 0 7px rgba(183,208,189,.08);animation:kwPulse 2.8s ease-in-out infinite}
  .kw-node:nth-child(1):after{right:-30px;bottom:-28px}.kw-node:nth-child(2):after{left:-34px;bottom:-21px}.kw-node:nth-child(3):after{right:-35px;top:-22px}.kw-node:nth-child(4):after{left:-35px;top:-24px}.kw-node:nth-child(5):after{left:50%;bottom:-36px}
  .kw-node:hover{transform:translateY(-4px);background:rgba(255,255,255,.1);border-color:rgba(189,217,199,.32)}.kw-node:nth-child(5):hover{transform:translate(-50%,-4px)}
  .kw-pagehero{position:relative;padding:clamp(92px,11vw,148px) 0 70px;background:linear-gradient(135deg,#f8f6ef 0%,#eaf1ec 58%,#dfe9e5 100%);overflow:hidden}
  .kw-pagehero:after{content:"";position:absolute;width:62vw;height:62vw;right:-20vw;top:-33vw;border-radius:50%;background:radial-gradient(circle,rgba(118,153,130,.18),transparent 67%);animation:kwFloat 12s ease-in-out infinite alternate}
  .kw-pagehero .kt-shell{position:relative;z-index:1}.kw-pagehero .kt-title{max-width:890px}.kw-pagehero .kt-lead{max-width:760px}
  .kw-metrics{display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid rgba(28,41,32,.12);border-bottom:1px solid rgba(28,41,32,.12);background:#fbfaf6}
  .kw-metric{padding:23px clamp(18px,3vw,34px);border-right:1px solid rgba(28,41,32,.1)}.kw-metric:last-child{border-right:0}.kw-metric strong{display:block;font:400 clamp(24px,3vw,36px)/1 "Iowan Old Style",Baskerville,Georgia,serif}.kw-metric span{display:block;margin-top:9px;color:#69736c;font-size:10px;line-height:1.5}
  .kw-section{padding:clamp(72px,9vw,118px) 0;background:#faf9f6}.kw-section--sage{background:#e8efea}.kw-section--dark{background:#121c17;color:#f8f7f1}
  .kw-head{display:grid;grid-template-columns:minmax(0,1fr) minmax(300px,.7fr);gap:50px;align-items:end}.kw-head .kt-copy{margin:0;max-width:560px}
  .kw-cards{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-top:42px}.kw-card{min-height:235px;padding:26px;border:1px solid rgba(30,44,35,.11);border-radius:19px;background:#fff;transition:transform .3s ease,box-shadow .3s ease,border-color .3s ease}.kw-card:hover{transform:translateY(-5px);box-shadow:0 22px 56px rgba(28,40,33,.08);border-color:rgba(76,108,87,.26)}.kw-card b{font-size:9px;letter-spacing:.12em;color:#708176}.kw-card h2{margin:35px 0 12px;font:400 30px/1 "Iowan Old Style",Baskerville,Georgia,serif}.kw-card p{margin:0;color:#667067;font-size:12px;line-height:1.65}
  .kw-flow{display:grid;grid-template-columns:repeat(4,1fr);margin-top:42px;border-top:1px solid rgba(28,41,32,.14);border-bottom:1px solid rgba(28,41,32,.14)}.kw-flow article{padding:24px 20px;border-right:1px solid rgba(28,41,32,.12)}.kw-flow article:last-child{border-right:0}.kw-flow b{font-size:9px;color:#6d8174}.kw-flow h3{margin:28px 0 10px;font:400 26px/1 "Iowan Old Style",Baskerville,Georgia,serif}.kw-flow p{margin:0;color:#69736c;font-size:11px;line-height:1.55}
  .kw-boundary{max-width:900px;padding:34px;border:1px solid rgba(255,255,255,.13);border-radius:22px;background:rgba(255,255,255,.04)}.kw-boundary .kt-copy{color:rgba(248,247,241,.72);max-width:780px}
  @keyframes kwPulse{0%,100%{transform:scale(.8);opacity:.5}50%{transform:scale(1.2);opacity:1}}@keyframes kwFloat{from{transform:translateY(-1vw) scale(.98)}to{transform:translateY(2vw) scale(1.04)}}
  @media(max-width:900px){.kt-z-underhero-grid,.kw-metrics{grid-template-columns:1fr 1fr!important}.kw-home-grid,.kw-head{grid-template-columns:1fr}.kw-cards{grid-template-columns:1fr 1fr}.kw-flow{grid-template-columns:1fr 1fr}.kw-flow article:nth-child(2){border-right:0}}
  @media(max-width:620px){.kt-z-underhero-grid,.kw-metrics,.kw-cards,.kw-flow{grid-template-columns:1fr!important}.kw-metric,.kw-flow article{border-right:0;border-bottom:1px solid rgba(28,41,32,.1)}.kw-stage{min-height:420px}.kw-node{min-width:102px;padding:11px}.kw-node:nth-child(5){top:8%}}
  @media(prefers-reduced-motion:reduce){.kw-node:after,.kw-pagehero:after{animation:none}}
</style>`;

const runtime = `
<script id="komo-zoi-world-v1-runtime">
(() => {
  const nodes=[...document.querySelectorAll('.kw-node')];
  nodes.forEach((node,i)=>node.style.animationDelay=(i*90)+'ms');
})();
</script>`;

async function exists(path){ try{ await access(path); return true; } catch { return false; } }

function meta(html,c){
  html=html.replace(/<title>[\s\S]*?<\/title>/,`<title>${c.title}</title>`);
  if(/<meta name="description"[^>]*>/.test(html)) html=html.replace(/<meta name="description"[^>]*>/,`<meta name="description" content="${c.description}">`);
  else html=html.replace('</head>',`<meta name="description" content="${c.description}">\n</head>`);
  html=html.replace(/<link rel="canonical"[^>]*>/,`<link rel="canonical" href="https://komolongevity.com${c.infoPath}">`);
  if(!html.includes('komo-zoi-world-v1-style')) html=html.replace('</head>',style+'\n</head>');
  if(!html.includes('komo-zoi-world-v1-runtime')) html=html.replace('</body>',runtime+'\n</body>');
  return html;
}

function stage(){
  return `<div class="kw-stage" aria-label="KŌMØ World modules">
    <div class="kw-node">Functional Twin<small>body & priorities</small></div>
    <div class="kw-node">Fitness<small>actions & routines</small></div>
    <div class="kw-node">Arena<small>progression</small></div>
    <div class="kw-node">Library<small>science & education</small></div>
    <div class="kw-node">Pulse<small>results & plan</small></div>
    <div class="kw-core">World</div>
  </div>`;
}

function homeSection(c){
  return `<section class="kw-home" id="komo-world-explained"><div class="kt-shell kw-home-grid">
    <div><p class="kt-ey">${c.eyebrow}</p><h2 class="kt-h2">${c.homeTitle}</h2><p class="kt-copy">${c.homeLead}</p><div class="kt-btns"><a class="kt-btn kt-btn--ghost" href="${c.infoPath}">${c.homeCta} →</a><a class="kt-btn kt-btn--ghost" href="${c.immersive}">${c.enterCta}</a></div></div>
    ${stage()}
  </div></section>`;
}

function worldPage(c){
  const metrics=c.metrics.map(([n,t])=>`<div class="kw-metric"><strong>${n}</strong><span>${t}</span></div>`).join('');
  const cards=c.cards.map(([n,t,p])=>`<article class="kw-card"><b>${n}</b><h2>${t}</h2><p>${p}</p></article>`).join('');
  const flow=c.flow.map(([t,p],i)=>`<article><b>0${i+1}</b><h3>${t}</h3><p>${p}</p></article>`).join('');
  return `<main id="main" class="kt-home">
    <section class="kw-pagehero"><div class="kt-shell"><p class="kt-ey">${c.eyebrow}</p><h1 class="kt-title">${c.heroTitle}</h1><p class="kt-lead">${c.heroLead}</p><div class="kt-btns"><a class="kt-btn kt-btn--dark" href="${c.immersive}">${c.primary}</a><a class="kt-btn kt-btn--light" href="${c.pulse}">${c.secondary}</a></div></div></section>
    <section class="kw-metrics">${metrics}</section>
    <section class="kw-section"><div class="kt-shell"><div class="kw-head"><div><p class="kt-ey">${c.eyebrow}</p><h2 class="kt-h2">${c.sectionTitle}</h2></div><p class="kt-copy">${c.sectionLead}</p></div><div class="kw-cards">${cards}</div></div></section>
    <section class="kw-section kw-section--sage"><div class="kt-shell kw-home-grid"><div><p class="kt-ey">KŌMØ WORLD</p><h2 class="kt-h2">${c.flowTitle}</h2><div class="kw-flow">${flow}</div></div>${stage()}</div></section>
    <section class="kw-section kw-section--dark"><div class="kt-shell"><div class="kw-boundary"><p class="kt-ey">ACCESS</p><h2 class="kt-h2">${c.boundaryTitle}</h2><p class="kt-copy">${c.boundary}</p><div class="kt-btns"><a class="kt-btn kt-btn--ghost" href="${c.pulse}">${c.secondary}</a><a class="kt-btn kt-btn--ghost" href="${c.immersive}">${c.primary}</a></div></div></div></section>
  </main>`;
}

function replaceMain(html,main){
  return /<main(?:\s[^>]*)?>[\s\S]*?<\/main>/.test(html) ? html.replace(/<main(?:\s[^>]*)?>[\s\S]*?<\/main>/,main) : html.replace('</header>','</header>'+main);
}

function patchWorldLinks(html,c){
  html=html.replace(/<a class="kt-menu-link" href="\/world\/">World<\/a>/g,`<a class="kt-menu-link" href="${c.infoPath}">World</a>`);
  html=html.replace(/<a class="kt-btn kt-btn--light" href="\/world\/">World →<\/a>/g,`<a class="kt-btn kt-btn--light" href="${c.infoPath}">World →</a>`);
  return html;
}

function patchProofBar(html,c){
  const data = c===locales.fr ? [
    ['6 capteurs','Acquisition du mouvement et de l’activité musculaire'],
    ['30 min','Temps d’analyse Motion avant restitution'],
    ['Pulse','Résultats, plan, professionnels et progression'],
    ['Clinical','Consultation médicale lorsqu’elle est indiquée']
  ] : c===locales.es ? [
    ['6 sensores','Adquisición de movimiento y actividad muscular'],
    ['30 min','Tiempo de análisis Motion antes de la restitución'],
    ['Pulse','Resultados, plan, profesionales y progreso'],
    ['Clinical','Consulta médica cuando está indicada']
  ] : [
    ['6 sensors','Movement and muscle-activity acquisition'],
    ['30 min','Motion analysis before the debrief'],
    ['Pulse','Results, plan, professionals and progress'],
    ['Clinical','Medical consultation when indicated']
  ];
  const inner=data.map(([a,b])=>`<div class="kt-z-proof"><b>${a}</b><span>${b}</span></div>`).join('');
  return html.replace(/<section class="kt-z-underhero"><div class="kt-shell kt-z-underhero-grid">[\s\S]*?<\/div><\/section>/,`<section class="kt-z-underhero"><div class="kt-shell kt-z-underhero-grid">${inner}</div></section>`);
}

async function patchHome(c){
  const fp=join(site,c.home); if(!(await exists(fp))) return;
  let html=await readFile(fp,'utf8');
  html=patchWorldLinks(html,c);
  html=patchProofBar(html,c);
  html=html.replace(/<section class="kw-home" id="komo-world-explained">[\s\S]*?<\/section>/g,'');
  const faqMarker='<section class="kt-z-section"><div class="kt-shell kt-z-faq">';
  if(html.includes(faqMarker)) html=html.replace(faqMarker,homeSection(c)+'\n'+faqMarker);
  if(!html.includes('komo-zoi-world-v1-style')) html=html.replace('</head>',style+'\n</head>');
  if(!html.includes('komo-zoi-world-v1-runtime')) html=html.replace('</body>',runtime+'\n</body>');
  await writeFile(fp,html,'utf8');
}

async function createWorldPage(c){
  const source=join(site,c.home);
  if(!(await exists(source))) return;
  let html=await readFile(source,'utf8');
  html=patchWorldLinks(html,c);
  html=replaceMain(html,worldPage(c));
  html=meta(html,c);
  const fp=join(site,c.worldFile);
  await mkdir(dirname(fp),{recursive:true});
  await writeFile(fp,html,'utf8');
}

async function patchSharedPublic(c){
  const files = c===locales.fr ? [
    'fr/motion/index.html','fr/clinical/index.html','fr/signature/index.html','fr/experience/index.html','fr/partners/index.html','fr/a-propos/index.html','fr/science/index.html','fr/methode/index.html','fr/network/index.html','fr/locomotor/index.html','fr/riviera/index.html','fr/case/equipment/index.html'
  ] : c===locales.es ? [
    'es/motion/index.html','es/clinical/index.html','es/signature/index.html','es/experience/index.html','es/partners/index.html','es/sobre/index.html','es/science/index.html','es/locomotor/index.html'
  ] : [
    'motion/index.html','clinical/index.html','signature/index.html','experience/index.html','partners/index.html','about/index.html','science/index.html','locomotor/index.html','riviera/index.html'
  ];
  for(const relative of files){
    const fp=join(site,relative); if(!(await exists(fp))) continue;
    let html=await readFile(fp,'utf8');
    html=patchWorldLinks(html,c);
    if(!html.includes('komo-zoi-world-v1-style')) html=html.replace('</head>',style+'\n</head>');
    if(!html.includes('komo-zoi-world-v1-runtime')) html=html.replace('</body>',runtime+'\n</body>');
    await writeFile(fp,html,'utf8');
  }
}

for(const c of Object.values(locales)){
  await patchHome(c);
  await createWorldPage(c);
  await patchSharedPublic(c);
}

const sitemapPath=join(site,'sitemap.xml');
if(await exists(sitemapPath)){
  let sitemap=await readFile(sitemapPath,'utf8');
  for(const c of Object.values(locales)){
    const loc='https://komolongevity.com'+c.infoPath;
    if(!sitemap.includes('<loc>'+loc+'</loc>')) sitemap=sitemap.replace('</urlset>',`  <url><loc>${loc}</loc><priority>0.8</priority></url>\n</urlset>`);
  }
  await writeFile(sitemapPath,sitemap,'utf8');
}

console.log('[komo-zoi-world-v1] PASS · World explained, optional 3D, stronger proof bar and Zoī-inspired clarity applied.');
