// KŌMØ — retrait de l'offre Motion Online et du « Motion Age » (décision du 20/11/2026).
// Dernière passe du build : s'exécute après toutes les couches qui injectent l'offre Online.
// 1) Supprime les blocs et liens Online (39 €, Stripe, /bilan-en-ligne/, /motion-online/, Pulse /online/).
// 2) Retire le terme « Motion Age » des pages Motion FR / EN / ES.
// 3) Réécrit les descriptions SEO qui citaient l'offre Online.
// 4) Contrôle final : échec du build si une trace publique subsiste.
// Les anciennes URL sont redirigées dans vercel.json (voir "redirects").
import fs from 'node:fs';
import path from 'node:path';

const SITE = 'site';
const ONLINE_HREF = /href="(?:https:\/\/(?:www\.)?komolongevity\.com)?\/(?:(?:fr|en|es)\/)?(?:bilan-en-ligne|motion-online)\/?[^"]*"|href="https:\/\/pulse\.komolongevity\.com\/online\/?[^"]*"|href="https:\/\/buy\.stripe\.com\/[^"]*"/;
const REMOVED_SECTION_IDS = ['motion-online-39', 'motion-online-explained'];
const REMOVED_ARTICLE_CLASSES = ['ko-card--online'];
// Pages Online elles-mêmes : laissées en place mais redirigées par vercel.json, non contrôlées.
const SKIP = new Set(['bilan-en-ligne/index.html', 'fr/bilan-en-ligne/index.html',
  'en/motion-online/index.html', 'es/motion-online/index.html']);

const META = {
  fr: 'Bilan fonctionnel du mouvement KŌMØ Motion : 60 minutes avec un opérateur et les instruments VALD, à Monaco et à Cannes. Non médical, sans diagnostic.',
  en: 'KŌMØ Motion functional movement assessment: 60 minutes with an operator and VALD instruments, in Monaco and Cannes. Non-medical, no diagnosis.',
  es: 'Evaluación funcional del movimiento KŌMØ Motion: 60 minutos con un operador e instrumentos VALD, en Mónaco y Cannes. No médica, sin diagnóstico.'
};
const TITLES = {
  fr: 'KŌMØ Longevity — Bilan Motion à Monaco et à Cannes',
  en: 'KŌMØ Longevity — Motion assessment in Monaco and Cannes',
  es: 'KŌMØ Longevity — Evaluación Motion en Mónaco y Cannes'
};
const MOTION_AGE_REWRITES = [
  ['Motion Score, Motion Age et suivi longitudinal', 'Mesures et suivi longitudinal'],
  ['Votre profil rassemble les résultats du bilan, Motion Score, Motion Age, les principaux paramètres fonctionnels', 'Votre profil rassemble les résultats du bilan, les principaux paramètres fonctionnels'],
  ['Motion Score &amp; Motion Age', 'Repères de suivi'],
  ['Motion Score & Motion Age', 'Repères de suivi'],
  ['Motion Score et Motion Age sont des repères propriétaires KŌMØ et ne constituent pas un diagnostic médical.', 'Les résultats sont des mesures fonctionnelles et ne constituent pas un diagnostic médical.'],
  ['Motion Score and Motion Age are proprietary KŌMØ references and do not constitute a medical diagnosis.', 'Results are functional measurements and do not constitute a medical diagnosis.'],
  ['Motion Score y Motion Age son referencias propietarias KŌMØ y no constituyen un diagnóstico médico.', 'Los resultados son mediciones funcionales y no constituyen un diagnóstico médico.']
];
const LANG_REWRITE = { en: [['Repères de suivi', 'Follow-up markers']], es: [['Repères de suivi', 'Referencias de seguimiento']] };

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}
// Supprime un élément complet à partir de son ouverture, en équilibrant les balises de même nom.
function removeElementAt(html, start, tag) {
  const re = new RegExp(`<${tag}\\b|</${tag}>`, 'gi');
  re.lastIndex = start;
  let depth = 0, m;
  while ((m = re.exec(html))) {
    depth += m[0].startsWith('</') ? -1 : 1;
    if (depth === 0) return html.slice(0, start) + html.slice(m.index + m[0].length);
  }
  return html;
}
function removeMatching(html, tag, attrTest) {
  const open = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
  let m, guard = 0;
  while ((m = open.exec(html)) && guard++ < 200) {
    if (attrTest(m[0])) { html = removeElementAt(html, m.index, tag); open.lastIndex = m.index; }
  }
  return html;
}
function langOf(rel) { return rel.startsWith('fr/') ? 'fr' : rel.startsWith('es/') ? 'es' : rel.startsWith('en/') ? 'en' : 'root'; }

let changedFiles = 0;
for (const file of walk(SITE)) {
  const rel = path.relative(SITE, file).split(path.sep).join('/');
  if (SKIP.has(rel)) continue;
  let html = fs.readFileSync(file, 'utf8');
  const before = html;
  for (const id of REMOVED_SECTION_IDS)
    html = removeMatching(html, 'section', t => t.includes(`id="${id}"`));
  for (const cls of REMOVED_ARTICLE_CLASSES)
    html = removeMatching(html, 'article', t => new RegExp(`class="[^"]*\\b${cls}\\b`).test(t));
  // Parcours « payer sur Stripe puis activer Pulse » propre à l'offre Online.
  html = removeMatching(html, 'div', t => /class="ko-flow"/.test(t));
  html = removeMatching(html, 'a', t => ONLINE_HREF.test(t));
  // Descriptions SEO qui annonçaient l'offre Online.
  const lang = langOf(rel);
  const meta = META[lang === 'root' ? (/<html[^>]+lang="fr/.test(html) ? 'fr' : 'en') : lang];
  html = html.replace(/(<meta (?:name="description"|property="og:description"|name="twitter:description") content=")([^"]*)(")/g,
    (all, a, content, b) => /39\s*€|€\s*39|Online|en ligne|en línea/i.test(content) ? a + meta + b : all);
  const ONLINE_WORDS = /39\s*€|€\s*39|online|en ligne|en línea/i;
  const title = TITLES[lang === 'root' ? (/<html[^>]+lang="fr/.test(html) ? 'fr' : 'en') : lang];
  html = html.replace(/<title>([^<]*)<\/title>/, (all, t) => ONLINE_WORDS.test(t) ? `<title>${title}</title>` : all);
  html = html.replace(/(<meta (?:property="og:title"|name="twitter:title") content=")([^"]*)(")/g,
    (all, a, t, b) => ONLINE_WORDS.test(t) ? a + title + b : all);
  // Motion Age : retiré tant qu'aucune formule n'est validée.
  for (const [from, to] of MOTION_AGE_REWRITES) html = html.split(from).join(to);
  for (const [from, to] of (LANG_REWRITE[lang] || LANG_REWRITE[rel.startsWith('motion/') ? 'en' : ''] || [])) html = html.split(from).join(to);
  if (html !== before) { fs.writeFileSync(file, html); changedFiles++; }
}

// Contrôle : aucune trace publique de l'offre Online ni du Motion Age sur les pages vitrine.
const problems = [];
for (const file of walk(SITE)) {
  const rel = path.relative(SITE, file).split(path.sep).join('/');
  if (SKIP.has(rel) || rel.startsWith('pulse') || rel.startsWith('world') || rel.startsWith('life-v1') ||
      rel.startsWith('command-v1') || rel.startsWith('elysium') || rel.startsWith('assets/')) continue;
  const html = fs.readFileSync(file, 'utf8');
  if (/buy\.stripe\.com/.test(html)) problems.push(rel + ' : lien Stripe');
  if (ONLINE_HREF.test(html)) problems.push(rel + ' : lien vers l’offre Online');
  if (/Motion Age/.test(html)) problems.push(rel + ' : Motion Age');
  if (/id="motion-online-(39|explained)"/.test(html)) problems.push(rel + ' : bloc Online');
  if (/Je règle 39|Motion Online est un bilan autonome/.test(html)) problems.push(rel + ' : parcours Online');
  if (/<title>[^<]*(online|en ligne|en línea)/i.test(html)) problems.push(rel + ' : titre Online');
}
if (problems.length) {
  console.error('[retire-online] ÉCHEC\n  ' + problems.slice(0, 30).join('\n  '));
  process.exit(1);
}
console.log(`[retire-online] PASS · offre Online et Motion Age retirés · ${changedFiles} pages modifiées`);
