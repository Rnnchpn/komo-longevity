const VERSION='8.0.0-premium';
const VISUAL_SYSTEM='komo-motion-report-premium-2026';
const ENGINE_URLS=['https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js'];
const C={paper:[244,247,245],white:[255,255,255],ink:[23,37,29],deep:[24,56,42],muted:[105,123,113],line:[220,230,223],sage:[47,139,96],sagePale:[237,247,241],sand:[245,247,246],warm:[255,248,233],rose:[255,241,238],blue:[100,124,241],bluePale:[242,244,255]};
let enginePromise=null;
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function clamp(v,a=0,b=100){return Math.min(b,Math.max(a,v))}
function safe(v){return String(v||'patient').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,72)||'patient'}
function dateFr(v){if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'short',year:'numeric'}).format(d)}
function dateTimeFr(v){if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d)}
function compact(v,max=80){const s=String(v??'').trim();return s.length>max?s.slice(0,max-1).trim()+'…':s}
function display(v,unit='',digits=1){const x=n(v);if(x===null)return'—';const out=Number(x).toLocaleString('fr-FR',{minimumFractionDigits:digits,maximumFractionDigits:digits});return`${out}${unit?` ${unit}`:''}`}
function valueText(v){if(v===null||v===undefined||v==='')return'—';if(typeof v==='boolean')return v?'Oui':'Non';if(Array.isArray(v))return v.map(valueText).join(', ');if(typeof v==='object'){try{return JSON.stringify(v)}catch{return String(v)}}return String(v).replaceAll('_',' ')}
function sideText(v){return({left:'Gauche',right:'Droite',bilateral:'Bilatéral',na:'—',not_applicable:'—'})[v]||v||'—'}
function qcText(v){const x=String(v||'').toLowerCase();return({valid:'Valide',suspect:'Suspect',invalid:'Invalide',pending:'En attente'})[x]||v||'—'}
function loadScript(src){return new Promise((resolve,reject)=>{if(window.jspdf?.jsPDF)return resolve();const s=document.createElement('script');s.src=src;s.async=true;s.crossOrigin='anonymous';s.onload=resolve;s.onerror=()=>reject(new Error('script_load_failed'));document.head.appendChild(s)})}
async function ensurePdf(){if(window.jspdf?.jsPDF)return window.jspdf.jsPDF;if(enginePromise)return enginePromise;enginePromise=(async()=>{let last;for(const u of ENGINE_URLS){try{await loadScript(u);if(window.jspdf?.jsPDF)return window.jspdf.jsPDF}catch(e){last=e}}throw last||new Error('Moteur PDF indisponible')})();try{return await enginePromise}catch(e){enginePromise=null;throw e}}

function buildMotionReport(jsPDF,payload,{draft=false}={}){
 const doc=new jsPDF({unit:'mm',format:'a4',orientation:'portrait',compress:true,putOnlyUsedFonts:true});
 const W=210,H=297,M=15,R=195,CW=180;
 const patient=payload?.patient||{},report=payload?.report||{},summary=payload?.summary||{},sensor=payload?.sensor||{},fn=payload?.function||{},muscle=payload?.muscle||{},posture=payload?.posture||{},context=payload?.context||{},method=payload?.methodology||{},prov=payload?.provenance||{},appendix=payload?.appendix||{},priorities=payload?.priorities||[];
 const setText=(c=C.ink)=>doc.setTextColor(...c),setFill=c=>doc.setFillColor(...c),setDraw=(c=C.line)=>doc.setDrawColor(...c);
 const sans=(size=8,style='normal',color=C.ink)=>{doc.setFont('helvetica',style);doc.setFontSize(size);setText(color)};
 const serif=(size=20,style='normal',color=C.ink)=>{doc.setFont('helvetica',style);doc.setFontSize(size);setText(color)};
 const lines=(t,w)=>doc.splitTextToSize(String(t??'—'),w);
 const text=(v,x,y,w,size=7,color=C.ink,lead=3.7,style='normal')=>{sans(size,style,color);const l=lines(v,w);doc.text(l,x,y);return y+l.length*lead};
 const label=(v,x,y,color=C.muted)=>{sans(5.1,'bold',color);doc.text(String(v||'').toUpperCase(),x,y)};
 const rule=(y,x1=M,x2=R,color=C.line)=>{setDraw(color);doc.setLineWidth(.22);doc.line(x1,y,x2,y)};
 const box=(x,y,w,h,fill=C.white)=>{setFill(fill);setDraw(C.line);doc.roundedRect(x,y,w,h,3.5,3.5,'FD')};
 const pageFill=()=>{setFill(C.paper);doc.rect(0,0,W,H,'F')};
 const header=()=>{sans(8,'bold',C.deep);doc.text('KŌMØ',M,12);sans(4.8,'normal',C.muted);doc.text('MOTION REPORT',M+23,12);rule(16)};
 const pageTitle=(kicker,main,sub='')=>{label(kicker,M,29,C.sage);serif(25,'normal',C.deep);doc.text(lines(main,156),M,41);if(sub)text(sub,M,57,158,6.5,C.muted,3.5)};
 const beginPage=(kicker,main,sub='')=>{doc.addPage();pageFill();header();pageTitle(kicker,main,sub)};
 const metricCard=(x,y,w,l,v,sub='')=>{box(x,y,w,30,C.white);label(l,x+5,y+8);serif(15,'normal',C.deep);doc.text(String(v??'—'),x+5,y+20);if(sub)text(sub,x+5,y+26,w-10,4.9,C.muted,2.5)};
 const statusPill=(x,y,l,ok=true)=>{setFill(ok?C.sagePale:C.warm);doc.roundedRect(x,y,29,8,4,4,'F');sans(4.6,'bold',ok?C.deep:C.muted);doc.text(l,x+14.5,y+5.2,{align:'center'})};
 const tableHeader=(y,cols,labels)=>{setFill(C.deep);doc.rect(M,y,CW,8,'F');labels.forEach((v,i)=>{sans(4.6,'bold',C.white);doc.text(v,M+cols[i]+1.5,y+5.4)})};
 const tableRow=(y,h,cols,values,{size=5.0,fill=C.white,boldFirst=false}={})=>{setFill(fill);setDraw(C.line);doc.rect(M,y,CW,h,'FD');values.forEach((v,i)=>{sans(size,boldFirst&&i===0?'bold':'normal',C.ink);const w=(cols[i+1]??CW)-cols[i]-3;doc.text(lines(v??'—',w),M+cols[i]+1.5,y+4.8)})};
 const addPagedTable=(kicker,title,sub,cols,headers,rows,{pageRows=18,rowH=11,size=4.6,formatter=x=>x}={})=>{if(!rows.length){beginPage(kicker,title,sub);box(M,80,CW,28,C.white);text('Aucune donnée disponible.',M+7,96,CW-14,6.3,C.muted,3.2);return}for(let s=0;s<rows.length;s+=pageRows){const chunk=rows.slice(s,s+pageRows);beginPage(kicker,title,s?`${sub} · suite ${Math.floor(s/pageRows)+1}`:sub);let y=78;tableHeader(y,cols,headers);y+=8;chunk.forEach((r,i)=>{tableRow(y,rowH,cols,formatter(r),{size,fill:i%2?C.paper:C.white});y+=rowH})}};

 // 1 — Couverture premium
 pageFill();
 setFill(C.deep);doc.rect(0,0,W,8,'F');
 sans(12,'bold',C.deep);doc.text('KŌMØ',M,28);
 sans(5.1,'normal',C.muted);doc.text('MOTION REPORT',M+31,28);
 label('LONGEVITY IN MOTION',M,50,C.sage);
 serif(30,'bold',C.deep);doc.text(lines('Votre référence Motion.',145),M,68);
 text('Un bilan clair de votre mouvement, de vos priorités et de la prochaine étape de votre trajectoire KŌMØ.',M,83,142,7.6,C.muted,4.1);

 setFill(C.sagePale);setDraw(C.line);doc.roundedRect(M,108,88,82,5,5,'FD');
 label('MOTION SCORE',M+8,121,C.sage);
 serif(44,'bold',C.deep);doc.text(n(summary.score)===null?'—':String(Math.round(summary.score)),M+8,153);
 sans(10,'normal',C.muted);if(n(summary.score)!==null)doc.text('/100',M+55,153);
 text(summary.sentence||'Votre référence instrumentée KŌMØ.',M+8,169,70,6.2,C.deep,3.4);

 setFill(C.white);setDraw(C.line);doc.roundedRect(108,108,87,82,5,5,'FD');
 label('PATIENT',116,121,C.sage);
 serif(13,'bold',C.deep);doc.text(lines(patient.displayName||'Patient KŌMØ',68),116,136);
 sans(5.4,'normal',C.muted);doc.text(patient.age!=null?`${patient.age} ans`:'Âge non renseigné',116,149);
 label('ÉVALUATION',116,161,C.muted);
 sans(6.3,'bold',C.deep);doc.text(dateFr(report.assessmentDate),116,171);
 sans(5.2,'normal',C.muted);doc.text(compact(report.centerName||'KŌMØ',30),116,180);
 doc.text(compact(report.practitionerName||'Professionnel KŌMØ',30),116,187);

 const firstPriority=priorities[0]||null;
 box(M,205,CW,48,C.white);
 label('PRIORITÉ ACTUELLE',M+8,217,C.sage);
 serif(13,'bold',C.deep);doc.text(lines(firstPriority?.title||'Poursuivre votre progression locomotrice',105),M+8,230);
 text(firstPriority?.recheck?`Recheck recommandé : ${firstPriority.recheck}`:'Votre prochaine étape est définie avec votre professionnel.',M+119,228,67,5.6,C.muted,3.1);
 setFill(draft||report.status!=='released'?C.warm:C.sagePale);doc.roundedRect(M,264,48,9,4.5,4.5,'F');
 sans(5,'bold',C.deep);doc.text(draft||report.status!=='released'?'APERÇU À VALIDER':'RAPPORT PUBLIÉ',M+24,270,{align:'center'});
 text('Motion est un bilan fonctionnel et longitudinal. Les actes ou interprétations médicales restent distincts et relèvent du professionnel habilité.',M+56,266,130,5.0,C.muted,2.8);

 // 2 — En un regard
 beginPage('EN UN REGARD','Ce qui compte maintenant.','Votre Motion Score, la symétrie des trois groupes musculaires et la priorité qui guide votre trajectoire.');

 setFill(C.deep);doc.roundedRect(M,76,58,58,5,5,'F');
 label('MOTION SCORE',M+7,88,C.sagePale);
 serif(34,'bold',C.white);doc.text(n(summary.score)===null?'—':String(Math.round(summary.score)),M+7,113);
 sans(7,'normal',C.white);if(n(summary.score)!==null)doc.text('/100',M+39,113);
 text('Référence instrumentée',M+7,126,45,5.2,C.sagePale,2.8);

 const lsiByMuscle=new Map((sensor.lsi||[]).map(x=>[String(x.muscle||''),n(x.value)]));
 const lsiCards=[
  ['QUADRICEPS',lsiByMuscle.get('VM')??lsiByMuscle.get('VL')],
  ['ISCHIO-JAMBIERS',lsiByMuscle.get('BF')],
  ['MOLLETS',lsiByMuscle.get('GM')]
 ];
 lsiCards.forEach((it,i)=>{
   const x=78+i*39;
   const v=it[1];
   const fill=v!==null&&v<85?C.rose:v!==null&&v<90?C.warm:C.white;
   box(x,76,35,58,fill);
   label(it[0],x+4,87,v!==null&&v<85?[173,87,77]:C.muted);
   serif(19,'bold',v!==null&&v<85?[173,87,77]:C.deep);doc.text(v===null?'—':`${Math.round(v)}%`,x+4,109);
   text(v===null?'Non disponible':v<85?'Priorité':v<90?'À surveiller':'Favorable',x+4,123,27,5.1,C.muted,2.6,'bold');
 });

 box(M,148,CW,51,C.white);
 label('PRIORITÉ ACTUELLE',M+7,160,C.sage);
 serif(14,'bold',C.deep);doc.text(lines(firstPriority?.title||'Poursuivre votre progression locomotrice',108),M+7,174);
 text((firstPriority?.actions||[]).slice(0,2).join(' · ')||firstPriority?.firstAction||'Votre trajectoire transforme ce résultat en actions concrètes.',M+7,188,108,5.7,C.muted,3);
 setFill(C.bluePale);setDraw(C.line);doc.roundedRect(132,160,55,28,3.5,3.5,'FD');
 label('PROCHAIN RECHECK',138,170,C.blue);
 serif(10,'bold',C.deep);doc.text(firstPriority?.recheck||'Selon le suivi',138,181);

 metricCard(M,214,54,'Symétrie globale',display(summary.symmetry,'%',1),'Repère longitudinal');
 metricCard(M+60,214,54,'Confiance',display(summary.confidence,'%',0),'Qualité du calcul');
 metricCard(M+120,214,60,'Données capteurs',String(sensor.totalMetricCount??0),'Métriques conservées');

 box(M,251,CW,27,C.sagePale);
 label('À RETENIR',M+7,261,C.deep);
 text('Le Motion Score s’appuie sur les mesures instrumentées validées. Les tests fonctionnels, la marche, la posture et les questionnaires documentent votre contexte et votre évolution sans être confondus avec le score.',M+7,271,CW-14,5.4,C.deep,2.9);

 // 3 — Fonction
 beginPage('FONCTION','Tests fonctionnels & contexte.','Chaque mesure est montrée avec sa source et son QC. Une valeur absente reste explicitement non recueillie.');
 let y=77;const fcols=[0,76,112,144,166];tableHeader(y,fcols,['TEST','RÉSULTAT','SOURCE','QC','DATE']);y+=8;for(const r of fn.tests||[]){const val=r.available?(typeof r.value==='number'?display(r.value,r.unit||'',r.code==='M-FUN-03'?2:r.code==='M-FUN-05'?2:1):`${valueText(r.value)}${r.unit?` ${r.unit}`:''}`):'Non recueilli';tableRow(y,20,fcols,[`${r.label}\n${r.code}`,val,compact(r.source,24),qcText(r.qcStatus),dateFr(r.recordedAt)],{size:4.9,boldFirst:true});y+=20}
 box(M,244,CW,31,C.sagePale);label('INTERPRÉTATION PRODUIT',M+7,254,C.deep);text('Ces tests complètent votre portrait locomoteur et votre suivi longitudinal. Ils restent distincts du calcul du Motion Score.',M+7,266,CW-14,5.8,C.deep,3.1);

 // 4 — Marche
 beginPage('MARCHE','Profil spatio-temporel.','Vitesse, cadence, longueur de pas, temporalité et symétrie sont distinguées de la signature EMG.');
 const gh=sensor.gait?.headline||{};metricCard(M,77,42,'Vitesse',display(gh.speed,'m/s',2),'Descriptif');metricCard(M+46,77,42,'Cadence',display(gh.cadence,'pas/min',0),'Descriptif');metricCard(M+92,77,42,'Pas G / D',`${display(gh.stepLengthLeft,'m',2)} / ${display(gh.stepLengthRight,'m',2)}`,'Longueur');metricCard(M+138,77,42,'Variabilité',display(gh.variability,'%',1),'Si disponible');
 box(M,113,CW,23,C.white);label('ASYMÉTRIE GLOBALE',M+7,122);serif(13,'normal',C.deep);doc.text(display(gh.globalAsymmetry,'%',1),M+7,132);label('LSI EMG',M+93,122);serif(13,'normal',C.deep);doc.text(display(gh.lsi,'%',1),M+93,132);
 y=148;const gcols=[0,72,112,146];tableHeader(y,gcols,['PARAMÈTRE','GLOBAL / GAUCHE','DROITE','UNITÉ']);y+=8;for(const r of sensor.gait?.globals||[]){tableRow(y,14,gcols,[r.label,display(r.value,'',r.unit==='pas/min'?0:2),'—',r.unit],{size:5.1,boldFirst:true});y+=14}for(const r of sensor.gait?.bilateral||[]){tableRow(y,14,gcols,[r.label,display(r.left,'',r.unit==='count'?0:3),display(r.right,'',r.unit==='count'?0:3),r.unit],{size:5.1,boldFirst:true});y+=14;if(y>270)break}

 // 5 — Posture
 beginPage('POSTURE','Repères sagittaux et contexte.','La SVA est restituée comme mesure descriptive et reste séparée du calcul sensor-only actuel.');
 metricCard(M,78,54,'SVA',display(posture.svaMm,posture.unit||'mm',1),'Mesure sagittale');metricCard(M+60,78,54,'Contexte',posture.contextClass||'—','Classe de mesure');metricCard(M+120,78,60,'Statut',posture.assessmentStatus||'—',dateFr(posture.recordedAt));
 box(M,121,CW,52,C.white);label('SOURCE & PROTOCOLE',M+7,132);text(`Source : ${posture.source||'—'}`,M+7,144,CW-14,6.6,C.deep,3.5,'bold');text(`Protocole : ${posture.protocolVersion||prov.assessmentProtocol||'—'}`,M+7,156,CW-14,6,C.muted,3.2);text('La mesure est conservée dans le même assessment que les questionnaires, les tests et les données Myodev.',M+7,168,CW-14,5.8,C.muted,3.1);
 label('MESURES CLINIQUES STRUCTURÉES',M,198,C.deep);const clinical=(appendix.measurements||[]).filter(x=>!String(x.indicatorCode||'').startsWith('M-FUN-')).slice(0,5);y=206;if(clinical.length){const ccols=[0,50,92,124,151];tableHeader(y,ccols,['CODE','VALEUR','UNITÉ','SOURCE','QC']);y+=8;for(const r of clinical){tableRow(y,13,ccols,[r.indicatorCode,valueText(r.numericValue??r.textValue??r.rawText),r.unit||'—',compact(r.source,18),qcText(r.qcStatus)],{size:5});y+=13}}else{box(M,y,CW,27,C.white);text('Aucune autre mesure clinique structurée enregistrée.',M+7,y+16,CW-14,6,C.muted,3)}

 // 6 — Muscle
 beginPage('ANALYSE MUSCULAIRE','Activation, coordination, symétrie et endurance.','Capteurs Myodev · données normalisées via le contrat MyoCare.');
 metricCard(M,77,42,'Activation moyenne',display(muscle.activationMean,'%MVC',1));metricCard(M+46,77,42,'Coactivation CCI',display(muscle.coactivationMean,'%',1));metricCard(M+92,77,42,'Symétrie LSI',display(muscle.lsiMean,'%',1));metricCard(M+138,77,42,'Fatigabilité',display(muscle.fatigabilityMean,'%',1));
 metricCard(M,112,42,'Métriques',String(muscle.metricCount??0),`${muscle.validCount??0} valides`);metricCard(M+46,112,42,'QC suspect',String(muscle.suspectCount??0),'à relire');metricCard(M+92,112,42,'QC invalide',String(muscle.invalidCount??0),'non scoré');metricCard(M+138,112,42,'Calibration',String(muscle.calibrationCount??0),'lignes calibrées');
 y=155;for(const r of muscle.groups||[]){box(M,y,CW,34,C.white);label(r.label,M+7,y+9);sans(6,'bold',C.muted);doc.text('Gauche',M+7,y+18);serif(12,'normal',C.deep);doc.text(display(r.left,'%MVC',1),M+7,y+29);sans(6,'bold',C.muted);doc.text('Droite',M+74,y+18);serif(12,'normal',C.deep);doc.text(display(r.right,'%MVC',1),M+74,y+29);sans(6,'bold',C.muted);doc.text('LSI',M+139,y+18);serif(12,'normal',C.deep);const l=(muscle.lsi||[]).find(x=>x.muscle===r.muscle);doc.text(display(l?.value,'%',1),M+139,y+29);y+=40}

 // 7 — Questionnaires
 beginPage('PRÉ-BILAN','Questionnaires & contexte déclaré.','Les questionnaires restent dans le rapport et dans la traçabilité sans modifier le Motion Score.');
 y=78;const qcols=[0,84,117,143,165];tableHeader(y,qcols,['QUESTIONNAIRE','STATUT','COMPL.','RÉP.','SCORE']);y+=8;for(const q of context.questionnaires||[]){tableRow(y,18,qcols,[q.label||q.instrumentCode,q.status==='completed'?'Complété':q.status,`${Math.round(Number(q.completeness||0))}%`,String(q.responseCount??0),q.score===null||q.score===undefined?'—':String(q.score)],{size:5,boldFirst:true});y+=18;if(y>267)break}box(M,260,CW,17,C.sagePale);text(context.note||'Contribution numérique des questionnaires : 0.',M+7,270,CW-14,5.7,C.deep,3);

 // 8 — Agir
 beginPage('ACT','Comprendre, puis agir.','Votre résultat doit conduire à une action simple, puis à une nouvelle mesure au bon moment.');
 y=79;if(priorities.length){for(const p of priorities.slice(0,3)){box(M,y,CW,44,C.white);label(`PRIORITÉ ${p.rank||''}`,M+7,y+9,C.sage);serif(12,'normal',C.deep);doc.text(lines(p.title||'Objectif KŌMØ',92),M+7,y+21);text((p.actions||[]).slice(0,2).join(' · ')||p.firstAction||'À définir avec le professionnel.',M+103,y+16,80,5.6,C.muted,3);text(`Re-mesure : ${p.recheck||'selon le plan de suivi'}`,M+103,y+34,80,5.1,C.deep,2.8,'bold');y+=50}}else{box(M,y,CW,36,C.white);text('Aucune priorité automatique publiée pour ce bilan. La restitution professionnelle reste la prochaine étape.',M+7,y+16,CW-14,6,C.muted,3.2)}
 box(M,242,CW,35,C.sagePale);label('SUIVI',M+7,253,C.deep);text('Votre trajectoire combine ce bilan, les actions décidées avec votre équipe et une re-mesure planifiée pour objectiver l’évolution.',M+7,264,CW-14,5.6,C.deep,3);text(method.disclaimer||'Le Motion Score ne constitue pas à lui seul un diagnostic médical.',M+7,273,CW-14,5.1,C.muted,2.7);

 // 9+ — DONNÉES MYODEV · DÉTAIL COMPLET
 const raw=appendix.sensorMetrics||[];addPagedTable('ANNEXE TECHNIQUE','Données Myodev · détail complet','Chaque métrique de l’acquisition : session, tâche, muscle, côté, métrique, valeur, unité, QC et calibration. Rien n’est masqué.',[0,25,49,78,101,132,155,171],['SESSION','TÂCHE','MUSCLE','CÔTÉ','MÉTRIQUE','VALEUR','QC','CAL.'],raw,{pageRows:17,rowH:11.2,size:4.2,formatter:r=>[compact(r.externalSessionId,18),compact(r.taskCode,19),compact(r.muscleLabel||r.muscleCode,22),sideText(r.side),compact(r.metricCode,25),display(r.value,r.unit,2),qcText(r.qcStatus),compact(r.calibrationId,12)]});

 // Mesures cliniques source
 const measurements=appendix.measurements||[];addPagedTable('ANNEXE TECHNIQUE','Mesures cliniques · source','Mesures normalisées enregistrées dans Pulse, hors table Myodev.',[0,34,74,96,124,151,170],['CODE','VALEUR','UNITÉ','SOURCE','QC','DATE','PROTO'],measurements,{pageRows:18,rowH:11,size:4.4,formatter:r=>[r.indicatorCode,valueText(r.numericValue??r.textValue??r.rawText),r.unit||'—',compact(r.source,19),qcText(r.qcStatus),dateFr(r.recordedAt),compact(r.protocolVersion,15)]});

 // Réponses questionnaires
 const responses=appendix.questionnaireResponses||[];addPagedTable('ANNEXE TECHNIQUE','Réponses questionnaires','Chaque réponse enregistrée reste liée à son instrument, sa version, sa source et son statut.',[0,50,82,119,151,170],['INSTRUMENT','ITEM','RÉPONSE','NORMALISÉ','SOURCE','VÉRIF.'],responses,{pageRows:18,rowH:11,size:4.4,formatter:r=>[compact(r.instrumentLabel||r.instrumentCode,32),r.itemCode,compact(valueText(r.rawValue??r.rawText),31),compact(valueText(r.normalizedValue??r.normalizedText),26),r.source||'—',r.clinicianVerified?'Oui':'Non']});

 // Final — qualité / provenance / validation
 beginPage('QUALITÉ','Provenance & validation.','Version d’algorithme, contrat fournisseur, état de revue et provenance du fichier.');
 const pairs=[['Algorithme',payload.identity?.algorithmVersion||'—'],['Référence',payload.identity?.referenceVersion||'—'],['Statut score',summary.status||'—'],['Publication',summary.releaseStatus||report.status||'—'],['Calculé le',dateTimeFr(prov.scoreCalculatedAt)],['Revu le',dateTimeFr(prov.scoreReviewedAt)],['Publié le',dateTimeFr(prov.scoreReleasedAt)],['Contrat',sensor.contractVersion||'—'],['Fichier source',sensor.sourceFile||'—'],['Version source',sensor.sourceVersion||'—'],['Import',dateTimeFr(sensor.importedAt)],['Hash import',sensor.importHash||'—'],['Assessment',payload.identity?.assessmentId||'—'],['Score ID',payload.identity?.scoreId||'—']];y=79;for(const [k,v] of pairs){label(k,M,y+5,C.muted);text(v,M+57,y+5,123,6.1,C.deep,3.3,k==='Fichier source'?'bold':'normal');rule(y+10);y+=14}
 box(M,244,CW,34,C.warm);label('LIMITES',M+7,255,C.deep);text('Les valeurs manquantes ne sont jamais remplacées par zéro ni estimées. Les données descriptives restent distinctes des données scorées. Toute interprétation médicale relève du professionnel habilité.',M+7,266,CW-14,5.6,C.muted,3);

 // Footer dynamique
 const total=doc.getNumberOfPages();for(let p=1;p<=total;p++){doc.setPage(p);rule(283);sans(4.4,'normal',C.muted);doc.text(patient.displayName||'Patient KŌMØ',M,290);doc.text(`KŌMØ · ${p}/${total}`,105,290,{align:'center'});doc.text(dateTimeFr(payload.generatedAt),R,290,{align:'right'})}
 doc.setProperties({title:`KŌMØ Motion Report — ${patient.displayName||'Patient'}`,subject:'KŌMØ Motion Report · dossier locomoteur complet',author:'KŌMØ',creator:`KŌMØ Pulse · ${VERSION}`});return doc;
}
export async function createMobilityReportPdf(payload,{draft=false}={}){const jsPDF=await ensurePdf();return buildMotionReport(jsPDF,payload,{draft})}
export async function mobilityReportBlob(payload,options={}){const doc=await createMobilityReportPdf(payload,options);const blob=doc.output('blob');if(!blob||blob.size<16000)throw new Error(`PDF anormalement petit (${Math.round((blob?.size||0)/1024)} Ko)`);return{doc,blob}}
export async function downloadMobilityReport(payload,{draft=false,blob=null}={}){let out=blob;if(!out)out=(await mobilityReportBlob(payload,{draft})).blob;const date=new Date(payload.generatedAt||payload.report?.assessmentDate||Date.now()).toISOString().slice(0,10);const version=payload.report?.version?`_v${payload.report.version}`:'';const filename=`KOMO_Motion_Report_${safe(payload.patient?.displayName)}_${date}${version}${draft?'_APERCU':''}.pdf`;const url=URL.createObjectURL(out),a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);return{filename,blob:out}}
if(typeof window!=='undefined')window.KomoMobilityReportPdf={version:VERSION,visualSystem:VISUAL_SYSTEM,create:createMobilityReportPdf,blob:mobilityReportBlob,download:downloadMobilityReport};