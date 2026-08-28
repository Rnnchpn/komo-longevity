import { loadCanonicalResult } from './canonical-result-runtime.js';
import { levelLabel } from './normative-engine-v1.js';

const VERSION='2.1.0';
const ENGINE_URLS=['https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js'];
const C={ink:[36,51,42],muted:[108,117,110],line:[224,220,212],soft:[246,243,236],green:[39,57,47],green2:[91,119,99],greenPale:[235,243,236],gold:[181,141,74],goldPale:[255,247,232],red:[137,72,61],redPale:[252,238,235],gray:[140,145,141],grayPale:[244,244,241],white:[255,255,255],sand:[242,237,226],cream:[250,248,243]};
let enginePromise=null,busy=false;
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function clamp(v,a,b){return Math.min(b,Math.max(a,v))}
function fmtDate(v){if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric'}).format(d).replace('.','')}
function safe(v){return String(v||'patient').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,72)||'patient'}
function name(p){return`${p?.preferred_name||p?.first_name||''} ${p?.last_name||''}`.trim()||p?.email||'Patient KŌMØ'}
function color(s){return s==='favorable'?C.green2:s==='watch'?C.gold:s==='priority'||s==='review'?C.red:C.gray}
function pale(s){return s==='favorable'?C.greenPale:s==='watch'?C.goldPale:s==='priority'||s==='review'?C.redPale:C.grayPale}
function refType(f){return f?.referenceType==='clinical_threshold'?'Seuil clinique':f?.referenceType==='normative_mean'?'Moyenne publiée':'Mesure descriptive'}
function expected(f){
  const r=f?.reference||{};
  if(f?.id==='glfs25')return'< 7 points';
  if(f?.id==='two_step')return'≥ 1,30';
  if(f?.id==='chair_stand'&&n(r.cutoff)!==null)return`≥ ${Math.round(r.cutoff)} répétitions`;
  if(f?.id==='gait_speed'&&n(r.mean)!==null)return`≈ ${Number(r.mean).toFixed(2).replace('.',',')} m/s*`;
  if(f?.id==='lsi')return'≥ 90 %*';
  if(f?.id==='sva'&&Array.isArray(r.bands))return'Zone SRS-Schwab contextualisée';
  if(f?.referenceType==='clinical_threshold')return f.referenceLabel||'Seuil clinique contextualisé';
  if(f?.referenceType==='normative_mean')return f.referenceLabel||'Moyenne publiée contextualisée';
  return'Pas de norme robuste - suivi relatif';
}
function shortStatus(f){return f?.status==='favorable'?'Dans le repère':f?.status==='watch'?'À surveiller':f?.status==='priority'?'Prioritaire':f?.status==='review'?'À vérifier':'Descriptif'}
function loadScript(src){return new Promise((resolve,reject)=>{if(window.jspdf?.jsPDF)return resolve();const s=document.createElement('script');s.src=src;s.async=true;s.crossOrigin='anonymous';s.onload=resolve;s.onerror=()=>reject(new Error('script_load_failed'));document.head.appendChild(s)})}
async function ensurePdf(){if(window.jspdf?.jsPDF)return window.jspdf.jsPDF;if(enginePromise)return enginePromise;enginePromise=(async()=>{let last;for(const u of ENGINE_URLS){try{await loadScript(u);if(window.jspdf?.jsPDF)return window.jspdf.jsPDF}catch(e){last=e}}throw last||new Error('Moteur PDF indisponible')})();try{return await enginePromise}catch(e){enginePromise=null;throw e}}
function toast(m){const t=document.querySelector('#toast');if(!t)return;t.textContent=m;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,5000)}

function scaleSpec(f){
  const x=n(f?.rawValue),r=f?.reference||{};
  if(x===null)return null;
  if(f.id==='glfs25')return{min:0,max:40,value:x,zones:[{a:0,b:7,c:C.greenPale},{a:7,b:16,c:C.goldPale},{a:16,b:24,c:C.redPale},{a:24,b:40,c:[239,220,216]}],ticks:[0,7,16,24,40],labels:['0','7','16','24','40+']};
  if(f.id==='two_step')return{min:.5,max:2,value:x,zones:[{a:.5,b:.9,c:[239,220,216]},{a:.9,b:1.1,c:C.redPale},{a:1.1,b:1.3,c:C.goldPale},{a:1.3,b:2,c:C.greenPale}],ticks:[.5,.9,1.1,1.3,2],labels:['0,5','0,9','1,1','1,3','2,0']};
  if(f.id==='chair_stand'&&n(r.cutoff)!==null){const cut=n(r.cutoff),max=Math.max(30,cut*2.2,x*1.15);return{min:0,max,value:x,zones:[{a:0,b:cut,c:C.goldPale},{a:cut,b:max,c:C.greenPale}],ticks:[0,cut,max],labels:['0',String(Math.round(cut)),String(Math.round(max))]}}
  if(f.id==='gait_speed'&&n(r.mean)!==null){const mean=n(r.mean),min=Math.max(0,Math.min(x,mean)-.45),max=Math.max(x,mean)+.45;return{min,max,value:x,zones:[{a:min,b:max,c:C.grayPale}],ticks:[min,mean,max],labels:[min.toFixed(1).replace('.',','),`moy. ${mean.toFixed(2).replace('.',',')}`,max.toFixed(1).replace('.',',')],reference:mean}}
  if(f.id==='lsi'){return{min:0,max:100,value:x,zones:[{a:0,b:90,c:C.goldPale},{a:90,b:100,c:C.greenPale}],ticks:[0,50,90,100],labels:['0','50','90','100'],reference:90}}
  return null;
}

function build(jsPDF,result){
  const {dossier:d,score:s={},interpretation:r}=result,p=d.patient||{};
  const doc=new jsPDF({unit:'mm',format:'a4',orientation:'portrait',compress:true});
  const W=210,H=297,M=15,R=195,CW=180;let y=18;
  const setText=(c=C.ink)=>doc.setTextColor(...c),setFill=c=>doc.setFillColor(...c),setDraw=(c=C.line)=>doc.setDrawColor(...c),lines=(t,w=CW)=>doc.splitTextToSize(String(t??'—'),w);
  function header(){setFill(C.green);doc.rect(0,0,W,11,'F');doc.setFont('helvetica','bold');doc.setFontSize(7);setText(C.white);doc.text('KŌMØ PULSE  |  MOTION REPORT',M,7.2);doc.setFont('helvetica','normal');doc.text(p.external_reference||'',R,7.2,{align:'right'})}
  function newPage(){doc.addPage();header();y=19}
  function ensure(h){if(y+h>H-18)newPage()}
  function section(kicker,title,note=''){ensure(18);doc.setFont('helvetica','bold');doc.setFontSize(6.2);setText(C.green2);doc.text(String(kicker).toUpperCase(),M,y);doc.setFontSize(15);setText(C.ink);doc.text(title,M,y+6);if(note){doc.setFont('helvetica','normal');doc.setFontSize(6.2);setText(C.muted);doc.text(lines(note,76),R,y,{align:'right'})}y+=12;setDraw();doc.line(M,y,R,y);y+=5}
  function paragraph(text,bg=null){doc.setFont('helvetica','normal');doc.setFontSize(7.1);const l=lines(text,CW-(bg?10:0)),h=l.length*3.7+(bg?8:0);ensure(h);if(bg){setFill(bg);setDraw();doc.roundedRect(M,y,CW,h,3,3,'FD');doc.text(l,M+5,y+5)}else doc.text(l,M,y);y+=h+3}
  function scoreCard(x,yy,w,label,value,sub,dark=false){setFill(dark?C.green:C.soft);setDraw(dark?C.green:C.line);doc.roundedRect(x,yy,w,31,4,4,'FD');doc.setFont('helvetica','bold');doc.setFontSize(6);setText(dark?[195,209,200]:C.muted);doc.text(label.toUpperCase(),x+4,yy+6);doc.setFontSize(dark?27:16);setText(dark?C.white:C.ink);doc.text(String(value),x+4,yy+20);doc.setFont('helvetica','normal');doc.setFontSize(5.3);setText(dark?[210,219,212]:C.muted);doc.text(lines(sub,w-8),x+4,yy+26)}
  function table(headers,rows,widths,{font=5.7,headerFill=C.green,rowFills=[]}={}){const lh=4.05,pad=2.3;const draw=(cells,head=false,rowIndex=-1)=>{const ls=cells.map((c,i)=>lines(c,widths[i]-pad*2)),rh=Math.max(...ls.map(a=>a.length))*lh+pad*2;ensure(rh);let x=M;for(let i=0;i<cells.length;i++){setFill(head?headerFill:(rowFills[rowIndex]||C.white));setDraw();doc.rect(x,y,widths[i],rh,'FD');doc.setFont('helvetica',head?'bold':'normal');doc.setFontSize(head?6:font);setText(head?C.white:C.ink);doc.text(ls[i],x+pad,y+pad+3);x+=widths[i]}y+=rh};draw(headers,true);rows.forEach((rr,i)=>draw(rr,false,i));y+=4}
  function drawScale(f,x0,yy,w){
    const sp=scaleSpec(f);if(!sp)return false;
    const h=5;for(const z of sp.zones){const a=x0+(clamp(z.a,sp.min,sp.max)-sp.min)/(sp.max-sp.min)*w;const b=x0+(clamp(z.b,sp.min,sp.max)-sp.min)/(sp.max-sp.min)*w;setFill(z.c);doc.rect(a,yy,Math.max(.6,b-a),h,'F')}
    setDraw(C.line);doc.rect(x0,yy,w,h);
    (sp.ticks||[]).forEach((t,i)=>{const tx=x0+(clamp(t,sp.min,sp.max)-sp.min)/(sp.max-sp.min)*w;setDraw(C.muted);doc.line(tx,yy+h,tx,yy+h+2);doc.setFont('helvetica','normal');doc.setFontSize(4.5);setText(C.muted);const lab=(sp.labels||[])[i]??String(t);doc.text(lab,tx,yy+h+5,{align:i===0?'left':i===sp.ticks.length-1?'right':'center'})});
    if(n(sp.reference)!==null){const rx=x0+(clamp(sp.reference,sp.min,sp.max)-sp.min)/(sp.max-sp.min)*w;setDraw(C.green2);doc.setLineWidth(.6);doc.line(rx,yy-1,rx,yy+h+1);doc.setLineWidth(.2)}
    const vx=x0+(clamp(sp.value,sp.min,sp.max)-sp.min)/(sp.max-sp.min)*w;setFill(color(f.status));doc.circle(vx,yy+h/2,2.1,'F');setFill(C.white);doc.circle(vx,yy+h/2,.7,'F');
    return true;
  }
  function referenceCard(f){
    const hasScale=!!scaleSpec(f),h=hasScale?56:44;ensure(h);setFill(C.white);setDraw(C.line);doc.roundedRect(M,y,CW,h,4,4,'FD');
    setFill(pale(f.status));doc.roundedRect(M,y,3,h,2,2,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(9);setText(C.ink);doc.text(f.title,M+7,y+7);
    doc.setFontSize(5.6);setText(C.muted);doc.text(refType(f).toUpperCase(),M+7,y+12);
    doc.setFontSize(6);doc.setFont('helvetica','bold');setText(C.muted);doc.text('VOTRE VALEUR',M+7,y+19);doc.text('REPÈRE ATTENDU',M+61,y+19);doc.text('POSITION',M+125,y+19);
    doc.setFontSize(13);setText(color(f.status));doc.text(String(f.displayValue||'—'),M+7,y+28);
    doc.setFontSize(8.2);setText(C.ink);doc.text(lines(expected(f),56),M+61,y+27);
    doc.setFontSize(7.3);setText(color(f.status));doc.text(shortStatus(f),M+125,y+27);
    let textY=y+35;
    if(hasScale){drawScale(f,M+7,y+34,CW-14);textY=y+48}
    doc.setFont('helvetica','normal');doc.setFontSize(6.1);setText(C.muted);doc.text(lines(f.patientMessage||f.referenceLabel||'',CW-14),M+7,textY);
    y+=h+4;
  }
  function insightBox(title,items,bg){if(!items.length)return;const content=items.slice(0,3);const h=12+content.length*11;ensure(h);setFill(bg);setDraw(C.line);doc.roundedRect(M,y,CW,h,4,4,'FD');doc.setFont('helvetica','bold');doc.setFontSize(8);setText(C.ink);doc.text(title,M+6,y+7);doc.setFont('helvetica','normal');doc.setFontSize(6.4);content.forEach((f,i)=>{setFill(color(f.status));doc.circle(M+8,y+14+i*10,1.3,'F');setText(C.ink);doc.text(`${f.title} · ${f.displayValue||'—'}`,M+12,y+15+i*10);setText(C.muted);doc.text(lines(f.patientMessage||shortStatus(f),122),M+58,y+15+i*10)});y+=h+4}
  function footer(){const count=doc.getNumberOfPages();for(let i=1;i<=count;i++){doc.setPage(i);setDraw();doc.line(M,H-11,R,H-11);doc.setFont('helvetica','normal');doc.setFontSize(5.5);setText(C.muted);doc.text(`KŌMØ Pulse · PDF v${VERSION} · ${r.engineVersion} · ${r.referenceVersion}`,M,H-6.3);doc.text(`Page ${i}/${count}`,R,H-6.3,{align:'right'});if(p.data_classification==='synthetic'){doc.setFont('helvetica','bold');setText(C.gold);doc.text('DONNÉES SYNTHÉTIQUES - DÉMONSTRATION',W/2,H-6.3,{align:'center'})}else if(s.release_status!=='released'){doc.setFont('helvetica','bold');setText(C.red);doc.text('BROUILLON - À VALIDER PAR LE PROFESSIONNEL',W/2,H-6.3,{align:'center'})}}}

  header();doc.setFont('helvetica','bold');doc.setFontSize(6.5);setText(C.green2);doc.text('BILAN DE MOBILITÉ · ANALYSE FONCTIONNELLE · MYOCARE',M,22);doc.setFontSize(22);setText(C.ink);doc.text(name(p),M,31);doc.setFont('helvetica','normal');doc.setFontSize(7);setText(C.muted);doc.text(`${p.external_reference||'—'} · ${r.context.age??'—'} ans · ${p.organization_name||''}`,M,37);
  const motion=n(s.motion_score),mob=n(s.domain_scores?.mobility),sym=n(s.domain_scores?.myocare_symmetry),complete=n(s.completeness),conf=n(s.confidence);
  scoreCard(M,45,44,'Motion Score',motion===null?'—':`${Math.round(motion)}/100`,`${s.release_status||'brouillon'} · confiance ${conf===null?'—':Math.round(conf*100)+'%'}`,true);scoreCard(63,45,42,'Mobilité KŌMØ',mob===null?'—':`${Math.round(mob)}/100`,'Composante fonctionnelle');scoreCard(109,45,42,'Symétrie MyoCare',sym===null?'—':`${Math.round(sym)}/100`,'Benchmark LSI contextualisé');scoreCard(155,45,40,'Complétude',complete===null?'—':`${Math.round(complete)}%`,'Qualité des données');y=84;

  section('Synthèse','Votre profil en un coup d’œil','Les repères sont appliqués uniquement lorsqu’ils correspondent au protocole mesuré.');
  if(r.consistencyIssues.length)paragraph(`REVUE NÉCESSAIRE · ${r.consistencyIssues.map(i=>i.message).join(' ')}`,C.redPale);
  insightBox('Points forts',r.summary?.strengths||[],C.greenPale);insightBox('Priorités à discuter',r.summary?.priorities||[],C.goldPale);
  const coreIds=['glfs25','two_step','stand_up','chair_stand','gait_speed','sva','lsi'];const core=r.findings.filter(f=>coreIds.includes(f.id));
  if(core.length){section('Repères','Vos principales mesures','Lecture type bilan biologique : valeur, repère et position.');table(['Test','Votre valeur','Repère attendu','Position'],core.map(f=>[f.title,f.displayValue||'—',expected(f),shortStatus(f)]),[48,35,61,36],{font:5.5,rowFills:core.map(f=>pale(f.status))})}
  paragraph('* Une moyenne publiée ou un benchmark n’est pas un intervalle individuel de normalité. Les mesures sans norme robuste sont présentées comme descriptives et servent au suivi longitudinal.',C.sand);

  newPage();section('Détail clinique','Où se situe chaque résultat ?','Le point représente votre mesure. Les zones colorées n’apparaissent que lorsqu’un repère publiable est disponible.');
  r.findings.filter(f=>!['emg_activation','emg_cci','emg_fatigue'].includes(f.id)).forEach(referenceCard);

  newPage();section('MyoCare & marche','Signature musculaire instrumentée','Comparaison droite/gauche et benchmarks réellement applicables.');
  r.findings.filter(f=>['emg_activation','emg_cci','emg_fatigue','lsi','gait_speed'].includes(f.id)).forEach(referenceCard);
  const acts=(d.myodev_metrics||[]).filter(x=>x.metric_code==='activation_pctMVC'&&x.qc_status==='valid');const codes=[...new Set(acts.map(x=>x.muscle_code))];
  if(codes.length){const labels={VL:'Quadriceps - vaste latéral',BF:'Ischio-jambiers - biceps fémoral',GM:'Mollet - gastrocnémien'};section('Activation','Comparaison gauche / droite','%MVC : mesure instrumentée descriptive, sans valeur normale populationnelle universelle.');table(['Groupe musculaire','Gauche','Droite','Repère'],codes.map(c=>{const l=acts.find(x=>x.muscle_code===c&&x.side==='left'),rr=acts.find(x=>x.muscle_code===c&&x.side==='right');return[labels[c]||c,l?`${Number(l.value).toFixed(1)} ${l.unit||''}`:'—',rr?`${Number(rr.value).toFixed(1)} ${rr.unit||''}`:'—','Suivi relatif / symétrie']}),[73,31,31,45])}

  newPage();section('Plan KŌMØ','Proposition de prise en charge','Issue des mêmes règles que Pulse - validation professionnelle obligatoire.');paragraph(r.carePlan.safetyGate,r.carePlan.status==='review_required'?C.redPale:C.greenPale);if(r.carePlan.priorities.length){r.carePlan.priorities.forEach((item,i)=>{ensure(34);setFill(C.soft);setDraw();doc.roundedRect(M,y,CW,30,3,3,'FD');doc.setFont('helvetica','bold');doc.setFontSize(6.3);setText(C.green2);doc.text(`PRIORITÉ ${i+1} · ${item.domain.toUpperCase()}`,M+5,y+6);doc.setFontSize(9);setText(C.ink);doc.text(lines(item.goal,CW-10),M+5,y+12);doc.setFont('helvetica','normal');doc.setFontSize(6);setText(C.muted);doc.text(lines(item.actions.map(a=>`• ${a}`).join('   '),CW-10),M+5,y+18);doc.text(`Contrôle proposé : ${item.recheck}`,M+5,y+27);y+=34})}else paragraph('Aucune priorité automatique n’est déclenchée par les règles actuelles. Le suivi reste à individualiser.',C.grayPale);
  paragraph('Âge locomoteur KŌMØ : cette estimation ne sera affichée que lorsque les tests nécessaires seront réalisés selon des protocoles standardisés et suffisamment concordants. Elle sera présentée comme un âge fonctionnel estimé avec intervalle de confiance, jamais comme un âge biologique certain.',C.cream);

  newPage();section('Références','Sources des repères','Chaque repère reste versionné dans le moteur KŌMØ.');table(['Source','Usage'],r.sources.map(x=>[x.title,x.use]),[82,98]);section('Traçabilité','Version et statut');table(['Élément','Valeur'],[['Motion Score',motion===null?'—':`${motion}/100`],['Algorithme',s.algorithm_version||'—'],['Moteur interprétation',r.engineVersion],['Références',r.referenceVersion],['PDF',`canonical-report-v${VERSION}`],['Statut',s.release_status||'—'],['Calculé le',fmtDate(s.calculated_at)]],[58,122]);paragraph('Ce document présente des seuils cliniques, moyennes publiées et mesures descriptives selon leur niveau de preuve et leur applicabilité. Une moyenne populationnelle ne doit pas être interprétée comme une plage individuelle de normalité. La prise en charge proposée doit être validée par un professionnel.',C.goldPale);
  footer();return doc;
}

export async function exportCanonicalMotionReport({patientId=null,button=null}={}){
  if(busy)return;busy=true;const old=button?.textContent;if(button){button.disabled=true;button.textContent='Génération du PDF…'}
  try{toast('Génération du compte-rendu KŌMØ…');const[jsPDF,result]=await Promise.all([ensurePdf(),loadCanonicalResult({patientId,force:true})]);const doc=build(jsPDF,result);const blob=doc.output('blob');if(!blob||blob.size<12000)throw new Error(`PDF anormalement petit (${Math.round((blob?.size||0)/1024)} Ko)`);const filename=`KOMO_Motion_Report_${safe(name(result.dossier.patient))}_${new Date().toISOString().slice(0,10)}.pdf`;const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);toast(`PDF v${VERSION} exporté · ${Math.round(blob.size/1024)} Ko · ${doc.getNumberOfPages()} pages`);return{filename,size:blob.size,pages:doc.getNumberOfPages(),identity:result.identity,version:VERSION}}
  catch(e){console.error('[canonical-report-export-v2]',e);toast(`Export impossible : ${e?.message||e}`);throw e}
  finally{busy=false;if(button){button.disabled=false;button.textContent=old}}
}

document.addEventListener('click',e=>{const b=e.target.closest?.('[data-komo-export-report]');if(!b)return;e.preventDefault();e.stopImmediatePropagation();exportCanonicalMotionReport({patientId:b.dataset.patientId||null,button:b}).catch(()=>{})},true);
window.KomoCanonicalReport={version:VERSION,export:exportCanonicalMotionReport};
