# KŌMØ Pulse V14 — arrivée patient en trois offres

## Parcours cible

1. Un visiteur ouvre `pulse.komolongevity.com` sans compte.
2. À gauche : trois cartes de découverte vers le site principal KŌMØ : **Bilan Gratuit**, **Bilan Online**, **Bilan physique Motion**.
3. À droite : `Créer mon compte et réserver` ouvre le calendrier Acuity existant (owner `40696577`). Pas de création libre de compte via un formulaire public.
4. Le patient choisit une prestation et un créneau. Pour une offre payante, le paiement doit être confirmé côté Acuity/Stripe avant de déverrouiller le parcours payant.
5. Une intégration serveur authentifie et re-vérifie la réservation auprès d'Acuity, puis utilise le modèle d'invitation Pulse existant ; aucune donnée de santé dans les e-mails.
6. L'utilisateur vérifie son adresse via l'e-mail d'activation envoyé par le système d'authentification approuvé ; Supabase Auth détient son identité.
7. La connexion à Pulse reprend l'identité Supabase et donne accès uniquement au dossier patient relié au rendez-vous vérifié.

## Livré dans cette branche

- Trois cartes cliquables et distinctes à gauche sur la page publique Pulse V14.
- Panneau droit d'entrée patient, qui explique le parcours en trois étapes.
- Bouton Acuity avec l'URL de réservation existante.
- Connexion des comptes existants conservée, avec mot de passe oublié.
- Interface responsive et liens de confidentialité.
- Assertions de recette dans `scripts/pulse-v14-qa.mjs`.
- Aucune modification du modèle d'autorisation Supabase, des identités existantes ou des données de santé.

## Nécessaire avant ouverture commerciale

**Acuity**
- Créer/valider les types de rendez-vous exacts Gratuit, Online et Motion. Vérifier leurs IDs et leur visibilité.
- Définir le tarif du bilan Online, sa durée (hypothèse : 30 min), le prépaiement et la politique d'annulation.
- Vérifier l'agenda de disponibilité et les e-mails de confirmation de réservation.

**Intégration serveur Acuity → Pulse**
- Recevoir le webhook Acuity dans un endpoint serveur. Vérifier la signature ou authentifier la notification selon la méthode officiellement supportée par Acuity, puis relire la réservation par l'API Acuity, sur le serveur uniquement.
- Réconcilier de façon idempotente par ID Acuity, statut payé, service, e-mail et créneau. Ne jamais accepter une valeur `paid` ou `confirmed` déclarée par le navigateur.
- Le projet Supabase dispose de `komo_commercial_contacts`, de `claim_my_komo_booking()` et de RPC de réservation d'invitation (`reserve_komo_pulse_invitation`/`complete_komo_pulse_invitation`). Vérifier leurs privilèges serveur avant de les réutiliser. Leurs présences ne prouvent pas qu'un webhook Acuity soit configuré.
- Déclencher l'invitation/activation par un backend autorisé et vérifier le lien entre `auth.users`, le contact commercial confirmé et le dossier `patients`; l'interface V14 existante refuse à juste titre l'accès à un dossier non relié.
- Prévoir les annulations, reports, remboursements, doublons, changement d'e-mail, impossibilité d'activer, défaillance SMTP.
- Aucun e-mail d'activation ne doit exposer des résultats fonctionnels ou des informations de santé.

**Bilan Online**
- Réserver un parcours distinct du bilan instrumenté Motion v1.0 (dont le score exige des mesures réelles) ; ne pas afficher de Motion Score ou de Motion Age calculé à partir des seules observations vidéo.
- Préparer le consentement, la vérification de sécurité des tests, la salle de visioconférence et un rapport non diagnostique, avec RLS patient/opérateur.
- Vérifier le cadre réglementaire, RGPD, prestataires et hébergement avant mise en production.

## Vérifications préproduction

- Test d'un visiteur vierge : cartes, liens externes et ouverture Acuity.
- Test de connexion d'un compte existant (succès et erreur), et récupération de mot de passe.
- Test d'une réservation Acuity confirmée et payée, et du cas non payé.
- E-mail vérifié, dossier relié, autorisations RLS patient/pro, prévention des accès croisés.
- Échec de réservation, annulation ou paiement → aucun accès payant.
- QA navigateur smartphone, tablette et ordinateur.

**État :** le front-end d'entrée patient est codé ; l'invitation automatique Acuity et la salle Online ne sont pas déployées par cette branche.
