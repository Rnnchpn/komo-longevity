# KŌMØ Longevity — Acuity V2 : configuration opérationnelle

**État du 29 octobre 2026 : prêt à appliquer dans le compte Acuity ; non modifié sur Acuity.** 
Le compte propriétaire de l'agenda est identifié par `owner=40696577`. Sa page publique actuelle porte le nom « Centré Paris x Kōmø Longevity » et expose trois rendez-vous physiques à Paris (200 / 150 / 300 €). La page Acuity nécessite un administrateur connecté pour modifier ses paramètres. Aucun accès administrateur ni API Acuity authentifiée n'était disponible pendant cet audit.

## Organisation cible : un seul agenda patient, trois familles de bilans

**Nom de la page publique souhaité :** `KŌMØ Longevity — Réserver votre bilan`

**Introduction proposée à coller dans la page Acuity :**

> Bienvenue chez KŌMØ. Choisissez l'expérience qui vous correspond : un premier bilan découverte, un bilan fonctionnel accompagné en ligne ou une analyse Motion instrumentée en présentiel. Après avoir choisi votre prestation, sélectionnez votre créneau et confirmez votre réservation. Vous recevrez un e-mail Acuity récapitulatif. L'accès à votre espace privé KŌMØ Pulse est activé séparément après validation de votre dossier. Tous nos bilans Motion et Online sont des prestations fonctionnelles non médicales ; ils ne remplacent pas une consultation ni un diagnostic médical.

Éviter dans les e-mails et sur la page Acuity les formulations « consultation médicale », « télémédecine » et « compte Pulse créé automatiquement ». Ne pas annoncer de restitution de « Motion Age »/« Motion Score » pour l'Online tant que ce service n'a pas de protocole validé.

### Catégories et prestation à afficher

**01 — DÉCOUVERTE**  
`KŌMØ · Bilan Découverte` — 0 € ; durée recommandée 10–15 minutes, **à confirmer**.  
Description : « Une première approche simple du mouvement et de vos habitudes fonctionnelles. Ce rendez-vous découverte vous aide à identifier un point de départ et à choisir la suite du parcours KŌMØ. Évaluation non médicale. »  
N'activer qu'avec un opérateur, un calendrier et une prestation réellement disponibles. Sinon maintenir privé / masqué.

**02 — À DISTANCE**  
`KŌMØ · Bilan Online` — durée recommandée 30 minutes ; **prix à confirmer avant activation**, ne pas reprendre de tarif non validé.  
Description : « Votre bilan de mouvement à distance, par visioconférence avec un intervenant KŌMØ. Échange guidé, questionnaires et observations fonctionnelles simples, selon votre situation. Restitution claire et prochaines étapes. Ce bilan est non médical, sans examen instrumenté et sans diagnostic. »  
Prévoir calendrier dédié et lien de visioconférence testé, consentement adapté, conditions d'annulation, paiement configuré et support technique. Ne pas publier tant que la réalisation du bilan et l'envoi des informations ne sont pas opérationnels.

**03 — EN PRÉSENTIEL / PARIS CENTRÉ**  
Conserver les trois prestations publiques existantes sans changement de prix ni de créneaux avant validation :
- `KŌMØ Motion · Bilan Initial — Paris Centré` — 60 minutes, 200 € (existe sous un autre libellé).
- `KŌMØ Motion · Bilan de Suivi — Paris Centré` — 30 minutes, 150 €.
- `KŌMØ Motion · Bilan Advanced — Paris Centré` — 60 minutes, 300 €.

Description synthétique commune : « Bilan fonctionnel de la marche, de la force, de l'équilibre et de la mobilité à l'aide d'outils de mesure KŌMØ Motion. Restitution personnalisée non médicale. Lieu : Centré Paris, indiqué dans la confirmation de rendez-vous. »

**04 — EN PRÉSENTIEL / CANNES**, catégorie future : ne pas ouvrir avant que le site, la personne opératrice et les horaires aient été confirmés. Éviter d'attribuer les disponibilités de Paris à Cannes.

## Design Acuity

Palette : vert forêt `#244430`, ivoire `#f7f3eb`, champagne `#bbaa86`, graphite `#213b2e`.
Utiliser le logo KŌMØ approprié, pas le nom d'un seul partenaire parisien comme marque globale. Choisir un template mensuel ou quotidien selon les disponibilités. Présenter les catégories clairement. Conserver le prix et la durée visibles. Masquer la « connexion client Acuity » si elle introduit un deuxième système de compte à côté de Pulse (option de personnalisation prévue par Acuity).

Le fichier `integrations/acuity/komo-riviera.css` est un **thème facultatif prêt à copier** dans « Page Rendez-vous → CSS avancé » sur un plan Acuity qui prend en charge cette option. La page Acuity de production n'hérite pas automatiquement du CSS Vercel. Utiliser « Aperçu des modifications » dans Acuity avant l'enregistrement.

## Confirmation du rendez-vous — texte proposé

**Titre :** `Votre rendez-vous KŌMØ est confirmé`

> Votre rendez-vous KŌMØ a bien été enregistré. Les informations de date, d'heure, de prestation et de lieu (ou de visioconférence si applicable) figurent dans cette confirmation. Si vous devez modifier votre créneau, utilisez le lien de gestion Acuity associé au rendez-vous.
>
> L'espace KŌMØ Pulse est distinct de l'outil de réservation. Votre réservation n'entraîne pas la création immédiate d'un compte Pulse. L'équipe KŌMØ vous communiquera les modalités d'accès une fois votre dossier préparé.
>
> Pour toute question pratique : contact@komolongevity.com.
>
> KŌMØ — Longevity in Motion.

Aucun résultat, question de santé ou donnée de dossier patient dans les e-mails.

## Mise en conformité du parcours Acuity → Pulse : état technique

- Le public Pulse V14 utilise la page Acuity `https://app.acuityscheduling.com/schedule.php?owner=40696577`.
- Les fonctions SQL `claim_my_komo_booking`, `reserve_komo_pulse_invitation`, `complete_komo_pulse_invitation` existent déjà et les deux dernières sont réservées au rôle serveur.
- Au 29 octobre 2026, `komo_commercial_contacts` compte **0 entrée** (donc 0 rendez-vous Acuity vérifié, 0 compte Pulse lié, 0 invitation enregistrée). Cela **ne** signifie pas qu'il n'existe aucun rendez-vous dans Acuity ; cela prouve seulement qu'ils ne sont pas synchronisés vers cette table.
- Aucune fonction Edge nommée webhook Acuity n'a été identifiée. Ne pas supposer qu'une confirmation Acuity signifie une invitation Pulse.
- Acuity prend en charge une intégration webhook qui transmet un ID de rendez-vous et la signature HMAC-SHA256 `x-acuity-signature`. Il faut vérifier cette signature sur le corps brut, relire le rendez-vous par API sur le serveur, valider le statut et le paiement, puis appliquer les modifications de façon idempotente.
- Il faut ensuite associer l'identité Supabase vérifiée, le rendez-vous, le profil et le dossier patient selon le droit d'accès appropriate. Vérifier annulations et reports, RLS et preuve de paiement.

## Contrôles à faire après modification dans l'admin Acuity

1. Vérifier le nom public, les catégories et les descriptions sur desktop et mobile.
2. Vérifier la présence des seuls types effectivement disponibles, avec leurs tarifs/durées.
3. Vérifier les calendriers Paris et Cannes, sans mélange des sites.
4. Vérifier les paiements réellement demandés et le comportement des annulations / reports.
5. Tester un parcours complet sur un rendez-vous de test non facturé et annulé ensuite.
6. Vérifier réception de la confirmation Acuity, puis traitement d'invitation Pulse séparé, sans communiquer de résultats de santé par e-mail.
7. Relever les **IDs réels** de chaque prestation via « Lien direct de prise de rendez-vous » : ils permettront des liens profonds `?appointmentType=<ID>` sans inventer de valeurs.

## Sources Acuity

- https://help.acuityscheduling.com/hc/fr-fr/articles/31039700427277-Personnaliser-votre-page-Rendez-vous
- https://developers.acuityscheduling.com/docs/custom-css
- https://developers.acuityscheduling.com/docs/embedding
- https://developers.acuityscheduling.com/docs/webhooks
- https://help.acuityscheduling.com/hc/fr-fr/articles/16676949253389-Utiliser-des-CSS-des-webhooks-et-des-API-personnalis%C3%A9s

**Déploiement :** Les modifications applicatives Pulse peuvent être publiées via Vercel. Les descriptions, types de rendez-vous, paiements et CSS Acuity exigent une session administrateur ou une intégration API autorisée avant de passer de cet état « prêt à configurer » à « actif ».