import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';

const pulse=join(process.cwd(),'site','pulse-v12');
const targets=['tests-score-trilogy-v1.js','patient-score-details-v1.js','motion-v05-workflow-v1.js','score-report-pdf-v1.js'];
const files={};
for(const f of targets)files[f]=await readFile(join(pulse,f),'utf8');

// Correct a typography typo introduced by the score polish layer.
for(const f of targets)files[f]=files[f].replaceAll('KŌMŌ','KŌMØ');

let motion=files['motion-v05-workflow-v1.js'];
const replacement=`async function createV05(e){
  const b=e.target.closest?.('[data-action="new-assessment"]');if(!b||location.hash!=='#clinical')return;
  e.preventDefault();e.stopImmediatePropagation();
  const patient=document.querySelector('#clmPatient')?.value;if(!patient)return toast('Sélectionnez un patient.');
  const kit=document.querySelector('#clmDeviceKit')?.value||null;
  const r=await sb().rpc('create_pulse_assessment',{
    target_patient_id:patient,
    target_product_mode:'motion',
    target_assessment_type:'baseline',
    target_scheduled_at:null,
    target_device_kit_id:kit
  });
  if(r.error){
    const msg=String(r.error.message||'');
    if(msg.includes('device_kit_required_for_health_data'))return toast('Une KŌMØ Case active doit être associée avant de créer un bilan réel.');
    return toast(msg||'Impossible de créer le bilan Motion.');
  }
  const id=r.data;if(!id)return toast('Bilan Motion non créé.');
  localStorage.setItem('komo_clinical_assessment',id);
  toast('Bilan Motion v0.5 créé · 6 sections de pré-bilan initialisées.');
  setTimeout(()=>window.dispatchEvent(new Event('hashchange')),80)
}`;
const re=/async function createV05\(e\)\{[\s\S]*?\}\ndocument\.addEventListener\('click',createV05,true\);/;
if(!re.test(motion))throw new Error('[pulse-score-flow-finalize] createV05 contract changed');
motion=motion.replace(re,`${replacement}\ndocument.addEventListener('click',createV05,true);`);
files['motion-v05-workflow-v1.js']=motion;

// Fix report copy while preserving medical boundary.
files['score-report-pdf-v1.js']=files['score-report-pdf-v1.js']
  .replaceAll('les données Myodev doivent être complétés puis validés.','les données Myodev doivent être complétées puis validées.')
  .replaceAll('KŌMØ Start est un repère de dépistage non diagnostique.','KŌMØ Start est un repère de dépistage non diagnostique ; sa classification repose sur le questionnaire et le Two-Step, tandis que le Chair Stand reste une mesure de référence personnelle.');

for(const [f,c] of Object.entries(files))await writeFile(join(pulse,f),c);

const checks=[
  ['no KOMO typography typo in score surfaces',targets.every(f=>!files[f].includes('KŌMŌ'))],
  ['manual Pro Motion creation uses canonical RPC',motion.includes("sb().rpc('create_pulse_assessment'")&&motion.includes("target_product_mode:'motion'")],
  ['manual Pro Motion no longer directly inserts assessment',!motion.includes("from('assessments').insert({patient_id:patient")],
  ['manual Pro Motion respects Case requirement',motion.includes('device_kit_required_for_health_data')],
  ['manual Pro Motion confirms six-section initialization',motion.includes('6 sections de pré-bilan initialisées')],
  ['report explains Start inputs accurately',files['score-report-pdf-v1.js'].includes('sa classification repose sur le questionnaire et le Two-Step')]
];
let failed=0;for(const [label,ok] of checks){console.log(`[pulse-score-flow-finalize] ${ok?'OK':'FAIL'} · ${label}`);if(!ok)failed++}
if(failed)process.exit(1);
console.log(`[pulse-score-flow-finalize] ${checks.length} checks passed.`);
