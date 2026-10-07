import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root=process.cwd();
const html=await readFile(join(root,'site','pulse-v14','index.html'),'utf8');
const app=await readFile(join(root,'site','pulse-v14','app.js'),'utf8');
const css=await readFile(join(root,'site','pulse-v14','styles.css'),'utf8');

const checks=[
 ['patient title',html.includes('Votre santé en mouvement')],
 ['single entry script',(html.match(/<script/g)||[]).length===1],
 ['patient navigation',['Aujourd’hui','Mon bilan','Résultats','Mon plan','Rendez-vous'].every(x=>app.includes(x))],
 ['human next action',app.includes('VOTRE PROCHAINE ÉTAPE')&&app.includes('nextAction')],
 ['four-step journey',app.includes('4 étapes terminées')&&app.includes('Prise de sang')&&app.includes('Mesures de mouvement')],
 ['friendly results',app.includes('Votre point fort')&&app.includes('Votre priorité')],
 ['plan journey',app.includes('Installer les bases')&&app.includes('Renforcer')&&app.includes('Transférer')],
 ['operator preserved',app.includes('D0 ·')===false&&app.includes('Session D0')&&app.includes('finalize_pulse_operator_session_v1')],
 ['motion v1 only',app.includes("motion-v1.0")&&!/myodev|myocare/i.test(app)],
 ['responsive',css.includes('@media(max-width:700px)')&&css.includes('@media(max-width:1000px)')],
 ['reduced motion',css.includes('prefers-reduced-motion')]
];
const failed=checks.filter(([,ok])=>!ok).map(([name])=>name);
if(failed.length){console.error('[pulse-v14-qa] failed: '+failed.join(', '));process.exit(1)}
console.log('[pulse-v14-qa] '+checks.length+' patient-first checks passed');
