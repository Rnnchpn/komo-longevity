import fs from 'node:fs';
import path from 'node:path';

const root=process.cwd();
const pulse=path.join(root,'site','pulse-v12');
const htmlPath=path.join(pulse,'index.html');
const appPath=path.join(pulse,'app.js');
const bundleName='pulse-ui-v1.css';
const bundlePath=path.join(pulse,bundleName);

if(!fs.existsSync(htmlPath)||!fs.existsSync(appPath)){
  console.error('[pulse-speed] Pulse build is missing');
  process.exit(1);
}

let html=fs.readFileSync(htmlPath,'utf8');
const cssPattern=/\s*<link rel="stylesheet" href="\.\/([^"?]+\.css)"\s*\/>/g;
const cssFiles=[];
for(const match of html.matchAll(cssPattern))cssFiles.push(match[1]);
const uniqueCss=[...new Set(cssFiles)];
if(uniqueCss.length<10){
  console.error(`[pulse-speed] expected many Pulse stylesheets, found ${uniqueCss.length}`);
  process.exit(1);
}

let bundle='/* KŌMØ Pulse UI bundle · generated at build time · source order preserved */\n';
for(const file of uniqueCss){
  const src=path.join(pulse,file);
  if(!fs.existsSync(src)){
    console.error(`[pulse-speed] missing stylesheet ${file}`);
    process.exit(1);
  }
  bundle+=`\n/* FILE: ${file} */\n${fs.readFileSync(src,'utf8')}\n`;
}

bundle+=`\n/* Navigation responsiveness */\n.nav-item,.mobile-nav button,.pro-nav-item,.kcp-tab,.mode-switch button,[data-route],[data-pro-nav]{touch-action:manipulation;-webkit-tap-highlight-color:transparent}\n.nav-item,.pro-nav-item,.kcp-tab,.mode-switch button{transition-duration:.14s}\nbody.komo-hydrating #refreshButton{opacity:.42!important;pointer-events:none}\n@media(max-width:820px){.mobile-nav{transform:translateZ(0);backface-visibility:hidden}.main-shell{overscroll-behavior-y:contain}}\n`;
fs.writeFileSync(bundlePath,bundle);

html=html.replace(cssPattern,'');
const fontAnchor='<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Manrope:wght@400;500;600&display=swap" rel="stylesheet">';
const delivery=`\n  <link rel="preconnect" href="https://esm.sh" crossorigin>\n  <link rel="preconnect" href="https://uqlolefsiktbznnymriy.supabase.co" crossorigin>\n  <link rel="stylesheet" href="./${bundleName}" fetchpriority="high" />`;
if(html.includes(fontAnchor))html=html.replace(fontAnchor,fontAnchor+delivery);
else html=html.replace('</head>',delivery+'\n</head>');
fs.writeFileSync(htmlPath,html);

let app=fs.readFileSync(appPath,'utf8');
const oldEnter="async function enterApp(session){state.session=session;state.user=session?.user||null;els.authScreen.hidden=true;els.appShell.hidden=false;await loadAppData();renderAccount();renderNavigation();if(!location.hash)location.hash='home';renderRoute(currentRoute())}";
const newEnter="async function enterApp(session){state.session=session;state.user=session?.user||null;state.profile=null;els.authScreen.hidden=true;els.appShell.hidden=false;if(!location.hash)history.replaceState(null,'','#home');const fullLoad=loadAppData();const identityReady=new Promise(resolve=>{const started=performance.now();const tick=()=>{if(state.profile!==null||performance.now()-started>900){resolve();return}setTimeout(tick,16)};tick()});await Promise.race([fullLoad,identityReady]);renderAccount();renderNavigation();renderRoute(currentRoute());if(state.loading)document.body.classList.add('komo-hydrating');await fullLoad;document.body.classList.remove('komo-hydrating');renderAccount();renderNavigation();renderRoute(currentRoute());window.dispatchEvent(new CustomEvent('komo:data-ready'))}";
if(app.includes(oldEnter))app=app.replace(oldEnter,newEnter);
else if(!app.includes("window.dispatchEvent(new CustomEvent('komo:data-ready'))")){
  console.error('[pulse-speed] enterApp contract changed; refusing unsafe patch');
  process.exit(1);
}
fs.writeFileSync(appPath,app);

console.log(`[pulse-speed] ${uniqueCss.length} stylesheets bundled into 1; identity-first app shell enabled`);
