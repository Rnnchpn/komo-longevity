# Audit de lancement commercial — KŌMØ Motion Online

**Date de revue : 29 octobre 2026** — Parcours Pulse Online actuel, version démonstration admin. Le présent audit n’est ni une validation de conformité ni un test de pénétration.

## Livraison réalisée dans cette branche

- Navigation directe entre **les six tests** depuis toute étape de test et depuis la synthèse.
- Libellés de progression **À faire / Terminé / À vérifier / Non réalisé**.
- En revisitant une épreuve terminée : **affichage en lecture seule du résultat déjà enregistré** ; conservation explicite ou retest volontaire, sans démarrage automatique accidentel de la webcam.
- Refaire un test invalide **uniquement son ancien résultat** ; toutes les autres mesures restent disponibles dans le récapitulatif et le PDF.
- Navigation empêchée tant qu’un test est actif ; l’utilisateur doit d’abord arrêter la mesure pour ne pas perdre ou faire passer une mesure partielle comme terminée.
- Aucun saut possible par la navigation si le questionnaire sécurité a suspendu les exercices.
- Bouton explicite pour éteindre caméra et micro lors de la consultation d’un résultat déjà terminé.
- Corrections manuelles des compteurs = statut `review`, jamais une mesure automatiquement validée ; les tests unipodaux sautés sont désormais enregistrés et sauvegardés dans la progression de l’onglet.

## Vérifications réalisées

| Domaine | Résultat | Preuve / réserve |
|---|---|---|
| Build Vercel et syntaxe | **Validé en préproduction** | Build `scripts/build-all.mjs` réussi |
| Navigation parmi les 6 épreuves | **Validé automatiquement** | `scripts/pulse-test-navigation-qa.mjs`, passage et tests sans écraser les autres résultats |
| Questionnaire et indice déclaré | **Validé automatiquement** | 22 questions, progression et refus des données manquantes |
| Webcam, audio, comptage, unipodal, posture | **Simulations passées** | Les tests unitaires ne prouvent pas la précision sur un humain réel |
| Photo de profil | **Fonctionnelle au niveau code** | Photo et index de surface 2D, correction manuelle, pas SVA radiographique |
| Références selon âge | **Indication conditionnelle** | STS 30 s uniquement à protocole/âge/catégorie comparables ; pas de seuil inventé pour les autres mesures |
| PDF local | **Génération câblée et payload testé** | Ouverture, pagination et téléchargement réel à valider sur Chrome, Safari, iOS |
| Identité et contrôle de rôle | **Mode test uniquement** | `online/session/app.js` n’admet que le compte admin testeur |
| Activation après paiement | **Vérification API partielle** | Les variables de configuration Acuity de production sont présentes ; aucune preuve d’un achat/activation client de bout en bout |
| Base Supabase | **RLS activée sur les tables publiques contrôlées** | Ne prouve pas l’absence de fuite : tests d’autorisation inter-comptes non réalisés |
| Persistance consultation Online | **NON DÉVELOPPÉE EN COMMERCIAL** | Questionnaire et six mesures conservés dans `sessionStorage` (4 h, onglet courant), non liés à un dossier client |
| Rapport disponible en espace patient/pro | **NON DÉVELOPPÉ** | Le PDF est téléchargé localement, non archivé dans Pulse |
| Score Motion complet | **NON AUTOMATISÉ** | TUG 3 m, équilibre SPPB standardisés et références normatives non acquis dans le parcours webcam |

## Points bloquants pour une vente publique en autonomie

### P0 — Autorisation après achat
Le front `online/activate/app.js` reçoit une confirmation d'éligibilité via `api/pulse-online-verify.js` mais n’écrit pas de **droit d’accès durable** à la séance. En l’état la page `online/session/` vérifie explicitement **un seul identifiant d’administrateur**. Un client payé n’obtient donc pas automatiquement un accès au test.

**À réaliser :** droit/entitlement côté serveur lié à un paiement Acuity vérifié et identifiant Supabase, idempotence, expiration/annulation, rôle patient et contrôle serveur du droit d’accès avant chaque opération sensible. Tests paiement confirmé, impayé, annulé, autre e-mail, doublon, expiration.

### P0 — Données et isolation par patient
Le questionnaire et les résultats ne sont pas persistés dans une fiche Online. Le stockage temporaire du mode test n’est pas une stratégie de confidentialité pour des données personnelles. Il faut construire une table ou réutiliser un modèle d’évaluation avec un propriétaire patient, identifiant de réservation, consentement/version, statut, score/version, données minimisées, rétention et journal d’accès.

Les requêtes SQL de revue (métadonnées uniquement) montrent que les tables publiques consultées ont RLS activée, **mais certaines politiques de modules voisins présentent des jointures insuffisamment corrélées au dossier patient**. Vérifier et corriger sous tests inter-utilisateurs avant de donner accès aux dossiers commerciaux. Aucune règle en base n'a été changée par ce travail.

### P0 — Conformité, confidentialité et qualification
Évaluer les catégories de données réellement collectées et la nature de la prestation (bien-être vs prévention/soin) avec un juriste/DPO. Documenter la base légale RGPD, l’information, les sous-traitants de reconnaissance vocale, les durées, droits, sécurité, hébergement et, **si applicable**, HDS. Des données liées à douleur, fatigue, mobilité et suivi individuel peuvent relever de la santé selon le contexte : ne pas présumer que « non médical » supprime le RGPD ou toutes exigences HDS. La CNIL distingue les cas selon la finalité et le contexte de collecte.

Références publiques à vérifier avec conseil juridique :
- https://www.cnil.fr/fr/applications-mobiles-en-sante-et-protection-des-donnees-personnelles-les-questions-se-poser
- https://gnius.esante.gouv.fr/fr/reglementation/fiches-reglementation/hebergement-des-donnees-de-sante-hds

### P1 — Validité scientifique et restitution
Ne pas appeler la photo webcam « SVA de C7/S1 ». L’indice de profil questionnaire est expérimental, pas GLFS-25 validé. Les résultats caméra doivent être testés avec référence humaine et réglage de tolérance / cadrage par appareil. Le Motion Score principal doit rester **non calculable** en l’absence de TUG 3 m, équilibre SPPB, percentiles documentés et validation. Envisager une version distincte et clairement nommée de score Online qui ne prétendrait pas remplacer le Motion Score initial si la prestation ne peut pas fournir TUG/SPPB.

### P1 — Parcours bout en bout
Tests sur au moins deux comptes anonymisés (patient A, patient B et opérateur), vérification des politiques RLS, 3 navigateurs et appareils, permissions caméra/micro, interruption Internet, redémarrage, perte de suivi, réouverture du rapport PDF, et consultation opérateur par webcam. Vérifier factures/CGV/annulations et assistance.

## Décision

**GO : démonstrations internes / tests avec fausses données.**

**NO-GO : ouverture automatique à des acheteurs réels et présentation d’un Motion Score validé avant les P0.**

Cette branche ne modifie ni l’autorisation Supabase ni la base de données ni les droits des clients ; elle améliore la navigation sans élargir l’accès. Une démonstration réussie et des tests automatisés ne remplacent pas la recette fonctionnelle et de sécurité sur navigateur réel.
