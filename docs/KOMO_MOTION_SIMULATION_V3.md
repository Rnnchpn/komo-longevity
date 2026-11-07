# KŌMØ Motion — Simulation V3 (200 € / 60 min)

**Statut : démonstration non médicale. Aucun paiement réel. Pas de données personnelles réelles.**

## Deux interfaces

- `/pulse-v14/motion-sim-v3/?role=operator` : interface web de l’opérateur.
- `/pulse-v14/motion-sim-v3/?role=patient` : interface du participant sur téléphone, tablette ou ordinateur.

Le parcours peut être initié depuis l’un ou l’autre. Le créateur reçoit deux liens contenant des **jetons de rôle différents dans le fragment URL** ; seul le lien destiné à l’autre participant doit être partagé. Les deux navigateurs peuvent être sur des appareils distincts.

## Démonstration de bout en bout

1. Ouvrir l’un des deux liens ci-dessus, puis cliquer sur « Créer depuis l’opérateur » ou « Créer depuis le patient ».
2. Copier le lien d’invitation de l’autre rôle et l’ouvrir sur un second appareil ou navigateur.
3. Côté participant, renseigner exclusivement des **valeurs inventées** : objectif, activité, sommeil, fatigue. Cliquer sur « Enregistrer et signaler que je suis prêt ».
4. Côté opérateur, vérifier que la préparation apparaît ; cliquer sur « Démarrer le bilan ».
5. Suivre les 8 écrans : préparation, équilibre, marche 4 m, 5 levers de chaise, TUG, appui unipodal, mobilité/posture, restitution.
6. Saisir les mesures fictives ; les enregistrer à chaque étape. Les valeurs ne sont pas visibles sur l’écran du participant.
7. Depuis la restitution, examiner la prévisualisation puis cliquer « Valider et partager la synthèse ».
8. Les deux interfaces affichent alors un rapport synthétique, imprimable/enregistrable en PDF.

### Exemples de données exclusivement fictives

- Équilibre : pieds joints 10 s, semi-tandem 10 s, tandem 7 s.
- Marche 4 m : 4,4 s et 4,8 s, soit 0,91 m/s (meilleur essai).
- 5 levers de chaise : 12,3 s.
- TUG : 9,8 s.
- Appui unipodal droit/gauche : 17 s / 14 s.
- Distance doigts-sol : 12 cm.

Le score SPPB illustratif correspondant est 10/12 (équilibre 3, marche 4, chaise 3), à condition que les consignes de mesure du SPPB soient réellement respectées. Les mesures adaptées, manquantes ou non réalisées pour raison de sécurité **n’alimentent pas un score calculé automatiquement** ; l’échec de performance spécifiquement consigné comme « tenté, non réalisable » peut donner zéro selon les règles SPPB.

## Architecture de simulation

- Frontend : `pulse-v14-src/motion-sim-v3/index.html`, `app.js`, `styles.css`.
- RPC Supabase : `public.motion_sim_v3_create`, `motion_sim_v3_get`, `motion_sim_v3_action`.
- Données fictives isolées : `private.motion_sim_v3`, RLS activée, aucun accès direct accordé à `anon` ou `authenticated`.
- Accès à une salle : deux jetons aléatoires UUID indépendants, un pour le patient et un pour l’opérateur.
- Synchronisation : interrogation du serveur toutes les 2,3 secondes.
- Cloisonnement : le patient ne reçoit **ni mesures brutes ni notes opérateur avant publication**. Après publication, il reçoit uniquement les métriques prévues dans le rapport.
- Conservation : accès refusé à l’expiration (12 heures) ; nettoyage des sessions expirées par la tâche `cron.job` `motion_sim_v3_purge_15min`.
- Les fonctions de démonstration sont accessibles à `anon` via jeton de capacité. **Elles ne constituent pas une authentification utilisable avec de vrais dossiers.** Un limiteur rudimentaire de création protège contre les rafales ; un rate limiter côté edge sera nécessaire avant toute extension.

## Tests effectués

- Création depuis le rôle patient : OK.
- Questionnaire patient et lecture côté opérateur : OK.
- Démarrage et saisie : OK.
- Refus de navigation avec le jeton patient : OK.
- Masquage des résultats au participant avant publication : OK.
- Publication volontaire et réception du rapport après publication : OK.
- Vérification que `anon` ne dispose pas de droits SQL directs sur la table : OK.
- Calcul SPPB pour données fictives 10/12, score incomplet et échec de performance : OK.
- Syntaxe JavaScript : OK.
- Compilation du site Vercel : à valider sur le dernier commit.
- Test interactif sur iPad/iPhone et test simultané sur deux appareils : **à réaliser manuellement**.

## Avant utilisation avec de vrais clients

Ce simulateur n’est **pas un système de dossiers réels**. Pour produire des comptes rendus clients à 200 €, il faut remplacer les jetons de démonstration par une authentification réelle et des autorisations par patient/opérateur, relier l’identifiant de séance à l’identité du client autorisé, vérifier le traitement RGPD des données potentiellement sensibles, ajouter les consentements, versions de protocole, audit des modifications, sauvegardes, contrôle de publication, stockage sécurisé des PDF et supervision des tests physiques. Aucune consultation médicale, aucun acte de soin ni prescription n’est prévu. Le cadre des activités physiques encadrées rémunérées doit être vérifié avant commercialisation.
