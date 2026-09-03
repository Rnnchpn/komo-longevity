import { loadCanonicalResult } from './canonical-result-runtime.js';

const VERSION='3.0.0-sensor';
const ENGINE_URLS=['https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js'];
const C={ink:[31,46,37],muted:[108,119,111],line:[222,220,214],paper:[250,248,243],soft:[243,245,242],green:[37,57,47],green2:[86,115,95],greenPale:[234,241,235],gold:[169,128,67],goldPale:[255,247,231],red:[145,78,68],redPale:[250,236,233],white:[255,255,255]};
let enginePromise=null,busy=false;
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
const safe=v=>String(v||'patient').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,72)||'patient';
const fmtDate=v=>{if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'long',year:'numeric'}).format(d)};
const person=p=>`${p?.preferred_name||p?.first_name||''} ${p?.last_name||''}`.trim()||'Patient KŌMØ';
const tone=s=>s==='favorable'?C.green2:s==='watch'?C.gold:s==='priority'||s==='review'?C.red:C.muted;
const pale=s=>s==='favorable'?C.greenPale:s==='watch'?C.goldPale:s==='priority'||s==='review'?C.redPale:C.soft;
function toast(m){const t=document.querySelector('#toast');if(!t)return;t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,4500)}
function loadScript(src){return new Promise((resolve,reject)=>{if(window.jspdf?.jsPDF)return resolve();const s=document.createElement('script');s.src=src;s.async=true;s.crossOrigin='anonymous';s.onload=resolve;s.onerror=()=>reject(new Error('pdf_engine_load_failed'));document.head.appendChild(s)})}
async function ensurePdf(){if(window.jspdf?.jsPDF)return window.jspdf.jsPDF;if(enginePromise)return enginePromise;enginePromise=(async()=>{for(const u of ENGINE_URLS){try{await loadScript(u);if(window.jspdf?.jsPDF)return window.jspdf.jsPDF}catch{}}throw new Error('Moteur PDF indisponible')})();try{return await enginePromise}catch(e){enginePromise=null;throw e}}
function metricRows(d,code,muscle='',side=''){return(d?.myodev_metrics||[]).filter(x=>x.metric_code===code&&x.qc_status==='valid'&&(!muscle||x.muscle_code===muscle)&&(!side||x.side===side))}
function mean(rows){const v=rows.map(x=>n(x.value)).filter(x=>x!==null);return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}
function metric(d,code,muscle='',side=''){return mean(metricRows(d,code,muscle,side))}
function findings(result){return result?.interpretation?.findings||[]}
function finding(result,id){return findings(result).find(x=>x.id===id)||null}
function activationRows(result){const d=result.dossier||{},labels={VL:'Quadriceps',BF:'Ischio-jambiers',GM:'Gastrocnémiens'};return['VL','BF','GM'].map(code=>({code,label:labels[code],left:metric(d,'activation_pctMVC',code,'left'),right:metric(d,'activation_pctMVC',code,'right'),lsi:n(result.score?.muscle_signature?.symmetry?.per_muscle_score_0_100?.[code])??metric(d,'LSI_pct',code)}))}
function statusText(s){return s==='favorable'?'Favorable':s==='watch'?'À surveiller':s==='priority'?'Priorité':s==='review'?'À vérifier':'Mesuré'}
function build(jsPDF,result){
  const d=result.dossier||{},s=result.score||{},r=result.interpretation||{},p=d.patient||{},imports=d.myocare_imports||[],metrics=d.myodev_metrics||[],score=n(s.motion_score),sym=n(s.domain_scores?.neuromuscular_symmetry),confidence=n(s.confidence),completeness=n(s.completeness),assessed=s.released_at||s.calculated_at||d.motion?.completed_at||d.motion?.created_at||new Date().toISOString(),isDemo=p.data_classification==='synthetic';
  const sessions=[...new Set(metrics.map(x=>x.external_session_id).filter(Boolean))],priority=r.summary?.priorities?.[0]||null,strength=r.summary?.strengths?.[0]||null,activation=activationRows(result),sensorFindings=findings(result).filter(x=>!String(x.id||'').startsWith('activation_')).slice(0,10);
  const doc=new jsPDF({unit:'mm',format:'a4',orientation:'portrait',compress:true}),W=210,H=297,M=16,R=194,CW=178;let y=18;
  const text=(c=C.ink)=>doc.setTextColor(...c),fill=c=>doc.setFillColor(...c),draw=(c=C.line)=>doc.setDrawColor(...c),lines=(t,w=CW)=>doc.splitTextToSize(String(t??'—'),w);
  function header(){fill(C.green);doc.rect(0,0,W,11,'F');doc.setFont('helvetica','bold');doc.setFontSize(6.4);text(C.white);doc.text('KŌMØ PULSE  |  MOTION REPORT',M,7.2);doc.setFont('helvetica','normal');doc.text(isDemo?'DEMONSTRATION':fmtDate(assessed),R,7.2,{align:'right'})}
  function footer(){const pages=doc.getNumberOfPages();for(let i=1;i<=pages;i++){doc.setPage(i);draw();doc.line(M,H-13,R,H-13);doc.setFont('helvetica','normal');doc.setFontSize(5.2);text(C.muted);doc.text('KŌMØ Motion - mesure fonctionnelle instrumentée, non diagnostique.',M,H-8);doc.text(String(i).padStart(2,'0'),R,H-8,{align:'right'})}}
  function newPage(){doc.addPage();header();y=19}
  function ensure(h){if(y+h>H-20)newPage()}
  function section(kicker,title,note=''){ensure(20);doc.setFont('helvetica','bold');doc.setFontSize(5.8);text(C.green2);doc.text(kicker.toUpperCase(),M,y);doc.setFontSize(15);text(C.ink);doc.text(title,M,y+6);if(note){doc.setFont('helvetica','normal');doc.setFontSize(5.7);text(C.muted);doc.text(lines(note,72),R,y,{align:'right'})}y+=12;draw();doc.line(M,y,R,y);y+=5}
  function para(t,bg=null){doc.setFont('helvetica','normal');doc.setFontSize(7);const ls=lines(t,CW-(bg?10:0)),h=ls.length*3.7+(bg?8:0);ensure(h);if(bg){fill(bg);draw();doc.roundedRect(M,y,CW,h,3,3,'FD');doc.text(ls,M+5,y+5)}else doc.text(ls,M,y);y+=h+3}
  function stat(x,w,label,value,sub='',dark=false){fill(dark?C.green:C.soft);draw(dark?C.green:C.line);doc.roundedRect(x,y,w,32,4,4,'FD');doc.setFont('helvetica','bold');doc.setFontSize(5.5);text(dark?[198,211,202]:C.muted);doc.text(label.toUpperCase(),x+4,y+6);doc.setFontSize(dark?25:16);text(dark?C.white:C.ink);doc.text(String(value),x+4,y+20);doc.setFont('helvetica','normal');doc.setFontSize(5.2);text(dark?[210,219,213]:C.muted);doc.text(lines(sub,w-8),x+4,y+26)}
  function findingCard(f){ensure(28);fill(pale(f.status));draw();doc.roundedRect(M,y,CW,25,3.5,3.5,'FD');fill(tone(f.status));doc.roundedRect(M,y,3,25,2,2,'F');doc.setFont('helvetica','bold');doc.setFontSize(8);text(C.ink);doc.text(f.title||'Mesure',M+7,y+7);doc.setFontSize(11);text(tone(f.status));doc.text(f.displayValue||'—',R-5,y+8,{align:'right'});doc.setFont('helvetica','normal');doc.setFontSize(5.8);text(C.muted);doc.text(statusText(f.status),M+7,y+12);doc.text(lines(f.patientMessage||f.referenceLabel||'Mesure descriptive suivie dans le temps.',CW-14),M+7,y+17);y+=29}
  function table(headers,rows,widths){const lh=3.8,pad=2;const drawRow=(cells,head=false)=>{const ll=cells.map((c,i)=>lines(c,widths[i]-pad*2)),rh=Math.max(...ll.map(a=>a.length))*lh+pad*2;ensure(rh);let x=M;for(let i=0;i<cells.length;i++){fill(head?C.green:C.white);draw();doc.rect(x,y,widths[i],rh,'FD');doc.setFont('helvetica',head?'bold':'normal');doc.setFontSize(head?5.7:5.9);text(head?C.white:C.ink);doc.text(ll[i],x+pad,y+pad+2.8);x+=widths[i]}y+=rh};drawRow(headers,true);rows.forEach(r=>drawRow(r));y+=4}

  header();
  doc.setFont('helvetica','bold');doc.setFontSize(6);text(C.green2);doc.text('RAPPORT MOTION',M,y);doc.setFontSize(26);text(C.ink);doc.text('Votre mouvement,',M,y+11);doc.text('en un regard.',M,y+22);doc.setFont('helvetica','normal');doc.setFontSize(7);text(C.muted);doc.text(`${person(p)} · bilan du ${fmtDate(assessed)}`,M,y+30);y+=39;
  stat(M,72,'Motion Score',score===null?'—':Math.round(score),'Synthèse des mesures capteurs validées.',true);stat(M+76,49,'Symétrie',sym===null?'—':`${sym.toFixed(1)} %`,'Neuromusculaire');stat(M+129,49,'Confiance',confidence===null?'—':`${Math.round(confidence*100)} %`,'Qualité du calcul');y+=39;
  para('Le Motion Score est calculé uniquement à partir des données neuromusculaires Myodev validées. Le GLFS‑25 et les autres questionnaires décrivent le contexte du patient mais ne modifient pas le score.',C.greenPale);
  if(isDemo)para('Rapport de démonstration : dossier synthétique, sans valeur clinique individuelle.',C.goldPale);
  section('À retenir','Ce que montre ce bilan');
  if(priority)findingCard(priority);if(strength&&strength.id!==priority?.id)findingCard(strength);if(!priority&&!strength)para('Aucune priorité automatique ne ressort actuellement des mesures validées. Ce bilan constitue surtout une référence pour la prochaine mesure.');
  section('Traçabilité','Une mesure, une source, une trajectoire');
  table(['Source','Sessions','Mesures','Complétude'],[['Myodev / MyoLab',String(sessions.length||imports.length||'—'),String(metrics.length||'—'),completeness===null?'—':`${Math.round(completeness)} %`]], [52,35,40,51]);

  newPage();section('Neuromusculaire','Symétrie et activation','Les valeurs d’activation sont descriptives ; la symétrie constitue la base du score actuel.');
  table(['Groupe','Activation G','Activation D','Symétrie'],activation.map(x=>[x.label,x.left===null?'—':`${x.left.toFixed(1)} %MVC`,x.right===null?'—':`${x.right.toFixed(1)} %MVC`,x.lsi===null?'—':`${x.lsi.toFixed(1)} %`]),[55,41,41,41]);
  const symFind=finding(result,'neuromuscular_symmetry');if(symFind)findingCard(symFind);
  para('Les valeurs %MVC décrivent le recrutement musculaire pendant les acquisitions. Elles ne doivent pas être assimilées isolément à une mesure de force. Leur intérêt principal est la comparaison avec le même protocole lors d’un re-test.',C.soft);
  section('Autres signaux','Données capteurs disponibles');
  if(sensorFindings.length)sensorFindings.forEach(findingCard);else para('Aucune autre métrique capteur interprétable n’est disponible dans cet export. Pulse n’invente pas de vitesse, cadence ou paramètre de marche absent de la source.');

  newPage();section('Plan','Comprendre, agir, re-mesurer');
  const priorities=r.carePlan?.priorities||[];
  if(priorities.length){priorities.slice(0,3).forEach((p0,i)=>{ensure(31);fill(C.soft);draw();doc.roundedRect(M,y,CW,27,4,4,'FD');doc.setFont('helvetica','bold');doc.setFontSize(6);text(C.green2);doc.text(`PRIORITÉ ${i+1}`,M+5,y+6);doc.setFontSize(9);text(C.ink);doc.text(lines(p0.goal||p0.domain||'Priorité Motion',CW-10),M+5,y+12);doc.setFont('helvetica','normal');doc.setFontSize(5.8);text(C.muted);doc.text(lines((p0.actions||[]).slice(0,3).join(' · ')||'À préciser avec le professionnel.',CW-10),M+5,y+18);doc.text(`Re-test : ${p0.recheck||'selon le plan de suivi'}`,M+5,y+24);y+=32})}else para('Aucune priorité corrective automatique n’est déclenchée. Le professionnel peut utiliser ce bilan comme point zéro puis répéter le même protocole pour objectiver l’évolution.',C.greenPale);
  section('Trajectoire','La valeur du prochain bilan');
  para('Le résultat le plus utile n’est pas un chiffre isolé : c’est l’évolution mesurée dans les mêmes conditions. KŌMØ Pulse conserve le bilan afin de comparer les prochains re-tests, montrer ce qui progresse et ajuster les actions.');
  para('Questionnaires : contexte patient uniquement. Tests manuels historiques : hors Motion Score. Données capteurs : source instrumentée de la restitution Motion.',C.soft);
  section('Limites','À interpréter dans son contexte');
  para('KŌMØ Motion est une évaluation fonctionnelle instrumentée non diagnostique. Une valeur isolée ne remplace ni l’examen clinique ni une décision médicale lorsqu’ils sont indiqués. Les mesures doivent être interprétées selon la qualité d’acquisition, le protocole utilisé et le contexte individuel.');
  footer();return doc;
}

export async function exportCanonicalMotionReport({patientId=null,button=null}={}){
  if(busy)return;busy=true;const old=button?.textContent;if(button){button.disabled=true;button.textContent='Génération…'}
  try{toast('Préparation du rapport KŌMØ…');const [jsPDF,result]=await Promise.all([ensurePdf(),loadCanonicalResult({patientId,force:true})]);if(n(result?.score?.motion_score)===null)throw new Error('Motion Score indisponible pour ce bilan.');const doc=build(jsPDF,result),p=result.dossier?.patient||{},date=(result.score?.released_at||result.score?.calculated_at||new Date().toISOString()).slice(0,10),filename=`KOMO_Motion_${safe(person(p))}_${date}.pdf`;doc.save(filename);toast('Rapport Motion généré.');window.dispatchEvent(new CustomEvent('komo:motion-report-exported',{detail:{patientId:result.patientId,assessmentId:result.identity?.assessmentId,scoreId:result.identity?.scoreId,version:VERSION}}))}catch(e){console.error('[canonical-report-export]',e);toast(`Rapport indisponible : ${e.message||e}`);throw e}finally{busy=false;if(button){button.disabled=false;button.textContent=old||'Exporter le rapport'}}
}

document.addEventListener('click',e=>{const b=e.target.closest?.('[data-komo-export-report]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();exportCanonicalMotionReport({patientId:b.dataset.patientId||null,button:b}).catch(()=>{})},true);
window.KomoCanonicalReport={version:VERSION,export:exportCanonicalMotionReport};
