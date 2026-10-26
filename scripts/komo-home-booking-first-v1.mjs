import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
// The final public homepage pass: booking-first, exactly two real-world destinations.
const index=join(process.cwd(),'site','index.html');
let html=await readFile(index,'utf8');
const BOOK='https://app.acuityscheduling.com/schedule.php?owner=40696577';
const PULSE='https://pulse.komolongevity.com/';
const CANNES='mailto:contact@komolongevity.com?subject=Demande%20de%20consultation%20KOMO%20Cannes';
const link=(href,cls,text,ext=false)=>'<a class="'+cls+'" href="'+href+'"'+(ext?' target="_blank" rel="noopener noreferrer"':'')+'>'+text+'</a>';
// No verified KŌMØ Planity listing has been supplied. Never label Acuity as Planity
// or send a customer to Planity's generic homepage.
const stylesheet=String.raw`<style id="komo-booking-first-v1">
:root{--kbh-ink:#1c3d2a;--kbh-forest:#204c34;--kbh-ivory:#f8f8f1;--kbh-muted:#697968}
.kp-top .kbh-header-cta{display:inline-flex;align-items:center;justify-content:center;padding:12px 19px;min-height:40px;border-radius:999px;color:#fff!important;background:#1e4e35;text-decoration:none;font:700 12px/1.2 Inter,Arial,sans-serif;white-space:nowrap;box-shadow:0 8px 20px rgba(31,72,45,.13);transition:transform .3s,box-shadow .3s}
.kp-top .kbh-header-cta:hover{transform:translateY(-2px);box-shadow:0 13px 25px rgba(31,72,45,.17)}
.kt-mobile-menu .kbh-menu-book{display:block!important;background:#24543a!important;color:#fff!important;border-radius:13px;padding:17px 14px!important;font:700 13px Inter,Arial,sans-serif!important;text-align:center}
#komo-pulse-journey-bridge{display:none!important}
.komo-hero-20260930 .kc-hero-copy{padding:clamp(25px,2.3vw,32px)!important;max-width:580px!important;width:min(580px,calc(100% - 40px))!important}
.komo-hero-20260930 .kc-hero-copy h1{font:500 clamp(36px,3.75vw,54px)/1.08 "Iowan Old Style",Baskerville,Georgia,serif!important;letter-spacing:-.045em!important;max-width:560px!important}
.komo-hero-20260930 .kc-hero-copy h1 em{font-style:italic;color:#3d6847}
.komo-hero-20260930 .kc-hero-copy .kbh-eyebrow{color:#4f7560;font:800 10px/1.5 Inter,Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase;display:flex;gap:9px;align-items:center;margin:0 0 16px}
.komo-hero-20260930 .kc-hero-copy .kbh-eyebrow:before{content:"";height:1px;width:21px;background:#83aa8a}
.komo-hero-20260930 .kc-hero-copy .kt-lead{font:400 clamp(14px,1.3vw,17px)/1.75 Inter,Arial,sans-serif!important;color:#526457!important;margin:16px 0 0!important}
.komo-hero-20260930 .kc-hero-copy .kt-btns{margin:25px 0 0!important;display:flex!important;flex-wrap:wrap!important;gap:10px!important}
.komo-hero-20260930 .kc-hero-copy .kbh-primary,.komo-hero-20260930 .kc-hero-copy .kbh-secondary{min-height:52px!important;display:inline-flex;align-items:center;justify-content:center;gap:10px;border-radius:999px;padding:13px 21px;font:750 12px/1.35 Inter,Arial,sans-serif;text-decoration:none!important;letter-spacing:0!important;transition:transform .3s cubic-bezier(.22,1,.36,1),box-shadow .3s}
.komo-hero-20260930 .kc-hero-copy .kbh-primary{background:var(--kbh-forest)!important;color:#fff!important;box-shadow:0 11px 28px rgba(30,76,47,.17)}
.komo-hero-20260930 .kc-hero-copy .kbh-secondary{background:#fffefa!important;color:#204631!important;border:1px solid #cbdacb}
.komo-hero-20260930 .kc-hero-copy .kbh-primary:hover,.komo-hero-20260930 .kc-hero-copy .kbh-secondary:hover{transform:translateY(-3px)}
.komo-hero-20260930 .kc-hero-copy .kbh-primary:hover{box-shadow:0 16px 36px rgba(30,76,47,.21)}
.komo-hero-20260930 .kc-hero-copy .kbh-sub{display:block;margin:19px 0 0;font-size:11px;line-height:1.7;color:#6b7b6e}
.kbh-section{background:#f7f7f0;padding:clamp(36px,5vw,72px) clamp(18px,4vw,65px) clamp(44px,5vw,70px);scroll-margin-top:98px;position:relative;color:#203b2a}
.kbh-inner{max-width:1280px;margin:auto}
.kbh-section-head{display:flex;align-items:end;justify-content:space-between;gap:35px;margin:0 0 23px}
.kbh-overline{display:block;color:#64836c;font:800 10px/1.5 Inter,Arial,sans-serif;letter-spacing:.18em;text-transform:uppercase}
.kbh-section-head h2{margin:9px 0 0;font:500 clamp(34px,3.8vw,53px)/1.06 "Iowan Old Style",Georgia,serif;letter-spacing:-.052em;color:#1c3c2b}
.kbh-section-head h2 em{font-weight:400;color:#4b7553}
.kbh-section-head p{color:#647568;max-width:400px;font:400 13px/1.75 Inter,Arial,sans-serif;margin:0}
.kbh-cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px}
.kbh-card{display:grid;grid-template-columns:minmax(0,1fr) 42%;border:1px solid #d9e5d7;background:#fffefa;border-radius:24px;overflow:hidden;position:relative;min-height:295px;box-shadow:0 12px 37px rgba(34,63,37,.04);transition:transform .5s cubic-bezier(.22,1,.36,1),box-shadow .45s ease}
.kbh-card:hover{transform:translateY(-5px);box-shadow:0 24px 52px rgba(36,64,39,.1)}
.kbh-card-main{display:flex;flex-direction:column;align-items:flex-start;padding:clamp(21px,2.6vw,34px)}
.kbh-card-location{font:800 10px/1.4 Inter,Arial,sans-serif;color:#688875;letter-spacing:.15em}
.kbh-card h3{font:500 clamp(24px,2.6vw,33px)/1.14 "Iowan Old Style",Georgia,serif;letter-spacing:-.045em;margin:12px 0 11px}
.kbh-card p{font:400 12px/1.75 Inter,Arial,sans-serif;color:#69786b;margin:0 0 17px;max-width:320px}
.kbh-card-action{margin-top:auto;min-height:46px;border-radius:999px;padding:13px 19px;display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#244e35;color:#fff!important;font:750 12px/1.4 Inter,Arial,sans-serif;text-decoration:none!important}
.kbh-card-action:hover{background:#153e27}
.kbh-card--cannes .kbh-card-action{background:#eceee6;border:1px solid #cdddcf;color:#274f36!important}
.kbh-card-visual{position:relative;background:linear-gradient(140deg,#78997a,#254834);overflow:hidden}
.kbh-card-visual:before{content:"";position:absolute;inset:-9%;background:url('/assets/images/komo-hero-hd-v4.webp') center/cover no-repeat;filter:saturate(.77);transition:transform .8s cubic-bezier(.22,1,.36,1)}
.kbh-card--cannes .kbh-card-visual:before{background-position:69% 65%;filter:saturate(1.08)}
.kbh-card:hover .kbh-card-visual:before{transform:scale(1.08)}
.kbh-card-visual:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(9,32,20,0) 30%,rgba(9,32,20,.43))}
.kbh-card-visual span{position:absolute;z-index:1;bottom:22px;left:20px;color:#fff;font:600 12px/1.3 Inter,Arial,sans-serif;letter-spacing:.06em}
.kbh-explainer{display:grid;grid-template-columns:1fr auto;align-items:center;gap:17px;border:1px solid #d8e6d6;background:#e8efe6;padding:19px 23px;border-radius:17px;margin-top:17px}
.kbh-explainer p{font:400 12px/1.7 Inter,Arial,sans-serif;color:#42604b;margin:0}
.kbh-explainer a{white-space:nowrap;color:#224a32;font:750 12px/1.4 Inter,Arial,sans-serif;text-underline-offset:4px}
.kbh-flow{display:flex;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;margin-top:21px;color:#677b6b;font:650 11px/1.5 Inter,Arial,sans-serif}
.kbh-flow b{color:#2b6240}
.kbh-mobile-dock{display:none}
.kbh-section a:focus-visible,.kbh-mobile-dock a:focus-visible,.kbh-header-cta:focus-visible{outline:3px solid #75a485;outline-offset:4px}
@media(max-width:1180px){.kbh-card{grid-template-columns:1fr 34%}.kbh-card-main{padding:24px}.kbh-card h3{font-size:26px}}
@media(max-width:900px){.kbh-section-head{align-items:start;flex-direction:column;gap:11px}.kbh-cards{grid-template-columns:1fr}.kbh-card{grid-template-columns:1fr 38%}.kbh-card h3{font-size:28px}.kp-top .kbh-header-cta{display:none}.kbh-mobile-dock{display:flex;position:fixed;z-index:55;bottom:0;left:0;right:0;gap:8px;padding:11px 15px calc(11px + env(safe-area-inset-bottom));background:rgba(249,250,245,.96);border-top:1px solid #d8e4d8;box-shadow:0 -8px 31px rgba(30,56,34,.1);backdrop-filter:blur(16px)}.kbh-mobile-dock a{flex:1;text-decoration:none;text-align:center;padding:15px 11px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;font:750 12px Inter,Arial,sans-serif;min-height:44px}.kbh-mobile-dock .primary{background:#245439;color:#fff}.kbh-mobile-dock .secondary{background:#edf2e9;color:#244a35;border:1px solid #d2dfd2}body{padding-bottom:calc(79px + env(safe-area-inset-bottom))}}
@media(max-width:590px){.komo-hero-20260930 .kc-hero-copy{width:100%!important;max-width:100%!important;padding:27px 24px!important}.komo-hero-20260930 .kc-hero-copy h1{font-size:39px!important;line-height:1.06!important}.komo-hero-20260930 .kc-hero-copy .kt-btns{display:grid!important;grid-template-columns:1fr!important}.komo-hero-20260930 .kc-hero-copy .kbh-primary,.komo-hero-20260930 .kc-hero-copy .kbh-secondary{width:100%;font-size:13px}.kbh-section{padding:43px 17px 53px}.kbh-card{min-height:235px;grid-template-columns:1fr 30%}.kbh-card-main{padding:21px 18px}.kbh-card h3{font-size:24px}.kbh-card-visual span{font-size:9px;left:7px}.kbh-explainer{grid-template-columns:1fr;gap:9px}.kbh-explainer a{white-space:normal}.kbh-flow{gap:8px;font-size:10px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto!important}.kbh-card,.kbh-card-visual:before,.kbh-header-cta,.kbh-primary,.kbh-secondary{transition:none!important}.kbh-card:hover,.kbh-header-cta:hover,.kbh-primary:hover,.kbh-secondary:hover{transform:none!important}}
</style>`;

const hero=`<div class="kc-hero-copy"><span class="kbh-eyebrow">KŌMØ · LONGEVITY IN MOTION</span><h1 class="kt-title">Votre mouvement.<br><em>Votre longévité.</em></h1><p class="kt-lead">À Paris chez Centré ou à Cannes, découvrez votre bilan KŌMØ Motion : marche, force, équilibre et mobilité. Un rendez-vous simple, des mesures expliquées et un parcours personnel dans Pulse.</p><div class="kt-btns"><a class="kbh-primary" href="#consultations">Prendre rendez-vous <span aria-hidden="true">↗</span></a><a class="kbh-secondary" href="${PULSE}">J’ai déjà un compte Pulse <span aria-hidden="true">→</span></a></div><span class="kbh-sub">Deux lieux de consultation · Paris — Centré & Cannes · Bilan fonctionnel non diagnostique</span></div>`;
const heroRegex=/<div class="kc-hero-copy">[\s\S]*?<\/div>(?=<figure class="kpv-hero-media">)/;
if(!heroRegex.test(html))throw Error('[booking-first] exact homepage hero not found');
html=html.replace(heroRegex,hero);

const cards=`<section class="kbh-section" id="consultations" aria-label="Consultations KŌMØ Paris et Cannes"><div class="kbh-inner"><header class="kbh-section-head"><div><span class="kbh-overline">COMMENT PRENDRE RENDEZ-VOUS</span><h2>Choisissez votre ville.<br><em>Nous nous occupons du reste.</em></h2></div><p>Deux lieux, un seul parcours KŌMØ. Sélectionnez votre consultation ; vous pourrez ensuite retrouver vos rendez-vous et leur suivi dans Pulse, une fois votre accès associé.</p></header><div class="kbh-cards">
<article class="kbh-card kbh-card--paris"><div class="kbh-card-main"><span class="kbh-card-location">01 / PARIS</span><h3>Consultation Paris<br>Centré</h3><p>Motion Initial, Suivi ou Advanced. Choisissez directement votre créneau dans le calendrier officiel Centré × KŌMØ.</p><a class="kbh-card-action" href="${BOOK}" target="_blank" rel="noopener noreferrer" aria-label="Ouvrir le calendrier de réservation Acuity pour Paris chez Centré">Voir les disponibilités <span aria-hidden="true">↗</span></a></div><div class="kbh-card-visual" aria-hidden="true"><span>PARIS · CENTRÉ</span></div></article>
<article class="kbh-card kbh-card--cannes"><div class="kbh-card-main"><span class="kbh-card-location">02 / CANNES</span><h3>Consultation Cannes<br>KŌMØ Motion</h3><p>Votre bilan locomoteur sur la Riviera. Écrivez à l’équipe pour connaître les créneaux disponibles à Cannes.</p><a class="kbh-card-action" href="${CANNES}" aria-label="Demander un rendez-vous KŌMØ Cannes par e-mail">Demander un créneau <span aria-hidden="true">→</span></a></div><div class="kbh-card-visual" aria-hidden="true"><span>CANNES · RIVIERA</span></div></article>
</div><div class="kbh-explainer"><p><b>Déjà réservé ?</b> Votre espace <b>KŌMØ Pulse</b> vous permet de vous connecter et de retrouver les étapes de votre parcours. L’association automatique des réservations Acuity est encore en cours d’activation.</p><a href="${PULSE}">Accéder à mon espace Pulse →</a></div><div class="kbh-flow"><span><b>01</b> Je réserve</span><span aria-hidden="true">→</span><span><b>02</b> Je reçois ma confirmation</span><span aria-hidden="true">→</span><span><b>03</b> J’accède à Pulse</span><span aria-hidden="true">→</span><span><b>04</b> Je réalise mon bilan</span></div></div></section>`;
const oldQuick=/<section class="kc-quick" aria-label="Repères KŌMØ">[\s\S]*?<\/section>/;
if(!oldQuick.test(html))throw Error('[booking-first] outdated KPI strip not found');
html=html.replace(oldQuick,cards);
if(!html.includes('<div class="kp-langs">'))throw Error('[booking-first] header action anchor missing');
html=html.replace('<div class="kp-langs">','<a class="kbh-header-cta" href="#consultations">Prendre rendez-vous ↗</a><div class="kp-langs">');
if(!html.includes('<div class="kt-mobile-menu">'))throw Error('[booking-first] mobile menu anchor missing');
html=html.replace('<div class="kt-mobile-menu">','<div class="kt-mobile-menu"><a class="kbh-menu-book" href="#consultations">Prendre rendez-vous ↗</a>');
if(!html.includes('</body>'))throw Error('[booking-first] closing body not found');
html=html.replace('</body>','<nav class="kbh-mobile-dock" aria-label="Accès rapide aux consultations"><a class="primary" href="#consultations">Prendre rendez-vous</a><a class="secondary" href="${PULSE}">Mon espace Pulse</a></nav></body>');
html=html.replace('</head>',stylesheet+'</head>');
html=html.replaceAll('${BOOK}',BOOK).replaceAll('${PULSE}',PULSE).replaceAll('${CANNES}',CANNES);
await writeFile(index,html,'utf8');
console.log('[booking-first] homepage has Paris/Centré booking, Cannes contact and Pulse; no unverified Planity URL');
