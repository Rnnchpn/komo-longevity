/* KŌMØ Pulse — Home KEY priority placement v2.1
   Phone-only helper: the commercial desktop Home now renders its own KEY summary.
   On phone, the full KEY panel remains directly above Motion Score + KŌMØ Age. */
(()=>{
'use strict';
const V='2.1.0';
let timer=0,attempt=0,placing=false;
const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
const phone=()=>matchMedia('(max-width:767px)').matches;
function schedule(ms=120){clearTimeout(timer);timer=setTimeout(()=>{attempt++;place();},ms)}
async function place(){
  if(placing)return;
  if(route()!=='home'||!phone()){attempt=0;document.querySelector('[data-khome-datawall] .kdw-grid')?.classList.remove('kdw-key-priority');return}
  placing=true;
  try{
    const home=document.querySelector('[data-my-komo-home]');
    const grid=home?.querySelector('[data-khome-datawall] .kdw-grid');
    if(!home||!grid){if(attempt<10)schedule(260);return}
    let key=home.querySelector('[data-key-home]');
    if(!key&&window.KomoKeyHome?.refresh){
      try{await window.KomoKeyHome.refresh()}catch(e){console.warn('[home-key-position-v2] KEY refresh failed',e)}
      key=home.querySelector('[data-key-home]');
    }
    if(!key){if(attempt<10)schedule(360);return}
    const age=grid.querySelector('.kdw-age'),score=grid.querySelector('.kdw-score');
    if(!age||!score){if(attempt<10)schedule(260);return}
    grid.classList.add('kdw-key-priority');
    age.insertAdjacentElement('beforebegin',key);
    attempt=0;
  }finally{placing=false}
}
function settle(){
  if(!phone()){clearTimeout(timer);attempt=0;document.querySelector('[data-khome-datawall] .kdw-grid')?.classList.remove('kdw-key-priority');return}
  attempt=0;schedule(100);setTimeout(()=>{attempt=0;place()},420);setTimeout(()=>{attempt=0;place()},900);setTimeout(()=>{attempt=0;place()},1700)
}
['hashchange','pageshow','resize','orientationchange','komo:route-ready','komo:canonical-route','komo:data-ready','komo:canonical-result-ready','komo:wearable-data-updated'].forEach(e=>addEventListener(e,settle));
document.addEventListener('DOMContentLoaded',()=>{setTimeout(settle,700);setTimeout(settle,1900)});
setTimeout(settle,2400);
window.KomoHomeKeyPosition={version:V,refresh:place};
})();