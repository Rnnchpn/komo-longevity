// Repères de longévité par test, pour le guide imprimé (22/11/2026).
// Même source que PULSE (motion-longevity-plan.mjs, motion-v2-trajectory.mjs, motion-protocol.mjs) :
// associations publiées, jamais un diagnostic ; « suivi personnel » quand aucun repère n'est validé
// pour l'appareil. Changement réel = marge d'erreur de la mesure (au-dessous : « stable »).
export const LONGEVITY={
 dynamo_hip_flex:{
  why:'Les fléchisseurs de hanche lèvent le pied à chaque pas et donnent la longueur du pas : leur faiblesse ralentit la marche et fait trébucher.',
  ref:'Pas de norme validée pour le DynaMo : suivi personnel en newtons, et symétrie gauche-droite.',
  target:'Côté faible ≥ 90 % du côté fort.',
  improve:'Montées de genou assis, puis avec élastique ; marche en légère montée.',
  control:'Changement réel : ≥ 20 % de force ; symétrie : ≥ 10 points.'},
 dynamo_knee_ext:{
  why:'Le quadriceps sert à se lever, monter un escalier, se rattraper. Une force basse est associée aux limitations de mobilité et à une mortalité plus élevée chez l’adulte âgé.',
  ref:'Pas de norme validée pour le DynaMo : suivi personnel, même distance pad–malléole à chaque séance.',
  target:'Côté faible ≥ 90 % du côté fort ; force en hausse au contrôle.',
  improve:'Extension de genou assis (bracelet lesté), lever de chaise lent.',
  control:'Changement réel : ≥ 20 % de force ; symétrie : ≥ 10 points.'},
 dynamo_knee_flex:{
  why:'Les ischio-jambiers stabilisent le genou et freinent le pas : ils protègent l’articulation et participent à la vitesse de marche.',
  ref:'Suivi personnel ; à lire avec l’extension (équilibre avant-arrière du genou).',
  target:'Côté faible ≥ 90 % du côté fort.',
  improve:'Talon ramené sous la chaise avec élastique, pont fessier.',
  control:'Changement réel : ≥ 20 % de force ; symétrie : ≥ 10 points.'},
 dynamo_hip_abd:{
  why:'Les abducteurs tiennent le bassin quand on est sur un pied (à chaque pas) : leur faiblesse favorise les déséquilibres et les chutes sur le côté.',
  ref:'Suivi personnel (mesure assise, non comparable à l’ancienne mesure allongée).',
  target:'Côté faible ≥ 90 % du côté fort.',
  improve:'Écart de jambe sur le côté debout, appui des mains ; élastique aux genoux.',
  control:'Changement réel : ≥ 20 % de force ; symétrie : ≥ 10 points.'},
 // v2.5.0 (24/11/2026) : flexion du coude à la place de la préhension.
 dynamo_elbow_flex:{
  why:'Les fléchisseurs du coude servent à porter, tirer, se relever en s’aidant des bras. Ce test remplace la préhension faute de poignée : il suit la force du haut du corps, sans seuil de longévité publié.',
  ref:'Pas de repère de longévité publié : suivi personnel et symétrie gauche-droite.',
  target:'Côté faible ≥ 90 % du côté fort ; force en hausse au contrôle.',
  improve:'Flexion des coudes avec deux bouteilles d’eau ou un élastique ; porter deux sacs chargés.',
  control:'Changement réel : ≥ 20 % de force ; symétrie : ≥ 10 points.'},
 dynamo_grip:{
  why:'La force de la main reflète la force globale : chaque 5 kg en moins est associé à 16 % de mortalité en plus (PURE, 139 691 personnes).',
  ref:'Force basse (EWGSOP2) : moins de 27 kg chez l’homme, moins de 16 kg chez la femme.',
  target:'Au-dessus du repère ; puis +5 kg, visés à 12 semaines.',
  improve:'Serrer une balle ou une serviette, porter deux sacs chargés.',
  control:'Changement réel : ≥ 5 kg (50 N) ; la préhension progresse lentement.'},
 anthropometry:{
  why:'La taille sert au calcul de la puissance des jambes ; la masse suit l’évolution du poids entre deux bilans.',
  ref:'Mesures de contexte, sans repère de performance.',
  target:'Conditions identiques à chaque séance (chaussage, aide de marche).',
  improve:'—',
  control:'Masse : suivie sans verdict.'},
 fd_quiet_stand:{
  why:'Les oscillations debout traduisent le contrôle de l’équilibre ; elles augmentent avec l’âge et avec le risque de chute.',
  ref:'Suivi personnel (vitesse du centre de pression) ; asymétrie de charge : repère 10 %.',
  target:'Vitesse stable ou en baisse ; asymétrie ≤ 10 %.',
  improve:'Exercices d’équilibre quotidiens, appui sur un pied, marche talon-pointe.',
  control:'Changement réel : ≥ 20 % sur la vitesse ; asymétrie : ≥ 10 points.'},
 fd_quiet_stand_ec:{
  why:'Fermer les yeux montre la part de la vue dans l’équilibre : plus l’écart avec les yeux ouverts est grand, plus l’équilibre dépend de la vision (pénombre, nuit).',
  ref:'Quotient yeux fermés / yeux ouverts : suivi personnel.',
  target:'Quotient stable ou en baisse.',
  improve:'Équilibre avec rotations lentes de la tête, puis sur coussin, toujours près d’un appui.',
  control:'Changement réel : ≥ 20 % sur la vitesse.'},
 fd_sts:{
  why:'Se lever d’une chaise est un geste de chaque jour : la plateforme montre la vitesse du lever et si une jambe compense l’autre.',
  ref:'Suivi personnel ; asymétrie de force : repère 10 %.',
  target:'Asymétrie ≤ 10 % ; temps pour se lever stable ou en baisse.',
  improve:'Lever de chaise lent en répartissant le poids sur les deux pieds.',
  control:'Changement réel : ≥ 20 % sur le temps ; asymétrie : ≥ 10 points.'},
 unipodal_left:{
  why:'Ne pas tenir 10 s sur un pied est associé à un risque de décès 1,8 fois plus élevé sur 7 ans (Araújo, BJSM 2022, 1 702 personnes).',
  ref:'Repère : 10 s sur chaque pied ; maximum mesuré : 30 s.',
  target:'10 s de chaque côté, puis 30 s.',
  improve:'Équilibre sur un pied tous les jours, mains au-dessus du plan de travail.',
  control:'Seul le franchissement des 10 s compte (l’écart en secondes devrait dépasser 24 s pour être sûr).'},
 unipodal_right:{same:'unipodal_left'},
 fd_cmj:{
  why:'La puissance (force × vitesse) baisse plus vite que la force avec l’âge ; une puissance basse est associée à la perte d’autonomie et aux chutes.',
  ref:'Suivi personnel : pas de seuil validé pour ce test chez l’adulte âgé.',
  target:'Puissance en hausse au contrôle.',
  improve:'Lever de chaise rapide à la montée, montées sur la pointe des pieds.',
  control:'Changement réel : ≥ 10 % (test très reproductible).'},
 gait_4m:{
  why:'Chaque 0,1 m/s de vitesse de marche en plus est associé à 12 % de risque de décès en moins (34 485 personnes suivies).',
  ref:'Performance basse sous 0,8 m/s (EWGSOP2) ; repère 1,0 m/s (AWGS 2019).',
  target:'≥ 1,0 m/s ; sinon +0,1 m/s au contrôle.',
  improve:'Marche rapide fractionnée 3 fois par semaine, grands pas avec appui.',
  control:'Changement réel : ≥ 0,1 m/s (départ arrêté, meilleur de deux passages, même chronométreur).'},
 posture_photo:{
  why:'Une posture voûtée, tête en avant, est associée à plus de difficultés pour marcher, se pencher et se lever, et à une mortalité plus élevée (Kado 2004 : 1 353 personnes, risque 1,44 fois plus élevé).',
  ref:'Pas de norme validée pour les angles mesurés sur une photo : suivi personnel, même cadrage à chaque séance.',
  target:'En cas de décalage apparent : avancée de la tête réduite d’au moins 5°.',
  improve:'Redressement contre le mur chaque jour, menton rentré ; renforcement du haut du dos.',
  control:'Changement réel : ≥ 5° (en dessous, l’écart peut venir du cadrage de la photo).'},
 sts:{
  why:'Le lever de chaise donne la puissance des jambes : une puissance basse est associée à un risque de décès plus que doublé sur 9 ans (cohorte de Tolède).',
  ref:'Puissance basse sous 2,6 W/kg (homme) et 2,1 W/kg (femme) ; levers selon l’âge (Rikli & Jones, tableau ci-dessous).',
  target:'+2 levers à 6 semaines, puis le seuil de puissance.',
  improve:'Lever de chaise lent 3 fois par semaine, puis avec un sac à dos chargé.',
  control:'Changement réel : ≥ 2 levers ; puissance : ≥ 0,42 W/kg (homme), 0,33 W/kg (femme).'}
};
// Lever de chaise 30 s : sous la moyenne / standard d'autonomie (Rikli & Jones), tranches 60–64 … 90–94 ans.
export const CHAIR_NORMS={bands:['60–64','65–69','70–74','75–79','80–84','85–89','90–94'],
 female:{below:[12,11,10,10,9,8,4],standard:[15,15,14,13,12,11,9]},
 male:{below:[14,12,12,11,10,8,7],standard:[17,16,15,14,13,11,9]}};
export const forStep=id=>{const x=LONGEVITY[id];return x?.same?LONGEVITY[x.same]:x};
