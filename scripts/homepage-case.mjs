import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');
const css = await readFile(join(root, 'src/design-system/homepage-case.css'), 'utf8');

const COPY = {
  en: {
    eyebrow: 'KŌMØ CASE · PORTABLE LOCOMOTOR ASSESSMENT',
    title: 'One case.<br><em>From movement to clinical meaning.</em>',
    intro: 'KŌMØ Case brings instrumented acquisition, six Myodev sensors, a defined protocol and the digital workflow into one portable system for standardized locomotor assessment.',
    specKicker: 'THE PORTABLE SYSTEM',
    specTitle: 'KŌMØ Case',
    specBody: 'Designed to move with clinical practice — from a physician office to a longevity clinic or an off-site assessment session.',
    facts: [['Sensors','6 · Myodev'],['Acquisition','Gait + muscle'],['Workflow','Motion → Clinical'],['Setting','Clinic · mobile']],
    primary: 'Discover KŌMØ Case →',
    secondary: 'See the clinical pathway ↗',
    motion: ['KŌMØ Motion','Instrumented capture of gait, movement, lower-limb muscle function, posture and standardized functional tests.','MEASURE · OBSERVE · COMPARE'],
    clinical: ['KŌMØ Clinical','A structured clinical reading of the collected data, designed to make results understandable and support longitudinal follow-up.','INTERPRET · EXPLAIN · FOLLOW'],
    footA: 'Portable by design.', footB: 'Technology in the background. Clinical meaning in the foreground.',
    alt: 'KŌMØ Case portable locomotor assessment system',
    caseHref: '/partners/', clinicalHref: '/clinical/'
  },
  fr: {
    eyebrow: 'KŌMØ CASE · ÉVALUATION LOCOMOTRICE PORTABLE',
    title: 'Une valise.<br><em>De la mesure au sens clinique.</em>',
    intro: 'KŌMØ Case réunit l’acquisition instrumentée, six capteurs Myodev, un protocole défini et le parcours digital dans un système portable d’évaluation locomotrice standardisée.',
    specKicker: 'LE SYSTÈME PORTABLE',
    specTitle: 'KŌMØ Case',
    specBody: 'Pensée pour suivre la pratique clinique — du cabinet au centre de longévité, jusqu’aux évaluations réalisées hors les murs.',
    facts: [['Capteurs','6 · Myodev'],['Acquisition','Marche + muscle'],['Parcours','Motion → Clinical'],['Usage','Cabinet · mobile']],
    primary: 'Découvrir KŌMØ Case →',
    secondary: 'Voir le parcours clinique ↗',
    motion: ['KŌMØ Motion','Capture instrumentée de la marche, du mouvement, de la fonction musculaire des membres inférieurs, de la posture et des tests fonctionnels standardisés.','MESURER · OBSERVER · COMPARER'],
    clinical: ['KŌMØ Clinical','Lecture clinique structurée des données recueillies, pensée pour rendre les résultats compréhensibles et organiser leur suivi dans le temps.','INTERPRÉTER · EXPLIQUER · SUIVRE'],
    footA: 'Portable par conception.', footB: 'La technologie en retrait. Le sens clinique au premier plan.',
    alt: 'KŌMØ Case, système portable d’évaluation locomotrice',
    caseHref: '/fr/partners/', clinicalHref: '/fr/clinical/'
  },
  es: {
    eyebrow: 'KŌMØ CASE · EVALUACIÓN LOCOMOTORA PORTÁTIL',
    title: 'Una maleta.<br><em>De la medición al significado clínico.</em>',
    intro: 'KŌMØ Case reúne adquisición instrumentada, seis sensores Myodev, un protocolo definido y el flujo digital en un sistema portátil para una evaluación locomotora estandarizada.',
    specKicker: 'EL SISTEMA PORTÁTIL',
    specTitle: 'KŌMØ Case',
    specBody: 'Diseñada para acompañar la práctica clínica — desde la consulta y la clínica de longevidad hasta evaluaciones fuera del centro.',
    facts: [['Sensores','6 · Myodev'],['Adquisición','Marcha + músculo'],['Recorrido','Motion → Clinical'],['Uso','Clínica · móvil']],
    primary: 'Descubrir KŌMØ Case →',
    secondary: 'Ver el recorrido clínico ↗',
    motion: ['KŌMØ Motion','Captura instrumentada de la marcha, el movimiento, la función muscular de las extremidades inferiores, la postura y pruebas funcionales estandarizadas.','MEDIR · OBSERVAR · COMPARAR'],
    clinical: ['KŌMØ Clinical','Lectura clínica estructurada de los datos recogidos, concebida para hacer los resultados comprensibles y organizar el seguimiento longitudinal.','INTERPRETAR · EXPLICAR · SEGUIR'],
    footA: 'Portátil por diseño.', footB: 'La tecnología en segundo plano. El significado clínico primero.',
    alt: 'KŌMØ Case, sistema portátil de evaluación locomotora',
    caseHref: '/es/partners/', clinicalHref: '/es/clinical/'
  }
};

const esc = (s='') => String(s).replace(/[&<>\"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function section(c) {
  const facts = c.facts.map(([a,b]) => `<li><span>${esc(a)}</span><strong>${esc(b)}</strong></li>`).join('');
  return `<section class="hpc-case" id="komo-case" aria-labelledby="komo-case-title" data-product="komo-case">
  <div class="hp-shell">
    <div class="hpc-case__head">
      <div><p class="hp-eyebrow">${esc(c.eyebrow)}</p><h2 id="komo-case-title">${c.title}</h2></div>
      <p class="hpc-case__intro">${esc(c.intro)}</p>
    </div>
    <div class="hpc-case__stage">
      <figure class="hpc-case__visual"><img src="/assets/images/komo-case-overview.jpeg" alt="${esc(c.alt)}" loading="eager" decoding="async" width="1600" height="1200"></figure>
      <div class="hpc-case__spec">
        <div>
          <div class="hpc-case__spec-top"><span>${esc(c.specKicker)}</span><strong>${esc(c.specTitle)}</strong></div>
          <p>${esc(c.specBody)}</p>
        </div>
        <div><ul class="hpc-case__facts">${facts}</ul><div class="hpc-case__actions"><a class="hp-btn" href="${c.caseHref}">${esc(c.primary)}</a><a class="hp-text-link" href="${c.clinicalHref}">${esc(c.secondary)}</a></div></div>
      </div>
    </div>
    <div class="hpc-case__systems" aria-label="KŌMØ Motion and KŌMØ Clinical">
      <article class="hpc-case__system"><span class="hpc-case__number">01</span><div><h3>${esc(c.motion[0])}</h3><p>${esc(c.motion[1])}</p><small>${esc(c.motion[2])}</small></div></article>
      <article class="hpc-case__system"><span class="hpc-case__number">02</span><div><h3>${esc(c.clinical[0])}</h3><p>${esc(c.clinical[1])}</p><small>${esc(c.clinical[2])}</small></div></article>
    </div>
    <div class="hpc-case__foot"><span>${esc(c.footA)}</span><span>${esc(c.footB)}</span></div>
  </div>
</section>`;
}

for (const locale of ['en','fr','es']) {
  const file = locale === 'en' ? join(site, 'index.html') : join(site, locale, 'index.html');
  let html = await readFile(file, 'utf8');
  if (html.includes('id="komo-case"')) continue;
  const heroStart = html.indexOf('<section class="hp-hero">');
  if (heroStart < 0) throw new Error(`[homepage-case] hero not found for ${locale}`);
  const heroEnd = html.indexOf('</section>', heroStart);
  if (heroEnd < 0) throw new Error(`[homepage-case] hero closing tag not found for ${locale}`);
  html = html.slice(0, heroEnd + 10) + '\n' + section(COPY[locale]) + '\n' + html.slice(heroEnd + 10);
  html = html.replace('</head>', `<style>${css}</style></head>`);
  await writeFile(file, html, 'utf8');
  console.log(`[homepage-case] injected KŌMØ Case into ${locale} homepage`);
}
