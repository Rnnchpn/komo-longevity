import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site = join(process.cwd(), 'site');

const pages = [
  {
    file: join(site, 'fr', 'index.html'),
    rail: [['case','Case'],['measure','Mesure'],['score','Motion Score'],['pulse','Pulse']],
    statementEy: 'UN SYSTÈME · TROIS COUCHES',
    statementTitle: 'Mesurer n’est que le début.',
    statementLead: 'KŌMØ relie acquisition, interprétation et suivi dans une même expérience.',
    layers: [['CASE','Capturer','Une session portable, standardisée et instrumentée.'],['SCORE','Comprendre','Une synthèse lisible des dimensions locomotrices.'],['PULSE','Suivre','Une trajectoire qui se construit à chaque nouvelle mesure.']],
    ageLabel: 'Âge locomoteur', ageValue: '44', ageMeta: 'aperçu illustratif',
    pulseEy: 'KŌMØ PULSE', pulseTitle: 'Vos résultats ne s’arrêtent pas à la session.',
    pulseLead: 'Pulse conserve les évaluations, les scores et la trajectoire dans un espace unique — côté patient comme côté professionnel.',
    pulseCta: 'Accéder à Pulse', pulseAlt: 'Découvrir le Motion Score',
    pulseMini: ['SESSION 03','MOTION 84','TRAJECTOIRE +4'],
    pulseCards: [['Motion Score','84'],['Muscle','79'],['Posture','88']],
    caseLine: 'Photographie du système réel · KŌMØ Case'
  },
  {
    file: join(site, 'index.html'),
    rail: [['case','Case'],['measure','Measure'],['score','Motion Score'],['pulse','Pulse']],
    statementEy: 'ONE SYSTEM · THREE LAYERS',
    statementTitle: 'Measurement is only the beginning.',
    statementLead: 'KŌMØ connects acquisition, interpretation and follow-up in one experience.',
    layers: [['CASE','Capture','A portable, standardised and instrumented session.'],['SCORE','Understand','A clear synthesis of locomotor dimensions.'],['PULSE','Follow','A trajectory that grows with every new assessment.']],
    ageLabel: 'Locomotor Age', ageValue: '44', ageMeta: 'illustrative preview',
    pulseEy: 'KŌMØ PULSE', pulseTitle: 'Your results do not end with the session.',
    pulseLead: 'Pulse keeps assessments, scores and trajectory in one place — for people and professionals.',
    pulseCta: 'Access Pulse', pulseAlt: 'Discover Motion Score',
    pulseMini: ['SESSION 03','MOTION 84','TRAJECTORY +4'],
    pulseCards: [['Motion Score','84'],['Muscle','79'],['Posture','88']],
    caseLine: 'Photograph of the real system · KŌMØ Case'
  },
  {
    file: join(site, 'es', 'index.html'),
    rail: [['case','Case'],['measure','Medición'],['score','Motion Score'],['pulse','Pulse']],
    statementEy: 'UN SISTEMA · TRES CAPAS',
    statementTitle: 'Medir es solo el principio.',
    statementLead: 'KŌMØ conecta adquisición, interpretación y seguimiento en una misma experiencia.',
    layers: [['CASE','Capturar','Una sesión portátil, estandarizada e instrumentada.'],['SCORE','Comprender','Una síntesis clara de las dimensiones locomotoras.'],['PULSE','Seguir','Una trayectoria que crece con cada nueva evaluación.']],
    ageLabel: 'Edad locomotora', ageValue: '44', ageMeta: 'vista ilustrativa',
    pulseEy: 'KŌMØ PULSE', pulseTitle: 'Tus resultados no terminan con la sesión.',
    pulseLead: 'Pulse conserva evaluaciones, puntuaciones y trayectoria en un único espacio — para personas y profesionales.',
    pulseCta: 'Acceder a Pulse', pulseAlt: 'Descubrir Motion Score',
    pulseMini: ['SESIÓN 03','MOTION 84','TRAYECTORIA +4'],
    pulseCards: [['Motion Score','84'],['Músculo','79'],['Postura','88']],
    caseLine: 'Fotografía del sistema real · KŌMØ Case'
  }
];

const CSS = `<style id="homepage-whoop-polish-v3-style">
html{scroll-behavior:smooth}.kw-rail{position:sticky;top:62px;z-index:48;background:rgba(8,9,8,.92);border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.12);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}.kw-rail__in{width:min(calc(100% - 56px),1440px);height:46px;margin:auto;display:flex;align-items:center;justify-content:center;gap:clamp(24px,5vw,72px)}.kw-rail a{position:relative;color:rgba(255,255,255,.48);font-size:8px;font-weight:850;letter-spacing:.13em;text-transform:uppercase;text-decoration:none;transition:color .2s ease}.kw-rail a:hover{color:#fff}.kw-rail a:after{content:'';position:absolute;left:0;right:100%;bottom:-15px;height:1px;background:#ded0b9;transition:right .25s ease}.kw-rail a:hover:after{right:0}
.kw-statement-v3{padding:clamp(88px,11vw,170px) 0;background:#faf8f3}.kw-statement-v3__head{display:grid;grid-template-columns:1.15fr .85fr;gap:clamp(48px,9vw,150px);align-items:end}.kw-statement-v3__head h2{margin:0;font-size:clamp(58px,8vw,122px);font-weight:700;line-height:.87;letter-spacing:-.07em}.kw-statement-v3__head p:last-child{margin:0 0 6px;max-width:560px;color:#676b66;font-size:clamp(16px,1.35vw,20px);line-height:1.56}.kw-layers{display:grid;grid-template-columns:repeat(3,1fr);margin-top:clamp(54px,7vw,90px);border-top:1px solid #151716;border-bottom:1px solid rgba(21,23,22,.18)}.kw-layer{min-height:300px;padding:26px 34px 30px 0;border-right:1px solid rgba(21,23,22,.14);display:flex;flex-direction:column;justify-content:space-between}.kw-layer:not(:first-child){padding-left:34px}.kw-layer:last-child{border-right:0}.kw-layer small{color:#5f756c;font-size:9px;font-weight:900;letter-spacing:.16em}.kw-layer h3{margin:0;font-size:clamp(42px,4.8vw,68px);line-height:.9;letter-spacing:-.06em}.kw-layer b{display:block;margin-top:12px;color:#5f756c;font-size:10px;letter-spacing:.08em;text-transform:uppercase}.kw-layer p{margin:24px 0 0;max-width:330px;color:#737670;font-size:12px;line-height:1.58}
.kw-case__stage{grid-template-columns:minmax(0,1.48fr) minmax(290px,.52fr)!important}.kw-case__image{min-height:760px!important;position:relative}.kw-case__image:after{content:'REAL KŌMØ CASE';position:absolute;left:22px;bottom:18px;padding:10px 12px;border-radius:999px;background:rgba(8,9,8,.78);color:rgba(255,255,255,.75);font-size:7px;font-weight:850;letter-spacing:.15em;backdrop-filter:blur(12px)}.kw-fact{min-height:190px!important;padding:28px!important}.kw-fact b{font-size:clamp(44px,4.5vw,66px)!important}.kw-case__head .kw-copy{max-width:560px}
.kw-measure-card{transition:transform .35s cubic-bezier(.22,1,.36,1),box-shadow .35s ease}.kw-measure-card:hover{transform:translateY(-4px);box-shadow:0 24px 70px rgba(21,23,22,.09)}.kw-measure-card strong{font-size:clamp(32px,3.2vw,46px)!important}.kw-wave{opacity:.78}
.kw-score-card{overflow:hidden}.kw-age{display:grid;grid-template-columns:1fr auto;gap:24px;align-items:end;margin:0 0 28px;padding:20px 0 22px;border-top:1px solid rgba(255,255,255,.12);border-bottom:1px solid rgba(255,255,255,.12)}.kw-age div:first-child{display:grid;gap:6px}.kw-age small{color:rgba(255,255,255,.44);font-size:8px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.kw-age span{color:rgba(255,255,255,.34);font-size:8px}.kw-age b{font-size:clamp(54px,6vw,82px);line-height:.8;letter-spacing:-.07em;color:#ded0b9}.kw-score-orb{margin-bottom:30px!important}
.kw-pulse-v3{position:relative;overflow:hidden;padding:clamp(88px,11vw,160px) 0;background:#d9c4a2}.kw-pulse-v3:before{content:'PULSE';position:absolute;left:-2vw;top:3vw;color:rgba(255,255,255,.20);font-size:clamp(120px,23vw,360px);font-weight:950;line-height:.74;letter-spacing:-.09em}.kw-pulse-v3__grid{position:relative;z-index:1;display:grid;grid-template-columns:.8fr 1.2fr;gap:clamp(46px,8vw,125px);align-items:center}.kw-pulse-v3 h2{margin:0;font-size:clamp(54px,7.4vw,112px);font-weight:700;line-height:.87;letter-spacing:-.07em}.kw-pulse-v3 h2 em{font-style:normal;color:#587066}.kw-pulse-v3__copy{margin:28px 0 0;max-width:550px;color:#4e4c47;font-size:16px;line-height:1.57}.kw-pulse-v3__actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:28px}.kw-pulse-ui{padding:18px;border:1px solid rgba(21,23,22,.15);border-radius:30px;background:#111311;box-shadow:0 35px 95px rgba(77,62,42,.23);transform:rotate(1deg)}.kw-pulse-ui__top{display:flex;align-items:center;justify-content:space-between;padding:8px 8px 18px;color:rgba(255,255,255,.48);font-size:8px;letter-spacing:.13em}.kw-pulse-ui__score{display:grid;grid-template-columns:1.15fr .85fr;gap:12px}.kw-pulse-ui__main{min-height:330px;padding:26px;border-radius:20px;background:linear-gradient(160deg,#1a1e1b,#0d0f0e);display:flex;flex-direction:column;justify-content:space-between}.kw-pulse-ui__main small{color:#91aa9f;font-size:8px;letter-spacing:.12em}.kw-pulse-ui__main b{font-size:clamp(86px,8vw,126px);line-height:.75;letter-spacing:-.085em;color:#fff}.kw-pulse-ui__main span{color:rgba(255,255,255,.45);font-size:9px}.kw-pulse-ui__side{display:grid;gap:12px}.kw-pulse-ui__tile{min-height:100px;padding:16px;border-radius:18px;background:#f3f0e8;color:#151716}.kw-pulse-ui__tile small{display:block;color:#5f756c;font-size:7px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}.kw-pulse-ui__tile strong{display:block;margin-top:19px;font-size:34px;letter-spacing:-.05em}.kw-pulse-ui__bar{height:3px;margin-top:12px;border-radius:999px;background:rgba(21,23,22,.12);overflow:hidden}.kw-pulse-ui__bar:before{content:'';display:block;width:var(--p);height:100%;background:#5f756c}.kw-pulse-ui__foot{display:flex;gap:8px;flex-wrap:wrap;padding:14px 8px 4px}.kw-pulse-ui__chip{padding:8px 10px;border:1px solid rgba(255,255,255,.12);border-radius:999px;color:rgba(255,255,255,.58);font-size:7px;letter-spacing:.08em}
.kw-proof{background:#edf0eb!important}.kw-final{padding-top:clamp(100px,13vw,190px)!important}.kb-disclaimer{background:#0b0c0b!important;color:#fff!important;border-top:1px solid rgba(255,255,255,.12)!important}.kb-disclaimer strong{color:#ded0b9!important}.kb-disclaimer p{color:rgba(255,255,255,.48)!important}
@media(prefers-reduced-motion:no-preference){.kwo-logo{animation:kwv3-rise .8s cubic-bezier(.22,1,.36,1) both}.kwo-grid{animation:kwv3-rise .8s .08s cubic-bezier(.22,1,.36,1) both}.kwo-metrics{animation:kwv3-rise .8s .16s cubic-bezier(.22,1,.36,1) both}@keyframes kwv3-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}}
@media(max-width:980px){.kw-rail{top:62px}.kw-rail__in{width:min(calc(100% - 40px),860px)}.kw-statement-v3__head,.kw-pulse-v3__grid{grid-template-columns:1fr}.kw-layers{grid-template-columns:1fr}.kw-layer,.kw-layer:not(:first-child){min-height:210px;padding:24px 0;border-right:0;border-bottom:1px solid rgba(21,23,22,.14)}.kw-layer:last-child{border-bottom:0}.kw-case__stage{grid-template-columns:1fr!important}.kw-case__image{min-height:0!important;aspect-ratio:1024/1151}.kw-pulse-v3__grid{gap:42px}.kw-pulse-ui{max-width:760px}}
@media(max-width:620px){.kw-rail{top:54px}.kw-rail__in{width:100%;height:42px;justify-content:flex-start;gap:0;overflow-x:auto;padding:0 14px;scrollbar-width:none}.kw-rail__in::-webkit-scrollbar{display:none}.kw-rail a{flex:0 0 auto;padding:0 16px;font-size:7px}.kw-rail a:after{display:none}.kw-statement-v3,.kw-pulse-v3{padding:64px 0}.kw-statement-v3__head h2,.kw-pulse-v3 h2{font-size:47px;line-height:.91}.kw-statement-v3__head{gap:20px}.kw-layers{margin-top:38px}.kw-layer,.kw-layer:not(:first-child){min-height:0;padding:20px 0}.kw-layer h3{font-size:44px}.kw-case__image:after{left:12px;bottom:12px;font-size:6px}.kw-age{margin-bottom:22px}.kw-pulse-v3:before{font-size:42vw;top:4vw}.kw-pulse-v3__copy{font-size:15px}.kw-pulse-v3__actions{display:grid}.kw-pulse-v3__actions .kw-btn,.kw-pulse-v3__actions .kw-link{width:100%;justify-content:center}.kw-pulse-ui{padding:10px;border-radius:22px;transform:none}.kw-pulse-ui__score{grid-template-columns:1fr}.kw-pulse-ui__main{min-height:235px;padding:20px}.kw-pulse-ui__side{grid-template-columns:1fr 1fr}.kw-pulse-ui__tile{min-height:100px}.kw-pulse-ui__tile:last-child{grid-column:1/-1}.kw-pulse-ui__foot{display:none}.kw-case__stage{border-radius:20px!important}}
</style>`;

function section(html, cls) {
  const at = html.indexOf(`class=\"${cls}`);
  if (at < 0) return null;
  const start = html.lastIndexOf('<section', at);
  const endAt = html.indexOf('</section>', at);
  if (start < 0 || endAt < 0) return null;
  return [start, endAt + 10];
}

for (const page of pages) {
  let html = await readFile(page.file, 'utf8');

  html = html.replace(/<style id=\"homepage-whoop-polish-v3-style\">[\s\S]*?<\/style>/gi, '');
  html = html.replace('</head>', `${CSS}</head>`);

  html = html.replace(/<nav class=\"kw-rail\"[\s\S]*?<\/nav>/gi, '');
  const rail = `<nav class=\"kw-rail\" aria-label=\"Product navigation\"><div class=\"kw-rail__in\">${page.rail.map(([id,label]) => `<a href=\"#${id}\">${label}</a>`).join('')}</div></nav>`;
  const heroEnd = html.indexOf('</section>', html.indexOf('class=\"kwo-hero'));
  if (heroEnd >= 0) html = html.slice(0, heroEnd + 10) + rail + html.slice(heroEnd + 10);

  const oldStatement = section(html, 'kw-statement');
  if (oldStatement) {
    const layers = page.layers.map(([name,verb,copy], i) => `<article class=\"kw-layer\"><small>0${i+1}</small><div><h3>${name}</h3><b>${verb}</b><p>${copy}</p></div></article>`).join('');
    const fresh = `<section class=\"kw-statement-v3\"><div class=\"kw-shell\"><div class=\"kw-statement-v3__head\"><div><p class=\"kw-ey\">${page.statementEy}</p><h2>${page.statementTitle}</h2></div><p>${page.statementLead}</p></div><div class=\"kw-layers\">${layers}</div></div></section>`;
    html = html.slice(0, oldStatement[0]) + fresh + html.slice(oldStatement[1]);
  }

  if (!html.includes('class=\"kw-age\"')) {
    html = html.replace('<div class=\"kw-score-bars\">', `<div class=\"kw-age\"><div><small>${page.ageLabel}</small><span>${page.ageMeta}</span></div><b>${page.ageValue}</b></div><div class=\"kw-score-bars\">`);
  }

  const oldPulse = section(html, 'kw-pulse');
  if (oldPulse) {
    const tiles = page.pulseCards.map(([name,value], i) => `<div class=\"kw-pulse-ui__tile\"><small>${name}</small><strong>${value}</strong><div class=\"kw-pulse-ui__bar\" style=\"--p:${[84,79,88][i]}%\"></div></div>`).join('');
    const chips = page.pulseMini.map(x => `<span class=\"kw-pulse-ui__chip\">${x}</span>`).join('');
    const fresh = `<section class=\"kw-pulse-v3\" id=\"pulse\"><div class=\"kw-shell kw-pulse-v3__grid\"><div><p class=\"kw-ey\">${page.pulseEy}</p><h2>${page.pulseTitle}</h2><p class=\"kw-pulse-v3__copy\">${page.pulseLead}</p><div class=\"kw-pulse-v3__actions\"><a class=\"kw-btn\" href=\"https://pulse.komolongevity.com/\">${page.pulseCta} →</a><a class=\"kw-link\" href=\"#score\">${page.pulseAlt} →</a></div></div><div class=\"kw-pulse-ui\" aria-label=\"KŌMØ Pulse preview\"><div class=\"kw-pulse-ui__top\"><span>KŌMØ PULSE</span><span>${page.pulseMini[0]}</span></div><div class=\"kw-pulse-ui__score\"><div class=\"kw-pulse-ui__main\"><small>MOTION SCORE</small><b>84</b><span>${page.ageLabel} · ${page.ageValue}</span></div><div class=\"kw-pulse-ui__side\">${tiles}</div></div><div class=\"kw-pulse-ui__foot\">${chips}</div></div></div></section>`;
    html = html.slice(0, oldPulse[0]) + fresh + html.slice(oldPulse[1]);
  }

  html = html.replace(/REAL KŌMØ CASE/g, page.caseLine.toUpperCase());

  await writeFile(page.file, html);
  console.log(`[homepage-whoop-polish-v3] polished ${page.file}`);
}
