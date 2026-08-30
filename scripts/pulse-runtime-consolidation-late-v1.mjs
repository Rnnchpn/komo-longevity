import{readFile,writeFile}from'node:fs/promises';
const p='site/pulse-v12/center-command-cockpit-v2.js';
let s=await readFile(p,'utf8');
const from="obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});";
const to="obs.observe(document.querySelector('#appShell'),{subtree:true,childList:true,attributes:true,attributeFilter:['class','hidden']});";
if(s.includes(from))s=s.replace(from,to);else if(!s.includes(to))throw new Error('[pulse-runtime-late] Center Command observer contract changed');
await writeFile(p,s);
if(s.includes('obs.observe(document.body'))throw new Error('[pulse-runtime-late] Center Command body observer remains');
console.log('[pulse-runtime-late] Center Command observer scoped to app shell');
