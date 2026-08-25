import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = await readFile(join(root, 'pulse-app', 'index.html'), 'utf8');
const app = await readFile(join(root, 'pulse-app', 'app.js'), 'utf8');
const css = await readFile(join(root, 'pulse-app', 'styles.css'), 'utf8');
const runtime = await readFile(join(root, 'pulse-app', 'runtime.js'), 'utf8');
const resetHtml = await readFile(join(root, 'pulse-app', 'reset', 'index.html'), 'utf8');
const resetJs = await readFile(join(root, 'pulse-app', 'reset', 'reset.js'), 'utf8');
const healthApi = await readFile(join(root, 'api', 'pulse-health.js'), 'utf8');
const emailApi = await readFile(join(root, 'api', 'pulse-email.js'), 'utf8');

const required = [
  ['remember checkbox', html.includes('id="rememberInput"') && html.includes('Rester connecté')],
  ['session storage mode', app.includes('sessionStorage') && app.includes('localStorage')],
  ['Supabase publishable key', app.includes('sb_publishable_')],
  ['legacy session migration', runtime.includes('sb-${PROJECT_REF}-auth-token') && runtime.includes("localStorage.setItem(REMEMBER_KEY, '1')")],
  ['runtime loads before app', html.indexOf('./runtime.js') > -1 && html.indexOf('./runtime.js') < html.indexOf('./app.js')],
  ['dedicated recovery route', runtime.includes('reset/') && resetJs.includes('updateUser({ password: password.value })')],
  ['recovery noindex', resetHtml.includes('noindex,nofollow')],
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
  ['Preview noindex', html.includes('noindex,nofollow')],
  ['health endpoint checks Resend without exposing secret', healthApi.includes('RESEND_API_KEY') && healthApi.includes('Boolean(process.env.RESEND_API_KEY)')],
  ['email gateway authenticates Supabase user', emailApi.includes('/auth/v1/user') && emailApi.includes('Authorization: authorization')],
  ['email gateway uses server-only Resend secret', emailApi.includes('process.env.RESEND_API_KEY') && emailApi.includes('api.resend.com/emails')],
  ['email gateway idempotency', emailApi.includes("'Idempotency-Key': idempotencyKey")],
  ['email templates avoid health payloads', emailApi.includes('aucune donnée de santé ni résultat clinique')],
  ['no Resend secret committed', !/re_[A-Za-z0-9_-]{16,}/.test(`${runtime}\n${resetJs}\n${healthApi}\n${emailApi}`)]
];

const failures = required.filter(([, ok]) => !ok).map(([label]) => label);
if (failures.length) {
  console.error(`[pulse-v12-qa] failed: ${failures.join(', ')}`);
  process.exit(1);
}

console.log(`[pulse-v12-qa] ${required.length} checks passed.`);
