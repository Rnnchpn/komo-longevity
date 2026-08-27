import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const PROTOCOL='motion-v0.4';
let client=null;

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){if(!client)client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}
function num(v){if(v===null||v===undefined||v==='')return null;const x=Number(String(v).replace(',','.'));return Number.isFinite(x)?x:null}
function val(id){return document.querySelector(`#${id}`)?.value??''}
function latestValue(code){
  const shell=document.querySelector('[data-clinical-motion-v1]');
  const cached=shell?.dataset?.svaValue;
  if(code==='M-POS-02'&&cached!==undefined)return cached;
  return '';
}
function toast(message){
  const el=document.querySelector('#clmMessage');
  if(!el)return;
  el.textContent=message;
}

function section(title,copy,body){
  const el=document.createElement('section');
  el.className='clm-measure-section';
  el.dataset.motionSva='1';
  el.innerHTML=`<h4>${title}</h4><p>${copy}</p>${body}`;
  return el;
}

async function hydrateSva(){
  const assessmentId=document.querySelector('#clmAssessment')?.value;
  const shell=document.querySelector('[data-clinical-motion-v1]');
  if(!assessmentId||!shell)return;
  const {data,error}=await sb().from('measurements').select('numeric_value').eq('assessment_id',assessmentId).eq('indicator_code','M-POS-02').eq('qc_status','valid').order('recorded_at',{ascending:false}).limit(1).maybeSingle();
  if(error)return;
  shell.dataset.svaValue=data?.numeric_value??'';
  const input=document.querySelector('#m_sva');
  if(input&&document.activeElement!==input)input.value=data?.numeric_value??'';
}

function simplify(){
  const root=document.querySelector('[data-clinical-motion-v1]');
  if(!root)return;
  const grid=root.querySelector('.clm-measure-grid');
  if(!grid)return;

  root.querySelectorAll('.clm-measure-section').forEach(el=>{
    const title=(el.querySelector('h4')?.textContent||'').trim().toLowerCase();
    if(['performance','balance','enrichissement'].includes(title))el.remove();
  });

  if(!grid.querySelector('[data-motion-sva]')){
    const qc=[...grid.querySelectorAll('.clm-measure-section')].find(el=>(el.querySelector('h4')?.textContent||'').trim().toLowerCase()==='qc');
    const el=section(
      'Posture',
      'SVA mesurée par l’équipe KŌMØ via une application externe, puis saisie manuellement dans Pulse.',
      `<div data-motion-sva="1"><label class="clm-field"><span>SVA · mm</span><input id="m_sva" type="number" step="1" inputmode="decimal" value="${latestValue('M-POS-02')}"></label><div class="clm-note">Mesure externe saisie par l’opérateur. Aucune SVA n’est dérivée automatiquement d’une photographie. Cette valeur reste descriptive tant que son rôle dans le score n’est pas verrouillé.</div></div>`
    );
    if(qc)grid.insertBefore(el,qc);else grid.appendChild(el);
  }

  const head=root.querySelector('.clm-card-head h3');
  if(head?.textContent?.includes('Motion · mesures fonctionnelles')){
    head.parentElement?.querySelector('p')?.replaceChildren(document.createTextNode('Contexte, Locomotor/Mobility et SVA mesurée manuellement.'));
  }

  const calculate=root.querySelector('[data-action="calculate"]');
  if(calculate){
    calculate.textContent='Calcul Motion · après pré-bilan';
    calculate.disabled=true;
    calculate.title='Le nouvel algorithme sera activé après raccordement du questionnaire Baseline canonique et validation des entrées du score.';
  }

  const save=root.querySelector('[data-action="save-motion"]');
  if(save&&!save.dataset.svaIntercept){
    save.dataset.svaIntercept='1';
    save.addEventListener('click',saveSimplifiedMotion,{capture:true});
  }

  const scoreDescription=root.querySelector('.clm-score-card h3 + p');
  if(scoreDescription&&/Performance|Balance/.test(scoreDescription.textContent||'')){
    scoreDescription.textContent='Résultat historique v0.4. Les nouveaux épisodes n’utilisent plus les blocs Performance / Balance de cette interface.';
  }
  root.querySelectorAll('.clm-domain').forEach(row=>{
    const label=(row.querySelector('span')?.textContent||'').trim();
    if(label==='Performance'||label==='Balance')row.remove();
  });

  hydrateSva();
}

async function saveSimplifiedMotion(event){
  event.preventDefault();
  event.stopImmediatePropagation();
  const assessmentId=document.querySelector('#clmAssessment')?.value;
  if(!assessmentId)return toast('Sélectionnez un épisode Motion.');
  const {data:{session}}=await sb().auth.getSession();
  if(!session?.user)return toast('Session expirée. Reconnectez-vous.');
  const now=new Date().toISOString();
  const rows=[];
  const age=num(val('m_age'));
  const sex=String(val('m_sex')||'').trim();
  if(age!==null)rows.push({assessment_id:assessmentId,indicator_code:'M-CTX-01',product_status:'M0',raw_value:age,numeric_value:age,unit:'years',source:'operator',protocol_version:PROTOCOL,qc_status:'valid',recorded_at:now,recorded_by:session.user.id,source_reference:'motion-sva-ui-v1'});
  if(sex)rows.push({assessment_id:assessmentId,indicator_code:'M-CTX-02',product_status:'M0',raw_value:sex,text_value:sex,source:'operator',protocol_version:PROTOCOL,qc_status:'valid',recorded_at:now,recorded_by:session.user.id,source_reference:'motion-sva-ui-v1'});

  const fields=[
    ['m_height','M-CTX-03','M0','cm','numeric'],
    ['m_weight','M-CTX-04','M0','kg','numeric'],
    ['m_glfs','M-FUN-01','M0','score_0_100','numeric'],
    ['m_two','M-FUN-03','M0','ratio','numeric'],
    ['m_stand','M-FUN-02','M0','class_code','text'],
    ['m_sva','M-POS-02','M1','mm','numeric']
  ];
  for(const [id,code,status,unit,kind] of fields){
    const raw=val(id);
    if(raw==='')continue;
    const numeric=kind==='numeric'?num(raw):null;
    if(kind==='numeric'&&numeric===null)continue;
    rows.push({assessment_id:assessmentId,indicator_code:code,product_status:status,raw_value:kind==='numeric'?numeric:String(raw),numeric_value:numeric,text_value:kind==='text'?String(raw):null,unit,source:'operator',protocol_version:PROTOCOL,qc_status:'valid',recorded_at:now,recorded_by:session.user.id,source_reference:code==='M-POS-02'?'external-posture-app/manual-entry':'motion-sva-ui-v1'});
  }
  if(!rows.length)return toast('Aucune mesure à enregistrer.');
  const {error}=await sb().from('measurements').insert(rows);
  if(error)return toast(error.message);
  toast(`${rows.length} mesures enregistrées · SVA incluse si renseignée.`);
  await hydrateSva();
}

window.addEventListener('komo:clinical-motion-render',()=>setTimeout(simplify,0));
window.addEventListener('komo:clinical-patient-changed',()=>setTimeout(simplify,120));
const observer=new MutationObserver(()=>{
  if(location.hash.replace(/^#/,'')==='clinical'&&document.querySelector('[data-clinical-motion-v1] .clm-measure-grid'))setTimeout(simplify,0);
});
observer.observe(document.body,{childList:true,subtree:true});
document.addEventListener('DOMContentLoaded',()=>setTimeout(simplify,1200));
setTimeout(simplify,1600);
