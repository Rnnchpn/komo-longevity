import { readFile, writeFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=dirname(dirname(fileURLToPath(import.meta.url)));const site=join(root,'site');
const cfg=[
 {dir:join(site,'assets','media'),motion:'/fr/motion/',label:'Voir comment KŌMØ mesure le mouvement ↗'},
 {dir:join(site,'en','media'),motion:'/motion/',label:'See how KŌMØ measures movement ↗'},
 {dir:join(site,'es','media'),motion:'/es/motion/',label:'Ver cómo KŌMØ mide el movimiento ↗'}
];
async function walk(dir,out=[]){let entries;try{entries=await readdir(dir,{withFileTypes:true})}catch{return out}for(const e of entries){const p=join(dir,e.name);if(e.isDirectory())await walk(p,out);else if(e.isFile()&&e.name==='index.html')out.push(p)}return out}
const style=`<style id="media-product-bridge-style">.footerread .footerin{flex-wrap:wrap}.media-motion-link{font-size:10px;font-weight:800;text-decoration:none;border-bottom:1px solid currentColor;padding-bottom:3px;color:var(--ink)}@media(max-width:640px){.media-motion-link{display:inline-flex;margin-top:2px}}</style>`;
for(const c of cfg){for(const f of await walk(c.dir)){let h=await readFile(f,'utf8');if(!h.includes('class="footerread"'))continue;h=h.replace(/<style id="media-product-bridge-style">[\s\S]*?<\/style>/g,'');if(!h.includes('class="media-motion-link"'))h=h.replace(/(<section class="footerread"[\s\S]*?<div class="footerin">[\s\S]*?)(<\/div><\/section>)/,`$1<a class="media-motion-link" href="${c.motion}">${c.label}</a>$2`);h=h.replace('</head>',`${style}</head>`);await writeFile(f,h,'utf8')}}
console.log('[media-product-bridge-v1] article-to-Motion pathways added');
