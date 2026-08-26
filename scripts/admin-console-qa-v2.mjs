import { readFile } from 'node:fs/promises';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const [html,shortcut,consoleJs,consoleCss,routeFix,registryFn]=await Promise.all([
  readFile(join(root,'pulse-app','index.html'),'utf8'),
  readFile(join(root,'pulse-app','admin-shortcut-v1.js'),'utf8'),
  readFile(join(root,'pulse-app','admin-console-v2.js'),'utf8'),
  readFile(join(root,'pulse-app','admin-console-v2.css'),'utf8'),
  readFile(join(root,'scripts','admin-route-fix-v1.mjs'),'utf8'),
  readFile(join(root,'supabase','functions','admin-registry','index.ts'),'utf8')
]);
const syntax=spawnSync(process.execPath,['--check',join(root,'pulse-app','admin-console-v2.js')],{encoding:'utf8'});
const checks=[
 ['admin console JavaScript parses',syntax.status===0],
 ['standalone admin assets loaded',html.includes('./admin-console-v2.js')&&html.includes('./admin-console-v2.css')],
 ['shortcut routes directly to admin',shortcut.includes("location.hash='admin'")&&!shortcut.includes('data-kcp-admin-tab')],
 ['shortcut re-announces admin open',shortcut.includes('komo:admin-open')],
 ['native admin route is role gated',routeFix.includes("route==='admin'&&state.role!=='admin'")],
 ['native admin route preserves console',routeFix.includes('data-admin-console-v2')&&routeFix.includes('komo:admin-route-ready')],
 ['admin console has no secondary auth client',!consoleJs.includes('createClient(')&&!consoleJs.includes('.auth.getSession(')],
 ['admin console reuses persisted Pulse access token',consoleJs.includes('AUTH_KEY')&&consoleJs.includes('readAccessToken')&&consoleJs.includes('Authorization:`Bearer ${token}`')],
 ['server remains authorization boundary',consoleJs.includes("invoke('admin-registry'")&&consoleJs.includes("invoke('professional-admin'")&&registryFn.includes('admin_required')],
 ['admin shell renders immediately',consoleJs.includes('function open()')&&consoleJs.includes('render();')],
 ['backend failures are isolated',consoleJs.includes('Promise.allSettled')&&consoleJs.includes('S.errors.patients')&&consoleJs.includes('S.errors.pros')&&consoleJs.includes('S.errors.motion')],
 ['admin route does not require clinical cockpit',!consoleJs.includes('data-clinical-cockpit-v1')&&!consoleJs.includes('kcpView')],
 ['global patient registry available',consoleJs.includes('Tous les patients enregistrés')],
 ['patient registry searchable',consoleJs.includes('data-admin-patient-search')&&consoleJs.includes('filteredPatients')],
 ['professional queue available',consoleJs.includes('Demandes Pro')],
 ['motion request queue available',consoleJs.includes("invoke('patient-intake'")&&consoleJs.includes('Demandes Motion')],
 ['one click professional approval',consoleJs.includes('Approuver & activer')&&consoleJs.includes('organization_role')&&consoleJs.includes('Activation en cours')],
 ['patient assignment available',consoleJs.includes("action:'assign'")&&consoleJs.includes('Choisir un établissement')],
 ['patient registry endpoint admin only',registryFn.includes('admin_required')&&registryFn.includes('listUsers')&&registryFn.includes('professional_applications')],
 ['responsive admin console',consoleCss.includes('@media(max-width:700px)')&&consoleCss.includes('.kav2-registry-row')]
];
const failed=checks.filter(([,ok])=>!ok).map(([n])=>n);if(failed.length){if(syntax.status!==0)console.error(syntax.stderr||syntax.stdout);console.error('[admin-console-qa-v2] failed: '+failed.join(', '));process.exit(1)}console.log(`[admin-console-qa-v2] ${checks.length} checks passed.`);
