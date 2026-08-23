import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');
const configs = {
  en: { file: join(site,'index.html'), clinical:'/clinical/', partners:'/partners/' },
  fr: { file: join(site,'fr','index.html'), clinical:'/fr/clinical/', partners:'/fr/partners/' },
  es: { file: join(site,'es','index.html'), clinical:'/es/clinical/', partners:'/es/partners/' }
};
const failures = [];
for (const [locale, cfg] of Object.entries(configs)) {
  const html = await readFile(cfg.file,'utf8');
  const h1s = (html.match(/<h1\b/g)||[]).length;
  const cases = (html.match(/id="komo-case"/g)||[]).length;
  if (h1s !== 1) failures.push(`${locale}: homepage must contain exactly one H1, found ${h1s}`);
  if (cases !== 1) failures.push(`${locale}: expected exactly one KŌMØ Case section, found ${cases}`);
  if (!html.includes('komo-case-overview.jpeg')) failures.push(`${locale}: KŌMØ Case product image missing`);
  if (!/alt="[^"]*KŌMØ Case[^"]*"/.test(html)) failures.push(`${locale}: KŌMØ Case image alt missing`);
  if (!html.includes('KŌMØ Motion')) failures.push(`${locale}: KŌMØ Motion missing`);
  if (!html.includes('KŌMØ Clinical')) failures.push(`${locale}: KŌMØ Clinical missing`);
  if (!html.includes(`href="${cfg.clinical}"`)) failures.push(`${locale}: localized Clinical link missing`);
  if (!html.includes(`href="${cfg.partners}"`)) failures.push(`${locale}: localized professional/Case link missing`);
  const hero = html.indexOf('<section class="hp-hero">');
  const product = html.indexOf('id="komo-case"');
  if (hero < 0 || product < hero) failures.push(`${locale}: KŌMØ Case is not positioned after the hero`);
  if (!html.includes('rel="canonical"')) failures.push(`${locale}: homepage canonical missing`);
  for (const lang of ['en','fr','es','x-default']) if (!html.includes(`hreflang="${lang}"`)) failures.push(`${locale}: hreflang ${lang} missing`);
}
if (failures.length) {
  console.error('[homepage-case-qa] FAILED');
  failures.forEach(x=>console.error(` - ${x}`));
  process.exit(1);
}
console.log('[homepage-case-qa] Case, Motion, Clinical, localized links and homepage SEO boundaries passed.');
