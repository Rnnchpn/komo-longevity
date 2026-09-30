import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const indexPath=join(pulse,'index.html');
const jsName='pulse-friday-demo-hardening-v1.js';
const cssName='pulse-friday-demo-hardening-v1.css';
const version='20260930-friday-demo-v1';
const cacheVersion=process.env.VERCEL_GIT_COMMIT_SHA?.slice(0,12)||version;

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
        if(!bad&&input.type==='email')bad=!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);
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
      const emailBad=!emailValue||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(emailValue);
      const passwordBad=!passwordValue;
      fieldInvalid(email,emailBad);
      fieldInvalid(password,passwordBad);
      if(emailBad||passwordBad){
        event.preventDefault();
        event.stopImmediatePropagation();
        authFeedback(emailBad&&!passwordBad?'Vérifiez votre adresse e-mail.':'Renseignez votre adresse e-mail et votre mot de passe.');
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
    if(!value||!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)){
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

  hardenDynamicForms();
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

  window.KomoPulseFridayDemo={version:'20260930-v1',validateRequiredForm};
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
await writeFile(indexPath,html,'utf8');

const checks=[
  ['hardening meta',html.includes('komo-pulse-demo-hardening')],
  ['hardening css',html.includes(cssName)],
  ['hardening runtime',html.includes(jsName)],
  ['forgot password handler',runtime.includes('/auth/v1/recover')],
  ['login validation',runtime.includes("form.id==='loginForm'")],
  ['patient validation',runtime.includes("form.id==='patientCreateForm'")],
  ['pro validation',runtime.includes("form.id==='proCreateForm'")],
  ['French feedback',runtime.includes('Complétez les champs obligatoires')]
];
for(const [label,ok] of checks)console.log('[pulse-friday-demo-v1] '+(ok?'OK':'FAIL')+' · '+label);
if(checks.some(([,ok])=>!ok))process.exit(1);
console.log('[pulse-friday-demo-v1] PASS · authentication and form safety layer ready for Friday demo');
