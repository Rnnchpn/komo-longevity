import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const site=join(process.cwd(),'site');
const pages=[
  {path:'key/index.html',home:'index.html',href:'/key/',wear:'Wear',data:'Data',privacy:'Privacy'},
  {path:'fr/key/index.html',home:'fr/index.html',href:'/fr/key/',wear:'Port',data:'Données',privacy:'Confidentialité'},
  {path:'es/key/index.html',home:'es/index.html',href:'/es/key/',wear:'Uso',data:'Datos',privacy:'Privacidad'}
];

const css=`<style id="komo-key-polish-v2">
:root{--key-black:#060707;--key-panel:#0d0f0e;--key-paper:#f4f0e7;--key-sage:#91aa9f;--key-beige:#ded0b9;--key-line:rgba(255,255,255,.13)}
html{background:var(--key-black)!important;color-scheme:dark;-webkit-tap-highlight-color:transparent}body{background:var(--key-black)!important;min-width:320px;overflow-x:hidden}.top{position:sticky;top:0;z-index:50;width:min(calc(100% - 48px),1360px);height:68px;background:rgba(6,7,7,.88);backdrop-filter:blur(22px);-webkit-backdrop-filter:blur(22px);border-bottom-color:rgba(255,255,255,.08)}.brand{font-size:14px;letter-spacing:.23em}.links a{transition:color .2s ease,background .2s ease,transform .2s ease}.links a:hover{color:#fff}.links .pulse{border-radius:10px;min-height:40px;display:inline-flex;align-items:center;padding:0 14px}.links .pulse:hover{transform:translateY(-1px)}
.key-rail{position:sticky;top:68px;z-index:45;height:42px;border-bottom:1px solid rgba(255,255,255,.08);background:rgba(6,7,7,.9);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px)}.key-rail__in{width:min(calc(100% - 48px),1360px);height:100%;margin:auto;display:flex;align-items:center;justify-content:center;gap:clamp(24px,5vw,64px)}.key-rail a{color:rgba(255,255,255,.42);font-size:7px;font-weight:850;letter-spacing:.15em;text-transform:uppercase;text-decoration:none;transition:color .18s ease}.key-rail a:hover{color:#fff}
.hero{min-height:auto;padding:clamp(68px,8vw,118px) 0 clamp(70px,9vw,126px);background:radial-gradient(circle at 79% 14%,rgba(145,170,159,.12),transparent 27%),var(--key-black)}.hero:after{width:min(70vw,900px);height:min(70vw,900px);right:-26vw;top:9vw;border-color:rgba(255,255,255,.045)}.hero .shell{position:relative}.hero .shell:before{content:'KŌMØ KEY';display:block;margin:0 0 clamp(50px,7vw,92px);color:#fff;font-size:clamp(82px,14vw,196px);font-weight:900;line-height:.72;letter-spacing:-.085em;white-space:nowrap}.ey{color:var(--key-beige)}.status{background:rgba(255,255,255,.035)}.hero-grid{margin-top:clamp(36px,5vw,64px);padding-top:28px;border-top:1px solid rgba(255,255,255,.25);grid-template-columns:minmax(0,1.15fr) minmax(330px,.85fr);gap:clamp(44px,7vw,110px)}.hero h1{font-size:clamp(48px,6vw,86px);line-height:.91}.lead{font-size:clamp(16px,1.3vw,19px);line-height:1.58}.btn{border-radius:10px;min-height:52px;padding:0 21px;transition:transform .2s ease,filter .2s ease}.btn:hover{transform:translateY(-1px);filter:brightness(1.04)}
.object-stage{margin-top:clamp(54px,7vw,92px);gap:14px}.dock{min-height:360px;border-radius:26px;background:linear-gradient(150deg,#111412,#090a0a);transition:transform .35s cubic-bezier(.22,1,.36,1),border-color .35s ease,box-shadow .35s ease}.dock:nth-child(2){min-height:420px;background:radial-gradient(circle at 50% 35%,rgba(145,170,159,.10),transparent 34%),linear-gradient(150deg,#151916,#090a0a)}.dock:hover{transform:translateY(-4px);border-color:rgba(222,208,185,.24);box-shadow:0 30px 80px rgba(0,0,0,.24)}.dock small{top:22px;left:22px}.core{width:166px;height:108px;border-radius:31px;background:linear-gradient(145deg,#303632,#121512);box-shadow:0 36px 90px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,255,255,.09)}.core:after{opacity:.88}
.section{padding:clamp(78px,9vw,126px) 0}.section h2{font-size:clamp(46px,5.6vw,76px);font-weight:650;letter-spacing:-.06em}.cycle{gap:0;margin-top:50px;border-top:1px solid rgba(255,255,255,.24);border-bottom:1px solid rgba(255,255,255,.12)}.card{min-height:320px;border:0;border-right:1px solid rgba(255,255,255,.1);border-radius:0;background:transparent;padding:28px 32px 30px 0}.card:not(:first-child){padding-left:32px}.card:last-child{border-right:0}.card h3{margin-top:82px;font-size:31px}.card p{max-width:330px}.data{gap:14px;margin-top:50px}.panel{border-radius:24px;padding:30px;box-shadow:0 24px 70px rgba(0,0,0,.08)}.panel:not(.dark){background:linear-gradient(145deg,#f3efe6,#eae4d8)}.panel.dark{background:radial-gradient(circle at 78% 15%,rgba(145,170,159,.13),transparent 28%),#172019}.metric{border-radius:15px}.privacy{padding-top:6px}.privacy h2{max-width:600px}.note{padding-top:18px;border-top:1px solid rgba(255,255,255,.08)}.footer{padding-top:26px}
@media(prefers-reduced-motion:no-preference){.hero .shell:before,.hero-grid,.object-stage{animation:keyRise .65s cubic-bezier(.22,1,.36,1) both}.hero-grid{animation-delay:.05s}.object-stage{animation-delay:.1s}@keyframes keyRise{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}}
@media(max-width:900px){.hero .shell:before{font-size:clamp(74px,17vw,138px)}.hero-grid{grid-template-columns:1fr}.object-stage{grid-template-columns:1fr 1fr}.dock:nth-child(3){grid-column:1/-1}.cycle{grid-template-columns:1fr}.card,.card:not(:first-child){min-height:0;padding:24px 0;border-right:0;border-bottom:1px solid rgba(255,255,255,.1)}.card:last-child{border-bottom:0}.card h3{margin-top:34px}.key-rail__in{justify-content:flex-start;overflow:auto;scrollbar-width:none}.key-rail__in::-webkit-scrollbar{display:none}.key-rail a{flex:0 0 auto}}
@media(max-width:600px){.top{width:min(calc(100% - 28px),1360px);height:58px}.key-rail{top:58px;height:40px}.key-rail__in{width:100%;padding:0 14px;gap:0}.key-rail a{padding:0 15px}.hero{padding:46px 0 64px}.hero .shell:before{margin-bottom:38px;font-size:clamp(55px,18vw,72px)}.hero-grid{margin-top:28px;padding-top:20px}.hero h1{font-size:44px}.status{display:block;width:max-content;margin:10px 0 0}.actions{display:grid}.btn{width:100%;justify-content:center}.object-stage{grid-template-columns:1fr;margin-top:42px}.dock,.dock:nth-child(2),.dock:nth-child(3){grid-column:auto;min-height:240px;border-radius:21px}.core{transform:scale(.88)}.keyring .core{transform:translate(-18px,22px) scale(.88)}.section h2{font-size:43px}.panel{padding:22px}.metric strong{font-size:25px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}.hero .shell:before,.hero-grid,.object-stage{animation:none!important}.dock,.btn{transition:none!important}}
</style>`;

for(const p of pages){
  const fp=join(site,p.path);
  let html=await readFile(fp,'utf8');
  html=html.replace('<meta name="viewport" content="width=device-width,initial-scale=1">','<meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#060707"><meta name="color-scheme" content="dark"><style>html,body{background:#060707}</style>');
  html=html.replace('</head>',`${css}</head>`);
  html=html.replace('</header><main>',`</header><nav class="key-rail" aria-label="KŌMØ KEY"><div class="key-rail__in"><a href="#key">KEY</a><a href="#wear">${p.wear}</a><a href="#data">${p.data}</a><a href="#privacy">${p.privacy}</a></div></nav><main>`);
  html=html.replace('<section class="hero">','<section class="hero" id="key">');
  let count=0;
  html=html.replace(/<section class="section">/g,()=>{count++;return `<section class="section" id="${count===1?'wear':count===2?'data':'privacy'}">`});
  await writeFile(fp,html,'utf8');

  const hp=join(site,p.home);
  let home=await readFile(hp,'utf8');
  const prefetch=`<link rel="prefetch" href="${p.href}" as="document"><style id="komo-key-navigation-smooth">html{-webkit-tap-highlight-color:transparent}.home-key a{transition:transform .18s ease,filter .18s ease}.home-key a:hover{transform:translateY(-1px);filter:brightness(1.03)}.home-key a:active{transform:none}</style>`;
  if(!home.includes('komo-key-navigation-smooth'))home=home.replace('</head>',`${prefetch}</head>`);
  await writeFile(hp,home,'utf8');
}

console.log('[komo-key-polish-v2] KEY design aligned and navigation flash reduced');
