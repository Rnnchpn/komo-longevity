import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');

// 1) Add editorial URLs to sitemap so search engines can discover the hub and each article.
const sitemapPath = join(site, 'sitemap.xml');
try {
  let xml = await readFile(sitemapPath, 'utf8');
  const urls = [
    'https://komolongevity.com/media',
    'https://komolongevity.com/review',
    'https://komolongevity.com/media/locomotive-syndrome',
    'https://komolongevity.com/media/walking-is-data',
    'https://komolongevity.com/media/biomechanics-aging',
    'https://komolongevity.com/media/cone-of-economy'
  ];
  const missing = urls.filter((url) => !xml.includes(`<loc>${url}</loc>`));
  if (missing.length) {
    xml = xml.replace('</urlset>', `${missing.map((url) => `  <url><loc>${url}</loc><changefreq>monthly</changefreq></url>`).join('\n')}\n</urlset>`);
    await writeFile(sitemapPath, xml, 'utf8');
  }
} catch (error) {
  console.warn('[media-seo] sitemap patch skipped:', error.message);
}

// 2) Add one elegant internal link from each homepage. This creates real crawlable internal linking
// without turning the primary navigation into a crowded menu.
const copies = {
  en: {
    file: join(site, 'index.html'),
    eyebrow: 'KŌMØ MEDIA · SCIENCE OF MOVEMENT',
    title: 'Read movement.<br><em>Understand longevity.</em>',
    lead: 'Articles, videos and scientific perspectives on gait, posture, biomechanics and locomotor longevity.',
    cta: 'Explore KŌMØ Media'
  },
  fr: {
    file: join(site, 'fr', 'index.html'),
    eyebrow: 'KŌMØ MEDIA · SCIENCE DU MOUVEMENT',
    title: 'Lire le mouvement.<br><em>Comprendre la longévité.</em>',
    lead: 'Articles, vidéos et perspectives scientifiques sur la marche, la posture, la biomécanique et la longévité locomotrice.',
    cta: 'Découvrir KŌMØ Media'
  },
  es: {
    file: join(site, 'es', 'index.html'),
    eyebrow: 'KŌMØ MEDIA · CIENCIA DEL MOVIMIENTO',
    title: 'Leer el movimiento.<br><em>Comprender la longevidad.</em>',
    lead: 'Artículos, vídeos y perspectivas científicas sobre marcha, postura, biomecánica y longevidad locomotora.',
    cta: 'Descubrir KŌMØ Media'
  }
};

const css = `<style id="komo-media-home-style">
.komo-media-entry{padding:58px 0;border-top:1px solid rgba(12,24,18,.10);background:#f0ece4}
.komo-media-entry__grid{display:grid;grid-template-columns:1.15fr .85fr;gap:54px;align-items:end}
.komo-media-entry__eyebrow{margin:0 0 12px;font-size:10px;letter-spacing:.17em;text-transform:uppercase;font-weight:800;color:#617064}
.komo-media-entry h2{margin:0;font-family:Georgia,\"Times New Roman\",serif;font-size:clamp(40px,5vw,68px);line-height:.96;letter-spacing:-.045em;font-weight:400;color:#101612}
.komo-media-entry h2 em{font-weight:400;color:#6f856f}
.komo-media-entry__lead{margin:0 0 20px;color:#687069;font-size:15px;line-height:1.65;max-width:600px}
.komo-media-entry__button{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:0 18px;border-radius:999px;background:#101612;color:#fff!important;text-decoration:none;font-size:13px;font-weight:750}
@media(max-width:800px){.komo-media-entry{padding:46px 0}.komo-media-entry__grid{grid-template-columns:1fr;gap:22px}.komo-media-entry h2{font-size:44px}.komo-media-entry__button{width:100%}}
</style>`;

for (const copy of Object.values(copies)) {
  try {
    let html = await readFile(copy.file, 'utf8');
    if (html.includes('id="komo-media-entry"')) continue;
    const section = `<section class="komo-media-entry" id="komo-media-entry"><div class="shell komo-media-entry__grid"><div><p class="komo-media-entry__eyebrow">${copy.eyebrow}</p><h2>${copy.title}</h2></div><div><p class="komo-media-entry__lead">${copy.lead}</p><a class="komo-media-entry__button" href="/media">${copy.cta} →</a></div></div></section>`;
    html = html.replace('</head>', `${css}\n</head>`).replace('</main>', `${section}\n</main>`);
    await writeFile(copy.file, html, 'utf8');
  } catch (error) {
    console.warn('[media-seo] homepage patch skipped:', copy.file, error.message);
  }
}

console.log('[media-seo] KŌMØ Media URLs added to sitemap and homepage internal links added.');
