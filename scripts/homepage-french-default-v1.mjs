import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const files = {
  home: join(root, 'site', 'index.html'),
  fr: join(root, 'site', 'fr', 'index.html'),
  en: join(root, 'site', 'en', 'index.html'),
  es: join(root, 'site', 'es', 'index.html')
};

const languageNav = {
  home: '<div class="kp-langs"><a href="/" aria-current="page">FR</a><a href="/en/">EN</a><a href="/es/">ES</a></div>',
  fr: '<div class="kp-langs"><a href="/" aria-current="page">FR</a><a href="/en/">EN</a><a href="/es/">ES</a></div>',
  en: '<div class="kp-langs"><a href="/">FR</a><a href="/en/" aria-current="page">EN</a><a href="/es/">ES</a></div>',
  es: '<div class="kp-langs"><a href="/">FR</a><a href="/en/">EN</a><a href="/es/" aria-current="page">ES</a></div>'
};

function setLanguageNav(html, key) {
  return html.replace(/<div class="kp-langs">[\s\S]*?<\/div>/, languageNav[key]);
}

function setMeta(html, { lang, canonical, en, fr, es, xDefault }) {
  html = html.replace(/<html lang="[^"]+">/, `<html lang="${lang}">`);
  html = html.replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${canonical}">`);
  html = html.replace(/<link rel="alternate" hreflang="en" href="[^"]+">/, `<link rel="alternate" hreflang="en" href="${en}">`);
  html = html.replace(/<link rel="alternate" hreflang="fr" href="[^"]+">/, `<link rel="alternate" hreflang="fr" href="${fr}">`);
  html = html.replace(/<link rel="alternate" hreflang="es" href="[^"]+">/, `<link rel="alternate" hreflang="es" href="${es}">`);
  html = html.replace(/<link rel="alternate" hreflang="x-default" href="[^"]+">/, `<link rel="alternate" hreflang="x-default" href="${xDefault}">`);
  return html;
}

const [englishHome, frenchHome, spanishHome] = await Promise.all([
  readFile(files.home, 'utf8'),
  readFile(files.fr, 'utf8'),
  readFile(files.es, 'utf8')
]);

const homeFrench = setLanguageNav(setMeta(frenchHome, {
  lang: 'fr',
  canonical: 'https://komolongevity.com/',
  en: 'https://komolongevity.com/en/',
  fr: 'https://komolongevity.com/',
  es: 'https://komolongevity.com/es/',
  xDefault: 'https://komolongevity.com/'
}), 'home');

const frenchRoute = setLanguageNav(setMeta(frenchHome, {
  lang: 'fr',
  canonical: 'https://komolongevity.com/',
  en: 'https://komolongevity.com/en/',
  fr: 'https://komolongevity.com/',
  es: 'https://komolongevity.com/es/',
  xDefault: 'https://komolongevity.com/'
}), 'fr');

const englishRoute = setLanguageNav(setMeta(englishHome, {
  lang: 'en',
  canonical: 'https://komolongevity.com/en/',
  en: 'https://komolongevity.com/en/',
  fr: 'https://komolongevity.com/',
  es: 'https://komolongevity.com/es/',
  xDefault: 'https://komolongevity.com/'
}), 'en');

const spanishRoute = setLanguageNav(setMeta(spanishHome, {
  lang: 'es',
  canonical: 'https://komolongevity.com/es/',
  en: 'https://komolongevity.com/en/',
  fr: 'https://komolongevity.com/',
  es: 'https://komolongevity.com/es/',
  xDefault: 'https://komolongevity.com/'
}), 'es');

await Promise.all([
  writeFile(files.home, homeFrench),
  writeFile(files.fr, frenchRoute),
  writeFile(files.en, englishRoute),
  writeFile(files.es, spanishRoute)
]);

console.log('[homepage-french-default-v1] PASS · French is the primary home language; English remains available at /en/');
