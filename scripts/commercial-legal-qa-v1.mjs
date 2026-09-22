import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');
const pages = [
  ['fr', join(site, 'fr', 'cgv', 'index.html'), 'Version de travail'],
  ['en', join(site, 'cgv', 'index.html'), 'Working draft'],
  ['es', join(site, 'es', 'cgv', 'index.html'), 'Borrador']
];
const failures = [];

for (const [locale, file, marker] of pages) {
  try {
    await access(file);
    const html = await readFile(file, 'utf8');
    if (!html.includes('noindex,nofollow')) failures.push(`${locale}: CGV draft must stay noindex until identity is validated`);
    if (!html.includes(marker)) failures.push(`${locale}: draft status marker missing`);
    if (html.includes('meta http-equiv="refresh"')) failures.push(`${locale}: CGV is still a redirect`);
  } catch {
    failures.push(`missing ${locale} CGV page`);
  }
}

const fr = (await readFile(join(site, 'fr', 'cgv', 'index.html'), 'utf8')).toLocaleLowerCase('fr');
for (const phrase of ['pulse free', 'motion', 'clinical', 'world / experience', '300 €', '500 €', 'à valider avant toute mise en vente', 'rétractation', 'données personnelles']) {
  if (!fr.includes(phrase)) failures.push(`fr CGV missing: ${phrase}`);
}

const sitemap = await readFile(join(site, 'sitemap.xml'), 'utf8');
for (const url of ['https://komolongevity.com/fr/cgv/', 'https://komolongevity.com/cgv/', 'https://komolongevity.com/es/cgv/']) {
  if (!sitemap.includes(`<loc>${url}</loc>`)) failures.push(`sitemap missing ${url}`);
}

if (failures.length) {
  console.error('[commercial-legal-qa] FAILED');
  for (const failure of failures) console.error(` - ${failure}`);
  process.exit(1);
}

console.log('[commercial-legal-qa] PASS — localized CGV drafts, status guard and sitemap entries verified.');
