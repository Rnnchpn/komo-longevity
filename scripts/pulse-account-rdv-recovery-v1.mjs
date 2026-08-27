import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pulse=path.join(root,'site','pulse-v12');
const bookingPath=path.join(pulse,'booking-layer-v1.js');
const htmlPath=path.join(pulse,'index.html');

for(const file of [bookingPath,htmlPath]) if(!fs.existsSync(file)) throw new Error(`[pulse-account-rdv-recovery] missing ${file}`);

let booking=fs.readFileSync(bookingPath,'utf8');
booking=booking.replace(
  "function renderPatient(){if(location.hash.replace(/^#/,'')!=='documents'||['professional','admin'].includes(S.role))return;",
  "function renderPatient(){if(location.hash.replace(/^#/,'')!=='documents')return;"
);
booking=booking.replace(
  "if(!await base())return;if(!['professional','admin'].includes(S.role))await loadPatient()",
  "if(!await base())return;await loadPatient()"
);
fs.writeFileSync(bookingPath,booking);

let html=fs.readFileSync(htmlPath,'utf8');
const release='20260827-rdv-admin-2';
for(const file of ['admin-shortcut-v1.js','booking-layer-v1.js','booking-directory-map-v1.js','adaptive-shell-v4.js','pulse-my-komo-v1.js']){
  const re=new RegExp(`\\./${file.replace(/[.*+?^${}()|[\\]\\]/g,'\\$&')}(?:\\?v=[^\"']+)?`,'g');
  html=html.replace(re,`./${file}?v=${release}`);
}
fs.writeFileSync(htmlPath,html);
console.log('[pulse-account-rdv-recovery] admin multimode patient RDV + critical cache bust applied');
