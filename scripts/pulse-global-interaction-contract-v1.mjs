import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const files=await readdir(target);
const jsFiles=files.filter(x=>x.endsWith('.js'));
const htmlFiles=files.filter(x=>x.endsWith('.html'));
const sources=[];
for(const file of [...jsFiles,...htmlFiles]){
  sources.push({file,text:await readFile(join(target,file),'utf8')});
}
const combined=sources.map(x=>`\n/* ${x.file} */\n${x.text}`).join('\n');
const failures=[];
const warnings=[];
const ok=(label,value)=>{if(!value)failures.push(label);else console.log(`[pulse-interactions-v1] OK · ${label}`)};

const canonicalRoutes=new Set([
  'home','results','path','documents','explore','clinical','profile','motion','mykomo','club','key','trajectory','messages','admin'
]);
const routeAttrs=['data-route','data-kp6-route','data-kh-go','data-kmv3-route','data-ag4-route','data-mkv5-route'];
const routeTargets=[];
for(const {file,text} of sources){
  for(const attr of routeAttrs){
    const re=new RegExp(`${attr}=["']([^"']+)["']`,'g');
    for(const m of text.matchAll(re)){
      const value=m[1];
      if(value.includes('${')||value.includes('{{'))continue;
      routeTargets.push({file,attr,value});
    }
  }
}
const badRoutes=routeTargets.filter(x=>!canonicalRoutes.has(x.value)&&x.value!=='tests');
if(badRoutes.length)failures.push(...badRoutes.map(x=>`unknown route ${x.attr}=${x.value} in ${x.file}`));
ok('all literal navigation targets resolve to canonical routes',badRoutes.length===0);
ok('legacy tests target is normalized by RC1',!routeTargets.some(x=>x.value==='tests')||combined.includes("target==='tests'?'results'"));

function camel(attr){return attr.replace(/^data-/,'').replace(/-([a-z0-9])/g,(_,c)=>c.toUpperCase())}
function handlerEvidence(attr){
  const c=camel(attr);
  const escaped=attr.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const selector=new RegExp(`(?:closest|matches|querySelector|querySelectorAll)\\(\\s*['\"][^'\"]*\\[${escaped}(?:[=\\]\\s])`);
  const getter=new RegExp(`getAttribute\\(\\s*['\"]${escaped}['\"]`);
  const dataset=new RegExp(`dataset\\.${c}\\b|dataset\\[['\"]${c}['\"]\\]`);
  return selector.test(combined)||getter.test(combined)||dataset.test(combined);
}

const nonActionData=new Set([
  'data-khf','data-khf-home-final','data-khf-version','data-kcanon-home','data-kcanon-account','data-kcanon-doc',
  'data-admin-panel','data-profile-v2','data-account-privacy-v1','data-admin-privacy-queue-v1',
  'data-ag4-section','data-status','data-value','data-score','data-id','data-type','data-kind','data-state','data-index',
  'data-center-id','data-patient-id','data-assessment-id','data-report-id','data-request-id','data-user-id','data-open','data-active'
]);

const buttons=[];
for(const {file,text} of sources){
  for(const m of text.matchAll(/<button\b([^>]*)>/gi)){
    const attrs=m[1]||'';
    if(/\bdisabled(?:\s|=|$)/i.test(attrs))continue;
    const data=[...attrs.matchAll(/\b(data-[a-z0-9_-]+)(?:\s*=|\s|$)/gi)].map(x=>x[1].toLowerCase());
    const id=attrs.match(/\bid=["']([^"']+)["']/i)?.[1]||'';
    const type=attrs.match(/\btype=["']([^"']+)["']/i)?.[1]?.toLowerCase()||'';
    const inline=/\bonclick\s*=/i.test(attrs);
    const label=(attrs.match(/\baria-label=["']([^"']+)["']/i)?.[1]||'').slice(0,80);
    buttons.push({file,data,id,type,inline,label,raw:attrs.slice(0,220)});
  }
}

const actionAttrs=new Map();
for(const b of buttons){
  for(const attr of b.data){
    if(nonActionData.has(attr))continue;
    if(!actionAttrs.has(attr))actionAttrs.set(attr,new Set());
    actionAttrs.get(attr).add(b.file);
  }
}
const orphanAttrs=[];
for(const [attr,owners] of actionAttrs){
  if(routeAttrs.includes(attr))continue;
  if(!handlerEvidence(attr))orphanAttrs.push({attr,owners:[...owners]});
}
if(orphanAttrs.length)failures.push(...orphanAttrs.map(x=>`button action ${x.attr} has no handler evidence (${x.owners.join(', ')})`));
ok('every literal button data-action has handler evidence',orphanAttrs.length===0);

const knownIds=new Set([
  'refreshButton','accountButton','logoutButton','loginButton','signupButton','forgotPasswordButton','togglePassword',
  'kpvChangeEmail','kpvResetPassword','k2twRefresh'
]);
function idEvidence(id){
  const esc=id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return new RegExp(`(?:getElementById\\(\\s*['\"]${esc}['\"]|querySelector(?:All)?\\(\\s*['\"]#${esc}[^'\"]*['\"])`).test(combined);
}
const ownerless=[];
for(const b of buttons){
  if(b.inline||b.type==='submit')continue;
  if(b.data.some(a=>routeAttrs.includes(a)||(!nonActionData.has(a)&&handlerEvidence(a))))continue;
  if(b.id&&(knownIds.has(b.id)||idEvidence(b.id)))continue;
  // Purely presentational/state data does not count as an interaction contract.
  const actionable=b.data.filter(a=>!nonActionData.has(a));
  if(actionable.length)continue;
  ownerless.push(b);
}
// Ownerless literal buttons are suspicious, but some legacy templates bind by class.
// Fail only when there is no class-selector evidence either; otherwise report as warning.
const hardOwnerless=[];
for(const b of ownerless){
  const classes=(b.raw.match(/\bclass=["']([^"']+)["']/i)?.[1]||'').split(/\s+/).filter(Boolean);
  const classHandled=classes.some(cls=>{
    const esc=cls.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
    return new RegExp(`(?:closest|matches|querySelector|querySelectorAll)\\(\\s*['\"][^'\"]*\\.${esc}(?:[^a-zA-Z0-9_-]|$)`).test(combined);
  });
  if(classHandled)warnings.push(`class-bound button in ${b.file}: ${classes.join('.')}`);
  else hardOwnerless.push(b);
}
if(hardOwnerless.length)failures.push(...hardOwnerless.slice(0,30).map(b=>`literal button has no interaction owner in ${b.file}: ${b.id||b.label||b.raw}`));
ok('all literal non-submit buttons have an interaction owner',hardOwnerless.length===0);

// Primary route owners must exist and be loaded by the final HTML.
const index=await readFile(join(target,'index.html'),'utf8');
const requiredOwners={
  home:'patient-home-command-v1.js',
  results:'patient-canonical-results.js',
  motion:'motion-hub-v3.js',
  key:'key-hub-v1.js',
  trajectory:'trajectory-v3.js',
  documents:'agenda-hub-v4.js',
  profile:'profile-v2.js',
  messages:'care-messaging-v2.js',
  admin:'admin-console-v2.js',
  clinical:'clinical-cockpit-v1.js'
};
for(const [route,asset] of Object.entries(requiredOwners)){
  try{await access(join(target,asset));ok(`${route} owner exists: ${asset}`,true)}catch{failures.push(`${route} owner missing: ${asset}`)}
  ok(`${route} owner is loaded`,index.includes(`./${asset}`));
}

// RC1 runtime diagnostics must understand current privacy interactions so console warnings remain meaningful.
const rc1=await readFile(join(target,'pulse-functional-rc1.js'),'utf8');
for(const attr of ['data-kap-submit','data-kap-cancel','data-kap-withdraw','data-kap-download','data-admin-privacy-tab','data-kapq-review','data-kapq-generate-export','data-kapq-execute-closure','data-kapq-decline']){
  ok(`runtime button diagnostics recognize ${attr}`,rc1.includes(`'${attr}'`));
}

if(warnings.length)console.log(`[pulse-interactions-v1] INFO · ${warnings.length} class-bound literal buttons recognized by selector ownership`);
if(failures.length){console.error(`[pulse-interactions-v1] FAILED · ${failures.join(' | ')}`);process.exit(1)}
console.log(`[pulse-interactions-v1] PASS · ${buttons.length} literal buttons · ${actionAttrs.size} action attributes · ${routeTargets.length} route targets · primary owners locked`);
