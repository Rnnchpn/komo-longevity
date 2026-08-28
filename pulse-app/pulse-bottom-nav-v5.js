/* KŌMØ Pulse — canonical patient dock v5.1.0
   Event-driven dock. No global MutationObserver. Uses KomoPatientNavigation. */
(() => {
'use strict';
const V='5.1.0';
const items=[
  ['home','Accueil','⌂','home',''],
  ['assessment','KŌMØ','↗','', 'Motion / Clinical'],
  ['mykomo','My KŌMØ','◉','mykomo',''],
  ['club','Club','∞','club',''],
  ['trajectory','Trajectoire','⌁','trajectory',''],
  ['agenda','Agenda','□','documents','']
];
let raf=0;
const nav=()=>window.KomoPatientNavigation;
const route=()=>nav()?.route?.()||location.hash.replace(/^#/,'')||'home';
const visible=()=>{const a=document.querySelector('#appShell'),x=document.querySelector('#authScreen');return !!a&&!a.hidden&&(!x||x.hidden)&&!['clinical','admin'].includes(route())};
const active=()=>route()==='motion'?'assessment':route()==='mykomo'?'mykomo':route()==='club'?'club':route()==='trajectory'?'trajectory':route()==='documents'?'agenda':'home';

function css(){if(document.querySelector('#kpDock500'))return;const s=document.createElement('style');s.id='kpDock500';s.textContent=`
#kpDockV5{position:fixed;z-index:190;left:50%;bottom:max(10px,env(safe-area-inset-bottom));transform:translateX(-50%);width:min(920px,calc(100vw - 28px));height:72px;padding:6px;display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:3px;border:1px solid rgba(255,255,255,.1);border-radius:24px;background:linear-gradient(145deg,#203027,#17231c);box-shadow:0 18px 56px rgba(18,28,21,.25);isolation:isolate;overflow:hidden;box-sizing:border-box}#kpDockV5[hidden]{display:none!important}
#kpDockV5 .kp5-indicator{position:absolute;z-index:0;top:6px;left:6px;height:60px;border-radius:18px;background:linear-gradient(145deg,#faf7f0,#ebe7dd);box-shadow:0 8px 24px rgba(5,14,8,.18);transition:transform .34s cubic-bezier(.2,.82,.22,1),width .24s ease;pointer-events:none}
#kpDockV5 button{position:relative;z-index:1;height:60px;min-width:0;border:0;border-radius:18px;background:transparent;color:rgba(247,248,245,.62);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;padding:3px;font-family:'DM Sans',sans-serif;cursor:pointer;transition:color .2s ease,transform .14s ease}#kpDockV5 button:active{transform:scale(.965)}#kpDockV5 button.active{color:#20362a}#kpDockV5 .kp5-icon{font-size:18px;line-height:1;transition:transform .22s ease}#kpDockV5 button.active .kp5-icon{transform:translateY(-2px) scale(1.08)}#kpDockV5 b{max-width:100%;font-size:9px;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#kpDockV5 small{font-size:5.7px;line-height:1;text-transform:uppercase;letter-spacing:.045em;opacity:.72;white-space:nowrap}
#kpPickerV5Bg{position:fixed;z-index:194;inset:0;border:0;background:rgba(20,29,23,.32);backdrop-filter:blur(5px);opacity:0;pointer-events:none;transition:.2s}#kpPickerV5Bg.open{opacity:1;pointer-events:auto}#kpPickerV5{position:fixed;z-index:195;left:50%;bottom:96px;width:min(540px,calc(100vw - 24px));padding:14px;border-radius:26px;background:#fbfaf7;box-shadow:0 30px 92px rgba(20,31,23,.28);transform:translate(-50%,125%) scale(.98);opacity:0;pointer-events:none;transition:.3s cubic-bezier(.2,.82,.22,1)}#kpPickerV5.open{transform:translate(-50%,0) scale(1);opacity:1;pointer-events:auto}.kp5-picker-head{display:flex;justify-content:space-between;align-items:center;padding:5px 5px 12px}.kp5-picker-head small{display:block;font-size:7px;letter-spacing:.12em;color:#788078}.kp5-picker-head strong{display:block;margin-top:4px;font:600 21px/1 Manrope,sans-serif}.kp5-picker-head button{width:36px;height:36px;border:1px solid #e3dfd7;border-radius:50%;background:#fff}.kp5-picker-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.kp5-choice{min-height:142px;padding:17px;border:1px solid rgba(35,48,39,.08);border-radius:20px;background:#f1eee6;text-align:left;color:#26372d}.kp5-choice.motion{background:#263b2e;color:#fff}.kp5-choice small{display:block;font-size:7px;letter-spacing:.1em;text-transform:uppercase;opacity:.6}.kp5-choice strong{display:block;margin-top:8px;font:600 20px/1 Manrope,sans-serif}.kp5-choice p{font-size:9px;line-height:1.45;opacity:.65}
@media(max-width:760px){#kpDockV5{left:7px;right:7px;width:auto;height:68px;bottom:max(7px,env(safe-area-inset-bottom));transform:none;border-radius:21px;padding:5px}#kpDockV5 .kp5-indicator{top:5px;left:5px;height:58px}#kpDockV5 button{height:58px;padding:2px 1px}#kpDockV5 .kp5-icon{font-size:16px}#kpDockV5 b{font-size:6.9px}#kpDockV5 small{font-size:4.5px}#kpPickerV5{bottom:86px}.kp5-picker-grid{grid-template-columns:1fr}}
@media(max-width:390px){#kpDockV5 b{font-size:6.2px}#kpDockV5 .kp5-icon{font-size:15px}}
@media(prefers-reduced-motion:reduce){#kpDockV5 .kp5-indicator,#kpPickerV5,#kpPickerV5Bg{transition:none!important}}
`;document.head.appendChild(s)}

function markup(){return '<i class="kp5-indicator"></i>'+items.map(([k,l,ic,,sub])=>`<button type="button" data-kp5="${k}" aria-label="${l}"><span class="kp5-icon">${ic}</span><b>${l}</b>${sub?`<small>${sub}</small>`:''}</button>`).join('')}
function ensureDock(){const app=document.querySelector('#appShell');if(!app)return null;let d=document.querySelector('#kpDockV5');if(!d){d=document.createElement('nav');d.id='kpDockV5';d.setAttribute('aria-label','Navigation KŌMØ Pulse');d.innerHTML=markup();app.appendChild(d)}return d}
function ensurePicker(){if(document.querySelector('#kpPickerV5'))return;const app=document.querySelector('#appShell')||document.body;const bg=document.createElement('button'),p=document.createElement('aside');bg.id='kpPickerV5Bg';bg.setAttribute('aria-label','Fermer');p.id='kpPickerV5';p.innerHTML='<div class="kp5-picker-head"><div><small>KŌMØ PULSE · BILANS</small><strong>Choisissez votre parcours.</strong></div><button type="button" data-kp5-close>×</button></div><div class="kp5-picker-grid"><button type="button" class="kp5-choice motion" data-kp5-choice="motion"><small>Bilan fonctionnel</small><strong>KŌMØ Motion</strong><p>Questionnaires, tests, MyoCare et Motion Score.</p></button><button type="button" class="kp5-choice" data-kp5-choice="clinical"><small>Bilan approfondi</small><strong>KŌMØ Clinical</strong><p>Planifier l’évaluation clinique avec un professionnel.</p></button></div>';app.append(bg,p);bg.addEventListener('click',closePicker)}
function openPicker(){ensurePicker();requestAnimationFrame(()=>{document.querySelector('#kpPickerV5Bg')?.classList.add('open');document.querySelector('#kpPickerV5')?.classList.add('open')})}
function closePicker(){document.querySelector('#kpPickerV5Bg')?.classList.remove('open');document.querySelector('#kpPickerV5')?.classList.remove('open')}
function paint(){const d=document.querySelector('#kpDockV5');if(!d||d.hidden)return;const key=active();const bs=[...d.querySelectorAll('[data-kp5]')];bs.forEach(b=>b.classList.toggle('active',b.dataset.kp5===key));const b=bs.find(x=>x.dataset.kp5===key),i=d.querySelector('.kp5-indicator');if(b&&i){const pad=parseFloat(getComputedStyle(d).paddingLeft)||0;i.style.width=`${b.offsetWidth}px`;i.style.transform=`translateX(${Math.max(0,b.offsetLeft-pad)}px)`}}
function refresh(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{css();const d=ensureDock();if(!d)return;const show=visible();d.hidden=!show;if(show)requestAnimationFrame(paint);else closePicker()})}
function go(r){closePicker();if(nav()?.go)nav().go(r);else location.hash=r}
function clinical(){sessionStorage.setItem('komo_home_booking_service','clinical');go('documents');let n=0;const q=setInterval(()=>{n++;const b=document.querySelector('[data-kbook-service="clinical"]');if(b){b.click();clearInterval(q)}else if(n>24)clearInterval(q)},100)}

document.addEventListener('click',e=>{const b=e.target.closest?.('#kpDockV5 [data-kp5]');if(b){e.preventDefault();e.stopPropagation();const k=b.dataset.kp5;if(k==='assessment')openPicker();else{const x=items.find(i=>i[0]===k);if(x?.[3])go(x[3])}return}const c=e.target.closest?.('[data-kp5-choice]');if(c){e.preventDefault();c.dataset.kp5Choice==='motion'?go('motion'):clinical();return}if(e.target.closest?.('[data-kp5-close]')){e.preventDefault();closePicker()}},true);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closePicker()});
['hashchange','pageshow','resize','orientationchange','komo:canonical-route','komo:session-ready','komo:session-cleared'].forEach(x=>window.addEventListener(x,refresh));
document.addEventListener('DOMContentLoaded',()=>setTimeout(refresh,250));setTimeout(refresh,700);
window.KomoBottomNav={version:V,refresh};
})();