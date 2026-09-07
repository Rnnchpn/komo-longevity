import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const siteDir = join(root, 'site');
const encodedDir = join(root, 'src', 'assets', 'site2026');
const outputDir = join(siteDir, 'assets', 'images');

const assets = [
  ['komo-case-premium-v2.webp', 'case.webp.b64'],
  ['dr-renan-chapon-v2.webp', 'portrait.webp.b64'],
  ['komo-pulse-dashboard-v2.webp', 'pulse.webp.b64'],
  ['komo-six-sensors-v2.webp', 'sensors.webp.b64']
];

const copy = {
  en: {
    founderEyebrow: 'FOUNDER · MEDICAL & SCIENTIFIC VISION',
    founderTitle: 'Dr Renan Chapon',
    founderRole: 'Physician · Founder, KŌMØ Longevity',
    founderBody: 'Dr Renan Chapon is a physician whose hospital path has focused on neurosurgery, spine surgery and functional movement assessment across Dijon, Strasbourg and Montpellier. His academic work has included gait analysis in lumbar spinal stenosis, with a consistent interest in the relationship between movement, function and long-term autonomy.',
    founderVision: 'KŌMØ Longevity grew from a simple conviction: longevity is not only a biological number. It is also the ability to keep walking, standing, recovering, adapting and living independently. KŌMØ makes that functional trajectory measurable, understandable and followable over time.',
    founderMeta: ['Former president · AJCR', 'Founder · KŌMØ Longevity', 'President · Locotech Lab'],
    founderQuote: 'Measure movement before mobility becomes a limitation.'
  },
  fr: {
    founderEyebrow: 'FONDATEUR · VISION MÉDICALE & SCIENTIFIQUE',
    founderTitle: 'Dr Renan Chapon',
    founderRole: 'Médecin · Fondateur de KŌMØ Longevity',
    founderBody: 'Le Dr Renan Chapon est médecin, avec un parcours hospitalier centré sur la neurochirurgie, la chirurgie du rachis et l’analyse fonctionnelle du mouvement à Dijon, Strasbourg et Montpellier. Ses travaux académiques ont notamment porté sur l’analyse de la marche dans la sténose lombaire, avec un intérêt constant pour le lien entre mouvement, fonction et autonomie à long terme.',
    founderVision: 'KŌMØ Longevity est né d’une conviction simple : la longévité ne se résume pas à un âge biologique. Elle se lit aussi dans la capacité à marcher, se relever, récupérer, s’adapter et rester autonome. KŌMØ rend cette trajectoire fonctionnelle mesurable, compréhensible et suivie dans le temps.',
    founderMeta: ['Ancien président · AJCR', 'Fondateur · KŌMØ Longevity', 'Président · Locotech Lab'],
    founderQuote: 'Mesurer le mouvement avant que la mobilité ne devienne une limitation.'
  },
  es: {
    founderEyebrow: 'FUNDADOR · VISIÓN MÉDICA Y CIENTÍFICA',
    founderTitle: 'Dr Renan Chapon',
    founderRole: 'Médico · Fundador de KŌMØ Longevity',
    founderBody: 'El Dr Renan Chapon es médico, con una trayectoria hospitalaria centrada en neurocirugía, cirugía de columna y análisis funcional del movimiento en Dijon, Estrasburgo y Montpellier. Su trabajo académico ha incluido el análisis de la marcha en la estenosis lumbar, con un interés constante por la relación entre movimiento, función y autonomía a largo plazo.',
    founderVision: 'KŌMØ Longevity nace de una convicción sencilla: la longevidad no es solo una edad biológica. También se expresa en la capacidad de caminar, levantarse, recuperarse, adaptarse y conservar la autonomía. KŌMØ convierte esa trayectoria funcional en algo medible, comprensible y seguido en el tiempo.',
    founderMeta: ['Ex presidente · AJCR', 'Fundador · KŌMØ Longevity', 'Presidente · Locotech Lab'],
    founderQuote: 'Medir el movimiento antes de que la movilidad se convierta en una limitación.'
  }
};

const style = `
<style id="komo-visuals-v2">
  .case-hero-grid{grid-template-columns:minmax(0,.86fr) minmax(0,1.22fr)!important;gap:clamp(2rem,5vw,6rem)!important;align-items:center!important}
  .case-hero-visual{max-width:none!important;margin:0!important}
  .case-hero-visual img{display:block;width:100%!important;height:auto!important;aspect-ratio:5/4;object-fit:cover;object-position:center;border-radius:2px;background:#111;box-shadow:0 30px 80px rgba(0,0,0,.18)}
  .case-score-visual img,.case-sensor-card img{display:block;width:100%;height:100%;object-fit:cover}
  .case-score-visual img{aspect-ratio:1/1}
  .case-sensor-card img{aspect-ratio:1/1}
  .komo-founder{padding:clamp(72px,9vw,132px) 0;background:#0b1511;color:#f5f3ec;overflow:hidden}
  .komo-founder-grid{display:grid;grid-template-columns:minmax(300px,.72fr) minmax(0,1.28fr);gap:clamp(42px,7vw,110px);align-items:center}
  .komo-founder-portrait{margin:0;position:relative}
  .komo-founder-portrait:after{content:'';position:absolute;inset:auto -18px -18px 18px;height:42%;border:1px solid rgba(201,218,207,.35);z-index:0}
  .komo-founder-portrait img{display:block;position:relative;z-index:1;width:100%;aspect-ratio:1/1;object-fit:cover;object-position:center top;background:#17324c}
  .komo-founder-copy .eyebrow{color:#a9c1b2}
  .komo-founder-copy h2{font-size:clamp(2.7rem,5.7vw,5.8rem);line-height:.93;letter-spacing:-.055em;margin:.25em 0 .18em;color:#fff}
  .komo-founder-role{font-size:clamp(1rem,1.35vw,1.25rem);color:#c9d8cf;margin:0 0 2rem}
  .komo-founder-body{display:grid;grid-template-columns:1fr 1fr;gap:clamp(20px,3vw,42px);margin:0 0 2rem}
  .komo-founder-body p{margin:0;color:rgba(245,243,236,.74);font-size:clamp(1rem,1.18vw,1.12rem);line-height:1.65}
  .komo-founder-meta{display:flex;flex-wrap:wrap;gap:9px;margin:0 0 2.2rem;padding:0;list-style:none}
  .komo-founder-meta li{border:1px solid rgba(201,218,207,.27);padding:9px 13px;border-radius:999px;font-size:.78rem;letter-spacing:.06em;text-transform:uppercase;color:#dce7e0}
  .komo-founder-quote{margin:0;padding-top:1.5rem;border-top:1px solid rgba(255,255,255,.13);font-size:clamp(1.45rem,2.5vw,2.4rem);line-height:1.12;letter-spacing:-.03em;color:#fff;max-width:21ch}
  @media(max-width:900px){.case-hero-grid{grid-template-columns:1fr!important}.case-hero-visual{order:-1}.komo-founder-grid{grid-template-columns:1fr}.komo-founder-portrait{max-width:560px}.komo-founder-body{grid-template-columns:1fr}}
</style>`;

function imageTag(src, alt, width, height, priority = false) {
  return `<img src="${src}" alt="${alt}" width="${width}" height="${height}" ${priority ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

function founderSection(c) {
  return `<section class="komo-founder" aria-labelledby="komo-founder-title">
    <div class="shell komo-founder-grid">
      <figure class="komo-founder-portrait reveal">${imageTag('/assets/images/dr-renan-chapon-v2.webp', c.founderTitle, 400, 400)}</figure>
      <div class="komo-founder-copy reveal">
        <p class="eyebrow">${c.founderEyebrow}</p>
        <h2 id="komo-founder-title">${c.founderTitle}</h2>
        <p class="komo-founder-role">${c.founderRole}</p>
        <div class="komo-founder-body"><p>${c.founderBody}</p><p>${c.founderVision}</p></div>
        <ul class="komo-founder-meta">${c.founderMeta.map((x)=>`<li>${x}</li>`).join('')}</ul>
        <p class="komo-founder-quote">${c.founderQuote}</p>
      </div>
    </div>
  </section>`;
}

async function decodeAssets() {
  await mkdir(outputDir, { recursive: true });
  for (const [name, encoded] of assets) {
    const b64 = (await readFile(join(encodedDir, encoded), 'utf8')).replace(/\s+/g, '');
    await writeFile(join(outputDir, name), Buffer.from(b64, 'base64'));
  }
}

async function patchHome(locale, relativePath) {
  const file = join(siteDir, relativePath);
  let html = await readFile(file, 'utf8');
  const c = copy[locale];

  html = html.replace(/<img\s+src="\/assets\/images\/komo-case-score\.jpeg"[^>]*>/, imageTag('/assets/images/komo-case-premium-v2.webp', locale === 'fr' ? 'KŌMØ Case ouverte avec six capteurs et système de capture' : locale === 'es' ? 'KŌMØ Case abierta con seis sensores y sistema de captura' : 'Open KŌMØ Case with six sensors and capture system', 800, 640, true));
  html = html.replace(/<img\s+src="\/assets\/images\/komo-case-overview\.jpeg"[^>]*>/, imageTag('/assets/images/komo-pulse-dashboard-v2.webp', locale === 'fr' ? 'KŌMØ Pulse affichant Motion Score et trajectoire fonctionnelle' : locale === 'es' ? 'KŌMØ Pulse mostrando Motion Score y trayectoria funcional' : 'KŌMØ Pulse showing Motion Score and functional trajectory', 800, 800));
  html = html.replace(/<img\s+src="\/assets\/images\/komo-case-muscle\.jpeg"[^>]*>/, imageTag('/assets/images/komo-six-sensors-v2.webp', locale === 'fr' ? 'Les six capteurs KŌMØ powered by Myodev' : locale === 'es' ? 'Los seis sensores KŌMØ powered by Myodev' : 'Six KŌMØ sensors powered by Myodev', 800, 800));

  const founder = founderSection(c);
  const oldPulseBand = /<section class="section-tight pulse-portrait-band">[\s\S]*?<\/section>/;
  if (oldPulseBand.test(html)) html = html.replace(oldPulseBand, founder);
  else html = html.replace('</main>', `${founder}\n</main>`);

  if (!html.includes('komo-visuals-v2')) html = html.replace('</head>', `<link rel="preload" as="image" href="/assets/images/komo-case-premium-v2.webp" type="image/webp" fetchpriority="high">${style}\n</head>`);

  await writeFile(file, html);
}

await decodeAssets();
await patchHome('en', 'index.html');
await patchHome('fr', join('fr', 'index.html'));
await patchHome('es', join('es', 'index.html'));
console.log('KŌMØ home visuals v2 applied.');
