import {readFile} from 'node:fs/promises';import {spawnSync} from 'node:child_process';
const [tests,index,scope,timer,pro,proFn]=await Promise.all([
  readFile('pulse-app/tests-v1.js','utf8'),readFile('pulse-app/index.html','utf8'),readFile('pulse-app/patient-tests-scope-v2.js','utf8'),readFile('pulse-app/chair-timer-v1.js','utf8'),readFile('pulse-app/pro-followup-v1.js','utf8'),readFile('supabase/functions/professional-dashboard/index.ts','utf8')
]);
const syntax=['pulse-app/tests-v1.js','pulse-app/patient-tests-scope-v2.js','pulse-app/chair-timer-v1.js','pulse-app/pro-followup-v1.js'].map(f=>[f,spawnSync(process.execPath,['--check',f],{encoding:'utf8'})]);
const itemCount=(tests.match(/'Vous /g)||[]).length;
const checks=[
 ['Patient path has exactly three autonomous steps',tests.includes("const STEP_KEYS = ['baseline','chair_stand','two_step'];")],
 ['first-stage patient copy is explicit',tests.includes('Première étape de votre parcours KŌMØ')&&tests.includes('Commencez ici par votre KŌMØ Check')],
 ['KŌMØ questionnaire has 25 original items',tests.includes('KOMO_MOBILITY_ITEMS')&&itemCount>=25],
 ['questionnaire computes first 0-100 score',tests.includes('mobility_score_0_100')&&tests.includes('100-total')],
 ['questionnaire is persisted in baseline response',tests.includes('questionnaire: readKomoQuestionnaire(event.currentTarget)')],
 ['Chair Stand timer is loaded',index.includes('./chair-timer-v1.js')&&index.includes('./chair-timer-v1.css')],
 ['Chair Stand timer is thirty seconds and gates submit',timer.includes('const DURATION = 30')&&timer.includes("form.dataset.chairTimerState = 'complete'")&&timer.includes('Lancez et terminez d’abord le minuteur')],
 ['patient cards explain when and how',scope.includes('Quand')&&scope.includes('Comment')&&scope.includes('Commencer le KŌMØ Check')],
 ['patient scope has no body-wide mutation observer',!scope.includes('new MutationObserver')],
 ['Pro patient directory is searchable',pro.includes('kfollowSearch')&&pro.includes('filterRows')],
 ['Pro directory labels visibility scope',pro.includes('Tous les patients')&&pro.includes('Patients du centre')&&pro.includes('Mes patients')],
 ['professional dashboard preserves RLS patient boundary',proFn.includes("const pRes=await uc.from('patients')")&&proFn.includes("visibility=role==='admin'?'global':managedCenterIds.length?'center':'assigned'")],
 ['all patient/pro flow JavaScript parses',syntax.every(([,r])=>r.status===0)]
];
const failed=checks.filter(([,ok])=>!ok).map(([n])=>n);if(failed.length){for(const [f,r] of syntax)if(r.status!==0)console.error(`[${f}] ${r.stderr||r.stdout}`);console.error('[patient-pro-flow-qa-v1] failed: '+failed.join(', '));process.exit(1)}console.log(`[patient-pro-flow-qa-v1] ${checks.length} checks passed.`);
