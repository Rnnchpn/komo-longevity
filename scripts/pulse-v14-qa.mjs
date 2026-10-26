import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const root=process.cwd();
const html=await readFile(join(root,'site','pulse-v14','index.html'),'utf8');
const app=await readFile(join(root,'site','pulse-v14','app.js'),'utf8');
const css=await readFile(join(root,'site','pulse-v14','styles.css'),'utf8');
const vercel=JSON.parse(await readFile(join(root,'vercel.json'),'utf8'));
const middleware=await readFile(join(root,'middleware.js'),'utf8');
const rewrites=Array.isArray(vercel.rewrites)?vercel.rewrites:[];
const hostRule=r=>Array.isArray(r?.has)&&r.has.some(h=>h?.type==='host'&&h?.value==='pulse.komolongevity.com');
const rootV14=rewrites.some(r=>r.source==='/'&&r.destination==='/pulse-v14/'&&hostRule(r));
const nestedV14=rewrites.some(r=>r.source==='/(.*)'&&r.destination==='/pulse-v14/$1'&&hostRule(r));

const checks=[
 ['patient title',html.includes('Votre santé en mouvement')],
 ['single entry script',(html.match(/<script/g)||[]).length===1],
 ['patient navigation',['Accueil','Résultats','Connected','Rendez-vous','My KŌMØ'].every(x=>app.includes(x))],
 ['human next action',app.includes('VOTRE PROCHAINE ACTION')&&app.includes('nextAction')],
 ['Motion-only journey',app.includes('p.steps.length')&&app.includes('Pré-bilan')&&app.includes('Motion')&&app.includes('Résultats')&&!app.includes("label:'Prise de sang'")],
 ['patient welcome',app.includes('Bienvenue sur KŌMØ Pulse')&&app.includes('ph-hero')&&app.includes('ph-next')],
 ['six saved questionnaires',app.includes('async function questionnaires()')&&app.includes("['KOMO_BASELINE_CORE'")&&app.includes('questionnaire_responses')&&app.includes('Enregistrer et terminer')],
 ['protected contexts',app.includes('selfPatient:null')&&app.includes("S.selfPatient")&&app.includes('function admin()')],
 ['fixed mobile tabs',css.includes('.sidebar nav{display:grid;grid-template-columns:repeat(5')&&css.includes('env(safe-area-inset-bottom)')],
 ['friendly results',app.includes('Votre point fort')&&app.includes('Votre priorité')],
 ['plan journey',app.includes('Installer les bases')&&app.includes('Renforcer')&&app.includes('Transférer')],
 ['operator preserved',app.includes('D0 ·')===false&&app.includes('Session D0')&&app.includes('finalize_pulse_operator_session_v1')],
 ['motion v1 only',app.includes("motion-v1.0")&&!/myodev|myocare/i.test(app)],
 ['responsive',css.includes('@media(max-width:700px)')&&css.includes('@media(max-width:1000px)')],
 ['reduced motion',css.includes('prefers-reduced-motion')],
 ['canonical root is V14',rootV14],
 ['canonical nested routes are V14',nestedV14],
 ['middleware points to V14',middleware.includes("[PULSE_HOST]: { prefix: '/pulse-v14'")]
];
const failed=checks.filter(([,ok])=>!ok).map(([name])=>name);
if(failed.length){console.error('[pulse-v14-qa] failed: '+failed.join(', '));process.exit(1)}
console.log('[pulse-v14-qa] '+checks.length+' patient-first checks passed');
