import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root=process.cwd();
const pages=[
  ['en','site/check/index.html','/medical-information/','Medical information'],
  ['fr','site/fr/check/index.html','/fr/medical-information/','Informations médicales'],
  ['es','site/es/check/index.html','/es/medical-information/','Información médica']
];
for(const [locale,path,href,label] of pages){
  let html=await readFile(join(root,path),'utf8');
  if(!html.includes('medical-information')){
    html=html.replace(' · <a href="'+(locale==='en'?'/contact/':`/${locale}/contact/`)+'">Contact</a></span>',` · <a href="${href}">${label}</a> · <a href="${locale==='en'?'/contact/':`/${locale}/contact/`}">Contact</a></span>`);
    await writeFile(join(root,path),html,'utf8');
  }
}
console.log('[check-v2-legal-link] medical information links added');
