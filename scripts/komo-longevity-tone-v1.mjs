import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site = join(process.cwd(),'site');

async function patch(rel,repls){
  const fp = join(site,rel);
  try { await access(fp); } catch { return; }
  let html = await readFile(fp,'utf8');
  for (const [a,b] of repls) html = html.split(a).join(b);
  await writeFile(fp,html,'utf8');
}

// French homepage: establish the desired KŌMØ voice immediately.
await patch('index.html',[
  ['KŌMØ MOTION · ÉVALUATION FONCTIONNELLE','KŌMØ LONGEVITY'],
  ['Évaluation fonctionnelle de la marche, de l’équilibre et de la force','Bienvenue chez KŌMØ Longevity'],
  ['Le bilan associe un questionnaire locomoteur, des tests fonctionnels standardisés et des mesures par capteurs. Les résultats sont analysés puis restitués avec les principales données fonctionnelles et les modalités de suivi.','La plateforme de mesure de votre longévité locomotrice. Découvrez nos solutions pour comprendre votre mouvement, mesurer vos capacités fonctionnelles et intégrer ces données dans votre suivi de santé.'],
  ['Prendre rendez-vous','Découvrir Motion'],
  ['Contenu du bilan','Découvrir nos solutions'],
  ['COMPTE RENDU','NOS SOLUTIONS'],
  ['Une synthèse fonctionnelle structurée','Mesurer, comprendre et suivre votre mouvement'],
  ['Les données sont regroupées dans un compte rendu destiné à documenter la fonction locomotrice et à faciliter la comparaison lors des réévaluations.','KŌMØ associe mesure fonctionnelle, analyse musculaire, questionnaires et suivi longitudinal. Chaque solution répond à un niveau différent de compréhension et d’accompagnement.'],
  ['Profil fonctionnel','KŌMØ Motion'],
  ['Synthèse des principales mesures recueillies au cours du bilan.','Le check-up du mouvement : activité musculaire, posture, marche, équilibre, force et mobilité.'],
  ['Points d’attention','KŌMØ Clinical'],
  ['Éléments fonctionnels à prendre en compte dans les recommandations et le suivi.','Le volet médical : consultation, questionnaires personnalisés et jusqu’à 150 biomarqueurs intégrés selon l’indication.'],
  ['Recommandations','Résultats compréhensibles'],
  ['Recommandations fonctionnelles adaptées aux résultats et aux objectifs déclarés.','Une restitution claire avec vos résultats, vos principaux repères et les prochaines étapes de votre suivi.'],
  ['Suivi longitudinal','Votre trajectoire KŌMØ'],
  ['Les résultats sont conservés dans Pulse afin de permettre leur consultation et leur comparaison dans le temps.','Vos résultats sont centralisés dans Pulse pour suivre votre évolution et retrouver immédiatement votre trajectoire.'],
  ['DOMAINES ÉVALUÉS','KŌMØ MOTION'],
  ['Principales composantes de la fonction locomotrice','Le check-up de votre mouvement'],
  ['Paramètres recueillis au cours de la marche.','Analyse de votre marche et de votre dynamique locomotrice.'],
  ['Contrôle postural et stabilité lors des tests.','Évaluation de votre équilibre et de votre contrôle postural.'],
  ['Performance lors des tâches fonctionnelles de force.','Mesure de votre force fonctionnelle.'],
  ['Amplitude et qualité des mouvements observés.','Évaluation de votre mobilité et de la qualité de vos mouvements.'],
  ['Activité musculaire enregistrée pendant les tâches évaluées.','Analyse de votre activité musculaire pendant les tests.'],
  ['DÉROULEMENT','VOTRE CHECK-UP'],
  ['Déroulement du bilan KŌMØ Motion','Un bilan complet en plusieurs étapes'],
  ['Pré-bilan','Questionnaires'],
  ['Recueil du contexte, des objectifs et du questionnaire GLFS-25.','Questionnaires fonctionnels et recueil de votre contexte.'],
  ['Tests','Mesures'],
  ['Stand-Up Test, Two-Step Test, marche sur 4 mètres et acquisition par 6 capteurs.','Tests fonctionnels, marche, posture et acquisition musculaire par capteurs.'],
  ['Interprétation','Analyse'],
  ['Les résultats sont analysés dans leur contexte fonctionnel puis présentés au participant.','Les données sont analysées et synthétisées dans votre profil KŌMØ.'],
  ['Suivi','Résultats'],
  ['Le compte rendu et les éléments de suivi sont accessibles dans Pulse.','Vous retrouvez vos résultats, votre Motion Score, votre Motion Age et votre suivi dans Pulse.'],
  ['Bilan KŌMØ Motion','Découvrez KŌMØ Motion'],
  ['Motion est une évaluation fonctionnelle non diagnostique. Lorsqu’une indication médicale existe, la consultation et l’interprétation clinique relèvent de KŌMØ Clinical.','Motion mesure votre fonction locomotrice. Clinical complète l’évaluation lorsqu’une consultation médicale, des examens complémentaires ou une analyse plus large de votre santé sont indiqués.'],
  ['Services complémentaires','Découvrez l’écosystème KŌMØ'],
  ['Les services KŌMØ sont proposés selon le contexte, les résultats et le niveau d’accompagnement requis.','Motion, Clinical, Pulse, World, Yachting et Signature s’intègrent dans un même environnement pour mesurer, comprendre et suivre votre santé locomotrice.'],
  ['Méthode et suivi','Mesure et suivi'],
  ['Le protocole associe questionnaires, tests fonctionnels et mesures instrumentées. Les mêmes éléments peuvent être réévalués afin de documenter l’évolution dans le temps.','Les mêmes mesures peuvent être répétées au fil du temps pour suivre l’évolution de votre profil fonctionnel.'],
  ['Informations pratiques','Questions fréquentes'],
  ['Bilan fonctionnel KŌMØ Motion','Commencez par votre bilan KŌMØ'],
  ['Le bilan documente la fonction locomotrice à un instant donné et fournit une base de comparaison pour les évaluations ultérieures.','Motion constitue le point d’entrée KŌMØ pour mesurer votre mouvement, comprendre vos résultats et organiser la suite de votre suivi.']
]);

// Motion page.
await patch('fr/motion/index.html',[
  ['KŌMØ MOTION · ÉVALUATION FONCTIONNELLE','KŌMØ MOTION'],
  ['Évaluation fonctionnelle de la marche, de l’équilibre et de la force','Le check-up de votre mouvement'],
  ['Le bilan associe un questionnaire locomoteur, des tests fonctionnels standardisés et des mesures par capteurs. Les résultats sont analysés puis restitués avec les principales données fonctionnelles et les modalités de suivi.','Motion mesure votre activité musculaire, votre posture, votre marche, votre équilibre, votre force et votre mobilité. Les données sont regroupées dans une restitution simple, accessible dans Pulse et comparable dans le temps.'],
  ['COMPTE RENDU','VOS RÉSULTATS'],
  ['Une synthèse fonctionnelle structurée','Des résultats immédiatement compréhensibles'],
  ['Les données sont regroupées dans un compte rendu destiné à documenter la fonction locomotrice et à faciliter la comparaison lors des réévaluations.','Chaque bilan fournit une synthèse de votre fonction locomotrice, vos principaux repères et les éléments à suivre lors des prochaines évaluations.'],
  ['DOMAINES ÉVALUÉS','CE QUE MOTION MESURE'],
  ['Principales composantes de la fonction locomotrice','Marche, posture, force, équilibre, mobilité et activité musculaire'],
  ['DÉROULEMENT','COMMENT SE DÉROULE LE BILAN'],
  ['Déroulement du bilan KŌMØ Motion','Questionnaires, tests, capteurs, analyse et restitution'],
  ['RÉSULTATS','VOTRE PROFIL KŌMØ'],
  ['Compte rendu et suivi','Motion Score, Motion Age et suivi longitudinal'],
  ['La restitution rassemble les résultats du bilan, les repères KŌMØ et les recommandations fonctionnelles retenues.','Votre profil rassemble les résultats du bilan, Motion Score, Motion Age, les principaux paramètres fonctionnels et les recommandations associées.']
]);

// Clinical page.
await patch('fr/clinical/index.html',[
  ['Consultation médicale et évaluation locomotrice','KŌMØ Clinical'],
  ['KŌMØ Clinical est le volet médical du dispositif. Il comprend une consultation, un examen clinique orienté et l’interprétation des données fonctionnelles lorsque leur utilisation est médicalement indiquée. Les décisions diagnostiques et thérapeutiques relèvent du médecin.','Clinical associe l’évaluation du mouvement à une consultation médicale, des questionnaires personnalisés et jusqu’à 150 biomarqueurs intégrés selon l’indication. L’objectif est de replacer votre fonction locomotrice dans une lecture plus globale de votre santé.'],
  ['Prendre rendez-vous','Découvrir Clinical'],
  ['Anamnèse','Consultation'],
  ['Antécédents, symptômes, évolution fonctionnelle, traitements en cours et objectifs de consultation.','Analyse de vos antécédents, symptômes, traitements, objectifs et contexte fonctionnel.'],
  ['Examen clinique','Évaluation clinique'],
  ['Examen clinique orienté en fonction du motif de consultation et des constatations initiales.','Examen médical orienté selon votre situation et les résultats fonctionnels disponibles.'],
  ['Analyse fonctionnelle','Mouvement'],
  ['Interprétation des tests fonctionnels et des mesures instrumentées dans le contexte clinique.','Interprétation de la marche, de la posture, de la force, de l’équilibre et de l’activité musculaire.'],
  ['Examens complémentaires','Biomarqueurs'],
  ['Biologie, imagerie ou autre examen complémentaire uniquement lorsqu’une indication médicale le justifie.','Jusqu’à 150 biomarqueurs intégrés selon l’indication, complétés si nécessaire par d’autres examens.'],
  ['Prise en charge','Trajectoire'],
  ['Recommandations, rééducation, orientation, surveillance ou prise en charge adaptée à la situation clinique.','Restitution des résultats, recommandations et organisation de la suite du suivi médical ou fonctionnel.']
]);

// Signature, Experience, Yachting, World: keep the same voice.
await patch('fr/signature/index.html',[
  ['Programme privé coordonné','KŌMØ Signature'],
  ['KŌMØ Signature organise un programme individualisé à partir du bilan fonctionnel, des objectifs, du lieu d’intervention et, lorsque cela est indiqué, des professionnels impliqués. Le contenu est défini avant le début du programme.','Signature réunit les solutions KŌMØ nécessaires autour d’un même objectif : bilan, suivi, Clinical lorsque nécessaire et interventions sur site. Le programme est défini à partir de vos résultats et de vos besoins.']
]);

await patch('fr/experience/index.html',[
  ['Évaluations KŌMØ sur site','KŌMØ Anywhere'],
  ['Les bilans KŌMØ peuvent être réalisés hors d’un centre fixe lorsque les conditions de mesure sont adaptées : yacht, hôtel, domicile, entreprise ou retreat. Le protocole, la restitution et le suivi restent identiques.','KŌMØ peut réaliser Motion et organiser le suivi directement là où vous vous trouvez : yacht, hôtel, domicile, entreprise ou retreat. Vous conservez le même protocole, les mêmes résultats et le même accès à Pulse.']
]);

await patch('fr/yachting/index.html',[
  ['Évaluation fonctionnelle KŌMØ à bord','KŌMØ Yachting'],
  ['KŌMØ réalise à bord une évaluation fonctionnelle standardisée avec son équipe et son matériel. La session comprend les mesures, une restitution individuelle et l’accès aux résultats dans Pulse.','KŌMØ Yachting apporte Motion directement à bord : analyse du mouvement, activité musculaire, posture, marche et restitution individuelle dans Pulse. Clinical peut compléter le dispositif lorsque cela est médicalement indiqué.']
]);

await patch('fr/world/index.html',[
  ['World : modules numériques associés au suivi KŌMØ','KŌMØ World'],
  ['World regroupe des modules numériques complémentaires au suivi KŌMØ. Les résultats, comptes rendus et rendez-vous restent centralisés dans Pulse. L’interface 3D est facultative.','World prolonge votre suivi KŌMØ avec des modules de visualisation, d’exercice et de contenu personnalisés. Pulse reste l’espace principal pour vos résultats, vos rendez-vous et votre trajectoire.']
]);


// Final French homepage copy cleanup: keep the intended KŌMØ Longevity voice exact.
await patch('index.html',[
  ['Le bilan associe un questionnaire locomoteur, des tests standardisés standardisés et des mesures par capteurs. Les résultats sont analysés puis restitués avec les principales données fonctionnelles et les modalités de suivi.','La plateforme de mesure de votre longévité locomotrice. Découvrez nos solutions fonctionnelles et médicales pour comprendre votre mouvement, mesurer vos capacités et intégrer ces données dans votre suivi de santé.'],
  ['Résultats compréhensibles fonctionnelles adaptées aux résultats et aux objectifs déclarés.','Une restitution claire avec vos résultats, vos principaux repères et les prochaines étapes de votre suivi.'],
  ['Questionnaires de réserver','Questions fréquentes'],
  ['Questionnaires, tests standardisés et mesure instrumentée sont utilisés pour produire une restitution compréhensible et suivre l’évolution dans le temps.','Questionnaires, tests fonctionnels et mesures instrumentées permettent de documenter votre fonction locomotrice et son évolution dans le temps.'],
  ['Motion, Clinical, Pulse, World, Yachting et Signature s’intègrent dans un même environnement pour mesurer, comprendre et suivre votre santé locomotrice.','Motion, Clinical, Pulse, World, Yachting et Signature s’intègrent dans un même environnement pour mesurer votre fonction locomotrice, comprendre vos résultats et suivre votre évolution.'],
  ['Vos résultats sont centralisés dans Pulse pour suivre votre évolution et retrouver immédiatement votre trajectoire.','Pulse centralise vos résultats et permet d’identifier immédiatement votre trajectoire KŌMØ et les prochaines étapes de votre suivi.']
]);

await patch('fr/motion/index.html',[
  ['tests standardisés standardisés','tests fonctionnels standardisés'],
  ['Une restitution claire avec vos résultats, vos principaux repères et les prochaines étapes de votre suivi.','Une restitution claire présente vos résultats, vos principaux repères fonctionnels et les éléments à suivre dans le temps.']
]);

await patch('fr/clinical/index.html',[
  ['Clinical associe l’évaluation du mouvement à une consultation médicale, des questionnaires personnalisés et jusqu’à 150 biomarqueurs intégrés selon l’indication. L’objectif est de replacer votre fonction locomotrice dans une lecture plus globale de votre santé.','Clinical associe l’évaluation du mouvement à une consultation médicale, des questionnaires personnalisés et jusqu’à 150 biomarqueurs intégrés selon l’indication. Les résultats fonctionnels et biologiques sont interprétés ensemble afin de replacer votre mobilité dans une lecture plus globale de votre santé.']
]);

console.log('[komo-longevity-tone-v1] PASS · institutional longevity tone applied.');
