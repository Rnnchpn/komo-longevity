import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const loader='route-lazy-loader-v1.js';
const release='20260829-lazy-routes-v2';

await copyFile(join(root,'pulse-app',loader),join(pulse,loader));
let html=await readFile(htmlPath,'utf8');

// Keep the clinical and admin stack out of ordinary patient startup.
const groups={
  professional:new Set([
    'clinical-cockpit-v1.js','clinical-cockpit-bridge-v1.js','pro-questionnaire-summary-v1.js',
    'professional-admin-v1.js','professional-scope-v1.js','admin-shortcut-v1.js','admin-ux-v2.js',
    'admin-console-v2.js','admin-patient-manager-v1.js','admin-professionals-v1.js','pro-followup-v1.js',
    'pro-free-summary-v1.js','center-command-cockpit-v2.js','center-profile-v1.js','admin-centers-v1.js',
    'pro-architecture-v2.js','center-workspace-v1.js','center-messaging-v1.js','admin-patient-routing-v2.js',
    'admin-motion-validation-v1.js','center-two-tab-workspace-v1.js','center-patient-polish.js','pro-agenda-dossier-v1.js'
  ]),
  club:new Set(['club-hub-v1.js','club-connections-v1.js']),
  trajectory:new Set(['trajectory-v3.js']),
  agenda:new Set(['agenda-hub-v4.js','agenda-premium-map-v1.js','agenda-clean-room-v1.js'])
};
const fileToGroup=new Map();
for(const [group,files] of Object.entries(groups))for(const file of files)fileToGroup.set(file,group);

const manifest={version:'1.1.0',release,groups:{professional:[],club:[],trajectory:[],agenda:[]}};
const scriptRe=/\s*<script([^>]*)src="([^"]+)"([^>]*)><\/script>/g;
html=html.replace(scriptRe,(full,before,src,after)=>{
  const file=src.split('/').pop().split('?')[0],group=fileToGroup.get(file);
  if(!group)return full;
  const attrs=`${before} ${after}`;
  manifest.groups[group].push({src,type:/type\s*=\s*["']module["']/i.test(attrs)?'module':'classic'});
  return '';
});

const expected={professional:23,club:2,trajectory:1,agenda:3};
for(const [group,count] of Object.entries(expected)){
  if(manifest.groups[group].length!==count)throw new Error(`[pulse-route-lazy] ${group}: expected ${count}, found ${manifest.groups[group].length}`);
}

html=html
  .replace(/\s*<script id="komoLazyRouteManifest" type="application\/json">[\s\S]*?<\/script>/g,'')
  .replace(/\s*<script src="\.\/route-lazy-loader-v1\.js(?:\?[^\"]*)?"><\/script>/g,'');

const payload=JSON.stringify(manifest).replaceAll('<','\\u003c');
html=html.replace('</body>',`  <script id="komoLazyRouteManifest" type="application/json">${payload}</script>\n  <script src="./${loader}?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

const total=Object.values(manifest.groups).reduce((n,x)=>n+x.length,0);
const eagerCount=(html.match(/<script\b/g)||[]).length;
console.log(`[pulse-route-lazy] deferred ${total} route modules · professional ${manifest.groups.professional.length} · club ${manifest.groups.club.length} · trajectory ${manifest.groups.trajectory.length} · agenda ${manifest.groups.agenda.length} · ${eagerCount} boot script tags · ${release}`);
