import { readFile } from 'node:fs/promises';
import { dirname,join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url))),pulse=join(root,'site','pulse-v12');
const [html,booking,admin,map]=await Promise.all([
  readFile(join(pulse,'index.html'),'utf8'),
  readFile(join(pulse,'booking-layer-v1.js'),'utf8'),
  readFile(join(pulse,'admin-shortcut-v1.js'),'utf8'),
  readFile(join(pulse,'booking-directory-map-v1.js'),'utf8')
]);
const checks=[
 ['patient RDV renders for professional/admin accounts',!booking.includes("function renderPatient(){if(location.hash.replace(/^#/,'')!=='documents'||['professional','admin'].includes(S.role))return;")],
 ['patient RDV refresh loads regardless of account capability',booking.includes("if(!await base())return;await loadPatient()")],
 ['admin shortcut remains role gated',admin.includes("role==='admin'")&&admin.includes('data-admin-account')],
 ['booking directory remains mounted',booking.includes('data-kbd-shell')&&map.includes("rpc('komo_booking_directory')")],
 ['admin module cache busted',html.includes('admin-shortcut-v1.js?v=20260827-rdv-admin-2')],
 ['booking module cache busted',html.includes('booking-layer-v1.js?v=20260827-rdv-admin-2')],
 ['map module cache busted',html.includes('booking-directory-map-v1.js?v=20260827-rdv-admin-2')],
 ['adaptive shell cache busted',html.includes('adaptive-shell-v4.js?v=20260827-rdv-admin-2')],
 ['My Komo menu cache busted',html.includes('pulse-my-komo-v1.js?v=20260827-rdv-admin-2')]
];
const failed=checks.filter(([,ok])=>!ok).map(([n])=>n);
if(failed.length){console.error('[pulse-account-rdv-recovery-qa] failed: '+failed.join(', '));process.exit(1)}
for(const [n] of checks)console.log('[pulse-account-rdv-recovery-qa] OK · '+n);
console.log(`[pulse-account-rdv-recovery-qa] ${checks.length} checks passed.`);
