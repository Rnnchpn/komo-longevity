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
  if(!brand){brand=document.createElement('div');brand.className='kam-mobile-brand';brand.setAttribute('aria-label','KŌMØ Pulse — Longevity in motion');top.prepend(brand)}
  const html='<strong>KŌMØ PULSE</strong><span>Longevity in motion.</span>';
  if(brand.innerHTML!==html)brand.innerHTML=html;
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
function enhanceXp(){
  if(route()!=='home')return;
  const xp=document.querySelector('[data-my-komo-home] .mykomo-xp');if(!xp)return;
  const total=xp.querySelector('.mykomo-xp-foot span:first-child')?.textContent?.trim()||'0 XP';
  const today=document.querySelector('[data-my-komo-home] .mykomo-today-xp strong')?.textContent?.trim()||'+0';
  let spot=xp.querySelector('.kamo-xp-spotlight');if(!spot){spot=document.createElement('div');spot.className='kamo-xp-spotlight';const foot=xp.querySelector('.mykomo-xp-foot');foot?.insertAdjacentElement('afterend',spot)}
  if(!spot)return;
  const todayLabel=/xp/i.test(today)?today:`${today} XP`;
  const html=`<div class="kamo-xp-stat gain"><span>Gagné aujourd’hui</span><strong>${todayLabel}</strong></div><div class="kamo-xp-stat"><span>Expérience totale</span><strong>${total}</strong></div>`;
  if(spot.dataset.signature!==html){spot.dataset.signature=html;spot.innerHTML=html}
}
function declutterHome(){
  const root=document.querySelector('#viewRoot');if(!root)return;
  if(route()!=='home'){
    root.querySelectorAll('.kamo-home-result-removed').forEach(x=>x.classList.remove('kamo-home-result-removed'));
    return;
  }
  const myKomo=root.querySelector(':scope > [data-my-komo-home]');
  if(!myKomo)return;
  // The home route now belongs to My KŌMØ. Legacy score summaries, result cards,
  // trajectory blocks and other desktop-era siblings stay available on their
  // dedicated routes but are removed from the first screen.
  [...root.children].forEach(node=>{
    if(node===myKomo)return;
    node.classList.add('kamo-home-result-removed');
  });
}
async function refresh(force=false){
  window.KomoRuntime?.syncSession?.();
  ensureBrand();declutterHome();enhanceXp();
  if(route()!=='home')return;
  drawAge(lastAge);const age=await readAge(force);drawAge(age);enhanceXp();declutterHome();
}
function schedule(force=false){clearTimeout(timer);timer=setTimeout(()=>refresh(force),70)}
['hashchange','resize','orientationchange','pageshow','komo:route-ready','komo:session-ready','komo:data-ready'].forEach(x=>window.addEventListener(x,()=>schedule(x==='komo:session-ready'||x==='komo:data-ready')));
new MutationObserver(()=>schedule(false)).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>refresh(true),750));setTimeout(()=>refresh(false),1400);
