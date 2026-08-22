import { access, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');
const locales = ['en', 'fr', 'es'];
const legal = ['legal', 'privacy', 'cookies', 'terms', 'medical-information', 'intellectual-property'];
const failures = [];

const pathFor = (locale, slug) => locale === 'en' ? join(site, slug, 'index.html') : join(site, locale, slug, 'index.html');

for (const locale of locales) {
  for (const slug of legal) {
    try { await access(pathFor(locale, slug)); } catch { failures.push(`missing ${locale}/${slug}`); }
  }
  const contact = await readFile(pathFor(locale, 'contact'), 'utf8');
  if (!contact.includes('class="privacy-note"')) failures.push(`privacy notice missing on ${locale} contact`);
  if (contact.includes('name="consent"')) failures.push(`obsolete mandatory consent remains on ${locale} contact`);
  const check = await readFile(pathFor(locale, 'check'), 'utf8');
  if (!check.includes('medical-information')) failures.push(`medical safety link missing on ${locale} check`);
}

const css = await readFile(join(site, 'assets', 'css', 'site.css'), 'utf8');
if (css.includes('fonts.googleapis.com')) failures.push('remote Google Fonts import remains in production CSS');

const sitemap = await readFile(join(site, 'sitemap.xml'), 'utf8');
for (const locale of locales) {
  for (const slug of legal) {
    const prefix = locale === 'en' ? '' : `/${locale}`;
    if (!sitemap.includes(`https://komolongevity.com${prefix}/${slug}/`)) failures.push(`sitemap missing ${locale}/${slug}`);
  }
}

const legalFr = await readFile(pathFor('fr', 'legal'), 'utf8');
for (const stale of ['KOMO Longevity Holdings Limited', 'ChatGPT Sites', 'OpenAI Ireland']) {
  if (legalFr.includes(stale)) failures.push(`stale legal identity remains: ${stale}`);
}

if (failures.length) {
  console.error('[production-qa] FAILED');
  failures.forEach((item) => console.error(` - ${item}`));
  process.exit(1);
}

console.log('[production-qa] legal pages, contact privacy, KŌMØ Check boundary, sitemap and external-font checks passed.');
