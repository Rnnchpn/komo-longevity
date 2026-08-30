import './report-delivery-v2.js?v=20260830-report-single-owner-v4';

window.KomoDossierPdfExport={
  version:'4.0.1',
  mode:'canonical-live-editorial-report',
  owner:'report-delivery-v2',
  preview:()=>window.KomoReportDelivery?.preview?.(),
  finalize:()=>window.KomoReportDelivery?.finalize?.()
};