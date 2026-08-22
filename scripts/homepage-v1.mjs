import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homepageCopy, renderHomepageBody } from '../src/design-system/homepage.js';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');
const tokens = await readFile(join(root, 'src', 'design-system', 'tokens.css'), 'utf8');
const homepageCss = await readFile(join(root, 'src', 'design-system', 'homepage.css'), 'utf8');

const canonical = { en: 'https://komolongevity.com/', fr: 'https://komolongevity.com/fr/', es: 'https://komolongevity.com/es/' };
const ogLocale = { en: 'en_US', fr: 'fr_FR', es: 'es_ES' };
const alternates = `
<link rel="alternate" hreflang="en" href="https://komolongevity.com/">
<link rel="alternate" hreflang="fr" href="https://komolongevity.com/fr/">
<link rel="alternate" hreflang="es" href="https://komolongevity.com/es/">
<link rel="alternate" hreflang="x-default" href="https://komolongevity.com/">`;

const documentFor = (locale) => {
  const c = homepageCopy[locale];
  const structured = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: c.title,
    description: c.description,
    url: canonical[locale],
    inLanguage: locale,
    isPartOf: { '@type': 'WebSite', name: 'KŌMØ', url: 'https://komolongevity.com/' },
    about: ['locomotor longevity', 'mobility', 'gait', 'functional assessment']
  });
  return `<!doctype html>
<html lang="${locale}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#f5f1e9">
<meta name="color-scheme" content="light">
<title>${c.title}</title>
<meta name="description" content="${c.description}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="${canonical[locale]}">${alternates}
<meta property="og:type" content="website">
<meta property="og:site_name" content="KŌMØ">
<meta property="og:locale" content="${ogLocale[locale]}">
<meta property="og:title" content="${c.title}">
<meta property="og:description" content="${c.description}">
<meta property="og:url" content="${canonical[locale]}">
<meta property="og:image" content="https://komolongevity.com/assets/og-komo.svg">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">${structured}</script>
<style>${tokens}\n${homepageCss}</style>
</head>
<body>${renderHomepageBody(locale)}</body>
</html>`;
};

for (const locale of ['en', 'fr', 'es']) {
  const out = locale === 'en' ? join(site, 'index.html') : join(site, locale, 'index.html');
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, documentFor(locale), 'utf8');
  console.log(`[homepage-v1] wrote ${out}`);
}
