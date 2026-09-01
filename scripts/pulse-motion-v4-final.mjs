import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'site','pulse-v12');
const indexPath=join(pulse,'index.html');
const appPath=join(pulse,'app.js');
const RELEASE='20260901-motion-v4-final';
let html=await readFile(indexPath,'utf8');

html=html
  .replace(/\s*<script type="module" src="\.\/motion-hub-v3\.js(?:\?[^\"]*)?"><\/script>/g,'')
  .replace(/\s*<script type="module" src="\.\/motion-hub-v4\.js(?:\?[^\"]*)?"><\/script>/g,'');

html=html.replace('</body>',`  <script type="module" src="./motion-hub-v4.js?v=${RELEASE}"></script>\n</body>`);
await writeFile(indexPath,html,'utf8');

let app=await readFile(appPath,'utf8');
const currentRouteBlock=()=>app.match(/function\s+currentRoute\s*\(\)\s*\{[\s\S]*?\n\}/)?.[0]||'';
if(!/[\"']motion[\"']/.test(currentRouteBlock())){
  const routeList=/return\s*\[([^\]]+)\]\.includes\(route\)\s*\?\s*route\s*:\s*['\"]home['\"]/;
  const match=currentRouteBlock().match(routeList);
  if(!match)throw new Error('Base router route whitelist changed; Motion host cannot be installed safely');
  const expanded=match[1].trim().replace(/,\s*$/,'')+",'motion'";
  const patched=currentRouteBlock().replace(routeList,`return[${expanded}].includes(route)?route:'home'`);
  app=app.replace(currentRouteBlock(),patched);
}

if(!app.includes('data-motion-host-v4')){
  const pagesStart='const pages={';
  if(!app.includes(pagesStart))throw new Error('Base router page registry changed; Motion host cannot be installed safely');
  app=app.replace(pagesStart,`${pagesStart}motion:['KŌMØ PULSE · MOTION','Motion',()=>'<div data-motion-host-v4></div>'],`);
}
await writeFile(appPath,app,'utf8');

const v3=(html.match(/motion-hub-v3\.js/g)||[]).length;
const v4=(html.match(/motion-hub-v4\.js/g)||[]).length;
if(v3!==0)throw new Error(`Motion V3 runtime still present (${v3})`);
if(v4!==1)throw new Error(`Expected one Motion V4 runtime owner, found ${v4}`);
if(!html.includes('motion-route-guard-v4.js'))throw new Error('Motion route guard v4 missing');
if(!/[\"']motion[\"']/.test(currentRouteBlock())||!app.includes('data-motion-host-v4'))throw new Error('Motion base-router host missing');

console.log('[pulse-motion-v4-final] canonical Motion interpretation hub active · explicit base-router host · idempotent after route transforms · legacy Motion hub removed from runtime');
