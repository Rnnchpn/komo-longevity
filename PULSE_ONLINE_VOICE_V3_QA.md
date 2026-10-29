# KŌMØ Motion Online — V3 : démarrage à la voix

## Chemin testé depuis le début

1. Ouvrir `https://pulse.komolongevity.com/`.
2. Se connecter avec le compte testeur autorisé. Cette version reste uniquement dans l'espace de démonstration authentifié ; ne pas utiliser de données réelles.
3. Page `/online/session/` → **Démarrer ma consultation test**.
4. Questionnaire fictif → sécurité → début du test de lever de chaise.
5. Lire les instructions en trois étapes ou cliquer **Écouter les consignes** avant d'activer la reconnaissance vocale.
6. Vérifier la position de la caméra, cocher le consentement d'analyse corporelle, puis **Activer ma webcam**.
7. Cocher séparément le consentement de reconnaissance vocale, cliquer **Activer les commandes vocales**, autoriser le micro. Le micro n'est **jamais activé automatiquement** par la vidéo.
8. Se placer à distance, attendre que la silhouette soit détectée, prononcer **« C'est parti »**. Le chronomètre doit partir et la caméra doit compter les répétitions.
9. Prononcer **« Stop »** : l'essai est arrêté immédiatement et son résultat marqué comme partiel/à vérifier. Prononcer **« Recommencer »** : l'essai peut être réinitialisé sans revenir devant l'écran.
10. Fin du test : examiner la valeur, corriger manuellement si nécessaire ou recommencer ; passer au test suivant. La caméra et la reconnaissance vocale sont libérées lors du changement d'étape et doivent être réactivées lors du prochain test.

## En quoi consistent les quatre tests

- **Lever de chaise (30 s)** : s'asseoir sur une chaise stable, se relever puis se rasseoir durant 30 secondes, à son rythme. Le logiciel propose un décompte exploratoire fondé sur les angles apparents du genou, pas une mesure de force.
- **Élévation des pointes de pieds (20 s)** : debout près d'un appui fixe, monter sur les pointes puis redescendre. Estimation webcam exploratoire à confirmer ; pas de mesure des mollets ou de leur force.
- **Debout sécurisé (10 s)** : près d'un appui solide, garder une position confortable ; la webcam mesure **la durée de visibilité du corps**, pas le contrôle postural ni un risque de chute.
- **Élévation des bras (20 s)** : de face, monter puis redescendre doucement les deux bras. Comptage des mouvements par position apparente des poignets ; pas de mesure d'amplitude articulaire validée.

Chaque test affiche son objectif, comment installer son matériel, trois étapes concrètes, la métrique exacte et ses limites. Un bouton de lecture audio des consignes existe ; il ne doit pas être utilisé pendant l'écoute vocale, pour éviter que le navigateur entende sa propre synthèse.

## Sécurité, confidentialité et compatibilité

- Analyse des 33 points en local, vidéo non enregistrée ; microphone autorisé **séparément** par Web Speech API et uniquement après opt-in.
- **Attention :** selon le navigateur, la reconnaissance vocale utilise un fournisseur externe et transmet la voix à son service ; il est donc faux de dire que tous les traitements audio restent sur l'appareil.
- KŌMØ ne sauvegarde ni audio, ni transcription, ni enregistrements vidéo dans ce mode test.
- Si le navigateur ne prend pas en charge `SpeechRecognition` ou `webkitSpeechRecognition`, garder les boutons tactiles visibles. L'écoute continue dépend de la politique et des permissions du navigateur et n'est pas garantie sur tous les téléphones.
- Les signaux de confirmation vocale via synthèse vocale sont facultatifs ; les annonces peuvent dépendre des réglages audio du navigateur.
- Les résultats et seuils automatiques sont **exploratoires, non cliniquement validés**, et peuvent être corrigés.
- Ne pas commencer si un symptôme inquiétant ou une difficulté de sécurité rend le mouvement dangereux. « Stop » et le bouton d'arrêt terminent immédiatement un test en cours.

## Recette automatique et manuel

Les scripts `scripts/pulse-v14-qa.mjs` et `scripts/pulse-online-voice-qa.mjs` vérifient les contrôles, l'interdiction d'une activation non consentie, la syntaxe, la reconnaissance stricte des commandes, la toute première commande et le nettoyage de la reconnaissance.

**À faire sur matériel réel (non attesté par build Vercel) :**
- Chrome desktop + Safari macOS/iOS, caméra et micro autorisés, personne à 2–3 mètres.
- Vérifier que le micro reconnaît « C'est parti » au premier essai, ainsi que « Stop » et « Recommencer ».
- Refuser le micro, changer d'onglet, sortir du test et vérifier l'arrêt effectif de l'écoute.
- Contrôler le nombre de répétitions détectées contre un comptage humain vidéo indépendante sur 10 sessions, avec différents éclairages et positions.
- Vérifier la lisibilité du mode à distance et la possibilité de revenir aux consignes.

Référence navigateur : https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition
