import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'src', 'assets', 'check', 'index.html');
const targets = [
  join(root, 'site', 'assets', 'check', 'index.html'),
  join(root, 'site', 'check', 'index.html'),
  join(root, 'site', 'fr', 'check', 'index.html')
];

const scripts = [
  '<script defer src="/assets/check/complete.js?v=20260821-2"></script>',
  '<script defer src="/assets/check/img-intro.js?v=20260821-seq1"></script>',
  '<script defer src="/assets/check/img-stand.js?v=20260821-seq1"></script>',
  '<script defer src="/assets/check/img-two.js?v=20260821-seq1"></script>',
  '<script defer src="/assets/check/sequential.js?v=20260821-seq1"></script>'
].join('\n');

for (const target of targets) {
  await mkdir(dirname(target), { recursive: true });
  await copyFile(source, target);
  let html = await readFile(target, 'utf8');
  html = html
    .replace('<title>KŌMØ Check — GLFS-25</title>', '<title>KŌMØ Check — Locomotor Prevention</title>')
    .replace('KŌMØ Check: complete the GLFS-25 online and receive your locomotor function score immediately, without sign-up.', 'KŌMØ Check combines GLFS-25, Stand-Up Test and Two-Step Test in a simple sequential prevention journey, with an immediate shareable result.')
    .replace('</body>', `${scripts}\n</body>`);
  await writeFile(target, html, 'utf8');
}

const homeCheckStyle = `
<style id="home-check-entry-style">
.home-check-entry{background:#f3f1eb;border-bottom:1px solid rgba(10,22,19,.10);padding:34px 0 36px}
.home-check-entry__grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(280px,.75fr);gap:56px;align-items:center}
.home-check-entry__eyebrow{margin:0 0 10px;font-size:11px;line-height:1.2;letter-spacing:.18em;text-transform:uppercase;font-weight:700;color:#5d725f}
.home-check-entry h2{margin:0;font-family:Georgia,\"Times New Roman\",serif;font-size:clamp(38px,5.4vw,72px);line-height:.95;letter-spacing:-.052em;font-weight:400;color:#101612}
.home-check-entry h2 em{font-weight:400;color:#6f856f}
.home-check-entry__lead{max-width:720px;margin:18px 0 0;color:#667068;font-size:16px;line-height:1.65}
.home-check-entry__action{display:grid;justify-items:start;gap:15px;padding-left:2px}
.home-check-entry__facts{display:flex;flex-wrap:wrap;gap:8px;margin:0;padding:0;list-style:none}
.home-check-entry__facts li{border:1px solid rgba(10,22,19,.12);border-radius:999px;background:rgba(255,255,255,.68);padding:8px 11px;font-size:11px;line-height:1;color:#526058;white-space:nowrap}
.home-check-entry__button{display:inline-flex;align-items:center;justify-content:center;gap:12px;min-height:52px;padding:0 21px;border-radius:999px;background:#101612;color:#fff!important;font-size:14px;font-weight:700;text-decoration:none;box-shadow:0 12px 28px rgba(12,24,18,.10);transition:transform .2s ease,background .2s ease}
.home-check-entry__button:hover{transform:translateY(-1px);background:#26352a}
.home-check-entry__note{margin:0;color:#7a817b;font-size:11px;line-height:1.5}
@media(max-width:820px){.home-check-entry{padding:27px 0 30px}.home-check-entry__grid{grid-template-columns:1fr;gap:24px}.home-check-entry h2{font-size:clamp(42px,12vw,62px)}.home-check-entry__lead{font-size:15px}.home-check-entry__action{gap:13px}}
</style>`;

const homeCopies = {
  en: {
    path: join(root, 'site', 'index.html'),
    href: '/check/',
    eyebrow: 'FREE KŌMØ CHECK · LOCOMOTOR PREVENTION',
    title: 'How well do you <em>move?</em>',
    lead: 'Discover your locomotor prevention level in about 8 minutes with three simple tests you can complete without creating an account.',
    facts: ['3 tests', 'No sign-up', 'Immediate result'],
    cta: 'Take the free KŌMØ Check',
    note: 'GLFS-25 · Stand-Up Test · Two-Step Test'
  },
  fr: {
    path: join(root, 'site', 'fr', 'index.html'),
    href: '/fr/check/',
    eyebrow: 'KŌMØ CHECK GRATUIT · PRÉVENTION LOCOMOTRICE',
    title: 'Comment bougez-vous <em>aujourd’hui&nbsp;?</em>',
    lead: 'Évaluez votre mobilité et obtenez un repère de prévention locomotrice en environ 8 minutes, grâce à trois tests simples et sans création de compte.',
    facts: ['3 tests', 'Sans inscription', 'Résultat immédiat'],
    cta: 'Faire le KŌMØ Check gratuitement',
    note: 'GLFS-25 · Test de lever · Test des deux pas'
  },
  es: {
    path: join(root, 'site', 'es', 'index.html'),
    href: '/es/check/',
    eyebrow: 'KŌMØ CHECK GRATUITO · PREVENCIÓN LOCOMOTORA',
    title: '¿Cómo te mueves <em>hoy?</em>',
    lead: 'Evalúa tu movilidad y obtén una referencia de prevención locomotora en unos 8 minutos con tres pruebas sencillas y sin crear una cuenta.',
    facts: ['3 pruebas', 'Sin registro', 'Resultado inmediato'],
    cta: 'Hacer el KŌMØ Check gratis',
    note: 'GLFS-25 · Stand-Up Test · Two-Step Test'
  }
};

for (const copy of Object.values(homeCopies)) {
  try {
    let html = await readFile(copy.path, 'utf8');
    if (html.includes('id="home-check-entry"')) continue;
    const section = `
<section class="home-check-entry" id="home-check-entry" aria-label="KŌMØ Check">
  <div class="shell home-check-entry__grid">
    <div>
      <p class="home-check-entry__eyebrow">${copy.eyebrow}</p>
      <h2>${copy.title}</h2>
      <p class="home-check-entry__lead">${copy.lead}</p>
    </div>
    <div class="home-check-entry__action">
      <ul class="home-check-entry__facts" aria-label="KŌMØ Check key facts">${copy.facts.map((item) => `<li>${item}</li>`).join('')}</ul>
      <a class="home-check-entry__button" href="${copy.href}">${copy.cta} <span aria-hidden="true">→</span></a>
      <p class="home-check-entry__note">${copy.note}</p>
    </div>
  </div>
</section>`;
    html = html
      .replace('</head>', `${homeCheckStyle}\n</head>`)
      .replace('<main id="main">', `<main id="main">\n${section}`);
    await writeFile(copy.path, html, 'utf8');
  } catch {
    // A missing locale homepage should not prevent the rest of the build.
  }
}

console.log('Applied sequential KŌMØ Check with illustrations, PNG result and homepage acquisition entry.');
