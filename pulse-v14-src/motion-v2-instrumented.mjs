// KŌMØ Motion — protocole de consultation V2 (20 novembre 2026).
// Étapes à saisie opérateur : anthropométrie, marche 4 m, ForceDecks Mini, DynaMo Plus.
// Valeurs recopiées depuis les applications VALD ou mesurées par l'opérateur.
// Aucune interprétation diagnostique, aucun score composite, aucun Motion Age.
// La même spécification est dupliquée dans supabase/functions/motion-live-test/index.ts :
// toute modification doit être faite aux deux endroits.
export const MOTION_PROTOCOL_VERSION='KOMO_MOTION_V2';
export const SIDE_OPTIONS=[['left','Gauche'],['right','Droite'],['balanced','Équilibré']];
export const INSTRUMENTED_STEPS={
 anthropometry:{
  title:'Taille et masse',short:'Mensurations',device:'Mètre · pesée ForceDecks',
  setup:'Pieds nus ou chaussettes, dos au mur pour la taille. Masse lue sur la pesée ForceDecks (plateformes à zéro).',
  instruction:'Saisir la taille et la masse. Elles servent au rapport Two-Step et à la lecture des forces.',
  fields:[
   {key:'height_cm',label:'Taille',unit:'cm',min:100,max:230,step:0.1},
   {key:'body_mass_kg',label:'Masse',unit:'kg',min:25,max:250,step:0.1}
  ]},
 gait_4m:{
  title:'Marche 4 m · allure habituelle',short:'Marche 4 m',device:'Chronomètre · iPhone de profil',
  setup:'Couloir droit : 2 m d’élan, 4 m mesurés au ruban, 2 m de décélération. Aide de marche notée.',
  instruction:'« Marchez à votre allure habituelle. » Chrono au franchissement de la ligne de départ puis d’arrivée par le premier pied. Deux passages.',
  fields:[
   {key:'gait_4m_s_1',label:'Passage 1',unit:'s',min:1,max:30,step:0.01},
   {key:'gait_4m_s_2',label:'Passage 2',unit:'s',min:1,max:30,step:0.01}
  ]},
 fd_quiet_stand:{
  title:'ForceDecks · Quiet Stand 30 s',short:'Quiet Stand',device:'2 ForceDecks Mini',
  setup:'Plateformes à zéro. Pieds à largeur d’épaules sur les repères au sol. Mains sur les hanches, buste droit, regard devant.',
  instruction:'« Gardez les pieds fixes et restez aussi immobile que possible. » 30 s yeux ouverts. Recopier les valeurs affichées par VALD.',
  fields:[
   {key:'fd_qs_excursion_mm',label:'Déplacement total du centre de pression',unit:'mm',min:0,max:10000,step:0.1},
   {key:'fd_qs_ellipse_mm2',label:'Aire de l’ellipse',unit:'mm²',min:0,max:100000,step:0.1},
   {key:'fd_qs_asym_pct',label:'Asymétrie de force moyenne',unit:'%',min:0,max:100,step:0.1}
  ],side:{key:'fd_qs_asym_side',label:'Côté le plus chargé'}},
 fd_sts:{
  title:'ForceDecks · Sit-to-Stand-to-Sit',short:'STS plateformes',device:'2 ForceDecks Mini · chaise',
  setup:'Plateformes juste devant la chaise sans la toucher, un pied sur chaque. Hauteur de chaise saisie dans VALD, plateformes à zéro.',
  instruction:'Mains croisées sur la poitrine. Immobile 2 à 3 s avant et entre chaque répétition, 1 s debout immobile. Trois répétitions contrôlées.',
  fields:[
   {key:'fd_sts_asym_pct',label:'Asymétrie de force au lever (affichée par VALD)',unit:'%',min:0,max:100,step:0.1}
  ],side:{key:'fd_sts_asym_side',label:'Côté dominant'}},
 dynamo_grip:{
  title:'DynaMo · préhension',short:'Préhension',device:'DynaMo Plus · poignée',
  setup:'Assis, coude à 90°, épaule contre le corps, poignet neutre. DynaMo horizontal en configuration préhension.',
  instruction:'Un essai à 50 %, puis 3 essais maximaux par côté en alternant, 30 s de repos. « 3, 2, 1 — serrez, serrez, serrez et relâchez. » Saisir le meilleur essai valide.',
  bilateral:true,
  fields:[
   {key:'grip_left_n',label:'Gauche · meilleur essai',unit:'N',min:0,max:1500,step:0.1},
   {key:'grip_right_n',label:'Droite · meilleur essai',unit:'N',min:0,max:1500,step:0.1}
  ]},
 dynamo_knee_ext:{
  title:'DynaMo · extension de genou',short:'Genou',device:'DynaMo Plus · pad',
  setup:'Assis au bord de la table, hanches et genoux à 90°, pieds sans contact avec le sol, bras croisés. Pad sur la face antérieure du tibia.',
  instruction:'3 essais maximaux de 3 à 5 s par côté, 30 s de repos. « 3, 2, 1 — poussez, poussez, poussez et relâchez. » Arrêt si douleur.',
  bilateral:true,
  fields:[
   {key:'knee_ext_left_n',label:'Gauche · meilleur essai',unit:'N',min:0,max:2500,step:0.1},
   {key:'knee_ext_right_n',label:'Droite · meilleur essai',unit:'N',min:0,max:2500,step:0.1},
   {key:'knee_pad_distance_cm',label:'Distance pad – malléole',unit:'cm',min:0,max:60,step:0.5,optional:true}
  ]},
 dynamo_hip_abd:{
  title:'DynaMo · abduction de hanche',short:'Hanche',device:'DynaMo Plus · pad',
  setup:'Allongé sur le dos, jambe tendue. Pad sur la face latérale de la jambe juste au-dessus de la malléole, même point à chaque séance.',
  instruction:'3 essais maximaux de 3 à 5 s par côté, 30 s de repos. « 3, 2, 1 — poussez, poussez, poussez et relâchez. » Arrêt si douleur.',
  bilateral:true,
  fields:[
   {key:'hip_abd_left_n',label:'Gauche · meilleur essai',unit:'N',min:0,max:2000,step:0.1},
   {key:'hip_abd_right_n',label:'Droite · meilleur essai',unit:'N',min:0,max:2000,step:0.1}
  ]}
};
// Ordre officiel de la consultation V2 (du moins au plus exigeant).
export const V2_ORDER=['anthropometry','gait_4m','two_step','fd_quiet_stand','sts','fd_sts',
 'unipodal_left','unipodal_right','dynamo_grip','dynamo_knee_ext','dynamo_hip_abd','arms','posture'];
const finite=x=>typeof x==='number'&&Number.isFinite(x);
const round=(x,d=1)=>Math.round(x*10**d)/10**d;
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
 const pair={dynamo_grip:['grip_left_n','grip_right_n'],dynamo_knee_ext:['knee_ext_left_n','knee_ext_right_n'],
  dynamo_hip_abd:['hip_abd_left_n','hip_abd_right_n']}[stepId];
 if(pair){const sym=symmetry(fields[pair[0]],fields[pair[1]]);if(sym)Object.assign(d,sym);}
 return d;
}
// Valide une saisie ; renvoie {ok, fields, error}. Les valeurs absentes restent absentes, jamais 0.
export function validateInstrumented(stepId,raw={}){
 const spec=INSTRUMENTED_STEPS[stepId];if(!spec)return {ok:false,error:'unknown_step'};
 const fields={};
 for(const f of spec.fields){
  const v=raw[f.key];
  if(v===undefined||v===null||v===''){if(f.optional)continue;return {ok:false,error:'missing_'+f.key};}
  if(typeof v!=='number'||!finite(v)||v<f.min||v>f.max)return {ok:false,error:'invalid_'+f.key};
  const decimals=String(f.step).includes('.')?String(f.step).split('.')[1].length:0;
  if(Math.abs(round(v,decimals)-v)>1e-9)return {ok:false,error:'precision_'+f.key};
  fields[f.key]=v;
 }
 if(spec.side){
  const side=raw[spec.side.key];
  if(!SIDE_OPTIONS.some(([k])=>k===side))return {ok:false,error:'invalid_'+spec.side.key};
  fields[spec.side.key]=side;
 }
 return {ok:true,fields};
}
// Lignes pour le passeport : valeur, unité, source ; aucune norme inventée.
export function instrumentedRows(results={}){
 const rows=[];
 for(const id of V2_ORDER){
  const spec=INSTRUMENTED_STEPS[id];if(!spec)continue;
  const r=results[id];
  if(!r){rows.push({id,name:spec.title,status:'missing',lines:[]});continue;}
  if(r.status==='skipped'){rows.push({id,name:spec.title,status:'skipped',note:r.note||'',lines:[]});continue;}
  const f=r.fields||{},d=r.derived||{};const lines=[];
  for(const field of spec.fields)if(finite(f[field.key]))lines.push(field.label+' : '+String(f[field.key]).replace('.',',')+' '+field.unit);
  if(spec.side&&f[spec.side.key])lines.push(spec.side.label+' : '+(SIDE_OPTIONS.find(([k])=>k===f[spec.side.key])?.[1]||'—'));
  if(finite(d.gait_speed_ms))lines.push('Vitesse de marche : '+String(d.gait_speed_ms).replace('.',',')+' m/s');
  if(finite(d.lsi_pct))lines.push('Symétrie : '+String(d.lsi_pct).replace('.',',')+' %'+
   (d.weaker_side==='balanced'?' (équilibrée)':' (côté plus faible : '+(d.weaker_side==='left'?'gauche':'droit')+')'));
  rows.push({id,name:spec.title,device:spec.device,status:'done',note:r.note||'',lines});
 }
 return rows;
}
