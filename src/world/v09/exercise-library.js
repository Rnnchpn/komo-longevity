export const EXERCISES = {
  squat10: {
    id: 'squat10',
    kind: 'game',
    title: { fr: 'Squat 10', en: 'Squat 10' },
    short: { fr: '10 squats contrôlés', en: '10 controlled squats' },
    targetReps: 10,
    camera: 'front45_or_side',
    primaryDomain: 'muscle',
    publicScore: true,
    metrics: ['reps', 'tempo', 'rom_estimate', 'gross_symmetry'],
    progression: 'chair_squat -> bodyweight_squat -> tempo_squat'
  },
  pushup10: {
    id: 'pushup10',
    kind: 'game',
    title: { fr: 'Pompes 10', en: 'Push-up 10' },
    short: { fr: '10 répétitions contrôlées', en: '10 controlled repetitions' },
    targetReps: 10,
    camera: 'side',
    primaryDomain: 'upper_body',
    publicScore: true,
    metrics: ['reps', 'tempo', 'elbow_rom_estimate', 'body_line_estimate'],
    progression: 'wall -> incline -> floor'
  },
  sitstand10: {
    id: 'sitstand10',
    kind: 'rehab',
    title: { fr: 'Assis-debout 10', en: 'Sit-to-Stand 10' },
    short: { fr: '10 levers de chaise', en: '10 chair rises' },
    targetReps: 10,
    camera: 'side_or_front45',
    primaryDomain: 'muscle',
    publicScore: false,
    metrics: ['reps', 'tempo', 'knee_rom_estimate'],
    progression: 'supported -> standard -> slower_eccentric'
  },
  balance30: {
    id: 'balance30',
    kind: 'rehab',
    title: { fr: 'Équilibre 30 s', en: 'Balance 30 s' },
    short: { fr: 'Tenue stable 30 secondes', en: '30-second stable hold' },
    targetSeconds: 30,
    camera: 'front',
    primaryDomain: 'balance',
    publicScore: false,
    metrics: ['time', 'stability_estimate', 'trunk_sway_estimate'],
    progression: 'feet_together -> semi_tandem -> tandem -> single_leg'
  }
};

export const REHAB_RULES = [
  {
    id: 'balance-first',
    when: s => Number(s?.domains?.balance) < 72,
    exerciseId: 'balance30',
    reason: {
      fr: 'Le domaine équilibre est actuellement prioritaire. On commence par une tâche stable et simple avant d’augmenter la difficulté.',
      en: 'Balance is currently the priority domain. Start with a simple stable task before increasing difficulty.'
    }
  },
  {
    id: 'functional-strength',
    when: s => Number(s?.domains?.muscle) < 78 || Number(s?.metrics?.strength_index) < 78,
    exerciseId: 'sitstand10',
    reason: {
      fr: 'La force fonctionnelle des membres inférieurs est la cible prioritaire. L’assis-debout est une première tâche facilement observable à la caméra.',
      en: 'Functional lower-limb strength is the priority. Sit-to-stand is a first task that is easy to observe with the camera.'
    }
  },
  {
    id: 'gait-support',
    when: s => Number(s?.metrics?.gait_speed) < 1.1,
    exerciseId: 'sitstand10',
    reason: {
      fr: 'La capacité de marche est basse dans ce snapshot ; KŌMØ privilégie d’abord une base force/fonction avant des défis de locomotion plus complexes.',
      en: 'Gait capacity is low in this snapshot; KŌMØ prioritizes a strength/function base before more complex locomotion challenges.'
    }
  }
];

export function recommendExercise(snapshot) {
  for (const rule of REHAB_RULES) {
    if (rule.when(snapshot)) return { exercise: EXERCISES[rule.exerciseId], reason: rule.reason, ruleId: rule.id };
  }
  return {
    exercise: EXERCISES.squat10,
    ruleId: 'healthy-game-default',
    reason: {
      fr: 'Aucun déficit dominant n’est utilisé ici pour générer une prescription : KŌMØ propose donc un challenge général de mouvement.',
      en: 'No dominant deficit is being used here to generate a prescription, so KŌMØ offers a general movement challenge.'
    }
  };
}
