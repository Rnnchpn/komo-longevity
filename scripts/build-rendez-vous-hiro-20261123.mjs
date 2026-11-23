import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
// Page publique de réservation KŌMØ Motion à la Clinique HIRO (fonction serveur booking-public).
const root=dirname(dirname(fileURLToPath(import.meta.url)));
const html=await readFile(join(root,'src/pages/rendez-vous-hiro.html'),'utf8');
const required=['id="bookForm"','functions/v1/booking-public',"CENTER='hiro'",'name="website"','name="consent"','#gerer=','/fr/privacy/','Corriger la trajectoire'];
const missing=required.filter(x=>!html.includes(x));
if(missing.length)throw Error('rendez-vous HIRO incomplet : '+missing.join(', '));
if(/Motion Age|Motion Score/i.test(html))throw Error('allégation retirée présente sur la page HIRO');
const folder=join(root,'site/fr/rendez-vous-hiro');
await mkdir(folder,{recursive:true});
await writeFile(join(folder,'index.html'),html,'utf8');
// Liens courts : bio Instagram (source suivie) et supports imprimés.
const alias=(dest)=>`<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="robots" content="noindex,follow"><meta http-equiv="refresh" content="0;url=${dest}"><link rel="canonical" href="https://komolongevity.com/fr/rendez-vous-hiro/"><title>KŌMØ Motion · Clinique HIRO</title></head><body><a href="${dest}">KŌMØ Motion · Clinique HIRO</a><script>location.replace(${JSON.stringify(dest)})</script></body></html>`;
for(const [path,dest] of [['hiro','/fr/rendez-vous-hiro/?src=instagram'],['rdv','/fr/rendez-vous-hiro/']]){
  await mkdir(join(root,'site',path),{recursive:true});
  await writeFile(join(root,'site',path,'index.html'),alias(dest),'utf8');
}
console.log('[rendez-vous-hiro] page de réservation et liens courts /hiro, /rdv construits');
