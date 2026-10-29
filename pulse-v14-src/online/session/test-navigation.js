// Motion Online test navigator. Stable IDs preserve existing test results by key.
// This UI never writes camera data and cannot issue a score.
export const TERMINAL_TEST_STATUSES=new Set(['done','review','skipped']);
const safe=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','&#39;'}[c]));
export function testStatus(result){
 if(result?.status==='done')return {label:'Terminé',code:'done'};
 if(result?.status==='review')return {label:'À vérifier',code:'review'};
 if(result?.status==='skipped')return {label:'Non réalisé',code:'skipped'};
 return {label:'À faire',code:'todo'};
}
export function completedTests(tests,results){
 return tests.filter(t=>TERMINAL_TEST_STATUSES.has(results?.[t.id]?.status)).length;
}
export function testNavigatorMarkup(tests,results,activeIndex=null){
 const done=completedTests(tests,results);
 return '<nav class="motion-test-navigator" aria-label="Navigation entre les tests">'+
 '<div class="motion-test-navigator-top"><strong>Mes tests</strong><span>'+done+' / '+tests.length+' enregistrés</span></div>'+
 '<div class="motion-test-navigator-scroll">'+tests.map((test,index)=>{
  const status=testStatus(results[test.id]),active=index===activeIndex;
  return '<button type="button" class="motion-test-nav-item '+(active?'is-active ':'')+'status-'+status.code+
   '" data-motion-test="'+index+'" '+(active?'aria-current="step"':'')+' aria-label="'+safe(test.name)+
   ' — '+status.label+'"><span class="motion-test-nav-num">'+(index+1)+'</span>'+
   '<span class="motion-test-nav-name">'+safe(test.name)+'</span><small>'+status.label+'</small></button>';
 }).join('')+'</div><p class="motion-test-nav-info" id="motion-test-nav-info" role="status"></p></nav>';
}
export function completedTestMarkup(test,record){
 const label=testStatus(record).label;
 const value=Number.isFinite(record?.value)&&record.status!=='skipped'
  ?String(record.value).replace('.',',')+' '+(test.id==='posture'?'%':test.unit):'Aucune mesure enregistrée';
 const qualifier=record?.source||'webcam';
 return '<section class="motion-review-existing" aria-label="Résultat de test enregistré">'+
 '<span class="overline">RÉSULTAT CONSERVÉ · '+safe(label.toUpperCase())+'</span>'+
 '<h2>'+safe(test.name)+'</h2><div class="motion-review-number">'+safe(value)+'</div>'+
 '<p>'+safe(qualifier)+(record?.status==='review'?' · À vérifier avant interprétation.':'')+'</p>'+
 '<p>Vous pouvez conserver ce résultat, revenir à un autre test ou le refaire. Seul « Refaire ce test » remplace le résultat conservé.</p>'+
 '<div class="motion-review-actions"><button type="button" class="action" id="redo-stored-test">Refaire ce test</button>'+
 '<button type="button" class="action secondary" id="keep-stored-test">Conserver et poursuivre</button><button type="button" class="motion-review-stop" id="stop-review-camera">Éteindre caméra et micro</button></div></section>';
}
export function mountTestNavigation(root,tests,results,onSelect,selectedIndex=null){
 const notice=root.querySelector('#motion-test-nav-info');
 for(const button of root.querySelectorAll('[data-motion-test]')){
  button.onclick=()=>{
   const i=Number(button.dataset.motionTest);
   if(!Number.isInteger(i)||i<0||i>=tests.length||i===selectedIndex)return;
   const decision=onSelect(i);
   if(decision===false&&notice)notice.textContent='Arrêtez le test en cours avant de changer d’épreuve.';
  };
 }
}
