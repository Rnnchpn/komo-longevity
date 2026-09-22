import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const content = {
  fr: {
    meta: 'KŌMØ explique votre trajectoire de mobilité avec des étapes lisibles, les contenus inclus et les tarifs de référence de Pulse Free, Motion et Clinical, puis la continuité avec World.',
    brand: '/',
    nav: [['Comment ça marche','/fr/methode/'],['Votre premier bilan','/fr/bilan/'],['Consultations','#komo-offers'],['Pulse','/fr/pulse/'],['Experience','/experience/'],['World','/world/'],['Professionnels','/fr/partners/']],
    eyebrow: 'CONSULTATIONS · UN PARCOURS LISIBLE',
    title: 'Choisissez votre premier pas.<br><em>Gardez la trajectoire visible.</em>',
    lead: 'Chaque entrée KŌMØ a un périmètre, un prix et une suite claire. Commencez gratuitement, mesurez, puis ajoutez le contexte clinique lorsqu’il est utile.',
    includes: 'Ce qui est inclus', choose: 'Choisir cette étape',
    te: 'LA TRAJECTOIRE KŌMØ', tt: 'Du premier repère<br><em>à la continuité.</em>',
    tl: 'Vous n’avez pas besoin de tout décider aujourd’hui. Chaque étape produit un repère utile et indique la suivante.',
    note: '<strong>À savoir.</strong> Motion est un retour fonctionnel non médical. Clinical ajoute le contexte médical d’un médecin. World accompagne la suite et ne remplace pas un suivi médical.',
    cards: [
      ['01','COMMENCER','Pulse Free','Point de départ digital','0 €','10–15 min · à distance','Un premier repère simple pour savoir où vous en êtes.',['Questionnaire de mobilité','GLFS-25, lever de chaise, Two-Step et marche 4 m','Premières orientations dans Pulse'],'Commencer gratuitement','/fr/pulse/','coral'],
      ['02','MESURER','KŌMØ Motion','Bilan mobilité','300 €','≈ 20 min · retour fonctionnel','Rendre votre mouvement visible et comparable.',['Mesures portables structurées','Mouvement, équilibre, posture et coordination','Motion Score et restitution claire'],'Découvrir Motion','/fr/bilan/','sun'],
      ['03','COMPRENDRE','KŌMØ Clinical','Consultation clinique','500 €','≈ 45–60 min · contexte médical','Relier les données à votre histoire et à vos objectifs.',['Bilan Motion remis en contexte','Interprétation par un médecin','Priorités et prochaine étape définies'],'Demander Clinical','/fr/bilan/?offer=clinical','aqua',true],
      ['04','CONTINUER','KŌMØ World','Rééducation et réseau','Selon le programme','Après votre bilan · à distance ou sur place','Transformer la prochaine étape en continuité concrète.',['Exercices guidés et rééducation virtuelle','Suivi entre deux consultations','Réseau de professionnels KŌMØ'],'Entrer dans World','/world/','sky']
    ],
    steps: [['01','Commencer','Un premier repère, sans engagement.'],['02','Mesurer','Le mouvement devient concret et comparable.'],['03','Mettre en contexte','Le médecin relie les données à votre histoire.'],['04','Continuer','Pulse et World gardent la suite visible entre deux étapes.']]
  },
  en: {
    meta: 'KŌMØ makes your mobility trajectory clear with transparent steps, included content and reference pricing for Pulse Free, Motion and Clinical, followed by continuity through World.',
    brand: '/en/',
    nav: [['How it works','/method/'],['Your first check','/assessment/'],['Consultations','#komo-offers'],['Pulse','/pulse/'],['Experience','/experience/'],['World','/world/'],['Professionals','/partners/']],
    eyebrow: 'CONSULTATIONS · A CLEAR PATH',
    title: 'Choose your first step.<br><em>Keep the trajectory visible.</em>',
    lead: 'Every KŌMØ entry has a clear scope, a clear price and a clear next step. Start free, measure, then add clinical context when it is useful.',
    includes: 'What is included', choose: 'Choose this step',
    te: 'THE KŌMØ TRAJECTORY', tt: 'From a first signal<br><em>to continuity.</em>',
    tl: 'You do not need to decide everything today. Each step creates a useful signal and points to the next one.',
    note: '<strong>Good to know.</strong> Motion is non-medical functional feedback. Clinical adds a physician’s medical context. World supports what comes next and does not replace medical care.',
    cards: [
      ['01','START','Pulse Free','Digital starting point','€0','10–15 min · remote','A simple first signal to understand where you are today.',['Mobility questionnaire','GLFS-25, sit-to-stand, Two-Step and 4 m walk','First directions inside Pulse'],'Start for free','/pulse/','coral'],
      ['02','MEASURE','KŌMØ Motion','Mobility assessment','€300','≈ 20 min · functional feedback','Make your movement visible and comparable.',['Structured portable measurements','Movement, balance, posture and coordination','Motion Score with a clear readout'],'Discover Motion','/assessment/','sun'],
      ['03','UNDERSTAND','KŌMØ Clinical','Clinical consultation','€500','≈ 45–60 min · medical context','Connect the data to your story and your goals.',['Motion assessment placed in context','Physician interpretation','Priorities and next step defined'],'Request Clinical','/assessment/?offer=clinical','aqua',true],
      ['04','CONTINUE','KŌMØ World','Rehabilitation and network','According to programme','After your assessment · remote or in person','Turn the next step into practical continuity.',['Guided exercises and virtual rehabilitation','Follow-up between consultations','KŌMØ professional network'],'Enter World','/world/','sky']
    ],
    steps: [['01','Start','A first signal, with no commitment.'],['02','Measure','Movement becomes concrete and comparable.'],['03','Put it in context','A physician connects the data to your story.'],['04','Continue','Pulse and World keep the next step visible.']]
  },
  es: {
    meta: 'KŌMØ hace clara tu trayectoria de movilidad con pasos transparentes, contenido incluido y precios de referencia para Pulse Free, Motion y Clinical, seguida por la continuidad de World.',
    brand: '/es/',
    nav: [['Cómo funciona','/es/metodo/'],['Tu primera evaluación','/es/evaluacion/'],['Consultas','#komo-offers'],['Pulse','/es/pulse/'],['Experiencia','/experience/'],['World','/world/'],['Profesionales','/es/partners/']],
    eyebrow: 'CONSULTAS · UN CAMINO CLARO',
    title: 'Elige tu primer paso.<br><em>Mantén visible la trayectoria.</em>',
    lead: 'Cada entrada en KŌMØ tiene un alcance, un precio y un siguiente paso claros. Empieza gratis, mide y añade contexto clínico cuando sea útil.',
    includes: 'Qué incluye', choose: 'Elegir este paso',
    te: 'LA TRAYECTORIA KŌMØ', tt: 'De una primera señal<br><em>a la continuidad.</em>',
    tl: 'No tienes que decidirlo todo hoy. Cada etapa crea una señal útil e indica la siguiente.',
    note: '<strong>Importante.</strong> Motion ofrece información funcional no médica. Clinical añade el contexto médico de un profesional. World acompaña el siguiente paso y no sustituye la atención médica.',
    cards: [
      ['01','EMPEZAR','Pulse Free','Punto de partida digital','0 €','10–15 min · a distancia','Una primera señal sencilla para saber dónde estás hoy.',['Cuestionario de movilidad','GLFS-25, levantarse de una silla, Two-Step y marcha de 4 m','Primeras orientaciones en Pulse'],'Empezar gratis','/es/pulse/','coral'],
      ['02','MEDIR','KŌMØ Motion','Evaluación de movilidad','300 €','≈ 20 min · información funcional','Hacer visible y comparable tu movimiento.',['Medidas portátiles estructuradas','Movimiento, equilibrio, postura y coordinación','Motion Score y explicación clara'],'Descubrir Motion','/es/evaluacion/','sun'],
      ['03','COMPRENDER','KŌMØ Clinical','Consulta clínica','500 €','≈ 45–60 min · contexto médico','Conectar los datos con tu historia y tus objetivos.',['Evaluación Motion puesta en contexto','Interpretación de un médico','Prioridades y siguiente paso definidos'],'Solicitar Clinical','/es/evaluacion/?offer=clinical','aqua',true],
      ['04','CONTINUAR','KŌMØ World','Rehabilitación y red','Según el programa','Después de tu evaluación · a distancia o presencial','Convertir el siguiente paso en continuidad práctica.',['Ejercicios guiados y rehabilitación virtual','Seguimiento entre consultas','Red de profesionales KŌMØ'],'Entrar en World','/world/','sky']
    ],
    steps: [['01','Empezar','Una primera señal, sin compromiso.'],['02','Medir','El movimiento se vuelve concreto y comparable.'],['03','Poner en contexto','Un médico conecta los datos con tu historia.'],['04','Continuar','Pulse y World mantienen visible el siguiente paso.']]
  }
};

const pages = [
  [join(root,'site','index.html'),'fr'],
  [join(root,'site','fr','index.html'),'fr'],
  [join(root,'site','en','index.html'),'en'],
  [join(root,'site','es','index.html'),'es']
];

const style = `<style id="komo-homepage-consultation-offers-v1-style">
  .komo-home-offers{position:relative;overflow:hidden;padding:clamp(76px,10vw,142px) 0;background:linear-gradient(135deg,#fffaf1 0%,#eef9f6 54%,#f5f1ff 100%);border-top:1px solid rgba(16,42,53,.1)}
  .komo-home-offers:before{content:'';position:absolute;right:-15%;top:-24%;width:min(58vw,760px);aspect-ratio:1;border:1px solid rgba(14,116,120,.18);border-radius:50%;transform:rotate(-18deg) scaleY(.58);pointer-events:none}
  .komo-home-offers:after{content:'';position:absolute;left:-20%;bottom:-48%;width:min(48vw,620px);aspect-ratio:1;border:1px solid rgba(238,142,112,.18);border-radius:50%;pointer-events:none}
  .komo-home-offers .rvc-shell{position:relative;z-index:1}.komo-home-offers .rvc-ey{color:#0e7478}.komo-home-offers .rvc-title{max-width:720px;color:#102a35}.komo-home-offers .rvc-title em{color:#0e7478}
  .komo-home-offers-head{display:grid;grid-template-columns:.86fr 1.14fr;gap:clamp(42px,8vw,116px);align-items:end}.komo-home-offers-lead{max-width:610px;margin:0;color:#405c61;font:400 clamp(17px,1.5vw,21px)/1.6 "Iowan Old Style",Baskerville,Georgia,serif}
  .komo-home-offers-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin:clamp(45px,6vw,78px) 0 0}
  .komo-home-offer-card{min-height:520px;padding:21px 21px 22px;border:1px solid rgba(16,42,53,.14);border-top:4px solid var(--offer-accent);border-radius:23px;background:rgba(255,255,255,.78);box-shadow:0 18px 48px rgba(16,42,53,.08);display:flex;flex-direction:column;transition:border-color .3s ease,background .3s ease}
  .komo-home-offer-card:nth-child(1){--offer-accent:#ee8e70}.komo-home-offer-card:nth-child(2){--offer-accent:#f6c85f}.komo-home-offer-card:nth-child(3){--offer-accent:#69c9bf}.komo-home-offer-card:nth-child(4){--offer-accent:#5b9bd5}.komo-home-offer-card.is-featured{background:linear-gradient(145deg,#0e7478 0%,#123e59 100%);color:#fff;border-color:rgba(255,255,255,.2);box-shadow:0 24px 60px rgba(14,116,120,.22)}
  .komo-home-offer-card.is-featured .komo-home-offer-tag,.komo-home-offer-card.is-featured .komo-home-offer-summary,.komo-home-offer-card.is-featured .komo-home-offer-includes,.komo-home-offer-card.is-featured .komo-home-offer-list{color:rgba(255,255,255,.75)}.komo-home-offer-card.is-featured .komo-home-offer-price small{color:rgba(255,255,255,.7)}
  .komo-home-offer-top{display:flex;justify-content:space-between;gap:12px;align-items:center}.komo-home-offer-number{color:var(--offer-accent);font-size:9px;font-weight:850;letter-spacing:.14em}.komo-home-offer-badge{padding:6px 8px;border-radius:999px;background:rgba(16,42,53,.06);color:#547076;font-size:8px;font-weight:850;letter-spacing:.11em}.komo-home-offer-card.is-featured .komo-home-offer-badge{background:rgba(255,255,255,.13);color:#ffe19a}
  .komo-home-offer-card h3{margin:32px 0 8px;font:400 clamp(27px,2.3vw,36px)/.96 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.045em}.komo-home-offer-tag{margin:0;color:#5e7376;font-size:10px;font-weight:750;letter-spacing:.08em;text-transform:uppercase}.komo-home-offer-summary{min-height:50px;margin:20px 0 0;color:#405c61;font-size:13px;line-height:1.52}
  .komo-home-offer-price{display:flex;align-items:baseline;gap:9px;margin:24px 0 0;padding-top:18px;border-top:1px solid rgba(16,42,53,.13)}.komo-home-offer-card.is-featured .komo-home-offer-price{border-top-color:rgba(255,255,255,.2)}.komo-home-offer-price strong{font:600 clamp(30px,3vw,43px)/.9 Inter,ui-sans-serif,sans-serif;letter-spacing:-.065em}.komo-home-offer-price small{color:#647b7e;font-size:10px;line-height:1.35}
  .komo-home-offer-includes{margin:25px 0 9px;color:#537075;font-size:9px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.komo-home-offer-list{display:grid;gap:8px;margin:0;padding:0;list-style:none;color:#465d61;font-size:11px;line-height:1.42}.komo-home-offer-list li{position:relative;padding-left:15px}.komo-home-offer-list li:before{content:'+';position:absolute;left:0;color:var(--offer-accent);font-weight:850}.komo-home-offer-cta{margin-top:auto!important;width:100%;justify-content:center;border-color:#102a35!important;background:#102a35!important;color:#fff!important}.komo-home-offer-card.is-featured .komo-home-offer-cta{border-color:#f6c85f!important;background:#f6c85f!important;color:#173b4a!important}
  .komo-home-trajectory{margin-top:clamp(70px,9vw,125px);padding-top:clamp(42px,5vw,65px);border-top:1px solid rgba(16,42,53,.22)}.komo-home-trajectory-head{display:grid;grid-template-columns:.86fr 1.14fr;gap:clamp(42px,8vw,116px);align-items:end}.komo-home-trajectory-head .rvc-title{font-size:clamp(36px,4.5vw,62px)}.komo-home-trajectory-lead{max-width:580px;margin:0;color:#526a6e;font:400 clamp(16px,1.35vw,19px)/1.6 "Iowan Old Style",Baskerville,Georgia,serif}
  .komo-home-trajectory-steps{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));margin:42px 0 0;border-top:1px solid #173e4b;border-bottom:1px solid #173e4b}.komo-home-trajectory-step{min-height:155px;padding:19px 20px 20px 0;border-right:1px solid rgba(16,42,53,.16);border-top:3px solid var(--trajectory-accent);transition:border-color .3s ease}.komo-home-trajectory-step+li{padding-left:20px}.komo-home-trajectory-step:last-child{border-right:0}.komo-home-trajectory-step:nth-child(1){--trajectory-accent:#ee8e70}.komo-home-trajectory-step:nth-child(2){--trajectory-accent:#f6c85f}.komo-home-trajectory-step:nth-child(3){--trajectory-accent:#69c9bf}.komo-home-trajectory-step:nth-child(4){--trajectory-accent:#5b9bd5}.komo-home-trajectory-step>span{color:#0e7478;font-size:9px;font-weight:850;letter-spacing:.13em}.komo-home-trajectory-step strong{display:block;margin:32px 0 7px;font:400 25px/1 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.035em}.komo-home-trajectory-step p{margin:0;color:#5a7074;font-size:11px;line-height:1.55}
  .komo-home-offers-note{max-width:820px;margin:24px 0 0;color:#5b7173;font-size:11px;line-height:1.58}.komo-home-offers-note strong{color:#173e4b}
  @media(max-width:1080px){.komo-home-offers-grid{grid-template-columns:1fr 1fr}.komo-home-offer-card{min-height:480px}.komo-home-offer-card:nth-child(2){border-right-color:transparent}.komo-home-trajectory-steps{grid-template-columns:1fr 1fr}.komo-home-trajectory-step:nth-child(2){border-right:0}.komo-home-trajectory-step:nth-child(3){padding-left:0}}
  @media(max-width:900px){.komo-home-offers-head,.komo-home-trajectory-head{grid-template-columns:1fr;gap:24px}}
  @media(max-width:620px){.komo-home-offers-grid,.komo-home-trajectory-steps{grid-template-columns:1fr}.komo-home-offer-card,.komo-home-offer-card:nth-child(2),.komo-home-offer-card:nth-child(3),.komo-home-offer-card:nth-child(4){min-height:0;padding:19px 18px 20px;border-right:0;border-bottom:1px solid rgba(16,42,53,.14)}.komo-home-offer-card:last-child{border-bottom:0}.komo-home-offer-card h3{margin:26px 0 8px;font-size:33px}.komo-home-offer-summary{min-height:0}.komo-home-trajectory-step,.komo-home-trajectory-step+li{min-height:0;padding:18px 0 21px;border-right:0;border-bottom:1px solid rgba(16,42,53,.14)}.komo-home-trajectory-step:last-child{border-bottom:0}.komo-home-trajectory-step strong{margin:22px 0 7px;font-size:28px}}
</style>`;

function nav(c) {
  return c.nav.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
}

function card(row, c) {
  const [number, badge, title, tag, price, duration, summary, items, cta, href, tone, featured] = row;
  return `<article class="komo-home-offer-card${featured ? ' is-featured' : ''}"><div class="komo-home-offer-top"><span class="komo-home-offer-number">${number}</span><span class="komo-home-offer-badge">${badge}</span></div><h3>${title}</h3><p class="komo-home-offer-tag">${tag}</p><p class="komo-home-offer-summary">${summary}</p><div class="komo-home-offer-price"><strong>${price}</strong><small>${duration}</small></div><p class="komo-home-offer-includes">${c.includes}</p><ul class="komo-home-offer-list">${items.map((item) => `<li>${item}</li>`).join('')}</ul><a class="rvc-btn komo-home-offer-cta" href="${href}">${cta} <span aria-hidden="true">→</span></a></article>`;
}

function section(c) {
  const cards = c.cards.map((row) => card(row, c)).join('');
  const steps = c.steps.map(([number, title, body]) => `<li class="komo-home-trajectory-step"><span>${number}</span><strong>${title}</strong><p>${body}</p></li>`).join('');
  return `
  <section class="komo-home-offers" id="komo-offers" aria-labelledby="komo-offers-title"><div class="rvc-shell"><div class="komo-home-offers-head"><div><p class="rvc-ey">${c.eyebrow}</p><h2 class="rvc-title" id="komo-offers-title">${c.title}</h2></div><p class="komo-home-offers-lead">${c.lead}</p></div><div class="komo-home-offers-grid">${cards}</div><div class="komo-home-trajectory"><div class="komo-home-trajectory-head"><div><p class="rvc-ey">${c.te}</p><h3 class="rvc-title">${c.tt}</h3></div><p class="komo-home-trajectory-lead">${c.tl}</p></div><ol class="komo-home-trajectory-steps">${steps}</ol><p class="komo-home-offers-note">${c.note}</p></div></div></section>`;
}

for (const [file, locale] of pages) {
  const c = content[locale];
  let html = await readFile(file, 'utf8');
  html = html.replace(/\s*<style id="komo-homepage-consultation-offers-v1-style">[\s\S]*?<\/style>\s*(?=<\/head>)/, '');
  html = html.replace('</head>', `\n${style}\n</head>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${c.meta}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${c.meta}">`);
  html = html.replace(/<a class="kp-brand" href="[^"]*">/, `<a class="kp-brand" href="${c.brand}">`);
  html = html.replace(/<nav class="kp-nav">[\s\S]*?<\/nav>/, `<nav class="kp-nav">${nav(c)}</nav>`);
  html = html.replace(/<details class="kp-menu">[\s\S]*?<\/details>/, `<details class="kp-menu"><summary>Menu</summary><nav>${nav(c)}</nav></details>`);
  html = html.replace(/\s*<section class="komo-home-offers"[\s\S]*?<\/section>/, '');
  const next = html.replace(/(<section class="komo-patient-clarity"[\s\S]*?<\/section>)/, `$1\n${section(c)}`);
  if (next === html) throw new Error(`[homepage-consultation-offers-v1] clarity section missing in ${file}`);
  await writeFile(file, next);
}

console.log('[homepage-consultation-offers-v1] PASS · reference consultation prices, included content and trajectory added to FR/EN/ES home routes');
