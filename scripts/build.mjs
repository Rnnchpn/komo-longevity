import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { site, translations } from '../src/content.mjs';
import { locomotorCopy, locomotorReferences } from '../src/locomotor.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, 'site');
const sourceAssets = join(root, 'src', 'assets');
// Static assets are served aggressively by the CDN. Bump this whenever a
// shared stylesheet or script changes so visitors receive the matching UI.
const assetVersion = '20260814-v9';

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
const pulseJourney = {
  en: {
    navCta: 'Create my Pulse profile',
    heroEyebrow: 'KŌMØ PULSE · YOUR PERSONAL STARTING POINT',
    heroTitle: 'Know where you are.<br><em>Move towards what is next.</em>',
    heroLead: 'Create your KŌMØ Pulse profile, then move through one clear path: a first reference, your guided Mobility Check and your personal trajectory.',
    heroImageAlt: 'A woman walking calmly on a Mediterranean terrace above the sea',
    primaryCta: 'Create my KŌMØ Pulse profile',
    secondaryCta: 'See how it works',
    heroTrust: ['A personal start · around 3 minutes', 'Your first Mobility Check · around 10 minutes', 'No online diagnosis · no health data collected here'],
    miniLabel: 'A simple beginning',
    miniTitle: 'Your KŌMØ Pulse, in four quiet steps.',
    miniCta: 'Start with my profile',
    journeyEyebrow: 'THE KŌMØ PULSE PATH',
    journeyTitle: 'You are in the right place.<br><em>Here is where you go next.</em>',
    journeyLead: 'There is no need to understand the whole ecosystem before you begin. KŌMØ makes the next step visible, then keeps the thread.',
    journeyNow: 'You are here',
    steps: [
      ['01', 'Create your KŌMØ Pulse profile', 'A personal entry point for your first reference, your results and your next steps.'],
      ['02', 'Set your starting point', 'Choose why you are here and prepare the few elements that make your first check more useful.'],
      ['03', 'Complete your Mobility Check', 'A guided, educational first reading of your mobility when the conditions are right.'],
      ['04', 'Return to your KŌMØ Pulse', 'Find your reference points, the next step and, when relevant, a professional pathway.']
    ],
    profileEyebrow: 'KŌMØ PULSE · YOUR PERSONAL SPACE',
    profileTitle: 'One space.<br>Your whole <em>trajectory.</em>',
    profileLead: 'Pulse is not another health dashboard. It is the calm, personal place you return to after every KŌMØ step.',
    profileImageAlt: 'A person completing a profile on a phone in a quiet home',
    profileCta: 'Continue to my first Mobility Check',
    profileNote: 'The public site does not collect health information. Your personal profile and any clinical information belong in the secure KŌMØ Pulse environment.',
    profileRows: [['My starting point', 'Ready to create'], ['My Mobility Check', 'Your next step'], ['My trajectory', 'Begins here']],
    clinicalEyebrow: 'KŌMØ CLINICAL',
    clinicalTitle: 'When it is useful<br>to go <em>further.</em>',
    clinicalLead: 'A professional evaluation can deepen the journey when it is appropriate. Pulse preserves the continuity; the clinician remains responsible for the indication and interpretation.',
    clinicalImageAlt: 'A patient walking during a calm mobility assessment with a clinician'
  },
  fr: {
    navCta: 'Créer mon espace Pulse',
    heroEyebrow: 'KŌMØ PULSE · VOTRE POINT DE DÉPART PERSONNEL',
    heroTitle: 'Savoir où vous en êtes.<br><em>Avancer vers la suite.</em>',
    heroLead: 'Créez votre espace KŌMØ Pulse, puis avancez dans un parcours clair : un premier repère, votre Mobility Check guidé et votre trajectoire personnelle.',
    heroImageAlt: 'Une femme marche calmement sur une terrasse méditerranéenne face à la mer',
    primaryCta: 'Créer mon espace KŌMØ Pulse',
    secondaryCta: 'Voir comment cela fonctionne',
    heroTrust: ['Un point de départ personnel · environ 3 minutes', 'Votre premier Mobility Check · environ 10 minutes', 'Pas de diagnostic en ligne · aucune donnée de santé collectée ici'],
    miniLabel: 'Commencer simplement',
    miniTitle: 'Votre KŌMØ Pulse, en quatre étapes calmes.',
    miniCta: 'Commencer par mon profil',
    journeyEyebrow: 'LE PARCOURS KŌMØ PULSE',
    journeyTitle: 'Vous êtes au bon endroit.<br><em>Voici la suite.</em>',
    journeyLead: 'Il n’est pas nécessaire de comprendre tout l’écosystème avant de commencer. KŌMØ rend la prochaine étape visible, puis conserve le fil.',
    journeyNow: 'Vous êtes ici',
    steps: [
      ['01', 'Créer votre espace KŌMØ Pulse', 'Une entrée personnelle pour votre premier repère, vos résultats et les prochaines étapes.'],
      ['02', 'Préciser votre point de départ', 'Choisissez ce qui vous amène et préparez les quelques éléments utiles à votre première lecture.'],
      ['03', 'Réaliser votre Mobility Check', 'Une première lecture guidée et éducative de votre mobilité, lorsque les conditions sont réunies.'],
      ['04', 'Retrouver votre KŌMØ Pulse', 'Vos repères, la prochaine étape et, lorsque cela est pertinent, une orientation vers un professionnel.']
    ],
    profileEyebrow: 'KŌMØ PULSE · VOTRE ESPACE PERSONNEL',
    profileTitle: 'Un seul espace.<br>Toute votre <em>trajectoire.</em>',
    profileLead: 'Pulse n’est pas un tableau de bord de santé de plus. C’est l’espace personnel, simple et calme, auquel vous revenez après chaque étape KŌMØ.',
    profileImageAlt: 'Une personne complète son profil sur un téléphone dans un intérieur calme',
    profileCta: 'Continuer vers mon premier Mobility Check',
    profileNote: 'Le site public ne collecte aucune donnée de santé. Votre profil personnel et toute information clinique restent dans l’environnement sécurisé KŌMØ Pulse.',
    profileRows: [['Mon point de départ', 'Prêt à créer'], ['Mon Mobility Check', 'Votre prochaine étape'], ['Ma trajectoire', 'Commence ici']],
    clinicalEyebrow: 'KŌMØ CLINICAL',
    clinicalTitle: 'Lorsque vous avez besoin<br>d’aller <em>plus loin.</em>',
    clinicalLead: 'Une évaluation professionnelle peut approfondir le parcours lorsque cela est pertinent. Pulse conserve la continuité ; le clinicien reste responsable de l’indication et de l’interprétation.',
    clinicalImageAlt: 'Un patient marche lors d’une évaluation de mobilité calme avec une clinicienne'
  },
  es: {
    navCta: 'Crear mi espacio Pulse',
    heroEyebrow: 'KŌMØ PULSE · TU PUNTO DE PARTIDA PERSONAL',
    heroTitle: 'Saber dónde estás.<br><em>Avanzar hacia lo siguiente.</em>',
    heroLead: 'Crea tu espacio KŌMØ Pulse y sigue un camino claro: una primera referencia, tu Mobility Check guiado y tu trayectoria personal.',
    heroImageAlt: 'Una mujer camina tranquilamente por una terraza mediterránea frente al mar',
    primaryCta: 'Crear mi espacio KŌMØ Pulse',
    secondaryCta: 'Ver cómo funciona',
    heroTrust: ['Un inicio personal · unos 3 minutos', 'Tu primer Mobility Check · unos 10 minutos', 'Sin diagnóstico online · sin datos de salud recogidos aquí'],
    miniLabel: 'Empezar de forma sencilla',
    miniTitle: 'Tu KŌMØ Pulse, en cuatro pasos serenos.',
    miniCta: 'Empezar con mi perfil',
    journeyEyebrow: 'EL RECORRIDO KŌMØ PULSE',
    journeyTitle: 'Estás en el lugar adecuado.<br><em>Aquí está el siguiente paso.</em>',
    journeyLead: 'No necesitas entender todo el ecosistema antes de empezar. KŌMØ hace visible el siguiente paso y después mantiene el hilo.',
    journeyNow: 'Estás aquí',
    steps: [
      ['01', 'Crear tu espacio KŌMØ Pulse', 'Una entrada personal para tu primera referencia, tus resultados y los siguientes pasos.'],
      ['02', 'Definir tu punto de partida', 'Elige por qué estás aquí y prepara los pocos elementos útiles para tu primera lectura.'],
      ['03', 'Completar tu Mobility Check', 'Una primera lectura guiada y educativa de tu movilidad cuando las condiciones son adecuadas.'],
      ['04', 'Volver a tu KŌMØ Pulse', 'Tus referencias, el siguiente paso y, cuando sea pertinente, una orientación profesional.']
    ],
    profileEyebrow: 'KŌMØ PULSE · TU ESPACIO PERSONAL',
    profileTitle: 'Un solo espacio.<br>Toda tu <em>trayectoria.</em>',
    profileLead: 'Pulse no es otro panel de salud. Es el lugar personal, tranquilo y simple al que vuelves después de cada etapa KŌMØ.',
    profileImageAlt: 'Una persona completa un perfil en su teléfono en un hogar tranquilo',
    profileCta: 'Continuar a mi primer Mobility Check',
    profileNote: 'El sitio público no recoge datos de salud. Tu perfil personal y cualquier información clínica permanecen en el entorno seguro KŌMØ Pulse.',
    profileRows: [['Mi punto de partida', 'Listo para crear'], ['Mi Mobility Check', 'Tu siguiente paso'], ['Mi trayectoria', 'Empieza aquí']],
    clinicalEyebrow: 'KŌMØ CLINICAL',
    clinicalTitle: 'Cuando necesitas<br>ir <em>más lejos.</em>',
    clinicalLead: 'Una evaluación profesional puede profundizar el recorrido cuando sea apropiado. Pulse preserva la continuidad; el profesional sigue siendo responsable de la indicación y la interpretación.',
    clinicalImageAlt: 'Un paciente camina durante una evaluación de movilidad tranquila con una profesional'
  }
};

const komoEntrances = {
  en: {
    eyebrow: 'CHOOSE YOUR KŌMØ',
    title: 'What do you need<br><em>today?</em>',
    lead: 'Your Motion Score. Your local network. Or your KŌMØ stay on the White Coast.',
    continuity: 'One KŌMØ ecosystem: health, people and places.',
    heroCta: 'Choose my starting point',
    paths: [
      { tone: 'pulse', number: '01', audience: 'KŌMØ PULSE · MEDICAL', title: 'Your Motion Score.', body: 'A medically informed score for your mobility, health and performance — with one clear next step.', cta: 'Get my Motion Score', note: 'Health · performance · profile', page: 'pulse' },
      { tone: 'community', number: '02', audience: 'KŌMØ COMMUNITY · LOCAL', title: 'Your local network.', body: 'A personal concierge, trusted introductions and selected local experiences — so the White Coast opens up to you.', cta: 'Explore KŌMØ Community', note: 'Concierge · network · experiences', page: 'white-coast' },
      { tone: 'coast', number: '03', audience: 'KŌMØ WHITE COAST · HOSPITALITY', title: 'Your KŌMØ stay.', body: 'Selected hotels, carefully designed stays and longevity experiences made for the way you want to live.', cta: 'Explore White Coast stays', note: 'Hospitality · stays · experiences', page: 'motion-retreats' }
    ]
  },
  fr: {
    eyebrow: 'CHOISISSEZ VOTRE KŌMØ',
    title: 'De quoi avez-vous besoin<br><em>aujourd’hui&nbsp;?</em>',
    lead: 'Votre Motion Score. Votre réseau local. Ou votre séjour KŌMØ sur la White Coast.',
    continuity: 'Un seul écosystème KŌMØ : santé, réseau et expériences.',
    heroCta: 'Choisir mon point de départ',
    paths: [
      { tone: 'pulse', number: '01', audience: 'KŌMØ PULSE · MÉDICAL', title: 'Votre Motion Score.', body: 'Une lecture médicale de votre mobilité, de votre santé et de votre performance — avec une prochaine étape claire.', cta: 'Obtenir mon Motion Score', note: 'Santé · performance · profil', page: 'pulse' },
      { tone: 'community', number: '02', audience: 'KŌMØ COMMUNITY · LOCAL', title: 'Votre réseau local.', body: 'Une conciergerie personnelle, des mises en relation de confiance et des expériences locales choisies — pour que la White Coast s’ouvre à vous.', cta: 'Découvrir KŌMØ Community', note: 'Conciergerie · réseau · expériences', page: 'white-coast' },
      { tone: 'coast', number: '03', audience: 'KŌMØ WHITE COAST · HÔTELLERIE', title: 'Votre séjour KŌMØ.', body: 'Des hôtels sélectionnés, des séjours conçus avec soin et des expériences longévité pensées pour votre manière de vivre.', cta: 'Découvrir les séjours White Coast', note: 'Hôtellerie · séjours · expériences', page: 'motion-retreats' }
    ]
  },
  es: {
    eyebrow: 'ELIGE TU KŌMØ',
    title: '¿Qué necesitas<br><em>hoy?</em>',
    lead: 'Tu Motion Score. Tu red local. O tu estancia KŌMØ en la White Coast.',
    continuity: 'Un ecosistema KŌMØ: salud, red y experiencias.',
    heroCta: 'Elegir mi punto de partida',
    paths: [
      { tone: 'pulse', number: '01', audience: 'KŌMØ PULSE · MÉDICO', title: 'Tu Motion Score.', body: 'Una lectura médica de tu movilidad, salud y rendimiento — con un siguiente paso claro.', cta: 'Obtener mi Motion Score', note: 'Salud · rendimiento · perfil', page: 'pulse' },
      { tone: 'community', number: '02', audience: 'KŌMØ COMMUNITY · LOCAL', title: 'Tu red local.', body: 'Conserjería personal, conexiones de confianza y experiencias locales seleccionadas para que la White Coast se abra ante ti.', cta: 'Descubrir KŌMØ Community', note: 'Conserjería · red · experiencias', page: 'white-coast' },
      { tone: 'coast', number: '03', audience: 'KŌMØ WHITE COAST · HOSPITALITY', title: 'Tu estancia KŌMØ.', body: 'Hoteles seleccionados, estancias cuidadosamente diseñadas y experiencias de longevidad pensadas para tu forma de vivir.', cta: 'Descubrir estancias White Coast', note: 'Hotelería · estancias · experiencias', page: 'motion-retreats' }
    ]
  }
};

const chairHeroAlt = {
  en: 'A seated woman and a standing man balancing on one leg beside two wooden chairs',
  fr: 'Une femme assise et un homme debout en équilibre sur une jambe, à côté de deux chaises en bois',
  es: 'Una mujer sentada y un hombre de pie en equilibrio sobre una pierna junto a dos sillas de madera'
};

const journeyCopy = (locale) => pulseJourney[locale] || pulseJourney.en;
const entranceCopy = (locale) => komoEntrances[locale] || komoEntrances.en;
const canonical = (locale, page) => `${site.origin}${pagePath(locale, page)}`;
const communityUrl = 'https://community.komolongevity.com/';
const link = (locale, page) => page === 'white-coast' ? communityUrl : (/^https?:\/\//.test(page) || page.startsWith('mailto:') ? page : pagePath(locale, page));
const pulseStartLink = (locale) => `${pagePath(locale, 'pulse')}#start-pulse`;
const scoreLink = (locale) => pulseStartLink(locale);
const article = (locale) => `${pagePath(locale, 'library')}#articles`;

const raw = (value = '') => String(value);
const text = (value = '') => escapeHtml(value);

function pageAction(locale, page) {
  const c = translations[locale];
  const routeActions = {
    clinical: { label: c.clinical.cta, href: `${pagePath(locale, 'contact')}#contact-form` },
    'white-coast': { label: c.whiteCoast.cta, href: 'https://community.komolongevity.com/', external: true },
    'motion-retreats': { label: c.motionRetreats.cta, href: pagePath(locale, 'white-coast') },
    library: { label: c.library.cta, href: scoreLink(locale) },
    circle: { label: c.circle.cta, href: `${pagePath(locale, 'contact')}#contact-form` },
    science: { label: c.science.cta, href: `${pagePath(locale, 'contact')}#contact-form` },
    contact: { label: c.global.contactUs, href: 'mailto:contact@komolongevity.com', external: true }
  };
  return routeActions[page] || { label: journeyCopy(locale).navCta, href: scoreLink(locale) };
}

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
  const action = pageAction(locale, page);
  const navItems = [
    ['pulse', c.nav.pulse], ['clinical', c.nav.clinical], ['locomotor', c.nav.locomotor], ['library', c.nav.library], ['white-coast', c.nav.whiteCoast]
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
          ${navItems.map(([target, label]) => `<a href="${link(locale, target)}" ${page === target ? 'aria-current="page"' : ''}>${text(label)}</a>`).join('')}
          <a href="${pagePath(locale, 'contact')}" ${page === 'contact' ? 'aria-current="page"' : ''}>${text(c.nav.contact)}</a>
        </nav>
        <div class="header-actions">
          ${languageMenu(locale, page)}
          <a class="nav-cta" href="${text(action.href)}" ${action.external ? 'target="_blank" rel="noreferrer"' : ''}>${text(action.label)}</a>
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

function structuredData(locale, page, meta) {
  if (page !== 'locomotor') return '';
  const conditionNames = {
    en: 'Locomotive syndrome',
    fr: 'Syndrome locomoteur',
    es: 'Síndrome locomotor'
  };
  const data = {
    '@context': 'https://schema.org',
    '@type': 'MedicalWebPage',
    name: meta.metaTitle,
    description: meta.metaDescription,
    url: canonical(locale, page),
    inLanguage: translations[locale].lang,
    dateModified: '2026-08-13',
    about: {
      '@type': 'MedicalCondition',
      name: conditionNames[locale]
    },
    citation: locomotorReferences.map((reference) => reference.url),
    publisher: {
      '@type': 'Organization',
      name: 'KŌMØ',
      url: site.origin
    }
  };
  return `<script type="application/ld+json">${JSON.stringify(data).replaceAll('<', '\\u003c')}</script>`;
}

function layout(locale, page, content, meta) {
  const c = translations[locale];
  const action = pageAction(locale, page);
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
  <meta property="og:type" content="${page === 'locomotor' ? 'article' : 'website'}">
  <meta property="og:locale" content="${locale === 'en' ? 'en_GB' : locale === 'fr' ? 'fr_FR' : 'es_ES'}">
  <meta property="og:site_name" content="KŌMØ">
  <meta property="og:title" content="${text(meta.metaTitle)}">
  <meta property="og:description" content="${text(meta.metaDescription)}">
  <meta property="og:url" content="${canonical(locale, page)}">
  <meta property="og:image" content="${site.origin}/assets/og-komo.svg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/assets/css/site.css?v=${assetVersion}">
  ${structuredData(locale, page, meta)}
  <script defer src="/assets/js/site.js?v=${assetVersion}"></script>
</head>
<body data-page="${text(page)}">
${header(locale, page)}
<main id="main">${content}</main>
${footer(locale)}
<a class="button mobile-cta" href="${text(action.href)}" ${action.external ? 'target="_blank" rel="noreferrer"' : ''}>${text(action.label)}</a>
</body>
</html>`;
}

function buttons(locale, first, second, secondHref) {
  return `<div class="hero-actions"><a class="button" href="${scoreLink(locale)}">${text(first)} <span aria-hidden="true">↗</span></a>${second ? `<a class="button button-outline" href="${secondHref || '#ecosystem'}">${text(second)}</a>` : ''}</div>`;
}

function homePage(locale) {
  const h = translations[locale].home;
  const j = journeyCopy(locale);
  const entry = entranceCopy(locale);
  return `
    <section class="hero hero-chair" aria-label="KŌMØ — ${text(entry.heroCta)}">
      <img class="hero-chair-media" src="/assets/images/hero-chair-balance-v1.webp" alt="${text(chairHeroAlt[locale] || chairHeroAlt.en)}" width="1672" height="941" fetchpriority="high" decoding="async">
      <div class="hero-chair-control"><a href="#choose-your-entry"><span>01</span>${text(entry.heroCta)}<b aria-hidden="true">↓</b></a></div>
    </section>

    ${komoEntranceSection(locale)}

    ${pulsePathSection(locale)}

    <section class="section-tight pulse-portrait-band">
      <div class="shell">
        <div class="pulse-image-panel reveal">
          <figure class="pulse-image"><img src="/assets/images/pulse-profile-v1.webp" alt="${text(j.profileImageAlt)}" width="1200" height="1200" loading="lazy" decoding="async"></figure>
          <div class="pulse-image-copy">
            <p class="eyebrow">${text(j.profileEyebrow)}</p>
            <h2 class="section-heading">${raw(j.profileTitle)}</h2>
            <p class="section-lead">${text(j.profileLead)}</p>
            <a class="button" href="${scoreLink(locale)}">${text(j.primaryCta)} <span aria-hidden="true">↗</span></a>
            <p class="pulse-image-note">${text(j.profileNote)}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section" id="ecosystem">
      <div class="shell">
        <div class="intro-grid reveal"><div><p class="eyebrow">${text(h.introEyebrow)}</p><h2 class="section-heading">${raw(h.introTitle)}</h2></div><p class="section-lead">${text(h.introLead)}</p></div>
        <div class="ecosystem-grid">
          ${h.wheel.map((item) => `<article class="ecosystem-card reveal"><span class="ecosystem-index">${text(item.num)}</span><h3>${text(item.title)}</h3><p>${text(item.text)}</p><a class="text-link" href="${link(locale, item.page)}">${text(item.link)}</a></article>`).join('')}
        </div>
      </div>
    </section>

    <section class="section split-band">
      <div class="shell split-grid">
        <div class="reveal"><p class="eyebrow eyebrow-light">${text(h.systemEyebrow)}</p><h2 class="section-heading">${raw(h.systemTitle)}</h2><p class="section-lead">${text(h.systemLead)}</p></div>
        <div class="signal-list reveal">${h.capacities.map(([num, title, body]) => `<article class="signal"><span class="signal-num">${text(num)}</span><div><h3>${text(title)}</h3><p>${text(body)}</p></div></article>`).join('')}</div>
      </div>
    </section>

    <section class="chapter"><div class="shell chapter-inner"><div class="chapter-card reveal"><p class="eyebrow eyebrow-light">${text(h.chapterEyebrow)}</p><h2>${raw(h.chapterTitle)}</h2><p>${text(h.chapterText)}</p><div class="hero-actions"><a class="button button-light" href="${link(locale, 'white-coast')}">${text(h.chapterCta)}</a></div><div class="chapter-notes">${h.chapterNotes.map(([label, value]) => `<div><strong>${text(label)}</strong>${text(value)}</div>`).join('')}</div></div><p class="chapter-quote reveal">${raw(h.chapterQuote)}</p></div></section>

    <section class="section"><div class="shell intro-grid reveal"><div><p class="eyebrow">${text(h.scienceEyebrow)}</p><h2 class="section-heading">${raw(h.scienceTitle)}</h2></div><div><p class="section-lead">${text(h.scienceLead)}</p><a class="text-link" href="${pagePath(locale, 'science')}">${text(h.scienceCta)}</a></div></div></section>

    <section class="quote-band"><div class="shell"><blockquote class="reveal">${raw(h.finalTitle)}</blockquote><p class="section-lead" style="color:rgba(255,255,255,.72)">${text(h.finalText)}</p><div class="hero-actions"><a class="button button-light" href="${scoreLink(locale)}">${text(j.primaryCta)}</a></div></div></section>`;
}

function komoEntranceSection(locale) {
  const copy = entranceCopy(locale);
  return `<section class="section entry-choice" id="choose-your-entry">
    <div class="shell">
      <div class="entry-choice-intro reveal">
        <div><p class="eyebrow">${text(copy.eyebrow)}</p><h2 class="section-heading">${raw(copy.title)}</h2></div>
        <p class="section-lead">${text(copy.lead)}</p>
      </div>
      <div class="entry-choice-grid">
        ${copy.paths.map((path) => `<article class="entry-choice-card entry-choice-card--${text(path.tone)} reveal">
          <div class="entry-choice-top"><span>${text(path.number)}</span><span>${text(path.audience)}</span></div>
          <div class="entry-choice-copy"><h3>${text(path.title)}</h3><p>${text(path.body)}</p></div>
          <div class="entry-choice-action"><small>${text(path.note)}</small><a class="text-link" href="${link(locale, path.page)}" ${path.page === 'white-coast' ? 'target="_blank" rel="noreferrer"' : ''}>${text(path.cta)} <span aria-hidden="true">↗</span></a></div>
        </article>`).join('')}
      </div>
      <p class="entry-choice-continuity reveal"><span aria-hidden="true">→</span>${text(copy.continuity)}</p>
    </div>
  </section>`;
}

function pulsePathSection(locale) {
  const j = journeyCopy(locale);
  return `
    <section class="section pulse-path" id="your-path">
      <div class="shell">
        <div class="pulse-path-intro reveal">
          <div><p class="eyebrow">${text(j.journeyEyebrow)}</p><h2 class="section-heading">${raw(j.journeyTitle)}</h2></div>
          <p class="section-lead">${text(j.journeyLead)}</p>
        </div>
        <ol class="journey-steps">
          ${j.steps.map(([number, title, body], index) => `
            <li class="journey-step reveal ${index === 0 ? 'is-current' : ''}">
              <span class="journey-index">${text(number)}</span>
              ${index === 0 ? `<span class="journey-now">${text(j.journeyNow)}</span>` : ''}
              <h3>${text(title)}</h3>
              <p>${text(body)}</p>
            </li>`).join('')}
        </ol>
      </div>
    </section>`;
}

function genericHero(locale, page, data) {
  const ctaTarget = {
    contact: '#contact-form',
    'white-coast': 'https://community.komolongevity.com/',
    clinical: pagePath(locale, 'contact'),
    science: pagePath(locale, 'contact'),
    circle: pagePath(locale, 'contact'),
    'motion-retreats': link(locale, 'white-coast')
  }[page] || scoreLink(locale);
  const external = page === 'white-coast';
  const ctaLabel = page === 'pulse' ? journeyCopy(locale).primaryCta : data.cta;
  return `<section class="page-hero"><div class="shell"><p class="breadcrumb"><a href="${pagePath(locale)}">KŌMØ</a><span>/</span><span>${text(data.eyebrow)}</span></p><p class="eyebrow eyebrow-light reveal">${text(data.eyebrow)}</p><h1 class="display reveal">${raw(data.title)}</h1><p class="lede reveal">${text(data.lead)}</p><div class="hero-actions"><a class="button button-light" href="${ctaTarget}" ${external ? 'target="_blank" rel="noreferrer"' : ''}>${text(ctaLabel)} <span aria-hidden="true">↗</span></a></div><p class="hero-note">${text(data.note)}</p></div></section>`;
}

function introBlock(data) {
  return `<section class="section"><div class="shell"><div class="intro-grid reveal"><div><p class="eyebrow">${text(data.introEyebrow)}</p><h2 class="section-heading">${raw(data.introTitle)}</h2></div><p class="section-lead">${text(data.introLead)}</p></div>`;
}

function pulsePage(locale) {
  const c = translations[locale]; const p = c.pulse;
  const j = journeyCopy(locale);
  return `${genericHero(locale, 'pulse', p)}
  <section class="section pulse-entry" id="start-pulse"><div class="shell"><div class="pulse-entry-grid">
    <figure class="pulse-portrait reveal"><img src="/assets/images/pulse-profile-v1.webp" alt="${text(j.profileImageAlt)}" width="1200" height="1200" loading="lazy" decoding="async"></figure>
    <div class="pulse-entry-copy reveal">
      <p class="eyebrow">${text(j.profileEyebrow)}</p>
      <h2 class="section-heading">${raw(j.profileTitle)}</h2>
      <p class="section-lead">${text(j.profileLead)}</p>
      <ol class="pulse-entry-steps">${j.steps.slice(0, 3).map(([number, title, body]) => `<li><span>${text(number)}</span><div><strong>${text(title)}</strong><p>${text(body)}</p></div></li>`).join('')}</ol>
      <a class="button" href="#mobility-check">${text(j.profileCta)} <span aria-hidden="true">↗</span></a>
      <p class="pulse-entry-note">${text(j.profileNote)}</p>
    </div>
    <aside class="pulse-dashboard reveal" id="pulse-home" aria-label="KŌMØ Pulse profile preview">
      <div class="pulse-dashboard-head"><span>KŌMØ Pulse</span><span class="pulse-live">●</span></div>
      <div class="pulse-dashboard-profile"><span class="pulse-avatar">K</span><div><small>${text(j.profileEyebrow)}</small><strong>${text(j.primaryCta)}</strong></div></div>
      <div class="pulse-dashboard-list">${j.profileRows.map(([label, value], index) => `<div><span>${text(label)}</span><strong class="${index === 0 ? 'is-warm' : ''}">${text(value)}</strong></div>`).join('')}</div>
      <div class="pulse-dashboard-next"><span>01</span><p>${text(j.steps[0][1])}</p></div>
    </aside>
  </div></div></section>
  <section class="section-tight"><div class="shell"><div class="entry-cards">${p.sections.map(([eyebrow, title, body]) => `<article class="entry-card reveal"><span class="entry-orb" aria-hidden="true"></span><p class="eyebrow">${text(eyebrow)}</p><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}</div></div></section>
  <section class="section" id="mobility-check"><div class="shell"><div class="intro-grid reveal"><div><p class="eyebrow">${text(p.methodEyebrow)}</p><h2 class="section-heading">${raw(p.methodTitle)}</h2></div><p class="section-lead">${text(p.methodLead)}</p></div><div class="steps reveal">${p.methodSteps.map(([n, t, b]) => `<article class="step"><span class="step-num">${text(n)}</span><h3>${text(t)}</h3><p>${text(b)}</p></article>`).join('')}</div><div class="article-callout reveal"><strong>${text(c.global.medicalNotice.split('.')[0])}</strong>${text(c.global.medicalNotice)}</div></div></section>
  <section class="section-tight" style="background:var(--paper-strong)"><div class="shell"><p class="eyebrow">${text(p.compareEyebrow)}</p><h2 class="section-heading reveal">${raw(p.compareTitle)}</h2><div class="comparison reveal"><table><thead><tr>${p.compareHead.map((col) => `<th>${text(col)}</th>`).join('')}</tr></thead><tbody>${p.compareRows.map((row) => `<tr>${row.map((item) => `<td>${text(item)}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div></section>
  ${finalBand(locale, p.finalTitle, p.finalText, j.primaryCta)}`;
}

function clinicalPage(locale) {
  const c = translations[locale]; const p = c.clinical;
  const j = journeyCopy(locale);
  return `${genericHero(locale, 'clinical', p)}
  <section class="section-tight clinical-visual-section"><div class="shell clinical-visual-grid">
    <figure class="clinical-image reveal"><img src="/assets/images/clinical-pathway-v1.webp" alt="${text(j.clinicalImageAlt)}" width="1536" height="1024" loading="lazy" decoding="async"></figure>
    <div class="clinical-visual-copy reveal"><p class="eyebrow">${text(j.clinicalEyebrow)}</p><h2 class="section-heading">${raw(j.clinicalTitle)}</h2><p class="section-lead">${text(j.clinicalLead)}</p><a class="button" href="${scoreLink(locale)}">${text(j.primaryCta)} <span aria-hidden="true">↗</span></a></div>
  </div></section>
  ${introBlock(p)}<div class="steps reveal">${p.steps.map(([n,t,b]) => `<article class="step"><span class="step-num">${text(n)}</span><h3>${text(t)}</h3><p>${text(b)}</p></article>`).join('')}</div></div></section>
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
  <section class="section-tight" id="articles" style="background:var(--paper-strong)"><div class="shell"><div class="article-grid">${p.articles.map(([tag,title,body], index) => `<article class="article-card reveal"><span class="tag">${text(tag)}</span><h3>${text(title)}</h3><p>${text(body)}</p><a class="text-link" href="${index === 1 ? pagePath(locale, 'locomotor') : article(locale)}">${text(c.global.readMore)}</a></article>`).join('')}</div></div></section>${finalBand(locale,p.finalTitle,p.finalText,p.cta,'pulse')}`;
}

function locomotorPage(locale) {
  const p = locomotorCopy[locale] || locomotorCopy.en;
  const citation = (...indexes) => `<span class="inline-citations" aria-label="Sources">${indexes.map((index) => `<a href="#ref-${index}">[${index}]</a>`).join('')}</span>`;
  const testVisuals = {
    '01': '/assets/images/locomotor-stand-up-test.svg',
    '02': '/assets/images/locomotor-two-step-test.svg',
    '03': '/assets/images/locomotor-glfs-25.svg'
  };
  return `
  <section class="locomotor-hero">
    <div class="shell">
      <p class="breadcrumb locomotor-breadcrumb"><a href="${pagePath(locale)}">KŌMØ</a><span>/</span><a href="${pagePath(locale, 'library')}">Library</a><span>/</span><span>Locomotor</span></p>
      <div class="locomotor-hero-grid">
        <div class="locomotor-hero-copy">
          <p class="eyebrow eyebrow-light reveal">${text(p.eyebrow)}</p>
          <h1 class="display reveal">${raw(p.title)}</h1>
          <p class="lede reveal">${text(p.lead)} ${citation('01', '02')}</p>
          <div class="hero-actions reveal"><a class="button button-light" href="#framework">${text(p.heroPrimary)}</a><a class="button button-ghost-light" href="${scoreLink(locale)}">${text(p.heroSecondary)} <span aria-hidden="true">↗</span></a></div>
          <p class="locomotor-review-note reveal">${text(p.note)}</p>
        </div>
        <aside class="locomotor-signal-card reveal" aria-label="${text(p.heroCard.label)}">
          <div class="locomotor-card-head"><span>${text(p.heroCard.label)}</span><span>JOA · 2020</span></div>
          <h2>${raw(p.heroCard.title)}</h2>
          <ol>${p.heroCard.rows.map(([number, title, body]) => `<li><span>${text(number)}</span><div><strong>${text(title)}</strong><small>${text(body)}</small></div></li>`).join('')}</ol>
          <p>${text(p.heroCard.foot)}</p>
        </aside>
      </div>
    </div>
  </section>

  <nav class="locomotor-jump" aria-label="${text(p.jumpLabel)}"><div class="shell"><strong>${text(p.jumpLabel)}</strong><div>${p.jumps.map(([href, label]) => `<a href="${href}">${text(label)}</a>`).join('')}</div></div></nav>

  <section class="section locomotor-definition" id="definition">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.definition.eyebrow)}</p><h2 class="section-heading">${raw(p.definition.title)}</h2></div><p class="section-lead">${text(p.definition.lead)} ${citation('01', '02')}</p></div>
      <div class="locomotor-concept-grid">
        <article class="locomotor-concept reveal"><span>01</span><h3>${text(p.definition.originTitle)}</h3><p>${text(p.definition.originBody)}</p></article>
        <article class="locomotor-concept reveal"><span>02</span><h3>${text(p.definition.systemTitle)}</h3><p>${text(p.definition.systemBody)}</p></article>
      </div>
      <div class="locomotor-system-grid">${p.definition.components.map(([title, body], index) => `<article class="locomotor-system-card reveal"><span>0${index + 1}</span><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}</div>
      <aside class="locomotor-not reveal"><div><p class="eyebrow">BOUNDARIES</p><h3>${text(p.definition.notTitle)}</h3></div><ul>${p.definition.notItems.map((item) => `<li>${text(item)}</li>`).join('')}</ul></aside>
    </div>
  </section>

  <section class="section locomotor-framework" id="framework">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.framework.eyebrow)}</p><h2 class="section-heading">${raw(p.framework.title)}</h2></div><p class="section-lead">${text(p.framework.lead)} ${citation('01', '04')}</p></div>
      <div class="locomotor-stage-grid">${p.framework.stageCards.map(([number, title, body, action]) => `<article class="locomotor-stage reveal" data-stage="${text(number)}"><span class="locomotor-stage-number">${text(number)}</span><h3>${text(title)}</h3><p>${text(body)}</p><small>${text(action)}</small></article>`).join('')}</div>
      <div class="locomotor-table-wrap reveal">
        <table class="locomotor-table">
          <caption>${text(p.framework.tableCaption)}</caption>
          <thead><tr>${p.framework.headers.map((header) => `<th scope="col">${text(header)}</th>`).join('')}</tr></thead>
          <tbody>${p.framework.rows.map((row) => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${text(cell)}</th>` : `<td>${text(cell)}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
      <p class="locomotor-formula reveal">${text(p.framework.formula)}</p>
      <div class="locomotor-evidence-note reveal"><strong>${text(p.framework.caveatTitle)}</strong><p>${text(p.framework.caveatBody)}</p></div>
    </div>
  </section>

  <section class="section" id="tests">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.tests.eyebrow)}</p><h2 class="section-heading">${raw(p.tests.title)}</h2></div><p class="section-lead">${text(p.tests.lead)} ${citation('01', '03')}</p></div>
      <div class="locomotor-test-grid">${p.tests.cards.map((card) => `<article class="locomotor-test reveal"><div class="locomotor-test-head"><span>${text(card.number)}</span><small>${text(card.purpose)}</small></div><h3>${text(card.title)}</h3><figure class="locomotor-test-visual"><img src="${testVisuals[card.number]}" alt="${text(card.visualAlt)}" width="1200" height="760" loading="lazy" decoding="async"></figure><p>${text(card.body)}</p><dl><div><dt>${text(p.tests.methodLabel)}</dt><dd>${text(card.detail)}</dd></div><div><dt>${text(p.tests.safetyLabel)}</dt><dd>${text(card.safety)}</dd></div></dl></article>`).join('')}</div>
      <div class="locomotor-test-actions reveal"><a class="text-link" href="https://locomo-joa.jp/en" target="_blank" rel="noreferrer">${text(p.tests.sourceCta)} <span aria-hidden="true">↗</span></a></div>
      <aside class="locomotor-safety reveal"><span aria-hidden="true">!</span><div><h3>${text(p.tests.safetyTitle)}</h3><p>${text(p.tests.safetyBody)}</p></div></aside>
    </div>
  </section>

  <section class="section-tight locomotor-distinction">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.distinctions.eyebrow)}</p><h2 class="section-heading">${raw(p.distinctions.title)}</h2></div><p class="section-lead">${text(p.distinctions.lead)} ${citation('05')}</p></div>
      <div class="locomotor-table-wrap reveal"><table class="locomotor-table locomotor-compare"><thead><tr>${p.distinctions.headers.map((header) => `<th scope="col">${text(header)}</th>`).join('')}</tr></thead><tbody>${p.distinctions.rows.map((row) => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${text(cell)}</th>` : `<td>${text(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <p class="locomotor-table-foot reveal">${text(p.distinctions.foot)}</p>
    </div>
  </section>

  <section class="section locomotor-action" id="action">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.action.eyebrow)}</p><h2 class="section-heading">${raw(p.action.title)}</h2></div><p class="section-lead">${text(p.action.lead)}</p></div>
      <ol class="locomotor-action-grid">${p.action.steps.map(([number, title, body]) => `<li class="reveal"><span>${text(number)}</span><div><h3>${text(title)}</h3><p>${text(body)}</p></div></li>`).join('')}</ol>
      <div class="locomotor-training reveal">
        <div class="locomotor-training-intro"><p class="eyebrow">${text(p.action.trainingEyebrow)}</p><h3>${raw(p.action.trainingTitle)}</h3><p>${text(p.action.trainingLead)} ${citation('01')}</p></div>
        <div class="locomotor-training-grid">${p.action.trainingCards.map(([number, title, body, target]) => `<article><span>${text(number)}</span><h4>${text(title)}</h4><p>${text(body)}</p><small>${text(target)}</small></article>`).join('')}</div>
      </div>
      <div class="locomotor-evidence-note reveal"><strong>${text(p.action.evidenceTitle)} ${citation('07')}</strong><p>${text(p.action.evidenceBody)}</p></div>
      <aside class="locomotor-urgent reveal"><h3>${text(p.action.urgentTitle)}</h3><ul>${p.action.urgentItems.map((item) => `<li>${text(item)}</li>`).join('')}</ul></aside>
    </div>
  </section>

  <section class="section locomotor-evidence" id="evidence">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.evidence.eyebrow)}</p><h2 class="section-heading">${raw(p.evidence.title)}</h2></div><p class="section-lead">${text(p.evidence.lead)}</p></div>
      <div class="locomotor-evidence-grid">${p.evidence.cards.map(([value, title, body], index) => `<article class="reveal"><span>${text(value)}</span><h3>${text(title)}</h3><p>${text(body)} ${index === 0 ? citation('02') : index === 1 ? citation('01') : index === 2 ? citation('04') : citation('08')}</p></article>`).join('')}</div>
      <div class="locomotor-context-grid"><article class="reveal"><span>COHORT</span><h3>${text(p.evidence.prevalenceTitle)}</h3><p>${text(p.evidence.prevalenceBody)} ${citation('04')}</p></article><article class="reveal"><span>AGE</span><h3>${text(p.evidence.youngerTitle)}</h3><p>${text(p.evidence.youngerBody)} ${citation('06')}</p></article></div>
      <div class="locomotor-status reveal">${p.evidence.status.map(([label, body], index) => `<div data-level="${index + 1}"><strong>${text(label)}</strong><p>${text(body)}</p></div>`).join('')}</div>
    </div>
  </section>

  <section class="locomotor-komo" id="komo-layer">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow eyebrow-light">${text(p.komo.eyebrow)}</p><h2 class="section-heading">${raw(p.komo.title)}</h2></div><p class="section-lead">${text(p.komo.lead)}</p></div>
      <div class="locomotor-komo-grid">${p.komo.additions.map(([title, body], index) => `<article class="reveal"><span>0${index + 1}</span><h3>${text(title)}</h3><p>${text(body)}</p></article>`).join('')}</div>
      <div class="locomotor-komo-status reveal"><strong>${text(p.komo.statusTitle)}</strong><p>${text(p.komo.statusBody)}</p><a class="button button-light" href="${pagePath(locale, 'clinical')}">${text(p.komo.cta)} <span aria-hidden="true">↗</span></a></div>
    </div>
  </section>

  <section class="section locomotor-faq">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.faq.eyebrow)}</p><h2 class="section-heading">${raw(p.faq.title)}</h2></div></div>
      <div class="locomotor-faq-list">${p.faq.items.map(([question, answer], index) => `<details class="reveal" ${index === 0 ? 'open' : ''}><summary><span>0${index + 1}</span>${text(question)}</summary><p>${text(answer)}</p></details>`).join('')}</div>
    </div>
  </section>

  <section class="section-tight locomotor-references">
    <div class="shell">
      <div class="intro-grid reveal"><div><p class="eyebrow">${text(p.references.eyebrow)}</p><h2 class="section-heading">${raw(p.references.title)}</h2></div><p class="section-lead">${text(p.references.lead)}</p></div>
      <ol>${locomotorReferences.map((reference) => `<li class="reveal" id="ref-${text(reference.index)}"><span>${text(reference.index)}</span><p>${text(reference.citation)}</p><a href="${text(reference.url)}" target="_blank" rel="noreferrer" aria-label="${text(p.references.link)} ${text(reference.index)}">${text(p.references.link)} ↗</a></li>`).join('')}</ol>
    </div>
  </section>

  <section class="quote-band locomotor-final"><div class="shell"><blockquote class="reveal">${raw(p.finalTitle)}</blockquote><p class="section-lead">${text(p.finalText)}</p><div class="hero-actions"><a class="button button-light" href="${scoreLink(locale)}">${text(p.finalCta)} <span aria-hidden="true">↗</span></a></div></div></section>`;
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
    locomotor: locomotorPage,
    circle: circlePage,
    science: sciencePage,
    contact: contactPage
  }[page](locale);
  const data = page === 'locomotor' ? (locomotorCopy[locale] || locomotorCopy.en) : page === 'index' ? c.home : c[page === 'white-coast' ? 'whiteCoast' : page === 'motion-retreats' ? 'motionRetreats' : page];
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
