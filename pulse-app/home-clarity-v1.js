/* KŌMØ Pulse — retired Home compatibility shim
   Home V3 is the sole renderer. Kept as a no-op for older cached HTML. */
(()=>{
  'use strict';
  const VERSION='3.0.0-retired';
  document.documentElement.dataset.patientV1Bootstrap=VERSION;
})();
