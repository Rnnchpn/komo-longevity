import { cp, mkdir, rm, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const source = join(root, 'src', 'world');
const target = join(root, 'site', 'world');

const runtime=await readFile(join(source,'world-v1.js'),'utf8');
const checks=[
  ['canonical World V1 runtime',runtime.includes("window.KomoWorld={")],
  ['render loop present',runtime.includes('renderer.render(scene,camera)')],
  ['living animation owner present',runtime.includes('function animateLiving(now)')],
  ['living animation invoked safely',runtime.includes('try{animateLiving(now)}')],
  ['retired undefined updateLiving call absent',!runtime.includes('updateLiving(now)')],
  ['multiplayer remains optional',runtime.includes("import('./world-multiplayer-v1.js')")&&runtime.includes('.catch(err=>console.warn')],
  ['true sky V1.8 present',runtime.includes('KOMO_TRUE_SKY_V18')&&runtime.includes('KOMO_CLOUD_FIELD_V18')],
  ['second floor V1.8 present',runtime.includes('KOMO_UPPER_LEVEL_V18')&&runtime.includes('KOMO_GRAND_STAIR_V18')],
  ['upper-floor navigation present',runtime.includes('syncPlayerElevation')&&runtime.includes('isUpperWalkable')],
  ['premium flooring V1.9 present',runtime.includes('KOMO_FLOORING_V19')&&runtime.includes('KOMO_EXTERIOR_FLOOR_V19')],
  ['ambient people V1.9 present',runtime.includes('KOMO_AMBIENT_PEOPLE_V19')&&runtime.includes('function updateNpc')],
  ['avatar presence V2.0 present',runtime.includes("version:'2.0.0-avatar-presence'")&&runtime.includes('function npcNameTag')],
  ['avatar LOD V2.0 present',runtime.includes('lastFarUpdate')&&runtime.includes('distToCamera')],
  ['floor polish V2.0 present',runtime.includes('V2.0 floor polish')],
  ['smooth UX V2.1 present',runtime.includes("version:'2.1.0-smooth-ux'")&&runtime.includes('function fastTravel')],
  ['adaptive performance V2.1 present',runtime.includes('function updatePerformance')&&runtime.includes('applyRenderScale')]
];
for(const [label,ok] of checks){
  console.log(`[komo-world-qa] ${ok?'OK':'FAIL'} · ${label}`);
  if(!ok)process.exit(1);
}

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

console.log(`[komo-world-qa] PASS · ${checks.length}/${checks.length} · canonical World copied to /site/world/`);
