# KŌMØ Motion Online · Acuity → Compte Pulse → Mode test

**Date : 29 octobre 2026. Tarif : 49 € pour 30 minutes, Acuity `appointmentType=99940918`.**

## Deux parcours distincts

### 1. Mode test — compte administrateur existant
- Compte Supabase confirmé : `renanchapon@gmail.com`, rôle `admin`, profil patient déjà associé.
- Depuis `https://pulse.komolongevity.com/#connexion`, se connecter avec le mot de passe habituel.
- Après une nouvelle connexion réussie, le compte testeur est redirigé vers `https://pulse.komolongevity.com/online/session/`.
- Pour une session déjà active, le lien **Ma consultation Online** apparaît dans la barre latérale Pulse, et un lien existe sur l'accueil patient.
- Landing « Votre mouvement. Votre point de départ. » ; bouton **Démarrer ma consultation test**.
- Questionnaire test (objectifs, lever de chaise, escaliers, activité), sécurité, 4 tests guidés avec chronomètre et comptage manuel ; caméra facultative avec permission et arrêt explicite.
- Synthèse uniquement locale. **Ni enregistrement, ni stockage clinique, ni compte patient créé**.
- Accès limité par e-mail confirmé **et** rôle admin ; aucun mot de passe n'est changé, aucun paiement n'est simulé.

### 2. Client réel — inscription après paiement
- Le client choisit **Bilan Online** depuis Pulse ; Acuity ouvre la prestation `99940918`.
- Le client règle 49 € dans Acuity (**paiement intégral paramétré par l'administrateur** ; test de paiement réel distinct à réaliser).
- Acuity envoie l'e-mail de confirmation de réservation : lien d'activation Pulse **à paramétrer ci-dessous**.
- Le client suit `https://pulse.komolongevity.com/online/activate/?appointment=ID`.
- La page lui demande la même adresse e-mail que dans Acuity et lui envoie un **lien de connexion Supabase Auth** ; l'ouverture du lien authentifie l'adresse.
- Avec un JWT Supabase, l'API serveur `POST /api/pulse-online-verify` interroge Acuity via `ACUITY_USER_ID` et `ACUITY_API_KEY` côté Vercel. Elle valide :
  - le numéro du rendez-vous, le type 99940918 et la non-annulation ;
  - l'égalité stricte entre e-mail Auth confirmé et e-mail Acuity ;
  - la présence de transactions réelles via `GET /appointments/:id/payments`, le montant 49 €, le solde dû nul s'il est renseigné.
- Le navigateur n'a jamais accès à la clé Acuity ni aux données nominatives du rendez-vous depuis l'API ; seul un statut binaire est renvoyé.
- Si vérifié, le client accède à la préparation matérielle et doit rejoindre sa visioconférence depuis le lien fourni par Acuity.
- **Non livré** : liaison de la réservation au dossier patient (nécessite service_role en serveur contrôlé), questionnaire clinique stocké/RLS, rapport final, visio intégrée, analyse IA du mouvement. Ne pas les annoncer comme actifs.

## Configuration Acuity indispensable (admin)

Acuity → **Client Emails / E-mails clients** → **Create / Créer** → **Booking Confirmation / Confirmation de réservation**. Assigner exclusivement l'offre **Bilan Online KŌMØ — 49 €** de type `99940918`.

**Objet :** `Votre Bilan Online KŌMØ est confirmé — activez votre espace Pulse`

**Corps du message :**

> Bonjour %first%,
>
> Votre Bilan Online KŌMØ a bien été réservé.
>
> Pour préparer votre séance de 30 minutes, activez votre compte KŌMØ Pulse avec **la même adresse e-mail** que celle utilisée pour votre réservation :
>
> https://pulse.komolongevity.com/online/activate/?appointment=%appointmentID%
>
> Votre espace sera activé après vérification de votre adresse e-mail et du règlement de la prestation. Si vous disposez déjà d'un compte Pulse, vous pouvez vous connecter normalement.
>
> Avant votre rendez-vous, vous pouvez préparer votre espace et tester votre webcam ici :
> https://pulse.komolongevity.com/online/
>
> Pour rejoindre la visioconférence le jour prévu, utilisez le lien fourni dans votre confirmation de réservation.
>
> Un bilan fonctionnel non médical ne constitue pas un diagnostic, une consultation médicale ou un acte de soin.
>
> Une question ? contact@komolongevity.com
>
> KŌMØ — Longevity in Motion.

**Acuity :** le champ `%appointmentID%` est le tag officiellement pris en charge dans les e-mails de confirmation. Ne pas substituer `%id%`. Vérifier l'aperçu et envoyer un e-mail d'essai. Les e-mails personnalisés Acuity ne sont pas modifiés automatiquement depuis le dépôt GitHub.

## Configuration Supabase à vérifier avant ouverture au public
- **Auth → URL Configuration → Redirect URLs :** `https://pulse.komolongevity.com/online/activate/**` et les URL de production prévues.
- **Auth → Providers → Email :** création de comptes et liens e-mail OTP autorisés, configuration SMTP opérationnelle, antispam, répondeur et délivrabilité.
- Auth sign-in et validation d'identité peuvent fonctionner sans liaison automatique d'un dossier. **Les clients vérifiés ne doivent pas accéder aux données d'autres patients.**
- Tester le comportement d'un client avec un compte Pulse préexistant (lien OTP) et d'un nouveau client.

## Scénarios de recette indispensables
1. Patient non connecté : le formulaire demande e-mail, référence, envoi du lien OTP ; aucune donnée médicale collectée.
2. Client connecté mais e-mail différent du rendez-vous → refus 403.
3. RDV annulé, autre type, absence de transaction ou solde positif → refus 403.
4. RDV de 49 € avec paiement confirmé et e-mail identique → validé ; uniquement préparation webcam.
5. Personne sans token JWT → API 401. Méthode GET → 405.
6. Mot de passe ou connexion du testeur inchangés ; l'utilisateur admin peut ouvrir sa démo directement après login.
7. Vérifier Chrome/Safari/Firefox et appareil réel ; les tests chronométrés ne font ni pose tracking automatique, ni score médical.
8. Les confirmations Acuity doivent avoir le bon tag, le lien visioconférence et le lien d'activation.

Documentation : 
- https://help.acuityscheduling.com/hc/en-us/articles/48203536739469-Find-tags-to-personalize-client-notifications
- https://help.acuityscheduling.com/hc/en-us/articles/28111409877773-Customizing-email-templates
- https://developers.acuityscheduling.com/reference/get-appointments-id-payments
