# KŌMØ Pulse Online — Étape 1 : accès Acuity → Pulse

**État : code et tests intégrés ; accès commercial fermé par défaut en attendant l’archivage sécurisé.**

## Ce qui a été corrigé
1. Le patient achète/réserve le bilan Online **49 €** sur Acuity.
2. Sur `/online/activate/`, il utilise le **même e-mail**, authentifie son compte Pulse (lien de connexion) et fournit le numéro Acuity.
3. Le serveur `/api/pulse-online-verify` vérifie l’identité Supabase, l’e-mail de la réservation, l’identifiant de prestation, l’absence d’annulation et la transaction Stripe/PayPal valable (montant total et prix).
4. Le serveur renvoie **`canStart`** uniquement si l’option privée **`PULSE_ONLINE_PAID_SESSION_ENABLED=true`** est définie. Par défaut, `canStart=false` : une réservation peut être vérifiée sans déclencher le parcours patient encore non archivé.
5. Si `canStart=true`, le bouton **« Commencer mon bilan Motion »** ouvre `/online/session/?appointment=<id>`.
6. **À l’ouverture de la séance**, la page exige une authentification Supabase et appelle à nouveau le serveur. Un lien copié ou modifié ne confère aucun accès sans e-mail lié à une réservation payée. Une réservation annulée après activation perd son accès au chargement suivant.
7. Le compte administrateur testeur historique conserve son accès direct et n’a pas besoin de réservation.
8. En mode patient, la progression locale est isolée par identifiant Supabase et rendez-vous ; jamais réutilisée pour un autre compte ni un autre achat.

## Ce qui n’est pas encore activé
- **Ne pas mettre la variable `PULSE_ONLINE_PAID_SESSION_ENABLED` à `true`** avant les étapes ci-dessous.
- La confirmation de paiement **ne crée pas de dossier patient durable**.
- La session ne conserve à ce stade que les réponses chiffrées dans `sessionStorage` pendant quatre heures.
- Le rapport PDF est téléchargé localement ; il n’est pas accessible dans l’historique Pulse.
- Le parcours reste un **bilan fonctionnel non médical, avec des mesures webcam expérimentales**. Le Motion Score fondé sur TUG et SPPB ne doit pas être affiché sans mesures et normes validées.

## Résultats des contrôles
- `scripts/pulse-online-payment-qa.mjs` : réservation payée, sans paiement, annulation, prestation incorrecte, mauvais e-mail, identité non confirmée, origine externe, et activation désactivée/activée côté serveur.
- `scripts/pulse-paid-session-access-qa.mjs` : normalisation du numéro, refus des fausses identités, réinterrogation du serveur, absence de passe-droit client, isolation des progressions et route de lancement.
- `scripts/pulse-v14-qa.mjs` : garde les contrôles du parcours, de la webcam, des scores, de l’interface et du PDF.
- Build complet et preview Vercel READY.

**Limite de vérification :** aucun paiement réel n’a été réalisé pour le test ; les transactions Acuity sont simulées dans le QA. Les secrets Acuity demeurent côté serveur dans Vercel.

## Étape 2 — Prochaine résolution
Créer ou raccorder un **dossier Online durable par patient et par réservation** avec droit d’écriture accordé seulement après validation du paiement, RLS testées entre patient A/B et opérateur, versions des questionnaires et scores, règles de rétention, rapport PDF privé et journal de consentement. Auditer/corriger les politiques existantes suspectes qui comparent `a.patient_id = a.patient_id` au lieu de la ligne courante.

**Critère GO commercial :** les tests de paiements réels, patient A/B et les contrôles d’accès en base passent, la conformité de la collecte est documentée et le compte client récupère sa séance et son PDF dans Pulse. Alors, et seulement alors, autoriser `PULSE_ONLINE_PAID_SESSION_ENABLED=true`.
