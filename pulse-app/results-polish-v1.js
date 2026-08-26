(() => {
  function route(){return location.hash.replace(/^#/,'')||'home'}
  function esc(v=''){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
  function enhance(){
    if(!['home','results'].includes(route()))return;
    document.querySelectorAll('.kfree-v2').forEach(card=>{
      if(card.dataset.krpEnhanced==='1')return;
      const levelText=card.querySelector('.kfree-v2-level strong')?.textContent?.trim()||'';
      const title=card.querySelector('.kfree-v2-head h2')?.textContent?.trim()||'Résultat disponible';
      const level=Number(levelText);
      const metrics=card.querySelector('.kfree-v2-metrics');
      if(!metrics)return;
      const favorable=Number.isFinite(level)&&level===0;
      const summary=document.createElement('section');summary.className='krp-summary';summary.innerHTML=`<div><p class="eyebrow">VOTRE RÉSULTAT EN UNE PHRASE</p><h3>${favorable?'Vos premiers repères sont favorables.':esc(title)}</h3><p>${favorable?'Votre questionnaire ne retrouve pas de difficulté fonctionnelle notable, votre Two-Step se situe dans la zone favorable et le Chair Stand constitue maintenant une référence personnelle de force-endurance.':'Ce résultat de repérage mérite d’être replacé dans votre contexte et, si besoin, approfondi par une évaluation Motion.'}</p></div><span class="krp-state"><i></i>${favorable?'Mobilité préservée':'À approfondir'}</span>`;
      metrics.insertAdjacentElement('afterend',summary);
      const actions=document.createElement('section');actions.className='krp-actions';actions.innerHTML=`<article class="krp-action"><span>01 · Référence</span><strong>Conserver ce point de départ</strong><small>Vos valeurs servent de comparaison lors des prochaines évaluations.</small></article><article class="krp-action"><span>02 · Approfondir</span><strong>Passer à KŌMØ Motion</strong><small>Mesurer le mouvement et la fonction musculaire avec Myodev / MyoCare.</small></article><article class="krp-action"><span>03 · Suivre</span><strong>My KŌMØ Score</strong><small>Comparer vos scores dans le temps et visualiser leur évolution.</small></article>`;summary.insertAdjacentElement('afterend',actions);
      const note=document.createElement('p');note.className='krp-note';note.innerHTML='<b>À retenir :</b> Pulse Free est un repère fonctionnel de dépistage. Il ne constitue pas un diagnostic médical et ne remplace pas une évaluation professionnelle lorsque celle-ci est indiquée.';actions.insertAdjacentElement('afterend',note);
      card.dataset.krpEnhanced='1';
    });
  }
  let queued=false;function schedule(){if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;enhance()})}
  window.addEventListener('hashchange',()=>setTimeout(schedule,80));window.addEventListener('komo:route-ready',()=>setTimeout(schedule,80));document.addEventListener('DOMContentLoaded',()=>setTimeout(schedule,900));
  const root=document.querySelector('#viewRoot');if(root)new MutationObserver(()=>schedule()).observe(root,{childList:true,subtree:true});
  setTimeout(schedule,1400);
})();