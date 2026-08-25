import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulseConfig=await readFile(join(root,'pulse-app','content-config.js'),'utf8');
const pulseJs=await readFile(join(root,'pulse-app','ecosystem-v1.js'),'utf8');
const pulseCss=await readFile(join(root,'pulse-app','ecosystem-v1.css'),'utf8');
const publicJs=await readFile(join(root,'site','assets','ecosystem-public-v1.js'),'utf8');
const publicCss=await readFile(join(root,'site','assets','ecosystem-public-v1.css'),'utf8');
const homeFr=await readFile(join(root,'site','fr','index.html'),'utf8');
const checks=[
 ['Pulse loads ecosystem layer',pulseConfig.includes('./ecosystem-v1.js')&&pulseConfig.includes('./ecosystem-v1.css')],
 ['Pulse hides legacy Explorer primary nav',pulseCss.includes('[data-route="explore"]')],
 ['Pulse ecosystem links public Method Library Science Network', ['methode/','/media','science/','network/'].every(x=>pulseJs.includes(x))],
 ['Pulse supports contextual entry routes', ['tests','motion','clinical','professional'].every(x=>pulseJs.includes(x))],
 ['Public site receives global ecosystem assets',homeFr.includes('ecosystem-public-v1.css')&&homeFr.includes('ecosystem-public-v1.js')],
 ['Public site contextual Pulse bridge',publicJs.includes('pulse.komolongevity.com/?entry=')&&publicJs.includes("path.includes('/motion')")&&publicJs.includes("path.includes('/clinical')")],
 ['Public switcher has mobile rules',publicCss.includes('@media(max-width:700px)')]
];
const fail=checks.filter(([,ok])=>!ok).map(([n])=>n);if(fail.length){console.error('[ecosystem-qa-v1] failed: '+fail.join(', '));process.exit(1)}console.log(`[ecosystem-qa-v1] ${checks.length} checks passed.`);