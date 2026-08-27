import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site = join(process.cwd(), 'site');

const pages = [
  {
    locale: 'fr', file: join(site, 'fr', 'index.html'),
    title: 'KŌMØ Case — Système portable de mesure locomotrice | KŌMØ',
    description: 'KŌMØ Case associe six capteurs Myodev, des tests fonctionnels standardisés et KŌMØ Pulse pour structurer un bilan locomoteur portable et son suivi.',
    eyebrow: 'KŌMØ CASE · POWERED BY MYODEV',
    hero: 'Mesurer le mouvement.<br><em>Clairement.</em>',
    lead: 'KŌMØ Case est un système portable d’évaluation locomotrice associant tests fonctionnels, acquisition par capteurs et suivi longitudinal dans KŌMØ Pulse.',
    signature: '6 CAPTEURS · TESTS FONCTIONNELS · PULSE · INTERPRÉTATION CLINIQUE',
    caseHref: '/fr/case/', caseCta: 'Découvrir KŌMØ Case →', pulseCta: 'Accéder à Pulse ↗',
    caption: 'Photographie du système réel KŌMØ Case',
    stripEyebrow: 'UN SYSTÈME INTÉGRÉ', stripTitle: 'De la mesure à la trajectoire.',
    stripLead: 'KŌMØ associe un protocole fonctionnel standardisé, six capteurs Myodev et Pulse pour rendre la fonction locomotrice plus lisible dans le temps.',
    steps: [['01','Préparer','Objectif, contexte et repères utiles.'],['02','Mesurer','Tests fonctionnels et acquisition instrumentée.'],['03','Interpréter','Lecture contextualisée par le professionnel.'],['04','Suivre','Résultats et nouvelles évaluations dans Pulse.']],
    domains: [['Muscle','Activation & symétrie'],['Marche','Vitesse & stabilité'],['Posture','Alignement utile'],['Tests fonctionnels','Lever · Two-Step · 4 m'],['Fonction quotidienne','Mobilité vécue'],['Biologie','Lorsque cliniquement indiquée']],
    boundary: 'Le KŌMØ Motion Score structure la restitution ; il ne pose pas de diagnostic et ne remplace pas l’examen clinique.'
  },
  {
    locale: 'en', file: join(site, 'index.html'),
    title: 'KŌMØ Case — Portable locomotor measurement system | KŌMØ',
    description: 'KŌMØ Case combines six Myodev sensors, standardised functional tests and KŌMØ Pulse to structure portable locomotor assessment and longitudinal follow-up.',
    eyebrow: 'KŌMØ CASE · POWERED BY MYODEV',
    hero: 'Measure movement.<br><em>Clearly.</em>',
    lead: 'KŌMØ Case is a portable locomotor assessment system combining functional testing, sensor-based acquisition and longitudinal follow-up in KŌMØ Pulse.',
    signature: '6 SENSORS · FUNCTIONAL TESTS · PULSE · CLINICIAN-LED INTERPRETATION',
    caseHref: '/case/', caseCta: 'Discover KŌMØ Case →', pulseCta: 'Access Pulse ↗',
    caption: 'Photograph of the real KŌMØ Case system',
    stripEyebrow: 'ONE INTEGRATED SYSTEM', stripTitle: 'From measurement to trajectory.',
    stripLead: 'KŌMØ combines a standardised functional protocol, six Myodev sensors and Pulse to make locomotor function more legible over time.',
    steps: [['01','Prepare','Goals, context and useful reference points.'],['02','Measure','Functional testing and instrumented acquisition.'],['03','Interpret','Clinician-led contextual interpretation.'],['04','Follow','Results and reassessments inside Pulse.']],
    domains: [['Muscle','Activation & symmetry'],['Gait','Speed & stability'],['Posture','Useful alignment'],['Functional tests','Chair · Two-Step · 4 m'],['Daily function','Lived mobility'],['Biology','When clinically indicated']],
    boundary: 'The KŌMØ Motion Score structures the report; it does not diagnose a condition or replace clinical examination.'
  },
  {
    locale: 'es', file: join(site, 'es', 'index.html'),
    title: 'KŌMØ Case — Sistema portátil de medición locomotora | KŌMØ',
    description: 'KŌMØ Case combina seis sensores Myodev, pruebas funcionales estandarizadas y KŌMØ Pulse para estructurar una evaluación locomotora portátil y su seguimiento.',
    eyebrow: 'KŌMØ CASE · POWERED BY MYODEV',
    hero: 'Medir el movimiento.<br><em>Con claridad.</em>',
    lead: 'KŌMØ Case es un sistema portátil de evaluación locomotora que combina pruebas funcionales, adquisición mediante sensores y seguimiento longitudinal en KŌMØ Pulse.',
    signature: '6 SENSORES · PRUEBAS FUNCIONALES · PULSE · INTERPRETACIÓN CLÍNICA',
    caseHref: '/es/case/', caseCta: 'Descubrir KŌMØ Case →', pulseCta: 'Acceder a Pulse ↗',
    caption: 'Fotografía del sistema real KŌMØ Case',
    stripEyebrow: 'UN SISTEMA INTEGRADO', stripTitle: 'De la medición a la trayectoria.',
    stripLead: 'KŌMØ combina un protocolo funcional estandarizado, seis sensores Myodev y Pulse para hacer más legible la función locomotora a lo largo del tiempo.',
    steps: [['01','Preparar','Objetivo, contexto y referencias útiles.'],['02','Medir','Pruebas funcionales y adquisición instrumentada.'],['03','Interpretar','Lectura contextualizada por el profesional.'],['04','Seguir','Resultados y nuevas evaluaciones en Pulse.']],
    domains: [['Músculo','Activación y simetría'],['Marcha','Velocidad y estabilidad'],['Postura','Alineación útil'],['Pruebas funcionales','Silla · Two-Step · 4 m'],['Función cotidiana','Movilidad percibida'],['Biología','Cuando está clínicamente indicada']],
    boundary: 'El KŌMØ Motion Score estructura la restitución; no diagnostica una enfermedad ni sustituye la exploración clínica.'
  }
];

const CSS = `<style id="homepage-product-stepup-v1-style">
:root{--kps-black:#090a0a;--kps-ivory:#f3f0e8;--kps-ink:#171817;--kps-sage:#91aa9f;--kps-beige:#d7c19f;--kps-line:rgba(255,255,255,.14)}
.site-header{background:rgba(9,10,10,.94)!important;border-bottom-color:rgba(255,255,255,.08)!important;color:#fff!important;backdrop-filter:blur(20px)!important}
.site-header .brand,.site-header .primary-nav a,.site-header .language>button{color:#f7f5ef!important}.site-header .nav-cta{background:#f0e7d7!important;border-color:#f0e7d7!important;color:#0a0a0a!important}.site-header .menu-toggle{border-color:rgba(255,255,255,.24)!important}.site-header .menu-toggle span,.site-header .menu-toggle::before,.site-header .menu-toggle::after{background:#fff!important}
.kpf-hero{position:relative;overflow:hidden;padding:clamp(64px,7vw,110px) 0 clamp(58px,7vw,94px)!important;background:radial-gradient(circle at 72% 18%,rgba(145,170,159,.10),transparent 32%),linear-gradient(145deg,#0c0d0d,#080909 72%)!important;color:#f6f3ed!important}
.kpf-hero::before{content:'';position:absolute;inset:auto -8% -48% 35%;height:70%;border:1px solid rgba(255,255,255,.07);border-radius:50%;transform:rotate(-8deg);pointer-events:none}
.kpf-hero .kpf-shell{width:min(calc(100% - 56px),1440px)!important}.kpf-hero .kpf-brand{display:none!important}.kpf-hero-grid{grid-template-columns:minmax(360px,.82fr) minmax(520px,1.18fr)!important;gap:clamp(34px,5vw,82px)!important;align-items:center!important;margin-top:0!important}
.kpf-copy{padding-top:0!important;border-top:0!important}.kpf-ey{margin-bottom:22px!important;color:var(--kps-beige)!important;font-size:10px!important;letter-spacing:.18em!important}.kpf-copy h1{max-width:690px;margin:0!important;color:#fff!important;font:650 clamp(56px,6.4vw,100px)/.86 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important;letter-spacing:-.065em!important}.kpf-copy h1 em{display:inline-block;color:var(--kps-sage)!important;font-style:normal!important}.kpf-lead{max-width:620px!important;margin-top:28px!important;color:rgba(246,243,237,.72)!important;font:400 clamp(17px,1.35vw,21px)/1.52 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif!important}.kpf-signature{max-width:620px;margin-top:28px!important;color:rgba(246,243,237,.55)!important;font-size:9px!important;line-height:1.5!important;letter-spacing:.12em!important}.kpf-actions{margin-top:30px!important;gap:12px!important}.kpf-actions .kpf-btn{min-height:52px!important;padding:0 22px!important;border-radius:10px!important;background:var(--kps-beige)!important;color:#111!important;font-size:10px!important;letter-spacing:.05em!important;text-transform:uppercase}.kpf-actions .kpf-link{min-height:52px;padding:0 20px;border:1px solid rgba(255,255,255,.32)!important;border-radius:10px!important;color:#fff!important;display:inline-flex!important;align-items:center!important;text-decoration:none!important;font-size:10px!important;letter-spacing:.05em!important;text-transform:uppercase}
.kpf-visual{position:relative!important;container-type:inline-size;overflow:hidden!important;aspect-ratio:1122/1402!important;margin:0!important;border:1px solid rgba(255,255,255,.09)!important;border-radius:24px!important;background:#efebe2!important;box-shadow:0 34px 90px rgba(0,0,0,.42)!important}.kpf-visual img{width:100%!important;height:100%!important;object-fit:contain!important;object-position:center!important;background:#efebe2!important;filter:contrast(1.03) saturate(.93)!important}.kpf-visual figcaption{left:18px!important;right:18px!important;bottom:16px!important;padding:11px 14px!important;border:1px solid rgba(255,255,255,.14)!important;border-radius:999px!important;background:rgba(8,10,10,.74)!important;color:rgba(255,255,255,.76)!important;font-size:8px!important;backdrop-filter:blur(16px)!important}.kpf-visual figcaption a{color:#fff!important}
.kps-login{position:absolute;z-index:4;left:20.7%;top:53.1%;width:24.2%;height:22.9%;padding:2.5cqw 2.4cqw 2cqw;border-radius:1.45cqw;background:linear-gradient(160deg,#101819,#0b1112 76%);box-shadow:0 1.1cqw 3cqw rgba(0,0,0,.38),inset 0 0 0 .12cqw rgba(255,255,255,.08);transform:rotate(1.5deg);transform-origin:center;color:#f5f3ed;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;pointer-events:none}.kps-login-brand{display:block;text-align:center;font-size:1.45cqw;font-weight:700;letter-spacing:.18em}.kps-login-title{display:block;margin-top:1.7cqw;text-align:center;font-size:1.45cqw;font-weight:650}.kps-login-label{display:block;margin-top:1.6cqw;color:rgba(255,255,255,.55);font-size:.8cqw}.kps-login-field{display:block;height:2.25cqw;margin-top:.55cqw;border:.08cqw solid rgba(255,255,255,.16);border-radius:.45cqw;background:rgba(255,255,255,.025)}.kps-login-row{display:flex;justify-content:space-between;margin-top:1cqw;color:rgba(255,255,255,.48);font-size:.67cqw}.kps-login-button{display:grid;place-items:center;height:2.65cqw;margin-top:1.25cqw;border-radius:.55cqw;background:#6eaa99;color:white;font-size:.76cqw;font-weight:750;letter-spacing:.03em;text-transform:uppercase}.kps-login-create{display:block;margin-top:1.2cqw;text-align:center;color:#8dbdad;font-size:.68cqw}
.kps-system{padding:clamp(70px,8vw,116px) 0;background:var(--kps-ivory);color:var(--kps-ink)}.kps-shell{width:min(calc(100% - 56px),1440px);margin:auto}.kps-intro{display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(36px,8vw,120px);align-items:end}.kps-ey{margin:0 0 14px;color:#6d8f82;font-size:10px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}.kps-title{margin:0;font:600 clamp(42px,5.2vw,76px)/.94 Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;letter-spacing:-.055em}.kps-lead{max-width:680px;margin:0;color:#656660;font-size:clamp(16px,1.35vw,20px);line-height:1.58}.kps-steps{display:grid;grid-template-columns:repeat(4,1fr);margin-top:clamp(44px,6vw,76px);border-top:1px solid rgba(23,24,23,.22);border-bottom:1px solid rgba(23,24,23,.22)}.kps-step{min-height:200px;padding:22px 24px 24px 0;border-right:1px solid rgba(23,24,23,.14)}.kps-step:not(:first-child){padding-left:24px}.kps-step:last-child{border-right:0}.kps-step small{color:#6d8f82;font-size:9px;font-weight:800;letter-spacing:.12em}.kps-step h3{margin:56px 0 8px;font-size:24px;letter-spacing:-.035em}.kps-step p{margin:0;color:#777870;font-size:12px;line-height:1.55}.kps-domains{display:grid;grid-template-columns:repeat(6,1fr);gap:0;margin-top:32px}.kps-domain{padding:18px 18px 18px 0;border-right:1px solid rgba(23,24,23,.12)}.kps-domain:not(:first-child){padding-left:18px}.kps-domain:last-child{border-right:0}.kps-domain strong{display:block;font-size:12px}.kps-domain span{display:block;margin-top:7px;color:#81827b;font-size:10px;line-height:1.45}.kps-boundary{margin:26px 0 0;padding-top:20px;border-top:1px solid rgba(23,24,23,.12);color:#7a7b74;font-size:10px;line-height:1.55}
@media(max-width:980px){.kpf-hero-grid{grid-template-columns:1fr!important}.kpf-hero .kpf-shell,.kps-shell{width:min(calc(100% - 40px),820px)!important}.kpf-copy h1{max-width:760px}.kpf-visual{width:min(100%,650px);margin:12px auto 0!important}.kps-intro{grid-template-columns:1fr;gap:18px}.kps-steps{grid-template-columns:1fr 1fr}.kps-step:nth-child(2){border-right:0}.kps-step:nth-child(-n+2){border-bottom:1px solid rgba(23,24,23,.14)}.kps-step:nth-child(3){padding-left:0}.kps-domains{grid-template-columns:repeat(3,1fr)}.kps-domain:nth-child(3){border-right:0}.kps-domain:nth-child(n+4){border-top:1px solid rgba(23,24,23,.12)}.kps-domain:nth-child(4){padding-left:0}}
@media(max-width:620px){.kpf-hero{padding:44px 0 54px!important}.kpf-hero .kpf-shell,.kps-shell{width:min(calc(100% - 28px),820px)!important}.kpf-copy h1{font-size:clamp(46px,14.8vw,66px)!important}.kpf-lead{font-size:16px!important}.kpf-actions{display:grid!important}.kpf-actions .kpf-btn,.kpf-actions .kpf-link{width:100%!important;justify-content:center!important}.kpf-visual{border-radius:18px!important}.kpf-visual figcaption{left:10px!important;right:10px!important;bottom:10px!important}.kps-system{padding:58px 0}.kps-title{font-size:42px}.kps-lead{font-size:15px}.kps-steps{grid-template-columns:1fr}.kps-step,.kps-step:not(:first-child),.kps-step:nth-child(3){min-height:0;padding:18px 0;border-right:0;border-bottom:1px solid rgba(23,24,23,.14)}.kps-step h3{margin:24px 0 6px}.kps-domains{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;margin-right:-14px;padding-right:14px}.kps-domain,.kps-domain:not(:first-child),.kps-domain:nth-child(4){flex:0 0 60%;padding:16px 18px 16px 0;border-top:0;border-right:1px solid rgba(23,24,23,.12);scroll-snap-align:start}.kps-domain:not(:first-child){padding-left:18px}}
</style>`;

const loginOverlay = `<div class="kps-login" aria-hidden="true"><span class="kps-login-brand">KŌMØ PULSE</span><span class="kps-login-title">Connexion</span><span class="kps-login-label">Email</span><span class="kps-login-field"></span><span class="kps-login-label">Mot de passe</span><span class="kps-login-field"></span><span class="kps-login-row"><span>Rester connecté</span><span>Mot de passe oublié ?</span></span><span class="kps-login-button">Se connecter</span><span class="kps-login-create">Créer un compte</span></div>`;

function replaceMeta(html, page) {
  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${page.title}</title>`);
  if (/<meta\s+name=["']description["'][^>]*>/i.test(html)) {
    html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${page.description.replaceAll('"','&quot;')}">`);
  }
  return html;
}

function replaceHero(html, page) {
  const marker = 'class="kpf-hero';
  const markerAt = html.indexOf(marker);
  if (markerAt < 0) throw new Error(`[homepage-product-stepup-v1] ${page.locale}: .kpf-hero not found`);
  const start = html.lastIndexOf('<section', markerAt);
  const endAt = html.indexOf('</section>', markerAt);
  if (start < 0 || endAt < 0) throw new Error(`[homepage-product-stepup-v1] ${page.locale}: hero boundaries not found`);
  const end = endAt + '</section>'.length;
  let hero = html.slice(start, end);

  hero = hero.replace(/<p class="kpf-ey">[\s\S]*?<\/p>/, `<p class="kpf-ey">${page.eyebrow}</p>`);
  hero = hero.replace(/<h1(?:\s[^>]*)?>[\s\S]*?<\/h1>/, `<h1>${page.hero}</h1>`);
  hero = hero.replace(/<p class="kpf-lead">[\s\S]*?<\/p>/, `<p class="kpf-lead">${page.lead}</p>`);
  hero = hero.replace(/<p class="kpf-signature">[\s\S]*?<\/p>/, `<p class="kpf-signature">${page.signature}</p>`);
  hero = hero.replace(/<div class="kpf-actions">[\s\S]*?<\/div>/, `<div class="kpf-actions"><a class="kpf-btn" href="${page.caseHref}">${page.caseCta}</a><a class="kpf-link" href="https://pulse.komolongevity.com/">${page.pulseCta}</a></div>`);
  hero = hero.replace(/<img\s+[^>]*>/, `<img src="/assets/images/komo-case-score.jpeg" alt="KŌMØ Case with six Myodev sensors and KŌMØ Pulse" width="1122" height="1402" fetchpriority="high" decoding="async">`);
  if (!hero.includes('class="kps-login"')) {
    hero = hero.replace(/<figcaption/, `${loginOverlay}<figcaption`);
  }
  hero = hero.replace(/<figcaption[^>]*>[\s\S]*?<\/figcaption>/, `<figcaption><strong>${page.caption}</strong><a href="https://pulse.komolongevity.com/">KŌMØ Pulse ↗</a></figcaption>`);
  return html.slice(0, start) + hero + html.slice(end);
}

function systemSection(page) {
  return `<section class="kps-system" aria-label="KŌMØ measurement system"><div class="kps-shell"><div class="kps-intro"><div><p class="kps-ey">${page.stripEyebrow}</p><h2 class="kps-title">${page.stripTitle}</h2></div><p class="kps-lead">${page.stripLead}</p></div><div class="kps-steps">${page.steps.map(([n,t,b])=>`<article class="kps-step"><small>${n}</small><h3>${t}</h3><p>${b}</p></article>`).join('')}</div><div class="kps-domains">${page.domains.map(([t,b])=>`<div class="kps-domain"><strong>${t}</strong><span>${b}</span></div>`).join('')}</div><p class="kps-boundary">${page.boundary}</p></div></section>`;
}

for (const page of pages) {
  let html = await readFile(page.file, 'utf8');
  html = replaceMeta(html, page);
  html = replaceHero(html, page);
  if (!html.includes('homepage-product-stepup-v1-style')) html = html.replace('</head>', `${CSS}</head>`);
  if (!html.includes('class="kps-system"')) {
    const markerAt = html.indexOf('class="kpf-hero');
    const heroEnd = html.indexOf('</section>', markerAt) + '</section>'.length;
    html = html.slice(0, heroEnd) + systemSection(page) + html.slice(heroEnd);
  }
  await writeFile(page.file, html);
  console.log(`[homepage-product-stepup-v1] upgraded ${page.locale} homepage`);
}
