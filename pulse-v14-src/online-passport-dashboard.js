// KŌMØ PULSE / patient-owned Online Motion Passport.
// Read-only display of the owner's existing Supabase RLS-protected online sessions.
// Never substitutes questionnaire values for a validated Motion Score.
import {buildMotionPassport,programProgress,priorityNarrative} from './online/session/motion-passport.mjs';
import {buildPdfReportData,downloadMotionPdf} from './online/session/pdf-report.js';
import {restitutionMarkup} from './online/session/restitution.mjs';

const e=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const numeric=v=>typeof v==='number'&&Number.isFinite(v);
const fmt=v=>numeric(v)?new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1}).format(v):'—';
const date=v=>{const d=new Date(v);return Number.isNaN(d.getTime())?'Date à confirmer':new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(d)};
const LABELS={
 sts:['Lever de chaise · 30 secondes','répétitions'],
 heels:['Élévations des talons','répétitions'],
 unipodal_left:['Équilibre · jambe gauche','secondes'],
 unipodal_right:['Équilibre · jambe droite','secondes'],
 arms:['Mobilité des bras','mouvements'],
 posture:['Posture · photographie de profil','indice de surface']
};
const DATE_LIMIT=12;
const status=r=>r?.status==='completed'&&r?.snapshot?.page===4?'Bilan terminé':'Bilan à compléter';
const reading=(r)=>{
 const s=r?.snapshot||{};
 const p=buildMotionPassport(s.answers||{},s.results||{},s.answers?.safety==='yes');
 return {r,s,p,completed:r?.status==='completed'&&s.page===4};
};
function bar(d){
 return '<div class="pp-domain"><div><strong>'+e(d.title)+'</strong><span>'+(numeric(d.value)?fmt(d.value)+'/100':'À compléter')+'</span></div>'+
 '<div class="pp-track" role="img" aria-label="'+e(d.title)+' : '+(numeric(d.value)?fmt(d.value)+' sur 100':'non renseigné')+'"><i style="width:'+(numeric(d.value)?Math.max(0,Math.min(100,d.value)):0)+'%"></i></div>'+
 '<small>'+e(d.caption)+'</small></div>';
}
function badge(text){return '<span class="pp-tag">'+e(text)+'</span>';}
function focusItem(d,i){
 return '<article class="pp-focus"><span>PRIORITÉ '+(i+1)+'</span><h3>'+e(d.title)+'</h3><p>'+e(d.action)+'</p></article>';
}
function summaryBody(r,compact=false){
 const {p,completed}=reading(r);
 return '<div class="pp-score"><span>INDICE DE MOBILITÉ PERÇUE</span><div class="pp-number">'+(p.index===null?'—':fmt(p.index))+'<small>/100</small></div>'+
 '<p>Indice exploratoire issu de vos réponses, distinct du Motion Score fonctionnel.</p></div>'+
 '<div class="pp-description"><p class="pp-eyebrow">KŌMØ MOTION PASSPORT · '+e(status(r))+'</p>'+
 '<h2>'+ (completed?'Votre point de départ est disponible.':'Votre passeport prend forme.')+'</h2>'+
 '<p>'+e(p.interpretation)+'</p>'+
 '<div class="pp-chips">'+badge(p.measuredCount+' / 6 observations')+badge(p.flaggedCount+' à vérifier')+'</div>'+
 (compact?'<p class="pp-limit">Votre passeport est disponible à tout moment dans Pulse.</p>':'<p class="pp-limit">Ce passeport n’est ni un diagnostic ni une estimation d’âge biologique, d’espérance de vie ou de survie.</p>')+'</div>';
}
export function onlineHomeBlock(reports,failed=false){
 if(failed)return '<section class="pp-home pp-unavailable"><div><p class="pp-eyebrow">VOTRE PASSEPORT</p><h2>Connexion aux bilans momentanément indisponible</h2><p>Vos données restent dans votre espace sécurisé. Actualisez Pulse pour réessayer.</p></div></section>';
 if(!reports.length)return '<section class="pp-home pp-empty"><div><p class="pp-eyebrow">VOTRE PASSEPORT DE LONGÉVITÉ LOCOMOTRICE</p><h2>Une première mesure. Puis une trajectoire.</h2><p>Quand votre Bilan Online sera réalisé et sauvegardé, ses résultats et votre feuille de route apparaîtront ici automatiquement.</p><a class="pp-link" href="/online/">Préparer mon bilan Online →</a></div></section>';
 const r=reports[0];
 return '<section class="pp-home"><div class="pp-topline"><span>KŌMØ / MOTION PASSPORT</span><span>'+e(date(r.created_at||r.updated_at))+'</span></div>'+
 '<div class="pp-home-grid">'+summaryBody(r,true)+'</div>'+restitutionMarkup({appointmentId:r.appointment_id,compact:true})+
 '<div class="pp-actions"><button type="button" data-route-passport class="pp-button light">Comprendre mon bilan →</button>'+
 '<button type="button" data-route-plan class="pp-button ghost">Voir ma progression</button></div></section>';
}
function observations(s){
 const results=s.results||{};
 return Object.entries(LABELS).map(([id,meta])=>{
  const r=results[id]||{};
  const usable=['done','review'].includes(r.status)&&numeric(r.value);
  const result=usable?(fmt(r.value)+' '+meta[1]):'Non mesuré';
  const qc=r.status==='review'?'À vérifier':r.status==='done'?'Observation enregistrée':'Pas de résultat';
  return '<div class="pp-observation"><div><strong>'+e(meta[0])+'</strong><small>'+e(qc)+'</small></div><span>'+e(result)+'</span></div>';
 }).join('');
}
function diary(p,s){
 const prog=s.program&&s.program.version==='KOMO_PULSE_DAILY_V1'?programProgress(s.program):null;
 const eligible=p.planStatus==='eligible';
 return '<section class="pp-diary"><div><span class="pp-eyebrow">PULSE DAILY · SUIVI PERSONNEL</span><h2>Vos progrès, au fil des jours.</h2>'+
 '<p>'+(!eligible?e(priorityNarrative(p)):'Le journal accompagne vos activités quotidiennes. Les jours renseignés mesurent votre régularité, pas un effet médical.')+'</p></div>'+
 '<div class="pp-diary-value"><strong>'+(prog?prog.daysLogged:'—')+'</strong><span>/ 28 jours renseignés</span></div>'+
 '<div class="pp-progress" role="img" aria-label="'+(prog?prog.daysLogged+' jours renseignés sur 28':'Aucun journal enregistré')+'"><i style="width:'+(prog?prog.percent:0)+'%"></i></div>'+
 '<p class="pp-small">'+(prog?'Journal démarré le '+e(date(s.program.startedAt))+'.':'Le suivi apparaît après activation de Pulse Daily dans le bilan Online.')+'</p>'+
 '<p class="pp-small">Les exercices restent des suggestions générales de mouvement. En cas de gêne importante ou de signal de sécurité, demandez un avis adapté avant de commencer.</p></section>';
}
function choices(p,r){
 const bookingId=/^[1-9][0-9]{0,11}$/.test(String(r?.appointment_id||''))?String(r.appointment_id):null;
 const sessionUrl=bookingId?'/online/session/?appointment='+encodeURIComponent(bookingId):'/online/activate/';
 const autonomous=p.planStatus==='eligible';
 return '<div class="pp-choice-grid"><article><span>01 / COMPLÉTER</span><h3>Un bilan Motion plus approfondi</h3><p>Des mesures instrumentées de force, de mobilité et de marche peuvent compléter les observations à distance à Paris ou Cannes.</p>'+
 '<a href="https://app.acuityscheduling.com/schedule.php?owner=40696577" target="_blank" rel="noopener noreferrer">Voir les rendez-vous disponibles →</a></article>'+
 '<article><span>02 / '+(autonomous?'PROGRESSER':'SE FAIRE ACCOMPAGNER')+'</span><h3>'+(autonomous?'Pulse Daily':'Adapter la suite en sécurité')+'</h3>'+
 '<p>'+(autonomous?'Reprenez votre programme de mouvement et votre journal quotidien depuis votre séance Online, lorsque votre accès est toujours autorisé.':
 'En cas de gêne, de risque de chute ou de séance interrompue, ne commencez pas un programme autonome sans un échange individualisé.')+'</p>'+
 (autonomous?'<a href="'+sessionUrl+'">'+(bookingId?'Reprendre mon bilan et Pulse Daily →':'Retrouver ma réservation Acuity →')+'</a>':
 '<a href="https://app.acuityscheduling.com/schedule.php?owner=40696577" target="_blank" rel="noopener noreferrer">Demander un accompagnement →</a>')+'</article></div>';
}
function history(reports,selected){
 if(reports.length<2)return '';
 return '<section class="pp-history"><span class="pp-eyebrow">HISTORIQUE</span><h2>Mes bilans précédents</h2>'+
 '<div class="pp-history-list">'+reports.slice(0,DATE_LIMIT).map(r=>
 '<button type="button" class="pp-history-item '+(r.id===selected?'selected':'')+'" data-passport-select="'+e(r.id)+'">'+
 '<span>'+e(date(r.created_at||r.updated_at))+'<small>'+e(status(r))+'</small></span><strong>Consulter →</strong></button>').join('')+'</div>'+
 '<p class="pp-small">La comparaison a du sens pour les questions et les tests réalisés dans des conditions similaires.</p></section>';
}
export function onlinePassportPage(reports,selectedId=null,failed=false){
 if(failed)return '<section class="pp-main">'+onlineHomeBlock([],true)+'</section>';
 if(!reports.length)return '<section class="pp-main">'+onlineHomeBlock([])+'</section>';
 const r=reports.find(x=>x.id===selectedId)||reports[0];
 const {p,s}=reading(r);
 return '<div class="pp-main"><div class="pp-intro"><span class="pp-eyebrow">MON BILAN ONLINE · '+e(date(r.created_at||r.updated_at))+'</span><h2>Votre mouvement, expliqué simplement.</h2>'+
 '<p>Vous retrouvez ici les informations réellement conservées dans votre dossier Pulse. Les observations issues de la webcam sont distinctes du questionnaire et des mesures nécessitant une validation.</p></div>'+
 '<section class="pp-cover"><div class="pp-topline"><span>KŌMØ / MOTION PASSPORT</span><span>'+e(status(r))+'</span></div>'+
 '<div class="pp-home-grid">'+summaryBody(r)+'</div>'+
 '<div class="pp-divider"></div><div class="pp-domain-grid">'+p.domains.map(bar).join('')+'</div></section>'+restitutionMarkup({appointmentId:r.appointment_id})+
 '<section class="pp-editorial"><div class="pp-section-title"><span>01 / VOS PRIORITÉS</span><h2>Ce qui mérite votre attention.</h2>'+
 '<p>Il ne s’agit pas de points « mauvais » : ce sont les domaines que vos réponses invitent à explorer en priorité.</p></div>'+
 '<div class="pp-focus-grid">'+(p.focus.length?p.focus.map(focusItem).join(''):'<p>Complétez toutes les réponses pour identifier jusqu’à deux axes prioritaires.</p>')+'</div></section>'+
 '<section class="pp-editorial"><div class="pp-section-title"><span>02 / VOS OBSERVATIONS</span><h2>Ce qui a été observé.</h2><p>Les valeurs ci-dessous proviennent des tests guidés à distance. Les captures incertaines sont signalées.</p></div>'+
 '<div class="pp-observations">'+observations(s)+'</div>'+
 '<details class="pp-method"><summary>Pourquoi mon Motion Score n’est-il pas indiqué ?</summary>'+
 '<p>Le Motion Score fonctionnel de référence repose sur le Sit-to-Stand 30 s, un TUG 3 m standardisé et l’équilibre SPPB, avec des références documentées et une validation de protocole. Le bilan Webcam seul ne fournit pas systématiquement ces éléments. Nous n’inventons donc ni Motion Score ni « âge locomoteur ».</p></details></section>'+
 '<section class="pp-editorial"><div class="pp-section-title"><span>03 / VOTRE PROGRESSION</span><h2>La suite se construit avec vous.</h2></div>'+
 diary(p,s)+choices(p,r)+'</section>'+
 '<section class="pp-export"><div><strong>Conserver votre passeport PDF</strong><p>Reconstituer votre rapport depuis les données enregistrées dans Pulse. Le fichier est généré sur cet appareil, puis téléchargé localement.</p></div>'+
 '<button class="pp-button primary" type="button" data-passport-pdf="'+e(r.id)+'">Télécharger mon rapport PDF ↓</button></section>'+
 history(reports,r.id)+'</div>';
}
export function onlinePlanPage(reports,failed=false){
 if(failed)return onlineHomeBlock([],true);
 if(!reports.length)return onlineHomeBlock([]);
 const {p,s,r}=reading(reports[0]);
 return '<div class="pp-main"><div class="pp-intro"><span class="pp-eyebrow">VOTRE TRAJECTOIRE</span><h2>Votre plan commence par deux priorités.</h2>'+
 '<p>Un programme évolutif doit s’appuyer sur des mesures comparables et votre ressenti. Pulse ne déduit pas d’objectifs médicaux des seules observations webcam.</p></div>'+
 '<div class="pp-focus-grid">'+(p.focus.length?p.focus.map(focusItem).join(''):'<p>Terminez le questionnaire Online pour voir les priorités.</p>')+'</div>'+
 diary(p,s)+choices(p,r)+'<p class="pp-small">Dernier bilan enregistré : '+e(date(r.updated_at||r.created_at))+'. Retrouvez le détail dans votre passeport.</p>'+
 '<button type="button" class="pp-button primary" data-route-passport>Voir mon passeport →</button></div>';
}
export function onlineResultsPreview(reports){
 if(!reports.length)return '';
 const r=reports[0],p=reading(r).p;
 return '<section class="pp-inline"><div><span class="pp-eyebrow">BILAN ONLINE</span><h2>Un premier regard sur votre mobilité</h2><p>'+e(p.interpretation)+'</p></div>'+
 '<button class="pp-button secondary" type="button" data-route-passport>Voir mon passeport →</button></section>';
}
async function hydrateRestitution(root,getToken){
 if(typeof getToken!=='function')return;
 const slots=[...root.querySelectorAll('[data-restitution-appointment]')];
 if(!slots.length)return;
 let token;
 try{token=await getToken()}catch{return}
 if(!token)return;
 for(const slot of slots){
  if(!slot.isConnected)return;
  const id=slot.getAttribute('data-restitution-appointment');
  if(!/^[1-9][0-9]{0,11}$/.test(id||''))continue;
  try{
   const res=await fetch('/api/pulse-online-verify',{method:'POST',
    headers:{authorization:'Bearer '+token,'content-type':'application/json'},
    cache:'no-store',credentials:'omit',body:JSON.stringify({appointmentId:id})});
   if(!res.ok)continue;
   const p=await res.json();
   if(p.eligible!==true||p.paid!==true)continue;
   if(slot.isConnected){
    slot.outerHTML=restitutionMarkup({appointmentId:id,appointmentAt:p.appointmentAt,
     appointmentMinutes:p.appointmentMinutes,meetingJoinUrl:p.meetingJoinUrl,compact:slot.classList.contains('compact')});
   }
  }catch{/* Acuity offline: patient keeps the confirmation-email fallback. */}
 }
}
export function bindOnlinePassportActions(root,reports,toast=()=>{},getToken=null){
 void hydrateRestitution(root,getToken);
 root.querySelectorAll('[data-route-passport]').forEach(b=>b.addEventListener('click',()=>{location.hash='passport'}));
 root.querySelectorAll('[data-route-plan]').forEach(b=>b.addEventListener('click',()=>{location.hash='plan'}));
 root.querySelectorAll('[data-passport-select]').forEach(b=>b.addEventListener('click',()=>{
  const id=b.dataset.passportSelect;
  const url=new URL(location.href);
  url.searchParams.set('bilan',id);
  history.replaceState(null,'',url.pathname+url.search+url.hash);
  root.innerHTML=onlinePassportPage(reports,id);
  bindOnlinePassportActions(root,reports,toast,getToken);
  root.scrollIntoView({block:'start',behavior:'smooth'});
 }));
 root.querySelectorAll('[data-passport-pdf]').forEach(b=>b.addEventListener('click',async()=>{
  const r=reports.find(x=>x.id===b.dataset.passportPdf);
  if(!r)return;
  const s=r.snapshot||{};
  b.disabled=true;const old=b.textContent;b.textContent='Création du PDF…';
  try{
   const payload=buildPdfReportData(s.answers||{},s.results||{},null,s.answers?.safety==='yes',
    new Date(r.updated_at||r.created_at),{mode:'PILOTE',program:s.program});
   await downloadMotionPdf(payload);
   toast('Rapport téléchargé sur cet appareil.');
  }catch{
   toast('Impossible de générer le PDF. Réessayez depuis un navigateur connecté.');
  }finally{b.disabled=false;b.textContent=old;}
 }));
}
