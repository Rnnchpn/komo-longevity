import {copyFile,readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const root=process.cwd();
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const routerPath=join(pulse,'app-router-v2.js');
const release='20260829-safari-stable-2';

for(const file of ['mobile-safari-stability-v1.css','mobile-safari-stability-v1.js']){
  await copyFile(join(root,'pulse-app',file),join(pulse,file));
}

let router=await readFile(routerPath,'utf8');

router=router.replace(
  "async function initialize(){els.rememberInput.checked=localStorage.getItem(REMEMBER_KEY)==='1';syncClient();bindEvents();const {data:{session}}=await state.client.auth.getSession();if(session)await enterApp(session);else showAuth()}",
  "async function initialize(){const mobile=isPhoneViewport();if(mobile&&localStorage.getItem(REMEMBER_KEY)===null)localStorage.setItem(REMEMBER_KEY,'1');els.rememberInput.checked=localStorage.getItem(REMEMBER_KEY)==='1';syncClient();bindEvents();resetViewportTop();const {data:{session}}=await state.client.auth.getSession();if(session)await enterApp(session);else showAuth()}"
);
if(!router.includes('const mobile=isPhoneViewport()')) throw new Error('[pulse-mobile-safari] initialize auth persistence patch failed');

router=router.replaceAll(
  "if(remember)localStorage.setItem(REMEMBER_KEY,'1');else localStorage.removeItem(REMEMBER_KEY);syncClient();",
  "if(remember)localStorage.setItem(REMEMBER_KEY,'1');else localStorage.setItem(REMEMBER_KEY,'0');syncClient();"
);

const helperAnchor="function setAuthFeedback(message='',isSuccess=false){els.authFeedback.textContent=message;els.authFeedback.style.color=isSuccess?'#59675d':'#8b4b45'}";
if(!router.includes('function isPhoneViewport()')){
  if(!router.includes(helperAnchor)) throw new Error('[pulse-mobile-safari] auth helper anchor missing');
  const helpers=`${helperAnchor}\nfunction isPhoneViewport(){return window.matchMedia('(max-width: 767px)').matches}\nfunction resetViewportTop(){try{history.scrollRestoration='manual'}catch{}try{window.scrollTo(0,0)}catch{}try{if(document.scrollingElement)document.scrollingElement.scrollTop=0}catch{}try{els.authScreen?.scrollTo({top:0,left:0,behavior:'auto'})}catch{if(els.authScreen)els.authScreen.scrollTop=0}try{document.querySelector('.main-shell')?.scrollTo({top:0,left:0,behavior:'auto'})}catch{const m=document.querySelector('.main-shell');if(m)m.scrollTop=0}}\nfunction finishStartup(surface){document.documentElement.dataset.pulseAuthResolved='1';const boot=document.querySelector('#pulseStartup');if(boot)boot.hidden=true;if(surface==='auth')els.authScreen?.setAttribute('data-auth-resolved','1');resetViewportTop();requestAnimationFrame(resetViewportTop)}`;
  router=router.replace(helperAnchor,helpers);
}

router=router.replace(
  /function showAuth\(\)\{[^\n]*\}/,
  "function showAuth(){els.authScreen.hidden=false;els.appShell.hidden=true;window.KomoRuntime?.setContext?.(null,'member');finishStartup('auth')}"
);
if(!router.includes("finishStartup('auth')")) throw new Error('[pulse-mobile-safari] showAuth patch failed');

const enterPattern=/async function enterApp\(session\)\{[\s\S]*?\}\n\nasync function loadAppData/;
if(!enterPattern.test(router)) throw new Error('[pulse-mobile-safari] enterApp contract missing');
const enter=`async function enterApp(session){state.session=session;state.user=session?.user||null;state.profile=null;window.KomoRuntime?.setContext?.(session);if(!location.hash)history.replaceState(null,'','#home');document.body.classList.add('komo-hydrating');const mobile=isPhoneViewport();if(mobile){els.authScreen.hidden=true;els.appShell.hidden=false;renderNavigation();els.viewRoot.innerHTML='<div class="kamo-mobile-sync" aria-live="polite"><strong>KŌMØ PULSE</strong><span>Synchronisation de votre espace…</span><i aria-hidden="true"></i></div>';finishStartup('app')}let loadError=null;try{await loadAppData()}catch(error){loadError=error;console.error('[pulse-startup-data]',error)}document.body.classList.remove('komo-hydrating');renderAccount();renderNavigation();renderRoute(currentRoute());els.authScreen.hidden=true;els.appShell.hidden=false;finishStartup('app');window.dispatchEvent(new CustomEvent('komo:data-ready'));if(loadError)toast('Certaines données seront actualisées dès que la connexion sera disponible.')}\n\nasync function loadAppData`;
router=router.replace(enterPattern,enter);
if(!router.includes('Synchronisation de votre espace')) throw new Error('[pulse-mobile-safari] enterApp startup patch failed');

await writeFile(routerPath,router,'utf8');

let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<style id="pulseStartupGuard">[\s\S]*?<\/style>/g,'');
html=html.replace(/\s*<script id="pulseStartupScript">[\s\S]*?<\/script>/g,'');
html=html.replace(/\s*<div id="pulseStartup"[\s\S]*?<\/div>/g,'');
html=html.replace(/\s*<link rel="stylesheet" href="\.\/mobile-safari-stability-v1\.css(?:\?v=[^"]+)?"\s*\/?>/g,'');
html=html.replace(/\s*<script src="\.\/mobile-safari-stability-v1\.js(?:\?v=[^"]+)?"><\/script>/g,'');
html=html.replace(/\.\/app-router-v2\.js\?v=[^"]+/g,`./app-router-v2.js?v=${release}`);

const startupStyle=`  <style id="pulseStartupGuard">\n@media(max-width:767px){\n  html:not([data-pulse-auth-resolved="1"]) #authScreen,html:not([data-pulse-auth-resolved="1"]) #appShell{visibility:hidden!important;pointer-events:none!important}\n  #pulseStartup{position:fixed;inset:0;z-index:1000;display:grid;place-items:center;background:#f4f0e8;color:#263229;text-align:center}\n  #pulseStartup>div{display:grid;justify-items:center;gap:7px;transform:translateY(-3vh)}\n  #pulseStartup strong{font:600 31px/.96 Manrope,'DM Sans',sans-serif;letter-spacing:.09em}\n  #pulseStartup span{color:#778078;font:600 7.5px/1 'DM Sans',sans-serif;letter-spacing:.20em;text-transform:uppercase}\n  #pulseStartup i{width:34px;height:3px;margin-top:12px;overflow:hidden;border-radius:999px;background:rgba(38,50,41,.10)}\n  #pulseStartup i:after{content:'';display:block;width:45%;height:100%;border-radius:inherit;background:#647268;animation:pulseBoot 1s ease-in-out infinite alternate}\n  html[data-pulse-auth-resolved="1"] #pulseStartup{display:none!important}\n  @keyframes pulseBoot{from{transform:translateX(0);opacity:.5}to{transform:translateX(122%);opacity:1}}\n}\n@media(min-width:768px){#pulseStartup{display:none!important}}\n@media(prefers-reduced-motion:reduce){#pulseStartup i:after{animation:none!important;width:100%}}\n  </style>\n  <script id="pulseStartupScript">(()=>{try{history.scrollRestoration='manual';window.scrollTo(0,0)}catch{}const top=()=>{try{window.scrollTo(0,0)}catch{};try{if(document.scrollingElement)document.scrollingElement.scrollTop=0}catch{}};addEventListener('pageshow',()=>{top();setTimeout(top,40);setTimeout(top,160)},{passive:true});setTimeout(()=>{if(!document.documentElement.dataset.pulseAuthResolved)document.documentElement.dataset.pulseAuthResolved='1'},8000)})();</script>\n`;
html=html.replace('</head>',startupStyle+`  <link rel="stylesheet" href="./mobile-safari-stability-v1.css?v=${release}" />\n</head>`);
html=html.replace('<body>',`<body>\n  <div id="pulseStartup" aria-hidden="true"><div><strong>KŌMØ PULSE</strong><span>Longevity in motion.</span><i></i></div></div>`);
html=html.replace('</body>',`  <script src="./mobile-safari-stability-v1.js?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

console.log('[pulse-mobile-safari-stability-v1] Safari auth flash removed, persistent session hardened, BFCache stale-page reload enabled');
