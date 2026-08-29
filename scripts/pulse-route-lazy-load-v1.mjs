import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const loader='route-lazy-loader-v1.js';
const release='20260829-lazy-routes-v1';

await copyFile(join(root,'pulse-app',loader),join(pulse,loader));
let html=await readFile(htmlPath,'utf8');

// Conservative first pass: remove only modules dedicated to professional,
// centre and admin workspaces. Auth, patient shell, Motion, booking, profile,
// KEY and shared data runtimes stay eager.
const professional=new Set([
  'clinical-cockpit-v1.js',
  'clinical-cockpit-bridge-v1.js',
  'pro-questionnaire-summary-v1.js',
  'professional-admin-v1.js',
  'professional-scope-v1.js',
  'admin-shortcut-v1.js',
  'admin-ux-v2.js',
  'admin-console-v2.js',
  'admin-patient-manager-v1.js',
  'admin-professionals-v1.js',
  'pro-followup-v1.js',
  'pro-free-summary-v1.js',
  'center-command-cockpit-v2.js',
  'center-profile-v1.js',
  'admin-centers-v1.js',
  'pro-architecture-v2.js',
  'center-workspace-v1.js',
  'center-messaging-v1.js',
  'admin-patient-routing-v2.js',
  'admin-motion-validation-v1.js',
  'center-two-tab-workspace-v1.js',
  'center-patient-polish.js',
  'pro-agenda-dossier-v1.js'
]);

const manifest={version:'1.0.0',release,groups:{professional:[]}};
const scriptRe=/\s*<script([^>]*)src="([^"]+)"([^>]*)><\/script>/g;
html=html.replace(scriptRe,(full,before,src,after)=>{
  const file=src.split('/').pop().split('?')[0];
  if(!professional.has(file))return full;
  const attrs=`${before} ${after}`;
  manifest.groups.professional.push({src,type:/type\s*=\s*["']module["']/i.test(attrs)?'module':'classic'});
  return '';
});

if(manifest.groups.professional.length<18){
  throw new Error(`[pulse-route-lazy] only ${manifest.groups.professional.length} professional scripts found; refusing partial optimization`);
}

// Remove a previous copy if a concurrent build layer already injected it.
html=html
  .replace(/\s*<script id="komoLazyRouteManifest" type="application\/json">[\s\S]*?<\/script>/g,'')
  .replace(/\s*<script src="\.\/route-lazy-loader-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');

const payload=JSON.stringify(manifest).replaceAll('<','\\u003c');
html=html.replace('</body>',`  <script id="komoLazyRouteManifest" type="application/json">${payload}</script>\n  <script src="./${loader}?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const eagerCount=(html.match(/<script\b/g)||[]).length;
console.log(`[pulse-route-lazy] deferred ${manifest.groups.professional.length} professional scripts · ${eagerCount} script tags remain in boot HTML · ${release}`);
