# PULSE — architecture de référence (21 novembre 2026)

Ce fichier décrit ce qui est réellement en production. Il remplace les notes « Online » archivées dans `docs/archive/motion-online-2026/`.

## Une seule application

| Couche | Emplacement | Rôle |
| --- | --- | --- |
| Application PULSE | `pulse-v14-src/` → `site/pulse-v14/` | Servie sur pulse.komolongevity.com (réécriture `middleware.js` et `vercel.json`). |
| Caméra du cabinet | `pulse-v14-src/camera/` | Page iPhone : rejoint la consultation préparée sur l'ordinateur. |
| Moteur de mouvement | `pulse-v14-src/motion-engine/` | Suivi de pose local, compteurs, équilibre, profil, voix, questionnaire. |
| Protocole | `pulse-v14-src/motion-protocol.mjs` | **Source unique** : 13 étapes, consignes, bornes, motifs de non-réalisation. |
| Serveur | `supabase/functions/motion-live-test/` | `index.ts` + `protocol.ts` (copie générée du protocole). |

PULSE v12 et v13 ne sont plus publiées : `scripts/pulse-retire-legacy-generations.mjs` retire leurs dossiers du build et `vercel.json` redirige `/pulse-v12/*` et `/pulse-v13/*` vers pulse.komolongevity.com. `pulse-app/` et `pulse-v13-src/` restent des entrées de la chaîne de build, car des passes du site public en dépendent. Leur suppression complète demande un chantier dédié.

## Protocole KŌMØ Motion

- Identifiant `KOMO_MOTION_V2`, version `2.0.0`, mode `CORE`.
- Chaque consultation reçoit `progress.protocol` : identifiant, version, ordre des tests, appareils.
- Chaque résultat porte `protocol` et `protocol_version`.
- Un test non réalisé exige un motif : `safety`, `pain`, `refusal`, `device_unavailable`, `technical_error` ou `other`.
- Les conditions d'acquisition sont saisies à l'étape 1 : chaussage et aide de marche. La distance pad–malléole est saisie au genou.
- La trajectoire signale tout écart de chaussage, de version du protocole, de position du pad ou de source du comptage.

Pour modifier le protocole :

1. Éditer `pulse-v14-src/motion-protocol.mjs`.
2. Lancer `node scripts/motion-protocol-sync.mjs`.
3. Déployer `motion-live-test` avec `index.ts` et `protocol.ts`.

Le build échoue si la copie serveur diverge de la source.

## Version du front

Toutes les références locales portent la même étiquette `?v=`. Pour la changer : `node scripts/pulse-v14-release.mjs AAAAMMJJ-libelle`. Le contrôle `scripts/pulse-v14-standard-qa.mjs` refuse :

- une étiquette multiple ;
- un fichier orphelin ;
- une référence cassée ;
- toute trace de l'offre à distance retirée.

## Centres (`organizations`)

| Centre | Statut des données | Usage |
| --- | --- | --- |
| KŌMØ Beausoleil — Clinique HIRO | `production_enabled` | Consultations réelles pseudonymisées (code HIRO-AAMMJJ-NN, année de naissance). |
| KŌMØ Cannes | `test_only` | Démonstration et répétition. À passer en `production_enabled` le jour des consultations réelles à la Maison Epigenetic. |
| Komo Clinic, Myodev, KOMO LONGEVITY, Lily of the Valley — TEST | archivés | Anciens centres de test (réversible). |

## Fonctions serveur

- **Utilisées par PULSE :**
  - `motion-live-test` : consultation, caméra, résultats, questionnaire, historique.
  - `professional-patient` : création de dossier.
- **Autres applications :** `world-card`, `world-admin`, `gstaad-state`, `command-state`, `pulse-notify` (API), `myocare-webhook` (partenaire, signé HMAC).
- **Ancienne offre à distance**, à désactiver une fois le lien Stripe coupé : `motion-online-guest`, `motion-online-dossier`, `motion-online-operator`, `motion-online-stripe-dossier`, `motion-200-intake`.
- **Ancienne PULSE v12**, inertes car elles exigent un JWT et ne sont plus appelées : `admin-*`, `center-*`, `professional-admin`, `professional-dashboard`, `professional-application`, `patient-intake`, `motion-journey-status`, `komo-operator-*`, `myocare-admin`, `privacy-*`, `pulse-config-health`, `temp-check`, `komo-founder-run-v1`. `komo-openai-health-v1` est déjà désactivée (HTTP 410).
