# Publication de KŌMØ International V3

## Ce que contient ce projet

- 27 pages éditoriales : 9 parcours anglais de référence, français et espagnol.
- Une sélection native de langue, persistante, sans service de traduction automatique.
- Des URLs distinctes et indexables : anglais à la racine, `/fr/` et `/es/` pour les localisations.
- Des balises `canonical`, `hreflang`, Open Graph, sitemap et robots.txt.
- Un design responsive : navigation mobile, actions larges, contenu lisible et visuels CSS très légers.
- Le lien vers la communauté White Coast : `https://community.komolongevity.com/`.
- Un contact direct fiable vers `contact@komolongevity.com`, sans prétendre qu’un formulaire serveur est déjà configuré.

## Mise en ligne sur le vrai site KŌMØ

1. Utiliser le dépôt qui alimente réellement `www.komolongevity.com`.
2. Remplacer son contenu ou créer une branche dédiée avec le contenu de ce dossier.
3. Sur Vercel, utiliser les paramètres déjà présents dans `vercel.json` :

   - Commande de build : `node scripts/build.mjs`
   - Dossier de publication : `site`

4. Déployer d’abord l’aperçu de branche, puis publier sur la branche de production une fois la validation terminée.
5. Vérifier que `www.komolongevity.com` reste le domaine principal et que le domaine nu redirige vers celui-ci.
6. Lorsque la liste Brevo ou le backend de contact sont validés, remplacer l’ouverture d’e-mail par un endpoint explicitement configuré.

## Vérifications avant publication

- Tester les trois langues et le changement de langue depuis chaque page.
- Tester le menu mobile et les boutons `Motion Score` sur un téléphone.
- Tester le formulaire avec une adresse e-mail de test.
- Vérifier que White Coast ouvre bien `community.komolongevity.com`.
- Vérifier dans la Search Console que le nouveau sitemap est accepté :
  `https://www.komolongevity.com/sitemap.xml`.

## Important

Le déploiement doit d’abord passer par un aperçu de branche. Ne relier la branche de production au domaine `www.komolongevity.com` qu’après vérification éditoriale, mobile et clinique.
