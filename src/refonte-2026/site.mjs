// KŌMØ Motion — gabarits de la refonte. Génère toutes les pages (FR, EN, ES) à partir de content.mjs.
import { T, ROUTES, LANGS, LOCALE, ORIGIN, EMAIL, PULSE_URL, PRICES, DURATIONS, MAPS_CANNES } from './content.mjs';

export const ASSET_VERSION = '20261125a';
const A = (p) => `/assets/refonte/${p}?v=${ASSET_VERSION}`;
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const money = (lang, n) => (lang === 'en' ? `€${n}` : `${n}\u00A0€`);

// ── Générateurs déterministes (tracés d'illustration) ────────────────────────────────────────────
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }
function gauss(r) { let u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
function swayPoints(seed, n, amp) {
  // Processus d'Ornstein-Uhlenbeck 2D : ressemble au déplacement du centre de pression en station debout.
  const r = rng(seed); let x = 0, y = 0, vx = 0, vy = 0; const pts = [];
  for (let i = 0; i < n; i++) {
    vx = vx * 0.86 - x * 0.045 + gauss(r) * 0.55; vy = vy * 0.86 - y * 0.03 + gauss(r) * 0.75;
    x += vx * 0.35; y += vy * 0.35; pts.push([x, y]);
  }
  const m = Math.max(...pts.map(([a, b]) => Math.hypot(a, b))) || 1;
  return pts.map(([a, b]) => [a / m * amp, b / m * amp]);
}
function catmull(pts, close = false) {
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return close ? d + 'Z' : d;
}
function polyLen(pts) { let l = 0; for (let i = 1; i < pts.length; i++) l += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return Math.ceil(l * 1.08); }

function swaySvg(seed, amp, label, value, unit) {
  const pts = swayPoints(seed, 360, amp).map(([x, y]) => [100 + x, 100 + y]);
  return `<figure><svg viewBox="0 0 200 200" aria-hidden="true"><line class="cross" x1="100" y1="16" x2="100" y2="184"/><line class="cross" x1="16" y1="100" x2="184" y2="100"/><circle cx="100" cy="100" r="84" fill="none" stroke="#DCE2E0"/><path d="${catmull(pts)}" style="--len:${polyLen(pts)}"/></svg><figcaption><b class="k-num">${esc(value)}&nbsp;${esc(unit)}</b>${esc(label)}</figcaption></figure>`;
}

const COAST = [[0,236],[60,232],[105,226],[128,224],[150,240],[172,226],[215,214],[262,212],[300,218],[330,236],[352,244],[366,226],[360,204],[352,190],[358,160],[372,132],[400,112],[460,108],[520,110],[575,100],[630,86],[668,76],[690,82],[702,76],[722,62],[740,70],[752,92],[764,96],[772,74],[790,58],[830,48],[870,50],[900,52],[925,40],[945,34],[1000,24]];
function coastSvg(t, highlight = '', light = false) {
  const d = catmull(COAST);
  const dim = (c) => (highlight && highlight !== c ? ' is-dim' : '');
  const lab = (c) => (highlight && highlight !== c ? ' class="faint"' : '');
  return `<div class="k-coast${light ? ' is-light' : ''}" data-reveal><svg viewBox="0 0 1000 300" role="img" aria-label="${esc(t.venues.cannes.city)} — ${esc(t.venues.monaco.city)}">
<path class="shore" d="${d}" style="--len:${polyLen(COAST) + 40}"/>
<text class="sea-label" x="560" y="250" text-anchor="middle">${esc(t.venues.sea)}</text>
<circle class="dot is-dim" cx="630" cy="86" r="3.5"/><text class="faint" x="630" y="118" text-anchor="middle">${esc(t.venues.nice)}</text>
<circle class="halo" cx="150" cy="240" r="6"/><circle class="dot${dim('cannes')}" cx="150" cy="240" r="6.5"/><text${lab('cannes')} x="150" y="280" text-anchor="middle">${esc(t.venues.cannes.city)}</text>
<circle class="halo" cx="945" cy="34" r="6"/><circle class="dot${dim('monaco')}" cx="945" cy="34" r="6.5"/><text${lab('monaco')} x="945" y="74" text-anchor="middle">${esc(t.venues.monaco.city)}</text>
</svg></div>`;
}

function curveSvg(t, uid = 'a') {
  const c = t.measures.curve;
  const P = [[0,170],[70,170],[95,176],[118,214],[138,196],[160,92],[188,44],[208,70],[226,58],[246,150],[258,250],[380,250],[388,250],[396,14],[410,120],[424,196],[440,158],[458,176],[480,168],[520,170],[600,170]];
  const d = catmull(P);
  const area = catmull(P.slice(4, 11)) + 'L258,250L138,250Z';
  return `<div class="k-curve"><svg viewBox="0 0 600 290" aria-hidden="true"><defs><linearGradient id="k-brass-fade-${uid}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#B08A4E" stop-opacity=".35"/><stop offset="1" stop-color="#B08A4E" stop-opacity="0"/></linearGradient></defs>
<line class="axis" x1="0" y1="250" x2="600" y2="250"/><line class="base" x1="0" y1="170" x2="600" y2="170"/>
<path class="area" d="${area}" fill="url(#k-brass-fade-${uid})"/><path class="line" d="${d}" style="--len:${polyLen(P) + 120}"/>
<text class="tag" x="112" y="236" text-anchor="middle">${esc(c.dip)}</text><text class="tag" x="188" y="30" text-anchor="middle">${esc(c.push)}</text><text class="tag" x="320" y="238" text-anchor="middle">${esc(c.flight)}</text><text class="tag" x="440" y="14">${esc(c.land)}</text>
<text x="0" y="276">${esc(c.time)}</text><text x="600" y="276" text-anchor="end">${esc(c.force)}&#8202;/&#8202;${esc(c.time).toLowerCase()}</text></svg></div>`;
}

function trajSvg(t) {
  const xs = [90, 300, 510], vals = [13, 15, 17], y = (v) => 250 - (v - 8) * 18;
  const pts = xs.map((x, i) => [x, y(vals[i])]);
  const d = `M${pts.map((p) => p.join(',')).join('L')}`;
  const len = Math.ceil(polyLen(pts));
  return `<div class="k-traj" data-reveal><svg viewBox="0 0 600 300" role="img" aria-label="${esc(t.trajectory.metric)}: ${vals.join(', ')}">
<rect class="band" x="40" y="${y(15)}" width="520" height="${y(11) - y(15)}" rx="8"/>
<line class="grid" x1="40" y1="250" x2="560" y2="250"/>
<path class="line" d="${d}" style="--len:${len}"/>
${pts.map(([x, yy], i) => `<circle class="pt" cx="${x}" cy="${yy}" r="7"/><text class="val k-num" x="${x}" y="${yy - 20}" text-anchor="middle">${vals[i]}</text><text x="${x}" y="280" text-anchor="middle">${esc(t.trajectory.points[i])}</text>`).join('')}
</svg><div class="k-traj__legend"><span>${esc(t.trajectory.metric)}</span><span><i></i>${esc(t.trajectory.band)}</span></div></div>`;
}

// ── Gabarits communs ─────────────────────────────────────────────────────────────────────────────
function head(lang, { title, desc, path, alt, canonical, ld }) {
  const t = T[lang];
  const alts = alt ? Object.entries(alt).map(([l, p]) => `<link rel="alternate" hreflang="${l}" href="${ORIGIN}${p}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${ORIGIN}${alt.fr}">` : '';
  return `<!doctype html>
<html lang="${lang}" class="no-js">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${ORIGIN}${canonical || path}">
${alts}
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="theme-color" content="#0E2730">
<meta property="og:type" content="website">
<meta property="og:site_name" content="KŌMØ Longevity">
<meta property="og:locale" content="${LOCALE[lang]}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${ORIGIN}${canonical || path}">
<meta property="og:image" content="${ORIGIN}/assets/refonte/og-komo-motion.jpg">
<meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="${ORIGIN}/assets/refonte/og-komo-motion.jpg">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/refonte/fonts/manrope-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/refonte/fonts/cormorant-garamond-latin-500-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${A('refonte.css')}">
<script>document.documentElement.classList.replace('no-js','js')</script>
${ld ? `<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>` : ''}
<meta name="komo-refonte" content="${ASSET_VERSION}">
</head>`;
}

function header(lang, page, alt) {
  const t = T[lang], R = ROUTES[lang];
  const h = page === 'home' ? '' : R.home;
  const links = [['bilan', t.nav.bilan], ['deroule', t.nav.deroule], ['adresses', t.nav.adresses], ['tarifs', t.nav.tarifs], ['questions', t.nav.questions]];
  const langs = LANGS.map((l) => `<a href="${alt[l]}" hreflang="${l}" lang="${l}"${l === lang ? ' aria-current="true"' : ''}>${l.toUpperCase()}</a>`).join('');
  const dark = page === 'home' ? ' is-dark' : '';
  return `<a class="k-skip" href="#contenu">${esc(t.skip)}</a>
<header class="k-header${dark}" data-header>
 <div class="k-wrap k-header__in">
  <a class="k-logo" href="${R.home}" aria-label="KŌMØ Longevity">KŌMØ <small>Motion</small></a>
  <nav class="k-nav" aria-label="${esc(t.menu)}">${links.map(([id, label]) => `<a href="${h}#${id}">${esc(label)}</a>`).join('')}</nav>
  <div class="k-header__tools">
   <div class="k-lang" aria-label="Langue / Language / Idioma">${langs}</div>
   <a class="k-space" href="${PULSE_URL}">${esc(t.space)}</a>
   <a class="k-btn k-btn--ink" href="${R.book}"><span>${esc(t.book)}</span></a>
   <button class="k-menu-btn" type="button" aria-expanded="false" aria-controls="k-sheet" data-menu><span class="k-sr">${esc(t.menu)}</span><i></i><i></i></button>
  </div>
 </div>
</header>
<div class="k-sheet" id="k-sheet" data-sheet hidden>
 ${links.map(([id, label]) => `<a class="k-sheet__big" href="${h}#${id}">${esc(label)}</a>`).join('')}
 <div class="k-sheet__foot">
  <a class="k-btn k-btn--ink" href="${R.book}">${esc(t.book)}</a>
  <div class="k-sheet__row"><a class="k-link" href="${PULSE_URL}">${esc(t.space)}</a><div class="k-lang">${langs}</div></div>
 </div>
</div>`;
}

function footer(lang) {
  const t = T[lang], f = t.footer, R = ROUTES[lang];
  return `<footer class="k-footer">
 <div class="k-wrap">
  <div class="k-footer__top">
   <div class="k-footer__brand"><a class="k-logo" href="${R.home}">KŌMØ <small>Motion</small></a><p>${esc(f.tagline)}</p></div>
   <div><h2>${esc(f.colBilan)}</h2><ul><li><a href="${R.home}#bilan">${esc(f.measures)}</a></li><li><a href="${R.home}#deroule">${esc(f.timeline)}</a></li><li><a href="${R.home}#tarifs">${esc(f.prices)}</a></li><li><a href="${R.book}">${esc(f.book)}</a></li></ul></div>
   <div><h2>${esc(f.colPlaces)}</h2><ul><li><a href="${R.monaco}">${esc(t.venues.monaco.city)}</a></li><li><a href="${R.cannes}">${esc(t.venues.cannes.city)}</a></li></ul></div>
   <div><h2>${esc(f.colKomo)}</h2><ul><li><a href="${PULSE_URL}">${esc(f.pulse)}</a></li><li><a href="/${lang}/partners/">${esc(f.pros)}</a></li><li><a href="/${lang}/contact/">${esc(f.contact)}</a></li><li><a href="mailto:${EMAIL}">${EMAIL}</a></li></ul></div>
   <div><h2>${esc(f.colInfo)}</h2><ul><li><a href="/${lang}/legal/">${esc(f.legal)}</a></li><li><a href="/${lang}/privacy/">${esc(f.privacy)}</a></li><li><a href="/${lang}/cookies/">${esc(f.cookies)}</a></li><li><a href="/${lang}/terms/">${esc(f.terms)}</a></li><li><a href="/${lang}/medical-information/">${esc(f.medical)}</a></li><li><a href="/${lang}/cgv/">${esc(f.cgv)}</a></li></ul></div>
  </div>
  <div class="k-footer__bottom"><p>${esc(f.company)} ${esc(f.disclaimer)}</p><p>© 2026 KŌMØ</p></div>
 </div>
</footer>`;
}

function page(lang, opts, body, scripts = ['refonte.js']) {
  return `${head(lang, opts)}
<body>
${header(lang, opts.page, opts.alt)}
<main id="contenu">
${body}
</main>
${footer(lang)}
${scripts.map((s) => `<script src="${A(s)}" defer></script>`).join('\n')}
</body>
</html>
`;
}

const altFor = (key) => Object.fromEntries(LANGS.map((l) => [l, ROUTES[l][key]]));

// ── Accueil ──────────────────────────────────────────────────────────────────────────────────────
function measureVisual(t, key, uid = 'a') {
  const m = t.measures;
  if (key === 'force') {
    const max = 320;
    return `<div class="k-vis__label"><span>VALD DynaMo</span><span>${esc(m.forceUnit)}</span></div>
<div class="k-bars">${m.force.map(([name, l, r]) => `<div class="k-bar"><div class="k-bar__name">${esc(name)}<span class="k-num">${l} / ${r}</span></div><div class="k-bar__pair"><i style="--w:${(l / max).toFixed(3)}"></i><i style="--w:${(r / max).toFixed(3)}"></i></div></div>`).join('')}</div>
<div class="k-legend"><span><i></i>${esc(m.left)}</span><span><i></i>${esc(m.right)}</span></div>`;
  }
  if (key === 'balance') {
    return `<div class="k-vis__label"><span>VALD ForceDecks</span><span>30&nbsp;s</span></div>
<div class="k-sway">${swaySvg(7, 30, m.eyesOpen, '9', m.swayUnit)}${swaySvg(23, 64, m.eyesClosed, '17', m.swayUnit)}</div>`;
  }
  if (key === 'power') {
    return `<div class="k-vis__label"><span>VALD ForceDecks</span><span>${esc(m.curve.force)}</span></div>${curveSvg(t, uid)}
<div class="k-stat"><div><b class="k-num">27&nbsp;cm</b>${esc(m.curve.height)}</div><div><b class="k-num">16</b>${esc(m.curve.chairs)}</div></div>`;
  }
  const speed = t === T.en ? '1.24' : '1,24';
  return `<div class="k-vis__label"><span>4&nbsp;${esc(m.m)}</span><span>${esc(m.gaitUnit)}</span></div>
<div class="k-walk"><div class="k-walk__track"><div class="k-walk__steps">${Array.from({ length: 7 }, (_, i) => `<i style="left:${(4 + i * 14.6).toFixed(1)}%;transition-delay:${(0.25 + i * 0.32).toFixed(2)}s"></i>`).join('')}</div><div class="k-walk__line"></div><div class="k-walk__ticks">${[0, 1, 2, 3, 4].map((n) => `<span><b>${n}&nbsp;${esc(m.m)}</b></span>`).join('')}</div></div>
<div class="k-walk__result"><b class="k-num">${speed}</b><span>${esc(m.gaitUnit)}<br>${esc(m.gaitLabel)}</span></div></div>`;
}

export function home(lang, path) {
  const t = T[lang], R = ROUTES[lang];
  const words = t.statement.split(' ').map((w) => `<span class="w">${esc(w)}</span>`).join(' ');
  const ld = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': `${ORIGIN}/#org`, name: 'KŌMØ', url: `${ORIGIN}/`, email: EMAIL, logo: `${ORIGIN}/assets/favicon.svg`,
        address: { '@type': 'PostalAddress', streetAddress: '45 boulevard de la Croisette', postalCode: '06400', addressLocality: 'Cannes', addressCountry: 'FR' } },
      { '@type': 'Service', name: 'KŌMØ Motion', description: t.meta.homeDesc, provider: { '@id': `${ORIGIN}/#org` }, areaServed: ['Monaco', 'Cannes'],
        offers: t.prices.items.map((p) => ({ '@type': 'Offer', name: p.name, price: String(PRICES[p.key]), priceCurrency: 'EUR', url: `${ORIGIN}${R.book}` })) },
      { '@type': 'Place', name: 'Maison Epigenetic — KŌMØ Motion Cannes', address: { '@type': 'PostalAddress', streetAddress: 'Place Franklin Roosevelt', postalCode: '06400', addressLocality: 'Cannes', addressCountry: 'FR' } },
      { '@type': 'Place', name: 'Clinique HIRO — KŌMØ Motion Monaco', address: { '@type': 'PostalAddress', postalCode: '06240', addressLocality: 'Beausoleil', addressCountry: 'FR' } },
      { '@type': 'FAQPage', mainEntity: t.faq.items.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) }
    ]
  };
  const v = t.venues;
  const body = `
<section class="k-hero" data-hero aria-labelledby="k-hero-title">
 <h1 class="k-h1" id="k-hero-title" data-in="1">${esc(t.hero.title)}</h1>
 <p class="k-hero__lead" data-in="2">${esc(t.hero.lead)}</p>
 <div class="k-hero__cta" data-in="3"><a class="k-btn k-btn--light" href="${R.book}">${esc(t.hero.cta)}</a><a class="k-link" href="#deroule">${esc(t.hero.more)}</a></div>
 <div class="k-instrument" data-in="4">
  <svg viewBox="0 0 400 400" aria-hidden="true"><circle class="k-instrument__ring" cx="200" cy="200" r="196"/><circle class="k-instrument__ring" cx="200" cy="200" r="130"/><circle class="k-instrument__ring" cx="200" cy="200" r="64"/>
   ${Array.from({ length: 72 }, (_, i) => { const a = i / 72 * Math.PI * 2, r1 = i % 6 ? 190 : 184; return `<line class="k-instrument__tick" x1="${(200 + Math.cos(a) * r1).toFixed(1)}" y1="${(200 + Math.sin(a) * r1).toFixed(1)}" x2="${(200 + Math.cos(a) * 196).toFixed(1)}" y2="${(200 + Math.sin(a) * 196).toFixed(1)}"/>`; }).join('')}
  </svg>
  <canvas data-trace role="img" aria-label="${esc(t.hero.canvasLabel)}"></canvas>
  <div class="k-readout" aria-hidden="true"><span><b data-r="t">0,0&nbsp;s</b>${esc(t.hero.time)}</span><span><b data-r="a">0&nbsp;mm</b>${esc(t.hero.sway)}</span><span><b data-r="v">0&nbsp;mm/s</b>${esc(t.hero.speed)}</span></div>
 </div>
 <p class="k-hero__caption">${esc(t.hero.caption)} <em>${esc(t.hero.illus)}</em></p>
</section>

<section class="k-section" aria-label="KŌMØ Motion">
 <div class="k-wrap"><p class="k-statement" data-statement>${words}</p></div>
</section>

<figure class="k-photo" data-reveal>
 <img src="/assets/images/hero-mediterranean-motion-v1.webp" alt="${esc(t.photo.alt)}" width="1672" height="941" loading="lazy" decoding="async">
 <figcaption>${esc(t.photo.caption)}</figcaption>
</figure>

<section class="k-section" id="bilan" aria-labelledby="k-measures-title">
 <div class="k-wrap">
  <div class="k-measures__head"><span class="k-measures__14" aria-hidden="true">14</span><div class="k-head" style="margin:0"><h2 class="k-h2" id="k-measures-title"><span class="k-sr">14 </span>${esc(t.measures.title)}</h2><p class="k-lead">${esc(t.measures.lead)}</p></div></div>
  <div class="k-measures__grid">
   <div class="k-panels">
    ${t.measures.panels.map((p, i) => `<article class="k-panel" data-panel="${i}"><div class="k-panel__vis" aria-hidden="true"><div class="k-vis" data-vis-inline>${measureVisual(t, p.key, 'i')}</div></div><span class="k-panel__n" aria-hidden="true">${i + 1}</span><h3 class="k-h3">${esc(p.title)}</h3><p class="k-body">${esc(p.body)}</p><p class="k-panel__meta">${esc(p.meta)}</p></article>`).join('\n    ')}
   </div>
   <div class="k-stage" data-stage aria-hidden="true">
    ${t.measures.panels.map((p, i) => `<div class="k-vis${i === 0 ? ' is-on' : ''}" data-vis="${i}">${measureVisual(t, p.key, 's')}</div>`).join('\n    ')}
   </div>
  </div>
  <p class="k-small k-measures__foot">${esc(t.measures.foot)}</p>
 </div>
</section>

<section class="k-section k-white" id="deroule" aria-labelledby="k-timeline-title">
 <div class="k-wrap">
  <div class="k-head"><h2 class="k-h2" id="k-timeline-title">${esc(t.timeline.title)}</h2><p class="k-lead">${esc(t.timeline.lead)}</p></div>
  <div class="k-timeline" data-reveal aria-hidden="true"><div class="k-tbar"><i></i><i></i><i></i></div><div class="k-tscale"><span>${t.timeline.scale[0]}</span><span>${t.timeline.scale[1]}</span><span><span>${t.timeline.scale[2]}</span><span>${t.timeline.scale[3]}</span></span></div></div>
  <ol class="k-steps">${t.timeline.steps.map((s, i) => `<li class="k-step"><span class="k-step__n" aria-hidden="true">${i + 1}</span><div class="k-step__t"><h3 class="k-h3">${esc(s.t)}</h3><span>${esc(s.d)}</span></div><p class="k-body">${esc(s.b)}</p></li>`).join('')}</ol>
 </div>
</section>

<section class="k-section" aria-labelledby="k-passport-title">
 <div class="k-wrap k-split">
  <div>
   <h2 class="k-h2" id="k-passport-title">${esc(t.passport.title)}</h2>
   <p class="k-lead" style="margin-top:22px">${esc(t.passport.body)}</p>
   <ul class="k-list">${t.passport.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
   <p class="k-small" style="margin-top:28px;max-width:30em">${esc(t.passport.note)}</p>
  </div>
  <div class="k-passport" aria-label="${esc(t.passport.card.title)} — ${esc(t.passport.card.fake)}">
   <div class="k-passport__top"><div><strong>${esc(t.passport.card.title)}</strong><span>${esc(t.passport.card.sub)}</span></div><span class="k-passport__seal" aria-hidden="true">KŌMØ</span></div>
   ${t.passport.card.rows.map(([name, a, b, unit]) => {
     const isPair = a !== '';
     return `<div class="k-prow"><span>${esc(name)}</span>${isPair ? `<b><small>${esc(a.split(' ')[0])}</small>${esc(a.split(' ')[1])}</b><b><small>${esc(unit)}</small>${esc(b)}</b>` : `<span></span><b class="k-num">${esc(b)}${unit ? `<small style="margin:0 0 0 4px">${esc(unit)}</small>` : ''}</b>`}</div>`;
   }).join('')}
   <ol class="k-prio" aria-label="${esc(t.passport.card.prio)}">${t.passport.card.prios.map((p) => `<li>${esc(p)}</li>`).join('')}</ol>
   <div class="k-passport__foot"><span>KŌMØ Motion</span><span>${esc(t.passport.card.fake)}</span></div>
  </div>
 </div>
</section>

<section class="k-section k-white" aria-labelledby="k-traj-title">
 <div class="k-wrap k-split">
  <div><h2 class="k-h2" id="k-traj-title">${esc(t.trajectory.title)}</h2><p class="k-lead" style="margin-top:22px">${esc(t.trajectory.body)}</p></div>
  ${trajSvg(t)}
 </div>
</section>

<section class="k-section k-dark" id="adresses" aria-labelledby="k-venues-title">
 <div class="k-wrap">
  <div class="k-head" style="margin-bottom:0"><h2 class="k-h2" id="k-venues-title">${esc(v.title)}</h2><p class="k-lead">${esc(v.lead)}</p></div>
  ${coastSvg(t)}
  <div class="k-venues">
   ${['monaco', 'cannes'].map((k) => { const x = v[k]; return `<article class="k-venue"><h3 class="k-venue__city">${esc(x.city)}</h3><div class="k-venue__name">${esc(x.name)}</div><p class="k-venue__place">${esc(x.place)} ${esc(x.detail)}</p><div class="k-venue__actions"><a class="k-btn k-btn--light" href="${R.book}?lieu=${k}">${esc(x.cta)}</a><a class="k-link" href="${R[k]}">${esc(x.more)}</a>${k === 'cannes' ? `<a class="k-link" href="${MAPS_CANNES}" rel="noopener" target="_blank">${esc(x.maps)}</a>` : ''}</div></article>`; }).join('\n   ')}
  </div>
  <p class="k-venues__note">${esc(v.note)}</p>
 </div>
</section>

<section class="k-section" id="tarifs" aria-labelledby="k-prices-title">
 <div class="k-wrap">
  <div class="k-head"><h2 class="k-h2" id="k-prices-title">${esc(t.prices.title)}</h2></div>
  <div class="k-prices">${t.prices.items.map((p) => `<div class="k-price"><div class="k-price__name">${esc(p.name)}<span>${esc(p.dur)}</span></div><div class="k-price__amount k-num">${money(lang, PRICES[p.key])}</div><p class="k-price__what">${esc(p.what)}</p></div>`).join('')}</div>
  <div class="k-prices__foot"><p class="k-body" style="margin:0">${esc(t.prices.note)}</p><a class="k-btn k-btn--ink" href="${R.book}">${esc(t.prices.cta)}</a></div>
 </div>
</section>

<section class="k-section k-white" aria-labelledby="k-founder-title">
 <div class="k-wrap k-founder">
  <h2 class="k-h2" id="k-founder-title">${esc(t.founder.title)}</h2>
  <div class="k-founder__text"><p>${esc(t.founder.p1)}</p><p>${esc(t.founder.p2)}</p><div class="k-founder__sign"><strong>${esc(t.founder.name)}</strong><span>${esc(t.founder.role)}</span></div></div>
 </div>
</section>

<section class="k-section" id="questions" aria-labelledby="k-faq-title">
 <div class="k-wrap">
  <div class="k-head"><h2 class="k-h2" id="k-faq-title">${esc(t.faq.title)}</h2></div>
  <div class="k-faq">${t.faq.items.map(([q, a]) => `<details><summary>${esc(q)}<i aria-hidden="true"></i></summary><div class="k-faq__a"><p>${esc(a)}</p></div></details>`).join('')}</div>
 </div>
</section>

<section class="k-section k-white" aria-labelledby="k-final-title">
 <div class="k-wrap k-final">
  <h2 class="k-h2" id="k-final-title">${esc(t.final.title)}</h2>
  <p class="k-lead">${esc(t.final.lead)}</p>
  <div class="k-final__cta"><a class="k-btn k-btn--ink" href="${R.book}?lieu=monaco">${esc(v.monaco.cta)}</a><a class="k-btn k-btn--ink" href="${R.book}?lieu=cannes">${esc(v.cannes.cta)}</a></div>
 </div>
</section>`;
  return page(lang, { page: 'home', title: t.meta.homeTitle, desc: t.meta.homeDesc, path, canonical: lang === 'fr' ? '/' : R.home, alt: { fr: '/', en: ROUTES.en.home, es: ROUTES.es.home }, ld }, body);
}

// ── Pages lieux ──────────────────────────────────────────────────────────────────────────────────
export function city(lang, which) {
  const t = T[lang], R = ROUTES[lang], c = t.city, x = c[which], v = t.venues[which];
  const other = which === 'monaco' ? 'cannes' : 'monaco';
  const facts = c.facts.map(([b, s], i) => `<div class="k-fact"><b class="k-num">${esc(i === 2 ? money(lang, PRICES.bilan) : b)}</b><span>${esc(s)}</span></div>`).join('');
  const ld = { '@context': 'https://schema.org', '@type': 'Service', name: `KŌMØ Motion — ${v.city}`, description: t.meta[`${which}Desc`], provider: { '@type': 'Organization', name: 'KŌMØ', url: `${ORIGIN}/` }, areaServed: v.city,
    offers: [{ '@type': 'Offer', price: String(PRICES.bilan), priceCurrency: 'EUR', url: `${ORIGIN}${R.book}?lieu=${which}` }] };
  const body = `
<section class="k-page-hero">
 <div class="k-wrap">
  <h1 class="k-city"><span class="k-sr">${esc(c.titleSr)} </span>${esc(v.city)}</h1>
  <p class="k-city-sub">${esc(x.sub)}</p>
  <div class="k-cta-row"><a class="k-btn k-btn--ink" href="${R.book}?lieu=${which}">${esc(v.cta)}</a>${which === 'cannes' ? `<a class="k-link" href="${MAPS_CANNES}" rel="noopener" target="_blank">${esc(v.maps)}</a>` : ''}</div>
  <div class="k-facts">${facts}</div>
 </div>
</section>
<section class="k-section--tight">
 <div class="k-wrap">${coastSvg(t, which, true)}</div>
</section>
<section class="k-section--tight k-white">
 <div class="k-wrap k-blocks">
  <div class="k-block"><h2 class="k-h3">${esc(x.placeTitle)}</h2><p><strong style="color:var(--ink)">${esc(v.name)}</strong></p><p>${esc(x.place)}</p><p>${esc(x.address)}</p></div>
  <div class="k-block"><h2 class="k-h3">${esc(c.bilanTitle)}</h2><p>${esc(c.bilan)}</p><a class="k-link" href="${R.home}#bilan">${esc(c.bilanLink)}</a></div>
  <div class="k-block"><h2 class="k-h3">${esc(c.comeTitle)}</h2><p>${esc(c.come)}</p><a class="k-link" href="${R.home}#questions">${esc(t.nav.questions)}</a></div>
 </div>
</section>
<section class="k-section--tight">
 <div class="k-wrap">
  <div class="k-prices">${t.prices.items.map((p) => `<div class="k-price"><div class="k-price__name">${esc(p.name)}<span>${esc(p.dur)}</span></div><div class="k-price__amount k-num">${money(lang, PRICES[p.key])}</div><p class="k-price__what">${esc(p.what)}</p></div>`).join('')}</div>
  <div class="k-prices__foot"><p class="k-body" style="margin:0">${esc(t.prices.note)}</p><a class="k-btn k-btn--ink" href="${R.book}?lieu=${which}">${esc(v.cta)}</a></div>
  <div class="k-cross" style="margin-top:clamp(56px,7vw,96px)"><p><strong>${esc(x.crossQ)}</strong> <span class="k-body" style="display:inline">${esc(x.crossA)}</span></p><a class="k-link" href="${R[other]}">${esc(x.crossLink)}</a></div>
 </div>
</section>`;
  return page(lang, { page: which, title: t.meta[`${which}Title`], desc: t.meta[`${which}Desc`], path: R[which], alt: altFor(which), ld }, body);
}

// ── Réservation ──────────────────────────────────────────────────────────────────────────────────
export function booking(lang) {
  const t = T[lang], R = ROUTES[lang], b = t.booking;
  const i18n = {
    lang, email: EMAIL, dateLocale: b.dateLocale, errors: b.errors, mail: b.mail, toChoose: b.toChoose, copied: b.doneCopied, copy: b.doneCopy,
    places: { monaco: { label: b.monaco[0], venue: b.monaco[1] }, cannes: { label: b.cannes[0], venue: b.cannes[1] } },
    services: { bilan: { label: b.bilan[0], minutes: DURATIONS.bilan, price: money(lang, PRICES.bilan) }, controle: { label: b.controle[0], minutes: DURATIONS.controle, price: money(lang, PRICES.controle) } },
    slots: b.slots
  };
  const choice = (name, value, title, sub, extra = '') => `<label class="k-choice"><input type="radio" name="${name}" value="${value}" required><span class="k-choice__box"><strong>${esc(title)}</strong><span>${esc(sub)}</span>${extra}</span></label>`;
  const body = `
<section class="k-page-hero" style="padding-bottom:clamp(32px,4vw,56px)">
 <div class="k-wrap"><h1 class="k-h1" style="font-size:clamp(44px,7vw,96px)">${esc(b.title)}</h1><p class="k-lead" style="margin-top:22px">${esc(b.lead)}</p></div>
</section>
<section style="padding-bottom:clamp(88px,12vw,160px)">
 <div class="k-wrap k-book">
  <div>
   <form class="k-form" data-book novalidate>
    <fieldset class="k-fieldset"><legend><span aria-hidden="true">1</span>${esc(b.s1)}</legend>
     <div class="k-choices">${choice('lieu', 'monaco', b.monaco[0], b.monaco[1])}${choice('lieu', 'cannes', b.cannes[0], b.cannes[1])}</div>
     <p class="k-error" id="err-lieu" role="alert"></p>
    </fieldset>
    <fieldset class="k-fieldset"><legend><span aria-hidden="true">2</span>${esc(b.s2)}</legend>
     <div class="k-choices">${choice('prestation', 'bilan', b.bilan[0], b.bilan[1], `<em class="k-num">${money(lang, PRICES.bilan)}</em>`)}${choice('prestation', 'controle', b.controle[0], b.controle[1], `<em class="k-num">${money(lang, PRICES.controle)}</em>`)}</div>
     <p class="k-error" id="err-prestation" role="alert"></p>
    </fieldset>
    <fieldset class="k-fieldset"><legend><span aria-hidden="true">3</span>${esc(b.s3)}</legend>
     <div class="k-fields">
      <div class="k-field"><label for="f-date1">${esc(b.date1)}</label><input id="f-date1" name="date1" type="date" required aria-describedby="err-date1"><p class="k-error" id="err-date1"></p></div>
      <div class="k-field"><label for="f-date2">${esc(b.date2)} <small>${esc(b.optional)}</small></label><input id="f-date2" name="date2" type="date" aria-describedby="err-date2"><p class="k-error" id="err-date2"></p></div>
      <div class="k-field k-field--full"><label for="f-slot">${esc(b.slot)}</label><select id="f-slot" name="slot">${b.slots.map((s, i) => `<option value="${i}">${esc(s)}</option>`).join('')}</select></div>
     </div>
    </fieldset>
    <fieldset class="k-fieldset"><legend><span aria-hidden="true">4</span>${esc(b.s4)}</legend>
     <div class="k-fields">
      <div class="k-field"><label for="f-first">${esc(b.first)}</label><input id="f-first" name="first" autocomplete="given-name" maxlength="60" required aria-describedby="err-first"><p class="k-error" id="err-first"></p></div>
      <div class="k-field"><label for="f-last">${esc(b.last)}</label><input id="f-last" name="last" autocomplete="family-name" maxlength="60" required aria-describedby="err-last"><p class="k-error" id="err-last"></p></div>
      <div class="k-field"><label for="f-email">${esc(b.email)}</label><input id="f-email" name="email" type="email" autocomplete="email" inputmode="email" maxlength="150" required aria-describedby="err-email"><p class="k-error" id="err-email"></p></div>
      <div class="k-field"><label for="f-phone">${esc(b.phone)} <small>${esc(b.optional)}</small></label><input id="f-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="35"></div>
     </div>
     <label class="k-consent"><input type="checkbox" name="consent" required aria-describedby="err-consent"><span>${esc(b.consent)}</span></label>
     <p class="k-error" id="err-consent"></p>
    </fieldset>
    <div class="k-submit"><button class="k-btn k-btn--ink" type="submit">${esc(b.submit)}</button><p>${esc(b.help)}</p></div>
   </form>
   <div class="k-done" data-done tabindex="-1" aria-live="polite">
    <h2 class="k-h2" style="font-size:clamp(30px,3.6vw,46px)">${esc(b.doneTitle)}</h2>
    <p class="k-lead">${esc(b.doneBody)}</p>
    <pre data-preview></pre>
    <div class="k-done__actions"><a class="k-btn k-btn--ink" data-mailto href="mailto:${EMAIL}">${esc(b.doneOpen)}</a><button class="k-btn k-btn--ghost" type="button" data-copy>${esc(b.doneCopy)}</button><button class="k-btn k-btn--ghost" type="button" data-edit>${esc(b.doneEdit)}</button></div>
    <p class="k-small">${esc(b.doneHelp)}</p>
   </div>
  </div>
  <aside class="k-summary" aria-label="${esc(b.summary)}">
   <h2>${esc(b.summary)}</h2>
   <div class="k-srow"><span>${esc(b.place)}</span><b data-s="place">${esc(b.toChoose)}</b></div>
   <div class="k-srow"><span>${esc(b.service)}</span><b data-s="service">${esc(b.toChoose)}</b></div>
   <div class="k-srow"><span>${esc(b.duration)}</span><b data-s="duration">—</b></div>
   <div class="k-summary__total"><span>${esc(b.price)}</span><b class="k-num" data-s="price">—</b></div>
   <p>${esc(b.payNote)}</p>
  </aside>
 </div>
</section>
<script type="application/json" id="k-i18n">${JSON.stringify(i18n).replace(/</g, '\\u003c')}</script>`;
  return page(lang, { page: 'book', title: t.meta.bookTitle, desc: t.meta.bookDesc, path: R.book, alt: altFor('book') }, body, ['refonte.js', 'booking.js']);
}

export function allPages() {
  const out = {};
  for (const lang of LANGS) {
    const R = ROUTES[lang];
    out[`${lang}/index.html`] = home(lang, R.home);
    out[`${R.book.slice(1)}index.html`] = booking(lang);
    out[`${R.monaco.slice(1)}index.html`] = city(lang, 'monaco');
    out[`${R.cannes.slice(1)}index.html`] = city(lang, 'cannes');
  }
  out['index.html'] = home('fr', '/');
  return out;
}
