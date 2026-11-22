// KŌMØ Motion — protocole de consultation standardisé.
// SOURCE UNIQUE de vérité pour : la console opérateur, le serveur (motion-live-test),
// le rapport, le PDF, la trajectoire et le protocole écrit.
// Le serveur reçoit une copie générée : `node scripts/motion-protocol-sync.mjs`
// (le build échoue si la copie serveur diverge de ce fichier).
// Aucune interprétation diagnostique, aucun score composite, aucun « âge du mouvement ».

export const PROTOCOL={
 id:'KOMO_MOTION',
 version:'2.4.0',
 code:'KOMO_MOTION_V2',
 mode:'CORE',
 label:'KŌMØ Motion · consultation supervisée',
 effective_date:'2026-11-24',
 device_set:[
  {id:'forcedecks_mini',label:'VALD ForceDecks Mini',count:2},
  {id:'dynamo_plus',label:'VALD DynaMo Plus',count:1},
  {id:'iphone_camera',label:'iPhone · caméra du cabinet',count:1},
  {id:'stopwatch',label:'Chronomètre',count:1},
  {id:'tape',label:'Ruban métrique',count:1}
 ]
};
// Identifiant historique conservé dans les résultats et le PDF.
export const MOTION_PROTOCOL_VERSION=PROTOCOL.code;

export const SIDE_OPTIONS=[['left','Gauche'],['right','Droite'],['balanced','Équilibré']];
// Motif obligatoire d'un test non réalisé (audit §5.2 : distinguer les causes).
export const SKIP_REASONS=[
 ['safety','Sécurité · contre-indication'],
 ['pain','Douleur'],
 ['refusal','Refus du patient'],
 ['device_unavailable','Appareil indisponible'],
 ['technical_error','Erreur technique'],
 ['other','Autre motif']
];
export const POSTURE_OPTIONS=[
 ['neutral','Alignement apparent neutre'],
 ['apparent_offset','Décalage sagittal apparent'],
 ['not_interpretable','Image non interprétable']
];
const FOOTWEAR=[['barefoot','Pieds nus'],['socks','Chaussettes'],['shoes','Chaussures']];
const WALKING_AID=[['none','Aucune'],['cane','Canne'],['walker','Déambulateur'],['other','Autre']];

// Stations de la consultation (v2.4, ordre du 22/11/2026) : d'abord toute la force assise, patient reposé,
// puis les plateformes (poids, taille, debout, Sit to Stand, un pied), la marche, et l'effort en dernier.
// camera : placement de l'iPhone pendant la station (null = iPhone non utilisé).
export const STATIONS={
 A:{label:'Force · DynaMo, tout assis',camera:null,
  place:'Patient assis au bord de la table d’examen, pieds sans contact avec le sol, du début à la fin de la station : flexion de hanche, extension de genou, abduction de hanche, puis préhension. Ouvre l’app DynaMo, profil au code PULSE ; l’iPhone n’est pas utilisé.'},
 B:{label:'Plateformes ForceDecks · équilibre',camera:null,
  place:'Chaise contre le mur, plateformes juste devant, un appui (mur ou dossier) à portée de main. Pesée sur les plateformes, taille au mur, équilibre debout (yeux ouverts puis fermés), Sit to Stand assis, puis appui sur un pied. App ForceDecks ouverte, profil au code PULSE.'},
 C:{label:'Posture et marche',camera:'profile',
  place:'iPhone sur trépied, perpendiculaire au couloir, à 3 m environ, à hauteur du bassin, cadré sur le milieu des 4 m.'},
 D:{label:'Bras',camera:'front',
  place:'iPhone de face, à 3 m environ, à hauteur du bassin : corps entier visible, bras et mains compris.'},
 E:{label:'Lever de chaise',camera:'three_quarter',
  place:'Chaise de 43 cm sans accoudoirs contre le mur, plateformes retirées ; iPhone de trois-quarts à 2–3 m, tête et pieds visibles.'}
};
export const CAMERA_LABELS={profile:'iPhone de profil',front:'iPhone de face',three_quarter:'iPhone de trois-quarts'};
export const BLOCKS=Object.fromEntries(Object.entries(STATIONS).map(([k,v])=>[k,v.label]));

// Les 15 étapes, dans l'ordre officiel v2.4 : regroupées par station, la force maximale assise d'abord
// (patient reposé), le statique avant l'effort, et le lever de chaise 30 s, le plus fatigant, en dernier.
// kind : fields (saisie d'appareil) · two_step · count (chrono + compteur vidéo) · balance · observation.
// fields[].decimals = précision acceptée par le serveur ; fields[].vald = libellé affiché par l'app VALD.
// choices = listes fermées ; vald (étape) = test à lancer et réglages dans l'app VALD.
export const STEPS=[
 {id:'dynamo_hip_flex',block:'A',kind:'fields',title:'Flexion de hanche · DynaMo',short:'Flexion hanche',
  device:'DynaMo Plus · pad',trials:'1 essai à 50 % + 3 maximaux par côté',duration:0,dynamo:true,
  setup:'Assis au bord de la table, hanches et genoux à 90°, pieds sans contact avec le sol, mains posées à plat sur la table sans tirer. Pad sur le dessus de la cuisse, juste au-dessus du genou, même point à chaque séance ; le praticien bloque le DynaMo vers le bas.',
  script:'« 3, 2, 1 — montez le genou vers le plafond, poussez, poussez… et relâchez. »',
  instruction:'Un essai à 50 % pour apprendre le geste, puis 3 essais de 3 à 5 s par côté, 30 s de repos. Saisir le meilleur. Le bassin reste posé : refaire l’essai si le patient se penche en arrière ; arrêt immédiat si douleur.',
  vald:{app:'DynaMo',test:'Hip Flexion (flexion de hanche)',settings:'Assis 90° · 3 essais par côté'},
  pair:['hip_flex_left_n','hip_flex_right_n'],
  fields:[
   {key:'hip_flex_left_n',label:'Gauche · meilleur essai',unit:'N',min:0,max:2000,decimals:1,vald:'Force max · gauche'},
   {key:'hip_flex_right_n',label:'Droite · meilleur essai',unit:'N',min:0,max:2000,decimals:1,vald:'Force max · droite'}
  ]},
 {id:'dynamo_knee_ext',block:'A',kind:'fields',title:'Extension de genou · DynaMo',short:'Genou',
  device:'DynaMo Plus · pad',trials:'1 essai à 50 % + 3 maximaux par côté',duration:0,dynamo:true,
  setup:'Assis au bord de la table, hanches et genoux à 90°, pieds sans contact avec le sol, bras croisés. Pad sur la face antérieure du tibia.',
  script:'« 3, 2, 1 — poussez, poussez, poussez… et relâchez. »',
  instruction:'Un essai à 50 % pour apprendre le geste, puis 3 essais de 3 à 5 s par côté, 30 s de repos. Saisir le meilleur. Arrêt immédiat si douleur. Même distance pad–malléole à chaque séance.',
  vald:{app:'DynaMo',test:'Knee Extension (extension de genou)',settings:'Assis 90° · 3 essais par côté'},
  pair:['knee_ext_left_n','knee_ext_right_n'],
  fields:[
   {key:'knee_ext_left_n',label:'Gauche · meilleur essai',unit:'N',min:0,max:2500,decimals:1,vald:'Force max · gauche'},
   {key:'knee_ext_right_n',label:'Droite · meilleur essai',unit:'N',min:0,max:2500,decimals:1,vald:'Force max · droite'},
   {key:'knee_pad_distance_cm',label:'Distance pad – malléole',unit:'cm',min:0,max:60,decimals:1,optional:true}
  ]},
 // Abduction de hanche assise (v2.4) : même position que la flexion, pas de changement d'installation.
 // Méthode distincte de l'ancienne mesure allongée (avant v2.4) : valeurs non comparables entre elles.
 {id:'dynamo_hip_abd',block:'A',kind:'fields',title:'Abduction de hanche assise · DynaMo',short:'Abduction',
  device:'DynaMo Plus · pad',trials:'1 essai à 50 % + 3 maximaux par côté',duration:0,dynamo:true,
  method:'HIP_ABD_SEATED_90',
  setup:'Assis au bord de la table, hanches et genoux à 90°, pieds sans contact avec le sol, mains posées à plat sur la table sans tirer. Pad sur la face externe de la cuisse, juste au-dessus du genou, même point à chaque séance ; le praticien bloque le DynaMo vers l’intérieur.',
  script:'« 3, 2, 1 — écartez le genou vers l’extérieur, poussez, poussez… et relâchez. »',
  instruction:'Un essai à 50 % pour apprendre le geste, puis 3 essais de 3 à 5 s par côté, 30 s de repos. Saisir le meilleur. Les deux fesses restent posées, le buste droit : refaire l’essai si le patient se penche sur le côté ; arrêt immédiat si douleur.',
  vald:{app:'DynaMo',test:'Hip Abduction (abduction de hanche)',settings:'Assis 90° · 3 essais par côté'},
  pair:['hip_abd_left_n','hip_abd_right_n'],
  fields:[
   {key:'hip_abd_left_n',label:'Gauche · meilleur essai',unit:'N',min:0,max:2000,decimals:1,vald:'Force max · gauche'},
   {key:'hip_abd_right_n',label:'Droite · meilleur essai',unit:'N',min:0,max:2000,decimals:1,vald:'Force max · droite'}
  ]},
 {id:'dynamo_grip',block:'A',kind:'fields',title:'Préhension · DynaMo',short:'Préhension',
  device:'DynaMo Plus · poignée',trials:'1 essai à 50 % + 3 maximaux par côté',duration:0,dynamo:true,
  setup:'Toujours assis au bord de la table, coude à 90°, épaule contre le corps, poignet neutre, avant-bras libre. DynaMo Plus avec la poignée de préhension.',
  script:'« 3, 2, 1 — serrez, serrez, serrez… et relâchez. »',
  instruction:'Un essai à 50 %, puis 3 essais maximaux par côté en alternant, 30 s de repos. Saisir le meilleur essai valide de chaque côté.',
  vald:{app:'DynaMo',test:'Grip (préhension)',settings:'Position neutre · 3 essais par côté'},
  pair:['grip_left_n','grip_right_n'],
  fields:[
   {key:'grip_left_n',label:'Gauche · meilleur essai',unit:'N',min:0,max:1500,decimals:1,vald:'Force max · gauche'},
   {key:'grip_right_n',label:'Droite · meilleur essai',unit:'N',min:0,max:1500,decimals:1,vald:'Force max · droite'}
  ]},
 {id:'anthropometry',block:'B',kind:'fields',title:'Masse et taille',short:'Poids et taille',
  device:'Toise murale · pesée ForceDecks',trials:'1 mesure',duration:0,
  setup:'Masse d’abord : dans l’app ForceDecks, choisir le test Quiet Stand, mettre à zéro sans personne sur les plateformes, puis le patient monte un pied sur chaque et reste immobile : l’app le pèse. Taille ensuite : pieds nus ou en chaussettes, talons, fesses et épaules contre le mur, regard horizontal.',
  script:'« Montez sur les deux plateformes, un pied sur chaque, et restez immobile. Maintenant, dos au mur, je mesure votre taille. »',
  instruction:'Saisir la masse lue dans l’app ForceDecks, puis la taille, le chaussage et l’aide de marche : ces conditions sont reprises à chaque contrôle. La taille sert aussi au calcul de la puissance des jambes.',
  vald:{app:'ForceDecks',test:'Pesée au début du Quiet Stand',settings:'Zéro sans personne sur les plateformes, puis pesée'},
  fields:[
   {key:'body_mass_kg',label:'Masse',unit:'kg',min:25,max:250,decimals:1,vald:'Poids · pesée ForceDecks'},
   {key:'height_cm',label:'Taille',unit:'cm',min:100,max:230,decimals:1}
  ],
  choices:[
   {key:'footwear',label:'Chaussage pendant le bilan',options:FOOTWEAR},
   {key:'walking_aid',label:'Aide de marche',options:WALKING_AID,default:'none'}
  ]},
 {id:'fd_quiet_stand',block:'B',kind:'fields',title:'Quiet Stand 30 s · ForceDecks',short:'Quiet Stand',
  device:'2 ForceDecks Mini',trials:'1 essai de 30 s',duration:0,
  setup:'Le patient remonte sur les plateformes après la taille : un pied sur chaque, à largeur d’épaules, mains sur les hanches, buste droit, regard devant. La chaise est derrière lui.',
  script:'« Mains sur les hanches, regardez devant vous. Gardez les pieds fixes et restez aussi immobile que possible pendant 30 secondes. »',
  instruction:'Lancer l’enregistrement (compte à rebours de 3 s), attendre les 30 s, puis recopier les 4 valeurs de l’écran de résultats, de haut en bas. Le L ou R après l’asymétrie indique le côté le plus chargé. La vitesse du centre de pression est la valeur la plus reproductible : c’est elle qu’on suit.',
  vald:{app:'ForceDecks',test:'Balance › Quiet Stand',settings:'Exercise Length 30 s · aucune option cochée (yeux ouverts, sol stable)',
   tip:'Ce sont les 4 métriques affichées par défaut depuis la version de juillet 2026 de l’app. Si l’écran en montre d’autres, rétablis les métriques par défaut dans les réglages des résultats.'},
  fields:[
   {key:'fd_qs_cop_ml_mm',label:'Oscillation latérale',unit:'mm',min:0,max:1000,decimals:1,vald:'CoP Range, Medial-Lateral – Bilateral'},
   {key:'fd_qs_cop_ap_mm',label:'Oscillation avant-arrière',unit:'mm',min:0,max:1000,decimals:1,vald:'CoP Range, Anterior-Posterior – Bilateral'},
   {key:'fd_qs_velocity_mms',label:'Vitesse moyenne du centre de pression',unit:'mm/s',min:0,max:1000,decimals:1,vald:'Mean Velocity'},
   {key:'fd_qs_asym_pct',label:'Asymétrie de charge',unit:'%',min:0,max:100,decimals:1,vald:'Mean Force – Asymmetry'}
  ],
  choices:[{key:'fd_qs_asym_side',label:'Côté le plus chargé (L ou R affiché)',options:SIDE_OPTIONS}]},
 {id:'fd_quiet_stand_ec',block:'B',kind:'fields',title:'Quiet Stand yeux fermés · ForceDecks',short:'Yeux fermés',
  device:'2 ForceDecks Mini',trials:'1 essai de 30 s',duration:0,
  setup:'Même position que le Quiet Stand : un pied sur chaque plateforme, mains sur les hanches. Praticien tout près, mains prêtes, sans toucher.',
  script:'« Même position. Fermez les yeux et restez aussi immobile que possible pendant 30 secondes. Je suis juste à côté de vous. »',
  instruction:'Cocher « Eyes Closed » dans les réglages, lancer l’enregistrement, puis recopier les 3 valeurs. Si le patient ouvre les yeux, déplace un pied ou se rattrape : arrêter et marquer le test non réalisé, motif « Sécurité ». Comparé aux yeux ouverts, il montre à quel point l’équilibre dépend de la vue.',
  vald:{app:'ForceDecks',test:'Balance › Quiet Stand',settings:'Exercise Length 30 s · option Eyes Closed cochée'},
  fields:[
   {key:'fd_qsec_cop_ml_mm',label:'Oscillation latérale',unit:'mm',min:0,max:1000,decimals:1,vald:'CoP Range, Medial-Lateral – Bilateral'},
   {key:'fd_qsec_cop_ap_mm',label:'Oscillation avant-arrière',unit:'mm',min:0,max:1000,decimals:1,vald:'CoP Range, Anterior-Posterior – Bilateral'},
   {key:'fd_qsec_velocity_mms',label:'Vitesse moyenne du centre de pression',unit:'mm/s',min:0,max:1000,decimals:1,vald:'Mean Velocity'}
  ]},
 {id:'fd_sts',block:'B',kind:'fields',title:'Sit to Stand to Sit · ForceDecks',short:'STS plateformes',
  device:'2 ForceDecks Mini · chaise',trials:'3 répétitions',duration:0,
  setup:'Après les tests debout, le patient descend des plateformes pour la mise à zéro. Chaise d’environ 43 cm, sans accoudoirs, contre le mur ; plateformes juste devant sans la toucher. Pesée debout sur les plateformes, puis assis, un pied sur chaque, bras croisés sur la poitrine.',
  script:'« Bras croisés. Restez immobile. Penchez-vous en avant, levez-vous, restez debout une seconde, rasseyez-vous, puis restez immobile. On le fait trois fois. »',
  instruction:'2 à 3 s immobile avant et entre chaque répétition, 1 s debout immobile. Après la 3e, arrêter l’enregistrement et recopier les 2 premières valeurs de l’écran (moyenne des répétitions si l’app l’affiche).',
  vald:{app:'ForceDecks',test:'Functional › Sit to Stand to Sit',settings:'Hauteur de chaise 0,43 m · 3 répétitions'},
  fields:[
   {key:'fd_sts_time_to_stand_s',label:'Temps pour se lever',unit:'s',min:0,max:20,decimals:2,vald:'Time to Stand'},
   {key:'fd_sts_asym_pct',label:'Asymétrie de force au lever',unit:'%',min:0,max:100,decimals:1,vald:'Mean Standing Force – Asymmetry'}
  ],
  choices:[{key:'fd_sts_asym_side',label:'Côté le plus chargé (L ou R affiché)',options:SIDE_OPTIONS}]},
 {id:'unipodal_left',block:'B',kind:'fields',title:'Appui pied gauche · ForceDecks',short:'Appui G',
  device:'1 ForceDecks Mini',trials:'1 à 2 essais, 30 s max, le meilleur retenu',duration:0,holdTimer:true,
  value_field:'sls_left_hold_s',method:'SLS_FORCEDECKS_EO_30S_BEST_OF_2',
  setup:'Après le Sit to Stand, le patient se lève et se place debout sur la plateforme gauche, pied gauche seul au centre, mains sur les hanches, regard devant. Appui stable à portée de main, praticien à côté.',
  script:'« Levez le pied droit sans toucher l’autre jambe et tenez le plus longtemps possible, jusqu’à 30 secondes. Je reste à côté de vous. »',
  instruction:'Lancer l’enregistrement ForceDecks (30 s). Dans PULSE, « Départ » quand le pied se lève, « Pied posé » s’il touche le sol ou l’autre jambe, ou si une main se pose ; à 30 s le chrono s’arrête seul. Moins de 30 s : un 2e essai, PULSE garde le meilleur. Ne recopier les valeurs de la plateforme que pour un essai tenu 30 s.',
  vald:{app:'ForceDecks',test:'Balance › Single Leg Stand',settings:'Exercise Length 30 s · jambe gauche · aucune option cochée',
   tip:'Les oscillations d’un essai interrompu ne sont pas comparables : laisse-les vides si le pied s’est posé.'},
  fields:[
   {key:'sls_left_hold_s',label:'Durée tenue (meilleur essai)',unit:'s',min:0,max:30,decimals:1},
   {key:'sls_left_velocity_mms',label:'Vitesse moyenne du centre de pression',unit:'mm/s',min:0,max:1000,decimals:1,optional:true,vald:'Mean Velocity'},
   {key:'sls_left_cop_ml_mm',label:'Oscillation latérale',unit:'mm',min:0,max:1000,decimals:1,optional:true,vald:'CoP Range - Medial-Lateral'},
   {key:'sls_left_cop_ap_mm',label:'Oscillation avant-arrière',unit:'mm',min:0,max:1000,decimals:1,optional:true,vald:'CoP Range - Anterior-Posterior'}
  ]},
 {id:'unipodal_right',block:'B',kind:'fields',title:'Appui pied droit · ForceDecks',short:'Appui D',
  device:'1 ForceDecks Mini',trials:'1 à 2 essais, 30 s max, le meilleur retenu',duration:0,holdTimer:true,
  value_field:'sls_right_hold_s',method:'SLS_FORCEDECKS_EO_30S_BEST_OF_2',
  setup:'Debout sur la plateforme droite, pied droit seul au centre, mains sur les hanches, regard devant. Appui stable à portée de main, praticien à côté.',
  script:'« Levez le pied gauche sans toucher l’autre jambe et tenez le plus longtemps possible, jusqu’à 30 secondes. Je reste à côté de vous. »',
  instruction:'Lancer l’enregistrement ForceDecks (30 s). Dans PULSE, « Départ » quand le pied se lève, « Pied posé » s’il touche le sol ou l’autre jambe, ou si une main se pose ; à 30 s le chrono s’arrête seul. Moins de 30 s : un 2e essai, PULSE garde le meilleur. Ne recopier les valeurs de la plateforme que pour un essai tenu 30 s.',
  vald:{app:'ForceDecks',test:'Balance › Single Leg Stand',settings:'Exercise Length 30 s · jambe droit · aucune option cochée',
   tip:'Les oscillations d’un essai interrompu ne sont pas comparables : laisse-les vides si le pied s’est posé.'},
  fields:[
   {key:'sls_right_hold_s',label:'Durée tenue (meilleur essai)',unit:'s',min:0,max:30,decimals:1},
   {key:'sls_right_velocity_mms',label:'Vitesse moyenne du centre de pression',unit:'mm/s',min:0,max:1000,decimals:1,optional:true,vald:'Mean Velocity'},
   {key:'sls_right_cop_ml_mm',label:'Oscillation latérale',unit:'mm',min:0,max:1000,decimals:1,optional:true,vald:'CoP Range - Medial-Lateral'},
   {key:'sls_right_cop_ap_mm',label:'Oscillation avant-arrière',unit:'mm',min:0,max:1000,decimals:1,optional:true,vald:'CoP Range - Anterior-Posterior'}
  ]},
 {id:'posture',block:'C',kind:'observation',title:'Posture de profil · observation',short:'Posture',
  device:'iPhone de profil',trials:'1 observation',duration:0,unit:'observation',ui_unit:'observation',
  options:POSTURE_OPTIONS,
  setup:'Le patient se place au milieu du couloir, strictement de profil, pieds visibles ; iPhone immobile à hauteur du bassin.',
  script:'« Tenez-vous debout comme d’habitude, bras le long du corps, regard devant. »',
  instruction:'Observer l’alignement sagittal apparent. Une caméra 2D ne mesure pas la SVA radiographique.',
  label:'Observation visuelle'},
 // Marche 4 m (v2.3) : protocole SPPB, celui des repères EWGSOP2 et des cohortes de survie.
 // Départ arrêté, chrono au premier mouvement, arrivée quand un pied a entièrement franchi les 4 m,
 // deux passages, le plus rapide est retenu. Un départ lancé donne 0,1 à 0,2 m/s de plus : non comparable.
 {id:'gait_4m',block:'C',kind:'fields',title:'Marche 4 m · départ arrêté',short:'Marche 4 m',
  device:'Chronomètre PULSE · couloir balisé',trials:'2 passages, le plus rapide retenu',duration:0,walkway:true,
  method:'GAIT_4M_STANDING_START_BEST_OF_2',
  setup:'Couloir droit et dégagé : ligne de départ à 0 m, ligne d’arrivée à 4 m, un repère 2 m plus loin (6 m) pour que le patient ne ralentisse pas avant l’arrivée. Chaussage et aide de marche identiques au début du bilan.',
  script:'« Pointes des pieds juste derrière la ligne. Au signal, marchez à votre allure habituelle, comme dans la rue, jusqu’au repère au bout. Prêt ? Partez. »',
  instruction:'Démarre le chrono au premier mouvement du pied, pas au signal. Arrête-le dès qu’un pied a entièrement franchi la ligne des 4 m. Tiens-toi derrière le patient, un peu sur le côté. Deux passages : PULSE retient le plus rapide.',
  fields:[
   {key:'gait_4m_s_1',label:'Passage 1',unit:'s',min:1,max:30,decimals:2},
   {key:'gait_4m_s_2',label:'Passage 2',unit:'s',min:1,max:30,decimals:2}
  ]},
 {id:'two_step',block:'C',kind:'two_step',title:'Two-Step · deux grands pas',short:'Two-Step',
  device:'Ruban métrique',trials:'2 essais',duration:0,unit:'cm',ui_unit:'cm',max:650,integer:false,
  setup:'Même couloir : ruban métrique au sol depuis une ligne de départ, sol antidérapant, praticien à proximité.',
  script:'« Depuis la ligne, faites deux pas aussi grands que possible, sans courir ni sauter, puis joignez les pieds. »',
  instruction:'Mesurer la distance entre la ligne et la pointe des pieds. Deux essais, le meilleur est retenu. Recommencer tout essai avec perte d’équilibre.',
  label:'Meilleure distance des deux pas'},
 {id:'arms',block:'D',kind:'count',title:'Élévation des bras 30 s',short:'Bras',
  device:'iPhone de face',trials:'1 essai de 30 s',duration:30,unit:'movements',ui_unit:'mouvements',max:100,integer:true,
  setup:'Debout face à la caméra, bras et poignets visibles, espace libre autour du corps.',
  script:'« Levez et abaissez les bras en cycles complets, le plus de fois possible en 30 secondes, sans aller jusqu’à la douleur. »',
  instruction:'Démarrer le chronomètre. Comparer le compteur aux cycles complets observés et corriger si besoin.',
  label:'Nombre de mouvements'},
 {id:'sts',block:'E',kind:'count',title:'Lever de chaise 30 s',short:'Chaise 30 s',
  device:'iPhone de trois-quarts · chaise',trials:'1 essai de 30 s',duration:30,unit:'repetitions',ui_unit:'répétitions',
  max:100,integer:true,
  setup:'Chaise d’environ 43 cm sans accoudoirs, contre le mur, plateformes retirées. Assis au milieu de l’assise, pieds à plat, bras croisés. iPhone de trois-quarts, tête et pieds visibles.',
  script:'« Levez-vous complètement et rasseyez-vous, le plus de fois possible en 30 secondes, bras croisés. »',
  instruction:'Avant le chrono, 1 à 2 levers d’essai pour montrer le geste (ils ne comptent pas). Démarrer le chronomètre. Comparer le compteur vidéo aux levers complets observés et corriger si besoin.',
  label:'Nombre de levers complets'}
];
export const STEP_IDS=STEPS.map(s=>s.id);
export const V2_ORDER=STEP_IDS;
export const stepById=id=>STEPS.find(s=>s.id===id)||null;
// Étapes à saisie d'appareil (VALD, mètre, chrono) : forme historique INSTRUMENTED_STEPS.
export const INSTRUMENTED_STEPS=Object.fromEntries(STEPS.filter(s=>s.kind==='fields').map(s=>[s.id,s]));

const finite=x=>typeof x==='number'&&Number.isFinite(x);
const round=(x,d=1)=>Math.round(x*10**d)/10**d;
const stepOf=decimals=>decimals>0?'0.'+'0'.repeat(decimals-1)+'1':'1';
export const fieldStep=f=>stepOf(f.decimals);
export const optionLabel=(options,key)=>(options||[]).find(([k])=>k===key)?.[1]||'';
export const skipReasonLabel=key=>optionLabel(SKIP_REASONS,key)||'Motif non précisé';
// Libellé d'un test non réalisé : motif affiché s'il existe (les anciens dossiers n'en ont pas).
export const skippedText=reason=>'Non réalisé'+(reason?' · '+skipReasonLabel(reason):'');

// Symétrie = côté faible / côté fort ; le côté faible est nommé, jamais un pourcentage seul.
export function symmetry(left,right){
 if(!finite(left)||!finite(right)||left<=0||right<=0)return null;
 const weaker=left<right?'left':right<left?'right':'balanced';
 return {lsi_pct:round(100*Math.min(left,right)/Math.max(left,right)),weaker_side:weaker};
}
export function deriveInstrumented(stepId,fields={}){
 const d={};
 if(stepId==='gait_4m'&&finite(fields.gait_4m_s_1)&&finite(fields.gait_4m_s_2)){
  // Standard SPPB : le passage le plus rapide fait foi ; la moyenne reste affichée pour information.
  const best=Math.min(fields.gait_4m_s_1,fields.gait_4m_s_2),mean=(fields.gait_4m_s_1+fields.gait_4m_s_2)/2;
  d.gait_best_s=round(best,2);d.gait_mean_s=round(mean,2);d.gait_speed_ms=round(4/best,2);
 }
 const pair=INSTRUMENTED_STEPS[stepId]?.pair;
 if(pair){const sym=symmetry(fields[pair[0]],fields[pair[1]]);if(sym)Object.assign(d,sym);}
 return d;
}
// Même règle que le serveur : valeurs absentes = absentes (jamais 0), précision et bornes strictes.
export function validateInstrumented(stepId,raw={}){
 const spec=INSTRUMENTED_STEPS[stepId];if(!spec)return {ok:false,error:'unknown_step'};
 const fields={};
 for(const f of spec.fields){
  const v=raw[f.key];
  if(v===undefined||v===null||v===''){if(f.optional)continue;return {ok:false,error:'missing_'+f.key};}
  if(typeof v!=='number'||!finite(v)||v<f.min||v>f.max)return {ok:false,error:'invalid_'+f.key};
  if(Math.abs(round(v,f.decimals)-v)>1e-9)return {ok:false,error:'precision_'+f.key};
  fields[f.key]=v;
 }
 for(const c of spec.choices||[]){
  const v=raw[c.key];
  if(!c.options.some(([k])=>k===v))return {ok:false,error:'missing_'+c.key};
  fields[c.key]=v;
 }
 return {ok:true,fields};
}
// Puissance relative des jambes au lever de chaise 30 s (22/11/2026) — équation d'Alcazar (Sci Rep 2020),
// validée contre la presse de jambes : 0,9 × g × (0,5 × taille − hauteur de chaise) × levers / 15, en W/kg.
// C'est une ESTIMATION calculée (aucun test en plus), pas une mesure directe. La masse s'annule en relatif.
// Seuils de puissance basse 2,6 W/kg (homme) et 2,1 W/kg (femme), associés aux limitations de mobilité,
// et changement cliniquement important 0,42 / 0,33 W/kg (Alcazar, J Cachexia Sarcopenia Muscle 2021).
export const STS_CHAIR_HEIGHT_M=0.43;
export const STS_POWER_LOW={male:2.6,female:2.1};
export const STS_POWER_MCID={male:0.42,female:0.33};
export function stsRelativePower(heightCm,reps,chairM=STS_CHAIR_HEIGHT_M){
 if(!finite(heightCm)||!finite(reps)||reps<=0||heightCm<100||heightCm>230)return null;
 const lever=0.5*heightCm/100-chairM;
 if(lever<=0)return null;
 return round(0.9*9.81*lever*reps/15,2);
}
// Nombre de levers en 30 s qui correspond à une puissance donnée (pour formuler un objectif en levers).
export function stsRepsForPower(heightCm,power,chairM=STS_CHAIR_HEIGHT_M){
 if(!finite(heightCm)||!finite(power))return null;
 const lever=0.5*heightCm/100-chairM;
 return lever>0?Math.ceil(power*15/(0.9*9.81*lever)-1e-9):null;
}
// Puissance d'une consultation : taille de la même séance, levers du lever de chaise 30 s.
export function stsPowerOf(results={}){
 const a=results.anthropometry?.status==='done'?results.anthropometry.fields||{}:null;
 const c=results.sts?.status==='done'?results.sts.value:null;
 return a&&finite(a.height_cm)&&finite(c)?stsRelativePower(a.height_cm,c):null;
}
// DynaMo : l'écran peut afficher N, kg ou lb ; PULSE enregistre toujours en newtons.
export const KGF_TO_N=9.80665;
export const toNewton=(value,unit)=>unit==='kg'?round(value*KGF_TO_N,1):value;
export const fromNewton=(value,unit)=>unit==='kg'?round(value/KGF_TO_N,2):value;
// Contrôles de vraisemblance NON bloquants : faute de frappe, mauvaise unité, essai non représentatif.
// Ce ne sont pas des normes cliniques ; aucun message n'interprète le résultat du patient.
const DYNAMO_LOW_N={dynamo_grip:50,dynamo_knee_ext:40,dynamo_hip_flex:30,dynamo_hip_abd:30};
export function plausibilityWarnings(stepId,f={}){
 const w=[];
 if(stepId==='anthropometry'&&finite(f.height_cm)&&finite(f.body_mass_kg)){
  const ratio=f.body_mass_kg/((f.height_cm/100)**2);
  if(ratio<14||ratio>55)w.push('Taille et masse à vérifier : le rapport entre les deux est inhabituel.');
 }
 if(stepId==='gait_4m'&&finite(f.gait_4m_s_1)&&finite(f.gait_4m_s_2)&&f.gait_4m_s_1>0&&f.gait_4m_s_2>0){
  const a=f.gait_4m_s_1,b=f.gait_4m_s_2,gap=Math.abs(a-b)/Math.min(a,b);
  if(gap>0.15)w.push('Écart de '+Math.round(gap*100)+' % entre les deux passages. PULSE retient le plus rapide : s’il te paraît trop rapide (chrono lancé en retard, patient qui accélère), refais-le.');
  const speed=4/Math.min(a,b);
  if(speed<0.2||speed>2.5)w.push('Vitesse inhabituelle : vérifie les deux temps.');
 }
 const spec=INSTRUMENTED_STEPS[stepId];
 if(spec?.value_field&&finite(f[spec.value_field])&&f[spec.value_field]<29.95&&
  spec.fields.some(x=>x.optional&&finite(f[x.key])))
  w.push('Essai tenu moins de 30 s : les oscillations de la plateforme ne sont pas comparables, laisse-les vides.');
 if(spec?.dynamo&&spec.pair){
  const low=DYNAMO_LOW_N[stepId]||0;
  if(spec.pair.some(k=>finite(f[k])&&f[k]>0&&f[k]<low))
   w.push('Valeur très basse pour des newtons : l’écran DynaMo est-il réglé en kg ? Utilise la bascule N / kg.');
  const sym=symmetry(f[spec.pair[0]],f[spec.pair[1]]);
  if(sym&&sym.lsi_pct<60)w.push('Plus de 40 % d’écart entre gauche et droite : vérifie la saisie (côtés, unité).');
 }
 return w;
}
// Prochain test à faire : le premier sans résultat après le test courant, puis depuis le début.
export function nextPendingStep(results={},fromId){
 const from=STEP_IDS.indexOf(fromId);
 const order=[...STEP_IDS.slice(from+1),...STEP_IDS.slice(0,Math.max(0,from))];
 return order.find(id=>!results[id])||null;
}
// Lignes descriptives pour le rapport et le PDF : valeur, unité, conditions ; aucune norme inventée.
export function instrumentedRows(results={}){
 const rows=[];
 for(const spec of STEPS){
  if(spec.kind!=='fields')continue;
  const id=spec.id,r=results[id];
  if(!r){rows.push({id,name:spec.title,device:spec.device,status:'missing',lines:[]});continue;}
  if(r.status==='skipped'){rows.push({id,name:spec.title,device:spec.device,status:'skipped',
   reason:r.reason||'',note:r.note||'',lines:[skippedText(r.reason)]});continue;}
  const f=r.fields||{},d=r.derived||{};const lines=[];
  for(const field of spec.fields)if(finite(f[field.key]))lines.push(field.label+' : '+String(f[field.key]).replace('.',',')+' '+field.unit);
  for(const c of spec.choices||[])if(f[c.key])lines.push(c.label+' : '+(optionLabel(c.options,f[c.key])||'—'));
  if(finite(d.gait_speed_ms))lines.push('Vitesse de marche : '+String(d.gait_speed_ms).replace('.',',')+' m/s'+
   (r.method==='GAIT_4M_STANDING_START_BEST_OF_2'?' (départ arrêté, meilleur passage)':' (ancien protocole, départ lancé)'));
  if(finite(d.lsi_pct))lines.push('Symétrie : '+String(d.lsi_pct).replace('.',',')+' %'+
   (d.weaker_side==='balanced'?' (équilibrée)':' (côté plus faible : '+(d.weaker_side==='left'?'gauche':'droit')+')'));
  rows.push({id,name:spec.title,device:spec.device,status:'done',note:r.note||'',lines});
 }
 return rows;
}
// Conditions d'acquisition d'une consultation (comparabilité J0 → S6 → S12).
export function acquisitionConditions(results={}){
 const a=results.anthropometry?.status==='done'?results.anthropometry.fields||{}:{};
 const k=results.dynamo_knee_ext?.status==='done'?results.dynamo_knee_ext.fields||{}:{};
 return {
  footwear:a.footwear||null,
  walking_aid:a.walking_aid||null,
  knee_pad_distance_cm:finite(k.knee_pad_distance_cm)?k.knee_pad_distance_cm:null
 };
}
export const CONDITION_LABELS={
 footwear:['Chaussage',FOOTWEAR],
 walking_aid:['Aide de marche',WALKING_AID]
};

// Spécification transmise au serveur (générée, jamais éditée à la main côté serveur).
export function serverSpec(){
 return {
  protocol:{id:PROTOCOL.id,version:PROTOCOL.version,code:PROTOCOL.code,mode:PROTOCOL.mode,
   device_set:PROTOCOL.device_set.map(d=>d.id)},
  steps:STEPS.map(s=>{
   const out={id:s.id,kind:s.kind,duration:s.duration||0};
   if(s.kind==='fields'){
    out.fields=s.fields.map(f=>({key:f.key,min:f.min,max:f.max,decimals:f.decimals,...(f.optional?{optional:true}:{})}));
    out.choices=(s.choices||[]).map(c=>({key:c.key,options:c.options.map(([k])=>k)}));
    if(s.pair)out.pair=s.pair;
   }
   if(['count','balance','two_step'].includes(s.kind)){out.unit=s.unit;out.max=s.max;out.integer=!!s.integer;}
   if(s.kind==='observation')out.options=s.options.map(([k])=>k);
   if(s.method)out.method=s.method;
   if(s.value_field)out.value_field=s.value_field;
   return out;
  }),
  skip_reasons:SKIP_REASONS.map(([k])=>k)
 };
}
