import { readFile, writeFile } from 'node:fs/promises';
const path = 'pulse-app/app.js';
let src = await readFile(path, 'utf8');
src = src.replace("return['home','results','path','documents','explore','clinical','profile'].includes(route)?route:'home'", "if(route==='admin'&&state.role!=='admin')return'home';return['home','results','path','documents','explore','clinical','profile','admin'].includes(route)?route:'home'");
src = src.replace("profile:['VOTRE COMPTE','Profil & accès.',renderProfile]};", "profile:['VOTRE COMPTE','Profil & accès.',renderProfile],admin:['KŌMØ · ADMIN','Console KŌMØ',()=>'<div data-admin-route-mount></div>']};");
await writeFile(path, src);
console.log('[admin-route-fix-v1] admin route enabled');