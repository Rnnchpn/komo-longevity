const places=[
{id:"palace",name:"Gstaad Palace",group:"Independent landmark hotel",phone:"+41 33 748 50 00",tel:"+41337485000",address:"Palacestrasse 28, 3780 Gstaad",type:["hotel","wellness"],x:55,y:40},
{id:"alpina",name:"The Alpina Gstaad",group:"Luxury hotel · Six Senses Spa",phone:"+41 33 888 98 88",tel:"+41338889888",address:"Alpinastrasse 23, 3780 Gstaad",type:["hotel","wellness"],x:75,y:58},
{id:"bellevue",name:"Le Grand Bellevue",group:"Luxury hotel · Le Grand Spa",phone:"+41 33 748 00 00",tel:"+41337480000",address:"Untergstaadstrasse 17, 3780 Saanen",type:["hotel","wellness"],x:76,y:38},
{id:"park",name:"Park Gstaad",group:"Luxury hotel",phone:"+41 33 748 98 00",tel:"+41337489800",address:"Wispilenstrasse 29, 3780 Gstaad",type:["hotel"],x:47,y:64},
{id:"ultima",name:"Ultima Hotel Gstaad",group:"Private residence · Spa & Clinic",phone:"+41 33 748 05 50",tel:"+41337480550",address:"Gsteigstrasse 70, 3780 Gstaad",type:["hotel","wellness"],x:31,y:51},
{id:"ermitage",name:"Ermitage Wellness & Spa Hotel",group:"Wellness & spa hotel",phone:"+41 33 748 04 30",tel:"+41337480430",address:"Dorfstrasse 46, 3778 Gstaad",type:["hotel","wellness"],x:61,y:69}
];
const layer=document.querySelector("#poi-layer"),panel=document.querySelector("#detailPanel");
let active=places[0],activeFilter="all";
function esc(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function renderPois(){
 layer.innerHTML=places.map((p,i)=>`<button class="poi ${p.id===active.id?"active":""} ${activeFilter!=="all"&&!p.type.includes(activeFilter)?"dim":""}" style="left:${p.x}%;top:${p.y}%;" data-id="${p.id}" aria-label="${esc(p.name)}"><span class="poi-building"></span><span class="poi-label"><em>0${i+1}</em>${esc(p.name)}</span></button>`).join("");
 layer.querySelectorAll(".poi").forEach(el=>el.addEventListener("click",()=>select(el.dataset.id)));
}
function select(id){
 const p=places.find(x=>x.id===id); if(!p)return; active=p;
 document.querySelector("#panelName").textContent=p.name;
 document.querySelector("#panelGroup").textContent=p.group;
 const ph=document.querySelector("#panelPhone"); ph.textContent=p.phone; ph.href="tel:"+p.tel;
 document.querySelector("#panelAddress").textContent=p.address;
 document.querySelector("#conciergeButton").href="tel:"+p.tel;
 document.querySelector("#panelCategory").textContent=p.type.includes("wellness")?"HOTEL · WELLNESS":"HOTEL";
 document.querySelector("#visualLabel").textContent=p.name.toUpperCase();
 document.querySelector("#panelIndex").textContent=String(places.indexOf(p)+1).padStart(2,"0")+" / "+String(places.length).padStart(2,"0");
 panel.classList.add("is-open"); renderPois();
}
document.querySelectorAll(".filter").forEach(btn=>btn.addEventListener("click",()=>{
 document.querySelectorAll(".filter").forEach(b=>b.classList.toggle("active",b===btn));
 activeFilter=btn.dataset.filter;renderPois();
}));
document.querySelector("#panelClose").addEventListener("click",()=>panel.classList.toggle("collapsed"));
document.querySelector("#locateBtn").addEventListener("click",()=>{
 const pos=document.querySelector("#userPosition");
 pos.hidden=false;
 if(!navigator.geolocation){pos.querySelector("span").textContent="Location unavailable";return}
 navigator.geolocation.getCurrentPosition(()=>{pos.querySelector("span").textContent="You are near Gstaad"},()=>{pos.querySelector("span").textContent="Location permission required"},{enableHighAccuracy:false,timeout:5000});
});
renderPois(); select("palace");