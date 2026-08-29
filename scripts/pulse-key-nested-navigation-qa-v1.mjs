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
  ['nested runtime remains available for desktop compatibility',html.includes('key-nested-navigation-v2.js?v=20260829-key-nested-v2')],
  ['nested runtime exits immediately on phone',nested.includes("if(window.matchMedia('(max-width:767px)').matches)return;")],
  ['KEY stays a dedicated canonical route',keyHub.includes("route()!=='key'")&&keyHub.includes("data-kh-go=\"key\"")],
  ['desktop My KŌMØ / My Key switch remains explicit',nested.includes('MY KŌMØ')&&nested.includes('MY KEY')&&nested.includes("data-kns-go=\"mykomo\"")&&nested.includes("data-kns-go=\"key\"")],
  ['phone canonical menu keeps KŌMØ Key first-level',mobile.includes("routeButton('key','KŌMØ Key','K')")],
  ['phone canonical menu keeps KŌMØ Link first-level',mobile.includes("routeButton('link','KŌMØ Link','↗')")],
  ['captured-data layer remains available from KŌMØ Key',keyData.includes('CAPTURED DATA')&&keyData.includes('Importer des données')&&keyData.includes('Flux de données')],
  ['personal import remains CSV Excel JSON capable',keyData.includes('accept=\".csv,.xlsx,.xls,.json\"')],
  ['Motion Score remains separated from KEY data',keyHub.includes('Motion Score')],
  ['legacy dock does not affect canonical phone menu',!dock||dock.includes('repeat(6,minmax(0,1fr))')||!dock.includes('grid-template-columns')]
];
let failed=0;
for(const [label,ok] of checks){console.log(`[pulse-key-nested-navigation-qa] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}
if(failed)throw new Error(`[pulse-key-nested-navigation-qa] ${failed} check(s) failed`);
console.log(`[pulse-key-nested-navigation-qa] ${checks.length} checks passed.`);