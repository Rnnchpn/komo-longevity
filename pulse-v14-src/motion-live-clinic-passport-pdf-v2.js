// KŌMØ Motion Passport — vos capacités, vos 3 priorités, votre programme maison et vos objectifs à 6 semaines.
// Browser-only jsPDF output. Never send questionnaire, camera or PDF to a server.
import {CLINIC_PASSPORT_VERSION} from './motion-live-clinic-passport-v2.mjs?v=20261125-consultation-flash-v1';
const cleaner=value=>String(value??'')
 .replace(/[Ōōø]/g,'o').replace(/œ/g,'oe').replace(/Œ/g,'OE')
 .replace(/[’‘]/g,"'").replace(/[“”]/g,'"').replace(/[—–‑−]/g,'-').replace(/²/g,'2').replace(/³/g,'3')
 .replace(/[•·]/g,'-').replace(/[≤]/g,'<=').replace(/[≥]/g,'>=')
 .replace(/[^\x20-\x7e\xa0-\xff]/g,' ');
const fmt=n=>Number.isFinite(n)?(Number.isInteger(n)?String(n):n.toFixed(1).replace('.',',')):'-';
const P={dark:[28,52,42],gold:[180,146,94],paper:[251,249,245],sand:[242,237,228],
 text:[43,54,46],muted:[110,118,108],line:[219,215,203],pale:[225,234,224],white:[255,255,253]};
export const CLINIC_PASSPORT_EXPORTS=[
 {value:'all',label:'Passeport complet'},
 {value:'synthese',label:'1. Votre bilan'},
 {value:'exercices',label:'2. Priorités & programme maison'},
 {value:'tests',label:'3. Vos résultats en détail'},
 {value:'suivi',label:'4. Votre trajectoire : 30 jours et 6 semaines'},
 {value:'nutrition',label:'5. Nutrition & compléments'},
 {value:'questionnaire',label:'6. Questionnaire détaillé (22 réponses)'}
];
// Explication en une phrase de chaque test, pour le patient (23/11/2026).
const PLAIN={
 dynamo_hip_flex:'Force pour lever la cuisse : monter une marche, enjamber un obstacle.',
 dynamo_knee_ext:'Force pour tendre le genou : se lever d’une chaise, monter les escaliers.',
 dynamo_knee_flex:'Force à l’arrière de la cuisse : elle stabilise le genou pendant la marche.',
 dynamo_hip_abd:'Force pour écarter la jambe : elle garde le bassin stable quand on est sur un pied.',
 dynamo_grip:'Force de la main : un repère de la force générale.',
 dynamo_elbow_flex:'Force du bras : suivie d’une séance à l’autre, côté par côté.',
 anthropometry:'Vos conditions de mesure, reprises à l’identique au contrôle.',
 fd_quiet_stand:'Debout immobile 30 s : plus vos oscillations sont petites et lentes, plus votre équilibre est économe.',
 fd_quiet_stand_ec:'Le même test les yeux fermés : il montre la part de la vue dans votre équilibre.',
 fd_sts:'Se lever d’une chaise sur les plateformes : rapidité, et répartition de l’effort entre gauche et droite.',
 unipodal_left:'Tenir sur le pied gauche, jusqu’à 30 s. Repère : au moins 10 s.',
 unipodal_right:'Tenir sur le pied droit, jusqu’à 30 s. Repère : au moins 10 s.',
 fd_cmj:'Saut sur place : la puissance des jambes, qui baisse avec l’âge et se travaille.',
 gait_4m:'Marche sur 4 m à votre allure habituelle : la vitesse de marche est un repère majeur de santé.',
 sts:'Se lever et se rasseoir le plus de fois possible en 30 s : la force des jambes au quotidien.',
 posture_photo:'Votre alignement debout, de profil, mesuré sur photo : un repère de suivi, pas un diagnostic.'
};
const addDays=(iso,days)=>{const d=new Date(String(iso)+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+days);return d.toISOString().slice(0,10)};
const frShort=iso=>{const [y,m,d]=String(iso||'').split('-');return d&&m&&y?d+'/'+m+'/'+y:'-'};
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
  // Nom du patient en en-tête de chaque page (dossiers nominatifs depuis le 23/11/2026).
  txt((report.subject?cleaner(report.subject).toUpperCase().slice(0,40)+'  ·  ':'')+'BILAN / CABINET',R,15,{sz:8,col:P.muted,align:'right'});
  line(M,22,R,22);
  txt(String(index).toUpperCase(),M,33,{sz:8,bold:true,col:P.gold});
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
 // Jauge (23/11/2026) : zones priorité / à consolider / solide, valeur du patient (rond) et objectif à 6 semaines (repère doré).
 const ZT={priority:[230,196,184],consolidate:[238,222,190],solid:[196,218,203]};
 const gnum=(v,d)=>(Math.round(v*10**d)/10**d).toFixed(d).replace('.',',');
 const gauge=(x,y,w,g,opt={})=>{
  if(!g)return;
  const h=opt.h||3.4,pos=v=>x+w*Math.max(0,Math.min(1,(v-g.min)/(g.max-g.min)));
  const c1=pos(g.cuts[0]),c2=pos(g.cuts[1]),cd=g.unit==='m/s'?1:0;
  box(x,y,w,h,ZT.solid,1.7);box(x,y,c2-x,h,ZT.consolidate,1.7);box(x,y,c1-x,h,ZT.priority,1.7);
  if(c1>x+2)box(c1-1.7,y,1.8,h,ZT.consolidate);if(c2>x+2&&c2<x+w-2)box(c2-1.7,y,1.8,h,ZT.solid);
  txt(gnum(g.cuts[0],cd),c1,y+h+3.4,{sz:6,col:P.muted,align:'center'});
  txt(gnum(g.cuts[1],cd),c2,y+h+3.4,{sz:6,col:P.muted,align:'center'});
  if(opt.target!==false&&g.target!==null){
   const tx=pos(g.target);stroke(P.gold);pdf.setLineWidth(.7);pdf.line(tx,y-1.6,tx,y+h+1.2);
   fill(P.gold);pdf.triangle(tx-1.8,y-3.6,tx+1.8,y-3.6,tx,y-1.3,'F');
   if(opt.targetLabel)txt('objectif '+gnum(g.target,Number.isInteger(g.target)?0:g.decimals>1?2:g.decimals)+' '+g.unit,Math.min(tx+2.6,x+w-1),y-1.9,{sz:6.2,bold:true,col:P.gold,align:tx+30>x+w?'right':'left'});
  }
  const vx=pos(g.value);fill(P.white);pdf.circle(vx,y+h/2,2.7,'F');fill(P.dark);pdf.circle(vx,y+h/2,2.0,'F');
  if(opt.valueLabel)txt(gnum(g.value,g.decimals>1?2:g.decimals)+' '+g.unit,vx,y-2.4,{sz:6.8,bold:true,col:P.dark,align:'center'});
 };
 const legend=(x,y)=>{
  [['priority','Priorité'],['consolidate','À consolider'],['solid','Solide']].forEach(([z,l],i)=>{
   const xx=x+i*27;box(xx,y-2.4,6,2.8,ZT[z],1.2);txt(l,xx+7.5,y,{sz:6.6,col:P.muted});});
  fill(P.dark);pdf.circle(x+86,y-1,1.6,'F');txt('vous',x+89,y,{sz:6.6,col:P.muted});
  fill(P.gold);pdf.triangle(x+100,y-2.6,x+103.4,y-2.6,x+101.7,y-0.4,'F');txt('objectif à 6 semaines',x+105,y,{sz:6.6,col:P.muted});
 };
 function capacites(){
  page('','','');
  // Bandeau : nom, date, chiffres clés.
  box(M,26,C,31,P.dark,3.5);
  txt('PASSEPORT KOMO MOTION · BILAN DU '+frShort(report.date),M+8,34.5,{sz:7.2,bold:true,col:P.gold});
  txt(report.subject||'Votre bilan',M+8,46.5,{sz:19,serif:true,col:P.white});
  txt('Évaluation fonctionnelle · mesures validées par votre praticien',M+8,53,{sz:7.2,col:[196,208,199]});
  [[report.steps?report.steps.done+'/'+report.steps.total:String(report.measured),'tests'],
   [lp.priorities.length?String(lp.priorities.length):'0','priorités'],
   [frShort(addDays(report.date,42)),'contrôle']].forEach(([v,l],i)=>{
   const xx=M+112+i*22.5;if(i)line(xx-3,32,xx-3,52,[70,96,84],.3);
   txt(v,xx,43,{sz:i===2?8.6:13,bold:true,col:P.white});txt(l.toUpperCase(),xx,49.5,{sz:6,bold:true,col:P.gold});});
  txt('Vos capacités',M,67,{sz:17,serif:true,col:P.dark});
  words(lp.headline||'',M+46,66.5,C-46,{sz:9,lh:4,max:1,bold:true,col:P.dark});
  legend(M,75);
  let y=80;
  lp.capacities.forEach(c=>{
   box(M,y,C,36,P.sand,2.5);
   txt(c.name,M+6,y+7.5,{sz:10.5,bold:true,col:P.dark});
   pill(c.zone,R-5,y+7.5);
   const shown=c.measures.filter(m=>m.value!==null&&m.value!==undefined).slice(0,2);
   if(!shown.length)txt('Non mesuré lors de ce bilan',M+6,y+15,{sz:8,col:P.muted});
   const m1=shown[0],m2=shown[1];
   if(m1){txt(m1.value+(m1.unit?' '+m1.unit:''),M+6,y+15.5,{sz:12.5,bold:true,col:P.dark});
    words(m1.label+' · '+m1.reference,M+6,y+20,86,{sz:6.6,lh:3,max:1,col:P.muted});}
   if(m2)words(m2.label+' : '+m2.value+(m2.unit?' '+m2.unit:'')+' ('+m2.reference+')',M+6,y+24.5,90,{sz:7,lh:3.2,max:1,bold:false,col:P.text});
   if(c.gauge){
    txt(c.gauge.label,M+98,y+13.2,{sz:6.4,col:P.muted});
    gauge(M+98,y+17,C-104,c.gauge,{valueLabel:false});
   }else if(shown.length)words('Suivi personnel : pas de repère publié, on compare vos mesures d’un bilan à l’autre.',M+98,y+15,C-104,{sz:6.8,lh:3.2,max:2,col:P.muted});
   words(c.why,M+6,y+29.8,C-12,{sz:6.4,lh:3,max:2,col:P.muted});
   y+=37.6;
  });
  txt('Repères de population, présentés sans score clinique inventé ni âge du mouvement : ils orientent le programme, ils ne posent pas de diagnostic.',
   M,Math.min(y+3,278),{sz:6.4,col:P.muted});
 }
 function priorites(){
  page('Vos priorités','Ce qui compte le plus','Ce qui compte le plus pour votre autonomie, et l’objectif à atteindre au contrôle des 6 semaines.');
  let y=66;
  if(!lp.priorities.length){
   box(M,y,C,40,P.pale,3);
   txt('Vos capacités mesurées sont solides',M+8,y+12,{sz:12,bold:true,col:P.dark});
   words('Le programme ci-après sert à les garder. Objectifs : '+lp.objectives.map(o=>o.target).join(' ; ')+'.',M+8,y+22,C-16,{sz:8.6,lh:4.4,max:3});
   y+=46;
  }
  if(lp.priorities.length){legend(M,y-1.5);y+=2;}
  lp.priorities.forEach((p,i)=>{
   const g=(lp.capacities.find(c=>c.id===p.id)||{}).gauge;
   box(M,y,C,60,P.sand,3);
   txt('0'+(i+1),M+7,y+11,{sz:9,bold:true,col:P.gold});
   txt(p.name,M+17,y+11,{sz:14,bold:true,serif:true,col:P.dark});
   pill(p.zone,R-6,y+10);
   txt('POURQUOI C’EST IMPORTANT',M+7,y+18.5,{sz:6.8,bold:true,col:P.gold});
   words(p.why,M+7,y+22.6,C-14,{sz:7.8,lh:3.6,max:2});
   txt('OÙ VOUS EN ÊTES',M+7,y+31.5,{sz:6.8,bold:true,col:P.gold});
   words(p.basis||'Mesures du bilan',M+34,y+31.5,C-41,{sz:7,lh:3.3,max:1,col:P.muted});
   if(g){gauge(M+9,y+38.5,C-18,g,{valueLabel:true,targetLabel:true});}
   box(M+7,y+48,C-14,9.5,P.white,2);
   txt('OBJECTIF À 6 SEMAINES',M+11,y+54,{sz:6.8,bold:true,col:P.muted});
   txt(p.objective,R-11,y+54,{sz:9.4,bold:true,col:P.dark,align:'right'});
   y+=63;
  });
  box(M,Math.max(y,254)-2,C,22,P.pale,3);
  const yy=Math.max(y,254);
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
 // Silhouette de profil (photo de posture) : oreille, épaule, hanche, genou, cheville reliés, tournés vers la droite
 // (vers l'avant), et la verticale passant par la cheville. Angles mesurés sur la photo ; dessin schématique.
 function profileFigure(a,ax,ay,H){
  const rad=d=>d*Math.PI/180,legL=H*.52,trunkL=H*.32,neckL=H*.16;
  const hip=[ax+legL*Math.sin(rad(a.hip)),ay-legL*Math.cos(rad(a.hip))];
  const sh=[hip[0]+trunkL*Math.sin(rad(a.trunk)),hip[1]-trunkL*Math.cos(rad(a.trunk))];
  const ear=[sh[0]+neckL*Math.sin(rad(a.head)),sh[1]-neckL*Math.cos(rad(a.head))];
  // Genou : au milieu de la jambe, décalé vers l'avant s'il est fléchi, vers l'arrière s'il est en extension.
  const mx=(ax+hip[0])/2,my=(ay+hip[1])/2,dx=hip[0]-ax,dy=hip[1]-ay,len=Math.hypot(dx,dy)||1,off=(legL/2)*Math.tan(rad(Math.max(-25,Math.min(40,a.knee))/2));
  const knee=[mx+off*(-dy/len),my+off*(dx/len)];
  stroke(P.gold);pdf.setLineWidth(.35);pdf.setLineDashPattern([1.2,1],0);pdf.line(ax,ay+1.5,ax,ear[1]-4.5);pdf.setLineDashPattern([],0);
  stroke(P.dark);pdf.setLineWidth(.8);
  pdf.line(ax,ay,ax+5,ay);[[ax,ay,knee],[...knee,hip],[...hip,sh],[...sh,ear]].forEach(([x1,y1,b])=>pdf.line(x1,y1,b[0],b[1]));
  pdf.setLineWidth(.2);
  fill(P.white);pdf.circle(ear[0]+.5,ear[1]-1,2.5,'F');stroke(P.dark);pdf.setLineWidth(.7);pdf.circle(ear[0]+.5,ear[1]-1,2.5,'S');pdf.setLineWidth(.2);
  [ear,sh,hip,knee,[ax,ay]].forEach(q=>{fill(P.dark);pdf.circle(q[0],q[1],.8,'F');});
  // Angle de la tête : verticale à l'épaule et ligne épaule-oreille.
  stroke(P.gold);pdf.setLineWidth(.35);pdf.setLineDashPattern([.8,.8],0);pdf.line(sh[0],sh[1],sh[0],sh[1]-neckL-1);pdf.setLineDashPattern([],0);
  txt('tête '+gnum(a.head,1)+'°',ear[0]+4.5,ear[1]+1,{sz:6.6,bold:true,col:P.dark});
  txt('tronc '+gnum(a.trunk,1)+'°',sh[0]+4,(sh[1]+hip[1])/2+1,{sz:6,col:P.muted});
  txt('genou '+gnum(a.knee,1)+'°',knee[0]+3.5,knee[1]+1,{sz:6,col:P.muted});
  txt('pointillés : verticale · schéma d’après la photo',ax+2,ay+5,{sz:5.6,col:P.muted,align:'center'});
  pdf.setLineWidth(.2);
 }
 function instruments(){
  // Protocole V2 : valeurs VALD, chrono et mètre saisies par l'opérateur. Aucune norme ni score.
  const rows=(report.instrumented||[]).filter(r=>r.status!=='missing');
  // Lever de chaise 30 s (compteur) : ajouté à sa place, en fin de protocole, avant la photo de profil.
  const chair=(report.measures||[]).find(m=>m.id==='sts');
  if(chair&&chair.display&&chair.display!=='—'){
   const row={id:'sts',name:chair.name,device:'Chaise 43 cm · compteur',status:'done',lines:['Levers complets en 30 s : '+chair.display]};
   const at=rows.findIndex(r=>r.id==='posture_photo');at<0?rows.push(row):rows.splice(at,0,row);
  }
  if(!rows.length)return;
  const title='Vos résultats en détail',sub='Chaque test, ce qu’il mesure et vos valeurs : votre point de départ, à comparer au contrôle.';
  page('Vos résultats',title,sub);
  let y=65;
  rows.forEach(r=>{
   const lines=r.status==='skipped'?[...(r.lines||['Non realise']),...(r.note?['Note : '+r.note]:[])]:(r.lines.length?r.lines:['Aucune valeur']);
   const plain=PLAIN[r.id]||'';
   let h=11+(plain?4.4:0)+lines.length*4.3;
   if(r.pair||r.hold)h=Math.max(h,27);
   if(r.profile)h=Math.max(h,52);
   if(y+h>274){page('Vos résultats',title+' (suite)','');y=65;}
   box(M,y,C,h,P.sand,2);
   txt(String(r.name).replace(/ - (ForceDecks|DynaMo)$/,'').replace(/ · (ForceDecks|DynaMo)$/,''),M+7,y+7.5,{sz:9.6,bold:true});
   if(r.device)txt(r.device,R-7,y+7.5,{sz:7.2,col:P.muted,align:'right'});
   let yy=y+12.5;
   if(plain){txt(plain,M+7,yy,{sz:7.6,col:P.gold});yy+=4.4;}
   lines.forEach(l=>{txt(l,M+7,yy,{sz:8.1,col:r.status==='skipped'?P.muted:P.text});yy+=4.3;});
   // Barres : gauche / droite (le côté le plus faible en doré) ; tenue sur un pied sur 30 s, repère 10 s.
   const bx=R-74,bw=54;
   if(r.pair){
    const mx=Math.max(r.pair.left,r.pair.right)*1.08||1;
    [['G',r.pair.left],['D',r.pair.right]].forEach(([l,v],i)=>{
     const by=y+17.5+i*5.2,weak=v<Math.max(r.pair.left,r.pair.right);
     txt(l,bx-3,by+2.3,{sz:6.8,bold:true,col:P.muted,align:'right'});
     box(bx,by,bw,3,P.white,1.4);box(bx,by,Math.max(2,bw*v/mx),3,weak?P.gold:P.dark,1.4);
     txt(gnum(v,0)+' N',bx+bw+2,by+2.4,{sz:6.8,bold:true,col:P.dark});});
   }
   if(r.hold){
    const by=y+19.5,t=bx+bw*r.hold.cut/r.hold.max;
    box(bx,by,bw,3,P.white,1.4);box(bx,by,Math.max(2,bw*Math.min(r.hold.value,30)/30),3,r.hold.value<10?[150,70,50]:P.dark,1.4);
    stroke(P.gold);pdf.setLineWidth(.6);pdf.line(t,by-1.5,t,by+4.5);
    txt('10 s',t,by-2.3,{sz:6,bold:true,col:P.gold,align:'center'});txt('30 s',bx+bw,by-2.3,{sz:6,col:P.muted,align:'right'});
    txt(gnum(r.hold.value,1)+' s',bx+bw+2,by+2.4,{sz:6.8,bold:true,col:P.dark});
   }
   if(r.profile)profileFigure(r.profile,R-44,y+h-9,h-25);
   y+=h+3;
  });
 }
 function trajectoire(){
  // J0 -> S6 -> S12 : memes tests, memes conditions. Ecarts descriptifs, aucun score composite.
  const t=report.trajectory;
  if(!t||!Array.isArray(t.points)||t.points.length<2||!t.rows?.length)return;
  page('Votre trajectoire','Vos progrès mesurés','Évolution de vos mesures entre les consultations : '+t.points.map(p=>p.label+' ('+p.date.split('-').reverse().join('/')+')').join(' -> ')+'.');
  const pts=t.points.slice(-4),cols=pts.length;
  const labelW=70,deltaW=22,sparkW=26,colW=(C-labelW-deltaW-sparkW)/cols;
  // En bref : les progrès réels en clair, avant le tableau complet.
  const fav=t.rows.filter(r=>r.verdict==='favorable'),def=t.rows.filter(r=>r.verdict==='defavorable');
  const stable=t.rows.filter(r=>r.verdict==='stable'&&r.better!=='neutral').length;
  const brief=[fav.length?'Progrès réels : '+fav.map(r=>(r.label.charAt(0).toLowerCase()+r.label.slice(1))+' ('+r.deltaDisplay+(r.unit?' '+r.unit:'')+')').join(', ')+'.':'Pas encore de progrès au-delà de la marge d’erreur de la mesure.',
   def.length?'À surveiller : '+def.map(r=>(r.label.charAt(0).toLowerCase()+r.label.slice(1))+' ('+r.deltaDisplay+(r.unit?' '+r.unit:'')+')').join(', ')+'.':'',
   stable+' mesure'+(stable>1?'s':'')+' stable'+(stable>1?'s':'')+' : l’écart reste dans la marge d’erreur.',
   'Le tableau montre les mesures principales ; toutes les valeurs sont dans les pages « Vos résultats ».'].filter(Boolean).join(' ');
  font(8.4);const bl=pdf.splitTextToSize(cleaner(brief),C-14).length;
  box(M,63,C,11+bl*4.2,P.pale,3);
  txt('EN BREF',M+7,69.5,{sz:7.4,bold:true,col:P.dark});
  words(brief,M+7,75,C-14,{sz:8.4,lh:4.2,max:6,col:P.text});
  let y=63+11+bl*4.2+11;
  box(M,y-6,C,9,P.dark,1.5);
  txt('MESURE',M+3,y,{sz:7.2,bold:true,col:P.white});
  pts.forEach((p,i)=>txt(p.label,M+labelW+colW*i+colW/2,y,{sz:7.2,bold:true,col:P.white,align:'center'}));
  txt('COURBE',R-deltaW-sparkW/2,y,{sz:7.2,bold:true,col:P.white,align:'center'});
  txt('ÉVOLUTION',R-3,y,{sz:7.2,bold:true,col:P.white,align:'right'});
  y+=9;
  // Le tableau garde les mesures clés et tout changement réel ; les autres sont résumées dans « En bref ».
  const KEY=new Set(['eva_back','eva_leg','eva_general','odi','gait_speed','sts_30s','sts_power','balance_min','qs_velocity','qs_ec_velocity','sls_velocity','cmj_power','grip_best','elbow_best','knee_best','head_forward']);
  const shownRows=t.rows.filter(r=>KEY.has(r.id)||r.notable);
  shownRows.forEach((r,idx)=>{
   if(y>262){page('Votre trajectoire','Vos progrès mesurés (suite)','');y=68;}
   if(idx%2===0)box(M,y-5.2,C,8,P.sand);
   txt(r.label+(r.unit?' ('+r.unit+')':''),M+3,y,{sz:7.6});
   const vals=r.display.slice(-cols);
   vals.forEach((v,i)=>txt(v,M+labelW+colW*i+colW/2,y,{sz:7.8,bold:i===vals.length-1,align:'center'}));
   const col=r.verdict==='favorable'?P.dark:r.verdict==='defavorable'?[150,70,50]:P.muted;
   // Mini-courbe : une valeur par consultation ; point final vert (progrès réel), rouge (recul réel) ou gris (stable).
   const sv=r.values.slice(-cols),fin=sv.filter(v=>Number.isFinite(v));
   if(fin.length>1){
    const lo=Math.min(...fin),hi=Math.max(...fin),sx=R-deltaW-sparkW+3,sw=sparkW-6;
    const P2=(v,i)=>[sx+sw*(sv.length>1?i/(sv.length-1):0),y-0.6-(hi>lo?(v-lo)/(hi-lo):0.5)*4.2];
    let prev=null;sv.forEach((v,i)=>{if(!Number.isFinite(v))return;const q=P2(v,i);if(prev)line(prev[0],prev[1],q[0],q[1],P.muted,.5);prev=q;});
    sv.forEach((v,i)=>{if(!Number.isFinite(v))return;const q=P2(v,i),last=i===sv.length-1;
     fill(last?(r.verdict==='favorable'?[40,120,80]:r.verdict==='defavorable'?[150,70,50]:P.muted):P.muted);pdf.circle(q[0],q[1],last?1.1:.7,'F');});
   }
   txt(r.deltaDisplay+(r.notable?' *':''),R-3,y,{sz:7.8,bold:true,col,align:'right'});
   y+=8;
  });
  y+=4;
  words('* Changement réel : au-delà de la marge d’erreur de la mesure (douleur 2 points ; ODI 10 points ; marche 0,1 m/s ; chaise 2 levers ; préhension 50 N ; franchissement des 10 s sur un pied ; posture 5° ; environ 20 % pour les autres forces et les plateformes). Un écart plus petit est affiché stable : il peut venir de la mesure elle-même.',
   M,y,C,{sz:7,lh:3.4,max:3,col:P.muted});
  y+=12;
  (t.warnings||[]).forEach(w=>{y=words('Comparabilite : '+w,M,y,C,{sz:7,lh:3.4,max:2,col:[150,70,50]})+1;});
 }
 // Trajectoire prévue (23/11/2026) : aujourd'hui → 30 jours (habitudes installées) → 6 semaines (mesures de contrôle).
 // À 30 jours, on vérifie la pratique et non des chiffres : un écart de mesure aussi court resterait dans la marge
 // d'erreur. À 6 semaines, l'objectif est mesuré dans les mêmes conditions.
 function planTrajectory(){
  const d0=report.date,d30=addDays(d0,30),d42=addDays(d0,42);
  const second=report.trajectory?.points?.length>1;
  page('Votre trajectoire','Aujourd’hui, 30 jours, 6 semaines','Où vous en êtes aujourd’hui, ce que vous faites pendant 30 jours, et ce que nous mesurerons ensemble à 6 semaines.');
  // Frise.
  const x1=M+16,x2=M+C/2,x3=R-16,yl=78;
  line(x1,yl,x3,yl,P.line,1.4);
  [[x1,P.dark,'AUJOURD’HUI',frShort(d0)],[x2,P.gold,'30 JOURS',frShort(d30)],[x3,P.dark,'6 SEMAINES',frShort(d42)+' · contrôle']]
   .forEach(([x,c,l,d])=>{fill(c);pdf.circle(x,yl,3.2,'F');txt(l,x,yl+9,{sz:8,bold:true,col:P.dark,align:'center'});txt(d,x,yl+14,{sz:7.6,col:P.muted,align:'center'});});
  txt('Sem. 1-2 : apprendre · Sem. 3-4 : progresser',(x1+x2)/2,yl-5,{sz:7.4,col:P.gold,align:'center'});
  txt('Sem. 5-6 : consolider',(x2+x3)/2,yl-5,{sz:7.4,col:P.gold,align:'center'});
  // Tableau : une ligne par capacité.
  const cols=[38,34,54,52],xs=[M,M+38,M+72,M+126];
  let y=103;
  box(M,y-5.5,C,9,P.dark,1.5);
  ['CAPACITÉ','AUJOURD’HUI','À 30 JOURS : VOUS FAITES','À 6 SEMAINES : OBJECTIF'].forEach((h,i)=>txt(h,xs[i]+3,y,{sz:6.8,bold:true,col:P.white}));
  y+=8;
  const prio=Object.fromEntries((lp.priorities||[]).map(p=>[p.id,p]));
  const objective=c=>prio[c.id]?.objective||(lp.objectives||[]).find(o=>o.name===c.name)?.target||'Garder ce niveau';
  const walk=(lp.exercises||[]).find(e=>e.key==='walk');
  const habit=c=>{const e=(lp.exercises||[]).find(x=>x.capacity===c.id&&x.key!=='walk')||(c.id==='walk'?walk:null);
   return e?e.title+' · '+e.frequency:c.id==='strength'?'Serrer et porter · 3 fois par semaine':'Marche quotidienne'};
  const ZL={priority:'Priorité',consolidate:'À consolider',solid:'Solide',follow:'Suivi',missing:'Non mesuré'};
  const ZC={priority:[150,70,50],consolidate:P.gold,solid:P.dark,follow:P.muted,missing:P.muted};
  (lp.capacities||[]).forEach((c,i)=>{
   const m=c.measures.find(x=>x.value!==null&&x.value!==undefined);
   const h=17;
   if(i%2===0)box(M,y-4.5,C,h,P.sand);
   words(c.name,xs[0]+3,y,cols[0]-5,{sz:8.6,lh:3.8,max:2,bold:true,col:P.dark});
   txt(ZL[c.zone]||'',xs[0]+3,y+(c.name.length>18?8:4.4),{sz:6.8,bold:true,col:ZC[c.zone]||P.muted});
   if(m){txt(m.value+(m.unit?' '+m.unit:''),xs[1]+3,y,{sz:9.5,bold:true,col:P.dark});
    words(m.label,xs[1]+3,y+4.4,cols[1]-5,{sz:6.8,lh:3.2,max:2,col:P.muted});}
   else txt('Non mesuré',xs[1]+3,y,{sz:8.2,col:P.muted});
   words(habit(c),xs[2]+3,y,cols[2]-5,{sz:8,lh:3.7,max:3});
   words(objective(c),xs[3]+3,y,cols[3]-5,{sz:8,lh:3.7,max:3,bold:!!prio[c.id],col:P.dark});
   y+=h;
  });
  // À 30 jours : la pratique, à cocher par le patient.
  y+=4;
  const checks=['12 séances du programme faites (3 par semaine, environ 20 minutes)',
   (walk?'Marche : '+walk.dose+', '+walk.frequency:'Marche presque tous les jours'),
   'Exercices devenus faciles : passer à l’étape « Ensuite » de chaque fiche',
   'Douleur qui persiste, malaise ou chute : appeler le cabinet avant de continuer'];
  const hb=12+checks.length*6.4;
  box(M,y,C,hb,P.pale,3);
  txt('À 30 JOURS, LE '+frShort(d30)+' : COCHEZ',M+7,y+8,{sz:7.8,bold:true,col:P.dark});
  checks.forEach((t,i)=>{const yy=y+15+i*6.4;stroke(P.dark);pdf.setLineWidth(.35);pdf.rect(M+7,yy-3.2,3.6,3.6);
   txt(t,M+14,yy,{sz:8.4});});
  y+=hb+5;
  box(M,y,C,25,P.sand,3);
  txt('À 6 SEMAINES, LE '+frShort(d42)+' : '+(second?'PROCHAIN ':'')+'CONTRÔLE',M+7,y+8,{sz:7.8,bold:true,col:P.dark});
  words('Mêmes tests, mêmes conditions : pieds nus, même heure si possible. Un progrès compte quand il dépasse la marge d’erreur de la mesure : +0,1 m/s à la marche, +2 levers de chaise, franchir 10 s sur un pied, environ 20 % pour la force.',
   M+7,y+14,C-14,{sz:8,lh:3.9,max:3,col:P.text});
 }
 function exercises(){
  page('Votre programme','Votre programme maison','Choisi à partir de vos résultats. Une chaise, un mur, un plan de travail : 20 minutes, 3 fois par semaine.');
  txt('4 EXERCICES CIBLÉS',M,67,{sz:8.5,bold:true,col:P.gold});
  const work=plan.exercises.filter(e=>e.key!=='walk').slice(0,4);
  work.forEach((e,i)=>{
   const col=i%2,row=Math.floor(i/2),x=M+col*91,y=73+row*68;
   box(x,y,87,63,P.sand,3);
   txt('0'+(i+1),x+7,y+10,{sz:8,bold:true,col:P.gold});
   txt(e.title,x+18,y+10,{sz:10,bold:true});
   if(e.relevance)txt(e.relevance,x+18,y+15.5,{sz:6.8,bold:true,col:P.gold});
   // Dose longue (ex. « 3 × 12 par côté, côté faible en premier ») : police réduite pour rester dans la carte.
   let doseSz=13.5;font(doseSz,true);while(doseSz>9&&pdf.getTextWidth(cleaner(e.dose))>74){doseSz-=.5;font(doseSz,true)}
   txt(e.dose,x+7,y+26,{sz:doseSz,bold:true,col:P.dark});
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
  page('Nutrition','Nutrition & apports','Priorité aux aliments, à l’exercice adapté et aux habitudes durables.');
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

  page('Nutrition','Compléments & précautions','Options à discuter, jamais prescrites automatiquement par le questionnaire ou les mesures.');
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
   page('Annexe · questionnaire','Votre ressenti','Questionnaire en 22 réponses : ce que vous vivez au quotidien, à côté de ce que nous avons mesuré.');
   box(M,66,112,120,P.sand,3);drawRadar(M+4,74);
   txt('POINTS DE GÊNE : '+fmt(report.questionnaire.rawPoints)+' / '+fmt(report.questionnaire.maxPoints),M+7,176,{sz:7,bold:true,col:P.muted});
   txt('20 ITEMS COTES / NON VALIDE',M+7,182,{sz:6.7,col:P.muted});
   txt('INDICE DÉCLARÉ',M+122,74,{sz:7,bold:true,col:P.muted});
   txt(fmt(report.questionnaire.index)+'/100',M+122,86,{sz:17,bold:true,col:P.dark});
   words('Plus haut = moins de limitations déclarées. Barème KOMO interne, distinct des mesures et sans valeur diagnostique.',M+122,96,54,{sz:7.6,lh:3.8,max:6,col:P.muted});
  }
  const printGroups=(subset,part)=>{
   page('Annexe · questionnaire',part===1?'Questionnaire : autonomie':'Questionnaire : habitudes',
    'Reponses exactes enregistrees. '+report.questionnaire.answered+' / '+report.questionnaire.total+
    ' · '+(report.simulated?'Reponses fictives pour demonstration.':'Profil auto-declare exploratoire.'));
   txt(report.questionnaire.complete?
    'TOTAL : '+fmt(report.questionnaire.rawPoints)+'/'+fmt(report.questionnaire.maxPoints)+
    ' pts de difficulte | Indice pondere : '+fmt(report.questionnaire.index)+'/100':
    'QUESTIONNAIRE INCOMPLET : aucun score global calcule.',M,65,{sz:7.8,bold:true,col:P.dark});
   let y=76,serial=part===1?0:10;
   for(const g of subset){
    // Pas de titre de groupe seul en bas de page.
    if(y>236){page('Annexe · questionnaire','Questionnaire (suite)','Réponses enregistrées / vérifiables');y=69;}
    txt(g.label.toUpperCase(),M,y,{sz:10,bold:true,col:P.gold});
    if(Number.isFinite(g.score))txt(fmt(g.points)+'/'+fmt(g.maxPoints)+
      ' pts  |  '+fmt(g.score)+'/100',R,y,
      {sz:8,bold:true,align:'right',col:P.gold});
    else if(g.headline)txt(g.headline,R,y,{sz:8,bold:true,align:'right',col:P.dark});
    y+=8;
    for(const item of g.items){
     serial+=1;
     if(y>250){
      page('Annexe · questionnaire','Questionnaire (suite)','Réponses enregistrées / vérifiables');
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
     txt(item.tag?item.tag:item.maxPoints===null?'Contexte':item.points===null?
       '- / 4 pts':fmt(item.points)+' / 4 pts',R,answerY,
      {sz:7.8,bold:true,align:'right',col:P.gold});
     y=afterAnswer+3.1;
     line(M+11,y-1,R,y-1,P.line,.22);
     y+=3.3;
    }
    // Mention de droits de l'instrument (ODI, sous licence).
    if(g.credit){if(y>256){page('Annexe · questionnaire','Questionnaire (suite)','Réponses enregistrées / vérifiables');y=69;}
     y=words(g.credit,M+11,y,C-13,{sz:6.8,lh:3,max:2,col:P.muted})+2;}
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
 const renderers={synthese:capacites,instruments,trajectoire,plan:planTrajectory,priorites,exercices:exercises,nutrition,questionnaire};
 const chapters=category==='all'?['synthese','priorites','plan','trajectoire','exercices','instruments','nutrition','questionnaire']:
  category==='tests'?['instruments']:category==='suivi'?['plan','trajectoire']:
  category==='exercices'?['priorites','exercices']:[category];
 for(const chapter of chapters)renderers[chapter]();
 footer();
 const code=cleaner(report.subject||'').replace(/[^A-Za-z0-9-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,40);
 const name='KOMO_Motion_'+(code?code+'_':'')+(category==='all'?'Passeport_Complet':category)+
  '_'+report.date+'.pdf';
 pdf.save(name);
 return name;
}
