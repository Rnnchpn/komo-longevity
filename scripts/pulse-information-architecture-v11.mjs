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
      .replace("['home','Accueil','⌂','home']","['home','Home','⌂','home']")
      .replace("['key','KEY','◌','key']","['key','Connected','◌','key']")
      .replace("['key','KŌMØ Connected','◌','key']","['key','Connected','◌','key']")
      .replace("  ['trajectory','Trajectoire','⌁','trajectory'],\n",'')
      .replace("  ['trajectory','Mes consultations','⌁','trajectory'],\n",'')
      .replace("['agenda','Rendez-vous','□','documents']","['agenda','Consultations & rendez-vous','□','documents']")
      .replace('grid-template-columns:repeat(6,minmax(0,1fr))','grid-template-columns:repeat(5,minmax(0,1fr))')
      .replace("if(['trajectory','path','plan'].includes(r))return'trajectory';","if(['trajectory','path','plan'].includes(r))return'agenda';")
      .replace("if(['trajectory','path','plan'].includes(r))return'mykomo';","if(['trajectory','path','plan'].includes(r))return'agenda';");
    js=js.replace(/const items=\[[\s\S]*?\n\];/,`const items=[
  ['home','Home','⌂','home'],
  ['results','Résultats','◎','results'],
  ['key','Connected','◌','key'],
  ['agenda','Consultations & rendez-vous','□','documents'],
  ['mykomo','My KŌMØ','◉','mykomo']
];`);
    js=js.replace(/body\.kpulse-app-mode\.kpulse-home-mode \.main-shell\{background:[^}]+\}/,"body.kpulse-app-mode.kpulse-home-mode .main-shell{background:#050706!important}");
    return js;
  });

  await patch(dir,'adaptive-shell-v4.js',src=>{
    let js=src;
    if(!js.includes("mykomo:'<svg")){
      js=js.replace("    center:'<svg", "    mykomo:'<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\"><circle cx=\"12\" cy=\"8\" r=\"3.2\"/><path d=\"M5.5 20c.6-4 2.7-6 6.5-6s5.9 2 6.5 6\"/></svg>',\n    center:'<svg");
    }
    js=js.replace(
      /const r=route\(\);\s*return navItem\('patient:home'[\s\S]*?navItem\('more','Plus',I\.more,false\);/,
      "const r=route();\n    return navItem('patient:home','Home',I.home,r==='home')+navItem('patient:results','Résultats',I.results,r==='results')+navItem('patient:key','Connected',I.follow,r==='key')+navItem('patient:documents','Consultations & rendez-vous',I.agenda,r==='documents')+navItem('patient:mykomo','My KŌMØ',I.mykomo,r==='mykomo');"
    );
    js=js.replace(
      "primary=actionButton('Rendez-vous','patient:documents')+actionButton('My KŌMØ','patient:mykomo')+actionButton('Messages','patient:messages');",
      "primary=actionButton('Consultations & rendez-vous','patient:documents')+actionButton('My KŌMØ','patient:mykomo');"
    );
    js=js.replace(
      "primary=actionButton('Agenda et réseau','patient:documents')+actionButton('My KŌMØ','patient:mykomo')+actionButton('Messages','patient:messages');",
      "primary=actionButton('Consultations & rendez-vous','patient:documents')+actionButton('My KŌMØ','patient:mykomo');"
    );
    const patientBottomGuard="if(mode()==='patient'){document.querySelector('#kamBottomBar')?.remove();return;}";
    if(!js.includes(patientBottomGuard)){
      js=js.replace(
        "  function ensureBottom(){\n    const app=document.querySelector('#appShell');if(!app)return;",
        `  function ensureBottom(){\n    ${patientBottomGuard}\n    const app=document.querySelector('#appShell');if(!app)return;`
      );
    }
    return js;
  });

  await patch(dir,'my-komo-stable-v5.js',src=>{
    let js=src
      .replace("if(pe)pe.textContent='MY KŌMØ · LOBBY';if(pt)pt.textContent='Votre progression, en mouvement.';","if(pe)pe.textContent='MY KŌMØ';if(pt)pt.textContent='Votre KŌMØ, au même endroit.';")
      .replace(/data-mkv5-route="(?:path|trajectory)">Voir ma trajectoire →/,'data-mkv5-route="results">Voir tous mes résultats →')
      .replace(/data-mkv5-route="(?:path|trajectory)">Ouvrir ma trajectoire/,'data-mkv5-route="documents">Consultations & rendez-vous')
      .replaceAll('data-mkv5-route="trajectory">Voir ma trajectoire →','data-mkv5-route="documents">Consultations & rendez-vous →')
      .replaceAll('data-mkv5-route="path">Voir ma trajectoire →','data-mkv5-route="documents">Consultations & rendez-vous →')
      .replaceAll('data-mkv5-route="trajectory">Mes consultations →','data-mkv5-route="documents">Consultations & rendez-vous →')
      .replaceAll('data-mkv5-route="trajectory">Mes consultations','data-mkv5-route="documents">Consultations & rendez-vous')
      .replace('<div class="mkv4-kicker" style="color:rgba(255,255,255,.55)">TRAJECTOIRE</div><h3>Votre histoire continue.</h3><p>Comparez vos résultats dans le temps et voyez ce qui progresse réellement.</p>','<div class="mkv4-kicker" style="color:rgba(255,255,255,.55)">CONSULTATIONS</div><h3>Votre suivi continue.</h3><p>Retrouvez vos consultations, vos rendez-vous et les prochaines actions décidées avec KŌMØ.</p>');
    if(!js.includes('data-myk-control')){
      const marker='<article class="mkv4-card mkv4-section"><div class="mkv4-head"><div><div class="mkv4-kicker">COLLECTION</div>';
      const cockpit='<article class="mkv4-card mkv4-section" data-myk-control><div class="mkv4-head"><div><div class="mkv4-kicker">CONTROL CENTER</div><h3>Tout contrôler depuis My KŌMØ.</h3><p>Club, résultats, consultations et rendez-vous restent accessibles depuis votre espace personnel.</p></div><span class="mkv4-count">MY KŌMØ</span></div><div class="mkv4-actions"><button class="mkv4-btn primary" data-mkv5-route="club">KŌMØ Club</button><button class="mkv4-btn" data-mkv5-route="results">Résultats</button><button class="mkv4-btn" data-mkv5-route="documents">Consultations & rendez-vous</button></div></article>\n ';
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
const exactDock=`const items=[
  ['home','Home','⌂','home'],
  ['results','Résultats','◎','results'],
  ['key','Connected','◌','key'],
  ['agenda','Consultations & rendez-vous','□','documents'],
  ['mykomo','My KŌMØ','◉','mykomo']
];`;
const exactAdaptive="navItem('patient:home','Home',I.home,r==='home')+navItem('patient:results','Résultats',I.results,r==='results')+navItem('patient:key','Connected',I.follow,r==='key')+navItem('patient:documents','Consultations & rendez-vous',I.agenda,r==='documents')+navItem('patient:mykomo','My KŌMØ',I.mykomo,r==='mykomo')";
const patientBottomGuard="if(mode()==='patient'){document.querySelector('#kamBottomBar')?.remove();return;}";
const checks=[
  ['desktop dock has exactly five patient destinations',(dock.match(/^\s*\['(?:home|key|results|agenda|mykomo)'/gm)||[]).length===5],
  ['desktop dock exact approved order',dock.includes(exactDock)],
  ['desktop dock routes trajectory aliases into Consultations',dock.includes("if(['trajectory','path','plan'].includes(r))return'agenda';")],
  ['adaptive navigation exact approved order',adaptive.includes(exactAdaptive)&&!adaptive.includes("navItem('patient:trajectory'")],
  ['adaptive shell does not create a patient bottom bar',adaptive.includes(patientBottomGuard)],
  ['patient Messages removed from adaptive primary menu',!adaptive.includes("actionButton('Messages','patient:messages')")],
  ['My KŌMØ exposes Club',myk.includes('data-myk-control')&&myk.includes('data-mkv5-route="club"')],
  ['My KŌMØ routes core score to Results',myk.includes('data-mkv5-route="results">Voir tous mes résultats')],
  ['My KŌMØ has one consultations destination',myk.includes('data-mkv5-route="documents">Consultations & rendez-vous')&&!myk.includes('data-mkv5-route="trajectory">Mes consultations')],
  ['My KŌMØ outer beige removed',mycss.includes('body.mykomo-v5 .main-shell{background:#f6f7f5!important}')],
  ['Results contains Motion KEY Clinical',results.includes('KŌMØ MOTION')&&results.includes('KEY · QUOTIDIEN')&&results.includes('CLINICAL')],
  ['Results states questionnaires do not modify Motion Score',results.includes('GLFS‑25')&&results.includes('sans modifier le score')],
  ['Results uses green red neutral semantics',results.includes("'good'")&&results.includes("'bad'")&&results.includes("'neutral'")],
  ['Connected is single key owner',connected.includes('KŌMØ Connected.')&&connected.includes("route()!=='key'")],
  ['Consultations owns care plan',consultations.includes('PLAN DE SOIN')&&consultations.includes('Mes prochaines consultations.')],
  ['Consultations no longer owns score charts',!consultations.includes('Motion Score au fil des bilans')]
];
for(const [label,ok] of checks){console.log(`[pulse-ia-v11] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exitCode=1}
if(process.exitCode)throw new Error('Pulse information architecture v11 guard failed');
console.log('[pulse-ia-v11] PASS · exact five-item patient navigation frozen across desktop, iPad and mobile');
