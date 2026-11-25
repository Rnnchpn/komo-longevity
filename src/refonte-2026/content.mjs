// KŌMØ Motion — contenus de la refonte (FR, EN, ES).
// Sources : protocole PULSE KOMO_MOTION 2.5.0 (14 étapes), offres validées (bilan 60 min 300 €,
// contrôle 45 min 120 €), lieux : Clinique HIRO (Beausoleil, Monaco) et Maison Epigenetic (Palm Beach, Cannes).
// Règles éditoriales : pas de diagnostic, pas de promesse, pas de score composite ni d'« âge » du mouvement.

export const ORIGIN = 'https://komolongevity.com';
export const EMAIL = 'contact@komolongevity.com';
export const PULSE_URL = 'https://pulse.komolongevity.com/';
export const PRICES = { bilan: 300, controle: 120 };
export const DURATIONS = { bilan: 60, controle: 45 };
export const MAPS_CANNES = 'https://www.google.com/maps/search/?api=1&query=Maison%20Epigenetic%2C%20Place%20Franklin%20Roosevelt%2C%2006400%20Cannes';

export const LANGS = ['fr', 'en', 'es'];
export const ROUTES = {
  fr: { home: '/fr/', book: '/fr/reserver/', monaco: '/fr/monaco/', cannes: '/fr/cannes/' },
  en: { home: '/en/', book: '/en/book/', monaco: '/en/monaco/', cannes: '/en/cannes/' },
  es: { home: '/es/', book: '/es/reservar/', monaco: '/es/monaco/', cannes: '/es/cannes/' }
};
export const LOCALE = { fr: 'fr_FR', en: 'en_GB', es: 'es_ES' };

const fr = {
  langName: 'Français',
  meta: {
    homeTitle: 'KŌMØ Motion — Bilan du mouvement à Monaco et à Cannes',
    homeDesc: 'Un bilan de 60 minutes sur plateformes de force et au dynamomètre : force, équilibre, puissance et marche. À la Clinique HIRO (Monaco) et à la Maison Epigenetic (Cannes). 300 €.',
    bookTitle: 'Réserver un bilan KŌMØ Motion — Monaco ou Cannes',
    bookDesc: 'Demandez votre créneau pour un bilan KŌMØ Motion (60 min, 300 €) ou un contrôle (45 min, 120 €), à Monaco ou à Cannes.',
    monacoTitle: 'Bilan KŌMØ Motion à Monaco — Clinique HIRO, Beausoleil',
    monacoDesc: 'Votre bilan du mouvement KŌMØ Motion à la Clinique HIRO, aux portes de Monaco : 14 mesures en 60 minutes, 300 €.',
    cannesTitle: 'Bilan KŌMØ Motion à Cannes — Maison Epigenetic, Palm Beach',
    cannesDesc: 'Votre bilan du mouvement KŌMØ Motion à la Maison Epigenetic, Palm Beach, Cannes : 14 mesures en 60 minutes, 300 €.'
  },
  skip: 'Aller au contenu',
  nav: { bilan: 'Le bilan', deroule: 'Déroulé', adresses: 'Adresses', tarifs: 'Tarifs', questions: 'Questions' },
  space: 'Mon espace',
  book: 'Réserver',
  menu: 'Menu',
  close: 'Fermer',
  hero: {
    title: 'Votre mouvement, mesuré.',
    lead: 'Un bilan de 60 minutes sur plateformes de force et au dynamomètre, pour connaître votre force, votre équilibre et votre marche. À Monaco et à Cannes.',
    cta: 'Réserver un bilan',
    more: 'Voir comment ça se passe',
    caption: 'Votre équilibre, tracé en direct : 30 secondes debout, yeux fermés, sur deux plateformes de force.',
    illus: 'Tracé d’illustration.',
    time: 'Temps', sway: 'Amplitude', speed: 'Vitesse',
    canvasLabel: 'Animation : tracé du centre de pression d’une personne debout, qui oscille légèrement.'
  },
  statement: 'Avec les années, la force, l’équilibre et la vitesse de marche baissent sans bruit. On s’en rend compte tard : un escalier plus lourd, un pas moins sûr. KŌMØ Motion les mesure tôt, et toujours de la même façon, pour suivre leur évolution.',
  photo: { alt: 'Une femme marche sur une terrasse face à la Méditerranée.', caption: 'Mesurer aujourd’hui, pour continuer à avancer.' },
  measures: {
    title: 'mesures, quatre capacités.',
    lead: 'Deux plateformes de force VALD ForceDecks et un dynamomètre VALD DynaMo, des instruments utilisés par des équipes sportives et des laboratoires de recherche.',
    foot: 'S’y ajoutent votre taille et votre poids, pour situer chaque résultat. Les valeurs affichées sont des exemples.',
    left: 'Gauche', right: 'Droite',
    panels: [
      { key: 'force', title: 'La force, côté par côté.',
        body: 'Assis, au dynamomètre : flexion et abduction de la hanche, extension et flexion du genou, flexion du coude. Chaque côté est mesuré, puis comparé à l’autre.',
        meta: 'Dynamomètre VALD DynaMo. Cinq mouvements, à gauche et à droite.' },
      { key: 'balance', title: 'L’équilibre, au millimètre.',
        body: 'Debout sur deux plateformes, yeux ouverts puis yeux fermés, pendant 30 secondes. Puis sur un pied, jusqu’à 30 secondes de chaque côté.',
        meta: 'Plateformes de force VALD ForceDecks. Quatre mesures.' },
      { key: 'power', title: 'La puissance des jambes.',
        body: 'Se lever d’une chaise et s’y rasseoir, puis sauter le plus haut possible : les plateformes enregistrent la force à chaque instant. Enfin, le nombre de levers de chaise en 30 secondes.',
        meta: 'Plateformes de force et chronomètre. Trois mesures.' },
      { key: 'gait', title: 'La marche, sur quatre mètres.',
        body: 'Départ arrêté, deux passages chronométrés. Votre vitesse de marche en mètres par seconde, l’un des repères les plus étudiés du vieillissement en bonne santé.',
        meta: 'Couloir balisé et chronomètre. Le meilleur des deux passages est retenu.' }
    ],
    force: [['Flexion de hanche', 212, 236], ['Abduction de hanche', 168, 174], ['Extension de genou', 301, 288], ['Flexion de genou', 154, 149], ['Flexion du coude', 142, 151]],
    forceUnit: 'N',
    eyesOpen: 'Yeux ouverts', eyesClosed: 'Yeux fermés', swayUnit: 'mm',
    curve: { force: 'Force', time: 'Temps', dip: 'Élan', push: 'Poussée', flight: 'Envol', land: 'Réception', height: 'Hauteur du saut', chairs: 'Levers en 30 s' },
    gaitUnit: 'm/s', gaitLabel: 'Vitesse de marche, meilleur passage', m: 'm'
  },
  timeline: {
    title: 'Une heure, en quatre temps.',
    lead: 'Un protocole identique à chaque séance, pour que chaque chiffre soit comparable au suivant.',
    scale: ['0', '10', '50', '60 min'],
    steps: [
      { t: 'Accueil', d: '10 min', b: 'Vos objectifs, votre contexte et quelques questions de sécurité. Vous donnez votre consentement.' },
      { t: 'Mesures', d: '40 min', b: 'La force assise d’abord, puis les plateformes, la marche et le lever de chaise. Chaque test peut être interrompu.' },
      { t: 'Restitution', d: '10 min', b: 'Nous lisons vos résultats ensemble et fixons trois priorités.' },
      { t: 'Ensuite', d: '6 et 12 sem.', b: 'Votre passeport arrive par e-mail, avec un programme de six semaines. Puis deux contrôles, pour mesurer l’évolution.' }
    ]
  },
  passport: {
    title: 'Des chiffres, pas des impressions.',
    body: 'Vous repartez avec votre passeport KŌMØ Motion, reçu par un lien personnel.',
    list: ['Chaque mesure avec son unité, à gauche et à droite.', 'Vos résultats situés par rapport à des repères publiés.', 'Trois priorités claires.', 'Un programme de six semaines.'],
    note: 'Le bilan décrit ce que vous réalisez le jour du test. Il ne pose pas de diagnostic.',
    card: {
      title: 'Passeport KŌMØ Motion', sub: 'Bilan initial, exemple',
      rows: [['Vitesse de marche', '', '1,24', 'm/s'], ['Levers de chaise en 30 s', '', '16', ''], ['Flexion de hanche, en N', 'G 212', '236', 'D'], ['Appui sur un pied, en s', 'G 30', '24', 'D'], ['Saut vertical', '', '27', 'cm']],
      prio: 'Vos priorités', prios: ['Force de la hanche gauche', 'Équilibre sur le pied droit', 'Endurance au lever de chaise'],
      fake: 'Données fictives', unitN: 'N', unitS: 's'
    }
  },
  trajectory: {
    title: 'Une mesure dit où vous en êtes. Trois disent où vous allez.',
    body: 'À 6 puis 12 semaines, nous refaisons exactement les mêmes tests, avec les mêmes appareils et dans les mêmes conditions. Un changement ne compte que s’il dépasse la marge d’erreur de la mesure. Ce qui progresse est conservé, ce qui stagne est ajusté.',
    points: ['Bilan', '6 semaines', '12 semaines'], metric: 'Levers de chaise en 30 s, exemple', band: 'Marge d’erreur de la mesure'
  },
  venues: {
    title: 'Deux adresses sur la Riviera.',
    lead: 'Le même protocole et les mêmes appareils dans les deux lieux.',
    note: 'KŌMØ réalise ses bilans en toute indépendance dans les lieux qui l’accueillent. Le lieu ne reçoit vos résultats qu’avec votre accord écrit.',
    nice: 'Nice', sea: 'Méditerranée',
    monaco: { city: 'Monaco', name: 'Clinique HIRO', place: 'Beausoleil, aux portes de Monaco.', detail: 'Adresse exacte et accès envoyés avec la confirmation.', cta: 'Réserver à Monaco', more: 'Le bilan à Monaco' },
    cannes: { city: 'Cannes', name: 'Maison Epigenetic', place: 'Palm Beach, place Franklin-Roosevelt, 06400 Cannes.', detail: 'Sur la pointe de la Croisette.', cta: 'Réserver à Cannes', more: 'Le bilan à Cannes', maps: 'Itinéraire' }
  },
  prices: {
    title: 'Deux tarifs. Rien d’autre.',
    items: [
      { key: 'bilan', name: 'Bilan KŌMØ Motion', dur: '60 minutes', what: 'Les 14 mesures, la restitution, votre passeport et votre programme de six semaines.' },
      { key: 'controle', name: 'Contrôle', dur: '45 minutes', what: 'Les mêmes mesures à 6 ou 12 semaines, votre évolution comparée et le programme ajusté.' }
    ],
    note: 'Même tarif à Monaco et à Cannes. Règlement sur place, le jour du bilan.',
    cta: 'Réserver un bilan'
  },
  founder: {
    title: 'Conçu par un neurochirurgien.',
    p1: 'Le Dr Renan Chapon a passé des années au bloc opératoire, auprès de patients dont la colonne, les nerfs ou l’équilibre ne tenaient plus. Une question ne l’a pas quitté : combien d’entre eux y seraient arrivés plus tard, ou pas du tout, si l’on avait mesuré plus tôt ?',
    p2: 'KŌMØ Motion est sa réponse : mesurer tôt, avec rigueur, et suivre dans le temps. Pour décider à partir de chiffres, avec le professionnel qui vous accompagne.',
    name: 'Dr Renan Chapon', role: 'Neurochirurgien du rachis, fondateur de KŌMØ'
  },
  faq: {
    title: 'Vos questions.',
    items: [
      ['Est-ce une consultation médicale ?', 'Non. KŌMØ Motion est un bilan fonctionnel du mouvement, réalisé selon un protocole conçu par un neurochirurgien. Il ne pose pas de diagnostic et ne remplace pas votre médecin, avec qui vous pouvez partager votre passeport.'],
      ['Faut-il être sportif ?', 'Non. Les tests reprennent des gestes du quotidien : se lever, tenir debout, marcher. Chaque test est adapté à vos capacités, et il peut être interrompu ou non réalisé si la sécurité l’exige.'],
      ['Comment m’habiller ?', 'Une tenue souple dans laquelle vous bougez facilement, et des chaussures plates. Prévoyez d’arriver cinq minutes en avance.'],
      ['Quand et comment payer ?', 'Sur place, le jour du bilan. Aucun paiement n’est demandé en ligne.'],
      ['Que deviennent mes données ?', 'Vos résultats sont conservés dans votre dossier KŌMØ PULSE ; dans les appareils de mesure, ils sont enregistrés sous un code. Le lieu qui vous accueille ne les reçoit qu’avec votre accord écrit. Pour y accéder, les corriger ou les faire effacer, écrivez à contact@komolongevity.com.'],
      ['Pourquoi revenir à 6 et 12 semaines ?', 'Parce qu’une seule mesure ne dit pas si quelque chose change. Refaire les mêmes tests, dans les mêmes conditions, montre ce qui progresse vraiment, au-delà de la marge d’erreur.'],
      ['Comment modifier ou annuler ?', 'Répondez simplement à l’e-mail de confirmation, ou écrivez à contact@komolongevity.com.']
    ]
  },
  final: { title: 'Commencez par un premier bilan.', lead: '60 minutes, 300 €, à Monaco ou à Cannes.' },
  footer: {
    tagline: 'Mesurer, comprendre et préserver le mouvement, tout au long de la vie.',
    colBilan: 'Le bilan', colPlaces: 'Adresses', colKomo: 'KŌMØ', colInfo: 'Informations',
    measures: 'Les mesures', timeline: 'Le déroulé', prices: 'Tarifs', book: 'Réserver',
    pulse: 'Mon espace PULSE', pros: 'Professionnels', contact: 'Contact',
    legal: 'Mentions légales', privacy: 'Confidentialité', cookies: 'Cookies', terms: 'Conditions d’utilisation', medical: 'Informations médicales', cgv: 'Conditions générales de vente',
    company: 'KŌMØ SAS, 45 boulevard de la Croisette, 06400 Cannes.',
    disclaimer: 'Le bilan KŌMØ Motion est un bilan fonctionnel. Il ne constitue pas un diagnostic médical.'
  },
  city: {
    monaco: { sub: 'Votre bilan KŌMØ Motion à la Clinique HIRO, à Beausoleil, aux portes de Monaco.', placeTitle: 'Le lieu',
      place: 'La Clinique HIRO accueille les bilans KŌMØ Motion sur rendez-vous. KŌMØ y réalise ses mesures en toute indépendance.',
      address: 'Adresse exacte et accès envoyés avec la confirmation.', crossQ: 'Plus près de Cannes ?', crossA: 'Le même bilan vous attend à la Maison Epigenetic, à Palm Beach.', crossLink: 'Voir Cannes' },
    cannes: { sub: 'Votre bilan KŌMØ Motion à la Maison Epigenetic, à Palm Beach, sur la pointe de la Croisette.', placeTitle: 'Le lieu',
      place: 'La Maison Epigenetic accueille les bilans KŌMØ Motion sur rendez-vous. KŌMØ y réalise ses mesures en toute indépendance.',
      address: 'Place Franklin-Roosevelt, 06400 Cannes.', crossQ: 'Plus près de Monaco ?', crossA: 'Le même bilan vous attend à la Clinique HIRO, à Beausoleil.', crossLink: 'Voir Monaco' },
    facts: [['60 min', 'pour le bilan complet'], ['14', 'mesures'], ['300 €', 'réglés sur place']],
    bilanTitle: 'Le bilan', bilan: 'Force, équilibre, puissance et marche : 14 mesures en 60 minutes, sur plateformes de force et au dynamomètre, puis la lecture de vos résultats.', bilanLink: 'Tout savoir sur le bilan',
    comeTitle: 'Pour venir', come: 'Une tenue souple et des chaussures plates. Arrivez cinq minutes en avance ; le reste est sur place.',
    titleSr: 'Bilan KŌMØ Motion à'
  },
  booking: {
    title: 'Réserver votre bilan.',
    lead: 'Choisissez un lieu, une prestation et vos disponibilités. Nous vous répondons pour confirmer le créneau.',
    s1: 'Le lieu', s2: 'La prestation', s3: 'Vos disponibilités', s4: 'Vos coordonnées',
    monaco: ['Monaco', 'Clinique HIRO, Beausoleil'], cannes: ['Cannes', 'Maison Epigenetic, Palm Beach'],
    bilan: ['Bilan KŌMØ Motion', '60 minutes, premier bilan complet'], controle: ['Contrôle', '45 minutes, après un premier bilan'],
    date1: 'Date souhaitée', date2: 'Autre date possible', optional: '(facultatif)', slot: 'Moment de la journée',
    slots: ['Indifférent', 'Matin', 'Après-midi', 'Fin de journée'],
    first: 'Prénom', last: 'Nom', email: 'E-mail', phone: 'Téléphone',
    consent: 'Je comprends que cette demande ne réserve pas encore le créneau, et je n’y indique aucune information médicale.',
    submit: 'Envoyer ma demande',
    help: 'Votre messagerie s’ouvre avec la demande déjà rédigée : il vous suffit de l’envoyer.',
    summary: 'Votre demande', place: 'Lieu', service: 'Prestation', duration: 'Durée', price: 'Tarif', toChoose: 'À choisir',
    payNote: 'Règlement sur place, le jour du bilan. Aucun paiement en ligne.',
    errors: { place: 'Choisissez un lieu.', service: 'Choisissez une prestation.', date: 'Indiquez une date à partir d’aujourd’hui.', date2: 'Indiquez une date à partir d’aujourd’hui, ou laissez ce champ vide.', first: 'Indiquez votre prénom.', last: 'Indiquez votre nom.', email: 'Indiquez une adresse e-mail valide, par exemple nom@domaine.fr.', consent: 'Cochez cette case pour envoyer votre demande.' },
    doneTitle: 'Il ne reste qu’à envoyer l’e-mail.',
    doneBody: 'Votre messagerie s’est ouverte avec votre demande, adressée à contact@komolongevity.com. Envoyez-la : nous vous répondons pour confirmer le créneau.',
    doneOpen: 'Ouvrir l’e-mail', doneCopy: 'Copier la demande', doneCopied: 'Demande copiée', doneEdit: 'Modifier la demande',
    doneHelp: 'Votre messagerie ne s’est pas ouverte ? Copiez la demande et envoyez-la à contact@komolongevity.com.',
    mail: {
      subject: 'Demande de rendez-vous KŌMØ Motion : {service}, {place}',
      hello: 'Bonjour,', intro: 'Je souhaite réserver un créneau.',
      place: 'Lieu', service: 'Prestation', date1: 'Date souhaitée', date2: 'Autre date', slot: 'Moment', name: 'Nom', email: 'E-mail', phone: 'Téléphone',
      none: 'Non précisé', outro: 'Merci de me confirmer la disponibilité.', bye: 'Bien cordialement,'
    },
    dateLocale: 'fr-FR'
  }
};

const en = {
  langName: 'English',
  meta: {
    homeTitle: 'KŌMØ Motion — Movement assessment in Monaco and Cannes',
    homeDesc: 'A 60-minute assessment on force platforms and a dynamometer: strength, balance, power and gait. At Clinique HIRO (Monaco) and Maison Epigenetic (Cannes). €300.',
    bookTitle: 'Book a KŌMØ Motion assessment — Monaco or Cannes',
    bookDesc: 'Request a slot for a KŌMØ Motion assessment (60 min, €300) or a follow-up (45 min, €120), in Monaco or Cannes.',
    monacoTitle: 'KŌMØ Motion assessment in Monaco — Clinique HIRO, Beausoleil',
    monacoDesc: 'Your KŌMØ Motion movement assessment at Clinique HIRO, on the doorstep of Monaco: 14 measurements in 60 minutes, €300.',
    cannesTitle: 'KŌMØ Motion assessment in Cannes — Maison Epigenetic, Palm Beach',
    cannesDesc: 'Your KŌMØ Motion movement assessment at Maison Epigenetic, Palm Beach, Cannes: 14 measurements in 60 minutes, €300.'
  },
  skip: 'Skip to content',
  nav: { bilan: 'The assessment', deroule: 'How it works', adresses: 'Locations', tarifs: 'Prices', questions: 'Questions' },
  space: 'My account',
  book: 'Book',
  menu: 'Menu',
  close: 'Close',
  hero: {
    title: 'Your movement, measured.',
    lead: 'A 60-minute assessment on force platforms and a dynamometer, to know your strength, your balance and your gait. In Monaco and Cannes.',
    cta: 'Book an assessment',
    more: 'See how it works',
    caption: 'Your balance, traced live: 30 seconds standing, eyes closed, on two force platforms.',
    illus: 'Illustrative trace.',
    time: 'Time', sway: 'Range', speed: 'Speed',
    canvasLabel: 'Animation: the centre-of-pressure trace of a person standing still, swaying slightly.'
  },
  statement: 'With the years, strength, balance and walking speed decline quietly. We notice late: a heavier flight of stairs, a less certain step. KŌMØ Motion measures them early, and always the same way, so you can follow how they change.',
  photo: { alt: 'A woman walks along a terrace overlooking the Mediterranean.', caption: 'Measure today, to keep moving forward.' },
  measures: {
    title: 'measurements, four capacities.',
    lead: 'Two VALD ForceDecks force platforms and a VALD DynaMo dynamometer: instruments used by sports teams and research laboratories.',
    foot: 'Plus your height and weight, to put every result in context. The values shown are examples.',
    left: 'Left', right: 'Right',
    panels: [
      { key: 'force', title: 'Strength, side by side.',
        body: 'Seated, with a dynamometer: hip flexion and abduction, knee extension and flexion, elbow flexion. Each side is measured, then compared with the other.',
        meta: 'VALD DynaMo dynamometer. Five movements, left and right.' },
      { key: 'balance', title: 'Balance, to the millimetre.',
        body: 'Standing on two platforms, eyes open then eyes closed, for 30 seconds. Then on one foot, for up to 30 seconds on each side.',
        meta: 'VALD ForceDecks force platforms. Four measurements.' },
      { key: 'power', title: 'Leg power.',
        body: 'Stand up from a chair and sit back down, then jump as high as you can: the platforms record force at every instant. Finally, the number of chair rises in 30 seconds.',
        meta: 'Force platforms and stopwatch. Three measurements.' },
      { key: 'gait', title: 'Walking, over four metres.',
        body: 'Standing start, two timed passes. Your walking speed in metres per second, one of the most studied markers of healthy ageing.',
        meta: 'Marked corridor and stopwatch. The better of the two passes is kept.' }
    ],
    force: [['Hip flexion', 212, 236], ['Hip abduction', 168, 174], ['Knee extension', 301, 288], ['Knee flexion', 154, 149], ['Elbow flexion', 142, 151]],
    forceUnit: 'N',
    eyesOpen: 'Eyes open', eyesClosed: 'Eyes closed', swayUnit: 'mm',
    curve: { force: 'Force', time: 'Time', dip: 'Dip', push: 'Push', flight: 'Flight', land: 'Landing', height: 'Jump height', chairs: 'Rises in 30 s' },
    gaitUnit: 'm/s', gaitLabel: 'Walking speed, best pass', m: 'm'
  },
  timeline: {
    title: 'One hour, in four steps.',
    lead: 'The same protocol at every session, so each figure can be compared with the next.',
    scale: ['0', '10', '50', '60 min'],
    steps: [
      { t: 'Welcome', d: '10 min', b: 'Your goals, your context and a few safety questions. You give your consent.' },
      { t: 'Measurements', d: '40 min', b: 'Seated strength first, then the platforms, walking and chair rises. Any test can be stopped.' },
      { t: 'Review', d: '10 min', b: 'We go through your results together and set three priorities.' },
      { t: 'Afterwards', d: '6 and 12 wks', b: 'Your passport arrives by email, with a six-week programme. Then two follow-ups, to measure the change.' }
    ]
  },
  passport: {
    title: 'Figures, not impressions.',
    body: 'You leave with your KŌMØ Motion passport, sent to you through a personal link.',
    list: ['Every measurement with its unit, left and right.', 'Your results placed against published reference values.', 'Three clear priorities.', 'A six-week programme.'],
    note: 'The assessment describes what you do on the day of the test. It does not make a diagnosis.',
    card: {
      title: 'KŌMØ Motion passport', sub: 'Initial assessment, example',
      rows: [['Walking speed', '', '1.24', 'm/s'], ['Chair rises in 30 s', '', '16', ''], ['Hip flexion, in N', 'L 212', '236', 'R'], ['Single-leg stance, in s', 'L 30', '24', 'R'], ['Vertical jump', '', '27', 'cm']],
      prio: 'Your priorities', prios: ['Left hip strength', 'Balance on the right foot', 'Chair-rise endurance'],
      fake: 'Fictitious data', unitN: 'N', unitS: 's'
    }
  },
  trajectory: {
    title: 'One measurement shows where you are. Three show where you are heading.',
    body: 'At 6 and then 12 weeks, we repeat exactly the same tests, with the same instruments and in the same conditions. A change only counts if it exceeds the measurement’s margin of error. What improves is kept; what stalls is adjusted.',
    points: ['Assessment', '6 weeks', '12 weeks'], metric: 'Chair rises in 30 s, example', band: 'Measurement margin of error'
  },
  venues: {
    title: 'Two addresses on the Riviera.',
    lead: 'The same protocol and the same instruments in both places.',
    note: 'KŌMØ carries out its assessments independently in the venues that host it. The venue only receives your results with your written consent.',
    nice: 'Nice', sea: 'Mediterranean',
    monaco: { city: 'Monaco', name: 'Clinique HIRO', place: 'Beausoleil, on the doorstep of Monaco.', detail: 'Exact address and directions sent with your confirmation.', cta: 'Book in Monaco', more: 'The assessment in Monaco' },
    cannes: { city: 'Cannes', name: 'Maison Epigenetic', place: 'Palm Beach, place Franklin-Roosevelt, 06400 Cannes.', detail: 'At the tip of the Croisette.', cta: 'Book in Cannes', more: 'The assessment in Cannes', maps: 'Directions' }
  },
  prices: {
    title: 'Two prices. Nothing else.',
    items: [
      { key: 'bilan', name: 'KŌMØ Motion assessment', dur: '60 minutes', what: 'All 14 measurements, the review, your passport and your six-week programme.' },
      { key: 'controle', name: 'Follow-up', dur: '45 minutes', what: 'The same measurements at 6 or 12 weeks, your progress compared and your programme adjusted.' }
    ],
    note: 'Same price in Monaco and Cannes. Paid on site, on the day.',
    cta: 'Book an assessment'
  },
  founder: {
    title: 'Designed by a neurosurgeon.',
    p1: 'Dr Renan Chapon spent years in the operating theatre, with patients whose spine, nerves or balance had given way. One question stayed with him: how many of them would have reached surgery later, or not at all, if someone had measured earlier?',
    p2: 'KŌMØ Motion is his answer: measure early, rigorously, and follow over time. So that decisions are made from figures, with the professional who looks after you.',
    name: 'Dr Renan Chapon', role: 'Spine neurosurgeon, founder of KŌMØ'
  },
  faq: {
    title: 'Your questions.',
    items: [
      ['Is this a medical consultation?', 'No. KŌMØ Motion is a functional movement assessment, carried out under a protocol designed by a neurosurgeon. It does not make a diagnosis and does not replace your doctor, with whom you can share your passport.'],
      ['Do I need to be sporty?', 'No. The tests use everyday movements: standing up, standing still, walking. Each test is adapted to you, and it can be stopped or skipped whenever safety requires.'],
      ['What should I wear?', 'Comfortable clothes you can move in easily, and flat shoes. Please arrive five minutes early.'],
      ['When and how do I pay?', 'On site, on the day of the assessment. No online payment is required.'],
      ['What happens to my data?', 'Your results are kept in your KŌMØ PULSE record; in the measuring devices they are stored under a code. The venue that hosts you only receives them with your written consent. To access, correct or delete them, write to contact@komolongevity.com.'],
      ['Why come back at 6 and 12 weeks?', 'Because a single measurement cannot tell whether something is changing. Repeating the same tests, in the same conditions, shows what is really improving, beyond the margin of error.'],
      ['How do I change or cancel?', 'Simply reply to the confirmation email, or write to contact@komolongevity.com.']
    ]
  },
  final: { title: 'Start with a first assessment.', lead: '60 minutes, €300, in Monaco or Cannes.' },
  footer: {
    tagline: 'Measuring, understanding and preserving movement, throughout life.',
    colBilan: 'The assessment', colPlaces: 'Locations', colKomo: 'KŌMØ', colInfo: 'Information',
    measures: 'Measurements', timeline: 'How it works', prices: 'Prices', book: 'Book',
    pulse: 'My PULSE account', pros: 'Professionals', contact: 'Contact',
    legal: 'Legal notice', privacy: 'Privacy', cookies: 'Cookies', terms: 'Terms of use', medical: 'Medical information', cgv: 'Terms of sale',
    company: 'KŌMØ SAS, 45 boulevard de la Croisette, 06400 Cannes, France.',
    disclaimer: 'The KŌMØ Motion assessment is a functional assessment. It is not a medical diagnosis.'
  },
  city: {
    monaco: { sub: 'Your KŌMØ Motion assessment at Clinique HIRO, in Beausoleil, on the doorstep of Monaco.', placeTitle: 'The venue',
      place: 'Clinique HIRO hosts KŌMØ Motion assessments by appointment. KŌMØ carries out its measurements there independently.',
      address: 'Exact address and directions sent with your confirmation.', crossQ: 'Closer to Cannes?', crossA: 'The same assessment is available at Maison Epigenetic, Palm Beach.', crossLink: 'See Cannes' },
    cannes: { sub: 'Your KŌMØ Motion assessment at Maison Epigenetic, Palm Beach, at the tip of the Croisette.', placeTitle: 'The venue',
      place: 'Maison Epigenetic hosts KŌMØ Motion assessments by appointment. KŌMØ carries out its measurements there independently.',
      address: 'Place Franklin-Roosevelt, 06400 Cannes.', crossQ: 'Closer to Monaco?', crossA: 'The same assessment is available at Clinique HIRO, Beausoleil.', crossLink: 'See Monaco' },
    facts: [['60 min', 'for the full assessment'], ['14', 'measurements'], ['€300', 'paid on site']],
    bilanTitle: 'The assessment', bilan: 'Strength, balance, power and gait: 14 measurements in 60 minutes, on force platforms and a dynamometer, followed by a review of your results.', bilanLink: 'All about the assessment',
    comeTitle: 'Before you come', come: 'Comfortable clothes and flat shoes. Arrive five minutes early; everything else is on site.',
    titleSr: 'KŌMØ Motion assessment in'
  },
  booking: {
    title: 'Book your assessment.',
    lead: 'Choose a location, a service and when you are available. We will reply to confirm your slot.',
    s1: 'Location', s2: 'Service', s3: 'Your availability', s4: 'Your details',
    monaco: ['Monaco', 'Clinique HIRO, Beausoleil'], cannes: ['Cannes', 'Maison Epigenetic, Palm Beach'],
    bilan: ['KŌMØ Motion assessment', '60 minutes, first full assessment'], controle: ['Follow-up', '45 minutes, after a first assessment'],
    date1: 'Preferred date', date2: 'Another possible date', optional: '(optional)', slot: 'Time of day',
    slots: ['Any time', 'Morning', 'Afternoon', 'Early evening'],
    first: 'First name', last: 'Last name', email: 'Email', phone: 'Phone',
    consent: 'I understand that this request does not yet book the slot, and I am not including any medical information.',
    submit: 'Send my request',
    help: 'Your email app opens with the request already written: just send it.',
    summary: 'Your request', place: 'Location', service: 'Service', duration: 'Duration', price: 'Price', toChoose: 'To choose',
    payNote: 'Paid on site, on the day. No online payment.',
    errors: { place: 'Choose a location.', service: 'Choose a service.', date: 'Enter a date from today onwards.', date2: 'Enter a date from today onwards, or leave this field empty.', first: 'Enter your first name.', last: 'Enter your last name.', email: 'Enter a valid email address, for example name@domain.com.', consent: 'Tick this box to send your request.' },
    doneTitle: 'All that is left is to send the email.',
    doneBody: 'Your email app has opened with your request, addressed to contact@komolongevity.com. Send it, and we will reply to confirm your slot.',
    doneOpen: 'Open the email', doneCopy: 'Copy the request', doneCopied: 'Request copied', doneEdit: 'Edit the request',
    doneHelp: 'Email app did not open? Copy the request and send it to contact@komolongevity.com.',
    mail: {
      subject: 'KŌMØ Motion appointment request: {service}, {place}',
      hello: 'Hello,', intro: 'I would like to book a slot.',
      place: 'Location', service: 'Service', date1: 'Preferred date', date2: 'Other date', slot: 'Time of day', name: 'Name', email: 'Email', phone: 'Phone',
      none: 'Not specified', outro: 'Please confirm availability.', bye: 'Kind regards,'
    },
    dateLocale: 'en-GB'
  }
};

const es = {
  langName: 'Español',
  meta: {
    homeTitle: 'KŌMØ Motion — Evaluación del movimiento en Mónaco y Cannes',
    homeDesc: 'Una evaluación de 60 minutos con plataformas de fuerza y dinamómetro: fuerza, equilibrio, potencia y marcha. En la Clinique HIRO (Mónaco) y en la Maison Epigenetic (Cannes). 300 €.',
    bookTitle: 'Reservar una evaluación KŌMØ Motion — Mónaco o Cannes',
    bookDesc: 'Solicita tu cita para una evaluación KŌMØ Motion (60 min, 300 €) o un control (45 min, 120 €), en Mónaco o en Cannes.',
    monacoTitle: 'Evaluación KŌMØ Motion en Mónaco — Clinique HIRO, Beausoleil',
    monacoDesc: 'Tu evaluación del movimiento KŌMØ Motion en la Clinique HIRO, a las puertas de Mónaco: 14 mediciones en 60 minutos, 300 €.',
    cannesTitle: 'Evaluación KŌMØ Motion en Cannes — Maison Epigenetic, Palm Beach',
    cannesDesc: 'Tu evaluación del movimiento KŌMØ Motion en la Maison Epigenetic, Palm Beach, Cannes: 14 mediciones en 60 minutos, 300 €.'
  },
  skip: 'Ir al contenido',
  nav: { bilan: 'La evaluación', deroule: 'Cómo funciona', adresses: 'Direcciones', tarifs: 'Precios', questions: 'Preguntas' },
  space: 'Mi espacio',
  book: 'Reservar',
  menu: 'Menú',
  close: 'Cerrar',
  hero: {
    title: 'Tu movimiento, medido.',
    lead: 'Una evaluación de 60 minutos con plataformas de fuerza y dinamómetro, para conocer tu fuerza, tu equilibrio y tu marcha. En Mónaco y en Cannes.',
    cta: 'Reservar una evaluación',
    more: 'Ver cómo funciona',
    caption: 'Tu equilibrio, trazado en directo: 30 segundos de pie, con los ojos cerrados, sobre dos plataformas de fuerza.',
    illus: 'Trazado ilustrativo.',
    time: 'Tiempo', sway: 'Amplitud', speed: 'Velocidad',
    canvasLabel: 'Animación: trazado del centro de presión de una persona de pie, que oscila ligeramente.'
  },
  statement: 'Con los años, la fuerza, el equilibrio y la velocidad de marcha disminuyen sin hacer ruido. Nos damos cuenta tarde: una escalera que pesa más, un paso menos seguro. KŌMØ Motion los mide pronto, y siempre de la misma manera, para seguir su evolución.',
  photo: { alt: 'Una mujer camina por una terraza frente al Mediterráneo.', caption: 'Medir hoy, para seguir avanzando.' },
  measures: {
    title: 'mediciones, cuatro capacidades.',
    lead: 'Dos plataformas de fuerza VALD ForceDecks y un dinamómetro VALD DynaMo, instrumentos que utilizan equipos deportivos y laboratorios de investigación.',
    foot: 'A ello se suman tu estatura y tu peso, para situar cada resultado. Los valores mostrados son ejemplos.',
    left: 'Izquierda', right: 'Derecha',
    panels: [
      { key: 'force', title: 'La fuerza, lado a lado.',
        body: 'Sentado, con el dinamómetro: flexión y abducción de cadera, extensión y flexión de rodilla, flexión del codo. Se mide cada lado y se compara con el otro.',
        meta: 'Dinamómetro VALD DynaMo. Cinco movimientos, izquierda y derecha.' },
      { key: 'balance', title: 'El equilibrio, al milímetro.',
        body: 'De pie sobre dos plataformas, con los ojos abiertos y luego cerrados, durante 30 segundos. Después sobre un pie, hasta 30 segundos de cada lado.',
        meta: 'Plataformas de fuerza VALD ForceDecks. Cuatro mediciones.' },
      { key: 'power', title: 'La potencia de las piernas.',
        body: 'Levantarse de una silla y volver a sentarse, y luego saltar lo más alto posible: las plataformas registran la fuerza en cada instante. Por último, el número de veces que te levantas de la silla en 30 segundos.',
        meta: 'Plataformas de fuerza y cronómetro. Tres mediciones.' },
      { key: 'gait', title: 'La marcha, en cuatro metros.',
        body: 'Salida parada, dos pasadas cronometradas. Tu velocidad de marcha en metros por segundo, uno de los indicadores más estudiados del envejecimiento saludable.',
        meta: 'Pasillo señalizado y cronómetro. Se conserva la mejor de las dos pasadas.' }
    ],
    force: [['Flexión de cadera', 212, 236], ['Abducción de cadera', 168, 174], ['Extensión de rodilla', 301, 288], ['Flexión de rodilla', 154, 149], ['Flexión del codo', 142, 151]],
    forceUnit: 'N',
    eyesOpen: 'Ojos abiertos', eyesClosed: 'Ojos cerrados', swayUnit: 'mm',
    curve: { force: 'Fuerza', time: 'Tiempo', dip: 'Impulso', push: 'Empuje', flight: 'Vuelo', land: 'Caída', height: 'Altura del salto', chairs: 'Levantadas en 30 s' },
    gaitUnit: 'm/s', gaitLabel: 'Velocidad de marcha, mejor pasada', m: 'm'
  },
  timeline: {
    title: 'Una hora, en cuatro tiempos.',
    lead: 'El mismo protocolo en cada sesión, para que cada cifra pueda compararse con la siguiente.',
    scale: ['0', '10', '50', '60 min'],
    steps: [
      { t: 'Bienvenida', d: '10 min', b: 'Tus objetivos, tu contexto y algunas preguntas de seguridad. Das tu consentimiento.' },
      { t: 'Mediciones', d: '40 min', b: 'Primero la fuerza sentado, después las plataformas, la marcha y la silla. Cualquier prueba puede interrumpirse.' },
      { t: 'Resultados', d: '10 min', b: 'Revisamos juntos tus resultados y fijamos tres prioridades.' },
      { t: 'Después', d: '6 y 12 sem.', b: 'Tu pasaporte llega por correo, con un programa de seis semanas. Después, dos controles para medir la evolución.' }
    ]
  },
  passport: {
    title: 'Cifras, no impresiones.',
    body: 'Te llevas tu pasaporte KŌMØ Motion, que recibes mediante un enlace personal.',
    list: ['Cada medición con su unidad, a la izquierda y a la derecha.', 'Tus resultados situados respecto a valores de referencia publicados.', 'Tres prioridades claras.', 'Un programa de seis semanas.'],
    note: 'La evaluación describe lo que realizas el día de la prueba. No establece ningún diagnóstico.',
    card: {
      title: 'Pasaporte KŌMØ Motion', sub: 'Evaluación inicial, ejemplo',
      rows: [['Velocidad de marcha', '', '1,24', 'm/s'], ['Levantadas de silla en 30 s', '', '16', ''], ['Flexión de cadera, en N', 'I 212', '236', 'D'], ['Apoyo sobre un pie, en s', 'I 30', '24', 'D'], ['Salto vertical', '', '27', 'cm']],
      prio: 'Tus prioridades', prios: ['Fuerza de la cadera izquierda', 'Equilibrio sobre el pie derecho', 'Resistencia al levantarse de la silla'],
      fake: 'Datos ficticios', unitN: 'N', unitS: 's'
    }
  },
  trajectory: {
    title: 'Una medición dice dónde estás. Tres dicen hacia dónde vas.',
    body: 'A las 6 y después a las 12 semanas, repetimos exactamente las mismas pruebas, con los mismos aparatos y en las mismas condiciones. Un cambio solo cuenta si supera el margen de error de la medición. Lo que mejora se mantiene; lo que se estanca se ajusta.',
    points: ['Evaluación', '6 semanas', '12 semanas'], metric: 'Levantadas de silla en 30 s, ejemplo', band: 'Margen de error de la medición'
  },
  venues: {
    title: 'Dos direcciones en la Riviera.',
    lead: 'El mismo protocolo y los mismos aparatos en los dos lugares.',
    note: 'KŌMØ realiza sus evaluaciones con total independencia en los lugares que la acogen. El lugar solo recibe tus resultados con tu consentimiento por escrito.',
    nice: 'Niza', sea: 'Mediterráneo',
    monaco: { city: 'Mónaco', name: 'Clinique HIRO', place: 'Beausoleil, a las puertas de Mónaco.', detail: 'Dirección exacta y acceso enviados con la confirmación.', cta: 'Reservar en Mónaco', more: 'La evaluación en Mónaco' },
    cannes: { city: 'Cannes', name: 'Maison Epigenetic', place: 'Palm Beach, place Franklin-Roosevelt, 06400 Cannes.', detail: 'En la punta de la Croisette.', cta: 'Reservar en Cannes', more: 'La evaluación en Cannes', maps: 'Cómo llegar' }
  },
  prices: {
    title: 'Dos precios. Nada más.',
    items: [
      { key: 'bilan', name: 'Evaluación KŌMØ Motion', dur: '60 minutos', what: 'Las 14 mediciones, la revisión, tu pasaporte y tu programa de seis semanas.' },
      { key: 'controle', name: 'Control', dur: '45 minutos', what: 'Las mismas mediciones a las 6 o 12 semanas, tu evolución comparada y el programa ajustado.' }
    ],
    note: 'Mismo precio en Mónaco y en Cannes. Pago en el lugar, el día de la evaluación.',
    cta: 'Reservar una evaluación'
  },
  founder: {
    title: 'Diseñado por un neurocirujano.',
    p1: 'El Dr. Renan Chapon pasó años en el quirófano, con pacientes cuya columna, nervios o equilibrio ya no resistían. Una pregunta no lo abandonó: ¿cuántos de ellos habrían llegado más tarde, o nunca, si alguien hubiera medido antes?',
    p2: 'KŌMØ Motion es su respuesta: medir pronto, con rigor, y hacer un seguimiento en el tiempo. Para decidir a partir de cifras, con el profesional que te acompaña.',
    name: 'Dr. Renan Chapon', role: 'Neurocirujano de columna, fundador de KŌMØ'
  },
  faq: {
    title: 'Tus preguntas.',
    items: [
      ['¿Es una consulta médica?', 'No. KŌMØ Motion es una evaluación funcional del movimiento, realizada según un protocolo diseñado por un neurocirujano. No establece diagnósticos ni sustituye a tu médico, con quien puedes compartir tu pasaporte.'],
      ['¿Hay que ser deportista?', 'No. Las pruebas retoman gestos cotidianos: levantarse, mantenerse de pie, caminar. Cada prueba se adapta a ti y puede interrumpirse u omitirse si la seguridad lo exige.'],
      ['¿Cómo debo vestirme?', 'Con ropa cómoda en la que te muevas con facilidad y calzado plano. Llega cinco minutos antes.'],
      ['¿Cuándo y cómo se paga?', 'En el lugar, el día de la evaluación. No se pide ningún pago en línea.'],
      ['¿Qué pasa con mis datos?', 'Tus resultados se conservan en tu expediente KŌMØ PULSE; en los aparatos de medición se registran bajo un código. El lugar que te acoge solo los recibe con tu consentimiento por escrito. Para consultarlos, corregirlos o borrarlos, escribe a contact@komolongevity.com.'],
      ['¿Por qué volver a las 6 y 12 semanas?', 'Porque una sola medición no dice si algo cambia. Repetir las mismas pruebas, en las mismas condiciones, muestra lo que mejora de verdad, más allá del margen de error.'],
      ['¿Cómo modificar o cancelar?', 'Responde al correo de confirmación o escribe a contact@komolongevity.com.']
    ]
  },
  final: { title: 'Empieza con una primera evaluación.', lead: '60 minutos, 300 €, en Mónaco o en Cannes.' },
  footer: {
    tagline: 'Medir, comprender y preservar el movimiento, a lo largo de la vida.',
    colBilan: 'La evaluación', colPlaces: 'Direcciones', colKomo: 'KŌMØ', colInfo: 'Información',
    measures: 'Las mediciones', timeline: 'Cómo funciona', prices: 'Precios', book: 'Reservar',
    pulse: 'Mi espacio PULSE', pros: 'Profesionales', contact: 'Contacto',
    legal: 'Aviso legal', privacy: 'Privacidad', cookies: 'Cookies', terms: 'Condiciones de uso', medical: 'Información médica', cgv: 'Condiciones de venta',
    company: 'KŌMØ SAS, 45 boulevard de la Croisette, 06400 Cannes, Francia.',
    disclaimer: 'La evaluación KŌMØ Motion es una evaluación funcional. No constituye un diagnóstico médico.'
  },
  city: {
    monaco: { sub: 'Tu evaluación KŌMØ Motion en la Clinique HIRO, en Beausoleil, a las puertas de Mónaco.', placeTitle: 'El lugar',
      place: 'La Clinique HIRO acoge las evaluaciones KŌMØ Motion con cita previa. KŌMØ realiza allí sus mediciones con total independencia.',
      address: 'Dirección exacta y acceso enviados con la confirmación.', crossQ: '¿Más cerca de Cannes?', crossA: 'La misma evaluación te espera en la Maison Epigenetic, en Palm Beach.', crossLink: 'Ver Cannes' },
    cannes: { sub: 'Tu evaluación KŌMØ Motion en la Maison Epigenetic, en Palm Beach, en la punta de la Croisette.', placeTitle: 'El lugar',
      place: 'La Maison Epigenetic acoge las evaluaciones KŌMØ Motion con cita previa. KŌMØ realiza allí sus mediciones con total independencia.',
      address: 'Place Franklin-Roosevelt, 06400 Cannes.', crossQ: '¿Más cerca de Mónaco?', crossA: 'La misma evaluación te espera en la Clinique HIRO, en Beausoleil.', crossLink: 'Ver Mónaco' },
    facts: [['60 min', 'para la evaluación completa'], ['14', 'mediciones'], ['300 €', 'pagados en el lugar']],
    bilanTitle: 'La evaluación', bilan: 'Fuerza, equilibrio, potencia y marcha: 14 mediciones en 60 minutos, con plataformas de fuerza y dinamómetro, y después la revisión de tus resultados.', bilanLink: 'Todo sobre la evaluación',
    comeTitle: 'Antes de venir', come: 'Ropa cómoda y calzado plano. Llega cinco minutos antes; todo lo demás está en el lugar.',
    titleSr: 'Evaluación KŌMØ Motion en'
  },
  booking: {
    title: 'Reserva tu evaluación.',
    lead: 'Elige un lugar, un servicio y tu disponibilidad. Te responderemos para confirmar la cita.',
    s1: 'El lugar', s2: 'El servicio', s3: 'Tu disponibilidad', s4: 'Tus datos',
    monaco: ['Mónaco', 'Clinique HIRO, Beausoleil'], cannes: ['Cannes', 'Maison Epigenetic, Palm Beach'],
    bilan: ['Evaluación KŌMØ Motion', '60 minutos, primera evaluación completa'], controle: ['Control', '45 minutos, tras una primera evaluación'],
    date1: 'Fecha deseada', date2: 'Otra fecha posible', optional: '(opcional)', slot: 'Momento del día',
    slots: ['Indiferente', 'Mañana', 'Tarde', 'Última hora de la tarde'],
    first: 'Nombre', last: 'Apellidos', email: 'Correo electrónico', phone: 'Teléfono',
    consent: 'Entiendo que esta solicitud todavía no reserva la cita y no incluyo ninguna información médica.',
    submit: 'Enviar mi solicitud',
    help: 'Tu aplicación de correo se abre con la solicitud ya redactada: solo tienes que enviarla.',
    summary: 'Tu solicitud', place: 'Lugar', service: 'Servicio', duration: 'Duración', price: 'Precio', toChoose: 'Por elegir',
    payNote: 'Pago en el lugar, el día de la evaluación. Sin pago en línea.',
    errors: { place: 'Elige un lugar.', service: 'Elige un servicio.', date: 'Indica una fecha a partir de hoy.', date2: 'Indica una fecha a partir de hoy o deja este campo vacío.', first: 'Indica tu nombre.', last: 'Indica tus apellidos.', email: 'Indica un correo válido, por ejemplo nombre@dominio.es.', consent: 'Marca esta casilla para enviar tu solicitud.' },
    doneTitle: 'Solo queda enviar el correo.',
    doneBody: 'Tu aplicación de correo se ha abierto con tu solicitud, dirigida a contact@komolongevity.com. Envíala y te responderemos para confirmar la cita.',
    doneOpen: 'Abrir el correo', doneCopy: 'Copiar la solicitud', doneCopied: 'Solicitud copiada', doneEdit: 'Modificar la solicitud',
    doneHelp: '¿No se ha abierto tu correo? Copia la solicitud y envíala a contact@komolongevity.com.',
    mail: {
      subject: 'Solicitud de cita KŌMØ Motion: {service}, {place}',
      hello: 'Hola:', intro: 'Me gustaría reservar una cita.',
      place: 'Lugar', service: 'Servicio', date1: 'Fecha deseada', date2: 'Otra fecha', slot: 'Momento', name: 'Nombre', email: 'Correo', phone: 'Teléfono',
      none: 'No indicado', outro: 'Gracias por confirmarme la disponibilidad.', bye: 'Un saludo,'
    },
    dateLocale: 'es-ES'
  }
};

// Typographie française : espaces insécables avant : ; ? ! € et entre un nombre et son unité.
function frTypo(value) {
  if (typeof value === 'string') {
    return value
      .replace(/ ([:])/g, ' $1')
      .replace(/ ([;?!])/g, ' $1')
      .replace(/(\d) (€|min|mm|cm|N|s|m\/s|semaines|minutes|mesures|secondes)\b/g, '$1 $2')
      .replace(/(\d) €/g, '$1 €');
  }
  if (Array.isArray(value)) return value.map(frTypo);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, frTypo(v)]));
  return value;
}
function numTypo(value) {
  // EN / ES : espace insécable entre un nombre et son unité.
  if (typeof value === 'string') return value.replace(/(\d) (€|min|mm|cm|N|s|m\/s|minutes|minutos|weeks|semanas|seconds|segundos)\b/g, '$1 $2').replace(/(\d) €/g, '$1 €');
  if (Array.isArray(value)) return value.map(numTypo);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, numTypo(v)]));
  return value;
}

export const T = { fr: frTypo(fr), en: numTypo(en), es: numTypo(es) };
