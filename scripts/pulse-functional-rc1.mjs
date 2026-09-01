import { access, copyFile, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const source=join(root,'pulse-app','pulse-functional-rc1.js');
const ownerGuardSource=join(root,'pulse-app','center-owner-ui-guard-v1.js');
const centerCommandSource=join(root,'supabase','functions','center-command-v2','index.ts');
const navSource=join(root,'pulse-app','patient-navigation-core-v1.js');
const targetDir=join(root,'site','pulse-v12');
const target=join(targetDir,'pulse-functional-rc1.js');
const ownerGuardTarget=join(targetDir,'center-owner-ui-guard-v1.js');
const indexPath=join(targetDir,'index.html');
const appRouterPath=join(targetDir,'app-router-v2.js');
const appPath=join(targetDir,'app.js');
const runtimePath=join(targetDir,'runtime.js');
const profilePath=join(targetDir,'profile-v2.js');
const resetIndexPath=join(targetDir,'reset','index.html');
const resetJsPath=join(targetDir,'reset','reset.js');
const RELEASE='20260901-motion-v4-functional';
const ownerTag=`<script src="./center-owner-ui-guard-v1.js?v=${RELEASE}"></script>`;
const tag=`<script src="./pulse-functional-rc1.js?v=${RELEASE}"></script>`;

await Promise.all([
  access(source),access(ownerGuardSource),access(centerCommandSource),access(indexPath),access(navSource),access(appRouterPath),
  access(appPath),access(runtimePath),access(profilePath),access(resetIndexPath),access(resetJsPath)
]);
await Promise.all([copyFile(source,target),copyFile(ownerGuardSource,ownerGuardTarget)]);

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
html=html.replace(/\s*<script[^>]+src="\.\/center-owner-ui-guard-v1\.js(?:\?[^\"]*)?"[^>]*><\/script>/g,'');
html=html.replace('</body>',`  ${ownerTag}\n  ${tag}\n</body>`);
await writeFile(indexPath,html,'utf8');

const [finalHtml,rc1,ownerGuard,centerCommand,nav,finalRouter,app,runtime,profile,resetIndex,resetJs]=await Promise.all([
  readFile(indexPath,'utf8'),
  readFile(target,'utf8'),
  readFile(ownerGuardTarget,'utf8'),
  readFile(centerCommandSource,'utf8'),
  readFile(navSource,'utf8'),
  readFile(appRouterPath,'utf8'),
  readFile(appPath,'utf8'),
  readFile(runtimePath,'utf8'),
  readFile(profilePath,'utf8'),
  readFile(resetIndexPath,'utf8'),
  readFile(resetJsPath,'utf8')
]);

const failures=[];
const ok=(label,value)=>{if(!value)failures.push(label);else console.log(`[pulse-functional-rc1] OK · ${label}`)};

const scripts=[...finalHtml.matchAll(/<script[^>]+src="([^"]+)"[^>]*><\/script>/g)].map(x=>x[1]);
ok('RC1 runtime copied',rc1.includes("const VERSION='1.1.0'"));
ok('RC1 runtime loaded last',scripts.at(-1)?.startsWith('./pulse-functional-rc1.js'));
ok('center owner UI guard is loaded immediately before RC1',scripts.at(-2)?.startsWith('./center-owner-ui-guard-v1.js'));
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

// Ownership is a backend boundary, not a visual convention. Clinical admins may
// manage a center but cannot promote, modify or remove an owner membership.
ok('center backend defines explicit ownership permission',centerCommand.includes('canManageOwnership'));
ok('center backend rejects unauthorized owner mutation',centerCommand.includes('owner_role_required'));
ok('center backend protects owner on update and removal',centerCommand.includes('current.data.role==="owner"||role==="owner"')&&centerCommand.includes('current.data.role==="owner"&&!(await canManageOwnership(oid))'));
ok('center creation cleans partial setup failures',centerCommand.includes('center_services_failed')&&centerCommand.includes('center_hours_failed')&&centerCommand.includes('await cleanup()'));
ok('center UI removes owner escalation from non-owner managers',ownerGuard.includes("o.value==='owner'")&&ownerGuard.includes('targetOwner')&&ownerGuard.includes('canOwn'));

// Auth/account contracts: these checks prevent a visually working login/reset/profile
// surface from shipping without the actual Supabase actions behind it.
ok('login submits to Supabase password auth',app.includes('auth.signInWithPassword'));
ok('signup submits to Supabase Auth',app.includes('auth.signUp'));
ok('forgot password is routed to dedicated reset screen',runtime.includes('resetPasswordForEmail')&&runtime.includes('resetUrl'));
ok('reset page exists and loads recovery runtime',resetIndex.includes('./reset.js'));
ok('reset runtime requires an authenticated recovery session',resetJs.includes('auth.getSession()'));
ok('reset runtime writes the new password',resetJs.includes('auth.updateUser({ password: password.value })'));
ok('profile persists to profiles table',profile.includes("from('profiles').update"));
ok('profile email change uses Supabase Auth',profile.includes('auth.updateUser({email:next})'));
ok('profile password reset returns to dedicated reset screen',profile.includes('resetPasswordForEmail')&&profile.includes('resetUrl'));

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

// Core route owners required for RC1. Motion V4 is the frozen canonical Motion owner.
for(const asset of ['patient-navigation-core-v1.js','motion-hub-v4.js','key-hub-v1.js','trajectory-v3.js','agenda-hub-v4.js','profile-v2.js','patient-canonical-results.js','report-bootstrap-v1.js','pulse-bottom-nav-v6.js','clinical-cockpit-v1.js','center-two-tab-workspace-v1.js','care-messaging-v2.js','admin-console-v2.js','center-owner-ui-guard-v1.js']){
  ok(`core asset loaded: ${asset}`,finalHtml.includes(`./${asset}`));
}
ok('legacy Motion V3 owner is not loaded',!finalHtml.includes('./motion-hub-v3.js'));

if(failures.length){
  console.error(`[pulse-functional-rc1] FAILED · ${failures.join(' | ')}`);
  process.exit(1);
}
console.log(`[pulse-functional-rc1] PASS · ${unique.length} local assets checked · ${jsFiles.length} JS modules scanned · patient/booking/center/ownership/messages/admin/auth/profile routing guarded`);