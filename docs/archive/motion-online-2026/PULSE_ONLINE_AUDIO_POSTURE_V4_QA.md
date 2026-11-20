# Motion Online V4 — haut-parleur, compteur et posture

## Parcours
Pulse accueil → connexion testeur autorisé → Ma consultation Online → questionnaire fictif → sécurité → quatre tests → **Observation de la posture** → synthèse. La capture et la synthèse restent locales ; les valeurs ne sont pas enregistrées dans le dossier patient.

## Son
- Bouton **C’est parti** ou commande vocale : l’écran affiche et le haut-parleur prononce **Trois, Deux, Un, Top !**. Le chronomètre ne commence qu'au « Top ! ».
- En phase de test, un clic bref est produit **pour chaque nouvelle répétition détectée** (sans double clic sur la même répétition). Le nombre reste affiché en grand. À chaque multiple de 5, une annonce vocale du total est tentée.
- Le haut-parleur signale également 20, 10, 5 secondes restantes si le test dure assez longtemps, puis **Test terminé**. Les seuils 3–2–1 de fin de séance produisent de petites tonalités.
- Le traitement audio utilise les fonctions du navigateur. L’activation sonore est une préférence distincte, cochée par défaut et révocable. La caméra et le micro restent soumis à leurs consentements respectifs.
- Un refus audio, un navigateur sans synthèse vocale ou un système muet n’empêche pas le démarrage visuel. Les sons synthétiques sont créés localement (sans fichier audio externe).
- **Stop** durant un test le marque comme partiel ; bouton physique d’arrêt disponible durant les trois secondes de compte à rebours.
- Les annonces vocales peuvent suspendre brièvement l'écoute des commandes afin d'éviter que l'application interprète sa propre voix.

## Observation posturale frontale — V1 expérimentale
- Cinquième module, 8 secondes, visage et pieds visibles, caméra fixe, bien horizontale, face au corps.
- Les 33 points MediaPipe restent visibles à l'écran ; calcul de la médiane de mesures issues d'au moins 15 images valides et d'au moins 65 % d'images exploitables.
- Résultat : inclinaison **apparente dans l'image** des lignes des épaules et du bassin (degrés 2D), et deux décalages apparents rapportés à la largeur des épaules (%).
- Ces valeurs sont extrêmement sensibles à la perspective, à la hauteur et l'orientation de la caméra, à la pose et au port de vêtements. Elles ne permettent **aucun diagnostic**, ni mesure de scoliose, de lordose ou de contrôle postural clinique.
- Si la capture est insuffisante, ne pas générer d'indicateur chiffré ; proposer de recommencer avec un meilleur cadrage.
- Aucune vidéo ni donnée biométrique n'est persistée dans la démonstration.

## Recette sur appareil réel — indispensable
1. Ouvrir /online/session/, utiliser les réponses fictives et accéder au Sit-to-Stand.
2. Autoriser caméra et, si souhaité, microphone ; vérifier que le squelette apparaît.
3. Activer le haut-parleur, dire « C’est parti » et vérifier auditivement **3–2–1–Top** et un chronomètre à 30 s commençant au Top.
4. Effectuer 5 levers distincts : entendre 5 clics et voir la mesure progresser de 1 à 5. Comparer au comptage humain.
5. Vérifier les annonces du temps, l'arrêt, la reprise, l'arrêt de l'audio en quittant la page et les cas microphone refusé ou navigateur sans reconnaissance vocale.
6. Ouvrir Observation de la posture, face à la caméra, attendre 8 s et vérifier les quatre indicateurs. Incliner volontairement la caméra puis recommencer pour quantifier leur sensibilité.
7. Vérifier Safari/iPhone et Chrome/ordinateur : pas de son = vérifier volume, déverrouillage audio et permissions, sans jamais considérer un test acoustique synthétique comme une validation matérielle.

## Tests de code
- scripts/pulse-v14-qa.mjs (structures de pages et syntaxe)
- scripts/pulse-pose-metrics-qa.mjs (répétitions)
- scripts/pulse-online-voice-qa.mjs (reconnaissance)
- scripts/pulse-audio-posture-qa.mjs (clic synthétique, frontal, image miroir, confiance)
