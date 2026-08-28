(function(){
  const PATIENT_KEY='komo_clinical_patient';
  let lastId='',lastAt=0;

  function showEmergencyShell(patientId){
    let d=document.querySelector('#k2twDrawer');
    if(d)return;
    d=document.createElement('div');
    d.id='k2twDrawer';
    d.className='k2tw-drawer k2open4';
    d.dataset.patientId=patientId;
    d.style.cssText='position:fixed;inset:0;z-index:14050;display:flex;align-items:center;justify-content:center;padding:28px;background:rgba(24,32,27,.54);backdrop-filter:blur(14px)';
    d.innerHTML='<aside class="k2tw-panel" style="width:min(1180px,calc(100vw - 56px));max-height:calc(100vh - 56px);padding:42px;border-radius:30px;background:#f7f4ed;box-shadow:0 34px 100px rgba(18,28,22,.32);text-align:center"><strong style="display:block;font-size:18px;color:#34453a;margin-bottom:8px">Ouverture du dossier patient</strong><span style="font-size:11px;color:#6f7972">Initialisation du dossier KŌMØ…</span></aside>';
    document.body.appendChild(d);
  }

  function openNow(id){
    if(!id)return;
    localStorage.setItem(PATIENT_KEY,id);
    const direct=window.KomoCenterPatientOpenV4?.open;
    const nativeOpen=window.KomoCenterWorkspace?.openDossier;
    if(typeof direct==='function'){
      Promise.resolve(direct(id)).catch(err=>console.error('[center-patient-click-gate-v5 direct]',err));
      return;
    }
    if(typeof nativeOpen==='function'){
      Promise.resolve(nativeOpen(id)).catch(err=>console.error('[center-patient-click-gate-v5 native]',err));
      return;
    }
    showEmergencyShell(id);
    let tries=0;
    const seek=()=>{
      const fn=window.KomoCenterPatientOpenV4?.open||window.KomoCenterWorkspace?.openDossier;
      if(typeof fn==='function'){
        document.querySelector('#k2twDrawer')?.remove();
        Promise.resolve(fn(id)).catch(err=>console.error('[center-patient-click-gate-v5 delayed]',err));
        return;
      }
      if(tries++<60)setTimeout(seek,50);
      else{
        const panel=document.querySelector('#k2twDrawer .k2tw-panel');
        if(panel)panel.innerHTML='<strong style="display:block;font-size:18px;color:#755b4c;margin-bottom:8px">Ouverture impossible</strong><span style="font-size:11px;color:#755b4c">Le module dossier ne s’est pas initialisé. Actualisez la page puis réessayez.</span>';
      }
    };
    setTimeout(seek,25);
  }

  function gate(e){
    const b=e.target?.closest?.('[data-k2tw-open]');
    if(!b)return;
    const id=b.getAttribute('data-k2tw-open')||'';
    if(!id)return;
    const now=performance.now();
    if(id===lastId&&now-lastAt<500){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();return;}
    lastId=id;lastAt=now;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    b.blur?.();
    openNow(id);
  }

  window.addEventListener('click',gate,true);
  window.KomoCenterPatientClickGateV5={open:openNow};
})();
