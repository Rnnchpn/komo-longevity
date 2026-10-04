const targets=[
{id:"oyster",name:"Oyster Chalet — Gstaad",subtitle:"Private KŌMØ residence · winter base",category:"oyster",priority:"P1",x:73,y:64,address:"Gstaad, Switzerland · property TBC",objective:"Secure one chalet for Oyster operations",next:"Select the property, validate guest capacity and operating rules.",status:"target",phone:"",website:""},
{id:"lab",name:"KŌMØ Motion Lab — In Hotel",subtitle:"Identical modular in-hotel pop-up",category:"lab",priority:"P1",x:58,y:50,address:"Inside partner hotel · Gstaad",objective:"Install one reproducible Motion Lab inside the hotel",next:"Validate hotel space, footprint, low barriers, case-furniture layout and sensor pathway.",status:"target",phone:"",website:""},
{id:"palace",name:"Gstaad Palace",subtitle:"Luxury hotel · spa · concierge",category:"hotel",priority:"P1",x:60,y:39,address:"Palacestrasse 28, 3780 Gstaad",objective:"Concierge and management introduction",next:"Identify concierge, spa and management contacts.",status:"target",phone:"+41337485000",website:"https://www.palace.ch"},
{id:"alpina",name:"The Alpina Gstaad",subtitle:"Luxury hotel · Six Senses Spa",category:"hotel",priority:"P1",x:46,y:37,address:"Alpinastrasse 23, 3780 Gstaad",objective:"Wellness and hospitality partnership",next:"Qualify spa, concierge and guest-experience decision makers.",status:"target",phone:"+41338889888",website:"https://www.thealpinagstaad.ch"},
{id:"bellevue",name:"Le Grand Bellevue",subtitle:"Luxury hotel · spa",category:"hotel",priority:"P1",x:77,y:47,address:"Untergstaadstrasse 17, 3780 Gstaad",objective:"Concierge + wellness introduction",next:"Map concierge, spa director and general management.",status:"target",phone:"+41337480000",website:"https://www.bellevue-gstaad.ch"},
{id:"park",name:"Park Gstaad",subtitle:"Luxury hotel",category:"hotel",priority:"P2",x:42,y:61,address:"Wispilenstrasse 29, 3780 Gstaad",objective:"Hospitality target",next:"Identify decision-maker and winter activation opportunities.",status:"target",phone:"+41337489800",website:"https://www.parkgstaad.ch"},
{id:"ultima",name:"Ultima Gstaad",subtitle:"Private residence · spa & clinic",category:"hotel",priority:"P1",x:32,y:58,address:"Gsteigstrasse 70, 3780 Gstaad",objective:"Private wellness adjacency",next:"Explore concierge, clinic and residence collaboration.",status:"target",phone:"+41337480550",website:"https://www.ultimacollection.com"},
{id:"ermitage",name:"Ermitage Wellness & Spa",subtitle:"Wellness hotel",category:"hotel",priority:"P2",x:66,y:71,address:"Dorfstrasse 46, 3778 Schönried",objective:"Second-circle wellness target",next:"Introduce KŌMØ Motion to wellness leadership.",status:"target",phone:"+41337480430",website:"https://www.ermitage.ch"}
];
const BOUNDS={north:46.493,south:46.455,west:7.252,east:7.320};
const STORAGE_KEY="komo_gstaad_experience_v3";
let state={category:"all",status:"all",query:"",active:null,priority:false};
const layer=document.querySelector("#poiLayer"),list=document.querySelector("#targetList"),panel=document.querySelector("#detailPanel"),ops=document.querySelector("#operations");
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
function loadSaved(){try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")}catch{return {}}}
function saveSaved(v){localStorage.setItem(STORAGE_KEY,JSON.stringify(v))}
let saved=loadSaved();
targets.forEach(t=>{if(saved[t.id]){t.status=saved[t.id].status||t.status;t.notes=saved[t.id].notes||""}else t.notes=""});
function matches(t){const c=state.category==="all"||t.category===state.category;const s=state.status==="all"||t.status===state.status;const q=!state.query||(t.name+" "+t.subtitle+" "+t.address).toLowerCase().includes(state.query.toLowerCase());const p=!state.priority||t.priority==="P1";return c&&s&&q&&p}
function iconFor(t){return t.category==="oyster"?"O":t.category==="lab"?"M":"H"}
function render(){
 const shown=targets.filter(matches);
 document.querySelector("#resultCount").textContent=shown.length;
 document.querySelector("#statTargets").textContent=targets.length;
 document.querySelector("#statIntroduced").textContent=targets.filter(t=>t.status==="introduced"||t.status==="contacted").length;
 document.querySelector("#statMet").textContent=targets.filter(t=>t.status==="met").length;
 document.querySelector("#statPartners").textContent=targets.filter(t=>t.status==="partner"||t.status==="active").length;
 layer.innerHTML=targets.map((t,i)=>`<button class="poi ${state.active===t.id?"active":""} ${matches(t)?"":"dim"}" data-id="${t.id}" data-category="${t.category}" data-priority="${t.priority}" style="left:${t.x}%;top:${t.y}%"><span class="poi-mark"><span>${iconFor(t)}</span></span><span class="poi-label"><em>${String(i+1).padStart(2,"0")}</em>${esc(t.name)}</span></button>`).join("");
 list.innerHTML=shown.map(t=>{const i=targets.indexOf(t);return `<button class="target-row ${state.active===t.id?"active":""}" data-id="${t.id}"><span class="target-index">${String(i+1).padStart(2,"0")}</span><span class="target-copy"><strong>${esc(t.name)}</strong><small>${esc(t.subtitle)}</small></span><span class="target-priority" data-priority="${t.priority}">${t.priority}</span></button>`}).join("")||'<div style="padding:18px 10px;font:11px Georgia,serif;color:#888">No matching target.</div>';
 document.querySelectorAll("[data-id]").forEach(el=>el.addEventListener("click",()=>openTarget(el.dataset.id)));
}
function openTarget(id){
 const t=targets.find(x=>x.id===id);if(!t)return;state.active=id;panel.classList.remove("closed");
 document.querySelector("#detailType").textContent=t.category==="oyster"?"OYSTER CHALET":t.category==="lab"?"MOTION LAB · IN HOTEL":"HOTEL";
 document.querySelector("#detailPriority").textContent=t.priority;
 document.querySelector("#detailName").textContent=t.name;
 document.querySelector("#detailSubtitle").textContent=t.subtitle;
 document.querySelector("#detailAddress").textContent=t.address;
 document.querySelector("#detailObjective").textContent=t.objective;
 document.querySelector("#detailNext").textContent=t.next;
 document.querySelector("#detailVisualLabel").textContent=t.category==="lab"?"KŌMØ MOTION LAB · IN-HOTEL":t.name.toUpperCase();
 const phone=document.querySelector("#phoneButton");if(t.phone){phone.classList.remove("hidden");phone.href="tel:"+t.phone}else phone.classList.add("hidden");
 const web=document.querySelector("#websiteButton");if(t.website){web.classList.remove("hidden");web.href=t.website}else web.classList.add("hidden");
 document.querySelector("#directionsButton").href="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(t.address.replace(" · property TBC","").replace("Inside partner hotel · ",""));
 document.querySelector("#labConcept").classList.toggle("hidden",t.category!=="lab");
 document.querySelector("#statusSelect").value=t.status;
 document.querySelector("#notesField").value=t.notes||"";
 render();
}
function persistActive(){
 const t=targets.find(x=>x.id===state.active);if(!t)return;
 t.status=document.querySelector("#statusSelect").value;
 t.notes=document.querySelector("#notesField").value;
 saved[t.id]={status:t.status,notes:t.notes};saveSaved(saved);document.querySelector("#saveState").textContent="Saved locally";render()
}
document.querySelectorAll(".category-tab").forEach(b=>b.addEventListener("click",()=>{state.category=b.dataset.category;document.querySelectorAll(".category-tab").forEach(x=>x.classList.toggle("active",x===b));render()}));
document.querySelectorAll(".stat").forEach(b=>b.addEventListener("click",()=>{state.status=b.dataset.statusFilter;document.querySelectorAll(".stat").forEach(x=>x.classList.toggle("active",x===b));render()}));
document.querySelector("#targetSearch").addEventListener("input",e=>{state.query=e.target.value.trim();render()});
document.querySelector("#operationsToggle").addEventListener("click",()=>{ops.classList.toggle("collapsed");document.querySelector("#operationsToggle").textContent=ops.classList.contains("collapsed")?"+":"−"});
document.querySelector("#detailClose").addEventListener("click",()=>{panel.classList.add("closed");state.active=null;render()});
document.querySelector("#statusSelect").addEventListener("change",persistActive);
document.querySelector("#notesField").addEventListener("input",()=>{document.querySelector("#saveState").textContent="Saving…";clearTimeout(window.__saveTimer);window.__saveTimer=setTimeout(persistActive,350)});
document.querySelector("#clearNote").addEventListener("click",()=>{document.querySelector("#notesField").value="";persistActive()});
document.querySelector("#priorityBtn").addEventListener("click",e=>{state.priority=!state.priority;e.currentTarget.classList.toggle("active",state.priority);document.querySelector("#mapStage").classList.toggle("priority-mode",state.priority);render()});
document.querySelector("#resetBtn").addEventListener("click",()=>{state={category:"all",status:"all",query:"",active:null,priority:false};document.querySelector("#targetSearch").value="";document.querySelectorAll(".category-tab").forEach(b=>b.classList.toggle("active",b.dataset.category==="all"));document.querySelectorAll(".stat").forEach(b=>b.classList.toggle("active",b.dataset.statusFilter==="all"));document.querySelector("#priorityBtn").classList.remove("active");document.querySelector("#mapStage").classList.remove("priority-mode");document.querySelector("#userPosition").hidden=true;panel.classList.add("closed");render()});
function projectPosition(lat,lon){const x=((lon-BOUNDS.west)/(BOUNDS.east-BOUNDS.west))*100;const y=((BOUNDS.north-lat)/(BOUNDS.north-BOUNDS.south))*100;return{x,y,inside:x>=0&&x<=100&&y>=0&&y<=100}}
document.querySelector("#locateBtn").addEventListener("click",()=>{const p=document.querySelector("#userPosition");if(!navigator.geolocation){p.hidden=false;p.querySelector("span").textContent="Location unavailable";return}navigator.geolocation.getCurrentPosition(({coords})=>{const q=projectPosition(coords.latitude,coords.longitude);p.hidden=false;p.style.left=(q.inside?q.x:50)+"%";p.style.top=(q.inside?q.y:78)+"%";p.querySelector("span").textContent=q.inside?"You are here":"Outside Gstaad map"},()=>{p.hidden=false;p.style.left="50%";p.style.top="78%";p.querySelector("span").textContent="Location permission required"},{enableHighAccuracy:true,timeout:7000,maximumAge:30000})});
document.querySelectorAll(".fleet-unit").forEach(b=>b.addEventListener("click",()=>{document.querySelector("#fleetDock").classList.add("pulse");setTimeout(()=>document.querySelector("#fleetDock").classList.remove("pulse"),260)}));
document.addEventListener("keydown",e=>{if(e.key==="Escape"){panel.classList.add("closed");state.active=null;render()}});
render();