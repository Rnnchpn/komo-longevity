import { readFile } from 'node:fs/promises';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const [html,shortcut,consoleJs,consoleCss,routeFix,registryFn]=await Promise.all([
  readFile(join(root,'pulse-app','index.html'),'utf8'),
  readFile(join(root,'pulse-app','admin-shortcut-v1.js'),'utf8'),
  readFile(join(root,'pulse-app','admin-console-v2.js'),'utf8'),
  readFile(join(root,'pulse-app','admin-console-v2.css'),'utf8'),
  readFile(join(root,'scripts','admin-route-fix-v1.mjs'),'utf8'),
  readFile(join(root,'supabase','functions','admin-registry','index.ts'),'utf8')
]);
const checks=[
 ['standalone admin assets loaded',html.includes('./admin-console-v2.js')&&html.includes('./admin-console-v2.css')],
 ['shortcut routes directly to admin',shortcut.includes("location.hash='admin'")&&!shortcut.includes('data-kcp-admin-tab')],
 ['shortcut re-announces admin open',shortcut.includes('komo:admin-open')],
 ['native admin route is role gated',routeFix.includes("route==='admin'&&state.role!=='admin'")],
 ['native admin route preserves console',routeFix.includes('data-admin-console-v2')&&routeFix.includes('komo:admin-route-ready')],
 ['admin console role gated',consoleJs.includes("S.role!=='admin'")&&consoleJs.includes("from('account_roles')")],
 ['admin route does not require clinical cockpit',!consoleJs.includes('data-clinical-cockpit-v1')&&!consoleJs.includes('kcpView')],
 ['global patient registry available',consoleJs.includes("invoke('admin-registry'")&&consoleJs.includes('Tous les patients enregistrés')],
 ['patient registry searchable',consoleJs.includes('data-admin-patient-search')&&consoleJs.includes('filteredPatients')],
 ['professional queue available',consoleJs.includes('professional-admin')&&consoleJs.includes('Demandes Pro')],
 ['motion request queue available',consoleJs.includes('patient-intake')&&consoleJs.includes('Demandes Motion')],
 ['one click professional approval',consoleJs.includes('Approuver & activer')&&consoleJs.includes('organization_role')],
 ['patient assignment available',consoleJs.includes("action:'assign'")&&consoleJs.includes('Choisir un établissement')],
 ['patient registry endpoint admin only',registryFn.includes('admin_required')&&registryFn.includes('listUsers')&&registryFn.includes('professional_applications')],
 ['responsive admin console',consoleCss.includes('@media(max-width:700px)')&&consoleCss.includes('.kav2-registry-row')]
];
const failed=checks.filter(([,ok])=>!ok).map(([n])=>n);if(failed.length){console.error('[admin-console-qa-v2] failed: '+failed.join(', '));process.exit(1)}console.log(`[admin-console-qa-v2] ${checks.length} checks passed.`);
