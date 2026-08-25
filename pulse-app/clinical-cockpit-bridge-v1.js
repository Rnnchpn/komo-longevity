(() => {
  function syncPatient(id){
    const select=document.querySelector('#clmPatient');
    if(!select||!id||select.value===id)return;
    select.value=id;
    select.dispatchEvent(new Event('change',{bubbles:true}));
  }
  function syncAssessment(id){
    const select=document.querySelector('#clmAssessment');
    if(!select||!id||select.value===id)return;
    select.value=id;
    select.dispatchEvent(new Event('change',{bubbles:true}));
  }
  window.addEventListener('komo:clinical-patient-changed',e=>setTimeout(()=>syncPatient(e.detail?.patientId),20));
  window.addEventListener('komo:clinical-assessment-changed',e=>setTimeout(()=>syncAssessment(e.detail?.assessmentId),20));
})();
