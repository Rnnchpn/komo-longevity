import './report-delivery-v2.js?v=20260830-report-live-v3';

window.KomoDossierPdfExport={
  version:'4.0.0',
  mode:'canonical-live-editorial-report',
  preview:()=>window.KomoReportDelivery?.preview?.(),
  finalize:()=>window.KomoReportDelivery?.finalize?.()
};