// Acceptance gate: local only, authenticated-admin-only consultation rehearsal.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {DEMO_PATIENT,DEMO_ANSWERS,DEMO_RESULTS,demoPassport,demoSummary,mountConsultationDemo} from '../pulse-v14-src/online/restitutions/consultation-demo.mjs';
import {scoreIntake,INTAKE_GROUPS} from '../pulse-v14-src/online/session/intake-model.mjs';

const filled=INTAKE_GROUPS.flatMap(g=>g.questions.filter(q=>Object.hasOwn(DEMO_ANSWERS,q.id)));
assert.equal(filled.length,22,'demo must have all original self-report questionnaire answers');
assert.equal(scoreIntake(DEMO_ANSWERS).complete,true);
const passport=demoPassport();
assert.equal(passport.totalTests,6);
assert.equal(passport.measuredCount,6);
assert.equal(passport.flaggedCount,2);
assert.equal(passport.planStatus,'eligible');
assert.ok(passport.index>0&&passport.index<100);
assert.ok(passport.focus.length===2);
assert.equal(DEMO_RESULTS.unipodal_left.status,'review');
assert.equal(DEMO_RESULTS.posture.status,'review');
assert.equal(DEMO_PATIENT.name,'Camille Martin');
const summary=demoSummary({note:'Essai de mise en page',next:'lab',stage:'done'});
assert.ok(summary.includes('SYNTHÈSE FICTIVE DE DÉMONSTRATION'));
assert.ok(summary.includes('Motion en centre'));
assert.ok(summary.includes('Essai de mise en page'));
assert.ok(summary.includes('aucun dossier réel'));
assert.ok(!summary.includes('renanchapon@gmail.com'),'demo summary must never include operator email or account identity');

const operatorSrc=readFileSync('pulse-v14-src/online/restitutions/app.js','utf8');
const portal=readFileSync('pulse-v14-src/app.js','utf8');
const demoSrc=readFileSync('pulse-v14-src/online/restitutions/consultation-demo.mjs','utf8');
const html=readFileSync('pulse-v14-src/online/restitutions/index.html','utf8');
const css=readFileSync('pulse-v14-src/online/restitutions/consultation-demo.css','utf8');
assert.ok(operatorSrc.includes("role.data?.role!=='admin'"),'the operator admin gate remains in place');
assert.ok(operatorSrc.includes("new URLSearchParams(location.search).get('mode')==='demo'"),'direct deep link enters demo only AFTER admin check');
assert.ok(operatorSrc.indexOf("role.data?.role!=='admin'")<operatorSrc.indexOf("new URLSearchParams(location.search).get('mode')==='demo'"),'demo must not bypass role gate');
assert.ok(operatorSrc.includes('sb.auth.signInWithPassword'),'existing confirmed admin account can log in at preview origin');
assert.ok(operatorSrc.includes('mountConsultationDemo(root,{operatorEmail:state.operatorEmail'));
assert.ok(operatorSrc.includes('Commencer une consultation test'),'operator calendar has demo launch CTA');
assert.ok(portal.includes('/online/restitutions/?mode=demo'),'Pulse admin navigation links to demo');
assert.ok(html.includes('consultation-demo.css'));
assert.ok(css.includes('@media(max-width:560px)'));
assert.ok(css.includes('prefers-reduced-motion'));
assert.ok(demoSrc.includes('getUserMedia({video:{facingMode:'),'camera request requires explicit interaction');
assert.ok(demoSrc.includes('getUserMedia({audio:true,video:false})'),'microphone test requires opt-in');
assert.ok(demoSrc.includes('for(const track of stream.getTracks())track.stop()'),'camera stream must be stopped');
assert.ok(demoSrc.includes("document.removeEventListener('visibilitychange',hideOrStop)"));
assert.ok(!/supabase|fetch\(|post\(|insert\(|upsert\(|sendBeacon|localStorage|sessionStorage|acuityscheduling\.com/i.test(demoSrc),'mock must never network or persist');
assert.ok(!/Rejoindre la visio ↗|https:\/\/.*zoom\.us\/j\//.test(demoSrc),'no pretend remote meeting');

let onExit=0,events=[],removed=[];
const initialDoc=globalThis.document,initialWindow=globalThis.window;
globalThis.document={hidden:false,addEventListener(...a){events.push(a)},removeEventListener(...a){removed.push(a)}};
globalThis.window={addEventListener(...a){events.push(a)},removeEventListener(...a){removed.push(a)}};
const selectors=new Map();
const root={
 _html:'',
 get innerHTML(){return this._html},
 set innerHTML(value){this._html=value;selectors.clear()},
 querySelector(selector){
  if(!selector.startsWith('#'))return null;
  const id=selector.slice(1);
  if(!this._html.includes('id="'+id+'"'))return null;
  if(!selectors.has(selector))selectors.set(selector,{onclick:null,hidden:false,srcObject:null});
  return selectors.get(selector);
 },
 querySelectorAll(){return []}
};
try{
 const sim=mountConsultationDemo(root,{operatorEmail:'synthetic-admin@example.test',onExit:()=>onExit++});
 assert.equal(sim.getState().stage,'prepare');
 assert.ok(root.innerHTML.includes('synthetic-admin@example.test'));
 assert.ok(root.innerHTML.includes('ENVIRONNEMENT DE DÉMONSTRATION'));
 assert.ok(root.innerHTML.includes('Patient fictif'));
 assert.ok(root.innerHTML.includes('6'));
 assert.ok(root.innerHTML.includes('Dossier'));
 assert.ok(root.innerHTML.includes('Démarrer la consultation test'));
 root.querySelector('#demo-start').onclick();
 assert.equal(sim.getState().stage,'live');
 assert.equal(sim.getState().tab,'guide');
 assert.ok(root.innerHTML.includes('ÉTAPE 01'));
 assert.ok(root.innerHTML.includes('Accueil et objectif'));
 root.querySelector('#demo-finish').onclick();
 assert.equal(sim.getState().stage,'done');
 assert.equal(sim.getState().tab,'conclusion');
 assert.ok(root.innerHTML.includes('Copier la synthèse fictive'));
 root.querySelector('#demo-reset').onclick();
 assert.equal(sim.getState().stage,'prepare');
 assert.equal(sim.getState().checked.length,0);
 root.querySelector('#demo-exit').onclick();
 assert.equal(onExit,1);
 assert.ok(removed.length>=2,'video lifecycle events are removed after exit');
}finally{globalThis.document=initialDoc;globalThis.window=initialWindow}
for(const file of ['pulse-v14-src/online/restitutions/consultation-demo.mjs','pulse-v14-src/online/restitutions/app.js','pulse-v14-src/app.js']){
 const x=spawnSync(process.execPath,['--check',file],{encoding:'utf8',timeout:10000});
 assert.equal(x.status,0,file+' '+x.stderr);
}
console.log('[pulse-operator-demo-qa] PASS · confirmed-admin gate, synthetic dossier, guided call lifecycle, preview state, mobile, local-only camera and no live patient writes');
