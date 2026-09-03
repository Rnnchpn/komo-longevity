const VERSION='6.0.0-final';
const VISUAL_SYSTEM='komo-motion-report-final-2026';
const ENGINE_URLS=['https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js'];
const C={paper:[249,248,244],white:[255,255,253],ink:[24,30,26],deep:[33,52,42],muted:[103,112,106],line:[221,218,210],sage:[103,132,112],sagePale:[235,242,236],sand:[242,238,229],warm:[248,243,234],rose:[247,235,230]};
let enginePromise=null;
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function clamp(v,a=0,b=100){return Math.min(b,Math.max(a,v))}
function safe(v){return String(v||'patient').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,72)||'patient'}
function dateFr(v){if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(d)}
function dateTimeFr(v){if(!v)return'';const d=new Date(v);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d)}
function compact(v,max=170){const s=String(v??'').trim();return s.length>max?s.slice(0,max-1).trim()+'…':s}
function display(v,unit='',digits=1){const x=n(v);if(x===null)return'—';const out=Number(x).toLocaleString('fr-FR',{minimumFractionDigits:digits,maximumFractionDigits:digits});return`${out}${unit?` ${unit}`:''}`}
function valueText(v){if(v===null||v===undefined||v==='')return'—';if(typeof v==='boolean')return v?'Oui':'Non';if(Array.isArray(v))return v.map(valueText).join(', ');if(typeof v==='object'){try{return JSON.stringify(v)}catch{return String(v)}}const map={yes:'Oui',no:'Non',unknown:'Je ne sais pas',none:'Aucun',never:'Jamais',rarely:'Rarement',sometimes:'Parfois',often:'Souvent',very_often:'Très souvent',always:'Toujours',preserve_mobility:'Préserver ma mobilité',improve_performance:'Améliorer mes capacités',track_change:'Suivre mon évolution',return_after_problem:'Reprendre après un problème',very_favorable:'Très favorable',favorable:'Plutôt favorable',improve:'À améliorer',former:'Ancienne consommation',cigarette:'Cigarettes',vape:'Vape',one:'Une fois',two_plus:'Deux fois ou plus',not_applicable:'Non concerné'};const k=String(v);return map[k]||k.replaceAll('_',' ')}
function loadScript(src){return new Promise((resolve,reject)=>{if(window.jspdf?.jsPDF)return resolve();const s=document.createElement('script');s.src=src;s.async=true;s.crossOrigin='anonymous';s.onload=resolve;s.onerror=()=>reject(new Error('script_load_failed'));document.head.appendChild(s)})}
async function ensurePdf(){if(window.jspdf?.jsPDF)return window.jspdf.jsPDF;if(enginePromise)return enginePromise;enginePromise=(async()=>{let last;for(const u of ENGINE_URLS){try{await loadScript(u);if(window.jspdf?.jsPDF)return window.jspdf.jsPDF}catch(e){last=e}}throw last||new Error('Moteur PDF indisponible')})();try{return await enginePromise}catch(e){enginePromise=null;throw e}}

function buildMotionReport(jsPDF,payload,{draft=false}={}){
  const doc=new jsPDF({unit:'mm',format:'a4',orientation:'portrait',compress:true,putOnlyUsedFonts:true});
  const W=210,H=297,M=16,R=194,CW=178;
  const patient=payload?.patient||{},report=payload?.report||{},summary=payload?.summary||{},sensor=payload?.sensor||{},method=payload?.methodology||{},priorities=payload?.priorities||[],context=payload?.context||{},posture=payload?.posture||{},appendix=payload?.appendix||{};
  const setText=(c=C.ink)=>doc.setTextColor(...c),setFill=c=>doc.setFillColor(...c),setDraw=(c=C.line)=>doc.setDrawColor(...c);
  const sans=(size=8,style='normal',color=C.ink)=>{doc.setFont('helvetica',style);doc.setFontSize(size);setText(color)};
  const serif=(size=20,style='normal',color=C.ink)=>{doc.setFont('times',style);doc.setFontSize(size);setText(color)};
  const lines=(text,w)=>doc.splitTextToSize(String(text??'—'),w);
  const text=(value,x,y,w,size=7,color=C.ink,leading=3.8,style='normal')=>{sans(size,style,color);const l=lines(value,w);doc.text(l,x,y);return y+l.length*leading};
  const label=(value,x,y,color=C.muted)=>{sans(5.2,'bold',color);doc.text(String(value||'').toUpperCase(),x,y)};
  const rule=(y,x1=M,x2=R,color=C.line)=>{setDraw(color);doc.setLineWidth(.22);doc.line(x1,y,x2,y)};
  const box=(x,y,w,h,fill=C.white)=>{setFill(fill);setDraw(C.line);doc.roundedRect(x,y,w,h,3.5,3.5,'FD')};
  const pageFill=()=>{setFill(C.paper);doc.rect(0,0,W,H,'F')};
  const header=(title='MOTION REPORT')=>{sans(8,'bold',C.deep);doc.text('KŌMØ',M,12);sans(4.8,'normal',C.muted);doc.text(title,M+23,12);rule(16)};
  const pageTitle=(kicker,main,sub='')=>{label(kicker,M,29,C.sage);serif(27,'normal',C.deep);doc.text(lines(main,150),M,41);if(sub)text(sub,M,58,154,7,C.muted,3.8)};
  const scoreBar=(x,y,w,value)=>{setFill(C.sand);doc.roundedRect(x,y,w,2.8,1.4,1.4,'F');const v=n(value);if(v!==null){setFill(C.sage);doc.roundedRect(x,y,w*clamp(v)/100,2.8,1.4,1.4,'F')}};
  const metricCard=(x,y,w,labelText,value,sub='')=>{box(x,y,w,31,C.white);label(labelText,x+5,y+8);serif(16,'normal',C.deep);doc.text(String(value??'—'),x+5,y+20);if(sub)text(sub,x+5,y+26,w-10,5.1,C.muted,2.6)};
  const beginPage=(kicker,main,sub='',headerTitle='MOTION REPORT')=>{doc.addPage();pageFill();header(headerTitle);pageTitle(kicker,main,sub)};
  const smallStatus=(x,y,labelText,ok=true)=>{setFill(ok?C.sagePale:C.warm);doc.roundedRect(x,y,28,8,4,4,'F');sans(4.7,'bold',ok?C.deep:C.muted);doc.text(labelText,x+14,y+5.3,{align:'center'})};
  const tableHeader=(y,cols,labels)=>{setFill(C.sand);doc.rect(M,y,CW,8,'F');sans(4.8,'bold',C.deep);labels.forEach((v,i)=>doc.text(v,M+cols[i]+1.5,y+5.4));};
  const tableRow=(y,h,cols,values,opts={})=>{setFill(opts.fill||C.white);setDraw(C.line);doc.rect(M,y,CW,h,'FD');values.forEach((v,i)=>{sans(opts.size||5.2,opts.bold&&i===0?'bold':'normal',opts.color||C.ink);const w=(cols[i+1]??CW)-cols[i]-3;doc.text(lines(v??'—',w),M+cols[i]+1.5,y+5.1)});};

  // 1 — Cover
  pageFill();setFill(C.deep);doc.rect(0,0,W,10,'F');sans(13,'bold',C.deep);doc.text('KŌMØ',M,32);sans(5.3,'normal',C.muted);doc.text('MOTION REPORT',M+33,32);rule(40);label('LONGEVITY IN MOTION',M,62,C.sage);serif(38,'normal',C.deep);doc.text(['Votre mouvement,','mesuré.'],M,84);text('Une restitution claire de votre bilan locomoteur : score capteur, symétrie musculaire, activation, marche, posture, contexte et traçabilité.',M,121,130,9,C.ink,5);
  box(M,153,82,48,C.sagePale);label('PATIENT',M+7,164);serif(15,'normal',C.deep);doc.text(lines(patient.displayName||'Patient KŌMØ',67),M+7,176);sans(5.8,'normal',C.muted);doc.text(patient.age!=null?`${patient.age} ans`:'Âge non renseigné',M+7,193);
  box(105,153,89,48,C.white);label('ÉVALUATION',112,164);serif(11.5,'normal',C.deep);doc.text(dateFr(report.assessmentDate),112,176);text(report.centerName||'KŌMØ',112,186,72,5.8,C.deep,3,'bold');text(report.practitionerName||'Professionnel KŌMØ',112,194,72,5.6,C.muted,3);
  label('SOURCE',M,227,C.deep);text('Myodev / MyoCare · acquisition instrumentée · Pulse organise et restitue les données · calcul Motion sensor v0.6.',M,238,150,7,C.muted,4);if(draft||report.status!=='released'){setFill(C.warm);doc.roundedRect(M,261,43,9,4.5,4.5,'F');sans(5,'bold',C.deep);doc.text('APERÇU À VALIDER',M+21.5,267,{align:'center'})}else{setFill(C.sagePale);doc.roundedRect(M,261,45,9,4.5,4.5,'F');sans(5,'bold',C.deep);doc.text('RAPPORT PUBLIÉ',M+22.5,267,{align:'center'})}

  // 2 — Snapshot
  beginPage('EN UN REGARD','Votre référence Motion.','Le score global, la qualité de calcul et l’état du bilan. Les données contextuelles restent séparées du calcul.');
  setFill(C.deep);doc.roundedRect(M,78,72,61,4,4,'F');label('MOTION SCORE',M+7,90,C.sagePale);serif(40,'normal',C.white);doc.text(n(summary.score)===null?'—':String(Math.round(summary.score)),M+7,116);sans(8,'normal',C.white);if(n(summary.score)!==null)doc.text('/100',M+47,116);text('Score capteur',M+7,129,52,5.5,C.sagePale,3);
  metricCard(94,78,48,'Symétrie',display(summary.symmetry,'%',1),'Domaine du score');metricCard(146,78,48,'Confiance',display(summary.confidence,'%',0),'Qualité de calcul');metricCard(94,112,48,'Complétude',display(summary.completeness,'%',0),'Données scorées');metricCard(146,112,48,'Sessions',String(sensor.sessionCount??0),'Acquisitions source');
  text(summary.sentence||'Ce résultat devient votre référence instrumentée.',M,157,CW,8,C.ink,4.4);
  label('ÉTAT DU BILAN',M,186,C.deep);box(M,193,CW,41,C.white);smallStatus(M+7,203,'MUSCLE',((sensor.lsi||[]).filter(x=>n(x.value)!==null).length===3));smallStatus(M+40,203,'MARCHE',!!sensor.gait?.complete);smallStatus(M+73,203,'POSTURE',!!posture.available);smallStatus(M+106,203,'CONTEXTE',(context.completedQuestionnaireCount||0)===(context.questionnaireCount||0)&&Number(context.questionnaireCount||0)>0);text(`${sensor.totalMetricCount??0} mesures Myodev conservées · ${sensor.validMetricCount??0} valides · ${context.completedQuestionnaireCount??0}/${context.questionnaireCount??0} questionnaires complétés.`,M+7,224,CW-14,6,C.muted,3.2);
  label('CE QUI ENTRE DANS LE SCORE',M,248,C.deep);box(M,255,CW,22,C.sagePale);text('LSI musculaires valides : quadriceps · ischio-jambiers · mollets. Questionnaires, marche et posture = contexte descriptif, contribution numérique 0.',M+7,266,CW-14,6,C.deep,3.2);

  // 3 — LSI
  beginPage('MOTION SCORE','La symétrie neuromusculaire.','Le score v0.6 utilise les LSI valides des trois groupes musculaires. Les valeurs sont restituées sans seuil clinique ajouté par Pulse.');
  let y=83;const lsi=sensor.lsi||[];for(const row of lsi.length?lsi:[{label:'Quadriceps',value:null},{label:'Ischio-jambiers',value:null},{label:'Mollets',value:null}]){box(M,y,CW,45,C.white);label(row.label,M+7,y+10);serif(24,'normal',C.deep);doc.text(display(row.value,'%',1),M+7,y+28);scoreBar(M+62,y+18,105,row.value);text('LSI Myodev · mesure instrumentée',M+62,y+31,105,5.7,C.muted,3);y+=52}
  box(M,245,CW,28,C.warm);label('RÈGLE DE CALCUL',M+7,255,C.deep);text(method.scoreDefinition||'Moyenne des LSI musculaires moyens valides pour les trois groupes mesurés.',M+7,266,CW-14,6,C.muted,3.2);

  // 4 — Activation
  beginPage('ACTIVATION','Votre signature musculaire.','Activation relative à la MVC, présentée côté gauche / côté droit. Ces données décrivent le mouvement mais ne modifient pas le score v0.6.');
  const acts=sensor.activation||[];y=82;for(const row of acts.length?acts:[{label:'Quadriceps',left:null,right:null,difference:null},{label:'Ischio-jambiers',left:null,right:null,difference:null},{label:'Mollets',left:null,right:null,difference:null}]){box(M,y,CW,50,C.white);label(row.label,M+7,y+10);metricCard(M+7,y+14,48,'Gauche',display(row.left,'%MVC',1));metricCard(M+59,y+14,48,'Droite',display(row.right,'%MVC',1));metricCard(M+111,y+14,48,'Écart',display(row.difference,'pts',1));y+=57}
  box(M,257,CW,18,C.sagePale);text('À suivre dans le temps avec le même protocole, la même calibration et des conditions comparables.',M+7,267,CW-14,6,C.deep,3.2);

  // 5 — Full gait
  beginPage('MARCHE','Votre marche instrumentée.','Les 15 valeurs spatio-temporelles prévues sont affichées lorsqu’elles existent : paramètres globaux et valeurs gauche / droite.');
  const gait=sensor.gait||{},gg=gait.globals||[],gb=gait.bilateral||[];y=79;label(`COMPLÉTUDE · ${gait.scalarCountPresent??0}/${gait.scalarCountExpected??15}`,M,y,C.deep);y+=8;
  for(let i=0;i<Math.min(5,gg.length);i++){const row=gg[i],col=i%2,r=Math.floor(i/2),x=M+col*91,yy=y+r*33;metricCard(x,yy,86,row.label,display(row.value,row.unit,row.unit==='pas/min'?0:row.unit==='m/s'?2:1),'Mesure descriptive')}
  y+=99;if(!gait.complete){box(M,y-7,CW,13,C.warm);text(`Certaines valeurs de marche ne sont pas disponibles dans cet export (${gait.scalarCountPresent??0}/15). Pulse les laisse explicitement manquantes au lieu de les inventer.`,M+7,y+1,CW-14,5.2,C.deep,2.7);y+=10}label('GAUCHE / DROITE',M,y,C.deep);y+=7;const cols=[0,72,108,144];tableHeader(y,cols,['PARAMÈTRE','GAUCHE','DROITE','UNITÉ']);y+=8;for(const row of gb){tableRow(y,11,cols,[row.label,display(row.left,'',row.unit==='count'?0:3),display(row.right,'',row.unit==='count'?0:3),row.unit],{size:5.2,bold:true});y+=11}

  // 6 — Posture, questionnaires and acquisition
  beginPage('CONTEXTE','Posture, préparation et acquisition.','Ces éléments complètent la lecture du bilan sans modifier le Motion Score sensor-only.');
  box(M,79,62,54,posture.available?C.sagePale:C.white);label('POSTURE · SVA',M+7,90);serif(24,'normal',C.deep);doc.text(display(posture.svaMm,posture.unit||'mm',1),M+7,111);text(posture.available?'Mesure enregistrée dans le même assessment.':'Mesure non disponible.',M+7,124,48,5.5,C.muted,3);
  box(84,79,110,54,C.white);label('ACQUISITION MYODEV',91,90);text(sensor.sourceFile||'Fichier source non renseigné',91,101,94,7,C.deep,3.5,'bold');text(`${sensor.sessionCount??0} session(s) · ${sensor.totalMetricCount??0} métriques · contrat ${sensor.contractVersion||'—'}`,91,113,94,5.8,C.muted,3);text(`Import : ${dateTimeFr(sensor.importedAt)||'—'} · format ${sensor.sourceFormat||'—'}`,91,124,94,5.4,C.muted,2.8);
  label('QUESTIONNAIRES PRÉ-BILAN',M,151,C.deep);const qs=context.questionnaires||[];y=159;for(let i=0;i<Math.min(6,qs.length);i++){const q=qs[i],col=i%2,r=Math.floor(i/2),x=M+col*91,yy=y+r*33;box(x,yy,86,27,C.white);label(q.label||q.instrumentCode,x+5,yy+8);sans(9,'bold',C.deep);doc.text(`${Math.round(Number(q.completeness||0))}%`,x+5,yy+18);sans(5.1,'normal',C.muted);doc.text(q.status==='completed'?'Complété':'À compléter',x+29,yy+18);}
  box(M,260,CW,17,C.sagePale);text(context.note||'Le pré-bilan apporte le contexte du patient. Contribution numérique au Motion Score : 0.',M+7,270,CW-14,5.8,C.deep,3);

  // 7 — Questionnaire detail
  beginPage('PRÉ-BILAN','Le contexte déclaré.','Le statut, la complétude et le nombre de réponses de chaque questionnaire sont conservés avec le bilan. Les réponses détaillées figurent en annexe.');
  y=80;const qcols=[0,82,116,142,166];tableHeader(y,qcols,['QUESTIONNAIRE','STATUT','COMPL.','RÉP.','SCORE']);y+=8;for(const q of qs){const score=q.score===null||q.score===undefined?'—':String(q.score);tableRow(y,18,qcols,[q.label||q.instrumentCode,q.status==='completed'?'Complété':q.status,`${Math.round(Number(q.completeness||0))}%`,String(q.responseCount??0),score],{size:5.1,bold:true});y+=18}
  label('PRINCIPE DE LECTURE',M,224,C.deep);box(M,232,CW,41,C.sagePale);text('Les questionnaires servent à comprendre la douleur, la mobilité perçue, le sommeil, le bien-être, le mode de vie et les antécédents. Ils restent séparés du calcul Motion v0.6 afin de ne pas mélanger données déclaratives et signal capteur.',M+7,245,CW-14,6.2,C.deep,3.4);text('Une session incomplète reste visible comme incomplète et n’est jamais présentée comme un résultat final validé.',M+7,264,CW-14,5.6,C.muted,3);

  // 8 — Act, method and provenance
  beginPage('ACT','Comprendre, puis agir.','Les priorités sont proposées à partir de l’interprétation globale et doivent être validées avec le professionnel.');
  y=80;if(priorities.length){for(const p of priorities.slice(0,3)){box(M,y,CW,43,C.white);label(`PRIORITÉ ${p.rank||''}`,M+7,y+9,C.sage);serif(12,'normal',C.deep);doc.text(lines(p.title||'Objectif KŌMØ',95),M+7,y+20);const actions=(p.actions||[]).slice(0,2).join(' · ')||p.firstAction||'À définir avec votre professionnel.';text(actions,M+105,y+16,78,5.8,C.muted,3);text(`Re-mesure : ${p.recheck||'selon le plan de suivi'}`,M+105,y+33,78,5.2,C.deep,2.8,'bold');y+=49}}else{box(M,y,CW,37,C.white);text('Aucune priorité automatique n’est publiée pour ce bilan. La restitution professionnelle reste la prochaine étape.',M+7,y+15,CW-14,6.4,C.muted,3.4);y+=45}
  label('MÉTHODE & PROVENANCE',M,230,C.deep);text(`Algorithme : ${payload.identity?.algorithmVersion||method.algorithm||'motion-sensor-index-v0.6.0'} · protocole : ${payload.provenance?.assessmentProtocol||'—'} · source : ${payload.provenance?.source||'Myodev / MyoCare'}.`,M,241,CW,5.8,C.muted,3.1);text(method.scoreDefinition||'',M,253,CW,5.8,C.muted,3.1);text(method.disclaimer||'Le Motion Score ne constitue pas à lui seul un diagnostic médical.',M,268,CW,5.2,C.muted,2.8);

  // Technical appendix — questionnaires
  const qrows=appendix.questionnaireResponses||[];
  const addAppendixPage=(titleText,sub)=>{beginPage('ANNEXE TECHNIQUE',titleText,sub,'ANNEXE · MOTION REPORT')};
  if(report.technicalAppendix!==false&&qrows.length){for(let start=0;start<qrows.length;start+=18){addAppendixPage('Réponses questionnaires.','Traçabilité des réponses conservées dans le même assessment. Les codes item sont ceux de l’instrument versionné dans Pulse.');let yy=80;const cols=[0,53,80,116,151];tableHeader(yy,cols,['INSTRUMENT','ITEM','VALEUR','SOURCE','VÉRIF.']);yy+=8;for(const r of qrows.slice(start,start+18)){tableRow(yy,10,cols,[compact(r.instrumentLabel||r.instrumentCode,30),r.itemCode,compact(valueText(r.rawValue),28),r.source||'—',r.clinicianVerified?'Oui':'Non'],{size:4.6,bold:true});yy+=10}}}

  // Technical appendix — Myodev metrics
  const mrows=appendix.sensorMetrics||[];
  if(report.technicalAppendix!==false&&mrows.length){for(let start=0;start<mrows.length;start+=21){addAppendixPage('Métriques Myodev.','Toutes les métriques numériques importées sont conservées ici, y compris leur contexte, leur latéralité et leur statut qualité.');let yy=80;const cols=[0,43,68,94,124,153];tableHeader(yy,cols,['TÂCHE','MUSCLE','CÔTÉ','MÉTRIQUE','VALEUR','QC']);yy+=8;for(const r of mrows.slice(start,start+21)){tableRow(yy,9.2,cols,[compact(r.taskCode,20),compact(r.muscleCode||'NA',12),r.side||'na',compact(r.metricCode,22),`${display(r.value,'',3)} ${r.unit||''}`.trim(),r.qcStatus||'—'],{size:4.5,bold:true});yy+=9.2}}}

  // Technical appendix — canonical measurements
  const crows=appendix.measurements||[];
  if(report.technicalAppendix!==false&&crows.length){for(let start=0;start<crows.length;start+=20){addAppendixPage('Mesures Pulse complémentaires.','Mesures canoniques enregistrées dans le même assessment, distinctes des métriques Myodev brutes.');let yy=80;const cols=[0,55,90,122,154];tableHeader(yy,cols,['INDICATEUR','VALEUR','UNITÉ','SOURCE','QC']);yy+=8;for(const r of crows.slice(start,start+20)){const v=r.numericValue!==null&&r.numericValue!==undefined?display(r.numericValue,'',2):(r.textValue||r.rawText||'—');tableRow(yy,10,cols,[compact(r.indicatorCode,28),compact(v,28),r.unit||'—',compact(r.source,16),r.qcStatus||'—'],{size:4.7,bold:true});yy+=10}}}

  // Add page numbers after total page count is known.
  const total=doc.getNumberOfPages();for(let p=1;p<=total;p++){doc.setPage(p);rule(282);sans(4.5,'normal',C.muted);doc.text(patient.displayName||'Patient KŌMØ',M,289);doc.text(`KŌMØ · ${p}/${total}`,105,289,{align:'center'});doc.text(dateTimeFr(payload.generatedAt),R,289,{align:'right'})}
  doc.setProperties({title:`KŌMØ Motion Report — ${patient.displayName||'Patient'}`,subject:'KŌMØ Motion Report · données capteurs Myodev · contexte Pulse',author:'KŌMØ',creator:`KŌMØ Pulse · ${VERSION}`});
  return doc;
}

export async function createMobilityReportPdf(payload,{draft=false}={}){const jsPDF=await ensurePdf();return buildMotionReport(jsPDF,payload,{draft})}
export async function mobilityReportBlob(payload,options={}){const doc=await createMobilityReportPdf(payload,options);const blob=doc.output('blob');if(!blob||blob.size<16000)throw new Error(`PDF anormalement petit (${Math.round((blob?.size||0)/1024)} Ko)`);return{doc,blob}}
export async function downloadMobilityReport(payload,{draft=false,blob=null}={}){let out=blob;if(!out)out=(await mobilityReportBlob(payload,{draft})).blob;const date=new Date(payload.generatedAt||payload.report?.assessmentDate||Date.now()).toISOString().slice(0,10);const version=payload.report?.version?`_v${payload.report.version}`:'';const filename=`KOMO_Motion_Report_${safe(payload.patient?.displayName)}_${date}${version}${draft?'_APERCU':''}.pdf`;const url=URL.createObjectURL(out),a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);return{filename,blob:out}}
if(typeof window!=='undefined')window.KomoMobilityReportPdf={version:VERSION,visualSystem:VISUAL_SYSTEM,create:createMobilityReportPdf,blob:mobilityReportBlob,download:downloadMobilityReport};
