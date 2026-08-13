import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, translations } from '../src/content.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, 'site');
const sourceAssets = join(root, 'src', 'assets');

const escapeHtml = (value = '') => String(value)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

// English is the reference language and owns the canonical root URLs.
// French and Spanish are fully native localisations under their own paths.
const pagePath = (locale, page = 'index') => {
  if (locale === 'en') return page === 'index' ? '/' : `/${page}/`;
  return page === 'index' ? `/${locale}/` : `/${locale}/${page}/`;
};
const canonical = (locale, page) => `${site.origin}${pagePath(locale, page)}`;
const link = (locale, page) => /^https?:\/\//.test(page) || page.startsWith('mailto:') ? page : pagePath(locale, page);
const scoreLink = (locale) => `${pagePath(locale, 'pulse')}#mobility-check`;
const article = (locale) => `${pagePath(locale, 'library')}#articles`;

const raw = (value = '') => String(value);
const text = (value = '') => escapeHtml(value);

function languageMenu(locale, page) {
  const current = translations[locale];
  return `
    <div class="language" data-language>
      <button type="button" aria-haspopup="true" aria-expanded="false" aria-label="${text(current.languageName)}">${text(current.code)}</button>
      <div class="language-menu" role="menu">
        ${site.locales.map((candidate) => {
          const item = translations[candidate];
          return `<a href="${pagePath(candidate, page)}" data-locale="${candidate}" role="menuitem" ${candidate === locale ? 'aria-current="true"' : ''}>${text(item.languageName)}<span>${text(item.code)}</span></a>`;
        }).join('')}
      </div>
    </div>`;
}

function header(locale, page) {
  const c = translations[locale];
  const navItems = [
    ['pulse', c.nav.pulse], ['clinical', c.nav.clinical], ['white-coast', c.nav.whiteCoast],
    ['motion-retreats', c.nav.retreats], ['library', c.nav.library], ['circle', c.nav.circle], ['science', c.nav.science]
  ];
  return `
    <a class="skip-link" href="#main">${text(c.global.skip)}</a>
    <header class="site-header">
      <div class="shell nav">
        <a class="brand" href="${pagePath(locale)}" aria-label="KŌMØ — ${text(c.global.brandSubtitle)}">
          <span class="brand-mark" aria-hidden="true">K</span>
          <span>KŌMØ<small>${text(c.global.brandSubtitle)}</small></span>
        </a>
        <nav class="primary-nav" aria-label="Navigation principale" data-primary-nav>
          ${navItems.map(([target, label]) => `<a href="${pagePath(locale, target)}" ${page === target ? 'aria-current="page"' : ''}>${text(label)}</a>`).join('')}
          <a href="${pagePath(locale, 'contact')}" ${page === 'contact' ? 'aria-current="page"' : ''}>${text(c.nav.contact)}</a>
        </nav>
        <div class="header-actions">
          ${languageMenu(locale, page)}
          <a class="nav-cta" href="${scoreLink(locale)}">${text(c.nav.score)}</a>
          <button class="menu-toggle" type="button" data-menu-toggle aria-expanded="false" aria-label="${text(c.nav.menu)}"><span></span></button>
        </div>
      </div>
    </header>`;
}

function footer(locale) {
  const c = translations[locale];
  const group = (title, rows) => `
    <div><h3>${text(title)}</h3>${rows.map(([label, target]) => `<a href="${link(locale, target)}" ${target.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''}>${text(label)}</a>`).join('')}</div>`;
  return `
    <footer class="footer">
      <div class="shell">
        <div class="footer-grid">
          <div>
            <a class="brand" href="${pagePath(locale)}"><span class="brand-mark" aria-hidden="true">K</span><span>KŌMØ<small>${text(c.global.brandSubtitle)}</small></span></a>
            <p class="footer-copy">${text(c.global.footerCopy)}</p>
          </div>
          ${group(c.footer.ecosystem, c.footer.links1)}
          ${group(c.footer.resources, c.footer.links2)}
          ${group(c.footer.company, c.footer.links3)}
        </div>
        <div class="footer-bottom"><span>${text(c.global.allRights)}</span><span>${text(c.global.madeBy)}</span></div>
      </div>
    </footer>`;
}

function layout(locale, page, content, meta) {
  const c = translations[locale];
  const alternatives = site.locales.map((item) => `<link rel="alternate" hreflang="${item}" href="${canonical(item, page)}">`).join('\n    ');
  const defaultUrl = canonical('en', page);
  return `<!doctype html>
<html lang="${c.lang}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#063c42">
  <meta name="color-scheme" content="light">
  <title>${text(meta.metaTitle)}</title>
  <meta name="description" content="${text(meta.metaDescription)}">
  <link rel="canonical" href="${canonical(locale, page)}">
  ${alternatives}
  <link rel="alternate" hreflang="x-default" href="${defaultUrl}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="${locale === 'en' ? 'en_GB' : locale === 'fr' ? 'fr_FR' : 'es_ES'}">
  <meta property="og:site_name" content="KŌMØ">
  <meta property="og:title" content="${text(meta.metaTitle)}">
  <meta property="og:description" content="${text(meta.metaDescription)}">
  <meta property="og:url" content="${canonical(locale, page)}">
  <meta property="og:image" content="${site.origin}/assets/og-komo.svg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/site.css">
  <script defer src="/assets/js/site.js"></script>
</head>
<body data-page="${text(page)}">
${header(locale, page)}
<main id="main">${content}</main>
${footer(locale)}
<a class="button mobile-cta" href="${scoreLink(locale)}">${text(c.nav.score)}</a>
</body>
</html>`;
}

function buttons(locale, first, second, secondHref) {
  return `<div class="hero-actions"><a class="button" href="${scoreLink(locale)}">${text(first)} <span aria-hidden="true">↗</span></a>${second ? `<a class="button button-outline" href="${secondHref || '#ecosystem'}">${text(second)}</a>` : ''}</div>`;
}

function homePage(locale) {
  const c = translations[locale];
  const h = c.home;
  return `
    <section class="hero">
      <div class="shell hero-grid">
        <div class="hero-copy">
          <p class="eyebrow reveal">${text(h.eyebrow)}</p>
          <h1 class="display reveal">${raw(h.title)}</h1>
          <p class="lede reveal">${text(h.lead)}</p>
          ${buttons(locale, h.primaryCta, h.secondaryCta, '#ecosystem')}
          <div class="trust-row reveal">${h.trust.map((item) => `<span>${text(item)}</span>`).join('')}</div>
        </div>
        <aside class="hero-object reveal" aria-label="${text(h.objectTitle.replaceAll('<br>', ' '))}">
          <div class="object-head"><span>${text(h.objectKicker)}</span><span>KŌMØ Pulse</span></div>
          <div class="object-content">
            <p class="object-number">${text(h.objectNumber)}</p>
            <h2>${raw(h.objectTitle)}</h2>
            <p>${text(h.objectText)}</p>
          </div>
          <svg class="hero-path" viewBox="0 0 500 350" aria-hidden="true"><path d="M25,275 C100,260 93,85 210,135 S298,290 389,211 S467,57 493,76"/><circle cx="25" cy="275" r="6"/><circle cx="210" cy="135" r="6"/><circle cx="389" cy="211" r="6"/></svg>
          <div class="object-foot"><span>At home · Clinical · Retreats</span><span>01 / 03</span></div>
        </aside>
      </div>
    </section>

    <section class="section" id="ecosystem">
      <div class="shell">
        <div class="intro-grid reveal"><div><p class="eyebrow">${text(h.introEyebrow)}</p><h2 class="section-heading">${raw(h.introTitle)}</h2></div><p class="section-lead">${text(h.introLead)}</p></div>
        <div class="ecosystem-grid">
          ${h.wheel.map((item) => `<article class="ecosystem-card reveal"><span class="ecosystem-index">${text(item.num)}</span><h3>${text(item.title)}</h3><p>${text(item.text)}</p><a class="text-link" href="${pagePath(locale, item.page)}">${text(item.link)}</a></article>`).join('')}
        </div>
      </div>
    </section>

    <section class="section split-band">
      <div class="shell split-grid">
        <div class="reveal"><p class="eyebrow eyebrow-light">${text(h.systemEyebrow)}</p><h2 class="section-heading">${raw(h.systemTitle)}</h2><p class="section-lead">${text(h.systemLead)}</p></div>
        <div class="signal-list reveal">${h.capacities.map(([num, title, body]) => `<article class="signal"><span class="signal-num">${text(num)}</span><div><h3>${text(title)}</h3><p>${text(body)}</p></div></article>`).join('')}</div>
      </div>
    </section>

    <section class="section">
      <div class="shell"><div class="intro-grid reveal"><div><p class="eyebrow">${text(h.entryEyebrow)}</p><h2 class="section-heading">${raw(h.entryTitle)}</h2></div><p class="section-lead">${text(h.entryLead)}</p></div>
        <div class="entry-cards">${h.entries.map((item) => `<article class="entry-card reveal"><span class="entry-orb" aria-hidden="true"></span><p class="eyebrow">${text(item.eyebrow)}</p><h3>${text(item.title)}</h3><p>${text(item.text)}</p><a class="text-link" href="${pagePath(locale, item.page)}">${text(item.link)}</a></article>`).join('')}</div>
      </div>
    </section>

    <section class="section-tight"><div class="shell"><div class="metric-panel reveal"><div class="metric-copy"><p class="eyebrow">${text(h.pulseEyebrow)}</p><h3>${raw(h.pulseTitle)}</h3><p>${text(h.pulseText)}</p><a class="text-link" href="${pagePath(locale, 'pulse')}">${text(c.nav.pulse)}</a></div><div class="metric-stat">${h.pulseStats.map(([value, label]) => `<div><strong>${text(value)}</strong><span>${text(label)}</span></div>`).join('')}</div></div></div></section>

    <section class="chapter"><div class="shell chapter-inner"><div class="chapter-card reveal"><p class="eyebrow eyebrow-light">${text(h.chapterEyebrow)}</p><h2>${raw(h.chapterTitle)}</h2><p>${text(h.chapterText)}</p><div class="hero-actions"><a class="button button-light" href="${pagePath(locale, 'white-coast')}">${text(h.chapterCta)}</a></div><div class="chapter-notes">${h.chapterNotes.map(([label, value]) => `<div><strong>${text(label)}</strong>${text(value)}</div>`).join('')}</div></div><p class="chapter-quote reveal">${raw(h.chapterQuote)}</p></div></section>

    <section class="section"><div class="shell intro-grid reveal"><div><p class="eyebrow">${text(h.scienceEyebrow)}</p><h2 class="section-heading">${raw(h.scienceTitle)}</h2></div><div><p class="section-lead">${text(h.scienceLead)}</p><a class="text-link" href="${pagePath(locale, 'science')}">${text(h.scienceCta)}</a></div></div></section>

    <section class="quote-band"><div class="shell"><blockquote class="reveal">${raw(h.finalTitle)}</blockquote><p class="section-lead" style="color:rgba(255,255,255,.72)">${text(h.finalText)}</p><div class="hero-actions"><a class="button button-light" href="${scoreLink(locale)}">${text(h.finalCta)}</a></div></div></section>`;
}

function genericHero(locale, page, data) {
  const ctaTarget = {
    contact: '#contact-form',
    'white-coast': 'https://community.komolongevity.com/',
    clinical: pagePath(locale, 'contact'),
    science: pagePath(locale, 'contact'),
    circle: pagePath(locale, 'contact'),
    'motion-retreats': pagePath(locale, 'white-coast')
  }[page] || scoreLink(locale);
  const external = page === 'white-coast';
  return `<section class="page-hero"><div class="shell"><p class="breadcrumb"><a href="${pagePath(locale)}">KŌMØ</a><span>/</span><span>${text(data.eyebrow)}</span></p><p class="eyebrow eyebrow-light reveal">${text(data.eyebrow)}</p><h1 class="display reveal">${raw(data.title)}</h1><p class="lede reveal">${text(data.lead)}</p><div class="hero-actions"><a class="button button-light" href="${ctaTarget}" ${external ? 'target="_blank" rel="noreferrer"' : ''}>${text(data.cta)} <span aria-hidden="true">↗</span></a></div><p class="hero-note">${text(data.note)}</p></div></section>`;
}

function introBlock(data) {
  return `<section class="section"><div class="shell"><div class="intro-grid reveal"><div><p class="eyebrow">${text(data.introEyebrow)}</p><h2 class="section-heading">${raw(data.introTitle)}</h2></div><p class="section-lead">${text(data.introLead)}</p></div>`;
}

function pulsePage(locale) {
  const c = translations[locale]; const p = c.pulse;
  return `${genericHero(locale, 'pulse', p)}
  <section class="section-tight"><div class="shell"><div class="entry-cards">${p.sections.map(([eyebrow, title, body]) => `<article class="entry-card reveal"><span class="entry-orb" aria-hidden="true"></span><p class="eyebrow">${text(eyebrow)}</p><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}</div></div></section>
  <section class="section" id="mobility-check"><div class="shell"><div class="intro-grid reveal"><div><p class="eyebrow">${text(p.methodEyebrow)}</p><h2 class="section-heading">${raw(p.methodTitle)}</h2></div><p class="section-lead">${text(p.methodLead)}</p></div><div class="steps reveal">${p.methodSteps.map(([n, t, b]) => `<article class="step"><span class="step-num">${text(n)}</span><h3>${text(t)}</h3><p>${text(b)}</p></article>`).join('')}</div><div class="article-callout reveal"><strong>${text(c.global.medicalNotice.split('.')[0])}</strong>${text(c.global.medicalNotice)}</div></div></section>
  <section class="section-tight" style="background:var(--paper-strong)"><div class="shell"><p class="eyebrow">${text(p.compareEyebrow)}</p><h2 class="section-heading reveal">${raw(p.compareTitle)}</h2><div class="comparison reveal"><table><thead><tr>${p.compareHead.map((col) => `<th>${text(col)}</th>`).join('')}</tr></thead><tbody>${p.compareRows.map((row) => `<tr>${row.map((item) => `<td>${text(item)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div></section>
  ${finalBand(locale, p.finalTitle, p.finalText, p.cta)}`;
}

function clinicalPage(locale) {
  const c = translations[locale]; const p = c.clinical;
  return `${genericHero(locale, 'clinical', p)}${introBlock(p)}<div class="steps reveal">${p.steps.map(([n,t,b]) => `<article class="step"><span class="step-num">${text(n)}</span><h3>${text(t)}</h3><p>${text(b)}</p></article>`).join('')}</div></div></section>
  <section class="section-tight" style="background:var(--paper-strong)"><div class="shell"><div class="intro-grid reveal"><div><p class="eyebrow">${text(p.contextsEyebrow)}</p><h2 class="section-heading">${raw(p.contextsTitle)}</h2></div></div><div class="article-grid">${p.contexts.map(([title, body]) => `<article class="article-card reveal"><span class="tag">KŌMØ Clinical</span><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}</div></div></section>${finalBand(locale, p.finalTitle, p.finalText, p.cta, 'contact')}`;
}

function whiteCoastPage(locale) {
  const c = translations[locale]; const p = c.whiteCoast;
  return `${genericHero(locale, 'white-coast', p)}${introBlock(p)}<div class="entry-cards">${p.cards.map(([title, body], i) => `<article class="entry-card reveal"><span class="entry-orb" aria-hidden="true"></span><p class="eyebrow">0${i + 1}</p><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}</div></div></section>
  <section class="chapter"><div class="shell chapter-inner"><div class="chapter-card reveal"><p class="eyebrow eyebrow-light">${text(p.chapterEyebrow)}</p><h2>${raw(p.chapterTitle)}</h2><p>${text(p.chapterText)}</p><div class="hero-actions"><a class="button button-light" href="https://community.komolongevity.com/" target="_blank" rel="noreferrer">${text(p.chapterCta)}</a></div><div class="chapter-notes">${p.chapterNotes.map(([label,value]) => `<div><strong>${text(label)}</strong>${text(value)}</div>`).join('')}</div></div><p class="chapter-quote reveal">${raw(p.chapterQuote)}</p></div></section>
  ${finalBand(locale, p.finalTitle, p.finalText, p.cta, 'https://community.komolongevity.com/')}`;
}

function retreatsPage(locale) {
  const c = translations[locale]; const p = c.motionRetreats;
  return `${genericHero(locale, 'motion-retreats', p)}${introBlock(p)}<div class="steps reveal">${p.rhythm.map(([n,t,b], i) => `<article class="step"><span class="step-num">0${i + 1}</span><h3>${text(t)}</h3><p><strong>${text(n)}</strong><br>${text(b)}</p></article>`).join('')}</div></div></section>
  <section class="section-tight" style="background:var(--paper-strong)"><div class="shell"><p class="eyebrow">${text(p.carouselEyebrow)}</p><h2 class="section-heading reveal">${raw(p.carouselTitle)}</h2><div class="carousel-wrap"><div class="carousel" id="retreat-carousel">${p.carousel.map(([title,body],i) => `<article class="carousel-card reveal"><p class="eyebrow">0${i+1} · KŌMØ Retreats</p><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}</div><div class="carousel-controls" data-carousel-controls="#retreat-carousel"><button type="button" data-direction="previous" aria-label="Previous">←</button><button type="button" data-direction="next" aria-label="Next">→</button></div></div></div></section>${finalBand(locale,p.finalTitle,p.finalText,p.cta,'white-coast')}`;
}

function libraryPage(locale) {
  const c = translations[locale]; const p = c.library;
  return `${genericHero(locale, 'library', p)}${introBlock(p)}<div class="article-callout reveal"><strong>KŌMØ Library</strong>${text(c.global.medicalNotice)}</div></div></section>
  <section class="section-tight" id="articles" style="background:var(--paper-strong)"><div class="shell"><div class="article-grid">${p.articles.map(([tag,title,body]) => `<article class="article-card reveal"><span class="tag">${text(tag)}</span><h3>${text(title)}</h3><p>${text(body)}</p><a class="text-link" href="${article(locale)}">${text(c.global.readMore)}</a></article>`).join('')}</div></div></section>${finalBand(locale,p.finalTitle,p.finalText,p.cta,'pulse')}`;
}

function circlePage(locale) {
  const p = translations[locale].circle;
  return `${genericHero(locale, 'circle', p)}${introBlock(p)}<div class="entry-cards">${p.cards.map(([title,body],i) => `<article class="entry-card reveal"><span class="entry-orb" aria-hidden="true"></span><p class="eyebrow">0${i+1}</p><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}</div></div></section>${finalBand(locale,p.finalTitle,p.finalText,p.cta,'contact')}`;
}

function sciencePage(locale) {
  const p = translations[locale].science;
  return `${genericHero(locale, 'science', p)}${introBlock(p)}<div class="article-callout reveal"><strong>Dr Renan Chapon</strong>${text(p.underEgide)}</div><div class="steps reveal">${p.steps.map(([n,t,b]) => `<article class="step"><span class="step-num">${text(n)}</span><h3>${text(t)}</h3><p>${text(b)}</p></article>`).join('')}</div></div></section>${finalBand(locale,p.finalTitle,p.finalText,p.cta,'contact')}`;
}

function contactPage(locale) {
  const c = translations[locale]; const p = c.contact; const f = p.fields;
  return `${genericHero(locale,'contact',p)}<section class="section" id="contact-form"><div class="shell"><div class="contact-panel reveal"><div class="contact-aside"><p class="eyebrow eyebrow-light">KŌMØ</p><h2>${raw(p.asideTitle)}</h2><p>${text(p.asideText)}</p><a class="contact-mail" href="mailto:${text(p.direct)}">${text(p.direct)}</a></div><div class="contact-form"><h2>${text(p.formTitle)}</h2><p class="muted">${text(p.formLead)}</p><form data-contact-form><div class="field"><label for="name">${text(f.name)}</label><input id="name" name="name" autocomplete="name" required></div><div class="field"><label for="email">${text(f.email)}</label><input id="email" name="email" type="email" autocomplete="email" required></div><div class="field"><label for="subject">${text(f.subject)}</label><input id="subject" name="subject" required></div><div class="field"><label for="message">${text(f.message)}</label><textarea id="message" name="message" required></textarea></div><label class="field" style="grid-template-columns:auto 1fr;align-items:start;gap:.6rem"><input type="checkbox" name="consent" required style="min-height:auto;width:auto;margin-top:.28rem"><span>${text(f.consent)}</span></label><button class="button" type="submit">${text(f.submit)}</button><p class="form-note">${text(c.global.medicalNotice)}</p></form></div></div></div></section>${finalBand(locale,p.finalTitle,p.finalText,p.cta,'contact')}`;
}

function finalBand(locale, title, body, cta, target = 'pulse') {
  return `<section class="quote-band"><div class="shell"><blockquote class="reveal">${raw(title)}</blockquote><p class="section-lead" style="color:rgba(255,255,255,.72)">${text(body)}</p><div class="hero-actions"><a class="button button-light" href="${link(locale, target)}" ${target.startsWith('http') ? 'target="_blank" rel="noreferrer"' : ''}>${text(cta)} <span aria-hidden="true">↗</span></a></div></div></section>`;
}

function renderPage(locale, page) {
  const c = translations[locale];
  const body = {
    index: homePage,
    pulse: pulsePage,
    clinical: clinicalPage,
    'white-coast': whiteCoastPage,
    'motion-retreats': retreatsPage,
    library: libraryPage,
    circle: circlePage,
    science: sciencePage,
    contact: contactPage
  }[page](locale);
  const data = page === 'index' ? c.home : c[page === 'white-coast' ? 'whiteCoast' : page === 'motion-retreats' ? 'motionRetreats' : page];
  return layout(locale, page, body, data);
}

function englishAliasRedirect(page = 'index') {
  const target = pagePath('en', page);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${canonical('en', page)}"><meta http-equiv="refresh" content="0;url=${target}"><title>KŌMØ</title><script>location.replace('${target}')</script></head><body><a href="${target}">Continue to KŌMØ</a></body></html>`;
}

function ogSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#063c42"/><stop offset="1" stop-color="#62968b"/></linearGradient></defs><rect width="1200" height="630" fill="url(#g)"/><circle cx="910" cy="158" r="244" fill="none" stroke="#c7d9d2" stroke-opacity=".45"/><circle cx="900" cy="360" r="115" fill="#d8ad79" fill-opacity=".8"/><text x="82" y="126" fill="#d8e6df" font-family="Arial, sans-serif" font-size="32" letter-spacing="8">KŌMØ</text><text x="80" y="315" fill="white" font-family="Georgia, serif" font-size="100">Life is</text><text x="80" y="415" fill="#d9ebe1" font-family="Georgia, serif" font-size="100" font-style="italic">movement.</text><text x="82" y="520" fill="#d8e6df" font-family="Arial, sans-serif" font-size="24" letter-spacing="4">LOCOMOTOR LONGEVITY NETWORK</text></svg>`;
}

function faviconSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="16" fill="#063c42"/><path d="M20 12v40M44 12v40M20 31h24" fill="none" stroke="#d8e6df" stroke-width="3"/><circle cx="32" cy="31" r="11" fill="none" stroke="#d8ad79" stroke-width="3"/></svg>`;
}

async function write(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value, 'utf8');
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
await cp(sourceAssets, join(output, 'assets'), { recursive: true });

for (const locale of site.locales) {
  for (const page of site.pages) {
    const path = locale === 'en'
      ? (page === 'index' ? join(output, 'index.html') : join(output, page, 'index.html'))
      : (page === 'index' ? join(output, locale, 'index.html') : join(output, locale, page, 'index.html'));
    await write(path, renderPage(locale, page));
  }
}

// Keep an `/en/` alias so early links still resolve, without creating duplicate content for search engines.
for (const page of site.pages) {
  const path = page === 'index' ? join(output, 'en', 'index.html') : join(output, 'en', page, 'index.html');
  await write(path, englishAliasRedirect(page));
}
await write(join(output, '404.html'), layout('en', 'index', `<section class="page-hero"><div class="shell"><p class="eyebrow eyebrow-light">404</p><h1 class="display">This page does not exist.<br><em>Let’s return to movement.</em></h1><div class="hero-actions"><a class="button button-light" href="/">Return to KŌMØ</a></div></div></section>`, {metaTitle: 'Page not found — KŌMØ', metaDescription: 'The requested page could not be found.'}));
await write(join(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.origin}/sitemap.xml\n`);
const urls = [...new Set(site.locales.flatMap((locale) => site.pages.map((page) => canonical(locale, page))))];
await write(join(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((url) => `  <url><loc>${url}</loc></url>`).join('\n')}\n</urlset>\n`);
await write(join(output, 'assets', 'og-komo.svg'), ogSvg());
await write(join(output, 'assets', 'favicon.svg'), faviconSvg());

console.log(`Built ${site.locales.length * site.pages.length} pages in ${output}`);
