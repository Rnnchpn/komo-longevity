import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();

const locales = {
  en: {
    file: join(root, 'site', 'index.html'),
    paths: { assessment: '/assessment/', pulse: '/pulse/', world: '/world/', experience: '/experience/' },
    metaDescription: 'KŌMØ connects a first mobility assessment, Pulse, KŌMØ World and private KŌMØ Experiences so you can understand movement and follow what changes over time.',
    experienceEyebrow: 'THE KŌMØ EXPERIENCE',
    experienceTitle: 'From a first check<br><em>to a life in motion.</em>',
    experienceLead: 'KŌMØ is more than one appointment. It is a connected experience: measure your movement, understand your trajectory, choose the next step and keep living it.',
    cards: [
      ['01', 'Motion', 'See how you move today.', 'The first layer makes movement visible.', 'assessment'],
      ['02', 'Pulse', 'Follow what changes.', 'Your results and priorities stay together over time.', 'pulse'],
      ['03', 'World', 'Rehab, connect, continue.', 'Virtual rehabilitation and a network in motion.', 'world'],
      ['04', 'Experience', 'Bring KŌMØ into real life.', 'Private experiences in Cannes, Spain and at sea.', 'experience']
    ],
    primary: 'Explore KŌMØ Experience',
    secondary: 'Enter KŌMØ World',
    rail: 'Clinical · KEY · Club · K Points · KŌMØ Life · KŌMØ Centers',
    nav: [['How it works', '/method/'], ['Your first check', '/assessment/'], ['Pulse', '/pulse/'], ['Experience', '/experience/'], ['World', '/world/'], ['Professionals', '/partners/']]
  },
  fr: {
    file: join(root, 'site', 'fr', 'index.html'),
    paths: { assessment: '/fr/bilan/', pulse: '/fr/pulse/', world: '/world/', experience: '/experience/' },
    metaDescription: 'KŌMØ relie un premier bilan locomoteur, Pulse, KŌMØ World et des expériences privées pour comprendre votre mouvement et suivre ce qui évolue dans le temps.',
    experienceEyebrow: 'L’EXPÉRIENCE KŌMØ',
    experienceTitle: 'De votre premier bilan<br><em>à une vie en mouvement.</em>',
    experienceLead: 'KŌMØ est plus qu’un rendez-vous. C’est une expérience connectée : mesurer votre mouvement, comprendre votre trajectoire, choisir la prochaine étape et la vivre dans le temps.',
    cards: [
      ['01', 'Motion', 'Voir comment vous bougez aujourd’hui.', 'Le premier niveau rend le mouvement visible.', 'assessment'],
      ['02', 'Pulse', 'Suivre ce qui évolue.', 'Vos résultats et vos priorités restent réunis dans le temps.', 'pulse'],
      ['03', 'World', 'Rééduquer, relier, continuer.', 'Rééducation virtuelle et réseau en mouvement.', 'world'],
      ['04', 'Experience', 'Faire entrer KŌMØ dans la vraie vie.', 'Des expériences privées à Cannes, en Espagne et en mer.', 'experience']
    ],
    primary: 'Découvrir KŌMØ Experience',
    secondary: 'Entrer dans KŌMØ World',
    rail: 'Clinical · KEY · Club · K Points · KŌMØ Life · KŌMØ Centers',
    nav: [['Comment ça marche', '/fr/methode/'], ['Votre premier bilan', '/fr/bilan/'], ['Pulse', '/fr/pulse/'], ['Experience', '/experience/'], ['World', '/world/'], ['Professionnels', '/fr/partners/']]
  },
  es: {
    file: join(root, 'site', 'es', 'index.html'),
    paths: { assessment: '/es/evaluacion/', pulse: '/es/pulse/', world: '/world/', experience: '/experience/' },
    metaDescription: 'KŌMØ conecta una primera evaluación de movilidad, Pulse, KŌMØ World y experiencias privadas para entender tu movimiento y seguir lo que cambia con el tiempo.',
    experienceEyebrow: 'LA EXPERIENCIA KŌMØ',
    experienceTitle: 'De tu primera evaluación<br><em>a una vida en movimiento.</em>',
    experienceLead: 'KŌMØ es más que una cita. Es una experiencia conectada: medir tu movimiento, entender tu trayectoria, elegir el siguiente paso y vivirlo en el tiempo.',
    cards: [
      ['01', 'Motion', 'Entender cómo te mueves hoy.', 'La primera capa hace visible el movimiento.', 'assessment'],
      ['02', 'Pulse', 'Seguir lo que cambia.', 'Tus resultados y prioridades permanecen juntos con el tiempo.', 'pulse'],
      ['03', 'World', 'Rehabilitar, conectar, continuar.', 'Rehabilitación virtual y una red en movimiento.', 'world'],
      ['04', 'Experience', 'Llevar KŌMØ a la vida real.', 'Experiencias privadas en Cannes, España y en el mar.', 'experience']
    ],
    primary: 'Descubrir KŌMØ Experience',
    secondary: 'Entrar en KŌMØ World',
    rail: 'Clinical · KEY · Club · K Points · KŌMØ Life · KŌMØ Centers',
    nav: [['Cómo funciona', '/es/metodo/'], ['Tu primera evaluación', '/es/evaluacion/'], ['Pulse', '/es/pulse/'], ['Experiencia', '/experience/'], ['World', '/world/'], ['Profesionales', '/es/partners/']]
  }
};

const style = `<style id="komo-homepage-experience-clarity-v1-style">
  .komo-experience-home{position:relative;overflow:hidden;padding:clamp(76px,10vw,142px) 0;background:#101a16;color:#f7f5ef}
  .komo-experience-home:before{content:'';position:absolute;right:-12%;top:-30%;width:min(58vw,760px);aspect-ratio:1;border:1px solid rgba(193,214,198,.22);border-radius:50%;transform:rotate(-18deg) scaleY(.58);pointer-events:none}
  .komo-experience-home:after{content:'';position:absolute;left:-18%;bottom:-50%;width:min(48vw,620px);aspect-ratio:1;border:1px solid rgba(225,201,145,.18);border-radius:50%;pointer-events:none}
  .komo-experience-home .rvc-shell{position:relative;z-index:1}
  .komo-experience-home .rvc-ey{color:#c6d7c9}
  .komo-experience-home .rvc-title{max-width:760px;color:#fff}
  .komo-experience-home .rvc-title em{color:#b8cbbd}
  .komo-experience-home-intro{display:grid;grid-template-columns:.92fr 1.08fr;gap:clamp(42px,8vw,118px);align-items:end}
  .komo-experience-home-lead{max-width:610px;margin:0;color:rgba(247,245,239,.72);font:400 clamp(17px,1.5vw,21px)/1.6 "Iowan Old Style",Baskerville,Georgia,serif}
  .komo-experience-home-cards{display:grid;grid-template-columns:repeat(4,1fr);margin:clamp(46px,6vw,78px) 0 0;padding:0;list-style:none;border-top:1px solid rgba(247,245,239,.36);border-bottom:1px solid rgba(247,245,239,.24)}
  .komo-experience-home-card{min-height:278px;padding:21px 20px 25px 0;border-right:1px solid rgba(247,245,239,.2);display:flex;flex-direction:column;justify-content:space-between}
  .komo-experience-home-card+li{padding-left:20px}
  .komo-experience-home-card:last-child{border-right:0}
  .komo-experience-home-card>span{color:#dfc88e;font-size:9px;font-weight:850;letter-spacing:.14em}
  .komo-experience-home-card h3{margin:50px 0 9px;font:400 clamp(27px,2.8vw,39px)/.96 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.045em}
  .komo-experience-home-card h3 a{color:#fff;text-decoration:none}
  .komo-experience-home-card h3 a:after{content:' ↗';font:700 12px/1 Inter,ui-sans-serif,sans-serif;color:#dfc88e}
  .komo-experience-home-card p{margin:0;color:rgba(247,245,239,.68);font-size:12px;line-height:1.56}
  .komo-experience-home-card p strong{display:block;margin-bottom:6px;color:#fff;font-size:13px;font-weight:600}
  .komo-experience-home-foot{display:flex;align-items:center;justify-content:space-between;gap:24px;margin-top:28px}
  .komo-experience-home-foot .rvc-btn{border-color:#dfc88e;background:#dfc88e;color:#102a27!important}
  .komo-experience-home-foot .rvc-btn:hover{border-color:#f2dca8;background:#f2dca8;color:#102a27!important}
  .komo-experience-home-foot .rvc-link{color:#fff}
  .komo-experience-home-rail{margin:52px 0 0;padding-top:17px;border-top:1px solid rgba(247,245,239,.16);color:rgba(247,245,239,.48);font-size:9px;font-weight:750;letter-spacing:.14em;text-transform:uppercase}
  @media(max-width:980px){
    .komo-experience-home-intro{grid-template-columns:1fr;gap:24px}
    .komo-experience-home-cards{grid-template-columns:1fr 1fr}
    .komo-experience-home-card:nth-child(2){border-right:0}
    .komo-experience-home-card:nth-child(3){padding-left:0}
  }
  @media(max-width:620px){
    .komo-experience-home-cards{grid-template-columns:1fr}
    .komo-experience-home-card,.komo-experience-home-card+li{min-height:0;padding:19px 0 23px;border-right:0;border-bottom:1px solid rgba(247,245,239,.2)}
    .komo-experience-home-card:last-child{border-bottom:0}
    .komo-experience-home-card h3{margin:26px 0 8px;font-size:33px}
    .komo-experience-home-foot{align-items:flex-start;flex-direction:column}
    .komo-experience-home-foot .rvc-btn{width:100%}
  }
</style>`;

function renderNav(c) {
  return c.nav.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
}

function renderExperience(c) {
  const cards = c.cards.map(([number, title, lead, body, key]) => `<li class="komo-experience-home-card"><span>${number}</span><div><h3><a href="${c.paths[key]}">${title}</a></h3><p><strong>${lead}</strong>${body}</p></div></li>`).join('');
  return `
  <section class="komo-experience-home" id="komo-experience" aria-labelledby="komo-experience-title"><div class="rvc-shell"><div class="komo-experience-home-intro"><div><p class="rvc-ey">${c.experienceEyebrow}</p><h2 class="rvc-title" id="komo-experience-title">${c.experienceTitle}</h2></div><p class="komo-experience-home-lead">${c.experienceLead}</p></div><ol class="komo-experience-home-cards">${cards}</ol><div class="komo-experience-home-foot"><div><a class="rvc-btn" href="${c.paths.experience}">${c.primary} <span aria-hidden="true">↗</span></a><a class="rvc-link" href="${c.paths.world}">${c.secondary} <span aria-hidden="true">→</span></a></div></div><p class="komo-experience-home-rail">${c.rail}</p></div></section>`;
}

async function updatePage(c) {
  let html = await readFile(c.file, 'utf8');
  html = html.replace(/\s*<style id="komo-homepage-experience-clarity-v1-style">[\s\S]*?<\/style>\s*(?=<\/head>)/, '');
  html = html.replace('</head>', `\n${style}\n</head>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${c.metaDescription}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${c.metaDescription}">`);
  html = html.replace(/<nav class="kp-nav">[\s\S]*?<\/nav>/, `<nav class="kp-nav">${renderNav(c)}</nav>`);
  html = html.replace(/<details class="kp-menu">[\s\S]*?<\/details>/, `<details class="kp-menu"><summary>Menu</summary><nav>${renderNav(c)}</nav></details>`);
  html = html.replace(/\s*<section class="komo-experience-home"[\s\S]*?<\/section>/, '');
  html = html.replace(/(<section class="komo-patient-clarity"[\s\S]*?<\/section>)/, `$1\n${renderExperience(c)}`);
  await writeFile(c.file, html);
}

for (const c of Object.values(locales)) await updatePage(c);
console.log('[homepage-experience-clarity-v1] PASS · KŌMØ Experience is visible in EN/FR/ES navigation and home continuum');
