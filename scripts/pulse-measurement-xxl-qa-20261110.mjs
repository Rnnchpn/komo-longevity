import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {oneLegFrame,createOneLegObserver} from '../pulse-v14-src/online/session/unipodal-metrics.mjs';
import {createMovementTracker} from '../pulse-v14-src/online/session/metrics.mjs';
const root=process.cwd(),load=path=>readFile(join(root,path),'utf8');
const [ui,styles,remote,engine]=await Promise.all([
 'site/pulse-v14/motion-live-operator-consult-v1.js',
 'site/pulse-v14/motion-live-operator-consult-v1.css',
 'site/pulse-v14/motion-live-remote-pose-v1.js',
 'site/pulse-v14/online/session/pose-engine.js'
].map(load));
for(const name of ['pose-engine.js','metrics.mjs','unipodal-metrics.mjs']){
 const path=join(root,'site/pulse-v14/online/session',name);
 const check=spawnSync(process.execPath,['--check',path],{encoding:'utf8'});
 assert.equal(check.status,0,name+': '+check.stderr);
}
assert.ok(ui.includes('id="mocVideoFocus"')&&ui.includes('moc-video-hidden')&&ui.includes('updateConsultationLayout()'),
 'video is hidden by default during tests and available on demand without stopping pose');
assert.ok(styles.includes('.moc-video-xxl > .sidebar')&&styles.includes('grid-template-columns:minmax(365px,.66fr) minmax(0,1.75fr)'));
assert.ok(styles.includes('object-fit:contain'),'full-body frame must never be cropped');
assert.ok(remote.includes('accuracy:"full"')&&engine.includes('pose_landmarker_full.task'));
assert.ok(engine.includes('MODEL_LITE')&&engine.includes('modelPromises')&&engine.includes('now-lastSample<70'));
const empty=()=>Array.from({length:33},()=>({x:.5,y:.5,visibility:.08}));
function body({ankle='ground',foot='none'}={}){
 const p=empty();
 const coords=[[11,.40,.18],[12,.60,.18],[23,.42,.46],[24,.58,.46],
  [25,.42,.65],[26,.58,.65],[27,.42,.90],[28,.58,ankle==='raised'?.73:.90]];
 for(const [i,x,y] of coords)p[i]={x,y,visibility:.97};
 if(foot!=='none'){
  for(const [i,x,y] of [[29,.42,.92],[30,.58,foot==='raised'?.75:.92],
   [31,.41,.93],[32,.57,foot==='raised'?.76:.93]])
   p[i]={x,y,visibility:.96};
 }
 return p;
}
assert.equal(oneLegFrame(body({ankle:'raised'}),'left').lifted,true,'ankle evidence remains fallback');
assert.equal(oneLegFrame(body({ankle:'raised',foot:'ground'}),'left').lifted,false,
 'free ankle rise with heel and toe planted must not start timer');
assert.equal(oneLegFrame(body({ankle:'raised',foot:'raised'}),'left').lifted,true,
 'ankle, heel and toe jointly confirm an elevated foot');
const observer=createOneLegObserver('left',30000);
for(let t=0;t<=600;t+=100)observer.observe(body({ankle:'raised',foot:'raised'}),t);
assert.equal(observer.summary().started,true);
observer.observe(body({ankle:'raised',foot:'raised'}),800);
const before=observer.summary().seconds;
const after=observer.observe(body({ankle:'raised',foot:'raised'}),2200);
assert.equal(after.reason,'camera_lost','freeze is identified even without null landmarks');
assert.equal(after.seconds,before,'do not count unobserved seconds after frozen stream');
const counter=createMovementTracker('sts');
function seated(seat){
 const p=empty();
 const arr=seat?[[.40,.23],[.40,.53],[.62,.56],[.62,.88]]:
                   [[.42,.19],[.42,.46],[.42,.68],[.42,.88]];
 for(const offset of [0,.05]){
  const ids=offset?[12,24,26,28]:[11,23,25,27];
  ids.forEach((k,i)=>p[k]={x:arr[i][0]+offset,y:arr[i][1],visibility:.97});
 }
 return p;
}
for(let t=100;t<=500;t+=100)counter.observe(seated(true),t);
for(let t=700;t<=1200;t+=100)counter.observe(seated(false),t);
assert.equal(counter.summary().count,1,'ordinary completed chair rise is counted');
for(let t=1400;t<=1800;t+=100)counter.observe(seated(true),t);
counter.observe(seated(false),3300);
for(let t=3400;t<=3900;t+=100)counter.observe(seated(false),t);
assert.equal(counter.summary().count,1,'camera freeze between seated and standing cannot fabricate a rise');
console.log('[pulse-measurement-xxl-qa] PASS: Full model fallback, optional uncropped camera, heel/toe proof, dropped-frame protection and STS recovery');
