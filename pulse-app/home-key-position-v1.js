/* KŌMØ Pulse — Home KEY priority placement v1
   Event-driven only: keeps KEY directly below Motion Score + Locomotor Age. */
(()=>{
'use strict';
const V='1.0.0';
let timer=0,retry=0;
const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
function place(){
  if(route()!=='home'){retry=0;return}
  const home=document.querySelector('[data-my-komo-home]');
  const grid=home?.querySelector('[data-khome-datawall] .kdw-grid');
  if(!home||!grid){if(retry<4){retry++;schedule(260)}return}
  let key=home.querySelector('[data-key-home]');
  if(!key){
    if(retry<4){retry++;window.KomoKeyHome?.refresh?.();schedule(260)}
    return;
  }
  const age=grid.querySelector('.kdw-age');
  if(!age)return;
  grid.classList.add('kdw-key-priority');
  if(key.parentElement!==grid||key.previousElementSibling!==age) age.insertAdjacentElement('afterend',key);
  retry=0;
}
function schedule(ms=120){clearTimeout(timer);timer=setTimeout(place,ms)}
function settle(){schedule(140);setTimeout(place,420);setTimeout(place,820)}
['hashchange','pageshow','komo:route-ready','komo:canonical-route','komo:data-ready','komo:canonical-result-ready','komo:wearable-data-updated'].forEach(e=>addEventListener(e,settle));
document.addEventListener('DOMContentLoaded',()=>{setTimeout(place,1100);setTimeout(place,1900)});
setTimeout(place,2200);
window.KomoHomeKeyPosition={version:V,refresh:place};
})();
