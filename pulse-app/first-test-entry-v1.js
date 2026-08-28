import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const PENDING='komo_open_first_test_v1';
let client=null;
let freeState=null;
let checkedAt=0;
let checking=false;

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return window.KomoRuntime?.client||(client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}
function route(){return location.hash.replace(/^#/,'')||'home'}
function answered(v){return v!==undefined&&v!==null&&v!==''}
function questionnaireCount(b){
  const items=b?.questionnaire?.items||{};
  let count=0;
  for(let i=1;i<=25;i++){
    const k=`kmq_${String(i).padStart(2,'0')}`;
    if(answered(items[k]))count++;
  }
  return count;
}
function computeFreeState(row){
  const r=row?.responses||{},b=r.baseline||{};
  const qCount=questionnaireCount(b);
  const legacyQuestionnaireDone=qCount===0&&Number.isFinite(Number(b?.questionnaire?.mobility_score_0_100));
  const questionnaireDone=qCount>=25||legacyQuestionnaireDone;
  const chairDone=Boolean(r?.chair_stand?.completed_at);
  const twoDone=Boolean(r?.two_step?.completed_at);
  return{questionnaireDone,chairDone,twoDone,qCount,complete:questionnaireDone&&chairDone&&twoDone};
}

function addStyles(){
  if(document.querySelector('#first-test-entry-v1-style'))return;
  const style=document.createElement('style');
  style.id='first-test-entry-v1-style';
  style.textContent=`
    .mykomo-xp.mykomo-first-test{position:relative;overflow:hidden;padding:22px!important;border:1px solid rgba(89,108,88,.24)!important;background:linear-gradient(145deg,#f7f3ea 0%,#edf2e9 100%)!important;box-shadow:0 16px 40px rgba(37,49,38,.07)!important}
    .mykomo-first-test::after{content:'';position:absolute;width:180px;height:180px;border-radius:50%;right:-75px;top:-90px;background:rgba(96,118,93,.08);pointer-events:none}
    .mykomo-first-test__eyebrow{display:block;margin:0 0 10px;color:#667764;font-size:9px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
    .mykomo-first-test h3{position:relative;z-index:1;margin:0 0 8px;color:#263027;font-size:24px;line-height:1.05;letter-spacing:-.035em}
    .mykomo-first-test p{position:relative;z-index:1;margin:0;color:#667068;font-size:12px;line-height:1.55}
    .mykomo-first-test__meta{position:relative;z-index:1;display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}.mykomo-first-test__meta span{display:inline-flex;padding:6px 9px;border-radius:999px;background:rgba(255,255,255,.68);border:1px solid rgba(44,58,45,.10);color:#586459;font-size:9px;font-weight:700}
    .mykomo-first-test__button{position:relative;z-index:1;width:100%;min-height:46px;border:0;border-radius:14px;padding:0 15px;background:#27332a;color:#fff;font:inherit;font-size:12px;font-weight:750;cursor:pointer;text-align:left;display:flex;align-items:center;justify-content:space-between;gap:12px}.mykomo-first-test__button:hover{filter:brightness(1.04)}
    .mykomo-first-test__note{display:block!important;margin-top:10px!important;color:#7b837c!important;font-size:10px!important;line-height:1.45!important}
    @media(max-width:760px){.mykomo-xp.mykomo-first-test{padding:19px!important}.mykomo-first-test h3{font-size:22px}.mykomo-first-test__button{min-height:50px}}
  `;
  document.head.appendChild(style);
}

async function getFreeState(force=false){
  if(checking)return freeState;
  if(!force&&freeState&&Date.now()-checkedAt<5000)return freeState;
  checking=true;
  try{
    const c=sb(),runtime=window.KomoRuntime?.getContext?.(),session=runtime?.session||(await c.auth.getSession()).data?.session;
    if(!session?.user){freeState=null;return null}
    const {data,error}=await c.from('pulse_assessments').select('responses,status,completed_at,updated_at').eq('user_id',session.user.id).eq('protocol_version','mobility-check-v1').order('updated_at',{ascending:false}).limit(1).maybeSingle();
    if(error)throw error;
    freeState=computeFreeState(data||null);
    checkedAt=Date.now();
    return freeState;
  }catch(error){
    console.error('[first-test-entry-v1]',error);
    freeState=freeState||{questionnaireDone:false,chairDone:false,twoDone:false,qCount:0,complete:false};
    return freeState;
  }finally{checking=false}
}

function cardContent(state){
  if(!state?.questionnaireDone)return{
    eyebrow:'PREMIÈRE ÉTAPE · GRATUIT',
    title:'Débuter le premier test',
    copy:'Commencez votre bilan par le questionnaire KŌMØ. Il constitue la première étape de Pulse Free avant le Chair Stand et le Two-Step.',
    meta:['Questionnaire KŌMØ','25 questions','5–7 min'],
    button:'Commencer le questionnaire gratuit',
    key:'baseline',
    note:'Votre progression KŌMØ apparaîtra après votre bilan gratuit.'
  };
  if(!state.chairDone)return{
    eyebrow:'DEUXIÈME ÉTAPE · GRATUIT',title:'Continuer avec le Chair Stand',copy:'Votre questionnaire est terminé. Réalisez maintenant le test de lever de chaise pour poursuivre votre bilan Pulse Free.',meta:['Chair Stand','30 secondes','Chaise stable'],button:'Commencer le Chair Stand',key:'chair_stand',note:'Il restera ensuite le Two-Step.'
  };
  return{
    eyebrow:'DERNIÈRE ÉTAPE · GRATUIT',title:'Terminer avec le Two-Step',copy:'Vous avez terminé le questionnaire et le Chair Stand. Le Two-Step est la dernière étape avant votre premier résultat KŌMØ.',meta:['Two-Step','2 pas','Mètre ruban'],button:'Commencer le Two-Step',key:'two_step',note:'Votre premier résultat sera disponible après cette étape.'
  };
}

function renderFirstTestCard(){
  if(route()!=='home'||!freeState||freeState.complete)return;
  const box=document.querySelector('[data-my-komo-home] .mykomo-xp');
  if(!box)return;
  const c=cardContent(freeState);
  const signature=`${c.key}:${freeState.qCount}:${freeState.chairDone}:${freeState.twoDone}`;
  if(box.dataset.firstTestSignature===signature)return;
  addStyles();
  box.dataset.firstTestEntry='1';
  box.dataset.firstTestSignature=signature;
  box.classList.add('mykomo-first-test');
  box.innerHTML=`
    <span class="mykomo-first-test__eyebrow">${c.eyebrow}</span>
    <h3>${c.title}</h3>
    <p>${c.copy}</p>
    <div class="mykomo-first-test__meta">${c.meta.map(x=>`<span>${x}</span>`).join('')}</div>
    <button type="button" class="mykomo-first-test__button" data-start-free-step-v1="${c.key}"><span>${c.button}</span><span aria-hidden="true">→</span></button>
    <small class="mykomo-first-test__note">${c.note}</small>`;
}

async function patchHome(force=false){
  if(route()!=='home')return;
  const state=await getFreeState(force);
  if(state&&!state.complete)renderFirstTestCard();
}

function cleanSignupHandoff(){
  sessionStorage.removeItem('komo_start_check_after_signup');
  const u=new URL(location.href);u.searchParams.delete('start');
  history.replaceState({},'',u.pathname+(u.search?u.search:'')+u.hash);
  const modal=document.querySelector('#patientCreateModal');
  if(modal){modal.hidden=true;delete modal.dataset.handoff}
}

function openFreeStepWhenReady(key,attempt=0){
  if(route()!=='results'){location.hash='results';return}
  const button=document.querySelector(`.tests-v1-root [data-open-test="${key}"]`);
  if(button){sessionStorage.removeItem(PENDING);button.click();return}
  if(attempt<180)setTimeout(()=>openFreeStepWhenReady(key,attempt+1),100);
}

function beginFreeStep(key='baseline'){
  cleanSignupHandoff();
  sessionStorage.setItem(PENDING,key);
  if(route()!=='results')location.hash='results';
  setTimeout(()=>openFreeStepWhenReady(key,0),40);
}

function resumePending(){
  const key=sessionStorage.getItem(PENDING);
  if(key)setTimeout(()=>openFreeStepWhenReady(key,0),60);
}

function patchWelcome(){
  const modal=document.querySelector('#patientCreateModal[data-handoff="1"]');
  const button=modal?.querySelector('[data-start-komo-check]');
  if(!button)return;
  button.removeAttribute('data-start-komo-check');
  button.dataset.startFreeStepV1='baseline';
  button.textContent='Débuter le premier test gratuit →';
  const copy=modal.querySelector('.patient-create-success p:not(.eyebrow)');
  if(copy)copy.textContent='Votre compte est prêt. Commencez maintenant par le questionnaire KŌMØ gratuit, première étape de votre bilan Pulse Free.';
}

function schedule(){
  patchWelcome();
  if(route()==='home')setTimeout(()=>patchHome(false),30);
  resumePending();
}

document.addEventListener('click',event=>{
  const button=event.target.closest?.('[data-start-free-step-v1]');
  if(!button)return;
  event.preventDefault();
  event.stopPropagation();
  beginFreeStep(button.dataset.startFreeStepV1||'baseline');
},true);

window.addEventListener('hashchange',()=>{
  if(route()==='home'){freeState=null;checkedAt=0;setTimeout(()=>patchHome(true),80)}
  if(route()==='results')resumePending();
});
window.addEventListener('komo:route-ready',schedule);
window.addEventListener('komo:assessment-updated',()=>{freeState=null;checkedAt=0;setTimeout(()=>patchHome(true),80)});
window.addEventListener('pageshow',()=>setTimeout(schedule,120));
document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,250));
const observer=new MutationObserver(()=>schedule());
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','data-handoff','class']});
setInterval(()=>{if(route()==='home')patchHome(false)},1200);
setTimeout(schedule,400);
