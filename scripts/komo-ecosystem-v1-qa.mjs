import {readFile,access} from 'node:fs/promises';
import {join} from 'node:path';

const root=process.cwd();
const files={
  home:join(root,'site','home','ecosystem-home-v1.js'),
  app:join(root,'site','app','ecosystem-home-v1.js'),
  world:join(root,'site','world','world-one-v1.js'),
  worldHtml:join(root,'site','world','index.html'),
  life:join(root,'site','life','life-os-v1.js'),
  card:join(root,'site','card','card-v1.js'),
  pulse:join(root,'site','pulse-v12','pulse-ecosystem-home-v1.js')
};
for(const path of Object.values(files))await access(path);

const code={};
for(const [k,p] of Object.entries(files))code[k]=await readFile(p,'utf8');

const failures=[];
const checks=[];
const pass=(label,ok)=>{checks.push([label,ok]);if(!ok)failures.push(label)};

pass('home and /app share one ecosystem owner',code.home===code.app);
pass('home planet has lightweight interactive motion',code.home.includes('initPlanetMotion')&&code.home.includes('--ry')&&code.home.includes('requestAnimationFrame'));
pass('home module transitions are explicit',code.home.includes('exitTo')&&code.home.includes('osTransition'));
const homeCss=await readFile(join(root,'site','home','ecosystem-home-v1.css'),'utf8');
pass('home respects reduced motion',homeCss.includes('prefers-reduced-motion:reduce')&&homeCss.includes('animation:none!important'));
pass('home planet remains CSS/GPU not Three.js',!code.home.includes('three')&&!code.home.includes('WebGLRenderer'));
pass('world remains map-first',code.world.includes("new maplibregl.Map")&&code.worldHtml.includes('WHY KŌMØ'));
pass('life uses shared KŌMØ identity',code.life.includes("from '/world/komo-world-auth-v1.js"));
pass('life checkout is order-request only',code.life.includes('No payment is collected')&&code.life.includes('life_create_order_v1'));
pass('card exposes future NFC abstraction',code.card.includes('verifyCardTap')&&code.card.includes('KomoCardNfc'));
pass('pulse uses canonical clinical result runtime',code.pulse.includes("from './canonical-result-runtime.js"));

const nonClinical=['home','app','world','life','card'];
const forbidden=[
  "from('clinical_context')","from(\"clinical_context\")",
  "from('measurements')","from(\"measurements\")",
  "from('scores')","from(\"scores\")",
  "from('komo_reports')","from(\"komo_reports\")",
  'komo_professional_patient_dossier','komo_result_snapshot'
];
for(const surface of nonClinical){
  pass(surface+' does not query raw Pulse clinical stores',forbidden.every(token=>!code[surface].includes(token)));
}
pass('home does not recreate password auth',!code.home.includes('signInWithPassword')&&!code.home.includes('type="password"'));
pass('life does not recreate password auth',!code.life.includes('signInWithPassword')&&!code.life.includes('type="password"'));
pass('World / Life / Card use one KŌMØ auth bridge',
  code.home.includes('komo-world-auth-v1.js')&&code.world.includes('komo-world-auth-v1.js')&&code.life.includes('komo-world-auth-v1.js')&&code.card.includes('komo-world-auth-v1.js')
);

for(const [label,ok] of checks)console.log('[ecosystem-v1-qa] '+(ok?'PASS':'FAIL')+' · '+label);
if(failures.length){
  console.error('[ecosystem-v1-qa] blocking failures: '+failures.join(' | '));
  process.exit(1);
}
console.log('[ecosystem-v1-qa] PASS · connected OS boundaries locked');
