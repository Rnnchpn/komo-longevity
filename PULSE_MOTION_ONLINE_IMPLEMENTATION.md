# KŌMØ Pulse — Motion Online | développement incrémental

## Contrat produit
Prestation : Bilan Online à 49 €, 30 minutes, Acuity type `99940918`. Bilan fonctionnel non médical à distance. Pas de diagnostic, prescription ou interprétation médicale. Pas de réutilisation du Motion Score VALD pour une mesure webcam non validée.

**Règle à chaque livraison** : rejouer tout le parcours **depuis la page d'accueil Pulse** jusqu'au dernier jalon livré, sans inventer de réservation, de paiement, de compte patient ou de mesure.

## Étape 0 : réservation — existante, vérification publique
- Pulse `https://pulse.komolongevity.com/` affiche la carte Online, 49 €, 30 min.
- Lien Acuity exact `https://app.acuityscheduling.com/schedule.php?owner=40696577&appointmentType=99940918`.
- Page Acuity affiche Bilan Online KŌMØ, 30 minutes, 49 €.
- Non attesté : finalisation du paiement, e-mail de confirmation, création de lien de visioconférence.

## Règle de paiement — à confirmer dans l'administration Acuity

**Objectif commercial : paiement intégral de 49 € pendant la réservation, avant confirmation du rendez-vous.** Le prix public seul ne prouve pas que l'option est activée.

Configuration Acuity : **Paiements → Paiement lors de la réservation** → désactiver « Utiliser le même mode pour tous les types de rendez-vous » si nécessaire → ouvrir **Bilan Online KŌMØ — 49 € (type 99940918)** → « Demander un acompte ou le paiement intégral » → **Paiement intégral** → Enregistrer. Un processeur Stripe, Square ou PayPal doit être connecté.

Parcours cible : Pulse → choisir Online → Acuity (créneau → identité) → encaissement de 49 € → confirmation Acuity et reçu → lien de préparation `https://pulse.komolongevity.com/online/` → bilan guidé → résultats Pulse après activation du compte.

Critères de recette à rejouer depuis le début :
1. Une personne peut-elle obtenir un créneau de Bilan Online sans avoir réglé 49 € ? Si oui, la configuration du paiement obligatoire n'est pas effective.
2. Une transaction approuvée déclenche-t-elle une confirmation Acuity claire et un reçu ?
3. Une transaction refusée empêche-t-elle la confirmation du rendez-vous ?
4. Le message de confirmation contient-il le lien de préparation et l'accès de visioconférence prévu ?
5. Après paiement, les données de rendez-vous et le statut `paid` sont-ils vérifiés côté serveur par l'API Acuity avant l'invitation Pulse ? **Non implémenté actuellement.**
6. Tester également annulation, report, remboursement et rétractation selon les CGV.

Test sans encaissement : Acuity recommande un **code de réduction à 100 %** pour vérifier la navigation et les e-mails. Pour tester véritablement le processeur, Acuity recommande un **petit paiement réel**, suivi d'un remboursement, avec des frais éventuels non restitués. Ne pas simuler un paiement confirmé sur la seule base d'un prix affiché.

Sources : https://help.acuityscheduling.com/hc/fr-fr/articles/28051014042125-Choisir-le-mode-de-paiement-des-rendez-vous-des-clients ; https://help.acuityscheduling.com/hc/fr-fr/articles/16676949879309-Tester-votre-outil-de-prise-de-rendez-vous

## Étape 1 : préparation matérielle et sécurité — livrée par cette branche
- URL `https://pulse.komolongevity.com/online/` ; lien « Déjà réservé ? Préparez votre séance et votre webcam » sur la page publique de Pulse.
- Rappel du lien direct de réservation Acuity, sans faux état « réservation vérifiée ».
- Quatre points d'environnement (chaise stable, espace dégagé, support fixe, appareil chargé).
- Alerte de sécurité, sans acte thérapeutique ni test physique autonome.
- Ouverture webcam **sur clic explicite seulement**, micro non demandé (`audio:false`).
- Preview en local seulement ; aucun `fetch`, stockage, upload, enregistrement, score, compte Supabase ou consentement médical.
- Fermeture explicite + arrêt automatique des pistes sur `visibilitychange` et `pagehide`. Les cases ne persistent pas à la navigation.
- Détection de caméra fonctionnelle ≠ détection automatique des mouvements, cadrage corporel complet ou adéquation clinique.
- Aucun questionnaire clinique, paiement ni caméra stockée par cette page.

### Acceptation QA de l'étape 1
1. Arriver sur la page Pulse en navigation privée sans compte.
2. Cliquer Bilan Online et observer le type Acuity 99940918, 49 €, 30 minutes.
3. Revenir sur Pulse, cliquer « Déjà réservé ? Préparez votre séance et votre webcam ».
4. Vérifier les quatre coches, la progression et l'absence de sauvegarde au rechargement.
5. Refuser la permission caméra : message utile, pas de plantage.
6. Autoriser : aperçu local, aucun micro, contrôle stop fonctionnel.
7. Changer d'onglet : arrêt de la caméra ; elle ne reste pas active après le départ.
8. Vérifier Chrome/Firefox/Safari desktop + mobile pour les affichages et permissions.
9. Contrôle technique en build : `scripts/pulse-v14-qa.mjs`.
10. **Validation physique de la webcam réelle et des permissions du navigateur par un test manuel** — non attestée par un fetch HTTP ou une simple compilation.

### Copier dans la confirmation Acuity (par un administrateur Acuity)
> Avant votre Bilan Online KŌMØ, préparez votre espace et vérifiez le fonctionnement de votre caméra sur https://pulse.komolongevity.com/online/ . Cette page ne recueille aucune information de santé et ne réalise aucun test physique ; les exercices seront guidés pendant votre rendez-vous. Si vous n'avez pas reçu le lien de visioconférence, contactez contact@komolongevity.com.

**Ce lien de confirmation n'est pas encore enregistré dans le compte Acuity ; l'administrateur doit le faire.**

## Étape 2 : liaison de réservation et authentification
- Webhook Acuity authentifié et idempotent ; relecture de la réservation depuis le serveur, contrôle du prix effectivement payé, type, date, statut.
- Création/liaison d'un compte Supabase vérifié et autorisation d'accès au seul dossier du client concerné ; e-mail de bienvenue sans information de santé.
- Tester paiement accepté/refusé, annulation/report, doubles notifications, collision d'e-mails, mot de passe oublié.
- Ne pas ouvrir de formulaire clinique en public avant ce contrôle d'identité, l'analyse RGPD/HDS et une notice de confidentialité à jour.
- L'invitation automatico Pulse n'est **pas** en place en étape 1.

## Étape 3 : questionnaire pré-bilan sécurisé
- Intake à compte vérifié : objectifs de mobilité, limitations fonctionnelles, activité, stabilité, vécu de la marche, questions de sécurité et limites d'application.
- Durée 5–7 min ; version du questionnaire et consentements séparés, retrait possible.
- Score exploratoire descriptif uniquement, sans prétention à une échelle clinique validée.
- RLS patient/opérateur, conservation minimisée et durée fixée.

## Étape 4 : session guidée par un opérateur
- Sit-to-Stand 30 s, élévation des talons avec support, équilibre statique simple avec support, mobilité fonctionnelle des bras.
- Consignes standardisées, possibilité de ne pas faire ou d'arrêter.
- Capturer les résultats manuels (comptage/temps) avant ajout de l'automatisation.
- Valider les procédures et les critères de sécurité avec un expert qualifié ; ne pas présenter cela comme une téléconsultation médicale.

## Étape 5 : détection webcam
- Estimation de pose locale, calibration et scores de confiance ; visibilité suffisante / qualité de capture.
- Comptage de répétitions avec validation opérateur et audit des erreurs.
- Vérifier comparaisons aux mesures de référence avant d'afficher ROM/équilibre/vitesse de marche chiffrés.
- Aucun Motion Score/Motion Age comparable à VALD sans validation spécifique.

## Étape 6 : rapport & trajectoire
- Synthèse de capacités observées + limitations méthodologiques, priorités et réévaluation (6 semaines), sans interprétation diagnostique.
- PDF et accès uniquement autorisés, journaux d'accès et tests d'isolation des dossiers.

## Travaux transverses
- Revoir couverture assurance des tests guidés à distance, protection des données, finalité/qualification du logiciel.
- Vérifier Vercel desktop/mobile et compatibilité caméra.
- Le fait qu'une page publique soit déployée ne rend pas, à lui seul, les étapes 2–6 opérationnelles.
