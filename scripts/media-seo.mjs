import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');

async function htmlFiles(dir) {
  const files = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) files.push(...await htmlFiles(path));
      else if (entry.isFile() && entry.name.endsWith('.html')) files.push(path);
    }
  } catch {}
  return files;
}

// 1) Editorial URLs: one crawlable public knowledge hub + article URLs.
const sitemapPath = join(site, 'sitemap.xml');
try {
  let xml = await readFile(sitemapPath, 'utf8');

  // The French Library is now consolidated into /media. Do not ask search engines
  // to index both the legacy Library URL and the editorial hub.
  xml = xml.replace(/\s*<url>\s*<loc>https:\/\/komolongevity\.com\/fr\/library\/?<\/loc>[\s\S]*?<\/url>/g, '');

  const urls = [
    'https://komolongevity.com/media',
    'https://komolongevity.com/review',
    'https://komolongevity.com/media/locomotive-syndrome',
    'https://komolongevity.com/media/walking-is-data',
    'https://komolongevity.com/media/biomechanics-aging',
    'https://komolongevity.com/media/cone-of-economy',
    'https://komolongevity.com/media/sarcopenie-force-musculaire',
    'https://komolongevity.com/media/test-lever-chaise',
    'https://komolongevity.com/media/puissance-musculaire-vieillissement',
    'https://komolongevity.com/media/equilibre-vieillissement'
  ];
  const missing = urls.filter((url) => !xml.includes(`<loc>${url}</loc>`));
  if (missing.length) {
    xml = xml.replace('</urlset>', `${missing.map((url) => `  <url><loc>${url}</loc><changefreq>monthly</changefreq></url>`).join('\n')}\n</urlset>`);
  }
  await writeFile(sitemapPath, xml, 'utf8');
} catch (error) {
  console.warn('[media-seo] sitemap patch skipped:', error.message);
}

// 2) On every French public page, KŌMØ Library becomes the single doorway
// to the editorial hub. This removes duplicate navigation between Library and Media.
const frenchFiles = await htmlFiles(join(site, 'fr'));
for (const file of frenchFiles) {
  try {
    let html = await readFile(file, 'utf8');
    const original = html;
    html = html
      .replaceAll('href="/fr/library/#articles"', 'href="/media"')
      .replaceAll('href="/fr/library/"', 'href="/media"')
      .replaceAll('>Bibliothèque<', '>KŌMØ Library<');
    if (html !== original) await writeFile(file, html, 'utf8');
  } catch (error) {
    console.warn('[media-seo] French Library link patch skipped:', file, error.message);
  }
}

// 3) Present /media as the public face of KŌMØ Library and enrich its taxonomy.
const mediaPath = join(site, 'assets', 'media', 'index.html');
try {
  let html = await readFile(mediaPath, 'utf8');
  html = html
    .replace('<title>KŌMØ Media — Longévité locomotrice, marche & biomécanique</title>', '<title>KŌMØ Library — Articles, vidéos & longévité locomotrice</title>')
    .replace('content="KŌMØ Media rassemble articles, vidéos et perspectives scientifiques sur la longévité locomotrice, la marche, la biomécanique, la posture et la mobilité."', 'content="KŌMØ Library rassemble articles, vidéos, revues et perspectives scientifiques sur la longévité locomotrice, la marche, la biomécanique, le muscle, l’équilibre, la posture et la mobilité."')
    .replace('content="KŌMØ Media — Science of Movement"', 'content="KŌMØ Library — Science of Movement"')
    .replace('"name":"KŌMØ Media"', '"name":"KŌMØ Library"')
    .replace('"about":["locomotor longevity","mobility","gait","biomechanics","posture"]', '"about":["locomotor longevity","mobility","gait","biomechanics","posture","sarcopenia","muscle strength","muscle power","balance","functional testing"]')
    .replace('<a class="brand" href="/">KŌMØ MEDIA</a>', '<a class="brand" href="/">KŌMØ LIBRARY</a>')
    .replace('>SCIENCE · MOVEMENT · LONGEVITY<', '>KŌMØ MEDIA · SCIENCE · MOVEMENT · LONGEVITY<')
    .replace('Articles, vidéos et perspectives scientifiques sur la marche, la posture, la biomécanique et la longévité locomotrice.', 'KŌMØ Library réunit articles, vidéos, revues et perspectives scientifiques sur la marche, le muscle, l’équilibre, la posture, la biomécanique et la longévité locomotrice.')
    .replace('>6 contenus<', '>10 contenus<')
    .replace('<button class="topic" type="button" data-topic="clinique" aria-pressed="false">Clinique</button>', '<button class="topic" type="button" data-topic="clinique" aria-pressed="false">Clinique</button><button class="topic" type="button" data-topic="muscle" aria-pressed="false">Muscle</button><button class="topic" type="button" data-topic="equilibre" aria-pressed="false">Équilibre</button><button class="topic" type="button" data-topic="tests" aria-pressed="false">Tests fonctionnels</button>')
    .replace('data-topics="posture biomecanique clinique"', 'data-topics="posture biomecanique clinique equilibre"');

  if (!html.includes('/media/sarcopenie-force-musculaire')) {
    const newArticles = `
<a class="article-link" href="/media/sarcopenie-force-musculaire" data-search-item data-topics="muscle prevention clinique mobilite" data-search="sarcopenie sarcopénie muscle force musculaire muscle strength masse musculaire muscle mass ewgsop2 prévention prevention mobilité mobilite performance physique"><span class="number">05</span><div><h3>Sarcopénie : la force avant la masse</h3><p>Pourquoi le consensus européen place aujourd’hui la force musculaire au premier plan de l’évaluation.</p></div><span class="meta meta-col">Muscle · Prévention · 6 min</span><span class="arrow">→</span></a>
<a class="article-link" href="/media/test-lever-chaise" data-search-item data-topics="tests muscle equilibre mobilite clinique" data-search="test lever chaise sit to stand five times sit to stand chair stand force membres inférieurs lower limb strength équilibre equilibre contrôle postural controle fonction mobilité mobilite"><span class="number">06</span><div><h3>Le test de lever de chaise</h3><p>Ce que cinq levers successifs révèlent sur la fonction, la force et le contrôle du mouvement.</p></div><span class="meta meta-col">Tests · Mobilité · 5 min</span><span class="arrow">→</span></a>
<a class="article-link" href="/media/puissance-musculaire-vieillissement" data-search-item data-topics="muscle biomecanique mobilite prevention" data-search="puissance musculaire muscle power force vitesse velocity vieillissement aging fonction mobilité mobilite neuromusculaire accélération acceleration prévention prevention"><span class="number">07</span><div><h3>Puissance musculaire : pourquoi la vitesse compte</h3><p>La capacité à produire de la force rapidement apporte une information différente de la force maximale seule.</p></div><span class="meta meta-col">Muscle · Biomécanique · 6 min</span><span class="arrow">→</span></a>
<a class="article-link" href="/media/equilibre-vieillissement" data-search-item data-topics="equilibre mobilite prevention clinique" data-search="équilibre equilibre balance vieillissement aging vision vestibulaire vestibular proprioception contrôle postural controle postural sensory integration intégration sensorielle integration sensorielle stabilité stabilite"><span class="number">08</span><div><h3>Équilibre : un système multisensoriel</h3><p>Vision, vestibule, proprioception et commande motrice travaillent ensemble pour stabiliser le corps.</p></div><span class="meta meta-col">Équilibre · Neuromoteur · 6 min</span><span class="arrow">→</span></a>`;
    html = html.replace('</div></div></section>\n\n<section class="section" id="videos"', `${newArticles}\n</div></div></section>\n\n<section class="section" id="videos"`);
  }

  await writeFile(mediaPath, html, 'utf8');
} catch (error) {
  console.warn('[media-seo] Media/Library identity patch skipped:', error.message);
}

console.log('[media-seo] KŌMØ Library consolidated, enriched with muscle/balance/testing cluster, sitemap and internal links updated.');
