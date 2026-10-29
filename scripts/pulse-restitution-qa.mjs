// KŌMØ: optional human video restitution must never block first-passport delivery.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {formatRestitutionDate,restitutionMarkup} from '../pulse-v14-src/online/session/restitution.mjs';
import {verifyPaidSession} from '../pulse-v14-src/online/session/paid-access.js';
import {onlineHomeBlock,onlinePassportPage} from '../pulse-v14-src/online-passport-dashboard.js';
import {INTAKE_GROUPS} from '../pulse-v14-src/online/session/intake-model.mjs';
import {reportMarkup} from '../pulse-v14-src/online/session/intake-report.js';

assert.ok(formatRestitutionDate('2026-11-06T14:00:00+0100')?.includes('6 novembre 2026'));
assert.equal(formatRestitutionDate('nonsense'),null);
assert.equal(formatRestitutionDate(null),null);
const html=restitutionMarkup({appointmentAt:'2026-11-06T14:00:00+0100',appointmentId:'8675309',appointmentMinutes:30});
assert.ok(html.includes('6 novembre 2026'));
assert.ok(html.includes('30 min réservées'));
assert.ok(html.includes('/online/activate/?appointment=8675309'));
assert.ok(html.includes('mais facultatif'));
assert.ok(html.includes('premier passeport, immédiatement'));
assert.ok(!/consultation médicale\./i.test(html.replace("Il ne s’agit pas d’une consultation médicale.","")));
const compact=restitutionMarkup({appointmentAt:'2026-11-06T14:00:00+0100',compact:true});
assert.ok(compact.includes('Le premier rapport arrive immédiatement'));
assert.ok(!compact.includes('class="rest-steps"'));
assert.ok(restitutionMarkup().includes('confirmation de réservation Acuity'));
assert.ok(!restitutionMarkup({appointmentId:'<img>'}).includes('href="/online/activate/?appointment='));
const paid=async()=>({ok:true,status:200,json:async()=>({eligible:true,paid:true,canStart:true,appointmentAt:'2026-11-06T14:00:00+0100',appointmentMinutes:30})});
const checked=await verifyPaidSession({accessToken:'test.jwt',appointmentId:'8675309',fetcher:paid});
assert.equal(checked.appointmentAt,'2026-11-06T14:00:00+0100');
assert.equal(checked.appointmentMinutes,30);

const answers=Object.fromEntries(INTAKE_GROUPS.flatMap(g=>g.questions.map(q=>[q.id,Array.isArray(q.options[0])?q.options[0][0]:'0'])));
answers.safety='no';
const results={sts:{status:'done',value:12,source:'webcam'}};
const report=reportMarkup(answers,results,false,true,null,{appointmentAt:checked.appointmentAt,appointmentId:checked.appointmentId});
assert.ok(report.indexOf('VOTRE RENDEZ-VOUS DE RESTITUTION')>0);
assert.ok(report.includes('Télécharger mon passeport PDF'));
assert.ok(report.includes('href="/#passport"'));
const demo=reportMarkup(answers,results,false,false);
assert.ok(!demo.includes('VOTRE RENDEZ-VOUS DE RESTITUTION'),'demo must not promise a booked human call');
const row={id:'a',status:'completed',appointment_id:'8675309',created_at:'2026-10-29T14:00:00Z',snapshot:{page:4,answers,results}};
const dashboard=onlineHomeBlock([row]),passport=onlinePassportPage([row]);
assert.ok(dashboard.includes('VOTRE RENDEZ-VOUS DE RESTITUTION'));
assert.ok(passport.includes('Vos résultats d’abord. Notre échange ensuite.'));
assert.ok(passport.includes('Vérifier mon créneau Acuity'));
assert.ok(passport.includes('INDICE DE MOBILITÉ PERÇUE'));

const activation=readFileSync('pulse-v14-src/online/activate/app.js','utf8');
const session=readFileSync('pulse-v14-src/online/session/app.js','utf8');
const api=readFileSync('api/pulse-online-verify.js','utf8');
assert.ok(activation.includes('appointmentAt:result.appointmentAt'));
assert.ok(session.includes('appointmentAt:verified.appointmentAt'));
assert.ok(api.includes("const appointmentAt=rawStart.length<=65"),'server does not disclose before paid eligibility');
const css=readFileSync('pulse-v14-src/online/session/restitution.css','utf8');
assert.ok(css.includes('@media(max-width:680px)'),'mobile timeline responsive');
for(const f of ['pulse-v14-src/index.html','pulse-v14-src/online/activate/index.html','pulse-v14-src/online/session/index.html']){
 assert.ok(readFileSync(f,'utf8').includes('restitution.css'),'missing stylesheet: '+f);
}
for(const f of ['pulse-v14-src/online/session/restitution.mjs','pulse-v14-src/online/session/app.js','pulse-v14-src/online/activate/app.js','pulse-v14-src/online-passport-dashboard.js']){
 const r=spawnSync(process.execPath,['--check',f],{encoding:'utf8'});
 assert.equal(r.status,0,'Invalid JS in '+f+': '+r.stderr);
}
console.log('[pulse-restitution-qa] PASS · verified slot, no fabricated time, optional debrief, PDF without live requirement, dashboard+passport and mobile');
