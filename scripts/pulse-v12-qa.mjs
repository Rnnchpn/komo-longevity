import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const html = await readFile(join(root, 'pulse-app', 'index.html'), 'utf8');
const app = await readFile(join(root, 'pulse-app', 'app.js'), 'utf8');
const css = await readFile(join(root, 'pulse-app', 'styles.css'), 'utf8');
const runtime = await readFile(join(root, 'pulse-app', 'runtime.js'), 'utf8');
const contentConfig = await readFile(join(root, 'pulse-app', 'content-config.js'), 'utf8');
const clinicalMotion = await readFile(join(root, 'pulse-app', 'clinical-motion-v1.js'), 'utf8');
const clinicalMotionCss = await readFile(join(root, 'pulse-app', 'clinical-motion-v1.css'), 'utf8');
const myocareImport = await readFile(join(root, 'pulse-app', 'myocare-import-v1.js'), 'utf8');
const clinicalCockpit = await readFile(join(root, 'pulse-app', 'clinical-cockpit-v1.js'), 'utf8');
const clinicalCockpitCss = await readFile(join(root, 'pulse-app', 'clinical-cockpit-v1.css'), 'utf8');
const clinicalCockpitBridge = await readFile(join(root, 'pulse-app', 'clinical-cockpit-bridge-v1.js'), 'utf8');
const proAccess = await readFile(join(root, 'pulse-app', 'pro-access-v1.js'), 'utf8');
const vercelRaw = await readFile(join(root, 'vercel.json'), 'utf8');
const vercelConfig = JSON.parse(vercelRaw);
const resetHtml = await readFile(join(root, 'pulse-app', 'reset', 'index.html'), 'utf8');
const resetJs = await readFile(join(root, 'pulse-app', 'reset', 'reset.js'), 'utf8');
const healthApi = await readFile(join(root, 'api', 'pulse-health.js'), 'utf8');
const notifyFn = await readFile(join(root, 'supabase', 'functions', 'pulse-notify', 'index.ts'), 'utf8');

const publicLinks = [
  'https://komolongevity.com/fr/methode/',
  'https://komolongevity.com/fr/bilan/',
  'https://komolongevity.com/fr/case/',
  'https://komolongevity.com/fr/partners/motion/',
  'https://komolongevity.com/fr/partners/clinical/',
  'https://komolongevity.com/fr/network/',
  'https://komolongevity.com/media',
  'https://komolongevity.com/fr/partners/',
  'https://komolongevity.com/fr/science/',
  'https://komolongevity.com/fr/contact/'
];

const rewrites = Array.isArray(vercelConfig.rewrites) ? vercelConfig.rewrites : [];
const headers = Array.isArray(vercelConfig.headers) ? vercelConfig.headers : [];
const hasPulseHost = (rule) => Array.isArray(rule?.has) && rule.has.some((entry) => entry?.type === 'host' && entry?.value === 'pulse.komolongevity.com');
const pulseRootRewrite = rewrites.some((rule) => rule?.source === '/' && rule?.destination === '/pulse-v12/' && hasPulseHost(rule));
const pulseNestedRewrite = rewrites.some((rule) => rule?.source === '/(.*)' && rule?.destination === '/pulse-v12/$1' && hasPulseHost(rule));
const pulsePrivacyHeaders = headers.some((rule) => rule?.source === '/pulse-v12/:path*' && Array.isArray(rule.headers) && rule.headers.some((header) => header?.key === 'X-Robots-Tag' && header?.value?.includes('noindex')));

const required = [
  ['remember checkbox', html.includes('id="rememberInput"') && html.includes('Rester connecté')],
  ['session storage mode', app.includes('sessionStorage') && app.includes('localStorage')],
  ['Supabase publishable key', app.includes('sb_publishable_')],
  ['legacy session migration', runtime.includes('sb-${PROJECT_REF}-auth-token') && runtime.includes("localStorage.setItem(REMEMBER_KEY, '1')")],
  ['runtime loads before app', html.indexOf('./runtime.js') > -1 && html.indexOf('./runtime.js') < html.indexOf('./app.js')],
  ['content configuration loaded', html.includes('./content-config.js') && contentConfig.includes('window.KOMO_PULSE_CONTENT')],
  ['Parcours wording configured', contentConfig.includes("['Parcours', 'Programme']") && html.includes('parcours KŌMØ')],
  ['Explorer links centralized', publicLinks.every((url) => contentConfig.includes(url))],
  ['Pulse root host rewrite', pulseRootRewrite],
  ['Pulse nested host rewrite', pulseNestedRewrite],
  ['Pulse privacy headers', pulsePrivacyHeaders],
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
  ['professional role gate preserved', proAccess.includes("['admin','professional'].includes(role)") && html.includes('./pro-access-v1.js')],
  ['Clinical Motion module loaded', html.includes('./clinical-motion-v1.js') && html.includes('./clinical-motion-v1.css') && clinicalMotionCss.includes('.clm-hero')],
  ['Motion POC defaults to functional profile', clinicalMotion.includes('PROFILE_A_FUNCTIONAL') && clinicalMotion.includes('Myodev dans score global')],
  ['Motion calculation uses server RPC', clinicalMotion.includes("rpc('calculate_motion_v04'") && clinicalMotion.includes("PROTOCOL='motion-v0.4'")],
  ['Motion core captures v4 domains', ['M-FUN-01','M-FUN-02','M-FUN-03','M-FUN-04','M-FUN-05','M-FUN-06','M-FUN-07'].every((code) => clinicalMotion.includes(code))],
  ['MyoCare importer loaded', html.includes('./myocare-import-v1.js') && myocareImport.includes("CONTRACT='myodev-contract-v0.1'")],
  ['MyoCare supports Excel CSV JSON', myocareImport.includes("['xlsx','xls']") && myocareImport.includes("ext==='csv'") && myocareImport.includes("ext==='json'")],
  ['MyoCare provenance and idempotency', myocareImport.includes("from('myodev_imports')") && myocareImport.includes('fileHash') && myocareImport.includes('row_hash')],
  ['MyoCare metrics map to v4 indicators', ['M-MYO-01','M-MYO-02','M-MYO-03','M-MYO-04','M-MYO-05','M-MYO-06','M-MYO-07'].every((code) => myocareImport.includes(code))],
  ['Clinical cockpit assets loaded', html.includes('./clinical-cockpit-v1.js') && html.includes('./clinical-cockpit-v1.css') && html.includes('./clinical-cockpit-bridge-v1.js')],
  ['Clinical cockpit seven operator views', ['dashboard','patients','motion','myocare','validation','plans','agenda'].every((id) => clinicalCockpit.includes(`'${id}'`))],
  ['Clinical cockpit uses canonical backend tables', ['patients','assessments','scores','myodev_imports','priorities','clinical_context','organization_appointments'].every((table) => clinicalCockpit.includes(`'${table}'`) || clinicalCockpit.includes(table))],
  ['Clinical cockpit explicit score release gate', clinicalCockpit.includes("release_status:'clinician_reviewed'") && clinicalCockpit.includes("release_status:'released'")],
  ['Clinical cockpit validates plan priorities', clinicalCockpit.includes("validation_status:'validated'") && clinicalCockpit.includes("validation_status:'draft'")],
  ['Clinical cockpit creates organization appointments', clinicalCockpit.includes("from('organization_appointments').insert") && clinicalCockpit.includes("appointment_type")],
  ['Clinical patient context synchronized with Motion', clinicalCockpitBridge.includes('komo:clinical-patient-changed') && clinicalCockpitBridge.includes('#clmPatient') && clinicalCockpitBridge.includes('#clmAssessment')],
  ['Clinical cockpit responsive tablet mobile', clinicalCockpitCss.includes('@media(max-width:820px)') && clinicalCockpitCss.includes('@media(max-width:520px)')],
  ['Vercel health points to Supabase notification backend', healthApi.includes("notificationBackend: 'supabase-edge:pulse-notify'")],
  ['notification function authenticates Supabase user', notifyFn.includes('supabase.auth.getUser()')],
  ['notification function uses server-only Resend secret', notifyFn.includes('Deno.env.get("RESEND_API_KEY")') && notifyFn.includes('api.resend.com/emails')],
  ['notification function idempotency', notifyFn.includes('"Idempotency-Key": idempotencyKey')],
  ['notification templates avoid health payloads', notifyFn.includes('aucune donnée de santé ni résultat clinique')],
  ['notification health action does not reveal secrets', notifyFn.includes('Boolean(resendKey)') && !notifyFn.includes('resendApiKey: resendKey')],
  ['no Resend secret committed', !/re_[A-Za-z0-9_-]{16,}/.test(`${runtime}\n${resetJs}\n${healthApi}\n${notifyFn}`)]
];

const failures = required.filter(([, ok]) => !ok).map(([label]) => label);
if (failures.length) {
  console.error(`[pulse-v12-qa] failed: ${failures.join(', ')}`);
  process.exit(1);
}

console.log(`[pulse-v12-qa] ${required.length} checks passed.`);
