import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, translations } from '../src/content.mjs';
import { locomotorCopy, locomotorReferences } from '../src/locomotor.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, 'site');
const sourceAssets = join(root, 'src', 'assets');
// Static assets are served aggressively by the CDN. Bump this whenever a
// shared stylesheet or script changes so visitors receive the matching UI.
const assetVersion = '20260821-v12';

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

// English is the reference language and owns the canonical root URLs.
// French and Spanish are fully native localisations under their own paths.
const pagePath = (locale, page = 'index') => {
  if (locale === 'en') return page === 'index' ? '/' : `/${page}/`;
  return page === 'index' ? `/${locale}/` : `/${locale}/${page}/`;
};
const pulseJourney = {
  en: {
    navCta: 'Create my Pulse profile',
    heroEyebrow: 'KŌMØ PULSE · YOUR PERSONAL STARTING POINT',
    heroTitle: 'Know where you are.<br><em>Move towards what is next.</em>',
    heroLead: 'Create your KŌMØ Pulse profile, then move through one clear path: a first reference, your guided Mobility Check and your personal trajectory.',
    heroImageAlt: 'A woman walking calmly on a Mediterranean terrace above the sea',
    primaryCta: 'Create my KŌMØ Pulse profile',
    secondaryCta: 'See how it works',
    heroTrust: ['A personal start · around 3 minutes', 'Your first Mobility Check · around 10 minutes', 'No online diagnosis · no health data collected here'],
    miniLabel: 'A simple beginning',
    miniTitle: 'Your KŌMØ Pulse, in four quiet steps.',
    miniCta: 'Start with my profile',
    journeyEyebrow: 'THE KŌMØ PULSE PATH',
    journeyTitle: 'You are in the right place.<br><em>Here is where you go next.</em>',
    journeyLead: 'There is no need to understand the whole ecosystem before you begin. KŌMØ makes the next step visible, then keeps the thread.',
    journeyNow: 'You are here',
    steps: [
      ['01', 'Create your KŌMØ Pulse profile', 'A personal entry point for your first reference, your results and your next steps.'],
      ['02', 'Set your starting point', 'Choose why you are here and prepare the few elements that make your first check more useful.'],
      ['03', 'Complete your Mobility Check', 'A guided, educational first reading of your mobility when the conditions are right.'],
      ['04', 'Return to your KŌMØ Pulse', 'Find your reference points, the next step and, when relevant, a professional pathway.']
    ],
    profileEyebrow: 'KŌMØ PULSE · YOUR PERSONAL SPACE',
    profileTitle: 'One space.<br>Your whole <em>trajectory.</em>',
    profileLead: 'Pulse is not another health dashboard. It is the calm, personal place you return to after every KŌMØ step.',
    profileImageAlt: 'A person completing a profile on a phone in a quiet home',
    profileCta: 'Continue to my first Mobility Check',
    profileNote: 'The public site does not collect health information. Your personal profile and any clinical information belong in the secure KŌMØ Pulse environment.',
    profileRows: [['My starting point', 'Ready to create'], ['My Mobility Check', 'Your next step'], ['My trajectory', 'Begins here']],
    clinicalEyebrow: 'KŌMØ CLINICAL',
    clinicalTitle: 'When it is useful<br>to go <em>further.</em>',
    clinicalLead: 'A professional evaluation can deepen the journey when it is appropriate. Pulse preserves the continuity; the clinician remains responsible for the indication and interpretation.',
    clinicalImageAlt: 'A patient walking during a calm mobility assessment with a clinician'
  },
  fr: {
    navCta: 'Créer mon espace Pulse',
    heroEyebrow: 'KŌMØ PULSE · VOTRE POINT DE DÉPART PERSONNEL',
    heroTitle: 'Savoir où vous en êtes.<br><em>Avancer vers la suite.</em>',
    heroLead: 'Créez votre espace KŌMØ Pulse, puis avancez dans un parcours clair : un premier repère, votre Mobility Check guidé et votre trajectoire personnelle.',
    heroImageAlt: 'Une femme marche calmement sur une terrasse méditerranéenne face à la mer',
    primaryCta: 'Créer mon espace KŌMØ Pulse',
    secondaryCta: 'Voir comment cela fonctionne',
    heroTrust: ['Un point de départ personnel · environ 3 minutes', 'Votre premier Mobility Check · environ 10 minutes', 'Pas de diagnostic en ligne · aucune donnée de santé collectée ici'],
    miniLabel: 'Commencer simplement',
    miniTitle: 'Votre KŌMØ Pulse, en quatre étapes calmes.',
    miniCta: 'Commencer par mon profil',
    journeyEyebrow: 'LE PARCOURS KŌMØ PULSE',
    journeyTitle: 'Vous êtes au bon endroit.<br><em>Voici la suite.</em>',
    journeyLead: 'Il n’est pas nécessaire de comprendre tout l’écosystème avant de commencer. KŌMØ rend la prochaine étape visible, puis conserve le fil.',
    journeyNow: 'Vous êtes ici',
    steps: [
      ['01', 'Créer votre espace KŌMØ Pulse', 'Une entrée personnelle pour votre premier repère, vos résultats et les prochaines étapes.'],
      ['02', 'Préciser votre point de départ', 'Choisissez ce qui vous amène et préparez les quelques éléments utiles à votre première lecture.'],
      ['03', 'Réaliser votre Mobility Check', 'Une première lecture guidée et éducative de votre mobilité, lorsque les conditions sont réunies.'],
      ['04', 'Retrouver votre KŌMØ Pulse', 'Vos repères, la prochaine étape et, lorsque cela est pertinent, une orientation vers un professionnel.']
    ],
    profileEyebrow: 'KŌMØ PULSE · VOTRE ESPACE PERSONNEL',
    profileTitle: 'Un seul espace.<br>Toute votre <em>trajectoire.</em>',
    profileLead: 'Pulse n’est pas un tableau de bord de santé de plus. C’est l’espace personnel, simple et calme, auquel vous revenez après chaque étape KŌMØ.',
    profileImageAlt: 'Une personne complète son profil sur un téléphone dans un intérieur calme',
    profileCta: 'Continuer vers mon premier Mobility Check',
    profileNote: 'Le site public ne collecte aucune donnée de santé. Votre profil personnel et toute information clinique restent dans l’environnement sécurisé KŌMØ Pulse.',
    profileRows: [['Mon point de départ', 'Prêt à créer'], ['Mon Mobility Check', 'Votre prochaine étape'], ['Ma trajectoire', 'Commence ici']],
    clinicalEyebrow: 'KŌMØ CLINICAL',
    clinicalTitle: 'Lorsque vous avez besoin<br>d’aller <em>plus loin.</em>',
    clinicalLead: 'Une évaluation professionnelle peut approfondir le parcours lorsque cela est pertinent. Pulse conserve la continuité ; le clinicien reste responsable de l’indication et de l’interprétation.',
    clinicalImageAlt: 'Un patient marche lors d’une évaluation de mobilité calme avec une clinicienne'
  },
  es: {
    navCta: 'Crear mi espacio Pulse',
    heroEyebrow: 'KŌMØ PULSE · TU PUNTO DE PARTIDA PERSONAL',
    heroTitle: 'Saber dónde estás.<br><em>Avanzar hacia lo siguiente.</em>',
    heroLead: 'Crea tu espacio KŌMØ Pulse y sigue un camino claro: una primera referencia, tu Mobility Check guiado y tu trayectoria personal.',
    heroImageAlt: 'Una mujer camina tranquilamente por una terraza mediterránea frente al mar',
    primaryCta: 'Crear mi espacio KŌMØ Pulse',
    secondaryCta: 'Ver cómo funciona',
    heroTrust: ['Un inicio personal · unos 3 minutos', 'Tu primer Mobility Check · unos 10 minutos', 'Sin diagnóstico online · sin datos de salud recogidos aquí'],
    miniLabel: 'Empezar de forma sencilla',
    miniTitle: 'Tu KŌMØ Pulse, en cuatro pasos serenos.',
    miniCta: 'Empezar con mi perfil',
    journeyEyebrow: 'EL RECORRIDO KŌMØ PULSE',
    journeyTitle: 'Estás en el lugar adecuado.<br><em>Aquí está el siguiente paso.</em>',
    journeyLead: 'No necesitas entender todo el ecosistema antes de empezar. KŌMØ hace visible el siguiente paso y después mantiene el hilo.',
    journeyNow: 'Estás aquí',
    steps: [
      ['01', 'Crear tu espacio KŌMØ Pulse', 'Una entrada personal para tu primera referencia, tus resultados y los siguientes pasos.'],
      ['02', 'Definir tu punto de partida', 'Elige por qué estás aquí y prepara los pocos elementos útiles para tu primera lectura.'],
      ['03', 'Completar tu Mobility Check', 'Una primera lectura guiada y educativa de tu movilidad cuando las condiciones son adecuadas.'],
      ['04', 'Volver a tu KŌMØ Pulse', 'Tus referencias, el siguiente paso y, cuando sea pertinente, una orientación profesional.']
    ],
    profileEyebrow: 'KŌMØ PULSE · TU ESPACIO PERSONAL',
    profileTitle: 'Un solo espacio.<br>Toda tu <em>trayectoria.</em>',
    profileLead: 'Pulse no es otro panel de salud. Es el lugar personal, tranquilo y simple al que vuelves después de cada etapa KŌMØ.',
    profileImageAlt: 'Una persona completa un perfil en su teléfono en un hogar tranquilo',
    profileCta: 'Continuar a mi primer Mobility Check',
    profileNote: 'El sitio público no recoge datos de salud. Tu perfil personal y cualquier información clínica permanecen en el entorno seguro KŌMØ Pulse.',
    profileRows: [['Mi punto de partida', 'Listo para crear'], ['Mi Mobility Check', 'Tu siguiente paso'], ['Mi trayectoria', 'Empieza aquí']],
    clinicalEyebrow: 'KŌMØ CLINICAL',
    clinicalTitle: 'Cuando necesitas<br>ir <em>más lejos.</em>',
    clinicalLead: 'Una evaluación profesional puede profundizar el recorrido cuando sea apropiado. Pulse preserva la continuidad; el profesional sigue siendo responsable de la indicación y la interpretación.',
    clinicalImageAlt: 'Un paciente camina durante una evaluación de movilidad tranquila con una profesional'
  }
};

const komoEntrances = {
  "fr": {
    "eyebrow": "DÉPLOYEZ KŌMØ DANS VOTRE LIEU",
    "title": "Une même méthode.<br><em>Trois façons de l’accueillir.</em>",
    "lead": "KŌMØ Case, six capteurs Myodev et Pulse donnent aux équipes médicales et aux opérateurs partenaires un cadre clair pour objectiver le mouvement.",
    "continuity": "Une infrastructure KŌMØ : indication, acquisition supervisée, qualité des données, interprétation clinique et suivi.",
    "heroCta": "Découvrir le déploiement KŌMØ",
    "paths": [
      {
        "tone": "pulse",
        "number": "01",
        "audience": "CENTRES MÉDICAUX & LONGÉVITÉ",
        "title": "Faire du bilan locomoteur un parcours de soin.",
        "body": "Case, six capteurs Myodev, tests fonctionnels et Pulse dans un protocole tenu par votre équipe clinique.",
        "cta": "Équiper mon centre",
        "note": "Case · Pulse · cadre clinique",
        "page": "partners"
      },
      {
        "tone": "community",
        "number": "02",
        "audience": "CLUBS FITNESS & PERFORMANCE",
        "title": "Objectiver le mouvement avec un cadre clair.",
        "body": "Des repères fonctionnels pour vos membres, articulés à un partenaire clinique lorsque le contexte exige un bilan médical.",
        "cta": "Voir les modèles partenaires",
        "note": "Clubs · performance · gouvernance",
        "page": "partners"
      },
      {
        "tone": "coast",
        "number": "03",
        "audience": "HÔTELS, RETREATS & HOSPITALITY",
        "title": "Accueillir un bilan de longévité médical.",
        "body": "Une expérience de santé portée par une organisation médicale autorisée, sans confondre hospitalité, bien-être et soin.",
        "cta": "Découvrir les implantations",
        "note": "Hôtellerie · retreats · centres",
        "page": "motion-retreats"
      }
    ]
  },
  "en": {
    "eyebrow": "DEPLOY KŌMØ IN YOUR SETTING",
    "title": "One method.<br><em>Three ways to host it.</em>",
    "lead": "KŌMØ Case, six Myodev sensors and Pulse give clinical teams and partner operators a clear framework for making movement measurable.",
    "continuity": "One KŌMØ infrastructure: indication, supervised acquisition, data quality, clinical interpretation and follow-up.",
    "heroCta": "Explore KŌMØ deployment",
    "paths": [
      {
        "tone": "pulse",
        "number": "01",
        "audience": "MEDICAL & LONGEVITY CENTRES",
        "title": "Make locomotor assessment part of care.",
        "body": "Case, six Myodev sensors, functional testing and Pulse inside a protocol held by your clinical team.",
        "cta": "Equip my centre",
        "note": "Case · Pulse · clinical framework",
        "page": "partners"
      },
      {
        "tone": "community",
        "number": "02",
        "audience": "FITNESS & PERFORMANCE CLUBS",
        "title": "Make movement measurable with clear governance.",
        "body": "Functional references for members, connected to a clinical partner whenever the context requires medical assessment.",
        "cta": "See partner models",
        "note": "Clubs · performance · governance",
        "page": "partners"
      },
      {
        "tone": "coast",
        "number": "03",
        "audience": "HOTELS, RETREATS & HOSPITALITY",
        "title": "Host a medical longevity assessment.",
        "body": "A health experience delivered by an authorised medical organisation, without conflating hospitality, wellbeing and care.",
        "cta": "Explore implementations",
        "note": "Hospitality · retreats · centres",
        "page": "motion-retreats"
      }
    ]
  },
  "es": {
    "eyebrow": "DESPLIEGA KŌMØ EN TU CENTRO",
    "title": "Un método.<br><em>Tres formas de acogerlo.</em>",
    "lead": "KŌMØ Case, seis sensores Myodev y Pulse ofrecen a los equipos clínicos y operadores socios un marco claro para hacer medible el movimiento.",
    "continuity": "Una infraestructura KŌMØ: indicación, adquisición supervisada, calidad de datos, interpretación clínica y seguimiento.",
    "heroCta": "Descubrir el despliegue KŌMØ",
    "paths": [
      {
        "tone": "pulse",
        "number": "01",
        "audience": "CENTROS MÉDICOS Y DE LONGEVIDAD",
        "title": "Integrar el balance locomotor en la atención.",
        "body": "Case, seis sensores Myodev, pruebas funcionales y Pulse dentro de un protocolo dirigido por tu equipo clínico.",
        "cta": "Equipar mi centro",
        "note": "Case · Pulse · marco clínico",
        "page": "partners"
      },
      {
        "tone": "community",
        "number": "02",
        "audience": "CLUBS FITNESS Y RENDIMIENTO",
        "title": "Objetivar el movimiento con un marco claro.",
        "body": "Referencias funcionales para los miembros, conectadas a un socio clínico cuando el contexto requiere una evaluación médica.",
        "cta": "Ver modelos de socios",
        "note": "Clubs · rendimiento · gobernanza",
        "page": "partners"
      },
      {
        "tone": "coast",
        "number": "03",
        "audience": "HOTELES, RETREATS Y HOSPITALITY",
        "title": "Acoger una evaluación médica de longevidad.",
        "body": "Una experiencia de salud prestada por una organización médica autorizada, sin confundir hospitalidad, bienestar y atención.",
        "cta": "Descubrir implantaciones",
        "note": "Hotelería · retreats · centros",
        "page": "motion-retreats"
      }
    ]
  }
};

const chairHeroAlt = {
  en: 'A seated woman and a standing man balancing on one leg beside two wooden chairs',
  fr: 'Une femme assise et un homme debout en équilibre sur une jambe, à côté de deux chaises en bois',
  es: 'Una mujer sentada y un hombre de pie en equilibrio sobre una pierna junto a dos sillas de madera'
};

const komoCaseCopy = {
  "en": {
    "heroEyebrow": "KŌMØ CASE · POWERED BY MYODEV",
    "heroTitle": "One case.<br>Six sensors.<br><em>One score to make movement clear.</em>",
    "heroLead": "A clinician-led locomotor check-up that combines standardised functional tests with Myodev sensor data, then returns a KŌMØ Motion Score to discuss in context.",
    "heroPrimaryCta": "See the KŌMØ Check",
    "heroSecondaryCta": "Equip my centre",
    "heroProof": [
      "6 wireless Myodev sensors",
      "Standardised functional tests",
      "Clinician-led interpretation"
    ],
    "heroNote": "A measurement framework for appropriate clinical settings — never an automatic diagnosis.",
    "heroImageAlt": "Illustration of the KŌMØ Motion Score and the portable KŌMØ Case",
    "checkEyebrow": "THE KŌMØ CHECK",
    "checkTitle": "The case is portable.<br>The method is <em>clinical.</em>",
    "checkLead": "KŌMØ Case makes objective movement measurement possible during a clinician-led assessment. It keeps the evidence visible without pretending that one signal can answer every health question.",
    "checkSteps": [
      [
        "01",
        "Start with the person",
        "Goals, symptoms, functional history and relevant existing results define what should be assessed."
      ],
      [
        "02",
        "Measure the movement",
        "Six Myodev sensors can document activation, bilateral symmetry and control during defined tasks."
      ],
      [
        "03",
        "Test real function",
        "Stand-up, Two-Step and 4-metre walk tests, plus a targeted examination, structure a reproducible assessment."
      ],
      [
        "04",
        "Interpret and return",
        "The clinician puts the measurements in context, names the next priorities and decides whether other data are relevant."
      ]
    ],
    "checkNotice": "Biology, imaging and any additional tests are only considered when a clinical question and the care setting make them appropriate.",
    "scoreEyebrow": "THE KŌMØ MOTION SCORE",
    "scoreTitle": "A global reference for the locomotor system.<br><em>Never a verdict.</em>",
    "scoreLead": "The KŌMØ Score organises the elements available in an assessment: daily life, functional tests, gait, muscle, posture and, where indicated, biological results. It makes priorities visible for discussion with the professional.",
    "scorePillars": [
      [
        "Daily life & quality of life",
        "Activity, sleep, pain, fatigue and perceived mobility."
      ],
      [
        "Biology, when indicated",
        "Existing or prescribed results, always placed in medical context."
      ],
      [
        "Posture, muscle & gait",
        "Observation, six Myodev sensors and a gait protocol on defined tasks."
      ],
      [
        "Functional tests & age references",
        "Chair rise, Two-Step, 4-metre walk and careful functional comparisons."
      ]
    ],
    "scoreNoteTitle": "A clear clinical boundary",
    "scoreNote": "The score supports a clinical conversation and prevention strategy. It does not diagnose a condition, replace an examination or make a care decision on its own.",
    "scoreImageAlt": "Diagram of the KŌMØ Longevity Score around the portable KŌMØ Case",
    "technologyEyebrow": "MEASUREMENT, MADE VISIBLE",
    "technologyTitle": "Myodev technology.<br><em>KŌMØ clinical method.</em>",
    "technologyLead": "The KŌMØ Case combines Myodev movement technology with a clinician-led framework: the professional chooses the indication, test conditions and interpretation.",
    "sensorCards": [
      [
        "Muscle signal",
        "Defined sensor placement helps observe muscle activation and left/right contribution during relevant tasks.",
        "komo-case-muscle.jpeg",
        "Illustration of six wearable sensors used to observe lower-limb muscle activation"
      ],
      [
        "Walking pattern",
        "A 4-metre walk and camera-supported observation can make gait, cadence, symmetry and balance more legible.",
        "komo-case-gait.jpeg",
        "Illustration of a camera-supported gait assessment with wearable sensors"
      ]
    ],
    "technologyPoints": [
      [
        "Inside the case",
        "Six wireless sensors, an adjustable capture setup and the KŌMØ workflow."
      ],
      [
        "In the session",
        "A defined protocol, supervision and a record of data quality."
      ],
      [
        "After the session",
        "A clinically interpreted report and priorities to revisit through Pulse."
      ]
    ],
    "technologyCta": "Discuss a clinical deployment",
    "closingEyebrow": "ONE PRODUCT · ONE TRAJECTORY",
    "closingTitle": "From the KŌMØ Case<br>to a plan <em>that continues.</em>",
    "closingLead": "Pulse keeps the thread between a first reference, a clinician-led assessment and the next conversation. KŌMØ Clinical and partner sites provide the framework to carry that trajectory forward.",
    "closingCta": "Discover the partner offer"
  },
  "fr": {
    "heroEyebrow": "KŌMØ CASE · POWERED BY MYODEV",
    "heroTitle": "Une valise.<br>Six capteurs.<br><em>Un score pour mieux comprendre votre mouvement.</em>",
    "heroLead": "Un bilan locomoteur réalisé avec un professionnel : des tests fonctionnels standardisés, des données issues des capteurs Myodev et un KŌMØ Motion Score à interpréter dans son contexte.",
    "heroPrimaryCta": "Découvrir le KŌMØ Check",
    "heroSecondaryCta": "Équiper mon centre",
    "heroProof": [
      "6 capteurs sans fil Myodev",
      "Tests fonctionnels standardisés",
      "Interprétation par un professionnel"
    ],
    "heroNote": "Un cadre de mesure pour les lieux de soin appropriés — jamais un diagnostic automatique.",
    "heroImageAlt": "Illustration du KŌMØ Motion Score et de la KŌMØ Case portable",
    "checkEyebrow": "LE KŌMØ CHECK",
    "checkTitle": "Une valise portable.<br>Une méthode <em>clinique.</em>",
    "checkLead": "La KŌMØ Case rend la mesure objective du mouvement possible pendant une évaluation menée par un professionnel. Elle rend les données visibles, sans prétendre qu’un seul signal puisse répondre à toutes les questions de santé.",
    "checkSteps": [
      [
        "01",
        "Partir de la personne",
        "Objectif, symptômes, histoire fonctionnelle et résultats déjà disponibles précisent ce qui mérite d’être évalué."
      ],
      [
        "02",
        "Mesurer le mouvement",
        "Les six capteurs Myodev peuvent documenter l’activation, la symétrie bilatérale et le contrôle sur des tâches définies."
      ],
      [
        "03",
        "Tester la fonction réelle",
        "Lever de chaise, Two-Step Test, marche de 4 mètres et examen ciblé structurent une évaluation reproductible."
      ],
      [
        "04",
        "Interpréter et restituer",
        "Le professionnel remet les mesures en contexte, nomme les priorités et décide si d’autres données sont pertinentes."
      ]
    ],
    "checkNotice": "Biologie, imagerie et examens complémentaires ne sont envisagés que lorsqu’une question clinique et le cadre de soin le justifient.",
    "scoreEyebrow": "LE KŌMØ MOTION SCORE",
    "scoreTitle": "Un repère global de l’appareil locomoteur.<br><em>Jamais un verdict.</em>",
    "scoreLead": "Le KŌMØ Score organise les éléments disponibles dans une évaluation : vie quotidienne, tests fonctionnels, marche, muscle, posture et, lorsque cela est indiqué, les résultats biologiques. Il rend visibles les priorités à discuter avec le professionnel.",
    "scorePillars": [
      [
        "Vie quotidienne & qualité de vie",
        "Activité, sommeil, douleur, fatigue et perception de la mobilité."
      ],
      [
        "Bilan biologique, lorsque indiqué",
        "Des résultats existants ou prescrits, toujours remis dans leur contexte médical."
      ],
      [
        "Posture, muscle & marche",
        "Observation, six capteurs Myodev et protocole de marche sur des tâches définies."
      ],
      [
        "Tests fonctionnels & repères d’âge",
        "Lever de chaise, Two-Step, marche de 4 mètres et comparaisons fonctionnelles prudentes."
      ]
    ],
    "scoreNoteTitle": "Une frontière clinique claire",
    "scoreNote": "Le score soutient une conversation clinique et une stratégie de prévention. Il ne pose pas de diagnostic, ne remplace pas l’examen et ne décide pas d’un soin à lui seul.",
    "scoreImageAlt": "Diagramme du KŌMØ Longevity Score autour de la KŌMØ Case portable",
    "technologyEyebrow": "LA MESURE, RENDUE VISIBLE",
    "technologyTitle": "Technologie Myodev.<br><em>Méthode clinique KŌMØ.</em>",
    "technologyLead": "La KŌMØ Case associe la technologie de mouvement Myodev à un cadre mené par un professionnel : il choisit l’indication, les conditions de test et l’interprétation.",
    "sensorCards": [
      [
        "Signal musculaire",
        "Un placement de capteurs défini aide à observer l’activation musculaire et la contribution droite/gauche pendant des tâches pertinentes.",
        "komo-case-muscle.jpeg",
        "Illustration de six capteurs portables utilisés pour observer l’activation musculaire des membres inférieurs"
      ],
      [
        "Profil de marche",
        "Une marche de 4 mètres et une observation assistée par caméra peuvent rendre la cadence, la symétrie et l’équilibre plus lisibles.",
        "komo-case-gait.jpeg",
        "Illustration d’une évaluation de la marche assistée par caméra avec des capteurs portables"
      ]
    ],
    "technologyPoints": [
      [
        "Dans la valise",
        "Six capteurs sans fil, un dispositif de capture ajustable et le workflow KŌMØ."
      ],
      [
        "Pendant la séance",
        "Un protocole défini, une supervision et une trace de la qualité des données."
      ],
      [
        "Après la séance",
        "Un compte rendu interprété et des priorités à retrouver dans Pulse."
      ]
    ],
    "technologyCta": "Échanger sur un déploiement clinique",
    "closingEyebrow": "UN PRODUIT · UNE TRAJECTOIRE",
    "closingTitle": "De la KŌMØ Case<br>à un plan <em>qui se poursuit.</em>",
    "closingLead": "Pulse garde le fil entre un premier repère, une évaluation menée par un professionnel et la conversation suivante. KŌMØ Clinical et les sites partenaires apportent le cadre pour déployer cette trajectoire.",
    "closingCta": "Découvrir l’offre pour partenaires"
  },
  "es": {
    "heroEyebrow": "KŌMØ CASE · POWERED BY MYODEV",
    "heroTitle": "Una maleta.<br>Seis sensores.<br><em>Una puntuación para entender mejor tu movimiento.</em>",
    "heroLead": "Un chequeo locomotor realizado con un profesional: pruebas funcionales estandarizadas, datos de sensores Myodev y un KŌMØ Motion Score que se interpreta en su contexto.",
    "heroPrimaryCta": "Descubrir el KŌMØ Check",
    "heroSecondaryCta": "Equipar mi centro",
    "heroProof": [
      "6 sensores inalámbricos Myodev",
      "Pruebas funcionales estandarizadas",
      "Interpretación profesional"
    ],
    "heroNote": "Un marco de medición para entornos sanitarios adecuados; nunca un diagnóstico automático.",
    "heroImageAlt": "Ilustración del KŌMØ Motion Score y de la KŌMØ Case portátil",
    "checkEyebrow": "EL KŌMØ CHECK",
    "checkTitle": "Una maleta portátil.<br>Un método <em>clínico.</em>",
    "checkLead": "La KŌMØ Case permite medir objetivamente el movimiento durante una evaluación dirigida por un profesional. Hace visibles los datos sin pretender que una sola señal responda a todas las preguntas de salud.",
    "checkSteps": [
      [
        "01",
        "Empezar por la persona",
        "Objetivos, síntomas, historia funcional y resultados relevantes ya disponibles precisan qué conviene evaluar."
      ],
      [
        "02",
        "Medir el movimiento",
        "Los seis sensores Myodev pueden documentar activación, simetría bilateral y control durante tareas definidas."
      ],
      [
        "03",
        "Probar la función real",
        "Levantarse de una silla, Two-Step Test, marcha de 4 metros y exploración dirigida estructuran una evaluación reproducible."
      ],
      [
        "04",
        "Interpretar y devolver",
        "El profesional contextualiza las mediciones, nombra las prioridades y decide si otros datos son pertinentes."
      ]
    ],
    "checkNotice": "Biología, imagen y pruebas adicionales solo se consideran cuando la pregunta clínica y el entorno asistencial lo justifican.",
    "scoreEyebrow": "EL KŌMØ MOTION SCORE",
    "scoreTitle": "Una referencia global del sistema locomotor.<br><em>Nunca un veredicto.</em>",
    "scoreLead": "El KŌMØ Score organiza los elementos disponibles en una evaluación: vida cotidiana, pruebas funcionales, marcha, músculo, postura y, cuando está indicado, resultados biológicos. Hace visibles las prioridades para comentarlas con el profesional.",
    "scorePillars": [
      [
        "Vida cotidiana y calidad de vida",
        "Actividad, sueño, dolor, fatiga y percepción de la movilidad."
      ],
      [
        "Biología, cuando está indicada",
        "Resultados existentes o prescritos, siempre puestos en contexto médico."
      ],
      [
        "Postura, músculo y marcha",
        "Observación, seis sensores Myodev y un protocolo de marcha en tareas definidas."
      ],
      [
        "Pruebas funcionales y referencias de edad",
        "Levantarse de una silla, Two-Step, marcha de 4 metros y comparaciones funcionales prudentes."
      ]
    ],
    "scoreNoteTitle": "Un límite clínico claro",
    "scoreNote": "La puntuación apoya una conversación clínica y una estrategia de prevención. No diagnostica una condición, no sustituye una exploración ni decide un tratamiento por sí sola.",
    "scoreImageAlt": "Diagrama del KŌMØ Longevity Score alrededor de la KŌMØ Case portátil",
    "technologyEyebrow": "MEDICIÓN HECHA VISIBLE",
    "technologyTitle": "Tecnología Myodev.<br><em>Método clínico KŌMØ.</em>",
    "technologyLead": "La KŌMØ Case combina la tecnología de movimiento Myodev con un marco dirigido por un profesional: este elige la indicación, las condiciones de prueba y la interpretación.",
    "sensorCards": [
      [
        "Señal muscular",
        "Una colocación definida de sensores ayuda a observar activación muscular y contribución izquierda/derecha durante tareas pertinentes.",
        "komo-case-muscle.jpeg",
        "Ilustración de seis sensores portátiles utilizados para observar la activación muscular de las extremidades inferiores"
      ],
      [
        "Patrón de marcha",
        "Una marcha de 4 metros y una observación asistida por cámara pueden hacer más legibles la cadencia, la simetría y el equilibrio.",
        "komo-case-gait.jpeg",
        "Ilustración de una evaluación de la marcha asistida por cámara con sensores portátiles"
      ]
    ],
    "technologyPoints": [
      [
        "Dentro de la maleta",
        "Seis sensores inalámbricos, un sistema de captura ajustable y el flujo de trabajo KŌMØ."
      ],
      [
        "Durante la sesión",
        "Un protocolo definido, supervisión y un registro de la calidad de los datos."
      ],
      [
        "Después de la sesión",
        "Un informe interpretado y prioridades que se pueden revisar en Pulse."
      ]
    ],
    "technologyCta": "Hablar de un despliegue clínico",
    "closingEyebrow": "UN PRODUCTO · UNA TRAYECTORIA",
    "closingTitle": "De la KŌMØ Case<br>a un plan <em>que continúa.</em>",
    "closingLead": "Pulse mantiene el hilo entre una primera referencia, una evaluación realizada por un profesional y la siguiente conversación. KŌMØ Clinical y los centros socios aportan el marco para desarrollar esa trayectoria.",
    "closingCta": "Descubrir la oferta para socios"
  }
};
const partnerCopy = {
  "fr": {
    "metaTitle": "KŌMØ Case pour partenaires — bilan locomoteur clinique portable",
    "metaDescription": "KŌMØ équipe les centres médicaux, longévité, fitness, hôtels et retreats avec une Case portable, six capteurs Myodev et KŌMØ Pulse dans un cadre clinique.",
    "eyebrow": "KŌMØ CASE POUR PARTENAIRES",
    "title": "La longévité locomotrice,<br><em>dans votre pratique.</em>",
    "lead": "Une solution portable pour intégrer un bilan locomoteur complet à votre centre : KŌMØ Case, six capteurs Myodev, KŌMØ Pulse et un cadre clinique contrôlé par votre équipe.",
    "cta": "Parler à l’équipe KŌMØ",
    "note": "Acquisition ou location · déploiement en binôme · formation et contrôle qualité progressifs.",
    "introEyebrow": "UNE OFFRE B2B CLINIQUE",
    "introTitle": "La Case rend la mesure mobile.<br>La méthode garde le <em>soin au centre.</em>",
    "introLead": "KŌMØ apporte la solution portable, la couche Pulse et le support de déploiement. L’indication, l’interprétation et les décisions de prise en charge restent entre les mains du professionnel et de l’organisation de soin.",
    "cards": [
      [
        "Centres médicaux & longévité",
        "Ajoutez un bilan locomoteur standardisé à votre parcours de prévention, avec une trace de la qualité des données et une restitution clinique."
      ],
      [
        "Centres fitness & performance",
        "Proposez des repères fonctionnels à vos membres dans un périmètre clair, relié à un partenaire clinique dès qu’une évaluation médicale est nécessaire."
      ],
      [
        "Hôtels & retreats",
        "Accueillez un bilan de longévité médical porté par une organisation autorisée : l’hospitalité élève l’expérience, elle ne remplace jamais le soin."
      ],
      [
        "Réseaux multi-sites",
        "Déployez une même Case, le même protocole et des règles de qualité partagées, site après site, avec une montée en autonomie documentée."
      ]
    ],
    "offerEyebrow": "MODÈLE DE DÉPLOIEMENT",
    "offerTitle": "Une Case. Une plateforme.<br>Un dispositif <em>opérationnel.</em>",
    "offerLead": "KŌMØ ne vend pas seulement un appareil. Nous déployons une méthode, Pulse, le cadre de qualité et l’accompagnement nécessaires pour rendre la séance compréhensible et reproductible.",
    "offerModes": [
      [
        "01",
        "Acquérir la KŌMØ Case",
        "Équipez durablement votre centre avec la valise, les six capteurs et l’accès au workflow KŌMØ Pulse."
      ],
      [
        "02",
        "Louer pour démarrer",
        "Ouvrez un pilote maîtrisé, mesurez la demande et construisez votre organisation avant un déploiement plus large."
      ],
      [
        "03",
        "Déployer avec KŌMØ",
        "Des professionnels KŌMØ certifiés peuvent réaliser les premières séances à vos côtés, former vos équipes et organiser le passage progressif vers l’autonomie."
      ]
    ],
    "scoreEyebrow": "LE SCORE KŌMØ",
    "scoreTitle": "Un portrait fonctionnel de l’appareil locomoteur.<br><em>Pas un chiffre isolé.</em>",
    "scoreLead": "Le score composite organise les composantes disponibles dans le protocole. Il aide à rendre visibles les priorités de prévention et de suivi, sans se substituer à l’évaluation médicale.",
    "scoreDomains": [
      [
        "01",
        "Vie quotidienne & qualité de vie",
        "Activité, sommeil, douleur, fatigue et perception de la mobilité."
      ],
      [
        "02",
        "Bilan biologique, lorsque indiqué",
        "Des résultats existants ou prescrits, remis dans leur contexte médical ; jamais un prélèvement automatique."
      ],
      [
        "03",
        "Posture & alignement",
        "Observation ou mesure pertinente selon l’indication clinique et le cadre disponible."
      ],
      [
        "04",
        "Analyse musculaire",
        "Activation, contribution droite/gauche et contrôle sur des tâches définies avec les six capteurs Myodev."
      ],
      [
        "05",
        "Analyse de la marche",
        "Vitesse, cadence, symétrie et stabilité dans un protocole de marche contrôlé."
      ],
      [
        "06",
        "Tests fonctionnels & repères d’âge",
        "Lever de chaise, Two-Step, marche de 4 mètres et comparaisons fonctionnelles prudentes."
      ]
    ],
    "scoreBoundary": "Le score est un outil d’interprétation structuré par la méthode KŌMØ. Sa validation clinique est progressive : il ne prédit pas un diagnostic et ne remplace pas l’avis médical.",
    "governanceEyebrow": "LE CADRE MÉDICAL RESTE AU CENTRE",
    "governanceTitle": "Mesurer, interpréter,<br><em>puis agir.</em>",
    "governanceLead": "KŌMØ structure la séance et Pulse conserve le fil. L’indication, les actes complémentaires et la décision de prise en charge restent entre les mains du professionnel et de l’organisation autorisée.",
    "governanceSteps": [
      [
        "01",
        "KŌMØ Case",
        "Acquisition encadrée, tests fonctionnels et contrôle de la qualité des données."
      ],
      [
        "02",
        "KŌMØ Pulse",
        "Une plateforme intégrée pour regrouper les repères, le compte rendu et le suivi."
      ],
      [
        "03",
        "Restitution clinique",
        "Une lecture contextualisée, des priorités et, si nécessaire, une orientation adaptée."
      ]
    ],
    "territoryEyebrow": "DÉPLOIEMENT CIBLÉ",
    "territoryTitle": "Le programme démarre en Europe du Sud.",
    "territories": [
      "Côte d’Azur · Cannes · Saint-Tropez · Monaco · Saint-Jean-Cap-Ferrat",
      "Espagne",
      "Ravenne · Italie"
    ],
    "territoryNote": "Territoires de déploiement ciblés ; disponibilité, cadre médical et conformité sont confirmés projet par projet.",
    "ecosystemEyebrow": "L’ÉCOSYSTÈME KŌMØ",
    "ecosystemTitle": "Une infrastructure clinique.<br>Un réseau <em>de lieux équipés.</em>",
    "ecosystemLead": "La Case, Pulse, le déploiement et le réseau de partenaires se complètent pour faire de la longévité locomotrice une pratique suivie.",
    "ecosystem": [
      {
        "num": "01",
        "title": "KŌMØ Case",
        "text": "Une valise portable avec six capteurs Myodev et un protocole de mesure défini.",
        "link": "Voir la Case",
        "page": "index"
      },
      {
        "num": "02",
        "title": "KŌMØ Pulse",
        "text": "La plateforme intégrée qui relie le bilan, la restitution et le suivi.",
        "link": "Découvrir Pulse",
        "page": "pulse"
      },
      {
        "num": "03",
        "title": "Déploiement partenaire",
        "text": "Vente, location, formation et contrôle qualité pour rendre l’offre opérante sur site.",
        "link": "Voir l’offre partenaire",
        "page": "partners"
      },
      {
        "num": "04",
        "title": "Méthode & validation",
        "text": "Une approche documentée, des limites visibles et une validation clinique progressive.",
        "link": "Lire la méthode",
        "page": "science"
      }
    ],
    "networkEyebrow": "RENCONTRER & APPRENDRE",
    "networkTitle": "La conversation autour<br>de la <em>longévité locomotrice.</em>",
    "networkLead": "KŌMØ s’inscrit dans un écosystème de cliniciens, d’opérateurs et de plateformes dédiées à la longévité.",
    "networkLinks": [
      {
        "eyebrow": "CONGRÈS",
        "title": "Locotech Longevity Summit",
        "body": "Un rendez-vous consacré au mouvement, à la longévité et aux pratiques qui rapprochent la science de la vraie vie.",
        "cta": "Découvrir le congrès",
        "href": "https://locotechsummit.com/"
      },
      {
        "eyebrow": "PLATEFORME LONGÉVITÉ",
        "title": "Longevity Task",
        "body": "Une plateforme de ressources et de conversations autour de la longévité.",
        "cta": "Visiter Longevity Task",
        "href": "https://longevitytask.com/"
      }
    ],
    "finalTitle": "Équiper un lieu.<br>Créer une <em>référence.</em>",
    "finalText": "Chaque déploiement commence par un échange sur votre cadre clinique, votre équipe, votre public et le rythme de montée en autonomie.",
    "hospitality": {
      "metaTitle": "KŌMØ pour hôtels, retreats et clubs — un cadre clinique portable",
      "metaDescription": "KŌMØ aide les hôtels, retreats et clubs à accueillir une évaluation locomotrice médicale avec la Case, six capteurs Myodev et Pulse, sous gouvernance clinique.",
      "eyebrow": "KŌMØ HOSPITALITY & CLUBS",
      "title": "Accueillir la longévité médicale.<br><em>Sans diluer le soin.</em>",
      "lead": "Pour les hôtels, retreats et clubs de sport qui souhaitent accueillir une évaluation locomotrice portée par une équipe clinique partenaire.",
      "cta": "Échanger sur votre lieu",
      "note": "L’hospitalité apporte l’accueil ; la pratique médicale reste opérée dans un cadre autorisé.",
      "introEyebrow": "UNE EXPÉRIENCE, UN CADRE CLAIR",
      "introTitle": "Le lieu accueille.<br>Le partenaire médical <em>prend soin.</em>",
      "introLead": "La KŌMØ Case rend possible une présence mobile. Son utilisation dans un hôtel, un retreat ou un club est organisée avec le bon opérateur médical, les bonnes règles de confidentialité et une restitution appropriée.",
      "rhythm": [
        [
          "01",
          "Définir le bon modèle",
          "Le lieu, l’équipe clinique, le public, la confidentialité et la disponibilité sont cadrés avant toute séance."
        ],
        [
          "02",
          "Accueillir une séance encadrée",
          "La Case, les capteurs et Pulse sont utilisés dans un protocole supervisé ; l’hospitalité reste complémentaire au soin."
        ],
        [
          "03",
          "Créer une continuité",
          "Le compte rendu, les orientations et le suivi restent organisés par la structure clinique compétente."
        ]
      ],
      "operatorCards": [
        [
          "Hôtels & resorts",
          "Une offre de prévention médicale que votre clientèle rencontre dans un environnement haut de gamme, sous responsabilité clinique."
        ],
        [
          "Retreats longévité",
          "Un bilan d’entrée ou de suivi qui relie les activités proposées à une lecture fonctionnelle contextualisée."
        ],
        [
          "Clubs de sport",
          "Un point de départ objectivé pour les membres, avec une passerelle nette vers un professionnel de santé si nécessaire."
        ]
      ],
      "finalTitle": "Un lieu d’exception.<br>Un dispositif <em>responsable.</em>",
      "finalText": "KŌMØ travaille avec les opérateurs qui veulent faire de la longévité une offre crédible, sans brouiller les frontières entre bien-être et médecine."
    }
  },
  "en": {
    "metaTitle": "KŌMØ Case for partners — portable clinical locomotor assessment",
    "metaDescription": "KŌMØ equips medical, longevity, fitness, hotel and retreat partners with a portable Case, six Myodev sensors and KŌMØ Pulse inside a clinical framework.",
    "eyebrow": "KŌMØ CASE FOR PARTNERS",
    "title": "Locomotor longevity,<br><em>inside your practice.</em>",
    "lead": "A portable solution for integrating a complete locomotor assessment into your centre: KŌMØ Case, six Myodev sensors, KŌMØ Pulse and a clinical framework held by your team.",
    "cta": "Speak with the KŌMØ team",
    "note": "Purchase or rental · paired deployment · progressive training and quality control.",
    "introEyebrow": "A CLINICAL B2B OFFER",
    "introTitle": "The Case makes measurement mobile.<br>The method keeps <em>care at the centre.</em>",
    "introLead": "KŌMØ provides the portable solution, Pulse and deployment support. Indication, interpretation and care decisions remain with the professional and care organisation.",
    "cards": [
      [
        "Medical & longevity centres",
        "Add a standardised locomotor assessment to your prevention pathway, with data-quality visibility and clinical restitution."
      ],
      [
        "Fitness & performance centres",
        "Offer functional references to members within a clear remit, connected to a clinical partner whenever medical assessment is needed."
      ],
      [
        "Hotels & retreats",
        "Host a medical longevity assessment delivered by an authorised organisation: hospitality elevates the experience, never replaces care."
      ],
      [
        "Multi-site networks",
        "Deploy one Case, one protocol and shared quality rules site by site, with a documented path to autonomy."
      ]
    ],
    "offerEyebrow": "DEPLOYMENT MODEL",
    "offerTitle": "One Case. One platform.<br>An <em>operational system.</em>",
    "offerLead": "KŌMØ does not sell a device alone. We deploy a method, Pulse, a quality framework and the support needed to make each session understandable and repeatable.",
    "offerModes": [
      [
        "01",
        "Purchase the KŌMØ Case",
        "Equip your centre for the long term with the case, six sensors and access to the KŌMØ Pulse workflow."
      ],
      [
        "02",
        "Rent to start",
        "Open a controlled pilot, measure demand and build your operating model before a wider rollout."
      ],
      [
        "03",
        "Deploy with KŌMØ",
        "Certified KŌMØ professionals can run the first sessions alongside your team, train them and organise a progressive transition to autonomy."
      ]
    ],
    "scoreEyebrow": "THE KŌMØ SCORE",
    "scoreTitle": "A functional portrait of the locomotor system.<br><em>Not an isolated number.</em>",
    "scoreLead": "The composite score organises the components available in the protocol. It helps make prevention and follow-up priorities visible without replacing medical assessment.",
    "scoreDomains": [
      [
        "01",
        "Daily life & quality of life",
        "Activity, sleep, pain, fatigue and perceived mobility."
      ],
      [
        "02",
        "Biology, when indicated",
        "Existing or prescribed results placed in medical context; never an automatic blood draw."
      ],
      [
        "03",
        "Posture & alignment",
        "Observation or measurement that is relevant to the clinical indication and setting."
      ],
      [
        "04",
        "Muscle analysis",
        "Activation, left/right contribution and control on defined tasks with six Myodev sensors."
      ],
      [
        "05",
        "Gait analysis",
        "Speed, cadence, symmetry and stability inside a controlled walking protocol."
      ],
      [
        "06",
        "Functional tests & age references",
        "Chair rise, Two-Step, 4-metre walk and careful comparisons with functional reference points."
      ]
    ],
    "scoreBoundary": "The score is an interpretation tool structured by the KŌMØ method. Its clinical validation is progressive: it does not predict a diagnosis and never replaces medical judgement.",
    "governanceEyebrow": "THE CLINICAL FRAMEWORK STAYS CENTRAL",
    "governanceTitle": "Measure, interpret,<br><em>then act.</em>",
    "governanceLead": "KŌMØ structures the session and Pulse keeps the thread. Indication, complementary acts and care decisions stay with the professional and authorised organisation.",
    "governanceSteps": [
      [
        "01",
        "KŌMØ Case",
        "Supervised acquisition, functional testing and data-quality control."
      ],
      [
        "02",
        "KŌMØ Pulse",
        "One integrated platform for reference points, report and follow-up."
      ],
      [
        "03",
        "Clinical restitution",
        "Contextualised interpretation, priorities and, where needed, appropriate referral."
      ]
    ],
    "territoryEyebrow": "TARGETED ROLLOUT",
    "territoryTitle": "The programme starts in Southern Europe.",
    "territories": [
      "French Riviera · Cannes · Saint-Tropez · Monaco · Saint-Jean-Cap-Ferrat",
      "Spain",
      "Ravenna · Italy"
    ],
    "territoryNote": "Target rollout territories; availability, medical framework and compliance are confirmed project by project.",
    "ecosystemEyebrow": "THE KŌMØ ECOSYSTEM",
    "ecosystemTitle": "A clinical infrastructure.<br>A network <em>of equipped settings.</em>",
    "ecosystemLead": "The Case, Pulse, deployment and partner network work together to make locomotor longevity an ongoing practice.",
    "ecosystem": [
      {
        "num": "01",
        "title": "KŌMØ Case",
        "text": "A portable case with six Myodev sensors and a defined measurement protocol.",
        "link": "See the Case",
        "page": "index"
      },
      {
        "num": "02",
        "title": "KŌMØ Pulse",
        "text": "The integrated platform linking assessment, restitution and follow-up.",
        "link": "Discover Pulse",
        "page": "pulse"
      },
      {
        "num": "03",
        "title": "Partner deployment",
        "text": "Purchase, rental, training and quality control to make the offer work on site.",
        "link": "See the partner offer",
        "page": "partners"
      },
      {
        "num": "04",
        "title": "Method & validation",
        "text": "A documented approach, visible limits and progressive clinical validation.",
        "link": "Read the method",
        "page": "science"
      }
    ],
    "networkEyebrow": "MEET & LEARN",
    "networkTitle": "The conversation around<br><em>locomotor longevity.</em>",
    "networkLead": "KŌMØ sits in an ecosystem of clinicians, operators and platforms dedicated to longevity.",
    "networkLinks": [
      {
        "eyebrow": "CONGRESS",
        "title": "Locotech Longevity Summit",
        "body": "A gathering around movement, longevity and practices that bring science closer to real life.",
        "cta": "Discover the congress",
        "href": "https://locotechsummit.com/"
      },
      {
        "eyebrow": "LONGEVITY PLATFORM",
        "title": "Longevity Task",
        "body": "A platform for resources and conversations around longevity.",
        "cta": "Visit Longevity Task",
        "href": "https://longevitytask.com/"
      }
    ],
    "finalTitle": "Equip a setting.<br>Create a <em>reference.</em>",
    "finalText": "Every deployment begins with a conversation about your clinical framework, your team, your audience and the path to autonomy.",
    "hospitality": {
      "metaTitle": "KŌMØ for hotels, retreats and clubs — a portable clinical framework",
      "metaDescription": "KŌMØ helps hotels, retreats and clubs host a medical locomotor assessment with the Case, six Myodev sensors and Pulse under clinical governance.",
      "eyebrow": "KŌMØ HOSPITALITY & CLUBS",
      "title": "Host medical longevity.<br><em>Without diluting care.</em>",
      "lead": "For hotels, retreats and sports clubs that want to host a locomotor assessment delivered by a partner clinical team.",
      "cta": "Discuss your setting",
      "note": "Hospitality provides the welcome; medical practice remains operated in an authorised framework.",
      "introEyebrow": "AN EXPERIENCE, A CLEAR FRAMEWORK",
      "introTitle": "The setting hosts.<br>The medical partner <em>cares.</em>",
      "introLead": "KŌMØ Case makes a mobile presence possible. Its use in a hotel, retreat or club is organised with the right medical operator, privacy rules and appropriate restitution.",
      "rhythm": [
        [
          "01",
          "Define the right model",
          "Setting, clinical team, audience, privacy and availability are framed before any session."
        ],
        [
          "02",
          "Host a supervised session",
          "Case, sensors and Pulse are used inside a supervised protocol; hospitality remains complementary to care."
        ],
        [
          "03",
          "Create continuity",
          "The report, referrals and follow-up remain organised by the competent clinical structure."
        ]
      ],
      "operatorCards": [
        [
          "Hotels & resorts",
          "A medical prevention offer your guests encounter in a premium environment, under clinical responsibility."
        ],
        [
          "Longevity retreats",
          "An entry or follow-up assessment that connects the programme to contextualised functional insight."
        ],
        [
          "Sports clubs",
          "An objective starting point for members, with a clear bridge to a health professional where needed."
        ]
      ],
      "finalTitle": "An exceptional setting.<br>A <em>responsible</em> system.",
      "finalText": "KŌMØ works with operators who want longevity to be a credible offer without blurring wellbeing and medicine."
    }
  },
  "es": {
    "metaTitle": "KŌMØ Case para socios — evaluación clínica locomotora portátil",
    "metaDescription": "KŌMØ equipa a socios médicos, de longevidad, fitness, hoteleros y retreats con una Case portátil, seis sensores Myodev y KŌMØ Pulse dentro de un marco clínico.",
    "eyebrow": "KŌMØ CASE PARA SOCIOS",
    "title": "Longevidad locomotora,<br><em>dentro de tu práctica.</em>",
    "lead": "Una solución portátil para integrar una evaluación locomotora completa en tu centro: KŌMØ Case, seis sensores Myodev, KŌMØ Pulse y un marco clínico dirigido por tu equipo.",
    "cta": "Hablar con el equipo KŌMØ",
    "note": "Compra o alquiler · despliegue acompañado · formación y control de calidad progresivos.",
    "introEyebrow": "UNA OFERTA B2B CLÍNICA",
    "introTitle": "La Case hace móvil la medición.<br>El método mantiene <em>la atención en el centro.</em>",
    "introLead": "KŌMØ aporta la solución portátil, Pulse y apoyo de despliegue. La indicación, interpretación y decisiones asistenciales permanecen con el profesional y la organización de atención.",
    "cards": [
      [
        "Centros médicos y de longevidad",
        "Añade una evaluación locomotora estandarizada a tu recorrido preventivo, con visibilidad de calidad de datos y devolución clínica."
      ],
      [
        "Centros fitness y de rendimiento",
        "Ofrece referencias funcionales a los miembros dentro de un perímetro claro, conectado a un socio clínico cuando se necesita evaluación médica."
      ],
      [
        "Hoteles y retreats",
        "Acoge una evaluación médica de longevidad prestada por una organización autorizada: la hospitalidad eleva la experiencia, nunca sustituye la atención."
      ],
      [
        "Redes multisede",
        "Despliega una misma Case, un mismo protocolo y reglas de calidad compartidas sitio por sitio, con una autonomía documentada."
      ]
    ],
    "offerEyebrow": "MODELO DE DESPLIEGUE",
    "offerTitle": "Una Case. Una plataforma.<br>Un sistema <em>operativo.</em>",
    "offerLead": "KŌMØ no vende solo un dispositivo. Desplegamos un método, Pulse, un marco de calidad y el acompañamiento necesario para hacer cada sesión comprensible y repetible.",
    "offerModes": [
      [
        "01",
        "Comprar la KŌMØ Case",
        "Equipa tu centro a largo plazo con la maleta, seis sensores y acceso al flujo de trabajo de KŌMØ Pulse."
      ],
      [
        "02",
        "Alquilar para empezar",
        "Abre un piloto controlado, mide la demanda y construye tu modelo operativo antes de un despliegue más amplio."
      ],
      [
        "03",
        "Desplegar con KŌMØ",
        "Profesionales KŌMØ certificados pueden realizar las primeras sesiones junto a tu equipo, formarlo y organizar una transición progresiva hacia la autonomía."
      ]
    ],
    "scoreEyebrow": "EL SCORE KŌMØ",
    "scoreTitle": "Un retrato funcional del sistema locomotor.<br><em>No un número aislado.</em>",
    "scoreLead": "El score compuesto organiza los componentes disponibles en el protocolo. Ayuda a hacer visibles las prioridades de prevención y seguimiento sin sustituir la evaluación médica.",
    "scoreDomains": [
      [
        "01",
        "Vida cotidiana y calidad de vida",
        "Actividad, sueño, dolor, fatiga y percepción de la movilidad."
      ],
      [
        "02",
        "Biología, cuando está indicada",
        "Resultados existentes o prescritos puestos en contexto médico; nunca una extracción automática."
      ],
      [
        "03",
        "Postura y alineación",
        "Observación o medida pertinente según la indicación clínica y el contexto disponible."
      ],
      [
        "04",
        "Análisis muscular",
        "Activación, contribución izquierda/derecha y control en tareas definidas con seis sensores Myodev."
      ],
      [
        "05",
        "Análisis de la marcha",
        "Velocidad, cadencia, simetría y estabilidad dentro de un protocolo de marcha controlado."
      ],
      [
        "06",
        "Tests funcionales y referencias de edad",
        "Levantarse de una silla, Two-Step, marcha de 4 metros y comparaciones funcionales prudentes."
      ]
    ],
    "scoreBoundary": "El score es una herramienta de interpretación estructurada por el método KŌMØ. Su validación clínica es progresiva: no predice un diagnóstico ni reemplaza el juicio médico.",
    "governanceEyebrow": "EL MARCO CLÍNICO SIGUE SIENDO CENTRAL",
    "governanceTitle": "Medir, interpretar,<br><em>después actuar.</em>",
    "governanceLead": "KŌMØ estructura la sesión y Pulse mantiene el hilo. La indicación, los actos complementarios y las decisiones asistenciales siguen con el profesional y la organización autorizada.",
    "governanceSteps": [
      [
        "01",
        "KŌMØ Case",
        "Adquisición supervisada, pruebas funcionales y control de la calidad de los datos."
      ],
      [
        "02",
        "KŌMØ Pulse",
        "Una plataforma integrada para referencias, informe y seguimiento."
      ],
      [
        "03",
        "Devolución clínica",
        "Interpretación contextualizada, prioridades y, cuando es necesario, derivación adecuada."
      ]
    ],
    "territoryEyebrow": "DESPLIEGUE DIRIGIDO",
    "territoryTitle": "El programa empieza en el sur de Europa.",
    "territories": [
      "Costa Azul · Cannes · Saint-Tropez · Mónaco · Saint-Jean-Cap-Ferrat",
      "España",
      "Rávena · Italia"
    ],
    "territoryNote": "Territorios de despliegue objetivo; disponibilidad, marco médico y cumplimiento se confirman proyecto por proyecto.",
    "ecosystemEyebrow": "EL ECOSISTEMA KŌMØ",
    "ecosystemTitle": "Una infraestructura clínica.<br>Una red <em>de lugares equipados.</em>",
    "ecosystemLead": "La Case, Pulse, el despliegue y la red de socios se complementan para hacer de la longevidad locomotora una práctica continuada.",
    "ecosystem": [
      {
        "num": "01",
        "title": "KŌMØ Case",
        "text": "Una maleta portátil con seis sensores Myodev y un protocolo de medición definido.",
        "link": "Ver la Case",
        "page": "index"
      },
      {
        "num": "02",
        "title": "KŌMØ Pulse",
        "text": "La plataforma integrada que une evaluación, devolución y seguimiento.",
        "link": "Descubrir Pulse",
        "page": "pulse"
      },
      {
        "num": "03",
        "title": "Despliegue para socios",
        "text": "Compra, alquiler, formación y control de calidad para hacer operativa la oferta in situ.",
        "link": "Ver la oferta para socios",
        "page": "partners"
      },
      {
        "num": "04",
        "title": "Método y validación",
        "text": "Un enfoque documentado, límites visibles y validación clínica progresiva.",
        "link": "Leer el método",
        "page": "science"
      }
    ],
    "networkEyebrow": "ENCONTRAR & APRENDER",
    "networkTitle": "La conversación sobre<br>la <em>longevidad locomotora.</em>",
    "networkLead": "KŌMØ se inscribe en un ecosistema de clínicos, operadores y plataformas dedicadas a la longevidad.",
    "networkLinks": [
      {
        "eyebrow": "CONGRESO",
        "title": "Locotech Longevity Summit",
        "body": "Un encuentro dedicado al movimiento, la longevidad y las prácticas que acercan la ciencia a la vida real.",
        "cta": "Descubrir el congreso",
        "href": "https://locotechsummit.com/"
      },
      {
        "eyebrow": "PLATAFORMA DE LONGEVIDAD",
        "title": "Longevity Task",
        "body": "Una plataforma de recursos y conversaciones sobre longevidad.",
        "cta": "Visitar Longevity Task",
        "href": "https://longevitytask.com/"
      }
    ],
    "finalTitle": "Equipar un lugar.<br>Crear una <em>referencia.</em>",
    "finalText": "Cada despliegue empieza con una conversación sobre tu marco clínico, equipo, público y la trayectoria hacia la autonomía.",
    "hospitality": {
      "metaTitle": "KŌMØ para hoteles, retreats y clubs — un marco clínico portátil",
      "metaDescription": "KŌMØ ayuda a hoteles, retreats y clubs a acoger una evaluación locomotora médica con la Case, seis sensores Myodev y Pulse bajo gobernanza clínica.",
      "eyebrow": "KŌMØ HOSPITALITY & CLUBS",
      "title": "Acoger longevidad médica.<br><em>Sin diluir la atención.</em>",
      "lead": "Para hoteles, retreats y clubs deportivos que desean acoger una evaluación locomotora realizada por un equipo clínico socio.",
      "cta": "Hablar de tu lugar",
      "note": "La hospitalidad aporta la acogida; la práctica médica se opera dentro de un marco autorizado.",
      "introEyebrow": "UNA EXPERIENCIA, UN MARCO CLARO",
      "introTitle": "El lugar acoge.<br>El socio médico <em>cuida.</em>",
      "introLead": "KŌMØ Case permite una presencia móvil. Su uso en un hotel, retreat o club se organiza con el operador médico adecuado, reglas de privacidad y una devolución apropiada.",
      "rhythm": [
        [
          "01",
          "Definir el modelo adecuado",
          "Lugar, equipo clínico, público, privacidad y disponibilidad se estructuran antes de cualquier sesión."
        ],
        [
          "02",
          "Acoger una sesión supervisada",
          "Case, sensores y Pulse se utilizan dentro de un protocolo supervisado; la hospitalidad sigue siendo complementaria a la atención."
        ],
        [
          "03",
          "Crear continuidad",
          "El informe, las derivaciones y el seguimiento permanecen organizados por la estructura clínica competente."
        ]
      ],
      "operatorCards": [
        [
          "Hoteles y resorts",
          "Una oferta de prevención médica que tus huéspedes encuentran en un entorno premium, bajo responsabilidad clínica."
        ],
        [
          "Retreats de longevidad",
          "Una evaluación de entrada o seguimiento que conecta el programa con una visión funcional contextualizada."
        ],
        [
          "Clubs deportivos",
          "Un punto de partida objetivo para los miembros, con un puente claro hacia un profesional de salud cuando es necesario."
        ]
      ],
      "finalTitle": "Un lugar excepcional.<br>Un sistema <em>responsable.</em>",
      "finalText": "KŌMØ trabaja con operadores que quieren que la longevidad sea una oferta creíble sin difuminar bienestar y medicina."
    }
  }
};
const caseCheckCopy = (locale) => komoCaseCopy[locale] || komoCaseCopy.en;
const komoCheckCopy = {
  "fr": {
    "nav": "KŌMØ Check",
    "headerCta": "Faire le Check",
    "homeCta": "Faire le KŌMØ Check",
    "homeNote": "Sans compte · sur votre appareil · résultat immédiat",
    "metaTitle": "KŌMØ Check — Prévenir le syndrome locomoteur",
    "metaDescription": "Une auto-évaluation anonyme et immédiate inspirée du référentiel japonais du syndrome locomoteur : lever de chaise, deux pas et contexte fonctionnel.",
    "heroEyebrow": "KŌMØ CHECK · PRÉVENTION LOCOMOTRICE",
    "heroTitle": "Comprendre votre mobilité.<br><em>Prévenir avant la limitation.</em>",
    "heroLead": "KŌMØ Check propose un premier repère fonctionnel, à réaliser chez vous sans créer de compte. Il traduit deux tests simples et votre vécu quotidien en une lecture immédiate — à utiliser pour mieux décider de la suite, jamais pour s’auto-diagnostiquer.",
    "heroPoints": [
      "3 repères fonctionnels",
      "Environ 5 minutes",
      "Calcul local · aucune donnée envoyée"
    ],
    "heroCta": "Faire mon KŌMØ Check",
    "heroSecondary": "Comprendre la méthode",
    "heroPrivacy": "Aucune inscription. Les réponses restent dans votre navigateur et ne sont ni enregistrées ni transmises à KŌMØ.",
    "referenceKicker": "Référentiel de départ",
    "referenceTitle": "Le cadre japonais du syndrome locomoteur.",
    "referenceBody": "La Japanese Orthopaedic Association relie la mobilité à la capacité de se lever, marcher et participer à la vie quotidienne. Son cadre associe le Stand-Up Test, le Two-Step Test et l’échelle GLFS-25.",
    "referenceItems": [
      [
        "01",
        "Lever de chaise",
        "force des membres inférieurs"
      ],
      [
        "02",
        "Deux pas",
        "longueur de pas fonctionnelle"
      ],
      [
        "03",
        "GLFS-25",
        "symptômes et vie quotidienne"
      ]
    ],
    "scopeEyebrow": "Avant de commencer",
    "scopeTitle": "Un repère de prévention,<br>pas un diagnostic en ligne.",
    "scopeLead": "Les seuils de lever de chaise et de deux pas sont repris du cadre JOA. Le questionnaire GLFS-25 est un instrument validé de 25 questions : KŌMØ ne le reproduit pas ici. Notre bref contexte fonctionnel est original, indicatif et ne remplace ni le GLFS-25, ni un examen clinique.",
    "safetyTitle": "Ne réalisez pas les tests si vous avez une douleur, un vertige, une faiblesse nouvelle, une instabilité ou un risque de chute.",
    "safetyBody": "Arrêtez immédiatement en cas de gêne. Utilisez une assise ferme, un sol non glissant et, si nécessaire, la présence d’un proche. En cas de traumatisme récent, d’impossibilité soudaine de marcher, de déficit neurologique nouveau ou de symptômes inquiétants, contactez sans attendre un professionnel ou les urgences locales.",
    "sourceLabel": "Source et méthode",
    "sourceText": "Les modalités et seuils présentés ici sont adaptés de la page LOCOMO ONLINE de la Japanese Orthopaedic Association. KŌMØ conserve sa propre interface, ses mots et ses règles de restitution.",
    "sourceLink": "Consulter le référentiel LOCOMO ONLINE",
    "appEyebrow": "Auto-évaluation guidée",
    "appTitle": "Votre KŌMØ Check,<br><em>maintenant.</em>",
    "appLead": "Répondez uniquement à ce que vous pouvez faire en sécurité. Vous recevez une lecture immédiatement sur cette page.",
    "ready": "Je confirme que je peux réaliser ces mouvements sans douleur, vertige ni instabilité, et que j’arrêterai au moindre inconfort.",
    "readyHelp": "Cette confirmation n’est pas enregistrée.",
    "stand": {
      "title": "Lever de chaise",
      "lead": "Le test officiel utilise des assises de 40, 30, 20 et 10 cm. Bras croisés, sans prendre d’élan, levez-vous puis tenez 3 secondes. Indiquez le premier niveau qui correspond à votre résultat.",
      "detailsTitle": "Voir les consignes de sécurité",
      "details": [
        "Choisissez une assise ferme et stable, sur un sol non glissant.",
        "Ne prenez pas d’élan en penchant le tronc en arrière.",
        "Arrêtez immédiatement si une douleur apparaît.",
        "Ne faites pas ce test seul si vous vous sentez instable ou à risque de chute."
      ],
      "options": [
        {
          "value": "0",
          "label": "Je réussis à me lever d’une assise de 40 cm sur une jambe, à droite puis à gauche."
        },
        {
          "value": "1",
          "label": "Je ne réussis pas sur une jambe à 40 cm, mais je réussis avec les deux jambes à 20 cm."
        },
        {
          "value": "2",
          "label": "Je ne réussis pas avec les deux jambes à 20 cm, mais je réussis avec les deux jambes à 30 cm."
        },
        {
          "value": "3",
          "label": "Je ne réussis pas avec les deux jambes à 30 cm."
        },
        {
          "value": "na",
          "label": "Je ne l’ai pas réalisé ou il n’était pas sûr de le faire."
        }
      ]
    },
    "twoStep": {
      "title": "Test des deux pas",
      "lead": "Après un léger échauffement, faites deux grands pas contrôlés, sans sauter, puis joignez les pieds. Effectuez deux essais et retenez la meilleure distance.",
      "detailsTitle": "Voir les consignes de sécurité",
      "details": [
        "Faites le test sur un sol non glissant, idéalement avec un proche présent.",
        "Partir pieds derrière une ligne ; mesurer jusqu’aux orteils à l’arrivée.",
        "Allez aussi loin que possible sans perdre l’équilibre.",
        "Ne sautez pas. En cas de perte d’équilibre, l’essai ne compte pas."
      ],
      "height": "Votre taille",
      "heightHelp": "en cm, par exemple 172",
      "distance": "Meilleure distance sur deux pas",
      "distanceHelp": "en cm, par exemple 224",
      "formulaTitle": "Formule JOA",
      "formula": "distance des deux pas ÷ taille = score des deux pas",
      "preview": "Votre score apparaîtra ici",
      "resultLabel": "Calculer mon résultat immédiat"
    },
    "context": {
      "title": "Contexte fonctionnel KŌMØ",
      "lead": "Ces questions sont une lecture courte et originale du vécu quotidien. Elles ne sont pas le questionnaire GLFS-25 et ne produisent pas son score.",
      "options": [
        "Au cours des quatre dernières semaines, une douleur a limité ma marche, mes escaliers ou le lever d’une chaise.",
        "Je me suis senti(e) moins sûr(e) de mon équilibre ou j’ai évité une activité par peur de tomber.",
        "Mon état physique a limité une activité importante pour moi.",
        "Je ressens une fatigue ou une faiblesse des jambes qui modifie mes habitudes.",
        "J’ai eu une chute ou plusieurs quasi-chutes au cours des douze derniers mois."
      ]
    },
    "submit": "Afficher mon résultat immédiat",
    "error": "Pour afficher le résultat, confirmez les conditions de sécurité, choisissez une réponse au lever de chaise et renseignez votre taille ainsi que votre meilleure distance sur deux pas.",
    "resultEyebrow": "Votre lecture KŌMØ Check",
    "resultTitle": "Prêt à calculer",
    "resultLead": "Votre résultat apparaîtra ici, sans création de compte.",
    "resultTwoStep": "Score des deux pas",
    "resultStand": "Lever de chaise",
    "resultContext": "Contexte fonctionnel",
    "resultDisclaimer": "Lecture indicative issue de mesures auto-déclarées ou auto-réalisées. Elle ne diagnostique ni une pathologie, ni un syndrome ; un bilan clinique peut être nécessaire même avec un résultat rassurant.",
    "clinicalCta": "Découvrir le bilan clinique KŌMØ",
    "reset": "Recommencer le Check",
    "learnEyebrow": "Pour aller plus loin",
    "learnTitle": "Du premier repère<br>au bilan instrumenté.",
    "learnLead": "KŌMØ Check ouvre la conversation. Le bilan KŌMØ Clinical, réalisé avec un professionnel, peut ensuite intégrer la KŌMØ Case, ses six capteurs Myodev, l’analyse musculaire, de marche, de posture et le contexte médical.",
    "learnCta": "Voir KŌMØ Clinical"
  },
  "en": {
    "nav": "KŌMØ Check",
    "headerCta": "Take the Check",
    "homeCta": "Take the KŌMØ Check",
    "homeNote": "No account · on your device · immediate result",
    "metaTitle": "KŌMØ Check — Locomotive syndrome prevention",
    "metaDescription": "An anonymous, immediate self-check informed by the Japanese locomotive syndrome framework: stand-up, two-step and functional context.",
    "heroEyebrow": "KŌMØ CHECK · LOCOMOTOR PREVENTION",
    "heroTitle": "Understand your mobility.<br><em>Act before limitation.</em>",
    "heroLead": "KŌMØ Check offers a first functional reference point at home, without creating an account. It turns two simple tests and your day-to-day experience into an immediate reading — to inform the next step, never to self-diagnose.",
    "heroPoints": [
      "3 functional perspectives",
      "About 5 minutes",
      "Local calculation · no data sent"
    ],
    "heroCta": "Take my KŌMØ Check",
    "heroSecondary": "Understand the method",
    "heroPrivacy": "No sign-up. Your answers remain in your browser and are neither stored nor sent to KŌMØ.",
    "referenceKicker": "Starting framework",
    "referenceTitle": "The Japanese locomotive syndrome framework.",
    "referenceBody": "The Japanese Orthopaedic Association links mobility with standing, walking and participating in daily life. Its framework combines the Stand-Up Test, Two-Step Test and GLFS-25.",
    "referenceItems": [
      [
        "01",
        "Stand-Up",
        "lower-limb strength"
      ],
      [
        "02",
        "Two-Step",
        "functional stride length"
      ],
      [
        "03",
        "GLFS-25",
        "symptoms and daily life"
      ]
    ],
    "scopeEyebrow": "Before you begin",
    "scopeTitle": "A prevention reference,<br>not an online diagnosis.",
    "scopeLead": "Stand-up and two-step thresholds follow the JOA framework. GLFS-25 is a validated 25-question instrument; KŌMØ does not reproduce it here. Our short functional context is original, indicative and not a replacement for GLFS-25 or a clinical examination.",
    "safetyTitle": "Do not perform these tests if you have pain, dizziness, new weakness, instability or a risk of falling.",
    "safetyBody": "Stop immediately if uncomfortable. Use a firm seat, a non-slip surface and, when useful, have another person present. After a recent injury, sudden inability to walk, new neurological deficit or concerning symptoms, contact a clinician or local emergency service without delay.",
    "sourceLabel": "Source and method",
    "sourceText": "The protocols and thresholds shown here are adapted from LOCOMO ONLINE, Japanese Orthopaedic Association. KŌMØ uses its own interface, wording and result rules.",
    "sourceLink": "View the LOCOMO ONLINE framework",
    "appEyebrow": "Guided self-check",
    "appTitle": "Your KŌMØ Check,<br><em>now.</em>",
    "appLead": "Answer only what you can do safely. Your reading appears immediately on this page.",
    "ready": "I confirm I can perform these movements without pain, dizziness or instability, and that I will stop at the first sign of discomfort.",
    "readyHelp": "This confirmation is not stored.",
    "stand": {
      "title": "Stand-Up Test",
      "lead": "The official test uses 40, 30, 20 and 10 cm seats. With arms folded and no momentum, stand and hold for 3 seconds. Select the first level that matches your result.",
      "detailsTitle": "View safety instructions",
      "details": [
        "Use a firm, stable seat on a non-slip surface.",
        "Do not gain momentum by leaning backwards.",
        "Stop immediately if pain occurs.",
        "Do not test alone if you feel unsteady or at risk of falling."
      ],
      "options": [
        {
          "value": "0",
          "label": "I can rise from a 40 cm seat on one leg, on the right and the left."
        },
        {
          "value": "1",
          "label": "I cannot rise on one leg at 40 cm, but I can rise on both legs at 20 cm."
        },
        {
          "value": "2",
          "label": "I cannot rise on both legs at 20 cm, but I can rise on both legs at 30 cm."
        },
        {
          "value": "3",
          "label": "I cannot rise on both legs at 30 cm."
        },
        {
          "value": "na",
          "label": "I did not perform it, or it was not safe to do so."
        }
      ]
    },
    "twoStep": {
      "title": "Two-Step Test",
      "lead": "After a brief warm-up, take two large controlled steps without jumping, then bring your feet together. Complete two trials and retain the best distance.",
      "detailsTitle": "View safety instructions",
      "details": [
        "Use a non-slip surface and, ideally, have another person present.",
        "Start with both toes behind a line; measure to the toes at the end.",
        "Go as far as you safely can without losing balance.",
        "Do not jump. A loss of balance invalidates the attempt."
      ],
      "height": "Your height",
      "heightHelp": "in cm, for example 172",
      "distance": "Best distance over two steps",
      "distanceHelp": "in cm, for example 224",
      "formulaTitle": "JOA formula",
      "formula": "two-step distance ÷ height = two-step score",
      "preview": "Your score will appear here",
      "resultLabel": "Calculate my immediate result"
    },
    "context": {
      "title": "KŌMØ functional context",
      "lead": "These are original, short questions about daily life. They are not GLFS-25 and do not generate a GLFS-25 score.",
      "options": [
        "During the past four weeks, pain limited my walking, stair climbing or rising from a chair.",
        "I felt less confident about balance or avoided an activity because I was afraid of falling.",
        "My physical state limited an activity that is important to me.",
        "Leg fatigue or weakness has changed my usual habits.",
        "I have had a fall or multiple near-falls in the past twelve months."
      ]
    },
    "submit": "Show my immediate result",
    "error": "To show a result, confirm the safety conditions, select a stand-up response, and enter your height plus your best two-step distance.",
    "resultEyebrow": "Your KŌMØ Check reading",
    "resultTitle": "Ready to calculate",
    "resultLead": "Your result will appear here without creating an account.",
    "resultTwoStep": "Two-step score",
    "resultStand": "Stand-Up Test",
    "resultContext": "Functional context",
    "resultDisclaimer": "An indicative reading based on self-reported or self-performed measurements. It does not diagnose a condition or syndrome; a clinical assessment may be useful even when the result appears reassuring.",
    "clinicalCta": "Explore KŌMØ Clinical",
    "reset": "Restart the Check",
    "learnEyebrow": "When more is useful",
    "learnTitle": "From a first reference<br>to an instrumented assessment.",
    "learnLead": "KŌMØ Check starts the conversation. A professional KŌMØ Clinical assessment can then include the six-sensor Myodev-enabled KŌMØ Case, muscle, gait and posture analysis, plus clinical context.",
    "learnCta": "See KŌMØ Clinical"
  },
  "es": {
    "nav": "KŌMØ Check",
    "headerCta": "Hacer el Check",
    "homeCta": "Hacer el KŌMØ Check",
    "homeNote": "Sin cuenta · en tu dispositivo · resultado inmediato",
    "metaTitle": "KŌMØ Check — Prevención del síndrome locomotor",
    "metaDescription": "Una autoevaluación anónima e inmediata, basada en el marco japonés del síndrome locomotor: levantarse, dos pasos y contexto funcional.",
    "heroEyebrow": "KŌMØ CHECK · PREVENCIÓN LOCOMOTORA",
    "heroTitle": "Entiende tu movilidad.<br><em>Actúa antes de la limitación.</em>",
    "heroLead": "KŌMØ Check ofrece una primera referencia funcional desde casa y sin crear cuenta. Reúne dos pruebas sencillas y tu experiencia cotidiana en una lectura inmediata — para orientar el siguiente paso, nunca para autodiagnosticarse.",
    "heroPoints": [
      "3 perspectivas funcionales",
      "Unos 5 minutos",
      "Cálculo local · sin datos enviados"
    ],
    "heroCta": "Hacer mi KŌMØ Check",
    "heroSecondary": "Comprender el método",
    "heroPrivacy": "Sin registro. Tus respuestas permanecen en el navegador y no se guardan ni se envían a KŌMØ.",
    "referenceKicker": "Marco de partida",
    "referenceTitle": "El marco japonés del síndrome locomotor.",
    "referenceBody": "La Japanese Orthopaedic Association relaciona la movilidad con levantarse, caminar y participar en la vida diaria. Su marco combina el Stand-Up Test, el Two-Step Test y GLFS-25.",
    "referenceItems": [
      [
        "01",
        "Levantarse",
        "fuerza de miembros inferiores"
      ],
      [
        "02",
        "Dos pasos",
        "longitud funcional de zancada"
      ],
      [
        "03",
        "GLFS-25",
        "síntomas y vida diaria"
      ]
    ],
    "scopeEyebrow": "Antes de empezar",
    "scopeTitle": "Una referencia preventiva,<br>no un diagnóstico online.",
    "scopeLead": "Los umbrales de levantarse y de dos pasos siguen el marco JOA. GLFS-25 es un instrumento validado de 25 preguntas; KŌMØ no lo reproduce aquí. Nuestro breve contexto funcional es original, indicativo y no sustituye GLFS-25 ni una exploración clínica.",
    "safetyTitle": "No realices estas pruebas si tienes dolor, mareo, debilidad nueva, inestabilidad o riesgo de caída.",
    "safetyBody": "Detente de inmediato ante cualquier molestia. Usa una silla firme, suelo antideslizante y, si conviene, la presencia de otra persona. Tras una lesión reciente, incapacidad súbita para caminar, déficit neurológico nuevo o síntomas preocupantes, consulta sin demora a un profesional o los servicios de urgencia locales.",
    "sourceLabel": "Fuente y método",
    "sourceText": "Los protocolos y umbrales se adaptan de LOCOMO ONLINE, Japanese Orthopaedic Association. KŌMØ utiliza su propia interfaz, redacción y reglas de resultado.",
    "sourceLink": "Consultar el marco LOCOMO ONLINE",
    "appEyebrow": "Autoevaluación guiada",
    "appTitle": "Tu KŌMØ Check,<br><em>ahora.</em>",
    "appLead": "Responde solo a aquello que puedas hacer con seguridad. La lectura aparece de inmediato en esta página.",
    "ready": "Confirmo que puedo realizar estos movimientos sin dolor, mareo ni inestabilidad y que me detendré ante la primera molestia.",
    "readyHelp": "Esta confirmación no se guarda.",
    "stand": {
      "title": "Prueba de levantarse",
      "lead": "La prueba oficial utiliza asientos de 40, 30, 20 y 10 cm. Con brazos cruzados y sin impulso, levántate y mantén 3 segundos. Elige el primer nivel que corresponda a tu resultado.",
      "detailsTitle": "Ver instrucciones de seguridad",
      "details": [
        "Usa un asiento firme y estable sobre suelo antideslizante.",
        "No cojas impulso inclinándote hacia atrás.",
        "Detente de inmediato si aparece dolor.",
        "No hagas la prueba a solas si te sientes inestable o existe riesgo de caída."
      ],
      "options": [
        {
          "value": "0",
          "label": "Puedo levantarme desde 40 cm a una pierna, derecha e izquierda."
        },
        {
          "value": "1",
          "label": "No puedo a una pierna a 40 cm, pero sí con las dos piernas a 20 cm."
        },
        {
          "value": "2",
          "label": "No puedo con las dos piernas a 20 cm, pero sí con las dos piernas a 30 cm."
        },
        {
          "value": "3",
          "label": "No puedo levantarme con las dos piernas a 30 cm."
        },
        {
          "value": "na",
          "label": "No lo hice o no era seguro hacerlo."
        }
      ]
    },
    "twoStep": {
      "title": "Prueba de dos pasos",
      "lead": "Tras un breve calentamiento, da dos pasos largos y controlados, sin saltar, y junta los pies. Haz dos intentos y conserva la mejor distancia.",
      "detailsTitle": "Ver instrucciones de seguridad",
      "details": [
        "Usa suelo antideslizante e, idealmente, otra persona presente.",
        "Empieza con ambos dedos detrás de una línea; mide hasta los dedos al final.",
        "Llega todo lo lejos que puedas sin perder el equilibrio.",
        "No saltes. Si pierdes el equilibrio, el intento no cuenta."
      ],
      "height": "Tu altura",
      "heightHelp": "en cm, por ejemplo 172",
      "distance": "Mejor distancia en dos pasos",
      "distanceHelp": "en cm, por ejemplo 224",
      "formulaTitle": "Fórmula JOA",
      "formula": "distancia de dos pasos ÷ altura = puntuación de dos pasos",
      "preview": "Tu puntuación aparecerá aquí",
      "resultLabel": "Calcular mi resultado inmediato"
    },
    "context": {
      "title": "Contexto funcional KŌMØ",
      "lead": "Son preguntas breves y originales sobre la vida cotidiana. No son GLFS-25 ni generan su puntuación.",
      "options": [
        "En las últimas cuatro semanas, el dolor limitó mi marcha, escaleras o el levantarme de una silla.",
        "Me sentí menos seguro/a con el equilibrio o evité una actividad por miedo a caer.",
        "Mi estado físico limitó una actividad importante para mí.",
        "La fatiga o debilidad de piernas ha cambiado mis hábitos.",
        "He tenido una caída o varias casi-caídas en los últimos doce meses."
      ]
    },
    "submit": "Mostrar mi resultado inmediato",
    "error": "Para mostrar un resultado, confirma las condiciones de seguridad, elige una respuesta de levantarse e indica altura y mejor distancia de dos pasos.",
    "resultEyebrow": "Tu lectura KŌMØ Check",
    "resultTitle": "Listo para calcular",
    "resultLead": "Tu resultado aparecerá aquí sin crear cuenta.",
    "resultTwoStep": "Puntuación de dos pasos",
    "resultStand": "Prueba de levantarse",
    "resultContext": "Contexto funcional",
    "resultDisclaimer": "Lectura indicativa basada en medidas auto-realizadas o auto-declaradas. No diagnostica una enfermedad o síndrome; una valoración clínica puede ser útil incluso con un resultado tranquilizador.",
    "clinicalCta": "Descubrir KŌMØ Clinical",
    "reset": "Repetir el Check",
    "learnEyebrow": "Cuando haga falta más",
    "learnTitle": "De una primera referencia<br>a una valoración instrumentada.",
    "learnLead": "KŌMØ Check inicia la conversación. Una valoración KŌMØ Clinical con un profesional puede incluir la KŌMØ Case con seis sensores Myodev, análisis muscular, de marcha, de postura y contexto clínico.",
    "learnCta": "Ver KŌMØ Clinical"
  }
};
const checkCopy = (locale) => komoCheckCopy[locale] || komoCheckCopy.en;

Object.assign(komoCheckCopy.fr, {
  "action": {
    "eyebrow": "Après le repère",
    "title": "Agir tôt, sans<br><em>se mettre en danger.</em>",
    "lead": "Le référentiel japonais rappelle que la mobilité peut évoluer favorablement avec des mesures adaptées. La force des membres inférieurs, l’équilibre, la marche et une alimentation suffisante constituent des leviers simples de prévention.",
    "cards": [
      [
        "Équilibre",
        "Un travail d’appui sur une jambe peut être envisagé près d’un support stable, uniquement si vous êtes en sécurité."
      ],
      [
        "Force",
        "Des squats peu profonds ou des levers-assis contrôlés peuvent entretenir les jambes ; ne bloquez pas votre respiration et n’allez jamais dans la douleur."
      ],
      [
        "Habitudes",
        "La régularité, la marche et un apport alimentaire équilibré — notamment en protéines et calcium — soutiennent la fonction au fil du temps."
      ]
    ],
    "note": "Il ne s’agit pas d’une prescription. En présence de douleur, de pathologie connue, de chute ou de doute, demandez un programme individualisé à un professionnel."
  }
});
Object.assign(komoCheckCopy.en, {
  "action": {
    "eyebrow": "After the reference",
    "title": "Act early, without<br><em>taking unnecessary risks.</em>",
    "lead": "The Japanese framework notes that mobility can improve with appropriate measures. Lower-limb strength, balance, walking and sufficient nutrition are practical prevention levers.",
    "cards": [
      [
        "Balance",
        "Single-leg balance work may be considered next to a stable support, only when you can do it safely."
      ],
      [
        "Strength",
        "Shallow squats or controlled sit-to-stands can support the legs; do not hold your breath and never work through pain."
      ],
      [
        "Habits",
        "Regular activity, walking and balanced nutrition — including adequate protein and calcium — support function over time."
      ]
    ],
    "note": "This is not an exercise prescription. With pain, a known condition, falls or uncertainty, ask a professional for an individual programme."
  }
});
Object.assign(komoCheckCopy.es, {
  "action": {
    "eyebrow": "Después de la referencia",
    "title": "Actúa pronto, sin<br><em>asumir riesgos innecesarios.</em>",
    "lead": "El marco japonés señala que la movilidad puede mejorar con medidas adaptadas. Fuerza de piernas, equilibrio, marcha y nutrición suficiente son palancas prácticas de prevención.",
    "cards": [
      [
        "Equilibrio",
        "Se puede considerar trabajar el apoyo a una pierna junto a un soporte estable, solo si es seguro."
      ],
      [
        "Fuerza",
        "Sentadillas poco profundas o levantarse-sentarse de forma controlada pueden mantener las piernas; no contengas la respiración ni trabajes con dolor."
      ],
      [
        "Hábitos",
        "Actividad regular, caminar y nutrición equilibrada — con proteína y calcio suficientes — sostienen la función a lo largo del tiempo."
      ]
    ],
    "note": "No es una prescripción de ejercicio. Con dolor, una patología conocida, caídas o dudas, pide a un profesional un programa individualizado."
  }
});

const partnerContent = (locale) => partnerCopy[locale] || partnerCopy.en;

const journeyCopy = (locale) => pulseJourney[locale] || pulseJourney.en;
const entranceCopy = (locale) => komoEntrances[locale] || komoEntrances.en;
const canonical = (locale, page) => `${site.origin}${pagePath(locale, page)}`;
const link = (locale, page) => (/^https?:\/\//.test(page) || page.startsWith('mailto:') ? page : pagePath(locale, page));
const pulseStartLink = (locale) => `${pagePath(locale, 'pulse')}#start-pulse`;
const scoreLink = (locale) => pulseStartLink(locale);
const article = (locale) => `${pagePath(locale, 'library')}#articles`;

const raw = (value = '') => String(value);
const text = (value = '') => escapeHtml(value);

function pageAction(locale, page) {
  const c = translations[locale];
  const p = partnerContent(locale);
  const routeActions = {
    check: { label: checkCopy(locale).headerCta, href: '#start-check' },
    clinical: { label: c.clinical.cta, href: `${pagePath(locale, 'contact')}#contact-form` },
    partners: { label: p.cta, href: `${pagePath(locale, 'contact')}#contact-form` },
    'motion-retreats': { label: p.hospitality.cta, href: pagePath(locale, 'partners') },
    library: { label: c.library.cta, href: scoreLink(locale) },
    circle: { label: c.circle.cta, href: `${pagePath(locale, 'contact')}#contact-form` },
    science: { label: c.science.cta, href: `${pagePath(locale, 'contact')}#contact-form` },
    contact: { label: c.global.contactUs, href: 'mailto:contact@komolongevity.com', external: true }
  };
  return routeActions[page] || (page === 'index' ? { label: checkCopy(locale).homeCta, href: pagePath(locale, 'check') } : { label: journeyCopy(locale).navCta, href: scoreLink(locale) });
}

function languageMenu(locale, page) {
  const current = translations[locale];
  return `
    <div class="language" data-language>
      <button type="button" aria-haspopup="true" aria-expanded="false" aria-label="${text(current.languageName)}">${text(current.code)}</button>
      <div class="language-menu" role="menu">
        ${site.locales.map((candidate) => {
          const item = translations[candidate];
          return `<a href="${pagePath(candidate, page)}" data-locale="${candidate}" role="menuitem" ${candidate === locale ? 'aria-current="true"' : ''}>${text(item.languageName)}<span>${text(item.code)}</span></a>`;
        }).join('')}
      </div>
    </div>`;
}

function header(locale, page) {
  const c = translations[locale];
  const action = pageAction(locale, page);
  const navItems = [
    ['check', checkCopy(locale).nav], ['pulse', c.nav.pulse], ['clinical', c.nav.clinical], ['locomotor', c.nav.locomotor], ['library', c.nav.library], ['partners', c.nav.partners]
  ];
  return `
    <a class="skip-link" href="#main">${text(c.global.skip)}</a>
    <header class="site-header">
      <div class="shell nav">
        <a class="brand" href="${pagePath(locale)}" aria-label="KŌMØ — ${text(c.global.brandSubtitle)}">
          <span class="brand-mark" aria-hidden="true">K</span>
          <span>KŌMØ<small>${text(c.global.brandSubtitle)}</small></span>
        </a>
        <nav class="primary-nav" aria-label="Navigation principale" data-primary-nav>
          ${navItems.map(([target, label]) => `<a href="${link(locale, target)}" ${page === target ? 'aria-current="page"' : ''}>${text(label)}</a>`).join('')}
          <a href="${pagePath(locale, 'contact')}" ${page === 'contact' ? 'aria-current="page"' : ''}>${text(c.nav.contact)}</a>
        </nav>
        <div class="header-actions">
          ${languageMenu(locale, page)}
          <a class="nav-cta" href="${text(action.href)}" ${action.external ? 'target="_blank" rel="noreferrer"' : ''}>${text(action.label)}</a>
          <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-label="${text(c.nav.menu)}"><span></span></button>
        </div>
      </div>
    </header>`;
}

function footer(locale) {
  const c = translations[locale];
  const group = (title, rows) => `
    <div><h3>${text(title)}</h3>${rows.map(([label, target]) => `<a href="${link(locale, target)}" ${target.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''}>${text(label)}</a>`).join('')}</div>`;
  return `
    <footer class="footer">
      <div class="shell">
        <div class="footer-grid">
          <div>
            <a class="brand" href="${pagePath(locale)}"><span class="brand-mark" aria-hidden="true">K</span><span>KŌMØ<small>${text(c.global.brandSubtitle)}</small></span></a>
            <p class="footer-copy">${text(c.global.footerCopy)}</p>
          </div>
          ${group(c.footer.ecosystem, c.footer.links1)}
          ${group(c.footer.resources, c.footer.links2)}
          ${group(c.footer.company, c.footer.links3)}
        </div>
        <div class="footer-bottom"><span>${text(c.global.allRights)}</span><span>${text(c.global.madeBy)}</span></div>
      </div>
    </footer>`;
}

function structuredData(locale, page, meta) {
  if (page !== 'locomotor') return '';
  const conditionNames = {
    en: 'Locomotive syndrome',
    fr: 'Syndrome locomoteur',
    es: 'Síndrome locomotor'
  };
  const data = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: meta.metaTitle,
    description: meta.metaDescription,
    url: canonical(locale, page),
    inLanguage: translations[locale].lang,
    dateModified: '2026-08-13',
    about: {
      '@type': 'MedicalCondition',
      name: conditionNames[locale]
    },
    citation: locomotorReferences.map((reference) => reference.url),
    publisher: {
      '@type': 'Organization',
      name: 'KŌMØ',
      url: site.origin
    }
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`;
}

function layout(locale, page, content, meta) {
  const c = translations[locale];
  const action = pageAction(locale, page);
  const alternatives = site.locales.map((item) => `<link rel="alternate" hreflang="${item}" href="${canonical(item, page)}">`).join('\n    ');
  const defaultUrl = canonical('en', page);
  return `<!doctype html>
<html lang="${c.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#063c42">
  <meta name="color-scheme" content="light">
  <title>${text(meta.metaTitle)}</title>
  <meta name="description" content="${text(meta.metaDescription)}">
  <link rel="canonical" href="${canonical(locale, page)}">
  ${alternatives}
  <link rel="alternate" hreflang="x-default" href="${defaultUrl}">
  <meta property="og:type" content="${page === 'locomotor' ? 'article' : 'website'}">
  <meta property="og:locale" content="${locale === 'en' ? 'en_GB' : locale === 'fr' ? 'fr_FR' : 'es_ES'}">
  <meta property="og:site_name" content="KŌMØ">
  <meta property="og:title" content="${text(meta.metaTitle)}">
  <meta property="og:description" content="${text(meta.metaDescription)}">
  <meta property="og:url" content="${canonical(locale, page)}">
  <meta property="og:image" content="${site.origin}/assets/og-komo.svg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/site.css?v=${assetVersion}">
  ${structuredData(locale, page, meta)}
  <script defer src="/assets/js/site.js?v=${assetVersion}"></script>
</head>
<body data-page="${text(page)}">
${header(locale, page)}
<main id="main">${content}</main>
${footer(locale)}
<a class="button mobile-cta" href="${text(action.href)}" ${action.external ? 'target="_blank" rel="noreferrer"' : ''}>${text(action.label)}</a>
</body>
</html>`;
}

function buttons(locale, first, second, secondHref) {
  return `<div class="hero-actions"><a class="button" href="${scoreLink(locale)}">${text(first)} <span aria-hidden="true">↗</span></a>${second ? `<a class="button button-outline" href="${secondHref || '#ecosystem'}">${text(second)}</a>` : ''}</div>`;
}


function checkPage(locale) {
  const c = checkCopy(locale);
  const externalSource = 'https://locomo-joa.jp/en';
  return [
    '<section class="check-hero">',
      '<div class="shell check-hero-grid">',
        '<div class="check-hero-copy">',
          '<p class="eyebrow">' + text(c.heroEyebrow) + '</p>',
          '<h1 class="case-hero-title">' + raw(c.heroTitle) + '</h1>',
          '<p class="case-hero-lead">' + text(c.heroLead) + '</p>',
          '<ul class="check-hero-points">' + c.heroPoints.map(function(item) { return '<li>' + text(item) + '</li>'; }).join('') + '</ul>',
          '<div class="hero-actions case-hero-actions">',
            '<a class="button" href="#start-check">' + text(c.heroCta) + ' <span aria-hidden="true">↓</span></a>',
            '<a class="button button-outline" href="#method">' + text(c.heroSecondary) + '</a>',
          '</div>',
          '<p class="check-privacy">' + text(c.heroPrivacy) + '</p>',
        '</div>',
        '<aside class="check-reference-card reveal" aria-label="' + text(c.referenceKicker) + '">',
          '<p class="eyebrow">' + text(c.referenceKicker) + '</p>',
          '<h2>' + text(c.referenceTitle) + '</h2>',
          '<p>' + text(c.referenceBody) + '</p>',
          '<ol>' + c.referenceItems.map(function(item) { return '<li><span>' + text(item[0]) + '</span><strong>' + text(item[1]) + '</strong><small>' + text(item[2]) + '</small></li>'; }).join('') + '</ol>',
        '</aside>',
      '</div>',
    '</section>',

    '<section class="check-scope section" id="method">',
      '<div class="shell check-scope-grid">',
        '<div class="reveal"><p class="eyebrow">' + text(c.scopeEyebrow) + '</p><h2 class="section-heading">' + raw(c.scopeTitle) + '</h2></div>',
        '<div class="check-scope-copy reveal"><p class="section-lead">' + text(c.scopeLead) + '</p>',
          '<aside class="check-safety"><strong>' + text(c.safetyTitle) + '</strong><p>' + text(c.safetyBody) + '</p></aside>',
          '<div class="check-source"><span>' + text(c.sourceLabel) + '</span><p>' + text(c.sourceText) + '</p><a href="' + externalSource + '" target="_blank" rel="noreferrer">' + text(c.sourceLink) + ' <span aria-hidden="true">↗</span></a></div>',
        '</div>',
      '</div>',
    '</section>',

    '<section class="check-app-section" id="start-check">',
      '<div class="shell">',
        '<div class="check-app-intro reveal"><div><p class="eyebrow">' + text(c.appEyebrow) + '</p><h2 class="section-heading">' + raw(c.appTitle) + '</h2></div><p class="section-lead">' + text(c.appLead) + '</p></div>',
        '<form class="komo-check-form" data-komo-check data-locale="' + text(locale) + '" novalidate>',
          '<div class="check-readiness"><label><input type="checkbox" name="ready" required><span>' + text(c.ready) + '</span></label><p>' + text(c.readyHelp) + '</p></div>',
          '<fieldset class="check-fieldset">',
            '<legend><span>01</span>' + text(c.stand.title) + '</legend>',
            '<p>' + text(c.stand.lead) + '</p>',
            '<details class="check-details"><summary>' + text(c.stand.detailsTitle) + '</summary><ul>' + c.stand.details.map(function(item) { return '<li>' + text(item) + '</li>'; }).join('') + '</ul></details>',
            '<div class="check-choice-grid">' + c.stand.options.map(function(item, index) { var id = 'stand-' + item.value; return '<label class="check-choice" for="' + id + '"><input id="' + id + '" type="radio" name="standUp" value="' + text(item.value) + '"><span><b>' + String(index + 1).padStart(2, '0') + '</b>' + text(item.label) + '</span></label>'; }).join('') + '</div>',
          '</fieldset>',
          '<fieldset class="check-fieldset">',
            '<legend><span>02</span>' + text(c.twoStep.title) + '</legend>',
            '<p>' + text(c.twoStep.lead) + '</p>',
            '<details class="check-details"><summary>' + text(c.twoStep.detailsTitle) + '</summary><ul>' + c.twoStep.details.map(function(item) { return '<li>' + text(item) + '</li>'; }).join('') + '</ul></details>',
            '<div class="check-number-grid">',
              '<label for="check-height"><span>' + text(c.twoStep.height) + '</span><input id="check-height" name="height" type="number" inputmode="decimal" min="120" max="230" step="0.1" required aria-describedby="check-height-help"><small id="check-height-help">' + text(c.twoStep.heightHelp) + '</small></label>',
              '<label for="check-distance"><span>' + text(c.twoStep.distance) + '</span><input id="check-distance" name="distance" type="number" inputmode="decimal" min="40" max="500" step="0.1" required aria-describedby="check-distance-help"><small id="check-distance-help">' + text(c.twoStep.distanceHelp) + '</small></label>',
            '</div>',
            '<div class="check-formula"><span>' + text(c.twoStep.formulaTitle) + '</span><strong>' + text(c.twoStep.formula) + '</strong><output data-two-step-preview>' + text(c.twoStep.preview) + '</output></div>',
          '</fieldset>',
          '<fieldset class="check-fieldset check-context">',
            '<legend><span>03</span>' + text(c.context.title) + '</legend>',
            '<p>' + text(c.context.lead) + '</p>',
            '<div class="check-context-list">' + c.context.options.map(function(item, index) { var id = 'context-' + index; return '<label for="' + id + '"><input id="' + id + '" type="checkbox" name="context" value="' + index + '"><span>' + text(item) + '</span></label>'; }).join('') + '</div>',
          '</fieldset>',
          '<p class="check-form-error" data-check-error role="alert" aria-live="polite"></p>',
          '<button class="button check-submit" type="submit">' + text(c.submit) + ' <span aria-hidden="true">→</span></button>',
        '</form>',
        '<section class="check-result" data-check-result hidden tabindex="-1" aria-live="polite">',
          '<div class="check-result-heading"><p class="eyebrow">' + text(c.resultEyebrow) + '</p><h2 data-check-result-title>' + text(c.resultTitle) + '</h2><p data-check-result-lead>' + text(c.resultLead) + '</p></div>',
          '<div class="check-result-metrics">',
            '<article><span>' + text(c.resultTwoStep) + '</span><strong data-check-two-step>—</strong><p data-check-two-step-note></p></article>',
            '<article><span>' + text(c.resultStand) + '</span><strong data-check-stand>—</strong><p data-check-stand-note></p></article>',
            '<article><span>' + text(c.resultContext) + '</span><strong data-check-context>—</strong><p data-check-context-note></p></article>',
          '</div>',
          '<div class="check-result-next" data-check-next></div>',
          '<p class="check-result-disclaimer">' + text(c.resultDisclaimer) + '</p>',
          '<div class="hero-actions"><a class="button" href="' + pagePath(locale, 'clinical') + '">' + text(c.clinicalCta) + ' <span aria-hidden="true">↗</span></a><button class="text-button" type="button" data-check-reset>' + text(c.reset) + '</button></div>',
        '</section>',
      '</div>',
    '</section>',


    '<section class="check-actions section">',
      '<div class="shell">',
        '<div class="check-actions-intro reveal"><p class="eyebrow">' + text(c.action.eyebrow) + '</p><h2 class="section-heading">' + raw(c.action.title) + '</h2><p class="section-lead">' + text(c.action.lead) + '</p></div>',
        '<div class="check-action-grid">' + c.action.cards.map(function(card, index) { return '<article class="reveal"><span>0' + String(index + 1) + '</span><h3>' + text(card[0]) + '</h3><p>' + text(card[1]) + '</p></article>'; }).join('') + '</div>',
        '<p class="check-action-note reveal"><strong>+</strong>' + text(c.action.note) + '</p>',
      '</div>',
    '</section>',

    '<section class="check-learn section">',
      '<div class="shell check-learn-grid reveal">',
        '<div><p class="eyebrow">' + text(c.learnEyebrow) + '</p><h2 class="section-heading">' + raw(c.learnTitle) + '</h2></div>',
        '<div><p class="section-lead">' + text(c.learnLead) + '</p><a class="button button-outline" href="' + pagePath(locale, 'clinical') + '">' + text(c.learnCta) + ' <span aria-hidden="true">↗</span></a></div>',
      '</div>',
    '</section>'
  ].join('');
}

function homePage(locale) {
  const h = translations[locale].home;
  const j = journeyCopy(locale);
  const c = caseCheckCopy(locale);
  const p = partnerContent(locale);
  return `
    <section class="case-hero" aria-label="KŌMØ Case">
      <div class="shell case-hero-grid">
        <div class="case-hero-copy">
          <p class="eyebrow">${text(c.heroEyebrow)}</p>
          <h1 class="case-hero-title">${raw(c.heroTitle)}</h1>
          <p class="case-hero-lead">${text(c.heroLead)}</p>
          <div class="hero-actions case-hero-actions">
            <a class="button" href="${pagePath(locale, 'check')}">${text(checkCopy(locale).homeCta)} <span aria-hidden="true">→</span></a>
            <a class="button button-outline" href="${link(locale, 'partners')}">${text(c.heroSecondaryCta)} <span aria-hidden="true">↗</span></a>
          </div>
          <p class="case-hero-check-link">${text(checkCopy(locale).homeNote)}</p>
          <ul class="case-hero-proof" aria-label="KŌMØ Case proof points">
            ${c.heroProof.map((item) => `<li>${text(item)}</li>`).join('')}
          </ul>
          <p class="case-hero-note">${text(c.heroNote)}</p>
        </div>
        <figure class="case-hero-visual reveal">
          <img src="/assets/images/komo-case-score.jpeg" alt="${text(c.heroImageAlt)}" width="1122" height="1402" fetchpriority="high" decoding="async">
          <figcaption><span>01 / KŌMØ Case</span><span>Powered by Myodev</span></figcaption>
        </figure>
      </div>
    </section>

    ${caseCheckSection(locale)}

    ${komoEntranceSection(locale)}

    ${partnerOfferSection(locale)}

    ${pulsePathSection(locale)}

    <section class="section-tight pulse-portrait-band">
      <div class="shell">
        <div class="pulse-image-panel reveal">
          <figure class="pulse-image"><img src="/assets/images/pulse-profile-v1.webp" alt="${text(j.profileImageAlt)}" width="1200" height="1200" loading="lazy" decoding="async"></figure>
          <div class="pulse-image-copy">
            <p class="eyebrow">${text(j.profileEyebrow)}</p>
            <h2 class="section-heading">${raw(j.profileTitle)}</h2>
            <p class="section-lead">${text(j.profileLead)}</p>
            <a class="button" href="${scoreLink(locale)}">${text(j.primaryCta)} <span aria-hidden="true">↗</span></a>
            <p class="pulse-image-note">${text(j.profileNote)}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="ecosystem">
      <div class="shell">
        <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.ecosystemEyebrow)}</p><h2 class="section-heading">${raw(p.ecosystemTitle)}</h2></div><p class="section-lead">${text(p.ecosystemLead)}</p></div>
        <div class="ecosystem-grid">
          ${p.ecosystem.map((item) => `<article class="ecosystem-card reveal"><span class="ecosystem-index">${text(item.num)}</span><h3>${text(item.title)}</h3><p>${text(item.text)}</p><a class="text-link" href="${link(locale, item.page)}">${text(item.link)}</a></article>`).join('')}
        </div>
      </div>
    </section>

    <section class="section split-band">
      <div class="shell split-grid">
        <div class="reveal"><p class="eyebrow eyebrow-light">${text(h.systemEyebrow)}</p><h2 class="section-heading">${raw(h.systemTitle)}</h2><p class="section-lead">${text(h.systemLead)}</p></div>
        <div class="signal-list reveal">${h.capacities.map(([num, title, body]) => `<article class="signal"><span class="signal-num">${text(num)}</span><div><h3>${text(title)}</h3><p>${text(body)}</p></div></article>`).join('')}</div>
      </div>
    </section>

    ${partnerNetworkSection(locale)}

    <section class="section"><div class="shell intro-grid reveal"><div><p class="eyebrow">${text(h.scienceEyebrow)}</p><h2 class="section-heading">${raw(h.scienceTitle)}</h2></div><div><p class="section-lead">${text(h.scienceLead)}</p><a class="text-link" href="${pagePath(locale, 'science')}">${text(h.scienceCta)}</a></div></div></section>

    <section class="quote-band"><div class="shell"><blockquote class="reveal">${raw(p.finalTitle)}</blockquote><p class="section-lead" style="color:rgba(255,255,255,.72)">${text(p.finalText)}</p><div class="hero-actions"><a class="button button-light" href="${pagePath(locale, 'contact')}#contact-form">${text(p.cta)}</a></div></div></section>`;
}

function caseCheckSection(locale) {
  const c = caseCheckCopy(locale);
  return `
    <section class="case-check section" id="komo-check">
      <div class="shell">
        <div class="case-section-intro reveal">
          <div><p class="eyebrow">${text(c.checkEyebrow)}</p><h2 class="section-heading">${raw(c.checkTitle)}</h2></div>
          <p class="section-lead">${text(c.checkLead)}</p>
        </div>
        <ol class="case-measure-grid">
          ${c.checkSteps.map(([number, title, body]) => `<li class="case-measure-card reveal"><span>${text(number)}</span><h3>${text(title)}</h3><p>${text(body)}</p></li>`).join('')}
        </ol>
        <p class="case-check-notice reveal"><span aria-hidden="true">+</span>${text(c.checkNotice)}</p>
      </div>
    </section>

    <section class="case-score-section">
      <div class="shell case-score-grid">
        <figure class="case-score-visual reveal"><img src="/assets/images/komo-case-overview.jpeg" alt="${text(c.scoreImageAlt)}" width="1122" height="1402" loading="lazy" decoding="async"></figure>
        <div class="case-score-copy reveal">
          <p class="eyebrow">${text(c.scoreEyebrow)}</p>
          <h2 class="section-heading">${raw(c.scoreTitle)}</h2>
          <p class="section-lead">${text(c.scoreLead)}</p>
          <div class="case-score-pillars">
            ${c.scorePillars.map(([title, body], index) => `<article><span>0${index + 1}</span><div><h3>${text(title)}</h3><p>${text(body)}</p></div></article>`).join('')}
          </div>
          <aside class="case-score-note"><strong>${text(c.scoreNoteTitle)}</strong><p>${text(c.scoreNote)}</p></aside>
        </div>
      </div>
    </section>

    <section class="case-technology section" id="myodev">
      <div class="shell">
        <div class="case-section-intro reveal">
          <div><p class="eyebrow">${text(c.technologyEyebrow)}</p><h2 class="section-heading">${raw(c.technologyTitle)}</h2></div>
          <p class="section-lead">${text(c.technologyLead)}</p>
        </div>
        <div class="case-sensor-grid">
          ${c.sensorCards.map(([title, body, image, alt]) => `<article class="case-sensor-card reveal"><figure><img src="/assets/images/${text(image)}" alt="${text(alt)}" width="1122" height="1402" loading="lazy" decoding="async"></figure><div><h3>${text(title)}</h3><p>${text(body)}</p></div></article>`).join('')}
        </div>
        <div class="case-technology-bar reveal">
          <div class="case-technology-points">${c.technologyPoints.map(([label, body]) => `<article><strong>${text(label)}</strong><p>${text(body)}</p></article>`).join('')}</div>
          <a class="button button-outline" href="${pagePath(locale, 'contact')}#contact-form">${text(c.technologyCta)} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </section>

    <section class="case-closing">
      <div class="shell case-closing-grid">
        <div class="reveal"><p class="eyebrow eyebrow-light">${text(c.closingEyebrow)}</p><h2>${raw(c.closingTitle)}</h2></div>
        <div class="reveal"><p>${text(c.closingLead)}</p><a class="button button-light" href="#ecosystem">${text(c.closingCta)} <span aria-hidden="true">↓</span></a></div>
      </div>
    </section>`;
}
function partnerOfferSection(locale) {
  const p = partnerContent(locale);
  return `
    <section class="partner-offer section" id="partner-offer">
      <div class="shell">
        <div class="case-section-intro reveal">
          <div><p class="eyebrow">${text(p.offerEyebrow)}</p><h2 class="section-heading">${raw(p.offerTitle)}</h2></div>
          <p class="section-lead">${text(p.offerLead)}</p>
        </div>
        <div class="partner-model-grid">
          ${p.offerModes.map(([number, title, body]) => `<article class="partner-model-card reveal"><span class="partner-model-index">${text(number)}</span><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}
        </div>
        <section class="partner-score-frame reveal" aria-label="${text(p.scoreEyebrow)}">
          <div class="partner-score-intro"><p class="eyebrow">${text(p.scoreEyebrow)}</p><h3>${raw(p.scoreTitle)}</h3><p>${text(p.scoreLead)}</p><p class="partner-score-boundary">${text(p.scoreBoundary)}</p></div>
          <ol class="partner-score-domains">${p.scoreDomains.map(([number, title, body]) => `<li><span>${text(number)}</span><div><h4>${text(title)}</h4><p>${text(body)}</p></div></li>`).join('')}</ol>
        </section>
        <section class="partner-governance reveal">
          <div><p class="eyebrow eyebrow-light">${text(p.governanceEyebrow)}</p><h3>${raw(p.governanceTitle)}</h3><p>${text(p.governanceLead)}</p></div>
          <ol class="partner-governance-steps">${p.governanceSteps.map(([number, title, body]) => `<li><span>${text(number)}</span><div><strong>${text(title)}</strong><p>${text(body)}</p></div></li>`).join('')}</ol>
          <a class="button button-light" href="${pagePath(locale, 'contact')}#contact-form">${text(p.cta)} <span aria-hidden="true">↗</span></a>
        </section>
        <section class="partner-territories reveal"><p class="eyebrow">${text(p.territoryEyebrow)}</p><div><h3>${text(p.territoryTitle)}</h3><ul>${p.territories.map((territory) => `<li>${text(territory)}</li>`).join('')}</ul><p>${text(p.territoryNote)}</p></div></section>
      </div>
    </section>`;
}

function partnerNetworkSection(locale) {
  const p = partnerContent(locale);
  return `
    <section class="partner-network section">
      <div class="shell">
        <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.networkEyebrow)}</p><h2 class="section-heading">${raw(p.networkTitle)}</h2></div><p class="section-lead">${text(p.networkLead)}</p></div>
        <div class="partner-link-grid">${p.networkLinks.map((item) => `<a class="partner-link-card reveal" href="${text(item.href)}" target="_blank" rel="noreferrer"><p class="eyebrow">${text(item.eyebrow)}</p><h3>${text(item.title)}</h3><p>${text(item.body)}</p><strong>${text(item.cta)} <span aria-hidden="true">↗</span></strong></a>`).join('')}</div>
      </div>
    </section>`;
}

function komoEntranceSection(locale) {
  const copy = entranceCopy(locale);
  return `<section class="section entry-choice" id="choose-your-entry">
    <div class="shell">
      <div class="entry-choice-intro reveal">
        <div><p class="eyebrow">${text(copy.eyebrow)}</p><h2 class="section-heading">${raw(copy.title)}</h2></div>
        <p class="section-lead">${text(copy.lead)}</p>
      </div>
      <div class="entry-choice-grid">
        ${copy.paths.map((path) => `<article class="entry-choice-card entry-choice-card--${text(path.tone)} reveal">
          <div class="entry-choice-top"><span>${text(path.number)}</span><span>${text(path.audience)}</span></div>
          <div class="entry-choice-copy"><h3>${text(path.title)}</h3><p>${text(path.body)}</p></div>
          <div class="entry-choice-action"><small>${text(path.note)}</small><a class="text-link" href="${link(locale, path.page)}">${text(path.cta)} <span aria-hidden="true">↗</span></a></div>
        </article>`).join('')}
      </div>
      <p class="entry-choice-continuity reveal"><span aria-hidden="true">→</span>${text(copy.continuity)}</p>
    </div>
  </section>`;
}

function pulsePathSection(locale) {
  const j = journeyCopy(locale);
  return `
    <section class="section pulse-path" id="your-path">
      <div class="shell">
        <div class="pulse-path-intro reveal">
          <div><p class="eyebrow">${text(j.journeyEyebrow)}</p><h2 class="section-heading">${raw(j.journeyTitle)}</h2></div>
          <p class="section-lead">${text(j.journeyLead)}</p>
        </div>
        <ol class="journey-steps">
          ${j.steps.map(([number, title, body], index) => `
            <li class="journey-step reveal ${index === 0 ? 'is-current' : ''}">
              <span class="journey-index">${text(number)}</span>
              ${index === 0 ? `<span class="journey-now">${text(j.journeyNow)}</span>` : ''}
              <h3>${text(title)}</h3>
              <p>${text(body)}</p>
            </li>`).join('')}
        </ol>
      </div>
    </section>`;
}

function genericHero(locale, page, data) {
  const ctaTarget = {
    contact: '#contact-form',
    partners: `${pagePath(locale, 'contact')}#contact-form`,
    clinical: pagePath(locale, 'contact'),
    science: pagePath(locale, 'contact'),
    circle: pagePath(locale, 'contact'),
    'motion-retreats': pagePath(locale, 'partners')
  }[page] || scoreLink(locale);
  const ctaLabel = page === 'pulse' ? journeyCopy(locale).primaryCta : data.cta;
  return `<section class="page-hero"><div class="shell"><p class="breadcrumb"><a href="${pagePath(locale)}">KŌMØ</a><span>/</span><span>${text(data.eyebrow)}</span></p><p class="eyebrow eyebrow-light reveal">${text(data.eyebrow)}</p><h1 class="display reveal">${raw(data.title)}</h1><p class="lede reveal">${text(data.lead)}</p><div class="hero-actions"><a class="button button-light" href="${ctaTarget}">${text(ctaLabel)} <span aria-hidden="true">↗</span></a></div><p class="hero-note">${text(data.note)}</p></div></section>`;
}

function introBlock(data) {
  return `<section class="section"><div class="shell"><div class="intro-grid reveal"><div><p class="eyebrow">${text(data.introEyebrow)}</p><h2 class="section-heading">${raw(data.introTitle)}</h2></div><p class="section-lead">${text(data.introLead)}</p></div>`;
}

function pulsePage(locale) {
  const c = translations[locale]; const p = c.pulse;
  const j = journeyCopy(locale);
  return `${genericHero(locale, 'pulse', p)}
  <section class="section pulse-entry" id="start-pulse"><div class="shell"><div class="pulse-entry-grid">
    <figure class="pulse-portrait reveal"><img src="/assets/images/pulse-profile-v1.webp" alt="${text(j.profileImageAlt)}" width="1200" height="1200" loading="lazy" decoding="async"></figure>
    <div class="pulse-entry-copy reveal">
      <p class="eyebrow">${text(j.profileEyebrow)}</p>
      <h2 class="section-heading">${raw(j.profileTitle)}</h2>
      <p class="section-lead">${text(j.profileLead)}</p>
      <ol class="pulse-entry-steps">${j.steps.slice(0, 3).map(([number, title, body]) => `<li><span>${text(number)}</span><div><strong>${text(title)}</strong><p>${text(body)}</p></div></li>`).join('')}</ol>
      <a class="button" href="#mobility-check">${text(j.profileCta)} <span aria-hidden="true">↗</span></a>
      <p class="pulse-entry-note">${text(j.profileNote)}</p>
    </div>
    <aside class="pulse-dashboard reveal" id="pulse-home" aria-label="KŌMØ Pulse profile preview">
      <div class="pulse-dashboard-head"><span>KŌMØ Pulse</span><span class="pulse-live">●</span></div>
      <div class="pulse-dashboard-profile"><span class="pulse-avatar">K</span><div><small>${text(j.profileEyebrow)}</small><strong>${text(j.primaryCta)}</strong></div></div>
      <div class="pulse-dashboard-list">${j.profileRows.map(([label, value], index) => `<div><span>${text(label)}</span><strong class="${index === 0 ? 'is-warm' : ''}">${text(value)}</strong></div>`).join('')}</div>
      <div class="pulse-dashboard-next"><span>01</span><p>${text(j.steps[0][1])}</p></div>
    </aside>
  </div></div></section>
  <section class="section-tight"><div class="shell"><div class="entry-cards">${p.sections.map(([eyebrow, title, body]) => `<article class="entry-card reveal"><span class="entry-orb" aria-hidden="true"></span><p class="eyebrow">${text(eyebrow)}</p><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}</div></div></section>
  <section class="section" id="mobility-check"><div class="shell"><div class="intro-grid reveal"><div><p class="eyebrow">${text(p.methodEyebrow)}</p><h2 class="section-heading">${raw(p.methodTitle)}</h2></div><p class="section-lead">${text(p.methodLead)}</p></div><div class="steps reveal">${p.methodSteps.map(([n, t, b]) => `<article class="step"><span class="step-num">${text(n)}</span><h3>${text(t)}</h3><p>${text(b)}</p></article>`).join('')}</div><div class="article-callout reveal"><strong>${text(c.global.medicalNotice.split('.')[0])}</strong>${text(c.global.medicalNotice)}</div></div></section>
  <section class="section-tight" style="background:var(--paper-strong)"><div class="shell"><p class="eyebrow">${text(p.compareEyebrow)}</p><h2 class="section-heading reveal">${raw(p.compareTitle)}</h2><div class="comparison reveal"><table><thead><tr>${p.compareHead.map((col) => `<th>${text(col)}</th>`).join('')}</tr></thead><tbody>${p.compareRows.map((row) => `<tr>${row.map((item) => `<td>${text(item)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div></section>
  ${finalBand(locale, p.finalTitle, p.finalText, j.primaryCta)}`;
}

function clinicalPage(locale) {
  const c = translations[locale]; const p = c.clinical;
  const j = journeyCopy(locale);
  return `${genericHero(locale, 'clinical', p)}
  <section class="section-tight clinical-visual-section"><div class="shell clinical-visual-grid">
    <figure class="clinical-image reveal"><img src="/assets/images/clinical-pathway-v1.webp" alt="${text(j.clinicalImageAlt)}" width="1536" height="1024" loading="lazy" decoding="async"></figure>
    <div class="clinical-visual-copy reveal"><p class="eyebrow">${text(j.clinicalEyebrow)}</p><h2 class="section-heading">${raw(j.clinicalTitle)}</h2><p class="section-lead">${text(j.clinicalLead)}</p><a class="button" href="${scoreLink(locale)}">${text(j.primaryCta)} <span aria-hidden="true">↗</span></a></div>
  </div></section>
  ${introBlock(p)}<div class="steps reveal">${p.steps.map(([n,t,b]) => `<article class="step"><span class="step-num">${text(n)}</span><h3>${text(t)}</h3><p>${text(b)}</p></article>`).join('')}</div></div></section>
  <section class="section-tight" style="background:var(--paper-strong)"><div class="shell"><div class="intro-grid reveal"><div><p class="eyebrow">${text(p.contextsEyebrow)}</p><h2 class="section-heading">${raw(p.contextsTitle)}</h2></div></div><div class="article-grid">${p.contexts.map(([title, body]) => `<article class="article-card reveal"><span class="tag">KŌMØ Clinical</span><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}</div></div></section>${finalBand(locale, p.finalTitle, p.finalText, p.cta, 'contact')}`;
}

function partnersPage(locale) {
  const p = partnerContent(locale);
  return `${genericHero(locale, 'partners', p)}${introBlock(p)}<div class="entry-cards">${p.cards.map(([title, body], i) => `<article class="entry-card reveal"><span class="entry-orb" aria-hidden="true"></span><p class="eyebrow">0${i + 1}</p><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}</div></div></section>
  ${partnerOfferSection(locale)}
  ${partnerNetworkSection(locale)}
  ${finalBand(locale, p.finalTitle, p.finalText, p.cta, 'contact')}`;
}

function retreatsPage(locale) {
  const p = partnerContent(locale).hospitality;
  return `${genericHero(locale, 'motion-retreats', p)}${introBlock(p)}<div class="steps reveal">${p.rhythm.map(([n, t, b], i) => `<article class="step"><span class="step-num">0${i + 1}</span><h3>${text(t)}</h3><p><strong>${text(n)}</strong><br>${text(b)}</p></article>`).join('')}</div></div></section>
  <section class="section-tight" style="background:var(--paper-strong)"><div class="shell"><p class="eyebrow">${text(p.eyebrow)}</p><h2 class="section-heading reveal">${raw(p.introTitle)}</h2><div class="entry-cards">${p.operatorCards.map(([title, body], i) => `<article class="entry-card reveal"><span class="entry-orb" aria-hidden="true"></span><p class="eyebrow">0${i + 1}</p><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}</div></div></section>${finalBand(locale, p.finalTitle, p.finalText, p.cta, 'partners')}`;
}

function libraryPage(locale) {
  const c = translations[locale]; const p = c.library;
  return `${genericHero(locale, 'library', p)}${introBlock(p)}<div class="article-callout reveal"><strong>KŌMØ Library</strong>${text(c.global.medicalNotice)}</div></div></section>
  <section class="section-tight" id="articles" style="background:var(--paper-strong)"><div class="shell"><div class="article-grid">${p.articles.map(([tag,title,body], index) => `<article class="article-card reveal"><span class="tag">${text(tag)}</span><h3>${text(title)}</h3><p>${text(body)}</p><a class="text-link" href="${index === 1 ? pagePath(locale, 'locomotor') : article(locale)}">${text(c.global.readMore)}</a></article>`).join('')}</div></div></section>${finalBand(locale,p.finalTitle,p.finalText,p.cta,'pulse')}`;
}

function locomotorPage(locale) {
  const p = locomotorCopy[locale] || locomotorCopy.en;
  const citation = (...indexes) => `<span class="inline-citations" aria-label="Sources">${indexes.map((index) => `<a href="#ref-${index}">[${index}]</a>`).join('')}</span>`;
  return `
  <section class="locomotor-hero">
    <div class="shell">
      <p class="breadcrumb locomotor-breadcrumb"><a href="${pagePath(locale)}">KŌMØ</a><span>/</span><a href="${pagePath(locale, 'library')}">Library</a><span>/</span><span>Locomotor</span></p>
      <div class="locomotor-hero-grid">
        <div class="locomotor-hero-copy">
          <p class="eyebrow eyebrow-light reveal">${text(p.eyebrow)}</p>
          <h1 class="display reveal">${raw(p.title)}</h1>
          <p class="lede reveal">${text(p.lead)} ${citation('01', '02')}</p>
          <div class="hero-actions reveal"><a class="button button-light" href="#framework">${text(p.heroPrimary)}</a><a class="button button-ghost-light" href="${scoreLink(locale)}">${text(p.heroSecondary)} <span aria-hidden="true">↗</span></a></div>
          <p class="locomotor-review-note reveal">${text(p.note)}</p>
        </div>
        <aside class="locomotor-signal-card reveal" aria-label="${text(p.heroCard.label)}">
          <div class="locomotor-card-head"><span>${text(p.heroCard.label)}</span><span>JOA · 2020</span></div>
          <h2>${raw(p.heroCard.title)}</h2>
          <ol>${p.heroCard.rows.map(([number, title, body]) => `<li><span>${text(number)}</span><div><strong>${text(title)}</strong><small>${text(body)}</small></div></li>`).join('')}</ol>
          <p>${text(p.heroCard.foot)}</p>
        </aside>
      </div>
    </div>
  </section>

  <nav class="locomotor-jump" aria-label="${text(p.jumpLabel)}"><div class="shell"><strong>${text(p.jumpLabel)}</strong><div>${p.jumps.map(([href, label]) => `<a href="${href}">${text(label)}</a>`).join('')}</div></div></nav>

  <section class="section locomotor-definition" id="definition">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.definition.eyebrow)}</p><h2 class="section-heading">${raw(p.definition.title)}</h2></div><p class="section-lead">${text(p.definition.lead)} ${citation('01', '02')}</p></div>
      <div class="locomotor-concept-grid">
        <article class="locomotor-concept reveal"><span>01</span><h3>${text(p.definition.originTitle)}</h3><p>${text(p.definition.originBody)}</p></article>
        <article class="locomotor-concept reveal"><span>02</span><h3>${text(p.definition.systemTitle)}</h3><p>${text(p.definition.systemBody)}</p></article>
      </div>
      <div class="locomotor-system-grid">${p.definition.components.map(([title, body], index) => `<article class="locomotor-system-card reveal"><span>0${index + 1}</span><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}</div>
      <aside class="locomotor-not reveal"><div><p class="eyebrow">BOUNDARIES</p><h3>${text(p.definition.notTitle)}</h3></div><ul>${p.definition.notItems.map((item) => `<li>${text(item)}</li>`).join('')}</ul></aside>
    </div>
  </section>

  <section class="section locomotor-framework" id="framework">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.framework.eyebrow)}</p><h2 class="section-heading">${raw(p.framework.title)}</h2></div><p class="section-lead">${text(p.framework.lead)} ${citation('01', '04')}</p></div>
      <div class="locomotor-stage-grid">${p.framework.stageCards.map(([number, title, body, action]) => `<article class="locomotor-stage reveal" data-stage="${text(number)}"><span class="locomotor-stage-number">${text(number)}</span><h3>${text(title)}</h3><p>${text(body)}</p><small>${text(action)}</small></article>`).join('')}</div>
      <div class="locomotor-table-wrap reveal">
        <table class="locomotor-table">
          <caption>${text(p.framework.tableCaption)}</caption>
          <thead><tr>${p.framework.headers.map((header) => `<th scope="col">${text(header)}</th>`).join('')}</tr></thead>
          <tbody>${p.framework.rows.map((row) => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${text(cell)}</th>` : `<td>${text(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="locomotor-formula reveal">${text(p.framework.formula)}</p>
      <div class="locomotor-evidence-note reveal"><strong>${text(p.framework.caveatTitle)}</strong><p>${text(p.framework.caveatBody)}</p></div>
    </div>
  </section>

  <section class="section" id="tests">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.tests.eyebrow)}</p><h2 class="section-heading">${raw(p.tests.title)}</h2></div><p class="section-lead">${text(p.tests.lead)} ${citation('01', '03')}</p></div>
      <div class="locomotor-test-grid">${p.tests.cards.map((card) => `<article class="locomotor-test reveal"><div class="locomotor-test-head"><span>${text(card.number)}</span><small>${text(card.purpose)}</small></div><h3>${text(card.title)}</h3><p>${text(card.body)}</p><dl><div><dt>${text(p.tests.methodLabel)}</dt><dd>${text(card.detail)}</dd></div><div><dt>${text(p.tests.safetyLabel)}</dt><dd>${text(card.safety)}</dd></div></dl></article>`).join('')}</div>
      <div class="locomotor-test-actions reveal"><a class="text-link" href="https://locomo-joa.jp/en" target="_blank" rel="noreferrer">${text(p.tests.sourceCta)} <span aria-hidden="true">↗</span></a></div>
      <aside class="locomotor-safety reveal"><span aria-hidden="true">!</span><div><h3>${text(p.tests.safetyTitle)}</h3><p>${text(p.tests.safetyBody)}</p></div></aside>
    </div>
  </section>

  <section class="section-tight locomotor-distinction">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.distinctions.eyebrow)}</p><h2 class="section-heading">${raw(p.distinctions.title)}</h2></div><p class="section-lead">${text(p.distinctions.lead)} ${citation('05')}</p></div>
      <div class="locomotor-table-wrap reveal"><table class="locomotor-table locomotor-compare"><thead><tr>${p.distinctions.headers.map((header) => `<th scope="col">${text(header)}</th>`).join('')}</tr></thead><tbody>${p.distinctions.rows.map((row) => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${text(cell)}</th>` : `<td>${text(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="locomotor-table-foot reveal">${text(p.distinctions.foot)}</p>
    </div>
  </section>

  <section class="section locomotor-action" id="action">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.action.eyebrow)}</p><h2 class="section-heading">${raw(p.action.title)}</h2></div><p class="section-lead">${text(p.action.lead)}</p></div>
      <ol class="locomotor-action-grid">${p.action.steps.map(([number, title, body]) => `<li class="reveal"><span>${text(number)}</span><div><h3>${text(title)}</h3><p>${text(body)}</p></div></li>`).join('')}</ol>
      <div class="locomotor-training reveal">
        <div class="locomotor-training-intro"><p class="eyebrow">${text(p.action.trainingEyebrow)}</p><h3>${raw(p.action.trainingTitle)}</h3><p>${text(p.action.trainingLead)} ${citation('01')}</p></div>
        <div class="locomotor-training-grid">${p.action.trainingCards.map(([number, title, body, target]) => `<article><span>${text(number)}</span><h4>${text(title)}</h4><p>${text(body)}</p><small>${text(target)}</small></article>`).join('')}</div>
      </div>
      <div class="locomotor-evidence-note reveal"><strong>${text(p.action.evidenceTitle)} ${citation('07')}</strong><p>${text(p.action.evidenceBody)}</p></div>
      <aside class="locomotor-urgent reveal"><h3>${text(p.action.urgentTitle)}</h3><ul>${p.action.urgentItems.map((item) => `<li>${text(item)}</li>`).join('')}</ul></aside>
    </div>
  </section>

  <section class="section locomotor-evidence" id="evidence">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.evidence.eyebrow)}</p><h2 class="section-heading">${raw(p.evidence.title)}</h2></div><p class="section-lead">${text(p.evidence.lead)}</p></div>
      <div class="locomotor-evidence-grid">${p.evidence.cards.map(([value, title, body], index) => `<article class="reveal"><span>${text(value)}</span><h3>${text(title)}</h3><p>${text(body)} ${index === 0 ? citation('02') : index === 1 ? citation('01') : index === 2 ? citation('04') : citation('08')}</p></article>`).join('')}</div>
      <div class="locomotor-context-grid"><article class="reveal"><span>COHORT</span><h3>${text(p.evidence.prevalenceTitle)}</h3><p>${text(p.evidence.prevalenceBody)} ${citation('04')}</p></article><article class="reveal"><span>AGE</span><h3>${text(p.evidence.youngerTitle)}</h3><p>${text(p.evidence.youngerBody)} ${citation('06')}</p></article></div>
      <div class="locomotor-status reveal">${p.evidence.status.map(([label, body], index) => `<div data-level="${index + 1}"><strong>${text(label)}</strong><p>${text(body)}</p></div>`).join('')}</div>
    </div>
  </section>

  <section class="locomotor-komo" id="komo-layer">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow eyebrow-light">${text(p.komo.eyebrow)}</p><h2 class="section-heading">${raw(p.komo.title)}</h2></div><p class="section-lead">${text(p.komo.lead)}</p></div>
      <div class="locomotor-komo-grid">${p.komo.additions.map(([title, body], index) => `<article class="reveal"><span>0${index + 1}</span><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}</div>
      <div class="locomotor-komo-status reveal"><strong>${text(p.komo.statusTitle)}</strong><p>${text(p.komo.statusBody)}</p><a class="button button-light" href="${pagePath(locale, 'clinical')}">${text(p.komo.cta)} <span aria-hidden="true">↗</span></a></div>
    </div>
  </section>

  <section class="section locomotor-faq">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.faq.eyebrow)}</p><h2 class="section-heading">${raw(p.faq.title)}</h2></div></div>
      <div class="locomotor-faq-list">${p.faq.items.map(([question, answer], index) => `<details class="reveal" ${index === 0 ? 'open' : ''}><summary><span>0${index + 1}</span>${text(question)}</summary><p>${text(answer)}</p></details>`).join('')}</div>
    </div>
  </section>

  <section class="section-tight locomotor-references">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.references.eyebrow)}</p><h2 class="section-heading">${raw(p.references.title)}</h2></div><p class="section-lead">${text(p.references.lead)}</p></div>
      <ol>${locomotorReferences.map((reference) => `<li class="reveal" id="ref-${text(reference.index)}"><span>${text(reference.index)}</span><p>${text(reference.citation)}</p><a href="${text(reference.url)}" target="_blank" rel="noreferrer" aria-label="${text(p.references.link)} ${text(reference.index)}">${text(p.references.link)} ↗</a></li>`).join('')}</ol>
    </div>
  </section>

  <section class="quote-band locomotor-final"><div class="shell"><blockquote class="reveal">${raw(p.finalTitle)}</blockquote><p class="section-lead">${text(p.finalText)}</p><div class="hero-actions"><a class="button button-light" href="${scoreLink(locale)}">${text(p.finalCta)} <span aria-hidden="true">↗</span></a></div></div></section>`;
}

function circlePage(locale) {
  const p = translations[locale].circle;
  return `${genericHero(locale, 'circle', p)}${introBlock(p)}<div class="entry-cards">${p.cards.map(([title,body],i) => `<article class="entry-card reveal"><span class="entry-orb" aria-hidden="true"></span><p class="eyebrow">0${i+1}</p><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}</div></div></section>${finalBand(locale,p.finalTitle,p.finalText,p.cta,'contact')}`;
}

function sciencePage(locale) {
  const p = translations[locale].science;
  return `${genericHero(locale, 'science', p)}${introBlock(p)}<div class="article-callout reveal"><strong>Dr Renan Chapon</strong>${text(p.underEgide)}</div><div class="steps reveal">${p.steps.map(([n,t,b]) => `<article class="step"><span class="step-num">${text(n)}</span><h3>${text(t)}</h3><p>${text(b)}</p></article>`).join('')}</div></div></section>${finalBand(locale,p.finalTitle,p.finalText,p.cta,'contact')}`;
}

function contactPage(locale) {
  const c = translations[locale]; const p = c.contact; const f = p.fields;
  return `${genericHero(locale,'contact',p)}<section class="section" id="contact-form"><div class="shell"><div class="contact-panel reveal"><div class="contact-aside"><p class="eyebrow eyebrow-light">KŌMØ</p><h2>${raw(p.asideTitle)}</h2><p>${text(p.asideText)}</p><a class="contact-mail" href="mailto:${text(p.direct)}">${text(p.direct)}</a></div><div class="contact-form"><h2>${text(p.formTitle)}</h2><p class="muted">${text(p.formLead)}</p><form data-contact-form><div class="field"><label for="name">${text(f.name)}</label><input id="name" name="name" autocomplete="name" required></div><div class="field"><label for="email">${text(f.email)}</label><input id="email" name="email" type="email" autocomplete="email" required></div><div class="field"><label for="subject">${text(f.subject)}</label><input id="subject" name="subject" required></div><div class="field"><label for="message">${text(f.message)}</label><textarea id="message" name="message" required></textarea></div><label class="field" style="grid-template-columns:auto 1fr;align-items:start;gap:.6rem"><input type="checkbox" name="consent" required style="min-height:auto;width:auto;margin-top:.28rem"><span>${text(f.consent)}</span></label><button class="button" type="submit">${text(f.submit)}</button><p class="form-note">${text(c.global.medicalNotice)}</p></form></div></div></div></section>${finalBand(locale,p.finalTitle,p.finalText,p.cta,'contact')}`;
}

function finalBand(locale, title, body, cta, target = 'pulse') {
  return `<section class="quote-band"><div class="shell"><blockquote class="reveal">${raw(title)}</blockquote><p class="section-lead" style="color:rgba(255,255,255,.72)">${text(body)}</p><div class="hero-actions"><a class="button button-light" href="${link(locale, target)}" ${target.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''}>${text(cta)} <span aria-hidden="true">↗</span></a></div></div></section>`;
}

function renderPage(locale, page) {
  const c = translations[locale];
  const body = {
    index: homePage,
    check: checkPage,
    pulse: pulsePage,
    clinical: clinicalPage,
    partners: partnersPage,
    'motion-retreats': retreatsPage,
    library: libraryPage,
    locomotor: locomotorPage,
    circle: circlePage,
    science: sciencePage,
    contact: contactPage
  }[page](locale);
  const data = page === 'locomotor' ? (locomotorCopy[locale] || locomotorCopy.en) : page === 'check' ? checkCopy(locale) : page === 'index' ? c.home : page === 'partners' ? partnerContent(locale) : page === 'motion-retreats' ? partnerContent(locale).hospitality : c[page];
  return layout(locale, page, body, data);
}

function englishAliasRedirect(page = 'index') {
  const target = pagePath('en', page);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${canonical('en', page)}"><meta http-equiv="refresh" content="0;url=${target}"><title>KŌMØ</title><script>location.replace('${target}')</script></head><body><a href="${target}">Continue to KŌMØ</a></body></html>`;
}

function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#063c42"/><stop offset="1" stop-color="#62968b"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><circle cx="910" cy="158" r="244" fill="none" stroke="#c7d9d2" stroke-opacity=".45"/><circle cx="900" cy="360" r="115" fill="#d8ad79" fill-opacity=".8"/><text x="82" y="126" fill="#d8e6df" font-family="Arial, sans-serif" font-size="32" letter-spacing="8">KŌMØ</text><text x="80" y="315" fill="white" font-family="Georgia, serif" font-size="100">Life is</text><text x="80" y="415" fill="#d9ebe1" font-family="Georgia, serif" font-size="100" font-style="italic">movement.</text><text x="82" y="520" fill="#d8e6df" font-family="Arial, sans-serif" font-size="24" letter-spacing="4">LOCOMOTOR LONGEVITY NETWORK</text></svg>`;
}

function faviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#063c42"/><path d="M20 12v40M44 12v40M20 31h24" fill="none" stroke="#d8e6df" stroke-width="3"/><circle cx="32" cy="31" r="11" fill="none" stroke="#d8ad79" stroke-width="3"/></svg>`;
}

async function write(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value, 'utf8');
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(sourceAssets, join(output, 'assets'), { recursive: true });

for (const locale of site.locales) {
  for (const page of site.pages) {
    const path = locale === 'en'
      ? (page === 'index' ? join(output, 'index.html') : join(output, page, 'index.html'))
      : (page === 'index' ? join(output, locale, 'index.html') : join(output, locale, page, 'index.html'));
    await write(path, renderPage(locale, page));
  }
}

// Keep an `/en/` alias so early links still resolve, without creating duplicate content for search engines.
for (const page of site.pages) {
  const path = page === 'index' ? join(output, 'en', 'index.html') : join(output, 'en', page, 'index.html');
  await write(path, englishAliasRedirect(page));
}
await write(join(output, '404.html'), layout('en', 'index', `<section class="page-hero"><div class="shell"><p class="eyebrow eyebrow-light">404</p><h1 class="display">This page does not exist.<br><em>Let’s return to movement.</em></h1><div class="hero-actions"><a class="button button-light" href="/">Return to KŌMØ</a></div></div></section>`, {metaTitle: 'Page not found — KŌMØ', metaDescription: 'The requested page could not be found.'}));
await write(join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`);
const urls = [...new Set(site.locales.flatMap((locale) => site.pages.map((page) => canonical(locale, page))))];
await write(join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);
await write(join(output, 'assets', 'og-komo.svg'), ogSvg());
await write(join(output, 'assets', 'favicon.svg'), faviconSvg());

console.log(`Built ${site.locales.length * site.pages.length} pages in ${output}`);
