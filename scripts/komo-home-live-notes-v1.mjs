import { access, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site=join(process.cwd(),'site');

async function patch(rel){
  const fp=join(site,rel);
  try{await access(fp);}catch{return;}
  let html=await readFile(fp,'utf8');

  // Homepage live editorial pass — dictated review 2026-09-30.
  html=html
    .replace('<p class="kt-ey">KŌMØ LONGEVITY</p><h1 class="kt-title">Bienvenue chez KŌMØ Longevity</h1>',
      '<p class="kt-ey komo-home-brandline">KŌMØ Longevity</p><h1 class="kt-title">Bienvenue chez KŌMØ Longevity</h1>')
    .replace('<div class="kt-btns"><a class="kt-btn kt-btn--dark" href="/fr/motion/">Découvrir Motion</a><a class="kt-btn kt-btn--light" href="#how-it-works">Découvrir nos solutions</a></div>',
      '<div class="kt-btns"><a class="kt-btn kt-btn--dark" href="#solutions">Découvrir nos solutions</a></div>')
    .replace('<section class="kc-quick"><article><strong>6</strong><span>capteurs</span></article><article><strong>119</strong><span>paramètres musculaires analysés</span></article><article><strong>3</strong><span>tests standardisés</span></article><article><strong>1</strong><span>questionnaire locomoteur</span></article></section>',
      '<section class="kc-quick" aria-label="Repères KŌMØ"><article><strong>150</strong><span>biomarqueurs sanguins</span></article><article><strong>119</strong><span>paramètres musculaires analysés</span></article><article><strong>10</strong><span>paramètres de marche analysés</span></article><article class="kc-quick-health"><strong>Santé</strong><span>évaluation de votre santé quotidienne par questionnaire personnalisé</span></article></section>')
    .replace('<section class="kc-section kc-section--paper"><div class="kt-shell"><div class="kc-head"><div><p class="kt-ey">NOS SOLUTIONS</p>',
      '<section class="kc-section kc-section--paper" id="solutions"><div class="kt-shell"><div class="kc-head"><div><p class="kt-ey">NOS SOLUTIONS</p>');

  if(!html.includes('komo-home-live-notes-v1-style')){
    html=html.replace('</head>',`<style id="komo-home-live-notes-v1-style">
.kt-home .kc-hero-copy>.komo-home-brandline{
  margin-bottom:22px;
  font-size:clamp(18px,2vw,28px);
  line-height:1;
  font-weight:800;
  letter-spacing:.11em;
  text-transform:none;
  color:#31483a;
}
.kt-home .kc-quick-health strong{
  font-size:clamp(16px,1.5vw,22px);
  letter-spacing:.07em;
  text-transform:uppercase;
}
.kt-home #solutions{scroll-margin-top:84px}
@media(max-width:620px){
  .kt-home .kc-hero-copy>.komo-home-brandline{font-size:19px;margin-bottom:18px}
  .kt-home .kc-quick-health strong{font-size:15px}
}
</style></head>`);
  }

  await writeFile(fp,html,'utf8');
}

await patch('index.html');
await patch('fr/index.html');

console.log('[komo-home-live-notes-v1] PASS · hero hierarchy, solutions CTA and proof band updated.');
