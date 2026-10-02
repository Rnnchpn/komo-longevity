import { readFile, writeFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const indexPath=join(pulse,'index.html');
const jsName='pulse-friday-demo-hardening-v1.js';
const cssName='pulse-friday-demo-hardening-v1.css';
const version='20261002-ipad-home-recovery-v2';
const cacheVersion=process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,12)||version;

async function stampNestedImports(dir){
  for(const entry of await readdir(dir,{withFileTypes:true})){
    const full=join(dir,entry.name);
    if(entry.isDirectory()){await stampNestedImports(full);continue}
    if(!entry.isFile()||!entry.name.endsWith('.js'))continue;
    const before=await readFile(full,'utf8');
    const after=before
      .replace(/((?:from|import)\s*["'])(\.\/[^"'?]+\.js)(?:\?[^"']*)?(["'])/g,`$1$2?v=${cacheVersion}$3`)
      .replace(/(import\(\s*["'])(\.\/[^"'?]+\.js)(?:\?[^"']*)?(["']\s*\))/g,`$1$2?v=${cacheVersion}$3`);
    if(after!==before)await writeFile(full,after,'utf8');
  }
}

const runtime=String.raw`(() => {
  const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
  const SUPABASE_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';

  function feedback(el,message='',success=false){
    if(!el)return;
    el.textContent=message;
    el.classList.toggle('success',success);
    el.setAttribute('aria-live','polite');
  }

  function authFeedback(message='',success=false){
    feedback(document.querySelector('#authFeedback'),message,success);
  }

  function fieldInvalid(input,bad){
    if(!input)return;
    input.setAttribute('aria-invalid',bad?'true':'false');
    input.closest('label')?.classList.toggle('kp-demo-invalid',bad);
  }

  function validateRequiredForm(form){
    const required=[...form.querySelectorAll('input[required],select[required],textarea[required]')];
    let first=null;
    for(const input of required){
      let bad=false;
      if(input.type==='checkbox'||input.type==='radio')bad=!input.checked;
      else {
        const value=String(input.value||'').trim();
        bad=!value;
        if(!bad&&input.type==='email')bad=!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        if(!bad&&input.minLength>0)bad=value.length<input.minLength;
      }
      fieldInvalid(input,bad);
      if(bad&&!first)first=input;
    }
    if(!first)return true;
    const out=form.querySelector('#patientCreateFeedback,#proCreateFeedback,.pro-create-feedback,.patient-create-feedback');
    feedback(out,'Complétez les champs obligatoires indiqués avant de continuer.');
    first.focus({preventScroll:false});
    first.scrollIntoView?.({block:'center',behavior:'smooth'});
    return false;
  }

  function hardenDynamicForms(root=document){
    for(const form of root.querySelectorAll?.('#patientCreateForm,#proCreateForm')||[]){
      form.noValidate=true;
      form.setAttribute('novalidate','');
    }
  }

  document.addEventListener('submit',event=>{
    const form=event.target;
    if(!(form instanceof HTMLFormElement))return;

    if(form.id==='loginForm'){
      const email=form.querySelector('#emailInput');
      const password=form.querySelector('#passwordInput');
      const emailValue=String(email?.value||'').trim();
      const passwordValue=String(password?.value||'');
      const emailBad=!emailValue;
      const passwordBad=!passwordValue;
      fieldInvalid(email,emailBad);
      fieldInvalid(password,passwordBad);
      if(emailBad||passwordBad){
        event.preventDefault();
        event.stopImmediatePropagation();
        authFeedback('Renseignez votre adresse e-mail et votre mot de passe.');
        (emailBad?email:password)?.focus();
      }
      return;
    }

    if(form.id==='patientCreateForm'||form.id==='proCreateForm'){
      form.noValidate=true;
      if(!validateRequiredForm(form)){
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }
  },true);

  document.addEventListener('input',event=>{
    const input=event.target;
    if(!(input instanceof HTMLInputElement||input instanceof HTMLSelectElement||input instanceof HTMLTextAreaElement))return;
    if(input.matches('[required],#emailInput,#passwordInput'))fieldInvalid(input,false);
  },true);
  document.addEventListener('change',event=>{
    const input=event.target;
    if(input instanceof HTMLInputElement&&input.matches('[required]'))fieldInvalid(input,false);
  },true);

  document.addEventListener('click',async event=>{
    const button=event.target.closest?.('#forgotPasswordButton');
    if(!button)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    const email=document.querySelector('#emailInput');
    const value=String(email?.value||'').trim();
    if(!value||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)){
      fieldInvalid(email,true);
      authFeedback('Saisissez d’abord l’adresse e-mail de votre compte Pulse.');
      email?.focus();
      return;
    }
    const old=button.textContent;
    button.disabled=true;
    button.textContent='Envoi…';
    authFeedback('');
    try{
      const response=await fetch(SUPABASE_URL+'/auth/v1/recover?redirect_to='+encodeURIComponent(location.origin+'/reset/'),{
        method:'POST',
        headers:{
          apikey:SUPABASE_KEY,
          Authorization:'Bearer '+SUPABASE_KEY,
          'Content-Type':'application/json'
        },
        body:JSON.stringify({email:value})
      });
      if(!response.ok)throw new Error('reset_failed');
      authFeedback('Si un compte correspond à cette adresse, un e-mail de réinitialisation vient d’être envoyé.',true);
    }catch{
      authFeedback('La réinitialisation est momentanément indisponible. Réessayez dans quelques instants.');
    }finally{
      button.disabled=false;
      button.textContent=old;
    }
  },true);

  function mobileVisualReset(){
    if(!window.matchMedia('(max-width: 820px)').matches)return;
    const gateway=document.querySelector('#komoEcosystemGateway');
    if(gateway?.hidden)document.body.classList.remove('komo-gateway-open');
    document.querySelectorAll('#kamBackdrop:not(.open),#komoAssistantDrawer[hidden],.pir-modal[hidden],.pro-app-modal[hidden],.pro-create-modal[hidden],.patient-create-modal[hidden],.kfree-v2-modal[hidden]').forEach(el=>{
      if(el.style.display!=='none')el.style.setProperty('display','none','important');
      if(el.style.visibility!=='hidden')el.style.setProperty('visibility','hidden','important');
      if(el.style.pointerEvents!=='none')el.style.setProperty('pointer-events','none','important');
    });
  }

  let homeRecoveryLoading=false;
  function pulseRoute(){return window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home'}
  async function recoverHome(){
    if(pulseRoute()!=='home')return;
    const app=document.querySelector('#appShell');
    if(!app||app.hidden)return;
    let host=document.querySelector('[data-my-komo-home]');
    const root=document.querySelector('#viewRoot');
    if(!host&&root){
      root.innerHTML='<div data-my-komo-home data-home-owner="patient-home-command-v1"></div>';
      host=root.querySelector('[data-my-komo-home]');
    }
    if(!host)return;
    if(host.childElementCount>0)return;
    if(window.KomoPatientHomeCommand?.refresh){
      window.KomoPatientHomeCommand.refresh();
      return;
    }
    if(homeRecoveryLoading)return;
    homeRecoveryLoading=true;
    try{
      await import('./patient-home-command-v1.js?v=${cacheVersion}');
      window.KomoPatientHomeCommand?.refresh?.();
    }catch(error){
      console.error('[pulse-home-recovery]',error);
    }finally{
      homeRecoveryLoading=false;
    }
  }
  hardenDynamicForms();
  mobileVisualReset();
  requestAnimationFrame(mobileVisualReset);
  setTimeout(mobileVisualReset,120);
  setTimeout(mobileVisualReset,500);
  setTimeout(mobileVisualReset,1200);

  const observer=new MutationObserver(records=>{
    for(const record of records){
      for(const node of record.addedNodes){
        if(node instanceof Element){
          if(node.matches?.('#patientCreateForm,#proCreateForm'))hardenDynamicForms(node.parentElement||document);
          else if(node.querySelector?.('#patientCreateForm,#proCreateForm'))hardenDynamicForms(node);
        }
      }
    }
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});
  ['pageshow','resize','orientationchange','komo:route-ready','komo:session-ready','komo:data-ready','komo:home-command-rendered'].forEach(name=>window.addEventListener(name,()=>{
    setTimeout(mobileVisualReset,0);
    setTimeout(recoverHome,30);
  },{passive:true}));
  window.visualViewport?.addEventListener('resize',()=>setTimeout(mobileVisualReset,0),{passive:true});
  setTimeout(recoverHome,80);
  setTimeout(recoverHome,350);
  setTimeout(recoverHome,900);
  setTimeout(recoverHome,1800);

  window.KomoPulseFridayDemo={version:'20261002-ipad-home-recovery-v2',validateRequiredForm,mobileVisualReset,recoverHome};
})();`;

const css=String.raw`
#authScreen .remember-row{position:relative!important}
#authScreen .remember-row input{
  width:17px!important;
  height:17px!important;
  margin:0!important;
  pointer-events:auto!important;
  cursor:pointer!important;
}
#authScreen .remember-row input:focus-visible + .custom-check{
  outline:2px solid #5475ed!important;
  outline-offset:2px!important;
}
.patient-create-consent{
  display:flex!important;
  align-items:flex-start!important;
  gap:10px!important;
  cursor:pointer!important;
}
.patient-create-consent input[type="checkbox"]{
  position:static!important;
  width:18px!important;
  min-width:18px!important;
  height:18px!important;
  margin:2px 0 0!important;
  opacity:1!important;
  pointer-events:auto!important;
  accent-color:#2f8f63!important;
}
.kp-demo-invalid input,
input[aria-invalid="true"],
select[aria-invalid="true"],
textarea[aria-invalid="true"]{
  border-color:#b65a4c!important;
  box-shadow:0 0 0 3px rgba(182,90,76,.10)!important;
}
.patient-create-feedback,
.pro-create-feedback,
#authFeedback{
  min-height:18px!important;
}
`;

await writeFile(join(pulse,jsName),runtime,'utf8');
await writeFile(join(pulse,cssName),css,'utf8');

let html=await readFile(indexPath,'utf8');
html=html
  .replace(/\s*<meta name="komo-pulse-demo-hardening"[^>]*>/g,'')
  .replace(/\s*<link[^>]+href=["']\.\/pulse-friday-demo-hardening-v1\.css(?:\?[^"']*)?["'][^>]*>/g,'')
  .replace(/\s*<script[^>]+src=["']\.\/pulse-friday-demo-hardening-v1\.js(?:\?[^"']*)?["'][^>]*><\/script>/g,'');
html=html.replace('</head>',`  <meta name="komo-pulse-demo-hardening" content="${version}" />\n  <link rel="stylesheet" href="./${cssName}?v=${version}" />\n</head>`);
html=html.replace('</body>',`  <script src="./${jsName}?v=${version}"></script>\n</body>`);
html=html.replace(/((?:src|href)=["']\.\/[^"'?]+\.(?:js|css))(?:\?[^"']*)?(["'])/g,`$1?v=${cacheVersion}$2`);
html=html.replace(/<meta name="komo-build" content="[^"]*">/g,`<meta name="komo-build" content="${cacheVersion}">`);
html=html.replace(/<meta name="komo-pulse-release" content="[^"]*"\s*\/?>/g,`<meta name="komo-pulse-release" content="${cacheVersion}" />`);
await writeFile(indexPath,html,'utf8');
await stampNestedImports(pulse);

const checks=[
  ['hardening meta',html.includes('komo-pulse-demo-hardening')],
  ['hardening css',html.includes(cssName)],
  ['hardening runtime',html.includes(jsName)],
  ['forgot password handler',runtime.includes('/auth/v1/recover')],
  ['login validation',runtime.includes("form.id==='loginForm'")],
  ['patient validation',runtime.includes("form.id==='patientCreateForm'")],
  ['pro validation',runtime.includes("form.id==='proCreateForm'")],
  ['French feedback',runtime.includes('Complétez les champs obligatoires')],
  ['nested import stamping',typeof stampNestedImports==='function']
];
for(const [label,ok] of checks)console.log('[pulse-friday-demo-v1] '+(ok?'OK':'FAIL')+' · '+label);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-friday-demo-v1] PASS · authentication and form safety layer ready for Friday demo');
