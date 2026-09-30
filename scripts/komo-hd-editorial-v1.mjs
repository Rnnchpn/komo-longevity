import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site=join(process.cwd(),'site');
const IMG='/assets/images';

async function patch(rel,fn){
  const fp=join(site,rel);
  try{await access(fp)}catch{return}
  let html=await readFile(fp,'utf8');
  html=fn(html);
  await writeFile(fp,html,'utf8');
}

const css=`
<style id="komo-hd-editorial-v1-style">
.khe-hero .kpv-hero-media img{width:100%;height:100%;object-fit:cover;object-position:center;image-rendering:auto}
.khe-offers{padding:clamp(72px,8vw,112px) 0;background:#f8f4ec}
.khe-offers-head{display:grid;grid-template-columns:.8fr 1.2fr;gap:60px;align-items:end;margin-bottom:54px}
.khe-offers-head p{margin:0;max-width:650px;color:#66645c;font-size:13px;line-height:1.65}
.khe-offer{display:grid;grid-template-columns:1.02fr .98fr;min-height:520px;border-top:1px solid rgba(50,43,35,.14);text-decoration:none;color:#171a17}
.khe-offer:last-child{border-bottom:1px solid rgba(50,43,35,.14)}
.khe-offer:nth-child(even) .khe-offer-media{order:2}
.khe-offer-copy{padding:clamp(42px,6vw,82px) clamp(24px,5vw,72px);display:flex;flex-direction:column;justify-content:center}
.khe-offer-index{font-size:9px;letter-spacing:.13em;text-transform:uppercase;color:#797365}
.khe-offer h3{margin:18px 0 0;font:400 clamp(40px,5vw,68px)/.98 "Iowan Old Style",Baskerville,Georgia,serif;letter-spacing:-.035em}
.khe-offer p{max-width:620px;margin:24px 0 0;color:#5f625b;font-size:13px;line-height:1.7}
.khe-offer-meta{display:flex;flex-wrap:wrap;gap:8px 20px;margin-top:26px;color:#5f625b;font-size:10px}
.khe-offer-more{display:inline-block;margin-top:34px;font-size:11px;font-weight:700}
.khe-offer-media{overflow:hidden;min-height:520px;background:#d7cab8}
.khe-offer-media img{display:block;width:100%;height:100%;min-height:520px;object-fit:cover;transition:transform 1.1s cubic-bezier(.22,1,.36,1),filter .5s ease}
.khe-offer:hover .khe-offer-media img{transform:scale(1.035)}
.khe-offer--motion{background:#ebe9dd}.khe-offer--clinical{background:#eee4d7}.khe-offer--experience{background:#e8dfd2}.khe-offer--world{background:#e2e9e8}
.khe-proof{display:grid;grid-template-columns:repeat(4,1fr);background:#171d1a;color:#f7f3eb}
.khe-proof article{padding:23px 26px;border-right:1px solid rgba(255,255,255,.08)}
.khe-proof article:last-child{border-right:0}
.khe-proof strong{display:block;font:400 clamp(29px,3vw,42px)/1 "Iowan Old Style",Baskerville,Georgia,serif}
.khe-proof span{display:block;margin-top:7px;font-size:9px;line-height:1.4;letter-spacing:.06em;text-transform:uppercase;color:rgba(247,243,235,.59)}
.khe-eco{padding:clamp(68px,7vw,96px) 0;background:#f2ece1}
.khe-eco-line{display:grid;grid-template-columns:repeat(4,1fr);margin-top:38px;border-top:1px solid rgba(50,43,35,.13);border-bottom:1px solid rgba(50,43,35,.13)}
.khe-eco-line a{display:block;padding:24px 22px;text-decoration:none;color:#171a17;border-right:1px solid rgba(50,43,35,.1)}
.khe-eco-line a:last-child{border-right:0}
.khe-eco-line strong{font:400 25px/1 "Iowan Old Style",Baskerville,Georgia,serif}
.khe-eco-line small{display:block;margin-top:10px;color:#6c685f;font-size:10px;line-height:1.5}
.khe-page-hero{display:grid;grid-template-columns:.92fr 1.08fr;min-height:610px;background:#f2ece2}
.khe-page-hero-copy{padding:clamp(78px,9vw,126px) clamp(26px,6vw,88px);display:flex;flex-direction:column;justify-content:center}
.khe-page-hero-media{overflow:hidden}
.khe-page-hero-media img{display:block;width:100%;height:100%;min-height:610px;object-fit:cover}
.khe-page-wide{margin:0;background:#d8c8b1;overflow:hidden}
.khe-page-wide img{display:block;width:100%;aspect-ratio:16/7;object-fit:cover}
.khe-reveal{opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1)}
.khe-reveal.khe-visible{opacity:1;transform:none}
@media(max-width:980px){
 .khe-offers-head{grid-template-columns:1fr;gap:20px}
 .khe-offer{grid-template-columns:1fr;min-height:0}
 .khe-offer:nth-child(even) .khe-offer-media{order:0}
 .khe-offer-media,.khe-offer-media img{min-height:0}.khe-offer-media img{aspect-ratio:16/10}
 .khe-page-hero{grid-template-columns:1fr;min-height:0}.khe-page-hero-media img{min-height:0;aspect-ratio:16/10}
 .khe-eco-line{grid-template-columns:1fr 1fr}.khe-eco-line a:nth-child(2){border-right:0}
}
@media(max-width:650px){
 .khe-proof{grid-template-columns:1fr 1fr}.khe-proof article:nth-child(2){border-right:0}
 .khe-offer-copy{padding:38px 24px 44px}.khe-offer h3{font-size:43px}
 .khe-eco-line{grid-template-columns:1fr}.khe-eco-line a{border-right:0;border-bottom:1px solid rgba(50,43,35,.1)}.khe-eco-line a:last-child{border-bottom:0}
}
@media(prefers-reduced-motion:reduce){.khe-reveal{opacity:1;transform:none;transition:none}.khe-offer-media img{transition:none}}
</style>`;

const runtime=`<script id="komo-hd-editorial-v1-runtime">
(()=>{const els=[...document.querySelectorAll('.khe-reveal')];if(!els.length)return;if(matchMedia('(prefers-reduced-motion: reduce)').matches){els.forEach(x=>x.classList.add('khe-visible'));return}const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('khe-visible');io.unobserve(e.target)}}),{threshold:.12,rootMargin:'0px 0px -40px'});els.forEach(x=>io.observe(x));})();
</script>`;

function style(html){
 if(!html.includes('komo-hd-editorial-v1-style')) html=html.replace('</head>',css+'\n</head>');
 if(!html.includes('komo-hd-editorial-v1-runtime')) html=html.replace('</body>',runtime+'\n</body>');
 return html;
}

await patch('index.html',html=>{
 html=style(html);
 html=html
   .replace('/assets/images/komo-longevity-v3.webp',`${IMG}/komo-hero-hd-v4.webp`)
   .replace('<section class="kc-hero kpv-hero">','<section class="kc-hero kpv-hero khe-hero">');

 const offers=`<section class="khe-offers" id="solutions"><div class="kt-shell"><div class="khe-offers-head khe-reveal"><div><p class="kt-ey">NOS OFFRES</p><h2 class="kt-h2">Quatre niveaux d’intervention</h2></div><p>Motion mesure la fonction locomotrice. Clinical ajoute l’évaluation médicale et biologique. Experience permet de réaliser KŌMØ sur site. World complète le suivi par des modules numériques optionnels.</p></div></div>
 <a class="khe-offer khe-offer--motion khe-reveal" href="/fr/motion/"><div class="khe-offer-copy"><span class="khe-offer-index">01 · Évaluation fonctionnelle</span><h3>KŌMØ Motion</h3><p>Analyse instrumentée de la marche, de la posture, de l’équilibre, de la force, de la mobilité et de l’activité musculaire. Les résultats sont restitués dans Pulse avec Motion Score, Motion Age et les principaux paramètres fonctionnels.</p><div class="khe-offer-meta"><span>119 paramètres musculaires</span><span>10 paramètres de marche</span><span>Tests fonctionnels</span></div><span class="khe-offer-more">Voir Motion →</span></div><figure class="khe-offer-media"><img src="${IMG}/komo-motion-hd-v4.webp" alt="Analyse KŌMØ Motion de la marche et de l’activité musculaire" loading="lazy"></figure></a>
 <a class="khe-offer khe-offer--clinical khe-reveal" href="/fr/clinical/"><figure class="khe-offer-media"><img src="${IMG}/komo-clinical-hd-v4.webp" alt="Consultation KŌMØ Clinical avec données fonctionnelles et biomarqueurs" loading="lazy"></figure><div class="khe-offer-copy"><span class="khe-offer-index">02 · Évaluation médicale</span><h3>KŌMØ Clinical</h3><p>Consultation médicale, questionnaires personnalisés et intégration de données fonctionnelles et biologiques. Jusqu’à 150+ biomarqueurs peuvent être intégrés selon l’indication et le protocole retenu.</p><div class="khe-offer-meta"><span>Consultation médicale</span><span>150+ biomarqueurs</span><span>Questionnaires personnalisés</span></div><span class="khe-offer-more">Voir Clinical →</span></div></a>
 <a class="khe-offer khe-offer--experience khe-reveal" href="/fr/experience/"><div class="khe-offer-copy"><span class="khe-offer-index">03 · Sur site</span><h3>KŌMØ Experience</h3><p>Le protocole KŌMØ peut être réalisé dans un yacht, un hôtel, à domicile, en entreprise ou pendant un retreat. Les mesures, la restitution et le suivi restent identiques.</p><div class="khe-offer-meta"><span>Yachting</span><span>Hospitality</span><span>Private</span></div><span class="khe-offer-more">Voir Experience →</span></div><figure class="khe-offer-media"><img src="${IMG}/komo-experience-hd-v4.webp" alt="Évaluation KŌMØ Experience dans un environnement privé méditerranéen" loading="lazy"></figure></a>
 <a class="khe-offer khe-offer--world khe-reveal" href="/fr/world/"><figure class="khe-offer-media"><img src="${IMG}/komo-world-hd-v4.webp" alt="KŌMØ World et suivi numérique de la trajectoire fonctionnelle" loading="lazy"></figure><div class="khe-offer-copy"><span class="khe-offer-index">04 · Suivi numérique</span><h3>KŌMØ World</h3><p>World propose des modules de visualisation, d’exercice et de contenu associés au programme KŌMØ. Pulse reste l’espace principal pour les résultats, les rendez-vous et les réévaluations.</p><div class="khe-offer-meta"><span>Pulse</span><span>Functional Twin</span><span>Modules optionnels</span></div><span class="khe-offer-more">Voir World →</span></div></a></section>`;

 html=html.replace(/<section class="kc-section kc-section--paper" id="solutions">[\s\S]*?<\/section>(?=<section class="kt-z-section kt-z-section--sand kh4-ecosystem">)/,offers);

 const eco=`<section class="khe-eco"><div class="kt-shell"><div class="kt-z-heading khe-reveal"><div><p class="kt-ey">ÉCOSYSTÈME KŌMØ</p><h2 class="kt-h2">Résultats, suivi et interventions dans le même environnement</h2></div><p class="kt-copy">Pulse centralise les données. Yachting et Signature organisent des formats privés. Les professionnels peuvent intégrer KŌMØ dans leur établissement.</p></div><div class="khe-eco-line khe-reveal"><a href="https://pulse.komolongevity.com/"><strong>Pulse</strong><small>Résultats, questionnaires et réévaluations.</small></a><a href="/fr/yachting/"><strong>Yachting</strong><small>Motion et suivi directement à bord.</small></a><a href="/fr/signature/"><strong>Signature</strong><small>Programme privé coordonné.</small></a><a href="/fr/partners/"><strong>Professionnels</strong><small>Intervention sur site et déploiement.</small></a></div></div></section>`;
 html=html.replace(/<section class="kt-z-section kt-z-section--sand kh4-ecosystem">[\s\S]*?<\/section>(?=<section class="kt-z-section kt-z-section--sage">)/,eco);
 return html;
});

await patch('fr/motion/index.html',html=>{
 html=style(html).replace('/assets/images/komo-motion-v3.webp',`${IMG}/komo-motion-hd-v4.webp`);
 html=html.replace('VOS VOTRE PROFIL KŌMØ','VOTRE PROFIL KŌMØ');
 html=html.replace('Le bilan associe un questionnaire locomoteur, des tests fonctionnels standardisés et des mesures par capteurs. Les résultats sont analysés puis restitués avec les principales données fonctionnelles et les modalités de suivi.','Motion mesure la marche, la posture, l’équilibre, la force, la mobilité et l’activité musculaire. Le bilan associe questionnaires, tests fonctionnels et acquisition par capteurs, puis restitue les résultats dans Pulse.');
 return html;
});

await patch('fr/clinical/index.html',html=>{
 html=style(html).replaceAll('/assets/images/komo-clinical-v3.webp',`${IMG}/komo-clinical-hd-v4.webp`);
 html=html.replace('Évaluation clinique clinique ciblé selon l’indication.','Examen clinique orienté selon le motif de consultation et les résultats disponibles.');
 html=html.replace(/<section class="kt-pagehero"><div class="kt-shell">([\s\S]*?)<\/div><\/section>/,`<section class="khe-page-hero"><div class="khe-page-hero-copy">$1</div><figure class="khe-page-hero-media"><img src="${IMG}/komo-clinical-hd-v4.webp" alt="Consultation KŌMØ Clinical avec intégration des données fonctionnelles et biologiques" fetchpriority="high"></figure></section>`);
 return html;
});

await patch('fr/experience/index.html',html=>{
 html=style(html);
 html=html.replace(/<section class="kt-pagehero"><div class="kt-shell">([\s\S]*?)<\/div><\/section>/,`<section class="khe-page-hero"><div class="khe-page-hero-copy">$1</div><figure class="khe-page-hero-media"><img src="${IMG}/komo-experience-hd-v4.webp" alt="KŌMØ Experience réalisé dans un environnement privé" fetchpriority="high"></figure></section>`);
 return html;
});

await patch('fr/world/index.html',html=>{
 html=style(html);
 html=html.replaceAll('/assets/site2026/generated/komo-world-premium.webp',`${IMG}/komo-world-hd-v4.webp`);
 html=html.replace('World prolonge votre suivi KŌMØ avec des modules de visualisation, d’exercice et de contenu personnalisés. Pulse reste l’espace principal pour vos résultats, vos rendez-vous et votre trajectoire.','World complète le suivi KŌMØ par des modules de visualisation, d’exercice et de contenu. Pulse reste l’espace principal pour les résultats, les rendez-vous et les réévaluations.');
 return html;
});

console.log('[komo-hd-editorial-v1] PASS · HD imagery, editorial offer layout and subtle reveal motion applied.');
