/* KŌMØ Pulse — My KŌMØ lobby ownership guard v1 */
(() => {
  let t=null,busy=false;
  const onLobby=()=>location.hash.replace(/^#/,'')==='results';
  function enforce(){
    if(!onLobby()||busy)return;
    const root=document.querySelector('#viewRoot');
    const lobby=root?.querySelector('[data-mykomo-lobby-v2]');
    if(!root||!lobby)return;
    busy=true;
    try{
      [...root.children].forEach(el=>{if(el!==lobby)el.remove()});
      const eyebrow=document.querySelector('#pageEyebrow'),title=document.querySelector('#pageTitle');
      if(eyebrow&&eyebrow.textContent!=='MY KŌMØ · LOBBY')eyebrow.textContent='MY KŌMØ · LOBBY';
      if(title&&title.textContent!=='Votre progression, en mouvement.')title.textContent='Votre progression, en mouvement.';
    }finally{busy=false}
  }
  function schedule(){clearTimeout(t);t=setTimeout(enforce,50)}
  const root=document.querySelector('#viewRoot');
  if(root)new MutationObserver(schedule).observe(root,{childList:true});
  ['hashchange','pageshow','komo:route-ready','komo:data-ready','komo:canonical-result-ready'].forEach(x=>window.addEventListener(x,schedule));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(enforce,1300));
  setInterval(()=>{if(onLobby())enforce()},900);
  window.KomoMyLobbyGuard={version:'1.0.0',enforce};
})();
