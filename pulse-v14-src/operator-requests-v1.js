import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';
(function initOperatorRequests(){
  'use strict';
  const URL='https://uqlolefsiktbznnymriy.supabase.co';
  const KEY='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
  const EDGE=URL+'/functions/v1/motion-200-intake';
  const sb=createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true}});
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
  let authenticatedAdmin=false,checking=false,adminId='';
  async function check(){
    if(checking)return;checking=true;
    try{
      const session=(await sb.auth.getSession()).data.session;
      const id=session?.user?.id||'';
      if(!id){authenticatedAdmin=false;adminId='';return}
      if(id!==adminId){adminId=id;authenticatedAdmin=false}
      const role=await sb.from('account_roles').select('role').eq('user_id',id).maybeSingle();
      authenticatedAdmin=role.data?.role==='admin';
    }catch{authenticatedAdmin=false}finally{checking=false;mount()}
  }
  async function call(body){
    const session=(await sb.auth.getSession()).data.session;
    if(!session)throw Error('Session expirée, reconnectez-vous.');
    const response=await fetch(EDGE,{method:'POST',headers:{'Content-Type':'application/json','apikey':KEY,'Authorization':'Bearer '+session.access_token},body:JSON.stringify(body)});
    let result={};
    try{result=await response.json()}catch{throw Error('Le serveur ne répond pas correctement.')}
    if(!response.ok)throw Error(result.error==='email_delivery_failed'?'Invitation non envoyée. Vous pouvez réessayer.':result.error==='admin_required'?'Accès administrateur requis.':result.error||'Erreur de communication.');
    return result;
  }
  const timeNames={indifferent:'Indifférent',matin:'Matin',apres_midi:'Après-midi',fin_journee:'Fin de journée'};
  const statusNames={pending:'À valider',processing:'En cours',approved:'Invitation envoyée',declined:'Refusée'};
  async function populate(area){
    area.innerHTML='<p class="motion-intake-loading">Chargement des demandes…</p>';
    try{
      const data=await call({action:'list'});
      if(!area.isConnected)return;
      const rows=data.requests||[];
      const waiting=rows.filter(x=>x.status==='pending').length;
      area.innerHTML='<div class="motion-intake-stats"><strong>'+waiting+'</strong><span>demande(s) à valider</span><small>'+rows.length+' demande(s) reçue(s)</small></div>'+
      (rows.length?'<div class="motion-intake-list">'+rows.map(x=>
        '<article class="motion-intake-card"><header><div><small>MOTION CANNES · 200 €</small><h3>'+esc(x.first_name)+' '+esc(x.last_name)+'</h3></div><span class="motion-intake-tag '+(x.status==='pending'?'pending':'')+'">'+esc(statusNames[x.status]||x.status)+'</span></header>'+
        '<dl><div><dt>E-mail</dt><dd>'+esc(x.email)+'</dd></div><div><dt>Téléphone</dt><dd>'+esc(x.phone||'Non renseigné')+'</dd></div><div><dt>Date souhaitée</dt><dd>'+esc(x.preferred_date)+(x.alternative_date?' · ou '+esc(x.alternative_date):'')+'</dd></div><div><dt>Plage horaire</dt><dd>'+esc(timeNames[x.preferred_time]||'Indifférent')+'</dd></div></dl>'+
        (x.status==='pending'?'<div class="motion-intake-actions"><button type="button" data-approve="'+esc(x.id)+'">Valider et envoyer l’invitation</button><button type="button" data-decline="'+esc(x.id)+'">Refuser</button></div>':x.status==='approved'?'<p class="motion-intake-note">Invitation envoyée. La consultation reste à planifier.</p>':'')+
        (x.last_error?'<p class="motion-intake-error">Dernière tentative : '+esc(x.last_error)+'</p>':'')+'</article>'
      ).join('')+'</div>':'<p class="motion-intake-empty">Aucune demande reçue pour le moment. Les nouveaux formulaires apparaîtront ici automatiquement.</p>');
      area.querySelectorAll('[data-approve],[data-decline]').forEach(button=>button.addEventListener('click',async()=>{
        const approve=button.hasAttribute('data-approve'),id=button.getAttribute(approve?'data-approve':'data-decline'),label=button.textContent;
        button.disabled=true;button.textContent=approve?'Envoi de l’invitation…':'Enregistrement…';
        try{await call({action:approve?'approve':'decline',request_id:id});await populate(area)}
        catch(e){button.disabled=false;button.textContent=label;alert(e.message||'Impossible de traiter la demande.')}
      }));
    }catch(e){if(area.isConnected)area.innerHTML='<p class="motion-intake-error">'+esc(e.message||'Chargement impossible.')+'</p>'}
  }
  function mount(){
    const nav=document.querySelector('.app-shell-pro .sidebar nav');
    const view=document.querySelector('.app-shell-pro .page #view');
    if(!nav||!view||!authenticatedAdmin||nav.dataset.intakeReady==='1')return;
    nav.dataset.intakeReady='1';
    const button=document.createElement('button');
    button.type='button';button.className='nav-item motion-intake-nav';
    button.innerHTML='<span class="nav-dot" aria-hidden="true">✉</span><span>Demandes de comptes</span>';
    nav.prepend(button);
    const panel=document.createElement('section');
    panel.className='motion-intake-panel';panel.hidden=true;
    panel.innerHTML='<div class="motion-intake-head"><div><small>KŌMØ OPERATOR · MAISON EPIGENETIC</small><h2>Demandes de création de compte</h2><p>Motion à Cannes · 200 €. Validez les nouvelles demandes et envoyez directement l’invitation Pulse. Aucun créneau n’est automatiquement réservé.</p></div><button type="button" id="motionIntakeRefresh">Actualiser</button></div><div class="motion-intake-content" aria-live="polite"></div>';
    view.before(panel);
    const open=()=>{
      panel.hidden=false;view.hidden=true;button.classList.add('active');
      const title=document.querySelector('#pageTitle'),over=document.querySelector('#pageOverline');
      if(title)title.textContent='Demandes de comptes';
      if(over)over.textContent='KŌMØ OPERATOR';
      populate(panel.querySelector('.motion-intake-content'));
    };
    button.addEventListener('click',open);
    panel.querySelector('#motionIntakeRefresh').addEventListener('click',()=>populate(panel.querySelector('.motion-intake-content')));
  }
  const observer=new MutationObserver(()=>{if(authenticatedAdmin)mount();else if(!checking&&document.querySelector('.app-shell-pro .sidebar nav'))check()});
  observer.observe(document.getElementById('app'),{childList:true,subtree:true});
  sb.auth.onAuthStateChange((_ev,session)=>{if(session?.user?.id!==adminId){authenticatedAdmin=false;adminId='';check()}});
  check();
})();