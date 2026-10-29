// KŌMØ Operator — local, isolated consultation rehearsal.
// Every person, test and observation in this file is explicitly fictitious.
// Requires an already authenticated admin at the caller. Never reads/writes
// a real patient dossier, Acuity meeting, microphone recording or database.
import {buildMotionPassport} from '../session/motion-passport.mjs';

const clean=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const TESTS=[
 ['sts','Lever de chaise · 30 secondes','répétitions'],
 ['heels','Élévations des talons','répétitions'],
 ['unipodal_left','Équilibre gauche','secondes'],
 ['unipodal_right','Équilibre droit','secondes'],
 ['arms','Mobilité des bras','mouvements'],
 ['posture','Posture de profil','indice de surface']
];
export const DEMO_PATIENT=Object.freeze({
 name:'Camille Martin',type:'Dossier fictif · démonstration uniquement',
 goal:'Retrouver de l’aisance à la marche',age:'60–69 ans',appointment:'Simulation non planifiée'
});
export const DEMO_ANSWERS=Object.freeze({
 ageBand:'60-69',goal:'walk',
 walk10:'2',stairs:'3',chair:'2',carry:'2',bend:'2',obstacle:'3',turn:'1',stand:'1',
 pain:'1',fatigue:'2',fear:'1',avoid:'1',
 sleep:'2',stress:'1',recovered:'2',qol:'1',
 walkingDays:'2',strengthDays:'3',outdoors:'2',breaks:'1',
 safety:'no'
});
export const DEMO_RESULTS=Object.freeze({
 sts:{status:'done',value:14,quality:89,source:'webcam'},
 heels:{status:'done',value:21,quality:83,source:'webcam'},
 unipodal_left:{status:'review',value:8.5,quality:52,source:'webcam'},
 unipodal_right:{status:'done',value:12.2,quality:86,source:'webcam'},
 arms:{status:'done',value:11,quality:88,source:'webcam'},
 posture:{status:'review',value:5.2,quality:57,source:'webcam'}
});
const SCRIPT=[
 {title:'Accueil et objectif',time:'2 min',description:'Clarifier ce que la personne souhaite améliorer, avec ses mots.',
  sample:'« Qu’aimeriez-vous retrouver ou préserver dans vos mouvements au quotidien ? »',
  check:'Objectif de la personne identifié'},
 {title:'Lire le passeport',time:'3 min',description:'Présenter l’indice déclaratif et les quatre domaines, sans les assimiler à un diagnostic.',
  sample:'« Ce chiffre vient de vos réponses. Il nous aide à choisir quoi suivre, mais ne prédit ni votre âge biologique ni votre longévité. »',
  check:'Indices et limites expliqués'},
 {title:'Relire les tests',time:'3 min',description:'Distinguer les observations disponibles de celles à revérifier.',
  sample:'« Certaines mesures à la webcam sont indicatives : ici l’équilibre gauche et la posture sont à confirmer. »',
  check:'Qualité des mesures discutée'},
 {title:'Choisir deux priorités',time:'3 min',description:'Relier les deux axes du passeport à des actions accessibles, sans prescription automatique.',
  sample:'« Commençons par deux priorités concrètes et voyons ce qui est réaliste pour vous. »',
  check:'Deux priorités comprises'},
 {title:'Conclure et orienter',time:'2 min',description:'Présenter Pulse Daily, un bilan instrumenté ou un prochain point de contrôle selon les limites constatées.',
  sample:'« Je vous propose une suite simple et un point comparatif dans quelques semaines. »',
  check:'Prochaine étape clarifiée'}
];
const NEXT=[
 {id:'daily',title:'Pulse Daily',subtitle:'Un suivi de mouvement sur 28 jours, lorsque adapté et accessible'},
 {id:'lab',title:'Motion en centre',subtitle:'Mesures instrumentées de force, marche et mobilité à Paris ou Cannes'},
 {id:'checkpoint',title:'Nouveau point de contrôle',subtitle:'Réévaluation comparable après 4 à 6 semaines'}
];
const fmt=v=>typeof v==='number'&&Number.isFinite(v)?new Intl.NumberFormat('fr-FR',{maximumFractionDigits:1}).format(v):'—';
const prioName=p=>p.focus?.map(d=>d.title).join(' · ')||'À préciser';
export function demoPassport(){
 return buildMotionPassport(DEMO_ANSWERS,DEMO_RESULTS,false);
}
export function demoSummary({note='',next='checkpoint',stage='completed'}={}){
 const passport=demoPassport();
 const option=NEXT.find(x=>x.id===next)||NEXT[2];
 return [
  'KŌMØ PULSE — SYNTHÈSE FICTIVE DE DÉMONSTRATION',
  'Patient fictif : '+DEMO_PATIENT.name+' · aucun dossier réel',
  'État de simulation : '+stage,
  'Indice de mobilité perçue (déclaratif, exploratoire) : '+fmt(passport.index)+'/100',
  'Observations webcam fictives : '+passport.measuredCount+'/6 ; à revérifier : '+passport.flaggedCount,
  'Axes de discussion : '+prioName(passport),
  'Suite envisagée : '+option.title,
  'Note de démonstration : '+String(note).slice(0,800),
  'Ce document est une simulation non médicale. Aucun acte ni résultat clinique réel.'
 ].join('\n');
}
function domainsHtml(p){
 return '<div class="demo-domain-list">'+p.domains.map(d=>'<div class="demo-domain"><div class="demo-domain-top"><span>'+clean(d.title)+'</span><strong>'+
 (typeof d.value==='number'?fmt(d.value)+'/100':'Non renseigné')+'</strong></div><div class="demo-domain-track"><i style="width:'+(d.value??0)+'%"></i></div></div>').join('')+'</div>';
}
function testHtml(){
 return '<div class="demo-test-list">'+TESTS.map(([id,label,unit])=>{
  const r=DEMO_RESULTS[id];
  return '<div class="demo-test-row"><div><strong>'+clean(label)+'</strong><small>'+
   (r.status==='review'?'À confirmer':'Observation fictive')+'</small></div><div><b>'+clean(fmt(r.value)+' '+unit)+'</b><span class="'+(r.status==='review'?'review':'ok')+'">'+
   (r.status==='review'?'À vérifier':'Relevé')+'</span></div></div>';
 }).join('')+'</div>';
}
function viewDossier(p){
 return '<div class="demo-sidebar-pane"><div class="demo-pane-eyebrow">DÉMONSTRATION · PASSEPORT</div>'+
 '<div class="demo-score"><span>INDICE DE MOBILITÉ PERÇUE</span><strong>'+fmt(p.index)+'<small>/100</small></strong>'+
 '<p>Issu exclusivement du questionnaire fictif. Aucun Motion Score clinique, âge biologique ou diagnostic n’est calculé.</p></div>'+
 '<h3>Quatre domaines</h3>'+domainsHtml(p)+
 '<div class="demo-pane-label">DEUX AXES PRIORITAIRES</div><div class="demo-focus-list">'+p.focus.map((d,i)=>'<article><b>'+String(i+1).padStart(2,'0')+'</b><div><strong>'+clean(d.title)+'</strong><small>'+clean(d.action)+'</small></div></article>').join('')+'</div>'+
 '<h3>Observations guidées</h3>'+testHtml()+'</div>';
}
function viewGuide(active,checked,stage){
 const item=SCRIPT[active];
 return '<div class="demo-sidebar-pane"><div class="demo-pane-eyebrow">CONDUITE DE RESTITUTION · NON MÉDICALE</div>'+
 '<div class="demo-guide-progress">'+SCRIPT.map((it,i)=>'<button type="button" class="'+(i===active?'active ':'')+(checked.has(i)?'done':'')+'" data-guide-step="'+i+'">'+(checked.has(i)?'✓':i+1)+'</button>').join('')+'</div>'+
 '<div class="demo-guide-position">ÉTAPE '+String(active+1).padStart(2,'0')+' / '+SCRIPT.length+' <span>'+item.time+'</span></div>'+
 '<h2>'+clean(item.title)+'</h2><p>'+clean(item.description)+'</p>'+
 '<blockquote>'+clean(item.sample)+'</blockquote>'+
 '<label class="demo-checkline"><input type="checkbox" id="guide-confirm" '+(checked.has(active)?'checked':'')+'>'+
 '<span>'+clean(item.check)+'</span></label>'+
 '<div class="demo-guide-controls"><button type="button" data-guide-back '+(active===0?'disabled':'')+' class="demo-secondary">Précédent</button>'+
 '<button type="button" data-guide-next class="demo-solid">'+(active===SCRIPT.length-1?'Passer à la conclusion':'Étape suivante')+' →</button></div>'+
 '<div class="demo-guide-foot">Le guide prépare ton échange. Les cases cochées ne sont ni transmises ni archivées.</div></div>';
}
function viewConclusion(p,state){
 const current=NEXT.find(x=>x.id===state.next)||NEXT[2];
 return '<div class="demo-sidebar-pane"><div class="demo-pane-eyebrow">CONCLUSION · DÉMONSTRATION</div>'+
 '<h2>Faire du bilan une prochaine action.</h2><p>Synthèse du scénario fictif, sans envoi au patient ni écriture en base.</p>'+
 '<div class="demo-priorities">'+p.focus.map((d,i)=>'<span><b>0'+(i+1)+'</b> '+clean(d.title)+'</span>').join('')+'</div>'+
 '<div class="demo-next-list">'+NEXT.map(o=>'<label class="'+(state.next===o.id?'selected':'')+'"><input type="radio" name="demo-next" value="'+o.id+'" '+(state.next===o.id?'checked':'')+'>'+
 '<span><strong>'+clean(o.title)+'</strong><small>'+clean(o.subtitle)+'</small></span></label>').join('')+'</div>'+
 '<label class="demo-note-label">Ta synthèse (locale, non enregistrée)<textarea id="demo-notes" maxlength="800" rows="4" placeholder="Ce que tu aimerais dire au patient...">'+clean(state.note)+'</textarea></label>'+
 '<div class="demo-conclusion-actions"><button type="button" class="demo-solid" id="demo-copy">Copier la synthèse fictive</button>'+
 '<small>Choix actuel : '+clean(current.title)+'. Aucune donnée envoyée.</small></div>'+
 '</div>';
}
const stageText={prepare:'Préparation',live:'En entretien simulé',done:'Restitution terminée'};
export function mountConsultationDemo(root,{operatorEmail='',onExit=()=>{}}={}){
 if(!root)throw Error('demo_root_required');
 let stream=null,dead=false;
 const p=demoPassport();
 const st={stage:'prepare',tab:'dossier',active:0,checked:new Set(),notes:'',next:'checkpoint',showPreview:false,camera:'off',mic:'unchecked',notice:''};
 const stopCamera=()=>{
  if(stream){for(const track of stream.getTracks())track.stop();stream=null;}
  st.camera='off';
  const v=root.querySelector('#demo-self-video');if(v){v.srcObject=null;v.hidden=true;}
 };
 const hideOrStop=()=>{if(document.hidden)stopCamera()};
 const onLeave=()=>{stopCamera()};
 document.addEventListener('visibilitychange',hideOrStop);
 window.addEventListener('pagehide',onLeave);
 function dispose(){
  if(dead)return;
  dead=true;stopCamera();document.removeEventListener('visibilitychange',hideOrStop);window.removeEventListener('pagehide',onLeave);
 }
 function render(){
  if(dead)return;
  const activeTab=st.tab;
  const completed=st.checked.size;
  const phase=stageText[st.stage];
  root.innerHTML='<div class="demo-app">'+
   '<div class="demo-banner"><div><span class="demo-simulation-dot"></span><strong>ENVIRONNEMENT DE DÉMONSTRATION</strong><small>Patient inventé · aucun rendez-vous ni appel réel</small></div>'+
   '<button type="button" id="demo-exit">Quitter la simulation <span>×</span></button></div>'+
   '<div class="demo-bar"><div><span class="demo-overline">KŌMØ PULSE / SALLE DE RESTITUTION</span>'+
   '<h1>La consultation, <em>simplement.</em></h1><p>Un espace pour expliquer, partager une lecture et définir la suite.</p></div>'+
   '<div class="demo-bar-actions"><div class="demo-operator"><span>OPÉRATEUR CONNECTÉ</span><strong>'+clean(operatorEmail||'Compte administrateur')+'</strong></div>'+
   (st.stage==='prepare'?'<button type="button" class="demo-main-cta" id="demo-start">Démarrer la consultation test ↗</button>':
    st.stage==='live'?'<button type="button" class="demo-main-cta" id="demo-finish">Terminer la restitution →</button>':
    '<button type="button" class="demo-main-cta" id="demo-reset">Recommencer la simulation ↻</button>')+
   '</div></div>'+
   '<div class="demo-case-strip"><div class="demo-avatar">CM</div><div class="demo-case-name"><strong>'+clean(DEMO_PATIENT.name)+'</strong>'+
   '<span>Patient fictif · '+clean(DEMO_PATIENT.age)+' · '+clean(DEMO_PATIENT.goal)+'</span></div>'+
   '<div class="demo-case-state"><span class="demo-pill">'+clean(phase)+'</span><span class="demo-meta">0 € · sans réservation Acuity</span></div></div>'+
   '<div class="demo-columns"><div class="demo-left">'+
   '<section class="demo-call"><div class="demo-call-top"><span class="demo-call-label"><i></i> SALLE DE RESTITUTION · SIMULÉE</span>'+
   '<span>'+ (st.camera==='on'?'Caméra locale active':'Caméra éteinte')+'</span></div>'+
   '<div class="demo-screen">'+
    (st.showPreview?'<div class="demo-share-content"><span>KŌMØ / PASSEPORT PARTAGÉ — APERÇU LOCAL</span><h2>Votre mouvement.<br><em>Votre point de départ.</em></h2>'+
     '<div class="demo-share-score">'+fmt(p.index)+'<small>/100</small></div><p>Indice exploratoire fondé sur les réponses du patient fictif.</p>'+
     '<div class="demo-share-bars">'+p.domains.map(d=>'<div><span>'+clean(d.title)+'</span><b>'+fmt(d.value)+'</b></div>').join('')+'</div>'+
     '<small>Aucun partage réseau · simple prévisualisation</small></div>':
    '<div class="demo-screen-idle" id="demo-idle"><div class="demo-pulse-orbit">K<span>Ō</span></div>'+
     '<span>TON APERÇU CAMÉRA</span><p>Active ta caméra pour vérifier le cadrage.<br>La vidéo n’est ni envoyée ni enregistrée.</p></div>')+
   '<video id="demo-self-video" autoplay muted playsinline hidden></video>'+
   '<div class="demo-remote-tile"><span class="demo-remote-avatar">CM</span><div><strong>Patient fictif</strong><small>Non connecté — aucune personne à distance</small></div></div>'+
   '</div>'+
   '<div class="demo-call-controls"><button type="button" id="demo-camera" class="'+(st.camera==='on'?'selected':'')+'">'+(st.camera==='on'?'◉ Arrêter la caméra':'◎ Tester ma caméra')+'</button>'+
   '<button type="button" id="demo-micro">◌ Tester le microphone</button>'+
   '<button type="button" id="demo-preview" class="'+(st.showPreview?'selected':'')+'">'+(st.showPreview?'▧ Fermer l’aperçu':'▧ Simuler un partage')+'</button></div>'+
   '<div class="demo-device-info" id="demo-device-info">'+clean(st.notice||'Aucun appel vidéo réel. Tu peux tester localement caméra et microphone.')+'</div></section>'+
   '<section class="demo-flow"><div class="demo-flow-head"><span>CONDUITE DE CONSULTATION</span><strong>'+completed+' / '+SCRIPT.length+' étapes validées</strong></div>'+
   '<div class="demo-flow-track"><i style="width:'+(completed/SCRIPT.length*100)+'%"></i></div>'+
   '<div class="demo-flow-items">'+SCRIPT.map((g,i)=>'<button type="button" data-demo-jump="'+i+'" class="'+(st.checked.has(i)?'done ':'')+(st.active===i?'active':'')+'">'+
    '<b>'+String(i+1).padStart(2,'0')+'</b><span>'+clean(g.title)+'</span></button>').join('')+'</div></section>'+
   '</div>'+
   '<aside class="demo-right"><nav class="demo-tabs" aria-label="Contenu de consultation">'+
   [['dossier','Dossier'],['guide','Conduite'],['conclusion','Suite & synthèse']].map(([id,label])=>
    '<button type="button" data-demo-tab="'+id+'" class="'+(activeTab===id?'active':'')+'">'+label+'</button>').join('')+
   '</nav><div class="demo-sidebar-content">'+(activeTab==='dossier'?viewDossier(p):
    activeTab==='guide'?viewGuide(st.active,st.checked,st.stage):viewConclusion(p,st))+'</div></aside></div>'+
   '<div class="demo-footer"><p>Simulation non médicale. Aucun patient connecté, aucune réunion générée, aucune donnée modifiée dans Pulse ou Acuity.</p>'+
   '<button type="button" id="demo-back-agenda">Retour à mon agenda</button></div></div>';
  const video=root.querySelector('#demo-self-video');
  if(stream&&video&&!st.showPreview){
   video.srcObject=stream;video.hidden=false;video.play().catch(()=>{});
   const idle=root.querySelector('#demo-idle');if(idle)idle.hidden=true;
  }
  bind();
 }
 async function testCamera(){
  if(stream){stopCamera();st.notice='Caméra locale arrêtée.';render();return;}
  if(!navigator.mediaDevices?.getUserMedia){st.notice='Caméra non disponible dans ce navigateur ou dans ce contexte.';render();return;}
  st.notice='Demande d’autorisation caméra…';render();
  try{
   const media=await navigator.mediaDevices.getUserMedia({video:{facingMode:'user'},audio:false});
   if(dead||document.hidden){for(const t of media.getTracks())t.stop();return;}
   stream=media;st.camera='on';st.notice='Caméra locale activée. Elle ne transmet aucune vidéo.';
   st.showPreview=false;render();
  }catch{st.camera='off';st.notice='Caméra non accessible. Vérifie ses autorisations ou utilise un autre appareil.';render();}
 }
 async function testMicro(){
  if(!navigator.mediaDevices?.getUserMedia){st.notice='Microphone indisponible dans ce navigateur.';render();return;}
  try{
   const media=await navigator.mediaDevices.getUserMedia({audio:true,video:false});
   for(const t of media.getTracks())t.stop();
   if(dead)return;
   st.mic='ok';st.notice='Microphone autorisé : test local terminé, capture immédiatement arrêtée.';render();
  }catch{if(dead)return;st.mic='fail';st.notice='Microphone bloqué ou indisponible. Contrôle les autorisations.';render();}
 }
 function bind(){
  const q=sel=>root.querySelector(sel);
  const exit=()=>{dispose();onExit();};
  q('#demo-exit').onclick=exit;
  q('#demo-back-agenda').onclick=exit;
  q('#demo-camera').onclick=()=>{void testCamera()};
  q('#demo-micro').onclick=()=>{void testMicro()};
  q('#demo-preview').onclick=()=>{st.showPreview=!st.showPreview;render()};
  q('#demo-start')&&(q('#demo-start').onclick=()=>{st.stage='live';st.tab='guide';render()});
  q('#demo-finish')&&(q('#demo-finish').onclick=()=>{stopCamera();st.stage='done';st.tab='conclusion';render()});
  q('#demo-reset')&&(q('#demo-reset').onclick=()=>{st.stage='prepare';st.checked.clear();st.active=0;st.tab='dossier';st.next='checkpoint';st.notes='';render()});
  root.querySelectorAll('[data-demo-tab]').forEach(b=>b.onclick=()=>{st.tab=b.dataset.demoTab;render()});
  root.querySelectorAll('[data-demo-jump]').forEach(b=>b.onclick=()=>{st.active=Number(b.dataset.demoJump);st.tab='guide';render()});
  root.querySelectorAll('[data-guide-step]').forEach(b=>b.onclick=()=>{st.active=Number(b.dataset.guideStep);render()});
  const confirm=q('#guide-confirm');
  if(confirm)confirm.onchange=()=>{if(confirm.checked)st.checked.add(st.active);else st.checked.delete(st.active);render()};
  const back=q('[data-guide-back]');if(back)back.onclick=()=>{st.active=Math.max(0,st.active-1);render()};
  const next=q('[data-guide-next]');if(next)next.onclick=()=>{if(st.active<SCRIPT.length-1)st.active++;else st.tab='conclusion';render()};
  root.querySelectorAll('[name=demo-next]').forEach(input=>input.onchange=()=>{st.next=input.value;render()});
  const notes=q('#demo-notes');if(notes)notes.oninput=()=>{st.notes=notes.value.slice(0,800)};
  const copy=q('#demo-copy');if(copy)copy.onclick=async()=>{
   try{await navigator.clipboard.writeText(demoSummary({note:st.notes,next:st.next,stage:st.stage}));
    const b=q('#demo-copy');if(b)b.textContent='Synthèse fictive copiée ✓';
   }catch{st.notice='Copie indisponible. Vérifie les permissions du navigateur.';render()}
  };
 }
 render();
 return {dispose,getState:()=>({stage:st.stage,tab:st.tab,checked:[...st.checked],cameraActive:Boolean(stream)})};
}
