(function(){
  function hrefFor(id){return `./dossier.html?patient=${encodeURIComponent(id)}`}
  function upgrade(root=document){
    root.querySelectorAll?.('button[data-k2tw-open]').forEach(btn=>{
      const id=btn.getAttribute('data-k2tw-open');
      if(!id)return;
      const a=document.createElement('a');
      a.className=`${btn.className||'k2tw-open'} k2native-dossier-link`;
      a.href=hrefFor(id);
      a.textContent=btn.textContent||'Ouvrir le dossier →';
      a.setAttribute('aria-label',`Ouvrir le dossier patient`);
      a.style.cssText='display:inline-flex;align-items:center;justify-content:center;text-decoration:none;position:relative;z-index:20;pointer-events:auto;';
      btn.replaceWith(a);
    });
  }
  const style=document.createElement('style');
  style.textContent='.k2tw-row{position:relative!important;pointer-events:auto!important}.k2native-dossier-link{pointer-events:auto!important;cursor:pointer!important}.k2tw-list{position:relative!important;z-index:2!important}';
  document.head.appendChild(style);
  const mo=new MutationObserver(ms=>{for(const m of ms)for(const n of m.addedNodes)if(n.nodeType===1)upgrade(n)});
  mo.observe(document.documentElement,{subtree:true,childList:true});
  document.addEventListener('DOMContentLoaded',()=>upgrade());
  setTimeout(()=>upgrade(),800);
  setTimeout(()=>upgrade(),1600);
  window.KomoCenterNativeDossierLinksV6={upgrade};
})();