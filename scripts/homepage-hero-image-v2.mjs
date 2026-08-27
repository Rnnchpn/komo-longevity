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

// Reconstruct the optimized production image from text-safe source parts.
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

const picture = `<picture><source srcset="${publicSrc}" type="image/avif"><img src="${fallbackSrc}" alt="KŌMØ Case ouverte avec six capteurs et interface KŌMØ Pulse" width="1024" height="1151" fetchpriority="high" decoding="async"></picture>`;
const preload = `<link rel="preload" as="image" href="${publicSrc}" type="image/avif" fetchpriority="high">`;
const pages = [join(site, 'fr', 'index.html'), join(site, 'index.html'), join(site, 'es', 'index.html')];

for (const file of pages) {
  let html = await readFile(file, 'utf8');

  // Remove any previous hero-only overrides before inserting the canonical one.
  html = html.replace(/<style id="komo-case-hero-final-style">[\s\S]*?<\/style>/g, '');
  html = html.replace(/<link rel="preload" as="image" href="\/assets\/images\/komo-case-hero-final\.avif"[^>]*>/g, '');

  const marker = '<figure class="kpf-visual"';
  const start = html.indexOf(marker);
  if (start < 0) throw new Error(`[homepage-hero-image-v2] hero figure missing in ${file}`);
  const endAt = html.indexOf('</figure>', start);
  if (endAt < 0) throw new Error(`[homepage-hero-image-v2] hero figure end missing in ${file}`);
  const end = endAt + '</figure>'.length;
  let figure = html.slice(start, end);

  // The new photograph already contains the Pulse screen: remove the old simulated HTML overlay completely.
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

console.log(`[homepage-hero-image-v2] wrote ${image.length} byte AVIF hero`);
