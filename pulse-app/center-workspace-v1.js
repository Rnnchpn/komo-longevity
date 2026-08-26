(() => {
  const CENTER_KEY='komo_clinical_org';
  let scheduled=false;

  function route(){return location.hash.replace(/^#/,'')||'home'}
  function setText(el,text){if(el&&el.textContent!==text)el.textContent=text}

  function labelMode(){
    const mode=document.querySelector('#modeSwitch');
    if(!mode)return;
    const member=mode.querySelector('[data-mode="member"]');
    const center=mode.querySelector('[data-mode="clinical"]');
    setText(member,'Espace patient');
    setText(center,'Espace centre');
    if(center&&center.getAttribute('aria-label')!=='Ouvrir l’espace centre')center.setAttribute('aria-label','Ouvrir l’espace centre');
  }

  function labelDock(){
    document.querySelectorAll('#proDesktopNav [data-pro-nav="dashboard"],#proMobileNav [data-pro-nav="dashboard"]').forEach(b=>{
      const s=b.querySelector('span');
      setText(s,'Centre');
      if(b.getAttribute('aria-label')!=='Centre')b.setAttribute('aria-label','Centre');
      b.dataset.centerWorkspace='1';
    });
  }

  function labelAccount(){
    const a=document.querySelector('[data-account-clinical]');
    if(!a)return;
    setText(a,route()==='clinical'?'Retour espace patient':'Espace centre');
  }

  function polishCenterHeader(){
    if(route()!=='clinical')return;
    const eyebrow=document.querySelector('#pageEyebrow');
    const title=document.querySelector('#pageTitle');
    setText(eyebrow,'KŌMØ CENTRE');
    setText(title,'Votre centre, en un seul espace.');

    const head=document.querySelector('.kcp-head');
    if(head){
      setText(head.querySelector('.eyebrow'),'KŌMØ CENTRE');
      setText(head.querySelector('h2'),'Pilotez votre activité KŌMØ.');
      setText(head.querySelector('p'),'Patients, bilans, rendez-vous, équipe et messages réunis dans le même espace centre.');
    }
  }

  function openCenter(){
    const tab=document.querySelector('[data-center-hub-tab]');
    if(tab){tab.click();return true}
    return false;
  }

  function ensureInitialCenter(){
    if(route()!=='clinical')return;
    if(document.body.dataset.komoCenterOpened==='1')return;
    const tryOpen=()=>{
      if(openCenter())document.body.dataset.komoCenterOpened='1';
    };
    setTimeout(tryOpen,120);
    setTimeout(tryOpen,420);
    setTimeout(tryOpen,900);
  }

  function apply(){
    labelMode();
    labelDock();
    labelAccount();
    polishCenterHeader();
    ensureInitialCenter();
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest?.('[data-pro-nav="dashboard"]');
    if(!b)return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if(route()!=='clinical')location.hash='clinical';
    document.querySelectorAll('[data-pro-nav]').forEach(x=>x.classList.toggle('active',x===b));
    setTimeout(()=>{
      if(!openCenter())setTimeout(openCenter,180);
    },40);
  },true);

  window.addEventListener('hashchange',()=>{
    if(route()!=='clinical')delete document.body.dataset.komoCenterOpened;
    setTimeout(apply,70);
  });
  window.addEventListener('komo:route-ready',()=>setTimeout(apply,50));
  document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,700));

  const obs=new MutationObserver(()=>{
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;apply()});
  });
  obs.observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden','class']});
  setTimeout(apply,1200);

  window.KomoCenterWorkspace={open:()=>{location.hash='clinical';setTimeout(openCenter,120)},activeCenter:()=>localStorage.getItem(CENTER_KEY)||''};
})();