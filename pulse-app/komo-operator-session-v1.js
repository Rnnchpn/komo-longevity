import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const storage=()=>localStorage.getItem(REM)==='1'?localStorage:sessionStorage;
const client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});

function refreshOperator(delay=500){
  window.setTimeout(()=>window.KomoOperatorV1?.refresh?.(),delay);
}

client.auth.onAuthStateChange((event)=>{
  if(['SIGNED_IN','SIGNED_OUT','USER_UPDATED','TOKEN_REFRESHED'].includes(event)) refreshOperator(event==='SIGNED_IN'?850:250);
});

window.addEventListener('pageshow',()=>refreshOperator(500));
