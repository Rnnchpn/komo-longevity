import { createMobilityReportPdf } from './mobility-report-pdf-v1.js';

const VERSION='1.0.0';
const C={paper:[250,249,245],ink:[24,31,27],muted:[102,108,103],line:[218,217,210],sage:[83,111,96],sageSoft:[236,240,235],sagePale:[244,246,242],white:[255,255,255],sand:[242,239,232]};
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:null};
const safe=v=>String(v||'patient').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,72)||'patient';
const signed=(v,d=0,suffix='')=>{const x=n(v);if(x===null)return'—';const s=x>0?'+':'';return`${s}${x.toLocaleString('fr-FR',{maximumFractionDigits:d,minimumFractionDigits:d})}${suffix}`};
const value=(v,d=0)=>{const x=n(v);return x===null?'—':x.toLocaleString('fr-FR',{maximumFractionDigits:d,minimumFractionDigits:d})};
function shortDate(v){if(!v)return'—';const d=new Date(`${String(v).slice(0,10)}T12:00:00`);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short'}).format(d).replace('.','')}
function sleep(v){const m=n(v);if(m===null)return'—';const h=Math.floor(m/60),r=Math.round(m%60);return`${h} h ${String(r).padStart(2,'0')}`}
function changeCopy(key,k){if(!k?.comparison_reliable)return'Semaine de comparaison en construction';const c=k.changes||{};if(key==='steps')return`${signed(c.steps_pct,1,' %')} vs 7 j préc.`;if(key==='distance')return`${signed(c.distance_pct,1,' %')} vs 7 j préc.`;if(key==='active')return`${signed(c.active_minutes_pct,1,' %')} vs 7 j préc.`;if(key==='sleep')return`${signed(c.sleep_minutes_delta,0,' min')} vs 7 j préc.`;if(key==='rhr')return`${signed(c.resting_hr_delta_bpm,1,' bpm')} vs 7 j préc.`;if(key==='hrv')return`${signed(c.hrv_pct,1,' %')} vs 7 j préc.`;if(key==='spo2')return`${signed(c.spo2_delta_points,1,' pt')} vs 7 j préc.`;return'—'}
function summaries(k){
  if(!k?.comparison_reliable)return['La comparaison semaine contre semaine nécessite au moins 4 jours observés dans chacune des deux fenêtres.','Les moyennes affichées utilisent uniquement les jours réellement observés.','La tendance se consolide automatiquement à mesure que la couverture KEY augmente.'];
  const c=k.changes||{},out=[];
  if(n(c.steps_pct)!==null)out.push(`Pas quotidiens : ${signed(c.steps_pct,1,' %')} par rapport à la semaine précédente.`);
  if(n(c.active_minutes_pct)!==null)out.push(`Temps actif : ${signed(c.active_minutes_pct,1,' %')} par rapport à la semaine précédente.`);
  if(n(c.sleep_minutes_delta)!==null)out.push(`Sommeil : ${signed(c.sleep_minutes_delta,0,' min/nuit')} par rapport à la semaine précédente.`);
  if(n(c.resting_hr_delta_bpm)!==null)out.push(`Fréquence cardiaque de repos : ${signed(c.resting_hr_delta_bpm,1,' bpm')} sur la même comparaison.`);
  if(n(c.hrv_pct)!==null)out.push(`HRV : ${signed(c.hrv_pct,1,' %')} sur la même comparaison.`);
  return(out.length?out:['Aucune variation comparable n’est disponible sur les indicateurs actuels.']).slice(0,3);
}
function addKeyPage(doc,payload,{draft=false}={}){
  const k=payload?.key;if(!k?.available)return doc;
  doc.addPage();const pageNo=doc.getNumberOfPages(),W=210,H=297,M=14,R=196,CW=182;
  const setText=(c=C.ink)=>doc.setTextColor(...c),setFill=c=>doc.setFillColor(...c),setDraw=(c=C.line)=>doc.setDrawColor(...c);
  const sans=(size=7,style='normal',color=C.ink)=>{doc.setFont('helvetica',style);doc.setFontSize(size);setText(color)};
  const serif=(size=18,style='normal',color=C.ink)=>{doc.setFont('times',style);doc.setFontSize(size);setText(color)};
  const lines=(t,w)=>doc.splitTextToSize(String(t??'—'),w);
  const body=(t,x,y,w,size=7,color=C.muted,leading=3.7)=>{sans(size,'normal',color);const l=lines(t,w);doc.text(l,x,y);return y+l.length*leading};
  const rounded=(x,y,w,h,fill=C.white,stroke=C.line,r=4)=>{setFill(fill);setDraw(stroke);doc.roundedRect(x,y,w,h,r,r,'FD')};
  const rule=y=>{setDraw(C.line);doc.setLineWidth(.25);doc.line(M,y,R,y)};
  setFill(C.paper);doc.rect(0,0,W,H,'F');
  sans(12,'bold',C.ink);doc.text('KŌMØ',M,14);serif(8,'normal',C.sage);doc.text('Mobility Report',M,20);sans(6.2,'bold',C.sage);doc.text('KŌMØ KEY · CONTINUITÉ',R,18,{align:'right'});rule(24);
  rule(H-14);serif(7,'italic',C.sage);doc.text('Mesurer aujourd’hui. Préserver demain.',M,H-8);sans(7,'normal',C.sage);doc.text(String(pageNo),R,H-8,{align:'right'});if(draft||payload.report?.status!=='released'){sans(5.4,'bold',[173,130,51]);doc.text('APERÇU · NON REMIS AU PATIENT',W/2,H-8,{align:'center'})}

  sans(6.2,'bold',C.sage);doc.text('KŌMØ KEY',M,36);serif(25,'normal',C.ink);doc.text(['Votre quotidien,','remis en perspective.'],M,48);body('KEY décrit la continuité entre deux bilans : activité, sommeil et signaux physiologiques disponibles. Il complète Motion et Clinical sans recalculer leurs scores.',M,69,CW,8.2,C.muted,4.2);

  const c=k.current7||{},m=k.current30||{},p=k.period||{};
  rounded(M,84,CW,23,C.sagePale,C.line,4);sans(6,'bold',C.sage);doc.text('SEMAINE ANALYSÉE',M+8,93);serif(11,'normal',C.ink);doc.text(`${shortDate(p.current_start)} — ${shortDate(p.current_end)}`,M+8,101);sans(6,'bold',C.sage);doc.text('COUVERTURE',M+75,93);serif(11,'normal',C.ink);doc.text(`${value(c.days_observed)}/7 jours · ${value(c.coverage_pct)} %`,M+75,101);sans(6,'bold',C.sage);doc.text('REPÈRE 30 J',M+132,93);serif(9.5,'normal',C.ink);doc.text(n(m.days_observed)!==null&&m.days_observed>0?`${value(m.days_observed)} j observés`:'En construction',M+132,101);

  const hrv=n(c.hrv_ms_avg)!==null;const metrics=[
    ['PAS / JOUR',value(c.steps_avg,0),'pas',changeCopy('steps',k)],
    ['DISTANCE / JOUR',n(c.distance_m_avg)===null?'—':value(c.distance_m_avg/1000,1),'km',changeCopy('distance',k)],
    ['TEMPS ACTIF',value(c.active_minutes_avg,0),'min/j',changeCopy('active',k)],
    ['SOMMEIL / NUIT',sleep(c.sleep_minutes_avg),'',changeCopy('sleep',k)],
    ['FC DE REPOS',value(c.resting_hr_avg,1),'bpm',changeCopy('rhr',k)],
    hrv?['HRV',value(c.hrv_ms_avg,1),'ms',changeCopy('hrv',k)]:['SpO₂',value(c.spo2_avg,1),'%',changeCopy('spo2',k)]
  ];
  const mw=57.3,mg=5,mh=34,sy=114;metrics.forEach((it,i)=>{const row=Math.floor(i/3),col=i%3,x=M+col*(mw+mg),y=sy+row*(mh+6);rounded(x,y,mw,mh,C.white,C.line,4);sans(5.6,'bold',C.sage);doc.text(it[0],x+7,y+8);serif(17,'normal',C.ink);doc.text(it[1],x+7,y+19);if(it[2]){sans(6.2,'normal',C.muted);doc.text(it[2],x+7+doc.getTextWidth(it[1])+3,y+19)}sans(5.5,'normal',C.muted);doc.text(lines(it[3],mw-14),x+7,y+27)});

  const chartY=195,chartH=31;rounded(M,chartY,CW,chartH,C.white,C.line,4);sans(5.8,'bold',C.sage);doc.text('PAS · 14 DERNIERS JOURS OBSERVABLES',M+8,chartY+8);const rows=Array.isArray(k.daily14)?k.daily14.slice(-14):[],vals=rows.map(x=>n(x.steps)||0),max=Math.max(...vals,1),x0=M+8,yBase=chartY+25,chartW=CW-16,gap=1.7,bw=(chartW-gap*13)/14;for(let i=0;i<14;i++){const r=rows[i],v=n(r?.steps),hh=v===null?1.2:Math.max(1.8,(v/max)*13),x=x0+i*(bw+gap);setFill(i>=7?C.sage:C.sageSoft);doc.roundedRect(x,yBase-hh,bw,hh,Math.min(1.2,bw/2),Math.min(1.2,bw/2),'F')}sans(5.2,'normal',C.muted);doc.text(rows[0]?.date?shortDate(rows[0].date):'J-13',x0,chartY+29);doc.text(rows.at(-1)?.date?shortDate(rows.at(-1).date):'Aujourd’hui',M+CW-8,chartY+29,{align:'right'});

  const sum=summaries(k),boxY=233;rounded(M,boxY,CW,30,C.sagePale,C.line,4);sans(6,'bold',C.sage);doc.text(k.comparison_reliable?'ÉVOLUTION VS SEMAINE PRÉCÉDENTE':'COMPARAISON EN CONSTRUCTION',M+8,boxY+8);sum.forEach((s,i)=>{setFill(C.sage);doc.circle(M+9,boxY+14+i*5.2,.75,'F');sans(6.1,'normal',C.ink);doc.text(lines(s,CW-22),M+13,boxY+16+i*5.2)});

  const source=(k.sources||[]).join(' · ')||'source wearable normalisée';const quality=(k.source_quality||[]).join(' · ')||'qualité source déclarée';sans(5.4,'normal',C.muted);doc.text(lines(`Repère 30 j : ${n(m.steps_avg)===null?'—':value(m.steps_avg)} pas/j · ${n(m.active_minutes_avg)===null?'—':value(m.active_minutes_avg)} min actives/j · ${n(m.sleep_minutes_avg)===null?'—':sleep(m.sleep_minutes_avg)} de sommeil. Source : ${source} · ${quality}.`,CW),M,270);sans(5.4,'bold',C.sage);doc.text('Lecture descriptive longitudinale · moyennes calculées sur les jours observés · aucune extrapolation des jours manquants.',M,278);
  return doc;
}
export async function createMobilityReportPdfWithKey(payload,options={}){const doc=await createMobilityReportPdf(payload,options);return addKeyPage(doc,payload,options)}
export async function mobilityReportBlob(payload,options={}){const doc=await createMobilityReportPdfWithKey(payload,options);const blob=doc.output('blob');if(!blob||blob.size<10000)throw new Error(`PDF anormalement petit (${Math.round((blob?.size||0)/1024)} Ko)`);return{doc,blob}}
export async function downloadMobilityReport(payload,{draft=false,blob=null}={}){let out=blob;if(!out)out=(await mobilityReportBlob(payload,{draft})).blob;const filename=`KOMO_Mobility_Report_${safe(payload.patient?.displayName)}_${new Date(payload.report?.assessmentDate||Date.now()).toISOString().slice(0,10)}${draft?'_APERCU':''}.pdf`;const url=URL.createObjectURL(out),a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);return{filename,blob:out}}
if(typeof window!=='undefined')window.KomoMobilityReportKey={version:VERSION};
