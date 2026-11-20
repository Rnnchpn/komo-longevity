# KŌMØ Motion Online — Questionnaires & Score V6

## Parcours patient, mode test sécurisé

1. Connexion au compte testeur autorisé `https://pulse.komolongevity.com/online/session/`.
2. Accueil ; bouton **Démarrer ma consultation test**.
3. Questionnaire rempli **directement par le patient**, 22 réponses sur 5 écrans obligatoires :
   - Profil (2) : tranche d'âge approximative, objectif prioritaire ;
   - Mobilité (8) : marche, escaliers, lever de chaise, charges, flexion, marchepied, demi-tour, station debout ;
   - Douleur, fatigue et confiance (4) : interférences avec les mouvements ;
   - Récupération / bien-être (4) : sommeil, stress, récupération, qualité de vie ;
   - Activité (4) : marche/activité douce, renforcement, sorties actives et interruptions de sédentarité.
4. Le formulaire refuse le passage tant que la section n'est pas complète ; chaque réponse est modifiable. Le progrès est affiché.
5. Vérification de sécurité puis tests webcam existants : STS 30s, talons, debout sécurisé, équilibre unipodal G/D, bras, photographie de profil.
6. Synthèse : score et domaines déclaratifs séparés des mesures, tests réalisés/non réalisés, et **Motion Score** de référence si les données normatives et fonctionnelles ont été véritablement validées.

**Important :** il s'agit d'un questionnaire original KŌMØ, **pas de la version validée du GLFS-25**. Ne pas utiliser le nom GLFS-25 sur la fiche de résultats ni prétendre à une validation externe.

## Indice déclaré — version KOMO_MOTION_SELF_REPORT_V1 (expérimental)

Chaque question quantitative a une réponse 0–4 (0 = gêne minimale / activité la plus fréquente ; 4 = gêne maximale / absence d'activité). Pour chaque domaine complet :

`Domaine = 100 × (1 − somme(réponses)/(4 × nombre_de_questions))`

Poids de l'indice général **strictement déclaratif** :
- Mobilité : 45 %.
- Confort (douleur, fatigue, confiance) : 25 %.
- Récupération/bien-être : 15 %.
- Activité : 15 %.

`Indice déclaré = 0,45×Mobilité + 0,25×Confort + 0,15×Récupération + 0,15×Activité`

Sans la totalité des réponses, l'indice global demeure **null** (non calculable). Les questions de profil ne donnent pas de points. Cet indice exprime des **réponses subjectives** et n'est ni une validation du GLFS-25, ni une mesure objective, ni une prédiction de santé.

## Motion Score officiel défini précédemment — version KOMO_MOTION_ONLINE_LINEAR_V1

La formule de référence **reste inchangée** :

`Motion Score = ARRONDI(40 × F + 35 × M + 6,25 × B)`

où :
- `F = CLAMP((STS30 − P10_STS)/(P90_STS−P10_STS), 0, 1)`
- `M = CLAMP((P90_TUG − TUG3m)/(P90_TUG−P10_TUG), 0, 1)`
- `B = équilibre SPPB, entier 0–4`.

Les normes P10/P90 doivent provenir d'une source pertinente et documentée, non inventée. Les trois tests sont obligatoires, normalisés et revus par l'opérateur. Un STS webcam ne suffit pas à lui seul : le **TUG standardisé sur 3 m**, le **SPPB équilibre** et les normes restent à collecter. S'ils manquent, le Motion Score reste **absent**, même si tous les questionnaires sont remplis. L'indice déclaré, les tests unipodaux, la posture et le sommeil/stress ne doivent PAS être injectés artificiellement dans cette formule.

Le calculateur de référence est présent dans la synthèse **mode test administrateur**, avec référence, validations explicites et contrôle de cohérence. Aucun patient ne doit voir une valeur expérimentale fictive présentée comme un score validé. Aucun « Motion Age » n'est extrapolé.

## Données et limites

Cette version demeure une **démonstration sans persistance serveur**. Les réponses, scores, mesures et photos restent localement en mémoire et s'effacent à la fermeture/actualisation ; il existe une copie volontaire de la synthèse (JSON) par bouton. Le dossier patient permanent, l'accès client après paiement et les politiques RLS nécessitent une mise en service séparée et des tests de sécurité. Ne pas demander de vraies données sensibles pendant la démo.

## Contrôle qualité

`scripts/pulse-intake-motion-score-qa.mjs` vérifie :
- Les 22 questions, l'unicité des identifiants et le total des pondérations.
- Les profils maximum/minimum 100 et 0 ; les données manquantes/invalides bloquent les scores.
- Le poids 40/35/25, les seuils et l'absence de normes fictives.
- L'obligation de TUG, SPPB, STS, percentiles, source et validations opérateur.

Après déploiement, essais manuels navigateur : remplir les 5 sections ; réouvrir et corriger les réponses ; sauter les exercices uniquement si sécurité ; vérifier tous les sous-scores ; laisser TUG/SPPB vides pour constater « Motion Score indisponible ». Les tests de compilation ne garantissent pas l'ergonomie réelle.
