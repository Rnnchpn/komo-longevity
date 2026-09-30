const ENTRY_SPACE_KEY='komo_entry_space_v1';
const POST_AUTH_KEY='komo_post_auth_route_v1';
const LEGACY_GATEWAY_SEEN='komo_gateway_seen_session_v1';

function q(sel,root=document){return root.querySelector(sel)}
function authVisible(){const a=q('#authScreen'),s=q('#appShell');return Boolean(a&&!a.hidden&&(!s||s.hidden))}
function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}

function ensureSignupFields(){
  const form=q('#loginForm'); if(!form||q('#kentrySignupFields'))return;
  const options=q('.auth-options',form);
  const wrap=document.createElement('div');
  wrap.id='kentrySignupFields';
  wrap.className='kentry-signup-fields';
  wrap.innerHTML=`
    <div class="kentry-signup-grid">
      <label><span>Prénom</span><input id="signupFirstName" name="signup_first_name" autocomplete="given-name" placeholder="Prénom"></label>
      <label><span>Nom</span><input id="signupLastName" name="signup_last_name" autocomplete="family-name" placeholder="Nom"></label>
    </div>
    <label><span>Date de naissance</span><input id="signupBirthDate" name="signup_birth_date" type="date" autocomplete="bday"></label>
    <label><span>Téléphone <small>optionnel</small></span><input id="signupPhone" name="signup_phone" type="tel" autocomplete="tel" placeholder="+33 …"></label>
    <p class="kentry-form-note">Ces informations créent votre profil KŌMØ et permettent d'ouvrir la réservation. Vos données cliniques restent dans Pulse.</p>`;
  form.insertBefore(wrap,options||null);
}

function ensurePulseChoice(){
  const panel=q('.auth-panel'); if(!panel||q('#kentryPulseChoice'))return;
  ensureSignupFields();
  const chooser=document.createElement('section');
  chooser.id='kentryPulseChoice';
  chooser.className='kentry-pulse-choice';
  chooser.innerHTML=`
    <div class="kentry-mini-brand"><span>KŌMØ</span><small>PULSE</small></div>
    <p class="kentry-eyebrow">VOTRE ESPACE PERSONNEL</p>
    <h2>Que souhaitez-vous faire&nbsp;?</h2>
    <p class="kentry-choice-copy">Pulse vous permet de prendre rendez-vous, préparer vos tests, retrouver vos résultats et suivre votre trajectoire KŌMØ.</p>
    <div class="kentry-choice-actions">
      <button type="button" class="kentry-choice primary" data-kentry-mode="booking"><span><b>Prendre rendez-vous</b><small>Je découvre KŌMØ ou je programme un nouveau bilan.</small></span><i>→</i></button>
      <button type="button" class="kentry-choice" data-kentry-mode="login"><span><b>J'ai déjà un compte</b><small>J'accède à mes tests, rendez-vous, résultats et suivi.</small></span><i>→</i></button>
    </div>
    <button type="button" class="kentry-pro-link" data-kentry-mode="login">Professionnel KŌMØ ? Accéder à Pulse Pro →</button>`;
  panel.insertBefore(chooser,panel.firstChild);

  const back=document.createElement('button');
  back.type='button';back.id='kentryBack';back.className='kentry-back';back.textContent='← Retour';
  panel.insertBefore(back,q('.auth-heading')||chooser.nextSibling);
  back.addEventListener('click',()=>setPulseMode('choose'));
  chooser.querySelectorAll('[data-kentry-mode]').forEach(b=>b.addEventListener('click',()=>setPulseMode(b.dataset.kentryMode)));
}

function setPulseMode(mode){
  const panel=q('.auth-panel'); if(!panel)return;
  ensurePulseChoice();
  panel.dataset.entryMode=mode;
  const heading=q('.auth-heading',panel),title=q('h2',heading),copy=q('p',heading),signup=q('#signupButton'),email=q('#emailInput'),pass=q('#passwordInput');
  if(mode==='booking'){
    localStorage.setItem(POST_AUTH_KEY,JSON.stringify({route:'documents',createdAt:Date.now()}));
    sessionStorage.setItem(LEGACY_GATEWAY_SEEN,'1');
    if(title)title.textContent='Créez votre profil pour réserver';
    if(copy)copy.textContent='Quelques informations suffisent. Vous choisirez ensuite votre centre, votre bilan et votre créneau.';
    if(signup)signup.textContent='Créer mon profil et réserver →';
    [q('#signupFirstName'),q('#signupLastName'),q('#signupBirthDate')].forEach(x=>{if(x)x.required=true});
    email?.focus();
  }else if(mode==='login'){
    localStorage.removeItem(POST_AUTH_KEY);
    sessionStorage.setItem(LEGACY_GATEWAY_SEEN,'1');
    if(title)title.textContent='Bienvenue';
    if(copy)copy.textContent='Connectez-vous pour retrouver vos tests, rendez-vous, résultats et votre trajectoire.';
    if(signup)signup.textContent='Créer mon espace Pulse';
    [q('#signupFirstName'),q('#signupLastName'),q('#signupBirthDate')].forEach(x=>{if(x)x.required=false});
    email?.focus();
  }else{
    localStorage.removeItem(POST_AUTH_KEY);
    if(pass)pass.value='';
  }
}

function ensureGateway(){
  let el=q('#komoPublicEntry'); if(el)return el;
  el=document.createElement('section');
  el.id='komoPublicEntry';el.className='kentry-gateway';el.hidden=true;
  el.setAttribute('aria-label','Choisir votre espace KŌMØ');
  el.innerHTML=`
    <div class="kentry-shell">
      <header class="kentry-head">
        <a href="https://komolongevity.com/fr/" class="kentry-brand" aria-label="KŌMØ Longevity"><span>KŌMØ</span><small>LONGEVITY IN MOTION</small></a>
        <span class="kentry-secure">UN COMPTE · DEUX EXPÉRIENCES</span>
      </header>
      <div class="kentry-intro">
        <p>KŌMØ</p>
        <h1>Choisissez votre espace.</h1>
        <span>Votre parcours peut rester simple dans Pulse ou devenir immersif dans World. Vous pouvez passer de l'un à l'autre à tout moment.</span>
      </div>
      <div class="kentry-grid">
        <button type="button" class="kentry-space pulse" data-kentry-space="pulse">
          <span class="kentry-number">01</span><span class="kentry-arrow">→</span>
          <div><small>AGIR · SUIVRE</small><strong>Pulse</strong><p>Prendre rendez-vous, réaliser vos tests, préparer votre bilan, retrouver vos résultats et suivre votre progression.</p></div>
          <em>Accéder à Pulse</em>
        </button>
        <button type="button" class="kentry-space world" data-kentry-space="world">
          <span class="kentry-number">02</span><span class="kentry-arrow">↗</span>
          <div><small>EXPLORER · VIVRE</small><strong>World</strong><p>Entrer dans l'univers KŌMØ, découvrir les espaces, votre Twin et les expériences immersives.</p></div>
          <em>Entrer dans World</em>
        </button>
      </div>
      <footer><span><b>Pulse</b> est votre espace opérationnel.</span><span><b>World</b> est votre expérience immersive.</span></footer>
    </div>`;
  document.body.appendChild(el);
  q('[data-kentry-space="pulse"]',el)?.addEventListener('click',()=>{
    sessionStorage.setItem(ENTRY_SPACE_KEY,'pulse');
    sessionStorage.setItem(LEGACY_GATEWAY_SEEN,'1');
    el.hidden=true;document.body.classList.remove('kentry-open');
    setPulseMode('choose');
  });
  q('[data-kentry-space="world"]',el)?.addEventListener('click',()=>{
    sessionStorage.setItem(ENTRY_SPACE_KEY,'world');
    location.href='https://komolongevity.com/world/?from=pulse&entry=public';
  });
  return el;
}

function showGateway(){
  if(!authVisible())return;
  ensurePulseChoice();
  const el=ensureGateway();
  const params=new URLSearchParams(location.search);
  if(params.get('space')==='pulse'||sessionStorage.getItem(ENTRY_SPACE_KEY)==='pulse'){
    el.hidden=true;document.body.classList.remove('kentry-open');setPulseMode('choose');return;
  }
  el.hidden=false;document.body.classList.add('kentry-open');
}

function consumePostAuthRoute(){
  const shell=q('#appShell');if(!shell||shell.hidden)return;
  let pending=null;try{pending=JSON.parse(localStorage.getItem(POST_AUTH_KEY)||'null')}catch{}
  if(!pending?.route)return;
  if(Date.now()-Number(pending.createdAt||0)>86400000){localStorage.removeItem(POST_AUTH_KEY);return}
  localStorage.removeItem(POST_AUTH_KEY);
  sessionStorage.setItem(LEGACY_GATEWAY_SEEN,'1');
  location.hash=pending.route;
}

function schedule(){
  if(authVisible())showGateway();
  else{
    q('#komoPublicEntry')?.setAttribute('hidden','');
    document.body.classList.remove('kentry-open');
    consumePostAuthRoute();
  }
}

document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,80));
window.addEventListener('pageshow',()=>setTimeout(schedule,80));
window.addEventListener('komo:session-ready',()=>setTimeout(schedule,80));
const observer=new MutationObserver(()=>setTimeout(schedule,40));
observer.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});
setTimeout(schedule,450);
window.KomoPublicEntry={open:()=>{sessionStorage.removeItem(ENTRY_SPACE_KEY);showGateway()},pulse:()=>{sessionStorage.setItem(ENTRY_SPACE_KEY,'pulse');q('#komoPublicEntry')?.setAttribute('hidden','');setPulseMode('choose')}};
