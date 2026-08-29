/* KŌMØ Pulse — desktop authentication enhancer v1
   Presentation-only DOM details for desktop. */
(() => {
  'use strict';
  const V='1.0.0';

  function mount(){
    const auth=document.querySelector('#authScreen');
    if(!auth||auth.dataset.authWeb==='1')return;
    if(!matchMedia('(min-width:768px)').matches)return;

    auth.dataset.authWeb='1';
    auth.dataset.authWebVersion=V;

    const brand=auth.querySelector('.auth-brand');
    const note=auth.querySelector('.auth-note');
    if(brand&&!brand.querySelector('.kaw-platform-proof')){
      const proof=document.createElement('div');
      proof.className='kaw-platform-proof';
      proof.setAttribute('aria-label','KŌMØ platform layers');
      proof.innerHTML=`
        <div><small>01 · MOTION</small><strong>Mesurer</strong></div>
        <div><small>02 · CLINICAL</small><strong>Interpréter</strong></div>
        <div><small>03 · KEY</small><strong>Suivre</strong></div>`;
      if(note)brand.insertBefore(proof,note);else brand.appendChild(proof);
    }

    const panel=auth.querySelector('.auth-panel');
    if(panel&&!panel.querySelector('.kaw-panel-status')){
      const status=document.createElement('div');
      status.className='kaw-panel-status';
      status.innerHTML='<span>PULSE · MEMBER ACCESS</span><span><i class="kaw-dot" aria-hidden="true"></i>ACCÈS PRIVÉ</span>';
      panel.prepend(status);
    }

    const wrap=auth.querySelector('.auth-panel-wrap');
    if(wrap&&!wrap.querySelector('.kaw-version')){
      const version=document.createElement('div');
      version.className='kaw-version';
      version.setAttribute('aria-hidden','true');
      version.innerHTML='<span>KŌMØ PULSE</span><span>WEB · 2026.08</span>';
      wrap.appendChild(version);
    }
  }

  function sync(){
    if(matchMedia('(min-width:768px)').matches)mount();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sync,{once:true});
  else sync();
  window.addEventListener('pageshow',sync);
})();
