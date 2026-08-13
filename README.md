# KŌMØ — International V3

Site statique, trilingue et pré-généré pour KŌMØ.

## English-first structure

- English reference site: `/`, `/pulse/`, `/clinical/`, `/locomotor/`, `/library/`…
- Français : `/fr/`, `/fr/pulse/`, `/fr/clinical/`…
- Español : `/es/`, `/es/pulse/`, `/es/clinical/`…

L’anglais est la version éditoriale de référence et la langue par défaut du domaine. Le français et l’espagnol sont des localisations natives distinctes. Chaque page possède ses propres balises SEO, canonical et liens `hreflang`.

## Déploiement Vercel

1. Importer ce dossier dans le dépôt qui alimente réellement `www.komolongevity.com`.
2. Dans Vercel, connecter le dépôt puis laisser `vercel.json` appliquer la commande `node scripts/build.mjs` et le dossier de publication `site`.
3. Déployer d’abord un aperçu de branche, puis publier une fois la revue terminée.

Pour activer l’entrée `locomotor.komolongevity.com`, ajouter ce sous-domaine dans les domaines du projet Vercel puis créer chez le fournisseur DNS l’enregistrement demandé par Vercel. Les réécritures de `vercel.json` servent automatiquement les versions anglaise, française et espagnole depuis ce sous-domaine.

Le projet reste également publiable sur Netlify grâce au fichier `netlify.toml`.

### Aperçu de cette branche

Les branches `agent/*` sont volontairement isolées de `main`. Une fois le projet Vercel relié au dépôt, un commit déclenche un aperçu de revue sans modifier la production ni les domaines KŌMØ.

## Développement

```bash
npm run build
npm run preview
```

Le contenu est centralisé dans `src/content.mjs`; les pages sont générées par `scripts/build.mjs`. Le répertoire `site/` est généré et directement publiable.

## Points éditoriaux importants

- KŌMØ Locomo Check est présenté comme une orientation éducative, et non comme un diagnostic en ligne.
- Les services cliniques ne sont jamais annoncés en dehors de structures et de professionnels autorisés.
- White Coast est présenté comme un chapitre communautaire local et dirige vers `https://community.komolongevity.com/`.
- Le formulaire de contact ouvre directement un e-mail vers `contact@komolongevity.com` tant qu’un endpoint Brevo ou Supabase n’est pas connecté.
