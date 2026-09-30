import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site=join(process.cwd(),'site');

async function patch(rel,repls){
  const fp=join(site,rel);
  try{await access(fp)}catch{return}
  let html=await readFile(fp,'utf8');
  for(const [a,b] of repls) html=html.split(a).join(b);
  await writeFile(fp,html,'utf8');
}

const frCommon=[
 ['KŌMØ · BILAN DU MOUVEMENT','KŌMØ MOTION · ÉVALUATION FONCTIONNELLE'],
 ['Un bilan pour comprendre votre mobilité et savoir quoi améliorer','Évaluation fonctionnelle de la marche, de l’équilibre et de la force'],
 ['KŌMØ évalue votre marche, votre équilibre, votre force, votre mobilité et votre activité musculaire. Vous repartez avec un point de référence, trois priorités et un plan clair.','Le bilan associe un questionnaire locomoteur, des tests fonctionnels standardisés et des mesures par capteurs. Les résultats sont analysés puis restitués avec les principales données fonctionnelles et les modalités de suivi.'],
 ['Réserver mon bilan','Prendre rendez-vous'],
 ['Voir le déroulé','Contenu du bilan'],
 ['indicateurs de l’analyse musculaire','paramètres musculaires analysés'],
 ['tests fonctionnels','tests standardisés'],
 ['CE QUE LE BILAN VOUS APPORTE','COMPTE RENDU'],
 ['Des résultats qui débouchent sur des décisions simples','Une synthèse fonctionnelle structurée'],
 ['Le bilan transforme les mesures en informations utiles : où vous en êtes, ce qui compte le plus maintenant et quoi faire ensuite.','Les données sont regroupées dans un compte rendu destiné à documenter la fonction locomotrice et à faciliter la comparaison lors des réévaluations.'],
 ['Votre point de référence','Profil fonctionnel'],
 ['Une lecture fonctionnelle de votre mobilité au moment du bilan.','Synthèse des principales mesures recueillies au cours du bilan.'],
 ['Vos 3 priorités','Points d’attention'],
 ['Les éléments les plus utiles à travailler, surveiller ou réévaluer.','Éléments fonctionnels à prendre en compte dans les recommandations et le suivi.'],
 ['Votre plan','Recommandations'],
 ['Les prochaines actions proposées selon votre profil et vos objectifs.','Recommandations fonctionnelles adaptées aux résultats et aux objectifs déclarés.'],
 ['Votre suivi','Suivi longitudinal'],
 ['Vos résultats restent accessibles dans Pulse pour pouvoir les comparer plus tard.','Les résultats sont conservés dans Pulse afin de permettre leur consultation et leur comparaison dans le temps.'],
 ['CE QUE NOUS MESURONS','DOMAINES ÉVALUÉS'],
 ['Cinq dimensions faciles à comprendre','Principales composantes de la fonction locomotrice'],
 ['Comment vous vous déplacez.','Paramètres recueillis au cours de la marche.'],
 ['Comment vous vous stabilisez.','Contrôle postural et stabilité lors des tests.'],
 ['Comment vous produisez un effort utile.','Performance lors des tâches fonctionnelles de force.'],
 ['Comment vos articulations et votre corps se déplacent.','Amplitude et qualité des mouvements observés.'],
 ['Comment certains muscles s’activent pendant les tâches mesurées.','Activité musculaire enregistrée pendant les tâches évaluées.'],
 ['VOTRE RENDEZ-VOUS','DÉROULEMENT'],
 ['Le bilan, étape par étape','Déroulement du bilan KŌMØ Motion'],
 ['Avant','Pré-bilan'],
 ['Vous renseignez votre contexte et le questionnaire GLFS-25.','Recueil du contexte, des objectifs et du questionnaire GLFS-25.'],
 ['Pendant','Tests'],
 ['Stand-Up Test, Two-Step Test, marche sur 4 mètres et analyse par 6 capteurs.','Stand-Up Test, Two-Step Test, marche sur 4 mètres et acquisition par 6 capteurs.'],
 ['Restitution','Interprétation'],
 ['Les résultats sont expliqués sans jargon et replacés dans votre situation.','Les résultats sont analysés dans leur contexte fonctionnel puis présentés au participant.'],
 ['Après','Suivi'],
 ['Vous recevez vos priorités, votre plan et votre suivi dans Pulse.','Le compte rendu et les éléments de suivi sont accessibles dans Pulse.'],
 ['CE QUE VOUS RECEVEZ','RÉSULTATS'],
 ['À la fin, vous savez quoi retenir','Compte rendu et suivi'],
 ['Le bilan ne se termine pas par un tableau de chiffres. Il se termine par une lecture claire de votre profil et des prochaines actions utiles.','La restitution rassemble les résultats du bilan, les repères KŌMØ et les recommandations fonctionnelles retenues.'],
 ['Votre profil','Synthèse fonctionnelle'],
 ['Les principaux résultats du bilan réunis dans une synthèse.','Principales données recueillies et résultats des tests.'],
 ['Les points qui méritent le plus votre attention maintenant.','Éléments fonctionnels retenus pour le suivi.'],
 ['Deux repères KŌMØ pour visualiser et suivre votre profil fonctionnel.','Repères propriétaires KŌMØ destinés au suivi longitudinal du profil fonctionnel.'],
 ['Les prochaines actions proposées selon votre situation.','Recommandations fonctionnelles proposées à partir des résultats.'],
 ['Votre espace personnel pour retrouver résultats, programme et réévaluation.','Espace personnel regroupant résultats, recommandations et réévaluations.'],
 ['Votre premier bilan KŌMØ','Bilan KŌMØ Motion'],
 ['Commencez par Motion pour établir votre point de référence. Si votre situation nécessite une consultation médicale, KŌMØ Clinical constitue un parcours distinct.','Motion est une évaluation fonctionnelle non diagnostique. Lorsqu’une indication médicale existe, la consultation et l’interprétation clinique relèvent de KŌMØ Clinical.'],
 ['Réserver Motion','Prendre rendez-vous']
];

for(const rel of ['index.html','fr/motion/index.html']) await patch(rel,frCommon);

await patch('index.html',[
 ['Et ensuite, seulement si vous en avez besoin','Services complémentaires'],
 ['Motion reste le point de départ fonctionnel. Les autres services répondent à des besoins différents.','Les services KŌMØ sont proposés selon le contexte, les résultats et le niveau d’accompagnement requis.'],
 ['Une méthode structurée de l’évaluation au suivi','Méthode et suivi'],
 ['Questionnaires, tests fonctionnels et mesure instrumentée sont utilisés pour produire une restitution compréhensible et suivre l’évolution dans le temps.','Le protocole associe questionnaires, tests fonctionnels et mesures instrumentées. Les mêmes éléments peuvent être réévalués afin de documenter l’évolution dans le temps.'],
 ['Avant de réserver','Informations pratiques'],
 ['Déployer KŌMØ dans votre établissement','KŌMØ pour les établissements et partenaires'],
 ['KŌMØ peut d’abord intervenir avec son équipe et son matériel. La Case devient pertinente seulement lorsqu’un déploiement permanent est justifié.','KŌMØ peut réaliser les bilans sur site avec son équipe et son matériel. Une installation permanente de la Case peut être étudiée lorsque le volume d’activité le justifie.'],
 ['Établir votre point de référence','Bilan fonctionnel KŌMØ Motion'],
 ['Le premier bilan permet de savoir où vous en êtes aujourd’hui et de décider de la suite sur des données plus claires.','Le bilan documente la fonction locomotrice à un instant donné et fournit une base de comparaison pour les évaluations ultérieures.'],
 ['KŌMØ PULSE conserve vos résultats, vos priorités, votre plan et vos réévaluations.','KŌMØ Pulse centralise les résultats, les recommandations et les réévaluations.'],
 ['KŌMØ WORLD · OPTIONNEL prolonge le programme avec des contenus et modules interactifs. La 3D n’est jamais obligatoire.','KŌMØ World propose des modules numériques complémentaires. Leur utilisation est optionnelle ; les résultats et le suivi restent accessibles dans Pulse. La 3D n’est jamais obligatoire.'],
 ['KŌMØ Anywhere à bord : évaluation privée, restitution et suivi pour owners, guests et partenaires yacht.','KŌMØ Yachting permet de réaliser l’évaluation fonctionnelle à bord, avec restitution individuelle et suivi dans Pulse.']
]);

await patch('fr/clinical/index.html',[
 ['Consultation médicale et interprétation clinique','Consultation médicale et évaluation locomotrice'],
 ['KŌMØ Clinical associe l’évaluation fonctionnelle à une consultation médicale lorsque le contexte le justifie. Le médecin garde la responsabilité de l’indication, de l’interprétation et des décisions de soin.','KŌMØ Clinical est le volet médical du dispositif. Il comprend une consultation, un examen clinique orienté et l’interprétation des données fonctionnelles lorsque leur utilisation est médicalement indiquée. Les décisions diagnostiques et thérapeutiques relèvent du médecin.'],
 ['Réserver une expérience','Prendre rendez-vous'],
 ['Contexte','Anamnèse'],
 ['Histoire fonctionnelle, symptômes éventuels, objectifs et contraintes.','Antécédents, symptômes, évolution fonctionnelle, traitements en cours et objectifs de consultation.'],
 ['Examen','Examen clinique'],
 ['Examen clinique ciblé selon l’indication.','Examen clinique orienté en fonction du motif de consultation et des constatations initiales.'],
 ['Mesures','Analyse fonctionnelle'],
 ['Lecture du mouvement, du muscle et des tests fonctionnels dans leur contexte.','Interprétation des tests fonctionnels et des mesures instrumentées dans le contexte clinique.'],
 ['Compléter','Examens complémentaires'],
 ['Biologie, imagerie ou autre examen uniquement s’il existe une indication indépendante.','Biologie, imagerie ou autre examen complémentaire uniquement lorsqu’une indication médicale le justifie.'],
 ['Plan','Prise en charge'],
 ['Rééducation, exercice, orientation, suivi ou autre prise en charge adaptée.','Recommandations, rééducation, orientation, surveillance ou prise en charge adaptée à la situation clinique.']
]);

await patch('fr/signature/index.html',[
 ['Un programme KŌMØ conçu sur mesure','Programme privé coordonné'],
 ['KŌMØ Signature coordonne une expérience privée à partir de vos priorités, du lieu souhaité et des professionnels utiles. Le format et le périmètre sont établis lors d’un premier échange.','KŌMØ Signature organise un programme individualisé à partir du bilan fonctionnel, des objectifs, du lieu d’intervention et, lorsque cela est indiqué, des professionnels impliqués. Le contenu est défini avant le début du programme.'],
 ['Demander une consultation','Demander un entretien'],
 ['Commencer par vos objectifs','Indication et objectifs'],
 ['Mouvement, autonomie, préparation physique ou continuité après une évaluation.','Objectifs fonctionnels, niveau d’activité, antécédents et résultats déjà disponibles.'],
 ['Choisir le lieu','Organisation'],
 ['À domicile, à bord, dans un hôtel, au travail ou lors d’un retreat, selon les services disponibles.','Domicile, yacht, hôtel, entreprise ou retreat selon le format retenu et les conditions de réalisation.'],
 ['Réunir la bonne équipe','Professionnels impliqués'],
 ['Les rôles et interventions de chaque professionnel sont clarifiés avant le programme.','Les interventions sont définies en fonction des compétences de chaque professionnel et du cadre réglementaire applicable.'],
 ['Organiser la continuité','Suivi'],
 ['Pulse rassemble les étapes de votre parcours; World reste une option si elle est utile.','Pulse centralise les résultats et le suivi. World constitue un module numérique optionnel.']
]);

await patch('fr/yachting/index.html',[
 ['Une expérience KŌMØ conçue pour la vie à bord','Évaluation fonctionnelle KŌMØ à bord'],
 ['KŌMØ intervient à bord avec son équipe et son matériel. L’évaluation fonctionnelle est réalisée dans un espace adapté du yacht, suivie d’une restitution privée et d’un programme accessible après le voyage.','KŌMØ réalise à bord une évaluation fonctionnelle standardisée avec son équipe et son matériel. La session comprend les mesures, une restitution individuelle et l’accès aux résultats dans Pulse.'],
 ['Organiser une expérience à bord','Organiser une intervention à bord'],
 ['Trois usages adaptés au yachting','Formats d’intervention'],
 ['Le même socle KŌMØ peut être organisé différemment selon qu’il s’adresse au propriétaire, aux invités ou à un partenaire professionnel.','Le contenu opérationnel est adapté au nombre de participants, à la durée disponible et à l’organisation du yacht.'],
 ['Continuité personnelle','Suivi longitudinal'],
 ['Expérience pendant le séjour','Évaluation ponctuelle'],
 ['Service à proposer aux clients','Service complémentaire'],
 ['Pensé pour l’environnement du yacht','Organisation à bord'],
 ['Du yacht au suivi longitudinal','Déroulement et suivi'],
 ['World donne une continuité à l’expérience à bord','Suivi numérique après la session'],
 ['Préparer une première intervention à bord','Organiser une intervention KŌMØ à bord']
]);

await patch('fr/world/index.html',[
 ['World organise votre trajectoire KŌMØ','World : modules numériques associés au suivi KŌMØ'],
 ['Après l’évaluation, World transforme vos résultats et vos priorités en un environnement d’action. Vous pouvez utiliser une interface classique depuis Pulse ou entrer dans l’expérience 3D lorsque cela apporte quelque chose.','World regroupe des modules numériques complémentaires au suivi KŌMØ. Les résultats, comptes rendus et rendez-vous restent centralisés dans Pulse. L’interface 3D est facultative.'],
 ['Un espace pour agir après la consultation','Fonctions disponibles dans World'],
 ['World n’ajoute pas une couche de données. Il rend les prochaines actions plus accessibles et replace les résultats dans un environnement que l’on peut consulter, explorer ou pratiquer.','World donne accès à des contenus, exercices et représentations fonctionnelles associés au programme défini dans Pulse.'],
 ['Trajectoire','Suivi'],
 ['Retrouver les priorités définies après Motion ou Clinical et voir ce qui doit être travaillé maintenant.','Consulter les objectifs fonctionnels et les éléments de suivi définis après Motion ou Clinical.'],
 ['Comment World s’intègre au parcours','Articulation avec Pulse et les réévaluations'],
 ['La 3D reste un choix','Accès optionnel à la 3D']
]);

await patch('fr/experience/index.html',[
 ['KŌMØ à bord, à l’hôtel, à domicile ou en retreat','Évaluations KŌMØ sur site'],
 ['KŌMØ se déplace avec la personne. Yachting ouvre la voie, mais la même qualité d’évaluation, de restitution et de suivi peut être délivrée à domicile, dans un hôtel ou pendant un retreat.','Les bilans KŌMØ peuvent être réalisés hors d’un centre fixe lorsque les conditions de mesure sont adaptées : yacht, hôtel, domicile, entreprise ou retreat. Le protocole, la restitution et le suivi restent identiques.'],
 ['Réserver une expérience','Demander une intervention'],
 ['Découvrir les expériences','Voir les lieux d’intervention']
]);

// Keep EN/ES factual without a full rewrite.
for(const [rel,repls] of [
 ['en/index.html',[
  ['An assessment to understand your mobility and what to improve','Functional assessment of gait, balance and strength'],
  ['Results that lead to simple decisions','Structured functional report'],
  ['A structured method from assessment to follow-up','Method and follow-up'],
  ['Then, only if you need it','Additional services']
 ]],
 ['es/index.html',[
  ['Una evaluación para comprender tu movilidad y saber qué mejorar','Evaluación funcional de la marcha, el equilibrio y la fuerza'],
  ['Resultados que llevan a decisiones sencillas','Informe funcional estructurado'],
  ['Un método estructurado desde la evaluación hasta el seguimiento','Método y seguimiento'],
  ['Después, solo si lo necesitas','Servicios complementarios']
 ]]
]) await patch(rel,repls);

console.log('[komo-medical-editorial-v1] PASS · clinical editorial language applied to public KŌMØ surfaces.');
