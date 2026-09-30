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

const onboardingPath=root+'patient-onboarding-v1.js';
let onboarding=await readFile(onboardingPath,'utf8');

if(!onboarding.includes('patient-signup-live')){
  const feedbackAnchor="function feedback(el,msg,ok=false){if(!el)return;el.textContent=msg;el.classList.toggle('success',ok)}";
  if(!onboarding.includes(feedbackAnchor))throw new Error('[pulse-ipad-auth] patient onboarding feedback anchor missing');
  onboarding=onboarding.replace(feedbackAnchor,feedbackAnchor+`
async function handoffSignupSession(session){
  if(!session?.access_token||!session?.refresh_token)throw new Error('Session Pulse incomplète.');
  let lastError=null;
  for(let attempt=0;attempt<40;attempt++){
    const accept=window.KomoPulseApp?.acceptSession;
    if(accept){
      try{
        await accept(session);
        window.dispatchEvent(new CustomEvent('komo:session-ready',{detail:{session,source:'patient-signup-live'}}));
        return true;
      }catch(err){lastError=err;break}
    }
    await new Promise(resolve=>setTimeout(resolve,50));
  }
  if(lastError)throw lastError;
  const {error}=await sb().auth.setSession({access_token:session.access_token,refresh_token:session.refresh_token});
  if(error)throw error;
  return false;
}
`);

  const homeFrom="if(data?.session){clearStart();const m=document.querySelector('#patientCreateModal');if(m)m.hidden=true;feedback(out,'Votre espace est prêt. Ouverture de Pulse…',true);setTimeout(()=>location.replace(location.origin+'/#home'),120)}else feedback(out,'Votre espace est créé. Confirmez votre adresse e-mail ; vous arriverez ensuite directement dans Pulse.',true)";
  const homeTo="if(data?.session){const adopted=await handoffSignupSession(data.session);clearStart();const m=document.querySelector('#patientCreateModal');if(m)m.hidden=true;feedback(out,'Votre espace est prêt. Ouverture de Pulse…',true);if(adopted){if(location.hash!=='#home')location.hash='home'}else setTimeout(()=>location.replace(location.origin+'/#home'),120)}else feedback(out,'Votre espace est créé. Confirmez votre adresse e-mail ; vous arriverez ensuite directement dans Pulse.',true)";

  const legacyFrom="if(data?.session)showCheckHandoff();else feedback(out,'Votre espace est créé. Confirmez votre adresse e-mail ; Pulse vous proposera ensuite de commencer votre KŌMØ Check.',true)";
  const legacyTo="if(data?.session){const adopted=await handoffSignupSession(data.session);if(adopted)showCheckHandoff();else{feedback(out,'Votre espace est prêt. Ouverture de Pulse…',true);setTimeout(()=>location.replace(location.origin+'/?start=check'),120)}}else feedback(out,'Votre espace est créé. Confirmez votre adresse e-mail ; Pulse vous proposera ensuite de commencer votre KŌMØ Check.',true)";

  if(onboarding.includes(homeFrom)) onboarding=onboarding.replace(homeFrom,homeTo);
  else if(onboarding.includes(legacyFrom)) onboarding=onboarding.replace(legacyFrom,legacyTo);
  else throw new Error('[pulse-ipad-auth] patient signup session anchor missing');

  // Legacy Check-handoff builds need the historical iPad click and handoff fixes.
  const startFrom="function startKomoCheck(){hideHandoff();location.hash='results';setTimeout(()=>openBaselineWhenReady(0),80)}";
  const startTo="function startKomoCheck(){hideHandoff();const auth=document.querySelector('#authScreen'),app=document.querySelector('#appShell');if((auth&&!auth.hidden)||app?.hidden){location.replace(location.origin+'/?start=check#results');return}location.hash='results';setTimeout(()=>openBaselineWhenReady(0),80)}";
  if(onboarding.includes(startFrom)) onboarding=onboarding.replace(startFrom,startTo);

  const showFrom="function showCheckHandoff(){if(handoffShown)return;handoffShown=true;const m=modal();m.dataset.handoff='1';m.hidden=false;m.innerHTML=\`<div class=\"patient-create-backdrop\"></div><section class=\"patient-create-sheet patient-create-success\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"patientHandoffTitle\"><p class=\"eyebrow\">BIENVENUE DANS KŌMØ</p><h2 id=\"patientHandoffTitle\">Votre espace est prêt.</h2><p>Vous pouvez maintenant établir votre premier point de départ avec le KŌMØ Check.</p><button type=\"button\" class=\"primary-button\" data-start-komo-check>Commencer mon KŌMØ Check →</button><button type=\"button\" class=\"secondary-button\" data-patient-later>Plus tard</button></section>\`}";
  const showTo="function showCheckHandoff(){if(handoffShown)return;handoffShown=true;const m=modal();m.dataset.handoff='1';m.hidden=false;m.innerHTML=\`<div class=\"patient-create-backdrop\"></div><section class=\"patient-create-sheet patient-create-success\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"patientHandoffTitle\"><p class=\"eyebrow\">BIENVENUE DANS KŌMØ</p><h2 id=\"patientHandoffTitle\">Votre espace est prêt.</h2><p>Vous pouvez maintenant établir votre premier point de départ avec le KŌMØ Check.</p><button type=\"button\" class=\"primary-button\" data-start-komo-check>Commencer mon KŌMØ Check →</button><button type=\"button\" class=\"secondary-button\" data-patient-later>Plus tard</button></section>\`;m.querySelector('[data-start-komo-check]')?.addEventListener('click',startKomoCheck);m.querySelector('[data-patient-later]')?.addEventListener('click',()=>{hideHandoff();location.hash='home'})}";
  if(onboarding.includes(showFrom)) onboarding=onboarding.replace(showFrom,showTo);
}

await writeFile(onboardingPath,onboarding,'utf8');

if(!onboarding.includes('patient-signup-live')){
  throw new Error('[pulse-ipad-auth] patient signup live-session patch did not apply');
}

console.log('[pulse-ipad-auth] PASS · login + patient signup handoff hardened for Safari/iPad');
