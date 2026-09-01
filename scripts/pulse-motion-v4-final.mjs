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
const oldRoutes="return['home','results','path','documents','explore','clinical','profile'].includes(route)?route:'home'";
const newRoutes="return['home','results','path','documents','explore','clinical','profile','motion'].includes(route)?route:'home'";
if(app.includes(oldRoutes))app=app.replace(oldRoutes,newRoutes);
else if(!app.includes(newRoutes))throw new Error('Base router route whitelist changed; Motion host cannot be installed safely');
const oldPages='const pages={home:';
const newPages="const pages={motion:['KŌMØ PULSE · MOTION','Motion',()=>'<div data-motion-host-v4></div>'],home:";
if(app.includes(oldPages))app=app.replace(oldPages,newPages);
else if(!app.includes(newPages))throw new Error('Base router page registry changed; Motion host cannot be installed safely');
await writeFile(appPath,app,'utf8');

const v3=(html.match(/motion-hub-v3\.js/g)||[]).length;
const v4=(html.match(/motion-hub-v4\.js/g)||[]).length;
if(v3!==0)throw new Error(`Motion V3 runtime still present (${v3})`);
if(v4!==1)throw new Error(`Expected one Motion V4 runtime owner, found ${v4}`);
if(!html.includes('motion-route-guard-v4.js'))throw new Error('Motion route guard v4 missing');
if(!app.includes(newRoutes)||!app.includes('data-motion-host-v4'))throw new Error('Motion base-router host missing');
if(/pages\[route\]\|\|pages\.home/.test(app)&&!app.includes("'motion'].includes(route)"))throw new Error('Motion can still fall through to Home');

console.log('[pulse-motion-v4-final] canonical Motion interpretation hub active · explicit base-router host · legacy Motion hub removed from runtime');
