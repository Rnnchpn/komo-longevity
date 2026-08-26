import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const INTENT='komo_pulse_pro_intent';
const P={client:null,session:null,role:'member',applications:[],open:false,loading:false,formScope:null,lastLoad:0};
let refreshTimer=null,lifecycleBound=false;

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){if(!P.client)P.client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return P.client}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function statusLabel(v){return({submitted:'Demande reçue',under_review:'En cours de revue',approved:'Accès approuvé',declined:'Demande refusée'})[v]||v||'—'}
function scopeLabel(v){return v==='motion'?'KŌMØ Motion Operator':'KŌMØ Clinical Practitioner'}
function oppositeScope(v){return v==='motion'?'clinical':'motion'}
function openApplication(){return P.applications.find(x=>['submitted','under_review'].includes(x.status))||null}
function latestApproved(){return P.applications.find(x=>x.status==='approved')||null}

async function invoke(body){
  const {data,error}=await sb().functions.invoke('professional-application',{body});
  if(error)throw new Error(error.message||'Erreur serveur');
  if(data?.error){
    const map={clinical_registration_required:'Un identifiant professionnel est requis pour KŌMØ Clinical.',application_already_open:'Une demande est déjà en cours.',missing_required_fields:'Complétez les champs obligatoires.',invalid_access_scope:'Choisissez Motion ou Clinical.'};
    throw new Error(map[data.error]||data.detail||data.error);
  }
  return data;
}

async function load(force=false){
  const now=Date.now();
  if(!force&&P.session&&now-P.lastLoad<8000)return true;
  const {data:{session}}=await sb().auth.getSession();
  P.session=session;
  if(!session?.user)return false;
  const [rr,r]=await Promise.all([
    sb().from('account_roles').select('role').eq('user_id',session.user.id).maybeSingle(),
    invoke({action:'status'})
  ]);
  P.role=rr.data?.role||'member';
  P.applications=r.applications||[];
  P.lastLoad=Date.now();
  return true;
}

function ensureAccountEntry(){
  const pop=document.querySelector('#accountPopover');
  if(!pop||!P.session?.user)return;
  let a=pop.querySelector('[data-pro-application]');
  if(!a){
    a=document.createElement('a');a.href='#';a.dataset.proApplication='1';
    const profile=pop.querySelector('[data-route="profile"]');
    if(profile)profile.insertAdjacentElement('afterend',a);else pop.prepend(a);
  }
  const pending=openApplication(),approved=latestApproved();
  if(pending)a.textContent=`Accès professionnel · ${statusLabel(pending.status)}`;
  else if(approved&&['professional','admin'].includes(P.role))a.textContent=`KŌMØ Pro · ${scopeLabel(approved.access_scope)}`;
  else a.textContent='Demander un accès professionnel';
  a.onclick=e=>{e.preventDefault();P.open=true;P.formScope=null;renderModal()};
}

function preAuthCopy(){
  const auth=document.querySelector('#authScreen');if(!auth||auth.hidden)return;
  const pro=sessionStorage.getItem(INTENT)==='1';
  const heading=document.querySelector('.auth-heading p');
  if(pro&&heading)heading.textContent='Connectez-vous ou créez votre compte Pulse, puis choisissez votre accès Motion ou Clinical.';
}

function modalShell(){let m=document.querySelector('#proApplicationModal');if(m)return m;m=document.createElement('div');m.id='proApplicationModal';m.className='pro-app-modal';m.hidden=true;document.body.appendChild(m);return m}

function renderModal(){
  const m=modalShell();m.hidden=!P.open;if(!P.open)return;
  const pending=openApplication(),approved=latestApproved();
  let body='';
  if(pending&&!P.formScope)body=statusCard(pending);
  else if(approved&&!P.formScope)body=approvedCard(approved);
  else body=formHtml(P.formScope||null);
  m.innerHTML=`<div class="pro-app-backdrop" data-pro-close></div><section class="pro-app-sheet" role="dialog" aria-modal="true" aria-labelledby="proAppTitle"><button class="pro-app-close" type="button" data-pro-close aria-label="Fermer">×</button><p class="eyebrow">KŌMØ PRO</p><h2 id="proAppTitle">${P.formScope?'Nouvelle habilitation professionnelle':'Votre accès professionnel'}</h2><p class="pro-app-lead">Motion et Clinical sont deux habilitations distinctes. L’accès est activé uniquement après validation KŌMØ.</p>${body}</section>`;
  bindModal();
}

function statusCard(x){return`<div class="pro-app-status ${x.status}"><span>${statusLabel(x.status)}</span><strong>${scopeLabel(x.access_scope)}</strong><p>${esc(x.organization_name)} · ${esc(x.territory)}</p><small>${x.status==='under_review'?'L’équipe KŌMØ examine actuellement votre demande.':'Votre demande a été transmise à l’équipe KŌMØ.'}</small></div><button class="secondary-button" type="button" data-pro-close>Fermer</button>`}

function approvedCard(x){
  const other=oppositeScope(x.access_scope);
  const canRequest=P.role!=='admin';
  return`<div class="pro-app-status approved"><span>Accès actif</span><strong>${scopeLabel(x.access_scope)}</strong><p>${esc(x.organization_name)} · ${esc(x.territory)}</p><small>Votre habilitation actuelle reste active.</small></div><div style="display:flex;gap:10px;flex-wrap:wrap"><button class="primary-button" type="button" data-open-pro>Ouvrir KŌMØ Pro →</button>${canRequest?`<button class="secondary-button" type="button" data-pro-new-scope="${other}">Demander ${other==='clinical'?'Clinical':'Motion'} →</button>`:''}</div>`;
}

function formHtml(scope=null){
  const motionChecked=scope!=='clinical';
  const clinicalChecked=scope==='clinical';
  return`<form id="proApplicationForm" class="pro-app-form"><div class="pro-scope-grid"><label class="pro-scope-card"><input type="radio" name="access_scope" value="motion" ${motionChecked?'checked':''}><span class="pro-scope-kicker">MESURE</span><strong>KŌMØ Motion</strong><p>Acquisition, tests fonctionnels, MyoCare/Myodev et suivi opérateur.</p><small>Aucun RPPS requis. Pas d’interprétation Clinical.</small></label><label class="pro-scope-card"><input type="radio" name="access_scope" value="clinical" ${clinicalChecked?'checked':''}><span class="pro-scope-kicker">CLINIQUE</span><strong>KŌMØ Clinical</strong><p>Interprétation clinique, validation et plan de suivi professionnel.</p><small>Identifiant professionnel vérifiable requis.</small></label></div><div class="pro-app-fields"><label><span>Fonction / titre professionnel *</span><input name="professional_title" required placeholder="Ex. Médecin, opérateur Motion, physiothérapeute…"></label><label><span>Établissement *</span><input name="organization_name" required placeholder="Nom du cabinet, centre ou structure"></label><label><span>Territoire *</span><input name="territory" required placeholder="France, Espagne, Belgique…"></label><label><span>Site web</span><input name="website" type="url" placeholder="https://"></label></div><div id="proClinicalFields" class="pro-clinical-fields" hidden><div class="pro-app-fields"><label><span>Registre professionnel *</span><select name="registration_system"><option value="">Sélectionner</option><option value="RPPS">RPPS — France</option><option value="National registry">Registre national / équivalent</option><option value="Other regulated registry">Autre registre professionnel réglementé</option></select></label><label><span>Identifiant professionnel *</span><input name="registration_identifier" placeholder="RPPS ou identifiant équivalent"></label></div><p>Pour KŌMØ Clinical, l’identifiant doit pouvoir être vérifié avant activation.</p></div><label class="pro-app-message"><span>Votre projet</span><textarea name="message" rows="4" placeholder="Décrivez brièvement votre usage de KŌMØ."></textarea></label><div class="pro-app-consent"><strong>Activation contrôlée</strong><span>Le compte reste membre tant que KŌMØ n’a pas approuvé la demande. Les nouveaux établissements sont activés en mode test_only.</span></div><button class="primary-button" type="submit" id="proApplicationSubmit">Envoyer ma demande →</button><p id="proApplicationFeedback" class="auth-feedback"></p></form>`;
}

function bindModal(){
  document.querySelectorAll('[data-pro-close]').forEach(b=>b.addEventListener('click',()=>{P.open=false;P.formScope=null;renderModal()}));
  document.querySelector('[data-open-pro]')?.addEventListener('click',()=>{P.open=false;P.formScope=null;renderModal();document.querySelector('#modeSwitch button[data-mode="clinical"]')?.click()});
  document.querySelector('[data-pro-new-scope]')?.addEventListener('click',e=>{P.formScope=e.currentTarget.dataset.proNewScope||null;renderModal()});
  const f=document.querySelector('#proApplicationForm');if(!f)return;
  const sync=()=>{const clinical=f.querySelector('[name="access_scope"]:checked')?.value==='clinical',box=document.querySelector('#proClinicalFields');if(box)box.hidden=!clinical;for(const el of box?.querySelectorAll('select,input')||[])el.required=clinical};
  f.querySelectorAll('[name="access_scope"]').forEach(x=>x.addEventListener('change',sync));sync();f.addEventListener('submit',submit);
}

async function submit(e){
  e.preventDefault();if(P.loading)return;
  const f=e.currentTarget,fd=new FormData(f),payload={action:'submit',access_scope:String(fd.get('access_scope')||''),professional_title:String(fd.get('professional_title')||''),organization_name:String(fd.get('organization_name')||''),territory:String(fd.get('territory')||''),website:String(fd.get('website')||''),registration_system:String(fd.get('registration_system')||''),registration_identifier:String(fd.get('registration_identifier')||''),message:String(fd.get('message')||'')};
  const out=document.querySelector('#proApplicationFeedback'),button=document.querySelector('#proApplicationSubmit');
  P.loading=true;if(out)out.textContent='Envoi en cours…';if(button)button.disabled=true;
  try{
    const result=await invoke(payload);
    if(out)out.textContent='Demande envoyée avec succès.';
    P.formScope=null;
    await load(true);
    renderModal();ensureAccountEntry();
    const toast=document.querySelector('#toast');if(toast){toast.textContent='Demande KŌMØ Pro envoyée.';toast.hidden=false;setTimeout(()=>toast.hidden=true,3000)}
    return result;
  }catch(err){if(out)out.textContent=err.message||'Impossible d’envoyer la demande.'}
  finally{P.loading=false;if(button)button.disabled=false}
}

async function refresh(force=false){
  preAuthCopy();
  const shell=document.querySelector('#appShell');if(!shell||shell.hidden)return;
  try{
    const ok=await load(force);if(!ok)return;
    ensureAccountEntry();
    if(sessionStorage.getItem(INTENT)==='1'){
      sessionStorage.removeItem(INTENT);
      P.open=true;P.formScope=openApplication()?null:(latestApproved()?oppositeScope(latestApproved().access_scope):null);
      renderModal();
    }
  }catch(e){console.error('[pro-application]',e)}
}

function schedule(force=false){clearTimeout(refreshTimer);refreshTimer=setTimeout(()=>refresh(force),120)}
function bindLifecycle(){
  if(lifecycleBound)return;lifecycleBound=true;
  const shell=document.querySelector('#appShell');
  if(shell){const obs=new MutationObserver(()=>{if(!shell.hidden)schedule(true)});obs.observe(shell,{attributes:true,attributeFilter:['hidden']})}
  document.querySelector('#accountButton')?.addEventListener('click',()=>schedule(false));
  document.querySelector('#refreshButton')?.addEventListener('click',()=>schedule(true));
  window.addEventListener('hashchange',()=>schedule(false));
  sb().auth.onAuthStateChange(()=>schedule(true));
}

document.addEventListener('DOMContentLoaded',()=>{bindLifecycle();setTimeout(()=>refresh(true),500)});
setTimeout(()=>{bindLifecycle();refresh(true)},1200);
