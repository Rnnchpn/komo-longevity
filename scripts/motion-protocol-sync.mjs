// Génère la copie serveur du protocole KŌMØ Motion à partir de la source unique
// pulse-v14-src/motion-protocol.mjs.
//   node scripts/motion-protocol-sync.mjs          → écrit supabase/functions/motion-live-test/protocol.ts
//   node scripts/motion-protocol-sync.mjs --check  → échoue si la copie serveur diverge (utilisé par le build)
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root=process.cwd();
const source=join(root,'pulse-v14-src','motion-protocol.mjs');
const target=join(root,'supabase','functions','motion-live-test','protocol.ts');
const {serverSpec,PROTOCOL,STEPS}=await import(pathToFileURL(source).href);

const body='// GÉNÉRÉ par scripts/motion-protocol-sync.mjs depuis pulse-v14-src/motion-protocol.mjs.\n'+
 '// Ne pas modifier à la main : éditer la source puis relancer le script.\n'+
 'export const SPEC:any='+JSON.stringify(serverSpec(),null,1)+';\n';

if(process.argv.includes('--check')){
 let current='';
 try{current=await readFile(target,'utf8')}catch{}
 if(current!==body){
  console.error('[motion-protocol] la copie serveur diverge de la source : lancer node scripts/motion-protocol-sync.mjs');
  process.exit(1);
 }
 if(STEPS.length!==14)throw new Error("[motion-protocol] 14 étapes attendues");
 console.log('[motion-protocol] PASS '+PROTOCOL.code+' '+PROTOCOL.version+' · serveur synchronisé · '+STEPS.length+' étapes');
}else{
 await writeFile(target,body);
 console.log('[motion-protocol] protocol.ts écrit ('+PROTOCOL.code+' '+PROTOCOL.version+')');
}
