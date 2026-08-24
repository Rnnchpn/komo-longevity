import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const site = join(root, 'site');
const PULSE = 'https://pulse.komolongevity.com/';
const failures = [];
const homes = [
  ['en', join(site, 'index.html'), 'Access the<br><em>KŌMØ Pulse platform.</em>'],
  ['fr', join(site, 'fr', 'index.html'), 'Accédez à la plateforme<br><em>KŌMØ Pulse.</em>'],
  ['es', join(site, 'es', 'index.html'), 'Accede a la plataforma<br><em>KŌMØ Pulse.</em>']
];

for (const item of homes) {
  const lang = item[0];
  const html = await readFile(item[1], 'utf8');
  if (!html.includes(item[2])) failures.push(lang + ': Pulse-first H1 missing');
  if (!html.includes('class="kpg"')) failures.push(lang + ': Pulse gateway missing');
  if ((html.match(/https:\/\/pulse\.komolongevity\.com\//g) || []).length < 7) failures.push(lang + ': too few Pulse connections');
  if (!html.includes('id="komo-ecosystem-schema"') || !html.includes('"@type":"WebApplication"')) failures.push(lang + ': structured application data missing');
  if (!html.includes('rel="preconnect" href="' + PULSE + '"')) failures.push(lang + ': Pulse preconnect missing');
  if (!html.includes('class="kp-mini" href="' + PULSE + '"')) failures.push(lang + ': header action does not lead to Pulse');
  if (/"KŌMØ \| (?:Mobility test|Test de mobilité|Prueba de movilidad)/i.test(html)) failures.push(lang + ': stale test schema remains');
  if (/href=["']\/(?:(?:fr|es)\/)?(?:check|pulse)(?:\/|#)/i.test(html)) failures.push(lang + ': local interactive link remains');
  if (!html.includes('id="komo-beta-status"')) failures.push(lang + ': beta status missing');
  if (!html.includes('data-kp-destination="patient"')) failures.push(lang + ': patient entry missing');
  if (!html.includes('data-kp-destination="professional"')) failures.push(lang + ': professional entry missing');
  if (!html.includes('/_vercel/insights/script.js')) failures.push(lang + ': public analytics script missing');
  if (/dossier longitudinal sécurisé|secure longitudinal space|espacio longitudinal seguro/i.test(html)) failures.push(lang + ': premature secure clinical claim remains');
}

const retired = [
  join(site, 'check', 'index.html'),
  join(site, 'fr', 'check', 'index.html'),
  join(site, 'es', 'check', 'index.html'),
  join(site, 'assets', 'check', 'index.html'),
  join(site, 'assets', 'pulsedemo', 'index.html')
];
for (const file of retired) {
  const html = await readFile(file, 'utf8');
  if (!html.includes('noindex,follow,noarchive')) failures.push(file + ': retired route is indexable');
  if (!html.includes('location.replace("' + PULSE + '")')) failures.push(file + ': Pulse redirect fallback missing');
  if (/<form\b/i.test(html)) failures.push(file + ': interactive test remains');
}

const sitemap = await readFile(join(site, 'sitemap.xml'), 'utf8');
if (/\/(?:fr\/|es\/)?check\//i.test(sitemap)) failures.push('retired Check remains in sitemap');

const vercel = await readFile(join(root, 'vercel.json'), 'utf8');
const netlify = await readFile(join(root, 'netlify.toml'), 'utf8');
if (!vercel.includes('"https://pulse.komolongevity.com/"')) failures.push('Vercel Pulse redirects missing');
if (!netlify.includes('to = "https://pulse.komolongevity.com/"')) failures.push('Netlify Pulse redirects missing');

if (failures.length) {
  console.error('[pulse-platform-qa] FAILED');
  failures.forEach(function(item) { console.error(' - ' + item); });
  process.exit(1);
}
console.log('[pulse-platform-qa] Pulse bridge, redirects, SEO schema and localized gateway passed.');
