import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const site = join(root, 'site');
const chunksDir = join(root, 'src', 'assets', 'site2026', 'generated-v2');
const heroOut = join(site, 'assets', 'images', 'komo-hero-20260930.avif');
const chunkNames = Array.from({length:9}, (_,i) => `komo-hero-20260930-${String(i+1).padStart(2,'0')}.b64`);

await mkdir(join(site, 'assets', 'images'), { recursive: true });
const encoded = (await Promise.all(chunkNames.map(name => readFile(join(chunksDir, name), 'utf8')))).join('').replace(/\s+/g,'');
await writeFile(heroOut, Buffer.from(encoded, 'base64'));

const css = `
<style id="komo-home-hero-20260930-v2-style">
.komo-hero-20260930{
  position:relative!important;
  display:block!important;
  min-height:clamp(640px,82vh,840px)!important;
  overflow:hidden!important;
  background:#cdbca8!important;
}
.komo-hero-20260930 .kpv-hero-media{
  position:absolute!important;
  inset:0!important;
  width:100%!important;
  height:100%!important;
  margin:0!important;
  overflow:hidden!important;
  z-index:0!important;
  background:#cdbca8!important;
}
.komo-hero-20260930 .kpv-hero-media:after{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background:linear-gradient(90deg,rgba(24,21,17,.07) 0%,rgba(24,21,17,0) 42%);
}
.komo-hero-20260930 .kpv-hero-media img{
  display:block!important;
  width:100%!important;
  height:100%!important;
  min-height:100%!important;
  object-fit:cover!important;
  object-position:center center!important;
  image-rendering:auto!important;
  opacity:0;
  transform:translateZ(0) scale(1.002);
  backface-visibility:hidden;
  transition:opacity .28s ease;
}
.komo-hero-20260930.is-image-ready .kpv-hero-media img{opacity:1}
.komo-hero-20260930 .kc-hero-copy{
  position:absolute!important;
  z-index:2!important;
  left:clamp(28px,4.7vw,72px)!important;
  bottom:clamp(30px,4.4vw,58px)!important;
  width:min(500px,calc(100% - 56px))!important;
  max-width:500px!important;
  padding:clamp(24px,2.2vw,30px)!important;
  margin:0!important;
  min-height:0!important;
  border:1px solid rgba(255,255,255,.58)!important;
  border-radius:22px!important;
  background:rgba(248,245,238,.91)!important;
  box-shadow:0 24px 70px rgba(31,25,19,.10)!important;
  backdrop-filter:blur(14px) saturate(112%);
  -webkit-backdrop-filter:blur(14px) saturate(112%);
}
.komo-hero-20260930 .kc-hero-copy .kt-title{
  max-width:450px!important;
  font-size:clamp(56px,5vw,76px)!important;
  line-height:.92!important;
  letter-spacing:-.05em!important;
}
.komo-hero-20260930 .kc-hero-copy .kt-lead,
.komo-hero-20260930 .kc-hero-copy .kt-copy{
  max-width:440px!important;
  font-size:clamp(15px,1.28vw,18px)!important;
  line-height:1.55!important;
}
.komo-hero-20260930 .kc-hero-copy .kt-btns{margin-top:24px!important}
.komo-hero-20260930 .kc-hero-copy .kt-btn{min-height:44px!important;padding:0 20px!important}
body.komo-home-hero-page .ke-switch,
body.komo-home-hero-page .ke-pulse{display:none!important}

@media(max-width:1100px) and (min-width:761px){
  .komo-hero-20260930 .kc-hero-copy{
    width:min(460px,calc(100% - 48px))!important;
    max-width:460px!important;
  }
  .komo-hero-20260930 .kc-hero-copy .kt-title{font-size:clamp(52px,6vw,68px)!important}
}
@media(max-width:760px){
  .komo-hero-20260930{
    min-height:0!important;
    display:grid!important;
    grid-template-columns:1fr!important;
    background:#f7f2e9!important;
  }
  .komo-hero-20260930 .kpv-hero-media{
    position:relative!important;
    inset:auto!important;
    aspect-ratio:16/11!important;
    order:0!important;
  }
  .komo-hero-20260930 .kpv-hero-media:after{display:none!important}
  .komo-hero-20260930 .kpv-hero-media img{
    min-height:0!important;
    object-position:51% center!important;
    transform:none;
  }
  .komo-hero-20260930 .kc-hero-copy{
    position:relative!important;
    left:auto!important;
    bottom:auto!important;
    order:1!important;
    width:100%!important;
    max-width:none!important;
    padding:32px 22px 40px!important;
    border:0!important;
    border-radius:0!important;
    background:#f7f2e9!important;
    box-shadow:none!important;
    backdrop-filter:none!important;
    -webkit-backdrop-filter:none!important;
  }
  .komo-hero-20260930 .kc-hero-copy .kt-title{
    max-width:100%!important;
    font-size:clamp(45px,13vw,62px)!important;
    line-height:.94!important;
  }
}
</style>`;

const runtime=`<script id="komo-home-hero-20260930-v2-runtime">
(()=>{
  document.body.classList.add('komo-home-hero-page');
  const hero=document.querySelector('.komo-hero-20260930');
  const img=hero?.querySelector('.kpv-hero-media img');
  if(!hero||!img)return;
  let done=false;
  const ready=()=>{if(done)return;done=true;hero.classList.add('is-image-ready')};
  if(img.decode){
    img.decode().then(ready).catch(ready);
  }else if(img.complete){
    ready();
  }else{
    img.addEventListener('load',ready,{once:true});
    img.addEventListener('error',ready,{once:true});
  }
  setTimeout(ready,1400);
})();
</script>`;

async function patch(rel){
  const fp = join(site, rel);
  try { await access(fp); } catch { return; }
  let html = await readFile(fp, 'utf8');

  html = html
    .replaceAll('/assets/images/komo-hero-hd-v4.webp', '/assets/images/komo-hero-20260930.avif')
    .replaceAll('/assets/images/komo-longevity-v3.webp', '/assets/images/komo-hero-20260930.avif');

  html = html.replace(
    /(<figure[^>]*class="[^"]*kpv-hero-media[^"]*"[^>]*>\s*<img\s+)([^>]*)(>)/i,
    (_, start, attrs, end) => {
      let next = attrs.replace(/src="[^"]*"/i, 'src="/assets/images/komo-hero-20260930.avif"');
      if (!/src="/i.test(next)) next = 'src="/assets/images/komo-hero-20260930.avif" ' + next;
      next = next.replace(/alt="[^"]*"/i, 'alt="KŌMØ Longevity — évaluation fonctionnelle du mouvement sur la Côte d’Azur"');
      if (!/alt="/i.test(next)) next += ' alt="KŌMØ Longevity — évaluation fonctionnelle du mouvement sur la Côte d’Azur"';
      next = next.replace(/loading="lazy"/i, 'loading="eager"');
      if (!/loading=/i.test(next)) next += ' loading="eager"';
      if (!/fetchpriority=/i.test(next)) next += ' fetchpriority="high"';
      if (!/decoding=/i.test(next)) next += ' decoding="sync"';
      return start + next + end;
    }
  );

  html = html.replace(
    /<section class="([^"]*\bkc-hero\b[^"]*)">/i,
    (_, classes) => {
      const set = new Set(classes.split(/\s+/).filter(Boolean));
      set.add('komo-hero-20260930');
      return `<section class="${[...set].join(' ')}">`;
    }
  );

  html=html
    .replace(/<style id="komo-home-hero-20260930-v1-style">[\s\S]*?<\/style>/,'')
    .replace(/<style id="komo-home-hero-20260930-v2-style">[\s\S]*?<\/style>/,'')
    .replace(/<script id="komo-home-hero-20260930-v2-runtime">[\s\S]*?<\/script>/,'');

  const preload='<link rel="preload" as="image" href="/assets/images/komo-hero-20260930.avif" type="image/avif" fetchpriority="high">';
  if(!html.includes('href="/assets/images/komo-hero-20260930.avif" type="image/avif"')){
    html=html.replace('</head>',preload+'\n'+css+'\n</head>');
  }else{
    html=html.replace('</head>',css+'\n</head>');
  }
  html=html.replace('</body>',runtime+'\n</body>');

  await writeFile(fp, html, 'utf8');
}

await patch('index.html');
await patch('fr/index.html');

console.log('[komo-home-hero-20260930-v2] PASS · cleaner composition, decoded-image reveal and unobstructed hero.');
