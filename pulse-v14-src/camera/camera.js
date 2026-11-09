import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.57.4';
const URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const ENDPOINT=URL+'/functions/v1/motion-live-test';
const sb=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const root=document.getElementById('cameraApp');
const esc=str=>String(str??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
let opening=false;

function status(message){const el=document.getElementById('cameraStatus');if(el)el.textContent=message||''}
async function api(payload){
 const {data:{session}}=await sb.auth.getSession();
 if(!session?.access_token)throw Error('Session opérateur expirée. Reconnecte-toi.');
 const res=await fetch(ENDPOINT,{method:'POST',cache:'no-store',headers:{
  apikey:KEY,Authorization:'Bearer '+session.access_token,'Content-Type':'application/json'
 },body:JSON.stringify(payload)});
 let data={};try{data=await res.json()}catch{throw Error('Réponse illisible du serveur')}
 if(!res.ok||data.error)throw Error({
  operator_access_required:'Ce compte n’a pas l’accès Opérateur.',
  too_many_active_cameras:'Trop de caméras ouvertes. Termine une séance sur ton iPhone avant d’en ouvrir une autre.',
  test_environment_only:'Ce dispositif est réservé aux tests avec dossiers fictifs.'
 }[data.error]||data.error||'Connexion impossible');
 return data;
}
function renderLogin(){
 root.innerHTML='<span class="camera-overline">ACCÈS OPÉRATEUR · KŌMØ</span>'+
 '<h1>Ton iPhone.<br><em>La caméra Motion.</em></h1>'+
 '<p>Utilise les identifiants de ton compte KŌMØ Operator. Ce téléphone ne sert pas de compte patient.</p>'+
 '<form id="cameraLogin"><label>Adresse e-mail<input name="email" type="email" autocomplete="username" required></label>'+
 '<label>Mot de passe<input name="password" type="password" autocomplete="current-password" required></label>'+
 '<button class="camera-button" type="submit" id="cameraLoginButton">Se connecter</button></form>'+
 '<p class="camera-status" id="cameraStatus" role="status"></p>';
 const form=document.getElementById('cameraLogin');
 form.onsubmit=async event=>{
  event.preventDefault();
  const button=document.getElementById('cameraLoginButton');button.disabled=true;
  status('Identification…');
  const values=new FormData(form);
  try{
   const {error}=await sb.auth.signInWithPassword({email:String(values.get('email')||''),password:String(values.get('password')||'')});
   if(error)throw error;
   await render();
  }catch(error){status(error.message||'Connexion impossible');button.disabled=false}
 };
}
function renderReady(email){
 root.innerHTML='<span class="camera-overline">MATÉRIEL DU PRATICIEN · CONSULTATION PHYSIQUE</span>'+
 '<h1>Ton iPhone.<br><em>La caméra Motion.</em></h1>'+
 '<p class="camera-account">Compte Operator : <strong>'+esc(email)+'</strong></p>'+
 '<ol class="camera-steps"><li>Pose ton iPhone sur le trépied, caméra arrière vers le patient.</li>'+
 '<li>Active la caméra, puis repère le code affiché ici sur ton ordinateur dans <strong>En direct</strong>.</li>'+
 '<li>Sur l’ordinateur, associe la caméra au dossier fictif puis pilote tous les tests Motion.</li></ol>'+
 '<button type="button" id="cameraStart" class="camera-button">Ouvrir la caméra de mon iPhone</button>'+
 '<button type="button" id="cameraLogout" class="camera-button secondary">Changer de compte</button>'+
 '<p class="camera-status" id="cameraStatus" role="status"></p>';
 document.getElementById('cameraStart').onclick=async()=>{
  if(opening)return;
  opening=true;
  const button=document.getElementById('cameraStart');button.disabled=true;
  try{
   const {data:{session}}=await sb.auth.getSession();
   if(!session?.user?.id)throw Error('Compte Operator non connecté.');
   const module=await import('../motion-live-guest-v1.js?v=20261109-staff-camera-v2');
   await module.openMotionLive({
    mode:'operator_camera',
    ownerId:session.user.id,
    startSession:()=>api({action:'operator_camera_start'}),
    stopSession:session_id=>api({action:'operator_camera_stop',session_id})
   });
  }catch(error){status(error.message||'Impossible d’ouvrir la caméra')}
  finally{opening=false;button.disabled=false}
 };
 document.getElementById('cameraLogout').onclick=async()=>{
  await sb.auth.signOut();renderLogin();
 };
}
async function render(){
 try{
  const {data:{session}}=await sb.auth.getSession();
  if(!session?.user){renderLogin();return}
  renderReady(session.user.email||'');
 }catch(error){renderLogin();status(error.message||'Session momentanément indisponible')}
}
void render();
