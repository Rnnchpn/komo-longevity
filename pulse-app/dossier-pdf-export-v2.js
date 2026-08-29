import './report-delivery-v1.js';

window.KomoDossierPdfExport={
  version:'3.0.0',
  mode:'canonical-luxury-report',
  preview:()=>window.KomoReportDelivery?.preview?.(),
  finalize:()=>window.KomoReportDelivery?.finalize?.()
};
