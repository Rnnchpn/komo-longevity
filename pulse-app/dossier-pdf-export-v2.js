import './report-delivery-v1.js?v=20260830-report-visual-v2';

window.KomoDossierPdfExport={
  version:'3.1.0',
  mode:'canonical-editorial-report',
  preview:()=>window.KomoReportDelivery?.preview?.(),
  finalize:()=>window.KomoReportDelivery?.finalize?.()
};