import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const AUDIENCE_KEY='komo_auth_audience';
const PRO_INTENT='komo_pulse_pro_intent';
const PENDING_KEY='komo_pending_pro_application_v1';
const REMEMBER_KEY='komo_pulse_remember';
let client=null;
let worldBridgeSent='';
let worldBridgeRequestId='';
let worldBridgeAcked=false;
let worldBridgeLastSendAt=0;
let worldBridgeLastPayload=null;
let worldBridgeRetryTimer=null;
const WORLD_BRIDGE_CHANNEL='komo-pulse-world-bridge-v2';
const WORLD_ORIGINS=new Set(['https://komolongevity.com','https://www.komolongevity.com']);
const worldBridgeChannel=typeof BroadcastChannel!=='undefined'?new BroadcastChannel(WORLD_BRIDGE_CHANNEL):null;

function storage(){return localStorage.getItem(REMEMBER_KEY)==='1'?localStorage:sessionStorage}
function sb(){if(!client)client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}
function authVisible(){const a=document.querySelector('#authScreen');return !!a&&!a.hidden}
function getAudience(){const q=new URLSearchParams(location.search);if(q.get('mode')==='professional')return'professional';return sessionStorage.getItem(AUDIENCE_KEY)||'patient'}

function mount(){
  const auth=document.querySelector('#authScreen'),panel=auth?.querySelector('.auth-panel'),heading=auth?.querySelector('.auth-heading');
  if(!auth||!panel||!heading||panel.querySelector('[data-auth-audience-switch]'))return;
  const switcher=document.createElement('div');
  switcher.className='auth-audience-switch';switcher.dataset.authAudienceSwitch='1';
  switcher.innerHTML='<button type="button" data-auth-audience="patient">Patient</button><button type="button" data-auth-audience="professional">Professionnel</button>';
  heading.insertAdjacentElement('beforebegin',switcher);
  const entry=document.createElement('div');entry.className='auth-pro-entry';entry.dataset.authProEntry='1';
  entry.innerHTML='<button type="button" class="secondary-button" data-open-pro-create>Demander un accès KŌMØ Pro →</button><p class="auth-pro-note">Accès réservé aux professionnels et centres partenaires validés par KŌMØ.</p>';
  panel.querySelector('.auth-footer-links')?.insertAdjacentElement('beforebegin',entry);
  switcher.querySelectorAll('[data-auth-audience]').forEach(b=>b.addEventListener('click',()=>setAudience(b.dataset.authAudience)));
  entry.querySelector('[data-open-pro-create]')?.addEventListener('click',openCreate);
  setAudience(getAudience());
}

function setAudience(mode){
  const auth=document.querySelector('#authScreen');if(!auth)return;
  const pro=mode==='professional';sessionStorage.setItem(AUDIENCE_KEY,pro?'professional':'patient');
  if(pro)sessionStorage.setItem(PRO_INTENT,'1');
  auth.dataset.authAudience=pro?'professional':'patient';
  auth.querySelectorAll('[data-auth-audience]').forEach(b=>b.classList.toggle('active',b.dataset.authAudience===(pro?'professional':'patient')));
  const title=auth.querySelector('.auth-heading h2'),copy=auth.querySelector('.auth-heading p'),submit=auth.querySelector('#loginButton span:first-child'),pill=auth.querySelector('.product-pill'),eyebrow=auth.querySelector('.auth-manifesto .eyebrow');
  if(title)title.textContent=pro?'KŌMØ Pro':'Bienvenue';
  if(copy)copy.textContent=pro?'Connectez-vous à votre centre pour gérer consultations, patients et analyses Motion.':'Connectez-vous pour retrouver votre espace KŌMØ.';
  if(submit)submit.textContent=pro?'Accéder à mon centre':'Se connecter';
  if(pill)pill.textContent=pro?'Pulse · Pro':'Pulse';
  if(eyebrow)eyebrow.textContent=pro?'KŌMØ PRO · ESPACE CENTRE':'KŌMØ PULSE · VOTRE ESPACE';
  const manifesto=auth.querySelector('.auth-manifesto');
  if(manifesto){const h=manifesto.querySelector('h1'),p=manifesto.querySelector('p:not(.eyebrow)');if(h)h.innerHTML=pro?'Votre centre,<br><em>en mouvement.</em>':'Votre santé,<br><em>en mouvement.</em>';if(p)p.textContent=pro?'Consultations, dossiers patients, Motion et analyses réunis dans un espace professionnel pensé pour le desktop.':'Résultats, consultations, progression et données KŌMØ réunis dans un seul espace personnel.'}
}

function modal(){let m=document.querySelector('#proCreateModal');if(m)return m;m=document.createElement('div');m.id='proCreateModal';m.className='pro-create-modal';m.hidden=true;document.body.appendChild(m);return m}
function openCreate(){const m=modal();m.hidden=false;m.innerHTML=`<div class="pro-create-backdrop" data-pro-create-close></div><section class="pro-create-sheet" role="dialog" aria-modal="true" aria-labelledby="proCreateTitle"><button class="pro-create-close" type="button" data-pro-create-close>×</button><p class="eyebrow">KŌMØ PRO</p><h2 id="proCreateTitle">Demander un compte professionnel.</h2><p class="pro-create-lead">Créez votre identifiant Pulse puis soumettez votre demande d’accès. Le compte reste sans droits professionnels jusqu’à validation KŌMØ.</p><form id="proCreateForm" class="pro-create-form"><div class="pro-create-scope"><label><input type="radio" name="access_scope" value="motion" checked><small>Mesure</small><strong>KŌMØ Motion</strong><p>Tests, acquisition MyoCare/Myodev et suivi opérateur.</p></label><label><input type="radio" name="access_scope" value="clinical"><small>Clinique</small><strong>KŌMØ Clinical</strong><p>Interprétation, validation et plan professionnel.</p></label></div><div class="pro-create-fields"><label class="field"><span>Adresse e-mail *</span><input name="email" type="email" autocomplete="email" required></label><label class="field"><span>Mot de passe *</span><input name="password" type="password" autocomplete="new-password" minlength="6" required></label><label class="field"><span>Fonction / titre *</span><input name="professional_title" required placeholder="Médecin, physiothérapeute, opérateur…"></label><label class="field"><span>Établissement *</span><input name="organization_name" required placeholder="Cabinet, clinique, centre…"></label><label class="field"><span>Territoire *</span><input name="territory" required placeholder="France, Espagne, Belgique…"></label><label class="field"><span>Site web</span><input name="website" type="url" placeholder="https://"></label></div><div class="pro-create-clinical" id="proCreateClinical" hidden><div class="pro-create-fields"><label class="field"><span>Registre professionnel *</span><select name="registration_system"><option value="">Sélectionner</option><option value="RPPS">RPPS — France</option><option value="National registry">Registre national / équivalent</option><option value="Other regulated registry">Autre registre professionnel réglementé</option></select></label><label class="field"><span>Identifiant professionnel *</span><input name="registration_identifier" placeholder="RPPS ou équivalent"></label></div></div><label class="pro-create-message"><span>Votre projet</span><textarea name="message" rows="4" placeholder="Décrivez brièvement votre usage de KŌMØ."></textarea></label><label class="pro-create-consent"><input type="checkbox" name="consent" required><span>Je confirme que les informations transmises sont exactes et j’accepte qu’elles soient vérifiées par KŌMØ avant activation de l’accès professionnel.</span></label><button class="primary-button pro-create-submit" type="submit">Créer mon compte & envoyer la demande →</button><p class="pro-create-feedback" id="proCreateFeedback"></p></form></section>`;
  m.querySelectorAll('[data-pro-create-close]').forEach(b=>b.addEventListener('click',()=>m.hidden=true));
  const f=m.querySelector('#proCreateForm');
  const sync=()=>{const clinical=f.querySelector('[name="access_scope"]:checked')?.value==='clinical',box=m.querySelector('#proCreateClinical');box.hidden=!clinical;box.querySelectorAll('select,input').forEach(x=>x.required=clinical)};
  f.querySelectorAll('[name="access_scope"]').forEach(x=>x.addEventListener('change',sync));sync();f.addEventListener('submit',submitCreate);
}

function payloadFrom(form){const fd=new FormData(form);return{action:'submit',access_scope:String(fd.get('access_scope')||''),professional_title:String(fd.get('professional_title')||'').trim(),organization_name:String(fd.get('organization_name')||'').trim(),territory:String(fd.get('territory')||'').trim(),website:String(fd.get('website')||'').trim(),registration_system:String(fd.get('registration_system')||'').trim(),registration_identifier:String(fd.get('registration_identifier')||'').trim(),message:String(fd.get('message')||'').trim()}}
function signupMetadata(payload){return{komo_pro_application:true,komo_pro_access_scope:payload.access_scope,komo_pro_title:payload.professional_title,komo_pro_organization:payload.organization_name,komo_pro_territory:payload.territory,komo_pro_website:payload.website||'',komo_pro_registration_system:payload.registration_system||'',komo_pro_registration_identifier:payload.registration_identifier||'',komo_pro_message:payload.message||''}}
async function submitApplication(c,payload){const {data,error}=await c.functions.invoke('professional-application',{body:payload});if(error)throw new Error(error.message||'Impossible d’envoyer la demande.');if(data?.error)throw new Error(data.detail||data.error);return data}
async function ensureApplication(c,payload){
  const {data:statusData,error:statusError}=await c.functions.invoke('professional-application',{body:{action:'status'}});
  if(!statusError&&statusData?.applications?.some(a=>['submitted','under_review','approved'].includes(a.status)))return{ok:true,existing:true};
  try{return await submitApplication(c,payload)}catch(err){const msg=String(err?.message||err);if(msg.includes('application_already_open'))return{ok:true,existing:true};throw err}
}
async function submitCreate(e){
  e.preventDefault();const f=e.currentTarget,out=document.querySelector('#proCreateFeedback'),btn=f.querySelector('button[type="submit"]');
  const fd=new FormData(f),email=String(fd.get('email')||'').trim(),password=String(fd.get('password')||''),payload=payloadFrom(f);
  if(password.length<6)return feedback(out,'Le mot de passe doit contenir au moins 6 caractères.');
  btn.disabled=true;feedback(out,'Création du compte et enregistrement de la demande…');
  try{
    sessionStorage.setItem(PRO_INTENT,'1');sessionStorage.setItem(AUDIENCE_KEY,'professional');
    localStorage.setItem(PENDING_KEY,JSON.stringify(payload));
    const c=sb();const {data,error}=await c.auth.signUp({email,password,options:{emailRedirectTo:'https://pulse.komolongevity.com/?mode=professional',data:signupMetadata(payload)}});
    if(error)throw error;
    if(data?.session){await ensureApplication(c,payload);localStorage.removeItem(PENDING_KEY);feedback(out,'Compte créé. Votre demande professionnelle est enregistrée et en attente de validation KŌMØ.',true);setTimeout(()=>{location.href='https://pulse.komolongevity.com/?mode=professional'},900)}
    else{feedback(out,'Compte créé et demande enregistrée. Confirmez maintenant votre adresse e-mail ; votre accès professionnel restera bloqué jusqu’à validation KŌMØ.',true)}
  }catch(err){const msg=String(err?.message||err);feedback(out,msg.includes('already registered')?'Un compte existe déjà avec cette adresse. Fermez ce formulaire puis connectez-vous dans l’onglet Professionnel pour finaliser votre demande.':msg)}finally{btn.disabled=false}
}
function feedback(el,msg,success=false){if(!el)return;el.textContent=msg;el.classList.toggle('success',success)}

async function attemptPending(){
  const raw=localStorage.getItem(PENDING_KEY);if(!raw)return;
  let payload;try{payload=JSON.parse(raw)}catch{localStorage.removeItem(PENDING_KEY);return}
  const c=sb(),{data:{session}}=await c.auth.getSession();if(!session?.user)return;
  try{await ensureApplication(c,payload);localStorage.removeItem(PENDING_KEY);sessionStorage.setItem(PRO_INTENT,'1');showToast('Votre demande de compte professionnel est bien enregistrée et en attente de validation KŌMØ.')}catch(err){console.error('[pro-application-recovery]',err)}
}
function showToast(msg){const t=document.querySelector('#toast');if(t){t.textContent=msg;t.hidden=false;setTimeout(()=>t.hidden=true,3800)}}


function worldBridgeConfig(){
  const q=new URLSearchParams(location.search);
  if(q.get('world_bridge')!=='1')return null;
  const requested=q.get('world_origin');
  const targetOrigin=WORLD_ORIGINS.has(requested)?requested:'https://komolongevity.com';
  return{targetOrigin};
}
async function worldBridgeProfile(c,session){
  let profile={};
  try{const r=await c.from('profiles').select('display_name,avatar_config,interests').eq('id',session.user.id).maybeSingle();profile=r.data||{}}catch{}
  return{
    display_name:String(profile?.display_name||session.user.user_metadata?.display_name||'KŌMØ Member').slice(0,60),
    avatar_config:profile?.avatar_config&&typeof profile.avatar_config==='object'?profile.avatar_config:{},
    interests:Array.isArray(profile?.interests)?profile.interests.slice(0,8):[]
  };
}
function worldBridgePayload(session,profile,requestId=''){
  return{
    type:'komo:pulse-world-session',
    status:'authenticated',
    request_id:requestId||'',
    session:{access_token:session.access_token,refresh_token:session.refresh_token,expires_at:session.expires_at||null},
    profile
  };
}
function sendWorldBridgePayload(cfg,payload){
  if(!window.opener)return false;
  worldBridgeAcked=false;worldBridgeLastSendAt=Date.now();worldBridgeLastPayload=payload;
  window.opener.postMessage(payload,cfg.targetOrigin);
  showToast('Connexion à KŌMØ World…');
  return true;
}
async function worldBridgeAttempt(){
  const cfg=worldBridgeConfig();if(!cfg||!window.opener)return;
  const c=sb(),{data:{session}}=await c.auth.getSession();
  if(session?.user){
    if(worldBridgeAcked)return;
    if(worldBridgeSent===session.access_token&&Date.now()-worldBridgeLastSendAt<850)return;
    worldBridgeSent=session.access_token;
    const profile=await worldBridgeProfile(c,session);
    sendWorldBridgePayload(cfg,worldBridgePayload(session,profile,worldBridgeRequestId));
    return;
  }
  // If the session came from another Pulse tab through BroadcastChannel, keep retrying
  // the already received payload until World confirms it.
  if(worldBridgeLastPayload&&!worldBridgeAcked){
    if(Date.now()-worldBridgeLastSendAt>=850)sendWorldBridgePayload(cfg,worldBridgeLastPayload);
    return;
  }
  // A Pulse session stored in sessionStorage belongs to the existing Pulse tab.
  // Ask that same-origin tab for a one-time transfer instead of forcing another login.
  if(worldBridgeChannel&&!worldBridgeRequestId){
    worldBridgeRequestId=(crypto?.randomUUID?.()||('wb-'+Date.now()+'-'+Math.random().toString(16).slice(2)));
    worldBridgeChannel.postMessage({type:'komo:pulse-world-session-request',request_id:worldBridgeRequestId,requested_at:Date.now()});
    showToast('Recherche de votre session Pulse ouverte…');
  }
}
if(worldBridgeChannel){
  worldBridgeChannel.addEventListener('message',async event=>{
    const d=event.data||{};
    if(d.type==='komo:pulse-world-session-request'&&d.request_id){
      const c=sb(),{data:{session}}=await c.auth.getSession();
      if(!session?.user)return;
      const profile=await worldBridgeProfile(c,session);
      worldBridgeChannel.postMessage({
        type:'komo:pulse-world-session-response',
        request_id:d.request_id,
        payload:worldBridgePayload(session,profile,d.request_id)
      });
      return;
    }
    if(d.type==='komo:pulse-world-session-response'&&d.request_id&&d.request_id===worldBridgeRequestId){
      const cfg=worldBridgeConfig();if(!cfg||!window.opener||!d.payload)return;
      worldBridgeSent=d.payload.session?.access_token||'';
      sendWorldBridgePayload(cfg,d.payload);
    }
  });
}
window.addEventListener('message',event=>{
  const cfg=worldBridgeConfig();if(!cfg||event.origin!==cfg.targetOrigin)return;
  const d=event.data||{};if(d.type!=='komo:world-bridge-ack')return;
  if(d.status==='connected'){
    worldBridgeAcked=true;
    if(worldBridgeRetryTimer){clearInterval(worldBridgeRetryTimer);worldBridgeRetryTimer=null}
    showToast('KŌMØ World connecté.');
    setTimeout(()=>{try{window.close()}catch{}},350);
  }else if(d.status==='error'){
    showToast('Connexion World impossible. Réessayez depuis le bouton CONNECT WORLD.');
  }
});

function schedule(){mount();if(authVisible())setAudience(getAudience());attemptPending().catch(console.error);worldBridgeAttempt().catch(console.error);ecosystemGatewaySchedule()}
const obs=new MutationObserver(()=>setTimeout(schedule,80));obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,300));
window.addEventListener('pageshow',()=>setTimeout(schedule,150));window.addEventListener('komo:session-ready',()=>worldBridgeAttempt().catch(console.error));
setTimeout(schedule,700);
if(worldBridgeConfig()){
  worldBridgeRetryTimer=setInterval(()=>{if(worldBridgeAcked){clearInterval(worldBridgeRetryTimer);worldBridgeRetryTimer=null;return}worldBridgeAttempt().catch(console.error)},900);
}
window.addEventListener('pagehide',()=>{if(worldBridgeRetryTimer){clearInterval(worldBridgeRetryTimer);worldBridgeRetryTimer=null}});


// KŌMØ Ecosystem Gateway — lives inside the canonical auth controller.
const ECOSYSTEM_GATEWAY_SEEN='komo_gateway_seen_session_v1';
const ECOSYSTEM_INITIAL_HASH=location.hash;
function ecosystemGatewayStyles(){
  if(document.querySelector('#komoGatewayStyle'))return;
  const s=document.createElement('style');s.id='komoGatewayStyle';s.textContent=`
body.komo-gateway-open{overflow:hidden}.komo-gateway[hidden]{display:none!important}.komo-gateway{position:fixed;inset:0;z-index:1200;display:grid;place-items:center;padding:28px;isolation:isolate}.kg-backdrop{position:absolute;inset:0;background:rgba(239,237,231,.92);backdrop-filter:blur(24px) saturate(.95)}.kg-shell{position:relative;width:min(1180px,100%);max-height:calc(100dvh - 56px);overflow:auto;padding:34px;border:1px solid rgba(21,21,18,.08);border-radius:34px;background:rgba(251,250,247,.97);box-shadow:0 34px 100px rgba(36,32,25,.14);transition:opacity .22s ease,transform .22s ease}.komo-gateway.is-leaving .kg-shell{opacity:0;transform:translateY(8px) scale(.992)}.kg-head{display:flex;align-items:center;justify-content:space-between;gap:20px}.kg-brand{display:flex;align-items:baseline;gap:13px;text-decoration:none}.kg-brand span{font:600 22px/1 Georgia,serif;letter-spacing:.10em}.kg-brand small{font-size:8px;font-weight:700;letter-spacing:.18em;color:#8d887f}.kg-close{width:40px;height:40px;border:1px solid rgba(21,21,18,.09);border-radius:50%;background:#fff;cursor:pointer;font-size:22px;line-height:1}.kg-intro{padding:64px 2px 38px}.kg-intro>p{margin:0 0 14px;font-size:9px;font-weight:700;letter-spacing:.18em;color:#59675d}.kg-intro h1{margin:0;font-size:clamp(46px,7vw,92px);line-height:.88;font-weight:500;letter-spacing:-.065em}.kg-intro h2{margin:18px 0 10px;font-size:clamp(18px,2vw,28px);font-weight:500;letter-spacing:-.035em;color:#4c4942}.kg-intro small{display:block;max-width:680px;font-size:12px;line-height:1.65;color:#817c73}.kg-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.kg-card{position:relative;min-height:310px;padding:28px;text-align:left;border:1px solid rgba(21,21,18,.09);border-radius:26px;background:#f5f2ec;cursor:pointer;display:flex;flex-direction:column;align-items:stretch;transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease}.kg-card:hover{transform:translateY(-4px);border-color:rgba(21,21,18,.16);box-shadow:0 22px 52px rgba(36,32,25,.08)}.kg-card.recommended{background:linear-gradient(145deg,#f7f5ef,#e7ebe5);border-color:rgba(89,103,93,.16)}.kg-card.world{background:linear-gradient(145deg,#1c2e25,#243a2e);color:#f3ede3;border-color:rgba(255,255,255,.08)}.kg-card-top{display:flex;align-items:center;justify-content:space-between}.kg-card-top i{font-style:normal;font-size:10px;letter-spacing:.12em;color:#8d887f}.kg-card.world .kg-card-top i{color:rgba(243,237,227,.50)}.kg-card-top em{font-style:normal;font-size:22px;font-weight:300}.kg-kicker{margin-top:auto;padding-top:72px;font-size:8px;font-weight:750;letter-spacing:.16em;color:#59675d}.kg-card.world .kg-kicker{color:#d5b477}.kg-card strong{display:block;margin-top:9px;font-size:clamp(26px,3vw,42px);font-weight:500;letter-spacing:-.055em}.kg-copy{display:block;margin-top:12px;max-width:34ch;font-size:11px;line-height:1.65;color:#77736b}.kg-card.world .kg-copy{color:rgba(243,237,227,.62)}.kg-foot{display:flex;justify-content:space-between;gap:20px;padding:22px 4px 0;font-size:9px;color:#8d887f}.kg-foot b{color:#4c4942;font-weight:700}
@media(max-width:850px){.komo-gateway{padding:14px}.kg-shell{padding:22px;border-radius:26px;max-height:calc(100dvh - 28px)}.kg-intro{padding:38px 0 26px}.kg-grid{grid-template-columns:1fr}.kg-card{min-height:190px;padding:22px}.kg-kicker{padding-top:38px}.kg-foot{display:none}.kg-brand small{display:none}}
@media(max-width:520px){.komo-gateway{padding:0}.kg-shell{min-height:100dvh;max-height:100dvh;border-radius:0;border:0;padding:calc(18px + env(safe-area-inset-top)) 18px calc(22px + env(safe-area-inset-bottom))}.kg-intro h1{font-size:48px}.kg-intro h2{font-size:18px}.kg-card{min-height:174px;border-radius:22px}}
`;document.head.appendChild(s);
}
function ecosystemGatewayIsPro(){
  const mode=document.querySelector('#modeSwitch');
  return Boolean(mode&&!mode.hidden);
}
function ecosystemGatewayReady(){
  const shell=document.querySelector('#appShell'),auth=document.querySelector('#authScreen'),root=document.querySelector('#viewRoot');
  return Boolean(shell&&!shell.hidden&&auth?.hidden&&root);
}
function ecosystemGatewayName(){
  const raw=document.querySelector('#accountName')?.textContent?.trim()||'';
  return raw&&raw!=='Compte KŌMØ'?raw.split(/\s+/)[0]:'';
}
function ecosystemGatewayClose(){
  const el=document.querySelector('#komoEcosystemGateway');if(!el)return;
  el.classList.add('is-leaving');
  setTimeout(()=>{el.hidden=true;document.body.classList.remove('komo-gateway-open')},220);
  sessionStorage.setItem(ECOSYSTEM_GATEWAY_SEEN,'1');
}
function ecosystemGatewayGo(route){
  ecosystemGatewayClose();
  setTimeout(()=>{location.hash=route},80);
}
function ecosystemGatewayWorld(){
  ecosystemGatewayClose();
  const url='https://komolongevity.com/world/?from=pulse&entry=gateway';
  const win=window.open(url,'_blank');
  if(!win)location.href=url;
}
function ecosystemGatewayCard(num,kicker,title,copy,action,extra=''){
  return '<button type="button" class="kg-card '+extra+'" data-gateway-action="'+action+'"><span class="kg-card-top"><i>'+num+'</i><em>→</em></span><span class="kg-kicker">'+kicker+'</span><strong>'+title+'</strong><span class="kg-copy">'+copy+'</span></button>';
}
function ecosystemGatewayEnsure(){
  let el=document.querySelector('#komoEcosystemGateway');if(el)return el;
  ecosystemGatewayStyles();el=document.createElement('section');el.id='komoEcosystemGateway';el.className='komo-gateway';el.hidden=true;el.setAttribute('aria-label','Choisir votre espace KŌMØ');
  el.innerHTML='<div class="kg-backdrop"></div><div class="kg-shell"><header class="kg-head"><a href="https://komolongevity.com/fr/" class="kg-brand" target="_blank" rel="noopener noreferrer"><span>KŌMØ</span><small>ONE ACCOUNT · ONE ECOSYSTEM</small></a><button type="button" class="kg-close" data-gateway-close aria-label="Fermer">×</button></header><div class="kg-intro"><p>KŌMØ GATEWAY</p><h1>Bienvenue<span class="kg-name"></span>.</h1><h2>Comment souhaitez-vous entrer aujourd’hui ?</h2><small>Le même compte vous accompagne partout. Vous pouvez changer d’espace à tout moment.</small></div><div class="kg-grid">'+
    ecosystemGatewayCard('01','VOTRE TRAJECTOIRE','MY KŌMØ','Votre priorité, vos résultats, votre Motion Passport, votre progression et votre prochain point.','my','recommended')+
    ecosystemGatewayCard('02','L’ÉCOSYSTÈME','EXPLORE','Network, expériences, hôtels, Yachting, Retreats, Life et contenus KŌMØ.','explore')+
    ecosystemGatewayCard('03','MODE SPATIAL','WORLD','Entrez dans votre Twin, Fitness, Library, Arena et Marina dans l’expérience 3D.','world','world')+
    '</div><footer class="kg-foot"><span><b>MY KŌMØ</b> pour être accompagné au quotidien.</span><span><b>WORLD</b> quand l’immersion apporte quelque chose.</span></footer></div>';
  document.body.appendChild(el);
  el.querySelector('[data-gateway-close]')?.addEventListener('click',ecosystemGatewayClose);
  el.querySelector('[data-gateway-action="my"]')?.addEventListener('click',()=>ecosystemGatewayGo('home'));
  el.querySelector('[data-gateway-action="explore"]')?.addEventListener('click',()=>ecosystemGatewayGo('explore'));
  el.querySelector('[data-gateway-action="world"]')?.addEventListener('click',ecosystemGatewayWorld);
  return el;
}
function ecosystemGatewayShow(force=false){
  if(!ecosystemGatewayReady()||ecosystemGatewayIsPro())return false;
  if(!force){
    if(ECOSYSTEM_INITIAL_HASH&&ECOSYSTEM_INITIAL_HASH!=='#gateway')return false;
    if(sessionStorage.getItem(ECOSYSTEM_GATEWAY_SEEN)==='1')return false;
  }
  const el=ecosystemGatewayEnsure(),name=ecosystemGatewayName(),target=el.querySelector('.kg-name');
  if(target)target.textContent=name?' '+name:'';
  el.hidden=false;el.classList.remove('is-leaving');document.body.classList.add('komo-gateway-open');return true;
}
function ecosystemGatewayInstallReturn(){
  const pop=document.querySelector('#accountPopover');if(!pop||pop.querySelector('[data-open-komo-gateway]'))return;
  const btn=document.createElement('button');btn.type='button';btn.dataset.openKomoGateway='1';btn.textContent='Changer d’espace KŌMØ';
  pop.insertBefore(btn,document.querySelector('#logoutButton')||null);
  btn.addEventListener('click',()=>{pop.hidden=true;sessionStorage.removeItem(ECOSYSTEM_GATEWAY_SEEN);ecosystemGatewayShow(true)});
}
function ecosystemGatewaySchedule(){
  if(authVisible()){sessionStorage.removeItem(ECOSYSTEM_GATEWAY_SEEN);return}
  ecosystemGatewayInstallReturn();setTimeout(()=>ecosystemGatewayShow(false),50);
}
window.addEventListener('komo:route-ready',ecosystemGatewaySchedule);
window.addEventListener('komo:session-ready',ecosystemGatewaySchedule);
window.addEventListener('hashchange',()=>{if(location.hash==='#gateway'){sessionStorage.removeItem(ECOSYSTEM_GATEWAY_SEEN);ecosystemGatewayShow(true)}});
window.KomoGateway={open:()=>ecosystemGatewayShow(true),close:ecosystemGatewayClose};
