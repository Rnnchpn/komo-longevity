import {copyFile,readFile,writeFile,access} from 'node:fs/promises';
import {join} from 'node:path';

const root=process.cwd();
const pulse=join(root,'site','pulse-v12');
const htmlPath=join(pulse,'index.html');
const release='20260829-key-nested-v2';
const exists=async p=>{try{await access(p);return true}catch{return false}};

await copyFile(join(root,'pulse-app','key-nested-navigation-v2.js'),join(pulse,'key-nested-navigation-v2.js'));

// KEY remains a canonical route, but is intentionally not a primary navigation item.
// Patch optional legacy/future dock owners in generated output so a 6-item shell stays geometrically correct.
const dockPath=join(pulse,'pulse-bottom-nav-v6.js');
if(await exists(dockPath)){
  let dock=await readFile(dockPath,'utf8');
  dock=dock.replace("  ['key','KŌMØ Key','⌁','key',''],\n",'');
  dock=dock.replace("grid-template-columns:repeat(7,minmax(0,1fr))","grid-template-columns:repeat(6,minmax(0,1fr))");
  dock=dock.replace("route()==='key'?'key':route()==='club'?'club'","route()==='key'?'mykomo':route()==='club'?'club'");
  await writeFile(dockPath,dock,'utf8');
}

// The phone menu also treats KEY as a child of My KŌMØ rather than a first-level destination.
const mobilePath=join(pulse,'mobile-canonical-v1.js');
if(await exists(mobilePath)){
  let mobile=await readFile(mobilePath,'utf8');
  mobile=mobile.replace("${routeButton('key','Suivi montre · KEY','⌁')}",'');
  await writeFile(mobilePath,mobile,'utf8');
}

let html=await readFile(htmlPath,'utf8');
html=html.replace(/\s*<script src="\.\/key-nested-navigation-v2\.js(?:\?v=[^"]+)?"><\/script>/g,'');
html=html.replace('</body>',`  <script src="./key-nested-navigation-v2.js?v=${release}"></script>\n</body>`);
await writeFile(htmlPath,html,'utf8');

console.log('[pulse-key-nested-navigation-v2] KEY nested under My KŌMØ · Home preview retained · My KŌMØ / My Key switch shipped');
