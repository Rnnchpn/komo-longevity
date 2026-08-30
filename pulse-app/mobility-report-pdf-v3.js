const VERSION='4.0.0';
const VISUAL_SYSTEM='komo-luxury-complete-2026';
const ENGINE_URLS=['https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js','https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.2/jspdf.umd.min.js'];
const C={paper:[249,248,244],paper2:[244,242,236],white:[255,255,253],ink:[24,28,25],deep:[36,55,45],muted:[107,112,107],line:[218,214,205],sage:[105,126,112],sage2:[139,154,142],sagePale:[235,241,235],sand:[239,235,226],warm:[247,241,231],amber:[157,128,65],amberPale:[250,244,229],rose:[139,87,76],rosePale:[249,237,234]};
let enginePromise=null;
function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function clamp(v,a=0,b=100){return Math.min(b,Math.max(a,v))}
function safe(v){return String(v||'patient').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,72)||'patient'}
function frDate(v){if(!v)return'—';const d=new Date(v);return Number.isNaN(d.getTime())?'—':new Intl.DateTimeFormat('fr-FR',{day:'numeric',month:'long',year:'numeric'}).format(d)}
function frDateTime(v){if(!v)return'';const d=new Date(v);return Number.isNaN(d.getTime())?'':new Intl.DateTimeFormat('fr-FR',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(d)}
function compact(v,max=150){const s=String(v??'').trim();return s.length>max?s.slice(0,max-1).trim()+'…':s}
function loadScript(src){return new Promise((resolve,reject)=>{if(window.jspdf?.jsPDF)return resolve();const s=document.createElement('script');s.src=src;s.async=true;s.crossOrigin='anonymous';s.onload=resolve;s.onerror=()=>reject(new Error('script_load_failed'));document.head.appendChild(s)})}
async function ensurePdf(){if(window.jspdf?.jsPDF)return window.jspdf.jsPDF;if(enginePromise)return enginePromise;enginePromise=(async()=>{let last;for(const u of ENGINE_URLS){try{await loadScript(u);if(window.jspdf?.jsPDF)return window.jspdf.jsPDF}catch(e){last=e}}throw last||new Error('Moteur PDF indisponible')})();try{return await enginePromise}catch(e){enginePromise=null;throw e}}
function tone(status='descriptive'){return status==='favorable'?{ink:C.deep,fill:C.sagePale,bar:C.sage}:status==='watch'?{ink:C.amber,fill:C.amberPale,bar:C.amber}:status==='priority'||status==='review'?{ink:C.rose,fill:C.rosePale,bar:C.rose}:{ink:C.muted,fill:C.paper2,bar:C.sage2}}
function displayMetric(m){if(!m)return'—';return m.display||m.displayValue||((n(m.value)!==null)?String(m.value):'—')}
function metricById(payload,id){return(payload.keyMetrics||[]).find(m=>m.id===id)||null}
function domainById(payload,id){return(payload.domains||[]).find(d=>d.id===id)||null}

function buildLuxuryReport(jsPDF,payload,{draft=false}={}){
  const doc=new jsPDF({unit:'mm',format:'a4',orientation:'portrait',compress:true,putOnlyUsedFonts:true});
  const W=210,H=297,M=16,R=194,CW=178;
  const setText=(c=C.ink)=>doc.setTextColor(...c),setFill=c=>doc.setFillColor(...c),setDraw=(c=C.line)=>doc.setDrawColor(...c);
  const sans=(size=8,style='normal',color=C.ink)=>{doc.setFont('helvetica',style);doc.setFontSize(size);setText(color)};
  const serif=(size=20,style='normal',color=C.ink)=>{doc.setFont('times',style);doc.setFontSize(size);setText(color)};
  const lines=(text,width)=>doc.splitTextToSize(String(text??'—'),width);
  const rule=(y,x1=M,x2=R,color=C.line,width=.22)=>{setDraw(color);doc.setLineWidth(width);doc.line(x1,y,x2,y)};
  const fillPage=(color=C.paper)=>{setFill(color);doc.rect(0,0,W,H,'F')};
  const textBlock=(text,x,y,width,size=7,color=C.ink,leading=3.8,style='normal')=>{sans(size,style,color);const l=lines(text,width);doc.text(l,x,y);return y+l.length*leading};
  const label=(text,x,y,color=C.muted)=>{sans(5.2,'bold',color);doc.text(String(text||'').toUpperCase(),x,y)};
  const pageHeader=(page,title='MOBILITY REPORT')=>{sans(8,'bold',C.deep);doc.text('KŌMØ',M,12);sans(4.6,'normal',C.muted);doc.text(title,M+23,12);sans(5,'normal',C.muted);doc.text(String(page).padStart(2,'0'),R,12,{align:'right'});rule(16)};
  const pageFooter=(page)=>{rule(282);sans(4.5,'normal',C.muted);doc.text(payload.patient?.displayName||'Patient KŌMØ',M,289);doc.text(`KŌMØ · ${page}/10`,105,289,{align:'center'});const stamp=frDateTime(payload.generatedAt);doc.text(stamp?`Actualisé ${stamp}`:'',R,289,{align:'right'})};
  const sectionTitle=(kicker,title,sub='')=>{label(kicker,M,29,C.sage);serif(27,'normal',C.deep);doc.text(lines(title,145),M,41);if(sub)textBlock(sub,M,58,150,7,C.muted,3.8)};
  const statusPill=(text,x,y,status='descriptive',width=30)=>{const t=tone(status);setFill(t.fill);doc.roundedRect(x,y,width,8,4,4,'F');sans(4.8,'bold',t.ink);doc.text(compact(text||'Descriptif',26).toUpperCase(),x+width/2,y+5.2,{align:'center'})};
  const scoreBar=(x,y,w,score,status='descriptive')=>{setFill(C.sand);doc.roundedRect(x,y,w,2.2,1.1,1.1,'F');const v=n(score);if(v!==null){setFill(tone(status).bar);doc.roundedRect(x,y,w*clamp(v)/100,2.2,1.1,1.1,'F')}};
  const boxed=(x,y,w,h,fill=C.white)=>{setFill(fill);setDraw(C.line);doc.roundedRect(x,y,w,h,3.5,3.5,'FD')};
  const addPage=()=>{doc.addPage();fillPage()};

  const patient=payload.patient||{},summary=payload.summary||{},domains=payload.domains||[],score=n(summary.score),fa=summary.functionalAge||{};
  const strengths=(summary.strengths||[]).slice(0,3),priorityFindings=(summary.priorityFindings||[]).slice(0,3),priorities=(payload.priorities||[]).slice(0,3);

  // PAGE 1 — COVER
  fillPage(C.paper);
  setFill(C.deep);doc.rect(0,0,W,10,'F');
  sans(13,'bold',C.deep);doc.text('KŌMØ',M,32);sans(5.3,'normal',C.muted);doc.text('MOBILITY REPORT',M+33,32);
  rule(40);
  label('VOTRE BILAN DE MOBILITÉ',M,62,C.sage);
  serif(37,'normal',C.deep);doc.text(['Votre mobilité,','clarifiée.'],M,83);
  textBlock('Comprendre votre profil, vos priorités et les prochaines étapes de votre trajectoire locomotrice.',M,120,118,9,C.ink,5);
  setFill(C.sagePale);doc.roundedRect(M,151,82,49,4,4,'F');
  label('PATIENT',M+7,163);serif(16,'normal',C.deep);doc.text(lines(patient.displayName||'Patient KŌMØ',67),M+7,174);sans(6,'normal',C.muted);doc.text(patient.age!=null?`${patient.age} ans`:'Âge non renseigné',M+7,191);
  boxed(105,151,89,49,C.white);label('ÉVALUATION',112,163);serif(12,'normal',C.deep);doc.text(frDate(payload.report?.assessmentDate),112,175);sans(5.8,'normal',C.muted);doc.text(lines(payload.report?.practitionerName||'Professionnel KŌMØ',72),112,186);
  label('KŌMØ · LONGEVITY IN MOTION',M,246,C.deep);textBlock('Mesurer aujourd’hui. Préserver demain.',M,256,100,7,C.muted,4);
  if(draft||payload.report?.status!=='released')statusPill('APERÇU À VALIDER',M,268,'watch',43);else statusPill(`VERSION ${payload.report?.version||'—'} · OFFICIEL`,M,268,'favorable',49);
  sans(4.4,'normal',C.muted);doc.text('Ce rapport accompagne la restitution professionnelle et ne remplace pas une consultation médicale.',R,273,{align:'right'});
  pageFooter(1);

  // PAGE 2 — SNAPSHOT
  addPage();pageHeader(2);sectionTitle('EN UN REGARD','Votre identité locomotrice.','L’essentiel de votre bilan, lisible en moins de trente secondes.');
  setFill(C.deep);doc.roundedRect(M,76,70,57,4,4,'F');label('KŌMØ SCORE',M+7,88,C.sage2);serif(38,'normal',C.white);doc.text(score===null?'—':String(Math.round(score)),M+7,111);sans(8,'normal',C.white);if(score!==null)doc.text('/100',M+43,111);sans(5.6,'normal',C.sage2);doc.text(lines(summary.interpretation||'Profil locomoteur',55),M+7,122);
  boxed(92,76,48,57,C.white);label('ÂGE ACTUEL',99,88);serif(27,'normal',C.deep);doc.text(patient.age==null?'—':String(patient.age),99,109);sans(7,'normal',C.ink);if(patient.age!=null)doc.text('ans',116,109);textBlock('Votre âge chronologique.',99,121,34,5.2,C.muted,2.8);
  boxed(146,76,48,57,C.white);label('ESTIMATION FONCTIONNELLE',153,88);serif(27,'normal',C.deep);const fAge=fa.status==='available'&&n(fa.age)!==null?Math.round(fa.age):null;doc.text(fAge===null?'—':String(fAge),153,109);sans(7,'normal',C.ink);if(fAge!==null)doc.text('ans',170,109);textBlock(fAge===null?'Non disponible avec les données actuelles.':'Estimation fonctionnelle KŌMØ.',153,121,34,5.2,C.muted,2.8);
  textBlock(summary.sentence||'Votre profil de mobilité est résumé à partir des données disponibles.',M,147,CW,8,C.ink,4.3);
  const cols=[M,76,136],titles=[['VOS FORCES',strengths],['À TRAVAILLER',priorityFindings],['PROCHAINE ÉTAPE',priorities.slice(0,2)]];
  cols.forEach((x,i)=>{label(titles[i][0],x,170,i===1?C.amber:C.sage);rule(175,x,x+50);const arr=titles[i][1];for(let j=0;j<Math.min(i===2?2:3,arr.length||0);j++){const item=arr[j];const yy=185+j*22;serif(8.6,'normal',C.deep);doc.text(lines(compact(item.title||item.goal||'À définir',45),45),x,yy);textBlock(compact(item.message||item.why||item.firstAction||'',80),x,yy+7,45,5.3,C.muted,2.8)}});
  label('VOTRE PROFIL · 6 DIMENSIONS',M,248,C.deep);const dw=CW/6;domains.slice(0,6).forEach((d,i)=>{const x=M+i*dw;label(compact(d.label,18),x,259);serif(14,'normal',C.deep);doc.text(n(d.score)===null?'—':String(Math.round(d.score)),x,270);scoreBar(x,275,dw-5,d.score,d.status)});pageFooter(2);

  // PAGE 3 — DOMAINS
  addPage();pageHeader(3);sectionTitle('VOTRE PROFIL','Six dimensions, une lecture simple.','Chaque dimension rassemble les données disponibles dans Pulse. Les domaines non scorés restent explicitement descriptifs.');
  let y=79;domains.slice(0,6).forEach((d,i)=>{boxed(M,y,CW,27,i%2?C.paper:C.white);label(d.label,M+6,y+8);serif(18,'normal',C.deep);doc.text(n(d.score)===null?'—':String(Math.round(d.score)),M+6,y+20);if(n(d.score)!==null){sans(5,'normal',C.muted);doc.text('/100',M+20,y+20)}scoreBar(M+35,y+12,56,d.score,d.status);statusPill(d.statusLabel||'Descriptif',M+99,y+9,d.status,30);textBlock(compact(d.interpretation||'Mesure suivie dans le temps.',145),M+134,y+8,53,5.6,C.muted,3);y+=31});
  boxed(M,271,CW,7,C.sagePale);sans(5.1,'bold',C.deep);doc.text('Un score élevé ne remplace pas l’analyse clinique : la trajectoire et la cohérence des mesures restent essentielles.',105,275.7,{align:'center'});pageFooter(3);

  // PAGE 4 — KEY METRICS
  addPage();pageHeader(4);sectionTitle('VOS DONNÉES ESSENTIELLES','Les chiffres qui comptent le plus.','Pour chaque repère : votre valeur, son statut actuel et ce qu’elle signifie dans le contexte du protocole utilisé.');
  const km=(payload.keyMetrics||[]).slice(0,6);for(let i=0;i<6;i++){const m=km[i]||{label:['Vitesse de marche','Symétrie de marche','Stand-Up Test','Two-Step Test','SVA','Biologie'][i],display:'—',status:'descriptive',statusLabel:'Non disponible',message:'Donnée non disponible.'};const col=i%2,row=Math.floor(i/2),x=M+col*91,y0=82+row*55;boxed(x,y0,86,47,C.white);label(m.label,x+6,y0+9);serif(17,'normal',C.deep);doc.text(lines(displayMetric(m),50),x+6,y0+23);statusPill(m.statusLabel||'Descriptif',x+51,y0+8,m.status,28);textBlock(compact(m.message||m.reference||'Mesure descriptive.',115),x+6,y0+33,73,5.5,C.muted,2.9)}
  boxed(M,253,CW,22,C.warm);label('À RETENIR',M+7,262,C.deep);textBlock('Les repères affichés dépendent du protocole, de la qualité de mesure et des références disponibles. Les détails méthodologiques restent accessibles dans Pulse et la traçabilité du bilan.',M+37,262,149,5.8,C.muted,3.1);pageFooter(4);

  // PAGE 5 — MUSCLE
  addPage();pageHeader(5);sectionTitle('ANALYSE MUSCULAIRE','Votre signature musculaire.','Lecture bilatérale des groupes musculaires disponibles. Les valeurs restent interprétées avec le même protocole et la même calibration.');
  const rows=payload.muscle?.rows||[];boxed(M,78,CW,92,C.white);label('ACTIVATION BILATÉRALE',M+7,89);let my=103;rows.slice(0,3).forEach(r=>{serif(10,'normal',C.deep);doc.text(r.label||r.id,M+7,my);const l=n(r.left),rr=n(r.right),mx=Math.max(1,l||0,rr||0);sans(5.3,'normal',C.muted);doc.text(`G ${l===null?'—':l}${l===null?'':' %MVC'}`,M+58,my);doc.text(`D ${rr===null?'—':rr}${rr===null?'':' %MVC'}`,M+113,my);setFill(C.sand);doc.roundedRect(M+58,my+4,48,3,1.5,1.5,'F');doc.roundedRect(M+113,my+4,48,3,1.5,1.5,'F');if(l!==null){setFill(C.sage);doc.roundedRect(M+58,my+4,48*clamp(l/mx*100)/100,3,1.5,1.5,'F')}if(rr!==null){setFill(C.sage2);doc.roundedRect(M+113,my+4,48*clamp(rr/mx*100)/100,3,1.5,1.5,'F')}my+=24});
  const muscleKpis=[['SYMÉTRIE',payload.muscle?.symmetryIndex,'%'],['COACTIVATION CCI',payload.muscle?.cci,'%'],['FATIGABILITÉ',payload.muscle?.fatigueDrift,'%']];muscleKpis.forEach((k,i)=>{const x=M+i*60;boxed(x,180,55,31,i===0?C.sagePale:C.paper);label(k[0],x+6,190);serif(16,'normal',C.deep);const v=n(k[1]);doc.text(v===null?'—':`${Math.round(v*10)/10}${k[2]}`,x+6,204)});
  const narratives=[['CE QUE NOUS OBSERVONS',payload.muscle?.observation],['CE QUE CELA SIGNIFIE',payload.muscle?.meaning],['CE QUE NOUS ALLONS TRAVAILLER',payload.muscle?.action]];narratives.forEach((it,i)=>{const y0=224+i*18;label(it[0],M,y0,i===2?C.amber:C.sage);textBlock(compact(it[1]||'À interpréter avec votre professionnel.',150),M+58,y0,129,5.7,C.muted,3)});pageFooter(5);

  // PAGE 6 — GAIT
  addPage();pageHeader(6);sectionTitle('MARCHE & STABILITÉ','Votre mouvement, en situation.','La marche est l’expression intégrée de la mobilité, de la force, du contrôle et de l’équilibre.');
  const g=payload.gait||{},speed=displayMetric(g.speed);setFill(C.deep);doc.roundedRect(M,78,76,58,4,4,'F');label('VITESSE DE MARCHE',M+7,90,C.sage2);serif(30,'normal',C.white);doc.text(speed,M+7,115);sans(5.5,'normal',C.sage2);doc.text(g.speed?.statusLabel||'Repère actuel',M+7,126);
  const gaitCards=[['CADENCE',n(g.cadence)!==null?`${Math.round(g.cadence)} pas/min`:'—'],['DOUBLE APPUI',n(g.doubleSupport)!==null?`${Math.round(g.doubleSupport*10)/10} %`:'—'],['STABILITÉ',n(g.stabilityScore)!==null?`${Math.round(g.stabilityScore)}/100`:'—']];gaitCards.forEach((it,i)=>{const x=99+i*32;boxed(x,78,29,58,C.white);label(it[0],x+4,91);serif(10.5,'normal',C.deep);doc.text(lines(it[1],22),x+4,110)});
  boxed(M,151,CW,42,C.sagePale);label('CE QUE CELA SIGNIFIE',M+7,162,C.deep);textBlock(g.meaning||'Paramètres de marche suivis longitudinalement avec le même protocole.',M+7,173,CW-14,7,C.ink,3.8);
  boxed(M,204,CW,42,C.warm);label('POINT D’ATTENTION',M+7,215,C.amber);textBlock(g.attention||'Entretenir les capacités musculaires et fonctionnelles qui soutiennent la marche.',M+7,226,CW-14,7,C.ink,3.8);
  label('OBJECTIF',M,264,C.sage);textBlock('Préserver une marche efficace et reproductible, puis suivre son évolution avec le même protocole de mesure.',M+30,264,157,6,C.muted,3.2);pageFooter(6);

  // PAGE 7 — POSTURE + FUNCTION
  addPage();pageHeader(7);sectionTitle('POSTURE & TESTS','Votre capacité fonctionnelle.','Posture, lever de chaise, amplitude de pas et équilibre complètent la lecture de votre mobilité.');
  const post=payload.posture||{},sva=post.sva||metricById(payload,'sva');setFill(C.deep);doc.roundedRect(M,78,78,52,4,4,'F');label('POSTURE',M+7,90,C.sage2);serif(25,'normal',C.white);doc.text(n(post.score)===null?'—':`${Math.round(post.score)}/100`,M+7,111);sans(5.5,'normal',C.sage2);doc.text(`SVA · ${displayMetric(sva)}`,M+7,122);
  boxed(101,78,93,52,C.white);label('INTERPRÉTATION',108,90);textBlock(post.interpretation||'La posture est suivie de manière descriptive dans la version actuelle.',108,102,79,6,C.muted,3.2);
  const f=payload.functional||{};const tests=[['STAND-UP',displayMetric(f.standUp),f.standUp?.statusLabel],['TWO-STEP',displayMetric(f.twoStep),f.twoStep?.statusLabel],['CHAIR STAND',displayMetric(f.chairStand),f.chairStand?.statusLabel],['QUESTIONNAIRE LOCOMOTEUR',displayMetric(f.locomotorQuestionnaire),f.locomotorQuestionnaire?.statusLabel],['ÉQUILIBRE UNIPODAL',f.singleLegBalance?.display||'—','Descriptif']];tests.forEach((t,i)=>{const col=i%2,row=Math.floor(i/2),x=M+col*91,y0=148+row*39;boxed(x,y0,86,32,C.white);label(t[0],x+6,y0+9);serif(13,'normal',C.deep);doc.text(lines(t[1],45),x+6,y0+22);sans(4.6,'bold',C.muted);doc.text(compact(t[2]||'Descriptif',24).toUpperCase(),x+56,y0+22,{align:'center'})});
  pageFooter(7);

  // PAGE 8 — PRIORITIES
  addPage();pageHeader(8);sectionTitle('VOS PRIORITÉS','Trois leviers. Pas davantage.','Le rapport hiérarchise les axes de progression pour transformer les résultats en actions compréhensibles et mesurables.');
  for(let i=0;i<3;i++){const p=priorities[i]||{rank:i+1,title:'À définir avec votre professionnel',why:'Aucune priorité automatique validée pour cet axe.',firstAction:'À définir lors de la restitution.',recheck:'Selon le plan de suivi'};const y0=83+i*60;setFill(i===0?C.deep:C.white);setDraw(C.line);doc.roundedRect(M,y0,CW,51,4,4,i===0?'F':'FD');serif(26,'normal',i===0?C.sage2:C.sage);doc.text(String(i+1).padStart(2,'0'),M+7,y0+18);label('PRIORITÉ',M+29,y0+11,i===0?C.sage2:C.muted);serif(13,'normal',i===0?C.white:C.deep);doc.text(lines(compact(p.title,70),70),M+29,y0+23);label('POURQUOI',M+105,y0+11,i===0?C.sage2:C.muted);textBlock(compact(p.why,125),M+105,y0+20,80,5.5,i===0?C.white:C.muted,2.9);label('PREMIÈRE ACTION',M+29,y0+39,i===0?C.sage2:C.sage);sans(5.5,'bold',i===0?C.white:C.deep);doc.text(lines(compact(p.firstAction,85),68),M+58,y0+39)}
  pageFooter(8);

  // PAGE 9 — 90 DAYS
  addPage();pageHeader(9);sectionTitle('LES 90 PROCHAINS JOURS','Votre trajectoire commence maintenant.','Le plan reste volontairement simple : mise en route, consolidation, progression.');
  const plan=payload.plan90||[];for(let i=0;i<3;i++){const m=plan[i]||{month:i+1,title:['Mise en route','Consolidation','Progression'][i],focus:'Suivi du plan KŌMØ',actions:['Poursuivre les objectifs validés avec votre professionnel.']};const y0=85+i*56;label(`MOIS ${i+1}`,M,y0,C.sage);serif(16,'normal',C.deep);doc.text(m.title||'Suivi',M,y0+12);setFill(i===0?C.sagePale:C.paper2);doc.roundedRect(M+48,y0-8,146,43,4,4,'F');label('FOCUS',M+55,y0+3);serif(9.5,'normal',C.deep);doc.text(lines(compact(m.focus,70),62),M+55,y0+14);label('ACTIONS',M+124,y0+3);const acts=(m.actions||[]).slice(0,3);acts.forEach((a,j)=>{setFill(C.sage);doc.circle(M+127,y0+12+j*8,1,'F');sans(5.4,'normal',C.muted);doc.text(lines(compact(a,70),56),M+131,y0+14+j*8)})}
  boxed(M,257,CW,19,C.warm);label('RÈGLE DE SUIVI',M+7,266,C.amber);textBlock('Régularité avant intensité. La progression est réévaluée selon la tolérance, la qualité des mesures et les objectifs validés avec votre professionnel.',M+45,266,140,5.6,C.muted,3);pageFooter(9);

  // PAGE 10 — TRAJECTORY
  addPage();pageHeader(10);sectionTitle('SUIVI & TRAJECTOIRE','Mesurer. Agir. Re-mesurer.','La valeur du bilan apparaît dans le temps : mêmes protocoles, mêmes repères, progression objectivable.');
  const tr=payload.trajectory||{};setFill(C.deep);doc.roundedRect(M,82,55,49,4,4,'F');label('AUJOURD’HUI',M+7,93,C.sage2);serif(28,'normal',C.white);doc.text(n(tr.currentScore)===null?'—':`${Math.round(tr.currentScore)}`,M+7,115);sans(6,'normal',C.white);if(n(tr.currentScore)!==null)doc.text('/100',M+32,115);
  boxed(77,82,55,49,C.white);label('PROCHAIN OBJECTIF',84,93);serif(12,'normal',C.deep);doc.text(lines(tr.nextTargetLabel||'À définir avec votre professionnel',42),84,108);
  boxed(139,82,55,49,C.sagePale);label('PROCHAIN CONTRÔLE',146,93);serif(12,'normal',C.deep);doc.text(lines(tr.nextReview||'Selon le plan de suivi',41),146,108);
  label('CE QUE NOUS RE-MESURERONS',M,154,C.deep);rule(160);const items=(tr.recheckItems||[]).slice(0,4);for(let i=0;i<4;i++){const text=items[i]||['Mobilité','Fonction musculaire','Marche','Posture'][i];const y0=174+i*18;serif(13,'normal',C.sage);doc.text(String(i+1).padStart(2,'0'),M,y0);sans(7,'normal',C.ink);doc.text(compact(text,55),M+18,y0)}
  boxed(107,168,87,70,C.white);label('EN PRATIQUE',114,180,C.sage);textBlock(tr.followUp||'Réaliser le contrôle avec le même protocole pour mesurer l’évolution.',114,192,73,7,C.ink,3.8);label('VALIDATION',114,218,C.muted);textBlock(payload.clinical?.safetyGate||'Validation professionnelle requise avant restitution.',114,227,73,5.4,C.muted,2.8);
  rule(251);label('MÉTHODE',M,261,C.muted);sans(4.9,'normal',C.muted);doc.text(lines(`Algorithme ${payload.identity?.algorithmVersion||'—'} · Références ${payload.identity?.referenceVersion||'—'} · Données ${payload.report?.dataClassification||'clinical'}`,CW),M,270);sans(4.6,'normal',C.muted);doc.text('Les estimations fonctionnelles ne constituent pas un âge biologique épigénétique. Toute interprétation finale relève du professionnel qui valide le bilan.',M,278);pageFooter(10);

  doc.setProperties({title:`KŌMØ Mobility Report — ${patient.displayName||'Patient'}`,subject:'KŌMØ Mobility Report · restitution locomotrice',author:'KŌMØ',creator:`KŌMØ Pulse · ${VERSION}`});
  return doc;
}

export async function createMobilityReportPdf(payload,{draft=false}={}){const jsPDF=await ensurePdf();return buildLuxuryReport(jsPDF,payload,{draft})}
export async function mobilityReportBlob(payload,options={}){const doc=await createMobilityReportPdf(payload,options);const blob=doc.output('blob');if(!blob||blob.size<12000)throw new Error(`PDF anormalement petit (${Math.round((blob?.size||0)/1024)} Ko)`);return{doc,blob}}
export async function downloadMobilityReport(payload,{draft=false,blob=null}={}){let out=blob;if(!out)out=(await mobilityReportBlob(payload,{draft})).blob;const date=new Date(payload.generatedAt||payload.report?.assessmentDate||Date.now()).toISOString().slice(0,10);const version=payload.report?.version?`_v${payload.report.version}`:'';const filename=`KOMO_Mobility_Report_LUXURY_${safe(payload.patient?.displayName)}_${date}${version}${draft?'_APERCU':''}.pdf`;const url=URL.createObjectURL(out),a=document.createElement('a');a.href=url;a.download=filename;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);return{filename,blob:out}}
if(typeof window!=='undefined')window.KomoMobilityReportPdf={version:VERSION,visualSystem:VISUAL_SYSTEM,create:createMobilityReportPdf,blob:mobilityReportBlob,download:downloadMobilityReport};