import {INTAKE_GROUPS,SCORING_GROUPS,scoreIntake,intakeProgress,questionnaireFocus} from './intake-model.mjs';
import {MOTION_ALGORITHM_VERSION} from './motion-score.mjs';
import {normativeSummary} from './reference-norms.mjs';
import {buildMotionPassport,programProgress,planTargets} from './motion-passport.mjs';

export const PDF_REPORT_VERSION='KOMO_MOTION_PASSPORT_REPORT_V2';
const OBSERVATIONS=[
 ['sts','Lever de chaise - 30 s','repetitions',0],
 ['heels','Elevation des talons','repetitions',0],
 ['unipodal_left','Unipodal gauche','s',1],
 ['unipodal_right','Unipodal droit','s',1],
 ['arms','Elevation des bras','repetitions',0],
 ['posture','Photo sagittale de surface','%',1]
];
const normal=v=>String(v??'').replace(/\u0152/g,'OE').replace(/\u0153/g,'oe')
 .replace(/[\u014c\u014d]/g,'O').replace(/[Øø]/g,'O').replace(/[‐‑–—]/g,'-')
 .replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[\u2022]/g,'-')
 .replace(/[\u2264]/g,'<= ').replace(/[\u2265]/g,'>= ').replace(/[^\u0020-\u007e\u00a0-\u00ff]/g,' ');
const decimal=(v,precision=1)=>Number.isFinite(v)?v.toFixed(precision).replace('.',','):'-';
function answerLabel(question,value){
 if(value===undefined||value===null)return 'Non renseigne';
 if(Array.isArray(question.options[0])){
  return question.options.find(([k])=>String(k)===String(value))?.[1]??'Non renseigne';
 }
 const idx=Number(value);
 return Number.isInteger(idx)&&idx>=0&&idx<question.options.length?question.options[idx]:'Non renseigne';
}
export function buildPdfReportData(answers={},results={},motionScore=null,blocked=false,generatedAt=new Date(),options={}){
 const p=scoreIntake(answers),progress=intakeProgress(answers);
 const groups=INTAKE_GROUPS.map(g=>({
  id:g.id,name:g.title,score:p.domains[g.id]??null,weight:g.weight??null,
  answers:g.questions.map(q=>({question:q.label,answer:answerLabel(q,answers[q.id])}))
 }));
 const observations=OBSERVATIONS.map(([id,label,unit,precision])=>{
  const raw=results[id];
  const valid=raw?.status==='done'||raw?.status==='review';
  const value=valid&&Number.isFinite(raw?.value)?raw.value:null;
  return {id,label,value,display:value===null?'Non realise':decimal(value,precision)+' '+unit,
    status:raw?.status??'missing',source:raw?.source??null,quality:raw?.quality??null,
    commentary:id==='posture'&&valid?'Projection de surface, pas SVA radiographique.':null};
 });
 const scoreValid=!blocked&&p.complete&&motionScore?.complete===true&&
  Number.isInteger(motionScore?.score)&&motionScore.score>=0&&motionScore.score<=100&&
  motionScore.version===MOTION_ALGORITHM_VERSION;
 const motion=scoreValid?{
  complete:true,score:motionScore.score,source:motionScore.source??'',
  weights:motionScore.weights??{sts:.40,tug:.35,sppb:.25},
  subscores:motionScore.subscores??null,version:motionScore.version
 }:{complete:false,score:null,version:MOTION_ALGORITHM_VERSION,
   missing:blocked?['Bilan fonctionnel interrompu pour raisons de securite']:
    !p.complete?['Questionnaire patient incomplet']:motionScore?.missing?.length?
      [...motionScore.missing]:['TUG 3 m et SPPB verifies, percentiles et source normative requis']};
 const date=generatedAt instanceof Date&&!Number.isNaN(generatedAt.getTime())?
  generatedAt.toISOString().slice(0,10):new Date().toISOString().slice(0,10);
 return {
  version:PDF_REPORT_VERSION,date,mode:options?.mode==='PILOTE'?'PILOTE':'DEMONSTRATION',
  passport:buildMotionPassport(answers,results,blocked),
  program:options?.program?.version==='KOMO_PULSE_DAILY_V1'?{progress:programProgress(options.program),startedAt:options.program.startedAt}:null,
  questionnaire:{complete:p.complete,index:p.complete?p.profileIndex:null,
   answered:progress.completed,total:progress.total,domains:SCORING_GROUPS.map(g=>({
    id:g.id,label:g.title,score:p.domains[g.id]??null,weight:g.weight
   })),focus:questionnaireFocus(answers),groups},
  observations,motion,ageReference:normativeSummary(answers,results,results.sts?.normative??{}),blocked:Boolean(blocked),
  limitations:[
   'Bilan fonctionnel non medical - ce rapport ne constitue pas un diagnostic.',
   'Les questionnaires sont propres a KOMO et ne sont pas des instruments cliniquement valides.',
   'Les estimations de la webcam, le comptage et la photo sagittale sont experimentaux.',
   'La photo de surface ne mesure ni C7-S1 ni la SVA radiographique.',
   'Aucune equivalence avec un age locomoteur ou pronostic de longevite.'
  ]
 };
}

// No user data is sent to a server: PDF rendering is performed in the browser.
// The external library module is loaded on the user's download click, and is
// never passed any user data in a URL or request body.
export async function downloadMotionPdf(data){
 if(!data||data.version!==PDF_REPORT_VERSION)throw new Error('invalid_report');
 const {jsPDF}=await import('https://esm.sh/jspdf@4.2.1');
 if(typeof jsPDF!=='function')throw new Error('pdf_engine_unavailable');
 const pdf=new jsPDF({format:'a4',unit:'mm',compress:true});
 const W=210,H=297,M=18,RIGHT=W-M,CONTENT=W-2*M;
 const green=[36,56,76],dark=[37,52,68],gold=[133,156,176],soft=[243,246,248],muted=[95,112,128];
 let y=0;
 const ink=(rgb=dark)=>pdf.setTextColor(...rgb);
 function header(){
  pdf.setFillColor(...green);pdf.rect(0,0,W,38,'F');
  pdf.setFillColor(...gold);pdf.rect(M,35,31,1.5,'F');
  pdf.setFont('helvetica','bold');pdf.setFontSize(21);pdf.setTextColor(250,247,236);
  pdf.text('KOMO',M,19);
  pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.setTextColor(218,228,236);
  pdf.text('LONGEVITY IN MOTION',M,26);
  pdf.text('MOTION ONLINE / '+(data.mode==='PILOTE'?'PASSEPORT PERSONNEL':'DEMONSTRATION'),RIGHT,20,{align:'right'});
  pdf.setTextColor(210,223,233);pdf.text(normal('Date : '+data.date),RIGHT,27,{align:'right'});
  y=49;
 }
 header();
 function nextPage(){pdf.addPage();header();}
 function space(min=15){if(y+min>H-22)nextPage();}
 function line(text,{size=10,bold=false,color=dark,indent=0,width=CONTENT-indent,leading=5.2}={}){
  const safe=normal(text),value=pdf.splitTextToSize(safe,width);
  space(Math.max(9,value.length*leading+3));
  pdf.setFont('helvetica',bold?'bold':'normal');pdf.setFontSize(size);ink(color);
  pdf.text(value,M+indent,y);y+=Math.max(leading,value.length*leading);
  return value.length;
 }
 function title(text){
  space(20);y+=6;pdf.setFillColor(...gold);pdf.rect(M,y-4,7,1,'F');
  pdf.setFont('helvetica','bold');pdf.setFontSize(14);ink(green);
  pdf.text(normal(text),M,y+4);y+=13;
 }
 function subheading(text){
  space(15);y+=3;pdf.setFont('helvetica','bold');pdf.setFontSize(10);
  ink(green);pdf.text(normal(text),M,y);y+=7;
 }
 function row(name,value,small=null){
  space(small?17:12);
  pdf.setDrawColor(217,227,234);pdf.line(M,y+5,RIGHT,y+5);
  pdf.setFont('helvetica','normal');pdf.setFontSize(9.5);ink(dark);
  pdf.text(pdf.splitTextToSize(normal(name),105),M,y);
  pdf.setFont('helvetica','bold');ink(green);pdf.text(normal(value),RIGHT,y,{align:'right'});
  y+=small?11:9;
  if(small)line(small,{size:7.6,color:muted});
 }
 // PAGE 1 - MOTION PASSPORT: an editorial starting point, not a prognosis.
 const passport=data.passport;
 pdf.setFont('helvetica','normal');pdf.setFontSize(8);ink(gold);
 pdf.text('MOTION PASSPORT  /  PREMIER BILAN',M,y);
 y+=12;
 line('Votre mouvement. Votre point de depart.',{size:19,bold:true,color:green,leading:8});
 line('Ce passeport relie vos habitudes, votre ressenti et vos observations fonctionnelles.',{size:8.8,color:muted});
 y+=4;
 space(44);
 pdf.setFillColor(...green);pdf.roundedRect(M,y,CONTENT,44,4,4,'F');
 pdf.setFont('helvetica','normal');pdf.setFontSize(8.6);pdf.setTextColor(231,238,243);
 pdf.text('INDICE DE MOBILITE PERCUE',M+8,y+10);
 pdf.setFont('helvetica','bold');pdf.setFontSize(30);pdf.setTextColor(255,250,236);
 pdf.text(passport.index===null?'--':decimal(passport.index,1),M+8,y+29);
 pdf.setFont('helvetica','normal');pdf.setFontSize(12);pdf.setTextColor(221,232,240);
 pdf.text('/ 100',M+54,y+28);
 pdf.setFontSize(8);pdf.text('OBSERVATIONS : '+passport.measuredCount+'/6',RIGHT-8,y+18,{align:'right'});
 pdf.text('A VERIFIER : '+passport.flaggedCount,RIGHT-8,y+26,{align:'right'});
 y+=50;
 line('Lecture : cet indice resume uniquement votre mobilite percue. Il ne calcule ni votre age biologique ni votre esperance de vie.',
  {size:8.4,color:muted,leading:4.5});
 y+=4;
 subheading('LES 4 DOMAINES DU PASSEPORT');
 for(const d of passport.domains){
  space(17);
  pdf.setFont('helvetica','bold');pdf.setFontSize(10);ink(green);
  pdf.text(normal(d.title),M,y);
  pdf.setFont('helvetica','normal');pdf.setFontSize(8);ink(muted);
  pdf.text(d.value===null?'Non renseigne':decimal(d.value,1)+'/100',RIGHT,y,{align:'right'});
  y+=3;
  pdf.setFillColor(220,231,239);pdf.roundedRect(M,y,CONTENT,3.3,1.5,1.5,'F');
  if(d.value!==null){pdf.setFillColor(99,133,161);pdf.roundedRect(M,y,Math.max(.05,CONTENT*d.value/100),3.3,1.5,1.5,'F');}
  y+=10.2;
 }
 y+=3;
 subheading('A METTRE EN PREMIER SUR VOTRE FEUILLE DE ROUTE');
 const focus=passport.focus??[];
 if(passport.blocked){
  line('Priorite a la securite : bilan complementaire et conseil professionnel avant les exercices autonomes.',
   {size:9.4,color:dark,leading:5.3});
 }else if(!focus.length){
  line('Completez le questionnaire pour identifier des domaines a travailler.',{size:9.2});
 }else{
  for(const d of focus){
   line('- '+d.title+' : '+d.action,{size:9.1,color:dark,leading:5});
  }
 }
 y+=5;
 space(33);
 pdf.setFillColor(...soft);pdf.roundedRect(M,y,CONTENT,25,3,3,'F');
 pdf.setFont('helvetica','bold');pdf.setFontSize(9);ink(green);
 pdf.text('VOTRE PROCHAIN POINT DE CONTROLE',M+6,y+8);
 pdf.setFont('helvetica','normal');pdf.setFontSize(8.3);ink(dark);
 pdf.text(pdf.splitTextToSize('Un nouveau bilan a 4-6 semaines aidera a comparer votre trajectoire sur les memes epreuves.',CONTENT-12),M+6,y+15);
 y+=31;
 line('Retrouvez votre passeport dans votre espace prive : pulse.komolongevity.com',{size:8,color:muted});
 line('KOMO Motion Passport V1 | Interpretation exploratoire non medicale.',{size:7.7,color:muted});
 // PAGE 2 - domain by domain: preserve strengths and discuss changeable habits.
 nextPage();
 title('2. Votre profil, domaine par domaine');
 line('Ces categories sont des reperes de suivi propres a KOMO. Elles ne sont pas des seuils cliniques ni une classification de risque.',
  {size:8.5,color:muted,leading:4.6});
 for(const d of passport.domains){
  space(39);
  pdf.setFont('helvetica','bold');pdf.setFontSize(11);ink(green);
  pdf.text(normal(d.title),M,y);
  pdf.setFontSize(8);ink(muted);
  pdf.text(d.value===null?'--':decimal(d.value,1)+'/100',RIGHT,y,{align:'right'});
  y+=8;
  line(d.label+' - '+d.caption+'.',{size:9.1,bold:true,color:dark,leading:5});
  line(d.why,{size:8.6,color:muted,leading:4.5});
  line('Piste d action : '+d.action,{size:8.7,color:dark,leading:4.7});
  pdf.setDrawColor(215,226,234);pdf.line(M,y+2,RIGHT,y+2);y+=7;
 }
 title('3. Vos priorites');
 if(passport.blocked){
  line('Les mesures ont ete interrompues pour securite. Demandez un avis professionnel avant de demarrer un programme autonome.',{size:9});
 }else for(const d of passport.focus||[]){
  line('- '+d.title+' : '+d.action,{size:9.1,leading:5});
 }
 line('A entretenir : poursuivre les activites deja confortables selon les capacites individuelles.',
  {size:8.5,color:muted,leading:4.7});
 // PAGE 3 - factual measures and bounded Motion Score
 nextPage();
 title('4. Vos observations physiques');
 line('Ces observations sont experimentales. Un resultat marque "a verifier" ne peut pas etre presente comme mesure de reference.',
  {size:8.4,color:muted});
 for(const item of data.observations){
  const quality=item.status==='review'?'Capture a verifier avant interpretation':item.commentary||null;
  row(item.label,item.display,quality);
 }
 title('Reperes selon l age - uniquement si comparables');
 const reference=data.ageReference?.sts;
 if(reference?.reference){
  line('Lever de chaise 30 s : plage centrale de reference '+reference.reference.lower+' a '+
   reference.reference.upper+' repetitions, tranche '+reference.reference.age+' ans.',
    {size:8.9});
  line(reference.comparison||reference.reason,{size:8.6,color:muted});
 }else{
  line('Le Sit-to-Stand ne peut pas etre classe sans age exact, groupe de reference et protocole confirme.',
   {size:8.6,color:muted});
 }
 const one=data.ageReference?.unipodal?.[0];
 if(one?.expected!==null&&one?.expected!==undefined)
  line('Unipodal : donnees publiees '+one.expected+' s (meilleur de trois essais). Notre test webcam de 20 s n est pas directement comparable.',
  {size:8.4,color:muted});
 title('Motion Score fonctionnel - algorithme de reference');
 if(data.motion.complete){
  line(String(data.motion.score)+' / 100',{size:23,bold:true,color:green,leading:12});
  line('Calcul issu de STS 30 s, TUG 3 m et equilibre SPPB, avec mesures, normes et controle de protocole declares.',
  {size:8.6,color:muted});
  line('Source : '+data.motion.source,{size:8.1,color:muted});
 }else{
  line('NON CALCULABLE A CE STADE',{size:13,bold:true,color:green,leading:7});
  for(const missing of data.motion.missing||[])line('- '+missing,{size:8.2,color:muted,leading:4.4});
 }
 line('Aucun Motion Age ni pronostic individuel de longevite n est deduit de ces tests.',
  {size:8.1,color:muted});
 // PAGE 4 - next action: clinic or daily guided follow-up.
 nextPage();
 title('5. Votre feuille de route');
 line('Vos choix : approfondir le bilan ou entretenir vos habitudes de mouvement avec un suivi regulier.',{size:9,color:muted,leading:5});
 line('Les deux suites possibles du bilan',{size:11,bold:true,color:green,leading:6});
 y+=6;
 space(35);
 pdf.setFillColor(...soft);pdf.roundedRect(M,y,CONTENT,31,3,3,'F');
 pdf.setFont('helvetica','bold');pdf.setFontSize(10);ink(green);
 pdf.text('01 / COMPLETER EN CONSULTATION MOTION',M+6,y+9);
 y+=15;
 line('A Paris ou Cannes : analyse instrumentee de la force, des amplitudes et de la marche. Une restitution individualisee permet de confirmer les premieres observations.',
 {size:8.7,indent:6,width:CONTENT-13,leading:5});
 y+=12;
 space(43);
 pdf.setFillColor(...soft);pdf.roundedRect(M,y,CONTENT,34,3,3,'F');
 pdf.setFont('helvetica','bold');pdf.setFontSize(10);ink(green);
 pdf.text('02 / DEMARRER PULSE DAILY',M+6,y+9);
 y+=15;
 line('Une routine de mouvements accessibles, avec journal quotidien, ressenti de l effort et point de controle a 4-6 semaines. Ce parcours ne remplace pas une reeducation prescrite.',
 {size:8.7,indent:6,width:CONTENT-13,leading:5});
 y+=11;
 title('Premier cycle Pulse Daily - 4 semaines');
 if(passport.planStatus!=='eligible'){
  line('Un programme autonome n est pas propose a ce stade : securite, reponses incompletes ou gene importante. Un echange personnalise est prioritaire.',
  {size:9.1,color:dark});
 }else{
  line('La progression ci-dessous est un exemple de routine de bien-etre a adapter. En cas de difficulte, restez a l etape precedente.',
   {size:8.7,color:muted});
  for(let w=1;w<=4;w++){
   const t=planTargets(w);
   line('Semaine '+w+' : marche '+t.walkMinutes+' min; chaise '+t.chairRepeats+
    ' levers possibles; stabilite avec appui '+t.balanceSeconds+' s; mobilite '+t.mobilityMinutes+' min.',
    {size:8.5,leading:5});
  }
 }
 if(data.program){
  y+=5;
  line('Journal Pulse Daily : '+data.program.progress.daysLogged+' jour(s) renseignes sur 28.',
   {size:9,bold:true});
 }
 title('Quand demander un avis ?');
 line('Arretez l exercice en cas de douleur inhabituelle, malaise, essoufflement disproportionne ou instabilite. Contactez un professionnel adapte.',
  {size:8.8,color:dark,leading:5});
 title('Methode et limites');
 for(const phrase of data.limitations)line('- '+phrase,{size:8.0,color:muted,leading:4.3});
 line('Pour revoir votre bilan, connectez-vous a pulse.komolongevity.com puis ouvrez Mon passeport.',{size:8.7,color:dark});
 line('Versions : '+data.version+' / '+data.motion.version,{size:7.5,color:muted});
 // Include the full original patient responses, with automatic pagination.
 nextPage();title('6. Detail des reponses');
 line('Appendice - questionnaire original KOMO rempli par le participant.',{size:8.4,color:muted});
 for(const group of data.questionnaire.groups){
  subheading(group.name);
  for(const item of group.answers){
   const questionLines=pdf.splitTextToSize(normal(item.question),CONTENT-10);
   const answerLines=pdf.splitTextToSize(normal(item.answer),CONTENT-15);
   const h=questionLines.length*4.5+answerLines.length*4.3+4;
   space(h+3);
   pdf.setFont('helvetica','normal');pdf.setFontSize(8.6);ink(dark);
   pdf.text(questionLines,M+2,y);y+=questionLines.length*4.5;
   pdf.setFont('helvetica','bold');pdf.setFontSize(8.3);ink(green);
   pdf.text(answerLines,M+5,y);y+=answerLines.length*4.3+4;
   pdf.setDrawColor(231,235,239);pdf.line(M,y,RIGHT,y);y+=4;
  }
 }
 const count=pdf.getNumberOfPages();
 for(let i=1;i<=count;i++){
  pdf.setPage(i);pdf.setDrawColor(214,225,234);pdf.line(M,H-17,RIGHT,H-17);
  pdf.setFont('helvetica','normal');pdf.setFontSize(7.5);ink(muted);
  pdf.text('KOMO MOTION  /  DOCUMENT EXPERIMENTAL NON MEDICAL',M,H-12);
  pdf.text(i+' / '+count,RIGHT,H-12,{align:'right'});
 }
 const filename='KOMO_Motion_Rapport_'+data.date+'.pdf';
 pdf.save(filename);
 return filename;
}
