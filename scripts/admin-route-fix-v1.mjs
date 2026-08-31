import { readFile, writeFile } from 'node:fs/promises';
const path = 'pulse-app/app.js';
let src = await readFile(path, 'utf8');

if(!src.includes("route==='admin'&&state.role!=='admin'")){
  src = src.replace(
    "return['home','results','path','documents','explore','clinical','profile'].includes(route)?route:'home'",
    "if(route==='admin'&&state.role!=='admin')return'home';return['home','results','path','documents','explore','clinical','profile','admin'].includes(route)?route:'home'"
  );
}

if(!src.includes('komo:admin-route-ready')){
  const adminMount = "if(route==='admin'){els.pageEyebrow.textContent='KŌMØ · ADMIN';els.pageTitle.textContent='Console KŌMØ';if(!els.viewRoot.querySelector('[data-admin-console-v2]')&&!els.viewRoot.querySelector('[data-admin-route-mount]'))els.viewRoot.innerHTML='<div data-admin-route-mount></div>';window.dispatchEvent(new CustomEvent('komo:admin-route-ready'));return}";
  if(src.includes('function renderRoute(route){renderNavigation();')){
    src = src.replace('function renderRoute(route){renderNavigation();', `function renderRoute(route){renderNavigation();${adminMount}`);
  } else if(src.includes('function renderRoute(route){\n  renderNavigation();')){
    src = src.replace('function renderRoute(route){\n  renderNavigation();', `function renderRoute(route){\n  renderNavigation();\n  ${adminMount}`);
  } else {
    throw new Error('[admin-route-fix-v1] renderRoute anchor not found');
  }
}

await writeFile(path, src);
console.log('[admin-route-fix-v1] native admin route hardened');
