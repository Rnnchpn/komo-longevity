import './report-delivery-v2.js?v=20260830-report-export-hardfix-v7';

window.KomoDossierPdfExport={
  version:'4.1.0',
  mode:'canonical-live-mobility-report-v2',
  owner:'report-delivery-v2',
  preview:()=>window.KomoReportDelivery?.preview?.(),
  finalize:()=>window.KomoReportDelivery?.finalize?.()
};