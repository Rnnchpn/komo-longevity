import { createMobilityReportPdf as createBaseReportPdf } from './mobility-report-pdf-v1.js?v=20260830-report-live-v3';

const VERSION='3.0.0';
const VISUAL_SYSTEM='komo-identity-editorial-2026';
const C={paper:[248,247,243],paper2:[244,242,236],white:[255,255,253],ink:[23,27,24],deep:[31,50,40],muted:[102,106,101],line:[210,207,198],sage:[91,111,98],sage2:[116,135,122],stone:[183,177,166],sand:[235,232,223],amber:[154,126,57],cream:[249,247,240]};
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function safe(v){return String(v||'patient').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,72)||'patient'}
function frDate(v){if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(d)}
function frDateTime(v){if(!v)return'';const d=new Date(v);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d)}
function compact(v,max=100){const s=String(v||'').trim();return s.length>max?s.slice(0,max-1).trim()+'…':s}
function status(score){const x=n(score);return x===null?{label:'DESCRIPTIF',color:C.stone}:x>=85?{label:'TRÈS BON',color:C.sage}:x>=75?{label:'BON',color:C.sage2}:x>=60?{label:'À DÉVELOPPER',color:C.amber}:{label:'À OPTIMISER',color:C.amber}}
function priorityTitle(item,fallback='À définir'){return compact(item?.title||fallback,42)}

function paintIdentityPage(doc,payload,{draft=false}={}){
  const W=210,H=297,M=11,R=199,CW=188;
  const setText=(c=C.ink)=>doc.setTextColor(...c),setFill=c=>doc.setFillColor(...c),setDraw=(c=C.line)=>doc.setDrawColor(...c);
  const sans=(size=8,style='normal',color=C.ink)=>{doc.setFont('helvetica',style);doc.setFontSize(size);setText(color)};
  const serif=(size=20,style='normal',color=C.ink)=>{doc.setFont('times',style);doc.setFontSize(size);setText(color)};
  const lines=(t,w)=>doc.splitTextToSize(String(t??'—'),w);
  const rule=(y,x1=M,x2=R,color=C.line,width=.22)=>{setDraw(color);doc.setLineWidth(width);doc.line(x1,y,x2,y)};
  const kicker=(text,x,y,color=C.muted)=>{sans(5.2,'bold',color);doc.text(String(text||'').toUpperCase(),x,y)};
  const body=(text,x,y,w,size=6.7,color=C.ink,leading=3.5)=>{sans(size,'normal',color);const l=lines(text,w);doc.text(l,x,y);return y+l.length*leading};
  const score=n(payload.summary?.score), fa=payload.summary?.functionalAge;
  const strengths=(payload.summary?.strengths||[]).slice(0,3);
  const priorities=(payload.priorities?.length?payload.priorities:payload.summary?.priorityFindings||[]).slice(0,3);
  const domains=(payload.domains||[]).slice(0,6);
  const nextAction=payload.priorities?.[0]?.firstAction||'Définir la prochaine action avec votre professionnel.';
  const nextReview=payload.trajectory?.nextReview||payload.priorities?.[0]?.recheck||'Selon le plan de suivi';

  doc.setPage(2);setFill(C.paper);doc.rect(0,0,W,H,'F');
  sans(8.5,'normal',C.ink);doc.text('02',M,12.5);rule(16.8,M,R,C.line,.25);
  sans(12,'bold',C.deep);doc.text('KŌMØ',32,12.5);sans(4.7,'normal',C.muted);doc.text('MOBILITY REPORT',53,12.5);sans(5.2,'bold',C.muted);doc.text(frDate(payload.report?.assessmentDate).toUpperCase(),R,12.5,{align:'right'});

  serif(35,'normal',C.deep);doc.text(['Votre identité','locomotrice'],M,40);
  sans(6.2,'bold',C.ink);doc.text('L’ESSENTIEL DE VOTRE BILAN EN UN REGARD.',M,70);
  body(payload.summary?.sentence||'Votre mobilité est résumée ici en quelques repères simples.',M,82,101,7.1,C.ink,4.2);

  setFill(C.deep);doc.rect(126,26,73,62,'F');
  kicker('KŌMØ SCORE',162.5,39,C.cream);serif(43,'normal',C.cream);doc.text(score===null?'—':String(Math.round(score)),162.5,62,{align:'center'});sans(8,'normal',C.cream);doc.text('/ 100',162.5,71,{align:'center'});rule(77,134,191,[91,111,98],.2);sans(5.5,'bold',C.cream);doc.text(lines(payload.summary?.interpretation||'Profil de mobilité',52),162.5,83,{align:'center'});

  setFill(C.white);setDraw(C.line);doc.rect(M,97,CW,34,'FD');
  kicker('Âge chronologique',25,109);serif(27,'normal',C.deep);doc.text(payload.patient?.age==null?'—':String(payload.patient.age),25,124);sans(8,'normal',C.ink);doc.text('ans',41,124);
  setDraw(C.line);doc.line(63,104,63,124);
  kicker('Estimation fonctionnelle',74,109);serif(27,'normal',C.deep);const fav=fa?.status==='available'&&n(fa.age)!==null?Math.round(fa.age):'—';doc.text(String(fav),74,124);sans(8,'normal',C.ink);if(fav!=='—')doc.text('ans',91,124);
  setDraw(C.sage2);doc.setLineWidth(.35);doc.circle(161,112,14,'S');doc.line(150,121,165,117);doc.line(165,117,176,103);doc.line(176,103,185,120);

  const top=144,colW=58,gap=7,xs=[M,M+colW+gap,M+2*(colW+gap)];
  const headings=[['01','VOS FORCES'],['02','À TRAVAILLER'],['03','PROCHAINE ÉTAPE']];
  headings.forEach((h,i)=>{kicker(h[0],xs[i],top,C.sage);sans(5.7,'bold',C.ink);doc.text(h[1],xs[i]+10,top);rule(top+4,xs[i],xs[i]+colW,C.line,.22)});

  for(let i=0;i<3;i++){
    const yy=top+14+i*17;
    setFill(C.sage2);doc.circle(xs[0]+3,yy-1,1,'F');
    serif(7.7,'normal',C.ink);doc.text(priorityTitle(strengths[i],['Stabilité','Capacité fonctionnelle','Mobilité'][i]),xs[0]+10,yy);
    body(compact(strengths[i]?.message||'Repère favorable à préserver.',70),xs[0]+10,yy+5,colW-12,5.3,C.muted,2.7);
    setFill(C.amber);doc.circle(xs[1]+3,yy-1,1,'F');
    serif(7.7,'normal',C.ink);doc.text(priorityTitle(priorities[i],['Réserve musculaire','Symétrie droite / gauche','Support biologique'][i]),xs[1]+10,yy);
    body(compact(priorities[i]?.why||priorities[i]?.message||'Axe à optimiser.',70),xs[1]+10,yy+5,colW-12,5.3,C.muted,2.7);
  }
  serif(16,'normal',C.deep);doc.text('01',xs[2],top+23);serif(7.7,'normal',C.ink);doc.text(lines(compact(nextAction,75),42),xs[2]+14,top+20);rule(top+34,xs[2],xs[2]+colW,C.line,.22);
  serif(16,'normal',C.deep);doc.text('02',xs[2],top+45);serif(7.7,'normal',C.ink);doc.text(lines(`Réévaluation\n${compact(nextReview,34)}`,42),xs[2]+14,top+42);

  const profY=211;rule(profY,M,R,C.line,.25);kicker('Votre profil locomoteur — 6 dimensions',M,profY+5,C.ink);
  const dW=CW/6;
  for(let i=0;i<6;i++){
    const d=domains[i]||{label:['Mobilité','Muscle','Équilibre','Posture','Fonction','Support biologique'][i],score:null};
    const x=M+i*dW, st=status(d.score), val=n(d.score);
    sans(4.6,'normal',C.muted);doc.text(compact(d.label,18).toUpperCase(),x+dW/2,profY+14,{align:'center'});
    serif(15,'normal',C.deep);doc.text(val===null?'—':String(Math.round(val)),x+dW/2,profY+26,{align:'center'});sans(4.4,'normal',C.muted);if(val!==null)doc.text('/100',x+dW/2,profY+31,{align:'center'});
    setFill(C.sand);doc.rect(x+4,profY+36,dW-8,1.4,'F');if(val!==null){setFill(st.color);doc.rect(x+4,profY+36,(dW-8)*Math.max(0,Math.min(100,val))/100,1.4,'F')}
    sans(4.2,'bold',st.color);doc.text(st.label,x+dW/2,profY+44,{align:'center'});
  }

  rule(266,M,R,C.line,.25);
  kicker('Patient',14,273);serif(7.8,'normal',C.ink);doc.text(compact(`${payload.patient?.displayName||'Patient'}${payload.patient?.age!=null?`, ${payload.patient.age} ans`:''}`,42),14,280);
  kicker('Praticien',80,273);serif(7.8,'normal',C.ink);doc.text(compact(payload.report?.practitionerName||'Professionnel KŌMØ',42),80,280);
  kicker('Date',142,273);serif(7.8,'normal',C.ink);doc.text(frDate(payload.report?.assessmentDate),142,280);
  sans(4.5,'normal',C.muted);const stamp=frDateTime(payload.generatedAt);if(stamp)doc.text(`Actualisé ${stamp}`,R,288,{align:'right'});
  if(draft||payload.report?.status!=='released'){sans(4.7,'bold',C.amber);doc.text('APERÇU ACTUALISÉ · À VALIDER',M,288)}else{sans(4.7,'bold',C.sage);doc.text(`VERSION ${payload.report?.version||'—'} · OFFICIEL`,M,288)}
}

function stampFreshness(doc,payload){
  const count=doc.getNumberOfPages?.()||10,stamp=frDateTime(payload.generatedAt);if(!stamp)return;
  for(let p=1;p<=count;p++){
    if(p===2)continue;doc.setPage(p);doc.setFont('helvetica','normal');doc.setFontSize(4.5);doc.setTextColor(...C.muted);doc.text(`Actualisé ${stamp}`,193,291,{align:'right'});
  }
}

export async function createMobilityReportPdf(payload,{draft=false}={}){
  const doc=await createBaseReportPdf(payload,{draft});
  paintIdentityPage(doc,payload,{draft});
  stampFreshness(doc,payload);
  doc.setProperties({title:`KŌMØ Mobility Report — ${payload.patient?.displayName||'Patient'}`,subject:'KŌMØ Mobility Report · identité locomotrice',author:'KŌMØ',creator:`KŌMØ Pulse · ${VERSION}`});
  return doc;
}
export async function mobilityReportBlob(payload,options={}){const doc=await createMobilityReportPdf(payload,options);const blob=doc.output('blob');if(!blob||blob.size<10000)throw new Error(`PDF anormalement petit (${Math.round((blob?.size||0)/1024)} Ko)`);return{doc,blob}}
export async function downloadMobilityReport(payload,{draft=false,blob=null}={}){let out=blob;if(!out)out=(await mobilityReportBlob(payload,{draft})).blob;const date=new Date(payload.generatedAt||payload.report?.assessmentDate||Date.now()).toISOString().slice(0,10);const version=payload.report?.version?`_v${payload.report.version}`:'';const filename=`KOMO_Mobility_Report_${safe(payload.patient?.displayName)}_${date}${version}${draft?'_ACTUALISE_APERCU':''}.pdf`;const url=URL.createObjectURL(out),a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);return{filename,blob:out}}
if(typeof window!=='undefined')window.KomoMobilityReportPdf={version:VERSION,visualSystem:VISUAL_SYSTEM,create:createMobilityReportPdf,blob:mobilityReportBlob,download:downloadMobilityReport};
