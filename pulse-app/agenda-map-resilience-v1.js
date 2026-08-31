/* KŌMØ Pulse — Agenda map resilience V1
   Keeps the booking network usable when Leaflet/tiles/geocoding are unavailable. */
(() => {
  'use strict';
  const VERSION='1.0.0';
  let timers=[];
  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
  const mapOk=el=>!!el&&(el.classList.contains('leaflet-container')||!!el.querySelector('.leaflet-pane,.leaflet-tile-pane,.leaflet-marker-pane'));
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
  function places(){
    return [...document.querySelectorAll('.ag4-place')].slice(0,8).map(card=>{
      const name=clean(card.querySelector('strong')?.textContent);
      const meta=clean(card.querySelector('small')?.textContent).replace(/^(CENTRE|PRO)\s*·\s*/i,'');
      return{name,meta,query:clean(`${name} ${meta}`)};
    }).filter(x=>x.name);
  }
  function installStyle(){if(document.querySelector('#agendaMapResilienceV1Style'))return;const s=document.createElement('style');s.id='agendaMapResilienceV1Style';s.textContent=`
.ag4-map-fallback{height:100%;min-height:230px;padding:20px;display:flex;flex-direction:column;justify-content:space-between;gap:16px;background:radial-gradient(circle at 90% 5%,rgba(91,121,101,.10),transparent 42%),linear-gradient(145deg,#eae6dc,#ded9cf);color:#203027;border-radius:16px}.ag4-map-fallback small{display:block;color:#6f7d73;font-size:7px;font-weight:850;letter-spacing:.14em}.ag4-map-fallback h4{margin:8px 0 0;font:600 20px/1.05 Manrope,sans-serif;letter-spacing:-.04em}.ag4-map-fallback p{margin:7px 0 0;color:#6c776f;font-size:9px;line-height:1.5}.ag4-map-links{display:grid;gap:6px}.ag4-map-links a{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:42px;padding:0 11px;border:1px solid rgba(38,53,44,.10);border-radius:11px;background:rgba(255,255,255,.42);color:#2a3b31;text-decoration:none;font-size:8px;font-weight:750}.ag4-map-links a span{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.ag4-map-links a b{flex:0 0 auto;color:#67766c}.ag4-map-empty{font-size:9px;color:#718078}
`;document.head.appendChild(s)}
  function fallback(){
    if(!['documents','agenda'].includes(route()))return;
    const el=document.querySelector('[data-ag4-map]');if(!el||mapOk(el)||el.dataset.mapFallback==='1')return;
    const list=places();
    el.dataset.mapFallback='1';
    el.innerHTML=`<section class="ag4-map-fallback"><div><small>RÉSEAU KŌMØ</small><h4>Choisissez votre centre.</h4><p>La carte interactive n’a pas chargé. Les adresses restent accessibles immédiatement.</p></div><div class="ag4-map-links">${list.length?list.map(x=>`<a target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(x.query)}"><span>${x.name}</span><b>Maps ↗</b></a>`).join(''):'<span class="ag4-map-empty">Aucun centre géolocalisé pour le moment.</span>'}</div></section>`;
  }
  function arm(){
    timers.forEach(clearTimeout);timers=[];
    if(!['documents','agenda'].includes(route()))return;
    [900,1900,3600].forEach(ms=>timers.push(setTimeout(fallback,ms)));
  }
  installStyle();
  ['hashchange','pageshow','komo:route-ready','komo:canonical-route','komo:data-ready'].forEach(name=>window.addEventListener(name,arm));
  document.addEventListener('DOMContentLoaded',arm,{once:true});
  if(document.readyState!=='loading')arm();
  window.KomoAgendaMapResilienceV1={version:VERSION,refresh:arm};
})();