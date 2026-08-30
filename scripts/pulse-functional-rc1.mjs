import { access, copyFile, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const source=join(root,'pulse-app','pulse-functional-rc1.js');
const navSource=join(root,'pulse-app','patient-navigation-core-v1.js');
const targetDir=join(root,'site','pulse-v12');
const target=join(targetDir,'pulse-functional-rc1.js');
const indexPath=join(targetDir,'index.html');
const appRouterPath=join(targetDir,'app-router-v2.js');
const RELEASE='20260830-rc1-functional-v3';
const tag=`<script src="./pulse-functional-rc1.js?v=${RELEASE}"></script>`;

await Promise.all([access(source),access(indexPath),access(navSource),access(appRouterPath)]);
await copyFile(source,target);

// Messages and Admin are dedicated route owners. The base router must not briefly
// render Home before their dedicated modules take over.
let appRouter=await readFile(appRouterPath,'utf8');
const routeBefore="return['home','results','path','documents','explore','clinical','profile','motion','mykomo','club','key','trajectory'].includes(route)?route:'home'";
const routeAfter="return['home','results','path','documents','explore','clinical','profile','motion','mykomo','club','key','trajectory','messages','admin'].includes(route)?route:'home'";
const externalBefore="if(['motion','mykomo','club','key','trajectory'].includes(route))";
const externalAfter="if(['motion','mykomo','club','key','trajectory','messages','admin'].includes(route))";
if(appRouter.includes(routeBefore))appRouter=appRouter.replace(routeBefore,routeAfter);
if(appRouter.includes(externalBefore))appRouter=appRouter.replace(externalBefore,externalAfter);
await writeFile(appRouterPath,appRouter,'utf8');

let html=await readFile(indexPath,'utf8');
html=html.replace(/\s*<script[^>]+src="\.\/pulse-functional-rc1\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,'');
html=html.replace('</body>',`  ${tag}\n</body>`);
await writeFile(indexPath,html,'utf8');

const [finalHtml,rc1,nav,finalRouter]=await Promise.all([
  readFile(indexPath,'utf8'),
  readFile(target,'utf8'),
  readFile(navSource,'utf8'),
  readFile(appRouterPath,'utf8')
]);

const failures=[];
const ok=(label,value)=>{if(!value)failures.push(label);else console.log(`[pulse-functional-rc1] OK · ${label}`)};

ok('RC1 runtime copied',rc1.includes("const VERSION='1.1.0'"));
ok('RC1 runtime loaded last', [...finalHtml.matchAll(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g)].at(-1)?.[1]?.startsWith('./pulse-functional-rc1.js'));
ok('legacy tests route converges to Results',nav.includes("tests:'results'"));
ok('KEY is a canonical patient route',nav.includes("'key'"));
ok('Messages is recognized by base router',finalRouter.includes("'messages','admin'"));
ok('Messages and Admin use dedicated route owners',finalRouter.includes("'trajectory','messages','admin'].includes(route)"));
ok('test score CTA repaired to Results',rc1.includes('[data-kts-action="score"]')&&rc1.includes("own(event,'results')"));
ok('Motion preparation CTA repaired',rc1.includes('[data-kts-action="prep-motion"]')&&rc1.includes("own(event,'motion')"));
ok('booking CTA pins Motion service',rc1.includes("prepareBooking('motion')")&&rc1.includes("own(event,'documents')"));
ok('canonical result CTAs repaired',rc1.includes('[data-kcanon-home] [data-route="path"]'));
ok('patient report hidden outside Results/Compte',rc1.includes("['results','profile'].includes(route())"));
ok('center appointment form is intercepted',rc1.includes("form.id!=='kcpAppointmentForm'"));
ok('center appointment uses scoped RPC',rc1.includes("client.rpc('create_pulse_appointment'"));
ok('center-created appointment is confirmed',rc1.includes("client.rpc('approve_komo_appointment'"));
ok('Motion episode opens after center booking',rc1.includes("client.rpc('ensure_motion_appointment_episode'"));
ok('Clinical episode opens after center booking',rc1.includes("client.rpc('ensure_clinical_appointment_episode'"));
ok('visible-button diagnostics exposed',rc1.includes('window.KomoFunctionalRC1'));

// Every local script/link referenced by the final Pulse HTML must exist in the build output.
const refs=[...finalHtml.matchAll(/(?:src|href)="\.\/([^"?#]+)(?:[?#][^"]*)?"/g)].map(m=>m[1]);
const unique=[...new Set(refs)];
for(const ref of unique){
  try{await access(join(targetDir,ref))}
  catch{failures.push(`missing built asset: ${ref}`)}
}
ok('all local HTML assets exist',!failures.some(x=>x.startsWith('missing built asset:')));

// Every relative JS import in the final build must resolve to a file.
const files=await readdir(targetDir);
const jsFiles=files.filter(x=>x.endsWith('.js'));
const missingImports=[];
for(const file of jsFiles){
  const text=await readFile(join(targetDir,file),'utf8');
  const imports=[...text.matchAll(/(?:from\s*|import\s*)['"]\.\/([^'"?#]+)(?:[?#][^'"]*)?['"]/g)].map(m=>m[1]);
  for(const dep of imports){
    try{await access(join(targetDir,dep))}
    catch{missingImports.push(`${file} -> ${dep}`)}
  }
}
if(missingImports.length)failures.push(...missingImports.map(x=>`missing JS import: ${x}`));
ok('all relative JS imports resolve',missingImports.length===0);

// Core route owners required for RC1.
for(const asset of ['patient-navigation-core-v1.js','motion-hub-v3.js','key-hub-v1.js','trajectory-v3.js','agenda-hub-v4.js','profile-v2.js','patient-canonical-results.js','report-bootstrap-v1.js','pulse-bottom-nav-v6.js','clinical-cockpit-v1.js','center-two-tab-workspace-v1.js','care-messaging-v2.js','admin-console-v2.js']){
  ok(`core asset loaded: ${asset}`,finalHtml.includes(`./${asset}`));
}

if(failures.length){
  console.error(`[pulse-functional-rc1] FAILED · ${failures.join(' | ')}`);
  process.exit(1);
}
console.log(`[pulse-functional-rc1] PASS · ${unique.length} local assets checked · ${jsFiles.length} JS modules scanned · patient/booking/center/messages/admin routing guarded`);