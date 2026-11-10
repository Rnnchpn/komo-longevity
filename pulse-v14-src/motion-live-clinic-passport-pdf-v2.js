// Premium A4 clinical-style Motion Passport for supervised fictional KŌMØ sessions.
// Browser-only PDF creation. No questionnaire, biometrics or report is uploaded.
import {CLINIC_PASSPORT_VERSION} from './motion-live-clinic-passport-v2.mjs';
const latin=x=>String(x??'').replace(/œ/g,'oe').replace(/Œ/g,'OE')
 .replace(/Ō/g,'O').replace(/ō/g,'o').replace(/ø/g,'o')
 .replace(/[‘’]/g,"'").replace(/[“”]/g,'"')
 .replace(/[—–‑]/g,'-').replace(/[≤]/g,'<=').replace(/[≥]/g,'>=')
 .replace(/[\u2022]/g,'-').replace(/[^\u0020-\u007e\u00a0-\u00ff]/g,' ');
const format=x=>typeof x==='number'&&Number.isFinite(x)?
 (Number.isInteger(x)?String(x):x.toFixed(1).replace('.',',')):'—';
const ink={
 dark:[23,42,40],paper:[250,247,241],sand:[241,235,226],
 brass:[188,157,110],muted:[109,115,108],pale:[218,228,220],
 line:[224,218,208],white:[255,253,246],warning:[145,109,62]
};
export async function downloadClinicPassport(report){
 if(!report||report.version!==CLINIC_PASSPORT_VERSION)throw Error('invalid_clinic_passport');
 const {jsPDF}=await import('https://esm.sh/jspdf@4.2.1');
 if(typeof jsPDF!=='function')throw Error('pdf_engine_unavailable');
 const pdf=new jsPDF({format:'a4',unit:'mm',compress:true});
 pdf.setProperties({title:'KOMO Motion Passport - '+report.date,
  subject:'Compte rendu locomoteur exploratoire',author:'KOMO Pulse',keywords:'Motion, locomotion, bilan, passeport'});
 const W=210,H=297,M=17,R=W-M,C=W-2*M;
 const fill=(c)=>pdf.setFillColor(...c);
 const stroke=c=>pdf.setDrawColor(...c);
 const color=c=>pdf.setTextColor(...c);
 const font=(name='helvetica',style='normal',size=10)=>{pdf.setFont(name,style);pdf.setFontSize(size)};
 const rect=(x,y,w,h,clr,r=0)=>{
  fill(clr);if(r)pdf.roundedRect(x,y,w,h,r,r,'F');else pdf.rect(x,y,w,h,'F');
 };
 const txt=(str,x,y,{size=10,bold=false,serif=false,clr=ink.dark,align='left'}={})=>{
  font(serif?'times':'helvetica',bold?'bold':'normal',size);color(clr);
  pdf.text(latin(str),x,y,{align});
 };
 let y=0,section=0;
 function newPage(kicker,title){
  if(section++)pdf.addPage();
  rect(0,0,W,H,ink.paper);
  rect(0,0,W,3,ink.dark);
  txt('KOMO',M,17,{size:16,bold:true,serif:true});
  txt('MOTION PASSPORT',M+28,16.4,{size:8,bold:true,clr:ink.muted});
  txt('CONSULTATION AU CABINET / DEMONSTRATION',R,16.4,{size:7,clr:ink.muted,align:'right'});
  stroke(ink.line);pdf.line(M,23,R,23);
  y=35;
  if(kicker)txt(kicker.toUpperCase(),M,y,{size:8,bold:true,clr:ink.brass});
  if(title){y+=13;txt(title,M,y,{size:24,serif:true});y+=11;}
 }
 function need(h){
  if(y+h<=H-22)return;
  newPage('Suite du dossier','');
 }
 function block(text,{size=9,clr=ink.dark,bold=false,gap=5.0,width=C,x=M,spacing=2}={}){
  const lines=(()=>{font('helvetica',bold?'bold':'normal',size);return pdf.splitTextToSize(latin(text),width)})();
  need(lines.length*gap+spacing+1);
  font('helvetica',bold?'bold':'normal',size);color(clr);
  pdf.text(lines,x,y);
  y+=lines.length*gap+spacing;
 }
 function rule(){stroke(ink.line);pdf.line(M,y,R,y);y+=6;}
 function sectionTitle(label){need(17);txt(label,M,y+6,{size:15,serif:true});y+=17;}
 function label(v,x=M,at=y){txt(v.toUpperCase(),x,at,{size:7.3,bold:true,clr:ink.muted});}
 function reportFooter(){
  const pages=pdf.getNumberOfPages();
  for(let i=1;i<=pages;i++){
   pdf.setPage(i);stroke(ink.line);pdf.line(M,H-18,R,H-18);
   txt('KOMO PULSE / PASSEPORT EXPERIMENTAL - DOSSIER FICTIF',M,H-12.5,{size:7,clr:ink.muted});
   txt(String(i).padStart(2,'0')+' / '+String(pages).padStart(2,'0'),R,H-12.5,{size:7,bold:true,clr:ink.dark,align:'right'});
  }
 }
 // COVER: warm editorial hierarchy, capped metrics, honest missing questionnaire.
 newPage('Premiere evaluation fonctionnelle','Votre passeport locomoteur');
 block('Mesurer le mouvement. Documenter les capacites. Suivre une trajectoire.',{size:10,clr:ink.muted});
 y+=6;
 rect(M,y,C,46,ink.dark,3);
 txt('LE CORPS EN MOUVEMENT',M+10,y+11,{size:8,bold:true,clr:ink.brass});
 txt(String(report.measured)+'/6',M+9,y+34,{size:31,bold:true,clr:ink.white});
 txt('tests enregistres',M+55,y+28,{size:10,clr:ink.white});
 txt(report.questionnaire.answered+'/22  reponses',M+55,y+37,{size:9,clr:ink.brass});
 txt('POINT DE DEPART - NON DIAGNOSTIQUE',R-9,y+12,{size:7.2,clr:ink.white,align:'right'});
 y+=53;
 const cells=report.measures;
 for(let i=0;i<6;i++){
  const x=M+(i%2)*((C-6)/2+6),w=(C-6)/2,h=33;
  const at=y+Math.floor(i/2)*38;
  rect(x,at,w,h,ink.sand,2);
  txt(('0'+(i+1)).slice(-2),x+7,at+8,{size:7.5,bold:true,clr:ink.brass});
  txt(cells[i].short,x+7,at+15,{size:8.5,clr:ink.dark});
  const v=cells[i].id==='posture'?cells[i].display:
   cells[i].value===null?'Non mesure':format(cells[i].value)+
     (cells[i].id.startsWith('unipodal')?' s':cells[i].id==='sts'?' levers':' reps');
  const ls=pdf.splitTextToSize(latin(v),w-14);
  font('helvetica','bold',i===5?10:15);color(ink.dark);
  pdf.text(ls.slice(0,2),x+7,at+26);
 }
 y+=3*38+7;
 need(24);
 rect(M,y,C,20,ink.sand,2);
 txt('QUESTIONNAIRE : '+(report.questionnaire.complete?'COMPLET':'A COMPLETER'),M+7,y+8,{size:9,bold:true,clr:ink.dark});
 txt(report.questionnaire.answered+' / '+report.questionnaire.total+' reponses. Aucun score global en cas de donnees incompletes.',M+7,y+14.5,{size:7.9,clr:ink.muted});
 y+=25;
 // PAGE 2: factual results and provenance.
 newPage('Resultats / six epreuves','Le profil fonctionnel');
 block('Chaque valeur presente la mesure observee, la methode et les conditions d interpretation. Une mesure video ne remplace pas une evaluation instrumentee.',{size:9,clr:ink.muted});
 y+=4;
 for(const [index,m] of report.measures.entries()){
  const short=m.id==='sts'?'30 SEC CHAIR STAND':m.id.startsWith('unipodal')?'APPUI UNIPODAL, YEUX OUVERTS':m.id==='posture'?'PHOTO SAGITTALE 2D':'MOUVEMENT VIDEO';
  need(m.id==='posture'?38:38);
  rule();
  txt('0'+(index+1)+'  '+m.name,M,y,{size:11,bold:true});
  txt(short,R,y,{size:7,clr:ink.muted,align:'right'});
  y+=9;
  txt(m.display,M,y,{size:m.id==='posture'?12:16,bold:true,clr:ink.dark});
  y+=8;
  block(m.method,{size:8.1,clr:ink.muted,gap:4.1,spacing:1});
  block('Traçabilite : '+m.source+(m.quality===null?'':' · suivi '+m.quality+' %')+
   (m.review?' · MESURE A REVOIR':''),{size:7.5,clr:m.review?ink.warning:ink.muted,gap:4,spacing:1});
  if(m.note)block('Note operateur : '+m.note,{size:7.5,clr:ink.muted,gap:4,spacing:1});
 }
 if(report.balance){
  need(35);sectionTitle('Lecture bilaterale de l equilibre');
  block('Gauche '+format(report.balance.left)+' s · Droite '+format(report.balance.right)+' s · Ecart apparent '+format(report.balance.delta)+' s.',{size:10.2,bold:true});
  block(report.balance.interpretation,{size:8.5,clr:ink.muted});
 }
 // PAGE 3: clinically responsible reasoning, priorities and timelines.
 newPage('Interpretation / aide a la restitution','Ce que montrent ces donnees');
 for(let i=0;i<report.findings.length;i++){
  need(27);
  txt(('0'+(i+1)).slice(-2),M,y,{size:10,bold:true,clr:ink.brass});
  const before=y;y+=1;
  block(report.findings[i],{size:9.2,x:M+15,width:C-17,gap:5.1,spacing:8});
  if(y-before<15)y=before+15;
  rule();
 }
 y+=3;sectionTitle('Les prochaines priorites');
 for(let i=0;i<report.priorities.length;i++){
  const p=report.priorities[i];need(42);
  rect(M,y,C,31,ink.sand,2);
  txt(String(i+1).padStart(2,'0'),M+7,y+9,{size:10,bold:true,clr:ink.brass});
  txt(p.title,M+20,y+9,{size:10,bold:true});
  let desc=latin(p.detail);
  font('helvetica','normal',8.1);
  const lines=pdf.splitTextToSize(desc,C-29);
  const shown=lines.slice(0,3);color(ink.dark);pdf.text(shown,M+20,y+16);y+=35;
  block(p.basis,{size:7.5,clr:ink.muted,gap:4,spacing:4});
 }
 y+=4;
 need(25);
 rect(M,y,C,21,ink.dark,2);
 txt('PROCHAIN CONTROLE',M+8,y+8,{size:8,bold:true,clr:ink.brass});
 txt('4 - 6 semaines / conditions identiques, memes tests et mesures confirmees',M+8,y+15.5,{size:8.5,clr:ink.white});
 y+=28;
 // PAGE 4: questionnaires; if incomplete, never invent responses.
 newPage('Autoevaluation / donnees declarees','Le regard du participant');
 block('La mobilite percue et les facteurs de vie quotidienne sont distincts des mesures physiques. Les questions KŌMØ sont exploratoires, non diagnostiques.',{size:9,clr:ink.muted});
 y+=5;
 rect(M,y,C,31,ink.dark,2);
 txt(report.questionnaire.answered+' / '+report.questionnaire.total,M+9,y+19,{size:23,bold:true,clr:ink.white});
 txt('reponses disponibles',M+74,y+18,{size:10,clr:ink.white});
 y+=42;
 if(report.questionnaire.answered===0){
  sectionTitle('Aucune reponse enregistree');
  block('Les cinq domaines du questionnaire - profil, mobilite percue, douleur et confiance, recuperation, habitudes actives - restent a renseigner. Aucun indice n est affiche.',{size:10});
  sectionTitle('A completer lors du prochain echange');
  block('Les 22 questions restent accessibles dans l onglet Questionnaires de KŌMØ Pulse. Un nouveau PDF pourra etre genere apres leur saisie.',{size:9.5,clr:ink.muted});
 }else{
  for(const group of report.questionnaire.groups){
   need(26);sectionTitle(group.label);
   for(const item of group.items){
    need(16);
    block(item.question,{size:8.6,gap:4.1,spacing:0});
    block(item.answer,{size:8.5,bold:true,clr:item.answer==='Non renseigné'?ink.warning:ink.dark,
     x:M+5,width:C-5,gap:4.2,spacing:5});
   }
  }
 }
 if(report.questionnaire.complete){
  need(25);sectionTitle('Indice declare exploratoire');
  block(format(report.questionnaire.index)+' / 100 · Indicateur interne du questionnaire KŌMØ : non valide, sans equivalence avec un age biologique ou un risque individuel.',{size:9});
 }
 // PAGE 5 - references + rigorous limits, repeatability frame.
 newPage('Methode / tracabilite','Un passeport, pas un diagnostic');
 block('Périmètre : vidéo monoculaire sur iPhone du praticien, analyse 2D locale et validation des observations par l opérateur. Pas de transmission ni stockage des images dans ce rapport.',{size:9,clr:ink.muted});
 y+=4;sectionTitle('Comment lire les resultats');
 for(const statement of report.limitations)block('- '+statement,{size:8.6,clr:ink.dark,gap:4.5,spacing:4});
 y+=6;sectionTitle('References de protocole');
 for(let i=0;i<report.evidence.length;i++){
  const e=report.evidence[i];need(30);
  txt(('0'+(i+1)).slice(-2)+'  '+e.name,M,y,{size:8.7,bold:true});y+=6;
  block(e.meaning,{size:7.8,clr:ink.muted,gap:4.2,spacing:1});
  block(e.url,{size:7.1,clr:ink.muted,gap:4.1,spacing:5});
 }
 y+=6;need(28);
 rect(M,y,C,29,ink.sand,2);
 txt('STANDARDISATION DU PROCHAIN BILAN',M+7,y+9,{size:9,bold:true});
 txt('Meme chaise, meme placement camera, meme consigne et validation operateur.',M+7,y+16,{size:8,clr:ink.muted});
 txt('Documenter les essais et tout incident avant de comparer les trajectoires.',M+7,y+22,{size:8,clr:ink.muted});
 reportFooter();
 const filename='KOMO_Motion_Passeport_'+report.date+'.pdf';
 pdf.save(filename);
 return filename;
}
