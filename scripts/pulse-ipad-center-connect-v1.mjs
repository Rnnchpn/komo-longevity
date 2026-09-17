import { readFile, writeFile } from 'node:fs/promises';

const path='site/pulse-v12/center-two-tab-workspace-v1.js';
let center=await readFile(path,'utf8');

const oldOpen=`async function openDossier(patientId){if(!patientId)return;S.selected=patientId;S.dossier=null;S.dossierLoading=true;localStorage.setItem(PATIENT_KEY,patientId);renderDossier();try{const q=await sb().rpc('komo_professional_motion_consultation',{p_patient_id:patientId});if(q.error)throw q.error;S.dossier=q.data;if(S.dossier?.motion?.id)localStorage.setItem(ASSESSMENT_KEY,S.dossier.motion.id)}catch(e){notify('Impossible d’ouvrir le dossier patient.');console.error('[center-two-tab]',e)}finally{S.dossierLoading=false;renderDossier()}}`;

const newOpen=`async function openDossier(patientId){
  if(!patientId)return;
  S.selected=patientId;S.dossier=null;S.dossierLoading=true;
  localStorage.setItem(PATIENT_KEY,patientId);
  renderDossier();
  try{
    let q=await sb().rpc('komo_professional_motion_consultation',{p_patient_id:patientId});
    if(q.error||!q.data?.patient){
      console.warn('[center-two-tab] consultation RPC fallback',q.error||'empty payload');
      q=await sb().rpc('komo_professional_patient_dossier',{p_patient_id:patientId});
    }
    if(q.error)throw q.error;
    S.dossier=q.data;
    if(S.dossier?.motion?.id)localStorage.setItem(ASSESSMENT_KEY,S.dossier.motion.id);
  }catch(e){
    console.error('[center-two-tab] open dossier',e);
    const row=S.rows.find(x=>x.patient?.id===patientId);
    if(row?.patient){
      S.dossier={
        patient:row.patient,
        appointment:row.next_appointment||null,
        motion:row.motion||null,
        questionnaires:[],
        score:row.score||null,
        myocare_imports:[]
      };
    }
    notify('Dossier non chargé'+(e?.message?' · '+e.message:''));
  }finally{
    S.dossierLoading=false;
    renderDossier();
  }
}`;

if(!center.includes(oldOpen))throw new Error('[ipad-center-connect] openDossier anchor missing');
center=center.replace(oldOpen,newOpen);

const oldCapture=`document.addEventListener('click',e=>{const b=e.target.closest?.('[data-k2tw-nav]');if(b){e.preventDefault();e.stopPropagation();openTab(b.dataset.k2twNav)}},true);`;
const newCapture=`document.addEventListener('click',e=>{
  const assign=e.target.closest?.('#k2twAssignGlobal,[data-k2tw-assign]');
  if(assign){
    e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
    openAssign(assign.dataset.k2twAssign||null);
    return;
  }
  const open=e.target.closest?.('[data-k2tw-open]');
  if(open){
    e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
    openDossier(open.dataset.k2twOpen).catch(err=>{console.error('[center-two-tab] delegated open',err);notify('Impossible d’ouvrir la consultation.');});
    return;
  }
  const b=e.target.closest?.('[data-k2tw-nav]');
  if(b){e.preventDefault();e.stopPropagation();openTab(b.dataset.k2twNav)}
},true);`;

if(!center.includes(oldCapture))throw new Error('[ipad-center-connect] delegated click anchor missing');
center=center.replace(oldCapture,newCapture);

center=center.replace(
  '.k2tw-open{border:0;border-radius:12px;background:#293a30;color:#fff;padding:10px 12px;font:inherit;font-size:9px;font-weight:800;cursor:pointer}',
  '.k2tw-open{border:0;border-radius:12px;background:#293a30;color:#fff;padding:10px 12px;font:inherit;font-size:9px;font-weight:800;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;pointer-events:auto}'
);
center=center.replace(
  '.k2tw-btn{border:1px solid #d7d4cd;border-radius:12px;background:#fff;color:#344139;padding:10px 12px;font:inherit;font-size:9px;font-weight:800;cursor:pointer}',
  '.k2tw-btn{border:1px solid #d7d4cd;border-radius:12px;background:#fff;color:#344139;padding:10px 12px;font:inherit;font-size:9px;font-weight:800;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent;pointer-events:auto}'
);

const checks=[
  ['delegated assign',center.includes("closest?.('#k2twAssignGlobal,[data-k2tw-assign]')")],
  ['delegated dossier open',center.includes("closest?.('[data-k2tw-open]')")&&center.includes('openDossier(open.dataset.k2twOpen)')],
  ['fallback dossier RPC',center.includes("rpc('komo_professional_patient_dossier'")],
  ['touch action',center.includes('touch-action:manipulation')],
  ['primary consultation RPC kept',center.includes("rpc('komo_professional_motion_consultation'")]
];
for(const [label,ok] of checks)console.log(`[ipad-center-connect] ${ok?'OK':'FAIL'} · ${label}`);
if(checks.some(([,ok])=>!ok))process.exit(1);

await writeFile(path,center,'utf8');
console.log('[ipad-center-connect] PASS · Centre buttons are directly connected on iPad');
