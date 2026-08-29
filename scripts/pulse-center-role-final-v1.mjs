import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const centerPath=join(pulse,'center-command-cockpit-v2.js');
const agendaPath=join(pulse,'agenda-hub-v4.js');
let center=await readFile(centerPath,'utf8');

if(!center.includes("functions.invoke('center-command-v2'"))throw new Error('[center-role-final] v2 invocation target missing');
center=center.replace("functions.invoke('center-command-v2'","functions.invoke('center-command-v3'");

const shell='<div class="kcc" data-center-console-v2>';
const roShell='<div class="kcc" data-center-console-v2 data-kcc-readonly="${c&&!c.can_manage?\'1\':\'0\'}">';
if(!center.includes(shell))throw new Error('[center-role-final] center shell target missing');
center=center.replace(shell,roShell);

if(!center.includes('centerRoleFinalStyle')){
  center += `\n(function(){const s=document.createElement('style');s.id='centerRoleFinalStyle';s.textContent='.kcc[data-kcc-readonly="1"] [data-kcc-tab="team"],.kcc[data-kcc-readonly="1"] [data-kcc-tab="profile"],.kcc[data-kcc-readonly="1"] [data-kcc-assign]{display:none!important}.kcc[data-kcc-readonly="1"] .kcc-mapbox [data-kcc-tab="profile"]{display:none!important}';document.head.appendChild(s)})();\n`;
}
await writeFile(centerPath,center,'utf8');

const agenda=await readFile(agendaPath,'utf8');
const checks=[
 ['Centre reads through role-aware v3',center.includes("functions.invoke('center-command-v3'")&&!center.includes("functions.invoke('center-command-v2'"))],
 ['Centre marks read-only staff',center.includes('data-kcc-readonly="${c&&!c.can_manage')],
 ['read-only staff cannot see manager tabs',center.includes('[data-kcc-tab="team"]')&&center.includes('[data-kcc-tab="profile"]')],
 ['read-only staff cannot reassign professionals',center.includes('[data-kcc-assign]')],
 ['Agenda shows public center content',agenda.includes('ag4-place-copy')&&agenda.includes('x.public_description')],
 ['Agenda reacts to center directory updates',agenda.includes('komo:center-directory-updated')],
 ['Agenda prioritizes saved coordinates',agenda.includes('Number.isFinite(Number(x.latitude))')&&agenda.includes('Number(x.longitude)')]
];
for(const [label,ok] of checks)console.log(`[center-role-final] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[center-role-final] Centre role model + patient map content finalized.');
