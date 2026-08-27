import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
let client=null,lastAge=null,lastRead=0,busy=false,timer=null;
function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return window.KomoRuntime?.client||(client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}
function route(){return location.hash.replace(/^#/,'')||'home'}
function mobile(){return window.matchMedia('(max-width:767px)').matches}
function appVisible(){const app=document.querySelector('#appShell'),auth=document.querySelector('#authScreen');return !!app&&!app.hidden&&(!auth||auth.hidden)}
function number(v){const x=Number(v);return Number.isFinite(x)&&x>0&&x<130?x:null}
function normalize(k=''){return String(k).toLowerCase().replace(/[^a-z0-9]/g,'')}
const AGE_KEYS=new Set(['komoage','komoageyears','motionage','motionageyears','locomotorage','locomotorageyears','functionalage','functionalageyears']);
function findAge(value,depth=0){
  if(!value||depth>5||typeof value!=='object')return null;
  for(const [k,v] of Object.entries(value))if(AGE_KEYS.has(normalize(k))){const x=number(v);if(x!==null)return x}
  for(const v of Object.values(value)){const x=findAge(v,depth+1);if(x!==null)return x}
  return null;
}
function ensureBrand(){
  const top=document.querySelector('.topbar');if(!top)return;
  if(!mobile()||!appVisible()){top.querySelector('.kam-mobile-brand')?.remove();return}
  let brand=top.querySelector('.kam-mobile-brand');
  if(!brand){brand=document.createElement('div');brand.className='kam-mobile-brand';brand.setAttribute('aria-label','KŌMØ Pulse');brand.innerHTML='<strong>KŌMØ</strong><span>PULSE</span>';top.prepend(brand)}
}
async function readAge(force=false){
  if(busy||(!force&&Date.now()-lastRead<15000))return lastAge;
  busy=true;
  try{
    const c=sb(),session=window.KomoRuntime?.getContext?.()?.session||(await c.auth.getSession()).data?.session;if(!session?.user)return null;
    const p=await c.from('patients').select('id').eq('patient_user_id',session.user.id).order('created_at',{ascending:false});
    const ids=(p.data||[]).map(x=>x.id);if(!ids.length){lastAge=null;lastRead=Date.now();return null}
    const a=await c.from('assessments').select('id,created_at').in('patient_id',ids).eq('product_mode','motion').order('created_at',{ascending:false}).limit(5);
    const assessmentIds=(a.data||[]).map(x=>x.id);if(!assessmentIds.length){lastAge=null;lastRead=Date.now();return null}
    const s=await c.from('scores').select('assessment_id,domain_scores,calculated_at').in('assessment_id',assessmentIds).order('calculated_at',{ascending:false}).limit(10);
    lastAge=null;
    for(const row of s.data||[]){const x=findAge(row.domain_scores);if(x!==null){lastAge=x;break}}
    lastRead=Date.now();
    return lastAge;
  }catch(e){console.error('[pulse-final-design age]',e);return lastAge}finally{busy=false}
}
function drawAge(age){
  if(route()!=='home')return;
  const card=document.querySelector('[data-my-komo-home] .mykomo-score-card');if(!card)return;
  const rings=card.querySelector('.mykomo-rings');if(!rings)return;
  let box=card.querySelector('.kamo-age');if(!box){box=document.createElement('div');box.className='kamo-age';rings.insertAdjacentElement('beforebegin',box)}
  const value=number(age);
  const html=`<span>KŌMØ AGE</span><strong>${value===null?'—':Math.round(value)}${value===null?'':'<small>ans</small>'}</strong><small>${value===null?'Disponible après calcul KŌMØ Motion':'Estimation issue de KŌMØ Motion'}</small>`;
  if(box.dataset.signature!==html){box.dataset.signature=html;box.innerHTML=html}
}
async function refresh(force=false){ensureBrand();if(route()!=='home')return;drawAge(lastAge);const age=await readAge(force);drawAge(age)}
function schedule(force=false){clearTimeout(timer);timer=setTimeout(()=>refresh(force),90)}
['hashchange','resize','orientationchange','pageshow','komo:route-ready','komo:session-ready','komo:data-ready'].forEach(x=>window.addEventListener(x,()=>schedule(x==='komo:session-ready'||x==='komo:data-ready')));
new MutationObserver(()=>schedule(false)).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>refresh(true),850));setTimeout(()=>refresh(false),1600);
