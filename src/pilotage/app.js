/* KŌMØ Operations — private prototype. All records and payment events are fictional.
   No live finance, email or clinical APIs are called from this file. */
(() => {
  'use strict';

  const DEMO = true;
  const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  const dayFormatter = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/Paris' });
  const dateTimeFormatter = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Paris' });
  const daysFromNow = (delta, hour = 10) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() + delta);
    const iso = [d.getFullYear(), String(d.getMonth()+1).padStart(2,'0'), String(d.getDate()).padStart(2,'0')].join('-');
    return iso + 'T' + String(hour).padStart(2,'0') + ':00:00';
  };
  const escapeHtml = value => String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const GATES = [
    ['case', 'Motion Case', 'Valise préparée et disponible'],
    ['team', 'Équipe', 'Intervenant confirmé'],
    ['payment', 'Paiement', 'Paiement acquis ou crédit validé'],
    ['communication', 'Communication', 'Contacts et accès vérifiés'],
    ['transport', 'Transport', 'Déplacement et accès validés']
  ];
  const cases = [
    { id: 'MOTION-01', city: 'Cannes', state: 'Disponible', klass:'available', person:'Logistique Riviera' },
    { id: 'MOTION-02', city: 'Monaco', state: 'Réservée', klass:'busy', person:'Mission Yacht' },
    { id: 'MOTION-03', city: 'Antibes', state: 'Maintenance', klass:'off', person:'Contrôle capteurs' }
  ];
  const team = [
    { name:'Intervenant A', role:'Spécialiste Motion', area:'Cannes · Antibes', status:'Disponible' },
    { name:'Intervenant B', role:'Spécialiste Motion', area:'Monaco · Nice', status:'Affecté' },
    { name:'Coordinateur A', role:'Logistique', area:'French Riviera', status:'Disponible' }
  ];
  const createMission = (id, location, service, dt, participants, amount, gates, paymentState = 'pending', status = 'provisional', caseId = 'À affecter') => ({
    id, location, service, date:dt, participants, amount, gates:{ ...gates }, paymentState, status, caseId, reminderCount:0
  });
  const missions = [
    createMission('KMO-2601','Yacht · Cannes','Motion Session',daysFromNow(1,9),4,2000,{case:true,team:true,payment:false,communication:true,transport:true},'pending','provisional','MOTION-01'),
    createMission('KMO-2602','Villa · Cap d’Antibes','Motion Clinical',daysFromNow(1,14),2,1000,{case:true,team:true,payment:true,communication:true,transport:true},'paid','confirmed','MOTION-02'),
    createMission('KMO-2603','Yacht · Monaco','Motion Session',daysFromNow(2,11),6,3000,{case:false,team:true,payment:false,communication:false,transport:false},'pending','provisional','À affecter'),
    createMission('KMO-2604','Hôtel · Cannes','Motion Lab',daysFromNow(3,16),3,1500,{case:true,team:false,payment:false,communication:true,transport:true},'pending','provisional','MOTION-03')
  ];
  let selectedId = null;
  let activePage = 'overview';
  let boardFilter = 'all';
  let tableFilter = 'all';
  let toastTimer = null;

  function isReady(m) { return GATES.every(g => m.gates[g[0]]); }
  function pendingGates(m) { return GATES.filter(g => !m.gates[g[0]]); }
  function paymentLabel(m) { return m.paymentState === 'paid' ? 'Réglé · simulation' : m.paymentState === 'credit' ? 'Crédit approuvé · démo' : 'À encaisser'; }
  function status(m) {
    if(m.status === 'confirmed' && isReady(m)) return { label:'Confirmée',klass:'confirmed' };
    if(isReady(m)) return { label:'Confirmable',klass:'good' };
    return { label:pendingGates(m).length + ' validation(s)',klass:'warn' };
  }
  function statusBadge(m) { const s = status(m); return '<span class="status-chip '+s.klass+'">'+s.label+'</span>'; }
  function dateOf(m) {
    const time = new Date(m.date);
    return isNaN(time) ? 'Date inconnue' : dateTimeFormatter.format(time);
  }
  function dateShort(m){return dayFormatter.format(new Date(m.date));}
  function toast(message) {
    const node = document.querySelector('#toast');
    node.textContent = message;
    node.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> { node.hidden = true; }, 4700);
  }
  function navigate(page) {
    if (!document.querySelector('[data-view="'+page+'"]')) return;
    activePage=page;
    document.querySelectorAll('[data-view]').forEach(el=> {el.hidden = el.dataset.view!==page;});
    document.querySelectorAll('[data-page]').forEach(el=>el.classList.toggle('active',el.dataset.page===page));
    const label = {overview:'Tableau de bord',missions:'Missions',finance:'Facturation et paiements',resources:'Matériel et équipes',partners:'Partenaires'};
    document.querySelector('#current-crumb').textContent = label[page] || 'Pilotage';
    window.scrollTo({top:0,behavior:'smooth'});
    render();
  }
  function filterMissions(kind) {
    return missions.filter(m=>kind==='all'||(kind==='action' && !isReady(m))||(kind==='ready' && isReady(m))||(kind==='confirmed' && m.status==='confirmed' && isReady(m)));
  }
  function gatesVisual(m) {return '<div class="mini-gates" aria-label="'+GATES.filter(g=>m.gates[g[0]]).length+' validations sur 5">'+GATES.map(g=>'<span title="'+g[1]+'" class="gate-dot '+(m.gates[g[0]]?'good':'pending')+'"></span>').join('')+'</div>';}
  function renderMetrics() {
    const confirmed = missions.filter(m=>m.status==='confirmed'&&isReady(m)).length;
    const ready = missions.filter(isReady).length;
    const waiting = missions.filter(m=>m.paymentState==='pending').length;
    const projected = missions.reduce((s,m)=>s+m.amount,0);
    const data = [
      ['Missions',String(missions.length),'Dossiers créés','◫'],
      ['Confirmées / validées',String(confirmed)+' / '+String(ready),'Contrôles terminés','✓'],
      ['Règlements en attente',String(waiting),'Missions non réglées','◈'],
      ['Montant total',eur.format(projected),'Données de test','↗']
    ];
    document.querySelector('#metrics').innerHTML = data.map(d=>'<div class="metric"><div class="metric-head"><span>'+d[0]+'</span><span class="metric-icon">'+d[3]+'</span></div><div class="metric-number">'+d[1]+'</div><div class="metric-caption">'+d[2]+'</div></div>').join('');
    document.querySelector('#nav-missions-count').textContent = String(missions.length);
  }
  function renderOverview() {
    document.querySelector('#overview-missions').innerHTML = filterMissions(boardFilter).slice(0,6).map(m =>
      '<button type="button" class="mission-row" data-open-mission="'+m.id+'"><span class="mission-left"><span class="mission-symbol">↗</span><span class="mission-copy"><strong>'+escapeHtml(m.location)+'</strong><small>'+escapeHtml(m.service)+' · '+dateOf(m)+' · '+m.participants+' pers.</small></span></span><span class="mission-right">'+statusBadge(m)+gatesVisual(m)+'</span></button>'
    ).join('') || '<div class="empty-state">Aucune mission ne correspond à ce filtre.</div>';
    const unresolved = missions.flatMap(m=>pendingGates(m).map(g=>({m,g})));
    const priority = unresolved.sort((a,b)=>a.m.date.localeCompare(b.m.date)).slice(0,3);
    document.querySelector('#alerts-count').textContent = unresolved.length + ' contrôles';
    document.querySelector('#alerts-list').innerHTML = priority.map(({m,g})=>
      '<div class="alert-item"><span class="alert-icon">!</span><div><strong>'+escapeHtml(g[1])+' · '+escapeHtml(m.location)+'</strong><p>'+escapeHtml(g[2])+' · '+dateShort(m)+'</p></div></div>'
    ).join('') || '<div class="empty-state">Tous les contrôles sont au vert.</div>';
    document.querySelector('#cases-overview').innerHTML = cases.map(c=>'<div class="case-item"><div><strong>'+c.id+'</strong><small>'+escapeHtml(c.city)+'</small></div><div class="case-state '+(c.klass==='busy'?'busy':c.klass==='off'?'off':'')+'">'+escapeHtml(c.state)+'</div></div>').join('');
    document.querySelectorAll('[data-filter]').forEach(el=>el.classList.toggle('active',el.dataset.filter===boardFilter));
  }
  function renderMissionTable() {
    const rows = filterMissions(tableFilter).map(m=>
      '<tr><td><strong>'+escapeHtml(m.id)+'</strong><small>'+escapeHtml(m.service)+'</small></td><td><strong>'+escapeHtml(m.location)+'</strong><small>'+m.participants+' participants</small></td><td>'+dateOf(m)+'</td><td>'+eur.format(m.amount)+'</td><td>'+statusBadge(m)+'</td><td><button type="button" data-open-mission="'+m.id+'" class="table-action">Ouvrir →</button></td></tr>'
    ).join('');
    document.querySelector('#all-missions').innerHTML = '<table class="table"><thead><tr><th>Référence</th><th>Lieu</th><th>Créneau</th><th>Montant</th><th>Statut</th><th>Action</th></tr></thead><tbody>'+ (rows||'<tr><td colspan="6">Aucune mission dans cette catégorie.</td></tr>') +'</tbody></table>';
    document.querySelector('#mission-filter').value=tableFilter;
  }
  function renderFinance() {
    const paid = missions.filter(m=>m.paymentState==='paid').reduce((s,m)=>s+m.amount,0);
    const unpaid = missions.filter(m=>m.paymentState==='pending').reduce((s,m)=>s+m.amount,0);
    const cells = [['Règlements simulés',eur.format(paid)],['Soldes en attente',eur.format(unpaid)],['Factures réelles émises','0']];
    document.querySelector('#finance-metrics').innerHTML = cells.map(c=>'<div class="finance-stat"><span>'+c[0]+'</span><strong>'+c[1]+'</strong></div>').join('');
    document.querySelector('#finance-table').innerHTML = '<table class="table"><thead><tr><th>Mission</th><th>Prestations</th><th>Montant</th><th>Règlement</th><th>Action de test</th></tr></thead><tbody>'+missions.map(m=>
      '<tr><td><strong>'+m.id+'</strong><small>'+escapeHtml(m.location)+'</small></td><td>'+escapeHtml(m.service)+'</td><td>'+eur.format(m.amount)+'</td><td><span class="status-chip '+(m.paymentState==='paid'?'good':'warn')+'">'+paymentLabel(m)+'</span></td><td><button type="button" class="table-action" data-open-mission="'+m.id+'">Détails →</button></td></tr>'
    ).join('')+'</tbody></table>';
  }
  function renderResources() {
    document.querySelector('#resources-grid').innerHTML = cases.map(c=>
      '<div class="resource-card"><div class="resource-top"><div class="resource-art">▣</div><span class="status-chip '+(c.klass==='available'?'good':c.klass==='busy'?'warn':'bad')+'">'+escapeHtml(c.state)+'</span></div><h3>'+c.id+'</h3><p>Motion Case · inventaire pilote</p><div class="resource-bottom"><span>⌖ '+escapeHtml(c.city)+'</span><span>'+escapeHtml(c.person)+'</span></div></div>'
    ).join('');
    document.querySelector('#team-table').innerHTML = '<table class="table"><thead><tr><th>Profil</th><th>Rôle</th><th>Zone</th><th>Disponibilité</th></tr></thead><tbody>'+team.map(t=>
      '<tr><td><strong>'+escapeHtml(t.name)+'</strong></td><td>'+escapeHtml(t.role)+'</td><td>'+escapeHtml(t.area)+'</td><td><span class="status-chip '+(t.status==='Disponible'?'good':'warn')+'">'+escapeHtml(t.status)+'</span></td></tr>'
    ).join('')+'</tbody></table>';
  }
  function renderDrawer() {
    if(!selectedId) return;
    const m=missions.find(x=>x.id===selectedId);
    if(!m) return closeDrawer();
    document.querySelector('#drawer-title').textContent=m.location;
    const paymentConfirmed = m.paymentState==='paid' || m.paymentState==='credit';
    document.querySelector('#drawer-content').innerHTML =
      '<div class="drawer-reference">'+m.id+' · '+escapeHtml(m.service)+' · DONNÉES FICTIVES</div>'+
      '<div class="drawer-meta"><div><small>Session</small><strong>'+dateOf(m)+'</strong></div><div><small>Participants</small><strong>'+m.participants+' personnes</strong></div><div><small>Motion Case</small><strong>'+escapeHtml(m.caseId)+'</strong></div><div><small>Statut</small>'+statusBadge(m)+'</div></div>'+
      '<div class="drawer-section-title">Les cinq validations</div>'+
      GATES.map(g=>'<div class="gate-row"><label><input type="checkbox" data-toggle-gate="'+g[0]+'" '+(m.gates[g[0]]?'checked ':'')+(g[0]==='payment'?'disabled ':'')+'><span>'+g[1]+'<small>'+g[2]+'</small></span></label><span class="'+(m.gates[g[0]]?'verified':'pending')+'">'+(m.gates[g[0]]?'VALIDÉ':'REQUIS')+'</span></div>').join('')+
      '<div class="drawer-section-title">Encaissement · simulation</div>'+
      '<div class="payment-card"><small>Montant du dossier</small><strong>'+eur.format(m.amount)+'</strong><p>'+paymentLabel(m)+'. Aucun prélèvement réel, aucune facture et aucun message ne sont envoyés.</p>'+
      (paymentConfirmed?'<span class="status-chip good">Simulation de règlement enregistrée</span>':'<div class="drawer-actions"><button type="button" class="btn btn-secondary" data-demo-reminder="'+m.id+'">Simuler relance</button><button type="button" class="btn btn-primary" data-demo-payment="'+m.id+'">Simuler règlement</button></div>')+
      '</div>'+
      '<div class="drawer-section-title">Confirmation de mission</div>'+
      (isReady(m)?'<div class="drawer-success">Les cinq conditions sont validées dans le prototype. La mission peut être confirmée en démonstration.</div>':'<div class="drawer-warning">'+pendingGates(m).length+' contrôle(s) non validé(s). Confirmation indisponible tant que tous les feux ne sont pas verts.</div>')+
      '<button type="button" class="btn btn-primary" style="width:100%;margin-top:3px" data-demo-confirm="'+m.id+'" '+(!isReady(m)||m.status==='confirmed'?'disabled':'')+'>'+(m.status==='confirmed'?'Mission confirmée · simulation':'Confirmer la mission · simulation')+'</button>'+
      '<div class="drawer-section-title">Journal</div><div class="summary-line"><span>Relances testées</span><strong>'+m.reminderCount+'</strong></div><div class="summary-line"><span>Dernier changement</span><strong>Session navigateur</strong></div>';
  }
  function openDrawer(id) {
    if(!missions.some(m=>m.id===id))return;
    selectedId=id;
    document.querySelector('#drawer-backdrop').hidden=false;
    document.querySelector('#mission-drawer').hidden=false;
    renderDrawer();
    document.querySelector('#close-drawer').focus();
  }
  function closeDrawer(){
    selectedId=null;
    document.querySelector('#drawer-backdrop').hidden=true;
    document.querySelector('#mission-drawer').hidden=true;
  }
  function render(){renderMetrics();renderOverview();renderMissionTable();renderFinance();renderResources();if(selectedId)renderDrawer();}
  function showNewMission(){
    const dialog = document.querySelector('#new-mission-dialog');
    const today = daysFromNow(1).slice(0,10);
    dialog.querySelector('input[name="date"]').value = today;
    dialog.querySelector('input[name="date"]').min = daysFromNow(0).slice(0,10);
    if(typeof dialog.showModal === 'function')dialog.showModal();else toast('Votre navigateur ne prend pas en charge ce formulaire.');
  }
  document.addEventListener('click',event=>{
    const target = event.target.closest('button,[data-goto]');
    if(!target)return;
    if(target.dataset.page){navigate(target.dataset.page);return;}
    if(target.dataset.goto){navigate(target.dataset.goto);return;}
    if(target.dataset.newMission!==undefined){showNewMission();return;}
    if(target.dataset.filter){boardFilter=target.dataset.filter;renderOverview();return;}
    if(target.dataset.openMission){openDrawer(target.dataset.openMission);return;}
    if(target.dataset.demoReminder){
      const m=missions.find(x=>x.id===target.dataset.demoReminder);
      if(!m||m.paymentState!=='pending')return;
      m.reminderCount++;
      toast('Relance simulée · aucun SMS ou e-mail envoyé');
      renderDrawer();return;
    }
    if(target.dataset.demoPayment){
      const m=missions.find(x=>x.id===target.dataset.demoPayment);
      if(!m || m.paymentState!=='pending')return;
      m.paymentState='paid';m.gates.payment=true;
      toast('Règlement fictif enregistré · aucune transaction bancaire');
      render();return;
    }
    if(target.dataset.demoConfirm){
      const m=missions.find(x=>x.id===target.dataset.demoConfirm);
      if(!m)return;
      if(!isReady(m)){toast('Confirmation bloquée : les cinq validations sont nécessaires.');return;}
      m.status='confirmed';toast('Mission confirmée dans la simulation uniquement.');render();return;
    }
  });
  document.addEventListener('change',event=>{
    const el=event.target;
    if(el.id==='mission-filter'){tableFilter=el.value;renderMissionTable();return;}
    if(el.dataset.toggleGate){
      const m=missions.find(x=>x.id===selectedId);
      if(!m||el.dataset.toggleGate==='payment')return;
      m.gates[el.dataset.toggleGate]=el.checked;
      if(!isReady(m)&&m.status==='confirmed')m.status='provisional';
      toast('Contrôle mis à jour dans le prototype.');
      render();
    }
  });
  document.querySelector('#drawer-backdrop').addEventListener('click',closeDrawer);
  document.querySelector('#close-drawer').addEventListener('click',closeDrawer);
  document.querySelector('#cancel-mission').addEventListener('click',()=>document.querySelector('#new-mission-dialog').close());
  document.querySelector('#new-mission-form').addEventListener('submit',event=>{
    event.preventDefault();
    const data=new FormData(event.currentTarget);
    const participants=Number(data.get('participants'));
    const amount=Number(data.get('amount'));
    const location=String(data.get('location')||'').trim();
    const dt=String(data.get('date'))+'T'+String(data.get('time'))+':00';
    if(!location||!Number.isInteger(participants)||participants<1||participants>30||!Number.isFinite(amount)||amount<0||amount>100000||!Number.isFinite(Date.parse(dt))){toast('Vérifiez les informations du dossier.');return;}
    const id='KMO-DEMO-'+String(missions.length+1).padStart(2,'0');
    missions.unshift(createMission(id,location,String(data.get('service')),dt,participants,amount,{case:false,team:false,payment:false,communication:false,transport:false}));
    document.querySelector('#new-mission-dialog').close();
    event.currentTarget.reset();
    toast('Dossier de test créé.');
    navigate('missions');openDrawer(id);
  });
  
  document.querySelector('#alerts-button').addEventListener('click',()=>{navigate('overview');document.querySelector('#alerts-list').scrollIntoView({behavior:'smooth',block:'center'});});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&selectedId)closeDrawer();});
  function tick(){
    const clock=new Intl.DateTimeFormat('fr-FR',{timeZone:'Europe/Paris',hour:'2-digit',minute:'2-digit'});
    document.querySelector('#local-clock').textContent='Paris · '+clock.format(new Date());
  }
  tick();setInterval(tick,60000);render();
  if(!DEMO)throw new Error('Prototype financier interdit en mode production sans connecteurs réels.');
})();