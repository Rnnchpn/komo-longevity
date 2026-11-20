# KŌMØ Pulse Online V8 — une seule caméra et reprise de progression

## Parcours patient
1. Se connecter au mode test administrateur Pulse.
2. Remplir les questionnaires (22 réponses) et confirmer la sécurité.
3. Au **premier test**, autoriser explicitement l'analyse locale, cliquer pour ouvrir la webcam, et, si souhaité, autoriser la reconnaissance vocale. Le haut-parleur reste indépendant et facultatif.
4. **Un bip bref** retentit à la détection de bonne position lorsque la webcam voit suffisamment de points et que le haut-parleur est autorisé. Il n'est pas répété à chaque image. En répétant un test, il peut retentir à nouveau.
5. Dire « C'est parti » ou utiliser le bouton. Continuer à travers STS, talons, debout, unipodal gauche et droit, bras et photo de profil.
6. **Le flux caméra et la reconnaissance vocale restent ouverts pendant les sept épreuves**. Seuls les contrôleurs de mesure et les éléments visuels changent entre les étapes. L'activation webcam n'est pas demandée une seconde fois.
7. Arrêter explicitement la caméra, quitter la consultation ou passer à la synthèse met fin à la capture. Passer à un autre onglet coupe également les accès, par confidentialité ; dans ce cas, un clic sera nécessaire pour les réactiver.
8. Une actualisation du navigateur conserve l'avancement des questionnaires et des tests déjà terminés, **sans réouvrir automatiquement la caméra ou le microphone**.

## Reprise des réponses
- Uniquement dans `sessionStorage`, local à l'onglet de démonstration, expiration après 4 heures, supprimé au bouton « Quitter et effacer la progression » ou au redémarrage.
- Sauvegarde de l'étape, des réponses, des contrôles de sécurité et des résultats textuels/chiffrés.
- **Exclusions strictes :** vidéo, photo en mémoire, fichier PDF, audio, identité/authentification, objets caméra, vecteurs bruts MediaPipe.
- Une fermeture de l'onglet efface cette reprise ; les cookies de session d'authentification Pulse suivent leur propre politique.
- Cette fonctionnalité de mode test n'est **pas** une sauvegarde sécurisée de dossier client. Pour la mise en production : base de données conforme, autorisations RLS, consentement et cycle de conservation, invitation après paiement confirmé.

## Non-régressions
- `scripts/pulse-continuous-session-qa.mjs` vérifie l'ouverture unique webcam, l'affectation du flux à une vidéo différente à chaque étape, le maintien d'une seule session de reconnaissance vocale, et l'arrêt physique des pistes lors de la sortie.
- Vérification des données de progression autorisées, de leur reprise, de l'expiration et de l'absence des images/sons dans le stockage.
- Les autres QA Pulse contrôlent le questionnaire, les scores, la posture, l'unipodal, le rendu et l'export PDF.

## Vérification sur matériel réel
Après autorisation sur Chrome ordinateur, effectuer deux tests sans retoucher les permissions, écouter le bip une fois à chaque position correcte, contrôler le micro actif et le son des répétitions. Actualiser la page et vérifier la reprise à la bonne étape ; la caméra et le micro devront être réactivés (règle de sécurité). Terminer puis quitter et vérifier l'arrêt du voyant caméra.
