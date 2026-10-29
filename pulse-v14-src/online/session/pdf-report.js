import {INTAKE_GROUPS,SCORING_GROUPS,scoreIntake,intakeProgress,questionnaireFocus} from './intake-model.mjs';
import {MOTION_ALGORITHM_VERSION} from './motion-score.mjs';
import {normativeSummary} from './reference-norms.mjs';

export const PDF_REPORT_VERSION='KOMO_MOTION_REPORT_V1';
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
export function buildPdfReportData(answers={},results={},motionScore=null,blocked=false,generatedAt=new Date()){
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
  version:PDF_REPORT_VERSION,date,mode:'DEMONSTRATION',
  questionnaire:{complete:p.complete,index:p.complete?p.profileIndex:null,
   answered:progress.completed,total:progress.total,domains:SCORING_GROUPS.map(g=>({
    id:g.id,label:g.title,score:p.domains[g.id]??null,weight:g.weight
   })),focus:questionnaireFocus(answers),groups},
  observations,motion,ageReference:normativeSummary(answers,results,results.sts?.normative??{}),blocked:Boolean(blocked),
  limitations:[
   'Bilan fonctionnel non medical - cette demonstration ne constitue pas un diagnostic.',
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
 const green=[36,35,36],dark=[35,33,32],gold=[184,155,106],soft=[247,242,234],muted=[110,106,101];
 let y=0;
 const ink=(rgb=dark)=>pdf.setTextColor(...rgb);
 function header(){
  pdf.setFillColor(...green);pdf.rect(0,0,W,38,'F');
  pdf.setFillColor(...gold);pdf.rect(M,35,31,1.5,'F');
  pdf.setFont('times','bold');pdf.setFontSize(24);pdf.setTextColor(250,247,239);
  pdf.text('KOMO',M,19);
  pdf.setFont('helvetica','normal');pdf.setFontSize(8);pdf.setTextColor(212,225,207);
  pdf.text('LONGEVITY IN MOTION',M,26);
  pdf.text('MOTION ONLINE  /  RAPPORT DE DEMONSTRATION',RIGHT,20,{align:'right'});
  pdf.setTextColor(206,222,208);pdf.text(normal('Date : '+data.date),RIGHT,27,{align:'right'});
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
  pdf.setFont('times','bold');pdf.setFontSize(18);ink(green);
  pdf.text(normal(text),M,y+4);y+=13;
 }
 function subheading(text){
  space(15);y+=3;pdf.setFont('helvetica','bold');pdf.setFontSize(10);
  ink(green);pdf.text(normal(text),M,y);y+=7;
 }
 function row(name,value,small=null){
  space(small?17:12);
  pdf.setDrawColor(230,220,206);pdf.line(M,y+5,RIGHT,y+5);
  pdf.setFont('helvetica','normal');pdf.setFontSize(9.5);ink(dark);
  pdf.text(pdf.splitTextToSize(normal(name),105),M,y);
  pdf.setFont('helvetica','bold');ink(green);pdf.text(normal(value),RIGHT,y,{align:'right'});
  y+=small?11:9;
  if(small)line(small,{size:7.6,color:muted});
 }
 // Executive first page
 line('VOTRE BILAN EN MOUVEMENT',{size:17,bold:true,color:green,leading:8});
 line('Scores, questionnaires et observations fonctionnelles.',{color:muted,size:9});
 y+=4;
 if(data.blocked){
  pdf.setFillColor(250,240,232);pdf.roundedRect(M,y,CONTENT,13,2,2,'F');
  ink([132,85,63]);pdf.setFont('helvetica','bold');pdf.setFontSize(9);
  pdf.text('Tests suspendus pour raisons de securite.',M+4,y+8.5);y+=19;
 }
 space(28);
 pdf.setFillColor(...soft);pdf.roundedRect(M,y,CONTENT,30,3,3,'F');
 pdf.setFont('helvetica','normal');pdf.setFontSize(8);ink(muted);
 pdf.text('INDICE DE PROFIL DECLARE',M+7,y+9);
 pdf.setFont('helvetica','bold');pdf.setFontSize(25);ink(green);
 pdf.text(data.questionnaire.index===null?'NON CALCULABLE':
  decimal(data.questionnaire.index,1)+' / 100',M+7,y+23);
 pdf.setFont('helvetica','normal');pdf.setFontSize(8.5);ink(muted);
 pdf.text('Reponses : '+data.questionnaire.answered+' / '+data.questionnaire.total,RIGHT-7,y+18,{align:'right'});
 y+=37;
 line('Cet indice est uniquement declaratif. Il ne constitue pas le Motion Score.',{size:8.3,color:muted});
 title('1. Vos questionnaires');
 for(const g of data.questionnaire.domains){
  space(17);
  pdf.setFont('helvetica','normal');pdf.setFontSize(9.5);ink(dark);
  pdf.text(normal(g.label),M,y);
  pdf.setFont('helvetica','bold');ink(green);pdf.text(g.score===null?'Incomplet':
   decimal(g.score,1)+'/100',RIGHT,y,{align:'right'});
  y+=4.2;
  pdf.setFillColor(237,230,220);pdf.roundedRect(M,y,CONTENT,3,1.5,1.5,'F');
  if(g.score!==null){pdf.setFillColor(...gold);pdf.roundedRect(M,y,Math.max(.01,CONTENT*g.score/100),3,1.5,1.5,'F');}
  y+=11;
 }
 if(data.questionnaire.focus?.length){
  const items=data.questionnaire.focus.map(x=>x.label).join(', ');
  line('Domaines a discuter en priorite : '+items+'.',{size:8.3,color:muted,leading:4.5});
 }
 title('2. Votre Motion Score');
 if(data.motion.complete){
  space(26);pdf.setFillColor(...green);pdf.roundedRect(M,y,CONTENT,24,2,2,'F');
  pdf.setFont('helvetica','bold');pdf.setFontSize(20);pdf.setTextColor(255,255,255);
  pdf.text(String(data.motion.score)+' / 100',M+6,y+15);
  pdf.setFont('helvetica','normal');pdf.setFontSize(8);
  pdf.text('Score calculable - donnees declarees verifiees',RIGHT-5,y+15,{align:'right'});
  y+=30;
  if(data.motion.subscores){
   line('Force : '+decimal(data.motion.subscores.strength,1)+'/100  |  Mobilite : '+
    decimal(data.motion.subscores.mobility,1)+'/100  |  Equilibre : '+
    decimal(data.motion.subscores.balance,1)+'/100',{size:8.5});
  }
  line('Normes : '+data.motion.source,{size:8.2,color:muted});
 }else{
  space(25);pdf.setFillColor(...soft);pdf.roundedRect(M,y,CONTENT,19,2,2,'F');
  pdf.setFont('helvetica','bold');pdf.setFontSize(13);ink(green);
  pdf.text('NON CALCULABLE',M+6,y+12);y+=25;
  for(const item of data.motion.missing||[])line('- '+item,{size:8.7,color:muted,leading:4.7});
 }
 line('Formule de reference : 40 % STS 30 s + 35 % TUG 3 m + 25 % equilibre SPPB.',{size:8.2,color:muted});
 // Next page for observations and appendix
 nextPage();
 title('3. Observations de mouvement');
 for(const item of data.observations){
  const quality=item.status==='review'?'Mesure a verifier':'';
  row(item.label,item.display,quality||item.commentary||null);
 }
 title('4. Comparaison par age (si applicable)');
 const reference=data.ageReference?.sts;
 if(reference?.reference){
  line('Sit-to-Stand 30 s : plage centrale '+reference.reference.lower+' - '+reference.reference.upper+
   ' repetitions (age '+reference.reference.age+' ans).',{size:8.5});
  line(reference.comparison||reference.reason,{size:8.5,color:muted});
 }else line('Sit-to-Stand : norme non applicable (tranche d age, protocole ou groupe de reference manquant).',{size:8.5});
 const one=data.ageReference?.unipodal?.[0];
 if(one?.expected!==null&&one?.expected!==undefined)
  line('Unipodal : moyenne de reference '+one.expected+' s (meilleur de 3 essais jusqu a 45 s). Mesure non comparable au test webcam de 20 s.',{size:8.3,color:muted});
 line('Sources : sralab.org/rehabilitation-measures (Rikli et Jones 1999 ; Springer et al. 2007).',{size:8.1,color:muted});
 title('5. Methode et limites');
 for(const phrase of data.limitations)line('- '+phrase,{size:8.3,color:muted,leading:4.8});
 line('Versions : '+data.version+' / '+data.motion.version,{size:7.3,color:muted});
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
   pdf.setDrawColor(232,223,211);pdf.line(M,y,RIGHT,y);y+=4;
  }
 }
 const count=pdf.getNumberOfPages();
 for(let i=1;i<=count;i++){
  pdf.setPage(i);pdf.setDrawColor(221,209,191);pdf.line(M,H-17,RIGHT,H-17);
  pdf.setFont('helvetica','normal');pdf.setFontSize(7.5);ink(muted);
  pdf.text('KOMO MOTION  /  DOCUMENT EXPERIMENTAL NON MEDICAL',M,H-12);
  pdf.text(i+' / '+count,RIGHT,H-12,{align:'right'});
 }
 const filename='KOMO_Motion_Rapport_'+data.date+'.pdf';
 pdf.save(filename);
 return filename;
}
