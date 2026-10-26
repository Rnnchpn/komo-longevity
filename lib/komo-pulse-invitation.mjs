// Transactional KŌMØ invitations: only on verified Acuity bookings.
// Sender is fixed on the server, never derived from client input.
export const PULSE_ACTIVATION_URL='https://pulse.komolongevity.com/#inscription';
export const PULSE_FROM='KŌMØ Longevity <contact@komolongevity.com>';
const htmlEscape=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderPulseInvitation({firstName}={}){
  const name=htmlEscape(String(firstName??'').trim().slice(0,70));
  const subject='Bienvenue chez KŌMØ — votre espace Pulse vous attend';
  const greeting=name?`Bonjour ${name},`:'Bonjour,';
  const html=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;background:#f5f5ef;color:#193b29;font-family:Arial,Helvetica,sans-serif">
  <div style="display:none;max-height:0;overflow:hidden">Votre réservation KŌMØ est confirmée. Activez votre espace personnel.</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr><td align="center" style="padding:28px 12px 45px">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:590px;border-radius:20px;overflow:hidden;background:#fffefa">
  <tr><td style="padding:32px 37px;background:#183d2b;color:#fff"><div style="font:normal 30px Georgia,serif;letter-spacing:7px">KŌMØ</div><div style="margin-top:13px;font-size:10px;letter-spacing:2.5px;color:#c5dac6">LONGEVITY IN MOTION</div></td></tr>
  <tr><td style="padding:38px 37px 42px;background:#183d2b;color:#fff">
  <div style="font-size:11px;font-weight:bold;letter-spacing:1.6px;color:#b5cdb7">VOTRE EXPÉRIENCE KŌMØ COMMENCE</div>
  <h1 style="font:normal 38px/1.13 Georgia,serif;color:#fff;margin:19px 0 21px">Bienvenue dans<br>votre espace<br><em style="color:#d5e7cf">Pulse.</em></h1>
  <p style="color:#e8f0e7;font-size:14px;line-height:1.85;margin:0">${greeting}</p>
  <p style="color:#e8f0e7;font-size:14px;line-height:1.85;margin:12px 0 0">Votre réservation KŌMØ est confirmée. Nous vous invitons à ouvrir votre espace personnel pour retrouver votre parcours et les informations utiles avant votre rendez-vous.</p>
  </td></tr>
  <tr><td style="padding:35px 37px 0">
  <p style="font-size:11px;font-weight:bold;letter-spacing:1.7px;color:#50745b">VOTRE PARCOURS EN TROIS ÉTAPES</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:17px">
  <tr><td valign="top" width="39" style="padding:14px 0;color:#6f9676;font-weight:bold">01</td><td style="padding:14px 0;border-bottom:1px solid #e4ede3"><b style="font-size:14px">Votre réservation</b><p style="color:#697d6d;font-size:12px;line-height:1.6;margin:7px 0 0">Elle est enregistrée dans notre calendrier.</p></td></tr>
  <tr><td valign="top" style="padding:14px 0;color:#6f9676;font-weight:bold">02</td><td style="padding:14px 0;border-bottom:1px solid #e4ede3"><b style="font-size:14px">Votre accès Pulse</b><p style="color:#697d6d;font-size:12px;line-height:1.6;margin:7px 0 0">Utilisez la même adresse e-mail que lors de la réservation. Vous recevrez un lien personnel de connexion.</p></td></tr>
  <tr><td valign="top" style="padding:14px 0;color:#6f9676;font-weight:bold">03</td><td style="padding:14px 0"><b style="font-size:14px">Votre espace privé</b><p style="color:#697d6d;font-size:12px;line-height:1.6;margin:7px 0 0">Vos rendez-vous apparaîtront après vérification de votre identité.</p></td></tr>
  </table></td></tr>
  <tr><td align="center" style="padding:26px 37px 38px"><a href="${PULSE_ACTIVATION_URL}" style="display:inline-block;max-width:100%;border-radius:9px;padding:19px 24px;background:#225538;color:#fff;text-decoration:none;font-size:13px;line-height:1.4;font-weight:bold">Activer mon espace KŌMØ Pulse&nbsp;→</a><p style="margin:18px 0 0;color:#7a897d;font-size:11px;line-height:1.6">Ce bouton ne donne aucun accès direct aux dossiers de santé.</p></td></tr>
  <tr><td style="padding:29px 37px;background:#edf2eb">
    <p style="color:#244c32;font-size:13px;font-weight:bold;margin:0 0 9px">À très bientôt,</p><p style="font-size:12px;color:#576d5d;margin:0 0 17px">L'équipe KŌMØ Longevity</p>
    <a href="mailto:contact@komolongevity.com" style="color:#225638;font-size:12px">contact@komolongevity.com</a><br>
    <a href="https://komolongevity.com/parcours/" style="display:inline-block;margin-top:9px;color:#225638;font-size:12px">Découvrir le parcours KŌMØ</a>
  </td></tr></table>
  <p style="margin:17px auto 0;max-width:540px;color:#809083;font-size:10px;line-height:1.7;text-align:center">Vous n’êtes pas à l’origine de cette réservation ? Ignorez ce message et contactez-nous. Aucun dossier n’est ouvert automatiquement.</p>
  </td></tr></table></body></html>`;
  const text=[greeting,'','Votre réservation KŌMØ est confirmée.','Pour activer votre espace personnel Pulse, utilisez la même adresse que celle renseignée lors de la réservation :',PULSE_ACTIVATION_URL,'','Vous recevrez un lien de connexion sécurisé. L’accès aux rendez-vous est soumis à vérification.','','À très bientôt,',"L’équipe KŌMØ Longevity",'contact@komolongevity.com','https://komolongevity.com/parcours/'].join('\n');
  return {from:PULSE_FROM,reply_to:'contact@komolongevity.com',subject,html,text};
}
export async function sendPulseInvitation({email,firstName,bookingId,apiKey,fetchImpl=fetch}){
  if(!apiKey)return {ok:false,code:'sender_not_configured'};
  const to=String(email??'').trim().toLowerCase(),id=Number(bookingId);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)||to.length>254)return {ok:false,code:'invalid_email'};
  if(!Number.isSafeInteger(id)||id<=0)return {ok:false,code:'invalid_booking'};
  const response=await fetchImpl('https://api.resend.com/emails',{
    method:'POST',headers:{Authorization:'Bearer '+apiKey,'Content-Type':'application/json','Idempotency-Key':'komo-pulse-welcome-v1-'+id},
    body:JSON.stringify({...renderPulseInvitation({firstName}),to:[to]}),signal:AbortSignal.timeout(10000)
  });
  if(!response.ok)return {ok:false,code:response.status===403?'sender_domain_unverified':'email_provider_rejected',status:response.status};
  const result=await response.json().catch(()=>({}));
  if(typeof result.id!=='string'||!result.id.length)return {ok:false,code:'invalid_provider_response'};
  return {ok:true,id:result.id};
}
