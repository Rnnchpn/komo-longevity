import { loadCanonicalResult } from './canonical-result-runtime.js';

const VERSION='3.0.0';
let timer=null;

const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const route=()=>location.hash.replace(/^#/,'')||'home';
const txt=el=>el?.textContent?.trim()||'';
const numberFrom=(v,fallback=0)=>{const n=Number(String(v??'').replace(/[^0-9.-]+/g,''));return Number.isFinite(n)?n:fallback};
function toast(message){const t=document.querySelector('#toast');if(!t)return;t.textContent=message;t.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>t.hidden=true,2800)}

function ensureStyle(){
  if(document.querySelector('#khomeDataWallV3Style'))return;
  const s=document.createElement('style');s.id='khomeDataWallV3Style';s.textContent=`
  body.khome-v3{background:#f3f1eb}
  body.khome-v3 .mykomo-grid{grid-template-columns:1fr!important;gap:0!important}
  body.khome-v3 .mykomo-side,body.khome-v3 .mykomo-engagement,body.khome-v3 [data-kcanon-home],body.khome-v3 [data-kla-home],body.khome-v3 [data-khome-actions],body.khome-v3 [data-khome-experience],body.khome-v3 [data-khome-connected]{display:none!important}
  body.khome-v3 .mykomo-score-card{padding:12px 4px 4px!important;border:0!important;background:transparent!important}
  body.khome-v3 .mykomo-score-card .mykomo-rings{opacity:.82;transform:scale(.96);transform-origin:center top}
  .kdw{margin-top:14px;display:grid;gap:12px}
  .kdw-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
  .kdw-action{min-height:106px;padding:16px 17px;border:1px solid rgba(35,48,39,.08);border-radius:20px;background:#fff;color:#243128;display:flex;flex-direction:column;justify-content:space-between;text-align:left;cursor:pointer;box-shadow:0 8px 28px rgba(35,48,39,.035);transition:transform .18s ease,box-shadow .18s ease}
  .kdw-action:hover{transform:translateY(-2px);box-shadow:0 14px 34px rgba(35,48,39,.07)}
  .kdw-action.primary{background:#26372d;color:#fff;border-color:#26372d}.kdw-action.soft{background:#e9ede6}.kdw-action.sand{background:#eee9df}
  .kdw-action-head{display:flex;justify-content:space-between;align-items:center}.kdw-action-icon{width:31px;height:31px;border-radius:11px;background:rgba(255,255,255,.78);display:grid;place-items:center;font-size:14px;color:#314339}.kdw-action.primary .kdw-action-icon{background:rgba(255,255,255,.12);color:#fff}.kdw-action-arrow{font-size:18px;opacity:.5}
  .kdw-action small{display:block;font-size:6.5px;font-weight:800;letter-spacing:.13em;text-transform:uppercase;opacity:.54}.kdw-action strong{display:block;margin-top:5px;font:600 17px/1.08 Manrope,'DM Sans',sans-serif;letter-spacing:-.035em}.kdw-action p{margin:5px 0 0;max-width:280px;font-size:8px;line-height:1.45;opacity:.6}
  .kdw-grid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-auto-rows:minmax(138px,auto);gap:10px}
  .kdw-card{position:relative;overflow:hidden;border:1px solid rgba(35,48,39,.075);border-radius:24px;background:#fff;box-shadow:0 10px 32px rgba(35,48,39,.035);color:#26372d}
  .kdw-card:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(145deg,rgba(255,255,255,.45),transparent 45%)}
  .kdw-score{grid-column:span 4;grid-row:span 2;min-height:292px;padding:20px;display:grid;align-content:space-between;background:#fbfaf7}
  .kdw-age{grid-column:span 4;grid-row:span 2;min-height:292px;padding:20px;background:radial-gradient(circle at 85% 15%,rgba(104,132,111,.11),transparent 32%),#eef1ea;display:grid;align-content:space-between}
  .kdw-next{grid-column:span 4;padding:18px;background:#fff}.kdw-today{grid-column:span 2;padding:18px;background:#f4f0e7}.kdw-exp{grid-column:span 2;padding:18px;background:#e9ede7}
  .kdw-eyebrow{position:relative;z-index:1;color:#7b847d;font-size:6.5px;font-weight:800;letter-spacing:.15em;text-transform:uppercase}.kdw-card h3{position:relative;z-index:1;margin:5px 0 0;font:600 17px/1.08 Manrope,'DM Sans',sans-serif;letter-spacing:-.035em}
  .kdw-ring-wrap{position:relative;z-index:1;display:grid;place-items:center;margin:6px 0}.kdw-ring{--v:0;width:178px;height:178px;border-radius:50%;display:grid;place-items:center;background:conic-gradient(#496454 calc(var(--v)*1%),#e4e4de 0);position:relative}.kdw-ring:after{content:"";position:absolute;inset:13px;background:#fbfaf7;border-radius:50%;box-shadow:inset 0 0 0 1px rgba(35,48,39,.05)}.kdw-ring-core{position:relative;z-index:1;text-align:center}.kdw-ring-core strong{display:block;font:600 47px/.92 Manrope,'DM Sans',sans-serif;letter-spacing:-.07em}.kdw-ring-core strong small{font-size:13px;letter-spacing:0;color:#7b847d}.kdw-ring-core span{display:block;margin-top:8px;color:#758079;font-size:7px;font-weight:800;letter-spacing:.12em;text-transform:uppercase}
  .kdw-score-foot{position:relative;z-index:1;display:grid;grid-template-columns:1fr 1fr;gap:6px}.kdw-mini{padding:9px 10px;border-radius:13px;background:#f0eee8}.kdw-mini small{display:block;color:#858c86;font-size:6px;text-transform:uppercase;letter-spacing:.09em}.kdw-mini strong{display:block;margin-top:4px;font-size:12px}
  .kdw-age-main{position:relative;z-index:1;display:grid;place-items:center;text-align:center;padding:10px 0}.kdw-age-main strong{display:block;font:600 46px/.92 Manrope,'DM Sans',sans-serif;letter-spacing:-.065em}.kdw-age-main strong small{font-size:13px;letter-spacing:0}.kdw-age-main span{display:block;margin-top:7px;font-size:8px;color:#718077}.kdw-age-orbit{position:absolute;right:-44px;top:-44px;width:180px;height:180px;border-radius:50%;border:1px solid rgba(73,100,84,.10);box-shadow:0 0 0 24px rgba(73,100,84,.035),0 0 0 48px rgba(73,100,84,.025)}
  .kdw-age-foot{position:relative;z-index:1;padding:10px 11px;border-radius:13px;background:rgba(255,255,255,.72);font-size:7.5px;line-height:1.4;color:#69776e}.kdw-age-tag{position:absolute;right:14px;top:14px;z-index:2;padding:5px 7px;border-radius:999px;background:rgba(255,255,255,.78);color:#7b817c;font-size:5.8px;font-weight:800;letter-spacing:.08em;text-transform:uppercase}
  .kdw-next strong.big{position:relative;z-index:1;display:block;margin-top:18px;font:600 22px/1.04 Manrope,'DM Sans',sans-serif;letter-spacing:-.045em}.kdw-next p{position:relative;z-index:1;margin:7px 0 0;color:#78817a;font-size:8px;line-height:1.45}.kdw-next button,.kdw-link{position:relative;z-index:1;margin-top:15px;padding:0;border:0;background:transparent;color:#496052;font:800 8px DM Sans,sans-serif;cursor:pointer}
  .kdw-today-value{position:relative;z-index:1;margin-top:17px}.kdw-today-value strong{display:block;font:600 30px/1 Manrope,'DM Sans',sans-serif;letter-spacing:-.055em}.kdw-today-value span{display:block;margin-top:4px;color:#7c847e;font-size:7px}.kdw-today-bar{position:relative;z-index:1;height:7px;margin-top:14px;border-radius:999px;background:#ddd9cf;overflow:hidden}.kdw-today-bar i{display:block;height:100%;width:var(--p);border-radius:inherit;background:#52705c}.kdw-today-meta{position:relative;z-index:1;display:flex;justify-content:space-between;gap:8px;margin-top:9px;color:#7c847e;font-size:6.5px}
  .kdw-exp-dial{--p:0;position:relative;z-index:1;width:82px;height:82px;margin:10px auto 0;border-radius:50%;background:conic-gradient(#46624f calc(var(--p)*1%),rgba(70,98,79,.12) 0);display:grid;place-items:center}.kdw-exp-dial:after{content:"";position:absolute;inset:8px;border-radius:50%;background:#e9ede7}.kdw-exp-core{position:relative;z-index:1;text-align:center}.kdw-exp-core strong{display:block;font:600 23px/.9 Manrope,sans-serif}.kdw-exp-core span{display:block;margin-top:4px;font-size:5.5px;color:#738078;text-transform:uppercase;letter-spacing:.09em}.kdw-exp-foot{position:relative;z-index:1;display:flex;justify-content:space-between;margin-top:10px;color:#68766d;font-size:6.5px}
  .kdw-connected{grid-column:1/-1;padding:18px 18px 16px;background:#faf8f3}.kdw-connected-head{position:relative;z-index:1;display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.kdw-connected-head p{margin:5px 0 0;color:#7b837d;font-size:8px}.kdw-connected-grid{position:relative;z-index:1;display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;margin-top:13px}.kdw-device{min-height:82px;padding:11px;border-radius:15px;background:#fff;border:1px solid rgba(35,48,39,.06);display:grid;grid-template-columns:auto 1fr;gap:9px;align-items:center;cursor:pointer}.kdw-device-logo{width:32px;height:32px;border-radius:11px;background:#edf0eb;display:grid;place-items:center;font-size:12px;font-weight:800;color:#344a3b}.kdw-device strong{display:block;font-size:9px}.kdw-device small{display:block;margin-top:3px;color:#879089;font-size:6.2px;line-height:1.3}.kdw-device em{display:inline-flex;margin-top:5px;padding:3px 5px;border-radius:999px;background:#efede7;color:#808680;font-style:normal;font-size:5.5px;font-weight:800;text-transform:uppercase;letter-spacing:.07em}
  @media(max-width:1050px){.kdw-score,.kdw-age{grid-column:span 6}.kdw-next{grid-column:span 6}.kdw-today,.kdw-exp{grid-column:span 3}.kdw-connected-grid{grid-template-columns:repeat(3,1fr)}}
  @media(max-width:760px){body.khome-v3 .mykomo-score-card .mykomo-rings{transform:none}.kdw-actions{grid-template-columns:1fr}.kdw-action{min-height:92px}.kdw-grid{grid-template-columns:1fr;grid-auto-rows:auto}.kdw-score,.kdw-age,.kdw-next,.kdw-today,.kdw-exp,.kdw-connected{grid-column:1!important;grid-row:auto!important;min-height:0}.kdw-score,.kdw-age{min-height:270px}.kdw-ring{width:156px;height:156px}.kdw-connected-grid{grid-template-columns:1fr 1fr}}
  @media(max-width:430px){.kdw-connected-grid{grid-template-columns:1fr}.kdw-card{border-radius:20px}}
  `;document.head.appendChild(s);
}

function readRing(index){const item=[...document.querySelectorAll('[data-my-komo-home] .mykomo-ring-item')][index];return numberFrom(txt(item?.querySelector('.mykomo-ring strong')),null)}
function readAppointment(){const b=document.querySelector('.mykomo-next');const title=txt(b?.querySelector('strong'))||'Aucun rendez-vous planifié';const meta=txt(b?.querySelector('small'))||'Choisissez votre prochaine étape KŌMØ.';return{title,meta}}
function readExperience(){const level=numberFrom(txt(document.querySelector('.mykomo-xp-head strong')),1);const foot=[...document.querySelectorAll('.mykomo-xp-foot span')].map(txt);const total=numberFrom(foot[0],0),next=numberFrom(foot[1],500);const pct=Math.max(0,Math.min(100,numberFrom(document.querySelector('.mykomo-xp-track')?.style?.getPropertyValue('--xp'),0)));const today=numberFrom(txt(document.querySelector('.mykomo-today-xp strong')),0);const steps=numberFrom(txt(document.querySelector('.mykomo-step-number strong')),0);return{level,total,next,pct,today,steps}}
function motionStatus(result){const r=result?.score?.release_status;return r==='released'?'Publié':r==='clinician_reviewed'?'Relu':'Calculé'}

function actionsHtml(a){return `<section class="kdw-actions">
<button class="kdw-action sand" data-kdw-book type="button"><div class="kdw-action-head"><span class="kdw-action-icon">◷</span><span class="kdw-action-arrow">→</span></div><div><small>Rendez-vous</small><strong>Prendre rendez-vous</strong><p>${esc(a.title==='Aucun rendez-vous planifié'?'Aucun rendez-vous planifié':a.meta)}</p></div></button>
<button class="kdw-action primary" data-kdw-motion type="button"><div class="kdw-action-head"><span class="kdw-action-icon">↗</span><span class="kdw-action-arrow">→</span></div><div><small>Bilan fonctionnel</small><strong>Démarrer KŌMØ Motion</strong><p>Préparation, tests, acquisition MyoCare et résultat.</p></div></button>
<button class="kdw-action soft" data-kdw-clinical type="button"><div class="kdw-action-head"><span class="kdw-action-icon">＋</span><span class="kdw-action-arrow">→</span></div><div><small>Bilan approfondi</small><strong>Démarrer KŌMØ Clinical</strong><p>Planifier le bilan clinique complet avec un professionnel.</p></div></button>
</section>`}

function devicesHtml(){const d=[['','Apple Health','iPhone · Watch'],['G','Garmin','activité · sommeil'],['W','WHOOP','recovery · strain'],['O','Oura','sleep · readiness'],['S','Strava','sport · charge']];return d.map(([logo,name,sub])=>`<button class="kdw-device" data-kdw-device="${esc(name)}" type="button"><span class="kdw-device-logo">${logo}</span><span><strong>${name}</strong><small>${sub}</small><em>À connecter</em></span></button>`).join('')}

function dataWallHtml(result){
  const score=Number(result?.score?.motion_score);const motion=Number.isFinite(score)?Math.round(score):null;const age=result?.locomotorAge||{};const exp=readExperience(),appt=readAppointment(),start=readRing(0),clinical=readRing(2);const stepPct=Math.min(100,Math.round(exp.steps/10000*100));
  const ageAvailable=age.status==='available';const ageValue=ageAvailable?`${Math.round(age.age)} <small>ans</small>`:'—';const ageCopy=ageAvailable?`Âge réel ${age.chronologicalAge} ans · ${age.deltaYears<0?Math.abs(Math.round(age.deltaYears))+' ans plus jeune':age.deltaYears>0?Math.round(age.deltaYears)+' ans plus âgé':'proche de l’âge réel'}`:(age.reason||'Données fonctionnelles à compléter ou à vérifier.');
  return `<section class="kdw" data-khome-datawall>${actionsHtml(appt)}<div class="kdw-grid">
  <article class="kdw-card kdw-score"><div><div class="kdw-eyebrow">KŌMØ MOTION</div><h3>Votre Motion Score.</h3></div><div class="kdw-ring-wrap"><button class="kdw-ring" style="--v:${motion??0}" data-kdw-results type="button"><span class="kdw-ring-core"><strong>${motion??'—'}${motion!==null?'<small>/100</small>':''}</strong><span>${motionStatus(result)}</span></span></button></div><div class="kdw-score-foot"><div class="kdw-mini"><small>KŌMØ Start</small><strong>${start===null?'—':Math.round(start)+'/100'}</strong></div><div class="kdw-mini"><small>Clinical</small><strong>${clinical===null?'—':Math.round(clinical)+'/100'}</strong></div></div></article>
  <article class="kdw-card kdw-age"><i class="kdw-age-orbit"></i><span class="kdw-age-tag">Expérimental v0.1</span><div><div class="kdw-eyebrow">KŌMØ LOCOMOTOR AGE</div><h3>Votre âge fonctionnel.</h3></div><div class="kdw-age-main"><strong>${ageValue}</strong><span>${ageAvailable?`Intervalle ${age.interval?.[0]}–${age.interval?.[1]} ans`:'Non calculable actuellement'}</span></div><div class="kdw-age-foot">${esc(ageCopy)} <button class="kdw-link" data-kdw-results type="button">Comprendre →</button></div></article>
  <article class="kdw-card kdw-next"><div class="kdw-eyebrow">PROCHAIN RENDEZ-VOUS</div><strong class="big">${esc(appt.title)}</strong><p>${esc(appt.meta)}</p><button data-kdw-book type="button">Voir le planning →</button></article>
  <article class="kdw-card kdw-today"><div class="kdw-eyebrow">AUJOURD’HUI</div><div class="kdw-today-value"><strong>${exp.steps.toLocaleString('fr-FR')}</strong><span>pas enregistrés</span></div><div class="kdw-today-bar" style="--p:${stepPct}%"><i></i></div><div class="kdw-today-meta"><span>${stepPct}% objectif</span><span>+${exp.today} XP</span></div></article>
  <article class="kdw-card kdw-exp"><div class="kdw-eyebrow">EXPÉRIENCE KŌMØ</div><div class="kdw-exp-dial" style="--p:${exp.pct}"><span class="kdw-exp-core"><strong>${exp.level}</strong><span>Niveau</span></span></div><div class="kdw-exp-foot"><span>${exp.total} XP</span><span>${Math.round(exp.pct)}%</span></div><button class="kdw-link" data-kdw-experience type="button">Voir My KŌMØ →</button></article>
  <article class="kdw-card kdw-connected"><div class="kdw-connected-head"><div><div class="kdw-eyebrow">MES DONNÉES CONNECTÉES</div><h3>Reliez votre quotidien à KŌMØ.</h3><p>Les données wearables enrichiront le suivi longitudinal sans modifier un score clinique sans validation.</p></div><button class="kdw-link" data-kdw-connections type="button">Gérer →</button></div><div class="kdw-connected-grid">${devicesHtml()}</div></article>
  </div></section>`;
}

function bind(host){
  host.querySelectorAll('[data-kdw-book]').forEach(b=>b.addEventListener('click',()=>location.hash='documents'));
  host.querySelector('[data-kdw-motion]')?.addEventListener('click',()=>location.hash='motion');
  host.querySelector('[data-kdw-clinical]')?.addEventListener('click',()=>{location.hash='documents';let i=0;const t=setInterval(()=>{i++;const b=document.querySelector('[data-kbook-service="clinical"]');if(b){b.click();clearInterval(t)}else if(i>30)clearInterval(t)},100)});
  host.querySelectorAll('[data-kdw-results]').forEach(b=>b.addEventListener('click',()=>location.hash='path'));
  host.querySelector('[data-kdw-experience]')?.addEventListener('click',()=>location.hash='path');
  host.querySelector('[data-kdw-connections]')?.addEventListener('click',()=>toast('Centre de connexions wearables : prochaine étape.'));
  host.querySelectorAll('[data-kdw-device]').forEach(b=>b.addEventListener('click',()=>toast(`${b.dataset.kdwDevice} : connexion sécurisée à activer.`)));
}

async function render(force=false){
  if(route()!=='home'){document.body.classList.remove('khome-v3');return}
  ensureStyle();document.body.classList.add('khome-v3');
  const home=document.querySelector('[data-my-komo-home]');if(!home)return;
  try{const result=await loadCanonicalResult({force});home.querySelector('[data-khome-datawall]')?.remove();const wrap=document.createElement('div');wrap.innerHTML=dataWallHtml(result);const wall=wrap.firstElementChild;home.appendChild(wall);bind(wall)}catch(e){console.error('[patient-home-datawall-v3]',e)}
}
function schedule(force=false){clearTimeout(timer);timer=setTimeout(()=>render(force),180)}
window.addEventListener('hashchange',()=>schedule(false));window.addEventListener('komo:route-ready',()=>schedule(false));window.addEventListener('komo:data-ready',()=>schedule(true));window.addEventListener('komo:canonical-result-ready',()=>schedule(false));document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>render(true),1400));new MutationObserver(()=>{if(route()==='home'&&!document.querySelector('[data-khome-datawall]'))schedule(false)}).observe(document.body,{childList:true,subtree:true});setTimeout(()=>render(true),2100);
window.KomoPatientHomeDataWall={version:VERSION,refresh:()=>schedule(true)};
