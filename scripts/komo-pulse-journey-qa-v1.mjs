import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
const site=join(process.cwd(),'site');
const page=await readFile(join(site,'parcours','index.html'),'utf8');
const home=await readFile(join(site,'index.html'),'utf8');
const pulse=await readFile(join(site,'pulse-v14','app.js'),'utf8');
const journeyCss=await readFile(join(site,'parcours','experience.css'),'utf8');
const journeyJs=await readFile(join(site,'parcours','experience.js'),'utf8');
const checks=[
 ['route exists',page.includes('Votre parcours KŌMØ Motion')],
 ['five steps', ['RÉSERVER','SE CONNECTER','PRÉPARER','MESURER','SUIVRE'].every(x=>page.includes(x))],
 ['Pulse canonical',page.includes('https://pulse.komolongevity.com/')&&pulse.includes('JOURNEY_URL')],
 ['reservation',page.includes('app.acuityscheduling.com/schedule.php?owner=40696577')],
 ['home bridge',home.includes('komo-pulse-journey-bridge')&&home.includes('/parcours/')],
 ['admin preview',pulse.includes('openPatientPreview(id)')&&pulse.includes('previewMode')&&pulse.includes('closePatientPreview()')],
 ['admin scoped',pulse.includes("S.patients.find(p=>p.id===id)")&&pulse.includes('Aperçu patient · Lecture seule')],
 ['no preview writes',pulse.includes("if(S.previewMode){toast('Aperçu en lecture seule")],
 ['preview questionnaire readonly',pulse.includes("form.querySelectorAll('input,textarea,select,button').forEach(el=>el.disabled=true)")],
 ['honest sync',page.includes('nécessiter une validation et une liaison par l’équipe')],
 ['editorial motion design',page.includes('experience.css')&&journeyCss.includes('journey-photo')],
 ['scroll state without blocking',page.includes('experience.js')&&journeyJs.includes('IntersectionObserver')],
 ['accessibility and contrast',journeyCss.includes('prefers-reduced-motion')&&journeyCss.includes(':focus-visible')]
];
const bad=checks.filter(([,ok])=>!ok).map(([name])=>name);
if(bad.length){console.error('[komo-pulse-journey-qa] failed: '+bad.join(', '));process.exit(1)}
console.log('[komo-pulse-journey-qa] '+checks.length+' checks passed');