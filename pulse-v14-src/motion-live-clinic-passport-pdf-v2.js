// KŌMØ Motion Passport — five large independent categories.
// Browser-only jsPDF output. Never send questionnaire, camera or PDF to a server.
import {CLINIC_PASSPORT_VERSION} from './motion-live-clinic-passport-v2.mjs?v=20261110-visual-plan-v1';
const cleaner=value=>String(value??'')
 .replace(/[Ōōø]/g,'o').replace(/œ/g,'oe').replace(/Œ/g,'OE')
 .replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[—–‑]/g,'-')
 .replace(/[•·]/g,'-').replace(/[≤]/g,'<=').replace(/[≥]/g,'>=')
 .replace(/[^\x20-\x7e\xa0-\xff]/g,' ');
const fmt=n=>Number.isFinite(n)?(Number.isInteger(n)?String(n):n.toFixed(1).replace('.',',')):'-';
const P={dark:[28,52,42],gold:[180,146,94],paper:[251,249,245],sand:[242,237,228],
 text:[43,54,46],muted:[110,118,108],line:[219,215,203],pale:[225,234,224],white:[255,255,253]};
export const CLINIC_PASSPORT_EXPORTS=[
 {value:'all',label:'Passeport complet (5 catégories)'},
 {value:'synthese',label:'1. Synthèse & diagramme'},
 {value:'tests',label:'2. Résultats & qualité de mesure'},
 {value:'exercices',label:'3. Exercices à domicile'},
 {value:'nutrition',label:'4. Nutrition & compléments'},
 {value:'suivi',label:'5. Suivi à 6 semaines'}
];
export async function downloadClinicPassport(report,category='all'){
 if(report?.version!==CLINIC_PASSPORT_VERSION||!report.actionPlan)
  throw Error('invalid_clinic_passport');
 if(!CLINIC_PASSPORT_EXPORTS.some(x=>x.value===category))throw Error('invalid_category');
 const {jsPDF}=await import('https://esm.sh/jspdf@4.2.1');
 const pdf=new jsPDF({format:'a4',unit:'mm',compress:true});
 pdf.setProperties({title:'KOMO Motion Passport - '+category+' - '+report.date,
   subject:'Bilan fonctionnel et programme educatif de demonstration',author:'KOMO Pulse'});
 const plan=report.actionPlan,W=210,H=297,M=16,R=194,C=178;
 const fill=c=>pdf.setFillColor(...c),ink=c=>pdf.setTextColor(...c),stroke=c=>pdf.setDrawColor(...c);
 const font=(sz=9,bold=false,serif=false)=>{pdf.setFont(serif?'times':'helvetica',bold?'bold':'normal');pdf.setFontSize(sz)};
 const txt=(v,x,y,{sz=9,bold=false,serif=false,col=P.text,align='left'}={})=>{
  font(sz,bold,serif);ink(col);pdf.text(cleaner(v),x,y,{align});
 };
 const box=(x,y,w,h,c,r=0)=>{fill(c);if(r)pdf.roundedRect(x,y,w,h,r,r,'F');else pdf.rect(x,y,w,h,'F')};
 const line=(x,y,xx,yy,c=P.line,width=.35)=>{stroke(c);pdf.setLineWidth(width);pdf.line(x,y,xx,yy)};
 const words=(v,x,y,w,{sz=8,lh=4.25,max=6,col=P.text,bold=false}={})=>{
  font(sz,bold);ink(col);
  let parts=pdf.splitTextToSize(cleaner(v),w);
  if(parts.length>max){
   parts=parts.slice(0,max);parts[max-1]=parts[max-1].slice(0,-3)+'...';
  }
  pdf.text(parts,x,y);return y+lh*parts.length;
 };
 let sectionCount=0;
 const page=(index,title,subtitle)=>{
  if(sectionCount++)pdf.addPage();
  box(0,0,W,H,P.paper);box(0,0,W,3,P.dark);
  txt('KOMO',M,16,{sz:16,bold:true,serif:true});
  txt('MOTION PASSPORT',M+27,15,{sz:8,bold:true,col:P.muted});
  txt('BILAN / CABINET',R,15,{sz:8,col:P.muted,align:'right'});
  line(M,22,R,22);
  txt('CATEGORIE '+index+' / 05',M,33,{sz:8,bold:true,col:P.gold});
  txt(title,M,46,{sz:23,serif:true});
  if(subtitle)words(subtitle,M,55,C,{sz:8.5,lh:4.4,max:2,col:P.muted});
 };
 const metric=(x,y,w,label,value)=>{
  box(x,y,w,26,P.sand,2);
  txt(label.toUpperCase(),x+6,y+8,{sz:7,bold:true,col:P.muted});
  txt(value,x+6,y+20,{sz:17,bold:true,col:P.dark});
 };
 const footer=()=>{
  const count=pdf.getNumberOfPages();
  for(let i=1;i<=count;i++){
   pdf.setPage(i);line(M,282,R,282);
   txt(report.simulated?'DEMONSTRATION / 22 REPONSES FICTIVES / AUCUN PATIENT REEL':
    'PASSEPORT EXPERIMENTAL - VALIDATION OPERATEUR REQUISE',
    M,288,{sz:6.8,col:P.muted});
   txt(String(i).padStart(2,'0')+' / '+String(count).padStart(2,'0'),R,288,
    {sz:7,bold:true,align:'right'});
  }
 };
 function drawRadar(x,y){
  const axes=plan.axis;
  if(axes.length!==4||axes.some(a=>!Number.isFinite(a.value))){
   words('Questionnaire incomplet : le diagramme sera disponible apres les 22 reponses.',x,y+30,86,{sz:9});
   return;
  }
  const cx=x+52,cy=y+52,rad=35;
  const p=(i,v)=>{
   const a=-Math.PI/2+i*Math.PI/2;
   return [cx+rad*v/100*Math.cos(a),cy+rad*v/100*Math.sin(a)];
  };
  for(const r of [25,50,75,100]){
   const points=[0,1,2,3].map(i=>p(i,r));
   points.forEach((q,i)=>line(q[0],q[1],points[(i+1)%4][0],points[(i+1)%4][1]));
  }
  const pts=axes.map((a,i)=>p(i,a.value));
  pts.forEach((q,i)=>{
   line(cx,cy,p(i,100)[0],p(i,100)[1]);
   line(q[0],q[1],pts[(i+1)%4][0],pts[(i+1)%4][1],P.dark,1.9);
   fill(P.dark);pdf.circle(q[0],q[1],2.0,'F');
  });
  txt(axes[0].short,x+52,y+10,{sz:8,bold:true,align:'center'});
  txt(fmt(axes[0].value),x+52,y+17,{sz:7.5,col:P.gold,align:'center'});
  txt(axes[1].short,x+92,y+52,{sz:8,bold:true});
  txt(fmt(axes[1].value),x+92,y+59,{sz:7.5,col:P.gold});
  txt(axes[2].short,x+52,y+98,{sz:8,bold:true,align:'center'});
  txt(fmt(axes[2].value),x+52,y+105,{sz:7.5,col:P.gold,align:'center'});
  txt(axes[3].short,x+4,y+52,{sz:8,bold:true});
  txt(fmt(axes[3].value),x+4,y+59,{sz:7.5,col:P.gold});
 }
 function synthese(){
  page(1,'Synthese & diagramme','Les resultats sont presentes sans score clinique invente.');
  metric(M,67,54,'Tests realises',report.measured+'/6');
  metric(M+62,67,54,'Questionnaire',report.questionnaire.answered+'/22');
  metric(M+124,67,54,'Programme','6 semaines');
  box(M,102,112,120,P.sand,3);drawRadar(M+4,110);
  txt('INDICES EXPLORATOIRES',M+7,213,{sz:7,bold:true,col:P.muted});
  txt('MESURES OBSERVEES',M+120,109,{sz:8,bold:true,col:P.gold});
  report.measures.forEach((m,i)=>{
   const yy=120+i*16.3;
   box(M+118,yy-7,60,14,P.sand,2);
   txt(m.short,M+121,yy-2,{sz:7.4,col:P.muted});
   txt(m.id==='posture'?'Observation qualitative':m.value===null?'Non mesure':
    fmt(m.value)+(m.id.startsWith('unipodal')?' s':' reps'),M+121,yy+3.6,
    {sz:8.5,bold:true});
  });
  txt('LECTURE RAPIDE',M,235,{sz:8,bold:true,col:P.gold});
  let y=245;
  for(const highlight of plan.highlights){
   txt(highlight.label,M,y,{sz:7.5,bold:true,col:P.muted});
   y=words(highlight.value,M+35,y,C-37,{sz:8.7,lh:4,max:2,bold:true})+5;
  }
  txt(report.simulated?'PROFIL FICTIF / NON DIAGNOSTIQUE':'BILAN EXPLORATOIRE / NON DIAGNOSTIQUE',
   R,271,{sz:7.3,col:P.gold,align:'right'});
 }
 function tests(){
  page(2,'Resultats & qualite','Les valeurs brutes sont distinctes des questionnaires et normes externes.');
  let y=70;
  report.measures.forEach((m,i)=>{
   box(M,y,C,29,P.sand,2);
   txt('0'+(i+1)+'  '+m.name,M+7,y+9,{sz:10,bold:true});
   txt(m.display,R-7,y+9,{sz:m.id==='posture'?8.5:11,bold:true,align:'right'});
   words('Origine : '+m.source+(m.quality===null?'':' / suivi '+m.quality+' %')+
     (m.review?' / VERIFICATION NECESSAIRE':''),M+7,y+16,C-14,
     {sz:7.7,lh:3.6,max:2,col:m.review?P.gold:P.muted});
   y+=34;
  });
  if(report.balance){
   txt('EQUILIBRE BILATERAL',M,278-28,{sz:8.2,bold:true,col:P.gold});
   words('Gauche '+fmt(report.balance.left)+' s / droite '+fmt(report.balance.right)+
    ' s. '+report.balance.interpretation,M,278-21,C,{sz:8,lh:4,max:3});
  }
 }
 function exercises(){
  page(3,'Exercices a domicile','Programme educatif a adapter avec un professionnel selon la securite et les symptomes.');
  txt('4 EXERCICES PRINCIPAUX',M,67,{sz:8.5,bold:true,col:P.gold});
  const work=plan.exercises.slice(0,4);
  work.forEach((e,i)=>{
   const col=i%2,row=Math.floor(i/2),x=M+col*91,y=73+row*68;
   box(x,y,87,63,P.sand,3);
   txt('0'+(i+1),x+7,y+10,{sz:8,bold:true,col:P.gold});
   txt(e.title,x+18,y+10,{sz:10,bold:true});
   txt(e.dose,x+7,y+23,{sz:15,bold:true,col:P.dark});
   txt(e.frequency,x+7,y+31,{sz:8,col:P.muted});
   words(e.instructions,x+7,y+40,74,{sz:8,lh:4,max:3});
  });
  const walk=plan.exercises[4];
  box(M,217,C,29,P.pale,3);
  txt('EN COMPLEMENT · '+walk.title,M+7,226,{sz:9,bold:true});
  txt(walk.dose+' · '+walk.frequency,M+7,235,{sz:10});
  txt('Toujours avec appui accessible pour les exercices d equilibre.',M,260,{sz:8.7,col:P.muted});
  txt('Arreter en cas de malaise, chute, douleur ou intolerance.',M,268,{sz:8.7,col:P.muted});
 }
 function nutrition(){
  page(4,'Nutrition & complements','L alimentation et le renforcement priment sur les complements.');
  let y=68;
  plan.food.forEach((a,i)=>{
   box(M,y,C,31,P.pale,3);
   txt((i+1)+'. '+a.title,M+7,y+9,{sz:10,bold:true});
   words(a.text,M+7,y+17,C-14,{sz:8.2,lh:4,max:3});
   y+=36;
  });
  txt('COMPLEMENTS : DECISION CONDITIONNELLE',M,y+5,{sz:8.5,bold:true,col:P.gold});
  y+=14;
  plan.supplements.forEach((a,i)=>{
   const h=25;
   box(M,y,C,h,P.sand,2);
   txt(a.name,M+7,y+8,{sz:9.5,bold:true});
   txt(a.status,R-7,y+8,{sz:7.5,col:P.gold,align:'right'});
   words(a.benefit,M+7,y+15,C-14,{sz:7.7,lh:3.7,max:2});
   y+=h+3;
  });
  words('Aucune supplementation automatique : verifier apports, poids, age exact, fonction renale, traitements et indications avant recommandation personnalisee.',M,266,C,{sz:8,col:P.muted,max:3});
 }
 function suivi(){
  page(5,'Suivi sur six semaines','Progression graduelle et controle des resultats dans des conditions comparables.');
  let y=70;
  plan.timeline.forEach((t,i)=>{
   box(M,y,C,48,P.sand,3);
   txt('0'+(i+1)+'  '+t.weeks,M+8,y+10,{sz:9,bold:true,col:P.gold});
   txt(t.title,M+8,y+20,{sz:14,bold:true,col:P.dark});
   t.tasks.forEach((task,j)=>words('- '+task,M+8,y+27+j*5,C-16,{sz:7.8,lh:4.1,max:1}));
   y+=55;
  });
  txt('A REEVALUER',M,239,{sz:8.5,bold:true,col:P.gold});
  plan.monitoring.forEach((m,i)=>{
   const yy=248+i*7.6;
   txt(m.name,M,yy,{sz:8.5});
   txt(m.value+' '+m.unit,R,yy,{sz:8.5,bold:true,align:'right'});
  });
 }
 const renderers={synthese,tests,exercices,nutrition,suivi};
 const chapters=category==='all'?['synthese','tests','exercices','nutrition','suivi']:[category];
 for(const chapter of chapters)renderers[chapter]();
 footer();
 const name='KOMO_Motion_'+(category==='all'?'Passeport_Complet':category)+
  '_'+report.date+'.pdf';
 pdf.save(name);
 return name;
}
