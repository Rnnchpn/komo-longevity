import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = process.cwd();
const files = [
  join(root, 'site', 'index.html'),
  join(root, 'site', 'fr', 'index.html'),
  join(root, 'site', 'en', 'index.html'),
  join(root, 'site', 'es', 'index.html')
];

const style = `<style id="komo-homepage-premium-motion-v1-style">
  :root{--komo-premium-ease:cubic-bezier(.22,1,.36,1)}
  .rvc-home{position:relative;isolation:isolate;scroll-behavior:smooth}
  .rvc-home .rvc-shell{position:relative;z-index:1}
  #komo-premium-progress{position:fixed;top:0;left:0;z-index:220;width:0;height:2px;pointer-events:none;background:linear-gradient(90deg,#ee8e70 0%,#f6c85f 46%,#69c9bf 100%);box-shadow:0 0 15px rgba(105,201,191,.42);transition:width .12s linear}
  #komo-premium-glow{position:fixed;left:50vw;top:30vh;z-index:0;width:340px;height:340px;border-radius:50%;pointer-events:none;opacity:0;background:radial-gradient(circle,rgba(255,255,255,.12) 0%,rgba(105,201,191,.08) 26%,transparent 70%);filter:blur(2px);transform:translate3d(-50%,-50%,0);transition:opacity .45s ease}
  body.komo-premium-pointer #komo-premium-glow{opacity:.7}
  .kp-top.komo-premium-scrolled{box-shadow:0 14px 44px rgba(16,42,53,.12)!important}
  .komo-premium-ready .komo-premium-reveal{opacity:0;transform:translate3d(0,24px,0);transition:opacity .9s var(--komo-premium-ease) var(--komo-reveal-delay,0ms),transform .9s var(--komo-premium-ease) var(--komo-reveal-delay,0ms)}
  .komo-premium-ready .komo-premium-reveal.is-visible{opacity:1;transform:none}
  .rvc-home .komo-premium-hover{transition:transform .6s var(--komo-premium-ease),box-shadow .6s var(--komo-premium-ease),border-color .35s ease,background-color .35s ease}
  @media(hover:hover) and (pointer:fine){
    .rvc-home .komo-premium-hover:hover{transform:translate3d(0,-7px,0);box-shadow:0 22px 55px rgba(16,42,53,.12)}
    .rvc-home .rvc-btn{position:relative;overflow:hidden;isolation:isolate}
    .rvc-home .rvc-btn:after{content:'';position:absolute;inset:-60% auto -60% -35%;z-index:-1;width:22%;background:rgba(255,255,255,.44);transform:translateX(-240%) rotate(18deg);transition:transform .75s var(--komo-premium-ease)}
    .rvc-home .rvc-btn:hover:after{transform:translateX(760%) rotate(18deg)}
    .rvc-home .komo-premium-tilt{transform:perspective(1100px) rotateX(var(--komo-tilt-x,0deg)) rotateY(var(--komo-tilt-y,0deg)) translate3d(0,var(--komo-tilt-lift,0px),0);transition:transform .75s var(--komo-premium-ease),box-shadow .75s var(--komo-premium-ease)}
    .rvc-home .komo-premium-tilt:hover{--komo-tilt-lift:-4px}
    .rvc-home .komo-premium-tilt:hover img{transform:translate3d(0,var(--komo-hero-shift,0px),0) scale(1.045)}
  }
  .rvc-home .rvc-photo img{transition:transform 1.2s var(--komo-premium-ease),filter 1.2s ease}
  .rvc-home .rvc-photo:hover img{filter:saturate(1.06) contrast(1.02)}
  .rvc-home .rvc-photo--hero img{transform:translate3d(0,var(--komo-hero-shift,0px),0) scale(1.02)}
  @media(prefers-reduced-motion:reduce){
    .rvc-home{scroll-behavior:auto}
    #komo-premium-progress,#komo-premium-glow{display:none}
    .komo-premium-ready .komo-premium-reveal{opacity:1;transform:none;transition:none}
    .rvc-home .komo-premium-hover,.rvc-home .komo-premium-tilt,.rvc-home .rvc-photo img{transition:none!important;transform:none!important}
  }
</style>`;

const script = `<script id="komo-homepage-premium-motion-v1-script">
(()=>{
  const home=document.querySelector('.rvc-home');
  if(!home) return;
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const progress=document.createElement('div');
  progress.id='komo-premium-progress';
  document.body.appendChild(progress);
  if(reduce) return;
  const glow=document.createElement('div');
  glow.id='komo-premium-glow';
  document.body.appendChild(glow);
  document.documentElement.classList.add('komo-premium-ready');
  const revealSelector=[
    '.komo-patient-hero .rvc-hero-grid>div',
    '.komo-patient-hero .rvc-photo',
    '.komo-patient-clarity-grid>*',
    '.komo-patient-clarity-card',
    '.komo-experience-home-intro>*',
    '.komo-experience-home-card',
    '.komo-patient-founder-grid>*',
    '.rvc-section-head>*',
    '.rvc-path-step',
    '.rvc-kit-grid>*',
    '.rvc-session-grid>*',
    '.rvc-boundary-grid>*',
    '.komo-world-home-copy',
    '.komo-world-home-orbit',
    '.rvc-final-grid>*'
  ].join(',');
  const reveals=Array.from(home.querySelectorAll(revealSelector));
  reveals.forEach((el,index)=>{
    el.classList.add('komo-premium-reveal');
    el.style.setProperty('--komo-reveal-delay',Math.min(index%6,5)*65+'ms');
  });
  const show=(el)=>el.classList.add('is-visible');
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver((entries)=>entries.forEach((entry)=>{if(entry.isIntersecting){show(entry.target);observer.unobserve(entry.target)}}),{threshold:.12,rootMargin:'0px 0px -7% 0px'});
    reveals.forEach((el)=>observer.observe(el));
  }else reveals.forEach(show);
  const hoverSelector='.komo-patient-clarity-card,.komo-experience-home-card,.rvc-path-step,.rvc-boundary-card,.komo-world-home-orbit-card,.rvc-photo';
  home.querySelectorAll(hoverSelector).forEach((el)=>el.classList.add('komo-premium-hover'));
  const fine=window.matchMedia&&window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(fine){
    const tiltSelector='.rvc-home-hero .rvc-photo--hero,.komo-world-home-orbit-card';
    home.querySelectorAll(tiltSelector).forEach((el)=>{
      el.classList.add('komo-premium-tilt');
      el.addEventListener('pointermove',(event)=>{
        const rect=el.getBoundingClientRect();
        const x=(event.clientX-rect.left)/rect.width-.5;
        const y=(event.clientY-rect.top)/rect.height-.5;
        el.style.setProperty('--komo-tilt-y',(x*5.5).toFixed(2)+'deg');
        el.style.setProperty('--komo-tilt-x',(-y*5.5).toFixed(2)+'deg');
      });
      el.addEventListener('pointerleave',()=>{
        el.style.setProperty('--komo-tilt-y','0deg');
        el.style.setProperty('--komo-tilt-x','0deg');
      });
    });
    window.addEventListener('pointermove',(event)=>{
      glow.style.left=event.clientX+'px';
      glow.style.top=event.clientY+'px';
      document.body.classList.add('komo-premium-pointer');
    },{passive:true});
  }
  const header=document.querySelector('.kp-top');
  const heroImage=home.querySelector('.rvc-home-hero .rvc-photo--hero img');
  let raf=0;
  const update=()=>{
    raf=0;
    const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);
    const ratio=Math.min(1,Math.max(0,window.scrollY/max));
    progress.style.width=(ratio*100).toFixed(2)+'%';
    if(header) header.classList.toggle('komo-premium-scrolled',window.scrollY>18);
    if(heroImage) heroImage.style.setProperty('--komo-hero-shift',Math.min(26,window.scrollY*.045).toFixed(1)+'px');
  };
  const schedule=()=>{if(!raf) raf=window.requestAnimationFrame(update)};
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  update();
})();
</script>`;

for (const file of files) {
  let html = await readFile(file, 'utf8');
  html = html.replace(/\s*<style id="komo-homepage-premium-motion-v1-style">[\s\S]*?<\/style>/, '');
  html = html.replace(/\s*<script id="komo-homepage-premium-motion-v1-script">[\s\S]*?<\/script>/, '');
  html = html.replace('</head>', `\n${style}\n</head>`);
  html = html.replace('</body>', `${script}\n</body>`);
  await writeFile(file, html);
}

console.log('[homepage-premium-motion-v1] PASS · premium scroll, hover, tilt and reveal effects applied to FR/EN/ES home routes');
