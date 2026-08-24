import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const site = join(process.cwd(), 'site');
const PULSE = 'https://pulse.komolongevity.com/';

const COPY = {
  en: {
    cta: 'Access the Pulse platform',
    eyebrow: 'KŌMØ PULSE · YOUR PERSONAL MOBILITY SPACE',
    title: 'One account.<br><em>Your full mobility journey.</em>',
    text: 'Create your account, complete the KŌMØ Loco Check, prepare your assessment and follow Motion and Clinical results in one secure longitudinal space.',
    steps: ['Create your account', 'Complete the Loco Check', 'Prepare your appointment', 'Follow your results']
  },
  fr: {
    cta: 'Accédez à la plateforme Pulse',
    eyebrow: 'KŌMØ PULSE · VOTRE ESPACE PERSONNEL DE MOBILITÉ',
    title: 'Un seul compte.<br><em>Toute votre trajectoire.</em>',
    text: 'Créez votre compte, réalisez le KŌMØ Loco Check, préparez votre bilan et suivez Motion et Clinical dans un dossier longitudinal sécurisé.',
    steps: ['Créer votre compte', 'Réaliser le Loco Check', 'Préparer la consultation', 'Suivre vos résultats']
  },
  es: {
    cta: 'Accede a la plataforma Pulse',
    eyebrow: 'KŌMØ PULSE · TU ESPACIO PERSONAL DE MOVILIDAD',
    title: 'Una sola cuenta.<br><em>Toda tu trayectoria.</em>',
    text: 'Crea tu cuenta, realiza el KŌMØ Loco Check, prepara tu evaluación y sigue Motion y Clinical en un espacio longitudinal seguro.',
    steps: ['Crear tu cuenta', 'Realizar el Loco Check', 'Preparar la consulta', 'Seguir tus resultados']
  }
};

const META = {
  en: {
    title: 'KŌMØ Longevity | Pulse mobility platform & follow-up',
    description: 'Access KŌMØ Pulse to create your account, complete the KŌMØ Loco Check, prepare your mobility assessment and follow Motion and Clinical results.',
    pulseTitle: 'KŌMØ Pulse | Mobility profile, results & follow-up',
    pulseDescription: 'Discover how KŌMØ Pulse connects preparation, Motion and Clinical results, appointments and longitudinal mobility follow-up.'
  },
  fr: {
    title: 'KŌMØ Longevity | Pulse, bilan locomoteur & suivi',
    description: 'Accédez à KŌMØ Pulse pour créer votre compte, réaliser le Loco Check, préparer votre bilan et suivre vos résultats Motion et Clinical.',
    pulseTitle: 'KŌMØ Pulse | Profil de mobilité, résultats & suivi',
    pulseDescription: 'Découvrez comment KŌMØ Pulse relie préparation, résultats Motion et Clinical, rendez-vous et suivi longitudinal de la mobilité.'
  },
  es: {
    title: 'KŌMØ Longevity | Plataforma Pulse y seguimiento',
    description: 'Accede a KŌMØ Pulse para crear tu cuenta, realizar el Loco Check, preparar tu evaluación y seguir los resultados Motion y Clinical.',
    pulseTitle: 'KŌMØ Pulse | Perfil de movilidad, resultados y seguimiento',
    pulseDescription: 'Descubre cómo KŌMØ Pulse conecta preparación, resultados Motion y Clinical, citas y seguimiento longitudinal de la movilidad.'
  }
};

const STYLE = '<style id="pulse-platform-bridge-style">.kpg{padding:22px 0 clamp(72px,9vw,110px);background:#f5f1e9}.kpg-card{width:min(calc(100% - 40px),1160px);margin:auto;display:grid;grid-template-columns:minmax(0,1.12fr) minmax(320px,.88fr);gap:clamp(38px,7vw,92px);align-items:end;padding:clamp(34px,5vw,64px);border-radius:32px;background:#161b2a;color:#fff;box-shadow:0 38px 100px rgba(22,27,42,.18)}.kpg-ey{margin:0 0 18px;color:#c9b99f;font-size:9px;font-weight:850;letter-spacing:.15em;text-transform:uppercase}.kpg h2{margin:0;font:400 clamp(44px,5.8vw,76px)/.94 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.055em}.kpg h2 em{color:#c9b99f;font-style:normal}.kpg-copy{margin:0 0 28px;color:rgba(255,255,255,.72);font:400 16px/1.65 "Iowan Old Style",Baskerville,Georgia,serif}.kpg-steps{display:grid;grid-template-columns:1fr 1fr;gap:1px;margin:0 0 28px;border:1px solid rgba(255,255,255,.14);border-radius:18px;overflow:hidden;background:rgba(255,255,255,.14)}.kpg-step{padding:15px 16px;background:#161b2a;color:rgba(255,255,255,.78);font-size:10px}.kpg-step b{display:block;margin-bottom:5px;color:#c9b99f;font-size:8px;letter-spacing:.1em}.kpg-btn{display:inline-flex;min-height:52px;align-items:center;justify-content:center;padding:0 20px;border-radius:999px;background:#c9b99f;color:#161b2a!important;text-decoration:none;font-size:11px;font-weight:850}.kpf{background:#f5f1e9!important;color:#161b2a!important}.kpf-btn{background:#161b2a!important}.kpf-ey,.kpf-brand span,.kpf-copy h1 em,.kpf-title em,.kpf-final h2 em{color:#8a7352!important}@media(max-width:820px){.kpg-card{grid-template-columns:1fr}.kpg{padding-top:8px}.kpg-card{width:min(calc(100% - 28px),1160px);padding:30px 22px;border-radius:24px}.kpg h2{font-size:44px}}@media(max-width:520px){.kpg-steps{grid-template-columns:1fr}.kpg-btn{width:100%}}</style>';

async function walk(dir) {
  const out = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, item.name);
    if (item.isDirectory()) out.push.apply(out, await walk(path));
    else out.push(path);
  }
  return out;
}

function langFor(html, rel) {
  const fromHtml = html.match(/<html[^>]+lang=["']([a-z]{2})/i);
  if (fromHtml) return COPY[fromHtml[1]] ? fromHtml[1] : 'en';
  if (rel.startsWith('fr/')) return 'fr';
  if (rel.startsWith('es/')) return 'es';
  return 'en';
}

function isLocalPulseTarget(href) {
  const normalized = href.replace(/^https:\/\/(?:www\.)?komolongevity\.com/i, '');
  return /^\/(?:(?:fr|es)\/)?(?:check|pulse|pulsedemo)(?:\/|#|$)/i.test(normalized)
    || /^\/assets\/(?:check|pulsedemo)(?:\/|$)/i.test(normalized);
}

function rewriteAnchors(html, lang) {
  const copy = COPY[lang] || COPY.en;
  return html.replace(/<a\b([^>]*?)\bhref=(["'])([^"']*)\2([^>]*)>([\s\S]*?)<\/a>/gi, function(match, before, quote, href, after, inner) {
    if (!isLocalPulseTarget(href)) return match;
    const plain = inner.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    let label = inner;
    if (/check|motion score|baseline|calculer|créer mon espace|crear mi espacio|discover my score|start my/i.test(plain)) {
      label = copy.cta + ' <span aria-hidden="true">↗</span>';
    }
    const cleanedBefore = before.replace(/\sdata-pulse-platform=["'][^"']*["']/gi, '');
    const cleanedAfter = after.replace(/\sdata-pulse-platform=["'][^"']*["']/gi, '');
    return '<a' + cleanedBefore + 'href="' + PULSE + '"' + cleanedAfter + ' data-pulse-platform="true">' + label + '</a>';
  });
}

function setMeta(html, title, description) {
  html = html.replace(/<title>[\s\S]*?<\/title>/i, '<title>' + title + '</title>');
  html = html.replace(/<meta name="description" content="[^"]*">/i, '<meta name="description" content="' + description + '">');
  html = html.replace(/<meta property="og:title" content="[^"]*">/i, '<meta property="og:title" content="' + title + '">');
  html = html.replace(/<meta property="og:description" content="[^"]*">/i, '<meta property="og:description" content="' + description + '">');
  if (!html.includes('name="application-name"')) html = html.replace('</head>', '<meta name="application-name" content="KŌMØ Pulse"></head>');
  if (!html.includes('name="twitter:title"')) html = html.replace('</head>', '<meta name="twitter:title" content="' + title + '"><meta name="twitter:description" content="' + description + '"></head>');
  if (!html.includes('property="og:image:alt"')) html = html.replace('</head>', '<meta property="og:image:alt" content="KŌMØ Pulse — locomotor mobility platform"></head>');
  return html;
}

function schema(lang, pageUrl, description) {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://komolongevity.com/#organization',
        name: 'KŌMØ',
        url: 'https://komolongevity.com/',
        sameAs: ['https://www.instagram.com/komo_longevity/']
      },
      {
        '@type': 'WebSite',
        '@id': 'https://komolongevity.com/#website',
        name: 'KŌMØ Longevity',
        url: 'https://komolongevity.com/',
        publisher: {'@id': 'https://komolongevity.com/#organization'},
        inLanguage: ['en', 'fr', 'es']
      },
      {
        '@type': 'WebApplication',
        '@id': PULSE + '#application',
        name: 'KŌMØ Pulse',
        url: PULSE,
        applicationCategory: 'HealthApplication',
        operatingSystem: 'Web',
        description: description,
        isAccessibleForFree: true,
        provider: {'@id': 'https://komolongevity.com/#organization'}
      },
      {
        '@type': 'WebPage',
        '@id': pageUrl + '#webpage',
        url: pageUrl,
        isPartOf: {'@id': 'https://komolongevity.com/#website'},
        about: {'@id': PULSE + '#application'},
        inLanguage: lang
      }
    ]
  };
  return '<script id="komo-ecosystem-schema" type="application/ld+json">' + JSON.stringify(data).replaceAll('<', '\\u003c') + '</script>';
}

function banner(lang) {
  const c = COPY[lang] || COPY.en;
  const steps = c.steps.map(function(item, index) {
    return '<div class="kpg-step"><b>0' + (index + 1) + '</b>' + item + '</div>';
  }).join('');
  return '<section class="kpg" aria-labelledby="pulse-gateway-title"><div class="kpg-card"><div><p class="kpg-ey">' + c.eyebrow + '</p><h2 id="pulse-gateway-title">' + c.title + '</h2></div><div><p class="kpg-copy">' + c.text + '</p><div class="kpg-steps">' + steps + '</div><a class="kpg-btn" href="' + PULSE + '" data-pulse-platform="true">' + c.cta + ' <span aria-hidden="true">↗</span></a></div></div></section>';
}

const files = (await walk(site)).filter(function(path) { return path.endsWith('.html'); });
for (const file of files) {
  let html = await readFile(file, 'utf8');
  const rel = relative(site, file).replaceAll('\\', '/');
  const lang = langFor(html, rel);
  const isHome = rel === 'index.html' || rel === 'fr/index.html' || rel === 'es/index.html';
  const isPulsePage = rel === 'pulse/index.html' || rel === 'fr/pulse/index.html' || rel === 'es/pulse/index.html';

  html = rewriteAnchors(html, lang);
  if (!html.includes('rel="preconnect" href="' + PULSE + '"')) {
    html = html.replace('</head>', '<link rel="preconnect" href="' + PULSE + '"><link rel="dns-prefetch" href="//pulse.komolongevity.com"></head>');
  }

  if (isHome) {
    const meta = META[lang] || META.en;
    html = setMeta(html, meta.title, meta.description);
    if (!html.includes('pulse-platform-bridge-style')) html = html.replace('</head>', STYLE + '</head>');
    if (!html.includes('class="kpg"')) html = html.replace(/(<main[^>]*>[\s\S]*?<\/section>)/i, '$1' + banner(lang));
    if (!html.includes('id="komo-ecosystem-schema"')) {
      const pageUrl = lang === 'en' ? 'https://komolongevity.com/' : 'https://komolongevity.com/' + lang + '/';
      html = html.replace('</head>', schema(lang, pageUrl, meta.description) + '</head>');
    }
  }

  if (isPulsePage) {
    const meta = META[lang] || META.en;
    html = setMeta(html, meta.pulseTitle, meta.pulseDescription);
    if (!html.includes('id="komo-ecosystem-schema"')) {
      const pageUrl = lang === 'en' ? 'https://komolongevity.com/pulse/' : 'https://komolongevity.com/' + lang + '/pulse/';
      html = html.replace('</head>', schema(lang, pageUrl, meta.pulseDescription) + '</head>');
    }
  }

  await writeFile(file, html, 'utf8');
}

function redirectPage(lang) {
  const c = COPY[lang] || COPY.en;
  return '<!doctype html><html lang="' + lang + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow,noarchive"><link rel="canonical" href="' + PULSE + '"><meta http-equiv="refresh" content="0;url=' + PULSE + '"><title>' + c.cta + '</title><script>location.replace("' + PULSE + '");</script></head><body><p><a href="' + PULSE + '">' + c.cta + '</a></p></body></html>';
}

const redirects = [
  [join(site, 'check', 'index.html'), 'en'],
  [join(site, 'fr', 'check', 'index.html'), 'fr'],
  [join(site, 'es', 'check', 'index.html'), 'es'],
  [join(site, 'assets', 'check', 'index.html'), 'en'],
  [join(site, 'assets', 'pulsedemo', 'index.html'), 'en']
];
for (const item of redirects) {
  try { await writeFile(item[0], redirectPage(item[1]), 'utf8'); } catch {}
}

try {
  const sitemapPath = join(site, 'sitemap.xml');
  let sitemap = await readFile(sitemapPath, 'utf8');
  sitemap = sitemap.replace(/<url>[\s\S]*?<loc>https:\/\/komolongevity\.com\/(?:(?:fr|es)\/)?check\/<\/loc>[\s\S]*?<\/url>\s*/gi, '');
  await writeFile(sitemapPath, sitemap, 'utf8');
} catch {}

console.log('[pulse-platform-bridge-v1] Pulse is now the sole interactive entry point; static Check routes are retired.');
