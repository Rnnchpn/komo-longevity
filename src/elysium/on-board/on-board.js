/* ELYSIUM ON BOARD — 3 destinations and private Riviera services
   Reuses the verified Intelligence feed through an access-controlled, sanitized endpoint.
   Never renders historical snapshot markers as real-time yachts. */
(()=>{
 'use strict';
 const $=sel=>document.querySelector(sel), $$=sel=>[...document.querySelectorAll(sel)];
 const SUPABASE_URL='https://uqlolefsiktbznnymriy.supabase.co';
 const SUPABASE_PUBLISHABLE='sb_publishable_3sUsinfJ_nMFI44OXozkKQ_jmGG8w7n';
 const DESTINATIONS={
  monaco:{name:'Monaco',coords:[43.7353,7.4235],zoom:13.5,subtitle:'Port Hercule · Fontvieille',
   ports:[{name:'Port Hercule',lat:43.7369,lng:7.4254},{name:'Fontvieille',lat:43.7284,lng:7.4168}]},
  cannes:{name:'Cannes',coords:[43.549,7.025],zoom:12.8,subtitle:'Vieux Port · Port Canto',
   ports:[{name:'Vieux Port',lat:43.5501,lng:7.0156},{name:'Port Canto',lat:43.5427,lng:7.0352},{name:'Golfe-Juan',lat:43.5639,lng:7.0734}]},
  'saint-tropez':{name:'Saint-Tropez',coords:[43.2708,6.639],zoom:13.2,subtitle:'Port de Saint-Tropez',
   ports:[{name:'Port de Saint-Tropez',lat:43.2713,lng:6.6385}]}
 };
 const ACTIVITY_DEFS=[
  {slug:'medical-longevity',service:'medical-longevity-onboard',mark:'✣',
   nameFr:'Médecin à bord',nameEn:'Physician On Board',catFr:'LONGÉVITÉ MÉDICALE',catEn:'MEDICAL LONGEVITY',
   descFr:'Consultation avec un médecin indépendant sur votre yacht ou en résidence.',descEn:'A private consultation with an independent physician on board or in residence.'},
  {slug:'medical-longevity',service:'aesthetic-physician-onboard',mark:'✧',
   nameFr:'Médecine esthétique',nameEn:'Aesthetic Medicine',catFr:'CONSULTATION PRIVÉE',catEn:'PRIVATE CONSULTATION',
   descFr:'Une consultation médicale esthétique organisée en toute discrétion.',descEn:'A discreet medical aesthetic consultation arranged privately.'},
  {slug:'iv-drip',mark:'◈',nameFr:'IV & Recovery',nameEn:'IV & Recovery',
   catFr:'ÉVALUATION MÉDICALE',catEn:'MEDICAL ASSESSMENT',
   descFr:'Accès aux prestations proposées par les praticiens habilités, selon indication.',descEn:'Care options from authorised professionals when clinically appropriate.'},
  {slug:'experiences',mark:'◌',nameFr:'Gastronomie privée',nameEn:'Private Gastronomy',
   catFr:'L’ART DE RECEVOIR',catEn:'PRIVATE DINING',
   descFr:'Expériences et tables sur mesure, à bord ou à terre.',descEn:'Bespoke dining and culinary experiences, on board or on shore.'},
  {slug:'high-luxury',mark:'✦',nameFr:'High Luxury',nameEn:'High Luxury',
   catFr:'SÉLECTION EXCEPTIONNELLE',catEn:'EXCEPTIONAL EDIT',
   descFr:'Pièces rares et expériences privées, à la demande.',descEn:'Rare objects and private experiences, arranged on request.'},
  {slug:'services',mark:'⌑',nameFr:'Conciergerie',nameEn:'Concierge',
   catFr:'SERVICES PRIVÉS',catEn:'PRIVATE SERVICES',
   descFr:'Votre séjour et vos demandes, coordonnés personnellement.',descEn:'Your stay and private requests, personally coordinated.'}
 ];
 const CITY_VALUES=Object.keys(DESTINATIONS);
 const url=new URL(location.href);
 let lang=url.searchParams.get('lang')==='en'?'en':url.searchParams.get('lang')==='fr'?'fr':(navigator.language?.startsWith('fr')?'fr':'en');
 let city=CITY_VALUES.includes(url.searchParams.get('city'))?url.searchParams.get('city'):'monaco';
 let map=null,harbourLayer=null,aisLayer=null,positionLayer=null,activityLayer=null,adLayer=null;
 let marketListings=[],paidAds=[],enabledLayers={yachts:true,activities:true,ads:true};
 let feed=[],verified=false,filtered=[],size='all',navFilter='all',filterText='',selected=null,requestInFlight=false,authClient=null,feedCheckedAt=null,feedState='loading';
 const txt=(fr,en)=>lang==='fr'?fr:en;
 const clean=s=>String(s||'').replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&#39;'}[c]));
 const boatShape='<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 2 25 23 14 17 3 23Z" /></svg>';
 function setLanguage(next){
  lang=next;document.documentElement.lang=lang;
  $$('[data-fr][data-en]').forEach(e=>e.textContent=e.dataset[lang]);
  $('#obLanguage').textContent=lang==='fr'?'EN':'FR';
  $('#obSearch').placeholder=txt('Nom du yacht','Yacht name');
  updateStatus();
  renderCity();
  renderFleet();
  renderActivities();
 }
 function urlForCity(code){
  const u=new URL(location.href);u.searchParams.set('city',code);
  // Preserve language, never store GPS coordinates in URL, query or localStorage.
  return u.pathname+u.search;
 }
 function setCity(code,{mapMove=true,updateUrl=true}={}){
  if(!DESTINATIONS[code])return;
  city=code;selected=null;
  $('#obVesselContext').hidden=true;
  if(updateUrl)history.replaceState(null,'',urlForCity(code));
  $$('#obCities [data-city]').forEach(btn=>{
   const on=btn.dataset.city===code;
   btn.classList.toggle('is-active',on);btn.setAttribute('aria-selected',String(on));
   btn.tabIndex=on?0:-1;
  });
  renderCity();
  if(map&&mapMove)map.flyTo(DESTINATIONS[city].coords,DESTINATIONS[city].zoom,{duration:window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:0.7});
  renderFleet();
  if(window.__elyMapMarketCity!==code){window.__elyMapMarketCity=code;fetchMarketplace()}
 }
 function renderCity(){
  const c=DESTINATIONS[city];
  $('#obPortTitle').textContent=c.name;
  $('#obPortSubtitle').textContent=c.subtitle;
 }
 function yachtCountInArea(port){
  const target=port.name.toLowerCase();
  return filtered.filter(y=>{
   const v=(y.port||'').toLowerCase();
   return v===target||(target==='fontvieille'&&v.includes('fontvieille'))||
    (target==='vieux port'&&v.includes('vieux port'))||
    (target==='golfe-juan'&&v.includes('golfe-juan'));
  }).length;
 }
 function harbourMarker(port){
  const count=yachtCountInArea(port);
  const marker=L.divIcon({className:'',iconSize:[45,45],iconAnchor:[22,22],
   html:'<span class="ob-harbour-marker'+(count?' is-filled':'')+'">'+
    (count?'<b>'+count+'</b>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 2v18M4 12c0 10 16 10 16 0M7 8h10M9 4h6"/></svg>')+'</span>'});
  const m=L.marker([port.lat,port.lng],{icon:marker}).addTo(harbourLayer);
  m.bindTooltip(clean(port.name)+(count?' · '+count+' '+txt('yachts signalés','reported yachts'):'') ,{direction:'top'});
  m.on('click',()=>{
   if(map)map.flyTo([port.lat,port.lng],14,{duration:.4});
   const first=filtered.find(y=>(y.port||'').toLowerCase().includes(port.name.toLowerCase()));
   if(first)highlightYacht(first.id,false);
  });
 }
 function statusLabel(status){
  const terms={
   underway:['EN NAVIGATION','UNDERWAY'],approaching:['EN APPROCHE','APPROACHING'],
   at_anchor:['AU MOUILLAGE','AT ANCHOR'],in_port:['AU PORT','MOORED'],
   unclassified:['STATUT INCONNU','UNKNOWN STATUS']
  };
  const line=terms[status]||terms.unclassified;return lang==='fr'?line[0]:line[1];
 }
 function aisTime(y){
  if(!y.reportedAt)return '';
  const t=Date.parse(y.reportedAt);
  if(!Number.isFinite(t))return '';
  return new Date(t).toLocaleTimeString(lang==='fr'?'fr-FR':'en-GB',{hour:'2-digit',minute:'2-digit'});
 }
 function exactMarker(y){
  const rot=Number.isFinite(y.courseDegrees)?y.courseDegrees:0;
  const icon=L.divIcon({className:'ob-ais-pin',iconSize:[38,38],iconAnchor:[19,19],
   html:'<span class="ob-ais-vessel is-'+y.status+'"><span style="transform:rotate('+rot+'deg)">'+boatShape+'</span></span>'});
  const m=L.marker([y.lat,y.lng],{icon,zIndexOffset:500}).addTo(aisLayer);
  const speed=Number.isFinite(y.speedKnots)?' · '+y.speedKnots+' kn':'';
  m.bindTooltip(clean(y.name)+' · '+statusLabel(y.status)+speed+' · AIS '+aisTime(y),{direction:'top'});
  m.on('click',()=>highlightYacht(y.id,false));
 }
 function renderMapMarkers(){
  if(!map)return;
  harbourLayer.clearLayers();aisLayer.clearLayers();
  if(enabledLayers.yachts){
    DESTINATIONS[city].ports.forEach(harbourMarker);
    filtered.filter(y=>y.precision==='ais'&&y.aisRecent).forEach(exactMarker);
  }
  renderCommercialMarkers();
 }
 function makeYachtRow(y){
  const b=document.createElement('button');b.type='button';b.className='ob-yacht-row';
  b.dataset.status=y.status;
  if(selected?.id===y.id)b.classList.add('is-selected');
  const sym=document.createElement('span');sym.className='ob-boat-small';sym.textContent='⛵';
  const text=document.createElement('span');text.className='ob-yacht-text';
  const name=document.createElement('strong');name.textContent=y.name;
  const label=document.createElement('span');label.className='ob-status-label is-'+(y.status||'unclassified');
  label.textContent=statusLabel(y.status);
  const desc=document.createElement('small');
  desc.textContent=(y.length?y.length+' m · ':'')+y.port+' · '+aisTime(y)+
   (Number.isFinite(y.speedKnots)?' · '+y.speedKnots+' kn':'');
  text.append(name,label,desc);
  const arrow=document.createElement('span');arrow.textContent='↗';
  b.append(sym,text,arrow);
  b.addEventListener('click',()=>highlightYacht(y.id,true));
  return b;
 }
 function matchingYachts(){
  return feed.filter(y=>y.city===city&&(size==='all'||(Number.isFinite(y.length)&&y.length>=Number(size)))&&
   (navFilter==='all'||y.status===navFilter)&&
   (!filterText||(y.name+' '+y.port+' '+(y.destination||'')).toLocaleLowerCase().includes(filterText)));
 }
 function renderFleet(){
  filtered=matchingYachts();
  $('#obYachtCount').textContent=verified?String(filtered.length):'—';
  const list=$('#obYachtList');list.replaceChildren();
  if(!verified){
   const box=document.createElement('div');box.className='ob-yacht-placeholder';
   box.textContent=txt('Aucune donnée actuelle vérifiée pour le moment. Les ports et les expériences restent accessibles. Les anciens yachts du projet Intelligence ne sont pas affichés comme présents aujourd’hui.',
    'No current verified feed. The harbours and experiences remain accessible. Historical Intelligence yacht positions are not presented as current.');
   list.append(box);
  }else if(!filtered.length){
   const box=document.createElement('div');box.className='ob-yacht-placeholder';
   box.textContent=txt('Aucun yacht signalé pour ce filtre dans cette escale. Essayez une autre longueur ou un autre port.','No vessels reported for this filter. Try another length or harbour.');
   list.append(box);
  }else{
   filtered.slice(0,90).forEach(y=>list.append(makeYachtRow(y)));
   if(filtered.length>90){const el=document.createElement('p');el.className='ob-yacht-placeholder';el.textContent=txt('Affinez votre recherche pour voir davantage de yachts.','Refine the search to see more yachts.');list.append(el)}
  }
  renderMapMarkers();
 }
 function highlightYacht(id,zoom){
  const y=feed.find(x=>x.id===id);if(!y)return;
  selected=y;
  $('#obSelectedName').textContent=y.name;
  $('#obVesselContext').hidden=false;
  $$('.ob-yacht-row').forEach(b=>b.classList.toggle('is-selected',b.querySelector('strong')?.textContent===y.name));
  if(zoom&&map){
   if(y.precision==='ais'&&y.aisRecent)map.flyTo([y.lat,y.lng],15,{duration:.5});
   else {
    const port=DESTINATIONS[city].ports.find(x=>(y.port||'').toLowerCase().includes(x.name.toLowerCase()))||DESTINATIONS[city].ports[0];
    map.flyTo([port.lat,port.lng],14,{duration:.5});
   }
  }
 }
 function safeStatus(type){
  const a=$('#obFeedDescription');
  if(type==='login')a.textContent=txt('Connectez-vous à votre club ELYSIUM pour voir les yachts signalés.','Sign in to your ELYSIUM membership to see reported yachts.');
  if(type==='member')a.textContent=txt('Accès membre confirmé. Actualisation des ports et des positions disponibles.','Member access confirmed. Harbour and vessel updates available.');
  if(type==='none')a.textContent=txt('Flux de yachts indisponible actuellement. Aucun bateau fictif n’est affiché.','Yacht feed currently unavailable. No fictitious vessels are shown.');
  if(type==='live')a.textContent=txt('Données des ports signalées. Les marqueurs de port ne représentent jamais une position exacte.','Harbour reports received. Harbour markers never represent exact vessel positions.');
 }
 function updateStatus(){
  $('#obSourceStatus').textContent=verified
   ?(txt('CONSULTÉ ','CHECKED ')+(feedCheckedAt?new Date(feedCheckedAt).toLocaleTimeString(lang==='fr'?'fr-FR':'en-GB',{hour:'2-digit',minute:'2-digit'}):'—')+' · '+txt('PORT / AIS','HARBOUR / AIS'))
   :txt('PORTS · PAS DE YACHTS VÉRIFIÉS','HARBOURS · NO VERIFIED YACHTS');
 }
 async function getSession(){
  if(!window.supabase?.createClient)return null;
  try{
   authClient ||=window.supabase.createClient(SUPABASE_URL,SUPABASE_PUBLISHABLE,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:false}});
   const {data:{session}}=await authClient.auth.getSession();
   return session?.access_token||null;
  }catch{return null}
 }
 async function fetchYachts(){
  if(requestInFlight)return;
  requestInFlight=true;$('#obRefresh').disabled=true;
  try{
   const token=await getSession();
   if(!token){verified=false;feed=[];safeStatus('login');updateStatus();renderFleet();return}
   const response=await fetch('/api/elysium-yachts',{headers:{Authorization:'Bearer '+token},cache:'no-store'});
   if(response.status===401||response.status===403){verified=false;feed=[];safeStatus('login');updateStatus();renderFleet();return}
   if(!response.ok)throw Error('Unable to load yacht feed');
   const data=await response.json();
   verified=data.source==='harbour_and_optional_ais';
   feedCheckedAt=verified?Date.now():null;
   feed=Array.isArray(data.yachts)?data.yachts.filter(y=>DESTINATIONS[y.city]&&Number.isFinite(y.lat)&&Number.isFinite(y.lng)):[];
   safeStatus(verified?'live':'none');updateStatus();renderFleet();
  }catch(err){verified=false;feed=[];safeStatus('none');updateStatus();renderFleet()}
  finally{requestInFlight=false;$('#obRefresh').disabled=false}
 }
 function initMap(){
  if(typeof L==='undefined'){
   $('#obMapError').hidden=false;$('#obMapError').textContent=txt('Carte indisponible. Choisissez une destination et consultez les expériences.','Map unavailable. Choose a destination to explore the experiences.');
   return;
  }
  const c=DESTINATIONS[city];
  map=L.map('obMap',{zoomControl:false,minZoom:9,maxZoom:18,scrollWheelZoom:false,preferCanvas:true}).setView(c.coords,c.zoom);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
   attribution:'© OpenStreetMap contributors',maxZoom:19,keepBuffer:1,updateWhenIdle:true
  }).addTo(map);
  L.control.zoom({position:'bottomright'}).addTo(map);
  harbourLayer=L.layerGroup().addTo(map);
  aisLayer=L.layerGroup().addTo(map);
  positionLayer=L.layerGroup().addTo(map);
  activityLayer=L.layerGroup().addTo(map);
  adLayer=L.layerGroup().addTo(map);
  renderMapMarkers();
  requestAnimationFrame(()=>map?.invalidateSize());
 }
 function haversine(a,b,c,d){
  const rad=Math.PI/180,R=6371;
  const dx=(c-a)*rad,dy=(d-b)*rad;
  const h=Math.sin(dx/2)**2+Math.cos(a*rad)*Math.cos(c*rad)*Math.sin(dy/2)**2;
  return 2*R*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
 }
 function locate(){
  const b=$('#obLocate');
  if(!navigator.geolocation){
   alert(txt('Votre appareil ne permet pas la géolocalisation. Vous pouvez choisir un port manuellement.','Location is unavailable. You can still choose a harbour manually.'));
   return;
  }
  b.disabled=true;
  navigator.geolocation.getCurrentPosition(
   p=>{
    b.disabled=false;
    const {latitude:lat,longitude:lng,accuracy}=p.coords;
    const closest=CITY_VALUES.map(key=>({key,km:haversine(lat,lng,...DESTINATIONS[key].coords)})).sort((a,b)=>a.km-b.km)[0];
    if(closest.km<60)setCity(closest.key);
    if(map){
     positionLayer.clearLayers();
     L.marker([lat,lng],{icon:L.divIcon({className:'',html:'<span class="ob-self-marker"></span>',iconSize:[20,20],iconAnchor:[10,10]})})
      .bindTooltip(txt('Votre position sur cet appareil','Your device position'),{direction:'top'}).addTo(positionLayer);
     if(Number.isFinite(accuracy)&&accuracy<10000){
      L.circle([lat,lng],{radius:Math.max(10,accuracy),color:'#2c83b8',weight:1,fillOpacity:.06}).addTo(positionLayer);
     }
     map.flyTo([lat,lng],closest.km<60?14:10,{duration:.55});
    }
    $('#obSourceStatus').textContent=closest.km<60
     ?txt('MA POSITION · '+DESTINATIONS[closest.key].name.toUpperCase(),'MY LOCATION · '+DESTINATIONS[closest.key].name.toUpperCase())
     :txt('POSITION HORS DE NOS 3 ESCALES','LOCATION OUTSIDE OUR THREE DESTINATIONS');
    // Position stays in this browser memory only and is never transmitted to ELYSIUM.
   },
   ()=>{
    b.disabled=false;
    alert(txt('Localisation non autorisée. Vous pouvez choisir Monaco, Cannes ou Saint-Tropez manuellement.','Location access was not granted. Choose Monaco, Cannes or Saint-Tropez manually.'));
   },
   {enableHighAccuracy:true,timeout:14000,maximumAge:60000}
  );
 }
 function experienceHref(e){
  return '/elysium/maison/'+e.slug+'/'+(e.service?'?service='+encodeURIComponent(e.service):'');
 }
 function requestExperience(e){
  const c=DESTINATIONS[city];
  const subject='ELYSIUM On Board — '+(lang==='fr'?e.nameFr:e.nameEn);
  const body=txt('Bonjour ELYSIUM,','Hello ELYSIUM,')+'\n\n'+
   txt('Je souhaite organiser : ','I would like to arrange: ')+(lang==='fr'?e.nameFr:e.nameEn)+'\n'+
   txt('Escale : ','Destination: ')+c.name+'\n'+
   txt('Yacht (indiqué par le client, non vérifié) : ','Yacht (selected by guest, unverified): ')+(selected?.name||txt('à préciser','to confirm'))+'\n'+
   txt('Date et lieu souhaités : ','Preferred date and location: ')+'\n\n'+
   txt('Merci de me confirmer la disponibilité et le devis. Aucune donnée médicale transmise.','Please confirm availability and quotation. No medical information provided.');
  location.href='mailto:contact@komolongevity.com?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
 }
 function renderActivities(){
  const container=$('#obActivityGrid');container.replaceChildren();
  ACTIVITY_DEFS.forEach((e,i)=>{
   const card=document.createElement('article');card.className='ob-activity';card.dataset.activity=e.service||e.slug;
   const art=document.createElement('div');art.className='ob-activity-art';art.setAttribute('aria-hidden','true');
   const motif=document.createElement('span');motif.textContent=e.mark;art.append(motif);
   const body=document.createElement('div');body.className='ob-activity-body';
   const cat=document.createElement('span');cat.textContent=lang==='fr'?e.catFr:e.catEn;
   const h=document.createElement('h3');h.textContent=lang==='fr'?e.nameFr:e.nameEn;
   const p=document.createElement('p');p.textContent=lang==='fr'?e.descFr:e.descEn;
   const acts=document.createElement('div');acts.className='ob-activity-actions';
   const link=document.createElement('a');link.href=experienceHref(e);link.textContent=txt('DÉCOUVRIR ↗','EXPLORE ↗');link.setAttribute('aria-label',txt('Découvrir ','Explore ')+h.textContent);
   const btn=document.createElement('button');btn.type='button';btn.textContent=txt('DEMANDER','REQUEST');
   btn.addEventListener('click',()=>requestExperience(e));
   acts.append(link,btn);body.append(cat,h,p,acts);card.append(art,body);container.append(card);
  });
 }

 /* Destination-based discovery pins, not business address or actual yacht coordinates. */
 function renderCommercialMarkers(){
  if(!map||!activityLayer||!adLayer)return;
  activityLayer.clearLayers();adLayer.clearLayers();
  const base=DESTINATIONS[city].coords;
  if(enabledLayers.activities){
   ACTIVITY_DEFS.forEach((exp,i)=>{
    const angle=(i/ACTIVITY_DEFS.length)*Math.PI*2-.6;
    const lat=base[0]+Math.sin(angle)*0.013;
    const lng=base[1]+Math.cos(angle)*0.021;
    const bubble=L.divIcon({className:'ob-discovery-pin',iconSize:[76,76],iconAnchor:[38,38],
     html:'<span class="ob-discovery-avatar">'+clean(exp.mark)+'</span><small>'+clean(lang==='fr'?exp.nameFr:exp.nameEn)+'</small>'});
    const marker=L.marker([lat,lng],{icon:bubble,zIndexOffset:210}).addTo(activityLayer);
    marker.bindTooltip(txt('Expérience dans ce secteur · position indicative','Experience in this destination · illustrative marker'));
    marker.on('click',()=>{
     const item=$('.ob-activity[data-activity="'+(exp.service||exp.slug)+'"]');
     item?.scrollIntoView({behavior:'smooth',block:'center'});
     item?.classList.add('ob-activity-highlight');
     setTimeout(()=>item?.classList.remove('ob-activity-highlight'),1600);
    });
   });
  }
  if(enabledLayers.ads)paidAds.filter(x=>x.placement==='map_spotlight'&&(x.location_city===city||x.location_city==='all')).slice(0,3).forEach((ad,i)=>{
    const lat=base[0]+0.018+(i*.008),lng=base[1]-0.018+(i*.004);
    const b=L.divIcon({className:'ob-sponsored-pin',iconSize:[118,51],iconAnchor:[59,26],
      html:'<span>SPONSORISÉ · '+clean(ad.sponsor_name||'PARTENAIRE').slice(0,30)+'</span><strong>'+clean(ad.headline).slice(0,45)+'</strong>'});
    L.marker([lat,lng],{icon:b,zIndexOffset:350}).bindTooltip(txt('Publicité · zone indicative, non AIS','Advertisement · indicative area, not AIS')).on('click',()=>{
      $('#obMarket')?.scrollIntoView({behavior:'smooth',block:'start'});
    }).addTo(adLayer);
  });
 }
 const formatOfferPrice=x=>x.price_eur?
  new Intl.NumberFormat(lang==='fr'?'fr-FR':'en-GB',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(x.price_eur):
  txt('Sur devis','On request');
 function renderMarketplace(){
  const host=$('#obMarketList');host.replaceChildren();
  const active=marketListings.filter(x=>x.location_city===city||x.location_city==='all');
  if(!active.length){
   const empty=document.createElement('div');empty.className='ob-market-empty';
   empty.textContent=txt('Aucune annonce payante validée pour cette escale. Les brokers peuvent déposer leurs offres dans le Studio.','No approved paid listing in this destination yet. Brokers can submit offers through Broker Studio.');
   host.append(empty);
  }
  const priority=[...active].sort((a,b)=>Number(paidAds.some(ad=>ad.listing_id===b.id))-Number(paidAds.some(ad=>ad.listing_id===a.id)));
  priority.forEach(x=>{
   const card=document.createElement('article');card.className='ob-market-card';
   const art=document.createElement('div');art.className='ob-market-image';
   if(x.image_url&&/^https:\/\//i.test(x.image_url)){
    const im=document.createElement('img');im.src=x.image_url;im.alt='';im.loading='lazy';im.referrerPolicy='no-referrer';art.append(im);
   }else{art.textContent='⛵'}
   const info=document.createElement('div');info.className='ob-market-body';
   const tag=document.createElement('span');tag.className='ob-market-label';
   tag.textContent=paidAds.some(ad=>ad.listing_id===x.id)?'SPONSORISÉ · ANNONCE BROKER':'ANNONCE BROKER · PAYANTE';
   const h=document.createElement('h3');h.textContent=x.yacht_name;
   const text=document.createElement('p');text.textContent=x.title+(x.length_m?' · '+x.length_m+' m':'');
   const price=document.createElement('b');price.textContent=formatOfferPrice(x)+(x.listing_type==='charter'?txt(' · location',' · charter'):'');
   const cta=document.createElement('a');cta.textContent=txt('DEMANDER LE DOSSIER ↗','ENQUIRE ABOUT THIS YACHT ↗');
   const body=txt('Bonjour ELYSIUM,\nJe souhaite des informations sur le yacht ','Hello ELYSIUM,\nI would like information about yacht ')+x.yacht_name+
    '\n'+txt('Escale : ','Destination: ')+DESTINATIONS[city].name+'\n'+txt('Référence : ','Reference: ')+x.id;
   cta.href='mailto:contact@komolongevity.com?subject='+encodeURIComponent('ELYSIUM Yacht — '+x.yacht_name)+'&body='+encodeURIComponent(body);
   info.append(tag,h,text,price,cta);card.append(art,info);host.append(card);
  });
  const adsHere=paidAds.filter(x=>x.location_city===city||x.location_city==='all');
  $('#obMarketStatus').textContent=txt(
   'Sélection de brokers contrôlés · annonces et publicités payantes identifiées · '+active.length+' annonce(s)',
   'Curated broker listings · paid adverts clearly labelled · '+active.length+' listing(s)');
  renderCommercialMarkers();
 }
 async function fetchMarketplace(){
  try{
   const token=await getSession();
   if(!token){marketListings=[];paidAds=[];renderMarketplace();return}
   const r=await fetch('/api/elysium-marketplace?city='+encodeURIComponent(city),{
    headers:{Authorization:'Bearer '+token},cache:'no-store'});
   if(!r.ok)throw Error('marketplace_unavailable');
   const data=await r.json();
   marketListings=Array.isArray(data.listings)?data.listings:[];
   paidAds=Array.isArray(data.ads)?data.ads:[];
  }catch(err){marketListings=[];paidAds=[]}
  renderMarketplace();
 }

 function wire(){
  $$('#obCities button[data-city]').forEach(btn=>btn.addEventListener('click',()=>setCity(btn.dataset.city)));
  $('#obCities').addEventListener('keydown',e=>{
   if(!['ArrowLeft','ArrowRight'].includes(e.key))return;
   const n=CITY_VALUES.indexOf(city)+(e.key==='ArrowRight'?1:-1);
   const next=CITY_VALUES[(n+CITY_VALUES.length)%CITY_VALUES.length];e.preventDefault();
   setCity(next);$('#obCities [data-city="'+next+'"]').focus();
  });
  $('#obLanguage').addEventListener('click',()=>setLanguage(lang==='fr'?'en':'fr'));
  $('#obLocate').addEventListener('click',locate);
  $('#obMapLayers [data-layer]').forEach(btn=>btn.addEventListener('click',()=>{
    const layer=btn.dataset.layer;enabledLayers[layer]=!enabledLayers[layer];
    btn.classList.toggle('is-active',enabledLayers[layer]);btn.setAttribute('aria-pressed',String(enabledLayers[layer]));
    renderMapMarkers();
  }));
  $('#obRefresh').addEventListener('click',fetchYachts);
  $('#obNavigationFilters [data-nav]').forEach(b=>b.addEventListener('click',()=>{
   navFilter=b.dataset.nav;
   $('#obNavigationFilters [data-nav]').forEach(x=>{
    const selected=x===b;x.classList.toggle('is-active',selected);
    x.setAttribute('aria-pressed',String(selected));
   });
   renderFleet();
  }));
  $('#obSearch').addEventListener('input',e=>{filterText=e.target.value.trim().toLocaleLowerCase();renderFleet()});
  $$('.ob-length button').forEach(b=>b.addEventListener('click',()=>{
   size=b.dataset.size;
   $$('.ob-length button').forEach(a=>{a.classList.toggle('is-active',a===b);a.setAttribute('aria-pressed',String(a===b))});
   renderFleet();
  }));
  $('#obManualSelect').addEventListener('click',()=>{
   const name=$('#obManualName').value.trim().replace(/[<>]/g,'').slice(0,60);
   if(!name){$('#obManualName').focus();return}
   selected={id:'guest-entered',name,port:DESTINATIONS[city].name,city,precision:'self_reported'};
   $('#obSelectedName').textContent=name+' · '+txt('INDIQUÉ PAR LE CLIENT','GUEST-ENTERED');
   $('#obVesselContext').hidden=false;
   $('.ob-yacht-row').forEach(b=>b.classList.remove('is-selected'));
  });
  $('#obManualName').addEventListener('keydown',e=>{if(e.key==='Enter'){$('#obManualSelect').click();e.preventDefault()}});
  $('#obClearVessel').addEventListener('click',()=>{selected=null;$('#obVesselContext').hidden=true;renderFleet()});
  $('#obConcierge').addEventListener('click',()=>requestExperience({nameFr:'Demande sur mesure',nameEn:'Bespoke concierge request'}));
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)fetchYachts()});
 }
 wire();setLanguage(lang);
 if(window.L)initMap();else window.addEventListener('load',initMap,{once:true});
 fetchYachts();fetchMarketplace();
 // Two minute refresh avoids unnecessarily hammering the historic upstream.
 setInterval(()=>{if(!document.hidden)fetchYachts()},40000);
})();
