// Guide de consultation pas à pas (PDF A4) — KŌMØ Motion, Clinique HIRO.
// Les tests sont générés depuis pulse-v14-src/motion-protocol.mjs (v2.4 : sans caméra, tout depuis l'iPhone) : le guide imprimé et la console
// disent toujours la même chose. Usage : node scripts/guide/build-consultation-guide.mjs [sortie.pdf]
import {writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {createRequire} from 'node:module';
// puppeteer-core est installé dans l'outillage local (hors dépendances du site).
const puppeteer=createRequire(process.env.PUPPETEER_HOME||'/home/claude/tools/')('puppeteer-core');
import {PROTOCOL,STEPS,STATIONS,CAMERA_LABELS,COMPLEMENTS} from '../../pulse-v14-src/motion-protocol.mjs';
import {forStep,CHAIR_NORMS} from './longevity-reference.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const OUT=process.argv[2]||join(here,'KOMO_Motion_Guide_consultation.pdf');
const DATE='22 novembre 2026';
const e=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const unitFr={cm:'cm',kg:'kg',N:'N',s:'s','%':'%',mm:'mm','mm/s':'mm/s','W/kg':'W/kg'};
const N=STEPS.length,NS=new Set(STEPS.map(s=>s.block)).size;

function enterMarkup(s){
 if(s.kind==='fields'){
  const f=s.fields.map(x=>'<li><b>'+e(x.label)+'</b> ('+e(unitFr[x.unit]||x.unit)+')'+
   (x.vald?' <span class="vald">VALD : '+e(x.vald)+'</span>':'')+(x.optional?' <span class="opt">facultatif</span>':'')+'</li>');
  const c=(s.choices||[]).map(x=>'<li><b>'+e(x.label)+'</b> : '+x.options.map(([,l])=>e(l)).join(', ')+'</li>');
  const extra=s.dynamo?['<li>Écran DynaMo en kg ? Bascule « N / kg » dans PULSE : la conversion est automatique.</li>']:
   s.walkway?['<li>Le chronomètre PULSE remplit les deux passages ; la vitesse retenue (le plus rapide) s’affiche.</li>']:
   s.holdTimer?['<li>Le chrono PULSE (« Départ · pied levé » / « Pied posé ») remplit la durée, meilleur des essais ; arrêt automatique à 30 s.</li>']:[];
  return '<ul>'+[...f,...c,...extra].join('')+'</ul>';
 }
 if(s.kind==='two_step')return '<ul><li><b>Distance de chaque essai</b> (cm), de la ligne à la pointe des pieds</li><li><b>Taille</b> (cm) : PULSE retient le meilleur essai et calcule l’indice</li></ul>';
 if(s.kind==='balance')return '<ul><li><b>Durée</b> (s, 30 s au maximum) : celle du suivi vidéo, confirmée ou corrigée à ton observation</li></ul>';
 if(s.kind==='count')return '<ul><li><b>'+e(s.label)+'</b> : un appui sur « +1 lever » par lever complet pendant les 30 s ; le total reste modifiable. PULSE en calcule la puissance des jambes avec la taille.</li></ul>';
 if(s.kind==='observation')return '<ul><li>Une observation : '+s.options.map(([,l])=>e(l)).join(' · ')+'</li></ul>';
 return '';
}
function doMarkup(s){
 let h='<p>'+e(s.instruction)+'</p>';
 if(s.vald)h+='<p class="vald-box"><b>'+e(s.vald.app)+'</b> › '+e(s.vald.test)+'<br>Réglages : '+e(s.vald.settings)+
  (s.vald.tip?'<br><span class="muted">'+e(s.vald.tip)+'</span>':'')+'</p>';
 return h;
}
const corridor='<svg class="corridor" viewBox="0 0 520 74" role="img" aria-label="Couloir de marche : départ à 0 m, arrivée à 4 m, repère à 6 m">'+
 '<rect x="20" y="30" width="480" height="14" rx="3" fill="#f5f1ea" stroke="#d9cfbf"/>'+
 '<rect x="40" y="30" width="320" height="14" fill="#1c342a"/>'+
 '<line x1="40" y1="20" x2="40" y2="54" stroke="#1c342a" stroke-width="3"/><line x1="360" y1="20" x2="360" y2="54" stroke="#1c342a" stroke-width="3"/>'+
 '<line x1="480" y1="20" x2="480" y2="54" stroke="#b4925e" stroke-width="3" stroke-dasharray="4 3"/>'+
 '<text x="34" y="14" text-anchor="start" font-size="11" font-weight="600" fill="#1c342a">0 m · départ arrêté</text>'+
 '<text x="200" y="41" text-anchor="middle" font-size="11" font-weight="600" fill="#fff">4 m chronométrés</text>'+
 '<text x="360" y="14" text-anchor="middle" font-size="11" font-weight="600" fill="#1c342a">4 m · arrivée</text>'+
 '<text x="490" y="14" text-anchor="end" font-size="11" font-weight="600" fill="#8a6d3f">6 m · repère</text>'+
 '<text x="34" y="70" text-anchor="start" font-size="10" fill="#5d625a">pointes derrière la ligne</text>'+
 '<text x="356" y="70" text-anchor="end" font-size="10" fill="#5d625a">un pied entièrement passé</text>'+
 '<text x="490" y="70" text-anchor="end" font-size="10" fill="#5d625a">on continue jusqu’ici</text></svg>';

function testCard(s,n){
 const st=STATIONS[s.block];
 return '<article class="test">'+
  '<header><span class="num">'+String(n).padStart(2,'0')+'</span><div><h3>'+e(s.title)+'</h3>'+
  '<p class="meta">'+e(s.device)+' · '+e(s.trials)+(st.camera?' · '+e(CAMERA_LABELS[st.camera]):'')+(s.optionalTest?' · <b>seulement si le patient est à l’aise</b>':'')+'</p></div></header>'+
  (s.walkway?corridor:'')+
  '<dl>'+
   '<dt>Installer</dt><dd>'+e(s.setup)+'</dd>'+
   '<dt>Dire</dt><dd class="say">'+e(s.script)+'</dd>'+
   '<dt>Faire</dt><dd>'+doMarkup(s)+'</dd>'+
   '<dt>Saisir</dt><dd>'+enterMarkup(s)+'</dd>'+
  '</dl>'+longevityMarkup(s)+'</article>';
}
// Bloc « longévité » de chaque test : pourquoi, repères, objectif, comment progresser, contrôle à 6 semaines.
function longevityMarkup(s){
 const L=forStep(s.id);if(!L)return '';
 const chair=s.id==='sts'?'<table class="norms"><thead><tr><th>Âge</th>'+CHAIR_NORMS.bands.map(b=>'<th>'+b+'</th>').join('')+'</tr></thead><tbody>'+
  [['Femme · sous la moyenne','female','below'],['Femme · standard d’autonomie','female','standard'],['Homme · sous la moyenne','male','below'],['Homme · standard d’autonomie','male','standard']]
   .map(([l,sx,k])=>'<tr><td>'+l+'</td>'+CHAIR_NORMS[sx][k].map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table>':'';
 return '<div class="longevity"><p class="lk">Longévité</p><dl class="ldl">'+
  '<dt>Pourquoi</dt><dd>'+e(L.why)+'</dd><dt>Repères</dt><dd>'+e(L.ref)+'</dd><dt>Objectif</dt><dd><b>'+e(L.target)+'</b></dd>'+
  (L.improve&&L.improve!=='—'?'<dt>Progresser</dt><dd>'+e(L.improve)+'</dd>':'')+'<dt>À 6 semaines</dt><dd>'+e(L.control)+'</dd></dl>'+chair+'</div>';
}
// Tableau de synthèse des repères (une ligne par mesure de longévité).
function summaryTable(){
 const rows=[['Vitesse de marche 4 m','gait_4m'],['Lever de chaise 30 s','sts'],['Préhension','dynamo_grip'],['Appui sur un pied','unipodal_left'],
  ['Saut vertical (CMJ)','fd_cmj'],['Force hanche et genou (DynaMo)','dynamo_knee_ext'],['Équilibre debout (plateformes)','fd_quiet_stand']];
 return '<table class="summary"><thead><tr><th>Mesure</th><th>Repère</th><th>Objectif</th><th>Changement réel à 6 semaines</th></tr></thead><tbody>'+
  rows.map(([n,id])=>{const L=forStep(id);return '<tr><td>'+e(n)+'</td><td>'+e(L.ref.replace(', tableau ci-dessous',', tableau dans la fiche du test'))+'</td><td>'+e(L.target)+'</td><td>'+e(L.control)+'</td></tr>'}).join('')+'</tbody></table>';
}
function stationsMarkup(){
 // Une section par station ; l'en-tête, la note et la 1re carte restent groupés (jamais d'en-tête orphelin).
 const blocks=[...new Set(STEPS.map(s=>s.block))];
 let n=0;
 return blocks.map(b=>{
  const st=STATIONS[b],tests=STEPS.filter(s=>s.block===b);
  const head='<div class="station-head"><p class="kicker">Station '+e(b)+'</p><h2>'+e(st.label)+'</h2>'+
   '<p class="place">'+(st.camera?'<b>'+e(CAMERA_LABELS[st.camera])+'.</b> ':'')+e(st.place)+'</p></div>';
  const note=b==='A'?'<p class="note"><b>Profil du patient dans VALD (DynaMo et ForceDecks), une fois par patient.</b> Nom = le code PULSE (HIRO-AAMMJJ-NN), date de naissance = 1<sup>er</sup> janvier de son année de naissance, sexe. Jamais le vrai nom : VALD Hub est un cloud hors de PULSE. Au contrôle, reprends le même profil.</p>':'';
  const cards=tests.map(t=>testCard(t,++n));
  return '<section class="station"><div class="station-lead">'+head+note+cards[0]+'</div>'+cards.slice(1).join('')+'</section>';
 }).join('');
}
const steps=(items,cls='steps')=>'<ol class="'+cls+'">'+items.map(x=>'<li>'+x+'</li>').join('')+'</ol>';
const checks=items=>'<ul class="checks">'+items.map(x=>'<li><span class="box"></span><span>'+x+'</span></li>').join('')+'</ul>';

const REPRO=[
 ['Marche 4 m','bonne','≥ 0,1 m/s','départ arrêté, 2 passages, le plus rapide retenu, même chronométreur'],
 ['Lever de chaise 30 s','bonne','≥ 2 levers','1 à 2 levers d’essai avant le chrono, même chaise'],
 ['Puissance des jambes (calculée)','bonne','≥ 0,42 W/kg (homme), 0,33 (femme)','même chaise de 43 cm, même taille mesurée'],
 ['Préhension','excellente','≥ 5 kg (50 N)','essai à 50 %, puis 3 essais par main, même position'],
 ['Saut vertical (CMJ)','excellente','≥ 10 %','mains sur les hanches, 3 sauts, le meilleur retenu'],
 ['Appui sur un pied','bonne pour classer, faible en secondes','franchir les 10 s','jusqu’à 2 essais par côté, le meilleur retenu'],
 ['Genou et hanche (DynaMo)','bonne','≥ 20 %','essai à 50 %, 3 essais, même position du pad'],
 ['Quiet Stand (yeux ouverts et fermés)','bonne pour la vitesse','≥ 20 % sur la vitesse','même position des pieds, même consigne'],
 ['Lever sur plateformes','non publiée pour ce test','≥ 20 % ou 10 points','suivi descriptif']
];
const PANNES=[
 ['Tu passes à l’app VALD, ou le téléphone se verrouille','Rien n’est perdu : PULSE garde les valeurs déjà tapées et la consultation reste sur le serveur. Reviens dans Safari, la page reprend où tu en étais.'],
 ['Tu as oublié d’appuyer sur « +1 lever »','Corrige le total dans le champ avant de valider : c’est ton comptage qui fait foi.'],
 ['Le chrono de l’appui sur un pied est parti trop tôt','« Effacer les essais », puis recommence : PULSE garde le meilleur essai valable.'],
 ['La page se fige ou le téléphone redémarre','Rouvre PULSE : la consultation est sauvegardée sur le serveur 4 heures et reprend à l’étape en cours (menu Consultation, « Consultation en cours »).'],
 ['Le patient n’arrive pas à scanner le QR','Vérifie la luminosité de ton écran ; sinon « Copier le lien » et envoie-le par ta messagerie sécurisée. Sans téléphone, remplis le questionnaire avec lui dans la console.'],
 ['Le patient voit « Ce lien n’est plus valide »','Le QR a été renouvelé ou a plus de 30 jours : « QR patient », puis « Nouveau QR », et fais-le scanner à nouveau.'],
 ['Message « consultation déjà en cours »','Un ancien bilan non terminé est resté ouvert : menu Consultation, puis « Clore » sur sa carte. Rien n’est supprimé.'],
 ['VALD ou DynaMo en panne','« Test non réalisé », motif « Appareil indisponible », et reprogramme ces tests au contrôle.'],
 ['Une valeur de la feuille est illisible ou manque','Claude te la demande avant d’enregistrer : réponds avec la valeur, ou « non réalisé » et le motif.'],
 ['Erreur vue après la transcription','Dis-la à Claude : seule la valeur corrigée est réécrite, le reste du bilan ne bouge pas. Ou corrige-la dans la console.'],
 ['Valeur mal saisie après validation','Touche le test dans la liste des tests (ou « Corriger un test » dans le rapport) : il s’ouvre avec ses valeurs, tu corriges et tu valides.']
];

const html=`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>KŌMØ Motion · Guide de consultation pas à pas</title><style>
@page{size:A4;margin:17mm 16mm 18mm 16mm}
:root{--ink:#1c342a;--ink2:#3f4a42;--muted:#6b6f66;--gold:#8a6d3f;--goldl:#b4925e;--sand:#f5f1ea;--line:#e2d9ca;--sage:#e3ebe2}
*{box-sizing:border-box}
html{font-family:Inter,sans-serif;font-size:9.6pt;line-height:1.48;color:var(--ink2);-webkit-print-color-adjust:exact;print-color-adjust:exact}
body{margin:0}
h1,h2,h3{font-family:"Crimson Text",Georgia,serif;color:var(--ink);font-weight:600;margin:0}
h1{font-size:34pt;line-height:1.05;letter-spacing:-.01em}
h2{font-size:19pt;line-height:1.15;margin-bottom:2mm}
h3{font-size:13.5pt;line-height:1.2}
p{margin:0 0 2.2mm}
b{color:var(--ink);font-weight:600}
.kicker{font-size:8.6pt;font-weight:600;color:var(--gold);margin:0 0 1mm}
.muted{color:var(--muted)}
.cover{height:257mm;display:flex;flex-direction:column;page-break-after:always}
.cover .brand{font-family:"Crimson Text",serif;font-size:15pt;color:var(--ink);letter-spacing:.06em}
.cover .title{margin-top:44mm}
.cover .lead{font-size:12pt;line-height:1.5;color:var(--ink2);max-width:128mm;margin-top:6mm}
.cover .facts{margin-top:10mm;display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;max-width:150mm}
.cover .facts div{border-top:2px solid var(--ink);padding-top:2.5mm}
.cover .facts strong{display:block;font-family:"Crimson Text",serif;font-size:20pt;color:var(--ink);line-height:1}
.cover .facts span{font-size:8.8pt;color:var(--muted)}
.cover .flow{margin-top:auto;border-top:1px solid var(--line);padding-top:5mm}
.flow ol{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(4,1fr);gap:3mm 5mm;counter-reset:f}
.flow li{counter-increment:f;font-size:9pt;line-height:1.35}
.flow li::before{content:counter(f);display:block;font-family:"Crimson Text",serif;font-size:16pt;color:var(--goldl);line-height:1;margin-bottom:1mm}
.cover .version{margin-top:5mm;font-size:8.4pt;color:var(--muted)}
section.part{page-break-before:always}
section.part:first-of-type{page-break-before:auto}
.intro{font-size:10.4pt;color:var(--ink2);max-width:150mm;margin-bottom:5mm}
h4{font-size:10.2pt;color:var(--ink);margin:5mm 0 2mm;font-weight:600}
ol.steps{margin:0 0 3mm;padding:0;list-style:none;counter-reset:s}
ol.steps li{counter-increment:s;position:relative;padding:0 0 2.2mm 8.5mm;break-inside:avoid}
ol.steps li::before{content:counter(s);position:absolute;left:0;top:-.2mm;width:5.6mm;height:5.6mm;border-radius:50%;background:var(--ink);color:#fff;font-size:8pt;font-weight:600;display:grid;place-items:center}
ul{margin:0;padding-left:4.5mm}
ul li{margin-bottom:1mm}
.checks{list-style:none;padding:0;columns:2;column-gap:8mm}
.checks li{display:flex;gap:2.5mm;break-inside:avoid;margin-bottom:2mm}
.checks .box{flex:none;width:3.6mm;height:3.6mm;border:1.2px solid var(--ink);border-radius:.8mm;margin-top:.5mm}
blockquote{margin:2mm 0 4mm;padding:3mm 4mm;border-left:3px solid var(--goldl);background:var(--sand);font-family:"Crimson Text",serif;font-size:11.6pt;line-height:1.42;color:var(--ink)}
.note{border:1px solid var(--line);border-radius:2mm;padding:3mm 4mm;margin:0 0 4mm;font-size:9.2pt}
.note.warn{border-color:#c9b48d;background:#fbf7ef}
.station{margin-top:7mm}
.station:first-of-type{margin-top:0}
.station-head{border-bottom:2px solid var(--ink);padding-bottom:2.5mm;margin-bottom:4mm;break-after:avoid;page-break-after:avoid}
.station-lead{break-inside:avoid;page-break-inside:avoid}
.station-head .place{margin:1.5mm 0 0;font-size:9.4pt}
article.test{border:1px solid var(--line);border-radius:2.4mm;padding:3.6mm 4.2mm 2.4mm;margin-bottom:4mm;break-inside:avoid;page-break-inside:avoid}
article.test header{display:flex;gap:3.4mm;align-items:flex-start;margin-bottom:2.6mm}
.num{flex:none;width:9mm;height:9mm;border-radius:50%;background:var(--ink);color:#fff;font-weight:600;font-size:9.6pt;display:grid;place-items:center}
.meta{margin:.6mm 0 0;font-size:8.6pt;color:var(--muted)}
dl{display:grid;grid-template-columns:17mm 1fr;gap:1.8mm 3mm;margin:0}
dt{font-size:8.6pt;font-weight:600;color:var(--gold);padding-top:.3mm}
dd{margin:0}
dd p:last-child,dd ul:last-child{margin-bottom:0}
dd.say{font-family:"Crimson Text",serif;font-size:11.2pt;line-height:1.38;color:var(--ink)}
.vald-box{background:var(--sand);border-radius:1.6mm;padding:2mm 3mm;font-size:8.9pt;margin-top:1.5mm}
.vald{color:var(--muted);font-size:8.5pt}
.opt{color:var(--gold);font-size:8.3pt}
.corridor{width:100%;height:auto;margin:0 0 2.8mm}
table{width:100%;border-collapse:collapse;font-size:8.9pt;margin:2mm 0 4mm}
th{text-align:left;font-weight:600;color:var(--ink);border-bottom:1.5px solid var(--ink);padding:1.6mm 2mm}
td{border-bottom:1px solid var(--line);padding:1.8mm 2mm;vertical-align:top}
tr{break-inside:avoid}
td:first-child{font-weight:600;color:var(--ink)}
td:first-child,th:first-child{width:24%}
.two{display:grid;grid-template-columns:1fr 1fr;gap:7mm}
.longevity{margin-top:2.4mm;border-top:1px dashed var(--line);padding-top:2.2mm}
.longevity .lk{font-size:8.2pt;font-weight:600;color:var(--ink);margin:0 0 1.2mm;letter-spacing:.02em}
.ldl{display:grid;grid-template-columns:17mm 1fr;gap:1.2mm 3mm;margin:0;font-size:9pt}
.ldl dt{font-size:8.2pt;font-weight:600;color:#4f6b5a}
table.norms{font-size:7.8pt;margin:2mm 0 0}
table.norms td,table.norms th{padding:1mm 1.2mm;text-align:center}
table.norms td:first-child,table.norms th:first-child{text-align:left;width:34%}
table.summary td:first-child{width:20%}
</style></head><body>

<div class="cover">
 <div class="brand">KŌMØ MOTION</div>
 <div class="title"><p class="kicker">Clinique HIRO, Beausoleil</p><h1>Guide de consultation<br>pas à pas</h1></div>
 <p class="lead">Tout ce qu’il faut faire, dire et saisir, de la préparation de la salle au passeport remis au patient. Sans caméra : tout se pilote depuis ton iPhone. Les ${N} tests sont repris mot pour mot de la console PULSE.</p>
 <div class="facts"><div><strong>${N}</strong><span>tests en ${NS} stations</span></div><div><strong>≈ 35 min</strong><span>de tests</span></div><div><strong>6 semaines</strong><span>jusqu’au contrôle</span></div></div>
 <div class="flow"><ol>
  <li>Préparer la salle et les appareils</li><li>Accueillir et vérifier la sécurité</li><li>Créer le dossier patient</li><li>Ouvrir la consultation, QR au patient</li>
  <li>Faire les ${N} tests, notés sur la feuille de mesures</li><li>Compléter le questionnaire</li><li>Restituer, valider, envoyer par e-mail</li><li>Revoir le patient à 6 semaines</li>
 </ol></div>
 <p class="version">Protocole ${e(PROTOCOL.code)} ${e(PROTOCOL.version)} · version du ${DATE} · document interne, non diagnostique</p>
</div>

<section class="part">
 <p class="kicker">Étape 1</p><h2>Avant l’arrivée du patient</h2>
 <p class="intro">Tout doit être prêt avant que le patient entre : la consultation s’enchaîne ensuite sans recherche de matériel. PULSE affiche la même liste à cocher sur la page Consultation.</p>
 <h4>Salle et matériel</h4>
 ${checks([
  '<b>Couloir</b> droit d’au moins 6 m : scotch au sol à 0 m (départ), 4 m (arrivée) et 6 m (repère), mesurés au ruban. Sol plat, antidérapant, dégagé.',
  '<b>Chaise</b> d’environ 43 cm, sans accoudoirs, calée contre un mur.',
  '<b>ForceDecks</b> : les deux plateformes allumées, appairées à l’app, posées à plat sur leurs repères.',
  '<b>Toise</b> ou ruban fixé au mur pour la taille.',
  '<b>DynaMo Plus</b> chargé, poignée et pad à portée, table d’examen libre.',
  '<b>Ton iPhone</b> chargé, PULSE ouvert et connecté, mode Ne pas déranger. Apps VALD (ForceDecks, DynaMo) ouvertes sur leur appareil habituel.',
  '<b>Fiches papier</b> : la fiche patient (identité, consentement, correspondance avec le code) et la feuille de mesures, avec un stylo noir. Chronomètre de l’iPhone à portée de main.'
 ])}
 <div class="two">
  <div><h4>Ton iPhone : il suffit</h4>${steps([
   'Safari sur pulse.komolongevity.com, « Connectez-vous » en bas de la page, compte professionnel. Astuce : « Partager › Sur l’écran d’accueil » pour l’ouvrir comme une app.',
   'Sous « Lieu de consultation », choisis <b>KŌMØ Beausoleil — Clinique HIRO</b>. Le badge doit dire « consultation réelle » ; « démonstration » veut dire Cannes.',
   'Laisse PULSE ouvert sur « Patients ». Batterie au-dessus de 60 %.'])}</div>
  <div><h4>Ordinateur (facultatif)</h4>${steps([
   'Même adresse, même compte : tout ce que fait l’iPhone, l’ordinateur le fait aussi, sur un plus grand écran.',
   'Les deux restent synchronisés : tu peux saisir les valeurs VALD sur l’ordinateur et chronométrer la marche sur l’iPhone.',
   'Aucune caméra, aucun trépied : les mesures viennent des plateformes, du DynaMo et du chrono PULSE.'])}</div>
 </div>

 </section>

<section class="part">
 <p class="kicker">Étape 2</p><h2>Accueil et sécurité</h2>
 <p>Installe le patient, explique en une phrase :</p>
 <blockquote>« Nous allons mesurer votre force, votre équilibre et votre marche, avec des plateformes de force et un dynamomètre. Rien n’est filmé. Vous pouvez arrêter à tout moment. Je serai à côté de vous pour chaque test. »</blockquote>
 ${checks([
  '<b>Consentement</b> recueilli sur la fiche papier signée.',
  '<b>Dépistage de sécurité</b> : douleur thoracique, malaise ou chute récents, intervention récente, décompensation cardiaque ou respiratoire, douleur aiguë. Au moindre doute, pas de force maximale ni d’équilibre.',
  '<b>Conditions notées</b> : aide de marche, chaussures, lunettes. Elles seront reprises au contrôle.'
 ])}
</section>

 <p class="kicker" style="margin-top:7mm">Étape 3</p><h2>Créer le dossier</h2>
 <p class="intro">Le dossier porte le prénom, le nom, la date de naissance et l’e-mail du patient. PULSE lui donne aussi un code : c’est ce code, jamais le nom, qui va dans VALD, sur la feuille de mesures et dans ce que tu envoies à Claude.</p>
 ${steps([
  'Colonne de gauche (barre du bas sur téléphone) → <b>Patients</b>.',
  'S’il n’y a encore aucun dossier, le formulaire est déjà ouvert ; sinon, « Nouveau patient ».',
  'Le code <b>HIRO-AAMMJJ-NN</b> s’affiche en grand : recopie-le sur la fiche patient et la feuille de mesures.',
  'Tape le prénom, le nom, la date de naissance et l’<b>e-mail</b> (il sert à lui envoyer son bilan), puis touche « Femme », « Homme » ou « Non précisé ». Le sexe et l’âge choisissent les repères du passeport ; « Non précisé » applique les plus prudents.',
  'Coche « Fiche KŌMØ signée : consentement recueilli et questionnaire de sécurité vérifié ».',
  '« Créer et démarrer la consultation ». S’il manque quelque chose, PULSE l’écrit juste au-dessus du bouton.'
 ])}
</section>

<section class="part">
 <p class="kicker">Étape 4</p><h2>Ouvrir la consultation</h2>
 ${steps([
  'Après « Créer et démarrer la consultation », PULSE ouvre directement les tests : rien d’autre à relier. Pour un patient déjà créé : Patients → « Consultation » sur sa ligne → « Démarrer la consultation ».',
  '<b>QR patient</b> (bouton vert en haut de la console) : montre-le au patient. Il le vise avec l’appareil photo de son téléphone : sa page « Mon bilan » s’ouvre, sans compte ni nom.',
  'Coche la case de sécurité (espace dégagé, appui accessible, pas de contre-indication évidente) : sans elle, le premier test ne démarre pas.'
 ])}
 <div class="note"><b>Le lien du patient</b> est personnel, valable 30 jours. Le patient y répond au questionnaire pendant les tests, puis y retrouve ses résultats et son passeport PDF <b>après ta validation</b> (étape 7). Rouvrir le QR montre le même lien ; « Nouveau QR » le remplace (l’ancien cesse de fonctionner).</div>
 <div class="note"><b>Dans la console, chaque test suit le même ordre :</b> le bandeau de station dit où installer le patient ; « Installation et consignes » reprend ce guide ; tu saisis, puis « Valider et passer au suivant ». Les numéros en haut permettent d’ouvrir n’importe quel test, et « Plus tard » de le reporter à la fin.</div>
 <div class="note warn"><b>Arrêter un test.</b> Douleur, vertige, malaise, perte d’équilibre, essoufflement anormal : tu arrêtes, tu rassures, tu fais asseoir. « Test non réalisé » avec son motif passe au suivant. Un test impossible n’est pas un échec : le rapport l’indique sans valeur inventée.</div>
 <p class="kicker" style="margin-top:7mm">Étape 5</p><h2>Les ${N} tests, station par station</h2>
 <p class="intro">Le patient passe par ${NS} postes : assis à la table, sur les plateformes, dans le couloir, puis sur la chaise. Chaque test se lit de haut en bas : installer, dire, faire, noter.</p>
 <div class="note"><b>Où noter les valeurs.</b> Sur la <b>feuille de mesures</b>, ligne par ligne, dans l’ordre de PULSE ; marche et appui sur un pied au chronomètre de l’iPhone, levers de chaise comptés à voix haute. À la fin, la feuille est transcrite dans PULSE (page suivant les tests). La saisie directe dans la console reste possible : même résultat.</div>
</section>
<section class="part">
 <p class="kicker">Avant les tests</p><h2>Les repères de longévité en un coup d’œil</h2>
 <p class="intro">Chaque test du guide dit pourquoi il compte pour la longévité, son repère, l’objectif à viser et ce qui compte comme un vrai progrès au contrôle. Les repères sont des seuils de population : ils orientent le programme, ils ne posent pas de diagnostic.</p>
 ${summaryTable()}
</section>
<section class="part tests">${stationsMarkup()}</section>

<section class="part">
 <p class="kicker">Fin de l’étape 5</p><h2>La feuille de mesures dans PULSE</h2>
 <p class="intro">Pendant que le patient termine son questionnaire sur son téléphone, la feuille est transcrite dans sa consultation PULSE. Compte 3 à 5 minutes.</p>
 ${steps([
  'Relis la feuille : code PULSE, case « Sécurité vérifiée », N ou kg pour chaque ligne DynaMo, côté le plus chargé, deux essais par pied, deux passages de marche, nombre de levers. Un test non fait : case « Non réalisé » et motif dans les notes.',
  'Photo de la <b>feuille de mesures seulement</b> : page entière, à plat, nette, sans reflet. Jamais la fiche patient (nom, signature).',
  'Envoie la photo à Claude, dans la conversation habituelle.',
  'Claude te renvoie un récapitulatif : chaque valeur, les conversions des kg, les symétries, la vitesse de marche, et les valeurs à vérifier. Compare-le à ta feuille, puis réponds « OK » ou corrige.',
  'Claude enregistre seulement après ton « OK », puis vérifie que chaque valeur enregistrée correspond au récapitulatif.',
  'Ta console passe sur le <b>Rapport</b>. Le téléphone du patient affiche « en relecture » : rien ne lui est montré avant ta validation (étape 7).'
 ])}
 <div class="note"><b>Les règles restent celles de PULSE</b> : mêmes bornes, mêmes calculs, même passeport, même trajectoire à 6 semaines. Chaque valeur garde la trace de sa transcription depuis la feuille. Une valeur illisible n’est jamais devinée : Claude te la demande.</div>
 <div class="note warn"><b>Si Claude ne répond pas</b>, saisis toi-même la feuille dans la console, dans les 4 heures : onglet Tests, touche chaque test dans la liste et recopie ses valeurs. Au-delà, Claude peut encore la transcrire jusqu’à 7 jours après la consultation : le patient repart et reçoit ses résultats sur son lien dès que tu les valides.</div>
</section>

<section class="part">
 <p class="kicker">Complément</p><h2>Photo de profil · posture</h2>
 <p class="intro">Au début de la station B, pieds nus, avant de monter sur les plateformes. Seulement si le patient a coché la photo sur sa fiche. Elle ne compte pas dans les ${N} tests et ne bloque rien.</p>
 ${steps([
  e(COMPLEMENTS[0].setup),
  e(COMPLEMENTS[0].instruction),
  'Dis : '+e(COMPLEMENTS[0].script),
  'Envoie la photo à Claude avec le <b>code</b> du patient dans le message, jamais son nom.',
  'Claude te renvoie la photo annotée (oreille, épaule, hanche, genou, cheville) et les angles : avancée de la tête, inclinaison du tronc, position du bassin, genou. Tu relis, puis « OK ».',
  'Les mesures arrivent dans le Rapport (« Symétrie et posture ») ; la photo est effacée. Coche la case sur la feuille de mesures.'
 ])}
 <div class="note">La posture est décrite, jamais diagnostiquée : « alignement neutre », « décalage apparent » ou « non interprétable ». Au contrôle, même cadrage ; un écart de moins de 5° n’est pas interprété.</div>
</section>

<section class="part">
 <p class="kicker">Étape 6</p><h2>Questionnaire</h2>
 ${steps([
  'Le patient répond <b>sur son téléphone</b> pendant les tests (QR de l’étape 4) : 22 questions en cinq catégories, plus 5 questions facultatives « Santé et longévité » (chute dans l’année, activité, temps assis, tabac, médicaments).',
  'Ses réponses arrivent dans l’onglet <b>Questionnaire</b> de la console. Sans téléphone, lis-les-lui et réponds à sa place, au même endroit.',
  '« Enregistrer et voir le rapport ». Un questionnaire incomplet reste possible : le passeport le signale.'
 ])}
 <p class="kicker" style="margin-top:7mm">Étape 7</p><h2>Restitution et passeport</h2>
 ${steps([
  'Onglet <b>Rapport</b> : tourne l’écran vers le patient. En tête, <b>Vos capacités</b> : marche, force des jambes, équilibre, force musculaire et symétrie, chacune dans sa zone (priorité, à consolider, solide) avec son repère et la raison pour laquelle elle compte.',
  'Présente les <b>3 priorités</b> et leur objectif à 6 semaines, puis le <b>programme maison</b> : 4 exercices et la marche quotidienne.',
  'Montre chaque exercice en salle, une ou deux répétitions. Un exercice déjà fait une fois est un exercice qu’on refait à la maison.',
  '« Télécharger le passeport complet ». Sur l’iPhone, le PDF s’ouvre : « Partager › Imprimer » (AirPrint) ou « Enregistrer dans Fichiers ». Feuillette-le avant de l’imprimer.',
  'Si tu veux, remets-le imprimé : il porte le nom du patient. Jamais en pièce jointe d’un e-mail : l’envoi se fait par lien (ci-dessous).',
  'Relu et d’accord ? En bas du Rapport, <b>« Valider et rendre visible au patient »</b>. Sa page « Mon bilan » affiche alors ses capacités, ses priorités, son programme maison et le bouton pour télécharger son passeport. « Masquer au patient » retire l’accès si besoin.',
  '<b>« Envoyer le bilan par e-mail »</b> : Mail s’ouvre sur l’iPhone avec son adresse, l’objet et son lien personnel (30 jours). Aucun résultat dans le message : tout est derrière le lien, avec le PDF et le programme des 6 semaines. Vérifie l’adresse, puis « Envoyer ».',
  'Prends le rendez-vous de contrôle à 6 semaines avant que le patient parte.'
 ])}
 <blockquote>« Voici votre point de départ. Ce ne sont pas des diagnostics, ce sont des repères. Votre marche est solide. Votre équilibre est sous les 10 secondes d’un côté : dans les études, c’est associé à un risque plus élevé. La bonne nouvelle, c’est que ça s’entraîne. Voici vos exercices, et nous refaisons les mêmes mesures dans 6 semaines pour voir ce qui a bougé. »</blockquote>
 <p class="muted">Termine par ce qui va progresser. Le chiffre de risque sert à donner du sens, pas à inquiéter une personne fragile ou anxieuse.</p>
</section>

<section class="part">
 <p class="kicker">Étape 8</p><h2>Contrôle à 6 semaines</h2>
 ${steps([
  'Patients → le même code HIRO → « Consultation » → « Démarrer la consultation », et refais exactement les ${N} tests.',
  'Mêmes conditions : même moment de la journée, même praticien si possible, mêmes chaussures, même chaise, même distance du pad au genou, même profil ForceDecks.',
  'Le rapport affiche la <b>trajectoire J0 → S6</b> : une ligne par mesure, l’écart, et un point vert quand le changement dépasse la marge d’erreur de la mesure.',
  'Si les conditions diffèrent (chaussures, protocole, pad), PULSE affiche un avertissement : lis-le avant de commenter.'
 ])}
 <h4>Entre les deux bilans : faire progresser</h4>
 ${steps([
  '<b>Le programme maison</b> découle des mesures : 4 exercices ciblés sur les priorités (le lever de chaise reste toujours le socle), plus la marche quotidienne. 3 séances de 20 minutes par semaine, l’équilibre tous les jours.',
  '<b>Progression</b> : semaines 1–2, apprendre les gestes avec appui ; semaines 3–4, +2 répétitions ou une série quand c’est facile ; semaines 5–6, consolider la routine.',
  '<b>Activité</b> : viser progressivement 150 minutes d’activité modérée par semaine (OMS) et couper les longues périodes assises.',
  '<b>Au contrôle</b>, les objectifs fixés à J0 sont relus un par un : atteint, en progrès réel, ou stable. On ajuste le programme et on fixe le rendez-vous suivant (12 semaines).'
 ])}
 <h4>Reproductibilité : ce qui compte comme un vrai changement</h4>
 <p>Refaire un test ne donne jamais exactement le même chiffre. PULSE ne parle de progrès qu’au-delà de la marge d’erreur publiée pour chaque mesure ; en dessous, il affiche « stable ».</p>
 <table><thead><tr><th>Mesure</th><th>Fiabilité</th><th>Changement réel</th><th>Ce qui la rend fiable</th></tr></thead><tbody>
 ${REPRO.map(r=>'<tr>'+r.map(c=>'<td>'+e(c)+'</td>').join('')+'</tr>').join('')}
 </tbody></table>
 <p class="muted">Pour l’appui sur un pied, l’écart en secondes devrait dépasser 24 s pour être sûr : seul le franchissement des 10 s compte. La préhension progresse lentement : +5 kg se visent à 12 semaines.</p>
</section>

<section class="part">
 <h2>Si quelque chose ne marche pas</h2>
 <table><thead><tr><th style="width:34%">Situation</th><th>Que faire</th></tr></thead><tbody>
 ${PANNES.map(r=>'<tr><td>'+e(r[0])+'</td><td>'+e(r[1])+'</td></tr>').join('')}
 </tbody></table>
 <h4>Repères à garder en tête</h4>
 <ul>
  <li>Le bilan décrit des capacités et les situe par rapport à des repères de population ; il ne pose pas de diagnostic et ne calcule ni score ni « âge du mouvement ».</li>
  <li>Les tests de force maximale et l’équilibre se font toujours avec un appui accessible et toi à côté.</li>
  <li>Le programme maison est une proposition que tu valides et adaptes selon les symptômes, les traitements et le risque de chute.</li>
 </ul>
</section>
</body></html>`;

const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--font-render-hinting=none']});
const page=await browser.newPage();
await page.setContent(html,{waitUntil:'load'});
await page.evaluateHandle('document.fonts.ready');
await writeFile(OUT.replace(/\.pdf$/,'.html'),html);
await page.pdf({path:OUT,format:'A4',printBackground:true,displayHeaderFooter:true,preferCSSPageSize:true,
 headerTemplate:'<div></div>',
 footerTemplate:'<div style="width:100%;font-family:Inter,sans-serif;font-size:7.5pt;color:#6b6f66;padding:0 16mm;display:flex;justify-content:space-between"><span>KŌMØ Motion · Guide de consultation · '+PROTOCOL.code+' '+PROTOCOL.version+'</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>'});
await browser.close();
console.log('[guide] '+OUT);
