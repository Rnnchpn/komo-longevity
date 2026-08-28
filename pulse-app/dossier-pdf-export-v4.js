import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const ENGINE_URLS=[
  'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js'
];
const C={ink:[38,55,45],muted:[112,123,114],line:[224,220,212],soft:[246,243,236],green:[41,58,48],green2:[95,119,102],pale:[237,243,237],warm:[251,248,242],white:[255,255,255],warn:[127,91,44],bad:[132,72,62]};
const QLABEL={KOMO_BASELINE_CORE:'Contexte & santé générale',KOMO_MOBILITY_25:'Mobilité KŌMØ · 25 items',KOMO_SLEEP_RECOVERY:'Sommeil & récupération',KOMO_WELLBEING:'Bien-être',KOMO_LIFESTYLE:'Mode de vie',KOMO_HEALTH_HISTORY:'Antécédents & histoire de santé'};
const MLABEL={VL:'Quadriceps · vaste latéral',BF:'Ischio-jambiers · biceps fémoral',GM:'Mollet · gastrocnémien',NA:'Global / marche'};
const SIDE={left:'Gauche',right:'Droite',bilateral:'Bilatéral',not_applicable:'—'};
const METRIC={activation_pctMVC:'Activation',CCI_pct:'Coactivation CCI',LSI_pct:'Indice de symétrie LSI',asymmetry_pct:'Asymétrie',fatigue_drift_pct:'Dérive de fatigue',cadence_spm:'Cadence',step_length_m:'Longueur de pas',variability_pct:'Variabilité',gait_speed_m_s:'Vitesse de marche',MVC_value:'MVC',MVC_CV_pct:'Variabilité MVC',EMD_ms:'Délai électromécanique',activation_speed:'Vitesse d’activation'};
const TASK={GAIT_4M:'Marche 4 m',CHAIR_STAND_30S:'Chair Stand 30 s',SLS_LEFT:'Appui unipodal gauche',SLS_RIGHT:'Appui unipodal droit',CALF_RAISE_30S:'Calf Raise 30 s',MVC:'Calibration MVC'};
const IND={'M-POS-02':'SVA','M-FUN-01':'GLFS-25','M-FUN-02':'Stand-Up','M-FUN-03':'Two-Step','M-FUN-04':'Chair Stand 30 s','M-FUN-05':'Vitesse de marche 4 m','M-FUN-06':'Appui unipodal gauche','M-FUN-07':'Appui unipodal droit'};
let client=null,enginePromise=null;

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return client||(client=createClient(SUPABASE_URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}))}
function toast(message){const el=document.querySelector('#toast');if(!el)return;el.textContent=message;el.hidden=false;clearTimeout(toast.timer);toast.timer=setTimeout(()=>{el.hidden=true},4500)}
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function val(v,d=0){const x=n(v);return x==null?'—':x.toFixed(d)}
function safeFile(v){return String(v||'patient').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,72)||'patient'}
function name(p){return`${p?.preferred_name||p?.first_name||''} ${p?.last_name||''}`.trim()||p?.email||'Patient KŌMØ'}
function fmt(v,time=false){if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',time?{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}:{day:'2-digit',month:'short',year:'numeric'}).format(d).replace('.','')}
function label(v){return({scheduled:'En attente',confirmed:'Validé',arrived:'Arrivé',in_progress:'En cours',completed:'Terminé',cancelled:'Annulé',no_show:'Absent',collecting:'Mesures en cours',review:'À revoir',validated:'Validé',released:'Publié',draft:'Brouillon',clinician_reviewed:'Revu par le clinicien',valid:'Valide',provisional:'Provisoire',incomplete:'Incomplet',high:'Élevée',moderate:'Modérée',limited:'Limitée',accepted:'Accepté',suspect:'À contrôler',invalid:'Invalide'})[v]||v||'—'}
function loadScript(src){return new Promise((resolve,reject)=>{if(window.jspdf?.jsPDF)return resolve();const s=document.createElement('script');s.src=src;s.async=true;s.crossOrigin='anonymous';s.onload=resolve;s.onerror=()=>reject(new Error('script_load_failed'));document.head.appendChild(s)})}
async function ensureEngine(){if(window.jspdf?.jsPDF)return window.jspdf.jsPDF;if(enginePromise)return enginePromise;enginePromise=(async()=>{let last=null;for(const src of ENGINE_URLS){try{await loadScript(src);if(window.jspdf?.jsPDF)return window.jspdf.jsPDF}catch(e){last=e}}throw last||new Error('pdf_engine_unavailable')})();try{return await enginePromise}catch(e){enginePromise=null;throw e}}
async function loadDossier(){const patientId=new URLSearchParams(location.search).get('patient')||'';if(!patientId)throw new Error('Patient non sélectionné.');const sess=await sb().auth.getSession();if(!sess.data.session?.user)throw new Error('Session Pulse expirée.');const q=await sb().rpc('komo_professional_patient_dossier',{p_patient_id:patientId});if(q.error)throw q.error;if(!q.data)throw new Error('Dossier patient vide.');return q.data}
function metricRows(d,code,muscle='',side=''){return(d?.myodev_metrics||[]).filter(x=>x.metric_code===code&&(!muscle||x.muscle_code===muscle)&&(!side||x.side===side)&&x.qc_status==='valid')}
function mean(rows){const a=rows.map(r=>n(r.value)).filter(x=>x!=null);return a.length?a.reduce((s,x)=>s+x,0)/a.length:null}
function metricValue(d,code,muscle='',side=''){return mean(metricRows(d,code,muscle,side))}
function measurement(d,code){return(d?.measurements||[]).filter(x=>x.indicator_code===code&&x.qc_status==='valid').sort((a,b)=>new Date(b.recorded_at)-new Date(a.recorded_at))[0]||null}
function synth(d){const s=d.score||{},dom=s.domain_scores||{},sig=s.muscle_signature||{},qs=(d.questionnaires||[]).filter(x=>n(x.score)!=null).sort((a,b)=>n(a.score)-n(b.score));let t=`Le bilan KŌMØ Motion retrouve un Motion Score de ${s.motion_score==null?'—':val(s.motion_score,1)+'/100'}, avec une mobilité KŌMØ à ${dom.mobility==null?'—':val(dom.mobility)+'/100'} et une symétrie MyoCare à ${dom.myocare_symmetry==null?'—':val(dom.myocare_symmetry)+'/100'}.`;if(qs[0])t+=` Le domaine déclaratif le plus bas est « ${QLABEL[qs[0].instrument_code]||qs[0].instrument_code} » (${val(qs[0].score)}/100).`;if(sig.activation?.mean_pctMVC!=null)t+=` L’activation musculaire moyenne est de ${val(sig.activation.mean_pctMVC,1)} %MVC.`;if(sig.coordination?.mean_CCI_pct!=null)t+=` Le CCI moyen est de ${val(sig.coordination.mean_CCI_pct,1)} %.`;if(sig.endurance?.mean_drift_pct!=null)t+=` La dérive de fatigue est de ${val(sig.endurance.mean_drift_pct,1)} %.`;t+=' Cette synthèse est descriptive et destinée à la lecture professionnelle.';return t}

function buildPdf(jsPDF,d){
  const doc=new jsPDF({unit:'mm',format:'a4',orientation:'portrait',compress:true,putOnlyUsedFonts:false});
  const p=d.patient||{},s=d.score||{},dom=s.domain_scores||{},sig=s.muscle_signature||{},imports=d.myocare_imports||[];
  const W=210,H=297,M=15,R=195,CW=180;let y=18;
  const setText=(c=C.ink)=>doc.setTextColor(...c),setFill=c=>doc.setFillColor(...c),setDraw=(c=C.line)=>doc.setDrawColor(...c);
  function header(){setFill(C.green);doc.rect(0,0,W,11,'F');doc.setFont('helvetica','bold');doc.setFontSize(7);setText(C.white);doc.text('KŌMØ PULSE  |  MOTION REPORT',M,7.2);doc.setFont('helvetica','normal');doc.text(p.external_reference||'',R,7.2,{align:'right'})}
  function footerAll(){const count=doc.getNumberOfPages();for(let i=1;i<=count;i++){doc.setPage(i);setDraw();doc.line(M,H-11,R,H-11);doc.setFont('helvetica','normal');doc.setFontSize(6.2);setText(C.muted);doc.text('KŌMØ Pulse · Compte-rendu professionnel · Document confidentiel',M,H-6.5);doc.text(`Page ${i}/${count}`,R,H-6.5,{align:'right'});if(p.data_classification==='synthetic'){doc.setFont('helvetica','bold');setText(C.warn);doc.text('DONNÉES SYNTHÉTIQUES · DÉMONSTRATION',W/2,H-6.5,{align:'center'})}}}
  function newPage(){doc.addPage();header();y=19}
  function ensure(h){if(y+h>H-17)newPage()}
  function lines(text,width=CW){return doc.splitTextToSize(String(text??'—'),width)}
  function section(kicker,title,note=''){ensure(18);doc.setFont('helvetica','bold');doc.setFontSize(6.5);setText(C.green2);doc.text(kicker.toUpperCase(),M,y);doc.setFontSize(15);setText(C.ink);doc.text(title,M,y+6);if(note){doc.setFont('helvetica','normal');doc.setFontSize(6.8);setText(C.muted);doc.text(lines(note,70),R,y,{align:'right'})}y+=12;setDraw();doc.line(M,y,R,y);y+=5}
  function paragraph(text,bg=null){doc.setFont('helvetica','normal');doc.setFontSize(8.1);const l=lines(text,CW-(bg?10:0)),h=l.length*4.2+(bg?10:0);ensure(h);if(bg){setFill(bg);setDraw();doc.roundedRect(M,y,CW,h,3,3,'FD');setText(C.ink);doc.text(l,M+5,y+6)}else{setText(C.ink);doc.text(l,M,y)}y+=h+3}
  function card(x,yy,w,h,labelTxt,valueTxt,sub='',dark=false){setFill(dark?C.green:C.soft);setDraw(dark?C.green:C.line);doc.roundedRect(x,yy,w,h,3.5,3.5,'FD');doc.setFont('helvetica','bold');doc.setFontSize(6.2);setText(dark?[190,204,195]:C.muted);doc.text(String(labelTxt).toUpperCase(),x+4,yy+6);doc.setFontSize(dark?29:15);setText(dark?C.white:C.ink);doc.text(String(valueTxt),x+4,yy+(dark?21:14));if(sub){doc.setFont('helvetica','normal');doc.setFontSize(6);setText(dark?[205,216,208]:C.muted);doc.text(lines(sub,w-8),x+4,yy+h-5)}}
  function rowTable(headers,rows,widths){const usable=widths.reduce((a,b)=>a+b,0);const x0=M;function drawHeader(){ensure(11);setFill(C.green);doc.rect(x0,y,usable,9,'F');let x=x0;doc.setFont('helvetica','bold');doc.setFontSize(6.2);setText(C.white);headers.forEach((h,i)=>{doc.text(lines(h,widths[i]-4),x+2,y+5.6);x+=widths[i]});y+=9}drawHeader();rows.forEach((row,idx)=>{doc.setFont('helvetica','normal');doc.setFontSize(6.7);const wraps=row.map((v,i)=>lines(v,widths[i]-4));const rh=Math.max(8,...wraps.map(a=>a.length*3.4+4));if(y+rh>H-18){newPage();drawHeader()}if(idx%2===1){setFill(C.warm);doc.rect(x0,y,usable,rh,'F')}setDraw();let x=x0;wraps.forEach((a,i)=>{doc.rect(x,y,widths[i],rh);setText(C.ink);doc.text(a,x+2,y+4.4);x+=widths[i]});y+=rh});y+=4}
  function kvRows(rows){rowTable(['Paramètre','Valeur'],rows,[58,122])}

  header();
  doc.setProperties({title:`KŌMØ Motion Report · ${name(p)}`,subject:'KŌMØ Pulse · Bilan locomoteur et musculaire',author:'KŌMØ Longevity',creator:'KŌMØ Pulse'});
  doc.setFont('helvetica','bold');doc.setFontSize(7);setText(C.green2);doc.text('KŌMØ LONGEVITY · CLINICAL MOBILITY & MUSCLE ASSESSMENT',M,23);
  doc.setFontSize(25);setText(C.ink);doc.text(name(p),M,35);
  doc.setFont('helvetica','normal');doc.setFontSize(8);setText(C.muted);doc.text(lines([p.external_reference,p.birth_date?`Né(e) le ${fmt(p.birth_date)}`:'',p.email,p.organization_name].filter(Boolean).join(' · '),CW),M,42);
  y=51;
  const score=n(s.motion_score);card(M,y,53,45,'Motion Score',score==null?'—':Math.round(score)+'/100',`${label(s.status)} · confiance ${s.confidence==null?'—':Math.round(Number(s.confidence)*100)+' %'}`,true);
  const bx=M+59,bw=(CW-65)/2;card(bx,y,bw,20,'Mobilité KŌMØ',dom.mobility==null?'—':val(dom.mobility)+'/100','60 % du score POC');card(bx+bw+6,y,bw,20,'Symétrie MyoCare',dom.myocare_symmetry==null?'—':val(dom.myocare_symmetry)+'/100','40 % du score POC');const sva=measurement(d,'M-POS-02')?.numeric_value??s.input_manifest?.inputs?.sva_mm;card(bx,y+25,bw,20,'Posture · SVA',sva==null?'—':val(sva)+' mm','Descriptif');card(bx+bw+6,y+25,bw,20,'Complétude',s.completeness==null?'—':val(s.completeness)+' %',`${label(s.release_status)} · ${d.motion?.context_class||s.context_class||'—'}`);y+=53;
  paragraph(synth(d),C.pale);

  section('Questionnaires','Résultats déclaratifs','Scores de section et réponses détaillées disponibles.');
  const qrows=(d.questionnaires||[]).map(q=>[QLABEL[q.instrument_code]||q.instrument_code,q.score==null?'—':val(q.score)+'/100',val(q.completeness)+' %',label(q.status),q.responses?.length?`${q.responses.length} réponses`:'Score agrégé']);
  rowTable(['Domaine','Score','Complétude','Statut','Détail'],qrows.length?qrows:[['Aucun questionnaire','—','—','—','—']],[60,26,28,28,38]);
  for(const q of(d.questionnaires||[]){const resp=q.responses||[];if(!resp.length)continue;section('Détail questionnaire',QLABEL[q.instrument_code]||q.instrument_code);rowTable(['Item','Réponse','Vérification'],resp.map(r=>[r.item_code||'Item',r.response_code||JSON.stringify(r.normalized_value??r.raw_value??'—'),r.clinician_verified?'Clinicien':'Patient']),[68,76,36])}

  section('Clinique','Tests fonctionnels & posture','Mesures structurées enregistrées dans le dossier.');
  const codes=['M-FUN-01','M-FUN-02','M-FUN-03','M-FUN-04','M-FUN-05','M-FUN-06','M-FUN-07'];
  const frows=codes.map(code=>{const m=measurement(d,code);let result='Non recueilli',source='—',qc='—';if(m){result=m.numeric_value!=null?`${m.numeric_value}${m.unit?' '+m.unit:''}`:(m.text_value||'—');source=m.source||'opérateur';qc=m.qc_status||'—'}else if(code==='M-FUN-05'){const g=metricRows(d,'gait_speed_m_s')[0];if(g){result=`${val(g.value,2)} ${g.unit||'m/s'}`;source='MyoCare';qc=g.qc_status||'—'}}return[IND[code]||code,result,source,label(qc)]});
  rowTable(['Test','Résultat','Source','QC'],frows,[78,42,34,26]);
  const allMeasurements=(d.measurements||[]).map(m=>[m.indicator_code||'—',IND[m.indicator_code]||m.label||m.indicator_code||'—',m.numeric_value!=null?`${m.numeric_value}${m.unit?' '+m.unit:''}`:(m.text_value||'—'),m.source||'—',label(m.qc_status)]);
  if(allMeasurements.length){section('Sources','Mesures cliniques normalisées');rowTable(['Code','Mesure','Valeur','Source','QC'],allMeasurements,[29,53,35,36,27])}

  section('Analyse musculaire','Activation, coordination, symétrie & endurance','Capteurs Myodev · données normalisées MyoCare.');
  const activation=sig.activation?.mean_pctMVC??metricValue(d,'activation_pctMVC'),cci=sig.coordination?.mean_CCI_pct??metricValue(d,'CCI_pct'),lsi=sig.symmetry?.mean_LSI_pct??metricValue(d,'LSI_pct'),drift=sig.endurance?.mean_drift_pct??metricValue(d,'fatigue_drift_pct');
  ensure(25);const kw=(CW-9)/4;card(M,y,kw,20,'Activation',activation==null?'—':val(activation,1)+' %MVC');card(M+kw+3,y,kw,20,'Coactivation CCI',cci==null?'—':val(cci,1)+' %');card(M+2*(kw+3),y,kw,20,'Symétrie LSI',lsi==null?'—':val(lsi,1)+' %');card(M+3*(kw+3),y,kw,20,'Fatigabilité',drift==null?'—':val(drift,1)+' %');y+=27;
  rowTable(['Groupe musculaire','Gauche','Droite'],['VL','BF','GM'].map(m=>[MLABEL[m],metricValue(d,'activation_pctMVC',m,'left')==null?'—':val(metricValue(d,'activation_pctMVC',m,'left'),1)+' %MVC',metricValue(d,'activation_pctMVC',m,'right')==null?'—':val(metricValue(d,'activation_pctMVC',m,'right'),1)+' %MVC']),[90,45,45]);

  section('Myodev','Détail complet des métriques','Tâche, muscle, côté, métrique, valeur, QC et calibration.');
  const mrows=(d.myodev_metrics||[]).map(r=>[TASK[r.task_code]||r.task_code||'—',MLABEL[r.muscle_code]||r.muscle_code||'—',SIDE[r.side]||r.side||'—',METRIC[r.metric_code]||r.metric_code||'—',`${val(r.value,['gait_speed_m_s','step_length_m','MVC_CV_pct','variability_pct','fatigue_drift_pct'].includes(r.metric_code)?2:1)}${r.unit?' '+r.unit:''}`,label(r.qc_status),r.calibration_id||'—']);
  rowTable(['Tâche','Muscle','Côté','Métrique','Valeur','QC','Calibration'],mrows.length?mrows:[['Aucune donnée','—','—','—','—','—','—']],[28,34,20,34,25,18,21]);

  section('Imports','Provenance MyoCare / Myodev','Historique des fichiers ayant alimenté ce bilan.');
  const irows=imports.map(i=>[i.source_file_name||'Export MyoCare',`${i.source_product||'MyoCare'} ${i.source_version||''}`.trim(),i.contract_version||'—',label(i.status),fmt(i.recorded_at||i.created_at,true)]);
  rowTable(['Fichier source','Produit','Contrat','Statut','Acquisition'],irows.length?irows:[['Aucun import','—','—','—','—']],[55,35,33,25,32]);

  section('Traçabilité','Qualité, algorithme & validation');
  kvRows([
    ['Algorithme',s.algorithm_version||'—'],['Référence',s.reference_version||'—'],['Statut du score',label(s.status)],['Statut de publication',label(s.release_status)],['Confiance',s.confidence==null?'—':Math.round(Number(s.confidence)*100)+' %'],['Complétude',s.completeness==null?'—':val(s.completeness)+' %'],['Calculé le',fmt(s.calculated_at,true)],['Revu le',fmt(s.reviewed_at,true)],['Publié le',fmt(s.released_at,true)],['Contrat Myodev',sig.contract_version||imports[0]?.contract_version||'—'],['Protocole',d.motion?.protocol_version||'—'],['Contexte',d.motion?.context_class||s.context_class||'—']
  ]);
  paragraph('Note méthodologique : le Motion Score v0.5 est un score POC non diagnostique. La version actuelle pondère la mobilité KŌMØ à 60 % et la symétrie MyoCare à 40 %. La posture SVA, l’activation, la coactivation et la fatigabilité sont affichées de manière descriptive tant que leurs références KŌMØ ne sont pas verrouillées.',[255,248,237]);
  footerAll();
  return doc;
}

async function downloadPdf(button){const original=button.textContent;try{button.disabled=true;button.textContent='Génération du PDF…';toast('Génération vectorielle du compte-rendu…');const [jsPDF,d]=await Promise.all([ensureEngine(),loadDossier()]);const counts=(d.questionnaires?.length||0)+(d.measurements?.length||0)+(d.myodev_metrics?.length||0);if(counts<3)throw new Error('Dossier insuffisamment renseigné pour générer le rapport complet.');const doc=buildPdf(jsPDF,d);const blob=doc.output('blob');if(!blob||blob.size<12000)throw new Error(`PDF anormalement petit (${Math.round((blob?.size||0)/1024)} Ko). Export annulé.`);const filename=`KOMO_Motion_Report_${safeFile(name(d.patient||{}))}_${new Date().toISOString().slice(0,10)}.pdf`;const url=globalThis.URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>globalThis.URL.revokeObjectURL(url),30000);toast(`PDF exporté · ${Math.round(blob.size/1024)} Ko · ${doc.getNumberOfPages()} pages`)}catch(e){console.error('[dossier-pdf-export-v4]',e);toast(`Export PDF impossible : ${e?.message||'Erreur inconnue'}`)}finally{button.disabled=false;button.textContent=original}}

document.addEventListener('click',event=>{const button=event.target?.closest?.('#pdfBtn');if(!button)return;event.preventDefault();event.stopImmediatePropagation();downloadPdf(button)},true);
