import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),pulse=path.join(root,'site','pulse-v12');
const html=fs.readFileSync(path.join(pulse,'index.html'),'utf8');
const css=fs.readFileSync(path.join(pulse,'pulse-ui-v1.css'),'utf8');
const home=fs.readFileSync(path.join(pulse,'my-komo-home-v1.js'),'utf8');
const avatar=fs.readFileSync(path.join(pulse,'profile-avatar-v1.js'),'utf8');
const plus=fs.readFileSync(path.join(pulse,'adaptive-plus-v1.js'),'utf8');
const checks=[
 ['My Komo home script loaded',html.includes('./my-komo-home-v1.js')],
 ['profile avatar script loaded',html.includes('./profile-avatar-v1.js')],
 ['refined Plus script loaded',html.includes('./adaptive-plus-v1.js')],
 ['My Komo styles bundled',css.includes('MY KŌMØ home + profile avatar + Plus menu')],
 ['three circular score gauges',home.includes("ring('Start'")&&home.includes("ring('Motion'")&&home.includes("ring('Clinical'")],
 ['next appointment summary',home.includes('PROCHAIN RENDEZ-VOUS')&&home.includes('organization_appointments')],
 ['engagement XP is separate progression',home.includes('PROGRESSION KŌMØ')&&home.includes('XP')],
 ['secure avatar bucket used',avatar.includes("storage.from('profile-avatars')")&&avatar.includes('avatar_path')],
 ['admin access explicit in Plus',plus.includes('Administration KŌMØ')&&plus.includes("data-kam-action=\"${action}\"")]
];
for(const [label,ok] of checks){console.log(`[pulse-my-komo-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exit(1)}
console.log(`[pulse-my-komo-qa] ${checks.length} checks passed.`);
