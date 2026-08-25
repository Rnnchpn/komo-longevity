import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = await readFile(join(root, 'pulse-app', 'index.html'), 'utf8');
const app = await readFile(join(root, 'pulse-app', 'app.js'), 'utf8');
const css = await readFile(join(root, 'pulse-app', 'styles.css'), 'utf8');

const required = [
  ['remember checkbox', html.includes('id="rememberInput"') && html.includes('Rester connecté')],
  ['session storage mode', app.includes('sessionStorage') && app.includes('localStorage')],
  ['Supabase publishable key', app.includes('sb_publishable_')],
  ['Method link', app.includes('https://komolongevity.com/fr/methode/')],
  ['Assessment link', app.includes('https://komolongevity.com/fr/bilan/')],
  ['Case link', app.includes('https://komolongevity.com/fr/case/')],
  ['Motion link', app.includes('https://komolongevity.com/fr/partners/motion/')],
  ['Clinical link', app.includes('https://komolongevity.com/fr/partners/clinical/')],
  ['Network link', app.includes('https://komolongevity.com/fr/network/')],
  ['Library link', app.includes('https://komolongevity.com/media')],
  ['Professionals link', app.includes('https://komolongevity.com/fr/partners/')],
  ['Science link', app.includes('https://komolongevity.com/fr/science/')],
  ['Contact link', app.includes('https://komolongevity.com/fr/contact/')],
  ['Member result view', app.includes('function renderResults()')],
  ['Clinical view', app.includes('function renderClinical()')],
  ['Responsive mobile nav', css.includes('@media(max-width:820px)') && css.includes('.mobile-nav')],
  ['Reduced motion support', css.includes('prefers-reduced-motion')],
  ['Preview noindex', html.includes('noindex,nofollow')]
];

const failures = required.filter(([, ok]) => !ok).map(([label]) => label);
if (failures.length) {
  console.error(`[pulse-v12-qa] failed: ${failures.join(', ')}`);
  process.exit(1);
}

console.log(`[pulse-v12-qa] ${required.length} checks passed.`);
