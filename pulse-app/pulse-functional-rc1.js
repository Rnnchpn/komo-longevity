/* KŌMØ Pulse — RC1 functional safety layer
   Narrow, deterministic fixes only. No visual ownership, no score ownership. */
(() => {
  'use strict';
  const VERSION='1.1.0';
  const BOOKING_SERVICE_KEY='komo_agenda_service_v4';
  const BOOKING_SESSION_KEY='komo_home_booking_service';
  const FOCUS_BOOKING_KEY='komo_rc1_focus_booking';
  const CLINICAL_PATIENT_KEY='komo_clinical_patient';
  let auditTimer=0;

  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
  const go=(target)=>{
    const next=target==='tests'?'results':target;
    if(window.KomoPatientNavigation?.go)window.KomoPatientNavigation.go(next);
    else location.hash=next;
  };

  function toast(message){
    const t=document.querySelector('#toast');
    if(!t)return;
    t.textContent=message;
    t.hidden=false;
    clearTimeout(toast.timer);
    toast.timer=setTimeout(()=>{t.hidden=true},3400);
  }

  function own(event,target){
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    go(target);
  }

  function prepareBooking(service='motion'){
    try{
      localStorage.setItem(BOOKING_SERVICE_KEY,service);
      sessionStorage.setItem(BOOKING_SESSION_KEY,service);
      sessionStorage.setItem(FOCUS_BOOKING_KEY,'1');
    }catch{}
  }

  function installRouteScope(){
    document.documentElement.dataset.komoRc1Route=route();
  }

  function focusBooking(){
    if(route()!=='documents')return;
    let wanted=false;
    try{wanted=sessionStorage.getItem(FOCUS_BOOKING_KEY)==='1'}catch{}
    if(!wanted)return;
    const target=document.querySelector('[data-ag4-section="booking"]');
    if(!target)return;
    try{sessionStorage.removeItem(FOCUS_BOOKING_KEY)}catch{}
    requestAnimationFrame(()=>target.scrollIntoView({behavior:'smooth',block:'start'}));
  }

  function scopePatientReport(){
    const visible=['results','profile'].includes(route());
    document.querySelectorAll('[data-krpatient]').forEach(el=>{el.hidden=!visible});
  }

  function normalizeAgendaState(){
    if(route()!=='documents')return;
    let desired='';
    try{desired=localStorage.getItem(BOOKING_SERVICE_KEY)||sessionStorage.getItem(BOOKING_SESSION_KEY)||''}catch{}
    if(!['motion','clinical'].includes(desired))return;
    const active=document.querySelector(`[data-ag4-service="${desired}"]`);
    if(active&&!active.disabled&&!active.classList.contains('active'))active.click();
  }

  function repairNavigationApi(){
    const nav=window.KomoPatientNavigation;
    if(!nav||nav.__rc1Functional)return;
    const originalGo=typeof nav.go==='function'?nav.go.bind(nav):null;
    const originalCanonical=typeof nav.canonical==='function'?nav.canonical.bind(nav):x=>x;
    const originalPatientRoute=typeof nav.isPatientRoute==='function'?nav.isPatientRoute.bind(nav):()=>false;
    nav.go=(target,options)=>originalGo?originalGo(target==='tests'?'results':target,options):void(location.hash=target==='tests'?'results':target);
    nav.canonical=(target)=>target==='tests'?'results':originalCanonical(target);
    nav.isPatientRoute=(target)=>target==='key'||target==='tests'||originalPatientRoute(target);
    nav.__rc1Functional=true;
  }

  function capture(event){
    const t=event.target?.closest?.('button,a');
    if(!t)return;

    if(t.matches('[data-kts-action="score"]'))return own(event,'results');
    if(t.matches('[data-kts-action="prep-motion"]'))return own(event,'motion');
    if(t.matches('[data-kts-action="book-motion"]')){
      prepareBooking('motion');
      return own(event,'documents');
    }

    if(t.matches('[data-kcanon-home] [data-route="path"], [data-kcanon-account] [data-route="path"], [data-kcanon-doc] [data-route="path"]')){
      return own(event,'results');
    }

    const direct=t.getAttribute('data-route');
    if(direct==='tests')return own(event,'results');
  }

  async function createCenterAppointment(event){
    const form=event.target;
    if(!(form instanceof HTMLFormElement)||form.id!=='kcpAppointmentForm')return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    if(form.dataset.rc1Busy==='1')return;
    form.dataset.rc1Busy='1';
    const submit=form.querySelector('button[type="submit"],button:not([type])');
    const old=submit?.textContent||'';
    if(submit){submit.disabled=true;submit.textContent='Création…'}
    try{
      const client=window.KomoRuntime?.client;
      if(!client)throw new Error('Session Pulse indisponible.');
      const {data:{session}}=await client.auth.getSession();
      if(!session?.user)throw new Error('Reconnectez-vous à Pulse.');
      const patientId=localStorage.getItem(CLINICAL_PATIENT_KEY)||'';
      if(!patientId)throw new Error('Sélectionnez un patient.');
      const pr=await client.from('patients').select('id,organization_id').eq('id',patientId).maybeSingle();
      if(pr.error||!pr.data?.organization_id)throw pr.error||new Error('Centre du patient introuvable.');
      const f=new FormData(form);
      const type=String(f.get('appointment_type')||'');
      const mode=String(f.get('location_mode')||'in_person');
      const start=new Date(String(f.get('start')||''));
      const duration=Number(f.get('duration')||60);
      if(!['motion','clinical','follow_up','discovery'].includes(type))throw new Error('Type de rendez-vous invalide.');
      if(!['in_person','video','phone'].includes(mode))throw new Error('Mode de rendez-vous invalide.');
      if(Number.isNaN(start.getTime())||!Number.isFinite(duration)||duration<=0)throw new Error('Date ou durée invalide.');
      const end=new Date(start.getTime()+duration*60000);
      const serviceCode=type==='motion'?'KOMO_MOTION':type==='clinical'?'KOMO_CLINICAL':type==='follow_up'?'KOMO_FOLLOW_UP':'KOMO_DISCOVERY';
      const made=await client.rpc('create_pulse_appointment',{
        target_organization_id:pr.data.organization_id,
        target_patient_id:patientId,
        target_assigned_user_id:session.user.id,
        target_appointment_type:type,
        target_scheduled_start:start.toISOString(),
        target_scheduled_end:end.toISOString(),
        target_location_mode:mode,
        target_service_code:serviceCode,
        target_amount_cents:null,
        target_currency:'EUR'
      });
      if(made.error||!made.data)throw made.error||new Error('Rendez-vous non créé.');
      const appointmentId=made.data;
      const approved=await client.rpc('approve_komo_appointment',{p_appointment_id:appointmentId});
      if(approved.error)throw approved.error;
      if(type==='motion'){
        const episode=await client.rpc('ensure_motion_appointment_episode',{p_appointment_id:appointmentId});
        if(episode.error)throw episode.error;
      }else if(type==='clinical'){
        const episode=await client.rpc('ensure_clinical_appointment_episode',{p_appointment_id:appointmentId});
        if(episode.error)throw episode.error;
      }
      toast('Rendez-vous créé et confirmé.');
      form.reset();
      window.dispatchEvent(new CustomEvent('komo:appointment-updated',{detail:{appointmentId,type,source:'center'}}));
      setTimeout(()=>document.querySelector('#refreshButton')?.click(),120);
    }catch(error){
      console.error('[pulse-functional-rc1:center-appointment]',error);
      toast(`Création impossible : ${error?.message||error}`);
    }finally{
      delete form.dataset.rc1Busy;
      if(submit){submit.disabled=false;submit.textContent=old||'Créer'}
    }
  }

  function knownAction(button){
    if(button.disabled)return true;
    if(button.type==='submit'&&button.closest('form'))return true;
    if(button.closest('a[href]'))return true;
    if(button.onclick)return true;
    const names=button.getAttributeNames().filter(n=>n.startsWith('data-'));
    if(names.some(n=>[
      'data-route','data-kp6-route','data-kh-go','data-kmv3-route','data-kmv3-open','data-kmv3-close','data-kmv3-chapter','data-kmv3-draft','data-kmv3-finish',
      'data-kts-action','data-ag4-route','data-ag4-scroll','data-ag4-service','data-ag4-slot','data-ag4-cancel','data-ag4-filter','data-ag4-place',
      'data-komo-export-report','data-krpatient-download','data-krpatient-results','data-mkv5-route','data-mkv5-challenge','data-mkv5-save','data-mkv5-refresh',
      'data-open-test','data-close-test','data-kqe-open','data-kph2-motion','data-kph2-clinical','data-kph2-next',
      'data-pro-nav','data-kcp-tab','data-switch','data-open-import','data-review-score','data-release-score','data-approve-import','data-validate-priority','data-motion-new','data-center-hub-tab','data-kfollow-tab','data-kmsg-tab',
      'data-k2tw-nav','data-k2tw-open','data-k2tw-close','data-k2tw-import','data-k2tw-message','data-k2tw-approve',
      'data-admin-tab','data-admin-refresh','data-admin-home','data-admin-pro','data-pro-select','data-pro-close','data-pro-approve','data-pro-review','data-pro-decline','data-patient-assign',
      'data-kap-submit','data-kap-cancel','data-kap-withdraw','data-kap-download','data-admin-privacy-tab','data-kapq-review','data-kapq-generate-export','data-kapq-execute-closure','data-kapq-decline',
      'data-kam-nav','data-kam-action','data-kam-role','data-kam-close','data-agp-select','data-agp-center','data-agp-near','data-agp-filter','data-agp-popup',
      'data-kbook-service','data-kbook-slot','data-kbook-cancel','data-kbook-open','data-kbook-prev','data-kbook-next'
    ].includes(n)))return true;
    if(button.id&&['refreshButton','accountButton','logoutButton','loginButton','signupButton','forgotPasswordButton','togglePassword','kpvChangeEmail','kpvResetPassword','k2twRefresh','kbookPatientPrev','kbookPatientNext','kwfRegister','kwfTemplate','kwfImport'].includes(button.id))return true;
    return false;
  }

  function audit(){
    installRouteScope();
    repairNavigationApi();
    scopePatientReport();
    focusBooking();
    const root=document.querySelector('#appShell');
    if(!root||root.hidden)return {route:route(),buttons:0,unknown:[]};
    const buttons=[...root.querySelectorAll('button')].filter(b=>b.offsetParent!==null);
    const unknown=buttons.filter(b=>!knownAction(b)).map(b=>({text:(b.textContent||'').replace(/\s+/g,' ').trim().slice(0,80),id:b.id||'',classes:b.className||''}));
    if(unknown.length)console.warn('[pulse-functional-rc1] visible buttons without recognized action contract',unknown);
    return {route:route(),buttons:buttons.length,unknown};
  }

  function schedule(ms=80){
    clearTimeout(auditTimer);
    auditTimer=setTimeout(()=>{
      repairNavigationApi();
      installRouteScope();
      scopePatientReport();
      normalizeAgendaState();
      focusBooking();
      audit();
    },ms);
  }

  document.addEventListener('click',capture,true);
  document.addEventListener('submit',createCenterAppointment,true);
  ['hashchange','pageshow','komo:canonical-route','komo:route-ready','komo:data-ready','komo:session-ready','komo:appointment-updated'].forEach(name=>window.addEventListener(name,()=>schedule(70)));
  document.addEventListener('DOMContentLoaded',()=>schedule(350));
  const root=document.querySelector('#viewRoot');
  if(root)new MutationObserver(()=>schedule(40)).observe(root,{childList:true,subtree:true});
  setTimeout(()=>schedule(0),1100);

  window.KomoFunctionalRC1={version:VERSION,audit,go,prepareBooking,refresh:()=>schedule(0)};
})();