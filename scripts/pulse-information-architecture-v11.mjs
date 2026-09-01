import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const dirs=[join(root,'pulse-app'),join(root,'site','pulse-v12')];

async function patch(dir,file,fn){
  const path=join(dir,file);
  let src=await readFile(path,'utf8');
  const next=fn(src);
  if(next!==src)await writeFile(path,next,'utf8');
  return next;
}

for(const dir of dirs){
  await patch(dir,'pulse-bottom-nav-v6.js',src=>{
    let js=src
      .replace("['key','KEY','◌','key']","['key','KŌMØ Connected','◌','key']")
      .replace("['trajectory','Trajectoire','⌁','trajectory']","['trajectory','Mes consultations','⌁','trajectory']");
    js=js.replace(/body\.kpulse-app-mode\.kpulse-home-mode \.main-shell\{background:[^}]+\}/,"body.kpulse-app-mode.kpulse-home-mode .main-shell{background:#f6f7f5!important}");
    return js;
  });

  await patch(dir,'adaptive-shell-v4.js',src=>src
    .replace("navItem('patient:key','KEY',I.follow,r==='key')","navItem('patient:key','Connected',I.follow,r==='key')")
    .replace("navItem('patient:trajectory','Trajectoire',I.results,r==='trajectory')","navItem('patient:trajectory','Consultations',I.results,r==='trajectory')"));

  await patch(dir,'my-komo-stable-v5.js',src=>{
    let js=src
      .replace("if(pe)pe.textContent='MY KŌMØ · LOBBY';if(pt)pt.textContent='Votre progression, en mouvement.';","if(pe)pe.textContent='MY KŌMØ';if(pt)pt.textContent='Votre KŌMØ, au même endroit.';")
      .replace('data-mkv5-route="path">Voir ma trajectoire →','data-mkv5-route="results">Voir tous mes résultats →')
      .replace('data-mkv5-route="path">Ouvrir ma trajectoire','data-mkv5-route="trajectory">Mes consultations')
      .replaceAll('data-mkv5-route="path">Voir ma trajectoire →','data-mkv5-route="trajectory">Mes consultations →')
      .replace('<div class="mkv4-kicker" style="color:rgba(255,255,255,.55)">TRAJECTOIRE</div><h3>Votre histoire continue.</h3><p>Comparez vos résultats dans le temps et voyez ce qui progresse réellement.</p>','<div class="mkv4-kicker" style="color:rgba(255,255,255,.55)">MES CONSULTATIONS</div><h3>Votre suivi continue.</h3><p>Retrouvez vos consultations, votre plan de soin et les prochaines actions décidées avec KŌMØ.</p>');
    if(!js.includes('data-myk-control')){
      const marker='<article class="mkv4-card mkv4-section"><div class="mkv4-head"><div><div class="mkv4-kicker">COLLECTION</div>';
      const cockpit='<article class="mkv4-card mkv4-section" data-myk-control><div class="mkv4-head"><div><div class="mkv4-kicker">CONTROL CENTER</div><h3>Tout contrôler depuis My KŌMØ.</h3><p>Club, résultats, consultations et rendez-vous restent accessibles depuis votre espace personnel.</p></div><span class="mkv4-count">MY KŌMØ</span></div><div class="mkv4-actions"><button class="mkv4-btn primary" data-mkv5-route="club">KŌMØ Club</button><button class="mkv4-btn" data-mkv5-route="results">Résultats</button><button class="mkv4-btn" data-mkv5-route="trajectory">Mes consultations</button><button class="mkv4-btn" data-mkv5-route="documents">Rendez-vous</button></div></article>\n ';
      js=js.replace(marker,cockpit+marker);
    }
    return js;
  });

  await patch(dir,'my-komo-stable-v4.css',src=>src
    .replace(/body\.mykomo-v5 \.main-shell\{background:[^}]+\}/,"body.mykomo-v5 .main-shell{background:#f6f7f5!important}")
    .replace(/\.mkv4-daily\{background:[^}]+\}/,".mkv4-daily{background:#fff}"));
}

const built=dirs[1];
const [dock,adaptive,myk,mycss,results,connected,consultations]=await Promise.all([
  readFile(join(built,'pulse-bottom-nav-v6.js'),'utf8'),
  readFile(join(built,'adaptive-shell-v4.js'),'utf8'),
  readFile(join(built,'my-komo-stable-v5.js'),'utf8'),
  readFile(join(built,'my-komo-stable-v4.css'),'utf8'),
  readFile(join(built,'patient-canonical-results.js'),'utf8'),
  readFile(join(built,'key-hub-v1.js'),'utf8'),
  readFile(join(built,'trajectory-v3.js'),'utf8')
]);
const checks=[
  ['desktop dock says KŌMØ Connected',dock.includes("['key','KŌMØ Connected'")],
  ['desktop dock says Mes consultations',dock.includes("['trajectory','Mes consultations'")],
  ['adaptive navigation says Connected',adaptive.includes("patient:key','Connected'")],
  ['adaptive navigation says Consultations',adaptive.includes("patient:trajectory','Consultations'")],
  ['My KŌMØ exposes Club',myk.includes('data-myk-control')&&myk.includes('data-mkv5-route="club"')],
  ['My KŌMØ routes core score to Results',myk.includes('data-mkv5-route="results">Voir tous mes résultats')],
  ['My KŌMØ outer beige removed',mycss.includes('body.mykomo-v5 .main-shell{background:#f6f7f5!important}')],
  ['Results contains Connected Motion Clinical',results.includes('KŌMØ CONNECTED')&&results.includes('KŌMØ MOTION')&&results.includes('KŌMØ CLINICAL')],
  ['Results uses green red neutral semantics',results.includes("'good'")&&results.includes("'bad'")&&results.includes("'neutral'")],
  ['Connected is single key owner',connected.includes('KŌMØ Connected.')&&connected.includes("route()!=='key'")],
  ['Consultations owns care plan',consultations.includes('PLAN DE SOIN')&&consultations.includes('Mes prochaines consultations.')],
  ['Consultations no longer owns score charts',!consultations.includes('Motion Score au fil des bilans')]
];
for(const [label,ok] of checks){console.log(`[pulse-ia-v11] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exitCode=1}
if(process.exitCode)throw new Error('Pulse information architecture v11 guard failed');
console.log('[pulse-ia-v11] PASS · Connected, Results, Mes consultations and My KŌMØ roles aligned without changing Motion V4');
