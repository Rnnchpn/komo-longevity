import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import {restitutionMarkup} from '../session/restitution.mjs';
const sb=createClient('https://uqlolefsiktbznnymriy.supabase.co','sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const root=document.querySelector('#activation-app');
const params=new URLSearchParams(location.search);
const booking=(params.get('appointment')||'').trim();
const clean=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function message(text){const x=document.querySelector('#activate-message');if(x)x.textContent=text;}
function title(content){root.innerHTML='<span class="overline">KŌMØ MOTION ONLINE · ACTIVATION SÉCURISÉE</span><h1>Votre espace.<br><em>Votre mouvement.</em></h1>'+content;}
function login(){
 title('<p>Après votre réservation Acuity, identifiez-vous avec la même adresse e-mail que celle utilisée pour le paiement. Vous recevrez un lien de connexion sécurisé par e-mail.</p>'+
 '<form id="activate-form"><div class="question"><label for="activate-email">Votre adresse e-mail de réservation</label><input class="activate-input" id="activate-email" name="email" type="email" autocomplete="email" required placeholder="vous@exemple.com"></div>'+
 '<div class="question"><label for="activate-id">Référence du rendez-vous Acuity</label><input class="activate-input" id="activate-id" name="appointment" type="text" inputmode="numeric" pattern="[0-9]+" value="'+clean(booking)+'" required placeholder="N° de rendez-vous"></div>'+
 '<p>Ce premier e-mail vérifie uniquement votre identité. L’accès à la séance et aux résultats dépendra également de la vérification de votre paiement.</p>'+
 '<button class="action" type="submit" id="send">Recevoir mon lien de connexion →</button><p class="message" id="activate-message" role="status"></p></form>'+
 '<div class="notice">Vous avez déjà un compte Pulse ? <a href="/#connexion">Connectez-vous ici</a>, puis revenez sur cette page pour vérifier votre réservation.</div>');
 document.querySelector('#activate-form').onsubmit=async e=>{
  e.preventDefault();const fd=new FormData(e.currentTarget);
  const email=String(fd.get('email')||'').trim().toLowerCase(),id=String(fd.get('appointment')||'').trim();
  if(!/^[1-9][0-9]{0,11}$/.test(id))return message('Vérifiez le numéro de rendez-vous fourni dans votre confirmation Acuity.');
  const button=document.querySelector('#send');button.disabled=true;
  message('Envoi du lien de connexion…');
  // The redirect contains only a booking ID, never personal or health information.
  const url=location.origin+'/online/activate/?appointment='+encodeURIComponent(id);
  const r=await sb.auth.signInWithOtp({email,options:{shouldCreateUser:true,emailRedirectTo:url}});
  button.disabled=false;
  message(r.error?'Impossible d’envoyer le lien. Vérifiez vos coordonnées ou contactez l’équipe.':'Si cette adresse peut recevoir nos messages, un lien sécurisé de connexion vient d’être demandé. Vérifiez votre messagerie, puis ouvrez-le sur cet appareil.');
 };
}
function paidUser(user,accessToken){
 title('<p>Vous êtes connecté avec <strong>'+clean(user.email)+'</strong>. Nous devons maintenant confirmer votre réservation KŌMØ Online et son règlement avant de poursuivre.</p>'+
 '<form id="verify-form"><div class="question"><label for="verify-id">Numéro de réservation Acuity</label><input class="activate-input" id="verify-id" type="text" inputmode="numeric" pattern="[0-9]+" value="'+clean(booking)+'" placeholder="Numéro de rendez-vous" required></div>'+
 '<button class="action" type="submit" id="verify-btn">Vérifier ma réservation réglée →</button><p class="message" id="activate-message" role="status"></p></form>'+
 '<div class="notice">La vérification utilise votre identité Pulse authentifiée. Elle échoue si l’adresse e-mail ne correspond pas au rendez-vous Acuity, si la prestation est différente, annulée ou si le règlement intégral n’est pas confirmé.</div>');
 document.querySelector('#verify-form').onsubmit=async e=>{
  e.preventDefault();
  const id=String(document.querySelector('#verify-id').value).trim();
  if(!/^[1-9][0-9]{0,11}$/.test(id))return message('Numéro de réservation invalide.');
  const b=document.querySelector('#verify-btn');b.disabled=true;message('Vérification du règlement auprès d’Acuity…');
  try{
   const r=await fetch('/api/pulse-online-verify',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+accessToken},body:JSON.stringify({appointmentId:id}),credentials:'omit',cache:'no-store'});
   const result=await r.json();
   if(!r.ok||!result.eligible){b.disabled=false;message(result.error==='payment_not_confirmed'?'Paiement non confirmé par Acuity. Vérifiez votre règlement et contactez-nous si nécessaire.':result.error==='booking_verification_not_configured'||r.status===503?'Service de vérification momentanément indisponible. Contactez contact@komolongevity.com.':'Réservation non vérifiée. Vérifiez que le numéro et votre adresse e-mail correspondent à la confirmation Acuity.');return;}
   if(result.canStart===true){
    // A booking number is not authorization. The session page re-verifies
    // identity + Acuity payment with the server on every new page load.
    title('<div class="notice"><strong>✓ Votre réservation et votre règlement sont vérifiés.</strong></div>'+
     '<p>Votre accès à la séance Online est disponible. La caméra et le microphone ne seront activés qu’avec votre accord, au début des tests.</p>'+
     '<div class="actions"><a class="action" href="/online/session/?appointment='+encodeURIComponent(id)+'">Commencer mon bilan Motion →</a>'+
     '<a class="action secondary" href="/">Mon espace Pulse</a></div>'+
     restitutionMarkup({appointmentAt:result.appointmentAt,appointmentId:id,appointmentMinutes:result.appointmentMinutes,compact:true})+
     '<p>Après votre consentement, votre progression sera enregistrée dans votre dossier privé Pulse pour être reprise ultérieurement. Les vidéos et les photos ne seront pas stockées. Le rapport PDF restera téléchargé séparément. Cette prestation ne constitue pas une consultation médicale.</p>');
   }else{
    title('<div class="notice"><strong>✓ Votre réservation Online et votre règlement sont vérifiés.</strong></div>'+
     '<p>La consultation en ligne reste temporairement fermée aux comptes clients pendant les derniers contrôles de confidentialité et d’enregistrement des résultats.</p>'+
     '<p>Votre réservation demeure valable. Si un lien vidéo a été configuré, il figure dans votre confirmation Acuity. Sinon contactez notre équipe.</p>'+
     '<div class="actions"><a class="action" href="/">Accéder à Pulse</a><a class="action secondary" href="mailto:contact@komolongevity.com">Nous contacter</a></div>');
   }
  }catch(error){b.disabled=false;message('Impossible de joindre le système de réservation. Réessayez plus tard.');}
 };
}
async function boot(){
 const auth=await sb.auth.getUser();
 if(!auth.data?.user||!auth.data.user.email_confirmed_at)return login();
 const session=await sb.auth.getSession();
 if(!session.data?.session?.access_token)return login();
 paidUser(auth.data.user,session.data.session.access_token);
}
boot().catch(()=>login());
