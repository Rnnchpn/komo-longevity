import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
const URL='https://uqlolefsiktbznnymriy.supabase.co',KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n',REM='komo_pulse_remember';
let client=null,running=false,lastRender=0;
function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return window.KomoRuntime?.client||(client||(client=createClient(URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}})))}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function money(cents,currency='EUR'){const n=Number(cents);if(!Number.isFinite(n))return'—';try{return new Intl.NumberFormat('fr-FR',{style:'currency',currency:currency||'EUR'}).format(n/100)}catch{return`${(n/100).toFixed(2)} €`}}
function date(v){if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(d)}
function fullDate(v,tz='Europe/Paris'){if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{timeZone:tz,weekday:'long',day:'2-digit',month:'long',hour:'2-digit',minute:'2-digit'}).format(d)}
function status(v){return({paid:'Payé',succeeded:'Payé',pending:'En attente',created:'À régler',cancelled:'Annulé',canceled:'Annulé',failed:'Échec',refunded:'Remboursé'})[v]||String(v||'En attente')}
function appointmentStatus(v){return({scheduled:'Planifié',confirmed:'Confirmé',arrived:'Arrivé',in_progress:'En cours',completed:'Terminé',cancelled:'Annulé',no_show:'Absent'})[v]||String(v||'Planifié')}
function serviceLabel(v){return v==='clinical'?'KŌMØ Clinical':'KŌMØ Motion'}
function locale(){const l=(document.documentElement.lang||'fr').toLowerCase();return l.startsWith('es')?'es':l.startsWith('en')?'en':'fr'}
function legalUrl(path){const l=locale();return`https://komolongevity.com/${l==='en'?'':`${l}/`}${path}/`}
function notify(message){const t=document.querySelector('#toast');if(!t)return;t.textContent=message;t.hidden=false;setTimeout(()=>t.hidden=true,3000)}
async function data(){
 const c=sb(),{data:{session}}=await c.auth.getSession();if(!session?.user)return null;
 const p=await c.from('patients').select('id').eq('patient_user_id',session.user.id);const ids=(p.data||[]).map(x=>x.id);
 let payments=[],appointments=[],centers=[];
 if(ids.length){
  const now=new Date().toISOString();
  const [pq,aq,cq]=await Promise.all([
   c.from('payment_orders').select('id,patient_id,purpose,amount_cents,currency,status,created_at,updated_at').in('patient_id',ids).order('created_at',{ascending:false}).limit(12),
   c.from('organization_appointments').select('id,organization_id,patient_id,appointment_type,scheduled_start,scheduled_end,status,location_mode,booking_source').in('patient_id',ids).gte('scheduled_start',now).order('scheduled_start',{ascending:true}).limit(12),
   c.rpc('komo_booking_centers')
  ]);
  if(!pq.error)payments=pq.data||[];
  if(!aq.error)appointments=(aq.data||[]).filter(x=>!['cancelled','completed','no_show'].includes(x.status));
  if(!cq.error)centers=cq.data||[];
 }
 return{session,payments,appointments,centers}
}
function paymentRows(items){if(!items.length)return'<div class="kah-empty">Aucun paiement enregistré pour le moment. Quand la facturation KŌMØ sera activée pour votre bilan, vos transactions et justificatifs apparaîtront ici.</div>';return`<div class="kah-billing">${items.map(x=>`<div class="kah-payment"><div><span>${esc(date(x.created_at))}</span><strong>${esc(x.purpose||'Prestation KŌMØ')}</strong><small>${esc(status(x.status))}</small></div><div class="amount">${esc(money(x.amount_cents,x.currency))}</div></div>`).join('')}</div>`}
function appointmentRows(items,centers){
 if(!items.length)return'<div class="kah-empty kah-appt-empty">Aucune consultation à venir. Vous pouvez réserver votre prochain rendez-vous depuis l’espace Consultations & rendez-vous.<button type="button" data-kah-route="documents">Réserver un rendez-vous →</button></div>';
 return`<div class="kah-appointments">${items.map(x=>{const center=centers.find(c=>c.id===x.organization_id),tz=center?.timezone||'Europe/Paris';return`<article class="kah-appointment"><div class="kah-appointment-main"><span>${esc(serviceLabel(x.appointment_type))}</span><strong>${esc(center?.name||'Centre KŌMØ')}</strong><small>${esc(fullDate(x.scheduled_start,tz))}</small></div><div class="kah-appointment-actions"><b>${esc(appointmentStatus(x.status))}</b><button type="button" data-kah-cancel="${esc(x.id)}">Annuler</button></div></article>`}).join('')}</div>`
}
function legal(){return`<section class="kah-card kah-full kah-legal"><div class="kah-head"><div><p class="eyebrow">DOCUMENTS OFFICIELS</p><h3>Cadre légal & confidentialité.</h3><p>Les informations juridiques de référence sont publiées sur le site KŌMØ et restent accessibles à tout moment.</p></div><span class="kah-pill">Documents KŌMØ</span></div><div class="kah-links"><a href="${legalUrl('privacy')}" target="_blank" rel="noopener">Confidentialité <span>↗</span></a><a href="${legalUrl('terms')}" target="_blank" rel="noopener">Conditions d’utilisation <span>↗</span></a><a href="${legalUrl('medical-information')}" target="_blank" rel="noopener">Information médicale <span>↗</span></a><a href="${legalUrl('legal')}" target="_blank" rel="noopener">Mentions légales <span>↗</span></a><a href="${legalUrl('cookies')}" target="_blank" rel="noopener">Cookies <span>↗</span></a><a href="${legalUrl('intellectual-property')}" target="_blank" rel="noopener">Propriété intellectuelle <span>↗</span></a></div></section>`}
async function cancelAppointment(id,button,current){
 const appt=current.appointments.find(x=>x.id===id),center=current.centers.find(x=>x.id===appt?.organization_id),tz=center?.timezone||'Europe/Paris';
 const label=appt?`${serviceLabel(appt.appointment_type)} · ${center?.name||'Centre KŌMØ'}\n${fullDate(appt.scheduled_start,tz)}\n\nAnnuler ce rendez-vous ?`:'Annuler ce rendez-vous ?';
 if(!confirm(label))return;
 const initial=button?.textContent||'Annuler';if(button){button.disabled=true;button.textContent='Annulation…'}
 try{
  const q=await sb().rpc('cancel_my_komo_appointment',{p_appointment_id:id});if(q.error)throw q.error;
  notify('Rendez-vous annulé.');
  document.querySelector('[data-account-hub-v2]')?.remove();lastRender=0;await render();
  window.dispatchEvent(new CustomEvent('komo:appointment-updated',{detail:{appointmentId:id,status:'cancelled'}}));
 }catch(e){
  console.error('[account-hub-v2:cancel]',e);
  const msg=String(e?.message||'');notify(msg.includes('cannot_cancel_past')?'Ce rendez-vous ne peut plus être annulé.':'Impossible d’annuler ce rendez-vous.');
  if(button){button.disabled=false;button.textContent=initial}
 }
}
function bind(section,current){
 section.querySelectorAll('[data-kah-cancel]').forEach(b=>b.addEventListener('click',()=>cancelAppointment(b.dataset.kahCancel,b,current)));
 section.querySelectorAll('[data-kah-route]').forEach(b=>b.addEventListener('click',()=>{const r=b.dataset.kahRoute;if(window.KomoPatientNavigation?.go)window.KomoPatientNavigation.go(r);else location.hash=r}))
}
async function render(){
 if(location.hash!=='#profile'||running)return;
 const host=document.querySelector('[data-profile-v2]');if(!host||host.querySelector('[data-account-hub-v2]'))return;
 running=true;
 try{
  const d=await data();if(!d)return;
  const eyebrow=document.querySelector('#pageEyebrow'),title=document.querySelector('#pageTitle');if(eyebrow)eyebrow.textContent='KŌMØ PULSE · MON COMPTE';if(title)title.textContent='Mon compte';
  const section=document.createElement('section');section.className='kah';section.dataset.accountHubV2='1';
  section.innerHTML=`<div class="kah-grid"><article class="kah-card kah-full kah-appointments-card"><div class="kah-head"><div><p class="eyebrow">CONSULTATIONS</p><h3>Mes rendez-vous à venir.</h3><p>Consultez vos prochains rendez-vous et annulez-les directement depuis votre profil.</p></div><button class="kah-manage" type="button" data-kah-route="documents">Gérer le planning →</button></div>${appointmentRows(d.appointments,d.centers)}</article><article class="kah-card"><div class="kah-head"><div><p class="eyebrow">FACTURATION</p><h3>Paiements & justificatifs.</h3><p>Retrouvez ici les paiements liés à votre parcours KŌMØ.</p></div><span class="kah-pill">Compte patient</span></div>${paymentRows(d.payments)}</article><article class="kah-card"><div class="kah-head"><div><p class="eyebrow">KŌMØ</p><h3>Comprendre votre parcours.</h3><p>Pulse est votre espace personnel. Le site principal rassemble la méthode, la science et le réseau KŌMØ.</p></div></div><div class="kah-links"><a href="https://komolongevity.com/fr/" target="_blank" rel="noopener">Site KŌMØ <span>↗</span></a><a href="https://komolongevity.com/fr/methode/" target="_blank" rel="noopener">Méthode <span>↗</span></a><a href="https://komolongevity.com/fr/science/" target="_blank" rel="noopener">Science <span>↗</span></a><a href="https://komolongevity.com/fr/network/" target="_blank" rel="noopener">Réseau <span>↗</span></a><a href="https://komolongevity.com/media" target="_blank" rel="noopener">Library <span>↗</span></a><a href="https://komolongevity.com/fr/contact/" target="_blank" rel="noopener">Contact <span>↗</span></a></div></article>${legal()}</div>`;
  host.appendChild(section);bind(section,d);lastRender=Date.now()
 }catch(e){console.error('[account-hub-v2]',e)}finally{running=false}
}
function schedule(){if(location.hash!=='#profile')return;for(const ms of [80,350,950])setTimeout(()=>{if(!document.querySelector('[data-account-hub-v2]')&&Date.now()-lastRender>250)render()},ms)}
window.addEventListener('hashchange',schedule);window.addEventListener('komo:route-ready',schedule);window.addEventListener('komo:appointment-updated',()=>{if(location.hash==='#profile'){document.querySelector('[data-account-hub-v2]')?.remove();lastRender=0;render()}});document.addEventListener('DOMContentLoaded',schedule);schedule();
