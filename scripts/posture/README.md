# Posture sur photo de profil

Mis en place le 23/11/2026. Le praticien prend une photo de profil du patient et l'envoie à Claude avec le code du patient, jamais son nom. Claude mesure l'alignement, puis enregistre les mesures dans la consultation PULSE après le « OK » du praticien.

La photo n'est conservée nulle part. Elle n'est pas enregistrée dans PULSE, et Claude efface sa copie de travail et l'image annotée une fois les mesures écrites. Seuls les angles et l'observation sont enregistrés, comme complément `posture_photo` du protocole (`pulse-v14-src/motion-protocol.mjs`, `COMPLEMENTS`).

Le complément ne compte pas dans les 14 tests. Il ne bloque ni la fin de la consultation ni l'envoi au patient.

## Prise de vue (consigne au praticien)

- **Patient :** pieds nus, short ou vêtements près du corps, oreille dégagée. Debout de profil, côté droit vers l'appareil, poids sur les deux pieds, bras relâchés, regard droit devant. Mur uni derrière.
- **Appareil :** iPhone en vertical, tenu droit, à hauteur de hanche, à 3 m du patient. Tout le corps dans l'image, sans zoom.
- **Nombre :** une seule photo. Même cadrage au contrôle de 6 semaines.

## Procédure

1. **Préparer l'outil.** Une fois par session de travail :
   ```
   npm pack @mediapipe/pose
   tar xzf mediapipe-pose-*.tgz -C /home/claude/tools/mediapipe-pose --strip-components=1
   ```
   `puppeteer-core` doit être installé dans `/home/claude/tools` et Chrome dans `/usr/bin/google-chrome`. Le modèle tourne hors ligne : rien n'est envoyé ailleurs.
2. **Mesurer.**
   ```
   node scripts/posture/pulse-posture.mjs photo.jpg --out /tmp/posture-CODE
   ```
   L'outil produit `posture.json` (points, angles, contrôles) et `posture-annotee.png`.
3. **Vérifier l'image annotée à l'œil.** Contrôler chaque point : oreille, épaule, hanche, genou, cheville, ainsi que le sens du regard. Si un point est faux, ou si un contrôle échoue (`points_visibles`, `corps_entier`, `profil_strict`), demander une nouvelle photo au praticien. Ne jamais corriger un point à la main.
4. **Choisir l'observation**, sans diagnostic :
   - `neutral` : alignement apparent neutre. Oreille, épaule, hanche et cheville proches d'une même verticale.
   - `apparent_offset` : décalage sagittal apparent. Tête nettement en avant des épaules, tronc incliné, bassin projeté en avant des chevilles, ou genou en arrière.
   - `not_interpretable` : photo de biais, corps coupé, vêtements amples, patient en mouvement.
5. **Envoyer le récapitulatif au praticien**, avec l'image annotée et les angles. Il répond « OK » ou demande une nouvelle photo.
6. **Écrire avec l'outil de transcription** (`scripts/transcription/README.md`, étapes 2 à 7), avec dans `values` :
   ```json
   "posture_photo": {"fields": {"pp_head_forward_deg": 14.2, "pp_trunk_lean_deg": 2.1, "pp_hip_shift_deg": 3.4,
     "pp_knee_flex_deg": -1.5, "pp_global_lean_deg": 3.0, "pp_observation": "neutral", "pp_side": "right"}}
   ```
   Le serveur enregistre `source: "photo_measurement"` et `photo_retained: false`.
7. **Effacer** la photo reçue, la copie de travail et `/tmp/posture-CODE`.

## Les mesures

Angles en degrés par rapport à la verticale de l'image. Positif signifie vers l'avant, dans le sens du regard.

| Clé | Segment | Lecture |
|---|---|---|
| `pp_head_forward_deg` | épaule → oreille | tête en avant des épaules |
| `pp_trunk_lean_deg` | hanche → épaule | tronc penché en avant |
| `pp_hip_shift_deg` | cheville → hanche | bassin projeté en avant |
| `pp_knee_flex_deg` | 180° − angle hanche-genou-cheville | négatif : genou en arrière de la ligne |
| `pp_global_lean_deg` | cheville → oreille | inclinaison d'ensemble |

## Limites

- **Pas de norme de population :** ce sont des repères de suivi personnel. La trajectoire retient 5° comme marge pour l'avancée de la tête.
- **Sensibilité :** les angles dépendent du cadrage. Un iPhone penché ou trop proche, des vêtements amples ou une posture inhabituelle changent les valeurs. D'où la consigne fixe, et la même consigne au contrôle.
- **Points détectés :** l'oreille et l'épaule ne sont pas des repères anatomiques posés sur la peau. L'angle n'est pas l'angle cranio-vertébral (C7-tragus) des études et ne s'y compare pas.
