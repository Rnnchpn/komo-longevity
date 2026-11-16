# KŌMØ Motion — fiabilisation des tests physiques et pratique parallèle
Date : 16 novembre 2026 | Statut : QA technique de développement, **pas de validation clinique**.

## Périmètre logiciel existant
Le parcours *Motion supervisé* actif dans le code comprend actuellement :
1. Chair Stand 30 s (STS ; caméra avec confirmation opérateur).
2. Two-Step : deux distances au ruban, saisies manuellement, meilleur essai en cm, indice si taille connue.
3. Unipodal gauche, 30 s maximum, départ au lever du pied opposé, arrêt au recontact.
4. Unipodal droit, protocole identique.
5. Cycles de mobilité des bras 30 s, observation caméra avec confirmation manuelle.
6. Posture de profil : classification visuelle ; **non** assimilée à une SVA radiographique.

La vitesse de marche sur 4 m et le 5× Sit-to-Stand, utiles au suivi locomoteur, **ne font pas actuellement partie de ces six étapes**. Leur réintégration nécessite d'aligner l'interface patient, l'opérateur, le moteur de mesures, le modèle serveur et le rapport. Ne pas les faire passer pour déjà actifs.

## Optimisations couvertes par la branche
- STS : compter uniquement après une posture assise stabilisée et une extension du genou **accompagnée d'une élévation du bassin par rapport à la cheville** ; ne pas compter une simple extension apparente du genou.
- Comptage : conserver un comptage après une brève occlusion, mais ne pas compter de transition à travers une interruption vidéo supérieure à 650 ms.
- Saisie opérateur : seuil technique exploratoire d'acceptabilité vidéo (au moins 30 trames, 70 % de trames exploitables, et 20 repères de trame exploitables pour un comptage). Ce seuil est une garde logicielle **non validée cliniquement**.
- Équilibre : refuser l'acceptation automatique en cas de perte de caméra ou de retour d'appui ambigu ; observation manuelle possible.
- La valeur vidéo reste une **estimation à confirmer** ; une caméra ne détecte pas de façon fiable toutes les aides et compensations.

## Séance pratique parallèle (iPhone + ordinateur opérateur)
Installer le téléphone fixe sur trépied, caméra suffisamment éloignée pour montrer le corps entier, lumière diffuse et support de sécurité à proximité. Sur l'ordinateur, garder l'interface opérateur et un chronomètre/comptage indépendant. Utiliser un dossier fictif pour la QA ; ne pas utiliser des données réelles pour cette session de qualification.

| Épreuve | Référence pratique | Mesure Pulse | Vérifications |
|---|---|---|---|
| Chair Stand 30 s | Comptage observé des levers complets pendant 30 s, chaise standardisée | Nombre de répétitions caméra | Départ, amplitude réelle, retour assis, absence de double comptage |
| Two-Step | Ruban métrique, 2 essais mesurés en cm ; meilleur essai | 2 saisies manuelles, calcul automatique du maximum et de l'indice si taille renseignée | Accord exact de la distance et du ratio ; aucun calcul sur simple vidéo |
| Unipodal G/D | Chronomètre indépendant depuis le décollage réel du pied opposé jusqu'à la reprise d'appui | Durée caméra en s, plafonnée à 30 s | Pied opposé, faux départs, recontact, compensation, perte caméra |
| Bras | Comptage observé des cycles complets sur 30 s | Cycles détectés | Faux comptages, amplitude incomplète, mains hors cadre |
| Posture | Observation standardisée de profil, vérification du cadrage | Classe visuelle et indice 2D exploratoire | Ne jamais libeller « SVA » ou déduire une pathologie |

### Scénarios de non-régression à reproduire
A. Trois levers complets ; B. seulement extension des genoux sans lever le bassin ; C. plusieurs secondes immobile debout ; D. occultation caméra brève puis longue ; E. unipodal avec pied non soulevé, pied partiellement soulevé, recontact, appui externe et perte des repères ; F. deux distances Two-Step valides ; G. image posture non interprétable.

Critères internes proposés de **qualification technique** (à confronter aux données observées, pas des seuils cliniques) : aucune répétition inventée dans B/C/D ; STS et bras, écart de comptage <= 1 répétition sur les scénarios maîtrisés ; unipodal, écart de chronométrage <= 0,5 s sur vidéo exploitable ; mesures sans suivi fiable **identifiées** et validées manuellement, jamais silencieusement complétées. Les erreurs doivent être documentées, pas supprimées par une correction discrète.

## Étape ultérieure : cœur locomoteur J0/S6/S12
Pour une version clinique/fonctionnelle cohérente à six domaines, prévoir : marche 4 m avec vitesse (m/s), Two-Step index, STS30, 5×STS chronométré, unipodal G/D et posture 2D. Conserver la mobilité des bras en module complémentaire, si souhaité. Spécifier une distance mesurée réellement (repères au sol ou dispositif calibré) plutôt qu'inférer des mètres de la largeur de la vidéo.

## Précautions
Aucune conclusion diagnostique à partir d'une estimation MediaPipe non validée. Ne pas produire de Motion Age comme mesure physiologique validée. En cas de douleur, déséquilibre, assistance, mouvement hors cadre, abandon ou erreur de suivi : interrompre, consigner l'incident et utiliser « non interprétable » ou une mesure manuelle tracée. Les résultats observés en QA synthétique ne constituent pas une validation sur patients.
