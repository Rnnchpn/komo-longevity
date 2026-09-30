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


const CLIENT_MODE_KEY='komo_client_entry_mode_v1';
const POST_AUTH_ROUTE='komo_post_auth_route_v1';

function ensureClientEntry(auth,panel,heading){
  if(!panel.querySelector('[data-client-entry]')){
    const entry=document.createElement('section');
    entry.className='auth-client-entry';
    entry.dataset.clientEntry='1';
    entry.innerHTML='<p class="eyebrow">KŌMØ PULSE</p><h2>Que souhaitez-vous faire ?</h2><p>Pulse est l’espace où vous prenez rendez-vous, réalisez vos tests, retrouvez vos résultats et suivez votre trajectoire.</p><div class="auth-client-actions"><button type="button" class="auth-client-card primary" data-client-mode="booking"><span><b>Prendre rendez-vous</b><small>Créer mon profil puis choisir mon bilan et mon créneau.</small></span><i>→</i></button><button type="button" class="auth-client-card" data-client-mode="login"><span><b>J’ai déjà un compte</b><small>Accéder à mes tests, rendez-vous, résultats et suivi.</small></span><i>→</i></button></div><button type="button" class="auth-client-pro" data-client-pro>Professionnel KŌMØ ? Accéder à Pulse Pro →</button>';
    heading.insertAdjacentElement('beforebegin',entry);
    entry.querySelectorAll('[data-client-mode]').forEach(b=>b.addEventListener('click',()=>setClientMode(b.dataset.clientMode)));
    entry.querySelector('[data-client-pro]')?.addEventListener('click',()=>{setClientMode('login');setAudience('professional')});
  }
  if(!panel.querySelector('[data-client-back]')){
    const back=document.createElement('button');
    back.type='button';back.className='auth-client-back';back.dataset.clientBack='1';back.textContent='← Retour';
    heading.insertAdjacentElement('beforebegin',back);
    back.addEventListener('click',()=>setClientMode('choose'));
  }
  const form=panel.querySelector('#loginForm');
  if(form&&!form.querySelector('#signupIdentityFields')){
    const fields=document.createElement('div');
    fields.id='signupIdentityFields';fields.className='auth-signup-identity';
    fields.innerHTML='<div class="auth-signup-grid"><label class="field"><span>Prénom *</span><input id="signupFirstName" autocomplete="given-name"></label><label class="field"><span>Nom *</span><input id="signupLastName" autocomplete="family-name"></label></div><label class="field"><span>Date de naissance *</span><input id="signupBirthDate" type="date" autocomplete="bday"></label><label class="field"><span>Téléphone <small>optionnel</small></span><input id="signupPhone" type="tel" autocomplete="tel" placeholder="+33 …"></label><p>Ces informations ouvrent votre profil et permettent la réservation.</p>';
    form.querySelector('.auth-options')?.insertAdjacentElement('beforebegin',fields);
  }
  if(!auth.dataset.clientMode){const saved=sessionStorage.getItem(CLIENT_MODE_KEY);auth.dataset.clientMode=saved==='booking'?'booking':'login';}
}
function setClientMode(mode){
  const auth=document.querySelector('#authScreen');if(!auth)return;
  auth.dataset.clientMode=mode;sessionStorage.setItem(CLIENT_MODE_KEY,mode);
  if(mode==='booking'){
    sessionStorage.setItem(POST_AUTH_ROUTE,'documents');
    sessionStorage.setItem(AUDIENCE_KEY,'patient');
    auth.dataset.authAudience='patient';
  }else sessionStorage.removeItem(POST_AUTH_ROUTE);
  applyClientMode();
}
function applyClientMode(){
  const auth=document.querySelector('#authScreen');if(!auth)return;
  const pro=auth.dataset.authAudience==='professional',mode=auth.dataset.clientMode||'choose';
  const title=auth.querySelector('.auth-heading h2'),copy=auth.querySelector('.auth-heading p'),signup=auth.querySelector('#signupButton');
  [auth.querySelector('#signupFirstName'),auth.querySelector('#signupLastName'),auth.querySelector('#signupBirthDate')].forEach(x=>{if(x)x.required=!pro&&mode==='booking'});
  if(pro)return;
  if(mode==='booking'){
    if(title)title.textContent='Créez votre profil pour réserver';
    if(copy)copy.textContent='Quelques informations suffisent. Vous choisirez ensuite votre bilan, votre centre et votre créneau.';
    if(signup)signup.textContent='Créer mon profil et réserver →';
  }else if(mode==='login'){
    if(title)title.textContent='Bienvenue';
    if(copy)copy.textContent='Connectez-vous pour retrouver vos tests, rendez-vous, résultats et votre trajectoire KŌMØ.';
    if(signup)signup.textContent='Créer mon espace Pulse';
  }
}

function mount(){
  const auth=document.querySelector('#authScreen'),panel=auth?.querySelector('.auth-panel'),heading=auth?.querySelector('.auth-heading');
  if(!auth||!panel||!heading)return;
  ensureClientEntry(auth,panel,heading);
  if(panel.querySelector('[data-auth-audience-switch]')){applyClientMode();return;}
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
  if(eyebrow)eyebrow.textContent=pro?'KŌMØ PRO · ESPACE CENTRE':'KŌMØ PULSE';
  const manifesto=auth.querySelector('.auth-manifesto');
  if(manifesto){const h=manifesto.querySelector('h1'),p=manifesto.querySelector('p:not(.eyebrow)');if(h)h.textContent=pro?'Bienvenue sur KŌMØ Pro':'Bienvenue sur KŌMØ Pulse';if(p)p.textContent=pro?'Vos patients. Vos analyses. Votre centre.':'Vos résultats. Votre trajectoire. Votre World.'}
  applyClientMode();
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


// KŌMØ Ecosystem Gateway — canonical Pulse / World entry.
const ECOSYSTEM_GATEWAY_SEEN='komo_gateway_seen_session_v1';

function ecosystemGatewayReady(){
  const shell=document.querySelector('#appShell'),auth=document.querySelector('#authScreen');
  return Boolean(shell&&!shell.hidden&&auth?.hidden);
}
function ecosystemGatewayClose(){
  const el=document.querySelector('#komoEcosystemGateway');if(!el)return;
  el.classList.add('is-leaving');
  setTimeout(()=>{el.hidden=true;document.body.classList.remove('komo-gateway-open')},180);
  sessionStorage.setItem(ECOSYSTEM_GATEWAY_SEEN,'1');
}
function ecosystemGatewayPulse(){
  if(authVisible()){
    sessionStorage.setItem(AUDIENCE_KEY,'patient');
    setAudience('patient');
    setClientMode('choose');
    ecosystemGatewayClose();
    return;
  }
  ecosystemGatewayClose();
  setTimeout(()=>window.KomoPatientNavigation?.go?.('home'),70);
}
function ecosystemGatewayWorld(){
  ecosystemGatewayClose();
  location.href='https://komolongevity.com/world/?from=pulse&entry=gateway';
}
function ecosystemGatewayEnsure(){
  let el=document.querySelector('#komoEcosystemGateway');if(el)return el;
  el=document.createElement('section');
  el.id='komoEcosystemGateway';el.className='komo-gateway';el.hidden=true;
  el.setAttribute('aria-label','Choisir votre espace KŌMØ');
  el.innerHTML='<div class="kg-backdrop"></div><div class="kg-shell"><header class="kg-head"><a href="https://komolongevity.com/fr/" class="kg-brand"><span>KŌMØ</span><small>LONGEVITY IN MOTION</small></a></header><div class="kg-intro"><p>KŌMØ</p><h1>Choisissez votre espace.</h1><h2>Deux portes d’entrée, un même écosystème.</h2><small>Pulse pour agir et suivre votre parcours. World pour explorer l’expérience KŌMØ de manière immersive.</small></div><div class="kg-grid kg-grid-two"><button type="button" class="kg-card recommended" data-gateway-action="pulse"><span class="kg-card-top"><i>01</i><em>→</em></span><span class="kg-kicker">AGIR · SUIVRE</span><strong>PULSE</strong><span class="kg-copy">Prendre rendez-vous, réaliser vos tests, préparer votre bilan, retrouver vos résultats et suivre votre progression.</span></button><button type="button" class="kg-card world" data-gateway-action="world"><span class="kg-card-top"><i>02</i><em>↗</em></span><span class="kg-kicker">EXPLORER · VIVRE</span><strong>WORLD</strong><span class="kg-copy">Entrer dans votre Twin, Fitness, Library, Arena, Marina et les expériences immersives KŌMØ.</span></button></div><footer class="kg-foot"><span><b>PULSE</b> est votre espace opérationnel.</span><span><b>WORLD</b> est votre expérience immersive.</span></footer></div>';
  document.body.appendChild(el);
  el.querySelector('[data-gateway-action="pulse"]')?.addEventListener('click',ecosystemGatewayPulse);
  el.querySelector('[data-gateway-action="world"]')?.addEventListener('click',ecosystemGatewayWorld);
  return el;
}
function ecosystemGatewayShow(force=false){
  const onAuth=authVisible(),onApp=ecosystemGatewayReady();
  if(!onAuth&&!onApp)return false;
  if(onAuth&&getAudience()==='professional'&&!force)return false;
  if(!force&&sessionStorage.getItem(ECOSYSTEM_GATEWAY_SEEN)==='1')return false;
  const el=ecosystemGatewayEnsure();
  el.hidden=false;el.classList.remove('is-leaving');document.body.classList.add('komo-gateway-open');
  return true;
}
function ecosystemGatewayInstallReturn(){
  const pop=document.querySelector('#accountPopover');
  if(!pop||pop.querySelector('[data-open-komo-gateway]'))return;
  const btn=document.createElement('button');
  btn.type='button';btn.dataset.openKomoGateway='1';btn.textContent='Pulse / World';
  pop.insertBefore(btn,document.querySelector('#logoutButton')||null);
  btn.addEventListener('click',()=>{pop.hidden=true;ecosystemGatewayShow(true)});
}
function ecosystemGatewaySchedule(){
  if(authVisible()){
    if(!document.querySelector('#komoEcosystemGateway') && sessionStorage.getItem(ECOSYSTEM_GATEWAY_SEEN)!=='1') ecosystemGatewayShow(false);
    if(getAudience()==='professional'){
      const el=document.querySelector('#komoEcosystemGateway');if(el)el.hidden=true;
      document.body.classList.remove('komo-gateway-open');
      return;
    }
    setTimeout(()=>ecosystemGatewayShow(false),40);
    return;
  }
  ecosystemGatewayInstallReturn();
  const pending=sessionStorage.getItem(POST_AUTH_ROUTE);
  if(pending){
    sessionStorage.removeItem(POST_AUTH_ROUTE);
    sessionStorage.setItem(ECOSYSTEM_GATEWAY_SEEN,'1');
    location.hash=pending;
  }
}
window.addEventListener('komo:route-ready',ecosystemGatewaySchedule);
window.addEventListener('komo:session-ready',ecosystemGatewaySchedule);
window.KomoGateway={open:()=>ecosystemGatewayShow(true),close:ecosystemGatewayClose};
