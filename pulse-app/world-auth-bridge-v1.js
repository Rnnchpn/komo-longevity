import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REMEMBER_KEY='komo_pulse_remember';
const allowedOrigins=new Set(['https://komolongevity.com','https://www.komolongevity.com']);

const params=new URLSearchParams(location.search);
if(params.get('world_bridge')==='1'){
  const requested=params.get('world_origin');
  let targetOrigin=allowedOrigins.has(requested)?requested:'https://komolongevity.com';
  try{
    const refOrigin=document.referrer?new URL(document.referrer).origin:'';
    if(allowedOrigins.has(refOrigin))targetOrigin=refOrigin;
  }catch{}

  const storage=localStorage.getItem(REMEMBER_KEY)==='1'?localStorage:sessionStorage;
  const client=createClient(URL,KEY,{auth:{storage,persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  let sentFor='';

  async function profileFor(user){
    try{
      const {data}=await client.from('profiles').select('display_name,avatar_config,interests').eq('id',user.id).maybeSingle();
      return data||{};
    }catch{return{}}
  }

  async function emit(session){
    const target=window.opener||(window.parent!==window?window.parent:null);
    if(!target)return;
    if(!session?.user){
      target.postMessage({type:'komo:pulse-world-session',status:'signed_out'},targetOrigin);
      return;
    }
    if(sentFor===session.access_token)return;
    sentFor=session.access_token;
    const profile=await profileFor(session.user);
    target.postMessage({
      type:'komo:pulse-world-session',
      status:'authenticated',
      session:{
        access_token:session.access_token,
        refresh_token:session.refresh_token,
        expires_at:session.expires_at||null
      },
      profile:{
        display_name:String(profile?.display_name||session.user.user_metadata?.display_name||'KŌMØ Member').slice(0,60),
        avatar_config:profile?.avatar_config&&typeof profile.avatar_config==='object'?profile.avatar_config:{},
        interests:Array.isArray(profile?.interests)?profile.interests.slice(0,8):[]
      }
    },targetOrigin);
    if(window.opener)setTimeout(()=>window.close(),280);
  }

  client.auth.getSession().then(({data})=>emit(data?.session||null)).catch(()=>{});
  client.auth.onAuthStateChange((_event,session)=>{emit(session).catch(()=>{})});
  window.addEventListener('komo:session-ready',()=>client.auth.getSession().then(({data})=>emit(data?.session||null)).catch(()=>{}));
}
