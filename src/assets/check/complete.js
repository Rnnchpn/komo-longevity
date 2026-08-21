(() => {
  const locale = location.pathname.startsWith('/fr/') ? 'fr' : 'en';
  const fr = locale === 'fr';
  const T = fr ? {
    hero:'Mesurez votre fonction locomotrice.<br><em>Trois tests. Un résultat.</em>',
    lead:'Réalisez les trois éléments du test japonais du syndrome locomoteur : GLFS-25, test de lever et test des deux pas. KŌMØ Check détermine ensuite le stade LS global selon la règle officielle : le stade le plus avancé atteint par l’un des trois tests.',
    pills:['3 tests fonctionnels','GLFS-25','Test de lever','Deux pas'],
    start:'Commencer le Check complet',
    aboutTitle:'Trois tests. Un stade LS global.',
    aboutBody:'Chaque test est interprété séparément. Le résultat global correspond au stade LS le plus avancé atteint par le GLFS-25, le test de lever ou le test des deux pas.',
    rows:[['01','GLFS-25 · symptômes & vie quotidienne'],['02','Test de lever · force des membres inférieurs'],['03','Deux pas · longueur fonctionnelle du pas']],
    step1:'Étape 1 — GLFS-25',
    instruction:'Répondez aux 25 questions en pensant au mois écoulé. Le score GLFS-25 s’actualise automatiquement, puis poursuivez avec les deux tests physiques.',
    overall:'Résultat global',
    standTitle:'Étape 2 — Test de lever',
    standLead:'Choisissez le résultat correspondant à votre meilleure performance. Le test officiel utilise des sièges de 40, 30, 20 et 10 cm.',
    standPrompt:'Votre résultat',
    standOptions:[
      ['','— Choisir un résultat —'],
      ['0','Je peux me lever sur une jambe depuis 40 cm, à droite et à gauche.'],
      ['1','Je ne peux pas me lever sur une jambe depuis 40 cm d’un côté ou de l’autre, mais je peux me lever à deux jambes depuis 20 cm.'],
      ['2','Je ne peux pas me lever à deux jambes depuis 20 cm, mais je peux depuis 30 cm.'],
      ['3','Je ne peux pas me lever à deux jambes depuis 30 cm.']
    ],
    standSafety:'Bras croisés, sans élan, maintien 3 secondes. Arrêtez immédiatement en cas de douleur. Ne réalisez pas ce test seul si vous êtes instable ou à risque de chute.',
    twoTitle:'Étape 3 — Test des deux pas',
    twoLead:'Après un échauffement, effectuez deux grands pas contrôlés sans sauter. Faites deux essais et conservez la meilleure distance.',
    height:'Votre taille (cm)', distance:'Meilleure distance sur deux pas (cm)',
    heightHelp:'Exemple : 172 cm', distanceHelp:'Mesurez de la ligne de départ jusqu’à la pointe des pieds à l’arrivée.',
    formula:'Valeur deux pas = distance ÷ taille',
    twoSafety:'Surface antidérapante, idéalement avec une personne à proximité. Si vous perdez l’équilibre, l’essai est invalide. Ne sautez pas.',
    gate:'Complétez les 25 questions GLFS-25, puis renseignez le test de lever et le test des deux pas pour obtenir le résultat global.',
    overallKicker:'RÉSULTAT GLOBAL KŌMØ CHECK', overallLabel:'stade locomoteur',
    names:['Sous le seuil LS Stage 1','LS Stage 1','LS Stage 2','LS Stage 3'],
    bodies:[
      'Aucun des trois tests ne franchit un seuil de syndrome locomoteur.',
      'Votre mobilité commence à diminuer selon au moins un des trois tests.',
      'La diminution de votre mobilité progresse selon au moins un des trois tests.',
      'La diminution de votre mobilité a atteint le niveau le plus avancé du référentiel selon au moins un des trois tests.'
    ],
    next:[
      'Conservez une activité physique régulière et réévaluez périodiquement votre fonction.',
      'Considérez ce résultat comme un signal pour agir tôt et discuter, si nécessaire, d’une stratégie de prévention avec un professionnel de santé.',
      'Une évaluation locomotrice professionnelle est recommandée afin de comprendre les facteurs contributifs et de définir un plan adapté.',
      'Une évaluation clinique est recommandée, notamment si les activités quotidiennes, la marche ou la participation sociale sont limitées.'
    ],
    glfs:'GLFS-25', stand:'Test de lever', two:'Deux pas',
    rule:'Règle officielle : le résultat global correspond au stade LS le plus avancé atteint par l’un des trois tests. Les scores des trois tests ne sont pas additionnés entre eux.',
    reset:'Recommencer', cta:'Découvrir KŌMØ Clinical',
    source:'GLFS-25 reproduit avec autorisation. Seuils et règle de classification globale : Japanese Orthopaedic Association, LOCOMO ONLINE.'
  } : {
    hero:'Measure your locomotor function.<br><em>Three tests. One result.</em>',
    lead:'Complete the three elements of the Japanese locomotive syndrome risk test: GLFS-25, Stand-Up Test and Two-Step Test. KŌMØ Check then returns the overall LS stage using the official rule: the most advanced stage reached by any one test.',
    pills:['3 functional tests','GLFS-25','Stand-Up','Two-Step'],
    start:'Start the complete Check',
    aboutTitle:'Three tests. One overall LS stage.',
    aboutBody:'Each test is interpreted separately. The overall result is the most advanced LS stage reached by the GLFS-25, Stand-Up Test or Two-Step Test.',
    rows:[['01','GLFS-25 · symptoms & daily life'],['02','Stand-Up · lower-limb strength'],['03','Two-Step · functional stride length']],
    step1:'Step 1 — GLFS-25',
    instruction:'Answer all 25 questions based on the past month. Your GLFS-25 score updates automatically, then continue with the two physical tests.',
    overall:'Overall result',
    standTitle:'Step 2 — Stand-Up Test',
    standLead:'Choose the result matching your best performance. The official test uses 40, 30, 20 and 10 cm seats.',
    standPrompt:'Your result',
    standOptions:[
      ['','— Select a result —'],
      ['0','I can stand from 40 cm on one leg, on both the right and the left.'],
      ['1','I cannot stand from 40 cm on one leg on one or both sides, but I can stand from 20 cm using both legs.'],
      ['2','I cannot stand from 20 cm using both legs, but I can stand from 30 cm.'],
      ['3','I cannot stand from 30 cm using both legs.']
    ],
    standSafety:'Arms folded, no momentum, hold for 3 seconds. Stop immediately if pain occurs. Do not perform the test alone if you feel unstable or at risk of falling.',
    twoTitle:'Step 3 — Two-Step Test',
    twoLead:'After warming up, take two large controlled steps without jumping. Perform two attempts and keep the better distance.',
    height:'Your height (cm)', distance:'Best two-step distance (cm)',
    heightHelp:'Example: 172 cm', distanceHelp:'Measure from the starting line to the tips of your toes at the finish.',
    formula:'Two-step value = distance ÷ height',
    twoSafety:'Use a non-slip surface and ideally have another person nearby. If you lose balance, the attempt is invalid. Do not jump.',
    gate:'Complete all 25 GLFS-25 questions, then enter your Stand-Up Test and Two-Step Test results to receive the overall result.',
    overallKicker:'OVERALL KŌMØ CHECK RESULT', overallLabel:'locomotor stage',
    names:['Below LS Stage 1 threshold','LS Stage 1','LS Stage 2','LS Stage 3'],
    bodies:[
      'None of the three tests reaches a locomotive syndrome threshold.',
      'Your mobility is starting to decline according to at least one of the three tests.',
      'The decline in your mobility is progressing according to at least one of the three tests.',
      'At least one of the three tests reaches the most advanced level of the current framework.'
    ],
    next:[
      'Maintain regular physical activity and reassess periodically.',
      'Treat this result as a prompt to act early and consider discussing prevention with a health professional.',
      'A professional locomotor assessment is recommended to understand contributing factors and define an appropriate plan.',
      'Clinical assessment is recommended, particularly if daily activities, walking or social participation are limited.'
    ],
    glfs:'GLFS-25', stand:'Stand-Up', two:'Two-Step',
    rule:'Official rule: the overall result is the most advanced LS stage reached by any of the three tests. The three scores are not added together.',
    reset:'Restart', cta:'Explore KŌMØ Clinical',
    source:'GLFS-25 reproduced with permission. Thresholds and overall classification rule: Japanese Orthopaedic Association, LOCOMO ONLINE.'
  };

  const style=document.createElement('style');
  style.textContent=`
    .test-blocks{display:grid;gap:18px;margin-top:28px}.test-block{background:#fff;border:1px solid var(--line);border-radius:26px;padding:28px;box-shadow:0 10px 35px rgba(25,25,20,.035)}
    .test-block-head{display:grid;grid-template-columns:52px 1fr;gap:16px;align-items:start;margin-bottom:22px}.test-index{width:42px;height:42px;border-radius:999px;background:var(--sage2);display:grid;place-items:center;font-weight:750;font-size:12px;color:#435244}
    .test-block h3{font-family:Georgia,serif;font-size:32px;font-weight:400;letter-spacing:-.035em;margin:0 0 8px}.test-block p{color:var(--muted);line-height:1.65;margin:0}
    .test-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:20px}.test-field{display:grid;gap:8px}.test-field>span{font-size:12px;font-weight:700;letter-spacing:.05em}.test-field input,.test-field select{width:100%;background:#faf9f6;border:1px solid rgba(17,18,15,.16);border-radius:14px;padding:14px 15px;color:var(--ink);outline:none}
    .test-help{font-size:12px!important;color:var(--muted)!important}.test-live{margin-top:18px;padding:16px 18px;border-radius:16px;background:#f1efe9;display:flex;justify-content:space-between;gap:16px;align-items:center}.test-live span{font-size:12px;color:var(--muted)}.test-live strong{font-size:18px}
    .safety-line{margin-top:18px;padding:14px 16px;border-left:3px solid #8d9f8d;background:#f1efe9;border-radius:0 14px 14px 0;font-size:12px;color:#5f625d;line-height:1.55}.final-gate{margin-top:24px;padding:20px 22px;border:1px dashed rgba(17,18,15,.2);border-radius:18px;color:var(--muted);font-size:13px;line-height:1.6}
    .result-components{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:26px}.result-component{background:#f4f2ec;border-radius:18px;padding:18px}.result-component span{display:block;font-size:10px;text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin-bottom:10px}.result-component strong{display:block;font-size:24px;letter-spacing:-.04em;margin-bottom:4px}.result-component small{color:var(--muted);font-size:11px;line-height:1.4}
    .overall-rule{margin-top:20px;padding:16px 18px;background:var(--sage2);border-radius:16px;color:#435244;font-size:12px;line-height:1.6}.result-score.overall{font-size:46px;min-width:160px}.result-score.overall small{font-size:11px;text-transform:uppercase;letter-spacing:.12em}.dashboard .overallcell{min-width:120px;text-align:right}
    @media(max-width:840px){.test-grid,.result-components{grid-template-columns:1fr}.dashboard .overallcell{display:none}}
  `;
  document.head.appendChild(style);

  document.title=fr?'KŌMØ Check — Bilan locomoteur complet':'KŌMØ Check — Complete Locomotor Function Check';
  const desc=document.querySelector('meta[name="description"]'); if(desc) desc.content=T.lead;
  const hero=document.querySelector('[data-html="hero"]'); if(hero) hero.innerHTML=T.hero;
  const lead=document.querySelector('[data-t="lead"]'); if(lead) lead.textContent=T.lead;
  ['pill1','pill2','pill3','pill4'].forEach((k,i)=>{const el=document.querySelector(`[data-t="${k}"]`); if(el) el.textContent=T.pills[i]});
  const start=document.querySelector('[data-t="start"]'); if(start) start.textContent=T.start;
  const period=document.querySelector('[data-t="period"]'); if(period) period.textContent=T.step1;
  const instruction=document.querySelector('[data-t="instruction"]'); if(instruction) instruction.textContent=T.instruction;

  const ref=document.querySelector('.refcard');
  if(ref) ref.innerHTML=`<p class="eyebrow">KŌMØ CHECK · 3 TESTS</p><h2>${T.aboutTitle}</h2><p>${T.aboutBody}</p>${T.rows.map(([n,l])=>`<div class="refrow"><strong>${n}</strong><span>${l}</span></div>`).join('')}`;

  const dash=document.querySelector('.dashboard');
  if(dash){
    const cell=document.createElement('div'); cell.className='overallcell'; cell.innerHTML=`<div class="dashlabel">${T.overall}</div><div class="dashvalue" data-overall-live>—</div>`; dash.appendChild(cell);
  }

  const form=document.querySelector('[data-form]');
  if(!form) return;
  const blocks=document.createElement('div'); blocks.className='test-blocks';
  blocks.innerHTML=`
    <section class="test-block"><div class="test-block-head"><span class="test-index">02</span><div><h3>${T.standTitle}</h3><p>${T.standLead}</p></div></div>
      <label class="test-field"><span>${T.standPrompt}</span><select data-stand>${T.standOptions.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label>
      <div class="test-live"><span>${T.overall}</span><strong data-stand-live>—</strong></div><div class="safety-line">${T.standSafety}</div></section>
    <section class="test-block"><div class="test-block-head"><span class="test-index">03</span><div><h3>${T.twoTitle}</h3><p>${T.twoLead}</p></div></div>
      <div class="test-grid"><label class="test-field"><span>${T.height}</span><input data-height type="number" inputmode="decimal" min="120" max="230" step="0.1" placeholder="172"><small class="test-help">${T.heightHelp}</small></label><label class="test-field"><span>${T.distance}</span><input data-distance type="number" inputmode="decimal" min="40" max="500" step="0.1" placeholder="224"><small class="test-help">${T.distanceHelp}</small></label></div>
      <div class="test-live"><span>${T.formula}</span><strong data-two-live>—</strong></div><div class="safety-line">${T.twoSafety}</div></section>`;
  form.insertAdjacentElement('afterend',blocks);
  const gate=document.createElement('div'); gate.className='final-gate'; gate.textContent=T.gate; blocks.insertAdjacentElement('afterend',gate);

  const result=document.querySelector('[data-result]');
  result.innerHTML=`<div class="result-top"><div><div class="result-kicker">${T.overallKicker}</div><h2 data-result-title></h2><p data-result-body></p><p><strong data-next></strong></p></div><div class="result-score overall"><span data-result-score>—</span><small>${T.overallLabel}</small></div></div>
    <div class="result-components"><article class="result-component"><span>${T.glfs}</span><strong data-comp-glfs>—</strong><small data-comp-glfs-stage>—</small></article><article class="result-component"><span>${T.stand}</span><strong data-comp-stand>—</strong><small data-comp-stand-stage>—</small></article><article class="result-component"><span>${T.two}</span><strong data-comp-two>—</strong><small data-comp-two-stage>—</small></article></div>
    <div class="stagebar"><div data-stage="0">${T.names[0]}</div><div data-stage="1">LS Stage 1</div><div data-stage="2">LS Stage 2</div><div data-stage="3">LS Stage 3</div></div><div class="overall-rule">${T.rule}</div><div class="result-actions"><a class="button" data-clinical href="${fr?'/fr/clinical/':'/clinical/'}">${T.cta}</a><button type="button" class="button ghost" data-reset>${T.reset}</button></div>`;
  const source=document.querySelector('.source'); if(source) source.textContent=T.source;

  const glfsSelects=[...form.querySelectorAll('select')];
  const stand=document.querySelector('[data-stand]'), height=document.querySelector('[data-height]'), distance=document.querySelector('[data-distance]');
  const scoreEl=document.querySelector('[data-score]'), countEl=document.querySelector('[data-progress-count]'), bar=document.querySelector('[data-progress-bar]');
  const overallLive=document.querySelector('[data-overall-live]'), standLive=document.querySelector('[data-stand-live]'), twoLive=document.querySelector('[data-two-live]');
  const glfsStage=s=>s>=24?3:s>=16?2:s>=7?1:0;
  const twoValue=()=>{const h=Number(height.value),d=Number(distance.value); return h>=120&&h<=230&&d>=40&&d<=500?d/h:null};
  const twoStage=v=>v>=1.3?0:v>=1.1?1:v>=0.9?2:3;
  const fmt=v=>new Intl.NumberFormat(fr?'fr-FR':'en-GB',{minimumFractionDigits:2,maximumFractionDigits:2}).format(v);

  function render(){
    const answered=glfsSelects.filter(s=>s.value!=='');
    const glfs=answered.reduce((a,s)=>a+Number(s.value),0);
    scoreEl.textContent=glfs; countEl.textContent=answered.length; bar.style.width=(answered.length/25*100)+'%';
    const ss=stand.value===''?null:Number(stand.value), tv=twoValue(), ts=tv===null?null:twoStage(tv);
    standLive.textContent=ss===null?'—':T.names[ss]; twoLive.textContent=tv===null?'—':`${fmt(tv)} · ${T.names[ts]}`;
    const complete=answered.length===25&&ss!==null&&ts!==null;
    gate.hidden=complete;
    if(!complete){overallLive.textContent='—'; result.classList.remove('show'); return}
    const gs=glfsStage(glfs), overall=Math.max(gs,ss,ts);
    overallLive.textContent=overall===0?'NO LS':`LS ${overall}`;
    result.querySelector('[data-result-title]').textContent=T.names[overall];
    result.querySelector('[data-result-body]').textContent=T.bodies[overall];
    result.querySelector('[data-next]').textContent=T.next[overall];
    result.querySelector('[data-result-score]').textContent=overall===0?'NO LS':`LS ${overall}`;
    result.querySelector('[data-comp-glfs]').textContent=`${glfs} / 100`; result.querySelector('[data-comp-glfs-stage]').textContent=T.names[gs];
    result.querySelector('[data-comp-stand]').textContent=T.names[ss]; result.querySelector('[data-comp-stand-stage]').textContent=T.standOptions[ss+1][1];
    result.querySelector('[data-comp-two]').textContent=fmt(tv); result.querySelector('[data-comp-two-stage]').textContent=T.names[ts];
    result.querySelectorAll('[data-stage]').forEach(el=>el.classList.toggle('active',Number(el.dataset.stage)===overall));
    result.classList.add('show');
  }

  glfsSelects.forEach(s=>s.addEventListener('change',e=>{e.stopImmediatePropagation();render()},{capture:true}));
  stand.addEventListener('change',render); height.addEventListener('input',render); distance.addEventListener('input',render);
  result.querySelector('[data-reset]').addEventListener('click',()=>{form.reset();stand.value='';height.value='';distance.value='';render();window.scrollTo({top:document.querySelector('#check').offsetTop-80,behavior:'smooth'})});
  render();
})();
