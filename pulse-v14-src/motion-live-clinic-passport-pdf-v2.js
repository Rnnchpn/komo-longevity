// KŌMØ Motion Passport — vos capacités, vos 3 priorités, votre programme maison et vos objectifs à 6 semaines.
// Browser-only jsPDF output. Never send questionnaire, camera or PDF to a server.
import {CLINIC_PASSPORT_VERSION} from './motion-live-clinic-passport-v2.mjs?v=20261121-longevity-v1';
const cleaner=value=>String(value??'')
 .replace(/[Ōōø]/g,'o').replace(/œ/g,'oe').replace(/Œ/g,'OE')
 .replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[—–‑−]/g,'-').replace(/²/g,'2').replace(/³/g,'3')
 .replace(/[•·]/g,'-').replace(/[≤]/g,'<=').replace(/[≥]/g,'>=')
 .replace(/[^\x20-\x7e\xa0-\xff]/g,' ');
const fmt=n=>Number.isFinite(n)?(Number.isInteger(n)?String(n):n.toFixed(1).replace('.',',')):'-';
const P={dark:[28,52,42],gold:[180,146,94],paper:[251,249,245],sand:[242,237,228],
 text:[43,54,46],muted:[110,118,108],line:[219,215,203],pale:[225,234,224],white:[255,255,253]};
export const CLINIC_PASSPORT_EXPORTS=[
 {value:'all',label:'Passeport complet (6 catégories)'},
 {value:'synthese',label:'1. Vos capacités'},
 {value:'exercices',label:'2. Priorités & programme maison'},
 {value:'tests',label:'3. Résultats détaillés & qualité de mesure'},
 {value:'suivi',label:'4. Suivi à 6 semaines'},
 {value:'nutrition',label:'5. Nutrition & compléments'},
 {value:'questionnaire',label:'6. Questionnaire détaillé (22 réponses)'}
];
export async function downloadClinicPassport(report,category='all'){
 if(report?.version!==CLINIC_PASSPORT_VERSION||!report.actionPlan)
  throw Error('invalid_clinic_passport');
 if(!CLINIC_PASSPORT_EXPORTS.some(x=>x.value===category))throw Error('invalid_category');
 const {jsPDF}=await import('https://esm.sh/jspdf@4.2.1');
 const pdf=new jsPDF({format:'a4',unit:'mm',compress:true});
 pdf.setProperties({title:'KOMO Motion Passport - '+category+' - '+report.date,
   subject:report.real?'Bilan fonctionnel KOMO Motion - protocole '+(report.protocol||'')+' '+(report.protocolVersion||''):'Bilan fonctionnel KOMO Motion - demonstration',author:'KOMO Pulse'});
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
  txt('CATEGORIE '+index+' / 06',M,33,{sz:8,bold:true,col:P.gold});
  txt(title,M,46,{sz:23,serif:true});
  if(subtitle)words(subtitle,M,55,C,{sz:8.5,lh:4.4,max:2,col:P.muted});
 };
 const ZONE_STYLE={priority:{fill:[150,70,50],ink:P.white,label:'PRIORITÉ'},
  consolidate:{fill:P.gold,ink:P.white,label:'À CONSOLIDER'},solid:{fill:P.dark,ink:P.white,label:'SOLIDE'},
  follow:{fill:P.pale,ink:P.dark,label:'SUIVI'},missing:{fill:P.line,ink:P.muted,label:'NON MESURÉ'}};
 const pill=(zone,xRight,y)=>{
  const z=ZONE_STYLE[zone]||ZONE_STYLE.missing;font(6.8,true);
  const w=pdf.getTextWidth(z.label)+7;
  box(xRight-w,y-4.4,w,6.4,z.fill,3.2);txt(z.label,xRight-w/2,y,{sz:6.8,bold:true,col:z.ink,align:'center'});
 };
 const lp=report.longevity||{capacities:[],priorities:[],exercises:[],objectives:[]};
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
    'BILAN FONCTIONNEL KOMO MOTION - MESURES VALIDEES PAR LE PRATICIEN - DOCUMENT NON DIAGNOSTIQUE',
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
 function capacites(){
  page(1,'Vos capacités','Cinq capacités liées à l’autonomie et à la longévité, chacune située par rapport à un repère publié.');
  const small=(x,y,w,label,value)=>{box(x,y,w,19,P.sand,2);
   txt(label.toUpperCase(),x+5,y+6.5,{sz:6.6,bold:true,col:P.muted});txt(value,x+5,y+15,{sz:12.5,bold:true,col:P.dark});};
  small(M,63,56,'Tests réalisés',(report.steps?report.steps.done+'/'+report.steps.total:report.measured));
  small(M+61,63,56,'Priorités',lp.priorities.length?String(lp.priorities.length):'Entretien');
  small(M+122,63,56,'Contrôle','6 semaines');
  words(lp.headline||'',M,90,C,{sz:10.5,lh:4.6,max:1,bold:true,col:P.dark});
  let y=96;
  lp.capacities.forEach(c=>{
   box(M,y,C,33,P.sand,2.5);
   txt(c.name,M+6,y+8,{sz:10.5,bold:true,col:P.dark});
   pill(c.zone,R-5,y+8);
   const shown=c.measures.filter(m=>m.value!==null&&m.value!==undefined).slice(0,2);
   if(!shown.length)txt('Non mesuré lors de ce bilan',M+6,y+14.5,{sz:8,col:P.muted});
   shown.forEach((m,i)=>{
    const v=m.label+' : '+m.value+(m.unit?' '+m.unit:'');
    txt(v,M+6,y+14.5+i*5,{sz:8.2,bold:true});
    font(8.2,true);txt('('+m.reference+')',M+8+pdf.getTextWidth(cleaner(v)),y+14.5+i*5,{sz:7,col:P.muted});
   });
   words(c.why,M+6,y+25.2,C-12,{sz:7,lh:3.4,max:2,col:P.muted});
   y+=35;
  });
  txt('Repères de population, présentés sans score clinique inventé ni âge du mouvement : ils orientent le programme, ils ne posent pas de diagnostic.',
   M,Math.min(y+3,277),{sz:6.6,col:P.muted});
 }
 function priorites(){
  page(2,'Vos priorités','Ce qui compte le plus pour votre autonomie, et l’objectif à atteindre au contrôle des 6 semaines.');
  let y=66;
  if(!lp.priorities.length){
   box(M,y,C,40,P.pale,3);
   txt('Vos capacités mesurées sont solides',M+8,y+12,{sz:12,bold:true,col:P.dark});
   words('Le programme ci-après sert à les garder. Objectifs : '+lp.objectives.map(o=>o.target).join(' ; ')+'.',M+8,y+22,C-16,{sz:8.6,lh:4.4,max:3});
   y+=46;
  }
  lp.priorities.forEach((p,i)=>{
   box(M,y,C,58,P.sand,3);
   txt('0'+(i+1),M+7,y+11,{sz:9,bold:true,col:P.gold});
   txt(p.name,M+17,y+11,{sz:14,bold:true,serif:true,col:P.dark});
   pill(p.zone,R-6,y+10);
   txt('POURQUOI C’EST IMPORTANT',M+7,y+20,{sz:6.8,bold:true,col:P.gold});
   words(p.why,M+7,y+25,C-14,{sz:8,lh:3.9,max:2});
   txt('CE QUE NOUS AVONS MESURÉ',M+7,y+35,{sz:6.8,bold:true,col:P.gold});
   words(p.basis||'Mesures du bilan',M+7,y+40,C-14,{sz:7.6,lh:3.7,max:1,col:P.muted});
   box(M+7,y+44,C-14,10,P.white,2);
   txt('OBJECTIF À 6 SEMAINES',M+11,y+50.5,{sz:6.8,bold:true,col:P.muted});
   txt(p.objective,R-11,y+50.5,{sz:9.6,bold:true,col:P.dark,align:'right'});
   y+=62;
  });
  box(M,Math.max(y,252)-2,C,22,P.pale,3);
  const yy=Math.max(y,252);
  txt('VOTRE RYTHME',M+8,yy+5,{sz:7,bold:true,col:P.gold});
  words((plan.schedule||'')+' '+(lp.recheck||''),M+8,yy+10.5,C-16,{sz:8.2,lh:4,max:2});
 }
 function tests(){
  page(3,'Résultats détaillés','Les valeurs brutes, avec leur origine et la qualité de mesure.');
  let y=65;
  report.measures.forEach((m,i)=>{
   box(M,y,C,26,P.sand,2);
   txt('0'+(i+1)+'  '+m.name,M+7,y+9,{sz:10,bold:true});
   txt(m.display,R-7,y+9,{sz:m.id==='posture'?8.5:11,bold:true,align:'right'});
   words('Origine : '+m.source+(m.quality===null?'':' / suivi '+m.quality+' %')+
     (m.review?' / VERIFICATION NECESSAIRE':''),M+7,y+16,C-14,
     {sz:7.7,lh:3.6,max:2,col:m.review?P.gold:P.muted});
   y+=29;
  });
  if(report.balance){
   txt('ÉQUILIBRE BILATÉRAL',M,250,{sz:8.2,bold:true,col:P.gold});
   words('Gauche '+fmt(report.balance.left)+' s / droite '+fmt(report.balance.right)+
    ' s. '+report.balance.interpretation,M,259,C,{sz:8,lh:4,max:3});
  }
 }
 function instruments(){
  // Protocole V2 : valeurs VALD, chrono et mètre saisies par l'opérateur. Aucune norme ni score.
  const rows=(report.instrumented||[]).filter(r=>r.status!=='missing');
  if(!rows.length)return;
  page('3B','Mesures instrumentées','Valeurs saisies depuis ForceDecks, DynaMo, mètre et chronomètre : votre point de départ personnel.');
  let y=65;
  rows.forEach(r=>{
   const lines=r.status==='skipped'?[...(r.lines||['Non realise']),...(r.note?['Note : '+r.note]:[])]:(r.lines.length?r.lines:['Aucune valeur']);
   const h=11+lines.length*4.3;
   if(y+h>274){page('3B','Mesures instrumentées (suite)','');y=65;}
   box(M,y,C,h,P.sand,2);
   txt(r.name,M+7,y+7.5,{sz:9.6,bold:true});
   if(r.device)txt(r.device,R-7,y+7.5,{sz:7.2,col:P.muted,align:'right'});
   let yy=y+12.5;lines.forEach(l=>{txt(l,M+7,yy,{sz:8.1,col:r.status==='skipped'?P.muted:P.text});yy+=4.3;});
   y+=h+3;
  });
 }
 function trajectoire(){
  // J0 -> S6 -> S12 : memes tests, memes conditions. Ecarts descriptifs, aucun score composite.
  const t=report.trajectory;
  if(!t||!Array.isArray(t.points)||t.points.length<2||!t.rows?.length)return;
  page('4B','Trajectoire','Évolution de vos mesures entre les consultations : '+t.points.map(p=>p.label+' ('+p.date.split('-').reverse().join('/')+')').join(' -> ')+'.');
  const pts=t.points.slice(-4),cols=pts.length;
  const labelW=70,deltaW=26,colW=(C-labelW-deltaW)/cols;
  let y=68;
  box(M,y-6,C,9,P.dark,1.5);
  txt('MESURE',M+3,y,{sz:7.2,bold:true,col:P.white});
  pts.forEach((p,i)=>txt(p.label,M+labelW+colW*i+colW/2,y,{sz:7.2,bold:true,col:P.white,align:'center'}));
  txt('ECART',R-3,y,{sz:7.2,bold:true,col:P.white,align:'right'});
  y+=9;
  t.rows.forEach((r,idx)=>{
   if(y>262){page('4B','Trajectoire (suite)','');y=68;}
   if(idx%2===0)box(M,y-5.2,C,8,P.sand);
   txt(r.label+(r.unit?' ('+r.unit+')':''),M+3,y,{sz:7.6});
   const vals=r.display.slice(-cols);
   vals.forEach((v,i)=>txt(v,M+labelW+colW*i+colW/2,y,{sz:7.8,bold:i===vals.length-1,align:'center'}));
   const col=r.verdict==='favorable'?P.dark:r.verdict==='defavorable'?[150,70,50]:P.muted;
   txt(r.deltaDisplay+(r.notable?' *':''),R-3,y,{sz:7.8,bold:true,col,align:'right'});
   y+=8;
  });
  y+=4;
  words('* Changement superieur au repere publie de changement cliniquement pertinent (vitesse de marche 0,1 m/s ; lever de chaise 2 levers ; prehension 50 N, environ 5 kg). Les autres ecarts sont descriptifs.',
   M,y,C,{sz:7,lh:3.4,max:3,col:P.muted});
  y+=12;
  (t.warnings||[]).forEach(w=>{y=words('Comparabilite : '+w,M,y,C,{sz:7,lh:3.4,max:2,col:[150,70,50]})+1;});
 }
 function exercises(){
  page(2,'Votre programme maison','Choisi à partir de vos résultats. Une chaise, un mur, un plan de travail : 20 minutes, 3 fois par semaine.');
  txt('4 EXERCICES CIBLÉS',M,67,{sz:8.5,bold:true,col:P.gold});
  const work=plan.exercises.filter(e=>e.key!=='walk').slice(0,4);
  work.forEach((e,i)=>{
   const col=i%2,row=Math.floor(i/2),x=M+col*91,y=73+row*68;
   box(x,y,87,63,P.sand,3);
   txt('0'+(i+1),x+7,y+10,{sz:8,bold:true,col:P.gold});
   txt(e.title,x+18,y+10,{sz:10,bold:true});
   if(e.relevance)txt(e.relevance,x+18,y+15.5,{sz:6.8,bold:true,col:P.gold});
   txt(e.dose,x+7,y+26,{sz:13.5,bold:true,col:P.dark});
   txt(e.frequency,x+7,y+32.5,{sz:8,col:P.muted});
   words(e.instructions,x+7,y+40,74,{sz:7.8,lh:3.8,max:3});
   if(e.progression)words('Ensuite : '+e.progression,x+7,y+55,74,{sz:7,lh:3.4,max:2,col:P.muted});
  });
  const walk=plan.exercises.find(e=>e.key==='walk')||plan.exercises[4]||{title:'Marche adaptée',dose:'Selon tolérance',frequency:'Plusieurs fois par semaine'};
  box(M,217,C,29,P.pale,3);
  txt('EN COMPLÉMENT · '+walk.title,M+7,226,{sz:9,bold:true});
  txt(walk.dose+' · '+walk.frequency,M+7,235,{sz:10});
  txt('Toujours avec un appui à portée de main pour les exercices d’équilibre.',M,260,{sz:8.7,col:P.muted});
  txt('Arrêter en cas de malaise, de chute, de douleur ou d’intolérance, et en parler à votre praticien.',M,268,{sz:8.7,col:P.muted});
 }
 function nutrition(){
  // Two spacious pages avoid truncating supplement contraindications.
  page(5,'Nutrition & apports','Priorité aux aliments, à l’exercice adapté et aux habitudes durables.');
  plan.food.forEach((a,i)=>{
   const y=70+i*75;
   box(M,y,C,67,P.pale,3);
   txt((i+1)+'. '+a.title,M+9,y+13,{sz:12,bold:true,col:P.dark});
   words(a.text,M+9,y+26,C-18,{sz:9,lh:5,max:4});
   txt('ACTION PRATIQUE',M+9,y+46,{sz:7.8,bold:true,col:P.gold});
   words(a.action,M+9,y+54,C-18,{sz:8.3,lh:4,max:2});
  });
  box(M,224,C,43,P.sand,3);
  txt('DECISION NUTRITIONNELLE',M+9,236,{sz:9,bold:true,col:P.gold});
  words('Les resultats Motion ne permettent pas d identifier une carence vitaminique ou une insuffisance proteique. Le poids, les apports, les symptomes, les traitements et les antecedents sont indispensables avant toute recommandation individualisee.',
   M+9,246,C-18,{sz:8.5,lh:4.6,max:4,col:P.muted});

  page(5,'Compléments & précautions','Options à discuter, jamais prescrites automatiquement par le questionnaire ou la caméra.');
  plan.supplements.forEach((a,i)=>{
   const y=69+i*39.6;
   box(M,y,C,36,P.sand,2);
   txt(a.name,M+8,y+9,{sz:10.5,bold:true,col:P.dark});
   txt(a.status,R-8,y+9,{sz:8,bold:true,col:P.gold,align:'right'});
   words(a.benefit,M+8,y+17,C-16,{sz:8,lh:4.1,max:2});
   words('Prudence : '+a.guard,M+8,y+28,C-16,{sz:7.7,lh:3.8,max:2,col:P.muted});
  });
  words('Verifier la fonction renale, les traitements et les indications avant toute option proteique, vitaminee ou de creatine.',
   M,275,C,{sz:7.7,lh:3.6,max:2,col:P.muted});
 }

 function suivi(){
  page(4,'Vos six semaines','Progression graduelle, puis contrôle des mêmes tests dans les mêmes conditions.');
  let y=70;
  plan.timeline.forEach((t,i)=>{
   box(M,y,C,48,P.sand,3);
   txt('0'+(i+1)+'  '+t.weeks,M+8,y+10,{sz:9,bold:true,col:P.gold});
   txt(t.title,M+8,y+20,{sz:14,bold:true,col:P.dark});
   t.tasks.forEach((task,j)=>words('- '+task,M+8,y+27+j*5,C-16,{sz:7.8,lh:4.1,max:1}));
   y+=55;
  });
  txt('VOS OBJECTIFS À 6 SEMAINES',M,239,{sz:8.5,bold:true,col:P.gold});
  if(!plan.monitoring.length)txt('Objectifs fixés au prochain bilan.',M,248,{sz:8.5,col:P.muted});
  plan.monitoring.forEach((m,i)=>{
   const yy=248+i*7.6;
   txt(m.name,M,yy,{sz:8.5});
   txt(m.value+(m.unit?' '+m.unit:''),R,yy,{sz:8.5,bold:true,align:'right'});
  });
 }
 function questionnaire(){
  const groups=report.questionnaire.groups||[];
  if(report.questionnaire.complete){
   page(6,'Votre ressenti','Questionnaire en 22 réponses : ce que vous vivez au quotidien, à côté de ce que nous avons mesuré.');
   box(M,66,112,120,P.sand,3);drawRadar(M+4,74);
   txt('POINTS DE GÊNE : '+fmt(report.questionnaire.rawPoints)+' / '+fmt(report.questionnaire.maxPoints),M+7,176,{sz:7,bold:true,col:P.muted});
   txt('20 ITEMS COTES / NON VALIDE',M+7,182,{sz:6.7,col:P.muted});
   txt('INDICE DÉCLARÉ',M+122,74,{sz:7,bold:true,col:P.muted});
   txt(fmt(report.questionnaire.index)+'/100',M+122,86,{sz:17,bold:true,col:P.dark});
   words('Plus haut = moins de limitations déclarées. Barème KOMO interne, distinct des mesures et sans valeur diagnostique.',M+122,96,54,{sz:7.6,lh:3.8,max:6,col:P.muted});
  }
  const printGroups=(subset,part)=>{
   page(6,part===1?'Questionnaire : autonomie':'Questionnaire : habitudes',
    'Reponses exactes enregistrees. '+report.questionnaire.answered+' / '+report.questionnaire.total+
    ' · '+(report.simulated?'Reponses fictives pour demonstration.':'Profil auto-declare exploratoire.'));
   txt(report.questionnaire.complete?
    'TOTAL : '+fmt(report.questionnaire.rawPoints)+'/'+fmt(report.questionnaire.maxPoints)+
    ' pts de difficulte | Indice pondere : '+fmt(report.questionnaire.index)+'/100':
    'QUESTIONNAIRE INCOMPLET : aucun score global calcule.',M,65,{sz:7.8,bold:true,col:P.dark});
   let y=76,serial=part===1?0:10;
   for(const g of subset){
    txt(g.label.toUpperCase(),M,y,{sz:10,bold:true,col:P.gold});
    if(Number.isFinite(g.score))txt(fmt(g.points)+'/'+fmt(g.maxPoints)+
      ' pts  |  '+fmt(g.score)+'/100',R,y,
      {sz:8,bold:true,align:'right',col:P.gold});
    y+=8;
    for(const item of g.items){
     serial+=1;
     if(y>250){
      page(6,'Questionnaire (suite)','Réponses enregistrées / vérifiables');
      y=69;
      txt(g.label.toUpperCase()+' (SUITE)',M,y,{sz:9,bold:true,col:P.gold});
      y+=8;
     }
     txt(String(serial).padStart(2,'0'),M,y,{sz:8,bold:true,col:P.gold});
     const afterQuestion=words(item.question,M+11,y,C-13,{sz:8.4,lh:4.0,max:2});
     const answerY=afterQuestion+0.2;
     const afterAnswer=words(item.answer,M+11,answerY,C-43,
      {sz:8.2,lh:3.8,max:2,bold:true,
       col:item.answer==='Non renseigné'?P.muted:P.dark});
     txt(item.maxPoints===null?'Contexte':item.points===null?
       '- / 4 pts':fmt(item.points)+' / 4 pts',R,answerY,
      {sz:7.8,bold:true,align:'right',col:P.gold});
     y=afterAnswer+3.1;
     line(M+11,y-1,R,y-1,P.line,.22);
     y+=3.3;
    }
    y+=3;
   }
   if(part===2&&y<252){
    txt('METHODE ET LIMITES',M,y+3,{sz:8,bold:true,col:P.gold});
    words('20 items notes 0 (favorable) a 4 (limitation maximale), 2 reponses de contexte non notees. Indice pondere sur 100 : plus haut = moins de limitations declarees. Barème proprietaire non valide ; aucun diagnostic.',
     M,y+10,C,{sz:7.2,lh:3.3,max:4,col:P.muted});
   }
  };
  printGroups(groups.slice(0,2),1);
  printGroups(groups.slice(2),2);
 }
 const renderers={synthese:capacites,tests,instruments,trajectoire,priorites,exercices:exercises,nutrition,suivi,questionnaire};
 const chapters=category==='all'?['synthese','priorites','exercices','tests','instruments','suivi','trajectoire','nutrition','questionnaire']:
  category==='tests'?['tests','instruments']:category==='suivi'?['suivi','trajectoire']:
  category==='exercices'?['priorites','exercices']:[category];
 for(const chapter of chapters)renderers[chapter]();
 footer();
 const code=cleaner(report.subject||'').replace(/[^A-Za-z0-9-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,40);
 const name='KOMO_Motion_'+(code?code+'_':'')+(category==='all'?'Passeport_Complet':category)+
  '_'+report.date+'.pdf';
 pdf.save(name);
 return name;
}
