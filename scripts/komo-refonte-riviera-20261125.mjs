// 25/11/2026 — Refonte du site public KŌMØ Motion : Monaco (Clinique HIRO) et Cannes (Maison Epigenetic).
// Toute dernière passe du build : remplace les accueils (/, /fr/, /en/, /es/) et ajoute la réservation
// et les pages lieux, générées depuis src/refonte-2026/. Aucune autre page n'est modifiée.
// Contrôles : un seul h1, aucun terme retiré, liens internes valides, JSON-LD valide, ressources présentes.
import { mkdir, readFile, writeFile, copyFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');
const src = join(root, 'src', 'refonte-2026');
const { allPages } = await import(pathToFileURL(join(src, 'site.mjs')).href);
const { ROUTES, LANGS, ORIGIN } = await import(pathToFileURL(join(src, 'content.mjs')).href);

// 1. Ressources
const assets = join(site, 'assets', 'refonte');
await mkdir(join(assets, 'fonts'), { recursive: true });
for (const f of ['refonte.css', 'refonte.js', 'booking.js', 'og-komo-motion.jpg']) await copyFile(join(src, f), join(assets, f));
for (const f of await readdir(join(src, 'fonts'))) await copyFile(join(src, 'fonts', f), join(assets, 'fonts', f));

// 2. Pages
const pages = allPages();
for (const [rel, html] of Object.entries(pages)) {
  const file = join(site, rel);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html, 'utf8');
}

// 3. Plan du site : ajoute les nouvelles adresses.
const sitemapPath = join(site, 'sitemap.xml');
if (existsSync(sitemapPath)) {
  let xml = await readFile(sitemapPath, 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  const add = [];
  for (const l of LANGS) for (const k of ['book', 'monaco', 'cannes']) {
    const loc = `${ORIGIN}${ROUTES[l][k]}`;
    if (!xml.includes(`<loc>${loc}</loc>`)) add.push(`<url><loc>${loc}</loc><lastmod>${today}</lastmod></url>`);
  }
  // Pages désormais redirigées vers l'accueil ou la réservation (voir vercel.json).
  const before = xml;
  for (const gone of ['/fr/motion/', '/motion/', '/es/motion/', '/fr/reserver-motion-cannes/', '/motion-cannes/', '/partners/motion/', '/fr/partners/motion/', '/es/partners/motion/'])
    xml = xml.replace(new RegExp(`\\s*<url>(?:(?!</url>)[\\s\\S])*?<loc>${ORIGIN.replace(/\./g, '\\.')}${gone}</loc>[\\s\\S]*?</url>`, 'g'), '');
  if (add.length) xml = xml.replace('</urlset>', add.join('\n') + '\n</urlset>');
  if (add.length || xml !== before) await writeFile(sitemapPath, xml, 'utf8');
}

// 4. Contrôles
const fail = [];
const FORBIDDEN = [/Motion Age/, /Motion Score/, /200\s?€|€\s?200\b/, /39\s?€|€\s?39\b/, /buy\.stripe\.com/, /reserver-motion-cannes/, /150\+/, /119 param/];
const resolves = (href) => {
  const clean = decodeURIComponent(href.split('#')[0].split('?')[0]);
  if (!clean || clean === '/') return existsSync(join(site, 'index.html'));
  const p = join(site, clean);
  if (existsSync(p) && !clean.endsWith('/')) return true;
  return existsSync(join(p, 'index.html')) || existsSync(p + '.html');
};
for (const [rel, html] of Object.entries(pages)) {
  const h1 = (html.match(/<h1\b/g) || []).length;
  if (h1 !== 1) fail.push(`${rel} : ${h1} h1`);
  for (const re of FORBIDDEN) if (re.test(html)) fail.push(`${rel} : terme retiré ${re}`);
  if (!/<html lang="(fr|en|es)"/.test(html)) fail.push(`${rel} : langue absente`);
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch (e) { fail.push(`${rel} : JSON-LD invalide`); } }
  for (const m of html.matchAll(/<script type="application\/json" id="k-i18n">([\s\S]*?)<\/script>/g)) { try { JSON.parse(m[1]); } catch (e) { fail.push(`${rel} : i18n invalide`); } }
  for (const m of html.matchAll(/\b(?:href|src)="(\/[^"]*)"/g)) if (!resolves(m[1])) fail.push(`${rel} : lien interne introuvable ${m[1]}`);
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) fail.push(`${rel} : id en double ${[...new Set(dup)].join(', ')}`);
  for (const m of html.matchAll(/href="#([^"]+)"/g)) if (!ids.includes(m[1])) fail.push(`${rel} : ancre introuvable #${m[1]}`);
}
for (const l of LANGS) {
  const homeHtml = pages[`${l}/index.html`];
  for (const must of ['id="bilan"', 'id="deroule"', 'id="adresses"', 'id="tarifs"', 'id="questions"', 'Clinique HIRO', 'Maison Epigenetic', ROUTES[l].book, ROUTES[l].monaco, ROUTES[l].cannes])
    if (!homeHtml.includes(must)) fail.push(`${l}/index.html : manque ${must}`);
  if (!/300/.test(homeHtml) || !/120/.test(homeHtml)) fail.push(`${l}/index.html : tarifs absents`);
}
for (const f of ['refonte.css', 'refonte.js', 'booking.js', 'og-komo-motion.jpg', 'fonts/manrope-latin-wght-normal.woff2', 'fonts/cormorant-garamond-latin-500-normal.woff2'])
  if (!existsSync(join(assets, f)) || (await stat(join(assets, f))).size < 1000) fail.push(`ressource manquante ${f}`);

if (fail.length) {
  console.error('[refonte-riviera] ÉCHEC\n  ' + [...new Set(fail)].slice(0, 40).join('\n  '));
  process.exit(1);
}
console.log(`[refonte-riviera] PASS · ${Object.keys(pages).length} pages (accueil, réservation, Monaco, Cannes en FR/EN/ES) · liens internes et ancres vérifiés`);
