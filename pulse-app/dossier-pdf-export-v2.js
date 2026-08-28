import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
import { interpretDossier, levelLabel, sourceList } from './normative-engine-v1.js';

const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
const REM='komo_pulse_remember';
const ENGINE_URLS=['https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js'];
const C={ink:[36,51,42],muted:[107,117,109],line:[224,220,212],soft:[246,243,236],green:[39,57,47],green2:[91,119,99],greenPale:[235,243,236],gold:[181,141,74],goldPale:[255,247,232],red:[137,72,61],redPale:[252,238,235],gray:[140,145,141],grayPale:[244,244,241],white:[255,255,255]};
const MLABEL={VL:'Quadriceps — vaste latéral',BF:'Ischio-jambiers — biceps fémoral',GM:'Mollet — gastrocnémien',NA:'Global / marche'};
const SIDE={left:'Gauche',right:'Droite',bilateral:'Bilatéral',not_applicable:'—'};
const METRIC={activation_pctMVC:'Activation',CCI_pct:'Coactivation CCI',LSI_pct:'Symétrie LSI',asymmetry_pct:'Asymétrie',fatigue_drift_pct:'Fatigabilité',cadence_spm:'Cadence',step_length_m:'Longueur de pas',gait_speed_m_s:'Vitesse de marche',MVC_value:'MVC'};
let client=null,enginePromise=null;

function storage(){return localStorage.getItem(REM)==='1'?localStorage:sessionStorage}
function sb(){return client||(client=createClient(SUPABASE_URL,KEY,{auth:{storage:storage(),persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}))}
function toast(message){const el=document.querySelector('#toast');if(!el)return;el.textContent=message;el.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>el.hidden=true,5000)}
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function val(v,d=0){const x=n(v);return x===null?'—':x.toFixed(d)}
function safeFile(v){return String(v||'patient').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,72)||'patient'}
function patientName(p){return`${p?.preferred_name||p?.first_name||''} ${p?.last_name||''}`.trim()||p?.email||'Patient KOMO'}
function fmt(v){if(!v)return'—';const d=new Date(v);if(Number.isNaN(d.getTime()))return'—';return new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(d).replace('.','')}
function loadScript(src){return new Promise((resolve,reject)=>{if(window.jspdf?.jsPDF)return resolve();const s=document.createElement('script');s.src=src;s.async=true;s.crossOrigin='anonymous';s.onload=resolve;s.onerror=()=>reject(new Error('script_load_failed'));document.head.appendChild(s)})}
async function ensureEngine(){if(window.jspdf?.jsPDF)return window.jspdf.jsPDF;if(enginePromise)return enginePromise;enginePromise=(async()=>{let last=null;for(const src of ENGINE_URLS){try{await loadScript(src);if(window.jspdf?.jsPDF)return window.jspdf.jsPDF}catch(e){last=e}}throw last||new Error('pdf_engine_unavailable')})();try{return await enginePromise}catch(e){enginePromise=null;throw e}}
async function loadDossier(){const patientId=new URLSearchParams(location.search).get('patient')||'';if(!patientId)throw new Error('Patient non sélectionné.');const sess=await sb().auth.getSession();if(!sess.data.session?.user)throw new Error('Session Pulse expirée.');const q=await sb().rpc('komo_professional_patient_dossier',{p_patient_id:patientId});if(q.error)throw q.error;if(!q.data)throw new Error('Dossier patient vide.');return q.data}
function levelColor(s){return s==='favorable'?C.green2:s==='watch'?C.gold:s==='priority'||s==='review'?C.red:C.gray}
function levelPale(s){return s==='favorable'?C.greenPale:s==='watch'?C.goldPale:s==='priority'||s==='review'?C.redPale:C.grayPale}
function referenceShort(f){return f.referenceLabel||'Mesure descriptive'}
function barSpec(f){const x=n(f.rawValue);if(x===null)return null;const map={glfs25:{min:0,max:100,direction:'lower'},two_step:{min:0,max:2,direction:'higher'},chair_stand:{min:0,max:30,direction:'higher'},gait_speed:{min:0,max:2,direction:'higher'},sva:{min:0,max:150,direction:'lower'},lsi:{min:0,max:100,direction:'higher'}};if(f.id?.startsWith('q_'))return{min:0,max:100,direction:'higher'};return map[f.id]||null}

function buildPdf(jsPDF,d){
  const report=interpretDossier(d),doc=new jsPDF({unit:'mm',format:'a4',compress:true}),p=d.patient||{},s=d.score||{};
  const W=210,H=297,M=15,R=195,CW=180;let y=18;
  const setText=(c=C.ink)=>doc.setTextColor(...c),setFill=c=>doc.setFillColor(...c),setDraw=(c=C.line)=>doc.setDrawColor(...c);
  const lines=(t,w=CW)=>doc.splitTextToSize(String(t??'—'),w);
  function header(){setFill(C.green);doc.rect(0,0,W,11,'F');doc.setFont('helvetica','bold');doc.setFontSize(7);setText(C.white);doc.text('KŌMØ PULSE  |  MOTION REPORT',M,7.2);doc.setFont('helvetica','normal');doc.text(p.external_reference||'',R,7.2,{align:'right'})}
  function newPage(){doc.addPage();header();y=19}
  function ensure(h){if(y+h>H-18)newPage()}
  function section(kicker,title,note=''){ensure(18);doc.setFont('helvetica','bold');doc.setFontSize(6.1);setText(C.green2);doc.text(String(kicker).toUpperCase(),M,y);doc.setFontSize(15);setText(C.ink);doc.text(title,M,y+6);if(note){doc.setFont('helvetica','normal');doc.setFontSize(6.5);setText(C.muted);doc.text(lines(note,75),R,y,{align:'right'})}y+=12;setDraw();doc.line(M,y,R,y);y+=5}
  function paragraph(text,bg=null){doc.setFont('helvetica','normal');doc.setFontSize(7.6);const l=lines(text,CW-(bg?10:0)),h=l.length*4+(bg?8:0);ensure(h);if(bg){setFill(bg);setDraw();doc.roundedRect(M,y,CW,h,3,3,'FD');setText(C.ink);doc.text(l,M+5,y+5)}else{setText(C.ink);doc.text(l,M,y)}y+=h+3}
  function scoreCard(x,yy,w,h,label,value,sub,dark=false){setFill(dark?C.green:C.soft);setDraw(dark?C.green:C.line);doc.roundedRect(x,yy,w,h,4,4,'FD');doc.setFont('helvetica','bold');doc.setFontSize(6);setText(dark?[195,209,200]:C.muted);doc.text(String(label).toUpperCase(),x+4,yy+6);doc.setFontSize(dark?27:15);setText(dark?C.white:C.ink);doc.text(String(value),x+4,yy+(dark?21:15));doc.setFont('helvetica','normal');doc.setFontSize(5.7);setText(dark?[210,219,212]:C.muted);doc.text(lines(sub,w-8),x+4,yy+h-5)}
  function pill(status,x,yy){const txt=levelLabel(status),w=Math.max(18,doc.getTextWidth(txt)+8);setFill(levelPale(status));setDraw(levelColor(status));doc.roundedRect(x,yy,w,6,3,3,'FD');doc.setFont('helvetica','bold');doc.setFontSize(5.7);setText(levelColor(status));doc.text(txt,x+4,yy+4);return w}
  function rangeBar(f,x,yy,w=58){const spec=barSpec(f),raw=n(f.rawValue);if(!spec||raw===null)return;setFill(C.grayPale);doc.roundedRect(x,yy,w,4,2,2,'F');const seg=w/3;if(spec.direction==='higher'){setFill(C.redPale);doc.rect(x,yy,seg,4,'F');setFill(C.goldPale);doc.rect(x+seg,yy,seg,4,'F');setFill(C.greenPale);doc.rect(x+seg*2,yy,seg,4,'F')}else{setFill(C.greenPale);doc.rect(x,yy,seg,4,'F');setFill(C.goldPale);doc.rect(x+seg,yy,seg,4,'F');setFill(C.redPale);doc.rect(x+seg*2,yy,seg,4,'F')}const pct=Math.max(0,Math.min(1,(raw-spec.min)/(spec.max-spec.min)));setFill(levelColor(f.status));doc.circle(x+pct*w,yy+2,2.1,'F')}
  function findingBlock(f){const h=35;ensure(h);setFill(levelPale(f.status));setDraw(C.line);doc.roundedRect(M,y,CW,h,3,3,'FD');doc.setFont('helvetica','bold');doc.setFontSize(8.5);setText(C.ink);doc.text(f.title,M+5,y+7);pill(f.status,R-34,y+3.5);doc.setFontSize(15);setText(levelColor(f.status));doc.text(f.displayValue||'—',M+5,y+16);rangeBar(f,M+42,y+12,62);doc.setFont('helvetica','normal');doc.setFontSize(6.2);setText(C.muted);doc.text(lines(referenceShort(f),78),M+105,y+7);doc.setFontSize(6.7);setText(C.ink);doc.text(lines(f.patientMessage||'',CW-10),M+5,y+23);y+=h+4}
  function table(headers,rows,widths){const lineH=4.2,pad=2.4;const drawRow=(cells,head=false)=>{const ls=cells.map((c,i)=>lines(c,widths[i]-pad*2)),rh=Math.max(...ls.map(a=>a.length))*lineH+pad*2;ensure(rh);let x=M;for(let i=0;i<cells.length;i++){setFill(head?C.green:(Math.round(y)%2?C.white:C.soft));setDraw();doc.rect(x,y,widths[i],rh,'FD');doc.setFont('helvetica',head?'bold':'normal');doc.setFontSize(head?6:5.8);setText(head?C.white:C.ink);doc.text(ls[i],x+pad,y+pad+3);x+=widths[i]}y+=rh};drawRow(headers,true);rows.forEach(r=>drawRow(r,false));y+=4}
  function footer(){const count=doc.getNumberOfPages();for(let i=1;i<=count;i++){doc.setPage(i);setDraw();doc.line(M,H-11,R,H-11);doc.setFont('helvetica','normal');doc.setFontSize(5.8);setText(C.muted);doc.text(`KŌMØ Pulse · ${report.engineVersion} · Document confidentiel`,M,H-6.3);doc.text(`Page ${i}/${count}`,R,H-6.3,{align:'right'});if(p.data_classification==='synthetic'){doc.setFont('helvetica','bold');setText(C.gold);doc.text('DONNÉES SYNTHÉTIQUES — DÉMONSTRATION',W/2,H-6.3,{align:'center'})}else if(s.release_status!=='released'){doc.setFont('helvetica','bold');setText(C.red);doc.text('BROUILLON — À VALIDER PAR LE PROFESSIONNEL',W/2,H-6.3,{align:'center'})}}}

  header();
  doc.setFont('helvetica','bold');doc.setFontSize(6.5);setText(C.green2);doc.text('VOTRE BILAN DE MOBILITÉ & ANALYSE MUSCULAIRE',M,22);
  doc.setFontSize(22);setText(C.ink);doc.text(patientName(p),M,31);
  doc.setFont('helvetica','normal');doc.setFontSize(7);setText(C.muted);doc.text(`${p.external_reference||'—'} · ${report.context.age??'—'} ans · ${d.organization?.name||''}`,M,37);
  const motion=n(s.motion_score),mob=n(s.domain_scores?.mobility),sym=n(s.domain_scores?.myocare_symmetry),complete=n(s.completeness);
  scoreCard(M,45,44,31,'Motion Score',motion===null?'—':`${Math.round(motion)}/100`,`${s.status||'—'} · confiance ${n(s.confidence)!==null?Math.round(n(s.confidence)*100)+'%':'—'}`,true);
  scoreCard(63,45,42,31,'Mobilité KŌMØ',mob===null?'—':`${Math.round(mob)}/100`,'Score propriétaire KŌMØ');
  scoreCard(109,45,42,31,'Symétrie MyoCare',sym===null?'—':`${Math.round(sym)}/100`,'Benchmark LSI contextualisé');
  scoreCard(155,45,40,31,'Complétude',complete===null?'—':`${Math.round(complete)}%`,'Qualité des données');
  y=84;
  section('À retenir','Vos résultats en 30 secondes','Les zones indiquent où vous vous situez par rapport aux repères applicables.');
  if(report.consistencyIssues.length){paragraph(`REVUE NÉCESSAIRE · ${report.consistencyIssues.map(i=>i.message).join(' ')}`,C.redPale)}
  const top=[...report.summary.strengths,...report.summary.priorities].slice(0,6);top.forEach(f=>findingBlock(f));

  newPage();section('Résultats','Votre bilan, comme une prise de sang','Valeur · repère · position · signification.');
  report.findings.filter(f=>!['emg_activation','emg_cci','emg_fatigue'].includes(f.id)).forEach(f=>findingBlock(f));

  newPage();section('Muscle & marche','Votre signature instrumentée','Les mesures sans norme robuste restent descriptives.');
  const emg=report.findings.filter(f=>['emg_activation','emg_cci','emg_fatigue','lsi','gait_speed'].includes(f.id));emg.forEach(f=>findingBlock(f));
  const left=(d.myodev_metrics||[]).filter(r=>r.metric_code==='activation_pctMVC'&&r.qc_status==='valid'&&r.side==='left'),right=(d.myodev_metrics||[]).filter(r=>r.metric_code==='activation_pctMVC'&&r.qc_status==='valid'&&r.side==='right');
  const muscleRows=[...new Set([...left,...right].map(r=>r.muscle_code))].map(code=>{const l=left.find(r=>r.muscle_code===code),r=right.find(r=>r.muscle_code===code);return[MLABEL[code]||code,l?`${val(l.value,1)} ${l.unit||''}`:'—',r?`${val(r.value,1)} ${r.unit||''}`:'—']});
  if(muscleRows.length){section('Comparaison','Gauche / droite');table(['Groupe musculaire','Gauche','Droite'],muscleRows,[90,45,45])}

  newPage();section('Plan KŌMØ','Proposition de prise en charge','Généré par règles v1 · validation professionnelle obligatoire.');
  paragraph(report.carePlan.safetyGate,report.carePlan.status==='review_required'?C.redPale:C.greenPale);
  if(report.carePlan.priorities.length){report.carePlan.priorities.forEach((item,i)=>{ensure(31);setFill(C.soft);setDraw();doc.roundedRect(M,y,CW,28,3,3,'FD');doc.setFont('helvetica','bold');doc.setFontSize(7);setText(C.green2);doc.text(`PRIORITÉ ${i+1} · ${item.domain.toUpperCase()}`,M+5,y+6);doc.setFontSize(10);setText(C.ink);doc.text(item.goal,M+5,y+12);doc.setFont('helvetica','normal');doc.setFontSize(6.4);setText(C.ink);const actions=item.actions.map(a=>`• ${a}`).join('\n');doc.text(lines(actions,CW-10),M+5,y+17);doc.setFontSize(5.8);setText(C.muted);doc.text(`Contrôle proposé : ${item.recheck}`,R-5,y+24,{align:'right'});y+=32})}else paragraph('Aucune priorité thérapeutique automatique n’est déclenchée par les règles v1. Le professionnel conserve la décision clinique finale.',C.grayPale);
  paragraph('Ce plan est une proposition structurée issue des résultats disponibles. Il ne constitue pas une prescription médicale automatique et doit être adapté aux symptômes, antécédents, traitements, contre-indications et préférences du patient.',C.goldPale);

  newPage();section('Traçabilité','Sources & méthode','Les références utilisées sont explicites et versionnées.');
  const srcRows=report.sources.map(s=>[s.title,s.use,s.url]);table(['Source','Utilisation','Référence'],srcRows,[58,72,50]);
  section('Qualité','Points à vérifier');
  if(report.consistencyIssues.length)table(['Contrôle','Niveau','Message'],report.consistencyIssues.map(i=>[i.title,i.severity,i.message]),[48,25,107]);else paragraph('Aucune incohérence forte détectée par les règles de cohérence v1.',C.greenPale);

  newPage();section('Annexe professionnelle','Données MyoCare / Myodev détaillées','Traçabilité brute — non destinée à être interprétée seule par le patient.');
  const raw=(d.myodev_metrics||[]).map(r=>[r.task_code||'—',MLABEL[r.muscle_code]||r.muscle_code||'—',SIDE[r.side]||r.side||'—',METRIC[r.metric_code]||r.metric_code||'—',`${val(r.value,2)} ${r.unit||''}`,r.qc_status||'—']);
  table(['Tâche','Muscle','Côté','Mesure','Valeur','QC'],raw.length?raw:[['—','—','—','Aucune donnée','—','—']],[27,46,24,35,30,18]);
  paragraph(`Moteur d’interprétation : ${report.engineVersion} · Références : ${report.referenceVersion} · Score : ${s.algorithm_version||'—'}.`,C.grayPale);
  footer();return doc;
}

async function downloadPdf(button){const original=button.textContent;try{button.disabled=true;button.textContent='Génération du bilan interprété…';toast('Création du nouveau compte-rendu patient…');const[jsPDF,d]=await Promise.all([ensureEngine(),loadDossier()]);const doc=buildPdf(jsPDF,d),blob=doc.output('blob');if(!blob||blob.size<15000)throw new Error(`PDF anormalement petit (${Math.round((blob?.size||0)/1024)} Ko).`);const filename=`KOMO_Motion_Report_${safeFile(patientName(d.patient||{}))}_${new Date().toISOString().slice(0,10)}.pdf`;const url=globalThis.URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>globalThis.URL.revokeObjectURL(url),30000);toast(`PDF interprété exporté · ${Math.round(blob.size/1024)} Ko · ${doc.getNumberOfPages()} pages`)}catch(e){console.error('[dossier-pdf-export-v2]',e);toast(`Export PDF impossible : ${e?.message||'Erreur inconnue'}`)}finally{button.disabled=false;button.textContent=original}}

document.addEventListener('click',event=>{const button=event.target?.closest?.('#pdfBtn');if(!button)return;event.preventDefault();event.stopImmediatePropagation();downloadPdf(button)},true);
