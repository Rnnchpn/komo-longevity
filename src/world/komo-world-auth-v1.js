const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const SUPABASE_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const PULSE_ORIGIN='https://pulse.komolongevity.com';
const ROOT_ORIGINS=new Set(['https://komolongevity.com','https://www.komolongevity.com']);
const storageKey='komo_world_root_auth_v1';

if(!globalThis.supabase?.createClient) throw new Error('KŌMØ World: Supabase bundle unavailable.');

export const supabase=globalThis.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{
  auth:{storage:localStorage,storageKey,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
});

let popup=null;
let bridgeBusy=false;
const listeners=new Set();

function emit(session){
  for(const fn of listeners){try{fn(session)}catch(e){console.warn('[KOMO World auth listener]',e)}}
  window.dispatchEvent(new CustomEvent('komo:world-auth-change',{detail:{authenticated:!!session?.user,user_id:session?.user?.id||null}}));
}

async function acceptPulseBridge(payload,source){
  if(!payload?.session?.access_token||!payload?.session?.refresh_token)return false;
  try{
    const expiresAt=Number(payload.session.expires_at)||0;
    if(expiresAt&&expiresAt*1000<Date.now()+15000)throw new Error('Pulse session expired');
    const {data,error}=await supabase.auth.setSession({
      access_token:payload.session.access_token,
      refresh_token:payload.session.refresh_token
    });
    if(error||!data.session?.user)throw error||new Error('Invalid Pulse session');
    try{source?.postMessage({type:'komo:world-bridge-ack',status:'connected',request_id:payload.request_id||''},PULSE_ORIGIN)}catch{}
    bridgeBusy=false;emit(data.session);return true;
  }catch(error){
    bridgeBusy=false;
    try{source?.postMessage({type:'komo:world-bridge-ack',status:'error',request_id:payload.request_id||''},PULSE_ORIGIN)}catch{}
    window.dispatchEvent(new CustomEvent('komo:world-auth-error',{detail:{message:String(error?.message||error)}}));
    return false;
  }
}

window.addEventListener('message',event=>{
  if(event.origin!==PULSE_ORIGIN)return;
  const payload=event.data||{};
  if(payload.type!=='komo:pulse-world-session')return;
  if(payload.status==='authenticated')acceptPulseBridge(payload,event.source);
  else if(payload.status==='signed_out')window.dispatchEvent(new CustomEvent('komo:world-auth-error',{detail:{message:'Sign in to Pulse to continue.'}}));
});

supabase.auth.onAuthStateChange((_event,session)=>emit(session));

export async function getSession(){
  const {data}=await supabase.auth.getSession();
  return data?.session||null;
}

export async function getProfile(){
  const session=await getSession();
  if(!session?.user)return null;
  const {data}=await supabase.from('profiles').select('id,display_name,first_name,last_name,city,country,interests,locale,avatar_config').eq('id',session.user.id).maybeSingle();
  return data||{id:session.user.id,display_name:session.user.email||'KŌMØ Member'};
}

export async function getAccountRole(){
  const session=await getSession();
  if(!session?.user)return null;
  const {data}=await supabase.from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle();
  return data?.role||null;
}

export async function connectPulse(){
  const session=await getSession();
  if(session?.user){emit(session);return 'connected'}
  if(bridgeBusy&&popup&&!popup.closed){popup.focus?.();return 'pending'}
  bridgeBusy=true;
  const url=PULSE_ORIGIN+'/?world_bridge=1&world_origin='+encodeURIComponent(location.origin);
  popup=window.open(url,'komoPulseWorldBridge','popup=yes,width=520,height=760,resizable=yes,scrollbars=yes');
  if(!popup){bridgeBusy=false;window.location.href=url;return 'redirect'}
  return 'pending';
}

export async function disconnectWorld(){
  await supabase.auth.signOut({scope:'local'});
  emit(null);
}

export function onSession(fn){
  listeners.add(fn);
  return()=>listeners.delete(fn);
}

export function pulseUrl(path=''){
  return PULSE_ORIGIN+'/'+String(path||'').replace(/^\//,'');
}
