import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const site=join(process.cwd(),'site');
const files=[join(site,'fr','index.html'),join(site,'fr','methode','index.html'),join(site,'fr','bilan','index.html'),join(site,'fr','pulse','index.html')];
const repl=[
 ['Évaluation Motion','Évaluation fonctionnelle'],
 ['Consultation Clinical','Consultation médicale'],
 ['Le profil Motion','Le profil fonctionnel'],
 ['profil Motion','profil fonctionnel'],
 ['MOTION PROFILE','PROFIL DE MOBILITÉ'],
 ['Muscle Signature','Signature musculaire'],
 ['Le parcours KŌMØ Clinical est conçu','Le parcours KŌMØ sur 12 mois est conçu'],
 ['Le parcours Clinical rassemble','Le parcours médical KŌMØ rassemble'],
 ['Ce que comprend le parcours Clinical.','Ce que comprend le parcours sur 12 mois.'],
 ['Baseline','Bilan initial'],
 ['Commencer mon pré-bilan','Commencer mon premier repère'],
 ['En Clinical, un médecin interprète le contexte.','Lorsqu’il s’agit d’un parcours médical, un médecin interprète le contexte.'],
 ['Motion mesure. Clinical contextualise et décide. Pulse conserve la trajectoire.','L’évaluation fonctionnelle mesure. La consultation médicale contextualise et décide. Pulse conserve la trajectoire.'],
 ['lorsqu’une couche Clinical est ajoutée','lorsqu’une consultation médicale est ajoutée'],
 ['Pré-bilan, Motion, consultation Clinical lorsqu’indiquée et trois priorités.','Pré-bilan, évaluation fonctionnelle, consultation médicale lorsqu’indiquée et trois priorités.'],
 ['Préparation Pulse + mesure Motion + interprétation médicale selon indication','Préparation Pulse + évaluation fonctionnelle + interprétation médicale selon indication']
];
for(const f of files){let h=await readFile(f,'utf8');for(const [a,b] of repl)h=h.replaceAll(a,b);if(f.endsWith('/pulse/index.html'))h=h.replace('Pulse prépare le bilan avant votre arrivée, rassemble les résultats après l’évaluation et devient le fil conducteur de votre trajectoire pendant 12 mois.','Pulse prépare le bilan avant votre arrivée, rassemble les résultats après l’évaluation et devient le fil conducteur de votre trajectoire pendant 12 mois. Le premier repère public est disponible dès maintenant ; la pré-évaluation complète sera activée avec le parcours clinique.');await writeFile(f,h,'utf8')}
// Patient-friendly title and metadata for the assessment page.
{
 const f=join(site,'fr','bilan','index.html');let h=await readFile(f,'utf8');
 h=h.replace(/<title>[\s\S]*?<\/title>/i,'<title>Votre bilan KŌMØ | Bilan locomoteur & suivi 12 mois</title>')
   .replace(/<meta name="description" content="[^"]*">/i,'<meta name="description" content="Préparation Pulse, évaluation fonctionnelle, consultation médicale, résultat et suivi sur 12 mois : le parcours patient KŌMØ expliqué simplement.">')
   .replace(/<meta property="og:title" content="[^"]*">/i,'<meta property="og:title" content="Votre bilan KŌMØ | Bilan locomoteur & suivi 12 mois">')
   .replace(/<meta property="og:description" content="[^"]*">/i,'<meta property="og:description" content="Préparation Pulse, évaluation fonctionnelle, consultation médicale, résultat et suivi sur 12 mois.">');
 await writeFile(f,h,'utf8');
}
// Synchronize homepage social metadata and structured description with the patient-first positioning.
{
 const f=join(site,'fr','index.html');let h=await readFile(f,'utf8');
 h=h.replace(/<meta property="og:title" content="[^"]*">/i,'<meta property="og:title" content="KŌMØ Longevity | Bilan locomoteur, Pulse & suivi">')
   .replace(/<meta property="og:description" content="[^"]*">/i,'<meta property="og:description" content="Pré-évaluation Pulse, mobilité, performance, équilibre, analyse musculaire Myodev/Myocare et suivi de la trajectoire sur 12 mois.">')
   .replace('"name":"KŌMØ | Test de mobilité, bilan locomoteur & longévité"','"name":"KŌMØ Longevity | Bilan locomoteur, Pulse & suivi"')
   .replace('"description":"Testez votre mobilité gratuitement avec KŌMØ Pulse, puis approfondissez avec un bilan locomoteur mobile de la marche, du muscle, de l’équilibre et de la posture."','"description":"KŌMØ propose un parcours patient de mobilité avec pré-évaluation Pulse, évaluation fonctionnelle, contexte médical lorsqu’indiqué et suivi longitudinal sur 12 mois."');
 await writeFile(f,h,'utf8');
}
// Synchronize Pulse social metadata.
{
 const f=join(site,'fr','pulse','index.html');let h=await readFile(f,'utf8');
 h=h.replace(/<meta property="og:title" content="[^"]*">/i,'<meta property="og:title" content="KŌMØ Pulse | Préparation, résultats & suivi sur 12 mois">')
   .replace(/<meta property="og:description" content="[^"]*">/i,'<meta property="og:description" content="Pulse prépare votre bilan, rassemble vos résultats et suit votre trajectoire de mobilité pendant 12 mois.">');
 await writeFile(f,h,'utf8');
}
// Patient pages deserve pillar-page priority in the generated sitemap.
try{const f=join(site,'sitemap.xml');let x=await readFile(f,'utf8');for(const p of ['/method/','/assessment/','/fr/methode/','/fr/bilan/','/es/metodo/','/es/evaluacion/'])x=x.replace(`<loc>https://komolongevity.com${p}</loc><priority>0.5</priority>`,`<loc>https://komolongevity.com${p}</loc><priority>0.8</priority>`);await writeFile(f,x,'utf8')}catch{}
console.log('[patient-vitrine-polish-v1] patient language, social metadata and pillar priorities polished.');