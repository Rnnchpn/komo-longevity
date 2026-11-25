// KŌMØ — consultation flash : repères par âge et sexe, ce qu'ils signifient, textes du rapport en français
// et en anglais (25/11/2026).
// Source unique, utilisée par la page flash (pulse-v14-src/flash/) et par la fonction serveur
// flash-report (copie identique dans supabase/functions/flash-report/, contrôlée au build).
//
// Préhension : centiles par âge et sexe de Dodds et al., PLoS One 2014 (49 964 adultes britanniques).
//   Force basse : 16 kg (femmes) et 27 kg (hommes), seuils EWGSOP2 tirés de la même étude.
//   Longévité : étude PURE, Leong et al., Lancet 2015 (139 691 adultes, 17 pays) : chaque 5 kg de force
//   en moins, risque de décès toutes causes multiplié par 1,16.
// Appui sur une jambe : moyennes yeux ouverts par âge et sexe de Springer et al., J Geriatr Phys Ther 2007
//   (test au-delà de 30 s). Longévité : Araujo et al., Br J Sports Med 2022 (personnes de 51 à 75 ans) :
//   ne pas tenir 10 s, risque de décès toutes causes 84 % plus élevé (suivi médian de 7 ans).
// Debout yeux fermés, bras tendus : aucun repère publié pour cette variante ; valeur de départ.

export const BOOKING_URL = 'https://rdv-consultation.vercel.app';
export const LANGS = ['fr', 'en'];
const L = (lang) => (lang === 'en' ? 'en' : 'fr');

// [âge, 10e, 25e, 50e, 75e, 90e centile] en kg
const GRIP = {
  female: [[20, 21, 24, 28, 32, 36], [25, 23, 26, 30, 35, 38], [30, 24, 27, 31, 35, 39], [35, 23, 27, 31, 35, 39], [40, 23, 27, 31, 35, 39],
    [45, 22, 26, 30, 34, 38], [50, 21, 25, 29, 33, 37], [55, 19, 23, 28, 32, 35], [60, 18, 22, 27, 31, 34], [65, 17, 21, 25, 29, 33],
    [70, 16, 20, 24, 27, 31], [75, 14, 18, 21, 25, 28], [80, 13, 16, 19, 23, 26], [85, 11, 14, 17, 20, 23], [90, 9, 11, 14, 17, 20]],
  male: [[20, 30, 35, 40, 46, 52], [25, 36, 41, 48, 55, 61], [30, 38, 44, 51, 58, 64], [35, 39, 45, 51, 58, 64], [40, 38, 44, 50, 57, 63],
    [45, 36, 42, 49, 56, 61], [50, 35, 41, 48, 54, 60], [55, 34, 40, 47, 53, 59], [60, 33, 39, 45, 51, 56], [65, 31, 37, 43, 48, 53],
    [70, 29, 34, 39, 44, 49], [75, 26, 31, 35, 41, 45], [80, 23, 27, 32, 37, 42], [85, 19, 24, 29, 33, 38], [90, 16, 20, 25, 29, 33]],
};
const WEAK = { female: 16, male: 27 };
// [âge de début de tranche, fin de tranche, moyenne en s]
const SLS = {
  female: [[18, 39, 43.5], [40, 49, 40.4], [50, 59, 36.0], [60, 69, 25.1], [70, 79, 11.3], [80, 99, 7.4]],
  male: [[18, 39, 43.2], [40, 49, 40.1], [50, 59, 38.1], [60, 69, 28.7], [70, 79, 18.3], [80, 99, 5.6]],
};

export const fmt = (x, d = 1, lang = 'fr') => x == null ? '—' : Number(x).toLocaleString(L(lang) === 'en' ? 'en-GB' : 'fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const kg = (x, lang) => fmt(x, Number.isInteger(x) ? 0 : 1, lang);
export const fmtDate = (d, lang = 'fr') => new Date(d).toLocaleDateString(L(lang) === 'en' ? 'en-GB' : 'fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Paris' });

// Textes fixes du rapport (écran, PDF, e-mail).
export const REPORT = {
  fr: {
    zone: { solid: 'Solide', consolidate: 'À consolider', priority: 'Priorité', reference: 'Repère personnel' },
    title: 'Votre mini-bilan KŌMØ Motion', eyebrow: 'MINI-BILAN · KŌMØ MOTION',
    subject: (date) => `Votre mini-bilan KŌMØ Motion du ${date}`, heading: (date) => `Votre mini-bilan du ${date}`,
    meta: (name, age, date) => `${name}${age != null ? ` · ${age} ans` : ''} · ${date} · 5 minutes, 3 tests`,
    hello: (n) => `Bonjour ${n},`,
    intro: (age) => `Merci d’avoir fait le mini-bilan KŌMØ Motion. Voici vos mesures, réalisées en 5 minutes${age != null ? `, comparées aux repères de votre âge (${age} ans)` : ''}.`,
    strength: 'Votre point fort ce soir :', focus: 'À regarder de plus près :',
    allSolid: 'Tout est solide ce soir : le bilan complet fixe votre point de départ et suit votre trajectoire.',
    bookTitle: 'Aller plus loin : le bilan complet',
    bookText: '14 mesures en une heure, un passeport de mouvement et un programme de 6 semaines, avec des contrôles à 6 et 12 semaines.',
    bookCta: 'Réserver mon bilan complet', bookLine: 'Pour réserver :',
    disclaimer: 'Mesures de démonstration réalisées en 5 minutes : elles ne constituent pas un diagnostic médical.',
    consentNote: 'Vous recevez cet e-mail parce que vous avez accepté de recevoir votre mini-rapport. Pour toute question, répondez simplement à cet e-mail.',
    sources: 'Repères : Dodds 2014 (force de préhension par âge), Springer 2007 (appui sur une jambe par âge), étude PURE, Leong 2015 (force et mortalité), Araujo 2022 (appui de 10 s et mortalité).',
    team: 'L’équipe KŌMØ Longevity', file: 'mini-bilan-komo',
  },
  en: {
    zone: { solid: 'Strong', consolidate: 'To consolidate', priority: 'Priority', reference: 'Personal baseline' },
    title: 'Your KŌMØ Motion mini-assessment', eyebrow: 'MINI-ASSESSMENT · KŌMØ MOTION',
    subject: (date) => `Your KŌMØ Motion mini-assessment, ${date}`, heading: (date) => `Your mini-assessment, ${date}`,
    meta: (name, age, date) => `${name}${age != null ? ` · ${age} years old` : ''} · ${date} · 5 minutes, 3 tests`,
    hello: (n) => `Hello ${n},`,
    intro: (age) => `Thank you for taking the KŌMØ Motion mini-assessment. Here are your measurements, taken in 5 minutes${age != null ? ` and compared with the references for your age (${age})` : ''}.`,
    strength: 'Your strong point tonight:', focus: 'Worth a closer look:',
    allSolid: 'Everything is strong tonight: the full assessment sets your baseline and tracks your progress over time.',
    bookTitle: 'Go further: the full assessment',
    bookText: '14 measurements in one hour, a movement passport and a 6-week programme, with follow-ups at 6 and 12 weeks.',
    bookCta: 'Book my full assessment', bookLine: 'To book:',
    disclaimer: 'Demonstration measurements taken in 5 minutes: they are not a medical diagnosis.',
    consentNote: 'You are receiving this email because you agreed to receive your mini-report. For any question, simply reply to this email.',
    sources: 'References: Dodds 2014 (grip strength by age), Springer 2007 (single-leg stance by age), PURE study, Leong 2015 (grip strength and mortality), Araujo 2022 (10-second stance and mortality).',
    team: 'The KŌMØ Longevity team', file: 'mini-assessment-komo',
  },
};
export const ZONE_LABEL = REPORT.fr.zone;
export const SOURCES = REPORT.fr.sources;

// Phrases des mesures.
const M = {
  fr: {
    who: (s) => (s === 'male' ? 'un homme' : 'une femme'),
    band: ['sous le 10e centile', 'entre le 10e et le 25e centile', 'entre le 25e et le 50e centile', 'entre le 50e et le 75e centile', 'entre le 75e et le 90e centile', 'au-dessus du 90e centile'],
    grip: 'Force de préhension', gripValue: (r, l) => `Droite ${r} kg · Gauche ${l} kg`,
    gripNorm: (who, age, med, p10, band) => `Repère pour ${who} de ${age} ans : ${med} kg en médiane, 10 % les plus faibles sous ${p10} kg. Vous êtes ${band} de votre âge.`,
    gripSolid: 'La force de la main reflète la force musculaire de tout le corps ; une force au niveau de son âge ou au-dessus est associée à une meilleure longévité.',
    gripLow: (gap) => `Vous êtes à ${gap} kg sous la médiane de votre âge. Dans l’étude PURE (140 000 adultes, 17 pays), chaque 5 kg de force en moins était associé à un risque de décès toutes causes 16 % plus élevé.`,
    gripNoAgeNorm: (w) => `Repère sans âge : force basse sous ${w} kg.`,
    gripNoAge: 'La force de la main reflète la force musculaire de tout le corps. Dans l’étude PURE, chaque 5 kg de force en moins était associé à un risque de décès toutes causes 16 % plus élevé.',
    gripWeak: (w) => ` Sous ${w} kg, la force est considérée comme basse selon le consensus européen sur la sarcopénie (EWGSOP2).`,
    sym: 'Symétrie des mains', symValue: (p) => `${p} % (main la plus faible / la plus forte)`,
    symNorm: 'Repère : la main la plus faible à au moins 90 % de la plus forte.', symSolid: 'Vos deux côtés ont une force équilibrée.',
    symLow: (side) => `La main ${side === 'right' ? 'droite' : 'gauche'} est en retrait : un écart se corrige en travaillant d’abord le côté faible.`,
    qs: 'Équilibre debout, yeux fermés', sway: (x) => `Oscillation ${x} mm/s`,
    load: (x, side) => `charge décalée de ${x} %${side ? (side === 'left' ? ' vers la gauche' : ' vers la droite') : ''}`,
    qsNorm: 'Pas de repère publié pour cette position (yeux fermés, bras tendus) : c’est votre valeur de départ, comparée au prochain bilan. Repère de charge : moins de 10 % d’écart.',
    qsMeaning: 'Sans la vue, l’équilibre repose sur l’oreille interne et sur les capteurs des pieds et des articulations ; l’oscillation augmente avec l’âge.',
    qsOff: (x, side) => ` Votre poids est décalé de ${x} %${side ? (side === 'left' ? ' vers la gauche' : ' vers la droite') : ''} : au-delà de 10 %, l’écart est à travailler.`,
    sls: 'Appui sur une jambe', slsValue: (l, r) => `Gauche ${l} · Droite ${r} (sur 30 s)`,
    slsNormHigh: (who, a, b, m) => `Repère pour ${who} de ${a} à ${b} ans : ${m} s en moyenne (test allant au-delà de 30 s) ; à cet âge, on tient en général les 30 s.`,
    slsNormLow: (who, a, b, m) => `Repère pour ${who} de ${a} à ${b} ans : ${m} s en moyenne. Le seuil de 10 s est celui qui compte pour la longévité.`,
    slsNormNoAge: 'Repère : 30 s sur chaque jambe ; le seuil de 10 s est celui qui compte pour la longévité.',
    araujo: 'Entre 51 et 75 ans, ne pas tenir 10 secondes sur une jambe était associé à un risque de décès toutes causes 84 % plus élevé sur environ 7 ans (Araujo, 2022).',
    slsPriority: (a) => `${a} L’équilibre se travaille à tout âge et progresse vite.`,
    slsConsolidate: (a) => `Vous dépassez le seuil de 10 s, mais restez sous le repère de votre âge. ${a}`,
    slsSolid: 'Vous êtes au niveau du repère de votre âge. Tenir au moins 10 s sur une jambe est associé à une meilleure survie après 50 ans.',
  },
  en: {
    who: (s) => (s === 'male' ? 'a man' : 'a woman'),
    band: ['below the 10th centile', 'between the 10th and 25th centiles', 'between the 25th and 50th centiles', 'between the 50th and 75th centiles', 'between the 75th and 90th centiles', 'above the 90th centile'],
    grip: 'Grip strength', gripValue: (r, l) => `Right ${r} kg · Left ${l} kg`,
    gripNorm: (who, age, med, p10, band) => `Reference for ${who} aged ${age}: median ${med} kg; the weakest 10% are below ${p10} kg. You are ${band} for your age.`,
    gripSolid: 'Grip strength reflects whole-body muscle strength; strength at or above the level for your age is associated with greater longevity.',
    gripLow: (gap) => `You are ${gap} kg below the median for your age. In the PURE study (140,000 adults, 17 countries), every 5 kg less grip strength was associated with a 16% higher risk of death from any cause.`,
    gripNoAgeNorm: (w) => `Reference without age: low strength below ${w} kg.`,
    gripNoAge: 'Grip strength reflects whole-body muscle strength. In the PURE study, every 5 kg less grip strength was associated with a 16% higher risk of death from any cause.',
    gripWeak: (w) => ` Below ${w} kg, strength is considered low under the European consensus on sarcopenia (EWGSOP2).`,
    sym: 'Hand symmetry', symValue: (p) => `${p}% (weaker hand / stronger hand)`,
    symNorm: 'Reference: the weaker hand at least 90% of the stronger one.', symSolid: 'Both sides are evenly matched.',
    symLow: (side) => `Your ${side === 'right' ? 'right' : 'left'} hand lags behind: the gap closes by training the weaker side first.`,
    qs: 'Standing balance, eyes closed', sway: (x) => `Sway ${x} mm/s`,
    load: (x, side) => `load shifted ${x}%${side ? (side === 'left' ? ' to the left' : ' to the right') : ''}`,
    qsNorm: 'There is no published reference for this position (eyes closed, arms extended): this is your baseline, to be compared at your next assessment. Load reference: less than 10% difference.',
    qsMeaning: 'Without vision, balance relies on the inner ear and on sensors in the feet and joints; sway increases with age.',
    qsOff: (x, side) => ` Your weight is shifted ${x}%${side ? (side === 'left' ? ' to the left' : ' to the right') : ''}: beyond 10%, the imbalance is worth working on.`,
    sls: 'Single-leg stance', slsValue: (l, r) => `Left ${l} · Right ${r} (out of 30 s)`,
    slsNormHigh: (who, a, b, m) => `Reference for ${who} aged ${a} to ${b}: ${m} s on average (test longer than 30 s); at this age, people usually hold the full 30 s.`,
    slsNormLow: (who, a, b, m) => `Reference for ${who} aged ${a} to ${b}: ${m} s on average. The 10-second threshold is the one that matters for longevity.`,
    slsNormNoAge: 'Reference: 30 s on each leg; the 10-second threshold is the one that matters for longevity.',
    araujo: 'Between ages 51 and 75, being unable to stand on one leg for 10 seconds was associated with an 84% higher risk of death from any cause over about 7 years (Araujo, 2022).',
    slsPriority: (a) => `${a} Balance can be trained at any age and improves quickly.`,
    slsConsolidate: (a) => `You are above the 10-second threshold but below the reference for your age. ${a}`,
    slsSolid: 'You are at the reference level for your age. Holding at least 10 s on one leg is associated with better survival after 50.',
  },
};

export function ageAt(birthDate, onDate) {
  const b = new Date(String(birthDate || '') + 'T12:00:00'), d = onDate ? new Date(onDate) : new Date();
  if (isNaN(b.getTime()) || isNaN(d.getTime())) return null;
  let a = d.getFullYear() - b.getFullYear();
  if (d.getMonth() < b.getMonth() || (d.getMonth() === b.getMonth() && d.getDate() < b.getDate())) a--;
  return a >= 18 && a <= 100 ? a : null;
}

export function gripCentiles(age, sex) {
  const t = GRIP[sex] || GRIP.female, a = Math.max(20, Math.min(90, age));
  let i = t.findIndex((r) => r[0] >= a);
  if (t[i][0] === a || i === 0) return t[i].slice(1);
  const lo = t[i - 1], hi = t[i], f = (a - lo[0]) / (hi[0] - lo[0]);
  return lo.slice(1).map((v, k) => Math.round((v + (hi[k + 1] - v) * f) * 10) / 10);
}
const bandIndex = (v, c) => (v < c[0] ? 0 : v < c[1] ? 1 : v < c[2] ? 2 : v < c[3] ? 3 : v < c[4] ? 4 : 5);
const slsBand = (age, sex) => (SLS[sex] || SLS.female).find((r) => age >= r[0] && age <= r[1]) || null;

// values : gripR, gripL (kg), qsVel (mm/s), qsAsym (%), qsSide ('left'|'right'), slsL, slsR (s, 0 à 30)
// sex : 'female' | 'male' ; age : entier ou null (repères sans âge) ; lang : 'fr' | 'en'.
export function flashModel(values, sex, age, lang = 'fr') {
  const lg = L(lang), t = M[lg], n = (x, d = 1) => fmt(x, d, lg);
  const v = values || {}, s = sex === 'male' ? 'male' : 'female', who = t.who(s);
  const out = [];
  const gripR = v.gripR ?? null, gripL = v.gripL ?? null;
  if (gripR != null || gripL != null) {
    const best = Math.max(gripR ?? 0, gripL ?? 0), weak = WEAK[s];
    let zone, norm, meaning;
    if (age != null) {
      const c = gripCentiles(age, s), floor = Math.max(c[0], weak);
      zone = best < floor ? 'priority' : best < c[2] ? 'consolidate' : 'solid';
      norm = t.gripNorm(who, age, kg(c[2], lg), kg(c[0], lg), t.band[bandIndex(best, c)]);
      meaning = zone === 'solid' ? t.gripSolid : t.gripLow(kg(Math.round((c[2] - best) * 10) / 10, lg));
    } else {
      zone = best < weak ? 'priority' : best < weak + 5 ? 'consolidate' : 'solid';
      norm = t.gripNoAgeNorm(weak);
      meaning = t.gripNoAge;
    }
    if (best < weak) meaning += t.gripWeak(weak);
    out.push({ key: 'grip', name: t.grip, zone, value: t.gripValue(n(gripR), n(gripL)), norm, meaning });
    if (gripR != null && gripL != null && Math.max(gripR, gripL) > 0) {
      const sym = Math.round(Math.min(gripR, gripL) / Math.max(gripR, gripL) * 100);
      const z = sym < 80 ? 'priority' : sym < 90 ? 'consolidate' : 'solid';
      out.push({ key: 'symmetry', name: t.sym, zone: z, value: t.symValue(n(sym, 0)), norm: t.symNorm,
        meaning: z === 'solid' ? t.symSolid : t.symLow(gripR < gripL ? 'right' : 'left') });
    }
  }
  const qsVel = v.qsVel ?? null, qsAsym = v.qsAsym ?? null;
  if (qsVel != null || qsAsym != null) {
    const side = v.qsSide === 'left' || v.qsSide === 'right' ? v.qsSide : '';
    const off = qsAsym != null && qsAsym > 10;
    out.push({ key: 'quiet_stand', name: t.qs, zone: off ? 'consolidate' : 'reference',
      value: [qsVel != null ? t.sway(n(qsVel)) : null, qsAsym != null ? t.load(n(qsAsym), side) : null].filter(Boolean).join(' · '),
      norm: t.qsNorm, meaning: t.qsMeaning + (off ? t.qsOff(n(qsAsym), side) : '') });
  }
  const l = v.slsL ?? null, r = v.slsR ?? null;
  if (l != null || r != null) {
    const low = Math.min(l ?? 30, r ?? 30), band = age != null ? slsBand(age, s) : null;
    const expected = band ? Math.min(30, band[2]) : 30;
    const zone = low < 10 ? 'priority' : low >= expected - 0.05 ? 'solid' : 'consolidate';
    const norm = band ? (band[2] >= 30 ? t.slsNormHigh : t.slsNormLow)(who, band[0], band[1], n(band[2])) : t.slsNormNoAge;
    const meaning = zone === 'priority' ? t.slsPriority(t.araujo) : zone === 'consolidate' ? t.slsConsolidate(t.araujo) : t.slsSolid;
    out.push({ key: 'single_leg', name: t.sls, zone, value: t.slsValue(l == null ? '—' : n(l) + ' s', r == null ? '—' : n(r) + ' s'), norm, meaning });
  }
  const order = ['single_leg', 'grip', 'symmetry'];
  const strength = out.filter((m) => m.zone === 'solid').sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))[0] || null;
  const focus = out.filter((m) => m.zone === 'priority' || m.zone === 'consolidate').sort((a, b) => (a.zone === 'priority' ? 0 : 1) - (b.zone === 'priority' ? 0 : 1))[0] || null;
  return { measures: out, strength, focus, lang: lg };
}

// Texte brut du rapport (Gmail, e-mail texte).
export function flashText(p, m, dateText, signature, age = null) {
  const R = REPORT[L(m.lang)];
  return `${R.hello(p.firstName)}\n\n${R.intro(age)}\n\n` +
    m.measures.map((x) => `• ${x.name}${L(m.lang) === 'en' ? ':' : ' :'} ${x.value} — ${R.zone[x.zone]}\n  ${x.norm}\n  ${x.meaning}`).join('\n\n') +
    (m.strength ? `\n\n${R.strength} ${m.strength.name.toLowerCase()}.` : '') +
    (m.focus ? `\n${R.focus} ${m.focus.name.toLowerCase()}.` : `\n\n${R.allSolid}`) +
    `\n\n${R.bookTitle}. ${R.bookText} ${R.bookLine} ${BOOKING_URL}\n\n${signature}\n\n${R.disclaimer} ${R.sources}`;
}
