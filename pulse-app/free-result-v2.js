(() => {
  const ROUTE='results';
  const KEYS=['baseline','chair_stand','two_step'];

  function addStyles(){
    if(document.querySelector('#free-result-v2-style')) return;
    const style=document.createElement('style');
    style.id='free-result-v2-style';
    style.textContent=`
      .pulse-free-result-v2{margin:26px 0;padding:0!important;overflow:hidden;border:1px solid rgba(34,45,36,.12)!important;border-radius:28px!important;background:#f7f4ed!important;box-shadow:0 24px 70px rgba(41,49,40,.08)}
      .fr2-hero{display:grid;grid-template-columns:minmax(0,1fr) 138px;gap:28px;align-items:center;padding:34px;background:linear-gradient(135deg,#263228 0%,#334037 64%,#445148 100%);color:#fff}.fr2-hero .eyebrow{color:rgba(255,255,255,.62)}.fr2-hero h3{margin:5px 0 9px;font-size:34px;line-height:1.04;letter-spacing:-.045em}.fr2-hero p{margin:0;max-width:720px;color:rgba(255,255,255,.75);line-height:1.6}.fr2-level{width:124px;height:124px;border-radius:50%;display:grid;place-items:center;align-content:center;justify-self:end;background:rgba(255,255,255,.09);border:1px solid rgba(255,255,255,.2);box-shadow:inset 0 0 0 8px rgba(255,255,255,.035)}.fr2-level small{font-size:9px;letter-spacing:.14em;color:rgba(255,255,255,.6)}.fr2-level strong{font-size:46px;line-height:.95}.fr2-level span{font-size:10px;color:rgba(255,255,255,.62)}
      .fr2-body{padding:28px 30px 30px}.fr2-metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.fr2-metric{padding:19px;border-radius:18px;background:#fff;border:1px solid rgba(39,48,40,.09)}.fr2-metric small{display:block;margin-bottom:9px;font-size:9px;font-weight:800;letter-spacing:.1em;color:#80867f;text-transform:uppercase}.fr2-metric strong{display:block;font-size:25px;letter-spacing:-.03em;color:#2d382f}.fr2-metric span{display:block;margin-top:7px;font-size:11px;line-height:1.45;color:#727a73}.fr2-metric.is-favorable{border-color:rgba(79,107,77,.22);background:#fbfcf9}.fr2-metric.is-favorable strong{color:#506950}
      .fr2-reading{display:grid;grid-template-columns:1.25fr .75fr;gap:14px;margin-top:14px}.fr2-panel{padding:20px;border-radius:18px;background:#eee9df}.fr2-panel h4{margin:0 0 8px;font-size:16px}.fr2-panel p{margin:0;color:#677068;font-size:12px;line-height:1.58}.fr2-panel b{color:#39483b}.fr2-next{background:#fff}.fr2-next button{margin-top:13px;border:0;border-radius:999px;padding:11px 15px;background:#263228;color:#fff;font:inherit;font-size:11px;font-weight:700;cursor:pointer}.fr2-note{margin:14px 2px 0;color:#7b817b;font-size:10px;line-height:1.55}.fr2-note strong{color:#555f56}
      @media(max-width:820px){.fr2-hero{grid-template-columns:1fr;padding:26px}.fr2-level{justify-self:start;width:100px;height:100px}.fr2-level strong{font-size:38px}.fr2-body{padding:20px}.fr2-metrics,.fr2-reading{grid-template-columns:1fr}.fr2-hero h3{font-size:28px}}
    `;
    document.head.appendChild(style);
  }

  function card(root,key){return root.querySelector(`[data-open-test="${key}"]`)?.closest('.test-v1-card')||null}
  function complete(root){return KEYS.every(key=>card(root,key)?.classList.contains('is-done'))}
  function valueText(root,key){return card(root,key)?.querySelector('.test-v1-value')?.textContent?.trim()||''}
  function num(value){const n=Number(String(value||'').replace(',','.'));return Number.isFinite(n)?n:null}

  function readValues(root){
    const q=valueText(root,'baseline');
    const c=valueText(root,'chair_stand');
    const t=valueText(root,'two_step');
    const qm=q.match(/(\d+(?:[.,]\d+)?)\s*\/\s*100/);
    const cm=c.match(/(\d+(?:[.,]\d+)?)/);
    const tm=t.match(/(?:ratio\s*)?(\d+(?:[.,]\d+)?)/i);
    return{questionnaire:num(qm?.[1]),chair:num(cm?.[1]),twoStep:num(tm?.[1])};
  }

  function questionnaireLevel(score){
    if(score==null)return null;
    const difficulty=100-score;
    if(difficulty<7)return 0;
    if(difficulty<16)return 1;
    if(difficulty<24)return 2;
    return 3;
  }
  function twoStepLevel(ratio){
    if(ratio==null)return null;
    if(ratio>=1.3)return 0;
    if(ratio>=1.1)return 1;
    if(ratio>=0.9)return 2;
    return 3;
  }
  function levelCopy(level){
    return [
      ['Mobilité préservée.','Les données de dépistage sont favorables. Aucun signal de diminution de mobilité n’est détecté sur les composantes interprétables de Pulse Free.'],
      ['Mobilité à surveiller.','Un premier signal de diminution de mobilité apparaît. La prévention et le suivi deviennent particulièrement utiles.'],
      ['Diminution fonctionnelle probable.','Plusieurs éléments suggèrent une diminution de mobilité qui mérite une évaluation professionnelle plus complète.'],
      ['Diminution fonctionnelle marquée.','Le profil de dépistage justifie une évaluation professionnelle afin de préciser les causes et la stratégie de prise en charge.']
    ][level]||['Résultat disponible.','Votre profil Pulse Free est prêt.'];
  }
  function qCopy(score,level){
    if(score==null)return 'Questionnaire enregistré';
    const difficulty=Math.round(100-score);
    return level===0?`${difficulty} point de difficulté · profil favorable`:`${difficulty} points de difficulté · niveau indicatif ${level}`;
  }
  function tCopy(ratio,level){
    if(ratio==null)return 'Mesure enregistrée';
    if(level===0)return `Au-dessus du seuil de repérage JOA de 1,30`;
    return `Correspond à la bande de repérage ${level} du Two-Step`;
  }

  function render(){
    if(location.hash.replace(/^#/,'')!==ROUTE)return;
    const root=document.querySelector('.tests-v1-root');
    if(!root||!complete(root))return;
    addStyles();
    const v=readValues(root);
    const qLevel=questionnaireLevel(v.questionnaire);
    const tLevel=twoStepLevel(v.twoStep);
    const levels=[qLevel,tLevel].filter(Number.isFinite);
    const level=levels.length?Math.max(...levels):0;
    const [title,copy]=levelCopy(level);

    let section=root.querySelector('[data-pulse-free-result]');
    if(!section){section=document.createElement('section');section.dataset.pulseFreeResult='1';root.querySelector('.tests-v1-grid')?.insertAdjacentElement('afterend',section)}
    if(!section)return;
    section.className='pulse-free-result pulse-free-result-v2';
    section.innerHTML=`
      <div class="fr2-hero">
        <div><p class="eyebrow">PULSE FREE · VOTRE RÉSULTAT</p><h3>${title}</h3><p>${copy}</p></div>
        <div class="fr2-level"><small>NIVEAU KŌMØ FREE</small><strong>${level}</strong><span>sur 3</span></div>
      </div>
      <div class="fr2-body">
        <div class="fr2-metrics">
          <article class="fr2-metric ${qLevel===0?'is-favorable':''}"><small>Questionnaire KŌMØ</small><strong>${v.questionnaire==null?'—':Math.round(v.questionnaire)+'/100'}</strong><span>${qCopy(v.questionnaire,qLevel)}</span></article>
          <article class="fr2-metric"><small>Chair Stand · 30 s</small><strong>${v.chair==null?'—':Math.round(v.chair)+' rép.'}</strong><span>Force-endurance fonctionnelle · mesure de référence personnelle</span></article>
          <article class="fr2-metric ${tLevel===0?'is-favorable':''}"><small>Two-Step</small><strong>${v.twoStep==null?'—':v.twoStep.toFixed(2)}</strong><span>${tCopy(v.twoStep,tLevel)}</span></article>
        </div>
        <div class="fr2-reading">
          <article class="fr2-panel"><h4>Comment lire ce résultat ?</h4><p>Le <b>Niveau KŌMØ Free</b> reprend une lecture en quatre niveaux, proche de l’expérience LOCOMO. Le Two-Step utilise les seuils publiés par la Japanese Orthopaedic Association. Le questionnaire KŌMØ est converti en charge de difficulté sur 100 pour le repérage. Le Chair Stand 30 s complète le profil mais n’est pas assimilé au Stand-Up Test japonais.</p></article>
          <article class="fr2-panel fr2-next"><h4>La suite : KŌMØ Motion</h4><p>Pour transformer ce dépistage en évaluation instrumentée : questionnaire approfondi, acquisition Myodev et analyse du mouvement.</p><button type="button" data-find-motion-v2>Trouver un professionnel →</button></article>
        </div>
        <p class="fr2-note"><strong>Important :</strong> le Niveau KŌMØ Free est un repère de dépistage, pas un LS stage LOCOMO officiel ni un diagnostic. Un stade LOCOMO officiel nécessite le GLFS-25 et le Stand-Up Test standardisé en plus du Two-Step.</p>
      </div>`;
    section.querySelector('[data-find-motion-v2]')?.addEventListener('click',()=>{location.hash='documents'});

    const heroAction=root.querySelector('.tests-v1-hero-actions button[data-open-test]');
    if(heroAction){heroAction.removeAttribute('data-open-test');heroAction.innerHTML='Voir mon résultat <span>↓</span>';heroAction.onclick=()=>section.scrollIntoView({behavior:'smooth',block:'start'});}
  }

  function schedule(){setTimeout(render,40);setTimeout(render,240)}
  window.addEventListener('hashchange',schedule);
  window.addEventListener('komo:route-ready',schedule);
  document.addEventListener('DOMContentLoaded',()=>setTimeout(render,900));
  const root=document.querySelector('#viewRoot');
  if(root)new MutationObserver(()=>{if(location.hash.replace(/^#/,'')===ROUTE)schedule()}).observe(root,{childList:true,subtree:true});
  setTimeout(()=>{
    const r=document.querySelector('#viewRoot');
    if(r&&!r.dataset.freeResultObserver){r.dataset.freeResultObserver='1';new MutationObserver(()=>{if(location.hash.replace(/^#/,'')===ROUTE)schedule()}).observe(r,{childList:true,subtree:true});}
    render();
  },1200);
})();