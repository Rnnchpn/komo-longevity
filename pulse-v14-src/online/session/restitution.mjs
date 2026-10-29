// Editorial layer only: the appointment remains managed by Acuity.
// Never represent this as a medical teleconsultation or require a live operator to release the initial passport.
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function formatRestitutionDate(appointmentAt){
 if(typeof appointmentAt!=='string'||appointmentAt.length>65)return null;
 const parsed=new Date(appointmentAt);
 if(!Number.isFinite(parsed.getTime()))return null;
 return new Intl.DateTimeFormat('fr-FR',{dateStyle:'full',timeStyle:'short'}).format(parsed);
}
export function restitutionMarkup({appointmentAt=null,appointmentId=null,appointmentMinutes=null,compact=false}={}){
 const when=formatRestitutionDate(appointmentAt);
 const active=when&&new Date(appointmentAt).getTime()>=Date.now()-30*60*1000;
 const booking=/^[1-9][0-9]{0,11}$/.test(String(appointmentId||''))?String(appointmentId):null;
 const verification=booking?'<a class="rest-link" href="/online/activate/?appointment='+encodeURIComponent(booking)+'">Vérifier mon créneau Acuity →</a>':'';
 const duration=Number.isInteger(appointmentMinutes)&&appointmentMinutes>0&&appointmentMinutes<=180?' · '+appointmentMinutes+' min réservées':'';
 const intro=when?(active?'Votre échange vidéo est prévu le <strong>'+esc(when)+'</strong> (heure de votre appareil).':'Le créneau initial était le <strong>'+esc(when)+'</strong>. Vérifiez votre confirmation Acuity si vous devez reprogrammer.'):'La date et l’heure de votre échange figurent dans votre confirmation de réservation Acuity.';
 return '<section class="restitution-flow'+(compact?' compact':'')+'" aria-label="Restitution individuelle KŌMØ">'+
 '<div class="rest-title"><span>VOTRE RENDEZ-VOUS DE RESTITUTION</span><h2>Vos résultats d’abord. Notre échange ensuite.</h2></div>'+
 '<p>'+intro+esc(duration)+'</p>'+
 (compact?'<p class="rest-compact-copy">Commencez les tests quand vous le souhaitez. Le premier rapport arrive immédiatement ; nous échangeons au créneau Acuity.</p>':'<div class="rest-steps"><div><b>01</b><strong>Vos tests, quand vous le souhaitez</strong><span>Complétez les questionnaires et les mesures guidées, si possible avant le créneau réservé.</span></div>'+
 '<div><b>02</b><strong>Votre premier passeport, immédiatement</strong><span>Consultez votre indice déclaratif, les observations et les limites de mesure dans Pulse.</span></div>'+
 '<div><b>03</b><strong>Notre échange vidéo, à l’heure réservée</strong><span>Relecture des résultats, réponses à vos questions et orientations possibles vers Pulse Daily ou un bilan Motion approfondi.</span></div></div>')+
 '<p class="rest-disclaimer"><strong>L’échange est inclus dans la prestation, mais facultatif.</strong> Vous n’avez pas à attendre devant la caméra après le dernier test : votre premier rapport reste accessible sans visioconférence. Si un lien vidéo est configuré pour votre rendez-vous, il figure dans la confirmation et les rappels Acuity. Il ne s’agit pas d’une consultation médicale.</p>'+
 (verification?'<div class="rest-action">'+verification+'</div>':'')+
 '</section>';
}
