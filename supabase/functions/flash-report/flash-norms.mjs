// KŌMØ — consultation flash : repères par âge et sexe, et ce qu'ils signifient (25/11/2026).
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
export const ZONE_LABEL = { solid: 'Solide', consolidate: 'À consolider', priority: 'Priorité', reference: 'Repère personnel' };
export const SOURCES = 'Repères : Dodds 2014 (force de préhension par âge), Springer 2007 (appui sur une jambe par âge), étude PURE, Leong 2015 (force et mortalité), Araujo 2022 (appui de 10 s et mortalité).';

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

const fr = (x, d = 1) => x == null ? '—' : Number(x).toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d });
const kg = (x) => fr(x, Number.isInteger(x) ? 0 : 1);

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
function centileBand(v, c) {
  return v < c[0] ? 'sous le 10e centile' : v < c[1] ? 'entre le 10e et le 25e centile' : v < c[2] ? 'entre le 25e et le 50e centile'
    : v < c[3] ? 'entre le 50e et le 75e centile' : v < c[4] ? 'entre le 75e et le 90e centile' : 'au-dessus du 90e centile';
}
function slsBand(age, sex) {
  return (SLS[sex] || SLS.female).find((r) => age >= r[0] && age <= r[1]) || null;
}

// values : gripR, gripL (kg), qsVel (mm/s), qsAsym (%), qsSide ('left'|'right'), slsL, slsR (s, 0 à 30)
// sex : 'female' | 'male' ; age : entier ou null (repères sans âge).
export function flashModel(values, sex, age) {
  const v = values || {}, s = sex === 'male' ? 'male' : 'female', who = s === 'male' ? 'un homme' : 'une femme';
  const out = [];
  const gripR = v.gripR ?? null, gripL = v.gripL ?? null;
  if (gripR != null || gripL != null) {
    const best = Math.max(gripR ?? 0, gripL ?? 0), weak = WEAK[s];
    let zone, norm, meaning;
    if (age != null) {
      const c = gripCentiles(age, s), floor = Math.max(c[0], weak);
      zone = best < floor ? 'priority' : best < c[2] ? 'consolidate' : 'solid';
      norm = `Repère pour ${who} de ${age} ans : ${kg(c[2])} kg en médiane, 10 % les plus faibles sous ${kg(c[0])} kg. Vous êtes ${centileBand(best, c)} de votre âge.`;
      const gap = Math.round((c[2] - best) * 10) / 10;
      meaning = zone === 'solid'
        ? 'La force de la main reflète la force musculaire de tout le corps ; une force au niveau de son âge ou au-dessus est associée à une meilleure longévité.'
        : `Vous êtes à ${kg(gap)} kg sous la médiane de votre âge. Dans l’étude PURE (140 000 adultes, 17 pays), chaque 5 kg de force en moins était associé à un risque de décès toutes causes 16 % plus élevé.`;
    } else {
      zone = best < weak ? 'priority' : best < weak + 5 ? 'consolidate' : 'solid';
      norm = `Repère sans âge : force basse sous ${weak} kg.`;
      meaning = 'La force de la main reflète la force musculaire de tout le corps. Dans l’étude PURE, chaque 5 kg de force en moins était associé à un risque de décès toutes causes 16 % plus élevé.';
    }
    if (best < weak) meaning += ` Sous ${weak} kg, la force est considérée comme basse selon le consensus européen sur la sarcopénie (EWGSOP2).`;
    out.push({ key: 'grip', name: 'Force de préhension', zone, value: `Droite ${fr(gripR)} kg · Gauche ${fr(gripL)} kg`, norm, meaning });
    if (gripR != null && gripL != null && Math.max(gripR, gripL) > 0) {
      const sym = Math.round(Math.min(gripR, gripL) / Math.max(gripR, gripL) * 100);
      const z = sym < 80 ? 'priority' : sym < 90 ? 'consolidate' : 'solid';
      const weakSide = gripR < gripL ? 'droite' : 'gauche';
      out.push({ key: 'symmetry', name: 'Symétrie des mains', zone: z, value: `${fr(sym, 0)} % (main la plus faible / la plus forte)`,
        norm: 'Repère : la main la plus faible à au moins 90 % de la plus forte.',
        meaning: z === 'solid' ? 'Vos deux côtés ont une force équilibrée.' : `La main ${weakSide} est en retrait : un écart se corrige en travaillant d’abord le côté faible.` });
    }
  }
  const qsVel = v.qsVel ?? null, qsAsym = v.qsAsym ?? null;
  if (qsVel != null || qsAsym != null) {
    const side = v.qsSide === 'left' ? ' vers la gauche' : v.qsSide === 'right' ? ' vers la droite' : '';
    const off = qsAsym != null && qsAsym > 10;
    out.push({ key: 'quiet_stand', name: 'Équilibre debout, yeux fermés', zone: off ? 'consolidate' : 'reference',
      value: [qsVel != null ? `Oscillation ${fr(qsVel)} mm/s` : null, qsAsym != null ? `charge décalée de ${fr(qsAsym)} %${side}` : null].filter(Boolean).join(' · '),
      norm: 'Pas de repère publié pour cette position (yeux fermés, bras tendus) : c’est votre valeur de départ, comparée au prochain bilan. Repère de charge : moins de 10 % d’écart.',
      meaning: 'Sans la vue, l’équilibre repose sur l’oreille interne et sur les capteurs des pieds et des articulations ; l’oscillation augmente avec l’âge.' +
        (off ? ` Votre poids est décalé de ${fr(qsAsym)} %${side} : au-delà de 10 %, l’écart est à travailler.` : '') });
  }
  const l = v.slsL ?? null, r = v.slsR ?? null;
  if (l != null || r != null) {
    const low = Math.min(l ?? 30, r ?? 30), band = age != null ? slsBand(age, s) : null;
    const expected = band ? Math.min(30, band[2]) : 30;
    const zone = low < 10 ? 'priority' : low >= expected - 0.05 ? 'solid' : 'consolidate';
    const norm = band
      ? (band[2] >= 30
        ? `Repère pour ${who} de ${band[0]} à ${band[1]} ans : ${fr(band[2])} s en moyenne (test allant au-delà de 30 s) ; à cet âge, on tient en général les 30 s.`
        : `Repère pour ${who} de ${band[0]} à ${band[1]} ans : ${fr(band[2])} s en moyenne. Le seuil de 10 s est celui qui compte pour la longévité.`)
      : 'Repère : 30 s sur chaque jambe ; le seuil de 10 s est celui qui compte pour la longévité.';
    const araujo = 'Entre 51 et 75 ans, ne pas tenir 10 secondes sur une jambe était associé à un risque de décès toutes causes 84 % plus élevé sur environ 7 ans (Araujo, 2022).';
    const meaning = zone === 'priority' ? `${araujo} L’équilibre se travaille à tout âge et progresse vite.`
      : zone === 'consolidate' ? `Vous dépassez le seuil de 10 s, mais restez sous le repère de votre âge. ${araujo}`
      : 'Vous êtes au niveau du repère de votre âge. Tenir au moins 10 s sur une jambe est associé à une meilleure survie après 50 ans.';
    out.push({ key: 'single_leg', name: 'Appui sur une jambe', zone,
      value: `Gauche ${l == null ? '—' : fr(l) + ' s'} · Droite ${r == null ? '—' : fr(r) + ' s'} (sur 30 s)`, norm, meaning });
  }
  const order = ['single_leg', 'grip', 'symmetry'];
  const strength = out.filter((m) => m.zone === 'solid').sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))[0] || null;
  const focus = out.filter((m) => m.zone === 'priority' || m.zone === 'consolidate').sort((a, b) => (a.zone === 'priority' ? 0 : 1) - (b.zone === 'priority' ? 0 : 1))[0] || null;
  return { measures: out, strength, focus };
}

// Texte brut du rapport (Gmail, e-mail texte).
export function flashText(p, m, dateText, signature) {
  return `Bonjour ${p.firstName},\n\nMerci d’avoir fait le mini-bilan KŌMØ Motion du ${dateText}. Voici vos mesures :\n\n` +
    m.measures.map((x) => `• ${x.name} : ${x.value} — ${ZONE_LABEL[x.zone]}\n  ${x.norm}\n  ${x.meaning}`).join('\n\n') +
    (m.strength ? `\n\nVotre point fort : ${m.strength.name.toLowerCase()}.` : '') +
    (m.focus ? `\nÀ regarder de plus près : ${m.focus.name.toLowerCase()}.` : '') +
    `\n\nLe bilan complet mesure 14 paramètres en une heure, avec un passeport de mouvement et un programme de 6 semaines. Pour réserver : ${BOOKING_URL}\n\n${signature}\n\nMesures de démonstration réalisées en 5 minutes : elles ne constituent pas un diagnostic médical. ${SOURCES}`;
}
