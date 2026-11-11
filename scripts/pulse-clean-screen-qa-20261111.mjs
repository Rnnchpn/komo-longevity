import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {buildClinicPassport} from '../pulse-v14-src/motion-live-clinic-passport-v2.mjs';
import {CLINIC_PASSPORT_EXPORTS} from '../pulse-v14-src/motion-live-clinic-passport-pdf-v2.js';
const read=p=>readFile(join(process.cwd(),p),'utf8');
const [ui,uiCss,video,videoCss,app,index,edge]=await Promise.all([
 'site/pulse-v14/motion-live-operator-consult-v1.js',
 'site/pulse-v14/motion-live-operator-consult-v1.css',
 'site/pulse-v14/motion-live-operator-video-v1.js',
 'site/pulse-v14/motion-live-operator-video-v1.css',
 'site/pulse-v14/app.js','site/pulse-v14/index.html',
 'supabase/functions/motion-live-test/index.ts'
].map(read));
for(const path of ['site/pulse-v14/motion-live-operator-consult-v1.js',
 'site/pulse-v14/motion-live-operator-video-v1.js',
 'site/pulse-v14/app.js','site/pulse-v14/motion-live-clinic-passport-pdf-v2.js']){
 const r=spawnSync(process.execPath,['--check',join(process.cwd(),path)],{encoding:'utf8'});
 assert.equal(r.status,0,path+': '+r.stderr);
}
assert.ok(index.includes('app.js?v=20261111-clean-screen-v1'));
assert.ok(app.includes('operator-video-v1.js?v=20261111-clean-screen-v1'));
assert.ok(app.includes('operator-consult-v1.js?v=20261111-clean-screen-v1'));
assert.ok(ui.includes('moc-camera-banner')&&ui.includes('mocCameraBanner'));
assert.ok(ui.includes('moc-video-hidden')&&ui.includes('panelMode==="questionnaire"'));
assert.ok(ui.includes('const preview=panelMode==="tests"&&videoFocus'));
assert.ok(ui.includes('updateConsultationLayout()'));
assert.ok(uiCss.includes('.moc-video-hidden .moc-grid'));
assert.ok(uiCss.includes('left:-12000px')&&uiCss.includes('width:480px')&&uiCss.includes('height:480px'));
assert.ok(!uiCss.includes('.moc-video-hidden .moc-camera-column{display:none'));
assert.ok(uiCss.includes('.moc-clock-figure strong')&&uiCss.includes('.moc-instructions'));
assert.ok(uiCss.includes('.moc-camera-banner[data-state="offline"]'));
assert.ok(video.includes('function videoReady(video)'));
assert.ok(video.includes('video.videoWidth>0')&&video.includes('video.readyState>=2'));
assert.ok(video.includes('videoNotified')&&video.includes('pulse:remote-video-ready'));
assert.ok(video.includes('onmute=')&&video.includes('onended='));
assert.ok(video.includes('mopvPlaceholder')&&video.includes('mopvPlay'));
assert.ok(!video.includes('CAMÉRA LIVE · SANS ENREGISTREMENT'));
assert.ok(videoCss.includes('mopv-window[data-stream-state="waiting"]'));
assert.ok(ui.includes('22 réponses enregistrées sur le serveur'));
assert.ok(ui.includes('questionnairePersistedAt'));
assert.ok(ui.includes('Vérification des réponses enregistrées sur le serveur'));
assert.ok(ui.includes('persisted.progress?.questionnaire?.answers'));
assert.ok(edge.includes('for(let attempt=0;attempt<6;attempt++)')&&edge.includes('answered_count:Object.keys(cleaned).length'));
assert.deepEqual(CLINIC_PASSPORT_EXPORTS.map(x=>x.value),
 ['all','synthese','tests','exercices','nutrition','suivi','questionnaire']);
const answers={ageBand:'60-69',goal:'strength',walk10:'0',stairs:'1',chair:'0',carry:'1',
 bend:'2',obstacle:'0',turn:'0',stand:'0',pain:'2',fatigue:'1',fear:'0',avoid:'1',
 sleep:'2',stress:'2',recovered:'2',qol:'1',walkingDays:'1',strengthDays:'3',
 outdoors:'1',breaks:'2'};
const results={sts:{status:'done',value:15},heels:{status:'done',value:11,duration_seconds:30},
 unipodal_left:{status:'done',value:28.9},unipodal_right:{status:'done',value:30},
 arms:{status:'done',value:16,duration_seconds:30},posture:{status:'done',observation:'neutral'}};
const complete=buildClinicPassport(answers,results,{simulated:true});
assert.equal(complete.questionnaire.answered,22);
assert.equal(complete.measured,6);
assert.equal(complete.questionnaire.groups.reduce((n,g)=>n+g.items.length,0),22);
assert.ok(complete.actionPlan.exercises.length>=4);
assert.ok(complete.actionPlan.supplements.some(x=>x.guard&&x.guard.length>30));
const partial=buildClinicPassport({},results,{simulated:true});
assert.equal(partial.questionnaire.answered,0);
assert.equal(partial.questionnaire.index,null);
console.log('[pulse-clean-screen-qa] PASS camera hidden from test and questionnaire view with video decoding alive, honest stream state, 22-answer persistence and complete conditional 6-category report');
