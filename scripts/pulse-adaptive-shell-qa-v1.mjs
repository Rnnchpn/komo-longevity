import fs from 'node:fs';
import path from 'node:path';

const pulse=path.join(process.cwd(),'site','pulse-v12');
const html=fs.readFileSync(path.join(pulse,'index.html'),'utf8');
const js=fs.readFileSync(path.join(pulse,'adaptive-shell-v4.js'),'utf8');
const cssBundle=fs.existsSync(path.join(pulse,'pulse-ui-v1.css'))?fs.readFileSync(path.join(pulse,'pulse-ui-v1.css'),'utf8'):fs.readFileSync(path.join(pulse,'adaptive-shell-v4.css'),'utf8');
const checks=[
  ['adaptive shell script loaded',html.includes('adaptive-shell-v4.js')],
  ['patient/pro/admin role switch',js.includes("data-kam-role=\"admin\"")&&js.includes("data-kam-role=\"pro\"")],
  ['five-slot role aware navigation',js.includes("patient:home")&&js.includes("pro:patients")&&js.includes("admin:pros")],
  ['safe hash navigation',js.includes('location.hash=target')&&!js.includes('location.href=`#')],
  ['authenticated-only shell',js.includes('appVisible()')],
  ['site principal remains reachable',js.includes('https://komolongevity.com/fr/')],
  ['old mobile nav hidden by final CSS',cssBundle.includes('#proMobileNav')&&cssBundle.includes('#mobileNav')],
  ['admin mobile console optimized',cssBundle.includes('[data-adaptive-mode="admin"] .kav2')],
  ['professional mobile cockpit optimized',cssBundle.includes('[data-adaptive-mode="pro"] .kcp')]
];
const failed=checks.filter(([,ok])=>!ok);
if(failed.length){for(const [name] of failed)console.error(`[pulse-adaptive-shell-qa] FAIL ${name}`);process.exit(1)}
console.log(`[pulse-adaptive-shell-qa] ${checks.length} checks passed.`);
