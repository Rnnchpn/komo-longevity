const API="https://uqlolefsiktbznnymriy.supabase.co/functions/v1/gstaad-state";
const labels={chalet:"Chalet",hotel:"Hotel + Spa",shop:"Luxury / Social",person:"People"};
const codes={chalet:"CH",hotel:"H",shop:"S",person:"P"};
const SESSION_TOKEN="komo:gstaad:session";
const SESSION_EXPIRY="komo:gstaad:expiry";
const LEGACY_KEYS=["komo-gstaad-winter-crm-v2","komo-gstaad-winter-crm-v1"];
let targets=[],token=sessionStorage.getItem(SESSION_TOKEN)||"",currentUser=null;
let activeCategory="chalet",activeStatus="all",query="",activeId=null,mapMode="all",pollTimer=null,syncing=false,noteTimer=null;

const list=document.getElementById("targetList");
const layer=document.getElementById("poiLayer");
const detail=document.getElementById("detailCard");
const gate=document.getElementById("authGate");
const notesField=document.getElementById("notesField");
const connectionLine=document.querySelector(".connection-line");

const esc=v=>String(v||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const statusLabel=s=>({target:"Target",introduced:"Introduced",contacted:"Contacted",met:"Met",partner:"Partner",active:"Active",hold:"Hold"})[s]||"Target";
const findTarget=id=>targets.find(t=>t.id===id);

function basicEncode(value){
  const bytes=new TextEncoder().encode(value);
  let binary="";
  for(const b of bytes) binary+=String.fromCharCode(b);
  return btoa(binary);
}
async function request(method,body,authorization){
  const headers={};
  const auth=authorization||(token?"Bearer "+token:"");
  if(auth)headers.Authorization=auth;
  if(body!==undefined)headers["Content-Type"]="application/json";
  const res=await fetch(API,{method,headers,body:body===undefined?undefined:JSON.stringify(body),cache:"no-store"});
  let data={};
  try{data=await res.json()}catch{}
  if(!res.ok){
    const error=new Error(data.error||("http_"+res.status));
    error.status=res.status;
    throw error;
  }
  return data;
}
function clearSession(){
  token="";currentUser=null;
  sessionStorage.removeItem(SESSION_TOKEN);
  sessionStorage.removeItem(SESSION_EXPIRY);
}
function showGate(message=""){
  if(pollTimer){clearInterval(pollTimer);pollTimer=null}
  gate.hidden=false;
  document.getElementById("authError").textContent=message;
  setTimeout(()=>document.getElementById("authUser")?.focus(),30);
}
function hideGate(){gate.hidden=true}
function updateConnection(state,label){
  connectionLine.classList.remove("syncing","error");
  if(state)connectionLine.classList.add(state);
  document.getElementById("syncStatus").lastChild.textContent=label||"Supabase shared state";
}
function setIdentity(){
  const label=currentUser?(currentUser.display_name||currentUser.username)+" · "+currentUser.role:"Secure cloud";
  document.getElementById("syncUser").textContent=label;
}
function filtered(){
  return targets.filter(t=>{
    const categoryOk=t.type===activeCategory;
    const statusOk=activeStatus==="all"||t.status===activeStatus||(activeStatus==="partner"&&t.status==="active");
    const hay=(t.name+" "+t.subtitle+" "+t.address+" "+t.objective).toLowerCase();
    return categoryOk&&statusOk&&(!query||hay.includes(query.toLowerCase()));
  });
}
function render(){
  const visible=filtered(),ids=new Set(visible.map(t=>t.id));
  document.getElementById("resultCount").textContent=String(visible.length);
  list.innerHTML=visible.length?visible.map(t=>'<button class="target-row '+(activeId===t.id?'active':'')+'" data-target-id="'+esc(t.id)+'" data-type="'+esc(t.type)+'"><span class="target-icon">'+codes[t.type]+'</span><span class="target-copy"><strong>'+esc(t.name)+'</strong><small>'+esc(t.subtitle)+'</small></span><span class="status-badge" data-status="'+esc(t.status)+'">'+esc(statusLabel(t.status))+'</span></button>').join(""):'<div class="empty"><strong>No target here.</strong><span>Change category, status or search.</span></div>';
  layer.innerHTML=targets.filter(t=>t.type===activeCategory).map(t=>{
    const dim=!ids.has(t.id)||(mapMode==="priority"&&t.priority!=="P1");
    return '<button class="poi '+(activeId===t.id?'active ':'')+(dim?'dim':'')+'" data-poi-id="'+esc(t.id)+'" data-priority="'+esc(t.priority)+'" data-type="'+esc(t.type)+'" style="left:'+Number(t.x)+'%;top:'+Number(t.y)+'%" aria-label="'+esc(t.name)+'"><span class="poi-pin">'+codes[t.type]+'</span><span class="poi-label">'+esc(t.name)+'</span></button>';
  }).join("");
  document.querySelectorAll("[data-target-id]").forEach(el=>el.onclick=()=>openTarget(el.dataset.targetId));
  document.querySelectorAll("[data-poi-id]").forEach(el=>el.onclick=()=>openTarget(el.dataset.poiId));
}
function updateStats(){
  document.getElementById("statTargets").textContent=String(targets.length);
  document.getElementById("statIntroduced").textContent=String(targets.filter(t=>t.status==="introduced").length);
  document.getElementById("statMet").textContent=String(targets.filter(t=>t.status==="met").length);
  document.getElementById("statPartners").textContent=String(targets.filter(t=>t.status==="partner"||t.status==="active").length);
  document.getElementById("validatedCount").textContent=String(targets.filter(t=>["met","partner","active"].includes(t.status)).length);
}
function refreshDetail(preserveNote=false){
  const t=findTarget(activeId);if(!t)return;
  document.getElementById("detailType").textContent=(labels[t.type]||t.type).toUpperCase();
  document.getElementById("detailPriority").textContent=t.priority;
  document.getElementById("detailName").textContent=t.name;
  document.getElementById("detailSubtitle").textContent=t.subtitle;
  document.getElementById("detailAddress").textContent=t.address;
  document.getElementById("detailObjective").textContent=t.objective;
  document.getElementById("detailNext").textContent=t.next_action||"";
  document.getElementById("statusSelect").value=t.status||"target";
  if(!preserveNote)notesField.value=t.note||"";
  const directions=document.getElementById("directionsButton");
  directions.href="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(t.address);
  const phone=document.getElementById("phoneButton");
  if(t.phone){phone.classList.remove("hidden");phone.href="tel:"+t.phone}else{phone.classList.add("hidden");phone.removeAttribute("href")}
  const web=document.getElementById("websiteButton");
  if(t.website){web.classList.remove("hidden");web.href=t.website}else{web.classList.add("hidden");web.removeAttribute("href")}
}
function openTarget(id){
  if(!findTarget(id))return;
  activeId=id;detail.classList.add("open");refreshDetail(false);render();
}
function switchCategory(category){
  activeCategory=category;activeStatus="all";query="";
  document.getElementById("targetSearch").value="";
  document.querySelectorAll(".category-tab").forEach(b=>b.classList.toggle("active",b.dataset.category===category));
  document.querySelectorAll(".stat").forEach(b=>b.classList.toggle("active",b.dataset.statusFilter==="all"));
  activeId=(targets.find(t=>t.type===category)||{}).id||null;
  detail.classList.remove("open");render();
}
async function syncRemote(silent=false){
  if(!token||syncing)return;
  syncing=true;
  if(!silent)updateConnection("syncing","Syncing…");
  try{
    const data=await request("GET");
    targets=Array.isArray(data.targets)?data.targets:[];
    currentUser=data.user||currentUser;
    if(!activeId||!findTarget(activeId))activeId=(targets.find(t=>t.type===activeCategory)||targets[0]||{}).id||null;
    setIdentity();updateStats();render();
    if(detail.classList.contains("open")&&activeId)refreshDetail(document.activeElement===notesField);
    hideGate();
    document.getElementById("lastSync").textContent=new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"});
    updateConnection("","Live · 5 s sync");
  }catch(e){
    if(e.status===401){clearSession();showGate("Session expired. Sign in again.");}
    else updateConnection("error","Sync unavailable");
  }finally{syncing=false}
}
async function persist(id,patch){
  const t=findTarget(id);if(!t)return;
  Object.assign(t,patch,{updated_at:new Date().toISOString(),updated_by:currentUser?.username||"me"});
  updateStats();render();
  document.getElementById("saveState").textContent="Saving to Supabase…";
  try{
    const data=await request("PATCH",Object.assign({id},patch));
    const i=targets.findIndex(x=>x.id===id);if(i>=0&&data.target)targets[i]=data.target;
    updateStats();render();
    if(detail.classList.contains("open")&&activeId===id)refreshDetail(document.activeElement===notesField);
    document.getElementById("saveState").textContent="Saved · shared";
    updateConnection("","Live · 5 s sync");
  }catch(e){
    document.getElementById("saveState").textContent="Sync failed";
    updateConnection("error","Write failed");
    if(e.status===401){clearSession();showGate("Session expired. Sign in again.");}
    else setTimeout(()=>syncRemote(true),700);
  }
}
async function migrateLegacy(){
  if(localStorage.getItem("komo:gstaad:cloud-migrated")==="1")return;
  let legacy={};
  for(const key of LEGACY_KEYS){
    try{const value=JSON.parse(localStorage.getItem(key)||"{}");legacy=Object.assign(legacy,value||{})}catch{}
  }
  const updates=[];
  for(const [id,s] of Object.entries(legacy)){
    const remote=findTarget(id);
    if(!remote||!s)continue;
    const patch={};
    if(remote.status==="target"&&s.status&&s.status!=="target")patch.status=s.status;
    if(!remote.note&&s.note)patch.note=s.note;
    if(Object.keys(patch).length)updates.push(request("PATCH",Object.assign({id},patch)));
  }
  if(updates.length){
    try{await Promise.all(updates);await syncRemote(true)}catch{return}
  }
  LEGACY_KEYS.forEach(k=>localStorage.removeItem(k));
  localStorage.setItem("komo:gstaad:cloud-migrated","1");
}
function startPolling(){
  if(pollTimer)clearInterval(pollTimer);
  pollTimer=setInterval(()=>{if(document.visibilityState==="visible")syncRemote(true)},5000);
}

document.getElementById("authForm").addEventListener("submit",async e=>{
  e.preventDefault();
  const user=document.getElementById("authUser").value.trim().toLowerCase();
  const pass=document.getElementById("authPassword").value;
  const submit=document.getElementById("authSubmit"),error=document.getElementById("authError");
  if(!user||!pass)return;
  submit.disabled=true;error.textContent="";
  try{
    const data=await request("POST",undefined,"Basic "+basicEncode(user+":"+pass));
    token=data.token;currentUser=data.user;
    sessionStorage.setItem(SESSION_TOKEN,token);
    sessionStorage.setItem(SESSION_EXPIRY,data.expires_at||"");
    document.getElementById("authPassword").value="";
    await syncRemote(false);await migrateLegacy();startPolling();
  }catch(err){
    error.textContent=err.status===401?"Incorrect Command credentials.":"Secure connection unavailable.";
  }finally{submit.disabled=false}
});
document.getElementById("logoutBtn").onclick=async()=>{
  try{if(token)await request("DELETE")}catch{}
  clearSession();targets=[];activeId=null;updateStats();render();showGate("");
};
document.querySelectorAll(".category-tab").forEach(btn=>btn.onclick=()=>switchCategory(btn.dataset.category));
document.querySelectorAll(".stat").forEach(btn=>btn.onclick=()=>{
  activeStatus=btn.dataset.statusFilter;
  document.querySelectorAll(".stat").forEach(b=>b.classList.toggle("active",b===btn));
  detail.classList.remove("open");render();
});
document.querySelectorAll(".map-tool").forEach(btn=>btn.onclick=()=>{
  mapMode=btn.dataset.mapMode;
  document.querySelectorAll(".map-tool").forEach(b=>b.classList.toggle("active",b===btn));
  document.getElementById("mapStage").classList.toggle("priority-mode",mapMode==="priority");render();
});
document.getElementById("targetSearch").oninput=e=>{query=e.target.value.trim();detail.classList.remove("open");render()};
document.getElementById("detailClose").onclick=()=>detail.classList.remove("open");
document.getElementById("statusSelect").onchange=e=>{if(activeId)persist(activeId,{status:e.target.value})};
notesField.oninput=e=>{
  if(!activeId)return;clearTimeout(noteTimer);
  const id=activeId,value=e.target.value;
  document.getElementById("saveState").textContent="Editing…";
  noteTimer=setTimeout(()=>persist(id,{note:value}),550);
};
document.getElementById("clearNote").onclick=()=>{if(!activeId)return;notesField.value="";persist(activeId,{note:""})};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&gate.hidden)detail.classList.remove("open")});
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"&&token)syncRemote(true)});

(async function boot(){
  updateStats();render();
  const expiry=sessionStorage.getItem(SESSION_EXPIRY);
  if(expiry&&Date.parse(expiry)<=Date.now())clearSession();
  if(!token){showGate("");return}
  await syncRemote(false);
  if(token){await migrateLegacy();startPolling()}
})();