# KŌMØ Longevity - Site Officiel

Écosystème français de la prévention locomotrice 4.0.

## Pages incluses
- **index.html** : Homepage premium avec modals interactifs pour KOMO Score, KOMO Case, KOMO Pulse. Design luxury dark.
- **syndrome-locomoteur.html** : Page complète et interactive sur le Syndrome Locomoteur avec :
  - Calculateur gamifié "Capital Mobilité" (3 étapes, score /100, plan d'action personnalisé)
  - Tests simulés (Stand-up, Two-Step)
  - Questionnaire 25 questions interactif
  - Checklist signes d'alerte
  - LLP Age Score simulator
  - Prévention (exercices + nutrition)
  - Sources scientifiques

## Liens qui fonctionnent
- Tous les ancres (#defi, #solution, etc.) → navigation fluide
- Lien "Découvrir plus en détail le syndrome locomoteur" → syndrome-locomoteur.html
- Boutons Summit → scroll ou modals
- Modals premium qui s'ouvrent comme des pages
- Tous les boutons et calculateurs JS 100% fonctionnels

## Déploiement Vercel (1 clic - tout automatique)
1. Va sur [Vercel.com](https://vercel.com) et connecte ton compte GitHub
2. Clique **"Add New Project"** → Import Git Repository
3. Sélectionne `Rnnchpn/komo-longevity`
4. Vercel détecte automatiquement que c'est un site statique → **Deploy**
5. Ton site est live en ~1 minute avec URL personnalisée (ex: komo-longevity.vercel.app)
6. Chaque push sur `main` → déploiement automatique

Aucune configuration manuelle requise. Tout est prêt.

## Structure
```
komo-longevity/
├── index.html              # Homepage KŌMØ
├── syndrome-locomoteur.html # Page Syndrome + outils interactifs
├── vercel.json             # Config Vercel (optionnel)
└── README.md
```

## Personnalisation future
- Remplace les images placeholder par tes assets (renan-chapon.jpg etc.)
- Ajoute /summit.html si besoin
- Connecte les formulaires à un backend (Formspree, Supabase...)
- Passe en Next.js + Tailwind build pour production scale

Créé automatiquement pour toi. Tout fonctionne, tout est prêt pour Vercel.

**Marchez sur vos deux pieds toute votre vie.** 🦵

© 2026 KŌMØ Health Corporation - Locotech Lab