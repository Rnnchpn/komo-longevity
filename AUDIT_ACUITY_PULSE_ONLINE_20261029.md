# Audit technique et UX — KŌMØ Motion Online × Acuity × Pulse
**Date :** 29 octobre 2026  
**Branche :** `audit/pulse-acuity-journey-20261029`  
**Nature :** audit de code, configuration réelle et tests d'intégration synthétiques. **Aucune création de compte client réel, réservation, transaction, vidéo ou donnée patient fictive en production.**

## Verdict
**Pas prêt pour l'ouverture autonome payante.** Le code du parcours existe, mais le verrou `PULSE_ONLINE_PAID_SESSION_ENABLED` n'est pas défini dans l'environnement **production** de Vercel ; l'API renvoie donc `canStart:false` même avec un paiement validé. Les deux variables `ACUITY_USER_ID` et `ACUITY_API_KEY` sont présentes en production seulement.

## Parcours audité
| Étape | Vérification | Conclusion |
|---|---|---|
| Réservation | URL Acuity owner=40696577, type=99940918, montant fixé à 49 EUR dans le code | La configuration réelle du tarif et des créneaux Acuity n'est pas directement vérifiée |
| Création du compte | Supabase `signInWithOtp` avec `shouldCreateUser:true`, confirmation du courriel | Implémentée ; délivrabilité du courriel et interaction réelle non testées |
| Paiement | Endpoint `POST /api/pulse-online-verify` avec Bearer JWT ; compare e-mail authentifié, type, rendez-vous non annulé, transactions processeur, prix, solde | Tests avec mocks passés ; serveur désactivé tant que flag absent ; devise de compte/processeur à valider |
| Dossier | `motion-online-dossier` revalide le paiement, vérifie le consentement, écrit côté serveur | Simulation réussie ; aucun test sur un dossier patient réel |
| Questionnaire | 22 questions, domaines mobilité 45 %, confort 25 %, récupération 15 %, activité 15 % | Cas complet, incomplet et sécurité couverts |
| Tests | STS 30 s, talons, unipodal G/D, bras, photo sagittale | Contrats et fonctions d'analyse testés avec données synthétiques ; caméra réelle non essayée |
| Score | Indice déclaratif séparé du Motion Score fonctionnel (STS + TUG + SPPB contrôlés) | Pas de pronostic ni « Motion Age » inventé lorsque les mesures manquent |
| PDF | Passeport + domaines + priorités + observations + suites possibles | Génération de données PDF testée, rendu graphique réel non inspecté sur navigateur |
| Retour Pulse | Lecture `motion_online_sessions` filtrée par utilisateur et RLS ; reprise avec identifiant Acuity du dossier | Lien de reprise réparé dans cette branche ; tests synthétiques passés |
| Programme | Journal Pulse Daily 28 jours, notes et effort ressenti | Suivi fonctionnel, mais exercices encore relativement génériques |

## Défauts corrigés sur cette branche
1. **Reprise après déconnexion :** le lien « Reprendre mon bilan et Pulse Daily » inclut désormais l'ID du rendez-vous stocké dans le dossier privé de l'utilisateur connecté. Une nouvelle validation côté serveur demeure obligatoire.
2. **Connexion :** l'erreur de routage vers `/?connexion=1` a été corrigée vers `/#connexion`, cohérent avec la vraie interface de connexion.
3. **Score manquant :** un champ `null` ou vide ne peut plus être interprété comme `0/100` dans l'affichage principal ou une sous-dimension.
4. **Non-régression :** tests synthétiques depuis une réservation payée jusqu'au rapport, à l'export et au retour Pulse, avec refus d'identités et de paiements non concordants.

## Frictions patient identifiées
- Le formulaire d'activation exige le numéro Acuity. **Solution sans nouveau développement :** personnaliser le courriel de confirmation Acuity avec un lien `https://pulse.komolongevity.com/online/activate/?appointment=%appointmentID%`. Le tag officiel `%appointmentID%` est disponible dans les modèles de confirmation.
- Le produit est décrit comme un **bilan accompagné de 30 minutes**, alors que l'application actuelle réalise un enchaînement guidé de tests et une restitution automatique ; le rendez-vous vidéo humain est extérieur au parcours informatique. Décrire explicitement dans Acuity quand a lieu la restitution en visioconférence, par quel lien et avec quel intervenant.
- Les catégories d'indice déclaratif sont des **repères éditoriaux**, pas des seuils normatifs cliniques ; garder cette indication visible.
- Les tests webcam et la photographie sagittale ont une validité métrologique insuffisamment documentée pour promettre un âge biologique ou une prédiction individuelle de longévité.
- Le PDF est téléchargé localement ; il n'est pas un fichier PDF archivé en base. Il peut être reconstruit lors du retour du patient depuis ses données enregistrées.
- La fenêtre Acuity et l'envoi du courriel client réel restent **non vérifiés** ; aucun test bancaire et aucun essai de webcam réelle n'ont été exécutés.

## Conditions de passage en production
1. Valider le type de rendez-vous 99940918, sa disponibilité, son coût réel de 49 EUR, le processeur de paiement et la devise.
2. Ajouter et tester le lien d'activation avec `%appointmentID%` dans les confirmations Acuity.
3. Faire une réservation de test autorisée avec paiement contrôlé (ou un vrai paiement intégral puis remboursement documenté, uniquement après approbation), confirmer le courriel et ouvrir Pulse.
4. Vérifier 6 tests sur un iPhone Safari, un Android Chrome et un ordinateur webcam ; tester les permissions caméra/micro, le changement d'onglet et les résultats de mauvaise qualité.
5. Vérifier sauvegarde, retour sur un autre appareil, visualisation de `Mon passeport`, PDF sur mobile et plan Pulse après reconnexion.
6. Activer `PULSE_ONLINE_PAID_SESSION_ENABLED=true` **seulement** après les tests réels, contrôle de confidentialité et validation scientifique.
7. Ne publier aucun badge « commercial prêt » sans ces vérifications.

## Preuves techniques
`scripts/pulse-acuity-journey-qa.mjs` : parcours d'acceptation fictif couvrant refus de paiement et d'identité, questionnaire, six mesures, conservation des résultats, PDF, reprise Acuity, Pulse Daily et cas de sécurité. Il déclenche également dix tests secondaires déjà présents dans le dépôt.

**Important :** un test automatique réussi n'est pas une preuve d'expérience utilisateur réelle sur appareils physiques ni du bon fonctionnement de l'e-mail et du tunnel de paiement Acuity.
