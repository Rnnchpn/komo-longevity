const targets=[
  {id:"chalet-base",type:"chalet",name:"KŌMØ House — Gstaad",subtitle:"Operational base · private chalet",address:"Gstaad · exact property TBC",objective:"Secure the winter operating base and define the hospitality / assessment zones.",priority:"P1",next:"Shortlist 3 chalets, inspect usable rooms, access, parking and equipment storage.",x:43,y:62},
  {id:"alpina",type:"hotel",name:"The Alpina Gstaad",subtitle:"5★ · Six Senses Spa",address:"Alpinastrasse 23, 3780 Gstaad",objective:"Hotel + spa partnership · concierge access · wellness introductions.",priority:"P1",next:"Request concierge and spa director introduction before winter opening.",phone:"+41338889888",website:"https://www.thealpinagstaad.ch/",x:70,y:38},
  {id:"bellevue",type:"hotel",name:"Le Grand Bellevue",subtitle:"5★ · Le Grand Spa",address:"Hauptstrasse 17-21, 3780 Gstaad",objective:"Hotel + spa partnership · guest referrals · discreet in-hotel activation.",priority:"P1",next:"Meet concierge / guest relations and spa management.",phone:"+41337480000",website:"https://bellevue-gstaad.ch/",x:64,y:49},
  {id:"ultima",type:"hotel",name:"Ultima Hotel Gstaad",subtitle:"5★ · Spa & private wellness",address:"Gsteigstrasse 70, 3780 Gstaad",objective:"Private wellness partnership · concierge and residence clientele.",priority:"P1",next:"Approach concierge and spa team; qualify private-residence activation.",phone:"+41337480550",website:"https://www.ultima-collection.com/",x:33,y:65},
  {id:"palace",type:"hotel",name:"Gstaad Palace",subtitle:"5★ · Palace Spa",address:"Palacestrasse 28, 3780 Gstaad",objective:"Institutional luxury hotel target · concierge network · private clientele.",priority:"P1",next:"Secure concierge / guest-relations introduction and map key seasonal contacts.",phone:"+41337485000",website:"https://www.palace.ch/",x:59,y:39},

  {id:"hermes",type:"shop",name:"Hermès Gstaad",subtitle:"Luxury fashion · leather goods",address:"Suterstrasse, 3780 Gstaad",objective:"Identify senior sales advisor / personal clienteling contact.",priority:"P1",next:"Visit in person and qualify the advisor with the strongest seasonal client book.",phone:"+41337444321",website:"https://www.hermes.com/",x:54,y:49},
  {id:"lv",type:"shop",name:"Louis Vuitton Gstaad",subtitle:"Luxury leather goods · fashion",address:"Promenade 50, 3780 Gstaad",objective:"Identify clienteling / VIC relationship contact.",priority:"P1",next:"Visit boutique and ask for the senior advisor covering recurring Gstaad clients.",phone:"+41442211100",website:"https://www.louisvuitton.com/",x:52,y:52},
  {id:"loro",type:"shop",name:"Loro Piana Gstaad",subtitle:"Luxury ready-to-wear",address:"Palacestrasse 4, 3780 Gstaad",objective:"Build relationship with high-trust client advisor.",priority:"P1",next:"In-person introduction and identify personal-shopping / VIC advisor.",phone:"+41337483585",website:"https://www.loropiana.com/",x:58,y:48},
  {id:"ralph",type:"shop",name:"Ralph Lauren Gstaad",subtitle:"Luxury ready-to-wear",address:"Promenade 23, 3780 Gstaad",objective:"Seasonal clienteling and introductions.",priority:"P1",next:"Visit boutique; identify longstanding advisor and Gstaad seasonal network.",phone:"+41337486550",website:"https://www.ralphlauren.com/",x:50,y:54},
  {id:"brunello",type:"shop",name:"Brunello Cucinelli",subtitle:"Luxury ready-to-wear",address:"Promenade 19, 3780 Gstaad",objective:"UHNW clienteling contact and warm introductions.",priority:"P1",next:"Meet boutique team and identify senior advisor / store management.",phone:"+41337449924",website:"https://shop.brunellocucinelli.com/",x:49,y:55},
  {id:"moncler",type:"shop",name:"Moncler Gstaad",subtitle:"Luxury alpine fashion",address:"Promenade 21, 3780 Gstaad",objective:"Seasonal luxury client network.",priority:"P1",next:"Visit boutique and identify senior client advisor.",phone:"+41337441570",website:"https://www.moncler.com/",x:50,y:56},
  {id:"valentino",type:"shop",name:"Valentino Gstaad",subtitle:"Luxury fashion · accessories",address:"Promenade 61, 3780 Gstaad",objective:"Clienteling and private-shopping introductions.",priority:"P2",next:"Qualify opening period and senior sales contact.",phone:"+41795379405",website:"https://www.valentino.com/",x:55,y:51},
  {id:"zadig",type:"shop",name:"Zadig & Voltaire",subtitle:"Premium fashion",address:"Gstaad Promenade, 3780 Gstaad",objective:"Secondary luxury retail network.",priority:"P2",next:"Visit during first retail walk and identify client advisor.",website:"https://zadig-et-voltaire.com/",x:47,y:55},
  {id:"lorenz",type:"shop",name:"Maison Lorenz Bach",subtitle:"Independent luxury fashion",address:"Gstaad, 3780 Saanen",objective:"Independent boutique network with strong local client intimacy.",priority:"P1",next:"Prioritise owner / senior advisor introduction.",x:46,y:53},
  {id:"club66",type:"shop",name:"CLUB 66",subtitle:"Fashion · jewellery · lifestyle",address:"Gstaad, 3780 Saanen",objective:"Local luxury lifestyle connector.",priority:"P1",next:"Meet owner / senior team and map recurring seasonal clients.",x:48,y:50},
  {id:"tonja",type:"shop",name:"Tonja Conceptstore",subtitle:"Concept store · lifestyle",address:"Gstaad, 3780 Saanen",objective:"Local style / lifestyle network and referrals.",priority:"P2",next:"Visit and qualify local influence.",x:51,y:48},
  {id:"marina",type:"shop",name:"Marina Anouilh",subtitle:"Concept store · fashion",address:"Gstaad, 3780 Saanen",objective:"Independent clienteling network.",priority:"P2",next:"Visit and identify owner / principal advisor.",x:53,y:47},
  {id:"chopard",type:"shop",name:"Chopard — Gstaad target",subtitle:"Jewellery · watches",address:"Gstaad, 3780 Saanen",objective:"High-value jewellery clienteling network.",priority:"P1",next:"Confirm current seasonal boutique setup and identify senior contact.",website:"https://www.chopard.com/",x:56,y:46},
  {id:"stebler",type:"shop",name:"Stebler Gstaad AG",subtitle:"Jewellery · watches",address:"Gstaad, 3780 Saanen",objective:"Local watch and jewellery relationship network.",priority:"P1",next:"Meet owner / principal advisor and qualify referral potential.",x:57,y:45},

  {id:"person-palace-concierge",type:"person",name:"Concierge Lead — Gstaad Palace",subtitle:"Hotel concierge · name to identify",address:"Gstaad Palace · Palacestrasse 28",objective:"Warm access to repeat guests, chalet owners and seasonal families.",priority:"P1",next:"Identify name, mobile / WhatsApp and preferred introduction route.",x:59,y:39},
  {id:"person-alpina-concierge",type:"person",name:"Concierge Lead — The Alpina",subtitle:"Hotel concierge · name to identify",address:"The Alpina Gstaad · Alpinastrasse 23",objective:"Warm access to hotel clientele and private wellness requests.",priority:"P1",next:"Identify head concierge / guest relations contact.",x:70,y:38},
  {id:"person-bellevue-concierge",type:"person",name:"Concierge Lead — Grand Bellevue",subtitle:"Hotel concierge · name to identify",address:"Le Grand Bellevue · Gstaad",objective:"Warm access to guests and spa clientele.",priority:"P1",next:"Identify concierge / guest-relations lead.",x:64,y:49},
  {id:"person-ultima-concierge",type:"person",name:"Concierge Lead — Ultima",subtitle:"Private hospitality · name to identify",address:"Ultima Hotel Gstaad · Gsteigstrasse 70",objective:"Access to residence-style guests and private requests.",priority:"P1",next:"Identify concierge / butler lead and direct contact route.",x:33,y:65},
  {id:"person-spa",type:"person",name:"Spa Directors — 4 priority hotels",subtitle:"Wellness decision-makers · names to identify",address:"Gstaad",objective:"Clinical / wellness operational partnerships.",priority:"P1",next:"Identify each spa director and create one contact card per person.",x:66,y:44},
  {id:"person-luxury-sales",type:"person",name:"Luxury Saleswomen — Promenade",subtitle:"Client advisors · personal shoppers · mobile sellers",address:"Gstaad Promenade",objective:"Build the high-trust referral layer around recurring seasonal clients.",priority:"P1",next:"During each boutique visit, capture the strongest advisor and who introduced us.",x:51,y:53},
  {id:"person-chalet",type:"person",name:"Private Chalet Concierges",subtitle:"Chalet managers · private concierge",address:"Gstaad / Saanenland",objective:"Access private chalets without relying only on hotels.",priority:"P1",next:"Create the first 10-name private concierge / chalet-manager list.",x:39,y:58},
  {id:"person-connectors",type:"person",name:"Local Connectors",subtitle:"Friends · residents · seasonal habitués",address:"Gstaad",objective:"Convert existing personal relationships into warm local introductions.",priority:"P1",next:"Enter known names and connect each person to hotels / shops they know.",x:45,y:47}
];

const typeLabels={chalet:"Chalet",hotel:"Hotel + Spa",shop:"Luxury retail",person:"People"};
const typeCodes={chalet:"CH",hotel:"H",shop:"S",person:"P"};
const storageKey="komo-gstaad-winter-crm-v1";
let saved={};
try{saved=JSON.parse(localStorage.getItem(storageKey)||"{}")}catch(e){saved={}}
let activeCategory="chalet",activeStatus="all",query="",activeId="chalet-base",mapMode="all";

const list=document.getElementById("targetList");
const layer=document.getElementById("poiLayer");
const detail=document.getElementById("detailCard");

function esc(value){
  return String(value||"").replace(/[&<>"']/g,function(m){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[m]});
}
function stateFor(id){
  return Object.assign({status:"target",note:""},saved[id]||{});
}
function persist(id,patch){
  saved[id]=Object.assign({},stateFor(id),patch);
  localStorage.setItem(storageKey,JSON.stringify(saved));
  updateStats();
}
function filtered(){
  return targets.filter(function(t){
    const state=stateFor(t.id);
    const categoryOk=t.type===activeCategory;
    const statusOk=activeStatus==="all"||state.status===activeStatus||(activeStatus==="partner"&&state.status==="active");
    const q=(t.name+" "+t.subtitle+" "+t.address+" "+t.objective).toLowerCase();
    const searchOk=!query||q.indexOf(query.toLowerCase())!==-1;
    return categoryOk&&statusOk&&searchOk;
  });
}
function statusLabel(status){
  return ({target:"Target",introduced:"Introduced",contacted:"Contacted",met:"Met",partner:"Partner",active:"Active",hold:"Hold"})[status]||"Target";
}
function render(){
  const visible=filtered();
  document.getElementById("resultCount").textContent=String(visible.length);
  list.innerHTML=visible.length?visible.map(function(t){
    const s=stateFor(t.id);
    return '<button class="target-row '+(activeId===t.id?'active':'')+'" data-target-id="'+esc(t.id)+'" data-type="'+esc(t.type)+'">'+
      '<span class="target-icon">'+typeCodes[t.type]+'</span>'+
      '<span class="target-copy"><strong>'+esc(t.name)+'</strong><small>'+esc(t.subtitle)+'</small></span>'+
      '<span class="status-badge" data-status="'+esc(s.status)+'">'+esc(statusLabel(s.status))+'</span>'+
    '</button>';
  }).join(""):'<div class="empty"><strong>No target here.</strong><span>Change category, status or search.</span></div>';

  const visibleIds=new Set(visible.map(function(t){return t.id}));
  layer.innerHTML=targets.filter(function(t){return t.type===activeCategory}).map(function(t){
    const isDim=!visibleIds.has(t.id)||(mapMode==="priority"&&t.priority!=="P1");
    return '<button class="poi '+(activeId===t.id?'active ':'')+(isDim?'dim':'')+'" data-poi-id="'+esc(t.id)+'" data-priority="'+esc(t.priority)+'" data-type="'+esc(t.type)+'" style="left:'+t.x+'%;top:'+t.y+'%" aria-label="'+esc(t.name)+'">'+
      '<span class="poi-pin">'+typeCodes[t.type]+'</span><span class="poi-label">'+esc(t.name)+'</span></button>';
  }).join("");

  document.querySelectorAll("[data-target-id]").forEach(function(el){el.addEventListener("click",function(){openTarget(el.dataset.targetId)})});
  document.querySelectorAll("[data-poi-id]").forEach(function(el){el.addEventListener("click",function(){openTarget(el.dataset.poiId)})});
}
function updateStats(){
  const states=targets.map(function(t){return stateFor(t.id).status});
  document.getElementById("statTargets").textContent=String(targets.length);
  document.getElementById("statIntroduced").textContent=String(states.filter(function(s){return s==="introduced"}).length);
  document.getElementById("statMet").textContent=String(states.filter(function(s){return s==="met"}).length);
  document.getElementById("statPartners").textContent=String(states.filter(function(s){return s==="partner"||s==="active"}).length);
  document.getElementById("validatedCount").textContent=String(states.filter(function(s){return ["met","partner","active"].indexOf(s)!==-1}).length);
}
function openTarget(id){
  const t=targets.find(function(item){return item.id===id});
  if(!t)return;
  activeId=id;
  const s=stateFor(id);
  document.getElementById("detailType").textContent=typeLabels[t.type].toUpperCase();
  document.getElementById("detailPriority").textContent=t.priority;
  document.getElementById("detailName").textContent=t.name;
  document.getElementById("detailSubtitle").textContent=t.subtitle;
  document.getElementById("detailAddress").textContent=t.address;
  document.getElementById("detailObjective").textContent=t.objective;
  document.getElementById("detailNext").textContent=t.next;
  document.getElementById("statusSelect").value=s.status;
  document.getElementById("notesField").value=s.note||"";

  const directions=document.getElementById("directionsButton");
  directions.href="https://www.google.com/maps/search/?api=1&query="+encodeURIComponent(t.address);
  const phone=document.getElementById("phoneButton");
  if(t.phone){phone.classList.remove("hidden");phone.href="tel:"+t.phone}else{phone.classList.add("hidden");phone.removeAttribute("href")}
  const web=document.getElementById("websiteButton");
  if(t.website){web.classList.remove("hidden");web.href=t.website}else{web.classList.add("hidden");web.removeAttribute("href")}

  detail.classList.add("open");
  render();
}
function switchCategory(category){
  activeCategory=category;activeStatus="all";query="";
  document.getElementById("targetSearch").value="";
  document.querySelectorAll(".category-tab").forEach(function(b){b.classList.toggle("active",b.dataset.category===category)});
  document.querySelectorAll(".stat").forEach(function(b){b.classList.toggle("active",b.dataset.statusFilter==="all")});
  const first=targets.find(function(t){return t.type===category});
  activeId=first?first.id:null;
  detail.classList.remove("open");
  render();
}
document.querySelectorAll(".category-tab").forEach(function(btn){
  btn.addEventListener("click",function(){switchCategory(btn.dataset.category)});
});
document.querySelectorAll(".stat").forEach(function(btn){
  btn.addEventListener("click",function(){
    activeStatus=btn.dataset.statusFilter;
    document.querySelectorAll(".stat").forEach(function(b){b.classList.toggle("active",b===btn)});
    detail.classList.remove("open");
    render();
  });
});
document.querySelectorAll(".map-tool").forEach(function(btn){
  btn.addEventListener("click",function(){
    mapMode=btn.dataset.mapMode;
    document.querySelectorAll(".map-tool").forEach(function(b){b.classList.toggle("active",b===btn)});
    document.getElementById("mapStage").classList.toggle("priority-mode",mapMode==="priority");
    render();
  });
});
document.getElementById("targetSearch").addEventListener("input",function(e){
  query=e.target.value.trim();detail.classList.remove("open");render();
});
document.getElementById("detailClose").addEventListener("click",function(){detail.classList.remove("open")});
document.getElementById("statusSelect").addEventListener("change",function(e){
  if(!activeId)return;
  persist(activeId,{status:e.target.value});
  document.getElementById("saveState").textContent="Status saved locally";
  render();
});
let noteTimer;
document.getElementById("notesField").addEventListener("input",function(e){
  if(!activeId)return;
  clearTimeout(noteTimer);
  const value=e.target.value;
  document.getElementById("saveState").textContent="Saving…";
  noteTimer=setTimeout(function(){
    persist(activeId,{note:value});
    document.getElementById("saveState").textContent="Saved locally";
  },240);
});
document.getElementById("clearNote").addEventListener("click",function(){
  if(!activeId)return;
  document.getElementById("notesField").value="";
  persist(activeId,{note:""});
  document.getElementById("saveState").textContent="Note cleared";
});
document.addEventListener("keydown",function(e){
  if(e.key==="Escape")detail.classList.remove("open");
});

updateStats();
render();
