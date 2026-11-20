# KŌMØ Pulse Online — Étape 2 : dossiers privés et reprise de consultation

**Date : 29 octobre 2026. État : développement et vérifications automatisées réalisés ; ouverture commerciale bloquée.**

## Réalisation

Un dossier Motion Online désormais spécifique à **un compte Supabase + une réservation Acuity vérifiée**.

### Base
- Table séparée `public.motion_online_sessions` sur Supabase (migration `motion_online_isolated_persistent_sessions_v1`, appliquée dans le projet).
- Colonnes : `user_id`, `appointment_id`, `status`, `snapshot`, versions des questionnaires/protocoles, version et date du consentement, dates de création et de mise à jour.
- Contrainte de réservation unique : une réservation ne peut pas être affectée à deux comptes.
- **Row Level Security activée**. Une politique `SELECT` uniquement pour le compte propriétaire (auth.uid = user_id). Aucun droit d'insertion, de modification ou de suppression donné à `anon` ou `authenticated` dans l'API SQL publique.
- Aucun changement apporté aux anciennes tables patients/assessments/reports.

### Enregistrement
- Fonction Supabase **`motion-online-dossier`**, `verify_jwt=true`, déployée en version 2 et accessible seulement via un utilisateur authentifié.
- Avant chaque **chargement** ou **sauvegarde**, la fonction :
  1. vérifie l'identité Supabase directement dans Auth ;
  2. appelle `/api/pulse-online-verify` qui revérifie la réservation Acuity, son adresse et paiement ;
  3. exige `eligible:true`, `paid:true`, `canStart:true` ; **l'accès public reste inactif tant que le drapeau serveur n'est pas explicitement activé** ;
  4. refuse tout dossier associé à un `user_id` différent et refuse la sauvegarde sans `KOMO_MOTION_ONLINE_CONSENT_V1` accepté ;
  5. supprime/refuse les données hors du schéma connu (aucune image, vidéo, audio ni positions brutes MediaPipe).
- La clé d'écriture base est conservée exclusivement par l'environnement serveur Supabase, jamais dans le navigateur.
- Le frontend `secure-dossier.js` enregistre les modifications de façon séquentielle, met à jour un indicateur de statut, permet une reprise depuis un autre appareil avec le même compte et la même réservation.
- En cas d'échec de sauvegarde, le message informe le patient et le bouton de sortie refuse de prétendre que tout est enregistré.

### Consentement
Avant les questionnaires, le client payant doit autoriser explicitement l'enregistrement durable des réponses de mobilité, douleur et résultats fonctionnels. Le compte testeur existant reste isolé en mode démonstration ; aucun vrai dossier patient n'est écrit pour lui.

**Limite légale importante** : la case de consentement ne constitue pas à elle seule une conformité RGPD, ni une décision sur l'hébergement de données de santé (HDS). La qualification de la collecte, les finalités, durées, sous-traitants, information complète et politique de suppression doivent être revues avant ouverture.

## Contrôles effectués
- Migration Supabase appliquée avec succès ; vérification SQL : `RLS=true`, `authenticated SELECT=true`, `authenticated INSERT=false`, `authenticated UPDATE=false`, `anon SELECT=false`.
- Edge Function active, version 2, protection JWT activée.
- `scripts/pulse-online-dossier-qa.mjs` simule :
  - paiement valide, dossier absent, création, relecture, mise à jour et statut complété ;
  - patient B tentant de lire ou modifier le dossier du patient A ;
  - achat impayé/annulé, drapeau commercial OFF, consentement absent ou de mauvaise version ;
  - identifiant invalide, données illégales, capture webcam brute, CORS et accès sans JWT ;
  - transmission minimale depuis le client et queue de sauvegarde.
- `scripts/pulse-v14-qa.mjs` garde les contrôles questionnaires, webcam, posture, scores et PDF.
- Les builds de préproduction sont passés.

## Limites et P0/P1 restants

**P0 avant premier client réel :**
- Test **de bout en bout avec un achat Acuity réel** et deux comptes anonymisés authentifiés (éviter d'utiliser de vraies données sensibles pour ce test).
- Test de RLS **contre de vrais JWT A/B** et confirmation que les accès directs Data API ne peuvent pas contourner la fonction.
- Validation contractuelle RGPD, sécurité, sous-traitance, pertinence HDS et politique de conservation/effacement.
- Audit puis correction des anciennes politiques d'autorisation potentiellement trop permissives sur les autres modules Pulse : ce nouveau stockage ne les corrige pas.

**P1 :**
- Historique et consultation du bilan par l'opérateur autorisé, sans droit de lecture global.
- Archivage privé du PDF et remise au client (étape 3) ; aujourd'hui le PDF est toujours téléchargé sur l'appareil, sans conservation serveur.
- Déconnexion/renouvellement JWT, tests multi-onglets et gestion de conflits simultanés à finaliser.
- Fiabilité clinique des mesures webcam et disponibilité du Motion Score lorsque les protocoles TUG/SPPB et normes correspondantes sont remplis.

## Critère d'ouverture

**NE PAS configurer `PULSE_ONLINE_PAID_SESSION_ENABLED=true` avant validation des P0.**

Les tests automatisés apportent un bon niveau de confiance dans les règles écrites, mais ils ne prouvent ni la conformité réglementaire ni l'expérience d'un véritable patient payé.
