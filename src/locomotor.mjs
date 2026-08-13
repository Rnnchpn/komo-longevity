export const locomotorReferences = [
  {
    index: '01',
    citation: 'Japanese Orthopaedic Association. LOCOMO ONLINE: definition, Locomotive Syndrome Risk Test and Locomotion Training.',
    url: 'https://locomo-joa.jp/en'
  },
  {
    index: '02',
    citation: 'Nakamura K. A “super-aged” society and the “locomotive syndrome”. Journal of Orthopaedic Science. 2008;13:1–2.',
    url: 'https://doi.org/10.1007/s00776-007-1202-6'
  },
  {
    index: '03',
    citation: 'Seichi A, Hoshino Y, Doi T, et al. Development of the 25-question Geriatric Locomotive Function Scale. Journal of Orthopaedic Science. 2012;17:163–172.',
    url: 'https://doi.org/10.1007/s00776-011-0193-5'
  },
  {
    index: '04',
    citation: 'Yoshimura N, Iidaka T, Horii C, et al. Epidemiology of locomotive syndrome using updated clinical decision limits: 6-year follow-ups of the ROAD study. Journal of Bone and Mineral Metabolism. 2022;40:623–635.',
    url: 'https://doi.org/10.1007/s00774-022-01324-8'
  },
  {
    index: '05',
    citation: 'Yoshimura N, Muraki S, Iidaka T, et al. Prevalence and co-existence of locomotive syndrome, sarcopenia, and frailty: the ROAD study. Journal of Bone and Mineral Metabolism. 2019;37:1058–1066.',
    url: 'https://doi.org/10.1007/s00774-019-01012-0'
  },
  {
    index: '06',
    citation: 'Nishimura A, Ohtsuki M, Kato T, et al. Locomotive syndrome testing in young and middle adulthood. Modern Rheumatology. 2020;30:178–183.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/30501428/'
  },
  {
    index: '07',
    citation: 'Iwamoto Y, Imura T, Takahashi M, Tanaka R. Interventions to improve locomotive syndrome: a systematic review and meta-analysis of randomized controlled trials. Nagoya Journal of Medical Science. 2023;85:275–288.',
    url: 'https://doi.org/10.18999/nagjms.85.2.275'
  },
  {
    index: '08',
    citation: 'Iwamoto Y, Imura T, Hirata K, et al. The risk factors for development or progression of locomotive syndrome: a systematic review. Nagoya Journal of Medical Science. 2025;87:60–75.',
    url: 'https://doi.org/10.18999/nagjms.87.1.60'
  }
];

export const locomotorCopy = {
  en: {
    metaTitle: 'Locomotor syndrome — Definition, tests and evidence | KŌMØ',
    metaDescription: 'A clinically responsible guide to locomotive syndrome: JOA definition, 2020 stages, Stand-Up Test, Two-Step Test, GLFS-25, evidence and limits.',
    eyebrow: 'KŌMØ LOCOMOTOR · EVIDENCE-LED GUIDE',
    title: 'Locomotive syndrome.<br><em>Mobility, made visible.</em>',
    lead: 'Locomotive syndrome is a Japanese framework for recognising reduced mobility related to the locomotor system. Here is what it means, how the three JOA tests classify severity, and what the evidence can — and cannot — tell us.',
    note: 'Educational content · JOA framework credited · no online diagnosis · literature reviewed August 2026',
    heroPrimary: 'Understand the 3-stage framework',
    heroSecondary: 'Explore KŌMØ Pulse',
    heroCard: {
      label: 'JOA reference framework',
      title: 'Three tests.<br>One severity level.',
      rows: [
        ['01', 'Stand-Up Test', 'Lower-limb strength and balance'],
        ['02', 'Two-Step Test', 'Maximum functional stride'],
        ['03', 'GLFS-25', 'Symptoms and daily-life function']
      ],
      foot: 'The highest stage reached on any component determines the overall stage.'
    },
    jumpLabel: 'On this page',
    jumps: [['#definition', 'Definition'], ['#framework', 'Stages'], ['#tests', 'The 3 tests'], ['#action', 'What to do'], ['#evidence', 'Evidence'], ['#komo-layer', 'KŌMØ layer']],
    definition: {
      eyebrow: '01 · THE CONCEPT',
      title: 'A functional framework,<br>not a single <em>disease.</em>',
      lead: 'The Japanese Orthopaedic Association introduced locomotive syndrome in 2007. It describes reduced ability to stand, walk and move because of disorders or decline within the locomotor system, with increasing risk of future care needs as severity progresses.',
      originTitle: 'Where it comes from',
      originBody: 'The concept was created in Japan to make mobility decline visible before loss of independence becomes established. It is a public-health and clinical framework; it does not replace diagnosis of the underlying orthopaedic, neurological or systemic condition.',
      systemTitle: 'What the locomotor system includes',
      systemBody: 'Movement emerges from an integrated system. A change in one component can be compensated for — until the reserve of the whole system becomes insufficient.',
      components: [
        ['Bones', 'Support, load transmission and fracture resistance.'],
        ['Joints & spine', 'Range, alignment and efficient transfer of force.'],
        ['Muscles & tendons', 'Force, power, endurance and control of movement.'],
        ['Nerves & sensory systems', 'Motor command, sensation, balance and adaptation.']
      ],
      notTitle: 'What it is not',
      notItems: ['Not a synonym for normal ageing.', 'Not a diagnosis of osteoarthritis, osteoporosis, sarcopenia or spinal disease.', 'Not an individual prediction of falls, disability or mortality.', 'Not a proprietary KŌMØ concept. The framework belongs to the JOA.']
    },
    framework: {
      eyebrow: '02 · JOA 2020 CRITERIA',
      title: 'Four states.<br><em>Three levels</em> of decline.',
      lead: 'The current JOA framework distinguishes no locomotive syndrome (stage 0) and stages 1–3. The overall stage is the most severe result obtained on the Stand-Up Test, Two-Step Test or GLFS-25.',
      stageCards: [
        ['0', 'No criterion reached', 'All three results remain outside stage 1 thresholds.', 'Maintain activity and reassess only when useful.'],
        ['1', 'Decline is beginning', 'A first threshold is reached on at least one component.', 'Build regular strength, balance and activity habits.'],
        ['2', 'Decline is progressing', 'Mobility limitation is more established.', 'A professional assessment is appropriate, especially with pain or falls.'],
        ['3', 'Social participation is affected', 'Severe limitation is present on at least one component.', 'Clinical evaluation and treatment of underlying causes are recommended.']
      ],
      tableCaption: 'JOA clinical decision limits',
      headers: ['Component', 'Stage 0', 'Stage 1', 'Stage 2', 'Stage 3'],
      rows: [
        ['Stand-Up Test', 'Rises from 40 cm on one leg, on both sides', 'Cannot rise from 40 cm on one leg on one or both sides, but can rise from 20 cm on both legs', 'Cannot rise from 20 cm on both legs, but can rise from 30 cm', 'Cannot rise from 30 cm on both legs'],
        ['Two-Step score', '≥ 1.3', '≥ 1.1 and < 1.3', '≥ 0.9 and < 1.1', '< 0.9'],
        ['GLFS-25', '0–6', '7–15', '16–23', '≥ 24']
      ],
      formula: 'Two-Step score = total length of two maximal steps ÷ height',
      caveatTitle: 'Classification is not a causal diagnosis',
      caveatBody: 'Two people can reach the same stage for different reasons. Pain, osteoarthritis, spinal or neurological disease, osteoporosis, muscle weakness, balance impairment, deconditioning and other causes require their own clinical assessment.'
    },
    tests: {
      eyebrow: '03 · THE LOCOMOTIVE SYNDROME RISK TEST',
      title: 'Three complementary views<br>of the same <em>function.</em>',
      lead: 'One performance test cannot describe the whole person. The JOA combines two physical tests with one patient-reported scale.',
      methodLabel: 'Method',
      safetyLabel: 'Safety',
      cards: [
        {
          number: '01', title: 'Stand-Up Test', purpose: 'Leg strength · balance',
          visualAlt: 'Illustrated sequence of sitting, rising and standing with arms folded, with the four official seat heights.',
          body: 'The person rises from seats 40, 30, 20 and 10 cm high, using both legs and then one leg according to the official sequence. Arms remain folded and the standing position is held for three seconds.',
          detail: 'The result is the lowest successful height and whether the task was completed on two legs or separately on both single legs.',
          safety: 'Stop if knee or other pain appears. Avoid momentum and protect against a backward fall.'
        },
        {
          number: '02', title: 'Two-Step Test', purpose: 'Stride · dynamic control',
          visualAlt: 'Illustrated sequence of the starting position and two maximal consecutive steps, with distance divided by height.',
          body: 'From a marked line, the person takes two consecutive maximal steps, brings the feet together and remains balanced. The distance is measured twice; the better valid attempt is divided by height.',
          detail: 'A trial is invalid if balance is lost or if the person jumps. Use a non-slip surface and adequate space.',
          safety: 'The JOA advises a caregiver, warm-up and a non-slippery floor.'
        },
        {
          number: '03', title: 'GLFS-25', purpose: 'Symptoms · daily life · participation',
          visualAlt: 'Illustration of the 25-item questionnaire and its five response levels from zero to four.',
          body: 'A 25-item self-administered questionnaire explores pain, movement-related difficulty, activities of daily living, social function and psychological concerns over the preceding month.',
          detail: 'Each item is scored 0–4; the total ranges from 0 to 100. Higher scores indicate greater perceived locomotive difficulty.',
          safety: 'Use an authorised language version and the official scoring instructions.'
        }
      ],
      sourceCta: 'Open the official JOA instructions',
      safetyTitle: 'Do not turn a functional test into a fall',
      safetyBody: 'Do not perform the physical tests alone when balance is uncertain, after a recent injury or operation, during acute pain, or if a clinician has advised activity restrictions. An online result cannot rule out disease or determine treatment.'
    },
    distinctions: {
      eyebrow: '04 · RELATED, NOT IDENTICAL',
      title: 'Locomotive syndrome,<br>sarcopenia and <em>frailty.</em>',
      lead: 'These constructs overlap, especially in older adults, but one is not simply the advanced stage of another.',
      headers: ['Framework', 'Primary focus', 'Typical assessment', 'Key distinction'],
      rows: [
        ['Locomotive syndrome', 'Mobility decline related to the locomotor system', 'Stand-Up, Two-Step and GLFS-25', 'Broad functional framework originating from the JOA'],
        ['Sarcopenia', 'Skeletal muscle strength, quantity/quality and physical performance', 'Grip strength, chair rise, muscle mass and gait/performance criteria', 'A muscle disorder with international consensus definitions'],
        ['Frailty', 'Reduced multisystem reserve and vulnerability to stressors', 'Physical phenotype or multidomain frailty tools', 'Broader than the locomotor system; definitions vary']
      ],
      foot: 'Population studies show substantial coexistence, but also many people with locomotive syndrome who do not meet sarcopenia or frailty criteria.'
    },
    action: {
      eyebrow: '05 · FROM A RESULT TO A DECISION',
      title: 'Measure less often.<br>Act more <em>intelligently.</em>',
      lead: 'The stage is a signal to understand, not a prescription. The useful next step depends on symptoms, causes, goals and safety.',
      steps: [
        ['01', 'Look for the cause', 'Pain, weakness, joint or spinal disease, neurological signs, medication effects, vision, vestibular function and recent falls can change interpretation.'],
        ['02', 'Build movement capacity', 'Progressive lower-limb strengthening, balance work and aerobic activity are commonly used. The JOA’s basic Locomotion Training includes supported single-leg standing and squats.'],
        ['03', 'Treat what is treatable', 'Rehabilitation, disease-specific treatment, fall-risk reduction, appropriate nutrition and environmental changes may be relevant after assessment.'],
        ['04', 'Repeat under comparable conditions', 'Longitudinal value comes from standardised technique, the same scoring rules and an interval long enough for meaningful change.']
      ],
      trainingEyebrow: 'JOA · BASIC LOCOMOTION TRAINING',
      trainingTitle: 'Two simple exercises,<br>with <em>support when needed.</em>',
      trainingLead: 'The JOA presents supported single-leg standing and squats as its basic Locomotion Training. They are general examples, not an individual prescription; pain, recent injury, balance difficulty or medical restrictions call for professional advice.',
      trainingCards: [
        ['01', 'Supported single-leg stand', 'Stand beside a stable table or chair. Lift one foot slightly without leaning the trunk; keep a fingertip or hand on the support whenever necessary.', 'Target in the JOA programme: 1 minute on each side, 3 times a day. Safety and control come before duration.'],
        ['02', 'Controlled squat', 'With the feet slightly wider than the shoulders, sit the hips back over 2–3 seconds while the knees track over the toes. Keep breathing and return smoothly.', 'Target in the JOA programme: 5–6 repetitions, 3 times a day. Do not descend beyond comfort; a chair sit-to-stand is an alternative.']
      ],
      evidenceTitle: 'What the intervention evidence says',
      evidenceBody: 'Individual trials report improvements with exercise and other interventions, but a 2023 systematic review found no strong evidence for one specific intervention across locomotive syndrome. Improvement is possible; “reversal” should never be guaranteed.',
      urgentTitle: 'Seek prompt medical assessment when mobility changes abruptly',
      urgentItems: ['Sudden or rapidly progressive weakness or inability to walk', 'New bladder or bowel dysfunction, saddle sensory change or major neurological deficit', 'Trauma followed by inability to bear weight, deformity or suspected fracture', 'Severe pain with fever, systemic illness or other concerning symptoms']
    },
    evidence: {
      eyebrow: '06 · WHAT IS ESTABLISHED — AND WHAT IS NOT',
      title: 'Useful evidence.<br>Clear <em>boundaries.</em>',
      lead: 'The strongest evidence supports the construct and its association with mobility limitation in Japanese populations. Translation into an individual prognosis or a universal screening programme requires caution.',
      cards: [
        ['2007', 'Concept introduced', 'The JOA introduced locomotive syndrome as a framework linking locomotor disorders, mobility and future care needs.'],
        ['2020', 'Stage 3 added', 'Clinical decision limits were revised to distinguish severe decline affecting social participation.'],
        ['6 years', 'Longitudinal follow-up', 'In the Japanese ROAD cohort, stage 3 was associated with subsequent disability and mortality. This is an association, not an individual forecast.'],
        ['Japan', 'Evidence geography', 'Most prevalence, threshold and outcome data originate in Japan; estimates should not be transplanted directly to other populations.']
      ],
      prevalenceTitle: 'A useful Japanese reference — not a European prevalence estimate',
      prevalenceBody: 'Using the updated criteria in the ROAD cohort, mutually exclusive prevalence estimates were 41.3% for stage 1, 14.9% for stage 2 and 11.6% for stage 3. The cohort’s age structure and Japanese context matter.',
      youngerTitle: 'Is it only relevant after 65?',
      youngerBody: 'Cross-sectional studies have identified abnormal test results in working-age adults, but this does not establish benefit from universal screening from age 30. Outside Japan, age thresholds, pathways and cost-effectiveness remain to be established.',
      status: [['Established', 'JOA definition; three-component framework; 2020 thresholds; associations with mobility limitation.'], ['Context-dependent', 'Prevalence, prognosis and optimal reassessment interval outside Japanese cohorts.'], ['Research', 'Personalised trajectories, composite scores, movement age and prediction of individual outcomes.']]
    },
    komo: {
      eyebrow: '07 · THE KŌMØ LAYER',
      title: 'Respect the reference.<br>Add the <em>trajectory.</em>',
      lead: 'KŌMØ uses the JOA framework as a credited reference layer. It does not rename locomotive syndrome or alter its thresholds.',
      additions: [
        ['Reference', 'Preserve the official Stand-Up, Two-Step and GLFS-25 logic when the Locomo stage is reported.'],
        ['Context', 'Relate function to pain, history, goals, environment and the clinician’s examination.'],
        ['Measurement', 'When clinically justified, add supervised gait, neuromuscular, strength, balance or posture measures — clearly labelled as non-JOA data.'],
        ['Trajectory', 'Repeat comparable measures over time and make change understandable without claiming deterministic prediction.']
      ],
      statusTitle: 'Methodological status',
      statusBody: 'The KŌMØ Motion Score, Movement Age and extended measurement architecture are methodological and research outputs under progressive validation. They are not part of the JOA definition and must not be presented as validated diagnostics.',
      cta: 'See the KŌMØ clinical pathway'
    },
    faq: {
      eyebrow: '08 · ESSENTIAL QUESTIONS',
      title: 'Questions,<br>answered <em>precisely.</em>',
      items: [
        ['Is locomotive syndrome a disease?', 'It is a syndrome and functional framework. It can reflect one or several underlying conditions, which still need their own diagnosis.'],
        ['Can it improve?', 'Mobility and test performance can improve, particularly when modifiable factors and underlying disorders are addressed. The magnitude and durability vary; no page or score can guarantee reversal.'],
        ['Do I need imaging or blood tests?', 'Not automatically. These are not part of the official three-component Locomo classification. A clinician may request them when history and examination suggest a specific indication.'],
        ['Can I diagnose myself?', 'No. Self-observation can start a conversation, but physical tests carry fall risk and the stage does not identify the cause.'],
        ['How often should the tests be repeated?', 'There is no universal interval for every person. Repeat testing should be driven by clinical context, intervention and the need to document meaningful change.'],
        ['Is KŌMØ the owner of the concept?', 'No. Locomotive syndrome and its official criteria originate from the Japanese Orthopaedic Association. KŌMØ credits that framework and separates it from its own developing method.']
      ]
    },
    references: {
      eyebrow: '09 · SOURCES',
      title: 'Read the<br><em>primary references.</em>',
      lead: 'A deliberately short bibliography: the official JOA resource, foundational papers, updated criteria, cohort evidence and intervention review.',
      link: 'Open source'
    },
    finalTitle: 'Understand the framework.<br>Keep the person <em>in view.</em>',
    finalText: 'KŌMØ turns mobility from an isolated result into a clinically responsible, longitudinal conversation.',
    finalCta: 'Explore KŌMØ Pulse'
  },

  fr: {
    metaTitle: 'Syndrome locomoteur — Définition, tests et preuves | KŌMØ',
    metaDescription: 'Guide responsable du syndrome locomoteur : définition JOA, degrés 2020, Stand-Up Test, Two-Step Test, GLFS-25, preuves et limites.',
    eyebrow: 'KŌMØ LOCOMOTOR · DOSSIER SCIENTIFIQUE',
    title: 'Le syndrome locomoteur.<br><em>La mobilité, rendue visible.</em>',
    lead: 'Le syndrome locomoteur est un cadre japonais destiné à repérer une diminution de la mobilité liée à l’appareil locomoteur. Voici sa signification, la classification par les trois tests JOA et ce que les données permettent — ou non — d’affirmer.',
    note: 'Contenu éducatif · cadre JOA crédité · aucun diagnostic en ligne · littérature revue en août 2026',
    heroPrimary: 'Comprendre les 3 degrés',
    heroSecondary: 'Explorer KŌMØ Pulse',
    heroCard: {
      label: 'Cadre de référence JOA',
      title: 'Trois tests.<br>Un degré global.',
      rows: [
        ['01', 'Stand-Up Test', 'Force des membres inférieurs et équilibre'],
        ['02', 'Two-Step Test', 'Enjambée fonctionnelle maximale'],
        ['03', 'GLFS-25', 'Symptômes et fonction quotidienne']
      ],
      foot: 'Le degré le plus élevé atteint par l’une des composantes détermine le degré global.'
    },
    jumpLabel: 'Dans ce dossier',
    jumps: [['#definition', 'Définition'], ['#framework', 'Degrés'], ['#tests', 'Les 3 tests'], ['#action', 'Conduite à tenir'], ['#evidence', 'Preuves'], ['#komo-layer', 'Couche KŌMØ']],
    definition: {
      eyebrow: '01 · LE CONCEPT',
      title: 'Un cadre fonctionnel,<br>pas une <em>maladie unique.</em>',
      lead: 'La Japanese Orthopaedic Association a introduit le syndrome locomoteur en 2007. Il décrit une diminution des capacités à se lever, marcher et se déplacer en raison d’atteintes ou d’un déclin de l’appareil locomoteur, avec un risque croissant de besoins d’aide lorsque la sévérité progresse.',
      originTitle: 'Son origine',
      originBody: 'Le concept a été créé au Japon pour rendre visible le déclin de la mobilité avant que la perte d’autonomie ne soit installée. C’est un cadre de santé publique et clinique ; il ne remplace pas le diagnostic de la cause orthopédique, neurologique ou systémique sous-jacente.',
      systemTitle: 'Ce que comprend l’appareil locomoteur',
      systemBody: 'Le mouvement émerge d’un système intégré. Une composante peut compenser l’autre — jusqu’à ce que la réserve de l’ensemble devienne insuffisante.',
      components: [
        ['Os', 'Soutien, transmission des charges et résistance fracturaire.'],
        ['Articulations & rachis', 'Amplitude, alignement et transfert efficient des forces.'],
        ['Muscles & tendons', 'Force, puissance, endurance et contrôle du mouvement.'],
        ['Nerfs & systèmes sensoriels', 'Commande motrice, sensibilité, équilibre et adaptation.']
      ],
      notTitle: 'Ce qu’il n’est pas',
      notItems: ['Ce n’est pas un synonyme du vieillissement normal.', 'Ce n’est pas un diagnostic d’arthrose, d’ostéoporose, de sarcopénie ou de pathologie rachidienne.', 'Ce n’est pas une prédiction individuelle de chute, de dépendance ou de mortalité.', 'Ce n’est pas un concept propriétaire KŌMØ. Le cadre appartient à la JOA.']
    },
    framework: {
      eyebrow: '02 · CRITÈRES JOA 2020',
      title: 'Quatre états.<br><em>Trois degrés</em> de déclin.',
      lead: 'Le cadre JOA actuel distingue l’absence de syndrome locomoteur (degré 0) et les degrés 1 à 3. Le degré global correspond au résultat le plus sévère du Stand-Up Test, du Two-Step Test ou du GLFS-25.',
      stageCards: [
        ['0', 'Aucun critère atteint', 'Les trois résultats restent en dehors des seuils du degré 1.', 'Entretenir l’activité et réévaluer seulement si cela est utile.'],
        ['1', 'Le déclin débute', 'Un premier seuil est atteint sur au moins une composante.', 'Installer des habitudes régulières de force, d’équilibre et d’activité.'],
        ['2', 'Le déclin progresse', 'La limitation de mobilité est davantage constituée.', 'Une évaluation professionnelle est pertinente, surtout en cas de douleur ou de chute.'],
        ['3', 'La participation sociale est affectée', 'Une limitation sévère est présente sur au moins une composante.', 'Une évaluation clinique et le traitement des causes sont recommandés.']
      ],
      tableCaption: 'Seuils décisionnels cliniques JOA',
      headers: ['Composante', 'Degré 0', 'Degré 1', 'Degré 2', 'Degré 3'],
      rows: [
        ['Stand-Up Test', 'Se relève de 40 cm sur une jambe, des deux côtés', 'Ne se relève pas de 40 cm sur une jambe d’un ou des deux côtés, mais se relève de 20 cm sur les deux jambes', 'Ne se relève pas de 20 cm sur les deux jambes, mais se relève de 30 cm', 'Ne se relève pas de 30 cm sur les deux jambes'],
        ['Score Two-Step', '≥ 1,3', '≥ 1,1 et < 1,3', '≥ 0,9 et < 1,1', '< 0,9'],
        ['GLFS-25', '0–6', '7–15', '16–23', '≥ 24']
      ],
      formula: 'Score Two-Step = longueur totale de deux pas maximaux ÷ taille',
      caveatTitle: 'La classification n’est pas un diagnostic causal',
      caveatBody: 'Deux personnes peuvent atteindre le même degré pour des raisons différentes. Douleur, arthrose, maladie rachidienne ou neurologique, ostéoporose, faiblesse musculaire, trouble de l’équilibre, déconditionnement et autres causes nécessitent leur propre évaluation clinique.'
    },
    tests: {
      eyebrow: '03 · LOCOMOTIVE SYNDROME RISK TEST',
      title: 'Trois regards complémentaires<br>sur une même <em>fonction.</em>',
      lead: 'Un test de performance isolé ne décrit pas une personne. La JOA associe deux tests physiques et une échelle rapportée par le patient.',
      methodLabel: 'Méthode',
      safetyLabel: 'Sécurité',
      cards: [
        {
          number: '01', title: 'Stand-Up Test', purpose: 'Force des jambes · équilibre',
          visualAlt: 'Séquence illustrée de la position assise au lever, bras croisés, avec les quatre hauteurs d’assise officielles.',
          body: 'La personne se relève d’assises de 40, 30, 20 et 10 cm, sur les deux jambes puis sur une jambe selon la séquence officielle. Les bras restent croisés et la station debout est maintenue trois secondes.',
          detail: 'Le résultat correspond à la plus faible hauteur réussie et précise si la tâche a été accomplie sur deux jambes ou séparément sur chacune des jambes.',
          safety: 'Arrêter en cas de douleur du genou ou autre douleur. Éviter l’élan et prévenir la chute en arrière.'
        },
        {
          number: '02', title: 'Two-Step Test', purpose: 'Enjambée · contrôle dynamique',
          visualAlt: 'Séquence illustrée de la position de départ et des deux pas maximaux, avec la distance divisée par la taille.',
          body: 'Depuis une ligne, la personne réalise deux pas maximaux consécutifs, rejoint les pieds et reste stable. La distance est mesurée deux fois ; le meilleur essai valide est divisé par la taille.',
          detail: 'L’essai est invalide en cas de perte d’équilibre ou de saut. Il faut un sol non glissant et un espace suffisant.',
          safety: 'La JOA recommande la présence d’un accompagnant, un échauffement et un sol non glissant.'
        },
        {
          number: '03', title: 'GLFS-25', purpose: 'Symptômes · vie quotidienne · participation',
          visualAlt: 'Illustration du questionnaire de 25 items et de ses cinq niveaux de réponse, de zéro à quatre.',
          body: 'Ce questionnaire auto-administré de 25 items explore la douleur, les difficultés de mouvement, les activités de la vie quotidienne, la fonction sociale et les préoccupations psychologiques du mois précédent.',
          detail: 'Chaque item est coté de 0 à 4 ; le total varie de 0 à 100. Un score plus élevé traduit davantage de difficultés locomotrices perçues.',
          safety: 'Utiliser une version linguistique autorisée et les instructions officielles de cotation.'
        }
      ],
      sourceCta: 'Ouvrir les instructions officielles JOA',
      safetyTitle: 'Ne pas transformer un test fonctionnel en chute',
      safetyBody: 'Ne réalisez pas les tests physiques seul si votre équilibre est incertain, après une blessure ou une opération récente, pendant une douleur aiguë, ou si un professionnel a limité votre activité. Un résultat en ligne ne peut ni exclure une pathologie ni déterminer un traitement.'
    },
    distinctions: {
      eyebrow: '04 · PROCHES, MAIS NON IDENTIQUES',
      title: 'Syndrome locomoteur,<br>sarcopénie et <em>fragilité.</em>',
      lead: 'Ces constructions se chevauchent, notamment chez la personne âgée, mais l’une n’est pas simplement le stade avancé d’une autre.',
      headers: ['Cadre', 'Objet principal', 'Évaluation typique', 'Distinction essentielle'],
      rows: [
        ['Syndrome locomoteur', 'Déclin de mobilité lié à l’appareil locomoteur', 'Stand-Up, Two-Step et GLFS-25', 'Cadre fonctionnel large issu de la JOA'],
        ['Sarcopénie', 'Force, quantité/qualité musculaire et performance physique', 'Préhension, lever de chaise, masse musculaire et critères de performance', 'Maladie musculaire définie par des consensus internationaux'],
        ['Fragilité', 'Diminution de la réserve multisystémique et vulnérabilité aux stress', 'Phénotype physique ou outils multidimensionnels', 'Cadre plus large que l’appareil locomoteur ; définitions variables']
      ],
      foot: 'Les études de population montrent une coexistence importante, mais aussi de nombreuses personnes avec syndrome locomoteur sans critère de sarcopénie ni de fragilité.'
    },
    action: {
      eyebrow: '05 · DU RÉSULTAT À LA DÉCISION',
      title: 'Mesurer moins souvent.<br>Agir plus <em>intelligemment.</em>',
      lead: 'Le degré est un signal à comprendre, pas une ordonnance. L’étape utile dépend des symptômes, des causes, des objectifs et de la sécurité.',
      steps: [
        ['01', 'Rechercher la cause', 'Douleur, faiblesse, atteinte articulaire ou rachidienne, signes neurologiques, médicaments, vision, fonction vestibulaire et chutes récentes modifient l’interprétation.'],
        ['02', 'Développer les capacités', 'Renforcement progressif des membres inférieurs, travail de l’équilibre et activité aérobie sont couramment utilisés. Le Locomotion Training de base de la JOA associe appui unipodal sécurisé et squats.'],
        ['03', 'Traiter ce qui peut l’être', 'Rééducation, traitement spécifique d’une pathologie, réduction du risque de chute, nutrition adaptée et modifications de l’environnement peuvent être indiqués après évaluation.'],
        ['04', 'Répéter dans des conditions comparables', 'La valeur longitudinale repose sur une technique standardisée, les mêmes règles de cotation et un intervalle permettant un changement significatif.']
      ],
      trainingEyebrow: 'JOA · LOCOMOTION TRAINING DE BASE',
      trainingTitle: 'Deux exercices simples,<br>avec un <em>appui si nécessaire.</em>',
      trainingLead: 'La JOA présente l’appui unipodal sécurisé et les squats comme son Locomotion Training de base. Ce sont des exemples généraux, pas une prescription individuelle ; douleur, traumatisme récent, trouble de l’équilibre ou restriction médicale justifient un avis professionnel.',
      trainingCards: [
        ['01', 'Appui unipodal sécurisé', 'Se placer près d’une table ou d’une chaise stable. Décoller légèrement un pied sans incliner le tronc ; garder un doigt ou une main sur l’appui dès que nécessaire.', 'Objectif du programme JOA : 1 minute de chaque côté, 3 fois par jour. La sécurité et le contrôle priment sur la durée.'],
        ['02', 'Squat contrôlé', 'Pieds un peu plus larges que les épaules, reculer les hanches en 2–3 secondes en gardant les genoux dans l’axe des orteils. Continuer à respirer puis remonter sans à-coup.', 'Objectif du programme JOA : 5–6 répétitions, 3 fois par jour. Ne pas descendre au-delà de la zone confortable ; le lever de chaise constitue une alternative.']
      ],
      evidenceTitle: 'Ce que disent les données d’intervention',
      evidenceBody: 'Des essais isolés rapportent des améliorations avec l’exercice et d’autres interventions, mais une revue systématique de 2023 n’a pas retrouvé de preuve forte en faveur d’une intervention spécifique pour l’ensemble du syndrome locomoteur. Une amélioration est possible ; une « réversion » ne doit jamais être garantie.',
      urgentTitle: 'Demander rapidement un avis médical si la mobilité change brutalement',
      urgentItems: ['Faiblesse soudaine ou rapidement progressive, ou impossibilité de marcher', 'Nouveaux troubles vésico-sphinctériens, anesthésie en selle ou déficit neurologique majeur', 'Traumatisme suivi d’une impossibilité d’appui, d’une déformation ou d’une suspicion de fracture', 'Douleur sévère avec fièvre, altération générale ou autre signe préoccupant']
    },
    evidence: {
      eyebrow: '06 · CE QUI EST ÉTABLI — ET CE QUI NE L’EST PAS',
      title: 'Des preuves utiles.<br>Des <em>limites claires.</em>',
      lead: 'Les données les plus solides soutiennent le concept et son association aux limitations de mobilité dans les populations japonaises. La traduction en pronostic individuel ou en dépistage universel exige de la prudence.',
      cards: [
        ['2007', 'Introduction du concept', 'La JOA a proposé le syndrome locomoteur pour relier atteintes de l’appareil locomoteur, mobilité et futurs besoins d’aide.'],
        ['2020', 'Ajout du degré 3', 'Les seuils décisionnels ont été révisés pour distinguer un déclin sévère affectant la participation sociale.'],
        ['6 ans', 'Suivi longitudinal', 'Dans la cohorte japonaise ROAD, le degré 3 était associé à la dépendance et à la mortalité ultérieures. Il s’agit d’une association, non d’une prédiction individuelle.'],
        ['Japon', 'Géographie des preuves', 'La majorité des données de prévalence, de seuils et de pronostic provient du Japon ; les estimations ne doivent pas être transposées directement.']
      ],
      prevalenceTitle: 'Une référence japonaise utile — pas une estimation européenne',
      prevalenceBody: 'Avec les critères actualisés dans la cohorte ROAD, les prévalences mutuellement exclusives étaient de 41,3 % pour le degré 1, 14,9 % pour le degré 2 et 11,6 % pour le degré 3. La structure d’âge et le contexte japonais sont déterminants.',
      youngerTitle: 'Le concept concerne-t-il seulement les plus de 65 ans ?',
      youngerBody: 'Des études transversales ont observé des résultats anormaux chez des adultes en âge de travailler, sans démontrer pour autant le bénéfice d’un dépistage universel dès 30 ans. Hors du Japon, les âges cibles, parcours et rapports coût-efficacité restent à établir.',
      status: [['Établi', 'Définition JOA ; cadre à trois composantes ; seuils 2020 ; associations avec la limitation de mobilité.'], ['Dépendant du contexte', 'Prévalence, pronostic et intervalle optimal de réévaluation hors des cohortes japonaises.'], ['Recherche', 'Trajectoires personnalisées, scores composites, âge du mouvement et prédiction individuelle.']]
    },
    komo: {
      eyebrow: '07 · LA COUCHE KŌMØ',
      title: 'Respecter la référence.<br>Ajouter la <em>trajectoire.</em>',
      lead: 'KŌMØ utilise le cadre JOA comme couche de référence explicitement créditée. KŌMØ ne renomme pas le syndrome locomoteur et n’en modifie pas les seuils.',
      additions: [
        ['Référence', 'Conserver la logique officielle Stand-Up, Two-Step et GLFS-25 lorsqu’un degré Locomo est rapporté.'],
        ['Contexte', 'Relier la fonction à la douleur, l’histoire, les objectifs, l’environnement et l’examen du clinicien.'],
        ['Mesure', 'Lorsque cela est cliniquement justifié, ajouter marche, contrôle neuromusculaire, force, équilibre ou posture — identifiés comme données hors JOA.'],
        ['Trajectoire', 'Répéter des mesures comparables et rendre le changement lisible sans revendiquer une prédiction déterministe.']
      ],
      statusTitle: 'Statut méthodologique',
      statusBody: 'Le KŌMØ Motion Score, le Movement Age et l’architecture de mesure étendue sont des productions méthodologiques et de recherche en validation progressive. Ils ne font pas partie de la définition JOA et ne doivent pas être présentés comme des diagnostics validés.',
      cta: 'Voir le parcours clinique KŌMØ'
    },
    faq: {
      eyebrow: '08 · QUESTIONS ESSENTIELLES',
      title: 'Des réponses<br><em>précises.</em>',
      items: [
        ['Le syndrome locomoteur est-il une maladie ?', 'C’est un syndrome et un cadre fonctionnel. Il peut refléter une ou plusieurs causes sous-jacentes, qui nécessitent toujours leur propre diagnostic.'],
        ['Peut-il s’améliorer ?', 'La mobilité et les performances aux tests peuvent s’améliorer, notamment lorsque les facteurs modifiables et les pathologies sous-jacentes sont pris en charge. L’amplitude et la durabilité varient ; aucun site ni score ne peut garantir une réversion.'],
        ['Faut-il une imagerie ou une prise de sang ?', 'Pas systématiquement. Elles ne font pas partie des trois composantes officielles de la classification Locomo. Un clinicien peut les demander si l’interrogatoire et l’examen établissent une indication précise.'],
        ['Puis-je m’autodiagnostiquer ?', 'Non. L’auto-observation peut ouvrir une discussion, mais les tests physiques exposent à un risque de chute et le degré n’identifie pas la cause.'],
        ['À quelle fréquence répéter les tests ?', 'Il n’existe pas d’intervalle universel. La répétition doit dépendre du contexte clinique, de l’intervention et du besoin de documenter un changement pertinent.'],
        ['KŌMØ est-il propriétaire du concept ?', 'Non. Le syndrome locomoteur et ses critères officiels proviennent de la Japanese Orthopaedic Association. KŌMØ crédite ce cadre et le distingue de sa propre méthode en développement.']
      ]
    },
    references: {
      eyebrow: '09 · SOURCES',
      title: 'Lire les<br><em>références primaires.</em>',
      lead: 'Une bibliographie volontairement courte : ressource officielle JOA, articles fondateurs, critères actualisés, cohortes et revue des interventions.',
      link: 'Ouvrir la source'
    },
    finalTitle: 'Comprendre le cadre.<br>Garder la personne <em>en vue.</em>',
    finalText: 'KŌMØ transforme une mesure isolée de mobilité en une conversation clinique responsable et longitudinale.',
    finalCta: 'Explorer KŌMØ Pulse'
  },

  es: {
    metaTitle: 'Síndrome locomotor — Definición, pruebas y evidencia | KŌMØ',
    metaDescription: 'Guía responsable del síndrome locomotor: definición JOA, grados 2020, Stand-Up Test, Two-Step Test, GLFS-25, evidencia y límites.',
    eyebrow: 'KŌMØ LOCOMOTOR · GUÍA CIENTÍFICA',
    title: 'El síndrome locomotor.<br><em>La movilidad, hecha visible.</em>',
    lead: 'El síndrome locomotor es un marco japonés para reconocer la disminución de movilidad relacionada con el aparato locomotor. Aquí explicamos qué significa, cómo clasifican la gravedad las tres pruebas JOA y qué puede — y qué no puede — afirmar la evidencia.',
    note: 'Contenido educativo · marco JOA acreditado · sin diagnóstico online · literatura revisada en agosto de 2026',
    heroPrimary: 'Comprender los 3 grados',
    heroSecondary: 'Explorar KŌMØ Pulse',
    heroCard: {
      label: 'Marco de referencia JOA',
      title: 'Tres pruebas.<br>Un grado global.',
      rows: [
        ['01', 'Stand-Up Test', 'Fuerza de miembros inferiores y equilibrio'],
        ['02', 'Two-Step Test', 'Zancada funcional máxima'],
        ['03', 'GLFS-25', 'Síntomas y función cotidiana']
      ],
      foot: 'El grado más alto alcanzado en cualquiera de las tres componentes determina el grado global.'
    },
    jumpLabel: 'En esta guía',
    jumps: [['#definition', 'Definición'], ['#framework', 'Grados'], ['#tests', 'Las 3 pruebas'], ['#action', 'Qué hacer'], ['#evidence', 'Evidencia'], ['#komo-layer', 'Capa KŌMØ']],
    definition: {
      eyebrow: '01 · EL CONCEPTO',
      title: 'Un marco funcional,<br>no una <em>enfermedad única.</em>',
      lead: 'La Japanese Orthopaedic Association introdujo el síndrome locomotor en 2007. Describe una reducción de la capacidad para levantarse, caminar y desplazarse por alteraciones o deterioro del aparato locomotor, con mayor riesgo de necesitar cuidados a medida que progresa la gravedad.',
      originTitle: 'De dónde procede',
      originBody: 'El concepto nació en Japón para hacer visible el deterioro de la movilidad antes de que se establezca la pérdida de autonomía. Es un marco clínico y de salud pública; no sustituye el diagnóstico de la causa ortopédica, neurológica o sistémica subyacente.',
      systemTitle: 'Qué incluye el aparato locomotor',
      systemBody: 'El movimiento surge de un sistema integrado. Una componente puede compensar a otra — hasta que la reserva del conjunto resulta insuficiente.',
      components: [
        ['Huesos', 'Soporte, transmisión de cargas y resistencia a la fractura.'],
        ['Articulaciones y columna', 'Amplitud, alineación y transferencia eficiente de fuerzas.'],
        ['Músculos y tendones', 'Fuerza, potencia, resistencia y control del movimiento.'],
        ['Nervios y sistemas sensoriales', 'Orden motora, sensibilidad, equilibrio y adaptación.']
      ],
      notTitle: 'Qué no es',
      notItems: ['No es sinónimo de envejecimiento normal.', 'No es un diagnóstico de artrosis, osteoporosis, sarcopenia o enfermedad de la columna.', 'No es una predicción individual de caídas, dependencia o mortalidad.', 'No es un concepto propietario de KŌMØ. El marco pertenece a la JOA.']
    },
    framework: {
      eyebrow: '02 · CRITERIOS JOA 2020',
      title: 'Cuatro estados.<br><em>Tres grados</em> de deterioro.',
      lead: 'El marco JOA actual distingue la ausencia de síndrome locomotor (grado 0) y los grados 1–3. El grado global corresponde al resultado más grave del Stand-Up Test, Two-Step Test o GLFS-25.',
      stageCards: [
        ['0', 'Ningún criterio alcanzado', 'Los tres resultados permanecen fuera de los umbrales del grado 1.', 'Mantener la actividad y reevaluar solo cuando resulte útil.'],
        ['1', 'El deterioro comienza', 'Se alcanza un primer umbral en al menos una componente.', 'Crear hábitos regulares de fuerza, equilibrio y actividad.'],
        ['2', 'El deterioro progresa', 'La limitación de movilidad está más establecida.', 'Es adecuada una valoración profesional, especialmente si hay dolor o caídas.'],
        ['3', 'La participación social está afectada', 'Existe limitación grave en al menos una componente.', 'Se recomienda valoración clínica y tratamiento de las causas.']
      ],
      tableCaption: 'Límites de decisión clínica JOA',
      headers: ['Componente', 'Grado 0', 'Grado 1', 'Grado 2', 'Grado 3'],
      rows: [
        ['Stand-Up Test', 'Se levanta desde 40 cm sobre una pierna, en ambos lados', 'No se levanta desde 40 cm sobre una pierna en uno o ambos lados, pero sí desde 20 cm con ambas piernas', 'No se levanta desde 20 cm con ambas piernas, pero sí desde 30 cm', 'No se levanta desde 30 cm con ambas piernas'],
        ['Puntuación Two-Step', '≥ 1,3', '≥ 1,1 y < 1,3', '≥ 0,9 y < 1,1', '< 0,9'],
        ['GLFS-25', '0–6', '7–15', '16–23', '≥ 24']
      ],
      formula: 'Puntuación Two-Step = longitud total de dos pasos máximos ÷ altura',
      caveatTitle: 'La clasificación no es un diagnóstico causal',
      caveatBody: 'Dos personas pueden alcanzar el mismo grado por motivos distintos. Dolor, artrosis, enfermedad vertebral o neurológica, osteoporosis, debilidad muscular, alteración del equilibrio, desacondicionamiento y otras causas requieren su propia valoración clínica.'
    },
    tests: {
      eyebrow: '03 · LOCOMOTIVE SYNDROME RISK TEST',
      title: 'Tres miradas complementarias<br>sobre una misma <em>función.</em>',
      lead: 'Una sola prueba de rendimiento no describe a una persona. La JOA combina dos pruebas físicas con una escala informada por el paciente.',
      methodLabel: 'Método',
      safetyLabel: 'Seguridad',
      cards: [
        {
          number: '01', title: 'Stand-Up Test', purpose: 'Fuerza de piernas · equilibrio',
          visualAlt: 'Secuencia ilustrada desde la posición sentada hasta ponerse de pie con los brazos cruzados y las cuatro alturas oficiales.',
          body: 'La persona se levanta de asientos de 40, 30, 20 y 10 cm, con ambas piernas y después con una según la secuencia oficial. Los brazos permanecen cruzados y se mantiene la bipedestación durante tres segundos.',
          detail: 'El resultado es la menor altura superada e indica si la tarea se completó con dos piernas o por separado con ambas piernas en apoyo monopodal.',
          safety: 'Detenerse si aparece dolor de rodilla u otro dolor. Evitar el impulso y proteger frente a una caída hacia atrás.'
        },
        {
          number: '02', title: 'Two-Step Test', purpose: 'Zancada · control dinámico',
          visualAlt: 'Secuencia ilustrada de la posición inicial y los dos pasos máximos, con la distancia dividida por la altura.',
          body: 'Desde una línea marcada, la persona da dos pasos máximos consecutivos, junta los pies y mantiene el equilibrio. Se mide dos veces; el mejor intento válido se divide por la altura.',
          detail: 'El intento no es válido si se pierde el equilibrio o si la persona salta. Se necesita una superficie antideslizante y espacio suficiente.',
          safety: 'La JOA aconseja un acompañante, calentamiento y un suelo no deslizante.'
        },
        {
          number: '03', title: 'GLFS-25', purpose: 'Síntomas · vida diaria · participación',
          visualAlt: 'Ilustración del cuestionario de 25 ítems y sus cinco niveles de respuesta, de cero a cuatro.',
          body: 'Este cuestionario autoadministrado de 25 ítems explora dolor, dificultad de movimiento, actividades de la vida diaria, función social y preocupaciones psicológicas durante el mes anterior.',
          detail: 'Cada ítem puntúa de 0 a 4; el total oscila entre 0 y 100. Una puntuación mayor indica más dificultad locomotora percibida.',
          safety: 'Utilizar una versión lingüística autorizada y las instrucciones oficiales de puntuación.'
        }
      ],
      sourceCta: 'Abrir las instrucciones oficiales de la JOA',
      safetyTitle: 'No convertir una prueba funcional en una caída',
      safetyBody: 'No realice las pruebas físicas sin ayuda si su equilibrio es incierto, tras una lesión u operación reciente, durante dolor agudo o si un profesional ha limitado su actividad. Un resultado online no puede descartar una enfermedad ni determinar el tratamiento.'
    },
    distinctions: {
      eyebrow: '04 · RELACIONADOS, NO IDÉNTICOS',
      title: 'Síndrome locomotor,<br>sarcopenia y <em>fragilidad.</em>',
      lead: 'Estos conceptos se solapan, especialmente en adultos mayores, pero uno no es simplemente la fase avanzada de otro.',
      headers: ['Marco', 'Foco principal', 'Valoración habitual', 'Distinción clave'],
      rows: [
        ['Síndrome locomotor', 'Deterioro de movilidad relacionado con el aparato locomotor', 'Stand-Up, Two-Step y GLFS-25', 'Marco funcional amplio originado por la JOA'],
        ['Sarcopenia', 'Fuerza, cantidad/calidad muscular y rendimiento físico', 'Prensión, levantarse de la silla, masa muscular y criterios de rendimiento', 'Enfermedad muscular con definiciones de consenso internacional'],
        ['Fragilidad', 'Menor reserva multisistémica y vulnerabilidad al estrés', 'Fenotipo físico o herramientas multidimensionales', 'Más amplia que el aparato locomotor; las definiciones varían']
      ],
      foot: 'Los estudios poblacionales muestran una coexistencia importante, pero también muchas personas con síndrome locomotor que no cumplen criterios de sarcopenia ni fragilidad.'
    },
    action: {
      eyebrow: '05 · DEL RESULTADO A LA DECISIÓN',
      title: 'Medir con menos frecuencia.<br>Actuar con más <em>inteligencia.</em>',
      lead: 'El grado es una señal que debe comprenderse, no una receta. El siguiente paso útil depende de los síntomas, las causas, los objetivos y la seguridad.',
      steps: [
        ['01', 'Buscar la causa', 'Dolor, debilidad, enfermedad articular o vertebral, signos neurológicos, medicación, visión, función vestibular y caídas recientes modifican la interpretación.'],
        ['02', 'Desarrollar la capacidad', 'Se utilizan habitualmente fuerza progresiva de miembros inferiores, equilibrio y actividad aeróbica. El Locomotion Training básico de la JOA incluye apoyo monopodal seguro y sentadillas.'],
        ['03', 'Tratar lo tratable', 'Rehabilitación, tratamiento específico, reducción del riesgo de caída, nutrición adecuada y cambios ambientales pueden ser pertinentes tras la valoración.'],
        ['04', 'Repetir en condiciones comparables', 'El valor longitudinal depende de una técnica estandarizada, las mismas reglas de puntuación y un intervalo que permita un cambio relevante.']
      ],
      trainingEyebrow: 'JOA · LOCOMOTION TRAINING BÁSICO',
      trainingTitle: 'Dos ejercicios sencillos,<br>con <em>apoyo cuando haga falta.</em>',
      trainingLead: 'La JOA presenta el apoyo monopodal seguro y las sentadillas como Locomotion Training básico. Son ejemplos generales, no una prescripción individual; dolor, lesión reciente, dificultad de equilibrio o restricciones médicas requieren asesoramiento profesional.',
      trainingCards: [
        ['01', 'Apoyo monopodal seguro', 'Colóquese junto a una mesa o silla estable. Eleve ligeramente un pie sin inclinar el tronco; mantenga un dedo o una mano en el apoyo siempre que sea necesario.', 'Objetivo del programa JOA: 1 minuto por cada lado, 3 veces al día. La seguridad y el control tienen prioridad sobre la duración.'],
        ['02', 'Sentadilla controlada', 'Con los pies algo más separados que los hombros, lleve las caderas atrás durante 2–3 segundos mientras las rodillas siguen la dirección de los dedos. Siga respirando y vuelva suavemente.', 'Objetivo del programa JOA: 5–6 repeticiones, 3 veces al día. No baje más allá de lo cómodo; levantarse de una silla es una alternativa.']
      ],
      evidenceTitle: 'Qué dice la evidencia de intervención',
      evidenceBody: 'Ensayos individuales describen mejoras con ejercicio y otras intervenciones, pero una revisión sistemática de 2023 no encontró evidencia sólida de una intervención específica para todo el síndrome locomotor. La mejora es posible; nunca debe garantizarse una «reversión».',
      urgentTitle: 'Solicite valoración médica rápida si la movilidad cambia bruscamente',
      urgentItems: ['Debilidad súbita o rápidamente progresiva, o incapacidad para caminar', 'Nueva disfunción vesical o intestinal, alteración sensitiva en silla de montar o déficit neurológico importante', 'Traumatismo seguido de incapacidad de apoyo, deformidad o sospecha de fractura', 'Dolor intenso con fiebre, enfermedad sistémica u otros signos preocupantes']
    },
    evidence: {
      eyebrow: '06 · LO ESTABLECIDO — Y LO QUE NO LO ESTÁ',
      title: 'Evidencia útil.<br><em>Límites claros.</em>',
      lead: 'La evidencia más sólida respalda el concepto y su asociación con la limitación de movilidad en poblaciones japonesas. Convertirlo en pronóstico individual o cribado universal exige cautela.',
      cards: [
        ['2007', 'Introducción del concepto', 'La JOA propuso el síndrome locomotor para conectar alteraciones del aparato locomotor, movilidad y futuras necesidades de cuidados.'],
        ['2020', 'Se añadió el grado 3', 'Se revisaron los límites de decisión para distinguir un deterioro grave que afecta a la participación social.'],
        ['6 años', 'Seguimiento longitudinal', 'En la cohorte japonesa ROAD, el grado 3 se asoció con discapacidad y mortalidad posteriores. Es una asociación, no una predicción individual.'],
        ['Japón', 'Geografía de la evidencia', 'La mayoría de los datos de prevalencia, umbrales y pronóstico proceden de Japón; las estimaciones no deben extrapolarse directamente.']
      ],
      prevalenceTitle: 'Una referencia japonesa útil — no una estimación europea',
      prevalenceBody: 'Con los criterios actualizados en la cohorte ROAD, las prevalencias mutuamente excluyentes fueron 41,3 % para el grado 1, 14,9 % para el grado 2 y 11,6 % para el grado 3. Importan la estructura de edad y el contexto japonés.',
      youngerTitle: '¿Solo es relevante después de los 65 años?',
      youngerBody: 'Estudios transversales han identificado resultados anormales en adultos en edad laboral, pero esto no demuestra el beneficio de un cribado universal desde los 30 años. Fuera de Japón todavía deben establecerse edades objetivo, circuitos y coste-efectividad.',
      status: [['Establecido', 'Definición JOA; marco de tres componentes; umbrales 2020; asociaciones con limitación de movilidad.'], ['Dependiente del contexto', 'Prevalencia, pronóstico e intervalo óptimo de reevaluación fuera de cohortes japonesas.'], ['Investigación', 'Trayectorias personalizadas, puntuaciones compuestas, edad del movimiento y predicción individual.']]
    },
    komo: {
      eyebrow: '07 · LA CAPA KŌMØ',
      title: 'Respetar la referencia.<br>Añadir la <em>trayectoria.</em>',
      lead: 'KŌMØ utiliza el marco JOA como capa de referencia explícitamente acreditada. No cambia el nombre del síndrome locomotor ni modifica sus umbrales.',
      additions: [
        ['Referencia', 'Conservar la lógica oficial Stand-Up, Two-Step y GLFS-25 cuando se informa un grado Locomo.'],
        ['Contexto', 'Relacionar la función con dolor, historia, objetivos, entorno y exploración clínica.'],
        ['Medición', 'Cuando esté clínicamente justificado, añadir marcha, control neuromuscular, fuerza, equilibrio o postura — identificados como datos no JOA.'],
        ['Trayectoria', 'Repetir medidas comparables y hacer comprensible el cambio sin afirmar una predicción determinista.']
      ],
      statusTitle: 'Estado metodológico',
      statusBody: 'KŌMØ Motion Score, Movement Age y la arquitectura ampliada de medición son resultados metodológicos y de investigación en validación progresiva. No forman parte de la definición JOA y no deben presentarse como diagnósticos validados.',
      cta: 'Ver el recorrido clínico KŌMØ'
    },
    faq: {
      eyebrow: '08 · PREGUNTAS ESENCIALES',
      title: 'Respuestas<br><em>precisas.</em>',
      items: [
        ['¿El síndrome locomotor es una enfermedad?', 'Es un síndrome y un marco funcional. Puede reflejar una o varias condiciones subyacentes, que requieren su propio diagnóstico.'],
        ['¿Puede mejorar?', 'La movilidad y el rendimiento en las pruebas pueden mejorar, sobre todo si se abordan los factores modificables y las enfermedades subyacentes. La magnitud y la duración varían; ninguna página o puntuación puede garantizar la reversión.'],
        ['¿Necesito pruebas de imagen o analítica?', 'No de forma automática. No forman parte de las tres componentes oficiales de la clasificación Locomo. Un profesional puede solicitarlas si la historia y la exploración establecen una indicación específica.'],
        ['¿Puedo autodiagnosticarme?', 'No. La autoobservación puede iniciar una conversación, pero las pruebas físicas implican riesgo de caída y el grado no identifica la causa.'],
        ['¿Con qué frecuencia deben repetirse las pruebas?', 'No existe un intervalo universal. Debe depender del contexto clínico, de la intervención y de la necesidad de documentar un cambio relevante.'],
        ['¿KŌMØ es propietario del concepto?', 'No. El síndrome locomotor y sus criterios oficiales proceden de la Japanese Orthopaedic Association. KŌMØ acredita ese marco y lo separa de su propio método en desarrollo.']
      ]
    },
    references: {
      eyebrow: '09 · FUENTES',
      title: 'Leer las<br><em>referencias primarias.</em>',
      lead: 'Una bibliografía deliberadamente breve: recurso oficial JOA, trabajos fundacionales, criterios actualizados, cohortes y revisión de intervenciones.',
      link: 'Abrir fuente'
    },
    finalTitle: 'Comprender el marco.<br>Mantener a la persona <em>en el centro.</em>',
    finalText: 'KŌMØ convierte una medida aislada de movilidad en una conversación clínica responsable y longitudinal.',
    finalCta: 'Explorar KŌMØ Pulse'
  }
};
