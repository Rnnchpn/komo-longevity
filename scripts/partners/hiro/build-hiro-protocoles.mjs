// KŌMØ × HIRO — Parcours mesurés : protocoles communs (PDF A4).
// Document de cadrage partagé avec l'équipe médicale HIRO : profils, batterie Motion par profil,
// calendrier J0 · J30 · S6, axes de soin HIRO (ozonothérapie, PAPIMI sous conditions), traçabilité, données, pilote.
// Les tests sont lus dans pulse-v14-src/motion-protocol.mjs (même protocole que la console PULSE).
// Usage : node scripts/partners/hiro/build-hiro-protocoles.mjs [sortie.pdf]
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {PROTOCOL,STEPS} from '../../../pulse-v14-src/motion-protocol.mjs';
import {e,table,doc,renderPdf} from '../../guide/guide-kit.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const OUT=process.argv[2]||join(here,'KOMO_HIRO_Protocoles_communs.pdf');
const DATE='24 novembre 2026';
const N=STEPS.length;

// ── Batterie Motion par profil ── ● systématique · ◐ si toléré · ○ facultatif · — non réalisé
const COLS=['Asymptomatique','Rachis','Hanche','Genou','Sportif'];
const B=[
 ['Station A · force au DynaMo, assis'],
 ['Flexion de hanche','●','◐','◐','●','●'],
 ['Extension de genou','●','●','●','◐','●'],
 ['Flexion de genou','●','●','●','◐','●'],
 ['Abduction de hanche','●','◐','◐','●','●'],
 ['Préhension','●','●','●','●','●'],
 ['Station B · plateformes ForceDecks'],
 ['Masse et taille','●','●','●','●','●'],
 ['Photo de profil · posture','○','●','○','○','○'],
 ['Équilibre debout, yeux ouverts','●','●','●','●','●'],
 ['Équilibre debout, yeux fermés','●','◐','◐','◐','●'],
 ['Lever sur plateformes (asymétrie)','●','◐','◐','◐','●'],
 ['Appui sur un pied, gauche et droit','●','◐','◐','◐','●'],
 ['Saut vertical (CMJ)','○','—','—','—','●'],
 ['Stations C et D'],
 ['Marche 4 m, départ arrêté','●','●','●','●','●'],
 ['Lever de chaise 30 s','●','◐','◐','◐','●'],
 ['Questionnaires'],
 ['Questionnaire KŌMØ (22 + 5)','●','●','●','●','●'],
 ['Douleur EVA : lombaire, membre inférieur, générale','○','●','●','●','○'],
 ['Questionnaire validé de la pathologie','—','ODI ou NDI','HOOS-12','KOOS-12','selon la blessure']
];
const sym={'●':'<span class="d on"></span>','◐':'<span class="d half"></span>','○':'<span class="d opt"></span>','—':'<span class="d off"></span>'};
const batteryTable='<table class="matrix"><thead><tr><th>Mesure</th><th>Profil 1<br><span>'+COLS[0]+'</span></th><th colspan="3" class="grp">Profil 2 · pathologie locomotrice<br><span>'+COLS[1]+'</span><span>'+COLS[2]+'</span><span>'+COLS[3]+'</span></th><th>Profil 3<br><span>'+COLS[4]+'</span></th></tr></thead><tbody>'+
 B.map(r=>r.length===1?'<tr class="band"><td colspan="6">'+e(r[0])+'</td></tr>':
  '<tr><td>'+e(r[0])+'</td>'+r.slice(1).map(c=>'<td class="c">'+(sym[c]||'<span class="txt">'+e(c)+'</span>')+'</td>').join('')+'</tr>').join('')+'</tbody></table>';

// ── Critères suivis par profil (changement réel = au-delà de la marge d'erreur de la mesure) ──
const CRITERIA=[
 ['Profil 1 · asymptomatique','Vitesse de marche, levers de chaise en 30 s, appui sur un pied, préhension, symétries','marche ≥ 0,1 m/s · chaise ≥ 2 levers · franchissement des 10 s sur un pied · préhension ≥ 5 kg'],
 ['Profil 2 · rachis','Douleur, ODI (lombaire) ou NDI (cervical), lever de chaise, équilibre yeux fermés, posture, marche','douleur ≥ 2 points sur 10 · ODI ≥ 10 points · équilibre ≥ 20 % · posture ≥ 5° · chaise ≥ 2 levers'],
 ['Profil 2 · hanche','Douleur, HOOS-12, abduction et flexion de hanche du côté atteint, symétrie, lever, marche','douleur ≥ 2 points · force ≥ 20 % · symétrie ≥ 10 points · marche ≥ 0,1 m/s'],
 ['Profil 2 · genou','Douleur, KOOS-12, extension et flexion de genou du côté atteint, symétrie, levers en 30 s, marche','douleur ≥ 2 points · force ≥ 20 % · symétrie ≥ 10 points · chaise ≥ 2 levers'],
 ['Profil 3 · sportif','Saut vertical, forces segmentaires, asymétries, appui sur un pied, gêne à l’effort','saut ≥ 10 % · force ≥ 20 % · asymétrie ≥ 10 points']
];

// ── Traçabilité du soin (tenue par HIRO, sous le code HIRO du patient) ──
const TRACE_OZONE=[
 ['Indication','Motif clinique, objectif du soin, médecin HIRO qui pose l’indication.'],
 ['Éligibilité','Contre-indications vérifiées selon les procédures HIRO, dont le dépistage du déficit en G6PD.'],
 ['Modalité','Technique exacte : locale (intra-articulaire, péri-articulaire, musculaire, tendineuse), rachidienne (paravertébrale, foraminale, intradiscale) ou systémique ; guidage éventuel.'],
 ['Paramètres','Concentration (µg/mL), volume (mL) par site, nombre de sites ; pour la voie systémique, nombre de passages. Valeurs réellement administrées.'],
 ['Calendrier','Date de chaque séance, nombre total, interruptions ou adaptations.'],
 ['Tolérance','Effets indésirables, inconfort, arrêt ou modification ; conduite tenue.'],
 ['Contexte','Antalgiques, infiltrations, kinésithérapie, activité physique, programme maison KŌMØ (suivi ou non), événements intercurrents.']
];
const TRACE_PAPIMI=[
 ['Dispositif','Fabricant, modèle, numéro de série, version ; marquage CE et destination revendiquée par le fabricant (copie au dossier).'],
 ['Indication','Motif et objectif définis par le médecin HIRO, dans la destination du dispositif.'],
 ['Paramètres','Réglages réellement utilisés, zone traitée, durée de chaque séance.'],
 ['Calendrier','Dates, nombre et fréquence des séances.'],
 ['Opérateur','Professionnel qui réalise la séance et médecin qui la supervise.'],
 ['Tolérance','Symptômes pendant et après, incidents, arrêt ; signalement de matériovigilance s’il y a lieu.']
];

// ── Niveau de preuve (synthèses publiées ; voir les sources en fin de document) ──
const EVIDENCE=[
 ['Ozone intra-articulaire','Gonarthrose','Supérieur au placebo, pas supérieur à l’acide hyaluronique. Effet sur la douleur à court terme (1 à 2 mois), maximal vers 2 mois.','faible','f'],
 ['Ozone rachidien','Hernie discale lombaire','Injections intradiscales : 8 essais, 1 744 patients, environ 2 points de douleur sur 10 en faveur de l’ozone face aux traitements comparés, à court terme. Essais hétérogènes. La voie intradiscale a été associée à des complications graves ; la voie intramusculaire paravertébrale est présentée comme plus sûre.','faible à modérée','m'],
 ['Ozone systémique à haute dose','Prévention, « optimisation »','Pas d’essai contrôlé identifié sur des critères cliniques ; approche discutée parmi les ozonothérapeutes eux-mêmes. Aucune indication démontrée chez une personne sans symptôme.','très faible','tf'],
 ['Champs électromagnétiques pulsés (famille)','Gonarthrose','Bénéfice à court terme sur la douleur et la fonction contre placebo ; pas supérieur à la kinésithérapie.','faible','f'],
 ['PAPIMI (appareil)','—','Aucun essai solide identifié sur cet appareil. Non autorisé aux États-Unis faute d’autorisation de la FDA ; Santé Canada recommande au public de ne pas l’utiliser.','non évaluable','tf'],
 ['Photobiomodulation','Gonarthrose','Baisse de la douleur et de l’incapacité aux doses recommandées.','faible','f'],
 ['IHHT (hypoxie-hyperoxie)','Patients âgés, avec entraînement','Petits essais : gain supplémentaire au test de marche de 6 minutes quand l’IHHT précède l’entraînement.','faible','f']
];
const evidenceTable='<table class="ev"><thead><tr><th>Soin</th><th>Situation étudiée</th><th>Ce que montrent les synthèses</th><th>Certitude</th></tr></thead><tbody>'+
 EVIDENCE.map(r=>'<tr><td>'+e(r[0])+'</td><td>'+e(r[1])+'</td><td>'+e(r[2])+'</td><td><span class="cert '+r[4]+'">'+e(r[3])+'</span></td></tr>').join('')+'</tbody></table>';

// ── Calendrier (SVG) ──
const timeline=`<svg class="tl" viewBox="0 0 700 150" role="img" aria-label="Calendrier : J0 bilan, décision HIRO, séances, J30, S6, S12 facultatif">
 <line x1="40" y1="60" x2="664" y2="60" stroke="#d9cfbf" stroke-width="2"/>
 <rect x="150" y="52" width="170" height="16" rx="8" fill="#e3ebe2"/>
 <text x="235" y="64" text-anchor="middle" font-size="10" font-weight="600" fill="#1c342a">séances HIRO</text>
 ${[[40,'J0','Bilan Motion','avant la 1re séance',1],[130,'D','Décision HIRO','indication, éligibilité',0],[390,'J30','Contrôle Motion','jour 21 à 34',1],[500,'S6','Contrôle Motion','jour 35 à 56',1],[640,'S12','Facultatif','jour 70 à 100',2]].map(([x,l,t,s,k])=>
 `<circle cx="${x}" cy="60" r="${k===0?7:11}" fill="${k===1?'#1c342a':k===2?'#fff':'#b4925e'}" stroke="${k===2?'#1c342a':'none'}" stroke-width="2" ${k===2?'stroke-dasharray="3 2"':''}/>
 <text x="${x}" y="${k===0?40:34}" text-anchor="middle" font-size="${k===0?10:13}" font-weight="700" fill="${k===0?'#8a6d3f':'#1c342a'}">${l==='D'?'':l}</text>
 <text x="${x}" y="92" text-anchor="middle" font-size="10.5" font-weight="600" fill="#1c342a">${t}</text>
 <text x="${x}" y="107" text-anchor="middle" font-size="9.5" fill="#6b6f66">${s}</text>`).join('')}
 <text x="350" y="140" text-anchor="middle" font-size="9.5" fill="#6b6f66">Les jours se comptent depuis J0. Fenêtres reprises de PULSE : un contrôle hors fenêtre est affiché avec sa date réelle (J+n).</text>
</svg>`;

// ── Deux portes d'entrée (SVG) ──
const doors=`<svg class="tl" viewBox="0 0 700 132" role="img" aria-label="Deux portes d'entrée vers la même séquence">
 <rect x="10" y="10" width="200" height="44" rx="8" fill="#1c342a"/><text x="110" y="29" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">Assess first</text><text x="110" y="45" text-anchor="middle" font-size="9.5" fill="#e3ebe2">le patient commence par KŌMØ</text>
 <rect x="10" y="78" width="200" height="44" rx="8" fill="#b4925e"/><text x="110" y="97" text-anchor="middle" font-size="12" font-weight="700" fill="#fff">Treat first</text><text x="110" y="113" text-anchor="middle" font-size="9.5" fill="#fff">le patient commence par HIRO</text>
 <path d="M210 32 C 250 32, 250 66, 290 66 M210 100 C 250 100, 250 66, 290 66" fill="none" stroke="#1c342a" stroke-width="1.6"/>
 <rect x="290" y="44" width="400" height="44" rx="8" fill="#f5f1ea" stroke="#d9cfbf"/>
 <text x="490" y="63" text-anchor="middle" font-size="11.5" font-weight="700" fill="#1c342a">J0 · décision HIRO · séances · J30 · S6</text>
 <text x="490" y="79" text-anchor="middle" font-size="9.5" fill="#6b6f66">même séquence, mêmes mesures, mêmes conditions</text>
</svg>`;

const VALID=[
 ['Confirmer les axes ouverts au pilote (ozone ; PAPIMI selon la section 6)','HIRO','5 déc.'],
 ['Transmettre les documents du PAPIMI : marquage CE, destination, notice, réglages','HIRO','5 déc.'],
 ['Valider indications, contre-indications et fiche de traçabilité de chaque soin','HIRO','12 déc.'],
 ['Obtenir la licence de l’ODI (Mapi Research Trust) ; ajouter NDI, HOOS-12 et KOOS-12 à PULSE s’ils sont retenus (EVA et ODI : faits)','KŌMØ','12 déc.'],
 ['Ajouter au consentement le partage des résultats avec l’équipe médicale HIRO','KŌMØ','12 déc.'],
 ['Convention HIRO × KŌMØ, assurance, relecture juridique, transmission à l’Ordre','Ensemble','15 déc.'],
 ['Qualifier l’usage des données (soins seuls, ou série de cas publiée) avec le DPO','Ensemble','15 déc.'],
 ['Former et certifier l’opérateur HIRO (3 bilans supervisés)','KŌMØ','19 déc.']
];
const GANTT=[
 ['Validations conjointes',0,3,'v'],['Formation de l’opérateur',3,4,'v'],['Inclusions et bilans J0',6,10,'a'],
 ['Contrôles J30',9,14,'b'],['Contrôles S6',11,16,'b'],['Synthèse commune et décision',16,18,'v'],['S12 facultatifs',15,20,'o']
];
const weeks=['23 nov','','déc.','','','','janv.','','','','févr.','','','','mars','','','','','avr.'];
const gantt='<div class="gantt"><div class="gh"><span></span>'+weeks.map(w=>'<span>'+w+'</span>').join('')+'</div>'+
 GANTT.map(([l,a,b,k])=>'<div class="gr"><span>'+e(l)+'</span><div class="gbar"><i class="'+k+'" style="left:'+(a/20*100)+'%;width:'+((b-a)/20*100)+'%"></i></div></div>').join('')+
 '<p class="small muted" style="margin-top:2mm">Fêtes de fin d’année : aucun J0 entre le 21 décembre et le 3 janvier, pour que les contrôles tombent dans leur fenêtre.</p></div>';

const html=doc('KŌMØ × HIRO · Parcours mesurés · protocoles communs',`
<style>
.cover .title{margin-top:30mm}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:6mm}
.card{border:1px solid var(--line);border-radius:2.4mm;padding:3.4mm 4mm;break-inside:avoid}
.card h3{font-size:13pt;margin-bottom:1.4mm}
.card .tag{display:inline-block;font-size:7.6pt;font-weight:600;padding:.5mm 2mm;border-radius:3mm;margin-bottom:1.6mm}
.tag.open{background:#e3ebe2;color:#1c342a}.tag.cond{background:#fbf3e4;color:#8a6d3f}.tag.later{background:#efefec;color:#6b6f66}
.profiles{display:grid;grid-template-columns:repeat(3,1fr);gap:4mm;margin:2mm 0 4mm}
.profiles .card p{font-size:8.8pt;margin-bottom:1.6mm}
.profiles .card .k{font-size:7.8pt;font-weight:600;color:var(--gold);margin:0}
table.matrix{font-size:8.6pt;margin:1mm 0 2mm}
table.matrix th{text-align:center;font-size:8.2pt;line-height:1.25}
table.matrix th:first-child{text-align:left}
table.matrix th span{display:inline-block;font-weight:500;color:var(--muted);font-size:7.8pt}
table.matrix th.grp span{width:33%}
table.matrix td{padding:1.15mm 2mm}
table.matrix td:first-child{width:36%;font-weight:500;color:var(--ink2)}
table.matrix td.c{text-align:center;width:12.8%}
table.matrix tr.band td{background:var(--sand);font-weight:600;color:var(--ink);font-size:8.2pt;padding:1mm 2mm}
.d{display:inline-block;width:3.3mm;height:3.3mm;border-radius:50%;vertical-align:-.5mm;box-sizing:border-box}.d.on{background:var(--ink)}.d.half{border:1.3px solid var(--ink);background:linear-gradient(90deg,var(--ink) 50%,transparent 50%)}.d.opt{border:1.3px solid var(--muted)}.d.off{width:3.3mm;height:0;border-radius:0;border-top:1.3px solid #c9c4b8;vertical-align:.6mm}
.legend .d{margin-right:1.2mm}
.txt{font-size:7.6pt;color:var(--ink);font-weight:600}
.legend{display:flex;gap:6mm;font-size:8.2pt;color:var(--muted);margin:0 0 3mm;flex-wrap:wrap}
table.ev td:first-child{width:21%}table.ev td:nth-child(2){width:17%}table.ev td:last-child{width:15%}
.cert{display:inline-block;font-size:7.6pt;font-weight:600;padding:.5mm 2mm;border-radius:3mm;white-space:nowrap}
.cert.m{background:#e3ebe2;color:#1c342a}.cert.f{background:#fbf3e4;color:#8a6d3f}.cert.tf{background:#f6e7e3;color:#963f2f}
.tl{width:100%;height:auto;margin:1mm 0 3mm}
.gate{list-style:none;padding:0;margin:2mm 0 3mm;counter-reset:g}
.gate li{counter-increment:g;display:grid;grid-template-columns:8mm 1fr;gap:2mm;margin-bottom:2.2mm;break-inside:avoid}
.gate li::before{content:counter(g);width:6mm;height:6mm;border-radius:50%;border:1.5px solid var(--gold);color:var(--gold);font-weight:700;font-size:8.4pt;display:grid;place-items:center}
.pilot{display:grid;grid-template-columns:24mm repeat(3,1fr);gap:2mm;margin:2mm 0 4mm;font-size:8.8pt}
.pilot div{border-radius:2mm;padding:2.6mm 3mm;min-height:15mm}
.pilot .h{background:none;padding:0;min-height:0;font-weight:600;color:var(--ink);font-size:8.4pt;align-self:end}
.pilot .r{background:none;font-weight:600;color:var(--ink);display:flex;align-items:center;padding:0}
.pilot .o{background:#e3ebe2}.pilot .p{background:#fbf3e4;border:1px dashed #c9b48d}
.pilot b{display:block;font-size:9.2pt}
.gantt{font-size:7.6pt;margin:2mm 0 4mm}
.gh,.gr{display:grid;grid-template-columns:44mm 1fr;align-items:center}
.gh{grid-template-columns:44mm repeat(20,1fr);color:var(--muted);border-bottom:1px solid var(--line);padding-bottom:1mm;margin-bottom:1mm}
.gh span{white-space:nowrap;overflow:visible;font-size:6.6pt}
.gr{padding:1mm 0;border-bottom:1px dashed #eee6d8}
.gr>span{font-size:8.2pt;color:var(--ink);font-weight:500}
.gbar{position:relative;height:4.2mm}
.gbar i{position:absolute;top:0;height:100%;border-radius:2mm}
.gbar i.v{background:#1c342a}.gbar i.a{background:#b4925e}.gbar i.b{background:#8fae96}.gbar i.o{background:repeating-linear-gradient(45deg,#e2d9ca 0 3px,#f5f1ea 3px 6px)}
table.valid td:first-child,table.valid th:first-child{width:72%;font-weight:500;color:var(--ink2)}
table.valid td:nth-child(2),table.valid td:nth-child(3){width:20mm;white-space:nowrap}
table.trace td:first-child{width:22%}
.blank td{height:14mm}
.blank td:first-child,.blank th:first-child{width:36%}
.sources{font-size:7.6pt;color:var(--muted);padding-left:4mm;columns:2;column-gap:8mm}
.sources li{margin-bottom:1mm;break-inside:avoid}
.big{font-family:"Crimson Text",serif;font-size:15pt;line-height:1.3;color:var(--ink);margin:0 0 4mm}
</style>

<div class="cover">
 <div class="brand">KŌMØ × HIRO</div>
 <div class="title"><p class="kicker">Clinique HIRO · Beausoleil / Monaco · document de travail partagé</p><h1>Parcours mesurés<br>Protocoles communs</h1></div>
 <p class="lead">Ce que mesure KŌMØ, quand, et pour quel patient, autour des soins décidés par HIRO. Trois profils, deux axes de soin, une même séquence J0 · J30 · S6, et un pilote de six cas pour l’hiver 2027.</p>
 <div class="facts"><div><strong>3</strong><span>profils de patients</span></div><div><strong>2 axes</strong><span>ozonothérapie · PAPIMI sous conditions</span></div><div><strong>J0 · J30 · S6</strong><span>mêmes mesures à chaque temps</span></div></div>
 <div class="flow"><ol>
  <li>Le principe et les deux portes d’entrée</li><li>Le calendrier commun</li><li>Les trois profils</li><li>La batterie Motion par profil</li>
  <li>Ozonothérapie</li><li>PAPIMI : conditions d’ouverture</li><li>Données, sécurité, consentement</li><li>Le pilote et les validations</li>
 </ol></div>
 <p class="version">Version 1.0 du ${DATE} · remplace la synthèse « Parcours ozone / PAPIMI / profils » · protocole Motion ${e(PROTOCOL.code)} ${e(PROTOCOL.version)} · cadrage opérationnel, pas un protocole médical de traitement</p>
</div>

<section class="part">
 <p class="kicker">1 · Le principe</p><h2>HIRO traite, KŌMØ mesure</h2>
 <p class="big">Le choix d’un soin relève exclusivement du médecin HIRO. KŌMØ mesure les capacités locomotrices avant et après, avec les mêmes tests et dans les mêmes conditions, et rend une trajectoire lisible au patient et au médecin.</p>
 ${doors}
 <div class="pair">
  <div class="card"><h3>Ce que ce document fixe</h3><ul>
   <li>Les trois profils et la batterie Motion de chacun, test par test.</li>
   <li>Le calendrier J0 · J30 · S6 et ses fenêtres.</li>
   <li>Ce que HIRO consigne pour chaque soin.</li>
   <li>Les conditions d’ouverture de l’axe PAPIMI.</li>
   <li>Le pilote de six cas et les validations avant le premier patient.</li></ul></div>
  <div class="card"><h3>Ce qu’il ne fixe pas</h3><ul>
   <li>Les indications, contre-indications, doses et nombres de séances : décisions HIRO.</li>
   <li>Un diagnostic : le bilan Motion décrit des capacités.</li>
   <li>Une preuve d’efficacité : une évolution mesurée chez un patient n’attribue pas un effet au soin.</li></ul></div>
 </div>
 <h4>Trois règles qui rendent les mesures comparables</h4>
 <ol class="steps">
  <li><b>Mêmes tests, mêmes conditions</b> à chaque temps : même opérateur si possible, mêmes chaussures, même chaise de 43 cm, même position du pad, même profil VALD, même moment de la journée. PULSE signale les écarts de conditions.</li>
  <li><b>Une valeur manquante reste manquante</b> : test « non réalisé » avec son motif, jamais une estimation.</li>
  <li><b>Un changement ne compte qu’au-delà de la marge d’erreur</b> de la mesure (marche 0,1 m/s, chaise 2 levers, préhension 5 kg, environ 20 % pour les forces). En dessous, PULSE affiche « stable ».</li>
 </ol>
</section>

<section class="part">
 <p class="kicker">2 · Le calendrier commun</p><h2>J0 · J30 · S6</h2>
 ${timeline}
 ${table(['Temps','Quand','Contenu'],[
  ['J0','Avant la première séance : dans les 7 jours qui précèdent (Assess first), ou le jour même avant le soin (Treat first).','Batterie complète du profil, douleur et questionnaires, objectifs, conditions de test. Programme maison KŌMØ remis.'],
  ['Décision','Après J0.','Le médecin HIRO pose ou non l’indication. Le bilan Motion peut l’éclairer ; il ne la pose pas.'],
  ['Séances','Selon le schéma HIRO.','Chaque séance est consignée par HIRO (section 5). Le calendrier réel prime sur le calendrier prévu.'],
  ['J30','Jour 21 à 34 après J0 (cible : jour 30).','Mêmes tests que J0, douleur, tolérance, suivi du programme, événements intercurrents.'],
  ['S6','Jour 35 à 56 (cible : jour 42).','Batterie complète, comparaison à J0, trajectoire, priorités pour la suite.'],
  ['S12','Jour 70 à 100, facultatif.','Recommandé pour le profil 2 : l’effet de l’ozone intra-articulaire décrit dans les synthèses est maximal vers 2 mois et diminue ensuite.']
 ].map(r=>[e(r[0]),e(r[1]),e(r[2])]))}
 <div class="note warn"><b>J0 après une première séance.</b> Si un patient arrive après avoir déjà reçu un soin (porte Treat first tardive), son premier bilan n’est pas un point de départ. PULSE l’enregistre normalement ; la fiche HIRO précise la date de la première séance et l’analyse le classe à part.</div>
 <div class="note"><b>Le programme maison KŌMØ est une co-intervention.</b> Chaque bilan remet 4 exercices et la marche quotidienne. Il est donné à tous les patients, parce qu’il fait partie du bilan, et son suivi est noté à J30 et S6. C’est une raison de plus pour ne jamais attribuer une évolution au seul soin HIRO.</div>
</section>

<section class="part">
 <p class="kicker">3 · Les profils</p><h2>Trois profils de patients</h2>
 <div class="profiles">
  <div class="card"><p class="k">Profil 1</p><h3>Asymptomatique</h3><p>Pas de plainte locomotrice. Veut connaître son niveau, repérer un déficit ou une asymétrie, suivre sa trajectoire.</p><p class="k">Vigilance</p><p>L’absence de symptôme n’est pas une indication de soin. Un soin HIRO repose sur une décision médicale propre.</p></div>
  <div class="card"><p class="k">Profil 2</p><h3>Pathologie locomotrice</h3><p>Plainte douloureuse ou fonctionnelle : rachis (lombalgie, radiculalgie, cervicalgie), hanche, genou (gonarthrose). Imagerie et diagnostic posés par le médecin.</p><p class="k">Vigilance</p><p>Aucun test imposé s’il réveille la douleur ; le motif est noté.</p></div>
  <div class="card"><p class="k">Profil 3</p><h3>Sportif</h3><p>Amateur ou confirmé, avec ou sans gêne. Veut mesurer sa force, sa puissance, ses asymétries et suivre une reprise.</p><p class="k">Vigilance</p><p>Pas de seuil non validé appliqué à un sportif ; suivi personnel d’abord.</p></div>
 </div>
 <h4>Critères d’inclusion et de non-inclusion communs</h4>
 <div class="pair">
  <div class="card"><b>Inclusion</b><ul class="small"><li>Majeur, volontaire, informé ; consentement KŌMØ donné et, pour le soin, consentement HIRO.</li><li>Capable de se tenir debout et de marcher 4 m sans aide humaine.</li><li>Disponible pour J30 et S6.</li></ul></div>
  <div class="card"><b>Non-inclusion</b><ul class="small"><li>Un « oui » aux 8 questions de sécurité de la console sans décision médicale.</li><li>Douleur aiguë non explorée, fracture ou chirurgie de moins de 3 mois.</li><li>Grossesse pour les tests de force maximale ; contre-indications propres au soin HIRO.</li></ul></div>
 </div>
 <h4>Ce que l’on suit pour chaque profil</h4>
 ${table(['Profil','Mesures suivies','Changement réel à partir de'],CRITERIA.map(r=>[e(r[0]),e(r[1]),e(r[2])]))}
 <p class="small muted">Douleur et ODI : changement minimal important de 2 points sur 10 et de 10 points (consensus international, lombalgie). Seuils des mesures Motion : reproductibilité publiée de chaque test, reprise dans PULSE.</p>
</section>

<section class="part">
 <p class="kicker">4 · La batterie Motion</p><h2>Test par test, selon le profil</h2>
 <p class="intro">Le protocole Motion compte ${N} tests en 4 stations, plus la photo de profil. Le profil décide de ce qui est systématique, de ce qui dépend de la tolérance et de ce qui n’est pas fait. Un test non fait est saisi « non réalisé » avec son motif, pour que les trois temps restent comparables.</p>
 <div class="legend"><span>${sym['●']} systématique</span><span>${sym['◐']} si toléré, sans réveiller la douleur</span><span>${sym['○']} facultatif</span><span>${sym['—']} non réalisé</span></div>
 ${batteryTable}
 <p class="small muted">Photo de profil : seulement si le patient l’a acceptée dans son consentement ; photo mesurée puis effacée. EVA et ODI : dans PULSE depuis le 24 novembre 2026 (EVA sur le téléphone du patient ; ODI saisi par le praticien d’après le formulaire officiel). NDI, HOOS-12 et KOOS-12 : à ajouter s’ils sont retenus (section 10).</p>
</section>

<section class="part">
 <p class="kicker">5 · Axe 1</p><h2>Ozonothérapie</h2>
 <p><span class="tag open" style="font-size:8pt;font-weight:600;padding:.6mm 2.4mm;border-radius:3mm;background:#e3ebe2">ouvert au pilote</span></p>
 <p class="intro">Premier axe de la collaboration. HIRO décrit plusieurs modalités : injections locales (articulations, muscles, tendons), injections rachidiennes pour hernie et sciatique, et une ozonothérapie dite hyperbare à haute concentration, avec un dépistage du déficit en G6PD avant traitement. Le schéma de chaque patient est décidé et consigné par HIRO ; KŌMØ n’en impose aucun.</p>
 ${table(['Profil','Situation où HIRO peut envisager l’ozone','Ce que KŌMØ mesure en priorité'],[
  ['Profil 1','Pas d’indication démontrée chez une personne sans symptôme. Si HIRO propose un soin, c’est sa décision ; aucun bénéfice n’est annoncé.','Batterie complète, à titre de référence.'],
  ['Profil 2 · genou','Gonarthrose douloureuse : voie intra-articulaire ou péri-articulaire.','Douleur, KOOS-12, extension de genou et symétrie, levers en 30 s, marche. S12 recommandé.'],
  ['Profil 2 · rachis','Hernie discale avec radiculalgie, imagerie concordante. Voie choisie par HIRO ; la voie paravertébrale est décrite comme la plus sûre.','Douleur, ODI ou NDI, équilibre yeux fermés, lever de chaise, posture, marche.'],
  ['Profil 2 · hanche','Selon l’indication HIRO ; données publiées plus rares que pour le genou.','Douleur, HOOS-12, abduction et flexion de hanche, symétrie, marche.'],
  ['Profil 3','Douleur tendineuse ou musculaire, selon l’indication HIRO.','Force segmentaire du côté concerné, asymétries, saut, gêne à l’effort.']
 ].map(r=>[e(r[0]),e(r[1]),e(r[2])]),'trace')}
 <h4>Ce que HIRO consigne pour chaque patient</h4>
 ${table(['Élément','À renseigner'],TRACE_OZONE.map(r=>[e(r[0]),e(r[1])]),'trace')}
</section>

<section class="part">
 <p class="kicker">6 · Axe 2</p><h2>PAPIMI</h2>
 <p><span style="font-size:8pt;font-weight:600;padding:.6mm 2.4mm;border-radius:3mm;background:#fbf3e4;color:#8a6d3f">exploratoire · ouvert seulement si les 5 conditions sont remplies</span></p>
 <p class="intro">Le PAPIMI est un appareil à champ électromagnétique pulsé fabriqué à Athènes. Il n’a pas d’essai clinique solide à son nom ; il n’est pas autorisé aux États-Unis et Santé Canada recommande au public de ne pas l’utiliser. La famille des champs pulsés a, elle, un bénéfice modeste et à court terme dans la gonarthrose. Le mesurer n’a donc de sens que dans un cadre strict.</p>
 <h4>Conditions d’ouverture de l’axe</h4>
 <ol class="gate">
  <li><span><b>Documents du dispositif</b> fournis par HIRO : déclaration de conformité et marquage CE au titre du règlement (UE) 2017/745, certificat de l’organisme notifié si la classe l’exige, notice et destination revendiquée par le fabricant.</span></li>
  <li><span><b>Usage dans cette destination seulement</b>, chez des patients du profil 2, en complément de leur prise en charge, jamais à sa place.</span></li>
  <li><span><b>Information spécifique du patient</b> sur le niveau de preuve, dans le consentement au soin recueilli par HIRO.</span></li>
  <li><span><b>Aucune communication</b> de KŌMØ ou de HIRO associant le PAPIMI aux mesures Motion ou à leurs résultats.</span></li>
  <li><span><b>Matériovigilance</b> : tout incident signalé selon les obligations de HIRO.</span></li>
 </ol>
 <div class="note warn"><b>Date de décision : 12 décembre 2026.</b> Si une condition manque, l’axe n’ouvre pas au pilote et ses cas sont réattribués à l’ozone (profil 2, genou et rachis). Les mesures Motion, elles, restent proposées à tous les patients.</div>
 <h4>Si l’axe ouvre : ce que HIRO consigne</h4>
 ${table(['Élément','À renseigner'],TRACE_PAPIMI.map(r=>[e(r[0]),e(r[1])]),'trace')}
 <p>Mêmes temps (J0, J30, S6), même batterie que le profil 2, mêmes règles de lecture.</p>
</section>

<section class="part">
 <p class="kicker">7 · Ce que disent les études</p><h2>Niveau de preuve des soins envisagés</h2>
 <p class="intro">Pour que chacun parle des soins avec les mêmes mots, au patient comme entre médecins. Synthèses publiées jusqu’en 2026 ; certitude estimée d’après les auteurs des revues.</p>
 ${evidenceTable}
 <h4>Plus tard : les autres soins HIRO</h4>
 <p>La photobiomodulation et l’IHHT pourraient devenir les axes 3 et 4 après le pilote, avec la même méthode. L’IHHT se mesure naturellement avec Motion : les essais l’associent à l’entraînement, et ce sont la marche, la puissance et la force qui progressent.</p>
 <h4>Ce que l’on dit au patient</h4>
 <blockquote>« Le médecin de HIRO vous propose un soin. De notre côté, nous mesurons votre force, votre équilibre et votre marche avant et après, pour suivre votre évolution. Ces mesures montrent comment vous allez ; à elles seules, elles ne disent pas ce qui a marché. »</blockquote>
</section>

<section class="part">
 <p class="kicker">8 · Cadre</p><h2>Données, sécurité, consentement</h2>
 ${table(['','HIRO','KŌMØ'],[
  ['Décide','Indication, éligibilité, schéma et surveillance du soin','Batterie Motion selon le profil, conditions de test'],
  ['Réalise','Les soins','Les bilans J0, J30, S6 (Dr Chapon ou opérateur HIRO formé et certifié)'],
  ['Consigne','Fiche de traçabilité du soin, sous le code HIRO du patient','Mesures dans PULSE, motifs des tests non réalisés'],
  ['Restitue','Avis médical et suite des soins','Passeport PDF, trajectoire, programme maison, après validation'],
  ['Signale','Événements indésirables du soin ; matériovigilance','Incident pendant un test, transmis au médecin HIRO le jour même']
 ].map(r=>[r[0]?'<b>'+e(r[0])+'</b>':'',e(r[1]),e(r[2])]))}
 <div class="pair">
  <div class="card"><h3>Données</h3><ul class="small">
   <li>Dossier PULSE nominatif ; serveurs à Paris (UE). Dans VALD et dans ce qui est transmis pour analyse, seulement le code HIRO.</li>
   <li>Consentement électronique horodaté sur le téléphone du patient ; lien personnel valable 60 jours ; résultats visibles après validation.</li>
   <li>À ajouter avant le pilote : une case de consentement au partage des résultats avec l’équipe médicale HIRO.</li>
   <li>À vérifier avec le DPO : hébergement certifié HDS, durée de conservation, registre des traitements.</li></ul></div>
  <div class="card"><h3>Recherche ou soins ?</h3><ul class="small">
   <li>Suivre des patients et leur rendre leurs résultats relève du soin.</li>
   <li>Publier une série de cas réutilise des données de soins : information des patients et cadre de la CNIL (méthodologie de référence MR-004) à valider.</li>
   <li>Ajouter des mesures pour la seule recherche ou randomiser relèverait de la loi Jardé (comité de protection des personnes) : hors du pilote.</li></ul></div>
 </div>
 <div class="note warn"><b>Sécurité pendant les tests.</b> Les 8 questions de la console avant le premier test ; appui à portée de main ; arrêt sur douleur, vertige ou malaise. Tout incident est noté dans PULSE et transmis au médecin HIRO le jour même.</div>
</section>

<section class="part">
 <p class="kicker">9 · Le pilote</p><h2>Six cas, trois temps, une synthèse commune</h2>
 <p class="intro">Format retenu : un cas par profil et par axe. Chaque cas est analysé seul. L’objectif est de vérifier la faisabilité et la qualité des mesures, pas de conclure sur un soin.</p>
 <div class="pilot">
  <div class="h"></div><div class="h">Profil 1 · asymptomatique</div><div class="h">Profil 2 · pathologie locomotrice</div><div class="h">Profil 3 · sportif</div>
  <div class="r">Ozone</div><div class="o"><b>Cas 1</b>référence, sans indication présumée</div><div class="o"><b>Cas 2</b>genou ou rachis</div><div class="o"><b>Cas 3</b>selon indication HIRO</div>
  <div class="r">PAPIMI</div><div class="p"><b>Cas 4</b>sous conditions (section 6)</div><div class="p"><b>Cas 5</b>sous conditions</div><div class="p"><b>Cas 6</b>sous conditions</div>
 </div>
 <p class="small muted">Cases pointillées : si l’axe PAPIMI n’ouvre pas le 12 décembre, les cas 4 à 6 deviennent des cas ozone du profil 2 (un genou, un rachis, un au choix de HIRO).</p>
 <h4>Calendrier</h4>
 ${gantt}
 <h4>Ce que chaque partenaire reçoit à la fin</h4>
 <ul>
  <li>Pour chaque cas : la trajectoire J0 · J30 · S6 (et S12), les tests non réalisés et leurs motifs, la fiche de soin HIRO, les co-interventions.</li>
  <li>Une synthèse de faisabilité : durée des bilans, part des contrôles réalisés dans leur fenêtre, part des tests réalisés, incidents, avis des patients.</li>
  <li>Une décision commune : continuer, élargir (registre de tous les patients mesurés, axes 3 et 4), ou arrêter.</li>
 </ul>
</section>

<section class="part">
 <p class="kicker">10 · Avant le premier patient</p><h2>Validations conjointes</h2>
 ${table(['Validation','Qui','Pour le'],VALID.map(r=>[e(r[0]),e(r[1]),e(r[2])]),'valid')}
 </section>
<section class="part">
 <p class="kicker">Annexe</p><h2>Fiche de soin HIRO</h2>
 <p class="intro">Une par patient et par axe, tenue par HIRO sous le code HIRO du patient, jamais son nom. Elle rejoint son dossier KŌMØ pour la synthèse du pilote, avec son accord.</p>
 <table class="blank"><tbody>
  ${['Code HIRO du patient · profil · axe','Médecin HIRO · indication','Éligibilité vérifiée (dont G6PD) · date','Modalité, voie, guidage','Paramètres réellement administrés','Séances : dates','Tolérance, événements indésirables','Co-interventions · programme maison KŌMØ suivi'].map(l=>'<tr><td>'+e(l)+'</td><td></td></tr>').join('')}
 </tbody></table>
</section>

<section class="part">
 <h2>Sources</h2>
 <ol class="sources">
  <li>Proposition de collaboration HIRO Monaco × KŌMØ Longevity, novembre 2026 ; synthèse « Parcours ozone, PAPIMI, profils », 24 novembre 2026.</li>
  <li>HIRO Monaco : pages « Optimisation » et « Ozonothérapie hyperbare » (hiromonaco.com), consultées en novembre 2026.</li>
  <li>Protocole KŌMØ Motion ${e(PROTOCOL.code)} ${e(PROTOCOL.version)} et règles de reproductibilité de PULSE.</li>
  <li>Ozone intra-articulaire et gonarthrose : méta-analyse, J Pain Res 2018;11:2537-50 ; ozone contre acide hyaluronique, méta-analyse 2020 (PMID 32766391) ; effet dans le temps, Front Pain Res 2026.</li>
  <li>Ozone et hernie discale lombaire : Cao et al., Front Pain Res 2025;6:1668752 ; Franzini et al., protocoles SIOOT, J Imaging 2025;11:428.</li>
  <li>Ozone systémique à haute dose : Franzini et al., lettre, Transl Med Commun 2022;7:26.</li>
  <li>Champs électromagnétiques pulsés et arthrose : méta-analyse, Phys Ther 2020;100:1118-31 ; Viganò et al., méta-analyse gonarthrose (PMID 32508140).</li>
  <li>PAPIMI : FDA (absence d’autorisation, enquête 2001–2005) ; Santé Canada, avis public de 2007 ; synthèse encyclopédique « Pap-Ion Magnetic Inductor ».</li>
  <li>Photobiomodulation et gonarthrose : Stausholm et al., BMJ Open 2019.</li>
  <li>IHHT chez le patient âgé : essai randomisé, 34 patients de 64 à 92 ans, 2017 (PMC5651371) ; essai randomisé avant entraînement sur cycloergomètre, 2022 (PMC9178199).</li>
  <li>Changements minimaux importants (douleur, ODI) : Ostelo et al., Spine 2008.</li>
  <li>Règlement (UE) 2017/745 relatif aux dispositifs médicaux ; CNIL, méthodologie de référence MR-004 ; loi n° 2012-300 (Jardé).</li>
 </ol>
 <p class="small muted" style="margin-top:6mm">Document de cadrage opérationnel préparé par KŌMØ Longevity pour l’équipe HIRO. Les indications, contre-indications et modalités des soins relèvent des médecins HIRO. Toute diffusion scientifique suppose une qualification réglementaire préalable.</p>
</section>`);
await renderPdf(html,OUT,'KŌMØ × HIRO · Parcours mesurés · protocoles communs · v1.0 · '+DATE);
