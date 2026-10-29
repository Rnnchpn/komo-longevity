import {createClient} from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import {buildMotionPassport} from '../session/motion-passport.mjs';
const sb=createClient('https://uqlolefsiktbznnymriy.supabase.co','sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n',{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
const root=document.getElementById('operator-app'),edge='https://uqlolefsiktbznnymriy.supabase.co/functions/v1/motion-online-operator';
const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const displayTime=s=>{
 if(typeof s!=='string'||!Number.isFinite(Date.parse(s)))return 'Horaire à confirmer dans Acuity';
 return new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',weekday:'short',day:'numeric',month:'long',hour:'2-digit',minute:'2-digit'}).format(new Date(s))+' · Paris';
};
const formatDate=d=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
const state={token:null,appointments:[],statuses:{},selected:null,busy:false,from:null,to:null,live:false};
function message(text){const node=root.querySelector('#op-feedback');if(node)node.textContent=text;}
async function callApi(url){
 const res=await fetch(url,{headers:{authorization:'Bearer '+state.token},cache:'no-store',credentials:'omit'});
 const json=await res.json().catch(()=>({}));
 if(!res.ok)throw Error(json.error||'api_unavailable');
 return json;
}
async function callEdge(payload){
 const res=await fetch(edge,{method:'POST',headers:{authorization:'Bearer '+state.token,
  apikey:'sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n','content-type':'application/json'},
  cache:'no-store',body:JSON.stringify(payload)});
 const json=await res.json().catch(()=>({}));
 if(!res.ok)throw Error(json.error||'private_dossier_unavailable');
 return json;
}
function status(row){
 const s=state.statuses[row.id];
 if(!s)return '<span class="pill empty">Bilan non commencé</span>';
 if(s.status==='completed')return '<span class="pill done">Bilan terminé · '+s.testsDone+'/6</span>';
 return '<span class="pill progress">En préparation · '+s.testsDone+'/6</span>';
}
function listView(){
 const rows=state.appointments;
 return '<div class="eyebrow">KŌMØ OPERATOR / MOTION ONLINE</div><div class="work-heading"><div><h1>Vos restitutions.</h1>'+
 '<p>Créneaux Acuity, visios et passeports réunis au même endroit. Le rendez-vous reste géré dans Acuity ; cette interface ne modifie jamais ses horaires.</p></div>'+
 '<button type="button" class="btn solid" id="refresh">Actualiser les rendez-vous</button></div>'+
 '<section class="toolbar"><label>Du <input type="date" id="date-from" value="'+escape(state.from)+'"></label>'+
 '<label>Au <input type="date" id="date-to" value="'+escape(state.to)+'"></label>'+
 '<span>'+rows.length+' rendez-vous</span></section>'+
 '<div class="appointment-list">'+(rows.length?rows.map(a=>{
  const safeUrl=typeof a.meetingJoinUrl==='string'&&/^https:\/\//.test(a.meetingJoinUrl)?a.meetingJoinUrl:null;
  return '<article class="appointment"><div class="date"><span>'+escape(displayTime(a.appointmentAt))+'</span><strong>'+escape(a.duration?a.duration+' minutes':'Durée Acuity')+'</strong></div>'+
   '<div class="person"><h2>'+escape([a.firstName,a.lastName].filter(Boolean).join(' ')||'Réservation Acuity')+'</h2>'+
   '<p>'+escape(a.email)+'</p>'+status(a)+'</div>'+
   '<div class="actions"><button class="btn secondary" data-open="'+escape(a.id)+'">Préparer la restitution</button>'+
   (safeUrl?'<a class="btn solid" href="'+escape(safeUrl)+'" target="_blank" rel="noopener noreferrer">Rejoindre la visio ↗</a>':
    '<span class="pill warn">Lien visio à configurer</span>')+'</div></article>';
 }).join(''):'<div class="empty-state"><h2>Aucun rendez-vous dans cette période.</h2><p>Vérifiez les disponibilités et le type de prestation Acuity Online.</p></div>')+'</div>'+
 '<div id="op-feedback" role="status" class="feedback"></div>'+
 '<div class="footnote">Les liens vidéo proviennent d’Acuity, pas d’une réunion commune à plusieurs clients. Les rendez-vous reportés sont actualisés à chaque synchronisation.</div>';
}
function dossierView(a,d){
 const back='<button class="btn text" id="back">← Retour aux restitutions</button>';
 if(!d)return back+'<section class="summary"><div class="eyebrow">RENDEZ-VOUS / '+escape(a.id)+'</div><h1>'+escape([a.firstName,a.lastName].join(' '))+'</h1>'+
  '<p>Le patient n’a pas encore créé de dossier Online. La restitution peut être maintenue, mais aucune interprétation de tests non réalisés ne doit être présentée.</p>'+
  '<p>Invitez-le à compléter les questionnaires et tests avant l’échange. Son premier passeport apparaîtra lorsqu’il aura commencé.</p></section>';
 const p=buildMotionPassport(d.answers||{},d.results||{},d.answers?.safety==='yes');
 const tests=[['sts','Lever de chaise (30 s)','rép.'],['heels','Élévation des talons','rép.'],
  ['unipodal_left','Appui gauche','s'],['unipodal_right','Appui droit','s'],
  ['arms','Élévations des bras','rép.'],['posture','Posture (webcam)','indice']];
 const last=d.updatedAt&&Number.isFinite(Date.parse(d.updatedAt))?new Date(d.updatedAt).toLocaleString('fr-FR'):'Date non disponible';
 const cue=p.planStatus!=='eligible'?'<div class="caution">Signal de sécurité ou gêne importante : ne pas recommander de programme autonome avant un échange adapté.</div>':'';
 return back+'<section class="summary"><div class="eyebrow">DOSSIER PRIVATE · LECTURE ADMINISTRATEUR JOURNALISÉE</div>'+
 '<div class="work-heading"><div><h1>'+escape([a.firstName,a.lastName].filter(Boolean).join(' ')||'Bilan Online')+'</h1>'+
 '<p>Restitution : '+escape(displayTime(a.appointmentAt))+' · dernière sauvegarde : '+escape(last)+'</p></div>'+
 (a.meetingJoinUrl?'<a class="btn solid" href="'+escape(a.meetingJoinUrl)+'" target="_blank" rel="noopener noreferrer">Rejoindre la visio ↗</a>':'<span class="pill warn">Pas de lien vidéo reconnu</span>')+'</div>'+
 '<div class="summary-cards"><article><span>ÉTAT DU BILAN</span><strong>'+escape(d.status==='completed'?'Terminé':'En cours')+'</strong><p>'+p.measuredCount+' / 6 observations enregistrées · '+p.flaggedCount+' à vérifier</p></article>'+
 '<article><span>INDICE DÉCLARATIF</span><strong>'+(p.index===null?'—':escape(p.index.toFixed(1))+'/100')+'</strong><p>Indice exploratoire ; ni diagnostic ni âge biologique.</p></article></div>'+
 cue+'<h2>Priorités à expliquer</h2><div class="priority-grid">'+(p.focus.length?p.focus.map(x=>
 '<article><span>'+escape(x.title)+'</span><strong>'+escape(x.value)+'/100</strong><p>'+escape(x.action)+'</p></article>').join(''):'<p>Questionnaire incomplet. Aucun axe chiffré calculable.</p>')+'</div>'+
 '<h2>Observations à confirmer</h2><div class="tests">'+tests.map(([id,label,unit])=>{
 const r=d.results?.[id]||{},valid=['done','review'].includes(r.status)&&typeof r.value==='number';
 return '<div><span>'+escape(label)+'</span><strong>'+escape(valid?r.value+' '+unit:'Non mesuré')+'</strong><small>'+
 escape(r.status==='review'?'À vérifier':r.status==='done'?'Enregistré':'Manquant')+'</small></div>';
 }).join('')+'</div>'+
 '<div class="footnote">La vidéo, les photos et les données brutes webcam ne sont pas archivées. Ne jamais considérer les estimations webcam comme des mesures médicalement validées. Cette page ne permet pas de modifier le dossier.</div></section>';
}
function wireList(){
 root.querySelector('#refresh')?.addEventListener('click',()=>{state.from=root.querySelector('#date-from').value;state.to=root.querySelector('#date-to').value;void reload()});
 root.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>void openDossier(b.dataset.open)));
}
async function reload(){
 if(state.busy)return;
 state.busy=true;root.innerHTML='<div class="loading"><span>ACUITY / SYNC</span><h1>Récupération des rendez-vous…</h1><p>Les rendez-vous sont lus en direct et ne sont pas dupliqués dans Pulse.</p></div>';
 try{
  const q=new URLSearchParams({minDate:state.from,maxDate:state.to});
  const data=await callApi('/api/pulse-online-operator-schedule?'+q.toString());
  state.appointments=data.appointments||[];state.statuses={};
  const ids=state.appointments.map(x=>x.id).filter(Boolean);
  if(ids.length){
   try{
    const dossiers=await callEdge({mode:'status',appointmentIds:ids});
    state.statuses=Object.fromEntries((dossiers.dossiers||[]).map(x=>[x.appointmentId,x]));
   }catch{state.live=false}
  }
  root.innerHTML=listView();wireList();
  if(data.truncated)message('La liste Acuity a atteint la limite de 100 rendez-vous. Réduisez la période.');
 }catch(e){
  const fail=e.message==='schedule_not_configured'?
   'La connexion Acuity n’est pas configurée pour cet environnement de prévisualisation. Aucun rendez-vous réel ne peut y être affiché.':
   'Impossible de récupérer les rendez-vous. Vérifiez votre rôle administrateur, votre session et la connexion Acuity.';
  root.innerHTML='<div class="loading"><span>AGENDA INDISPONIBLE</span><h1>Connexion non établie.</h1><p>'+escape(fail)+'</p>'+
  '<button id="retry" class="btn solid">Réessayer</button></div>';
  root.querySelector('#retry').onclick=()=>void reload();
 }
 state.busy=false;
}
async function openDossier(id){
 const a=state.appointments.find(x=>x.id===id);
 if(!a)return;
 root.innerHTML='<div class="loading"><span>DONNÉES PRIVÉES</span><h1>Ouverture sécurisée…</h1><p>Vérification des droits et journalisation de la lecture.</p></div>';
 try{
  const r=await callEdge({mode:'load',appointmentId:id});
  root.innerHTML=dossierView(a,r.found?r.dossier:null);
 }catch(e){
  root.innerHTML='<div class="loading"><span>ACCÈS REFUSÉ</span><h1>Dossier indisponible.</h1>'+
   '<p>Le bilan ne peut être consulté sans authentification, consentement et traçabilité de la lecture.</p></div>';
 }
 root.querySelector('#back')?.addEventListener('click',()=>{root.innerHTML=listView();wireList()});
}
async function boot(){
 const auth=await sb.auth.getUser();
 const user=auth.data?.user;
 if(!user?.email_confirmed_at){root.innerHTML='<div class="loading"><h1>Connexion nécessaire.</h1><p>Connectez-vous à votre compte administrateur Pulse.</p><a class="btn solid" href="/#connexion">Se connecter à Pulse →</a></div>';return}
 const role=await sb.from('account_roles').select('role').eq('user_id',user.id).maybeSingle();
 if(role.error||role.data?.role!=='admin'){
  root.innerHTML='<div class="loading"><h1>Accès réservé.</h1><p>Les restitutions Online sont accessibles uniquement aux administrateurs habilités.</p><a class="btn secondary" href="/">Retour à Pulse</a></div>';return}
 const session=await sb.auth.getSession();if(!session.data?.session?.access_token)throw Error('login');
 state.token=session.data.session.access_token;
 const now=new Date(),until=new Date();until.setDate(until.getDate()+14);
 state.from=formatDate(now);state.to=formatDate(until);await reload();
}
boot().catch(()=>{root.innerHTML='<div class="loading"><h1>Session indisponible.</h1><p>Reconnectez-vous à Pulse avant d’ouvrir le poste de restitution.</p><a class="btn solid" href="/#connexion">Se connecter</a></div>'});
