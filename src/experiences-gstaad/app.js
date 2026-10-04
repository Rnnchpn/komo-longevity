const places=[
  {id:"palace",name:"Gstaad Palace",group:"Independent landmark hotel",phone:"+41 33 748 50 00",tel:"+41337485000",address:"Palacestrasse 28, 3780 Gstaad",type:["hotel","wellness"],priority:"P1",relationship:"Target",next:"Concierge introduction",note:"Priority property for the first Gstaad deployment. Build concierge access before the winter opening sequence.",x:56,y:42},
  {id:"alpina",name:"The Alpina Gstaad",group:"Luxury hotel · Six Senses Spa",phone:"+41 33 888 98 88",tel:"+41338889888",address:"Alpinastrasse 23, 3780 Gstaad",type:["hotel","wellness"],priority:"P1",relationship:"Target",next:"Spa / wellness introduction",note:"High strategic fit for KŌMØ Experience: luxury hospitality, wellness and international clientele.",x:76,y:59},
  {id:"bellevue",name:"Le Grand Bellevue",group:"Luxury hotel · Le Grand Spa",phone:"+41 33 748 00 00",tel:"+41337480000",address:"Untergstaadstrasse 17, 3780 Saanen",type:["hotel","wellness"],priority:"P1",relationship:"Target",next:"Concierge + spa contact",note:"Strong wellness positioning and central visibility. Priority for a curated hotel partnership conversation.",x:77,y:40},
  {id:"park",name:"Park Gstaad",group:"Luxury hotel",phone:"+41 33 748 98 00",tel:"+41337489800",address:"Wispilenstrasse 29, 3780 Gstaad",type:["hotel"],priority:"P2",relationship:"Network",next:"Identify decision-maker",note:"Premium hospitality target. Qualify concierge, guest-relations and management access.",x:47,y:65},
  {id:"ultima",name:"Ultima Hotel Gstaad",group:"Private residence · Spa & Clinic",phone:"+41 33 748 05 50",tel:"+41337480550",address:"Gsteigstrasse 70, 3780 Gstaad",type:["hotel","wellness"],priority:"P1",relationship:"Target",next:"Clinic / concierge approach",note:"Direct affinity with private wellness and clinic services. Explore operational complementarity.",x:31,y:53},
  {id:"ermitage",name:"Ermitage Wellness & Spa Hotel",group:"Wellness & spa hotel",phone:"+41 33 748 04 30",tel:"+41337480430",address:"Dorfstrasse 46, 3778 Gstaad",type:["hotel","wellness"],priority:"P2",relationship:"Network",next:"Wellness team introduction",note:"Relevant wellness target in the wider Gstaad area. Keep in the second activation circle.",x:62,y:70}
];
const BOUNDS={north:46.493,south:46.455,west:7.252,east:7.320};
let active=places[0],activeFilter="all",query="",priorityMode=false;
const layer=document.querySelector("#poiLayer"),list=document.querySelector("#placeList"),panel=document.querySelector("#detailPanel");
const esc=s=>String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
const visiblePlaces=()=>places.filter(p=>(activeFilter==="all"||p.type.includes(activeFilter))&&p.name.toLowerCase().includes(query.toLowerCase()));

function render(){
  const shown=visiblePlaces();
  document.querySelector("#resultCount").textContent=shown.length+" place"+(shown.length===1?"":"s");
  layer.innerHTML=places.map((p,i)=>{
    const dim=!shown.includes(p);
    return `<button class="poi ${p.id===active.id?"active":""} ${dim?"dim":""}" data-priority="${p.priority}" style="left:${p.x}%;top:${p.y}%;" data-id="${p.id}" aria-label="${esc(p.name)}"><span class="poi-building"></span><span class="poi-label"><em>0${i+1}</em>${esc(p.name)}</span></button>`
  }).join("");
  list.innerHTML=shown.map((p)=> {
    const i=places.indexOf(p);
    return `<button class="place-row ${p.id===active.id?"active":""}" data-id="${p.id}"><span class="place-num">0${i+1}</span><span class="place-copy"><strong>${esc(p.name)}</strong><small>${p.type.includes("wellness")?"Hotel · Wellness":"Hotel"}</small></span><span class="place-priority" data-priority="${p.priority}">${p.priority}</span></button>`
  }).join("") || '<div style="padding:20px 10px;font:12px Georgia,serif;color:#888">No place found.</div>';
  document.querySelectorAll("[data-id]").forEach(el=>el.addEventListener("click",()=>select(el.dataset.id)));
}

function select(id){
  const p=places.find(x=>x.id===id); if(!p)return; active=p; panel.classList.remove("closed");
  document.querySelector("#panelName").textContent=p.name;
  document.querySelector("#panelGroup").textContent=p.group;
  document.querySelector("#panelCategory").textContent=p.type.includes("wellness")?"HOTEL · WELLNESS":"HOTEL";
  document.querySelector("#panelPriority").textContent=p.priority;
  document.querySelector("#panelPriority").style.opacity=p.priority==="P1"?"1":".62";
  const ph=document.querySelector("#panelPhone"); ph.textContent=p.phone; ph.href="tel:"+p.tel;
  document.querySelector("#panelAddress").textContent=p.address;
  document.querySelector("#conciergeButton").href="tel:"+p.tel;
  document.querySelector("#directionsButton").href="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(p.address);
  document.querySelector("#relationship").textContent=p.relationship;
  document.querySelector("#nextAction").textContent=p.next;
  document.querySelector("#fieldNote").textContent=p.note;
  document.querySelector("#networkStatus").textContent=p.priority==="P1"?"PRIORITY":"TO DEVELOP";
  document.querySelector("#visualLabel").textContent=p.name.toUpperCase();
  document.querySelector("#panelIndex").textContent=String(places.indexOf(p)+1).padStart(2,"0")+" / "+String(places.length).padStart(2,"0");
  render();
}

document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b===btn));
  activeFilter=btn.dataset.filter; render();
}));
document.querySelector("#placeSearch").addEventListener("input",e=>{query=e.target.value.trim();render()});
document.querySelector("#panelClose").addEventListener("click",()=>panel.classList.add("closed"));
document.querySelector("#collapseExplorer").addEventListener("click",()=>{
  const explorer=document.querySelector(".explorer");
  explorer.classList.toggle("collapsed");
  document.querySelector("#collapseExplorer").textContent=explorer.classList.contains("collapsed")?"+":"−";
});
document.querySelectorAll(".map-mode").forEach(btn=>btn.addEventListener("click",()=>{
  document.querySelectorAll(".map-mode").forEach(b=>b.classList.toggle("active",b===btn));
  priorityMode=btn.dataset.mode==="priority";
  document.querySelector(".map-stage").classList.toggle("priority-mode",priorityMode);
}));
document.querySelector("#resetBtn").addEventListener("click",()=>{
  activeFilter="all";query="";priorityMode=false;
  document.querySelector("#placeSearch").value="";
  document.querySelectorAll(".filter").forEach((b,i)=>b.classList.toggle("active",i===0));
  document.querySelectorAll(".map-mode").forEach((b,i)=>b.classList.toggle("active",i===0));
  document.querySelector(".map-stage").classList.remove("priority-mode");
  document.querySelector("#userPosition").hidden=true;
  select("palace");
});

function projectPosition(lat,lon){
  const x=((lon-BOUNDS.west)/(BOUNDS.east-BOUNDS.west))*100;
  const y=((BOUNDS.north-lat)/(BOUNDS.north-BOUNDS.south))*100;
  return {x,y,inside:x>=0&&x<=100&&y>=0&&y<=100};
}
document.querySelector("#locateBtn").addEventListener("click",()=>{
  const pos=document.querySelector("#userPosition");
  if(!navigator.geolocation){pos.hidden=false;pos.querySelector("span").textContent="Location unavailable";return}
  navigator.geolocation.getCurrentPosition(({coords})=>{
    const p=projectPosition(coords.latitude,coords.longitude);
    pos.hidden=false;
    if(p.inside){
      pos.style.left=p.x+"%";pos.style.top=p.y+"%";
      pos.querySelector("span").textContent="You are here";
    }else{
      pos.style.left="50%";pos.style.top="78%";
      pos.querySelector("span").textContent="Outside Gstaad map";
    }
  },()=>{
    pos.hidden=false;pos.style.left="50%";pos.style.top="78%";pos.querySelector("span").textContent="Location permission required";
  },{enableHighAccuracy:true,timeout:7000,maximumAge:30000});
});
document.addEventListener("keydown",e=>{
  if(e.key==="Escape") panel.classList.add("closed");
  if(e.key==="ArrowDown"||e.key==="ArrowRight"){const i=(places.indexOf(active)+1)%places.length;select(places[i].id)}
  if(e.key==="ArrowUp"||e.key==="ArrowLeft"){const i=(places.indexOf(active)-1+places.length)%places.length;select(places[i].id)}
});
render();select("palace");