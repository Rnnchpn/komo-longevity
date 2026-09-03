import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';

const [tests,index,scope,pro,proFn,clinical,workflow,manual,engine,age]=await Promise.all([
  readFile('pulse-app/tests-v1.js','utf8'),
  readFile('pulse-app/index.html','utf8'),
  readFile('pulse-app/patient-tests-scope-v2.js','utf8'),
  readFile('pulse-app/pro-followup-v1.js','utf8'),
  readFile('supabase/functions/professional-dashboard/index.ts','utf8'),
  readFile('pulse-app/clinical-motion-v1.js','utf8'),
  readFile('pulse-app/motion-workflow.js','utf8'),
  readFile('pulse-app/dossier-manual-input.js','utf8'),
  readFile('pulse-app/normative-engine-v1.js','utf8'),
  readFile('pulse-app/locomotor-age-v01.js','utf8')
]);

const syntax=['pulse-app/patient-tests-scope-v2.js','pulse-app/clinical-motion-v1.js','pulse-app/motion-workflow.js','pulse-app/dossier-manual-input.js','pulse-app/normative-engine-v1.js','pulse-app/locomotor-age-v01.js'].map(f=>[f,spawnSync(process.execPath,['--check',f],{encoding:'utf8'})]);
const block=(tests.match(/const KOMO_MOBILITY_ITEMS = \[([\s\S]*?)\];/)||[])[1]||'';
const itemCount=(block.match(/^\s*'.*',?$/gm)||[]).length;
const retired=['Two-Step','Chair Stand','Appui unipodal','Stand-Up'];

const checks=[
  ['KŌMØ questionnaire keeps 25 items',tests.includes('KOMO_MOBILITY_ITEMS')&&itemCount===25],
  ['patient preparation keeps GLFS/questionnaire as context only',scope.includes('GLFS‑25')&&scope.includes('ne modifient jamais le Motion Score')],
  ['patient preparation retires physical self-tests',scope.includes("RETIRED=new Set(['chair_stand','two_step','gait_4m','balance','stand_up','single_leg_stance'])")],
  ['patient handoff is pre-bilan then Myodev then Motion Score',scope.includes('Pré-bilan')&&scope.includes('Acquisition Myodev')&&scope.includes('Motion Score')],
  ['Clinical workspace exposes no legacy manual Motion fields',!retired.some(x=>clinical.includes(x))&&!clinical.includes('M-FUN-01')&&!clinical.includes('M-FUN-03')&&!clinical.includes('M-FUN-04')&&!clinical.includes('M-FUN-05')&&!clinical.includes('M-FUN-06')&&!clinical.includes('M-FUN-07')],
  ['Clinical workspace labels questionnaire contribution as zero',clinical.includes('Questionnaires')&&clinical.includes('0 % du score')],
  ['Motion workflow uses sensor v0.6 directly',workflow.includes("ALG='motion-sensor-index-v0.6.0'")&&workflow.includes("rpc('calculate_motion_v06'")],
  ['Motion workflow does not gate on questionnaire or SVA',!workflow.includes('Pré-bilan KŌMØ incomplet')&&!workflow.includes('SVA non enregistrée')],
  ['legacy manual Motion input surface is retired',manual.includes('retired-v2')&&!manual.includes('data-metric=')],
  ['interpretation engine is sensor-only',engine.includes("scorePolicy:'sensor_only'")&&!engine.includes('function glfs(')&&!engine.includes('function twoStep(')&&!engine.includes('function standUp(')&&!engine.includes('function chair(')],
  ['locomotor age legacy manual model is retired',age.includes('retired:true')&&!age.includes("measurement(dossier,'M-FUN-05')")],
  ['patient scope has no body-wide mutation observer',!scope.includes('new MutationObserver')],
  ['Pro patient directory remains searchable',pro.includes('kfollowSearch')&&pro.includes('filterRows')],
  ['professional dashboard preserves RLS patient boundary',proFn.includes("const pRes=await uc.from('patients')")],
  ['all revised patient/pro flow JavaScript parses',syntax.every(([,r])=>r.status===0)]
];

const failed=checks.filter(([,ok])=>!ok).map(([n])=>n);
if(failed.length){
  for(const [f,r] of syntax)if(r.status!==0)console.error(`[${f}] ${r.stderr||r.stdout}`);
  console.error('[patient-pro-flow-qa-v1] failed: '+failed.join(', ')+` (itemCount=${itemCount})`);
  process.exit(1);
}
console.log(`[patient-pro-flow-qa-v1] ${checks.length} sensor-only checks passed.`);
