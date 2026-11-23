# Transcription de la feuille de mesures dans PULSE

Circuit validé le 22/11/2026 : le praticien fait les tests avec la feuille de mesures papier, envoie une photo de cette page à Claude, et Claude enregistre les valeurs dans la consultation PULSE. Le rapport, le passeport PDF, la page « Mon bilan » du patient et la trajectoire à 6 semaines fonctionnent ensuite comme après une saisie dans la console.

Les règles sont celles du serveur. `pulse-transcribe.ts` exécute le code de l'edge function `motion-live-test` (action `operator_results_bulk`) sur une copie locale de la consultation. Bornes, calculs (symétrie, vitesse, meilleur essai) et traçabilité sont donc identiques.

## Procédure

### 1. Lire la photo

- Code PULSE.
- Case « Sécurité vérifiée ».
- Chaque ligne, avec :
  - N ou kg pour le DynaMo ;
  - le côté le plus chargé ;
  - les deux essais sur un pied ;
  - les deux passages de marche ;
  - le nombre de levers ;
  - les tests non réalisés et leur motif.

Une valeur illisible ou ambiguë n'est jamais devinée : on la demande au praticien.

### 2. Retrouver la consultation

Requête SQL via le connecteur Supabase, projet `uqlolefsiktbznnymriy`. Elle prend la dernière consultation du code :

```sql
select jsonb_build_object(
 'code', p.last_name,
 'session', jsonb_build_object('id',s.id,'organization_id',s.organization_id,'operator_user_id',s.operator_user_id,'patient_id',s.patient_id,
   'operator_session_id',s.operator_session_id,'display_code',s.display_code,'status',s.status,'stage_code',s.stage_code,'step_index',s.step_index,
   'created_at',s.created_at,'updated_at',s.updated_at,'expires_at',s.expires_at,'completed_at',s.completed_at,
   'progress',jsonb_strip_nulls(jsonb_build_object('results',coalesce(s.progress->'results','{}'::jsonb),'safety_confirmed',s.progress->'safety_confirmed',
     'protocol',s.progress->'protocol','paper_transcription',s.progress->'paper_transcription'))),
 'patient', jsonb_build_object('data_classification',p.data_classification,'status',p.status,'sex_at_birth',p.sex_at_birth),
 'center', jsonb_build_object('clinical_data_status',o.clinical_data_status,'name',o.name)) as saisie
from pulse_motion_live_sessions s join patients p on p.id=s.patient_id join organizations o on o.id=s.organization_id
where p.last_name = 'HIRO-AAMMJJ-NN' and s.status in ('active','completed')
order by s.created_at desc limit 1;
```

Pas de résultat : la consultation n'a pas été créée dans PULSE. Le praticien la crée (Patients → code → Consultation), puis on reprend.

### 3. Préparer `saisie.json`

Partir du résultat de l'étape 2 et y ajouter deux clés : `safety_confirmed` (case cochée sur la feuille) et `values`. Les clés de champs sont celles de `pulse-v14-src/motion-protocol.mjs`.

```json
{
  "code": "HIRO-261124-01",
  "session": {"…": "résultat de l'étape 2"},
  "patient": {"…": "…"},
  "center": {"…": "…"},
  "safety_confirmed": true,
  "values": {
    "dynamo_grip": {"unit": "kg", "fields": {"grip_left_n": 28.4, "grip_right_n": 30.1}},
    "anthropometry": {"fields": {"body_mass_kg": 68.5, "height_cm": 165, "footwear": "socks", "walking_aid": "none"}},
    "fd_quiet_stand": {"fields": {"fd_qs_cop_ml_mm": 9.8, "fd_qs_cop_ap_mm": 16.4, "fd_qs_velocity_mms": 8.9, "fd_qs_asym_pct": 4.1, "fd_qs_asym_side": "left"}},
    "unipodal_left": {"trials": [12.4, 18.0], "fields": {}},
    "unipodal_right": {"trials": [30, 30], "fields": {"sls_right_velocity_mms": 34.0}},
    "gait_4m": {"fields": {"gait_4m_s_1": 3.42, "gait_4m_s_2": 3.38}},
    "fd_cmj": {"skip_reason": "pain", "note": "Genou droit sensible"},
    "sts": {"value": 14}
  }
}
```

Règles de saisie :

- **DynaMo** : `"unit": "kg"` si la case kg est cochée. La conversion en newtons est automatique.
- **Appui sur un pied** : mettre les deux essais dans `trials`. Le meilleur est retenu. La vitesse CoP ne se met que si 30 s ont été tenues.
- **Côtés** : `left`, `right` ou `balanced`.
- **Chaussage** : `barefoot`, `socks` ou `shoes`.
- **Aide de marche** : `none`, `cane`, `walker` ou `other`.
- **Motifs de test non réalisé** : `safety`, `pain`, `refusal`, `device_unavailable`, `technical_error` ou `other`.
- **Test laissé vide sur la feuille** : on ne le met pas dans `values`. Il reste « à faire » dans PULSE.

### 4. Générer le récapitulatif et les requêtes

```bash
npm i deno   # si deno n'est pas installé
deno run -A --no-check scripts/transcription/pulse-transcribe.ts saisie.json /tmp/transcription/CODE.sql
```

Le script affiche le récapitulatif : valeurs, conversions, symétries, vitesse, puissance estimée, et alertes de vraisemblance ⚠. Si une valeur viole une règle PULSE, il refuse et nomme le test.

### 5. Faire relire avant d'écrire

Envoyer le récapitulatif au praticien. Il le compare à sa feuille et répond « OK » ou corrige. **Rien n'est écrit sans son accord.**

### 6. Écrire

Exécuter `CODE.sql` via le connecteur Supabase :

- La requête n'ajoute que les tests transcrits.
- Elle ne touche pas au questionnaire, au lien patient ni aux autres tests.
- Elle est refusée (0 ligne) si la consultation a changé depuis l'étape 2. Dans ce cas, refaire les étapes 2 à 4.

### 7. Contrôler

Exécuter `CODE.controle.sql`. Le résultat attendu est `conforme = true`, avec le bon nombre de tests et le statut `completed` si les 14 tests sont traités.

Prévenir ensuite le praticien. La console passe au Rapport au prochain rafraîchissement. La page « Mon bilan » du patient affiche « en relecture » : les résultats n'y apparaissent qu'après « Valider et rendre visible au patient » (bas du Rapport, action serveur `operator_patient_release`). Claude ne valide jamais à la place du praticien.

## Limites

- Transcription possible jusqu'à 7 jours après la création de la consultation. La salle « en direct » expire après 4 h, ce qui n'empêche pas la transcription.
- Chaque résultat garde sa trace :
  - `entry_mode: "paper_transcription"` ;
  - `progress.paper_transcription = {at, by: "assistant", steps}`.
- Une photo ne doit jamais montrer la fiche patient (page 1 : nom, signature). Seule la feuille de mesures, qui ne porte que le code, est transmise.
