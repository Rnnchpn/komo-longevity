
(function(){
  var REGIONS=[
    "Auvergne-Rhône-Alpes","Bourgogne-Franche-Comté","Bretagne","Centre-Val de Loire","Corse","Grand Est",
    "Guadeloupe","Guyane","Hauts-de-France","Île-de-France","La Réunion","Martinique","Mayotte","Normandie",
    "Nouvelle-Aquitaine","Occitanie","Pays de la Loire","Provence-Alpes-Côte d’Azur"
  ];
  var EST_TYPES=["Clinique","Hôpital","Cabinet / centre médical","Centre de kinésithérapie","Centre d’ostéopathie","Pharmacie","Laboratoire","Centre d’imagerie","Hôtel","Spa / wellness","Club / salle de sport","Yacht / yachting","Marina","Conciergerie","Retreat / villa","Entreprise","Média","Autre"];
  var PRO_TYPES=["Médecin","Chirurgien","Kinésithérapeute","Ostéopathe","Infirmier(ère)","Pharmacien(ne)","Radiologue / imagerie","Biologiste / laboratoire","Coach / préparateur physique","Direction clinique / établissement","Direction hôtel / spa","Broker / yachting","Concierge","Partenaire business","Journaliste / média","Investisseur","Autre"];
  var STAGES=["Cible","Contacté","RDV","Démo","Proposition","Négociation","Gagné","Perdu"];
  var OWNERS=["Renan","Ugo","Benoît","Équipe"];
  var MONEY=new Intl.NumberFormat("fr-FR",{style:"currency",currency:"EUR",maximumFractionDigits:0});

  if(USER_CONFIG && USER_CONFIG.ucalia){USER_CONFIG.ucalia.name="Ugo";USER_CONFIG.ucalia.role="Commercial · réseau / partenariats";}
  if(ROLE_FROM_PATH==="blebeau"){
    var pnav=document.querySelector('.nav button[data-view="pipeline"]'); if(pnav)pnav.style.display="";
  }
  var sideFoot=document.querySelector(".side-foot");if(sideFoot)sideFoot.innerHTML="Espace privé · aucune donnée patient<br>CRM national · état partagé Supabase";

  function crmDefault(){
    return {version:1,entities:[],notes:[],actions:[],digest_subscribers:[],settings:{daily_digest:true,digest_time:"08:00",timezone:"Europe/Paris"}};
  }
  function ensureCrm(){
    if(!state.crm || typeof state.crm!=="object") state.crm=crmDefault();
    if(!Array.isArray(state.crm.entities))state.crm.entities=[];
    if(!Array.isArray(state.crm.notes))state.crm.notes=[];
    if(!Array.isArray(state.crm.actions))state.crm.actions=[];
    if(!Array.isArray(state.crm.digest_subscribers))state.crm.digest_subscribers=[];
    if(!state.crm.settings)state.crm.settings=crmDefault().settings;
    state.crm.entities.forEach(function(e){
      if(e.status==null)e.status="active";
      if(e.country==null)e.country="France";
      if(e.priority==null)e.priority="normal";
    });
  }
  function opt(value,label,selected){return '<option value="'+esc(value)+'" '+(selected===value?'selected':'')+'>'+esc(label==null?value:label)+'</option>';}
  function fillSelect(id,items,blank,label){
    var el=document.querySelector("#"+id);if(!el)return;
    var current=el.value;
    el.innerHTML=(blank?'<option value="">'+esc(label||"Tous")+'</option>':'')+items.map(function(x){return opt(x,x,current);}).join("");
    if(items.includes(current)||current==="")el.value=current;
  }
  function subtypeItems(kind){return kind==="professional"?PRO_TYPES:EST_TYPES;}
  function updateSubtype(){
    var kind=document.querySelector("#crmKind");var subtype=document.querySelector("#crmSubtype");if(!kind||!subtype)return;
    var current=subtype.value;subtype.innerHTML=subtypeItems(kind.value).map(function(x){return opt(x,x,current);}).join("");
  }
  function filteredEntities(){
    ensureCrm();
    var q=(document.querySelector("#crmSearch")?.value||"").trim().toLowerCase();
    var region=document.querySelector("#crmRegionFilter")?.value||"";
    var kind=document.querySelector("#crmKindFilter")?.value||"";
    var stage=document.querySelector("#crmStageFilter")?.value||"";
    var owner=document.querySelector("#crmOwnerFilter")?.value||"";
    return state.crm.entities.filter(function(e){
      if(e.status==="archived")return false;
      if(region&&e.region_name!==region)return false;if(kind&&e.entity_kind!==kind)return false;if(stage&&e.pipeline_stage!==stage)return false;if(owner&&e.owner!==owner)return false;
      if(q){
        var hay=[e.name,e.region_name,e.department_name,e.city,e.establishment_type,e.professional_type,e.owner,e.source,e.next_action].join(" ").toLowerCase();
        if(!hay.includes(q))return false;
      }
      return true;
    });
  }
  function isActive(e){return e.status!=="archived"&&!["Gagné","Perdu"].includes(e.pipeline_stage);}
  function dueLabel(e){
    if(!e.next_action)return '<span class="crm-alert">AUCUNE ACTION</span>';
    var d=e.next_action_at?String(e.next_action_at).slice(0,10):"";
    var cls=d&&d<isoToday()?"crm-alert":"";
    return '<div class="crm-next '+cls+'"><b>'+esc(e.next_action)+'</b>'+(d?'<div class="crm-small">'+esc(d)+'</div>':'')+'</div>';
  }
  function renderCrmTable(){
    var body=document.querySelector("#crmRows");if(!body)return;
    var rows=filteredEntities();
    body.innerHTML=rows.length?rows.map(function(e){
      var type=e.entity_kind==="professional"?(e.professional_type||"Professionnel"):(e.establishment_type||"Établissement");
      var place=[e.city,e.department_code].filter(Boolean).join(" · ");
      return '<tr><td><div class="crm-name">'+esc(e.name)+'</div><div class="crm-sub">'+esc(place)+'</div></td>'+
        '<td>'+esc(e.region_name||"—")+'</td><td><span class="crm-entity-chip">'+esc(type)+'</span></td>'+
        '<td>'+esc(e.pipeline_stage||"Cible")+'</td><td>'+esc(e.owner||"—")+'</td><td class="money">'+MONEY.format(Number(e.estimated_value||0))+'</td>'+
        '<td>'+dueLabel(e)+'</td><td><button class="btn ghost" data-crm-open="'+esc(e.id)+'">Ouvrir</button></td></tr>';
    }).join(""):'<tr><td colspan="8" class="muted">Aucun contact ne correspond aux filtres.</td></tr>';
    document.querySelectorAll("[data-crm-open]").forEach(function(b){b.onclick=function(){openEntity(b.dataset.crmOpen);};});
  }
  function renderCrmKpis(){
    ensureCrm();var active=state.crm.entities.filter(isActive);
    var regions=new Set(active.map(function(e){return e.region_name;}).filter(Boolean));
    var value=active.reduce(function(s,e){return s+Number(e.estimated_value||0);},0);
    var today=isoToday();var follow=active.filter(function(e){return !e.next_action||(e.next_action_at&&String(e.next_action_at).slice(0,10)<=today);}).length;
    var map={crmActiveKpi:active.length,crmRegionsKpi:regions.size,crmValueKpi:MONEY.format(value),crmFollowupKpi:follow};
    Object.keys(map).forEach(function(id){var el=document.querySelector("#"+id);if(el)el.textContent=map[id];});
    var mainPipeline=document.querySelector("#pipelineKpi");if(mainPipeline)mainPipeline.textContent=MONEY.format(value);
  }
  function renderRegions(){
    var el=document.querySelector("#crmRegionCoverage");if(!el)return;ensureCrm();
    var m={};state.crm.entities.filter(isActive).forEach(function(e){
      var r=e.region_name||"Non renseignée";if(!m[r])m[r]={n:0,est:0,pro:0,value:0};
      m[r].n++;m[r][e.entity_kind==="professional"?"pro":"est"]++;m[r].value+=Number(e.estimated_value||0);
    });
    var rows=Object.entries(m).sort(function(a,b){return b[1].n-a[1].n;});
    el.innerHTML=rows.length?rows.map(function(x){return '<div class="crm-region"><span><b>'+esc(x[0])+'</b></span><span>'+x[1].n+' actifs</span><span>'+x[1].est+' étab. / '+x[1].pro+' pros</span><span class="money">'+MONEY.format(x[1].value)+'</span></div>';}).join(""):'<div class="empty">Aucune région active.</div>';
  }
  function renderNotes(){
    var el=document.querySelector("#crmNotes");if(!el)return;ensureCrm();
    var entityFilter=document.querySelector("#crmNoteEntity")?.value||"";
    var rows=state.crm.notes.slice().sort(function(a,b){return String(b.at||"").localeCompare(String(a.at||""));});
    if(entityFilter)rows=rows.filter(function(n){return n.entity_id===entityFilter;});
    rows=rows.slice(0,15);
    el.innerHTML=rows.length?rows.map(function(n){
      var e=state.crm.entities.find(function(x){return x.id===n.entity_id;});
      return '<div class="crm-note"><div class="crm-note-head"><b>'+esc(e?e.name:"Contact")+' · '+esc(n.note_kind||"note")+'</b><span class="crm-small">'+new Date(n.at).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"})+' · '+esc(n.author||"")+'</span></div><div class="crm-note-body">'+esc(n.body||"")+'</div></div>';
    }).join(""):'<div class="empty">Aucune note de suivi.</div>';
  }
  function renderActions(){
    var el=document.querySelector("#crmActions");if(!el)return;ensureCrm();
    var rows=state.crm.actions.filter(function(a){return a.status==="open";}).sort(function(a,b){return String(a.due_at||"9999").localeCompare(String(b.due_at||"9999"));}).slice(0,20);
    el.innerHTML=rows.length?rows.map(function(a){
      var e=state.crm.entities.find(function(x){return x.id===a.entity_id;});
      return '<div class="crm-action-row"><div><b>'+esc(a.title)+'</b><div class="crm-small">'+esc(e?e.name:"")+" · "+esc(a.owner||"Équipe")+(a.kpi_result?' · KPI: '+esc(a.kpi_result):'')+'</div></div><div class="'+(a.due_at&&String(a.due_at).slice(0,10)<isoToday()?'crm-alert':'crm-small')+'">'+esc(a.due_at?String(a.due_at).slice(0,10):"Sans date")+'</div><button class="btn ghost" data-action-done="'+esc(a.id)+'">Fait</button></div>';
    }).join(""):'<div class="empty">Aucune action ouverte.</div>';
    document.querySelectorAll("[data-action-done]").forEach(function(b){b.onclick=function(){
      var a=state.crm.actions.find(function(x){return x.id===b.dataset.actionDone;});if(!a)return;a.status="done";a.completed_at=new Date().toISOString();save();renderCRM();
    };});
  }
  function renderSubscribers(){
    var el=document.querySelector("#crmSubscribers");if(!el)return;ensureCrm();
    el.innerHTML=state.crm.digest_subscribers.length?'<div class="crm-subs">'+state.crm.digest_subscribers.map(function(s){
      return '<label class="crm-sub-pill"><input type="checkbox" data-sub-toggle="'+esc(s.email)+'" '+(s.active!==false?'checked':'')+'> <span>'+esc(s.display_name||s.email)+'</span></label>';
    }).join("")+'</div>':'<div class="empty">Aucun destinataire configuré.</div>';
    document.querySelectorAll("[data-sub-toggle]").forEach(function(x){x.onchange=function(){var s=state.crm.digest_subscribers.find(function(v){return v.email===x.dataset.subToggle;});if(s){s.active=x.checked;save();}};});
  }
  function renderEntitySelectors(){
    ensureCrm();var opts='<option value="">Tous les contacts</option>'+state.crm.entities.filter(function(e){return e.status!=="archived";}).sort(function(a,b){return a.name.localeCompare(b.name);}).map(function(e){return '<option value="'+esc(e.id)+'">'+esc(e.name)+'</option>';}).join("");
    ["crmNoteEntity"].forEach(function(id){var el=document.querySelector("#"+id);if(!el)return;var v=el.value;el.innerHTML=opts;if(v)el.value=v;});
  }
  function renderCRM(){
    ensureCrm();
    renderEntitySelectors();renderCrmTable();renderCrmKpis();renderRegions();renderNotes();renderActions();renderSubscribers();
  }
  function openEntity(id){
    ensureCrm();var e=state.crm.entities.find(function(x){return x.id===id;});if(!e)return;
    var set=function(id,v){var el=document.querySelector("#"+id);if(el)el.value=v==null?"":v;};
    set("crmEntityId",e.id);set("crmName",e.name);set("crmKind",e.entity_kind||"establishment");updateSubtype();set("crmSubtype",e.entity_kind==="professional"?e.professional_type:e.establishment_type);
    set("crmRegion",e.region_name);set("crmDepartment",e.department_code);set("crmCity",e.city);set("crmStage",e.pipeline_stage);set("crmOwner",e.owner);set("crmValue",e.estimated_value);set("crmPriority",e.priority);set("crmSource",e.source);set("crmEmail",e.email);set("crmPhone",e.phone);set("crmNext",e.next_action);set("crmNextDate",e.next_action_at?String(e.next_action_at).slice(0,10):"");
    var noteSel=document.querySelector("#crmNoteEntity");if(noteSel){noteSel.value=e.id;renderNotes();}
    var msg=document.querySelector("#crmFormStatus");if(msg)msg.textContent="Fiche ouverte · "+e.name;
    document.querySelector("#crmEntityForm")?.scrollIntoView({behavior:"smooth",block:"start"});
  }
  function resetEntityForm(){
    ["crmEntityId","crmName","crmDepartment","crmCity","crmValue","crmSource","crmEmail","crmPhone","crmNext","crmNextDate"].forEach(function(id){var el=document.querySelector("#"+id);if(el)el.value="";});
    var kind=document.querySelector("#crmKind");if(kind)kind.value="establishment";updateSubtype();
    var region=document.querySelector("#crmRegion");if(region)region.value="Provence-Alpes-Côte d’Azur";
    var stage=document.querySelector("#crmStage");if(stage)stage.value="Cible";
    var owner=document.querySelector("#crmOwner");if(owner)owner.value=CURRENT_USER.name==="Ugo"?"Ugo":CURRENT_USER.name;
    var pr=document.querySelector("#crmPriority");if(pr)pr.value="normal";
    var msg=document.querySelector("#crmFormStatus");if(msg)msg.textContent="";
  }
  function saveEntity(){
    ensureCrm();var get=function(id){return document.querySelector("#"+id)?.value||"";};
    var id=get("crmEntityId");var stage=get("crmStage");var status="active";var next=get("crmNext").trim();
    var msg=document.querySelector("#crmFormStatus");
    if(!get("crmName").trim()){if(msg)msg.innerHTML='<span class="crm-alert">Nom obligatoire.</span>';return;}
    if(!["Gagné","Perdu"].includes(stage)&&!next){if(msg)msg.innerHTML='<span class="crm-alert">Une prochaine action est obligatoire pour tout prospect actif.</span>';return;}
    var kind=get("crmKind");var now=new Date().toISOString();
    var e=id?state.crm.entities.find(function(x){return x.id===id;}):null;
    if(!e){e={id:crypto.randomUUID(),created_at:now};state.crm.entities.push(e);}
    Object.assign(e,{name:get("crmName").trim(),entity_kind:kind,establishment_type:kind==="establishment"?get("crmSubtype"):null,professional_type:kind==="professional"?get("crmSubtype"):null,region_name:get("crmRegion"),department_code:get("crmDepartment").trim(),city:get("crmCity").trim(),country:"France",pipeline_stage:stage,status:status,owner:get("crmOwner"),source:get("crmSource").trim(),estimated_value:Number(get("crmValue")||0),priority:get("crmPriority"),email:get("crmEmail").trim(),phone:get("crmPhone").trim(),next_action:next,next_action_at:get("crmNextDate")||null,updated_at:now});
    if(next){
      var previous=state.crm.actions.find(function(a){return a.entity_id===e.id&&a.status==="open"&&a.title===next;});
      if(!previous)state.crm.actions.push({id:crypto.randomUUID(),entity_id:e.id,owner:e.owner,title:next,due_at:e.next_action_at,kpi_result:"Prochaine étape réalisée / issue documentée",status:"open",created_at:now});
    }
    state.activity.push({at:now,text:"CRM · fiche "+e.name+" mise à jour · "+stage});
    save();renderCRM();renderKpis();if(msg)msg.innerHTML='<span class="crm-ok">Fiche enregistrée et synchronisée.</span>';
  }
  function addFollowup(){
    ensureCrm();var sel=document.querySelector("#crmNoteEntity"),txt=document.querySelector("#crmNoteText"),kind=document.querySelector("#crmNoteKind");
    var entity=state.crm.entities.find(function(e){return e.id===sel?.value;});var body=(txt?.value||"").trim();var msg=document.querySelector("#crmNoteStatus");
    if(!entity||!body){if(msg)msg.innerHTML='<span class="crm-alert">Sélectionnez un contact et saisissez une note.</span>';return;}
    var now=new Date().toISOString();var journaled=document.querySelector("#crmJournalize")?.checked!==false;
    var next=(document.querySelector("#crmFollowNext")?.value||"").trim();var due=document.querySelector("#crmFollowDate")?.value||null;var kpi=(document.querySelector("#crmFollowKpi")?.value||"").trim();
    var note={id:crypto.randomUUID(),entity_id:entity.id,author:CURRENT_USER.name,note_kind:kind.value,body:body,journaled:journaled,at:now};
    state.crm.notes.push(note);entity.last_contact_at=now;entity.updated_at=now;
    if(next){
      entity.next_action=next;entity.next_action_at=due;
      state.crm.actions.push({id:crypto.randomUUID(),entity_id:entity.id,owner:entity.owner||CURRENT_USER.name,title:next,due_at:due,kpi_result:kpi||"Résultat documenté",status:"open",created_at:now});
    }
    if(journaled){
      state.journal.push({id:crypto.randomUUID(),date:isoToday(),at:now,author:CURRENT_USER.name,kind:kind.value==="blocker"?"blocker":kind.value==="decision"?"decision":"note",text:"Suivi CRM · "+entity.name+" — "+body+(next?"\\nProchaine action : "+next+(due?" · "+due:""):"")});
    }
    state.activity.push({at:now,text:"CRM · "+entity.name+" · "+body.slice(0,260)});
    txt.value="";var n=document.querySelector("#crmFollowNext");if(n)n.value="";var d=document.querySelector("#crmFollowDate");if(d)d.value="";var k=document.querySelector("#crmFollowKpi");if(k)k.value="";
    save();renderCRM();renderJournal();renderActivity();renderKpis();if(msg)msg.innerHTML='<span class="crm-ok">Suivi enregistré'+(journaled?" et ajouté au journal.":".")+'</span>';
  }
  function addSubscriber(){
    ensureCrm();var email=(document.querySelector("#crmSubscriberEmail")?.value||"").trim().toLowerCase();var name=(document.querySelector("#crmSubscriberName")?.value||"").trim();
    var msg=document.querySelector("#crmSubscriberStatus");if(!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)){if(msg)msg.innerHTML='<span class="crm-alert">Adresse e-mail invalide.</span>';return;}
    var s=state.crm.digest_subscribers.find(function(x){return x.email===email;});if(s){s.active=true;s.display_name=name||s.display_name;}else state.crm.digest_subscribers.push({email:email,display_name:name,active:true});
    document.querySelector("#crmSubscriberEmail").value="";document.querySelector("#crmSubscriberName").value="";save();renderSubscribers();if(msg)msg.innerHTML='<span class="crm-ok">Destinataire ajouté.</span>';
  }
  function initControls(){
    fillSelect("crmRegion",REGIONS,false);fillSelect("crmRegionFilter",REGIONS,true,"Toutes les régions");fillSelect("crmStage",STAGES,false);fillSelect("crmStageFilter",STAGES,true,"Toutes les étapes");fillSelect("crmOwner",OWNERS,false);fillSelect("crmOwnerFilter",OWNERS,true,"Tous responsables");updateSubtype();
    var kind=document.querySelector("#crmKind");if(kind)kind.onchange=updateSubtype;
    ["crmSearch","crmRegionFilter","crmKindFilter","crmStageFilter","crmOwnerFilter"].forEach(function(id){var el=document.querySelector("#"+id);if(el)el.oninput=renderCrmTable;});
    var noteEntity=document.querySelector("#crmNoteEntity");if(noteEntity)noteEntity.onchange=renderNotes;
    document.querySelector("#crmSaveEntity")?.addEventListener("click",saveEntity);
    document.querySelector("#crmResetEntity")?.addEventListener("click",resetEntityForm);
    document.querySelector("#crmAddFollowup")?.addEventListener("click",addFollowup);
    document.querySelector("#crmAddSubscriber")?.addEventListener("click",addSubscriber);
  }

  ensureCrm();
  var oldRenderAll=renderAll;
  renderAll=function(){oldRenderAll();ensureCrm();renderCRM();};
  var oldRenderKpis=renderKpis;
  renderKpis=function(){oldRenderKpis();renderCrmKpis();};
  initControls();resetEntityForm();renderCRM();renderKpis();
})();