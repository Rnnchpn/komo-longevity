(() => {
  const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
  const SUPABASE_KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
  const REMEMBER_KEY='komo_pulse_remember';
  const AUTH_KEY='sb-uqlolefsiktbznnymriy-auth-token';
  let running=false;

  function feedback(message='',success=false){
    const el=document.querySelector('#authFeedback');
    if(!el)return;
    el.textContent=message;
    el.style.color=success?'#59675d':'#8b4b45';
  }
  function buttonState(busy){
    const btn=document.querySelector('#loginButton');
    if(!btn)return;
    btn.disabled=busy;
    const label=btn.querySelector('span:first-child');
    if(label)label.textContent=busy?'Connexion…':'Se connecter';
  }
  function clearStoredSessions(){
    try{localStorage.removeItem(AUTH_KEY)}catch{}
    try{sessionStorage.removeItem(AUTH_KEY)}catch{}
  }
  function targetStorage(remember){return remember?localStorage:sessionStorage}

  async function canonicalLogin(event){
    const form=event.target;
    if(!(form instanceof HTMLFormElement)||form.id!=='loginForm')return;
    event.preventDefault();
    event.stopImmediatePropagation();
    if(running)return;

    const email=document.querySelector('#emailInput')?.value?.trim()||'';
    const password=document.querySelector('#passwordInput')?.value||'';
    const remember=!!document.querySelector('#rememberInput')?.checked;
    if(!email||!password){feedback('Renseignez votre adresse e-mail et votre mot de passe.');return}

    running=true;buttonState(true);feedback('');
    if(remember)localStorage.setItem(REMEMBER_KEY,'1');else localStorage.removeItem(REMEMBER_KEY);
    clearStoredSessions();

    try{
      const response=await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`,{
        method:'POST',
        headers:{
          apikey:SUPABASE_KEY,
          Authorization:`Bearer ${SUPABASE_KEY}`,
          'Content-Type':'application/json'
        },
        body:JSON.stringify({email,password})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok){
        const message=data?.error_description||data?.msg||data?.message||data?.error||`Erreur de connexion (${response.status})`;
        throw new Error(message);
      }
      const expiresAt=data.expires_at||Math.floor(Date.now()/1000)+Number(data.expires_in||3600);
      const session={...data,expires_at:expiresAt};
      targetStorage(remember).setItem(AUTH_KEY,JSON.stringify(session));
      feedback('Connexion réussie…',true);
      window.dispatchEvent(new CustomEvent('komo:session-ready',{detail:{source:'canonical-login'}}));
      setTimeout(()=>location.reload(),90);
    }catch(error){
      const raw=String(error?.message||error||'Connexion impossible.');
      const msg=/invalid login credentials/i.test(raw)?'Adresse e-mail ou mot de passe incorrect.':raw;
      feedback(msg);
      running=false;buttonState(false);
    }
  }

  document.addEventListener('submit',canonicalLogin,true);
  window.KomoCanonicalLogin={version:'1',authKey:AUTH_KEY};
})();
