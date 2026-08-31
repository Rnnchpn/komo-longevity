import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root, 'site');

const configs = {
  en: {
    path: join(site, 'contact', 'index.html'),
    home: '/',
    caseHref: '/#case',
    measureHref: '/#measure',
    scoreHref: '/#score',
    pulseHref: '/#pulse',
    proHref: '/partners/',
    scienceHref: '/method/',
    proLabel: 'Professionals',
    scienceLabel: 'Science',
    menuLabel: 'Menu',
    current: 'en'
  },
  fr: {
    path: join(site, 'fr', 'contact', 'index.html'),
    home: '/fr/',
    caseHref: '/fr/#case',
    measureHref: '/fr/#measure',
    scoreHref: '/fr/#score',
    pulseHref: '/fr/#pulse',
    proHref: '/fr/partners/',
    scienceHref: '/fr/methode/',
    proLabel: 'Professionnels',
    scienceLabel: 'Science',
    menuLabel: 'Menu',
    current: 'fr'
  },
  es: {
    path: join(site, 'es', 'contact', 'index.html'),
    home: '/es/',
    caseHref: '/es/#case',
    measureHref: '/es/#measure',
    scoreHref: '/es/#score',
    pulseHref: '/es/#pulse',
    proHref: '/es/partners/',
    scienceHref: '/es/metodo/',
    proLabel: 'Profesionales',
    scienceLabel: 'Ciencia',
    menuLabel: 'Menú',
    current: 'es'
  }
};

const style = `<style id="professional-home-header-v1">
.pro-home-top{position:sticky;top:0;z-index:100;background:rgba(6,7,7,.95);color:#f7f5ef;border-bottom:1px solid rgba(255,255,255,.1);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px)}
.pro-home-shell{width:min(calc(100% - 40px),1160px);margin:auto}
.pro-home-topin{height:62px;display:flex;align-items:center;justify-content:space-between;gap:18px}
.pro-home-brand{color:#fff!important;text-decoration:none;font-size:14px;font-weight:900;letter-spacing:.22em}
.pro-home-nav{display:flex;gap:24px;align-items:center}
.pro-home-nav a{color:rgba(255,255,255,.62)!important;text-decoration:none;font-size:11px;transition:color .18s ease}
.pro-home-nav a:hover,.pro-home-nav a[aria-current=page]{color:#fff!important}
.pro-home-actions{display:flex;align-items:center;gap:9px}
.pro-home-langs{display:flex;align-items:center}
.pro-home-langs a{width:29px;height:29px;display:grid;place-items:center;border-radius:50%;color:rgba(255,255,255,.58)!important;text-decoration:none;font-size:9px;font-weight:800}
.pro-home-langs a[aria-current=page]{background:#fff;color:#080909!important}
.pro-home-pulse{display:inline-flex;min-height:38px;align-items:center;padding:0 14px;border-radius:999px;background:#ded0b9;color:#090a0a!important;text-decoration:none;font-size:10px;font-weight:850}
.pro-home-menu{display:none;position:relative}
.pro-home-menu summary{list-style:none;cursor:pointer;color:#fff;font-size:10px;font-weight:850}
.pro-home-menu summary::-webkit-details-marker{display:none}
.pro-home-menu nav{position:fixed;top:68px;left:14px;right:14px;padding:8px 14px;border:1px solid rgba(255,255,255,.1);border-radius:20px;background:rgba(13,15,14,.99);box-shadow:0 24px 70px rgba(0,0,0,.34)}
.pro-home-menu nav a{min-height:48px;display:flex;align-items:center;border-bottom:1px solid rgba(255,255,255,.09);color:rgba(255,255,255,.76)!important;text-decoration:none;font-size:14px}
.pro-home-menu nav a:last-child{border-bottom:0}
.pro-home-menu nav a[aria-current=page]{color:#fff!important}
body[data-page="contact"]>.mobile-cta{display:none!important}
@media(max-width:900px){.pro-home-nav{display:none}.pro-home-menu{display:block}.pro-home-pulse{display:none}}
@media(max-width:620px){.pro-home-shell{width:min(calc(100% - 28px),1160px)}.pro-home-top{padding-top:env(safe-area-inset-top)}.pro-home-topin{height:54px}.pro-home-brand{font-size:13px}.pro-home-langs a{width:28px;height:28px}.pro-home-menu summary{min-width:44px;min-height:40px;display:grid;place-items:center;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(255,255,255,.04)}.pro-home-menu nav{top:calc(62px + env(safe-area-inset-top))}}
</style>`;

function languageLinks(current) {
  const defs = [
    ['en', '/contact/', 'EN'],
    ['fr', '/fr/contact/', 'FR'],
    ['es', '/es/contact/', 'ES']
  ];
  return defs.map(([locale, href, label]) => `<a href="${href}"${locale === current ? ' aria-current="page"' : ''}>${label}</a>`).join('');
}

function header(c) {
  const nav = `<a href="${c.caseHref}">Case</a><a href="${c.measureHref}">Measure</a><a href="${c.scoreHref}">Motion Score</a><a href="${c.pulseHref}">Pulse</a><a href="${c.proHref}" aria-current="page">${c.proLabel}</a><a href="${c.scienceHref}">${c.scienceLabel}</a>`;
  const desktopNav = c.current === 'fr'
    ? `<a href="${c.caseHref}">Case</a><a href="${c.measureHref}">Mesure</a><a href="${c.scoreHref}">Motion Score</a><a href="${c.pulseHref}">Pulse</a><a href="${c.proHref}" aria-current="page">${c.proLabel}</a><a href="${c.scienceHref}">${c.scienceLabel}</a>`
    : c.current === 'es'
      ? `<a href="${c.caseHref}">Case</a><a href="${c.measureHref}">Medición</a><a href="${c.scoreHref}">Motion Score</a><a href="${c.pulseHref}">Pulse</a><a href="${c.proHref}" aria-current="page">${c.proLabel}</a><a href="${c.scienceHref}">${c.scienceLabel}</a>`
      : nav;

  return `<header class="pro-home-top"><div class="pro-home-shell pro-home-topin"><a class="pro-home-brand" href="${c.home}" aria-label="KŌMØ">KŌMØ</a><nav class="pro-home-nav" aria-label="Primary navigation">${desktopNav}</nav><div class="pro-home-actions"><div class="pro-home-langs">${languageLinks(c.current)}</div><a class="pro-home-pulse" href="https://pulse.komolongevity.com/">Pulse →</a><details class="pro-home-menu"><summary>${c.menuLabel}</summary><nav>${desktopNav}</nav></details></div></div></header>`;
}

for (const [locale, c] of Object.entries(configs)) {
  let html = await readFile(c.path, 'utf8');
  html = html.replace(/<style id="professional-home-header-v1">[\s\S]*?<\/style>/, '');
  html = html.replace(/<header class="site-header">[\s\S]*?<\/header>/, header(c));
  html = html.replace(/<a class="button mobile-cta"[\s\S]*?<\/a>/, '');
  html = html.replace('</head>', `${style}\n</head>`);
  await writeFile(c.path, html, 'utf8');
  console.log(`[professional-header] ${locale} contact header synced with homepage`);
}
