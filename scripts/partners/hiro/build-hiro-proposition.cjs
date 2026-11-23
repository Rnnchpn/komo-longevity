// Proposition de collaboration HIRO Monaco × KŌMØ Longevity (Word, A4).
// Version longue et chiffrée de la « proposition courte » ; les protocoles détaillés sont dans le document compagnon
// « Parcours mesurés · protocoles communs » (build-hiro-protocoles.mjs).
// Usage : NODE_PATH=<modules globaux> node scripts/partners/hiro/build-hiro-proposition.cjs <sortie.docx> <img_passeport.png> <img_trajectoire.png>
const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType,
  AlignmentType, HeadingLevel, LevelFormat, Footer, PageNumber, ImageRun, PageBreak, VerticalAlign, TableLayoutType
} = require('docx');

const [OUT, IMG1, IMG2] = process.argv.slice(2);
const INK = '1C342A', INK2 = '3F4A42', GOLD = '8A6D3F', GOLDL = 'B4925E', SAND = 'F5F1EA', LINE = 'E2D9CA', SAGE = 'E3EBE2', MUTED = '6B6F66', WHITE = 'FFFFFF';
const SERIF = 'Georgia', SANS = 'Arial';
const W = 9638; // largeur utile en DXA (A4, marges 2 cm)

// ── Briques ──
const run = (text, o = {}) => new TextRun({ text, font: o.serif ? SERIF : SANS, size: o.size || 21, bold: !!o.bold, italics: !!o.italic, color: o.color || INK2 });
const rich = (parts, o = {}) => parts.map(p => typeof p === 'string' ? run(p, o) : run(p[0], { ...o, ...p[1] }));
const P = (content, o = {}) => new Paragraph({
  children: Array.isArray(content) ? rich(content, o) : [run(content, o)],
  spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line ?? 300 },
  alignment: o.align, keepNext: !!o.keepNext, keepLines: true
});
const kicker = t => P(t, { size: 17, bold: true, color: GOLD, after: 100, keepNext: true });
const H1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: t })] });
const H2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t })] });
const bullet = (content, ref = 'bul') => new Paragraph({
  numbering: { reference: ref, level: 0 }, children: Array.isArray(content) ? rich(content) : [run(content)],
  spacing: { after: 80, line: 290 }, keepLines: true
});
const numbered = (ref, content) => bullet(content, ref);
const spacer = (after = 120) => new Paragraph({ children: [], spacing: { after } });
const pageBreak = () => new Paragraph({ children: [new PageBreak()] });

const none = { style: BorderStyle.NONE, size: 0, color: WHITE };
const noBorders = { top: none, bottom: none, left: none, right: none };
const thin = { style: BorderStyle.SINGLE, size: 4, color: LINE };
const cellMargins = { top: 90, bottom: 90, left: 120, right: 120 };

function cell(content, width, o = {}) {
  const paras = (Array.isArray(content) && content.length && content[0] instanceof Paragraph) ? content :
    [P(content, { size: o.size || 19, bold: o.bold, color: o.color, after: 0, line: 270, align: o.align, serif: o.serif })];
  return new TableCell({
    children: paras, width: { size: width, type: WidthType.DXA }, margins: o.margins || cellMargins,
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: 'auto' } : undefined,
    borders: o.borders || { top: none, left: none, right: none, bottom: thin }, verticalAlign: o.valign || VerticalAlign.TOP,
    columnSpan: o.span
  });
}
// Tableau à en-tête : rows = tableaux de chaînes ou de contenus riches.
function grid(head, rows, widths, o = {}) {
  const hdr = new TableRow({ tableHeader: true, cantSplit: true, children: head.map((h, i) => cell(h, widths[i], { bold: true, color: o.dark ? WHITE : INK, size: 18, fill: o.dark ? INK : undefined, borders: { top: none, left: none, right: none, bottom: { style: BorderStyle.SINGLE, size: 12, color: INK } } })) });
  const body = rows.map((r, ri) => new TableRow({ cantSplit: true, children: r.map((c, i) => cell(c, widths[i], { bold: i === 0 && o.firstBold !== false, color: i === 0 ? INK : INK2, fill: o.zebra && ri % 2 === 0 ? SAND : undefined })) }));
  return new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED, rows: [hdr, ...body] });
}
// Encadré : une cellule teintée, filet doré à gauche.
function callout(title, text, fill = SAND) {
  const children = [];
  if (title) children.push(P(title, { bold: true, color: INK, after: 60, size: 21 }));
  (Array.isArray(text) ? text : [text]).forEach((t, i, a) => children.push(P(t, { after: i === a.length - 1 ? 0 : 80, size: 20 })));
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W], layout: TableLayoutType.FIXED,
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({ children, width: { size: W, type: WidthType.DXA }, margins: { top: 160, bottom: 160, left: 240, right: 240 },
      shading: { fill, type: ShadingType.CLEAR, color: 'auto' }, borders: { top: none, bottom: none, right: none, left: { style: BorderStyle.SINGLE, size: 18, color: GOLDL } } })] })]
  });
}
// Rangée de chiffres clés (filet encre au-dessus de chaque colonne).
function facts(items) {
  const w = Math.floor(W / items.length);
  const widths = items.map((_, i) => i === items.length - 1 ? W - w * (items.length - 1) : w);
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: items.map(([big, small], i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA }, margins: { top: 100, bottom: 60, left: 0, right: 200 },
      borders: { top: { style: BorderStyle.SINGLE, size: 16, color: INK }, bottom: none, left: none, right: none },
      children: [P(big, { serif: true, size: 34, color: INK, after: 40, line: 240 }), P(small, { size: 17, color: MUTED, after: 0, line: 240 })]
    })) })]
  });
}
// Deux colonnes de texte (portes d'entrée, gains).
function columns(cols, fills) {
  const w = Math.floor(W / cols.length), widths = cols.map((_, i) => i === cols.length - 1 ? W - w * (cols.length - 1) : w);
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED,
    rows: [new TableRow({ cantSplit: true, children: cols.map((c, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA }, margins: { top: 180, bottom: 180, left: 220, right: 220 },
      shading: { fill: fills[i], type: ShadingType.CLEAR, color: 'auto' },
      borders: { top: none, bottom: none, left: i ? { style: BorderStyle.SINGLE, size: 24, color: WHITE } : none, right: none },
      children: c
    })) })]
  });
}
const img = (file, w, h) => new ImageRun({ type: 'png', data: fs.readFileSync(file), transformation: { width: w, height: h },
  altText: { title: 'Passeport KŌMØ Motion', description: 'Page d’un passeport d’exemple, patiente fictive', name: 'passeport' } });

// ── Contenu ──
const cover = [
  P('HIRO MONACO × KŌMØ LONGEVITY', { size: 18, bold: true, color: GOLD, after: 2600 }),
  P('Motion & Performance Lab', { serif: true, size: 64, color: INK, after: 120, line: 240 }),
  P('au sein de HIRO Monaco, par KŌMØ Longevity', { serif: true, size: 30, color: INK2, after: 360, line: 260 }),
  P('Measure Movement. Assess Performance. Establish Your Longevity Trajectory.', { size: 22, italic: true, color: GOLD, after: 900 }),
  P('Proposition de collaboration', { serif: true, size: 36, color: INK, after: 80 }),
  P('Pour les médecins fondateurs de HIRO Monaco · novembre 2026', { size: 20, color: MUTED, after: 1500 }),
  facts([['60 min', 'un bilan du mouvement : 14 mesures et la posture'], ['J0 · J30 · S6', 'un suivi mesuré des patients traités'], ['0 €', 'd’investissement en matériel pour HIRO'], ['12 semaines', 'de pilote, puis une décision commune']]),
  spacer(2400),
  P([['Dr Renan Chapon', { bold: true, color: INK }], ' · KŌMØ Longevity · contact@komolongevity.com'], { size: 19, after: 40 }),
  P('Document confidentiel, base de discussion. Les protocoles détaillés sont dans le document joint « Parcours mesurés · protocoles communs ».', { size: 17, color: MUTED }),
  pageBreak()
];

const brief = [
  kicker('En bref'), H1('Une offre complémentaire, construite avec vous'),
  P('Je souhaitais vous proposer une piste simple : permettre aux patients de HIRO qui le souhaitent de bénéficier, en complément de vos soins, d’un bilan du mouvement et de la performance fonctionnelle. Le Motion Lab accueillerait aussi des personnes qui veulent d’abord faire le point sur leurs capacités, puis échanger avec votre équipe si un parcours de soins leur paraît adapté.'),
  H2('Ce que je vous propose'),
  numbered('n1', [['Ouvrir un Motion Lab au sein de HIRO. ', { bold: true, color: INK }], 'Un bilan de 60 minutes réalisé par un membre de votre équipe que je forme, avec un Motion Case prêté par KŌMØ et la plateforme PULSE.']),
  numbered('n1', [['Mesurer les patients que vous traitez. ', { bold: true, color: INK }], 'Un parcours J0 · J30 · S6 qui donne à vos soins un critère fonctionnel objectif, patient par patient. Premier axe : l’ozonothérapie.']),
  numbered('n1', [['Tester douze semaines, puis décider ensemble. ', { bold: true, color: INK }], 'Un pilote simple, des indicateurs fixés à l’avance, aucun engagement au-delà.']),
  spacer(80),
  callout('Une collaboration, pas une organisation imposée', 'HIRO garde la maîtrise de son activité médicale, de ses indications et de ses traitements. KŌMØ apporte une évaluation fonctionnelle distincte. Pas d’exclusivité, pas d’obligation d’orientation, aucune rémunération liée à l’orientation de patients.'),
  spacer(200),
  H2('Ce que chacun y gagne'),
  grid(['Pour les patients', 'Pour HIRO', 'Pour KŌMØ'], [[
    [P('Une lecture claire de leur force, de leur équilibre, de leur marche et de leur posture.', { size: 19, after: 80 }), P('Un programme maison de six semaines.', { size: 19, after: 80 }), P('Leurs résultats et leur passeport PDF sur leur téléphone, puis leur évolution à chaque contrôle.', { size: 19, after: 0 })],
    [P('Un critère objectif de résultat pour ses soins, patient par patient.', { size: 19, after: 80 }), P('Une offre nouvelle, sans investissement en matériel.', { size: 19, after: 80 }), P('Des patients qui reviennent à J30 et à S6.', { size: 19, after: 80 }), P('Une différence visible à Monaco.', { size: 19, after: 0 })],
    [P('Un lieu de déploiement à Monaco.', { size: 19, after: 80 }), P('Une activité adossée à une équipe médicale.', { size: 19, after: 80 }), P('Des retours terrain pour améliorer ses protocoles.', { size: 19, after: 80 }), P('Une visibilité auprès d’une patientèle intéressée par la performance et la longévité.', { size: 19, after: 0 })]
  ]], [3212, 3213, 3213], { firstBold: false }),
  pageBreak()
];

const lab = [
  kicker('Le bilan Motion'), H1('Ce que mesure le Motion Lab'),
  P('Un protocole standardisé de 14 tests en quatre postes, plus une photo de profil pour la posture. Les mesures viennent d’instruments, pas d’une impression : plateformes de force, dynamomètre, chronomètre.'),
  grid(['Poste', 'Ce qui est mesuré', 'Instrument'], [
    ['A · force, assis', 'Flexion et abduction de hanche, extension et flexion de genou, préhension ; gauche et droite, et leur symétrie', 'DynaMo Plus'],
    ['B · plateformes', 'Masse, équilibre debout yeux ouverts et fermés, lever de chaise, appui sur un pied, saut vertical si le patient est à l’aise', 'Deux ForceDecks Mini'],
    ['Photo de profil', 'Alignement de la tête, du tronc, du bassin et du genou ; photo mesurée puis effacée', 'iPhone'],
    ['C · marche', 'Vitesse de marche sur 4 m, départ arrêté, meilleur de deux passages', 'Chronomètre PULSE'],
    ['D · chaise', 'Levers en 30 secondes, d’où la puissance des jambes', 'Chaise de 43 cm'],
    ['Questionnaire', '22 questions sur la vie quotidienne, la douleur et les habitudes, plus 5 sur la santé', 'Téléphone du patient']
  ], [2000, 5638, 2000]),
  spacer(160),
  H2('Ce que le patient reçoit'),
  P('Après relecture et validation par le praticien, le patient retrouve sur son téléphone un passeport PDF : ses capacités situées par rapport à des repères publiés, ses trois priorités avec un objectif à six semaines, son programme maison, puis, à chaque contrôle, sa trajectoire. L’e-mail ne contient qu’un lien personnel, jamais de résultat.'),
  new Table({ width: { size: W, type: WidthType.DXA }, columnWidths: [4819, 4819], layout: TableLayoutType.FIXED, rows: [
    new TableRow({ cantSplit: true, children: [
      new TableCell({ width: { size: 4819, type: WidthType.DXA }, borders: noBorders, margins: { top: 80, bottom: 40, left: 0, right: 160 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [img(IMG1, 196, 277)] }), P('Fin du premier bilan : capacités, repères, priorités', { size: 16, color: MUTED, align: AlignmentType.CENTER, after: 0, line: 240 })] }),
      new TableCell({ width: { size: 4819, type: WidthType.DXA }, borders: noBorders, margins: { top: 80, bottom: 40, left: 160, right: 0 }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [img(IMG2, 196, 277)] }), P('Contrôle à six semaines : les progrès qui dépassent la marge d’erreur', { size: 16, color: MUTED, align: AlignmentType.CENTER, after: 0, line: 240 })] })
    ] })
  ] }),
  P('Exemple produit par PULSE, pour une patiente fictive. Le bilan décrit des capacités : il ne pose pas de diagnostic et ne calcule ni score global ni « âge du mouvement ».', { size: 16, color: MUTED, align: AlignmentType.CENTER, before: 80 }),
  pageBreak()
];

const doors = [
  kicker('Les parcours'), H1('Deux portes d’entrée, une même séquence'),
  columns([
    [P('ASSESS FIRST', { bold: true, color: WHITE, size: 18, after: 60 }), P('Le patient commence par le bilan.', { serif: true, size: 26, color: WHITE, after: 100, line: 260 }), P('Il repart avec une lecture de ses capacités et, si c’est pertinent, il peut demander un échange avec un médecin HIRO.', { color: 'E3EBE2', size: 19, after: 0 })],
    [P('TREAT FIRST', { bold: true, color: WHITE, size: 18, after: 60 }), P('Le patient vient d’abord pour un soin.', { serif: true, size: 26, color: WHITE, after: 100, line: 260 }), P('Il fait son bilan avant la première séance, puis aux contrôles, pour suivre ses capacités dans le temps.', { color: WHITE, size: 19, after: 0 })]
  ], [INK, GOLDL]),
  spacer(160),
  grid(['Temps', 'Quand', 'Ce qui se passe'], [
    ['J0', 'Avant la première séance', 'Bilan Motion complet, douleur et questionnaires, programme maison remis.'],
    ['Décision', 'Après J0', 'Le médecin HIRO pose ou non l’indication. Le bilan peut l’éclairer ; il ne la pose pas.'],
    ['Soins', 'Selon le schéma HIRO', 'Chaque séance est consignée par HIRO : modalité, paramètres, dates, tolérance.'],
    ['J30', 'Jour 21 à 34', 'Mêmes mesures, douleur, tolérance, suivi du programme.'],
    ['S6', 'Jour 35 à 56', 'Batterie complète, trajectoire, priorités pour la suite. S12 en option.']
  ], [1500, 2400, 5738]),
  spacer(200),
  H2('Trois profils, deux axes de soin'),
  grid(['Profil', 'Ce que KŌMØ mesure', 'Ozonothérapie · axe 1', 'PAPIMI · axe 2'], [
    ['Asymptomatique', 'Batterie complète, à titre de référence', 'Bilan de référence ; un soin seulement sur décision HIRO', 'Sous conditions'],
    ['Pathologie locomotrice : rachis, hanche, genou', 'Douleur, questionnaire validé de la pathologie, force ciblée, symétrie, lever, marche', 'Ouvert : premier cas d’usage du pilote', 'Sous conditions'],
    ['Sportif', 'Force segmentaire, puissance, asymétries, équilibre', 'Selon l’indication HIRO', 'Sous conditions']
  ], [2300, 3138, 2400, 1800]),
  spacer(120),
  P([['PAPIMI : ', { bold: true, color: INK }], 'l’axe n’ouvre au pilote que si HIRO transmet les documents réglementaires du dispositif (marquage CE, destination revendiquée) et l’utilise dans cette destination, sans aucune communication associant l’appareil aux mesures Motion. Ensuite, la photobiomodulation et l’IHHT pourraient devenir les axes 3 et 4.'], { size: 20 }),
  callout('HIRO traite, KŌMØ mesure', 'Le choix d’un soin relève exclusivement du médecin HIRO. Une évolution mesurée chez un patient décrit sa trajectoire ; elle ne prouve pas à elle seule l’effet d’un soin. Le détail par profil et par axe, test par test, est dans le document joint.'),
  pageBreak()
];

const setup = [
  kicker('Mise en place'), H1('Une mise en place légère'),
  H2('Ce que KŌMØ met à disposition'),
  bullet([['Un Motion Case en prêt ', { bold: true, color: INK }], 'pour la durée convenue : deux ForceDecks Mini, un DynaMo Plus, un iPhone avec PULSE et les applications VALD, sous réserve des conditions d’utilisation des équipements VALD.']),
  bullet([['Une formation ', { bold: true, color: INK }], 'du membre de l’équipe que vous choisissez : deux demi-journées, puis trois bilans supervisés avant de travailler seul.']),
  bullet([['PULSE ', { bold: true, color: INK }], ': un espace opérateur, une vue du centre et un espace patient, avec consentement électronique, questionnaire sur le téléphone du patient, passeport PDF et trajectoire.']),
  bullet([['Les protocoles et les supports ', { bold: true, color: INK }], ': protocole Motion, réglages VALD, guide de consultation, fiches de soin, et un contrôle qualité mensuel des données.']),
  bullet([['Mon accompagnement ', { bold: true, color: INK }], 'au démarrage, puis un point mensuel de trente minutes.']),
  H2('Ce que HIRO apporte'),
  bullet('Un membre de l’équipe à former, disponible pour les créneaux du Motion Lab.'),
  bullet('Une salle : un couloir droit de 6 mètres, un mur uni, une table d’examen et une chaise de 43 cm sans accoudoirs.'),
  bullet('L’accueil, la prise de rendez-vous et l’encaissement des bilans.'),
  bullet('La décision et la réalisation des soins, et leur traçabilité.'),
  pageBreak(),
  kicker('Modèle économique'), H1('Une proposition chiffrée'),
  grid(['Prestation', 'Durée', 'Prix public proposé'], [
    ['Bilan Motion', '60 min', '200 €'],
    ['Contrôle Motion (J30, S6 ou S12)', '45 min', '120 €'],
    ['Parcours mesuré : J0, J30 et S6', '3 rendez-vous', '400 € au lieu de 440 €']
  ], [4638, 2000, 3000]),
  spacer(120),
  P([['Partage proposé. ', { bold: true, color: INK }], 'HIRO encaisse et reverse à KŌMØ une redevance par acte qui couvre le matériel, PULSE, les protocoles, le passeport et le contrôle qualité : 70 € par bilan, 40 € par contrôle, 150 € par parcours. ', ['Pendant le pilote : aucune redevance fixe, aucun minimum.', { bold: true, color: INK }], ' Après le pilote : redevance par acte, ou forfait mensuel si le volume le justifie.']),
  grid(['Exemple : un mois de rythme de croisière', 'Volume', 'Montant'], [
    ['Bilans (60 min)', '12', '2 400 €'],
    ['Contrôles (45 min)', '16', '1 920 €'],
    ['Chiffre d’affaires des bilans', '', '4 320 €'],
    ['Redevance KŌMØ', '12 × 70 € + 16 × 40 €', '1 480 €'],
    ['Part HIRO, avant le temps de l’opérateur', '', '2 840 €'],
    ['Temps de l’opérateur', '', '24 heures']
  ], [5138, 2500, 2000], { zebra: true }),
  P('Montants à confirmer ensemble ; le régime de TVA des prestations est à vérifier avec l’expert-comptable.', { size: 17, color: MUTED, before: 80 }),
  pageBreak()
];

const pilot = [
  kicker('Le pilote'), H1('Douze semaines, puis une décision commune'),
  grid(['Période', 'Étape'], [
    ['Décembre 2026', 'Convention, protocoles et consentement validés ; formation de l’opérateur et trois bilans supervisés.'],
    ['Janvier 2027', 'Premiers bilans du Motion Lab ; inclusion des six cas du pilote (un par profil et par axe), bilans J0.'],
    ['Février 2027', 'Contrôles J30 et premiers S6.'],
    ['Mars 2027', 'Derniers S6 ; synthèse commune et décision fin mars.']
  ], [2400, 7238]),
  spacer(160),
  H2('Indicateurs fixés à l’avance'),
  grid(['Indicateur', 'Objectif proposé'], [
    ['Bilans réalisés pendant le pilote', '20 ou plus'],
    ['Patients du parcours revus à S6, dans leur fenêtre', '70 % ou plus'],
    ['Tests réalisés (hors motif de sécurité ou de douleur)', '90 % ou plus'],
    ['Durée d’un bilan', '60 minutes ou moins'],
    ['Satisfaction des patients', '4 sur 5 ou plus'],
    ['Incident pendant un test', 'Aucun']
  ], [6638, 3000], { zebra: true }),
  P('À la fin du pilote, trois options : continuer tel quel, élargir (registre de tous les patients mesurés, axes 3 et 4), ou arrêter, sans frais.', { before: 120 }),
  pageBreak(),
  kicker('Cadre'), H1('Qui fait quoi'),
  grid(['', 'HIRO', 'KŌMØ'], [
    ['Décide', 'Indication, éligibilité et schéma de chaque soin', 'Batterie Motion selon le profil, conditions de test'],
    ['Réalise', 'Les soins et leur surveillance', 'La formation, PULSE, le passeport et le contrôle qualité ; les bilans avec l’opérateur HIRO certifié'],
    ['Consigne', 'La fiche de chaque soin, sous le code du patient', 'Les mesures dans PULSE et les motifs des tests non réalisés'],
    ['Signale', 'Les événements indésirables des soins', 'Tout incident pendant un test, au médecin HIRO le jour même']
  ], [1600, 4019, 4019]),
  spacer(160),
  H2('Données des patients'),
  bullet('Dossiers PULSE hébergés à Paris (UE) ; accès par rôle : opérateur, centre, patient.'),
  bullet('Consentement électronique horodaté, donné par le patient sur son téléphone ; résultats visibles seulement après validation ; lien personnel valable 60 jours.'),
  bullet('Dans les applications VALD et dans tout ce qui est transmis pour analyse, le patient n’apparaît que sous un code.'),
];

const next = [
  H2('Ce que nous arrêtons ensemble avant de démarrer'),
  grid(['Sujet', 'À définir'], [
    ['Convention', 'Durée et inventaire du prêt, assurance du matériel, responsabilité civile professionnelle de chacun, conditions d’utilisation VALD, facturation et TVA.'],
    ['Consentement', 'Ajout d’une case de partage des résultats avec l’équipe médicale HIRO ; consentement de HIRO pour ses soins.'],
    ['Données', 'Rôles de chacun au sens du RGPD, hébergement de données de santé, durée de conservation, avis du DPO.'],
    ['Déontologie', 'Relecture juridique de la convention et transmission au conseil départemental de l’Ordre des médecins ; aucune communication publique sans accord commun.'],
    ['Soins', 'Axes ouverts, indications et contre-indications, fiche de traçabilité ; documents réglementaires du PAPIMI.']
  ], [2200, 7438]),
  pageBreak(),
  kicker('Prochaines étapes'), H1('Pour démarrer en janvier'),
  numbered('n2', [['Semaine du 30 novembre : ', { bold: true, color: INK }], 'un rendez-vous de 45 minutes pour en parler et vous montrer le Motion Case.']),
  numbered('n2', [['5 décembre : ', { bold: true, color: INK }], 'le choix du membre de l’équipe à former et des axes ouverts au pilote.']),
  numbered('n2', [['15 décembre : ', { bold: true, color: INK }], 'la convention et les protocoles validés.']),
  numbered('n2', [['Semaine du 14 décembre : ', { bold: true, color: INK }], 'la formation et les trois bilans supervisés.']),
  numbered('n2', [['Janvier 2027 : ', { bold: true, color: INK }], 'les premiers patients.']),
  spacer(200),
  callout('En toute simplicité', 'Cette proposition est une base de discussion. Si le principe vous intéresse, je serais heureux d’en définir avec vous un format adapté à HIRO, sans engagement au-delà du pilote.', SAGE),
  spacer(400),
  P('Dr Renan Chapon', { serif: true, size: 26, color: INK, after: 20 }),
  P('KŌMØ Longevity · contact@komolongevity.com', { size: 19, color: MUTED }),
  spacer(200),
  P('Pièce jointe : « Parcours mesurés · protocoles communs » (profils, batterie Motion test par test, calendrier, ozonothérapie, conditions PAPIMI, données, pilote, niveau de preuve).', { size: 17, color: MUTED })
];

const doc = new Document({
  creator: 'KŌMØ Longevity', title: 'HIRO Monaco × KŌMØ Longevity · Proposition de collaboration', description: 'Motion & Performance Lab',
  styles: {
    default: { document: { run: { font: SANS, size: 21, color: INK2 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: SERIF, size: 40, color: INK }, paragraph: { spacing: { before: 60, after: 220, line: 276 }, keepNext: true, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: SANS, size: 22, bold: true, color: INK }, paragraph: { spacing: { before: 240, after: 100 }, keepNext: true, outlineLevel: 1 } }
    ]
  },
  numbering: { config: [
    { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 260 } }, run: { color: GOLDL } } }] },
    ...['n1', 'n2'].map(r => ({ reference: r, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 340 } }, run: { bold: true, color: GOLD } } }] }))
  ] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134, footer: 567 } }, titlePage: true },
    footers: {
      first: new Footer({ children: [new Paragraph({ children: [] })] }),
      default: new Footer({ children: [new Paragraph({ children: [
        run('HIRO Monaco × KŌMØ Longevity · Proposition de collaboration · confidentiel', { size: 15, color: MUTED }),
        new TextRun({ children: ['\t', PageNumber.CURRENT], font: SANS, size: 15, color: MUTED })
      ], tabStops: [{ type: 'right', position: W }] })] })
    },
    children: [...cover, ...brief, ...lab, ...doors, ...setup, ...pilot, ...next]
  }]
});
Packer.toBuffer(doc).then(b => { fs.writeFileSync(OUT, b); console.log('[proposition] ' + OUT); });
