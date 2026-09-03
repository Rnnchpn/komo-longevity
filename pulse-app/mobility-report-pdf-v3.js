const VERSION='5.0.0-sensor';
const VISUAL_SYSTEM='komo-motion-report-2026';
const ENGINE_URLS=['https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js'];
const C={paper:[249,248,244],white:[255,255,253],ink:[24,30,26],deep:[33,52,42],muted:[103,112,106],line:[221,218,210],sage:[103,132,112],sagePale:[235,242,236],sand:[242,238,229],warm:[248,243,234]};
let enginePromise=null;
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function clamp(v,a=0,b=100){return Math.min(b,Math.max(a,v))}
function safe(v){return String(v||'patient').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,72)||'patient'}
function dateFr(v){if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(d)}
function dateTimeFr(v){if(!v)return'';const d=new Date(v);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d)}
function compact(v,max=170){const s=String(v??'').trim();return s.length>max?s.slice(0,max-1).trim()+'…':s}
function display(v,unit='',digits=1){const x=n(v);if(x===null)return'—';const out=Number(x).toLocaleString('fr-FR',{minimumFractionDigits:digits,maximumFractionDigits:digits});return`${out}${unit?` ${unit}`:''}`}
function loadScript(src){return new Promise((resolve,reject)=>{if(window.jspdf?.jsPDF)return resolve();const s=document.createElement('script');s.src=src;s.async=true;s.crossOrigin='anonymous';s.onload=resolve;s.onerror=()=>reject(new Error('script_load_failed'));document.head.appendChild(s)})}
async function ensurePdf(){if(window.jspdf?.jsPDF)return window.jspdf.jsPDF;if(enginePromise)return enginePromise;enginePromise=(async()=>{let last;for(const u of ENGINE_URLS){try{await loadScript(u);if(window.jspdf?.jsPDF)return window.jspdf.jsPDF}catch(e){last=e}}throw last||new Error('Moteur PDF indisponible')})();try{return await enginePromise}catch(e){enginePromise=null;throw e}}

function buildMotionReport(jsPDF,payload,{draft=false}={}){
  const doc=new jsPDF({unit:'mm',format:'a4',orientation:'portrait',compress:false,putOnlyUsedFonts:true});
  const W=210,H=297,M=16,R=194,CW=178,PAGES=6;
  const patient=payload?.patient||{},report=payload?.report||{},summary=payload?.summary||{},sensor=payload?.sensor||{},method=payload?.methodology||{},priorities=payload?.priorities||[];
  const setText=(c=C.ink)=>doc.setTextColor(...c),setFill=c=>doc.setFillColor(...c),setDraw=(c=C.line)=>doc.setDrawColor(...c);
  const sans=(size=8,style='normal',color=C.ink)=>{doc.setFont('helvetica',style);doc.setFontSize(size);setText(color)};
  const serif=(size=20,style='normal',color=C.ink)=>{doc.setFont('times',style);doc.setFontSize(size);setText(color)};
  const lines=(text,w)=>doc.splitTextToSize(String(text??'—'),w);
  const text=(value,x,y,w,size=7,color=C.ink,leading=3.8,style='normal')=>{sans(size,style,color);const l=lines(value,w);doc.text(l,x,y);return y+l.length*leading};
  const label=(value,x,y,color=C.muted)=>{sans(5.2,'bold',color);doc.text(String(value||'').toUpperCase(),x,y)};
  const rule=(y,x1=M,x2=R,color=C.line)=>{setDraw(color);doc.setLineWidth(.22);doc.line(x1,y,x2,y)};
  const box=(x,y,w,h,fill=C.white)=>{setFill(fill);setDraw(C.line);doc.roundedRect(x,y,w,h,3.5,3.5,'FD')};
  const pageFill=()=>{setFill(C.paper);doc.rect(0,0,W,H,'F')};
  const header=(page,title='MOTION REPORT')=>{sans(8,'bold',C.deep);doc.text('KŌMØ',M,12);sans(4.8,'normal',C.muted);doc.text(title,M+23,12);sans(5,'normal',C.muted);doc.text(String(page).padStart(2,'0'),R,12,{align:'right'});rule(16)};
  const footer=page=>{rule(282);sans(4.5,'normal',C.muted);doc.text(patient.displayName||'Patient KŌMØ',M,289);doc.text(`KŌMØ · ${page}/${PAGES}`,105,289,{align:'center'});doc.text(dateTimeFr(payload.generatedAt),R,289,{align:'right'})};
  const title=(kicker,main,sub='')=>{label(kicker,M,29,C.sage);serif(27,'normal',C.deep);doc.text(lines(main,150),M,41);if(sub)text(sub,M,58,150,7,C.muted,3.8)};
  const scoreBar=(x,y,w,value)=>{setFill(C.sand);doc.roundedRect(x,y,w,2.8,1.4,1.4,'F');const v=n(value);if(v!==null){setFill(C.sage);doc.roundedRect(x,y,w*clamp(v)/100,2.8,1.4,1.4,'F')}};
  const metricCard=(x,y,w,labelText,value,sub='')=>{box(x,y,w,31,C.white);label(labelText,x+5,y+8);serif(17,'normal',C.deep);doc.text(String(value??'—'),x+5,y+20);if(sub)text(sub,x+5,y+26,w-10,5.1,C.muted,2.6)};
  const addPage=(page,kicker,main,sub='')=>{doc.addPage();pageFill();header(page);title(kicker,main,sub)};

  // 1 — Cover
  pageFill();setFill(C.deep);doc.rect(0,0,W,10,'F');sans(13,'bold',C.deep);doc.text('KŌMØ',M,32);sans(5.3,'normal',C.muted);doc.text('MOTION REPORT',M+33,32);rule(40);label('LONGEVITY IN MOTION',M,62,C.sage);serif(38,'normal',C.deep);doc.text(['Votre mouvement,','mesuré.'],M,84);text('Une lecture claire des données capteurs Myodev qui composent votre Motion Score et servent de référence à votre trajectoire KŌMØ.',M,121,125,9,C.ink,5);
  box(M,153,82,48,C.sagePale);label('PATIENT',M+7,164);serif(15,'normal',C.deep);doc.text(lines(patient.displayName||'Patient KŌMØ',67),M+7,176);sans(5.8,'normal',C.muted);doc.text(patient.age!=null?`${patient.age} ans`:'Âge non renseigné',M+7,193);
  box(105,153,89,48,C.white);label('ÉVALUATION',112,164);serif(11.5,'normal',C.deep);doc.text(dateFr(report.assessmentDate),112,176);text(report.practitionerName||'Professionnel KŌMØ',112,188,72,5.8,C.muted,3);
  label('SOURCE',M,227,C.deep);text('Myodev / MyoCare · acquisition instrumentée · calcul Motion sensor v0.6',M,238,140,7,C.muted,4);if(draft||report.status!=='released'){setFill(C.warm);doc.roundedRect(M,261,43,9,4.5,4.5,'F');sans(5,'bold',C.deep);doc.text('APERÇU À VALIDER',M+21.5,267,{align:'center'})}else{setFill(C.sagePale);doc.roundedRect(M,261,45,9,4.5,4.5,'F');sans(5,'bold',C.deep);doc.text('RAPPORT PUBLIÉ',M+22.5,267,{align:'center'})}footer(1);

  // 2 — Snapshot
  addPage(2,'EN UN REGARD','Votre référence Motion.','Le score global et ses indicateurs de qualité. Le pré-bilan reste séparé du calcul.');
  setFill(C.deep);doc.roundedRect(M,78,72,61,4,4,'F');label('MOTION SCORE',M+7,90,C.sagePale);serif(40,'normal',C.white);doc.text(n(summary.score)===null?'—':String(Math.round(summary.score)),M+7,116);sans(8,'normal',C.white);if(n(summary.score)!==null)doc.text('/100',M+47,116);text('Score capteur',M+7,129,52,5.5,C.sagePale,3);
  metricCard(94,78,48,'Symétrie',display(summary.symmetry,'%',1),'Domaine qui compose le score');metricCard(146,78,48,'Confiance',display(summary.confidence,'%',0),'Qualité de calcul');metricCard(94,112,48,'Complétude',display(summary.completeness,'%',0),'Données capteurs');metricCard(146,112,48,'Sessions',String(sensor.sessionCount??0),'Acquisitions source');
  text(summary.sentence||'Ce résultat devient votre référence instrumentée.',M,157,CW,8,C.ink,4.4);
  label('CE QUI ENTRE DANS LE SCORE',M,191,C.deep);box(M,198,CW,32,C.sagePale);text('LSI musculaires valides · quadriceps · ischio-jambiers · mollets',M+7,210,CW-14,9,C.deep,4,'bold');text('Questionnaires : 0 % du Motion Score. Tests fonctionnels manuels : retirés du calcul.',M+7,222,CW-14,6,C.muted,3.2);
  label('TRAÇABILITÉ',M,246,C.deep);text(`${sensor.validMetricCount??0} mesures capteurs valides · ${sensor.sessionCount??0} session(s) · ${sensor.sourceFile||'fichier Myodev'} · ${sensor.contractVersion||'contrat Myodev'}`,M,258,CW,6.4,C.muted,3.4);footer(2);

  // 3 — LSI
  addPage(3,'MOTION SCORE','La symétrie neuromusculaire.','Le score v0.6 utilise les LSI valides des trois groupes musculaires. Les valeurs sont affichées sans seuil clinique ajouté par Pulse.');
  let y=83;const lsi=sensor.lsi||[];for(const row of lsi.length?lsi:[{label:'Quadriceps',value:null},{label:'Ischio-jambiers',value:null},{label:'Mollets',value:null}]){box(M,y,CW,45,C.white);label(row.label,M+7,y+10);serif(24,'normal',C.deep);doc.text(display(row.value,'%',1),M+7,y+28);scoreBar(M+62,y+18,105,row.value);text('LSI Myodev · mesure instrumentée',M+62,y+31,105,5.7,C.muted,3);y+=52}
  box(M,245,CW,28,C.warm);label('RÈGLE DE CALCUL',M+7,255,C.deep);text(method.scoreDefinition||'Moyenne des LSI musculaires moyens valides pour les trois groupes mesurés.',M+7,266,CW-14,6,C.muted,3.2);footer(3);

  // 4 — Activation
  addPage(4,'ACTIVATION','Votre signature musculaire.','Activation relative à la MVC, présentée côté gauche / côté droit. Ces données décrivent le mouvement mais ne modifient pas le score v0.6.');
  const acts=sensor.activation||[];y=82;for(const row of acts.length?acts:[{label:'Quadriceps',left:null,right:null,difference:null},{label:'Ischio-jambiers',left:null,right:null,difference:null},{label:'Mollets',left:null,right:null,difference:null}]){box(M,y,CW,50,C.white);label(row.label,M+7,y+10);metricCard(M+7,y+14,48,'Gauche',display(row.left,'%MVC',1));metricCard(M+59,y+14,48,'Droite',display(row.right,'%MVC',1));metricCard(M+111,y+14,48,'Écart',display(row.difference,'pts',1));y+=57}
  box(M,257,CW,18,C.sagePale);text('À suivre dans le temps avec le même protocole, la même calibration et des conditions comparables.',M+7,267,CW-14,6,C.deep,3.2);footer(4);

  // 5 — Gait and descriptive sensor data
  addPage(5,'MARCHE & MOUVEMENT','Les autres données capteurs.','La marche et les métriques additionnelles enrichissent l’interprétation. Elles restent descriptives dans le Motion Score v0.6 actuel.');
  const gait=sensor.gait||[],other=sensor.other||[];y=80;label('MARCHE INSTRUMENTÉE',M,y,C.deep);y+=8;const g=gait.length?gait:[{label:'Vitesse de marche',value:null,unit:'m/s'},{label:'Cadence',value:null,unit:'pas/min'},{label:'Double appui',value:null,unit:'%'}];for(let i=0;i<Math.min(6,g.length);i++){const row=g[i],col=i%2,r=Math.floor(i/2),x=M+col*91,yy=y+r*34;metricCard(x,yy,86,row.label,display(row.value,row.unit,row.unit==='pas/min'?0:1),'Mesure descriptive')}
  y+=Math.ceil(Math.min(6,g.length)/2)*34+8;label('AUTRES SIGNAUX DISPONIBLES',M,y,C.deep);y+=8;if(other.length){for(let i=0;i<Math.min(8,other.length);i++){const row=other[i],col=i%2,r=Math.floor(i/2),x=M+col*91,yy=y+r*27;box(x,yy,86,22,C.white);label(compact(row.label,28),x+5,yy+7);sans(8,'bold',C.deep);doc.text(display(row.value,row.unit,1),x+5,yy+16)}}else{box(M,y,CW,28,C.white);text('Aucune autre métrique descriptive exploitable dans ce bilan.',M+7,y+16,CW-14,6,C.muted,3)}footer(5);

  // 6 — Act / trajectory / method
  addPage(6,'ACT','Comprendre, puis agir.','Les priorités sont proposées à partir de l’interprétation globale et doivent être validées avec le professionnel.');
  y=80;if(priorities.length){for(const p of priorities.slice(0,3)){box(M,y,CW,45,C.white);label(`PRIORITÉ ${p.rank||''}`,M+7,y+9,C.sage);serif(12,'normal',C.deep);doc.text(lines(p.title||'Objectif KŌMØ',95),M+7,y+20);const actions=(p.actions||[]).slice(0,2).join(' · ')||p.firstAction||'À définir avec votre professionnel.';text(actions,M+105,y+16,78,5.8,C.muted,3);text(`Re-mesure : ${p.recheck||'selon le plan de suivi'}`,M+105,y+34,78,5.2,C.deep,2.8,'bold');y+=51}}else{box(M,y,CW,37,C.white);text('Aucune priorité automatique n’est publiée pour ce bilan. La restitution professionnelle reste la prochaine étape.',M+7,y+15,CW-14,6.4,C.muted,3.4);y+=45}
  label('MÉTHODE',M,238,C.deep);text(`Algorithme : ${payload.identity?.algorithmVersion||method.algorithm||'motion-sensor-index-v0.6.0'}. ${method.scoreDefinition||''}`,M,249,CW,5.9,C.muted,3.1);text('Le pré-bilan et les questionnaires servent au contexte. Ils n’entrent pas dans le calcul numérique du Motion Score.',M,264,CW,5.9,C.muted,3.1);text(method.disclaimer||'Le Motion Score ne constitue pas à lui seul un diagnostic médical.',M,276,CW,5.2,C.muted,2.8);footer(6);

  doc.setProperties({title:`KŌMØ Motion Report — ${patient.displayName||'Patient'}`,subject:'KŌMØ Motion Report · données capteurs Myodev',author:'KŌMØ',creator:`KŌMØ Pulse · ${VERSION}`});
  return doc;
}

export async function createMobilityReportPdf(payload,{draft=false}={}){const jsPDF=await ensurePdf();return buildMotionReport(jsPDF,payload,{draft})}
export async function mobilityReportBlob(payload,options={}){const doc=await createMobilityReportPdf(payload,options);const blob=doc.output('blob');if(!blob||blob.size<12000)throw new Error(`PDF anormalement petit (${Math.round((blob?.size||0)/1024)} Ko)`);return{doc,blob}}
export async function downloadMobilityReport(payload,{draft=false,blob=null}={}){let out=blob;if(!out)out=(await mobilityReportBlob(payload,{draft})).blob;const date=new Date(payload.generatedAt||payload.report?.assessmentDate||Date.now()).toISOString().slice(0,10);const version=payload.report?.version?`_v${payload.report.version}`:'';const filename=`KOMO_Motion_Report_${safe(payload.patient?.displayName)}_${date}${version}${draft?'_APERCU':''}.pdf`;const url=URL.createObjectURL(out),a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);return{filename,blob:out}}
if(typeof window!=='undefined')window.KomoMobilityReportPdf={version:VERSION,visualSystem:VISUAL_SYSTEM,create:createMobilityReportPdf,blob:mobilityReportBlob,download:downloadMobilityReport};
