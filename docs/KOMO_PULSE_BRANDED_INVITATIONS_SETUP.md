# KŌMØ Pulse — Envoi des invitations

## Objectif
Après une réservation vérifiée chez Centré Paris, l'invitation personnalisée est envoyée par KŌMØ Longevity <contact@komolongevity.com>, et non depuis le modèle d'e-mail Acuity. Reply-To identique.

## Chaîne de fonctionnement
Acuity → webhook signé HMAC → recherche de la réservation côté API Acuity → vérification du calendrier Paris/Cannes → dossier commercial sans données de santé → verrou atomique anti-doublon → e-mail transactionnel KŌMØ via Resend → client clique Activer mon espace → lien d'authentification Supabase → contrôle de correspondance de l'e-mail vérifié avec la réservation.

L'invitation de réservation n'est pas un jeton d'accès au dossier médical.

## Configuration requise (secrets uniquement côté serveur)
Sur Resend : vérifier l'expéditeur komolongevity.com (SPF / DKIM selon les consignes du fournisseur). Préserver la réception existante de contact@.
Sur Vercel Production : renseigner RESEND_API_KEY, SUPABASE_SERVICE_ROLE_KEY et ACUITY_PARIS_CALENDAR_ID. ACUITY_USER_ID et ACUITY_API_KEY sont déjà enregistrés. Cannes reste facultatif jusqu'à création d'un calendrier propre.
Sur Acuity : dans Integrations → Webhooks, ajouter uniquement l'événement changed vers https://komolongevity.com/api/acuity-booking-webhook. Ne pas ajouter simultanément les événements scheduled/canceled avec changed. Retirer toute invitation Pulse du modèle Acuity, pour éviter une double invitation.
Sur Supabase : configurer le SMTP Auth personnalisé avec le domaine vérifié, l'expéditeur contact@komolongevity.com et le nom KŌMØ Longevity. Autoriser le retour https://pulse.komolongevity.com/.

## Garanties
Les demandes webhook sans signature correcte sont rejetées. Les nouveaux expéditeurs sans domaine vérifié sont refusés par Resend. Les e-mails ne comportent aucun bilan ni résultat. Un changement d'e-mail sur une réservation existante bloque l'envoi automatique et exige une revue humaine. Une réservation déjà invitée ne déclenche pas un second envoi. Les droits Pro et Admin ne sont jamais attribués par l'inscription Pulse.

## Vérification avant activation
1. Tester avec une réservation fictive contrôlée.
2. Vérifier l'expéditeur, le Reply-To et l'arrivée en boîte de réception.
3. Activer Pulse avec la même adresse ; constater uniquement la consultation de ce client.
4. Rejouer le webhook et vérifier l'absence de double e-mail.
5. Déplacer, annuler et modifier une réservation ; vérifier que ces actions ne génèrent pas de nouvel envoi.
6. Contrôler le cas d'une adresse familiale partagée et d'une tentative non autorisée.

La prévisualisation /pulse-invitation-preview/ contient uniquement une identité fictive et n'envoie aucun e-mail.
