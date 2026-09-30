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
<style id="komo-home-hero-20260930-v1-style">
.komo-hero-20260930{
  position:relative!important;
  display:block!important;
  min-height:clamp(650px,82vh,900px)!important;
  overflow:hidden!important;
  background:#d6c8b7!important;
}
.komo-hero-20260930 .kpv-hero-media{
  position:absolute!important;
  inset:0!important;
  width:100%!important;
  height:100%!important;
  margin:0!important;
  overflow:hidden!important;
  z-index:0!important;
}
.komo-hero-20260930 .kpv-hero-media:after{
  content:"";
  position:absolute;
  inset:0;
  pointer-events:none;
  background:linear-gradient(90deg,rgba(21,18,14,.12) 0%,rgba(21,18,14,0) 52%);
}
.komo-hero-20260930 .kpv-hero-media img{
  display:block!important;
  width:100%!important;
  height:100%!important;
  min-height:100%!important;
  object-fit:cover!important;
  object-position:center center!important;
  image-rendering:auto!important;
}
.komo-hero-20260930 .kc-hero-copy{
  position:absolute!important;
  z-index:2!important;
  left:clamp(20px,5vw,76px)!important;
  bottom:clamp(24px,5vw,70px)!important;
  width:min(620px,calc(100% - 40px))!important;
  max-width:620px!important;
  padding:clamp(22px,2.8vw,34px)!important;
  margin:0!important;
  min-height:0!important;
  border:1px solid rgba(255,255,255,.48)!important;
  border-radius:24px!important;
  background:rgba(248,244,236,.88)!important;
  box-shadow:0 24px 70px rgba(31,25,19,.12)!important;
  backdrop-filter:blur(16px) saturate(118%);
  -webkit-backdrop-filter:blur(16px) saturate(118%);
}
.komo-hero-20260930 .kc-hero-copy .kt-title{max-width:560px!important}
.komo-hero-20260930 .kc-hero-copy .kt-copy{max-width:560px!important}
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
  }
  .komo-hero-20260930 .kc-hero-copy{
    position:relative!important;
    left:auto!important;
    bottom:auto!important;
    order:1!important;
    width:100%!important;
    max-width:none!important;
    padding:34px 22px 42px!important;
    border:0!important;
    border-radius:0!important;
    background:#f7f2e9!important;
    box-shadow:none!important;
    backdrop-filter:none!important;
    -webkit-backdrop-filter:none!important;
  }
}
</style>`;

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
      if (!/fetchpriority=/i.test(next)) next += ' fetchpriority="high"';
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

  if (!html.includes('komo-home-hero-20260930-v1-style')) {
    html = html.replace('</head>', css + '\n</head>');
  }

  await writeFile(fp, html, 'utf8');
}

await patch('index.html');
await patch('fr/index.html');

console.log('[komo-home-hero-20260930-v1] PASS · uploaded KŌMØ image installed as responsive homepage hero.');
