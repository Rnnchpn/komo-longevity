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
  ['multiplayer remains optional',runtime.includes("import('./world-multiplayer-v1.js')")&&runtime.includes('.catch(err=>console.warn')]
];
for(const [label,ok] of checks){
  console.log(`[komo-world-qa] ${ok?'OK':'FAIL'} · ${label}`);
  if(!ok)process.exit(1);
}

await rm(target, { recursive: true, force: true });
await mkdir(target, { recursive: true });
await cp(source, target, { recursive: true });

console.log(`[komo-world-qa] PASS · ${checks.length}/${checks.length} · canonical World copied to /site/world/`);
