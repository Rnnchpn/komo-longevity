(() => {
  const route=()=>location.hash.replace(/^#/,'')||'home';
  function patch(){
    if(route()!=='mykomo') return;
    const trusted=document.querySelector('.keco-trusted');
    if(trusted){
      const title=trusted.querySelector('strong');
      const copy=trusted.querySelector('p');
      if(title) title.textContent='Bilans validés → KŌMØ Points';
      if(copy) copy.textContent='Seuls les bilans KŌMØ Motion et Clinical validés par le parcours professionnel alimentent le compteur marchand. Tous les 500 XP vérifiés, +250 KP sont crédités dans votre wallet.';
    }
    const legends=document.querySelectorAll('.keco-legend article');
    if(legends[0]){
      const p=legends[0].querySelector('p');
      if(p) p.textContent='Pas, défis, Start et autres actions dans Pulse font progresser votre niveau. L’XP ne se dépense jamais et n’a pas de valeur monétaire.';
    }
    if(legends[1]){
      const strong=legends[1].querySelector('strong');
      const p=legends[1].querySelector('p');
      if(strong) strong.textContent='Réservé aux parcours validés.';
      if(p) p.textContent='Les KP sont un portefeuille de fidélité séparé. Les saisies manuelles, défis, profil et Start ne peuvent pas créer de valeur marchande.';
    }
  }
  const schedule=()=>{setTimeout(patch,40);setTimeout(patch,220)};
  window.addEventListener('hashchange',schedule);
  window.addEventListener('komo:route-ready',schedule);
  window.addEventListener('komo:data-ready',schedule);
  document.addEventListener('DOMContentLoaded',()=>setTimeout(patch,850));
  new MutationObserver(()=>{if(route()==='mykomo'&&document.querySelector('.keco'))patch()}).observe(document.body,{childList:true,subtree:true});
})();
