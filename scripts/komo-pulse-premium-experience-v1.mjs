import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
const dir=join(process.cwd(),'site','parcours');
const path=join(dir,'index.html');
let html=await readFile(path,'utf8');
const css=String.raw`
/* KŌMØ PUBLIC JOURNEY — immersive editorial layer */
:root{--j-forest:#163a27;--j-mint:#d8e7d8;--j-paper:#fbfaf5;--j-ease:cubic-bezier(.22,1,.36,1)}
html{scroll-behavior:smooth}body{background:#f6f5ef;overflow-x:clip}
a:focus-visible{outline:3px solid #6d9b70;outline-offset:4px}
.journey-progress{position:fixed;z-index:80;left:0;top:0;width:100%;height:3px;pointer-events:none;background:transparent}
.journey-progress span{display:block;height:100%;width:100%;background:#729b76;transform:scaleX(0);transform-origin:left center;will-change:transform}
.journey-nav{position:sticky;top:0;z-index:65;max-width:none;padding-inline:max(24px,calc((100vw - 1152px)/2));background:rgba(250,250,245,.87);border-bottom:1px solid rgba(63,88,66,.07);backdrop-filter:blur(22px) saturate(1.2);-webkit-backdrop-filter:blur(22px) saturate(1.2);transition:box-shadow .35s ease}
.journey-nav.is-scrolled{box-shadow:0 12px 30px rgba(23,55,31,.05)}
.journey-nav .logo{letter-spacing:.19em;font-size:28px;transition:letter-spacing .4s ease}.journey-nav .logo:hover{letter-spacing:.225em}
.journey-nav .right a{position:relative;text-decoration:none;transition:color .3s ease}
.journey-nav .right a:hover{color:#176638}
.journey-nav .right a:after{content:"";position:absolute;left:0;right:100%;bottom:-5px;height:1px;background:#447a50;transition:right .4s var(--j-ease)}
.journey-nav .right a:hover:after{right:0}
main{padding-top:28px}
.hero{gap:18px}
.intro{position:relative;isolation:isolate;overflow:hidden;padding:clamp(34px,5.5vw,72px);min-height:560px;background:linear-gradient(130deg,#163c29,#234b34);box-shadow:0 30px 70px rgba(30,66,37,.11)}
.intro:before{content:"";position:absolute;z-index:-1;right:-22%;bottom:-42%;width:690px;height:690px;border:1px solid rgba(231,248,231,.19);border-radius:50%;box-shadow:0 0 0 55px rgba(231,248,231,.04),0 0 0 125px rgba(231,248,231,.025),0 0 0 200px rgba(231,248,231,.02);animation:journey-orbit 18s ease-in-out infinite alternate}
.intro:after{content:"";position:absolute;z-index:-1;inset:0;background:radial-gradient(circle at 105% 25%,rgba(204,234,199,.13),transparent 43%)}
.intro .eyebrow{color:#c0dbc2;font-size:11px;letter-spacing:.24em}
.intro h1{font-size:clamp(46px,5.2vw,78px);letter-spacing:-.075em;animation:journey-float .9s .06s both var(--j-ease)}
.intro h1 em{font-family:Georgia,"Times New Roman",serif;font-style:italic;font-weight:400;color:#cfe6cc;letter-spacing:-.055em}
.intro p{font-size:clamp(14px,1.5vw,17px);max-width:580px;color:#e0eee1;line-height:1.85;animation:journey-float 1s .15s both var(--j-ease)}
.actions{animation:journey-float 1s .23s both var(--j-ease)}
a.button{position:relative;isolation:isolate;overflow:hidden;min-height:53px;padding-inline:25px;font-size:13px;transition:transform .33s var(--j-ease),box-shadow .33s ease,background-color .3s ease}
a.button:hover{transform:translateY(-3px);box-shadow:0 16px 30px rgba(17,43,25,.14)}
a.button:active{transform:translateY(-1px)}
a.button::after{content:"";position:absolute;width:40%;height:260%;top:-80%;left:-65%;transform:rotate(20deg);background:linear-gradient(90deg,transparent,rgba(255,255,255,.22),transparent);transition:left .8s var(--j-ease)}
a.button:hover:after{left:140%}
a.ghost{transition:color .25s ease,letter-spacing .35s ease;text-underline-offset:5px}a.ghost:hover{letter-spacing:.02em;text-decoration:underline}
.hero-visual{min-height:560px;isolation:isolate;position:relative;background:#60796a;box-shadow:0 30px 70px rgba(28,56,37,.1)}
.hero-visual:before{content:"";position:absolute;z-index:-2;inset:-8%;background:url('/assets/images/hero-mediterranean-motion-v1.webp') center/cover no-repeat;animation:journey-photo 22s ease-in-out infinite alternate}
.hero-visual:after{content:"";position:absolute;z-index:-1;inset:0;background:linear-gradient(0deg,rgba(16,39,26,.78),rgba(15,40,24,.05) 66%)}
.hero-visual strong{font:500 clamp(32px,3.4vw,47px)/1.05 Manrope,sans-serif;letter-spacing:-.06em}
.hero-visual p{color:#e1f0e2;font-size:14px;line-height:1.75}
.hero-visual>div{max-width:360px;position:relative}
.section-head{position:relative;margin-top:78px}
.section-head::before{content:"";position:absolute;top:-31px;width:42px;height:1px;background:#71997b}
.section-head .label{letter-spacing:.2em;color:#517c5d}
.section-head h2{font-size:clamp(33px,4vw,54px);letter-spacing:-.065em;margin:11px 0 15px}
.section-head p{font-size:15px;max-width:730px;line-height:1.85}
.steps{position:relative;gap:13px}
.steps:before{content:"";position:absolute;left:7%;right:7%;top:24px;border-top:1px solid rgba(84,119,90,.25);z-index:0}
.steps article{z-index:1;position:relative;border:1px solid #dfe6dc;border-radius:23px;background:linear-gradient(165deg,#fffefb,#f9faf5);padding:27px 24px;min-height:260px;overflow:hidden;transition:transform .5s var(--j-ease),box-shadow .5s var(--j-ease),border-color .4s ease}
.steps article:before{content:"";position:absolute;right:-58px;bottom:-76px;width:195px;height:195px;border-radius:50%;background:radial-gradient(circle,rgba(206,229,208,.58),transparent 69%);opacity:.5;transform:scale(.68);transition:transform .6s var(--j-ease),opacity .4s ease}
.steps article:hover{transform:translateY(-9px);box-shadow:0 25px 55px rgba(21,59,31,.09);border-color:#b5cbb7}
.steps article:hover:before{transform:scale(1.5);opacity:1}
.steps article b{display:inline-flex;min-height:27px;align-items:center;color:#28543a;font-size:10px;letter-spacing:.12em}
.steps article h3{font-size:22px;margin:34px 0 14px;letter-spacing:-.045em}
.steps article p{font-size:13px;line-height:1.76}
.steps article:after{content:"↗";font:400 21px/1 Manrope,sans-serif;position:absolute;top:25px;right:25px;color:#b6ccba;transform:translate(0,0);transition:transform .4s var(--j-ease),color .3s ease}
.steps article:hover:after{transform:translate(3px,-3px);color:#537d5d}
.bottom{gap:17px;margin-top:21px}
.bottom>article{position:relative;overflow:hidden;padding:clamp(28px,3.5vw,43px);border-radius:25px;min-height:260px;background:linear-gradient(135deg,#dfece0,#eef3eb)}
.bottom>article:last-child{background:linear-gradient(135deg,#eee8de,#f6f1e8)}
.bottom h3{font-size:29px;letter-spacing:-.05em;margin:13px 0}
.bottom p{font-size:14px;max-width:490px}
.bottom .button{margin-top:12px}
footer{font-size:12px;border-color:#dbe4da}
@keyframes journey-float{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
@keyframes journey-photo{0%{transform:scale(1) translate3d(0,0,0)}100%{transform:scale(1.065) translate3d(-1%,.7%,0)}}
@keyframes journey-orbit{from{transform:translate(0,0) scale(1)}to{transform:translate(-25px,-18px) scale(1.08)}}
.journey-enhanced .section-head,.journey-enhanced .steps article,.journey-enhanced .bottom>article{opacity:0;transform:translateY(25px);transition:opacity .75s var(--j-ease),transform .75s var(--j-ease)}
.journey-enhanced .section-head.in-view,.journey-enhanced .steps article.in-view,.journey-enhanced .bottom>article.in-view{opacity:1;transform:translateY(0)}
.journey-enhanced .steps article.in-view:hover{transform:translateY(-9px)}
@media(max-width:1050px){.intro,.hero-visual{min-height:450px}.steps:before{display:none}}
@media(max-width:980px){.hero{gap:14px}.steps{grid-template-columns:repeat(2,minmax(0,1fr))}.intro{min-height:410px}.hero-visual{min-height:310px}}
@media(max-width:540px){.journey-nav{padding:16px}.journey-nav .logo{font-size:24px}.journey-nav .right{gap:12px}.journey-nav .right a{font-size:11px}
 main{padding:13px 15px 45px}
 .intro{padding:33px 27px;border-radius:24px;min-height:440px}
 .intro h1{font-size:clamp(41px,10.3vw,54px)}
 .intro p{font-size:14px}
 .hero-visual{border-radius:24px;min-height:300px}
 .hero-visual strong{font-size:35px}
 .section-head{margin-top:60px}
 .section-head h2{font-size:35px}
 .steps{grid-template-columns:1fr;gap:12px}
 .steps article{min-height:190px;padding:23px}.steps article h3{margin:19px 0 12px}
 .steps article:hover{transform:none}
 .bottom{grid-template-columns:1fr}
 .bottom>article{min-height:220px}.bottom h3{font-size:25px}
 footer{padding-inline:15px}
}
@media(prefers-reduced-motion:reduce){
 *,*::before,*::after{animation:none!important;transition-duration:.01ms!important;scroll-behavior:auto!important}
 .journey-enhanced .section-head,.journey-enhanced .steps article,.journey-enhanced .bottom>article{opacity:1!important;transform:none!important}
 .journey-progress{display:none}
}
`;
const js=String.raw`(() => {
 const prefersReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
 const progress=document.querySelector('.journey-progress span');
 const nav=document.querySelector('.journey-nav');
 let raf=0;
 const update=()=>{raf=0;const max=Math.max(1,document.documentElement.scrollHeight-window.innerHeight);const pct=Math.max(0,Math.min(1,window.scrollY/max));if(progress)progress.style.transform='scaleX('+pct.toFixed(4)+')';nav?.classList.toggle('is-scrolled',window.scrollY>14)};
 window.addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});
 window.addEventListener('resize',update,{passive:true});update();
 if(prefersReduced||!('IntersectionObserver' in window))return;
 const targets=[...document.querySelectorAll('.section-head,.steps article,.bottom>article')];
 const obs=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');obs.unobserve(entry.target)}})},{threshold:.09,rootMargin:'0px 0px -35px 0px'});
 // Only hide targets once an observer is ready, avoiding invisible content on browser errors.
 document.documentElement.classList.add('journey-enhanced');targets.forEach(el=>obs.observe(el));
})();
`;
html=html.replace('<nav aria-label="Navigation principale">','<nav class="journey-nav" aria-label="Navigation principale">');
html=html.replace('<body>','<body><div class="journey-progress" aria-hidden="true"><span></span></div>');
html=html.replace('</head>','<link rel="stylesheet" href="/parcours/experience.css"></head>');
html=html.replace('</body>','<script defer src="/parcours/experience.js"></script></body>');
await writeFile(join(dir,'experience.css'),css,'utf8');
await writeFile(join(dir,'experience.js'),js,'utf8');
await writeFile(path,html,'utf8');
console.log('[komo-pulse-premium-experience] public Motion journey animated with reduced-motion and progressive enhancement');
