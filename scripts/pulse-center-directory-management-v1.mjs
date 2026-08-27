import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const pulse=join(process.cwd(),'site','pulse-v12');
const htmlPath=join(pulse,'index.html'),bookingPath=join(pulse,'booking-layer-v1.js'),bundlePath=join(pulse,'pulse-ui-v1.css'),profileCssPath=join(pulse,'center-profile-v1.css'),profileJsPath=join(pulse,'center-profile-v1.js');
const release='20260827-center-directory-1';
let [html,booking,bundle,profileCss,profileJs]=await Promise.all([readFile(htmlPath,'utf8'),readFile(bookingPath,'utf8'),readFile(bundlePath,'utf8'),readFile(profileCssPath,'utf8'),readFile(profileJsPath,'utf8')]);
if(!profileJs.includes('update_komo_center_directory_profile'))throw new Error('[center-directory] center profile module invalid');
if(!html.includes('center-profile-v1.js'))html=html.replace(/(<script type="module" src="\.\/center-hub-v1\.js[^>]*><\/script>)/,'$1\n  <script type="module" src="./center-profile-v1.js"></script>');
html=html.replace(/\.\/center-profile-v1\.js(?:\?v=[^"']+)?/g,`./center-profile-v1.js?v=${release}`);
html=html.replace(/\.\/booking-layer-v1\.js(?:\?v=[^"']+)?/g,`./booking-layer-v1.js?v=${release}`);
html=html.replace(/\.\/booking-directory-map-v1\.js(?:\?v=[^"']+)?/g,`./booking-directory-map-v1.js?v=${release}`);
html=html.replace(/\.\/pulse-ui-v1\.css(?:\?v=[^"']+)?/g,`./pulse-ui-v1.css?v=${release}`);
if(!bundle.includes('/* Center directory management */'))bundle+=`\n/* Center directory management */\n${profileCss}\n`;
if(!booking.includes('bookingRealtimeChannel')){
  booking=booking.replace(/(const S=\{[^\n]+\};)/,`$1\nlet bookingRealtimeChannel=null,bookingRealtimeTimer=null;`);
  const hook=`\nasync function ensureBookingRealtime(){if(bookingRealtimeChannel)return;const {data:{session}}=await sb().auth.getSession();if(!session?.user)return;bookingRealtimeChannel=sb().channel('komo-appointments-live-'+session.user.id).on('postgres_changes',{event:'*',schema:'public',table:'organization_appointments'},()=>{clearTimeout(bookingRealtimeTimer);bookingRealtimeTimer=setTimeout(()=>{const route=location.hash.replace(/^#/,'');if(route==='documents'&&!S.patientLoading)loadPatient().catch(console.error);if(S.proActive&&!S.proLoading)loadProWeek().catch(console.error)},220)}).subscribe()}\nwindow.addEventListener('komo:session-ready',()=>ensureBookingRealtime().catch(console.error));document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>ensureBookingRealtime().catch(console.error),1200));setTimeout(()=>ensureBookingRealtime().catch(console.error),1800);\n`;
  booking+=hook;
}
await Promise.all([writeFile(htmlPath,html),writeFile(bookingPath,booking),writeFile(bundlePath,bundle)]);
console.log('[pulse-center-directory] monochrome map + center-managed profile + live RDV/Agenda sync wired');
