import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();

const locales = {
  en: {
    file: join(root, 'site', 'index.html'),
    paths: { home: '/', method: '/method/', assessment: '/assessment/', pulse: '/pulse/', world: '/world/', partners: '/partners/' },
    metaTitle: 'KŌMØ — Understand your movement. Keep your life in motion.',
    metaDescription: 'KŌMØ connects a first mobility assessment, Pulse and KŌMØ World so you can understand movement and follow what changes over time.',
    heroEyebrow: 'KŌMØ · LONGEVITY IN MOTION',
    heroTitle: 'Understand your movement.<br><em>Keep your life in motion.</em>',
    heroLead: 'KŌMØ helps you understand how you move today, then follow what changes over time — from a first mobility assessment to KŌMØ Pulse and KŌMØ World.',
    heroPrimary: 'Start with KŌMØ',
    heroSecondary: 'See how it works',
    heroFacts: [['01', 'Understand'], ['02', 'Follow'], ['03', 'Continue']],
    heroNote: 'Motion is non-medical functional feedback. Clinical adds the context of a licensed physician.',
    heroAlt: 'KŌMØ Case with sensors, tablet and tripod for a mobility assessment',
    heroCaption: 'The KŌMØ Case · a structured first look at how you move.',
    clarityEyebrow: 'WHAT KŌMØ IS',
    clarityTitle: 'One clear thread<br><em>for your movement.</em>',
    clarityLead: 'KŌMØ brings the pieces together without asking you to become an expert. One ecosystem, one thread: measure, understand, act, live.',
    clarityCards: [
      ['01', 'Understand', 'A short, structured check to make your mobility visible.', ''],
      ['02', 'Follow', 'Pulse keeps your results, priorities and next steps together over time.', ''],
      ['03', 'Continue', 'World turns the next step into guided virtual rehabilitation and a connected network.', 'world']
    ],
    clarityNote: 'Your journey can start with a professional assessment. The next step stays clear.',
    founderEyebrow: 'THE HUMAN VISION BEHIND KŌMØ',
    founderTitle: 'Dr Renan Chapon<br><em>Physician. Founder.</em>',
    founderRole: 'Physician · Founder, KŌMØ Longevity',
    founderBody: 'KŌMØ was created from a simple conviction: longevity is also the ability to keep walking, standing, recovering, adapting and living independently.',
    founderCta: 'Discover the method',
    nav: [['How it works', '/method/'], ['Your first check', '/assessment/'], ['Pulse', '/pulse/'], ['World', '/world/'], ['Professionals', '/partners/']],
    headerCta: 'Start your check →'
  },
  fr: {
    file: join(root, 'site', 'fr', 'index.html'),
    paths: { home: '/fr/', method: '/fr/methode/', assessment: '/fr/bilan/', pulse: '/fr/pulse/', world: '/world/', partners: '/fr/partners/' },
    metaTitle: 'KŌMØ — Comprendre votre mouvement. Préserver votre élan.',
    metaDescription: 'KŌMØ relie un premier bilan locomoteur, Pulse et KŌMØ World pour comprendre votre mouvement et suivre ce qui évolue dans le temps.',
    heroEyebrow: 'KŌMØ · LONGÉVITÉ EN MOUVEMENT',
    heroTitle: 'Comprendre votre mouvement.<br><em>Préserver votre élan.</em>',
    heroLead: 'KŌMØ vous aide à comprendre comment vous bougez aujourd’hui, puis à suivre ce qui évolue dans le temps — du premier bilan locomoteur à KŌMØ Pulse et KŌMØ World.',
    heroPrimary: 'Commencer avec KŌMØ',
    heroSecondary: 'Voir comment ça marche',
    heroFacts: [['01', 'Comprendre'], ['02', 'Suivre'], ['03', 'Continuer']],
    heroNote: 'Motion est une restitution fonctionnelle non médicale. Clinical ajoute le contexte d’un médecin autorisé.',
    heroAlt: 'KŌMØ Case avec capteurs, tablette et trépied pour un bilan de mobilité',
    heroCaption: 'La KŌMØ Case · un premier regard structuré sur votre mouvement.',
    clarityEyebrow: 'CE QU’EST KŌMØ',
    clarityTitle: 'Un fil simple<br><em>pour votre mouvement.</em>',
    clarityLead: 'KŌMØ réunit les étapes sans vous demander de devenir expert. Un écosystème, un fil : mesurer, comprendre, agir, vivre.',
    clarityCards: [
      ['01', 'Comprendre', 'Un bilan court et structuré pour rendre votre mobilité visible.', ''],
      ['02', 'Suivre', 'Pulse réunit vos résultats, vos priorités et les prochaines étapes dans le temps.', ''],
      ['03', 'Continuer', 'World transforme la suite en rééducation virtuelle guidée et en réseau connecté.', 'world']
    ],
    clarityNote: 'Votre parcours peut commencer avec un professionnel. La prochaine étape reste lisible.',
    founderEyebrow: 'LA VISION HUMAINE DERRIÈRE KŌMØ',
    founderTitle: 'Dr Renan Chapon<br><em>Médecin. Fondateur.</em>',
    founderRole: 'Médecin · Fondateur de KŌMØ Longevity',
    founderBody: 'KŌMØ est né d’une conviction simple : la longévité se lit aussi dans la capacité à marcher, se relever, récupérer, s’adapter et rester autonome.',
    founderCta: 'Découvrir la méthode',
    nav: [['Comment ça marche', '/fr/methode/'], ['Votre premier bilan', '/fr/bilan/'], ['Pulse', '/fr/pulse/'], ['World', '/world/'], ['Professionnels', '/fr/partners/']],
    headerCta: 'Commencer votre bilan →'
  },
  es: {
    file: join(root, 'site', 'es', 'index.html'),
    paths: { home: '/es/', method: '/es/metodo/', assessment: '/es/evaluacion/', pulse: '/es/pulse/', world: '/world/', partners: '/es/partners/' },
    metaTitle: 'KŌMØ — Entender tu movimiento. Mantener tu vida en movimiento.',
    metaDescription: 'KŌMØ conecta una primera evaluación de movilidad, Pulse y KŌMØ World para entender tu movimiento y seguir lo que cambia con el tiempo.',
    heroEyebrow: 'KŌMØ · LONGEVIDAD EN MOVIMIENTO',
    heroTitle: 'Entender tu movimiento.<br><em>Mantener tu vida en movimiento.</em>',
    heroLead: 'KŌMØ te ayuda a entender cómo te mueves hoy y a seguir lo que cambia con el tiempo — desde tu primera evaluación de movilidad hasta KŌMØ Pulse y KŌMØ World.',
    heroPrimary: 'Empezar con KŌMØ',
    heroSecondary: 'Ver cómo funciona',
    heroFacts: [['01', 'Entender'], ['02', 'Seguir'], ['03', 'Continuar']],
    heroNote: 'Motion ofrece información funcional no médica. Clinical añade el contexto de un médico autorizado.',
    heroAlt: 'KŌMØ Case con sensores, tableta y trípode para una evaluación de movilidad',
    heroCaption: 'La KŌMØ Case · una primera mirada estructurada a tu movimiento.',
    clarityEyebrow: 'QUÉ ES KŌMØ',
    clarityTitle: 'Un hilo claro<br><em>para tu movimiento.</em>',
    clarityLead: 'KŌMØ reúne cada paso sin pedirte que seas experto. Un ecosistema, un hilo: medir, entender, actuar, vivir.',
    clarityCards: [
      ['01', 'Entender', 'Una evaluación breve y estructurada para hacer visible tu movilidad.', ''],
      ['02', 'Seguir', 'Pulse reúne tus resultados, prioridades y próximos pasos a lo largo del tiempo.', ''],
      ['03', 'Continuar', 'World convierte el siguiente paso en rehabilitación virtual guiada y una red conectada.', 'world']
    ],
    clarityNote: 'Tu recorrido puede empezar con un profesional. El siguiente paso sigue siendo claro.',
    founderEyebrow: 'LA VISIÓN HUMANA DETRÁS DE KŌMØ',
    founderTitle: 'Dr Renan Chapon<br><em>Médico. Fundador.</em>',
    founderRole: 'Médico · Fundador de KŌMØ Longevity',
    founderBody: 'KŌMØ nace de una convicción sencilla: la longevidad también es poder seguir caminando, levantarse, recuperarse, adaptarse y vivir con autonomía.',
    founderCta: 'Descubrir el método',
    nav: [['Cómo funciona', '/es/metodo/'], ['Tu primera evaluación', '/es/evaluacion/'], ['Pulse', '/es/pulse/'], ['World', '/world/'], ['Profesionales', '/es/partners/']],
    headerCta: 'Empezar tu evaluación →'
  }
};

const style = `
<style id="komo-patient-clarity-v1-style">
  .komo-patient-hero .rvc-title{max-width:690px}
  .komo-patient-hero .rvc-copy{max-width:600px}
  .komo-hero-note{max-width:580px;margin:16px 0 0;padding-left:13px;border-left:1px solid rgba(255,255,255,.32);color:rgba(255,255,255,.54);font-size:11px;line-height:1.55}
  .komo-patient-clarity{padding:clamp(72px,9vw,132px) 0;background:#f7f4ed;border-top:1px solid var(--rvc-line)}
  .komo-patient-clarity-grid{display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(42px,8vw,116px);align-items:end}
  .komo-patient-clarity h2{max-width:580px}
  .komo-patient-clarity-lead{max-width:540px;margin:0;color:#5f665f;font:400 clamp(18px,1.55vw,22px)/1.52 "Iowan Old Style",Baskerville,Georgia,serif}
  .komo-patient-clarity-cards{display:grid;grid-template-columns:repeat(3,1fr);margin:clamp(42px,6vw,72px) 0 0;padding:0;list-style:none;border-top:1px solid var(--rvc-ink);border-bottom:1px solid var(--rvc-ink)}
  .komo-patient-clarity-card{min-height:230px;padding:20px 22px 24px 0;border-right:1px solid var(--rvc-line);display:flex;flex-direction:column;justify-content:space-between}
  .komo-patient-clarity-card+li{padding-left:22px}
  .komo-patient-clarity-card:last-child{border-right:0}
  .komo-patient-clarity-card>span{color:var(--rvc-sage-deep);font-size:9px;font-weight:850;letter-spacing:.13em}
  .komo-patient-clarity-card h3{margin:44px 0 10px;font:400 clamp(29px,3.1vw,42px)/.95 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.045em}
  .komo-patient-clarity-card p{margin:0;color:#656b65;font-size:12px;line-height:1.62}
  .komo-patient-clarity-card a{color:inherit;text-decoration:none}
  .komo-patient-clarity-card a:after{content:' ↗';font:700 12px/1 Inter,ui-sans-serif,sans-serif;color:var(--rvc-sage-deep)}
  .komo-patient-clarity-note{margin:18px 0 0;color:#72786f;font-size:11px;line-height:1.5}
  .komo-patient-founder{padding:clamp(70px,9vw,128px) 0;background:#e9e3d8;border-top:1px solid var(--rvc-line)}
  .komo-patient-founder-grid{display:grid;grid-template-columns:minmax(250px,.58fr) minmax(0,1fr);gap:clamp(40px,8vw,116px);align-items:center}
  .komo-patient-founder-portrait{margin:0;overflow:hidden;aspect-ratio:1;border-radius:24px;background:#d3cdc2;box-shadow:0 24px 60px rgba(18,20,16,.1)}
  .komo-patient-founder-portrait img{width:100%;height:100%;display:block;object-fit:cover;object-position:center 28%}
  .komo-patient-founder-copy{max-width:680px}
  .komo-patient-founder-copy .rvc-title{max-width:620px}
  .komo-patient-founder-role{margin:19px 0 0;color:var(--rvc-sage-deep);font-size:10px;font-weight:850;letter-spacing:.1em;text-transform:uppercase}
  .komo-patient-founder-body{max-width:610px;margin:22px 0 0;color:#444a44;font:400 clamp(17px,1.45vw,20px)/1.58 "Iowan Old Style",Baskerville,Georgia,serif}
  .komo-patient-founder-body p{margin:0}
  .komo-patient-founder-copy .rvc-link{margin-top:25px}
  @media(max-width:900px){
    .komo-patient-clarity-grid,.komo-patient-founder-grid{grid-template-columns:1fr;gap:24px}
    .komo-patient-founder-grid{align-items:start}
    .komo-patient-founder-portrait{max-width:430px}
  }
  @media(max-width:620px){
    .komo-hero-note{font-size:10px}
    .komo-patient-clarity-cards{grid-template-columns:1fr}
    .komo-patient-clarity-card,.komo-patient-clarity-card+li{min-height:0;padding:18px 0 22px;border-right:0;border-bottom:1px solid var(--rvc-line)}
    .komo-patient-clarity-card:last-child{border-bottom:0}
    .komo-patient-clarity-card h3{margin:25px 0 8px;font-size:32px}
    .komo-patient-founder-portrait{border-radius:18px}
  }
</style>`;

function replaceOnce(html, pattern, replacement) {
  const next = html.replace(pattern, replacement);
  return next === html ? { html, changed: false } : { html: next, changed: true };
}

function renderHero(c) {
  return `
  <section class="rvc-home-hero komo-patient-hero" aria-labelledby="komo-patient-hero-title"><div class="rvc-shell rvc-hero-grid"><div><p class="rvc-ey">${c.heroEyebrow}</p><h1 class="rvc-title" id="komo-patient-hero-title">${c.heroTitle}</h1><p class="rvc-copy" style="margin-top:24px">${c.heroLead}</p><div class="rvc-hero-actions"><a class="rvc-btn rvc-btn--light" href="${c.paths.assessment}">${c.heroPrimary} <span aria-hidden="true">↗</span></a><a class="rvc-link" href="${c.paths.method}">${c.heroSecondary} <span aria-hidden="true">→</span></a></div><ul class="rvc-hero-facts">${c.heroFacts.map(([number, label]) => `<li><strong>${number}</strong><span>${label}</span></li>`).join('')}</ul><p class="komo-hero-note">${c.heroNote}</p></div><figure class="rvc-photo rvc-photo--hero"><img src="/assets/images/komo-case-premium-v2.webp" alt="${c.heroAlt}" width="800" height="640" loading="eager" fetchpriority="high" decoding="async"><figcaption>${c.heroCaption}</figcaption></figure></div></section>`;
}

function renderClarity(c) {
  return `
  <section class="komo-patient-clarity" id="komo-clarity" aria-labelledby="komo-clarity-title"><div class="rvc-shell"><div class="komo-patient-clarity-grid"><div><p class="rvc-ey">${c.clarityEyebrow}</p><h2 class="rvc-title" id="komo-clarity-title">${c.clarityTitle}</h2></div><p class="komo-patient-clarity-lead">${c.clarityLead}</p></div><ol class="komo-patient-clarity-cards">${c.clarityCards.map(([number, title, body, link]) => `<li class="komo-patient-clarity-card"><span>${number}</span><div><h3>${link ? `<a href="${c.paths.world}">${title}</a>` : title}</h3><p>${body}</p></div></li>`).join('')}</ol><p class="komo-patient-clarity-note">${c.clarityNote}</p></div></section>`;
}

function renderFounder(c) {
  return `
  <section class="komo-patient-founder" id="founder" aria-labelledby="komo-patient-founder-title"><div class="rvc-shell komo-patient-founder-grid"><figure class="komo-patient-founder-portrait"><img src="/assets/images/dr-renan-chapon-v2.webp" alt="Dr Renan Chapon" width="600" height="600" loading="lazy" decoding="async"></figure><div class="komo-patient-founder-copy"><p class="rvc-ey">${c.founderEyebrow}</p><h2 class="rvc-title" id="komo-patient-founder-title">${c.founderTitle}</h2><p class="komo-patient-founder-role">${c.founderRole}</p><div class="komo-patient-founder-body"><p>${c.founderBody}</p></div><a class="rvc-link" href="${c.paths.method}">${c.founderCta} <span aria-hidden="true">→</span></a></div></div></section>`;
}

function renderNav(c) {
  return c.nav.map(([label, href]) => `<a href="${href}">${label}</a>`).join('');
}

async function updatePage(c) {
  let html = await readFile(c.file, 'utf8');
  html = html.replace(/\s*<style id="komo-patient-clarity-v1-style">[\s\S]*?<\/style>\s*(?=<\/head>)/, '');
  html = html.replace('</head>', `${style}\n</head>`);
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${c.metaTitle}</title>`);
  html = html.replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${c.metaDescription}">`);
  html = html.replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${c.metaTitle}">`);
  html = html.replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${c.metaDescription}">`);

  html = html.replace(/<nav class="kp-nav">[\s\S]*?<\/nav>/, `<nav class="kp-nav">${renderNav(c)}</nav>`);
  html = html.replace(/<details class="kp-menu">[\s\S]*?<\/details>/, `<details class="kp-menu"><summary>Menu</summary><nav>${renderNav(c)}</nav></details>`);
  html = html.replace(/<a class="kp-mini" href="[^"]*">[\s\S]*?<\/a>/, `<a class="kp-mini" href="${c.paths.assessment}">${c.headerCta}</a>`);
  html = html.replace(/\s*<section class="komo-patient-clarity"[\s\S]*?<\/section>/, '');
  html = html.replace(/\s*<section class="komo-patient-founder"[\s\S]*?<\/section>/, '');
  html = html.replace(/\s*<section class="komo-founder"[\s\S]*?<\/section>/, '');
  html = html.replace(/\s*<section class="rvc-home-hero(?: komo-patient-hero)?"[\s\S]*?<\/section>/, `\n${renderHero(c)}`);
  html = html.replace(/<section class="rvc-home-path"/, `${renderClarity(c)}\n  ${renderFounder(c)}\n  <section class="rvc-home-path"`);
  await writeFile(c.file, html);
}

for (const c of Object.values(locales)) await updatePage(c);
console.log('[homepage-patient-clarity-v1] PASS · patient-first home hierarchy applied (EN/FR/ES)');
