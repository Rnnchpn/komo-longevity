import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
const sb=createClient('https://uqlolefsiktbznnymriy.supabase.co','sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const root=document.querySelector('#stripe-activation-app');
const MATCH=/^cs_(?:test|live)_[A-Za-z0-9]{8,200}$/;
const KEY='komo_online_stripe_checkout_v1';
const qid=new URLSearchParams(location.search).get('session_id')||'';
function clean(x){return String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
let sessionId=MATCH.test(qid)?qid:null;
if(sessionId){try{sessionStorage.setItem(KEY,sessionId)}catch{}}
if(!sessionId){try{const prior=sessionStorage.getItem(KEY);if(MATCH.test(prior||''))sessionId=prior}catch{}}
function page(body){root.innerHTML='<span class="overline">KŌMØ MOTION ONLINE · 39 €</span><h1>Votre bilan.<br><em>À votre rythme.</em></h1>'+body;}
function notice(t){const n=document.getElementById('stripe-msg');if(n)n.textContent=t;}
function missing(){
 page('<p>Ce lien ne contient pas de référence de paiement Stripe. Après votre achat, revenez depuis la page de confirmation. Si vous avez déjà payé et ne retrouvez plus cette page, contactez notre équipe depuis votre adresse de paiement.</p><div class="actions"><a class="action" href="mailto:contact@komolongevity.com?subject=Activation%20Motion%20Online%2039">Contacter KŌMØ →</a><a class="action secondary" href="https://komolongevity.com/fr/">Retour au site</a></div>');
}
function login(){
 page('<p>Identifiez-vous avec <strong>l’adresse e-mail utilisée lors du paiement Stripe</strong>. Nous vous enverrons un lien de connexion. Aucun nouveau paiement n’est nécessaire.</p><form id="stripe-login-form"><div class="question"><label for="stripe-email">Adresse e-mail de paiement</label><input class="activate-input" type="email" id="stripe-email" name="email" autocomplete="email" placeholder="vous@exemple.com" required></div><button class="action" id="stripe-send" type="submit">Recevoir mon lien sécurisé →</button><p class="message" id="stripe-msg" role="status"></p></form><p class="notice">Le bilan ne sera ouvert qu’après vérification effective du paiement par Stripe.</p>');
 document.getElementById('stripe-login-form').onsubmit=async e=>{
  e.preventDefault();const email=String(new FormData(e.currentTarget).get('email')||'').trim().toLowerCase();
  const btn=document.getElementById('stripe-send');btn.disabled=true;notice('Envoi du lien…');
  const url=location.origin+'/online/stripe/?session_id='+encodeURIComponent(sessionId);
  const result=await sb.auth.signInWithOtp({email,options:{shouldCreateUser:true,emailRedirectTo:url}});
  btn.disabled=false;notice(result.error?'Envoi impossible. Vérifiez votre adresse ou contactez KŌMØ.':'Un lien de connexion a été demandé. Ouvrez-le depuis votre boîte e-mail.');
 };
}
async function verified(user,token){
 page('<p>Compte connecté : <strong>'+clean(user.email)+'</strong>.</p><p>Vérification du paiement Stripe en cours…</p><p class="message" id="stripe-msg" role="status"></p>');
 try{
  const resp=await fetch('/api/pulse-online-stripe-verify',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify({sessionId}),cache:'no-store'});
  const data=await resp.json();
  if(resp.ok&&data.eligible===true&&data.paid===true&&data.canStart===true){
   page('<div class="notice"><strong>Paiement confirmé.</strong> Votre bilan autonome est disponible.</div><p>Vous pouvez effectuer vos tests dès maintenant ou les reprendre plus tard depuis cet appareil.</p><div class="actions"><a class="action" href="/online/session/?session_id='+encodeURIComponent(sessionId)+'">Commencer mon bilan →</a><a class="action secondary" href="/">Mon espace Pulse</a></div>');
   return;
  }
  if(resp.ok&&data.eligible===true&&!data.canStart){
   page('<div class="notice"><strong>Paiement vérifié.</strong> La mise en service automatique de Pulse n’est pas encore activée.</div><p>Votre paiement ne sera pas perdu. Contactez <a href="mailto:contact@komolongevity.com">contact@komolongevity.com</a> si vous avez besoin d’aide.</p>');
   return;
  }
  const wrongEmail=data.error==='stripe_payment_not_eligible';
  page('<p>'+ (wrongEmail?'Impossible de confirmer un paiement éligible avec ce compte. Assurez-vous d’être connecté avec la même adresse e-mail que lors de l’achat.':'La vérification de paiement est momentanément indisponible.')+'</p><div class="actions"><button class="action" type="button" id="stripe-retry">Réessayer →</button><a class="action secondary" href="mailto:contact@komolongevity.com">Contacter KŌMØ</a></div>');
  document.getElementById('stripe-retry').onclick=()=>verified(user,token);
 }catch{page('<p>La vérification Stripe n’a pas répondu. Aucun paiement supplémentaire n’est nécessaire.</p><a class="action" href="mailto:contact@komolongevity.com">Contacter KŌMØ →</a>');}
}
async function boot(){
 if(!sessionId)return missing();
 const u=await sb.auth.getUser();
 if(u.error||!u.data?.user||!u.data.user.email_confirmed_at)return login();
 const t=await sb.auth.getSession();
 if(!t.data.session?.access_token)return login();
 await verified(u.data.user,t.data.session.access_token);
}
boot().catch(()=>{page('<p>Connexion momentanément indisponible. Merci de réessayer ou de contacter KŌMØ.</p>');});
