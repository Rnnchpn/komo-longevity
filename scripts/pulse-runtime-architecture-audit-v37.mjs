import{readFile,readdir}from'node:fs/promises';
import{dirname,join}from'node:path';
import{fileURLToPath}from'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const manifest=JSON.parse(await readFile(join(root,'scripts','pulse-runtime-architecture-v37.json'),'utf8'));
const html=await readFile(join(target,'index.html'),'utf8');
const jsFiles=(await readdir(target,{withFileTypes:true})).filter(x=>x.isFile()&&x.name.endsWith('.js')).map(x=>x.name);
const text=new Map();for(const file of jsFiles)text.set(file,await readFile(join(target,file),'utf8'));
const direct=[...html.matchAll(/<script[^>]+src=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*><\/script>/g)].map(x=>x[1]);
const reachable=new Set(),queue=[];for(const file of direct)if(text.has(file)&&!reachable.has(file)){reachable.add(file);queue.push(file)}
while(queue.length){const file=queue.shift(),src=text.get(file)||'';for(const m of src.matchAll(/(?:from\s*|import\s*)["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']|import\s*\(\s*["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']\s*\)/g)){const dep=m[1]||m[2];if(text.has(dep)&&!reachable.has(dep)){reachable.add(dep);queue.push(dep)}}}

const reEsc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
function viewWrites(src){
 const aliases=new Set(),selector=String.raw`(?:document\.)?(?:querySelector\(\s*['"]#viewRoot['"]\s*\)|getElementById\(\s*['"]viewRoot['"]\s*\))`;
 for(const m of src.matchAll(new RegExp(String.raw`\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*${selector}`,'g')))aliases.add(m[1]);
 for(const m of src.matchAll(new RegExp(String.raw`\b([A-Za-z_$][\w$]*)\s*=\s*(?:document\.)?querySelector\([^;\n)]*\)\s*\|\|\s*${selector}`,'g')))aliases.add(m[1]);
 let count=0;for(const alias of aliases){const a=reEsc(alias);count+=(src.match(new RegExp(String.raw`\b${a}\.(?:innerHTML|outerHTML|textContent|innerText)\s*(?:\+?=)|\b${a}\.(?:replaceChildren|replaceWith|remove|appendChild|append|prepend|insertBefore|insertAdjacentElement|insertAdjacentHTML|insertAdjacentText|before|after)\s*\(`,'g'))||[]).length}
 count+=(src.match(new RegExp(String.raw`${selector}\s*\.(?:innerHTML|outerHTML|textContent|innerText)\s*(?:\+?=)|${selector}\s*\.(?:replaceChildren|replaceWith|remove|appendChild|append|prepend|insertBefore|insertAdjacentElement|insertAdjacentHTML|insertAdjacentText|before|after)\s*\(`,'g'))||[]).length;
 return count;
}
const routeWrites=src=>(src.match(/location\.hash\s*=|history\.(?:pushState|replaceState)\s*\(/g)||[]).length;

const roles=new Map(),owners=[];
function addRole(file,role,surface){if(!roles.has(file))roles.set(file,[]);roles.get(file).push({role,surface});if(role==='owner')owners.push(file)}
for(const [surface,cfg]of Object.entries(manifest.surfaces)){
 addRole(cfg.owner,'owner',surface);
 for(const file of cfg.controllers||[])addRole(file,'controller',surface);
 for(const file of cfg.extensions||[])addRole(file,'extension',surface);
}
for(const file of manifest.global_controllers||[])addRole(file,'controller','global');

const failures=[];
for(const [surface,cfg]of Object.entries(manifest.surfaces)){
 if(!reachable.has(cfg.owner))failures.push(`${surface}: owner ${cfg.owner} is not reachable`);
 for(const file of [...(cfg.controllers||[]),...(cfg.extensions||[])])if(!reachable.has(file))failures.push(`${surface}: declared ${file} is not reachable`);
}
for(const file of manifest.global_controllers||[])if(!reachable.has(file))failures.push(`global controller ${file} is not reachable`);
const duplicateOwners=owners.filter((x,i)=>owners.indexOf(x)!==i);if(duplicateOwners.length)failures.push(`owner reused across surfaces: ${[...new Set(duplicateOwners)].join(', ')}`);

const extensionFiles=[...roles.entries()].filter(([,r])=>r.some(x=>x.role==='extension')).map(([f])=>f);
for(const file of extensionFiles){const src=text.get(file)||'';const rw=routeWrites(src),vw=viewWrites(src);if(rw||vw)failures.push(`extension ${file} is structural (route=${rw}, view=${vw})`)}

const structural=[...reachable].filter(file=>{const src=text.get(file)||'';return routeWrites(src)>0||viewWrites(src)>0}).sort();
const unclassified=structural.filter(file=>!roles.has(file));
if(unclassified.length)failures.push(`unclassified structural modules: ${unclassified.join(', ')}`);

console.log(`[pulse-architecture-v37] manifest=${manifest.version} · surfaces=${Object.keys(manifest.surfaces).length} · structural=${structural.length} · classified=${structural.length-unclassified.length}`);
for(const [surface,cfg]of Object.entries(manifest.surfaces))console.log(`[pulse-architecture-v37] ${surface} · owner=${cfg.owner} · controllers=${(cfg.controllers||[]).join(', ')||'none'} · extensions=${(cfg.extensions||[]).join(', ')||'none'}`);
console.log('[pulse-architecture-v37] presentation extensions',extensionFiles.join(', ')||'none');
console.log('[pulse-architecture-v37] unclassified structural',unclassified.join(', ')||'none');
const report={version:manifest.version,surfaces:manifest.surfaces,global_controllers:manifest.global_controllers||[],structural_modules:structural,unclassified_structural:unclassified,presentation_extensions:extensionFiles};
console.log('[pulse-architecture-v37] REPORT_JSON '+JSON.stringify(report));
if(failures.length){console.error('[pulse-architecture-v37] FAILED · '+failures.join(' | '));process.exit(1)}
console.log('[pulse-architecture-v37] PASS · render owners, controllers and presentation extensions are explicitly frozen for redesign');
