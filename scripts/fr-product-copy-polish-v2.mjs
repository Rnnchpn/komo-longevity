import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));const site=join(root,'site','fr');

const jobs={
 'case/equipment/index.html':[
  ['6 capteurs Myodev, integrated charging, two tablets and a tripod form the portable KŌMØ setup.','Six capteurs Myodev, un système de charge intégré, deux tablettes et un trépied constituent le cœur du dispositif portable KŌMØ.'],
  ['<article class="card"><small>01</small><h3>6 capteurs Myodev</h3><p>Part of the KŌMØ portable ecosystem.</p></article>','<article class="card"><small>01</small><h3>6 capteurs Myodev</h3><p>Les capteurs fournis par Myodev constituent la couche d’acquisition instrumentée du bilan.</p></article>'],
  ['<article class="card"><small>02</small><h3>Intégrée chargers</h3><p>Part of the KŌMØ portable ecosystem.</p></article>','<article class="card"><small>02</small><h3>Charge intégrée</h3><p>L’organisation de charge est intégrée à la Case pour simplifier l’usage mobile et l’enchaînement des bilans.</p></article>'],
  ['<article class="card"><small>03</small><h3>2 tablettes</h3><p>Part of the KŌMØ portable ecosystem.</p></article>','<article class="card"><small>03</small><h3>2 tablettes</h3><p>Deux interfaces permettent de séparer acquisition, pilotage du parcours et restitution lorsque le protocole le nécessite.</p></article>'],
  ['<article class="card"><small>04</small><h3>Trépied</h3><p>Part of the KŌMØ portable ecosystem.</p></article>','<article class="card"><small>04</small><h3>Trépied</h3><p>Un support compact complète le dispositif pour les captures visuelles ou posturales prévues par le protocole.</p></article>']
 ],
 'case/workflow/index.html':[
  ['A target 20-minute pathway from setup to structured result, with timing dependent on protocol and context.','Un parcours cible d’environ 20 minutes, de l’installation à la restitution structurée, avec une durée adaptée au protocole et au contexte.'],
  ['<article class="card"><small>01</small><h3>Préparer</h3><p>Part of the KŌMØ portable ecosystem.</p></article>','<article class="card"><small>01</small><h3>Préparer</h3><p>Identifier le contexte, sélectionner le parcours et préparer les informations nécessaires au bilan.</p></article>'],
  ['<article class="card"><small>02</small><h3>Équiper</h3><p>Part of the KŌMØ portable ecosystem.</p></article>','<article class="card"><small>02</small><h3>Équiper</h3><p>Positionner les capteurs selon le protocole puis contrôler la qualité du signal avant l’acquisition.</p></article>'],
  ['<article class="card"><small>03</small><h3>Mesurer</h3><p>Part of the KŌMØ portable ecosystem.</p></article>','<article class="card"><small>03</small><h3>Mesurer</h3><p>Réaliser la marche et les tests fonctionnels prévus pour documenter plusieurs dimensions de la mobilité.</p></article>'],
  ['<article class="card"><small>04</small><h3>Restituer</h3><p>Part of the KŌMØ portable ecosystem.</p></article>','<article class="card"><small>04</small><h3>Restituer</h3><p>Structurer les données utiles dans KŌMØ Pulse afin de rendre le résultat lisible et comparable dans le temps.</p></article>']
 ],
 'case/pulse/index.html':[
  ['KŌMØ Pulse is the subscription software layer for workflow, restitution and follow-up.','KŌMØ Pulse est la couche numérique par abonnement qui organise le parcours, la restitution des résultats et le suivi longitudinal.'],
  ['<article class="card"><small>01</small><h3>Pulse access</h3><p>Part of the KŌMØ portable ecosystem.</p></article>','<article class="card"><small>01</small><h3>Accès Pulse</h3><p>L’abonnement donne accès à l’environnement numérique qui prolonge l’utilisation de la KŌMØ Case.</p></article>'],
  ['<article class="card"><small>02</small><h3>Structured workflow</h3><p>Part of the KŌMØ portable ecosystem.</p></article>','<article class="card"><small>02</small><h3>Parcours structuré</h3><p>Pulse organise les étapes du bilan pour conserver une expérience cohérente d’un site et d’un opérateur à l’autre.</p></article>'],
  ['<article class="card"><small>03</small><h3>Results</h3><p>Part of the KŌMØ portable ecosystem.</p></article>','<article class="card"><small>03</small><h3>Résultats</h3><p>Les données essentielles sont réunies dans une restitution simple, avec une séparation claire entre mesure et interprétation.</p></article>'],
  ['<article class="card"><small>04</small><h3>Longitudinal follow-up</h3><p>Part of the KŌMØ portable ecosystem.</p></article>','<article class="card"><small>04</small><h3>Suivi longitudinal</h3><p>Les évaluations successives permettent de suivre une trajectoire de mobilité plutôt qu’un résultat isolé.</p></article>']
 ],
 'partners/motion/index.html':[
  ['KŌMØ PROFESSIONAL · USAGE COMMERCIAL','KŌMØ PROFESSIONNELS · USAGE COMMERCIAL'],
  ['<h1>KŌMØ Motion<br><em>Motion</em></h1>','<h1>KŌMØ Motion<br><em>La mobilité, mesurée.</em></h1>'],
  ['<article class="card"><small>01</small><h3>Hôtels & hôtellerie</h3><p>Pensé comme un parcours KŌMØ clair et reproductible.</p></article>','<article class="card"><small>01</small><h3>Hôtels & hôtellerie</h3><p>Intégrer un bilan de mobilité à une expérience premium, dans un cadre explicitement non médical.</p></article>'],
  ['<article class="card"><small>02</small><h3>Centres de longévité</h3><p>Pensé comme un parcours KŌMØ clair et reproductible.</p></article>','<article class="card"><small>02</small><h3>Centres de longévité</h3><p>Créer un point de départ instrumenté pour structurer prévention, mouvement et progression fonctionnelle.</p></article>'],
  ['<article class="card"><small>03</small><h3>Fitness & sport</h3><p>Pensé comme un parcours KŌMØ clair et reproductible.</p></article>','<article class="card"><small>03</small><h3>Fitness & sport</h3><p>Documenter des repères fonctionnels avant d’organiser l’entraînement et d’observer leur évolution.</p></article>'],
  ['<article class="card"><small>04</small><h3>Corporate mobility programs</h3><p>Pensé comme un parcours KŌMØ clair et reproductible.</p></article>','<article class="card"><small>04</small><h3>Mobilité en entreprise</h3><p>Déployer des bilans mobiles dans des programmes de prévention, de santé au travail et de mobilité durable.</p></article>']
 ],
 'partners/clinical/index.html':[
  ['KŌMØ PROFESSIONAL · USAGE MÉDICAL','KŌMØ PROFESSIONNELS · USAGE MÉDICAL'],
  ['<h1>KŌMØ Clinical<br><em>Clinical</em></h1>','<h1>KŌMØ Clinical<br><em>La mesure, contextualisée.</em></h1>'],
  ['<article class="card"><small>01</small><h3>Physicians authorized to practice</h3><p>L’usage Clinical reste sous la responsabilité du médecin et dans le respect du cadre réglementaire local.</p></article>','<article class="card"><small>01</small><h3>Médecins autorisés à exercer</h3><p>Clinical est utilisé sous responsabilité médicale, par un praticien autorisé à exercer dans son territoire.</p></article>'],
  ['<article class="card"><small>02</small><h3>Medical organizations</h3><p>L’usage Clinical reste sous la responsabilité du médecin et dans le respect du cadre réglementaire local.</p></article>','<article class="card"><small>02</small><h3>Structures médicales</h3><p>Le parcours peut être intégré dans une clinique ou une structure de soins lorsque son organisation respecte le droit local.</p></article>'],
  ['<article class="card"><small>03</small><h3>Professional interpretation</h3><p>L’usage Clinical reste sous la responsabilité du médecin et dans le respect du cadre réglementaire local.</p></article>','<article class="card"><small>03</small><h3>Interprétation clinique</h3><p>Les mesures sont replacées dans le contexte du patient par le professionnel ; KŌMØ ne produit pas de diagnostic autonome.</p></article>'],
  ['<article class="card"><small>04</small><h3>Futures KŌMØ Longevity Clinics</h3><p>L’usage Clinical reste sous la responsabilité du médecin et dans le respect du cadre réglementaire local.</p></article>','<article class="card"><small>04</small><h3>Futures KŌMØ Longevity Clinics</h3><p>À terme, les Clinics démontreront le même standard dans des lieux conçus autour de la longévité locomotrice.</p></article>']
 ],
 'partners/deployment/index.html':[
  ['KŌMØ PROFESSIONAL · DEPLOYMENT','KŌMØ PROFESSIONNELS · DÉPLOIEMENT'],
  ['<h1>Déploiement<br><em>KŌMØ</em></h1>','<h1>Déployer KŌMØ.<br><em>Simplement.</em></h1>'],
  ['<article class="card"><small>01</small><h3>Acquire a KŌMØ Case</h3><p>Pensé comme un parcours KŌMØ clair et reproductible.</p></article>','<article class="card"><small>01</small><h3>Acquérir une KŌMØ Case</h3><p>Le matériel standardise le point de départ : capteurs, tablettes, charge et accessoires réunis dans une seule Case.</p></article>'],
  ['<article class="card"><small>02</small><h3>Onboarding & protocol</h3><p>Pensé comme un parcours KŌMØ clair et reproductible.</p></article>','<article class="card"><small>02</small><h3>Mise en route & protocole</h3><p>L’onboarding prépare l’équipe, le workflow et le niveau d’usage Motion ou Clinical adapté à la structure.</p></article>'],
  ['<article class="card"><small>03</small><h3>Abonnement Pulse</h3><p>Pensé comme un parcours KŌMØ clair et reproductible.</p></article>','<article class="card"><small>03</small><h3>Abonnement Pulse</h3><p>Pulse apporte la continuité numérique : parcours, restitution des résultats et suivi longitudinal.</p></article>'],
  ['<article class="card"><small>04</small><h3>Join KŌMØ Réseau when eligible</h3><p>Pensé comme un parcours KŌMØ clair et reproductible.</p></article>','<article class="card"><small>04</small><h3>Rejoindre le Réseau KŌMØ</h3><p>Les structures répondant aux critères KŌMØ pourront être référencées dans l’annuaire public du réseau.</p></article>']
 ]
};

for(const [rel,repls] of Object.entries(jobs)){const f=join(site,rel);let h;try{h=await readFile(f,'utf8')}catch{continue}for(const [a,b] of repls)h=h.replaceAll(a,b);await writeFile(f,h,'utf8');console.log(`[fr-product-copy-polish-v2] ${rel}`)}
