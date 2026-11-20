// KŌMØ Motion — protocole de consultation standardisé.
// SOURCE UNIQUE de vérité pour : la console opérateur, le serveur (motion-live-test),
// le rapport, le PDF, la trajectoire et le protocole écrit.
// Le serveur reçoit une copie générée : `node scripts/motion-protocol-sync.mjs`
// (le build échoue si la copie serveur diverge de ce fichier).
// Aucune interprétation diagnostique, aucun score composite, aucun « âge du mouvement ».

export const PROTOCOL={
 id:'KOMO_MOTION',
 version:'2.0.0',
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

export const BLOCKS={
 A:'Mesures de base',
 B:'Plateformes ForceDecks',
 C:'Équilibre et forces',
 D:'Bras et posture'
};

// Les 13 étapes, dans l'ordre officiel (du moins au plus exigeant).
// kind : fields (saisie d'appareil) · two_step · count (chrono + compteur vidéo) · balance · observation.
// fields[].decimals = précision acceptée par le serveur ; choices = listes fermées.
export const STEPS=[
 {id:'anthropometry',block:'A',kind:'fields',title:'Taille et masse',short:'Mensurations',
  device:'Mètre · pesée ForceDecks',trials:'1 mesure',duration:0,
  setup:'Pieds nus ou chaussettes, dos au mur pour la taille. Masse lue sur la pesée ForceDecks (plateformes à zéro).',
  script:'« Je mesure votre taille, puis je vous pèse. »',
  instruction:'Saisir la taille, la masse, le chaussage et l’aide de marche : ces conditions sont reprises à chaque contrôle.',
  fields:[
   {key:'height_cm',label:'Taille',unit:'cm',min:100,max:230,decimals:1},
   {key:'body_mass_kg',label:'Masse',unit:'kg',min:25,max:250,decimals:1}
  ],
  choices:[
   {key:'footwear',label:'Chaussage pendant le bilan',options:FOOTWEAR},
   {key:'walking_aid',label:'Aide de marche',options:WALKING_AID,default:'none'}
  ]},
 {id:'gait_4m',block:'A',kind:'fields',title:'Marche 4 m · allure habituelle',short:'Marche 4 m',
  device:'Chronomètre · iPhone de profil',trials:'2 passages',duration:0,
  setup:'Couloir droit : 2 m d’élan, 4 m mesurés au ruban, 2 m de décélération. Aide de marche notée.',
  script:'« Marchez à votre allure habituelle, comme dans la rue. »',
  instruction:'Chrono au franchissement de la ligne de départ puis d’arrivée par le premier pied. Deux passages ; la vitesse est calculée sur la moyenne.',
  fields:[
   {key:'gait_4m_s_1',label:'Passage 1',unit:'s',min:1,max:30,decimals:2},
   {key:'gait_4m_s_2',label:'Passage 2',unit:'s',min:1,max:30,decimals:2}
  ]},
 {id:'two_step',block:'A',kind:'two_step',title:'Two-Step · deux grands pas',short:'Two-Step',
  device:'Ruban métrique',trials:'2 essais',duration:0,unit:'cm',ui_unit:'cm',max:650,integer:false,
  setup:'Sol plat antidérapant, ruban métrique au sol, ligne de départ, opérateur à proximité et espace dégagé.',
  script:'« Depuis la ligne, faites deux pas aussi grands que possible, sans courir ni sauter, puis joignez les pieds. »',
  instruction:'Mesurer la distance entre la ligne et la pointe des pieds. Deux essais, le meilleur est retenu. Recommencer tout essai avec perte d’équilibre.',
  label:'Meilleure distance des deux pas'},
 {id:'fd_quiet_stand',block:'B',kind:'fields',title:'Quiet Stand 30 s · ForceDecks',short:'Quiet Stand',
  device:'2 ForceDecks Mini',trials:'1 essai de 30 s',duration:0,
  setup:'Plateformes à zéro. Pieds à largeur d’épaules sur les repères au sol. Mains sur les hanches, buste droit, regard devant.',
  script:'« Gardez les pieds fixes et restez aussi immobile que possible. »',
  instruction:'30 s yeux ouverts, lancé dans VALD. Recopier les valeurs affichées par VALD.',
  fields:[
   {key:'fd_qs_excursion_mm',label:'Déplacement total du centre de pression',unit:'mm',min:0,max:10000,decimals:1},
   {key:'fd_qs_ellipse_mm2',label:'Aire de l’ellipse',unit:'mm²',min:0,max:100000,decimals:1},
   {key:'fd_qs_asym_pct',label:'Asymétrie de force moyenne',unit:'%',min:0,max:100,decimals:1}
  ],
  choices:[{key:'fd_qs_asym_side',label:'Côté le plus chargé',options:SIDE_OPTIONS}]},
 {id:'sts',block:'B',kind:'count',title:'Lever de chaise 30 s',short:'Chaise 30 s',
  device:'iPhone de trois-quarts · chaise',trials:'1 essai de 30 s',duration:30,unit:'repetitions',ui_unit:'répétitions',
  max:100,integer:true,
  setup:'Chaise stable contre un mur, caméra de trois-quarts profil, tête et pieds visibles.',
  script:'« Levez-vous et asseyez-vous complètement, le plus de fois possible en 30 secondes, bras croisés si possible. »',
  instruction:'Démarrer le chronomètre. Comparer le compteur vidéo aux levers complets observés et corriger si besoin.',
  label:'Nombre de levers complets'},
 {id:'fd_sts',block:'B',kind:'fields',title:'Sit-to-Stand-to-Sit · ForceDecks',short:'STS plateformes',
  device:'2 ForceDecks Mini · chaise',trials:'3 répétitions',duration:0,
  setup:'Plateformes juste devant la chaise sans la toucher, un pied sur chaque. Hauteur de chaise saisie dans VALD, plateformes à zéro.',
  script:'« Mains croisées sur la poitrine. Restez immobile, levez-vous, restez debout une seconde, rasseyez-vous. »',
  instruction:'Immobile 2 à 3 s avant et entre chaque répétition, 1 s debout immobile. Trois répétitions contrôlées.',
  fields:[
   {key:'fd_sts_asym_pct',label:'Asymétrie de force au lever (affichée par VALD)',unit:'%',min:0,max:100,decimals:1}
  ],
  choices:[{key:'fd_sts_asym_side',label:'Côté dominant',options:SIDE_OPTIONS}]},
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
 {id:'dynamo_grip',block:'C',kind:'fields',title:'Préhension · DynaMo',short:'Préhension',
  device:'DynaMo Plus · poignée',trials:'1 essai à 50 % + 3 maximaux par côté',duration:0,
  setup:'Assis, coude à 90°, épaule contre le corps, poignet neutre. DynaMo horizontal en configuration préhension.',
  script:'« 3, 2, 1 — serrez, serrez, serrez… et relâchez. »',
  instruction:'Un essai à 50 %, puis 3 essais maximaux par côté en alternant, 30 s de repos. Saisir le meilleur essai valide.',
  pair:['grip_left_n','grip_right_n'],
  fields:[
   {key:'grip_left_n',label:'Gauche · meilleur essai',unit:'N',min:0,max:1500,decimals:1},
   {key:'grip_right_n',label:'Droite · meilleur essai',unit:'N',min:0,max:1500,decimals:1}
  ]},
 {id:'dynamo_knee_ext',block:'C',kind:'fields',title:'Extension de genou · DynaMo',short:'Genou',
  device:'DynaMo Plus · pad',trials:'3 essais maximaux par côté',duration:0,
  setup:'Assis au bord de la table, hanches et genoux à 90°, pieds sans contact avec le sol, bras croisés. Pad sur la face antérieure du tibia.',
  script:'« 3, 2, 1 — poussez, poussez, poussez… et relâchez. »',
  instruction:'3 essais de 3 à 5 s par côté, 30 s de repos. Arrêt immédiat si douleur. Même distance pad–malléole à chaque séance.',
  pair:['knee_ext_left_n','knee_ext_right_n'],
  fields:[
   {key:'knee_ext_left_n',label:'Gauche · meilleur essai',unit:'N',min:0,max:2500,decimals:1},
   {key:'knee_ext_right_n',label:'Droite · meilleur essai',unit:'N',min:0,max:2500,decimals:1},
   {key:'knee_pad_distance_cm',label:'Distance pad – malléole',unit:'cm',min:0,max:60,decimals:1,optional:true}
  ]},
 {id:'dynamo_hip_abd',block:'C',kind:'fields',title:'Abduction de hanche · DynaMo',short:'Hanche',
  device:'DynaMo Plus · pad',trials:'3 essais maximaux par côté',duration:0,
  setup:'Allongé sur le dos, jambe tendue. Pad sur la face latérale de la jambe juste au-dessus de la malléole, même point à chaque séance.',
  script:'« 3, 2, 1 — poussez vers l’extérieur… et relâchez. »',
  instruction:'3 essais de 3 à 5 s par côté, 30 s de repos. Arrêt immédiat si douleur.',
  pair:['hip_abd_left_n','hip_abd_right_n'],
  fields:[
   {key:'hip_abd_left_n',label:'Gauche · meilleur essai',unit:'N',min:0,max:2000,decimals:1},
   {key:'hip_abd_right_n',label:'Droite · meilleur essai',unit:'N',min:0,max:2000,decimals:1}
  ]},
 {id:'arms',block:'D',kind:'count',title:'Élévation des bras 30 s',short:'Bras',
  device:'iPhone de face',trials:'1 essai de 30 s',duration:30,unit:'movements',ui_unit:'mouvements',max:100,integer:true,
  setup:'Face à la caméra, bras et poignets visibles, espace libre autour du corps.',
  script:'« Levez et abaissez les bras en cycles complets, le plus de fois possible en 30 secondes, sans aller jusqu’à la douleur. »',
  instruction:'Démarrer le chronomètre. Comparer le compteur aux cycles complets observés et corriger si besoin.',
  label:'Nombre de mouvements'},
 {id:'posture',block:'D',kind:'observation',title:'Posture de profil · observation',short:'Posture',
  device:'iPhone de profil',trials:'1 observation',duration:0,unit:'observation',ui_unit:'observation',
  options:POSTURE_OPTIONS,
  setup:'Profil strict, pieds visibles, téléphone à hauteur du bassin, caméra immobile.',
  script:'« Tenez-vous debout comme d’habitude, regard devant. »',
  instruction:'Observer l’alignement sagittal apparent. Une caméra 2D ne mesure pas la SVA radiographique.',
  label:'Observation visuelle'}
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
  const mean=(fields.gait_4m_s_1+fields.gait_4m_s_2)/2;
  d.gait_mean_s=round(mean,2);d.gait_speed_ms=round(4/mean,2);
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
  if(finite(d.gait_speed_ms))lines.push('Vitesse de marche : '+String(d.gait_speed_ms).replace('.',',')+' m/s');
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
   return out;
  }),
  skip_reasons:SKIP_REASONS.map(([k])=>k)
 };
}
