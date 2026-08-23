import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));const site=join(root,'site');
const cfg={
 fr:{base:'fr',pages:{
  'case/equipment/index.html':['KŌMØ Case · Équipement | 6 capteurs, tablettes & trépied','Découvrez le contenu de KŌMØ Case : six capteurs Myodev, système de charge intégré, deux tablettes et trépied pour un bilan locomoteur mobile standardisé.'],
  'case/workflow/index.html':['KŌMØ Case · Workflow | Bilan locomoteur mobile en ~20 min','Découvrez le workflow KŌMØ Case : préparation, pose des capteurs, marche, tests fonctionnels et restitution structurée dans KŌMØ Pulse, avec un parcours cible d’environ 20 minutes.'],
  'case/pulse/index.html':['KŌMØ Case + Pulse | Résultats & suivi de mobilité','KŌMØ Pulse prolonge KŌMØ Case en réunissant restitution, résultats et suivi longitudinal de la mobilité dans une plateforme numérique accessible par abonnement.'],
  'partners/motion/index.html':['KŌMØ Motion pour hôtels, fitness & entreprises','KŌMØ Motion permet aux hôtels, centres de longévité non médicaux, clubs fitness et entreprises de proposer un bilan instrumenté de mobilité avec Case et Pulse.'],
  'partners/clinical/index.html':['KŌMØ Clinical pour médecins & structures médicales','KŌMØ Clinical est le parcours médical de KŌMØ pour les médecins et structures de soins : évaluation locomotrice, interprétation clinique et suivi via Pulse.'],
  'partners/deployment/index.html':['Déployer KŌMØ | Case, onboarding & abonnement Pulse','Découvrez comment déployer KŌMØ : acquisition d’une KŌMØ Case, onboarding, protocole, formation et accès par abonnement à KŌMØ Pulse.'],
  'network/france/index.html':['Réseau KŌMØ France | Praticiens & centres équipés','Trouvez les praticiens et centres KŌMØ en France grâce à un annuaire et une carte interactive, avec statut, ville, spécialité et équipement vérifiés.']
 }},
 en:{base:'',pages:{
  'case/equipment/index.html':['KŌMØ Case · Equipment | Sensors, tablets & tripod','Explore KŌMØ Case equipment: six Myodev sensors, integrated charging, two tablets and a tripod for a standardized portable locomotor assessment workflow.'],
  'case/workflow/index.html':['KŌMØ Case · Workflow | ~20-minute locomotor assessment','Explore the KŌMØ Case workflow from preparation and sensor placement to gait, functional tests and structured KŌMØ Pulse restitution in a target ~20-minute pathway.'],
  'case/pulse/index.html':['KŌMØ Case + Pulse | Mobility results & follow-up','KŌMØ Pulse extends KŌMØ Case with structured restitution, results and longitudinal mobility follow-up through a subscription-based digital platform.'],
  'partners/motion/index.html':['KŌMØ Motion for hotels, fitness & companies','KŌMØ Motion helps hotels, non-medical longevity centers, fitness clubs and companies offer instrumented mobility assessments with Case and Pulse.'],
  'partners/clinical/index.html':['KŌMØ Clinical for physicians & medical settings','KŌMØ Clinical is the medical KŌMØ pathway for physicians and medical settings, combining locomotor assessment, clinical interpretation and Pulse follow-up.'],
  'partners/deployment/index.html':['Deploy KŌMØ | Case, onboarding & Pulse subscription','See how to deploy KŌMØ through KŌMØ Case acquisition, onboarding, protocol setup, training and subscription access to KŌMØ Pulse.'],
  'network/france/index.html':['KŌMØ Network France | Equipped practitioners & centers','Find KŌMØ practitioners and centers in France through an interactive map and directory with verified location, specialty and network status.']
 }},
 es:{base:'es',pages:{
  'case/equipment/index.html':['KŌMØ Case · Equipamiento | Sensores, tabletas y trípode','Descubra el equipamiento KŌMØ Case: seis sensores Myodev, carga integrada, dos tabletas y trípode para una evaluación locomotora portátil estandarizada.'],
  'case/workflow/index.html':['KŌMØ Case · Workflow | Evaluación locomotora en ~20 min','Descubra el flujo KŌMØ Case desde la preparación y colocación de sensores hasta marcha, pruebas funcionales y restitución estructurada en KŌMØ Pulse.'],
  'case/pulse/index.html':['KŌMØ Case + Pulse | Resultados y seguimiento de movilidad','KŌMØ Pulse prolonga KŌMØ Case con restitución, resultados y seguimiento longitudinal de la movilidad mediante una plataforma digital por suscripción.'],
  'partners/motion/index.html':['KŌMØ Motion para hoteles, fitness y empresas','KŌMØ Motion permite a hoteles, centros de longevidad no médicos, clubes fitness y empresas ofrecer evaluaciones instrumentadas de movilidad con Case y Pulse.'],
  'partners/clinical/index.html':['KŌMØ Clinical para médicos y estructuras sanitarias','KŌMØ Clinical es el recorrido médico KŌMØ para médicos y estructuras sanitarias, con evaluación locomotora, interpretación clínica y seguimiento en Pulse.'],
  'partners/deployment/index.html':['Desplegar KŌMØ | Case, onboarding y suscripción Pulse','Descubra cómo desplegar KŌMØ mediante adquisición de KŌMØ Case, onboarding, protocolo, formación y acceso por suscripción a KŌMØ Pulse.'],
  'network/france/index.html':['Red KŌMØ Francia | Profesionales y centros equipados','Encuentre profesionales y centros KŌMØ en Francia mediante mapa interactivo y directorio con ubicación, especialidad y estatus de red verificados.']
 }}
};
function meta(h,name,value,prop=false){const a=prop?'property':'name',rx=new RegExp(`<meta\\s+${a}=["']${name}["'][^>]*>`,'i'),tag=`<meta ${a}="${name}" content="${value.replace(/"/g,'&quot;')}">`;return rx.test(h)?h.replace(rx,tag):h.replace('</head>',`${tag}</head>`)}
for(const c of Object.values(cfg))for(const [rel,[title,desc]] of Object.entries(c.pages)){const f=join(site,c.base,rel);let h;try{h=await readFile(f,'utf8')}catch{continue}h=h.replace(/<title>[\s\S]*?<\/title>/i,`<title>${title}</title>`);h=meta(h,'description',desc);h=meta(h,'og:title',title,true);h=meta(h,'og:description',desc,true);await writeFile(f,h,'utf8')}
console.log('[seo-subpages-v1] distinct subpage metadata applied');
