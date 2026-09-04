import { TwinCore, SOURCE_CATALOG } from '../v04/twin-core.js';

const $=(s)=>document.querySelector(s);
const $$=(s)=>[...document.querySelectorAll(s)];
const core=new TwinCore();
const baseline=core.snapshots[0];
const cockpit=$('#twin-hud');
let syncingTimeline=false;

const fmtSigned=(value,digits=0,suffix='')=>`${value>0?'+':''}${Number(value).toFixed(digits)}${suffix}`;
const formatDate=(iso)=>new Date(iso).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).toUpperCase();
const sourceValue=(id,s)=>({
  myodev:`${s.metrics.quadriceps_symmetry}% symmetry`,
  functional_tests:`Mobility ${s.domains.mobility}/100`,
  gait:`${s.metrics.gait_speed.toFixed(2)} m/s`,
  strength:`${s.metrics.strength_index}/100`,
  posture:`${s.metrics.posture_index}/100`,
  wearables:`${s.metrics.steps.toLocaleString()} steps`,
  sleep:`${Math.floor(s.metrics.sleep_minutes/60)}h ${String(s.metrics.sleep_minutes%60).padStart(2,'0')}`,
  activity:`${s.metrics.steps.toLocaleString()} steps`,
  rehab:`${s.metrics.rehab_adherence}% adherence`,
  motion_score:`${s.motion_score}/100`
}[id]||'Available');

const domains=[['muscle','Muscle'],['mobility','Mobility'],['balance','Balance'],['posture','Posture'],['endurance','Endurance']];

function renderDomains(s){
  $('#domain-bars').innerHTML=domains.map(([id,label])=>{
    const value=s.domains[id]??0; const delta=value-(baseline.domains[id]??value);
    return `<div class="domain-row"><span>${label}</span><div class="domain-track"><div class="domain-fill" style="width:${Math.max(0,Math.min(100,value))}%"></div></div><div class="domain-value"><b>${value}</b><small>${fmtSigned(delta)}</small></div></div>`;
  }).join('');
}

function renderSignals(s){
  const signals=[
    ['Gait speed',`${s.metrics.gait_speed.toFixed(2)} m/s`,fmtSigned(s.metrics.gait_speed-baseline.metrics.gait_speed,2,' m/s')],
    ['Strength',`${s.metrics.strength_index}/100`,fmtSigned(s.metrics.strength_index-baseline.metrics.strength_index)],
    ['Sleep',`${Math.floor(s.metrics.sleep_minutes/60)}h ${String(s.metrics.sleep_minutes%60).padStart(2,'0')}`,fmtSigned(s.metrics.sleep_minutes-baseline.metrics.sleep_minutes,0,' min')],
    ['Activity',`${s.metrics.steps.toLocaleString()} steps`,fmtSigned(s.metrics.steps-baseline.metrics.steps,0)],
    ['Rehab',`${s.metrics.rehab_adherence}%`,s.metrics.rehab_adherence?`${fmtSigned(s.metrics.rehab_adherence-baseline.metrics.rehab_adherence)} pts`:'Baseline'],
    ['Quad symmetry',`${s.metrics.quadriceps_symmetry}%`,`${fmtSigned(s.metrics.quadriceps_symmetry-baseline.metrics.quadriceps_symmetry)} pts`]
  ];
  $('#key-signals').innerHTML=signals.map(([label,value,delta])=>`<div class="signal-card"><span>${label}</span><b>${value}</b><small>${delta}</small></div>`).join('');
}

function priorityFor(s){
  const q=s.metrics.quadriceps_symmetry;
  const intensity=s.overlays?.left_thigh?.intensity??0;
  if(q<80||intensity>.45)return{state:'ATTENTION',title:'Left quadriceps',copy:'Activation asymmetry remains the main modifiable limitation.'};
  if(q<90||intensity>.2)return{state:'WATCH',title:'Left quadriceps',copy:'Residual asymmetry persists, with clear longitudinal improvement.'};
  return{state:'STABLE',title:'Lower limbs',copy:'No major asymmetry is currently highlighted in the demo snapshot.'};
}

function renderComparison(){
  const s=core.current(); const c=core.compare(baseline.snapshot_id,s.snapshot_id,'v07-ui');
  const cards=[
    ['Motion Score',baseline.motion_score,s.motion_score,fmtSigned(c.motion_score_delta)],
    ['Motion Age',baseline.motion_age,s.motion_age,fmtSigned(c.motion_age_delta,0,' yr')],
    ['Quad symmetry',baseline.metrics.quadriceps_symmetry,s.metrics.quadriceps_symmetry,fmtSigned(c.metric_delta.quadriceps_symmetry,0,' pts')],
    ['Gait speed',baseline.metrics.gait_speed.toFixed(2),s.metrics.gait_speed.toFixed(2),fmtSigned(c.metric_delta.gait_speed,2,' m/s')],
    ['Strength',baseline.metrics.strength_index,s.metrics.strength_index,fmtSigned(c.metric_delta.strength_index)],
    ['Posture',baseline.metrics.posture_index,s.metrics.posture_index,fmtSigned(c.metric_delta.posture_index)]
  ];
  $('#compare-grid').innerHTML=cards.map(([label,from,to,delta])=>`<div class="compare-card"><span>${label}</span><b>${from} → ${to}</b><small>${delta}</small></div>`).join('');
}

function renderSource(id){
  const s=core.current(); const src=SOURCE_CATALOG.find(x=>x.id===id); const meta=s.sources?.[id]||{};
  $('#source-title').textContent=src?.label||id;
  $('#source-content').innerHTML=`<div class="source-meta"><div><span>Current value</span><b>${sourceValue(id,s)}</b></div><div><span>Snapshot</span><b>${s.label}</b></div><div><span>Quality</span><b>${meta.quality?Math.round(meta.quality*100)+'%':'—'}</b></div><div><span>Status</span><b>${meta.status||'available'}</b></div><div><span>Method</span><b>${meta.method||'—'}</b></div><div><span>Version</span><b>${s.provenance_version}</b></div></div><p class="source-note">This value belongs to the dated Twin snapshot. The AI layer may explain or navigate it, but cannot silently rewrite the underlying measurement.</p>`;
}

function updateCockpit(index,{relayTo3D=false}={}){
  core.setTimeIndex(index,'v07-ui');
  const s=core.current(); const c=core.compare(baseline.snapshot_id,s.snapshot_id,'v07-ui'); const p=priorityFor(s);
  $('#twin-score-large').textContent=s.motion_score; $('#twin-age-large').textContent=s.motion_age;
  $('#twin-score-delta').textContent=`${fmtSigned(c.motion_score_delta)} since baseline`;
  $('#twin-age-delta').textContent=`${fmtSigned(c.motion_age_delta)} years`;
  $('#twin-date').textContent=formatDate(s.captured_at); $('#timeline-current-label').textContent=s.label.toUpperCase();
  $('#priority-state').textContent=p.state; $('#priority-title').textContent=p.title; $('#priority-copy').textContent=p.copy;
  $('#priority-value').textContent=`${s.metrics.quadriceps_symmetry}%`; $('#priority-delta').textContent=`${fmtSigned(s.metrics.quadriceps_symmetry-baseline.metrics.quadriceps_symmetry)} pts`;
  $('#callout-quad').textContent=`${s.metrics.quadriceps_symmetry}%`; $('#callout-gait').textContent=s.metrics.gait_speed.toFixed(2); $('#callout-posture').textContent=s.metrics.posture_index; $('#callout-strength').textContent=s.metrics.strength_index;
  renderDomains(s); renderSignals(s); renderComparison();
  $$('[data-time]').forEach(b=>b.classList.toggle('active',Number(b.dataset.time)===index));
  if($('#timeline'))$('#timeline').value=index;
  if($('#twin-snapshot'))$('#twin-snapshot').textContent=s.label.toUpperCase();
  if($('#hud-motion'))$('#hud-motion').textContent=s.motion_score; if($('#hud-age'))$('#hud-age').textContent=s.motion_age;
  if(relayTo3D && $('#timeline') && !syncingTimeline){
    syncingTimeline=true;
    $('#timeline').dispatchEvent(new Event('input',{bubbles:true}));
    syncingTimeline=false;
  }
}

function selectView(view){
  cockpit.dataset.view=view; $$('[data-twin-view]').forEach(b=>b.classList.toggle('active',b.dataset.twinView===view));
  $('#compare-layer').classList.toggle('open',view==='compare');
  $('#source-inspector').classList.toggle('open',view==='sources');
}

$$('[data-twin-view]').forEach(b=>b.addEventListener('click',()=>selectView(b.dataset.twinView)));
$$('[data-time]').forEach(b=>b.addEventListener('click',()=>updateCockpit(Number(b.dataset.time),{relayTo3D:true})));
$('#compare-now')?.addEventListener('click',()=>selectView('compare'));
$('#compare-close')?.addEventListener('click',()=>selectView('overview'));
$('#source-close')?.addEventListener('click',()=>selectView('overview'));

function wireSourceButtons(){
  setTimeout(()=>{
    $$('#twin-sources [data-source]').forEach(b=>{
      if(b.dataset.v07wired)return;
      b.dataset.v07wired='1';
      b.addEventListener('click',()=>{
        renderSource(b.dataset.source);selectView('sources');
        requestAnimationFrame(()=>$('#panel')?.classList.remove('open'));
      });
    });
  },0);
}

const observer=new MutationObserver(()=>wireSourceButtons());
observer.observe($('#twin-sources'),{childList:true});
wireSourceButtons();

// The V0.6 engine still owns the actual 3D Twin. Reading its timeline event keeps both layers aligned.
$('#timeline')?.addEventListener('input',e=>{if(!syncingTimeline)updateCockpit(Number(e.target.value));});
const openObserver=new MutationObserver(()=>{if(cockpit.classList.contains('open')){updateCockpit(Number($('#timeline')?.value??2));selectView('overview');}});
openObserver.observe(cockpit,{attributes:true,attributeFilter:['class']});

updateCockpit(2);
selectView('overview');
