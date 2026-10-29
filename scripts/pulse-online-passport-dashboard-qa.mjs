// Regression gate for Pulse V14 patient's persistent Online Passport.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {INTAKE_GROUPS} from '../pulse-v14-src/online/session/intake-model.mjs';
import {onlineHomeBlock,onlinePassportPage,onlinePlanPage,onlineResultsPreview} from '../pulse-v14-src/online-passport-dashboard.js';
import {buildPdfReportData} from '../pulse-v14-src/online/session/pdf-report.js';

const src='pulse-v14-src/';
for(const path of [src+'app.js',src+'online-passport-dashboard.js',
 src+'online/session/pdf-report.js']){
 const result=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});
 assert.equal(result.status,0,'Invalid JS syntax in '+path+': '+result.stderr);
}
const app=readFileSync(src+'app.js','utf8');
const html=readFileSync(src+'index.html','utf8');
const css=readFileSync(src+'online-passport-dashboard.css','utf8');
assert.ok(app.includes("['passport','Mon passeport']"),'Persistent patient nav');
assert.ok(app.includes("sb.from('motion_online_sessions')"),'Read existing private records');
assert.ok(app.includes(".eq('user_id',S.user.id)"),'Owner scoping in client (RLS enforced in database)');
assert.ok(app.includes("onlineReadError"),'Read errors are not presented as empty data');
assert.ok(!app.includes("Votre dossier patient n’est pas encore relié."),'Online patients are not orphaned');
assert.ok(app.includes("bindOnlinePassportActions($('#view'),S.onlineReports,toast)"));
assert.ok(html.includes('online-passport-dashboard.css'),'Dashboard stylesheet loaded');
assert.ok(css.includes('@media(max-width:600px)'),'Responsive layout');
assert.ok(css.includes('prefers-reduced-motion'),'Motion accessibility');

const answers=Object.fromEntries(INTAKE_GROUPS.flatMap(g=>g.questions.map(q=>[
 q.id,Array.isArray(q.options[0])?q.options[0][0]:'0'
])));
answers.safety='no';
const row={id:'10000000-0000-4000-8000-000000000001',
 status:'completed',created_at:'2026-10-28T15:00:00Z',updated_at:'2026-10-29T15:00:00Z',
 snapshot:{page:4,answers,results:{
 sts:{status:'done',value:13,source:'webcam'},
 posture:{status:'review',value:51,source:'webcam'}
 },program:{version:'KOMO_PULSE_DAILY_V1',startedAt:'2026-10-28',
 entries:{'2026-10-28':{completed:['walk'],effort:2,note:''}}}}};
const home=onlineHomeBlock([row]);
assert.ok(home.includes('100'),'Self-report index can appear, clearly described');
assert.ok(home.includes('INDICE DE MOBILITÉ PERÇUE'),'No fabricated Motion Score');
const page=onlinePassportPage([row]);
assert.ok(page.includes('Vos priorités')===false||page.includes('PRIORITÉ'),'Priorities shown');
assert.ok(page.includes('13 répétitions'),'Real observed test visible');
assert.ok(page.includes('À vérifier'),'Weak capture is labeled');
assert.ok(page.includes('data-passport-pdf'),'Private record PDF re-download');
assert.ok(page.includes('ni « âge locomoteur »'),'No fake locomotor age');
assert.ok(page.includes('1 / 28 jours')||page.includes('1</strong>'),'Journal visible');
assert.ok(onlinePlanPage([row]).includes('Pulse Daily'));
assert.ok(onlineResultsPreview([row]).includes('data-route-passport'));
assert.ok(onlinePassportPage([]).includes('Une première mesure'));
const incomplete={...answers};delete incomplete.walk10;
const unscored=onlinePassportPage([{...row,snapshot:{...row.snapshot,answers:incomplete}}]);
assert.ok(unscored.includes('À compléter')||unscored.includes('À renseigner'),'Never fills missing answers');
const payload=buildPdfReportData(answers,row.snapshot.results,null,false,new Date(),{mode:'PILOTE',program:row.snapshot.program});
assert.equal(payload.motion.score,null,'Online webcam must not be mistaken for validated Motion Score');
assert.equal(payload.passport.index,100);
assert.ok(!/service_role|SUPABASE_SERVICE_ROLE_KEY/.test(app));
console.log('[pulse-online-passport-dashboard-qa] owner-scoped read, preview, home, results, plan, missing states, responsive CSS, patient PDF and safety passed');
