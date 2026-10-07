import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root=process.cwd();
const html=await readFile(join(root,'site','pulse-v13','index.html'),'utf8');
const app=await readFile(join(root,'site','pulse-v13','app.js'),'utf8');
const css=await readFile(join(root,'site','pulse-v13','styles.css'),'utf8');
const vercel=JSON.parse(await readFile(join(root,'vercel.json'),'utf8'));
const middleware=await readFile(join(root,'middleware.js'),'utf8');

const rewrites=Array.isArray(vercel.rewrites)?vercel.rewrites:[];
const hostRule=r=>Array.isArray(r?.has)&&r.has.some(h=>h?.type==='host'&&h?.value==='pulse.komolongevity.com');
const rootV13=rewrites.some(r=>r.source==='/'&&['/pulse-v13/','/pulse-v14/'].includes(r.destination)&&hostRule(r));
const nestedV13=rewrites.some(r=>r.source==='/(.*)'&&['/pulse-v13/$1','/pulse-v14/$1'].includes(r.destination)&&hostRule(r));

const checks=[
 ['V13 HTML title',html.includes('<title>KŌMØ Pulse</title>')],
 ['single application entry',html.includes('./app.js')&&(html.match(/<script/g)||[]).length===1],
 ['single V13 stylesheet',html.includes('./styles.css')],
 ['no legacy Myodev/Myocare HTML',!/myodev|myocare|clinical-motion-v1/i.test(html)],
 ['V1 protocol only',app.includes("protocol_version','motion-v1.0")||app.includes("protocol_version','motion-v1.0'")],
 ['V1 score only',app.includes("algorithm_version','motion-score-v1.0")],
 ['Operator console present',app.includes('D0 · Operator Console')],
 ['Motion Age not surfaced',!app.includes('motion_age')],
 ['VALD devices present',['SmartSpeed','ForceDecks','HumanTrak','DynaMo'].every(x=>app.includes(x))],
 ['responsive app',css.includes('@media(max-width:980px)')],
 ['Pulse host root uses V13 or newer',rootV13],
 ['Pulse host nested uses V13 or newer',nestedV13],
 ['middleware uses V13 or newer',middleware.includes("[PULSE_HOST]: { prefix: '/pulse-v13'")||middleware.includes("[PULSE_HOST]: { prefix: '/pulse-v14'")]
];
const failed=checks.filter(([,ok])=>!ok).map(([n])=>n);
if(failed.length){console.error('[pulse-v13-qa] failed: '+failed.join(', '));process.exit(1)}
console.log('[pulse-v13-qa] '+checks.length+' checks passed · clean V13 canonical routing verified.');
