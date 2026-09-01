import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const pulse=join(root,'pulse-app');
const adminPath=join(pulse,'admin-console-v2.js');
const myoPath=join(pulse,'admin-myocare-v1.js');

let admin=await readFile(adminPath,'utf8');
let myo=await readFile(myoPath,'utf8');

if(!admin.includes("window.dispatchEvent(new CustomEvent('komo:admin-rendered'))")){
  admin=admin.replace(
    "if(location.hash!=='#admin')return;const h=root();if(!h)return;setHeading();",
    "if(location.hash!=='#admin')return;const h=root();if(!h)return;setHeading();"
  );
  admin=admin.replace(
    "h.innerHTML=`<div class=\"kav2\" data-admin-console-v2>",
    "h.innerHTML=`<div class=\"kav2\" data-admin-console-v2>"
  );
  admin=admin.replace(
    "</div></div>`}",
    "</div></div>`;queueMicrotask(()=>window.dispatchEvent(new CustomEvent('komo:admin-rendered')))}"
  );
}

myo=myo.replace(
  "function kmcObserve(){kmcStyles();const o=new MutationObserver(()=>kmcMountTab());o.observe(document.body,{subtree:true,childList:true});document.addEventListener('click',kmcResetOnNativeTab,true);window.addEventListener('hashchange',()=>{if(location.hash!=='#admin')K.active=false;setTimeout(kmcMountTab,80)});window.addEventListener('komo:admin-open',()=>setTimeout(kmcMountTab,100));setTimeout(kmcMountTab,700)}",
  "function kmcObserve(){kmcStyles();document.addEventListener('click',kmcResetOnNativeTab,true);window.addEventListener('hashchange',()=>{if(location.hash!=='#admin')K.active=false;else requestAnimationFrame(kmcMountTab)});window.addEventListener('komo:admin-open',()=>requestAnimationFrame(kmcMountTab));window.addEventListener('komo:admin-rendered',()=>requestAnimationFrame(kmcMountTab));document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(kmcMountTab))}"
);

myo=myo.replace(
  "const n=K.data?.summary?.acts_month??0;b.querySelector('b').textContent=String(n);b.classList.toggle('active',K.active);if(K.active)kmcRender()",
  "const n=String(K.data?.summary?.acts_month??0),badge=b.querySelector('b');if(badge&&badge.textContent!==n)badge.textContent=n;b.classList.toggle('active',K.active);if(K.active)kmcRender()"
);

const checks=[
  ['no body-wide MyoCare observer',!myo.includes("observe(document.body")],
  ['MyoCare listens to explicit Admin render event',myo.includes("komo:admin-rendered")],
  ['MyoCare tab badge updates only on value change',myo.includes("badge.textContent!==n")],
  ['Admin announces completed render',admin.includes("komo:admin-rendered")]
];
for(const [label,ok] of checks){console.log(`[pulse-admin-myocare-loop-v7] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exitCode=1}
if(process.exitCode)throw new Error('Admin MyoCare loop guard failed');
await writeFile(adminPath,admin,'utf8');
await writeFile(myoPath,myo,'utf8');
console.log('[pulse-admin-myocare-loop-v7] PASS · MyoCare is event-driven and cannot self-trigger a body MutationObserver loop');
