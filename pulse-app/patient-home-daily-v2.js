/* KŌMØ Pulse — Daily movement layer V2
   Daily utility: movement, verified K Points, Walk Club, Komo insight. */
(() => {
  'use strict';
  const VERSION='2.0.0';
  let timer=0;
  let loading=false;
  let lastSignature='';

  const route=()=>window.KomoPatientNavigation?.route?.()||location.hash.replace(/^#/,'')||'home';
  const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));
  const num=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
  const fmt=v=>new Intl.NumberFormat('fr-FR').format(Math.round(num(v)));

  function go(target){
    if(window.KomoPatientNavigation?.go) window.KomoPatientNavigation.go(target);
    else location.hash=target;
  }

  function openKomo(){
    const launcher=document.querySelector('#komoPatientGuideLauncher')||document.querySelector('#komoOperatorLauncher');
    if(launcher){launcher.click();return}
    window.dispatchEvent(new CustomEvent('komo:operator-open',{detail:{source:'home-daily-v2',route:'home'}}));
  }

  async function load(){
    const sb=window.KomoRuntime?.client;
    if(!sb) return null;
    const session=window.KomoRuntime?.getContext?.()?.session||(await sb.auth.getSession()).data?.session;
    if(!session?.user) return null;
    const {data,error}=await sb.rpc('komo_walk_summary');
    if(error) throw error;
    return data||null;
  }

  function insight(s){
    if(!s?.connected) return {title:'Connectez KEY pour suivre votre mouvement.',copy:'Vos pas restent privés et ne génèrent des K Points que lorsque le suivi connecté est activé.'};
    const steps=num(s.steps_today),goal=Math.max(1,num(s.daily_goal)||8000),left=Math.max(0,goal-steps),kp=num(s.k_points_today);
    const club=s.walk_club||{};
    const rank=club.joined&&club.rank?` Vous êtes #${club.rank}${club.member_count?` sur ${club.member_count}`:''} au Walk Club cette semaine.`:'';
    if(steps<=0) return {title:'Votre journée commence ici.',copy:'Aucun pas vérifié reçu aujourd’hui pour le moment. Komo mettra cet écran à jour dès la prochaine synchronisation.'};
    if(steps<goal) return {title:`Encore ${fmt(left)} pas pour votre repère du jour.`,copy:`Vous avez déjà marché ${fmt(steps)} pas et gagné ${fmt(kp)} K Points aujourd’hui.${rank}`};
    return {title:'Repère du jour atteint.',copy:`${fmt(steps)} pas vérifiés aujourd’hui · +${fmt(kp)} K Points.${rank}`};
  }

  function markup(s){
    const connected=Boolean(s?.connected);
    const steps=connected?num(s.steps_today):0;
    const goal=Math.max(1,num(s?.daily_goal)||8000);
    const pct=connected?Math.max(0,Math.min(100,num(s?.goal_pct))):0;
    const todayKp=connected?num(s?.k_points_today):0;
    const weekKp=connected?num(s?.k_points_week):0;
    const weekSteps=connected?num(s?.week_steps):0;
    const club=s?.walk_club||{};
    const text=insight(s);
    const clubValue=club.joined&&club.rank?`#${club.rank}`:'—';
    const clubCopy=club.joined
      ? `${fmt(weekSteps)} pas cette semaine${club.member_count?` · ${club.member_count} membres`:''}`
      : 'Participation volontaire. Votre profil peut rester privé.';

    return `<section class="kday" data-kday-v2>
      <div class="kday-top">
        <div class="kday-title"><span>AUJOURD’HUI · KEY</span><h3>Votre mouvement, maintenant.</h3></div>
        <span class="kday-source ${connected?'is-on':'is-off'}"><i></i>${connected?'Données connectées':'KEY non connecté'}</span>
      </div>
      <div class="kday-grid">
        <article class="kday-steps">
          <small>PAS AUJOURD’HUI</small>
          <div><strong>${connected?fmt(steps):'—'}</strong><span>/ ${fmt(goal)}</span></div>
          <div class="kday-track" aria-label="${Math.round(pct)} % du repère quotidien"><i style="width:${pct}%"></i></div>
          <p>${connected?`${Math.round(pct)} % du repère actuel`:'Activez le suivi connecté pour commencer.'}</p>
        </article>
        <article>
          <small>K POINTS</small>
          <div class="kday-number"><strong>${connected?`+${fmt(todayKp)}`:'—'}</strong><span>KP aujourd’hui</span></div>
          <p>${connected?`${fmt(weekKp)} KP gagnés cette semaine grâce à la marche vérifiée.`:'Les saisies manuelles ne créent pas de K Points.'}</p>
          <button type="button" data-kday-route="mykomo">Voir mon Wallet →</button>
        </article>
        <article>
          <small>WALK CLUB</small>
          <div class="kday-number"><strong>${clubValue}</strong><span>${club.joined?'cette semaine':'classement'}</span></div>
          <p>${esc(clubCopy)}</p>
          <button type="button" data-kday-route="mykomo">Voir le Club →</button>
        </article>
      </div>
      <button class="kday-komo" type="button" data-kday-komo>
        <span class="kday-eyes" aria-hidden="true">ōø</span>
        <span><small>KOMO · INSIGHT</small><strong>${esc(text.title)}</strong><em>${esc(text.copy)}</em></span>
        <b aria-hidden="true">→</b>
      </button>
    </section>`;
  }

  function bind(host){
    host.querySelectorAll('[data-kday-route]').forEach(btn=>btn.addEventListener('click',()=>go(btn.dataset.kdayRoute||'mykomo')));
    host.querySelector('[data-kday-komo]')?.addEventListener('click',openKomo);
  }

  async function render(force=false){
    if(route()!=='home') return;
    const home=document.querySelector('[data-my-komo-home]');
    const wall=home?.querySelector('[data-khome-datawall]');
    if(!wall||loading) return;
    loading=true;
    try{
      const s=await load();
      if(!s) return;
      const html=markup(s);
      const signature=JSON.stringify(s);
      if(!force&&signature===lastSignature&&wall.querySelector('[data-kday-v2]')) return;
      wall.querySelector('[data-kday-v2]')?.remove();
      const wrap=document.createElement('div');wrap.innerHTML=html;
      const node=wrap.firstElementChild;
      const head=wall.querySelector('.khv-head');
      if(head) head.insertAdjacentElement('afterend',node); else wall.prepend(node);
      bind(node);
      wall.classList.add('khv-daily-v2');
      lastSignature=signature;
    }catch(e){console.warn('[patient-home-daily-v2]',e)}finally{loading=false}
  }

  function schedule(force=false,ms=120){clearTimeout(timer);timer=setTimeout(()=>render(force),ms)}
  ['hashchange','pageshow','komo:route-ready','komo:data-ready','komo:wearable-data-updated','komo:session-ready'].forEach(name=>window.addEventListener(name,()=>schedule(name==='komo:data-ready'||name==='komo:wearable-data-updated')));
  const observer=new MutationObserver(()=>{if(route()==='home'&&!document.querySelector('[data-kday-v2]'))schedule(false,80)});
  function boot(){observer.observe(document.body,{subtree:true,childList:true});schedule(true,700);setTimeout(()=>render(true),1600)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.KomoPatientHomeDaily={version:VERSION,refresh:()=>schedule(true,20)};
})();