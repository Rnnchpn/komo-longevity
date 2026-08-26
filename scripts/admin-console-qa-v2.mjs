import { readFile } from 'node:fs/promises';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const [html,shortcut,consoleJs,consoleCss]=await Promise.all([
  readFile(join(root,'pulse-app','index.html'),'utf8'),
  readFile(join(root,'pulse-app','admin-shortcut-v1.js'),'utf8'),
  readFile(join(root,'pulse-app','admin-console-v2.js'),'utf8'),
  readFile(join(root,'pulse-app','admin-console-v2.css'),'utf8')
]);
const checks=[
 ['standalone admin assets loaded',html.includes('./admin-console-v2.js')&&html.includes('./admin-console-v2.css')],
 ['shortcut routes directly to admin',shortcut.includes("location.hash='admin'")&&!shortcut.includes('data-kcp-admin-tab')],
 ['admin route role gated',consoleJs.includes("S.role!=='admin'")&&consoleJs.includes("from('account_roles')")],
 ['admin route does not require clinical cockpit',!consoleJs.includes('data-clinical-cockpit-v1')&&!consoleJs.includes('kcpView')],
 ['professional queue available',consoleJs.includes('professional-admin')&&consoleJs.includes('Comptes Pro')],
 ['patient queue available',consoleJs.includes('patient-intake')&&consoleJs.includes('Demandes patients')],
 ['one click professional approval',consoleJs.includes('Approuver & activer')&&consoleJs.includes('organization_role')],
 ['patient assignment available',consoleJs.includes("action:'assign'")&&consoleJs.includes('Choisir un établissement')],
 ['responsive admin console',consoleCss.includes('@media(max-width:700px)')]
];
const failed=checks.filter(([,ok])=>!ok).map(([n])=>n);if(failed.length){console.error('[admin-console-qa-v2] failed: '+failed.join(', '));process.exit(1)}console.log(`[admin-console-qa-v2] ${checks.length} checks passed.`);
