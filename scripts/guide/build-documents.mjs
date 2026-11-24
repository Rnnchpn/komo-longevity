// Documents imprimés KŌMØ Motion, Clinique HIRO (PDF A4) :
//  1. Déroulé de la consultation (sans papier : dossier, consentement, sécurité, tests, restitution, envoi)
//  2. Protocole complet (14 tests + photo de profil, réglages VALD, repères, reproductibilité)
//  4. Exercices et longévité (rappel : ce que chaque exercice du programme maison entraîne et pourquoi)
// Le document 3 (résultat pour le patient) est le passeport PDF produit par PULSE lui-même.
// Les tests, le consentement et les questions de sécurité sont lus dans pulse-v14-src/motion-protocol.mjs :
// les documents et la console disent toujours la même chose.
// Usage : node scripts/guide/build-documents.mjs [dossier de sortie]
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {mkdir} from 'node:fs/promises';
import {PROTOCOL,STEPS,STATIONS,COMPLEMENTS,CONSENT,SAFETY_QUESTIONS} from '../../pulse-v14-src/motion-protocol.mjs';
import {forStep,CHAIR_NORMS} from './longevity-reference.mjs';
import {e,steps,checks,table,doc,renderPdf} from './guide-kit.mjs';

const here=dirname(fileURLToPath(import.meta.url));
const OUT=process.argv[2]||here;
await mkdir(OUT,{recursive:true});
const DATE='23 novembre 2026';
const N=STEPS.length,NS=new Set(STEPS.map(s=>s.block)).size,POSTURE=COMPLEMENTS.find(c=>c.id==='posture_photo');
const unitFr={cm:'cm',kg:'kg',N:'N',s:'s','%':'%',mm:'mm','mm/s':'mm/s','W/kg':'W/kg','°':'°'};
const version='Protocole '+e(PROTOCOL.code)+' '+e(PROTOCOL.version)+' · version du '+DATE+' · document interne, non diagnostique';

// ───────────────────────── 1. Déroulé de la consultation ─────────────────────────
const stationRows=[...new Set(STEPS.map(s=>s.block))].map(b=>{
 const t=STEPS.filter(s=>s.block===b);
 const mins={A:'≈ 12 min',B:'≈ 13 min',C:'≈ 4 min',D:'≈ 3 min'}[b]||'';
 return ['Station '+b,e(STATIONS[b].label)+(b==='B'?'<br><span class="muted small">commence par la photo de profil</span>':''),
  t.map(x=>e(x.short||x.title.replace(/ · (DynaMo|ForceDecks)$/,''))+(x.optionalTest?' <span class="opt">si à l’aise</span>':'')).join(' · '),mins];
});
const TIMELINE=[
 ['− 15 min','Préparer','Salle, appareils, iPhone connecté à PULSE, lieu « Clinique HIRO ».'],
 ['0 – 5','Dossier','Prénom, nom, date de naissance, e-mail, sexe. Le code HIRO s’affiche : il sert à créer le profil VALD.'],
 ['5 – 8','Consentement','QR patient : le patient lit et coche sur son téléphone. La console affiche ✓ et l’heure.'],
 ['8 – 10','Sécurité','Les 8 questions de la console, puis la case de sécurité.'],
 ['10 – 22','Station A','Force au DynaMo, tout assis : 5 tests. Entre deux tests, le patient note sa douleur puis commence son questionnaire.'],
 ['22 – 24','Photo de profil','Pieds nus, de profil, une photo envoyée à Claude avec le code.'],
 ['24 – 37','Station B','Plateformes ForceDecks : masse et taille, équilibre, lever, appui sur un pied, saut si à l’aise.'],
 ['37 – 44','Stations C et D','Marche 4 m (2 passages), puis lever de chaise 30 s.'],
 ['44 – 48','Relecture','Le patient finit son questionnaire (et l’ODI s’il a mal au dos ou à la jambe). Tu relis le Rapport ; Claude te rend la posture à valider.'],
 ['48 – 60','Restitution','Capacités, 3 priorités, programme maison montré en salle. Validation, remise sur son téléphone, e-mail, rendez-vous à 6 semaines.']
];
const PANNES=[
 ['Le patient n’a pas de smartphone','« Sans smartphone : sur cet iPhone » : il coche son consentement sur ton iPhone. Tu remplis le questionnaire avec lui dans l’onglet Questionnaire. À la fin, envoi par e-mail ou passeport imprimé.'],
 ['Le consentement reste « en attente »','Le patient n’a pas encore coché la première case sur sa page. Fais-le-lui terminer, ou utilise « Sans smartphone : sur cet iPhone ».'],
 ['Il refuse la photo','Pas de photo de profil : rien n’est bloqué, la posture n’apparaît simplement pas dans son passeport.'],
 ['Il refuse l’e-mail','Le bouton e-mail le signale. Montre-lui ses résultats sur son téléphone (le lien reste valable 60 jours) ou imprime le passeport.'],
 ['Tu passes à l’app VALD, ou l’iPhone se verrouille','Rien n’est perdu : PULSE garde les valeurs déjà tapées. Reviens dans Safari, la page reprend où tu en étais.'],
 ['La page se fige ou l’iPhone redémarre','Rouvre PULSE : la consultation est sur le serveur et reprend à l’étape en cours (Consultation › « Consultation en cours »).'],
 ['Le patient ne peut pas scanner le QR','Monte la luminosité de ton écran ; sinon « Copier le lien » et envoie-le par ta messagerie sécurisée.'],
 ['« Ce lien n’est plus valide »','Le QR a été renouvelé ou a plus de 60 jours : « QR patient », puis « Nouveau QR ».'],
 ['« Consultation déjà en cours »','Un ancien bilan est resté ouvert : Consultation, puis « Clore » sur sa carte. Rien n’est supprimé.'],
 ['VALD ou le DynaMo en panne','« Test non réalisé », motif « Appareil indisponible ». Le test sera refait au contrôle.'],
 ['Une valeur fausse après validation','Rapport › « Corriger un test » : le test s’ouvre avec ses valeurs, tu corriges et tu valides. Le passeport du patient est mis à jour.']
];
const consentBox='<div class="note"><p><b>Ce que lit le patient</b> (même texte sur son téléphone et sur ton iPhone)</p>'+
 CONSENT.info.map(t=>'<p class="small">'+e(t)+'</p>').join('')+
 '<ul class="consent-items">'+CONSENT.items.map(it=>'<li><span class="box"></span><span>'+e(it.label)+(it.required?' <span class="req">nécessaire pour faire le bilan</span>':'')+'</span></li>').join('')+'</ul></div>';

const deroule=doc('KŌMØ Motion · Déroulé de la consultation',`
<div class="cover">
 <div class="brand">KŌMØ MOTION</div>
 <div class="title"><p class="kicker">Clinique HIRO, Beausoleil · document 1 sur 4</p><h1>Déroulé de la<br>consultation</h1></div>
 <p class="lead">Le jour de la consultation, de l’accueil jusqu’au bilan reçu par le patient. Tout se fait sur ton iPhone et sur le téléphone du patient : pas de fiche papier. Le détail de chaque test est dans le protocole complet (document 2).</p>
 <div class="facts"><div><strong>≈ 60 min</strong><span>accueil, tests et restitution</span></div><div><strong>${N} + 1</strong><span>tests et photo de profil</span></div><div><strong>6 semaines</strong><span>jusqu’au contrôle</span></div></div>
 <div class="flow"><ol>
  <li>Préparer la salle et l’iPhone</li><li>Créer le dossier du patient</li><li>Consentement sur son téléphone</li><li>Questions de sécurité</li>
  <li>Les ${N} tests et la photo de profil</li><li>Questionnaire, pendant les tests</li><li>Restitution, puis validation</li><li>Remise sur son téléphone et e-mail</li>
 </ol></div>
 <p class="version">${version}</p>
</div>

<section class="part">
 <p class="kicker">Vue d’ensemble</p><h2>Une heure, minute par minute</h2>
 <p class="intro">Les durées sont indicatives pour un premier bilan. Le contrôle à 6 semaines est plus court : le dossier existe déjà.</p>
 ${table(['Minutes','Étape','Ce qui se passe'],TIMELINE.map(r=>[r[0],r[1],e(r[2])]),'timeline')}
 <h4>Ce que voit le patient sur son téléphone</h4>
 <div class="phone">
  <div><span class="when">Après le QR</span><strong>Consentement, puis questionnaire</strong>Il lit, coche, puis répond aux questions pendant les tests. Aucun compte, aucun mot de passe.</div>
  <div><span class="when">Tests terminés</span><strong>« Vos résultats sont en relecture »</strong>Rien ne s’affiche tant que tu n’as pas validé. La page se met à jour seule.</div>
  <div><span class="when">Après ta validation</span><strong>« Vos résultats, Prénom »</strong>Capacités, priorités, programme maison et « Télécharger mon passeport (PDF) ». Lien valable 60 jours.</div>
 </div>
</section>

<section class="part">
 <p class="kicker">Étape 1 · avant l’arrivée</p><h2>Préparer la salle et l’iPhone</h2>
 ${checks([
  '<b>Couloir</b> droit d’au moins 6 m : scotch au sol à 0 m (départ), 4 m (arrivée) et 6 m (repère), mesurés au ruban.',
  '<b>Chaise</b> d’environ 43 cm, sans accoudoirs, calée contre un mur.',
  '<b>ForceDecks</b> : deux plateformes allumées, appairées, posées à plat ; un appui (mur, dossier) à portée de main.',
  '<b>DynaMo Plus</b> chargé, pad, palme et pad courbe prêts, table d’examen libre. <b>Toise</b> ou ruban au mur.',
  '<b>Mur uni</b> et sol dégagé sur 3 m pour la photo de profil.',
  '<b>iPhone</b> chargé (plus de 60 %), mode Ne pas déranger, apps ForceDecks et DynaMo ouvertes.'
 ])}
 <h4>PULSE sur l’iPhone</h4>
 ${steps([
  'Safari › pulse.komolongevity.com › « Connectez-vous », compte professionnel. Astuce : « Partager › Sur l’écran d’accueil » pour l’ouvrir comme une app.',
  'Sous « Lieu de consultation », choisis <b>KŌMØ Beausoleil — Clinique HIRO</b>. Le badge doit dire « consultation réelle » (« démonstration » veut dire Cannes).',
  'Laisse PULSE ouvert sur « Patients ». Un ordinateur peut afficher la même consultation en même temps, si tu préfères saisir sur un grand écran.'
 ])}
 <div class="note"><b>Papier : le formulaire ODI officiel seulement</b> (version française fournie avec la licence Mapi Research Trust), quelques exemplaires imprimés pour les patients qui ont mal au dos ou à la jambe. En secours (réseau coupé), garde aussi une feuille de mesures dans un tiroir : tu y notes les valeurs et tu les saisis plus tard.</div>

 <div class="block"><p class="kicker">Étape 2</p><h2>Créer le dossier</h2>
 ${steps([
  '<b>Patients</b> (colonne de gauche, ou barre du bas sur l’iPhone) › « Nouveau patient ».',
  'Prénom, nom, date de naissance, <b>e-mail</b> (pour lui envoyer son bilan), puis « Femme », « Homme » ou « Non précisé ». Le sexe et l’âge choisissent les repères du passeport.',
  'Le code <b>HIRO-AAMMJJ-NN</b> s’affiche en grand.',
  'Coche « Patient informé de l’objet du bilan. Il donnera son accord sur son téléphone, juste après le QR (ou sur cet iPhone). »',
  '« Créer et démarrer la consultation » : les tests s’ouvrent directement.'
 ])}
 <div class="note warn"><b>Profil VALD (DynaMo et ForceDecks), une fois par patient :</b> nom = le code HIRO, date de naissance = 1<sup>er</sup> janvier de son année de naissance, sexe. Jamais le vrai nom : VALD est un cloud hors de PULSE. Le code est aussi le seul identifiant que tu envoies à Claude.</div></div>
</section>

<section class="part">
 <p class="kicker">Étape 3</p><h2>Consentement sur le téléphone du patient</h2>
 ${steps([
  'En haut de la console, bouton vert <b>« QR patient »</b>. Le patient le vise avec l’appareil photo de son téléphone : sa page « Mon bilan » s’ouvre.',
  'Elle commence par le consentement : il lit et coche lui-même. La première case est nécessaire ; les trois autres sont des choix.',
  'Dans la console, la ligne devient <b>« ✓ Consentement du patient · 10:42 · photo ✓ · e-mail ✓ · conservation ✓ »</b>. L’heure et ses choix sont enregistrés dans la consultation.',
  'Pas de smartphone ? <b>« Sans smartphone : sur cet iPhone »</b> : tends-lui ton iPhone, il coche, puis « Enregistrer le consentement ».'
 ])}
 ${consentBox}
 <p class="small muted">« photo ✗ » : pas de photo de profil. « e-mail ✗ » : le bilan est remis sur son téléphone ou imprimé. Ces choix s’affichent dans la console à côté du ✓.</p>

 <div class="block"><p class="kicker">Étape 4</p><h2>Questions de sécurité</h2>
 <p>La console les affiche avant le premier test, sous « Avant le premier test, demande au patient : »</p>
 <ol class="steps">${SAFETY_QUESTIONS.map(x=>'<li>'+e(x)+'</li>').join('')}</ol>
 <div class="note warn"><b>Un « oui » :</b> pas de test de force maximale ni d’équilibre sans ta décision ; adapter, reporter ou orienter. Puis coche « Questions posées : aucun « oui », ou décision prise. Espace dégagé, appui à portée de main. » Sans cette case, le premier test ne démarre pas.</div></div>
</section>

<section class="part">
 <p class="kicker">Étape 5</p><h2>Les ${N} tests et la photo de profil</h2>
 <p class="intro">Le patient passe par ${NS} postes. La console guide chaque test : le bandeau dit où installer le patient, « Installation et consignes » reprend le protocole, tu saisis, puis « Valider et passer au suivant ».</p>
 ${table(['Station','Poste','Tests','Durée'],stationRows,'stations')}
 <h4>Saisir les valeurs, sans papier</h4>
 ${steps([
  '<b>DynaMo et ForceDecks</b> : lis la valeur sur l’app VALD et tape-la dans la console. Écran DynaMo en kg ? Le bouton « N / kg » convertit.',
  '<b>Marche 4 m et appui sur un pied</b> : le chrono de la console remplit les essais ; il garde le meilleur.',
  '<b>Lever de chaise</b> : un appui sur « +1 lever » par lever complet ; le total reste modifiable.',
  '<b>Test impossible</b> : « Test non réalisé » et son motif. Le passeport l’indique sans valeur inventée.',
  'Tu préfères ne pas taper pendant le test ? Envoie à Claude les captures de l’app VALD (avec le code, jamais le nom). Il te renvoie un récapitulatif et n’enregistre rien avant ton « OK ».'
 ])}
 <h4>Photo de profil, au début de la station B</h4>
 ${steps([
  'Seulement si le consentement affiche « photo ✓ ».',
  e(POSTURE.setup),
  e(POSTURE.instruction),
  'Envoie la photo à Claude avec le <b>code</b> du patient. Il te renvoie la photo annotée et les angles (tête, tronc, bassin, genou). Tu relis, puis « OK » : les mesures arrivent dans le Rapport, la photo est effacée.'
 ])}
 <div class="note"><b>Arrêter un test :</b> douleur, vertige, malaise, perte d’équilibre, essoufflement anormal. Tu arrêtes, tu rassures, tu fais asseoir. Un test impossible n’est pas un échec.</div>
</section>

<section class="part">
 <p class="kicker">Étape 6</p><h2>Questionnaire</h2>
 ${steps([
  'Le patient répond <b>sur son téléphone</b>, entre deux tests. D’abord <b>sa douleur</b>, trois réglettes de 0 à 10 : lombaire, membre inférieur, générale. Puis 22 questions, et 5 questions facultatives « Santé et longévité » (chutes, activité, temps assis, tabac, médicaments).',
  'Ses réponses arrivent dans l’onglet <b>Questionnaire</b> de la console. Sans téléphone, lis-les-lui et réponds au même endroit.',
  '<b>Douleur du dos ou de la jambe</b> : remets-lui le <b>formulaire ODI officiel</b>. Il coche une phrase par rubrique. Dans l’onglet Questionnaire, rubrique « Oswestry (ODI) », tu reportes la note de chaque rubrique (0 à 5) : le score en % s’affiche dès 8 rubriques.',
  'Un questionnaire incomplet n’empêche rien : le passeport le signale.'
 ])}

 <div class="block"><p class="kicker">Étape 7</p><h2>Restitution, puis validation</h2>
 ${steps([
  'Onglet <b>Rapport</b>, écran tourné vers le patient. <b>Vos capacités</b> : marche, force des jambes, équilibre, force musculaire, symétrie et posture, chacune dans sa zone (priorité, à consolider, solide).',
  'Les <b>3 priorités</b> et leur objectif à 6 semaines, puis le <b>programme maison</b> : 4 exercices et la marche quotidienne. Le pourquoi de chaque exercice est dans le document 4.',
  'Fais faire chaque exercice une ou deux fois en salle : un geste déjà fait est un geste refait à la maison.',
  'Relis le Rapport. Une valeur fausse ? « Corriger un test ».',
  'En bas du Rapport : <b>« Valider et rendre visible au patient »</b>. Sur son téléphone, « en relecture » laisse place à ses résultats.'
 ])}
 <blockquote>« Voici votre point de départ. Ce ne sont pas des diagnostics, ce sont des repères. Votre marche est solide. Votre équilibre est sous les 10 secondes d’un côté : dans les études, c’est associé à un risque plus élevé. La bonne nouvelle, c’est que ça s’entraîne. Voici vos exercices, et nous refaisons les mêmes mesures dans 6 semaines. »</blockquote>
 <p class="small muted">Termine par ce qui va progresser. Le chiffre de risque donne du sens ; il ne doit pas inquiéter une personne fragile ou anxieuse.</p></div>
</section>

<section class="part">
 <p class="kicker">Étape 8</p><h2>Remise et e-mail</h2>
 ${steps([
  '<b>Sur son téléphone, avant qu’il parte</b> : montre-lui sa page « Mon bilan », ses priorités, son programme et le bouton « Télécharger mon passeport (PDF) ». Conseille-lui d’ajouter la page à ses favoris.',
  '<b>« Envoyer le bilan par e-mail »</b> (sous « Envoi au patient ») : Mail s’ouvre sur ton iPhone avec son adresse, l’objet et son lien personnel, valable 60 jours. Vérifie l’adresse, puis « Envoyer ».',
  'L’e-mail ne contient aucun résultat : tout est derrière le lien, avec le PDF et le programme des 6 semaines.',
  'S’il a refusé l’e-mail, ou s’il préfère le papier : « Télécharger le passeport complet », puis « Partager › Imprimer ».',
  '<b>Rendez-vous de contrôle</b> à 6 semaines, pris avant son départ.'
 ])}
 <div class="note">« Masquer au patient » retire l’accès si tu dois corriger quelque chose ; sa page repasse « en relecture » jusqu’à ta nouvelle validation. « Lien du patient » réaffiche le QR.</div>

 <div class="block"><p class="kicker">Six semaines plus tard</p><h2>Le contrôle</h2>
 ${steps([
  'Patients › le même patient › « Consultation » › « Démarrer la consultation ». Pas de nouveau dossier. Nouveau « QR patient » : il redonne son consentement sur son téléphone en quelques secondes.',
  'Mêmes conditions : même moment de la journée, mêmes chaussures, même chaise, même distance du pad au genou, même profil VALD, même cadrage de la photo.',
  'Mêmes questionnaires : les trois douleurs sur son téléphone et, s’il l’a rempli à J0, le formulaire ODI.',
  'Le Rapport affiche la trajectoire : une ligne par mesure, l’écart, et un point vert quand le changement dépasse la marge d’erreur (douleur 2 points, ODI 10 points). Le passeport du patient reprend la même page « Vos progrès mesurés ».',
  'Relis les objectifs un par un (atteint, en progrès, stable), ajuste le programme, fixe le rendez-vous suivant.'
 ])}</div>
</section>

<section class="part">
 <h2>Si quelque chose ne marche pas</h2>
 ${table(['Situation','Que faire'],PANNES.map(r=>[e(r[0]),e(r[1])]))}
 <h4>Repères à garder en tête</h4>
 <ul>
  <li>Le bilan décrit des capacités et les situe par rapport à des repères publiés. Il ne pose pas de diagnostic et ne calcule ni score global ni « âge du mouvement ».</li>
  <li>Le nom du patient reste dans PULSE. VALD, les captures et les photos envoyées à Claude ne portent que le code.</li>
  <li>La photo de profil n’est conservée nulle part : seules les mesures, relues par toi, sont enregistrées.</li>
  <li>Rien n’est enregistré depuis une photo ou une capture sans ton « OK » ; rien n’est montré au patient sans ta validation.</li>
  <li>Le programme maison est une proposition que tu valides et adaptes selon les symptômes, les traitements et le risque de chute.</li>
 </ul>
</section>`);
await renderPdf(deroule,join(OUT,'KOMO_Motion_1_Deroule_consultation.pdf'),'KŌMØ Motion · 1 · Déroulé de la consultation · '+PROTOCOL.code+' '+PROTOCOL.version);

// ───────────────────────── 2. Protocole complet ─────────────────────────
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
 if(s.kind==='count')return '<ul><li><b>'+e(s.label)+'</b> : un appui sur « +1 lever » par lever complet pendant les 30 s ; le total reste modifiable. PULSE en calcule la puissance des jambes avec la taille.</li></ul>';
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
// Schéma du cadrage de la photo de profil : iPhone vertical à 3 m, à hauteur de hanche.
const photoSetup='<svg class="corridor" style="max-width:150mm" viewBox="0 0 520 118" role="img" aria-label="Cadrage : iPhone vertical à 3 mètres, à hauteur de hanche, patient de profil devant un mur uni">'+
 '<rect x="400" y="6" width="112" height="94" fill="#f5f1ea" stroke="#d9cfbf"/><text x="506" y="19" text-anchor="end" font-size="10" fill="#5d625a">mur uni</text>'+
 '<line x1="20" y1="100" x2="512" y2="100" stroke="#1c342a" stroke-width="1.5"/>'+
 '<line x1="454" y1="10" x2="454" y2="100" stroke="#b4925e" stroke-width="1.2" stroke-dasharray="3 3"/>'+
 '<circle cx="457" cy="25" r="7" fill="#fff" stroke="#1c342a" stroke-width="2.2"/>'+
 '<polyline points="456,32 456,38 455,64 454,98" fill="none" stroke="#1c342a" stroke-width="3" stroke-linejoin="round"/>'+
 '<line x1="454" y1="98" x2="466" y2="98" stroke="#1c342a" stroke-width="3"/>'+
 '<line x1="456" y1="40" x2="457" y2="63" stroke="#1c342a" stroke-width="2"/>'+
 '<rect x="44" y="52" width="13" height="24" rx="2.5" fill="#1c342a"/><circle cx="50.5" cy="73" r="1.4" fill="#fff"/>'+
 '<line x1="50" y1="76" x2="50" y2="100" stroke="#6b6f66" stroke-width="1.2"/>'+
 '<line x1="57" y1="64" x2="446" y2="64" stroke="#b4925e" stroke-width="1" stroke-dasharray="5 4"/>'+
 '<text x="240" y="57" text-anchor="middle" font-size="11" font-weight="600" fill="#1c342a">3 m · iPhone vertical, droit, sans zoom</text>'+
 '<text x="50" y="45" text-anchor="middle" font-size="10" fill="#5d625a">hauteur de hanche</text>'+
 '<text x="225" y="114" text-anchor="middle" font-size="10" fill="#5d625a">tout le corps dans l’image · côté droit vers l’appareil</text></svg>';
const steps2=(items)=>steps(items);
function longevityMarkup(id){
 const L=forStep(id);if(!L)return '';
 const chair=id==='sts'?'<table class="norms"><thead><tr><th>Âge</th>'+CHAIR_NORMS.bands.map(b=>'<th>'+b+'</th>').join('')+'</tr></thead><tbody>'+
  [['Femme · sous la moyenne','female','below'],['Femme · standard d’autonomie','female','standard'],['Homme · sous la moyenne','male','below'],['Homme · standard d’autonomie','male','standard']]
   .map(([l,sx,k])=>'<tr><td>'+l+'</td>'+CHAIR_NORMS[sx][k].map(v=>'<td>'+v+'</td>').join('')+'</tr>').join('')+'</tbody></table>':'';
 return '<div class="longevity"><p class="lk">Longévité</p><dl class="ldl">'+
  '<dt>Pourquoi</dt><dd>'+e(L.why)+'</dd><dt>Repères</dt><dd>'+e(L.ref)+'</dd><dt>Objectif</dt><dd><b>'+e(L.target)+'</b></dd>'+
  (L.improve&&L.improve!=='—'?'<dt>Progresser</dt><dd>'+e(L.improve)+'</dd>':'')+'<dt>À 6 semaines</dt><dd>'+e(L.control)+'</dd></dl>'+chair+'</div>';
}
function testCard(s,n){
 return '<article class="test">'+
  '<header><span class="num">'+String(n).padStart(2,'0')+'</span><div><h3>'+e(s.title)+'</h3>'+
  '<p class="meta">'+e(s.device)+' · '+e(s.trials)+(s.optionalTest?' · <b>seulement si le patient est à l’aise</b>':'')+'</p></div></header>'+
  (s.walkway?corridor:'')+
  '<dl><dt>Installer</dt><dd>'+e(s.setup)+'</dd><dt>Dire</dt><dd class="say">'+e(s.script)+'</dd>'+
  '<dt>Faire</dt><dd>'+doMarkup(s)+'</dd><dt>Saisir</dt><dd>'+enterMarkup(s)+'</dd></dl>'+longevityMarkup(s.id)+'</article>';
}
function postureCard(){
 const s=POSTURE;
 return '<article class="test breakable"><header><span class="num alt">P</span><div><h3>'+e(s.title)+'</h3>'+
  '<p class="meta">'+e(s.device)+' · '+e(s.trials)+' · <b>seulement si le consentement affiche « photo ✓ »</b></p></div></header>'+photoSetup+
  '<dl><dt>Installer</dt><dd>'+e(s.setup)+'</dd><dt>Dire</dt><dd class="say">'+e(s.script)+'</dd>'+
  '<dt>Faire</dt><dd><p>'+e(s.instruction)+'</p><p>Envoie la photo à Claude avec le code du patient (jamais son nom). Claude repère l’oreille, l’épaule, la hanche, le genou et la cheville, te renvoie la photo annotée et les angles ci-dessous, puis efface la photo. Tu relis, puis « OK ».</p></dd>'+
  '<dt>Enregistré</dt><dd>'+enterMarkup(s)+'<p class="small muted">Angles par rapport à la verticale, positifs vers l’avant. L’observation est descriptive, jamais un diagnostic.</p></dd></dl>'+
  longevityMarkup('posture_photo')+'</article>';
}
function stationsMarkup(){
 const blocks=[...new Set(STEPS.map(s=>s.block))];let n=0;
 return blocks.map(b=>{
  const st=STATIONS[b],tests=STEPS.filter(s=>s.block===b);
  const head='<div class="station-head"><p class="kicker">Station '+e(b)+'</p><h2>'+e(st.label)+'</h2><p class="place">'+e(st.place)+'</p></div>';
  const note=b==='A'?'<p class="note"><b>Profil du patient dans VALD (DynaMo et ForceDecks), une fois par patient.</b> Nom = le code PULSE (HIRO-AAMMJJ-NN), date de naissance = 1<sup>er</sup> janvier de son année de naissance, sexe. Jamais le vrai nom : VALD Hub est un cloud hors de PULSE. Au contrôle, reprends le même profil.</p>':
   b==='B'?'<p class="note"><b>La station B commence par la photo de profil</b>, pieds nus, avant de monter sur les plateformes (carte P, à la fin du protocole).</p>':'';
  const cards=tests.map(t=>testCard(t,++n));
  return '<section class="station"><div class="station-lead">'+head+note+cards[0]+'</div>'+cards.slice(1).join('')+'</section>';
 }).join('');
}
const SUMMARY=[['Vitesse de marche 4 m','gait_4m'],['Lever de chaise 30 s','sts'],['Flexion du coude','dynamo_elbow_flex'],['Appui sur un pied','unipodal_left'],
 ['Saut vertical (CMJ)','fd_cmj'],['Force hanche et genou (DynaMo)','dynamo_knee_ext'],['Équilibre debout (plateformes)','fd_quiet_stand'],['Posture de profil (photo)','posture_photo']];
const REPRO=[
 ['Marche 4 m','bonne','≥ 0,1 m/s','départ arrêté, 2 passages, le plus rapide retenu, même chronométreur'],
 ['Lever de chaise 30 s','bonne','≥ 2 levers','1 à 2 levers d’essai avant le chrono, même chaise'],
 ['Puissance des jambes (calculée)','bonne','≥ 0,42 W/kg (homme), 0,33 (femme)','même chaise de 43 cm, même taille mesurée'],
 ['Flexion du coude (DynaMo)','bonne','≥ 20 %','essai à 50 %, puis 3 essais par côté, coude à 90° contre le corps, pad au même endroit'],
 ['Saut vertical (CMJ)','excellente','≥ 10 %','mains sur les hanches, 3 sauts, le meilleur retenu'],
 ['Appui sur un pied','bonne pour classer, faible en secondes','franchir les 10 s','jusqu’à 2 essais par côté, le meilleur retenu'],
 ['Genou et hanche (DynaMo)','bonne','≥ 20 %','essai à 50 %, 3 essais, même position du pad'],
 ['Quiet Stand (yeux ouverts et fermés)','bonne pour la vitesse','≥ 20 % sur la vitesse','même position des pieds, même consigne'],
 ['Lever sur plateformes','non publiée pour ce test','≥ 20 % ou 10 points','suivi descriptif'],
 ['Posture de profil (photo)','dépend du cadrage','≥ 5°','iPhone vertical à 3 m, hauteur de hanche, même côté, pieds nus'],
 ['Douleur (EVA de 0 à 10)','bonne','≥ 2 points','même réglette, notée avant les tests'],
 ['Incapacité lombaire (ODI)','bonne','≥ 10 points','formulaire officiel, au moins 8 rubriques remplies']
];
const protocole=doc('KŌMØ Motion · Protocole complet',`
<div class="cover">
 <div class="brand">KŌMØ MOTION</div>
 <div class="title"><p class="kicker">Clinique HIRO, Beausoleil · document 2 sur 4</p><h1>Protocole<br>complet</h1></div>
 <p class="lead">Les ${N} tests et la photo de profil : installation, phrase à dire, réglages VALD, valeurs à saisir, repères de longévité et ce qui compte comme un vrai changement au contrôle. Le texte est celui de la console PULSE.</p>
 <div class="facts"><div><strong>${N}</strong><span>tests en ${NS} stations</span></div><div><strong>+ 1</strong><span>photo de profil (posture)</span></div><div><strong>≈ 35 min</strong><span>de tests</span></div></div>
 <div class="flow"><ol>
  <li>Station A · force au DynaMo, assis (5 tests)</li><li>Photo de profil, pieds nus</li><li>Station B · plateformes ForceDecks (7 tests)</li><li>Station C · marche 4 m</li>
  <li>Station D · lever de chaise 30 s</li><li>Repères de longévité</li><li>Reproductibilité</li><li>Conditions du contrôle</li>
 </ol></div>
 <p class="version">${version}</p>
</div>

<section class="part">
 <p class="kicker">Avant le premier test</p><h2>Conditions standard</h2>
 <p class="intro">Un bilan n’a de valeur que s’il peut être refait à l’identique. Ces règles valent pour le premier bilan et pour chaque contrôle.</p>
 ${checks([
  '<b>Ordre fixe</b> : A, photo, B, C, D. La console le suit ; « Plus tard » reporte un test à la fin.',
  '<b>Chaussage noté</b> (pieds nus, chaussettes, chaussures) et aide de marche : repris à l’identique au contrôle.',
  '<b>Même moment de la journée</b>, idéalement le même praticien.',
  '<b>Consigne mot pour mot</b> : la phrase « Dire » de chaque test. Encouragement neutre et identique (« allez, allez »), ni plus ni moins.',
  '<b>Essai de familiarisation</b> à 50 % pour les forces ; puis les essais maximaux, le meilleur retenu.',
  '<b>Chaise de 43 cm</b> sans accoudoirs, calée contre un mur ; même distance pad–malléole au DynaMo (notée).',
  '<b>Profil VALD au code</b> du patient, jamais à son nom ; le même profil à chaque séance.',
  '<b>Sécurité</b> : les 8 questions de la console, un appui à portée de main pour tout test debout, toi à côté.'
 ])}
 <h4>Matériel</h4>
 <p>DynaMo Plus (pad, palme et pad courbe), 2 ForceDecks Mini, toise ou ruban mural, chaise de 43 cm, couloir balisé à 0, 4 et 6 m, iPhone avec PULSE et les apps VALD, mur uni pour la photo, formulaires ODI officiels imprimés.</p>
 <div class="block"><p class="kicker">En un coup d’œil</p><h2>Les repères de longévité</h2>
 <p class="intro">Seuils de population : ils orientent le programme, ils ne posent pas de diagnostic.</p>
 ${table(['Mesure','Repère','Objectif','Changement réel à 6 semaines'],SUMMARY.map(([n,id])=>{const L=forStep(id);return [e(n),e(L.ref.replace(', tableau ci-dessous',', tableau dans la fiche du test')),e(L.target),e(L.control)]}),'summary')}</div>
</section>
<section class="part tests">${stationsMarkup()}</section>
<section class="part">
 <p class="kicker">Complément · début de la station B</p><h2>Photo de profil · posture</h2>
 <p class="intro">Hors des ${N} tests : elle ne bloque ni la fin de la consultation ni l’envoi au patient. La photo n’est conservée nulle part ; seules les mesures, relues par toi, sont enregistrées.</p>
 ${postureCard()}
</section>
<section class="part">
 <p class="kicker">Complément · questionnaire</p><h2>Douleur et incapacité : EVA et ODI</h2>
 <p class="intro">Hors des ${N} tests, comme la posture. Ils décrivent ce que le patient ressent ; les tests décrivent ce qu’il fait. Les deux ensemble montrent si un soin change la vie quotidienne.</p>
 ${table(['','Douleur (EVA)','Oswestry (ODI)'],[
  ['<b>Pour qui</b>','Tous les patients','Douleur lombaire, avec ou sans douleur de jambe'],
  ['<b>Qui remplit</b>','Le patient, sur son téléphone, en premier','Le patient, sur le formulaire officiel imprimé ; tu reportes ses notes dans la console'],
  ['<b>Contenu</b>','Trois réglettes de 0 (aucune douleur) à 10 (douleur maximale) : lombaire, membre inférieur, générale','10 rubriques de la vie quotidienne, chacune notée de 0 à 5'],
  ['<b>Résultat</b>','La note sur 10, telle quelle','Total ÷ (5 × rubriques remplies) × 100, à partir de 8 rubriques : 0–20 % minime, 21–40 % modérée, 41–60 % sévère, au-delà très sévère'],
  ['<b>Vrai changement</b>','2 points','10 points']
 ])}
 ${steps2(['Consigne de l’EVA : « Notez votre douleur en ce moment, de 0, aucune douleur, à 10, douleur maximale. » Le patient touche la note sur son téléphone.',
  'ODI : pas d’aide pour choisir la phrase. Une rubrique sans objet (vie sexuelle, par exemple) reste vide ; le score se calcule sur les rubriques remplies.',
  'Au contrôle : mêmes questionnaires, au même moment de la consultation.'])}
 <p class="small muted">Oswestry Disability Index © Jeremy Fairbank, 1980 · version française validée, utilisée sous licence Mapi Research Trust. Le texte du formulaire n’est pas reproduit ici : il est imprimé à partir du fichier fourni avec la licence. Changements minimaux importants : Ostelo et al., Spine 2008.</p>
</section>
<section class="part">
 <p class="kicker">Au contrôle</p><h2>Reproductibilité : ce qui compte comme un vrai changement</h2>
 <p>Refaire un test ne donne jamais exactement le même chiffre. PULSE ne parle de progrès qu’au-delà de la marge d’erreur de chaque mesure ; en dessous, il affiche « stable ».</p>
 ${table(['Mesure','Fiabilité','Changement réel','Ce qui la rend fiable'],REPRO.map(r=>r.map(e)))}
 <p class="muted small">Appui sur un pied : l’écart en secondes devrait dépasser 24 s pour être sûr ; seul le franchissement des 10 s compte.</p>
 <h4>Conditions du contrôle</h4>
 ${steps2(['Même patient dans PULSE, même profil VALD, mêmes ${N} tests dans le même ordre.'.replace('${N}',N),
  'Mêmes chaussures, même chaise, même distance du pad, même moment de la journée, même cadrage de la photo.',
  'Si les conditions diffèrent, PULSE affiche un avertissement dans le Rapport : lis-le avant de commenter un écart.'])}
</section>`);
await renderPdf(protocole,join(OUT,'KOMO_Motion_2_Protocole_complet.pdf'),'KŌMØ Motion · 2 · Protocole complet · '+PROTOCOL.code+' '+PROTOCOL.version);

// ───────────────────────── 4. Exercices et longévité ─────────────────────────
// Un exercice = une capacité mesurée = une association publiée avec la longévité ou l'autonomie.
// Sources vérifiées le 23/11/2026 ; formulations « associé à », jamais une promesse individuelle.
const KEY=[
 ['+ 0,1 m/s','de vitesse de marche : 12 % de risque de décès en moins','Studenski, JAMA 2011 · 34 485 personnes'],
 ['− 5 kg','de force de préhension : 16 % de mortalité en plus','Leong, Lancet 2015 (PURE) · 139 691 personnes'],
 ['< 10 s','sur un pied : risque de décès 1,8 fois plus élevé sur 7 ans','Araújo, BJSM 2022 · 1 702 personnes'],
 ['− 23 %','de chutes avec des exercices d’équilibre et fonctionnels','Sherrington, Cochrane 2019 · 108 essais']
];
const EXS=[
 {cap:'Marche',items:[
  ['Marche rapide fractionnée','Vitesse de marche (4 m)','Chaque 0,1 m/s gagné est associé à 12 % de risque de décès en moins. Les phases rapides entraînent le cœur et la cadence du pas.','≥ 1,0 m/s, sinon + 0,1 m/s'],
  ['Grands pas avec appui','Longueur du pas, vitesse de marche','Un pas plus long et plus sûr fait la vitesse de marche ; il entraîne aussi l’équilibre au moment où le poids passe d’une jambe à l’autre.','vitesse en hausse'],
  ['Marche quotidienne','Activité de fond','Plus de pas par jour est associé à moins de décès, jusqu’à environ 6 000 à 8 000 pas après 60 ans (Paluch 2022). L’OMS conseille 150 min d’activité modérée par semaine.','20 à 30 min par jour']]},
 {cap:'Force des jambes',items:[
  ['Lever de chaise lent','Lever de chaise 30 s, puissance des jambes','Une puissance des jambes basse est associée à un risque de décès plus que doublé sur 9 ans (cohorte de Tolède). 30 à 60 min de renforcement par semaine sont associées à 10 à 20 % de mortalité en moins (Momma 2022).','+ 2 levers'],
  ['Montées sur la pointe des pieds','Poussée de la marche','Les mollets propulsent chaque pas : leur force soutient la vitesse de marche et la récupération d’un déséquilibre vers l’avant.','vitesse et levers en hausse']]},
 {cap:'Équilibre',items:[
  ['Équilibre sur un pied','Appui sur un pied (ForceDecks)','Ne pas tenir 10 s sur un pied est associé à un risque de décès 1,8 fois plus élevé. Les exercices d’équilibre réduisent les chutes d’environ un quart.','10 s de chaque côté, puis 30 s'],
  ['Marche talon-pointe','Équilibre en mouvement','Entraîne l’équilibre pendant la marche, là où surviennent la plupart des chutes. Programme d’équilibre et fonctionnel : − 23 % de chutes (Cochrane 2019).','oscillations stables ou en baisse']]},
 {cap:'Force musculaire',items:[
  ['Serrer et porter','Flexion du coude (DynaMo)','Dans PURE, chaque 5 kg de force de main en moins est associé à 16 % de mortalité en plus. Porter deux sacs entraîne aussi le tronc.','force + 20 %'],
  ['Extension de genou assis','Extension de genou (DynaMo)','Le quadriceps sert à se lever, monter un escalier, se rattraper ; une force basse est associée aux limitations de mobilité et à une mortalité plus élevée.','côté faible ≥ 90 % du côté fort']]},
 {cap:'Symétrie et posture',items:[
  ['Écart de jambe sur le côté','Abduction de hanche (DynaMo), symétrie','Les abducteurs tiennent le bassin à chaque pas ; leur faiblesse favorise les chutes sur le côté, les plus à risque de fracture de hanche. Le côté faible travaille en premier.','côté faible ≥ 90 % du côté fort'],
  ['Redressement contre le mur','Posture de profil (photo)','Une posture voûtée, tête en avant, est associée à plus de difficultés pour marcher et se lever, et à une mortalité 1,44 fois plus élevée (Kado 2004).','tête : − 5° sur la photo']]}
];
const colgroup='<colgroup><col style="width:21%"><col style="width:20%"><col><col style="width:17%"></colgroup>';
const exTable='<table class="ex">'+colgroup+'<thead><tr><th>Exercice</th><th>Ce qu’il fait progresser</th><th>Lien avec la longévité</th><th>Visé au contrôle</th></tr></thead></table>'+
 EXS.map(g=>'<div class="grp"><p class="gt">'+e(g.cap)+'</p><table class="ex">'+colgroup+'<tbody>'+g.items.map(r=>'<tr><td>'+e(r[0])+'</td><td>'+e(r[1])+'</td><td>'+e(r[2])+'</td><td>'+e(r[3])+'</td></tr>').join('')+'</tbody></table></div>').join('');
const exercices=doc('KŌMØ Motion · Exercices et longévité',`
<style>
.keyfigs{display:grid;grid-template-columns:repeat(4,1fr);gap:4mm;margin:3mm 0 5mm}
.keyfigs div{border-top:2px solid var(--ink);padding-top:2.4mm;font-size:8.6pt;line-height:1.35}
.keyfigs strong{display:block;font-family:"Crimson Text",serif;font-size:22pt;color:var(--ink);line-height:1;margin-bottom:1.2mm}
.keyfigs em{display:block;font-style:normal;color:var(--muted);font-size:7.6pt;margin-top:1.4mm}
table.ex{font-size:8.3pt;table-layout:fixed;margin:0}
table.ex td{padding:1.4mm 2mm}
table.ex td:first-child,table.ex th:first-child{width:auto}
.grp{break-inside:avoid;margin:0}
.grp .gt{background:var(--sand);font-family:"Crimson Text",serif;font-size:11.5pt;font-weight:600;color:var(--ink);padding:1.2mm 2mm;margin:0;border-bottom:1px solid var(--line)}
.sources{font-size:7.4pt;color:var(--muted);columns:2;column-gap:8mm;padding-left:4mm;margin:0}
.sources li{margin-bottom:.6mm}
.sources li{margin-bottom:1mm;break-inside:avoid}
.head{display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid var(--line);padding-bottom:2mm;margin-bottom:7mm}
.head .brand{font-family:"Crimson Text",serif;font-size:13pt;color:var(--ink);letter-spacing:.06em}
</style>
<div class="head"><span class="brand">KŌMØ MOTION</span><span class="small muted">Clinique HIRO · document 4 sur 4 · ${DATE}</span></div>
<p class="kicker">Petit rappel</p><h1 style="font-size:28pt">Exercices et longévité</h1>
<p class="intro" style="margin-top:3mm">Chaque exercice du programme maison vise une capacité que le bilan mesure, et chacune de ces capacités est associée, dans de grandes études, à la longévité ou à l’autonomie. Ce sont des associations observées sur des populations : elles donnent du sens au programme, pas une promesse pour une personne.</p>
<div class="keyfigs">${KEY.map(k=>'<div><strong>'+e(k[0])+'</strong>'+e(k[1])+'<em>'+e(k[2])+'</em></div>').join('')}</div>
${exTable}
<div class="note ok"><b>Comment le programme est choisi.</b> PULSE retient 4 exercices selon les 3 priorités du bilan (2 pour la première), avec la marche quotidienne en plus. Le lever de chaise reste toujours le socle. Dose selon la zone : plus douce en « priorité », plus soutenue en « solide ». 3 séances de 20 minutes par semaine, l’équilibre tous les jours, toujours près d’un appui.</div>
<h4>Ce qu’on dit au patient, en une phrase par capacité</h4>
<ul>
 <li><b>Marche</b> : « Marcher un peu plus vite, c’est l’un des meilleurs signes de bonne santé qu’on connaisse. »</li>
 <li><b>Jambes</b> : « Se lever d’une chaise sans les mains, c’est garder son autonomie. »</li>
 <li><b>Équilibre</b> : « L’équilibre s’entraîne à tout âge, et c’est ce qui évite les chutes. »</li>
 <li><b>Force</b> : « Garder de la force, c’est pouvoir porter et se relever seul. »</li>
 <li><b>Posture</b> : « Se redresser soulage le dos et aide à marcher plus droit. »</li>
</ul>
<h4>Sources</h4>
<ol class="sources">
 <li>Studenski S. et al. Gait speed and survival in older adults. JAMA 2011;305:50-58.</li>
 <li>Leong D.P. et al. Prognostic value of grip strength (PURE). Lancet 2015;386:266-273.</li>
 <li>Araújo C.G. et al. Successful 10-second one-legged stance and mortality. Br J Sports Med 2022;56:975-980.</li>
 <li>Sherrington C. et al. Exercise for preventing falls in older people living in the community. Cochrane Database Syst Rev 2019;CD012424.</li>
 <li>Momma H. et al. Muscle-strengthening activities and mortality: meta-analysis. Br J Sports Med 2022;56:755-763.</li>
 <li>Paluch A.E. et al. Daily steps and all-cause mortality: 15 cohorts. Lancet Public Health 2022;7:e219-e228.</li>
 <li>Kado D.M. et al. Hyperkyphotic posture predicts mortality. J Am Geriatr Soc 2004;52:1662-1667.</li>
 <li>Toledo Study for Healthy Aging. Low relative sit-to-stand power and all-cause mortality in older adults. J Sport Health Sci 2025.</li>
 <li>OMS. Lignes directrices sur l’activité physique et la sédentarité, 2020.</li>
</ol>`);
await renderPdf(exercices,join(OUT,'KOMO_Motion_4_Exercices_et_longevite.pdf'),'KŌMØ Motion · 4 · Exercices et longévité · rappel pour le praticien');
