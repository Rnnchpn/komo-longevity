import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site=join(process.cwd(),'site');

async function patch(rel,fn){
  const fp=join(site,rel);
  try{await access(fp)}catch{return}
  let html=await readFile(fp,'utf8');
  html=fn(html);
  await writeFile(fp,html,'utf8');
}

const css=`
<style id="komo-home-structure-v4-style">
.kh4-nav{display:flex;align-items:center;gap:4px;padding:5px;border:1px solid rgba(50,44,36,.10);border-radius:999px;background:rgba(250,247,240,.78);box-shadow:0 8px 26px rgba(45,37,29,.055);backdrop-filter:blur(12px)}
.kh4-nav>a,.kh4-access>summary{display:flex;align-items:center;min-height:38px;padding:0 12px;border-radius:999px;font-size:11px;font-weight:650;letter-spacing:.005em;color:#2a2e29;text-decoration:none;white-space:nowrap;transition:background .2s ease,color .2s ease,transform .2s ease}
.kh4-nav>a:hover,.kh4-access>summary:hover{background:rgba(255,255,255,.72);color:#111512}
.kh4-nav>a:focus-visible,.kh4-access>summary:focus-visible{outline:2px solid rgba(52,72,61,.42);outline-offset:2px}
.kh4-nav .kh4-world{gap:7px;padding:0 15px;background:#18221d;color:#fff}
.kh4-nav .kh4-world:before{content:"";width:6px;height:6px;border-radius:50%;background:#b9d8c8;box-shadow:0 0 0 4px rgba(185,216,200,.14)}
.kh4-nav .kh4-world:hover{background:#24342c;color:#fff}
.kh4-nav .kh4-professionals{color:#54645a}
.kh4-access{position:relative}
.kh4-access>summary{list-style:none;cursor:pointer;border:1px solid rgba(42,46,41,.14);background:rgba(255,255,255,.42)}
.kh4-access>summary::-webkit-details-marker{display:none}
.kh4-access>summary:after{content:"⌄";margin-left:6px;font-size:10px;opacity:.55}
.kh4-access[open]>summary{background:#fff}
.kh4-access-panel{position:absolute;right:0;top:calc(100% + 14px);width:250px;padding:10px;border-radius:20px;background:#f7f2e9;border:1px solid rgba(50,44,36,.12);box-shadow:0 24px 70px rgba(42,35,28,.16);z-index:999}
.kh4-access-panel a{display:block;padding:13px 12px;border-radius:13px;text-decoration:none;color:#171a17;font-size:13px;transition:background .18s ease}
.kh4-access-panel a:hover{background:rgba(255,255,255,.72)}
.kh4-access-panel strong{display:block;font-size:12px}
.kh4-access-panel small{display:block;margin-top:4px;color:#756f66;font-size:9px;line-height:1.45}
.kt-mobile-menu .kt-menu-link small{display:block;margin-top:4px;color:#777066;font-size:9px;line-height:1.35;font-weight:500}
.kh4-solutions{display:grid;grid-template-columns:repeat(2,1fr);gap:14px;margin-top:40px}
.kh4-solution{display:block;padding:30px;border-radius:24px;text-decoration:none;color:#171a17;background:#fbf8f2;border:1px solid rgba(70,58,46,.12);min-height:260px;transition:transform .28s ease,box-shadow .28s ease,border-color .28s ease}
.kh4-solution:hover{transform:translateY(-5px);box-shadow:0 22px 55px rgba(64,49,36,.11);border-color:rgba(92,92,71,.32)}
.kh4-solution--motion{background:#e4e2d6}
.kh4-solution--clinical{background:#eee5da}
.kh4-solution--experience{background:#e7dfd2}
.kh4-solution--world{background:#dfe6e5}
.kh4-solution .kh4-index{display:block;margin-bottom:48px;font-size:9px;letter-spacing:.13em;color:#777164}
.kh4-solution h3{margin:0;font:400 clamp(30px,3vw,42px)/1.02 "Iowan Old Style",Baskerville,Georgia,serif}
.kh4-solution p{max-width:520px;margin:18px 0 0;color:#5f625b;font-size:12px;line-height:1.65}
.kh4-solution .kh4-more{display:inline-block;margin-top:30px;font-size:11px;font-weight:700}
.kh4-ecosystem{padding-top:clamp(76px,8vw,110px)}
.kh4-ecosystem .kt-z-heading{margin-bottom:32px}
.kh4-eco-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.kh4-eco-card{padding:24px;border-radius:18px;background:#fbf8f2;border:1px solid rgba(70,58,46,.11)}
.kh4-eco-card strong{display:block;font:400 26px/1 "Iowan Old Style",Baskerville,Georgia,serif}
.kh4-eco-card p{margin:14px 0 0;color:#67665e;font-size:10px;line-height:1.55}
.kh4-eco-card a{display:inline-block;margin-top:20px;font-size:10px;font-weight:700;color:#171a17}
@media(max-width:980px){.kh4-nav{display:none}.kh4-solutions{grid-template-columns:1fr 1fr}.kh4-eco-grid{grid-template-columns:1fr 1fr}}
@media(max-width:680px){.kh4-solutions,.kh4-eco-grid{grid-template-columns:1fr}.kh4-solution{min-height:0}.kh4-solution .kh4-index{margin-bottom:28px}}
</style>`;

function headerFR(html){
  const desktop=`<div class="kh4-nav" aria-label="Navigation KŌMØ">
    <a href="/fr/motion/">Motion</a>
    <a href="/fr/clinical/">Clinical</a>
    <a href="/fr/experience/">Expériences</a>
    <a class="kh4-world" href="/world/">World</a>
    <a class="kh4-professionals" href="/fr/partners/">Professionnels</a>
    <a href="/fr/science/">Science</a>
    <details class="kh4-access"><summary>Mon espace</summary><div class="kh4-access-panel">
      <a href="https://pulse.komolongevity.com/"><strong>Pulse</strong><small>Résultats, rendez-vous et suivi santé</small></a>
      <a href="/world/"><strong>World</strong><small>Lieux, événements et écosystème KŌMØ</small></a>
    </div></details>
  </div>`;
  const mobile=`<div class="kt-mobile-menu">
    <div class="kt-menu-group"><strong>Services KŌMØ</strong>
      <a class="kt-menu-link" href="/fr/motion/">Motion <small>Bilan fonctionnel</small></a>
      <a class="kt-menu-link" href="/fr/clinical/">Clinical <small>Consultation médicale</small></a>
      <a class="kt-menu-link" href="/fr/experience/">Expériences <small>Yachting · Hospitality · Private</small></a>
    </div>
    <div class="kt-menu-group"><strong>Écosystème</strong>
      <a class="kt-menu-link" href="/world/">World <small>Lieux, événements et expériences</small></a>
      <a class="kt-menu-link" href="https://pulse.komolongevity.com/">Pulse <small>Résultats et suivi santé</small></a>
    </div>
    <div class="kt-menu-group"><strong>KŌMØ</strong>
      <a class="kt-menu-link" href="/fr/partners/">Professionnels <small>Déployer KŌMØ</small></a>
      <a class="kt-menu-link" href="/fr/science/">Science <small>Méthode et références</small></a>
    </div>
  </div>`;
  html=html.replace(/<nav class="kp-nav">[\s\S]*?<\/nav>/,`<nav class="kp-nav">${desktop}</nav>`);
  html=html.replace(/<details class="kp-menu">[\s\S]*?<\/details>/,`<details class="kp-menu"><summary>Menu</summary>${mobile}</details>`);
  html=html.replace(/<a class="kp-mini"[^>]*>[\s\S]*?<\/a>/,'');
  return html;
}

function homeFR(html){
  if(!html.includes('komo-home-structure-v4-style')) html=html.replace('</head>',css+'\n</head>');
  html=headerFR(html);

  // Hero: keep welcome, remove redundant brand eyebrow.
  html=html.replace(/<p class="kt-ey komo-home-brandline">KŌMØ Longevity<\/p>/,'');
  html=html.replace('<strong>150</strong><span>biomarqueurs sanguins</span>','<strong>150+</strong><span>biomarqueurs sanguins</span>');

  const solutions=`<section class="kc-section kc-section--paper" id="solutions"><div class="kt-shell">
    <div class="kc-head"><div><p class="kt-ey">NOS OFFRES</p><h2 class="kt-h2">Découvrez les solutions KŌMØ</h2></div><p class="kt-copy">Quatre solutions complémentaires pour mesurer votre fonction locomotrice, intégrer ces données dans une lecture plus globale de votre santé et suivre votre évolution.</p></div>
    <div class="kh4-solutions">
      <a class="kh4-solution kh4-solution--motion" href="/fr/motion/"><span class="kh4-index">01 · ÉVALUATION FONCTIONNELLE</span><h3>KŌMØ Motion</h3><p>Le check-up du mouvement. Motion analyse l’activité musculaire, la posture, la marche, l’équilibre, la force et la mobilité. Les résultats sont synthétisés dans Pulse avec Motion Score, Motion Age et vos principaux repères fonctionnels.</p><span class="kh4-more">Découvrir Motion →</span></a>
      <a class="kh4-solution kh4-solution--clinical" href="/fr/clinical/"><span class="kh4-index">02 · ÉVALUATION MÉDICALE</span><h3>KŌMØ Clinical</h3><p>La consultation médicale KŌMØ associe l’évaluation du mouvement à des questionnaires personnalisés et jusqu’à 150+ biomarqueurs selon l’indication. Les données fonctionnelles et biologiques sont interprétées dans une même lecture clinique.</p><span class="kh4-more">Découvrir Clinical →</span></a>
      <a class="kh4-solution kh4-solution--experience" href="/fr/experience/"><span class="kh4-index">03 · YACHTING · HOSPITALITY · PRIVATE</span><h3>KŌMØ Experiences</h3><p>Les solutions KŌMØ peuvent être réalisées dans votre environnement : yacht, hôtel, domicile, entreprise ou retreat. Le protocole, la restitution et le suivi restent intégrés à votre compte KŌMØ.</p><span class="kh4-more">Découvrir les expériences →</span></a>
      <a class="kh4-solution kh4-solution--world" href="/world/"><span class="kh4-index">04 · ÉCOSYSTÈME KŌMØ</span><h3>KŌMØ World</h3><p>World est la porte d’entrée vers l’écosystème KŌMØ : lieux, établissements, événements, expériences et services autour de vous. Pulse reste votre espace santé pour les résultats et le suivi.</p><span class="kh4-more">Découvrir World →</span></a>
    </div>
  </div></section>`;

  // Replace the old solutions section completely.
  html=html.replace(/<section class="kc-section kc-section--paper" id="solutions">[\s\S]*?<\/section>(?=<section class="kc-section kc-section--sage">)/,solutions);

  // Remove the three repetitive blocks between solutions and ecosystem.
  html=html.replace(/<section class="kc-section kc-section--sage">[\s\S]*?<\/section>(?=<section class="kl-clinical")/,'');
  html=html.replace(/<section class="kl-clinical" id="komo-clinical-feature">[\s\S]*?<\/section>(?=<section class="kc-section kc-section--deep" id="how-it-works">)/,'');
  html=html.replace(/<section class="kc-section kc-section--deep" id="how-it-works">[\s\S]*?<\/section>(?=<section class="kc-cta">)/,'');
  html=html.replace(/<section class="kc-cta">[\s\S]*?<\/section>(?=<section class="kt-z-section kt-z-section--sand">)/,'');

  // Rebuild ecosystem, concise and current.
  const ecosystem=`<section class="kt-z-section kt-z-section--sand kh4-ecosystem"><div class="kt-shell">
    <div class="kt-z-heading"><div><p class="kt-ey">ÉCOSYSTÈME KŌMØ</p><h2 class="kt-h2">Un écosystème connecté entre santé, lieux et expériences</h2></div><p class="kt-copy">KŌMØ relie votre bilan, votre suivi santé et un réseau de lieux, d’événements et d’expériences accessibles depuis World.</p></div>
    <div class="kh4-eco-grid">
      <article class="kh4-eco-card"><strong>Pulse</strong><p>Vos résultats, questionnaires, recommandations et réévaluations sont centralisés dans votre espace personnel.</p><a href="https://pulse.komolongevity.com/">Accéder à Pulse →</a></article>
      <article class="kh4-eco-card"><strong>World</strong><p>Explorez les lieux, établissements, événements, expériences et services qui composent l’écosystème KŌMØ.</p><a href="/world/">Découvrir World →</a></article>
      <article class="kh4-eco-card"><strong>Yachting</strong><p>Motion et le suivi KŌMØ directement à bord, dans un format adapté à l’organisation du yacht.</p><a href="/fr/yachting/">Découvrir Yachting →</a></article>
      <article class="kh4-eco-card"><strong>Signature</strong><p>Un programme privé coordonné à partir de vos résultats, de vos objectifs et du niveau d’accompagnement nécessaire.</p><a href="/fr/signature/">Découvrir Signature →</a></article>
    </div>
  </div></section>`;
  html=html.replace(/<section class="kt-z-section kt-z-section--sand">[\s\S]*?<\/section>(?=<section class="kt-z-section kt-z-section--sage">)/,ecosystem);

  // Remove the final Motion repetition.
  html=html.replace(/<section class="kt-z-final">[\s\S]*?<\/section>/,'');

  return html;
}

await patch('index.html',homeFR);

console.log('[komo-home-structure-v4] PASS · header, 150+, four clickable offers and ecosystem structure applied.');
