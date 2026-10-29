# KŌMØ Pulse Motion Online — V5 : photo de profil et équilibre unipodal

## Pourquoi changer le module Posture

La **SVA radiographique** est une mesure entre la verticale passant par le corps vertébral de C7 et le bord postéro-supérieur de S1, sur radiographie standardisée en charge. MediaPipe ne voit pas C7 ou S1 : le module ne peut donc ni retrouver la SVA réelle ni produire une valeur radiographique en millimètres.

Le résultat commercialement présentable est une **observation sagittale photographique de surface**, sans diagnostic ni comparaison avec les normes de SVA.

## Photo de profil : protocole opératoire
1. Placer un ordinateur/téléphone sur un support fixe, horizontal, idéalement à hauteur du bassin, suffisamment loin pour montrer épaule, hanche, genou et cheville. Position de profil strict (90°), lumière uniforme, vêtements permettant la visualisation de la silhouette.
2. Dans Pulse, consentir à l'analyse locale et activer la webcam. Aucun microphone n'est requis.
3. Le moteur MediaPipe vérifie la disponibilité d'une chaîne de points épaule-bassin-genou-cheville d'un côté, le caractère latéral et le cadrage.
4. Dès que la silhouette reste suffisamment stable pendant environ **2,3 secondes**, la page capture **automatiquement une photographie locale**.
5. La photo reste dans le navigateur ; le flux webcam est arrêté immédiatement. Deux repères de surface sont proposés : jonction cervicale superficielle (proximité épaule) et région pelvienne superficielle (proximité hanche). Ces points **ne sont pas C7 et S1**.
6. Sélectionner un repère et toucher la photographie pour l'ajuster. L'indice observé est la différence horizontale entre les deux repères, divisée par la hauteur projetée épaule–cheville, exprimée en **%**.
7. Si le profil est mal cadré, recommencer. Aucun résultat n'est persisté dans un dossier patient pendant cette phase de démonstration.

## Équilibre unipodal — pied gauche puis droit
1. À effectuer uniquement si la position debout est sûre, **à portée d'un support stable**, yeux ouverts, jambes et pieds visibles ; ne pas réaliser en autonomie en cas d'incertitude de sécurité.
2. Pour l'appui gauche, soulever doucement le pied droit. Après environ **0,85 seconde** de position visible, le chronomètre démarre **automatiquement**, sans commande vocale.
3. Reposer le pied pour arrêter le chronomètre ; maximum 20 secondes. Perte de suivi prolongée → mesure interrompue/à vérifier. Refaire ou passer le test.
4. Reprendre pour l'appui droit avec pied gauche levé.
5. Restituer uniquement la **durée apparente de maintien unipodal visible** et la qualité du suivi, sans parler de test clinique validé, d'oscillations posturales ou de prédiction du risque de chute.

## Interface
- Webcam occupant la majorité de la surface disponible (jusqu'à 76 % de la hauteur de fenêtre et environ 880 px sur grand écran).
- **Consignes & installation** dans un volet explicite ; microphone et son dans un autre volet compact, toujours accessibles.
- Statut de détection affiché sur la webcam. Mesure photographique et chronomètre unipodal automatiques après cadrage et activation explicite de la webcam.
- Le bouton de saut reste présent, l'application ne force jamais un mouvement.

## Recette
- Vérifier l'ensemble depuis accueil Pulse → connexion testeur → questionnaire → sécurité → 7 modules → synthèse.
- Image de profil : confirmer le refus des vues frontales, l'arrêt de la caméra après photo, l'affichage des deux repères et leur édition tactile, puis refaire la photo.
- Unipodal gauche/droit : confirmer le bon côté, le départ automatique seulement lorsque l'autre pied est soulevé, l'arrêt après reposer le pied et une absence de score en cas de suivi incomplet.
- Sur Chrome/Safari et ordinateur/téléphone, contrôler le comportement réel de MediaPipe, des permissions et de la capture.
- Tests déterministes : `scripts/pulse-profile-unipodal-qa.mjs`. Le build Vercel ne remplace pas ce test physique.

Sources scientifiques : https://www.ncbi.nlm.nih.gov/books/NBK534858/ ; https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker
