/* KŌMØ Pulse — visible account logout v1
   Keeps sign-out immediately accessible from Compte & paramètres. */
(() => {
  'use strict';
  const STYLE_ID='kalLogoutStyleV1';
  const CARD_ID='kalLogoutCardV1';
  let timer=0;

  function css(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
#${CARD_ID}{margin:18px 0 96px;padding:20px 22px;border:1px solid rgba(45,40,35,.10);border-radius:22px;background:linear-gradient(145deg,#f6f1e8,#ece5da);display:flex;align-items:center;justify-content:space-between;gap:22px;box-shadow:0 14px 38px rgba(43,38,33,.06);box-sizing:border-box}
#${CARD_ID} .kal-copy{min-width:0}#${CARD_ID} .kal-copy small{display:block;margin-bottom:6px;font:600 7px/1 'DM Sans',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#8c837a}#${CARD_ID} .kal-copy strong{display:block;font:600 18px/1.2 Manrope,sans-serif;color:#2c2b28}#${CARD_ID} .kal-copy p{margin:6px 0 0;font:400 11px/1.45 'DM Sans',sans-serif;color:#746d65}
#${CARD_ID} button{flex:0 0 auto;min-width:152px;height:48px;padding:0 19px;border:1px solid rgba(80,49,42,.17);border-radius:15px;background:#3a312e;color:#fff;font:600 11px/1 'DM Sans',sans-serif;letter-spacing:.01em;cursor:pointer;box-shadow:0 9px 22px rgba(49,39,35,.14);transition:transform .16s ease,background .16s ease,box-shadow .16s ease}#${CARD_ID} button:hover{background:#2f2825;box-shadow:0 12px 28px rgba(49,39,35,.19);transform:translateY(-1px)}#${CARD_ID} button:active{transform:scale(.98)}#${CARD_ID} button[disabled]{opacity:.58;cursor:wait}
@media(max-width:680px){#${CARD_ID}{margin:14px 0 88px;padding:18px;display:block;border-radius:20px}#${CARD_ID} button{width:100%;margin-top:16px;min-width:0}}
@media(prefers-reduced-motion:reduce){#${CARD_ID} button{transition:none}}
`;
    document.head.appendChild(s);
  }

  async function fallbackLogout(button){
    button.disabled=true;
    button.textContent='Déconnexion…';
    try{
      const c=window.KomoRuntime?.client;
      if(c?.auth?.signOut)await c.auth.signOut();
    }catch(e){console.warn('[account-logout-visible-v1] fallback signOut',e)}
    try{sessionStorage.clear()}catch{}
    location.hash='home';
    setTimeout(()=>location.reload(),80);
  }

  function logout(button){
    const canonical=document.getElementById('logoutButton');
    if(canonical&&canonical!==button){
      button.disabled=true;
      button.textContent='Déconnexion…';
      canonical.click();
      setTimeout(()=>{if(!document.getElementById('authScreen')?.hidden)return;fallbackLogout(button)},700);
      return;
    }
    fallbackLogout(button);
  }

  function mount(){
    if(location.hash!=='#profile')return;
    css();
    const host=document.querySelector('[data-account-hub-v2]')||document.querySelector('[data-profile-v2]');
    if(!host||document.getElementById(CARD_ID))return;
    const card=document.createElement('section');
    card.id=CARD_ID;
    card.setAttribute('aria-label','Session');
    card.innerHTML='<div class="kal-copy"><small>SESSION</small><strong>Votre compte KŌMØ</strong><p>Fermez votre session sur cet appareil.</p></div><button type="button" data-kal-logout>Se déconnecter</button>';
    host.appendChild(card);
    card.querySelector('[data-kal-logout]')?.addEventListener('click',e=>logout(e.currentTarget));
  }

  function schedule(){clearTimeout(timer);timer=setTimeout(mount,100)}
  ['hashchange','pageshow','komo:route-ready','komo:session-ready'].forEach(x=>window.addEventListener(x,schedule));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,500));
  new MutationObserver(()=>{if(location.hash==='#profile'&&!document.getElementById(CARD_ID))schedule()}).observe(document.body,{childList:true,subtree:true});
  setTimeout(mount,1000);
})();
