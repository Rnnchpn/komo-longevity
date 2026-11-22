// Fiches papier de la consultation (A4) : 1) identité, sécurité et consentement ; 2) feuille de mesures de secours.
// La feuille de mesures est générée depuis pulse-v14-src/motion-protocol.mjs (mêmes tests, mêmes unités que la console).
// Usage : node scripts/guide/build-fiches.mjs [sortie.pdf]
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {createRequire} from 'node:module';
import {PROTOCOL,STEPS,STATIONS} from '../../pulse-v14-src/motion-protocol.mjs';
const puppeteer=createRequire(process.env.PUPPETEER_HOME||'/home/claude/tools/')('puppeteer-core');

const here=dirname(fileURLToPath(import.meta.url));
const OUT=process.argv[2]||join(here,'KOMO_Motion_Fiches_patient.pdf');
const e=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const box='<span class="box"></span>';
const blank=(w,unit='')=>'<span class="blank" style="width:'+w+'mm"></span>'+(unit?'<span class="unit">'+e(unit)+'</span>':'');
const opts=list=>list.map(l=>'<span class="opt">'+box+e(l)+'</span>').join('');

const SAFETY=[
 'Douleur thoracique, palpitations ou essoufflement inhabituel ces dernières semaines',
 'Malaise, perte de connaissance ou chute dans les 3 derniers mois',
 'Intervention chirurgicale, fracture ou prothèse récente (moins de 3 mois)',
 'Insuffisance cardiaque ou respiratoire mal équilibrée',
 'Tension artérielle non contrôlée',
 'Douleur aiguë actuelle : dos, hanche, genou, épaule ou main',
 'Ostéoporose sévère connue',
 'Vertiges ou trouble de l’équilibre connu'
];

function measureRow(s,n){
 const st=s.block+String(n);
 let cells='';
 if(s.id==='anthropometry')cells='Masse '+blank(16,'kg')+'Taille '+blank(16,'cm')+'<br>Chaussage '+opts(['pieds nus','chaussettes','chaussures'])+' Aide '+opts(['aucune','canne','déambulateur','autre']);
 else if(s.kind==='fields'&&s.holdTimer)cells='Essai 1 '+blank(14,'s')+'Essai 2 '+blank(14,'s')+'<span class="hint">30 s max · le meilleur est retenu</span><br>'+
  '<span class="fld">Vitesse CoP '+blank(13,'mm/s')+'</span><span class="hint">seulement si 30 s tenues</span>';
 else if(s.kind==='fields'&&s.walkway)cells='Passage 1 '+blank(16,'s')+'Passage 2 '+blank(16,'s')+'<span class="hint">le plus rapide est retenu</span>';
 else if(s.kind==='fields'&&s.pair){
  const [l,r]=s.pair;const f=k=>s.fields.find(x=>x.key===k);
  cells='Gauche '+blank(18)+'Droite '+blank(18)+'<span class="opt">'+box+'N</span><span class="opt">'+box+'kg</span>'+
   s.fields.filter(x=>x.key!==l&&x.key!==r).map(x=>e(x.label)+' '+blank(12,x.unit)).join('');
 }
 else if(s.kind==='fields')cells=s.fields.map(x=>'<span class="fld">'+e(x.label)+' '+blank(13,x.unit)+'</span>').join('')+
  (s.choices||[]).map(c=>'<span class="fld">Côté le plus chargé '+opts(['G','D','équilibré'])+'</span>').join('');
 else if(s.kind==='two_step')cells='Essai 1 '+blank(16,'cm')+'Essai 2 '+blank(16,'cm')+'Taille '+blank(14,'cm');
 else if(s.kind==='balance')cells='Essai 1 '+blank(14,'s')+'Essai 2 '+blank(14,'s')+'<span class="hint">30 s max · le meilleur est retenu</span>';
 else if(s.kind==='count')cells=blank(18,'levers')+'<span class="hint">levers complets en 30 s, mi-hauteur à la fin = compté</span>';
 else if(s.kind==='observation')cells=opts(s.options.map(([,l])=>l));
 return '<tr><td class="no">'+st+'</td><td class="name">'+e(s.title)+'</td><td class="vals">'+cells+'</td><td class="nr">'+box+'</td></tr>';
}

const html=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>KŌMØ Motion · Fiches patient</title><style>
@page{size:A4;margin:12mm 13mm 13mm}
:root{--ink:#1c342a;--ink2:#3f4a42;--muted:#6b6f66;--gold:#8a6d3f;--sand:#f5f1ea;--line:#cfc6b6}
*{box-sizing:border-box}
html{font-family:Inter,sans-serif;font-size:8.9pt;line-height:1.4;color:var(--ink2);-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0}
.sheet{page-break-after:always;break-after:page}
.sheet:last-child{page-break-after:auto;break-after:auto}
.sheet:last-child{page-break-after:auto}
.top{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid var(--ink);padding-bottom:2mm}
.brand{font-family:"Crimson Text",serif;font-size:12pt;color:var(--ink);letter-spacing:.06em}
.keep{font-size:7.6pt;color:var(--gold);font-weight:600;text-align:right;max-width:92mm}
h1{font-family:"Crimson Text",serif;font-weight:600;font-size:19pt;color:var(--ink);margin:2.4mm 0 0;line-height:1.1}
.sub{color:var(--muted);margin:0 0 3mm}
h2{font-size:9.6pt;font-weight:600;color:var(--ink);margin:3mm 0 1.4mm}
.box{display:inline-block;width:3.4mm;height:3.4mm;border:1.1px solid var(--ink);border-radius:.6mm;vertical-align:-.7mm;margin-right:1.2mm}
.blank{display:inline-block;border-bottom:1px solid var(--ink2);height:4.2mm;vertical-align:-1mm;margin:0 1mm}
.unit{color:var(--muted);margin-right:3.5mm}
.opt{white-space:nowrap;margin-right:3mm}
.hint{color:var(--muted);font-size:7.6pt}
.code{display:flex;gap:5mm;align-items:center;white-space:nowrap;background:var(--sand);border-radius:2mm;padding:2.2mm 4mm;margin-top:1.6mm}
.code b{font-size:9.6pt}
.digits{display:inline-flex;gap:1mm;align-items:center;font-weight:600;color:var(--ink);font-size:11pt}
.digits i{display:inline-block;width:5.4mm;height:7mm;border:1.1px solid var(--ink);border-radius:.8mm;background:#fff}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:2.4mm 8mm}
.row{display:flex;align-items:flex-end;gap:1mm;min-height:5.6mm}
.row label{white-space:nowrap}
.row .blank{flex:1}
table{width:100%;border-collapse:collapse}
.safety td{border-bottom:1px solid #e4dccf;padding:.75mm 1.5mm;vertical-align:middle}
.safety td.q{width:80%}
.safety th{font-size:7.8pt;color:var(--muted);font-weight:600;text-align:center;padding:0 1.5mm 1mm}
.safety td.c{text-align:center}
.safety td.c .box{margin:0}
.notice{font-size:8pt;color:var(--ink2);border-left:3px solid #b4925e;padding:1.5mm 3mm;margin-top:2mm;background:#fbf8f2}
.info p{margin:0 0 1.4mm;font-size:8pt;line-height:1.36}
.consent .opt{display:flex;white-space:normal;margin:0 0 1.6mm;align-items:flex-start}
.consent .opt .box{flex:none;margin-top:.5mm}
.sign{display:grid;grid-template-columns:1fr 1fr;gap:8mm;margin-top:2.5mm}
.sign div{border:1px solid var(--line);border-radius:2mm;padding:2.5mm 3mm;height:20mm}
.sign b{display:block;margin-bottom:1mm}
.sign span{color:var(--muted);font-size:7.8pt}
.foot{margin-top:2mm;font-size:7.6pt;color:var(--muted);display:flex;justify-content:space-between}
.measures{margin-top:2mm}
.measures th{text-align:left;font-size:7.8pt;color:var(--muted);font-weight:600;border-bottom:1.5px solid var(--ink);padding:1mm 1.5mm}
.measures td{border-bottom:1px solid #e4dccf;padding:.8mm 1.5mm;vertical-align:middle}
.measures td.no{width:8mm;font-weight:600;color:var(--gold)}
.measures td.name{width:43mm;font-weight:600;color:var(--ink);line-height:1.25}
.measures td.nr{width:9mm;text-align:center}
.measures td.vals{line-height:1.75;font-size:8.2pt}
.measures .station td{background:var(--sand);font-weight:600;color:var(--ink);padding:.9mm 1.5mm;font-size:8.2pt}
.fld{margin-right:2mm}
.cond{display:grid;grid-template-columns:28mm 1fr;gap:1.6mm 2mm;align-items:center}
.cond>span{font-weight:600;color:var(--ink)}
.notes{border:1px solid var(--line);border-radius:2mm;padding:2.5mm 3mm;margin-top:2.5mm;height:14mm}
</style></head><body>

<div class="sheet">
 <div class="top"><div class="brand">KŌMØ MOTION · Clinique HIRO</div><div class="keep">À conserver dans le dossier du cabinet. Ne jamais saisir, photographier ni transmettre.</div></div>
 <h1>Fiche patient</h1><p class="sub">Identité, sécurité et consentement · une fiche par bilan</p>
 <div class="code"><b>Code PULSE</b><span class="digits">HIRO –<i></i><i></i><i></i><i></i><i></i><i></i>–<i></i><i></i></span>
  <span>Date ${blank(26)}</span><span>Heure ${blank(14)}</span></div>
 <div class="row" style="margin-top:2.4mm"><label><b>Bilan</b></label>&nbsp;${opts(['Départ (J0)','Contrôle 6 semaines','Contrôle 12 semaines','Autre'])}</div>

 <h2>Identité</h2>
 <div class="grid">
  <div class="row"><label>Nom</label>${blank(10)}</div><div class="row"><label>Prénom</label>${blank(10)}</div>
  <div class="row"><label>Date de naissance</label>${blank(10)}</div><div class="row"><label>Sexe</label>&nbsp;${opts(['Femme','Homme','Non précisé'])}</div>
  <div class="row"><label>Téléphone</label>${blank(10)}</div><div class="row"><label>Médecin traitant</label>${blank(10)}</div>
 </div>

 <h2>Sécurité · à vérifier avant les tests</h2>
 <table class="safety"><thead><tr><th></th><th>Oui</th><th>Non</th></tr></thead><tbody>
 ${SAFETY.map(q=>'<tr><td class="q">'+e(q)+'</td><td class="c">'+box+'</td><td class="c">'+box+'</td></tr>').join('')}
 </tbody></table>
 <p class="notice">Un « oui » : pas de test de force maximale ni d’équilibre sans décision du praticien ; adapter, reporter ou orienter. Les tests se font toujours avec un appui à portée de main.</p>

 <h2>Conditions du bilan · à reprendre à l’identique au contrôle</h2>
 <div class="cond"><span>Chaussage</span><div>${opts(['pieds nus','chaussettes','chaussures'])}</div>
  <span>Aide de marche</span><div>${opts(['aucune','canne','déambulateur','autre'])}</div>
  <span>Lunettes</span><div>${opts(['oui','non'])}</div></div>

 <h2>Information</h2>
 <div class="info">
  <p>Le bilan KŌMØ Motion mesure la force, l’équilibre et la marche avec des plateformes de force, un dynamomètre et un chronomètre. Aucune image n’est prise. Les résultats sont situés par rapport à des repères publiés : ils ne constituent pas un diagnostic. Vous pouvez interrompre un test à tout moment.</p>
  <p>Vos résultats sont enregistrés dans le logiciel KŌMØ PULSE et dans l’application VALD sous un code, sans votre nom. Seule cette fiche, conservée au cabinet, relie votre nom à ce code. Responsable du traitement : Dr Renan Chapon (KŌMØ). Vous pouvez demander l’accès, la rectification ou l’effacement de vos données, ou vous opposer à leur traitement : contact@komolongevity.com. Vous pouvez aussi saisir la CNIL.</p>
 </div>
 <div class="consent">
  <span class="opt">${box}<span>J’ai reçu ces informations, j’ai pu poser mes questions et j’accepte de réaliser le bilan.</span></span>
  <span class="opt">${box}<span>J’accepte que mes résultats, enregistrés sous code, soient conservés pour comparer avec mes bilans de contrôle.</span></span>
 </div>
 <div class="sign">
  <div><b>Patient</b><span>Date et signature</span></div>
  <div><b>Praticien</b><span>Nom, date et signature</span></div>
 </div>
 <div class="foot"><span>Fiche signée → dans PULSE, cocher « Fiche KŌMØ signée : consentement recueilli et questionnaire de sécurité vérifié ».</span><span>${e(PROTOCOL.code)} ${e(PROTOCOL.version)}</span></div>
</div>

<div class="sheet">
 <div class="top"><div class="brand">KŌMØ MOTION · Clinique HIRO</div><div class="keep">Feuille sans nom : code seulement.</div></div>
 <h1>Feuille de mesures</h1><p class="sub">Les valeurs se notent ici pendant les tests, dans l’ordre de PULSE. À la fin : une photo de cette page seulement, pour la transcription dans PULSE.</p>
 <div class="code"><b>Code PULSE</b><span class="digits">HIRO –<i></i><i></i><i></i><i></i><i></i><i></i>–<i></i><i></i></span><span>Date ${blank(24)}</span><span>Praticien ${blank(22)}</span></div>
 <div class="row" style="margin-top:1.6mm"><span class="opt">${box}<b>Sécurité vérifiée</b>&nbsp;et fiche patient signée</span><span class="hint">Chiffres bien formés, virgule nette (3,38) ; une erreur se barre et se réécrit à côté.</span></div>
 <table class="measures"><thead><tr><th></th><th>Test</th><th>Valeurs</th><th>Non réalisé</th></tr></thead><tbody>
 ${(()=>{let out='',cur=null,n=0;for(const s of STEPS){n++;if(s.block!==cur){cur=s.block;out+='<tr class="station"><td colspan="4">Station '+s.block+' · '+e(STATIONS[s.block].label)+'</td></tr>';}out+=measureRow(s,n);}return out;})()}
 </tbody></table>
 <div class="notes"><b>Notes</b> <span class="hint">motif d’un test non réalisé (sécurité, douleur, refus, appareil indisponible…), incident, observation</span></div>
 <div class="foot"><span>DynaMo : cocher N ou kg selon l’écran. Photo : page entière, à plat, nette ; jamais la fiche patient.</span><span>${e(PROTOCOL.code)} ${e(PROTOCOL.version)}</span></div>
</div>
</body></html>`;

const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
const page=await browser.newPage();
await page.setContent(html,{waitUntil:'load'});
await page.evaluateHandle('document.fonts.ready');
await page.pdf({path:OUT,format:'A4',printBackground:true,preferCSSPageSize:true});
await browser.close();
console.log('[fiches] '+OUT);
