import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const site = join(root, 'site');
const imageDir = join(root, 'src', 'assets', 'images');
const targetDir = join(site, 'assets', 'images');

const part1 = join(imageDir, 'komo-case-hero-final.part1.b64');
const part2 = join(imageDir, 'komo-case-hero-final.part2.b64');
const target = join(targetDir, 'komo-case-hero-final.avif');
const fallbackSource = join(imageDir, 'komo-case-score.jpeg');
const fallbackTarget = join(targetDir, 'komo-case-hero-fallback.jpeg');

const publicSrc = '/assets/images/komo-case-hero-final.avif';
const fallbackSrc = '/assets/images/komo-case-hero-fallback.jpeg';

await mkdir(targetDir, { recursive: true });

// Reconstruct the optimized production photograph from text-safe source parts.
const encoded = (await readFile(part1, 'utf8')).trim() + (await readFile(part2, 'utf8')).trim();
const image = Buffer.from(encoded, 'base64');
if (image.length < 12000 || image.subarray(4, 12).toString('ascii') !== 'ftypavif') {
  throw new Error('[homepage-hero-image-v2] reconstructed AVIF is invalid');
}
await writeFile(target, image);
await copyFile(fallbackSource, fallbackTarget);

const heroStyle = `<style id="komo-case-hero-final-style">
.kpf-visual{aspect-ratio:1024/1151!important;background:#eeeae1!important;overflow:hidden!important}
.kpf-visual picture{display:block;width:100%;height:100%}
.kpf-visual picture img{display:block;width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important;background:#eeeae1!important;filter:none!important}
@media(max-width:620px){.kpf-visual{aspect-ratio:1024/1151!important;border-radius:18px!important}}
</style>`;

const picture = `<picture><source srcset="${publicSrc}" type="image/avif"><img src="${fallbackSrc}" alt="KŌMØ Case ouverte avec six capteurs Myodev et interface KŌMØ Pulse" width="1024" height="1151" fetchpriority="high" decoding="async"></picture>`;
const preload = `<link rel="preload" as="image" href="${publicSrc}" type="image/avif" fetchpriority="high">`;
const pages = [join(site, 'fr', 'index.html'), join(site, 'index.html'), join(site, 'es', 'index.html')];

for (const file of pages) {
  let html = await readFile(file, 'utf8');

  // Remove any previous hero-only overrides before inserting the canonical photograph.
  html = html.replace(/<style id="komo-case-hero-final-style">[\s\S]*?<\/style>/g, '');
  html = html.replace(/<link rel="preload" as="image" href="\/assets\/images\/komo-case-hero-final\.avif"[^>]*>/g, '');

  const marker = '<figure class="kpf-visual"';
  const start = html.indexOf(marker);
  if (start < 0) throw new Error(`[homepage-hero-image-v2] hero figure missing in ${file}`);
  const endAt = html.indexOf('</figure>', start);
  if (endAt < 0) throw new Error(`[homepage-hero-image-v2] hero figure end missing in ${file}`);
  const end = endAt + '</figure>'.length;
  let figure = html.slice(start, end);

  // The photograph already contains the Pulse screen: remove the old simulated HTML overlay completely.
  figure = figure.replace(/<div class="kps-login"[\s\S]*?(?=<figcaption)/, '');

  if (/<picture>[\s\S]*?<\/picture>/i.test(figure)) {
    figure = figure.replace(/<picture>[\s\S]*?<\/picture>/i, picture);
  } else if (/<img\b[^>]*>/i.test(figure)) {
    figure = figure.replace(/<img\b[^>]*>/i, picture);
  } else {
    throw new Error(`[homepage-hero-image-v2] hero image missing in ${file}`);
  }

  html = html.slice(0, start) + figure + html.slice(end);
  html = html.replace('</head>', `${preload}${heroStyle}</head>`);
  await writeFile(file, html);
  console.log(`[homepage-hero-image-v2] production hero fixed in ${file}`);
}

// Replace the remaining generic Case/sensor placeholders by the same verified real
// KŌMØ Case photograph. The gait image is kept because it is already a true capture.
const productPhotoStyle = `<style id="komo-real-product-photo-style">
.case-score-visual,.case-sensor-card figure{background:#eeeae1!important;overflow:hidden!important}
.case-score-visual img,.case-sensor-card figure img{display:block;width:100%!important;height:100%!important;object-fit:cover!important;object-position:center!important;filter:none!important}
.case-sensor-card figure img[src*="komo-case-hero-final"]{object-fit:contain!important;padding:2.5%!important}
</style>`;

const productPages = [
  ...pages,
  join(site, 'clinical', 'index.html'), join(site, 'fr', 'clinical', 'index.html'), join(site, 'es', 'clinical', 'index.html'),
  join(site, 'partners', 'index.html'), join(site, 'fr', 'partners', 'index.html'), join(site, 'es', 'partners', 'index.html')
];

for (const file of productPages) {
  let html;
  try { html = await readFile(file, 'utf8'); } catch { continue; }
  html = html
    .replaceAll('/assets/images/komo-case-overview.jpeg', publicSrc)
    .replaceAll('/assets/images/komo-case-muscle.jpeg', publicSrc)
    .replaceAll('Illustration de six capteurs portables utilisés pour observer l’activation musculaire des membres inférieurs', 'Photographie de la KŌMØ Case ouverte avec ses six capteurs Myodev')
    .replaceAll('Illustration of six wearable sensors used to observe lower-limb muscle activation', 'Photograph of the open KŌMØ Case with its six Myodev sensors')
    .replaceAll('Ilustración de seis sensores portátiles utilizados para observar la activación muscular de las extremidades inferiores', 'Fotografía de la KŌMØ Case abierta con sus seis sensores Myodev');
  if (!html.includes('id="komo-real-product-photo-style"')) html = html.replace('</head>', `${productPhotoStyle}</head>`);
  await writeFile(file, html);
}

const demoBands = {
  en: {
    file: join(site, 'partners', 'index.html'),
    eyebrow: 'CANNES · MONACO · FRENCH RIVIERA',
    title: 'See KŌMØ in a real setting.',
    lead: 'Private KŌMØ Case demonstrations are now available for medical centres, longevity clinics, premium hotels, retreats and performance clubs across the Riviera.',
    cta: 'Request a private demo',
    href: '/contact/#contact-form',
    note: 'On-site demonstration · deployment model defined around your setting.'
  },
  fr: {
    file: join(site, 'fr', 'partners', 'index.html'),
    eyebrow: 'CANNES · MONACO · RIVIERA',
    title: 'Découvrir KŌMØ en situation réelle.',
    lead: 'Nous organisons désormais des démonstrations privées de la KŌMØ Case pour les centres médicaux, cliniques de longévité, hôtels premium, retreats et clubs de performance de la Riviera.',
    cta: 'Demander une démonstration',
    href: '/fr/contact/#contact-form',
    note: 'Démonstration sur site · modèle d’intégration défini selon votre structure.'
  },
  es: {
    file: join(site, 'es', 'partners', 'index.html'),
    eyebrow: 'CANNES · MÓNACO · RIVIERA',
    title: 'Descubrir KŌMØ en un entorno real.',
    lead: 'Ya organizamos demostraciones privadas de KŌMØ Case para centros médicos, clínicas de longevidad, hoteles premium, retreats y clubes de rendimiento de la Riviera.',
    cta: 'Solicitar una demostración',
    href: '/es/contact/#contact-form',
    note: 'Demostración in situ · modelo de implantación definido según el centro.'
  }
};

const demoStyle = `<style id="komo-riviera-demo-style">
.riviera-demo-band{background:#111713;color:#f5f1e8;padding:30px 0;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08)}
.riviera-demo-band .shell{display:grid;grid-template-columns:minmax(0,1.45fr) minmax(260px,.55fr);gap:42px;align-items:center}
.riviera-demo-band .eyebrow{color:#aebba9;margin-bottom:10px}
.riviera-demo-band h2{font-size:clamp(30px,3.2vw,48px);line-height:1.02;margin:0 0 12px;letter-spacing:-.035em}
.riviera-demo-band p{color:rgba(245,241,232,.76);max-width:760px;margin:0}
.riviera-demo-band .demo-action{display:flex;flex-direction:column;align-items:flex-start;gap:10px}
.riviera-demo-band .demo-note{font-size:12px;color:rgba(245,241,232,.55)}
@media(max-width:760px){.riviera-demo-band{padding:24px 0}.riviera-demo-band .shell{grid-template-columns:1fr;gap:22px}.riviera-demo-band h2{font-size:32px}}
</style>`;

for (const item of Object.values(demoBands)) {
  let html;
  try { html = await readFile(item.file, 'utf8'); } catch { continue; }
  html = html.replace(/<style id="komo-riviera-demo-style">[\s\S]*?<\/style>/g, '');
  html = html.replace('</head>', `${demoStyle}</head>`);
  html = html.replace(/<section class="riviera-demo-band"[\s\S]*?<\/section>/g, '');
  const band = `<section class="riviera-demo-band" aria-label="${item.eyebrow}"><div class="shell"><div><p class="eyebrow">${item.eyebrow}</p><h2>${item.title}</h2><p>${item.lead}</p></div><div class="demo-action"><a class="button button-light" href="${item.href}">${item.cta} <span aria-hidden="true">↗</span></a><span class="demo-note">${item.note}</span></div></div></section>`;
  const heroStart = html.indexOf('<section class="page-hero"');
  const heroEndAt = heroStart >= 0 ? html.indexOf('</section>', heroStart) : -1;
  if (heroEndAt < 0) throw new Error(`[homepage-hero-image-v2] partner hero missing in ${item.file}`);
  const heroEnd = heroEndAt + '</section>'.length;
  html = html.slice(0, heroEnd) + band + html.slice(heroEnd);
  await writeFile(item.file, html);
  console.log(`[homepage-hero-image-v2] Riviera demo band added in ${item.file}`);
}

console.log(`[homepage-hero-image-v2] wrote ${image.length} byte AVIF hero and synchronized real product photography`);
