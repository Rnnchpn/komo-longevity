# KŌMØ — International V3

Site statique, trilingue et pré-généré pour KŌMØ.

## English-first structure

- English reference site: `/`, `/pulse/`, `/clinical/`, `/locomotor/`, `/library/`…
- Français : `/fr/`, `/fr/pulse/`, `/fr/clinical/`…
- Español : `/es/`, `/es/pulse/`, `/es/clinical/`…

L’anglais est la version éditoriale de référence et la langue par défaut du domaine. Le français et l’espagnol sont des localisations natives distinctes. Chaque page possède ses propres balises SEO, canonical et liens `hreflang`.

## Déploiement Vercel

1. Importer ce dossier dans le dépôt qui alimente réellement `www.komolongevity.com`.
2. Dans Vercel, connecter le dépôt puis laisser `vercel.json` appliquer la commande `node scripts/build-all.mjs` et le dossier de publication `site`.
3. Déployer d’abord un aperçu de branche, puis publier une fois la revue terminée.

Pour activer l’entrée `locomotor.komolongevity.com`, ajouter ce sous-domaine dans les domaines du projet Vercel puis créer chez le fournisseur DNS l’enregistrement demandé par Vercel. Les réécritures de `vercel.json` servent automatiquement les versions anglaise, française et espagnole depuis ce sous-domaine.

Le projet reste également publiable sur Netlify grâce au fichier `netlify.toml`.

## Développement

```bash
npm install
npm run build
npm run preview
```

Le contenu est centralisé dans `src/content.mjs`; les pages sont générées par `scripts/build.mjs`. Le répertoire `site/` est généré et directement publiable.

## KŌMØ Design System · Storybook

Storybook est installé avec le renderer HTML/Vite afin de faire évoluer le design sans introduire React dans le site de production.

```bash
npm install
npm run storybook
```

Storybook est disponible localement sur `http://localhost:6006`.

Pour valider une version statique :

```bash
npm run build-storybook
```

Les sources du Design System se trouvent dans `src/design-system/` et la configuration dans `.storybook/`.

Premières familles disponibles :

- `Foundations / KŌMØ` — palette, typographie et espacements
- `Components / Button` — hiérarchie des actions
- `Patterns / Article Reading` — en-tête d’article, 3 points clés, niveaux de preuve et bibliographie

Le build Storybook est validé séparément par GitHub Actions et n’est pas inclus dans le bundle public `site/`.

## Points éditoriaux importants

- KŌMØ Locomo Check est présenté comme une orientation éducative, et non comme un diagnostic en ligne.
- Les services cliniques ne sont jamais annoncés en dehors de structures et de professionnels autorisés.
- White Coast est présenté comme un chapitre communautaire local et dirige vers `https://community.komolongevity.com/`.
- Le formulaire de contact ouvre directement un e-mail vers `contact@komolongevity.com` tant qu’un endpoint Brevo ou Supabase n’est pas connecté.
