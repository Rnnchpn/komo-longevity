const ORG_KEY='komo_clinical_org';
const PATIENT_KEY='komo_clinical_patient';
const ASSESSMENT_KEY='komo_clinical_assessment';

document.addEventListener('change',event=>{
  const select=event.target.closest?.('[data-kcp-org-select]');
  if(!select)return;
  const next=select.value;
  if(!next)return;
  localStorage.setItem(ORG_KEY,next);
  localStorage.removeItem(PATIENT_KEY);
  localStorage.removeItem(ASSESSMENT_KEY);
  location.reload();
});
