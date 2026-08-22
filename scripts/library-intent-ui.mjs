import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const site = join(root,'site');
const mediaPath = join(site,'assets','media','index.html');
const sitemapPath = join(site,'sitemap.xml');

const intentUrls = [
  'https://komolongevity.com/media/marche-plus-lente',
  'https://komolongevity.com/media/difficulte-se-relever-chaise',
  'https://komolongevity.com/media/marche-asymetrique',
  'https://komolongevity.com/media/tester-mobilite-chez-soi',
  'https://komolongevity.com/media/posture-penchee-en-avant'
];

try {
  let xml = await readFile(sitemapPath,'utf8');
  const missing = intentUrls.filter(u=>!xml.includes(`<loc>${u}</loc>`));
  if (missing.length) xml = xml.replace('</urlset>',`${missing.map(u=>`  <url><loc>${u}</loc><changefreq>monthly</changefreq></url>`).join('\n')}\n</urlset>`);
  await writeFile(sitemapPath,xml,'utf8');
} catch (e) { console.warn('[library-intent-ui] sitemap:',e.message); }

const css = `<style id="library-conversion-style">
.hero-actions-library{display:flex;flex-wrap:wrap;gap:10px;margin-top:24px}.hero-action-library{display:inline-flex;min-height:46px;align-items:center;justify-content:center;padding:0 17px;border-radius:999px;text-decoration:none;font-size:12px;font-weight:800;background:var(--ink);color:#fff}.hero-action-library.secondary{background:transparent;color:var(--ink);border:1px solid var(--line)}
.newsletter{padding:64px 0;border-top:1px solid var(--line)}.newsletter-grid{display:grid;grid-template-columns:.9fr 1.1fr;gap:56px;align-items:end}.newsletter h2{margin:0;font-size:clamp(42px,5vw,66px);line-height:.96;letter-spacing:-.045em}.newsletter p{color:var(--muted);line-height:1.65}.newsletter-form{display:grid;grid-template-columns:1fr auto;gap:10px;margin-top:20px}.newsletter-input{height:50px;border:0;border-bottom:1px solid var(--ink);background:transparent;font:400 18px/1.2 Iowan Old Style,Baskerville,Georgia,serif;outline:none;padding:0}.newsletter-submit{min-height:50px;border:0;border-radius:999px;background:var(--ink);color:#fff;padding:0 18px;font-size:12px;font-weight:800;cursor:pointer}.newsletter-note{font-size:10px!important;margin:10px 0 0!important;color:#7b817c!important}.newsletter-status{font-size:12px!important;margin:10px 0 0!important;color:var(--sage)!important}
@media(max-width:720px){.hero-actions-library{display:grid}.hero-action-library{width:100%}.newsletter{padding:50px 0}.newsletter-grid{grid-template-columns:1fr;gap:22px}.newsletter-form{grid-template-columns:1fr}.newsletter-submit{width:100%}}
</style>`;

try {
  let html = await readFile(mediaPath,'utf8');
  if (!html.includes('library-conversion-style')) html = html.replace('</head>',`${css}\n</head>`);
  html = html.replace('>10 contenus<','>15 contenus<').replaceAll('KŌMØ Media accueillera','KŌMØ Library accueillera').replaceAll('l’ensemble de KŌMØ Media','l’ensemble de KŌMØ Library').replace('© 2026 KŌMØ Media','© 2026 KŌMØ Library');

  if (!html.includes('hero-actions-library')) {
    const marker = '<p class="lead">KŌMØ Library réunit articles, vidéos, revues et perspectives scientifiques sur la marche, le muscle, l’équilibre, la posture, la biomécanique et la longévité locomotrice.</p>';
    html = html.replace(marker,`${marker}<div class="hero-actions-library"><a class="hero-action-library" href="/fr/check/">Faire le KŌMØ Check →</a><a class="hero-action-library secondary" href="#newsletter">Recevoir KŌMØ Review</a></div>`);
  }

  if (!html.includes('/media/marche-plus-lente')) {
    const items = `
<a class="article-link" href="/media/marche-plus-lente" data-search-item data-topics="marche mobilite prevention" data-search="pourquoi je marche plus lentement marche lente ralentissement gait speed vitesse de marche pas courts vieillissement mobilité mobilite"><span class="number">09</span><div><h3>Pourquoi je marche plus lentement qu’avant ?</h3><p>Ce que la vitesse, la longueur du pas, l’équilibre et la puissance peuvent nous apprendre.</p></div><span class="meta meta-col">Marche · Mobilité · 6 min</span><span class="arrow">→</span></a>
<a class="article-link" href="/media/difficulte-se-relever-chaise" data-search-item data-topics="tests muscle mobilite clinique" data-search="pourquoi difficulté difficulte se relever chaise fauteuil lever assis debout force jambes sit to stand mobilité mobilite"><span class="number">10</span><div><h3>Pourquoi ai-je plus de mal à me relever d’une chaise ?</h3><p>Un geste quotidien qui combine force, puissance, équilibre et coordination.</p></div><span class="meta meta-col">Fonction · Muscle · 6 min</span><span class="arrow">→</span></a>
<a class="article-link" href="/media/marche-asymetrique" data-search-item data-topics="marche biomecanique mobilite clinique" data-search="marche asymétrique asymetrique un côté cote pas différent difference droite gauche gait asymmetry boiterie symétrie symetrie"><span class="number">11</span><div><h3>Pourquoi ma marche peut-elle devenir asymétrique ?</h3><p>Différences droite-gauche, adaptation et intérêt d’une mesure répétée.</p></div><span class="meta meta-col">Marche · Biomécanique · 6 min</span><span class="arrow">→</span></a>
<a class="article-link" href="/media/tester-mobilite-chez-soi" data-search-item data-topics="tests prevention mobilite marche" data-search="comment tester mobilité mobilite chez soi maison test mobilité domicile lever chaise marche équilibre equilibre komo check prévention prevention"><span class="number">12</span><div><h3>Comment tester sa mobilité chez soi ?</h3><p>Des repères simples pour commencer à mesurer sans confondre auto-évaluation et diagnostic.</p></div><span class="meta meta-col">Prévention · Tests · 7 min</span><span class="arrow">→</span></a>
<a class="article-link" href="/media/posture-penchee-en-avant" data-search-item data-topics="posture biomecanique marche clinique" data-search="posture penchée penchee en avant marche tronc forward stooped sagittal balance équilibre sagittal rachis dos bassin genoux compensation"><span class="number">13</span><div><h3>Pourquoi peut-on se pencher davantage en avant en marchant ?</h3><p>Rachis, bassin et membres inférieurs participent ensemble à l’équilibre sagittal.</p></div><span class="meta meta-col">Posture · Rachis · 7 min</span><span class="arrow">→</span></a>`;
    html = html.replace('</div></div></section>\n\n<section class="section" id="videos"',`${items}\n</div></div></section>\n\n<section class="section" id="videos"`);
  }

  if (!html.includes('id="newsletter"')) {
    const newsletter = `<section class="newsletter" id="newsletter"><div class="shell newsletter-grid"><div><p class="eyebrow">KŌMØ REVIEW · CHAQUE MOIS</p><h2>Recevoir la science<br><em>du mouvement.</em></h2></div><div><p>Une sélection courte d’articles, de publications et de perspectives cliniques sur la longévité locomotrice. Pas de flux quotidien : une édition mensuelle pensée pour être lue.</p><form class="newsletter-form" data-review-form><label style="position:absolute;left:-9999px" for="review-email">Votre e-mail</label><input class="newsletter-input" id="review-email" type="email" required autocomplete="email" placeholder="votre@email.com"/><button class="newsletter-submit" type="submit">S’inscrire →</button></form><p class="newsletter-note">Inscription par e-mail pour le moment · aucune donnée de santé collectée.</p><p class="newsletter-status" data-review-status aria-live="polite"></p></div></div></section>`;
    html = html.replace('</main>',`${newsletter}\n</main>`);
    const js = `<script id="library-review-signup">(()=>{const f=document.querySelector('[data-review-form]');if(!f)return;f.addEventListener('submit',e=>{e.preventDefault();const v=document.getElementById('review-email').value.trim();if(!v)return;const subject=encodeURIComponent('Inscription KŌMØ Review');const body=encodeURIComponent('Bonjour,\\n\\nJe souhaite recevoir KŌMØ Review chaque mois.\\n\\nE-mail : '+v+'\\n\\nMerci.');document.querySelector('[data-review-status]').textContent='Votre demande est prête à être envoyée depuis votre messagerie.';window.location.href='mailto:contact@komolongevity.com?subject='+subject+'&body='+body;});})();</script>`;
    html = html.replace('</body>',`${js}\n</body>`);
  }
  await writeFile(mediaPath,html,'utf8');
} catch(e) { console.warn('[library-intent-ui] media:',e.message); }

console.log('[library-intent-ui] search-intent cluster, KŌMØ Check CTA and Review signup added.');
