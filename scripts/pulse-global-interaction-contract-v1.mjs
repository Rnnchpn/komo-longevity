import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=dirname(dirname(fileURLToPath(import.meta.url)));
const target=join(root,'site','pulse-v12');
const entries=await readdir(target,{withFileTypes:true});
const rootFiles=entries.filter(x=>x.isFile()).map(x=>x.name);
const htmlFiles=rootFiles.filter(x=>x.endsWith('.html'));
const jsFiles=rootFiles.filter(x=>x.endsWith('.js'));
const textByFile=new Map();
for(const file of [...htmlFiles,...jsFiles])textByFile.set(file,await readFile(join(target,file),'utf8'));

// Audit only code that is actually reachable from a shipped HTML surface. Dormant
// historical bundles can stay in the build output during consolidation without
// creating false interaction failures.
const reachable=new Set();
const queue=[];
for(const file of htmlFiles){
  const text=textByFile.get(file)||'';
  for(const m of text.matchAll(/<script[^>]+src=["']\.\/([^"'?#]+)(?:[?#][^"']*)?["'][^>]*><\/script>/g)){
    if(textByFile.has(m[1])&&!reachable.has(m[1])){reachable.add(m[1]);queue.push(m[1])}
  }
}
while(queue.length){
  const file=queue.shift();
  const text=textByFile.get(file)||'';
  const deps=[];
  for(const m of text.matchAll(/(?:from\s*|import\s*)["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']/g))deps.push(m[1]);
  for(const m of text.matchAll(/import\s*\(\s*["']\.\/([^"'?#]+)(?:[?#][^"']*)?["']\s*\)/g))deps.push(m[1]);
  for(const dep of deps){if(textByFile.has(dep)&&!reachable.has(dep)){reachable.add(dep);queue.push(dep)}}
}
const sources=[...htmlFiles.map(file=>({file,text:textByFile.get(file)||''})),...[...reachable].map(file=>({file,text:textByFile.get(file)||''}))];
const combined=sources.map(x=>`\n/* ${x.file} */\n${x.text}`).join('\n');
const failures=[];
const warnings=[];
const ok=(label,value)=>{if(!value)failures.push(label);else console.log(`[pulse-interactions-v1] OK · ${label}`)};

const canonicalRoutes=new Set(['home','results','documents','clinical','profile','motion','mykomo','club','key','trajectory','plan','messages','admin','explore']);
const aliases=new Map([['path','trajectory'],['followup','key'],['agenda','documents'],['rdv','documents'],['tests','results']]);
const allowedRoutes=new Set([...canonicalRoutes,...aliases.keys()]);
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
const badRoutes=routeTargets.filter(x=>!allowedRoutes.has(x.value));
if(badRoutes.length)failures.push(...badRoutes.map(x=>`unknown route ${x.attr}=${x.value} in ${x.file}`));
ok('all reachable literal navigation targets resolve to canonical routes or declared aliases',badRoutes.length===0);
const navCore=textByFile.get('patient-navigation-core-v1.js')||'';
for(const [alias,targetRoute] of aliases){
  if(routeTargets.some(x=>x.value===alias))ok(`legacy route ${alias} converges to ${targetRoute}`,navCore.includes(`${alias}:'${targetRoute}'`));
}
ok('canonical route plan is owned by KŌMØ Therapy',routeTargets.some(x=>x.value==='plan')&&(textByFile.get('patient-v4.js')||'').includes('data-therapy-page'));

function camel(attr){return attr.replace(/^data-/,'').replace(/-([a-z0-9])/g,(_,c)=>c.toUpperCase())}
function handlerEvidence(attr){
  const c=camel(attr);
  const escaped=attr.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const call='(?:closest|matches|querySelector|querySelectorAll)(?:\\?\\.)?';
  const selector=new RegExp(`${call}\\(\\s*['\"][^'\"]*\\[${escaped}(?:[=\\]\\s])`);
  const getter=new RegExp(`getAttribute(?:\\?\\.)?\\(\\s*['\"]${escaped}['\"]`);
  const dataset=new RegExp(`dataset(?:\\?\\.)?\\.${c}\\b|dataset\\[['\"]${c}['\"]\\]`);
  const templateSelector=[
    `querySelector(\`[${attr}`,`querySelectorAll(\`[${attr}`,`closest(\`[${attr}`,`closest?.(\`[${attr}`,`matches(\`[${attr}`,`matches?.(\`[${attr}`
  ].some(x=>combined.includes(x));
  return selector.test(combined)||getter.test(combined)||dataset.test(combined)||templateSelector;
}

const nonActionData=new Set([
  'data-khf','data-khf-home-final','data-khf-version','data-kcanon-home','data-kcanon-account','data-kcanon-doc',
  'data-admin-panel','data-profile-v2','data-account-privacy-v1','data-admin-privacy-queue-v1',
  'data-ag4-section','data-status','data-value','data-score','data-id','data-type','data-kind','data-state','data-index',
  'data-center-id','data-patient-id','data-assessment-id','data-report-id','data-request-id','data-user-id','data-open','data-active',
  'data-kbook-appointment','data-kbook-status','data-kapq-type'
]);
const actionWord=/(?:route|action|open|close|save|refresh|download|submit|cancel|select|slot|filter|near|service|challenge|withdraw|accept|decline|approve|release|review|validate|generate|execute|tab|nav|go|next|prev|toggle|finish|draft|message|import|book|popup)$/;

const buttons=[];
for(const {file,text} of sources){
  for(const m of text.matchAll(/<button\b([^>]*)>/gi)){
    const attrs=m[1]||'';
    if(attrs.includes('${')&&/data-[^\s=>]*\$\{/.test(attrs)){warnings.push(`dynamic button contract in ${file}`);continue}
    if(/\bdisabled(?:\s|=|$)/i.test(attrs))continue;
    const data=[...attrs.matchAll(/\b(data-[a-z0-9_-]+)(?:\s*=|\s|$)/gi)].map(x=>x[1].toLowerCase());
    const id=attrs.match(/\bid=["']([^"']+)["']/i)?.[1]||'';
    const type=attrs.match(/\btype=["']([^"']+)["']/i)?.[1]?.toLowerCase()||'';
    const inline=/\bonclick\s*=/i.test(attrs);
    const label=(attrs.match(/\baria-label=["']([^"']+)["']/i)?.[1]||'').slice(0,80);
    const value=attrs.match(/\bvalue=["']([^"']+)["']/i)?.[1]||'';
    buttons.push({file,data,id,type,inline,label,value,raw:attrs.slice(0,240)});
  }
}

const actionAttrs=new Map();
for(const b of buttons){
  for(const attr of b.data){
    if(nonActionData.has(attr)||routeAttrs.includes(attr))continue;
    if(!actionAttrs.has(attr))actionAttrs.set(attr,new Set());
    actionAttrs.get(attr).add(b.file);
  }
}
const orphanAttrs=[];
for(const [attr,owners] of actionAttrs){
  const semantic=attr.replace(/^data-/,'').split('-').at(-1)||'';
  if(actionWord.test(semantic)&&!handlerEvidence(attr))orphanAttrs.push({attr,owners:[...owners]});
}
if(orphanAttrs.length)failures.push(...orphanAttrs.map(x=>`reachable button action ${x.attr} has no handler evidence (${x.owners.join(', ')})`));
ok('every reachable semantic button action has handler evidence',orphanAttrs.length===0);

const knownIds=new Set(['refreshButton','accountButton','logoutButton','loginButton','signupButton','forgotPasswordButton','togglePassword','kpvChangeEmail','kpvResetPassword','k2twRefresh']);
function idEvidence(id){
  const esc=id.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return new RegExp(`(?:getElementById|querySelector|querySelectorAll)(?:\\?\\.)?\\(\\s*['\"](?:#)?${esc}(?:[^'\"]*)['\"]`).test(combined);
}
function classEvidence(cls){
  const esc=cls.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  return new RegExp(`(?:closest|matches|querySelector|querySelectorAll)(?:\\?\\.)?\\(\\s*['\"][^'\"]*\\.${esc}(?:[^a-zA-Z0-9_-]|$)`).test(combined);
}
function delegatedButtonEvidence(file){
  const text=textByFile.get(file)||'';
  return /querySelectorAll(?:\?\.)?\(\s*['"`][^'"`]*button[^'"`]*['"`]\s*\)/.test(text)&&/addEventListener\(\s*['"]click['"]/.test(text);
}
const hardOwnerless=[];
for(const b of buttons){
  if(b.inline||b.type==='submit'||(!b.type&&b.value))continue;
  if(b.data.some(a=>routeAttrs.includes(a)||handlerEvidence(a)))continue;
  if(b.id&&(knownIds.has(b.id)||idEvidence(b.id)))continue;
  const classes=(b.raw.match(/\bclass=["']([^"']+)["']/i)?.[1]||'').split(/\s+/).filter(Boolean);
  if(classes.some(classEvidence)||delegatedButtonEvidence(b.file)){warnings.push(`delegated/class-bound button in ${b.file}`);continue}
  if(b.data.length&&!b.data.some(a=>actionWord.test((a.replace(/^data-/,'').split('-').at(-1)||''))))continue;
  hardOwnerless.push(b);
}
if(hardOwnerless.length)failures.push(...hardOwnerless.slice(0,30).map(b=>`reachable literal button has no interaction owner in ${b.file}: ${b.id||b.label||b.raw}`));
ok('all reachable literal non-submit buttons have an interaction owner',hardOwnerless.length===0);

const index=await readFile(join(target,'index.html'),'utf8');
const requiredOwners={home:'patient-home-command-v1.js',results:'patient-canonical-results.js',motion:'motion-hub-v3.js',key:'key-hub-v1.js',trajectory:'trajectory-v3.js',therapy:'patient-v4.js',documents:'agenda-hub-v4.js',profile:'profile-v2.js',messages:'care-messaging-v2.js',admin:'admin-console-v2.js',clinical:'clinical-cockpit-v1.js'};
for(const [routeName,asset] of Object.entries(requiredOwners)){
  try{await access(join(target,asset));ok(`${routeName} owner exists: ${asset}`,true)}catch{failures.push(`${routeName} owner missing: ${asset}`)}
  ok(`${routeName} owner is loaded`,index.includes(`./${asset}`));
}

const rc1=await readFile(join(target,'pulse-functional-rc1.js'),'utf8');
for(const attr of ['data-kap-submit','data-kap-cancel','data-kap-withdraw','data-kap-download','data-admin-privacy-tab','data-kapq-review','data-kapq-generate-export','data-kapq-execute-closure','data-kapq-decline'])ok(`runtime button diagnostics recognize ${attr}`,rc1.includes(`'${attr}'`));

if(warnings.length)console.log(`[pulse-interactions-v1] INFO · ${warnings.length} dynamic/delegated/class/payload contracts intentionally resolved outside literal selector scan`);
if(failures.length){console.error(`[pulse-interactions-v1] FAILED · ${failures.join(' | ')}`);process.exit(1)}
console.log(`[pulse-interactions-v1] PASS · ${reachable.size}/${jsFiles.length} reachable JS modules · ${buttons.length} literal buttons · ${actionAttrs.size} semantic action attributes · ${routeTargets.length} route targets · primary owners locked`);
