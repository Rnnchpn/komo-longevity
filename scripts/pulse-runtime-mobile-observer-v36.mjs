import{readFile,writeFile}from'node:fs/promises';

const path='site/pulse-v12/mobile-runtime-v3.js';
let source=await readFile(path,'utf8');
const before=(source.match(/new\s+MutationObserver\s*\(/g)||[]).length;
if(before!==5)throw new Error(`[pulse-mobile-v36] expected 5 bundled mobile observers, found ${before}`);

const utility=`viewObserver = new MutationObserver(refresh);\n  viewObserver.observe(root,{childList:true,subtree:true});`;
const utilityReplacement=`viewObserver={shared:true};window.addEventListener('komo:mobile-dom-change',refresh);`;
if(!source.includes(utility))throw new Error('[pulse-mobile-v36] mobile utility observer contract changed');
source=source.replace(utility,utilityReplacement);

const guided=`viewObserver=new MutationObserver(refresh);\n    viewObserver.observe(root,{childList:true,subtree:true});`;
const guidedReplacement=`viewObserver={shared:true};window.addEventListener('komo:mobile-dom-change',refresh);`;
if(!source.includes(guided))throw new Error('[pulse-mobile-v36] guided mobile observer contract changed');
source=source.replace(guided,guidedReplacement);

const verticalStart=source.indexOf('  function bindObservers(){');
const verticalEnd=source.indexOf('\n  function onRoute(){',verticalStart);
if(verticalStart<0||verticalEnd<verticalStart)throw new Error('[pulse-mobile-v36] vertical observer block contract changed');
const vertical=`  function bindObservers(){if(appObserver)return;window.addEventListener('komo:mobile-dom-change',()=>schedule(24));appObserver={shared:true};viewObserver=appObserver;authObserver=appObserver;}\n`;
source=source.slice(0,verticalStart)+vertical+source.slice(verticalEnd+1);

const dispatcher=`(()=>{let o;function b(){const a=document.querySelector('#appShell');if(!a||o)return;o=new MutationObserver(ms=>{if(ms.some(m=>m.type==='childList'||m.target===a))dispatchEvent(new CustomEvent('komo:mobile-dom-change'))});o.observe(a,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']})}document.addEventListener('DOMContentLoaded',b,{once:true});['komo:session-ready','komo:session-cleared','pageshow'].forEach(n=>addEventListener(n,b));b()})();\n`;
source=dispatcher+source;

const after=(source.match(/new\s+MutationObserver\s*\(/g)||[]).length;
if(after!==1)throw new Error(`[pulse-mobile-v36] expected one shared mobile observer, found ${after}`);
for(const signature of ['mobile-test-cta','mobileSurface','kamo-phone-app','komo:mobile-dom-change'])if(!source.includes(signature))throw new Error(`[pulse-mobile-v36] mobile behavior missing: ${signature}`);
await writeFile(path,source,'utf8');
console.log('[pulse-mobile-v36] five bundled mobile observers consolidated into one shared app-shell observer');
