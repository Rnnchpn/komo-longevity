import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const AUDIENCE_KEY='komo_auth_audience';
const PRO_INTENT='komo_pulse_pro_intent';
const PENDING_KEY='komo_pending_pro_application_v1';
const REMEMBER_KEY='komo_pulse_remember';
let client=null;

function storage(){return localStorage.getItem(REMEMBER_KEY)==='1'?localStorage:sessionStorage}
function sb(){if(!client)client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});return client}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
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
  entry.innerHTML='<button type="button" class="secondary-button" data-open-pro-create>Demander un compte professionnel →</button><p class="auth-pro-note">L’accès professionnel est activé uniquement après validation KŌMØ.</p>';
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
  const title=auth.querySelector('.auth-heading h2'),copy=auth.querySelector('.auth-heading p'),submit=auth.querySelector('#loginButton span:first-child');
  if(title)title.textContent=pro?'Accédez à KŌMØ Pro':'Accédez à votre espace';
  if(copy)copy.textContent=pro?'Patients, Motion, Clinical et suivi dans un espace professionnel sécurisé.':'Vos résultats, votre trajectoire et vos prochaines étapes.';
  if(submit)submit.textContent=pro?'Se connecter à KŌMØ Pro':'Se connecter';
  const manifesto=auth.querySelector('.auth-manifesto');
  if(manifesto){const h=manifesto.querySelector('h1'),p=manifesto.querySelector('p:not(.eyebrow)');if(h)h.innerHTML=pro?'Votre centre.<br><em>Vos patients, clairement.</em>':'Votre mobilité.<br><em>Une trajectoire à comprendre.</em>';if(p)p.textContent=pro?'Pilotez les mesures, validations et suivis KŌMØ dans un même environnement.':'Retrouvez vos repères, vos résultats et la prochaine étape de votre programme KŌMØ dans un seul espace.'}
}

function modal(){let m=document.querySelector('#proCreateModal');if(m)return m;m=document.createElement('div');m.id='proCreateModal';m.className='pro-create-modal';m.hidden=true;document.body.appendChild(m);return m}
function openCreate(){const m=modal();m.hidden=false;m.innerHTML=`<div class="pro-create-backdrop" data-pro-create-close></div><section class="pro-create-sheet" role="dialog" aria-modal="true" aria-labelledby="proCreateTitle"><button class="pro-create-close" type="button" data-pro-create-close>×</button><p class="eyebrow">KŌMØ PRO</p><h2 id="proCreateTitle">Demander un compte professionnel.</h2><p class="pro-create-lead">Créez votre identifiant Pulse puis soumettez votre demande d’accès. Le compte reste sans droits professionnels jusqu’à validation KŌMØ.</p><form id="proCreateForm" class="pro-create-form"><div class="pro-create-scope"><label><input type="radio" name="access_scope" value="motion" checked><small>Mesure</small><strong>KŌMØ Motion</strong><p>Tests, acquisition MyoCare/Myodev et suivi opérateur.</p></label><label><input type="radio" name="access_scope" value="clinical"><small>Clinique</small><strong>KŌMØ Clinical</strong><p>Interprétation, validation et plan professionnel.</p></label></div><div class="pro-create-fields"><label class="field"><span>Adresse e-mail *</span><input name="email" type="email" autocomplete="email" required></label><label class="field"><span>Mot de passe *</span><input name="password" type="password" autocomplete="new-password" minlength="6" required></label><label class="field"><span>Fonction / titre *</span><input name="professional_title" required placeholder="Médecin, physiothérapeute, opérateur…"></label><label class="field"><span>Établissement *</span><input name="organization_name" required placeholder="Cabinet, clinique, centre…"></label><label class="field"><span>Territoire *</span><input name="territory" required placeholder="France, Espagne, Belgique…"></label><label class="field"><span>Site web</span><input name="website" type="url" placeholder="https://"></label></div><div class="pro-create-clinical" id="proCreateClinical" hidden><div class="pro-create-fields"><label class="field"><span>Registre professionnel *</span><select name="registration_system"><option value="">Sélectionner</option><option value="RPPS">RPPS — France</option><option value="National registry">Registre national / équivalent</option><option value="Other regulated registry">Autre registre professionnel réglementé</option></select></label><label class="field"><span>Identifiant professionnel *</span><input name="registration_identifier" placeholder="RPPS ou équivalent"></label></div></div><label class="pro-create-message"><span>Votre projet</span><textarea name="message" rows="4" placeholder="Décrivez brièvement votre usage de KŌMØ."></textarea></label><label class="pro-create-consent"><input type="checkbox" name="consent" required><span>Je confirme que les informations transmises sont exactes et j’accepte qu’elles soient vérifiées par KŌMØ avant activation de l’accès professionnel.</span></label><button class="primary-button pro-create-submit" type="submit">Créer mon compte & envoyer la demande →</button><p class="pro-create-feedback" id="proCreateFeedback"></p></form></section>`;
  m.querySelectorAll('[data-pro-create-close]').forEach(b=>b.addEventListener('click',()=>m.hidden=true));
  const f=m.querySelector('#proCreateForm');
  const sync=()=>{const clinical=f.querySelector('[name="access_scope"]:checked')?.value==='clinical',box=m.querySelector('#proCreateClinical');box.hidden=!clinical;box.querySelectorAll('select,input').forEach(x=>x.required=clinical)};
  f.querySelectorAll('[name="access_scope"]').forEach(x=>x.addEventListener('change',sync));sync();f.addEventListener('submit',submitCreate);
}

function payloadFrom(form){const fd=new FormData(form);return{action:'submit',access_scope:String(fd.get('access_scope')||''),professional_title:String(fd.get('professional_title')||'').trim(),organization_name:String(fd.get('organization_name')||'').trim(),territory:String(fd.get('territory')||'').trim(),website:String(fd.get('website')||'').trim(),registration_system:String(fd.get('registration_system')||'').trim(),registration_identifier:String(fd.get('registration_identifier')||'').trim(),message:String(fd.get('message')||'').trim()}}
async function submitApplication(c,payload){const {data,error}=await c.functions.invoke('professional-application',{body:payload});if(error)throw new Error(error.message||'Impossible d’envoyer la demande.');if(data?.error)throw new Error(data.detail||data.error);return data}
async function submitCreate(e){
  e.preventDefault();const f=e.currentTarget,out=document.querySelector('#proCreateFeedback'),btn=f.querySelector('button[type="submit"]');
  const fd=new FormData(f),email=String(fd.get('email')||'').trim(),password=String(fd.get('password')||''),payload=payloadFrom(f);
  if(password.length<6)return feedback(out,'Le mot de passe doit contenir au moins 6 caractères.');
  btn.disabled=true;feedback(out,'Création du compte…');
  try{
    sessionStorage.setItem(PRO_INTENT,'1');sessionStorage.setItem(AUDIENCE_KEY,'professional');
    const c=sb();const {data,error}=await c.auth.signUp({email,password,options:{emailRedirectTo:'https://pulse.komolongevity.com/?mode=professional'}});
    if(error)throw error;
    if(data?.session){await submitApplication(c,payload);localStorage.removeItem(PENDING_KEY);feedback(out,'Compte créé. Votre demande professionnelle a été transmise.',true);setTimeout(()=>{location.href='https://pulse.komolongevity.com/?mode=professional'},900)}
    else{localStorage.setItem(PENDING_KEY,JSON.stringify(payload));feedback(out,'Compte créé. Confirmez votre adresse e-mail : votre demande professionnelle sera transmise automatiquement à votre première connexion.',true)}
  }catch(err){const msg=String(err?.message||err);feedback(out,msg.includes('already registered')?'Un compte existe déjà avec cette adresse. Fermez ce formulaire puis connectez-vous dans l’onglet Professionnel.':msg)}finally{btn.disabled=false}
}
function feedback(el,msg,success=false){if(!el)return;el.textContent=msg;el.classList.toggle('success',success)}

async function attemptPending(){
  const raw=localStorage.getItem(PENDING_KEY);if(!raw)return;
  let payload;try{payload=JSON.parse(raw)}catch{localStorage.removeItem(PENDING_KEY);return}
  const c=sb(),{data:{session}}=await c.auth.getSession();if(!session?.user)return;
  try{await submitApplication(c,payload);localStorage.removeItem(PENDING_KEY);sessionStorage.setItem(PRO_INTENT,'1');showToast('Votre demande de compte professionnel a été transmise à KŌMØ.')}catch(err){const msg=String(err?.message||err);if(msg.includes('application_already_open'))localStorage.removeItem(PENDING_KEY)}
}
function showToast(msg){const t=document.querySelector('#toast');if(t){t.textContent=msg;t.hidden=false;setTimeout(()=>t.hidden=true,3800)}}

function schedule(){mount();if(authVisible())setAudience(getAudience());attemptPending().catch(console.error)}
const obs=new MutationObserver(()=>setTimeout(schedule,80));obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,300));
window.addEventListener('pageshow',()=>setTimeout(schedule,150));
setTimeout(schedule,700);
