import { readFile, writeFile } from 'node:fs/promises';

const root='site/pulse-v12/';
const routerPath=root+'app-router-v2.js';
const authPath=root+'auth-login-canonical.js';

let router=await readFile(routerPath,'utf8');
if(!router.includes('window.KomoPulseApp')){
  const anchor='async function loadAppData(){';
  if(!router.includes(anchor))throw new Error('[pulse-ipad-auth] app-router-v2 loadAppData anchor missing');
  const bridge=`
async function acceptExternalSession(session){
  if(!session?.access_token||!session?.refresh_token)throw new Error('Session Supabase incomplète.');
  if(!state.client)syncClient();
  const {data,error}=await state.client.auth.setSession({
    access_token:session.access_token,
    refresh_token:session.refresh_token
  });
  if(error)throw error;
  const active=data?.session||session;
  await enterApp(active);
  return active;
}
window.KomoPulseApp=Object.assign(window.KomoPulseApp||{},{acceptSession:acceptExternalSession});

`;
  router=router.replace(anchor,bridge+anchor);
  await writeFile(routerPath,router,'utf8');
}

let auth=await readFile(authPath,'utf8');
const direct=`      if(window.KomoPulseApp?.acceptSession){
        await window.KomoPulseApp.acceptSession(session);
        feedback('Connexion réussie.',true);
        window.dispatchEvent(new CustomEvent('komo:session-ready',{detail:{session,source:'canonical-login-live'}}));
        running=false;buttonState(false);
        return;
      }`;
const resilient=`      // app-router-v2 is a module and can finish loading slightly after the
      // non-module login runtime on iPad Safari. Give the live bridge a short
      // deterministic window before using the storage fallback.
      for(let attempt=0;attempt<24&&!window.KomoPulseApp?.acceptSession;attempt++){
        await new Promise(resolve=>setTimeout(resolve,50));
      }
      if(window.KomoPulseApp?.acceptSession){
        await window.KomoPulseApp.acceptSession(session);
        feedback('Connexion réussie.',true);
        window.dispatchEvent(new CustomEvent('komo:session-ready',{detail:{session,source:'canonical-login-live'}}));
        running=false;buttonState(false);
        return;
      }`;
if(auth.includes(direct))auth=auth.replace(direct,resilient);
else if(!auth.includes('for(let attempt=0;attempt<24'))throw new Error('[pulse-ipad-auth] canonical login bridge anchor missing');
await writeFile(authPath,auth,'utf8');

console.log('[pulse-ipad-auth] PASS · generated app-router bridge + Safari delayed-module handoff');
