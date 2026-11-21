// KŌMØ Motion — protocole de consultation standardisé.
// SOURCE UNIQUE de vérité pour : la console opérateur, le serveur (motion-live-test),
// le rapport, le PDF, la trajectoire et le protocole écrit.
// Le serveur reçoit une copie générée : `node scripts/motion-protocol-sync.mjs`
// (le build échoue si la copie serveur diverge de ce fichier).
// Aucune interprétation diagnostique, aucun score composite, aucun « âge du mouvement ».

export const PROTOCOL={
 id:'KOMO_MOTION',
 version:'2.3.0',
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

// Stations de la consultation (v2.1) : le patient change de poste 5 fois, l'iPhone 3 fois.
// camera : placement de l'iPhone pendant la station (null = iPhone non utilisé).
export const STATIONS={
 A:{label:'Plateformes ForceDecks',camera:null,
  place:'Chaise contre le mur, plateformes juste devant. Taille au mur, puis pesée et Quiet Stand debout sur les plateformes, puis Sit to Stand assis. App ForceDecks ouverte, profil au code PULSE.'},
 B:{label:'Posture et marche',camera:'profile',
  place:'iPhone sur trépied, perpendiculaire au couloir, à 3 m environ, à hauteur du bassin, cadré sur le milieu des 4 m.'},
 C:{label:'Équilibre et bras',camera:'front',
  place:'iPhone de face, à 3 m environ, à hauteur du bassin : corps entier visible, chevilles comprises.'},
 D:{label:'Force · DynaMo',camera:null,
  place:'Chaise et table d’examen. Ouvre l’app DynaMo ; l’iPhone n’est pas utilisé.'},
 E:{label:'Lever de chaise',camera:'three_quarter',
  place:'Chaise de 43 cm sans accoudoirs contre le mur ; iPhone de trois-quarts à 2–3 m, tête et pieds visibles.'}
};
export const CAMERA_LABELS={profile:'iPhone de profil',front:'iPhone de face',three_quarter:'iPhone de trois-quarts'};
export const BLOCKS=Object.fromEntries(Object.entries(STATIONS).map(([k,v])=>[k,v.label]));

// Les 13 étapes, dans l'ordre officiel v2.1 : regroupées par station, le statique avant l'effort,
// la force maximale avant l'endurance (le lever de chaise 30 s, le plus fatigant, est en dernier).
// kind : fields (saisie d'appareil) · two_step · count (chrono + compteur vidéo) · balance · observation.
// fields[].decimals = précision acceptée par le serveur ; fields[].vald = libellé affiché par l'app VALD.
// choices = listes fermées ; vald (étape) = test à lancer et réglages dans l'app VALD.
export const STEPS=[
 {id:'anthropometry',block:'A',kind:'fields',title:'Taille et masse',short:'Mensurations',
  device:'Toise murale · pesée ForceDecks',trials:'1 mesure',duration:0,
  setup:'Taille : pieds nus ou en chaussettes, talons, fesses et épaules contre le mur, regard horizontal. Masse : dans l’app ForceDecks, choisir le test Quiet Stand, mettre à zéro sans personne sur les plateformes, puis le patient monte un pied sur chaque et reste immobile : l’app le pèse.',
  script:'« Je mesure votre taille. Montez ensuite sur les deux plateformes et restez immobile. »',
  instruction:'Saisir la taille, la masse lue dans l’app ForceDecks, le chaussage et l’aide de marche : ces conditions sont reprises à chaque contrôle.',
  vald:{app:'ForceDecks',test:'Pesée au début du Quiet Stand',settings:'Zéro sans personne sur les plateformes, puis pesée'},
  fields:[
   {key:'height_cm',label:'Taille',unit:'cm',min:100,max:230,decimals:1},
   {key:'body_mass_kg',label:'Masse',unit:'kg',min:25,max:250,decimals:1,vald:'Poids · pesée ForceDecks'}
  ],
  choices:[
   {key:'footwear',label:'Chaussage pendant le bilan',options:FOOTWEAR},
   {key:'walking_aid',label:'Aide de marche',options:WALKING_AID,default:'none'}
  ]},
 {id:'fd_quiet_stand',block:'A',kind:'fields',title:'Quiet Stand 30 s · ForceDecks',short:'Quiet Stand',
  device:'2 ForceDecks Mini',trials:'1 essai de 30 s',duration:0,
  setup:'Le patient reste sur les plateformes après la pesée : un pied sur chaque, à largeur d’épaules, mains sur les hanches, buste droit, regard devant. La chaise est derrière lui.',
  script:'« Mains sur les hanches, regardez devant vous. Gardez les pieds fixes et restez aussi immobile que possible pendant 30 secondes. »',
  instruction:'Lancer l’enregistrement (compte à rebours de 3 s), attendre les 30 s, puis recopier les 4 valeurs de l’écran de résultats, de haut en bas. Le L ou R après l’asymétrie indique le côté le plus chargé.',
  vald:{app:'ForceDecks',test:'Balance › Quiet Stand',settings:'Exercise Length 30 s · aucune option cochée (yeux ouverts, sol stable)',
   tip:'Ce sont les 4 métriques affichées par défaut depuis la version de juillet 2026 de l’app. Si l’écran en montre d’autres, rétablis les métriques par défaut dans les réglages des résultats.'},
  fields:[
   {key:'fd_qs_cop_ml_mm',label:'Oscillation latérale',unit:'mm',min:0,max:1000,decimals:1,vald:'CoP Range, Medial-Lateral – Bilateral'},
   {key:'fd_qs_cop_ap_mm',label:'Oscillation avant-arrière',unit:'mm',min:0,max:1000,decimals:1,vald:'CoP Range, Anterior-Posterior – Bilateral'},
   {key:'fd_qs_velocity_mms',label:'Vitesse moyenne du centre de pression',unit:'mm/s',min:0,max:1000,decimals:1,vald:'Mean Velocity'},
   {key:'fd_qs_asym_pct',label:'Asymétrie de charge',unit:'%',min:0,max:100,decimals:1,vald:'Mean Force – Asymmetry'}
  ],
  choices:[{key:'fd_qs_asym_side',label:'Côté le plus chargé (L ou R affiché)',options:SIDE_OPTIONS}]},
 {id:'fd_sts',block:'A',kind:'fields',title:'Sit to Stand to Sit · ForceDecks',short:'STS plateformes',
  device:'2 ForceDecks Mini · chaise',trials:'3 répétitions',duration:0,
  setup:'Le patient descend des plateformes pour la mise à zéro. Chaise d’environ 43 cm, sans accoudoirs, contre le mur ; plateformes juste devant sans la toucher. Pesée debout sur les plateformes, puis assis, un pied sur chaque, bras croisés sur la poitrine.',
  script:'« Bras croisés. Restez immobile. Penchez-vous en avant, levez-vous, restez debout une seconde, rasseyez-vous, puis restez immobile. On le fait trois fois. »',
  instruction:'2 à 3 s immobile avant et entre chaque répétition, 1 s debout immobile. Après la 3e, arrêter l’enregistrement et recopier les 2 premières valeurs de l’écran (moyenne des répétitions si l’app l’affiche).',
  vald:{app:'ForceDecks',test:'Functional › Sit to Stand to Sit',settings:'Hauteur de chaise 0,43 m · 3 répétitions'},
  fields:[
   {key:'fd_sts_time_to_stand_s',label:'Temps pour se lever',unit:'s',min:0,max:20,decimals:2,vald:'Time to Stand'},
   {key:'fd_sts_asym_pct',label:'Asymétrie de force au lever',unit:'%',min:0,max:100,decimals:1,vald:'Mean Standing Force – Asymmetry'}
  ],
  choices:[{key:'fd_sts_asym_side',label:'Côté le plus chargé (L ou R affiché)',options:SIDE_OPTIONS}]},
 {id:'posture',block:'B',kind:'observation',title:'Posture de profil · observation',short:'Posture',
  device:'iPhone de profil',trials:'1 observation',duration:0,unit:'observation',ui_unit:'observation',
  options:POSTURE_OPTIONS,
  setup:'Le patient se place au milieu du couloir, strictement de profil, pieds visibles ; iPhone immobile à hauteur du bassin.',
  script:'« Tenez-vous debout comme d’habitude, bras le long du corps, regard devant. »',
  instruction:'Observer l’alignement sagittal apparent. Une caméra 2D ne mesure pas la SVA radiographique.',
  label:'Observation visuelle'},
 // Marche 4 m (v2.3) : protocole SPPB, celui des repères EWGSOP2 et des cohortes de survie.
 // Départ arrêté, chrono au premier mouvement, arrivée quand un pied a entièrement franchi les 4 m,
 // deux passages, le plus rapide est retenu. Un départ lancé donne 0,1 à 0,2 m/s de plus : non comparable.
 {id:'gait_4m',block:'B',kind:'fields',title:'Marche 4 m · départ arrêté',short:'Marche 4 m',
  device:'Chronomètre PULSE · couloir balisé',trials:'2 passages, le plus rapide retenu',duration:0,walkway:true,
  method:'GAIT_4M_STANDING_START_BEST_OF_2',
  setup:'Couloir droit et dégagé : ligne de départ à 0 m, ligne d’arrivée à 4 m, un repère 2 m plus loin (6 m) pour que le patient ne ralentisse pas avant l’arrivée. Chaussage et aide de marche identiques au début du bilan.',
  script:'« Pointes des pieds juste derrière la ligne. Au signal, marchez à votre allure habituelle, comme dans la rue, jusqu’au repère au bout. Prêt ? Partez. »',
  instruction:'Démarre le chrono au premier mouvement du pied, pas au signal. Arrête-le dès qu’un pied a entièrement franchi la ligne des 4 m. Tiens-toi derrière le patient, un peu sur le côté. Deux passages : PULSE retient le plus rapide.',
  fields:[
   {key:'gait_4m_s_1',label:'Passage 1',unit:'s',min:1,max:30,decimals:2},
   {key:'gait_4m_s_2',label:'Passage 2',unit:'s',min:1,max:30,decimals:2}
  ]},
 {id:'two_step',block:'B',kind:'two_step',title:'Two-Step · deux grands pas',short:'Two-Step',
  device:'Ruban métrique',trials:'2 essais',duration:0,unit:'cm',ui_unit:'cm',max:650,integer:false,
  setup:'Même couloir : ruban métrique au sol depuis une ligne de départ, sol antidérapant, praticien à proximité.',
  script:'« Depuis la ligne, faites deux pas aussi grands que possible, sans courir ni sauter, puis joignez les pieds. »',
  instruction:'Mesurer la distance entre la ligne et la pointe des pieds. Deux essais, le meilleur est retenu. Recommencer tout essai avec perte d’équilibre.',
  label:'Meilleure distance des deux pas'},
 {id:'unipodal_left',block:'C',kind:'balance',title:'Équilibre · appui pied gauche',short:'Équilibre G',
  device:'iPhone de face',trials:'1 essai, 30 s max',duration:30,unit:'seconds',ui_unit:'seconds',max:30,integer:false,
  setup:'Sol ferme, yeux ouverts, pieds nus si possible, face à la caméra. Appui stable accessible, praticien à proximité.',
  script:'« Levez le pied droit sans toucher l’autre jambe et tenez le plus longtemps possible. Je reste à côté de vous. »',
  instruction:'Armer le suivi : le chronomètre démarre au lever du pied et s’arrête au retour d’appui, à une compensation ou après 30 s.',
  label:'Appui unipodal gauche (secondes)'},
 {id:'unipodal_right',block:'C',kind:'balance',title:'Équilibre · appui pied droit',short:'Équilibre D',
  device:'iPhone de face',trials:'1 essai, 30 s max',duration:30,unit:'seconds',ui_unit:'seconds',max:30,integer:false,
  setup:'Sol ferme, yeux ouverts, pieds nus si possible, face à la caméra. Appui stable accessible, praticien à proximité.',
  script:'« Levez le pied gauche sans toucher l’autre jambe et tenez le plus longtemps possible. Je reste à côté de vous. »',
  instruction:'Armer le suivi : le chronomètre démarre au lever du pied et s’arrête au retour d’appui, à une compensation ou après 30 s.',
  label:'Appui unipodal droit (secondes)'},
 {id:'arms',block:'C',kind:'count',title:'Élévation des bras 30 s',short:'Bras',
  device:'iPhone de face',trials:'1 essai de 30 s',duration:30,unit:'movements',ui_unit:'mouvements',max:100,integer:true,
  setup:'Même placement que l’équilibre : face à la caméra, bras et poignets visibles, espace libre autour du corps.',
  script:'« Levez et abaissez les bras en cycles complets, le plus de fois possible en 30 secondes, sans aller jusqu’à la douleur. »',
  instruction:'Démarrer le chronomètre. Comparer le compteur aux cycles complets observés et corriger si besoin.',
  label:'Nombre de mouvements'},
 {id:'dynamo_grip',block:'D',kind:'fields',title:'Préhension · DynaMo',short:'Préhension',
  device:'DynaMo Plus · poignée',trials:'1 essai à 50 % + 3 maximaux par côté',duration:0,dynamo:true,
  setup:'Assis, coude à 90°, épaule contre le corps, poignet neutre. DynaMo Plus avec la poignée de préhension.',
  script:'« 3, 2, 1 — serrez, serrez, serrez… et relâchez. »',
  instruction:'Un essai à 50 %, puis 3 essais maximaux par côté en alternant, 30 s de repos. Saisir le meilleur essai valide de chaque côté.',
  vald:{app:'DynaMo',test:'Grip (préhension)',settings:'Position neutre · 3 essais par côté'},
  pair:['grip_left_n','grip_right_n'],
  fields:[
   {key:'grip_left_n',label:'Gauche · meilleur essai',unit:'N',min:0,max:1500,decimals:1,vald:'Force max · gauche'},
   {key:'grip_right_n',label:'Droite · meilleur essai',unit:'N',min:0,max:1500,decimals:1,vald:'Force max · droite'}
  ]},
 {id:'dynamo_knee_ext',block:'D',kind:'fields',title:'Extension de genou · DynaMo',short:'Genou',
  device:'DynaMo Plus · pad',trials:'3 essais maximaux par côté',duration:0,dynamo:true,
  setup:'Assis au bord de la table, hanches et genoux à 90°, pieds sans contact avec le sol, bras croisés. Pad sur la face antérieure du tibia.',
  script:'« 3, 2, 1 — poussez, poussez, poussez… et relâchez. »',
  instruction:'3 essais de 3 à 5 s par côté, 30 s de repos. Arrêt immédiat si douleur. Même distance pad–malléole à chaque séance.',
  vald:{app:'DynaMo',test:'Knee Extension (extension de genou)',settings:'Assis 90° · 3 essais par côté'},
  pair:['knee_ext_left_n','knee_ext_right_n'],
  fields:[
   {key:'knee_ext_left_n',label:'Gauche · meilleur essai',unit:'N',min:0,max:2500,decimals:1,vald:'Force max · gauche'},
   {key:'knee_ext_right_n',label:'Droite · meilleur essai',unit:'N',min:0,max:2500,decimals:1,vald:'Force max · droite'},
   {key:'knee_pad_distance_cm',label:'Distance pad – malléole',unit:'cm',min:0,max:60,decimals:1,optional:true}
  ]},
 {id:'dynamo_hip_abd',block:'D',kind:'fields',title:'Abduction de hanche · DynaMo',short:'Hanche',
  device:'DynaMo Plus · pad',trials:'3 essais maximaux par côté',duration:0,dynamo:true,
  setup:'Allongé sur le dos, jambe tendue. Pad sur la face latérale de la jambe juste au-dessus de la malléole, même point à chaque séance.',
  script:'« 3, 2, 1 — poussez vers l’extérieur… et relâchez. »',
  instruction:'3 essais de 3 à 5 s par côté, 30 s de repos. Arrêt immédiat si douleur.',
  vald:{app:'DynaMo',test:'Hip Abduction (abduction de hanche)',settings:'Décubitus dorsal · 3 essais par côté'},
  pair:['hip_abd_left_n','hip_abd_right_n'],
  fields:[
   {key:'hip_abd_left_n',label:'Gauche · meilleur essai',unit:'N',min:0,max:2000,decimals:1,vald:'Force max · gauche'},
   {key:'hip_abd_right_n',label:'Droite · meilleur essai',unit:'N',min:0,max:2000,decimals:1,vald:'Force max · droite'}
  ]},
 {id:'sts',block:'E',kind:'count',title:'Lever de chaise 30 s',short:'Chaise 30 s',
  device:'iPhone de trois-quarts · chaise',trials:'1 essai de 30 s',duration:30,unit:'repetitions',ui_unit:'répétitions',
  max:100,integer:true,
  setup:'Chaise d’environ 43 cm sans accoudoirs, contre le mur, plateformes retirées. Assis au milieu de l’assise, pieds à plat, bras croisés. iPhone de trois-quarts, tête et pieds visibles.',
  script:'« Levez-vous complètement et rasseyez-vous, le plus de fois possible en 30 secondes, bras croisés. »',
  instruction:'Démarrer le chronomètre. Comparer le compteur vidéo aux levers complets observés et corriger si besoin.',
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
// DynaMo : l'écran peut afficher N, kg ou lb ; PULSE enregistre toujours en newtons.
export const KGF_TO_N=9.80665;
export const toNewton=(value,unit)=>unit==='kg'?round(value*KGF_TO_N,1):value;
export const fromNewton=(value,unit)=>unit==='kg'?round(value/KGF_TO_N,2):value;
// Contrôles de vraisemblance NON bloquants : faute de frappe, mauvaise unité, essai non représentatif.
// Ce ne sont pas des normes cliniques ; aucun message n'interprète le résultat du patient.
const DYNAMO_LOW_N={dynamo_grip:50,dynamo_knee_ext:40,dynamo_hip_abd:30};
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
   return out;
  }),
  skip_reasons:SKIP_REASONS.map(([k])=>k)
 };
}
