import { rm, mkdir, cp, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root=process.cwd();
const src=join(root,'pulse-v13-src');
const out=join(root,'site','pulse-v13');

await rm(out,{recursive:true,force:true});
await mkdir(out,{recursive:true});
await cp(src,out,{recursive:true});

const appPath=join(out,'app.js');
const extensionPath=join(src,'operator-finalize-extension.js');
const appSource=await readFile(appPath,'utf8');
const remoteImport="import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';";
if(!appSource.includes(remoteImport))throw new Error('[pulse-v13] expected external Supabase import missing');
let safeApp=appSource.replace(remoteImport,"import { createClient } from './supabase-local-v13.js';");
// Supabase Auth's persistent-session lock may stall on Safari after a tab crash.
// A bounded wait allows the existing login screen to recover without deleting or migrating sessions.
const authSession="const session=(await sb.auth.getSession()).data.session;";
if(!safeApp.includes(authSession))throw new Error('[pulse-v13] boot session anchor missing');
safeApp=safeApp.replace(authSession,`const session=(await Promise.race([sb.auth.getSession(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('La récupération de votre session a expiré. Rechargez Pulse pour réessayer.')),12000))])).data.session;`);
const extensionSource=await readFile(extensionPath,'utf8');
await writeFile(appPath, safeApp+'\n'+extensionSource, 'utf8');
// Keep the Supabase library on our own origin; external esm.sh fails intermittently on Safari.
await cp(join(root,'node_modules','@supabase','supabase-js','dist','umd','supabase.js'),join(out,'supabase-umd-v13.js'));
await writeFile(join(out,'supabase-local-v13.js'),
  "const api=globalThis.supabase;\nif(!api?.createClient)throw new Error('KOMO Pulse: module de connexion indisponible.');\nexport const createClient=api.createClient.bind(api);\n",
  'utf8');

let html=await readFile(join(out,'index.html'),'utf8');
const emptyRoot='<div id="app"></div>';
if(!html.includes(emptyRoot))throw new Error('[pulse-v13] startup container missing');
html=html.replace(emptyRoot,`<div id="app"><section id="komo-boot-status" role="status" aria-live="polite" style="min-height:100dvh;background:#f3f1eb;color:#17221a;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;padding:24px;text-align:center;font-family:system-ui,-apple-system,sans-serif"><strong style="font-size:27px;letter-spacing:.2em">KŌMØ</strong><span style="font-size:11px;letter-spacing:.16em">PULSE</span><p id="komo-boot-message" style="font-size:14px;line-height:1.6">Ouverture sécurisée de votre espace…</p><button id="komo-boot-retry" type="button" style="display:none;background:#17221a;color:#fff;border:0;border-radius:12px;padding:12px 22px;font-size:14px">Recharger Pulse</button></section></div>`);
const moduleTag='<script type="module" src="./app.js"></script>';
if(!html.includes(moduleTag))throw new Error('[pulse-v13] app module anchor missing');
const startFallback=`<script src="./supabase-umd-v13.js"></script>
<script>
(function(){
  setTimeout(function(){
    var message=document.getElementById('komo-boot-message');
    if(!message)return;
    message.textContent='Pulse ne parvient pas à terminer son chargement. Aucun dossier patient n’a été modifié.';
    var retry=document.getElementById('komo-boot-retry');
    if(retry){retry.style.display='inline-block';retry.addEventListener('click',function(){window.location.reload();},{once:true});}
  },12000);
})();
</script>
`;
html=html.replace(moduleTag,startFallback+moduleTag);
await writeFile(join(out,'index.html'),html,'utf8');
for(const required of ['./styles.css','./app.js','KŌMØ Pulse']){
  if(!html.includes(required))throw new Error('[pulse-v13] missing '+required);
}
console.log('[pulse-v13] locally bundled Supabase, bounded Safari auth bootstrap and visible recovery; patient storage unchanged');
