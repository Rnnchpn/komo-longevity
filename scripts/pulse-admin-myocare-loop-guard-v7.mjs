import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const targets=[join(root,'site','pulse-v12')];

async function patchDir(pulse){
  const adminPath=join(pulse,'admin-console-v2.js');
  const myoPath=join(pulse,'admin-myocare-v1.js');
  const shortcutPath=join(pulse,'admin-shortcut-v1.js');
  let admin=await readFile(adminPath,'utf8');
  let myo=await readFile(myoPath,'utf8');
  let shortcut=await readFile(shortcutPath,'utf8');

  if(!admin.includes("function announceAdminRendered()")){
    admin=admin.replace(
      "function setHeading(){const e=document.querySelector('#pageEyebrow'),t=document.querySelector('#pageTitle');if(e)e.textContent='KŌMØ · ADMIN';if(t)t.textContent='Console KŌMØ'}",
      "function setHeading(){const e=document.querySelector('#pageEyebrow'),t=document.querySelector('#pageTitle');if(e)e.textContent='KŌMØ · ADMIN';if(t)t.textContent='Console KŌMØ'}\nfunction announceAdminRendered(){queueMicrotask(()=>window.dispatchEvent(new CustomEvent('komo:admin-rendered')))}"
    );
  }

  if(!admin.includes("announceAdminRendered()")) throw new Error('Unable to install Admin render announcer');
  if(!admin.includes(";announceAdminRendered()}")){
    const marker="</div></div>`}";
    if(!admin.includes(marker)) throw new Error('Unable to locate canonical Admin render tail');
    admin=admin.replace(marker,"</div></div>`;announceAdminRendered()}");
  }

  const oldObserve="function kmcObserve(){kmcStyles();const o=new MutationObserver(()=>kmcMountTab());o.observe(document.body,{subtree:true,childList:true});document.addEventListener('click',kmcResetOnNativeTab,true);window.addEventListener('hashchange',()=>{if(location.hash!=='#admin')K.active=false;setTimeout(kmcMountTab,80)});window.addEventListener('komo:admin-open',()=>setTimeout(kmcMountTab,100));setTimeout(kmcMountTab,700)}";
  const newObserve="function kmcObserve(){kmcStyles();document.addEventListener('click',kmcResetOnNativeTab,true);window.addEventListener('hashchange',()=>{if(location.hash!=='#admin')K.active=false;else requestAnimationFrame(kmcMountTab)});window.addEventListener('komo:admin-open',()=>requestAnimationFrame(kmcMountTab));window.addEventListener('komo:admin-rendered',()=>requestAnimationFrame(kmcMountTab));document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(kmcMountTab));requestAnimationFrame(kmcMountTab)}";
  if(myo.includes(oldObserve)) myo=myo.replace(oldObserve,newObserve);

  const oldBadge="const n=K.data?.summary?.acts_month??0;b.querySelector('b').textContent=String(n);b.classList.toggle('active',K.active);if(K.active)kmcRender()";
  const newBadge="const n=String(K.data?.summary?.acts_month??0),badge=b.querySelector('b');if(badge&&badge.textContent!==n)badge.textContent=n;b.classList.toggle('active',K.active);if(K.active)kmcRender()";
  if(myo.includes(oldBadge)) myo=myo.replace(oldBadge,newBadge);

  shortcut=shortcut.replace(/admin-myocare-v1\.js\?v=[^'\"]+/g,'admin-myocare-v1.js?v=20260901-loopfree-v8');

  const checks=[
    ['no body-wide MyoCare observer',!myo.includes("observe(document.body")],
    ['no MyoCare MutationObserver constructor',!myo.includes('new MutationObserver')],
    ['MyoCare listens to explicit Admin render event',myo.includes("komo:admin-rendered")],
    ['MyoCare mounts once on load',myo.includes('requestAnimationFrame(kmcMountTab)')],
    ['MyoCare tab badge updates only on value change',myo.includes('badge.textContent!==n')],
    ['Admin announces completed render',admin.includes("komo:admin-rendered")&&admin.includes('announceAdminRendered()')],
    ['MyoCare dynamic import cache-busted',shortcut.includes('admin-myocare-v1.js?v=20260901-loopfree-v8')],
    ['old MyoCare dynamic cache key removed',!shortcut.includes('admin-myocare-v1.js?v=20260831-myocare-v1')]
  ];
  for(const [label,ok] of checks){console.log(`[pulse-admin-myocare-loop-v8] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)process.exitCode=1}
  if(process.exitCode)throw new Error('Admin MyoCare loop/cache guard failed');

  await writeFile(adminPath,admin,'utf8');
  await writeFile(myoPath,myo,'utf8');
  await writeFile(shortcutPath,shortcut,'utf8');
}

for(const pulse of targets)await patchDir(pulse);
console.log('[pulse-admin-myocare-loop-v8] PASS · MyoCare is event-driven, loop-free and loaded through a fresh immutable cache key');
