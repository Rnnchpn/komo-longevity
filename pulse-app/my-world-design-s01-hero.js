/* KŌMØ My World — Design Stratum 01 · HERO ONLY
   Architectural threshold, mineral depth, editorial hierarchy.
   Deliberately does not style stats, actions or context cards. */
(()=>{
'use strict';
const VERSION='s01.0.0';
function install(){
  if(document.querySelector('#kMyWorldS01Hero'))return;
  const s=document.createElement('style');s.id='kMyWorldS01Hero';s.textContent=`
body.kmyworld-v1 .kmw-hero{
  min-height:clamp(430px,58vh,650px)!important;
  grid-template-columns:minmax(0,1.05fr) minmax(390px,.95fr)!important;
  border:1px solid rgba(231,221,202,.15)!important;
  border-radius:34px!important;
  background:
    radial-gradient(680px 440px at 78% 44%,rgba(145,168,148,.16),transparent 61%),
    radial-gradient(520px 360px at 4% 100%,rgba(179,153,111,.075),transparent 67%),
    linear-gradient(128deg,#080b09 0%,#0d1410 45%,#16231b 100%)!important;
  box-shadow:0 38px 110px rgba(0,0,0,.34),inset 0 1px rgba(255,255,255,.045)!important;
  isolation:isolate;
}
body.kmyworld-v1 .kmw-hero:before{
  content:''!important;position:absolute!important;z-index:0!important;
  left:38px!important;right:38px!important;top:28px!important;bottom:28px!important;
  border:1px solid rgba(226,211,183,.075)!important;border-radius:24px!important;
  pointer-events:none!important;
  background:
    linear-gradient(90deg,transparent 49.92%,rgba(215,197,154,.055) 50%,transparent 50.08%),
    linear-gradient(180deg,transparent 49.92%,rgba(255,255,255,.025) 50%,transparent 50.08%)!important;
}
body.kmyworld-v1 .kmw-hero:after{
  content:'MY WORLD  /  PERSONAL ARRIVAL'!important;position:absolute!important;z-index:3!important;
  left:42px!important;bottom:31px!important;color:rgba(226,217,199,.34)!important;
  font:800 6px/1 'DM Sans',sans-serif!important;letter-spacing:.22em!important;
  pointer-events:none!important;
}
body.kmyworld-v1 .kmw-hero .kmw-copy{
  padding:clamp(44px,6vw,82px)!important;
  justify-content:center!important;
  border-right:1px solid rgba(215,197,154,.09)!important;
}
body.kmyworld-v1 .kmw-hero .kmw-copy>.kmw-kicker{
  color:#9ead9f!important;font-size:7px!important;letter-spacing:.22em!important;
  display:flex!important;align-items:center!important;gap:10px!important;
}
body.kmyworld-v1 .kmw-hero .kmw-copy>.kmw-kicker:before{
  content:'';display:block;width:34px;height:1px;background:linear-gradient(90deg,#a98559,rgba(169,133,89,.15));
}
body.kmyworld-v1 .kmw-hero .kmw-copy h2{
  max-width:720px!important;margin:18px 0 0!important;
  font:500 clamp(4rem,7vw,7.6rem)/.82 'Manrope','DM Sans',sans-serif!important;
  letter-spacing:-.078em!important;color:#f2efe8!important;
  text-wrap:balance;
}
body.kmyworld-v1 .kmw-hero .kmw-copy h2 em{
  position:relative!important;display:inline-block!important;
  font-family:Georgia,'Times New Roman',serif!important;font-weight:400!important;font-style:italic!important;
  letter-spacing:-.055em!important;color:#b9c7bb!important;
  text-shadow:0 12px 36px rgba(137,169,145,.08)!important;
}
body.kmyworld-v1 .kmw-hero .kmw-copy h2 em:after{
  content:'';position:absolute;left:4%;right:0;bottom:-10px;height:1px;
  background:linear-gradient(90deg,rgba(169,133,89,.72),rgba(169,133,89,0));
}
body.kmyworld-v1 .kmw-hero .kmw-copy>p:not(.kmw-kicker){
  max-width:530px!important;margin-top:28px!important;color:#89968d!important;
  font:500 10px/1.75 'DM Sans',sans-serif!important;letter-spacing:.005em!important;
}
body.kmyworld-v1 .kmw-hero .kmw-identity{
  width:max-content!important;max-width:100%!important;margin-top:28px!important;padding:8px 13px 8px 8px!important;
  border:1px solid rgba(255,255,255,.075)!important;border-radius:999px!important;
  background:rgba(255,255,255,.025)!important;backdrop-filter:blur(12px)!important;
}
body.kmyworld-v1 .kmw-hero .kmw-avatar-sm{
  width:42px!important;height:42px!important;border-color:rgba(215,197,154,.18)!important;
  background:#19271e!important;box-shadow:inset 0 0 0 5px rgba(255,255,255,.018)!important;
}
body.kmyworld-v1 .kmw-hero .kmw-identity strong{color:#e8ece7!important;font-size:10px!important}
body.kmyworld-v1 .kmw-hero .kmw-identity small{color:#66746b!important;font-size:6px!important;letter-spacing:.1em!important}

body.kmyworld-v1 .kmw-hero .kmw-portal{
  min-height:430px!important;position:relative!important;
  background:
    radial-gradient(300px 350px at 50% 50%,rgba(152,181,159,.105),transparent 66%),
    linear-gradient(180deg,rgba(255,255,255,.01),rgba(0,0,0,.07))!important;
}
body.kmyworld-v1 .kmw-hero .kmw-portal:before{
  content:''!important;position:absolute!important;z-index:0!important;
  width:min(72%,350px)!important;height:min(78%,455px)!important;
  border-radius:180px 180px 38px 38px!important;
  border:1px solid rgba(210,190,156,.46)!important;
  background:
    radial-gradient(180px 240px at 50% 44%,rgba(130,167,141,.17),transparent 70%),
    linear-gradient(180deg,rgba(46,68,54,.48),rgba(7,11,9,.84))!important;
  box-shadow:
    0 0 0 12px rgba(215,197,154,.018),
    0 0 0 36px rgba(143,179,154,.014),
    0 34px 74px rgba(0,0,0,.35),
    inset 0 1px rgba(255,255,255,.06),
    inset 0 -38px 70px rgba(0,0,0,.30)!important;
}
body.kmyworld-v1 .kmw-hero .kmw-portal:after{
  content:''!important;position:absolute!important;z-index:1!important;
  width:min(72%,350px)!important;height:min(78%,455px)!important;
  border-radius:180px 180px 38px 38px!important;
  border-left:1px solid rgba(255,255,255,.045)!important;
  border-right:1px solid rgba(0,0,0,.24)!important;
  background:
    linear-gradient(90deg,transparent 49.8%,rgba(215,197,154,.34) 50%,transparent 50.2%),
    linear-gradient(180deg,transparent 14%,rgba(255,255,255,.025) 14.2%,transparent 14.4%)!important;
  pointer-events:none!important;
}
body.kmyworld-v1 .kmw-hero .kmw-avatar-stage{
  z-index:3!important;width:184px!important;height:184px!important;
  border:1px solid rgba(223,208,181,.25)!important;background:#192b20!important;
  box-shadow:0 26px 62px rgba(0,0,0,.46),0 0 0 8px rgba(255,255,255,.018),0 0 42px rgba(133,170,143,.08)!important;
}
body.kmyworld-v1 .kmw-hero .kmw-enter{
  z-index:5!important;bottom:42px!important;min-width:230px!important;min-height:50px!important;
  padding:0 22px!important;border:1px solid rgba(246,241,230,.74)!important;
  border-radius:999px!important;background:linear-gradient(180deg,#f3f0e7,#dedfd7)!important;
  color:#17271d!important;box-shadow:0 18px 42px rgba(0,0,0,.36),inset 0 1px white!important;
  font-size:8px!important;letter-spacing:.12em!important;transition:transform .18s ease,box-shadow .18s ease!important;
}
body.kmyworld-v1 .kmw-hero .kmw-enter:hover{transform:translateX(-50%) translateY(-2px)!important;box-shadow:0 22px 48px rgba(0,0,0,.42),inset 0 1px white!important}
body.kmyworld-v1 .kmw-hero .kmw-enter:active{transform:translateX(-50%) translateY(0) scale(.985)!important}
body.kmyworld-v1 .kmw-hero .kmw-enter[aria-busy='true']{opacity:.72!important}

@media(max-width:900px){
 body.kmyworld-v1 .kmw-hero{grid-template-columns:1fr!important;min-height:auto!important}
 body.kmyworld-v1 .kmw-hero .kmw-copy{border-right:0!important;border-bottom:1px solid rgba(215,197,154,.09)!important;padding:44px 38px 34px!important}
 body.kmyworld-v1 .kmw-hero .kmw-portal{min-height:410px!important}
 body.kmyworld-v1 .kmw-hero:after{left:38px!important;bottom:auto!important;top:30px!important}
}
@media(max-width:620px){
 body.kmyworld-v1 .kmw-hero{border-radius:24px!important;box-shadow:0 24px 64px rgba(0,0,0,.30),inset 0 1px rgba(255,255,255,.04)!important}
 body.kmyworld-v1 .kmw-hero:before{left:12px!important;right:12px!important;top:12px!important;bottom:12px!important;border-radius:17px!important}
 body.kmyworld-v1 .kmw-hero:after{left:21px!important;top:20px!important;font-size:5px!important}
 body.kmyworld-v1 .kmw-hero .kmw-copy{padding:58px 23px 30px!important}
 body.kmyworld-v1 .kmw-hero .kmw-copy h2{font-size:clamp(3.45rem,16.5vw,5.15rem)!important;line-height:.84!important;margin-top:15px!important}
 body.kmyworld-v1 .kmw-hero .kmw-copy h2 em:after{bottom:-6px!important}
 body.kmyworld-v1 .kmw-hero .kmw-copy>p:not(.kmw-kicker){font-size:9px!important;line-height:1.65!important;margin-top:23px!important}
 body.kmyworld-v1 .kmw-hero .kmw-identity{margin-top:22px!important}
 body.kmyworld-v1 .kmw-hero .kmw-portal{min-height:360px!important}
 body.kmyworld-v1 .kmw-hero .kmw-portal:before,body.kmyworld-v1 .kmw-hero .kmw-portal:after{width:238px!important;height:292px!important;border-radius:125px 125px 30px 30px!important}
 body.kmyworld-v1 .kmw-hero .kmw-avatar-stage{width:138px!important;height:138px!important}
 body.kmyworld-v1 .kmw-hero .kmw-enter{bottom:28px!important;min-width:206px!important;min-height:47px!important}
}
@media(prefers-reduced-motion:reduce){body.kmyworld-v1 .kmw-hero .kmw-enter{transition:none!important}}
  `;document.head.appendChild(s);
  window.KomoMyWorldDesignS01={version:VERSION,scope:'hero-only'};
}
install();window.addEventListener('komo:my-world-rendered',install);
})();
