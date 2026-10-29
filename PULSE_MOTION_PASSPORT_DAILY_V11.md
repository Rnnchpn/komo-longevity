# KŌMØ Motion Passport + Pulse Daily — V11
29 octobre 2026 · Dossier de conception et de mise en service contrôlée

## Proposition de valeur
**« Un point de départ. Un cap. Une progression mesurable. »**

L'objectif n'est plus de distribuer un tableau de résultats isolés, mais de fournir une **première photographie de la longévité locomotrice** et un parcours concret de suivi.

### Page 1 du PDF — Motion Passport
- Marque KŌMØ Motion / Motion Passport, date et caractère non médical.
- **Indice de mobilité perçue / 100**, calculé sur les réponses au questionnaire KŌMØ :
  - mobilité 45 % ;
  - confort/confiance 25 % ;
  - récupération 15 % ;
  - activité habituelle 15 %.
- Quatre barres de domaine avec mention « à entretenir / à développer / priorité de discussion ».
- Nombre de tests réellement observés et nombre de mesures à vérifier.
- Deux priorités éditoriales individualisées (deux domaines déclaratifs les moins bien notés).
- Point de contrôle à quatre à six semaines.

Les catégories sont des repères **internes non cliniquement validés**. L'indice ne représente ni un âge biologique, ni une espérance de vie, ni le Motion Score validé en laboratoire.

### Pages suivantes
- Quatre domaines distincts avec explications, points à entretenir et éléments modifiables.
- Sit-to-Stand, équilibre unipodal, talons, bras, photographie de profil et qualité de capture ; références de population seulement lorsque les conditions de protocole sont comparables.
- Motion Score 40/35/25 **uniquement si** STS, TUG et SPPB et leurs normes sont réellement vérifiés ; sinon, « NON CALCULABLE ».
- Feuille de route avec **deux actions** :
  1. bilan complémentaire instrumenté à Paris ou Cannes via Acuity ;
  2. programme Pulse Daily, journal quotidien et recontrôle.
- Appendice complet des 22 réponses aux questionnaires.

## Pulse Daily — pilote de 28 jours
Programme non médical, orienté autonomie et bien-être, **pas une rééducation prescrite** :
- marche accessible : 8, 10, 12 puis 15 minutes par jour indicatif ;
- levers de chaise adaptés : 5, 6, 8 puis 10 répétitions selon confort ;
- travail de stabilité **avec appui** : 20, 25, 30 puis 35 secondes ;
- mobilité douce : 3 à 5 minutes ;
- pause récupération.
- Possibilité de cocher les activités du jour, saisir un effort perçu 0–10 et une note facultative de 160 caractères.
- Suivi du nombre de jours renseignés, et point de contrôle à 4–6 semaines.
- Les propositions ne sont pas présentées si la séance a été interrompue pour sécurité, si les questionnaires sont incomplets ou si douleur, peur de chute ou évitement importants sont signalés. Orienter alors vers un échange individualisé.

### Journal et confidentialité
- En démonstration admin : progression conservée dans l'onglet selon les règles existantes.
- Pour un client payant autorisé : champ `program` strictement filtré dans le snapshot du dossier privé existant, sauvegardé par l'Edge Function Supabase et relu après connexion.
- Aucune vidéo, photo, piste audio ou données brutes MediaPipe dans le journal ou le rapport.
- Les réponses du programme sont **auto-déclarées** ; cocher un exercice n'atteste pas sa bonne exécution.
- Le rapport PDF est créé localement à partir des données de séance ; le fichier PDF n'est **pas encore archivé sur le serveur**.

## Fondements scientifiques et limites
- **OMS, lignes directrices 2020 sur l'activité physique** : il existe des bénéfices à commencer par de petites quantités et progresser selon les capacités ; les plus âgés bénéficient d'activités variées associant force, équilibre et endurance.
  https://www.ncbi.nlm.nih.gov/books/NBK566046/
- **Studenski et al., JAMA 2011** : la vitesse de marche est associée à la survie dans des cohortes d'adultes de 65 ans et plus ; cette association populationnelle **ne permet pas** d'attribuer une espérance de vie individuelle sur la base du questionnaire ou de la webcam.
  https://pubmed.ncbi.nlm.nih.gov/21205966/
- Les recommandations Pulse Daily sont une première trame pédagogique et non un traitement individualisé. Validation par un professionnel compétent et vérification des contre-indications avant une commercialisation comme programme de soins.

## Recette nécessaire avant commercialisation
- Ouvrir le parcours V11 avec le compte testeur, compléter les 22 réponses, six tests, visualiser le passeport et le détail des domaines.
- Télécharger puis **ouvrir le PDF sur Chrome/Firefox/Safari et iPhone**, vérifier couverture, retours à la ligne, marges, toutes les pages et l'absence de fausse SVA / Motion Age.
- Vérifier les deux scénarios : réponses sans avertissement (Pulse Daily activable) et douleur/instabilité importante (programme bloqué).
- Journal : cocher les exercices, enregistrer, actualiser, vérifier la persistance et l'isolation entre deux comptes factices.
- Simuler une perte de réseau et vérifier la remontée d'erreur ; ne pas prétendre à une sauvegarde lorsque l'écriture a échoué.
- Réaliser une recette Acuity payée réelle + comptes A/B et audit juridique RGPD/HDS, sans quoi **le lancement commercial reste désactivé**.

## Ce qui relève de la feuille de route produit (non encore développé)
- Module Pulse Daily autonome dans l'application Patient au-delà de l'écran de synthèse.
- Exercices en vidéo avec aide à l'exécution et détection de qualité, personnalisation par professionnel, rappels automatiques.
- Comparatif longitudinal des différents bilans et objectifs co-validés.
- Archivage sécurisé du PDF, signature/relecture opérateur et envoi sécurisé au patient.
- Mesures complémentaires de la marche, des amplitudes, de la force instrumentée et de l'équilibre standardisé ; ne pas les fusionner arbitrairement dans un score global prétendument validé.
