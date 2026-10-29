# KŌMØ Pulse — Recette du Bilan Motion Online à 49 €

**Statut : PRÉ-COMMERCIAL / NE PAS OUVRIR AUX CLIENTS.**  
Mise à jour : 29 octobre 2026. Périmètre unique : consultation Motion Online à 49 €, pas le bilan gratuit, ni le bilan Motion en centre.

## Parcours cible

1. Le participant réserve le type Acuity **99940918**, prix affiché **49 €**, et règle l'intégralité.
2. Il reçoit sa confirmation Acuity et son éventuel lien de visioconférence. Il conserve le numéro de rendez-vous.
3. Depuis `pulse.komolongevity.com/online/activate/`, il active ou retrouve son compte sécurisé avec la **même adresse e-mail**.
4. Le serveur Pulse compare le compte authentifié, la référence de réservation, le type de prestation, l'état actif du rendez-vous et les transactions de paiement réelles. Un numéro de réservation seul ne donne aucun accès.
5. Le participant ouvre `pulse.komolongevity.com/online/session/?appointment=…`, donne le consentement à l'enregistrement **des réponses et des données chiffrées seulement**.
6. Il vérifie facultativement la webcam dans le pré-contrôle, complète **22 questions** (dont tranche d'âge et objectif), puis l'écran de sécurité.
7. En l'absence de signaux de sécurité bloquants, il passe ou ignore les **6 modules** : STS 30 s, élévations des talons, appui unipodal gauche, appui unipodal droit, mouvements des bras, posture de profil. Le micro est facultatif.
8. Le Passeport affiche les **4 domaines déclaratifs**, un indice exploratoire sur 100, les observations réalisées (avec mentions de qualité), les priorités et la suite.
9. Le dossier privé est synchronisé **avant** la génération du PDF « Motion Online 49 € ». Le PDF lui-même n'est pas encore archivé côté serveur.
10. Il réalise son **échange final en visioconférence** à partir des instructions Acuity ; l'opérateur discute des limites de mesure. Il est ensuite orienté vers Pulse Daily ou un bilan en centre.

**Important :** le Motion Score fonctionnel ne doit pas être estimé à partir des six modules webcam. Il exige des données STS/TUG/SPPB normalisées et vérifiées. Pas de « Motion Age », pas de diagnostic, pas de pronostic individuel de longévité.

## Recette manuelle — participant fictif (tester sur ordinateur puis sur iPhone)

| ID | Test à réaliser | Résultat accepté | Statut |
|---|---|---|---|
| A01 | Ouvrir la page Bilan Online et choisir la prestation 49 € | Lien Acuity du bon type, tarif 49 €, aucune confusion avec le bilan gratuit | À confirmer sur Acuity |
| A02 | Simuler une réservation payée avec une adresse test autorisée | Confirmation reçue, numéro et lien de visio récupérables, pas de paiement non désiré | **Bloquant tant que non testé** |
| A03 | Se connecter/activer Pulse avec le même e-mail | Lien à usage unique reçu et retour sur Pulse fonctionnel | À tester réellement |
| A04 | Saisir référence valide puis un numéro invalide | Uniquement le rendez-vous payé du bon e-mail et du type Online est autorisé | Simulation serveur OK, parcours réel à tester |
| A05 | Ouvrir page session, lancer « Tester ma caméra » puis refuser l'autorisation | Message clair, questionnaire encore accessible, aucun flux vidéo conservé | À tester sur Safari et Chrome |
| A06 | Autoriser la caméra et vérifier sa libération | Caméra prête, piste arrêtée immédiatement après pré-contrôle | À tester |
| A07 | Accepter le consentement, couper le réseau et cliquer démarrer | Aucun dossier créé sans succès de sauvegarde ; message explicite et bouton réutilisable | À tester |
| A08 | Compléter les 22 questions en revenant sur les sections | Pas de score si réponse manquante ; modifications conservées | Tests de logique présents, UI à tester |
| A09 | Répondre « Oui » aux signaux de sécurité | Épreuves suspendues ; questionnaire informatif, pas de programme autonome | À tester |
| A10 | Parcourir les 6 tests avec caméra, téléphone posé à 2–3 m | Chronomètres, consentement, consignes, cadrage, arrêt, mesures réelles ou à vérifier | À tester |
| A11 | Refuser caméra / interrompre un test / passer une épreuve | Aucun blocage, valeur non inventée ; test marqué ignoré ou à vérifier | À tester |
| A12 | Revenir à un test déjà terminé, conserver puis refaire | Résultat conservé lors de la simple consultation ; remplacé seulement si « Refaire » choisi | À tester |
| A13 | Fermer puis rouvrir Pulse pendant le bilan payé | Les réponses et les mesures chiffrées reviennent depuis le dossier sécurisé sans vidéo ni photo | **Bloquant tant que non testé** |
| A14 | Accéder à la synthèse et au PDF | Quatre domaines, priorités, 6 observations avec vrais statuts ; PDF identique au modèle, mention « 49 € » et référence de réservation | À tester |
| A15 | Couper le réseau juste avant « Télécharger » | Pulse refuse la délivrance en cas de synchronisation incomplète ; possibilité de réessayer | À tester |
| A16 | Générer le PDF, quitter et revenir | PDF consultable sur appareil ; mesures chiffrées conservées dans le dossier privé et rapport régénérable | À tester |
| A17 | Ouvrir le lien de visioconférence de la confirmation | Micro et caméra libérés par Pulse, pas de conflit bloquant avec la visioconférence | **Bloquant tant que non testé** |
| A18 | Activer Pulse Daily puis enregistrer une activité et une note | Suivi conservé, priorités de programme cohérentes, arrêt proposé en cas de risque | À tester |
| A19 | Tester la séance sur Safari iPhone, Chrome ordinateur et au moins un second téléphone | Texte, boutons, caméra, posture, boutons retour, téléchargement du PDF sans débordement | **Bloquant tant que non testé** |

## Tests de refus serveur (automatisés, données simulées)

- Identité authentifiée et e-mail confirmé exigés.
- Rendez-vous de type **99940918**, actif, non annulé et non marqué « no-show ».
- Correspondance stricte de l'e-mail du compte Pulse avec le rendez-vous Acuity.
- Transaction processeur réelle, montant >= 49, prestation au tarif de 49 et solde dû non positif.
- Refus des réservations inexistantes, des paiements manuels, partiels, des mauvais types et des origines non autorisées.
- **Drapeau de lancement désactivé par défaut** : `PULSE_ONLINE_PAID_SESSION_ENABLED` doit être activé seulement après la recette.
- Validation complémentaire à réaliser : devise EUR et format réel des transactions sur le compte Acuity, remboursement éventuel, e-mail/visio de confirmation.

## Bloquants commerciaux P0 à lever

1. **Activer l'accès payant seulement après recette**. En production, `PULSE_ONLINE_PAID_SESSION_ENABLED` n'est pas configuré. Les identifiants Acuity sont en production uniquement ; la prévisualisation ne peut donc pas simuler une vraie réservation payée.
2. **Tester un vrai flux Acuity** avec un compte de recette et un moyen de paiement autorisé, ou un mode sandbox du prestataire effectivement disponible. Le prix, l'ID de prestation, la devise, le lien de visio, le remboursement et l'e-mail sont à vérifier ensemble. Ne jamais créer de transaction réelle non voulue.
3. **Visualisation de dossier côté opérateur** : `motion_online_sessions` a actuellement une policy SELECT propriétaire uniquement. L'accès professionnel contrôlé à un dossier, le traitement des anomalies et la validation humaine restent à concevoir. Ne pas supprimer la RLS.
4. **Restitution visio** : aucune visio native n'est reliée depuis Pulse ; le participant doit suivre sa confirmation Acuity. Vérifier que le lien est présent, que les caméras ne se concurrencent pas et qu'une solution d'assistance existe.
5. **Tester sur vraies conditions matérielles** : Safari iPhone, Android et ordinateur, éclairages, refus de caméra, perte de réseau, navigateur en veille, personne hors cadre et comportement du PDF.
6. **Compliance & contenus** : consentement, CGV, politique de confidentialité et notice de portée non médicale à relire et valider avant commercialisation. L'indice de profil déclaré est propriétaire et non cliniquement validé.

## Conduite de la séance par l'opérateur

**Avant l'appel :** vérifier réservation 49 €, confirmation et accès Pulse ; rappeler l'utilisation de chaussures et d'une chaise stable, un espace dégagé, support fixe, appareil chargé et plan de secours si webcam indisponible.

**Début :** vérifier le contexte et les limites du service non médical ; rappeler le consentement et les critères d'arrêt, puis laisser remplir le questionnaire et les modules avec accompagnement approprié.

**Restitution :** relever les 4 domaines déclaratifs, vérifier les valeurs marquées « à confirmer », expliquer la part expérimentale des tests webcam, souligner deux priorités fonctionnelles non diagnostiques. Ne pas remplacer des données absentes par des mesures imaginées. Proposer des activités de bien-être accessibles, Pulse Daily si éligible, ou une orientation vers un professionnel compétent si la sécurité l'exige.

**Fin :** confirmer le dossier sauvegardé, faire télécharger le PDF, expliquer l'accès ultérieur au suivi et convenir d'un point de contrôle à 4–6 semaines.

## Décision de lancement

Le statut « technique READY » d'un déploiement Vercel **ne prouve pas** la réussite d'une séance réelle. Autoriser l'ouverture au public uniquement quand les cas A01–A19 sont démontrés et enregistrés, les bloqueurs P0 levés et la restitution/consentement validés. Garder la fonctionnalité payante fermée en cas d'échec d'un critère critique.

## Liens de recette

- Site public actuel : `https://pulse.komolongevity.com/`
- Parcours client de production (encore fermé) : `https://pulse.komolongevity.com/online/activate/`
- Démonstration authentifiée sur Vercel : ouvrir la dernière prévisualisation GitHub de la branche `feat/pulse-online49-patient-report-20261029`, puis `/pulse-v14/online/session/` (compte administrateur de test seulement).
