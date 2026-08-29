import {readFile,access} from 'node:fs/promises';
import {join} from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const read=name=>readFile(join(pulse,name),'utf8');
const exists=async name=>{try{await access(join(pulse,name));return true}catch{return false}};
const [html,nested,keyHub,keyData,mobile]=await Promise.all([
  read('index.html'),
  read('key-nested-navigation-v2.js'),
  read('key-hub-v1.js'),
  read('key-data-layer-v1.js'),
  read('mobile-canonical-v1.js')
]);
let dock='';if(await exists('pulse-bottom-nav-v6.js'))dock=await read('pulse-bottom-nav-v6.js');

const checks=[
  ['nested runtime is final patient navigation layer',html.includes('key-nested-navigation-v2.js?v=20260829-key-nested-v2')],
  ['home KEY preview remains available',html.includes('my-komo-key-home-v1.js')||mobile.includes('SUIVI CONNECTÉ · KŌMØ KEY')],
  ['KEY stays a dedicated canonical route',keyHub.includes("route()!=='key'")&&keyHub.includes("data-kh-go=\"key\"")],
  ['My KŌMØ / My Key switch is explicit',nested.includes('MY KŌMØ')&&nested.includes('MY KEY')&&nested.includes("data-kns-go=\"mykomo\"")&&nested.includes("data-kns-go=\"key\"")],
  ['KEY tabs are redirected to My KŌMØ rather than Home',nested.includes("my.dataset.khGo='mykomo'")],
  ['Home never gets the nested switch',nested.includes("document.querySelectorAll('[data-key-nested-switch],[data-kh-home-tabs]').forEach(x=>x.remove())")],
  ['phone primary menu no longer exposes KEY as first-level route',!mobile.includes("routeButton('key','Suivi montre · KEY','⌁')")],
  ['captured-data layer remains available from My Key',keyData.includes('CAPTURED DATA')&&keyData.includes('Importer des données')&&keyData.includes('Flux de données')],
  ['personal import remains CSV Excel JSON capable',keyData.includes('accept=\".csv,.xlsx,.xls,.json\"')],
  ['Motion Score remains separated from KEY data',keyHub.includes('Motion Score')],
  ['legacy v6 dock is six-column if present',!dock||(!dock.includes("['key','KŌMØ Key'")&&dock.includes('repeat(6,minmax(0,1fr))'))]
];
let failed=0;
for(const [label,ok] of checks){console.log(`[pulse-key-nested-navigation-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}
if(failed)throw new Error(`[pulse-key-nested-navigation-qa] ${failed} check(s) failed`);
console.log(`[pulse-key-nested-navigation-qa] ${checks.length} checks passed.`);
