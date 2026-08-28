(() => {
  'use strict';
  function patientId(){return new URLSearchParams(location.search).get('patient')||null}
  document.addEventListener('click',(event)=>{
    const button=event.target.closest?.('#pdfBtn');
    if(!button)return;
    if(!window.KomoCanonicalReport?.export)return;
    event.preventDefault();
    event.stopImmediatePropagation();
    window.KomoCanonicalReport.export({patientId:patientId(),button}).catch(()=>{});
  },true);
})();
