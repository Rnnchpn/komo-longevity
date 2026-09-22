import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();

const pages = [
  {
    file: join(root, 'site', 'index.html'),
    locale: 'fr',
    hero: {
      eyebrow: 'KŌMØ · BILAN DE MOBILITÉ & LONGÉVITÉ',
      title: 'Comprendre votre mobilité.<br><em>Savoir quoi faire ensuite.</em>',
      lead: 'KŌMØ vous aide à mesurer votre mouvement, à comprendre ce qui évolue et à choisir la prochaine étape — bilan, suivi Pulse ou rééducation avec KŌMØ World.',
      primary: 'Commencer avec KŌMØ',
      secondary: 'Voir le parcours',
      facts: ['Bilan', 'Suivi', 'Suite'],
      note: 'Motion fournit une information fonctionnelle non médicale. Clinical ajoute le contexte d’un médecin.',
      caption: 'La KŌMØ Case · le point de départ de votre bilan de mobilité.'
    },
    clarity: {
      eyebrow: 'KŌMØ, C’EST QUOI ?',
      title: 'Un bilan.<br><em>Un suivi. Une suite.</em>',
      lead: 'KŌMØ réunit trois moments simples : rendre votre mobilité visible, suivre ce qui change dans Pulse, puis agir avec la bonne personne ou le bon programme.',
      cards: [
        ['01', 'Bilan', 'Motion rend votre mouvement visible avec des mesures simples et comparables.', ''],
        ['02', 'Pulse', 'Vos résultats et vos priorités restent réunis dans un même suivi.', ''],
        ['03', 'World', 'Rééducation virtuelle guidée et réseau de professionnels pour continuer entre deux étapes.', 'world']
      ],
      note: 'Vous pouvez commencer simplement. La prochaine étape reste lisible à chaque moment.'
    },
    offers: {
      title: 'Les étapes et les tarifs.<br><em>Choisissez votre premier pas.</em>',
      lead: 'Chaque étape a un objectif, un contenu et un tarif de référence. Commencez gratuitement, puis avancez à votre rythme.',
      note: '<strong>À savoir.</strong> Motion est un retour fonctionnel non médical. Clinical ajoute le contexte médical d’un médecin. World accompagne la suite et ne remplace pas un suivi médical.'
    },
    experience: {
      eyebrow: 'L’ÉCOSYSTÈME KŌMØ',
      title: 'Du bilan à la continuité.<br><em>Tout reste relié.</em>',
      lead: 'KŌMØ relie le bilan, le suivi et la suite. Vous savez ce qui a été mesuré, ce qui évolue et vers qui vous tourner ensuite.',
      rail: 'La suite KŌMØ : Clinical · Pulse · World · Expérience'
    },
    founder: {
      eyebrow: 'QUI EST DERRIÈRE KŌMØ ?',
      title: 'Dr Renan Chapon<br><em>Médecin, chirurgien du rachis.</em>',
      role: 'Médecin · Fondateur de KŌMØ Longevity',
      body: 'Le Dr Renan Chapon est médecin, avec un parcours hospitalier en neurochirurgie, chirurgie du rachis et analyse fonctionnelle du mouvement. KŌMØ est né de cette conviction : la longévité se lit aussi dans la capacité à marcher, récupérer, s’adapter et rester autonome.',
      cta: 'Voir la méthode'
    },
    world: {
      eyebrow: 'KŌMØ WORLD · RÉÉDUCATION VIRTUELLE & RÉSEAU',
      title: 'KŌMØ World<br><em>Rééducation et réseau.</em>',
      body: 'KŌMØ World est l’espace de rééducation virtuelle et de mise en réseau de KŌMØ : exercices guidés, programmes partagés et professionnels pour continuer entre deux séances.',
      boundary: 'Lorsqu’il s’inscrit dans un parcours de rééducation, le programme est défini avec le professionnel responsable. World accompagne le soin ; il ne le remplace pas.',
      orbitTitle: 'Guidé.<br><em>Connecté.</em><br>Responsable.',
      orbitLead: 'Une suite claire pour continuer à bouger, entre deux étapes et avec les bonnes personnes.',
      signals: [
        ['01', 'GUIDÉ', 'Des exercices et des programmes pour rendre la prochaine étape évidente.'],
        ['02', 'CONNECTÉ', 'Un réseau pour la continuité, la motivation et le progrès partagé.'],
        ['03', 'RESPONSABLE', 'Une extension numérique ancrée dans le bon cadre humain et professionnel.']
      ]
    }
  },
  {
    file: join(root, 'site', 'fr', 'index.html'),
    locale: 'fr',
    hero: {
      eyebrow: 'KŌMØ · BILAN DE MOBILITÉ & LONGÉVITÉ',
      title: 'Comprendre votre mobilité.<br><em>Savoir quoi faire ensuite.</em>',
      lead: 'KŌMØ vous aide à mesurer votre mouvement, à comprendre ce qui évolue et à choisir la prochaine étape — bilan, suivi Pulse ou rééducation avec KŌMØ World.',
      primary: 'Commencer avec KŌMØ',
      secondary: 'Voir le parcours',
      facts: ['Bilan', 'Suivi', 'Suite'],
      note: 'Motion fournit une information fonctionnelle non médicale. Clinical ajoute le contexte d’un médecin.',
      caption: 'La KŌMØ Case · le point de départ de votre bilan de mobilité.'
    },
    clarity: {
      eyebrow: 'KŌMØ, C’EST QUOI ?',
      title: 'Un bilan.<br><em>Un suivi. Une suite.</em>',
      lead: 'KŌMØ réunit trois moments simples : rendre votre mobilité visible, suivre ce qui change dans Pulse, puis agir avec la bonne personne ou le bon programme.',
      cards: [
        ['01', 'Bilan', 'Motion rend votre mouvement visible avec des mesures simples et comparables.', ''],
        ['02', 'Pulse', 'Vos résultats et vos priorités restent réunis dans un même suivi.', ''],
        ['03', 'World', 'Rééducation virtuelle guidée et réseau de professionnels pour continuer entre deux étapes.', 'world']
      ],
      note: 'Vous pouvez commencer simplement. La prochaine étape reste lisible à chaque moment.'
    },
    offers: {
      title: 'Les étapes et les tarifs.<br><em>Choisissez votre premier pas.</em>',
      lead: 'Chaque étape a un objectif, un contenu et un tarif de référence. Commencez gratuitement, puis avancez à votre rythme.',
      note: '<strong>À savoir.</strong> Motion est un retour fonctionnel non médical. Clinical ajoute le contexte médical d’un médecin. World accompagne la suite et ne remplace pas un suivi médical.'
    },
    experience: {
      eyebrow: 'L’ÉCOSYSTÈME KŌMØ',
      title: 'Du bilan à la continuité.<br><em>Tout reste relié.</em>',
      lead: 'KŌMØ relie le bilan, le suivi et la suite. Vous savez ce qui a été mesuré, ce qui évolue et vers qui vous tourner ensuite.',
      rail: 'La suite KŌMØ : Clinical · Pulse · World · Expérience'
    },
    founder: {
      eyebrow: 'QUI EST DERRIÈRE KŌMØ ?',
      title: 'Dr Renan Chapon<br><em>Médecin, chirurgien du rachis.</em>',
      role: 'Médecin · Fondateur de KŌMØ Longevity',
      body: 'Le Dr Renan Chapon est médecin, avec un parcours hospitalier en neurochirurgie, chirurgie du rachis et analyse fonctionnelle du mouvement. KŌMØ est né de cette conviction : la longévité se lit aussi dans la capacité à marcher, récupérer, s’adapter et rester autonome.',
      cta: 'Voir la méthode'
    },
    world: {
      eyebrow: 'KŌMØ WORLD · RÉÉDUCATION VIRTUELLE & RÉSEAU',
      title: 'KŌMØ World<br><em>Rééducation et réseau.</em>',
      body: 'KŌMØ World est l’espace de rééducation virtuelle et de mise en réseau de KŌMØ : exercices guidés, programmes partagés et professionnels pour continuer entre deux séances.',
      boundary: 'Lorsqu’il s’inscrit dans un parcours de rééducation, le programme est défini avec le professionnel responsable. World accompagne le soin ; il ne le remplace pas.',
      orbitTitle: 'Guidé.<br><em>Connecté.</em><br>Responsable.',
      orbitLead: 'Une suite claire pour continuer à bouger, entre deux étapes et avec les bonnes personnes.',
      signals: [
        ['01', 'GUIDÉ', 'Des exercices et des programmes pour rendre la prochaine étape évidente.'],
        ['02', 'CONNECTÉ', 'Un réseau pour la continuité, la motivation et le progrès partagé.'],
        ['03', 'RESPONSABLE', 'Une extension numérique ancrée dans le bon cadre humain et professionnel.']
      ]
    }
  },
  {
    file: join(root, 'site', 'en', 'index.html'),
    locale: 'en',
    hero: {
      eyebrow: 'KŌMØ · MOBILITY ASSESSMENT & LONGEVITY',
      title: 'Understand your mobility.<br><em>Know what comes next.</em>',
      lead: 'KŌMØ helps you measure movement, understand what changes and choose the next step — an assessment, Pulse follow-up or rehabilitation with KŌMØ World.',
      primary: 'Start with KŌMØ',
      secondary: 'See the journey',
      facts: ['Assessment', 'Follow-up', 'Next step'],
      note: 'Motion provides non-medical functional information. Clinical adds a physician’s context.',
      caption: 'The KŌMØ Case · the starting point for your mobility assessment.'
    },
    clarity: {
      eyebrow: 'WHAT IS KŌMØ ?',
      title: 'An assessment.<br><em>A follow-up. A next step.</em>',
      lead: 'KŌMØ brings together three simple moments: make mobility visible, follow what changes in Pulse, then act with the right person or programme.',
      cards: [
        ['01', 'Assessment', 'Motion makes your movement visible with simple, comparable measures.', ''],
        ['02', 'Pulse', 'Your results and priorities stay together in one follow-up.', ''],
        ['03', 'World', 'Guided virtual rehabilitation and a professional network to continue between steps.', 'world']
      ],
      note: 'You can start simply. The next step stays clear at every moment.'
    },
    offers: {
      title: 'The steps and the pricing.<br><em>Choose your first step.</em>',
      lead: 'Every step has a purpose, a clear scope and reference pricing. Start free, then move forward at your own pace.',
      note: '<strong>Good to know.</strong> Motion is non-medical functional feedback. Clinical adds a physician’s medical context. World supports what comes next and does not replace medical care.'
    },
    experience: {
      eyebrow: 'THE KŌMØ ECOSYSTEM',
      title: 'From assessment to continuity.<br><em>Everything stays connected.</em>',
      lead: 'KŌMØ connects assessment, follow-up and what comes next. You know what was measured, what is changing and who can help next.',
      rail: 'The KŌMØ continuum: Clinical · Pulse · World · Experience'
    },
    founder: {
      eyebrow: 'WHO IS BEHIND KŌMØ ?',
      title: 'Dr Renan Chapon<br><em>Physician. Spine surgeon.</em>',
      role: 'Physician · Founder, KŌMØ Longevity',
      body: 'Dr Renan Chapon is a physician whose hospital path includes neurosurgery, spine surgery and functional movement assessment. KŌMØ grew from a simple conviction: longevity also means being able to walk, recover, adapt and remain independent.',
      cta: 'See the method'
    },
    world: {
      eyebrow: 'KŌMØ WORLD · VIRTUAL REHABILITATION & NETWORK',
      title: 'KŌMØ World<br><em>Rehabilitation and network.</em>',
      body: 'KŌMØ World is the virtual rehabilitation and professional-network layer of KŌMØ: guided exercises, shared programmes and the right people to keep moving between sessions.',
      boundary: 'When part of a rehabilitation pathway, the programme is defined with the responsible professional. World supports care; it does not replace it.',
      orbitTitle: 'Guided.<br><em>Connected.</em><br>Responsible.',
      orbitLead: 'A clear next step for staying in motion, between sessions and with the right people.',
      signals: [
        ['01', 'GUIDED', 'Exercises and programmes that make the next step clear.'],
        ['02', 'CONNECTED', 'A network for continuity, motivation and shared progress.'],
        ['03', 'RESPONSIBLE', 'A digital extension anchored to the right human and professional framework.']
      ]
    }
  },
  {
    file: join(root, 'site', 'es', 'index.html'),
    locale: 'es',
    hero: {
      eyebrow: 'KŌMØ · EVALUACIÓN DE MOVILIDAD Y LONGEVIDAD',
      title: 'Entender tu movilidad.<br><em>Saber cuál es el siguiente paso.</em>',
      lead: 'KŌMØ te ayuda a medir tu movimiento, entender qué cambia y elegir el siguiente paso — evaluación, seguimiento en Pulse o rehabilitación con KŌMØ World.',
      primary: 'Empezar con KŌMØ',
      secondary: 'Ver el recorrido',
      facts: ['Evaluación', 'Seguimiento', 'Siguiente paso'],
      note: 'Motion ofrece información funcional no médica. Clinical añade el contexto de un médico.',
      caption: 'La KŌMØ Case · el punto de partida de tu evaluación de movilidad.'
    },
    clarity: {
      eyebrow: '¿QUÉ ES KŌMØ?',
      title: 'Una evaluación.<br><em>Un seguimiento. Un siguiente paso.</em>',
      lead: 'KŌMØ reúne tres momentos sencillos: hacer visible tu movilidad, seguir lo que cambia en Pulse y actuar con la persona o el programa adecuados.',
      cards: [
        ['01', 'Evaluación', 'Motion hace visible tu movimiento con medidas sencillas y comparables.', ''],
        ['02', 'Pulse', 'Tus resultados y prioridades permanecen juntos en un mismo seguimiento.', ''],
        ['03', 'World', 'Rehabilitación virtual guiada y una red profesional para continuar entre etapas.', 'world']
      ],
      note: 'Puedes empezar de forma sencilla. El siguiente paso sigue siendo claro en todo momento.'
    },
    offers: {
      title: 'Las etapas y los precios.<br><em>Elige tu primer paso.</em>',
      lead: 'Cada etapa tiene un objetivo, un contenido y un precio de referencia. Empieza gratis y avanza a tu ritmo.',
      note: '<strong>Importante.</strong> Motion ofrece información funcional no médica. Clinical añade el contexto médico de un profesional. World acompaña el siguiente paso y no sustituye la atención médica.'
    },
    experience: {
      eyebrow: 'EL ECOSISTEMA KŌMØ',
      title: 'De la evaluación a la continuidad.<br><em>Todo permanece conectado.</em>',
      lead: 'KŌMØ conecta la evaluación, el seguimiento y el siguiente paso. Sabes qué se midió, qué cambia y quién puede ayudarte después.',
      rail: 'El continuo KŌMØ: Clinical · Pulse · World · Experiencia'
    },
    founder: {
      eyebrow: '¿QUIÉN ESTÁ DETRÁS DE KŌMØ?',
      title: 'Dr Renan Chapon<br><em>Médico. Cirujano de columna.</em>',
      role: 'Médico · Fundador de KŌMØ Longevity',
      body: 'El Dr Renan Chapon es médico, con una trayectoria hospitalaria en neurocirugía, cirugía de columna y análisis funcional del movimiento. KŌMØ nace de una convicción sencilla: la longevidad también es poder caminar, recuperarse, adaptarse y conservar la autonomía.',
      cta: 'Ver el método'
    },
    world: {
      eyebrow: 'KŌMØ WORLD · REHABILITACIÓN VIRTUAL Y RED',
      title: 'KŌMØ World<br><em>Rehabilitación y red.</em>',
      body: 'KŌMØ World es la capa de rehabilitación virtual y red profesional de KŌMØ: ejercicios guiados, programas compartidos y las personas adecuadas para continuar entre sesiones.',
      boundary: 'Cuando forma parte de un proceso de rehabilitación, el programa se define con el profesional responsable. World acompaña la atención; no la sustituye.',
      orbitTitle: 'Guiado.<br><em>Conectado.</em><br>Responsable.',
      orbitLead: 'Un siguiente paso claro para seguir en movimiento, entre sesiones y con las personas adecuadas.',
      signals: [
        ['01', 'GUIADO', 'Ejercicios y programas que hacen más claro el siguiente paso.'],
        ['02', 'CONECTADO', 'Una red para la continuidad, la motivación y el progreso compartido.'],
        ['03', 'RESPONSABLE', 'Una extensión digital anclada al marco humano y profesional adecuado.']
      ]
    }
  }
];

const style = `<style id="komo-homepage-clarity-transition-v1-style">
  .rvc-home{scroll-padding-top:78px}
  .rvc-home section{scroll-margin-top:78px}
  .rvc-home .rvc-home-hero{padding-top:clamp(58px,8vw,108px);padding-bottom:clamp(52px,7vw,88px)}
  .rvc-home .rvc-home-hero .rvc-copy{max-width:590px;line-height:1.56}
  .rvc-home .rvc-home-hero .rvc-hero-facts{margin-top:34px}
  .rvc-home .komo-hero-note{max-width:560px}
  .rvc-home .komo-patient-clarity-grid,.rvc-home .komo-home-offers-head,.rvc-home .komo-experience-home-intro{align-items:start}
  .rvc-home .komo-patient-founder{padding-top:clamp(58px,7vw,104px);padding-bottom:clamp(58px,7vw,104px)}
  .rvc-home .komo-experience-home-rail{font-size:10px;letter-spacing:.08em;text-transform:none}
  .rvc-home .komo-home-offers{padding-top:clamp(62px,8vw,112px);padding-bottom:clamp(62px,8vw,112px)}
  .rvc-home .rvc-kit,.rvc-home .rvc-session,.rvc-home .rvc-boundary{padding-top:clamp(56px,7vw,96px);padding-bottom:clamp(56px,7vw,96px)}
  .rvc-home .rvc-kit .rvc-title,.rvc-home .rvc-session .rvc-title,.rvc-home .rvc-boundary .rvc-title{max-width:680px}
  .rvc-home .rvc-kit,.rvc-home .rvc-session,.rvc-home .rvc-boundary{border-top:1px solid rgba(16,42,53,.12)}
  .rvc-home #komo-premium-glow{display:none!important;opacity:0!important}
  .komo-clarity-ready .komo-clarity-reveal{opacity:0;transform:translate3d(0,16px,0);transition:opacity .68s cubic-bezier(.22,1,.36,1) var(--komo-clarity-delay,0ms),transform .68s cubic-bezier(.22,1,.36,1) var(--komo-clarity-delay,0ms);will-change:opacity,transform}
  .komo-clarity-ready .komo-clarity-reveal.is-visible{opacity:1;transform:none}
  .rvc-home .komo-clarity-reveal{transition-property:opacity,transform}
  .rvc-home .komo-home-offer-card,.rvc-home .komo-experience-home-card,.rvc-home .komo-patient-clarity-card,.rvc-home .komo-world-home-orbit-card{transition:transform .52s cubic-bezier(.22,1,.36,1),box-shadow .52s cubic-bezier(.22,1,.36,1),border-color .28s ease}
  @media(hover:hover) and (pointer:fine){
    .rvc-home .komo-home-offer-card:hover,.rvc-home .komo-experience-home-card:hover,.rvc-home .komo-patient-clarity-card:hover{transform:translate3d(0,-4px,0)}
    .rvc-home .komo-world-home-orbit-card:hover{transform:translate3d(0,-5px,0)}
  }
  @media(max-width:620px){
    .rvc-home .rvc-home-hero{padding-top:48px;padding-bottom:52px}
    .rvc-home .rvc-home-hero .rvc-hero-facts{margin-top:28px}
    .rvc-home .komo-experience-home-rail{line-height:1.5}
  }
  @media(prefers-reduced-motion:reduce){
    .rvc-home{scroll-behavior:auto}
    .komo-clarity-ready .komo-clarity-reveal{opacity:1;transform:none;transition:none!important}
    .rvc-home .komo-home-offer-card,.rvc-home .komo-experience-home-card,.rvc-home .komo-patient-clarity-card,.rvc-home .komo-world-home-orbit-card{transition:none!important;transform:none!important}
  }
</style>`;

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function sectionBlock(main, classPrefix) {
  const start = main.indexOf(`<section class="${classPrefix}`);
  if (start < 0) throw new Error(`[homepage-clarity-transition-v1] missing section ${classPrefix}`);
  const end = main.indexOf('</section>', start);
  if (end < 0) throw new Error(`[homepage-clarity-transition-v1] unclosed section ${classPrefix}`);
  return { start, end: end + '</section>'.length, html: main.slice(start, end + '</section>'.length) };
}

function reorderHomeSections(html) {
  const mainStart = html.indexOf('<main ');
  const mainEnd = html.indexOf('</main>', mainStart);
  if (mainStart < 0 || mainEnd < 0) throw new Error('[homepage-clarity-transition-v1] main landmark missing');
  const openEnd = html.indexOf('>', mainStart) + 1;
  const open = html.slice(mainStart, openEnd);
  const body = html.slice(openEnd, mainEnd);
  const defs = [
    ['rvc-home-hero', 'hero'],
    ['komo-patient-clarity', 'clarity'],
    ['komo-patient-founder', 'founder'],
    ['komo-home-offers', 'offers'],
    ['komo-experience-home', 'experience'],
    ['komo-world-home', 'world'],
    ['rvc-home-path', 'path'],
    ['rvc-kit', 'kit'],
    ['rvc-session', 'session'],
    ['rvc-boundary', 'boundary'],
    ['rvc-final', 'final']
  ];
  const found = defs.map(([prefix, key]) => ({ key, ...sectionBlock(body, prefix) }));
  let rest = body;
  for (const item of [...found].sort((a, b) => b.start - a.start)) {
    rest = rest.slice(0, item.start) + rest.slice(item.end);
  }
  const leftovers = rest.trim();
  const ordered = found.map((item) => item.html).join('\n\n');
  const rebuilt = `\n${ordered}${leftovers ? `\n\n${leftovers}` : ''}\n`;
  return `${html.slice(0, mainStart)}${open}${rebuilt}</main>${html.slice(mainEnd + '</main>'.length)}`;
}

function replaceFirst(block, pattern, replacement, label) {
  if (!pattern.test(block)) throw new Error(`[homepage-clarity-transition-v1] ${label} replacement failed`);
  return block.replace(pattern, replacement);
}

function renderFacts(facts) {
  return `<ul class="rvc-hero-facts">${facts.map((label, index) => `<li><strong>0${index + 1}</strong><span>${label}</span></li>`).join('')}</ul>`;
}

function renderClarityCards(c) {
  return `<ol class="komo-patient-clarity-cards">${c.cards.map(([number, title, body, link]) => `<li class="komo-patient-clarity-card"><span>${number}</span><div><h3>${link ? `<a href="/world/">${title}</a>` : title}</h3><p>${body}</p></div></li>`).join('')}</ol>`;
}

function renderWorldSignals(signals) {
  return `<ul class="komo-world-home-signal-list">${signals.map(([number, label, text]) => `<li class="komo-world-home-signal"><span>${number}</span><strong>${label}</strong><p>${text}</p></li>`).join('')}</ul>`;
}

function updateCopy(html, c) {
  const updateSection = (prefix, updater) => {
    const current = sectionBlock(html.slice(html.indexOf('<main '), html.indexOf('</main>')), prefix);
    const absoluteStart = html.indexOf('<main ') + html.slice(html.indexOf('<main '), html.indexOf('</main>')).indexOf(current.html);
    const next = updater(current.html);
    html = html.slice(0, absoluteStart) + next + html.slice(absoluteStart + current.html.length);
  };

  updateSection('rvc-home-hero', (block) => {
    let next = replaceFirst(block, /(<p class="rvc-ey">)[\s\S]*?(<\/p>)/, `$1${c.hero.eyebrow}$2`, 'hero eyebrow');
    next = replaceFirst(next, /<h1 class="rvc-title" id="komo-patient-hero-title">[\s\S]*?<\/h1>/, `<h1 class="rvc-title" id="komo-patient-hero-title">${c.hero.title}</h1>`, 'hero title');
    next = replaceFirst(next, /<p class="rvc-copy" style="margin-top:24px">[\s\S]*?<\/p>/, `<p class="rvc-copy" style="margin-top:24px">${c.hero.lead}</p>`, 'hero lead');
    next = replaceFirst(next, /(<a class="rvc-btn rvc-btn--light" href=")[^"]+(">)[\s\S]*?(<\/a>)/, `$1${c.locale === 'fr' ? '/fr/bilan/' : c.locale === 'en' ? '/assessment/' : '/es/evaluacion/'}$2${c.hero.primary} <span aria-hidden="true">↗</span>$3`, 'hero primary');
    next = replaceFirst(next, /<a class="rvc-link" href="[^"]+">[\s\S]*?<\/a>/, `<a class="rvc-link" href="#komo-clarity">${c.hero.secondary} <span aria-hidden="true">↓</span></a>`, 'hero secondary');
    next = replaceFirst(next, /<ul class="rvc-hero-facts">[\s\S]*?<\/ul>/, renderFacts(c.hero.facts), 'hero facts');
    next = replaceFirst(next, /<p class="komo-hero-note">[\s\S]*?<\/p>/, `<p class="komo-hero-note">${c.hero.note}</p>`, 'hero note');
    next = replaceFirst(next, /<figcaption>[\s\S]*?<\/figcaption>/, `<figcaption>${c.hero.caption}</figcaption>`, 'hero caption');
    return next;
  });

  updateSection('komo-patient-clarity', (block) => {
    let next = replaceFirst(block, /(<p class="rvc-ey">)[\s\S]*?(<\/p>)/, `$1${c.clarity.eyebrow}$2`, 'clarity eyebrow');
    next = replaceFirst(next, /<h2 class="rvc-title" id="komo-clarity-title">[\s\S]*?<\/h2>/, `<h2 class="rvc-title" id="komo-clarity-title">${c.clarity.title}</h2>`, 'clarity title');
    next = replaceFirst(next, /<p class="komo-patient-clarity-lead">[\s\S]*?<\/p>/, `<p class="komo-patient-clarity-lead">${c.clarity.lead}</p>`, 'clarity lead');
    next = replaceFirst(next, /<ol class="komo-patient-clarity-cards">[\s\S]*?<\/ol>/, renderClarityCards(c.clarity), 'clarity cards');
    next = replaceFirst(next, /<p class="komo-patient-clarity-note">[\s\S]*?<\/p>/, `<p class="komo-patient-clarity-note">${c.clarity.note}</p>`, 'clarity note');
    return next;
  });

  updateSection('komo-patient-founder', (block) => {
    let next = replaceFirst(block, /(<p class="rvc-ey">)[\s\S]*?(<\/p>)/, `$1${c.founder.eyebrow}$2`, 'founder eyebrow');
    next = replaceFirst(next, /<h2 class="rvc-title" id="komo-patient-founder-title">[\s\S]*?<\/h2>/, `<h2 class="rvc-title" id="komo-patient-founder-title">${c.founder.title}</h2>`, 'founder title');
    next = replaceFirst(next, /<p class="komo-patient-founder-role">[\s\S]*?<\/p>/, `<p class="komo-patient-founder-role">${c.founder.role}</p>`, 'founder role');
    next = replaceFirst(next, /<div class="komo-patient-founder-body"><p>[\s\S]*?<\/p><\/div>/, `<div class="komo-patient-founder-body"><p>${c.founder.body}</p></div>`, 'founder body');
    next = replaceFirst(next, /<a class="rvc-link" href="[^"]+">[\s\S]*?<\/a>/, `<a class="rvc-link" href="${c.locale === 'fr' ? '/fr/methode/' : c.locale === 'en' ? '/method/' : '/es/metodo/'}">${c.founder.cta} <span aria-hidden="true">→</span></a>`, 'founder cta');
    return next;
  });

  updateSection('komo-home-offers', (block) => {
    let next = replaceFirst(block, /<h2 class="rvc-title" id="komo-offers-title">[\s\S]*?<\/h2>/, `<h2 class="rvc-title" id="komo-offers-title">${c.offers.title}</h2>`, 'offers title');
    next = replaceFirst(next, /<p class="komo-home-offers-lead">[\s\S]*?<\/p>/, `<p class="komo-home-offers-lead">${c.offers.lead}</p>`, 'offers lead');
    next = replaceFirst(next, /<p class="komo-home-offers-note">[\s\S]*?<\/p>/, `<p class="komo-home-offers-note">${c.offers.note}</p>`, 'offers note');
    return next;
  });

  updateSection('komo-experience-home', (block) => {
    let next = replaceFirst(block, /(<p class="rvc-ey">)[\s\S]*?(<\/p>)/, `$1${c.experience.eyebrow}$2`, 'experience eyebrow');
    next = replaceFirst(next, /<h2 class="rvc-title" id="komo-experience-title">[\s\S]*?<\/h2>/, `<h2 class="rvc-title" id="komo-experience-title">${c.experience.title}</h2>`, 'experience title');
    next = replaceFirst(next, /<p class="komo-experience-home-lead">[\s\S]*?<\/p>/, `<p class="komo-experience-home-lead">${c.experience.lead}</p>`, 'experience lead');
    next = replaceFirst(next, /<p class="komo-experience-home-rail">[\s\S]*?<\/p>/, `<p class="komo-experience-home-rail">${c.experience.rail}</p>`, 'experience rail');
    return next;
  });

  updateSection('komo-world-home', (block) => {
    let next = replaceFirst(block, /(<p class="rvc-ey">)[\s\S]*?(<\/p>)/, `$1${c.world.eyebrow}$2`, 'world eyebrow');
    next = replaceFirst(next, /<h2 class="rvc-title" id="komo-world-public-home-title">[\s\S]*?<\/h2>/, `<h2 class="rvc-title" id="komo-world-public-home-title">${c.world.title}</h2>`, 'world title');
    next = replaceFirst(next, /<p class="rvc-copy komo-world-home-lead">[\s\S]*?<\/p>/, `<p class="rvc-copy komo-world-home-lead">${c.world.body}</p>`, 'world body');
    next = replaceFirst(next, /<p class="komo-world-home-boundary">[\s\S]*?<\/p>/, `<p class="komo-world-home-boundary">${c.world.boundary}</p>`, 'world boundary');
    next = replaceFirst(next, /<strong>[\s\S]*?<\/strong>/, `<strong>${c.world.orbitTitle}</strong>`, 'world orbit title');
    next = replaceFirst(next, /<p>[\s\S]*?<\/p>(?=\s*<ul class="komo-world-home-signal-list">)/, `<p>${c.world.orbitLead}</p>`, 'world orbit lead');
    next = replaceFirst(next, /<ul class="komo-world-home-signal-list">[\s\S]*?<\/ul>/, renderWorldSignals(c.world.signals), 'world signals');
    return next;
  });

  return html;
}

function addMotionLayer(html) {
  html = html.replace(/\s*<style id="komo-homepage-clarity-transition-v1-style">[\s\S]*?<\/style>\s*(?=<\/head>)/, '');
  html = html.replace(/\s*<script id="komo-homepage-clarity-transition-v1-script">[\s\S]*?<\/script>/, '');
  html = html.replace('</head>', `\n${style}\n</head>`);
  const script = `<script id="komo-homepage-clarity-transition-v1-script">
(()=>{
  const home=document.querySelector('.rvc-home');
  if(!home||home.dataset.komoClarityTransition==='1') return;
  home.dataset.komoClarityTransition='1';
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('komo-clarity-ready');
  const selector=[
    '.komo-patient-hero .rvc-hero-grid>div',
    '.komo-patient-hero .rvc-photo--hero',
    '.komo-patient-clarity-grid',
    '.komo-patient-clarity-card',
    '.komo-home-offers-head',
    '.komo-home-offer-card',
    '.komo-experience-home-intro',
    '.komo-experience-home-card',
    '.komo-patient-founder-grid',
    '.komo-world-home-copy',
    '.komo-world-home-orbit',
    '.rvc-home-path .rvc-section-head',
    '.rvc-kit-grid',
    '.rvc-session-grid',
    '.rvc-boundary-grid',
    '.rvc-final-grid'
  ].join(',');
  const targets=Array.from(home.querySelectorAll(selector));
  targets.forEach((el,index)=>{
    el.classList.add('komo-clarity-reveal');
    el.style.setProperty('--komo-clarity-delay',Math.min(index%5,4)*55+'ms');
  });
  const show=el=>el.classList.add('is-visible');
  if(reduce||!('IntersectionObserver' in window)){targets.forEach(show)}
  else{
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){show(entry.target);observer.unobserve(entry.target)}}),{threshold:.14,rootMargin:'0px 0px -8% 0px'});
    targets.forEach(el=>observer.observe(el));
  }
  home.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',()=>{
    const menu=home.querySelector('.kp-menu[open]');
    if(menu) menu.open=false;
  }));
})();
</script>`;
  return html.replace('</body>', `${script}\n</body>`);
}

for (const page of pages) {
  let html = await readFile(page.file, 'utf8');
  html = reorderHomeSections(html);
  html = updateCopy(html, { ...page, locale: page.locale });
  html = addMotionLayer(html);
  await writeFile(page.file, html);
}

for (const page of pages) {
  const html = await readFile(page.file, 'utf8');
  const main = html.slice(html.indexOf('<main '), html.indexOf('</main>'));
  for (const prefix of ['rvc-home-hero', 'komo-patient-clarity', 'komo-patient-founder', 'komo-home-offers', 'komo-experience-home', 'komo-world-home', 'rvc-home-path', 'rvc-kit', 'rvc-session', 'rvc-boundary', 'rvc-final']) {
    if ((main.match(new RegExp(`<section class="${escapeRegExp(prefix)}`, 'g')) || []).length !== 1) {
      throw new Error(`[homepage-clarity-transition-v1] expected one ${prefix} section in ${page.locale}`);
    }
  }
  if (!html.includes('komo-clarity-ready') && !html.includes('komo-homepage-clarity-transition-v1-script')) {
    throw new Error(`[homepage-clarity-transition-v1] motion layer missing in ${page.locale}`);
  }
}

console.log('[homepage-clarity-transition-v1] PASS · patient narrative reordered, copy simplified and motion made calmer on FR/EN/ES home routes');
