import fs from 'node:fs';
import path from 'node:path';

const htmlPath=path.join(process.cwd(),'site','pulse-v12','index.html');
if(!fs.existsSync(htmlPath))throw new Error('[consultation-prune] Pulse index missing');
let html=fs.readFileSync(htmlPath,'utf8');
const retired=[
  'agenda-hub-v4.js',
  'agenda-premium-map-v1.js',
  'pro-agenda-dossier-v1.js',
  'booking-directory-map-v1.js'
];
for(const file of retired){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\s*<script[^>]+${escaped}[^>]*><\\/script>`,'g'),'');
}
for(const file of ['agenda-hub-v4.css','agenda-premium-map-v1.css','booking-directory-map-v1.css']){
  const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  html=html.replace(new RegExp(`\\s*<link[^>]+${escaped}[^>]*>`,'g'),'');
}
fs.writeFileSync(htmlPath,html);
for(const file of retired)if(html.includes(file))throw new Error('[consultation-prune] legacy runtime still loaded: '+file);
console.log('[consultation-prune] agenda, agenda map and pro agenda runtimes retired from production HTML');
